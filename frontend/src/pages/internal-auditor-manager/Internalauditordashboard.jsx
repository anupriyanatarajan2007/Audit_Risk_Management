import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  RefreshCw,
  Bell,
  ClipboardList,
  Clock3,
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  ShieldAlert,
  PlayCircle,
  FileCheck,
  Lightbulb,
  ChevronRight,
  AlertOctagon,
  Activity,
} from "lucide-react";

import {
  getMyAssignedAudits,
} from "../../service/AuditService";

import {
  getFindingsByAuditId,
} from "../../service/FindingService";

import NotificationService from "../../service/NotificationService";


/* ============================================================
   ROUTES
============================================================ */

const ROUTES = {
  myAudits: "/internal-auditor/audits",
  auditDetails: "/internal-auditor/audit-reports",
  findings: "/internal-auditor/findings",
  evidence: "/internal-auditor/evidence",
  recommendations: "/internal-auditor/recommendations",
};


/* ============================================================
   COLORS
============================================================ */

const RISK_LEVEL_COLORS = {
  CRITICAL: "#DC2626",
  HIGH: "#EF4444",
  MEDIUM: "#D97706",
  LOW: "#00A874",
};

const AUDIT_STATUS_COLORS = {
  PLANNED: "#64748B",
  PENDING: "#D97706",
  IN_PROGRESS: "#2563EB",
  COMPLETED: "#16A34A",
  CANCELLED: "#DC2626",
};


/* ============================================================
   HELPERS
============================================================ */

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

  return [];
};


const getCurrentUser = () => {
  try {
    const user =
      JSON.parse(localStorage.getItem("user")) ||
      JSON.parse(localStorage.getItem("currentUser"));

    return user;
  } catch (error) {
    console.error(
      "Unable to read current user:",
      error
    );

    return null;
  }
};


const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
};


const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const daysUntil = (value) => {
  if (!value) {
    return null;
  }

  const due = new Date(
    new Date(value).toDateString()
  );

  const today = new Date(
    new Date().toDateString()
  );

  return Math.round(
    (due - today) /
      (1000 * 60 * 60 * 24)
  );
};


const formatRelativeTime = (value) => {
  if (!value) {
    return "";
  }

  const then = new Date(value).getTime();

  if (Number.isNaN(then)) {
    return "";
  }

  const diffMs =
    Date.now() - then;

  const minutes =
    Math.floor(diffMs / 60000);

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  const hours =
    Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  const days =
    Math.floor(hours / 24);

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return formatDate(value);
};


const formatLabel = (value) => {
  if (!value) {
    return "—";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (c) => c.toUpperCase()
    );
};


/* ============================================================
   SAFE TEXT
   Renders primitives as-is, and pulls a display string out of
   entity objects (e.g. Department { id, name, active }) instead
   of letting React try to render the object itself.
============================================================ */

const safeText = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    return (
      value.name ??
      value.departmentName ??
      value.title ??
      value.label ??
      "—"
    );
  }

  return String(value);
};


/* ============================================================
   GET AUDIT DATABASE ID
============================================================ */

const getAuditDatabaseId = (audit) => {
  return (
    audit?.id ??
    audit?.auditDbId ??
    audit?.auditDatabaseId ??
    null
  );
};


/* ============================================================
   GET AUDIT DISPLAY ID
============================================================ */

const getAuditDisplayId = (audit) => {
  return safeText(
    audit?.auditCode ??
      audit?.auditId ??
      audit?.id ??
      "—"
  );
};


/* ============================================================
   GET AUDIT NAME
============================================================ */

const getAuditName = (audit) => {
  return safeText(
    audit?.auditTitle ??
      audit?.auditName ??
      audit?.title ??
      "Untitled Audit"
  );
};


/* ============================================================
   GET DEPARTMENT
============================================================ */

const getDepartment = (audit) => {
  return safeText(
    audit?.department ??
      audit?.auditDepartment ??
      audit?.departmentName ??
      "—"
  );
};


/* ============================================================
   GET DUE DATE
============================================================ */

const getDueDate = (audit) => {
  return (
    audit?.endDate ??
    audit?.dueDate ??
    audit?.plannedEndDate ??
    null
  );
};


/* ============================================================
   ANIMATED NUMBER
============================================================ */

const AnimatedNumber = ({
  value,
}) => {
  const [display, setDisplay] =
    useState(0);

  useEffect(() => {
    let frame;

    const start =
      performance.now();

    const from = display;

    const duration = 600;

    const tick = (now) => {
      const progress =
        Math.min(
          (now - start) /
            duration,
          1
        );

      const eased =
        1 -
        Math.pow(
          1 - progress,
          3
        );

      setDisplay(
        Math.round(
          from +
            (value - from) *
              eased
        )
      );

      if (progress < 1) {
        frame =
          requestAnimationFrame(
            tick
          );
      }
    };

    frame =
      requestAnimationFrame(
        tick
      );

    return () =>
      cancelAnimationFrame(frame);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display}</>;
};


/* ============================================================
   SKELETON
============================================================ */

const Shimmer = ({
  className,
}) => (
  <div
    className={`bg-gray-200 rounded animate-pulse ${className}`}
  />
);


const KpiSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
    <Shimmer className="h-3 w-24 mb-3" />

    <Shimmer className="h-7 w-14 mb-2" />

    <Shimmer className="h-3 w-20" />
  </div>
);


const CardSkeleton = ({
  height = "h-64",
}) => (
  <div
    className={`bg-white border border-gray-200 rounded-2xl p-5 shadow-sm ${height}`}
  >
    <Shimmer className="h-4 w-40 mb-4" />

    <Shimmer className="h-full w-full" />
  </div>
);


/* ============================================================
   KPI CARD
============================================================ */

const KpiCard = ({
  title,
  value,
  icon: Icon,
  subtext,
  tone = "teal",
  index,
}) => {
  const toneClass =
    {
      teal:
        "bg-[#E5FAF3] text-[#00A874]",

      blue:
        "bg-blue-50 text-blue-600",

      amber:
        "bg-amber-50 text-amber-600",

      red:
        "bg-red-50 text-red-600",

      green:
        "bg-green-50 text-green-600",
    }[tone] ||
    "bg-[#E5FAF3] text-[#00A874]";

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
      transition={{
        duration: 0.35,
        delay: index * 0.05,
      }}
      whileHover={{
        y: -2,
      }}
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-[#101A33] mt-2">
            <AnimatedNumber
              value={value}
            />
          </p>

          {subtext && (
            <p className="text-xs text-gray-400 mt-1">
              {subtext}
            </p>
          )}
        </div>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${toneClass}`}
        >
          <Icon
            size={19}
            aria-hidden="true"
          />
        </div>
      </div>
    </motion.div>
  );
};


/* ============================================================
   SECTION CARD
============================================================ */

const SectionCard = ({
  title,
  action,
  children,
  delay = 0,
  className = "",
}) => (
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
      duration: 0.35,
      delay,
    }}
    className={`bg-white border border-gray-200 rounded-2xl p-5 shadow-sm ${className}`}
  >
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-bold text-[#101A33]">
        {title}
      </h3>

      {action}
    </div>

    {children}
  </motion.div>
);


/* ============================================================
   MAIN DASHBOARD
============================================================ */

export default function InternalAuditorDashboard() {
  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [audits, setAudits] =
    useState([]);

  const [findings, setFindings] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(null);


  const currentUser =
    getCurrentUser();

  const auditorName =
    currentUser?.name ||
    currentUser?.fullName ||
    currentUser?.firstName ||
    "Auditor";


  /* ==========================================================
     FETCH DASHBOARD
  ========================================================== */

  const fetchDashboard =
    useCallback(
      async (isRefresh = false) => {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        try {
          /*
           * IMPORTANT
           *
           * We DO NOT use:
           *
           * getFindingsByAuditorId(auditorId)
           *
           * here.
           *
           * Instead:
           *
           * 1. Get audits assigned to logged-in auditor.
           * 2. Get findings for those audits.
           *
           * This avoids auditorId / employeeId mismatch.
           */

          const auditsResponse =
            await getMyAssignedAudits();

          const assignedAudits =
            normalizeArray(
              auditsResponse
            );

          setAudits(
            assignedAudits
          );


          /* ====================================================
             LOAD FINDINGS FOR ASSIGNED AUDITS
          ==================================================== */

          let assignedFindings = [];

          if (
            assignedAudits.length > 0
          ) {
            const findingRequests =
              assignedAudits
                .map(
                  (audit) =>
                    getAuditDatabaseId(
                      audit
                    )
                )
                .filter(Boolean)
                .map(
                  async (auditId) => {
                    try {
                      const response =
                        await getFindingsByAuditId(
                          auditId
                        );

                      return normalizeArray(
                        response
                      );
                    } catch (findingError) {
                      console.error(
                        `Failed to load findings for audit ${auditId}:`,
                        findingError?.response
                          ?.data ||
                          findingError
                      );

                      return [];
                    }
                  }
                );

            const findingsResults =
              await Promise.all(
                findingRequests
              );

            assignedFindings =
              findingsResults.flat();
          }

          /*
           * Remove duplicate findings
           */
          const uniqueFindings =
            Array.from(
              new Map(
                assignedFindings.map(
                  (finding, index) => [
                    finding?.id ??
                      finding?.findingId ??
                      `finding-${index}`,
                    finding,
                  ]
                )
              ).values()
            );

          setFindings(
            uniqueFindings
          );


          /* ====================================================
             NOTIFICATIONS
          ==================================================== */

          try {
            const unreadResponse =
              await NotificationService.getUnreadCount();

            const count =
              typeof unreadResponse?.data ===
              "number"
                ? unreadResponse.data
                : unreadResponse?.data
                    ?.count ??
                  unreadResponse?.data
                    ?.data ??
                  null;

            setUnreadCount(
              count
            );
          } catch (
            notificationError
          ) {
            console.error(
              "Failed to load notification count:",
              notificationError?.response
                ?.data ||
                notificationError
            );

            setUnreadCount(null);
          }
        } catch (err) {
          console.error(
            "Dashboard load failed:",
            err
          );

          const status =
            err?.response?.status;

          let message =
            "Something went wrong while loading dashboard data.";

          if (!err?.response) {
            message =
              "Unable to connect to the server. Please try again.";
          } else if (
            status === 401
          ) {
            message =
              "Your session has expired. Please sign in again.";
          } else if (
            status === 403
          ) {
            message =
              "You do not have permission to view this dashboard.";
          } else if (
            status === 404
          ) {
            message =
              "Assigned audit data could not be found.";
          } else if (
            status === 500
          ) {
            message =
              "Something went wrong on the server.";
          }

          setError(
            message
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );


  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);


  /* ==========================================================
     STATS
  ========================================================== */

  const stats =
    useMemo(() => {
      const norm = (s) =>
        (s || "").toUpperCase();

      const assigned =
        audits.length;

      const inProgress =
        audits.filter(
          (audit) =>
            norm(
              audit.status
            ) === "IN_PROGRESS"
        ).length;

      const pending =
        audits.filter(
          (audit) =>
            [
              "PLANNED",
              "PENDING",
            ].includes(
              norm(
                audit.status
              )
            )
        ).length;

      const completed =
        audits.filter(
          (audit) =>
            norm(
              audit.status
            ) === "COMPLETED"
        ).length;

      const openFindings =
        findings.filter(
          (finding) =>
            ![
              "CLOSED",
              "RESOLVED",
            ].includes(
              norm(
                finding.status
              )
            )
        ).length;

      const highCritical =
        findings.filter(
          (finding) =>
            [
              "HIGH",
              "CRITICAL",
            ].includes(
              norm(
                finding.riskLevel
              )
            )
        ).length;

      return {
        assigned,
        inProgress,
        pending,
        completed,
        openFindings,
        highCritical,
      };
    }, [
      audits,
      findings,
    ]);


  /* ==========================================================
     AUDIT STATUS CHART
  ========================================================== */

  const auditStatusChartData =
    useMemo(() => {
      const norm = (s) =>
        (s || "PENDING").toUpperCase();

      const counts = {};

      audits.forEach(
        (audit) => {
          const key =
            norm(
              audit.status
            );

          counts[key] =
            (counts[key] || 0) +
            1;
        }
      );

      return Object.entries(
        counts
      )
        .map(
          ([key, value]) => ({
            name:
              formatLabel(
                key
              ),
            value,
            color:
              AUDIT_STATUS_COLORS[
                key
              ] ||
              "#94A3B8",
          })
        )
        .sort(
          (a, b) =>
            b.value -
            a.value
        );
    }, [audits]);


  /* ==========================================================
     FINDINGS CHART
  ========================================================== */

  const findingsChartData =
    useMemo(() => {
      const norm = (s) =>
        (s || "").toUpperCase();

      const counts = {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        LOW: 0,
      };

      findings.forEach(
        (finding) => {
          const key =
            norm(
              finding.riskLevel
            );

          if (
            counts[key] !==
            undefined
          ) {
            counts[key] += 1;
          }
        }
      );

      return Object.entries(
        counts
      )
        .filter(
          ([, value]) =>
            value > 0
        )
        .map(
          ([key, value]) => ({
            name:
              formatLabel(
                key
              ),
            value,
            color:
              RISK_LEVEL_COLORS[
                key
              ],
          })
        );
    }, [findings]);


  /* ==========================================================
     UPCOMING DEADLINES
  ========================================================== */

  const upcomingDeadlines =
    useMemo(() => {
      return audits
        .filter(
          (audit) => {
            const status =
              (
                audit.status ||
                ""
              ).toUpperCase();

            return (
              status !==
                "COMPLETED" &&
              status !==
                "CANCELLED" &&
              getDueDate(
                audit
              )
            );
          }
        )
        .map(
          (audit) => ({
            ...audit,
            _due:
              daysUntil(
                getDueDate(
                  audit
                )
              ),
          })
        )
        .sort(
          (a, b) =>
            (a._due ??
              9999) -
            (b._due ??
              9999)
        )
        .slice(0, 6);
    }, [audits]);


  /* ==========================================================
     ATTENTION ITEMS
  ========================================================== */

  const attentionItems =
    useMemo(() => {
      const items = [];

      audits.forEach(
        (audit) => {
          const status =
            (
              audit.status ||
              ""
            ).toUpperCase();

          if (
            status ===
              "COMPLETED" ||
            status ===
              "CANCELLED"
          ) {
            return;
          }

          const due =
            daysUntil(
              getDueDate(
                audit
              )
            );

          if (
            due !== null &&
            due < 0
          ) {
            items.push({
              type: "overdue",

              title:
                getAuditName(
                  audit
                ),

              subtitle:
                `Overdue by ${Math.abs(
                  due
                )} day${
                  Math.abs(
                    due
                  ) === 1
                    ? ""
                    : "s"
                }`,

              audit,
            });
          } else if (
            due !== null &&
            due <= 3
          ) {
            items.push({
              type: "due-soon",

              title:
                getAuditName(
                  audit
                ),

              subtitle:
                due === 0
                  ? "Due today"
                  : `Due in ${due} day${
                      due === 1
                        ? ""
                        : "s"
                    }`,

              audit,
            });
          }
        }
      );


      findings
        .filter(
          (finding) =>
            [
              "HIGH",
              "CRITICAL",
            ].includes(
              (
                finding.riskLevel ||
                ""
              ).toUpperCase()
            )
        )
        .filter(
          (finding) =>
            ![
              "CLOSED",
              "RESOLVED",
            ].includes(
              (
                finding.status ||
                ""
              ).toUpperCase()
            )
        )
        .forEach(
          (finding) => {
            items.push({
              type: "finding",

              title: safeText(
                finding.title ||
                finding.findingTitle ||
                finding.description ||
                "Finding"
              ),

              subtitle:
                `${formatLabel(
                  finding.riskLevel
                )}-risk finding identified`,

              finding,
            });
          }
        );

      return items;
    }, [
      audits,
      findings,
    ]);


  /* ==========================================================
     RECENT ACTIVITY
  ========================================================== */

  const recentActivity =
    useMemo(() => {
      const events = [];

      audits.forEach(
        (audit) => {
          const status =
            (
              audit.status ||
              ""
            ).toUpperCase();

          const timestamp =
            audit.updatedAt ||
            audit.createdAt;

          if (!timestamp) {
            return;
          }

          events.push({
            ts: timestamp,

            icon:
              status ===
              "COMPLETED"
                ? CheckCircle2
                : Activity,

            title:
              status ===
              "COMPLETED"
                ? "Audit completed"
                : "Audit updated",

            detail:
              getAuditName(
                audit
              ),
          });
        }
      );


      findings.forEach(
        (finding) => {
          const timestamp =
            finding.createdAt ||
            finding.identifiedDate ||
            finding.updatedAt;

          if (!timestamp) {
            return;
          }

          events.push({
            ts: timestamp,

            icon:
              FileWarning,

            title:
              "Finding created",

            detail: safeText(
              finding.title ||
              finding.findingTitle ||
              finding.description ||
              "Untitled finding"
            ),
          });
        }
      );


      return events
        .sort(
          (a, b) =>
            new Date(b.ts) -
            new Date(a.ts)
        )
        .slice(0, 6);
    }, [
      audits,
      findings,
    ]);


  /* ==========================================================
     PERFORMANCE
  ========================================================== */

  const performanceMetrics =
    useMemo(() => {
      if (
        audits.length === 0
      ) {
        return [];
      }

      const completedCount =
        audits.filter(
          (audit) =>
            (
              audit.status ||
              ""
            ).toUpperCase() ===
            "COMPLETED"
        ).length;

      return [
        {
          label:
            "Audit Completion Rate",

          value:
            Math.round(
              (completedCount /
                audits.length) *
                100
            ),
        },
      ];
    }, [audits]);


  /* ==========================================================
     DEADLINE TONE
  ========================================================== */

  const deadlineTone = (
    days
  ) => {
    if (days === null) {
      return "text-gray-500 bg-gray-50";
    }

    if (days < 0) {
      return "text-red-600 bg-red-50";
    }

    if (days <= 3) {
      return "text-amber-600 bg-amber-50";
    }

    return "text-[#00A874] bg-[#E5FAF3]";
  };


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <Shimmer className="h-16 w-full rounded-2xl" />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <KpiSkeleton
              key={index}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>

        <CardSkeleton height="h-72" />
      </div>
    );
  }


  /* ==========================================================
     ERROR
  ========================================================== */

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
          <AlertOctagon
            size={25}
          />
        </div>

        <h3 className="text-base font-bold text-[#101A33] mb-1.5">
          Unable to load dashboard
        </h3>

        <p className="text-sm text-gray-500 mb-4 max-w-sm">
          {error}
        </p>

        <button
          type="button"
          onClick={() =>
            fetchDashboard()
          }
          className="flex items-center gap-1.5 bg-[#00C98B] hover:bg-[#00A874] text-white text-sm font-semibold rounded-lg px-5 py-2.5 transition active:scale-95"
        >
          <RefreshCw
            size={14}
          />

          Retry
        </button>
      </div>
    );
  }


  /* ==========================================================
     MAIN UI
  ========================================================== */

  return (
    <div className="w-full space-y-6 pb-10">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-bold text-[#101A33]">
            {getGreeting()},
            {" "}
            {auditorName}
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Monitor your assigned audits,
            findings and upcoming deadlines.
          </p>
        </div>


        <div className="flex items-center gap-2.5">

          {/* Notifications */}

          <button
            type="button"
            aria-label="Notifications"
            onClick={() =>
              navigate(
                "/internal-auditor/notifications"
              )
            }
            className="relative w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 transition"
          >
            <Bell size={18} />

            {unreadCount !==
              null &&
              unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount >
                  99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
          </button>


          {/* Refresh */}

          <button
            type="button"
            onClick={() =>
              fetchDashboard(
                true
              )
            }
            disabled={
              refreshing
            }
            aria-label="Refresh dashboard"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition active:scale-95 disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>
      </motion.div>


      {/* ======================================================
          WELCOME SUMMARY
      ====================================================== */}

      <SectionCard
        title=""
        delay={0.05}
        className="!p-0 overflow-hidden bg-gradient-to-r from-white to-[#FAFFFD]"
      >
        <div className="p-5 flex flex-wrap items-center justify-between gap-4">

          <div>
            <p className="text-sm font-semibold text-[#101A33] mb-2">
              Here's your audit activity overview for today.
            </p>

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">

              <span>
                Assigned audits:
                {" "}
                <strong className="text-[#101A33]">
                  {stats.assigned}
                </strong>
              </span>

              <span>
                In-progress audits:
                {" "}
                <strong className="text-[#101A33]">
                  {stats.inProgress}
                </strong>
              </span>

              <span>
                Open findings:
                {" "}
                <strong className="text-[#101A33]">
                  {stats.openFindings}
                </strong>
              </span>
            </div>
          </div>


          <button
            type="button"
            onClick={() =>
              navigate(
                ROUTES.myAudits
              )
            }
            className="flex items-center gap-1.5 bg-[#00C98B] hover:bg-[#00A874] text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition active:scale-95 shrink-0"
          >
            View My Audits

            <ChevronRight
              size={15}
            />
          </button>
        </div>
      </SectionCard>


      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">

        <KpiCard
          title="Assigned Audits"
          value={
            stats.assigned
          }
          icon={
            ClipboardList
          }
          index={0}
        />

        <KpiCard
          title="In Progress"
          value={
            stats.inProgress
          }
          icon={
            PlayCircle
          }
          subtext="Currently active"
          tone="blue"
          index={1}
        />

        <KpiCard
          title="Pending"
          value={
            stats.pending
          }
          icon={Clock3}
          subtext="Requires attention"
          tone="amber"
          index={2}
        />

        <KpiCard
          title="Completed"
          value={
            stats.completed
          }
          icon={
            CheckCircle2
          }
          tone="green"
          index={3}
        />

        <KpiCard
          title="Open Findings"
          value={
            stats.openFindings
          }
          icon={
            FileWarning
          }
          subtext="Across assigned audits"
          index={4}
        />

        <KpiCard
          title="High Risk Findings"
          value={
            stats.highCritical
          }
          icon={
            ShieldAlert
          }
          subtext="Immediate attention"
          tone="red"
          index={5}
        />
      </div>


      {/* ======================================================
          STATUS + DEADLINES
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <SectionCard
          title="Audit Status Overview"
          delay={0.1}
        >
          {auditStatusChartData.length ===
          0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">
              No audit status data available.
            </p>
          ) : (
            <div className="h-56">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>

                  <Pie
                    data={
                      auditStatusChartData
                    }
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    isAnimationActive
                    animationDuration={700}
                  >
                    {auditStatusChartData.map(
                      (entry) => (
                        <Cell
                          key={
                            entry.name
                          }
                          fill={
                            entry.color
                          }
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip />

                </PieChart>
              </ResponsiveContainer>


              <div className="flex flex-wrap justify-center gap-4 -mt-2">
                {auditStatusChartData.map(
                  (entry) => (
                    <div
                      key={
                        entry.name
                      }
                      className="flex items-center gap-1.5 text-xs text-gray-600"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            entry.color,
                        }}
                      />

                      {
                        entry.name
                      }

                      {" ("}
                      {
                        entry.value
                      }
                      {")"}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </SectionCard>


        <SectionCard
          title="Upcoming Audit Deadlines"
          delay={0.15}
          action={
            <button
              type="button"
              onClick={() =>
                navigate(
                  ROUTES.myAudits
                )
              }
              className="text-xs font-semibold text-[#00A874] hover:underline"
            >
              View All Audits
            </button>
          }
        >
          {upcomingDeadlines.length ===
          0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">
              No upcoming deadlines.
            </p>
          ) : (
            <ul className="space-y-3">

              {upcomingDeadlines.map(
                (audit) => {
                  const due =
                    audit._due;

                  return (
                    <li
                      key={
                        getAuditDatabaseId(
                          audit
                        ) ||
                        getAuditDisplayId(
                          audit
                        )
                      }
                      className="flex items-center justify-between gap-3"
                    >
                      <div>

                        <p className="text-sm font-semibold text-[#101A33]">
                          {
                            getAuditName(
                              audit
                            )
                          }
                        </p>

                        <p className="text-xs text-gray-400">
                          {formatDate(
                            getDueDate(
                              audit
                            )
                          )}
                        </p>
                      </div>


                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${deadlineTone(
                          due
                        )}`}
                      >
                        {due ===
                        null
                          ? "—"
                          : due <
                            0
                          ? `Overdue ${Math.abs(
                              due
                            )}d`
                          : due ===
                            0
                          ? "Due today"
                          : `Due in ${due}d`}
                      </span>
                    </li>
                  );
                }
              )}
            </ul>
          )}
        </SectionCard>
      </div>


      {/* ======================================================
          PROGRESS + FINDINGS
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <SectionCard
          title="Audit Progress"
          delay={0.2}
        >
          {audits.length ===
          0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">
              No assigned audits yet.
            </p>
          ) : (
            <ul className="space-y-4">

              {audits
                .slice(0, 6)
                .map(
                  (audit) => {

                    const status =
                      (
                        audit.status ||
                        ""
                      ).toUpperCase();

                    const progress =
                      status ===
                      "COMPLETED"
                        ? 100
                        : status ===
                          "IN_PROGRESS"
                        ? 60
                        : 25;

                    return (
                      <li
                        key={
                          getAuditDatabaseId(
                            audit
                          ) ||
                          getAuditDisplayId(
                            audit
                          )
                        }
                      >

                        <div className="flex items-center justify-between mb-2">

                          <p className="text-sm font-medium text-[#101A33]">
                            {
                              getAuditName(
                                audit
                              )
                            }
                          </p>

                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E5FAF3] text-[#00A874]">
                            {formatLabel(
                              audit.status
                            )}
                          </span>
                        </div>


                        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">

                          <motion.div
                            className="h-full rounded-full bg-[#00C98B]"
                            initial={{
                              width: 0,
                            }}
                            animate={{
                              width: `${progress}%`,
                            }}
                            transition={{
                              duration: 0.6,
                              ease: "easeOut",
                            }}
                          />

                        </div>
                      </li>
                    );
                  }
                )}

            </ul>
          )}
        </SectionCard>


        <SectionCard
          title="Findings Overview"
          delay={0.25}
          action={
            <button
              type="button"
              onClick={() =>
                navigate(
                  ROUTES.findings
                )
              }
              className="text-xs font-semibold text-[#00A874] hover:underline"
            >
              View Findings
            </button>
          }
        >

          {findingsChartData.length ===
          0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">
              No findings recorded yet.
            </p>
          ) : (
            <div className="h-56">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={
                    findingsChartData
                  }
                  layout="vertical"
                  margin={{
                    left: 10,
                  }}
                >

                  <XAxis
                    type="number"
                    hide
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={70}
                    tick={{
                      fontSize: 12,
                      fill: "#475569",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    radius={[
                      0,
                      6,
                      6,
                      0,
                    ]}
                    isAnimationActive
                    animationDuration={
                      700
                    }
                  >
                    {findingsChartData.map(
                      (entry) => (
                        <Cell
                          key={
                            entry.name
                          }
                          fill={
                            entry.color
                          }
                        />
                      )
                    )}
                  </Bar>

                </BarChart>
              </ResponsiveContainer>

            </div>
          )}

        </SectionCard>
      </div>


      {/* ======================================================
          RECENT AUDITS
      ====================================================== */}

      <SectionCard
        title="Recent Audits"
        delay={0.3}
      >
        {audits.length ===
        0 ? (
          <p className="text-sm text-gray-400 py-10 text-center">
            No audits assigned to you yet.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-5">

            <table className="w-full min-w-[720px]">

              <thead>
                <tr className="border-b border-gray-100">

                  {[
                    "Audit ID",
                    "Audit Name",
                    "Department",
                    "Status",
                    "Due Date",
                    "",
                  ].map(
                    (heading) => (
                      <th
                        key={
                          heading
                        }
                        className="px-5 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500"
                      >
                        {
                          heading
                        }
                      </th>
                    )
                  )}

                </tr>
              </thead>


              <tbody>

                {audits
                  .slice(0, 6)
                  .map(
                    (audit) => {

                      const databaseId =
                        getAuditDatabaseId(
                          audit
                        );

                      return (
                        <tr
                          key={
                            databaseId ||
                            getAuditDisplayId(
                              audit
                            )
                          }
                          className="border-b border-gray-50 hover:bg-[#FAFFFD]"
                        >

                          <td className="px-5 py-3 text-sm font-bold text-[#101A33]">
                            {
                              getAuditDisplayId(
                                audit
                              )
                            }
                          </td>


                          <td className="px-5 py-3 text-sm text-[#101A33]">
                            {
                              getAuditName(
                                audit
                              )
                            }
                          </td>


                          <td className="px-5 py-3 text-xs text-gray-600">
                            {
                              getDepartment(
                                audit
                              )
                            }
                          </td>


                          <td className="px-5 py-3">

                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E5FAF3] text-[#00A874]">
                              {formatLabel(
                                audit.status
                              )}
                            </span>

                          </td>


                          <td className="px-5 py-3 text-xs text-gray-600">
                            {formatDate(
                              getDueDate(
                                audit
                              )
                            )}
                          </td>


                          <td className="px-5 py-3 text-right">

                            <button
                              type="button"
                              disabled={
                                !databaseId
                              }
                              onClick={() => {
                                if (
                                  databaseId
                                ) {
                                  navigate(
                                    `${ROUTES.auditDetails}/${databaseId}`
                                  );
                                }
                              }}
                              className="text-xs font-semibold text-[#00A874] hover:underline disabled:text-gray-300 disabled:no-underline"
                            >
                              Open
                            </button>

                          </td>

                        </tr>
                      );
                    }
                  )}

              </tbody>
            </table>
          </div>
        )}
      </SectionCard>


      {/* ======================================================
          ATTENTION + ACTIVITY
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <SectionCard
          title="Attention Required"
          delay={0.35}
        >

          {attentionItems.length ===
          0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">

              <CheckCircle2
                className="text-[#00A874] mb-2"
                size={28}
              />

              <p className="text-sm font-semibold text-[#101A33]">
                You're all caught up.
              </p>

            </div>
          ) : (
            <ul className="space-y-3">

              <AnimatePresence
                initial={false}
              >
                {attentionItems
                  .slice(0, 6)
                  .map(
                    (
                      item,
                      index
                    ) => (

                      <motion.li
                        key={`${item.type}-${index}`}
                        initial={{
                          opacity: 0,
                          y: 6,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay:
                            index *
                            0.04,
                        }}
                        className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 p-3"
                      >

                        <div className="flex items-start gap-2.5">

                          {item.type ===
                          "finding" ? (
                            <AlertOctagon
                              size={16}
                              className="text-red-500 mt-0.5 shrink-0"
                            />
                          ) : (
                            <AlertTriangle
                              size={16}
                              className={`mt-0.5 shrink-0 ${
                                item.type ===
                                "overdue"
                                  ? "text-red-500"
                                  : "text-amber-500"
                              }`}
                            />
                          )}


                          <div>

                            <p className="text-sm font-semibold text-[#101A33]">
                              {
                                item.title
                              }
                            </p>

                            <p className="text-xs text-gray-500">
                              {
                                item.subtitle
                              }
                            </p>

                          </div>
                        </div>


                        <button
                          type="button"
                          onClick={() => {

                            if (
                              item.type ===
                              "finding"
                            ) {
                              navigate(
                                ROUTES.findings
                              );

                              return;
                            }

                            const id =
                              getAuditDatabaseId(
                                item.audit
                              );

                            if (id) {
                              navigate(
                                `${ROUTES.myAudits}/${id}`
                              );
                            }
                          }}
                          className="text-xs font-semibold text-[#00A874] hover:underline shrink-0"
                        >
                          {item.type ===
                          "finding"
                            ? "View Finding"
                            : "Open"}
                        </button>

                      </motion.li>
                    )
                  )}
              </AnimatePresence>

            </ul>
          )}

        </SectionCard>


        <SectionCard
          title="Recent Activity"
          delay={0.4}
        >

          {recentActivity.length ===
          0 ? (
            <p className="text-sm text-gray-400 py-10 text-center">
              No recent activity available.
            </p>
          ) : (
            <ul className="space-y-4">

              {recentActivity.map(
                (
                  event,
                  index
                ) => {

                  const Icon =
                    event.icon;

                  return (
                    <li
                      key={index}
                      className="flex items-start gap-3"
                    >

                      <div className="w-7 h-7 rounded-full bg-[#E5FAF3] text-[#00A874] flex items-center justify-center shrink-0 mt-0.5">

                        <Icon
                          size={14}
                        />

                      </div>


                      <div>

                        <p className="text-sm font-medium text-[#101A33]">
                          {
                            event.title
                          }
                        </p>

                        <p className="text-xs text-gray-500">
                          {
                            event.detail
                          }
                        </p>

                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {formatRelativeTime(
                            event.ts
                          )}
                        </p>

                      </div>

                    </li>
                  );
                }
              )}

            </ul>
          )}

        </SectionCard>

      </div>


      {/* ======================================================
          PERFORMANCE
      ====================================================== */}

      {performanceMetrics.length >
        0 && (
        <SectionCard
          title="Audit Performance"
          delay={0.45}
        >

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {performanceMetrics.map(
              (metric) => (
                <div
                  key={
                    metric.label
                  }
                >

                  <div className="flex items-center justify-between mb-1.5">

                    <span className="text-sm text-gray-600">
                      {
                        metric.label
                      }
                    </span>

                    <span className="text-sm font-bold text-[#101A33]">
                      {
                        metric.value
                      }%
                    </span>

                  </div>


                  <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">

                    <motion.div
                      className="h-full rounded-full bg-[#00C98B]"
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${metric.value}%`,
                      }}
                      transition={{
                        duration: 0.7,
                        ease: "easeOut",
                      }}
                    />

                  </div>

                </div>
              )
            )}


            <div>

              <p className="text-sm text-gray-600">
                Findings Identified
              </p>

              <p className="text-2xl font-bold text-[#101A33] mt-1">
                <AnimatedNumber
                  value={
                    findings.length
                  }
                />
              </p>

            </div>

          </div>

        </SectionCard>
      )}


      {/* ======================================================
          QUICK ACTIONS
      ====================================================== */}

      <SectionCard
        title="Quick Actions"
        delay={0.5}
      >

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

          {[
            {
              label:
                "My Assigned Audits",
              icon:
                ClipboardList,
              route:
                ROUTES.myAudits,
            },
            {
              label:
                "Findings",
              icon:
                FileWarning,
              route:
                ROUTES.findings,
            },
            {
              label:
                "Evidence",
              icon:
                FileCheck,
              route:
                ROUTES.evidence,
            },
            {
              label:
                "Recommendations",
              icon:
                Lightbulb,
              route:
                ROUTES.recommendations,
            },
          ].map(
            (
              action,
              index
            ) => {

              const Icon =
                action.icon;

              return (
                <motion.button
                  key={
                    action.label
                  }
                  type="button"
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      0.5 +
                      index *
                        0.04,
                  }}
                  whileTap={{
                    scale: 0.96,
                  }}
                  onClick={() =>
                    navigate(
                      action.route
                    )
                  }
                  className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-4 text-center hover:border-[#00C98B] hover:bg-[#FAFFFD] transition"
                >

                  <div className="w-9 h-9 rounded-lg bg-[#E5FAF3] text-[#00A874] flex items-center justify-center">

                    <Icon
                      size={17}
                    />

                  </div>


                  <span className="text-xs font-semibold text-[#101A33]">
                    {
                      action.label
                    }
                  </span>

                </motion.button>
              );
            }
          )}

        </div>

      </SectionCard>

    </div>
  );
}