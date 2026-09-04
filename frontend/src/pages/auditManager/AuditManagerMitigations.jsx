import React, { useEffect, useMemo, useState } from "react";

import {
    AlertCircle,
    CheckCircle2,
    Clock3,
    ShieldCheck,
    Search,
    RefreshCw,
    CalendarDays,
    User,
    ChevronRight,
    X,
    Target,
    TrendingUp,
} from "lucide-react";

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

import axios from "axios";

import MitigationService from "../../service/MitigationService";


// ============================================================
// API
// ============================================================

const API = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json",
    },
});


// ============================================================
// HELPERS
// ============================================================

const getToken = () => {
    return localStorage.getItem("token");
};


const authHeader = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
    },
});


const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


const normalize = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .toLowerCase()
        .replace(/[_-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};


// ============================================================
// DEPARTMENT HELPERS
// ============================================================

/*
    This handles different possible backend structures.

    Examples:

    user.department = "INFORMATION_TECHNOLOGY"

    OR

    user.department = {
        id: 1,
        name: "Information Technology",
        departmentName: "Information Technology",
        code: "IT"
    }

    OR

    profile.department = {...}
*/


const collectDepartmentValues = (source, values = []) => {
    if (!source) {
        return values;
    }

    if (typeof source === "string" || typeof source === "number") {
        values.push(String(source));
        return values;
    }

    if (typeof source !== "object") {
        return values;
    }

    const possibleValues = [
        source.id,
        source.departmentId,
        source.departmentID,

        source.name,
        source.departmentName,
        source.nameOfDepartment,

        source.code,
        source.departmentCode,

        source.value,
        source.label,
    ];

    possibleValues.forEach((value) => {
        if (
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
        ) {
            values.push(String(value));
        }
    });

    return values;
};


const getManagerDepartmentValues = (profile) => {
    const values = [];

    if (!profile) {
        return [];
    }

    collectDepartmentValues(profile.department, values);

    collectDepartmentValues(profile.departmentDetails, values);

    collectDepartmentValues(profile.departmentInfo, values);

    collectDepartmentValues(profile.user?.department, values);

    collectDepartmentValues(profile.profile?.department, values);

    collectDepartmentValues(profile.data?.department, values);

    collectDepartmentValues(profile.data?.user?.department, values);

    collectDepartmentValues(profile.data?.profile?.department, values);

    collectDepartmentValues(profile.user?.departmentDetails, values);

    collectDepartmentValues(profile.profile?.departmentDetails, values);

    // Direct fields
    [
        profile.departmentId,
        profile.departmentID,
        profile.departmentName,
        profile.departmentCode,

        profile.user?.departmentId,
        profile.user?.departmentID,
        profile.user?.departmentName,
        profile.user?.departmentCode,

        profile.profile?.departmentId,
        profile.profile?.departmentID,
        profile.profile?.departmentName,
        profile.profile?.departmentCode,
    ].forEach((value) => {
        if (
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
        ) {
            values.push(String(value));
        }
    });

    return [
        ...new Set(
            values
                .filter(Boolean)
                .map((value) => normalize(value))
        ),
    ];
};


const getRiskDepartmentValues = (risk) => {
    const values = [];

    if (!risk) {
        return [];
    }

    collectDepartmentValues(risk.department, values);

    collectDepartmentValues(risk.departmentDetails, values);

    collectDepartmentValues(risk.departmentInfo, values);

    collectDepartmentValues(risk.businessUnit, values);

    collectDepartmentValues(risk.businessUnitDetails, values);

    // Direct fields
    [
        risk.departmentId,
        risk.departmentID,
        risk.departmentName,
        risk.departmentCode,

        risk.riskDepartmentId,
        risk.riskDepartmentID,
        risk.riskDepartmentName,
        risk.riskDepartmentCode,

        risk.businessUnitId,
        risk.businessUnitName,
        risk.businessUnitCode,
    ].forEach((value) => {
        if (
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
        ) {
            values.push(String(value));
        }
    });

    return [
        ...new Set(
            values
                .filter(Boolean)
                .map((value) => normalize(value))
        ),
    ];
};


const getMitigationRiskId = (mitigation) => {
    if (!mitigation) {
        return null;
    }

    return (
        mitigation.riskId ??
        mitigation.risk?.id ??
        mitigation.risk?.riskId ??
        mitigation.risk?.riskID ??
        null
    );
};


// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({ status }) => {
    const value = normalize(status);

    let className =
        "bg-slate-100 text-slate-600 border-slate-200";

    let Icon = Clock3;

    if (
        value.includes("complete") ||
        value.includes("closed") ||
        value.includes("done")
    ) {
        className =
            "bg-emerald-50 text-emerald-700 border-emerald-200";

        Icon = CheckCircle2;
    } else if (
        value.includes("progress") ||
        value.includes("ongoing")
    ) {
        className =
            "bg-blue-50 text-blue-700 border-blue-200";

        Icon = TrendingUp;
    } else if (
        value.includes("overdue") ||
        value.includes("late")
    ) {
        className =
            "bg-red-50 text-red-700 border-red-200";

        Icon = AlertCircle;
    } else if (
        value.includes("pending") ||
        value.includes("open") ||
        value.includes("planned")
    ) {
        className =
            "bg-amber-50 text-amber-700 border-amber-200";

        Icon = Clock3;
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${className}`}
        >
            <Icon size={13} />
            {status || "UNKNOWN"}
        </span>
    );
};


// ============================================================
// EFFECTIVENESS BADGE
// ============================================================

const EffectivenessBadge = ({ effectiveness }) => {
    const value = normalize(effectiveness);

    let className =
        "bg-slate-100 text-slate-600 border-slate-200";

    if (
        value === "effective" ||
        value === "highly effective"
    ) {
        className =
            "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (
        value.includes("partial") ||
        value.includes("moderate")
    ) {
        className =
            "bg-amber-50 text-amber-700 border-amber-200";
    }

    if (
        value.includes("ineffective") ||
        value === "low"
    ) {
        className =
            "bg-red-50 text-red-700 border-red-200";
    }

    return (
        <span
            className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${className}`}
        >
            {effectiveness || "NOT ASSESSED"}
        </span>
    );
};


// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    iconClass,
}) => {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-start justify-between">

                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-slate-800">
                        {value}
                    </h2>

                    {subtitle && (
                        <p className="mt-1 text-xs text-slate-400">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}
                >
                    <Icon size={21} />
                </div>

            </div>
        </div>
    );
};


// ============================================================
// MAIN COMPONENT
// ============================================================

const AuditManagerMitigations = () => {

    const [mitigations, setMitigations] = useState([]);

    const [risks, setRisks] = useState([]);

    const [managerProfile, setManagerProfile] = useState(null);

    const [managerDepartmentValues, setManagerDepartmentValues] =
        useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [statusFilter, setStatusFilter] = useState("ALL");

    const [typeFilter, setTypeFilter] = useState("ALL");

    const [selectedMitigation, setSelectedMitigation] =
        useState(null);


    // ========================================================
    // LOAD MANAGER PROFILE
    // ========================================================

    const loadManagerProfile = async () => {

        try {

            const response = await API.get(
                "/profile",
                authHeader()
            );

            console.log(
                "AUDIT MANAGER PROFILE:",
                response.data
            );

            const profileData =
                response.data?.data ||
                response.data?.profile ||
                response.data?.user ||
                response.data;

            setManagerProfile(profileData);

            const departmentValues =
                getManagerDepartmentValues(
                    response.data
                );

            console.log(
                "AUDIT MANAGER DEPARTMENT VALUES:",
                departmentValues
            );

            setManagerDepartmentValues(
                departmentValues
            );

            return profileData;

        } catch (err) {

            console.error(
                "Failed to load manager profile:",
                err
            );

            /*
                Fallback to localStorage.
            */

            try {

                const storedUser =
                    localStorage.getItem("user");

                const storedCurrentUser =
                    localStorage.getItem("currentUser");

                const parsedUser =
                    storedUser
                        ? JSON.parse(storedUser)
                        : null;

                const parsedCurrentUser =
                    storedCurrentUser
                        ? JSON.parse(storedCurrentUser)
                        : null;

                const fallbackUser =
                    parsedUser ||
                    parsedCurrentUser;

                if (fallbackUser) {

                    console.log(
                        "PROFILE FALLBACK USER:",
                        fallbackUser
                    );

                    setManagerProfile(
                        fallbackUser
                    );

                    const departmentValues =
                        getManagerDepartmentValues(
                            fallbackUser
                        );

                    console.log(
                        "FALLBACK DEPARTMENT VALUES:",
                        departmentValues
                    );

                    setManagerDepartmentValues(
                        departmentValues
                    );

                    return fallbackUser;
                }

            } catch (storageError) {

                console.error(
                    "LocalStorage user parsing failed:",
                    storageError
                );
            }

            throw err;
        }
    };


    // ========================================================
    // LOAD RISKS
    // ========================================================

    const loadRisks = async () => {

        try {

            const response = await API.get(
                "/api/risks",
                authHeader()
            );

            console.log(
                "ALL RISKS FOR MITIGATION FILTER:",
                response.data
            );

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : Array.isArray(response.data?.data)
                    ? response.data.data
                    : [];

            setRisks(data);

            return data;

        } catch (err) {

            console.error(
                "Failed to load risks:",
                err
            );

            setRisks([]);

            return [];
        }
    };


    // ========================================================
    // FETCH MITIGATIONS + PROFILE + RISKS
    // ========================================================

    const loadMitigations = async () => {

        try {

            setLoading(true);
            setError("");

            /*
                Load all three together.
            */

            const [
                mitigationData,
                profileResult,
                riskData,
            ] = await Promise.all([
                MitigationService.getAllMitigations(),
                loadManagerProfile(),
                loadRisks(),
            ]);

            console.log(
                "ALL MITIGATIONS:",
                mitigationData
            );

            console.log(
                "MANAGER PROFILE:",
                profileResult
            );

            console.log(
                "ALL RISKS:",
                riskData
            );

            const allMitigations =
                Array.isArray(mitigationData)
                    ? mitigationData
                    : [];

            /*
                Get department from current manager.
            */

            const departmentValues =
                getManagerDepartmentValues(
                    profileResult
                );

            console.log(
                "MANAGER DEPARTMENT:",
                departmentValues
            );

            /*
                IMPORTANT:

                If department cannot be detected,
                DO NOT show all mitigations.

                Otherwise Audit Manager could see
                another department's data.
            */

            if (
                !departmentValues ||
                departmentValues.length === 0
            ) {

                console.warn(
                    "Audit Manager department could not be identified."
                );

                setMitigations([]);

                setError(
                    "Audit Manager department could not be identified. Please check the profile department."
                );

                return;
            }


            // ==================================================
            // CREATE RISK MAP
            // ==================================================

            const riskMap = new Map();

            riskData.forEach((risk) => {

                const databaseId =
                    risk?.id;

                const businessRiskId =
                    risk?.riskId;

                const departmentValuesForRisk =
                    getRiskDepartmentValues(
                        risk
                    );

                if (
                    databaseId !== null &&
                    databaseId !== undefined
                ) {

                    riskMap.set(
                        String(databaseId),
                        {
                            ...risk,
                            departmentValues:
                                departmentValuesForRisk,
                        }
                    );
                }

                if (
                    businessRiskId !== null &&
                    businessRiskId !== undefined
                ) {

                    riskMap.set(
                        String(businessRiskId),
                        {
                            ...risk,
                            departmentValues:
                                departmentValuesForRisk,
                        }
                    );
                }

            });


            // ==================================================
            // FILTER MITIGATIONS BY MANAGER DEPARTMENT
            // ==================================================

            const departmentMitigations =
                allMitigations.filter(
                    (mitigation) => {

                        const mitigationRiskId =
                            getMitigationRiskId(
                                mitigation
                            );

                        if (
                            mitigationRiskId === null ||
                            mitigationRiskId === undefined
                        ) {
                            return false;
                        }

                        const relatedRisk =
                            riskMap.get(
                                String(mitigationRiskId)
                            );

                        /*
                            If mitigation doesn't have
                            matching risk, don't show it.
                        */

                        if (!relatedRisk) {

                            console.warn(
                                "Risk not found for mitigation:",
                                mitigation
                            );

                            return false;
                        }

                        const riskDepartmentValues =
                            relatedRisk.departmentValues ||
                            getRiskDepartmentValues(
                                relatedRisk
                            );

                        if (
                            riskDepartmentValues.length === 0
                        ) {

                            return false;
                        }

                        /*
                            Department matching.

                            Example:

                            Manager:
                            ["information technology", "it", "1"]

                            Risk:
                            ["information technology", "it", "1"]

                            => MATCH
                        */

                        const isSameDepartment =
                            riskDepartmentValues.some(
                                (riskDepartment) =>
                                    departmentValues.some(
                                        (managerDepartment) =>
                                            riskDepartment ===
                                            managerDepartment
                                    )
                            );

                        if (isSameDepartment) {

                            return true;
                        }

                        return false;
                    }
                );


            console.log(
                "DEPARTMENT FILTERED MITIGATIONS:",
                departmentMitigations
            );

            setMitigations(
                departmentMitigations
            );

        } catch (err) {

            console.error(
                "Failed to load mitigations:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load mitigation records."
            );

            setMitigations([]);

        } finally {

            setLoading(false);
        }
    };


    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {

        loadMitigations();

    }, []);


    // ========================================================
    // FILTER OPTIONS
    // ========================================================

    const statuses = useMemo(() => {

        return [
            ...new Set(
                mitigations
                    .map(
                        (item) =>
                            item.status
                    )
                    .filter(Boolean)
            ),
        ];

    }, [mitigations]);


    const mitigationTypes = useMemo(() => {

        return [
            ...new Set(
                mitigations
                    .map(
                        (item) =>
                            item.mitigationType
                    )
                    .filter(Boolean)
            ),
        ];

    }, [mitigations]);


    // ========================================================
    // FILTERED DATA
    // ========================================================

    const filteredMitigations = useMemo(() => {

        const searchValue =
            search
                .toLowerCase()
                .trim();

        return mitigations.filter(
            (item) => {

                const matchesSearch =
                    !searchValue ||
                    item.mitigationId
                        ?.toLowerCase()
                        .includes(searchValue) ||
                    item.mitigationTitle
                        ?.toLowerCase()
                        .includes(searchValue) ||
                    String(
                        item.riskId || ""
                    )
                        .toLowerCase()
                        .includes(searchValue) ||
                    item.riskTitle
                        ?.toLowerCase()
                        .includes(searchValue) ||
                    item.ownerName
                        ?.toLowerCase()
                        .includes(searchValue);


                const matchesStatus =
                    statusFilter === "ALL" ||
                    item.status ===
                        statusFilter;


                const matchesType =
                    typeFilter === "ALL" ||
                    item.mitigationType ===
                        typeFilter;


                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesType
                );
            }
        );

    }, [
        mitigations,
        search,
        statusFilter,
        typeFilter,
    ]);


    // ========================================================
    // STATISTICS
    // ========================================================

    const statistics = useMemo(() => {

        const total =
            mitigations.length;


        const completed =
            mitigations.filter(
                (item) => {

                    const status =
                        normalize(
                            item.status
                        );

                    return (
                        status.includes(
                            "complete"
                        ) ||
                        status.includes(
                            "closed"
                        ) ||
                        status.includes(
                            "done"
                        )
                    );
                }
            ).length;


        const pending =
            mitigations.filter(
                (item) => {

                    const status =
                        normalize(
                            item.status
                        );

                    return (
                        status.includes(
                            "pending"
                        ) ||
                        status.includes(
                            "open"
                        ) ||
                        status.includes(
                            "planned"
                        )
                    );
                }
            ).length;


        const inProgress =
            mitigations.filter(
                (item) => {

                    const status =
                        normalize(
                            item.status
                        );

                    return (
                        status.includes(
                            "progress"
                        ) ||
                        status.includes(
                            "ongoing"
                        )
                    );
                }
            ).length;


        const overdue =
            mitigations.filter(
                (item) => {

                    if (
                        !item.targetDate
                    ) {
                        return false;
                    }

                    if (
                        item.completedDate
                    ) {
                        return false;
                    }

                    const target =
                        new Date(
                            item.targetDate
                        );

                    return (
                        target <
                        new Date()
                    );
                }
            ).length;


        const effective =
            mitigations.filter(
                (item) => {

                    const value =
                        normalize(
                            item.effectiveness
                        );

                    return (
                        value ===
                            "effective" ||
                        value ===
                            "highly effective"
                    );
                }
            ).length;


        return {
            total,
            completed,
            pending,
            inProgress,
            overdue,
            effective,
        };

    }, [mitigations]);


    // ========================================================
    // STATUS CHART
    // ========================================================

    const statusChartData =
        useMemo(() => {

            const map = {};

            mitigations.forEach(
                (item) => {

                    const status =
                        item.status ||
                        "UNKNOWN";

                    map[status] =
                        (map[status] ||
                            0) + 1;
                }
            );

            return Object.entries(
                map
            ).map(
                ([name, value]) => ({
                    name,
                    value,
                })
            );

        }, [mitigations]);


    // ========================================================
    // EFFECTIVENESS CHART
    // ========================================================

    const effectivenessChartData =
        useMemo(() => {

            const map = {};

            mitigations.forEach(
                (item) => {

                    const effectiveness =
                        item.effectiveness ||
                        "NOT ASSESSED";

                    map[effectiveness] =
                        (map[effectiveness] ||
                            0) + 1;
                }
            );

            return Object.entries(
                map
            ).map(
                ([name, value]) => ({
                    name,
                    value,
                })
            );

        }, [mitigations]);


    // ========================================================
    // TYPE CHART
    // ========================================================

    const typeChartData =
        useMemo(() => {

            const map = {};

            mitigations.forEach(
                (item) => {

                    const type =
                        item.mitigationType ||
                        "UNKNOWN";

                    map[type] =
                        (map[type] ||
                            0) + 1;
                }
            );

            return Object.entries(
                map
            ).map(
                ([name, value]) => ({
                    name,
                    value,
                })
            );

        }, [mitigations]);


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (
            <div className="min-h-screen bg-white p-8">

                <div className="max-w-[1600px] mx-auto">

                    <div className="animate-pulse space-y-6">

                        <div className="h-10 w-72 bg-slate-100 rounded-lg" />

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

                            {[1, 2, 3, 4].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="h-32 bg-slate-100 rounded-2xl"
                                    />
                                )
                            )}

                        </div>

                        <div className="h-96 bg-slate-100 rounded-2xl" />

                    </div>

                </div>

            </div>
        );
    }


    // ========================================================
    // ERROR
    // ========================================================

    if (error) {

        return (
            <div className="min-h-screen bg-white p-8">

                <div className="max-w-[1600px] mx-auto">

                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">

                        <div className="flex items-center gap-3">

                            <AlertCircle
                                className="text-red-600"
                            />

                            <div>

                                <h2 className="font-bold text-red-800">
                                    Failed to load mitigations
                                </h2>

                                <p className="text-sm text-red-600 mt-1">
                                    {error}
                                </p>

                            </div>

                        </div>

                        <button
                            onClick={loadMitigations}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
                        >
                            Retry
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // ========================================================
    // UI
    // ========================================================

    return (

        <div className="min-h-screen bg-white text-slate-800 p-6 md:p-8">

            <div className="max-w-[1600px] mx-auto">


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                    <div>

                        <div className="flex items-center gap-2">

                            <ShieldCheck
                                size={25}
                                className="text-teal-600"
                            />

                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                                Mitigation Management
                            </h1>

                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            Monitor mitigation activities for your department,
                            ownership, effectiveness and closure.
                        </p>

                        {/* DEPARTMENT INDICATOR */}

                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-100">

                            <ShieldCheck
                                size={14}
                                className="text-teal-600"
                            />

                            <span className="text-xs font-semibold text-teal-700">
                                Department Scoped
                            </span>

                        </div>

                    </div>


                    <button
                        onClick={loadMitigations}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 font-medium hover:bg-slate-50 transition"
                    >

                        <RefreshCw size={17} />

                        Refresh

                    </button>

                </div>


                {/* ==================================================
                    STAT CARDS
                ================================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">

                    <StatCard
                        title="Total Mitigations"
                        value={
                            statistics.total
                        }
                        subtitle="For your department"
                        icon={
                            ShieldCheck
                        }
                        iconClass="bg-teal-50 text-teal-600"
                    />


                    <StatCard
                        title="Completed"
                        value={
                            statistics.completed
                        }
                        subtitle="Successfully completed"
                        icon={
                            CheckCircle2
                        }
                        iconClass="bg-emerald-50 text-emerald-600"
                    />


                    <StatCard
                        title="In Progress"
                        value={
                            statistics.inProgress
                        }
                        subtitle="Currently being addressed"
                        icon={
                            TrendingUp
                        }
                        iconClass="bg-blue-50 text-blue-600"
                    />


                    <StatCard
                        title="Overdue"
                        value={
                            statistics.overdue
                        }
                        subtitle="Past target date"
                        icon={
                            AlertCircle
                        }
                        iconClass="bg-red-50 text-red-600"
                    />

                </div>


                {/* ==================================================
                    SECONDARY KPI
                ================================================== */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-500">
                                    Pending Mitigations
                                </p>

                                <p className="text-2xl font-bold text-slate-800 mt-1">
                                    {statistics.pending}
                                </p>

                            </div>

                            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">

                                <Clock3
                                    size={21}
                                />

                            </div>

                        </div>

                    </div>


                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

                        <div className="flex items-center justify-between">

                            <div>

                                <p className="text-sm text-slate-500">
                                    Effective Mitigations
                                </p>

                                <p className="text-2xl font-bold text-slate-800 mt-1">
                                    {statistics.effective}
                                </p>

                            </div>

                            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">

                                <Target
                                    size={21}
                                />

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    CHARTS
                ================================================== */}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">


                    {/* STATUS */}

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

                        <div className="mb-3">

                            <h2 className="font-bold text-slate-800">
                                Mitigation Status
                            </h2>

                            <p className="text-xs text-slate-400 mt-1">
                                Department mitigation status distribution
                            </p>

                        </div>

                        <div className="h-[280px]">

                            {statusChartData.length === 0 ? (

                                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                    No status data available
                                </div>

                            ) : (

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <PieChart>

                                        <Pie
                                            data={
                                                statusChartData
                                            }
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="45%"
                                            outerRadius={85}
                                            innerRadius={48}
                                            paddingAngle={3}
                                        >

                                            {statusChartData.map(
                                                (_, index) => (
                                                    <Cell
                                                        key={index}
                                                    />
                                                )
                                            )}

                                        </Pie>

                                        <Tooltip />

                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                        />

                                    </PieChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </div>


                    {/* EFFECTIVENESS */}

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

                        <div className="mb-3">

                            <h2 className="font-bold text-slate-800">
                                Effectiveness
                            </h2>

                            <p className="text-xs text-slate-400 mt-1">
                                Department mitigation effectiveness
                            </p>

                        </div>

                        <div className="h-[280px]">

                            {effectivenessChartData.length === 0 ? (

                                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                    No effectiveness data
                                </div>

                            ) : (

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <BarChart
                                        data={
                                            effectivenessChartData
                                        }
                                        margin={{
                                            top: 10,
                                            right: 10,
                                            left: -20,
                                            bottom: 20,
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            dataKey="name"
                                            tick={{
                                                fontSize: 11,
                                            }}
                                        />

                                        <YAxis
                                            allowDecimals={false}
                                        />

                                        <Tooltip />

                                        <Bar
                                            dataKey="value"
                                            radius={[
                                                6,
                                                6,
                                                0,
                                                0,
                                            ]}
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </div>


                    {/* TYPES */}

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

                        <div className="mb-3">

                            <h2 className="font-bold text-slate-800">
                                Mitigation Types
                            </h2>

                            <p className="text-xs text-slate-400 mt-1">
                                Department treatment type distribution
                            </p>

                        </div>

                        <div className="h-[280px]">

                            {typeChartData.length === 0 ? (

                                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                                    No mitigation type data
                                </div>

                            ) : (

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <BarChart
                                        data={
                                            typeChartData
                                        }
                                        layout="vertical"
                                        margin={{
                                            left: 15,
                                            right: 20,
                                        }}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                        />

                                        <XAxis
                                            type="number"
                                            allowDecimals={false}
                                        />

                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            width={90}
                                            tick={{
                                                fontSize: 10,
                                            }}
                                        />

                                        <Tooltip />

                                        <Bar
                                            dataKey="value"
                                            radius={[
                                                0,
                                                6,
                                                6,
                                                0,
                                            ]}
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            )}

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    FILTERS
                ================================================== */}

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">

                    <div className="flex flex-col lg:flex-row gap-4">


                        {/* SEARCH */}

                        <div className="relative flex-1">

                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search mitigation, risk or owner..."
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                            />

                        </div>


                        {/* STATUS */}

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                            className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-teal-500"
                        >

                            <option value="ALL">
                                All Statuses
                            </option>

                            {statuses.map(
                                (status) => (
                                    <option
                                        key={status}
                                        value={status}
                                    >
                                        {status}
                                    </option>
                                )
                            )}

                        </select>


                        {/* TYPE */}

                        <select
                            value={
                                typeFilter
                            }
                            onChange={(e) =>
                                setTypeFilter(
                                    e.target.value
                                )
                            }
                            className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-teal-500"
                        >

                            <option value="ALL">
                                All Types
                            </option>

                            {mitigationTypes.map(
                                (type) => (
                                    <option
                                        key={type}
                                        value={type}
                                    >
                                        {type}
                                    </option>
                                )
                            )}

                        </select>

                    </div>

                </div>


                {/* ==================================================
                    TABLE
                ================================================== */}

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                    <div className="px-6 py-5 border-b border-slate-200">

                        <div className="flex items-center justify-between">

                            <div>

                                <h2 className="font-bold text-slate-800">
                                    Department Mitigation Register
                                </h2>

                                <p className="text-xs text-slate-400 mt-1">
                                    {filteredMitigations.length} mitigation
                                    {filteredMitigations.length !== 1
                                        ? "s"
                                        : ""}{" "}
                                    found
                                </p>

                            </div>

                        </div>

                    </div>


                    {filteredMitigations.length === 0 ? (

                        <div className="py-16 text-center">

                            <ShieldCheck
                                size={42}
                                className="mx-auto text-slate-300"
                            />

                            <h3 className="mt-4 font-semibold text-slate-700">
                                No department mitigations found
                            </h3>

                            <p className="text-sm text-slate-400 mt-1">
                                No mitigation has been created for risks
                                belonging to your department.
                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full text-sm">

                                <thead className="bg-slate-50 border-b border-slate-200">

                                    <tr>

                                        <th className="text-left px-6 py-4 font-semibold text-slate-500">
                                            Mitigation
                                        </th>

                                        <th className="text-left px-6 py-4 font-semibold text-slate-500">
                                            Risk
                                        </th>

                                        <th className="text-left px-6 py-4 font-semibold text-slate-500">
                                            Type
                                        </th>

                                        <th className="text-left px-6 py-4 font-semibold text-slate-500">
                                            Owner
                                        </th>

                                        <th className="text-left px-6 py-4 font-semibold text-slate-500">
                                            Target Date
                                        </th>

                                        <th className="text-left px-6 py-4 font-semibold text-slate-500">
                                            Effectiveness
                                        </th>

                                        <th className="text-left px-6 py-4 font-semibold text-slate-500">
                                            Status
                                        </th>

                                        <th className="px-6 py-4"></th>

                                    </tr>

                                </thead>


                                <tbody className="divide-y divide-slate-100">

                                    {filteredMitigations.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.mitigationId ||
                                                    item.id
                                                }
                                                className="hover:bg-slate-50 transition"
                                            >

                                                {/* MITIGATION */}

                                                <td className="px-6 py-4">

                                                    <div>

                                                        <p className="font-semibold text-slate-800">
                                                            {
                                                                item.mitigationTitle
                                                            }
                                                        </p>

                                                        <p className="text-xs text-teal-600 font-medium mt-1">
                                                            {
                                                                item.mitigationId ||
                                                                "—"
                                                            }
                                                        </p>

                                                    </div>

                                                </td>


                                                {/* RISK */}

                                                <td className="px-6 py-4">

                                                    <div>

                                                        <p className="font-medium text-slate-700">
                                                            {
                                                                item.riskTitle ||
                                                                "—"
                                                            }
                                                        </p>

                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {
                                                                item.riskId ||
                                                                "—"
                                                            }
                                                        </p>

                                                    </div>

                                                </td>


                                                {/* TYPE */}

                                                <td className="px-6 py-4">

                                                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                                                        {
                                                            item.mitigationType ||
                                                            "—"
                                                        }
                                                    </span>

                                                </td>


                                                {/* OWNER */}

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-2">

                                                        <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">

                                                            <User
                                                                size={14}
                                                            />

                                                        </div>

                                                        <span className="text-slate-700 font-medium">
                                                            {
                                                                item.ownerName ||
                                                                "Unassigned"
                                                            }
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* TARGET DATE */}

                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-2 text-slate-600">

                                                        <CalendarDays
                                                            size={15}
                                                            className="text-slate-400"
                                                        />

                                                        {
                                                            formatDate(
                                                                item.targetDate
                                                            )
                                                        }

                                                    </div>

                                                </td>


                                                {/* EFFECTIVENESS */}

                                                <td className="px-6 py-4">

                                                    <EffectivenessBadge
                                                        effectiveness={
                                                            item.effectiveness
                                                        }
                                                    />

                                                </td>


                                                {/* STATUS */}

                                                <td className="px-6 py-4">

                                                    <StatusBadge
                                                        status={
                                                            item.status
                                                        }
                                                    />

                                                </td>


                                                {/* VIEW */}

                                                <td className="px-6 py-4 text-right">

                                                    <button
                                                        onClick={() =>
                                                            setSelectedMitigation(
                                                                item
                                                            )
                                                        }
                                                        className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-teal-50 hover:text-teal-600 hover:border-teal-200 transition"
                                                    >

                                                        <ChevronRight
                                                            size={17}
                                                        />

                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>


            {/* ==================================================
                DETAILS MODAL
            ================================================== */}

            {selectedMitigation && (

                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">


                        {/* HEADER */}

                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">

                            <div>

                                <p className="text-xs text-teal-600 font-bold">
                                    {
                                        selectedMitigation.mitigationId ||
                                        "—"
                                    }
                                </p>

                                <h2 className="text-xl font-bold text-slate-800 mt-1">
                                    {
                                        selectedMitigation.mitigationTitle
                                    }
                                </h2>

                            </div>

                            <button
                                onClick={() =>
                                    setSelectedMitigation(
                                        null
                                    )
                                }
                                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center"
                            >

                                <X size={19} />

                            </button>

                        </div>


                        <div className="p-6 space-y-6">


                            {/* STATUS */}

                            <div className="flex flex-wrap gap-2">

                                <StatusBadge
                                    status={
                                        selectedMitigation.status
                                    }
                                />

                                <EffectivenessBadge
                                    effectiveness={
                                        selectedMitigation.effectiveness
                                    }
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div>

                                <h3 className="font-semibold text-slate-800 mb-2">
                                    Description
                                </h3>

                                <p className="text-sm text-slate-600 leading-6">
                                    {
                                        selectedMitigation.mitigationDescription ||
                                        "No description provided."
                                    }
                                </p>

                            </div>


                            {/* RISK */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                                <div className="bg-slate-50 rounded-xl p-4">

                                    <p className="text-xs text-slate-400">
                                        Risk ID
                                    </p>

                                    <p className="font-semibold text-slate-800 mt-1">
                                        {
                                            selectedMitigation.riskId ||
                                            "—"
                                        }
                                    </p>

                                </div>


                                <div className="bg-slate-50 rounded-xl p-4">

                                    <p className="text-xs text-slate-400">
                                        Risk Title
                                    </p>

                                    <p className="font-semibold text-slate-800 mt-1">
                                        {
                                            selectedMitigation.riskTitle ||
                                            "—"
                                        }
                                    </p>

                                </div>


                                <div className="bg-slate-50 rounded-xl p-4">

                                    <p className="text-xs text-slate-400">
                                        Mitigation Type
                                    </p>

                                    <p className="font-semibold text-slate-800 mt-1">
                                        {
                                            selectedMitigation.mitigationType ||
                                            "—"
                                        }
                                    </p>

                                </div>


                                <div className="bg-slate-50 rounded-xl p-4">

                                    <p className="text-xs text-slate-400">
                                        Owner
                                    </p>

                                    <p className="font-semibold text-slate-800 mt-1">
                                        {
                                            selectedMitigation.ownerName ||
                                            "Unassigned"
                                        }
                                    </p>

                                </div>

                            </div>


                            {/* DATES */}

                            <div>

                                <h3 className="font-semibold text-slate-800 mb-3">
                                    Timeline
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                                    <div className="border border-slate-200 rounded-xl p-4">

                                        <p className="text-xs text-slate-400">
                                            Target Date
                                        </p>

                                        <p className="font-semibold text-slate-800 mt-1">
                                            {
                                                formatDate(
                                                    selectedMitigation.targetDate
                                                )
                                            }
                                        </p>

                                    </div>


                                    <div className="border border-slate-200 rounded-xl p-4">

                                        <p className="text-xs text-slate-400">
                                            Completed Date
                                        </p>

                                        <p className="font-semibold text-slate-800 mt-1">
                                            {
                                                formatDate(
                                                    selectedMitigation.completedDate
                                                )
                                            }
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* COST */}

                            <div>

                                <h3 className="font-semibold text-slate-800 mb-2">
                                    Cost
                                </h3>

                                <p className="text-xl font-bold text-slate-800">

                                    {
                                        selectedMitigation.cost !==
                                            null &&
                                        selectedMitigation.cost !==
                                            undefined
                                            ? `₹ ${Number(
                                                  selectedMitigation.cost
                                              ).toLocaleString(
                                                  "en-IN"
                                              )}`
                                            : "Not specified"
                                    }

                                </p>

                            </div>


                            {/* REMARKS */}

                            <div>

                                <h3 className="font-semibold text-slate-800 mb-2">
                                    Remarks
                                </h3>

                                <div className="bg-slate-50 rounded-xl p-4">

                                    <p className="text-sm text-slate-600 leading-6">
                                        {
                                            selectedMitigation.remarks ||
                                            "No remarks provided."
                                        }
                                    </p>

                                </div>

                            </div>


                            {/* TIMESTAMPS */}

                            <div className="pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400">

                                <div>
                                    Created:{" "}
                                    {
                                        formatDate(
                                            selectedMitigation.createdAt
                                        )
                                    }
                                </div>

                                <div>
                                    Updated:{" "}
                                    {
                                        formatDate(
                                            selectedMitigation.updatedAt
                                        )
                                    }
                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};


export default AuditManagerMitigations;