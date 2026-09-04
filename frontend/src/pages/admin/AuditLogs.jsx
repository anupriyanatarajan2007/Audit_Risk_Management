import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Search,
  RefreshCw,
  Download,
  Filter,
  User,
  FileText,
  Clock,
  ShieldCheck,
  X,
  Eye,
} from "lucide-react";

import { getAllAuditLogs } from "../../service/auditLogService";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");

  const [selectedLog, setSelectedLog] = useState(null);

  // =========================================================
  // FETCH AUDIT LOGS
  // =========================================================

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllAuditLogs();

      console.log("AUDIT LOG RESPONSE:", data);

      if (Array.isArray(data)) {
        setLogs(data);
      } else {
        console.error("Expected array but received:", data);
        setLogs([]);
        setError("Invalid audit log response from server.");
      }
    } catch (err) {
      console.error("AUDIT LOG ERROR:", err);

      if (err.response) {
        setError(
          `Failed to load audit logs (${err.response.status})`
        );
      } else if (err.request) {
        setError("Unable to connect to the server.");
      } else {
        setError("Something went wrong while loading audit logs.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // =========================================================
  // NORMALIZE USER
  // Backend:
  // {
  //   userId: 1,
  //   userName: "Anupriya Natarajan"
  // }
  // =========================================================

  const getUserName = (log) => {
    if (!log) {
      return "Unknown User";
    }

    if (log.userName && String(log.userName).trim()) {
      return log.userName;
    }

    if (log.userId) {
      return `User #${log.userId}`;
    }

    return "Unknown User";
  };

  // =========================================================
  // UNIQUE MODULES
  // =========================================================

  const modules = useMemo(() => {
    return [
      ...new Set(
        logs
          .map((log) => log?.module)
          .filter(Boolean)
      ),
    ].sort();
  }, [logs]);

  // =========================================================
  // UNIQUE ACTIONS
  // =========================================================

  const actions = useMemo(() => {
    return [
      ...new Set(
        logs
          .map((log) => log?.action)
          .filter(Boolean)
      ),
    ].sort();
  }, [logs]);

  // =========================================================
  // FILTER LOGS
  // =========================================================

  const filteredLogs = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return logs.filter((log) => {
      const userName = getUserName(log).toLowerCase();

      const matchesSearch =
        !searchText ||
        String(log?.id || "")
          .toLowerCase()
          .includes(searchText) ||
        String(log?.userId || "")
          .toLowerCase()
          .includes(searchText) ||
        userName.includes(searchText) ||
        String(log?.module || "")
          .toLowerCase()
          .includes(searchText) ||
        String(log?.action || "")
          .toLowerCase()
          .includes(searchText) ||
        String(log?.description || "")
          .toLowerCase()
          .includes(searchText);

      const matchesModule =
        moduleFilter === "ALL" ||
        log?.module === moduleFilter;

      const matchesAction =
        actionFilter === "ALL" ||
        log?.action === actionFilter;

      return (
        matchesSearch &&
        matchesModule &&
        matchesAction
      );
    });
  }, [
    logs,
    search,
    moduleFilter,
    actionFilter,
  ]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalLogs = logs.length;

  const totalModules = modules.length;

  const totalActions = actions.length;

  const uniqueUsers = new Set(
    logs
      .map((log) => log?.userId)
      .filter(
        (id) =>
          id !== null &&
          id !== undefined
      )
  ).size;

  // =========================================================
  // CLEAR FILTERS
  // =========================================================

  const clearFilters = () => {
    setSearch("");
    setModuleFilter("ALL");
    setActionFilter("ALL");
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "-";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // =========================================================
  // ACTION BADGE
  // =========================================================

  const getActionClass = (action) => {
    const value = String(action || "").toUpperCase();

    if (
      value.includes("CREATE") ||
      value.includes("ADD") ||
      value.includes("REGISTER")
    ) {
      return "bg-emerald-100 text-emerald-700";
    }

    if (
      value.includes("UPDATE") ||
      value.includes("EDIT") ||
      value.includes("ASSIGN")
    ) {
      return "bg-blue-100 text-blue-700";
    }

    if (
      value.includes("DELETE") ||
      value.includes("REMOVE")
    ) {
      return "bg-red-100 text-red-700";
    }

    if (
      value.includes("LOGIN") ||
      value.includes("LOGOUT")
    ) {
      return "bg-purple-100 text-purple-700";
    }

    if (
      value.includes("APPROVE") ||
      value.includes("CLOSE")
    ) {
      return "bg-teal-100 text-teal-700";
    }

    if (
      value.includes("FAILED") ||
      value.includes("BLOCKED") ||
      value.includes("LOCKED") ||
      value.includes("EXPIRED")
    ) {
      return "bg-orange-100 text-orange-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  // =========================================================
  // CSV EXPORT
  // =========================================================

  const exportCSV = () => {
    if (!filteredLogs.length) {
      alert("No audit logs available to export.");
      return;
    }

    const headers = [
      "ID",
      "User ID",
      "User Name",
      "Module",
      "Action",
      "Description",
      "Timestamp",
    ];

    const rows = filteredLogs.map((log) => [
      log?.id || "",
      log?.userId || "",
      getUserName(log),
      log?.module || "",
      log?.action || "",
      log?.description || "",
      log?.timestamp || "",
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `audit_logs_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">

          <RefreshCw
            className="animate-spin text-teal-600"
            size={40}
          />

          <p className="text-slate-600 font-medium">
            Loading audit logs...
          </p>

        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center shadow-lg">

            <Activity
              className="text-white"
              size={24}
            />

          </div>

          <div>

            <h1 className="text-2xl font-bold text-slate-800">
              Audit Logs
            </h1>

            <p className="text-sm text-slate-500">
              Track and monitor system activities
            </p>

          </div>

        </div>

        <div className="flex gap-3">

          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition shadow-sm"
          >
            <Download size={17} />
            Export CSV
          </button>

        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center justify-between">

          <span>{error}</span>

          <button
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            <X size={18} />
          </button>

        </div>
      )}

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">

        <StatCard
          icon={<Activity size={22} />}
          title="Total Logs"
          value={totalLogs}
        />

        <StatCard
          icon={<FileText size={22} />}
          title="Modules"
          value={totalModules}
        />

        <StatCard
          icon={<ShieldCheck size={22} />}
          title="Actions"
          value={totalActions}
        />

        <StatCard
          icon={<User size={22} />}
          title="Users"
          value={uniqueUsers}
        />

      </div>

      {/* =====================================================
          FILTER SECTION
      ===================================================== */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">

        <div className="flex items-center gap-2 mb-4">

          <Filter
            size={19}
            className="text-teal-600"
          />

          <h2 className="font-semibold text-slate-800">
            Filters
          </h2>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* SEARCH */}

          <div className="md:col-span-2 relative">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search by user, module, action, description..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

          </div>

          {/* MODULE */}

          <select
            value={moduleFilter}
            onChange={(e) =>
              setModuleFilter(e.target.value)
            }
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >

            <option value="ALL">
              All Modules
            </option>

            {modules.map((module) => (
              <option
                key={module}
                value={module}
              >
                {module}
              </option>
            ))}

          </select>

          {/* ACTION */}

          <select
            value={actionFilter}
            onChange={(e) =>
              setActionFilter(e.target.value)
            }
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >

            <option value="ALL">
              All Actions
            </option>

            {actions.map((action) => (
              <option
                key={action}
                value={action}
              >
                {action}
              </option>
            ))}

          </select>

        </div>

        {(search ||
          moduleFilter !== "ALL" ||
          actionFilter !== "ALL") && (

          <button
            onClick={clearFilters}
            className="mt-4 flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
          >
            <X size={15} />
            Clear Filters
          </button>

        )}

      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">

          <div>

            <h2 className="font-semibold text-slate-800">
              Activity History
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Showing {filteredLogs.length} of{" "}
              {logs.length} logs
            </p>

          </div>

          <Clock
            size={20}
            className="text-slate-400"
          />

        </div>

        {filteredLogs.length === 0 ? (

          <div className="py-16 text-center">

            <Activity
              size={45}
              className="mx-auto text-slate-300 mb-3"
            />

            <h3 className="font-semibold text-slate-700">
              No audit logs found
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Try changing your search or filters.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50 border-b border-slate-200">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    #
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    User
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Module
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Action
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Description
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                    Timestamp
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-semibold text-slate-500 uppercase">
                    View
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredLogs.map((log, index) => (

                  <tr
                    key={log?.id || index}
                    className="hover:bg-slate-50 transition"
                  >

                    {/* ID */}

                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                      #{log?.id ?? "-"}
                    </td>

                    {/* USER */}

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">

                          <User
                            size={17}
                            className="text-teal-700"
                          />

                        </div>

                        <div>

                          <p className="text-sm font-medium text-slate-800">
                            {getUserName(log)}
                          </p>

                          <p className="text-xs text-slate-500">
                            User ID: {log?.userId ?? "-"}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* MODULE */}

                    <td className="px-5 py-4">

                      <span className="inline-flex px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                        {log?.module || "-"}
                      </span>

                    </td>

                    {/* ACTION */}

                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getActionClass(
                          log?.action
                        )}`}
                      >
                        {log?.action || "-"}
                      </span>

                    </td>

                    {/* DESCRIPTION */}

                    <td className="px-5 py-4 max-w-xs">

                      <p
                        className="text-sm text-slate-600 truncate"
                        title={log?.description || ""}
                      >
                        {log?.description || "-"}
                      </p>

                    </td>

                    {/* TIMESTAMP */}

                    <td className="px-5 py-4 whitespace-nowrap">

                      <div className="flex items-center gap-2">

                        <Clock
                          size={15}
                          className="text-slate-400"
                        />

                        <span className="text-sm text-slate-600">
                          {formatDate(log?.timestamp)}
                        </span>

                      </div>

                    </td>

                    {/* VIEW */}

                    <td className="px-5 py-4 text-center">

                      <button
                        onClick={() =>
                          setSelectedLog(log)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold hover:bg-teal-100 transition"
                      >
                        <Eye size={14} />
                        View
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedLog && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedLog(null)}
        >

          <div
            className="bg-white w-full max-w-xl rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            {/* HEADER */}

            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold text-slate-800">
                  Audit Log Details
                </h2>

                <p className="text-sm text-slate-500">
                  Log #{selectedLog?.id ?? "-"}
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedLog(null)
                }
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            {/* BODY */}

            <div className="p-6 space-y-5">

              {/* USER */}

              <div className="flex items-center gap-4 p-4 rounded-xl bg-teal-50 border border-teal-100">

                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">

                  <User
                    size={22}
                    className="text-teal-700"
                  />

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase text-slate-400">
                    User
                  </p>

                  <p className="text-base font-semibold text-slate-800">
                    {getUserName(selectedLog)}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    User ID: {selectedLog?.userId ?? "-"}
                  </p>

                </div>

              </div>

              <DetailRow
                label="Log ID"
                value={
                  selectedLog?.id
                    ? `#${selectedLog.id}`
                    : "-"
                }
              />

              <DetailRow
                label="Module"
                value={
                  selectedLog?.module || "-"
                }
              />

              <div>

                <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                  Action
                </p>

                <span
                  className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${getActionClass(
                    selectedLog?.action
                  )}`}
                >
                  {selectedLog?.action || "-"}
                </span>

              </div>

              <div>

                <p className="text-xs font-semibold uppercase text-slate-400 mb-2">
                  Description
                </p>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700">
                  {selectedLog?.description ||
                    "No description available"}
                </div>

              </div>

              <DetailRow
                label="Timestamp"
                value={formatDate(
                  selectedLog?.timestamp
                )}
              />

            </div>

            {/* FOOTER */}

            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">

              <button
                onClick={() =>
                  setSelectedLog(null)
                }
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition"
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

// =========================================================
// STAT CARD
// =========================================================

const StatCard = ({
  icon,
  title,
  value,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500">
            {title}
          </p>

          <p className="text-2xl font-bold text-slate-800 mt-2">
            {value}
          </p>

        </div>

        <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
          {icon}
        </div>

      </div>

    </div>
  );
};

// =========================================================
// DETAIL ROW
// =========================================================

const DetailRow = ({
  label,
  value,
}) => {
  return (
    <div className="flex flex-col gap-1">

      <p className="text-xs font-semibold uppercase text-slate-400">
        {label}
      </p>

      <p className="text-sm font-medium text-slate-700">
        {value}
      </p>

    </div>
  );
};

export default AuditLogs;
