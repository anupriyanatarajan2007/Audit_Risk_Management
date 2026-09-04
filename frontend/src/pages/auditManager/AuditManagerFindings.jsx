import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    AlertCircle,
    AlertTriangle,
    BarChart3,
    Calendar,
    CheckCircle2,
    ChevronDown,
    ClipboardCheck,
    Clock3,
    Eye,
    FileSearch,
    FileText,
    Loader2,
    RefreshCw,
    Search,
    ShieldAlert,
    X,
    XCircle,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import {
    BarChart,
    Bar,
    CartesianGrid,
    Cell,
    PieChart,
    Pie,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import {
    getAllFindings,
    getFindingsByAuditId,
    updateFinding,
} from "../../service/FindingService";

import {
    getEvidenceByAudit,
    getEvidenceFileUrl,
} from "../../service/EvidenceService";

import {
    getProfile,
} from "../../service/AuthService";

import {
    getAllAudits,
} from "../../service/AuditService";


// ============================================================
// CONSTANTS
// ============================================================

const FINDING_STATUSES = [
    "DRAFT",
    "SUBMITTED",
    "REVIEWED",
    "APPROVED",
    "REJECTED",
];

const RISK_LEVELS = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
];


// ============================================================
// GENERAL HELPERS
// ============================================================

const normalizeArray = (response) => {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
        return response.data.data;
    }

    if (Array.isArray(response?.content)) {
        return response.content;
    }

    if (Array.isArray(response?.findings)) {
        return response.findings;
    }

    if (Array.isArray(response?.data?.findings)) {
        return response.data.findings;
    }

    return [];
};


const normalizeString = (value) => {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .trim()
        .toLowerCase();
};


const firstNonEmpty = (...values) => {
    for (const value of values) {
        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {
            return value;
        }
    }

    return "";
};


// ============================================================
// DEPARTMENT RESOLUTION
// ============================================================

const getDepartmentName = (object) => {

    if (!object) {
        return "";
    }

    if (
        typeof object.department === "string"
    ) {
        return object.department;
    }

    return firstNonEmpty(

        // Profile department
        object?.department?.name,
        object?.department?.departmentName,
        object?.department?.departmentCode,

        object?.departmentName,
        object?.departmentCode,

        // Audit department
        object?.auditDepartment,

        object?.audit?.department?.name,
        object?.audit?.department?.departmentName,
        object?.audit?.department?.departmentCode,

        object?.audit?.departmentName,
        object?.audit?.departmentCode,
        object?.audit?.auditDepartment,

        // Risk department
        object?.risk?.department?.name,
        object?.risk?.department?.departmentName,
        object?.risk?.departmentName
    );
};


// ============================================================
// AUDIT HELPERS
// ============================================================

/*
 * IMPORTANT:
 *
 * Finding endpoint:
 *
 * GET /api/findings/audit/{numericDatabaseId}
 *
 * Therefore we must use numeric audit DB id.
 *
 * DO NOT use:
 * AUD-001
 * AUD-002
 * etc.
 */

const getAuditDatabaseId = (audit) => {

    const candidates = [

        audit?.auditDbId,

        audit?.id,

        audit?.audit?.auditDbId,

        audit?.audit?.id,

        audit?.auditPk,

        audit?.auditDatabaseId,
    ];


    for (const candidate of candidates) {

        if (
            candidate === undefined ||
            candidate === null ||
            candidate === ""
        ) {
            continue;
        }

        const numericId =
            Number(candidate);


        if (
            Number.isInteger(numericId) &&
            numericId > 0
        ) {
            return numericId;
        }
    }


    return null;
};


const getAuditBusinessId = (audit) => {

    return firstNonEmpty(
        audit?.auditId,
        audit?.auditCode,
        audit?.code,
        audit?.audit?.auditId,
        audit?.audit?.auditCode
    );
};


const auditBelongsToDepartment = (
    audit,
    managerDepartment
) => {

    if (!managerDepartment) {
        return false;
    }

    const target =
        normalizeString(
            managerDepartment
        );


    const auditDepartment =
        getDepartmentName(audit);


    return (
        normalizeString(
            auditDepartment
        ) === target
    );
};


// ============================================================
// FINDING HELPERS
// ============================================================

const getFindingStatus = (finding) => {

    return (
        firstNonEmpty(
            finding?.status,
            finding?.findingStatus
        ) || "DRAFT"
    );
};


const getFindingRisk = (finding) => {

    return (
        firstNonEmpty(
            finding?.riskLevel,
            finding?.risk,
            finding?.severity,
            finding?.riskRating
        ) || "LOW"
    );
};


const getFindingTitle = (finding) => {

    return (
        firstNonEmpty(
            finding?.title,
            finding?.findingTitle,
            finding?.name
        ) || "Untitled Finding"
    );
};


const getFindingId = (finding) => {

    return (
        firstNonEmpty(
            finding?.id,
            finding?.findingId,
            finding?.findingCode
        ) || "—"
    );
};


const getFindingAuditCode = (finding) => {

    return (
        firstNonEmpty(
            finding?.auditCode,

            finding?.audit?.auditCode,

            finding?.auditId,

            finding?.audit?.auditId,

            finding?.audit?.code
        ) || "—"
    );
};


const getFindingAuditDbId = (finding) => {

    const candidates = [

        finding?.auditDbId,

        finding?.audit?.auditDbId,

        finding?.audit?.id,

        finding?.auditPk,

        finding?.auditId,
    ];


    for (const candidate of candidates) {

        const numeric =
            Number(candidate);


        if (
            Number.isInteger(numeric) &&
            numeric > 0
        ) {
            return numeric;
        }
    }


    return null;
};


const getFindingDepartment = (finding) => {

    return (
        firstNonEmpty(

            finding?.departmentName,

            finding?.department,

            finding?.auditDepartment,

            finding?.audit?.departmentName,

            finding?.audit?.auditDepartment,

            finding?.audit?.department?.name,

            finding?.risk?.departmentName,

            finding?.risk?.department?.name
        ) || "—"
    );
};


const getFindingAuditor = (finding) => {

    const nestedAuditor =
        finding?.auditor ||
        finding?.internalAuditor;


    if (
        nestedAuditor?.firstName ||
        nestedAuditor?.lastName
    ) {

        return [
            nestedAuditor?.firstName,
            nestedAuditor?.lastName,
        ]
            .filter(Boolean)
            .join(" ");
    }


    return (
        firstNonEmpty(

            finding?.auditorName,

            finding?.internalAuditorName,

            nestedAuditor?.name,

            finding?.auditor?.username,

            finding?.internalAuditor?.username
        ) || "—"
    );
};


const getFindingDate = (finding) => {

    return firstNonEmpty(
        finding?.createdAt,
        finding?.createdDate,
        finding?.dateCreated,
        finding?.findingDate
    );
};


const formatDate = (date) => {

    if (!date) {
        return "—";
    }

    const parsed =
        new Date(date);


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return String(date);
    }


    return parsed.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};


// ============================================================
// STATUS CLASSES
// ============================================================

const getStatusClasses = (status) => {

    switch (
        normalizeString(status)
    ) {

        case "draft":
            return "bg-gray-100 text-gray-700 border-gray-200";

        case "submitted":
            return "bg-blue-50 text-blue-700 border-blue-200";

        case "reviewed":
            return "bg-amber-50 text-amber-700 border-amber-200";

        case "approved":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";

        case "rejected":
            return "bg-red-50 text-red-700 border-red-200";

        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
};


const getRiskClasses = (risk) => {

    switch (
        normalizeString(risk)
    ) {

        case "low":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";

        case "medium":
            return "bg-amber-50 text-amber-700 border-amber-200";

        case "high":
            return "bg-orange-50 text-orange-700 border-orange-200";

        case "critical":
            return "bg-red-50 text-red-700 border-red-200";

        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
};


// ============================================================
// COMPONENT
// ============================================================

const AuditManagerFindings = () => {

    // --------------------------------------------------------
    // PROFILE
    // --------------------------------------------------------

    const [profile, setProfile] =
        useState(null);

    const [managerDepartment, setManagerDepartment] =
        useState("");


    // --------------------------------------------------------
    // DEPARTMENT AUDITS
    // --------------------------------------------------------

    const [departmentAudits, setDepartmentAudits] =
        useState([]);


    // --------------------------------------------------------
    // FINDINGS
    // --------------------------------------------------------

    const [findings, setFindings] =
        useState([]);


    // --------------------------------------------------------
    // LOADING
    // --------------------------------------------------------

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // --------------------------------------------------------
    // FILTERS
    // --------------------------------------------------------

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [riskFilter, setRiskFilter] =
        useState("ALL");


    // --------------------------------------------------------
    // MODAL
    // --------------------------------------------------------

    const [selectedFinding, setSelectedFinding] =
        useState(null);


    const [statusDraft, setStatusDraft] =
        useState("");


    const [updatingStatus, setUpdatingStatus] =
        useState(false);


    const [statusError, setStatusError] =
        useState("");


    // --------------------------------------------------------
    // EVIDENCE
    // --------------------------------------------------------

    const [evidenceList, setEvidenceList] =
        useState([]);

    const [evidenceLoading, setEvidenceLoading] =
        useState(false);

    const [evidenceError, setEvidenceError] =
        useState("");


    // ========================================================
    // STEP 1
    // FIND CURRENT AUDIT MANAGER DEPARTMENT
    // ========================================================

    const loadManagerProfile = useCallback(
        async () => {

            const response =
                await getProfile();


            const profileData =
                response?.data?.data ||
                response?.data ||
                response;


            setProfile(
                profileData
            );


            const department =
                getDepartmentName(
                    profileData
                );


            if (!department) {

                throw new Error(
                    "Audit Manager department could not be determined."
                );
            }


            setManagerDepartment(
                department
            );


            return department;
        },
        []
    );


    // ========================================================
    // STEP 2
    // GET ALL AUDITS
    // THEN FILTER BY MANAGER DEPARTMENT
    // ========================================================

    const loadDepartmentAudits = useCallback(
        async (department) => {

            /*
             * Get all audits first.
             *
             * Then:
             *
             * ALL AUDITS
             *      ↓
             * Department Match
             *      ↓
             * Department Audits
             */

            const response =
                await getAllAudits();


            const allAudits =
                normalizeArray(
                    response
                );


            console.log(
                "ALL AUDITS:",
                allAudits
            );


            const filteredAudits =
                allAudits.filter(
                    (audit) =>
                        auditBelongsToDepartment(
                            audit,
                            department
                        )
                );


            console.log(
                "MANAGER DEPARTMENT:",
                department
            );


            console.log(
                "DEPARTMENT AUDITS:",
                filteredAudits
            );


            setDepartmentAudits(
                filteredAudits
            );


            return filteredAudits;
        },
        []
    );


    // ========================================================
    // STEP 3
    // GET FINDINGS FOR EACH DEPARTMENT AUDIT
    // ========================================================

    const loadDepartmentFindings = useCallback(
        async (audits) => {

            if (!audits?.length) {

                setFindings([]);

                return [];
            }


            /*
             * Convert every department audit
             * into numeric DB ID.
             */

            const auditIds = [
                ...new Set(
                    audits
                        .map(
                            getAuditDatabaseId
                        )
                        .filter(Boolean)
                ),
            ];


            console.log(
                "DEPARTMENT AUDIT DB IDS:",
                auditIds
            );


            if (!auditIds.length) {

                /*
                 * Fallback:
                 *
                 * If audit objects don't contain
                 * numeric DB IDs, use all findings
                 * and match their audit identifiers.
                 */

                console.warn(
                    "No numeric audit IDs found. Using finding audit identifier fallback."
                );


                const allFindingsResponse =
                    await getAllFindings();


                const allFindings =
                    normalizeArray(
                        allFindingsResponse
                    );


                const auditIdentifiers =
                    new Set();


                audits.forEach(
                    (audit) => {

                        const dbId =
                            getAuditDatabaseId(
                                audit
                            );

                        const businessId =
                            getAuditBusinessId(
                                audit
                            );


                        if (dbId) {
                            auditIdentifiers.add(
                                String(dbId)
                            );
                        }


                        if (businessId) {
                            auditIdentifiers.add(
                                normalizeString(
                                    businessId
                                )
                            );
                        }
                    }
                );


                const fallbackFindings =
                    allFindings.filter(
                        (finding) => {

                            const findingDbId =
                                getFindingAuditDbId(
                                    finding
                                );


                            const findingBusinessId =
                                normalizeString(
                                    getFindingAuditCode(
                                        finding
                                    )
                                );


                            return (
                                (
                                    findingDbId &&
                                    auditIdentifiers.has(
                                        String(
                                            findingDbId
                                        )
                                    )
                                ) ||
                                (
                                    findingBusinessId &&
                                    auditIdentifiers.has(
                                        findingBusinessId
                                    )
                                )
                            );
                        }
                    );


                setFindings(
                    fallbackFindings
                );


                return fallbackFindings;
            }


            /*
             * IMPORTANT:
             *
             * For every department audit:
             *
             * GET /api/findings/audit/{auditDbId}
             *
             * Example:
             *
             * Audit DB ID 1 → findings
             * Audit DB ID 2 → findings
             * Audit DB ID 5 → findings
             */

            const findingResponses =
                await Promise.all(

                    auditIds.map(
                        async (auditId) => {

                            try {

                                const response =
                                    await getFindingsByAuditId(
                                        auditId
                                    );


                                const auditFindings =
                                    normalizeArray(
                                        response
                                    );


                                /*
                                 * Attach audit information
                                 * to each finding so that
                                 * table/modal can display it
                                 * even when backend response
                                 * doesn't contain nested audit.
                                 */

                                const audit =
                                    audits.find(
                                        (item) =>
                                            getAuditDatabaseId(
                                                item
                                            ) === auditId
                                    );


                                return auditFindings.map(
                                    (finding) => ({

                                        ...finding,

                                        auditDbId:
                                            finding?.auditDbId ??
                                            auditId,

                                        auditCode:
                                            finding?.auditCode ??
                                            getAuditBusinessId(
                                                audit
                                            ),

                                        auditDepartment:
                                            finding?.auditDepartment ??
                                            getDepartmentName(
                                                audit
                                            ),

                                        audit:
                                            finding?.audit ??
                                            audit,

                                    })
                                );

                            } catch (err) {

                                console.error(
                                    `Failed to load findings for audit ${auditId}:`,
                                    err
                                );


                                /*
                                 * One audit failure should
                                 * not stop other audits.
                                 */

                                return [];
                            }
                        }
                    )
                );


            const combinedFindings =
                findingResponses.flat();


            /*
             * Remove duplicates.
             */

            const uniqueFindings = [];

            const seen = new Set();


            combinedFindings.forEach(
                (finding, index) => {

                    const key =
                        finding?.id ??
                        finding?.findingId ??
                        `${getFindingAuditCode(
                            finding
                        )}-${getFindingTitle(
                            finding
                        )}-${index}`;


                    if (
                        !seen.has(
                            String(key)
                        )
                    ) {

                        seen.add(
                            String(key)
                        );

                        uniqueFindings.push(
                            finding
                        );
                    }
                }
            );


            console.log(
                "FINAL DEPARTMENT FINDINGS:",
                uniqueFindings
            );


            setFindings(
                uniqueFindings
            );


            return uniqueFindings;
        },
        []
    );


    // ========================================================
    // COMPLETE LOAD FLOW
    // ========================================================

    const loadData = useCallback(
        async () => {

            try {

                setLoading(true);

                setError("");


                /*
                 * STEP 1
                 *
                 * Find current Audit Manager
                 * department.
                 */

                const department =
                    await loadManagerProfile();


                /*
                 * STEP 2
                 *
                 * Find audits belonging
                 * to that department.
                 */

                const audits =
                    await loadDepartmentAudits(
                        department
                    );


                /*
                 * STEP 3
                 *
                 * Find findings belonging
                 * to those audits.
                 */

                await loadDepartmentFindings(
                    audits
                );

            } catch (err) {

                console.error(
                    "AUDIT MANAGER FINDINGS LOAD ERROR:",
                    err
                );


                setFindings([]);

                setDepartmentAudits([]);


                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to load department findings."
                );

            } finally {

                setLoading(false);
            }

        },
        [
            loadManagerProfile,
            loadDepartmentAudits,
            loadDepartmentFindings,
        ]
    );


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {

        loadData();

    }, [loadData]);


    // ========================================================
    // REFRESH
    // ========================================================

    const handleRefresh = () => {

        loadData();
    };


    // ========================================================
    // FILTER FINDINGS
    // ========================================================

    const filteredFindings =
        useMemo(() => {

            const query =
                normalizeString(
                    search
                );


            return findings.filter(
                (finding) => {

                    const status =
                        getFindingStatus(
                            finding
                        );


                    const risk =
                        getFindingRisk(
                            finding
                        );


                    const searchableText = [

                        getFindingId(
                            finding
                        ),

                        getFindingTitle(
                            finding
                        ),

                        finding?.observation,

                        finding?.recommendation,

                        finding?.description,

                        getFindingAuditCode(
                            finding
                        ),

                        getFindingDepartment(
                            finding
                        ),

                        getFindingAuditor(
                            finding
                        ),

                        status,

                        risk,

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    const matchesSearch =
                        !query ||
                        searchableText.includes(
                            query
                        );


                    const matchesStatus =
                        statusFilter === "ALL" ||
                        normalizeString(
                            status
                        ) ===
                            normalizeString(
                                statusFilter
                            );


                    const matchesRisk =
                        riskFilter === "ALL" ||
                        normalizeString(
                            risk
                        ) ===
                            normalizeString(
                                riskFilter
                            );


                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesRisk
                    );
                }
            );

        }, [
            findings,
            search,
            statusFilter,
            riskFilter,
        ]);


    // ========================================================
    // STATISTICS
    // ========================================================

    const stats =
        useMemo(() => {

            const total =
                findings.length;


            const draft =
                findings.filter(
                    (finding) =>
                        normalizeString(
                            getFindingStatus(
                                finding
                            )
                        ) === "draft"
                ).length;


            const submitted =
                findings.filter(
                    (finding) =>
                        normalizeString(
                            getFindingStatus(
                                finding
                            )
                        ) === "submitted"
                ).length;


            const reviewed =
                findings.filter(
                    (finding) =>
                        normalizeString(
                            getFindingStatus(
                                finding
                            )
                        ) === "reviewed"
                ).length;


            const approved =
                findings.filter(
                    (finding) =>
                        normalizeString(
                            getFindingStatus(
                                finding
                            )
                        ) === "approved"
                ).length;


            const rejected =
                findings.filter(
                    (finding) =>
                        normalizeString(
                            getFindingStatus(
                                finding
                            )
                        ) === "rejected"
                ).length;


            const highRisk =
                findings.filter(
                    (finding) => {

                        const risk =
                            normalizeString(
                                getFindingRisk(
                                    finding
                                )
                            );


                        return (
                            risk === "high" ||
                            risk === "critical"
                        );
                    }
                ).length;


            const critical =
                findings.filter(
                    (finding) =>
                        normalizeString(
                            getFindingRisk(
                                finding
                            )
                        ) === "critical"
                ).length;


            return {
                total,
                draft,
                submitted,
                reviewed,
                approved,
                rejected,
                highRisk,
                critical,
            };

        }, [findings]);


    // ========================================================
    // STATUS CHART
    // ========================================================

    const statusChartData =
        useMemo(() => {

            return [
                {
                    name: "Draft",
                    value: stats.draft,
                },
                {
                    name: "Submitted",
                    value: stats.submitted,
                },
                {
                    name: "Reviewed",
                    value: stats.reviewed,
                },
                {
                    name: "Approved",
                    value: stats.approved,
                },
                {
                    name: "Rejected",
                    value: stats.rejected,
                },
            ];

        }, [stats]);


    // ========================================================
    // RISK CHART
    // ========================================================

    const riskChartData =
        useMemo(() => {

            return RISK_LEVELS.map(
                (risk) => ({

                    name: risk,

                    value:
                        findings.filter(
                            (finding) =>
                                normalizeString(
                                    getFindingRisk(
                                        finding
                                    )
                                ) ===
                                normalizeString(
                                    risk
                                )
                        ).length,

                })
            );

        }, [findings]);


    // ========================================================
    // AUDIT FINDING CHART
    // ========================================================

    const auditChartData =
        useMemo(() => {

            const grouped = {};


            findings.forEach(
                (finding) => {

                    const audit =
                        getFindingAuditCode(
                            finding
                        );


                    if (
                        !grouped[audit]
                    ) {
                        grouped[audit] = 0;
                    }


                    grouped[audit]++;
                }
            );


            return Object.entries(
                grouped
            )
                .map(
                    ([
                        audit,
                        count,
                    ]) => ({
                        audit,
                        count,
                    })
                )
                .sort(
                    (a, b) =>
                        b.count -
                        a.count
                );

        }, [findings]);


    // ========================================================
    // OPEN FINDING MODAL
    // ========================================================

    const handleOpenFinding =
        async (finding) => {

            setSelectedFinding(
                finding
            );


            setStatusDraft(
                getFindingStatus(
                    finding
                )
            );


            setStatusError("");

            setEvidenceList([]);

            setEvidenceError("");


            await loadEvidenceForFinding(
                finding
            );
        };


    // ========================================================
    // CLOSE MODAL
    // ========================================================

    const handleCloseModal =
        () => {

            if (
                updatingStatus
            ) {
                return;
            }


            setSelectedFinding(
                null
            );

            setStatusDraft("");

            setStatusError("");

            setEvidenceList([]);

            setEvidenceError("");
        };


    // ========================================================
    // LOAD EVIDENCE
    // ========================================================

    const loadEvidenceForFinding =
        async (finding) => {

            try {

                setEvidenceLoading(
                    true
                );

                setEvidenceError("");


                const auditId =
                    getFindingAuditDbId(
                        finding
                    );


                if (!auditId) {

                    setEvidenceError(
                        "Numeric audit database ID is not available."
                    );

                    return;
                }


                const response =
                    await getEvidenceByAudit(
                        auditId
                    );


                setEvidenceList(
                    normalizeArray(
                        response
                    )
                );

            } catch (err) {

                console.error(
                    "EVIDENCE ERROR:",
                    err
                );


                setEvidenceError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load evidence."
                );

            } finally {

                setEvidenceLoading(
                    false
                );
            }
        };


    // ========================================================
    // OPEN EVIDENCE
    // ========================================================

    const handleOpenEvidence =
        async (evidence) => {

            try {

                const evidenceId =
                    evidence?.id ??
                    evidence?.evidenceId;


                if (!evidenceId) {
                    return;
                }


                const url =
                    await getEvidenceFileUrl(
                        evidenceId
                    );


                if (url) {

                    window.open(
                        url,
                        "_blank",
                        "noopener,noreferrer"
                    );
                }

            } catch (err) {

                console.error(
                    "OPEN EVIDENCE ERROR:",
                    err
                );
            }
        };


    // ========================================================
    // UPDATE FINDING
    // ========================================================

    const handleUpdateStatus =
        async () => {

            if (
                !selectedFinding
            ) {
                return;
            }


            if (!statusDraft) {

                setStatusError(
                    "Please select a status."
                );

                return;
            }


            try {

                setUpdatingStatus(
                    true
                );

                setStatusError("");


                const auditDbId =
                    getFindingAuditDbId(
                        selectedFinding
                    );


                const payload = {

                    /*
                     * Prefer numeric DB ID.
                     */

                    auditId:
                        auditDbId ??
                        selectedFinding?.auditId,

                    title:
                        selectedFinding?.title ||
                        selectedFinding?.findingTitle,

                    observation:
                        selectedFinding?.observation,

                    riskLevel:
                        selectedFinding?.riskLevel ||
                        selectedFinding?.risk,

                    recommendation:
                        selectedFinding?.recommendation,

                    status:
                        statusDraft,
                };


                const findingId =
                    selectedFinding?.id ??
                    selectedFinding?.findingId;


                const response =
                    await updateFinding(
                        findingId,
                        payload
                    );


                const updatedFinding =
                    response?.data?.data ||
                    response?.data ||
                    response;


                setFindings(
                    (previous) =>
                        previous.map(
                            (finding) => {

                                const currentId =
                                    finding?.id ??
                                    finding?.findingId;


                                if (
                                    String(
                                        currentId
                                    ) ===
                                    String(
                                        findingId
                                    )
                                ) {

                                    return {

                                        ...finding,

                                        ...(updatedFinding ||
                                            {}),

                                        status:
                                            updatedFinding?.status ||
                                            statusDraft,
                                    };
                                }


                                return finding;
                            }
                        )
                );


                setSelectedFinding(
                    (previous) => ({

                        ...previous,

                        ...(updatedFinding ||
                            {}),

                        status:
                            updatedFinding?.status ||
                            statusDraft,
                    })
                );


                setStatusDraft(
                    updatedFinding?.status ||
                    statusDraft
                );

            } catch (err) {

                console.error(
                    "UPDATE FINDING ERROR:",
                    err
                );


                setStatusError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to update finding."
                );

            } finally {

                setUpdatingStatus(
                    false
                );
            }
        };


    // ========================================================
    // STAT CARD
    // ========================================================

    const StatCard = ({
        title,
        value,
        description,
        icon: Icon,
        iconClass,
    }) => {

        return (
            <motion.div
                initial={{
                    opacity: 0,
                    y: 15,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >

                <div className="flex items-start justify-between">

                    <div>

                        <p className="text-sm font-medium text-gray-500">
                            {title}
                        </p>

                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            {value}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                            {description}
                        </p>

                    </div>


                    <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}
                    >

                        <Icon
                            size={21}
                        />

                    </div>

                </div>

            </motion.div>
        );
    };


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">

                <div className="text-center">

                    <Loader2
                        size={40}
                        className="animate-spin text-blue-600 mx-auto"
                    />

                    <p className="mt-4 font-semibold text-gray-700">
                        Loading department audits and findings...
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        Finding your department first, then loading its audits and findings.
                    </p>

                </div>

            </div>
        );
    }


    // ========================================================
    // PAGE
    // ========================================================

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">

            <div className="max-w-[1600px] mx-auto">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">

                    <div>

                        <div className="flex items-center gap-3">

                            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">

                                <ClipboardCheck
                                    size={23}
                                    className="text-white"
                                />

                            </div>


                            <div>

                                <p className="text-sm font-semibold text-blue-600">
                                    Audit Manager
                                </p>

                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                    Department Findings
                                </h1>

                            </div>

                        </div>


                        <p className="text-gray-500 mt-3">
                            Findings from audits belonging to your department.
                        </p>


                        <div className="flex flex-wrap gap-2 mt-3">

                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold">

                                <ShieldAlert
                                    size={15}
                                />

                                Department:
                                <span>
                                    {managerDepartment ||
                                        "Unknown"}
                                </span>

                            </span>


                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-semibold">

                                <FileSearch
                                    size={15}
                                />

                                Audits:
                                {departmentAudits.length}

                            </span>


                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-sm font-semibold">

                                <FileText
                                    size={15}
                                />

                                Findings:
                                {findings.length}

                            </span>

                        </div>

                    </div>


                    <button
                        onClick={
                            handleRefresh
                        }
                        className="self-start lg:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-blue-300 transition"
                    >

                        <RefreshCw
                            size={17}
                        />

                        Refresh

                    </button>

                </div>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">

                        <AlertCircle
                            size={20}
                            className="text-red-600 mt-0.5"
                        />

                        <div>

                            <p className="font-semibold text-red-800">
                                Unable to load department findings
                            </p>

                            <p className="text-sm text-red-700 mt-1">
                                {error}
                            </p>

                        </div>

                    </div>
                )}


                {/* ==================================================
                    KPI CARDS
                ================================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

                    <StatCard
                        title="Total Findings"
                        value={stats.total}
                        description="From department audits"
                        icon={FileText}
                        iconClass="bg-blue-50 text-blue-600"
                    />


                    <StatCard
                        title="Pending Review"
                        value={
                            stats.submitted +
                            stats.reviewed
                        }
                        description="Submitted + reviewed"
                        icon={Clock3}
                        iconClass="bg-amber-50 text-amber-600"
                    />


                    <StatCard
                        title="Approved"
                        value={
                            stats.approved
                        }
                        description="Approved findings"
                        icon={CheckCircle2}
                        iconClass="bg-emerald-50 text-emerald-600"
                    />


                    <StatCard
                        title="High / Critical"
                        value={
                            stats.highRisk
                        }
                        description={`${stats.critical} critical findings`}
                        icon={AlertTriangle}
                        iconClass="bg-red-50 text-red-600"
                    />

                </div>


                {/* ==================================================
                    CHARTS
                ================================================== */}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

                    {/* STATUS */}

                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

                        <div className="flex items-center justify-between mb-4">

                            <div>

                                <h2 className="text-lg font-bold text-gray-900">
                                    Finding Status
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Status distribution across department audits
                                </p>

                            </div>


                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">

                                <BarChart3
                                    size={19}
                                    className="text-blue-600"
                                />

                            </div>

                        </div>


                        <div className="h-[280px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                    data={
                                        statusChartData
                                    }
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="name"
                                    />

                                    <YAxis
                                        allowDecimals={
                                            false
                                        }
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="value"
                                        name="Findings"
                                        radius={[
                                            7,
                                            7,
                                            0,
                                            0,
                                        ]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    </div>


                    {/* RISK */}

                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">

                        <div className="flex items-center justify-between mb-4">

                            <div>

                                <h2 className="text-lg font-bold text-gray-900">
                                    Risk Distribution
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Risk severity of department findings
                                </p>

                            </div>


                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">

                                <AlertTriangle
                                    size={19}
                                    className="text-red-600"
                                />

                            </div>

                        </div>


                        <div className="h-[280px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <PieChart>

                                    <Pie
                                        data={
                                            riskChartData
                                        }
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={
                                            95
                                        }
                                        innerRadius={
                                            55
                                        }
                                        paddingAngle={
                                            3
                                        }
                                    >

                                        {riskChartData.map(
                                            (
                                                entry,
                                                index
                                            ) => (
                                                <Cell
                                                    key={
                                                        `risk-${index}`
                                                    }
                                                />
                                            )
                                        )}

                                    </Pie>

                                    <Tooltip />

                                </PieChart>

                            </ResponsiveContainer>

                        </div>


                        <div className="flex flex-wrap justify-center gap-3 text-xs">

                            {riskChartData.map(
                                (item) => (
                                    <div
                                        key={
                                            item.name
                                        }
                                        className="flex items-center gap-1.5"
                                    >

                                        <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />

                                        <span className="text-gray-600">
                                            {
                                                item.name
                                            }
                                        </span>

                                        <span className="font-bold text-gray-900">
                                            {
                                                item.value
                                            }
                                        </span>

                                    </div>
                                )
                            )}

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    FINDINGS BY AUDIT
                ================================================== */}

                {auditChartData.length > 0 && (

                    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">

                        <div className="flex items-center gap-3 mb-5">

                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">

                                <FileSearch
                                    size={19}
                                    className="text-indigo-600"
                                />

                            </div>


                            <div>

                                <h2 className="text-lg font-bold text-gray-900">
                                    Findings by Audit
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Findings across audits in{" "}
                                    <span className="font-semibold">
                                        {managerDepartment}
                                    </span>
                                </p>

                            </div>

                        </div>


                        <div className="h-[300px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                    data={
                                        auditChartData
                                    }
                                    layout="vertical"
                                    margin={{
                                        top: 5,
                                        right: 20,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={false}
                                    />

                                    <XAxis
                                        type="number"
                                        allowDecimals={
                                            false
                                        }
                                    />

                                    <YAxis
                                        type="category"
                                        dataKey="audit"
                                        width={110}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="count"
                                        name="Findings"
                                        radius={[
                                            0,
                                            7,
                                            7,
                                            0,
                                        ]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        </div>

                    </div>
                )}


                {/* ==================================================
                    FILTERS
                ================================================== */}

                <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-5">

                    <div className="flex flex-col lg:flex-row gap-3">

                        <div className="relative flex-1">

                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                value={
                                    search
                                }
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search finding, audit, observation, auditor..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm"
                            />

                        </div>


                        <div className="relative">

                            <select
                                value={
                                    statusFilter
                                }
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.target.value
                                    )
                                }
                                className="appearance-none min-w-[180px] pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm"
                            >

                                <option value="ALL">
                                    All Statuses
                                </option>

                                {FINDING_STATUSES.map(
                                    (status) => (
                                        <option
                                            key={
                                                status
                                            }
                                            value={
                                                status
                                            }
                                        >
                                            {
                                                status
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                            <ChevronDown
                                size={16}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />

                        </div>


                        <div className="relative">

                            <select
                                value={
                                    riskFilter
                                }
                                onChange={(e) =>
                                    setRiskFilter(
                                        e.target.value
                                    )
                                }
                                className="appearance-none min-w-[160px] pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-sm"
                            >

                                <option value="ALL">
                                    All Risk Levels
                                </option>

                                {RISK_LEVELS.map(
                                    (risk) => (
                                        <option
                                            key={
                                                risk
                                            }
                                            value={
                                                risk
                                            }
                                        >
                                            {
                                                risk
                                            }
                                        </option>
                                    )
                                )}

                            </select>

                            <ChevronDown
                                size={16}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />

                        </div>

                    </div>


                    <div className="mt-3 text-sm text-gray-500">

                        Showing{" "}

                        <span className="font-bold text-gray-900">
                            {
                                filteredFindings.length
                            }
                        </span>{" "}

                        of{" "}

                        <span className="font-bold text-gray-900">
                            {findings.length}
                        </span>{" "}

                        findings from{" "}

                        <span className="font-bold text-blue-600">
                            {
                                departmentAudits.length
                            }{" "}
                            department audits
                        </span>

                    </div>

                </div>


                {/* ==================================================
                    TABLE
                ================================================== */}

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                    <div className="px-5 py-4 border-b border-gray-200">

                        <h2 className="font-bold text-gray-900">
                            Department Audit Findings
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Only findings belonging to audits under{" "}
                            <span className="font-semibold">
                                {managerDepartment}
                            </span>{" "}
                            are displayed.
                        </p>

                    </div>


                    {filteredFindings.length ===
                    0 ? (

                        <div className="py-16 text-center">

                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto">

                                <FileSearch
                                    size={25}
                                    className="text-gray-400"
                                />

                            </div>


                            <h3 className="mt-4 font-semibold text-gray-800">
                                No department findings found
                            </h3>


                            <p className="text-sm text-gray-500 mt-1">
                                There are no findings matching the selected filters.
                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[1100px]">

                                <thead className="bg-gray-50">

                                    <tr>

                                        <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Finding
                                        </th>

                                        <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Audit
                                        </th>

                                        <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Department
                                        </th>

                                        <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Auditor
                                        </th>

                                        <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Risk
                                        </th>

                                        <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>

                                        <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Created
                                        </th>

                                        <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody className="divide-y divide-gray-100">

                                    {filteredFindings.map(
                                        (
                                            finding,
                                            index
                                        ) => {

                                            const status =
                                                getFindingStatus(
                                                    finding
                                                );

                                            const risk =
                                                getFindingRisk(
                                                    finding
                                                );


                                            return (
                                                <motion.tr
                                                    key={
                                                        finding?.id ??
                                                        finding?.findingId ??
                                                        index
                                                    }
                                                    initial={{
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                    }}
                                                    transition={{
                                                        delay:
                                                            index *
                                                            0.02,
                                                    }}
                                                    className="hover:bg-gray-50 transition"
                                                >

                                                    <td className="px-5 py-4">

                                                        <p className="font-semibold text-gray-900 max-w-[280px] truncate">
                                                            {
                                                                getFindingTitle(
                                                                    finding
                                                                )
                                                            }
                                                        </p>

                                                        <p className="text-xs text-gray-500 mt-1">
                                                            ID:{" "}
                                                            {
                                                                getFindingId(
                                                                    finding
                                                                )
                                                            }
                                                        </p>

                                                    </td>


                                                    <td className="px-5 py-4">

                                                        <p className="font-semibold text-gray-800">
                                                            {
                                                                getFindingAuditCode(
                                                                    finding
                                                                )
                                                            }
                                                        </p>

                                                        <p className="text-xs text-gray-500 mt-1">
                                                            DB ID:{" "}
                                                            {
                                                                getFindingAuditDbId(
                                                                    finding
                                                                ) ||
                                                                "—"
                                                            }
                                                        </p>

                                                    </td>


                                                    <td className="px-5 py-4">

                                                        <span className="text-sm text-gray-700">
                                                            {
                                                                getFindingDepartment(
                                                                    finding
                                                                )
                                                            }
                                                        </span>

                                                    </td>


                                                    <td className="px-5 py-4">

                                                        <span className="text-sm text-gray-700">
                                                            {
                                                                getFindingAuditor(
                                                                    finding
                                                                )
                                                            }
                                                        </span>

                                                    </td>


                                                    <td className="px-5 py-4">

                                                        <span
                                                            className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${getRiskClasses(
                                                                risk
                                                            )}`}
                                                        >
                                                            {
                                                                risk
                                                            }
                                                        </span>

                                                    </td>


                                                    <td className="px-5 py-4">

                                                        <span
                                                            className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusClasses(
                                                                status
                                                            )}`}
                                                        >
                                                            {
                                                                status
                                                            }
                                                        </span>

                                                    </td>


                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-2 text-sm text-gray-600">

                                                            <Calendar
                                                                size={15}
                                                            />

                                                            {
                                                                formatDate(
                                                                    getFindingDate(
                                                                        finding
                                                                    )
                                                                )
                                                            }

                                                        </div>

                                                    </td>


                                                    <td className="px-5 py-4 text-right">

                                                        <button
                                                            onClick={() =>
                                                                handleOpenFinding(
                                                                    finding
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-sm transition"
                                                        >

                                                            <Eye
                                                                size={16}
                                                            />

                                                            View

                                                        </button>

                                                    </td>

                                                </motion.tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </div>

            </div>


            {/* =====================================================
                MODAL
            ===================================================== */}

            <AnimatePresence>

                {selectedFinding && (

                    <motion.div
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                        onMouseDown={(e) => {

                            if (
                                e.target ===
                                e.currentTarget
                            ) {

                                handleCloseModal();
                            }

                        }}
                    >

                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.96,
                                y: 15,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.96,
                                y: 15,
                            }}
                            className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                        >

                            {/* HEADER */}

                            <div className="px-6 py-5 border-b border-gray-200 flex items-start justify-between">

                                <div>

                                    <p className="text-sm font-semibold text-blue-600">
                                        Department Finding
                                    </p>

                                    <h2 className="text-xl font-bold text-gray-900 mt-1">
                                        {
                                            getFindingTitle(
                                                selectedFinding
                                            )
                                        }
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        {
                                            getFindingId(
                                                selectedFinding
                                            )
                                        }
                                    </p>

                                </div>


                                <button
                                    onClick={
                                        handleCloseModal
                                    }
                                    className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 text-gray-500"
                                >

                                    <X
                                        size={20}
                                    />

                                </button>

                            </div>


                            {/* BODY */}

                            <div className="overflow-y-auto p-6 space-y-6">

                                {/* SUMMARY */}

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">

                                        <p className="text-xs uppercase font-semibold text-gray-500">
                                            Audit
                                        </p>

                                        <p className="font-bold text-gray-900 mt-1">
                                            {
                                                getFindingAuditCode(
                                                    selectedFinding
                                                )
                                            }
                                        </p>

                                    </div>


                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">

                                        <p className="text-xs uppercase font-semibold text-gray-500">
                                            Department
                                        </p>

                                        <p className="font-bold text-gray-900 mt-1">
                                            {
                                                getFindingDepartment(
                                                    selectedFinding
                                                )
                                            }
                                        </p>

                                    </div>


                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">

                                        <p className="text-xs uppercase font-semibold text-gray-500">
                                            Risk
                                        </p>

                                        <span
                                            className={`inline-flex mt-2 px-2.5 py-1 rounded-full border text-xs font-bold ${getRiskClasses(
                                                getFindingRisk(
                                                    selectedFinding
                                                )
                                            )}`}
                                        >
                                            {
                                                getFindingRisk(
                                                    selectedFinding
                                                )
                                            }
                                        </span>

                                    </div>


                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">

                                        <p className="text-xs uppercase font-semibold text-gray-500">
                                            Auditor
                                        </p>

                                        <p className="font-bold text-gray-900 mt-1">
                                            {
                                                getFindingAuditor(
                                                    selectedFinding
                                                )
                                            }
                                        </p>

                                    </div>

                                </div>


                                {/* OBSERVATION */}

                                <div>

                                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">

                                        <AlertCircle
                                            size={18}
                                            className="text-orange-500"
                                        />

                                        Observation

                                    </h3>


                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 leading-6 whitespace-pre-wrap">

                                        {
                                            selectedFinding?.observation ||
                                            selectedFinding?.description ||
                                            "No observation available."
                                        }

                                    </div>

                                </div>


                                {/* RECOMMENDATION */}

                                <div>

                                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">

                                        <CheckCircle2
                                            size={18}
                                            className="text-blue-600"
                                        />

                                        Recommendation

                                    </h3>


                                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 leading-6 whitespace-pre-wrap">

                                        {
                                            selectedFinding?.recommendation ||
                                            "No recommendation available."
                                        }

                                    </div>

                                </div>


                                {/* EVIDENCE */}

                                <div>

                                    <div className="flex items-center justify-between mb-3">

                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">

                                            <FileText
                                                size={18}
                                                className="text-blue-600"
                                            />

                                            Supporting Evidence

                                        </h3>


                                        <span className="text-xs text-gray-500">
                                            {
                                                evidenceList.length
                                            }{" "}
                                            file(s)
                                        </span>

                                    </div>


                                    {evidenceLoading ? (

                                        <div className="p-6 text-center border border-gray-200 rounded-xl">

                                            <Loader2
                                                size={25}
                                                className="animate-spin text-blue-600 mx-auto"
                                            />

                                            <p className="text-sm text-gray-500 mt-2">
                                                Loading evidence...
                                            </p>

                                        </div>

                                    ) : evidenceError ? (

                                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700">
                                            {
                                                evidenceError
                                            }
                                        </div>

                                    ) : evidenceList.length ===
                                      0 ? (

                                        <div className="p-6 rounded-xl bg-gray-50 border border-gray-200 text-center">

                                            <FileText
                                                size={25}
                                                className="mx-auto text-gray-400"
                                            />

                                            <p className="text-sm text-gray-500 mt-2">
                                                No evidence available for this audit.
                                            </p>

                                        </div>

                                    ) : (

                                        <div className="space-y-2">

                                            {evidenceList.map(
                                                (
                                                    evidence,
                                                    index
                                                ) => {

                                                    const fileName =
                                                        firstNonEmpty(
                                                            evidence?.fileName,
                                                            evidence?.name,
                                                            evidence?.originalFileName,
                                                            evidence?.documentName
                                                        ) ||
                                                        `Evidence ${
                                                            index +
                                                            1
                                                        }`;


                                                    return (
                                                        <div
                                                            key={
                                                                evidence?.id ??
                                                                evidence?.evidenceId ??
                                                                index
                                                            }
                                                            className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50"
                                                        >

                                                            <div className="flex items-center gap-3">

                                                                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">

                                                                    <FileText
                                                                        size={17}
                                                                        className="text-blue-600"
                                                                    />

                                                                </div>


                                                                <div>

                                                                    <p className="font-medium text-gray-800">
                                                                        {
                                                                            fileName
                                                                        }
                                                                    </p>

                                                                    <p className="text-xs text-gray-500">
                                                                        Supporting evidence
                                                                    </p>

                                                                </div>

                                                            </div>


                                                            <button
                                                                onClick={() =>
                                                                    handleOpenEvidence(
                                                                        evidence
                                                                    )
                                                                }
                                                                className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium inline-flex items-center gap-2"
                                                            >

                                                                <Eye
                                                                    size={15}
                                                                />

                                                                Open

                                                            </button>

                                                        </div>
                                                    );
                                                }
                                            )}

                                        </div>
                                    )}

                                </div>


                                {/* STATUS */}

                                <div className="p-5 rounded-2xl border border-blue-100 bg-blue-50/50">

                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">

                                        <ShieldAlert
                                            size={18}
                                            className="text-blue-600"
                                        />

                                        Finding Status

                                    </h3>


                                    <div className="flex flex-col md:flex-row gap-3">

                                        <div className="relative flex-1">

                                            <select
                                                value={
                                                    statusDraft
                                                }
                                                onChange={(e) =>
                                                    setStatusDraft(
                                                        e.target.value
                                                    )
                                                }
                                                disabled={
                                                    updatingStatus
                                                }
                                                className="appearance-none w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                            >

                                                {FINDING_STATUSES.map(
                                                    (
                                                        status
                                                    ) => (
                                                        <option
                                                            key={
                                                                status
                                                            }
                                                            value={
                                                                status
                                                            }
                                                        >
                                                            {
                                                                status
                                                            }
                                                        </option>
                                                    )
                                                )}

                                            </select>

                                            <ChevronDown
                                                size={17}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                            />

                                        </div>


                                        <button
                                            onClick={
                                                handleUpdateStatus
                                            }
                                            disabled={
                                                updatingStatus ||
                                                statusDraft ===
                                                    getFindingStatus(
                                                        selectedFinding
                                                    )
                                            }
                                            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                                        >

                                            {updatingStatus ? (
                                                <>
                                                    <Loader2
                                                        size={17}
                                                        className="animate-spin"
                                                    />

                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle2
                                                        size={17}
                                                    />

                                                    Update Status
                                                </>
                                            )}

                                        </button>

                                    </div>


                                    {statusError && (

                                        <div className="mt-3 flex items-center gap-2 text-sm text-red-600">

                                            <XCircle
                                                size={17}
                                            />

                                            {
                                                statusError
                                            }

                                        </div>
                                    )}

                                </div>


                                {/* EXTRA DETAILS */}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div className="p-4 rounded-xl border border-gray-200">

                                        <p className="text-xs uppercase font-semibold text-gray-500">
                                            Audit Database ID
                                        </p>

                                        <p className="font-semibold text-gray-900 mt-1">
                                            {
                                                getFindingAuditDbId(
                                                    selectedFinding
                                                ) ||
                                                "—"
                                            }
                                        </p>

                                    </div>


                                    <div className="p-4 rounded-xl border border-gray-200">

                                        <p className="text-xs uppercase font-semibold text-gray-500">
                                            Created Date
                                        </p>

                                        <p className="font-semibold text-gray-900 mt-1">
                                            {
                                                formatDate(
                                                    getFindingDate(
                                                        selectedFinding
                                                    )
                                                )
                                            }
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* FOOTER */}

                            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">

                                <button
                                    onClick={
                                        handleCloseModal
                                    }
                                    disabled={
                                        updatingStatus
                                    }
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50"
                                >
                                    Close
                                </button>

                            </div>

                        </motion.div>

                    </motion.div>
                )}

            </AnimatePresence>

        </div>
    );
};


export default AuditManagerFindings;