import axios from "axios";
import { getAuditById } from "./auditService";
import { getEvidenceByAudit } from "./evidenceService";
import { getFindingsByAuditId } from "./findingService";
import ReportGeneratorService from "./reportGeneratorService";

// ============================================================
// TOKEN / AUTH
// ============================================================

const getToken = () => localStorage.getItem("token");

const authHeader = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

// ============================================================
// CURRENT USER
// ============================================================

export const getCurrentUser = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("currentUser")) ||
      null
    );
  } catch (error) {
    console.error("Unable to read current user:", error);
    return null;
  }
};

// ============================================================
// RECOMMENDATIONS (verify endpoint against real RecommendationController)
// ============================================================

const RECOMMENDATION_API = "http://localhost:8080/api/recommendations";

// ✅ NEW — reuse real service, fetch per-finding, then flatten
import { getRecommendationsForFinding } from "./recommendationService";

export const getRecommendationsByAuditId = async (auditId, findings = []) => {
  // No direct "by audit" endpoint exists — recommendations are scoped
  // to findings. We fetch per-finding and flatten the results.
  if (!findings.length) {
    return []; // no findings yet = no recommendations, not an error
  }

  try {
    const results = await Promise.allSettled(
      findings.map((f) => getRecommendationsForFinding(f.id || f.findingId))
    );

    const flattened = results
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => {
        const body = r.value?.data;
        return Array.isArray(body) ? body : Array.isArray(r.value) ? r.value : [];
      });

    return flattened;
  } catch (error) {
    console.warn("Recommendation data unavailable:", error?.message);
    return null;
  }
}; 

// ============================================================
// AUDIT EXECUTION (verify endpoint against real execution service)
// ============================================================

const EXECUTION_API = "http://localhost:8080/api/audit-executions";

export const getExecutionsByAuditId = async (auditId) => {
  try {
    const response = await axios.get(
      `${EXECUTION_API}/audit/${auditId}`,
      authHeader()
    );
    return response.data?.data || [];
  } catch (error) {
    console.warn(
      "Execution data unavailable:",
      error?.response?.status || error.message
    );
    return null;
  }
};

// ============================================================
// SAFE FIELD PICKER
// Reads the first available field name from an object.
// Returns "N/A" if nothing found — never crashes, never invents data.
// ============================================================

export const pickField = (obj, ...keys) => {
  if (!obj) return "N/A";
  for (const key of keys) {
    const value = obj[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return "N/A";
};

// ============================================================
// BUILD FULL REPORT MODEL
// Tolerant of partial failures — one failing section never
// crashes the whole report.
// ============================================================

export const buildAuditReportModel = async (auditId) => {
  const [auditRes, execRes, evidenceRes, findingsRes, recRes] =
    await Promise.allSettled([
      getAuditById(auditId),
      getExecutionsByAuditId(auditId),
      getEvidenceByAudit(auditId),
      getFindingsByAuditId(auditId),
      getRecommendationsByAuditId(auditId),
    ]);

  if (auditRes.status !== "fulfilled" || !auditRes.value) {
    const error = new Error("AUDIT_NOT_FOUND");
    error.code = "AUDIT_NOT_FOUND";
    throw error;
  }

  const audit = auditRes.value;

  return {
    audit,

    executions:
      execRes.status === "fulfilled" && execRes.value ? execRes.value : [],
    executionsAvailable:
      execRes.status === "fulfilled" && execRes.value !== null,

    evidence:
      evidenceRes.status === "fulfilled" ? evidenceRes.value || [] : [],
    evidenceAvailable: evidenceRes.status === "fulfilled",

    findings:
      findingsRes.status === "fulfilled" ? findingsRes.value || [] : [],
    findingsAvailable: findingsRes.status === "fulfilled",

    recommendations:
      recRes.status === "fulfilled" && recRes.value ? recRes.value : [],
    recommendationsAvailable:
      recRes.status === "fulfilled" && recRes.value !== null,

    generatedAt: new Date().toISOString(),
  };
};

// ============================================================
// SUMMARY CALCULATIONS
// ============================================================

export const calculateExecutionSummary = (executions = []) => {
  const summary = {
    total: executions.length,
    PASS: 0,
    FAIL: 0,
    PARTIALLY_COMPLIANT: 0,
    NON_COMPLIANT: 0,
    NOT_APPLICABLE: 0,
    PENDING: 0,
  };

  executions.forEach((exec) => {
    const result = exec?.result;
    if (result && summary[result] !== undefined) {
      summary[result] += 1;
    }
  });

  const completed = summary.total - summary.PENDING;
  summary.completionRate =
    summary.total > 0 ? Math.round((completed / summary.total) * 100) : 0;

  return summary;
};

export const calculateFindingsSummary = (findings = []) => {
  const summary = {
    total: findings.length,
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    OPEN: 0,
    CLOSED: 0,
  };

  findings.forEach((finding) => {
    if (finding?.riskLevel && summary[finding.riskLevel] !== undefined) {
      summary[finding.riskLevel] += 1;
    }
    if (finding?.status === "OPEN") summary.OPEN += 1;
    if (finding?.status === "CLOSED") summary.CLOSED += 1;
  });

  return summary;
};

export const calculateEvidenceSummary = (evidence = []) => {
  const summary = { total: evidence.length, APPROVED: 0, PENDING: 0, REJECTED: 0 };
  let hasStatus = false;

  evidence.forEach((item) => {
    if (item?.status) {
      hasStatus = true;
      if (summary[item.status] !== undefined) summary[item.status] += 1;
    }
  });

  return { ...summary, hasStatus };
};

// ============================================================
// CONCLUSION TEXT (calculated, never invented)
// ============================================================

export const buildConclusionText = (execSummary) => {
  if (!execSummary || execSummary.total === 0) {
    return "No audit execution data is currently available to generate a conclusion.";
  }

  const parts = [];
  if (execSummary.PASS > 0) parts.push(`${execSummary.PASS} test(s) were compliant`);
  if (execSummary.NON_COMPLIANT > 0)
    parts.push(`${execSummary.NON_COMPLIANT} were non-compliant`);
  if (execSummary.FAIL > 0) parts.push(`${execSummary.FAIL} failed`);
  if (execSummary.PARTIALLY_COMPLIANT > 0)
    parts.push(`${execSummary.PARTIALLY_COMPLIANT} were partially compliant`);
  if (execSummary.NOT_APPLICABLE > 0)
    parts.push(`${execSummary.NOT_APPLICABLE} were not applicable`);
  if (execSummary.PENDING > 0) parts.push(`${execSummary.PENDING} are still pending`);

  return `Based on the audit procedures performed, out of ${execSummary.total} total test(s), ${parts.join(
    ", "
  )}.`;
};

// ============================================================
// RE-EXPORT existing report generator service
// (already exists in project — reused, not duplicated)
// ============================================================

export { ReportGeneratorService };

const AuditReportService = {
  getCurrentUser,
  getRecommendationsByAuditId,
  getExecutionsByAuditId,
  pickField,
  buildAuditReportModel,
  calculateExecutionSummary,
  calculateFindingsSummary,
  calculateEvidenceSummary,
  buildConclusionText,
  ReportGeneratorService,
};

export default AuditReportService;