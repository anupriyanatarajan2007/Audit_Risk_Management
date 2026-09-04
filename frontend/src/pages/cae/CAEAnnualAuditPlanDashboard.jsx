import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
    FileText,
    FileEdit,
    Send,
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
    User,
    CalendarDays,
    Hash,
    Activity,
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

// ============================================================
// CONSTANTS
// ============================================================

const STATUS_ORDER = [
    "DRAFT",
    "SUBMITTED",
    "APPROVED",
    "REJECTED",
    "IN_PROGRESS",
    "COMPLETED",
];

const STATUS_COLORS = {
    DRAFT: "#64748b",
    SUBMITTED: "#f59e0b",
    APPROVED: "#10b981",
    REJECTED: "#f43f5e",
    IN_PROGRESS: "#06b6d4",
    COMPLETED: "#14b8a6",
};

const CARD_CONFIG = [
    {
        key: "TOTAL",
        label: "Total Plans",
        icon: FileText,
        accent: "from-teal-50 to-white",
        ring: "ring-teal-100",
        iconBg: "bg-teal-500",
        desc: "All annual audit plans",
    },
    {
        key: "DRAFT",
        label: "Draft",
        icon: FileEdit,
        accent: "from-slate-50 to-white",
        ring: "ring-slate-100",
        iconBg: "bg-slate-500",
        desc: "Not yet submitted",
    },
    {
        key: "SUBMITTED",
        label: "Submitted",
        icon: Send,
        accent: "from-amber-50 to-white",
        ring: "ring-amber-100",
        iconBg: "bg-amber-500",
        desc: "Awaiting CAE approval",
    },
    {
        key: "APPROVED",
        label: "Approved",
        icon: CheckCircle2,
        accent: "from-emerald-50 to-white",
        ring: "ring-emerald-100",
        iconBg: "bg-emerald-500",
        desc: "Approved by CAE",
    },
    {
        key: "REJECTED",
        label: "Rejected",
        icon: XCircle,
        accent: "from-rose-50 to-white",
        ring: "ring-rose-100",
        iconBg: "bg-rose-500",
        desc: "Returned to manager",
    },
    {
        key: "IN_PROGRESS",
        label: "In Progress",
        icon: Loader2,
        accent: "from-cyan-50 to-white",
        ring: "ring-cyan-100",
        iconBg: "bg-cyan-500",
        desc: "Audit execution underway",
    },
    {
        key: "COMPLETED",
        label: "Completed",
        icon: Trophy,
        accent: "from-teal-50 to-white",
        ring: "ring-teal-100",
        iconBg: "bg-teal-600",
        desc: "Fully executed plans",
    },
];

// ============================================================
// HELPERS
// ============================================================

const normalizeStatus = (status) => {
    if (!status) return "DRAFT";

    if (typeof status === "object") {
        status =
            status.status ||
            status.value ||
            status.name ||
            "";
    }

    return String(status)
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");
};

const getDepartmentName = (department) => {
    if (!department) return "—";

    if (typeof department === "object") {
        return department.name || "—";
    }

    return department;
};

const getDepartmentId = (department) => {
    if (!department) return null;

    if (typeof department === "object") {
        return department.id ?? null;
    }

    return department;
};

const getManagerName = (manager) => {
    if (!manager) return "—";

    if (typeof manager === "object") {
        if (manager.name) return manager.name;

        return (
            [manager.firstName, manager.lastName]
                .filter(Boolean)
                .join(" ") || "—"
        );
    }

    return manager;
};

const formatDate = (date) => {
    if (!date) return "—";

    try {
        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "—";
        }

        return parsed.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "—";
    }
};

const formatDateTime = (date) => {
    if (!date) return "—";

    try {
        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "—";
        }

        return parsed.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "—";
    }
};

const formatStatus = (status) =>
    normalizeStatus(status).replace(/_/g, " ");

// ============================================================
// TOAST
// ============================================================

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
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
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
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg min-w-[280px] bg-white ${
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

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
    const normalized = normalizeStatus(status);

    const config = {
        DRAFT: {
            bg: "bg-slate-100",
            text: "text-slate-700",
            border: "border-slate-200",
            dot: "bg-slate-500",
        },
        SUBMITTED: {
            bg: "bg-amber-50",
            text: "text-amber-700",
            border: "border-amber-200",
            dot: "bg-amber-500",
        },
        APPROVED: {
            bg: "bg-emerald-50",
            text: "text-emerald-700",
            border: "border-emerald-200",
            dot: "bg-emerald-500",
        },
        REJECTED: {
            bg: "bg-rose-50",
            text: "text-rose-700",
            border: "border-rose-200",
            dot: "bg-rose-500",
        },
        IN_PROGRESS: {
            bg: "bg-cyan-50",
            text: "text-cyan-700",
            border: "border-cyan-200",
            dot: "bg-cyan-500",
        },
        COMPLETED: {
            bg: "bg-teal-50",
            text: "text-teal-700",
            border: "border-teal-200",
            dot: "bg-teal-500",
        },
    };

    const style = config[normalized] || config.DRAFT;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${style.bg} ${style.text} ${style.border}`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
            />

            {formatStatus(normalized)}
        </span>
    );
}

// ============================================================
// SKELETON
// ============================================================

function CardSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 h-[128px] animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-slate-100 mb-4" />
            <div className="w-16 h-6 rounded bg-slate-100 mb-2" />
            <div className="w-28 h-3 rounded bg-slate-100" />
        </div>
    );
}

function TableSkeleton({ rows = 5 }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, index) => (
                <div
                    key={index}
                    className="h-14 rounded-xl bg-slate-50 border border-slate-100 animate-pulse"
                />
            ))}
        </div>
    );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({ config, value, index }) {
    const Icon = config.icon;

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
            transition={{
                duration: 0.4,
                delay: index * 0.06,
            }}
            whileHover={{
                y: -4,
                boxShadow:
                    "0 12px 24px -8px rgba(15,23,42,0.12)",
            }}
            className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${config.accent} p-5 ring-1 ${config.ring}`}
        >
            <div
                className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center mb-4 text-white`}
            >
                <Icon size={18} />
            </div>

            <div className="text-2xl font-bold text-slate-800">
                {displayValue}
            </div>

            <div className="text-sm font-medium text-slate-700 mt-1">
                {config.label}
            </div>

            <div className="text-xs text-slate-400 mt-0.5">
                {config.desc}
            </div>
        </motion.div>
    );
}

// ============================================================
// CHART CARD
// ============================================================

function ChartCard({
    title,
    subtitle,
    children,
    delay = 0,
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
            transition={{
                duration: 0.45,
                delay,
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
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

// ============================================================
// MODAL SHELL
// ============================================================

function ModalShell({
    children,
    onClose,
    maxWidth = "max-w-md",
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
            <motion.div
                initial={{
                    opacity: 0,
                    scale: 0.94,
                    y: 15,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                }}
                exit={{
                    opacity: 0,
                    scale: 0.94,
                    y: 15,
                }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl relative`}
            >
                {children}
            </motion.div>
        </motion.div>
    );
}

// ============================================================
// VIEW MODAL
// ============================================================

function ViewPlanModal({ plan, onClose }) {
    if (!plan) return null;

    return (
        <ModalShell
            onClose={onClose}
            maxWidth="max-w-3xl"
        >
            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-5 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                            <FileText
                                size={19}
                                className="text-teal-600"
                            />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-800">
                                Annual Audit Plan Details
                            </h2>

                            <p className="text-xs text-slate-400 mt-0.5">
                                {plan.planId || "—"}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
                >
                    <X size={18} />
                </button>
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-800">
                            Plan Overview
                        </h3>

                        <StatusBadge status={plan.status} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem
                            icon={Hash}
                            label="Plan ID"
                            value={plan.planId}
                        />

                        <InfoItem
                            icon={FileText}
                            label="Plan Name"
                            value={plan.planName}
                        />

                        <InfoItem
                            icon={CalendarDays}
                            label="Plan Year"
                            value={plan.planYear}
                        />

                        <InfoItem
                            icon={Building2}
                            label="Department"
                            value={getDepartmentName(
                                plan.department
                            )}
                        />

                        <InfoItem
                            icon={User}
                            label="Audit Manager"
                            value={getManagerName(
                                plan.auditManagerName
                            )}
                        />

                        <InfoItem
                            icon={Activity}
                            label="Current Status"
                            value={formatStatus(
                                plan.status
                            )}
                        />
                    </div>
                </div>

                {plan.description && (
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-2">
                            Description
                        </h3>

                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-600 leading-6">
                            {plan.description}
                        </div>
                    </div>
                )}

                <div>
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">
                        Audit Plan Timeline
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <DateBox
                            label="Created"
                            value={formatDateTime(
                                plan.createdAt
                            )}
                        />

                        <DateBox
                            label="Updated"
                            value={formatDateTime(
                                plan.updatedAt
                            )}
                        />

                        <DateBox
                            label="Plan Year"
                            value={plan.planYear || "—"}
                        />
                    </div>
                </div>

                {plan.department && (
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-3">
                            Department Information
                        </h3>

                        <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-teal-100 flex items-center justify-center">
                                    <Building2
                                        size={18}
                                        className="text-teal-600"
                                    />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-slate-800">
                                        {getDepartmentName(
                                            plan.department
                                        )}
                                    </p>

                                    {getDepartmentId(
                                        plan.department
                                    ) && (
                                        <p className="text-xs text-slate-400">
                                            Department ID:{" "}
                                            {getDepartmentId(
                                                plan.department
                                            )}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-2 mb-1">
                <Icon
                    size={13}
                    className="text-teal-600"
                />

                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
                    {label}
                </span>
            </div>

            <p className="text-sm font-semibold text-slate-700 break-words">
                {value || "—"}
            </p>
        </div>
    );
}

// ============================================================
// DATE BOX
// ============================================================

function DateBox({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-100 bg-white p-3">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                {label}
            </p>

            <p className="text-sm font-medium text-slate-700 mt-1">
                {value}
            </p>
        </div>
    );
}

// ============================================================
// APPROVE MODAL
// ============================================================

function ApproveModal({
    plan,
    onClose,
    onConfirm,
    loading,
}) {
    return (
        <ModalShell onClose={onClose}>
            <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2
                        size={22}
                        className="text-emerald-600"
                    />
                </div>

                <h3 className="text-lg font-semibold text-slate-800 text-center">
                    Approve Annual Audit Plan?
                </h3>

                <p className="text-sm text-slate-500 text-center mt-2 leading-6">
                    Are you sure you want to approve{" "}
                    <span className="font-semibold text-slate-800">
                        {plan.planName}
                    </span>
                    ?
                </p>

                <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                    <p className="text-xs text-emerald-700 leading-5">
                        After CAE approval, the Audit Manager
                        can move the plan to{" "}
                        <strong>IN PROGRESS</strong>.
                    </p>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                                Approving...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={16} />
                                Approve
                            </>
                        )}
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

// ============================================================
// COMPLETE MODAL
// ============================================================

function CompleteModal({
    plan,
    onClose,
    onConfirm,
    loading,
}) {
    return (
        <ModalShell onClose={onClose}>
            <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto mb-4">
                    <Trophy
                        size={22}
                        className="text-teal-600"
                    />
                </div>

                <h3 className="text-lg font-semibold text-slate-800 text-center">
                    Complete Annual Audit Plan?
                </h3>

                <p className="text-sm text-slate-500 text-center mt-2 leading-6">
                    Mark{" "}
                    <span className="font-semibold text-slate-800">
                        {plan.planName}
                    </span>{" "}
                    as completed?
                </p>

                <div className="mt-4 rounded-xl bg-teal-50 border border-teal-100 p-4">
                    <p className="text-xs text-teal-700 leading-5">
                        This action is available only for
                        plans currently in{" "}
                        <strong>IN PROGRESS</strong>.
                    </p>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                                Completing...
                            </>
                        ) : (
                            <>
                                <Trophy size={16} />
                                Complete
                            </>
                        )}
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

// ============================================================
// REJECT MODAL
// ============================================================

function RejectModal({
    plan,
    onClose,
    onConfirm,
    loading,
}) {
    const [reason, setReason] = useState("");
    const [touched, setTouched] = useState(false);

    const isEmpty = reason.trim().length === 0;

    return (
        <ModalShell onClose={onClose}>
            <div className="p-6">
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
                    This plan will be sent back to the Audit
                    Manager.
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
                        rows={4}
                        placeholder="Enter rejection reason..."
                        className={`mt-1.5 w-full rounded-xl bg-white border ${
                            touched && isEmpty
                                ? "border-rose-300"
                                : "border-slate-200"
                        } px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-rose-400 resize-none`}
                    />

                    {touched && isEmpty && (
                        <p className="text-xs text-rose-500 mt-1">
                            Rejection reason is required.
                        </p>
                    )}
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setTouched(true);

                            if (!isEmpty) {
                                onConfirm(reason.trim());
                            }
                        }}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                                Rejecting...
                            </>
                        ) : (
                            <>
                                <XCircle size={16} />
                                Reject Plan
                            </>
                        )}
                    </button>
                </div>
            </div>
        </ModalShell>
    );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function CAEAnnualAuditPlanDashboard() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [selectedDepartment, setSelectedDepartment] =
        useState("ALL");

    const [viewTarget, setViewTarget] =
        useState(null);

    const [approveTarget, setApproveTarget] =
        useState(null);

    const [rejectTarget, setRejectTarget] =
        useState(null);

    const [completeTarget, setCompleteTarget] =
        useState(null);

    const [actionLoading, setActionLoading] =
        useState(false);

    const { push, ToastHost } = useToast();

    // ========================================================
    // FETCH PLANS
    // ========================================================

    const fetchPlans = useCallback(async () => {
        setLoading(true);
        setError(false);

        try {
            const response = await getAllPlans();

            console.log(
                "CAE ANNUAL AUDIT PLANS:",
                response
            );

            let data = [];

            if (Array.isArray(response)) {
                data = response;
            } else if (
                Array.isArray(response?.data)
            ) {
                data = response.data;
            } else if (
                Array.isArray(response?.data?.data)
            ) {
                data = response.data.data;
            }

            setPlans(data);
        } catch (err) {
            console.error(
                "Failed to load annual audit plans:",
                err
            );

            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    // ========================================================
    // DEPARTMENTS
    // ========================================================

    const departments = useMemo(() => {
        const map = new Map();

        plans.forEach((plan) => {
            const department = plan?.department;

            if (!department) return;

            if (typeof department === "object") {
                const id = department.id;
                const name = department.name;

                if (
                    id !== undefined &&
                    id !== null
                ) {
                    map.set(String(id), {
                        id: String(id),
                        name:
                            name ||
                            `Department ${id}`,
                    });
                }
            } else {
                map.set(String(department), {
                    id: String(department),
                    name: String(department),
                });
            }
        });

        return Array.from(map.values()).sort(
            (a, b) =>
                a.name.localeCompare(b.name)
        );
    }, [plans]);

    // ========================================================
    // COUNTS
    // ========================================================

    const counts = useMemo(() => {
        const result = {
            TOTAL: plans.length,
            DRAFT: 0,
            SUBMITTED: 0,
            APPROVED: 0,
            REJECTED: 0,
            IN_PROGRESS: 0,
            COMPLETED: 0,
        };

        plans.forEach((plan) => {
            const status = normalizeStatus(
                plan?.status
            );

            if (
                Object.prototype.hasOwnProperty.call(
                    result,
                    status
                )
            ) {
                result[status]++;
            }
        });

        return result;
    }, [plans]);

    // ========================================================
    // FILTER
    // ========================================================

    const filteredPlans = useMemo(() => {
        if (selectedDepartment === "ALL") {
            return plans;
        }

        return plans.filter((plan) => {
            const id = getDepartmentId(
                plan?.department
            );

            return (
                String(id) ===
                String(selectedDepartment)
            );
        });
    }, [plans, selectedDepartment]);

    // ========================================================
    // SUBMITTED PLANS
    // ========================================================

    const pendingPlans = useMemo(
        () =>
            filteredPlans.filter(
                (plan) =>
                    normalizeStatus(
                        plan?.status
                    ) === "SUBMITTED"
            ),
        [filteredPlans]
    );

    // ========================================================
    // IN PROGRESS PLANS
    // ========================================================

    const inProgressPlans = useMemo(
        () =>
            filteredPlans.filter(
                (plan) =>
                    normalizeStatus(
                        plan?.status
                    ) === "IN_PROGRESS"
            ),
        [filteredPlans]
    );

    // ========================================================
    // PIE DATA
    // ========================================================

    const pieData = useMemo(
        () =>
            STATUS_ORDER.map((status) => ({
                name: formatStatus(status),
                key: status,
                value: counts[status],
            })).filter(
                (item) => item.value > 0
            ),
        [counts]
    );

    // ========================================================
    // YEAR TREND
    // ========================================================

    const yearlyTrend = useMemo(() => {
        const map = {};

        plans.forEach((plan) => {
            if (!plan?.planYear) return;

            map[plan.planYear] =
                (map[plan.planYear] || 0) + 1;
        });

        return Object.keys(map)
            .sort()
            .map((year) => ({
                year,
                count: map[year],
            }));
    }, [plans]);

    // ========================================================
    // APPROVAL WORKLOAD
    // ========================================================

    const approvalWorkload = useMemo(
        () => [
            {
                name: "Submitted",
                value: counts.SUBMITTED,
                fill: STATUS_COLORS.SUBMITTED,
            },
            {
                name: "Approved",
                value: counts.APPROVED,
                fill: STATUS_COLORS.APPROVED,
            },
            {
                name: "In Progress",
                value: counts.IN_PROGRESS,
                fill: STATUS_COLORS.IN_PROGRESS,
            },
            {
                name: "Completed",
                value: counts.COMPLETED,
                fill: STATUS_COLORS.COMPLETED,
            },
            {
                name: "Rejected",
                value: counts.REJECTED,
                fill: STATUS_COLORS.REJECTED,
            },
        ],
        [counts]
    );

    // ========================================================
    // APPROVE
    // ========================================================

    const handleApprove = async () => {
        if (!approveTarget) return;

        if (
            normalizeStatus(
                approveTarget.status
            ) !== "SUBMITTED"
        ) {
            push(
                "Only submitted plans can be approved.",
                "error"
            );
            return;
        }

        setActionLoading(true);

        try {
            console.log(
                "Approving plan:",
                approveTarget.id
            );

            await updatePlanStatus(
                approveTarget.id,
                "APPROVED"
            );

            push(
                `"${approveTarget.planName}" approved successfully.`,
                "success"
            );

            setApproveTarget(null);

            await fetchPlans();
        } catch (err) {
            console.error(
                "Approve failed:",
                err
            );

            push(
                err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    "Failed to approve the plan.",
                "error"
            );
        } finally {
            setActionLoading(false);
        }
    };

    // ========================================================
    // REJECT
    // ========================================================

    const handleReject = async (reason) => {
        if (!rejectTarget) return;

        if (
            normalizeStatus(
                rejectTarget.status
            ) !== "SUBMITTED"
        ) {
            push(
                "Only submitted plans can be rejected.",
                "error"
            );
            return;
        }

        setActionLoading(true);

        try {
            console.log(
                "Rejecting plan:",
                rejectTarget.id,
                reason
            );

            await updatePlanStatus(
                rejectTarget.id,
                "REJECTED",
                reason
            );

            push(
                `"${rejectTarget.planName}" rejected.`,
                "success"
            );

            setRejectTarget(null);

            await fetchPlans();
        } catch (err) {
            console.error(
                "Reject failed:",
                err
            );

            push(
                err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    "Failed to reject the plan.",
                "error"
            );
        } finally {
            setActionLoading(false);
        }
    };

    // ========================================================
    // COMPLETE
    // ========================================================

    const handleComplete = async () => {
        if (!completeTarget) return;

        if (
            normalizeStatus(
                completeTarget.status
            ) !== "IN_PROGRESS"
        ) {
            push(
                "Only in-progress plans can be completed.",
                "error"
            );
            return;
        }

        setActionLoading(true);

        try {
            console.log(
                "Completing plan:",
                completeTarget.id
            );

            await updatePlanStatus(
                completeTarget.id,
                "COMPLETED"
            );

            push(
                `"${completeTarget.planName}" marked as completed.`,
                "success"
            );

            setCompleteTarget(null);

            await fetchPlans();
        } catch (err) {
            console.error(
                "Complete failed:",
                err
            );

            push(
                err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    "Failed to complete the plan.",
                "error"
            );
        } finally {
            setActionLoading(false);
        }
    };

    // ========================================================
    // ACTION BUTTONS
    // IMPORTANT:
    // THIS COMPONENT IS CAE ONLY
    // ========================================================

    const ActionButtons = ({ plan }) => {
        const status = normalizeStatus(
            plan?.status
        );

        return (
            <div className="flex items-center justify-end gap-2 whitespace-nowrap">

                {/* ==================================================
                    VIEW - ALWAYS AVAILABLE
                ================================================== */}

                <button
                    type="button"
                    onClick={() =>
                        setViewTarget(plan)
                    }
                    title="View Annual Audit Plan"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-teal-700 hover:border-teal-300 hover:bg-teal-50 transition-all text-xs font-semibold shadow-sm"
                >
                    <Eye size={14} />
                    View
                </button>

                {/* ==================================================
                    SUBMITTED
                    CAE CAN APPROVE OR REJECT
                ================================================== */}

                {status === "SUBMITTED" && (
                    <>
                        <button
                            type="button"
                            onClick={() =>
                                setApproveTarget(
                                    plan
                                )
                            }
                            title="Approve Annual Audit Plan"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-semibold shadow-sm"
                        >
                            <CheckCircle2
                                size={14}
                            />
                            Approve
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setRejectTarget(
                                    plan
                                )
                            }
                            title="Reject Annual Audit Plan"
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all text-xs font-semibold shadow-sm"
                        >
                            <XCircle
                                size={14}
                            />
                            Reject
                        </button>
                    </>
                )}

                {/* ==================================================
                    IN_PROGRESS
                    CAE CAN COMPLETE
                ================================================== */}

                {status === "IN_PROGRESS" && (
                    <button
                        type="button"
                        onClick={() =>
                            setCompleteTarget(
                                plan
                            )
                        }
                        title="Complete Annual Audit Plan"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-all text-xs font-semibold shadow-sm"
                    >
                        <Trophy size={14} />
                        Complete
                    </button>
                )}
            </div>
        );
    };

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-8">

            <ToastHost />

            {/* ==================================================
                HEADER
            ================================================== */}

            <motion.div
                initial={{
                    opacity: 0,
                    y: -12,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.4,
                }}
                className="mb-8"
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                    <div>
                        <div className="flex items-center gap-3">

                            <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
                                <FileText size={21} />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">
                                    Annual Audit Plan
                                </h1>

                                <p className="text-sm text-slate-500 mt-1">
                                    CAE Dashboard
                                </p>
                            </div>
                        </div>

                        <p className="text-sm text-slate-500 mt-3">
                            Review submitted plans, approve or
                            reject them, and complete plans
                            after audit execution.
                        </p>
                    </div>

                    {!loading && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-teal-100 shadow-sm">

                            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                                <Building2
                                    size={18}
                                    className="text-teal-600"
                                />
                            </div>

                            <div>
                                <p className="text-[11px] text-slate-400">
                                    Departments
                                </p>

                                <p className="text-sm font-semibold text-slate-700">
                                    {departments.length}{" "}
                                    Departments
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && !loading && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center mb-8">

                    <AlertTriangle
                        className="mx-auto text-rose-500 mb-3"
                        size={28}
                    />

                    <p className="text-slate-700 font-medium">
                        Failed to load annual audit plans
                    </p>

                    <button
                        type="button"
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
                    {/* ==================================================
                        STAT CARDS
                    ================================================== */}

                    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">

                        {loading
                            ? Array.from({
                                  length: 7,
                              }).map((_, index) => (
                                  <CardSkeleton
                                      key={index}
                                  />
                              ))
                            : CARD_CONFIG.map(
                                  (
                                      config,
                                      index
                                  ) => (
                                      <StatCard
                                          key={
                                              config.key
                                          }
                                          config={
                                              config
                                          }
                                          value={
                                              counts[
                                                  config.key
                                              ]
                                          }
                                          index={
                                              index
                                          }
                                      />
                                  )
                              )}
                    </div>

                    {/* ==================================================
                        CHARTS
                    ================================================== */}

                    {!loading && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

                            {/* STATUS DISTRIBUTION */}

                            <ChartCard
                                title="Status Distribution"
                                subtitle="Annual audit plan status"
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

                            {/* YEAR TREND */}

                            <ChartCard
                                title="Annual Plan Trend"
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

                            {/* EXECUTION WORKLOAD */}

                            <ChartCard
                                title="Execution Workload"
                                subtitle="Current plan lifecycle"
                            >
                                <ResponsiveContainer
                                    width="100%"
                                    height={220}
                                >
                                    <BarChart
                                        data={
                                            approvalWorkload
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
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            width={75}
                                        />

                                        <Tooltip
                                            contentStyle={
                                                chartTooltipStyle
                                            }
                                        />

                                        <Bar
                                            dataKey="value"
                                            radius={[
                                                0,
                                                6,
                                                6,
                                                0,
                                            ]}
                                        >
                                            {approvalWorkload.map(
                                                (
                                                    entry,
                                                    index
                                                ) => (
                                                    <Cell
                                                        key={
                                                            index
                                                        }
                                                        fill={
                                                            entry.fill
                                                        }
                                                    />
                                                )
                                            )}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>
                    )}

                    {/* ==================================================
                        SUBMITTED FOR APPROVAL
                    ================================================== */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 24,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 mb-8"
                    >

                        <div className="flex items-center gap-2 mb-4">

                            <Send
                                size={16}
                                className="text-amber-600"
                            />

                            <h3 className="text-sm font-semibold text-slate-800">
                                Plans Awaiting CAE Approval
                            </h3>

                            {!loading && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                                    {pendingPlans.length}
                                </span>
                            )}
                        </div>

                        {loading ? (
                            <TableSkeleton rows={3} />
                        ) : pendingPlans.length === 0 ? (
                            <div className="text-center py-10">

                                <Inbox
                                    className="mx-auto text-slate-300 mb-3"
                                    size={30}
                                />

                                <p className="text-sm text-slate-400">
                                    No plans are waiting for CAE
                                    approval.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">

                                <table className="w-full text-sm min-w-[1200px]">

                                    <thead>
                                        <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">

                                            <th className="pb-3">
                                                Plan ID
                                            </th>

                                            <th className="pb-3">
                                                Plan Name
                                            </th>

                                            <th className="pb-3">
                                                Year
                                            </th>

                                            <th className="pb-3">
                                                Department
                                            </th>

                                            <th className="pb-3">
                                                Audit Manager
                                            </th>

                                            <th className="pb-3">
                                                Status
                                            </th>

                                            <th className="pb-3 text-right">
                                                Actions
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody>

                                        {pendingPlans.map(
                                            (
                                                plan,
                                                index
                                            ) => (
                                                <motion.tr
                                                    key={
                                                        plan.id
                                                    }
                                                    initial={{
                                                        opacity: 0,
                                                        y: 10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    transition={{
                                                        delay:
                                                            index *
                                                            0.04,
                                                    }}
                                                    className="border-t border-amber-100 hover:bg-amber-50 transition-colors"
                                                >

                                                    <td className="py-4 font-mono text-xs text-slate-500">
                                                        {
                                                            plan.planId
                                                        }
                                                    </td>

                                                    <td className="py-4 font-semibold text-slate-800">
                                                        {
                                                            plan.planName
                                                        }
                                                    </td>

                                                    <td className="py-4 text-slate-500">
                                                        {
                                                            plan.planYear
                                                        }
                                                    </td>

                                                    <td className="py-4">

                                                        <div className="flex items-center gap-2">

                                                            <Building2
                                                                size={
                                                                    14
                                                                }
                                                                className="text-teal-600"
                                                            />

                                                            <span className="text-slate-700">
                                                                {getDepartmentName(
                                                                    plan.department
                                                                )}
                                                            </span>

                                                        </div>

                                                    </td>

                                                    <td className="py-4 text-slate-500">
                                                        {getManagerName(
                                                            plan.auditManagerName
                                                        )}
                                                    </td>

                                                    <td className="py-4">
                                                        <StatusBadge
                                                            status={
                                                                plan.status
                                                            }
                                                        />
                                                    </td>

                                                    <td className="py-4">
                                                        <ActionButtons
                                                            plan={
                                                                plan
                                                            }
                                                        />
                                                    </td>

                                                </motion.tr>
                                            )
                                        )}

                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>

                    {/* ==================================================
                        IN PROGRESS
                    ================================================== */}

                    {!loading &&
                        inProgressPlans.length >
                            0 && (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 20,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                className="rounded-2xl border border-cyan-200 bg-cyan-50/40 p-5 mb-8"
                            >

                                <div className="flex items-center gap-2 mb-4">

                                    <Activity
                                        size={16}
                                        className="text-cyan-600"
                                    />

                                    <h3 className="text-sm font-semibold text-slate-800">
                                        Plans Currently In Progress
                                    </h3>

                                    <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 font-semibold">
                                        {
                                            inProgressPlans.length
                                        }
                                    </span>

                                </div>

                                <div className="overflow-x-auto">

                                    <table className="w-full text-sm min-w-[1100px]">

                                        <thead>
                                            <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">

                                                <th className="pb-3">
                                                    Plan ID
                                                </th>

                                                <th className="pb-3">
                                                    Plan Name
                                                </th>

                                                <th className="pb-3">
                                                    Department
                                                </th>

                                                <th className="pb-3">
                                                    Manager
                                                </th>

                                                <th className="pb-3">
                                                    Status
                                                </th>

                                                <th className="pb-3 text-right">
                                                    Actions
                                                </th>

                                            </tr>
                                        </thead>

                                        <tbody>

                                            {inProgressPlans.map(
                                                (
                                                    plan
                                                ) => (
                                                    <tr
                                                        key={
                                                            plan.id
                                                        }
                                                        className="border-t border-cyan-100 hover:bg-cyan-50 transition-colors"
                                                    >

                                                        <td className="py-4 font-mono text-xs text-slate-500">
                                                            {
                                                                plan.planId
                                                            }
                                                        </td>

                                                        <td className="py-4 font-semibold text-slate-800">
                                                            {
                                                                plan.planName
                                                            }
                                                        </td>

                                                        <td className="py-4 text-slate-600">
                                                            {getDepartmentName(
                                                                plan.department
                                                            )}
                                                        </td>

                                                        <td className="py-4 text-slate-500">
                                                            {getManagerName(
                                                                plan.auditManagerName
                                                            )}
                                                        </td>

                                                        <td className="py-4">
                                                            <StatusBadge
                                                                status={
                                                                    plan.status
                                                                }
                                                            />
                                                        </td>

                                                        <td className="py-4">
                                                            <ActionButtons
                                                                plan={
                                                                    plan
                                                                }
                                                            />
                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                    {/* ==================================================
                        ALL PLANS
                    ================================================== */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 24,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.2,
                        }}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >

                        {/* HEADER */}

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">

                            <div className="flex items-center gap-2">

                                <FileText
                                    size={16}
                                    className="text-teal-600"
                                />

                                <h3 className="text-sm font-semibold text-slate-800">
                                    All Annual Audit Plans
                                </h3>

                                {!loading && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                        {
                                            filteredPlans.length
                                        }
                                    </span>
                                )}

                            </div>

                            {!loading && (
                                <div className="flex items-center gap-2">

                                    <label className="text-xs font-medium text-slate-500">
                                        Department
                                    </label>

                                    <select
                                        value={
                                            selectedDepartment
                                        }
                                        onChange={(e) =>
                                            setSelectedDepartment(
                                                e.target
                                                    .value
                                            )
                                        }
                                        className="min-w-[220px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                                    >
                                        <option value="ALL">
                                            All Departments
                                        </option>

                                        {departments.map(
                                            (
                                                department
                                            ) => (
                                                <option
                                                    key={
                                                        department.id
                                                    }
                                                    value={
                                                        department.id
                                                    }
                                                >
                                                    {
                                                        department.name
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* TABLE */}

                        {loading ? (
                            <TableSkeleton rows={6} />
                        ) : filteredPlans.length ===
                          0 ? (
                            <div className="text-center py-12">

                                <Inbox
                                    className="mx-auto text-slate-300 mb-3"
                                    size={32}
                                />

                                <p className="text-sm text-slate-400">
                                    No annual audit plans
                                    found.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">

                                <table className="w-full text-sm min-w-[1300px]">

                                    <thead>
                                        <tr className="text-left text-slate-400 text-xs uppercase tracking-wide">

                                            <th className="pb-3">
                                                Plan ID
                                            </th>

                                            <th className="pb-3">
                                                Plan Name
                                            </th>

                                            <th className="pb-3">
                                                Year
                                            </th>

                                            <th className="pb-3">
                                                Department
                                            </th>

                                            <th className="pb-3">
                                                Audit Manager
                                            </th>

                                            <th className="pb-3">
                                                Status
                                            </th>

                                            <th className="pb-3">
                                                Updated
                                            </th>

                                            <th className="pb-3 text-right">
                                                Actions
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody>

                                        {filteredPlans.map(
                                            (
                                                plan,
                                                index
                                            ) => (
                                                <motion.tr
                                                    key={
                                                        plan.id
                                                    }
                                                    initial={{
                                                        opacity: 0,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                    }}
                                                    transition={{
                                                        delay: Math.min(
                                                            index *
                                                                0.02,
                                                            0.4
                                                        ),
                                                    }}
                                                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                                                >

                                                    <td className="py-4 font-mono text-xs text-slate-500">
                                                        {
                                                            plan.planId
                                                        }
                                                    </td>

                                                    <td className="py-4 font-semibold text-slate-800">
                                                        {
                                                            plan.planName
                                                        }
                                                    </td>

                                                    <td className="py-4 text-slate-500">
                                                        {
                                                            plan.planYear
                                                        }
                                                    </td>

                                                    <td className="py-4">

                                                        <div className="flex items-center gap-2">

                                                            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                                                                <Building2
                                                                    size={
                                                                        14
                                                                    }
                                                                    className="text-teal-600"
                                                                />
                                                            </div>

                                                            <span className="text-slate-700 font-medium">
                                                                {getDepartmentName(
                                                                    plan.department
                                                                )}
                                                            </span>

                                                        </div>

                                                    </td>

                                                    <td className="py-4 text-slate-500">
                                                        {getManagerName(
                                                            plan.auditManagerName
                                                        )}
                                                    </td>

                                                    <td className="py-4">
                                                        <StatusBadge
                                                            status={
                                                                plan.status
                                                            }
                                                        />
                                                    </td>

                                                    <td className="py-4 text-slate-500">
                                                        {formatDate(
                                                            plan.updatedAt
                                                        )}
                                                    </td>

                                                    <td className="py-4">
                                                        <ActionButtons
                                                            plan={
                                                                plan
                                                            }
                                                        />
                                                    </td>

                                                </motion.tr>
                                            )
                                        )}

                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                </>
            )}

            {/* ========================================================
                MODALS
            ======================================================== */}

            <AnimatePresence>

                {viewTarget && (
                    <ViewPlanModal
                        plan={viewTarget}
                        onClose={() =>
                            setViewTarget(null)
                        }
                    />
                )}

                {approveTarget && (
                    <ApproveModal
                        plan={approveTarget}
                        onClose={() =>
                            !actionLoading &&
                            setApproveTarget(null)
                        }
                        onConfirm={handleApprove}
                        loading={actionLoading}
                    />
                )}

                {rejectTarget && (
                    <RejectModal
                        plan={rejectTarget}
                        onClose={() =>
                            !actionLoading &&
                            setRejectTarget(null)
                        }
                        onConfirm={handleReject}
                        loading={actionLoading}
                    />
                )}

                {completeTarget && (
                    <CompleteModal
                        plan={completeTarget}
                        onClose={() =>
                            !actionLoading &&
                            setCompleteTarget(null)
                        }
                        onConfirm={handleComplete}
                        loading={actionLoading}
                    />
                )}

            </AnimatePresence>
        </div>
    );
}