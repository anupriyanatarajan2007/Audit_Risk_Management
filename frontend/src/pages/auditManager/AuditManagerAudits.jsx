import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  CalendarDays,
  User,
  Building2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import AuditService from "../../service/AuditService";
import auditeeAssignmentService from "../../service/auditeeAssignmentService";
import { getProfile } from "../../service/AuthService";

// ============================================================
// STATUS OPTIONS
// ============================================================

const STATUS_OPTIONS = [
  "PLANNED",
  "ASSIGNED",
  "IN_PROGRESS",
  "UNDER_REVIEW",
  "COMPLETED",
  "CLOSED",
  "CANCELLED",
];

// ============================================================
// SAFE STRING
// ============================================================

const safeString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.label ||
      value.title ||
      value.employeeId ||
      value.email ||
      ""
    );
  }

  return String(value);
};

// ============================================================
// GET DEPARTMENT NAME
// Handles:
//
// "Information Technology"
//
// {
//   id: 1,
//   name: "Information Technology"
// }
//
// {
//   departmentId: 1,
//   departmentName: "Information Technology"
// }
// ============================================================

const getDepartmentName = (department) => {
  if (!department) {
    return "";
  }

  if (typeof department === "string") {
    return department;
  }

  if (typeof department === "number") {
    return String(department);
  }

  if (typeof department === "object") {
    return (
      department.name ||
      department.departmentName ||
      department.label ||
      ""
    );
  }

  return String(department);
};

// ============================================================
// GET DEPARTMENT ID
// ============================================================

const getDepartmentId = (department) => {
  if (!department) {
    return null;
  }

  if (typeof department === "number") {
    return department;
  }

  if (typeof department === "string") {
    return null;
  }

  if (typeof department === "object") {
    return (
      department.id ??
      department.departmentId ??
      department.departmentID ??
      null
    );
  }

  return null;
};

// ============================================================
// NORMALIZE DEPARTMENT NAME
// ============================================================

const normalizeDepartmentName = (value) => {
  return safeString(value)
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
};

// ============================================================
// NORMALIZE AUDIT
// ============================================================

const normalizeAudit = (audit) => {
  if (!audit || typeof audit !== "object") {
    return audit;
  }

  const departmentId =
    audit.departmentId ??
    getDepartmentId(audit.department);

  const departmentName =
    getDepartmentName(
      audit.department
    );

  return {
    ...audit,

    // Keep both department ID and department name
    departmentId: departmentId,
    department: departmentName,

    auditId: safeString(audit.auditId),

    auditName: safeString(
      audit.auditName
    ),

    riskId: safeString(
      audit.riskId
    ),

    riskTitle: safeString(
      audit.riskTitle
    ),

    businessUnit: safeString(
      audit.businessUnit
    ),

    processName: safeString(
      audit.processName
    ),

    internalAuditorName: safeString(
      audit.internalAuditorName
    ),

    internalAuditorId: safeString(
      audit.internalAuditorId
    ),

    description: safeString(
      audit.description
    ),

    status: safeString(
      audit.status
    ),
  };
};

// ============================================================
// NORMALIZE ASSIGNMENT
// ============================================================

const normalizeAssignment = (
  assignment
) => {
  if (
    !assignment ||
    typeof assignment !== "object"
  ) {
    return assignment;
  }

  return {
    ...assignment,

    auditId:
      assignment.auditId ??
      assignment.audit?.id ??
      assignment.audit?.auditId ??
      null,

    auditeeName:
      safeString(
        assignment.auditeeName
      ) ||
      safeString(
        assignment.auditee?.name
      ) ||
      safeString(
        assignment.auditee?.firstName
      ),

    auditeeEmployeeId:
      safeString(
        assignment.auditeeEmployeeId
      ) ||
      safeString(
        assignment.auditee?.employeeId
      ),

    auditeeEmail:
      safeString(
        assignment.auditeeEmail
      ) ||
      safeString(
        assignment.auditee?.email
      ),

    status: safeString(
      assignment.status
    ),
  };
};

// ============================================================
// EXTRACT ARRAY
// ============================================================

const extractArray = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (
    Array.isArray(
      response?.data?.data
    )
  ) {
    return response.data.data;
  }

  if (
    Array.isArray(
      response?.data?.content
    )
  ) {
    return response.data.content;
  }

  if (
    Array.isArray(
      response?.content
    )
  ) {
    return response.content;
  }

  return [];
};

// ============================================================
// COMPONENT
// ============================================================

const AuditManagerAudits = () => {
  const [audits, setAudits] = useState([]);

  const [assignments, setAssignments] =
    useState([]);

  const [currentUser, setCurrentUser] =
    useState(null);

  const [
    managerDepartmentId,
    setManagerDepartmentId,
  ] = useState(null);

  const [
    managerDepartmentName,
    setManagerDepartmentName,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    assignmentLoading,
    setAssignmentLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState("ALL");

  const [
    selectedAudit,
    setSelectedAudit,
  ] = useState(null);

  const [newStatus, setNewStatus] =
    useState("");

  const [
    statusUpdating,
    setStatusUpdating,
  ] = useState(false);

  const [currentPage, setCurrentPage] =
    useState(1);

  const itemsPerPage = 8;

  // ============================================================
  // GET LOGGED-IN MANAGER PROFILE
  // ============================================================

  const loadManagerProfile =
    async () => {
      try {
        const response =
          await getProfile();

        const profile =
          response?.data ||
          response?.profile ||
          response?.user ||
          response;

        console.log(
          "LOGGED-IN AUDIT MANAGER:",
          profile
        );

        setCurrentUser(profile);

        const department =
          profile?.department;

        const departmentId =
          profile?.departmentId ??
          getDepartmentId(
            department
          );

        const departmentName =
          getDepartmentName(
            department
          );

        setManagerDepartmentId(
          departmentId
        );

        setManagerDepartmentName(
          departmentName
        );

        return {
          profile,
          departmentId,
          departmentName,
        };
      } catch (err) {
        console.error(
          "FAILED TO LOAD MANAGER PROFILE:",
          err
        );

        throw new Error(
          "Unable to load Audit Manager department."
        );
      }
    };

  // ============================================================
  // CHECK AUDIT BELONGS TO MANAGER DEPARTMENT
  // ============================================================

  const auditBelongsToManagerDepartment = (
    audit,
    departmentId,
    departmentName
  ) => {
    if (!audit) {
      return false;
    }

    const auditDepartmentId =
      audit.departmentId ??
      getDepartmentId(
        audit.department
      );

    const auditDepartmentName =
      normalizeDepartmentName(
        getDepartmentName(
          audit.department
        )
      );

    // ----------------------------------------------------------
    // FIRST: DEPARTMENT ID
    // ----------------------------------------------------------

    if (
      departmentId !== null &&
      departmentId !== undefined &&
      auditDepartmentId !== null &&
      auditDepartmentId !== undefined
    ) {
      return (
        Number(auditDepartmentId) ===
        Number(departmentId)
      );
    }

    // ----------------------------------------------------------
    // FALLBACK: DEPARTMENT NAME
    // ----------------------------------------------------------

    if (
      departmentName &&
      auditDepartmentName
    ) {
      return (
        auditDepartmentName ===
        normalizeDepartmentName(
          departmentName
        )
      );
    }

    // ----------------------------------------------------------
    // FAIL CLOSED
    // ----------------------------------------------------------

    return false;
  };

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      // ========================================================
      // 1. GET CURRENT MANAGER DEPARTMENT
      // ========================================================

      const managerInfo =
        await loadManagerProfile();

      const departmentId =
        managerInfo.departmentId;

      const departmentName =
        managerInfo.departmentName;

      if (
        departmentId === null &&
        departmentId === undefined &&
        !departmentName
      ) {
        setAudits([]);
        setAssignments([]);

        setError(
          "Audit Manager department is not available."
        );

        return;
      }

      // ========================================================
      // 2. LOAD ALL AUDITS
      // ========================================================

      const auditResponse =
        await AuditService.getAllAudits();

      console.log(
        "RAW AUDITS RESPONSE:",
        auditResponse
      );

      const auditList =
        extractArray(
          auditResponse
        );

      console.log(
        "ALL AUDITS FROM BACKEND:",
        auditList
      );

      // ========================================================
      // 3. NORMALIZE + DEPARTMENT FILTER
      // ========================================================

      const normalizedAudits =
        auditList
          .filter(Boolean)
          .map(normalizeAudit)
          .filter((audit) =>
            auditBelongsToManagerDepartment(
              audit,
              departmentId,
              departmentName
            )
          );

      console.log(
        "AUDIT MANAGER DEPARTMENT ID:",
        departmentId
      );

      console.log(
        "AUDIT MANAGER DEPARTMENT NAME:",
        departmentName
      );

      console.log(
        "AUDITS FOR MANAGER DEPARTMENT:",
        normalizedAudits
      );

      setAudits(
        normalizedAudits
      );

      // ========================================================
      // 4. LOAD AUDITEE ASSIGNMENTS
      // ========================================================

      try {
        setAssignmentLoading(true);

        const assignmentResponse =
          await auditeeAssignmentService.getAllAssignments();

        console.log(
          "RAW AUDITEE ASSIGNMENTS:",
          assignmentResponse
        );

        const assignmentList =
          extractArray(
            assignmentResponse
          );

        const normalizedAssignments =
          assignmentList
            .filter(Boolean)
            .map(
              normalizeAssignment
            );

        // ======================================================
        // ONLY ASSIGNMENTS FOR MANAGER'S AUDITS
        // ======================================================

        const managerAuditDatabaseIds =
          new Set(
            normalizedAudits
              .map((audit) =>
                audit?.id != null
                  ? String(audit.id)
                  : null
              )
              .filter(Boolean)
          );

        const managerAuditCodes =
          new Set(
            normalizedAudits
              .map((audit) =>
                safeString(
                  audit?.auditId
                )
              )
              .filter(Boolean)
          );

        const scopedAssignments =
          normalizedAssignments.filter(
            (assignment) => {
              const assignmentAuditId =
                assignment?.auditId != null
                  ? String(
                      assignment.auditId
                    )
                  : "";

              const assignmentAuditCode =
                safeString(
                  assignment?.audit
                    ?.auditId
                );

              return (
                (
                  assignmentAuditId &&
                  managerAuditDatabaseIds.has(
                    assignmentAuditId
                  )
                ) ||
                (
                  assignmentAuditCode &&
                  managerAuditCodes.has(
                    assignmentAuditCode
                  )
                )
              );
            }
          );

        console.log(
          "AUDITEE ASSIGNMENTS FOR MANAGER DEPARTMENT:",
          scopedAssignments
        );

        setAssignments(
          scopedAssignments
        );
      } catch (
        assignmentError
      ) {
        console.error(
          "FAILED TO LOAD AUDITEE ASSIGNMENTS:",
          assignmentError
        );

        setAssignments([]);
      } finally {
        setAssignmentLoading(
          false
        );
      }
    } catch (err) {
      console.error(
        "FAILED TO LOAD AUDIT MANAGER AUDITS:",
        err
      );

      setError(
        err?.response?.data
          ?.message ||
          err?.response?.data
            ?.error ||
          err?.message ||
          "Failed to load audit details."
      );

      setAudits([]);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadData();

    // Intentionally run only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // FIND AUDITEE FOR AUDIT
  // ============================================================

  const getAuditeeForAudit = (
    audit
  ) => {
    if (!audit) {
      return null;
    }

    const auditDatabaseId =
      audit?.id != null
        ? Number(audit.id)
        : null;

    const auditCode =
      safeString(
        audit.auditId
      );

    const assignment =
      assignments.find(
        (item) => {
          const assignmentAuditId =
            item?.auditId != null
              ? Number(
                  item.auditId
                )
              : null;

          const assignmentAuditCode =
            safeString(
              item?.audit
                ?.auditId
            );

          return (
            (
              auditDatabaseId !== null &&
              assignmentAuditId !== null &&
              assignmentAuditId ===
                auditDatabaseId
            ) ||
            (
              auditCode &&
              assignmentAuditCode &&
              assignmentAuditCode ===
                auditCode
            )
          );
        }
      );

    return assignment || null;
  };

  // ============================================================
  // DEPARTMENTS
  // Only manager department should normally appear
  // ============================================================

  const departments =
    useMemo(() => {
      const values =
        audits
          .map((audit) =>
            getDepartmentName(
              audit.department
            )
          )
          .map((department) =>
            department.trim()
          )
          .filter(Boolean);

      return [
        ...new Set(values),
      ];
    }, [audits]);

  // ============================================================
  // FILTER AUDITS
  // ============================================================

  const filteredAudits =
    useMemo(() => {
      const searchValue =
        search
          .toLowerCase()
          .trim();

      return audits.filter(
        (audit) => {
          const auditee =
            getAuditeeForAudit(
              audit
            );

          const auditId =
            safeString(
              audit.auditId
            ).toLowerCase();

          const auditName =
            safeString(
              audit.auditName
            ).toLowerCase();

          const riskId =
            safeString(
              audit.riskId
            ).toLowerCase();

          const riskTitle =
            safeString(
              audit.riskTitle
            ).toLowerCase();

          const businessUnit =
            safeString(
              audit.businessUnit
            ).toLowerCase();

          const processName =
            safeString(
              audit.processName
            ).toLowerCase();

          const internalAuditorName =
            safeString(
              audit.internalAuditorName
            ).toLowerCase();

          const auditeeName =
            safeString(
              auditee?.auditeeName
            ).toLowerCase();

          const auditeeEmployeeId =
            safeString(
              auditee?.auditeeEmployeeId
            ).toLowerCase();

          const department =
            getDepartmentName(
              audit.department
            );

          const matchesSearch =
            !searchValue ||
            auditId.includes(
              searchValue
            ) ||
            auditName.includes(
              searchValue
            ) ||
            riskId.includes(
              searchValue
            ) ||
            riskTitle.includes(
              searchValue
            ) ||
            businessUnit.includes(
              searchValue
            ) ||
            processName.includes(
              searchValue
            ) ||
            internalAuditorName.includes(
              searchValue
            ) ||
            auditeeName.includes(
              searchValue
            ) ||
            auditeeEmployeeId.includes(
              searchValue
            );

          const matchesStatus =
            statusFilter === "ALL" ||
            safeString(
              audit.status
            ) === statusFilter;

          const matchesDepartment =
            departmentFilter ===
              "ALL" ||
            department ===
              departmentFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesDepartment
          );
        }
      );
    }, [
      audits,
      assignments,
      search,
      statusFilter,
      departmentFilter,
    ]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredAudits.length /
          itemsPerPage
      )
    );

  const paginatedAudits =
    filteredAudits.slice(
      (currentPage - 1) *
        itemsPerPage,
      currentPage *
        itemsPerPage
    );

  // ============================================================
  // RESET PAGE WHEN FILTER CHANGES
  // ============================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
    departmentFilter,
  ]);

  // ============================================================
  // STATUS CONFIG
  // ============================================================

  const getStatusConfig = (
    status
  ) => {
    switch (status) {
      case "PLANNED":
        return {
          icon: Clock3,
          className:
            "bg-blue-50 text-blue-700 border-blue-200",
        };

      case "ASSIGNED":
        return {
          icon: User,
          className:
            "bg-indigo-50 text-indigo-700 border-indigo-200",
        };

      case "IN_PROGRESS":
        return {
          icon: AlertCircle,
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
        };

      case "UNDER_REVIEW":
        return {
          icon: Eye,
          className:
            "bg-orange-50 text-orange-700 border-orange-200",
        };

      case "COMPLETED":
        return {
          icon: CheckCircle2,
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
        };

      case "CLOSED":
        return {
          icon: ShieldCheck,
          className:
            "bg-purple-50 text-purple-700 border-purple-200",
        };

      case "CANCELLED":
        return {
          icon: AlertCircle,
          className:
            "bg-red-50 text-red-700 border-red-200",
        };

      default:
        return {
          icon: Clock3,
          className:
            "bg-gray-50 text-gray-600 border-gray-200",
        };
    }
  };

  // ============================================================
  // VIEW DETAILS
  // ============================================================

  const handleViewDetails = (
    audit
  ) => {
    const auditee =
      getAuditeeForAudit(
        audit
      );

    setSelectedAudit({
      ...audit,
      department:
        getDepartmentName(
          audit.department
        ),
      auditeeAssignment:
        auditee,
    });

    setNewStatus(
      audit.status || ""
    );
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const handleCloseModal = () => {
    setSelectedAudit(null);
    setNewStatus("");
  };

  // ============================================================
  // UPDATE STATUS
  // ============================================================

  const handleUpdateStatus =
    async () => {
      if (
        !selectedAudit ||
        !newStatus
      ) {
        return;
      }

      if (
        newStatus ===
        selectedAudit.status
      ) {
        return;
      }

      try {
        setStatusUpdating(true);
        setError("");

        await AuditService.updateAuditStatus(
          selectedAudit.id,
          newStatus
        );

        // Update table
        setAudits((prev) =>
          prev.map((audit) =>
            audit.id ===
            selectedAudit.id
              ? {
                  ...audit,
                  status:
                    newStatus,
                }
              : audit
          )
        );

        // Update modal
        setSelectedAudit(
          (prev) =>
            prev
              ? {
                  ...prev,
                  status:
                    newStatus,
                }
              : prev
        );
      } catch (err) {
        console.error(
          "FAILED TO UPDATE AUDIT STATUS:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.response?.data
              ?.error ||
            "Failed to update audit status."
        );
      } finally {
        setStatusUpdating(
          false
        );
      }
    };

  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "-";
    }

    try {
      const parsedDate =
        new Date(date);

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return String(date);
      }

      return parsedDate.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return String(date);
    }
  };

  // ============================================================
  // STATS
  // ============================================================

  const totalAudits =
    audits.length;

  const plannedAudits =
    audits.filter(
      (audit) =>
        audit.status ===
        "PLANNED"
    ).length;

  const inProgressAudits =
    audits.filter(
      (audit) =>
        audit.status ===
        "IN_PROGRESS"
    ).length;

  const completedAudits =
    audits.filter(
      (audit) =>
        audit.status ===
          "COMPLETED" ||
        audit.status ===
          "CLOSED"
    ).length;

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-2xl font-bold text-slate-900">
            Audit Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage audits for your department
          </p>

          {/* MANAGER DEPARTMENT */}

          {managerDepartmentName && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">

              <Building2 size={14} />

              Department:
              {" "}
              {managerDepartmentName}

            </div>
          )}

        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >

          <RefreshCw
            size={17}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh

        </button>

      </div>

      {/* ======================================================
          STAT CARDS
      ====================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <StatCard
          title="Total Audits"
          value={totalAudits}
          icon={ShieldCheck}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Planned"
          value={plannedAudits}
          icon={Clock3}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="In Progress"
          value={inProgressAudits}
          icon={AlertCircle}
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Completed"
          value={completedAudits}
          icon={CheckCircle2}
          iconClass="bg-purple-50 text-purple-600"
        />

      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

          {/* SEARCH */}

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search audit, risk, auditor, auditee..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />

          </div>

          {/* STATUS */}

          <select
            value={
              statusFilter
            }
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          >

            <option value="ALL">
              All Statuses
            </option>

            {STATUS_OPTIONS.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status.replaceAll(
                    "_",
                    " "
                  )}
                </option>
              )
            )}

          </select>

          {/* DEPARTMENT */}

          <select
            value={
              departmentFilter
            }
            onChange={(e) =>
              setDepartmentFilter(
                e.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          >

            <option value="ALL">
              All Departments
            </option>

            {departments.map(
              (department) => (
                <option
                  key={department}
                  value={department}
                >
                  {department}
                </option>
              )
            )}

          </select>

        </div>

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

          <AlertCircle
            size={18}
          />

          <span>
            {error}
          </span>

        </div>
      )}

      {/* ======================================================
          DEPARTMENT INFO
      ====================================================== */}

      {!loading &&
        !error &&
        managerDepartmentName && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">

            <ShieldCheck
              size={18}
            />

            <span>
              Showing audits only for{" "}
              <strong>
                {managerDepartmentName}
              </strong>
              .
            </span>

          </div>
        )}

      {/* ======================================================
          ASSIGNMENT LOADING
      ====================================================== */}

      {assignmentLoading &&
        !loading && (
          <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">

            Loading auditee assignments...

          </div>
        )}

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="min-w-[1500px] w-full">

            <thead className="border-b border-slate-200 bg-slate-50">

              <tr>

                <TableHead>
                  Audit ID
                </TableHead>

                <TableHead>
                  Audit Details
                </TableHead>

                <TableHead>
                  Risk
                </TableHead>

                <TableHead>
                  Department
                </TableHead>

                <TableHead>
                  Business Unit
                </TableHead>

                <TableHead>
                  Process
                </TableHead>

                <TableHead>
                  Internal Auditor
                </TableHead>

                <TableHead>
                  Auditee
                </TableHead>

                <TableHead>
                  Audit Period
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead>
                  Action
                </TableHead>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {loading ? (

                <tr>

                  <td
                    colSpan="11"
                    className="py-16 text-center"
                  >

                    <RefreshCw
                      size={28}
                      className="mx-auto mb-3 animate-spin text-emerald-500"
                    />

                    <p className="text-sm text-slate-500">
                      Loading audit details...
                    </p>

                  </td>

                </tr>

              ) : paginatedAudits.length === 0 ? (

                <tr>

                  <td
                    colSpan="11"
                    className="py-16 text-center"
                  >

                    <ShieldCheck
                      size={40}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="font-semibold text-slate-700">
                      No audits found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      No audits are available for your department.
                    </p>

                  </td>

                </tr>

              ) : (

                paginatedAudits.map(
                  (audit) => {

                    const auditee =
                      getAuditeeForAudit(
                        audit
                      );

                    const statusConfig =
                      getStatusConfig(
                        audit.status
                      );

                    const StatusIcon =
                      statusConfig.icon;

                    const departmentName =
                      getDepartmentName(
                        audit.department
                      );

                    return (
                      <tr
                        key={audit.id}
                        className="transition hover:bg-slate-50"
                      >

                        {/* AUDIT ID */}

                        <td className="px-4 py-4">

                          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">

                            {audit.auditId ||
                              "-"}

                          </span>

                        </td>

                        {/* AUDIT DETAILS */}

                        <td className="px-4 py-4">

                          <div className="max-w-[220px]">

                            <p className="font-semibold text-slate-900">

                              {audit.auditName ||
                                "-"}

                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">

                              {audit.description ||
                                "No description"}

                            </p>

                          </div>

                        </td>

                        {/* RISK */}

                        <td className="px-4 py-4">

                          <div>

                            <p className="text-sm font-semibold text-slate-800">

                              {audit.riskId ||
                                "-"}

                            </p>

                            <p className="max-w-[180px] truncate text-xs text-slate-500">

                              {audit.riskTitle ||
                                "-"}

                            </p>

                          </div>

                        </td>

                        {/* DEPARTMENT */}

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-2">

                            <Building2
                              size={16}
                              className="text-slate-400"
                            />

                            <span className="text-sm text-slate-700">

                              {departmentName ||
                                "-"}

                            </span>

                          </div>

                        </td>

                        {/* BUSINESS UNIT */}

                        <td className="px-4 py-4">

                          <span className="text-sm text-slate-700">

                            {safeString(
                              audit.businessUnit
                            ) || "-"}

                          </span>

                        </td>

                        {/* PROCESS */}

                        <td className="px-4 py-4">

                          <span className="text-sm text-slate-700">

                            {safeString(
                              audit.processName
                            ) || "-"}

                          </span>

                        </td>

                        {/* INTERNAL AUDITOR */}

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-2">

                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">

                              <User
                                size={15}
                              />

                            </div>

                            <div>

                              <p className="text-sm font-medium text-slate-800">

                                {audit.internalAuditorName ||
                                  "Not Assigned"}

                              </p>

                              {audit.internalAuditorId && (
                                <p className="text-xs text-slate-400">

                                  ID:{" "}
                                  {
                                    audit.internalAuditorId
                                  }

                                </p>
                              )}

                            </div>

                          </div>

                        </td>

                        {/* AUDITEE */}

                        <td className="px-4 py-4">

                          {auditee ? (

                            <div className="flex items-center gap-2">

                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-600">

                                <User
                                  size={15}
                                />

                              </div>

                              <div>

                                <p className="text-sm font-medium text-slate-800">

                                  {auditee.auditeeName ||
                                    "Unknown"}

                                </p>

                                <p className="text-xs text-slate-400">

                                  {auditee.auditeeEmployeeId ||
                                    auditee.auditeeEmail ||
                                    "-"}

                                </p>

                              </div>

                            </div>

                          ) : (

                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">

                              Not Assigned

                            </span>

                          )}

                        </td>

                        {/* PERIOD */}

                        <td className="px-4 py-4">

                          <div className="flex items-center gap-2">

                            <CalendarDays
                              size={15}
                              className="text-slate-400"
                            />

                            <div>

                              <p className="text-xs font-medium text-slate-700">

                                {formatDate(
                                  audit.startDate
                                )}

                              </p>

                              <p className="text-xs text-slate-400">

                                to{" "}

                                {formatDate(
                                  audit.endDate
                                )}

                              </p>

                            </div>

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig.className}`}
                          >

                            <StatusIcon
                              size={13}
                            />

                            {safeString(
                              audit.status
                            ).replaceAll(
                              "_",
                              " "
                            ) ||
                              "UNKNOWN"}

                          </span>

                        </td>

                        {/* ACTION */}

                        <td className="px-4 py-4">

                          <button
                            onClick={() =>
                              handleViewDetails(
                                audit
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                          >

                            <Eye
                              size={15}
                            />

                            View

                          </button>

                        </td>

                      </tr>
                    );
                  }
                )

              )}

            </tbody>

          </table>

        </div>

        {/* ====================================================
            PAGINATION
        ==================================================== */}

        {!loading &&
          filteredAudits.length >
            0 && (

            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-sm text-slate-500">

                Showing{" "}

                <span className="font-semibold text-slate-700">

                  {(currentPage - 1) *
                    itemsPerPage +
                    1}

                </span>

                {" "}to{" "}

                <span className="font-semibold text-slate-700">

                  {Math.min(
                    currentPage *
                      itemsPerPage,
                    filteredAudits.length
                  )}

                </span>

                {" "}of{" "}

                <span className="font-semibold text-slate-700">

                  {
                    filteredAudits.length
                  }

                </span>

                {" "}audits

              </p>

              <div className="flex items-center gap-2">

                <button
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (p) =>
                        Math.max(
                          1,
                          p - 1
                        )
                    )
                  }
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >

                  <ChevronLeft
                    size={17}
                  />

                </button>

                <span className="px-3 text-sm font-medium text-slate-700">

                  {currentPage} /{" "}
                  {totalPages}

                </span>

                <button
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (p) =>
                        Math.min(
                          totalPages,
                          p + 1
                        )
                    )
                  }
                  className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >

                  <ChevronRight
                    size={17}
                  />

                </button>

              </div>

            </div>
          )}

      </div>

      {/* ======================================================
          DETAILS MODAL
      ====================================================== */}

      {selectedAudit && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  Audit Details
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">

                  {selectedAudit.auditName ||
                    "Audit"}

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  {selectedAudit.auditId ||
                    "-"}

                </p>

              </div>

              <button
                onClick={
                  handleCloseModal
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>

            </div>

            {/* DETAILS */}

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">

              <DetailItem
                label="Audit ID"
                value={
                  selectedAudit.auditId
                }
              />

              <DetailItem
                label="Database ID"
                value={
                  selectedAudit.id
                }
              />

              <DetailItem
                label="Audit Name"
                value={
                  selectedAudit.auditName
                }
              />

              <DetailItem
                label="Risk ID"
                value={
                  selectedAudit.riskId
                }
              />

              <DetailItem
                label="Risk Title"
                value={
                  selectedAudit.riskTitle
                }
              />

              <DetailItem
                label="Department"
                value={getDepartmentName(
                  selectedAudit.department
                )}
              />

              <DetailItem
                label="Business Unit"
                value={
                  selectedAudit.businessUnit
                }
              />

              <DetailItem
                label="Process Name"
                value={
                  selectedAudit.processName
                }
              />

              <DetailItem
                label="Start Date"
                value={formatDate(
                  selectedAudit.startDate
                )}
              />

              <DetailItem
                label="End Date"
                value={formatDate(
                  selectedAudit.endDate
                )}
              />

              {/* STATUS */}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Status
                </p>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">

                  <select
                    value={
                      newStatus
                    }
                    onChange={(e) =>
                      setNewStatus(
                        e.target.value
                      )
                    }
                    disabled={
                      statusUpdating
                    }
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
                  >

                    {STATUS_OPTIONS.map(
                      (status) => (
                        <option
                          key={status}
                          value={status}
                        >
                          {status.replaceAll(
                            "_",
                            " "
                          )}
                        </option>
                      )
                    )}

                  </select>

                  <button
                    onClick={
                      handleUpdateStatus
                    }
                    disabled={
                      statusUpdating ||
                      !newStatus ||
                      newStatus ===
                        selectedAudit.status
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    {statusUpdating && (
                      <RefreshCw
                        size={14}
                        className="animate-spin"
                      />
                    )}

                    {statusUpdating
                      ? "Saving..."
                      : "Update"}

                  </button>

                </div>

              </div>

              <DetailItem
                label="Internal Auditor"
                value={
                  selectedAudit.internalAuditorName ||
                  "Not Assigned"
                }
              />

              <DetailItem
                label="Auditor ID"
                value={
                  selectedAudit.internalAuditorId ||
                  "-"
                }
              />

              {/* AUDITEE */}

              <DetailItem
                label="Auditee"
                value={
                  selectedAudit
                    .auditeeAssignment
                    ?.auditeeName ||
                  "Not Assigned"
                }
              />

              <DetailItem
                label="Auditee Employee ID"
                value={
                  selectedAudit
                    .auditeeAssignment
                    ?.auditeeEmployeeId ||
                  "-"
                }
              />

              <DetailItem
                label="Auditee Email"
                value={
                  selectedAudit
                    .auditeeAssignment
                    ?.auditeeEmail ||
                  "-"
                }
              />

              <DetailItem
                label="Auditee Assignment Status"
                value={
                  selectedAudit
                    .auditeeAssignment
                    ?.status ||
                  "Not Assigned"
                }
              />

              <div className="md:col-span-2">

                <DetailItem
                  label="Description"
                  value={
                    selectedAudit.description ||
                    "No description available"
                  }
                />

              </div>

              <DetailItem
                label="Created At"
                value={
                  selectedAudit.createdAt
                    ? new Date(
                        selectedAudit.createdAt
                      ).toLocaleString(
                        "en-IN"
                      )
                    : "-"
                }
              />

              <DetailItem
                label="Updated At"
                value={
                  selectedAudit.updatedAt
                    ? new Date(
                        selectedAudit.updatedAt
                      ).toLocaleString(
                        "en-IN"
                      )
                    : "-"
                }
              />

            </div>

            {/* FOOTER */}

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-right">

              <button
                onClick={
                  handleCloseModal
                }
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
  title,
  value,
  icon: Icon,
  iconClass,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>

        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>

      </div>

    </div>
  );
};

// ============================================================
// TABLE HEAD
// ============================================================

const TableHead = ({
  children,
}) => {
  return (
    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
      {children}
    </th>
  );
};

// ============================================================
// DETAIL ITEM
// ============================================================

const DetailItem = ({
  label,
  value,
}) => {
  let displayValue =
    value;

  if (
    displayValue !== null &&
    typeof displayValue ===
      "object"
  ) {
    displayValue =
      displayValue.name ||
      displayValue.label ||
      displayValue.title ||
      displayValue.employeeId ||
      displayValue.email ||
      "-";
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {displayValue || "-"}
      </p>

    </div>
  );
};

export default AuditManagerAudits;