import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  Search,
  Filter,
  Eye,
  X,
  ClipboardList,
  CalendarDays,
  CheckCircle2,
  Clock3,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  User,
  Building2,
  Layers,
  FileText,
  ShieldAlert,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { getMyAssignedAudits } from "../../service/AuditService";

/* =========================================================
   EMPTY FILTERS
========================================================= */

const EMPTY_FILTERS = {
  status: "",
  department: "",
};

/* =========================================================
   SAFE ENTITY DISPLAY
========================================================= */

const getEntityLabel = (value, fallback = "—") => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return (
      value.name ??
      value.departmentName ??
      value.businessUnitName ??
      value.processName ??
      value.auditTypeName ??
      value.riskId ??
      value.riskCode ??
      value.title ??
      value.label ??
      value.code ??
      value.employeeId ??
      value.email ??
      value.id ??
      fallback
    );
  }

  return fallback;
};

/* =========================================================
   AUDIT OBJECT NORMALIZATION
========================================================= */

const getAuditObject = (audit) => {
  if (!audit) return null;

  if (audit.audit && typeof audit.audit === "object") {
    return audit.audit;
  }

  return audit;
};

/* =========================================================
   AUDIT DATABASE ID
========================================================= */

const getDatabaseId = (audit) => {
  const source = getAuditObject(audit);

  return (
    source?.id ??
    audit?.audit?.id ??
    audit?.auditDbId ??
    null
  );
};

/* =========================================================
   AUDIT BUSINESS ID
========================================================= */

const getAuditId = (audit) => {
  const source = getAuditObject(audit);

  return (
    source?.auditId ??
    audit?.auditId ??
    audit?.audit?.auditId ??
    source?.auditCode ??
    audit?.auditCode ??
    source?.id ??
    audit?.id ??
    null
  );
};

/* =========================================================
   AUDIT TITLE
========================================================= */

const getAuditTitle = (audit) => {
  const source = getAuditObject(audit);

  return getEntityLabel(
    source?.auditTitle ??
      source?.auditName ??
      source?.title ??
      audit?.auditTitle ??
      audit?.auditName ??
      audit?.title,
    `Audit ${getAuditId(audit) ?? ""}`
  );
};

/* =========================================================
   AUDIT TYPE
========================================================= */

const getAuditType = (audit) => {
  const source = getAuditObject(audit);

  return getEntityLabel(
    source?.auditType ??
      source?.type ??
      audit?.auditType ??
      audit?.type
  );
};

/* =========================================================
   DEPARTMENT
========================================================= */

const getDepartment = (audit) => {
  const source = getAuditObject(audit);

  return getEntityLabel(
    source?.department ??
      source?.dept ??
      source?.auditDepartment ??
      audit?.department ??
      audit?.auditDepartment
  );
};

/* =========================================================
   BUSINESS UNIT
========================================================= */

const getBusinessUnit = (audit) => {
  const source = getAuditObject(audit);

  return getEntityLabel(
    source?.businessUnit ??
      source?.business_unit ??
      source?.auditBusinessUnit ??
      audit?.businessUnit ??
      audit?.auditBusinessUnit
  );
};

/* =========================================================
   PROCESS
========================================================= */

const getProcess = (audit) => {
  const source = getAuditObject(audit);

  return getEntityLabel(
    source?.processName ??
      source?.process ??
      audit?.processName ??
      audit?.process
  );
};

/* =========================================================
   DESCRIPTION
========================================================= */

const getDescription = (audit) => {
  const source = getAuditObject(audit);

  return getEntityLabel(
    source?.description ??
      source?.auditObjective ??
      source?.scope ??
      audit?.description ??
      audit?.auditObjective ??
      audit?.scope
  );
};

/* =========================================================
   RISK ID
========================================================= */

const getRiskId = (audit) => {
  const source = getAuditObject(audit);

  if (
    source?.riskId !== undefined &&
    source?.riskId !== null
  ) {
    return getEntityLabel(source.riskId);
  }

  if (
    audit?.riskId !== undefined &&
    audit?.riskId !== null
  ) {
    return getEntityLabel(audit.riskId);
  }

  const risk =
    source?.risk ??
    audit?.risk ??
    source?.assignedRisk ??
    audit?.assignedRisk;

  if (risk) {
    return getEntityLabel(
      risk?.riskId ??
        risk?.id ??
        risk?.riskCode ??
        risk?.code
    );
  }

  return "—";
};

/* =========================================================
   RISK TITLE
========================================================= */

const getRiskTitle = (audit) => {
  const source = getAuditObject(audit);

  if (source?.riskTitle) {
    return getEntityLabel(source.riskTitle);
  }

  if (audit?.riskTitle) {
    return getEntityLabel(audit.riskTitle);
  }

  const risk =
    source?.risk ??
    audit?.risk ??
    source?.assignedRisk ??
    audit?.assignedRisk;

  if (risk) {
    return getEntityLabel(
      risk?.title ??
        risk?.riskTitle ??
        risk?.name
    );
  }

  return "—";
};

/* =========================================================
   RISK CATEGORY
========================================================= */

const getRiskCategory = (audit) => {
  const source = getAuditObject(audit);

  const category =
    source?.riskCategory ??
    source?.risk?.category ??
    source?.risk?.riskCategory ??
    audit?.riskCategory ??
    audit?.risk?.category;

  return getEntityLabel(category);
};

/* =========================================================
   STATUS
========================================================= */

const getStatus = (audit) => {
  const source = getAuditObject(audit);

  return (
    source?.status ??
    audit?.status ??
    "UNKNOWN"
  );
};

/* =========================================================
   AUDITOR NAME
========================================================= */

const getAuditorName = (audit) => {
  const source = getAuditObject(audit);

  if (source?.internalAuditorName) {
    return getEntityLabel(
      source.internalAuditorName
    );
  }

  if (source?.auditorName) {
    return getEntityLabel(
      source.auditorName
    );
  }

  const auditor =
    source?.internalAuditor ??
    source?.auditor ??
    audit?.internalAuditor ??
    audit?.auditor;

  if (!auditor) {
    return "—";
  }

  if (auditor.profile) {
    const firstName =
      auditor.profile.firstName || "";

    const lastName =
      auditor.profile.lastName || "";

    const fullName =
      `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }
  }

  if (
    auditor.firstName ||
    auditor.lastName
  ) {
    const fullName =
      `${auditor.firstName || ""} ${
        auditor.lastName || ""
      }`.trim();

    if (fullName) {
      return fullName;
    }
  }

  return getEntityLabel(
    auditor.name ??
      auditor.fullName ??
      auditor.employeeId ??
      auditor.email
  );
};

/* =========================================================
   AUDITOR EMPLOYEE ID
========================================================= */

const getAuditorEmployeeId = (audit) => {
  const source = getAuditObject(audit);

  const auditor =
    source?.internalAuditor ??
    source?.auditor ??
    audit?.internalAuditor ??
    audit?.auditor;

  return getEntityLabel(
    source?.auditorEmployeeId ??
      source?.internalAuditorEmployeeId ??
      audit?.auditorEmployeeId ??
      auditor?.employeeId
  );
};

/* =========================================================
   AUDITOR EMAIL
========================================================= */

const getAuditorEmail = (audit) => {
  const source = getAuditObject(audit);

  const auditor =
    source?.internalAuditor ??
    source?.auditor ??
    audit?.internalAuditor ??
    audit?.auditor;

  return getEntityLabel(
    source?.auditorEmail ??
      source?.internalAuditorEmail ??
      audit?.auditorEmail ??
      auditor?.email
  );
};

/* =========================================================
   AUDITOR DEPARTMENT
========================================================= */

const getAuditorDepartment = (audit) => {
  const source = getAuditObject(audit);

  const auditor =
    source?.internalAuditor ??
    source?.auditor ??
    audit?.internalAuditor ??
    audit?.auditor;

  return getEntityLabel(
    auditor?.department ??
      auditor?.profile?.department
  );
};

/* =========================================================
   DATE
========================================================= */

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
};

/* =========================================================
   START DATE
========================================================= */

const getStartDate = (audit) => {
  const source = getAuditObject(audit);

  return (
    source?.startDate ??
    source?.plannedStartDate ??
    audit?.startDate ??
    audit?.plannedStartDate
  );
};

/* =========================================================
   END DATE
========================================================= */

const getEndDate = (audit) => {
  const source = getAuditObject(audit);

  return (
    source?.endDate ??
    source?.plannedEndDate ??
    source?.dueDate ??
    audit?.endDate ??
    audit?.plannedEndDate ??
    audit?.dueDate
  );
};

/* =========================================================
   OVERDUE
========================================================= */

const isOverdue = (audit) => {
  const end = getEndDate(audit);

  if (!end) return false;

  const status = getStatus(audit)
    .toString()
    .toUpperCase();

  if (
    status === "COMPLETED" ||
    status === "CANCELLED" ||
    status === "CLOSED"
  ) {
    return false;
  }

  const endDate = new Date(end);

  if (Number.isNaN(endDate.getTime())) {
    return false;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  endDate.setHours(0, 0, 0, 0);

  return endDate < today;
};

/* =========================================================
   STATUS CLASS
========================================================= */

const getStatusClass = (status) => {
  switch (
    (status || "")
      .toString()
      .toUpperCase()
  ) {
    case "PLANNED":
      return "bg-[#E5FAF3] text-[#00A874]";

    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-600";

    case "COMPLETED":
      return "bg-green-50 text-green-600";

    case "CANCELLED":
      return "bg-red-50 text-red-600";

    case "RESPONSE_PENDING":
      return "bg-orange-50 text-orange-600";

    case "CLOSED":
      return "bg-emerald-50 text-emerald-600";

    default:
      return "bg-gray-100 text-gray-600";
  }
};

/* =========================================================
   STATUS FORMAT
========================================================= */

const formatStatus = (status) => {
  if (!status) return "Unknown";

  return status
    .toString()
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (char) => char.toUpperCase()
    );
};

/* =========================================================
   ANIMATED NUMBER
========================================================= */

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] =
    useState(0);

  useEffect(() => {
    let frame;

    const start =
      performance.now();

    const from = display;

    const duration = 500;

    const tick = (now) => {
      const progress = Math.min(
        (now - start) / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

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
      requestAnimationFrame(tick);

    return () =>
      cancelAnimationFrame(frame);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display}</>;
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  title,
  value,
  icon: Icon,
  index,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.06,
        duration: 0.35,
      }}
      whileHover={{
        y: -2,
      }}
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between"
    >
      <div>
        <p className="text-xs font-medium text-gray-500">
          {title}
        </p>

        <p className="text-2xl font-bold text-[#101A33] mt-2">
          <AnimatedNumber value={value} />
        </p>
      </div>

      <div className="w-10 h-10 rounded-xl bg-[#E5FAF3] text-[#00A874] flex items-center justify-center">
        <Icon size={19} />
      </div>
    </motion.div>
  );
};

/* =========================================================
   SELECT FIELD
========================================================= */

const SelectField = ({
  label,
  value,
  onChange,
  options,
}) => (
  <div>
    <label className="block text-xs font-semibold text-[#101A33] mb-1.5">
      {label}
    </label>

    <select
      value={value || ""}
      onChange={onChange}
      className="w-full px-3.5 py-2.5 text-sm text-[#101A33] bg-white border border-gray-200 rounded-xl outline-none transition-all duration-150 focus:border-[#00C98B] focus:ring-2 focus:ring-[#E5FAF3]"
    >
      <option value="">
        Select {label}
      </option>

      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

/* =========================================================
   DETAIL SECTION
========================================================= */

const DetailSection = ({
  title,
  icon: Icon,
  children,
}) => (
  <section>
    <h3 className="text-sm font-bold text-[#101A33] mb-3 flex items-center gap-2">
      {Icon && (
        <Icon
          size={16}
          className="text-[#00A874]"
        />
      )}

      {title}
    </h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 rounded-xl p-4">
      {children}
    </div>
  </section>
);

/* =========================================================
   DETAIL FIELD
========================================================= */

const DetailField = ({
  label,
  value,
  full = false,
}) => (
  <div
    className={
      full
        ? "md:col-span-2"
        : ""
    }
  >
    <label className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
      {label}
    </label>

    <div className="text-sm font-medium text-[#101A33] mt-1 whitespace-pre-wrap break-words">
      {value !== null &&
      value !== undefined &&
      value !== ""
        ? value
        : "—"}
    </div>
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const MyAudits = () => {
  const navigate =
    useNavigate();

  const [audits, setAudits] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [filtersOpen, setFiltersOpen] =
    useState(false);

  const [filters, setFilters] =
    useState(EMPTY_FILTERS);

  const [selectedAudit, setSelectedAudit] =
    useState(null);

  const [showView, setShowView] =
    useState(false);

  /* =======================================================
     FETCH ASSIGNED AUDITS
  ======================================================= */

  const fetchMyAudits =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        console.log(
          "Loading Internal Auditor assigned audits..."
        );

        const response =
          await getMyAssignedAudits();

        console.log(
          "INTERNAL AUDITOR ASSIGNED AUDITS RESPONSE:",
          response
        );

        let data = [];

        if (Array.isArray(response)) {
          data = response;
        } else if (
          Array.isArray(response?.data)
        ) {
          data = response.data;
        } else if (
          Array.isArray(
            response?.data?.data
          )
        ) {
          data =
            response.data.data;
        } else if (
          Array.isArray(
            response?.content
          )
        ) {
          data =
            response.content;
        } else if (
          Array.isArray(
            response?.audits
          )
        ) {
          data =
            response.audits;
        } else if (
          Array.isArray(
            response?.data?.audits
          )
        ) {
          data =
            response.data.audits;
        }

        console.log(
          "NORMALIZED INTERNAL AUDITOR AUDITS:",
          data
        );

        setAudits(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load internal auditor audits:",
          err
        );

        setAudits([]);

        setError(
          err?.response?.data
            ?.message ||
            err?.response?.data
              ?.error ||
            err?.message ||
            "Unable to load your assigned audits."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    fetchMyAudits();
  }, [fetchMyAudits]);

  /* =======================================================
     VIEW AUDIT
  ======================================================= */

  const handleView = (
    audit
  ) => {
    const databaseId =
      getDatabaseId(audit);

    const auditId =
      getAuditId(audit);

    console.log(
      "Opening audit:",
      {
        databaseId,
        auditId,
        audit,
      }
    );

    if (!databaseId) {
      console.error(
        "Cannot navigate: database audit ID not found",
        audit
      );

      if (auditId) {
        navigate(
          `/internal-auditor/audit-details/${auditId}`
        );

        return;
      }

      return;
    }

    navigate(
      `/internal-auditor/audit-details/${databaseId}`
    );
  };

  /* =======================================================
     OPEN MODAL
  ======================================================= */

  const openModal = (
    audit
  ) => {
    setSelectedAudit(audit);
    setShowView(true);
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    setShowView(false);
    setSelectedAudit(null);
  };

  /* =======================================================
     SEARCH + FILTER
  ======================================================= */

  const visibleAudits =
    useMemo(() => {
      let result = [
        ...audits,
      ];

      if (
        searchTerm.trim()
      ) {
        const term =
          searchTerm
            .trim()
            .toLowerCase();

        result =
          result.filter(
            (audit) => {
              const auditId =
                getAuditId(
                  audit
                );

              const title =
                getAuditTitle(
                  audit
                );

              const riskId =
                getRiskId(
                  audit
                );

              const riskTitle =
                getRiskTitle(
                  audit
                );

              const department =
                getDepartment(
                  audit
                );

              const businessUnit =
                getBusinessUnit(
                  audit
                );

              const process =
                getProcess(
                  audit
                );

              return [
                auditId,
                title,
                riskId,
                riskTitle,
                department,
                businessUnit,
                process,
              ].some(
                (value) =>
                  String(
                    value ?? ""
                  )
                    .toLowerCase()
                    .includes(term)
              );
            }
          );
      }

      if (
        filters.status
      ) {
        result =
          result.filter(
            (audit) =>
              getStatus(
                audit
              )
                .toString()
                .toUpperCase() ===
              filters.status
          );
      }

      if (
        filters.department
      ) {
        result =
          result.filter(
            (audit) =>
              getDepartment(
                audit
              ) ===
              filters.department
          );
      }

      return result;
    }, [
      audits,
      searchTerm,
      filters,
    ]);

  /* =======================================================
     DEPARTMENTS
  ======================================================= */

  const departments =
    useMemo(() => {
      return [
        ...new Set(
          audits
            .map(
              (audit) =>
                getDepartment(
                  audit
                )
            )
            .filter(
              (department) =>
                department &&
                department !== "—"
            )
        ),
      ];
    }, [audits]);

  /* =======================================================
     HAS FILTERS
  ======================================================= */

  const hasFilters =
    Object.values(
      filters
    ).some(Boolean);

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters =
    () =>
      setFilters({
        ...EMPTY_FILTERS,
      });

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalAudits =
    audits.length;

  const plannedAudits =
    audits.filter(
      (audit) =>
        getStatus(audit)
          .toString()
          .toUpperCase() ===
        "PLANNED"
    ).length;

  const inProgressAudits =
    audits.filter(
      (audit) =>
        getStatus(audit)
          .toString()
          .toUpperCase() ===
        "IN_PROGRESS"
    ).length;

  const completedAudits =
    audits.filter(
      (audit) => {
        const status =
          getStatus(
            audit
          )
            .toString()
            .toUpperCase();

        return (
          status ===
            "COMPLETED" ||
          status === "CLOSED"
        );
      }
    ).length;

  const overdueAudits =
    audits.filter(
      isOverdue
    ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="w-full">

      {/* ===================================================
          HEADER
      =================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex flex-wrap items-start justify-between gap-4 mb-7"
      >
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList
              size={22}
              className="text-[#00A874]"
            />

            <h1 className="text-xl font-bold text-[#101A33]">
              My Assigned Audits
            </h1>
          </div>

          <p className="text-sm text-gray-500 mt-1">
            Audits assigned to you as an Internal Auditor.
          </p>
        </div>

        <button
          type="button"
          onClick={
            fetchMyAudits
          }
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          <RotateCcw
            size={15}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </motion.div>

      {/* ===================================================
          STAT CARDS
      =================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-7">

        <StatCard
          title="Total Audits"
          value={
            totalAudits
          }
          icon={
            ClipboardList
          }
          index={0}
        />

        <StatCard
          title="Planned"
          value={
            plannedAudits
          }
          icon={
            CalendarDays
          }
          index={1}
        />

        <StatCard
          title="In Progress"
          value={
            inProgressAudits
          }
          icon={
            Clock3
          }
          index={2}
        />

        <StatCard
          title="Completed"
          value={
            completedAudits
          }
          icon={
            CheckCircle2
          }
          index={3}
        />

        <StatCard
          title="Overdue"
          value={
            overdueAudits
          }
          icon={
            AlertTriangle
          }
          index={4}
        />

      </div>

      {/* ===================================================
          TABLE CARD
      =================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.15,
        }}
        className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
      >

        {/* =================================================
            TABLE HEADER
        ================================================= */}

        <div className="px-5 py-4 border-b border-gray-200">

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>
              <h2 className="text-base font-bold text-[#101A33]">
                Assigned Audits
              </h2>

              <p className="text-xs text-gray-500 mt-0.5">
                {
                  visibleAudits.length
                }{" "}
                audit
                {visibleAudits.length !==
                1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">

              {/* SEARCH */}

              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 w-64 focus-within:border-[#00C98B] focus-within:ring-2 focus-within:ring-[#E5FAF3] transition-all">

                <Search
                  size={16}
                  className="text-gray-400 shrink-0"
                />

                <input
                  type="text"
                  value={
                    searchTerm
                  }
                  onChange={(e) =>
                    setSearchTerm(
                      e.target
                        .value
                    )
                  }
                  placeholder="Search audits..."
                  className="w-full text-sm outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
                />

              </div>

              {/* FILTER */}

              <button
                type="button"
                onClick={() =>
                  setFiltersOpen(
                    (prev) =>
                      !prev
                  )
                }
                className={`flex items-center gap-1.5 text-sm font-medium rounded-xl px-3.5 py-2 border transition-all ${
                  filtersOpen ||
                  hasFilters
                    ? "border-[#00C98B] bg-[#E5FAF3] text-[#00A874]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-[#00C98B] hover:bg-[#E5FAF3]"
                }`}
              >

                <Filter
                  size={15}
                />

                Filters

              </button>

            </div>

          </div>

          {/* FILTER PANEL */}

          <AnimatePresence
            initial={false}
          >

            {filtersOpen && (
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
                transition={{
                  duration: 0.22,
                  ease: "easeInOut",
                }}
                className="overflow-hidden"
              >

                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3">

                  <SelectField
                    label="Status"
                    value={
                      filters.status
                    }
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        status:
                          e.target
                            .value,
                      })
                    }
                    options={[
                      {
                        value:
                          "PLANNED",
                        label:
                          "Planned",
                      },
                      {
                        value:
                          "IN_PROGRESS",
                        label:
                          "In Progress",
                      },
                      {
                        value:
                          "COMPLETED",
                        label:
                          "Completed",
                      },
                      {
                        value:
                          "CANCELLED",
                        label:
                          "Cancelled",
                      },
                      {
                        value:
                          "CLOSED",
                        label:
                          "Closed",
                      },
                    ]}
                  />

                  <SelectField
                    label="Department"
                    value={
                      filters.department
                    }
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        department:
                          e.target
                            .value,
                      })
                    }
                    options={departments.map(
                      (
                        department
                      ) => ({
                        value:
                          department,
                        label:
                          department,
                      })
                    )}
                  />

                  <div className="flex items-end">

                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                      className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#101A33] transition"
                    >

                      <RotateCcw
                        size={14}
                      />

                      Clear Filters

                    </button>

                  </div>

                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>

        {/* =================================================
            TABLE BODY
        ================================================= */}

        {loading ? (
          <AuditTableSkeleton />
        ) : error ? (

          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">

            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">

              <AlertCircle
                size={25}
              />

            </div>

            <h3 className="text-base font-bold text-[#101A33]">
              Unable to load assigned audits
            </h3>

            <p className="text-sm text-gray-500 mt-1 mb-4">
              {error}
            </p>

            <button
              type="button"
              onClick={
                fetchMyAudits
              }
              className="flex items-center gap-1.5 bg-[#00C98B] hover:bg-[#00A874] text-white text-sm font-semibold rounded-lg px-4 py-2"
            >

              <RotateCcw
                size={14}
              />

              Retry

            </button>

          </div>

        ) : visibleAudits.length ===
          0 ? (

          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">

            <div className="w-14 h-14 rounded-2xl bg-[#E5FAF3] text-[#00A874] flex items-center justify-center mb-4">

              <ClipboardList
                size={25}
              />

            </div>

            <h3 className="text-base font-bold text-[#101A33]">
              No audits assigned to you yet
            </h3>

            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Audits assigned to you by the Audit Manager will appear here.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1250px]">

              <thead>

                <tr className="bg-gray-50 border-b border-gray-200">

                  <TableHead>
                    Audit ID
                  </TableHead>

                  <TableHead>
                    Audit Title
                  </TableHead>

                  <TableHead>
                    Assigned Risk
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
                    Start
                  </TableHead>

                  <TableHead>
                    Due
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead align="right">
                    Actions
                  </TableHead>

                </tr>

              </thead>

              <tbody>

                <AnimatePresence
                  initial={false}
                >

                  {visibleAudits.map(
                    (
                      audit,
                      index
                    ) => {

                      const auditId =
                        getAuditId(
                          audit
                        ) ||
                        "—";

                      const riskId =
                        getRiskId(
                          audit
                        );

                      const overdue =
                        isOverdue(
                          audit
                        );

                      return (

                        <motion.tr
                          key={`${auditId}-${getDatabaseId(
                            audit
                          )}`}
                          initial={{
                            opacity: 0,
                            y: 6,
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
                              Math.min(
                                index,
                                8
                              ) *
                              0.03,
                          }}
                          className="border-b border-gray-100 hover:bg-[#FAFFFD] transition-colors"
                        >

                          {/* AUDIT ID */}

                          <td className="px-5 py-4">

                            <span className="text-sm font-bold text-[#101A33]">
                              {
                                auditId
                              }
                            </span>

                          </td>

                          {/* TITLE */}

                          <td className="px-5 py-4">

                            <p className="text-sm font-semibold text-[#101A33] max-w-[220px] truncate">
                              {getAuditTitle(
                                audit
                              )}
                            </p>

                          </td>

                          {/* RISK */}

                          <td className="px-5 py-4">

                            <div>

                              <span className="text-sm font-medium text-[#101A33]">
                                {
                                  riskId
                                }
                              </span>

                              {getRiskTitle(
                                audit
                              ) !==
                                "—" && (

                                <p className="text-[11px] text-gray-400 mt-0.5 max-w-[180px] truncate">
                                  {getRiskTitle(
                                    audit
                                  )}
                                </p>

                              )}

                            </div>

                          </td>

                          {/* DEPARTMENT */}

                          <td className="px-5 py-4">

                            <span className="text-xs text-gray-600">
                              {getDepartment(
                                audit
                              )}
                            </span>

                          </td>

                          {/* BUSINESS UNIT */}

                          <td className="px-5 py-4">

                            <span className="text-xs text-gray-600">
                              {getBusinessUnit(
                                audit
                              )}
                            </span>

                          </td>

                          {/* PROCESS */}

                          <td className="px-5 py-4">

                            <span className="text-xs text-gray-600">
                              {getProcess(
                                audit
                              )}
                            </span>

                          </td>

                          {/* START */}

                          <td className="px-5 py-4">

                            <span className="text-xs text-gray-600">
                              {formatDate(
                                getStartDate(
                                  audit
                                )
                              )}
                            </span>

                          </td>

                          {/* DUE */}

                          <td className="px-5 py-4">

                            <span
                              className={`text-xs ${
                                overdue
                                  ? "text-red-600 font-semibold"
                                  : "text-gray-600"
                              }`}
                            >

                              {formatDate(
                                getEndDate(
                                  audit
                                )
                              )}

                              {overdue &&
                                " (Overdue)"}

                            </span>

                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${getStatusClass(
                                getStatus(
                                  audit
                                )
                              )}`}
                            >

                              {formatStatus(
                                getStatus(
                                  audit
                                )
                              )}

                            </span>

                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4">

                            <div className="flex items-center justify-end gap-1.5">

                              {/* VIEW BUTTON REMOVED */}

                              {/* QUICK VIEW BUTTON ONLY */}

                              <button
                                type="button"
                                title="Quick View"
                                onClick={() =>
                                  openModal(
                                    audit
                                  )
                                }
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150"
                              >

                                <FileText
                                  size={
                                    15
                                  }
                                />

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

        )}

      </motion.div>

      {/* ===================================================
          QUICK VIEW MODAL
      =================================================== */}

      <AnimatePresence>

        {showView &&
          selectedAudit && (

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
              className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
              onMouseDown={
                closeModal
              }
            >

              <motion.div
                initial={{
                  opacity: 0,
                  y: 16,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 8,
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.2,
                }}
                onMouseDown={(
                  e
                ) =>
                  e.stopPropagation()
                }
                className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              >

                {/* MODAL HEADER */}

                <div className="flex items-start justify-between px-6 py-5 border-b border-gray-200">

                  <div>

                    <div className="flex items-center gap-2 flex-wrap">

                      <h2 className="text-lg font-bold text-[#101A33]">
                        Audit Details
                      </h2>

                      <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                        {getAuditId(
                          selectedAudit
                        )}
                      </span>

                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      Quick view of your assigned audit.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      closeModal
                    }
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
                  >

                    <X
                      size={19}
                    />

                  </button>

                </div>

                {/* MODAL CONTENT */}

                <div className="overflow-y-auto px-6 py-5 space-y-5">

                  {/* AUDIT INFORMATION */}

                  <DetailSection
                    title="Audit Information"
                    icon={
                      ClipboardList
                    }
                  >

                    <DetailField
                      label="Database ID"
                      value={getDatabaseId(
                        selectedAudit
                      )}
                    />

                    <DetailField
                      label="Audit ID"
                      value={getAuditId(
                        selectedAudit
                      )}
                    />

                    <DetailField
                      label="Audit Title"
                      value={getAuditTitle(
                        selectedAudit
                      )}
                      full
                    />

                    <DetailField
                      label="Audit Type"
                      value={getAuditType(
                        selectedAudit
                      )}
                    />

                    <DetailField
                      label="Status"
                      value={
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${getStatusClass(
                            getStatus(
                              selectedAudit
                            )
                          )}`}
                        >
                          {formatStatus(
                            getStatus(
                              selectedAudit
                            )
                          )}
                        </span>
                      }
                    />

                  </DetailSection>

                  {/* BUSINESS INFORMATION */}

                  <DetailSection
                    title="Business Information"
                    icon={
                      Building2
                    }
                  >

                    <DetailField
                      label="Department"
                      value={getDepartment(
                        selectedAudit
                      )}
                    />

                    <DetailField
                      label="Business Unit"
                      value={getBusinessUnit(
                        selectedAudit
                      )}
                    />

                    <DetailField
                      label="Process"
                      value={getProcess(
                        selectedAudit
                      )}
                    />

                  </DetailSection>

                  {/* RISK INFORMATION */}

                  <DetailSection
                    title="Risk Information"
                    icon={
                      ShieldAlert
                    }
                  >

                    <DetailField
                      label="Risk ID"
                      value={getRiskId(
                        selectedAudit
                      )}
                    />

                    <DetailField
                      label="Risk Title"
                      value={getRiskTitle(
                        selectedAudit
                      )}
                    />

                    <DetailField
                      label="Risk Category"
                      value={getRiskCategory(
                        selectedAudit
                      )}
                    />

                  </DetailSection>

                  {/* SCHEDULE */}

                  <DetailSection
                    title="Schedule"
                    icon={
                      CalendarDays
                    }
                  >

                    <DetailField
                      label="Start Date"
                      value={formatDate(
                        getStartDate(
                          selectedAudit
                        )
                      )}
                    />

                    <DetailField
                      label="Due Date"
                      value={formatDate(
                        getEndDate(
                          selectedAudit
                        )
                      )}
                    />

                    <DetailField
                      label="Current Status"
                      value={formatStatus(
                        getStatus(
                          selectedAudit
                        )
                      )}
                    />

                  </DetailSection>

                  {/* AUDITOR INFORMATION */}

                  <DetailSection
                    title="Auditor Information"
                    icon={
                      User
                    }
                  >

                    <DetailField
                      label="Auditor Name"
                      value={getAuditorName(
                        selectedAudit
                      )}
                    />

                    <DetailField
                      label="Employee ID"
                      value={getAuditorEmployeeId(
                        selectedAudit
                      )}
                    />

                    <DetailField
                      label="Email"
                      value={getAuditorEmail(
                        selectedAudit
                      )}
                    />

                    <DetailField
                      label="Department"
                      value={getAuditorDepartment(
                        selectedAudit
                      )}
                    />

                  </DetailSection>

                  {/* DESCRIPTION */}

                  <DetailSection
                    title="Audit Description"
                    icon={
                      Layers
                    }
                  >

                    <DetailField
                      label="Description"
                      value={getDescription(
                        selectedAudit
                      )}
                      full
                    />

                  </DetailSection>

                </div>

                {/* MODAL FOOTER */}

                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">

                  <button
                    type="button"
                    onClick={
                      closeModal
                    }
                    className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-[#101A33]"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      closeModal();

                      handleView(
                        selectedAudit
                      );
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00C98B] hover:bg-[#00A874] text-white text-sm font-semibold transition-colors"
                  >

                    <Eye
                      size={15}
                    />

                    Open Full Details

                  </button>

                </div>

              </motion.div>

            </motion.div>

          )}

      </AnimatePresence>

    </div>
  );
};

/* =========================================================
   TABLE HEAD
========================================================= */

const TableHead = ({
  children,
  align,
}) => (
  <th
    className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-500 ${
      align === "right"
        ? "text-right"
        : "text-left"
    }`}
  >
    {children}
  </th>
);

/* =========================================================
   TABLE SKELETON
========================================================= */

const AuditTableSkeleton =
  () => (
    <div>

      {Array.from({
        length: 5,
      }).map(
        (_, index) => (

          <div
            key={index}
            className="flex items-center gap-6 px-5 py-5 border-b border-gray-100 animate-pulse"
          >

            <div className="h-4 bg-gray-200 rounded w-20" />

            <div className="h-4 bg-gray-200 rounded w-40" />

            <div className="h-4 bg-gray-200 rounded w-32" />

            <div className="h-4 bg-gray-200 rounded w-28" />

            <div className="h-4 bg-gray-200 rounded w-24" />

            <div className="h-4 bg-gray-200 rounded w-24" />

            <div className="h-4 bg-gray-200 rounded w-20" />

            <div className="h-4 bg-gray-200 rounded w-20" />

          </div>

        )
      )}

    </div>
  );

export default MyAudits;