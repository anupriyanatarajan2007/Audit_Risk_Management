import React, { useEffect, useMemo, useState } from "react";

import {
  Search,
  RefreshCw,
  Eye,
  X,
  FileWarning,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  ShieldAlert,
  Calendar,
  User,
  ClipboardCheck,
  Paperclip,
  FileText,
  ExternalLink,
  Loader2,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { getAllFindings } from "../../service/FindingService";
import {
  getEvidenceByAudit,
  getEvidenceFileUrl,
} from "../../service/EvidenceService";

// ============================================================
// FINDING STATUS ENUM
// Read-only for CAE
// ============================================================

const FINDING_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "REVIEWED",
  "APPROVED",
  "REJECTED",
];

// ============================================================
// RESOLVE NUMERIC AUDIT ID
// ============================================================

const resolveAuditNumericId = (finding) => {
  const candidates = [
    finding?.auditDbId,
    finding?.audit?.id,
    finding?.auditPk,
    finding?.auditId,
  ];

  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) {
      continue;
    }

    const numeric = Number(candidate);

    if (Number.isInteger(numeric) && numeric > 0) {
      return numeric;
    }
  }

  return null;
};

// ============================================================
// CAE FINDINGS
// ============================================================

const CAEFindings = () => {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");

  // Selected finding
  const [selectedFinding, setSelectedFinding] = useState(null);

  // Evidence
  const [evidenceList, setEvidenceList] = useState([]);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceError, setEvidenceError] = useState("");

  // ============================================================
  // LOAD FINDINGS
  // ============================================================

  const loadFindings = async () => {
    try {
      setLoading(true);

      const data = await getAllFindings();

      console.log("CAE FINDINGS:", data);

      setFindings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load findings:", error);
      setFindings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, []);

  // ============================================================
  // OPEN FINDING
  // ============================================================

  const openFindingModal = (finding) => {
    setSelectedFinding(finding);

    setEvidenceList([]);
    setEvidenceError("");

    loadEvidenceForFinding(finding);
  };

  // ============================================================
  // CLOSE FINDING
  // ============================================================

  const closeFindingModal = () => {
    setSelectedFinding(null);
    setEvidenceList([]);
    setEvidenceError("");
  };

  // ============================================================
  // LOAD EVIDENCE
  // ============================================================

  const loadEvidenceForFinding = async (finding) => {
    const numericAuditId = resolveAuditNumericId(finding);

    if (!numericAuditId) {
      console.warn(
        "Could not resolve numeric audit ID for evidence lookup:",
        finding
      );

      setEvidenceList([]);

      setEvidenceError(
        "Evidence can't be loaded because the audit reference is not a numeric ID."
      );

      return;
    }

    try {
      setEvidenceLoading(true);
      setEvidenceError("");

      const data = await getEvidenceByAudit(numericAuditId);

      console.log("CAE EVIDENCE:", data);

      setEvidenceList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load evidence:", error);

      setEvidenceError("Unable to load evidence for this audit.");

      setEvidenceList([]);
    } finally {
      setEvidenceLoading(false);
    }
  };

  // ============================================================
  // OPEN EVIDENCE FILE
  // ============================================================

  const handleOpenEvidence = (evidence) => {
    const url = getEvidenceFileUrl(evidence);

    if (!url) {
      console.error("Evidence file URL not available:", evidence);
      return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ============================================================
  // FILTER
  // ============================================================

  const filteredFindings = useMemo(() => {
    return findings.filter((finding) => {
      const searchText = `
        ${finding.id || ""}
        ${finding.auditId || ""}
        ${finding.auditName || ""}
        ${finding.title || ""}
        ${finding.observation || ""}
        ${finding.auditorName || ""}
        ${finding.status || ""}
        ${finding.riskLevel || ""}
      `.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        String(finding.status || "").toUpperCase() === statusFilter;

      const matchesRisk =
        riskFilter === "ALL" ||
        String(finding.riskLevel || "").toUpperCase() === riskFilter;

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [findings, search, statusFilter, riskFilter]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const statistics = useMemo(() => {
    const total = findings.length;

    const draft = findings.filter(
      (f) => String(f.status || "").toUpperCase() === "DRAFT"
    ).length;

    const underReview = findings.filter((f) =>
      ["SUBMITTED", "REVIEWED"].includes(
        String(f.status || "").toUpperCase()
      )
    ).length;

    const approved = findings.filter(
      (f) => String(f.status || "").toUpperCase() === "APPROVED"
    ).length;

    const rejected = findings.filter(
      (f) => String(f.status || "").toUpperCase() === "REJECTED"
    ).length;

    const highRisk = findings.filter((f) =>
      ["HIGH", "CRITICAL"].includes(
        String(f.riskLevel || "").toUpperCase()
      )
    ).length;

    return {
      total,
      draft,
      underReview,
      approved,
      rejected,
      highRisk,
    };
  }, [findings]);

  // ============================================================
  // STATUS STYLE
  // ============================================================

  const getStatusStyle = (status) => {
    const value = String(status || "").toUpperCase();

    switch (value) {
      case "DRAFT":
        return "bg-slate-100 text-slate-700 border-slate-200";

      case "SUBMITTED":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "REVIEWED":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  // ============================================================
  // RISK STYLE
  // ============================================================

  const getRiskStyle = (risk) => {
    const value = String(risk || "").toUpperCase();

    switch (value) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";

      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";

      case "MEDIUM":
        return "bg-amber-100 text-amber-800 border-amber-200";

      case "LOW":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";

      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "—";

    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return date;
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-white text-slate-800 p-6 md:p-8">
      <div className="max-w-[1600px] mx-auto">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ClipboardCheck
                size={18}
                className="text-teal-600"
              />

              <p className="text-sm font-semibold text-teal-600 uppercase">
                Chief Audit Executive
              </p>
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Findings
            </h1>

            <p className="text-slate-500 mt-2">
              Monitor findings, review supporting evidence, and oversee
              audit issues.
            </p>
          </div>

          <button
            onClick={loadFindings}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>
        </motion.div>

        {/* ====================================================
            STATISTICS
        ==================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-7">

          <StatCard
            title="Total Findings"
            value={statistics.total}
            icon={FileWarning}
            iconBg="bg-teal-50"
            iconColor="text-teal-600"
          />

          <StatCard
            title="Draft"
            value={statistics.draft}
            icon={Clock3}
            iconBg="bg-slate-100"
            iconColor="text-slate-600"
          />

          <StatCard
            title="Under Review"
            value={statistics.underReview}
            icon={AlertTriangle}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />

          <StatCard
            title="Approved"
            value={statistics.approved}
            icon={CheckCircle2}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
          />

          <StatCard
            title="Rejected"
            value={statistics.rejected}
            icon={X}
            iconBg="bg-red-50"
            iconColor="text-red-600"
          />

          <StatCard
            title="High / Critical"
            value={statistics.highRisk}
            icon={ShieldAlert}
            iconBg="bg-orange-50"
            iconColor="text-orange-600"
          />
        </div>

        {/* ====================================================
            FILTERS
        ==================================================== */}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

            <div className="relative md:col-span-2">

              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search findings, audits, auditors..."
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 outline-none focus:border-teal-500"
            >
              <option value="ALL">All Status</option>

              {FINDING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0) +
                    status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-lg bg-white text-sm text-slate-700 outline-none focus:border-teal-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

          </div>
        </div>

        {/* ====================================================
            FINDINGS TABLE
        ==================================================== */}

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-200">

            <h2 className="text-lg font-bold text-slate-900">
              Finding Register
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {filteredFindings.length} finding
              {filteredFindings.length !== 1 ? "s" : ""}
              {" "}available for executive review
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Finding
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Audit
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Auditor
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Risk
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Created
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase">
                    View
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading && (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-14 text-center text-slate-500"
                    >
                      <div className="flex flex-col items-center gap-3">

                        <RefreshCw
                          size={25}
                          className="animate-spin text-teal-500"
                        />

                        <span>
                          Loading findings...
                        </span>

                      </div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredFindings.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-14 text-center"
                      >
                        <div className="flex flex-col items-center">

                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                            <FileWarning
                              size={22}
                              className="text-slate-400"
                            />
                          </div>

                          <p className="font-semibold text-slate-700">
                            No findings found
                          </p>

                          <p className="text-sm text-slate-400 mt-1">
                            Try changing your filters.
                          </p>

                        </div>
                      </td>
                    </tr>
                  )}

                {!loading &&
                  filteredFindings.map((finding) => (
                    <motion.tr
                      key={finding.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 transition"
                    >

                      <td className="px-5 py-4">

                        <p className="font-semibold text-slate-800">
                          {finding.title || "Untitled Finding"}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          ID: {finding.id || "—"}
                        </p>

                      </td>

                      <td className="px-5 py-4">

                        <p className="text-sm font-semibold text-slate-700">
                          {finding.auditName || "—"}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {finding.auditId || "—"}
                        </p>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
                            <User
                              size={15}
                              className="text-teal-600"
                            />
                          </div>

                          <span className="text-sm text-slate-600">
                            {finding.auditorName || "—"}
                          </span>

                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${getRiskStyle(
                            finding.riskLevel
                          )}`}
                        >
                          {finding.riskLevel || "—"}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusStyle(
                            finding.status
                          )}`}
                        >
                          {finding.status || "—"}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <Calendar
                            size={14}
                            className="text-slate-400"
                          />

                          <span className="text-xs text-slate-500">
                            {formatDate(finding.createdAt)}
                          </span>

                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-end">

                          <button
                            onClick={() =>
                              openFindingModal(finding)
                            }
                            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition"
                            title="View Finding"
                          >
                            <Eye size={17} />
                          </button>

                        </div>

                      </td>

                    </motion.tr>
                  ))}

              </tbody>

            </table>

          </div>

        </div>
      </div>

      {/* ======================================================
          FINDING DETAILS MODAL
          READ ONLY FOR CAE
      ====================================================== */}

      <AnimatePresence>

        {selectedFinding && (

          <div
            className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeFindingModal}
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
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200"
            >

              {/* HEADER */}

              <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between">

                <div>

                  <p className="text-xs font-semibold text-teal-600 uppercase">
                    CAE • Finding Details
                  </p>

                  <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    {selectedFinding.title}
                  </h2>

                  <p className="text-sm text-slate-400 mt-1">
                    Finding ID: {selectedFinding.id}
                  </p>

                </div>

                <button
                  onClick={closeFindingModal}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X size={20} />
                </button>

              </div>

              {/* BODY */}

              <div className="p-6 space-y-6">

                {/* STATUS + RISK */}

                <div className="flex flex-wrap gap-3">

                  <span
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${getRiskStyle(
                      selectedFinding.riskLevel
                    )}`}
                  >
                    Risk: {selectedFinding.riskLevel || "—"}
                  </span>

                  <span
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${getStatusStyle(
                      selectedFinding.status
                    )}`}
                  >
                    Status: {selectedFinding.status || "—"}
                  </span>

                  {/* READ ONLY INDICATOR */}

                  <span className="px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold">
                    Read Only
                  </span>

                </div>

                {/* AUDIT INFORMATION */}

                <div>

                  <h3 className="text-sm font-bold text-slate-800 mb-3">
                    Audit Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <InfoBox
                      label="Audit ID"
                      value={selectedFinding.auditId || "—"}
                    />

                    <InfoBox
                      label="Audit Name"
                      value={selectedFinding.auditName || "—"}
                    />

                    <InfoBox
                      label="Internal Auditor"
                      value={
                        selectedFinding.auditorName || "—"
                      }
                    />

                    <InfoBox
                      label="Created At"
                      value={formatDate(
                        selectedFinding.createdAt
                      )}
                    />

                  </div>

                </div>

                {/* OBSERVATION */}

                <DetailSection
                  title="Observation"
                  value={
                    selectedFinding.observation ||
                    "No observation provided."
                  }
                />

                {/* RECOMMENDATION */}

                <DetailSection
                  title="Recommendation"
                  value={
                    selectedFinding.recommendation ||
                    "No recommendation provided."
                  }
                />

                {/* EVIDENCE */}

                <div>

                  <div className="flex items-center gap-2 mb-3">

                    <Paperclip
                      size={15}
                      className="text-slate-600"
                    />

                    <h3 className="text-sm font-bold text-slate-800">
                      Evidence for this Audit
                    </h3>

                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">

                    {evidenceLoading && (
                      <div className="flex items-center gap-2 px-4 py-6 justify-center text-slate-500 text-sm">

                        <Loader2
                          size={16}
                          className="animate-spin"
                        />

                        Loading evidence...

                      </div>
                    )}

                    {!evidenceLoading && evidenceError && (
                      <div className="px-4 py-6 text-center text-sm text-red-600">
                        {evidenceError}
                      </div>
                    )}

                    {!evidenceLoading &&
                      !evidenceError &&
                      evidenceList.length === 0 && (
                        <div className="px-4 py-6 text-center text-sm text-slate-400">
                          No evidence uploaded for this audit yet.
                        </div>
                      )}

                    {!evidenceLoading &&
                      !evidenceError &&
                      evidenceList.length > 0 && (

                        <div className="divide-y divide-slate-100">

                          {evidenceList.map((evidence) => (

                            <div
                              key={evidence.id}
                              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition"
                            >

                              <div className="flex items-center gap-3 min-w-0">

                                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">

                                  <FileText
                                    size={15}
                                    className="text-teal-600"
                                  />

                                </div>

                                <div className="min-w-0">

                                  <p className="text-sm font-semibold text-slate-700 truncate">

                                    {evidence.fileName ||
                                      evidence.description ||
                                      `Evidence #${evidence.id}`}

                                  </p>

                                  <p className="text-xs text-slate-400">

                                    {evidence.status || "—"} ·{" "}

                                    {formatDate(
                                      evidence.uploadedAt ||
                                        evidence.createdAt
                                    )}

                                  </p>

                                </div>

                              </div>

                              <button
                                onClick={() =>
                                  handleOpenEvidence(
                                    evidence
                                  )
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition flex-shrink-0"
                              >

                                <ExternalLink size={13} />

                                Open

                              </button>

                            </div>

                          ))}

                        </div>

                      )}

                  </div>

                </div>

                {/* TIMELINE */}

                <div>

                  <h3 className="text-sm font-bold text-slate-800 mb-3">
                    Timeline
                  </h3>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">

                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">

                      <span className="text-sm font-medium text-slate-600">
                        Created
                      </span>

                      <span className="text-sm text-slate-500">
                        {formatDate(
                          selectedFinding.createdAt
                        )}
                      </span>

                    </div>

                    <div className="flex items-center justify-between px-4 py-3">

                      <span className="text-sm font-medium text-slate-600">
                        Last Updated
                      </span>

                      <span className="text-sm text-slate-500">
                        {formatDate(
                          selectedFinding.updatedAt
                        )}
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              {/* FOOTER */}

              <div className="px-6 py-4 border-t border-slate-200 flex justify-end">

                <button
                  onClick={closeFindingModal}
                  className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
                >
                  Close
                </button>

              </div>

            </motion.div>

          </div>

        )}

      </AnimatePresence>
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
  iconBg,
  iconColor,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white border border-slate-200 rounded-xl shadow-sm p-5"
    >
      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="text-3xl font-bold text-slate-900 mt-2">
            {value}
          </h3>

        </div>

        <div className={`p-3 rounded-lg ${iconBg}`}>
          <Icon
            size={21}
            className={iconColor}
          />
        </div>

      </div>
    </motion.div>
  );
};

// ============================================================
// DETAIL SECTION
// ============================================================

const DetailSection = ({ title, value }) => {
  return (
    <div>

      <h3 className="text-sm font-bold text-slate-800 mb-2">
        {title}
      </h3>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">

        <p className="text-sm text-slate-600 leading-6 whitespace-pre-wrap">
          {value}
        </p>

      </div>

    </div>
  );
};

// ============================================================
// INFO BOX
// ============================================================

const InfoBox = ({ label, value }) => {
  return (
    <div className="border border-slate-200 rounded-lg p-4">

      <p className="text-xs font-semibold text-slate-400 uppercase">
        {label}
      </p>

      <p className="text-sm font-semibold text-slate-700 mt-1">
        {value}
      </p>

    </div>
  );
};

export default CAEFindings;

