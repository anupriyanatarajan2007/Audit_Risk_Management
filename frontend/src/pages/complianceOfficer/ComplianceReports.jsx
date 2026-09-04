import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import RiskService from "../../service/riskService";
import AuditService from "../../service/AuditService";

import {
    getFindingsByAuditId,
} from "../../service/findingService";

import {
    getEvidenceByAudit,
    getEvidenceByFinding,
} from "../../service/EvidenceService";

// ============================================================
// HELPERS
// ============================================================

const safeArray = (value) => {
    if (Array.isArray(value)) return value;

    if (Array.isArray(value?.data)) {
        return value.data;
    }

    return [];
};

const formatValue = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "N/A";
    }

    if (typeof value === "object") {
        return (
            value?.name ||
            value?.title ||
            value?.label ||
            value?.status ||
            JSON.stringify(value)
        );
    }

    return String(value);
};

const formatDate = (value) => {
    if (!value) return "N/A";

    try {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return String(value);
    }
};

const getRiskLevel = (risk) => {
    return (
        risk?.level ||
        risk?.riskLevel ||
        "N/A"
    );
};

// Backend Finding DTO sends "observation", not "description".
// Keep a fallback chain so this survives if the field ever gets renamed.
const getFindingObservation = (finding) => {
    return (
        finding?.observation ||
        finding?.description ||
        null
    );
};

const getFindingSeverity = (finding) => {
    return (
        finding?.severity ||
        finding?.riskLevel ||
        finding?.riskSeverity ||
        "N/A"
    );
};

// Backend sends "auditorName" (the internal auditor who raised the finding),
// not "assignedToName".
const getFindingAuditorName = (finding) => {
    return (
        finding?.auditorName ||
        finding?.assignedToName ||
        null
    );
};

const getAuditDatabaseId = (audit) => {
    return (
        audit?.id ||
        audit?.auditDbId ||
        null
    );
};

const getFindingId = (finding) => {
    return (
        finding?.id ||
        finding?.findingId ||
        null
    );
};

const getEvidenceId = (evidence) => {
    return (
        evidence?.id ||
        evidence?.evidenceId ||
        null
    );
};

// Backend Evidence DTO doesn't send fileType/type/contentType, so
// derive a readable type from the file extension in fileUrl/fileName.
const getEvidenceFileType = (evidence) => {
    const explicit =
        evidence?.fileType ||
        evidence?.type ||
        evidence?.contentType;

    if (explicit) return explicit;

    const source =
        evidence?.fileName ||
        evidence?.fileUrl ||
        "";

    const match = source.match(/\.([a-zA-Z0-9]+)$/);

    return match ? match[1].toUpperCase() : null;
};

// Backend "uploadedBy" is currently null on the DTO; handle both a plain
// name string and a future {id, name} object shape gracefully.
const getEvidenceUploadedBy = (evidence) => {
    if (evidence?.uploadedByName) return evidence.uploadedByName;

    if (evidence?.uploadedBy && typeof evidence.uploadedBy === "object") {
        return (
            evidence.uploadedBy?.name ||
            evidence.uploadedBy?.fullName ||
            null
        );
    }

    return evidence?.uploadedBy || null;
};

const getEvidenceStatus = (evidence) => {
    return (
        evidence?.status ||
        evidence?.verificationStatus ||
        null
    );
};

// A single evidence record (e.g. one that has a findingId) shows up in
// BOTH the audit-level evidence list AND its finding's evidence list.
// Dedupe by ID so counts/tables don't double it.
const getUniqueEvidenceForReport = (report) => {

    const findings =
        report?.findings || [];

    const auditEvidence =
        safeArray(report?.auditEvidence);

    const findingEvidence =
        findings.flatMap((finding) =>
            safeArray(finding.evidence)
        );

    const combined = [
        ...auditEvidence,
        ...findingEvidence,
    ];

    const seen = new Set();
    const unique = [];

    combined.forEach((item) => {

        const id = getEvidenceId(item);

        // Items without an id can't be deduped reliably, keep them.
        const key =
            id !== null && id !== undefined
                ? String(id)
                : `no-id-${unique.length}`;

        if (seen.has(key)) return;

        seen.add(key);
        unique.push(item);
    });

    return unique;
};

// ============================================================
// COMPONENT
// ============================================================

const ComplianceReports = () => {

    const [risks, setRisks] = useState([]);
    const [audits, setAudits] = useState([]);

    const [reportData, setReportData] = useState([]);

    const [selectedReport, setSelectedReport] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [generating, setGenerating] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [riskLevelFilter, setRiskLevelFilter] =
        useState("ALL");

    const [error, setError] =
        useState("");

    // ========================================================
    // LOAD COMPLETE COMPLIANCE DATA
    // ========================================================

    useEffect(() => {
        loadComplianceReports();
    }, []);

    const loadComplianceReports = async () => {

        try {

            setLoading(true);
            setError("");

            // ------------------------------------------------
            // GET RISKS + AUDITS
            // ------------------------------------------------

            const [
                riskResponse,
                auditResponse,
            ] = await Promise.all([
                RiskService.getAllRisks(),
                AuditService.getAllAudits(),
            ]);

            const riskList =
                safeArray(riskResponse);

            const auditList =
                safeArray(auditResponse);

            setRisks(riskList);
            setAudits(auditList);

            // ------------------------------------------------
            // BUILD REPORT
            // ------------------------------------------------

            const reports = [];

            for (
                const audit of auditList
            ) {

                const auditDbId =
                    getAuditDatabaseId(audit);

                if (!auditDbId) {
                    console.warn(
                        "Audit database ID missing:",
                        audit
                    );

                    continue;
                }

                // ============================================
                // FIND RISK USING riskId
                // ============================================

                const matchingRisk =
                    riskList.find(
                        (risk) =>
                            String(
                                risk?.riskId
                            ) ===
                            String(
                                audit?.riskId
                            )
                    ) || null;

                // ============================================
                // GET FINDINGS
                // ============================================

                let findings = [];

                try {

                    findings =
                        safeArray(
                            await getFindingsByAuditId(
                                auditDbId
                            )
                        );

                } catch (findingError) {

                    console.error(
                        "FINDINGS LOAD ERROR:",
                        findingError
                    );

                    findings = [];
                }

                // ============================================
                // GET AUDIT LEVEL EVIDENCE
                // ============================================

                let auditEvidence = [];

                try {

                    auditEvidence =
                        safeArray(
                            await getEvidenceByAudit(
                                auditDbId
                            )
                        );

                } catch (evidenceError) {

                    console.error(
                        "AUDIT EVIDENCE LOAD ERROR:",
                        evidenceError
                    );

                    auditEvidence = [];
                }

                // ============================================
                // GET EVIDENCE FOR EACH FINDING
                // ============================================

                const findingsWithEvidence = [];

                for (
                    const finding of findings
                ) {

                    const findingId =
                        getFindingId(
                            finding
                        );

                    let findingEvidence =
                        [];

                    if (findingId) {

                        try {

                            findingEvidence =
                                safeArray(
                                    await getEvidenceByFinding(
                                        findingId
                                    )
                                );

                        } catch (
                            findingEvidenceError
                        ) {

                            console.error(
                                `Evidence load failed for finding ${findingId}:`,
                                findingEvidenceError
                            );

                            findingEvidence =
                                [];
                        }
                    }

                    findingsWithEvidence.push({
                        ...finding,
                        evidence:
                            findingEvidence,
                    });
                }

                // ============================================
                // FINAL REPORT OBJECT
                // ============================================

                reports.push({
                    risk: matchingRisk,
                    audit,
                    findings:
                        findingsWithEvidence,
                    auditEvidence,
                });
            }

            setReportData(reports);

        } catch (err) {

            console.error(
                "COMPLIANCE REPORT LOAD ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load compliance reports."
            );

        } finally {

            setLoading(false);
        }
    };

    // ========================================================
    // FILTERED REPORTS
    // ========================================================

    const filteredReports = useMemo(() => {

        return reportData.filter(
            (report) => {

                const risk =
                    report.risk;

                const audit =
                    report.audit;

                const searchText = `
                    ${risk?.riskId || ""}
                    ${risk?.title || ""}
                    ${risk?.riskTitle || ""}
                    ${audit?.auditId || ""}
                    ${audit?.auditName || ""}
                    ${audit?.businessUnit || ""}
                    ${audit?.processName || ""}
                    ${audit?.riskId || ""}
                `.toLowerCase();

                const matchesSearch =
                    searchText.includes(
                        search.toLowerCase()
                    );

                const auditStatus =
                    String(
                        audit?.status || ""
                    ).toUpperCase();

                const matchesStatus =
                    statusFilter === "ALL" ||
                    auditStatus ===
                        statusFilter;

                const riskLevel =
                    String(
                        getRiskLevel(
                            risk
                        )
                    ).toUpperCase();

                const matchesRiskLevel =
                    riskLevelFilter ===
                        "ALL" ||
                    riskLevel ===
                        riskLevelFilter;

                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesRiskLevel
                );
            }
        );

    }, [
        reportData,
        search,
        statusFilter,
        riskLevelFilter,
    ]);

    // ========================================================
    // SUMMARY
    // ========================================================

    const summary = useMemo(() => {

        let findingCount = 0;
        let evidenceCount = 0;
        let criticalCount = 0;

        reportData.forEach(
            (report) => {

                const findings =
                    report.findings || [];

                findingCount +=
                    findings.length;

                // Dedupe here — the same evidence record can appear in
                // both report.auditEvidence and a finding's evidence list.
                evidenceCount +=
                    getUniqueEvidenceForReport(
                        report
                    ).length;

                findings.forEach(
                    (finding) => {

                        if (
                            String(
                                getFindingSeverity(
                                    finding
                                )
                            ).toUpperCase() ===
                            "CRITICAL"
                        ) {
                            criticalCount++;
                        }
                    }
                );
            }
        );

        return {
            risks: risks.length,
            audits: reportData.length,
            findings: findingCount,
            evidence: evidenceCount,
            critical: criticalCount,
        };

    }, [
        risks,
        reportData,
    ]);

    // ========================================================
    // GENERATE PDF
    // ========================================================

    const generatePDF = (report) => {

        try {

            setGenerating(true);

            const doc =
                new jsPDF({
                    orientation: "portrait",
                    unit: "mm",
                    format: "a4",
                });

            const risk =
                report.risk;

            const audit =
                report.audit;

            const findings =
                report.findings || [];

            const auditEvidence =
                report.auditEvidence || [];

            const auditCode =
                audit?.auditId ||
                `AUDIT-${audit?.id}`;

            // ==================================================
            // HEADER
            // ==================================================

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(20);

            doc.text(
                "COMPLIANCE AUDIT REPORT",
                105,
                18,
                {
                    align: "center",
                }
            );

            doc.setFont(
                "helvetica",
                "normal"
            );

            doc.setFontSize(9);

            doc.text(
                `Generated on: ${new Date().toLocaleString(
                    "en-IN"
                )}`,
                105,
                25,
                {
                    align: "center",
                }
            );

            doc.line(
                14,
                30,
                196,
                30
            );

            let y = 38;

            // ==================================================
            // 1. RISK INFORMATION
            // ==================================================

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.setFontSize(14);

            doc.text(
                "1. RISK INFORMATION",
                14,
                y
            );

            y += 6;

            autoTable(doc, {
                startY: y,

                theme: "grid",

                styles: {
                    fontSize: 8.5,
                    cellPadding: 3,
                },

                headStyles: {
                    fontStyle: "bold",
                },

                columnStyles: {
                    0: {
                        cellWidth: 48,
                    },

                    1: {
                        cellWidth: 132,
                    },
                },

                head: [
                    [
                        "Field",
                        "Details",
                    ],
                ],

                body: [
                    [
                        "Risk ID",
                        formatValue(
                            risk?.riskId
                        ),
                    ],

                    [
                        "Title",
                        formatValue(
                            risk?.title
                        ),
                    ],

                    [
                        "Description",
                        formatValue(
                            risk?.description
                        ),
                    ],

                    [
                        "Business Unit",
                        formatValue(
                            risk?.businessUnit
                        ),
                    ],

                    [
                        "Category",
                        formatValue(
                            risk?.category
                        ),
                    ],

                    [
                        "Process Name",
                        formatValue(
                            risk?.processName
                        ),
                    ],

                    [
                        "Likelihood",
                        formatValue(
                            risk?.likelihood
                        ),
                    ],

                    [
                        "Impact",
                        formatValue(
                            risk?.impact
                        ),
                    ],

                    [
                        "Risk Score",
                        formatValue(
                            risk?.riskScore
                        ),
                    ],

                    [
                        "Risk Level",
                        formatValue(
                            risk?.level
                        ),
                    ],

                    [
                        "Status",
                        formatValue(
                            risk?.status
                        ),
                    ],

                    [
                        "Department",
                        formatValue(
                            risk?.department?.name
                        ),
                    ],

                    [
                        "Identified By",
                        formatValue(
                            risk?.identifiedByName
                        ),
                    ],

                    [
                        "Existing Controls",
                        formatValue(
                            risk?.existingControls
                        ),
                    ],

                    [
                        "Mitigation Plan",
                        formatValue(
                            risk?.mitigationPlan
                        ),
                    ],

                    [
                        "Target Closure Date",
                        formatDate(
                            risk?.targetClosureDate
                        ),
                    ],

                    [
                        "Actual Closure Date",
                        formatDate(
                            risk?.actualClosureDate
                        ),
                    ],

                    [
                        "Remarks",
                        formatValue(
                            risk?.remarks
                        ),
                    ],
                ],
            });

            y =
                doc.lastAutoTable.finalY +
                10;

            // ==================================================
            // 2. AUDIT INFORMATION
            // ==================================================

            if (y > 250) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(14);

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.text(
                "2. AUDIT INFORMATION",
                14,
                y
            );

            y += 6;

            autoTable(doc, {
                startY: y,

                theme: "grid",

                styles: {
                    fontSize: 8.5,
                    cellPadding: 3,
                },

                columnStyles: {
                    0: {
                        cellWidth: 48,
                    },

                    1: {
                        cellWidth: 132,
                    },
                },

                head: [
                    [
                        "Field",
                        "Details",
                    ],
                ],

                body: [
                    [
                        "Database ID",
                        formatValue(
                            audit?.id
                        ),
                    ],

                    [
                        "Audit ID",
                        formatValue(
                            audit?.auditId
                        ),
                    ],

                    [
                        "Audit Name",
                        formatValue(
                            audit?.auditName
                        ),
                    ],

                    [
                        "Description",
                        formatValue(
                            audit?.description
                        ),
                    ],

                    [
                        "Business Unit",
                        formatValue(
                            audit?.businessUnit
                        ),
                    ],

                    [
                        "Department",
                        formatValue(
                            audit?.department?.name
                        ),
                    ],

                    [
                        "Process Name",
                        formatValue(
                            audit?.processName
                        ),
                    ],

                    [
                        "Risk ID",
                        formatValue(
                            audit?.riskId
                        ),
                    ],

                    [
                        "Risk Title",
                        formatValue(
                            audit?.riskTitle
                        ),
                    ],

                    [
                        "Internal Auditor",
                        formatValue(
                            audit?.internalAuditorName
                        ),
                    ],

                    [
                        "Internal Auditor ID",
                        formatValue(
                            audit?.internalAuditorId
                        ),
                    ],

                    [
                        "Auditee",
                        formatValue(
                            audit?.auditeeName
                        ),
                    ],

                    [
                        "Auditee ID",
                        formatValue(
                            audit?.auditeeId
                        ),
                    ],

                    [
                        "Start Date",
                        formatDate(
                            audit?.startDate
                        ),
                    ],

                    [
                        "End Date",
                        formatDate(
                            audit?.endDate
                        ),
                    ],

                    [
                        "Status",
                        formatValue(
                            audit?.status
                        ),
                    ],
                ],
            });

            y =
                doc.lastAutoTable.finalY +
                10;

            // ==================================================
            // 3. FINDINGS
            // ==================================================

            if (y > 250) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(14);

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.text(
                `3. FINDINGS (${findings.length})`,
                14,
                y
            );

            y += 7;

            if (
                findings.length === 0
            ) {

                doc.setFontSize(9);

                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.text(
                    "No findings available for this audit.",
                    14,
                    y
                );

                y += 10;

            } else {

                findings.forEach(
                    (
                        finding,
                        index
                    ) => {

                        if (y > 245) {
                            doc.addPage();
                            y = 20;
                        }

                        doc.setFontSize(11);

                        doc.setFont(
                            "helvetica",
                            "bold"
                        );

                        doc.text(
                            `Finding ${index + 1}`,
                            14,
                            y
                        );

                        y += 5;

                        autoTable(doc, {
                            startY: y,

                            theme: "grid",

                            styles: {
                                fontSize: 8,
                                cellPadding: 2.5,
                            },

                            columnStyles: {
                                0: {
                                    cellWidth: 48,
                                },

                                1: {
                                    cellWidth: 132,
                                },
                            },

                            body: [
                                [
                                    "Finding ID",
                                    formatValue(
                                        getFindingId(
                                            finding
                                        )
                                    ),
                                ],

                                [
                                    "Title",
                                    formatValue(
                                        finding?.title
                                    ),
                                ],

                                [
                                    "Observation",
                                    formatValue(
                                        getFindingObservation(
                                            finding
                                        )
                                    ),
                                ],

                                [
                                    "Severity",
                                    formatValue(
                                        getFindingSeverity(
                                            finding
                                        )
                                    ),
                                ],

                                [
                                    "Risk Level",
                                    formatValue(
                                        finding?.riskLevel
                                    ),
                                ],

                                [
                                    "Recommendation",
                                    formatValue(
                                        finding?.recommendation
                                    ),
                                ],

                                [
                                    "Status",
                                    formatValue(
                                        finding?.status
                                    ),
                                ],

                                [
                                    "Auditor",
                                    formatValue(
                                        getFindingAuditorName(
                                            finding
                                        )
                                    ),
                                ],
                            ],
                        });

                        y =
                            doc.lastAutoTable.finalY +
                            5;

                        // ======================================
                        // FINDING EVIDENCE
                        // ======================================

                        const evidence =
                            safeArray(
                                finding.evidence
                            );

                        doc.setFontSize(9);

                        doc.setFont(
                            "helvetica",
                            "bold"
                        );

                        doc.text(
                            `Evidence (${evidence.length})`,
                            14,
                            y
                        );

                        y += 4;

                        if (
                            evidence.length ===
                            0
                        ) {

                            doc.setFont(
                                "helvetica",
                                "normal"
                            );

                            doc.setFontSize(8);

                            doc.text(
                                "No evidence available.",
                                14,
                                y + 4
                            );

                            y += 10;

                        } else {

                            autoTable(doc, {
                                startY: y,

                                theme: "grid",

                                styles: {
                                    fontSize: 7,
                                    cellPadding: 2,
                                },

                                head: [
                                    [
                                        "ID",
                                        "File Name",
                                        "Type",
                                        "Uploaded By",
                                        "Date",
                                        "Status",
                                    ],
                                ],

                                body:
                                    evidence.map(
                                        (
                                            item
                                        ) => [
                                            formatValue(
                                                getEvidenceId(
                                                    item
                                                )
                                            ),

                                            formatValue(
                                                item?.fileName
                                            ),

                                            formatValue(
                                                getEvidenceFileType(
                                                    item
                                                )
                                            ),

                                            formatValue(
                                                getEvidenceUploadedBy(
                                                    item
                                                )
                                            ),

                                            formatDate(
                                                item?.uploadedAt
                                            ),

                                            formatValue(
                                                getEvidenceStatus(
                                                    item
                                                )
                                            ),
                                        ]
                                    ),
                            });

                            y =
                                doc.lastAutoTable.finalY +
                                7;
                        }
                    }
                );
            }

            // ==================================================
            // 4. AUDIT LEVEL EVIDENCE
            // ==================================================

            if (y > 245) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(14);

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.text(
                `4. AUDIT LEVEL EVIDENCE (${auditEvidence.length})`,
                14,
                y
            );

            y += 7;

            if (
                auditEvidence.length ===
                0
            ) {

                doc.setFontSize(9);

                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.text(
                    "No audit-level evidence available.",
                    14,
                    y
                );

            } else {

                autoTable(doc, {
                    startY: y,

                    theme: "grid",

                    styles: {
                        fontSize: 7.5,
                        cellPadding: 2,
                    },

                    head: [
                        [
                            "ID",
                            "File Name",
                            "Type",
                            "Description",
                            "Uploaded By",
                            "Status",
                        ],
                    ],

                    body:
                        auditEvidence.map(
                            (
                                item
                            ) => [
                                formatValue(
                                    getEvidenceId(
                                        item
                                    )
                                ),

                                formatValue(
                                    item?.fileName
                                ),

                                formatValue(
                                    getEvidenceFileType(
                                        item
                                    )
                                ),

                                formatValue(
                                    item?.description
                                ),

                                formatValue(
                                    getEvidenceUploadedBy(
                                        item
                                    )
                                ),

                                formatValue(
                                    getEvidenceStatus(
                                        item
                                    )
                                ),
                            ]
                        ),
                });

                y =
                    doc.lastAutoTable.finalY +
                    10;
            }

            // ==================================================
            // 5. SUMMARY
            // ==================================================

            if (y > 245) {
                doc.addPage();
                y = 20;
            }

            doc.setFontSize(14);

            doc.setFont(
                "helvetica",
                "bold"
            );

            doc.text(
                "5. COMPLIANCE SUMMARY",
                14,
                y
            );

            y += 7;

            const uniqueEvidenceCount =
                getUniqueEvidenceForReport(
                    report
                ).length;

            autoTable(doc, {
                startY: y,

                theme: "grid",

                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                },

                head: [
                    [
                        "Metric",
                        "Count",
                    ],
                ],

                body: [
                    [
                        "Total Risks",
                        risks.length,
                    ],

                    [
                        "Total Audits",
                        reportData.length,
                    ],

                    [
                        "Findings in this Audit",
                        findings.length,
                    ],

                    [
                        "Evidence in this Audit",
                        uniqueEvidenceCount,
                    ],

                    [
                        "Critical Findings",
                        findings.filter(
                            (finding) =>
                                String(
                                    getFindingSeverity(
                                        finding
                                    )
                                ).toUpperCase() ===
                                "CRITICAL"
                        ).length,
                    ],
                ],
            });

            // ==================================================
            // FOOTER
            // ==================================================

            const pageCount =
                doc.internal.getNumberOfPages();

            for (
                let page = 1;
                page <= pageCount;
                page++
            ) {

                doc.setPage(page);

                doc.setFontSize(8);

                doc.setFont(
                    "helvetica",
                    "normal"
                );

                doc.text(
                    `Compliance Audit Report | ${auditCode} | Page ${page} of ${pageCount}`,
                    105,
                    290,
                    {
                        align: "center",
                    }
                );
            }

            // ==================================================
            // DOWNLOAD
            // ==================================================

            const fileName =
                String(
                    auditCode
                ).replace(
                    /[^a-zA-Z0-9-_]/g,
                    "_"
                );

            doc.save(
                `Compliance_Report_${fileName}.pdf`
            );

        } catch (pdfError) {

            console.error(
                "PDF GENERATION ERROR:",
                pdfError
            );

            alert(
                "Failed to generate PDF."
            );

        } finally {

            setGenerating(false);
        }
    };

    // ========================================================
    // DOWNLOAD ALL
    // ========================================================

    const downloadAllReports = () => {

        if (
            filteredReports.length ===
            0
        ) {
            alert(
                "No reports available."
            );

            return;
        }

        filteredReports.forEach(
            (
                report,
                index
            ) => {

                setTimeout(
                    () => {
                        generatePDF(
                            report
                        );
                    },
                    index * 1000
                );
            }
        );
    };

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">

            {/* HEADER */}

            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Compliance Reports
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Complete Risk, Audit, Finding and Evidence reports
                    </p>
                </div>

                <button
                    onClick={
                        downloadAllReports
                    }
                    disabled={
                        loading ||
                        generating ||
                        filteredReports.length ===
                            0
                    }
                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {generating
                        ? "Generating PDF..."
                        : "Download All PDFs"}
                </button>

            </div>

            {/* SUMMARY */}

            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

                <SummaryCard
                    title="Total Risks"
                    value={
                        summary.risks
                    }
                />

                <SummaryCard
                    title="Total Audits"
                    value={
                        summary.audits
                    }
                />

                <SummaryCard
                    title="Total Findings"
                    value={
                        summary.findings
                    }
                />

                <SummaryCard
                    title="Total Evidence"
                    value={
                        summary.evidence
                    }
                />

                <SummaryCard
                    title="Critical Findings"
                    value={
                        summary.critical
                    }
                />

            </div>

            {/* FILTER */}

            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    <input
                        type="text"
                        placeholder="Search Risk / Audit..."
                        value={
                            search
                        }
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                    />

                    <select
                        value={
                            statusFilter
                        }
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                    >
                        <option value="ALL">
                            All Audit Status
                        </option>

                        <option value="NEW">
                            New
                        </option>

                        <option value="PLANNED">
                            Planned
                        </option>

                        <option value="IN_PROGRESS">
                            In Progress
                        </option>

                        <option value="COMPLETED">
                            Completed
                        </option>

                        <option value="CLOSED">
                            Closed
                        </option>
                    </select>

                    <select
                        value={
                            riskLevelFilter
                        }
                        onChange={(e) =>
                            setRiskLevelFilter(
                                e.target.value
                            )
                        }
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                    >
                        <option value="ALL">
                            All Risk Levels
                        </option>

                        <option value="LOW">
                            Low
                        </option>

                        <option value="MEDIUM">
                            Medium
                        </option>

                        <option value="HIGH">
                            High
                        </option>

                        <option value="CRITICAL">
                            Critical
                        </option>
                    </select>

                </div>

            </div>

            {/* ERROR */}

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* LOADING */}

            {loading ? (

                <div className="flex min-h-[300px] items-center justify-center">

                    <div className="text-sm font-medium text-slate-500">
                        Loading compliance reports...
                    </div>

                </div>

            ) : filteredReports.length ===
              0 ? (

                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                    <h3 className="text-lg font-semibold text-slate-800">
                        No Compliance Reports Found
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                        No audit data matches your filters.
                    </p>

                </div>

            ) : (

                <div className="space-y-5">

                    {filteredReports.map(
                        (
                            report,
                            index
                        ) => {

                            const risk =
                                report.risk;

                            const audit =
                                report.audit;

                            const findings =
                                report.findings ||
                                [];

                            const evidenceCount =
                                getUniqueEvidenceForReport(
                                    report
                                ).length;

                            return (
                                <motion.div
                                    key={
                                        audit?.id ||
                                        index
                                    }
                                    initial={{
                                        opacity: 0,
                                        y: 15,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                                >

                                    {/* CARD HEADER */}

                                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">

                                        <div>

                                            <div className="flex flex-wrap items-center gap-2">

                                                <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                    {
                                                        audit?.auditId
                                                    }
                                                </span>

                                                <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                                    {
                                                        risk?.riskId
                                                    }
                                                </span>

                                                <StatusBadge
                                                    status={
                                                        audit?.status
                                                    }
                                                />

                                            </div>

                                            <h2 className="mt-3 text-xl font-bold text-slate-900">
                                                {
                                                    audit?.auditName
                                                }
                                            </h2>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {
                                                    risk?.title
                                                }
                                            </p>

                                        </div>

                                        <div className="flex gap-3">

                                            <button
                                                onClick={() =>
                                                    setSelectedReport(
                                                        report
                                                    )
                                                }
                                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                View Report
                                            </button>

                                            <button
                                                onClick={() =>
                                                    generatePDF(
                                                        report
                                                    )
                                                }
                                                disabled={
                                                    generating
                                                }
                                                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                                            >
                                                Download PDF
                                            </button>

                                        </div>

                                    </div>

                                    {/* CARD STATS */}

                                    <div className="grid grid-cols-2 divide-x divide-slate-100 md:grid-cols-4">

                                        <ReportStat
                                            label="Risk Level"
                                            value={
                                                risk?.level
                                            }
                                        />

                                        <ReportStat
                                            label="Risk Score"
                                            value={
                                                risk?.riskScore
                                            }
                                        />

                                        <ReportStat
                                            label="Findings"
                                            value={
                                                findings.length
                                            }
                                        />

                                        <ReportStat
                                            label="Evidence"
                                            value={
                                                evidenceCount
                                            }
                                        />

                                    </div>

                                </motion.div>
                            );
                        }
                    )}

                </div>
            )}

            {/* MODAL */}

            {selectedReport && (
                <ReportModal
                    report={
                        selectedReport
                    }
                    onClose={() =>
                        setSelectedReport(
                            null
                        )
                    }
                    onDownload={() =>
                        generatePDF(
                            selectedReport
                        )
                    }
                />
            )}

        </div>
    );
};

// ============================================================
// SUMMARY CARD
// ============================================================

const SummaryCard = ({
    title,
    value,
}) => {

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
                {title}
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
                {value}
            </p>

        </div>
    );
};

// ============================================================
// REPORT STAT
// ============================================================

const ReportStat = ({
    label,
    value,
}) => {

    return (
        <div className="p-5">

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-2 text-lg font-bold text-slate-800">
                {formatValue(
                    value
                )}
            </p>

        </div>
    );
};

// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({
    status,
}) => {

    return (
        <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {formatValue(
                status
            ).replace(
                /_/g,
                " "
            )}
        </span>
    );
};

// ============================================================
// MODAL
// ============================================================

const ReportModal = ({
    report,
    onClose,
    onDownload,
}) => {

    const risk =
        report.risk;

    const audit =
        report.audit;

    const findings =
        report.findings || [];

    const auditEvidence =
        report.auditEvidence || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="max-h-[92vh] w-full max-w-7xl overflow-hidden rounded-3xl bg-white shadow-2xl">

                {/* HEADER */}

                <div className="flex items-center justify-between border-b border-slate-200 p-5">

                    <div>

                        <h2 className="text-xl font-bold text-slate-900">
                            Compliance Audit Report
                        </h2>

                        <p className="text-sm text-slate-500">
                            {
                                audit?.auditId
                            }
                        </p>

                    </div>

                    <div className="flex gap-2">

                        <button
                            onClick={
                                onDownload
                            }
                            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                        >
                            Download PDF
                        </button>

                        <button
                            onClick={
                                onClose
                            }
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            Close
                        </button>

                    </div>

                </div>

                {/* CONTENT */}

                <div className="max-h-[calc(92vh-85px)] overflow-y-auto p-6">

                    {/* ========================================
                        RISK
                    ======================================== */}

                    <ReportSection
                        title="1. Risk Information"
                    >

                        <InfoGrid
                            items={[
                                [
                                    "Risk ID",
                                    risk?.riskId,
                                ],

                                [
                                    "Title",
                                    risk?.title,
                                ],

                                [
                                    "Business Unit",
                                    risk?.businessUnit,
                                ],

                                [
                                    "Category",
                                    risk?.category,
                                ],

                                [
                                    "Process Name",
                                    risk?.processName,
                                ],

                                [
                                    "Likelihood",
                                    risk?.likelihood,
                                ],

                                [
                                    "Impact",
                                    risk?.impact,
                                ],

                                [
                                    "Risk Score",
                                    risk?.riskScore,
                                ],

                                [
                                    "Risk Level",
                                    risk?.level,
                                ],

                                [
                                    "Status",
                                    risk?.status,
                                ],

                                [
                                    "Department",
                                    risk?.department?.name,
                                ],

                                [
                                    "Identified By",
                                    risk?.identifiedByName,
                                ],

                                [
                                    "Target Closure",
                                    formatDate(
                                        risk?.targetClosureDate
                                    ),
                                ],

                                [
                                    "Actual Closure",
                                    formatDate(
                                        risk?.actualClosureDate
                                    ),
                                ],
                            ]}
                        />

                        <LongText
                            label="Description"
                            value={
                                risk?.description
                            }
                        />

                        <LongText
                            label="Existing Controls"
                            value={
                                risk?.existingControls
                            }
                        />

                        <LongText
                            label="Mitigation Plan"
                            value={
                                risk?.mitigationPlan
                            }
                        />

                        <LongText
                            label="Remarks"
                            value={
                                risk?.remarks
                            }
                        />

                    </ReportSection>

                    {/* ========================================
                        AUDIT
                    ======================================== */}

                    <ReportSection
                        title="2. Audit Information"
                    >

                        <InfoGrid
                            items={[
                                [
                                    "Database ID",
                                    audit?.id,
                                ],

                                [
                                    "Audit ID",
                                    audit?.auditId,
                                ],

                                [
                                    "Audit Name",
                                    audit?.auditName,
                                ],

                                [
                                    "Business Unit",
                                    audit?.businessUnit,
                                ],

                                [
                                    "Department",
                                    audit?.department?.name,
                                ],

                                [
                                    "Process Name",
                                    audit?.processName,
                                ],

                                [
                                    "Risk ID",
                                    audit?.riskId,
                                ],

                                [
                                    "Risk Title",
                                    audit?.riskTitle,
                                ],

                                [
                                    "Internal Auditor",
                                    audit?.internalAuditorName,
                                ],

                                [
                                    "Internal Auditor ID",
                                    audit?.internalAuditorId,
                                ],

                                [
                                    "Auditee",
                                    audit?.auditeeName,
                                ],

                                [
                                    "Auditee ID",
                                    audit?.auditeeId,
                                ],

                                [
                                    "Start Date",
                                    formatDate(
                                        audit?.startDate
                                    ),
                                ],

                                [
                                    "End Date",
                                    formatDate(
                                        audit?.endDate
                                    ),
                                ],

                                [
                                    "Status",
                                    audit?.status,
                                ],
                            ]}
                        />

                        <LongText
                            label="Audit Description"
                            value={
                                audit?.description
                            }
                        />

                    </ReportSection>

                    {/* ========================================
                        FINDINGS
                    ======================================== */}

                    <ReportSection
                        title={`3. Findings (${findings.length})`}
                    >

                        {findings.length ===
                        0 ? (

                            <EmptyText text="No findings available for this audit." />

                        ) : (

                            <div className="space-y-5">

                                {findings.map(
                                    (
                                        finding,
                                        index
                                    ) => {

                                        const evidence =
                                            safeArray(
                                                finding.evidence
                                            );

                                        return (
                                            <div
                                                key={
                                                    getFindingId(
                                                        finding
                                                    ) ||
                                                    index
                                                }
                                                className="rounded-2xl border border-slate-200 p-5"
                                            >

                                                <div className="mb-4 flex items-center justify-between">

                                                    <h3 className="font-bold text-slate-900">
                                                        Finding #
                                                        {
                                                            index +
                                                            1
                                                        }
                                                    </h3>

                                                    <StatusBadge
                                                        status={
                                                            getFindingSeverity(
                                                                finding
                                                            )
                                                        }
                                                    />

                                                </div>

                                                <InfoGrid
                                                    items={[
                                                        [
                                                            "Finding ID",
                                                            getFindingId(
                                                                finding
                                                            ),
                                                        ],

                                                        [
                                                            "Title",
                                                            finding?.title,
                                                        ],

                                                        [
                                                            "Severity",
                                                            getFindingSeverity(
                                                                finding
                                                            ),
                                                        ],

                                                        [
                                                            "Risk Level",
                                                            finding?.riskLevel,
                                                        ],

                                                        [
                                                            "Status",
                                                            finding?.status,
                                                        ],

                                                        [
                                                            "Auditor",
                                                            getFindingAuditorName(
                                                                finding
                                                            ),
                                                        ],
                                                    ]}
                                                />

                                                <LongText
                                                    label="Observation"
                                                    value={
                                                        getFindingObservation(
                                                            finding
                                                        )
                                                    }
                                                />

                                                <LongText
                                                    label="Recommendation"
                                                    value={
                                                        finding?.recommendation
                                                    }
                                                />

                                                {/* EVIDENCE */}

                                                <div className="mt-5">

                                                    <h4 className="mb-3 text-sm font-bold text-slate-800">
                                                        Evidence (
                                                        {
                                                            evidence.length
                                                        }
                                                        )
                                                    </h4>

                                                    {evidence.length ===
                                                    0 ? (

                                                        <EmptyText text="No evidence available for this finding." />

                                                    ) : (

                                                        <div className="overflow-x-auto rounded-xl border border-slate-200">

                                                            <table className="min-w-full text-left text-sm">

                                                                <thead className="bg-slate-50">

                                                                    <tr>

                                                                        <th className="px-4 py-3">
                                                                            ID
                                                                        </th>

                                                                        <th className="px-4 py-3">
                                                                            File
                                                                        </th>

                                                                        <th className="px-4 py-3">
                                                                            Type
                                                                        </th>

                                                                        <th className="px-4 py-3">
                                                                            Uploaded By
                                                                        </th>

                                                                        <th className="px-4 py-3">
                                                                            Status
                                                                        </th>

                                                                    </tr>

                                                                </thead>

                                                                <tbody>

                                                                    {evidence.map(
                                                                        (
                                                                            item,
                                                                            evidenceIndex
                                                                        ) => (

                                                                            <tr
                                                                                key={
                                                                                    getEvidenceId(
                                                                                        item
                                                                                    ) ||
                                                                                    evidenceIndex
                                                                                }
                                                                                className="border-t border-slate-100"
                                                                            >

                                                                                <td className="px-4 py-3">
                                                                                    {
                                                                                        formatValue(
                                                                                            getEvidenceId(
                                                                                                item
                                                                                            )
                                                                                        )
                                                                                    }
                                                                                </td>

                                                                                <td className="px-4 py-3 font-medium">
                                                                                    {
                                                                                        formatValue(
                                                                                            item?.fileName
                                                                                        )
                                                                                    }
                                                                                </td>

                                                                                <td className="px-4 py-3">
                                                                                    {
                                                                                        formatValue(
                                                                                            getEvidenceFileType(
                                                                                                item
                                                                                            )
                                                                                        )
                                                                                    }
                                                                                </td>

                                                                                <td className="px-4 py-3">
                                                                                    {
                                                                                        formatValue(
                                                                                            getEvidenceUploadedBy(
                                                                                                item
                                                                                            )
                                                                                        )
                                                                                    }
                                                                                </td>

                                                                                <td className="px-4 py-3">
                                                                                    {
                                                                                        formatValue(
                                                                                            getEvidenceStatus(
                                                                                                item
                                                                                            )
                                                                                        )
                                                                                    }
                                                                                </td>

                                                                            </tr>
                                                                        )
                                                                    )}

                                                                </tbody>

                                                            </table>

                                                        </div>
                                                    )}

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>
                        )}

                    </ReportSection>

                    {/* ========================================
                        AUDIT LEVEL EVIDENCE
                    ======================================== */}

                    <ReportSection
                        title={`4. Audit Level Evidence (${auditEvidence.length})`}
                    >

                        {auditEvidence.length ===
                        0 ? (

                            <EmptyText text="No audit-level evidence available." />

                        ) : (

                            <div className="overflow-x-auto rounded-xl border border-slate-200">

                                <table className="min-w-full text-left text-sm">

                                    <thead className="bg-slate-50">

                                        <tr>

                                            <th className="px-4 py-3">
                                                ID
                                            </th>

                                            <th className="px-4 py-3">
                                                File
                                            </th>

                                            <th className="px-4 py-3">
                                                Type
                                            </th>

                                            <th className="px-4 py-3">
                                                Description
                                            </th>

                                            <th className="px-4 py-3">
                                                Uploaded By
                                            </th>

                                            <th className="px-4 py-3">
                                                Status
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {auditEvidence.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <tr
                                                    key={
                                                        getEvidenceId(
                                                            item
                                                        ) ||
                                                        index
                                                    }
                                                    className="border-t border-slate-100"
                                                >

                                                    <td className="px-4 py-3">
                                                        {
                                                            formatValue(
                                                                getEvidenceId(
                                                                    item
                                                                )
                                                            )
                                                        }
                                                    </td>

                                                    <td className="px-4 py-3 font-medium">
                                                        {
                                                            formatValue(
                                                                item?.fileName
                                                            )
                                                        }
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {
                                                            formatValue(
                                                                getEvidenceFileType(
                                                                    item
                                                                )
                                                            )
                                                        }
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {
                                                            formatValue(
                                                                item?.description
                                                            )
                                                        }
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {
                                                            formatValue(
                                                                getEvidenceUploadedBy(
                                                                    item
                                                                )
                                                            )
                                                        }
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {
                                                            formatValue(
                                                                getEvidenceStatus(
                                                                    item
                                                                )
                                                            )
                                                        }
                                                    </td>

                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}

                    </ReportSection>

                </div>

            </div>

        </div>
    );
};

// ============================================================
// SECTION
// ============================================================

const ReportSection = ({
    title,
    children,
}) => {

    return (
        <section className="mb-8">

            <h3 className="mb-4 text-lg font-bold text-slate-900">
                {title}
            </h3>

            {children}

        </section>
    );
};

// ============================================================
// INFO GRID
// ============================================================

const InfoGrid = ({
    items = [],
}) => {

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {items.map(
                (
                    [label, value],
                    index
                ) => (

                    <div
                        key={index}
                        className="rounded-xl bg-slate-50 p-4"
                    >

                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            {label}
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                            {
                                formatValue(
                                    value
                                )
                            }
                        </p>

                    </div>
                )
            )}

        </div>
    );
};

// ============================================================
// LONG TEXT
// ============================================================

const LongText = ({
    label,
    value,
}) => {

    return (
        <div className="mt-4 rounded-xl bg-slate-50 p-4">

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {
                    formatValue(
                        value
                    )
                }
            </p>

        </div>
    );
};

// ============================================================
// EMPTY
// ============================================================

const EmptyText = ({
    text,
}) => {

    return (
        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
            {text}
        </div>
    );
};

export default ComplianceReports;