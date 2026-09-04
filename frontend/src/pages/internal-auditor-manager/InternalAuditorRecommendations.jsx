// InternalAuditorRecommendations.jsx

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
    Plus,
    Loader2,
    AlertCircle,
    Eye,
    FileText,
    User,
    XCircle,
    Check,
} from "lucide-react";

import {
    createRecommendation,
    getMyRecommendations,
    updateRecommendationStatus,
} from "../../service/recommendationService";

import {
    getAuditsForCurrentAuditor,
    getFindingsByAuditId,
} from "../../service/FindingService";

// ============================================================
// ANIMATIONS
// ============================================================

const pageVariants = {
    hidden: {
        opacity: 0,
        y: 15,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
        },
    },
};

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 15,
    },
    visible: (index) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: index * 0.08,
            duration: 0.35,
        },
    }),
};

const rowVariants = {
    hidden: {
        opacity: 0,
        y: 8,
    },
    visible: (index) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: index * 0.04,
            duration: 0.25,
        },
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

// ============================================================
// STATUS BADGE
// ============================================================

const getStatusBadgeClass = (status) => {
    switch (status) {
        case "PENDING":
            return "bg-amber-50 text-amber-700 border-amber-200";

        case "ACKNOWLEDGED":
            return "bg-blue-50 text-blue-700 border-blue-200";

        case "COMPLETED":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";

        case "REJECTED":
            return "bg-red-50 text-red-700 border-red-200";

        default:
            return "bg-slate-50 text-slate-600 border-slate-200";
    }
};

// ============================================================
// STATUS LABEL
// ============================================================

const getStatusLabel = (status) => {
    switch (status) {
        case "PENDING":
            return "Pending";

        case "ACKNOWLEDGED":
            return "Acknowledged";

        case "COMPLETED":
            return "Completed";

        case "REJECTED":
            return "Rejected";

        default:
            return status || "-";
    }
};

// ============================================================
// EXTRACT LIST
// ============================================================

const extractList = (response) => {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
        return response.data.data;
    }

    return [];
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const InternalAuditorRecommendations = () => {
    // ========================================================
    // LIST STATE
    // ========================================================

    const [recommendations, setRecommendations] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");

    // ========================================================
    // MODAL STATE
    // ========================================================

    const [viewingRecommendation, setViewingRecommendation] =
        useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);

    // ========================================================
    // STATUS UPDATE STATE
    // ========================================================

    const [updatingId, setUpdatingId] = useState(null);

    // ========================================================
    // TOAST
    // ========================================================

    const [toast, setToast] = useState("");

    // ========================================================
    // CONFIRMATION
    // ========================================================

    const [confirmation, setConfirmation] = useState(null);

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
            const response = await getMyRecommendations();

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
    // STATUS UPDATE
    // ========================================================

    const handleStatusUpdate = async (recommendation, newStatus) => {
        if (!recommendation?.id) {
            setToast("Recommendation ID is missing");
            return;
        }

        // Internal Auditor can only update ACKNOWLEDGED
        // recommendations to COMPLETED or REJECTED.
        if (recommendation.status !== "ACKNOWLEDGED") {
            setToast(
                "Only acknowledged recommendations can be updated."
            );

            setTimeout(() => setToast(""), 3000);

            return;
        }

        if (
            newStatus !== "COMPLETED" &&
            newStatus !== "REJECTED"
        ) {
            return;
        }

        setUpdatingId(recommendation.id);

        try {
            const response = await updateRecommendationStatus(
                recommendation.id,
                newStatus
            );

            const updatedRecommendation =
                response?.data?.data ||
                response?.data ||
                response;

            setRecommendations((prev) =>
                prev.map((item) => {
                    if (item.id !== recommendation.id) {
                        return item;
                    }

                    return {
                        ...item,
                        ...(typeof updatedRecommendation === "object"
                            ? updatedRecommendation
                            : {}),
                        status: newStatus,
                    };
                })
            );

            // Update currently opened modal also
            setViewingRecommendation((prev) => {
                if (!prev || prev.id !== recommendation.id) {
                    return prev;
                }

                return {
                    ...prev,
                    ...(typeof updatedRecommendation === "object"
                        ? updatedRecommendation
                        : {}),
                    status: newStatus,
                };
            });

            setConfirmation(null);

            setToast(
                newStatus === "COMPLETED"
                    ? "Recommendation marked as completed."
                    : "Recommendation rejected."
            );

            setTimeout(() => {
                setToast("");
            }, 3000);
        } catch (err) {
            console.error(
                "Failed to update recommendation status:",
                err.response?.data || err
            );

            setToast(
                err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Unable to update recommendation status."
            );

            setTimeout(() => {
                setToast("");
            }, 3500);
        } finally {
            setUpdatingId(null);
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
                String(rec.recommendationId || "")
                    .toLowerCase()
                    .includes(search) ||
                String(
                    rec.auditCode ||
                        rec.auditId ||
                        ""
                )
                    .toLowerCase()
                    .includes(search) ||
                String(rec.auditName || "")
                    .toLowerCase()
                    .includes(search) ||
                String(rec.findingTitle || "")
                    .toLowerCase()
                    .includes(search) ||
                String(rec.auditeeName || "")
                    .toLowerCase()
                    .includes(search) ||
                String(rec.recommendationText || "")
                    .toLowerCase()
                    .includes(search);

            const matchesStatus =
                statusFilter === "ALL" ||
                rec.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [
        recommendations,
        searchTerm,
        statusFilter,
    ]);

    // ========================================================
    // STATISTICS
    // ========================================================

    const totalRecommendations =
        recommendations.length;

    const pendingCount = recommendations.filter(
        (rec) => rec.status === "PENDING"
    ).length;

    const acknowledgedCount = recommendations.filter(
        (rec) => rec.status === "ACKNOWLEDGED"
    ).length;

    const completedCount = recommendations.filter(
        (rec) => rec.status === "COMPLETED"
    ).length;

    const rejectedCount = recommendations.filter(
        (rec) => rec.status === "REJECTED"
    ).length;

    const auditsWithRecommendations = useMemo(() => {
        const uniqueAuditIds = new Set(
            recommendations
                .map((rec) => rec.auditId)
                .filter(Boolean)
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
    // CREATE SUCCESS
    // ========================================================

    const handleCreateSuccess = () => {
        setShowCreateModal(false);

        setToast(
            "Recommendation created successfully."
        );

        loadData();

        setTimeout(() => {
            setToast("");
        }, 3000);
    };

    // ========================================================
    // OPEN CONFIRMATION
    // ========================================================

    const openStatusConfirmation = (
        recommendation,
        newStatus
    ) => {
        if (
            recommendation.status !==
            "ACKNOWLEDGED"
        ) {
            setToast(
                "Only acknowledged recommendations can be updated."
            );

            setTimeout(() => {
                setToast("");
            }, 3000);

            return;
        }

        setConfirmation({
            recommendation,
            status: newStatus,
        });
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
                        <FileText
                            size={22}
                            className="text-teal-600"
                        />
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Recommendations
                        </h1>

                        <p className="text-sm text-slate-500 mt-1">
                            Create, review and track audit recommendations
                        </p>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                        setShowCreateModal(true)
                    }
                    className="h-11 px-5 rounded-xl bg-teal-600 text-white text-sm font-semibold flex items-center gap-2 hover:bg-teal-700 transition shadow-sm"
                >
                    <Plus size={18} />

                    Create Recommendation
                </motion.button>
            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: -10,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            y: -10,
                        }}
                        className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <AlertCircle size={17} />

                            <span>{error}</span>
                        </div>

                        <button
                            onClick={() =>
                                setError("")
                            }
                            className="ml-4"
                        >
                            <X size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ==================================================
                STAT CARDS
            ================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {[
                    {
                        label: "Total",
                        value: totalRecommendations,
                        icon: ClipboardList,
                        bg: "bg-teal-50",
                        iconColor: "text-teal-600",
                    },
                    {
                        label: "Pending",
                        value: pendingCount,
                        icon: Clock,
                        bg: "bg-amber-50",
                        iconColor: "text-amber-600",
                    },
                    {
                        label: "Acknowledged",
                        value: acknowledgedCount,
                        icon: CheckCircle2,
                        bg: "bg-blue-50",
                        iconColor: "text-blue-600",
                    },
                    {
                        label: "Completed",
                        value: completedCount,
                        icon: Check,
                        bg: "bg-emerald-50",
                        iconColor: "text-emerald-600",
                    },
                    {
                        label: "Rejected",
                        value: rejectedCount,
                        icon: XCircle,
                        bg: "bg-red-50",
                        iconColor: "text-red-600",
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
                            whileHover={{
                                y: -3,
                            }}
                            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        {card.label}
                                    </p>

                                    <h2 className="text-2xl font-semibold text-slate-900 mt-2">
                                        {card.value}
                                    </h2>
                                </div>

                                <div
                                    className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}
                                >
                                    <Icon
                                        size={21}
                                        className={
                                            card.iconColor
                                        }
                                    />
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
                            placeholder="Search recommendations..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                        className="h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-teal-400"
                    >
                        <option value="ALL">
                            All Status
                        </option>

                        <option value="PENDING">
                            Pending
                        </option>

                        <option value="ACKNOWLEDGED">
                            Acknowledged
                        </option>

                        <option value="COMPLETED">
                            Completed
                        </option>

                        <option value="REJECTED">
                            Rejected
                        </option>
                    </select>

                    <motion.button
                        whileHover={{
                            scale: 1.02,
                        }}
                        whileTap={{
                            scale: 0.97,
                        }}
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
                            My Recommendations
                        </h2>

                        <p className="text-xs text-slate-500 mt-1">
                            {filteredRows.length} record
                            {filteredRows.length !==
                            1
                                ? "s"
                                : ""}
                        </p>
                    </div>

                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                        title="Refresh"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />
                    </button>
                </div>

                {loading ? (
                    <div className="p-6">
                        {[1, 2, 3, 4].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="animate-pulse h-14 border-b border-slate-100 flex items-center gap-4"
                                >
                                    <div className="h-4 bg-slate-100 rounded w-20" />

                                    <div className="h-4 bg-slate-100 rounded w-32" />

                                    <div className="h-4 bg-slate-100 rounded w-40" />

                                    <div className="h-4 bg-slate-100 rounded w-20" />
                                </div>
                            )
                        )}
                    </div>
                ) : filteredRows.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                            <ClipboardList
                                size={26}
                                className="text-slate-400"
                            />
                        </div>

                        <h3 className="text-lg font-medium text-slate-800">
                            No recommendations found
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            Create your first recommendation for a finding.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1350px]">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Recommendation ID
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Audit
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Finding
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Auditee
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
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredRows.map(
                                    (rec, index) => (
                                        <motion.tr
                                            key={
                                                rec.id ||
                                                rec.recommendationId ||
                                                index
                                            }
                                            custom={index}
                                            variants={
                                                rowVariants
                                            }
                                            initial="hidden"
                                            animate="visible"
                                            className="border-t border-slate-100 hover:bg-slate-50/70 transition"
                                        >
                                            {/* ID */}
                                            <td className="px-5 py-4">
                                                <span className="font-semibold text-teal-600">
                                                    {rec.recommendationId ||
                                                        `#${rec.id}`}
                                                </span>
                                            </td>

                                            {/* AUDIT */}
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-slate-800">
                                                    {rec.auditCode ||
                                                        rec.auditId ||
                                                        "-"}
                                                </p>

                                                <p className="text-xs text-slate-500 mt-1">
                                                    {rec.auditName ||
                                                        "-"}
                                                </p>
                                            </td>

                                            {/* FINDING */}
                                            <td className="px-5 py-4 max-w-[220px]">
                                                <p className="text-slate-700 truncate">
                                                    {rec.findingTitle ||
                                                        "-"}
                                                </p>
                                            </td>

                                            {/* AUDITEE */}
                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <User
                                                        size={15}
                                                        className="text-slate-400"
                                                    />

                                                    {rec.auditeeName ||
                                                        "-"}
                                                </div>
                                            </td>

                                            {/* RECOMMENDATION */}
                                            <td className="px-5 py-4 max-w-[260px]">
                                                <p className="text-slate-600 text-sm truncate">
                                                    {rec.recommendationText ||
                                                        "-"}
                                                </p>
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold ${getStatusBadgeClass(
                                                        rec.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(
                                                        rec.status
                                                    )}
                                                </span>
                                            </td>

                                            {/* CREATED */}
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {formatDate(
                                                    rec.createdAt
                                                )}
                                            </td>

                                            {/* ACTIONS */}
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end items-center gap-2">
                                                    {/* VIEW */}
                                                    <button
                                                        onClick={() =>
                                                            setViewingRecommendation(
                                                                rec
                                                            )
                                                        }
                                                        className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 transition"
                                                        title="View Details"
                                                    >
                                                        <Eye
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>

                                                    {/* COMPLETE / REJECT ONLY FOR ACKNOWLEDGED */}
                                                    {rec.status ===
                                                        "ACKNOWLEDGED" && (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    openStatusConfirmation(
                                                                        rec,
                                                                        "COMPLETED"
                                                                    )
                                                                }
                                                                disabled={
                                                                    updatingId ===
                                                                    rec.id
                                                                }
                                                                className="h-9 px-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
                                                                title="Mark Completed"
                                                            >
                                                                {updatingId ===
                                                                rec.id ? (
                                                                    <Loader2
                                                                        size={
                                                                            14
                                                                        }
                                                                        className="animate-spin"
                                                                    />
                                                                ) : (
                                                                    <Check
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                )}

                                                                Complete
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    openStatusConfirmation(
                                                                        rec,
                                                                        "REJECTED"
                                                                    )
                                                                }
                                                                disabled={
                                                                    updatingId ===
                                                                    rec.id
                                                                }
                                                                className="h-9 px-3 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
                                                                title="Reject Recommendation"
                                                            >
                                                                <XCircle
                                                                    size={
                                                                        14
                                                                    }
                                                                />

                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    )
                                )}
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
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() =>
                            setViewingRecommendation(
                                null
                            )
                        }
                    >
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.95,
                                y: 15,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.95,
                                y: 15,
                            }}
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                            className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
                        >
                            {/* HEADER */}
                            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-5 flex items-start justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Recommendation Details
                                    </h2>

                                    <p className="text-xs text-slate-500 mt-1">
                                        Review recommendation information
                                    </p>
                                </div>

                                <button
                                    onClick={() =>
                                        setViewingRecommendation(
                                            null
                                        )
                                    }
                                    className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
                                >
                                    <X
                                        size={19}
                                    />
                                </button>
                            </div>

                            {/* CONTENT */}
                            <div className="p-6 space-y-4 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500">
                                            Recommendation ID
                                        </p>

                                        <p className="font-semibold text-slate-800 mt-1">
                                            {viewingRecommendation.recommendationId ||
                                                `#${viewingRecommendation.id}`}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500">
                                            Status
                                        </p>

                                        <span
                                            className={`inline-flex mt-1 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusBadgeClass(
                                                viewingRecommendation.status
                                            )}`}
                                        >
                                            {getStatusLabel(
                                                viewingRecommendation.status
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500">
                                            Audit
                                        </p>

                                        <p className="font-medium text-slate-800 mt-1">
                                            {viewingRecommendation.auditCode ||
                                                viewingRecommendation.auditId ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500">
                                            Audit Name
                                        </p>

                                        <p className="font-medium text-slate-800 mt-1">
                                            {viewingRecommendation.auditName ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>

                                {/* FINDING */}
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">
                                        Finding
                                    </p>

                                    <p className="text-slate-700 bg-slate-50 rounded-xl p-3">
                                        {viewingRecommendation.findingTitle ||
                                            "-"}
                                    </p>
                                </div>

                                {/* AUDITEE */}
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">
                                        Auditee
                                    </p>

                                    <div className="flex items-center gap-2 text-slate-700 bg-slate-50 rounded-xl p-3">
                                        <User
                                            size={16}
                                            className="text-slate-400"
                                        />

                                        <span>
                                            {viewingRecommendation.auditeeName ||
                                                "-"}
                                        </span>
                                    </div>
                                </div>

                                {/* RECOMMENDATION */}
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">
                                        Recommendation
                                    </p>

                                    <p className="text-slate-700 bg-teal-50 border border-teal-100 rounded-xl p-3 whitespace-pre-wrap">
                                        {viewingRecommendation.recommendationText ||
                                            "-"}
                                    </p>
                                </div>

                                {/* CREATED */}
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">
                                        Created On
                                    </p>

                                    <p className="text-slate-700 font-medium">
                                        {formatDate(
                                            viewingRecommendation.createdAt
                                        )}
                                    </p>
                                </div>

                                {/* ACTIONS IN MODAL */}
                                {viewingRecommendation.status ===
                                    "ACKNOWLEDGED" && (
                                    <div className="pt-4 border-t border-slate-100">
                                        <p className="text-xs font-medium text-slate-500 mb-3">
                                            Recommendation Review
                                        </p>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() =>
                                                    openStatusConfirmation(
                                                        viewingRecommendation,
                                                        "COMPLETED"
                                                    )
                                                }
                                                disabled={
                                                    updatingId ===
                                                    viewingRecommendation.id
                                                }
                                                className="flex-1 h-10 rounded-xl bg-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
                                            >
                                                {updatingId ===
                                                viewingRecommendation.id ? (
                                                    <Loader2
                                                        size={
                                                            16
                                                        }
                                                        className="animate-spin"
                                                    />
                                                ) : (
                                                    <Check
                                                        size={
                                                            16
                                                        }
                                                    />
                                                )}

                                                Mark Completed
                                            </button>

                                            <button
                                                onClick={() =>
                                                    openStatusConfirmation(
                                                        viewingRecommendation,
                                                        "REJECTED"
                                                    )
                                                }
                                                disabled={
                                                    updatingId ===
                                                    viewingRecommendation.id
                                                }
                                                className="flex-1 h-10 rounded-xl bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50"
                                            >
                                                <XCircle
                                                    size={
                                                        16
                                                    }
                                                />

                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ==================================================
                CREATE MODAL
            ================================================== */}

            <AnimatePresence>
                {showCreateModal && (
                    <CreateRecommendationModal
                        onCancel={() =>
                            setShowCreateModal(false)
                        }
                        onSuccess={
                            handleCreateSuccess
                        }
                    />
                )}
            </AnimatePresence>

            {/* ==================================================
                CONFIRMATION MODAL
            ================================================== */}

            <AnimatePresence>
                {confirmation && (
                    <motion.div
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.95,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.95,
                            }}
                            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                        confirmation.status ===
                                        "COMPLETED"
                                            ? "bg-emerald-50"
                                            : "bg-red-50"
                                    }`}
                                >
                                    {confirmation.status ===
                                    "COMPLETED" ? (
                                        <Check
                                            size={22}
                                            className="text-emerald-600"
                                        />
                                    ) : (
                                        <XCircle
                                            size={22}
                                            className="text-red-600"
                                        />
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-semibold text-slate-900">
                                        {confirmation.status ===
                                        "COMPLETED"
                                            ? "Complete Recommendation"
                                            : "Reject Recommendation"}
                                    </h3>

                                    <p className="text-xs text-slate-500 mt-1">
                                        This action will update the recommendation status.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-4 mb-5">
                                <p className="text-xs text-slate-500">
                                    Recommendation
                                </p>

                                <p className="text-sm font-medium text-slate-800 mt-1">
                                    {confirmation.recommendation
                                        .recommendationId ||
                                        `#${confirmation.recommendation.id}`}
                                </p>

                                <p className="text-sm text-slate-600 mt-2 line-clamp-3">
                                    {confirmation.recommendation
                                        .recommendationText ||
                                        "-"}
                                </p>
                            </div>

                            <p className="text-sm text-slate-600 mb-5">
                                Are you sure you want to mark this recommendation as{" "}
                                <strong>
                                    {confirmation.status ===
                                    "COMPLETED"
                                        ? "COMPLETED"
                                        : "REJECTED"}
                                </strong>
                                ?
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() =>
                                        setConfirmation(
                                            null
                                        )
                                    }
                                    disabled={
                                        updatingId !==
                                        null
                                    }
                                    className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() =>
                                        handleStatusUpdate(
                                            confirmation.recommendation,
                                            confirmation.status
                                        )
                                    }
                                    disabled={
                                        updatingId !==
                                        null
                                    }
                                    className={`h-10 px-5 rounded-xl text-white text-sm font-semibold flex items-center gap-2 ${
                                        confirmation.status ===
                                        "COMPLETED"
                                            ? "bg-emerald-600 hover:bg-emerald-700"
                                            : "bg-red-600 hover:bg-red-700"
                                    } disabled:opacity-50`}
                                >
                                    {updatingId !==
                                    null ? (
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                    ) : confirmation.status ===
                                      "COMPLETED" ? (
                                        <Check
                                            size={16}
                                        />
                                    ) : (
                                        <XCircle
                                            size={16}
                                        />
                                    )}

                                    Confirm
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
                        initial={{
                            opacity: 0,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            y: 20,
                        }}
                        className="fixed bottom-6 right-6 z-[80] flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-3 shadow-xl text-sm font-medium"
                    >
                        <CheckCircle2
                            size={18}
                            className="text-emerald-400"
                        />

                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ============================================================
// CREATE RECOMMENDATION MODAL
// ============================================================

const CreateRecommendationModal = ({
    onCancel,
    onSuccess,
}) => {
    const [audits, setAudits] = useState([]);

    const [findings, setFindings] = useState([]);

    const [loadingAudits, setLoadingAudits] =
        useState(true);

    const [loadingFindings, setLoadingFindings] =
        useState(false);

    const [selectedAuditId, setSelectedAuditId] =
        useState("");

    const [selectedFindingId, setSelectedFindingId] =
        useState("");

    const [recommendationText, setRecommendationText] =
        useState("");

    const [errors, setErrors] = useState({});

    const [submitting, setSubmitting] =
        useState(false);

    const [apiError, setApiError] = useState("");

    // ========================================================
    // LOAD AUDITS
    // ========================================================

    useEffect(() => {
        const loadAudits = async () => {
            setLoadingAudits(true);

            try {
                const response =
                    await getAuditsForCurrentAuditor();

                const list = extractList(response);

                setAudits(list);
            } catch (err) {
                console.error(
                    "Failed to load audits:",
                    err.response?.data || err
                );

                setApiError(
                    "Unable to load your assigned audits."
                );
            } finally {
                setLoadingAudits(false);
            }
        };

        loadAudits();
    }, []);

    // ========================================================
    // LOAD FINDINGS
    // ========================================================

    useEffect(() => {
        if (!selectedAuditId) {
            setFindings([]);
            setSelectedFindingId("");
            return;
        }

        const loadFindings = async () => {
            setLoadingFindings(true);

            setSelectedFindingId("");

            setApiError("");

            try {
                const response =
                    await getFindingsByAuditId(
                        selectedAuditId
                    );

                const list = extractList(response);

                setFindings(list);
            } catch (err) {
                console.error(
                    "Failed to load findings:",
                    err.response?.data || err
                );

                setApiError(
                    "Unable to load findings for this audit."
                );

                setFindings([]);
            } finally {
                setLoadingFindings(false);
            }
        };

        loadFindings();
    }, [selectedAuditId]);

    // ========================================================
    // SELECTED AUDIT
    // ========================================================

    const selectedAudit = useMemo(
        () =>
            audits.find(
                (a) =>
                    String(a.id) ===
                    String(selectedAuditId)
            ),
        [audits, selectedAuditId]
    );

    // ========================================================
    // SELECTED FINDING
    // ========================================================

    const selectedFinding = useMemo(
        () =>
            findings.find(
                (f) =>
                    String(f.id) ===
                    String(selectedFindingId)
            ),
        [findings, selectedFindingId]
    );

    // ========================================================
    // VALIDATION
    // ========================================================

    const validate = () => {
        const newErrors = {};

        if (!selectedAuditId) {
            newErrors.audit =
                "Please select an audit.";
        }

        if (!selectedFindingId) {
            newErrors.finding =
                "Please select a finding.";
        }

        if (!recommendationText.trim()) {
            newErrors.recommendationText =
                "Recommendation text is required.";
        } else if (
            recommendationText.trim().length < 10
        ) {
            newErrors.recommendationText =
                "Recommendation must be at least 10 characters.";
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors).length === 0
        );
    };

    // ========================================================
    // SUBMIT
    // ========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setApiError("");

        if (!validate()) {
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                auditId: Number(selectedAuditId),
                findingId: Number(selectedFindingId),
                recommendationText:
                    recommendationText.trim(),
            };

            await createRecommendation(payload);

            onSuccess?.();
        } catch (err) {
            console.error(
                "Failed to create recommendation:",
                err.response?.data || err
            );

            setApiError(
                err.response?.data?.message ||
                    err.response?.data?.error ||
                    "Unable to create recommendation. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ========================================================
    // UI
    // ========================================================

    return (
        <motion.div
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
            }}
            exit={{
                opacity: 0,
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{
                    opacity: 0,
                    scale: 0.95,
                    y: 15,
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                }}
                exit={{
                    opacity: 0,
                    scale: 0.95,
                    y: 15,
                }}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
                {/* HEADER */}

                <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-5">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            Create Recommendation
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Select an audit and finding, then provide your recommendation.
                        </p>
                    </div>

                    <button
                        onClick={onCancel}
                        disabled={submitting}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-6">
                    {/* API ERROR */}

                    {apiError && (
                        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <AlertCircle
                                size={18}
                            />

                            {apiError}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* AUDIT */}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Select Audit{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            {loadingAudits ? (
                                <div className="flex items-center gap-2 text-sm text-slate-500 h-11">
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />

                                    Loading your assigned audits...
                                </div>
                            ) : (
                                <select
                                    value={
                                        selectedAuditId
                                    }
                                    onChange={(e) =>
                                        setSelectedAuditId(
                                            e.target
                                                .value
                                        )
                                    }
                                    disabled={
                                        submitting
                                    }
                                    className={`w-full h-11 rounded-xl border bg-white px-3.5 text-sm text-slate-700 outline-none transition-colors focus:ring-2 disabled:opacity-50 ${
                                        errors.audit
                                            ? "border-red-300 focus:ring-red-100"
                                            : "border-slate-200 focus:border-teal-400 focus:ring-teal-100"
                                    }`}
                                >
                                    <option value="">
                                        -- Select an audit --
                                    </option>

                                    {audits.map(
                                        (audit) => (
                                            <option
                                                key={
                                                    audit.id
                                                }
                                                value={
                                                    audit.id
                                                }
                                            >
                                                {audit.auditId ||
                                                    audit.id}{" "}
                                                —{" "}
                                                {audit.auditName ||
                                                    "Audit"}
                                            </option>
                                        )
                                    )}
                                </select>
                            )}

                            {errors.audit && (
                                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                    <AlertCircle
                                        size={12}
                                    />

                                    {errors.audit}
                                </p>
                            )}

                            {!loadingAudits &&
                                audits.length ===
                                    0 && (
                                    <p className="mt-1.5 text-xs text-slate-500">
                                        No audits are currently assigned to you.
                                    </p>
                                )}
                        </div>

                        {/* FINDING */}

                        {selectedAuditId && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Select Finding{" "}
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                {loadingFindings ? (
                                    <div className="flex items-center gap-2 text-sm text-slate-500 h-11">
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />

                                        Loading findings...
                                    </div>
                                ) : (
                                    <select
                                        value={
                                            selectedFindingId
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setSelectedFindingId(
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            submitting
                                        }
                                        className={`w-full h-11 rounded-xl border bg-white px-3.5 text-sm text-slate-700 outline-none transition-colors focus:ring-2 disabled:opacity-50 ${
                                            errors.finding
                                                ? "border-red-300 focus:ring-red-100"
                                                : "border-slate-200 focus:border-teal-400 focus:ring-teal-100"
                                        }`}
                                    >
                                        <option value="">
                                            -- Select a finding --
                                        </option>

                                        {findings.map(
                                            (
                                                finding
                                            ) => (
                                                <option
                                                    key={
                                                        finding.id
                                                    }
                                                    value={
                                                        finding.id
                                                    }
                                                >
                                                    {finding.title ||
                                                        `Finding #${finding.id}`}
                                                </option>
                                            )
                                        )}
                                    </select>
                                )}

                                {errors.finding && (
                                    <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                        <AlertCircle
                                            size={
                                                12
                                            }
                                        />

                                        {
                                            errors.finding
                                        }
                                    </p>
                                )}

                                {!loadingFindings &&
                                    selectedAuditId &&
                                    findings.length ===
                                        0 && (
                                        <p className="mt-1.5 text-xs text-slate-500">
                                            No findings recorded for this audit yet.
                                        </p>
                                    )}
                            </div>
                        )}

                        {/* FINDING INFORMATION */}

                        {selectedFinding && (
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText
                                        size={16}
                                        className="text-teal-600"
                                    />

                                    <h3 className="text-sm font-semibold text-slate-800">
                                        Finding Information
                                    </h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500 text-xs mb-1">
                                            Audit ID
                                        </p>

                                        <p className="text-slate-800 font-medium">
                                            {selectedAudit?.auditId ||
                                                selectedAuditId}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-slate-500 text-xs mb-1">
                                            Audit Name
                                        </p>

                                        <p className="text-slate-800 font-medium">
                                            {selectedAudit?.auditName ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div className="col-span-2">
                                        <p className="text-slate-500 text-xs mb-1">
                                            Finding Title
                                        </p>

                                        <p className="text-slate-800 font-medium">
                                            {selectedFinding.title ||
                                                "-"}
                                        </p>
                                    </div>

                                    {selectedFinding.observation && (
                                        <div className="col-span-2">
                                            <p className="text-slate-500 text-xs mb-1">
                                                Finding Description
                                            </p>

                                            <p className="text-slate-600 leading-relaxed">
                                                {
                                                    selectedFinding.observation
                                                }
                                            </p>
                                        </div>
                                    )}

                                    <div className="col-span-2 flex items-center gap-2 pt-3 border-t border-slate-200">
                                        <User
                                            size={14}
                                            className="text-slate-400"
                                        />

                                        <p className="text-slate-500 text-xs">
                                            Assigned Auditee
                                        </p>

                                        <p className="text-slate-800 font-medium text-xs">
                                            {selectedAudit?.auditeeName ||
                                                selectedAudit
                                                    ?.auditee
                                                    ?.employeeId ||
                                                "Assigned automatically by system"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* RECOMMENDATION */}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Recommendation{" "}
                                <span className="text-red-500">
                                    *
                                </span>
                            </label>

                            <textarea
                                rows={4}
                                value={
                                    recommendationText
                                }
                                onChange={(e) => {
                                    setRecommendationText(
                                        e.target.value
                                    );

                                    if (
                                        errors.recommendationText
                                    ) {
                                        setErrors(
                                            (prev) => {
                                                const next =
                                                    {
                                                        ...prev,
                                                    };

                                                delete next.recommendationText;

                                                return next;
                                            }
                                        );
                                    }
                                }}
                                disabled={
                                    submitting
                                }
                                placeholder="Recommend corrective action for this finding..."
                                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-700 placeholder-slate-400 outline-none transition-colors focus:ring-2 disabled:opacity-50 ${
                                    errors.recommendationText
                                        ? "border-red-300 focus:ring-red-100"
                                        : "border-slate-200 focus:border-teal-400 focus:ring-teal-100"
                                }`}
                            />

                            {errors.recommendationText && (
                                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                    <AlertCircle
                                        size={12}
                                    />

                                    {
                                        errors.recommendationText
                                    }
                                </p>
                            )}
                        </div>

                        {/* BUTTONS */}

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={
                                    submitting
                                }
                                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    submitting
                                }
                                className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2
                                            size={
                                                16
                                            }
                                            className="animate-spin"
                                        />

                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Plus
                                            size={
                                                16
                                            }
                                        />

                                        Create Recommendation
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default InternalAuditorRecommendations;