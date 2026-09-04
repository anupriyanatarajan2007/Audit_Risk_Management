package com.example.audit_risk_management.serviceImpl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.ReportRequestDTO;
import com.example.audit_risk_management.dto.ReportResponseDTO;
import com.example.audit_risk_management.enums.ReportStatus;
import com.example.audit_risk_management.enums.ReportType;
import com.example.audit_risk_management.model.Kri;
import com.example.audit_risk_management.model.Mitigation;
import com.example.audit_risk_management.model.Report;
import com.example.audit_risk_management.model.Risk;
import com.example.audit_risk_management.model.User;
import com.example.audit_risk_management.repository.KriRepository;
import com.example.audit_risk_management.repository.MitigationRepo;
import com.example.audit_risk_management.repository.ReportRepository;
import com.example.audit_risk_management.repository.RiskRepository;
import com.example.audit_risk_management.repository.UserRepo;
import com.example.audit_risk_management.service.ReportService;

@Service
public class ReportServiceImpl implements ReportService {


    @Autowired
    private ReportRepository reportRepository;


    @Autowired
    private UserRepo userRepo;


    @Autowired
    private RiskRepository riskRepository;


    @Autowired
    private KriRepository kriRepository;


    @Autowired
    private MitigationRepo mitigationRepo;



    // ================= CREATE REPORT =================

    @Override
    public ApiResponse<ReportResponseDTO> createReport(
            ReportRequestDTO request) {


        Authentication authentication =
                SecurityContextHolder.getContext()
                .getAuthentication();


        String email = authentication.getName();


        User user = userRepo.findByEmail(email)
                .orElseThrow(
                () -> new RuntimeException("User not found"));



        Report report = new Report();


        report.setReportId(generateReportId());

        report.setReportTitle(request.getReportTitle());

        report.setDescription(request.getDescription());

        report.setReportType(request.getReportType());

        report.setStatus(
                request.getStatus() != null ?
                request.getStatus() :
                ReportStatus.GENERATED
        );


        report.setGeneratedBy(user);



        if(request.getRiskId()!=null){

            Risk risk = riskRepository
                    .findById(request.getRiskId())
                    .orElseThrow(
                    () -> new RuntimeException("Risk not found"));

            report.setRisk(risk);
        }



        if(request.getKriId()!=null){

            Kri kri = kriRepository
                    .findById(request.getKriId())
                    .orElseThrow(
                    () -> new RuntimeException("KRI not found"));

            report.setKri(kri);
        }



        if(request.getMitigationId()!=null){

            Mitigation mitigation =
                    mitigationRepo.findById(
                            request.getMitigationId())
                    .orElseThrow(
                    () -> new RuntimeException(
                            "Mitigation not found"));

            report.setMitigation(mitigation);
        }



        report.setFileName(request.getFileName());

        report.setFilePath(request.getFilePath());



        Report saved = reportRepository.save(report);



        return ApiResponse.ok(
                "Report created successfully",
                mapToResponse(saved));
    }





    private String generateReportId(){

        long count = reportRepository.count()+1;

        return String.format("REP-%03d", count);
    }





    // ================= GET ALL =================


    @Override
    public ApiResponse<List<ReportResponseDTO>> getAllReports(){


        List<ReportResponseDTO> list =
                reportRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());


        return ApiResponse.ok(
                "Reports fetched successfully",
                list);
    }





    // ================= GET BY ID =================


    @Override
    public ApiResponse<ReportResponseDTO> getReportById(Long id){


        Report report =
                reportRepository.findById(id)
                .orElseThrow(
                () -> new RuntimeException(
                        "Report not found"));


        return ApiResponse.ok(
                "Report fetched successfully",
                mapToResponse(report));
    }





    // ================= GET BY REPORT ID =================


    @Override
    public ApiResponse<ReportResponseDTO> getReportByReportId(
            String reportId){


        Report report =
                reportRepository.findByReportId(reportId)
                .orElseThrow(
                () -> new RuntimeException(
                        "Report not found"));


        return ApiResponse.ok(
                "Report fetched successfully",
                mapToResponse(report));
    }





    // ================= UPDATE =================


    @Override
    public ApiResponse<ReportResponseDTO> updateReport(
            Long id,
            ReportRequestDTO request){


        Report report =
                reportRepository.findById(id)
                .orElseThrow(
                () -> new RuntimeException(
                        "Report not found"));


        report.setReportTitle(request.getReportTitle());

        report.setDescription(request.getDescription());

        report.setReportType(request.getReportType());

        report.setStatus(request.getStatus());

        report.setFileName(request.getFileName());

        report.setFilePath(request.getFilePath());


        Report updated =
                reportRepository.save(report);



        return ApiResponse.ok(
                "Report updated successfully",
                mapToResponse(updated));
    }





    // ================= DELETE =================


    @Override
    public ApiResponse<String> deleteReport(Long id){


        Report report =
                reportRepository.findById(id)
                .orElseThrow(
                () -> new RuntimeException(
                        "Report not found"));


        reportRepository.delete(report);



        return ApiResponse.ok(
                "Report deleted successfully",
                report.getReportId());
    }





    // ================= FILTER METHODS =================


    @Override
    public ApiResponse<List<ReportResponseDTO>> getReportsByUser(Long userId){

        return ApiResponse.ok(
                "Reports fetched",
                reportRepository
                .findByGeneratedBy_Id(userId)
                .stream()
                .map(this::mapToResponse)
                .toList());
    }





    @Override
    public ApiResponse<List<ReportResponseDTO>> getReportsByType(
            ReportType type){

        return ApiResponse.ok(
                "Reports fetched",
                reportRepository
                .findByReportType(type)
                .stream()
                .map(this::mapToResponse)
                .toList());
    }





    @Override
    public ApiResponse<List<ReportResponseDTO>> getReportsByStatus(
            ReportStatus status){

        return ApiResponse.ok(
                "Reports fetched",
                reportRepository
                .findByStatus(status)
                .stream()
                .map(this::mapToResponse)
                .toList());
    }





    @Override
    public ApiResponse<List<ReportResponseDTO>> getReportsByRisk(Long id){

        return ApiResponse.ok(
                "Reports fetched",
                reportRepository.findByRisk_Id(id)
                .stream()
                .map(this::mapToResponse)
                .toList());
    }





    @Override
    public ApiResponse<List<ReportResponseDTO>> getReportsByKri(Long id){

        return ApiResponse.ok(
                "Reports fetched",
                reportRepository.findByKri_Id(id)
                .stream()
                .map(this::mapToResponse)
                .toList());
    }





    @Override
    public ApiResponse<List<ReportResponseDTO>> getReportsByMitigation(Long id){

        return ApiResponse.ok(
                "Reports fetched",
                reportRepository.findByMitigation_Id(id)
                .stream()
                .map(this::mapToResponse)
                .toList());
    }





    @Override
    public ApiResponse<List<ReportResponseDTO>> searchReports(
            String keyword){

        return ApiResponse.ok(
                "Search completed",
                reportRepository
                .findByReportTitleContainingIgnoreCase(keyword)
                .stream()
                .map(this::mapToResponse)
                .toList());
    }





    @Override
    public ApiResponse<List<ReportResponseDTO>> getReportsBetweenDates(
            LocalDateTime start,
            LocalDateTime end){

        return ApiResponse.ok(
                "Reports fetched",
                reportRepository
                .findByCreatedAtBetween(start,end)
                .stream()
                .map(this::mapToResponse)
                .toList());
    }





    @Override
    public ApiResponse<List<ReportResponseDTO>> getLatestReports(){

        return ApiResponse.ok(
                "Latest reports fetched",
                reportRepository
                .findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList());
    }





    // ================= DASHBOARD =================


    @Override
    public ApiResponse<Map<String,Long>> getReportDashboard(){


        Map<String,Long> map = new HashMap<>();


        map.put("totalReports",
                reportRepository.count());


        map.put("riskReports",
                reportRepository
                .countByReportType(
                ReportType.RISK_REPORT));


        map.put("kriReports",
                reportRepository
                .countByReportType(
                ReportType.KRI_REPORT));


        map.put("mitigationReports",
                reportRepository
                .countByReportType(
                ReportType.MITIGATION_REPORT));


        map.put("failedReports",
                reportRepository
                .countByStatus(
                ReportStatus.FAILED));


        return ApiResponse.ok(
                "Dashboard fetched",
                map);
    }






    // ================= ENTITY TO DTO =================


    private ReportResponseDTO mapToResponse(
            Report report){


        ReportResponseDTO dto =
                new ReportResponseDTO();


        dto.setId(report.getId());

        dto.setReportId(report.getReportId());

        dto.setReportTitle(report.getReportTitle());

        dto.setDescription(report.getDescription());

        dto.setReportType(report.getReportType());

        dto.setStatus(report.getStatus());



        dto.setGeneratedById(
                report.getGeneratedBy().getId());


        if(report.getGeneratedBy()
                .getProfile()!=null){

            dto.setGeneratedByName(
            report.getGeneratedBy()
            .getProfile()
            .getFirstName()+" "+
            report.getGeneratedBy()
            .getProfile()
            .getLastName());
        }



        if(report.getRisk()!=null){

            dto.setRiskId(report.getRisk().getId());

            dto.setRiskCode(
            report.getRisk().getRiskId());

            dto.setRiskTitle(
            report.getRisk().getTitle());
        }



        if(report.getKri()!=null){

            dto.setKriId(report.getKri().getId());

            dto.setKriCode(
            report.getKri().getKriId());

            dto.setKriName(
            report.getKri().getKriName());
        }



        if(report.getMitigation()!=null){

            dto.setMitigationId(
            report.getMitigation().getId());

            dto.setMitigationCode(
            report.getMitigation().getMitigationId());

            dto.setMitigationTitle(
            report.getMitigation().getMitigationTitle());
        }



        dto.setFileName(report.getFileName());

        dto.setFilePath(report.getFilePath());


        dto.setCreatedAt(report.getCreatedAt());

        dto.setUpdatedAt(report.getUpdatedAt());


        return dto;
    }

}