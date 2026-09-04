import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
    FileText,
    FileEdit,
    CheckCircle2,
    XCircle,
    Loader2,
    Trophy,
    Eye,
    AlertTriangle,
    RefreshCw,
    Inbox,
    CheckCircle,
    X,
    Building2,
    CalendarDays,
    User,
    Hash,
} from "lucide-react";

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
    getAllPlans,
    updatePlanStatus,
} from "../../service/AnnualAuditPlanService";

import { useAuth } from "../../context/AuthContext";

import {
    EditableAnnualAuditPlanStatusBadge,
} from "../../components/cae/AnnualAuditPlanStatusBadge";

// =========================================================
// CONSTANTS
// =========================================================

const STATUS_ORDER = [
    "REJECTED",
    "COMPLETED",
];

const STATUS_COLORS = {
    REJECTED: "#f43f5e",
    COMPLETED: "#10b981",
};

// =========================================================
// TOAST
// =========================================================

function useToast() {
    const [toasts, setToasts] = useState([]);

    const push = useCallback((message, type = "success") => {
        const id = Date.now() + Math.random();

        setToasts((prev) => [
            ...prev,
            {
                id,
                message,
                type,
            },
        ]);

        setTimeout(() => {
            setToasts((prev) =>
                prev.filter((toast) => toast.id !== id)
            );
        }, 3500);
    }, []);

    const ToastHost = () => (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{
                            opacity: 0,
                            y: 20,
                            scale: 0.9,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            x: 60,
                            scale: 0.9,
                        }}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg min-w-[260px] bg-white ${
                            toast.type === "success"
                                ? "border-emerald-200 text-emerald-700"
                                : "border-rose-200 text-rose-700"
                        }`}
                    >
                        {toast.type === "success" ? (
                            <CheckCircle size={18} />
                        ) : (
                            <AlertTriangle size={18} />
                        )}

                        <span className="text-sm font-medium">
                            {toast.message}
                        </span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );

    return {
        push,
        ToastHost,
    };
}

// =========================================================
// SKELETON
// =========================================================

function CardSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 h-[128px] overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

            <div className="w-8 h-8 rounded-lg bg-slate-100 mb-4" />

            <div className="w-16 h-6 rounded bg-slate-100 mb-2" />

            <div className="w-24 h-3 rounded bg-slate-100" />
        </div>
    );
}

function TableSkeleton({ rows = 4 }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: rows }).map((_, index) => (
                <div
                    key={index}
                    className="h-12 rounded-lg bg-slate-50 border border-slate-100 animate-pulse"
                />
            ))}
        </div>
    );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
    title,
    value,
    icon: Icon,
    iconBg,
    description,
}) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let raf;

        const duration = 700;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min(
                (now - start) / duration,
                1
            );

            const eased =
                1 - Math.pow(1 - progress, 3);

            setDisplayValue(
                Math.round(value * eased)
            );

            if (progress < 1) {
                raf = requestAnimationFrame(tick);
            }
        };

        raf = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(raf);
    }, [value]);

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 24,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            whileHover={{
                y: -4,
                boxShadow:
                    "0 12px 24px -8px rgba(15,23,42,0.12)",
            }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
            <div
                className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-4 text-white`}
            >
                <Icon size={18} />
            </div>

            <div className="text-2xl font-bold text-slate-800">
                {displayValue}
            </div>

            <div className="text-sm font-semibold text-slate-700 mt-1">
                {title}
            </div>

            <div className="text-xs text-slate-400 mt-0.5">
                {description}
            </div>
        </motion.div>
    );
}

// =========================================================
// CHART CARD
// =========================================================

function ChartCard({
    title,
    subtitle,
    children,
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 24,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-800">
                    {title}
                </h3>

                {subtitle && (
                    <p className="text-xs text-slate-400 mt-0.5">
                        {subtitle}
                    </p>
                )}
            </div>

            {children}
        </motion.div>
    );
}

const chartTooltipStyle = {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "12px",
    color: "#1e293b",
    boxShadow:
        "0 4px 12px rgba(0,0,0,0.08)",
};

// =========================================================
// REJECT MODAL
// =========================================================

function RejectModal({
    plan,
    onClose,
    onConfirm,
    loading,
}) {
    const [reason, setReason] = useState("");
    const [touched, setTouched] = useState(false);

    const isEmpty =
        reason.trim().length === 0;

    return (
        <ModalShell onClose={onClose}>
            <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto mb-4">
                <XCircle
                    size={22}
                    className="text-rose-600"
                />
            </div>

            <h3 className="text-lg font-semibold text-slate-800 text-center">
                Reject Annual Audit Plan
            </h3>

            <p className="text-sm text-slate-500 text-center mt-2">
                <span className="text-slate-800 font-medium">
                    {plan?.planName}
                </span>{" "}
                will be marked as rejected.
            </p>

            <div className="mt-4">
                <label className="text-xs font-medium text-slate-600">
                    Reason for rejection *
                </label>

                <textarea
                    value={reason}
                    onChange={(e) =>
                        setReason(e.target.value)
                    }
                    onBlur={() =>
                        setTouched(true)
                    }
                    rows={3}
                    placeholder="Explain why this plan is being rejected..."
                    className={`mt-1.5 w-full rounded-xl bg-white border ${
                        touched && isEmpty
                            ? "border-rose-300"
                            : "border-slate-200"
                    } px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-rose-400 transition-colors resize-none`}
                />

                {touched && isEmpty && (
                    <p className="text-xs text-rose-500 mt-1">
                        Rejection reason is required.
                    </p>
                )}
            </div>

            <div className="flex gap-3 mt-6">
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                >
                    Cancel
                </button>

                <button
                    onClick={() => {
                        setTouched(true);

                        if (!isEmpty) {
                            onConfirm(
                                reason.trim()
                            );
                        }
                    }}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2
                            size={16}
                            className="animate-spin"
                        />
                    ) : (
                        "Reject Plan"
                    )}
                </button>
            </div>
        </ModalShell>
    );
}

// =========================================================
// MODAL SHELL
// =========================================================

function ModalShell({
    children,
    onClose,
    maxWidth = "max-w-sm",
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4"
        >
            <motion.div
                initial={{
                    opacity: 0,
                    scale: 0.92,
                    y: 12,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                }}
                exit={{
                    opacity: 0,
                    scale: 0.92,
                    y: 12,
                }}
                onClick={(e) =>
                    e.stopPropagation()
                }
                className={`w-full ${maxWidth} rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl relative`}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-300 hover:text-slate-600"
                >
                    <X size={16} />
                </button>

                {children}
            </motion.div>
        </motion.div>
    );
}

// =========================================================
// VIEW PLAN MODAL
// =========================================================

function ViewPlanModal({
    plan,
    onClose,
}) {
    if (!plan) return null;

    // Department is an ENTITY.
    // Supports:
    // department: "IT"
    // department: { name: "IT" }
    // department: { departmentName: "IT" }
    // department: { id: 1, name: "IT" }

    const departmentName =
        typeof plan.department === "object"
            ? plan.department?.name ||
              plan.department?.departmentName ||
              plan.department?.departmentCode ||
              plan.department?.code ||
              "—"
            : plan.department || "—";

    const departmentId =
        typeof plan.department === "object"
            ? plan.department?.id ||
              plan.department?.departmentId ||
              "—"
            : "—";

    return (
        <ModalShell
            onClose={onClose}
            maxWidth="max-w-2xl"
        >
            <div className="pr-5">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                        <FileText
                            size={20}
                            className="text-teal-600"
                        />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            Audit Plan Details
                        </h2>

                        <p className="text-xs text-slate-400">
                            Complete annual audit plan information
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Plan ID */}
                    <DetailItem
                        icon={Hash}
                        label="Plan ID"
                        value={
                            plan.planId || "—"
                        }
                    />

                    {/* Plan Name */}
                    <DetailItem
                        icon={FileText}
                        label="Plan Name"
                        value={
                            plan.planName || "—"
                        }
                    />

                    {/* Year */}
                    <DetailItem
                        icon={CalendarDays}
                        label="Plan Year"
                        value={
                            plan.planYear || "—"
                        }
                    />

                    {/* Department Entity */}
                    <DetailItem
                        icon={Building2}
                        label="Department"
                        value={departmentName}
                        secondary={
                            departmentId !== "—"
                                ? `Department ID: ${departmentId}`
                                : null
                        }
                    />

                    {/* Audit Manager */}
                    <DetailItem
                        icon={User}
                        label="Audit Manager"
                        value={
                            plan.auditManagerName ||
                            plan.auditManager?.name ||
                            plan.auditManager?.firstName ||
                            "—"
                        }
                    />

                    {/* Status */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs text-slate-400 mb-2">
                            Status
                        </p>

                        <span
                            className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold ${
                                plan.status ===
                                "REJECTED"
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-emerald-100 text-emerald-700"
                            }`}
                        >
                            {plan.status}
                        </span>
                    </div>

                    {/* Created Date */}
                    <DetailItem
                        icon={CalendarDays}
                        label="Created Date"
                        value={
                            plan.createdAt
                                ? new Date(
                                      plan.createdAt
                                  ).toLocaleDateString()
                                : "—"
                        }
                    />

                    {/* Updated Date */}
                    <DetailItem
                        icon={CalendarDays}
                        label="Updated Date"
                        value={
                            plan.updatedAt
                                ? new Date(
                                      plan.updatedAt
                                  ).toLocaleDateString()
                                : "—"
                        }
                    />
                </div>

                {/* Description */}
                {(plan.description ||
                    plan.objective ||
                    plan.scope) && (
                    <div className="mt-5 space-y-3">
                        {plan.description && (
                            <div className="rounded-xl border border-slate-200 p-4">
                                <p className="text-xs font-semibold text-slate-500 mb-1">
                                    Description
                                </p>

                                <p className="text-sm text-slate-700 leading-6">
                                    {
                                        plan.description
                                    }
                                </p>
                            </div>
                        )}

                        {plan.objective && (
                            <div className="rounded-xl border border-slate-200 p-4">
                                <p className="text-xs font-semibold text-slate-500 mb-1">
                                    Objective
                                </p>

                                <p className="text-sm text-slate-700 leading-6">
                                    {
                                        plan.objective
                                    }
                                </p>
                            </div>
                        )}

                        {plan.scope && (
                            <div className="rounded-xl border border-slate-200 p-4">
                                <p className="text-xs font-semibold text-slate-500 mb-1">
                                    Scope
                                </p>

                                <p className="text-sm text-slate-700 leading-6">
                                    {plan.scope}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Entity raw details */}
                {typeof plan.department ===
                    "object" && (
                    <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Building2
                                size={15}
                                className="text-teal-600"
                            />

                            <p className="text-xs font-semibold text-slate-600">
                                Department Entity
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            {Object.entries(
                                plan.department
                            ).map(
                                ([key, value]) => (
                                    <div
                                        key={key}
                                        className="bg-white rounded-lg border border-slate-100 p-2.5"
                                    >
                                        <p className="text-slate-400">
                                            {key}
                                        </p>

                                        <p className="text-slate-700 font-medium mt-0.5 break-words">
                                            {typeof value ===
                                            "object"
                                                ? JSON.stringify(
                                                      value
                                                  )
                                                : String(
                                                      value ??
                                                          "—"
                                                  )}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900"
                    >
                        Close
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

// =========================================================
// DETAIL ITEM
// =========================================================

function DetailItem({
    icon: Icon,
    label,
    value,
    secondary,
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
                <Icon
                    size={14}
                    className="text-teal-600"
                />

                <p className="text-xs text-slate-400">
                    {label}
                </p>
            </div>

            <p className="text-sm font-semibold text-slate-800 break-words">
                {value}
            </p>

            {secondary && (
                <p className="text-[11px] text-slate-400 mt-1">
                    {secondary}
                </p>
            )}
        </div>
    );
}

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function CAEAnnualAuditPlanDashboard() {
    const { user } = useAuth();

    const role = user?.role;

    const isCAE =
        role === "CHIEF_AUDIT_EXECUTIVE";

    const [plans, setPlans] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(false);

    const [rejectTarget, setRejectTarget] =
        useState(null);

    const [viewTarget, setViewTarget] =
        useState(null);

    const [actionLoading, setActionLoading] =
        useState(false);

    const [editingId, setEditingId] =
        useState(null);

    const {
        push,
        ToastHost,
    } = useToast();

    // =========================================================
    // FETCH
    // =========================================================

    const fetchPlans = useCallback(
        async () => {
            setLoading(true);
            setError(false);

            try {
                const data =
                    await getAllPlans();

                const result = Array.isArray(
                    data
                )
                    ? data
                    : data?.data || [];

                setPlans(result);
            } catch (err) {
                console.error(
                    "Failed to load annual audit plans:",
                    err
                );

                setError(true);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    // =========================================================
    // ONLY REJECTED + COMPLETED
    // =========================================================

    const filteredPlans = useMemo(() => {
        return plans.filter(
            (plan) =>
                plan.status === "REJECTED" ||
                plan.status === "COMPLETED"
        );
    }, [plans]);

    // =========================================================
    // COUNTS
    // =========================================================

    const counts = useMemo(() => {
        return {
            TOTAL: filteredPlans.length,

            REJECTED:
                filteredPlans.filter(
                    (p) =>
                        p.status ===
                        "REJECTED"
                ).length,

            COMPLETED:
                filteredPlans.filter(
                    (p) =>
                        p.status ===
                        "COMPLETED"
                ).length,
        };
    }, [filteredPlans]);

    // =========================================================
    // DEPARTMENTS
    // =========================================================

    const departmentSummary =
        useMemo(() => {
            const map = {};

            filteredPlans.forEach(
                (plan) => {
                    const department =
                        plan.department;

                    let name = "Unknown Department";

                    if (
                        typeof department ===
                        "object"
                    ) {
                        name =
                            department?.name ||
                            department?.departmentName ||
                            department?.departmentCode ||
                            department?.code ||
                            "Unknown Department";
                    } else if (
                        department
                    ) {
                        name = department;
                    }

                    if (!map[name]) {
                        map[name] = {
                            name,
                            count: 0,
                        };
                    }

                    map[name].count += 1;
                }
            );

            return Object.values(map);
        }, [filteredPlans]);

    // =========================================================
    // PIE DATA
    // =========================================================

    const pieData = useMemo(() => {
        return [
            {
                name: "Rejected",
                key: "REJECTED",
                value: counts.REJECTED,
            },
            {
                name: "Completed",
                key: "COMPLETED",
                value: counts.COMPLETED,
            },
        ].filter(
            (item) => item.value > 0
        );
    }, [counts]);

    // =========================================================
    // YEARLY TREND
    // =========================================================

    const yearlyTrend = useMemo(() => {
        const map = {};

        filteredPlans.forEach((plan) => {
            if (!plan.planYear) return;

            map[plan.planYear] =
                (map[plan.planYear] || 0) +
                1;
        });

        return Object.keys(map)
            .sort()
            .map((year) => ({
                year,
                count: map[year],
            }));
    }, [filteredPlans]);

    // =========================================================
    // REJECT
    // =========================================================

    const handleReject = async (
        reason
    ) => {
        if (!rejectTarget) return;

        setActionLoading(true);

        try {
            await updatePlanStatus(
                rejectTarget.id,
                "REJECTED",
                reason
            );

            push(
                `"${rejectTarget.planName}" rejected successfully.`,
                "success"
            );

            setRejectTarget(null);

            await fetchPlans();
        } catch (err) {
            push(
                err?.response?.data
                    ?.message ||
                    "Failed to reject the plan.",
                "error"
            );
        } finally {
            setActionLoading(false);
        }
    };

    // =========================================================
    // INLINE STATUS
    // =========================================================

    const handleInlineStatusChange =
        async (plan, newStatus) => {
            if (
                newStatus ===
                "REJECTED"
            ) {
                setRejectTarget(plan);
                return;
            }

            setEditingId(plan.id);

            try {
                await updatePlanStatus(
                    plan.id,
                    newStatus
                );

                push(
                    `"${plan.planName}" moved to ${newStatus.replace(
                        "_",
                        " "
                    )}.`,
                    "success"
                );

                await fetchPlans();
            } catch (err) {
                push(
                    err?.response?.data
                        ?.message ||
                        "Failed to update status.",
                    "error"
                );
            } finally {
                setEditingId(null);
            }
        };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-8">

            <ToastHost />

            {/* HEADER */}
            <motion.div
                initial={{
                    opacity: 0,
                    y: -12,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                className="mb-8"
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            Annual Audit Plans
                            {isCAE &&
                                " — CAE Dashboard"}
                        </h1>

                        <p className="text-sm text-slate-500 mt-1">
                            View audit plans across
                            all departments with
                            completed and rejected
                            status.
                        </p>
                    </div>

                    <button
                        onClick={fetchPlans}
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 shadow-sm"
                    >
                        <RefreshCw
                            size={15}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>
                </div>
            </motion.div>

            {/* ERROR */}
            {error &&
                !loading && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center mb-8">
                        <AlertTriangle
                            className="mx-auto text-rose-500 mb-3"
                            size={28}
                        />

                        <p className="text-slate-700 font-medium">
                            Failed to load annual
                            audit plans
                        </p>

                        <button
                            onClick={fetchPlans}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-100 border border-rose-200 text-rose-700 text-sm font-medium"
                        >
                            <RefreshCw size={14} />
                            Retry
                        </button>
                    </div>
                )}

            {!error && (
                <>
                    {/* ================================================= */}
                    {/* STAT CARDS */}
                    {/* ================================================= */}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

                        {loading ? (
                            Array.from({
                                length: 3,
                            }).map((_, i) => (
                                <CardSkeleton
                                    key={i}
                                />
                            ))
                        ) : (
                            <>
                                <StatCard
                                    title="Total Audits"
                                    value={
                                        counts.TOTAL
                                    }
                                    icon={FileText}
                                    iconBg="bg-teal-500"
                                    description="Completed + rejected audits"
                                />

                                <StatCard
                                    title="Rejected"
                                    value={
                                        counts.REJECTED
                                    }
                                    icon={XCircle}
                                    iconBg="bg-rose-500"
                                    description="Rejected audit plans"
                                />

                                <StatCard
                                    title="Completed"
                                    value={
                                        counts.COMPLETED
                                    }
                                    icon={Trophy}
                                    iconBg="bg-emerald-500"
                                    description="Successfully completed audits"
                                />
                            </>
                        )}
                    </div>

                    {/* ================================================= */}
                    {/* CHARTS */}
                    {/* ================================================= */}

                    {!loading && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

                            {/* STATUS */}
                            <ChartCard
                                title="Audit Status"
                                subtitle="Rejected vs completed"
                            >
                                <ResponsiveContainer
                                    width="100%"
                                    height={220}
                                >
                                    <PieChart>
                                        <Pie
                                            data={
                                                pieData
                                            }
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={
                                                55
                                            }
                                            outerRadius={
                                                80
                                            }
                                            paddingAngle={
                                                3
                                            }
                                        >
                                            {pieData.map(
                                                (
                                                    entry
                                                ) => (
                                                    <Cell
                                                        key={
                                                            entry.key
                                                        }
                                                        fill={
                                                            STATUS_COLORS[
                                                                entry
                                                                    .key
                                                            ]
                                                        }
                                                        stroke="#fff"
                                                        strokeWidth={
                                                            2
                                                        }
                                                    />
                                                )
                                            )}
                                        </Pie>

                                        <Tooltip
                                            contentStyle={
                                                chartTooltipStyle
                                            }
                                        />

                                        <Legend
                                            wrapperStyle={{
                                                fontSize:
                                                    "11px",
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            {/* YEAR */}
                            <ChartCard
                                title="Audit Plan Trend"
                                subtitle="Plans by year"
                            >
                                <ResponsiveContainer
                                    width="100%"
                                    height={220}
                                >
                                    <BarChart
                                        data={
                                            yearlyTrend
                                        }
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f1f5f9"
                                        />

                                        <XAxis
                                            dataKey="year"
                                            tick={{
                                                fill: "#64748b",
                                                fontSize: 11,
                                            }}
                                        />

                                        <YAxis
                                            allowDecimals={
                                                false
                                            }
                                            tick={{
                                                fill: "#64748b",
                                                fontSize: 11,
                                            }}
                                        />

                                        <Tooltip
                                            contentStyle={
                                                chartTooltipStyle
                                            }
                                        />

                                        <Bar
                                            dataKey="count"
                                            fill="#14b8a6"
                                            radius={[
                                                6,
                                                6,
                                                0,
                                                0,
                                            ]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            {/* DEPARTMENT */}
                            <ChartCard
                                title="Department Audits"
                                subtitle="Audits across all departments"
                            >
                                <ResponsiveContainer
                                    width="100%"
                                    height={220}
                                >
                                    <BarChart
                                        data={
                                            departmentSummary
                                        }
                                        layout="vertical"
                                    >
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f1f5f9"
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={
                                                false
                                            }
                                            tick={{
                                                fill: "#64748b",
                                                fontSize: 11,
                                            }}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            width={110}
                                            tick={{
                                                fill: "#64748b",
                                                fontSize: 10,
                                            }}
                                        />

                                        <Tooltip
                                            contentStyle={
                                                chartTooltipStyle
                                            }
                                        />

                                        <Bar
                                            dataKey="count"
                                            fill="#0d9488"
                                            radius={[
                                                0,
                                                6,
                                                6,
                                                0,
                                            ]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                    )}

                    {/* ================================================= */}
                    {/* ALL DEPARTMENT AUDITS */}
                    {/* ================================================= */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 24,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-5">

                            <div className="flex items-center gap-2">
                                <Building2
                                    size={17}
                                    className="text-teal-600"
                                />

                                <h3 className="text-sm font-semibold text-slate-800">
                                    All Department Audits
                                </h3>

                                {!loading && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                        {
                                            filteredPlans.length
                                        }
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                                <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                                    Rejected:{" "}
                                    {
                                        counts.REJECTED
                                    }
                                </span>

                                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                                    Completed:{" "}
                                    {
                                        counts.COMPLETED
                                    }
                                </span>
                            </div>
                        </div>

                        {loading ? (
                            <TableSkeleton
                                rows={6}
                            />
                        ) : filteredPlans.length ===
                          0 ? (
                            <div className="text-center py-12">
                                <Inbox
                                    className="mx-auto text-slate-300 mb-3"
                                    size={32}
                                />

                                <p className="text-sm font-medium text-slate-600">
                                    No rejected or
                                    completed audits
                                    found.
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                    Audit plans from all
                                    departments will
                                    appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">

                                    <thead>
                                        <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-slate-100">

                                            <th className="pb-3 font-medium">
                                                Plan ID
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Audit Plan
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Year
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Department
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Audit Manager
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Status
                                            </th>

                                            <th className="pb-3 font-medium">
                                                Updated
                                            </th>

                                            <th className="pb-3 font-medium text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        <AnimatePresence>
                                            {filteredPlans.map(
                                                (
                                                    plan,
                                                    index
                                                ) => {

                                                    const department =
                                                        plan.department;

                                                    const departmentName =
                                                        typeof department ===
                                                        "object"
                                                            ? department?.name ||
                                                              department?.departmentName ||
                                                              department?.departmentCode ||
                                                              department?.code ||
                                                              "—"
                                                            : department ||
                                                              "—";

                                                    return (
                                                        <motion.tr
                                                            key={
                                                                plan.id
                                                            }
                                                            initial={{
                                                                opacity: 0,
                                                                y: 8,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            transition={{
                                                                delay:
                                                                    index *
                                                                    0.025,
                                                            }}
                                                            className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                                                        >

                                                            {/* PLAN ID */}
                                                            <td className="py-3 text-slate-500 font-mono text-xs">
                                                                {
                                                                    plan.planId
                                                                }
                                                            </td>

                                                            {/* PLAN NAME */}
                                                            <td className="py-3">
                                                                <div>
                                                                    <p className="text-slate-800 font-medium">
                                                                        {
                                                                            plan.planName
                                                                        }
                                                                    </p>

                                                                    {plan.description && (
                                                                        <p className="text-xs text-slate-400 mt-0.5 max-w-[240px] truncate">
                                                                            {
                                                                                plan.description
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </td>

                                                            {/* YEAR */}
                                                            <td className="py-3 text-slate-500">
                                                                {
                                                                    plan.planYear
                                                                }
                                                            </td>

                                                            {/* DEPARTMENT ENTITY */}
                                                            <td className="py-3">
                                                                <div className="flex items-center gap-2">

                                                                    <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center">
                                                                        <Building2
                                                                            size={
                                                                                14
                                                                            }
                                                                            className="text-teal-600"
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <p className="text-slate-700 font-medium">
                                                                            {
                                                                                departmentName
                                                                            }
                                                                        </p>

                                                                        {typeof department ===
                                                                            "object" &&
                                                                            department?.id && (
                                                                                <p className="text-[10px] text-slate-400">
                                                                                    ID:{" "}
                                                                                    {
                                                                                        department.id
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* MANAGER */}
                                                            <td className="py-3 text-slate-500">
                                                                {plan.auditManagerName ||
                                                                    plan.auditManager?.name ||
                                                                    plan.auditManager?.firstName ||
                                                                    "—"}
                                                            </td>

                                                            {/* STATUS */}
                                                            <td className="py-3">

                                                                {plan.status ===
                                                                "REJECTED" ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                                                                        <XCircle
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                        Rejected
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                                                                        <CheckCircle2
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                        Completed
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* UPDATED */}
                                                            <td className="py-3 text-slate-500">
                                                                {plan.updatedAt
                                                                    ? new Date(
                                                                          plan.updatedAt
                                                                      ).toLocaleDateString()
                                                                    : plan.createdAt
                                                                    ? new Date(
                                                                          plan.createdAt
                                                                      ).toLocaleDateString()
                                                                    : "—"}
                                                            </td>

                                                            {/* ACTIONS */}
                                                            <td className="py-3">
                                                                <div className="flex items-center justify-end gap-2">

                                                                    {/* VIEW BUTTON */}
                                                                    <button
                                                                        onClick={() =>
                                                                            setViewTarget(
                                                                                plan
                                                                            )
                                                                        }
                                                                        title="View Audit Plan"
                                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-teal-700 hover:border-teal-200 hover:bg-teal-50 transition-colors text-xs font-medium"
                                                                    >
                                                                        <Eye
                                                                            size={
                                                                                14
                                                                            }
                                                                        />

                                                                        View
                                                                    </button>

                                                                    {/* REJECT */}
                                                                    {isCAE &&
                                                                        plan.status !==
                                                                            "REJECTED" && (
                                                                            <button
                                                                                onClick={() =>
                                                                                    setRejectTarget(
                                                                                        plan
                                                                                    )
                                                                                }
                                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors text-xs font-medium"
                                                                            >
                                                                                <XCircle
                                                                                    size={
                                                                                        13
                                                                                    }
                                                                                />

                                                                                Reject
                                                                            </button>
                                                                        )}
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                }
                                            )}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                </>
            )}

            {/* ================================================= */}
            {/* VIEW MODAL */}
            {/* ================================================= */}

            <AnimatePresence>
                {viewTarget && (
                    <ViewPlanModal
                        plan={viewTarget}
                        onClose={() =>
                            setViewTarget(null)
                        }
                    />
                )}
            </AnimatePresence>

            {/* ================================================= */}
            {/* REJECT MODAL */}
            {/* ================================================= */}

            <AnimatePresence>
                {rejectTarget && (
                    <RejectModal
                        plan={rejectTarget}
                        onClose={() =>
                            !actionLoading &&
                            setRejectTarget(null)
                        }
                        onConfirm={
                            handleReject
                        }
                        loading={
                            actionLoading
                        }
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
