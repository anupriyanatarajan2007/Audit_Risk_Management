import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileSearch,
  Send,
} from "lucide-react";

import { getAllFindings } from "../../service/FindingService";

const ComplianceFindings = () => {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedFinding, setSelectedFinding] = useState(null);

  // ============================================================
  // LOAD FINDINGS
  // ============================================================

  const loadFindings = async () => {
    try {
      setLoading(true);

      const response = await getAllFindings();

      console.log("COMPLIANCE FINDINGS:", response);

      /*
       * Supports:
       * 1. Array
       * 2. { data: [] }
       * 3. { data: { data: [] } }
       */

      let data = [];

      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        data = response.data.data;
      }

      console.log("NORMALIZED COMPLIANCE FINDINGS:", data);

      setFindings(data);
    } catch (error) {
      console.error(
        "Failed to load compliance findings:",
        error.response?.data || error.message
      );

      setFindings([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadFindings();
  }, []);

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadFindings();
    } finally {
      setRefreshing(false);
    }
  };

  // ============================================================
  // FILTER
  // ============================================================

  const filteredFindings = useMemo(() => {
    return findings.filter((finding) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        String(finding.auditId || "")
          .toLowerCase()
          .includes(searchText) ||
        String(finding.auditName || "")
          .toLowerCase()
          .includes(searchText) ||
        String(finding.title || "")
          .toLowerCase()
          .includes(searchText) ||
        String(finding.auditorName || "")
          .toLowerCase()
          .includes(searchText) ||
        String(finding.observation || "")
          .toLowerCase()
          .includes(searchText) ||
        String(finding.recommendation || "")
          .toLowerCase()
          .includes(searchText);

      const matchesRisk =
        riskFilter === "ALL" ||
        String(finding.riskLevel || "").toUpperCase() === riskFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        String(finding.status || "").toUpperCase() === statusFilter;

      return matchesSearch && matchesRisk && matchesStatus;
    });
  }, [findings, search, riskFilter, statusFilter]);

  // ============================================================
  // STATUS STYLE
  // ============================================================

  const getStatusClass = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "OPEN":
        return "bg-red-50 text-red-700 border-red-200";

      case "SUBMITTED":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";

      case "IN_PROGRESS":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "PENDING":
        return "bg-orange-50 text-orange-700 border-orange-200";

      case "RESOLVED":
        return "bg-green-50 text-green-700 border-green-200";

      case "CLOSED":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // ============================================================
  // STATUS LABEL
  // ============================================================

  const formatStatus = (status) => {
    if (!status) return "-";

    return String(status)
      .toLowerCase()
      .split("_")
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  };

  // ============================================================
  // RISK STYLE
  // ============================================================

  const getRiskClass = (risk) => {
    switch (String(risk || "").toUpperCase()) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200";

      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200";

      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";

      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";

      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return "-";
      }

      return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  // ============================================================
  // STATS
  // ============================================================

  const totalFindings = findings.length;

  const submittedFindings = findings.filter(
    (f) =>
      String(f.status || "").toUpperCase() === "SUBMITTED"
  ).length;

  const highRiskFindings = findings.filter((f) =>
    ["HIGH", "CRITICAL"].includes(
      String(f.riskLevel || "").toUpperCase()
    )
  ).length;

  const resolvedClosedFindings = findings.filter((f) =>
    ["RESOLVED", "CLOSED"].includes(
      String(f.status || "").toUpperCase()
    )
  ).length;

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <FileSearch size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Compliance Findings
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                View audit findings submitted by Internal Auditors
              </p>
            </div>

          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>

      </div>

      {/* ======================================================
          STAT CARDS
      ====================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Findings
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {totalFindings}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                All audit findings
              </p>
            </div>

            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
              <FileSearch size={22} />
            </div>

          </div>

        </div>

        {/* SUBMITTED */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Submitted Findings
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {submittedFindings}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Submitted by auditors
              </p>
            </div>

            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
              <Send size={22} />
            </div>

          </div>

        </div>

        {/* HIGH / CRITICAL */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                High / Critical
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {highRiskFindings}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                High-risk findings
              </p>
            </div>

            <div className="rounded-lg bg-orange-50 p-3 text-orange-600">
              <AlertCircle size={22} />
            </div>

          </div>

        </div>

        {/* RESOLVED / CLOSED */}

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-gray-500">
                Resolved / Closed
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {resolvedClosedFindings}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Completed findings
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-3 text-green-600">
              <CheckCircle2 size={22} />
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          FILTER BAR
      ====================================================== */}

      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

          {/* SEARCH */}

          <div className="relative">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit, finding or auditor..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

          </div>

          {/* RISK */}

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="ALL">
              All Risk Levels
            </option>

            <option value="CRITICAL">
              Critical
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="LOW">
              Low
            </option>
          </select>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="ALL">
              All Status
            </option>

            <option value="SUBMITTED">
              Submitted
            </option>

            <option value="OPEN">
              Open
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="PENDING">
              Pending
            </option>

            <option value="RESOLVED">
              Resolved
            </option>

            <option value="CLOSED">
              Closed
            </option>

            <option value="REJECTED">
              Rejected
            </option>

          </select>

        </div>

      </div>

      {/* ======================================================
          TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="min-w-[1200px] w-full">

            <thead className="border-b border-gray-200 bg-gray-50">

              <tr>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Audit
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Finding
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Risk
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Auditor
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Created
                </th>

                <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-gray-100">

              {loading ? (

                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    Loading findings...
                  </td>
                </tr>

              ) : filteredFindings.length === 0 ? (

                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center"
                  >

                    <FileSearch
                      size={38}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 text-sm font-medium text-gray-600">
                      No findings found
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Try changing your search or filters.
                    </p>

                  </td>
                </tr>

              ) : (

                filteredFindings.map((finding) => (

                  <tr
                    key={finding.id}
                    className="transition hover:bg-gray-50"
                  >

                    {/* AUDIT */}

                    <td className="px-5 py-4">

                      <div className="font-semibold text-gray-900">
                        {finding.auditId || "-"}
                      </div>

                      <div className="mt-1 max-w-[220px] truncate text-xs text-gray-500">
                        {finding.auditName || "-"}
                      </div>

                      <div className="mt-1 text-[11px] text-gray-400">
                        DB ID: {finding.auditDbId ?? "-"}
                      </div>

                    </td>

                    {/* FINDING */}

                    <td className="px-5 py-4">

                      <div className="max-w-[320px]">

                        <p className="font-medium text-gray-900">
                          {finding.title || "-"}
                        </p>

                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                          {finding.observation || "No observation"}
                        </p>

                      </div>

                    </td>

                    {/* RISK */}

                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getRiskClass(
                          finding.riskLevel
                        )}`}
                      >
                        {finding.riskLevel || "-"}
                      </span>

                    </td>

                    {/* AUDITOR */}

                    <td className="px-5 py-4">

                      <span className="text-sm font-medium text-gray-700">
                        {finding.auditorName || "-"}
                      </span>

                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                          finding.status
                        )}`}
                      >
                        {formatStatus(finding.status)}
                      </span>

                    </td>

                    {/* CREATED */}

                    <td className="px-5 py-4 text-sm text-gray-600">
                      {formatDate(finding.createdAt)}
                    </td>

                    {/* VIEW */}

                    <td className="px-5 py-4 text-center">

                      <button
                        onClick={() =>
                          setSelectedFinding(finding)
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                      >
                        <Eye size={15} />
                        View
                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

        {/* FOOTER */}

        {!loading && (
          <div className="border-t border-gray-200 bg-gray-50 px-5 py-3">

            <p className="text-xs text-gray-500">

              Showing{" "}

              <span className="font-semibold text-gray-700">
                {filteredFindings.length}
              </span>{" "}

              of{" "}

              <span className="font-semibold text-gray-700">
                {findings.length}
              </span>{" "}

              findings

            </p>

          </div>
        )}

      </div>

      {/* ======================================================
          VIEW DETAILS MODAL
      ====================================================== */}

      {selectedFinding && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">

              <div>

                <h2 className="text-lg font-bold text-gray-900">
                  Finding Details
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Compliance Officer View
                </p>

              </div>

              <button
                onClick={() => setSelectedFinding(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                <X size={20} />
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="space-y-6 p-6">

              {/* AUDIT INFORMATION */}

              <div>

                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  Audit Information
                </h3>

                <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-3">

                  <div>
                    <p className="text-xs text-gray-500">
                      Audit ID
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {selectedFinding.auditId || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Audit Name
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {selectedFinding.auditName || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Audit DB ID
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {selectedFinding.auditDbId ?? "-"}
                    </p>
                  </div>

                </div>

              </div>

              {/* FINDING INFORMATION */}

              <div>

                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  Finding Information
                </h3>

                <div className="space-y-4">

                  <div>

                    <p className="text-xs text-gray-500">
                      Finding ID
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      #{selectedFinding.id}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      Finding Title
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {selectedFinding.title || "-"}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      Observation
                    </p>

                    <p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-700">
                      {selectedFinding.observation ||
                        "No observation provided"}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-gray-500">
                      Recommendation
                    </p>

                    <p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-700">
                      {selectedFinding.recommendation ||
                        "No recommendation provided"}
                    </p>

                  </div>

                </div>

              </div>

              {/* RISK + STATUS */}

              <div>

                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  Assessment
                </h3>

                <div className="flex flex-wrap gap-3">

                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getRiskClass(
                      selectedFinding.riskLevel
                    )}`}
                  >
                    Risk: {selectedFinding.riskLevel || "-"}
                  </span>

                  <span
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                      selectedFinding.status
                    )}`}
                  >
                    Status: {formatStatus(selectedFinding.status)}
                  </span>

                </div>

              </div>

              {/* INTERNAL AUDITOR */}

              <div>

                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  Internal Auditor
                </h3>

                <div className="rounded-lg bg-gray-50 p-4">

                  <p className="text-sm font-medium text-gray-900">
                    {selectedFinding.auditorName || "-"}
                  </p>

                </div>

              </div>

              {/* DATES */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div className="rounded-lg border border-gray-200 p-4">

                  <div className="flex items-center gap-2">

                    <Clock3
                      size={16}
                      className="text-gray-500"
                    />

                    <span className="text-xs text-gray-500">
                      Created At
                    </span>

                  </div>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {formatDate(selectedFinding.createdAt)}
                  </p>

                </div>

                <div className="rounded-lg border border-gray-200 p-4">

                  <div className="flex items-center gap-2">

                    <Clock3
                      size={16}
                      className="text-gray-500"
                    />

                    <span className="text-xs text-gray-500">
                      Updated At
                    </span>

                  </div>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    {formatDate(selectedFinding.updatedAt)}
                  </p>

                </div>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 text-right">

              <button
                onClick={() => setSelectedFinding(null)}
                className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-900"
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

export default ComplianceFindings;