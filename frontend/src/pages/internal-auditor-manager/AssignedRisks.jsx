import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  RotateCcw,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Layers,
  Eye,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";

import { getAssignedRiskById, getAssignedRisks } from "../../service/AssignedRiskService";
import { getAllDepartments } from "../../service/departmentService";
import RiskDetails from "../../components/interanl-auditor/assignedRisks/RiskDetails";

const EMPTY_FILTERS = { riskLevel: "", category: "", department: "", status: "" };

// Department is a real entity ({ id, name, ... }) now, not a fixed enum string.
// This safely resolves a display label whether the API sends the full entity
// object or (for older data) a plain string.
const getDepartmentLabel = (department) => {
  if (!department) return "";
  if (typeof department === "string") return department;
  return (
    department.name ||
    department.departmentName ||
    department.title ||
    ""
  );
};

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const isOverdue = (risk) => {
  if (!risk.targetClosureDate) return false;
  const status = (risk.status || "").toUpperCase();
  if (status === "CLOSED" || status === "MITIGATED") return false;
  return new Date(risk.targetClosureDate) < new Date(new Date().toDateString());
};

const getRiskLevelClass = (level) => {
  switch ((level || "").toUpperCase()) {
    case "HIGH":
      return "bg-red-50 text-red-600";
    case "MEDIUM":
      return "bg-amber-50 text-amber-600";
    case "LOW":
      return "bg-[#E5FAF3] text-[#00A874]";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const formatLabel = (value) => {
  if (!value) return "—";
  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/* =========================================================
   ANIMATED COUNTER
========================================================= */

const AnimatedNumber = ({ value }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame;
    const start = performance.now();
    const from = display;
    const duration = 500;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display}</>;
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({ title, value, icon: Icon, index, tone = "teal" }) => {
  const toneClass =
    tone === "red"
      ? "bg-red-50 text-red-500"
      : tone === "amber"
      ? "bg-amber-50 text-amber-500"
      : "bg-[#E5FAF3] text-[#00A874]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileHover={{ y: -2 }}
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between"
    >
      <div>
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-[#101A33] mt-2">
          <AnimatedNumber value={value} />
        </p>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${toneClass}`}>
        <Icon size={19} />
      </div>
    </motion.div>
  );
};

/* =========================================================
   SELECT FIELD
========================================================= */

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-semibold text-[#101A33] mb-1.5">{label}</label>
    <select
      value={value || ""}
      onChange={onChange}
      className="w-full px-3.5 py-2.5 text-sm text-[#101A33] bg-white border border-gray-200 rounded-xl outline-none transition-all duration-150 focus:border-[#00C98B] focus:ring-2 focus:ring-[#E5FAF3]"
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {formatLabel(option)}
        </option>
      ))}
    </select>
  </div>
);

/* =========================================================
   TABLE HEAD (sortable)
========================================================= */

const SortableHead = ({ label, sortKey, sortConfig, onSort, align }) => {
  const active = sortConfig.key === sortKey;
  const Icon = !active ? ArrowUpDown : sortConfig.direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <th
      className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wide select-none ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`flex items-center gap-1 ${
          align === "right" ? "ml-auto" : ""
        } ${active ? "text-[#00A874]" : "text-gray-500 hover:text-[#101A33]"}`}
      >
        {label}
        <Icon size={12} />
      </button>
    </th>
  );
};

const TableHead = ({ children, align }) => (
  <th
    className={`px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-gray-500 ${
      align === "right" ? "text-right" : "text-left"
    }`}
  >
    {children}
  </th>
);

/* =========================================================
   TABLE SKELETON
========================================================= */

const RiskTableSkeleton = () => (
  <div>
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className="flex items-center gap-6 px-5 py-5 border-b border-gray-100 animate-pulse"
      >
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-40" />
        <div className="h-4 bg-gray-200 rounded w-28" />
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
    ))}
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AssignedRisks = () => {
  const navigate = useNavigate();

  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sortConfig, setSortConfig] = useState({ key: "riskScore", direction: "desc" });

  const [selectedRiskId, setSelectedRiskId] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Canonical department list, fetched from the Department entity API rather
  // than inferred from whatever happens to be loaded in the risks table.
  const [departmentEntities, setDepartmentEntities] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getAllDepartments()
      .then((data) => {
        if (!isMounted) return;
        const list = Array.isArray(data) ? data : data?.data || data?.content || [];
        setDepartmentEntities(list);
      })
      .catch((err) => {
        console.error("Failed to load departments:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchRisks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAssignedRisks();

      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.data)
        ? response.data.data
        : Array.isArray(response?.content)
        ? response.content
        : Array.isArray(response?.data?.content)
        ? response.data.content
        : [];

      setRisks(data);
    } catch (err) {
      console.error("Failed to load assigned risks:", err);
      setRisks([]);
      setError(
        err?.response?.data?.message || err?.message || "Unable to load assigned risks."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  const filterOptions = useMemo(() => {
    const categories = new Set();
    const statuses = new Set();
    risks.forEach((r) => {
      if (r.category) categories.add(r.category);
      if (r.status) statuses.add(r.status);
    });

    // Prefer the canonical department entity list; fall back to whatever
    // department labels show up in the loaded risks if that fetch hasn't
    // resolved yet (or failed).
    const departmentLabels = departmentEntities.length
      ? departmentEntities.map(getDepartmentLabel).filter(Boolean)
      : risks.map((r) => getDepartmentLabel(r.department)).filter(Boolean);

    return {
      categories: [...categories].sort(),
      departments: [...new Set(departmentLabels)].sort(),
      statuses: [...statuses].sort(),
    };
  }, [risks, departmentEntities]);

  const visibleRisks = useMemo(() => {
    let result = [...risks];

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.riskId?.toLowerCase().includes(term) ||
          r.title?.toLowerCase().includes(term) ||
          getDepartmentLabel(r.department).toLowerCase().includes(term) ||
          r.category?.toLowerCase().includes(term)
      );
    }

    if (filters.riskLevel) result = result.filter((r) => r.riskLevel === filters.riskLevel);
    if (filters.category) result = result.filter((r) => r.category === filters.category);
    if (filters.department)
      result = result.filter((r) => getDepartmentLabel(r.department) === filters.department);
    if (filters.status) result = result.filter((r) => r.status === filters.status);

    const { key, direction } = sortConfig;
    if (key) {
      const dir = direction === "asc" ? 1 : -1;
      result.sort((a, b) => {
        let valA = a[key];
        let valB = b[key];
        if (key === "identifiedDate" || key === "targetClosureDate") {
          valA = valA ? new Date(valA).getTime() : 0;
          valB = valB ? new Date(valB).getTime() : 0;
        }
        if (key === "riskLevel") {
          const order = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          valA = order[valA] || 0;
          valB = order[valB] || 0;
        }
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
      });
    }
    return result;
  }, [risks, searchTerm, filters, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "desc" }
    );
  };

  const handleClearFilters = () => setFilters(EMPTY_FILTERS);

  const handleView = async (riskId) => {
    setSelectedRiskId(riskId);
    setDetailsLoading(true);

    try {
      const detail = await getAssignedRiskById(riskId);
      setSelectedRisk(detail);
    } catch (err) {
      console.error("Failed to load risk details:", err);
      const fallbackRisk = risks.find((r) => String(r.riskId) === String(riskId));
      setSelectedRisk(fallbackRisk || null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedRiskId(null);
    setSelectedRisk(null);
  };

  const handleStartAuditPlanning = (risk) =>
    navigate("/internal-auditor/audit-planning", { state: { sourceRiskId: risk.riskId } });

  const handleViewRelatedAudit = (risk) =>
    navigate(`/internal-auditor/my-audits/${risk.relatedAuditId}`);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalRisks = risks.length;
  const highRisks = risks.filter((r) => (r.riskLevel || "").toUpperCase() === "HIGH").length;
  const mediumRisks = risks.filter((r) => (r.riskLevel || "").toUpperCase() === "MEDIUM").length;
  const lowRisks = risks.filter((r) => (r.riskLevel || "").toUpperCase() === "LOW").length;
  const overdueRisks = risks.filter(isOverdue).length;

  return (
    <div className="min-h-full bg-gray-50 px-6 py-7 sm:px-8">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-start justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-xl font-bold text-[#101A33]">Assigned Risks</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review risks assigned to you for audit assessment and execution.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2 w-64 focus-within:border-[#00C98B] focus-within:ring-2 focus-within:ring-[#E5FAF3] transition">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by Risk ID, title, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm w-full outline-none bg-transparent text-gray-800 placeholder:text-gray-400"
            />
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 text-sm font-medium rounded-xl px-3.5 py-2 border transition active:scale-95 ${
              filtersOpen || hasActiveFilters
                ? "border-[#00C98B] bg-[#E5FAF3] text-[#00A874]"
                : "border-gray-200 bg-white text-gray-700 hover:border-[#00C98B] hover:bg-[#E5FAF3]"
            }`}
          >
            <Filter size={15} />
            Filters
          </button>
        </div>
      </motion.div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <StatCard title="Total Assigned" value={totalRisks} icon={Layers} index={0} />
        <StatCard title="High Risk" value={highRisks} icon={ShieldAlert} index={1} tone="red" />
        <StatCard
          title="Medium Risk"
          value={mediumRisks}
          icon={ShieldQuestion}
          index={2}
          tone="amber"
        />
        <StatCard title="Low Risk" value={lowRisks} icon={ShieldCheck} index={3} />
        <StatCard title="Overdue" value={overdueRisks} icon={AlertOctagon} index={4} tone="red" />
      </div>

      {/* TABLE CARD */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#101A33]">Risk Register</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {visibleRisks.length} risk{visibleRisks.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          {/* FILTER PANEL */}
          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <SelectField
                    label="Risk Level"
                    value={filters.riskLevel}
                    onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
                    options={["HIGH", "MEDIUM", "LOW"]}
                  />

                  <SelectField
                    label="Category"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    options={filterOptions.categories}
                  />

                  <SelectField
                    label="Department"
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                    options={filterOptions.departments}
                  />

                  <SelectField
                    label="Status"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    options={filterOptions.statuses}
                  />

                  <div className="sm:col-span-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-[#101A33] transition"
                    >
                      <RotateCcw size={14} />
                      Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TABLE BODY */}
        {loading ? (
          <RiskTableSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <AlertOctagon size={24} />
            </div>
            <h3 className="text-base font-bold text-[#101A33] mb-1.5">
              Unable to load assigned risks.
            </h3>
            <p className="text-sm text-gray-500 mb-4 max-w-sm">{error}</p>
            <button
              type="button"
              onClick={fetchRisks}
              className="flex items-center gap-1.5 bg-[#00C98B] hover:bg-[#00A874] text-white text-sm font-semibold rounded-lg px-5 py-2.5 transition active:scale-95"
            >
              <RotateCcw size={14} />
              Retry
            </button>
          </div>
        ) : visibleRisks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#E5FAF3] text-[#00A874] flex items-center justify-center mb-4">
              <Layers size={25} />
            </div>
            <h3 className="text-base font-bold text-[#101A33]">No assigned risks found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Risks assigned to you for audit assessment will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <TableHead>Risk ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Department</TableHead>
                  <SortableHead
                    label="Risk Level"
                    sortKey="riskLevel"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Score"
                    sortKey="riskScore"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Target Closure"
                    sortKey="targetClosureDate"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <TableHead>Status</TableHead>
                  <TableHead align="right">Actions</TableHead>
                </tr>
              </thead>

              <tbody>
                <AnimatePresence initial={false}>
                  {visibleRisks.map((risk, index) => {
                    const overdue = isOverdue(risk);

                    return (
                      <motion.tr
                        key={risk.riskId}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: Math.min(index, 8) * 0.03 }}
                        className="border-b border-gray-100 hover:bg-[#FAFFFD] transition-colors"
                      >
                        <td className="px-5 py-4">
                          <span className="text-sm font-bold text-[#101A33]">{risk.riskId}</span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-[#101A33]">
                            {risk.title || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-xs text-gray-600">{risk.category || "—"}</span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-xs text-gray-600">
                            {getDepartmentLabel(risk.department) || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${getRiskLevelClass(
                              risk.riskLevel
                            )}`}
                          >
                            {formatLabel(risk.riskLevel)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-[#101A33]">
                            {risk.riskScore ?? "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`text-xs ${
                              overdue ? "text-red-600 font-semibold" : "text-gray-600"
                            }`}
                          >
                            {formatDate(risk.targetClosureDate)}
                            {overdue && " (Overdue)"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                            {formatLabel(risk.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              title="View Risk"
                              onClick={() => handleView(risk.riskId)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[#00A874] hover:bg-[#E5FAF3] transition-all duration-150"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {selectedRiskId && !detailsLoading && selectedRisk && (
        <RiskDetails
          risk={selectedRisk}
          onClose={handleCloseDetails}
          onStartAuditPlanning={handleStartAuditPlanning}
          onViewRelatedAudit={handleViewRelatedAudit}
        />
      )}
    </div>
  );
};

export default AssignedRisks;