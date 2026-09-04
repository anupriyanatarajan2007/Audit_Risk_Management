package com.example.audit_risk_management.serviceImpl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.audit_risk_management.dto.AuditeeAssignmentRequestDTO;
import com.example.audit_risk_management.dto.AuditeeAssignmentResponseDTO;
import com.example.audit_risk_management.enums.AssignmentStatus;
import com.example.audit_risk_management.model.Audit;
import com.example.audit_risk_management.model.AuditeeAssignment;
import com.example.audit_risk_management.model.Role;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.AuditRepository;
import com.example.audit_risk_management.repository.AuditeeAssignmentRepository;
import com.example.audit_risk_management.repository.ProfileRepository;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.service.AuditeeAssignmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AuditeeAssignmentServiceImpl
        implements AuditeeAssignmentService {
    
    @Autowired
    private AuditeeAssignmentRepository auditeeAssignmentRepository;

    @Autowired
    private AuditRepository auditRepository;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    ProfileRepository profileRepository;


    // ============================================================
    // ASSIGN AUDITEE
    // ============================================================

    @Override
    public AuditeeAssignmentResponseDTO assignAuditee(
            AuditeeAssignmentRequestDTO requestDTO) {
    
        // ============================================================
        // 1. BASIC VALIDATION
        // ============================================================
    
        if (requestDTO == null) {
            throw new RuntimeException(
                    "Assignment request cannot be null");
        }
    
        if (requestDTO.getAuditId() == null) {
            throw new RuntimeException(
                    "Cannot assign auditee. Audit has not been created for this risk.");
        }
    
        if (requestDTO.getAuditeeId() == null) {
            throw new RuntimeException(
                    "Auditee must be selected");
        }
    
        if (requestDTO.getStartDate() == null ||
                requestDTO.getDueDate() == null) {
    
            throw new RuntimeException(
                    "Start date and due date are required");
        }
    
        // ============================================================
        // 2. VALIDATE DATES
        // ============================================================
    
        if (requestDTO.getDueDate()
                .isBefore(requestDTO.getStartDate())) {
    
            throw new RuntimeException(
                    "Due date cannot be before start date");
        }
    
        // ============================================================
        // 3. FIND AUDIT
        // ============================================================
    
        Audit audit = auditRepository
                .findById(requestDTO.getAuditId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Cannot assign auditee. Audit has not been created for this risk."
                        ));
    
        // ============================================================
        // 4. AUDIT EXISTS
        // Continue assignment only from here
        // ============================================================
    
        // Find Auditee
        User auditee = userRepository
                .findById(requestDTO.getAuditeeId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with ID: "
                                        + requestDTO.getAuditeeId()));
    
        // ============================================================
        // 5. VALIDATE AUDITEE ROLE
        // ============================================================
    
        if (auditee.getRole() == null ||
                !"AUDITEE".equalsIgnoreCase(
                        auditee.getRole().getName())) {
    
            throw new RuntimeException(
                    "Selected user is not an AUDITEE");
        }
    
        // ============================================================
        // 6. GET LOGGED-IN USER
        // ============================================================
    
        User assignedBy = getLoggedInUser();
    
        // ============================================================
        // 7. VALIDATE AUDIT MANAGER
        // ============================================================
    
        if (assignedBy.getRole() == null ||
                !"AUDIT_MANAGER".equalsIgnoreCase(
                        assignedBy.getRole().getName())) {
    
            throw new RuntimeException(
                    "Only Audit Manager can assign an auditee");
        }
    
        // ============================================================
        // 8. DUPLICATE CHECK
        // ============================================================
    
        boolean alreadyAssigned =
                auditeeAssignmentRepository
                        .existsByAuditIdAndAuditeeId(
                                requestDTO.getAuditId(),
                                requestDTO.getAuditeeId());
    
        if (alreadyAssigned) {
    
            throw new RuntimeException(
                    "This auditee is already assigned to this audit");
        }
    
        // ============================================================
        // 9. CREATE ASSIGNMENT
        // ============================================================
    
        AuditeeAssignment assignment =
                new AuditeeAssignment();
    
        assignment.setAudit(audit);
        assignment.setAuditee(auditee);
        assignment.setAssignedBy(assignedBy);
    
        assignment.setAssignedDate(LocalDate.now());
        assignment.setStartDate(requestDTO.getStartDate());
        assignment.setDueDate(requestDTO.getDueDate());
    
        assignment.setStatus(
                AssignmentStatus.ASSIGNED);
    
        // ============================================================
        // 10. SAVE
        // ============================================================
    
        AuditeeAssignment savedAssignment =
                auditeeAssignmentRepository.save(assignment);
    
        // ============================================================
        // 11. RESPONSE
        // ============================================================
    
        return mapToResponseDTO(savedAssignment);
    }

    // ============================================================
    // GET ALL ASSIGNMENTS
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<AuditeeAssignmentResponseDTO> getAllAssignments() {

        return auditeeAssignmentRepository
                .findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }


    // ============================================================
    // GET ASSIGNMENTS BY AUDIT
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<AuditeeAssignmentResponseDTO> getAssignmentsByAudit(
            Long auditId) {

        // Check audit exists
        if (!auditRepository.existsById(auditId)) {

            throw new RuntimeException(
                    "Audit not found with ID: " + auditId);
        }

        return auditeeAssignmentRepository
                .findByAuditId(auditId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }


    // ============================================================
    // GET ASSIGNMENTS BY AUDITEE
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<AuditeeAssignmentResponseDTO> getAssignmentsByAuditee(
            Long auditeeId) {

        if (!userRepository.existsById(auditeeId)) {

            throw new RuntimeException(
                    "User not found with ID: " + auditeeId);
        }

        return auditeeAssignmentRepository
                .findByAuditeeId(auditeeId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }


    // ============================================================
    // GET ASSIGNMENTS BY ASSIGNED BY
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<AuditeeAssignmentResponseDTO> getAssignmentsByAssignedBy(
            Long assignedById) {

        if (!userRepository.existsById(assignedById)) {

            throw new RuntimeException(
                    "User not found with ID: " + assignedById);
        }

        return auditeeAssignmentRepository
                .findByAssignedById(assignedById)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }


    // ============================================================
    // GET ASSIGNMENT BY ID
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public AuditeeAssignmentResponseDTO getAssignmentById(
            Long id) {

        AuditeeAssignment assignment =
                auditeeAssignmentRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Auditee assignment not found with ID: "
                                                + id));

        return mapToResponseDTO(assignment);
    }


    // ============================================================
    // UPDATE STATUS
    // ============================================================

    @Override
    public AuditeeAssignmentResponseDTO updateStatus(
            Long id,
            String status) {

        AuditeeAssignment assignment =
                auditeeAssignmentRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Auditee assignment not found with ID: "
                                                + id));

        AssignmentStatus newStatus;

        try {

            newStatus =
                    AssignmentStatus.valueOf(
                            status.toUpperCase());

        } catch (IllegalArgumentException e) {

            throw new RuntimeException(
                    "Invalid assignment status: " + status);
        }

        assignment.setStatus(newStatus);

        AuditeeAssignment updated =
                auditeeAssignmentRepository.save(assignment);

        return mapToResponseDTO(updated);
    }


    // ============================================================
    // DELETE ASSIGNMENT
    // ============================================================

    @Override
    public void deleteAssignment(Long id) {

        AuditeeAssignment assignment =
                auditeeAssignmentRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Auditee assignment not found with ID: "
                                                + id));

        auditeeAssignmentRepository.delete(assignment);
    }


    // ============================================================
    // GET LOGGED-IN USER
    // ============================================================

    private User getLoggedInUser() {

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

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Logged-in user not found"));
    }


    // ============================================================
    // MAP ENTITY → RESPONSE DTO
    // ============================================================

    private AuditeeAssignmentResponseDTO mapToResponseDTO(
            AuditeeAssignment assignment) {

        AuditeeAssignmentResponseDTO response =
                new AuditeeAssignmentResponseDTO();


        // --------------------------------------------------------
        // Assignment
        // --------------------------------------------------------

        response.setId(
                assignment.getId());


        // --------------------------------------------------------
        // Audit
        // --------------------------------------------------------

        if (assignment.getAudit() != null) {

            response.setAuditId(
                    assignment.getAudit().getId());

            response.setAuditName(
                    assignment.getAudit().getAuditName());
        }


        // --------------------------------------------------------
        // Auditee
        // --------------------------------------------------------

        if (assignment.getAuditee() != null) {

            User auditee =
                    assignment.getAuditee();

            response.setAuditeeId(
                    auditee.getId());

            response.setAuditeeEmail(
                    auditee.getEmail());

            response.setAuditeeEmployeeId(
                    auditee.getEmployeeId());

            response.setAuditeeName(
                    getUserName(auditee));
        }


        // --------------------------------------------------------
        // Assigned By
        // --------------------------------------------------------

        if (assignment.getAssignedBy() != null) {

            User assignedBy =
                    assignment.getAssignedBy();

            response.setAssignedById(
                    assignedBy.getId());

            response.setAssignedByName(
                    getUserName(assignedBy));
        }


        // --------------------------------------------------------
        // Assignment Details
        // --------------------------------------------------------

        response.setAssignedDate(
                assignment.getAssignedDate());

        response.setStartDate(
                assignment.getStartDate());

        response.setDueDate(
                assignment.getDueDate());

        response.setStatus(
                assignment.getStatus());


        // --------------------------------------------------------
        // Timestamps
        // --------------------------------------------------------

        response.setCreatedAt(
                assignment.getCreatedAt());

        response.setUpdatedAt(
                assignment.getUpdatedAt());


        return response;
    }


    // ============================================================
    // USER NAME
    // ============================================================

    private String getUserName(User user) {


        return profileRepository.findByUser(user)
        .map(profile->{
            String firstName=profile.getFirstName();
            String lastName=profile.getLastName();

            if (firstName == null) {
                firstName = "";
            }

            if (lastName == null) {
                lastName = "";
            }

            String fullName =
            (firstName + " " + lastName).trim();

    if (fullName.isEmpty()) {
        return user.getEmail();
    }

    return fullName;
        }).orElse(user.getEmail());
        
    }
}