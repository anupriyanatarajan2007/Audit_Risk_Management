import { getAllAuditeeResponses } from "./auditeeResponseService";
import { getMyAuditeeAudits } from "./AuditService";
import { getEvidenceByUser } from "./EvidenceService";
import { getFindingsByAuditId } from "./FindingService";

// ============================================================
// STATUS
// ============================================================

export const STATUS_KEYS = [
  "PLANNED",
  "IN_PROGRESS",
  "RESPONSE_PENDING",
  "UNDER_REVIEW",
  "COMPLETED",
  "CLOSED",
];

export const STATUS_LABELS = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  RESPONSE_PENDING: "Response Pending",
  UNDER_REVIEW: "Under Review",
  COMPLETED: "Completed",
  CLOSED: "Closed",
};

export const STATUS_COLORS = {
  PLANNED: "#64748B",
  IN_PROGRESS: "#0EA5A0",
  RESPONSE_PENDING: "#F59E0B",
  UNDER_REVIEW: "#3B82F6",
  COMPLETED: "#10B981",
  CLOSED: "#0F172A",
};

export const normalizeStatus = (status) => {
  if (!status) return "PLANNED";

  const key = status
    .toString()
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  return STATUS_KEYS.includes(key)
    ? key
    : "PLANNED";
};

// ============================================================
// PROGRESS
// ============================================================

const STATUS_PROGRESS_FALLBACK = {
  PLANNED: 10,
  IN_PROGRESS: 50,
  RESPONSE_PENDING: 65,
  UNDER_REVIEW: 85,
  COMPLETED: 100,
  CLOSED: 100,
};

export const getAuditProgress = (audit) => {
  if (typeof audit?.progress === "number") {
    return audit.progress;
  }

  if (
    typeof audit?.completionPercentage ===
    "number"
  ) {
    return audit.completionPercentage;
  }

  return (
    STATUS_PROGRESS_FALLBACK[
      normalizeStatus(audit?.status)
    ] ?? 0
  );
};

// ============================================================
// DATE HELPERS
// ============================================================

const daysUntil = (dateStr) => {
  if (!dateStr) return null;

  const due = new Date(dateStr);
  const now = new Date();

  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  return Math.round(
    (due - now) /
      (1000 * 60 * 60 * 24)
  );
};

export const getUrgency = (dateStr) => {
  const d = daysUntil(dateStr);

  if (d === null) {
    return {
      level: "normal",
      label: "No due date",
      days: null,
    };
  }

  if (d < 0) {
    return {
      level: "overdue",
      label: "Overdue",
      days: d,
    };
  }

  if (d < 7) {
    return {
      level: "urgent",
      label: "Urgent",
      days: d,
    };
  }

  if (d <= 14) {
    return {
      level: "attention",
      label: "Attention",
      days: d,
    };
  }

  return {
    level: "normal",
    label: "Normal",
    days: d,
  };
};

// ============================================================
// SAFE UNWRAP
// ============================================================

const unwrap = (res) => {
  if (Array.isArray(res)) {
    return res;
  }

  if (Array.isArray(res?.data)) {
    return res.data;
  }

  if (Array.isArray(res?.data?.data)) {
    return res.data.data;
  }

  return [];
};

// ============================================================
// CURRENT USER
// ============================================================

const getCurrentUser = () => {
  try {
    return (
      JSON.parse(
        localStorage.getItem("user")
      ) ||
      JSON.parse(
        localStorage.getItem("currentUser")
      ) ||
      null
    );
  } catch {
    return null;
  }
};

const currentUserId = () => {
  const user = getCurrentUser();

  return (
    user?.id ??
    user?.userId ??
    user?.profileId ??
    null
  );
};

// ============================================================
// GET NUMERIC AUDIT DATABASE ID
//
// IMPORTANT:
//
// Backend finding endpoint expects:
//
// /api/findings/audit/{Long}
//
// Example:
//
// /api/findings/audit/2
//
// NOT:
//
// /api/findings/audit/AUD-002
// ============================================================

const getAuditDatabaseId = (audit) => {
  if (!audit) {
    return null;
  }

  const value =
    audit?.auditDbId ??
    audit?.id ??
    audit?.databaseId ??
    audit?.audit?.auditDbId ??
    audit?.audit?.id ??
    audit?.audit?.databaseId ??
    null;

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numericId = Number(value);

  if (
    !Number.isInteger(numericId) ||
    numericId <= 0
  ) {
    console.warn(
      "Invalid numeric audit database ID:",
      value,
      audit
    );

    return null;
  }

  return numericId;
};

// ============================================================
// GET BUSINESS AUDIT CODE
//
// Used only for display:
//
// AUD-001
// AUD-002
// ============================================================

export const getAuditCode = (audit) => {
  if (!audit) {
    return "-";
  }

  return (
    audit?.auditId ??
    audit?.auditCode ??
    audit?.audit?.auditId ??
    audit?.audit?.auditCode ??
    "-"
  );
};

// ============================================================
// CHECK WHETHER FINDING BELONGS TO ASSIGNED AUDIT
// ============================================================

const findingBelongsToAssignedAudit = (
  finding,
  allowedAuditIds
) => {
  if (!finding) {
    return false;
  }

  const possibleAuditIds = [
    finding?.auditDbId,
    finding?.audit?.id,
    finding?.audit?.auditDbId,
    finding?.audit?.databaseId,
  ];

  for (const value of possibleAuditIds) {
    if (
      value !== null &&
      value !== undefined &&
      value !== ""
    ) {
      const numericId = Number(value);

      if (
        Number.isInteger(numericId) &&
        allowedAuditIds.has(numericId)
      ) {
        return true;
      }
    }
  }

  /*
   * Some Finding DTOs may return the audit DB ID
   * directly as auditId.
   *
   * Only treat it as numeric here.
   *
   * Example:
   *
   * auditId: 2
   *
   * Do NOT compare AUD-002 with numeric IDs.
   */

  if (
    finding?.auditId !== null &&
    finding?.auditId !== undefined &&
    finding?.auditId !== ""
  ) {
    const numericAuditId =
      Number(finding.auditId);

    if (
      Number.isInteger(numericAuditId) &&
      allowedAuditIds.has(numericAuditId)
    ) {
      return true;
    }
  }

  return false;
};

// ============================================================
// FILTER RESPONSE DATA
//
// Only responses belonging to findings from assigned audits.
// ============================================================

const filterResponsesForAssignedAudits = (
  responses,
  assignedFindingIds
) => {
  if (!Array.isArray(responses)) {
    return [];
  }

  if (assignedFindingIds.size === 0) {
    return [];
  }

  return responses.filter(
    (response) => {
      const findingId =
        response?.findingId ??
        response?.finding?.id ??
        response?.finding?.findingId;

      if (
        findingId === null ||
        findingId === undefined
      ) {
        return false;
      }

      return assignedFindingIds.has(
        String(findingId)
      );
    }
  );
};

// ============================================================
// FILTER EVIDENCE
//
// Evidence is filtered using assigned audit IDs when
// the evidence DTO contains audit information.
// ============================================================

const filterEvidenceForAssignedAudits = (
  evidence,
  allowedAuditIds
) => {
  if (!Array.isArray(evidence)) {
    return [];
  }

  if (allowedAuditIds.size === 0) {
    return [];
  }

  return evidence.filter(
    (item) => {
      const possibleAuditIds = [
        item?.auditDbId,
        item?.audit?.id,
        item?.audit?.auditDbId,
        item?.audit?.databaseId,
      ];

      return possibleAuditIds.some(
        (value) => {
          if (
            value === null ||
            value === undefined ||
            value === ""
          ) {
            return false;
          }

          const numericId =
            Number(value);

          return (
            Number.isInteger(
              numericId
            ) &&
            allowedAuditIds.has(
              numericId
            )
          );
        }
      );
    }
  );
};

// ============================================================
// MAIN AGGREGATOR
//
// IMPORTANT:
// This function DOES NOT call getAllFindings().
//
// It first gets audits assigned to the current Auditee,
// then gets findings audit-by-audit.
// ============================================================

export const fetchAuditeeDashboardData =
  async () => {
    // ========================================================
    // 1. CURRENT AUDITEE'S ASSIGNED AUDITS
    // ========================================================

    const auditsResponse =
      await getMyAuditeeAudits();

    const audits =
      unwrap(auditsResponse);

    console.log(
      "=========================================="
    );

    console.log(
      "AUDITS ASSIGNED TO CURRENT AUDITEE:"
    );

    console.log(audits);

    console.log(
      "=========================================="
    );

    // ========================================================
    // 2. EXTRACT NUMERIC DATABASE IDS
    // ========================================================

    const auditDatabaseIds = [
      ...new Set(
        audits
          .map(getAuditDatabaseId)
          .filter(Boolean)
      ),
    ];

    console.log(
      "ASSIGNED AUDIT DATABASE IDS:",
      auditDatabaseIds
    );

    // ========================================================
    // 3. GET FINDINGS ONLY FOR ASSIGNED AUDITS
    // ========================================================

    let allFindings = [];

    if (
      auditDatabaseIds.length > 0
    ) {
      const findingResults =
        await Promise.allSettled(
          auditDatabaseIds.map(
            async (auditDbId) => {
              try {
                console.log(
                  `Fetching findings for assigned audit DB ID: ${auditDbId}`
                );

                /*
                 * IMPORTANT:
                 *
                 * getFindingsByAuditId expects
                 * numeric database ID.
                 *
                 * Example:
                 *
                 * /api/findings/audit/2
                 */

                const response =
                  await getFindingsByAuditId(
                    auditDbId
                  );

                const findings =
                  unwrap(response);

                console.log(
                  `Findings for audit ${auditDbId}:`,
                  findings
                );

                return findings;
              } catch (error) {
                console.error(
                  `Failed to load findings for audit ${auditDbId}:`,
                  error
                );

                return [];
              }
            }
          )
        );

      findingResults.forEach(
        (result) => {
          if (
            result.status ===
            "fulfilled"
          ) {
            allFindings.push(
              ...result.value
            );
          }
        }
      );
    }

    // ========================================================
    // 4. REMOVE DUPLICATE FINDINGS
    // ========================================================

    const uniqueFindings = [
      ...new Map(
        allFindings
          .filter(
            (finding) =>
              finding?.id !== null &&
              finding?.id !== undefined
          )
          .map(
            (finding) => [
              String(finding.id),
              finding,
            ]
          )
      ).values(),
    ];

    // ========================================================
    // 5. EXTRA SECURITY FILTER
    //
    // Even if an endpoint accidentally returns another
    // finding, it will NOT enter the dashboard unless its
    // audit belongs to the current Auditee.
    // ========================================================

    const allowedAuditIds =
      new Set(
        auditDatabaseIds
      );

    const findings =
      uniqueFindings.filter(
        (finding) =>
          findingBelongsToAssignedAudit(
            finding,
            allowedAuditIds
          )
      );

    console.log(
      "ALL FINDINGS FETCHED:",
      uniqueFindings
    );

    console.log(
      "FINAL FINDINGS FOR CURRENT AUDITEE:",
      findings
    );

    // ========================================================
    // 6. GET AUDITEE RESPONSES
    // ========================================================

    let responses = [];

    try {
      const responsesResponse =
        await getAllAuditeeResponses();

      const allResponses =
        unwrap(
          responsesResponse
        );

      // ======================================================
      // Only responses for findings belonging to the
      // Auditee's assigned audits.
      // ======================================================

      const assignedFindingIds =
        new Set(
          findings.map(
            (finding) =>
              String(finding.id)
          )
        );

      responses =
        filterResponsesForAssignedAudits(
          allResponses,
          assignedFindingIds
        );

      console.log(
        "ALL AUDITEE RESPONSES:",
        allResponses
      );

      console.log(
        "RESPONSES FOR ASSIGNED FINDINGS:",
        responses
      );
    } catch (error) {
      console.warn(
        "Unable to load Auditee responses:",
        error
      );

      responses = [];
    }

    // ========================================================
    // 7. GET EVIDENCE FOR CURRENT USER
    // ========================================================

    let evidence = [];

    const userId =
      currentUserId();

    if (userId) {
      try {
        const evidenceResponse =
          await getEvidenceByUser(
            userId
          );

        const allEvidence =
          unwrap(
            evidenceResponse
          );

        /*
         * If evidence contains audit information,
         * filter it against assigned audits.
         *
         * If your backend already guarantees that
         * getEvidenceByUser() returns only current user's
         * evidence, this still provides an additional
         * client-side safety check.
         */

        evidence =
          filterEvidenceForAssignedAudits(
            allEvidence,
            allowedAuditIds
          );

        console.log(
          "ALL USER EVIDENCE:",
          allEvidence
        );

        console.log(
          "EVIDENCE FOR ASSIGNED AUDITS:",
          evidence
        );
      } catch (error) {
        console.warn(
          "Unable to load evidence:",
          error
        );

        evidence = [];
      }
    }

    // ========================================================
    // 8. FINAL DASHBOARD DATA
    // ========================================================

    const finalData = {
      audits,
      findings,
      responses,
      evidence,
    };

    console.log(
      "=========================================="
    );

    console.log(
      "FINAL AUDITEE DASHBOARD DATA:"
    );

    console.log(
      finalData
    );

    console.log(
      "=========================================="
    );

    return finalData;
  };

// ============================================================
// DERIVED STATS
// ============================================================

export const computeAuditStats = (
  audits = []
) => {
  const totalAudits =
    audits.length;

  const inProgress =
    audits.filter(
      (a) =>
        normalizeStatus(
          a.status
        ) === "IN_PROGRESS"
    ).length;

  const responsePending =
    audits.filter(
      (a) =>
        normalizeStatus(
          a.status
        ) === "RESPONSE_PENDING"
    ).length;

  const completed =
    audits.filter((a) =>
      [
        "COMPLETED",
        "CLOSED",
      ].includes(
        normalizeStatus(
          a.status
        )
      )
    ).length;

  return {
    totalAudits,
    inProgress,
    responsePending,
    completed,
  };
};

// ============================================================
// STATUS DISTRIBUTION
// ============================================================

export const computeStatusDistribution = (
  audits = []
) => {
  const counts =
    STATUS_KEYS.reduce(
      (acc, key) => ({
        ...acc,
        [key]: 0,
      }),
      {}
    );

  audits.forEach((audit) => {
    counts[
      normalizeStatus(
        audit.status
      )
    ] += 1;
  });

  return STATUS_KEYS
    .filter(
      (key) =>
        counts[key] > 0
    )
    .map((key) => ({
      key,
      name:
        STATUS_LABELS[key],
      value:
        counts[key],
      color:
        STATUS_COLORS[key],
    }));
};

// ============================================================
// PROGRESS BY STATUS
// ============================================================

export const computeProgressByStatus = (
  audits = []
) => {
  const groups = {};

  audits.forEach((audit) => {
    const key =
      normalizeStatus(
        audit.status
      );

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(
      getAuditProgress(audit)
    );
  });

  return STATUS_KEYS
    .filter(
      (key) =>
        groups[key]?.length
    )
    .map((key) => ({
      key,
      name:
        STATUS_LABELS[key],
      value: Math.round(
        groups[key].reduce(
          (sum, value) =>
            sum + value,
          0
        ) /
          groups[key].length
      ),
      color:
        STATUS_COLORS[key],
    }));
};

// ============================================================
// UPCOMING DEADLINES
// ============================================================

export const computeUpcomingDeadlines = (
  audits = []
) => {
  return audits
    .filter(
      (audit) =>
        audit.dueDate &&
        ![
          "COMPLETED",
          "CLOSED",
        ].includes(
          normalizeStatus(
            audit.status
          )
        )
    )
    .map((audit) => ({
      ...audit,
      urgency:
        getUrgency(
          audit.dueDate
        ),
    }))
    .sort(
      (a, b) =>
        (a.urgency.days ??
          999) -
        (b.urgency.days ??
          999)
    )
    .slice(0, 6);
};