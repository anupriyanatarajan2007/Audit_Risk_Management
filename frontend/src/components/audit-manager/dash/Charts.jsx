import React from "react";
import { motion } from "framer-motion";

import {
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import {
    glassPanel,
    palette,
    severityColor,
    statusColor,
} from "./Theme";

import {
    ChartSkeleton,
    SectionState,
} from "./DashboardStates";

import { PieChart as PieIcon } from "lucide-react";

// ============================================================
// SHARED TOOLTIP - LIGHT UI
// ============================================================

const GlassTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
        <div
            className="
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
                py-2
                shadow-lg
            "
        >
            {label && (
                <p className="text-[11px] font-semibold text-slate-500 mb-1">
                    {label}
                </p>
            )}

            {payload.map((entry, i) => (
                <div
                    key={i}
                    className="flex items-center gap-2 text-xs"
                >
                    <span
                        className="w-2 h-2 rounded-full"
                        style={{
                            backgroundColor:
                                entry.color || entry.fill,
                        }}
                    />

                    <span className="text-slate-500">
                        {entry.name}:
                    </span>

                    <span className="font-semibold text-slate-800">
                        {entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

// ============================================================
// CHART CARD SHELL - WHITE
// ============================================================

const ChartCard = ({
    title,
    subtitle,
    children,
    className = "",
}) => (
    <motion.div
        initial={{
            opacity: 0,
            y: 16,
        }}
        whileInView={{
            opacity: 1,
            y: 0,
        }}
        viewport={{
            once: true,
            amount: 0.3,
        }}
        transition={{
            duration: 0.5,
            ease: "easeOut",
        }}
        className={`
            bg-white
            border
            border-slate-200
            rounded-2xl
            shadow-sm
            p-5
            ${className}
        `}
    >
        <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800">
                {title}
            </h3>

            {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">
                    {subtitle}
                </p>
            )}
        </div>

        {children}
    </motion.div>
);

// ============================================================
// AUDIT STATUS DISTRIBUTION
// ============================================================

export const AuditStatusChart = ({
    data,
    loading,
    error,
    onRetry,
}) => {

    const total = (data || []).reduce(
        (sum, d) => sum + d.value,
        0
    );

    return (
        <ChartCard
            title="Audit Status Distribution"
            subtitle={`${total} audit${
                total === 1 ? "" : "s"
            } tracked`}
        >

            <SectionState
                loading={loading}
                error={error}
                isEmpty={
                    !loading &&
                    !error &&
                    total === 0
                }
                onRetry={onRetry}
                skeleton={
                    <ChartSkeleton height={240} />
                }
                emptyTitle="No audit data available"
                emptyIcon={PieIcon}
            >

                <div className="
                    flex
                    flex-col
                    sm:flex-row
                    items-center
                    gap-4
                ">

                    <ResponsiveContainer
                        width="100%"
                        height={220}
                        className="sm:!w-1/2"
                    >
                        <PieChart>

                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={58}
                                outerRadius={82}
                                paddingAngle={3}
                                animationDuration={700}
                            >
                                {(data || []).map(
                                    (entry) => (
                                        <Cell
                                            key={entry.name}
                                            fill={statusColor(
                                                entry.name
                                            )}
                                            stroke="none"
                                        />
                                    )
                                )}
                            </Pie>

                            <Tooltip
                                content={
                                    <GlassTooltip />
                                }
                            />

                        </PieChart>
                    </ResponsiveContainer>

                    <div className="
                        grid
                        grid-cols-1
                        gap-2
                        w-full
                        sm:w-1/2
                    ">

                        {(data || []).map(
                            (entry) => (
                                <div
                                    key={entry.name}
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        text-xs
                                    "
                                >

                                    <div className="
                                        flex
                                        items-center
                                        gap-2
                                    ">

                                        <span
                                            className="
                                                w-2
                                                h-2
                                                rounded-full
                                            "
                                            style={{
                                                backgroundColor:
                                                    statusColor(
                                                        entry.name
                                                    ),
                                            }}
                                        />

                                        <span className="text-slate-500">
                                            {entry.name.replace(
                                                /_/g,
                                                " "
                                            )}
                                        </span>

                                    </div>

                                    <span className="
                                        font-semibold
                                        text-slate-800
                                    ">
                                        {entry.value}

                                        <span className="
                                            text-slate-400
                                            ml-1
                                        ">
                                            (
                                            {total > 0
                                                ? Math.round(
                                                      (entry.value /
                                                          total) *
                                                          100
                                                  )
                                                : 0}
                                            %)
                                        </span>
                                    </span>

                                </div>
                            )
                        )}

                    </div>

                </div>

            </SectionState>

        </ChartCard>
    );
};

// ============================================================
// AUDIT PROGRESS TREND
// ============================================================

export const AuditProgressChart = ({
    data,
    loading,
    error,
    onRetry,
}) => {

    const hasData = (data || []).some(
        (d) =>
            d.started > 0 ||
            d.completed > 0
    );

    return (
        <ChartCard
            title="Audit Progress Trend"
            subtitle="Started vs completed, last 8 months"
        >

            <SectionState
                loading={loading}
                error={error}
                isEmpty={
                    !loading &&
                    !error &&
                    !hasData
                }
                onRetry={onRetry}
                skeleton={
                    <ChartSkeleton height={260} />
                }
                emptyTitle="No audit trend data yet"
            >

                <ResponsiveContainer
                    width="100%"
                    height={260}
                >

                    <AreaChart
                        data={data}
                        margin={{
                            top: 4,
                            right: 8,
                            left: -16,
                            bottom: 0,
                        }}
                    >

                        <defs>

                            <linearGradient
                                id="startedGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor={
                                        palette.accentLine
                                    }
                                    stopOpacity={0.35}
                                />

                                <stop
                                    offset="100%"
                                    stopColor={
                                        palette.accentLine
                                    }
                                    stopOpacity={0}
                                />
                            </linearGradient>

                            <linearGradient
                                id="completedGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor={
                                        palette.accent
                                    }
                                    stopOpacity={0.4}
                                />

                                <stop
                                    offset="100%"
                                    stopColor={
                                        palette.accent
                                    }
                                    stopOpacity={0}
                                />
                            </linearGradient>

                        </defs>

                        <CartesianGrid
                            stroke="#E2E8F0"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="month"
                            tick={{
                                fill: "#64748B",
                                fontSize: 11,
                            }}
                            axisLine={{
                                stroke: "#E2E8F0",
                            }}
                            tickLine={false}
                        />

                        <YAxis
                            allowDecimals={false}
                            tick={{
                                fill: "#64748B",
                                fontSize: 11,
                            }}
                            axisLine={false}
                            tickLine={false}
                            width={28}
                        />

                        <Tooltip
                            content={
                                <GlassTooltip />
                            }
                        />

                        <Legend
                            wrapperStyle={{
                                fontSize: 11,
                                color: "#64748B",
                            }}
                            iconType="circle"
                            iconSize={8}
                        />

                        <Area
                            type="monotone"
                            dataKey="started"
                            name="Started"
                            stroke={
                                palette.accentLine
                            }
                            fill="url(#startedGradient)"
                            strokeWidth={2}
                            animationDuration={800}
                        />

                        <Area
                            type="monotone"
                            dataKey="completed"
                            name="Completed"
                            stroke={
                                palette.accent
                            }
                            fill="url(#completedGradient)"
                            strokeWidth={2}
                            animationDuration={800}
                        />

                    </AreaChart>

                </ResponsiveContainer>

            </SectionState>

        </ChartCard>
    );
};

// ============================================================
// FINDINGS BY SEVERITY
// ============================================================

export const FindingsSeverityChart = ({
    data,
    loading,
    error,
    onRetry,
}) => {

    const hasData = (data || []).some(
        (d) => d.total > 0
    );

    return (
        <ChartCard
            title="Findings by Severity"
            subtitle="Open vs resolved"
        >

            <SectionState
                loading={loading}
                error={error}
                isEmpty={
                    !loading &&
                    !error &&
                    !hasData
                }
                onRetry={onRetry}
                skeleton={
                    <ChartSkeleton height={240} />
                }
                emptyTitle="All findings are currently resolved"
            >

                <ResponsiveContainer
                    width="100%"
                    height={240}
                >

                    <BarChart
                        data={data}
                        margin={{
                            top: 4,
                            right: 8,
                            left: -16,
                            bottom: 0,
                        }}
                        barGap={4}
                    >

                        <CartesianGrid
                            stroke="#E2E8F0"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="severity"
                            tick={{
                                fill: "#64748B",
                                fontSize: 11,
                            }}
                            axisLine={{
                                stroke: "#E2E8F0",
                            }}
                            tickLine={false}
                        />

                        <YAxis
                            allowDecimals={false}
                            tick={{
                                fill: "#64748B",
                                fontSize: 11,
                            }}
                            axisLine={false}
                            tickLine={false}
                            width={28}
                        />

                        <Tooltip
                            content={
                                <GlassTooltip />
                            }
                            cursor={{
                                fill: "rgba(148,163,184,0.08)",
                            }}
                        />

                        <Legend
                            wrapperStyle={{
                                fontSize: 11,
                                color: "#64748B",
                            }}
                            iconType="circle"
                            iconSize={8}
                        />

                        <Bar
                            dataKey="open"
                            name="Open"
                            radius={[
                                4,
                                4,
                                0,
                                0,
                            ]}
                            animationDuration={700}
                        >

                            {(data || []).map(
                                (entry) => (
                                    <Cell
                                        key={`open-${entry.severity}`}
                                        fill={severityColor(
                                            entry.severity
                                        )}
                                    />
                                )
                            )}

                        </Bar>

                        <Bar
                            dataKey="resolved"
                            name="Resolved"
                            radius={[
                                4,
                                4,
                                0,
                                0,
                            ]}
                            fill="#94A3B8"
                            fillOpacity={0.45}
                            animationDuration={700}
                        />

                    </BarChart>

                </ResponsiveContainer>

            </SectionState>

        </ChartCard>
    );
};

// ============================================================
// RISK OVERVIEW
// ============================================================

export const RiskOverviewChart = ({
    data,
    summary,
    loading,
    error,
    onRetry,
}) => {

    const total = (data || []).reduce(
        (sum, d) => sum + d.value,
        0
    );

    return (
        <ChartCard
            title="Risk Distribution"
            subtitle="Current risk register"
        >

            <SectionState
                loading={loading}
                error={error}
                isEmpty={
                    !loading &&
                    !error &&
                    total === 0
                }
                onRetry={onRetry}
                skeleton={
                    <ChartSkeleton height={240} />
                }
                emptyTitle="No risk data available"
            >

                <div className="
                    flex
                    flex-col
                    sm:flex-row
                    items-center
                    gap-5
                ">

                    <ResponsiveContainer
                        width="100%"
                        height={200}
                        className="sm:!w-1/2"
                    >

                        <PieChart>

                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={52}
                                outerRadius={76}
                                paddingAngle={3}
                                animationDuration={700}
                            >

                                {(data || []).map(
                                    (entry) => (
                                        <Cell
                                            key={entry.name}
                                            fill={severityColor(
                                                entry.name
                                            )}
                                            stroke="none"
                                        />
                                    )
                                )}

                            </Pie>

                            <Tooltip
                                content={
                                    <GlassTooltip />
                                }
                            />

                        </PieChart>

                    </ResponsiveContainer>

                    <div className="
                        grid
                        grid-cols-2
                        gap-3
                        w-full
                        sm:w-1/2
                    ">

                        {[
                            {
                                label: "Total Risks",
                                value:
                                    summary?.total ??
                                    0,
                            },
                            {
                                label: "Critical",
                                value:
                                    summary?.critical ??
                                    0,
                                color:
                                    palette.critical,
                            },
                            {
                                label: "High",
                                value:
                                    summary?.high ??
                                    0,
                                color:
                                    palette.high,
                            },
                            {
                                label:
                                    "Under Mitigation",
                                value:
                                    summary?.underMitigation ??
                                    0,
                                color:
                                    palette.accent,
                            },
                        ].map((item) => (

                            <div
                                key={item.label}
                                className="
                                    rounded-xl
                                    bg-slate-50
                                    border
                                    border-slate-200
                                    p-3
                                "
                            >

                                <p className="
                                    text-[10px]
                                    uppercase
                                    tracking-wide
                                    text-slate-500
                                ">
                                    {item.label}
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-lg
                                        font-bold
                                        text-slate-800
                                    "
                                    style={{
                                        color:
                                            item.color ??
                                            "#1E293B",
                                    }}
                                >
                                    {item.value}
                                </p>

                            </div>

                        ))}

                    </div>

                </div>

            </SectionState>

        </ChartCard>
    );
};

// ============================================================
// DEPARTMENT PERFORMANCE
// ============================================================

export const DepartmentPerformanceChart = ({
    data,
    loading,
    error,
    onRetry,
}) => {

    const hasData =
        (data || []).length > 0;

    return (
        <ChartCard
            title="Audit Performance by Department"
            subtitle="Planned vs completed"
            className="lg:col-span-2"
        >

            <SectionState
                loading={loading}
                error={error}
                isEmpty={
                    !loading &&
                    !error &&
                    !hasData
                }
                onRetry={onRetry}
                skeleton={
                    <ChartSkeleton height={280} />
                }
                emptyTitle="No department data available"
            >

                <ResponsiveContainer
                    width="100%"
                    height={Math.max(
                        220,
                        (data || []).length * 46
                    )}
                >

                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{
                            top: 4,
                            right: 24,
                            left: 8,
                            bottom: 0,
                        }}
                        barSize={14}
                    >

                        <CartesianGrid
                            stroke="#E2E8F0"
                            horizontal={false}
                        />

                        <XAxis
                            type="number"
                            allowDecimals={false}
                            tick={{
                                fill: "#64748B",
                                fontSize: 11,
                            }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            dataKey="department"
                            type="category"
                            width={140}
                            tick={{
                                fill: "#475569",
                                fontSize: 11,
                            }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) =>
                                String(v).replace(
                                    /_/g,
                                    " "
                                )
                            }
                        />

                        <Tooltip
                            content={
                                <GlassTooltip />
                            }
                            cursor={{
                                fill: "rgba(148,163,184,0.08)",
                            }}
                        />

                        <Legend
                            wrapperStyle={{
                                fontSize: 11,
                                color: "#64748B",
                            }}
                            iconType="circle"
                            iconSize={8}
                        />

                        <Bar
                            dataKey="planned"
                            name="Planned"
                            fill="#94A3B8"
                            fillOpacity={0.45}
                            radius={[
                                0,
                                4,
                                4,
                                0,
                            ]}
                            animationDuration={700}
                        />

                        <Bar
                            dataKey="completed"
                            name="Completed"
                            fill={palette.accent}
                            radius={[
                                0,
                                4,
                                4,
                                0,
                            ]}
                            animationDuration={700}
                        />

                    </BarChart>

                </ResponsiveContainer>

            </SectionState>

        </ChartCard>
    );
};
