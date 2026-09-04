// src/components/dashboard/SystemHealth.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Server, Database, KeyRound, ClipboardCheck, ShieldAlert, HeartPulse } from "lucide-react";
import DashboardService from "../../../service/dashboardService";
import ChartCard from "./shared/ChartCard";

const SERVICE_META = {
    API: { icon: Server, label: "API Status" },
    DATABASE: { icon: Database, label: "Database" },
    AUTH: { icon: KeyRound, label: "Authentication" },
    AUDIT: { icon: ClipboardCheck, label: "Audit Service" },
    RISK: { icon: ShieldAlert, label: "Risk Service" },
};

function StatusDot({ operational }) {
    return (
        <span className="relative flex h-2.5 w-2.5">
            {operational && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            )}
            <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                    operational ? "bg-emerald-500" : "bg-red-500"
                }`}
            />
        </span>
    );
}

export default function SystemHealth() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkedAt, setCheckedAt] = useState(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await DashboardService.getSystemHealth();
            const rows = Array.isArray(data) ? data : data?.services || data?.data || [];
            setServices(rows);
            setCheckedAt(new Date());
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to fetch system health.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        const interval = setInterval(load, 60000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="mb-8">
            <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <HeartPulse size={18} strokeWidth={1.9} />
                </div>
                <h2 className="text-lg font-semibold text-slate-900">System Health</h2>
            </div>

            <ChartCard loading={loading} error={error} onRetry={load} isEmpty={!loading && !error && services.length === 0}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {services.map((s, i) => {
                        const meta = SERVICE_META[s.key || s.name] || {
                            icon: Server,
                            label: s.name || "Service",
                        };
                        const Icon = meta.icon;
                        const operational = (s.status || "").toUpperCase() === "OPERATIONAL" || s.operational;

                        return (
                            <motion.div
                                key={meta.label}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.35, delay: i * 0.05 }}
                                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3.5"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                                    <Icon size={16} strokeWidth={1.9} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-medium text-slate-700">{meta.label}</p>
                                    <p className={`text-[11px] ${operational ? "text-emerald-600" : "text-red-500"}`}>
                                        {operational ? "Operational" : s.status || "Degraded"}
                                    </p>
                                </div>
                                <StatusDot operational={operational} />
                            </motion.div>
                        );
                    })}
                </div>
                {checkedAt && (
                    <p className="mt-4 text-right text-[11px] text-slate-400">
                        Last checked {checkedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                )}
            </ChartCard>
        </section>
    );
}