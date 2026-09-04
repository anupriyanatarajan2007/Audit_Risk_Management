// src/components/dashboard/RecentActivity.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    UserPlus,
    ShieldCheck,
    AlertTriangle,
    TrendingUp,
    ClipboardCheck,
    ClipboardX,
    Building2,
    Landmark,
    History,
} from "lucide-react";
import ChartCard from "./shared/ChartCard";
import DashboardService from "../../../service/dashboardService";
const ACTIVITY_META = {
    USER_REGISTERED: { icon: UserPlus, tone: "blue", label: "New user registered" },
    USER_ROLE_UPDATED: { icon: ShieldCheck, tone: "teal", label: "User role updated" },
    RISK_CREATED: { icon: AlertTriangle, tone: "amber", label: "Risk created" },
    RISK_SEVERITY_CHANGED: { icon: TrendingUp, tone: "red", label: "Risk severity changed" },
    AUDIT_ASSIGNED: { icon: ClipboardCheck, tone: "blue", label: "Audit assigned" },
    AUDIT_COMPLETED: { icon: ClipboardCheck, tone: "emerald", label: "Audit completed" },
    DEPARTMENT_CREATED: { icon: Building2, tone: "slate", label: "Department created" },
    ORGANIZATION_CREATED: { icon: Landmark, tone: "slate", label: "Organization created" },
    DEFAULT: { icon: History, tone: "slate", label: "Activity" },
};

const TONE_MAP = {
    blue: "bg-blue-50 text-blue-600",
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    emerald: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-100 text-slate-600",
};

function timeAgo(dateStr) {
    if (!dateStr) return "";
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function RecentActivity() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await DashboardService.getRecentActivities();
            const rows = Array.isArray(data) ? data : data?.data || [];
            setActivities(rows);
        } catch (err) {
            setError(err?.response?.data?.message || "Unable to fetch recent activity.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <section className="mb-8">
            <ChartCard
                title="Recent System Activity"
                subtitle="Latest actions across the platform"
                icon={History}
                loading={loading}
                error={error}
                isEmpty={!loading && !error && activities.length === 0}
                onRetry={load}
            >
                <motion.ul
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                    className="space-y-1"
                >
                    {activities.map((a, i) => {
                        const meta = ACTIVITY_META[a.type] || ACTIVITY_META.DEFAULT;
                        const Icon = meta.icon;
                        return (
                            <motion.li
                                key={a.id || i}
                                variants={{
                                    hidden: { opacity: 0, x: -12 },
                                    show: { opacity: 1, x: 0, transition: { duration: 0.35 } },
                                }}
                                className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50"
                            >
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${TONE_MAP[meta.tone]}`}>
                                    <Icon size={16} strokeWidth={1.9} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-slate-800">
                                        {a.description || meta.label}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {a.userName || a.user || "System"} · {timeAgo(a.timestamp || a.createdAt)}
                                    </p>
                                </div>
                                {a.status && (
                                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                                        {a.status}
                                    </span>
                                )}
                            </motion.li>
                        );
                    })}
                </motion.ul>
            </ChartCard>
        </section>
    );
}