package com.example.audit_risk_management.dto;

import com.example.audit_risk_management.enums.ReportStatus;
import com.example.audit_risk_management.enums.ReportType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ReportRequestDTO {


    @NotBlank(message = "Report title is required")
    @Size(max = 200)
    private String reportTitle;


    @Size(max = 1000)
    private String description;



    @NotNull(message = "Report type is required")
    private ReportType reportType;



    private ReportStatus status;



    // Optional relation fields

    private Long riskId;


    private Long kriId;


    private Long mitigationId;



    private String fileName;


    private String filePath;



    public ReportRequestDTO() {

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


    public Long getRiskId() {
        return riskId;
    }


    public void setRiskId(Long riskId) {
        this.riskId = riskId;
    }


    public Long getKriId() {
        return kriId;
    }


    public void setKriId(Long kriId) {
        this.kriId = kriId;
    }


    public Long getMitigationId() {
        return mitigationId;
    }


    public void setMitigationId(Long mitigationId) {
        this.mitigationId = mitigationId;
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

}