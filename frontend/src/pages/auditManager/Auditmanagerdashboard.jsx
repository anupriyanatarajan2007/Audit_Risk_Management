import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

import {
    ClipboardList,
    Activity,
    CheckCircle2,
    ClipboardCheck,
    ShieldAlert,
    AlertOctagon,
    Clock3,
    FileUp,
} from "lucide-react";

import {
    fetchDashboardSources,
    buildDashboardData,
} from "../../service/AMDashboardservice";

import AuditManagerStatCard from "../../components/audit-manager/dash/Statcard";

import {
    AuditorPerformance,
    PendingReviews,
    QuickActions,
    RecentAuditActivity,
    UpcomingDeadlines,
} from "../../components/audit-manager/dash/Widgets";

import { StatCardSkeleton } from "../../components/audit-manager/dash/Dashboardstates";

import { DashboardHeader } from "../../components/audit-manager/dash/Dashboardheader";

import {
    AuditProgressChart,
    AuditStatusChart,
    DepartmentPerformanceChart,
    FindingsSeverityChart,
    RiskOverviewChart,
} from "../../components/audit-manager/dash/Charts";

// ============================================================
// KPI CARD DEFINITIONS
// ============================================================

const KPI_DEFS = [
    {
        key: "totalAudits",
        label: "Total Audits",
        icon: ClipboardList,
        accent: "teal",
    },
    {
        key: "activeAudits",
        label: "Active Audits",
        icon: Activity,
        accent: "teal",
    },
    {
        key: "completedAudits",
        label: "Completed Audits",
        icon: CheckCircle2,
        accent: "success",
    },
    {
        key: "pendingReviews",
        label: "Pending Reviews",
        icon: ClipboardCheck,
        accent: "teal",
    },
    {
        key: "openFindings",
        label: "Open Findings",
        icon: ShieldAlert,
        accent: "warning",
    },
    {
        key: "criticalFindings",
        label: "Critical Findings",
        icon: AlertOctagon,
        accent: "danger",
    },
    {
        key: "overdueAudits",
        label: "Overdue Audits",
        icon: Clock3,
        accent: "danger",
    },
    {
        key: "evidencePending",
        label: "Evidence Pending",
        icon: FileUp,
        accent: "warning",
    },
];

// ============================================================
// ANIMATION
// ============================================================

const staggerContainer = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.06,
        },
    },
};

const fadeUp = {
    hidden: {
        opacity: 0,
        y: 14,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut",
        },
    },
};

// ============================================================
// SAFE STRING HELPER
// ============================================================

const getSafeString = (value, fallback = "") => {
    if (value === null || value === undefined) {
        return fallback;
    }

    if (typeof value === "string" || typeof value === "number") {
        return String(value);
    }

    if (typeof value === "object") {
        return (
            value.name ||
            value.fullName ||
            value.title ||
            value.label ||
            value.username ||
            value.email ||
            fallback
        );
    }

    return fallback;
};

// ============================================================
// CURRENT USER
// ============================================================

const getCurrentUserName = () => {
    try {
        const raw =
            localStorage.getItem("user") ||
            localStorage.getItem("currentUser");

        if (!raw) {
            return "Audit Manager";
        }

        const user = JSON.parse(raw);

        // Handle normal string name
        if (typeof user?.name === "string") {
            return user.name;
        }

        // Handle object name:
        // { id: 1, name: "...", active: true }
        if (user?.name && typeof user.name === "object") {
            return getSafeString(
                user.name,
                "Audit Manager"
            );
        }

        // Handle fullName
        if (typeof user?.fullName === "string") {
            return user.fullName;
        }

        // Handle firstName + lastName
        const firstName = getSafeString(user?.firstName);
        const lastName = getSafeString(user?.lastName);

        const fullName = `${firstName} ${lastName}`.trim();

        if (fullName) {
            return fullName;
        }

        // Sometimes user object may contain profile
        if (user?.profile) {
            const profileName =
                getSafeString(user.profile.name) ||
                getSafeString(user.profile.fullName);

            if (profileName) {
                return profileName;
            }

            const profileFullName = [
                getSafeString(user.profile.firstName),
                getSafeString(user.profile.lastName),
            ]
                .filter(Boolean)
                .join(" ");

            if (profileFullName) {
                return profileFullName;
            }
        }

        return "Audit Manager";
    } catch (error) {
        console.error(
            "Failed to read current user:",
            error
        );

        return "Audit Manager";
    }
};

// ============================================================
// ERROR STATE
// ============================================================

const ErrorState = ({ message, onRetry }) => {
    return (
        <div className="text-center">

            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <AlertOctagon className="w-7 h-7 text-red-500" />
            </div>

            <h3 className="text-lg font-semibold text-slate-800 mb-2">
                Something went wrong
            </h3>

            <p className="text-sm text-slate-500 mb-5">
                {getSafeString(
                    message,
                    "Unable to load dashboard."
                )}
            </p>

            <button
                onClick={onRetry}
                className="
                    px-5 py-2.5
                    rounded-lg
                    bg-teal-600
                    hover:bg-teal-700
                    text-white
                    text-sm
                    font-medium
                    transition
                    shadow-sm
                "
            >
                Try Again
            </button>

        </div>
    );
};

// ============================================================
// MAIN DASHBOARD
// ============================================================

const AuditManagerDashboard = () => {

    const [state, setState] = useState({
        loading: true,
        error: false,
        sourceErrors: {},
        dashboardData: null,
    });

    // ========================================================
    // LOAD DASHBOARD DATA
    // ========================================================

    const load = useCallback(async () => {

        setState((prev) => ({
            ...prev,
            loading: true,
            error: false,
        }));

        try {

            const sources = await fetchDashboardSources();

            const dashboardData =
                buildDashboardData(sources);

            setState({
                loading: false,
                error: false,
                sourceErrors: sources?.sourceErrors || {},
                dashboardData: dashboardData || null,
            });

        } catch (error) {

            console.error(
                "Dashboard: unexpected failure building dashboard data:",
                error
            );

            setState({
                loading: false,
                error: true,
                sourceErrors: {},
                dashboardData: null,
            });
        }

    }, []);

    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {
        load();
    }, [load]);

    const {
        loading,
        error,
        sourceErrors,
        dashboardData,
    } = state;

    // ========================================================
    // QUICK ACTION
    // ========================================================

    const handleQuickAction = (actionKey) => {
        console.log(
            "Quick action triggered:",
            actionKey
        );
    };

    // ========================================================
    // FULL PAGE ERROR
    // ========================================================

    if (error) {

        return (
            <div className="
                min-h-screen
                bg-white
                flex
                items-center
                justify-center
                p-6
            ">

                <div className="
                    max-w-sm
                    w-full
                    bg-white
                    border
                    border-slate-200
                    rounded-2xl
                    p-8
                    shadow-lg
                ">

                    <ErrorState
                        message="The dashboard couldn't load. Please try again."
                        onRetry={load}
                    />

                </div>

            </div>
        );
    }

    const statistics =
        dashboardData?.statistics || {};

    // ========================================================
    // SAFE SOURCE ERRORS
    // ========================================================

    const safeSourceErrors =
        sourceErrors || {};

    // ========================================================
    // UI
    // ========================================================

    return (

        <div
            className="
                min-h-screen
                bg-white
                text-slate-800
                px-4
                py-5
                md:px-8
                md:py-8
            "
        >

            <div
                className="
                    max-w-[1600px]
                    mx-auto
                    space-y-8
                "
            >

                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <DashboardHeader
                    userName={getCurrentUserName()}
                    statistics={statistics}
                />

                {/* ================================================= */}
                {/* KPI CARDS */}
                {/* ================================================= */}

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        xl:grid-cols-4
                        gap-4
                    "
                >

                    {loading
                        ? KPI_DEFS.map((def) => (
                            <StatCardSkeleton
                                key={def.key}
                            />
                        ))

                        : KPI_DEFS.map((def) => (

                            <motion.div
                                key={def.key}
                                variants={fadeUp}
                            >

                                <AuditManagerStatCard
                                    icon={def.icon}
                                    label={def.label}
                                    value={
                                        typeof statistics?.[def.key] ===
                                        "object"
                                            ? getSafeString(
                                                statistics?.[def.key],
                                                "0"
                                            )
                                            : statistics?.[def.key] ?? 0
                                    }
                                    accent={def.accent}
                                />

                            </motion.div>

                        ))
                    }

                </motion.div>

                {/* ================================================= */}
                {/* AUDIT STATUS + PROGRESS */}
                {/* ================================================= */}

                <div
                    className="
                        grid
                        grid-cols-1
                        lg:grid-cols-2
                        gap-5
                    "
                >

                    <AuditStatusChart
                        data={dashboardData?.auditStatus || []}
                        loading={loading}
                        error={safeSourceErrors.audits}
                        onRetry={load}
                    />

                    <AuditProgressChart
                        data={dashboardData?.auditTrend || []}
                        loading={loading}
                        error={safeSourceErrors.audits}
                        onRetry={load}
                    />

                </div>

                {/* ================================================= */}
                {/* RISK + FINDINGS */}
                {/* ================================================= */}

                <div
                    className="
                        grid
                        grid-cols-1
                        lg:grid-cols-2
                        gap-5
                    "
                >

                    <RiskOverviewChart
                        data={
                            dashboardData?.riskDistribution || []
                        }
                        summary={
                            dashboardData?.riskSummary || {}
                        }
                        loading={loading}
                        error={safeSourceErrors.risks}
                        onRetry={load}
                    />

                    <FindingsSeverityChart
                        data={
                            dashboardData?.findingsSeverity || []
                        }
                        loading={loading}
                        error={
                            safeSourceErrors.findings
                        }
                        onRetry={load}
                    />

                </div>

                {/* ================================================= */}
                {/* DEPARTMENT + AUDITOR PERFORMANCE */}
                {/* ================================================= */}

                <div
                    className="
                        grid
                        grid-cols-1
                        lg:grid-cols-3
                        gap-5
                    "
                >

                    <DepartmentPerformanceChart
                        data={
                            dashboardData?.departmentPerformance || []
                        }
                        loading={loading}
                        error={
                            safeSourceErrors.audits
                        }
                        onRetry={load}
                    />

                    <AuditorPerformance
                        data={
                            dashboardData?.auditorPerformance || []
                        }
                        loading={loading}
                        error={
                            safeSourceErrors.audits
                        }
                        onRetry={load}
                    />

                </div>

                {/* ================================================= */}
                {/* PENDING REVIEWS + DEADLINES */}
                {/* ================================================= */}

                <div
                    className="
                        grid
                        grid-cols-1
                        lg:grid-cols-2
                        gap-5
                    "
                >

                    <PendingReviews
                        data={
                            dashboardData?.pendingReviews || []
                        }
                        loading={loading}
                        error={
                            safeSourceErrors.audits
                        }
                        onRetry={load}
                        onReview={(item) =>
                            console.log(
                                "Review audit:",
                                item
                            )
                        }
                        onViewDetails={(item) =>
                            console.log(
                                "View audit details:",
                                item
                            )
                        }
                    />

                    <UpcomingDeadlines
                        data={
                            dashboardData?.upcomingDeadlines || []
                        }
                        loading={loading}
                        error={
                            safeSourceErrors.audits
                        }
                        onRetry={load}
                    />

                </div>

                {/* ================================================= */}
                {/* RECENT ACTIVITY */}
                {/* ================================================= */}

                <RecentAuditActivity
                    data={
                        dashboardData?.recentActivities || []
                    }
                    loading={loading}
                    error={
                        safeSourceErrors.audits ||
                        safeSourceErrors.findings
                    }
                    onRetry={load}
                />

                {/* ================================================= */}
                {/* QUICK ACTIONS */}
                {/* ================================================= */}

                <QuickActions
                    onAction={handleQuickAction}
                />

            </div>

        </div>
    );
};

export default AuditManagerDashboard;
