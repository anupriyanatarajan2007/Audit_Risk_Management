// src/components/dashboard/DashboardHeader.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Calendar } from "lucide-react";

export default function DashboardHeader({ onRefresh, lastUpdated, refreshing }) {
    const [range, setRange] = useState("30d");

    const formattedTime = lastUpdated
        ? new Date(lastUpdated).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
          })
        : "—";

    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[26px]">
                    Welcome back, Administrator 👋
                </h1>
                <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                    Monitor users, organizations, risks, audits, and compliance
                    activities from one centralized dashboard.
                </p>
            </div>

            <div className="flex items-center gap-2">
                <div className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 sm:flex">
                    <Calendar size={14} className="text-slate-400" />
                    <select
                        value={range}
                        onChange={(e) => setRange(e.target.value)}
                        className="bg-transparent text-xs font-medium text-slate-600 outline-none"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last quarter</option>
                        <option value="1y">Last year</option>
                    </select>
                </div>

                <div className="text-right">
                    <p className="text-[11px] text-slate-400">Last updated</p>
                    <p className="text-xs font-medium text-slate-600">
                        {formattedTime}
                    </p>
                </div>

                <button
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                    title="Refresh dashboard"
                >
                    <RefreshCw
                        size={16}
                        className={refreshing ? "animate-spin" : ""}
                    />
                </button>
            </div>
        </motion.div>
    );
}