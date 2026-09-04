// src/components/dashboard/UserAnalytics.jsx
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { BarChart3, ChevronDown } from "lucide-react";
import DashboardService from "../../../service/dashboardService";
import ChartCard from "./shared/ChartCard";
import EmptyState from "./shared/EmptyState";

const VIEW_OPTIONS = [
    { value: "role", label: "Role" },
    { value: "department", label: "Department" },
    { value: "organization", label: "Organization" },
];

const BAR_COLOR = "#2563EB";
const BAR_COLOR_ALT = "#0D9488";

function ChartTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    const row = payload[0].payload;
    return (
        <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs shadow-lg">
            <p className="font-semibold text-slate-800">{row.label}</p>
            <p className="text-slate-500">
                {row.count.toLocaleString("en-IN")} users
                {row.percent !== undefined && ` · ${row.percent}%`}
            </p>
        </div>
    );
}

export default function UserAnalytics() {
    const [viewBy, setViewBy] = useState("role");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rawData, setRawData] = useState([]);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);

            try {
                let rows = [];

                if (viewBy === "role") {
                    rows = await DashboardService.getUsersByRole();
                } else if (viewBy === "department") {
                    rows = await DashboardService.getUsersByDepartment();
                } else {
                    rows = await DashboardService.getUsersByOrganization();
                }

                if (!cancelled) {
                    setRawData(Array.isArray(rows) ? rows : []);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err?.response?.data?.message ||
                            err?.message ||
                            "Unable to fetch user analytics."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [viewBy]);

    const chartData = useMemo(() => {
        // dashboardService already returns [{ label, count }, ...] pre-aggregated —
        // consume it directly, no re-derivation needed here.
        const total = rawData.reduce((sum, row) => sum + (row.count || 0), 0);

        return rawData
            .map((row) => ({
                label: row.label || "Unknown",
                count: row.count || 0,
                percent: total ? Math.round(((row.count || 0) / total) * 100) : 0,
            }))
            .sort((a, b) => b.count - a.count);
    }, [rawData]);

    const totalUsers = chartData.reduce((sum, r) => sum + r.count, 0);
    const topEntry = chartData[0];

    return (
        <ChartCard
            title="User Analytics"
            subtitle="Breakdown of all users across the organization"
            icon={BarChart3}
            loading={loading}
            error={error}
            isEmpty={!loading && !error && chartData.length === 0}
            onRetry={() => setViewBy((v) => v)}
            headerRight={
                <div className="relative">
                    <button
                        onClick={() => setOpen((o) => !o)}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 transition hover:border-blue-200"
                    >
                        View By:{" "}
                        <span className="text-slate-900">
                            {VIEW_OPTIONS.find((o) => o.value === viewBy)?.label}
                        </span>
                        <ChevronDown
                            size={14}
                            className={`transition-transform ${open ? "rotate-180" : ""}`}
                        />
                    </button>
                    <AnimatePresence>
                        {open && (
                            <motion.div
                                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg"
                            >
                                {VIEW_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => {
                                            setViewBy(opt.value);
                                            setOpen(false);
                                        }}
                                        className={`block w-full px-4 py-2.5 text-left text-xs font-medium transition hover:bg-blue-50 hover:text-blue-600 ${
                                            viewBy === opt.value
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-slate-600"
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            }
        >
            <div className="mb-4 flex flex-wrap items-center gap-6 border-b border-slate-50 pb-4">
                <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                        Total Users
                    </p>
                    <p className="text-xl font-semibold text-slate-900">
                        {totalUsers.toLocaleString("en-IN")}
                    </p>
                </div>
                {topEntry && (
                    <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-400">
                            Most populated
                        </p>
                        <p className="text-xl font-semibold text-slate-900">
                            {topEntry.label}
                        </p>
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={viewBy}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    style={{ width: "100%", height: 300 }}
                >
                    {chartData.length === 0 ? (
                        <EmptyState title="No user data for this view" />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                layout={viewBy === "department" ? "vertical" : "horizontal"}
                                margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
                            >
                                {viewBy === "department" ? (
                                    <>
                                        <XAxis type="number" hide />
                                        <YAxis
                                            type="category"
                                            dataKey="label"
                                            width={110}
                                            tick={{ fontSize: 11, fill: "#64748B" }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 11, fill: "#64748B" }}
                                            axisLine={false}
                                            tickLine={false}
                                            interval={0}
                                            angle={chartData.length > 5 ? -20 : 0}
                                            textAnchor={chartData.length > 5 ? "end" : "middle"}
                                            height={50}
                                        />
                                        <YAxis hide />
                                    </>
                                )}
                                <Tooltip
                                    content={<ChartTooltip />}
                                    cursor={{ fill: "#F1F5F9" }}
                                />
                                <Bar
                                    dataKey="count"
                                    radius={viewBy === "department" ? [0, 8, 8, 0] : [8, 8, 0, 0]}
                                    animationDuration={800}
                                    animationEasing="ease-out"
                                    maxBarSize={42}
                                >
                                    {chartData.map((row, i) => (
                                        <Cell
                                            key={`${row.label}-${i}`}
                                            fill={i === 0 ? BAR_COLOR : BAR_COLOR_ALT}
                                            fillOpacity={i === 0 ? 1 : 0.75}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>
            </AnimatePresence>
        </ChartCard>
    );
}