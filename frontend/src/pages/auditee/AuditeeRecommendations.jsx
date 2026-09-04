// AuditeeRecommendations.jsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ClipboardList,
    Clock,
    CheckCircle2,
    FolderKanban,
    Search,
    RefreshCw,
    X,
    Eye,
    Loader2,
    AlertCircle,
    ShieldCheck,
} from "lucide-react";

import {
    getMyAuditeeRecommendations,
    updateRecommendationStatus,
} from "../../service/recommendationService";
// ^ adjust path to match your actual service location

// ============================================================
// ANIMATION
// ============================================================

const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (index) => ({
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.08, duration: 0.35 },
    }),
};

const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: (index) => ({
        opacity: 1,
        y: 0,
        transition: { delay: index * 0.04, duration: 0.25 },
    }),
};

// ============================================================
// HELPERS
// ============================================================

const formatDate = (date) => {
    if (!date) return "-";
    try {
        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "-";
    }
};

const getStatusBadgeClass = (status) => {
    switch (status) {
        case "PENDING":
            return "bg-yellow-50 text-yellow-700 border-yellow-200";
        case "ACKNOWLEDGED":
            return "bg-green-50 text-green-700 border-green-200";
        default:
            return "bg-gray-50 text-gray-700 border-gray-200";
    }
};

// Handles both response.data.data and response.data shapes
const extractList = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const AuditeeRecommendations = () => {
    // ========================================================
    // STATE
    // ========================================================

    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [viewingRecommendation, setViewingRecommendation] = useState(null);
    const [confirmingId, setConfirmingId] = useState(null);
    const [acknowledging, setAcknowledging] = useState(false);
    const [toast, setToast] = useState("");
    const [actionError, setActionError] = useState("");

    // ========================================================
    // LOAD DATA
    // ========================================================

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getMyAuditeeRecommendations();
            const list = extractList(response);
            setRecommendations(list);
        } catch (err) {
            console.error(
                "Failed to load recommendations:",
                err.response?.data || err
            );
            setError(
                err.response?.data?.message ||
                    err.response?.data?.error ||
                    err.message ||
                    "Failed to load recommendations"
            );
        } finally {
            setLoading(false);
        }
    };

    // ========================================================
    // FILTERED LIST
    // ========================================================

    const filteredRows = useMemo(() => {
        return recommendations.filter((rec) => {
            const search = searchTerm.trim().toLowerCase();

            const matchesSearch =
                !search ||
                String(rec.recommendationId || "").toLowerCase().includes(search) ||
                String(rec.auditCode || rec.auditId || "")
                    .toLowerCase()
                    .includes(search) ||
                String(rec.findingTitle || "").toLowerCase().includes(search) ||
                String(rec.recommendationText || "")
                    .toLowerCase()
                    .includes(search);

            const matchesStatus =
                statusFilter === "ALL" || rec.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [recommendations, searchTerm, statusFilter]);

    // ========================================================
    // STATISTICS
    // ========================================================

    const totalRecommendations = recommendations.length;

    const pendingCount = recommendations.filter(
        (rec) => rec.status === "PENDING"
    ).length;

    const acknowledgedCount = recommendations.filter(
        (rec) => rec.status === "ACKNOWLEDGED"
    ).length;

    const totalAudits = useMemo(() => {
        const uniqueAuditIds = new Set(
            recommendations.map((rec) => rec.auditId).filter(Boolean)
        );
        return uniqueAuditIds.size;
    }, [recommendations]);

    // ========================================================
    // RESET FILTERS
    // ========================================================

    const resetFilters = () => {
        setSearchTerm("");
        setStatusFilter("ALL");
    };

    // ========================================================
    // ACKNOWLEDGE RECOMMENDATION
    // ========================================================

    const handleAcknowledge = async (id) => {
        setAcknowledging(true);
        setActionError("");

        try {
            await updateRecommendationStatus(id, "ACKNOWLEDGED");
            setConfirmingId(null);
            setToast("Recommendation acknowledged successfully");
            await loadData();
            setTimeout(() => setToast(""), 3000);
        } catch (err) {
            console.error(
                "Failed to acknowledge recommendation:",
                err.response?.data || err
            );
            setActionError(
                err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Unable to acknowledge recommendation. Please try again."
            );
        } finally {
            setAcknowledging(false);
        }
    };

    // ========================================================
    // UI
    // ========================================================

    return (
        <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-[#f7f9fb] p-6"
        >
            {/* ==================================================
                HEADER
            ================================================== */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center">
                        <ShieldCheck size={22} className="text-teal-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Recommendations
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Review and acknowledge recommendations from your auditor
                        </p>
                    </div>
                </div>
            </div>

            {/* ==================================================
                ERROR BANNER
            ================================================== */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between"
                    >
                        <span>{error}</span>
                        <button onClick={() => setError("")} className="ml-4">
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ==================================================
                STAT CARDS
            ================================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    {
                        label: "Total Recommendations",
                        value: totalRecommendations,
                        icon: ClipboardList,
                        bg: "bg-teal-50",
                        iconColor: "text-teal-600",
                    },
                    {
                        label: "Pending",
                        value: pendingCount,
                        icon: Clock,
                        bg: "bg-yellow-50",
                        iconColor: "text-yellow-600",
                    },
                    {
                        label: "Acknowledged",
                        value: acknowledgedCount,
                        icon: CheckCircle2,
                        bg: "bg-green-50",
                        iconColor: "text-green-600",
                    },
                    {
                        label: "Audits",
                        value: totalAudits,
                        icon: FolderKanban,
                        bg: "bg-blue-50",
                        iconColor: "text-blue-600",
                    },
                ].map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.label}
                            custom={index}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ y: -3 }}
                            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">{card.label}</p>
                                    <h2 className="text-2xl font-semibold text-slate-900 mt-2">
                                        {card.value}
                                    </h2>
                                </div>
                                <div
                                    className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}
                                >
                                    <Icon size={21} className={card.iconColor} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* ==================================================
                FILTERS
            ================================================== */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            placeholder="Search by ID, audit, finding, or text..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-teal-400"
                    >
                        <option value="ALL">All</option>
                        <option value="PENDING">Pending</option>
                        <option value="ACKNOWLEDGED">Acknowledged</option>
                    </select>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={resetFilters}
                        className="h-11 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Reset
                    </motion.button>
                </div>
            </div>

            {/* ==================================================
                TABLE
            ================================================== */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Recommendations Received
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">
                            {filteredRows.length} record
                            {filteredRows.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-6">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="animate-pulse h-14 border-b border-slate-100 flex items-center gap-4"
                            >
                                <div className="h-4 bg-slate-100 rounded w-20" />
                                <div className="h-4 bg-slate-100 rounded w-32" />
                                <div className="h-4 bg-slate-100 rounded w-40" />
                                <div className="h-4 bg-slate-100 rounded w-20" />
                            </div>
                        ))}
                    </div>
                ) : filteredRows.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                            <ClipboardList size={26} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800">
                            No recommendations found
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            You have no recommendations matching the selected filters.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1250px]">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Recommendation ID
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Audit ID
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Audit Name
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Finding
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Internal Auditor
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Recommendation
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Status
                                    </th>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Created
                                    </th>
                                    <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredRows.map((rec, index) => (
                                    <motion.tr
                                        key={rec.id}
                                        custom={index}
                                        variants={rowVariants}
                                        initial="hidden"
                                        animate="visible"
                                        className="border-t border-slate-100 hover:bg-slate-50/70 transition"
                                    >
                                        <td className="px-5 py-4">
                                            <span className="font-semibold text-teal-600">
                                                {rec.recommendationId || `#${rec.id}`}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-700">
                                            {rec.auditCode || rec.auditId || "-"}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-700">
                                            {rec.auditName || "-"}
                                        </td>

                                        <td className="px-5 py-4 max-w-[200px]">
                                            <p className="text-slate-700 text-sm truncate">
                                                {rec.findingTitle || "-"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-700">
                                            {rec.internalAuditorName || "-"}
                                        </td>

                                        <td className="px-5 py-4 max-w-[260px]">
                                            <p className="text-slate-600 text-sm truncate">
                                                {rec.recommendationText || "-"}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-flex px-3 py-1 rounded-full border text-xs font-medium ${getStatusBadgeClass(
                                                    rec.status
                                                )}`}
                                            >
                                                {rec.status || "-"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {formatDate(rec.createdAt)}
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setViewingRecommendation(rec)}
                                                    className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>

                                                {rec.status === "PENDING" && (
                                                    <button
                                                        onClick={() => setConfirmingId(rec.id)}
                                                        className="h-9 px-3 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-700 transition"
                                                    >
                                                        <CheckCircle2 size={14} />
                                                        Acknowledge
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ==================================================
                VIEW DETAILS MODAL
            ================================================== */}
            <AnimatePresence>
                {viewingRecommendation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setViewingRecommendation(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Recommendation Details
                                </h2>
                                <button
                                    onClick={() => setViewingRecommendation(null)}
                                    className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center"
                                >
                                    <X size={19} />
                                </button>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500">Recommendation ID</p>
                                        <p className="font-medium text-slate-800 mt-1">
                                            {viewingRecommendation.recommendationId ||
                                                `#${viewingRecommendation.id}`}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500">Status</p>
                                        <span
                                            className={`inline-flex mt-1 px-3 py-1 rounded-full border text-xs font-medium ${getStatusBadgeClass(
                                                viewingRecommendation.status
                                            )}`}
                                        >
                                            {viewingRecommendation.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500">Audit ID</p>
                                        <p className="font-medium text-slate-800 mt-1">
                                            {viewingRecommendation.auditCode ||
                                                viewingRecommendation.auditId}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500">Audit Name</p>
                                        <p className="font-medium text-slate-800 mt-1">
                                            {viewingRecommendation.auditName || "-"}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500">Finding ID</p>
                                        <p className="font-medium text-slate-800 mt-1">
                                            {viewingRecommendation.findingId || "-"}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500">Finding Title</p>
                                        <p className="font-medium text-slate-800 mt-1">
                                            {viewingRecommendation.findingTitle || "-"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Recommendation</p>
                                    <p className="text-slate-700 bg-teal-50 rounded-xl p-3 whitespace-pre-wrap">
                                        {viewingRecommendation.recommendationText || "-"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500">Internal Auditor</p>
                                        <p className="font-medium text-slate-800 mt-1">
                                            {viewingRecommendation.internalAuditorName || "-"}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500">
                                            Internal Auditor ID
                                        </p>
                                        <p className="font-medium text-slate-800 mt-1">
                                            {viewingRecommendation.internalAuditorId || "-"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Created On</p>
                                    <p className="text-slate-700 font-medium">
                                        {formatDate(viewingRecommendation.createdAt)}
                                    </p>
                                </div>

                                {viewingRecommendation.status === "PENDING" && (
                                    <div className="flex justify-end pt-3 border-t border-slate-100">
                                        <button
                                            onClick={() => {
                                                setConfirmingId(viewingRecommendation.id);
                                                setViewingRecommendation(null);
                                            }}
                                            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 flex items-center gap-2"
                                        >
                                            <CheckCircle2 size={16} />
                                            Acknowledge
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ==================================================
                CONFIRM ACKNOWLEDGE MODAL
            ================================================== */}
            <AnimatePresence>
                {confirmingId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => !acknowledging && setConfirmingId(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6"
                        >
                            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                                <CheckCircle2 size={24} className="text-emerald-600" />
                            </div>

                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                Acknowledge Recommendation?
                            </h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Once acknowledged, this action cannot be undone. Are you sure
                                you want to proceed?
                            </p>

                            {actionError && (
                                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 mb-4">
                                    <AlertCircle size={14} />
                                    {actionError}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setConfirmingId(null)}
                                    disabled={acknowledging}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleAcknowledge(confirmingId)}
                                    disabled={acknowledging}
                                    className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-60"
                                >
                                    {acknowledging ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Acknowledging...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 size={16} />
                                            Yes, Acknowledge
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ==================================================
                TOAST
            ================================================== */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-5 py-3 shadow-lg text-sm font-medium"
                    >
                        <CheckCircle2 size={18} />
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AuditeeRecommendations;