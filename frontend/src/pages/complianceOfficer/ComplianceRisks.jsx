import React, { useEffect, useMemo, useState } from "react";

import {
    Search,
    RefreshCw,
    Eye,
    X,
    FileText,
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    CalendarDays,
} from "lucide-react";

import RiskService from "../../service/RiskService";

const ComplianceRisks = () => {
    const [risks, setRisks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [levelFilter, setLevelFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedRisk, setSelectedRisk] = useState(null);
    const [error, setError] = useState("");

    // ============================================================
    // LOAD RISKS
    // ============================================================

    const loadRisks = async () => {
        try {
            setError("");

            const response = await RiskService.getAllRisks();

            let data = [];

            if (Array.isArray(response)) {
                data = response;
            } else if (Array.isArray(response?.data)) {
                data = response.data;
            } else if (Array.isArray(response?.content)) {
                data = response.content;
            } else if (Array.isArray(response?.data?.content)) {
                data = response.data.content;
            }

            setRisks(data);
        } catch (err) {
            console.error(
                "Failed to load compliance risks:",
                err.response?.data || err
            );

            setError(
                err.response?.data?.message ||
                    "Unable to load risks."
            );

            setRisks([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadRisks();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadRisks();
    };

    // ============================================================
    // SAFE VALUE HELPER
    // ============================================================

    const getValue = (obj, keys, fallback = "—") => {
        if (!obj) return fallback;

        for (const key of keys) {
            const value = obj?.[key];

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {
                return value;
            }
        }

        return fallback;
    };

    // ============================================================
    // OBJECT -> DISPLAY TEXT
    // ============================================================

    const displayValue = (value, fallback = "—") => {
        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {
            return fallback;
        }

        // Primitive values
        if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
        ) {
            return String(value);
        }

        // Array
        if (Array.isArray(value)) {
            return value
                .map((item) => displayValue(item, ""))
                .filter(Boolean)
                .join(", ") || fallback;
        }

        // Object
        if (typeof value === "object") {
            // Common backend entity format
            if (value.name) {
                return String(value.name);
            }

            if (value.title) {
                return String(value.title);
            }

            if (value.label) {
                return String(value.label);
            }

            if (value.code) {
                return String(value.code);
            }

            if (value.description) {
                return String(value.description);
            }

            // If object has id only
            if (value.id !== undefined && value.id !== null) {
                return String(value.id);
            }

            // Last fallback
            try {
                return JSON.stringify(value);
            } catch {
                return fallback;
            }
        }

        return fallback;
    };

    // ============================================================
    // FILTER
    // ============================================================

    const filteredRisks = useMemo(() => {
        return risks.filter((risk) => {
            const title = displayValue(
                getValue(
                    risk,
                    ["title", "riskTitle", "name"],
                    ""
                ),
                ""
            ).toLowerCase();

            const riskId = displayValue(
                getValue(
                    risk,
                    ["riskId", "id"],
                    ""
                ),
                ""
            ).toLowerCase();

            const category = displayValue(
                getValue(
                    risk,
                    ["category", "riskCategory"],
                    ""
                ),
                ""
            ).toLowerCase();

            const searchValue = search.toLowerCase();

            const matchesSearch =
                !searchValue ||
                title.includes(searchValue) ||
                riskId.includes(searchValue) ||
                category.includes(searchValue);

            const level = displayValue(
                getValue(
                    risk,
                    ["riskLevel", "level"],
                    ""
                ),
                ""
            );

            const status = displayValue(
                getValue(
                    risk,
                    ["status", "riskStatus"],
                    ""
                ),
                ""
            );

            const matchesLevel =
                levelFilter === "ALL" ||
                level.toUpperCase() === levelFilter;

            const matchesStatus =
                statusFilter === "ALL" ||
                status.toUpperCase() === statusFilter;

            return (
                matchesSearch &&
                matchesLevel &&
                matchesStatus
            );
        });
    }, [
        risks,
        search,
        levelFilter,
        statusFilter,
    ]);

    // ============================================================
    // STATS
    // ============================================================

    const totalRisks = risks.length;

    const highRisks = risks.filter((risk) => {
        const level = displayValue(
            getValue(
                risk,
                ["riskLevel", "level"],
                ""
            ),
            ""
        ).toUpperCase();

        return (
            level === "HIGH" ||
            level === "CRITICAL"
        );
    }).length;

    const openRisks = risks.filter((risk) => {
        const status = displayValue(
            getValue(
                risk,
                ["status", "riskStatus"],
                ""
            ),
            ""
        ).toUpperCase();

        return (
            status === "OPEN" ||
            status === "IN_PROGRESS" ||
            status === "MITIGATION_IN_PROGRESS"
        );
    }).length;

    const closedRisks = risks.filter((risk) => {
        const status = displayValue(
            getValue(
                risk,
                ["status", "riskStatus"],
                ""
            ),
            ""
        ).toUpperCase();

        return status === "CLOSED";
    }).length;

    // ============================================================
    // BADGES
    // ============================================================

    const getRiskLevelBadge = (level) => {
        const value = displayValue(
            level,
            "UNKNOWN"
        ).toUpperCase();

        const styles = {
            CRITICAL: "bg-red-50 text-red-600",
            HIGH: "bg-orange-50 text-orange-600",
            MEDIUM: "bg-yellow-50 text-yellow-700",
            LOW: "bg-emerald-50 text-emerald-600",
        };

        return (
            <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    styles[value] ||
                    "bg-slate-100 text-slate-500"
                }`}
            >
                {value}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const value = displayValue(
            status,
            "UNKNOWN"
        ).toUpperCase();

        const styles = {
            CLOSED:
                "bg-emerald-50 text-emerald-600 border-emerald-200",

            OPEN:
                "bg-amber-50 text-amber-600 border-amber-200",

            IN_PROGRESS:
                "bg-amber-50 text-amber-600 border-amber-200",

            MITIGATION_IN_PROGRESS:
                "bg-blue-50 text-blue-600 border-blue-200",
        };

        return (
            <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
                    styles[value] ||
                    "bg-slate-50 text-slate-500 border-slate-200"
                }`}
            >
                {value.replaceAll("_", " ")}
            </span>
        );
    };

    // ============================================================
    // DATE FORMAT
    // ============================================================

    const formatDate = (date) => {
        if (!date || date === "—") {
            return "—";
        }

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return displayValue(date);
        }

        return parsed.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">

                {/* ===================== HEADER ===================== */}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

                    <div className="flex items-center gap-3">

                        <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-3 shadow-sm">
                            <FileText
                                size={20}
                                className="text-white"
                            />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900">
                                Audit Risks
                            </h1>

                            <p className="text-sm text-slate-500">
                                Compliance Officer • Risk Monitoring
                            </p>
                        </div>

                    </div>

                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                </div>

                {/* ===================== STATS ===================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

                    <StatCard
                        title="Total Risks"
                        value={totalRisks}
                        icon={FileText}
                        iconBg="bg-emerald-50"
                        iconColor="text-emerald-600"
                    />

                    <StatCard
                        title="Open Risks"
                        value={openRisks}
                        icon={AlertCircle}
                        iconBg="bg-amber-50"
                        iconColor="text-amber-600"
                    />

                    <StatCard
                        title="High / Critical"
                        value={highRisks}
                        icon={AlertTriangle}
                        iconBg="bg-orange-50"
                        iconColor="text-orange-600"
                    />

                    <StatCard
                        title="Closed Risks"
                        value={closedRisks}
                        icon={CheckCircle2}
                        iconBg="bg-emerald-50"
                        iconColor="text-emerald-600"
                    />

                </div>

                {/* ===================== FILTER BAR ===================== */}

                <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-6 shadow-sm">

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px_200px] gap-3">

                        <div className="relative">

                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Search risk ID, title or category..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                            />

                        </div>

                        <select
                            value={levelFilter}
                            onChange={(e) =>
                                setLevelFilter(e.target.value)
                            }
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                        >
                            <option value="ALL">
                                All Risk Levels
                            </option>

                            <option value="CRITICAL">
                                Critical
                            </option>

                            <option value="HIGH">
                                High
                            </option>

                            <option value="MEDIUM">
                                Medium
                            </option>

                            <option value="LOW">
                                Low
                            </option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                        >
                            <option value="ALL">
                                All Status
                            </option>

                            <option value="OPEN">
                                Open
                            </option>

                            <option value="IN_PROGRESS">
                                In Progress
                            </option>

                            <option value="CLOSED">
                                Closed
                            </option>
                        </select>

                    </div>
                </div>

                {/* ===================== ERROR ===================== */}

                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                        {displayValue(error)}
                    </div>
                )}

                {/* ===================== TABLE ===================== */}

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

                    {loading ? (
                        <div className="flex min-h-[300px] items-center justify-center">
                            <RefreshCw
                                size={26}
                                className="animate-spin text-emerald-500"
                            />
                        </div>
                    ) : filteredRisks.length === 0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">

                            <FileText
                                size={40}
                                className="mb-3 text-slate-300"
                            />

                            <h3 className="font-semibold text-slate-700">
                                No risks found
                            </h3>

                            <p className="mt-1 text-sm text-slate-400">
                                There are no risks matching your filters.
                            </p>

                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[900px]">

                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/60">

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Risk
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Category
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Level
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Status
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Score
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Target Closure
                                            </th>

                                            <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                                                Action
                                            </th>

                                        </tr>
                                    </thead>

                                    <tbody>

                                        {filteredRisks.map((risk) => {

                                            const riskId =
                                                getValue(
                                                    risk,
                                                    ["riskId"],
                                                    `RISK-${risk.id || "—"}`
                                                );

                                            const title =
                                                getValue(
                                                    risk,
                                                    [
                                                        "title",
                                                        "riskTitle",
                                                        "name",
                                                    ]
                                                );

                                            const category =
                                                getValue(
                                                    risk,
                                                    [
                                                        "category",
                                                        "riskCategory",
                                                    ]
                                                );

                                            const level =
                                                getValue(
                                                    risk,
                                                    [
                                                        "riskLevel",
                                                        "level",
                                                    ]
                                                );

                                            const status =
                                                getValue(
                                                    risk,
                                                    [
                                                        "status",
                                                        "riskStatus",
                                                    ]
                                                );

                                            const score =
                                                getValue(
                                                    risk,
                                                    [
                                                        "riskScore",
                                                        "score",
                                                    ]
                                                );

                                            const targetDate =
                                                getValue(
                                                    risk,
                                                    [
                                                        "targetClosureDate",
                                                        "targetDate",
                                                    ]
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        risk.id ||
                                                        risk.riskId
                                                    }
                                                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition"
                                                >

                                                    <td className="px-6 py-4">

                                                        <div className="font-semibold text-slate-900">
                                                            {displayValue(
                                                                riskId
                                                            )}
                                                        </div>

                                                        <div className="mt-0.5 max-w-[220px] truncate text-sm text-slate-500">
                                                            {displayValue(
                                                                title
                                                            )}
                                                        </div>

                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-slate-500">
                                                        {displayValue(
                                                            category
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {getRiskLevelBadge(
                                                            level
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(
                                                            status
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4">

                                                        <span className="font-bold text-slate-900">
                                                            {displayValue(
                                                                score
                                                            )}
                                                        </span>

                                                    </td>

                                                    <td className="px-6 py-4">

                                                        <div className="flex items-center gap-2 text-sm text-slate-500">

                                                            <CalendarDays
                                                                size={14}
                                                            />

                                                            {formatDate(
                                                                targetDate
                                                            )}

                                                        </div>

                                                    </td>

                                                    <td className="px-6 py-4 text-right">

                                                        <button
                                                            onClick={() =>
                                                                setSelectedRisk(
                                                                    risk
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                                        >
                                                            <Eye
                                                                size={14}
                                                            />

                                                            View
                                                        </button>

                                                    </td>

                                                </tr>
                                            );
                                        })}

                                    </tbody>

                                </table>

                            </div>

                            <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">

                                Showing{" "}

                                <span className="font-semibold text-slate-600">
                                    {filteredRisks.length}
                                </span>

                                {" "}of{" "}

                                <span className="font-semibold text-slate-600">
                                    {risks.length}
                                </span>

                                {" "}risks

                            </div>
                        </>
                    )}

                </div>
            </div>

            {/* ===================== VIEW RISK MODAL ===================== */}

            {selectedRisk && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">

                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">

                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                                    Risk Details
                                </p>

                                <h2 className="mt-1 text-xl font-bold text-slate-900">
                                    {displayValue(
                                        getValue(
                                            selectedRisk,
                                            ["riskId", "id"]
                                        )
                                    )}
                                </h2>

                            </div>

                            <button
                                onClick={() =>
                                    setSelectedRisk(null)
                                }
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                            <Detail
                                label="Risk Title"
                                value={getValue(
                                    selectedRisk,
                                    [
                                        "title",
                                        "riskTitle",
                                    ]
                                )}
                            />

                            <Detail
                                label="Category"
                                value={getValue(
                                    selectedRisk,
                                    [
                                        "category",
                                        "riskCategory",
                                    ]
                                )}
                            />

                            <Detail
                                label="Risk Level"
                                value={getValue(
                                    selectedRisk,
                                    [
                                        "riskLevel",
                                        "level",
                                    ]
                                )}
                            />

                            <Detail
                                label="Risk Status"
                                value={getValue(
                                    selectedRisk,
                                    [
                                        "status",
                                        "riskStatus",
                                    ]
                                )}
                            />

                            <Detail
                                label="Risk Score"
                                value={getValue(
                                    selectedRisk,
                                    [
                                        "riskScore",
                                        "score",
                                    ]
                                )}
                            />

                            <Detail
                                label="Department"
                                value={getValue(
                                    selectedRisk,
                                    ["department"]
                                )}
                            />

                            <Detail
                                label="Business Unit"
                                value={getValue(
                                    selectedRisk,
                                    ["businessUnit"]
                                )}
                            />

                            <Detail
                                label="Process"
                                value={getValue(
                                    selectedRisk,
                                    ["processName"]
                                )}
                            />

                            <Detail
                                label="Identified Date"
                                value={formatDate(
                                    getValue(
                                        selectedRisk,
                                        ["identifiedDate"]
                                    )
                                )}
                            />

                            <Detail
                                label="Target Closure Date"
                                value={formatDate(
                                    getValue(
                                        selectedRisk,
                                        [
                                            "targetClosureDate",
                                            "targetDate",
                                        ]
                                    )
                                )}
                            />

                            <div className="md:col-span-2">

                                <Detail
                                    label="Description"
                                    value={getValue(
                                        selectedRisk,
                                        ["description"]
                                    )}
                                />

                            </div>

                            <div className="md:col-span-2">

                                <Detail
                                    label="Mitigation Plan"
                                    value={getValue(
                                        selectedRisk,
                                        [
                                            "mitigationPlan",
                                            "mitigation",
                                        ]
                                    )}
                                />

                            </div>

                            <div className="md:col-span-2">

                                <Detail
                                    label="Existing Controls"
                                    value={getValue(
                                        selectedRisk,
                                        [
                                            "existingControls",
                                        ]
                                    )}
                                />

                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
    title,
    value,
    icon: Icon,
    iconBg,
    iconColor,
}) => {

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm text-slate-500">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {displaySafe(value)}
                    </p>

                </div>

                <div
                    className={`rounded-xl p-3 ${iconBg}`}
                >
                    <Icon
                        size={20}
                        className={iconColor}
                    />
                </div>

            </div>

        </div>
    );
};

// ============================================================
// SAFE DISPLAY FOR DETAIL VALUES
// ============================================================

const displaySafe = (value) => {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return "—";
    }

    if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
    ) {
        return String(value);
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => displaySafe(item))
            .join(", ");
    }

    if (typeof value === "object") {

        if (value.name) {
            return String(value.name);
        }

        if (value.title) {
            return String(value.title);
        }

        if (value.label) {
            return String(value.label);
        }

        if (value.code) {
            return String(value.code);
        }

        if (value.id !== undefined) {
            return String(value.id);
        }

        try {
            return JSON.stringify(value);
        } catch {
            return "—";
        }
    }

    return String(value);
};

// ============================================================
// DETAIL
// ============================================================

const Detail = ({ label, value }) => {

    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">

            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">
                {displaySafe(value)}
            </p>

        </div>
    );
};

export default ComplianceRisks;