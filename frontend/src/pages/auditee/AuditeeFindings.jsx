import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion, AnimatePresence } from "framer-motion";

import {
  Search,
  X,
  ClipboardList,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Eye,
  RefreshCw,
  FileWarning,
} from "lucide-react";

import {
  getFindingsByAuditId,
} from "../../service/FindingService";

import {
  getMyAuditeeAudits,
} from "../../service/AuditService";

// ============================================================
// CONSTANTS
// ============================================================

const RISK_LEVELS = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

const STATUS_OPTIONS = [
  "DRAFT",
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

// ============================================================
// HELPERS
// ============================================================

// Get database ID of audit.
//
// Your backend GET /api/audits/{id}
// expects NUMERIC database ID.
//
// Different DTOs may return:
// id
// auditDbId
// auditId
// audit.id
//
// We prioritize database ID fields.
// ============================================================

const getAuditDatabaseId = (audit) => {
  if (!audit) {
    return null;
  }

  const id =
    audit.auditDbId ??
    audit.id ??
    audit.audit?.auditDbId ??
    audit.audit?.id ??
    null;

  const numericId = Number(id);

  if (
    Number.isInteger(numericId) &&
    numericId > 0
  ) {
    return numericId;
  }

  return null;
};

// ============================================================
// GET AUDIT DISPLAY NAME
// ============================================================

const getAuditNameFromObject = (audit) => {
  if (!audit) {
    return "Unknown Audit";
  }

  return (
    audit.auditName ||
    audit.auditTitle ||
    audit.title ||
    audit.auditCode ||
    audit.auditId ||
    `Audit #${audit.id || audit.auditDbId || "N/A"}`
  );
};

// ============================================================
// NORMALIZE FINDING RESPONSE
// ============================================================

const normalizeFindings = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

// ============================================================
// COMPONENT
// ============================================================

const AuditeeFindings = () => {
  // ==========================================================
  // STATE
  // ==========================================================

  const [findings, setFindings] = useState([]);

  const [assignedAudits, setAssignedAudits] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRisk, setSelectedRisk] = useState("ALL");

  const [selectedStatus, setSelectedStatus] =
    useState("ALL");

  const [selectedFinding, setSelectedFinding] =
    useState(null);

  // ==========================================================
  // LOAD AUDITEE FINDINGS
  // ==========================================================
  //
  // FLOW:
  //
  // CURRENT AUDITEE
  //       ↓
  // /api/audits/my-audits
  //       ↓
  // ASSIGNED AUDITS
  //       ↓
  // /api/findings/audit/{auditId}
  //       ↓
  // ONLY ASSIGNED AUDIT FINDINGS
  //
  // ==========================================================

  const loadAuditeeFindings = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        // ------------------------------------------------------
        // STEP 1:
        // Get audits assigned to CURRENT AUDITEE
        // ------------------------------------------------------

        const auditsResponse =
          await getMyAuditeeAudits();

        const audits = Array.isArray(
          auditsResponse
        )
          ? auditsResponse
          : [];

        console.log(
          "AUDITEE ASSIGNED AUDITS:",
          audits
        );

        setAssignedAudits(audits);

        // ------------------------------------------------------
        // STEP 2:
        // If no audits are assigned,
        // there cannot be any findings to display.
        // ------------------------------------------------------

        if (audits.length === 0) {
          setFindings([]);
          return;
        }

        // ------------------------------------------------------
        // STEP 3:
        // Extract numeric database IDs
        // ------------------------------------------------------

        const auditEntries = audits
          .map((audit) => ({
            audit,
            auditId:
              getAuditDatabaseId(audit),
          }))
          .filter(
            (entry) => entry.auditId !== null
          );

        console.log(
          "AUDIT DATABASE IDS:",
          auditEntries.map(
            (entry) => entry.auditId
          )
        );

        // ------------------------------------------------------
        // STEP 4:
        // Get findings ONLY for assigned audits
        // ------------------------------------------------------

        const findingsResponses =
          await Promise.all(
            auditEntries.map(
              async ({ audit, auditId }) => {
                try {
                  const response =
                    await getFindingsByAuditId(
                      auditId
                    );

                  const auditFindings =
                    normalizeFindings(response);

                  // Add audit information to each
                  // finding for reliable display.
                  return auditFindings.map(
                    (finding) => ({
                      ...finding,

                      // Preserve existing values
                      // and add fallback values.
                      auditDbId:
                        finding.auditDbId ??
                        auditId,

                      auditId:
                        finding.auditId ??
                        auditId,

                      auditName:
                        finding.auditName ??
                        finding.auditTitle ??
                        getAuditNameFromObject(
                          audit
                        ),

                      auditTitle:
                        finding.auditTitle ??
                        finding.auditName ??
                        getAuditNameFromObject(
                          audit
                        ),
                    })
                  );
                } catch (findingError) {
                  console.error(
                    `Failed to load findings for audit ${auditId}:`,
                    findingError
                  );

                  // One failed audit should not
                  // destroy the complete page.
                  return [];
                }
              }
            )
          );

        // ------------------------------------------------------
        // STEP 5:
        // Flatten findings
        // ------------------------------------------------------

        const allAuditeeFindings =
          findingsResponses.flat();

        // ------------------------------------------------------
        // STEP 6:
        // Remove duplicate findings
        // ------------------------------------------------------

        const uniqueFindings = Array.from(
          new Map(
            allAuditeeFindings.map(
              (finding, index) => [
                finding.id ??
                  finding.findingId ??
                  `${finding.auditId}-${index}`,
                finding,
              ]
            )
          ).values()
        );

        console.log(
          "AUDITEE FINDINGS ONLY:",
          uniqueFindings
        );

        setFindings(uniqueFindings);
      } catch (loadError) {
        console.error(
          "Failed to load Auditee findings:",
          loadError
        );

        setFindings([]);

        setError(
          loadError?.response?.data?.message ||
            loadError?.message ||
            "Failed to load findings"
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
    loadAuditeeFindings();
  }, [loadAuditeeFindings]);

  // ==========================================================
  // FILTER FINDINGS
  // ==========================================================

  const filteredFindings = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    return findings.filter((finding) => {
      // ------------------------------------------------------
      // SEARCH
      // ------------------------------------------------------

      const matchesSearch =
        !search ||
        String(
          finding.findingId ??
            finding.id ??
            ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          finding.title ??
            finding.findingTitle ??
            ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          finding.observation ??
            finding.description ??
            ""
        )
          .toLowerCase()
          .includes(search) ||

        String(
          finding.auditName ??
            finding.auditTitle ??
            finding.auditCode ??
            finding.auditId ??
            ""
        )
          .toLowerCase()
          .includes(search);

      // ------------------------------------------------------
      // RISK FILTER
      // ------------------------------------------------------

      const findingRisk =
        String(
          finding.riskLevel ??
            finding.risk ??
            ""
        ).toUpperCase();

      const matchesRisk =
        selectedRisk === "ALL" ||
        findingRisk === selectedRisk;

      // ------------------------------------------------------
      // STATUS FILTER
      // ------------------------------------------------------

      const findingStatus =
        String(
          finding.status ?? ""
        ).toUpperCase();

      const matchesStatus =
        selectedStatus === "ALL" ||
        findingStatus === selectedStatus;

      return (
        matchesSearch &&
        matchesRisk &&
        matchesStatus
      );
    });
  }, [
    findings,
    searchTerm,
    selectedRisk,
    selectedStatus,
  ]);

  // ==========================================================
  // STATS
  // ==========================================================

  const stats = useMemo(() => {
    const total = findings.length;

    const open = findings.filter((finding) => {
      const status =
        String(
          finding.status ?? ""
        ).toUpperCase();

      return [
        "OPEN",
        "IN_PROGRESS",
      ].includes(status);
    }).length;

    const highCritical =
      findings.filter((finding) => {
        const risk =
          String(
            finding.riskLevel ??
              finding.risk ??
              ""
          ).toUpperCase();

        return [
          "HIGH",
          "CRITICAL",
        ].includes(risk);
      }).length;

    const completed =
      findings.filter((finding) => {
        const status =
          String(
            finding.status ?? ""
          ).toUpperCase();

        return [
          "RESOLVED",
          "CLOSED",
        ].includes(status);
      }).length;

    return {
      total,
      open,
      highCritical,
      completed,
    };
  }, [findings]);

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

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
      return "N/A";
    }
  };

  // ==========================================================
  // STATUS STYLE
  // ==========================================================

  const getStatusClass = (status) => {
    const normalized =
      String(status || "").toUpperCase();

    switch (normalized) {
      case "OPEN":
        return "bg-red-100 text-red-700";

      case "IN_PROGRESS":
        return "bg-amber-100 text-amber-700";

      case "RESOLVED":
        return "bg-blue-100 text-blue-700";

      case "CLOSED":
        return "bg-green-100 text-green-700";

      case "DRAFT":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ==========================================================
  // RISK STYLE
  // ==========================================================

  const getRiskClass = (risk) => {
    const normalized =
      String(risk || "").toUpperCase();

    switch (normalized) {
      case "CRITICAL":
        return "bg-red-100 text-red-700";

      case "HIGH":
        return "bg-orange-100 text-orange-700";

      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";

      case "LOW":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ==========================================================
  // GET AUDIT NAME
  // ==========================================================

  const getAuditName = (finding) => {
    return (
      finding?.auditName ||
      finding?.auditTitle ||
      finding?.auditCode ||
      `Audit #${
        finding?.auditDbId ??
        finding?.auditId ??
        "N/A"
      }`
    );
  };

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRisk("ALL");
    setSelectedStatus("ALL");
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw
            className="animate-spin text-teal-600"
            size={34}
          />

          <p className="text-gray-600 font-medium">
            Loading your audit findings...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-teal-100 text-teal-700">
                <ClipboardList size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  My Audit Findings
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Findings from audits assigned to you
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              loadAuditeeFindings(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:opacity-60 transition"
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertTriangle
              size={20}
              className="mt-0.5 flex-shrink-0"
            />

            <div>
              <p className="font-semibold">
                Unable to load findings
              </p>

              <p className="text-sm mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* SUMMARY CARDS */}
        {/* ================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* TOTAL */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total Findings
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-teal-100 text-teal-700">
                <FileWarning size={22} />
              </div>
            </div>
          </motion.div>

          {/* OPEN */}

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
              delay: 0.05,
            }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Open / In Progress
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.open}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-100 text-amber-700">
                <Clock size={22} />
              </div>
            </div>
          </motion.div>

          {/* HIGH / CRITICAL */}

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
              delay: 0.1,
            }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  High / Critical
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.highCritical}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-red-100 text-red-700">
                <AlertTriangle size={22} />
              </div>
            </div>
          </motion.div>

          {/* COMPLETED */}

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
              delay: 0.15,
            }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Resolved / Closed
                </p>

                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.completed}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-green-100 text-green-700">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </motion.div>

        </div>

        {/* ================================================== */}
        {/* ASSIGNED AUDIT INFO */}
        {/* ================================================== */}

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

          <div className="flex items-center justify-between mb-4">

            <div>
              <h2 className="font-semibold text-gray-900">
                My Assigned Audits
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Findings are restricted to these audits.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-semibold">
              {assignedAudits.length} Audit
              {assignedAudits.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          {assignedAudits.length === 0 ? (
            <div className="py-6 text-center text-gray-500">
              No audits are currently assigned to you.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">

              {assignedAudits.map(
                (audit, index) => (
                  <div
                    key={
                      getAuditDatabaseId(
                        audit
                      ) ??
                      index
                    }
                    className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700"
                  >
                    <span className="font-medium">
                      {getAuditNameFromObject(
                        audit
                      )}
                    </span>
                  </div>
                )
              )}

            </div>
          )}

        </div>

        {/* ================================================== */}
        {/* FILTERS */}
        {/* ================================================== */}

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* SEARCH */}

            <div className="md:col-span-2 relative">

              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search finding, audit, title..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />

            </div>

            {/* RISK */}

            <select
              value={selectedRisk}
              onChange={(event) =>
                setSelectedRisk(
                  event.target.value
                )
              }
              className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="ALL">
                All Risk Levels
              </option>

              {RISK_LEVELS.map((risk) => (
                <option
                  key={risk}
                  value={risk}
                >
                  {risk}
                </option>
              ))}
            </select>

            {/* STATUS */}

            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value
                )
              }
              className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    {status.replace(
                      "_",
                      " "
                    )}
                  </option>
                )
              )}
            </select>

          </div>

          {/* FILTER FOOTER */}

          {(searchTerm ||
            selectedRisk !== "ALL" ||
            selectedStatus !== "ALL") && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">

              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-800">
                  {filteredFindings.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {findings.length}
                </span>{" "}
                findings
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                Clear filters
              </button>

            </div>
          )}

        </div>

        {/* ================================================== */}
        {/* FINDINGS TABLE */}
        {/* ================================================== */}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">

            <div>
              <h2 className="font-semibold text-gray-900">
                Audit Findings
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Only findings from your assigned audits
              </p>
            </div>

            <span className="text-sm text-gray-500">
              {filteredFindings.length} result
              {filteredFindings.length !== 1
                ? "s"
                : ""}
            </span>

          </div>

          {filteredFindings.length === 0 ? (

            <div className="py-16 text-center">

              <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <FileWarning size={25} />
              </div>

              <h3 className="mt-4 font-semibold text-gray-800">
                No findings found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {findings.length === 0
                  ? "There are no findings for your assigned audits."
                  : "Try changing your search or filters."}
              </p>

              {(searchTerm ||
                selectedRisk !== "ALL" ||
                selectedStatus !== "ALL") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700"
                >
                  Clear Filters
                </button>
              )}

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-gray-50 border-b border-gray-200">

                  <tr>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Finding
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Audit
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Title / Observation
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Risk
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>

                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Created
                    </th>

                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredFindings.map(
                    (finding, index) => {

                      const risk =
                        String(
                          finding.riskLevel ??
                            finding.risk ??
                            "N/A"
                        ).toUpperCase();

                      const status =
                        String(
                          finding.status ??
                            "N/A"
                        ).toUpperCase();

                      const findingId =
                        finding.findingId ??
                        finding.id ??
                        `F-${index + 1}`;

                      const title =
                        finding.title ??
                        finding.findingTitle ??
                        "Untitled Finding";

                      const observation =
                        finding.observation ??
                        finding.description ??
                        "No observation available";

                      const createdDate =
                        finding.createdAt ??
                        finding.createdDate ??
                        finding.dateCreated;

                      return (
                        <motion.tr
                          key={
                            finding.id ??
                            finding.findingId ??
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
                              index * 0.02,
                          }}
                          className="hover:bg-gray-50 transition"
                        >

                          {/* FINDING ID */}

                          <td className="px-5 py-4">

                            <div className="font-semibold text-gray-900">
                              {findingId}
                            </div>

                          </td>

                          {/* AUDIT */}

                          <td className="px-5 py-4">

                            <div className="max-w-[180px]">

                              <p className="font-medium text-gray-800 truncate">
                                {getAuditName(
                                  finding
                                )}
                              </p>

                              <p className="text-xs text-gray-400 mt-1">
                                ID:{" "}
                                {finding.auditDbId ??
                                  finding.auditId ??
                                  "N/A"}
                              </p>

                            </div>

                          </td>

                          {/* TITLE */}

                          <td className="px-5 py-4">

                            <div className="max-w-[260px]">

                              <p className="font-medium text-gray-800 truncate">
                                {title}
                              </p>

                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {observation}
                              </p>

                            </div>

                          </td>

                          {/* RISK */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getRiskClass(
                                risk
                              )}`}
                            >
                              {risk}
                            </span>

                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                                status
                              )}`}
                            >
                              {status.replace(
                                "_",
                                " "
                              )}
                            </span>

                          </td>

                          {/* CREATED */}

                          <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {formatDate(
                              createdDate
                            )}
                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedFinding(
                                  finding
                                )
                              }
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition"
                            >
                              <Eye size={16} />

                              View
                            </button>

                          </td>

                        </motion.tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

      {/* ==================================================== */}
      {/* FINDING DETAILS MODAL */}
      {/* ==================================================== */}

      <AnimatePresence>

        {selectedFinding && (

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
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() =>
              setSelectedFinding(null)
            }
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 15,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >

              {/* MODAL HEADER */}

              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Finding
                  </p>

                  <h2 className="text-xl font-bold text-gray-900 mt-1">
                    {selectedFinding.findingId ??
                      selectedFinding.id ??
                      "Finding"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedFinding(null)
                  }
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X size={20} />
                </button>

              </div>

              {/* MODAL BODY */}

              <div className="p-6 space-y-6">

                {/* AUDIT */}

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Audit
                  </p>

                  <p className="mt-1 text-gray-900 font-semibold">
                    {getAuditName(
                      selectedFinding
                    )}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Database ID:{" "}
                    {selectedFinding.auditDbId ??
                      selectedFinding.auditId ??
                      "N/A"}
                  </p>
                </div>

                {/* TITLE */}

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Title
                  </p>

                  <p className="mt-1 text-gray-900">
                    {selectedFinding.title ??
                      selectedFinding.findingTitle ??
                      "N/A"}
                  </p>
                </div>

                {/* OBSERVATION */}

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Observation
                  </p>

                  <div className="mt-2 p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 whitespace-pre-wrap">
                    {selectedFinding.observation ??
                      selectedFinding.description ??
                      "No observation available"}
                  </div>
                </div>

                {/* RISK + STATUS */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Risk Level
                    </p>

                    <span
                      className={`inline-flex mt-2 px-3 py-1.5 rounded-full text-sm font-semibold ${getRiskClass(
                        selectedFinding.riskLevel ??
                          selectedFinding.risk
                      )}`}
                    >
                      {String(
                        selectedFinding.riskLevel ??
                          selectedFinding.risk ??
                          "N/A"
                      ).toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Status
                    </p>

                    <span
                      className={`inline-flex mt-2 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusClass(
                        selectedFinding.status
                      )}`}
                    >
                      {String(
                        selectedFinding.status ??
                          "N/A"
                      )
                        .toUpperCase()
                        .replace(
                          "_",
                          " "
                        )}
                    </span>
                  </div>

                </div>

                {/* CREATED */}

                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Created Date
                  </p>

                  <p className="mt-1 text-gray-800">
                    {formatDate(
                      selectedFinding.createdAt ??
                        selectedFinding.createdDate ??
                        selectedFinding.dateCreated
                    )}
                  </p>
                </div>

              </div>

              {/* MODAL FOOTER */}

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end">

                <button
                  type="button"
                  onClick={() =>
                    setSelectedFinding(null)
                  }
                  className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                >
                  Close
                </button>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>
    </div>
  );
};

export default AuditeeFindings;
