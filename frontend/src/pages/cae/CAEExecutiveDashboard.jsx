// CAEExecutiveDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ShieldAlert,
  ClipboardCheck,
  CalendarRange,
  AlertTriangle,
  RefreshCcw,
  Bell,
  ChevronDown,
  Building2,
  Filter,
  X,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

import RiskService from "../../service/RiskService";
import AuditService from "../../service/AuditService";
import { getAllPlans } from "../../service/annualAuditPlanService";
import { getAllDepartments } from "../../service/departmentService";

// =====================================================================
// COLOR CONSTANTS
// =====================================================================

const SEVERITY_COLORS = {
  CRITICAL: "#dc2626",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
};

const AUDIT_STATUS_COLORS = {
  PLANNED: "#94a3b8",
  IN_PROGRESS: "#3b82f6",
  UNDER_REVIEW: "#8b5cf6",
  COMPLETED: "#10b981",
  OVERDUE: "#ef4444",
};

const PLAN_STATUS_COLORS = {
  DRAFT: "#94a3b8",
  PLANNED: "#94a3b8",
  APPROVED: "#0ea5e9",
  IN_PROGRESS: "#3b82f6",
  COMPLETED: "#10b981",
  DEFERRED: "#f59e0b",
  CANCELLED: "#ef4444",
};

// =====================================================================
// NORMALIZATION HELPERS
// Backend field names theriyaadha varaikkum safe-ah handle pannum.
// Actual DTO structure confirm pannitu intha functions-a adjust pannunga.
// =====================================================================

const normalizeDepartment = (entity, deptMap = {}) => {
  if (!entity) return "Unassigned";

  const raw =
    entity.department?.name ??
    entity.departmentName ??
    entity.auditDepartment?.name ??
    entity.dept?.name ??
    entity.department ??
    entity.departmentId;

  if (raw === undefined || raw === null || raw === "") return "Unassigned";

  if (typeof raw === "object") {
    return raw.name || raw.departmentName || "Unassigned";
  }

  if (deptMap[raw]) return deptMap[raw];

  return String(raw);
};

const normalizeSeverity = (risk) => {
  const raw =
    risk?.riskLevel ?? risk?.severity ?? risk?.level ?? risk?.riskSeverity ?? "MEDIUM";
  return String(raw).toUpperCase();
};

const normalizeRiskStatus = (risk) => {
  const raw = risk?.status ?? risk?.riskStatus ?? "IDENTIFIED";
  return String(raw).toUpperCase();
};

const normalizeAuditStatus = (audit) => {
  const raw = audit?.status ?? audit?.auditStatus ?? "PLANNED";
  return String(raw).toUpperCase();
};

const normalizePlanStatus = (plan) => {
  const raw = plan?.status ?? plan?.planStatus ?? "DRAFT";
  return String(raw).toUpperCase();
};

const getDueDate = (entity) =>
  entity?.plannedEndDate ??
  entity?.dueDate ??
  entity?.endDate ??
  entity?.targetDate ??
  null;

const isOverdue = (entity, statusValue, doneStates = ["COMPLETED", "CLOSED", "APPROVED"]) => {
  const due = getDueDate(entity);
  if (!due) return false;
  if (doneStates.includes(statusValue)) return false;
  return new Date(due) < new Date();
};

// =====================================================================
// SMALL REUSABLE UI PIECES
// =====================================================================

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: "easeOut" },
  }),
};

const ChartCard = ({ title, subtitle, action, children, className = "" }) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 p-5 ${className}`}
  >
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </motion.div>
);

const EmptyState = ({ message = "No data available" }) => (
  <div className="flex flex-col items-center justify-center h-56 text-slate-400">
    <ClipboardCheck size={32} className="mb-2 opacity-40" />
    <p className="text-sm">{message}</p>
  </div>
);

const ErrorState = ({ message = "Unable to load data", onRetry }) => (
  <div className="flex flex-col items-center justify-center h-56 text-red-400">
    <AlertTriangle size={32} className="mb-2 opacity-60" />
    <p className="text-sm text-red-500 mb-3">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

const LoadingSkeleton = ({ height = "h-56" }) => (
  <div className={`${height} rounded-xl bg-slate-100 animate-pulse`} />
);

const SeverityBadge = ({ level }) => {
  const color = SEVERITY_COLORS[level] || "#94a3b8";
  return (
    <span
      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      {level}
    </span>
  );
};

const StatCard = ({
  icon: Icon,
  title,
  total,
  breakdown = [],
  accent = "#2563eb",
  highlight = false,
  index = 0,
}) => (
  <motion.div
    custom={index}
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    whileHover={{ y: -3 }}
    className={`rounded-2xl border p-5 shadow-sm transition-all duration-300 ${
      highlight
        ? "bg-gradient-to-br from-red-50 to-white border-red-200"
        : "bg-white border-slate-200 hover:shadow-md"
    }`}
  >
    <div className="flex items-center justify-between mb-3">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: `${accent}1A` }}
      >
        <Icon size={20} style={{ color: accent }} />
      </div>
      {highlight && (
        <span className="text-[10px] font-bold uppercase tracking-wide text-red-500 bg-red-100 px-2 py-1 rounded-full">
          Attention
        </span>
      )}
    </div>
    <p className="text-xs font-medium text-slate-500">{title}</p>
    <p className="text-2xl font-bold text-slate-800 mt-1">{total}</p>
    {breakdown.length > 0 && (
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
        {breakdown.map((b) => (
          <span key={b.label} className="text-[11px] text-slate-500 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: b.color }} />
            {b.label}: <span className="font-semibold text-slate-700">{b.value}</span>
          </span>
        ))}
      </div>
    )}
  </motion.div>
);

const DepartmentSelector = ({ departments, selected, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:border-blue-300 transition-colors"
      >
        <Building2 size={16} className="text-blue-600" />
        {selected === "ALL" ? "All Departments" : selected}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute z-20 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1 max-h-72 overflow-y-auto"
          >
            <button
              onClick={() => {
                onChange("ALL");
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${
                selected === "ALL" ? "text-blue-600 font-semibold" : "text-slate-600"
              }`}
            >
              All Departments
            </button>
            {departments.map((d) => (
              <button
                key={d}
                onClick={() => {
                  onChange(d);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${
                  selected === d ? "text-blue-600 font-semibold" : "text-slate-600"
                }`}
              >
                {d}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// =====================================================================
// MAIN DASHBOARD
// =====================================================================

const CAEExecutiveDashboard = () => {
  const [risks, setRisks] = useState([]);
  const [audits, setAudits] = useState([]);
  const [plans, setPlans] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [lastUpdated, setLastUpdated] = useState(null);

  // ---------------------------------------------------------------
  // FETCH ALL DATA (independent failure handling)
  // ---------------------------------------------------------------

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErrors({});

    const [riskRes, auditRes, planRes, deptRes] = await Promise.allSettled([
      RiskService.getAllRisks(),
      AuditService.getAllAudits(),
      getAllPlans(),
      getAllDepartments(),
    ]);

    const nextErrors = {};

    if (riskRes.status === "fulfilled") {
      setRisks(Array.isArray(riskRes.value) ? riskRes.value : riskRes.value?.data || []);
    } else {
      nextErrors.risks = true;
      setRisks([]);
    }

    if (auditRes.status === "fulfilled") {
      setAudits(Array.isArray(auditRes.value) ? auditRes.value : []);
    } else {
      nextErrors.audits = true;
      setAudits([]);
    }

    if (planRes.status === "fulfilled") {
      setPlans(Array.isArray(planRes.value) ? planRes.value : planRes.value?.data || []);
    } else {
      nextErrors.plans = true;
      setPlans([]);
    }

    if (deptRes.status === "fulfilled") {
      setDepartments(Array.isArray(deptRes.value) ? deptRes.value : deptRes.value?.data || []);
    } else {
      nextErrors.departments = true;
      setDepartments([]);
    }

    setErrors(nextErrors);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ---------------------------------------------------------------
  // DEPARTMENT ID -> NAME MAP
  // ---------------------------------------------------------------

  const deptMap = useMemo(() => {
    const map = {};
    departments.forEach((d) => {
      const id = d.id ?? d.departmentId;
      const name = d.name ?? d.departmentName;
      if (id !== undefined && name) map[id] = name;
    });
    return map;
  }, [departments]);

  const departmentOptions = useMemo(() => {
    if (departments.length > 0) {
      return departments.map((d) => d.name ?? d.departmentName).filter(Boolean);
    }
    // Fallback: derive unique department names from risks/audits if API is empty
    const set = new Set();
    risks.forEach((r) => set.add(normalizeDepartment(r, deptMap)));
    audits.forEach((a) => set.add(normalizeDepartment(a, deptMap)));
    set.delete("Unassigned");
    return Array.from(set);
  }, [departments, risks, audits, deptMap]);

  // ---------------------------------------------------------------
  // FILTERED DATASETS (based on selected department)
  // ---------------------------------------------------------------

  const filteredRisks = useMemo(() => {
    if (selectedDepartment === "ALL") return risks;
    return risks.filter((r) => normalizeDepartment(r, deptMap) === selectedDepartment);
  }, [risks, selectedDepartment, deptMap]);

  const filteredAudits = useMemo(() => {
    if (selectedDepartment === "ALL") return audits;
    return audits.filter((a) => normalizeDepartment(a, deptMap) === selectedDepartment);
  }, [audits, selectedDepartment, deptMap]);

  const filteredPlans = useMemo(() => {
    if (selectedDepartment === "ALL") return plans;
    return plans.filter((p) => normalizeDepartment(p, deptMap) === selectedDepartment);
  }, [plans, selectedDepartment, deptMap]);

  // ---------------------------------------------------------------
  // KPI AGGREGATES (respect selected department)
  // ---------------------------------------------------------------

  const riskKpi = useMemo(() => {
    const acc = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    filteredRisks.forEach((r) => {
      const s = normalizeSeverity(r);
      if (acc[s] !== undefined) acc[s]++;
    });
    return { total: filteredRisks.length, ...acc };
  }, [filteredRisks]);

  const auditKpi = useMemo(() => {
    const acc = { PLANNED: 0, IN_PROGRESS: 0, UNDER_REVIEW: 0, COMPLETED: 0, OVERDUE: 0 };
    filteredAudits.forEach((a) => {
      const status = normalizeAuditStatus(a);
      if (isOverdue(a, status, ["COMPLETED"])) {
        acc.OVERDUE++;
      } else if (acc[status] !== undefined) {
        acc[status]++;
      }
    });
    return { total: filteredAudits.length, ...acc };
  }, [filteredAudits]);

  const planKpi = useMemo(() => {
    const acc = { PLANNED: 0, IN_PROGRESS: 0, COMPLETED: 0, DEFERRED: 0, CANCELLED: 0, APPROVED: 0 };
    filteredPlans.forEach((p) => {
      const status = normalizePlanStatus(p);
      if (acc[status] !== undefined) acc[status]++;
    });
    return { total: filteredPlans.length, ...acc };
  }, [filteredPlans]);

  const criticalIssues = useMemo(() => {
    const criticalRisks = filteredRisks.filter((r) => normalizeSeverity(r) === "CRITICAL").length;
    const overdueAudits = auditKpi.OVERDUE;
    return { criticalRisks, overdueAudits, total: criticalRisks + overdueAudits };
  }, [filteredRisks, auditKpi]);

  const auditCompletionRate = auditKpi.total > 0
    ? Math.round((auditKpi.COMPLETED / auditKpi.total) * 100)
    : 0;

  // ---------------------------------------------------------------
  // CHART DATA — always org-wide (compare across departments)
  // ---------------------------------------------------------------

  const riskByDeptChart = useMemo(() => {
    const map = {};
    risks.forEach((r) => {
      const dept = normalizeDepartment(r, deptMap);
      const sev = normalizeSeverity(r);
      if (!map[dept]) map[dept] = { department: dept, CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
      if (map[dept][sev] !== undefined) map[dept][sev]++;
    });
    return Object.values(map).sort(
      (a, b) => b.CRITICAL + b.HIGH - (a.CRITICAL + a.HIGH)
    );
  }, [risks, deptMap]);

  const auditByDeptChart = useMemo(() => {
    const map = {};
    audits.forEach((a) => {
      const dept = normalizeDepartment(a, deptMap);
      const status = normalizeAuditStatus(a);
      if (!map[dept])
        map[dept] = { department: dept, PLANNED: 0, IN_PROGRESS: 0, UNDER_REVIEW: 0, COMPLETED: 0, OVERDUE: 0 };
      if (isOverdue(a, status, ["COMPLETED"])) {
        map[dept].OVERDUE++;
      } else if (map[dept][status] !== undefined) {
        map[dept][status]++;
      }
    });
    return Object.values(map);
  }, [audits, deptMap]);

  const planByDeptChart = useMemo(() => {
    const map = {};
    plans.forEach((p) => {
      const dept = normalizeDepartment(p, deptMap);
      if (!map[dept]) map[dept] = { department: dept, count: 0 };
      map[dept].count++;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [plans, deptMap]);

  const highRiskRanking = useMemo(() => {
    return [...riskByDeptChart]
      .map((d) => ({ ...d, weight: d.CRITICAL * 3 + d.HIGH * 2 + d.MEDIUM }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);
  }, [riskByDeptChart]);

  // ---------------------------------------------------------------
  // SELECTED-DEPARTMENT DETAIL DATA
  // ---------------------------------------------------------------

  const severityDonutData = useMemo(() => {
    return Object.entries(riskKpi)
      .filter(([k]) => ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(k))
      .map(([k, v]) => ({ name: k, value: v }))
      .filter((d) => d.value > 0);
  }, [riskKpi]);

  const planStatusData = useMemo(() => {
    return Object.entries(planKpi)
      .filter(([k]) => k !== "total")
      .map(([k, v]) => ({ name: k, value: v }))
      .filter((d) => d.value > 0);
  }, [planKpi]);

  // ---------------------------------------------------------------
  // ATTENTION REQUIRED PANEL
  // ---------------------------------------------------------------

  const attentionItems = useMemo(() => {
    const items = [];

    filteredRisks
      .filter((r) => ["CRITICAL", "HIGH"].includes(normalizeSeverity(r)))
      .forEach((r) => {
        items.push({
          type: "Risk",
          id: r.riskId ?? r.id,
          title: r.title ?? r.riskTitle ?? "Untitled Risk",
          department: normalizeDepartment(r, deptMap),
          severity: normalizeSeverity(r),
          status: normalizeRiskStatus(r),
        });
      });

    filteredAudits.forEach((a) => {
      const status = normalizeAuditStatus(a);
      if (isOverdue(a, status, ["COMPLETED"])) {
        items.push({
          type: "Audit",
          id: a.auditId ?? a.id,
          title: a.title ?? a.auditTitle ?? "Untitled Audit",
          department: normalizeDepartment(a, deptMap),
          severity: "OVERDUE",
          status,
          dueDate: getDueDate(a),
        });
      }
    });

    const order = { CRITICAL: 0, OVERDUE: 1, HIGH: 2 };
    return items.sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9)).slice(0, 10);
  }, [filteredRisks, filteredAudits, deptMap]);

  // =====================================================================
  // RENDER
  // =====================================================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">CAE Executive Dashboard</h1>
          <p className="text-sm text-slate-500">Enterprise Audit, Risk & Compliance Overview</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : ""}
          </span>
          <button
            onClick={fetchAll}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-300 shadow-sm transition-colors"
            title="Refresh"
          >
            <RefreshCcw size={16} className={`text-blue-600 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button className="p-2 rounded-lg bg-white border border-slate-200 hover:border-blue-300 shadow-sm transition-colors relative">
            <Bell size={16} className="text-slate-500" />
            {criticalIssues.total > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">
                {criticalIssues.total > 9 ? "9+" : criticalIssues.total}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* DEPARTMENT FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-slate-400" />
          <DepartmentSelector
            departments={departmentOptions}
            selected={selectedDepartment}
            onChange={setSelectedDepartment}
          />
          {selectedDepartment !== "ALL" && (
            <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
              Currently Viewing: {selectedDepartment}
              <button onClick={() => setSelectedDepartment("ALL")}>
                <X size={12} />
              </button>
            </span>
          )}
        </div>
        {selectedDepartment !== "ALL" && (
          <button
            onClick={() => setSelectedDepartment("ALL")}
            className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} height="h-32" />)
        ) : (
          <>
            <StatCard
              index={0}
              icon={ShieldAlert}
              title="Total Risks"
              total={riskKpi.total}
              accent="#2563eb"
              breakdown={[
                { label: "Critical", value: riskKpi.CRITICAL, color: SEVERITY_COLORS.CRITICAL },
                { label: "High", value: riskKpi.HIGH, color: SEVERITY_COLORS.HIGH },
                { label: "Medium", value: riskKpi.MEDIUM, color: SEVERITY_COLORS.MEDIUM },
                { label: "Low", value: riskKpi.LOW, color: SEVERITY_COLORS.LOW },
              ]}
            />
            <StatCard
              index={1}
              icon={ClipboardCheck}
              title="Total Audits"
              total={auditKpi.total}
              accent="#0891b2"
              breakdown={[
                { label: "In Progress", value: auditKpi.IN_PROGRESS, color: AUDIT_STATUS_COLORS.IN_PROGRESS },
                { label: "Completed", value: auditKpi.COMPLETED, color: AUDIT_STATUS_COLORS.COMPLETED },
                { label: "Overdue", value: auditKpi.OVERDUE, color: AUDIT_STATUS_COLORS.OVERDUE },
              ]}
            />
            <StatCard
              index={2}
              icon={CalendarRange}
              title="Annual Audit Plans"
              total={planKpi.total}
              accent="#7c3aed"
              breakdown={[
                { label: "In Progress", value: planKpi.IN_PROGRESS, color: PLAN_STATUS_COLORS.IN_PROGRESS },
                { label: "Completed", value: planKpi.COMPLETED, color: PLAN_STATUS_COLORS.COMPLETED },
                { label: "Deferred", value: planKpi.DEFERRED, color: PLAN_STATUS_COLORS.DEFERRED },
              ]}
            />
            <StatCard
              index={3}
              icon={AlertTriangle}
              title="Critical Issues"
              total={criticalIssues.total}
              accent="#dc2626"
              highlight
              breakdown={[
                { label: "Critical Risks", value: criticalIssues.criticalRisks, color: SEVERITY_COLORS.CRITICAL },
                { label: "Overdue Audits", value: criticalIssues.overdueAudits, color: AUDIT_STATUS_COLORS.OVERDUE },
              ]}
            />
          </>
        )}
      </div>

      {/* ROW: RISK BY DEPT + AUDIT BY DEPT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Risk Distribution by Department" subtitle="Severity breakdown across departments">
          {loading ? (
            <LoadingSkeleton />
          ) : errors.risks ? (
            <ErrorState message="Unable to load risk analytics" onRetry={fetchAll} />
          ) : riskByDeptChart.length === 0 ? (
            <EmptyState message="No risks found" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={riskByDeptChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="CRITICAL" stackId="a" fill={SEVERITY_COLORS.CRITICAL} radius={[0, 0, 0, 0]} />
                <Bar dataKey="HIGH" stackId="a" fill={SEVERITY_COLORS.HIGH} />
                <Bar dataKey="MEDIUM" stackId="a" fill={SEVERITY_COLORS.MEDIUM} />
                <Bar dataKey="LOW" stackId="a" fill={SEVERITY_COLORS.LOW} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Audit Status by Department" subtitle="Lifecycle stage per department">
          {loading ? (
            <LoadingSkeleton />
          ) : errors.audits ? (
            <ErrorState message="Unable to load audit analytics" onRetry={fetchAll} />
          ) : auditByDeptChart.length === 0 ? (
            <EmptyState message="No audits found" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={auditByDeptChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="PLANNED" stackId="b" fill={AUDIT_STATUS_COLORS.PLANNED} />
                <Bar dataKey="IN_PROGRESS" stackId="b" fill={AUDIT_STATUS_COLORS.IN_PROGRESS} />
                <Bar dataKey="UNDER_REVIEW" stackId="b" fill={AUDIT_STATUS_COLORS.UNDER_REVIEW} />
                <Bar dataKey="COMPLETED" stackId="b" fill={AUDIT_STATUS_COLORS.COMPLETED} />
                <Bar dataKey="OVERDUE" stackId="b" fill={AUDIT_STATUS_COLORS.OVERDUE} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ROW: ANNUAL PLAN BY DEPT + SEVERITY DONUT (SELECTED DEPT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard title="Annual Audit Plan by Department" subtitle="Total plans per department">
          {loading ? (
            <LoadingSkeleton />
          ) : errors.plans ? (
            <ErrorState message="Unable to load annual plan analytics" onRetry={fetchAll} />
          ) : planByDeptChart.length === 0 ? (
            <EmptyState message="No annual audit plans found" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={planByDeptChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="department" type="category" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title={`Risk Severity Distribution${selectedDepartment !== "ALL" ? ` — ${selectedDepartment}` : ""}`}
          subtitle="Current severity mix"
        >
          {loading ? (
            <LoadingSkeleton />
          ) : severityDonutData.length === 0 ? (
            <EmptyState message="No risks found for this view" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={severityDonutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {severityDonutData.map((entry) => (
                    <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* ROW: AUDIT COMPLETION + HIGH RISK RANKING */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ChartCard
          title={`Audit Overview${selectedDepartment !== "ALL" ? ` — ${selectedDepartment}` : ""}`}
          subtitle="Completion performance"
        >
          {loading ? (
            <LoadingSkeleton height="h-40" />
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 -rotate-90">
                  <circle cx="64" cy="64" r="54" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="54"
                    stroke="#10b981"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 54}
                    initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 54 * (1 - auditCompletionRate / 100),
                    }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-2xl font-bold text-slate-800">{auditCompletionRate}%</span>
                  <span className="text-[10px] text-slate-400">Completed</span>
                </div>
              </div>
              <div className="flex gap-6 mt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-500" /> {auditKpi.COMPLETED} Completed
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-blue-500" /> {auditKpi.IN_PROGRESS} Active
                </span>
                <span className="flex items-center gap-1">
                  <AlertTriangle size={12} className="text-red-500" /> {auditKpi.OVERDUE} Overdue
                </span>
              </div>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Highest Risk Departments" subtitle="Ranked by critical & high exposure">
          {loading ? (
            <LoadingSkeleton />
          ) : highRiskRanking.length === 0 ? (
            <EmptyState message="No risk data available" />
          ) : (
            <div className="space-y-3">
              {highRiskRanking.map((d, i) => (
                <div key={d.department} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-400 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{d.department}</span>
                      <span className="text-slate-400">{d.CRITICAL + d.HIGH + d.MEDIUM + d.LOW} risks</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(d.CRITICAL / (highRiskRanking[0].weight || 1)) * 100 + 20}%`,
                        }}
                        className="h-full bg-red-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* ATTENTION REQUIRED */}
      <ChartCard title="Requires CAE Attention" subtitle="Critical & overdue items across the organization" className="mb-5">
        {loading ? (
          <LoadingSkeleton height="h-64" />
        ) : attentionItems.length === 0 ? (
          <EmptyState message="No critical items — everything looks good" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Title</th>
                  <th className="pb-2 pr-4">Department</th>
                  <th className="pb-2 pr-4">Severity</th>
                  <th className="pb-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {attentionItems.map((item, i) => (
                  <motion.tr
                    key={`${item.type}-${item.id}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-50 hover:bg-slate-50"
                  >
                    <td className="py-2 pr-4 text-slate-500">{item.type}</td>
                    <td className="py-2 pr-4 font-medium text-slate-700">{item.title}</td>
                    <td className="py-2 pr-4 text-slate-500">{item.department}</td>
                    <td className="py-2 pr-4">
                      <SeverityBadge level={item.severity} />
                    </td>
                    <td className="py-2 pr-4 text-slate-500">{item.status}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

      {/* PLAN STATUS BREAKDOWN */}
      <ChartCard
        title={`Annual Audit Plan Status${selectedDepartment !== "ALL" ? ` — ${selectedDepartment}` : ""}`}
        subtitle="Current status mix"
      >
        {loading ? (
          <LoadingSkeleton height="h-40" />
        ) : planStatusData.length === 0 ? (
          <EmptyState message="No annual audit plans found" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {planStatusData.map((s) => (
              <div key={s.name} className="rounded-xl border border-slate-100 p-3 text-center">
                <p
                  className="text-xl font-bold"
                  style={{ color: PLAN_STATUS_COLORS[s.name] || "#64748b" }}
                >
                  {s.value}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">{s.name.replace("_", " ")}</p>
              </div>
            ))}
          </div>
        )}
      </ChartCard>
    </div>
  );
};

export default CAEExecutiveDashboard;