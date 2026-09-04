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
import { getProfile } from "../../service/AuthService";

// ============================================================
// COMPONENT
// ============================================================

const AuditManagerReport = () => {
    const navigate = useNavigate();

    const [risks, setRisks] = useState([]);

    const [currentUser, setCurrentUser] = useState(null);

    const [managerDepartmentId, setManagerDepartmentId] =
        useState(null);

    const [managerDepartmentName, setManagerDepartmentName] =
        useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ============================================================
    // SAFE STRING
    // ============================================================

    const safeString = (value) => {
        if (value === null || value === undefined) {
            return "";
        }

        if (typeof value === "string") {
            return value;
        }

        if (typeof value === "number") {
            return String(value);
        }

        if (typeof value === "object") {
            return (
                value.name ||
                value.departmentName ||
                value.label ||
                value.title ||
                value.employeeId ||
                value.email ||
                ""
            );
        }

        return String(value);
    };

    // ============================================================
    // NORMALIZE
    // ============================================================

    const normalize = (value) =>
        safeString(value)
            .trim()
            .toLowerCase();

    // ============================================================
    // GET DEPARTMENT NAME
    // ============================================================

    const getDepartmentName = (department) => {
        if (!department) {
            return "";
        }

        if (typeof department === "string") {
            return department.trim();
        }

        if (typeof department === "number") {
            return String(department);
        }

        if (typeof department === "object") {
            return (
                department.name ||
                department.departmentName ||
                department.label ||
                ""
            ).toString().trim();
        }

        return String(department).trim();
    };

    // ============================================================
    // GET DEPARTMENT ID
    // ============================================================

    const getDepartmentId = (department) => {
        if (!department) {
            return null;
        }

        if (typeof department === "number") {
            return department;
        }

        if (typeof department === "string") {
            const numericValue = Number(department);

            return Number.isNaN(numericValue)
                ? null
                : numericValue;
        }

        if (typeof department === "object") {
            return (
                department.id ??
                department.departmentId ??
                department.value ??
                null
            );
        }

        return null;
    };

    // ============================================================
    // GET RISK DEPARTMENT NAME
    // ============================================================

    const getRiskDepartmentName = (risk) => {
        if (!risk) {
            return "";
        }

        // Direct department object/string
        const directDepartment = getDepartmentName(
            risk.department
        );

        if (directDepartment) {
            return directDepartment;
        }

        // Other possible backend fields
        const possibleFields = [
            risk.departmentName,
            risk.department?.name,
            risk.department?.departmentName,
            risk.department?.label,
        ];

        for (const value of possibleFields) {
            const name = getDepartmentName(value);

            if (name) {
                return name;
            }
        }

        return "";
    };

    // ============================================================
    // GET RISK DEPARTMENT ID
    // ============================================================

    const getRiskDepartmentId = (risk) => {
        if (!risk) {
            return null;
        }

        const directId = getDepartmentId(
            risk.department
        );

        if (directId !== null && directId !== undefined) {
            return directId;
        }

        return (
            risk.departmentId ??
            risk.department?.id ??
            risk.department?.departmentId ??
            null
        );
    };

    // ============================================================
    // CHECK SAME DEPARTMENT
    // ============================================================

    const riskBelongsToManagerDepartment = (
        risk,
        departmentId,
        departmentName
    ) => {
        if (!risk) {
            return false;
        }

        const riskDepartmentId =
            getRiskDepartmentId(risk);

        const riskDepartmentName =
            getRiskDepartmentName(risk);

        // --------------------------------------------------------
        // ID MATCH
        // --------------------------------------------------------

        if (
            departmentId !== null &&
            departmentId !== undefined &&
            riskDepartmentId !== null &&
            riskDepartmentId !== undefined
        ) {
            if (
                Number(riskDepartmentId) ===
                Number(departmentId)
            ) {
                return true;
            }
        }

        // --------------------------------------------------------
        // NAME MATCH
        // --------------------------------------------------------

        if (
            departmentName &&
            riskDepartmentName
        ) {
            return (
                normalize(riskDepartmentName) ===
                normalize(departmentName)
            );
        }

        // --------------------------------------------------------
        // FAIL CLOSED
        // If department cannot be identified,
        // do NOT show the risk.
        // --------------------------------------------------------

        return false;
    };

    // ============================================================
    // LOAD MANAGER PROFILE + RISKS
    // ============================================================

    const loadRisks = async () => {
        try {
            setLoading(true);
            setError("");

            // ----------------------------------------------------
            // LOAD CURRENT LOGGED-IN USER
            // ----------------------------------------------------

            const profileResponse = await getProfile();

            const profile =
                profileResponse?.data ||
                profileResponse?.profile ||
                profileResponse?.user ||
                profileResponse;

            console.log(
                "AUDIT MANAGER PROFILE:",
                profile
            );

            setCurrentUser(profile);

            // ----------------------------------------------------
            // GET MANAGER DEPARTMENT
            // ----------------------------------------------------

            const managerDepartment =
                profile?.department;

            const departmentId =
                profile?.departmentId ??
                getDepartmentId(managerDepartment);

            const departmentName =
                profile?.departmentName ||
                getDepartmentName(managerDepartment);

            console.log(
                "MANAGER DEPARTMENT ID:",
                departmentId
            );

            console.log(
                "MANAGER DEPARTMENT NAME:",
                departmentName
            );

            // ----------------------------------------------------
            // DEPARTMENT REQUIRED
            // ----------------------------------------------------

            if (
                departmentId === null &&
                departmentId === undefined &&
                !departmentName
            ) {
                setManagerDepartmentId(null);
                setManagerDepartmentName("");

                setRisks([]);

                setError(
                    "Your department could not be determined. No risks are displayed."
                );

                return;
            }

            setManagerDepartmentId(
                departmentId
            );

            setManagerDepartmentName(
                departmentName
            );

            // ----------------------------------------------------
            // LOAD ALL RISKS
            // ----------------------------------------------------

            const response =
                await RiskService.getAllRisks();

            console.log(
                "RAW RISKS RESPONSE:",
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
                Array.isArray(
                    response?.data?.data
                )
            ) {
                data = response.data.data;
            }

            // ----------------------------------------------------
            // FILTER BY MANAGER DEPARTMENT
            // ----------------------------------------------------

            const departmentRisks = data
                .filter(Boolean)
                .filter((risk) =>
                    riskBelongsToManagerDepartment(
                        risk,
                        departmentId,
                        departmentName
                    )
                );

            console.log(
                "ALL RISKS:",
                data
            );

            console.log(
                "AUDIT MANAGER DEPARTMENT RISKS:",
                departmentRisks
            );

            setRisks(departmentRisks);
        } catch (err) {
            console.error(
                "Failed to load risks:",
                err
            );

            setRisks([]);

            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Failed to load audit reports."
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {
        loadRisks();
    }, []);

    // ============================================================
    // VIEW REPORT
    // ============================================================

    const handleView = (risk) => {
        const riskId =
            risk.id ||
            risk.riskId;

        if (!riskId) {
            return;
        }

        navigate(
            `/audit-manager/audit-reports/${riskId}`
        );
    };

    // ============================================================
    // SUMMARY COUNTS
    // ============================================================

    const summary = useMemo(() => {
        const total = risks.length;

        const high = risks.filter((risk) => {
            const level = normalize(
                risk.riskLevel ||
                risk.level
            );

            return (
                level === "high" ||
                level === "critical"
            );
        }).length;

        const medium = risks.filter((risk) => {
            const level = normalize(
                risk.riskLevel ||
                risk.level
            );

            return (
                level === "medium" ||
                level === "moderate"
            );
        }).length;

        const low = risks.filter((risk) => {
            const level = normalize(
                risk.riskLevel ||
                risk.level
            );

            return level === "low";
        }).length;

        const open = risks.filter((risk) => {
            const status = normalize(
                risk.status
            );

            return (
                status === "open" ||
                status === "active" ||
                status === "in progress" ||
                status === "pending"
            );
        }).length;

        const closed = risks.filter((risk) => {
            const status = normalize(
                risk.status
            );

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
        ].filter(
            (item) => item.value > 0
        );
    }, [summary]);

    // ============================================================
    // STATUS CHART DATA
    // ============================================================

    const statusData = useMemo(() => {
        const statusMap = {};

        risks.forEach((risk) => {
            const status =
                risk.status ||
                "Unknown";

            const formattedStatus =
                String(status)
                    .replaceAll("_", " ")
                    .replace(
                        /\b\w/g,
                        (char) =>
                            char.toUpperCase()
                    );

            statusMap[
                formattedStatus
            ] =
                (statusMap[
                    formattedStatus
                ] || 0) + 1;
        });

        return Object.entries(
            statusMap
        ).map(
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

    // ============================================================
    // UI
    // ============================================================

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

                        {/* MANAGER DEPARTMENT */}

                        {managerDepartmentName && (
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">

                                <span className="text-xs font-medium text-blue-600">
                                    Department
                                </span>

                                <span className="text-sm font-semibold text-blue-800">
                                    {managerDepartmentName}
                                </span>

                            </div>
                        )}

                    </div>

                    <button
                        onClick={loadRisks}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                    >
                        {loading
                            ? "Refreshing..."
                            : "Refresh Reports"}
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
                DEPARTMENT INFO
            ====================================================== */}

            {!error &&
                managerDepartmentName && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-100 text-blue-800 rounded-xl">

                        <div className="flex items-center justify-between gap-4">

                            <div>

                                <p className="text-sm font-semibold">
                                    Department Scoped Reports
                                </p>

                                <p className="text-xs mt-1 text-blue-600">
                                    Showing only risks from the Audit Manager's department:
                                    {" "}
                                    <span className="font-bold">
                                        {managerDepartmentName}
                                    </span>
                                </p>

                            </div>

                            <div className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-sm font-bold text-blue-700">
                                {risks.length} Risks
                            </div>

                        </div>

                    </div>
                )}

            {/* =====================================================
                SUMMARY CARDS
            ====================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">

                {/* TOTAL */}

                <SummaryCard
                    title="Total Risks"
                    value={summary.total}
                    icon="📊"
                    iconClass="bg-blue-100"
                    valueClass="text-gray-800"
                />

                {/* HIGH */}

                <SummaryCard
                    title="High Risks"
                    value={summary.high}
                    icon="⚠️"
                    iconClass="bg-red-100"
                    valueClass="text-red-600"
                />

                {/* MEDIUM */}

                <SummaryCard
                    title="Medium Risks"
                    value={summary.medium}
                    icon="🟠"
                    iconClass="bg-orange-100"
                    valueClass="text-orange-500"
                />

                {/* LOW */}

                <SummaryCard
                    title="Low Risks"
                    value={summary.low}
                    icon="🟢"
                    iconClass="bg-green-100"
                    valueClass="text-green-600"
                />

                {/* OPEN */}

                <SummaryCard
                    title="Open Risks"
                    value={summary.open}
                    icon="🔓"
                    iconClass="bg-blue-100"
                    valueClass="text-blue-600"
                />

                {/* CLOSED */}

                <SummaryCard
                    title="Closed Risks"
                    value={summary.closed}
                    icon="✅"
                    iconClass="bg-emerald-100"
                    valueClass="text-emerald-600"
                />

            </div>

            {/* =====================================================
                CHARTS
            ====================================================== */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                {/* RISK LEVEL */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                    <div className="mb-4">

                        <h2 className="text-lg font-bold text-gray-800">
                            Risk Level Distribution
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Distribution of department risks based on severity
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

                {/* STATUS */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                    <div className="mb-4">

                        <h2 className="text-lg font-bold text-gray-800">
                            Risk Status Overview
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Number of department risks by current status
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

                                <BarChart
                                    data={statusData}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="name"
                                        tick={{
                                            fontSize: 12,
                                        }}
                                    />

                                    <YAxis
                                        allowDecimals={false}
                                    />

                                    <Tooltip />

                                    <Bar
                                        dataKey="value"
                                        name="Risks"
                                        fill="#2563eb"
                                        radius={[
                                            8,
                                            8,
                                            0,
                                            0,
                                        ]}
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
                            There are currently no risks available in your department for audit reporting.
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

                                {risks.map(
                                    (risk, index) => {

                                        const level =
                                            normalize(
                                                risk.riskLevel ||
                                                risk.level
                                            );

                                        let levelClasses =
                                            "bg-gray-100 text-gray-700";

                                        if (
                                            level === "high" ||
                                            level === "critical"
                                        ) {
                                            levelClasses =
                                                "bg-red-100 text-red-700";
                                        } else if (
                                            level === "medium" ||
                                            level === "moderate"
                                        ) {
                                            levelClasses =
                                                "bg-orange-100 text-orange-700";
                                        } else if (
                                            level === "low"
                                        ) {
                                            levelClasses =
                                                "bg-green-100 text-green-700";
                                        }

                                        return (
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
                                                    {safeString(
                                                        risk.riskId
                                                    ) ||
                                                        safeString(
                                                            risk.id
                                                        ) ||
                                                        "-"
                                                    }
                                                </td>

                                                {/* RISK NAME */}

                                                <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                                    {safeString(
                                                        risk.title
                                                    ) ||
                                                        safeString(
                                                            risk.riskName
                                                        ) ||
                                                        safeString(
                                                            risk.name
                                                        ) ||
                                                        "-"
                                                    }
                                                </td>

                                                {/* DEPARTMENT */}

                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {getRiskDepartmentName(
                                                        risk
                                                    ) || "-"}
                                                </td>

                                                {/* RISK LEVEL */}

                                                <td className="px-6 py-4 text-sm">

                                                    <span
                                                        className={`px-3 py-1 rounded-full font-medium ${levelClasses}`}
                                                    >
                                                        {safeString(
                                                            risk.riskLevel
                                                        ) ||
                                                            safeString(
                                                                risk.level
                                                            ) ||
                                                            "-"
                                                        }
                                                    </span>

                                                </td>

                                                {/* STATUS */}

                                                <td className="px-6 py-4 text-sm">

                                                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                                                        {safeString(
                                                            risk.status
                                                        ) ||
                                                            "-"
                                                        }
                                                    </span>

                                                </td>

                                                {/* ACTION */}

                                                <td className="px-6 py-4 text-center">

                                                    <button
                                                        onClick={() =>
                                                            handleView(
                                                                risk
                                                            )
                                                        }
                                                        className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
                                                    >
                                                        View Report
                                                    </button>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

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
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm text-gray-500 font-medium">
                        {title}
                    </p>

                    <h2
                        className={`text-3xl font-bold mt-2 ${valueClass}`}
                    >
                        {value}
                    </h2>

                </div>

                <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconClass}`}
                >
                    <span className="text-2xl">
                        {icon}
                    </span>
                </div>

            </div>

        </div>
    );
};

export default AuditManagerReport;