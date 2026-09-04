// AuditeeSubmitResponse.jsx
// Standalone page: stats cards + assigned findings/response table + submit modal
// Shows ONLY findings belonging to audits assigned to the logged-in Auditee.

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
    ClipboardList,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Search,
    RefreshCw,
    X,
    Send,
    Loader2,
    FileText,
    Info,
    Eye,
    MessageSquareText,
} from "lucide-react";

import { getFindingsByAuditId } from "../../service/FindingService";

import {
    getMyAuditeeAudits,
} from "../../service/AuditService";

import {
    submitAuditeeResponse,
    getResponsesByAuditee,
} from "../../service/auditeeResponseService";

// ============================================================
// CONSTANTS
// ============================================================

const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

// ============================================================
// ANIMATION
// ============================================================

const pageVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 15 },
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
    hidden: { opacity: 0, y: 8 },
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
// HELPER: GET CURRENT LOGGED-IN AUDITEE ID
// ============================================================

const getCurrentAuditeeId = () => {
    try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            const parsed = JSON.parse(storedUser);

            if (parsed?.id) return parsed.id;
            if (parsed?.userId) return parsed.userId;
            if (parsed?.auditeeId) return parsed.auditeeId;
        }

        const currentUser = localStorage.getItem("currentUser");

        if (currentUser) {
            const parsed = JSON.parse(currentUser);

            if (parsed?.id) return parsed.id;
            if (parsed?.userId) return parsed.userId;
            if (parsed?.auditeeId) return parsed.auditeeId;
        }

        const token = localStorage.getItem("token");

        if (token) {
            const payload = JSON.parse(
                atob(token.split(".")[1])
            );

            return (
                payload.id ||
                payload.userId ||
                payload.auditeeId ||
                payload.sub ||
                null
            );
        }
    } catch (err) {
        console.error(
            "Unable to resolve logged-in auditee ID:",
            err
        );
    }

    return null;
};

// ============================================================
// HELPER: NORMALIZE ARRAY RESPONSE
// ============================================================

const normalizeArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (Array.isArray(value?.data)) {
        return value.data;
    }

    if (Array.isArray(value?.content)) {
        return value.content;
    }

    return [];
};

// ============================================================
// HELPER: GET AUDIT LOOKUP ID
// ============================================================
// IMPORTANT:
// auditId / auditCode are checked first because your project
// uses business audit IDs such as AUD-001.
//
// Numeric DB id is only used as fallback.

const getAuditLookupId = (audit) => {
    const value =
        audit?.auditDbId ??
        audit?.id ??
        audit?.audit?.auditDbId ??
        audit?.audit?.id ??
        null;

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return null;
    }

    const numericId = Number(value);

    if (!Number.isInteger(numericId) || numericId <= 0) {
        console.warn(
            "Invalid numeric audit DB ID:",
            value,
            audit
        );
        return null;
    }

    return numericId;
};

// ============================================================
// HELPER: MAP HTTP ERRORS
// ============================================================

const getErrorMessage = (error) => {
    const status = error?.response?.status;

    switch (status) {
        case 400:
            return "Please check the response details.";

        case 401:
            return "Your session has expired. Please log in again.";

        case 403:
            return "You are not authorized to submit a response.";

        case 404:
            return "The selected finding could not be found.";

        case 500:
            return "Something went wrong on the server. Please try again.";

        default:
            return (
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Unable to submit response. Please try again."
            );
    }
};

// ============================================================
// STYLE HELPERS
// ============================================================

const getRiskClass = (risk) => {
    switch (risk) {
        case "CRITICAL":
            return "bg-red-100 text-red-800 border-red-200";

        case "HIGH":
            return "bg-orange-100 text-orange-800 border-orange-200";

        case "MEDIUM":
            return "bg-yellow-100 text-yellow-800 border-yellow-200";

        case "LOW":
            return "bg-green-100 text-green-800 border-green-200";

        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
};

const getResponseStatusClass = (status) => {
    switch (status) {
        case "SUBMITTED":
            return "bg-blue-50 text-blue-700 border-blue-200";

        case "APPROVED":
            return "bg-green-50 text-green-700 border-green-200";

        case "REJECTED":
            return "bg-red-50 text-red-700 border-red-200";

        case "DRAFT":
            return "bg-purple-50 text-purple-700 border-purple-200";

        default:
            return "bg-gray-50 text-gray-700 border-gray-200";
    }
};

const formatDate = (date) => {
    if (!date) return "-";

    try {
        return new Date(date).toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    } catch {
        return "-";
    }
};

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

const AuditeeSubmitResponse = () => {
    // ========================================================
    // STATE
    // ========================================================

    const [findings, setFindings] = useState([]);
    const [responses, setResponses] = useState([]);

    // Stores only audits assigned to current Auditee
    const [assignedAudits, setAssignedAudits] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [riskFilter, setRiskFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [submittingFor, setSubmittingFor] = useState(null);

    const [viewingResponse, setViewingResponse] =
        useState(null);

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
            const auditeeId = getCurrentAuditeeId();

            if (!auditeeId) {
                setError(
                    "Unable to identify logged-in user. Please log in again."
                );
                return;
            }

            // ==================================================
            // STEP 1:
            // GET ONLY AUDITS ASSIGNED TO CURRENT AUDITEE
            // ==================================================

            const assignedAuditsResponse =
                await getMyAuditeeAudits();

            const assignedAuditsData =
                normalizeArray(assignedAuditsResponse);

            console.log(
                "MY ASSIGNED AUDITS FOR AUDITEE:",
                assignedAuditsData
            );

            setAssignedAudits(
                assignedAuditsData
            );

            // ==================================================
            // STEP 2:
            // GET CURRENT AUDITEE'S EXISTING RESPONSES
            // ==================================================

            const responsesResponse =
                await getResponsesByAuditee(auditeeId)
                    .catch((err) => {
                        console.warn(
                            "No responses yet or response fetch failed:",
                            err
                        );

                        return [];
                    });

            const responsesData =
                normalizeArray(responsesResponse);

            console.log(
                "MY AUDITEE RESPONSES:",
                responsesData
            );

            setResponses(responsesData);

            // ==================================================
            // STEP 3:
            // EXTRACT ASSIGNED AUDIT IDS
            // ==================================================

            const auditLookupIds = [
                ...new Set(
                    assignedAuditsData
                        .map(getAuditLookupId)
                        .filter(Boolean)
                ),
            ];

            console.log(
                "AUDITS ASSIGNED TO CURRENT AUDITEE:",
                auditLookupIds
            );

            // No assigned audits
            if (auditLookupIds.length === 0) {
                setFindings([]);
                return;
            }

            // ==================================================
            // STEP 4:
            // GET FINDINGS ONLY FOR ASSIGNED AUDITS
            // ==================================================

            const findingsResults =
                await Promise.all(
                    auditLookupIds.map(
                        async (auditLookupId) => {
                            try {
                                const result =
                                    await getFindingsByAuditId(
                                        auditLookupId
                                    );

                                console.log(
                                    `FINDINGS FOR ASSIGNED AUDIT ${auditLookupId}:`,
                                    result
                                );

                                return normalizeArray(
                                    result
                                );
                            } catch (err) {
                                console.error(
                                    `Failed to load findings for audit ${auditLookupId}:`,
                                    err?.response?.data ||
                                        err
                                );

                                // Don't stop other assigned audits
                                return [];
                            }
                        }
                    )
                );

            // ==================================================
            // STEP 5:
            // MERGE FINDINGS + REMOVE DUPLICATES
            // ==================================================

            const allAssignedFindings =
                findingsResults.flat();

            const uniqueFindingsMap =
                new Map();

            allAssignedFindings.forEach(
                (finding) => {
                    if (
                        finding?.id !== undefined &&
                        finding?.id !== null
                    ) {
                        uniqueFindingsMap.set(
                            String(finding.id),
                            finding
                        );
                    }
                }
            );

            const uniqueAssignedFindings =
                Array.from(
                    uniqueFindingsMap.values()
                );

            console.log(
                "FINAL FINDINGS FOR CURRENT AUDITEE:",
                uniqueAssignedFindings
            );

            // ==================================================
            // IMPORTANT:
            // ONLY THESE FINDINGS ARE SHOWN TO AUDITEE
            // ==================================================

            setFindings(
                uniqueAssignedFindings
            );
        } catch (err) {
            console.error(
                "Failed to load assigned findings:",
                err?.response?.data || err
            );

            setError(
                err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    err?.message ||
                    "Failed to load assigned findings and responses."
            );
        } finally {
            setLoading(false);
        }
    };

    // ========================================================
    // ALLOWED FINDING IDS
    // ========================================================
    // Since findings state contains ONLY findings from
    // assigned audits, these are the only finding IDs that
    // can be submitted from this page.

    const allowedFindingIds = useMemo(() => {
        return new Set(
            findings
                .map((finding) => finding?.id)
                .filter(
                    (id) =>
                        id !== undefined &&
                        id !== null
                )
                .map((id) => String(id))
        );
    }, [findings]);

    // ========================================================
    // MERGE FINDINGS + RESPONSE STATUS
    // ========================================================

    const findingsWithResponseInfo =
        useMemo(() => {
            return findings.map((finding) => {
                const response =
                    responses.find(
                        (r) =>
                            String(
                                r?.findingId
                            ) ===
                            String(
                                finding?.id
                            )
                    );

                return {
                    ...finding,

                    responseStatus:
                        response?.status ||
                        "PENDING",

                    response:
                        response || null,
                };
            });
        }, [findings, responses]);

    // ========================================================
    // FILTERED LIST
    // ========================================================

    const filteredRows = useMemo(() => {
        return findingsWithResponseInfo.filter(
            (row) => {
                const search =
                    searchTerm
                        .trim()
                        .toLowerCase();

                const matchesSearch =
                    !search ||
                    String(
                        row.id || ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        row.title || ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        row.auditId || ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        row.auditCode || ""
                    )
                        .toLowerCase()
                        .includes(search) ||
                    String(
                        row.observation || ""
                    )
                        .toLowerCase()
                        .includes(search);

                const matchesRisk =
                    riskFilter === "ALL" ||
                    row.riskLevel ===
                        riskFilter;

                const matchesStatus =
                    statusFilter === "ALL" ||
                    (statusFilter ===
                        "PENDING" &&
                        row.responseStatus ===
                            "PENDING") ||
                    row.responseStatus ===
                        statusFilter;

                return (
                    matchesSearch &&
                    matchesRisk &&
                    matchesStatus
                );
            }
        );
    }, [
        findingsWithResponseInfo,
        searchTerm,
        riskFilter,
        statusFilter,
    ]);

    // ========================================================
    // STATISTICS
    // ========================================================

    const totalFindings =
        findingsWithResponseInfo.length;

    const pendingCount =
        findingsWithResponseInfo.filter(
            (row) =>
                row.responseStatus ===
                "PENDING"
        ).length;

    const submittedCount =
        findingsWithResponseInfo.filter(
            (row) =>
                row.responseStatus ===
                "SUBMITTED"
        ).length;

    const highRiskPendingCount =
        findingsWithResponseInfo.filter(
            (row) =>
                row.responseStatus ===
                    "PENDING" &&
                (row.riskLevel ===
                    "HIGH" ||
                    row.riskLevel ===
                        "CRITICAL")
        ).length;

    // ========================================================
    // RESET FILTERS
    // ========================================================

    const resetFilters = () => {
        setSearchTerm("");
        setRiskFilter("ALL");
        setStatusFilter("ALL");
    };

    // ========================================================
    // OPEN RESPONSE
    // ========================================================

    const handleOpenResponse = (finding) => {
        if (!finding?.id) {
            return;
        }

        // Extra frontend safety check
        if (
            !allowedFindingIds.has(
                String(finding.id)
            )
        ) {
            setError(
                "You can respond only to findings from audits assigned to you."
            );

            return;
        }

        setSubmittingFor(finding);
    };

    // ========================================================
    // AFTER SUCCESSFUL SUBMIT
    // ========================================================

    const handleSubmitSuccess = () => {
        setSubmittingFor(null);

        setToast(
            "Response submitted successfully"
        );

        loadData();

        setTimeout(() => {
            setToast("");
        }, 3000);
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
                        <MessageSquareText
                            size={22}
                            className="text-teal-600"
                        />
                    </div>

                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Submit Response
                        </h1>

                        <p className="text-sm text-slate-500 mt-1">
                            Respond to audit findings assigned to you
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
                        <span>{error}</span>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    {
                        label: "Total Findings",
                        value: totalFindings,
                        icon: ClipboardList,
                        bg: "bg-teal-50",
                        iconColor:
                            "text-teal-600",
                    },
                    {
                        label: "Pending Response",
                        value: pendingCount,
                        icon: Clock,
                        bg: "bg-amber-50",
                        iconColor:
                            "text-amber-600",
                    },
                    {
                        label: "High/Critical Pending",
                        value:
                            highRiskPendingCount,
                        icon: AlertTriangle,
                        bg: "bg-orange-50",
                        iconColor:
                            "text-orange-600",
                    },
                    {
                        label: "Submitted",
                        value: submittedCount,
                        icon: CheckCircle2,
                        bg: "bg-green-50",
                        iconColor:
                            "text-green-600",
                    },
                ].map(
                    (card, index) => {
                        const Icon =
                            card.icon;

                        return (
                            <motion.div
                                key={card.label}
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
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto_auto] gap-3">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            placeholder="Search findings..."
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

                    <select
                        value={riskFilter}
                        onChange={(e) =>
                            setRiskFilter(
                                e.target.value
                            )
                        }
                        className="h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-teal-400"
                    >
                        <option value="ALL">
                            All Risk Levels
                        </option>

                        {RISK_LEVELS.map(
                            (risk) => (
                                <option
                                    key={risk}
                                    value={
                                        risk
                                    }
                                >
                                    {risk}
                                </option>
                            )
                        )}
                    </select>

                    <select
                        value={
                            statusFilter
                        }
                        onChange={(e) =>
                            setStatusFilter(
                                e.target
                                    .value
                            )
                        }
                        className="h-11 px-4 rounded-xl border border-slate-200 bg-white outline-none focus:border-teal-400"
                    >
                        <option value="ALL">
                            All Response Status
                        </option>

                        <option value="PENDING">
                            Pending
                        </option>

                        <option value="SUBMITTED">
                            Submitted
                        </option>

                        <option value="APPROVED">
                            Approved
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
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Findings & Responses
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

                {loading ? (
                    <div className="p-6">
                        {[1, 2, 3, 4].map(
                            (item) => (
                                <div
                                    key={
                                        item
                                    }
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
                ) : filteredRows.length ===
                  0 ? (
                    <div className="py-16 text-center">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                            <ClipboardList
                                size={26}
                                className="text-slate-400"
                            />
                        </div>

                        <h3 className="text-lg font-medium text-slate-800">
                            No records found
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                            No assigned findings match the selected filters.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px]">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        ID
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Audit
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Finding
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Risk
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Response Status
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                                        Submitted On
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredRows.map(
                                    (
                                        row,
                                        index
                                    ) => (
                                        <motion.tr
                                            key={
                                                row.id
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
                                            {/* FINDING ID */}

                                            <td className="px-5 py-4">
                                                <span className="font-semibold text-teal-600">
                                                    FND-
                                                    {String(
                                                        row.id
                                                    ).padStart(
                                                        3,
                                                        "0"
                                                    )}
                                                </span>
                                            </td>

                                            {/* AUDIT ID */}

                                            <td className="px-5 py-4">
                                                <span className="font-medium text-slate-700">
                                                    {row.auditId ??
                                                        row.auditCode ??
                                                        row.audit?.auditId ??
                                                        row.audit?.auditCode ??
                                                        "—"}
                                                </span>
                                            </td>

                                            {/* FINDING */}

                                            <td className="px-5 py-4 max-w-[300px]">
                                                <p className="font-medium text-slate-800 truncate">
                                                    {
                                                        row.title
                                                    }
                                                </p>

                                                <p className="text-xs text-slate-500 truncate mt-1">
                                                    {
                                                        row.observation ||
                                                        "-"
                                                    }
                                                </p>
                                            </td>

                                            {/* RISK */}

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex px-3 py-1 rounded-full border text-xs font-medium ${getRiskClass(
                                                        row.riskLevel
                                                    )}`}
                                                >
                                                    {row.riskLevel ||
                                                        "-"}
                                                </span>
                                            </td>

                                            {/* RESPONSE STATUS */}

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex px-3 py-1 rounded-full border text-xs font-medium ${getResponseStatusClass(
                                                        row.responseStatus
                                                    )}`}
                                                >
                                                    {
                                                        row.responseStatus
                                                    }
                                                </span>
                                            </td>

                                            {/* SUBMITTED DATE */}

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {formatDate(
                                                    row
                                                        .response
                                                        ?.submittedAt
                                                )}
                                            </td>

                                            {/* ACTION */}

                                            <td className="px-5 py-4">
                                                <div className="flex justify-end">
                                                    {row.responseStatus ===
                                                    "PENDING" ? (
                                                        <button
                                                            onClick={() =>
                                                                handleOpenResponse(
                                                                    row
                                                                )
                                                            }
                                                            className="h-9 px-3 rounded-lg bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-900 transition"
                                                        >
                                                            <Send
                                                                size={
                                                                    14
                                                                }
                                                            />

                                                            Respond
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                setViewingResponse(
                                                                    row.response
                                                                )
                                                            }
                                                            className="h-9 px-3 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-teal-100 transition"
                                                        >
                                                            <Eye
                                                                size={
                                                                    14
                                                                }
                                                            />

                                                            View
                                                        </button>
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
                SUBMIT RESPONSE MODAL
            ================================================== */}

            <AnimatePresence>
                {submittingFor && (
                    <SubmitResponseModal
                        finding={
                            submittingFor
                        }
                        allowedFindingIds={
                            allowedFindingIds
                        }
                        onCancel={() =>
                            setSubmittingFor(
                                null
                            )
                        }
                        onSuccess={
                            handleSubmitSuccess
                        }
                    />
                )}
            </AnimatePresence>

            {/* ==================================================
                VIEW RESPONSE MODAL
            ================================================== */}

            <AnimatePresence>
                {viewingResponse && (
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
                            setViewingResponse(
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
                            className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Your Response
                                </h2>

                                <button
                                    onClick={() =>
                                        setViewingResponse(
                                            null
                                        )
                                    }
                                    className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center"
                                >
                                    <X
                                        size={
                                            19
                                        }
                                    />
                                </button>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">
                                        Status
                                    </p>

                                    <span
                                        className={`inline-flex px-3 py-1 rounded-full border text-xs font-medium ${getResponseStatusClass(
                                            viewingResponse.status
                                        )}`}
                                    >
                                        {
                                            viewingResponse.status
                                        }
                                    </span>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500 mb-1">
                                        Response
                                    </p>

                                    <p className="text-slate-700 bg-slate-50 rounded-xl p-3 whitespace-pre-wrap">
                                        {viewingResponse.responseText ||
                                            "-"}
                                    </p>
                                </div>

                                {viewingResponse.rootCause && (
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">
                                            Root Cause
                                        </p>

                                        <p className="text-slate-700 bg-slate-50 rounded-xl p-3 whitespace-pre-wrap">
                                            {
                                                viewingResponse.rootCause
                                            }
                                        </p>
                                    </div>
                                )}

                                {viewingResponse.correctiveAction && (
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">
                                            Corrective Action
                                        </p>

                                        <p className="text-slate-700 bg-slate-50 rounded-xl p-3 whitespace-pre-wrap">
                                            {
                                                viewingResponse.correctiveAction
                                            }
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">
                                            Target Completion
                                        </p>

                                        <p className="text-slate-700 font-medium">
                                            {formatDate(
                                                viewingResponse.targetCompletionDate
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">
                                            Submitted On
                                        </p>

                                        <p className="text-slate-700 font-medium">
                                            {formatDate(
                                                viewingResponse.submittedAt
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {viewingResponse.reviewComments && (
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">
                                            Review Comments
                                        </p>

                                        <p className="text-slate-700 bg-amber-50 rounded-xl p-3 whitespace-pre-wrap">
                                            {
                                                viewingResponse.reviewComments
                                            }
                                        </p>
                                    </div>
                                )}
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
                        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-5 py-3 shadow-lg text-sm font-medium"
                    >
                        <CheckCircle2
                            size={18}
                        />

                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ============================================================
// RISK BADGE
// ============================================================

const RiskBadge = ({ level }) => {
    const styles = {
        HIGH: "bg-red-500/10 text-red-400 border-red-500/30",

        CRITICAL:
            "bg-red-500/10 text-red-400 border-red-500/30",

        MEDIUM:
            "bg-amber-500/10 text-amber-400 border-amber-500/30",

        LOW:
            "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    };

    const style =
        styles[level?.toUpperCase()] ||
        "bg-slate-500/10 text-slate-400 border-slate-500/30";

    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${style}`}
        >
            {level || "N/A"}
        </span>
    );
};

// ============================================================
// SUBMIT RESPONSE MODAL
// ============================================================

const SubmitResponseModal = ({
    finding,
    allowedFindingIds,
    onCancel,
    onSuccess,
}) => {
    const [formData, setFormData] =
        useState({
            responseText: "",
            rootCause: "",
            correctiveAction: "",
            targetCompletionDate: "",
        });

    const [errors, setErrors] =
        useState({});

    const [submitting, setSubmitting] =
        useState(false);

    const [apiError, setApiError] =
        useState("");

    const [successMsg, setSuccessMsg] =
        useState("");

    // ========================================================
    // HANDLE INPUT
    // ========================================================

    const handleChange =
        (field) => (e) => {
            setFormData((prev) => ({
                ...prev,
                [field]:
                    e.target.value,
            }));

            if (errors[field]) {
                setErrors((prev) => {
                    const next = {
                        ...prev,
                    };

                    delete next[field];

                    return next;
                });
            }
        };

    // ========================================================
    // VALIDATION
    // ========================================================

    const validate = () => {
        const newErrors = {};

        if (
            !formData.responseText.trim()
        ) {
            newErrors.responseText =
                "Response is required.";
        } else if (
            formData.responseText
                .trim()
                .length < 10
        ) {
            newErrors.responseText =
                "Response must be at least 10 characters.";
        }

        if (
            formData.targetCompletionDate
        ) {
            const selectedDate =
                new Date(
                    formData.targetCompletionDate
                );

            const today =
                new Date();

            today.setHours(
                0,
                0,
                0,
                0
            );

            if (
                selectedDate <
                today
            ) {
                newErrors.targetCompletionDate =
                    "Target completion date cannot be in the past.";
            }
        }

        setErrors(newErrors);

        return (
            Object.keys(
                newErrors
            ).length === 0
        );
    };

    // ========================================================
    // SUBMIT RESPONSE
    // ========================================================

    const handleSubmit = async (
        e
    ) => {
        e.preventDefault();

        setApiError("");
        setSuccessMsg("");

        // ==================================================
        // EXTRA ASSIGNMENT CHECK
        // ==================================================

        const findingId =
            finding?.id != null
                ? String(finding.id)
                : "";

        if (
            !findingId ||
            !allowedFindingIds?.has(
                findingId
            )
        ) {
            setApiError(
                "You can respond only to findings from audits assigned to you."
            );

            return;
        }

        // ==================================================
        // FORM VALIDATION
        // ==================================================

        if (!validate()) {
            return;
        }

        // ==================================================
        // CURRENT AUDITEE
        // ==================================================

        const auditeeId =
            getCurrentAuditeeId();

        if (!auditeeId) {
            setApiError(
                "Unable to identify logged-in user. Please log in again."
            );

            return;
        }

        setSubmitting(true);

        try {
            // ==================================================
            // RESPONSE PAYLOAD
            // ==================================================

            const payload = {
                findingId:
                    finding.id,

                auditeeId,

                responseText:
                    formData.responseText.trim(),

                rootCause:
                    formData.rootCause.trim() ||
                    null,

                correctiveAction:
                    formData.correctiveAction.trim() ||
                    null,

                targetCompletionDate:
                    formData.targetCompletionDate ||
                    null,
            };

            console.log(
                "SUBMITTING AUDITEE RESPONSE:",
                payload
            );

            // ==================================================
            // CREATE RESPONSE
            // ==================================================

            const result =
                await submitAuditeeResponse(
                    payload
                );

            console.log(
                "AUDITEE RESPONSE CREATED:",
                result
            );

            setSuccessMsg(
                "Response submitted successfully"
            );

            // Give success message a moment
            // before closing modal.

            setTimeout(() => {
                onSuccess?.(result);
            }, 800);
        } catch (error) {
            console.error(
                "Failed to submit auditee response:",
                error?.response
                    ?.data || error
            );

            setApiError(
                getErrorMessage(
                    error
                )
            );
        } finally {
            setSubmitting(false);
        }
    };

    // ========================================================
    // TODAY
    // ========================================================

    const today =
        new Date()
            .toISOString()
            .split("T")[0];

    // ========================================================
    // MODAL UI
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
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
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl"
            >
                {/* HEADER */}

                <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-700/50 bg-slate-900/95 backdrop-blur px-6 py-5">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Submit Response
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Respond to the audit finding and provide corrective action details.
                        </p>
                    </div>

                    <button
                        onClick={
                            onCancel
                        }
                        disabled={
                            submitting
                        }
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-6">
                    {/* SUCCESS */}

                    {successMsg && (
                        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                            <CheckCircle2
                                size={18}
                            />

                            {successMsg}
                        </div>
                    )}

                    {/* ERROR */}

                    {apiError && (
                        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            <AlertTriangle
                                size={18}
                            />

                            {apiError}
                        </div>
                    )}

                    {/* ==================================================
                        FINDING INFORMATION
                    ================================================== */}

                    <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText
                                size={16}
                                className="text-teal-400"
                            />

                            <h3 className="text-sm font-semibold text-white">
                                Finding Information
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-500 text-xs mb-1">
                                    Finding ID
                                </p>

                                <p className="text-slate-200 font-medium">
                                    #{finding.id}
                                </p>
                            </div>

                            <div>
                                <p className="text-slate-500 text-xs mb-1">
                                    Audit ID
                                </p>

                                <p className="text-slate-200 font-medium">
                                    {finding.auditId ??
                                        finding.auditCode ??
                                        finding.audit?.auditId ??
                                        finding.audit?.auditCode ??
                                        "—"}
                                </p>
                            </div>

                            <div className="col-span-2">
                                <p className="text-slate-500 text-xs mb-1">
                                    Finding Title
                                </p>

                                <p className="text-slate-200 font-medium">
                                    {finding.title ||
                                        "—"}
                                </p>
                            </div>

                            <div>
                                <p className="text-slate-500 text-xs mb-1">
                                    Risk Level
                                </p>

                                <RiskBadge
                                    level={
                                        finding.riskLevel
                                    }
                                />
                            </div>
                        </div>

                        {finding.observation && (
                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                                <p className="text-slate-500 text-xs mb-1">
                                    Observation
                                </p>

                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {
                                        finding.observation
                                    }
                                </p>
                            </div>
                        )}

                        {finding.recommendation && (
                            <div className="mt-4">
                                <p className="text-slate-500 text-xs mb-1">
                                    Recommendation
                                </p>

                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {
                                        finding.recommendation
                                    }
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ==================================================
                        FORM
                    ================================================== */}

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="space-y-5"
                    >
                        {/* RESPONSE */}

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Response / Management Response{" "}
                                <span className="text-red-400">
                                    *
                                </span>
                            </label>

                            <textarea
                                rows={4}
                                value={
                                    formData.responseText
                                }
                                onChange={handleChange(
                                    "responseText"
                                )}
                                disabled={
                                    submitting
                                }
                                placeholder="Enter your response to the audit finding..."
                                className={`w-full rounded-lg border bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:ring-2 disabled:opacity-50 ${
                                    errors.responseText
                                        ? "border-red-500/50 focus:ring-red-500/30"
                                        : "border-slate-700 focus:border-teal-500/50 focus:ring-teal-500/20"
                                }`}
                            />

                            {errors.responseText && (
                                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                                    <AlertTriangle
                                        size={
                                            12
                                        }
                                    />

                                    {
                                        errors.responseText
                                    }
                                </p>
                            )}
                        </div>

                        {/* ROOT CAUSE */}

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Root Cause
                            </label>

                            <textarea
                                rows={3}
                                value={
                                    formData.rootCause
                                }
                                onChange={handleChange(
                                    "rootCause"
                                )}
                                disabled={
                                    submitting
                                }
                                placeholder="Explain the root cause of the finding..."
                                className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50"
                            />
                        </div>

                        {/* CORRECTIVE ACTION */}

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Corrective Action
                            </label>

                            <textarea
                                rows={3}
                                value={
                                    formData.correctiveAction
                                }
                                onChange={handleChange(
                                    "correctiveAction"
                                )}
                                disabled={
                                    submitting
                                }
                                placeholder="Describe the corrective action taken or planned..."
                                className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50"
                            />
                        </div>

                        {/* TARGET COMPLETION DATE */}

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                Target Completion Date
                            </label>

                            <input
                                type="date"
                                min={today}
                                value={
                                    formData.targetCompletionDate
                                }
                                onChange={handleChange(
                                    "targetCompletionDate"
                                )}
                                disabled={
                                    submitting
                                }
                                className={`w-full rounded-lg border bg-slate-800/60 px-3.5 py-2.5 text-sm text-slate-200 outline-none transition-colors focus:ring-2 disabled:opacity-50 [color-scheme:dark] ${
                                    errors.targetCompletionDate
                                        ? "border-red-500/50 focus:ring-red-500/30"
                                        : "border-slate-700 focus:border-teal-500/50 focus:ring-teal-500/20"
                                }`}
                            />

                            {errors.targetCompletionDate && (
                                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                                    <AlertTriangle
                                        size={
                                            12
                                        }
                                    />

                                    {
                                        errors.targetCompletionDate
                                    }
                                </p>
                            )}
                        </div>

                        {/* INFO */}

                        <div className="flex items-start gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 px-3.5 py-2.5">
                            <Info
                                size={14}
                                className="mt-0.5 shrink-0 text-slate-500"
                            />

                            <p className="text-xs text-slate-500">
                                Once submitted, your response will be sent for review. You will not be able to edit it after submission.
                            </p>
                        </div>

                        {/* BUTTONS */}

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-700/50">
                            <button
                                type="button"
                                onClick={
                                    onCancel
                                }
                                disabled={
                                    submitting
                                }
                                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    submitting
                                }
                                className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2
                                            size={
                                                16
                                            }
                                            className="animate-spin"
                                        />

                                        Submitting Response...
                                    </>
                                ) : (
                                    <>
                                        <Send
                                            size={
                                                16
                                            }
                                        />

                                        Submit Response
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

export default AuditeeSubmitResponse;