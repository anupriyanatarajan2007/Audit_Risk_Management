package com.example.audit_risk_management.dto;

import java.time.LocalDateTime;

import com.example.audit_risk_management.enums.ReportStatus;
import com.example.audit_risk_management.enums.ReportType;

public class ReportResponseDTO {


    private Long id;

    private String reportId;

    private String reportTitle;

    private String description;


    private ReportType reportType;

    private ReportStatus status;


    // Generated user details

    private Long generatedById;

    private String generatedByName;

    private String generatedByEmployeeId;



    // Related details

    private Long riskId;

    private String riskCode;

    private String riskTitle;



    private Long kriId;

    private String kriCode;

    private String kriName;



    private Long mitigationId;

    private String mitigationCode;

    private String mitigationTitle;



    // File details

    private String fileName;

    private String filePath;



    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;



    public ReportResponseDTO() {

    }



    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public String getReportId() {
        return reportId;
    }


    public void setReportId(String reportId) {
        this.reportId = reportId;
    }


    public String getReportTitle() {
        return reportTitle;
    }


    public void setReportTitle(String reportTitle) {
        this.reportTitle = reportTitle;
    }


    public String getDescription() {
        return description;
    }


    public void setDescription(String description) {
        this.description = description;
    }


    public ReportType getReportType() {
        return reportType;
    }


    public void setReportType(ReportType reportType) {
        this.reportType = reportType;
    }


    public ReportStatus getStatus() {
        return status;
    }


    public void setStatus(ReportStatus status) {
        this.status = status;
    }


    public Long getGeneratedById() {
        return generatedById;
    }


    public void setGeneratedById(Long generatedById) {
        this.generatedById = generatedById;
    }


    public String getGeneratedByName() {
        return generatedByName;
    }


    public void setGeneratedByName(String generatedByName) {
        this.generatedByName = generatedByName;
    }


    public String getGeneratedByEmployeeId() {
        return generatedByEmployeeId;
    }


    public void setGeneratedByEmployeeId(String generatedByEmployeeId) {
        this.generatedByEmployeeId = generatedByEmployeeId;
    }


    public Long getRiskId() {
        return riskId;
    }


    public void setRiskId(Long riskId) {
        this.riskId = riskId;
    }


    public String getRiskCode() {
        return riskCode;
    }


    public void setRiskCode(String riskCode) {
        this.riskCode = riskCode;
    }


    public String getRiskTitle() {
        return riskTitle;
    }


    public void setRiskTitle(String riskTitle) {
        this.riskTitle = riskTitle;
    }


    public Long getKriId() {
        return kriId;
    }


    public void setKriId(Long kriId) {
        this.kriId = kriId;
    }


    public String getKriCode() {
        return kriCode;
    }


    public void setKriCode(String kriCode) {
        this.kriCode = kriCode;
    }


    public String getKriName() {
        return kriName;
    }


    public void setKriName(String kriName) {
        this.kriName = kriName;
    }


    public Long getMitigationId() {
        return mitigationId;
    }


    public void setMitigationId(Long mitigationId) {
        this.mitigationId = mitigationId;
    }


    public String getMitigationCode() {
        return mitigationCode;
    }


    public void setMitigationCode(String mitigationCode) {
        this.mitigationCode = mitigationCode;
    }


    public String getMitigationTitle() {
        return mitigationTitle;
    }


    public void setMitigationTitle(String mitigationTitle) {
        this.mitigationTitle = mitigationTitle;
    }


    public String getFileName() {
        return fileName;
    }


    public void setFileName(String fileName) {
        this.fileName = fileName;
    }


    public String getFilePath() {
        return filePath;
    }


    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }


    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }


    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

}