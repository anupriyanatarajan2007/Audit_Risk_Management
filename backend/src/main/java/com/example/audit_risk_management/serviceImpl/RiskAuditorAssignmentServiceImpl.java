package com.example.audit_risk_management.serviceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.audit_risk_management.dto.RiskAuditorAssignmentRequest;
import com.example.audit_risk_management.dto.RiskAuditorAssignmentResponse;
import com.example.audit_risk_management.enums.AssignmentPriority;
import com.example.audit_risk_management.enums.AssignmentStatus;
import com.example.audit_risk_management.model.Risk;
import com.example.audit_risk_management.model.RiskAuditorAssignment;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.RiskAuditorAssignmentRepository;
import com.example.audit_risk_management.repository.RiskRepository;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.service.RiskAuditorAssignmentService;

@Service
@Transactional
public class RiskAuditorAssignmentServiceImpl
        implements RiskAuditorAssignmentService {

    private final RiskAuditorAssignmentRepository assignmentRepository;
    private final RiskRepository riskRepository;
    private final UserRepo userRepository;

    public RiskAuditorAssignmentServiceImpl(
            RiskAuditorAssignmentRepository assignmentRepository,
            RiskRepository riskRepository,
            UserRepo userRepository) {

        this.assignmentRepository = assignmentRepository;
        this.riskRepository = riskRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CREATE
    // =========================================================

    @Override
    public RiskAuditorAssignmentResponse createAssignment(
        RiskAuditorAssignmentRequest request) {

    if (request == null) {
        throw new RuntimeException(
                "Assignment request cannot be null");
    }

    if (request.getRiskId() == null ||
            request.getRiskId().isBlank()) {

        throw new RuntimeException(
                "Risk ID is required");
    }

    if (request.getEmployeeId() == null ||
            request.getEmployeeId().isBlank()) {

        throw new RuntimeException(
                "Auditor employee ID is required");
    }

    // -----------------------------------------------------
    // Find risk
    // -----------------------------------------------------

    Risk risk = riskRepository
            .findByRiskId(request.getRiskId())
            .orElseThrow(() ->
                    new RuntimeException(
                            "Risk not found with risk ID: "
                                    + request.getRiskId()));

    // -----------------------------------------------------
    // Find auditor
    // -----------------------------------------------------

    User auditor = userRepository
            .findByEmployeeId(request.getEmployeeId())
            .orElseThrow(() ->
                    new RuntimeException(
                            "Employee not found with employee ID: "
                                    + request.getEmployeeId()));

    // -----------------------------------------------------
    // Validate auditor role
    // -----------------------------------------------------

    if (auditor.getRole() == null ||
            !"INTERNAL_AUDITOR".equalsIgnoreCase(
                    auditor.getRole().getName())) {

        throw new RuntimeException(
                "Selected employee is not an Internal Auditor");
    }

    // -----------------------------------------------------
    // Get authenticated user
    // -----------------------------------------------------

    Authentication authentication =
            SecurityContextHolder.getContext()
                    .getAuthentication();

    if (authentication == null ||
            authentication.getName() == null ||
            authentication.getName().isBlank()) {

        throw new RuntimeException(
                "Authenticated user not found");
    }

    String authenticatedEmail =
            authentication.getName();

    User assignedByUser = userRepository
            .findByEmail(authenticatedEmail)
            .orElseThrow(() ->
                    new RuntimeException(
                            "Authenticated user not found: "
                                    + authenticatedEmail));

    // -----------------------------------------------------
    // Validate assigning user's role
    // -----------------------------------------------------

    if (assignedByUser.getRole() == null) {

        throw new RuntimeException(
                "Authenticated user role is not assigned");
    }

    String assignedByRole =
            assignedByUser.getRole().getName();

    if (!"AUDIT_MANAGER".equalsIgnoreCase(assignedByRole)
            && !"CHIEF_AUDIT_EXECUTIVE"
                    .equalsIgnoreCase(assignedByRole)) {

        throw new RuntimeException(
                "Only an Audit Manager or Chief Audit Executive "
                        + "can assign auditors");
    }

    // -----------------------------------------------------
    // Validate department
    // -----------------------------------------------------

    if (auditor.getDepartment() != risk.getDepartment()) {

        throw new RuntimeException(
                "Auditor department ("
                        + auditor.getDepartment()
                        + ") does not match risk department ("
                        + risk.getDepartment()
                        + ")");
    }

    // -----------------------------------------------------
    // Prevent duplicate assignment
    // -----------------------------------------------------

    boolean alreadyAssigned =
            assignmentRepository
                    .existsByRisk_RiskIdAndAuditor_EmployeeId(
                            request.getRiskId(),
                            request.getEmployeeId());

    if (alreadyAssigned) {

        throw new RuntimeException(
                "This auditor is already assigned to this risk");
    }

    // -----------------------------------------------------
    // Validate dates
    // -----------------------------------------------------

    if (request.getStartDate() != null &&
            request.getDueDate() != null &&
            request.getDueDate()
                    .isBefore(request.getStartDate())) {

        throw new RuntimeException(
                "Due date cannot be before start date");
    }

    // -----------------------------------------------------
    // Create assignment
    // -----------------------------------------------------

    RiskAuditorAssignment assignment =
            new RiskAuditorAssignment();

    assignment.setRisk(risk);
    assignment.setAuditor(auditor);
    assignment.setAssignedBy(assignedByUser);

    assignment.setStartDate(
            request.getStartDate());

    assignment.setDueDate(
            request.getDueDate());

    if (request.getPriority() != null) {

        assignment.setPriority(
                request.getPriority());

    } else {

        assignment.setPriority(
                AssignmentPriority.MEDIUM);
    }

    assignment.setStatus(
            AssignmentStatus.ASSIGNED);

    assignment.setComments(
            request.getComments());

    // -----------------------------------------------------
    // Save assignment
    // -----------------------------------------------------

    RiskAuditorAssignment saved =
            assignmentRepository.save(assignment);

    return convertToResponse(saved);
}
    // =========================================================
    // GET ALL
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<RiskAuditorAssignmentResponse> getAllAssignments() {

        return assignmentRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public RiskAuditorAssignmentResponse getAssignmentById(
            Long id) {

        RiskAuditorAssignment assignment =
                assignmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assignment not found with ID: "
                                                + id));

        return convertToResponse(assignment);
    }

    // =========================================================
    // GET BY RISK ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<RiskAuditorAssignmentResponse> getAssignmentsByRiskId(
            String riskId) {

        if (riskId == null || riskId.isBlank()) {

            throw new RuntimeException(
                    "Risk ID is required");
        }

        return assignmentRepository
                .findByRisk_RiskId(riskId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET BY AUDITOR
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<RiskAuditorAssignmentResponse> getAssignmentsByAuditor(
            String employeeId) {

        if (employeeId == null || employeeId.isBlank()) {

            throw new RuntimeException(
                    "Employee ID is required");
        }

        return assignmentRepository
                .findByAuditor_EmployeeId(employeeId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET BY STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<RiskAuditorAssignmentResponse> getAssignmentsByStatus(
            AssignmentStatus status) {

        if (status == null) {

            throw new RuntimeException(
                    "Status is required");
        }

        return assignmentRepository
                .findByStatus(status)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET BY AUDITOR + STATUS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<RiskAuditorAssignmentResponse>
    getAssignmentsByAuditorAndStatus(
            String employeeId,
            AssignmentStatus status) {

        if (employeeId == null || employeeId.isBlank()) {

            throw new RuntimeException(
                    "Employee ID is required");
        }

        if (status == null) {

            throw new RuntimeException(
                    "Status is required");
        }

        return assignmentRepository
                .findByAuditor_EmployeeIdAndStatus(
                        employeeId,
                        status)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET BY ASSIGNED BY
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<RiskAuditorAssignmentResponse>
    getAssignmentsByAssignedBy(
            String employeeId) {

        if (employeeId == null || employeeId.isBlank()) {

            throw new RuntimeException(
                    "Employee ID is required");
        }

        return assignmentRepository
                .findByAssignedBy_EmployeeId(employeeId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    @Override
    public RiskAuditorAssignmentResponse updateStatus(
            Long id,
            AssignmentStatus status) {

        if (status == null) {

            throw new RuntimeException(
                    "Status is required");
        }

        RiskAuditorAssignment assignment =
                assignmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assignment not found with ID: "
                                                + id));

        assignment.setStatus(status);

        RiskAuditorAssignment updated =
                assignmentRepository.save(assignment);

        return convertToResponse(updated);
    }

    // =========================================================
    // UPDATE PRIORITY
    // =========================================================

    @Override
    public RiskAuditorAssignmentResponse updatePriority(
            Long id,
            AssignmentPriority priority) {

        if (priority == null) {

            throw new RuntimeException(
                    "Priority is required");
        }

        RiskAuditorAssignment assignment =
                assignmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Assignment not found with ID: "
                                                + id));

        assignment.setPriority(priority);

        RiskAuditorAssignment updated =
                assignmentRepository.save(assignment);

        return convertToResponse(updated);
    }

    // =========================================================
    // DELETE
    // =========================================================

    @Override
    public void deleteAssignment(Long id) {

        if (!assignmentRepository.existsById(id)) {

            throw new RuntimeException(
                    "Assignment not found with ID: " + id);
        }

        assignmentRepository.deleteById(id);
    }

    // =========================================================
    // ENTITY -> RESPONSE
    // =========================================================

    private RiskAuditorAssignmentResponse convertToResponse(
            RiskAuditorAssignment assignment) {

        RiskAuditorAssignmentResponse response =
                new RiskAuditorAssignmentResponse();

        response.setId(
                assignment.getId());

        if (assignment.getRisk() != null) {

            response.setRiskId(
                    assignment.getRisk().getRiskId());

            response.setRiskTitle(
                    assignment.getRisk().getTitle());
        }

        if (assignment.getAuditor() != null) {

            response.setEmployeeId(
                    assignment.getAuditor()
                            .getEmployeeId());

            response.setAuditorEmail(
                    assignment.getAuditor()
                            .getEmail());
        }

        if (assignment.getAssignedBy() != null) {

            response.setAssignedByEmployeeId(
                    assignment.getAssignedBy()
                            .getEmployeeId());
        }

        response.setAssignedAt(
                assignment.getAssignedAt());

        response.setStartDate(
                assignment.getStartDate());

        response.setDueDate(
                assignment.getDueDate());

        response.setStatus(
                assignment.getStatus());

        response.setPriority(
                assignment.getPriority());

        response.setComments(
                assignment.getComments());

        return response;
    }
}