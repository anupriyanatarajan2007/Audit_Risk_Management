import React, { useEffect, useMemo, useState } from "react";

import {
    Search,
    RefreshCw,
    Eye,
    X,
    Lightbulb,
    CheckCircle2,
    Clock3,
    XCircle,
    FileText,
    User,
    CalendarDays,
    ShieldCheck,
    AlertCircle,
    CircleCheck,
} from "lucide-react";

import { getAllRecommendations } from "../../service/recommendationService";


// ============================================================
// COMPONENT
// ============================================================

const ComplianceRecommendations = () => {

    const [recommendations, setRecommendations] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");

    const [selectedRecommendation, setSelectedRecommendation] =
        useState(null);

    const [error, setError] = useState("");


    // ============================================================
    // LOAD RECOMMENDATIONS
    // ============================================================

    const loadRecommendations = async (isRefresh = false) => {

        try {

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");


            const response = await getAllRecommendations();

            console.log(
                "Compliance recommendations response:",
                response
            );


            /*
             * Supports:
             *
             * [
             *   {...}
             * ]
             *
             * OR
             *
             * {
             *   success: true,
             *   data: [...]
             * }
             */


            let data = [];


            if (Array.isArray(response)) {

                data = response;

            } else if (Array.isArray(response?.data)) {

                data = response.data;

            } else if (Array.isArray(response?.data?.data)) {

                data = response.data.data;

            }


            console.log(
                "Normalized recommendations:",
                data
            );


            setRecommendations(data);

        } catch (err) {

            console.error(
                "Failed to load recommendations:",
                err
            );


            setError(
                err?.response?.data?.message ||
                "Unable to load recommendations."
            );


            setRecommendations([]);

        } finally {

            setLoading(false);

            setRefreshing(false);
        }
    };


    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {

        loadRecommendations();

    }, []);


    // ============================================================
    // FILTER
    // ============================================================

    const filteredRecommendations = useMemo(() => {

        return recommendations.filter((recommendation) => {

            const searchText =
                search.toLowerCase().trim();


            const matchesSearch =
                !searchText ||

                String(
                    recommendation?.recommendationId || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||

                String(
                    recommendation?.recommendationText || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||

                String(
                    recommendation?.auditCode || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||

                String(
                    recommendation?.auditName || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||

                String(
                    recommendation?.findingTitle || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||

                String(
                    recommendation?.auditeeName || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||

                String(
                    recommendation?.internalAuditorName || ""
                )
                    .toLowerCase()
                    .includes(searchText);


            const matchesStatus =
                statusFilter === "ALL" ||
                recommendation?.status === statusFilter;


            return (
                matchesSearch &&
                matchesStatus
            );
        });

    }, [
        recommendations,
        search,
        statusFilter,
    ]);


    // ============================================================
    // SUMMARY
    // ============================================================

    const summary = useMemo(() => {

        return {

            total:
                recommendations.length,


            pending:
                recommendations.filter(
                    (item) =>
                        item?.status === "PENDING"
                ).length,


            completed:
                recommendations.filter(
                    (item) =>
                        item?.status === "COMPLETED"
                ).length,


            approved:
                recommendations.filter(
                    (item) =>
                        item?.status === "APPROVED"
                ).length,


            rejected:
                recommendations.filter(
                    (item) =>
                        item?.status === "REJECTED" ||
                        item?.status === "RETURNED"
                ).length,

        };

    }, [recommendations]);


    // ============================================================
    // STATUS BADGE
    // ============================================================

    const getStatusBadge = (status) => {

        const normalizedStatus =
            String(status || "")
                .trim()
                .toUpperCase();


        switch (normalizedStatus) {


            // ----------------------------------------------------
            // COMPLETED
            // ----------------------------------------------------

            case "COMPLETED":

                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">

                        <CircleCheck size={14} />

                        Completed

                    </span>
                );


            // ----------------------------------------------------
            // APPROVED
            // ----------------------------------------------------

            case "APPROVED":

                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">

                        <CheckCircle2 size={14} />

                        Approved

                    </span>
                );


            // ----------------------------------------------------
            // REJECTED
            // ----------------------------------------------------

            case "REJECTED":

                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">

                        <XCircle size={14} />

                        Rejected

                    </span>
                );


            // ----------------------------------------------------
            // RETURNED
            // ----------------------------------------------------

            case "RETURNED":

                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">

                        <AlertCircle size={14} />

                        Returned

                    </span>
                );


            // ----------------------------------------------------
            // PENDING
            // ----------------------------------------------------

            case "PENDING":

                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">

                        <Clock3 size={14} />

                        Pending

                    </span>
                );


            // ----------------------------------------------------
            // DEFAULT
            // ----------------------------------------------------

            default:

                return (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">

                        <Clock3 size={14} />

                        {status || "Unknown"}

                    </span>
                );
        }
    };


    // ============================================================
    // DATE FORMAT
    // ============================================================

    const formatDate = (date) => {

        if (!date) {
            return "N/A";
        }


        try {

            return new Date(date).toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );

        } catch {

            return "N/A";
        }
    };


    // ============================================================
    // FULL DATE TIME
    // ============================================================

    const formatDateTime = (date) => {

        if (!date) {
            return "N/A";
        }


        try {

            return new Date(date).toLocaleString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );

        } catch {

            return "N/A";
        }
    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (
            <div className="min-h-screen bg-slate-50 p-6">

                <div className="animate-pulse space-y-6">

                    <div className="h-10 w-80 rounded-lg bg-slate-200" />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">

                        {[1, 2, 3, 4, 5].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="h-28 rounded-2xl bg-white shadow-sm"
                                />
                            )
                        )}

                    </div>


                    <div className="h-96 rounded-2xl bg-white shadow-sm" />

                </div>

            </div>
        );
    }


    // ============================================================
    // PAGE
    // ============================================================

    return (

        <div className="min-h-screen bg-slate-50 p-4 md:p-6">

            <div className="mx-auto max-w-[1600px]">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    <div>

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">

                                <Lightbulb size={23} />

                            </div>


                            <div>

                                <h1 className="text-2xl font-bold text-slate-900">

                                    Recommendations

                                </h1>


                                <p className="mt-1 text-sm text-slate-500">

                                    Review recommendations submitted by Internal Auditors

                                </p>

                            </div>

                        </div>

                    </div>


                    <button
                        onClick={() =>
                            loadRecommendations(true)
                        }
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
                    >

                        <RefreshCw
                            size={17}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}

                    </button>

                </div>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                        <AlertCircle size={18} />

                        <span>{error}</span>

                    </div>

                )}


                {/* ==================================================
                    SUMMARY CARDS
                ================================================== */}

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">


                    {/* TOTAL */}

                    <SummaryCard
                        title="Total Recommendations"
                        value={summary.total}
                        icon={<Lightbulb size={22} />}
                        iconClass="bg-indigo-50 text-indigo-600"
                        valueClass="text-slate-900"
                    />


                    {/* PENDING */}

                    <SummaryCard
                        title="Pending Review"
                        value={summary.pending}
                        icon={<Clock3 size={22} />}
                        iconClass="bg-amber-50 text-amber-600"
                        valueClass="text-amber-600"
                    />


                    {/* COMPLETED */}

                    <SummaryCard
                        title="Completed"
                        value={summary.completed}
                        icon={<CircleCheck size={22} />}
                        iconClass="bg-blue-50 text-blue-600"
                        valueClass="text-blue-600"
                    />


                    {/* APPROVED */}

                    <SummaryCard
                        title="Approved"
                        value={summary.approved}
                        icon={<CheckCircle2 size={22} />}
                        iconClass="bg-emerald-50 text-emerald-600"
                        valueClass="text-emerald-600"
                    />


                    {/* REJECTED */}

                    <SummaryCard
                        title="Returned / Rejected"
                        value={summary.rejected}
                        icon={<XCircle size={22} />}
                        iconClass="bg-red-50 text-red-600"
                        valueClass="text-red-600"
                    />

                </div>


                {/* ==================================================
                    FILTER BAR
                ================================================== */}

                <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                    <div className="flex flex-col gap-3 lg:flex-row">


                        {/* SEARCH */}

                        <div className="relative flex-1">

                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search recommendation, audit, finding, auditor or auditee..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                            />

                        </div>


                        {/* STATUS */}

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        >

                            <option value="ALL">
                                All Status
                            </option>

                            <option value="PENDING">
                                Pending
                            </option>

                            <option value="COMPLETED">
                                Completed
                            </option>

                            <option value="APPROVED">
                                Approved
                            </option>

                            <option value="RETURNED">
                                Returned
                            </option>

                            <option value="REJECTED">
                                Rejected
                            </option>

                        </select>

                    </div>

                </div>


                {/* ==================================================
                    TABLE
                ================================================== */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <table className="min-w-[1250px] w-full">

                            <thead>

                                <tr className="border-b border-slate-200 bg-slate-50">

                                    <TableHeader>
                                        Recommendation
                                    </TableHeader>

                                    <TableHeader>
                                        Audit
                                    </TableHeader>

                                    <TableHeader>
                                        Finding
                                    </TableHeader>

                                    <TableHeader>
                                        Internal Auditor
                                    </TableHeader>

                                    <TableHeader>
                                        Auditee
                                    </TableHeader>

                                    <TableHeader>
                                        Status
                                    </TableHeader>

                                    <TableHeader>
                                        Created
                                    </TableHeader>

                                    <TableHeader center>
                                        Action
                                    </TableHeader>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-slate-100">


                                {filteredRecommendations.length ===
                                0 ? (

                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="px-6 py-16 text-center"
                                        >

                                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">

                                                <Lightbulb size={25} />

                                            </div>


                                            <p className="mt-4 font-semibold text-slate-700">

                                                No recommendations found

                                            </p>


                                            <p className="mt-1 text-sm text-slate-500">

                                                Try changing your search or status filter.

                                            </p>

                                        </td>

                                    </tr>

                                ) : (

                                    filteredRecommendations.map(
                                        (recommendation) => (

                                            <tr
                                                key={
                                                    recommendation.id ||
                                                    recommendation.recommendationId
                                                }
                                                className="transition hover:bg-slate-50"
                                            >


                                                {/* ==================================
                                                    RECOMMENDATION
                                                ================================== */}

                                                <td className="px-5 py-4">

                                                    <div className="max-w-[280px]">

                                                        <p className="font-semibold text-slate-800">

                                                            {
                                                                recommendation.recommendationId ||
                                                                `REC-${recommendation.id}`
                                                            }

                                                        </p>


                                                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">

                                                            {
                                                                recommendation.recommendationText ||
                                                                "No recommendation text"
                                                            }

                                                        </p>

                                                    </div>

                                                </td>


                                                {/* ==================================
                                                    AUDIT
                                                ================================== */}

                                                <td className="px-5 py-4">

                                                    <p className="font-semibold text-slate-800">

                                                        {
                                                            recommendation.auditCode ||
                                                            "N/A"
                                                        }

                                                    </p>


                                                    <p className="mt-1 text-xs text-slate-500">

                                                        {
                                                            recommendation.auditName ||
                                                            "N/A"
                                                        }

                                                    </p>


                                                    <p className="mt-1 text-[11px] text-slate-400">

                                                        DB ID:{" "}
                                                        {
                                                            recommendation.auditId ||
                                                            "N/A"
                                                        }

                                                    </p>

                                                </td>


                                                {/* ==================================
                                                    FINDING
                                                ================================== */}

                                                <td className="px-5 py-4">

                                                    <p className="font-medium text-slate-700">

                                                        {
                                                            recommendation.findingTitle ||
                                                            "N/A"
                                                        }

                                                    </p>


                                                    <p className="mt-1 text-xs text-slate-400">

                                                        Finding ID:{" "}

                                                        {
                                                            recommendation.findingId ||
                                                            "N/A"
                                                        }

                                                    </p>

                                                </td>


                                                {/* ==================================
                                                    INTERNAL AUDITOR
                                                ================================== */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-2">

                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">

                                                            <User size={15} />

                                                        </div>


                                                        <div>

                                                            <p className="text-sm font-medium text-slate-700">

                                                                {
                                                                    recommendation.internalAuditorName ||
                                                                    "N/A"
                                                                }

                                                            </p>


                                                            <p className="text-xs text-slate-400">

                                                                ID:{" "}
                                                                {
                                                                    recommendation.internalAuditorId ||
                                                                    "N/A"
                                                                }

                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* ==================================
                                                    AUDITEE
                                                ================================== */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-2">

                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">

                                                            <User size={15} />

                                                        </div>


                                                        <div>

                                                            <p className="text-sm font-medium text-slate-700">

                                                                {
                                                                    recommendation.auditeeName ||
                                                                    "N/A"
                                                                }

                                                            </p>


                                                            <p className="text-xs text-slate-400">

                                                                {
                                                                    recommendation.auditeeEmail ||
                                                                    ""
                                                                }

                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* ==================================
                                                    STATUS
                                                ================================== */}

                                                <td className="px-5 py-4">

                                                    {
                                                        getStatusBadge(
                                                            recommendation.status
                                                        )
                                                    }

                                                </td>


                                                {/* ==================================
                                                    CREATED
                                                ================================== */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-2 text-sm text-slate-600">

                                                        <CalendarDays
                                                            size={15}
                                                            className="text-slate-400"
                                                        />

                                                        {
                                                            formatDate(
                                                                recommendation.createdAt
                                                            )
                                                        }

                                                    </div>

                                                </td>


                                                {/* ==================================
                                                    ACTION
                                                ================================== */}

                                                <td className="px-5 py-4 text-center">

                                                    <button
                                                        onClick={() =>
                                                            setSelectedRecommendation(
                                                                recommendation
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                                    >

                                                        <Eye size={15} />

                                                        View

                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>


                    {/* ==============================================
                        FOOTER
                    ============================================== */}

                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">

                        <p className="text-xs text-slate-500">

                            Showing{" "}

                            <span className="font-semibold text-slate-700">

                                {filteredRecommendations.length}

                            </span>

                            {" "}of{" "}

                            <span className="font-semibold text-slate-700">

                                {recommendations.length}

                            </span>

                            {" "}recommendations

                        </p>

                    </div>

                </div>

            </div>


            {/* ======================================================
                VIEW MODAL
            ====================================================== */}

            {selectedRecommendation && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

                    <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">


                        {/* ==========================================
                            MODAL HEADER
                        ========================================== */}

                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">

                                    <Lightbulb size={20} />

                                </div>


                                <div>

                                    <h2 className="text-lg font-bold text-slate-900">

                                        Recommendation Details

                                    </h2>


                                    <p className="text-xs text-slate-500">

                                        {
                                            selectedRecommendation.recommendationId ||
                                            `REC-${selectedRecommendation.id}`
                                        }

                                    </p>

                                </div>

                            </div>


                            <button
                                onClick={() =>
                                    setSelectedRecommendation(null)
                                }
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >

                                <X size={20} />

                            </button>

                        </div>


                        {/* ==========================================
                            MODAL BODY
                        ========================================== */}

                        <div className="max-h-[72vh] overflow-y-auto p-6">


                            {/* ======================================
                                STATUS
                            ====================================== */}

                            <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">

                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">

                                        Current Status

                                    </p>

                                    <div className="mt-2">

                                        {
                                            getStatusBadge(
                                                selectedRecommendation.status
                                            )
                                        }

                                    </div>

                                </div>


                                <div className="text-right">

                                    <p className="text-xs text-slate-400">

                                        Recommendation ID

                                    </p>

                                    <p className="mt-1 font-semibold text-slate-800">

                                        {
                                            selectedRecommendation.recommendationId ||
                                            `REC-${selectedRecommendation.id}`
                                        }

                                    </p>

                                </div>

                            </div>


                            {/* ======================================
                                RECOMMENDATION TEXT
                            ====================================== */}

                            <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">

                                <div className="mb-2 flex items-center gap-2">

                                    <Lightbulb
                                        size={17}
                                        className="text-indigo-600"
                                    />

                                    <h3 className="font-semibold text-slate-800">

                                        Recommendation

                                    </h3>

                                </div>


                                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">

                                    {
                                        selectedRecommendation.recommendationText ||
                                        "No recommendation text available."
                                    }

                                </p>

                            </div>


                            {/* ======================================
                                AUDIT INFORMATION
                            ====================================== */}

                            <div className="mb-6">

                                <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">

                                    <FileText
                                        size={18}
                                        className="text-indigo-600"
                                    />

                                    Audit Information

                                </h3>


                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                    <DetailItem
                                        label="Audit Code"
                                        value={
                                            selectedRecommendation.auditCode
                                        }
                                    />


                                    <DetailItem
                                        label="Audit Database ID"
                                        value={
                                            selectedRecommendation.auditId
                                        }
                                    />


                                    <DetailItem
                                        label="Audit Name"
                                        value={
                                            selectedRecommendation.auditName
                                        }
                                    />


                                    <DetailItem
                                        label="Finding"
                                        value={
                                            selectedRecommendation.findingTitle
                                        }
                                    />

                                </div>

                            </div>


                            {/* ======================================
                                PEOPLE
                            ====================================== */}

                            <div className="mb-6">

                                <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">

                                    <User
                                        size={18}
                                        className="text-indigo-600"
                                    />

                                    Responsible Persons

                                </h3>


                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">


                                    <PersonCard
                                        title="Internal Auditor"
                                        name={
                                            selectedRecommendation.internalAuditorName
                                        }
                                        id={
                                            selectedRecommendation.internalAuditorId
                                        }
                                    />


                                    <PersonCard
                                        title="Auditee"
                                        name={
                                            selectedRecommendation.auditeeName
                                        }
                                        id={
                                            selectedRecommendation.auditeeId
                                        }
                                        email={
                                            selectedRecommendation.auditeeEmail
                                        }
                                    />

                                </div>

                            </div>


                            {/* ======================================
                                REFERENCE INFORMATION
                            ====================================== */}

                            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">

                                <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">

                                    <ShieldCheck
                                        size={18}
                                        className="text-indigo-600"
                                    />

                                    Reference Information

                                </h3>


                                <div className="grid grid-cols-2 gap-5 md:grid-cols-4">


                                    <ReferenceItem
                                        label="Recommendation ID"
                                        value={
                                            selectedRecommendation.recommendationId
                                        }
                                    />


                                    <ReferenceItem
                                        label="Audit ID"
                                        value={
                                            selectedRecommendation.auditId
                                        }
                                    />


                                    <ReferenceItem
                                        label="Finding ID"
                                        value={
                                            selectedRecommendation.findingId
                                        }
                                    />


                                    <ReferenceItem
                                        label="Status"
                                        value={
                                            selectedRecommendation.status
                                        }
                                    />

                                </div>

                            </div>


                            {/* ======================================
                                DATES
                            ====================================== */}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                <DateCard
                                    title="Created At"
                                    value={
                                        selectedRecommendation.createdAt
                                    }
                                />


                                <DateCard
                                    title="Last Updated"
                                    value={
                                        selectedRecommendation.updatedAt
                                    }
                                />

                            </div>

                        </div>


                        {/* ==========================================
                            MODAL FOOTER
                        ========================================== */}

                        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">

                            <button
                                onClick={() =>
                                    setSelectedRecommendation(null)
                                }
                                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >

                                Close

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


// ============================================================
// SUMMARY CARD
// ============================================================

const SummaryCard = ({
    title,
    value,
    icon,
    iconClass,
    valueClass,
}) => {

    return (

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm font-medium text-slate-500">

                        {title}

                    </p>


                    <p
                        className={`mt-2 text-3xl font-bold ${valueClass}`}
                    >

                        {value}

                    </p>

                </div>


                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
                >

                    {icon}

                </div>

            </div>

        </div>
    );
};


// ============================================================
// TABLE HEADER
// ============================================================

const TableHeader = ({
    children,
    center = false,
}) => {

    return (

        <th
            className={`px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${
                center
                    ? "text-center"
                    : "text-left"
            }`}
        >

            {children}

        </th>
    );
};


// ============================================================
// DETAIL ITEM
// ============================================================

const DetailItem = ({
    label,
    value,
}) => {

    return (

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">

                {label}

            </p>


            <p className="text-sm font-semibold text-slate-800">

                {value ||
                    "N/A"}

            </p>

        </div>
    );
};


// ============================================================
// PERSON CARD
// ============================================================

const PersonCard = ({
    title,
    name,
    id,
    email,
}) => {

    return (

        <div className="rounded-xl border border-slate-200 bg-white p-4">

            <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">

                    <User size={18} />

                </div>


                <div>

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">

                        {title}

                    </p>


                    <p className="mt-1 font-semibold text-slate-800">

                        {name ||
                            "N/A"}

                    </p>


                    <p className="text-xs text-slate-400">

                        ID:{" "}
                        {id ||
                            "N/A"}

                    </p>


                    {email && (

                        <p className="mt-1 text-xs text-slate-500">

                            {email}

                        </p>

                    )}

                </div>

            </div>

        </div>
    );
};


// ============================================================
// REFERENCE ITEM
// ============================================================

const ReferenceItem = ({
    label,
    value,
}) => {

    return (

        <div>

            <p className="text-xs text-slate-400">

                {label}

            </p>


            <p className="mt-1 text-sm font-semibold text-slate-700">

                {value ||
                    "N/A"}

            </p>

        </div>
    );
};


// ============================================================
// DATE CARD
// ============================================================

const DateCard = ({
    title,
    value,
}) => {

    return (

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">

                <CalendarDays size={18} />

            </div>


            <div>

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">

                    {title}

                </p>


                <p className="mt-1 text-sm font-semibold text-slate-700">

                    {value
                        ? new Date(value).toLocaleString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            }
                        )
                        : "N/A"}

                </p>

            </div>

        </div>
    );
};


export default ComplianceRecommendations;