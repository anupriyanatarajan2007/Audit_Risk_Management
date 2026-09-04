package com.example.audit_risk_management.serviceImpl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.audit_risk_management.enums.EvidenceStatus;
import com.example.audit_risk_management.model.Audit;
import com.example.audit_risk_management.model.Evidence;
import com.example.audit_risk_management.model.Finding;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.AuditRepository;
import com.example.audit_risk_management.repository.EvidenceRepository;
import com.example.audit_risk_management.repository.FindingRepository;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.service.EvidenceService;

@Service
@Transactional
public class EvidenceServiceImpl implements EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final AuditRepository auditRepository;
    private final FindingRepository findingRepository;
    private final UserRepo userRepository;

    private final Path uploadDirectory =
            Paths.get("uploads/evidence")
                    .toAbsolutePath()
                    .normalize();

    public EvidenceServiceImpl(
            EvidenceRepository evidenceRepository,
            AuditRepository auditRepository,
            FindingRepository findingRepository,
            UserRepo userRepository
    ) {
        this.evidenceRepository = evidenceRepository;
        this.auditRepository = auditRepository;
        this.findingRepository = findingRepository;
        this.userRepository = userRepository;

        try {
            Files.createDirectories(uploadDirectory);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Could not create evidence upload directory",
                    e
            );
        }
    }

    // ============================================================
    // UPLOAD EVIDENCE
    // ============================================================

    @Override
    public Evidence uploadEvidence(
            Long auditId,
            Long findingId,
            Long userId,
            MultipartFile file,
            String description
    ) {

        // --------------------------------------------------------
        // Validate file
        // --------------------------------------------------------

        if (file == null || file.isEmpty()) {
            throw new RuntimeException(
                    "Evidence file cannot be empty"
            );
        }

        // --------------------------------------------------------
        // Validate Audit
        // --------------------------------------------------------

        Audit audit = auditRepository.findById(auditId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Audit not found with ID: " + auditId
                        )
                );

        // --------------------------------------------------------
        // Validate User
        // --------------------------------------------------------

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with ID: " + userId
                        )
                );

        // --------------------------------------------------------
        // Validate original file name
        // --------------------------------------------------------

        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null ||
                originalFileName.trim().isEmpty()) {

            throw new RuntimeException(
                    "Invalid file name"
            );
        }

        originalFileName = Paths.get(originalFileName)
                .getFileName()
                .toString();

        // --------------------------------------------------------
        // Finding is optional
        // --------------------------------------------------------

        Finding finding = null;

        if (findingId != null) {

            finding = findingRepository.findById(findingId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Finding not found with ID: "
                                            + findingId
                            )
                    );

            // ----------------------------------------------------
            // Make sure Finding belongs to same Audit
            // ----------------------------------------------------

            if (finding.getAudit() == null ||
                    finding.getAudit().getId() == null ||
                    !finding.getAudit()
                            .getId()
                            .equals(auditId)) {

                throw new RuntimeException(
                        "Finding does not belong to the specified audit"
                );
            }

            // ----------------------------------------------------
            // Duplicate check for same Finding
            // ----------------------------------------------------

            if (evidenceRepository.existsByFinding_IdAndFileName(
                    findingId,
                    originalFileName
            )) {

                throw new RuntimeException(
                        "A file with the same name already exists "
                                + "for this finding"
                );
            }

        } else {

            // ----------------------------------------------------
            // Duplicate check for Audit-level evidence
            // ----------------------------------------------------

            if (evidenceRepository.existsByAudit_IdAndFileName(
                    auditId,
                    originalFileName
            )) {

                throw new RuntimeException(
                        "A file with the same name already exists "
                                + "for this audit"
                );
            }
        }

        // ========================================================
        // SAVE FILE
        // ========================================================

        try {

            // ----------------------------------------------------
            // Extract extension
            // ----------------------------------------------------

            String extension = "";

            int lastDot =
                    originalFileName.lastIndexOf(".");

            if (lastDot > 0) {
                extension =
                        originalFileName.substring(lastDot);
            }

            // ----------------------------------------------------
            // Generate unique physical file name
            // ----------------------------------------------------

            String uniqueFileName =
                    UUID.randomUUID() + extension;

            Path targetLocation =
                    uploadDirectory.resolve(uniqueFileName)
                            .normalize();

            // ----------------------------------------------------
            // Prevent path traversal
            // ----------------------------------------------------

            if (!targetLocation.startsWith(uploadDirectory)) {
                throw new RuntimeException(
                        "Invalid file path"
                );
            }

            // ----------------------------------------------------
            // Save physical file
            // ----------------------------------------------------

            Files.copy(
                    file.getInputStream(),
                    targetLocation,
                    StandardCopyOption.REPLACE_EXISTING
            );

            // ====================================================
            // CREATE EVIDENCE ENTITY
            // ====================================================

            Evidence evidence = new Evidence();

            evidence.setFileName(originalFileName);

            evidence.setFileUrl(
                    "/uploads/evidence/" + uniqueFileName
            );

            evidence.setDescription(description);

            evidence.setStatus(
                    EvidenceStatus.PENDING
            );

            // Audit is always assigned
            evidence.setAudit(audit);

            // Finding may be null
            evidence.setFinding(finding);

            // User who uploaded evidence
            evidence.setUploadedBy(user);

            return evidenceRepository.save(evidence);

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to upload evidence file",
                    e
            );
        }
    }

    // ============================================================
    // AUDIT LEVEL EVIDENCE
    // ============================================================

    @Override
    public Evidence uploadAuditEvidence(
            Long auditId,
            Long userId,
            MultipartFile file,
            String description
    ) {

        return uploadEvidence(
                auditId,
                null,
                userId,
                file,
                description
        );
    }

    // ============================================================
    // FINDING LEVEL EVIDENCE
    // ============================================================

    @Override
    public Evidence uploadFindingEvidence(
            Long auditId,
            Long findingId,
            Long userId,
            MultipartFile file,
            String description
    ) {

        return uploadEvidence(
                auditId,
                findingId,
                userId,
                file,
                description
        );
    }

    // ============================================================
    // GET EVIDENCE BY ID
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public Evidence getEvidenceById(Long evidenceId) {

        return evidenceRepository.findById(evidenceId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Evidence not found with ID: "
                                        + evidenceId
                        )
                );
    }

    // ============================================================
    // GET ALL EVIDENCE FOR AUDIT
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<Evidence> getEvidenceByAudit(Long auditId) {

        if (!auditRepository.existsById(auditId)) {

            throw new RuntimeException(
                    "Audit not found with ID: " + auditId
            );
        }

        return evidenceRepository.findByAudit_Id(auditId);
    }

    // ============================================================
    // GET EVIDENCE FOR FINDING
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<Evidence> getEvidenceByFinding(
            Long findingId
    ) {

        if (!findingRepository.existsById(findingId)) {

            throw new RuntimeException(
                    "Finding not found with ID: " + findingId
            );
        }

        return evidenceRepository.findByFinding_Id(
                findingId
        );
    }

    // ============================================================
    // GET EVIDENCE FOR FINDING + STATUS
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<Evidence> getEvidenceByFindingAndStatus(
            Long findingId,
            EvidenceStatus status
    ) {

        if (!findingRepository.existsById(findingId)) {

            throw new RuntimeException(
                    "Finding not found with ID: " + findingId
            );
        }

        return evidenceRepository
                .findByFinding_IdAndStatus(
                        findingId,
                        status
                );
    }

    // ============================================================
    // GET EVIDENCE FOR AUDIT + FINDING
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<Evidence> getEvidenceByAuditAndFinding(
            Long auditId,
            Long findingId
    ) {

        if (!auditRepository.existsById(auditId)) {

            throw new RuntimeException(
                    "Audit not found with ID: " + auditId
            );
        }

        if (!findingRepository.existsById(findingId)) {

            throw new RuntimeException(
                    "Finding not found with ID: " + findingId
            );
        }

        return evidenceRepository
                .findByAudit_IdAndFinding_Id(
                        auditId,
                        findingId
                );
    }

    // ============================================================
    // GET EVIDENCE UPLOADED BY USER
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<Evidence> getEvidenceByUser(
            Long userId
    ) {

        if (!userRepository.existsById(userId)) {

            throw new RuntimeException(
                    "User not found with ID: " + userId
            );
        }

        return evidenceRepository.findByUploadedBy_Id(
                userId
        );
    }

    // ============================================================
    // GET PENDING EVIDENCE
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<Evidence> getPendingEvidence() {

        return evidenceRepository.findByStatus(
                EvidenceStatus.PENDING
        );
    }

    // ============================================================
    // APPROVE EVIDENCE
    // ============================================================

    @Override
    public Evidence approveEvidence(
            Long evidenceId
    ) {

        Evidence evidence =
                evidenceRepository.findById(evidenceId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Evidence not found with ID: "
                                                + evidenceId
                                )
                        );

        if (evidence.getStatus() ==
                EvidenceStatus.APPROVED) {

            throw new RuntimeException(
                    "Evidence is already approved"
            );
        }

        evidence.setStatus(
                EvidenceStatus.APPROVED
        );

        return evidenceRepository.save(evidence);
    }

    // ============================================================
    // REJECT EVIDENCE
    // ============================================================

    @Override
    public Evidence rejectEvidence(
            Long evidenceId
    ) {

        Evidence evidence =
                evidenceRepository.findById(evidenceId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Evidence not found with ID: "
                                                + evidenceId
                                )
                        );

        if (evidence.getStatus() ==
                EvidenceStatus.REJECTED) {

            throw new RuntimeException(
                    "Evidence is already rejected"
            );
        }

        evidence.setStatus(
                EvidenceStatus.REJECTED
        );

        return evidenceRepository.save(evidence);
    }

    // ============================================================
    // DELETE EVIDENCE
    // ============================================================

    @Override
    public void deleteEvidence(
            Long evidenceId
    ) {

        Evidence evidence =
                evidenceRepository.findById(evidenceId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Evidence not found with ID: "
                                                + evidenceId
                                )
                        );

        // --------------------------------------------------------
        // Delete physical file
        // --------------------------------------------------------

        if (evidence.getFileUrl() != null) {

            try {

                String fileName =
                        Paths.get(
                                evidence.getFileUrl()
                        )
                        .getFileName()
                        .toString();

                Path filePath =
                        uploadDirectory.resolve(fileName)
                                .normalize();

                if (filePath.startsWith(uploadDirectory)) {

                    Files.deleteIfExists(filePath);
                }

            } catch (IOException e) {

                throw new RuntimeException(
                        "Failed to delete evidence file",
                        e
                );
            }
        }

        // --------------------------------------------------------
        // Delete database record
        // --------------------------------------------------------

        evidenceRepository.delete(evidence);
    }

    // ============================================================
    // GET ALL EVIDENCE
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<Evidence> getAllEvidence() {

        return evidenceRepository.findAll();
    }
}