package com.example.audit_risk_management.serviceImpl;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.audit_risk_management.dto.AuditRequestDTO;
import com.example.audit_risk_management.dto.AuditResponseDTO;
import com.example.audit_risk_management.model.Audit;
import com.example.audit_risk_management.model.AuditConfiguration;
import com.example.audit_risk_management.model.AuditeeAssignment;
import com.example.audit_risk_management.model.Risk;
import com.example.audit_risk_management.model.RiskAuditorAssignment;
import com.example.audit_risk_management.model.Role;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.AuditConfigurationRepository;
import com.example.audit_risk_management.repository.AuditRepository;
import com.example.audit_risk_management.repository.AuditeeAssignmentRepository;
import com.example.audit_risk_management.repository.RiskAuditorAssignmentRepository;
import com.example.audit_risk_management.repository.RoleRepository;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.service.AuditService;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class AuditServiceImpl implements AuditService {

    // =========================================================
    // REPOSITORIES
    // =========================================================

    @Autowired
    private AuditRepository auditRepository;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private AuditeeAssignmentRepository auditeeAssignmentRepository;

    @Autowired
    private RiskAuditorAssignmentRepository riskAuditorAssignmentRepository;

    @Autowired
    private AuditConfigurationRepository auditConfigurationRepository;

    @Autowired
    private RoleRepository roleRepository;


    // =========================================================
    // GET CURRENT USER
    // =========================================================

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        String email = authentication.getName();

        return userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"
                        )
                );
    }


    // =========================================================
    // CHECK ROLE BY ROLE ENTITY NAME
    // =========================================================

    private boolean hasRole(User user, String roleName) {

        return user != null
                && user.getRole() != null
                && user.getRole().getName() != null
                && roleName.equalsIgnoreCase(
                        user.getRole().getName()
                );
    }


    // =========================================================
    // GET ROLE BY NAME
    // =========================================================

    private Role getRoleByName(String roleName) {

        return roleRepository
                .findByNameAndActiveTrue(roleName)
                .orElseThrow(() ->
                        new RuntimeException(
                                roleName + " role not found"
                        )
                );
    }


    // =========================================================
    // GET AUDIT CONFIGURATION
    // =========================================================

    private AuditConfiguration getAuditConfiguration() {

        return auditConfigurationRepository
                .findAll()
                .stream()
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException(
                                "Audit configuration not found. Please configure audit settings first."
                        )
                );
    }


    // =========================================================
    // VALIDATE AUDIT DURATION
    // =========================================================

    private void validateAuditDuration(
            AuditRequestDTO dto,
            AuditConfiguration configuration) {

        if (dto == null) {

            throw new IllegalArgumentException(
                    "Audit request is required"
            );
        }

        if (dto.getStartDate() == null) {

            throw new IllegalArgumentException(
                    "Start date is required"
            );
        }

        if (dto.getEndDate() == null) {

            throw new IllegalArgumentException(
                    "End date is required"
            );
        }

        if (dto.getEndDate()
                .isBefore(dto.getStartDate())) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }

        long duration =
                ChronoUnit.DAYS.between(
                        dto.getStartDate(),
                        dto.getEndDate()
                );

        // -----------------------------------------------------
        // MINIMUM DURATION
        // -----------------------------------------------------

        if (duration <
                configuration.getMinimumAuditDuration()) {

            throw new IllegalArgumentException(
                    "Audit duration must be at least "
                    + configuration.getMinimumAuditDuration()
                    + " days"
            );
        }

        // -----------------------------------------------------
        // MAXIMUM DURATION
        // -----------------------------------------------------

        if (duration >
                configuration.getMaximumAuditDuration()) {

            throw new IllegalArgumentException(
                    "Audit duration cannot exceed "
                    + configuration.getMaximumAuditDuration()
                    + " days"
            );
        }
    }


    // =========================================================
    // CREATE AUDIT
    // =========================================================

    @Override
    public AuditResponseDTO createAudit(
            AuditRequestDTO dto) {

        // -----------------------------------------------------
        // 1. GET LOGGED-IN USER
        // -----------------------------------------------------

        User internalAuditor = getCurrentUser();


        // -----------------------------------------------------
        // 2. CHECK INTERNAL AUDITOR ROLE
        // -----------------------------------------------------

        if (!hasRole(
                internalAuditor,
                "INTERNAL_AUDITOR")) {

            throw new RuntimeException(
                    "Only Internal Auditor can create an audit"
            );
        }


        // -----------------------------------------------------
        // 3. GET AUDIT CONFIGURATION
        // -----------------------------------------------------

        AuditConfiguration configuration =
                getAuditConfiguration();


        // -----------------------------------------------------
        // 4. VALIDATE AUDIT DURATION
        // -----------------------------------------------------

        validateAuditDuration(
                dto,
                configuration
        );


        // -----------------------------------------------------
        // 5. CHECK RISK ASSIGNMENT
        // -----------------------------------------------------

        RiskAuditorAssignment assignment =
                riskAuditorAssignmentRepository
                        .findByRisk_RiskIdAndAuditor(
                                dto.getRiskId(),
                                internalAuditor
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "This risk is not assigned to the logged-in Internal Auditor"
                                )
                        );


        // -----------------------------------------------------
        // 6. GET RISK
        // -----------------------------------------------------

        Risk risk = assignment.getRisk();

        if (risk == null) {

            throw new RuntimeException(
                    "Assigned risk not found"
            );
        }


        // -----------------------------------------------------
        // 7. CREATE AUDIT
        // -----------------------------------------------------

        Audit audit = new Audit();


        // -----------------------------------------------------
        // 8. GENERATE AUDIT ID
        // -----------------------------------------------------

        long count =
                auditRepository.count() + 1;

        audit.setAuditId(
                String.format(
                        "AUD-%03d",
                        count
                )
        );


        // -----------------------------------------------------
        // 9. BASIC INFORMATION
        // -----------------------------------------------------

        audit.setAuditName(
                dto.getAuditTitle()
        );

        audit.setDescription(
                dto.getDescription()
        );


        // -----------------------------------------------------
        // 10. LINK RISK
        // -----------------------------------------------------

        audit.setRisk(risk);


        // -----------------------------------------------------
        // 11. AUDIT DETAILS
        // -----------------------------------------------------

        audit.setDepartment(
                dto.getDepartment()
        );

        audit.setBusinessUnit(
                dto.getBusinessUnit()
        );

        audit.setProcessName(
                dto.getProcessName()
        );

        audit.setStartDate(
                dto.getStartDate()
        );

        audit.setEndDate(
                dto.getEndDate()
        );


        // -----------------------------------------------------
        // 12. ASSIGN INTERNAL AUDITOR
        // -----------------------------------------------------

        audit.setInternalAuditor(
                internalAuditor
        );


        // -----------------------------------------------------
        // 13. SAVE
        // -----------------------------------------------------

        Audit savedAudit =
                auditRepository.save(audit);


        // -----------------------------------------------------
        // 14. RESPONSE
        // -----------------------------------------------------

        return mapToResponse(savedAudit);
    }


    // =========================================================
    // GET ALL AUDITS
    // =========================================================

    @Override
    public List<AuditResponseDTO> getAllAudits() {

        return auditRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // GET AUDIT BY ID
    // =========================================================

    @Override
    public AuditResponseDTO getAuditById(
            Long id) {

        Audit audit =
                auditRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Audit not found"
                                )
                        );

        return mapToResponse(audit);
    }


    // =========================================================
    // UPDATE AUDIT
    // =========================================================

    @Override
    public AuditResponseDTO updateAudit(
            Long id,
            AuditRequestDTO dto) {

        Audit audit =
                auditRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Audit not found"
                                )
                        );


        // -----------------------------------------------------
        // GET LOGGED-IN USER
        // -----------------------------------------------------

        User internalAuditor =
                getCurrentUser();


        // -----------------------------------------------------
        // CHECK ROLE
        // -----------------------------------------------------

        if (!hasRole(
                internalAuditor,
                "INTERNAL_AUDITOR")) {

            throw new RuntimeException(
                    "Only Internal Auditor can update audit"
            );
        }


        // -----------------------------------------------------
        // VERIFY AUDIT OWNER
        // -----------------------------------------------------

        if (audit.getInternalAuditor() == null ||
                !audit.getInternalAuditor()
                        .getId()
                        .equals(internalAuditor.getId())) {

            throw new RuntimeException(
                    "You are not assigned to this audit"
            );
        }


        // -----------------------------------------------------
        // GET AUDIT CONFIGURATION
        // -----------------------------------------------------

        AuditConfiguration configuration =
                getAuditConfiguration();


        // -----------------------------------------------------
        // VALIDATE NEW DATES
        // -----------------------------------------------------

        validateAuditDuration(
                dto,
                configuration
        );


        // -----------------------------------------------------
        // UPDATE AUDIT
        // -----------------------------------------------------

        audit.setAuditName(
                dto.getAuditTitle()
        );

        audit.setDescription(
                dto.getDescription()
        );

        audit.setStartDate(
                dto.getStartDate()
        );

        audit.setEndDate(
                dto.getEndDate()
        );


        // @PreUpdate automatically updates updatedAt

        Audit updatedAudit =
                auditRepository.save(audit);

        return mapToResponse(updatedAudit);
    }


    // =========================================================
    // ASSIGN INTERNAL AUDITOR
    // =========================================================

    @Override
    public AuditResponseDTO assignInternalAuditor(
            Long auditId,
            Long auditorId) {

        Audit audit =
                auditRepository.findById(auditId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Audit not found"
                                )
                        );


        // -----------------------------------------------------
        // FIND USER
        // -----------------------------------------------------

        User auditor =
                userRepo.findById(auditorId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Internal Auditor not found"
                                )
                        );


        // -----------------------------------------------------
        // CHECK ROLE ENTITY
        // -----------------------------------------------------

        if (!hasRole(
                auditor,
                "INTERNAL_AUDITOR")) {

            throw new RuntimeException(
                    "Selected user is not an Internal Auditor"
            );
        }


        // -----------------------------------------------------
        // ASSIGN
        // -----------------------------------------------------

        audit.setInternalAuditor(
                auditor
        );

        Audit updatedAudit =
                auditRepository.save(audit);

        return mapToResponse(updatedAudit);
    }


    // =========================================================
    // UPDATE AUDIT STATUS
    // =========================================================

    @Override
    public AuditResponseDTO updateAuditStatus(
            Long auditId,
            String status) {

        Audit audit =
                auditRepository.findById(auditId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Audit not found"
                                )
                        );


        if (status == null ||
                status.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Audit status is required"
            );
        }


        try {

            audit.setStatus(
                    com.example.audit_risk_management.enums.AuditStatus
                            .valueOf(
                                    status.trim()
                                            .toUpperCase()
                            )
            );

        } catch (IllegalArgumentException e) {

            throw new RuntimeException(
                    "Invalid audit status: "
                    + status
            );
        }


        Audit updatedAudit =
                auditRepository.save(audit);

        return mapToResponse(updatedAudit);
    }


    // =========================================================
    // DELETE AUDIT
    // =========================================================

    @Override
    public void deleteAudit(Long id) {

        Audit audit =
                auditRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Audit not found"
                                )
                        );

        auditRepository.delete(audit);
    }


    // =========================================================
    // GET AUDITS FOR CURRENT INTERNAL AUDITOR
    // =========================================================

    @Override
    public List<AuditResponseDTO>
    getAuditsForCurrentInternalAuditor() {

        User auditor =
                getCurrentUser();


        if (!hasRole(
                auditor,
                "INTERNAL_AUDITOR")) {

            throw new RuntimeException(
                    "Logged-in user is not an Internal Auditor"
            );
        }


        List<Audit> audits =
                auditRepository
                        .findByInternalAuditor(
                                auditor
                        );


        return audits.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // GET AUDITS FOR CURRENT AUDITEE
    // =========================================================

    @Override
    public List<AuditResponseDTO>
    getAuditsForCurrentAuditee() {

        User auditee =
                getCurrentUser();


        if (!hasRole(
                auditee,
                "AUDITEE")) {

            throw new RuntimeException(
                    "Logged-in user is not an Auditee"
            );
        }


        List<AuditeeAssignment> assignments =
                auditeeAssignmentRepository
                        .findByAuditee(auditee);


        return assignments.stream()
                .map(AuditeeAssignment::getAudit)
                .filter(audit -> audit != null)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }


    // =========================================================
    // MAP AUDIT ENTITY → RESPONSE DTO
    // =========================================================

    private AuditResponseDTO mapToResponse(
            Audit audit) {

        AuditResponseDTO dto =
                new AuditResponseDTO();


        // -----------------------------------------------------
        // AUDIT BASIC DETAILS
        // -----------------------------------------------------

        dto.setId(
                audit.getId()
        );

        dto.setAuditId(
                audit.getAuditId()
        );

        dto.setAuditName(
                audit.getAuditName()
        );

        dto.setDescription(
                audit.getDescription()
        );

        dto.setDepartment(
                audit.getDepartment()
        );

        dto.setBusinessUnit(
                audit.getBusinessUnit()
        );

        dto.setProcessName(
                audit.getProcessName()
        );

        dto.setStartDate(
                audit.getStartDate()
        );

        dto.setEndDate(
                audit.getEndDate()
        );

        dto.setStatus(
                audit.getStatus()
        );

        dto.setCreatedAt(
                audit.getCreatedAt()
        );

        dto.setUpdatedAt(
                audit.getUpdatedAt()
        );


        // -----------------------------------------------------
        // RISK
        // -----------------------------------------------------

        if (audit.getRisk() != null) {

            dto.setRiskId(
                    audit.getRisk().getRiskId()
            );

            dto.setRiskTitle(
                    audit.getRisk().getTitle()
            );
        }


        // -----------------------------------------------------
        // INTERNAL AUDITOR
        // -----------------------------------------------------

        if (audit.getInternalAuditor() != null) {

            User internalAuditor =
                    audit.getInternalAuditor();

            dto.setInternalAuditorId(
                    internalAuditor.getId()
            );


            if (internalAuditor.getProfile() != null) {

                String firstName =
                        internalAuditor
                                .getProfile()
                                .getFirstName();

                String lastName =
                        internalAuditor
                                .getProfile()
                                .getLastName();


                if (firstName == null) {
                    firstName = "";
                }

                if (lastName == null) {
                    lastName = "";
                }


                dto.setInternalAuditorName(
                        (firstName + " " + lastName)
                                .trim()
                );

            } else {

                dto.setInternalAuditorName(
                        internalAuditor.getEmail()
                );
            }
        }


        return dto;
    }
}