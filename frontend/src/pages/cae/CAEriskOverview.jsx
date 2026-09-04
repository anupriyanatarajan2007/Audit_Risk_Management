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
    ChevronDown,
} from "lucide-react";
import EvidenceService from "../../service/EvidenceService";
import { getFindingsByAuditId } from "../../service/FindingService";
import RiskService from "../../service/RiskService";
import KriService from "../../service/KriService";
import MitigationService from "../../service/MitigationService";
import { getAssignmentsByRiskId } from "../../service/RiskAuditorAssignments";
import AuditService from '../../service/AuditService';
import auditeeAssignmentService from "../../service/auditeeAssignmentService";
import { getRecommendationsForFinding } from "../../service/RecommendationService";
import ReviewService from "../../service/ReviewService";
// ============================================================
// ANIMATIONS
// ============================================================

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

// ============================================================
// RISK STATUS OPTIONS AUDIT MANAGER IS ALLOWED TO SET
//
// Backend RiskStatus enum has 9 values total (NEW, ANALYZED,
// APPROVED, IN_PROGRESS, MITIGATED, VERIFIED, REOPENED, CLOSED,
// REJECTED) but the Audit Manager role should only ever move a
// risk into one of these four — the rest belong to other roles
// / earlier lifecycle stages.
// ============================================================

const MANAGER_EDITABLE_RISK_STATUSES = [
   "CLOSED",
   "REJECTED"
];



// ============================================================
// COMPLIANCE REVIEWS
// ============================================================

const attachComplianceReviewsToRisks = async (risks) => {
    if (!Array.isArray(risks) || risks.length === 0) {
        return risks;
    }

    const updatedRisks = await Promise.all(
        risks.map(async (risk) => {
            try {
                // Backend Audit entity ID is Long
                const auditDbId = risk.auditDbId;

                console.log(
                    "COMPLIANCE -> Audit DB ID:",
                    auditDbId,
                    "TYPE:",
                    typeof auditDbId
                );

                if (
                    auditDbId === null ||
                    auditDbId === undefined
                ) {
                    return {
                        ...risk,
                        complianceReviews: [],
                        complianceReviewCode: null,
                        complianceStatus: null,
                    };
                }

                const response =
                    await ReviewService.getReviewsByAudit(
                        auditDbId
                    );

                console.log(
                    "🔥 COMPLIANCE REVIEW RESPONSE:",
                    response
                );

                let reviews = [];

                if (Array.isArray(response)) {
                    reviews = response;
                } else if (
                    Array.isArray(response?.data)
                ) {
                    reviews = response.data;
                } else if (
                    Array.isArray(response?.content)
                ) {
                    reviews = response.content;
                } else if (
                    Array.isArray(response?.reviews)
                ) {
                    reviews = response.reviews;
                } else if (
                    Array.isArray(response?.data?.content)
                ) {
                    reviews = response.data.content;
                } else if (
                    response &&
                    typeof response === "object"
                ) {
                    reviews = [response];
                }

                console.log(
                    `🔥 COMPLIANCE REVIEWS FOR AUDIT DB ID ${auditDbId}:`,
                    reviews
                );

                const latestReview =
                    reviews.length > 0
                        ? reviews[reviews.length - 1]
                        : null;

                return {
                    ...risk,

                    complianceReviews: reviews,

                    complianceReviewCode:
                        latestReview?.reviewId ??
                        latestReview?.reviewCode ??
                        latestReview?.complianceReviewCode ??
                        null,

                    complianceStatus:
                        latestReview?.status ??
                        latestReview?.complianceStatus ??
                        null,

                    complianceReviewerId:
                        latestReview?.reviewerId ??
                        latestReview?.reviewer?.userId ??
                        null,

                    complianceReviewerName:
                        latestReview?.reviewerName ??
                        latestReview?.reviewer?.name ??
                        null,

                    complianceReviewerEmail:
                        latestReview?.reviewerEmail ??
                        latestReview?.reviewer?.email ??
                        null,

                    complianceScore:
                        latestReview?.complianceScore ??
                        latestReview?.score ??
                        null,

                    complianceComments:
                        latestReview?.comments ??
                        latestReview?.remarks ??
                        null,

                    complianceReviewDate:
                        latestReview?.reviewDate ??
                        latestReview?.reviewedDate ??
                        null,

                    complianceCreatedAt:
                        latestReview?.createdAt ??
                        null,

                    complianceUpdatedAt:
                        latestReview?.updatedAt ??
                        null,
                };
            } catch (error) {
                console.error(
                    `Failed to load compliance review for audit ${risk.auditDbId}:`,
                    error
                );

                return {
                    ...risk,
                    complianceReviews: [],
                    complianceReviewCode: null,
                    complianceStatus: null,
                };
            }
        })
    );

    return updatedRisks;
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

            // Load recommendations independently for EVERY finding.
            const findingsWithRecommendations = await Promise.all(
                findings.map(async (finding) => {
                    const findingId = getFindingId(finding);
                    const recommendations = await loadRecommendationsForFinding(findingId);
                    return {
                        ...finding,
                        recommendations,
                        recommendationList: recommendations,
                    };
                })
            );

            const allRecommendations = findingsWithRecommendations.flatMap(
                (finding) => Array.isArray(finding.recommendations) ? finding.recommendations : []
            );
            const firstRecommendation = allRecommendations[0] ?? null;

            return {
                ...risk,
                findings: findingsWithRecommendations,
                findingList: findingsWithRecommendations,
                recommendations: allRecommendations,
                recommendationList: allRecommendations,
                recommendationDbId: firstRecommendation?.id ?? null,
                recommendationCode: firstRecommendation?.recommendationId ?? null,
                recommendationText: firstRecommendation?.recommendationText ?? null,
                recommendationStatus: firstRecommendation?.status ?? null,
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

            // NUMERIC database id, not the string code ("AUD-001").
            const auditId = risk?.auditDbId;

            const evidenceList = await loadEvidenceForAudit(auditId);

            const firstEvidence =
                evidenceList.length > 0
                    ? evidenceList[0]
                    : null;

            console.log(
                "FIRST EVIDENCE FOR AUDIT",
                auditId,
                ":",
                firstEvidence
            );

            return {
                ...risk,

                evidenceList,
                evidenceItems: evidenceList,

                // Keep every evidence item; the modal filters by findingId when
                // the backend response provides a finding relationship.
                evidenceByFinding: evidenceList.reduce((map, item) => {
                    const findingId = getRelatedFindingId(item);
                    if (findingId !== null && findingId !== undefined) {
                        const key = String(findingId);
                        if (!map[key]) map[key] = [];
                        map[key].push(item);
                    }
                    return map;
                }, {}),

                // matches TRACKING_STAGES idField "evidenceCode"
                evidenceCode:
                    firstEvidence?.id ?? null,

                evidenceFileName:
                    firstEvidence?.fileName ?? null,

                evidenceFileUrl:
                    firstEvidence
                        ? EvidenceService.getEvidenceFileUrl(firstEvidence)
                        : null,

                evidenceDescription:
                    firstEvidence?.description ?? null,

                // matches TRACKING_STAGES statusField "evidenceStatus"
                evidenceStatus:
                    firstEvidence?.status ?? null,

                evidenceUploadedAt:
                    firstEvidence?.uploadedAt ?? null,

                // Nested User entity — field names guessed defensively;
                // check the console log and adjust if different.
                evidenceUploadedByName:
                    firstEvidence?.uploadedBy?.name ??
                    firstEvidence?.uploadedBy?.fullName ??
                    null,

                evidenceUploadedByEmployeeId:
                    firstEvidence?.uploadedBy?.employeeId ??
                    firstEvidence?.uploadedBy?.id ??
                    null,

                evidenceUploadedByEmail:
                    firstEvidence?.uploadedBy?.email ??
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

            // NUMERIC database id, not the string code ("AUD-001").
            // getFindingsByAuditId hits /api/findings/audit/{auditId}
            // and your findings table's audit_id column is numeric.
            const auditId = risk?.auditDbId;

            const findings = await loadFindingsForAudit(auditId);

            const firstFinding =
                findings.length > 0
                    ? findings[0]
                    : null;

            console.log(
                "FIRST FINDING FOR AUDIT",
                auditId,
                ":",
                firstFinding
            );

            return {
                ...risk,

                findings,
                findingList: findings,

                findingDbId:
                    firstFinding?.id ?? null,

                findingCode:
                    firstFinding?.id ?? null,

                findingTitle:
                    firstFinding?.title ?? null,

                findingDescription:
                    firstFinding?.observation ?? null,

                findingSeverity:
                    firstFinding?.riskLevel ?? null,

                findingRecommendation:
                    firstFinding?.recommendation ?? null,

                findingStatus:
                    firstFinding?.status ?? null,

                findingAuditorName:
                    firstFinding?.auditorName ?? null,

                findingAuditId:
                    firstFinding?.auditId ?? null,

                findingAuditName:
                    firstFinding?.auditName ?? null,

                findingCreatedAt:
                    firstFinding?.createdAt ?? null,

                findingUpdatedAt:
                    firstFinding?.updatedAt ?? null,
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
            "RED",
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

const getUserDepartment = () => {
    const user = getLoggedInUser();

    if (user) {
        const department =
            user.department ||
            user.departmentName ||
            user.profile?.department ||
            user.profile?.departmentName;

        if (department) {
            return department;
        }
    }

    const directDepartment =
        localStorage.getItem("department");

    if (directDepartment) {
        return directDepartment;
    }

    return null;
};

// ============================================================
// DEPARTMENT DISPLAY NAME
//
// Department is a backend entity shaped as { id, name }, not a
// plain string. This safely pulls out a printable name whether
// we're handed the entity object, a legacy string value, or
// nothing at all — so we never render "[object Object]".
// ============================================================

const getDepartmentDisplayName = (dept) => {
    if (dept === null || dept === undefined || dept === "") {
        return null;
    }

    if (typeof dept === "object") {
        return (
            dept.name ??
            dept.departmentName ??
            null
        );
    }

    return dept;
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
// FINDING / EVIDENCE / RECOMMENDATION HELPERS
// ============================================================

const getFindingId = (finding) =>
    finding?.id ??
    finding?.findingId ??
    finding?.findingCode ??
    null;

const getFindingTitle = (finding) =>
    finding?.title ??
    finding?.findingTitle ??
    "Untitled Finding";

const getFindingSeverity = (finding) =>
    finding?.riskLevel ??
    finding?.severity ??
    finding?.findingSeverity ??
    "-";

const getFindingStatusValue = (finding) =>
    finding?.status ??
    finding?.findingStatus ??
    "-";

const getFindingObservation = (finding) =>
    finding?.observation ??
    finding?.description ??
    finding?.findingDescription ??
    "-";

const getFindingRecommendation = (finding) =>
    finding?.recommendation ??
    finding?.findingRecommendation ??
    "-";

const getRelatedFindingId = (item) =>
    item?.findingId ??
    item?.finding?.id ??
    item?.finding?.findingId ??
    item?.finding?.findingCode ??
    item?.relatedFindingId ??
    null;

const FindingSelector = ({ findings, selectedFindingId, onChange }) => {
    return (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                            Common Finding Selector
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-slate-900">
                            Select a finding to view its related details
                        </p>
                    </div>
                </div>
                <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                    {findings.length} {findings.length === 1 ? "Finding" : "Findings"}
                </span>
            </div>

            {findings.length > 0 ? (
                <div className="relative mt-4">
                    <select
                        value={selectedFindingId ?? ""}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-emerald-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    >
                        {findings.map((finding, index) => {
                            const id = String(getFindingId(finding) ?? index);
                            return (
                                <option key={id} value={id}>
                                    Finding #{index + 1} — {getFindingTitle(finding)} ({getFindingSeverity(finding)})
                                </option>
                            );
                        })}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                </div>
            ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                    No findings are available for this audit.
                </div>
            )}
        </div>
    );
};

const FindingStageDetails = ({ risk, selectedFindingId, onFindingChange }) => {
    const findings = Array.isArray(risk?.findings)
        ? risk.findings
        : Array.isArray(risk?.findingList)
            ? risk.findingList
            : [];

    const finding = findings.find(
        (item, index) => String(getFindingId(item) ?? index) === String(selectedFindingId)
    ) ?? findings[0];

    if (!finding) {
        return (
            <div>
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Audit Findings</h3>
                        <p className="text-xs text-slate-400">Finding-level details</p>
                    </div>
                </div>
                <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                    No findings recorded for this audit.
                </div>
            </div>
        );
    }

    const selectedId = String(getFindingId(finding) ?? "");

    return (
        <div>
            <FindingSelector
                findings={findings}
                selectedFindingId={selectedId}
                onChange={onFindingChange}
            />

            <motion.div
                key={selectedId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
                <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Selected Finding
                            </p>
                            <h3 className="mt-1 text-lg font-bold text-slate-900">
                                {getFindingTitle(finding)}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-600">
                                ID: {getDisplayValue(getFindingId(finding))}
                            </span>
                            <StageBadge status={getFindingStatusValue(finding)} />
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 p-5 md:grid-cols-2">
                    {[
                        ["Finding ID", getFindingId(finding)],
                        ["Finding Title", getFindingTitle(finding)],
                        ["Severity", getFindingSeverity(finding)],
                        ["Status", getFindingStatusValue(finding)],
                        ["Auditor", finding?.auditorName ?? finding?.auditor?.name ?? finding?.auditorEmployeeId],
                        ["Audit", finding?.auditName ?? finding?.audit?.auditName ?? finding?.auditId ?? risk?.auditTitle],
                        ["Created At", finding?.createdAt],
                        ["Updated At", finding?.updatedAt],
                    ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                            <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                                {getDisplayValue(value)}
                            </p>
                        </div>
                    ))}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Observation</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {getDisplayValue(getFindingObservation(finding))}
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Finding Recommendation</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {getDisplayValue(getFindingRecommendation(finding))}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const EvidenceStageDetails = ({ risk, selectedFindingId, onFindingChange }) => {
    const findings = Array.isArray(risk?.findings) ? risk.findings : [];
    const allEvidence = Array.isArray(risk?.evidenceItems)
        ? risk.evidenceItems
        : Array.isArray(risk?.evidenceList)
            ? risk.evidenceList
            : [];

    const selectedFinding = findings.find(
        (item, index) => String(getFindingId(item) ?? index) === String(selectedFindingId)
    ) ?? findings[0];

    const selectedId = selectedFinding ? String(getFindingId(selectedFinding) ?? "") : "";
    const linkedEvidence = allEvidence.filter((item) => {
        const relatedId = getRelatedFindingId(item);
        return relatedId !== null && relatedId !== undefined && String(relatedId) === selectedId;
    });
    const hasFindingLinks = allEvidence.some((item) => getRelatedFindingId(item) !== null && getRelatedFindingId(item) !== undefined);
    const evidence = hasFindingLinks ? linkedEvidence : allEvidence;

    const getEvidenceUrl = (item) => {
        try {
            if (EvidenceService?.getEvidenceFileUrl) {
                const url = EvidenceService.getEvidenceFileUrl(item);
                if (url) return url;
            }
        } catch (error) {
            console.warn("Could not build evidence URL:", error);
        }
        return item?.fileUrl ?? item?.fileURL ?? item?.url ?? item?.evidenceFileUrl ?? null;
    };

    const getFileName = (item) => item?.fileName ?? item?.filename ?? item?.name ?? item?.originalFileName ?? "Evidence file";

    return (
        <div>
            <FindingSelector
                findings={findings}
                selectedFindingId={selectedId}
                onChange={onFindingChange}
            />

            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <FileCheck2 className="h-5 w-5 text-emerald-600" />
                        <h3 className="text-lg font-bold text-slate-900">Evidence Details</h3>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                        Evidence related to {selectedFinding ? getFindingTitle(selectedFinding) : "the selected finding"}
                    </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                    {evidence.length} Evidence
                </span>
            </div>

            {evidence.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <FileCheck2 className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-slate-600">
                        No evidence linked to this finding
                    </p>
                </div>
            ) : (
                <motion.div
                    key={selectedId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    {evidence.map((item, index) => {
                        const url = getEvidenceUrl(item);
                        const fileName = getFileName(item);
                        return (
                            <div key={item?.id ?? `${fileName}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xs font-bold text-emerald-700">
                                            #{index + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-slate-900">{fileName}</p>
                                            <p className="text-xs text-slate-500">Evidence ID: {item?.id ?? "—"}</p>
                                        </div>
                                    </div>
                                    {url && (
                                        <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                                            <Eye className="h-3.5 w-3.5" /> Open File
                                        </a>
                                    )}
                                </div>
                                <div className="grid gap-4 p-5 md:grid-cols-2">
                                    {[
                                        ["Finding", item?.findingTitle ?? item?.finding?.title ?? getFindingTitle(selectedFinding)],
                                        ["Status", item?.status],
                                        ["Description", item?.description],
                                        ["Uploaded By", item?.uploadedBy?.name ?? item?.uploadedBy?.fullName ?? item?.uploadedByName],
                                        ["Uploaded At", item?.uploadedAt ?? item?.createdAt],
                                    ].map(([label, value]) => (
                                        <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                                            <p className="mt-1 break-words text-sm font-semibold text-slate-800">{getDisplayValue(value)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
};

// ============================================================
// RISK TRACKING MODAL
// ============================================================

const RiskTrackingModal = ({ risk, onClose, onStatusUpdated }) => {
    const [selectedStage, setSelectedStage] = useState("risk");
    const findings = Array.isArray(risk?.findings) ? risk.findings : [];
    const [selectedFindingId, setSelectedFindingId] = useState(
        findings.length > 0 ? String(getFindingId(findings[0]) ?? 0) : ""
    );

    useEffect(() => {
        if (findings.length === 0) {
            setSelectedFindingId("");
            return;
        }
        const exists = findings.some(
            (finding, index) => String(getFindingId(finding) ?? index) === String(selectedFindingId)
        );
        if (!exists) {
            setSelectedFindingId(String(getFindingId(findings[0]) ?? 0));
        }
    }, [risk, findings.length]);

    const [riskStatusDraft, setRiskStatusDraft] = useState(
        String(getRiskStatus(risk) || "").toUpperCase()
    );
    const [updatingRiskStatus, setUpdatingRiskStatus] = useState(false);
    const [riskStatusError, setRiskStatusError] = useState("");
    const currentRiskStatus = String(getRiskStatus(risk) || "").toUpperCase();

    const handleUpdateRiskStatus = async () => {
        if (!risk || !riskStatusDraft || riskStatusDraft === currentRiskStatus) return;
        try {
            setUpdatingRiskStatus(true);
            setRiskStatusError("");
            const targetId = risk?.id ?? risk?.riskDbId ?? risk?.riskId;
            const updated = await RiskService.updateRiskStatus(targetId, { status: riskStatusDraft });
            const nextRisk = updated || { ...risk, riskStatus: riskStatusDraft, status: riskStatusDraft };
            onStatusUpdated?.(nextRisk);
        } catch (error) {
            console.error("Failed to update risk status:", error);
            setRiskStatusError(error.response?.data?.message || "Failed to update status. Please try again.");
        } finally {
            setUpdatingRiskStatus(false);
        }
    };

    const selectedFinding = findings.find(
        (finding, index) => String(getFindingId(finding) ?? index) === String(selectedFindingId)
    ) ?? findings[0];

    const selectedRecommendations = Array.isArray(selectedFinding?.recommendations)
        ? selectedFinding.recommendations
        : Array.isArray(selectedFinding?.recommendationList)
            ? selectedFinding.recommendationList
            : [];

    const renderRecommendationDetails = () => (
        <div>
            <FindingSelector
                findings={findings}
                selectedFindingId={selectedFinding ? String(getFindingId(selectedFinding) ?? "") : ""}
                onChange={setSelectedFindingId}
            />
            <motion.div
                key={String(getFindingId(selectedFinding) ?? "none")}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                        <GitBranch className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">Recommendation Details</h3>
                        <p className="text-xs text-slate-400">
                            Recommendations for {selectedFinding ? getFindingTitle(selectedFinding) : "selected finding"}
                        </p>
                    </div>
                </div>

                {selectedRecommendations.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                        No recommendations found for this finding.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {selectedRecommendations.map((recommendation, index) => (
                            <div key={recommendation?.id ?? recommendation?.recommendationId ?? index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recommendation #{index + 1}</p>
                                        <h4 className="mt-1 text-base font-bold text-slate-900">
                                            {recommendation?.recommendationId ?? recommendation?.id ?? "—"}
                                        </h4>
                                    </div>
                                    <StageBadge status={recommendation?.status ?? recommendation?.recommendationStatus} />
                                </div>
                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    {[
                                        ["Recommendation", recommendation?.recommendationText ?? recommendation?.text ?? recommendation?.description],
                                        ["Finding", recommendation?.findingTitle ?? getFindingTitle(selectedFinding)],
                                        ["Audit", recommendation?.auditName ?? recommendation?.auditTitle ?? risk?.auditTitle],
                                        ["Internal Auditor", recommendation?.internalAuditorName],
                                        ["Auditee", recommendation?.auditeeName],
                                        ["Auditee Email", recommendation?.auditeeEmail],
                                        ["Created At", recommendation?.createdAt],
                                        ["Updated At", recommendation?.updatedAt],
                                    ].map(([label, value]) => (
                                        <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                                            <p className="mt-1 break-words whitespace-pre-wrap text-sm font-semibold text-slate-800">{getDisplayValue(value)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );

    const renderStageDetails = () => {
        switch (selectedStage) {
            case "risk":
                return <StageDetails title="Risk Details" icon={ShieldAlert} items={[
                    ["Risk ID", risk.riskId], ["Title", risk.title], ["Description", risk.description],
                    ["Category", getRiskCategory(risk)], ["Risk Level", getRiskLevel(risk)], ["Likelihood", risk.likelihood],
                    ["Impact", risk.impact], ["Risk Score", getRiskScore(risk)], ["Status", getRiskStatus(risk)],
                    ["Department", risk.department], ["Business Unit", risk.businessUnit], ["Process", risk.processName],
                    ["Control Owner", risk.controlOwner], ["Existing Controls", risk.existingControls], ["Mitigation Plan", risk.mitigationPlan],
                    ["Target Closure", risk.targetClosureDate], ["Mitigation Update", risk.mitigationUpdate], ["Actual Closure", risk.actualClosureDate],
                    ["Remarks", risk.remarks], ["Identified By", risk.identifiedByName], ["Assigned To", risk.assignedToName],
                    ["Created At", risk.createdAt], ["Updated At", risk.updatedAt],
                ]} />;
            case "kri": return <KriStageDetails risk={risk} />;
            case "mitigation": return <MitigationStageDetails risk={risk} />;
            case "audit": return <StageDetails title="Audit Details" icon={FileText} items={[
                ["Audit ID", risk.auditCode], ["Audit Name", risk.auditTitle], ["Status", risk.auditStatus],
                ["Department", risk.auditDepartment], ["Business Unit", risk.auditBusinessUnit], ["Process", risk.auditProcessName],
                ["Start Date", risk.auditStartDate], ["End Date", risk.auditEndDate], ["Internal Auditor", risk.auditInternalAuditorName],
                ["Auditee", risk.auditAuditeeName], ["Description", risk.auditDescription], ["Created At", risk.auditCreatedAt], ["Updated At", risk.auditUpdatedAt],
            ]} />;
            case "auditor": return <StageDetails title="Internal Auditor Assignment" icon={UserCheck} items={[
                ["Assignment ID", risk.auditorAssignmentId], ["Auditor", risk.auditorEmployeeId], ["Assignment Status", risk.auditorAssignmentStatus],
                ["Priority", risk.auditorAssignmentPriority], ["Assigned Date", risk.auditorAssignedDate], ["Start Date", risk.auditorStartDate],
                ["Due Date", risk.auditorDueDate], ["Email", risk.auditorEmail], ["Assigned By", risk.assignedByEmployeeId], ["Comments", risk.auditorComments],
            ]} />;
            case "auditee": return <StageDetails title="Auditee Assignment" icon={Users} items={[
                ["Assignment ID", risk.auditeeAssignmentId], ["Auditee", risk.auditeeEmployeeId], ["Auditee Name", risk.auditeeName],
                ["Assignment Status", risk.auditeeAssignmentStatus], ["Assigned Date", risk.auditeeAssignedDate], ["Start Date", risk.auditeeStartDate],
                ["Due Date", risk.auditeeDueDate], ["Email", risk.auditeeEmail], ["Assigned By", risk.auditeeAssignedByName],
            ]} />;
            case "finding": return <FindingStageDetails risk={risk} selectedFindingId={selectedFindingId} onFindingChange={setSelectedFindingId} />;
            case "evidence": return <EvidenceStageDetails risk={risk} selectedFindingId={selectedFindingId} onFindingChange={setSelectedFindingId} />;
            case "recommendation": return renderRecommendationDetails();
            case "compliance": return <StageDetails title="Compliance Review" icon={Layers3} items={[
                ["Compliance Review ID", risk.complianceReviewCode], ["Status", risk.complianceStatus], ["Reviewer ID", risk.complianceReviewerId],
                ["Reviewer Name", risk.complianceReviewerName], ["Reviewer Email", risk.complianceReviewerEmail], ["Compliance Score", risk.complianceScore],
                ["Review Date", risk.complianceReviewDate], ["Comments", risk.complianceComments], ["Created At", risk.complianceCreatedAt], ["Updated At", risk.complianceUpdatedAt],
            ]} />;
            default: return null;
        }
    };

    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" onClick={onClose}>
                <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 20 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-[1500px] max-h-[92vh] overflow-hidden rounded-3xl bg-slate-50 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white"><ShieldAlert className="h-5 w-5" /></div>
                            <div><p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Risk Tracking</p><h2 className="mt-0.5 text-xl font-bold text-slate-900">{risk.riskId || "-"}</h2></div>
                        </div>
                        <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"><X className="h-5 w-5" /></button>
                    </div>

                    <div className="max-h-[calc(92vh-80px)] overflow-y-auto p-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2"><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{risk.riskId || "RISK"}</span><StageBadge status={getRiskStatus(risk)} /></div>
                                    <h3 className="mt-3 text-xl font-bold text-slate-900">{risk.title || "Untitled Risk"}</h3>
                                    <p className="mt-1 text-sm text-slate-500">{getDepartmentDisplayName(risk.department) || "Department not specified"}</p>
                                </div>
                                <div className="grid shrink-0 grid-cols-2 gap-3 md:grid-cols-4">
                                    <SummaryCard label="Risk Score" value={getRiskScore(risk)} />
                                    <SummaryCard label="Risk Level" value={getRiskLevel(risk)} />
                                    <SummaryCard label="Findings" value={findings.length} />
                                    <SummaryCard label="KRI" value={risk.kriId || "Not Assigned"} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                            <h3 className="mb-3 text-sm font-bold text-slate-800">Update Risk Status</h3>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative flex-1">
                                    <select value={riskStatusDraft} onChange={(e) => setRiskStatusDraft(e.target.value)} disabled={updatingRiskStatus} className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-9 text-sm text-slate-700 outline-none focus:border-teal-500 disabled:opacity-60">
                                        {!MANAGER_EDITABLE_RISK_STATUSES.includes(currentRiskStatus) && <option value={currentRiskStatus} disabled>{currentRiskStatus} (current)</option>}
                                        {MANAGER_EDITABLE_RISK_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                                    </select>
                                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                </div>
                                <button onClick={handleUpdateRiskStatus} disabled={updatingRiskStatus || riskStatusDraft === currentRiskStatus} className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                                    {updatingRiskStatus ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Update Status
                                </button>
                            </div>
                            {riskStatusError && <p className="mt-2 text-xs text-red-600">{riskStatusError}</p>}
                        </div>

                        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div><h3 className="font-bold text-slate-900">Risk Lifecycle</h3><p className="mt-1 text-xs text-slate-400">Track the complete lifecycle of this risk</p></div>
                                <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-500"><Activity className="h-3.5 w-3.5" /> {TRACKING_STAGES.length} Stages</span>
                            </div>
                            <div className="overflow-x-auto pb-4"><div className="flex min-w-max items-center">{TRACKING_STAGES.map((stage, index) => <TrackingStage key={stage.key} stage={stage} risk={risk} index={index} onClick={setSelectedStage} />)}</div></div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            {renderStageDetails()}
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
                            Key Risk Indicator information
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
// MAIN
// ============================================================

const CAEriskOverview = () => {

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


    // ========================================================
    // FETCH DEPARTMENT RISKS
    // ========================================================
    const loadRisks = async () => {
 
        try {
 
            setLoading(true);
 
            // ============================================
            // CAE VISIBILITY
            //
            // Unlike an Audit Manager, the Chief Audit
            // Executive oversees the whole organization, not
            // a single department. So this page always loads
            // every risk across every department rather than
            // filtering down to the logged-in user's own
            // department entity.
            // ============================================
 
            console.log(
                "CAE RISK OVERVIEW: loading risks for ALL departments"
            );
 
            const response =
                await RiskService.getAllRisks();
 
            console.log(
                "CAE RISKS RESPONSE:",
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
 
 
            console.log(
                "NORMALIZED RISKS BEFORE KRI:",
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
            // ============================================================
            // LOAD COMPLIANCE REVIEWS
            // ============================================================
            
            const risksWithCompliance =
                await attachComplianceReviewsToRisks(
                    risksWithRecommendations
                );
            
            console.log(
                "RISKS WITH COMPLIANCE:",
                risksWithCompliance
            );
            
            setRisks(risksWithCompliance);
 
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
    // RISK STATUS UPDATED (from RiskTrackingModal)
    //
    // Reflect the change in the table + the open modal without
    // a full reload, same pattern used on the Findings page.
    // ========================================================

    const handleRiskStatusUpdated = (updatedRisk) => {

        setRisks((prev) =>
            prev.map((r) => {

                const sameRisk =
                    (r.id !== undefined && r.id === updatedRisk.id) ||
                    (r.riskId !== undefined && r.riskId === updatedRisk.riskId);

                return sameRisk
                    ? { ...r, ...updatedRisk }
                    : r;
            })
        );

        setSelectedRisk((prev) =>
            prev ? { ...prev, ...updatedRisk } : prev
        );
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
                                    Organization-wide risk lifecycle
                                    and control tracking
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
                                        {getDepartmentDisplayName(department) ||
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
                        subtitle="Across all departments"
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
                                Enterprise Risk Register
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
                                                {getDepartmentDisplayName(department)
                                                    ? `No risks found for ${getDepartmentDisplayName(department)}`
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
                                                            {getDepartmentDisplayName(risk.department) ||
                                                                "-"}
                                                        </span>

                                                    </td>


                                                    {/* RISK STATUS */}

                                                    <td className="px-5 py-4">

                                                        <StageBadge
                                                            status={getRiskStatus(
                                                                risk
                                                            )}
                                                        />

                                                    </td>


                                                    {/* ================================================= */}
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
                    onStatusUpdated={handleRiskStatusUpdated}
                />

            )}

        </div>
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

export default CAEriskOverview;