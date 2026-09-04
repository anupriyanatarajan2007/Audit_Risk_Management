package com.example.audit_risk_management.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.audit_risk_management.dto.AuditCommitmentRequest;
import com.example.audit_risk_management.dto.AuditCommitmentResponse;
import com.example.audit_risk_management.enums.CommitmentStatus;
import com.example.audit_risk_management.model.Audit;
import com.example.audit_risk_management.model.AuditCommitment;
import com.example.audit_risk_management.model.Profile;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.AuditCommitmentRepository;
import com.example.audit_risk_management.repository.AuditRepository;
import com.example.audit_risk_management.repository.UserRepo;

@Service
@Transactional
public class AuditCommitmentService {

    private final AuditCommitmentRepository commitmentRepository;
    private final AuditRepository auditRepository;
    private final UserRepo userRepository;

    public AuditCommitmentService(
            AuditCommitmentRepository commitmentRepository,
            AuditRepository auditRepository,
            UserRepo userRepository) {

        this.commitmentRepository = commitmentRepository;
        this.auditRepository = auditRepository;
        this.userRepository = userRepository;
    }

    // ============================================================
    // CREATE COMMITMENT
    // ============================================================

    public AuditCommitmentResponse create(
            AuditCommitmentRequest request) {

        // --------------------------------------------------------
        // Validate Audit
        // --------------------------------------------------------

        Audit audit = auditRepository
                .findById(request.getAuditId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Audit not found with ID: "
                                        + request.getAuditId()
                        )
                );

        // --------------------------------------------------------
        // Validate Auditee
        // --------------------------------------------------------

        User auditee = userRepository
                .findById(request.getAuditeeId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Auditee not found with ID: "
                                        + request.getAuditeeId()
                        )
                );

        // --------------------------------------------------------
        // Validate Dates
        // --------------------------------------------------------

        if (request.getDueDate()
                .isBefore(request.getStartDate())) {

            throw new RuntimeException(
                    "Due date cannot be before start date"
            );
        }

        // --------------------------------------------------------
        // Create Commitment
        // --------------------------------------------------------

        AuditCommitment commitment =
                new AuditCommitment();

        commitment.setAudit(audit);

        // Auditor is NOT assigned at this stage
        commitment.setAuditor(null);

        // Auditee is selected before assignment
        commitment.setAuditee(auditee);

        commitment.setCommitmentType(
                request.getCommitmentType()
        );

        commitment.setStartDate(
                request.getStartDate()
        );

        commitment.setDueDate(
                request.getDueDate()
        );

        CommitmentStatus status;

        try {

            status = CommitmentStatus.valueOf(
                    request.getStatus().toUpperCase()
            );

        } catch (IllegalArgumentException e) {

            throw new RuntimeException(
                    "Invalid commitment status: "
                            + request.getStatus()
            );
        }

        commitment.setStatus(status);

        AuditCommitment saved =
                commitmentRepository.save(commitment);

        return convertToResponse(saved);
    }


    // ============================================================
    // GET BY ID
    // ============================================================

    @Transactional(readOnly = true)
    public AuditCommitmentResponse getById(Long id) {

        AuditCommitment commitment =
                commitmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Audit commitment not found"
                                )
                        );

        return convertToResponse(commitment);
    }


    // ============================================================
    // GET ALL
    // ============================================================

    @Transactional(readOnly = true)
    public List<AuditCommitmentResponse> getAll() {

        return commitmentRepository
                .findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // ============================================================
    // GET BY AUDITOR
    // ============================================================

    @Transactional(readOnly = true)
    public List<AuditCommitmentResponse> getByAuditor(
            Long auditorId) {

        User auditor = userRepository
                .findById(auditorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Auditor not found"
                        )
                );

        return commitmentRepository
                .findByAuditor(auditor)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // ============================================================
    // GET ACTIVE BY AUDITOR
    // ============================================================

    @Transactional(readOnly = true)
    public List<AuditCommitmentResponse> getActiveByAuditor(
            Long auditorId) {

        User auditor = userRepository
                .findById(auditorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Auditor not found"
                        )
                );

        List<CommitmentStatus> statuses = List.of(
                CommitmentStatus.PENDING,
                CommitmentStatus.IN_PROGRESS
        );

        return commitmentRepository
                .findByAuditorAndStatusIn(
                        auditor,
                        statuses
                )
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // ============================================================
    // GET BY AUDITEE
    // ============================================================

    @Transactional(readOnly = true)
    public List<AuditCommitmentResponse> getByAuditee(
            Long auditeeId) {

        User auditee = userRepository
                .findById(auditeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Auditee not found"
                        )
                );

        return commitmentRepository
                .findByAuditee(auditee)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // ============================================================
    // GET ACTIVE BY AUDITEE
    // ============================================================

    @Transactional(readOnly = true)
    public List<AuditCommitmentResponse> getActiveByAuditee(
            Long auditeeId) {

        User auditee = userRepository
                .findById(auditeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Auditee not found"
                        )
                );

        List<CommitmentStatus> statuses = List.of(
                CommitmentStatus.PENDING,
                CommitmentStatus.IN_PROGRESS
        );

        return commitmentRepository
                .findByAuditeeAndStatusIn(
                        auditee,
                        statuses
                )
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // ============================================================
    // AUDITEE WORKLOAD
    // ============================================================

    @Transactional(readOnly = true)
    public long getAuditeeWorkload(
            Long auditeeId) {

        User auditee = userRepository
                .findById(auditeeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Auditee not found"
                        )
                );

        List<CommitmentStatus> activeStatuses = List.of(
                CommitmentStatus.PENDING,
                CommitmentStatus.IN_PROGRESS
        );

        return commitmentRepository
                .countByAuditeeAndStatusIn(
                        auditee,
                        activeStatuses
                );
    }


    // ============================================================
    // GET BY AUDIT
    // ============================================================

    @Transactional(readOnly = true)
    public List<AuditCommitmentResponse> getByAudit(
            Long auditId) {

        Audit audit = auditRepository
                .findById(auditId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Audit not found"
                        )
                );

        return commitmentRepository
                .findByAudit(audit)
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // ============================================================
    // UPDATE STATUS
    // ============================================================

    public AuditCommitmentResponse updateStatus(
            Long id,
            String status) {

        AuditCommitment commitment =
                commitmentRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Audit commitment not found"
                                )
                        );

        CommitmentStatus newStatus;

        try {

            newStatus = CommitmentStatus.valueOf(
                    status.toUpperCase()
            );

        } catch (IllegalArgumentException e) {

            throw new RuntimeException(
                    "Invalid commitment status: "
                            + status
            );
        }

        commitment.setStatus(newStatus);

        AuditCommitment updated =
                commitmentRepository.save(commitment);

        return convertToResponse(updated);
    }


    // ============================================================
    // DELETE
    // ============================================================

    public void delete(Long id) {

        if (!commitmentRepository.existsById(id)) {

            throw new RuntimeException(
                    "Audit commitment not found"
            );
        }

        commitmentRepository.deleteById(id);
    }


    // ============================================================
    // CHECK AUDITOR AVAILABILITY
    // ============================================================

    @Transactional(readOnly = true)
    public boolean isAuditorAvailable(
            Long auditorId) {

        User auditor = userRepository
                .findById(auditorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Auditor not found"
                        )
                );

        List<CommitmentStatus> statuses = List.of(
                CommitmentStatus.PENDING,
                CommitmentStatus.IN_PROGRESS
        );

        List<AuditCommitment> commitments =
                commitmentRepository
                        .findByAuditorAndStatusIn(
                                auditor,
                                statuses
                        );

        return commitments.isEmpty();
    }


    // ============================================================
    // ENTITY → RESPONSE DTO
    // ============================================================

    private AuditCommitmentResponse convertToResponse(
            AuditCommitment commitment) {

        AuditCommitmentResponse response =
                new AuditCommitmentResponse();

        response.setId(commitment.getId());

        // Auditor may be NULL before auditor assignment
        if (commitment.getAuditor() != null) {

            response.setAuditorId(
                    commitment.getAuditor().getId()
            );

            response.setAuditorName(
                    buildUserName(
                            commitment.getAuditor()
                    )
            );
        }

        // Auditee
        if (commitment.getAuditee() != null) {

            response.setAuditeeId(
                    commitment.getAuditee().getId()
            );

            response.setAuditeeName(
                    buildUserName(
                            commitment.getAuditee()
                    )
            );
        }

        // Audit
        if (commitment.getAudit() != null) {

            response.setAuditId(
                    commitment.getAudit().getId()
            );
        }

        response.setCommitmentType(
                commitment.getCommitmentType()
        );

        response.setStartDate(
                commitment.getStartDate()
        );

        response.setDueDate(
                commitment.getDueDate()
        );

        if (commitment.getStatus() != null) {

            response.setStatus(
                    commitment.getStatus().name()
            );
        }

        return response;
    }


    // ============================================================
    // USER NAME HELPER
    // ============================================================

private String buildUserName(User user) {

    if (user == null) {
        return null;
    }

    Profile profile = user.getProfile();

    if (profile != null) {

        String firstName = profile.getFirstName();
        String lastName = profile.getLastName();

        if (firstName == null && lastName == null) {
            return user.getEmployeeId();
        }

        if (firstName == null || firstName.isBlank()) {
            return lastName;
        }

        if (lastName == null || lastName.isBlank()) {
            return firstName;
        }

        return firstName + " " + lastName;
    }

    // Profile not available
    return user.getEmployeeId();
}

}