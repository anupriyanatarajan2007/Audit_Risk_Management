package com.example.audit_risk_management.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.audit_risk_management.model.Report;
import com.example.audit_risk_management.repository.ReportRepository;
import com.example.audit_risk_management.service.ReportGeneratorService;

@RestController
@RequestMapping("/api/report-generator")
@CrossOrigin(origins = "*")
public class ReportGeneratorController {

    @Autowired
    private ReportGeneratorService reportGeneratorService;

    @Autowired
    private ReportRepository reportRepository;


    // =========================================================
    // GENERATE PDF
    // =========================================================

    @GetMapping("/pdf/{reportId}")
    @PreAuthorize("hasAuthority('REPORT_PDF_GENERATE')")
    public ResponseEntity<Resource> generatePdf(
            @PathVariable String reportId) {

        Report report = reportRepository.findByReportId(reportId)
                .orElseThrow(() ->
                        new RuntimeException("Report not found"));

        Resource resource =
                reportGeneratorService.generatePdfReport(report);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + reportId + ".pdf\""
                )
                .body(resource);
    }


    // =========================================================
    // GENERATE WORD
    // =========================================================

    @GetMapping("/word/{reportId}")
    @PreAuthorize("hasAuthority('REPORT_WORD_GENERATE')")
    public ResponseEntity<Resource> generateWord(
            @PathVariable String reportId) {

        Report report = reportRepository.findByReportId(reportId)
                .orElseThrow(() ->
                        new RuntimeException("Report not found"));

        Resource resource =
                reportGeneratorService.generateWordReport(report);

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        )
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + reportId + ".docx\""
                )
                .body(resource);
    }


    // =========================================================
    // SAVE PDF TO SERVER
    // =========================================================

    @PostMapping("/save/pdf/{reportId}")
    @PreAuthorize("hasAuthority('REPORT_PDF_SAVE')")
    public ResponseEntity<String> savePdf(
            @PathVariable String reportId) {

        Report report = reportRepository.findByReportId(reportId)
                .orElseThrow(() ->
                        new RuntimeException("Report not found"));

        String path =
                reportGeneratorService.savePdfFile(report);

        return ResponseEntity.ok(path);
    }


    // =========================================================
    // SAVE WORD TO SERVER
    // =========================================================

    @PostMapping("/save/word/{reportId}")
    @PreAuthorize("hasAuthority('REPORT_WORD_SAVE')")
    public ResponseEntity<String> saveWord(
            @PathVariable String reportId) {

        Report report = reportRepository.findByReportId(reportId)
                .orElseThrow(() ->
                        new RuntimeException("Report not found"));

        String path =
                reportGeneratorService.saveWordFile(report);

        return ResponseEntity.ok(path);
    }
}