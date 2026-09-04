
// src/components/dashboard/UserDistribution.jsx

import { useEffect, useMemo, useState } from "react";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
} from "recharts";

import {
    PieChart as PieIcon,
    Building2,
} from "lucide-react";

import DashboardService from "../../../service/dashboardService";

import {
    resolveCount,
    resolveLabel,
} from "./shared/normalize";

import ChartCard from "./shared/ChartCard";


// ============================================================
// COLORS
// ============================================================

const PALETTE = [
    "#2563EB",
    "#0D9488",
    "#F59E0B",
    "#7C3AED",
    "#DC2626",
    "#0891B2",
    "#64748B",
];


// ============================================================
// TOOLTIP
// ============================================================

function DonutTooltip({ active, payload }) {

    if (!active || !payload?.length) {
        return null;
    }

    const row = payload[0].payload;

    return (
        <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs shadow-lg">

            <p className="font-semibold text-slate-800">
                {row.label}
            </p>

            <p className="text-slate-500">
                {row.count} users · {row.percent}% of users
            </p>

        </div>
    );
}


// ============================================================
// NORMALIZE API RESPONSE
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
// CHECK WHETHER RESPONSE IS RAW USER DATA
// ============================================================

function isRawUser(row) {

    return Boolean(
        row &&
        (
            row.department ||
            row.role ||
            row.employeeId ||
            row.email
        )
    );
}


// ============================================================
// GROUP RAW USERS BY ROLE
// ============================================================

function groupUsersByRole(users) {

    const grouped = {};

    users.forEach((user) => {

        const roleName =
            user?.role?.name ||
            user?.roleName ||
            user?.role?.label ||
            "Unknown";

        if (!grouped[roleName]) {
            grouped[roleName] = 0;
        }

        grouped[roleName]++;
    });

    return Object.entries(grouped).map(
        ([label, count]) => ({
            label,
            count,
        })
    );
}


// ============================================================
// GROUP RAW USERS BY DEPARTMENT
// ============================================================

function groupUsersByDepartment(users) {

    const grouped = {};

    users.forEach((user) => {

        /*
         * Your actual API response:
         *
         * department: {
         *    id: 1,
         *    name: "Information Technology"
         * }
         */

        const departmentName =
            user?.department?.name ||
            user?.departmentName ||
            user?.department?.label ||
            user?.department ||
            "Unknown";

        const label = String(departmentName).trim();

        if (!grouped[label]) {
            grouped[label] = 0;
        }

        grouped[label]++;
    });

    return Object.entries(grouped).map(
        ([label, count]) => ({
            label,
            count,
        })
    );
}


// ============================================================
// NORMALIZE AGGREGATED RESPONSE
// ============================================================

function normalizeAggregatedRows(rows) {

    return rows
        .map((row) => {

            const label =
                resolveLabel(row, {
                    directKeys: [
                        "label",
                        "name",
                        "roleName",
                        "departmentName",
                        "department",
                    ],
                });

            const count = resolveCount(row);

            return {
                label: label || "Unknown",
                count: Number(count) || 0,
            };
        })
        .filter((row) => row.count >= 0);
}


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function UserDistribution() {

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    const [roleData, setRoleData] = useState([]);

    const [deptData, setDeptData] = useState([]);

    const [activeIndex, setActiveIndex] = useState(null);


    // ========================================================
    // LOAD DATA
    // ========================================================

    const load = async () => {

        setLoading(true);

        setError(null);

        try {

            const [
                rolesResponse,
                departmentsResponse,
            ] = await Promise.all([

                DashboardService.getUsersByRole(),

                DashboardService.getUsersByDepartment(),

            ]);


            console.log(
                "USERS BY ROLE RESPONSE:",
                rolesResponse
            );

            console.log(
                "USERS BY DEPARTMENT RESPONSE:",
                departmentsResponse
            );


            // ==================================================
            // ROLE DATA
            // ==================================================

            const roleRows = extractRows(
                rolesResponse
            );


            let processedRoleData = [];


            if (
                roleRows.length > 0 &&
                isRawUser(roleRows[0])
            ) {

                // Raw users response
                processedRoleData =
                    groupUsersByRole(roleRows);

            } else {

                // Aggregated response
                processedRoleData =
                    normalizeAggregatedRows(roleRows);

            }


            // ==================================================
            // DEPARTMENT DATA
            // ==================================================

            const deptRows = extractRows(
                departmentsResponse
            );


            let processedDeptData = [];


            if (
                deptRows.length > 0 &&
                isRawUser(deptRows[0])
            ) {

                /*
                 * IMPORTANT:
                 *
                 * Your current API returns:
                 *
                 * [
                 *   {
                 *      id: 1,
                 *      employeeId: "ADM-001",
                 *      department: {
                 *          id: 1,
                 *          name: "Information Technology"
                 *      }
                 *   }
                 * ]
                 *
                 * Therefore we use:
                 *
                 * user.department.name
                 */

                processedDeptData =
                    groupUsersByDepartment(deptRows);

            } else {

                // Aggregated department response
                processedDeptData =
                    normalizeAggregatedRows(deptRows);

            }


            // ==================================================
            // CALCULATE TOTALS
            // ==================================================

            const roleTotal =
                processedRoleData.reduce(
                    (sum, row) =>
                        sum + Number(row.count || 0),
                    0
                );


            const deptTotal =
                processedDeptData.reduce(
                    (sum, row) =>
                        sum + Number(row.count || 0),
                    0
                );


            // ==================================================
            // ROLE PERCENTAGE
            // ==================================================

            const finalRoleData =
                processedRoleData
                    .map((row) => ({

                        label: row.label,

                        count: Number(row.count || 0),

                        percent:
                            roleTotal > 0
                                ? Math.round(
                                    (
                                        Number(row.count || 0) /
                                        roleTotal
                                    ) * 100
                                )
                                : 0,

                    }))
                    .sort(
                        (a, b) =>
                            b.count - a.count
                    );


            // ==================================================
            // DEPARTMENT PERCENTAGE
            // ==================================================

            const finalDeptData =
                processedDeptData
                    .map((row) => ({

                        label: row.label,

                        count: Number(row.count || 0),

                        percent:
                            deptTotal > 0
                                ? Math.round(
                                    (
                                        Number(row.count || 0) /
                                        deptTotal
                                    ) * 100
                                )
                                : 0,

                    }))
                    .sort(
                        (a, b) =>
                            b.count - a.count
                    );


            console.log(
                "FINAL ROLE DATA:",
                finalRoleData
            );

            console.log(
                "FINAL DEPARTMENT DATA:",
                finalDeptData
            );


            setRoleData(
                finalRoleData
            );

            setDeptData(
                finalDeptData
            );

        } catch (err) {

            console.error(
                "USER DISTRIBUTION ERROR:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to fetch distribution data."
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
    // TOTAL USERS
    // ========================================================

    const totalUsers = useMemo(
        () =>
            roleData.reduce(
                (sum, row) =>
                    sum + Number(row.count || 0),
                0
            ),
        [roleData]
    );


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">


            {/* ==================================================
                ROLE DISTRIBUTION
            ================================================== */}

            <ChartCard
                title="Role Distribution"
                subtitle="Share of users by assigned role"
                icon={PieIcon}
                loading={loading}
                error={error}
                isEmpty={
                    !loading &&
                    !error &&
                    roleData.length === 0
                }
                onRetry={load}
            >

                <div className="flex flex-col items-center gap-6 sm:flex-row">


                    {/* DONUT */}

                    <div className="relative h-[220px] w-[220px] shrink-0">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <PieChart>

                                <Pie
                                    data={roleData}
                                    dataKey="count"
                                    nameKey="label"
                                    innerRadius={64}
                                    outerRadius={92}
                                    paddingAngle={2}

                                    animationBegin={0}

                                    animationDuration={1000}

                                    animationEasing="ease-out"

                                    onMouseEnter={(_, index) =>
                                        setActiveIndex(index)
                                    }

                                    onMouseLeave={() =>
                                        setActiveIndex(null)
                                    }
                                >

                                    {roleData.map(
                                        (_, index) => (

                                            <Cell
                                                key={`role-${index}`}

                                                fill={
                                                    PALETTE[
                                                        index %
                                                        PALETTE.length
                                                    ]
                                                }

                                                fillOpacity={
                                                    activeIndex === null ||
                                                    activeIndex === index
                                                        ? 1
                                                        : 0.35
                                                }

                                                stroke="#fff"

                                                strokeWidth={2}
                                            />

                                        )
                                    )}

                                </Pie>


                                <Tooltip
                                    content={
                                        <DonutTooltip />
                                    }
                                />

                            </PieChart>

                        </ResponsiveContainer>


                        {/* CENTER */}

                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">

                            <span className="text-2xl font-semibold text-slate-900">

                                {totalUsers.toLocaleString(
                                    "en-IN"
                                )}

                            </span>

                            <span className="text-[11px] text-slate-400">

                                Total Users

                            </span>

                        </div>

                    </div>


                    {/* ROLE LEGEND */}

                    <ul className="w-full space-y-2">

                        {roleData.map(
                            (row, index) => (

                                <li
                                    key={row.label}

                                    onMouseEnter={() =>
                                        setActiveIndex(index)
                                    }

                                    onMouseLeave={() =>
                                        setActiveIndex(null)
                                    }

                                    className="flex items-center justify-between rounded-lg px-2 py-1.5 text-xs transition hover:bg-slate-50"
                                >

                                    <span className="flex items-center gap-2 text-slate-600">

                                        <span
                                            className="h-2.5 w-2.5 rounded-full"

                                            style={{
                                                backgroundColor:
                                                    PALETTE[
                                                        index %
                                                        PALETTE.length
                                                    ],
                                            }}
                                        />

                                        {row.label}

                                    </span>


                                    <span className="font-medium text-slate-800">

                                        {row.count} users

                                    </span>

                                    <span className="font-medium text-slate-500">

                                        {row.percent}%

                                    </span>

                                </li>

                            )
                        )}

                    </ul>

                </div>

            </ChartCard>


            {/* ==================================================
                DEPARTMENT DISTRIBUTION
            ================================================== */}

            <ChartCard
                title="Department Distribution"
                subtitle="Users grouped by department"
                icon={Building2}
                loading={loading}
                error={error}
                isEmpty={
                    !loading &&
                    !error &&
                    deptData.length === 0
                }
                onRetry={load}
            >

                <ResponsiveContainer
                    width="100%"
                    height={280}
                >

                    <BarChart
                        data={deptData}
                        layout="vertical"

                        margin={{
                            top: 4,
                            right: 24,
                            left: 0,
                            bottom: 4,
                        }}
                    >

                        <XAxis
                            type="number"
                            hide
                        />

                        <YAxis
                            type="category"
                            dataKey="label"
                            width={140}

                            tick={{
                                fontSize: 11,
                                fill: "#64748B",
                            }}

                            axisLine={false}

                            tickLine={false}
                        />


                        <Tooltip

                            cursor={{
                                fill: "#F1F5F9",
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
                                    payload[0].payload;

                                return (

                                    <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 text-xs shadow-lg">

                                        <p className="font-semibold text-slate-800">

                                            {row.label}

                                        </p>

                                        <p className="text-slate-500">

                                            {row.count} users ·{" "}
                                            {row.percent}%

                                        </p>

                                    </div>

                                );
                            }}
                        />


                        <Bar
                            dataKey="count"

                            fill="#0D9488"

                            radius={[
                                0,
                                8,
                                8,
                                0,
                            ]}

                            maxBarSize={22}

                            animationBegin={0}

                            animationDuration={1000}

                            animationEasing="ease-out"
                        />

                    </BarChart>

                </ResponsiveContainer>


                {/* DEPARTMENT SUMMARY */}

                <div className="mt-4 grid grid-cols-1 gap-2">

                    {deptData.map(
                        (department, index) => (

                            <div
                                key={department.label}

                                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"
                            >

                                <div className="flex items-center gap-2">

                                    <span
                                        className="h-2.5 w-2.5 rounded-full"

                                        style={{
                                            backgroundColor:
                                                PALETTE[
                                                    index %
                                                    PALETTE.length
                                                ],
                                        }}
                                    />

                                    <span className="font-medium text-slate-600">

                                        {department.label}

                                    </span>

                                </div>


                                <div className="flex items-center gap-3">

                                    <span className="font-semibold text-slate-800">

                                        {department.count}

                                    </span>

                                    <span className="text-slate-400">

                                        {department.percent}%

                                    </span>

                                </div>

                            </div>

                        )
                    )}

                </div>

            </ChartCard>

        </div>

    );
}
