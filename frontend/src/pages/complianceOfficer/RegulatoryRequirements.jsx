import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import {
    Search,
    RefreshCw,
    Eye,
    X,
    FileCheck2,
    FileClock,
    FileX2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Filter,
    RotateCcw,
    Clock,
    CheckCircle2,
    XCircle,
    FileSearch,
} from "lucide-react";

import RegulatoryRequirementService from "../../service/RegulatoryRequirementService";

// ============================================================
// CONSTANTS
// ============================================================

const PAGE_SIZE = 10;

const STATUS_COLORS = {
    ACTIVE: "#059669",
    PENDING: "#d97706",
    EXPIRED: "#dc2626",
};

const CHART_COLORS = ["#0d9488", "#0891b2", "#6366f1", "#d97706", "#dc2626", "#64748b", "#7c3aed"];

const RegulatoryRequirements = () => {
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [bodyFilter, setBodyFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [deptFilter, setDeptFilter] = useState("ALL");

    const [sortKey, setSortKey] = useState("effectiveDate");
    const [sortDir, setSortDir] = useState("desc");

    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);

    // ============================================================
    // LOAD DATA
    // ============================================================

    const loadData = async () => {
        try {
            setError("");
            const data = await RegulatoryRequirementService.getAllRegulatoryRequirements();
            setRequirements(Array.isArray(data) ? data : []);
            setLastUpdated(new Date());
        } catch (err) {
            setError("Unable to load regulatory requirements");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadData();
    };

    // ============================================================
    // HELPERS
    // ============================================================

    const formatDate = (date) => {
        if (!date) return "—";
        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) return "—";
        return parsed.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (date) => {
        if (!date) return "—";
        const parsed = new Date(date);
        if (Number.isNaN(parsed.getTime())) return "—";
        return parsed.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const isExpired = (req) => {
        if (!req.expiryDate) return false;
        return new Date(req.expiryDate) < new Date();
    };

    const isExpiringSoon = (req) => {
        if (!req.expiryDate) return false;
        const expiry = new Date(req.expiryDate);
        const today = new Date();
        const diffDays = (expiry - today) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 30;
    };

    const getStatus = (req) => {
        return String(req.status || "UNKNOWN").toUpperCase();
    };

    const getExpiryLabel = (req) => {
        if (isExpired(req)) {
            return { label: "Expired", color: "text-red-600", icon: XCircle };
        }
        if (isExpiringSoon(req)) {
            return { label: "Expiring Soon", color: "text-amber-600", icon: Clock };
        }
        return { label: "Valid", color: "text-emerald-600", icon: CheckCircle2 };
    };

    // ============================================================
    // DROPDOWN OPTIONS (dynamic)
    // ============================================================

    const regulatoryBodies = useMemo(() => {
        const set = new Set(requirements.map((r) => r.regulatoryBody).filter(Boolean));
        return Array.from(set).sort();
    }, [requirements]);

    const categories = useMemo(() => {
        const set = new Set(requirements.map((r) => r.category).filter(Boolean));
        return Array.from(set).sort();
    }, [requirements]);

    const departments = useMemo(() => {
        const set = new Set(requirements.map((r) => r.applicableDepartment).filter(Boolean));
        return Array.from(set).sort();
    }, [requirements]);

    // ============================================================
    // STATS
    // ============================================================

    const stats = useMemo(() => {
        const total = requirements.length;
        const active = requirements.filter((r) => getStatus(r) === "ACTIVE").length;
        const expired = requirements.filter((r) => isExpired(r)).length;
        const expiringSoon = requirements.filter((r) => isExpiringSoon(r)).length;

        return { total, active, expired, expiringSoon };
    }, [requirements]);

    // ============================================================
    // CHART DATA
    // ============================================================

    const statusChartData = useMemo(() => {
        const counts = {};
        requirements.forEach((r) => {
            const s = getStatus(r);
            counts[s] = (counts[s] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [requirements]);

    const bodyChartData = useMemo(() => {
        const counts = {};
        requirements.forEach((r) => {
            const b = r.regulatoryBody || "Unspecified";
            counts[b] = (counts[b] || 0) + 1;
        });
        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }, [requirements]);

    const categoryChartData = useMemo(() => {
        const counts = {};
        requirements.forEach((r) => {
            const c = r.category || "Unspecified";
            counts[c] = (counts[c] || 0) + 1;
        });
        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }, [requirements]);

    const deptChartData = useMemo(() => {
        const counts = {};
        requirements.forEach((r) => {
            const d = r.applicableDepartment || "Unspecified";
            counts[d] = (counts[d] || 0) + 1;
        });
        return Object.entries(counts).map(([name, count]) => ({ name, count }));
    }, [requirements]);

    // ============================================================
    // FILTER + SORT
    // ============================================================

    const filtered = useMemo(() => {
        let result = requirements.filter((r) => {
            const searchValue = search.toLowerCase();

            const matchesSearch =
                !searchValue ||
                r.requirementCode?.toLowerCase().includes(searchValue) ||
                r.title?.toLowerCase().includes(searchValue) ||
                r.regulatoryBody?.toLowerCase().includes(searchValue) ||
                r.description?.toLowerCase().includes(searchValue);

            const matchesStatus = statusFilter === "ALL" || getStatus(r) === statusFilter;
            const matchesBody = bodyFilter === "ALL" || r.regulatoryBody === bodyFilter;
            const matchesCategory = categoryFilter === "ALL" || r.category === categoryFilter;
            const matchesDept = deptFilter === "ALL" || r.applicableDepartment === deptFilter;

            return matchesSearch && matchesStatus && matchesBody && matchesCategory && matchesDept;
        });

        result = [...result].sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];

            if (sortKey.includes("Date")) {
                valA = valA ? new Date(valA).getTime() : 0;
                valB = valB ? new Date(valB).getTime() : 0;
            } else {
                valA = String(valA || "").toLowerCase();
                valB = String(valB || "").toLowerCase();
            }

            if (valA < valB) return sortDir === "asc" ? -1 : 1;
            if (valA > valB) return sortDir === "asc" ? 1 : -1;
            return 0;
        });

        return result;
    }, [requirements, search, statusFilter, bodyFilter, categoryFilter, deptFilter, sortKey, sortDir]);

    // reset to page 1 whenever filters change
    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, bodyFilter, categoryFilter, deptFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

    const paginated = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filtered.slice(start, start + PAGE_SIZE);
    }, [filtered, page]);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("ALL");
        setBodyFilter("ALL");
        setCategoryFilter("ALL");
        setDeptFilter("ALL");
    };

    const hasActiveFilters =
        search || statusFilter !== "ALL" || bodyFilter !== "ALL" || categoryFilter !== "ALL" || deptFilter !== "ALL";

    // ============================================================
    // STATUS BADGE
    // ============================================================

    const StatusBadge = ({ status }) => {
        const value = String(status || "UNKNOWN").toUpperCase();

        const styles = {
            ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
            PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
            EXPIRED: "bg-red-50 text-red-700 ring-red-600/20",
        };

        return (
            <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    styles[value] || "bg-slate-50 text-slate-600 ring-slate-500/20"
                }`}
            >
                {value}
            </span>
        );
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-[1400px] mx-auto px-6 py-8">

                {/* ===================== HEADER ===================== */}

                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
                >
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Regulatory Requirements</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Monitor and review applicable regulatory obligations
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {lastUpdated && (
                            <span className="text-xs text-slate-400">
                                Last updated: {formatDateTime(lastUpdated)}
                            </span>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition disabled:opacity-50"
                        >
                            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                            Refresh
                        </motion.button>
                    </div>
                </motion.div>

                {/* ===================== STAT CARDS ===================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    {[
                        {
                            label: "Total Requirements",
                            value: stats.total,
                            desc: "All tracked obligations",
                            icon: FileCheck2,
                            color: "text-teal-600",
                            bg: "bg-teal-50",
                        },
                        {
                            label: "Active Requirements",
                            value: stats.active,
                            desc: "Currently in force",
                            icon: CheckCircle2,
                            color: "text-emerald-600",
                            bg: "bg-emerald-50",
                        },
                        {
                            label: "Expired Requirements",
                            value: stats.expired,
                            desc: "Past expiry date",
                            icon: FileX2,
                            color: "text-red-600",
                            bg: "bg-red-50",
                        },
                        {
                            label: "Expiring Soon",
                            value: stats.expiringSoon,
                            desc: "Within next 30 days",
                            icon: AlertTriangle,
                            color: "text-amber-600",
                            bg: "bg-amber-50",
                        },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: i * 0.08 }}
                            whileHover={{ y: -2 }}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                                    <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
                                    <p className="mt-1 text-xs text-slate-400">{stat.desc}</p>
                                </div>
                                <div className={`rounded-lg p-2.5 ${stat.bg}`}>
                                    <stat.icon size={18} className={stat.color} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ===================== CHART ROW 1 ===================== */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <p className="text-sm font-semibold text-slate-800 mb-4">Regulatory Status Distribution</p>

                        {statusChartData.length === 0 ? (
                            <EmptyChart />
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie
                                        data={statusChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={2}
                                    >
                                        {statusChartData.map((entry, index) => (
                                            <Cell
                                                key={entry.name}
                                                fill={STATUS_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={30} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <p className="text-sm font-semibold text-slate-800 mb-4">Requirements by Regulatory Body</p>

                        {bodyChartData.length === 0 ? (
                            <EmptyChart />
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={bodyChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </motion.div>
                </div>

                {/* ===================== CHART ROW 2 ===================== */}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.15 }}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <p className="text-sm font-semibold text-slate-800 mb-4">Requirements by Category</p>

                        {categoryChartData.length === 0 ? (
                            <EmptyChart />
                        ) : (
                            <ResponsiveContainer width="100%" height={Math.max(200, categoryChartData.length * 40)}>
                                <BarChart data={categoryChartData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={130}
                                        tick={{ fontSize: 11, fill: "#64748b" }}
                                    />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <p className="text-sm font-semibold text-slate-800 mb-4">Department Coverage</p>

                        {deptChartData.length === 0 ? (
                            <EmptyChart />
                        ) : (
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={deptChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </motion.div>
                </div>

                {/* ===================== FILTER TOOLBAR ===================== */}

                <div className="rounded-xl border border-slate-200 bg-white p-4 mb-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[220px]">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search code, title, regulatory body..."
                                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
                        >
                            <option value="ALL">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING">Pending</option>
                            <option value="EXPIRED">Expired</option>
                        </select>

                        <select
                            value={bodyFilter}
                            onChange={(e) => setBodyFilter(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
                        >
                            <option value="ALL">All Regulatory Bodies</option>
                            {regulatoryBodies.map((b) => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
                        >
                            <option value="ALL">All Categories</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        <select
                            value={deptFilter}
                            onChange={(e) => setDeptFilter(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
                        >
                            <option value="ALL">All Departments</option>
                            {departments.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>

                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600 transition"
                            >
                                <RotateCcw size={13} />
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* ===================== ERROR ===================== */}

                {error && (
                    <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <span>{error}</span>
                        <button
                            onClick={loadData}
                            className="font-medium underline underline-offset-2 hover:text-red-800"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ===================== TABLE ===================== */}

                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px]">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/60">
                                    <SortableHeader label="Code" sortKey="requirementCode" current={sortKey} dir={sortDir} onSort={handleSort} />
                                    <SortableHeader label="Title" sortKey="title" current={sortKey} dir={sortDir} onSort={handleSort} />
                                    <SortableHeader label="Regulatory Body" sortKey="regulatoryBody" current={sortKey} dir={sortDir} onSort={handleSort} />
                                    <SortableHeader label="Category" sortKey="category" current={sortKey} dir={sortDir} onSort={handleSort} />
                                    <SortableHeader label="Department" sortKey="applicableDepartment" current={sortKey} dir={sortDir} onSort={handleSort} />
                                    <SortableHeader label="Effective Date" sortKey="effectiveDate" current={sortKey} dir={sortDir} onSort={handleSort} />
                                    <SortableHeader label="Expiry Date" sortKey="expiryDate" current={sortKey} dir={sortDir} onSort={handleSort} />
                                    <SortableHeader label="Status" sortKey="status" current={sortKey} dir={sortDir} onSort={handleSort} />
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Compliance Ref.
                                    </th>
                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                                ) : paginated.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-5 py-16 text-center">
                                            <FileSearch size={32} className="mx-auto mb-3 text-slate-300" />
                                            <p className="text-sm font-medium text-slate-500">
                                                No regulatory requirements found
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((req, i) => {
                                        const expiry = getExpiryLabel(req);

                                        return (
                                            <motion.tr
                                                key={req.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.25, delay: i * 0.03 }}
                                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition"
                                            >
                                                <td className="px-5 py-3.5 text-sm font-medium text-slate-900">
                                                    {req.requirementCode}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-slate-700 max-w-[220px] truncate">
                                                    {req.title}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-slate-600">
                                                    {req.regulatoryBody || "—"}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-slate-600">
                                                    {req.category || "—"}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-slate-600">
                                                    {req.applicableDepartment || "—"}
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-slate-600">
                                                    {formatDate(req.effectiveDate)}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="text-sm text-slate-600">{formatDate(req.expiryDate)}</div>
                                                    <div className={`flex items-center gap-1 text-[11px] mt-0.5 ${expiry.color}`}>
                                                        <expiry.icon size={11} />
                                                        {expiry.label}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <StatusBadge status={req.status} />
                                                </td>
                                                <td className="px-5 py-3.5 text-sm text-slate-500">
                                                    {req.complianceReference || "—"}
                                                </td>
                                                <td className="px-5 py-3.5 text-right">
                                                    <button
                                                        onClick={() => setSelected(req)}
                                                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition"
                                                    >
                                                        <Eye size={13} />
                                                        View
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ===================== PAGINATION ===================== */}

                    {!loading && filtered.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
                            <p className="text-xs text-slate-500">
                                Showing{" "}
                                <span className="font-medium text-slate-700">
                                    {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
                                </span>{" "}
                                of <span className="font-medium text-slate-700">{filtered.length}</span> requirements
                            </p>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 transition disabled:opacity-40 disabled:hover:bg-transparent"
                                >
                                    <ChevronLeft size={14} />
                                    Previous
                                </button>

                                {Array.from({ length: totalPages }).map((_, i) => {
                                    const pageNum = i + 1;
                                    if (totalPages > 7 && Math.abs(pageNum - page) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                                        if (Math.abs(pageNum - page) === 3) {
                                            return <span key={pageNum} className="px-1 text-slate-300 text-xs">…</span>;
                                        }
                                        return null;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`h-7 w-7 rounded-md text-xs font-medium transition ${
                                                pageNum === page
                                                    ? "bg-teal-600 text-white"
                                                    : "text-slate-500 hover:bg-slate-100"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 transition disabled:opacity-40 disabled:hover:bg-transparent"
                                >
                                    Next
                                    <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ===================== VIEW MODAL ===================== */}

            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
                        onClick={() => setSelected(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl"
                        >
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
                                        {selected.requirementCode}
                                    </p>
                                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                                        {selected.title}
                                    </h2>
                                </div>

                                <button
                                    onClick={() => setSelected(null)}
                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="px-6 py-5 space-y-5">
                                <ModalDetail label="Description" value={selected.description} full />

                                <div className="grid grid-cols-2 gap-4">
                                    <ModalDetail label="Regulatory Body" value={selected.regulatoryBody} />
                                    <ModalDetail label="Category" value={selected.category} />
                                    <ModalDetail label="Applicable Department" value={selected.applicableDepartment} />
                                    <ModalDetail label="Applicable Process" value={selected.applicableProcess} />
                                    <ModalDetail label="Effective Date" value={formatDate(selected.effectiveDate)} />
                                    <ModalDetail label="Expiry Date" value={formatDate(selected.expiryDate)} />
                                    <ModalDetail
                                        label="Status"
                                        value={<StatusBadge status={selected.status} />}
                                        raw
                                    />
                                    <ModalDetail label="Compliance Reference" value={selected.complianceReference} />
                                </div>

                                <ModalDetail label="Remarks" value={selected.remarks} full />

                                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                                    <ModalDetail label="Created At" value={formatDateTime(selected.createdAt)} />
                                    <ModalDetail label="Updated At" value={formatDateTime(selected.updatedAt)} />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ============================================================
// SORTABLE HEADER
// ============================================================

const SortableHeader = ({ label, sortKey, current, dir, onSort }) => {
    const active = current === sortKey;

    return (
        <th
            onClick={() => onSort(sortKey)}
            className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 cursor-pointer select-none hover:text-slate-800 transition"
        >
            <span className="inline-flex items-center gap-1">
                {label}
                {active && <span className="text-teal-600">{dir === "asc" ? "↑" : "↓"}</span>}
            </span>
        </th>
    );
};

// ============================================================
// SKELETON ROW
// ============================================================

const SkeletonRow = () => {
    return (
        <tr className="border-b border-slate-100">
            {Array.from({ length: 10 }).map((_, i) => (
                <td key={i} className="px-5 py-4">
                    <div className="h-3 rounded bg-slate-100 animate-pulse" style={{ width: `${60 + (i % 3) * 15}%` }} />
                </td>
            ))}
        </tr>
    );
};

// ============================================================
// EMPTY CHART STATE
// ============================================================

const EmptyChart = () => (
    <div className="flex h-[260px] items-center justify-center text-sm text-slate-400">
        No data available
    </div>
);

// ============================================================
// MODAL DETAIL
// ============================================================

const ModalDetail = ({ label, value, full, raw }) => {
    return (
        <div className={full ? "col-span-2" : ""}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {label}
            </p>
            {raw ? (
                value
            ) : (
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-6">{value || "—"}</p>
            )}
        </div>
    );
};

export default RegulatoryRequirements;