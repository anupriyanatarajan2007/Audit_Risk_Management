package com.example.audit_risk_management.serviceImpl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.KriRequestDTO;
import com.example.audit_risk_management.dto.KriResponseDTO;
import com.example.audit_risk_management.enums.KriStatus;
import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.model.Kri;
import com.example.audit_risk_management.model.Risk;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.DepartmentRepository;
import com.example.audit_risk_management.repository.KriRepository;
import com.example.audit_risk_management.repository.RiskRepository;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.service.KriService;


@Service
public class KriServiceImpl implements KriService {

    @Autowired
    private KriRepository kriRepository;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private RiskRepository riskRepository;

    private String generateKriId() {
        long count = kriRepository.count();
        return String.format("KRI-%03d", count + 1);
    }
    
    public ApiResponse<KriResponseDTO> createKri(KriRequestDTO request) {

        // ==========================================
        // GET LOGGED-IN USER
        // ==========================================
    
        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();
    
        String email = authentication.getName();
    
        User user = userRepo.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
    
    
        // ==========================================
        // CHECK RISK OFFICER
        // ==========================================
    
        if (user.getRole() == null ||
                !"RISK_OFFICER".equalsIgnoreCase(
                        user.getRole().getName())) {
    
            return ApiResponse.error(
                    "Only Risk Officer can create KRI");
        }
    
    
        // ==========================================
        // VALIDATE RISK
        // ==========================================
    
        if (request.getRiskId() == null) {
    
            return ApiResponse.error(
                    "Risk ID is required");
        }
    
        Risk risk = riskRepository
                .findById(request.getRiskId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Risk not found with ID: "
                                + request.getRiskId()));
    
    
        // ==========================================
        // CHECK DUPLICATE KRI FOR RISK
        // ==========================================
    
        if (kriRepository.existsByRisk_Id(
                request.getRiskId())) {
    
            return ApiResponse.error(
                    "This Risk already has a KRI");
        }
    
    
        // ==========================================
        // VALIDATE DEPARTMENT
        // ==========================================
    
        if (request.getDepartmentId() == null) {
    
            return ApiResponse.error(
                    "Department ID is required");
        }
    
        Department department =
                departmentRepository
                        .findById(
                                request.getDepartmentId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Department not found with ID: "
                                        + request.getDepartmentId()));
    
    
        // ==========================================
        // CREATE KRI
        // ==========================================
    
        Kri kri = new Kri();
    
        kri.setKriId(generateKriId());
    
        kri.setKriName(
                request.getKriName());
    
        kri.setDescription(
                request.getDescription());
    
        kri.setRisk(risk);
    
        kri.setRiskCategory(
                request.getRiskCategory());
    
        // IMPORTANT
        // DTO has departmentId
        // Entity needs Department
        kri.setDepartment(department);
    
        kri.setBusinessUnit(
                request.getBusinessUnit());
    
        // Logged-in Risk Officer becomes owner
        kri.setOwner(user);
    
        kri.setCurrentValue(
                request.getCurrentValue());
    
        kri.setGreenThreshold(
                request.getGreenThreshold());
    
        kri.setAmberThreshold(
                request.getAmberThreshold());
    
        kri.setRedThreshold(
                request.getRedThreshold());
    
        kri.setUnit(
                request.getUnit());
    
        // Default status
        kri.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : KriStatus.GREEN);
    
        kri.setFrequency(
                request.getFrequency());
    
        kri.setDataSource(
                request.getDataSource());
    
        kri.setRemarks(
                request.getRemarks());
    
    
        // ==========================================
        // SAVE
        // ==========================================
    
        Kri savedKri =
                kriRepository.save(kri);
    
    
        // ==========================================
        // RETURN RESPONSE
        // ==========================================
    
        return ApiResponse.ok(
                "KRI created successfully",
                mapToResponseDTO(savedKri));
    }
    @Override
    public ApiResponse<KriResponseDTO> getKriById(Long id) {
    
        Kri kri = kriRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KRI not found"));
    
        return ApiResponse.ok(mapToResponseDTO(kri));
    }

    @Override
    public ApiResponse<KriResponseDTO> updateKri(
            Long id,
            KriRequestDTO request) {
    
        // ==========================================
        // FIND EXISTING KRI
        // ==========================================
    
        Kri kri = kriRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "KRI not found with ID: " + id));
    
    
        // ==========================================
        // VALIDATE RISK ID
        // ==========================================
    
        if (request.getRiskId() == null) {
    
            return ApiResponse.error(
                    "Risk ID is required");
        }
    
    
        // ==========================================
        // FIND RISK
        // ==========================================
    
        Risk risk = riskRepository
                .findById(request.getRiskId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Risk not found with ID: "
                                + request.getRiskId()));
    
    
        // ==========================================
        // CHECK WHETHER ANOTHER KRI
        // ALREADY USES THIS RISK
        // ==========================================
    
        List<Kri> existingKris =
                kriRepository.findByRisk_Id(
                        request.getRiskId());
    
        boolean usedByAnotherKri =
                existingKris.stream()
                        .anyMatch(existing ->
                                !existing.getId()
                                        .equals(id));
    
        if (usedByAnotherKri) {
    
            return ApiResponse.error(
                    "This Risk is already assigned "
                    + "to another KRI");
        }
    
    
        // ==========================================
        // VALIDATE DEPARTMENT ID
        // ==========================================
    
        if (request.getDepartmentId() == null) {
    
            return ApiResponse.error(
                    "Department ID is required");
        }
    
    
        // ==========================================
        // FIND DEPARTMENT
        // ==========================================
    
        Department department =
                departmentRepository
                        .findById(
                                request.getDepartmentId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Department not found with ID: "
                                        + request.getDepartmentId()));
    
    
        // ==========================================
        // UPDATE KRI
        // ==========================================
    
        kri.setKriName(
                request.getKriName());
    
        kri.setDescription(
                request.getDescription());
    
        kri.setRisk(risk);
    
        kri.setRiskCategory(
                request.getRiskCategory());
    
        kri.setDepartment(department);
    
        kri.setBusinessUnit(
                request.getBusinessUnit());
    
        kri.setCurrentValue(
                request.getCurrentValue());
    
        kri.setGreenThreshold(
                request.getGreenThreshold());
    
        kri.setAmberThreshold(
                request.getAmberThreshold());
    
        kri.setRedThreshold(
                request.getRedThreshold());
    
        kri.setUnit(
                request.getUnit());
    
        kri.setStatus(
                request.getStatus() != null
                        ? request.getStatus()
                        : KriStatus.GREEN);
    
        kri.setFrequency(
                request.getFrequency());
    
        kri.setDataSource(
                request.getDataSource());
    
        kri.setRemarks(
                request.getRemarks());
    
    
        // ==========================================
        // SAVE
        // ==========================================
    
        Kri updated =
                kriRepository.save(kri);
    
    
        // ==========================================
        // RESPONSE
        // ==========================================
    
        return ApiResponse.ok(
                "KRI updated successfully",
                mapToResponseDTO(updated));
    }
    
   private KriResponseDTO mapToResponseDTO(Kri kri) {

    KriResponseDTO dto = new KriResponseDTO();

    dto.setId(kri.getId());
    dto.setKriId(kri.getKriId());
    dto.setKriName(kri.getKriName());
    dto.setDescription(kri.getDescription());

    dto.setRiskId(kri.getRisk().getId());
    dto.setRiskCode(kri.getRisk().getRiskId());
    dto.setRiskTitle(kri.getRisk().getTitle());

    dto.setRiskCategory(kri.getRiskCategory());
    dto.setDepartment(kri.getDepartment());
    dto.setBusinessUnit(kri.getBusinessUnit());

    dto.setOwnerId(kri.getOwner().getId());
    dto.setOwnerEmployeeId(kri.getOwner().getEmployeeId());

    if (kri.getOwner().getProfile() != null) {
        dto.setOwnerName(
                kri.getOwner().getProfile().getFirstName()
                        + " "
                        + kri.getOwner().getProfile().getLastName());
    }

    dto.setCurrentValue(kri.getCurrentValue());
    dto.setGreenThreshold(kri.getGreenThreshold());
    dto.setAmberThreshold(kri.getAmberThreshold());
    dto.setRedThreshold(kri.getRedThreshold());

    dto.setUnit(kri.getUnit());
    dto.setStatus(kri.getStatus());
    dto.setFrequency(kri.getFrequency());

    dto.setDataSource(kri.getDataSource());
    dto.setLastUpdated(kri.getLastUpdated());
    dto.setRemarks(kri.getRemarks());

    dto.setCreatedAt(kri.getCreatedAt());
    dto.setUpdatedAt(kri.getUpdatedAt());

    return dto;
}

@Override
public ApiResponse<Void> deleteKri(Long id) {

    Kri kri = kriRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("KRI not found"));

    kriRepository.delete(kri);

    return ApiResponse.ok("KRI deleted successfully", null);
}

public ApiResponse<Map<String,Long>> getDashboard(){
    Map<String,Long> dashboard=new HashMap<>();

     dashboard.put("totalKris", kriRepository.count());
    dashboard.put("greenKris", kriRepository.countByStatus(KriStatus.GREEN));
    dashboard.put("amberKris", kriRepository.countByStatus(KriStatus.AMBER));
    dashboard.put("redKris", kriRepository.countByStatus(KriStatus.RED));
    return ApiResponse.ok("Dashboard fetched successfully", dashboard);
}


@Override
public ApiResponse<List<KriResponseDTO>> getAllKris() {

    List<KriResponseDTO> response = kriRepository.findAll()
            .stream()
            .map(this::mapToResponseDTO)
            .toList();

    return ApiResponse.ok("KRIs fetched successfully", response);
}

@Override
public ApiResponse<List<KriResponseDTO>> getKrisByRisk(Long riskId) {

    List<KriResponseDTO> response = kriRepository.findByRisk_Id(riskId)
            .stream()
            .map(this::mapToResponseDTO)
            .toList();

    return ApiResponse.ok(
            "Risk wise KRIs fetched successfully",
            response);
}



@Override
public ApiResponse<List<KriResponseDTO>> getKrisByStatus(KriStatus status) {

    List<KriResponseDTO> response = kriRepository.findByStatus(status)
            .stream()
            .map(this::mapToResponseDTO)
            .toList();

    return ApiResponse.ok(
            "Status wise KRIs fetched successfully",
            response);
}



@Override
public ApiResponse<KriResponseDTO> updateStatus(
        Long id,
        KriStatus status) {

    Kri kri = kriRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("KRI not found"));

    kri.setStatus(status);

    Kri updated = kriRepository.save(kri);

    return ApiResponse.ok(
            "KRI status updated successfully",
            mapToResponseDTO(updated));
}



@Override
public ApiResponse<List<KriResponseDTO>> getKrisByDepartment(
        Department department) {

    List<KriResponseDTO> response =
            kriRepository.findByDepartment(department)
            .stream()
            .map(this::mapToResponseDTO)
            .toList();


    return ApiResponse.ok(
            "Department wise KRIs fetched successfully",
            response);
}



@Override
public ApiResponse<List<KriResponseDTO>> getKrisByRiskCategory(
        com.example.audit_risk_management.enums.RiskCategory riskCategory) {


    List<KriResponseDTO> response =
            kriRepository.findByRiskCategory(riskCategory)
            .stream()
            .map(this::mapToResponseDTO)
            .toList();


    return ApiResponse.ok(
            "Risk category wise KRIs fetched successfully",
            response);
}



@Override
public ApiResponse<List<KriResponseDTO>> getKrisByOwner(
        Long ownerId) {


    List<KriResponseDTO> response =
            kriRepository.findByOwner_Id(ownerId)
            .stream()
            .map(this::mapToResponseDTO)
            .toList();


    return ApiResponse.ok(
            "Owner wise KRIs fetched successfully",
            response);
}



@Override
public ApiResponse<List<KriResponseDTO>> searchKri(
        String keyword) {


    List<KriResponseDTO> response =
            kriRepository.findByKriNameContainingIgnoreCase(keyword)
            .stream()
            .map(this::mapToResponseDTO)
            .toList();


    return ApiResponse.ok(
            "Search result fetched successfully",
            response);
}



@Override
public ApiResponse<List<KriResponseDTO>> getCriticalKris() {


    List<KriResponseDTO> response =
            kriRepository.findByStatus(KriStatus.RED)
            .stream()
            .map(this::mapToResponseDTO)
            .toList();


    return ApiResponse.ok(
            "Critical KRIs fetched successfully",
            response);
}
    
}
