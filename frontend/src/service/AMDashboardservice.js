import AuditService from "./AuditService";
import { getAllFindings } from "./FindingService";
import EvidenceService from "./EvidenceService";
import RiskService from "./RiskService";
import { getProfile } from "./AuthService";

// ============================================================
// CONSTANTS
// ============================================================

const AUDIT_STATUS_ORDER = [
    "PLANNED",
    "ASSIGNED",
    "IN_PROGRESS",
    "UNDER_REVIEW",
    "COMPLETED",
    "CLOSED",
];

const SEVERITY_ORDER = [
    "CRITICAL",
    "HIGH",
    "MEDIUM",
    "LOW",
];

const RESOLVED_FINDING_STATUSES = [
    "RESOLVED",
    "CLOSED",
    "COMPLETED",
];

const REVIEW_STATUSES = [
    "UNDER_REVIEW",
    "PENDING_REVIEW",
    "SUBMITTED",
];

const MONTH_LABELS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

// ============================================================
// SAFE FETCH
// ============================================================

const safeFetch = async (label, fn, fallback = []) => {
    try {
        const response = await fn();

        return {
            ok: true,
            data: response ?? fallback,
        };
    } catch (error) {
        console.error(`❌ ${label} fetch failed:`, error);

        return {
            ok: false,
            data: fallback,
            error,
        };
    }
};

// ============================================================
// NORMALIZE VALUE
// ============================================================

const norm = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    if (typeof value === "object") {
        return String(
            value.name ??
            value.value ??
            value.label ??
            ""
        )
            .trim()
            .toUpperCase();
    }

    return String(value)
        .trim()
        .toUpperCase();
};

// ============================================================
// SAFE STRING
// ============================================================

const safeString = (value, fallback = "") => {
    if (value === null || value === undefined) {
        return fallback;
    }

    if (typeof value === "string") {
        return value.trim() || fallback;
    }

    if (typeof value === "number") {
        return String(value);
    }

    if (typeof value === "object") {
        const result =
            value.name ??
            value.value ??
            value.label ??
            value.title ??
            value.fullName ??
            value.username ??
            value.email;

        if (result !== undefined && result !== null) {
            return safeString(result, fallback);
        }

        return fallback;
    }

    return String(value);
};

// ============================================================
// DEPARTMENT HELPERS
// ============================================================

const normalizeDepartmentId = (value) => {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === "object") {
        return (
            value.id ??
            value.departmentId ??
            value.value ??
            null
        );
    }

    return value;
};

const getDepartmentObject = (entity) => {
    if (!entity || typeof entity !== "object") {
        return null;
    }

    if (
        entity.department &&
        typeof entity.department === "object"
    ) {
        return entity.department;
    }

    if (
        entity.departmentDetails &&
        typeof entity.departmentDetails === "object"
    ) {
        return entity.departmentDetails;
    }

    if (
        entity.departmentInfo &&
        typeof entity.departmentInfo === "object"
    ) {
        return entity.departmentInfo;
    }

    return null;
};

const getDepartmentId = (entity) => {
    if (!entity) {
        return null;
    }

    const departmentObject = getDepartmentObject(entity);

    return normalizeDepartmentId(
        entity.departmentId ??
        entity.deptId ??
        departmentObject?.id ??
        departmentObject?.departmentId
    );
};

const getDepartmentName = (entity) => {
    if (!entity) {
        return "";
    }

    if (typeof entity === "string") {
        return entity.trim();
    }

    if (typeof entity !== "object") {
        return safeString(entity);
    }

    const departmentObject = getDepartmentObject(entity);

    return safeString(
        entity.departmentName ??
        entity.deptName ??
        entity.auditDepartment ??
        entity.auditDeptName ??
        departmentObject?.name ??
        departmentObject?.departmentName ??
        departmentObject?.deptName ??
        entity.department ??
        "",
        ""
    );
};

// ============================================================
// MANAGER DEPARTMENT
// ============================================================

const getManagerDepartment = (profile) => {
    if (!profile) {
        return null;
    }

    const departmentObject =
        getDepartmentObject(profile);

    return {
        id: normalizeDepartmentId(
            profile.departmentId ??
            profile.deptId ??
            departmentObject?.id ??
            departmentObject?.departmentId
        ),

        name: getDepartmentName(profile),
    };
};

// ============================================================
// DEPARTMENT MATCHING
// ============================================================

const belongsToDepartment = (
    entity,
    managerDepartment
) => {
    if (!managerDepartment) {
        return true;
    }

    const managerId =
        normalizeDepartmentId(
            managerDepartment.id
        );

    const managerName =
        norm(managerDepartment.name);

    const entityDepartmentId =
        getDepartmentId(entity);

    const entityDepartmentName =
        norm(getDepartmentName(entity));

    if (
        managerId !== null &&
        managerId !== undefined &&
        entityDepartmentId !== null &&
        entityDepartmentId !== undefined
    ) {
        return String(entityDepartmentId) ===
            String(managerId);
    }

    if (
        managerName &&
        entityDepartmentName
    ) {
        return (
            entityDepartmentName ===
            managerName
        );
    }

    return false;
};

const auditBelongsToDepartment = (
    audit,
    managerDepartment
) => {
    return belongsToDepartment(
        audit,
        managerDepartment
    );
};

const riskBelongsToDepartment = (
    risk,
    managerDepartment
) => {
    return belongsToDepartment(
        risk,
        managerDepartment
    );
};

const findingBelongsToDepartment = (
    finding,
    managerDepartment
) => {
    return belongsToDepartment(
        finding,
        managerDepartment
    );
};

const evidenceBelongsToDepartment = (
    evidence,
    managerDepartment
) => {
    return belongsToDepartment(
        evidence,
        managerDepartment
    );
};

// ============================================================
// RESPONSE NORMALIZERS
// ============================================================

const normalizeArrayResponse = (response) => {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.content)) {
        return response.content;
    }

    if (Array.isArray(response?.items)) {
        return response.items;
    }

    if (Array.isArray(response?.results)) {
        return response.results;
    }

    return [];
};

const normalizeAuditResponse = (response) => {
    return normalizeArrayResponse(response);
};

const normalizeFindingResponse = (response) => {
    return normalizeArrayResponse(response);
};

const normalizeEvidenceResponse = (response) => {
    return normalizeArrayResponse(response);
};

const normalizeRiskResponse = (response) => {
    return normalizeArrayResponse(response);
};

// ============================================================
// FETCH DASHBOARD SOURCES
// ============================================================

export const fetchDashboardSources = async () => {
    // --------------------------------------------------------
    // CURRENT PROFILE
    // --------------------------------------------------------

    const profileResult = await safeFetch(
        "Current profile",
        () => getProfile(),
        null
    );

    const profile =
        profileResult.ok
            ? profileResult.data
            : null;

    const managerDepartment =
        getManagerDepartment(profile);

    console.log(
        "👤 Audit Manager Profile:",
        profile
    );

    console.log(
        "🏢 Audit Manager Department:",
        managerDepartment
    );

    // --------------------------------------------------------
    // AUDITS
    // --------------------------------------------------------

    const auditsResult = await safeFetch(
        "Audits",
        async () => {
            const response =
                await AuditService.getAllAudits();

            return normalizeAuditResponse(
                response
            );
        },
        []
    );

    // --------------------------------------------------------
    // FINDINGS
    // --------------------------------------------------------

    const findingsResult = await safeFetch(
        "Findings",
        async () => {
            const response =
                await getAllFindings();

            return normalizeFindingResponse(
                response
            );
        },
        []
    );

    // --------------------------------------------------------
    // PENDING EVIDENCE
    // --------------------------------------------------------

    const evidenceResult = await safeFetch(
        "Evidence",
        async () => {
            const response =
                await EvidenceService.getAllEvidence();

            return normalizeEvidenceResponse(
                response
            );
        },
        []
    );

    // --------------------------------------------------------
    // RISKS
    // --------------------------------------------------------

    const risksResult = await safeFetch(
        "Risks",
        async () => {
            const response =
                await RiskService.getAllRisks();

            return normalizeRiskResponse(
                response
            );
        },
        []
    );

    // --------------------------------------------------------
    // RAW DATA
    // --------------------------------------------------------

    const rawAudits = auditsResult.data;
    const rawFindings = findingsResult.data;
    const rawEvidence = evidenceResult.data;
    const rawRisks = risksResult.data;

    // --------------------------------------------------------
    // DEPARTMENT FILTER
    // --------------------------------------------------------

    const audits = rawAudits.filter((audit) =>
        auditBelongsToDepartment(
            audit,
            managerDepartment
        )
    );

    const findings = rawFindings.filter((finding) =>
        findingBelongsToDepartment(
            finding,
            managerDepartment
        )
    );

    const pendingEvidence = rawEvidence.filter(
        (evidence) =>
            evidenceBelongsToDepartment(
                evidence,
                managerDepartment
            ) &&
            !RESOLVED_FINDING_STATUSES.includes(
                norm(
                    evidence.status
                )
            )
    );

    const risks = rawRisks.filter((risk) =>
        riskBelongsToDepartment(
            risk,
            managerDepartment
        )
    );

    console.log(
        "📊 Department Filtered Audits:",
        audits
    );

    console.log(
        "📊 Department Filtered Findings:",
        findings
    );

    console.log(
        "📊 Department Filtered Evidence:",
        pendingEvidence
    );

    console.log(
        "📊 Department Filtered Risks:",
        risks
    );

    return {
        audits,
        findings,
        pendingEvidence,
        risks,
        managerDepartment,

        sourceErrors: {
            audits: !auditsResult.ok,
            findings: !findingsResult.ok,
            pendingEvidence: !evidenceResult.ok,
            risks: !risksResult.ok,
        },
    };
};

// ============================================================
// DATE HELPERS
// ============================================================

const daysBetween = (
    startDate,
    endDate
) => {
    if (!startDate || !endDate) {
        return null;
    }

    const start =
        new Date(startDate);

    const end =
        new Date(endDate);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        return null;
    }

    return Math.ceil(
        (end - start) /
        (1000 * 60 * 60 * 24)
    );
};

const isOverdueAudit = (audit) => {
    const status = norm(
        audit?.status
    );

    if (
        [
            "COMPLETED",
            "CLOSED",
            "CANCELLED",
        ].includes(status)
    ) {
        return false;
    }

    const dueDate =
        audit?.dueDate ??
        audit?.endDate ??
        audit?.plannedEndDate ??
        audit?.targetDate;

    if (!dueDate) {
        return false;
    }

    const due =
        new Date(dueDate);

    if (
        Number.isNaN(due.getTime())
    ) {
        return false;
    }

    return due < new Date();
};

// ============================================================
// STATISTICS
// ============================================================

const buildStatistics = (
    audits,
    findings,
    pendingEvidence
) => {
    const totalAudits =
        audits.length;

    const activeAudits =
        audits.filter((audit) =>
            ![
                "COMPLETED",
                "CLOSED",
                "CANCELLED",
            ].includes(
                norm(audit.status)
            )
        ).length;

    const completedAudits =
        audits.filter((audit) =>
            [
                "COMPLETED",
                "CLOSED",
            ].includes(
                norm(audit.status)
            )
        ).length;

    const pendingReviews =
        audits.filter((audit) =>
            REVIEW_STATUSES.includes(
                norm(audit.status)
            )
        ).length;

    const openFindings =
        findings.filter((finding) =>
            !RESOLVED_FINDING_STATUSES.includes(
                norm(finding.status)
            )
        ).length;

    const criticalFindings =
        findings.filter((finding) =>
            norm(
                finding.severity
            ) === "CRITICAL"
        ).length;

    const overdueAudits =
        audits.filter(
            isOverdueAudit
        ).length;

    return {
        totalAudits,
        activeAudits,
        completedAudits,
        pendingReviews,
        openFindings,
        criticalFindings,
        overdueAudits,
        evidencePending:
            pendingEvidence.length,
    };
};

// ============================================================
// AUDIT STATUS DISTRIBUTION
// ============================================================

const buildAuditStatusDistribution = (
    audits
) => {
    const counts = {};

    AUDIT_STATUS_ORDER.forEach(
        (status) => {
            counts[status] = 0;
        }
    );

    audits.forEach((audit) => {
        const status =
            norm(audit.status) ||
            "UNKNOWN";

        counts[status] =
            (counts[status] || 0) + 1;
    });

    return Object.entries(
        counts
    ).map(
        ([name, value]) => ({
            name,
            value,
        })
    );
};

// ============================================================
// AUDIT TREND
// ============================================================

const buildAuditTrend = (
    audits
) => {
    const currentYear =
        new Date().getFullYear();

    const months = MONTH_LABELS.map(
        (month, index) => ({
            month,
            planned: 0,
            completed: 0,
            total: 0,
        })
    );

    audits.forEach((audit) => {
        const dateValue =
            audit.plannedStartDate ??
            audit.startDate ??
            audit.createdAt ??
            audit.createdDate;

        if (!dateValue) {
            return;
        }

        const date =
            new Date(dateValue);

        if (
            Number.isNaN(
                date.getTime()
            ) ||
            date.getFullYear() !==
                currentYear
        ) {
            return;
        }

        const month =
            date.getMonth();

        months[month].total += 1;

        const status =
            norm(audit.status);

        if (
            [
                "COMPLETED",
                "CLOSED",
            ].includes(status)
        ) {
            months[month].completed += 1;
        } else {
            months[month].planned += 1;
        }
    });

    return months;
};

// ============================================================
// FINDINGS SEVERITY
// ============================================================

const buildFindingsSeverity = (
    findings
) => {
    const counts = {};

    SEVERITY_ORDER.forEach(
        (severity) => {
            counts[severity] = 0;
        }
    );

    findings.forEach((finding) => {
        const severity =
            norm(
                finding.severity
            ) || "UNKNOWN";

        counts[severity] =
            (counts[severity] || 0) + 1;
    });

    return Object.entries(
        counts
    ).map(
        ([name, value]) => ({
            name,
            value,
        })
    );
};

// ============================================================
// RISK DISTRIBUTION
// ============================================================

const buildRiskDistribution = (
    risks
) => {
    const counts = {};

    risks.forEach((risk) => {
        const level =
            norm(
                risk.riskLevel ??
                risk.riskRating ??
                risk.rating ??
                risk.severity
            ) || "UNKNOWN";

        counts[level] =
            (counts[level] || 0) + 1;
    });

    return Object.entries(
        counts
    ).map(
        ([name, value]) => ({
            name,
            value,
        })
    );
};

// ============================================================
// RISK SUMMARY
// ============================================================

const buildRiskSummary = (
    risks
) => {
    const summary = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        total: risks.length,
    };

    risks.forEach((risk) => {
        const level =
            norm(
                risk.riskLevel ??
                risk.riskRating ??
                risk.rating ??
                risk.severity
            );

        if (level === "CRITICAL") {
            summary.critical += 1;
        } else if (level === "HIGH") {
            summary.high += 1;
        } else if (level === "MEDIUM") {
            summary.medium += 1;
        } else if (level === "LOW") {
            summary.low += 1;
        }
    });

    return summary;
};

// ============================================================
// DEPARTMENT PERFORMANCE
// ============================================================

const buildDepartmentPerformance = (
    audits
) => {
    const departments = {};

    audits.forEach((audit) => {
        // IMPORTANT:
        // Always convert department object
        // into a primitive string.
        const dept =
            safeString(
                getDepartmentName(audit),
                "UNASSIGNED"
            ) || "UNASSIGNED";

        if (!departments[dept]) {
            departments[dept] = {
                department: dept,
                total: 0,
                completed: 0,
                active: 0,
            };
        }

        departments[dept].total += 1;

        const status =
            norm(audit.status);

        if (
            [
                "COMPLETED",
                "CLOSED",
            ].includes(status)
        ) {
            departments[dept].completed += 1;
        } else {
            departments[dept].active += 1;
        }
    });

    return Object.values(
        departments
    ).map((item) => ({
        ...item,

        completionRate:
            item.total > 0
                ? Math.round(
                    (item.completed /
                        item.total) *
                        100
                )
                : 0,
    }));
};

// ============================================================
// AUDITOR PERFORMANCE
// ============================================================

const buildAuditorPerformance = (
    audits
) => {
    const auditors = {};

    audits.forEach((audit) => {
        const name =
            safeString(
                audit.internalAuditorName ??
                audit.auditorName ??
                audit.internalAuditor ??
                audit.auditor,
                "Unassigned"
            ) || "Unassigned";

        if (!auditors[name]) {
            auditors[name] = {
                auditor: name,
                total: 0,
                completed: 0,
                active: 0,
            };
        }

        auditors[name].total += 1;

        const status =
            norm(audit.status);

        if (
            [
                "COMPLETED",
                "CLOSED",
            ].includes(status)
        ) {
            auditors[name].completed += 1;
        } else {
            auditors[name].active += 1;
        }
    });

    return Object.values(
        auditors
    ).map((item) => ({
        ...item,

        completionRate:
            item.total > 0
                ? Math.round(
                    (item.completed /
                        item.total) *
                        100
                )
                : 0,
    }));
};

// ============================================================
// PENDING REVIEWS
// ============================================================

const buildPendingReviews = (
    audits
) => {
    return audits
        .filter((audit) =>
            REVIEW_STATUSES.includes(
                norm(audit.status)
            )
        )
        .map((audit) => ({
            id:
                audit.id ??
                audit.auditDbId ??
                audit.auditId,

            auditId: safeString(
                audit.auditCode ??
                audit.auditId ??
                audit.id
            ),

            title: safeString(
                audit.title ??
                audit.auditTitle ??
                audit.name,
                "Untitled Audit"
            ),

            auditor: safeString(
                audit.internalAuditorName ??
                audit.auditorName ??
                audit.internalAuditor ??
                audit.auditor,
                "Unassigned"
            ),

            // FIX:
            // Never return audit.department
            // directly because it may be an object.
            department:
                safeString(
                    getDepartmentName(audit),
                    "Unassigned"
                ),

            status:
                norm(audit.status) ||
                "PENDING_REVIEW",

            dueDate:
                audit.dueDate ??
                audit.endDate ??
                audit.plannedEndDate ??
                null,
        }));
};

// ============================================================
// UPCOMING DEADLINES
// ============================================================

const buildUpcomingDeadlines = (
    audits
) => {
    return audits
        .filter((audit) => {
            const dueDate =
                audit.dueDate ??
                audit.endDate ??
                audit.plannedEndDate ??
                audit.targetDate;

            if (!dueDate) {
                return false;
            }

            const date =
                new Date(dueDate);

            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return false;
            }

            return (
                date >= new Date()
            );
        })
        .sort((a, b) => {
            const dateA =
                new Date(
                    a.dueDate ??
                    a.endDate ??
                    a.plannedEndDate ??
                    a.targetDate
                );

            const dateB =
                new Date(
                    b.dueDate ??
                    b.endDate ??
                    b.plannedEndDate ??
                    b.targetDate
                );

            return (
                dateA - dateB
            );
        })
        .slice(0, 10)
        .map((audit) => {
            const dueDate =
                audit.dueDate ??
                audit.endDate ??
                audit.plannedEndDate ??
                audit.targetDate;

            return {
                id:
                    audit.id ??
                    audit.auditDbId ??
                    audit.auditId,

                auditId: safeString(
                    audit.auditCode ??
                    audit.auditId ??
                    audit.id
                ),

                title: safeString(
                    audit.title ??
                    audit.auditTitle ??
                    audit.name,
                    "Untitled Audit"
                ),

                department:
                    safeString(
                        getDepartmentName(audit),
                        "Unassigned"
                    ),

                auditor: safeString(
                    audit.internalAuditorName ??
                    audit.auditorName ??
                    audit.internalAuditor ??
                    audit.auditor,
                    "Unassigned"
                ),

                status:
                    norm(audit.status) ||
                    "PLANNED",

                dueDate,

                daysRemaining:
                    daysBetween(
                        new Date(),
                        dueDate
                    ),
            };
        });
};

// ============================================================
// RECENT ACTIVITY
// ============================================================

const buildRecentActivity = (
    audits,
    findings,
    pendingEvidence
) => {
    const activities = [];

    // --------------------------------------------------------
    // AUDITS
    // --------------------------------------------------------

    audits.forEach((audit) => {
        const date =
            audit.updatedAt ??
            audit.updatedDate ??
            audit.createdAt ??
            audit.createdDate;

        if (!date) {
            return;
        }

        activities.push({
            id:
                `audit-${audit.id ??
                    audit.auditDbId ??
                    audit.auditId}`,

            type: "AUDIT",

            title: safeString(
                audit.title ??
                audit.auditTitle ??
                audit.name,
                "Audit Updated"
            ),

            description:
                `Audit status: ${
                    norm(
                        audit.status
                    ) || "UNKNOWN"
                }`,

            user: safeString(
                audit.internalAuditorName ??
                audit.auditorName ??
                audit.internalAuditor ??
                audit.auditor,
                "System"
            ),

            date,
        });
    });

    // --------------------------------------------------------
    // FINDINGS
    // --------------------------------------------------------

    findings.forEach((finding) => {
        const date =
            finding.updatedAt ??
            finding.updatedDate ??
            finding.createdAt ??
            finding.createdDate;

        if (!date) {
            return;
        }

        activities.push({
            id:
                `finding-${finding.id ??
                    finding.findingId}`,

            type: "FINDING",

            title: safeString(
                finding.title ??
                finding.findingTitle ??
                finding.name,
                "Finding"
            ),

            description:
                `Finding severity: ${
                    norm(
                        finding.severity
                    ) || "UNKNOWN"
                }`,

            user: safeString(
                finding.auditorName ??
                finding.internalAuditorName ??
                finding.auditor,
                "System"
            ),

            date,
        });
    });

    // --------------------------------------------------------
    // EVIDENCE
    // --------------------------------------------------------

    pendingEvidence.forEach(
        (evidence) => {
            const date =
                evidence.uploadedAt ??
                evidence.createdAt ??
                evidence.updatedAt ??
                evidence.createdDate;

            if (!date) {
                return;
            }

            activities.push({
                id:
                    `evidence-${evidence.id ??
                        evidence.evidenceId}`,

                type: "EVIDENCE",

                title: safeString(
                    evidence.fileName ??
                    evidence.name ??
                    evidence.title,
                    "Evidence Uploaded"
                ),

                description:
                    "Evidence is pending review",

                user: safeString(
                    evidence.uploadedBy?.name ??
                    evidence.uploadedBy ??
                    evidence.createdBy,
                    "System"
                ),

                date,
            });
        }
    );

    // --------------------------------------------------------
    // SORT
    // --------------------------------------------------------

    return activities
        .sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        )
        .slice(0, 10);
};

// ============================================================
// BUILD COMPLETE DASHBOARD DATA
// ============================================================

export const buildDashboardData = ({
    audits = [],
    findings = [],
    pendingEvidence = [],
    risks = [],
    managerDepartment = null,
}) => {
    const statistics =
        buildStatistics(
            audits,
            findings,
            pendingEvidence
        );

    const auditStatus =
        buildAuditStatusDistribution(
            audits
        );

    const auditTrend =
        buildAuditTrend(
            audits
        );

    const findingsSeverity =
        buildFindingsSeverity(
            findings
        );

    const riskDistribution =
        buildRiskDistribution(
            risks
        );

    const riskSummary =
        buildRiskSummary(
            risks
        );

    const departmentPerformance =
        buildDepartmentPerformance(
            audits
        );

    const auditorPerformance =
        buildAuditorPerformance(
            audits
        );

    const pendingReviews =
        buildPendingReviews(
            audits
        );

    const upcomingDeadlines =
        buildUpcomingDeadlines(
            audits
        );

    const recentActivity =
        buildRecentActivity(
            audits,
            findings,
            pendingEvidence
        );

    return {
        statistics,

        auditStatus,

        auditTrend,

        findingsSeverity,

        riskDistribution,

        riskSummary,

        departmentPerformance,

        auditorPerformance,

        pendingReviews,

        upcomingDeadlines,

        recentActivity,

        managerDepartment,
    };
};

// ============================================================
// DEFAULT SERVICE
// ============================================================

const DashboardService = {
    fetchDashboardSources,
    buildDashboardData,
};

export default DashboardService;