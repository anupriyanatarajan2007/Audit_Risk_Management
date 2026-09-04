import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileBarChart,
  Search,
  RefreshCw,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

import { getMyAssignedAudits } from "../../service/AuditService";
import auditeeAssignmentService from "../../service/auditeeAssignmentService";

// ============================================================
// AUDIT STATUS STYLES
// ============================================================

const auditStatusStyles = {
  COMPLETED:
    "bg-emerald-50 text-emerald-600 border-emerald-200",

  IN_PROGRESS:
    "bg-amber-50 text-amber-600 border-amber-200",

  PLANNED:
    "bg-slate-100 text-slate-600 border-slate-200",

  CANCELLED:
    "bg-rose-50 text-rose-600 border-rose-200",

  ON_HOLD:
    "bg-orange-50 text-orange-600 border-orange-200",
};

// ============================================================
// BADGE
// ============================================================

const Badge = ({ text, styles }) => {
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
        styles[text] ||
        "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {text || "N/A"}
    </span>
  );
};

// ============================================================
// FORMAT DATE
// ============================================================

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ============================================================
// DEPARTMENT LABEL
// ============================================================

const getDepartmentLabel = (department) => {
  if (!department) return "N/A";

  if (typeof department === "string") {
    return department;
  }

  return (
    department.name ||
    department.departmentName ||
    department.title ||
    "N/A"
  );
};

// ============================================================
// SAFE TEXT
// ============================================================

const safeText = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "N/A";
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.title ||
      value.label ||
      value.employeeName ||
      value.firstName ||
      "N/A"
    );
  }

  return String(value);
};

// ============================================================
// GET FULL USER NAME
// ============================================================

const getUserName = (user) => {
  if (!user) {
    return "N/A";
  }

  if (typeof user === "string") {
    return user;
  }

  if (user.name) {
    return user.name;
  }

  if (user.employeeName) {
    return user.employeeName;
  }

  const fullName = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  if (fullName) {
    return fullName;
  }

  if (user.username) {
    return user.username;
  }

  if (user.email) {
    return user.email;
  }

  return "N/A";
};

// ============================================================
// GET AUDITEE NAME FROM ASSIGNMENT
// ============================================================

const getAuditeeName = (assignment) => {
  if (!assignment) {
    return "N/A";
  }

  // ----------------------------------------------------------
  // Direct fields
  // ----------------------------------------------------------

  if (assignment.auditeeName) {
    return String(assignment.auditeeName);
  }

  if (assignment.employeeName) {
    return String(assignment.employeeName);
  }

  if (assignment.name) {
    return String(assignment.name);
  }

  // ----------------------------------------------------------
  // Nested auditee
  // ----------------------------------------------------------

  if (assignment.auditee) {
    const name = getUserName(assignment.auditee);

    if (name !== "N/A") {
      return name;
    }
  }

  // ----------------------------------------------------------
  // Nested user
  // ----------------------------------------------------------

  if (assignment.user) {
    const name = getUserName(assignment.user);

    if (name !== "N/A") {
      return name;
    }
  }

  // ----------------------------------------------------------
  // Nested auditeeUser
  // ----------------------------------------------------------

  if (assignment.auditeeUser) {
    const name = getUserName(
      assignment.auditeeUser
    );

    if (name !== "N/A") {
      return name;
    }
  }

  // ----------------------------------------------------------
  // Nested employee
  // ----------------------------------------------------------

  if (assignment.employee) {
    const name = getUserName(
      assignment.employee
    );

    if (name !== "N/A") {
      return name;
    }
  }

  // ----------------------------------------------------------
  // Only ID available
  // ----------------------------------------------------------

  if (assignment.auditeeId !== null &&
      assignment.auditeeId !== undefined) {
    return `Auditee #${assignment.auditeeId}`;
  }

  return "N/A";
};

// ============================================================
// NORMALIZE ASSIGNMENT RESPONSE
// ============================================================

const normalizeAssignments = (response) => {
  if (!response) {
    return [];
  }

  // Direct array
  if (Array.isArray(response)) {
    return response;
  }

  // { data: [...] }
  if (Array.isArray(response.data)) {
    return response.data;
  }

  // { assignments: [...] }
  if (Array.isArray(response.assignments)) {
    return response.assignments;
  }

  // { content: [...] }
  if (Array.isArray(response.content)) {
    return response.content;
  }

  // Single object
  if (typeof response === "object") {
    return [response];
  }

  return [];
};

// ============================================================
// GET ASSIGNMENT AUDIT REFERENCES
// ============================================================

const getAssignmentAuditDbId = (assignment) => {
  if (!assignment) {
    return null;
  }

  return (
    assignment.auditId ??
    assignment.audit?.id ??
    assignment.auditDbId ??
    assignment.audit?.auditId ??
    null
  );
};

const getAssignmentAuditCode = (assignment) => {
  if (!assignment) {
    return null;
  }

  return (
    assignment.auditCode ??
    assignment.audit?.auditId ??
    assignment.audit?.auditCode ??
    null
  );
};

// ============================================================
// CHECK WHETHER ASSIGNMENT BELONGS TO AUDIT
// ============================================================

const assignmentBelongsToAudit = (
  assignment,
  audit
) => {
  if (!assignment || !audit) {
    return false;
  }

  const auditDbId = audit.id;
  const auditCode = audit.auditId;

  const assignmentDbId =
    getAssignmentAuditDbId(assignment);

  const assignmentCode =
    getAssignmentAuditCode(assignment);

  // ----------------------------------------------------------
  // Compare DB ID
  // ----------------------------------------------------------

  if (
    auditDbId !== null &&
    auditDbId !== undefined &&
    assignmentDbId !== null &&
    assignmentDbId !== undefined
  ) {
    if (
      String(assignmentDbId) ===
      String(auditDbId)
    ) {
      return true;
    }
  }

  // ----------------------------------------------------------
  // Compare audit business code
  // ----------------------------------------------------------

  if (
    auditCode &&
    assignmentCode
  ) {
    if (
      String(assignmentCode).toLowerCase() ===
      String(auditCode).toLowerCase()
    ) {
      return true;
    }
  }

  return false;
};

// ============================================================
// FIND CORRECT ASSIGNMENT
// ============================================================

const findAssignmentForAudit = (
  assignments,
  audit
) => {
  if (!Array.isArray(assignments) ||
      assignments.length === 0) {
    return null;
  }

  // First try exact matching
  const exactMatch = assignments.find(
    (assignment) =>
      assignmentBelongsToAudit(
        assignment,
        audit
      )
  );

  if (exactMatch) {
    return exactMatch;
  }

  // If endpoint was already called using audit ID,
  // first assignment is normally the relevant one.
  return assignments[0];
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AuditReports() {
  const navigate = useNavigate();

  const [audits, setAudits] = useState([]);

  /*
   * Example:
   *
   * {
   *   "1": {
   *      auditeeName: "Kavya S",
   *      auditeeId: 5
   *   }
   * }
   *
   * DB audit ID is used as the main key.
   */
  const [auditeeMap, setAuditeeMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [deptFilter, setDeptFilter] =
    useState("ALL");

  // ============================================================
  // LOAD AUDITS
  // ============================================================

  const loadAudits = async () => {
    setLoading(true);
    setError(null);

    try {
      // ========================================================
      // STEP 1
      // GET INTERNAL AUDITOR ASSIGNED AUDITS
      // ========================================================

      const data =
        await getMyAssignedAudits();

      console.log(
        "===================================="
      );

      console.log(
        "RAW AUDITS RESPONSE:",
        data
      );

      console.log(
        "===================================="
      );

      const auditList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setAudits(auditList);

      // ========================================================
      // STEP 2
      // FIND AUDITEE USING AUDIT ID
      // ========================================================

      const newAuditeeMap = {};

      await Promise.all(
        auditList.map(async (audit) => {
          try {
            if (!audit) {
              return;
            }

            // --------------------------------------------------
            // IMPORTANT
            //
            // Prefer DB ID:
            //
            // audit.id = 1
            //
            // Then fallback:
            //
            // audit.auditId = AUD-001
            // --------------------------------------------------

            const auditDbId = audit.id;
            const auditCode = audit.auditId;

            console.log(
              "------------------------------------"
            );

            console.log(
              "Finding auditee for audit:"
            );

            console.log(
              "DB Audit ID:",
              auditDbId
            );

            console.log(
              "Audit Code:",
              auditCode
            );

            let assignments = [];

            // ==================================================
            // FIRST ATTEMPT
            // /audit/{DB ID}
            // ==================================================

            if (
              auditDbId !== null &&
              auditDbId !== undefined
            ) {
              try {
                console.log(
                  `GET assignments by DB audit ID: ${auditDbId}`
                );

                const response =
                  await auditeeAssignmentService
                    .getAssignmentsByAudit(
                      auditDbId
                    );

                console.log(
                  `ASSIGNMENT RESPONSE FOR DB ID ${auditDbId}:`,
                  response
                );

                assignments =
                  normalizeAssignments(
                    response
                  );
              } catch (dbIdError) {
                console.warn(
                  `DB ID lookup failed for audit ${auditDbId}`,
                  dbIdError
                );
              }
            }

            // ==================================================
            // SECOND ATTEMPT
            // /audit/{AUD-001}
            //
            // Only if DB ID returned nothing.
            // ==================================================

            if (
              assignments.length === 0 &&
              auditCode
            ) {
              try {
                console.log(
                  `Trying audit code lookup: ${auditCode}`
                );

                const response =
                  await auditeeAssignmentService
                    .getAssignmentsByAudit(
                      auditCode
                    );

                console.log(
                  `ASSIGNMENT RESPONSE FOR CODE ${auditCode}:`,
                  response
                );

                assignments =
                  normalizeAssignments(
                    response
                  );
              } catch (codeError) {
                console.warn(
                  `Audit code lookup failed for ${auditCode}`,
                  codeError
                );
              }
            }

            // ==================================================
            // NO ASSIGNMENT
            // ==================================================

            if (assignments.length === 0) {
              console.log(
                `NO AUDITEE FOUND FOR AUDIT ${auditCode}`
              );

              return;
            }

            // ==================================================
            // FIND EXACT ASSIGNMENT
            // ==================================================

            const assignment =
              findAssignmentForAudit(
                assignments,
                audit
              );

            if (!assignment) {
              console.log(
                `NO MATCHING ASSIGNMENT FOR ${auditCode}`
              );

              return;
            }

            // ==================================================
            // GET AUDITEE NAME
            // ==================================================

            const auditeeName =
              getAuditeeName(
                assignment
              );

            console.log(
              "AUDITEE ASSIGNMENT:",
              assignment
            );

            console.log(
              "AUDITEE NAME:",
              auditeeName
            );

            // ==================================================
            // STORE USING DB AUDIT ID
            // ==================================================

            if (
              auditDbId !== null &&
              auditDbId !== undefined
            ) {
              newAuditeeMap[
                String(auditDbId)
              ] = assignment;
            }

            // ==================================================
            // ALSO STORE USING AUDIT CODE
            //
            // This makes lookup safer in UI.
            // ==================================================

            if (auditCode) {
              newAuditeeMap[
                String(auditCode)
              ] = assignment;
            }

            console.log(
              `AUDITEE FOUND FOR ${auditCode}:`,
              auditeeName
            );

            console.log(
              "------------------------------------"
            );
          } catch (assignmentError) {
            console.error(
              `Failed to find auditee for audit ${audit?.auditId}:`,
              assignmentError
            );
          }
        })
      );

      // ========================================================
      // FINAL MAP
      // ========================================================

      console.log(
        "===================================="
      );

      console.log(
        "FINAL AUDITEE MAP:",
        newAuditeeMap
      );

      console.log(
        "===================================="
      );

      setAuditeeMap(newAuditeeMap);
    } catch (err) {
      console.error(
        "Failed to load assigned audits:",
        err
      );

      const status =
        err?.response?.status;

      if (status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (status === 403) {
        setError(
          "You do not have permission to access audit reports."
        );
      } else if (status === 404) {
        setError(
          "No assigned audits could be found."
        );
      } else if (!err?.response) {
        setError(
          "Unable to connect to the server. Please try again."
        );
      } else {
        setError(
          "Unable to load audit reports. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadAudits();
  }, []);

  // ============================================================
  // DEPARTMENTS
  // ============================================================

  const departments = useMemo(() => {
    const departmentSet = new Set();

    audits.forEach((audit) => {
      const department =
        getDepartmentLabel(
          audit?.department
        );

      if (department !== "N/A") {
        departmentSet.add(
          department
        );
      }
    });

    return [
      "ALL",
      ...Array.from(departmentSet),
    ];
  }, [audits]);

  // ============================================================
  // FILTER AUDITS
  // ============================================================

  const filteredAudits = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return audits.filter((audit) => {
      const auditId =
        safeText(
          audit?.auditId
        );

      const auditName =
        safeText(
          audit?.auditName
        );

      const riskId =
        safeText(
          audit?.riskId
        );

      const riskTitle =
        safeText(
          audit?.riskTitle
        );

      const processName =
        safeText(
          audit?.processName
        );

      const businessUnit =
        safeText(
          audit?.businessUnit
        );

      const department =
        getDepartmentLabel(
          audit?.department
        );

      // --------------------------------------------------------
      // FIND ASSIGNMENT
      // --------------------------------------------------------

      const assignment =
        auditeeMap[
          String(
            audit?.id
          )
        ] ||
        auditeeMap[
          String(
            audit?.auditId
          )
        ];

      const auditeeName =
        getAuditeeName(
          assignment
        );

      // --------------------------------------------------------
      // SEARCH
      // --------------------------------------------------------

      const matchesSearch =
        !searchValue ||
        auditId
          .toLowerCase()
          .includes(searchValue) ||
        auditName
          .toLowerCase()
          .includes(searchValue) ||
        riskId
          .toLowerCase()
          .includes(searchValue) ||
        riskTitle
          .toLowerCase()
          .includes(searchValue) ||
        processName
          .toLowerCase()
          .includes(searchValue) ||
        businessUnit
          .toLowerCase()
          .includes(searchValue) ||
        auditeeName
          .toLowerCase()
          .includes(searchValue);

      // --------------------------------------------------------
      // STATUS
      // --------------------------------------------------------

      const matchesStatus =
        statusFilter === "ALL" ||
        audit?.status ===
          statusFilter;

      // --------------------------------------------------------
      // DEPARTMENT
      // --------------------------------------------------------

      const matchesDepartment =
        deptFilter === "ALL" ||
        department ===
          deptFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesDepartment
      );
    });
  }, [
    audits,
    auditeeMap,
    search,
    statusFilter,
    deptFilter,
  ]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.3,
      }}
      className="min-h-screen bg-slate-50 p-6 space-y-6"
    >
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center shadow-sm">
          <FileBarChart className="w-6 h-6 text-teal-600" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Audit Reports
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Generate, review and download
            comprehensive audit reports for your
            assigned audits.
          </p>
        </div>
      </div>

      {/* ====================================================== */}
      {/* FILTERS */}
      {/* ====================================================== */}

      <div className="flex flex-wrap gap-3 items-center bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">

        {/* SEARCH */}

        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

          <input
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search audit, risk, process, auditee or ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
        </div>

        {/* STATUS */}

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
        >
          <option value="ALL">
            All Statuses
          </option>

          <option value="PLANNED">
            Planned
          </option>

          <option value="IN_PROGRESS">
            In Progress
          </option>

          <option value="COMPLETED">
            Completed
          </option>

          <option value="CANCELLED">
            Cancelled
          </option>

          <option value="ON_HOLD">
            On Hold
          </option>
        </select>

        {/* DEPARTMENT */}

        <select
          value={deptFilter}
          onChange={(e) =>
            setDeptFilter(
              e.target.value
            )
          }
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
        >
          {departments.map(
            (department) => (
              <option
                key={department}
                value={department}
              >
                {department ===
                "ALL"
                  ? "All Departments"
                  : department}
              </option>
            )
          )}
        </select>

        {/* REFRESH */}

        <button
          onClick={loadAudits}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed border border-teal-600 text-sm text-white transition shadow-sm"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              loading
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {/* ====================================================== */}
      {/* ERROR */}
      {/* ====================================================== */}

      {error && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-sm shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />

          {error}
        </div>
      )}

      {/* ====================================================== */}
      {/* TABLE */}
      {/* ====================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

        {/* TABLE HEADER */}

        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Assigned Audits
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              {filteredAudits.length} audit
              {filteredAudits.length !==
              1
                ? "s"
                : ""}
            </p>
          </div>

          <FileBarChart className="w-5 h-5 text-slate-300" />
        </div>

        {/* TABLE SCROLL */}

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1450px]">

            {/* ================================================== */}
            {/* TABLE HEADER */}
            {/* ================================================== */}

            <thead>
              <tr className="text-left text-slate-500 bg-slate-50 border-b border-slate-200">

                <th className="px-4 py-3 font-medium">
                  Audit ID
                </th>

                <th className="px-4 py-3 font-medium">
                  Audit Name
                </th>

                <th className="px-4 py-3 font-medium">
                  Department
                </th>

                <th className="px-4 py-3 font-medium">
                  Business Unit
                </th>

                <th className="px-4 py-3 font-medium">
                  Process
                </th>

                <th className="px-4 py-3 font-medium">
                  Risk
                </th>

                <th className="px-4 py-3 font-medium">
                  Internal Auditor
                </th>

                <th className="px-4 py-3 font-medium">
                  Auditee
                </th>

                <th className="px-4 py-3 font-medium">
                  Start Date
                </th>

                <th className="px-4 py-3 font-medium">
                  Due Date
                </th>

                <th className="px-4 py-3 font-medium">
                  Status
                </th>

                <th className="px-4 py-3 font-medium text-right">
                  Action
                </th>

              </tr>
            </thead>

            {/* ================================================== */}
            {/* TABLE BODY */}
            {/* ================================================== */}

            <tbody>

              {/* LOADING */}

              {loading &&
                Array.from({
                  length: 5,
                }).map(
                  (_, index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-100"
                    >
                      {Array.from({
                        length: 12,
                      }).map(
                        (
                          __,
                          cellIndex
                        ) => (
                          <td
                            key={
                              cellIndex
                            }
                            className="px-4 py-4"
                          >
                            <div className="h-4 bg-slate-100 rounded animate-pulse" />
                          </td>
                        )
                      )}
                    </tr>
                  )
                )}

              {/* EMPTY */}

              {!loading &&
                filteredAudits.length ===
                  0 &&
                !error && (
                  <tr>
                    <td
                      colSpan={12}
                      className="px-4 py-14 text-center"
                    >
                      <FileBarChart className="w-8 h-8 text-slate-300 mx-auto mb-3" />

                      <p className="text-sm text-slate-500">
                        No assigned audits
                        found.
                      </p>
                    </td>
                  </tr>
                )}

              {/* DATA */}

              {!loading &&
                filteredAudits.map(
                  (
                    audit,
                    index
                  ) => {

                    const auditId =
                      safeText(
                        audit?.auditId
                      );

                    const auditName =
                      safeText(
                        audit?.auditName
                      );

                    const department =
                      getDepartmentLabel(
                        audit?.department
                      );

                    const businessUnit =
                      safeText(
                        audit?.businessUnit
                      );

                    const processName =
                      safeText(
                        audit?.processName
                      );

                    const riskId =
                      safeText(
                        audit?.riskId
                      );

                    const riskTitle =
                      safeText(
                        audit?.riskTitle
                      );

                    const internalAuditor =
                      safeText(
                        audit?.internalAuditorName
                      );

                    // ==================================================
                    // FIND AUDITEE
                    //
                    // First:
                    // audit.id
                    //
                    // Fallback:
                    // audit.auditId
                    // ==================================================

                    const assignment =
                      auditeeMap[
                        String(
                          audit?.id
                        )
                      ] ||
                      auditeeMap[
                        String(
                          audit?.auditId
                        )
                      ];

                    const auditee =
                      getAuditeeName(
                        assignment
                      );

                    const status =
                      safeText(
                        audit?.status
                      );

                    return (
                      <motion.tr
                        key={
                          audit?.id ||
                          audit?.auditId ||
                          index
                        }
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        transition={{
                          delay:
                            index *
                            0.02,
                        }}
                        className="border-b border-slate-100 hover:bg-teal-50/40 transition-colors"
                      >

                        {/* AUDIT ID */}

                        <td className="px-4 py-4">
                          <span className="font-mono text-xs font-medium text-teal-600">
                            {auditId}
                          </span>
                        </td>

                        {/* AUDIT NAME */}

                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-800 max-w-[180px] truncate">
                            {auditName}
                          </div>

                          <div className="text-xs text-slate-400 mt-1">
                            DB ID:{" "}
                            {audit?.id ||
                              "N/A"}
                          </div>
                        </td>

                        {/* DEPARTMENT */}

                        <td className="px-4 py-4">
                          <span className="text-slate-600">
                            {department}
                          </span>
                        </td>

                        {/* BUSINESS UNIT */}

                        <td className="px-4 py-4">
                          <span className="text-slate-600">
                            {businessUnit}
                          </span>
                        </td>

                        {/* PROCESS */}

                        <td className="px-4 py-4">
                          <span
                            className="text-slate-600 max-w-[180px] truncate block"
                            title={
                              processName
                            }
                          >
                            {processName}
                          </span>
                        </td>

                        {/* RISK */}

                        <td className="px-4 py-4">
                          <div className="max-w-[230px]">

                            <div className="font-mono text-xs text-teal-600">
                              {riskId}
                            </div>

                            <div
                              className="text-xs text-slate-600 mt-1 truncate"
                              title={
                                riskTitle
                              }
                            >
                              {riskTitle}
                            </div>

                          </div>
                        </td>

                        {/* INTERNAL AUDITOR */}

                        <td className="px-4 py-4">
                          <span className="text-slate-600">
                            {
                              internalAuditor
                            }
                          </span>
                        </td>

                        {/* AUDITEE */}

                        <td className="px-4 py-4">
                          <div className="max-w-[160px]">

                            <span
                              className={
                                auditee ===
                                "N/A"
                                  ? "text-slate-400"
                                  : "text-slate-700 font-medium"
                              }
                              title={
                                auditee
                              }
                            >
                              {auditee}
                            </span>

                            {/* Debug ID if only ID exists */}

                            {assignment?.auditeeId &&
                              auditee.startsWith(
                                "Auditee #"
                              ) && (
                                <div className="text-[10px] text-slate-400 mt-1">
                                  ID:{" "}
                                  {
                                    assignment.auditeeId
                                  }
                                </div>
                              )}

                          </div>
                        </td>

                        {/* START DATE */}

                        <td className="px-4 py-4 whitespace-nowrap text-slate-500">
                          {formatDate(
                            audit?.startDate
                          )}
                        </td>

                        {/* END DATE */}

                        <td className="px-4 py-4 whitespace-nowrap text-slate-500">
                          {formatDate(
                            audit?.endDate
                          )}
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4">
                          <Badge
                            text={status}
                            styles={
                              auditStatusStyles
                            }
                          />
                        </td>

                        {/* ACTION */}

                        <td className="px-4 py-4 text-right">

                          <button
                            onClick={() =>
                              navigate(
                                `/internal-auditor/audit-reports/${
                                  audit?.id ||
                                  audit?.auditId
                                }`
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-600 text-xs font-medium transition whitespace-nowrap"
                          >
                            Generate Report

                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                        </td>

                      </motion.tr>
                    );
                  }
                )}

            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}