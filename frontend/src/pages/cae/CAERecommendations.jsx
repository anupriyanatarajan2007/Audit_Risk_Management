// src/pages/cae/CAERecommendations.jsx

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
    ClipboardList,
    Clock,
    CheckCircle2,
    Search,
    RefreshCw,
    X,
    Loader2,
    AlertCircle,
    Eye,
    FileText,
    User,
    Building2,
    ShieldCheck,
    XCircle,
} from "lucide-react";

import {
    getAllRecommendations,
} from "../../service/recommendationService";

import {
    getAuditById,
} from "../../service/AuditService";

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
        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "-";
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

    if (Array.isArray(response?.content)) {
        return response.content;
    }

    if (Array.isArray(response?.data?.content)) {
        return response.data.content;
    }

    return [];
};

// ============================================================
// STATUS BADGE
// ============================================================

const getStatusBadgeClass = (status) => {
    switch (String(status || "").toUpperCase()) {
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
    switch (String(status || "").toUpperCase()) {
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
// PERSON NAME HELPER
// ============================================================

const getPersonName = (person) => {
    if (!person) {
        return "-";
    }

    // firstName + lastName
    const fullName = [
        person.firstName,
        person.lastName,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    if (fullName) {
        return fullName;
    }

    // Other possible backend fields
    if (person.name) {
        return person.name;
    }

    if (person.fullName) {
        return person.fullName;
    }

    if (person.employeeName) {
        return person.employeeName;
    }

    if (person.employeeId) {
        return person.employeeId;
    }

    if (person.email) {
        return person.email;
    }

    return "-";
};

// ============================================================
// DEPARTMENT HELPER
// ============================================================

const getDepartmentName = (audit) => {
    if (!audit) {
        return "-";
    }

    return (
        audit.departmentName ||
        audit.department?.name ||
        audit.department?.departmentName ||
        audit.department?.departmentCode ||
        audit.auditDepartment ||
        audit.audit?.departmentName ||
        audit.departmentEntity?.name ||
        "-"
    );
};

// ============================================================
// AUDITOR HELPER
// ============================================================

const getInternalAuditorName = (audit) => {
    if (!audit) {
        return "-";
    }

    return (
        audit.internalAuditorName ||
        getPersonName(audit.internalAuditor)
    );
};

// ============================================================
// AUDITEE HELPER
// ============================================================

const getAuditeeName = (audit) => {
    if (!audit) {
        return "-";
    }

    return (
        audit.auditeeName ||
        getPersonName(audit.auditee)
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const CAERecommendations = () => {
    // ========================================================
    // STATE
    // ========================================================

    const [recommendations, setRecommendations] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");

    const [
        viewingRecommendation,
        setViewingRecommendation,
    ] = useState(null);

    const [toast, setToast] = useState("");

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
            // =================================================
            // GET ALL RECOMMENDATIONS
            // CAE CAN VIEW ALL DEPARTMENTS
            // =================================================

            const response =
                await getAllRecommendations();

            console.log(
                "CAE RECOMMENDATIONS RAW RESPONSE:",
                response
            );

            const recommendationList =
                extractList(response);

            console.log(
                "CAE RECOMMENDATION LIST:",
                recommendationList
            );

            // =================================================
            // GET UNIQUE AUDIT IDS
            // =================================================

            const auditIds = [
                ...new Set(
                    recommendationList
                        .map(
                            (rec) =>
                                rec.auditId ??
                                rec.audit?.id
                        )
                        .filter(
                            (id) =>
                                id !== undefined &&
                                id !== null &&
                                id !== ""
                        )
                ),
            ];

            console.log(
                "AUDIT IDS FROM RECOMMENDATIONS:",
                auditIds
            );

            // =================================================
            // FETCH AUDIT DETAILS
            // =================================================

            const auditResults =
                await Promise.all(
                    auditIds.map(
                        async (auditId) => {
                            try {
                                const audit =
                                    await getAuditById(
                                        auditId
                                    );

                                console.log(
                                    `AUDIT ${auditId} DETAILS:`,
                                    audit
                                );

                                return {
                                    auditId,
                                    audit,
                                };
                            } catch (err) {
                                console.error(
                                    `Failed to load audit ${auditId}:`,
                                    err
                                        ?.response
                                        ?.data ||
                                        err
                                );

                                return {
                                    auditId,
                                    audit: null,
                                };
                            }
                        }
                    )
                );

            // =================================================
            // CREATE AUDIT LOOKUP MAP
            // =================================================

            const auditMap = {};

            auditResults.forEach(
                ({ auditId, audit }) => {
                    auditMap[auditId] = audit;
                }
            );

            // =================================================
            // ENRICH RECOMMENDATIONS
            // =================================================

            const enrichedRecommendations =
                recommendationList.map(
                    (rec) => {
                        const auditId =
                            rec.auditId ??
                            rec.audit?.id;

                        const audit =
                            auditMap[auditId] ||
                            rec.audit ||
                            null;

                        const auditorName =
                            rec.internalAuditorName ||
                            getInternalAuditorName(
                                audit
                            );

                        const auditeeName =
                            rec.auditeeName ||
                            getAuditeeName(
                                audit
                            );

                        const departmentName =
                            rec.departmentName ||
                            getDepartmentName(
                                audit
                            );

                        return {
                            ...rec,

                            // =================================
                            // AUDIT
                            // =================================

                            auditId:
                                auditId ??
                                rec.auditId,

                            auditCode:
                                rec.auditCode ||
                                audit?.auditId ||
                                audit?.auditCode ||
                                `AUD-${auditId}`,

                            auditName:
                                rec.auditName ||
                                audit?.auditName ||
                                audit?.name ||
                                "-",

                            // =================================
                            // DEPARTMENT
                            // =================================

                            departmentName,

                            // =================================
                            // INTERNAL AUDITOR
                            // =================================

                            internalAuditorName:
                                auditorName,

                            // =================================
                            // AUDITEE
                            // =================================

                            auditeeName,
                        };
                    }
                );

            console.log(
                "ENRICHED CAE RECOMMENDATIONS:",
                enrichedRecommendations
            );

            setRecommendations(
                enrichedRecommendations
            );
        } catch (err) {
            console.error(
                "Failed to load CAE recommendations:",
                err?.response?.data || err
            );

            setError(
                err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message ||
                    "Failed to load recommendations."
            );
        } finally {
            setLoading(false);
        }
    };

    // ========================================================
    // FILTER
    // ========================================================

    const filteredRows = useMemo(() => {
        const search =
            searchTerm.trim().toLowerCase();

        return recommendations.filter(
            (rec) => {
                const matchesSearch =
                    !search ||
                    String(
                        rec.recommendationId ||
                            ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        rec.auditCode ||
                            rec.auditId ||
                            ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        rec.auditName || ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        rec.departmentName || ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        rec.internalAuditorName ||
                            ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        rec.auditeeName || ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        rec.findingTitle || ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        rec.recommendationText ||
                            ""
                    )
                        .toLowerCase()
                        .includes(search);

                const matchesStatus =
                    statusFilter === "ALL" ||
                    String(
                        rec.status || ""
                    ).toUpperCase() ===
                        statusFilter;

                return (
                    matchesSearch &&
                    matchesStatus
                );
            }
        );
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

    const pendingCount =
        recommendations.filter(
            (rec) =>
                String(
                    rec.status || ""
                ).toUpperCase() === "PENDING"
        ).length;

    const acknowledgedCount =
        recommendations.filter(
            (rec) =>
                String(
                    rec.status || ""
                ).toUpperCase() ===
                "ACKNOWLEDGED"
        ).length;

    const completedCount =
        recommendations.filter(
            (rec) =>
                String(
                    rec.status || ""
                ).toUpperCase() ===
                "COMPLETED"
        ).length;

    const rejectedCount =
        recommendations.filter(
            (rec) =>
                String(
                    rec.status || ""
                ).toUpperCase() ===
                "REJECTED"
        ).length;

    // ========================================================
    // RESET
    // ========================================================

    const resetFilters = () => {
        setSearchTerm("");
        setStatusFilter("ALL");
    };

    // ========================================================
    // VIEW
    // ========================================================

    const handleView = (recommendation) => {
        setViewingRecommendation(
            recommendation
        );
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
                        <ShieldCheck
                            size={22}
                            className="text-teal-600"
                        />
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Recommendations
                        </h1>

                        <p className="text-sm text-slate-500 mt-1">
                            View audit recommendations across all departments
                        </p>
                    </div>
                </div>

                {/* CAE VIEW ONLY */}

                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                    <Eye
                        size={17}
                        className="text-teal-600"
                    />

                    <span className="text-sm font-medium text-slate-600">
                        View Only
                    </span>
                </div>
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
                            <AlertCircle
                                size={17}
                            />

                            <span>
                                {error}
                            </span>
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
                        value:
                            totalRecommendations,
                        icon: ClipboardList,
                        bg: "bg-teal-50",
                        iconColor:
                            "text-teal-600",
                    },

                    {
                        label: "Pending",
                        value: pendingCount,
                        icon: Clock,
                        bg: "bg-amber-50",
                        iconColor:
                            "text-amber-600",
                    },

                    {
                        label: "Acknowledged",
                        value:
                            acknowledgedCount,
                        icon: CheckCircle2,
                        bg: "bg-blue-50",
                        iconColor:
                            "text-blue-600",
                    },

                    {
                        label: "Completed",
                        value:
                            completedCount,
                        icon: CheckCircle2,
                        bg: "bg-emerald-50",
                        iconColor:
                            "text-emerald-600",
                    },

                    {
                        label: "Rejected",
                        value:
                            rejectedCount,
                        icon: XCircle,
                        bg: "bg-red-50",
                        iconColor:
                            "text-red-600",
                    },
                ].map(
                    (card, index) => {
                        const Icon =
                            card.icon;

                        return (
                            <motion.div
                                key={
                                    card.label
                                }
                                custom={index}
                                variants={
                                    cardVariants
                                }
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
                                            {
                                                card.label
                                            }
                                        </p>

                                        <h2 className="text-2xl font-semibold text-slate-900 mt-2">
                                            {
                                                card.value
                                            }
                                        </h2>
                                    </div>

                                    <div
                                        className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}
                                    >
                                        <Icon
                                            size={
                                                21
                                            }
                                            className={
                                                card.iconColor
                                            }
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    }
                )}
            </div>

            {/* ==================================================
                FILTERS
            ================================================== */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3">
                    {/* SEARCH */}

                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            placeholder="Search audit, department, auditor, auditee, finding..."
                            value={
                                searchTerm
                            }
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target
                                        .value
                                )
                            }
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
                        />
                    </div>

                    {/* STATUS */}

                    <select
                        value={
                            statusFilter
                        }
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

                    {/* RESET */}

                    <motion.button
                        whileHover={{
                            scale: 1.02,
                        }}
                        whileTap={{
                            scale: 0.97,
                        }}
                        onClick={
                            resetFilters
                        }
                        className="h-11 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                    >
                        <RefreshCw
                            size={16}
                        />

                        Reset
                    </motion.button>
                </div>
            </div>

            {/* ==================================================
                TABLE
            ================================================== */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* TABLE HEADER */}

                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            All Recommendations
                        </h2>

                        <p className="text-xs text-slate-500 mt-1">
                            {
                                filteredRows.length
                            }{" "}
                            record
                            {filteredRows.length !==
                            1
                                ? "s"
                                : ""}
                        </p>
                    </div>

                    <button
                        onClick={
                            loadData
                        }
                        disabled={
                            loading
                        }
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

                {/* LOADING */}

                {loading ? (
                    <div className="p-6">
                        {[
                            1, 2, 3, 4,
                            5,
                        ].map(
                            (item) => (
                                <div
                                    key={
                                        item
                                    }
                                    className="animate-pulse h-16 border-b border-slate-100 flex items-center gap-4"
                                >
                                    <div className="h-4 bg-slate-100 rounded w-24" />

                                    <div className="h-4 bg-slate-100 rounded w-28" />

                                    <div className="h-4 bg-slate-100 rounded w-32" />

                                    <div className="h-4 bg-slate-100 rounded w-36" />

                                    <div className="h-4 bg-slate-100 rounded w-28" />
                                </div>
                            )
                        )}
                    </div>
                ) : filteredRows.length ===
                  0 ? (
                    /* EMPTY */

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
                            There are no recommendations matching your filters.
                        </p>
                    </div>
                ) : (
                    /* TABLE */

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1700px]">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Recommendation ID
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Audit
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Department
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Internal Auditor
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Auditee
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Finding
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
                                {filteredRows.map(
                                    (
                                        rec,
                                        index
                                    ) => (
                                        <motion.tr
                                            key={
                                                rec.id ||
                                                rec.recommendationId ||
                                                index
                                            }
                                            custom={
                                                index
                                            }
                                            variants={
                                                rowVariants
                                            }
                                            initial="hidden"
                                            animate="visible"
                                            className="border-t border-slate-100 hover:bg-slate-50/70 transition"
                                        >
                                            {/* RECOMMENDATION ID */}

                                            <td className="px-5 py-4">
                                                <span className="font-semibold text-teal-600">
                                                    {rec.recommendationId ||
                                                        `#${rec.id}`}
                                                </span>
                                            </td>

                                            {/* AUDIT */}

                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-800">
                                                    {rec.auditCode ||
                                                        rec.auditId ||
                                                        "-"}
                                                </p>

                                                <p className="text-xs text-slate-500 mt-1">
                                                    {rec.auditName ||
                                                        "-"}
                                                </p>
                                            </td>

                                            {/* DEPARTMENT */}

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2
                                                        size={
                                                            16
                                                        }
                                                        className="text-blue-500"
                                                    />

                                                    <span className="inline-flex px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                                                        {rec.departmentName ||
                                                            "-"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* INTERNAL AUDITOR */}

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User
                                                        size={
                                                            15
                                                        }
                                                        className="text-teal-500"
                                                    />

                                                    <span className="text-sm text-slate-700">
                                                        {rec.internalAuditorName ||
                                                            "-"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* AUDITEE */}

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User
                                                        size={
                                                            15
                                                        }
                                                        className="text-slate-400"
                                                    />

                                                    <span className="text-sm text-slate-700">
                                                        {rec.auditeeName ||
                                                            "-"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* FINDING */}

                                            <td className="px-5 py-4 max-w-[220px]">
                                                <p className="text-sm text-slate-700 truncate">
                                                    {rec.findingTitle ||
                                                        "-"}
                                                </p>
                                            </td>

                                            {/* RECOMMENDATION */}

                                            <td className="px-5 py-4 max-w-[280px]">
                                                <p className="text-sm text-slate-600 truncate">
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

                                            {/* VIEW ONLY */}

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() =>
                                                            handleView(
                                                                rec
                                                            )
                                                        }
                                                        className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 transition"
                                                        title="View Recommendation"
                                                    >
                                                        <Eye
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </button>
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
                            className="w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
                        >
                            {/* HEADER */}

                            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-5 flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
                                            <FileText
                                                size={
                                                    18
                                                }
                                                className="text-teal-600"
                                            />
                                        </div>

                                        <div>
                                            <h2 className="text-lg font-semibold text-slate-900">
                                                Recommendation Details
                                            </h2>

                                            <p className="text-xs text-slate-500 mt-1">
                                                CAE View
                                            </p>
                                        </div>
                                    </div>
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
                                        size={
                                            19
                                        }
                                    />
                                </button>
                            </div>

                            {/* CONTENT */}

                            <div className="p-6 space-y-5">
                                {/* ID + STATUS */}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500">
                                            Recommendation ID
                                        </p>

                                        <p className="font-semibold text-slate-800 mt-1">
                                            {viewingRecommendation.recommendationId ||
                                                `#${viewingRecommendation.id}`}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500 mb-1">
                                            Status
                                        </p>

                                        <span
                                            className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold ${getStatusBadgeClass(
                                                viewingRecommendation.status
                                            )}`}
                                        >
                                            {getStatusLabel(
                                                viewingRecommendation.status
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* AUDIT */}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500">
                                            Audit ID
                                        </p>

                                        <p className="font-semibold text-slate-800 mt-1">
                                            {viewingRecommendation.auditCode ||
                                                viewingRecommendation.auditId ||
                                                "-"}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500">
                                            Audit Name
                                        </p>

                                        <p className="font-medium text-slate-800 mt-1">
                                            {viewingRecommendation.auditName ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>

                                {/* DEPARTMENT */}

                                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2
                                            size={
                                                17
                                            }
                                            className="text-blue-600"
                                        />

                                        <p className="text-xs font-semibold text-blue-700 uppercase">
                                            Department
                                        </p>
                                    </div>

                                    <p className="text-sm font-semibold text-slate-800">
                                        {viewingRecommendation.departmentName ||
                                            "-"}
                                    </p>
                                </div>

                                {/* PEOPLE */}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* INTERNAL AUDITOR */}

                                    <div className="p-4 rounded-xl border border-teal-100 bg-teal-50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User
                                                size={
                                                    17
                                                }
                                                className="text-teal-600"
                                            />

                                            <p className="text-xs font-semibold text-teal-700 uppercase">
                                                Internal Auditor
                                            </p>
                                        </div>

                                        <p className="text-sm font-semibold text-slate-800">
                                            {viewingRecommendation.internalAuditorName ||
                                                "-"}
                                        </p>
                                    </div>

                                    {/* AUDITEE */}

                                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User
                                                size={
                                                    17
                                                }
                                                className="text-slate-500"
                                            />

                                            <p className="text-xs font-semibold text-slate-600 uppercase">
                                                Auditee
                                            </p>
                                        </div>

                                        <p className="text-sm font-semibold text-slate-800">
                                            {viewingRecommendation.auditeeName ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>

                                {/* FINDING */}

                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                                        Finding
                                    </p>

                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                            {viewingRecommendation.findingTitle ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>

                                {/* RECOMMENDATION */}

                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                                        Recommendation
                                    </p>

                                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                            {viewingRecommendation.recommendationText ||
                                                "-"}
                                        </p>
                                    </div>
                                </div>

                                {/* CREATED */}

                                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                    <div>
                                        <p className="text-xs text-slate-500">
                                            Created On
                                        </p>

                                        <p className="text-sm font-medium text-slate-800 mt-1">
                                            {formatDate(
                                                viewingRecommendation.createdAt
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Eye
                                            size={
                                                14
                                            }
                                        />

                                        CAE View Only
                                    </div>
                                </div>

                                {/* CLOSE */}

                                <div className="flex justify-end pt-2">
                                    <button
                                        onClick={() =>
                                            setViewingRecommendation(
                                                null
                                            )
                                        }
                                        className="h-10 px-5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
                                    >
                                        Close
                                    </button>
                                </div>
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

export default CAERecommendations;