import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Bell, ShieldCheck } from "lucide-react";
import { palette } from "./Theme";

// ============================================================
// AUDIT HEALTH SCORE
// ============================================================

const computeHealthScore = (statistics) => {
    if (!statistics || statistics.totalAudits === 0) {
        return null;
    }

    const completionRate =
        statistics.totalAudits > 0
            ? statistics.completedAudits / statistics.totalAudits
            : 0;

    const overduePenalty = Math.min(
        0.4,
        (statistics.overdueAudits /
            Math.max(statistics.totalAudits, 1)) *
            0.6
    );

    const criticalPenalty = Math.min(
        0.25,
        statistics.criticalFindings * 0.04
    );

    const score = Math.max(
        0,
        Math.min(
            100,
            Math.round(
                (completionRate -
                    overduePenalty -
                    criticalPenalty +
                    0.35) *
                    100
            )
        )
    );

    return score;
};

// ============================================================
// SCORE COLOR
// ============================================================

const scoreColor = (score) => {
    if (score === null) return "#94A3B8";
    if (score >= 75) return palette.low;
    if (score >= 50) return palette.medium;
    return palette.critical;
};

// ============================================================
// SCORE LABEL
// ============================================================

const scoreLabel = (score) => {
    if (score === null) return "No data yet";
    if (score >= 75) return "Healthy";
    if (score >= 50) return "Needs Attention";
    return "At Risk";
};

// ============================================================
// HEALTH RING
// ============================================================

const HealthRing = ({
    score,
    size = 84,
    stroke = 7,
}) => {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;

    const progress = score === null ? 0 : score / 100;
    const color = scoreColor(score);

    return (
        <div
            className="relative shrink-0"
            style={{
                width: size,
                height: size,
            }}
        >
            <svg
                width={size}
                height={size}
                className="-rotate-90"
            >
                {/* Background ring */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth={stroke}
                />

                {/* Progress ring */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{
                        strokeDashoffset: circumference,
                    }}
                    animate={{
                        strokeDashoffset:
                            circumference * (1 - progress),
                    }}
                    transition={{
                        duration: 1.1,
                        ease: "easeOut",
                        delay: 0.2,
                    }}
                />
            </svg>

            {/* Score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-slate-800 tabular-nums">
                    {score === null ? "—" : score}
                </span>
            </div>
        </div>
    );
};

// ============================================================
// GREETING
// ============================================================

const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
        return "Good morning";
    }

    if (hour < 17) {
        return "Good afternoon";
    }

    return "Good evening";
};

// ============================================================
// DASHBOARD HEADER
// ============================================================

export const DashboardHeader = ({
    userName = "Audit Manager",
    statistics,
    onNotificationsClick,
}) => {
    const score = useMemo(
        () => computeHealthScore(statistics),
        [statistics]
    );

    const today = useMemo(
        () =>
            new Date().toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
        []
    );

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={{
                hidden: {},
                show: {
                    transition: {
                        staggerChildren: 0.08,
                    },
                },
            }}
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6"
        >
            {/* ================================================= */}
            {/* LEFT SIDE */}
            {/* ================================================= */}

            <motion.div
                variants={{
                    hidden: {
                        opacity: 0,
                        y: -12,
                    },
                    show: {
                        opacity: 1,
                        y: 0,
                    },
                }}
                className="flex items-center gap-4"
            >
                <HealthRing score={score} />

                <div>
                    {/* DATE */}
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-600">
                        {today}
                    </p>

                    {/* GREETING */}
                    <h1 className="mt-1 text-2xl md:text-3xl font-bold text-slate-800">
                        {getGreeting()}, {userName}
                    </h1>

                    {/* DESCRIPTION */}
                    <p className="text-sm text-slate-500 mt-1 max-w-md">
                        Monitor audits, findings, risks, evidence, and team
                        performance from one place.
                    </p>

                    {/* HEALTH STATUS */}
                    {score !== null && (
                        <span
                            className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold"
                            style={{
                                color: scoreColor(score),
                            }}
                        >
                            <ShieldCheck className="w-3.5 h-3.5" />

                            Portfolio health:{" "}
                            {scoreLabel(score)}
                        </span>
                    )}
                </div>
            </motion.div>

            {/* ================================================= */}
            {/* RIGHT SIDE */}
            {/* ================================================= */}

            <motion.div
                variants={{
                    hidden: {
                        opacity: 0,
                        y: -12,
                    },
                    show: {
                        opacity: 1,
                        y: 0,
                    },
                }}
                className="flex items-center gap-3 self-start lg:self-auto"
            >
                {/* NOTIFICATION BUTTON */}

                <button
                    type="button"
                    onClick={onNotificationsClick}
                    className="relative w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-teal-600 hover:bg-teal-50 hover:border-teal-200 transition shadow-sm"
                    title="Notifications"
                >
                    <Bell className="w-[18px] h-[18px]" />

                    {/* Notification dot */}
                    <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-teal-500" />
                </button>

                {/* USER AVATAR */}

                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-sm font-bold text-teal-700 shadow-sm">
                    {userName?.charAt(0) || "A"}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DashboardHeader;
