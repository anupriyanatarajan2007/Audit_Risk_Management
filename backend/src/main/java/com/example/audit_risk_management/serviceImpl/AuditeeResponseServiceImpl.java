package com.example.audit_risk_management.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.audit_risk_management.dto.AuditeeResponseRequestDTO;
import com.example.audit_risk_management.dto.AuditeeResponseResponseDTO;
import com.example.audit_risk_management.enums.AuditeeResponseStatus;
import com.example.audit_risk_management.model.AuditeeResponse;
import com.example.audit_risk_management.model.Finding;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.AuditeeResponseRepository;
import com.example.audit_risk_management.repository.FindingRepository;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.service.AuditeeResponseService;

@Service
@Transactional
public class AuditeeResponseServiceImpl
        implements AuditeeResponseService {

    @Autowired
    private AuditeeResponseRepository auditeeResponseRepository;

    @Autowired
    private FindingRepository findingRepository;

    @Autowired
    private UserRepo userRepository;


    // ============================================================
    // SUBMIT RESPONSE
    // ============================================================

    @Override
    public AuditeeResponseResponseDTO submitResponse(
            AuditeeResponseRequestDTO requestDTO) {

        // --------------------------------------------------------
        // Find Finding
        // --------------------------------------------------------

        Finding finding = findingRepository
                .findById(requestDTO.getFindingId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Finding not found with ID: "
                                        + requestDTO.getFindingId()
                        )
                );


        // --------------------------------------------------------
        // Find Auditee
        // --------------------------------------------------------

        User auditee = userRepository
                .findById(requestDTO.getAuditeeId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Auditee not found with ID: "
                                        + requestDTO.getAuditeeId()
                        )
                );


        // --------------------------------------------------------
        // Prevent duplicate response
        // --------------------------------------------------------

        if (auditeeResponseRepository
                .existsByFindingIdAndAuditeeId(
                        requestDTO.getFindingId(),
                        requestDTO.getAuditeeId())) {

            throw new RuntimeException(
                    "Response already submitted for this finding by this auditee"
            );
        }


        // --------------------------------------------------------
        // Create AuditeeResponse
        // --------------------------------------------------------

        AuditeeResponse response =
                new AuditeeResponse();

        response.setFinding(finding);

        response.setAuditee(auditee);

        response.setResponseText(
                requestDTO.getResponseText()
        );

        response.setRootCause(
                requestDTO.getRootCause()
        );

        response.setCorrectiveAction(
                requestDTO.getCorrectiveAction()
        );

        response.setTargetCompletionDate(
                requestDTO.getTargetCompletionDate()
        );


        // --------------------------------------------------------
        // Status
        // --------------------------------------------------------

        response.setStatus(
                AuditeeResponseStatus.SUBMITTED
        );


        // --------------------------------------------------------
        // Submitted Time
        // --------------------------------------------------------

        response.setSubmittedAt(
                LocalDateTime.now()
        );


        // --------------------------------------------------------
        // Save
        // --------------------------------------------------------

        AuditeeResponse savedResponse =
                auditeeResponseRepository.save(response);


        return convertToDTO(savedResponse);
    }


    // ============================================================
    // GET RESPONSE BY ID
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public AuditeeResponseResponseDTO getResponseById(
            Long id) {

        AuditeeResponse response =
                auditeeResponseRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Auditee response not found with ID: "
                                                + id
                                )
                        );

        return convertToDTO(response);
    }


    // ============================================================
    // GET RESPONSES BY FINDING
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<AuditeeResponseResponseDTO> getResponsesByFinding(
            Long findingId) {

        if (!findingRepository.existsById(findingId)) {

            throw new RuntimeException(
                    "Finding not found with ID: "
                            + findingId
            );
        }

        List<AuditeeResponse> responses =
                auditeeResponseRepository
                        .findByFindingId(findingId);

        return responses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    // ============================================================
    // GET RESPONSES BY AUDITEE
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<AuditeeResponseResponseDTO> getResponsesByAuditee(
            Long auditeeId) {

        if (!userRepository.existsById(auditeeId)) {

            throw new RuntimeException(
                    "Auditee not found with ID: "
                            + auditeeId
            );
        }

        List<AuditeeResponse> responses =
                auditeeResponseRepository
                        .findByAuditeeId(auditeeId);

        return responses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    // ============================================================
    // GET ALL RESPONSES
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public List<AuditeeResponseResponseDTO> getAllResponses() {

        List<AuditeeResponse> responses =
                auditeeResponseRepository.findAll();

        return responses.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    // ============================================================
    // UPDATE RESPONSE STATUS
    // INTERNAL AUDITOR
    //
    // ALLOWED:
    // UNDER_REVIEW
    // APPROVED
    // REJECTED
    // ============================================================

    @Override
    public AuditeeResponseResponseDTO updateResponseStatus(
            Long id,
            AuditeeResponseStatus status) {

        // --------------------------------------------------------
        // Validate ID
        // --------------------------------------------------------

        AuditeeResponse response =
                auditeeResponseRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Auditee response not found with ID: "
                                                + id
                                )
                        );


        // --------------------------------------------------------
        // Validate status
        // --------------------------------------------------------

        if (status == null) {

            throw new RuntimeException(
                    "Status cannot be null"
            );
        }


        // --------------------------------------------------------
        // INTERNAL AUDITOR ALLOWED STATUS
        // --------------------------------------------------------

        if (status != AuditeeResponseStatus.UNDER_REVIEW
                && status != AuditeeResponseStatus.APPROVED
                && status != AuditeeResponseStatus.REJECTED) {

            throw new RuntimeException(
                    "Internal Auditor can only update status to "
                            + "UNDER_REVIEW, APPROVED or REJECTED"
            );
        }


        // --------------------------------------------------------
        // Update status
        // --------------------------------------------------------

        response.setStatus(status);


        // --------------------------------------------------------
        // Review time
        // --------------------------------------------------------

        response.setReviewedAt(
                LocalDateTime.now()
        );


        // --------------------------------------------------------
        // Save
        // --------------------------------------------------------

        AuditeeResponse updatedResponse =
                auditeeResponseRepository.save(response);


        return convertToDTO(updatedResponse);
    }


    // ============================================================
    // DELETE RESPONSE
    // ============================================================

    @Override
    public void deleteResponse(Long id) {

        if (!auditeeResponseRepository.existsById(id)) {

            throw new RuntimeException(
                    "Auditee response not found with ID: "
                            + id
            );
        }

        auditeeResponseRepository.deleteById(id);
    }


    // ============================================================
    // ENTITY -> DTO
    // ============================================================

    private AuditeeResponseResponseDTO convertToDTO(
            AuditeeResponse response) {

        AuditeeResponseResponseDTO dto =
                new AuditeeResponseResponseDTO();


        // --------------------------------------------------------
        // Response ID
        // --------------------------------------------------------

        dto.setId(
                response.getId()
        );


        // --------------------------------------------------------
        // Finding
        // --------------------------------------------------------

        if (response.getFinding() != null) {

            Finding finding =
                    response.getFinding();

            dto.setFindingId(
                    finding.getId()
            );

            dto.setFindingTitle(
                    finding.getTitle()
            );


            // ----------------------------------------------------
            // Audit
            // ----------------------------------------------------

            if (finding.getAudit() != null) {

                dto.setAuditId(
                        finding.getAudit().getId()
                );
            }
        }


        // --------------------------------------------------------
        // Auditee
        // --------------------------------------------------------

        if (response.getAuditee() != null) {

            dto.setAuditeeId(
                    response.getAuditee().getId()
            );
        }


        // --------------------------------------------------------
        // Response Information
        // --------------------------------------------------------

        dto.setResponseText(
                response.getResponseText()
        );

        dto.setRootCause(
                response.getRootCause()
        );

        dto.setCorrectiveAction(
                response.getCorrectiveAction()
        );

        dto.setTargetCompletionDate(
                response.getTargetCompletionDate()
        );


        // --------------------------------------------------------
        // Status
        // --------------------------------------------------------

        dto.setStatus(
                response.getStatus()
        );


        // --------------------------------------------------------
        // Review
        // --------------------------------------------------------

        dto.setReviewComments(
                response.getReviewComments()
        );

        dto.setReviewedAt(
                response.getReviewedAt()
        );


        // --------------------------------------------------------
        // Dates
        // --------------------------------------------------------

        dto.setCreatedAt(
                response.getCreatedAt()
        );

        dto.setUpdatedAt(
                response.getUpdatedAt()
        );

        dto.setSubmittedAt(
                response.getSubmittedAt()
        );


        return dto;
    }
}