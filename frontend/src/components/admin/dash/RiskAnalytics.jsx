// src/components/dashboard/RiskAnalytics.jsx

import { useEffect, useMemo, useState } from "react";

import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import {
    AlertTriangle,
    ShieldAlert,
    TrendingUp,
    Building2,
} from "lucide-react";

import DashboardService from "../../../service/dashboardService";

import ChartCard from "./shared/ChartCard";

import AnimatedCounter from "./shared/AnimatedCounter";

import {
    resolveCount,
    resolveLabel,
} from "./shared/normalize";


// ============================================================
// SEVERITY COLORS
// ============================================================

const SEVERITY_COLORS = {
    Critical: "#DC2626",
    High: "#F59E0B",
    Medium: "#2563EB",
    Low: "#0D9488",
};


// ============================================================
// RISK STATUS COLORS
// Matches backend RiskStatus enum
// ============================================================

const STATUS_COLORS = {
    NEW: "#2563EB",
    ANALYZED: "#8B5CF6",
    APPROVED: "#06B6D4",
    IN_PROGRESS: "#F59E0B",
    MITIGATED: "#10B981",
    VERIFIED: "#14B8A6",
    REOPENED: "#F97316",
    CLOSED: "#64748B",
    REJECTED: "#DC2626",
};


// ============================================================
// MINI STAT
// ============================================================

function MiniStat({
    label,
    value,
    tone = "slate",
}) {

    const toneMap = {

        slate: "text-slate-800",

        red: "text-red-600",

        amber: "text-amber-600",

        blue: "text-blue-600",

        emerald: "text-emerald-600",

    };

    return (

        <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-center">

            <p
                className={`text-lg font-semibold ${toneMap[tone]}`}
            >

                <AnimatedCounter
                    value={Number(value) || 0}
                />

            </p>

            <p className="mt-0.5 text-[11px] text-slate-500">

                {label}

            </p>

        </div>

    );
}


// ============================================================
// EXTRACT API DATA
// ============================================================

function extractRows(response) {

    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.content)) {
        return response.content;
    }

    return [];
}


// ============================================================
// NUMBER HELPER
// ============================================================

function numberValue(value) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
}


// ============================================================
// RAW RISK CHECK
// ============================================================

function isRawRisk(row) {

    return Boolean(
        row &&
        (
            row.riskId ||
            row.title ||
            row.riskScore ||
            row.level ||
            row.status ||
            row.department
        )
    );
}


// ============================================================
// GROUP RAW RISKS BY DEPARTMENT
// ============================================================

function groupRisksByDepartment(risks) {

    const grouped = {};

    risks.forEach((risk) => {

        /*
         * Supports:
         *
         * department: {
         *     id: 1,
         *     name: "Information Technology",
         *     active: true
         * }
         */

        const departmentName =
            risk?.department?.name ||
            risk?.departmentName ||
            risk?.department?.label ||
            (
                typeof risk?.department === "string"
                    ? risk.department
                    : null
            ) ||
            "Unknown";

        const label =
            String(departmentName).trim() ||
            "Unknown";


        if (!grouped[label]) {
            grouped[label] = 0;
        }

        grouped[label]++;
    });


    return Object.entries(grouped)
        .map(([label, count]) => ({
            label,
            count,
        }));
}


// ============================================================
// NORMALIZE DEPARTMENT RESPONSE
// ============================================================

function normalizeDepartmentRows(rows) {

    return rows
        .map((row) => {

            const label =
                resolveLabel(row, {
                    directKeys: [
                        "label",
                        "name",
                        "departmentName",
                        "department",
                    ],
                });


            const count =
                resolveCount(
                    row,
                    [
                        "riskCount",
                        "count",
                        "value",
                        "total",
                    ]
                );


            return {
                label: label || "Unknown",
                count: numberValue(count),
            };
        })
        .filter((row) => row.count >= 0);
}


// ============================================================
// GROUP RAW RISKS BY SEVERITY
// ============================================================

function calculateSeverityFromRisks(risks) {

    const result = {
        Critical: 0,
        High: 0,
        Medium: 0,
        Low: 0,
    };


    risks.forEach((risk) => {

        let level =
            risk?.level ||
            risk?.riskLevel ||
            risk?.severity;


        if (!level && risk?.riskScore != null) {

            const score =
                numberValue(risk.riskScore);

            if (score >= 20) {

                level = "Critical";

            } else if (score >= 15) {

                level = "High";

            } else if (score >= 8) {

                level = "Medium";

            } else {

                level = "Low";

            }
        }


        if (level) {

            const normalized =
                String(level)
                    .toLowerCase()
                    .replace("_", " ")
                    .trim();


            if (normalized === "critical") {

                result.Critical++;

            } else if (normalized === "high") {

                result.High++;

            } else if (normalized === "medium") {

                result.Medium++;

            } else if (normalized === "low") {

                result.Low++;
            }
        }
    });


    return result;
}


// ============================================================
// CALCULATE STATUS FROM RAW RISKS
//
// Backend enum:
//
// NEW
// ANALYZED
// APPROVED
// IN_PROGRESS
// MITIGATED
// VERIFIED
// REOPENED
// CLOSED
// REJECTED
// ============================================================

function calculateStatusFromRisks(risks) {

    const result = {

        new: 0,

        analyzed: 0,

        approved: 0,

        inProgress: 0,

        mitigated: 0,

        verified: 0,

        reopened: 0,

        closed: 0,

        rejected: 0,

    };


    risks.forEach((risk) => {

        const status =
            String(
                risk?.status || ""
            )
                .toUpperCase()
                .trim();


        switch (status) {

            case "NEW":

                result.new++;

                break;


            case "ANALYZED":

                result.analyzed++;

                break;


            case "APPROVED":

                result.approved++;

                break;


            case "IN_PROGRESS":

                result.inProgress++;

                break;


            case "MITIGATED":

                result.mitigated++;

                break;


            case "VERIFIED":

                result.verified++;

                break;


            case "REOPENED":

                result.reopened++;

                break;


            case "CLOSED":

                result.closed++;

                break;


            case "REJECTED":

                result.rejected++;

                break;


            default:

                break;
        }
    });


    return result;
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function RiskAnalytics() {

    const [stats, setStats] = useState(null);

    const [trend, setTrend] = useState([]);

    const [byDept, setByDept] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);


    // ========================================================
    // LOAD DASHBOARD DATA
    // ========================================================

    const load = async () => {

        setLoading(true);

        setError(null);


        try {

            const [
                statisticsResponse,
                trendResponse,
                departmentResponse,
            ] = await Promise.all([

                DashboardService.getRiskStatistics(),

                DashboardService.getRiskTrend(),

                DashboardService.getRiskByDepartment(),

            ]);


            console.log(
                "RISK STATISTICS RESPONSE:",
                statisticsResponse
            );


            console.log(
                "RISK TREND RESPONSE:",
                trendResponse
            );


            console.log(
                "RISK DEPARTMENT RESPONSE:",
                departmentResponse
            );


            // ==================================================
            // STATISTICS
            // ==================================================

            let statistics =
                statisticsResponse?.data &&
                !Array.isArray(
                    statisticsResponse?.data
                )
                    ? statisticsResponse.data
                    : statisticsResponse;


            /*
             * Make sure statistics is always an object.
             */

            if (
                !statistics ||
                Array.isArray(statistics)
            ) {

                statistics = {};

            }


            setStats(statistics);


            // ==================================================
            // TREND
            // ==================================================

            const trendRows =
                extractRows(
                    trendResponse
                );


            const normalizedTrend =
                trendRows
                    .map((row) => ({

                        month:
                            row?.month ||
                            row?.label ||
                            row?.period ||
                            row?.date ||
                            "",


                        risks:
                            numberValue(
                                resolveCount(
                                    row,
                                    [
                                        "riskCount",
                                        "count",
                                        "value",
                                        "total",
                                    ]
                                )
                            ),

                    }))
                    .filter(
                        (row) =>
                            row.month
                    );


            setTrend(
                normalizedTrend
            );


            // ==================================================
            // DEPARTMENT
            // ==================================================

            const deptRows =
                extractRows(
                    departmentResponse
                );


            let processedDepartments = [];


            if (
                deptRows.length > 0 &&
                isRawRisk(deptRows[0])
            ) {

                /*
                 * API returned raw risks.
                 *
                 * Example:
                 *
                 * {
                 *   riskId: "RISK-001",
                 *   department: {
                 *      id: 1,
                 *      name: "Information Technology"
                 *   }
                 * }
                 */

                processedDepartments =
                    groupRisksByDepartment(
                        deptRows
                    );

            } else {

                processedDepartments =
                    normalizeDepartmentRows(
                        deptRows
                    );
            }


            processedDepartments =
                processedDepartments
                    .sort(
                        (a, b) =>
                            b.count - a.count
                    );


            console.log(
                "FINAL RISK DEPARTMENT DATA:",
                processedDepartments
            );


            setByDept(
                processedDepartments
            );


        } catch (err) {

            console.error(
                "RISK ANALYTICS ERROR:",
                err
            );


            setError(
                err?.response?.data?.message ||
                "Unable to fetch risk analytics."
            );


        } finally {

            setLoading(false);

        }
    };


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {

        load();

    }, []);


    // ========================================================
    // SEVERITY DATA
    // ========================================================

    const severityData =
        useMemo(() => {

            if (!stats) {
                return [];
            }


            return [

                {
                    name: "Critical",

                    value:
                        numberValue(
                            stats.critical
                        ),
                },

                {
                    name: "High",

                    value:
                        numberValue(
                            stats.high
                        ),
                },

                {
                    name: "Medium",

                    value:
                        numberValue(
                            stats.medium
                        ),
                },

                {
                    name: "Low",

                    value:
                        numberValue(
                            stats.low
                        ),
                },

            ];

        }, [stats]);


    // ========================================================
    // RISK STATUS DATA
    //
    // Exact backend RiskStatus enum
    // ========================================================

    const statusData =
        useMemo(() => {

            if (!stats) {
                return [];
            }


            return [

                {
                    key: "NEW",

                    name: "New",

                    value:
                        numberValue(
                            stats.new ??
                            stats.NEW
                        ),
                },


                {
                    key: "ANALYZED",

                    name: "Analyzed",

                    value:
                        numberValue(
                            stats.analyzed ??
                            stats.ANALYZED
                        ),
                },


                {
                    key: "APPROVED",

                    name: "Approved",

                    value:
                        numberValue(
                            stats.approved ??
                            stats.APPROVED
                        ),
                },


                {
                    key: "IN_PROGRESS",

                    name: "In Progress",

                    value:
                        numberValue(
                            stats.inProgress ??
                            stats.in_progress ??
                            stats.IN_PROGRESS
                        ),
                },


                {
                    key: "MITIGATED",

                    name: "Mitigated",

                    value:
                        numberValue(
                            stats.mitigated ??
                            stats.MITIGATED
                        ),
                },


                {
                    key: "VERIFIED",

                    name: "Verified",

                    value:
                        numberValue(
                            stats.verified ??
                            stats.VERIFIED
                        ),
                },


                {
                    key: "REOPENED",

                    name: "Reopened",

                    value:
                        numberValue(
                            stats.reopened ??
                            stats.REOPENED
                        ),
                },


                {
                    key: "CLOSED",

                    name: "Closed",

                    value:
                        numberValue(
                            stats.closed ??
                            stats.CLOSED
                        ),
                },


                {
                    key: "REJECTED",

                    name: "Rejected",

                    value:
                        numberValue(
                            stats.rejected ??
                            stats.REJECTED
                        ),
                },

            ];

        }, [stats]);


    // ========================================================
    // TOTAL RISKS
    // ========================================================

    const totalRisks =
        numberValue(
            stats?.total
        );


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <section className="mb-8">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-4 flex items-center gap-2.5">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">

                    <AlertTriangle
                        size={18}
                        strokeWidth={1.9}
                    />

                </div>


                <div>

                    <h2 className="text-lg font-semibold text-slate-900">

                        Risk Management Analytics

                    </h2>


                    <p className="text-xs text-slate-400">

                        Monitor risk severity, lifecycle and department exposure

                    </p>

                </div>

            </div>


            {/* ==================================================
                SUMMARY STATS
            ================================================== */}

            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">


                <MiniStat
                    label="Total"
                    value={stats?.total}
                />


                <MiniStat
                    label="Critical"
                    value={stats?.critical}
                    tone="red"
                />


                <MiniStat
                    label="High"
                    value={stats?.high}
                    tone="amber"
                />


                <MiniStat
                    label="Medium"
                    value={stats?.medium}
                    tone="blue"
                />


                <MiniStat
                    label="Low"
                    value={stats?.low}
                    tone="emerald"
                />


                <MiniStat
                    label="Mitigated"
                    value={stats?.mitigated}
                    tone="emerald"
                />


                <MiniStat
                    label="Open"
                    value={
                        stats?.new ??
                        stats?.NEW
                    }
                    tone="blue"
                />


                <MiniStat
                    label="Closed"
                    value={stats?.closed}
                />

            </div>


            {/* ==================================================
                CHART GRID
            ================================================== */}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">


                {/* ==================================================
                    SEVERITY
                ================================================== */}

                <ChartCard
                    title="Risk Severity"
                    subtitle="Distribution across severity levels"
                    icon={ShieldAlert}
                    loading={loading}
                    error={error}
                    isEmpty={
                        !loading &&
                        !error &&
                        severityData.every(
                            (item) =>
                                !item.value
                        )
                    }
                    onRetry={load}
                >

                    <ResponsiveContainer
                        width="100%"
                        height={250}
                    >

                        <BarChart
                            data={severityData}
                            margin={{
                                top: 10,
                                right: 8,
                                left: -18,
                                bottom: 4,
                            }}
                        >

                            <CartesianGrid
                                vertical={false}
                                stroke="#F1F5F9"
                            />


                            <XAxis
                                dataKey="name"
                                tick={{
                                    fontSize: 11,
                                    fill: "#64748B",
                                }}
                                axisLine={false}
                                tickLine={false}
                            />


                            <YAxis
                                allowDecimals={false}
                                tick={{
                                    fontSize: 11,
                                    fill: "#94A3B8",
                                }}
                                axisLine={false}
                                tickLine={false}
                            />


                            <Tooltip
                                cursor={{
                                    fill: "#F8FAFC",
                                }}
                            />


                            <Bar
                                dataKey="value"
                                radius={[
                                    8,
                                    8,
                                    0,
                                    0,
                                ]}
                                maxBarSize={48}

                                animationBegin={0}

                                animationDuration={1200}

                                animationEasing="ease-out"
                            >

                                {severityData.map(
                                    (item) => (

                                        <Cell
                                            key={item.name}
                                            fill={
                                                SEVERITY_COLORS[
                                                    item.name
                                                ]
                                            }
                                        />

                                    )
                                )}

                            </Bar>

                        </BarChart>

                    </ResponsiveContainer>

                </ChartCard>


                {/* ==================================================
                    RISK STATUS
                ================================================== */}

                <ChartCard
                    title="Risk Status"
                    subtitle="Current lifecycle stage of all risks"
                    icon={ShieldAlert}
                    loading={loading}
                    error={error}
                    isEmpty={
                        !loading &&
                        !error &&
                        statusData.every(
                            (item) =>
                                !item.value
                        )
                    }
                    onRetry={load}
                >

                    <ResponsiveContainer
                        width="100%"
                        height={300}
                    >

                        <PieChart>

                            <Pie
                                data={statusData}

                                dataKey="value"

                                nameKey="name"

                                innerRadius={65}

                                outerRadius={105}

                                paddingAngle={3}

                                animationBegin={0}

                                animationDuration={1400}

                                animationEasing="ease-out"
                            >

                                {statusData.map(
                                    (item) => (

                                        <Cell
                                            key={item.key}

                                            fill={
                                                STATUS_COLORS[
                                                    item.key
                                                ]
                                            }

                                            stroke="#fff"

                                            strokeWidth={2}
                                        />

                                    )
                                )}

                            </Pie>


                            <Tooltip
                                content={({ active, payload }) => {

                                    if (
                                        !active ||
                                        !payload ||
                                        !payload.length
                                    ) {
                                        return null;
                                    }


                                    const data =
                                        payload[0];


                                    return (

                                        <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl">

                                            <div className="flex items-center gap-2">

                                                <span
                                                    className="h-2.5 w-2.5 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            STATUS_COLORS[
                                                                data.payload.key
                                                            ],
                                                    }}
                                                />

                                                <p className="text-sm font-semibold text-slate-800">

                                                    {data.payload.name}

                                                </p>

                                            </div>


                                            <p className="mt-1 text-xs text-slate-500">

                                                {data.value} risk
                                                {data.value !== 1
                                                    ? "s"
                                                    : ""}

                                            </p>

                                        </div>

                                    );

                                }}
                            />

                        </PieChart>

                    </ResponsiveContainer>


                    {/* STATUS LEGEND */}

                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">

                        {statusData.map(
                            (item) => (

                                <li
                                    key={item.key}
                                    className="flex items-center gap-1.5 text-[11px] text-slate-500"
                                >

                                    <span
                                        className="h-2 w-2 rounded-full"
                                        style={{
                                            backgroundColor:
                                                STATUS_COLORS[
                                                    item.key
                                                ],
                                        }}
                                    />

                                    {item.name}

                                    <span className="font-semibold text-slate-700">

                                        {item.value}

                                    </span>

                                </li>

                            )
                        )}

                    </ul>

                </ChartCard>


                {/* ==================================================
                    TREND
                ================================================== */}

                <ChartCard
                    title="Risk Trend Over Time"
                    subtitle="Monthly risk volume"
                    icon={TrendingUp}
                    loading={loading}
                    error={error}
                    isEmpty={
                        !loading &&
                        !error &&
                        trend.length === 0
                    }
                    onRetry={load}
                    className="lg:col-span-2"
                >

                    <ResponsiveContainer
                        width="100%"
                        height={280}
                    >

                        <LineChart
                            data={trend}

                            margin={{
                                top: 10,
                                right: 16,
                                left: -18,
                                bottom: 4,
                            }}
                        >

                            <CartesianGrid
                                vertical={false}
                                stroke="#F1F5F9"
                            />


                            <XAxis
                                dataKey="month"

                                tick={{
                                    fontSize: 11,
                                    fill: "#64748B",
                                }}

                                axisLine={false}

                                tickLine={false}
                            />


                            <YAxis
                                allowDecimals={false}

                                tick={{
                                    fontSize: 11,
                                    fill: "#94A3B8",
                                }}

                                axisLine={false}

                                tickLine={false}
                            />


                            <Tooltip
                                cursor={{
                                    stroke: "#CBD5E1",
                                    strokeDasharray:
                                        "4 4",
                                }}
                            />


                            <Line
                                type="monotone"

                                dataKey="risks"

                                stroke="#2563EB"

                                strokeWidth={2.5}

                                dot={{
                                    r: 3,
                                    fill: "#2563EB",
                                }}

                                activeDot={{
                                    r: 6,
                                }}

                                animationBegin={0}

                                animationDuration={1400}

                                animationEasing="ease-out"
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </ChartCard>


                {/* ==================================================
                    RISK BY DEPARTMENT
                ================================================== */}

                <ChartCard
                    title="Risk by Department"
                    subtitle="Which departments carry the most risk"
                    icon={Building2}
                    loading={loading}
                    error={error}
                    isEmpty={
                        !loading &&
                        !error &&
                        byDept.length === 0
                    }
                    onRetry={load}
                    className="lg:col-span-2"
                >

                    <ResponsiveContainer
                        width="100%"
                        height={Math.max(
                            240,
                            byDept.length * 55
                        )}
                    >

                        <BarChart
                            data={byDept}
                            layout="vertical"

                            margin={{
                                top: 8,
                                right: 40,
                                left: 0,
                                bottom: 8,
                            }}
                        >

                            <CartesianGrid
                                horizontal={false}
                                stroke="#F1F5F9"
                            />


                            <XAxis
                                type="number"
                                allowDecimals={false}

                                tick={{
                                    fontSize: 11,
                                    fill: "#94A3B8",
                                }}

                                axisLine={false}

                                tickLine={false}
                            />


                            <YAxis
                                type="category"
                                dataKey="label"

                                width={160}

                                tick={{
                                    fontSize: 11,
                                    fill: "#64748B",
                                }}

                                axisLine={false}

                                tickLine={false}
                            />


                            <Tooltip
                                cursor={{
                                    fill: "#F8FAFC",
                                }}

                                content={({
                                    active,
                                    payload,
                                }) => {

                                    if (
                                        !active ||
                                        !payload?.length
                                    ) {
                                        return null;
                                    }


                                    const row =
                                        payload[0]
                                            .payload;


                                    return (

                                        <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-xl">

                                            <p className="font-semibold text-slate-800">

                                                {row.label}

                                            </p>


                                            <p className="mt-1 text-xs text-slate-500">

                                                {row.count} risk
                                                {row.count !== 1
                                                    ? "s"
                                                    : ""}

                                            </p>

                                        </div>

                                    );

                                }}
                            />


                            <Bar
                                dataKey="count"

                                fill="#F59E0B"

                                radius={[
                                    0,
                                    10,
                                    10,
                                    0,
                                ]}

                                maxBarSize={24}

                                animationBegin={0}

                                animationDuration={1200}

                                animationEasing="ease-out"
                            />

                        </BarChart>

                    </ResponsiveContainer>


                    {/* ==================================================
                        DEPARTMENT SUMMARY
                    ================================================== */}

                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">

                        {byDept.map(
                            (department, index) => (

                                <div
                                    key={
                                        department.label
                                    }

                                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                                >

                                    <div className="flex items-center gap-2">

                                        <span
                                            className="h-2.5 w-2.5 rounded-full"

                                            style={{
                                                backgroundColor:
                                                    [
                                                        "#2563EB",
                                                        "#8B5CF6",
                                                        "#06B6D4",
                                                        "#F59E0B",
                                                        "#10B981",
                                                    ][
                                                        index % 5
                                                    ],
                                            }}
                                        />


                                        <span className="text-xs font-medium text-slate-600">

                                            {
                                                department.label
                                            }

                                        </span>

                                    </div>


                                    <span className="text-sm font-bold text-slate-800">

                                        {
                                            department.count
                                        }

                                    </span>

                                </div>

                            )
                        )}

                    </div>

                </ChartCard>

            </div>

        </section>

    );
}