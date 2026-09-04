
import React from "react";
import { motion } from "framer-motion";
import {
    Eye,
    ClipboardCheck,
    ShieldAlert,
    FilePlus2,
    UserPlus,
    FileSearch,
    ListChecks,
    FileBarChart2,
    UserCheck,
    FileText,
    UploadCloud,
    CheckCircle2,
    ClipboardEdit,
    Clock3,
} from "lucide-react";

import { glassPanel, palette, statusColor } from "./Theme";
import { useNavigate } from "react-router-dom";
import {
    ListSkeleton,
    TimelineSkeleton,
    SectionState,
} from "./DashboardStates";

// ============================================================
// STATUS BADGE
// ============================================================

const Badge = ({ status }) => {
    const color = statusColor(status);

    return (
        <span
            className="
                inline-flex
                items-center
                gap-1.5
                px-2
                py-0.5
                rounded-full
                text-[10px]
                font-semibold
                border
            "
            style={{
                color,
                borderColor: `${color}40`,
                backgroundColor: `${color}12`,
            }}
        >
            <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                    backgroundColor: color,
                }}
            />

            {String(status ?? "-").replace(/_/g, " ")}
        </span>
    );
};

// ============================================================
// AUDITOR PERFORMANCE
// ============================================================

const performanceColor = (status) => {
    if (status === "Excellent") {
        return palette.low;
    }

    if (status === "Needs Attention") {
        return palette.critical;
    }

    return palette.accentLine;
};

export const AuditorPerformance = ({
    data,
    loading,
    error,
    onRetry,
}) => (
    <div className={`${glassPanel} p-5`}>

        <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800">
                Auditor Performance
            </h3>

            <p className="text-xs text-slate-500 mt-0.5">
                Workload and completion by auditor
            </p>
        </div>

        <SectionState
            loading={loading}
            error={error}
            isEmpty={
                !loading &&
                !error &&
                (data || []).length === 0
            }
            onRetry={onRetry}
            skeleton={<ListSkeleton rows={3} />}
            emptyTitle="No auditor activity yet"
            emptyIcon={UserCheck}
        >

            <div className="space-y-4">

                {(data || [])
                    .slice(0, 6)
                    .map((auditor, i) => (

                        <motion.div
                            key={auditor.auditorName}
                            initial={{
                                opacity: 0,
                                x: -8,
                            }}
                            animate={{
                                opacity: 1,
                                x: 0,
                            }}
                            transition={{
                                delay: i * 0.05,
                            }}
                        >

                            <div className="
                                flex
                                items-center
                                justify-between
                                mb-1.5
                            ">

                                <div className="
                                    flex
                                    items-center
                                    gap-2
                                    min-w-0
                                ">

                                    <div className="
                                        w-7
                                        h-7
                                        rounded-full
                                        bg-teal-50
                                        border
                                        border-teal-100
                                        flex
                                        items-center
                                        justify-center
                                        text-[10px]
                                        font-bold
                                        text-teal-700
                                        shrink-0
                                    ">
                                        {auditor.auditorName?.charAt(0) ?? "?"}
                                    </div>

                                    <span className="
                                        text-sm
                                        font-medium
                                        text-slate-700
                                        truncate
                                    ">
                                        {auditor.auditorName}
                                    </span>

                                </div>

                                <span
                                    className="
                                        text-[10px]
                                        font-semibold
                                        shrink-0
                                        ml-2
                                    "
                                    style={{
                                        color: performanceColor(
                                            auditor.performanceStatus
                                        ),
                                    }}
                                >
                                    {auditor.performanceStatus}
                                </span>

                            </div>

                            {/* PROGRESS */}

                            <div className="
                                h-1.5
                                rounded-full
                                bg-slate-100
                                overflow-hidden
                            ">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{
                                        backgroundColor:
                                            performanceColor(
                                                auditor.performanceStatus
                                            ),
                                    }}
                                    initial={{
                                        width: 0,
                                    }}
                                    animate={{
                                        width: `${auditor.completionRate}%`,
                                    }}
                                    transition={{
                                        duration: 0.7,
                                        ease: "easeOut",
                                    }}
                                />
                            </div>

                            <div className="
                                flex
                                items-center
                                justify-between
                                mt-1.5
                                text-[11px]
                                text-slate-400
                            ">
                                <span>
                                    {auditor.completed}/
                                    {auditor.assigned}
                                    {" "}completed
                                </span>

                                <span>
                                    {auditor.findingsIdentified}
                                    {" "}findings ·{" "}
                                    {auditor.completionRate}%
                                </span>
                            </div>

                        </motion.div>
                    ))}

            </div>

        </SectionState>

    </div>
);

// ============================================================
// PENDING REVIEWS
// ============================================================

export const PendingReviews = ({
    data,
    loading,
    error,
    onRetry,
    onReview,
    onViewDetails,
}) => (
    <div className={`${glassPanel} p-5`}>

        <div className="
            mb-4
            flex
            items-center
            justify-between
        ">

            <div>
                <h3 className="
                    text-sm
                    font-bold
                    text-slate-800
                ">
                    Pending Reviews
                </h3>

                <p className="
                    text-xs
                    text-slate-500
                    mt-0.5
                ">
                    Audits awaiting your review
                </p>
            </div>

            {(data || []).length > 0 && (
                <span className="
                    text-[11px]
                    font-semibold
                    text-slate-600
                    bg-slate-100
                    border
                    border-slate-200
                    px-2
                    py-1
                    rounded-lg
                ">
                    {data.length} pending
                </span>
            )}

        </div>

        <SectionState
            loading={loading}
            error={error}
            isEmpty={
                !loading &&
                !error &&
                (data || []).length === 0
            }
            onRetry={onRetry}
            skeleton={<ListSkeleton rows={3} />}
            emptyTitle="Great! No pending reviews."
            emptyIcon={ClipboardCheck}
        >

            <div className="space-y-2">

                {(data || [])
                    .slice(0, 6)
                    .map((review, i) => (

                        <motion.div
                            key={
                                review.auditDbId ?? i
                            }
                            initial={{
                                opacity: 0,
                                y: 6,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: i * 0.04,
                            }}
                            whileHover={{
                                x: 2,
                            }}
                            className="
                                flex
                                items-center
                                justify-between
                                gap-3
                                rounded-xl
                                border
                                border-slate-200
                                bg-slate-50/60
                                hover:bg-white
                                px-3
                                py-2.5
                                transition
                            "
                        >

                            <div className="min-w-0">

                                <div className="
                                    flex
                                    items-center
                                    gap-2
                                ">

                                    <span className="
                                        text-[11px]
                                        font-bold
                                        text-slate-500
                                    ">
                                        {review.auditCode}
                                    </span>

                                    <Badge
                                        status={
                                            review.status
                                        }
                                    />

                                </div>

                                <p className="
                                    text-sm
                                    text-slate-700
                                    font-medium
                                    truncate
                                    mt-0.5
                                ">
                                    {review.auditTitle}
                                </p>

                                <p className="
                                    text-[11px]
                                    text-slate-400
                                    mt-0.5
                                ">
                                    {review.auditorName ??
                                        "Unassigned"}
                                    {" · "}
                                    {review.department}
                                    {" · "}
                                    {review.findingsCount}
                                    {" "}findings
                                </p>

                            </div>

                            <div className="
                                flex
                                items-center
                                gap-1.5
                                shrink-0
                            ">

                                <button
                                    type="button"
                                    onClick={() =>
                                        onReview?.(review)
                                    }
                                    className="
                                        px-2.5
                                        py-1.5
                                        rounded-lg
                                        bg-teal-50
                                        border
                                        border-teal-100
                                        text-teal-700
                                        text-[11px]
                                        font-semibold
                                        hover:bg-teal-100
                                        transition
                                    "
                                >
                                    Review
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onViewDetails?.(
                                            review
                                        )
                                    }
                                    className="
                                        p-1.5
                                        rounded-lg
                                        bg-white
                                        border
                                        border-slate-200
                                        text-slate-500
                                        hover:text-teal-700
                                        hover:border-teal-200
                                        hover:bg-teal-50
                                        transition
                                    "
                                >
                                    <Eye className="
                                        w-3.5
                                        h-3.5
                                    " />
                                </button>

                            </div>

                        </motion.div>
                    ))}

            </div>

        </SectionState>

    </div>
);

// ============================================================
// UPCOMING DEADLINES
// ============================================================

const urgencyMeta = {
    overdue: {
        label: "Overdue",
        color: palette.critical,
    },

    "due-soon": {
        label: "Due Soon",
        color: palette.high,
    },

    approaching: {
        label: "Approaching",
        color: palette.medium,
    },

    normal: {
        label: "Normal",
        color: palette.textFaint,
    },
};

export const UpcomingDeadlines = ({
    data,
    loading,
    error,
    onRetry,
}) => (
    <div className={`${glassPanel} p-5`}>

        <div className="mb-4">
            <h3 className="
                text-sm
                font-bold
                text-slate-800
            ">
                Upcoming Deadlines
            </h3>

            <p className="
                text-xs
                text-slate-500
                mt-0.5
            ">
                Next audits due
            </p>
        </div>

        <SectionState
            loading={loading}
            error={error}
            isEmpty={
                !loading &&
                !error &&
                (data || []).length === 0
            }
            onRetry={onRetry}
            skeleton={<ListSkeleton rows={3} />}
            emptyTitle="No upcoming deadlines."
            emptyIcon={Clock3}
        >

            <div className="space-y-2">

                {(data || []).map((item, i) => {

                    const meta =
                        urgencyMeta[item.urgency] ??
                        urgencyMeta.normal;

                    const isUrgent =
                        item.urgency === "overdue" ||
                        item.urgency === "due-soon";

                    return (
                        <motion.div
                            key={
                                item.auditDbId ?? i
                            }
                            initial={{
                                opacity: 0,
                                y: 6,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: i * 0.04,
                            }}
                            className="
                                flex
                                items-center
                                justify-between
                                gap-3
                                rounded-xl
                                border
                                px-3
                                py-2.5
                            "
                            style={{
                                borderColor: isUrgent
                                    ? `${meta.color}35`
                                    : "#E2E8F0",

                                backgroundColor: isUrgent
                                    ? `${meta.color}08`
                                    : "#F8FAFC",
                            }}
                        >

                            <div className="min-w-0">

                                <p className="
                                    text-sm
                                    text-slate-700
                                    font-medium
                                    truncate
                                ">
                                    {item.auditTitle}
                                </p>

                                <p className="
                                    text-[11px]
                                    text-slate-400
                                    mt-0.5
                                ">
                                    {item.auditCode}
                                    {" · "}
                                    {item.department}
                                </p>

                            </div>

                            <div className="
                                text-right
                                shrink-0
                            ">

                                <span
                                    className="
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        tracking-wide
                                    "
                                    style={{
                                        color: meta.color,
                                    }}
                                >
                                    {meta.label}
                                </span>

                                <p className="
                                    text-xs
                                    text-slate-500
                                    mt-0.5
                                ">
                                    {item.remainingDays < 0
                                        ? `${Math.abs(
                                            item.remainingDays
                                        )}d overdue`
                                        : `${item.remainingDays}d left`}
                                </p>

                            </div>

                        </motion.div>
                    );
                })}

            </div>

        </SectionState>

    </div>
);

// ============================================================
// RECENT AUDIT ACTIVITY
// ============================================================

const activityIcon = (type) => {

    switch (type) {

        case "audit-assigned":
            return UserPlus;

        case "audit-completed":
            return CheckCircle2;

        case "finding-created":
            return ShieldAlert;

        case "evidence-submitted":
            return UploadCloud;

        default:
            return FileText;
    }
};

const formatTimestamp = (ts) => {

    if (!ts) {
        return "";
    }

    const date = new Date(ts);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString(
        undefined,
        {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }
    );
};

export const RecentAuditActivity = ({
    data,
    loading,
    error,
    onRetry,
}) => (
    <div className={`${glassPanel} p-5`}>

        <div className="mb-4">

            <h3 className="
                text-sm
                font-bold
                text-slate-800
            ">
                Recent Activity
            </h3>

            <p className="
                text-xs
                text-slate-500
                mt-0.5
            ">
                Latest movement across your audits
            </p>

        </div>

        <SectionState
            loading={loading}
            error={error}
            isEmpty={
                !loading &&
                !error &&
                (data || []).length === 0
            }
            onRetry={onRetry}
            skeleton={
                <TimelineSkeleton rows={5} />
            }
            emptyTitle="No recent activity"
            emptyIcon={ClipboardEdit}
        >

            <div className="
                relative
                pl-2
            ">

                {/* TIMELINE LINE */}

                <div className="
                    absolute
                    left-[19px]
                    top-1
                    bottom-1
                    w-px
                    bg-slate-200
                " />

                <div className="space-y-5">

                    {(data || []).map(
                        (event, i) => {

                            const Icon =
                                activityIcon(
                                    event.type
                                );

                            return (
                                <motion.div
                                    key={i}
                                    initial={{
                                        opacity: 0,
                                        x: -8,
                                    }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                    }}
                                    transition={{
                                        delay:
                                            i * 0.06,
                                    }}
                                    className="
                                        relative
                                        flex
                                        gap-3
                                    "
                                >

                                    {/* ICON */}

                                    <div className="
                                        w-8
                                        h-8
                                        rounded-full
                                        bg-teal-50
                                        border
                                        border-teal-100
                                        flex
                                        items-center
                                        justify-center
                                        shrink-0
                                        z-10
                                    ">
                                        <Icon className="
                                            w-3.5
                                            h-3.5
                                            text-teal-700
                                        " />
                                    </div>

                                    {/* CONTENT */}

                                    <div className="
                                        min-w-0
                                        pb-1
                                    ">

                                        <p className="
                                            text-sm
                                            text-slate-700
                                            leading-snug
                                        ">
                                            {event.description}
                                        </p>

                                        <div className="
                                            flex
                                            items-center
                                            gap-2
                                            mt-1
                                        ">

                                            <span className="
                                                text-[11px]
                                                text-slate-400
                                            ">
                                                {event.user}
                                            </span>

                                            <span className="
                                                text-slate-300
                                            ">
                                                ·
                                            </span>

                                            <span className="
                                                text-[11px]
                                                text-slate-400
                                            ">
                                                {formatTimestamp(
                                                    event.timestamp
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                </motion.div>
                            );
                        }
                    )}

                </div>

            </div>

        </SectionState>

    </div>
);

// ============================================================
// QUICK ACTIONS
// ============================================================

const quickActionDefs = [
    {
        key: "assignAuditor",
        label: "Assign Auditor",
        icon: UserPlus,
        path: "/audit-manager/auditor-assignment",
    },
    {
        key: "assignAuditee",
        label: "Assign Auditee",
        icon: FileSearch,
        path: "/audit-manager/auditee-assignment",
    },
    {
        key: "reviewFindings",
        label: "Review Findings",
        icon: ListChecks,
        path: "/audit-manager/findings",
    },
    {
        key: "viewRisks",
        label: "View Risks",
        icon: ShieldAlert,
        path: "/audit-manager/risk-management",
    },
    {
        key: "generateReport",
        label: "Generate Audit Report",
        icon: FileBarChart2,
        path: "/audit-manager/reports",
    },
];


export const QuickActions = ({ onAction }) => {
    const navigate = useNavigate();

    const handleAction = (action) => {
        onAction?.(action.key);

        if (action.path) {
            navigate(action.path);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
                Quick Actions
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {quickActionDefs.map(
                    ({ key, label, icon: Icon, path }, i) => (
                        <motion.button
                            key={key}
                            type="button"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{
                                y: -2,
                                scale: 1.015,
                            }}
                            whileTap={{
                                scale: 0.98,
                            }}
                            onClick={() =>
                                handleAction({
                                    key,
                                    path,
                                })
                            }
                            className="
                                flex
                                flex-col
                                items-start
                                gap-2.5
                                rounded-xl
                                border
                                border-slate-200
                                bg-slate-50
                                hover:bg-white
                                hover:border-teal-300
                                hover:shadow-md
                                transition-all
                                duration-200
                                p-3.5
                                text-left
                            "
                        >
                            {/* ICON */}
                            <div
                                className="
                                    w-9
                                    h-9
                                    rounded-xl
                                    bg-teal-50
                                    border
                                    border-teal-100
                                    text-teal-600
                                    flex
                                    items-center
                                    justify-center
                                "
                            >
                                <Icon className="w-4 h-4" />
                            </div>

                            {/* LABEL */}
                            <span
                                className="
                                    text-xs
                                    font-semibold
                                    text-slate-700
                                    leading-tight
                                "
                            >
                                {label}
                            </span>
                        </motion.button>
                    )
                )}
            </div>
        </div>
    );
};
