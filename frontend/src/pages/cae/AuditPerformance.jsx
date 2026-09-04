import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

import AuditService from "../../service/AuditService";

const COLORS = [
  "#14b8a6",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
];

const AuditPerformance = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");

  // ============================================================
  // LOAD ALL AUDITS
  // ============================================================

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await AuditService.getAllAudits();

      console.log("AUDIT PERFORMANCE - ALL AUDITS:", data);

      setAudits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load audits:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load audit performance"
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const normalizeStatus = (status) => {
    if (!status) return "UNKNOWN";

    return String(status)
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "_");
  };

  const getDepartmentName = (audit) => {
    return (
      audit?.auditDepartment ||
      audit?.department?.name ||
      audit?.departmentName ||
      audit?.department ||
      "Unknown Department"
    );
  };

  const getAuditCode = (audit) => {
    return (
      audit?.auditCode ||
      audit?.auditId ||
      audit?.code ||
      `AUD-${audit?.auditDbId || audit?.id || "-"}`
    );
  };

  const getAuditId = (audit) => {
    return audit?.auditDbId || audit?.id || audit?.auditId;
  };

  const getAuditStatus = (audit) => {
    return normalizeStatus(
      audit?.status ||
        audit?.auditStatus ||
        audit?.audit_status
    );
  };

  const getStartDate = (audit) => {
    return (
      audit?.startDate ||
      audit?.plannedStartDate ||
      audit?.auditStartDate ||
      audit?.createdAt
    );
  };

  const getDueDate = (audit) => {
    return (
      audit?.dueDate ||
      audit?.plannedEndDate ||
      audit?.auditEndDate ||
      audit?.endDate
    );
  };

  const isCompleted = (audit) => {
    const status = getAuditStatus(audit);

    return [
      "COMPLETED",
      "CLOSED",
      "APPROVED",
      "CLOSED_SUCCESSFULLY",
    ].includes(status);
  };

  const isOverdue = (audit) => {
    if (isCompleted(audit)) return false;

    const dueDate = getDueDate(audit);

    if (!dueDate) return false;

    return new Date(dueDate).getTime() < Date.now();
  };

  // ============================================================
  // DEPARTMENTS
  // ============================================================

  const departments = useMemo(() => {
    const values = audits
      .map((audit) => getDepartmentName(audit))
      .filter(Boolean);

    return ["ALL", ...new Set(values)];
  }, [audits]);

  // ============================================================
  // FILTERED AUDITS
  // ============================================================

  const filteredAudits = useMemo(() => {
    return audits.filter((audit) => {
      const department = getDepartmentName(audit);

      const matchesDepartment =
        selectedDepartment === "ALL" ||
        department === selectedDepartment;

      const searchText = search.trim().toLowerCase();

      if (!searchText) {
        return matchesDepartment;
      }

      const searchableText = [
        getAuditCode(audit),
        department,
        audit?.auditName,
        audit?.title,
        audit?.businessUnit,
        audit?.riskLevel,
        getAuditStatus(audit),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesDepartment &&
        searchableText.includes(searchText)
      );
    });
  }, [audits, search, selectedDepartment]);

  // ============================================================
  // OVERALL KPI
  // ============================================================

  const totalAudits = filteredAudits.length;

  const completedAudits = filteredAudits.filter(
    (audit) => isCompleted(audit)
  ).length;

  const overdueAudits = filteredAudits.filter(
    (audit) => isOverdue(audit)
  ).length;

  const inProgressAudits = filteredAudits.filter((audit) =>
    [
      "IN_PROGRESS",
      "ONGOING",
      "UNDER_REVIEW",
      "ASSIGNED",
    ].includes(getAuditStatus(audit))
  ).length;

  const plannedAudits = filteredAudits.filter((audit) =>
    ["PLANNED", "PENDING", "DRAFT"].includes(
      getAuditStatus(audit)
    )
  ).length;

  const completionPercentage =
    totalAudits === 0
      ? 0
      : Math.round((completedAudits / totalAudits) * 100);

  // ============================================================
  // DEPARTMENT PERFORMANCE
  // ============================================================

  const departmentData = useMemo(() => {
    const map = {};

    audits.forEach((audit) => {
      const department = getDepartmentName(audit);

      if (!map[department]) {
        map[department] = {
          department,
          total: 0,
          completed: 0,
          inProgress: 0,
          overdue: 0,
        };
      }

      map[department].total += 1;

      if (isCompleted(audit)) {
        map[department].completed += 1;
      }

      if (
        [
          "IN_PROGRESS",
          "ONGOING",
          "UNDER_REVIEW",
          "ASSIGNED",
        ].includes(getAuditStatus(audit))
      ) {
        map[department].inProgress += 1;
      }

      if (isOverdue(audit)) {
        map[department].overdue += 1;
      }
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        completionRate:
          item.total === 0
            ? 0
            : Math.round(
                (item.completed / item.total) * 100
              ),
      }))
      .sort((a, b) => b.total - a.total);
  }, [audits]);

  // ============================================================
  // STATUS DATA
  // ============================================================

  const statusData = useMemo(() => {
    const map = {};

    filteredAudits.forEach((audit) => {
      const status = getAuditStatus(audit);

      map[status] = (map[status] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({
      name: name.replace(/_/g, " "),
      value,
    }));
  }, [filteredAudits]);

  // ============================================================
  // MONTHLY TREND
  // ============================================================

  const monthlyData = useMemo(() => {
    const map = {};

    filteredAudits.forEach((audit) => {
      const date = getStartDate(audit);

      if (!date) return;

      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) return;

      const month = parsedDate.toLocaleString("en-US", {
        month: "short",
      });

      if (!map[month]) {
        map[month] = {
          month,
          total: 0,
          completed: 0,
        };
      }

      map[month].total += 1;

      if (isCompleted(audit)) {
        map[month].completed += 1;
      }
    });

    return Object.values(map);
  }, [filteredAudits]);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-slate-600 font-medium">
            Loading audit performance...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-red-700">
            Failed to load Audit Performance
          </h2>

          <p className="text-red-600 mt-2">
            {error}
          </p>

          <button
            onClick={loadAudits}
            className="mt-4 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <div>
            <p className="text-sm font-semibold text-teal-600 uppercase tracking-wider">
              Audit Management
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mt-1">
              Audit Performance
            </h1>

            <p className="text-slate-500 mt-2">
              Monitor audit performance across all departments
            </p>
          </div>

          <button
            onClick={loadAudits}
            className="px-5 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition"
          >
            ↻ Refresh
          </button>

        </div>
      </div>

      {/* ====================================================== */}
      {/* FILTERS */}
      {/* ====================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* SEARCH */}

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">
              Search Audits
            </label>

            <input
              type="text"
              placeholder="Search audit code, department, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* DEPARTMENT */}

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">
              Department
            </label>

            <select
              value={selectedDepartment}
              onChange={(e) =>
                setSelectedDepartment(e.target.value)
              }
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
            >
              {departments.map((department) => (
                <option
                  key={department}
                  value={department}
                >
                  {department === "ALL"
                    ? "All Departments"
                    : department}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* ====================================================== */}
      {/* KPI CARDS */}
      {/* ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">

        <KpiCard
          title="Total Audits"
          value={totalAudits}
          icon="📋"
          description="All audits"
        />

        <KpiCard
          title="Completed"
          value={completedAudits}
          icon="✓"
          description={`${completionPercentage}% completion`}
          iconClass="text-emerald-600 bg-emerald-50"
        />

        <KpiCard
          title="In Progress"
          value={inProgressAudits}
          icon="↻"
          description="Active audits"
          iconClass="text-blue-600 bg-blue-50"
        />

        <KpiCard
          title="Planned"
          value={plannedAudits}
          icon="◷"
          description="Pending execution"
          iconClass="text-amber-600 bg-amber-50"
        />

        <KpiCard
          title="Overdue"
          value={overdueAudits}
          icon="!"
          description="Requires attention"
          iconClass="text-red-600 bg-red-50"
        />

      </div>

      {/* ====================================================== */}
      {/* COMPLETION RATE */}
      {/* ====================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Overall Audit Completion
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Completed audits compared with total audits
            </p>
          </div>

          <span className="text-3xl font-bold text-teal-600">
            {completionPercentage}%
          </span>
        </div>

        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-700"
            style={{
              width: `${completionPercentage}%`,
            }}
          />
        </div>

        <div className="flex justify-between text-sm mt-3 text-slate-500">
          <span>
            {completedAudits} completed
          </span>

          <span>
            {totalAudits} total
          </span>
        </div>

      </div>

      {/* ====================================================== */}
      {/* CHART ROW */}
      {/* ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">

        {/* STATUS PIE */}

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-800">
            Audit Status Distribution
          </h2>

          <p className="text-sm text-slate-500 mt-1 mb-4">
            Current audit status across departments
          </p>

          <div className="h-[350px]">

            {statusData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>

                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={115}
                    innerRadius={60}
                    paddingAngle={3}
                    label
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[index % COLORS.length]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>
              </ResponsiveContainer>
            )}

          </div>
        </div>

        {/* MONTHLY TREND */}

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

          <h2 className="text-xl font-bold text-slate-800">
            Audit Performance Trend
          </h2>

          <p className="text-sm text-slate-500 mt-1 mb-4">
            Total and completed audits over time
          </p>

          <div className="h-[350px]">

            {monthlyData.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="month" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total Audits"
                    stroke="#3b82f6"
                    strokeWidth={3}
                  />

                  <Line
                    type="monotone"
                    dataKey="completed"
                    name="Completed"
                    stroke="#14b8a6"
                    strokeWidth={3}
                  />

                </LineChart>
              </ResponsiveContainer>
            )}

          </div>
        </div>

      </div>

      {/* ====================================================== */}
      {/* DEPARTMENT PERFORMANCE */}
      {/* ====================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-sm">

        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-800">
            Department-wise Audit Performance
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Compare audit execution across all departments
          </p>
        </div>

        <div className="h-[400px]">

          {departmentData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 70,
                }}
              >

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="department"
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="total"
                  name="Total Audits"
                  fill="#3b82f6"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="completed"
                  name="Completed"
                  fill="#14b8a6"
                  radius={[5, 5, 0, 0]}
                />

                <Bar
                  dataKey="overdue"
                  name="Overdue"
                  fill="#ef4444"
                  radius={[5, 5, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>
          )}

        </div>
      </div>

      {/* ====================================================== */}
      {/* DEPARTMENT TABLE */}
      {/* ====================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mb-8">

        <div className="p-6 border-b border-slate-200">

          <h2 className="text-xl font-bold text-slate-800">
            Department Performance Summary
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Audit performance metrics by department
          </p>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-50">

              <tr>

                <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">
                  Department
                </th>

                <th className="text-center px-6 py-4 text-sm font-bold text-slate-600">
                  Total
                </th>

                <th className="text-center px-6 py-4 text-sm font-bold text-slate-600">
                  Completed
                </th>

                <th className="text-center px-6 py-4 text-sm font-bold text-slate-600">
                  In Progress
                </th>

                <th className="text-center px-6 py-4 text-sm font-bold text-slate-600">
                  Overdue
                </th>

                <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">
                  Completion
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {departmentData.map((item) => (

                <tr
                  key={item.department}
                  className="hover:bg-slate-50 transition"
                >

                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {item.department}
                  </td>

                  <td className="px-6 py-4 text-center">
                    {item.total}
                  </td>

                  <td className="px-6 py-4 text-center text-emerald-600 font-semibold">
                    {item.completed}
                  </td>

                  <td className="px-6 py-4 text-center text-blue-600 font-semibold">
                    {item.inProgress}
                  </td>

                  <td className="px-6 py-4 text-center text-red-600 font-semibold">
                    {item.overdue}
                  </td>

                  <td className="px-6 py-4 min-w-[180px]">

                    <div className="flex items-center gap-3">

                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{
                            width: `${item.completionRate}%`,
                          }}
                        />

                      </div>

                      <span className="text-sm font-bold text-slate-700">
                        {item.completionRate}%
                      </span>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* ====================================================== */}
      {/* ALL DEPARTMENT AUDITS */}
      {/* ====================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="p-6 border-b border-slate-200">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                All Department Audits
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Showing {filteredAudits.length} audit(s)
              </p>
            </div>

            <span className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-semibold">
              {selectedDepartment === "ALL"
                ? "All Departments"
                : selectedDepartment}
            </span>

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-slate-50">

              <tr>

                <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">
                  Audit Code
                </th>

                <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">
                  Department
                </th>

                <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">
                  Audit
                </th>

                <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">
                  Start Date
                </th>

                <th className="text-left px-6 py-4 text-sm font-bold text-slate-600">
                  Due Date
                </th>

                <th className="text-center px-6 py-4 text-sm font-bold text-slate-600">
                  Status
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {filteredAudits.length === 0 ? (

                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No audits found.
                  </td>
                </tr>

              ) : (

                filteredAudits.map((audit) => {

                  const status = getAuditStatus(audit);

                  const overdue = isOverdue(audit);

                  return (
                    <tr
                      key={getAuditId(audit)}
                      className="hover:bg-slate-50 transition"
                    >

                      <td className="px-6 py-4 font-bold text-teal-700">
                        {getAuditCode(audit)}
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-700">
                        {getDepartmentName(audit)}
                      </td>

                      <td className="px-6 py-4 text-slate-700">
                        {audit?.auditName ||
                          audit?.title ||
                          audit?.name ||
                          "Audit"}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(getStartDate(audit))}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(getDueDate(audit))}
                      </td>

                      <td className="px-6 py-4 text-center">

                        <StatusBadge
                          status={status}
                          overdue={overdue}
                        />

                      </td>

                    </tr>
                  );
                })

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

// ============================================================
// KPI CARD
// ============================================================

const KpiCard = ({
  title,
  value,
  icon,
  description,
  iconClass = "text-teal-600 bg-teal-50",
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-semibold text-slate-500">
            {title}
          </p>

          <h3 className="text-3xl font-bold text-slate-800 mt-2">
            {value}
          </h3>

          <p className="text-xs text-slate-400 mt-2">
            {description}
          </p>
        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  );
};

// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({ status, overdue }) => {

  if (overdue) {
    return (
      <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-700">
        OVERDUE
      </span>
    );
  }

  const styles = {
    COMPLETED:
      "bg-emerald-50 text-emerald-700",

    CLOSED:
      "bg-emerald-50 text-emerald-700",

    IN_PROGRESS:
      "bg-blue-50 text-blue-700",

    ONGOING:
      "bg-blue-50 text-blue-700",

    UNDER_REVIEW:
      "bg-purple-50 text-purple-700",

    ASSIGNED:
      "bg-cyan-50 text-cyan-700",

    PLANNED:
      "bg-amber-50 text-amber-700",

    PENDING:
      "bg-amber-50 text-amber-700",

    DRAFT:
      "bg-slate-100 text-slate-700",

    APPROVED:
      "bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${
        styles[status] ||
        "bg-slate-100 text-slate-600"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};

// ============================================================
// EMPTY CHART
// ============================================================

const EmptyChart = () => {
  return (
    <div className="h-full flex items-center justify-center text-slate-400">
      No audit data available
    </div>
  );
};

// ============================================================
// DATE FORMAT
// ============================================================

const formatDate = (date) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default AuditPerformance;