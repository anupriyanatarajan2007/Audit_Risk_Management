
package com.example.audit_risk_management.serviceImpl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.audit_risk_management.dto.RiskConfigurationResponseDTO;
import com.example.audit_risk_management.dto.RiskRequestDTO;
import com.example.audit_risk_management.dto.RiskResponseDTO;
import com.example.audit_risk_management.enums.RiskCategory;
import com.example.audit_risk_management.enums.RiskLevel;
import com.example.audit_risk_management.enums.RiskStatus;
import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.model.Risk;
import com.example.audit_risk_management.model.Role;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.DepartmentRepository;
import com.example.audit_risk_management.repository.RiskRepository;
import com.example.audit_risk_management.repository.RoleRepository;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.service.RiskConfigurationService;
import com.example.audit_risk_management.service.RiskService;

@Service
public class RiskServiceImpl implements RiskService {

    private final RiskRepository riskRepository;
    private final UserRepo userRepository;
    private final RiskConfigurationService riskConfigurationService;
private final RoleRepository roleRepository;
private final DepartmentRepository departmentRepository;
public RiskServiceImpl(
        RiskRepository riskRepository,
        UserRepo userRepository,
        RiskConfigurationService riskConfigurationService,
        RoleRepository roleRepository,
        DepartmentRepository departmentRepository) {

    this.riskRepository = riskRepository;
    this.userRepository = userRepository;
    this.riskConfigurationService = riskConfigurationService;
    this.roleRepository = roleRepository;
    this.departmentRepository = departmentRepository;
}

    // =========================================================
    // GET CURRENT USER
    // =========================================================

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                authentication.getName() == null ||
                authentication.getName().equals("anonymousUser")) {

            throw new RuntimeException("User is not authenticated");
        }

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    }

    // =========================================================
    // CHECK ROLE
    // =========================================================

    private boolean hasRole(User user, String roleName) {

        return user != null
                && user.getRole() != null
                && user.getRole().getName() != null
                && user.getRole().getName().equalsIgnoreCase(roleName);
    }

    // =========================================================
    // CREATE RISK
    // =========================================================

    @Override
    public RiskResponseDTO createRisk(RiskRequestDTO requestDTO) {
    
        User identifiedBy = getCurrentUser();
    
        User assignedTo = null;
    
        if (requestDTO.getAssignedToId() != null) {
    
            assignedTo = userRepository
                    .findById(requestDTO.getAssignedToId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Assigned user not found"));
        }
    
        // ==========================================
        // GET EXISTING DEPARTMENT
        // ==========================================
    
        Department department = departmentRepository
                .findById(requestDTO.getDepartmentId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Department not found with ID: "
                                        + requestDTO.getDepartmentId()));
    
        // ==========================================
        // CREATE RISK
        // ==========================================
    
        Risk risk = new Risk();
    
        risk.setTitle(requestDTO.getTitle());
        risk.setDescription(requestDTO.getDescription());
    
        // IMPORTANT
        risk.setDepartment(department);
    
        risk.setBusinessUnit(requestDTO.getBusinessUnit());
        risk.setProcessName(requestDTO.getProcessName());
        risk.setRemarks(requestDTO.getRemarks());
    
        risk.setCategory(requestDTO.getCategory());
        risk.setLikelihood(requestDTO.getLikelihood());
        risk.setImpact(requestDTO.getImpact());
    
        // ==========================================
        // CALCULATE RISK SCORE / LEVEL
        // ==========================================
    
        calculateRiskLevel(risk);
    
        risk.setExistingControls(
                requestDTO.getExistingControls());
    
        risk.setMitigationPlan(
                requestDTO.getMitigationPlan());
    
        risk.setTargetClosureDate(
                requestDTO.getTargetClosureDate());
    
        risk.setIdentifiedBy(identifiedBy);
        risk.setAssignedTo(assignedTo);
    
        // ==========================================
        // SAVE
        // ==========================================
    
        Risk savedRisk = riskRepository.save(risk);
    
        return mapToDTO(savedRisk);
    }
    // =========================================================
    // UPDATE RISK
    // =========================================================

    @Override
    public RiskResponseDTO updateRisk(
            Long id,
            RiskRequestDTO requestDTO) {
    
        // ==========================================
        // FIND EXISTING RISK
        // ==========================================
    
        Risk risk = riskRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Risk not found"));
    
    
        // ==========================================
        // FIND ASSIGNED USER
        // ==========================================
    
        User assignedTo = null;
    
        if (requestDTO.getAssignedToId() != null) {
    
            assignedTo = userRepository
                    .findById(requestDTO.getAssignedToId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Assigned user not found"));
        }
    
    
        // ==========================================
        // FIND EXISTING DEPARTMENT
        // ==========================================
    
        Department department = departmentRepository
                .findById(requestDTO.getDepartmentId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Department not found with ID: "
                                        + requestDTO.getDepartmentId()));
    
    
        // ==========================================
        // UPDATE RISK DETAILS
        // ==========================================
    
        risk.setTitle(requestDTO.getTitle());
    
        risk.setDescription(
                requestDTO.getDescription());
    
        // IMPORTANT:
        // Use existing DB department
        risk.setDepartment(department);
    
        risk.setBusinessUnit(
                requestDTO.getBusinessUnit());
    
        risk.setProcessName(
                requestDTO.getProcessName());
    
        risk.setRemarks(
                requestDTO.getRemarks());
    
    
        // ==========================================
        // RISK ASSESSMENT
        // ==========================================
    
        risk.setCategory(
                requestDTO.getCategory());
    
        risk.setLikelihood(
                requestDTO.getLikelihood());
    
        risk.setImpact(
                requestDTO.getImpact());
    
    
        // ==========================================
        // RECALCULATE SCORE AND LEVEL
        // ==========================================
    
        calculateRiskLevel(risk);
    
    
        // ==========================================
        // MITIGATION DETAILS
        // ==========================================
    
        risk.setExistingControls(
                requestDTO.getExistingControls());
    
        risk.setMitigationPlan(
                requestDTO.getMitigationPlan());
    
        risk.setTargetClosureDate(
                requestDTO.getTargetClosureDate());
    
    
        // ==========================================
        // ASSIGN USER
        // ==========================================
    
        risk.setAssignedTo(assignedTo);
    
    
        // ==========================================
        // SAVE UPDATED RISK
        // ==========================================
    
        Risk updatedRisk =
                riskRepository.save(risk);
    
    
        // ==========================================
        // RETURN RESPONSE
        // ==========================================
    
        return mapToDTO(updatedRisk);
    }
    // =========================================================
    // CALCULATE RISK SCORE + LEVEL
    // =========================================================

    private void calculateRiskLevel(Risk risk) {

        if (risk.getLikelihood() == null ||
                risk.getImpact() == null) {

            throw new IllegalArgumentException(
                    "Likelihood and Impact are required");
        }

        int riskScore =
                risk.getLikelihood().getValue()
                        * risk.getImpact().getValue();

        risk.setRiskScore(riskScore);

        RiskConfigurationResponseDTO config =
                riskConfigurationService.getConfiguration();

        if (config == null) {

            throw new IllegalStateException(
                    "Risk configuration not found");
        }

        if (riskScore <= config.getLowMax()) {

            risk.setLevel(RiskLevel.LOW);

        } else if (
                riskScore >= config.getMediumMin()
                        && riskScore <= config.getMediumMax()) {

            risk.setLevel(RiskLevel.MEDIUM);

        } else if (
                riskScore >= config.getHighMin()
                        && riskScore <= config.getHighMax()) {

            risk.setLevel(RiskLevel.HIGH);

        } else if (
                riskScore >= config.getCriticalMin()) {

            risk.setLevel(RiskLevel.CRITICAL);

        } else {

            throw new IllegalStateException(
                    "Risk score does not match any configured risk level");
        }
    }

    // =========================================================
    // GET RISK BY ID
    // =========================================================

    @Override
    public RiskResponseDTO getRiskById(Long id) {

        Risk risk = riskRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Risk not found"));

        return mapToDTO(risk);
    }

    // =========================================================
    // GET RISK BY RISK ID
    // =========================================================

    @Override
    public RiskResponseDTO getRiskByRiskId(String riskId) {

        Risk risk = riskRepository.findByRiskId(riskId)
                .orElseThrow(() ->
                        new RuntimeException("Risk not found"));

        return mapToDTO(risk);
    }

    // =========================================================
    // GET ALL RISKS
    // =========================================================

    @Override
    public List<RiskResponseDTO> getAllRisks() {

        return riskRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET RISKS BY IDENTIFIED USER
    // =========================================================

    @Override
    public List<RiskResponseDTO> getRisksByIdentifiedBy(
            Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return riskRepository
                .findByIdentifiedBy(user)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET RISKS BY ASSIGNED USER
    // =========================================================

    @Override
    public List<RiskResponseDTO> getRisksByAssignedTo(
            Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return riskRepository
                .findByAssignedTo(user)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET RISKS BY STATUS
    // =========================================================

    @Override
    public List<RiskResponseDTO> getRisksByStatus(
            RiskStatus status) {

        return riskRepository
                .findByStatus(status)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET RISKS BY LEVEL
    // =========================================================

    @Override
    public List<RiskResponseDTO> getRisksByLevel(
            RiskLevel level) {

        return riskRepository
                .findByLevel(level)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET RISKS BY DEPARTMENT
    // =========================================================

    @Override
    public List<RiskResponseDTO> getRisksByDepartment(
            Department department) {

        return riskRepository
                .findByDepartment(department)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET RISKS BY CATEGORY
    // =========================================================

    @Override
    public List<RiskResponseDTO> getRisksByCategory(
            RiskCategory category) {

        return riskRepository
                .findByCategory(category)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // SEARCH RISKS
    // =========================================================

    @Override
    public List<RiskResponseDTO> searchRisks(String title) {

        return riskRepository
                .findByTitleContainingIgnoreCase(title)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // DELETE RISK
    // =========================================================

    @Override
    public void deleteRisk(Long id) {

        Risk risk = riskRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Risk not found"));

        riskRepository.delete(risk);
    }

    // =========================================================
    // DASHBOARD
    // =========================================================

    @Override
    public Long getTotalRisks() {

        return riskRepository.count();
    }

    @Override
    public Long getOpenRisks() {

        return riskRepository.countByStatus(RiskStatus.NEW)
                + riskRepository.countByStatus(
                        RiskStatus.IN_PROGRESS);
    }

    @Override
    public Long getClosedRisks() {

        return riskRepository.countByStatus(
                RiskStatus.CLOSED);
    }

    @Override
    public Long getHighRiskCount() {

        return riskRepository.countByLevel(
                RiskLevel.HIGH);
    }

    @Override
    public Long getCriticalRiskCount() {

        return riskRepository.countByLevel(
                RiskLevel.CRITICAL);
    }

    // =========================================================
    // OVERDUE RISKS
    // =========================================================

    @Override
    public List<RiskResponseDTO> getOverdueRisks() {

        return riskRepository
                .findByTargetClosureDateBeforeAndStatusNot(
                        LocalDate.now(),
                        RiskStatus.CLOSED)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // CLOSED RISKS
    // =========================================================

    @Override
    public List<RiskResponseDTO> getClosedRiskList() {

        return riskRepository
                .findByStatus(RiskStatus.CLOSED)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // ASSIGN RISK
    // =========================================================

    @Override
    public RiskResponseDTO assignRisk(
            Long riskId,
            Long userId) {

        Risk risk = riskRepository.findById(riskId)
                .orElseThrow(() ->
                        new RuntimeException("Risk not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        risk.setAssignedTo(user);

        return mapToDTO(
                riskRepository.save(risk));
    }

    // =========================================================
    // UPDATE RISK STATUS
    // =========================================================

    @Override
    public RiskResponseDTO updateRiskStatus(
            Long riskId,
            RiskStatus status) {

        Risk risk = riskRepository.findById(riskId)
                .orElseThrow(() ->
                        new RuntimeException("Risk not found"));

        if (status == null) {

            throw new IllegalArgumentException(
                    "Risk status is required");
        }

        risk.setStatus(status);

        if (status == RiskStatus.CLOSED) {

            risk.setActualClosureDate(
                    LocalDate.now());
        }

        return mapToDTO(
                riskRepository.save(risk));
    }

    // =========================================================
    // UPDATE MITIGATION
    // =========================================================

    @Override
    public RiskResponseDTO updateMitigation(
            Long riskId,
            String mitigationUpdate) {

        Risk risk = riskRepository.findById(riskId)
                .orElseThrow(() ->
                        new RuntimeException("Risk not found"));

        risk.setMitigationUpdate(
                mitigationUpdate);

        return mapToDTO(
                riskRepository.save(risk));
    }

    // =========================================================
    // RISKS FOR AUDIT MANAGER
    // =========================================================

    @Override
    public List<Risk> getRisksForManager() {

        User manager = getCurrentUser();

        // Role is an ENTITY, so compare role name
        if (!hasRole(manager, "AUDIT_MANAGER")) {

            throw new RuntimeException("Access denied");
        }

        return riskRepository.findByDepartment(
                manager.getDepartment());
    }

    // =========================================================
    // INTERNAL AUDITORS FOR MANAGER
    // =========================================================

    @Override
    public List<User> getInternalAuditorsForManager() {
    
        User manager = getCurrentUser();
    
        // Check current user's role
        if (manager.getRole() == null ||
                !"AUDIT_MANAGER".equalsIgnoreCase(
                        manager.getRole().getName())) {
    
            throw new RuntimeException("Access denied");
        }
    
        // Find INTERNAL_AUDITOR role from roles table
        Role internalAuditorRole = roleRepository
                .findByName("INTERNAL_AUDITOR")
                .orElseThrow(() ->
                        new RuntimeException(
                                "INTERNAL_AUDITOR role not found"));
    
        // Get internal auditors from manager's department
        return userRepository.findByRoleAndDepartment(
                internalAuditorRole,
                manager.getDepartment());
    }
    // =========================================================
    // MAP ENTITY → RESPONSE DTO
    // =========================================================

    private RiskResponseDTO mapToDTO(Risk risk) {

        RiskResponseDTO dto =
                new RiskResponseDTO();

                             

        dto.setId(risk.getId());
        dto.setRiskId(risk.getRiskId());

        // Basic Information

        dto.setTitle(risk.getTitle());
        dto.setDescription(risk.getDescription());
        dto.setDepartment(risk.getDepartment());
        dto.setBusinessUnit(risk.getBusinessUnit());
        dto.setProcessName(risk.getProcessName());
        dto.setRemarks(risk.getRemarks());

        // Risk Assessment

        dto.setCategory(risk.getCategory());
        dto.setLikelihood(risk.getLikelihood());
        dto.setImpact(risk.getImpact());
        dto.setRiskScore(risk.getRiskScore());
        dto.setLevel(risk.getLevel());

        // Controls

        dto.setExistingControls(
                risk.getExistingControls());

        dto.setMitigationPlan(
                risk.getMitigationPlan());

        dto.setTargetClosureDate(
                risk.getTargetClosureDate());

        // Mitigation Updates

        dto.setMitigationUpdate(
                risk.getMitigationUpdate());

        dto.setActualClosureDate(
                risk.getActualClosureDate());

        // Status

        dto.setStatus(risk.getStatus());

        // Identified By

        if (risk.getIdentifiedBy() != null) {

            dto.setIdentifiedById(
                    risk.getIdentifiedBy().getId());

            if (risk.getIdentifiedBy().getProfile() != null) {

                String firstName =
                        risk.getIdentifiedBy()
                                .getProfile()
                                .getFirstName();

                String lastName =
                        risk.getIdentifiedBy()
                                .getProfile()
                                .getLastName();

                dto.setIdentifiedByName(
                        buildFullName(
                                firstName,
                                lastName));
            }
        }

        // Assigned To

        if (risk.getAssignedTo() != null) {

            dto.setAssignedToId(
                    risk.getAssignedTo().getId());

            if (risk.getAssignedTo().getProfile() != null) {

                String firstName =
                        risk.getAssignedTo()
                                .getProfile()
                                .getFirstName();

                String lastName =
                        risk.getAssignedTo()
                                .getProfile()
                                .getLastName();

                dto.setAssignedToName(
                        buildFullName(
                                firstName,
                                lastName));
            }
        }

        // Audit Fields

        dto.setCreatedAt(risk.getCreatedAt());
        dto.setUpdatedAt(risk.getUpdatedAt());

        return dto;
    }

    // =========================================================
    // BUILD FULL NAME
    // =========================================================

    private String buildFullName(
            String firstName,
            String lastName) {

        String first =
                firstName == null
                        ? ""
                        : firstName.trim();

        String last =
                lastName == null
                        ? ""
                        : lastName.trim();

        return (first + " " + last).trim();
    }
}
