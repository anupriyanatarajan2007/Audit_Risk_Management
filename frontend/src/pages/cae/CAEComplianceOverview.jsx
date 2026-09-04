import React, { useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line,
} from "recharts";

import complianceReportService from "../../service/complianceReportService";

// ============================================================
// IMPORTANT:
// Common regulatory rules are NOT CAE-specific.
// So use RegulatoryRequirementService.
// ============================================================
import RegulatoryRequirementService from "../../service/regulatoryRequirementService";


// ============================================================
// HELPERS
// ============================================================

const safeArray = (value) => {

    if (Array.isArray(value)) {
        return value;
    }

    if (Array.isArray(value?.data)) {
        return value.data;
    }

    if (Array.isArray(value?.content)) {
        return value.content;
    }

    if (Array.isArray(value?.items)) {
        return value.items;
    }

    if (Array.isArray(value?.results)) {
        return value.results;
    }

    if (Array.isArray(value?.requirements)) {
        return value.requirements;
    }

    if (Array.isArray(value?.regulatoryRequirements)) {
        return value.regulatoryRequirements;
    }

    if (Array.isArray(value?.data?.data)) {
        return value.data.data;
    }

    if (Array.isArray(value?.data?.content)) {
        return value.data.content;
    }

    if (Array.isArray(value?.data?.items)) {
        return value.data.items;
    }

    if (Array.isArray(value?.data?.results)) {
        return value.data.results;
    }

    if (Array.isArray(value?.data?.requirements)) {
        return value.data.requirements;
    }

    if (Array.isArray(value?.data?.regulatoryRequirements)) {
        return value.data.regulatoryRequirements;
    }

    return [];
};


const normalizeDepartment = (department) => {

    if (!department) {
        return "Unknown";
    }

    if (typeof department === "string") {
        return department;
    }

    if (typeof department === "object") {

        return (
            department.name ??
            department.departmentName ??
            department.code ??
            department.departmentCode ??
            "Unknown"
        );

    }

    return String(department);
};


const normalizeStatus = (value) => {

    if (!value) {
        return "UNKNOWN";
    }

    return String(value)
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");
};


const getComplianceStatus = (item) => {

    return normalizeStatus(
        item?.complianceStatus ??
        item?.compliance_status ??
        item?.status ??
        item?.compliance?.status
    );

};


const getRiskLevel = (item) => {

    return normalizeStatus(
        item?.riskLevel ??
        item?.risk_level ??
        item?.risk?.riskLevel ??
        item?.risk?.level
    );

};


const getFindingStatus = (item) => {

    return normalizeStatus(
        item?.findingStatus ??
        item?.finding_status ??
        item?.finding?.status
    );

};


const getEvidenceStatus = (item) => {

    return normalizeStatus(
        item?.evidenceStatus ??
        item?.evidence_status ??
        item?.evidence?.status
    );

};


const getDate = (item) => {

    return (
        item?.reviewDate ??
        item?.createdAt ??
        item?.createdDate ??
        item?.date ??
        item?.updatedAt ??
        item?.auditDate ??
        null
    );

};


const isOverdue = (item) => {

    const status = getComplianceStatus(item);

    if (
        status === "COMPLIANT" ||
        status === "APPROVED" ||
        status === "CLOSED"
    ) {
        return false;
    }

    const dueDate =
        item?.dueDate ??
        item?.deadline ??
        item?.targetDate ??
        item?.complianceDueDate;

    if (!dueDate) {
        return status === "OVERDUE";
    }

    const date = new Date(dueDate);

    if (Number.isNaN(date.getTime())) {
        return status === "OVERDUE";
    }

    return date < new Date();
};


const isCompliant = (item) => {

    const status = getComplianceStatus(item);

    return [
        "COMPLIANT",
        "COMPLIANCE",
        "APPROVED",
        "PASS",
        "PASSED",
        "CLOSED",
        "FULLY_COMPLIANT",
    ].includes(status);

};


const isPartial = (item) => {

    const status = getComplianceStatus(item);

    return [
        "PARTIAL",
        "PARTIALLY_COMPLIANT",
        "IN_PROGRESS",
    ].includes(status);

};


const isNonCompliant = (item) => {

    const status = getComplianceStatus(item);

    return [
        "NON_COMPLIANT",
        "NONCOMPLIANT",
        "FAILED",
        "FAIL",
        "REJECTED",
        "VIOLATION",
    ].includes(status);

};


const isCritical = (item) => {

    return [
        "CRITICAL",
        "SEVERE",
    ].includes(
        getRiskLevel(item)
    );

};


// ============================================================
// COMPLIANCE RULE HELPERS
// ============================================================

const getRuleName = (rule, index) => {

    return (
        rule?.ruleName ??
        rule?.requirementName ??
        rule?.name ??
        rule?.title ??
        rule?.complianceRuleName ??
        rule?.regulatoryRequirementName ??
        rule?.rule ??
        `Compliance Rule #${index + 1}`
    );

};


const getRuleRequirement = (rule) => {

    const requirement =
        rule?.requirement ??
        rule?.description ??
        rule?.requirementText ??
        rule?.regulatoryRequirement ??
        rule?.regulatoryRequirement?.name ??
        rule?.regulatoryRequirement?.title ??
        rule?.details ??
        rule?.detailsText;

    if (!requirement) {
        return "—";
    }

    if (typeof requirement === "object") {

        return (
            requirement?.name ??
            requirement?.title ??
            requirement?.description ??
            "—"
        );

    }

    return String(requirement);

};


const getRuleStatus = (rule) => {

    return normalizeStatus(
        rule?.status ??
        rule?.ruleStatus ??
        rule?.complianceStatus ??
        rule?.activeStatus
    );

};


// ============================================================
// KPI CARD
// ============================================================

const KpiCard = ({
    title,
    value,
    subtitle,
    icon,
}) => {

    return (

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all duration-300">

            <div className="flex items-start justify-between">

                <div>

                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <h3 className="text-3xl font-bold text-slate-800 mt-2">
                        {value}
                    </h3>

                    {subtitle && (
                        <p className="text-xs text-slate-400 mt-2">
                            {subtitle}
                        </p>
                    )}

                </div>

                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                    {icon}
                </div>

            </div>

        </div>

    );

};


// ============================================================
// SECTION HEADER
// ============================================================

const SectionHeader = ({
    title,
    subtitle,
}) => {

    return (

        <div className="mb-5">

            <h2 className="text-lg font-bold text-slate-800">
                {title}
            </h2>

            {subtitle && (
                <p className="text-sm text-slate-500 mt-1">
                    {subtitle}
                </p>
            )}

        </div>

    );

};


// ============================================================
// MAIN COMPONENT
// ============================================================

const CAEComplianceOverview = () => {

    const [reviews, setReviews] = useState([]);

    const [rules, setRules] = useState([]);

    const [selectedDepartment, setSelectedDepartment] =
        useState("ALL");

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");


    // ========================================================
    // LOAD DATA
    // ========================================================

    const loadData = async () => {

        try {

            setError("");

            console.log(
                "========== LOADING COMPLIANCE DATA =========="
            );


            const [
                reviewResponse,
                ruleResponse,
            ] = await Promise.all([

                complianceReportService.getReports(),

                // =================================================
                // FIX:
                // Fetch COMMON regulatory requirements
                // =================================================
                RegulatoryRequirementService
                    .getAllRegulatoryRequirements(),

            ]);


            // ====================================================
            // RAW RESPONSES
            // ====================================================

            console.log(
                "RAW COMPLIANCE REVIEWS RESPONSE:",
                reviewResponse
            );

            console.log(
                "RAW COMMON REGULATORY RULES RESPONSE:",
                ruleResponse
            );


            // ====================================================
            // NORMALIZE
            // ====================================================

            const reviewData =
                safeArray(reviewResponse);

            const ruleData =
                safeArray(ruleResponse);


            // ====================================================
            // FINAL DATA
            // ====================================================

            console.log(
                "FINAL COMPLIANCE REVIEWS ARRAY:",
                reviewData
            );

            console.log(
                "FINAL COMMON REGULATORY RULES ARRAY:",
                ruleData
            );

            console.log(
                "TOTAL REVIEWS:",
                reviewData.length
            );

            console.log(
                "TOTAL COMMON RULES:",
                ruleData.length
            );


            setReviews(reviewData);

            setRules(ruleData);


        } catch (err) {

            console.error(
                "FAILED TO LOAD CAE COMPLIANCE DATA:",
                err
            );

            console.error(
                "ERROR RESPONSE:",
                err?.response?.data
            );

            setError(
                err?.response?.data?.message ??
                err?.message ??
                "Failed to load compliance data."
            );


        } finally {

            setLoading(false);

            setRefreshing(false);

        }

    };


    useEffect(() => {

        loadData();

    }, []);


    // ========================================================
    // REFRESH
    // ========================================================

    const handleRefresh = () => {

        setRefreshing(true);

        loadData();

    };


    // ========================================================
    // DEPARTMENTS
    // ========================================================

    const departments = useMemo(() => {

        const values = [

            ...reviews.map(
                (item) =>
                    normalizeDepartment(
                        item?.department
                    )
            ),

        ];

        return [

            ...new Set(

                values.filter(
                    (value) =>
                        value &&
                        value !== "Unknown"
                )

            ),

        ].sort();

    }, [reviews]);


    // ========================================================
    // FILTER REVIEWS
    // ========================================================

    const filteredReviews = useMemo(() => {

        if (
            selectedDepartment === "ALL"
        ) {
            return reviews;
        }

        return reviews.filter(
            (item) =>
                normalizeDepartment(
                    item?.department
                ) === selectedDepartment
        );

    }, [
        reviews,
        selectedDepartment,
    ]);


    // ========================================================
    // IMPORTANT:
    //
    // COMMON REGULATORY RULES
    // are NOT department-specific.
    //
    // Therefore DO NOT filter rules using selectedDepartment.
    //
    // This makes the 3 common rules appear in the box.
    // ========================================================

    const filteredRules = useMemo(() => {

        return rules;

    }, [rules]);


    // ========================================================
    // COMPLIANCE COUNTS
    // ========================================================

    const statistics = useMemo(() => {

        const total =
            filteredReviews.length > 0
                ? filteredReviews.length
                : filteredRules.length;


        const compliant =
            filteredReviews.filter(
                isCompliant
            ).length;


        const partial =
            filteredReviews.filter(
                isPartial
            ).length;


        const nonCompliant =
            filteredReviews.filter(
                isNonCompliant
            ).length;


        const overdue =
            filteredReviews.filter(
                isOverdue
            ).length;


        const critical =
            filteredReviews.filter(
                isCritical
            ).length;


        const assessed =
            compliant +
            partial +
            nonCompliant;


        const compliancePercentage =
            assessed > 0
                ? Math.round(
                    (
                        compliant /
                        assessed
                    ) * 100
                )
                : 0;


        return {

            total,

            compliant,

            partial,

            nonCompliant,

            overdue,

            critical,

            assessed,

            compliancePercentage,

        };

    }, [
        filteredReviews,
        filteredRules,
    ]);


    // ========================================================
    // STATUS CHART
    // ========================================================

    const statusChartData = useMemo(() => {

        return [

            {
                name: "Compliant",
                value: statistics.compliant,
            },

            {
                name: "Partial",
                value: statistics.partial,
            },

            {
                name: "Non-Compliant",
                value: statistics.nonCompliant,
            },

            {
                name: "Not Assessed",
                value: Math.max(
                    0,
                    statistics.total -
                    statistics.assessed
                ),
            },

        ].filter(
            (item) =>
                item.value > 0
        );

    }, [statistics]);


    // ========================================================
    // DEPARTMENT-WISE COMPLIANCE
    // ========================================================

    const departmentChartData = useMemo(() => {

        const grouped = {};


        reviews.forEach((item) => {

            const department =
                normalizeDepartment(
                    item?.department
                );


            if (!grouped[department]) {

                grouped[department] = {

                    department,

                    total: 0,

                    compliant: 0,

                    percentage: 0,

                };

            }


            grouped[department].total += 1;


            if (isCompliant(item)) {

                grouped[
                    department
                ].compliant += 1;

            }

        });


        return Object.values(grouped)

            .map((item) => ({

                ...item,

                percentage:
                    item.total > 0
                        ? Math.round(
                            (
                                item.compliant /
                                item.total
                            ) * 100
                        )
                        : 0,

            }))

            .sort(
                (a, b) =>
                    b.percentage -
                    a.percentage
            );

    }, [reviews]);


    // ========================================================
    // TREND DATA
    // ========================================================

    const trendData = useMemo(() => {

        const grouped = {};


        filteredReviews.forEach((item) => {

            const rawDate =
                getDate(item);


            if (!rawDate) {
                return;
            }


            const date =
                new Date(rawDate);


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {
                return;
            }


            const key =
                date.toLocaleDateString(
                    "en-IN",
                    {
                        month: "short",
                        year: "numeric",
                    }
                );


            if (!grouped[key]) {

                grouped[key] = {

                    month: key,

                    total: 0,

                    compliant: 0,

                };

            }


            grouped[key].total += 1;


            if (isCompliant(item)) {

                grouped[key].compliant += 1;

            }

        });


        return Object.values(grouped)

            .map((item) => ({

                month: item.month,

                compliance:
                    item.total > 0
                        ? Math.round(
                            (
                                item.compliant /
                                item.total
                            ) * 100
                        )
                        : 0,

            }))

            .slice(-6);

    }, [filteredReviews]);


    // ========================================================
    // EVIDENCE STATUS
    // ========================================================

    const evidenceStats = useMemo(() => {

        const verified =
            filteredReviews.filter(
                (item) =>
                    [
                        "VERIFIED",
                        "APPROVED",
                        "VALID",
                    ].includes(
                        getEvidenceStatus(item)
                    )
            ).length;


        const pending =
            filteredReviews.filter(
                (item) =>
                    [
                        "PENDING",
                        "PENDING_REVIEW",
                        "UNDER_REVIEW",
                        "SUBMITTED",
                    ].includes(
                        getEvidenceStatus(item)
                    )
            ).length;


        const rejected =
            filteredReviews.filter(
                (item) =>
                    [
                        "REJECTED",
                        "INVALID",
                    ].includes(
                        getEvidenceStatus(item)
                    )
            ).length;


        const missing =
            Math.max(
                0,
                filteredReviews.length -
                verified -
                pending -
                rejected
            );


        return {

            verified,

            pending,

            rejected,

            missing,

        };

    }, [filteredReviews]);


    // ========================================================
    // FINDING SUMMARY
    // ========================================================

    const findingStats = useMemo(() => {

        const findings =
            filteredReviews.filter(
                (item) =>
                    item?.finding ||
                    item?.findingId ||
                    item?.findingStatus
            );


        const open =
            findings.filter(
                (item) =>
                    [
                        "OPEN",
                        "PENDING",
                        "IN_PROGRESS",
                    ].includes(
                        getFindingStatus(item)
                    )
            ).length;


        const closed =
            findings.filter(
                (item) =>
                    [
                        "CLOSED",
                        "RESOLVED",
                        "COMPLETED",
                    ].includes(
                        getFindingStatus(item)
                    )
            ).length;


        const critical =
            findings.filter(
                isCritical
            ).length;


        return {

            total:
                findings.length,

            open,

            closed,

            critical,

        };

    }, [filteredReviews]);


    // ========================================================
    // CRITICAL ISSUES
    // ========================================================

    const criticalIssues = useMemo(() => {

        return filteredReviews

            .filter(
                (item) =>
                    isCritical(item) ||
                    isOverdue(item) ||
                    isNonCompliant(item)
            )

            .sort((a, b) => {

                const priority = (item) => {

                    if (isCritical(item)) {
                        return 1;
                    }

                    if (isNonCompliant(item)) {
                        return 2;
                    }

                    if (isOverdue(item)) {
                        return 3;
                    }

                    return 4;

                };


                return (
                    priority(a) -
                    priority(b)
                );

            })

            .slice(0, 8);

    }, [filteredReviews]);


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div className="min-h-screen bg-slate-50 flex items-center justify-center">

                <div className="text-center">

                    <div className="w-12 h-12 border-4 border-slate-200 border-t-teal-600 rounded-full animate-spin mx-auto" />

                    <p className="mt-4 text-slate-500">
                        Loading compliance overview...
                    </p>

                </div>

            </div>

        );

    }


    // ========================================================
    // ERROR
    // ========================================================

    if (error) {

        return (

            <div className="min-h-screen bg-slate-50 p-6">

                <div className="max-w-3xl mx-auto bg-white border border-red-200 rounded-2xl p-6">

                    <h2 className="text-xl font-bold text-red-600">
                        Unable to load compliance overview
                    </h2>

                    <p className="text-slate-600 mt-2">
                        {error}
                    </p>

                    <button
                        onClick={handleRefresh}
                        className="mt-5 px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700"
                    >
                        Retry
                    </button>

                </div>

            </div>

        );

    }


    // ========================================================
    // UI
    // ========================================================

    return (

        <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-7">

                <div>

                    <div className="flex items-center gap-3">

                        <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-2xl">
                            🛡️
                        </div>

                        <div>

                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                                Compliance Overview
                            </h1>

                            <p className="text-sm text-slate-500 mt-1">
                                Organization-wide compliance posture and performance
                            </p>

                        </div>

                    </div>

                </div>


                <div className="flex flex-col sm:flex-row gap-3">

                    <select
                        value={selectedDepartment}
                        onChange={(e) =>
                            setSelectedDepartment(
                                e.target.value
                            )
                        }
                        className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-teal-500"
                    >

                        <option value="ALL">
                            All Departments
                        </option>

                        {departments.map(
                            (department) => (

                                <option
                                    key={department}
                                    value={department}
                                >
                                    {department}
                                </option>

                            )
                        )}

                    </select>


                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 disabled:opacity-60 transition"
                    >
                        {refreshing
                            ? "Refreshing..."
                            : "↻ Refresh"}
                    </button>

                </div>

            </div>


            {/* ================================================= */}
            {/* KPI CARDS */}
            {/* ================================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-7">

                <KpiCard
                    title="Total Requirements"
                    value={statistics.total}
                    subtitle="Compliance reviews"
                    icon="📋"
                />

                <KpiCard
                    title="Compliant"
                    value={statistics.compliant}
                    subtitle="Successfully compliant"
                    icon="✓"
                />

                <KpiCard
                    title="Partial"
                    value={statistics.partial}
                    subtitle="Needs improvement"
                    icon="◐"
                />

                <KpiCard
                    title="Non-Compliant"
                    value={statistics.nonCompliant}
                    subtitle="Requires action"
                    icon="!"
                />

                <KpiCard
                    title="Overdue"
                    value={statistics.overdue}
                    subtitle="Past due date"
                    icon="⏰"
                />

                <KpiCard
                    title="Critical"
                    value={statistics.critical}
                    subtitle="Critical attention"
                    icon="🚨"
                />

            </div>


            {/* ================================================= */}
            {/* SCORE + STATUS */}
            {/* ================================================= */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-7">


                {/* Overall Score */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                    <SectionHeader
                        title="Overall Compliance Score"
                        subtitle={
                            selectedDepartment === "ALL"
                                ? "Across all departments"
                                : `For ${selectedDepartment}`
                        }
                    />

                    <div className="flex flex-col items-center justify-center py-5">

                        <div className="relative w-48 h-48">

                            <svg
                                className="w-full h-full -rotate-90"
                                viewBox="0 0 120 120"
                            >

                                <circle
                                    cx="60"
                                    cy="60"
                                    r="48"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    className="text-slate-100"
                                />

                                <circle
                                    cx="60"
                                    cy="60"
                                    r="48"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    className="text-teal-500"
                                    strokeDasharray={`${statistics.compliancePercentage * 3.015} 301.5`}
                                />

                            </svg>


                            <div className="absolute inset-0 flex flex-col items-center justify-center">

                                <span className="text-4xl font-bold text-slate-800">
                                    {statistics.compliancePercentage}%
                                </span>

                                <span className="text-xs text-slate-400">
                                    Compliance
                                </span>

                            </div>

                        </div>


                        <div className="mt-5 text-center">

                            <p className="text-sm text-slate-500">
                                {statistics.compliant} of{" "}
                                {statistics.assessed} assessed items are compliant
                            </p>

                        </div>

                    </div>

                </div>


                {/* Status Chart */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                    <SectionHeader
                        title="Compliance Status Distribution"
                        subtitle="Current organization-wide status"
                    />

                    <div className="h-72">

                        {statusChartData.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <PieChart>

                                    <Pie
                                        data={statusChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={100}
                                        paddingAngle={3}
                                    >

                                        {statusChartData.map(
                                            (entry, index) => (

                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        [
                                                            "#14b8a6",
                                                            "#f59e0b",
                                                            "#ef4444",
                                                            "#94a3b8",
                                                        ][index]
                                                    }
                                                />

                                            )
                                        )}

                                    </Pie>

                                    <Tooltip />

                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        ) : (

                            <div className="h-full flex items-center justify-center text-slate-400">
                                No compliance data available
                            </div>

                        )}

                    </div>

                </div>

            </div>


            {/* ================================================= */}
            {/* DEPARTMENT COMPLIANCE */}
            {/* ================================================= */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-7">

                <SectionHeader
                    title="Department-wise Compliance"
                    subtitle="CAE organization-wide department comparison"
                />

                <div className="h-80">

                    {departmentChartData.length > 0 ? (

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <BarChart
                                data={departmentChartData}
                                margin={{
                                    top: 10,
                                    right: 20,
                                    left: 0,
                                    bottom: 20,
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="department"
                                    angle={-20}
                                    textAnchor="end"
                                    height={70}
                                    tick={{
                                        fontSize: 12,
                                    }}
                                />

                                <YAxis
                                    domain={[0, 100]}
                                    tickFormatter={(value) =>
                                        `${value}%`
                                    }
                                />

                                <Tooltip
                                    formatter={(value) =>
                                        `${value}%`
                                    }
                                />

                                <Bar
                                    dataKey="percentage"
                                    name="Compliance"
                                    fill="#14b8a6"
                                    radius={[
                                        8,
                                        8,
                                        0,
                                        0,
                                    ]}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    ) : (

                        <div className="h-full flex items-center justify-center text-slate-400">
                            No department compliance data available
                        </div>

                    )}

                </div>

            </div>


            {/* ================================================= */}
            {/* TREND + COVERAGE */}
            {/* ================================================= */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-7">


                {/* Trend */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                    <SectionHeader
                        title="Compliance Trend"
                        subtitle="Recent compliance performance"
                    />

                    <div className="h-72">

                        {trendData.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <LineChart
                                    data={trendData}
                                    margin={{
                                        top: 10,
                                        right: 20,
                                        left: 0,
                                        bottom: 10,
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="month"
                                    />

                                    <YAxis
                                        domain={[0, 100]}
                                        tickFormatter={(value) =>
                                            `${value}%`
                                        }
                                    />

                                    <Tooltip
                                        formatter={(value) =>
                                            `${value}%`
                                        }
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="compliance"
                                        name="Compliance"
                                        stroke="#14b8a6"
                                        strokeWidth={3}
                                        dot={{
                                            r: 5,
                                        }}
                                    />

                                </LineChart>

                            </ResponsiveContainer>

                        ) : (

                            <div className="h-full flex items-center justify-center text-slate-400">
                                Not enough date information for trend
                            </div>

                        )}

                    </div>

                </div>


                {/* Coverage */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                    <SectionHeader
                        title="Compliance Coverage"
                        subtitle="Rules and requirements currently configured"
                    />

                    <div className="space-y-5">


                        <div>

                            <div className="flex justify-between mb-2">

                                <span className="text-sm font-medium text-slate-600">
                                    Compliance Rules
                                </span>

                                <span className="text-sm font-bold text-slate-800">
                                    {filteredRules.length}
                                </span>

                            </div>


                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">

                                <div
                                    className="h-full bg-teal-500 rounded-full"
                                    style={{
                                        width:
                                            filteredRules.length > 0
                                                ? "100%"
                                                : "0%",
                                    }}
                                />

                            </div>

                        </div>


                        <div>

                            <div className="flex justify-between mb-2">

                                <span className="text-sm font-medium text-slate-600">
                                    Assessed Requirements
                                </span>

                                <span className="text-sm font-bold text-slate-800">
                                    {statistics.assessed}
                                </span>

                            </div>


                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">

                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{
                                        width:
                                            statistics.total > 0
                                                ? `${Math.min(
                                                    100,
                                                    (
                                                        statistics.assessed /
                                                        statistics.total
                                                    ) * 100
                                                )}%`
                                                : "0%",
                                    }}
                                />

                            </div>

                        </div>


                        <div>

                            <div className="flex justify-between mb-2">

                                <span className="text-sm font-medium text-slate-600">
                                    Compliance Rate
                                </span>

                                <span className="text-sm font-bold text-slate-800">
                                    {statistics.compliancePercentage}%
                                </span>

                            </div>


                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">

                                <div
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{
                                        width:
                                            `${statistics.compliancePercentage}%`,
                                    }}
                                />

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ================================================= */}
            {/* COMPLIANCE RULES BOX
                THIS IS THE PART YOU WANT
            */}
            {/* ================================================= */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-7">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

                    <SectionHeader
                        title="Compliance Rules"
                        subtitle="Configured common regulatory requirements"
                    />


                    <span className="px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">

                        Total Rules: {filteredRules.length}

                    </span>

                </div>


                {filteredRules.length > 0 ? (

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead>

                                <tr className="border-b border-slate-200">

                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">
                                        #
                                    </th>

                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">
                                        Rule
                                    </th>

                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">
                                        Requirement
                                    </th>

                                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredRules.map(
                                    (rule, index) => {

                                        const ruleName =
                                            getRuleName(
                                                rule,
                                                index
                                            );


                                        const requirement =
                                            getRuleRequirement(
                                                rule
                                            );


                                        const status =
                                            getRuleStatus(
                                                rule
                                            );


                                        return (

                                            <tr
                                                key={
                                                    rule?.id ??
                                                    rule?.ruleId ??
                                                    rule?.requirementId ??
                                                    index
                                                }
                                                className="border-b border-slate-100 hover:bg-slate-50 transition"
                                            >


                                                <td className="py-4 px-4 text-sm text-slate-500">

                                                    {index + 1}

                                                </td>


                                                <td className="py-4 px-4">

                                                    <p className="font-semibold text-slate-700">

                                                        {typeof ruleName === "object"

                                                            ? (
                                                                ruleName?.name ??
                                                                ruleName?.title ??
                                                                "—"
                                                            )

                                                            : ruleName

                                                        }

                                                    </p>

                                                </td>


                                                <td className="py-4 px-4">

                                                    <p className="text-sm text-slate-600 max-w-xl">

                                                        {requirement}

                                                    </p>

                                                </td>


                                                <td className="py-4 px-4">

                                                    <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold">

                                                        {status === "UNKNOWN"

                                                            ? "CONFIGURED"

                                                            : status.replace(
                                                                /_/g,
                                                                " "
                                                            )

                                                        }

                                                    </span>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <div className="py-12 text-center">

                        <div className="text-4xl mb-3">
                            📋
                        </div>


                        <p className="font-semibold text-slate-700">
                            No compliance rules found
                        </p>


                        <p className="text-sm text-slate-400 mt-1">
                            The API returned no common regulatory requirements.
                        </p>


                        <p className="text-xs text-slate-400 mt-3">

                            Open browser console and check

                            <span className="font-semibold">
                                {" "}FINAL COMMON REGULATORY RULES ARRAY
                            </span>

                        </p>

                    </div>

                )}

            </div>


            {/* ================================================= */}
            {/* CRITICAL ISSUES */}
            {/* ================================================= */}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-7">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

                    <SectionHeader
                        title="Critical & Attention Required"
                        subtitle="Items requiring CAE attention"
                    />


                    <div className="flex gap-2">

                        <span className="px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold">

                            Critical: {statistics.critical}

                        </span>


                        <span className="px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold">

                            Overdue: {statistics.overdue}

                        </span>

                    </div>

                </div>


                {criticalIssues.length > 0 ? (

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead>

                                <tr className="border-b border-slate-100">

                                    <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500">
                                        Issue
                                    </th>

                                    <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500">
                                        Department
                                    </th>

                                    <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500">
                                        Risk
                                    </th>

                                    <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500">
                                        Status
                                    </th>

                                    <th className="text-left py-3 px-3 text-xs font-semibold text-slate-500">
                                        Date
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {criticalIssues.map(
                                    (item, index) => {

                                        const status =
                                            getComplianceStatus(
                                                item
                                            );


                                        const department =
                                            normalizeDepartment(
                                                item?.department
                                            );


                                        const issue =
                                            item?.findingTitle ??
                                            item?.finding?.title ??
                                            item?.title ??
                                            item?.description ??
                                            item?.requirement ??
                                            `Compliance Issue #${index + 1}`;


                                        return (

                                            <tr
                                                key={
                                                    item?.id ??
                                                    item?.reviewId ??
                                                    index
                                                }
                                                className="border-b border-slate-50 hover:bg-slate-50 transition"
                                            >

                                                <td className="py-4 px-3">

                                                    <p className="font-medium text-slate-700 max-w-xs truncate">

                                                        {typeof issue === "object"

                                                            ? (
                                                                issue?.title ??
                                                                issue?.name ??
                                                                "—"
                                                            )

                                                            : issue

                                                        }

                                                    </p>

                                                </td>


                                                <td className="py-4 px-3">

                                                    <span className="text-sm text-slate-600">
                                                        {department}
                                                    </span>

                                                </td>


                                                <td className="py-4 px-3">

                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                            isCritical(item)
                                                                ? "bg-red-50 text-red-600"
                                                                : "bg-orange-50 text-orange-600"
                                                        }`}
                                                    >

                                                        {getRiskLevel(item) !== "UNKNOWN"
                                                            ? getRiskLevel(item)
                                                            : "N/A"
                                                        }

                                                    </span>

                                                </td>


                                                <td className="py-4 px-3">

                                                    <span className="text-xs font-medium text-slate-600">

                                                        {status.replace(
                                                            /_/g,
                                                            " "
                                                        )}

                                                    </span>

                                                </td>


                                                <td className="py-4 px-3">

                                                    <span className="text-xs text-slate-500">

                                                        {getDate(item)

                                                            ? new Date(
                                                                getDate(item)
                                                            ).toLocaleDateString(
                                                                "en-IN"
                                                            )

                                                            : "N/A"

                                                        }

                                                    </span>

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                ) : (

                    <div className="py-12 text-center">

                        <div className="text-4xl mb-3">
                            ✓
                        </div>

                        <p className="font-semibold text-slate-700">
                            No critical compliance issues
                        </p>

                        <p className="text-sm text-slate-400 mt-1">
                            Current compliance posture looks good.
                        </p>

                    </div>

                )}

            </div>


            {/* ================================================= */}
            {/* EVIDENCE + FINDINGS */}
            {/* ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                {/* Evidence */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                    <SectionHeader
                        title="Evidence Status"
                        subtitle="Compliance evidence review status"
                    />


                    <div className="grid grid-cols-2 gap-4">


                        <div className="p-4 rounded-xl bg-emerald-50">

                            <p className="text-xs text-emerald-600 font-medium">
                                Verified
                            </p>

                            <p className="text-2xl font-bold text-emerald-700 mt-1">
                                {evidenceStats.verified}
                            </p>

                        </div>


                        <div className="p-4 rounded-xl bg-amber-50">

                            <p className="text-xs text-amber-600 font-medium">
                                Pending Review
                            </p>

                            <p className="text-2xl font-bold text-amber-700 mt-1">
                                {evidenceStats.pending}
                            </p>

                        </div>


                        <div className="p-4 rounded-xl bg-red-50">

                            <p className="text-xs text-red-600 font-medium">
                                Rejected
                            </p>

                            <p className="text-2xl font-bold text-red-700 mt-1">
                                {evidenceStats.rejected}
                            </p>

                        </div>


                        <div className="p-4 rounded-xl bg-slate-100">

                            <p className="text-xs text-slate-600 font-medium">
                                Missing / Unknown
                            </p>

                            <p className="text-2xl font-bold text-slate-700 mt-1">
                                {evidenceStats.missing}
                            </p>

                        </div>

                    </div>

                </div>


                {/* Findings */}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">

                    <SectionHeader
                        title="Audit Findings Impact"
                        subtitle="Findings affecting compliance"
                    />


                    <div className="grid grid-cols-2 gap-4">


                        <div className="p-4 rounded-xl bg-slate-50">

                            <p className="text-xs text-slate-500 font-medium">
                                Total Findings
                            </p>

                            <p className="text-2xl font-bold text-slate-800 mt-1">
                                {findingStats.total}
                            </p>

                        </div>


                        <div className="p-4 rounded-xl bg-orange-50">

                            <p className="text-xs text-orange-600 font-medium">
                                Open
                            </p>

                            <p className="text-2xl font-bold text-orange-700 mt-1">
                                {findingStats.open}
                            </p>

                        </div>


                        <div className="p-4 rounded-xl bg-emerald-50">

                            <p className="text-xs text-emerald-600 font-medium">
                                Closed
                            </p>

                            <p className="text-2xl font-bold text-emerald-700 mt-1">
                                {findingStats.closed}
                            </p>

                        </div>


                        <div className="p-4 rounded-xl bg-red-50">

                            <p className="text-xs text-red-600 font-medium">
                                Critical
                            </p>

                            <p className="text-2xl font-bold text-red-700 mt-1">
                                {findingStats.critical}
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};


export default CAEComplianceOverview;