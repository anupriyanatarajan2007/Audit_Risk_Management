package com.example.audit_risk_management.serviceImpl;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.MitigationRequestDTO;
import com.example.audit_risk_management.dto.MitigationResponseDTO;
import com.example.audit_risk_management.enums.MitigationStatus;
import com.example.audit_risk_management.model.Mitigation;
import com.example.audit_risk_management.model.Risk;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.MitigationRepo;
import com.example.audit_risk_management.repository.RiskRepository;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.service.MitigationService;

@Service
public class MitigationServiceImpl implements MitigationService {

    @Autowired
    private MitigationRepo mitigationRepo;

    @Autowired
    private RiskRepository riskRepo;

    @Autowired
    private UserRepo userRepo;

    // ===================== CREATE MITIGATION =====================

    @Override
    public ApiResponse<MitigationResponseDTO> createMitigation(
            MitigationRequestDTO request) {
    
        Risk risk = riskRepo.findById(request.getRiskId())
                .orElseThrow(() -> new RuntimeException("Risk not found"));
    
        // Prevent duplicate mitigation for same risk
        if (mitigationRepo.existsByRiskId(request.getRiskId())) {
            throw new RuntimeException(
                    "A mitigation already exists for this risk."
            );
        }
    
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
    
        String email = authentication.getName();
    
        User owner = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    
        Mitigation mitigation = new Mitigation();
    
        mitigation.setMitigationId(generateMitigationId());
        mitigation.setMitigationTitle(request.getMitigationTitle());
        mitigation.setMitigationDescription(
                request.getMitigationDescription()
        );
    
        mitigation.setRisk(risk);
        mitigation.setOwner(owner);
    
        mitigation.setMitigationType(request.getMitigationType());
        mitigation.setTargetDate(request.getTargetDate());
        mitigation.setCompletedDate(request.getCompletedDate());
        mitigation.setStatus(request.getStatus());
        mitigation.setEffectiveness(request.getEffectiveness());
        mitigation.setCost(request.getCost());
        mitigation.setRemarks(request.getRemarks());
    
        mitigationRepo.save(mitigation);
    
        return new ApiResponse<>(
                true,
                "Mitigation created successfully",
                mapToResponse(mitigation)
        );
    }
    // ===================== ID GENERATOR =====================

    private String generateMitigationId() {

        long count = mitigationRepo.count() + 1;

        return String.format("MIT-%03d", count);
    }

    // ===================== ENTITY -> DTO =====================

    private MitigationResponseDTO mapToResponse(Mitigation mitigation) {

        MitigationResponseDTO dto = new MitigationResponseDTO();

        dto.setMitigationId(mitigation.getMitigationId());
        dto.setMitigationTitle(mitigation.getMitigationTitle());
        dto.setMitigationDescription(mitigation.getMitigationDescription());

        dto.setRiskId(mitigation.getRisk().getRiskId());
        dto.setRiskTitle(mitigation.getRisk().getTitle());

        dto.setOwnerId(mitigation.getOwner().getId());

        dto.setOwnerName(
                mitigation.getOwner().getProfile().getFirstName()
                        + " "
                        + mitigation.getOwner().getProfile().getLastName());

        dto.setMitigationType(mitigation.getMitigationType());

        dto.setTargetDate(mitigation.getTargetDate());
        dto.setCompletedDate(mitigation.getCompletedDate());

        dto.setStatus(mitigation.getStatus());
        dto.setEffectiveness(mitigation.getEffectiveness());

        dto.setCost(mitigation.getCost());
        dto.setRemarks(mitigation.getRemarks());

        dto.setCreatedAt(mitigation.getCreatedAt());
        dto.setUpdatedAt(mitigation.getUpdatedAt());

        return dto;
    }

        // ===================== GET ALL MITIGATIONS =====================

    @Override
    public ApiResponse<List<MitigationResponseDTO>> getAllMitigations() {

        List<MitigationResponseDTO> mitigations = mitigationRepo.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new ApiResponse<>(
                true,
                "Mitigations fetched successfully",
                mitigations);
    }

    // ===================== GET MITIGATION BY ID =====================

    @Override
    public ApiResponse<MitigationResponseDTO> getMitigationById(String mitigationId) {

        Mitigation mitigation = mitigationRepo.findByMitigationId(mitigationId)
                .orElseThrow(() -> new RuntimeException("Mitigation not found"));

        return new ApiResponse<>(
                true,
                "Mitigation fetched successfully",
                mapToResponse(mitigation));
    }

    // ===================== GET MITIGATIONS BY RISK =====================

    @Override
    public ApiResponse<List<MitigationResponseDTO>> getMitigationsByRisk(Long riskId) {

        List<MitigationResponseDTO> mitigations = mitigationRepo.findByRisk_Id(riskId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new ApiResponse<>(
                true,
                "Mitigations fetched successfully",
                mitigations);
    }

    // ===================== GET MITIGATIONS BY OWNER =====================

    @Override
    public ApiResponse<List<MitigationResponseDTO>> getMitigationsByOwner(Long ownerId) {

        List<MitigationResponseDTO> mitigations = mitigationRepo.findByOwner_Id(ownerId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new ApiResponse<>(
                true,
                "Mitigations fetched successfully",
                mitigations);
    }

    // ===================== UPDATE MITIGATION =====================

    @Override
    public ApiResponse<MitigationResponseDTO> updateMitigation(String mitigationId,
            MitigationRequestDTO request) {

        Mitigation mitigation = mitigationRepo.findByMitigationId(mitigationId)
                .orElseThrow(() -> new RuntimeException("Mitigation not found"));
                Risk risk = riskRepo.findById(request.getRiskId())
                .orElseThrow(() -> new RuntimeException("Risk not found"));

                Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        
        String email = authentication.getName();
        
        User owner = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        mitigation.setMitigationTitle(request.getMitigationTitle());
        mitigation.setMitigationDescription(request.getMitigationDescription());
        mitigation.setRisk(risk);
        mitigation.setOwner(owner);
        mitigation.setMitigationType(request.getMitigationType());
        mitigation.setTargetDate(request.getTargetDate());
        mitigation.setCompletedDate(request.getCompletedDate());
        mitigation.setStatus(request.getStatus());
        mitigation.setEffectiveness(request.getEffectiveness());
        mitigation.setCost(request.getCost());
        mitigation.setRemarks(request.getRemarks());

        mitigationRepo.save(mitigation);

        return new ApiResponse<>(
                true,
                "Mitigation updated successfully",
                mapToResponse(mitigation));
    }

    // ===================== DELETE MITIGATION =====================

    @Override
    public ApiResponse<String> deleteMitigation(String mitigationId) {

        Mitigation mitigation = mitigationRepo.findByMitigationId(mitigationId)
                .orElseThrow(() -> new RuntimeException("Mitigation not found"));

        mitigationRepo.delete(mitigation);

        return new ApiResponse<>(
                true,
                "Mitigation deleted successfully",
                mitigationId);
    }

    // ===================== UPDATE STATUS =====================

@Override
public ApiResponse<MitigationResponseDTO> updateStatus(
        String mitigationId,
        MitigationStatus status) {

    Mitigation mitigation = mitigationRepo.findByMitigationId(mitigationId)
            .orElseThrow(() -> new RuntimeException("Mitigation not found"));

    mitigation.setStatus(status);

    mitigationRepo.save(mitigation);

    return new ApiResponse<>(
            true,
            "Mitigation status updated successfully",
            mapToResponse(mitigation)
    );
}


// ===================== ASSIGN OWNER =====================

@Override
public ApiResponse<MitigationResponseDTO> assignOwner(
        String mitigationId,
        Long ownerId) {

    Mitigation mitigation = mitigationRepo.findByMitigationId(mitigationId)
            .orElseThrow(() -> new RuntimeException("Mitigation not found"));

    User owner = userRepo.findById(ownerId)
            .orElseThrow(() -> new RuntimeException("Owner not found"));

    mitigation.setOwner(owner);

    mitigationRepo.save(mitigation);

    return new ApiResponse<>(
            true,
            "Owner assigned successfully",
            mapToResponse(mitigation)
    );
}


// ===================== COMPLETE MITIGATION =====================

@Override
public ApiResponse<MitigationResponseDTO> completeMitigation(
        String mitigationId) {

    Mitigation mitigation = mitigationRepo.findByMitigationId(mitigationId)
            .orElseThrow(() -> new RuntimeException("Mitigation not found"));

    mitigation.setStatus(MitigationStatus.COMPLETED);
    mitigation.setCompletedDate(LocalDate.now());

    mitigationRepo.save(mitigation);

    return new ApiResponse<>(
            true,
            "Mitigation completed successfully",
            mapToResponse(mitigation)
    );
}


// ===================== GET BY STATUS =====================

@Override
public ApiResponse<List<MitigationResponseDTO>> getByStatus(
        MitigationStatus status) {

    List<MitigationResponseDTO> list =
            mitigationRepo.findByStatus(status)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());

    return new ApiResponse<>(
            true,
            "Mitigations fetched successfully",
            list
    );
}


// ===================== OVERDUE MITIGATIONS =====================

@Override
public ApiResponse<List<MitigationResponseDTO>> getOverdueMitigations() {

    List<MitigationResponseDTO> list =
            mitigationRepo.findByTargetDateBeforeAndStatusNot(
                    LocalDate.now(),
                    MitigationStatus.COMPLETED)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());

    return new ApiResponse<>(
            true,
            "Overdue mitigations fetched successfully",
            list
    );
}


// ===================== TOTAL COUNT =====================

@Override
public ApiResponse<Long> getTotalMitigations() {

    return new ApiResponse<>(
            true,
            "Total mitigations count",
            mitigationRepo.count()
    );
}


// ===================== COMPLETED COUNT =====================

@Override
public ApiResponse<Long> getCompletedCount() {

    return new ApiResponse<>(
            true,
            "Completed mitigation count",
            mitigationRepo.countByStatus(
                    MitigationStatus.COMPLETED)
    );
}


// ===================== PENDING COUNT =====================

@Override
public ApiResponse<Long> getPendingCount() {

    return new ApiResponse<>(
            true,
            "Pending mitigation count",
            mitigationRepo.countByStatus(
                    MitigationStatus.PLANNED)
    );
}


// ===================== SEARCH =====================

@Override
public ApiResponse<List<MitigationResponseDTO>> search(
        String keyword) {

    List<MitigationResponseDTO> list =
    mitigationRepo.findByMitigationTitleContainingIgnoreCase(keyword)
    .stream()
    .map(this::mapToResponse)
    .collect(Collectors.toList());

    return new ApiResponse<>(
            true,
            "Search completed successfully",
            list
    );
}

}