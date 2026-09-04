import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ClipboardCheck,
  Clock,
  MessageSquareWarning,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Upload,
  FileText,
} from "lucide-react";

import {
  computeAuditStats,
  computeProgressByStatus,
  computeStatusDistribution,
  computeUpcomingDeadlines,
  fetchAuditeeDashboardData,
} from "../../service/auditeeDashboardService";

import AuditeeStatCard from "../../components/auditee/dashboard/AuditeeStatCard";
import AuditStatusChart from "../../components/auditee/dashboard/AuditStatusChart";
import FindingsResponseSummary from "../../components/auditee/dashboard/FindingsResponseSummary";
import UpcomingDeadlines from "../../components/auditee/dashboard/UpcomingDeadlines";

import RecentActivity, {
  buildActivityFeed,
} from "../../components/auditee/dashboard/RecentActivity";

import RecentAudits from "../../components/auditee/dashboard/RecentAudits";
import AuditProgressChart from "../../components/auditee/dashboard/AuditProgressChart";

// ============================================================
// SKELETON
// ============================================================

const SkeletonBlock = ({ className }) => (
  <div
    className={`animate-pulse rounded-xl bg-slate-100 ${className}`}
  />
);

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <SkeletonBlock
          key={i}
          className="h-28"
        />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <SkeletonBlock className="h-80" />
      <SkeletonBlock className="h-80" />
    </div>

    <SkeletonBlock className="h-40" />

    <SkeletonBlock className="h-64" />
  </div>
);

// ============================================================
// GREETING
// ============================================================

const getGreeting = () => {
  const h = new Date().getHours();

  if (h < 12) {
    return "Good Morning";
  }

  if (h < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
};

// ============================================================
// DATABASE AUDIT ID
//
// IMPORTANT:
//
// Backend routes expect numeric database ID:
//
// /audit-details/4
//
// NOT:
//
// /audit-details/AUD-001
//
// Possible backend response structures:
//
// {
//   id: 4,
//   auditId: "AUD-001"
// }
//
// OR:
//
// {
//   auditDbId: 4,
//   auditId: "AUD-001"
// }
//
// OR:
//
// {
//   audit: {
//      id: 4,
//      auditId: "AUD-001"
//   }
// }
// ============================================================

const getDatabaseId = (audit) => {
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
      "Invalid numeric Audit Database ID:",
      value,
      audit
    );

    return null;
  }

  return numericId;
};

// ============================================================
// DISPLAY AUDIT CODE
//
// Example:
// AUD-001
//
// This is ONLY for display.
// Never use this value for numeric backend routes.
// ============================================================

const getAuditCode = (audit) => {
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
// AUDIT TITLE
// ============================================================

const getAuditTitle = (audit) => {
  if (!audit) {
    return "-";
  }

  return (
    audit?.auditName ??
    audit?.auditTitle ??
    audit?.title ??
    audit?.audit?.auditName ??
    audit?.audit?.auditTitle ??
    audit?.audit?.title ??
    "-"
  );
};

// ============================================================
// DEPARTMENT
// ============================================================

const getDepartmentName = (department) => {
  if (!department) {
    return "-";
  }

  if (typeof department === "string") {
    return department;
  }

  if (typeof department === "object") {
    return (
      department?.name ??
      department?.departmentName ??
      department?.title ??
      department?.label ??
      "-"
    );
  }

  return String(department);
};

// ============================================================
// AUDITOR
// ============================================================

const getAuditorName = (audit) => {
  if (!audit) {
    return "-";
  }

  return (
    audit?.internalAuditorName ??
    audit?.auditorName ??
    audit?.internalAuditor?.name ??
    audit?.auditor?.name ??
    "-"
  );
};

// ============================================================
// NORMALIZE AUDIT DATA
// ============================================================

const normalizeAudit = (audit) => {
  if (!audit) {
    return null;
  }

  const databaseId = getDatabaseId(audit);

  const auditCode = getAuditCode(audit);

  const title = getAuditTitle(audit);

  const department = getDepartmentName(
    audit?.department
  );

  const auditor = getAuditorName(audit);

  const processName =
    audit?.processName ??
    audit?.process ??
    "-";

  const businessUnit =
    audit?.businessUnit ??
    audit?.business_unit ??
    audit?.auditBusinessUnit ??
    "-";

  const status =
    audit?.status ??
    "-";

  const startDate =
    audit?.startDate ??
    null;

  const endDate =
    audit?.endDate ??
    audit?.dueDate ??
    null;

  return {
    ...audit,

    // ========================================================
    // DATABASE ID
    // ========================================================

    id: databaseId,

    // Preserve explicit database ID as well
    auditDbId: databaseId,

    // ========================================================
    // BUSINESS AUDIT CODE
    // ========================================================

    auditId: auditCode,

    // ========================================================
    // TITLE ALIASES
    // ========================================================

    auditName: title,
    auditTitle: title,
    title: title,

    // ========================================================
    // OTHER FIELDS
    // ========================================================

    department,

    processName,

    businessUnit,

    internalAuditorName: auditor,
    auditorName: auditor,

    status,

    startDate,

    endDate,

    dueDate: endDate,
  };
};

// ============================================================
// COMPONENT
// ============================================================

const AuditeeDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState(null);

  const [data, setData] = useState({
    audits: [],
    findings: [],
    responses: [],
    evidence: [],
  });

  // ==========================================================
  // USER NAME
  // ==========================================================

  const userName = (() => {
    try {
      const user =
        JSON.parse(
          localStorage.getItem("user")
        ) ||
        JSON.parse(
          localStorage.getItem("currentUser")
        );

      return (
        user?.name ||
        user?.fullName ||
        user?.firstName ||
        "there"
      );
    } catch {
      return "there";
    }
  })();

  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        console.log(
          "Loading Auditee Dashboard..."
        );

        const result =
          await fetchAuditeeDashboardData();

        console.log(
          "AUDITEE DASHBOARD RAW DATA:",
          result
        );

        // ====================================================
        // NORMALIZE AUDITS
        // ====================================================

        const rawAudits = Array.isArray(
          result?.audits
        )
          ? result.audits
          : [];

        const normalizedAudits =
          rawAudits
            .map(normalizeAudit)
            .filter(Boolean);

        console.log(
          "NORMALIZED AUDITS:",
          normalizedAudits
        );

        // ====================================================
        // DEBUG DATABASE IDS
        // ====================================================

        normalizedAudits.forEach((audit) => {
          console.log(
            "AUDIT ID MAPPING:",
            {
              databaseId: audit.id,
              auditDbId: audit.auditDbId,
              auditId: audit.auditId,
              title: audit.auditName,
            }
          );
        });

        // ====================================================
        // SET DATA
        // ====================================================

        setData({
          audits: normalizedAudits,

          findings: Array.isArray(
            result?.findings
          )
            ? result.findings
            : [],

          responses: Array.isArray(
            result?.responses
          )
            ? result.responses
            : [],

          evidence: Array.isArray(
            result?.evidence
          )
            ? result.evidence
            : [],
        });
      } catch (err) {
        console.error(
          "Dashboard load failed:",
          err
        );

        setError(
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to load dashboard data"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    load();
  }, [load]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[500px]">
        <div className="text-center rounded-xl border border-slate-200 bg-white p-8 shadow-sm max-w-sm">
          <AlertTriangle
            className="h-8 w-8 text-red-500 mx-auto mb-3"
          />

          <p className="font-medium text-slate-800">
            Unable to load dashboard data
          </p>

          <p className="text-sm text-slate-400 mt-1">
            {error}
          </p>

          <button
            onClick={() => load()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />

            Retry
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // DATA
  // ==========================================================

  const {
    audits,
    findings,
    responses,
    evidence,
  } = data;

  // ==========================================================
  // STATS
  // ==========================================================

  const stats =
    computeAuditStats(audits);

  const statusDistribution =
    computeStatusDistribution(audits);

  const progressByStatus =
    computeProgressByStatus(audits);

  const upcomingDeadlines =
    computeUpcomingDeadlines(audits);

  // ==========================================================
  // ACTIVITIES
  // ==========================================================

  const activities =
    buildActivityFeed({
      responses,
      evidence,
    });

  // ==========================================================
  // FINDINGS
  // ==========================================================

  const openFindings =
    findings.filter(
      (f) =>
        ![
          "CLOSED",
          "RESOLVED",
        ].includes(
          (f.status || "")
            .toUpperCase()
        )
    ).length;

  const responsesSubmitted =
    responses.length;

  const responsesPending =
    Math.max(
      stats.responsePending || 0,
      0
    );

  // ==========================================================
  // TODAY
  // ==========================================================

  const today =
    new Date().toLocaleDateString(
      "en-GB",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  // ==========================================================
  // VIEW AUDIT
  //
  // IMPORTANT:
  //
  // Uses numeric DB ID only.
  //
  // Correct:
  // /auditee-officer/audit-details/4
  //
  // Incorrect:
  // /auditee-officer/audit-details/AUD-001
  // ==========================================================

  const handleViewAudit = (audit) => {
    const databaseId =
      getDatabaseId(audit);

    console.log(
      "VIEW AUDIT:",
      {
        databaseId,
        auditId: getAuditCode(audit),
        audit,
      }
    );

    if (
      databaseId === null ||
      databaseId === undefined
    ) {
      console.error(
        "Cannot navigate: Numeric Database Audit ID not found",
        audit
      );

      return;
    }

    navigate(
      `/auditee-officer/audit-details/${databaseId}`
    );
  };

  // ==========================================================
  // UPLOAD / VIEW EVIDENCE
  //
  // Uses numeric DB ID.
  // ==========================================================

  const handleUploadEvidence = (audit) => {
    const databaseId =
      getDatabaseId(audit);

    console.log(
      "OPEN EVIDENCE:",
      {
        databaseId,
        auditId: getAuditCode(audit),
      }
    );

    if (
      databaseId === null ||
      databaseId === undefined
    ) {
      console.error(
        "Cannot open evidence: Numeric Database Audit ID not found",
        audit
      );

      return;
    }

    navigate(
      `/auditee-officer/evidence?auditId=${databaseId}`
    );
  };

  // ==========================================================
  // ASSIGNED AUDITS
  // ==========================================================

  const handleAssignedAudits = () => {
    navigate(
      "/auditee-officer/assigned-audits"
    );
  };

  // ==========================================================
  // FIRST AUDIT
  // ==========================================================

  const firstAudit =
    audits.length > 0
      ? audits[0]
      : null;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            {getGreeting()}, {userName} 👋
          </h1>

          <p className="text-sm text-slate-500 mt-0.5">
            Here's an overview of your audits,
            findings and response activities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400 hidden sm:block">
            {today}
          </span>

          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            <motion.span
              animate={
                refreshing
                  ? { rotate: 360 }
                  : { rotate: 0 }
              }
              transition={
                refreshing
                  ? {
                      repeat: Infinity,
                      duration: 0.8,
                      ease: "linear",
                    }
                  : {}
              }
            >
              <RefreshCw className="h-4 w-4" />
            </motion.span>

            Refresh
          </button>
        </div>
      </motion.div>

      {/* ====================================================
          STAT CARDS
      ==================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AuditeeStatCard
          index={0}
          icon={ClipboardCheck}
          label="Total Audits"
          value={stats.totalAudits}
          description="Audits assigned to your department"
          accent="teal"
        />

        <AuditeeStatCard
          index={1}
          icon={Clock}
          label="In Progress"
          value={stats.inProgress}
          description="Audits currently underway"
          accent="blue"
        />

        <AuditeeStatCard
          index={2}
          icon={MessageSquareWarning}
          label="Response Pending"
          value={stats.responsePending}
          description="Awaiting your response"
          accent="amber"
        />

        <AuditeeStatCard
          index={3}
          icon={CheckCircle}
          label="Completed"
          value={stats.completed}
          description="Audits closed out"
          accent="green"
        />
      </div>

      {/* ====================================================
          CHARTS
      ==================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AuditStatusChart
          data={statusDistribution}
        />

        <AuditProgressChart
          data={progressByStatus}
        />
      </div>

      {/* ====================================================
          FINDINGS & RESPONSES
      ==================================================== */}

      <FindingsResponseSummary
        openFindings={openFindings}
        responsesSubmitted={responsesSubmitted}
        responsesPending={responsesPending}
      />

      {/* ====================================================
          QUICK ACTIONS
      ==================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* MY ASSIGNED AUDITS */}

        <button
          type="button"
          onClick={handleAssignedAudits}
          className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-teal-300 hover:shadow-md transition-all text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
            <ClipboardCheck
              size={21}
              className="text-teal-600"
            />
          </div>

          <p className="font-semibold text-slate-800">
            My Assigned Audits
          </p>

          <p className="text-xs text-slate-500 mt-1">
            View all audits assigned to you
          </p>
        </button>

        {/* UPLOAD EVIDENCE */}

        <button
          type="button"
          onClick={() => {
            if (firstAudit) {
              handleUploadEvidence(
                firstAudit
              );
            }
          }}
          disabled={!firstAudit}
          className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-teal-300 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
            <Upload
              size={21}
              className="text-teal-600"
            />
          </div>

          <p className="font-semibold text-slate-800">
            Upload Evidence
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Submit supporting documents
          </p>
        </button>

        {/* VIEW AUDIT DETAILS */}

        <button
          type="button"
          onClick={() => {
            if (firstAudit) {
              handleViewAudit(
                firstAudit
              );
            }
          }}
          disabled={!firstAudit}
          className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-teal-300 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <FileText
              size={21}
              className="text-blue-600"
            />
          </div>

          <p className="font-semibold text-slate-800">
            View Audit Details
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Review your latest assigned audit
          </p>
        </button>
      </div>

      {/* ====================================================
          DEADLINES + ACTIVITY
      ==================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UpcomingDeadlines
          audits={upcomingDeadlines}
          onView={handleViewAudit}
        />

        <RecentActivity
          activities={activities}
        />
      </div>

      {/* ====================================================
          RECENT AUDITS
      ==================================================== */}

      <RecentAudits
        audits={audits}
        onView={handleViewAudit}
      />
    </div>
  );
};

export default AuditeeDashboard;