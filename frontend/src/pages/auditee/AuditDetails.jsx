import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  RefreshCw,
  AlertCircle,
  User,
  Building2,
  Layers,
  ShieldAlert,
  FileText,
  CheckCircle2,
  Circle,
  XCircle,
} from "lucide-react";

import { getAuditById } from "../../service/AuditService";

// ============================================================
// SAFE DISPLAY HELPERS
// ============================================================

// Converts ANY value into something React can safely render.
//
// Examples:
//
// "INTERNAL_AUDITOR"                 -> "INTERNAL_AUDITOR"
// { id: 1, name: "IT", active: true } -> "IT"
// { id: 1, name: "IT" }              -> "IT"
// null                               -> "-"
// undefined                          -> "-"
// ============================================================

const getDisplayValue = (value, fallback = "-") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  // Entity object
  if (typeof value === "object") {
    return (
      value.name ??
      value.departmentName ??
      value.roleName ??
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


// ============================================================
// SAFE
// ============================================================

const safe = (value) => {
  return getDisplayValue(value);
};


// ============================================================
// ENTITY LABEL HELPERS
// ============================================================

// Department is now an ENTITY:
//
// {
//   id: 1,
//   name: "INFORMATION_TECHNOLOGY",
//   active: true
// }
//
// This function safely gets the department name.
// ============================================================

const getDepartmentLabel = (department) => {
  if (!department) {
    return null;
  }

  if (typeof department === "string") {
    return department;
  }

  if (typeof department === "object") {
    return (
      department.name ??
      department.departmentName ??
      department.title ??
      department.label ??
      department.code ??
      department.id ??
      null
    );
  }

  return String(department);
};


// ============================================================
// ROLE LABEL
// ============================================================

const getRoleLabel = (role) => {
  if (!role) {
    return null;
  }

  if (typeof role === "string") {
    return role;
  }

  if (typeof role === "object") {
    return (
      role.name ??
      role.roleName ??
      role.title ??
      role.label ??
      role.code ??
      role.id ??
      null
    );
  }

  return String(role);
};


// ============================================================
// GENERIC ENTITY LABEL
// ============================================================

const getEntityLabel = (entity) => {
  if (!entity) {
    return null;
  }

  if (typeof entity === "string") {
    return entity;
  }

  if (typeof entity === "number") {
    return String(entity);
  }

  if (typeof entity === "object") {
    return (
      entity.name ??
      entity.title ??
      entity.label ??
      entity.code ??
      entity.id ??
      null
    );
  }

  return String(entity);
};


// ============================================================
// AUDIT FIELD HELPERS
// ============================================================

const getDatabaseId = (audit) => {
  return safe(audit?.id);
};


const getAuditId = (audit) => {
  return safe(audit?.auditId ?? audit?.id);
};


const getAuditTitle = (audit) => {
  return safe(
    audit?.auditName ??
      audit?.auditTitle ??
      audit?.title
  );
};


const getDepartment = (audit) => {
  const department =
    audit?.department ??
    audit?.dept ??
    audit?.auditDepartment;

  return safe(getDepartmentLabel(department));
};


const getProcess = (audit) => {
  return safe(
    getEntityLabel(
      audit?.processName ??
        audit?.process
    )
  );
};


const getBusinessUnit = (audit) => {
  return safe(
    getEntityLabel(
      audit?.businessUnit ??
        audit?.business_unit ??
        audit?.auditBusinessUnit
    )
  );
};


const getAuditType = (audit) => {
  return safe(
    getEntityLabel(
      audit?.auditType ??
        audit?.type
    )
  );
};


const getDescription = (audit) => {
  return safe(
    audit?.description ??
      audit?.auditObjective ??
      audit?.scope
  );
};


// ============================================================
// RISK HELPERS
// ============================================================

const getRiskId = (audit) => {
  const risk =
    audit?.risk ??
    null;

  if (audit?.riskId !== undefined && audit?.riskId !== null) {
    return safe(audit.riskId);
  }

  if (risk) {
    return safe(
      risk.riskId ??
        risk.id
    );
  }

  return "-";
};


const getRiskTitle = (audit) => {
  const risk =
    audit?.risk ??
    null;

  if (audit?.riskTitle) {
    return safe(audit.riskTitle);
  }

  if (risk) {
    return safe(
      risk.title ??
        risk.riskTitle ??
        risk.name
    );
  }

  return "-";
};


const getRiskCategory = (audit) => {
  const category =
    audit?.riskCategory ??
    audit?.risk?.category ??
    audit?.risk?.riskCategory;

  return safe(
    getEntityLabel(category)
  );
};


// ============================================================
// AUDITOR HELPERS
// ============================================================

const getAuditorName = (audit) => {
  // Direct name
  if (audit?.internalAuditorName) {
    return getDisplayValue(
      audit.internalAuditorName
    );
  }

  if (audit?.auditorName) {
    return getDisplayValue(
      audit.auditorName
    );
  }

  // Internal auditor entity
  if (audit?.internalAuditor) {
    const auditor =
      audit.internalAuditor;

    // Profile object
    if (auditor?.profile) {
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

    // Direct name fields
    if (auditor?.name) {
      return auditor.name;
    }

    if (
      auditor?.firstName ||
      auditor?.lastName
    ) {
      const fullName =
        `${auditor.firstName || ""} ${
          auditor.lastName || ""
        }`.trim();

      if (fullName) {
        return fullName;
      }
    }

    // Email fallback
    if (auditor?.email) {
      return auditor.email;
    }
  }

  // Old auditor structure
  if (audit?.auditor) {
    const auditor =
      audit.auditor;

    if (auditor?.profile) {
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

    if (auditor?.name) {
      return auditor.name;
    }

    if (
      auditor?.firstName ||
      auditor?.lastName
    ) {
      const fullName =
        `${auditor.firstName || ""} ${
          auditor.lastName || ""
        }`.trim();

      if (fullName) {
        return fullName;
      }
    }

    if (auditor?.email) {
      return auditor.email;
    }
  }

  return "-";
};


// ============================================================
// AUDITOR EMPLOYEE ID
// ============================================================

const getAuditorEmployeeId = (audit) => {
  return safe(
    audit?.internalAuditor?.employeeId ??
      audit?.auditor?.employeeId ??
      audit?.auditorEmployeeId
  );
};


// ============================================================
// AUDITOR EMAIL
// ============================================================

const getAuditorEmail = (audit) => {
  return safe(
    audit?.internalAuditor?.email ??
      audit?.auditor?.email ??
      audit?.auditorEmail
  );
};


// ============================================================
// AUDITOR DEPARTMENT
// ============================================================

const getAuditorDepartment = (audit) => {
  const internalDepartment =
    audit?.internalAuditor?.department;

  const auditorDepartment =
    audit?.auditor?.department;

  return safe(
    getDepartmentLabel(
      internalDepartment ??
        auditorDepartment
    )
  );
};


// ============================================================
// AUDITOR ROLE
// ============================================================

const getAuditorRole = (audit) => {
  const role =
    audit?.internalAuditor?.role ??
    audit?.auditor?.role;

  return safe(
    getRoleLabel(role)
  );
};


// ============================================================
// CHECK AUDITOR INFO
// ============================================================

const hasAuditorInfo = (audit) => {
  return Boolean(
    audit?.internalAuditorName ||
      audit?.auditorName ||
      audit?.internalAuditor ||
      audit?.auditor
  );
};


// ============================================================
// DATE
// ============================================================

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (isNaN(date.getTime())) {
    return "-";
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


const getStartDate = (audit) => {
  return formatDate(
    audit?.startDate
  );
};


const getDueDate = (audit) => {
  return formatDate(
    audit?.endDate ??
      audit?.dueDate
  );
};


const getCreatedDate = (audit) => {
  return formatDate(
    audit?.createdAt
  );
};


// ============================================================
// STATUS
// ============================================================

const getStatus = (audit) => {
  return safe(
    audit?.status
  );
};


const STATUS_STYLES = {
  PLANNED:
    "bg-blue-50 text-blue-700 border border-blue-200",

  IN_PROGRESS:
    "bg-amber-50 text-amber-700 border border-amber-200",

  COMPLETED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",

  CANCELLED:
    "bg-red-50 text-red-700 border border-red-200",

  RESPONSE_PENDING:
    "bg-orange-50 text-orange-700 border border-orange-200",

  CLOSED:
    "bg-emerald-50 text-emerald-700 border border-emerald-200",
};


const DEFAULT_STATUS_STYLE =
  "bg-gray-100 text-gray-700 border border-gray-200";


const formatStatusLabel = (status) => {
  if (!status || status === "-") {
    return "Unknown";
  }

  return status
    .toString()
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
};


// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
  const key =
    (status ?? "")
      .toString()
      .toUpperCase();

  const style =
    STATUS_STYLES[key] ||
    DEFAULT_STATUS_STYLE;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${style}`}
    >
      {formatStatusLabel(status)}
    </span>
  );
}


// ============================================================
// FINDINGS
// ============================================================

const getFindingsSummary = (audit) => {
  const findings =
    audit?.findings ??
    audit?.findingsSummary;

  if (!findings) {
    return null;
  }

  return {
    total:
      findings.total ??
      findings.totalFindings ??
      0,

    open:
      findings.open ??
      findings.openFindings ??
      0,

    high:
      findings.high ??
      findings.highFindings ??
      0,

    medium:
      findings.medium ??
      findings.mediumFindings ??
      0,

    low:
      findings.low ??
      findings.lowFindings ??
      0,
  };
};


// ============================================================
// TIMELINE
// ============================================================

const TIMELINE_STEPS = [
  "Audit Assigned",
  "Audit Started",
  "Findings Raised",
  "Response Submitted",
  "Evidence Submitted",
  "Audit Completed",
];


const getReachedStepCount = (status) => {
  const key =
    (status ?? "")
      .toString()
      .toUpperCase();

  switch (key) {
    case "PLANNED":
      return 1;

    case "IN_PROGRESS":
      return 2;

    case "RESPONSE_PENDING":
      return 3;

    case "COMPLETED":
    case "CLOSED":
      return TIMELINE_STEPS.length;

    case "CANCELLED":
      return 0;

    default:
      return 0;
  }
};


// ============================================================
// AUDIT TIMELINE
// ============================================================

function AuditTimeline({ status }) {
  const key =
    (status ?? "")
      .toString()
      .toUpperCase();

  const isCancelled =
    key === "CANCELLED";

  const reached =
    getReachedStepCount(status);

  return (
    <div>
      {isCancelled && (
        <div className="mb-5 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <XCircle className="w-4 h-4" />

          This audit was cancelled.
        </div>
      )}

      <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
        {TIMELINE_STEPS.map(
          (step, index) => {
            const done =
              !isCancelled &&
              index < reached;

            return (
              <div
                key={step}
                className="relative pl-7"
              >
                <span
                  className={`absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-4 ring-white ${
                    done
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </span>

                <p
                  className={`text-sm font-medium ${
                    done
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {step}
                </p>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}


// ============================================================
// LOADING SKELETON
// ============================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />

            <div className="h-6 bg-gray-200 rounded w-1/2 mb-6" />

            <div className="grid grid-cols-2 gap-4">
              <div className="h-4 bg-gray-200 rounded" />

              <div className="h-4 bg-gray-200 rounded" />

              <div className="h-4 bg-gray-200 rounded" />

              <div className="h-4 bg-gray-200 rounded" />
            </div>
          </div>
        )
      )}
    </div>
  );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AuditDetails() {
  // Supports both:
  //
  // audit-details/:auditId
  //
  // and:
  //
  // audit-details/:id
  //
  const params =
    useParams();

  const auditId =
    params.auditId ??
    params.id;

  const navigate =
    useNavigate();

  const [audit, setAudit] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);


  // ==========================================================
  // LOAD AUDIT
  // ==========================================================

  const loadAudit =
    useCallback(async () => {
      if (
        !auditId ||
        auditId === ":auditId" ||
        auditId === ":id"
      ) {
        console.error(
          "Audit ID is missing or invalid:",
          auditId
        );

        setError(
          "Invalid audit ID. Please open the audit from My Audits."
        );

        setLoading(false);

        return;
      }


      const numericId =
        Number(auditId);


      if (
        !Number.isInteger(
          numericId
        ) ||
        numericId <= 0
      ) {
        console.error(
          "Invalid numeric audit ID:",
          auditId
        );

        setError(
          "Invalid audit ID."
        );

        setLoading(false);

        return;
      }


      console.log(
        "Loading audit with database ID:",
        numericId
      );


      setLoading(true);
      setError(null);


      try {
        const data =
          await getAuditById(
            numericId
          );

        console.log(
          "AUDIT DETAILS RESPONSE:",
          data
        );


        if (!data) {
          setError(
            "Audit not found."
          );

          setAudit(null);

          return;
        }


        // Some APIs return:
        //
        // { data: {...} }
        //
        // while others return:
        //
        // {...}
        //
        const auditData =
          data?.data ??
          data;


        setAudit(
          auditData
        );

      } catch (err) {
        console.error(
          "Failed to load audit:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load audit details."
        );

      } finally {
        setLoading(false);
      }

    }, [auditId]);


  // ==========================================================
  // LOAD WHEN URL CHANGES
  // ==========================================================

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);


  const findings =
    audit
      ? getFindingsSummary(audit)
      : null;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-full bg-gray-50 px-4 sm:px-6 lg:px-8 py-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6">

        <button
          onClick={() =>
            navigate(
              "/auditee-officer/assigned-audits"
            )
          }
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />

          Back to My Audits
        </button>


        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
          Audit Details
        </h1>


        <p className="text-sm text-gray-500 mt-1">
          View complete information about this audit
        </p>

      </div>


      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && (
        <LoadingSkeleton />
      )}


      {/* ======================================================
          ERROR
      ====================================================== */}

      {!loading && error && (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">

          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />


          <p className="text-gray-800 font-medium">
            {error}
          </p>


          <div className="flex items-center justify-center gap-3 mt-5">

            <button
              onClick={loadAudit}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />

              Retry
            </button>


            <button
              onClick={() =>
                navigate(
                  "/auditee-officer/assigned-audits"
                )
              }
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Back to My Audits
            </button>

          </div>

        </div>
      )}


      {/* ======================================================
          NOT FOUND
      ====================================================== */}

      {!loading &&
        !error &&
        !audit && (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">

            <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />

            <p className="text-gray-800 font-medium">
              Audit not found
            </p>

          </div>
        )}


      {/* ======================================================
          CONTENT
      ====================================================== */}

      {!loading &&
        !error &&
        audit && (

          <div className="space-y-6">

            {/* ==================================================
                AUDIT HEADER
            ================================================== */}

            <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                <div>

                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {getAuditId(audit)}
                  </p>


                  <h2 className="text-lg font-semibold text-gray-900 mt-1">
                    {getAuditTitle(audit)}
                  </h2>

                </div>


                <StatusBadge
                  status={getStatus(audit)}
                />

              </div>

            </div>


            {/* ==================================================
                AUDIT INFORMATION
            ================================================== */}

            <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6">

              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">

                <ClipboardList className="w-4 h-4 text-gray-400" />

                Audit Information

              </h3>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">

                <InfoRow
                  label="Database ID"
                  value={getDatabaseId(audit)}
                />


                <InfoRow
                  label="Audit ID"
                  value={getAuditId(audit)}
                />


                <InfoRow
                  label="Audit Title"
                  value={getAuditTitle(audit)}
                />


                <InfoRow
                  label="Audit Type"
                  value={getAuditType(audit)}
                />


                <InfoRow
                  label="Department"
                  value={getDepartment(audit)}
                />


                <InfoRow
                  label="Process"
                  value={getProcess(audit)}
                />


                <InfoRow
                  label="Auditor"
                  value={getAuditorName(audit)}
                />


                <InfoRow
                  label="Start Date"
                  value={getStartDate(audit)}
                />


                <InfoRow
                  label="Due Date"
                  value={getDueDate(audit)}
                />


                {audit?.createdAt && (
                  <InfoRow
                    label="Created Date"
                    value={getCreatedDate(audit)}
                  />
                )}

              </div>

            </div>


            {/* ==================================================
                AUDIT SCOPE
            ================================================== */}

            {(audit?.description ||
              audit?.businessUnit ||
              getRiskId(audit) !== "-" ||
              getRiskTitle(audit) !== "-") && (

              <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6">

                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">

                  <Layers className="w-4 h-4 text-gray-400" />

                  Audit Scope

                </h3>


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">

                  {getBusinessUnit(audit) !== "-" && (
                    <InfoRow
                      label="Business Unit"
                      value={getBusinessUnit(audit)}
                    />
                  )}


                  {getRiskId(audit) !== "-" && (
                    <InfoRow
                      label="Risk ID"
                      value={getRiskId(audit)}
                    />
                  )}


                  {getRiskTitle(audit) !== "-" && (
                    <InfoRow
                      label="Risk Title"
                      value={getRiskTitle(audit)}
                    />
                  )}


                  {getRiskCategory(audit) !== "-" && (
                    <InfoRow
                      label="Risk Category"
                      value={getRiskCategory(audit)}
                    />
                  )}

                </div>


                {audit?.description && (
                  <div className="mt-4">

                    <p className="text-xs font-medium text-gray-400 mb-1">
                      Description
                    </p>


                    <p className="text-sm text-gray-700 leading-relaxed">
                      {getDescription(audit)}
                    </p>

                  </div>
                )}

              </div>
            )}


            {/* ==================================================
                TIMELINE
            ================================================== */}

            <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6">

              <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">

                <Calendar className="w-4 h-4 text-gray-400" />

                Audit Timeline

              </h3>


              <AuditTimeline
                status={getStatus(audit)}
              />

            </div>


            {/* ==================================================
                FINDINGS
            ================================================== */}

            <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6">

              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">

                <ShieldAlert className="w-4 h-4 text-gray-400" />

                Findings Summary

              </h3>


              {findings ? (

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">

                  <StatBlock
                    label="Total"
                    value={findings.total}
                  />


                  <StatBlock
                    label="Open"
                    value={findings.open}
                  />


                  <StatBlock
                    label="High"
                    value={findings.high}
                    tone="red"
                  />


                  <StatBlock
                    label="Medium"
                    value={findings.medium}
                    tone="amber"
                  />


                  <StatBlock
                    label="Low"
                    value={findings.low}
                    tone="emerald"
                  />

                </div>

              ) : (

                <p className="text-sm text-gray-400">
                  No findings available
                </p>

              )}

            </div>


            {/* ==================================================
                AUDITOR INFORMATION
            ================================================== */}

            {hasAuditorInfo(audit) && (

              <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6">

                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">

                  <User className="w-4 h-4 text-gray-400" />

                  Auditor Information

                </h3>


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">

                  <InfoRow
                    label="Auditor Name"
                    value={getAuditorName(audit)}
                  />


                  <InfoRow
                    label="Employee ID"
                    value={getAuditorEmployeeId(audit)}
                  />


                  <InfoRow
                    label="Email"
                    value={getAuditorEmail(audit)}
                  />


                  <InfoRow
                    label="Department"
                    value={getAuditorDepartment(audit)}
                  />


                  {getAuditorRole(audit) !== "-" && (
                    <InfoRow
                      label="Role"
                      value={getAuditorRole(audit)}
                    />
                  )}

                </div>

              </div>
            )}


            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6">

              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">

                <Building2 className="w-4 h-4 text-gray-400" />

                Actions

              </h3>


              <div className="flex flex-wrap gap-3">

                {/* VIEW FINDINGS */}

                <button
                  onClick={() =>
                    navigate(
                      `/auditee-officer/findings?auditId=${audit.id}`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <FileText className="w-3.5 h-3.5" />

                  View Findings
                </button>


                {/* SUBMIT RESPONSE */}

                {(
                  getStatus(audit)
                    .toString()
                    .toUpperCase() ===
                    "IN_PROGRESS" ||

                  getStatus(audit)
                    .toString()
                    .toUpperCase() ===
                    "PLANNED"
                ) && (

                  <button
                    onClick={() =>
                      navigate(
                        `/auditee-officer/submit-response?auditId=${audit.id}`
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />

                    Submit Response
                  </button>

                )}


                {/* VIEW EVIDENCE */}

                <button
                  onClick={() =>
                    navigate(
                      `/auditee-officer/evidence?auditId=${audit.id}`
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <Layers className="w-3.5 h-3.5" />

                  View Evidence
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}


// ============================================================
// INFO ROW
// ============================================================

function InfoRow({
  label,
  value,
}) {
  return (
    <div>

      <p className="text-xs font-medium text-gray-400 mb-1">
        {label}
      </p>


      <p className="text-sm text-gray-700 break-words">
        {getDisplayValue(value)}
      </p>

    </div>
  );
}


// ============================================================
// STAT BLOCK
// ============================================================

function StatBlock({
  label,
  value,
  tone,
}) {
  const toneClass =
    tone === "red"
      ? "text-red-600"
      : tone === "amber"
      ? "text-amber-600"
      : tone === "emerald"
      ? "text-emerald-600"
      : "text-gray-900";


  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">

      <p
        className={`text-lg font-semibold ${toneClass}`}
      >
        {value ?? 0}
      </p>


      <p className="text-xs text-gray-500 mt-1">
        {label}
      </p>

    </div>
  );
}