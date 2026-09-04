package com.example.audit_risk_management.service;

import org.springframework.core.io.Resource;

import com.example.audit_risk_management.model.Report;

public interface ReportGeneratorService {


    // Generate PDF file
    Resource generatePdfReport(
            Report report);



    // Generate Word document
    Resource generateWordReport(
            Report report);



    // Save generated file details
    String savePdfFile(
            Report report);



    String saveWordFile(
            Report report);

}