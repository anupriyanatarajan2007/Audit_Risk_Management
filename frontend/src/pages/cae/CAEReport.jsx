
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
} from "recharts";

import RiskService from "../../service/riskService";

const CAEReport = () => {
    const navigate = useNavigate();

    const [risks, setRisks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadRisks();
    }, []);

    const loadRisks = async () => {
        try {
            setLoading(true);
            setError("");
    
            const response = await RiskService.getAllRisks();
    
            let data = [];
    
            if (Array.isArray(response)) {
                data = response;
            } else if (Array.isArray(response?.data)) {
                data = response.data;
            }
    
            setRisks(data);
    
        } catch (err) {
            console.error("Failed to load risks:", err);
            setError("Failed to load audit reports.");
        } finally {
            setLoading(false);
        }
    };

    const handleView = (risk) => {
        const riskId = risk.id || risk.riskId;

        navigate(`/chief-audit-executive/audit-reports/${riskId}`);
    };

    // ============================================================
    // HELPERS
    // ============================================================

    const normalize = (value) =>
        String(value || "")
            .trim()
            .toLowerCase();

    // ============================================================
    // SUMMARY COUNTS
    // ============================================================

    const summary = useMemo(() => {
        const total = risks.length;

        const high = risks.filter((risk) => {
            const level = normalize(
                risk.riskLevel || risk.level
            );

            return level === "high" || level === "critical";
        }).length;

        const medium = risks.filter((risk) => {
            const level = normalize(
                risk.riskLevel || risk.level
            );

            return level === "medium" || level === "moderate";
        }).length;

        const low = risks.filter((risk) => {
            const level = normalize(
                risk.riskLevel || risk.level
            );

            return level === "low";
        }).length;

        const open = risks.filter((risk) => {
            const status = normalize(risk.status);

            return (
                status === "open" ||
                status === "active" ||
                status === "in progress" ||
                status === "pending"
            );
        }).length;

        const closed = risks.filter((risk) => {
            const status = normalize(risk.status);

            return (
                status === "closed" ||
                status === "resolved" ||
                status === "completed"
            );
        }).length;

        return {
            total,
            high,
            medium,
            low,
            open,
            closed,
        };
    }, [risks]);

    // ============================================================
    // RISK LEVEL CHART DATA
    // ============================================================

    const riskLevelData = useMemo(() => {
        return [
            {
                name: "High",
                value: summary.high,
            },
            {
                name: "Medium",
                value: summary.medium,
            },
            {
                name: "Low",
                value: summary.low,
            },
        ].filter((item) => item.value > 0);
    }, [summary]);

    // ============================================================
    // STATUS CHART DATA
    // ============================================================

    const statusData = useMemo(() => {
        const statusMap = {};

        risks.forEach((risk) => {
            const status =
                risk.status || "Unknown";

            const formattedStatus =
                String(status)
                    .replaceAll("_", " ")
                    .replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                    );

            statusMap[formattedStatus] =
                (statusMap[formattedStatus] || 0) + 1;
        });

        return Object.entries(statusMap).map(
            ([name, value]) => ({
                name,
                value,
            })
        );
    }, [risks]);

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

                    <p className="text-gray-600 font-medium">
                        Loading audit reports...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Audit Reports
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Overview of risks and audit reporting status
                        </p>
                    </div>

                    <button
                        onClick={loadRisks}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-sm"
                    >
                        Refresh Reports
                    </button>

                </div>
            </div>

            {/* =====================================================
                ERROR
            ====================================================== */}

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                    {error}
                </div>
            )}

            {/* =====================================================
                SUMMARY CARDS
            ====================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">

                {/* TOTAL */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500 font-medium">
                                Total Risks
                            </p>

                            <h2 className="text-3xl font-bold text-gray-800 mt-2">
                                {summary.total}
                            </h2>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <span className="text-2xl">
                                📊
                            </span>
                        </div>

                    </div>
                </div>

                {/* HIGH */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500 font-medium">
                                High Risks
                            </p>

                            <h2 className="text-3xl font-bold text-red-600 mt-2">
                                {summary.high}
                            </h2>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                            <span className="text-2xl">
                                ⚠️
                            </span>
                        </div>

                    </div>
                </div>

                {/* MEDIUM */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500 font-medium">
                                Medium Risks
                            </p>

                            <h2 className="text-3xl font-bold text-orange-500 mt-2">
                                {summary.medium}
                            </h2>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                            <span className="text-2xl">
                                🟠
                            </span>
                        </div>

                    </div>
                </div>

                {/* LOW */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500 font-medium">
                                Low Risks
                            </p>

                            <h2 className="text-3xl font-bold text-green-600 mt-2">
                                {summary.low}
                            </h2>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <span className="text-2xl">
                                🟢
                            </span>
                        </div>

                    </div>
                </div>

                {/* OPEN */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500 font-medium">
                                Open Risks
                            </p>

                            <h2 className="text-3xl font-bold text-blue-600 mt-2">
                                {summary.open}
                            </h2>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <span className="text-2xl">
                                🔓
                            </span>
                        </div>

                    </div>
                </div>

                {/* CLOSED */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm text-gray-500 font-medium">
                                Closed Risks
                            </p>

                            <h2 className="text-3xl font-bold text-emerald-600 mt-2">
                                {summary.closed}
                            </h2>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <span className="text-2xl">
                                ✅
                            </span>
                        </div>

                    </div>
                </div>

            </div>

            {/* =====================================================
                CHARTS
            ====================================================== */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                {/* =================================================
                    RISK LEVEL PIE CHART
                ================================================== */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-800">
                            Risk Level Distribution
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Distribution of risks based on severity
                        </p>
                    </div>

                    {riskLevelData.length === 0 ? (
                        <div className="h-72 flex items-center justify-center text-gray-400">
                            No risk level data available
                        </div>
                    ) : (
                        <div className="h-72">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <PieChart>

                                    <Pie
                                        data={riskLevelData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={95}
                                        innerRadius={50}
                                        paddingAngle={3}
                                        label={({ name, value }) =>
                                            `${name}: ${value}`
                                        }
                                    >
                                        {riskLevelData.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        entry.name === "High"
                                                            ? "#ef4444"
                                                            : entry.name === "Medium"
                                                            ? "#f97316"
                                                            : "#22c55e"
                                                    }
                                                />
                                            )
                                        )}
                                    </Pie>

                                    <Tooltip />

                                    <Legend />

                                </PieChart>
                            </ResponsiveContainer>

                        </div>
                    )}

                </div>

                {/* =================================================
                    STATUS BAR CHART
                ================================================== */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-800">
                            Risk Status Overview
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Number of risks by current status
                        </p>
                    </div>

                    {statusData.length === 0 ? (
                        <div className="h-72 flex items-center justify-center text-gray-400">
                            No status data available
                        </div>
                    ) : (
                        <div className="h-72">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <BarChart data={statusData}>

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 12 }}
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="value"
                                        name="Risks"
                                        fill="#2563eb"
                                        radius={[8, 8, 0, 0]}
                                    />

                                </BarChart>
                            </ResponsiveContainer>

                        </div>
                    )}

                </div>

            </div>

            {/* =====================================================
                TABLE
            ====================================================== */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                {/* TABLE HEADER */}

                <div className="px-6 py-5 border-b border-gray-200">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">

                        <div>
                            <h2 className="text-xl font-bold text-gray-800">
                                Risk Reports
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Risk details available for audit reporting
                            </p>
                        </div>

                        <span className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold">
                            {risks.length} Reports
                        </span>

                    </div>

                </div>

                {/* NO DATA */}

                {risks.length === 0 ? (

                    <div className="p-12 text-center">

                        <div className="text-5xl mb-4">
                            📋
                        </div>

                        <h3 className="text-lg font-semibold text-gray-700">
                            No Risks Found
                        </h3>

                        <p className="text-gray-500 mt-1">
                            There are currently no risks available for audit reporting.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-100">

                                <tr>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        S.No
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Risk ID
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Risk Name
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Department
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Risk Level
                                    </th>

                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                                        Status
                                    </th>

                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-200">

                                {risks.map((risk, index) => (

                                    <tr
                                        key={
                                            risk.id ||
                                            risk.riskId ||
                                            index
                                        }
                                        className="hover:bg-blue-50/40 transition"
                                    >

                                        {/* S.NO */}

                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {index + 1}
                                        </td>

                                        {/* RISK ID */}

                                        <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                                            {risk.riskId ||
                                                risk.id ||
                                                "-"}
                                        </td>

                                        {/* RISK NAME */}

                                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                            {risk.title ||
                                                risk.riskName ||
                                                risk.name ||
                                                "-"}
                                        </td>

                                        {/* DEPARTMENT */}

                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {risk.department?.name ||
                                                risk.departmentName ||
                                                risk.department ||
                                                "-"}
                                        </td>

                                        {/* RISK LEVEL */}

                                        <td className="px-6 py-4 text-sm">

                                            {(() => {

                                                const level = normalize(
                                                    risk.riskLevel ||
                                                    risk.level
                                                );

                                                let classes =
                                                    "bg-gray-100 text-gray-700";

                                                if (
                                                    level === "high" ||
                                                    level === "critical"
                                                ) {
                                                    classes =
                                                        "bg-red-100 text-red-700";
                                                } else if (
                                                    level === "medium" ||
                                                    level === "moderate"
                                                ) {
                                                    classes =
                                                        "bg-orange-100 text-orange-700";
                                                } else if (
                                                    level === "low"
                                                ) {
                                                    classes =
                                                        "bg-green-100 text-green-700";
                                                }

                                                return (
                                                    <span
                                                        className={`px-3 py-1 rounded-full font-medium ${classes}`}
                                                    >
                                                        {risk.riskLevel ||
                                                            risk.level ||
                                                            "-"}
                                                    </span>
                                                );

                                            })()}

                                        </td>

                                        {/* STATUS */}

                                        <td className="px-6 py-4 text-sm">

                                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                                                {risk.status || "-"}
                                            </span>

                                        </td>

                                        {/* ACTION */}

                                        <td className="px-6 py-4 text-center">

                                            <button
                                                onClick={() =>
                                                    handleView(risk)
                                                }
                                                className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                                            >
                                                View Report
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
};

export default CAEReport;
