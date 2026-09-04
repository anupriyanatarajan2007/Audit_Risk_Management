// src/pages/compliance/ComplianceReviews.jsx

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock3,
    Eye,
    FileCheck2,
    FileText,
    Filter,
    GitBranch,
    Layers3,
    RefreshCw,
    Search,
    ShieldAlert,
    X,
    MessageSquareText,
    Lock,
    ExternalLink,
} from "lucide-react";

import RiskService from "../../service/RiskService";
import AuditService from "../../service/AuditService";
import EvidenceService from "../../service/EvidenceService";
import ReviewService from "../../service/ReviewService";

import { getFindingsByAuditId } from "../../service/FindingService";
import { getRecommendationsForFinding } from "../../service/recommendationService";

// ============================================================
// ANIMATIONS
// ============================================================

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.06 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 },
    },
};

// ============================================================
// NORMALIZATION HELPERS
// ============================================================

const normalizeArrayResponse = (response) => {
    if (!response) return [];

    if (Array.isArray(response)) return response;

    if (Array.isArray(response?.data)) return response.data;

    if (Array.isArray(response?.content)) return response.content;

    if (Array.isArray(response?.data?.content)) {
        return response.data.content;
    }

    if (Array.isArray(response?.risks)) return response.risks;

    if (Array.isArray(response?.audits)) return response.audits;

    if (Array.isArray(response?.reviews)) return response.reviews;

    if (response?.data && typeof response.data === "object") {
        return [response.data];
    }

    if (typeof response === "object") return [response];

    return [];
};

// ============================================================
// DISPLAY HELPERS
// ============================================================

const display = (value) => {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    if (typeof value === "object") {
        if (value.name) return value.name;
        if (value.fullName) return value.fullName;
        if (value.employeeId) return value.employeeId;
        if (value.auditId) return value.auditId;
        if (value.riskId) return value.riskId;

        try {
            return JSON.stringify(value);
        } catch {
            return "-";
        }
    }

    return String(value).replaceAll("_", " ");
};

const formatDate = (value) => {
    if (!value) return "-";

    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
};

// ============================================================
// STATUS HELPERS
// ============================================================

const getStatusClass = (status) => {
    const value = String(status || "").toUpperCase();

    if (
        [
            "APPROVED",
            "COMPLETED",
            "CLOSED",
            "RESOLVED",
            "ACCEPTED",
        ].includes(value)
    ) {
        return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    }

    if (
        [
            "REJECTED",
            "FAILED",
            "CRITICAL",
            "BREACHED",
        ].includes(value)
    ) {
        return "bg-red-50 text-red-700 ring-red-200";
    }

    if (
        [
            "IN_PROGRESS",
            "ONGOING",
            "UNDER_REVIEW",
            "SUBMITTED",
        ].includes(value)
    ) {
        return "bg-amber-50 text-amber-700 ring-amber-200";
    }

    return "bg-slate-50 text-slate-600 ring-slate-200";
};

const StatusBadge = ({ status }) => {
    return (
        <span
            className={`
                inline-flex items-center rounded-full px-2.5 py-1
                text-xs font-semibold ring-1 ${getStatusClass(status)}
            `}
        >
            {display(status)}
        </span>
    );
};

// ============================================================
// STAGE STATUS
// ============================================================

const getStageState = (status) => {
    const value = String(status || "").toUpperCase();

    if (
        [
            "APPROVED",
            "COMPLETED",
            "CLOSED",
            "RESOLVED",
            "ACCEPTED",
        ].includes(value)
    ) {
        return "COMPLETED";
    }

    if (
        [
            "REJECTED",
            "FAILED",
            "CRITICAL",
            "BREACHED",
        ].includes(value)
    ) {
        return "CRITICAL";
    }

    if (
        [
            "IN_PROGRESS",
            "ONGOING",
            "UNDER_REVIEW",
            "SUBMITTED",
        ].includes(value)
    ) {
        return "IN_PROGRESS";
    }

    return "PENDING";
};

// ============================================================
// AGGREGATE STATUS
// ============================================================

const pickAggregateStatus = (items, getStatus) => {
    if (!items || !items.length) {
        return null;
    }

    const withState = items.map((item) => {
        const status = getStatus(item);

        return {
            status,
            state: getStageState(status),
        };
    });

    const critical = withState.find(
        (entry) => entry.state === "CRITICAL"
    );

    if (critical) return critical.status;

    const inProgress = withState.find(
        (entry) =>
            entry.state === "PENDING" ||
            entry.state === "IN_PROGRESS"
    );

    if (inProgress) return inProgress.status;

    return withState[0].status;
};

// ============================================================
// TRACKING STAGES
// ============================================================

const TRACKING_STAGES = [
    {
        key: "risk",
        label: "Risk",
        icon: ShieldAlert,
        statusField: "status",
    },
    {
        key: "audit",
        label: "Audit",
        icon: FileText,
        statusField: "auditStatus",
    },
    {
        key: "finding",
        label: "Finding",
        icon: AlertTriangle,
        statusField: "findingStatus",
    },
    {
        key: "evidence",
        label: "Evidence",
        icon: FileCheck2,
        statusField: "evidenceStatus",
    },
    {
        key: "recommendation",
        label: "Recommendation",
        icon: GitBranch,
        statusField: "recommendationStatus",
    },
    {
        key: "review",
        label: "Compliance Review",
        icon: Layers3,
        statusField: "reviewStatus",
    },
];

// ============================================================
// LOAD REVIEWS
// ============================================================

const loadAllReviews = async () => {
    try {
        const response = await ReviewService.getAllReviews();

        console.log("ALL REVIEWS RESPONSE:", response);

        return normalizeArrayResponse(response);
    } catch (error) {
        console.error("Failed to load reviews:", error);

        return [];
    }
};

// ============================================================
// LOAD AUDITS
// ============================================================

const loadAllAudits = async () => {
    try {
        const response = await AuditService.getAllAudits();

        console.log("ALL AUDITS RESPONSE:", response);

        return normalizeArrayResponse(response);
    } catch (error) {
        console.error("Failed to load audits:", error);

        return [];
    }
};

// ============================================================
// LOAD FINDINGS
// ============================================================

const loadFindingsForAudit = async (auditId) => {
    if (!auditId) return [];

    try {
        console.log(
            "Fetching findings for audit:",
            auditId
        );

        const response = await getFindingsByAuditId(auditId);

        console.log("FINDINGS RESPONSE:", response);

        return normalizeArrayResponse(response);
    } catch (error) {
        console.error(
            `Failed to load findings for audit ${auditId}:`,
            error
        );

        return [];
    }
};

// ============================================================
// LOAD EVIDENCE
// ============================================================

const loadEvidenceForAudit = async (auditId) => {
    if (!auditId) return [];

    try {
        console.log(
            "Fetching evidence for audit:",
            auditId
        );

        const response =
            await EvidenceService.getEvidenceByAudit(auditId);

        console.log("EVIDENCE RESPONSE:", response);

        return normalizeArrayResponse(response);
    } catch (error) {
        console.error(
            `Failed to load evidence for audit ${auditId}:`,
            error
        );

        return [];
    }
};

// ============================================================
// LOAD RECOMMENDATIONS
// ============================================================

const loadRecommendationsForFinding = async (findingId) => {
    if (!findingId) return [];

    try {
        console.log(
            "Fetching recommendations for finding:",
            findingId
        );

        const response =
            await getRecommendationsForFinding(findingId);

        console.log(
            "RECOMMENDATIONS RESPONSE:",
            response
        );

        return normalizeArrayResponse(response);
    } catch (error) {
        console.error(
            `Failed to load recommendations for finding ${findingId}:`,
            error
        );

        return [];
    }
};

// ============================================================
// ATTACH AUDITS
// ============================================================

const attachAudits = (risks, audits) => {
    const auditMap = new Map();

    (audits || []).forEach((audit) => {
        const riskId =
            audit?.riskId ??
            audit?.risk?.riskId ??
            audit?.riskCode;

        if (!riskId) return;

        const key = String(riskId);

        if (!auditMap.has(key)) {
            auditMap.set(key, []);
        }

        auditMap.get(key).push(audit);
    });

    return risks.map((risk) => {
        const key = String(
            risk?.riskId ??
                risk?.riskCode ??
                risk?.id ??
                ""
        );

        const riskAudits =
            auditMap.get(key) || [];

        const audit =
            riskAudits[0] || null;

        return {
            ...risk,

            audits: riskAudits,
            auditList: riskAudits,

            auditDbId:
                audit?.id ?? null,

            auditCode:
                audit?.auditId ?? null,

            auditName:
                audit?.auditName ?? null,

            auditDescription:
                audit?.description ?? null,

            auditDepartment:
                audit?.department ?? null,

            auditBusinessUnit:
                audit?.businessUnit ?? null,

            auditProcessName:
                audit?.processName ?? null,

            auditStartDate:
                audit?.startDate ?? null,

            auditEndDate:
                audit?.endDate ?? null,

            auditStatus:
                audit?.status ?? null,

            auditInternalAuditorId:
                audit?.internalAuditorId ??
                audit?.internalAuditor?.id ??
                null,

            auditInternalAuditorName:
                audit?.internalAuditorName ??
                audit?.internalAuditor?.name ??
                audit?.internalAuditor?.fullName ??
                null,
        };
    });
};

// ============================================================
// ATTACH FINDINGS
// ============================================================

const attachFindings = async (risks) => {
    return Promise.all(
        risks.map(async (risk) => {
            const auditId =
                risk?.auditDbId;

            const rawFindings =
                await loadFindingsForAudit(
                    auditId
                );

            const findings =
                [...rawFindings].sort(
                    (a, b) =>
                        new Date(
                            a?.createdAt ?? 0
                        ).getTime() -
                        new Date(
                            b?.createdAt ?? 0
                        ).getTime()
                );

            const firstFinding =
                findings[0] || null;

            const aggregateFindingStatus =
                pickAggregateStatus(
                    findings,
                    (finding) =>
                        finding?.status
                );

            return {
                ...risk,

                findings,
                findingList:
                    findings,

                findingCount:
                    findings.length,

                findingDbId:
                    firstFinding?.id ??
                    null,

                findingTitle:
                    firstFinding?.title ??
                    null,

                findingObservation:
                    firstFinding?.observation ??
                    null,

                findingSeverity:
                    firstFinding?.riskLevel ??
                    null,

                findingRecommendation:
                    firstFinding?.recommendation ??
                    null,

                findingStatus:
                    aggregateFindingStatus ??
                    firstFinding?.status ??
                    null,

                findingAuditorName:
                    firstFinding?.auditorName ??
                    firstFinding?.auditor?.name ??
                    firstFinding?.auditor?.fullName ??
                    null,

                findingCreatedAt:
                    firstFinding?.createdAt ??
                    null,

                findingUpdatedAt:
                    firstFinding?.updatedAt ??
                    null,
            };
        })
    );
};

// ============================================================
// ATTACH EVIDENCE (audit-level only — findings have no evidence)
// ============================================================

const attachEvidence = async (risks) => {
    return Promise.all(
        risks.map(async (risk) => {
            const auditId =
                risk?.auditDbId;

            const evidenceList =
                await loadEvidenceForAudit(
                    auditId
                );

            const firstEvidence =
                evidenceList[0] || null;

            const aggregateEvidenceStatus =
                pickAggregateStatus(
                    evidenceList,
                    (evidence) =>
                        evidence?.status
                );

            return {
                ...risk,

                evidenceList,

                evidenceItems:
                    evidenceList,

                evidenceCount:
                    evidenceList.length,

                evidenceId:
                    firstEvidence?.id ??
                    null,

                evidenceFileName:
                    firstEvidence?.fileName ??
                    null,

                evidenceFileUrl:
                    firstEvidence
                        ? EvidenceService.getEvidenceFileUrl(
                              firstEvidence
                          )
                        : null,

                evidenceDescription:
                    firstEvidence?.description ??
                    null,

                evidenceStatus:
                    aggregateEvidenceStatus ??
                    firstEvidence?.status ??
                    null,

                evidenceUploadedAt:
                    firstEvidence?.uploadedAt ??
                    null,

                evidenceUploadedByName:
                    firstEvidence?.uploadedBy?.name ??
                    firstEvidence?.uploadedBy?.fullName ??
                    firstEvidence?.uploadedBy?.employeeId ??
                    null,

                evidenceUploadedByEmail:
                    firstEvidence?.uploadedBy?.email ??
                    null,
            };
        })
    );
};

// ============================================================
// ATTACH RECOMMENDATIONS
// ============================================================

const attachRecommendations = async (risks) => {
    return Promise.all(
        risks.map(async (risk) => {
            const findingsWithRecommendations =
                await Promise.all(
                    (risk.findings || []).map(
                        async (finding) => {
                            const findingId =
                                finding?.id ??
                                finding?.findingId;

                            const recommendations =
                                await loadRecommendationsForFinding(
                                    findingId
                                );

                            return {
                                ...finding,

                                recommendations,

                                recommendationCount:
                                    recommendations.length,
                            };
                        }
                    )
                );

            const allRecommendations =
                findingsWithRecommendations.flatMap(
                    (finding) =>
                        finding.recommendations
                );

            const firstFindingWithRec =
                findingsWithRecommendations.find(
                    (finding) =>
                        finding.recommendations
                            .length
                ) ||
                findingsWithRecommendations[0] ||
                null;

            const firstRecommendation =
                firstFindingWithRec
                    ?.recommendations?.[0] ||
                null;

            const aggregateRecommendationStatus =
                pickAggregateStatus(
                    allRecommendations,
                    (rec) => rec?.status
                );

            return {
                ...risk,

                findings:
                    findingsWithRecommendations,

                findingList:
                    findingsWithRecommendations,

                recommendations:
                    allRecommendations,

                recommendationList:
                    allRecommendations,

                recommendationCount:
                    allRecommendations.length,

                recommendationDbId:
                    firstRecommendation?.id ??
                    null,

                recommendationId:
                    firstRecommendation?.recommendationId ??
                    null,

                recommendationText:
                    firstRecommendation?.recommendationText ??
                    null,

                recommendationStatus:
                    aggregateRecommendationStatus ??
                    firstRecommendation?.status ??
                    null,

                recommendationAuditId:
                    firstRecommendation?.auditId ??
                    firstRecommendation?.audit?.id ??
                    null,

                recommendationAuditName:
                    firstRecommendation?.auditName ??
                    firstRecommendation?.audit?.auditName ??
                    null,

                recommendationFindingTitle:
                    firstRecommendation?.findingTitle ??
                    firstRecommendation?.finding?.title ??
                    null,

                recommendationInternalAuditorName:
                    firstRecommendation?.internalAuditorName ??
                    firstRecommendation?.internalAuditor?.name ??
                    null,

                recommendationAuditeeName:
                    firstRecommendation?.auditeeName ??
                    firstRecommendation?.auditee?.name ??
                    null,

                recommendationCreatedAt:
                    firstRecommendation?.createdAt ??
                    null,

                recommendationUpdatedAt:
                    firstRecommendation?.updatedAt ??
                    null,
            };
        })
    );
};

// ============================================================
// SORT REVIEWS
// ============================================================

const sortReviewsNewestFirst = (reviews) => {
    return [...(reviews || [])].sort(
        (a, b) => {
            const aTime = new Date(
                a?.updatedAt ??
                    a?.reviewedAt ??
                    a?.createdAt ??
                    0
            ).getTime();

            const bTime = new Date(
                b?.updatedAt ??
                    b?.reviewedAt ??
                    b?.createdAt ??
                    0
            ).getTime();

            return bTime - aTime;
        }
    );
};

// ============================================================
// ATTACH REVIEWS
// ============================================================

const attachReviews = (
    risks,
    reviews
) => {
    const reviewMap = new Map();

    if (reviews?.length) {
        console.log(
            "REVIEW MATCHING — sample review object:",
            reviews[0]
        );
    }

    (reviews || []).forEach(
        (review) => {
            const keys = [
                review?.risk?.riskId,
                review?.risk?.id,
                review?.risk?.riskCode,
                review?.riskId,
                review?.riskCode,
                review?.riskDbId,
                review?.audit?.riskId,
                review?.audit?.risk?.riskId,
            ]
                .filter(
                    (value) =>
                        value !== null &&
                        value !== undefined &&
                        value !== ""
                )
                .map((value) =>
                    String(value)
                );

            if (!keys.length) {
                console.warn(
                    "REVIEW MATCHING — could not find risk identifier:",
                    review
                );
            }

            keys.forEach((key) => {
                if (!reviewMap.has(key)) {
                    reviewMap.set(
                        key,
                        []
                    );
                }

                reviewMap
                    .get(key)
                    .push(review);
            });
        }
    );

    return risks.map((risk) => {
        const keys = [
            risk?.riskId,
            risk?.riskCode,
            risk?.id,
        ]
            .filter(
                (value) =>
                    value !== null &&
                    value !== undefined &&
                    value !== ""
            )
            .map((value) =>
                String(value)
            );

        let riskReviews = [];

        for (const key of keys) {
            if (reviewMap.has(key)) {
                riskReviews =
                    reviewMap.get(key);

                break;
            }
        }

        riskReviews =
            sortReviewsNewestFirst(
                riskReviews
            );

        const latestReview =
            riskReviews[0] || null;

        return {
            ...risk,

            reviews:
                riskReviews,

            reviewList:
                riskReviews,

            reviewCount:
                riskReviews.length,

            reviewDbId:
                latestReview?.id ??
                null,

            reviewId:
                latestReview?.reviewId ??
                null,

            reviewStatus:
                latestReview?.status ??
                null,

            reviewComments:
                latestReview?.comments ??
                null,

            reviewedAt:
                latestReview?.reviewedAt ??
                null,

            reviewedByName:
                latestReview?.reviewedBy?.name ??
                latestReview?.reviewedBy?.fullName ??
                latestReview?.reviewedByName ??
                null,

            reviewCreatedAt:
                latestReview?.createdAt ??
                null,

            reviewUpdatedAt:
                latestReview?.updatedAt ??
                null,

            isReviewApproved:
                String(
                    latestReview?.status || ""
                ).toUpperCase() ===
                "APPROVED",
        };
    });
};

// ============================================================
// RISK DETAILS
// ============================================================

const RiskDetails = ({ risk }) => {
    return (
        <div>
            <SectionTitle
                icon={ShieldAlert}
                title="Risk Details"
            />

            <DetailGrid
                items={[
                    ["Risk ID", risk.riskId],
                    ["Title", risk.title],
                    ["Description", risk.description],
                    ["Department", risk.department],
                    ["Business Unit", risk.businessUnit],
                    ["Process", risk.processName],
                    ["Category", risk.category],
                    ["Likelihood", risk.likelihood],
                    ["Impact", risk.impact],
                    ["Risk Level", risk.level],
                    ["Risk Score", risk.riskScore],
                    ["Status", risk.status],
                    [
                        "Existing Controls",
                        risk.existingControls,
                    ],
                    [
                        "Mitigation Plan",
                        risk.mitigationPlan,
                    ],
                    [
                        "Mitigation Update",
                        risk.mitigationUpdate,
                    ],
                    [
                        "Target Closure",
                        risk.targetClosureDate,
                    ],
                    [
                        "Actual Closure",
                        risk.actualClosureDate,
                    ],
                    ["Remarks", risk.remarks],
                    [
                        "Identified By",
                        risk.identifiedByName,
                    ],
                    ["Created At", risk.createdAt],
                    ["Updated At", risk.updatedAt],
                ]}
            />
        </div>
    );
};

// ============================================================
// AUDIT DETAILS
// ============================================================

const AuditDetails = ({ risk }) => {
    return (
        <div>
            <SectionTitle
                icon={FileText}
                title="Audit Details"
            />

            {!risk.auditDbId ? (
                <EmptyStage
                    text="No audit has been created for this risk."
                />
            ) : (
                <DetailGrid
                    items={[
                        ["Audit ID", risk.auditCode],
                        ["Audit Name", risk.auditName],
                        [
                            "Description",
                            risk.auditDescription,
                        ],
                        [
                            "Department",
                            risk.auditDepartment,
                        ],
                        [
                            "Business Unit",
                            risk.auditBusinessUnit,
                        ],
                        [
                            "Process",
                            risk.auditProcessName,
                        ],
                        [
                            "Start Date",
                            risk.auditStartDate,
                        ],
                        [
                            "End Date",
                            risk.auditEndDate,
                        ],
                        ["Status", risk.auditStatus],
                        [
                            "Internal Auditor",
                            risk.auditInternalAuditorName,
                        ],
                        [
                            "Total Findings",
                            risk.findingCount ?? 0,
                        ],
                    ]}
                />
            )}
        </div>
    );
};

// ============================================================
// FINDING DETAILS
// ============================================================

const FindingDetails = ({ risk }) => {
    const findings =
        risk.findings || [];

    // selection state drives which finding's details are shown below —
    // default to the first finding so the panel isn't empty on load
    const [selectedFindingId, setSelectedFindingId] = useState(
        findings[0]?.id ?? null
    );

    // keep the selection valid if findings change (e.g. after a refresh)
    useEffect(() => {
        const stillValid = findings.some(
            (finding) => finding.id === selectedFindingId
        );

        if (!stillValid) {
            setSelectedFindingId(findings[0]?.id ?? null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [risk]);

    const selectedFinding = findings.find(
        (finding) => finding.id === selectedFindingId
    );

    return (
        <div>
            <SectionTitle
                icon={AlertTriangle}
                title={`Findings (${findings.length})`}
            />

            {!findings.length ? (
                <EmptyStage
                    text="No finding is available for this audit."
                />
            ) : (
                <div className="space-y-6">
                    {/* FINDINGS LIST — clickable / selectable */}
                    <div className="space-y-3">
                        {findings.map(
                            (finding, index) => {
                                const isSelected =
                                    selectedFindingId ===
                                    finding.id;

                                return (
                                    <button
                                        key={
                                            finding.id ??
                                            index
                                        }
                                        type="button"
                                        onClick={() =>
                                            setSelectedFindingId(
                                                finding.id
                                            )
                                        }
                                        aria-pressed={isSelected}
                                        className={`
                                            flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition
                                            ${
                                                isSelected
                                                    ? "border-slate-900 bg-slate-900/[0.04] ring-1 ring-slate-900"
                                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                            }
                                        `}
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <span
                                                className={`
                                                    flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold
                                                    ${
                                                        isSelected
                                                            ? "bg-slate-900 text-white"
                                                            : "bg-slate-100 text-slate-500"
                                                    }
                                                `}
                                            >
                                                {index + 1}
                                            </span>

                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold text-slate-800">
                                                    {display(
                                                        finding.title
                                                    )}
                                                </p>

                                                <p className="mt-0.5 text-xs text-slate-400">
                                                    {finding.recommendationCount ??
                                                        0}{" "}
                                                    recommendation
                                                    {finding.recommendationCount ===
                                                    1
                                                        ? ""
                                                        : "s"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2">
                                            <StatusBadge
                                                status={
                                                    finding.status
                                                }
                                            />

                                            {isSelected && (
                                                <CheckCircle2
                                                    size={16}
                                                    className="text-emerald-600"
                                                />
                                            )}
                                        </div>
                                    </button>
                                );
                            }
                        )}
                    </div>

                    {/* SELECTED FINDING'S DETAILS */}
                    {selectedFinding && (
                        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                            <DetailGrid
                                items={[
                                    [
                                        "Finding ID",
                                        selectedFinding.id,
                                    ],
                                    [
                                        "Title",
                                        selectedFinding.title,
                                    ],
                                    [
                                        "Severity",
                                        selectedFinding.riskLevel,
                                    ],
                                    [
                                        "Status",
                                        selectedFinding.status,
                                    ],
                                    [
                                        "Observation",
                                        selectedFinding.observation,
                                    ],
                                    [
                                        "Recommendation",
                                        selectedFinding.recommendation,
                                    ],
                                    [
                                        "Auditor",
                                        selectedFinding.auditorName ??
                                            selectedFinding.auditor?.name ??
                                            selectedFinding.auditor?.fullName,
                                    ],
                                    [
                                        "Created At",
                                        formatDate(
                                            selectedFinding.createdAt
                                        ),
                                    ],
                                    [
                                        "Updated At",
                                        formatDate(
                                            selectedFinding.updatedAt
                                        ),
                                    ],
                                ]}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ============================================================
// EVIDENCE PREVIEW MODAL
// ============================================================

const EvidencePreviewModal = ({
    evidence,
    onClose,
}) => {
    if (!evidence) return null;

    const fileUrl =
        EvidenceService.getEvidenceFileUrl(
            evidence
        );

    const fileName =
        evidence?.fileName ||
        "Evidence";

    const extension =
        fileName
            .split(".")
            .pop()
            ?.toLowerCase() || "";

    const isPdf =
        extension === "pdf";

    const isImage = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "bmp",
        "svg",
    ].includes(extension);

    const isVideo = [
        "mp4",
        "webm",
        "ogg",
        "mov",
    ].includes(extension);

    const isAudio = [
        "mp3",
        "wav",
        "ogg",
        "m4a",
    ].includes(extension);

    const handleOpenNewTab = () => {
        if (!fileUrl) return;

        window.open(
            fileUrl,
            "_blank",
            "noopener,noreferrer"
        );
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.96,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.96,
                        y: 20,
                    }}
                    onClick={(e) =>
                        e.stopPropagation()
                    }
                    className="flex h-[92vh] w-full max-w-[1200px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
                >
                    {/* HEADER */}

                    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900">
                                <FileCheck2
                                    size={19}
                                    className="text-white"
                                />
                            </div>

                            <div className="min-w-0">
                                <h2 className="truncate text-base font-bold text-slate-900">
                                    Evidence Preview
                                </h2>

                                <p className="truncate text-xs text-slate-400">
                                    {fileName}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {fileUrl && (
                                <button
                                    type="button"
                                    onClick={
                                        handleOpenNewTab
                                    }
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    <ExternalLink
                                        size={14}
                                    />
                                    Open New Tab
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={
                                    onClose
                                }
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X
                                    size={19}
                                />
                            </button>
                        </div>
                    </div>

                    {/* FILE INFORMATION */}

                    <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 bg-slate-50 px-6 py-3">
                        <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                            File: {fileName}
                        </span>

                        <StatusBadge
                            status={
                                evidence.status
                            }
                        />

                        <span className="text-xs text-slate-400">
                            Uploaded{" "}
                            {formatDate(
                                evidence.uploadedAt
                            )}
                        </span>
                    </div>

                    {/* PREVIEW */}

                    <div className="flex-1 overflow-auto bg-slate-100 p-4">
                        {!fileUrl ? (
                            <div className="flex h-full items-center justify-center">
                                <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                                    <AlertTriangle
                                        size={
                                            36
                                        }
                                        className="mx-auto text-red-400"
                                    />

                                    <h3 className="mt-3 text-sm font-bold text-slate-800">
                                        File unavailable
                                    </h3>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Evidence file URL could not be generated.
                                    </p>
                                </div>
                            </div>
                        ) : isPdf ? (
                            <iframe
                                src={fileUrl}
                                title={fileName}
                                className="h-full min-h-[700px] w-full rounded-xl border border-slate-200 bg-white"
                            />
                        ) : isImage ? (
                            <div className="flex min-h-full items-center justify-center rounded-xl bg-slate-900 p-6">
                                <img
                                    src={fileUrl}
                                    alt={fileName}
                                    className="max-h-[75vh] max-w-full rounded-lg object-contain shadow-2xl"
                                />
                            </div>
                        ) : isVideo ? (
                            <div className="flex min-h-full items-center justify-center rounded-xl bg-slate-900 p-6">
                                <video
                                    src={fileUrl}
                                    controls
                                    className="max-h-[75vh] max-w-full rounded-xl"
                                >
                                    Your browser does not support video playback.
                                </video>
                            </div>
                        ) : isAudio ? (
                            <div className="flex min-h-full items-center justify-center">
                                <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-sm">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900">
                                            <FileCheck2
                                                size={
                                                    20
                                                }
                                                className="text-white"
                                            />
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-slate-800">
                                                {fileName}
                                            </p>

                                            <p className="text-xs text-slate-400">
                                                Audio evidence
                                            </p>
                                        </div>
                                    </div>

                                    <audio
                                        src={
                                            fileUrl
                                        }
                                        controls
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex min-h-full items-center justify-center">
                                <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                                    <FileText
                                        size={
                                            40
                                        }
                                        className="mx-auto text-slate-400"
                                    />

                                    <h3 className="mt-4 text-sm font-bold text-slate-800">
                                        Preview not supported
                                    </h3>

                                    <p className="mt-2 text-xs leading-5 text-slate-400">
                                        This file type cannot be previewed directly in the browser.
                                        Open it in a new tab to view or download it.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={
                                            handleOpenNewTab
                                        }
                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                                    >
                                        <ExternalLink
                                            size={
                                                14
                                            }
                                        />
                                        Open Evidence
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FOOTER */}

                    <div className="border-t border-slate-200 bg-white px-6 py-4">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Uploaded By
                                </p>

                                <p className="mt-1 text-xs font-semibold text-slate-700">
                                    {display(
                                        evidence.uploadedBy?.name ??
                                            evidence.uploadedBy?.fullName ??
                                            evidence.uploadedBy?.employeeId
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Description
                                </p>

                                <p className="mt-1 text-xs font-semibold text-slate-700">
                                    {display(
                                        evidence.description
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                    Status
                                </p>

                                <div className="mt-1">
                                    <StatusBadge
                                        status={
                                            evidence.status
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ============================================================
// EVIDENCE ROW
// ============================================================

const getEvidenceFileType = (evidence) => {
    const explicitType =
        evidence?.fileType ??
        evidence?.contentType ??
        evidence?.mimeType;

    if (explicitType) return String(explicitType).toUpperCase();

    const fileName = evidence?.fileName || "";
    const extension = fileName.split(".").pop()?.toLowerCase();

    return extension ? extension.toUpperCase() : "Unknown";
};

const EvidenceRow = ({
    evidence,
    onView,
}) => {
    const fileUrl =
        EvidenceService.getEvidenceFileUrl(
            evidence
        );

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <FileCheck2
                            size={16}
                            className="shrink-0 text-emerald-600"
                        />

                        <p className="truncate text-sm font-semibold text-slate-800">
                            {display(
                                evidence.fileName
                            )}
                        </p>

                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                            {getEvidenceFileType(evidence)}
                        </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                        {evidence.description ||
                            "No description"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Uploaded{" "}
                        {formatDate(
                            evidence.uploadedAt
                        )}{" "}
                        by{" "}
                        {evidence.uploadedBy
                            ?.name ??
                            evidence.uploadedBy
                                ?.fullName ??
                            evidence.uploadedBy
                                ?.employeeId ??
                            "Unknown"}
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge
                        status={
                            evidence.status
                        }
                    />

                    <button
                        type="button"
                        onClick={() =>
                            onView(evidence)
                        }
                        disabled={!fileUrl}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Eye size={14} />
                        View
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// EVIDENCE DETAILS (audit-level — a plain list, not tied to findings)
// ============================================================

const EvidenceDetails = ({ risk }) => {
    const evidenceList = risk.evidenceList || [];

    const hasAnyEvidence = evidenceList.length > 0;

    const [selectedEvidence, setSelectedEvidence] = useState(null);

    return (
        <div>
            <SectionTitle
                icon={FileCheck2}
                title={`Evidence (${risk.evidenceCount || 0})`}
            />

            {!hasAnyEvidence ? (
                <EmptyStage text="No evidence has been uploaded for this audit." />
            ) : (
                <div className="space-y-2">
                    {evidenceList.map((evidence) => (
                        <EvidenceRow
                            key={evidence.id}
                            evidence={evidence}
                            onView={setSelectedEvidence}
                        />
                    ))}
                </div>
            )}

            {selectedEvidence && (
                <EvidencePreviewModal
                    evidence={selectedEvidence}
                    onClose={() => setSelectedEvidence(null)}
                />
            )}
        </div>
    );
};

// ============================================================
// RECOMMENDATION DETAILS
// ============================================================

const RecommendationDetails = ({
    risk,
}) => {
    const findings =
        risk.findings || [];

    const hasAny =
        (risk.recommendationCount ||
            0) > 0;

    return (
        <div>
            <SectionTitle
                icon={GitBranch}
                title={`Recommendations (${risk.recommendationCount || 0})`}
            />

            {!hasAny ? (
                <EmptyStage
                    text="No recommendation is available for this audit's findings."
                />
            ) : (
                <div className="space-y-5">
                    {findings
                        .filter(
                            (finding) =>
                                finding.recommendationCount >
                                0
                        )
                        .map(
                            (finding) => (
                                <div
                                    key={
                                        finding.id
                                    }
                                >
                                    <h4 className="mb-2 text-sm font-bold text-slate-800">
                                        {display(
                                            finding.title
                                        )}{" "}
                                        <span className="font-normal text-slate-400">
                                            (
                                            {
                                                finding.recommendationCount
                                            }
                                            )
                                        </span>
                                    </h4>

                                    <div className="space-y-2">
                                        {finding.recommendations.map(
                                            (
                                                rec
                                            ) => (
                                                <div
                                                    key={
                                                        rec.id
                                                    }
                                                    className="rounded-xl border border-slate-200 bg-white p-4"
                                                >
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800">
                                                                {display(
                                                                    rec.recommendationText
                                                                )}
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                Auditee:{" "}
                                                                {display(
                                                                    rec.auditeeName ??
                                                                        rec.auditee
                                                                            ?.name
                                                                )}
                                                            </p>
                                                        </div>

                                                        <StatusBadge
                                                            status={
                                                                rec.status
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )
                        )}
                </div>
            )}
        </div>
    );
};

// ============================================================
// REVIEW DETAILS
// ============================================================

const ReviewDetails = ({
    risk,
}) => {
    return (
        <div>
            <SectionTitle
                icon={Layers3}
                title="Compliance Review"
            />

            {!risk.reviewDbId ? (
                <EmptyStage
                    text="No compliance review has been submitted yet."
                />
            ) : (
                <DetailGrid
                    items={[
                        [
                            "Review ID",
                            risk.reviewId,
                        ],
                        [
                            "Review Status",
                            risk.reviewStatus,
                        ],
                        [
                            "Reviewed By",
                            risk.reviewedByName,
                        ],
                        [
                            "Comments",
                            risk.reviewComments,
                        ],
                        [
                            "Reviewed At",
                            formatDate(
                                risk.reviewedAt
                            ),
                        ],
                        [
                            "Created At",
                            formatDate(
                                risk.reviewCreatedAt
                            ),
                        ],
                        [
                            "Updated At",
                            formatDate(
                                risk.reviewUpdatedAt
                            ),
                        ],
                    ]}
                />
            )}
        </div>
    );
};

// ============================================================
// SECTION TITLE
// ============================================================

const SectionTitle = ({
    icon: Icon,
    title,
}) => {
    return (
        <div className="mb-5 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Icon
                    className="h-5 w-5 text-slate-700"
                />
            </div>

            <div>
                <h3 className="font-bold text-slate-900">
                    {title}
                </h3>

                <p className="text-xs text-slate-400">
                    Complete stage information
                </p>
            </div>
        </div>
    );
};

// ============================================================
// DETAIL GRID
// ============================================================

const DetailGrid = ({
    items,
}) => {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map(
                (
                    [label, value],
                    index
                ) => (
                    <div
                        key={index}
                        className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                    >
                        <p className="text-xs text-slate-400">
                            {label}
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                            {display(value)}
                        </p>
                    </div>
                )
            )}
        </div>
    );
};

// ============================================================
// EMPTY STAGE
// ============================================================

const EmptyStage = ({
    text,
}) => {
    return (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-400">
                {text}
            </p>
        </div>
    );
};

// ============================================================
// REVIEW FORM
// ============================================================

const ReviewForm = ({
    risk,
    onClose,
    onSaved,
}) => {
    const existingReview =
        risk?.reviews?.[0] ||
        null;

    const existingReviewId =
        existingReview?.id ??
        risk?.reviewDbId ??
        null;

    const isLocked =
        String(
            existingReview?.status ||
                risk?.reviewStatus ||
                ""
        ).toUpperCase() ===
        "APPROVED";

    const [status, setStatus] =
        useState(
            existingReview?.status ||
                risk?.reviewStatus ||
                "PENDING"
        );

    const [comments, setComments] =
        useState(
            existingReview?.comments ||
                risk?.reviewComments ||
                ""
        );

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    // ============================================================
    // SUBMIT REVIEW
    // ============================================================

    const handleSubmit = async (
        event
    ) => {
        event.preventDefault();

        // --------------------------------------------------------
        // APPROVED REVIEW CANNOT BE EDITED
        // --------------------------------------------------------

        if (isLocked) {
            setError(
                "This review is already approved and cannot be changed."
            );

            return;
        }

        // --------------------------------------------------------
        // VALIDATE RISK
        // --------------------------------------------------------

        if (!risk?.id) {
            setError(
                "Risk information is missing."
            );

            return;
        }

        // --------------------------------------------------------
        // VALIDATE AUDIT
        // --------------------------------------------------------

        if (!risk?.auditDbId) {
            setError(
                "This risk does not have an audit yet."
            );

            return;
        }

        // --------------------------------------------------------
        // COMMENTS REQUIRED
        // --------------------------------------------------------

        if (!comments.trim()) {
            setError(
                "Please enter review comments."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");

            // ====================================================
            // REVIEW PAYLOAD
            //
            // Review entity contains ONLY:
            // Risk
            // Audit
            // Reviewed By -> backend handles this
            // Comments
            // Status
            //
            // NO FINDING
            // NO AUDITEE RESPONSE
            // ====================================================

            const payload = {
                risk: {
                    id: risk.id,
                },

                audit: {
                    id: risk.auditDbId,
                },

                status: status,

                comments:
                    comments.trim(),
            };

            console.log(
                "COMPLIANCE REVIEW PAYLOAD:",
                payload
            );

            let response;

            // ====================================================
            // UPDATE EXISTING REVIEW
            // ====================================================

            if (existingReviewId) {
                response =
                    await ReviewService.updateReview(
                        existingReviewId,
                        payload
                    );
            }

            // ====================================================
            // CREATE NEW REVIEW
            // ====================================================

            else {
                response =
                    await ReviewService.createReview(
                        payload
                    );
            }

            console.log(
                "REVIEW SAVED:",
                response
            );

            // Notify parent
            onSaved?.(response);

            // Close modal
            onClose();

        } catch (err) {
            console.error(
                "Failed to save compliance review:",
                err
            );

            setError(
                err?.response?.data
                    ?.message ||
                    err?.response?.data
                        ?.error ||
                    (
                        typeof err?.response
                            ?.data ===
                        "string"
                            ? err.response.data
                            : null
                    ) ||
                    err?.message ||
                    "Failed to save compliance review."
            );

        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // UI
    // ============================================================

    return (
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
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
        >
            <motion.div
                initial={{
                    opacity: 0,
                    scale: 0.96,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                }}
                className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            >

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                    <div>
                        <h2 className="text-lg font-bold text-slate-900">
                            Compliance Review
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            {risk?.riskId || "-"}
                            {" "}
                            —
                            {" "}
                            {risk?.title || "Risk"}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X size={18} />
                    </button>

                </div>

                {/* ==================================================
                    FORM
                ================================================== */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 p-6"
                >

                    {/* ==================================================
                        RISK / AUDIT / FINDINGS CONTEXT
                    ================================================== */}

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

                        <ContextCard
                            label="Risk"
                            value={
                                risk?.riskId ||
                                "-"
                            }
                        />

                        <ContextCard
                            label="Audit"
                            value={
                                risk?.auditCode ||
                                "-"
                            }
                        />

                        <ContextCard
                            label="Findings"
                            value={`${risk?.findingCount ?? 0} total`}
                        />

                    </div>

                    {/* ==================================================
                        INFORMATION
                    ================================================== */}

                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Review Scope
                        </p>

                        <p className="mt-1 text-sm text-slate-600">
                            This compliance review is performed
                            for the selected risk and its audit.
                            Findings, evidence and recommendations
                            are supporting audit information and are
                            not directly linked to the review.
                        </p>

                    </div>

                    {/* ==================================================
                        LOCKED MESSAGE
                    ================================================== */}

                    {isLocked && (
                        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">

                            <Lock
                                size={16}
                                className="mt-0.5 shrink-0"
                            />

                            <span>
                                This review has already been{" "}
                                <strong>
                                    approved
                                </strong>{" "}
                                and is locked. Status and comments
                                can no longer be changed.
                            </span>

                        </div>
                    )}

                    {/* ==================================================
                        REVIEW STATUS
                    ================================================== */}

                    <div>

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Review Status
                        </label>

                        <select
                            value={status}
                            disabled={isLocked}
                            onChange={(e) =>
                                setStatus(
                                    e.target.value
                                )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                        >

                            <option value="PENDING">
                                Pending
                            </option>

                            <option value="APPROVED">
                                Approved
                            </option>

                            <option value="REJECTED">
                                Rejected
                            </option>

                        </select>

                    </div>

                    {/* ==================================================
                        COMMENTS
                    ================================================== */}

                    <div>

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Review Comments
                        </label>

                        <textarea
                            value={comments}
                            disabled={isLocked}
                            onChange={(e) =>
                                setComments(
                                    e.target.value
                                )
                            }
                            rows={6}
                            placeholder="Enter your compliance review comments..."
                            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                        />

                    </div>

                    {/* ==================================================
                        ERROR
                    ================================================== */}

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* ==================================================
                        FOOTER BUTTONS
                    ================================================== */}

                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            {isLocked
                                ? "Close"
                                : "Cancel"}
                        </button>

                        {!isLocked && (
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {saving ? (
                                    <>
                                        <RefreshCw
                                            size={15}
                                            className="animate-spin"
                                        />

                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2
                                            size={15}
                                        />

                                        {existingReviewId
                                            ? "Update Review"
                                            : "Submit Review"}
                                    </>
                                )}

                            </button>
                        )}

                    </div>

                </form>

            </motion.div>
        </motion.div>
    );
};

// ============================================================
// CONTEXT CARD
// ============================================================

const ContextCard = ({
    label,
    value,
}) => {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p className="mt-1 truncate text-sm font-bold text-slate-800">
                {display(value)}
            </p>
        </div>
    );
};

// ============================================================
// TRACKING MODAL
// ============================================================

const ComplianceTrackingModal = ({
    risk,
    onClose,
    onReview,
}) => {
    const [
        activeStage,
        setActiveStage,
    ] = useState("risk");

    const isReviewApproved =
        String(
            risk.reviewStatus || ""
        ).toUpperCase() ===
        "APPROVED";

    const renderStage = () => {
        switch (activeStage) {
            case "risk":
                return (
                    <RiskDetails
                        risk={risk}
                    />
                );

            case "audit":
                return (
                    <AuditDetails
                        risk={risk}
                    />
                );

            case "finding":
                return (
                    <FindingDetails
                        risk={risk}
                    />
                );

            case "evidence":
                return (
                    <EvidenceDetails
                        risk={risk}
                    />
                );

            case "recommendation":
                return (
                    <RecommendationDetails
                        risk={risk}
                    />
                );

            case "review":
                return (
                    <ReviewDetails
                        risk={risk}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
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
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
                onClick={
                    onClose
                }
            >
                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.96,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.96,
                        y: 20,
                    }}
                    onClick={(e) =>
                        e.stopPropagation()
                    }
                    className="flex max-h-[94vh] w-full max-w-[1500px] flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl"
                >
                    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900">
                                <Layers3
                                    className="text-white"
                                    size={
                                        20
                                    }
                                />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Compliance Review
                                </h2>

                                <p className="text-xs text-slate-400">
                                    {
                                        risk.riskId
                                    }{" "}
                                    —{" "}
                                    {
                                        risk.title
                                    }
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={
                                onClose
                            }
                            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="overflow-x-auto border-b border-slate-200 bg-white px-6 py-4">
                        <div className="flex min-w-max items-center gap-2">
                            {TRACKING_STAGES.map(
                                (
                                    stage
                                ) => {
                                    const Icon =
                                        stage.icon;

                                    let status =
                                        null;

                                    if (
                                        stage.key ===
                                        "risk"
                                    )
                                        status =
                                            risk.status;

                                    if (
                                        stage.key ===
                                        "audit"
                                    )
                                        status =
                                            risk.auditStatus;

                                    if (
                                        stage.key ===
                                        "finding"
                                    )
                                        status =
                                            risk.findingStatus;

                                    if (
                                        stage.key ===
                                        "evidence"
                                    )
                                        status =
                                            risk.evidenceStatus;

                                    if (
                                        stage.key ===
                                        "recommendation"
                                    )
                                        status =
                                            risk.recommendationStatus;

                                    if (
                                        stage.key ===
                                        "review"
                                    )
                                        status =
                                            risk.reviewStatus;

                                    const state =
                                        getStageState(
                                            status
                                        );

                                    return (
                                        <button
                                            key={
                                                stage.key
                                            }
                                            onClick={() =>
                                                setActiveStage(
                                                    stage.key
                                                )
                                            }
                                            className={`
                                                flex items-center gap-2 rounded-xl px-4 py-2.5
                                                text-xs font-semibold transition
                                                ${
                                                    activeStage ===
                                                    stage.key
                                                        ? "bg-slate-900 text-white"
                                                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                                                }
                                            `}
                                        >
                                            <Icon
                                                size={
                                                    15
                                                }
                                            />

                                            {
                                                stage.label
                                            }

                                            <span
                                                className={`
                                                    h-2 w-2 rounded-full
                                                    ${
                                                        state ===
                                                        "COMPLETED"
                                                            ? "bg-emerald-500"
                                                            : state ===
                                                              "IN_PROGRESS"
                                                            ? "bg-amber-500"
                                                            : state ===
                                                              "CRITICAL"
                                                            ? "bg-red-500"
                                                            : "bg-slate-300"
                                                    }
                                                `}
                                            />
                                        </button>
                                    );
                                }
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <AnimatePresence
                            mode="wait"
                        >
                            <motion.div
                                key={
                                    activeStage
                                }
                                initial={{
                                    opacity: 0,
                                    x: 10,
                                }}
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    x: -10,
                                }}
                            >
                                {renderStage()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
                        <div>
                            {risk.reviewDbId ? (
                                <StatusBadge
                                    status={
                                        risk.reviewStatus
                                    }
                                />
                            ) : (
                                <span className="text-xs text-slate-400">
                                    Review not submitted
                                </span>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={
                                    onClose
                                }
                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                            >
                                Close
                            </button>

                            <button
                                onClick={() =>
                                    onReview(
                                        risk
                                    )
                                }
                                disabled={
                                    !risk.auditDbId ||
                                    !risk.findingCount ||
                                    !risk.evidenceCount ||
                                    isReviewApproved
                                }
                                title={
                                    isReviewApproved
                                        ? "This review is already approved and locked"
                                        : undefined
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {isReviewApproved ? (
                                    <Lock
                                        size={
                                            16
                                        }
                                    />
                                ) : (
                                    <MessageSquareText
                                        size={
                                            16
                                        }
                                    />
                                )}

                                {isReviewApproved
                                    ? "Approved"
                                    : risk.reviewDbId
                                    ? "Update Review"
                                    : "Create Review"}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
}) => {
    return (
        <motion.div
            variants={
                itemVariants
            }
            whileHover={{
                y: -4,
            }}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-50" />

            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <h3 className="mt-2 text-3xl font-bold text-slate-900">
                        {value}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                        {subtitle}
                    </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-700" />
                </div>
            </div>
        </motion.div>
    );
};

// ============================================================
// TABLE HEAD
// ============================================================

const TableHead = ({
    children,
}) => {
    return (
        <th className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            {children}
        </th>
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ComplianceReviews() {
    const [risks, setRisks] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("ALL");

    const [
        selectedRisk,
        setSelectedRisk,
    ] = useState(null);

    const [
        reviewRisk,
        setReviewRisk,
    ] = useState(null);

    // ========================================================
    // LOAD DATA
    // ========================================================

    const loadData = async () => {
        try {
            setLoading(true);

            console.log(
                "COMPLIANCE: Loading all risks..."
            );

            const riskResponse =
                await RiskService.getAllRisks();

            const riskData =
                normalizeArrayResponse(
                    riskResponse
                );

            console.log(
                "COMPLIANCE RISKS:",
                riskData
            );

            const audits =
                await loadAllAudits();

            let enriched =
                attachAudits(
                    riskData,
                    audits
                );

            console.log(
                "RISKS WITH AUDITS:",
                enriched
            );

            enriched =
                await attachFindings(
                    enriched
                );

            console.log(
                "RISKS WITH FINDINGS:",
                enriched
            );

            enriched =
                await attachEvidence(
                    enriched
                );

            console.log(
                "RISKS WITH EVIDENCE:",
                enriched
            );

            enriched =
                await attachRecommendations(
                    enriched
                );

            console.log(
                "RISKS WITH RECOMMENDATIONS:",
                enriched
            );

            const reviews =
                await loadAllReviews();

            console.log(
                "COMPLIANCE REVIEWS:",
                reviews
            );

            enriched =
                attachReviews(
                    enriched,
                    reviews
                );

            enriched.forEach(
                (risk) => {
                    if (
                        risk.reviewCount >
                        1
                    ) {
                        console.warn(
                            `Risk ${risk.riskId} has ${risk.reviewCount} review records — backend should enforce one review per risk.`
                        );
                    }
                }
            );

            console.log(
                "FINAL COMPLIANCE DATA:",
                enriched
            );

            setRisks(
                enriched
            );
        } catch (error) {
            console.error(
                "Failed to load compliance review data:",
                error
            );

            setRisks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ========================================================
    // REFRESH
    // ========================================================

    const handleRefresh =
        async () => {
            try {
                setRefreshing(
                    true
                );

                await loadData();
            } finally {
                setRefreshing(
                    false
                );
            }
        };

    // ========================================================
    // FILTER
    // ========================================================

    const filteredRisks =
        useMemo(() => {
            const value =
                search
                    .trim()
                    .toLowerCase();

            return risks.filter(
                (risk) => {
                    const matchesSearch =
                        !value ||
                        String(
                            risk.riskId ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                value
                            ) ||
                        String(
                            risk.title ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                value
                            ) ||
                        String(
                            risk.department ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                value
                            ) ||
                        String(
                            risk.category ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                value
                            ) ||
                        String(
                            risk.auditCode ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                value
                            ) ||
                        String(
                            risk.findingTitle ||
                                ""
                        )
                            .toLowerCase()
                            .includes(
                                value
                            );

                    const reviewStatus =
                        String(
                            risk.reviewStatus ||
                                "NOT_REVIEWED"
                        ).toUpperCase();

                    const matchesStatus =
                        statusFilter ===
                            "ALL" ||
                        (statusFilter ===
                            "NOT_REVIEWED" &&
                            !risk.reviewDbId) ||
                        reviewStatus ===
                            statusFilter;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );
        }, [
            risks,
            search,
            statusFilter,
        ]);

    // ========================================================
    // STATISTICS
    // ========================================================

    const statistics =
        useMemo(() => {
            const total =
                risks.length;

            const reviewed =
                risks.filter(
                    (risk) =>
                        risk.reviewDbId
                ).length;

            const pending =
                risks.filter(
                    (risk) =>
                        !risk.reviewDbId ||
                        [
                            "PENDING",
                            "UNDER_REVIEW",
                        ].includes(
                            String(
                                risk.reviewStatus
                            ).toUpperCase()
                        )
                ).length;

            const approved =
                risks.filter(
                    (risk) =>
                        String(
                            risk.reviewStatus
                        ).toUpperCase() ===
                        "APPROVED"
                ).length;

            const rejected =
                risks.filter(
                    (risk) =>
                        String(
                            risk.reviewStatus
                        ).toUpperCase() ===
                        "REJECTED"
                ).length;

            const readyForReview =
                risks.filter(
                    (risk) =>
                        risk.auditDbId &&
                        risk.findingCount >
                            0 &&
                        risk.evidenceCount >
                            0
                ).length;

            return {
                total,
                reviewed,
                pending,
                approved,
                rejected,
                readyForReview,
            };
        }, [risks]);

    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

                    <p className="text-sm text-slate-400">
                        Loading compliance review data...
                    </p>
                </div>
            </div>
        );
    }

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <motion.div
                variants={
                    containerVariants
                }
                initial="hidden"
                animate="show"
                className="mx-auto max-w-[1800px] space-y-6"
            >
                {/* HEADER */}

                <motion.div
                    variants={
                        itemVariants
                    }
                    className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center"
                >
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900">
                                <Layers3
                                    size={
                                        22
                                    }
                                    className="text-white"
                                />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    Compliance Reviews
                                </h1>

                                <p className="mt-1 text-sm text-slate-400">
                                    Review complete risk, audit, finding and evidence lifecycle
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={
                            handleRefresh
                        }
                        disabled={
                            refreshing
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
                    >
                        <RefreshCw
                            size={
                                16
                            }
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>
                </motion.div>

                {/* STATS */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <StatCard
                        title="Total Risks"
                        value={
                            statistics.total
                        }
                        subtitle="Risk records"
                        icon={
                            ShieldAlert
                        }
                    />

                    <StatCard
                        title="Ready for Review"
                        value={
                            statistics.readyForReview
                        }
                        subtitle="Audit + finding + evidence"
                        icon={
                            CheckCircle2
                        }
                    />

                    <StatCard
                        title="Pending"
                        value={
                            statistics.pending
                        }
                        subtitle="Awaiting compliance review"
                        icon={
                            Clock3
                        }
                    />

                    <StatCard
                        title="Approved"
                        value={
                            statistics.approved
                        }
                        subtitle="Compliance approved"
                        icon={
                            CheckCircle2
                        }
                    />

                    <StatCard
                        title="Rejected"
                        value={
                            statistics.rejected
                        }
                        subtitle="Requires attention"
                        icon={
                            AlertTriangle
                        }
                    />
                </div>

                {/* SEARCH / FILTER */}

                <motion.div
                    variants={
                        itemVariants
                    }
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                        <div className="relative flex-1">
                            <Search
                                size={
                                    17
                                }
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                value={
                                    search
                                }
                                onChange={(
                                    e
                                ) =>
                                    setSearch(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Search risk, audit, finding, department..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter
                                size={
                                    16
                                }
                                className="text-slate-400"
                            />

                            <select
                                value={
                                    statusFilter
                                }
                                onChange={(
                                    e
                                ) =>
                                    setStatusFilter(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none"
                            >
                                <option value="ALL">
                                    All Reviews
                                </option>

                                <option value="NOT_REVIEWED">
                                    Not Reviewed
                                </option>

                                <option value="PENDING">
                                    Pending
                                </option>

                                <option value="APPROVED">
                                    Approved
                                </option>

                                <option value="REJECTED">
                                    Rejected
                                </option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* TABLE */}

                <motion.div
                    variants={
                        itemVariants
                    }
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1250px] text-left">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <TableHead>
                                        Risk
                                    </TableHead>

                                    <TableHead>
                                        Level
                                    </TableHead>

                                    <TableHead>
                                        Audit
                                    </TableHead>

                                    <TableHead>
                                        Finding
                                    </TableHead>

                                    <TableHead>
                                        Evidence
                                    </TableHead>

                                    <TableHead>
                                        Recommendation
                                    </TableHead>

                                    <TableHead>
                                        Review
                                    </TableHead>

                                    <TableHead>
                                        Lifecycle
                                    </TableHead>

                                    <TableHead>
                                        Action
                                    </TableHead>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                <AnimatePresence initial={false}>
                                    {filteredRisks.map(
                                        (
                                            risk,
                                            index
                                        ) => {
                                            const isReviewApproved =
                                                String(
                                                    risk.reviewStatus ||
                                                        ""
                                                ).toUpperCase() ===
                                                "APPROVED";

                                            const reviewDisabled =
                                                !risk.auditDbId ||
                                                !risk.findingCount ||
                                                !risk.evidenceCount ||
                                                isReviewApproved;

                                            const reviewTitle =
                                                isReviewApproved
                                                    ? "This review is already approved and locked"
                                                    : !risk.auditDbId ||
                                                      !risk.findingCount ||
                                                      !risk.evidenceCount
                                                    ? "Audit, finding and evidence are required"
                                                    : risk.reviewDbId
                                                    ? "Update review status/comments"
                                                    : "Create review";

                                            return (
                                                <motion.tr
                                                    key={
                                                        risk.id ??
                                                        risk.riskId
                                                    }
                                                    initial={{
                                                        opacity: 0,
                                                        y: 8,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    exit={{
                                                        opacity: 0,
                                                    }}
                                                    transition={{
                                                        delay:
                                                            index *
                                                            0.02,
                                                    }}
                                                    className="transition hover:bg-slate-50"
                                                >
                                                    {/* RISK */}

                                                    <td className="px-5 py-4">
                                                        <div>
                                                            <p className="font-bold text-slate-900">
                                                                {
                                                                    risk.riskId
                                                                }
                                                            </p>

                                                            <p className="mt-1 max-w-[230px] truncate text-xs text-slate-400">
                                                                {
                                                                    risk.title
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                {display(
                                                                    risk.department
                                                                )}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    {/* LEVEL */}

                                                    <td className="px-5 py-4">
                                                        <StatusBadge
                                                            status={
                                                                risk.level
                                                            }
                                                        />
                                                    </td>

                                                    {/* AUDIT */}

                                                    <td className="px-5 py-4">
                                                        {risk.auditDbId ? (
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">
                                                                    {
                                                                        risk.auditCode
                                                                    }
                                                                </p>

                                                                <p className="mt-1 max-w-[190px] truncate text-xs text-slate-400">
                                                                    {
                                                                        risk.auditName
                                                                    }
                                                                </p>

                                                                <div className="mt-2">
                                                                    <StatusBadge
                                                                        status={
                                                                            risk.auditStatus
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">
                                                                Not created
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* FINDING */}

                                                    <td className="px-5 py-4">
                                                        {risk.findingCount >
                                                        0 ? (
                                                            <div>
                                                                <p className="max-w-[220px] font-semibold text-slate-800">
                                                                    {
                                                                        risk.findingCount
                                                                    }{" "}
                                                                    finding
                                                                    {risk.findingCount !==
                                                                    1
                                                                        ? "s"
                                                                        : ""}
                                                                </p>

                                                                <p className="mt-1 max-w-[220px] truncate text-xs text-slate-400">
                                                                    {
                                                                        risk.findingTitle
                                                                    }
                                                                </p>

                                                                <div className="mt-2">
                                                                    <StatusBadge
                                                                        status={
                                                                            risk.findingStatus
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">
                                                                No finding
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* EVIDENCE */}

                                                    <td className="px-5 py-4">
                                                        {risk.evidenceCount >
                                                        0 ? (
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">
                                                                    {
                                                                        risk.evidenceCount
                                                                    }{" "}
                                                                    file
                                                                    {risk.evidenceCount !==
                                                                    1
                                                                        ? "s"
                                                                        : ""}
                                                                </p>

                                                                <p className="mt-1 text-xs text-slate-400">
                                                                    across{" "}
                                                                    {
                                                                        risk.findingCount
                                                                    }{" "}
                                                                    finding
                                                                    {risk.findingCount !==
                                                                    1
                                                                        ? "s"
                                                                        : ""}
                                                                </p>

                                                                <div className="mt-2">
                                                                    <StatusBadge
                                                                        status={
                                                                            risk.evidenceStatus
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">
                                                                No evidence
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* RECOMMENDATION */}

                                                    <td className="px-5 py-4">
                                                        {risk.recommendationCount >
                                                        0 ? (
                                                            <div>
                                                                <p className="max-w-[220px] font-semibold text-slate-800">
                                                                    {
                                                                        risk.recommendationCount
                                                                    }{" "}
                                                                    recommendation
                                                                    {risk.recommendationCount !==
                                                                    1
                                                                        ? "s"
                                                                        : ""}
                                                                </p>

                                                                <div className="mt-2">
                                                                    <StatusBadge
                                                                        status={
                                                                            risk.recommendationStatus
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">
                                                                No recommendation
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* REVIEW */}

                                                    <td className="px-5 py-4">
                                                        {risk.reviewDbId ? (
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">
                                                                    {
                                                                        risk.reviewId
                                                                    }
                                                                </p>

                                                                <div className="mt-2">
                                                                    <StatusBadge
                                                                        status={
                                                                            risk.reviewStatus
                                                                        }
                                                                    />
                                                                </div>

                                                                <p className="mt-1 text-xs text-slate-400">
                                                                    {
                                                                        risk.reviewedByName
                                                                    ||
                                                                        "Compliance Officer"}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                                                                Not Reviewed
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* LIFECYCLE */}

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            {TRACKING_STAGES.map(
                                                                (
                                                                    stage
                                                                ) => {
                                                                    let status =
                                                                        null;

                                                                    if (
                                                                        stage.key ===
                                                                        "risk"
                                                                    )
                                                                        status =
                                                                            risk.status;

                                                                    if (
                                                                        stage.key ===
                                                                        "audit"
                                                                    )
                                                                        status =
                                                                            risk.auditStatus;

                                                                    if (
                                                                        stage.key ===
                                                                        "finding"
                                                                    )
                                                                        status =
                                                                            risk.findingStatus;

                                                                    if (
                                                                        stage.key ===
                                                                        "evidence"
                                                                    )
                                                                        status =
                                                                            risk.evidenceStatus;

                                                                    if (
                                                                        stage.key ===
                                                                        "recommendation"
                                                                    )
                                                                        status =
                                                                            risk.recommendationStatus;

                                                                    if (
                                                                        stage.key ===
                                                                        "review"
                                                                    )
                                                                        status =
                                                                            risk.reviewStatus;

                                                                    const state =
                                                                        getStageState(
                                                                            status
                                                                        );

                                                                    return (
                                                                        <span
                                                                            key={
                                                                                stage.key
                                                                            }
                                                                            title={`${stage.label}: ${state}`}
                                                                            className={`
                                                                                h-2.5 w-2.5 rounded-full
                                                                                ${
                                                                                    state ===
                                                                                    "COMPLETED"
                                                                                        ? "bg-emerald-500"
                                                                                        : state ===
                                                                                          "IN_PROGRESS"
                                                                                        ? "bg-amber-500"
                                                                                        : state ===
                                                                                          "CRITICAL"
                                                                                        ? "bg-red-500"
                                                                                        : "bg-slate-300"
                                                                                }
                                                                            `}
                                                                        />
                                                                    );
                                                                }
                                                            )}

                                                            <span className="ml-1 text-[10px] text-slate-400">
                                                                {
                                                                    TRACKING_STAGES.length
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* ACTION */}

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    setSelectedRisk(
                                                                        risk
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                                                            >
                                                                <Eye
                                                                    size={
                                                                        14
                                                                    }
                                                                />

                                                                Track
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    setReviewRisk(
                                                                        risk
                                                                    )
                                                                }
                                                                disabled={
                                                                    reviewDisabled
                                                                }
                                                                title={
                                                                    reviewTitle
                                                                }
                                                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                {isReviewApproved ? (
                                                                    <Lock
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <Layers3
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                )}

                                                                {isReviewApproved
                                                                    ? "Approved"
                                                                    : "Review"}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        }
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {!filteredRisks.length && (
                        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                            <ShieldAlert
                                size={
                                    38
                                }
                                className="text-slate-300"
                            />

                            <p className="mt-3 text-sm font-semibold text-slate-500">
                                No compliance records found
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Try changing the search or filter.
                            </p>
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* TRACKING MODAL */}

            {selectedRisk && (
                <ComplianceTrackingModal
                    risk={
                        selectedRisk
                    }
                    onClose={() =>
                        setSelectedRisk(
                            null
                        )
                    }
                    onReview={(
                        risk
                    ) => {
                        setSelectedRisk(
                            null
                        );

                        setReviewRisk(
                            risk
                        );
                    }}
                />
            )}

            {/* REVIEW MODAL */}

            {reviewRisk && (
                <ReviewForm
                    risk={
                        reviewRisk
                    }
                    onClose={() =>
                        setReviewRisk(
                            null
                        )
                    }
                    onSaved={async () => {
                        setReviewRisk(
                            null
                        );

                        await loadData();
                    }}
                />
            )}
        </div>
    );
}