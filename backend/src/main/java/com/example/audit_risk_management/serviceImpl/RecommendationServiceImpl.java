package com.example.audit_risk_management.serviceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.audit_risk_management.dto.RecommendationRequestDTO;
import com.example.audit_risk_management.dto.RecommendationResponseDTO;
import com.example.audit_risk_management.enums.RecommendationStatus;
import com.example.audit_risk_management.model.Audit;
import com.example.audit_risk_management.model.AuditeeAssignment;
import com.example.audit_risk_management.model.Finding;
import com.example.audit_risk_management.model.Recommendation;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.AuditRepository;
import com.example.audit_risk_management.repository.AuditeeAssignmentRepository;
import com.example.audit_risk_management.repository.FindingRepository;
import com.example.audit_risk_management.repository.RecommendationRepository;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.service.RecommendationService;

@Service
@Transactional
public class RecommendationServiceImpl implements RecommendationService {

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private FindingRepository findingRepository;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private AuditRepository auditRepository;

    @Autowired
    private AuditeeAssignmentRepository auditeeAssignmentRepository;

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No authenticated user found");
        }

        String email = authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found for email: " + email
                        )
                );
    }

    // ============================================================
    // CREATE RECOMMENDATION
    // ============================================================

 @Override
@Transactional
public RecommendationResponseDTO createRecommendation(
        RecommendationRequestDTO dto) {

    // ============================================================
    // VALIDATION
    // ============================================================

    if (dto == null) {
        throw new RuntimeException(
                "Recommendation request cannot be null");
    }

    if (dto.getAuditId() == null) {
        throw new RuntimeException(
                "Audit ID is required");
    }

    if (dto.getFindingId() == null) {
        throw new RuntimeException(
                "Finding ID is required");
    }

    if (dto.getRecommendationText() == null ||
            dto.getRecommendationText().isBlank()) {

        throw new RuntimeException(
                "Recommendation text is required");
    }

    // ============================================================
    // FIND AUDIT
    // ============================================================

    Audit audit = auditRepository
            .findById(dto.getAuditId())
            .orElseThrow(() ->
                    new RuntimeException(
                            "Audit not found with ID: "
                                    + dto.getAuditId()));

    // ============================================================
    // FIND FINDING
    // ============================================================

    Finding finding = findingRepository
            .findById(dto.getFindingId())
            .orElseThrow(() ->
                    new RuntimeException(
                            "Finding not found with ID: "
                                    + dto.getFindingId()));

    // ============================================================
    // VALIDATE FINDING BELONGS TO AUDIT
    // ============================================================

    if (finding.getAudit() == null ||
            !finding.getAudit().getId()
                    .equals(audit.getId())) {

        throw new RuntimeException(
                "Finding does not belong to the selected audit");
    }

    // ============================================================
    // GET LOGGED-IN INTERNAL AUDITOR
    // ============================================================

    Authentication authentication =
            SecurityContextHolder
                    .getContext()
                    .getAuthentication();

    if (authentication == null ||
            authentication.getName() == null) {

        throw new RuntimeException(
                "User is not authenticated");
    }

    String email = authentication.getName();

    User internalAuditor = userRepository
            .findByEmail(email)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Logged-in user not found"));

    // ============================================================
    // VALIDATE INTERNAL AUDITOR ROLE
    // ============================================================

    if (internalAuditor.getRole() == null ||
    !"INTERNAL_AUDITOR".equalsIgnoreCase(
            internalAuditor.getRole().getName())) {

throw new RuntimeException(
        "Only Internal Auditor can create a recommendation");
}

    // ============================================================
    // FIND AUDITEE FROM AuditeeAssignment
    // ============================================================

    List<AuditeeAssignment> assignments =
            auditeeAssignmentRepository
                    .findByAuditId(dto.getAuditId());

    if (assignments == null ||
            assignments.isEmpty()) {

        throw new RuntimeException(
                "No auditee is assigned to this audit");
    }

    // ============================================================
    // GET ACTIVE / ASSIGNED AUDITEE
    // ============================================================

    AuditeeAssignment auditeeAssignment =
            assignments.stream()
                    .filter(assignment ->
                            assignment.getAuditee() != null)
                    .findFirst()
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "No auditee is assigned to this audit"));

    User auditee =
            auditeeAssignment.getAuditee();

    // ============================================================
    // CREATE RECOMMENDATION
    // ============================================================

    Recommendation recommendation =
            new Recommendation();

    recommendation.setAudit(audit);

    recommendation.setFinding(finding);

    recommendation.setInternalAuditor(
            internalAuditor);

    recommendation.setAuditee(
            auditee);

    recommendation.setRecommendationText(
            dto.getRecommendationText().trim());

    recommendation.setStatus(
            RecommendationStatus.PENDING);

    // recommendationId and timestamps
    // are automatically generated by @PrePersist

    Recommendation saved =
            recommendationRepository.save(
                    recommendation);

    // ============================================================
    // RETURN RESPONSE
    // ============================================================

    return convertToDTO(saved);
}
    // ============================================================
    // GET RECOMMENDATION BY ID
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public RecommendationResponseDTO getRecommendationById(Long id) {

        Recommendation recommendation = recommendationRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Recommendation not found with ID: " + id
                        )
                );

        return convertToDTO(recommendation);
    }

    // ============================================================
    // GET RECOMMENDATIONS FOR CURRENT AUDITOR
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<RecommendationResponseDTO> getRecommendationsForCurrentAuditor() {

        User currentUser = getCurrentUser();

        List<Recommendation> recommendations =
                recommendationRepository.findByInternalAuditorId(currentUser.getId());

        return recommendations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET RECOMMENDATIONS FOR CURRENT AUDITEE
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<RecommendationResponseDTO> getRecommendationsForCurrentAuditee() {

        User currentUser = getCurrentUser();

        List<Recommendation> recommendations =
                recommendationRepository.findByAuditeeId(currentUser.getId());

        return recommendations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET RECOMMENDATIONS FOR A FINDING
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<RecommendationResponseDTO> getRecommendationsForFinding(
            Long findingId) {

        if (!findingRepository.existsById(findingId)) {
            throw new RuntimeException(
                    "Finding not found with ID: " + findingId
            );
        }

        List<Recommendation> recommendations =
                recommendationRepository.findByFindingId(findingId);

        return recommendations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ============================================================
    // UPDATE STATUS
    // ============================================================
    @Override
    @Transactional
    public RecommendationResponseDTO updateStatus(
            Long id,
            String status) {
    
        Recommendation recommendation =
                recommendationRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Recommendation not found with ID: "
                                                + id));
    
        if (status == null || status.isBlank()) {
            throw new RuntimeException(
                    "Recommendation status is required");
        }
    
        RecommendationStatus newStatus;
    
        try {
            newStatus =
                    RecommendationStatus.valueOf(
                            status.trim().toUpperCase());
    
        } catch (IllegalArgumentException ex) {
    
            throw new RuntimeException(
                    "Invalid recommendation status: "
                            + status);
        }
    
        recommendation.setStatus(newStatus);
    
        Recommendation updated =
                recommendationRepository.save(
                        recommendation);
    
        return convertToDTO(updated);
    }
    // ============================================================
    // ENTITY -> DTO
    // ============================================================

    private RecommendationResponseDTO convertToDTO(Recommendation recommendation) {

        RecommendationResponseDTO dto = new RecommendationResponseDTO();

        dto.setId(recommendation.getId());
        dto.setRecommendationId(recommendation.getRecommendationId());
        dto.setRecommendationText(recommendation.getRecommendationText());

        // --------------------------------------------------------
        // Audit
        // --------------------------------------------------------

        if (recommendation.getAudit() != null) {
            dto.setAuditId(recommendation.getAudit().getId());
            dto.setAuditCode(recommendation.getAudit().getAuditId());
            dto.setAuditName(recommendation.getAudit().getAuditName());
        }

        // --------------------------------------------------------
        // Finding
        // --------------------------------------------------------

        if (recommendation.getFinding() != null) {
            dto.setFindingId(recommendation.getFinding().getId());
            dto.setFindingTitle(recommendation.getFinding().getTitle());
        }

        // --------------------------------------------------------
        // Internal Auditor
        // --------------------------------------------------------
        // NOTE: User entity has no "name" field in your model — using
        // employeeId as display name. Swap to profile-based name if
        // your Profile entity has a fullName field.

        if (recommendation.getInternalAuditor() != null) {
            User auditor = recommendation.getInternalAuditor();
            dto.setInternalAuditorId(auditor.getId());
            dto.setInternalAuditorName(
                    auditor.getEmployeeId() != null
                            ? auditor.getEmployeeId()
                            : auditor.getEmail()
            );
        }

        // --------------------------------------------------------
        // Auditee
        // --------------------------------------------------------

        if (recommendation.getAuditee() != null) {
            User auditee = recommendation.getAuditee();
            dto.setAuditeeId(auditee.getId());
            dto.setAuditeeName(
                    auditee.getEmployeeId() != null
                            ? auditee.getEmployeeId()
                            : auditee.getEmail()
            );
            dto.setAuditeeEmail(auditee.getEmail());
        }

        // --------------------------------------------------------
        // Status + Dates
        // --------------------------------------------------------

        dto.setStatus(recommendation.getStatus());
        dto.setCreatedAt(recommendation.getCreatedAt());
        dto.setUpdatedAt(recommendation.getUpdatedAt());

        return dto;
    }


    @Override
@Transactional(readOnly = true)
public List<RecommendationResponseDTO> getAllRecommendations() {

    List<Recommendation> recommendations =
            recommendationRepository.findAll();

    return recommendations.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
}


}