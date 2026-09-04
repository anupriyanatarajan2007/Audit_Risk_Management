import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
    Activity,
    AlertTriangle,
    ChevronRight,
    Clock3,
    Eye,
    FileCheck2,
    FileText,
    Filter,
    Gauge,
    GitBranch,
    Layers3,
    RefreshCw,
    Search,
    ShieldAlert,
    Target,
    UserCheck,
    Users,
    X,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import EvidenceService from "../../service/EvidenceService";
import { getFindingsByAuditId } from "../../service/FindingService";
import RiskService from "../../service/RiskService";
import KriService from "../../service/KriService";
import MitigationService from "../../service/MitigationService";
import { getAssignmentsByRiskId } from "../../service/RiskAuditorAssignments";
import AuditService from '../../service/AuditService';
import auditeeAssignmentService from "../../service/auditeeAssignmentService";
import { getRecommendationsForFinding } from "../../service/recommendationService";
import ReviewService from "../../service/ReviewService";
// ============================================================
// ANIMATIONS
// ============================================================

// ============================================================
// AUDIT MANAGER RISK STATUS CONTROL
// Only these RiskStatus enum values can be selected from this page.
// ============================================================
const MANAGER_EDITABLE_RISK_STATUSES = [
    "NEW",
    "ANALYZED",
    "APPROVED",
    "IN_PROGRESS",
    "MITIGATED",
    "VERIFIED",
];

const RISK_STATUS_LABELS = {
    NEW: "New",
    ANALYZED: "Analyzed",
    APPROVED: "Approved",
    IN_PROGRESS: "In Progress",
    MITIGATED: "Mitigated",
    VERIFIED: "Verified",
};

// CAE-owned terminal statuses. Once a risk reaches one of these,
// Audit Manager must have no further edit/update controls.
const CAE_TERMINAL_RISK_STATUSES = [
    "COMPLETED",
    "CLOSED",
];

const isCaeLockedRisk = (riskOrStatus) => {
    const status =
        typeof riskOrStatus === "object"
            ? getRiskStatus(riskOrStatus)
            : riskOrStatus;

    return CAE_TERMINAL_RISK_STATUSES.includes(
        normalizeStatus(status)
    );
};

const containerVariants = {
    hidden: {
        opacity: 0,
    },

    show: {
        opacity: 1,

        transition: {
            staggerChildren: 0.07,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 15,
    },

    show: {
        opacity: 1,
        y: 0,

        transition: {
            duration: 0.35,
        },
    },
};



const loadAllReviews = async () => {
    try {
        console.log("Fetching all reviews...");

        const response = await ReviewService.getAllReviews();

        console.log("ALL REVIEWS RESPONSE:", response);

        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.content)) return response.content;
        if (Array.isArray(response?.data?.content)) return response.data.content;

        return [];

    } catch (error) {
        console.error("Failed to load reviews:", error);
        return [];
    }
};

// ============================================================
// ATTACH REVIEWS TO RISKS
// ============================================================

const attachReviewsToRisks = (risks, allReviews) => {

    if (!Array.isArray(risks) || risks.length === 0) {
        return [];
    }

    // Build a lookup keyed by every possible risk identifier a
    // review might carry (nested risk.riskId / risk.id, or a
    // flattened riskId / riskCode on the review itself).
    const reviewsByRiskKey = new Map();

    (allReviews || []).forEach((review) => {

        const keys = [
            review?.risk?.riskId,
            review?.risk?.id,
            review?.riskId,
            review?.riskCode,
        ]
            .filter((k) => k !== undefined && k !== null)
            .map((k) => String(k));

        keys.forEach((key) => {
            if (!reviewsByRiskKey.has(key)) {
                reviewsByRiskKey.set(key, []);
            }
            reviewsByRiskKey.get(key).push(review);
        });
    });

    return risks.map((risk) => {

        const riskKeys = [
            risk?.riskId,
            risk?.id,
            risk?.riskCode,
        ]
            .filter((k) => k !== undefined && k !== null)
            .map((k) => String(k));

        let reviews = [];

        for (const key of riskKeys) {
            if (reviewsByRiskKey.has(key)) {
                reviews = reviewsByRiskKey.get(key);
                break;
            }
        }

        const firstReview =
            reviews.length > 0
                ? reviews[0]
                : null;

        return {
            ...risk,

            reviews,
            reviewList: reviews,

            complianceReviewDbId:
                firstReview?.id ?? null,

            // matches TRACKING_STAGES idField "complianceReviewCode"
            complianceReviewCode:
                firstReview?.reviewId ?? null,

            complianceOfficerId:
                firstReview?.reviewedBy?.id ??
                firstReview?.reviewedById ??
                null,

            complianceOfficerName:
                firstReview?.reviewedBy?.name ??
                firstReview?.reviewedBy?.fullName ??
                firstReview?.reviewedByName ??
                null,

            // matches TRACKING_STAGES statusField "complianceStatus"
            complianceStatus:
                firstReview?.status ?? null,

            complianceRemarks:
                firstReview?.comments ?? null,

            complianceReviewedDate:
                firstReview?.reviewedAt ?? null,

            complianceAuditId:
                firstReview?.audit?.id ??
                firstReview?.auditId ??
                null,

            complianceAuditCode:
                firstReview?.audit?.auditId ??
                firstReview?.auditCode ??
                null,

            complianceFindingId:
                firstReview?.finding?.id ??
                firstReview?.findingId ??
                null,

            complianceFindingTitle:
                firstReview?.finding?.title ??
                firstReview?.findingTitle ??
                null,

            complianceCreatedAt:
                firstReview?.createdAt ?? null,

            complianceUpdatedAt:
                firstReview?.updatedAt ?? null,
        };
    });
};

///Recommendations

const normalizeRecommendationsResponse = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.content)) return response.content;
    if (Array.isArray(response?.data?.content)) return response.data.content;
    if (response?.data && typeof response.data === "object") return [response.data];
    if (typeof response === "object") return [response];
    return [];
};

const loadRecommendationsForFinding = async (findingId) => {
    try {
        if (!findingId) {
            console.warn("Recommendations: Finding ID missing");
            return [];
        }

        console.log("Fetching Recommendations for Finding ID:", findingId);

        const response = await getRecommendationsForFinding(findingId);

        console.log(`RECOMMENDATIONS RESPONSE FOR FINDING ${findingId}:`, response);

        return normalizeRecommendationsResponse(response);

    } catch (error) {
        console.error(`Failed to load recommendations for finding ${findingId}:`, error);
        return [];
    }
};

const attachRecommendationsToRisks = async (risks) => {
    if (!Array.isArray(risks) || risks.length === 0) return [];

    return Promise.all(
        risks.map(async (risk) => {
            const findings = Array.isArray(risk?.findings) ? risk.findings : [];

            // IMPORTANT: one audit can contain many findings.
            // Load recommendations for EVERY finding and keep them attached
            // to that finding instead of storing only the first finding
            // recommendation on the risk object.
            const findingsWithRecommendations = await Promise.all(
                findings.map(async (finding) => {
                    const findingId = finding?.id ?? finding?.findingId;
                    const recommendations = await loadRecommendationsForFinding(findingId);

                    return {
                        ...finding,
                        recommendations,
                        recommendationList: recommendations,
                    };
                })
            );

            const recommendations = findingsWithRecommendations.flatMap(
                (finding) => Array.isArray(finding?.recommendations) ? finding.recommendations : []
            );

            const firstRecommendation = recommendations[0] ?? null;

            return {
                ...risk,
                findings: findingsWithRecommendations,
                findingList: findingsWithRecommendations,
                recommendations,
                recommendationList: recommendations,

                recommendationDbId: firstRecommendation?.id ?? null,
                recommendationCode: firstRecommendation?.recommendationId ?? null,
                recommendationText: firstRecommendation?.recommendationText ?? null,
                recommendationAuditId: firstRecommendation?.auditId ?? null,
                recommendationAuditCode: firstRecommendation?.auditCode ?? null,
                recommendationAuditName: firstRecommendation?.auditName ?? null,
                recommendationFindingId: firstRecommendation?.findingId ?? null,
                recommendationFindingTitle: firstRecommendation?.findingTitle ?? null,
                recommendationInternalAuditorId: firstRecommendation?.internalAuditorId ?? null,
                recommendationInternalAuditorName: firstRecommendation?.internalAuditorName ?? null,
                recommendationAuditeeId: firstRecommendation?.auditeeId ?? null,
                recommendationAuditeeName: firstRecommendation?.auditeeName ?? null,
                recommendationAuditeeEmail: firstRecommendation?.auditeeEmail ?? null,
                recommendationStatus: firstRecommendation?.status ?? null,
                recommendationCreatedAt: firstRecommendation?.createdAt ?? null,
                recommendationUpdatedAt: firstRecommendation?.updatedAt ?? null,
            };
        })
    );
};

////Evidence


const loadEvidenceForAudit = async (auditId) => {
    try {
        if (!auditId) {
            console.warn("Evidence: Audit ID missing");
            return [];
        }

        console.log("Fetching Evidence for Audit ID:", auditId);

        const evidence = await EvidenceService.getEvidenceByAudit(auditId);

        console.log(`EVIDENCE RESPONSE FOR AUDIT ${auditId}:`, evidence);

        return Array.isArray(evidence) ? evidence : [];

    } catch (error) {
        console.error(`Failed to load evidence for audit ${auditId}:`, error);
        return [];
    }
};

// ============================================================
// ATTACH EVIDENCE TO RISKS
// ============================================================

const attachEvidenceToRisks = async (risks) => {
    if (!Array.isArray(risks) || risks.length === 0) {
        return [];
    }

    return Promise.all(
        risks.map(async (risk) => {
            const auditIds = Array.from(
                new Set(
                    (Array.isArray(risk?.audits) ? risk.audits : [])
                        .map((audit) => audit?.id ?? audit?.auditDbId)
                        .filter((id) => id !== null && id !== undefined)
                        .map(String)
                )
            );

            if (auditIds.length === 0 && risk?.auditDbId != null) {
                auditIds.push(String(risk.auditDbId));
            }

            const evidenceArrays = await Promise.all(
                auditIds.map((auditId) => loadEvidenceForAudit(auditId))
            );

            const evidenceList = [];
            const seen = new Set();

            evidenceArrays.flat().forEach((evidence, index) => {
                const key =
                    evidence?.id ??
                    evidence?.evidenceId ??
                    evidence?.fileName ??
                    `${evidence?.uploadedAt ?? ""}-${index}`;

                const normalizedKey = String(key);
                if (!seen.has(normalizedKey)) {
                    seen.add(normalizedKey);
                    evidenceList.push(evidence);
                }
            });

            const firstEvidence = evidenceList[0] ?? null;

            return {
                ...risk,
                evidenceList,
                evidenceItems: evidenceList,
                evidenceCode: firstEvidence?.id ?? firstEvidence?.evidenceId ?? null,
                evidenceFileName: firstEvidence?.fileName ?? null,
                evidenceFileUrl: firstEvidence
                    ? EvidenceService.getEvidenceFileUrl(firstEvidence)
                    : null,
                evidenceDescription: firstEvidence?.description ?? null,
                evidenceStatus: firstEvidence?.status ?? null,
                evidenceUploadedAt: firstEvidence?.uploadedAt ?? null,
                evidenceUploadedByName:
                    firstEvidence?.uploadedBy?.name ??
                    firstEvidence?.uploadedBy?.fullName ??
                    firstEvidence?.uploadedByName ??
                    null,
                evidenceUploadedByEmployeeId:
                    firstEvidence?.uploadedBy?.employeeId ??
                    firstEvidence?.uploadedBy?.id ??
                    firstEvidence?.uploadedByEmployeeId ??
                    null,
                evidenceUploadedByEmail:
                    firstEvidence?.uploadedBy?.email ??
                    firstEvidence?.uploadedByEmail ??
                    null,
                evidenceCount: evidenceList.length,
            };
        })
    );
};



///Findings
const normalizeFindingsResponse = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.content)) return response.content;
    if (Array.isArray(response?.data?.content)) return response.data.content;
    if (response?.data && typeof response.data === "object") return [response.data];
    if (typeof response === "object") return [response];
    return [];
};

const loadFindingsForAudit = async (auditId) => {
    try {
        if (!auditId) {
            console.warn("Findings: Audit ID missing");
            return [];
        }

        console.log("Fetching Findings for Audit ID:", auditId);

        const response = await getFindingsByAuditId(auditId);

        console.log(`FINDINGS RESPONSE FOR AUDIT ${auditId}:`, response);

        return normalizeFindingsResponse(response);

    } catch (error) {
        console.error(`Failed to load findings for audit ${auditId}:`, error);
        return [];
    }
};

const attachFindingsToRisks = async (risks) => {
    if (!Array.isArray(risks) || risks.length === 0) {
        return [];
    }

    return Promise.all(
        risks.map(async (risk) => {
            const auditIds = Array.from(
                new Set(
                    (Array.isArray(risk?.audits) ? risk.audits : [])
                        .map((audit) => audit?.id ?? audit?.auditDbId)
                        .filter((id) => id !== null && id !== undefined)
                        .map(String)
                )
            );

            if (auditIds.length === 0 && risk?.auditDbId != null) {
                auditIds.push(String(risk.auditDbId));
            }

            const findingArrays = await Promise.all(
                auditIds.map((auditId) => loadFindingsForAudit(auditId))
            );

            const findings = [];
            const seen = new Set();

            findingArrays.flat().forEach((finding, index) => {
                const key =
                    finding?.id ??
                    finding?.findingId ??
                    `${finding?.title ?? ""}-${finding?.createdAt ?? ""}-${index}`;

                const normalizedKey = String(key);
                if (!seen.has(normalizedKey)) {
                    seen.add(normalizedKey);
                    findings.push(finding);
                }
            });

            const firstFinding = findings[0] ?? null;

            return {
                ...risk,
                findings,
                findingList: findings,
                findingCount: findings.length,
                findingDbId: firstFinding?.id ?? firstFinding?.findingId ?? null,
                findingCode: firstFinding?.id ?? firstFinding?.findingId ?? null,
                findingTitle: firstFinding?.title ?? null,
                findingDescription:
                    firstFinding?.observation ?? firstFinding?.description ?? null,
                findingSeverity:
                    firstFinding?.riskLevel ?? firstFinding?.severity ?? null,
                findingRecommendation: firstFinding?.recommendation ?? null,
                findingStatus: firstFinding?.status ?? null,
                findingAuditorName:
                    firstFinding?.auditorName ??
                    firstFinding?.auditor?.name ??
                    firstFinding?.auditor?.fullName ??
                    null,
                findingAuditId: firstFinding?.auditId ?? null,
                findingAuditName: firstFinding?.auditName ?? null,
                findingCreatedAt: firstFinding?.createdAt ?? null,
                findingUpdatedAt: firstFinding?.updatedAt ?? null,
            };
        })
    );
};



////Auditee

const normalizeAuditeeAssignmentResponse = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.content)) return response.content;
    if (Array.isArray(response?.data?.content)) return response.data.content;
    if (response?.data && typeof response.data === "object") return [response.data];
    if (typeof response === "object") return [response];
    return [];
};

const loadAuditeeAssignmentForAudit = async (auditId) => {
    try {
        if (!auditId) {
            console.warn("Auditee Assignment: Audit ID missing");
            return [];
        }

        console.log("Fetching Auditee Assignment for Audit ID:", auditId);

        const response = await auditeeAssignmentService.getAssignmentsByAudit(auditId);

        console.log(`AUDITEE ASSIGNMENT RESPONSE FOR AUDIT ${auditId}:`, response);

        // Endpoint is already scoped by auditId — trust it.
        return normalizeAuditeeAssignmentResponse(response);

    } catch (error) {
        console.error(`Failed to load auditee assignment for audit ${auditId}:`, error);
        return [];
    }
};

const attachAuditeeAssignmentsToRisks = async (risks) => {

    if (!Array.isArray(risks) || risks.length === 0) {
        return [];
    }

    return Promise.all(
        risks.map(async (risk) => {

            const auditId = risk?.auditDbId;

            const assignments = await loadAuditeeAssignmentForAudit(auditId);

            const firstAssignment =
                assignments.length > 0
                    ? assignments[0]
                    : null;

            console.log(
                "FIRST AUDITEE ASSIGNMENT FOR AUDIT",
                auditId,
                ":",
                firstAssignment
            );

            return {
                ...risk,

                auditeeAssignments: assignments,
                auditeeAssignmentList: assignments,

                auditeeAssignmentId:
                    firstAssignment?.id ?? null,

                auditeeId:
                    firstAssignment?.auditeeId ?? null,

                // matches TRACKING_STAGES idField "auditeeEmployeeId"
                auditeeEmployeeId:
                    firstAssignment?.auditeeEmployeeId ?? null,

                auditeeName:
                    firstAssignment?.auditeeName ?? null,

                auditeeEmail:
                    firstAssignment?.auditeeEmail ?? null,

                auditeeAssignedById:
                    firstAssignment?.assignedById ?? null,

                auditeeAssignedByName:
                    firstAssignment?.assignedByName ?? null,

                auditeeAssignedDate:
                    firstAssignment?.assignedDate ?? null,

                auditeeStartDate:
                    firstAssignment?.startDate ?? null,

                auditeeDueDate:
                    firstAssignment?.dueDate ?? null,

                // matches TRACKING_STAGES statusField "auditeeAssignmentStatus"
                auditeeAssignmentStatus:
                    firstAssignment?.status ?? null,

                auditeeAssignmentAuditId:
                    firstAssignment?.auditId ?? null,

                auditeeAssignmentAuditName:
                    firstAssignment?.auditName ?? null,

                auditeeCreatedAt:
                    firstAssignment?.createdAt ?? null,

                auditeeUpdatedAt:
                    firstAssignment?.updatedAt ?? null,
            };
        })
    );
};

// ============================================================
// AUDIT HELPERS
// ============================================================

const loadAllAudits = async () => {
    try {
        console.log("Fetching all audits...");

        const audits = await AuditService.getAllAudits();

        console.log("ALL AUDITS RESPONSE:", audits);

        return Array.isArray(audits) ? audits : [];

    } catch (error) {
        console.error("Failed to load audits:", error);
        return [];
    }
};

// ============================================================
// ATTACH AUDITS TO RISKS
// ============================================================
// AuditResponseDTO carries riskId directly (the risk's own code,
// e.g. "RISK-1786195742407"), so group once by riskId and look each
// risk up in O(1) instead of re-scanning the full list per risk.
// ============================================================

const attachAuditsToRisks = (risks, allAudits) => {

    if (!Array.isArray(risks) || risks.length === 0) {
        return [];
    }

    const auditsByRiskId = new Map();

    (allAudits || []).forEach((audit) => {

        const key = String(audit?.riskId ?? "");

        if (!key) {
            return;
        }

        if (!auditsByRiskId.has(key)) {
            auditsByRiskId.set(key, []);
        }

        auditsByRiskId.get(key).push(audit);
    });

    return risks.map((risk) => {

        const riskKey = String(
            risk?.riskId ??
            risk?.riskCode ??
            ""
        );

        const audits = auditsByRiskId.get(riskKey) ?? [];

        const firstAudit =
            audits.length > 0
                ? audits[0]
                : null;

        return {
            ...risk,

            audits,
            auditList: audits,

            auditDbId:
                firstAudit?.id ?? null,

            // matches TRACKING_STAGES idField "auditCode"
            auditCode:
                firstAudit?.auditId ?? null,

            auditTitle:
                firstAudit?.auditName ?? null,

            auditDescription:
                firstAudit?.description ?? null,

            auditDepartment:
                firstAudit?.department ?? null,

            auditBusinessUnit:
                firstAudit?.businessUnit ?? null,

            auditProcessName:
                firstAudit?.processName ?? null,

            auditStartDate:
                firstAudit?.startDate ?? null,

            auditEndDate:
                firstAudit?.endDate ?? null,

            // matches TRACKING_STAGES statusField "auditStatus"
            auditStatus:
                firstAudit?.status ?? null,

            auditInternalAuditorId:
                firstAudit?.internalAuditorId ?? null,

            auditInternalAuditorName:
                firstAudit?.internalAuditorName ?? null,

            auditAuditeeId:
                firstAudit?.auditeeId ?? null,

            auditAuditeeName:
                firstAudit?.auditeeName ?? null,

            auditCreatedAt:
                firstAudit?.createdAt ?? null,

            auditUpdatedAt:
                firstAudit?.updatedAt ?? null,
        };
    });
};

// ============================================================
// INTERNAL AUDITOR ASSIGNMENT HELPERS
// ============================================================

const normalizeAssignmentResponse = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.content)) return response.content;
    if (Array.isArray(response?.assignments)) return response.assignments;
    if (Array.isArray(response?.data?.content)) return response.data.content;
    if (Array.isArray(response?.data?.assignments)) return response.data.assignments;
    if (response?.data && typeof response.data === "object") return [response.data];
    if (typeof response === "object") return [response];
    return [];
};

const loadAuditorAssignmentForRisk = async (riskId) => {
    try {
        if (!riskId) {
            console.warn("Auditor Assignment: Risk ID missing");
            return [];
        }

        console.log("Fetching Auditor Assignment for Risk ID:", riskId);

        const response = await getAssignmentsByRiskId(riskId);

        console.log(`AUDITOR ASSIGNMENT RESPONSE FOR RISK ${riskId}:`, response);

        // Endpoint is already scoped by riskId — trust it rather than
        // re-filtering on a field whose shape/type isn't confirmed.
        return normalizeAssignmentResponse(response);

    } catch (error) {
        console.error(`Failed to load auditor assignment for risk ${riskId}:`, error);
        return [];
    }
};

const attachAuditorAssignmentsToRisks = async (risks) => {

    if (!Array.isArray(risks) || risks.length === 0) {
        return [];
    }

    return Promise.all(
        risks.map(async (risk) => {

            const riskId =  risk?.riskId;

            const assignments = await loadAuditorAssignmentForRisk(riskId);

            const firstAssignment =
                assignments.length > 0 ? assignments[0] : null;

            console.log(
                "FIRST AUDITOR ASSIGNMENT FOR RISK",
                riskId,
                ":",
                firstAssignment
            );

            return {
                ...risk,

                auditorAssignments: assignments,
                auditorAssignmentList: assignments,

                auditorAssignmentId:
                    firstAssignment?.id ?? null,

                // Backend returns a flat `employeeId` for the auditor —
                // no nested object, no name field.
                auditorEmployeeId:
                    firstAssignment?.employeeId ?? null,

                auditorEmail:
                    firstAssignment?.auditorEmail ?? null,

                assignedByEmployeeId:
                    firstAssignment?.assignedByEmployeeId ?? null,

                auditorAssignmentStatus:
                    firstAssignment?.status ?? null,

                auditorAssignmentPriority:
                    firstAssignment?.priority ?? null,

                auditorAssignedDate:
                    firstAssignment?.assignedAt ?? null,

                auditorStartDate:
                    firstAssignment?.startDate ?? null,

                auditorDueDate:
                    firstAssignment?.dueDate ?? null,

                auditorComments:
                    firstAssignment?.comments ?? null,

                // Cross-check fields the assignment record also carries
                auditorAssignmentRiskId:
                    firstAssignment?.riskId ?? null,

                auditorAssignmentRiskTitle:
                    firstAssignment?.riskTitle ?? null,
            };
        })
    );
};


// ============================================================
// KRI HELPERS
// ============================================================

const normalizeKriResponse = (response) => {
    if (!response) {
        return [];
    }

    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.content)) {
        return response.content;
    }

    if (Array.isArray(response?.kris)) {
        return response.kris;
    }

    if (Array.isArray(response?.data?.content)) {
        return response.data.content;
    }

    if (Array.isArray(response?.data?.kris)) {
        return response.data.kris;
    }

    // Single KRI object
    if (response?.data && typeof response.data === "object") {
        return [response.data];
    }

    if (typeof response === "object") {
        return [response];
    }

    return [];
};

// ============================================================
// LOAD KRI FOR RISK
// ============================================================

const loadKriForRisk = async (riskId) => {
    try {
        if (!riskId) {
            console.warn("KRI: Risk ID missing");
            return [];
        }

        console.log("Fetching KRI for Risk ID:", riskId);

        const response = await KriService.getKrisByRisk(riskId);

        console.log(
            `KRI RESPONSE FOR RISK ${riskId}:`,
            response
        );

        let data = [];

        if (Array.isArray(response)) {
            data = response;
        } 
        else if (Array.isArray(response?.data)) {
            data = response.data;
        } 
        else if (Array.isArray(response?.content)) {
            data = response.content;
        } 
        else if (Array.isArray(response?.kris)) {
            data = response.kris;
        } 
        else if (Array.isArray(response?.data?.content)) {
            data = response.data.content;
        } 
        else if (Array.isArray(response?.data?.kris)) {
            data = response.data.kris;
        } 
        else if (
            response?.data &&
            typeof response.data === "object"
        ) {
            data = [response.data];
        } 
        else if (
            response &&
            typeof response === "object"
        ) {
            data = [response];
        }

        // =====================================================
        // IMPORTANT:
        // Filter using KRI Response DTO riskId
        // =====================================================

        const matchingKris = data.filter(
            (kri) =>
                String(kri?.riskId) === String(riskId)
        );

        console.log(
            `MATCHING KRI FOR RISK ${riskId}:`,
            matchingKris
        );

        return matchingKris;

    } catch (error) {
        console.error(
            `Failed to load KRI for risk ${riskId}:`,
            error
        );

        return [];
    }
};
// ============================================================
// LOAD ALL KRIS AND ATTACH TO RISKS
// ============================================================

const attachKrisToRisks = async (risks) => {
    if (!Array.isArray(risks) || risks.length === 0) {
        return [];
    }

    const updatedRisks = await Promise.all(
        risks.map(async (risk) => {
            const riskId =
                risk?.id ??
                risk?.riskId;

            const kris = await loadKriForRisk(riskId);

            const firstKri = kris.length > 0
                ? kris[0]
                : null;

            return {
                ...risk,

                // =================================================
                // KRI COLLECTION
                // =================================================

                kris: kris,

                kriList: kris,

                // =================================================
                // KRI ID
                // =================================================

                kriId:
                    firstKri?.kriId ??
                    null,

                // Keep old field also for compatibility
                kriCode:
                    firstKri?.kriId ??
                    null,

                // =================================================
                // KRI NAME
                // =================================================

                kriName:
                    firstKri?.kriName ??
                    null,

                // =================================================
                // KRI DESCRIPTION
                // =================================================

                kriDescription:
                    firstKri?.description ??
                    null,

                // =================================================
                // RISK INFORMATION FROM KRI
                // =================================================

                kriRiskId:
                    firstKri?.riskId ??
                    riskId,

                kriRiskCode:
                    firstKri?.riskCode ??
                    risk?.riskCode ??
                    null,

                kriRiskTitle:
                    firstKri?.riskTitle ??
                    risk?.title ??
                    null,

                kriRiskCategory:
                    firstKri?.riskCategory ??
                    null,

                // =================================================
                // DEPARTMENT / BUSINESS UNIT
                // =================================================

                kriDepartment:
                    firstKri?.department ??
                    risk?.department ??
                    null,

                kriBusinessUnit:
                    firstKri?.businessUnit ??
                    risk?.businessUnit ??
                    null,

                // =================================================
                // OWNER
                // =================================================

                kriOwnerId:
                    firstKri?.ownerId ??
                    null,

                kriOwnerEmployeeId:
                    firstKri?.ownerEmployeeId ??
                    null,

                kriOwnerName:
                    firstKri?.ownerName ??
                    null,

                // =================================================
                // VALUE
                // =================================================

                kriCurrentValue:
                    firstKri?.currentValue ??
                    null,

                // =================================================
                // THRESHOLDS
                // =================================================

                greenThreshold:
                    firstKri?.greenThreshold ??
                    null,

                amberThreshold:
                    firstKri?.amberThreshold ??
                    null,

                redThreshold:
                    firstKri?.redThreshold ??
                    null,

                // =================================================
                // UNIT
                // =================================================

                kriUnit:
                    firstKri?.unit ??
                    null,

                // =================================================
                // STATUS
                // =================================================

                kriStatus:
                    firstKri?.status ??
                    null,

                // =================================================
                // FREQUENCY
                // =================================================

                kriFrequency:
                    firstKri?.frequency ??
                    null,

                // =================================================
                // DATA SOURCE
                // =================================================

                kriDataSource:
                    firstKri?.dataSource ??
                    null,

                // =================================================
                // LAST UPDATED
                // =================================================

                kriLastUpdated:
                    firstKri?.lastUpdated ??
                    null,

                // =================================================
                // REMARKS
                // =================================================

                kriRemarks:
                    firstKri?.remarks ??
                    null,

                // =================================================
                // CREATED / UPDATED
                // =================================================

                kriCreatedAt:
                    firstKri?.createdAt ??
                    null,

                kriUpdatedAt:
                    firstKri?.updatedAt ??
                    null,
            };
        })
    );

    return updatedRisks;
};


// ============================================================
// MITIGATION HELPERS
// ============================================================

const normalizeMitigationResponse = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.content)) return response.content;
    if (Array.isArray(response?.mitigations)) return response.mitigations;
    if (Array.isArray(response?.data?.content)) return response.data.content;
    if (Array.isArray(response?.data?.mitigations)) return response.data.mitigations;
    if (response?.data && typeof response.data === "object") return [response.data];
    if (typeof response === "object") return [response];
    return [];
};

// ============================================================
// LOAD MITIGATION FOR RISK
// ============================================================

const loadMitigationForRisk = async (riskId) => {
    try {
        if (!riskId) {
            console.warn("Mitigation: Risk ID missing");
            return [];
        }

        console.log("Fetching Mitigation for Risk ID:", riskId);

        const response = await MitigationService.getMitigationsByRisk(riskId);

        console.log(`MITIGATION RESPONSE FOR RISK ${riskId}:`, response);

        const data = normalizeMitigationResponse(response);

        // IMPORTANT:
        // Unlike the KRI DTO (whose `riskId` is the numeric risk PK),
        // the Mitigation DTO's `riskId` field actually holds the risk's
        // CODE (e.g. "RISK-1786195742407"), not the numeric id used to
        // call this endpoint. Comparing them was silently discarding
        // every real mitigation. The endpoint is already scoped by
        // riskId server-side, so just trust what it returns.
        console.log(`MATCHING MITIGATION FOR RISK ${riskId}:`, data);

        return data;

    } catch (error) {
        console.error(`Failed to load mitigation for risk ${riskId}:`, error);
        return [];
    }
};

// ============================================================
// LOAD ALL MITIGATIONS AND ATTACH TO RISKS
// ============================================================

const attachMitigationsToRisks = async (risks) => {

    if (!Array.isArray(risks) || risks.length === 0) {
        return [];
    }

    return Promise.all(
        risks.map(async (risk) => {

            const riskId =
                risk?.id ??
                risk?.riskId;

            // Reuse the single source of truth for fetching +
            // normalizing + filtering mitigations for a risk.
            const mitigations = await loadMitigationForRisk(riskId);

            const firstMitigation =
                mitigations.length > 0
                    ? mitigations[0]
                    : null;

            console.log(
                "FIRST MITIGATION FOR RISK",
                riskId,
                ":",
                firstMitigation
            );

            return {
                ...risk,

                mitigations,
                mitigationList: mitigations,

                // ID
                mitigationCode:
                    firstMitigation?.mitigationId ??
                    null,

                // TITLE
                mitigationPlan:
                    firstMitigation?.mitigationTitle ??
                    null,

                // DESCRIPTION
                mitigationDescription:
                    firstMitigation?.mitigationDescription ??
                    null,

                // TYPE
                mitigationType:
                    firstMitigation?.mitigationType ??
                    null,

                // OWNER
                mitigationOwner:
                    firstMitigation?.ownerName ??
                    null,

                // OWNER ID
                mitigationOwnerEmployeeId:
                    firstMitigation?.ownerId ??
                    null,

                // STATUS
                mitigationStatus:
                    firstMitigation?.status ??
                    null,

                // EFFECTIVENESS
                mitigationEffectiveness:
                    firstMitigation?.effectiveness ??
                    null,

                // COST
                mitigationCost:
                    firstMitigation?.cost ??
                    null,

                // DATES
                mitigationTargetDate:
                    firstMitigation?.targetDate ??
                    null,

                mitigationCompletedDate:
                    firstMitigation?.completedDate ??
                    null,

                // REMARKS (backend has no separate "update" field,
                // so remarks doubles as the latest update)
                mitigationRemarks:
                    firstMitigation?.remarks ??
                    null,

                mitigationUpdate:
                    firstMitigation?.remarks ??
                    null,

                // RISK CROSS-REFERENCE (from the mitigation record itself)
                mitigationRiskId:
                    firstMitigation?.riskId ??
                    riskId,

                mitigationRiskTitle:
                    firstMitigation?.riskTitle ??
                    risk?.title ??
                    null,

                // TIMESTAMPS
                mitigationCreatedAt:
                    firstMitigation?.createdAt ??
                    null,

                mitigationUpdatedAt:
                    firstMitigation?.updatedAt ??
                    null,
            };
        })
    );
};


// ============================================================
// VALUE HELPERS
// ============================================================

const getDisplayValue = (value) => {
    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    if (typeof value === "object") {
        return (
            value.name ??
            value.value ??
            value.label ??
            String(value)
        );
    }

    return String(value);
};

// ============================================================
// RISK CATEGORY
// ============================================================

const getRiskCategory = (risk) => {
    return getDisplayValue(
        risk?.riskCategory ??
        risk?.category ??
        risk?.riskCategoryName ??
        risk?.categoryName ??
        risk?.riskType
    );
};

// ============================================================
// RISK LEVEL
// ============================================================

const getRiskLevel = (risk) => {
    return getDisplayValue(
        risk?.riskLevel ??
        risk?.level ??
        risk?.riskLevelName ??
        risk?.levelName ??
        risk?.severity
    );
};

// ============================================================
// RISK SCORE
// ============================================================

const getRiskScore = (risk) => {
    return (
        risk?.riskScore ??
        risk?.score ??
        risk?.riskRating ??
        "-"
    );
};

// ============================================================
// RISK STATUS
// ============================================================

const getRiskStatus = (risk) => {
    return (
        risk?.riskStatus ??
        risk?.status ??
        "PENDING"
    );
};

// ============================================================
// KRI STATUS
// ============================================================

const getKriStatus = (risk) => {
    return (
        risk?.kriStatus ??
        risk?.statusKri ??
        null
    );
};

// ============================================================
// NORMALIZE STATUS
// ============================================================

const normalizeStatus = (status) => {
    if (!status) {
        return "UNKNOWN";
    }

    return String(status)
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_");
};

// ============================================================
// STAGE STATUS
// ============================================================

const getStageStatus = (status) => {
    const normalized = normalizeStatus(status);

    if (
        [
            "COMPLETED",
            "CLOSED",
            "APPROVED",
            "HEALTHY",
            "RESOLVED",
            "GREEN",
        ].includes(normalized)
    ) {
        return "COMPLETED";
    }

    if (
        [
            "IN_PROGRESS",
            "ONGOING",
            "ASSIGNED",
            "SUBMITTED",
            "UNDER_REVIEW",
            "PENDING_REVIEW",
            "AMBER",
        ].includes(normalized)
    ) {
        return "IN_PROGRESS";
    }

    if (
        [
            "OPEN",
            "PENDING",
            "NOT_STARTED",
            "UNASSIGNED",
            "IDENTIFIED",
        ].includes(normalized)
    ) {
        return "PENDING";
    }

    if (
        [
            "REJECTED",
            "FAILED",
            "CRITICAL",
            "BREACHED",
        ].includes(normalized)
    ) {
        return "CRITICAL";
    }

    return "PENDING";
};

// ============================================================
// KRI STAGE STATUS
// ============================================================

const getKriStageStatus = (risk) => {
    const kriStatus = getKriStatus(risk);

    // No KRI exists
    if (!kriStatus) {
        return "PENDING";
    }

    return getStageStatus(kriStatus);
};

// ============================================================
// TRACKING STAGES
// ============================================================

const TRACKING_STAGES = [
    {
        key: "risk",
        label: "Risk",
        icon: ShieldAlert,
        idField: "riskId",
        statusField: "riskStatus",
    },

    {
        key: "kri",
        label: "KRI",
        icon: Gauge,
        idField: "kriId",
        statusField: "kriStatus",
    },

    {
        key: "mitigation",
        label: "Mitigation",
        icon: Target,
        idField: "mitigationCode",
        statusField: "mitigationStatus",
    },

    {
        key: "auditor",
        label: "Internal Auditor",
        icon: UserCheck,
        idField: "auditorEmployeeId",
        statusField: "auditorAssignmentStatus",
    },

    {
        key: "audit",
        label: "Audit",
        icon: FileText,
        idField: "auditCode",
        statusField: "auditStatus",
    },

    {
        key: "auditee",
        label: "Auditee",
        icon: Users,
        idField: "auditeeEmployeeId",
        statusField: "auditeeAssignmentStatus",
    },

    {
        key: "finding",
        label: "Finding",
        icon: AlertTriangle,
        idField: "findingCode",
        statusField: "findingStatus",
    },

    {
        key: "evidence",
        label: "Evidence",
        icon: FileCheck2,
        idField: "evidenceCode",
        statusField: "evidenceStatus",
    },

    {
        key: "recommendation",
        label: "Recommendation",
        icon: GitBranch,
        idField: "recommendationCode",
        statusField: "recommendationStatus",
    },

    {
        key: "compliance",
        label: "Compliance Review",
        icon: Layers3,
        idField: "complianceReviewCode",
        statusField: "complianceStatus",
    },

];

// ============================================================
// LOGGED-IN USER
// ============================================================

const getLoggedInUser = () => {
    const possibleKeys = [
        "user",
        "currentUser",
        "profile",
        "loggedInUser",
    ];

    for (const key of possibleKeys) {
        const value = localStorage.getItem(key);

        if (!value) {
            continue;
        }

        try {
            const parsed = JSON.parse(value);

            if (
                parsed &&
                typeof parsed === "object"
            ) {
                return parsed;
            }
        } catch (error) {
            console.warn(
                `Unable to parse localStorage key "${key}"`,
                error
            );
        }
    }

    return null;
};

// ============================================================
// USER DEPARTMENT
// ============================================================

const getDepartmentName = (value) => {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    if (typeof value === "string" || typeof value === "number") {
        return String(value).trim() || null;
    }

    if (typeof value === "object") {
        return (
            value.name ??
            value.departmentName ??
            value.label ??
            value.value ??
            value.department?.name ??
            value.dept?.name ??
            null
        );
    }

    return null;
};

const getUserDepartment = () => {
    const user = getLoggedInUser();

    if (user) {
        const department =
            user.department ||
            user.departmentName ||
            user.profile?.department ||
            user.profile?.departmentName ||
            user.user?.department ||
            user.user?.profile?.department ||
            user.data?.department ||
            user.data?.profile?.department;

        const departmentName = getDepartmentName(department);
        if (departmentName) return departmentName;
    }

    const directDepartment = localStorage.getItem("department");
    return getDepartmentName(directDepartment);
};

// ============================================================
// STATUS BADGE
// ============================================================

const StageBadge = ({ status }) => {
    const stageStatus = getStageStatus(status);

    const config = {
        COMPLETED: {
            label: "Completed",
            wrapper:
                "bg-emerald-50 text-emerald-700 border-emerald-200",
            dot: "bg-emerald-500",
        },

        IN_PROGRESS: {
            label: "In Progress",
            wrapper:
                "bg-amber-50 text-amber-700 border-amber-200",
            dot: "bg-amber-500",
        },

        PENDING: {
            label: "Pending",
            wrapper:
                "bg-slate-50 text-slate-600 border-slate-200",
            dot: "bg-slate-400",
        },

        CRITICAL: {
            label: "Critical",
            wrapper:
                "bg-red-50 text-red-700 border-red-200",
            dot: "bg-red-500",
        },
    }[stageStatus];

    return (
        <span
            className={`
                inline-flex
                items-center
                gap-1.5
                px-2.5
                py-1
                rounded-full
                border
                text-[11px]
                font-semibold
                ${config.wrapper}
            `}
        >
            <span
                className={`
                    w-1.5
                    h-1.5
                    rounded-full
                    ${config.dot}
                `}
            />

            {config.label}
        </span>
    );
};

// ============================================================
// TRACKING STAGE
// ============================================================

const TrackingStage = ({
    stage,
    risk,
    index,
    onClick,
}) => {
    const Icon = stage.icon;

    let id;
    let status;

    // ========================================================
    // KRI SPECIAL HANDLING
    // ========================================================

    if (stage.key === "kri") {
        id = risk?.kriId || "-";
        status = risk?.kriStatus || "PENDING";
    } else if (stage.key === "finding") {
        const count = Array.isArray(risk?.findings)
            ? risk.findings.length
            : Number(risk?.findingCount || 0);
        id = count > 0
            ? `${count} Finding${count === 1 ? "" : "s"}`
            : "No Findings";
        status = risk?.findingStatus || "PENDING";
    } else {
        id =
            risk?.[stage.idField] ||
            "-";

        status =
            risk?.[stage.statusField] ||
            "PENDING";
    }

    const stageStatus =
        stage.key === "kri"
            ? getKriStageStatus(risk)
            : getStageStatus(status);

    const isCompleted =
        stageStatus === "COMPLETED";

    const isProgress =
        stageStatus === "IN_PROGRESS";

    const isCritical =
        stageStatus === "CRITICAL";

    return (
        <div className="flex items-center min-w-[180px]">

            {/* NODE */}

            <motion.button
                whileHover={{
                    scale: 1.04,
                    y: -3,
                }}
                whileTap={{
                    scale: 0.98,
                }}
                onClick={() =>
                    onClick(stage.key)
                }
                className={`
                    relative
                    w-[180px]
                    min-h-[145px]
                    rounded-2xl
                    border
                    bg-white
                    shadow-sm
                    hover:shadow-lg
                    transition-all
                    text-left
                    p-4

                    ${
                        isCompleted
                            ? "border-emerald-200"
                            : isProgress
                            ? "border-amber-200"
                            : isCritical
                            ? "border-red-200"
                            : "border-slate-200"
                    }
                `}
            >

                {/* TOP */}

                <div className="flex items-center justify-between">

                    <div
                        className={`
                            w-9
                            h-9
                            rounded-xl
                            flex
                            items-center
                            justify-center

                            ${
                                isCompleted
                                    ? "bg-emerald-50 text-emerald-600"
                                    : isProgress
                                    ? "bg-amber-50 text-amber-600"
                                    : isCritical
                                    ? "bg-red-50 text-red-600"
                                    : "bg-slate-100 text-slate-500"
                            }
                        `}
                    >
                        <Icon className="w-4 h-4" />
                    </div>

                    <span className="text-[10px] font-bold text-slate-300">
                        {String(index + 1).padStart(2, "0")}
                    </span>
                </div>

                {/* LABEL */}

                <p className="mt-3 text-xs font-semibold text-slate-500">
                    {stage.label}
                </p>

                {/* ID */}

                <p className="mt-1 text-sm font-bold text-slate-900 truncate">
                    {id}
                </p>

                {/* STATUS */}

                <div className="mt-3">
                    <StageBadge status={status} />
                </div>

                {/* CLICK */}

                <div className="absolute right-3 bottom-3 text-slate-300">
                    <ChevronRight className="w-4 h-4" />
                </div>

            </motion.button>

            {/* CONNECTOR */}

            {index < TRACKING_STAGES.length - 1 && (
                <div className="w-10 flex items-center justify-center">

                    <div className="relative w-full h-[2px] bg-slate-200">

                        <div
                            className={`
                                absolute
                                left-0
                                top-0
                                h-full

                                ${
                                    isCompleted
                                        ? "w-full bg-emerald-400"
                                        : "w-1/2 bg-slate-300"
                                }
                            `}
                        />

                        <ChevronRight
                            className="
                                absolute
                                -right-2
                                -top-[7px]
                                w-4
                                h-4
                                text-slate-300
                                bg-white
                            "
                        />

                    </div>

                </div>
            )}

        </div>
    );
};

// ============================================================
// FINDING STAGE DETAILS - SHOW ALL FINDINGS FOR THE AUDIT
// ============================================================

const FindingStageDetails = ({ risk, selectedFindingId, onFindingChange }) => {
    const findings = Array.isArray(risk?.findings) ? risk.findings : [];

    if (findings.length === 0) {
        return (
            <StageDetails
                title="Finding Details"
                icon={AlertTriangle}
                items={[
                    ["Audit", risk?.auditCode],
                    ["Finding Count", 0],
                    ["Status", "No findings recorded"],
                ]}
            />
        );
    }

    const selectedFinding =
        findings.find(
            (finding) =>
                String(finding?.id ?? finding?.findingId) === String(selectedFindingId)
        ) ?? findings[0];

    return (
        <div>
            <FindingSelector
                findings={findings}
                selectedFinding={selectedFinding}
                onChange={onFindingChange}
            />

            <div className="mt-5 rounded-2xl border border-red-100 bg-gradient-to-br from-red-50/70 via-white to-white p-5">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-white border border-red-100 text-[11px] font-bold text-red-700">
                                Selected Finding
                            </span>
                            <StageBadge status={selectedFinding?.status} />
                        </div>
                        <h4 className="mt-3 text-lg font-bold text-slate-900 break-words">
                            {getDisplayValue(selectedFinding?.title) || "Untitled Finding"}
                        </h4>
                    </div>
                    <span className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-600">
                        {getDisplayValue(selectedFinding?.riskLevel ?? selectedFinding?.severity)}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-5">
                    <KriInfoCard label="Finding ID" value={selectedFinding?.id ?? selectedFinding?.findingId} />
                    <KriInfoCard label="Status" value={selectedFinding?.status} />
                    <KriInfoCard label="Severity" value={selectedFinding?.riskLevel ?? selectedFinding?.severity} />
                    <KriInfoCard label="Auditor" value={selectedFinding?.auditorName ?? selectedFinding?.auditor?.name ?? selectedFinding?.auditor?.fullName} />
                    <KriInfoCard label="Audit" value={selectedFinding?.auditName ?? risk?.auditCode} />
                    <KriInfoCard label="Created At" value={selectedFinding?.createdAt} />
                    <KriInfoCard label="Updated At" value={selectedFinding?.updatedAt} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mt-3">
                    <KriInfoCard
                        label="Observation"
                        value={selectedFinding?.observation ?? selectedFinding?.description}
                    />
                    <KriInfoCard
                        label="Finding Recommendation"
                        value={selectedFinding?.recommendation}
                    />
                </div>
            </div>
        </div>
    );
};

const FindingSelector = ({ findings, selectedFinding, onChange }) => {
    const selectedId = selectedFinding?.id ?? selectedFinding?.findingId ?? "";

    return (
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/80 via-white to-white p-4 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                            Finding Context
                        </p>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Select a finding to view its details, evidence and recommendations.
                        </p>
                    </div>
                </div>

                <div className="w-full lg:w-[430px]">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                        Finding ({findings.length})
                    </label>
                    <select
                        value={String(selectedId)}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                    >
                        {findings.map((finding, index) => {
                            const id = finding?.id ?? finding?.findingId ?? index;
                            const title = getDisplayValue(finding?.title) || "Untitled Finding";
                            const severity = getDisplayValue(finding?.riskLevel ?? finding?.severity);
                            return (
                                <option key={String(id)} value={String(id)}>
                                    Finding #{index + 1} — {title}{severity !== "-" ? ` (${severity})` : ""}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// EVIDENCE STAGE DETAILS - FILTER BY SELECTED FINDING
// ============================================================

const getFindingId = (item) =>
    item?.findingId ??
    item?.finding?.id ??
    item?.finding?.findingId ??
    item?.relatedFindingId ??
    item?.finding?.findingCode ??
    null;

const EvidenceStageDetails = ({ risk, selectedFindingId }) => {
    const evidenceList = Array.isArray(risk?.evidenceList)
        ? risk.evidenceList
        : Array.isArray(risk?.evidenceItems)
            ? risk.evidenceItems
            : [];

    const findings = Array.isArray(risk?.findings) ? risk.findings : [];
    const selectedFinding = findings.find(
        (finding) => String(finding?.id ?? finding?.findingId) === String(selectedFindingId)
    ) ?? findings[0];

    const selectedId = selectedFinding?.id ?? selectedFinding?.findingId;

    // Evidence is audit-scoped by the current API. When evidence contains
    // findingId, use it for the exact finding. If no findingId is present,
    // keep it visible rather than silently hiding the audit evidence.
    const hasFindingLinks = evidenceList.some((item) => getFindingId(item) != null);
    const filteredEvidence = hasFindingLinks && selectedId != null
        ? evidenceList.filter((item) => String(getFindingId(item)) === String(selectedId))
        : evidenceList;

    return (
        <div>
            <div className="mt-5 flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <FileCheck2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Evidence for Selected Finding</h3>
                        <p className="text-xs text-slate-400">
                            {selectedFinding ? getDisplayValue(selectedFinding.title) : "Audit evidence"}
                        </p>
                    </div>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700">
                    {filteredEvidence.length} Evidence
                </span>
            </div>

            {filteredEvidence.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                    <FileCheck2 className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="mt-3 font-semibold text-slate-700">No evidence for this finding</p>
                    <p className="mt-1 text-xs text-slate-400">
                        No evidence linked to the selected finding was returned by the API.
                    </p>
                </div>
            ) : (
                <div className="space-y-4 mt-5">
                    {filteredEvidence.map((evidence, index) => {
                        let fileUrl = null;
                        try { fileUrl = EvidenceService.getEvidenceFileUrl(evidence); } catch { fileUrl = null; }
                        return (
                            <div key={evidence?.id ?? evidence?.evidenceId ?? index} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700">Evidence #{index + 1}</span>
                                            {(evidence?.id ?? evidence?.evidenceId) != null && (
                                                <span className="text-[11px] text-slate-400">ID: {getDisplayValue(evidence?.id ?? evidence?.evidenceId)}</span>
                                            )}
                                            <StageBadge status={evidence?.status} />
                                        </div>
                                        <h4 className="mt-3 text-base font-bold text-slate-900 break-words">{getDisplayValue(evidence?.fileName) || "Evidence File"}</h4>
                                    </div>
                                    {fileUrl && (
                                        <a href={fileUrl} target="_blank" rel="noreferrer" className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition">
                                            <Eye className="w-3.5 h-3.5" /> View File
                                        </a>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
                                    <KriInfoCard label="Evidence ID" value={evidence?.id ?? evidence?.evidenceId} />
                                    <KriInfoCard label="File Name" value={evidence?.fileName} />
                                    <KriInfoCard label="Status" value={evidence?.status} />
                                    <KriInfoCard label="Uploaded By" value={evidence?.uploadedBy?.name ?? evidence?.uploadedBy?.fullName ?? evidence?.uploadedByName} />
                                    <KriInfoCard label="Employee ID" value={evidence?.uploadedBy?.employeeId ?? evidence?.uploadedBy?.id ?? evidence?.uploadedByEmployeeId} />
                                    <KriInfoCard label="Uploaded At" value={evidence?.uploadedAt} />
                                </div>
                                <div className="mt-3">
                                    <KriInfoCard label="Description" value={evidence?.description} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ============================================================
// RISK TRACKING MODAL
// ============================================================

const RiskTrackingModal = ({ risk, onClose }) => {
    const [selectedStage, setSelectedStage] = useState("risk");
    const findings = Array.isArray(risk?.findings) ? risk.findings : [];
    const [selectedFindingId, setSelectedFindingId] = useState(
        findings.length > 0 ? String(findings[0]?.id ?? findings[0]?.findingId ?? "") : ""
    );

    // If the risk data refreshes while the modal is open, keep the selected
    // finding valid. Otherwise automatically move to the first finding.
    useEffect(() => {
        if (findings.length === 0) {
            setSelectedFindingId("");
            return;
        }
        const exists = findings.some(
            (finding) => String(finding?.id ?? finding?.findingId) === String(selectedFindingId)
        );
        if (!exists) {
            setSelectedFindingId(String(findings[0]?.id ?? findings[0]?.findingId ?? ""));
        }
    }, [risk, findings.length]);

    const selectedFinding = findings.find(
        (finding) => String(finding?.id ?? finding?.findingId) === String(selectedFindingId)
    ) ?? findings[0] ?? null;

    const handleFindingChange = (value) => {
        setSelectedFindingId(String(value));
    };

    const renderFindingSelector = () => (
        <FindingSelector
            findings={findings}
            selectedFinding={selectedFinding}
            onChange={handleFindingChange}
        />
    );

    const renderStageDetails = () => {
        switch (selectedStage) {
            case "risk":
                return (
                    <StageDetails
                        title="Risk Details"
                        icon={ShieldAlert}
                        items={[
                            ["Risk ID", risk.riskId],
                            ["Title", risk.title],
                            ["Description", risk.description],
                            ["Category", getRiskCategory(risk)],
                            ["Risk Level", getRiskLevel(risk)],
                            ["Likelihood", risk.likelihood],
                            ["Impact", risk.impact],
                            ["Risk Score", getRiskScore(risk)],
                            ["Status", getRiskStatus(risk)],
                            ["Department", risk.department],
                            ["Business Unit", risk.businessUnit],
                            ["Process", risk.processName],
                            ["Control Owner", risk.controlOwner],
                            ["Existing Controls", risk.existingControls],
                            ["Mitigation Plan", risk.mitigationPlan],
                            ["Target Closure", risk.targetClosureDate],
                            ["Mitigation Update", risk.mitigationUpdate],
                            ["Actual Closure", risk.actualClosureDate],
                            ["Remarks", risk.remarks],
                            ["Identified By", risk.identifiedByName],
                            ["Assigned To", risk.assignedToName],
                            ["Created At", risk.createdAt],
                            ["Updated At", risk.updatedAt],
                        ]}
                    />
                );
            case "kri":
                return <KriStageDetails risk={risk} />;
            case "mitigation":
                return <MitigationStageDetails risk={risk} />;
            case "auditor":
                return (
                    <StageDetails title="Internal Auditor Assignment" icon={UserCheck} items={[
                        ["Assignment ID", risk.auditorAssignmentId],
                        ["Auditor", risk.auditorEmployeeId],
                        ["Assignment Status", risk.auditorAssignmentStatus],
                        ["Priority", risk.auditorAssignmentPriority],
                        ["Assigned Date", risk.auditorAssignedDate],
                        ["Start Date", risk.auditorStartDate],
                        ["Due Date", risk.auditorDueDate],
                        ["Email", risk.auditorEmail],
                        ["Assigned By", risk.assignedByEmployeeId],
                        ["Comments", risk.auditorComments],
                    ]} />
                );
            case "audit":
                return (
                    <StageDetails title="Audit Details" icon={FileText} items={[
                        ["Audit ID", risk.auditCode],
                        ["Audit Name", risk.auditTitle],
                        ["Status", risk.auditStatus],
                        ["Department", risk.auditDepartment],
                        ["Business Unit", risk.auditBusinessUnit],
                        ["Process", risk.auditProcessName],
                        ["Start Date", risk.auditStartDate],
                        ["End Date", risk.auditEndDate],
                        ["Internal Auditor", risk.auditInternalAuditorName],
                        ["Auditee", risk.auditAuditeeName],
                        ["Description", risk.auditDescription],
                        ["Created At", risk.auditCreatedAt],
                        ["Updated At", risk.auditUpdatedAt],
                    ]} />
                );
            case "auditee":
                return (
                    <StageDetails title="Auditee Assignment" icon={Users} items={[
                        ["Assignment ID", risk.auditeeAssignmentId],
                        ["Auditee", risk.auditeeEmployeeId],
                        ["Auditee Name", risk.auditeeName],
                        ["Assignment Status", risk.auditeeAssignmentStatus],
                        ["Assigned Date", risk.auditeeAssignedDate],
                        ["Start Date", risk.auditeeStartDate],
                        ["Due Date", risk.auditeeDueDate],
                        ["Email", risk.auditeeEmail],
                        ["Assigned By", risk.auditeeAssignedByName],
                    ]} />
                );
            case "finding":
                return <FindingStageDetails risk={risk} selectedFindingId={selectedFindingId} onFindingChange={handleFindingChange} />;
            case "evidence":
                return (
                    <div>
                        {renderFindingSelector()}
                        <div className="mt-5">
                            <EvidenceStageDetails risk={risk} selectedFindingId={selectedFindingId} />
                        </div>
                    </div>
                );
            case "recommendation": {
                const recommendations = Array.isArray(selectedFinding?.recommendations)
                    ? selectedFinding.recommendations
                    : Array.isArray(selectedFinding?.recommendationList)
                        ? selectedFinding.recommendationList
                        : [];
                return (
                    <div>
                        {renderFindingSelector()}
                        <div className="mt-5">
                            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                                        <GitBranch className="w-5 h-5 text-violet-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Recommendations</h3>
                                        <p className="text-xs text-slate-400">
                                            Recommendations for {getDisplayValue(selectedFinding?.title) || "selected finding"}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-100 text-xs font-bold text-violet-700">
                                    {recommendations.length} Recommendation{recommendations.length === 1 ? "" : "s"}
                                </span>
                            </div>

                            {recommendations.length === 0 ? (
                                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
                                    <GitBranch className="w-10 h-10 mx-auto text-slate-300" />
                                    <p className="mt-3 font-semibold text-slate-700">No recommendations for this finding</p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        No recommendation is linked to the selected finding.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4 mt-5">
                                    {recommendations.map((recommendation, index) => (
                                        <div key={recommendation?.id ?? recommendation?.recommendationId ?? index} className="rounded-2xl border border-violet-100 bg-violet-50/40 p-5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="px-2.5 py-1 rounded-lg bg-white border border-violet-100 text-[11px] font-bold text-violet-700">
                                                    Recommendation #{index + 1}
                                                </span>
                                                <StageBadge status={recommendation?.status} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
                                                <KriInfoCard label="Recommendation ID" value={recommendation?.recommendationId ?? recommendation?.id} />
                                                <KriInfoCard label="Status" value={recommendation?.status} />
                                                <KriInfoCard label="Finding" value={recommendation?.findingTitle ?? selectedFinding?.title} />
                                                <KriInfoCard label="Audit" value={recommendation?.auditName ?? recommendation?.auditCode ?? risk?.auditTitle} />
                                                <KriInfoCard label="Internal Auditor" value={recommendation?.internalAuditorName} />
                                                <KriInfoCard label="Auditee" value={recommendation?.auditeeName} />
                                                <KriInfoCard label="Auditee Email" value={recommendation?.auditeeEmail} />
                                                <KriInfoCard label="Created At" value={recommendation?.createdAt} />
                                                <KriInfoCard label="Updated At" value={recommendation?.updatedAt} />
                                            </div>
                                            <div className="mt-3">
                                                <KriInfoCard label="Recommendation" value={recommendation?.recommendationText ?? recommendation?.text ?? recommendation?.description} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
            case "compliance":
                return (
                    <StageDetails title="Compliance Officer Review" icon={Layers3} items={[
                        ["Review ID", risk.complianceReviewCode],
                        ["Reviewed By", risk.complianceOfficerName],
                        ["Review Status", risk.complianceStatus],
                        ["Reviewed Date", risk.complianceReviewedDate],
                        ["Related Audit", risk.complianceAuditCode],
                        ["Related Finding", risk.complianceFindingTitle],
                        ["Comments", risk.complianceRemarks],
                        ["Created At", risk.complianceCreatedAt],
                        ["Updated At", risk.complianceUpdatedAt],
                    ]} />
                );
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
                <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} transition={{ duration: 0.25 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-[1500px] max-h-[92vh] overflow-hidden bg-slate-50 rounded-3xl shadow-2xl">
                    <div className="px-6 py-5 bg-white border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm"><ShieldAlert className="w-5 h-5" /></div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Risk Tracking</p>
                                <h2 className="text-xl font-bold text-slate-900 mt-0.5">{risk.riskId || "-"}</h2>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="overflow-y-auto max-h-[calc(92vh-80px)] p-6">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600">{risk.riskId || "RISK"}</span>
                                        <StageBadge status={getRiskStatus(risk)} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mt-3">{risk.title || "Untitled Risk"}</h3>
                                    <p className="text-sm text-slate-500 mt-1">{getDisplayValue(risk.department) || "Department not specified"}</p>
                                    {risk.description && <p className="text-sm text-slate-500 mt-3 max-w-3xl leading-6">{risk.description}</p>}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
                                    <SummaryCard label="Risk Score" value={getRiskScore(risk)} />
                                    <SummaryCard label="Risk Level" value={getRiskLevel(risk)} />
                                    <SummaryCard label="Category" value={getRiskCategory(risk)} />
                                    <SummaryCard label="Findings" value={findings.length} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-5">
                                <div>
                                    <h3 className="font-bold text-slate-900">Risk Lifecycle</h3>
                                    <p className="text-xs text-slate-400 mt-1">Track the complete lifecycle of this risk</p>
                                </div>
                                <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg"><Activity className="w-3.5 h-3.5" />{TRACKING_STAGES.length} Stages</span>
                            </div>
                            <div className="overflow-x-auto pb-4">
                                <div className="flex items-center min-w-max">
                                    {TRACKING_STAGES.map((stage, index) => (
                                        <TrackingStage key={stage.key} stage={stage} risk={risk} index={index} onClick={setSelectedStage} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            {renderStageDetails()}
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
                            <p className="text-[11px] text-slate-400">Risk ID: <span className="font-semibold text-slate-500">{risk.riskId || "-"}</span></p>
                            <p className="text-[11px] text-slate-400">Last Updated: <span className="font-semibold text-slate-500">{risk.updatedAt || "-"}</span></p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ============================================================
// KRI STAGE DETAILS
// ============================================================

const KriStageDetails = ({ risk }) => {

    const kris =
        Array.isArray(risk?.kris)
            ? risk.kris
            : [];

    // ========================================================
    // NO KRI
    // ========================================================

    if (kris.length === 0) {

        return (
            <div>

                <div
                    className="
                        flex
                        items-center
                        gap-3
                        pb-4
                        border-b
                        border-slate-100
                    "
                >

                    <div
                        className="
                            w-10
                            h-10
                            rounded-xl
                            bg-slate-100
                            flex
                            items-center
                            justify-center
                        "
                    >
                        <Gauge
                            className="w-5 h-5 text-slate-700"
                        />
                    </div>

                    <div>

                        <h3
                            className="
                                font-bold
                                text-slate-900
                            "
                        >
                            KRI Details
                        </h3>

                        <p
                            className="
                                text-xs
                                text-slate-400
                            "
                        >
                            Key Risk Indicator information · GREEN = Completed
                        </p>

                    </div>

                </div>

                <div
                    className="
                        mt-5
                        rounded-xl
                        bg-slate-50
                        border border-slate-200
                        p-8
                        text-center
                    "
                >

                    <Gauge
                        className="
                            w-10
                            h-10
                            mx-auto
                            text-slate-300
                        "
                    />

                    <p
                        className="
                            mt-3
                            font-semibold
                            text-slate-700
                        "
                    >
                        No KRI assigned
                    </p>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-slate-400
                        "
                    >
                        No Key Risk Indicator has been configured
                        for this risk.
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div>

            <div
                className="
                    flex
                    items-center
                    gap-3
                    pb-4
                    border-b
                    border-slate-100
                "
            >

                <div
                    className="
                        w-10
                        h-10
                        rounded-xl
                        bg-slate-100
                        flex
                        items-center
                        justify-center
                    "
                >

                    <Gauge
                        className="w-5 h-5 text-slate-700"
                    />

                </div>

                <div>

                    <h3
                        className="
                            font-bold
                            text-slate-900
                        "
                    >
                        KRI Details
                    </h3>

                    <p
                        className="
                            text-xs
                            text-slate-400
                        "
                    >
                        Key Risk Indicator information
                    </p>

                </div>

            </div>

            <div className="space-y-5 mt-5">

                {kris.map((kri, index) => (

                    <div
                        key={
                            kri.kriId ||
                            index
                        }
                        className="
                            rounded-2xl
                            bg-slate-50
                            border
                            border-slate-200
                            p-5
                        "
                    >

                        {/* KRI HEADER */}

                        <div
                            className="
                                flex
                                flex-col
                                lg:flex-row
                                lg:items-center
                                lg:justify-between
                                gap-4
                            "
                        >

                            <div>

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <span
                                        className="
                                            px-2.5
                                            py-1
                                            rounded-lg
                                            bg-white
                                            border
                                            border-slate-200
                                            text-[11px]
                                            font-bold
                                            text-slate-700
                                        "
                                    >
                                        {kri.kriId || "-"}
                                    </span>

                                    <StageBadge
                                        status={kri.status}
                                    />

                                </div>

                                <h4
                                    className="
                                        mt-2
                                        text-lg
                                        font-bold
                                        text-slate-900
                                    "
                                >
                                    {kri.kriName ||
                                        "Unnamed KRI"}
                                </h4>

                                {kri.description && (

                                    <p
                                        className="
                                            mt-1
                                            text-sm
                                            text-slate-500
                                        "
                                    >
                                        {kri.description}
                                    </p>

                                )}

                            </div>

                            <div
                                className="
                                    px-5
                                    py-3
                                    rounded-xl
                                    bg-white
                                    border
                                    border-slate-200
                                "
                            >

                                <p
                                    className="
                                        text-[10px]
                                        uppercase
                                        tracking-wide
                                        font-semibold
                                        text-slate-400
                                    "
                                >
                                    Current Value
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-2xl
                                        font-bold
                                        text-slate-900
                                    "
                                >

                                    {getDisplayValue(
                                        kri.currentValue
                                    )}

                                    {kri.unit && (

                                        <span
                                            className="
                                                ml-1
                                                text-xs
                                                font-semibold
                                                text-slate-400
                                            "
                                        >
                                            {getDisplayValue(
                                                kri.unit
                                            )}
                                        </span>

                                    )}

                                </p>

                            </div>

                        </div>

                        {/* KRI INFORMATION */}

                        <div
                            className="
                                grid
                                grid-cols-1
                                md:grid-cols-2
                                xl:grid-cols-3
                                gap-4
                                mt-5
                            "
                        >

                            <KriInfoCard
                                label="KRI ID"
                                value={kri.kriId}
                            />

                            <KriInfoCard
                                label="KRI Name"
                                value={kri.kriName}
                            />

                            <KriInfoCard
                                label="Status"
                                value={kri.status}
                            />

                            <KriInfoCard
                                label="Current Value"
                                value={kri.currentValue}
                            />

                            <KriInfoCard
                                label="Unit"
                                value={kri.unit}
                            />

                            <KriInfoCard
                                label="Frequency"
                                value={kri.frequency}
                            />

                            <KriInfoCard
                                label="Green Threshold"
                                value={kri.greenThreshold}
                            />

                            <KriInfoCard
                                label="Amber Threshold"
                                value={kri.amberThreshold}
                            />

                            <KriInfoCard
                                label="Red Threshold"
                                value={kri.redThreshold}
                            />

                            <KriInfoCard
                                label="Data Source"
                                value={kri.dataSource}
                            />

                            <KriInfoCard
                                label="Last Updated"
                                value={kri.lastUpdated}
                            />

                            <KriInfoCard
                                label="Owner ID"
                                value={kri.ownerId}
                            />

                            <KriInfoCard
                                label="Owner Employee ID"
                                value={kri.ownerEmployeeId}
                            />

                            <KriInfoCard
                                label="Owner Name"
                                value={kri.ownerName}
                            />

                            <KriInfoCard
                                label="Department"
                                value={kri.department}
                            />

                            <KriInfoCard
                                label="Business Unit"
                                value={kri.businessUnit}
                            />

                            <KriInfoCard
                                label="Risk Code"
                                value={kri.riskCode}
                            />

                            <KriInfoCard
                                label="Risk Title"
                                value={kri.riskTitle}
                            />

                            <KriInfoCard
                                label="Created At"
                                value={kri.createdAt}
                            />

                            <KriInfoCard
                                label="Updated At"
                                value={kri.updatedAt}
                            />

                            <KriInfoCard
                                label="Remarks"
                                value={kri.remarks}
                            />

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
};


// ============================================================
// KRI INFO CARD
// ============================================================

const KriInfoCard = ({
    label,
    value,
}) => {

    return (
        <div
            className="
                rounded-xl
                bg-white
                border
                border-slate-200
                p-4
            "
        >

            <p className="text-xs text-slate-400">
                {label}
            </p>

            <p
                className="
                    mt-1
                    text-sm
                    font-semibold
                    text-slate-800
                    break-words
                "
            >
                {getDisplayValue(value)}
            </p>

        </div>
    );
};

// ============================================================
// MITIGATION STAGE DETAILS
// ============================================================

const MitigationStageDetails = ({ risk }) => {

    const mitigations = Array.isArray(risk?.mitigations)
        ? risk.mitigations
        : [];

    const header = (
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">

            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-slate-700" />
            </div>

            <div>
                <h3 className="font-bold text-slate-900">
                    Mitigation Details
                </h3>

                <p className="text-xs text-slate-400">
                    Risk mitigation plan and progress
                </p>
            </div>

        </div>
    );


    // ============================================================
    // NO MITIGATION
    // ============================================================

    if (mitigations.length === 0) {

        return (
            <div>

                {header}

                <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-8 text-center">

                    <Target className="w-10 h-10 mx-auto text-slate-300" />

                    <p className="mt-3 font-semibold text-slate-700">
                        No mitigation assigned
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        No mitigation plan has been created for this risk yet.
                    </p>

                </div>

            </div>
        );
    }


    // ============================================================
    // MITIGATION DETAILS
    // ============================================================

    return (
        <div>

            {header}

            <div className="space-y-5 mt-5">

                {mitigations.map((m, index) => (

                    <div
                        key={
                            m.mitigationId ||
                            m.mitigationCode ||
                            index
                        }
                        className="rounded-2xl bg-slate-50 border border-slate-200 p-5"
                    >

                        {/* ================================================= */}
                        {/* HEADER */}
                        {/* ================================================= */}

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                            <div>

                                <div className="flex items-center gap-2">

                                    {/* MITIGATION ID */}

                                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-700">

                                        {m.mitigationId ||
                                            m.mitigationCode ||
                                            "-"}

                                    </span>


                                    {/* STATUS */}

                                    <StageBadge
                                        status={m.status}
                                    />

                                </div>


                                {/* ================================================= */}
                                {/* MITIGATION TITLE */}
                                {/* ================================================= */}

                                <h4 className="mt-2 text-lg font-bold text-slate-900">

                                    {m.mitigationTitle ||
                                        m.plan ||
                                        m.mitigationPlan ||
                                        "Untitled Mitigation"}

                                </h4>

                            </div>


                            {/* ================================================= */}
                            {/* EFFECTIVENESS */}
                            {/* ================================================= */}

                            <div className="px-5 py-3 rounded-xl bg-white border border-slate-200">

                                <p className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">
                                    Effectiveness
                                </p>

                                <p className="mt-1 text-2xl font-bold text-slate-900">

                                    {getDisplayValue(
                                        m.effectiveness
                                    )}

                                </p>

                            </div>

                        </div>


                        {/* ================================================= */}
                        {/* MITIGATION INFORMATION */}
                        {/* ================================================= */}

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">


                            {/* MITIGATION ID */}

                            <KriInfoCard
                                label="Mitigation ID"
                                value={
                                    m.mitigationId ||
                                    m.mitigationCode
                                }
                            />


                            {/* MITIGATION TITLE */}

                            <KriInfoCard
                                label="Mitigation Title"
                                value={
                                    m.mitigationTitle ||
                                    m.plan ||
                                    m.mitigationPlan
                                }
                            />


                            {/* DESCRIPTION */}

                            <KriInfoCard
                                label="Description"
                                value={
                                    m.mitigationDescription
                                }
                            />


                            {/* OWNER */}

                            <KriInfoCard
                                label="Owner"
                                value={
                                    m.ownerName ||
                                    m.owner
                                }
                            />


                            {/* OWNER EMPLOYEE ID */}

                            <KriInfoCard
                                label="Owner Employee ID"
                                value={
                                    m.ownerEmployeeId ||
                                    m.ownerId
                                }
                            />


                            {/* MITIGATION TYPE */}

                            <KriInfoCard
                                label="Mitigation Type"
                                value={
                                    m.mitigationType
                                }
                            />


                            {/* STATUS */}

                            <KriInfoCard
                                label="Status"
                                value={
                                    m.status
                                }
                            />


                            {/* EFFECTIVENESS */}

                            <KriInfoCard
                                label="Effectiveness"
                                value={
                                    m.effectiveness
                                }
                            />


                            {/* COST */}

                            <KriInfoCard
                                label="Cost"
                                value={
                                    m.cost !== undefined &&
                                    m.cost !== null
                                        ? `₹${m.cost}`
                                        : "-"
                                }
                            />


                            {/* TARGET DATE */}

                            <KriInfoCard
                                label="Target Date"
                                value={
                                    m.targetDate
                                }
                            />


                            {/* COMPLETED DATE */}

                            <KriInfoCard
                                label="Completed Date"
                                value={
                                    m.completedDate
                                }
                            />


                            {/* REMARKS */}

                            <KriInfoCard
                                label="Remarks"
                                value={
                                    m.remarks
                                }
                            />


                            {/* RISK ID */}

                            <KriInfoCard
                                label="Risk ID"
                                value={
                                    m.riskId
                                }
                            />


                            {/* RISK TITLE */}

                            <KriInfoCard
                                label="Risk Title"
                                value={
                                    m.riskTitle
                                }
                            />


                            {/* CREATED AT */}

                            <KriInfoCard
                                label="Created At"
                                value={
                                    m.createdAt
                                }
                            />


                            {/* UPDATED AT */}

                            <KriInfoCard
                                label="Updated At"
                                value={
                                    m.updatedAt
                                }
                            />

                        </div>


                        {/* ================================================= */}
                        {/* DESCRIPTION - FULL WIDTH */}
                        {/* ================================================= */}

                        {m.mitigationDescription && (

                            <div className="mt-4">

                                <KriInfoCard
                                    label="Mitigation Description"
                                    value={
                                        m.mitigationDescription
                                    }
                                />

                            </div>

                        )}

                    </div>

                ))}

            </div>

        </div>
    );
};


// ============================================================
// SUMMARY CARD
// ============================================================

const SummaryCard = ({
    label,
    value,
}) => {

    return (
        <div
            className="
                min-w-[110px]
                px-4 py-3
                rounded-xl
                bg-slate-50
                border border-slate-200
            "
        >

            <p
                className="
                    text-[10px]
                    uppercase
                    tracking-wide
                    font-semibold
                    text-slate-400
                "
            >
                {label}
            </p>

            <p
                className="
                    mt-1
                    text-sm
                    font-bold
                    text-slate-900
                "
            >
                {getDisplayValue(value)}
            </p>

        </div>
    );
};


// ============================================================
// STAGE DETAILS
// ============================================================

const StageDetails = ({
    title,
    icon: Icon,
    items,
}) => {

    return (
        <div>

            <div
                className="
                    flex
                    items-center
                    gap-3
                    pb-4
                    border-b
                    border-slate-100
                "
            >

                <div
                    className="
                        w-10
                        h-10
                        rounded-xl
                        bg-slate-100
                        flex
                        items-center
                        justify-center
                    "
                >

                    <Icon
                        className="w-5 h-5 text-slate-700"
                    />

                </div>

                <div>

                    <h3
                        className="
                            font-bold
                            text-slate-900
                        "
                    >
                        {title}
                    </h3>

                    <p
                        className="
                            text-xs
                            text-slate-400
                        "
                    >
                        Stage information
                    </p>

                </div>

            </div>

            <div
                className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    xl:grid-cols-3
                    gap-4
                    mt-5
                "
            >

                {items.map(
                    ([label, value], index) => (

                        <div
                            key={index}
                            className="
                                rounded-xl
                                bg-slate-50
                                border
                                border-slate-100
                                p-4
                            "
                        >

                            <p
                                className="
                                    text-xs
                                    text-slate-400
                                "
                            >
                                {label}
                            </p>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    font-semibold
                                    text-slate-800
                                    break-words
                                "
                            >
                                {getDisplayValue(value)}
                            </p>

                        </div>

                    )
                )}

            </div>

        </div>
    );
};


// ============================================================
// ROLE HELPERS
// ============================================================

const getUserRoleName = () => {
    const user = getLoggedInUser();
    const role =
        user?.role ??
        user?.roleName ??
        user?.profile?.role ??
        user?.profile?.roleName ??
        user?.user?.role ??
        user?.data?.role;

    if (typeof role === "string") {
        return role.trim().toUpperCase().replace(/\s+/g, "_");
    }

    if (role && typeof role === "object") {
        return String(role?.name ?? role?.roleName ?? "")
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "_");
    }

    return "";
};

const isAuditManagerUser = () => {
    const role = getUserRoleName();
    return role === "AUDIT_MANAGER" || role === "AUDITMANAGER" || role === "AUDIT_MGR";
};

// ============================================================
// MAIN
// ============================================================

const RiskManagement = () => {

    const [risks, setRisks] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [selectedRisk, setSelectedRisk] =
        useState(null);

    const [department, setDepartment] =
        useState(null);

    const [updatingRiskId, setUpdatingRiskId] =
        useState(null);

    const [statusPopupRisk, setStatusPopupRisk] =
        useState(null);


    // ========================================================
    // FETCH DEPARTMENT RISKS
    // ========================================================
    const loadRisks = async () => {
 
        try {
 
            setLoading(true);

// IMPORTANT: currentDepartment can be a Department entity
            // ({ id, name, active }). Never send the object in the URL.
            // We fetch all risks here and filter on the frontend so this
            // page does not depend on the /risks/department/{department}
            // endpoint/CORS preflight.
            const currentDepartment = getDepartmentName(
                getUserDepartment()
            );

            setDepartment(currentDepartment);

            console.log(
                "AUDIT MANAGER DEPARTMENT NAME:",
                currentDepartment
            );

            const response = await RiskService.getAllRisks();
 
            console.log(
                "AUDIT MANAGER RISKS RESPONSE:",
                response
            );
 
 
            // =================================================
            // NORMALIZE RISK RESPONSE
            // =================================================
 
            let data = [];
 
            if (Array.isArray(response)) {
 
                data = response;
 
            } else if (
                Array.isArray(response?.data)
            ) {
 
                data = response.data;
 
            } else if (
                Array.isArray(response?.content)
            ) {
 
                data = response.content;
 
            } else if (
                Array.isArray(response?.risks)
            ) {
 
                data = response.risks;
 
            } else if (
                Array.isArray(response?.data?.content)
            ) {
 
                data =
                    response.data.content;
 
            } else if (
                Array.isArray(response?.data?.risks)
            ) {
 
                data =
                    response.data.risks;
            }
 
 
            // Keep only the Audit Manager's department.
            // Department may arrive as a String or as {id,name,active}.
            if (currentDepartment) {
                const managerDepartment = currentDepartment
                    .trim()
                    .toUpperCase()
                    .replace(/\s+/g, "_");

                data = data.filter((risk) => {
                    const riskDepartment = getDepartmentName(
                        risk?.department ??
                        risk?.departmentName
                    );

                    if (!riskDepartment) return false;

                    return (
                        riskDepartment
                            .trim()
                            .toUpperCase()
                            .replace(/\s+/g, "_") ===
                        managerDepartment
                    );
                });
            }

            console.log(
                "NORMALIZED DEPARTMENT RISKS BEFORE KRI:",
                data
            );
 
 
            // =================================================
            // LOAD KRI FOR EVERY RISK
            // =================================================
 
            const risksWithKri =
                await attachKrisToRisks(
                    data
                );
 
 
            console.log(
                "RISKS WITH KRI:",
                risksWithKri
            );
 
 
            // =================================================
            // LOAD MITIGATION FOR EVERY RISK
            // =================================================
 
            const risksWithMitigation =
                await attachMitigationsToRisks(
                    risksWithKri
                );
 
 
            console.log(
                "RISKS WITH MITIGATION:",
                risksWithMitigation
            );
 
 
            // =================================================
            // LOAD AUDITOR ASSIGNMENT FOR EVERY RISK
            // =================================================
 
            const risksWithAuditor =
                await attachAuditorAssignmentsToRisks(
                    risksWithMitigation
                );
 
 
            console.log(
                "RISKS WITH AUDITOR ASSIGNMENT:",
                risksWithAuditor
            );
 
 
            // =================================================
            // LOAD AUDITS (fetched once, grouped by riskId —
            // no per-risk endpoint exists for audits)
            // =================================================
 
            const allAudits = await loadAllAudits();
 
            const risksWithAudits = attachAuditsToRisks(
                risksWithAuditor,
                allAudits
            );
 
 
            console.log(
                "RISKS WITH AUDITS:",
                risksWithAudits
            );
     
 
            // =================================================
            // DEBUG
            // =================================================
 
            if (
                risksWithAudits.length > 0
            ) {
 
                console.log(
                    "FIRST RISK OBJECT:",
                    risksWithAudits[0]
                );
 
                console.log(
                    "CATEGORY:",
                    getRiskCategory(
                        risksWithAudits[0]
                    )
                );
 
                console.log(
                    "RISK LEVEL:",
                    getRiskLevel(
                        risksWithAudits[0]
                    )
                );
 
                console.log(
                    "KRI:",
                    risksWithAudits[0].kris
                );
 
                console.log(
                    "MITIGATION:",
                    {
                        mitigationCode:
                            risksWithAudits[0].mitigationCode,
 
                        mitigationPlan:
                            risksWithAudits[0].mitigationPlan,
 
                        mitigationOwner:
                            risksWithAudits[0].mitigationOwner,
 
                        mitigationTargetDate:
                            risksWithAudits[0].mitigationTargetDate,
 
                        mitigationStatus:
                            risksWithAudits[0].mitigationStatus,
 
                        mitigationEffectiveness:
                            risksWithAudits[0].mitigationEffectiveness,
 
                        mitigationUpdate:
                            risksWithAudits[0].mitigationUpdate,
                    }
                );
 
                console.log(
                    "AUDITOR ASSIGNMENT:",
                    {
                        auditorAssignmentId:
                            risksWithAudits[0].auditorAssignmentId,
 
                        auditorEmployeeId:
                            risksWithAudits[0].auditorEmployeeId,
 
                        auditorAssignmentStatus:
                            risksWithAudits[0].auditorAssignmentStatus,
 
                        auditorAssignmentPriority:
                            risksWithAudits[0].auditorAssignmentPriority,
 
                        auditorDueDate:
                            risksWithAudits[0].auditorDueDate,
                    }
                );
 
                console.log(
                    "AUDIT:",
                    {
                        auditCode:
                            risksWithAudits[0].auditCode,
 
                        auditTitle:
                            risksWithAudits[0].auditTitle,
 
                        auditStatus:
                            risksWithAudits[0].auditStatus,
 
                        auditInternalAuditorName:
                            risksWithAudits[0].auditInternalAuditorName,
 
                        auditAuditeeName:
                            risksWithAudits[0].auditAuditeeName,
                    }
                );
            }

            const risksWithAuditee = await attachAuditeeAssignmentsToRisks(
                risksWithAudits
            );
            
            console.log("RISKS WITH AUDITEE ASSIGNMENT:", risksWithAuditee);
            
            const risksWithFindings = await attachFindingsToRisks(
                risksWithAuditee   // or whatever the previous stage's result var is named
            );
            
            console.log("RISKS WITH FINDINGS:", risksWithFindings);
            
            const risksWithEvidence = await attachEvidenceToRisks(
                risksWithFindings   // ← the result right after attachFindingsToRisks
            );
            
            console.log("RISKS WITH EVIDENCE:", risksWithEvidence);
            
            const risksWithRecommendations = await attachRecommendationsToRisks(
                risksWithEvidence   // ← the result right after attachEvidenceToRisks
            );
            
            console.log("RISKS WITH RECOMMENDATIONS:", risksWithRecommendations);

            const allReviews = await loadAllReviews();

const risksWithReviews = attachReviewsToRisks(
    risksWithRecommendations,   // ← whatever your current last-stage var is
    allReviews
);

console.log("RISKS WITH REVIEWS:", risksWithReviews);

setRisks(risksWithReviews);
 
        } catch (error) {
 
            console.error(
                "Failed to load department risks:",
                error
            );
 
            setRisks([]);
 
        } finally {
 
            setLoading(false);
 
        }
    };
 
 
    // ========================================================
    // INITIAL LOAD
    // ========================================================
 
    useEffect(() => {
 
        loadRisks();
 
    }, []);


    // ========================================================
    // REFRESH
    // ========================================================

    const handleRefresh = async () => {

        try {

            setRefreshing(true);

            await loadRisks();

        } finally {

            setRefreshing(false);

        }
    };


    // ========================================================
    // AUDIT MANAGER STATUS UPDATE
    // ========================================================

    const handleRiskStatusChange = async (risk, nextStatus) => {
        const riskId = risk?.id ?? risk?.riskId;

        if (!riskId || !nextStatus) return;

        if (!MANAGER_EDITABLE_RISK_STATUSES.includes(nextStatus)) {
            window.alert("Only the allowed Audit Manager risk statuses can be selected.");
            return;
        }

        if (!isAuditManagerUser()) {
            window.alert("Only Audit Manager can update risk status.");
            return;
        }

        const currentStatus = normalizeStatus(getRiskStatus(risk));

        // CAE terminal lock: once CAE marks the risk COMPLETED/CLOSED,
        // Audit Manager cannot update the risk anymore.
        if (isCaeLockedRisk(currentStatus)) {
            window.alert(
                "This risk is finalized by CAE. Audit Manager cannot update it anymore."
            );
            return;
        }

        if (currentStatus === nextStatus) return;

        try {
            setUpdatingRiskId(riskId);

            const response = await RiskService.updateRiskStatus(
                riskId,
                nextStatus
            );

            const updatedRisk =
                response?.data?.data ??
                response?.data ??
                response;

            setRisks((currentRisks) =>
                currentRisks.map((item) => {
                    const itemId = item?.id ?? item?.riskId;

                    if (String(itemId) !== String(riskId)) {
                        return item;
                    }

                    return {
                        ...item,
                        ...(updatedRisk && typeof updatedRisk === "object"
                            ? updatedRisk
                            : {}),
                        riskStatus: nextStatus,
                        status: nextStatus,
                    };
                })
            );

            await loadRisks();
        } catch (error) {
            console.error("Risk status update failed:", error);
            window.alert(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Unable to update risk status."
            );
        } finally {
            setUpdatingRiskId(null);
        }
    };

    // ========================================================
    // FILTER
    // ========================================================

    const filteredRisks =
        useMemo(() => {

            return risks.filter(
                (risk) => {

                    const value =
                        search.toLowerCase();

                    const category =
                        getRiskCategory(
                            risk
                        );


                    const matchesSearch =
                        !search ||

                        String(
                            risk.riskCode ||
                            risk.riskId ||
                            ""
                        )
                            .toLowerCase()
                            .includes(value) ||

                        String(
                            risk.title ||
                            ""
                        )
                            .toLowerCase()
                            .includes(value) ||

                        String(category)
                            .toLowerCase()
                            .includes(value) ||

                        String(
                            risk.kriId ||
                            ""
                        )
                            .toLowerCase()
                            .includes(value) ||

                        String(
                            risk.kriName ||
                            ""
                        )
                            .toLowerCase()
                            .includes(value);


                    const status =
                        normalizeStatus(
                            getRiskStatus(
                                risk
                            )
                        );


                    const matchesStatus =
                        statusFilter ===
                            "ALL" ||
                        status ===
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

            let open = 0;

            let inProgress = 0;

            let completed = 0;

            let critical = 0;


            risks.forEach(
                (risk) => {

                    const status =
                        normalizeStatus(
                            getRiskStatus(
                                risk
                            )
                        );


                    if (
                        [
                            "OPEN",
                            "PENDING",
                            "IDENTIFIED",
                        ].includes(status)
                    ) {

                        open++;

                    } else if (
                        [
                            "IN_PROGRESS",
                            "ONGOING",
                            "UNDER_REVIEW",
                        ].includes(status)
                    ) {

                        inProgress++;

                    } else if (
                        [
                            "COMPLETED",
                            "CLOSED",
                            "RESOLVED",
                        ].includes(status)
                    ) {

                        completed++;

                    } else if (
                        [
                            "CRITICAL",
                            "BREACHED",
                            "HIGH",
                        ].includes(status)
                    ) {

                        critical++;

                    }

                }
            );


            return {
                total: risks.length,
                open,
                inProgress,
                completed,
                critical,
            };

        }, [risks]);


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div
                className="
                    min-h-screen
                    bg-slate-50
                    p-6
                    md:p-8
                "
            >

                <div
                    className="
                        max-w-[1600px]
                        mx-auto
                    "
                >

                    <div className="animate-pulse">

                        <div
                            className="
                                h-8
                                w-64
                                bg-slate-200
                                rounded-lg
                            "
                        />

                        <div
                            className="
                                h-4
                                w-96
                                bg-slate-200
                                rounded
                                mt-3
                            "
                        />

                        <div
                            className="
                                grid
                                grid-cols-1
                                sm:grid-cols-2
                                xl:grid-cols-4
                                gap-5
                                mt-8
                            "
                        >

                            {[1, 2, 3, 4].map(
                                (item) => (

                                    <div
                                        key={item}
                                        className="
                                            h-32
                                            bg-white
                                            border
                                            border-slate-200
                                            rounded-2xl
                                        "
                                    />

                                )
                            )}

                        </div>

                    </div>

                </div>

            </div>
        );
    }


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div
            className="
                min-h-screen
                bg-slate-50
                text-slate-800
                p-5
                md:p-8
            "
        >

            <div
                className="
                    max-w-[1600px]
                    mx-auto
                "
            >

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: -15,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="
                        flex
                        flex-col
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                        gap-5
                    "
                >

                    <div>

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <div
                                className="
                                    w-11
                                    h-11
                                    rounded-xl
                                    bg-slate-900
                                    flex
                                    items-center
                                    justify-center
                                    shadow-lg
                                "
                            >

                                <GitBranch
                                    className="
                                        w-5
                                        h-5
                                        text-white
                                    "
                                />

                            </div>

                            <div>

                                <h1
                                    className="
                                        text-2xl
                                        md:text-3xl
                                        font-bold
                                        text-slate-900
                                    "
                                >
                                    Risk Management
                                </h1>

                                <p
                                    className="
                                        text-sm
                                        text-slate-500
                                        mt-1
                                    "
                                >
                                    Department risk lifecycle and
                                    control tracking
                                </p>

                                <div className="mt-2">

                                    <span
                                        className="
                                            inline-flex
                                            items-center
                                            px-2.5
                                            py-1
                                            rounded-full
                                            bg-slate-100
                                            border
                                            border-slate-200
                                            text-[11px]
                                            font-semibold
                                            text-slate-600
                                        "
                                    >
                                        Department:{" "}
                                        {getDisplayValue(department) ||
                                            "All Departments"}
                                    </span>

                                </div>

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
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            px-4
                            py-2.5
                            rounded-xl
                            bg-white
                            border
                            border-slate-200
                            text-sm
                            font-semibold
                            text-slate-700
                            shadow-sm
                            hover:bg-slate-50
                            transition
                        "
                    >

                        <RefreshCw
                            className={`
                                w-4
                                h-4
                                ${
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }
                            `}
                        />

                        Refresh

                    </button>

                </motion.div>


                {/* ================================================= */}
                {/* STATS */}
                {/* ================================================= */}

                <motion.div
                    variants={
                        containerVariants
                    }
                    initial="hidden"
                    animate="show"
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        xl:grid-cols-4
                        gap-5
                        mt-8
                    "
                >

                    <RiskStat
                        title="Total Risks"
                        value={
                            statistics.total
                        }
                        subtitle="Department risks"
                        icon={Activity}
                    />

                    <RiskStat
                        title="Open"
                        value={
                            statistics.open
                        }
                        subtitle="Awaiting action"
                        icon={Clock3}
                    />

                    <RiskStat
                        title="In Progress"
                        value={
                            statistics.inProgress
                        }
                        subtitle="Currently being managed"
                        icon={Target}
                    />

                    <RiskStat
                        title="Critical"
                        value={
                            statistics.critical
                        }
                        subtitle="Requires attention"
                        icon={ShieldAlert}
                    />

                </motion.div>


                {/* ================================================= */}
                {/* FILTERS */}
                {/* ================================================= */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 15,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.2,
                    }}
                    className="
                        mt-6
                        bg-white
                        rounded-2xl
                        border
                        border-slate-200
                        shadow-sm
                        p-4
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            md:flex-row
                            gap-3
                        "
                    >

                        <div
                            className="
                                relative
                                flex-1
                            "
                        >

                            <Search
                                className="
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    w-4
                                    h-4
                                    text-slate-400
                                "
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
                                placeholder="
                                    Search risk ID, title, category, KRI...
                                "
                                className="
                                    w-full
                                    pl-10
                                    pr-4
                                    py-2.5
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    text-sm
                                    outline-none
                                    focus:ring-2
                                    focus:ring-slate-200
                                "
                            />

                        </div>


                        <select
                            value={
                                statusFilter
                            }
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                            className="
                                px-4
                                py-2.5
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                text-sm
                                outline-none
                            "
                        >

                            <option value="ALL">
                                All Status
                            </option>

                            <option value="OPEN">
                                Open
                            </option>

                            <option value="IN_PROGRESS">
                                In Progress
                            </option>

                            <option value="COMPLETED">
                                Completed
                            </option>

                            <option value="CRITICAL">
                                Critical
                            </option>

                        </select>


                        <button
                            onClick={() => {

                                setSearch("");

                                setStatusFilter(
                                    "ALL"
                                );

                            }}
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                px-4
                                py-2.5
                                rounded-xl
                                bg-slate-100
                                text-slate-700
                                text-sm
                                font-semibold
                                hover:bg-slate-200
                            "
                        >

                            <Filter
                                className="w-4 h-4"
                            />

                            Clear

                        </button>

                    </div>

                </motion.div>


                {/* ================================================= */}
                {/* RISK TABLE */}
                {/* ================================================= */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.25,
                    }}
                    className="
                        mt-5
                        bg-white
                        rounded-2xl
                        border
                        border-slate-200
                        shadow-sm
                        overflow-hidden
                    "
                >

                    <div
                        className="
                            px-5
                            py-4
                            border-b
                            border-slate-200
                            flex
                            items-center
                            justify-between
                        "
                    >

                        <div>

                            <h2
                                className="
                                    font-bold
                                    text-slate-900
                                "
                            >
                                Department Risk Register
                            </h2>

                            <p
                                className="
                                    text-xs
                                    text-slate-400
                                    mt-1
                                "
                            >
                                Showing{" "}
                                {
                                    filteredRisks.length
                                }{" "}
                                of{" "}
                                {risks.length}{" "}
                                risks
                            </p>

                        </div>

                        <span
                            className="
                                inline-flex
                                items-center
                                gap-2
                                text-xs
                                text-slate-500
                            "
                        >

                            <Layers3
                                className="w-4 h-4"
                            />

                            Lifecycle tracking

                        </span>

                    </div>


                    <div className="overflow-x-auto">

                        <table
                            className="
                                w-full
                                min-w-[1700px]
                            "
                        >

                            <thead>

                                <tr
                                    className="
                                        bg-slate-50
                                        border-b
                                        border-slate-200
                                    "
                                >

                                    <TableHead>
                                        Risk
                                    </TableHead>

                                    <TableHead>
                                        Category
                                    </TableHead>

                                    <TableHead>
                                        Risk Level
                                    </TableHead>

                                    <TableHead>
                                        Score
                                    </TableHead>

                                    <TableHead>
                                        KRI
                                    </TableHead>

                                    <TableHead>
                                        KRI Value
                                    </TableHead>

                                    <TableHead>
                                        KRI Status
                                    </TableHead>

                                    <TableHead>
                                        Mitigation
                                    </TableHead>

                                    <TableHead>
                                        Mitigation Status
                                    </TableHead>

                                    <TableHead>
                                        Department
                                    </TableHead>

                                    <TableHead>
                                        Current Status
                                    </TableHead>

                                    <TableHead>
                                        Lifecycle
                                    </TableHead>

                                    <TableHead>
                                        Action
                                    </TableHead>

                                </tr>

                            </thead>


                            <tbody
                                className="
                                    divide-y
                                    divide-slate-100
                                "
                            >

                                {filteredRisks.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="13"
                                            className="
                                                px-5
                                                py-16
                                                text-center
                                            "
                                        >

                                            <Search
                                                className="
                                                    w-10
                                                    h-10
                                                    text-slate-300
                                                    mx-auto
                                                "
                                            />

                                            <p
                                                className="
                                                    mt-3
                                                    font-semibold
                                                    text-slate-700
                                                "
                                            >
                                                No risks found
                                            </p>

                                            <p
                                                className="
                                                    text-xs
                                                    text-slate-400
                                                    mt-1
                                                "
                                            >
                                                {department
                                                    ? `No risks found for ${getDisplayValue(department)}`
                                                    : "No risks available"}
                                            </p>

                                        </td>

                                    </tr>

                                ) : (

                                    filteredRisks.map(
                                        (
                                            risk,
                                            index
                                        ) => {

                                            const kri =
                                                Array.isArray(
                                                    risk.kris
                                                ) &&
                                                risk.kris.length >
                                                    0
                                                    ? risk.kris[0]
                                                    : null;


                                            return (

                                                <motion.tr
                                                    key={
                                                        risk.riskCode ||
                                                        risk.riskId ||
                                                        index
                                                    }
                                                    initial={{
                                                        opacity: 0,
                                                        y: 8,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{
                                                        delay:
                                                            index *
                                                            0.025,
                                                    }}
                                                    className="
                                                        hover:bg-slate-50
                                                        transition
                                                    "
                                                >

                                                    {/* RISK */}

                                                    <td className="px-5 py-4">

                                                        <p
                                                            className="
                                                                font-bold
                                                                text-sm
                                                                text-slate-900
                                                            "
                                                        >
                                                            {risk.riskCode ||
                                                                risk.riskId ||
                                                                "-"}
                                                        </p>

                                                        <p
                                                            className="
                                                                text-xs
                                                                text-slate-400
                                                                mt-1
                                                                max-w-[230px]
                                                                truncate
                                                            "
                                                        >
                                                            {risk.title ||
                                                                "-"}
                                                        </p>

                                                    </td>


                                                    {/* CATEGORY */}

                                                    <td className="px-5 py-4">

                                                        <span
                                                            className="
                                                                inline-flex
                                                                items-center
                                                                px-2.5
                                                                py-1
                                                                rounded-lg
                                                                bg-slate-50
                                                                border
                                                                border-slate-200
                                                                text-sm
                                                                font-medium
                                                                text-slate-700
                                                            "
                                                        >
                                                            {getRiskCategory(
                                                                risk
                                                            )}
                                                        </span>

                                                    </td>


                                                    {/* LEVEL */}

                                                    <td className="px-5 py-4">

                                                        <span
                                                            className="
                                                                inline-flex
                                                                items-center
                                                                px-2.5
                                                                py-1
                                                                rounded-lg
                                                                bg-slate-50
                                                                border
                                                                border-slate-200
                                                                text-sm
                                                                font-semibold
                                                                text-slate-800
                                                            "
                                                        >
                                                            {getRiskLevel(
                                                                risk
                                                            )}
                                                        </span>

                                                    </td>


                                                    {/* SCORE */}

                                                    <td className="px-5 py-4">

                                                        <span
                                                            className="
                                                                text-lg
                                                                font-bold
                                                                text-slate-900
                                                            "
                                                        >
                                                            {getRiskScore(
                                                                risk
                                                            )}
                                                        </span>

                                                    </td>


                                                    {/* KRI */}

                                                    <td className="px-5 py-4">

                                                        {kri ? (

                                                            <div>

                                                                <p
                                                                    className="
                                                                        text-sm
                                                                        font-bold
                                                                        text-slate-900
                                                                    "
                                                                >
                                                                    {kri.kriId ||
                                                                        "-"}
                                                                </p>

                                                                <p
                                                                    className="
                                                                        text-xs
                                                                        text-slate-400
                                                                        mt-1
                                                                        max-w-[180px]
                                                                        truncate
                                                                    "
                                                                >
                                                                    {kri.kriName ||
                                                                        "-"}
                                                                </p>

                                                            </div>

                                                        ) : (

                                                            <span
                                                                className="
                                                                    text-xs
                                                                    font-semibold
                                                                    text-slate-400
                                                                "
                                                            >
                                                                Not Assigned
                                                            </span>

                                                        )}

                                                    </td>


                                                    {/* KRI VALUE */}

                                                    <td className="px-5 py-4">

                                                        {kri ? (

                                                            <div>

                                                                <p
                                                                    className="
                                                                        text-base
                                                                        font-bold
                                                                        text-slate-900
                                                                    "
                                                                >
                                                                    {getDisplayValue(
                                                                        kri.currentValue
                                                                    )}
                                                                </p>

                                                                {kri.unit && (

                                                                    <p
                                                                        className="
                                                                            text-[10px]
                                                                            text-slate-400
                                                                            mt-0.5
                                                                        "
                                                                    >
                                                                        {getDisplayValue(
                                                                            kri.unit
                                                                        )}
                                                                    </p>

                                                                )}

                                                            </div>

                                                        ) : (

                                                            "-"

                                                        )}

                                                    </td>


                                                    {/* KRI STATUS */}

                                                    <td className="px-5 py-4">

                                                        {kri ? (

                                                            <StageBadge
                                                                status={
                                                                    kri.status
                                                                }
                                                            />

                                                        ) : (

                                                            <span
                                                                className="
                                                                    text-xs
                                                                    text-slate-400
                                                                "
                                                            >
                                                                -
                                                            </span>

                                                        )}

                                                    </td>


                                                    {/* ================================================= */}
                                                    {/* MITIGATION */}
                                                    {/* ================================================= */}

                                                    <td className="px-5 py-4">

{(
    risk?.mitigationCode ||
    risk?.mitigationPlan ||
    risk?.mitigations?.length > 0
) ? (

    <div>

        {/* ================= MITIGATION ID ================= */}

        <p className="
            text-sm
            font-bold
            text-slate-900
        ">
            {
                risk?.mitigationCode ||
                risk?.mitigations?.[0]?.mitigationId ||
                "Mitigation"
            }
        </p>


        {/* ================= MITIGATION TITLE ================= */}

        <p className="
            text-xs
            text-slate-400
            mt-1
            max-w-[220px]
            truncate
        ">
            {
                risk?.mitigationPlan ||
                risk?.mitigations?.[0]?.mitigationTitle ||
                "-"
            }
        </p>

    </div>

) : (

    <span className="
        text-xs
        font-semibold
        text-slate-400
    ">
        Not Assigned
    </span>

)}

</td>

                                                    {/* ================================================= */}
                                                    {/* MITIGATION STATUS */}
                                                    {/* ================================================= */}

                                                    <td className="px-5 py-4">

{risk?.mitigationStatus ? (

    <StageBadge
        status={risk.mitigationStatus}
    />

) : (

    <span className="
        text-xs
        text-slate-400
    ">
        -
    </span>

)}

</td>


                                                    {/* DEPARTMENT */}

                                                    <td className="px-5 py-4">

                                                        <span
                                                            className="
                                                                text-sm
                                                                text-slate-700
                                                            "
                                                        >
                                                            {getDisplayValue(risk.department) ||
                                                                "-"}
                                                        </span>

                                                    </td>


                                                    {/* RISK STATUS */}

                                                    <td className="px-5 py-4">
                                                        {(() => {
                                                            const currentStatus =
                                                                normalizeStatus(getRiskStatus(risk));
                                                            const riskId =
                                                                risk?.id ?? risk?.riskId;
                                                            const isUpdating =
                                                                updatingRiskId === riskId;
                                                            const isCaeLocked =
                                                                isCaeLockedRisk(risk);
                                                            const canEditStatus =
                                                                isAuditManagerUser() && !isCaeLocked;

                                                            const statusTheme = {
                                                                NEW: "bg-slate-50 text-slate-700 border-slate-200",
                                                                ANALYZED: "bg-blue-50 text-blue-700 border-blue-200",
                                                                APPROVED: "bg-indigo-50 text-indigo-700 border-indigo-200",
                                                                IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
                                                                MITIGATED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                                                                VERIFIED: "bg-teal-50 text-teal-700 border-teal-200",
                                                                COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                                                                CLOSED: "bg-emerald-50 text-emerald-700 border-emerald-200",
                                                            };

                                                            const currentLabel =
                                                                RISK_STATUS_LABELS[currentStatus] ||
                                                                currentStatus.replaceAll("_", " ") ||
                                                                "Unknown";

                                                            return (
                                                                <div className="min-w-[155px]">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            canEditStatus &&
                                                                            !isUpdating &&
                                                                            setStatusPopupRisk(risk)
                                                                        }
                                                                        disabled={!canEditStatus || isUpdating}
                                                                        className={`
                                                                            inline-flex items-center gap-2 rounded-full
                                                                            border px-3 py-1.5 text-xs font-bold
                                                                            transition-all duration-200
                                                                            ${statusTheme[currentStatus] ||
                                                                            "bg-slate-50 text-slate-700 border-slate-200"}
                                                                            ${canEditStatus
                                                                                ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-sm"
                                                                                : "cursor-default"}
                                                                            disabled:opacity-70
                                                                        `}
                                                                        title={
                                                                            canEditStatus
                                                                                ? "Click to update risk status"
                                                                                : isCaeLocked
                                                                                    ? "Finalized by CAE"
                                                                                    : "View only"
                                                                        }
                                                                    >
                                                                        <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                                                                        <span>{currentLabel}</span>
                                                                        {canEditStatus && (
                                                                            <ChevronRight className="h-3.5 w-3.5 rotate-90 opacity-60" />
                                                                        )}
                                                                    </button>

                                                                    {isUpdating && (
                                                                        <div className="mt-1.5 inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                                                                            <Loader2 className="h-3 w-3 animate-spin" />
                                                                            Updating...
                                                                        </div>
                                                                    )}

                                                                    {isCaeLocked && (
                                                                        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                                                                            <CheckCircle2 className="h-3 w-3" />
                                                                            Finalized by CAE
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>


                                                    {/* LIFECYCLE */}
                                                    {/* ================================================= */}

                                                    <td className="px-5 py-4">

                                                        <div
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-1
                                                            "
                                                        >

                                                            {[
                                                                "risk",
                                                                "kri",
                                                                "mitigation",
                                                                "audit",
                                                                "finding",
                                                                "auditor",
                                                                "auditee",
                                                                "evidence",
                                                                "compliance",
                                                                "recommendation",
                                                            ].map(
                                                                (
                                                                    stage
                                                                ) => {

                                                                    const stageConfig =
                                                                        TRACKING_STAGES.find(
                                                                            (
                                                                                x
                                                                            ) =>
                                                                                x.key ===
                                                                                stage
                                                                        );


                                                                    if (
                                                                        !stageConfig
                                                                    ) {

                                                                        return null;

                                                                    }


                                                                    let status;

                                                                    let state;


                                                                    if (
                                                                        stage ===
                                                                        "kri"
                                                                    ) {

                                                                        status =
                                                                            risk.kriStatus;

                                                                        state =
                                                                            getKriStageStatus(
                                                                                risk
                                                                            );

                                                                    } else {

                                                                        status =
                                                                            risk?.[
                                                                                stageConfig.statusField
                                                                            ];

                                                                        state =
                                                                            getStageStatus(
                                                                                status
                                                                            );

                                                                    }


                                                                    return (

                                                                        <span
                                                                            key={
                                                                                stage
                                                                            }
                                                                            title={`${stageConfig.label}: ${state}`}
                                                                            className={`
                                                                                w-2.5
                                                                                h-2.5
                                                                                rounded-full
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


                                                            <span
                                                                className="
                                                                    text-[10px]
                                                                    text-slate-400
                                                                    ml-1
                                                                "
                                                            >
                                                                {TRACKING_STAGES.length}
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td className="px-5 py-4">

                                                        <button
                                                            onClick={() =>
                                                                setSelectedRisk(
                                                                    risk
                                                                )
                                                            }
                                                            className="
                                                                inline-flex
                                                                items-center
                                                                gap-2
                                                                px-3
                                                                py-2
                                                                rounded-lg
                                                                bg-slate-900
                                                                text-white
                                                                text-xs
                                                                font-semibold
                                                                hover:bg-slate-800
                                                                transition
                                                            "
                                                        >

                                                            <Eye
                                                                className="
                                                                    w-3.5
                                                                    h-3.5
                                                                "
                                                            />

                                                            Track

                                                        </button>

                                                    </td>

                                                </motion.tr>

                                            );

                                        }
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </motion.div>

            </div>


            {/* ================================================= */}
            {/* STATUS UPDATE POPUP */}
            {/* ================================================= */}

            <RiskStatusPopup
                risk={statusPopupRisk}
                updatingRiskId={updatingRiskId}
                onClose={() => setStatusPopupRisk(null)}
                onStatusChange={async (risk, nextStatus) => {
                    await handleRiskStatusChange(risk, nextStatus);
                    setStatusPopupRisk(null);
                }}
            />

            {/* ================================================= */}
            {/* TRACKING MODAL */}
            {/* ================================================= */}

            {selectedRisk && (

                <RiskTrackingModal
                    risk={
                        selectedRisk
                    }
                    onClose={() =>
                        setSelectedRisk(
                            null
                        )
                    }
                />

            )}

        </div>
    );
};


// ============================================================
// RISK STATUS POPUP
// ============================================================

const RiskStatusPopup = ({
    risk,
    updatingRiskId,
    onClose,
    onStatusChange,
}) => {
    if (!risk) return null;

    const currentStatus = normalizeStatus(getRiskStatus(risk));
    const riskId = risk?.id ?? risk?.riskId;
    const isUpdating = updatingRiskId === riskId;
    const isLocked = isCaeLockedRisk(risk);

    const statusTheme = {
        NEW: "bg-slate-50 text-slate-700 border-slate-200",
        ANALYZED: "bg-blue-50 text-blue-700 border-blue-200",
        APPROVED: "bg-indigo-50 text-indigo-700 border-indigo-200",
        IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
        MITIGATED: "bg-emerald-50 text-emerald-700 border-emerald-200",
        VERIFIED: "bg-teal-50 text-teal-700 border-teal-200",
        COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
        CLOSED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };

    const remainingStatuses = MANAGER_EDITABLE_RISK_STATUSES.filter(
        (status) => status !== currentStatus
    );

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onMouseDown={(e) => {
                    if (e.target === e.currentTarget && !isUpdating) onClose();
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                >
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                Risk Status
                            </p>
                            <h3 className="mt-1 text-base font-bold text-slate-900">
                                Update risk status
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-400">
                                {risk?.riskId || risk?.id || "Risk"}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isUpdating}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="px-5 py-5">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Current status
                            </p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                                <span
                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                                        statusTheme[currentStatus] ||
                                        "bg-slate-50 text-slate-700 border-slate-200"
                                    }`}
                                >
                                    <span className="h-2 w-2 rounded-full bg-current opacity-70" />
                                    {RISK_STATUS_LABELS[currentStatus] || currentStatus}
                                </span>

                                {isLocked && (
                                    <span className="text-[10px] font-bold text-emerald-700">
                                        CAE Finalized
                                    </span>
                                )}
                            </div>
                        </div>

                        {isLocked ? (
                            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                                <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600" />
                                <p className="mt-2 text-sm font-bold text-emerald-800">
                                    Risk finalized by CAE
                                </p>
                                <p className="mt-1 text-xs text-emerald-700">
                                    Audit Manager status updates are locked.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="mt-5 flex items-center justify-between">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                        Remaining statuses
                                    </p>
                                    <span className="text-[10px] text-slate-400">
                                        Click one to update
                                    </span>
                                </div>

                                <div className="mt-2 space-y-2">
                                    {remainingStatuses.length ? (
                                        remainingStatuses.map((status) => (
                                            <button
                                                key={status}
                                                type="button"
                                                disabled={isUpdating}
                                                onClick={() => onStatusChange(risk, status)}
                                                className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <span className="flex items-center gap-3">
                                                    <span className={`h-2.5 w-2.5 rounded-full ${
                                                        status === "APPROVED" ? "bg-indigo-500" :
                                                        status === "IN_PROGRESS" ? "bg-amber-500" :
                                                        status === "MITIGATED" ? "bg-emerald-500" :
                                                        status === "VERIFIED" ? "bg-teal-500" :
                                                        status === "ANALYZED" ? "bg-blue-500" :
                                                        "bg-slate-400"
                                                    }`} />
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {RISK_STATUS_LABELS[status] || status}
                                                    </span>
                                                </span>
                                                {isUpdating ? (
                                                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
                                                )}
                                            </button>
                                        ))
                                    ) : (
                                        <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-400">
                                            No remaining Audit Manager statuses.
                                        </p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};


// ============================================================
// STAT CARD
// ============================================================

const RiskStat = ({
    title,
    value,
    subtitle,
    icon: Icon,
}) => {

    return (

        <motion.div
            variants={itemVariants}
            whileHover={{
                y: -4,
            }}
            className="
                relative
                overflow-hidden
                rounded-2xl
                bg-white
                border
                border-slate-200
                shadow-sm
                p-5
            "
        >

            <div
                className="
                    absolute
                    -right-8
                    -top-8
                    w-24
                    h-24
                    rounded-full
                    bg-slate-50
                "
            />

            <div
                className="
                    relative
                    flex
                    items-start
                    justify-between
                "
            >

                <div>

                    <p
                        className="
                            text-sm
                            font-medium
                            text-slate-500
                        "
                    >
                        {title}
                    </p>

                    <h3
                        className="
                            mt-2
                            text-3xl
                            font-bold
                            text-slate-900
                        "
                    >
                        {value}
                    </h3>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-slate-400
                        "
                    >
                        {subtitle}
                    </p>

                </div>

                <div
                    className="
                        w-11
                        h-11
                        rounded-xl
                        bg-slate-100
                        flex
                        items-center
                        justify-center
                    "
                >

                    <Icon
                        className="
                            w-5
                            h-5
                            text-slate-700
                        "
                    />

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

        <th
            className="
                text-left
                px-5
                py-3
                text-xs
                font-semibold
                text-slate-500
                uppercase
                tracking-wide
            "
        >
            {children}
        </th>

    );
};

export default RiskManagement;