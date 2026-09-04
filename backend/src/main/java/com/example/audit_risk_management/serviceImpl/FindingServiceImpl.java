package com.example.audit_risk_management.serviceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.audit_risk_management.dto.FindingRequestDTO;
import com.example.audit_risk_management.dto.FindingResponseDTO;
import com.example.audit_risk_management.enums.FindingStatus;
import com.example.audit_risk_management.enums.RiskLevel;
import com.example.audit_risk_management.model.Audit;
import com.example.audit_risk_management.model.Finding;
import com.example.audit_risk_management.model.Role;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.AuditRepository;
import com.example.audit_risk_management.repository.FindingRepository;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.service.FindingService;

@Service
public class FindingServiceImpl implements FindingService {

    @Autowired
    private FindingRepository findingRepository;

    @Autowired
    private AuditRepository auditRepository;

    @Autowired
    private UserRepo userRepo;

    // =========================================================
    // CREATE FINDING
    // INTERNAL AUDITOR ONLY
    // =========================================================

    @Override
    public FindingResponseDTO createFinding(
            FindingRequestDTO requestDTO) {

        Audit audit = auditRepository
                .findByAuditId(requestDTO.getAuditId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Audit not found: " + requestDTO.getAuditId()
                        ));

        User currentUser = getCurrentUser();

        // Only INTERNAL AUDITOR can create findings
        if (currentUser.getRole() == null ||
        !"INTERNAL_AUDITOR".equalsIgnoreCase(
                currentUser.getRole().getName())) {

    throw new RuntimeException(
            "Only Internal Auditor can create findings"
    );
}

        // Check auditor assignment
        if (audit.getInternalAuditor() == null) {

            throw new RuntimeException(
                    "No Internal Auditor assigned to this audit"
            );
        }

        if (!audit.getInternalAuditor()
                .getId()
                .equals(currentUser.getId())) {

            throw new RuntimeException(
                    "You are not assigned to this audit"
            );
        }

        Finding finding = new Finding();

        finding.setAudit(audit);
        finding.setAuditor(currentUser);

        finding.setTitle(requestDTO.getTitle());
        finding.setObservation(requestDTO.getObservation());
        finding.setRiskLevel(requestDTO.getRiskLevel());
        finding.setRecommendation(requestDTO.getRecommendation());

        if (requestDTO.getStatus() != null) {
            finding.setStatus(requestDTO.getStatus());
        } else {
            finding.setStatus(FindingStatus.DRAFT);
        }

        Finding savedFinding =
                findingRepository.save(finding);

        return mapToDTO(savedFinding);
    }

    // =========================================================
    // UPDATE FINDING
    // INTERNAL AUDITOR + AUDITEE + AUDIT MANAGER
    // =========================================================

    @Override
    public FindingResponseDTO updateFinding(
            Long id,
            FindingRequestDTO requestDTO) {

        Finding finding = findingRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Finding not found: " + id
                        ));

        User currentUser = getCurrentUser();

        Role role = currentUser.getRole();

        // =====================================================
        // INTERNAL AUDITOR
        // =====================================================

        if (role != null &&
                "INTERNAL_AUDITOR".equalsIgnoreCase(role.getName())) {
        
            if (finding.getAuditor() == null) {
        
                throw new RuntimeException(
                        "Finding has no assigned auditor"
                );
            }
        
            if (!finding.getAuditor()
                    .getId()
                    .equals(currentUser.getId())) {
        
                throw new RuntimeException(
                        "You are not assigned to this finding"
                );
            }
        }

        // =====================================================
        // AUDITEE
        // =====================================================

        else if (role != null &&
                "AUDITEE".equalsIgnoreCase(role.getName())) {
        
            if (finding.getAudit() == null) {
        
                throw new RuntimeException(
                        "Finding is not linked to an audit"
                );
            }
                
            if (requestDTO.getAuditId() != null &&
                    !finding.getAudit()
                            .getAuditId()
                            .equals(requestDTO.getAuditId())) {
        
                throw new RuntimeException(
                        "Finding does not belong to this audit"
                );
            }
        }
        // AUDIT MANAGER
        // ✅ New
        else if (role != null &&
                "AUDIT_MANAGER".equalsIgnoreCase(role.getName())) {
        }

     
        // =====================================================
        // OTHER ROLES NOT ALLOWED
        // =====================================================

        else {

            throw new RuntimeException(
                    "You are not authorized to update this finding"
            );
        }

        // =====================================================
        // UPDATE FINDING DATA
        // =====================================================

        finding.setTitle(
                requestDTO.getTitle()
        );

        finding.setObservation(
                requestDTO.getObservation()
        );

        finding.setRiskLevel(
                requestDTO.getRiskLevel()
        );

        finding.setRecommendation(
                requestDTO.getRecommendation()
        );

        // Update status if supplied
        if (requestDTO.getStatus() != null) {

            finding.setStatus(
                    requestDTO.getStatus()
            );
        }

        Finding updatedFinding =
                findingRepository.save(finding);

        return mapToDTO(updatedFinding);
    }

    // =========================================================
    // GET FINDING BY ID
    // =========================================================

    @Override
    public FindingResponseDTO getFindingById(Long id) {

        Finding finding = findingRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Finding not found: " + id
                        ));

        return mapToDTO(finding);
    }

    // =========================================================
    // GET ALL FINDINGS
    // =========================================================

    @Override
    public List<FindingResponseDTO> getAllFindings() {

        return findingRepository
                .findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET FINDINGS BY AUDIT DATABASE ID
    // =========================================================

    @Override
    public List<FindingResponseDTO> getFindingsByAuditId(
            Long auditId) {

        return findingRepository
                .findByAuditId(auditId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET FINDINGS BY AUDITOR
    // =========================================================

    @Override
    public List<FindingResponseDTO> getFindingsByAuditorId(
            Long auditorId) {

        return findingRepository
                .findByAuditorId(auditorId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET FINDINGS BY STATUS
    // =========================================================

    @Override
    public List<FindingResponseDTO> getFindingsByStatus(
            FindingStatus status) {

        return findingRepository
                .findByStatus(status)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET FINDINGS BY RISK LEVEL
    // =========================================================

    @Override
    public List<FindingResponseDTO> getFindingsByRiskLevel(
            RiskLevel riskLevel) {

        return findingRepository
                .findByRiskLevel(riskLevel)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET AUDITOR FINDINGS BY STATUS
    // =========================================================

    @Override
    public List<FindingResponseDTO> getFindingsByAuditorAndStatus(
            Long auditorId,
            FindingStatus status) {

        User auditor = userRepo
                .findById(auditorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Auditor not found: " + auditorId
                        ));

        return findingRepository
                .findByAuditorAndStatus(
                        auditor,
                        status
                )
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET AUDIT FINDINGS BY RISK LEVEL
    // =========================================================

    @Override
    public List<FindingResponseDTO> getFindingsByAuditAndRiskLevel(
            Long auditId,
            RiskLevel riskLevel) {

        Audit audit = auditRepository
                .findById(auditId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Audit not found: " + auditId
                        ));

        return findingRepository
                .findByAuditAndRiskLevel(
                        audit,
                        riskLevel
                )
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // DELETE FINDING
    // INTERNAL AUDITOR ONLY
    // =========================================================

    @Override
    public void deleteFinding(Long id) {

        Finding finding = findingRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Finding not found: " + id
                        ));

        User currentUser = getCurrentUser();

        if (currentUser.getRole() == null ||
        !"INTERNAL_AUDITOR".equalsIgnoreCase(
                currentUser.getRole().getName())) {

    throw new RuntimeException(
            "Only Internal Auditor can create findings"
    );
}

        if (finding.getAuditor() == null ||
                !finding.getAuditor()
                        .getId()
                        .equals(currentUser.getId())) {

            throw new RuntimeException(
                    "You are not authorized to delete this finding"
            );
        }

        findingRepository.delete(finding);
    }

    // =========================================================
    // GET CURRENT USER
    // =========================================================

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        return userRepo
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found: " + email
                        ));
    }

    // =========================================================
    // ENTITY -> DTO
    // =========================================================

    private FindingResponseDTO mapToDTO(
            Finding finding) {

        FindingResponseDTO dto =
                new FindingResponseDTO();

        // Finding ID
        dto.setId(
                finding.getId()
        );

        // =====================================================
        // AUDIT
        // =====================================================

        if (finding.getAudit() != null) {

                dto.setAuditDbId(
                        finding.getAudit().getId()   // numeric PK
                );

                dto.setAuditId(
                        finding.getAudit().getAuditId()   // string code
                );

                dto.setAuditName(
                        finding.getAudit().getAuditName()
                );
            }

        // =====================================================
        // FINDING
        // =====================================================

        dto.setTitle(
                finding.getTitle()
        );

        dto.setObservation(
                finding.getObservation()
        );

        dto.setRiskLevel(
                finding.getRiskLevel()
        );

        dto.setRecommendation(
                finding.getRecommendation()
        );

        dto.setStatus(
                finding.getStatus()
        );

        // =====================================================
        // AUDITOR
        // =====================================================

        if (finding.getAuditor() != null) {

            if (finding.getAuditor().getProfile() != null) {

                String firstName =
                        finding.getAuditor()
                                .getProfile()
                                .getFirstName();

                String lastName =
                        finding.getAuditor()
                                .getProfile()
                                .getLastName();

                String fullName =
                        ((firstName != null)
                                ? firstName
                                : "")
                        + " "
                        + ((lastName != null)
                                ? lastName
                                : "");

                dto.setAuditorName(
                        fullName.trim()
                );

            } else {

                dto.setAuditorName(
                        finding.getAuditor()
                                .getEmail()
                );
            }
        }

        // =====================================================
        // DATES
        // =====================================================

        dto.setCreatedAt(
                finding.getCreatedAt()
        );

        dto.setUpdatedAt(
                finding.getUpdatedAt()
        );

        return dto;
    }
}