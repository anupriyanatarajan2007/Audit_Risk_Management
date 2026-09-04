package com.example.audit_risk_management.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.ReportRequestDTO;
import com.example.audit_risk_management.dto.ReportResponseDTO;
import com.example.audit_risk_management.enums.ReportStatus;
import com.example.audit_risk_management.enums.ReportType;
import com.example.audit_risk_management.service.ReportService;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;


    // =========================================================
    // CREATE REPORT
    // =========================================================

    @PostMapping
    @PreAuthorize("hasAuthority('REPORT_CREATE')")
    public ApiResponse<ReportResponseDTO> createReport(
            @RequestBody ReportRequestDTO request) {

        return reportService.createReport(request);
    }


    // =========================================================
    // GET ALL REPORTS
    // =========================================================

    @GetMapping
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<List<ReportResponseDTO>> getAllReports() {

        return reportService.getAllReports();
    }


    // =========================================================
    // GET REPORT BY DATABASE ID
    // =========================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<ReportResponseDTO> getById(
            @PathVariable Long id) {

        return reportService.getReportById(id);
    }


    // =========================================================
    // GET REPORT BY REPORT CODE
    // =========================================================

    @GetMapping("/code/{reportId}")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<ReportResponseDTO> getByReportId(
            @PathVariable String reportId) {

        return reportService.getReportByReportId(reportId);
    }


    // =========================================================
    // UPDATE REPORT
    // =========================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('REPORT_UPDATE')")
    public ApiResponse<ReportResponseDTO> updateReport(
            @PathVariable Long id,
            @RequestBody ReportRequestDTO request) {

        return reportService.updateReport(id, request);
    }


    // =========================================================
    // DELETE REPORT
    // =========================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('REPORT_DELETE')")
    public ApiResponse<String> deleteReport(
            @PathVariable Long id) {

        return reportService.deleteReport(id);
    }


    // =========================================================
    // REPORTS BY USER
    // =========================================================

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<List<ReportResponseDTO>> getByUser(
            @PathVariable Long userId) {

        return reportService.getReportsByUser(userId);
    }


    // =========================================================
    // REPORTS BY TYPE
    // =========================================================

    @GetMapping("/type/{type}")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<List<ReportResponseDTO>> getByType(
            @PathVariable ReportType type) {

        return reportService.getReportsByType(type);
    }


    // =========================================================
    // REPORTS BY STATUS
    // =========================================================

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<List<ReportResponseDTO>> getByStatus(
            @PathVariable ReportStatus status) {

        return reportService.getReportsByStatus(status);
    }


    // =========================================================
    // RISK REPORTS
    // =========================================================

    @GetMapping("/risk/{riskId}")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<List<ReportResponseDTO>> getByRisk(
            @PathVariable Long riskId) {

        return reportService.getReportsByRisk(riskId);
    }


    // =========================================================
    // KRI REPORTS
    // =========================================================

    @GetMapping("/kri/{kriId}")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<List<ReportResponseDTO>> getByKri(
            @PathVariable Long kriId) {

        return reportService.getReportsByKri(kriId);
    }


    // =========================================================
    // MITIGATION REPORTS
    // =========================================================

    @GetMapping("/mitigation/{mitigationId}")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<List<ReportResponseDTO>> getByMitigation(
            @PathVariable Long mitigationId) {

        return reportService.getReportsByMitigation(mitigationId);
    }


    // =========================================================
    // SEARCH REPORTS
    // =========================================================

    @GetMapping("/search")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<List<ReportResponseDTO>> search(
            @RequestParam String keyword) {

        return reportService.searchReports(keyword);
    }


    // =========================================================
    // DATE FILTER
    // =========================================================

    @GetMapping("/between")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<List<ReportResponseDTO>> getBetweenDates(

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime start,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime end) {

        return reportService.getReportsBetweenDates(start, end);
    }


    // =========================================================
    // LATEST REPORTS
    // =========================================================

    @GetMapping("/latest")
    @PreAuthorize("hasAuthority('REPORT_VIEW')")
    public ApiResponse<List<ReportResponseDTO>> latestReports() {

        return reportService.getLatestReports();
    }


    // =========================================================
    // REPORT DASHBOARD
    // =========================================================

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('REPORT_DASHBOARD_VIEW')")
    public ApiResponse<Map<String, Long>> dashboard() {

        return reportService.getReportDashboard();
    }
}
