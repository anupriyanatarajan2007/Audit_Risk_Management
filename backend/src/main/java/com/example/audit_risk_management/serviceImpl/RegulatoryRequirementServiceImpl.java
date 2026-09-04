package com.example.audit_risk_management.serviceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.audit_risk_management.dto.RegulatoryRequirementRequestDTO;
import com.example.audit_risk_management.dto.RegulatoryRequirementResponseDTO;
import com.example.audit_risk_management.enums.RegulatoryStatus;
import com.example.audit_risk_management.model.RegulatoryRequirement;
import com.example.audit_risk_management.repository.RegulatoryRequirementRepository;
import com.example.audit_risk_management.service.RegulatoryRequirementService;

@Service
public class RegulatoryRequirementServiceImpl
        implements RegulatoryRequirementService {

    @Autowired
    private RegulatoryRequirementRepository repository;

    @Override
    public List<RegulatoryRequirementResponseDTO> getAllRequirements() {

        return repository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RegulatoryRequirementResponseDTO getRequirementById(Long id) {

        RegulatoryRequirement requirement =
                repository.findById(id)
                .orElseThrow(
                    () -> new RuntimeException(
                        "Regulatory requirement not found"
                    )
                );

        return convertToDTO(requirement);
    }

    @Override
    public RegulatoryRequirementResponseDTO getRequirementByCode(
            String requirementCode) {

        RegulatoryRequirement requirement =
                repository.findByRequirementCode(requirementCode)
                .orElseThrow(
                    () -> new RuntimeException(
                        "Regulatory requirement not found"
                    )
                );

        return convertToDTO(requirement);
    }

    @Override
    public List<RegulatoryRequirementResponseDTO> getRequirementsByStatus(
            String status) {

        RegulatoryStatus regulatoryStatus =
                RegulatoryStatus.valueOf(status.toUpperCase());

        return repository.findByStatus(regulatoryStatus)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RegulatoryRequirementResponseDTO> getRequirementsByCategory(
            String category) {

        return repository.findByCategory(category)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RegulatoryRequirementResponseDTO>
            getRequirementsByRegulatoryBody(String regulatoryBody) {

        return repository.findByRegulatoryBody(regulatoryBody)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RegulatoryRequirementResponseDTO>
            getRequirementsByDepartment(String department) {

        return repository.findByApplicableDepartment(department)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private RegulatoryRequirementResponseDTO convertToDTO(
            RegulatoryRequirement requirement) {

        RegulatoryRequirementResponseDTO dto =
                new RegulatoryRequirementResponseDTO();

        dto.setId(requirement.getId());
        dto.setRequirementCode(
                requirement.getRequirementCode()
        );
        dto.setTitle(
                requirement.getTitle()
        );
        dto.setDescription(
                requirement.getDescription()
        );
        dto.setRegulatoryBody(
                requirement.getRegulatoryBody()
        );
        dto.setCategory(
                requirement.getCategory()
        );
        dto.setApplicableDepartment(
                requirement.getApplicableDepartment()
        );
        dto.setApplicableProcess(
                requirement.getApplicableProcess()
        );
        dto.setEffectiveDate(
                requirement.getEffectiveDate()
        );
        dto.setExpiryDate(
                requirement.getExpiryDate()
        );
        dto.setStatus(
                requirement.getStatus()
        );
        dto.setComplianceReference(
                requirement.getComplianceReference()
        );
        dto.setRemarks(
                requirement.getRemarks()
        );
        dto.setCreatedAt(
                requirement.getCreatedAt()
        );
        dto.setUpdatedAt(
                requirement.getUpdatedAt()
        );

        return dto;
    }

    @Override
public RegulatoryRequirementResponseDTO createRequirement(
        RegulatoryRequirementRequestDTO request) {

    RegulatoryRequirement requirement = new RegulatoryRequirement();

    requirement.setRequirementCode(request.getRequirementCode());
    requirement.setTitle(request.getTitle());
    requirement.setDescription(request.getDescription());
    requirement.setRegulatoryBody(request.getRegulatoryBody());
    requirement.setCategory(request.getCategory());
    requirement.setApplicableDepartment(
            request.getApplicableDepartment()
    );
    requirement.setApplicableProcess(
            request.getApplicableProcess()
    );
    requirement.setEffectiveDate(request.getEffectiveDate());
    requirement.setExpiryDate(request.getExpiryDate());
    requirement.setStatus(request.getStatus());
    requirement.setComplianceReference(
            request.getComplianceReference()
    );
    requirement.setRemarks(request.getRemarks());

    RegulatoryRequirement saved =
            repository.save(requirement);

    return convertToDTO(saved);
}

@Override
public RegulatoryRequirementResponseDTO updateRequirement(
        Long id,
        RegulatoryRequirementRequestDTO request) {

    RegulatoryRequirement requirement =
            repository.findById(id)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Regulatory requirement not found with id: "
                                            + id
                            )
                    );

    requirement.setRequirementCode(request.getRequirementCode());
    requirement.setTitle(request.getTitle());
    requirement.setDescription(request.getDescription());
    requirement.setRegulatoryBody(request.getRegulatoryBody());
    requirement.setCategory(request.getCategory());
    requirement.setApplicableDepartment(
            request.getApplicableDepartment()
    );
    requirement.setApplicableProcess(
            request.getApplicableProcess()
    );
    requirement.setEffectiveDate(request.getEffectiveDate());
    requirement.setExpiryDate(request.getExpiryDate());
    requirement.setStatus(request.getStatus());
    requirement.setComplianceReference(
            request.getComplianceReference()
    );
    requirement.setRemarks(request.getRemarks());

    RegulatoryRequirement updated =
            repository.save(requirement);

    return convertToDTO(updated);
}

@Override
public void deleteRequirement(Long id) {

    if (!repository.existsById(id)) {
        throw new RuntimeException(
                "Regulatory requirement not found with id: " + id
        );
    }

    repository.deleteById(id);
}

}