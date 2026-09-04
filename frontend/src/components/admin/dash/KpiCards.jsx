// src/components/dashboard/KpiCards.jsx
import { motion } from "framer-motion";
import {
    Users,
    Activity,
    ShieldCheck,
    Building2,
    Landmark,
    AlertTriangle,
    ClipboardCheck,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { CardSkeleton } from "./shared/Skeleton";
import AnimatedCounter from "./shared/AnimatedCounter";

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
};

const item = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function Trend({ value }) {
    if (value === undefined || value === null) return null;
    const positive = value >= 0;
    const Icon = positive ? ArrowUpRight : ArrowDownRight;
    return (
        <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                positive ? "text-emerald-600" : "text-red-500"
            }`}
        >
            <Icon size={13} />
            {Math.abs(value)}%
        </span>
    );
}

function KpiCard({ icon: Icon, label, value, suffix, tone, trend, footnote }) {
    const toneMap = {
        blue: "bg-blue-50 text-blue-600",
        teal: "bg-teal-50 text-teal-600",
        amber: "bg-amber-50 text-amber-600",
        red: "bg-red-50 text-red-600",
        slate: "bg-slate-100 text-slate-600",
    };

    return (
        <motion.div
            variants={item}
            whileHover={{ y: -3 }}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
            <div className="mb-4 flex items-start justify-between">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneMap[tone] || toneMap.blue}`}
                >
                    <Icon size={18} strokeWidth={1.9} />
                </div>
                <Trend value={trend} />
            </div>
            <p className="text-2xl font-semibold text-slate-900">
                <AnimatedCounter value={value || 0} suffix={suffix || ""} />
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
            {footnote && (
                <p className="mt-2 text-[11px] text-slate-400">{footnote}</p>
            )}
        </motion.div>
    );
}

export default function KpiCards({ summary, loading }) {
    if (loading) {
        return (
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                {Array.from({ length: 7 }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        );
    }

    const s = summary || {};

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7"
        >
            <KpiCard
                icon={Users}
                label="Total Users"
                value={s.totalUsers}
                tone="blue"
                trend={s.totalUsersChangePercent}
                footnote="vs last month"
            />
            <KpiCard
                icon={Activity}
                label="Active Users"
                value={s.activeUsers}
                tone="teal"
                footnote={
                    s.totalUsers
                        ? `${Math.round((s.activeUsers / s.totalUsers) * 100)}% of total`
                        : undefined
                }
            />
            <KpiCard
                icon={ShieldCheck}
                label="Roles"
                value={s.totalRoles}
                tone="slate"
            />
            <KpiCard
                icon={Building2}
                label="Departments"
                value={s.totalDepartments}
                tone="slate"
            />
            <KpiCard
                icon={Landmark}
                label="Organizations"
                value={s.totalOrganizations}
                tone="blue"
            />
            <KpiCard
                icon={AlertTriangle}
                label="Total Risks"
                value={s.totalRisks}
                tone="amber"
                footnote={
                    s.criticalRisks !== undefined
                        ? `${s.criticalRisks} critical`
                        : undefined
                }
            />
            <KpiCard
                icon={ClipboardCheck}
                label="Total Audits"
                value={s.totalAudits}
                tone="red"
                footnote={
                    s.pendingAudits !== undefined
                        ? `${s.pendingAudits} pending`
                        : undefined
                }
            />
        </motion.div>
    );
}