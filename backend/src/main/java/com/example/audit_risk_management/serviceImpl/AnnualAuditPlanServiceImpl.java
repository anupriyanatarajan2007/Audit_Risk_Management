package com.example.audit_risk_management.serviceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.audit_risk_management.dto.AnnualAuditPlanRequestDTO;
import com.example.audit_risk_management.dto.AnnualAuditPlanResponseDTO;
import com.example.audit_risk_management.enums.AnnualAuditPlanStatus;
import com.example.audit_risk_management.model.AnnualAuditPlan;
import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.model.Risk;
import com.example.audit_risk_management.model.Role;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.AnnualAuditPlanRepository;
import com.example.audit_risk_management.repository.RiskRepository;
import com.example.audit_risk_management.repository.RoleRepository;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.service.AnnualAuditPlanService;

@Service
public class AnnualAuditPlanServiceImpl
        implements AnnualAuditPlanService {

    private final AnnualAuditPlanRepository planRepository;
    private final RiskRepository riskRepository;
    private final UserRepo userRepository;
    private final RoleRepository roleRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AnnualAuditPlanServiceImpl(
            AnnualAuditPlanRepository planRepository,
            RiskRepository riskRepository,
            UserRepo userRepository,
            RoleRepository roleRepository) {

        this.planRepository = planRepository;
        this.riskRepository = riskRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    // =========================================================
    // CREATE ANNUAL AUDIT PLAN
    // AUDIT MANAGER ONLY
    // =========================================================

    @Override
    public AnnualAuditPlanResponseDTO createPlan(
            AnnualAuditPlanRequestDTO requestDTO) {

        User manager = getLoggedInUser();

        checkAuditManager(manager);

        // =====================================================
        // DEPARTMENT CHECK
        // =====================================================

        if (!sameDepartment(
                requestDTO.getDepartment(),
                manager.getDepartment())) {

            throw new RuntimeException(
                    "You can create plans only for your department");
        }

        // =====================================================
        // DUPLICATE CHECK
        // =====================================================

        if (planRepository.existsByPlanYearAndDepartment(
                requestDTO.getAuditYear(),
                requestDTO.getDepartment())) {

            throw new RuntimeException(
                    "Annual Audit Plan already exists for this department and year");
        }

        // =====================================================
        // FIND RISK
        // =====================================================

        Risk risk = riskRepository
                .findById(requestDTO.getRiskId())
                .orElseThrow(
                        () -> new RuntimeException("Risk not found")
                );

        // =====================================================
        // RISK DEPARTMENT CHECK
        // =====================================================

        if (!sameDepartment(
                risk.getDepartment(),
                manager.getDepartment())) {

            throw new RuntimeException(
                    "Selected risk does not belong to your department");
        }

        // =====================================================
        // CREATE PLAN
        // =====================================================

        AnnualAuditPlan plan = new AnnualAuditPlan();

        plan.setPlanName(
                requestDTO.getPlanName()
        );

        plan.setDescription(
                requestDTO.getDescription()
        );

        plan.setPlanYear(
                requestDTO.getAuditYear()
        );

        plan.setDepartment(
                requestDTO.getDepartment()
        );

        plan.setPlannedStartDate(
                requestDTO.getPlannedStartDate()
        );

        plan.setPlannedEndDate(
                requestDTO.getPlannedEndDate()
        );

        plan.setBusinessUnit(
                requestDTO.getBusinessUnit()
        );

        plan.setProcessName(
                requestDTO.getProcessName()
        );

        plan.setRemarks(
                requestDTO.getRemarks()
        );

        // Logged-in Audit Manager
        plan.setAuditManager(manager);

        // Add risk
        plan.getRisks().add(risk);

        // =====================================================
        // STATUS
        // =====================================================

        if (requestDTO.getStatus() != null) {

            plan.setStatus(
                    requestDTO.getStatus()
            );

        } else {

            plan.setStatus(
                    AnnualAuditPlanStatus.DRAFT
            );
        }

        AnnualAuditPlan savedPlan =
                planRepository.save(plan);

        return mapToDTO(savedPlan);
    }

    // =========================================================
    // UPDATE PLAN
    // AUDIT MANAGER ONLY
    // =========================================================

    @Override
    public AnnualAuditPlanResponseDTO updatePlan(
            Long id,
            AnnualAuditPlanRequestDTO requestDTO) {

        AnnualAuditPlan plan =
                planRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Annual Audit Plan not found")
                        );

        User manager = getLoggedInUser();

        checkAuditManager(manager);

        // =====================================================
        // ONLY CREATOR CAN UPDATE
        // =====================================================

        if (plan.getAuditManager() == null
                || !plan.getAuditManager()
                        .getId()
                        .equals(manager.getId())) {

            throw new RuntimeException(
                    "You can update only your own audit plans");
        }

        // =====================================================
        // DEPARTMENT CHECK
        // =====================================================

        if (!sameDepartment(
                requestDTO.getDepartment(),
                manager.getDepartment())) {

            throw new RuntimeException(
                    "You can update plans only for your department");
        }

        // =====================================================
        // UPDATE BASIC INFORMATION
        // =====================================================

        plan.setPlanName(
                requestDTO.getPlanName()
        );

        plan.setDescription(
                requestDTO.getDescription()
        );

        plan.setPlanYear(
                requestDTO.getAuditYear()
        );

        plan.setDepartment(
                requestDTO.getDepartment()
        );

        plan.setPlannedStartDate(
                requestDTO.getPlannedStartDate()
        );

        plan.setPlannedEndDate(
                requestDTO.getPlannedEndDate()
        );

        plan.setBusinessUnit(
                requestDTO.getBusinessUnit()
        );

        plan.setProcessName(
                requestDTO.getProcessName()
        );

        plan.setRemarks(
                requestDTO.getRemarks()
        );

        // =====================================================
        // STATUS
        // =====================================================

        if (requestDTO.getStatus() != null) {

            plan.setStatus(
                    requestDTO.getStatus()
            );
        }

        // =====================================================
        // UPDATE RISK
        // =====================================================

        if (requestDTO.getRiskId() != null) {

            Risk risk = riskRepository
                    .findById(requestDTO.getRiskId())
                    .orElseThrow(
                            () -> new RuntimeException(
                                    "Risk not found")
                    );

            if (!sameDepartment(
                    risk.getDepartment(),
                    manager.getDepartment())) {

                throw new RuntimeException(
                        "Selected risk does not belong to your department");
            }

            plan.getRisks().clear();

            plan.getRisks().add(risk);
        }

        AnnualAuditPlan updatedPlan =
                planRepository.save(plan);

        return mapToDTO(updatedPlan);
    }

    // =========================================================
    // GET PLAN BY ID
    // =========================================================

    @Override
    public AnnualAuditPlanResponseDTO getPlanById(
            Long id) {

        AnnualAuditPlan plan =
                planRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Annual Audit Plan not found")
                        );

        return mapToDTO(plan);
    }

    // =========================================================
    // GET PLAN BY PLAN ID
    // =========================================================

    @Override
    public AnnualAuditPlanResponseDTO getPlanByPlanId(
            String planId) {

        AnnualAuditPlan plan =
                planRepository.findByPlanId(planId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Annual Audit Plan not found")
                        );

        return mapToDTO(plan);
    }

    // =========================================================
    // GET ALL PLANS
    // CAE CAN SEE ALL
    // =========================================================

    @Override
    public List<AnnualAuditPlanResponseDTO> getAllPlans() {

        return planRepository
                .findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET MY PLANS
    // AUDIT MANAGER
    // =========================================================

    @Override
    public List<AnnualAuditPlanResponseDTO> getMyPlans() {

        User manager = getLoggedInUser();

        return planRepository
                .findByAuditManager(manager)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET PLANS BY YEAR
    // =========================================================

    @Override
    public List<AnnualAuditPlanResponseDTO> getPlansByYear(
            Integer year) {

        return planRepository
                .findByPlanYear(year)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET PLANS BY STATUS
    // =========================================================

    @Override
    public List<AnnualAuditPlanPlanResponseDTO> getPlansByStatus(
            AnnualAuditPlanStatus status) {

        return planRepository
                .findByStatus(status)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // =========================================================
    // DELETE PLAN
    // AUDIT MANAGER ONLY
    // =========================================================

    @Override
    public void deletePlan(Long id) {

        AnnualAuditPlan plan =
                planRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Annual Audit Plan not found")
                        );

        User manager = getLoggedInUser();

        checkAuditManager(manager);

        // =====================================================
        // ONLY CREATOR CAN DELETE
        // =====================================================

        if (plan.getAuditManager() == null
                || !plan.getAuditManager()
                        .getId()
                        .equals(manager.getId())) {

            throw new RuntimeException(
                    "You can delete only your own audit plans");
        }

        planRepository.delete(plan);
    }

    // =========================================================
    // UPDATE PLAN STATUS
    //
    // AUDIT MANAGER:
    // DRAFT -> SUBMITTED
    // APPROVED -> IN_PROGRESS
    //
    // CAE:
    // SUBMITTED -> APPROVED
    // SUBMITTED -> REJECTED
    // IN_PROGRESS -> COMPLETED
    // =========================================================

    @Override
    public AnnualAuditPlanResponseDTO updatePlanStatus(
            Long id,
            AnnualAuditPlanStatus status,
            String rejectionReason) {

        AnnualAuditPlan plan =
                planRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Annual Audit Plan not found")
                        );

        User loggedInUser = getLoggedInUser();

        // =====================================================
        // STATUS NULL CHECK
        // =====================================================

        if (status == null) {

            throw new RuntimeException(
                    "Status cannot be null");
        }

        // =====================================================
        // GET CURRENT ROLE
        // =====================================================

        String roleName = getRoleName(loggedInUser);

        // =====================================================
        // AUDIT MANAGER
        // =====================================================

        if ("AUDIT_MANAGER".equalsIgnoreCase(roleName)) {

            updateStatusAsAuditManager(
                    plan,
                    loggedInUser,
                    status
            );
        }

        // =====================================================
        // CAE
        // =====================================================

        else if ("CHIEF_AUDIT_EXECUTIVE".equalsIgnoreCase(roleName)
                || "CAE".equalsIgnoreCase(roleName)) {

            updateStatusAsCAE(
                    plan,
                    status,
                    rejectionReason
            );
        }

        // =====================================================
        // OTHER ROLES
        // =====================================================

        else {

            throw new RuntimeException(
                    "Only Audit Manager or Chief Audit Executive can update annual audit plan status");
        }

        // =====================================================
        // SAVE
        // =====================================================

        AnnualAuditPlan updatedPlan =
                planRepository.save(plan);

        return mapToDTO(updatedPlan);
    }

    // =========================================================
    // AUDIT MANAGER STATUS UPDATE
    // =========================================================

    private void updateStatusAsAuditManager(
            AnnualAuditPlan plan,
            User manager,
            AnnualAuditPlanStatus newStatus) {

        // =====================================================
        // ONLY CREATOR CAN CHANGE STATUS
        // =====================================================

        if (plan.getAuditManager() == null
                || !plan.getAuditManager()
                        .getId()
                        .equals(manager.getId())) {

            throw new RuntimeException(
                    "You can update status only for your own audit plans");
        }

        AnnualAuditPlanStatus currentStatus =
                plan.getStatus();

        if (currentStatus == null) {

            throw new RuntimeException(
                    "Current plan status is null");
        }

        // =====================================================
        // DRAFT -> SUBMITTED
        // =====================================================

        if (currentStatus == AnnualAuditPlanStatus.DRAFT
                && newStatus == AnnualAuditPlanStatus.SUBMITTED) {

            plan.setStatus(
                    AnnualAuditPlanStatus.SUBMITTED
            );

            plan.setRejectionReason(null);

            return;
        }

        // =====================================================
        // APPROVED -> IN_PROGRESS
        // =====================================================

        if (currentStatus == AnnualAuditPlanStatus.APPROVED
                && newStatus == AnnualAuditPlanStatus.IN_PROGRESS) {

            plan.setStatus(
                    AnnualAuditPlanStatus.IN_PROGRESS
            );

            plan.setRejectionReason(null);

            return;
        }

        // =====================================================
        // REJECTED -> SUBMITTED
        //
        // After CAE rejection, Audit Manager can correct
        // the plan and submit again.
        // =====================================================

        if (currentStatus == AnnualAuditPlanStatus.REJECTED
                && newStatus == AnnualAuditPlanStatus.SUBMITTED) {

            plan.setStatus(
                    AnnualAuditPlanStatus.SUBMITTED
            );

            plan.setRejectionReason(null);

            return;
        }

        // =====================================================
        // SAME STATUS
        // =====================================================

        if (currentStatus == newStatus) {

            throw new RuntimeException(
                    "Plan is already in " + newStatus + " status");
        }

        // =====================================================
        // INVALID TRANSITION
        // =====================================================

        throw new RuntimeException(
                "Audit Manager cannot change plan status from "
                        + currentStatus
                        + " to "
                        + newStatus);
    }

    // =========================================================
    // CAE STATUS UPDATE
    //
    // SUBMITTED -> APPROVED
    // SUBMITTED -> REJECTED
    // IN_PROGRESS -> COMPLETED
    // =========================================================

    private void updateStatusAsCAE(
            AnnualAuditPlan plan,
            AnnualAuditPlanStatus newStatus,
            String rejectionReason) {

        AnnualAuditPlanStatus currentStatus =
                plan.getStatus();

        if (currentStatus == null) {

            throw new RuntimeException(
                    "Current plan status is null");
        }

        // =====================================================
        // SUBMITTED -> APPROVED
        // =====================================================

        if (currentStatus == AnnualAuditPlanStatus.SUBMITTED
                && newStatus == AnnualAuditPlanStatus.APPROVED) {

            plan.setStatus(
                    AnnualAuditPlanStatus.APPROVED
            );

            plan.setRejectionReason(null);

            return;
        }

        // =====================================================
        // SUBMITTED -> REJECTED
        // =====================================================

        if (currentStatus == AnnualAuditPlanStatus.SUBMITTED
                && newStatus == AnnualAuditPlanStatus.REJECTED) {

            if (rejectionReason == null
                    || rejectionReason.trim().isEmpty()) {

                throw new RuntimeException(
                        "Rejection reason is required");
            }

            plan.setStatus(
                    AnnualAuditPlanStatus.REJECTED
            );

            plan.setRejectionReason(
                    rejectionReason.trim()
            );

            return;
        }

        // =====================================================
        // IN_PROGRESS -> COMPLETED
        // =====================================================

        if (currentStatus == AnnualAuditPlanStatus.IN_PROGRESS
                && newStatus == AnnualAuditPlanStatus.COMPLETED) {

            plan.setStatus(
                    AnnualAuditPlanStatus.COMPLETED
            );

            plan.setRejectionReason(null);

            return;
        }

        // =====================================================
        // SAME STATUS
        // =====================================================

        if (currentStatus == newStatus) {

            throw new RuntimeException(
                    "Plan is already in " + newStatus + " status");
        }

        // =====================================================
        // INVALID CAE TRANSITION
        // =====================================================

        throw new RuntimeException(
                "CAE cannot change plan status from "
                        + currentStatus
                        + " to "
                        + newStatus);
    }

    // =========================================================
    // GET LOGGED-IN USER
    // =========================================================

    private User getLoggedInUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null
                || authentication.getName() == null
                || !authentication.isAuthenticated()) {

            throw new RuntimeException(
                    "User is not authenticated");
        }

        String email =
                authentication.getName();

        return userRepository
                .findByEmail(email)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found")
                );
    }

    // =========================================================
    // GET ROLE NAME
    // ROLE IS ENTITY
    // =========================================================

    private String getRoleName(User user) {

        if (user == null) {

            throw new RuntimeException(
                    "User is null");
        }

        Role role = user.getRole();

        if (role == null
                || role.getName() == null
                || role.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "User role is not assigned");
        }

        return role.getName().trim();
    }

    // =========================================================
    // CHECK AUDIT MANAGER
    // =========================================================

    private void checkAuditManager(User user) {

        String roleName =
                getRoleName(user);

        if (!"AUDIT_MANAGER".equalsIgnoreCase(roleName)) {

            throw new RuntimeException(
                    "Only Audit Manager can perform this operation");
        }
    }

    // =========================================================
    // GET ROLE BY NAME
    // =========================================================

    private Role getRoleByName(String roleName) {

        return roleRepository
                .findByName(roleName)
                .orElseThrow(
                        () -> new RuntimeException(
                                roleName + " role not found")
                );
    }

    // =========================================================
    // COMPARE DEPARTMENTS
    // DEPARTMENT IS ENTITY
    // =========================================================

    private boolean sameDepartment(
            Department department1,
            Department department2) {

        if (department1 == null
                || department2 == null) {

            return false;
        }

        if (department1.getId() == null
                || department2.getId() == null) {

            return false;
        }

        return department1.getId()
                .equals(department2.getId());
    }

    // =========================================================
    // ENTITY -> RESPONSE DTO
    // =========================================================

    private AnnualAuditPlanResponseDTO mapToDTO(
            AnnualAuditPlan plan) {

        AnnualAuditPlanResponseDTO dto =
                new AnnualAuditPlanResponseDTO();

        // =====================================================
        // BASIC DETAILS
        // =====================================================

        dto.setId(
                plan.getId()
        );

        dto.setPlanId(
                plan.getPlanId()
        );

        dto.setPlanYear(
                plan.getPlanYear()
        );

        dto.setDepartment(
                plan.getDepartment()
        );

        dto.setPlanName(
                plan.getPlanName()
        );

        dto.setDescription(
                plan.getDescription()
        );

        dto.setStatus(
                plan.getStatus()
        );

        dto.setPlannedStartDate(
                plan.getPlannedStartDate()
        );

        dto.setPlannedEndDate(
                plan.getPlannedEndDate()
        );

        dto.setBusinessUnit(
                plan.getBusinessUnit()
        );

        dto.setProcessName(
                plan.getProcessName()
        );

        dto.setRemarks(
                plan.getRemarks()
        );

        dto.setRejectionReason(
                plan.getRejectionReason()
        );

        // =====================================================
        // AUDIT MANAGER
        // =====================================================

        if (plan.getAuditManager() != null) {

            dto.setAuditManagerId(
                    plan.getAuditManager().getId()
            );

            if (plan.getAuditManager()
                    .getProfile() != null) {

                String firstName =
                        plan.getAuditManager()
                                .getProfile()
                                .getFirstName();

                String lastName =
                        plan.getAuditManager()
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

                dto.setAuditManagerName(
                        fullName.trim()
                );

            } else {

                dto.setAuditManagerName(
                        plan.getAuditManager().getEmail()
                );
            }
        }

        // =====================================================
        // RISKS
        // =====================================================

        if (plan.getRisks() != null) {

            List<Long> riskIds =
                    plan.getRisks()
                            .stream()
                            .map(Risk::getId)
                            .collect(Collectors.toList());

            dto.setRiskIds(
                    riskIds
            );
        }

        // =====================================================
        // DATES
        // =====================================================

        dto.setCreatedAt(
                plan.getCreatedAt()
        );

        dto.setUpdatedAt(
                plan.getUpdatedAt()
        );

        return dto;
    }
}