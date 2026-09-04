
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  Filter,
  LayoutDashboard,
  RefreshCw,
  Search,
  ShieldCheck,
  Target,
  Users,
  X,
} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

import AuditService from "../../service/AuditService";
import auditeeAssignmentService from "../../service/auditeeAssignmentService";

// ============================================================
// STATUS CONFIG
// ============================================================

const STATUS_CONFIG = {
  PLANNED: {
    label: "Planned",
    className:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  ASSIGNED: {
    label: "Assigned",
    className:
      "bg-indigo-50 text-indigo-700 border-indigo-200",
  },

  IN_PROGRESS: {
    label: "In Progress",
    className:
      "bg-amber-50 text-amber-700 border-amber-200",
  },

  FIELDWORK_COMPLETED: {
    label: "Fieldwork Completed",
    className:
      "bg-purple-50 text-purple-700 border-purple-200",
  },

  UNDER_REVIEW: {
    label: "Under Review",
    className:
      "bg-orange-50 text-orange-700 border-orange-200",
  },

  COMPLETED: {
    label: "Completed",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  OVERDUE: {
    label: "Overdue",
    className:
      "bg-red-50 text-red-700 border-red-200",
  },

  CANCELLED: {
    label: "Cancelled",
    className:
      "bg-gray-100 text-gray-600 border-gray-200",
  },
};

// ============================================================
// STATUS COLORS
// ============================================================

const STATUS_COLORS = {
  PLANNED: "#3b82f6",
  ASSIGNED: "#6366f1",
  IN_PROGRESS: "#f59e0b",
  FIELDWORK_COMPLETED: "#8b5cf6",
  UNDER_REVIEW: "#f97316",
  COMPLETED: "#10b981",
  OVERDUE: "#ef4444",
  CANCELLED: "#94a3b8",
};

// ============================================================
// HELPERS
// ============================================================

const normalizeStatus = (status) => {
  if (!status) return "PLANNED";

  return String(status)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
};

const formatStatus = (status) => {
  const normalized = normalizeStatus(status);

  if (STATUS_CONFIG[normalized]) {
    return STATUS_CONFIG[normalized].label;
  }

  return normalized
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

const formatDate = (date) => {
  if (!date) return "—";

  try {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return date;
  }
};

const getDaysDifference = (
  startDate,
  endDate
) => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const difference =
    end.getTime() - start.getTime();

  return Math.max(
    1,
    Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    )
  );
};

// ============================================================
// GET VALUE FROM POSSIBLE OBJECT FIELDS
// ============================================================

const getValue = (obj, fields) => {
  if (!obj) return null;

  for (const field of fields) {
    if (
      obj[field] !== undefined &&
      obj[field] !== null &&
      obj[field] !== ""
    ) {
      return obj[field];
    }
  }

  return null;
};

// ============================================================
// DEPARTMENT ENTITY HANDLER
//
// CAE can see ALL departments.
//
// Backend may return:
// department: "INFORMATION_TECHNOLOGY"
//
// OR:
//
// department: {
//   id: 1,
//   name: "Information Technology"
// }
//
// OR:
//
// department: {
//   departmentName: "Information Technology"
// }
//
// OR:
//
// department: {
//   departmentCode: "IT"
// }
//
// OR departmentName directly.
// ============================================================

const getDepartmentName = (
  auditOrDepartment
) => {
  if (!auditOrDepartment) return null;

  // ----------------------------------------------------------
  // CASE 1: department itself is a string
  // ----------------------------------------------------------

  if (
    typeof auditOrDepartment === "string"
  ) {
    return auditOrDepartment.trim();
  }

  // ----------------------------------------------------------
  // CASE 2: object
  // ----------------------------------------------------------

  if (
    typeof auditOrDepartment ===
      "object" &&
    !Array.isArray(
      auditOrDepartment
    )
  ) {
    // If this is an audit object,
    // first extract its department entity.
    const department =
      auditOrDepartment.department ??
      auditOrDepartment;

    // Department itself may be a string
    if (
      typeof department === "string"
    ) {
      return department.trim();
    }

    // Department entity
    if (
      department &&
      typeof department ===
        "object"
    ) {
      return (
        department.departmentName ||
        department.name ||
        department.department ||
        department.deptName ||
        department.departmentCode ||
        department.code ||
        department.label ||
        null
      );
    }

    // --------------------------------------------------------
    // DTO may expose department separately
    // --------------------------------------------------------

    return (
      auditOrDepartment.departmentName ||
      auditOrDepartment.department_name ||
      auditOrDepartment.deptName ||
      auditOrDepartment.dept_name ||
      auditOrDepartment.departmentCode ||
      auditOrDepartment.department_code ||
      null
    );
  }

  return null;
};

// ============================================================
// DEPARTMENT ID
// Useful when backend returns Department entity.
// ============================================================

const getDepartmentId = (
  auditOrDepartment
) => {
  if (!auditOrDepartment) return null;

  if (
    typeof auditOrDepartment !==
    "object"
  ) {
    return null;
  }

  const department =
    auditOrDepartment.department ??
    auditOrDepartment;

  if (
    !department ||
    typeof department !==
      "object"
  ) {
    return null;
  }

  return getValue(department, [
    "id",
    "departmentId",
    "department_id",
  ]);
};

// ============================================================
// NORMALIZE DEPARTMENT
// ============================================================

const normalizeDepartment = (
  value
) => {
  const department =
    getDepartmentName(value);

  if (!department) return "";

  return String(department)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
};

// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({
  status,
}) => {
  const normalized =
    normalizeStatus(status);

  const config =
    STATUS_CONFIG[
      normalized
    ] || {
      label:
        formatStatus(
          normalized
        ),
      className:
        "bg-gray-50 text-gray-700 border-gray-200",
    };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {config.label}
    </span>
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
  iconClass,
  delay = 0,
}) => {
  return (
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
        duration: 0.45,
        delay,
      }}
      whileHover={{
        y: -5,
      }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-xl"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <motion.h3
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: delay + 0.2,
            }}
            className="mt-2 text-3xl font-bold tracking-tight text-slate-900"
          >
            {value}
          </motion.h3>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`rounded-xl p-3 ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-slate-50 transition-transform duration-500 group-hover:scale-150" />
    </motion.div>
  );
};

// ============================================================
// EMPTY STATE
// ============================================================

const EmptyState = ({
  searchActive,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="rounded-full bg-slate-100 p-5">
        <ShieldCheck
          size={36}
          className="text-slate-400"
        />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-slate-800">
        {searchActive
          ? "No audits found"
          : "No audits available"}
      </h3>

      <p className="mt-1 max-w-md text-center text-sm text-slate-500">
        {searchActive
          ? "Try changing your search or filter criteria."
          : "There are currently no audits available in the portfolio."}
      </p>
    </div>
  );
};

// ============================================================
// DETAIL ITEM
// ============================================================

const DetailItem = ({
  label,
  value,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-slate-800">
        {value || "—"}
      </p>
    </div>
  );
};

// ============================================================
// AUDIT DETAILS MODAL
// ============================================================

const AuditDetailsModal = ({
  audit,
  onClose,
}) => {
  if (!audit) return null;

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
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: 20,
          }}
          transition={{
            duration: 0.25,
          }}
          onClick={(event) =>
            event.stopPropagation()
          }
          className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        >
          {/* HEADER */}

          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-900 p-2.5">
                  <ShieldCheck
                    size={20}
                    className="text-white"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {audit.auditName ||
                      "Audit Details"}
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500">
                    {audit.auditId ||
                      audit.auditCode ||
                      "—"}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* CONTENT */}

          <div className="space-y-6 p-6">
            {/* STATUS */}

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Current Status
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={
                      audit.status
                    }
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Audit ID
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {audit.auditId ||
                    audit.auditCode ||
                    "—"}
                </p>
              </div>
            </div>

            {/* INFORMATION GRID */}

            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                Audit Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <DetailItem
                  label="Risk ID"
                  value={
                    audit.riskId
                  }
                />

                <DetailItem
                  label="Risk Title"
                  value={
                    audit.riskTitle
                  }
                />

                <DetailItem
                  label="Department"
                  value={getDepartmentName(
                    audit
                  )}
                />

                <DetailItem
                  label="Department ID"
                  value={getDepartmentId(
                    audit
                  )}
                />

                <DetailItem
                  label="Business Unit"
                  value={
                    audit.businessUnit
                  }
                />

                <DetailItem
                  label="Process"
                  value={
                    audit.processName
                  }
                />

                <DetailItem
                  label="Start Date"
                  value={formatDate(
                    audit.startDate
                  )}
                />

                <DetailItem
                  label="End Date"
                  value={formatDate(
                    audit.endDate
                  )}
                />

                <DetailItem
                  label="Internal Auditor"
                  value={
                    audit.internalAuditorName
                  }
                />

                <DetailItem
                  label="Auditee"
                  value={
                    audit.auditeeName
                  }
                />

                <DetailItem
                  label="Auditee ID"
                  value={
                    audit.auditeeId
                  }
                />
              </div>
            </div>

            {/* DESCRIPTION */}

            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
                Description
              </h3>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                  {audit.description ||
                    "No description available."}
                </p>
              </div>
            </div>

            {/* TIMELINE */}

            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">
                Timeline
              </h3>

              <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Calendar
                      size={18}
                      className="text-blue-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Planned Start
                    </p>

                    <p className="font-semibold text-slate-800">
                      {formatDate(
                        audit.startDate
                      )}
                    </p>
                  </div>

                  <div className="mx-2 hidden h-px flex-1 bg-slate-300 md:block" />

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2
                      size={18}
                      className="text-emerald-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Planned End
                    </p>

                    <p className="font-semibold text-slate-800">
                      {formatDate(
                        audit.endDate
                      )}
                    </p>
                  </div>
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
// MAIN COMPONENT
// ============================================================

const CAEAuditPortfolio = () => {
  const [audits, setAudits] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState("ALL");

  const [selectedAudit, setSelectedAudit] =
    useState(null);

  const [showFilters, setShowFilters] =
    useState(false);

  // ==========================================================
  // EXTRACT ARRAY
  // ==========================================================

  const extractArray = (
    response
  ) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (
      response?.data &&
      Array.isArray(
        response.data
      )
    ) {
      return response.data;
    }

    if (
      response?.content &&
      Array.isArray(
        response.content
      )
    ) {
      return response.content;
    }

    if (
      response?.data?.content &&
      Array.isArray(
        response.data.content
      )
    ) {
      return response.data.content;
    }

    return [];
  };

  // ==========================================================
  // FIND AUDIT ID FROM ASSIGNMENT
  // ==========================================================

  const getAssignmentAuditId = (
    assignment
  ) => {
    return getValue(
      assignment,
      [
        "auditId",
        "auditDbId",
        "audit_id",
        "auditID",
      ]
    );
  };

  // ==========================================================
  // FIND AUDITEE ID
  // ==========================================================

  const getAssignmentAuditeeId = (
    assignment
  ) => {
    return getValue(
      assignment,
      [
        "auditeeId",
        "auditeeUserId",
        "userId",
        "auditee_id",
      ]
    );
  };

  // ==========================================================
  // FIND AUDITEE NAME
  // ==========================================================

  const getAssignmentAuditeeName = (
    assignment
  ) => {
    const directName =
      getValue(
        assignment,
        [
          "auditeeName",
          "userName",
          "name",
          "fullName",
          "auditeeFullName",
        ]
      );

    if (directName) {
      return directName;
    }

    const auditee =
      assignment?.auditee ||
      assignment?.user ||
      assignment?.auditeeUser;

    if (auditee) {
      const nestedFullName =
        getValue(
          auditee,
          [
            "fullName",
            "name",
          ]
        );

      if (nestedFullName) {
        return nestedFullName;
      }

      const firstName =
        getValue(
          auditee,
          [
            "firstName",
            "firstname",
          ]
        );

      const lastName =
        getValue(
          auditee,
          [
            "lastName",
            "lastname",
          ]
        );

      if (
        firstName ||
        lastName
      ) {
        return `${firstName || ""} ${
          lastName || ""
        }`.trim();
      }

      const email =
        getValue(
          auditee,
          ["email"]
        );

      if (email) {
        return email;
      }
    }

    return null;
  };

  // ==========================================================
  // LOAD AUDITS + AUDITEE ASSIGNMENTS
  //
  // IMPORTANT:
  // CAE has enterprise-wide access.
  //
  // DO NOT filter audits by department here.
  // ==========================================================

  const loadAudits = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      // ------------------------------------------------------
      // GET ALL AUDITS
      // ------------------------------------------------------

      const auditResponse =
        await AuditService.getAllAudits();

      console.log(
        "CAE ALL AUDIT RESPONSE:",
        auditResponse
      );

      const auditList =
        extractArray(
          auditResponse
        );

      // ------------------------------------------------------
      // GET ALL AUDITEE ASSIGNMENTS
      // ------------------------------------------------------

      const assignmentResponse =
        await auditeeAssignmentService.getAllAssignments();

      console.log(
        "CAE ALL AUDITEE ASSIGNMENT RESPONSE:",
        assignmentResponse
      );

      const assignmentList =
        extractArray(
          assignmentResponse
        );

      // ------------------------------------------------------
      // MAP AUDITEE ASSIGNMENTS TO AUDITS
      // ------------------------------------------------------

      const enrichedAudits =
        auditList.map(
          (audit) => {
            // ------------------------------------------------
            // AUDIT DATABASE ID
            // ------------------------------------------------

            const auditDbId =
              getValue(
                audit,
                [
                  "id",
                  "auditDbId",
                ]
              );

            // ------------------------------------------------
            // AUDIT BUSINESS CODE
            // ------------------------------------------------

            const auditCode =
              getValue(
                audit,
                [
                  "auditId",
                  "auditCode",
                ]
              );

            // ------------------------------------------------
            // DEPARTMENT ENTITY
            // ------------------------------------------------

            const departmentName =
              getDepartmentName(
                audit
              );

            const departmentId =
              getDepartmentId(
                audit
              );

            // ------------------------------------------------
            // FIND AUDITEE ASSIGNMENT
            // ------------------------------------------------

            const assignment =
              assignmentList.find(
                (item) => {
                  const assignmentAuditId =
                    getAssignmentAuditId(
                      item
                    );

                  if (
                    assignmentAuditId ===
                      null ||
                    assignmentAuditId ===
                      undefined
                  ) {
                    return false;
                  }

                  return (
                    String(
                      assignmentAuditId
                    ) ===
                      String(
                        auditDbId
                      ) ||
                    String(
                      assignmentAuditId
                    ) ===
                      String(
                        auditCode
                      )
                  );
                }
              );

            // ------------------------------------------------
            // NO ASSIGNMENT
            // ------------------------------------------------

            if (!assignment) {
              return {
                ...audit,

                // Keep original Department entity
                department:
                  audit.department,

                // Add display-friendly department
                departmentName,

                departmentId,

                auditeeId:
                  null,

                auditeeName:
                  null,
              };
            }

            // ------------------------------------------------
            // AUDITEE ID
            // ------------------------------------------------

            const auditeeId =
              getAssignmentAuditeeId(
                assignment
              );

            // ------------------------------------------------
            // AUDITEE NAME
            // ------------------------------------------------

            const auditeeName =
              getAssignmentAuditeeName(
                assignment
              );

            console.log(
              "CAE AUDITEE MAPPING:",
              {
                auditDbId,
                auditCode,
                department:
                  audit.department,
                departmentName,
                departmentId,
                assignment,
                auditeeId,
                auditeeName,
              }
            );

            return {
              ...audit,

              department:
                audit.department,

              departmentName,

              departmentId,

              auditeeId,

              auditeeName:
                auditeeName ||
                (
                  auditeeId
                    ? `User #${auditeeId}`
                    : null
                ),

              auditeeAssignment:
                assignment,
            };
          }
        );

      console.log(
        "CAE FINAL ALL DEPARTMENT AUDITS:",
        enrichedAudits
      );

      // ======================================================
      // VERY IMPORTANT
      //
      // No department filtering here.
      //
      // CAE sees all departments.
      // ======================================================

      setAudits(
        enrichedAudits
      );
    } catch (err) {
      console.error(
        "Failed to load CAE audit portfolio:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
          err?.message ||
          "Failed to load audit portfolio."
      );

      setAudits([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadAudits();
  }, []);

  // ==========================================================
  // ALL DEPARTMENTS
  //
  // Extract departments from Department entity.
  // ==========================================================

  const departments =
    useMemo(() => {
      const values =
        audits
          .map((audit) =>
            getDepartmentName(
              audit
            )
          )
          .filter(Boolean)
          .map((department) =>
            String(
              department
            ).trim()
          )
          .filter(Boolean);

      return [
        ...new Set(values),
      ].sort((a, b) =>
        a.localeCompare(b)
      );
    }, [audits]);

  // ==========================================================
  // FILTERED AUDITS
  // ==========================================================

  const filteredAudits =
    useMemo(() => {
      const searchValue =
        search
          .trim()
          .toLowerCase();

      return audits.filter(
        (audit) => {
          // --------------------------------------------------
          // STATUS FILTER
          // --------------------------------------------------

          const normalizedStatus =
            normalizeStatus(
              audit.status
            );

          const matchesStatus =
            statusFilter ===
              "ALL" ||
            normalizedStatus ===
              statusFilter;

          // --------------------------------------------------
          // DEPARTMENT FILTER
          //
          // Handles Department entity correctly.
          // --------------------------------------------------

          const auditDepartment =
            getDepartmentName(
              audit
            );

          const matchesDepartment =
            departmentFilter ===
              "ALL" ||
            normalizeDepartment(
              auditDepartment
            ) ===
              normalizeDepartment(
                departmentFilter
              );

          // --------------------------------------------------
          // SEARCH
          // --------------------------------------------------

          const searchableText = [
            audit.auditId,
            audit.auditCode,
            audit.auditName,
            audit.auditTitle,

            audit.riskId,
            audit.riskTitle,

            auditDepartment,

            audit.businessUnit,
            audit.processName,

            audit.internalAuditorName,
            audit.auditeeName,

            audit.description,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !searchValue ||
            searchableText.includes(
              searchValue
            );

          return (
            matchesStatus &&
            matchesDepartment &&
            matchesSearch
          );
        }
      );
    }, [
      audits,
      search,
      statusFilter,
      departmentFilter,
    ]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics =
    useMemo(() => {
      const total =
        audits.length;

      const planned =
        audits.filter(
          (audit) =>
            normalizeStatus(
              audit.status
            ) === "PLANNED"
        ).length;

      const assigned =
        audits.filter(
          (audit) =>
            normalizeStatus(
              audit.status
            ) === "ASSIGNED"
        ).length;

      const inProgress =
        audits.filter(
          (audit) =>
            [
              "IN_PROGRESS",
              "FIELDWORK_COMPLETED",
              "UNDER_REVIEW",
            ].includes(
              normalizeStatus(
                audit.status
              )
            )
        ).length;

      const completed =
        audits.filter(
          (audit) =>
            normalizeStatus(
              audit.status
            ) === "COMPLETED"
        ).length;

      const overdue =
        audits.filter(
          (audit) =>
            normalizeStatus(
              audit.status
            ) === "OVERDUE"
        ).length;

      const assignedAuditors =
        audits.filter(
          (audit) =>
            audit.internalAuditorId ||
            audit.internalAuditorName
        ).length;

      const assignedAuditees =
        audits.filter(
          (audit) =>
            audit.auditeeId ||
            audit.auditeeName
        ).length;

      return {
        total,
        planned,
        assigned,
        inProgress,
        completed,
        overdue,
        assignedAuditors,
        assignedAuditees,
      };
    }, [audits]);

  // ==========================================================
  // STATUS CHART
  // ==========================================================

  const statusChartData =
    useMemo(() => {
      const map = {};

      audits.forEach(
        (audit) => {
          const status =
            normalizeStatus(
              audit.status
            );

          if (!map[status]) {
            map[status] = 0;
          }

          map[status]++;
        }
      );

      return Object.entries(
        map
      )
        .map(
          ([
            status,
            count,
          ]) => ({
            name:
              formatStatus(
                status
              ),
            status,
            value: count,
          })
        )
        .sort(
          (a, b) =>
            b.value -
            a.value
        );
    }, [audits]);

  // ==========================================================
  // DEPARTMENT CHART
  // ==========================================================

  const departmentChartData =
    useMemo(() => {
      const map = {};

      audits.forEach(
        (audit) => {
          const department =
            getDepartmentName(
              audit
            ) ||
            "Unknown";

          if (!map[department]) {
            map[department] = 0;
          }

          map[department]++;
        }
      );

      return Object.entries(
        map
      )
        .map(
          ([
            name,
            value,
          ]) => ({
            name,
            value,
          })
        )
        .sort(
          (a, b) =>
            b.value -
            a.value
        )
        .slice(0, 8);
    }, [audits]);

  // ==========================================================
  // MONTHLY CHART
  // ==========================================================

  const monthlyChartData =
    useMemo(() => {
      const monthMap = {};

      audits.forEach(
        (audit) => {
          if (!audit.startDate)
            return;

          const date =
            new Date(
              audit.startDate
            );

          if (
            Number.isNaN(
              date.getTime()
            )
          ) {
            return;
          }

          const key =
            date.toLocaleDateString(
              "en-IN",
              {
                month: "short",
              }
            );

          if (!monthMap[key]) {
            monthMap[key] = 0;
          }

          monthMap[key]++;
        }
      );

      return Object.entries(
        monthMap
      ).map(
        ([
          month,
          auditsCount,
        ]) => ({
          month,
          audits:
            auditsCount,
        })
      );
    }, [audits]);

  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setDepartmentFilter(
      "ALL"
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="mx-auto max-w-[1600px]">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-72 rounded-xl bg-slate-100" />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
              {[
                1, 2, 3, 4, 5,
              ].map(
                (item) => (
                  <div
                    key={item}
                    className="h-32 rounded-2xl bg-slate-100"
                  />
                )
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="h-80 rounded-2xl bg-slate-100" />

              <div className="h-80 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (
    error &&
    audits.length === 0
  ) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle
                className="text-red-600"
                size={28}
              />
            </div>

            <h2 className="mt-4 text-xl font-bold text-red-900">
              Unable to Load Audit
              Portfolio
            </h2>

            <p className="mt-2 text-sm text-red-700">
              {error}
            </p>

            <button
              onClick={() =>
                loadAudits()
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <RefreshCw
                size={16}
              />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-[1600px] space-y-7 p-5 md:p-7 lg:p-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
          }}
          className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-900 p-3 shadow-lg">
                <LayoutDashboard
                  size={24}
                  className="text-white"
                />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Chief Audit Executive
                </p>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  Audit Portfolio
                </h1>
              </div>
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Enterprise-wide overview
              of audit activities,
              execution status,
              ownership, risk
              alignment, and portfolio
              progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{
                scale: 0.96,
              }}
              onClick={() =>
                loadAudits(true)
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error &&
          audits.length > 0 && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              <AlertTriangle
                size={17}
              />

              {error}
            </motion.div>
          )}

        {/* ==================================================
            STAT CARDS
        ================================================== */}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            title="Total Audits"
            value={
              statistics.total
            }
            subtitle="Enterprise portfolio"
            icon={ShieldCheck}
            iconClass="bg-slate-100 text-slate-700"
            delay={0}
          />

          <StatCard
            title="Planned"
            value={
              statistics.planned
            }
            subtitle="Awaiting execution"
            icon={Calendar}
            iconClass="bg-blue-50 text-blue-600"
            delay={0.05}
          />

          <StatCard
            title="In Progress"
            value={
              statistics.inProgress
            }
            subtitle="Currently active"
            icon={Activity}
            iconClass="bg-amber-50 text-amber-600"
            delay={0.1}
          />

          <StatCard
            title="Completed"
            value={
              statistics.completed
            }
            subtitle="Successfully closed"
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600"
            delay={0.15}
          />

          <StatCard
            title="Overdue"
            value={
              statistics.overdue
            }
            subtitle="Requires attention"
            icon={AlertTriangle}
            iconClass="bg-red-50 text-red-600"
            delay={0.2}
          />
        </div>

        {/* ==================================================
            SECONDARY METRICS
        ================================================== */}

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
            delay: 0.25,
          }}
          className="grid grid-cols-1 gap-5 md:grid-cols-3"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3">
                <Users
                  size={20}
                  className="text-indigo-600"
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Audits with Internal
                  Auditor
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {
                    statistics.assignedAuditors
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-50 p-3">
                <Target
                  size={20}
                  className="text-purple-600"
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Audits with Auditee
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {
                    statistics.assignedAuditees
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3">
                <BarChart3
                  size={20}
                  className="text-emerald-600"
                />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Completion Rate
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {statistics.total >
                  0
                    ? Math.round(
                        (statistics.completed /
                          statistics.total) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ==================================================
            CHARTS
        ================================================== */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* STATUS */}

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
              delay: 0.3,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4">
              <h2 className="font-bold text-slate-900">
                Audit Status
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Current portfolio
                distribution
              </p>
            </div>

            <div className="h-[300px]">
              {statusChartData.length >
              0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={
                        statusChartData
                      }
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {statusChartData.map(
                        (
                          entry,
                          index
                        ) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              STATUS_COLORS[
                                entry
                                  .status
                              ] ||
                              "#64748b"
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip />

                    <Legend
                      verticalAlign="bottom"
                      height={45}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No status data
                </div>
              )}
            </div>
          </motion.div>

          {/* DEPARTMENT */}

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
              delay: 0.35,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4">
              <h2 className="font-bold text-slate-900">
                Audits by Department
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Portfolio distribution
                across departments
              </p>
            </div>

            <div className="h-[300px]">
              {departmentChartData.length >
              0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      departmentChartData
                    }
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 10,
                      }}
                    />

                    <YAxis
                      allowDecimals={
                        false
                      }
                    />

                    <Tooltip />

                    <Bar
                      dataKey="value"
                      name="Audits"
                      fill="#334155"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No department data
                </div>
              )}
            </div>
          </motion.div>

          {/* MONTHLY */}

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
              delay: 0.4,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4">
              <h2 className="font-bold text-slate-900">
                Audit Timeline
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Audits scheduled by
                start month
              </p>
            </div>

            <div className="h-[300px]">
              {monthlyChartData.length >
              0 ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart
                    data={
                      monthlyChartData
                    }
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 5,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="auditArea"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#475569"
                          stopOpacity={
                            0.25
                          }
                        />

                        <stop
                          offset="95%"
                          stopColor="#475569"
                          stopOpacity={
                            0
                          }
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                    />

                    <YAxis
                      allowDecimals={
                        false
                      }
                    />

                    <Tooltip />

                    <Area
                      type="monotone"
                      dataKey="audits"
                      name="Audits"
                      stroke="#334155"
                      strokeWidth={2}
                      fill="url(#auditArea)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No timeline data
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ==================================================
            FILTER / SEARCH
        ================================================== */}

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
            delay: 0.45,
          }}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search audit, risk, department, auditor, auditee..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
                  setShowFilters(
                    !showFilters
                  )
                }
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  showFilters
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Filter
                  size={16}
                />

                Filters

                <ChevronDown
                  size={15}
                  className={
                    showFilters
                      ? "rotate-180 transition-transform"
                      : "transition-transform"
                  }
                />
              </button>

              {(search ||
                statusFilter !==
                  "ALL" ||
                departmentFilter !==
                  "ALL") && (
                <button
                  onClick={
                    resetFilters
                  }
                  className="text-sm font-semibold text-slate-500 hover:text-slate-900"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0,
                }}
                animate={{
                  height: "auto",
                  opacity: 1,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 md:grid-cols-2">

                  {/* STATUS */}

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Audit Status
                    </label>

                    <select
                      value={
                        statusFilter
                      }
                      onChange={(
                        event
                      ) =>
                        setStatusFilter(
                          event
                            .target
                            .value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
                    >
                      <option value="ALL">
                        All Statuses
                      </option>

                      {Object.keys(
                        STATUS_CONFIG
                      ).map(
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
                              STATUS_CONFIG[
                                status
                              ]
                                .label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* DEPARTMENT */}

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Department
                    </label>

                    <select
                      value={
                        departmentFilter
                      }
                      onChange={(
                        event
                      ) =>
                        setDepartmentFilter(
                          event
                            .target
                            .value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
                    >
                      <option value="ALL">
                        All Departments
                      </option>

                      {departments.map(
                        (
                          department
                        ) => (
                          <option
                            key={
                              department
                            }
                            value={
                              department
                            }
                          >
                            {
                              department
                            }
                          </option>
                        )
                      )}
                    </select>

                    <p className="mt-2 text-xs text-slate-400">
                      {
                        departments.length
                      }{" "}
                      department
                      {departments.length !==
                      1
                        ? "s"
                        : ""}{" "}
                      available
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ==================================================
            AUDIT TABLE
        ================================================== */}

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
            delay: 0.5,
          }}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-5 py-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Audit Portfolio
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Showing{" "}
                <span className="font-semibold text-slate-600">
                  {
                    filteredAudits.length
                  }
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-600">
                  {audits.length}
                </span>{" "}
                audits
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock
                size={14}
              />

              Read-only executive
              view
            </div>
          </div>

          {filteredAudits.length ===
          0 ? (
            <EmptyState
              searchActive={
                Boolean(search) ||
                statusFilter !==
                  "ALL" ||
                departmentFilter !==
                  "ALL"
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1350px] w-full">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Audit
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Risk
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Department
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Process
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Internal Auditor
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Auditee
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Timeline
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-400">
                      View
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredAudits.map(
                    (
                      audit,
                      index
                    ) => {
                      const status =
                        normalizeStatus(
                          audit.status
                        );

                      const duration =
                        getDaysDifference(
                          audit.startDate,
                          audit.endDate
                        );

                      const department =
                        getDepartmentName(
                          audit
                        ) ||
                        "Unknown Department";

                      return (
                        <motion.tr
                          key={
                            audit.id ||
                            audit.auditId ||
                            index
                          }
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
                              index *
                              0.025,
                          }}
                          className="group transition hover:bg-slate-50"
                        >

                          {/* AUDIT */}

                          <td className="px-5 py-4">
                            <div>
                              <p className="font-semibold text-slate-800">
                                {audit.auditName ||
                                  "Unnamed Audit"}
                              </p>

                              <p className="mt-1 text-xs font-medium text-slate-400">
                                {audit.auditId ||
                                  audit.auditCode ||
                                  `AUD-${audit.id}`}
                              </p>
                            </div>
                          </td>

                          {/* RISK */}

                          <td className="px-5 py-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-700">
                                {audit.riskId ||
                                  "—"}
                              </p>

                              <p className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                                {audit.riskTitle ||
                                  "No risk title"}
                              </p>
                            </div>
                          </td>

                          {/* DEPARTMENT */}

                          <td className="px-5 py-4">
                            <div>
                              <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                                {
                                  department
                                }
                              </span>

                              {getDepartmentId(
                                audit
                              ) && (
                                <p className="mt-1 text-[10px] text-slate-400">
                                  ID:{" "}
                                  {getDepartmentId(
                                    audit
                                  )}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* PROCESS */}

                          <td className="px-5 py-4">
                            <p className="max-w-[160px] truncate text-sm text-slate-600">
                              {audit.processName ||
                                "—"}
                            </p>
                          </td>

                          {/* INTERNAL AUDITOR */}

                          <td className="px-5 py-4">
                            {audit.internalAuditorName ? (
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                                  {audit.internalAuditorName
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </div>

                                <span className="text-sm font-medium text-slate-700">
                                  {
                                    audit.internalAuditorName
                                  }
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">
                                Not assigned
                              </span>
                            )}
                          </td>

                          {/* AUDITEE */}

                          <td className="px-5 py-4">
                            {audit.auditeeName ? (
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-xs font-bold text-purple-600">
                                  {audit.auditeeName
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </div>

                                <div>
                                  <p className="text-sm font-medium text-slate-700">
                                    {
                                      audit.auditeeName
                                    }
                                  </p>

                                  {audit.auditeeId && (
                                    <p className="text-[10px] text-slate-400">
                                      ID:{" "}
                                      {
                                        audit.auditeeId
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">
                                Not assigned
                              </span>
                            )}
                          </td>

                          {/* TIMELINE */}

                          <td className="px-5 py-4">
                            <div>
                              <p className="text-xs font-medium text-slate-700">
                                {formatDate(
                                  audit.startDate
                                )}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                to{" "}
                                {formatDate(
                                  audit.endDate
                                )}
                              </p>

                              {audit.startDate &&
                                audit.endDate && (
                                  <p className="mt-1 text-[10px] font-medium text-slate-400">
                                    {
                                      duration
                                    }{" "}
                                    days
                                  </p>
                                )}
                            </div>
                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">
                            <StatusBadge
                              status={
                                status
                              }
                            />
                          </td>

                          {/* VIEW */}

                          <td className="px-5 py-4 text-right">
                            <motion.button
                              whileTap={{
                                scale: 0.92,
                              }}
                              onClick={() =>
                                setSelectedAudit(
                                  audit
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                            >
                              <Eye
                                size={
                                  15
                                }
                              />

                              View
                            </motion.button>
                          </td>
                        </motion.tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="flex flex-col justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400 md:flex-row">
          <p>
            CAE Executive Audit
            Portfolio
          </p>

          <p>
            {audits.length} audit
            {audits.length !== 1
              ? "s"
              : ""}{" "}
            monitored
          </p>
        </div>
      </div>

      {/* ====================================================
          MODAL
      ==================================================== */}

      {selectedAudit && (
        <AuditDetailsModal
          audit={
            selectedAudit
          }
          onClose={() =>
            setSelectedAudit(
              null
            )
          }
        />
      )}
    </div>
  );
};

export default CAEAuditPortfolio;
