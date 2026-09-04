
// src/components/dashboard/AuditAnalytics.jsx

import { useEffect, useMemo, useState } from "react";

import {
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
} from "recharts";

import {
    ClipboardCheck,
    TrendingUp,
    Building2,
    Gauge,
} from "lucide-react";

import DashboardService from "../../../service/dashboardService";
import ChartCard from "./shared/ChartCard";
import AnimatedCounter from "./shared/AnimatedCounter";


// ============================================================
// AUDIT STATUS COLORS
// ============================================================

const STATUS_COLORS = [
    "#2563EB", // PLANNED
    "#6366F1", // ASSIGNED
    "#F59E0B", // IN_PROGRESS
    "#7C3AED", // UNDER_REVIEW
    "#0D9488", // COMPLETED
    "#16A34A", // CLOSED
];


// ============================================================
// EXTRACT API ROWS
// Supports:
//
// [
//   {...},
//   {...}
// ]
//
// OR
//
// {
//   success: true,
//   data: [...]
// }
// ============================================================

const extractRows = (response) => {
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
};


// ============================================================
// NUMBER HELPER
// ============================================================

const numberValue = (value) => {
    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
};


// ============================================================
// RESOLVE COUNT
// Supports aggregated dashboard responses
// ============================================================

const resolveCount = (
    item,
    keys = [
        "count",
        "total",
        "value",
        "auditCount",
        "auditsCount",
        "plannedCount",
        "assignedCount",
        "inProgressCount",
        "underReviewCount",
        "completedCount",
        "closedCount",
    ]
) => {
    if (!item || typeof item !== "object") {
        return 0;
    }

    for (const key of keys) {
        if (
            item[key] !== undefined &&
            item[key] !== null
        ) {
            return numberValue(item[key]);
        }
    }

    return 0;
};


// ============================================================
// RESOLVE LABEL
// ============================================================

const resolveLabel = (
    item,
    keys = [
        "label",
        "departmentName",
        "department",
        "name",
        "month",
        "period",
    ]
) => {
    if (!item || typeof item !== "object") {
        return "Unknown";
    }

    for (const key of keys) {
        const value = item[key];

        if (
            typeof value === "string" &&
            value.trim()
        ) {
            return value;
        }

        if (
            value &&
            typeof value === "object" &&
            typeof value.name === "string"
        ) {
            return value.name;
        }
    }

    return "Unknown";
};


// ============================================================
// NORMALIZE BACKEND STATUS
//
// PLANNED
// ASSIGNED
// IN_PROGRESS
// UNDER_REVIEW
// COMPLETED
// CLOSED
// ============================================================

const normalizeStatus = (status) => {
    if (!status) {
        return "";
    }

    return String(status)
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");
};


// ============================================================
// CALCULATE STATUS FROM RAW AUDITS
//
// This is used when statistics API does not provide
// usable values.
// ============================================================

const calculateAuditStatus = (audits) => {
    const result = {
        planned: 0,
        assigned: 0,
        inProgress: 0,
        underReview: 0,
        completed: 0,
        closed: 0,
    };

    audits.forEach((audit) => {
        const status = normalizeStatus(
            audit?.status
        );

        switch (status) {
            case "PLANNED":
                result.planned++;
                break;

            case "ASSIGNED":
                result.assigned++;
                break;

            case "IN_PROGRESS":
                result.inProgress++;
                break;

            case "UNDER_REVIEW":
                result.underReview++;
                break;

            case "COMPLETED":
                result.completed++;
                break;

            case "CLOSED":
                result.closed++;
                break;

            default:
                break;
        }
    });

    return result;
};


// ============================================================
// GROUP RAW AUDITS BY DEPARTMENT
//
// Actual API:
//
// department: {
//     id: 1,
//     name: "Information Technology"
// }
//
// ============================================================

const groupAuditsByDepartment = (audits) => {
    const grouped = {};

    audits.forEach((audit) => {
        const department =
            audit?.department?.name ||
            audit?.departmentName ||
            (
                typeof audit?.department === "string"
                    ? audit.department
                    : null
            ) ||
            "Unknown";

        grouped[department] =
            (grouped[department] || 0) + 1;
    });

    return Object.entries(grouped)
        .map(([label, count]) => ({
            label,
            count,
        }))
        .sort(
            (a, b) =>
                b.count - a.count
        );
};


// ============================================================
// GROUP RAW AUDITS BY MONTH
//
// Uses:
//
// startDate
//
// fallback:
//
// createdAt
// ============================================================

const groupAuditsByMonth = (audits) => {
    const grouped = {};

    audits.forEach((audit) => {
        const dateValue =
            audit?.startDate ||
            audit?.createdAt;

        if (!dateValue) {
            return;
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return;
        }

        const monthKey =
            date.toLocaleString(
                "en-US",
                {
                    month: "short",
                    year: "numeric",
                }
            );

        if (!grouped[monthKey]) {
            grouped[monthKey] = {
                month: monthKey,
                planned: 0,
                completed: 0,
                sortDate: new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    1
                ),
            };
        }

        const status =
            normalizeStatus(
                audit?.status
            );

        if (status === "PLANNED") {
            grouped[monthKey].planned++;
        }

        if (status === "COMPLETED") {
            grouped[monthKey].completed++;
        }
    });

    return Object.values(grouped)
        .sort(
            (a, b) =>
                a.sortDate - b.sortDate
        )
        .map(
            ({
                month,
                planned,
                completed,
            }) => ({
                month,
                planned,
                completed,
            })
        );
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
        blue: "text-blue-600",
        indigo: "text-indigo-600",
        amber: "text-amber-600",
        violet: "text-violet-600",
        emerald: "text-emerald-600",
        green: "text-green-600",
    };

    return (
        <div
            className="
                rounded-xl
                border border-slate-100
                bg-slate-50/60
                px-3
                py-3
                text-center
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-md
            "
        >
            <p
                className={`
                    text-lg
                    font-semibold
                    ${toneMap[tone]}
                `}
            >
                <AnimatedCounter
                    value={value || 0}
                />
            </p>

            <p
                className="
                    mt-0.5
                    text-[11px]
                    text-slate-500
                "
            >
                {label}
            </p>
        </div>
    );
}


// ============================================================
// CUSTOM TOOLTIP
// ============================================================

function AuditTooltip({
    active,
    payload,
    label,
}) {
    if (
        !active ||
        !payload ||
        payload.length === 0
    ) {
        return null;
    }

    return (
        <div
            className="
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-3
                shadow-xl
            "
        >
            <p
                className="
                    mb-2
                    text-xs
                    font-semibold
                    text-slate-700
                "
            >
                {label}
            </p>

            {payload.map((entry) => (
                <div
                    key={entry.dataKey}
                    className="
                        flex
                        items-center
                        justify-between
                        gap-5
                        text-xs
                    "
                >
                    <span className="text-slate-500">
                        {entry.name}
                    </span>

                    <span className="font-semibold text-slate-800">
                        {entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AuditAnalytics() {
    const [stats, setStats] = useState(null);

    const [audits, setAudits] = useState([]);

    const [trend, setTrend] = useState([]);

    const [byDept, setByDept] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);


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
                DashboardService.getAuditStatistics(),
                DashboardService.getAuditTrend(),
                DashboardService.getAuditsByDepartment(),
            ]);


            // ==================================================
            // EXTRACT RAW AUDITS
            // ==================================================

            const rawAudits =
                extractRows(
                    departmentResponse
                );

            setAudits(rawAudits);


            // ==================================================
            // STATISTICS RESPONSE
            // ==================================================

            const statisticsData =
                statisticsResponse?.data &&
                !Array.isArray(
                    statisticsResponse.data
                )
                    ? statisticsResponse.data
                    : statisticsResponse;


            const hasStatistics =
                statisticsData &&
                typeof statisticsData ===
                    "object" &&
                !Array.isArray(
                    statisticsData
                );


            // ==================================================
            // MAP API STATISTICS
            // ==================================================

            if (hasStatistics) {
                setStats({
                    total: numberValue(
                        statisticsData.total ??
                        statisticsData.totalAudits
                    ),

                    planned: numberValue(
                        statisticsData.planned ??
                        statisticsData.plannedCount
                    ),

                    assigned: numberValue(
                        statisticsData.assigned ??
                        statisticsData.assignedCount
                    ),

                    inProgress: numberValue(
                        statisticsData.inProgress ??
                        statisticsData.inProgressCount
                    ),

                    underReview: numberValue(
                        statisticsData.underReview ??
                        statisticsData.underReviewCount
                    ),

                    completed: numberValue(
                        statisticsData.completed ??
                        statisticsData.completedCount
                    ),

                    closed: numberValue(
                        statisticsData.closed ??
                        statisticsData.closedCount
                    ),
                });
            }


            // ==================================================
            // FALLBACK STATISTICS
            //
            // If API statistics are empty,
            // calculate directly from raw audits.
            // ==================================================

            const calculatedStats =
                calculateAuditStatus(
                    rawAudits
                );

            const totalAudits =
                rawAudits.length;


            const apiTotal =
                numberValue(
                    statisticsData?.total ??
                    statisticsData?.totalAudits
                );


            if (
                (!hasStatistics ||
                    apiTotal === 0) &&
                totalAudits > 0
            ) {
                setStats({
                    total: totalAudits,
                    ...calculatedStats,
                });
            }


            // ==================================================
            // TREND
            // ==================================================

            const trendRows =
                extractRows(
                    trendResponse
                );


            if (trendRows.length > 0) {
                const normalizedTrend =
                    trendRows.map(
                        (row) => ({
                            month:
                                row.month ||
                                row.label ||
                                row.period ||
                                row.date ||
                                "Unknown",

                            planned:
                                resolveCount(
                                    row,
                                    [
                                        "plannedCount",
                                        "planned",
                                    ]
                                ),

                            completed:
                                resolveCount(
                                    row,
                                    [
                                        "completedCount",
                                        "completed",
                                    ]
                                ),
                        })
                    );

                setTrend(
                    normalizedTrend
                );
            } else {
                setTrend(
                    groupAuditsByMonth(
                        rawAudits
                    )
                );
            }


            // ==================================================
            // DEPARTMENT DATA
            // ==================================================

            const departmentRows =
                extractRows(
                    departmentResponse
                );


            // Check whether backend returned
            // already-aggregated department data.

            const isAggregated =
                departmentRows.some(
                    (row) =>
                        row &&
                        (
                            row.count !==
                                undefined ||
                            row.auditCount !==
                                undefined ||
                            row.auditsCount !==
                                undefined
                        )
                );


            if (isAggregated) {
                setByDept(
                    departmentRows
                        .map((row) => ({
                            label:
                                resolveLabel(
                                    row,
                                    [
                                        "departmentName",
                                        "department",
                                        "name",
                                        "label",
                                    ]
                                ),

                            count:
                                resolveCount(
                                    row,
                                    [
                                        "count",
                                        "auditCount",
                                        "auditsCount",
                                        "total",
                                    ]
                                ),
                        }))
                        .filter(
                            (row) =>
                                row.label !==
                                "Unknown"
                        )
                        .sort(
                            (a, b) =>
                                b.count -
                                a.count
                        )
                );
            } else {
                // Raw audit objects
                //
                // audit.department.name

                setByDept(
                    groupAuditsByDepartment(
                        departmentRows
                    )
                );
            }

        } catch (err) {
            console.error(
                "Audit analytics error:",
                err
            );

            setError(
                err?.response?.data
                    ?.message ||
                "Unable to fetch audit analytics."
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
    // STATUS DATA
    //
    // EXACTLY MATCHES BACKEND ENUM
    // ========================================================

    const statusData = useMemo(() => {
        if (!stats) {
            return [];
        }

        return [
            {
                name: "Planned",
                value: numberValue(
                    stats.planned
                ),
            },

            {
                name: "Assigned",
                value: numberValue(
                    stats.assigned
                ),
            },

            {
                name: "In Progress",
                value: numberValue(
                    stats.inProgress
                ),
            },

            {
                name: "Under Review",
                value: numberValue(
                    stats.underReview
                ),
            },

            {
                name: "Completed",
                value: numberValue(
                    stats.completed
                ),
            },

            {
                name: "Closed",
                value: numberValue(
                    stats.closed
                ),
            },
        ];
    }, [stats]);


    // ========================================================
    // COMPLETION RATE
    //
    // Completed + Closed are considered finished audits.
    //
    // Example:
    // Total = 3
    // Completed = 1
    // Closed = 0
    //
    // Rate = 33%
    // ========================================================

    const completionRate = useMemo(() => {
        if (!stats?.total) {
            return 0;
        }

        const completed =
            numberValue(
                stats.completed
            );

        const closed =
            numberValue(
                stats.closed
            );

        return Math.round(
            (
                (completed + closed) /
                numberValue(stats.total)
            ) * 100
        );
    }, [stats]);


    // ========================================================
    // RADIAL DATA
    // ========================================================

    const radialData = [
        {
            name: "Completion",
            value: completionRate,
            fill: "#0D9488",
        },
    ];


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <section className="mb-8">

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="
                    mb-4
                    flex
                    items-center
                    gap-2.5
                "
            >

                <div
                    className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-50
                        text-blue-600
                    "
                >
                    <ClipboardCheck
                        size={18}
                        strokeWidth={1.9}
                    />
                </div>

                <div>
                    <h2
                        className="
                            text-lg
                            font-semibold
                            text-slate-900
                        "
                    >
                        Audit Analytics
                    </h2>

                    <p
                        className="
                            text-xs
                            text-slate-400
                        "
                    >
                        Audit status, completion and
                        department insights
                    </p>
                </div>

            </div>


            {/* =================================================
                STATUS CARDS
                EXACT BACKEND STATUSES
            ================================================= */}

            <div
                className="
                    mb-5
                    grid
                    grid-cols-2
                    gap-3
                    sm:grid-cols-3
                    lg:grid-cols-7
                "
            >

                <MiniStat
                    label="Total"
                    value={stats?.total}
                />

                <MiniStat
                    label="Planned"
                    value={stats?.planned}
                    tone="blue"
                />

                <MiniStat
                    label="Assigned"
                    value={stats?.assigned}
                    tone="indigo"
                />

                <MiniStat
                    label="In Progress"
                    value={stats?.inProgress}
                    tone="amber"
                />

                <MiniStat
                    label="Under Review"
                    value={stats?.underReview}
                    tone="violet"
                />

                <MiniStat
                    label="Completed"
                    value={stats?.completed}
                    tone="emerald"
                />

                <MiniStat
                    label="Closed"
                    value={stats?.closed}
                    tone="green"
                />

            </div>


            {/* =================================================
                CHART GRID
            ================================================= */}

            <div
                className="
                    grid
                    grid-cols-1
                    gap-5
                    lg:grid-cols-3
                "
            >

                {/* =============================================
                    STATUS DISTRIBUTION
                ============================================= */}

                <ChartCard
                    title="Audit Status Distribution"
                    icon={ClipboardCheck}
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
                        height={250}
                    >

                        <PieChart>

                            <Pie
                                data={statusData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={52}
                                outerRadius={88}
                                paddingAngle={3}
                                animationBegin={100}
                                animationDuration={1200}
                                animationEasing="ease-out"
                            >

                                {statusData.map(
                                    (item, index) => (
                                        <Cell
                                            key={
                                                item.name
                                            }
                                            fill={
                                                STATUS_COLORS[
                                                    index %
                                                    STATUS_COLORS.length
                                                ]
                                            }
                                            stroke="#fff"
                                            strokeWidth={2}
                                        />
                                    )
                                )}

                            </Pie>

                            <Tooltip />

                            <Legend
                                iconType="circle"
                                wrapperStyle={{
                                    fontSize: 10,
                                }}
                            />

                        </PieChart>

                    </ResponsiveContainer>

                </ChartCard>


                {/* =============================================
                    COMPLETION RATE
                ============================================= */}

                <ChartCard
                    title="Audit Completion Rate"
                    icon={Gauge}
                    loading={loading}
                    error={error}
                    onRetry={load}
                >

                    <div
                        className="
                            relative
                            flex
                            h-[250px]
                            items-center
                            justify-center
                        "
                    >

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <RadialBarChart
                                innerRadius="72%"
                                outerRadius="100%"
                                barSize={17}
                                data={radialData}
                                startAngle={90}
                                endAngle={-270}
                            >

                                <RadialBar
                                    dataKey="value"
                                    cornerRadius={10}
                                    background={{
                                        fill: "#F1F5F9",
                                    }}
                                    animationBegin={200}
                                    animationDuration={1400}
                                    animationEasing="ease-out"
                                />

                            </RadialBarChart>

                        </ResponsiveContainer>


                        <div
                            className="
                                pointer-events-none
                                absolute
                                inset-0
                                flex
                                flex-col
                                items-center
                                justify-center
                            "
                        >

                            <span
                                className="
                                    text-3xl
                                    font-semibold
                                    text-slate-900
                                "
                            >
                                <AnimatedCounter
                                    value={
                                        completionRate
                                    }
                                    suffix="%"
                                />
                            </span>

                            <span
                                className="
                                    text-[11px]
                                    text-slate-400
                                "
                            >
                                Audit Completion
                            </span>

                        </div>

                    </div>

                </ChartCard>


                {/* =============================================
                    AUDITS BY DEPARTMENT
                ============================================= */}

                <ChartCard
                    title="Audits by Department"
                    icon={Building2}
                    loading={loading}
                    error={error}
                    isEmpty={
                        !loading &&
                        !error &&
                        byDept.length === 0
                    }
                    onRetry={load}
                >

                    <ResponsiveContainer
                        width="100%"
                        height={250}
                    >

                        <BarChart
                            data={byDept}
                            layout="vertical"
                            margin={{
                                top: 4,
                                right: 20,
                                left: 0,
                                bottom: 4,
                            }}
                        >

                            <XAxis
                                type="number"
                                allowDecimals={false}
                                hide
                            />

                            <YAxis
                                type="category"
                                dataKey="label"
                                width={120}
                                tick={{
                                    fontSize: 10.5,
                                    fill: "#64748B",
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
                                dataKey="count"
                                name="Audits"
                                fill="#2563EB"
                                radius={[
                                    0,
                                    8,
                                    8,
                                    0,
                                ]}
                                maxBarSize={18}
                                animationBegin={150}
                                animationDuration={1200}
                                animationEasing="ease-out"
                            />

                        </BarChart>

                    </ResponsiveContainer>


                    {/* Department summary */}

                    {byDept.length > 0 && (
                        <div
                            className="
                                mt-2
                                space-y-1.5
                            "
                        >

                            {byDept
                                .slice(0, 3)
                                .map(
                                    (
                                        department
                                    ) => (
                                        <div
                                            key={
                                                department.label
                                            }
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                rounded-lg
                                                bg-slate-50
                                                px-3
                                                py-1.5
                                            "
                                        >

                                            <span
                                                className="
                                                    max-w-[75%]
                                                    truncate
                                                    text-[10px]
                                                    text-slate-500
                                                "
                                            >
                                                {
                                                    department.label
                                                }
                                            </span>

                                            <span
                                                className="
                                                    text-xs
                                                    font-semibold
                                                    text-slate-800
                                                "
                                            >
                                                {
                                                    department.count
                                                }
                                            </span>

                                        </div>
                                    )
                                )}

                        </div>
                    )}

                </ChartCard>


                {/* =============================================
                    AUDIT ACTIVITY TREND
                ============================================= */}

                <ChartCard
                    title="Audit Activity Over Time"
                    subtitle="Planned vs completed audits per month"
                    icon={TrendingUp}
                    loading={loading}
                    error={error}
                    isEmpty={
                        !loading &&
                        !error &&
                        trend.length === 0
                    }
                    onRetry={load}
                    className="lg:col-span-3"
                >

                    <ResponsiveContainer
                        width="100%"
                        height={270}
                    >

                        <LineChart
                            data={trend}
                            margin={{
                                top: 8,
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
                                content={
                                    <AuditTooltip />
                                }
                                cursor={{
                                    stroke: "#CBD5E1",
                                    strokeDasharray:
                                        "4 4",
                                }}
                            />

                            <Legend
                                iconType="circle"
                                wrapperStyle={{
                                    fontSize: 11,
                                    color: "#64748B",
                                }}
                            />


                            {/* Planned */}

                            <Line
                                type="monotone"
                                dataKey="planned"
                                name="Planned"
                                stroke="#94A3B8"
                                strokeWidth={2}
                                dot={{
                                    r: 3,
                                }}
                                activeDot={{
                                    r: 5,
                                }}
                                animationBegin={200}
                                animationDuration={1400}
                                animationEasing="ease-out"
                            />


                            {/* Completed */}

                            <Line
                                type="monotone"
                                dataKey="completed"
                                name="Completed"
                                stroke="#0D9488"
                                strokeWidth={2.5}
                                dot={{
                                    r: 3,
                                    fill: "#0D9488",
                                }}
                                activeDot={{
                                    r: 6,
                                }}
                                animationBegin={400}
                                animationDuration={1600}
                                animationEasing="ease-out"
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </ChartCard>

            </div>

        </section>
    );
}