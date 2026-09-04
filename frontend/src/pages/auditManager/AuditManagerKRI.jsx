import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

import {
    Activity,
    AlertTriangle,
    CheckCircle2,
    Search,
    Filter,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    ShieldAlert,
    Target,
    Eye,
    X,
    Gauge,
    Building2,
    Layers3,
} from "lucide-react";

import axios from "axios";
import KriService from "../../service/KriService";

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
// TOKEN
// ============================================================

const getToken = () => {
    return localStorage.getItem("token");
};

// ============================================================
// NORMALIZE TEXT
// ============================================================

const normalizeText = (value) => {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
};

// ============================================================
// GET USER FROM LOCAL STORAGE
// ============================================================

const getStoredUser = () => {
    try {
        const currentUser = localStorage.getItem("currentUser");

        if (currentUser) {
            const parsed = JSON.parse(currentUser);

            if (parsed && typeof parsed === "object") {
                return parsed;
            }
        }
    } catch (error) {
        console.error(
            "Failed to parse currentUser:",
            error
        );
    }

    try {
        const user = localStorage.getItem("user");

        if (user) {
            const parsed = JSON.parse(user);

            if (parsed && typeof parsed === "object") {
                return parsed;
            }
        }
    } catch (error) {
        console.error(
            "Failed to parse user:",
            error
        );
    }

    return null;
};

// ============================================================
// DEPARTMENT HELPERS
// ============================================================

const extractDepartment = (user) => {
    if (!user || typeof user !== "object") {
        return {
            id: null,
            name: "",
        };
    }

    /*
     * Possible backend structures:
     *
     * user.department = {
     *     id: 1,
     *     name: "Information Technology"
     * }
     *
     * OR
     *
     * user.departmentName = "Information Technology"
     *
     * OR
     *
     * user.departmentId = 1
     */

    const possibleDepartments = [
        user.department,
        user.profile?.department,
        user.user?.department,
        user.data?.department,
    ];

    for (const department of possibleDepartments) {
        if (
            department &&
            typeof department === "object"
        ) {
            return {
                id:
                    department.id ??
                    department.departmentId ??
                    null,

                name:
                    department.name ||
                    department.departmentName ||
                    "",
            };
        }

        if (typeof department === "string") {
            return {
                id:
                    user.departmentId ??
                    user.profile?.departmentId ??
                    null,

                name: department,
            };
        }
    }

    return {
        id:
            user.departmentId ??
            user.profile?.departmentId ??
            user.user?.departmentId ??
            null,

        name:
            user.departmentName ||
            user.profile?.departmentName ||
            user.user?.departmentName ||
            "",
    };
};

// ============================================================
// KRI DEPARTMENT NAME
// ============================================================

const getDepartmentName = (kri) => {
    if (!kri) {
        return "";
    }

    /*
     * Direct department
     */

    if (kri.department) {
        if (typeof kri.department === "string") {
            return kri.department;
        }

        if (
            typeof kri.department === "object"
        ) {
            return (
                kri.department.name ||
                kri.department.departmentName ||
                ""
            );
        }
    }

    /*
     * Direct departmentName
     */

    if (kri.departmentName) {
        return kri.departmentName;
    }

    /*
     * Risk department
     */

    if (kri.risk?.department) {
        if (
            typeof kri.risk.department === "string"
        ) {
            return kri.risk.department;
        }

        if (
            typeof kri.risk.department === "object"
        ) {
            return (
                kri.risk.department.name ||
                kri.risk.department.departmentName ||
                ""
            );
        }
    }

    if (kri.risk?.departmentName) {
        return kri.risk.departmentName;
    }

    return "";
};

// ============================================================
// KRI DEPARTMENT ID
// ============================================================

const getDepartmentId = (kri) => {
    if (!kri) {
        return null;
    }

    if (kri.department) {
        if (
            typeof kri.department === "object"
        ) {
            return (
                kri.department.id ??
                kri.department.departmentId ??
                null
            );
        }
    }

    if (
        kri.departmentId !== undefined &&
        kri.departmentId !== null
    ) {
        return kri.departmentId;
    }

    if (
        kri.risk?.department &&
        typeof kri.risk.department === "object"
    ) {
        return (
            kri.risk.department.id ??
            kri.risk.department.departmentId ??
            null
        );
    }

    if (
        kri.risk?.departmentId !== undefined &&
        kri.risk?.departmentId !== null
    ) {
        return kri.risk.departmentId;
    }

    return null;
};

// ============================================================
// CHECK DEPARTMENT MATCH
// ============================================================

const belongsToManagerDepartment = (
    kri,
    managerDepartment
) => {
    if (!managerDepartment) {
        return false;
    }

    const kriDepartmentId =
        getDepartmentId(kri);

    const kriDepartmentName =
        getDepartmentName(kri);

    const managerDepartmentId =
        managerDepartment.id;

    const managerDepartmentName =
        managerDepartment.name;

    /*
     * BEST MATCH:
     * Department ID
     */

    if (
        managerDepartmentId !== null &&
        managerDepartmentId !== undefined &&
        kriDepartmentId !== null &&
        kriDepartmentId !== undefined
    ) {
        return (
            String(kriDepartmentId) ===
            String(managerDepartmentId)
        );
    }

    /*
     * FALLBACK:
     * Department name
     */

    if (
        managerDepartmentName &&
        kriDepartmentName
    ) {
        return (
            normalizeText(kriDepartmentName) ===
            normalizeText(managerDepartmentName)
        );
    }

    return false;
};

// ============================================================
// ANIMATION VARIANTS
// ============================================================

const containerVariants = {
    hidden: {
        opacity: 0,
    },

    show: {
        opacity: 1,

        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 20,
    },

    show: {
        opacity: 1,
        y: 0,

        transition: {
            duration: 0.45,
            ease: "easeOut",
        },
    },
};

// ============================================================
// STATUS HELPERS
// ============================================================

const normalizeStatus = (status) => {
    if (!status) {
        return "UNKNOWN";
    }

    return String(status)
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_");
};

// ============================================================
// STATUS CONFIG
// ============================================================

const getStatusConfig = (status) => {
    const normalized =
        normalizeStatus(status);

    switch (normalized) {
        case "GREEN":
        case "HEALTHY":
        case "NORMAL":
        case "ACTIVE":
            return {
                label: "Healthy",

                className:
                    "bg-emerald-50 text-emerald-700 border-emerald-200",

                dot: "bg-emerald-500",
            };

        case "AMBER":
        case "WARNING":
        case "MEDIUM":
        case "AT_RISK":
            return {
                label: "Warning",

                className:
                    "bg-amber-50 text-amber-700 border-amber-200",

                dot: "bg-amber-500",
            };

        case "RED":
        case "CRITICAL":
        case "HIGH":
        case "BREACHED":
            return {
                label: "Critical",

                className:
                    "bg-red-50 text-red-700 border-red-200",

                dot: "bg-red-500",
            };

        default:
            return {
                label: status || "Unknown",

                className:
                    "bg-slate-50 text-slate-600 border-slate-200",

                dot: "bg-slate-400",
            };
    }
};

// ============================================================
// STATUS BADGE
// ============================================================

const StatusBadge = ({ status }) => {
    const config =
        getStatusConfig(status);

    return (
        <span
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${config.className}`}
        >
            <span
                className={`w-2 h-2 rounded-full ${config.dot}`}
            />

            {config.label}
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
    trend,
}) => {
    return (
        <motion.div
            variants={itemVariants}
            whileHover={{
                y: -5,
                scale: 1.01,
            }}
            className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-5"
        >
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-slate-50" />

            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500">
                        {title}
                    </p>

                    <h3 className="mt-2 text-3xl font-bold text-slate-900">
                        {value}
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                        {subtitle}
                    </p>
                </div>

                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-700" />
                </div>
            </div>

            {trend !== undefined &&
                trend !== null && (
                    <div
                        className={`relative mt-4 flex items-center gap-1 text-xs font-medium ${
                            trend >= 0
                                ? "text-emerald-600"
                                : "text-red-600"
                        }`}
                    >
                        {trend >= 0 ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                        ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                        )}

                        {Math.abs(trend)}% from previous period
                    </div>
                )}
        </motion.div>
    );
};

// ============================================================
// KRI DETAILS MODAL
// ============================================================

const KriDetailsModal = ({
    kri,
    onClose,
}) => {
    if (!kri) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{
                    opacity: 0,
                }}
                animate={{
                    opacity: 1,
                }}
                exit={{
                    opacity: 0,
                }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.92,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                    }}
                    exit={{
                        opacity: 0,
                        scale: 0.92,
                        y: 20,
                    }}
                    transition={{
                        duration: 0.25,
                    }}
                    onClick={(e) =>
                        e.stopPropagation()
                    }
                    className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                >
                    {/* HEADER */}

                    <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {kri.kriId || "-"}
                            </p>

                            <h2 className="text-xl font-bold text-slate-900 mt-1">
                                {kri.kriName ||
                                    "Unnamed KRI"}
                            </h2>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* CONTENT */}

                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <StatusBadge
                                status={kri.status}
                            />

                            <div className="text-sm text-slate-500">
                                Frequency:{" "}
                                <span className="font-semibold text-slate-800">
                                    {kri.frequency ||
                                        "N/A"}
                                </span>
                            </div>
                        </div>

                        {/* DESCRIPTION */}

                        <div>
                            <p className="text-sm text-slate-500">
                                Description
                            </p>

                            <p className="mt-1 text-sm text-slate-800">
                                {kri.description ||
                                    "No description available"}
                            </p>
                        </div>

                        {/* CURRENT VALUE */}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="text-xs text-slate-400">
                                    Current Value
                                </p>

                                <p className="mt-1 text-2xl font-bold text-slate-900">
                                    {kri.currentValue ??
                                        "-"}
                                </p>
                            </div>

                            <div className="rounded-xl bg-emerald-50 p-4">
                                <p className="text-xs text-emerald-600">
                                    Green Threshold
                                </p>

                                <p className="mt-1 text-2xl font-bold text-emerald-700">
                                    {kri.greenThreshold ??
                                        "-"}
                                </p>
                            </div>

                            <div className="rounded-xl bg-amber-50 p-4">
                                <p className="text-xs text-amber-600">
                                    Amber Threshold
                                </p>

                                <p className="mt-1 text-2xl font-bold text-amber-700">
                                    {kri.amberThreshold ??
                                        "-"}
                                </p>
                            </div>

                            <div className="rounded-xl bg-red-50 p-4">
                                <p className="text-xs text-red-600">
                                    Red Threshold
                                </p>

                                <p className="mt-1 text-2xl font-bold text-red-700">
                                    {kri.redThreshold ??
                                        "-"}
                                </p>
                            </div>
                        </div>

                        {/* INFORMATION */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* RISK */}

                            <div className="rounded-xl border border-slate-200 p-4">
                                <p className="text-xs text-slate-400">
                                    Risk
                                </p>

                                <p className="mt-1 font-semibold text-slate-900">
                                    {kri.riskCode ||
                                        "-"}
                                </p>

                                <p className="text-sm text-slate-500">
                                    {kri.riskTitle ||
                                        "-"}
                                </p>
                            </div>

                            {/* OWNER */}

                            <div className="rounded-xl border border-slate-200 p-4">
                                <p className="text-xs text-slate-400">
                                    Owner
                                </p>

                                <p className="mt-1 font-semibold text-slate-900">
                                    {kri.ownerName ||
                                        "-"}
                                </p>

                                <p className="text-sm text-slate-500">
                                    {kri.ownerEmployeeId ||
                                        "-"}
                                </p>
                            </div>

                            {/* DEPARTMENT */}

                            <div className="rounded-xl border border-slate-200 p-4">
                                <p className="text-xs text-slate-400">
                                    Department
                                </p>

                                <p className="mt-1 font-semibold text-slate-900">
                                    {getDepartmentName(
                                        kri
                                    ) || "-"}
                                </p>

                                {getDepartmentId(
                                    kri
                                ) !== null && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        Department ID:{" "}
                                        {getDepartmentId(
                                            kri
                                        )}
                                    </p>
                                )}
                            </div>

                            {/* BUSINESS UNIT */}

                            <div className="rounded-xl border border-slate-200 p-4">
                                <p className="text-xs text-slate-400">
                                    Business Unit
                                </p>

                                <p className="mt-1 font-semibold text-slate-900">
                                    {kri.businessUnit ||
                                        "-"}
                                </p>
                            </div>
                        </div>

                        {/* DATA SOURCE */}

                        {kri.dataSource && (
                            <div className="rounded-xl border border-slate-200 p-4">
                                <p className="text-xs text-slate-400">
                                    Data Source
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {kri.dataSource}
                                </p>
                            </div>
                        )}

                        {/* REMARKS */}

                        {kri.remarks && (
                            <div className="rounded-xl bg-slate-50 p-4">
                                <p className="text-xs text-slate-400">
                                    Remarks
                                </p>

                                <p className="mt-1 text-sm text-slate-700">
                                    {kri.remarks}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const AuditManagerKRI = () => {
    const [kris, setKris] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [profileLoading, setProfileLoading] =
        useState(true);

    const [managerDepartment, setManagerDepartment] =
        useState({
            id: null,
            name: "",
        });

    const [departmentError, setDepartmentError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [categoryFilter, setCategoryFilter] =
        useState("ALL");

    const [selectedKri, setSelectedKri] =
        useState(null);

    // ========================================================
    // LOAD LOGGED-IN AUDIT MANAGER PROFILE
    // ========================================================

    const loadManagerDepartment = async () => {
        try {
            setProfileLoading(true);
            setDepartmentError("");

            /*
             * FIRST:
             * Try localStorage
             */

            const storedUser =
                getStoredUser();

            let department =
                extractDepartment(
                    storedUser
                );

            /*
             * If localStorage has department,
             * use it directly.
             */

            if (
                department.id !== null ||
                department.name
            ) {
                console.log(
                    "Audit Manager Department from localStorage:",
                    department
                );

                setManagerDepartment(
                    department
                );

                return department;
            }

            /*
             * FALLBACK:
             * Fetch profile from backend
             */

            const token = getToken();

            if (!token) {
                throw new Error(
                    "Authentication token not found."
                );
            }

            const response =
                await API.get(
                    "/profile",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

            console.log(
                "AUDIT MANAGER PROFILE:",
                response.data
            );

            const profileData =
                response.data?.data ||
                response.data?.profile ||
                response.data;

            department =
                extractDepartment(
                    profileData
                );

            if (
                department.id === null &&
                !department.name
            ) {
                throw new Error(
                    "Department information not found in profile."
                );
            }

            setManagerDepartment(
                department
            );

            /*
             * Save updated user information
             */

            try {
                localStorage.setItem(
                    "currentUser",
                    JSON.stringify(
                        profileData
                    )
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        profileData
                    )
                );
            } catch (storageError) {
                console.warn(
                    "Unable to update localStorage:",
                    storageError
                );
            }

            return department;
        } catch (error) {
            console.error(
                "Failed to load Audit Manager department:",
                error
            );

            setManagerDepartment({
                id: null,
                name: "",
            });

            setDepartmentError(
                error?.message ||
                    "Unable to determine your department."
            );

            return null;
        } finally {
            setProfileLoading(false);
        }
    };

    // ========================================================
    // LOAD KRIs
    // ========================================================

    const loadKris = async () => {
        try {
            setLoading(true);

            /*
             * Make sure department is known
             */

            let department =
                managerDepartment;

            if (
                !department?.id &&
                !department?.name
            ) {
                department =
                    await loadManagerDepartment();
            }

            if (
                !department ||
                (department.id === null &&
                    !department.name)
            ) {
                console.error(
                    "Cannot load department-specific KRIs because department is unknown."
                );

                setKris([]);

                return;
            }

            const response =
                await KriService.getAllKris();

            console.log(
                "KRI RESPONSE:",
                response
            );

            let data = [];

            /*
             * Backend response:
             *
             * {
             *   success: true,
             *   message: "...",
             *   data: [...]
             * }
             */

            if (Array.isArray(response)) {
                data = response;
            } else if (
                Array.isArray(response?.data)
            ) {
                data = response.data;
            } else if (
                Array.isArray(response?.content)
            ) {
                data = response.content;
            } else if (
                Array.isArray(response?.kris)
            ) {
                data = response.kris;
            }

            /*
             * Valid objects only
             */

            data = data.filter(
                (item) =>
                    item &&
                    typeof item === "object" &&
                    !Array.isArray(item)
            );

            console.log(
                "ALL KRIs:",
                data
            );

            /*
             * ==================================================
             * IMPORTANT DEPARTMENT FILTER
             * ==================================================
             *
             * Only KRIs belonging to the logged-in
             * Audit Manager's department are allowed.
             */

            const departmentFiltered =
                data.filter((kri) =>
                    belongsToManagerDepartment(
                        kri,
                        department
                    )
                );

            console.log(
                "MANAGER DEPARTMENT:",
                department
            );

            console.log(
                "DEPARTMENT FILTERED KRIs:",
                departmentFiltered
            );

            setKris(
                departmentFiltered
            );
        } catch (error) {
            console.error(
                "Failed to load KRIs:",
                error
            );

            setKris([]);
        } finally {
            setLoading(false);
        }
    };

    // ========================================================
    // INITIAL LOAD
    // ========================================================

    useEffect(() => {
        const initialize = async () => {
            const department =
                await loadManagerDepartment();

            if (department) {
                await loadKris();
            } else {
                setLoading(false);
            }
        };

        initialize();
    }, []);

    // ========================================================
    // REFRESH
    // ========================================================

    const handleRefresh = async () => {
        try {
            setRefreshing(true);

            const department =
                await loadManagerDepartment();

            if (department) {
                await loadKris();
            }
        } finally {
            setRefreshing(false);
        }
    };

    // ========================================================
    // CATEGORY OPTIONS
    // ========================================================

    const categories = useMemo(() => {
        return [
            ...new Set(
                kris
                    .map(
                        (kri) =>
                            kri.riskCategory
                    )
                    .filter(Boolean)
            ),
        ];
    }, [kris]);

    // ========================================================
    // FILTERED DATA
    // ========================================================

    const filteredKris = useMemo(() => {
        return kris.filter((kri) => {
            const searchValue =
                search
                    .trim()
                    .toLowerCase();

            const departmentName =
                getDepartmentName(kri);

            const matchesSearch =
                !searchValue ||
                String(
                    kri.kriId || ""
                )
                    .toLowerCase()
                    .includes(searchValue) ||
                String(
                    kri.kriName || ""
                )
                    .toLowerCase()
                    .includes(searchValue) ||
                String(
                    kri.riskCode || ""
                )
                    .toLowerCase()
                    .includes(searchValue) ||
                String(
                    kri.riskTitle || ""
                )
                    .toLowerCase()
                    .includes(searchValue) ||
                String(
                    kri.ownerName || ""
                )
                    .toLowerCase()
                    .includes(searchValue) ||
                departmentName
                    .toLowerCase()
                    .includes(searchValue);

            const normalizedStatus =
                normalizeStatus(
                    kri.status
                );

            let matchesStatus =
                true;

            if (
                statusFilter !==
                "ALL"
            ) {
                if (
                    statusFilter ===
                    "HEALTHY"
                ) {
                    matchesStatus = [
                        "GREEN",
                        "HEALTHY",
                        "NORMAL",
                        "ACTIVE",
                    ].includes(
                        normalizedStatus
                    );
                }

                if (
                    statusFilter ===
                    "WARNING"
                ) {
                    matchesStatus = [
                        "AMBER",
                        "WARNING",
                        "MEDIUM",
                        "AT_RISK",
                    ].includes(
                        normalizedStatus
                    );
                }

                if (
                    statusFilter ===
                    "CRITICAL"
                ) {
                    matchesStatus = [
                        "RED",
                        "CRITICAL",
                        "HIGH",
                        "BREACHED",
                    ].includes(
                        normalizedStatus
                    );
                }
            }

            const matchesCategory =
                categoryFilter ===
                    "ALL" ||
                kri.riskCategory ===
                    categoryFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCategory
            );
        });
    }, [
        kris,
        search,
        statusFilter,
        categoryFilter,
    ]);

    // ========================================================
    // STATISTICS
    // ========================================================

    const statistics = useMemo(() => {
        let healthy = 0;
        let warning = 0;
        let critical = 0;

        kris.forEach((kri) => {
            const status =
                normalizeStatus(
                    kri.status
                );

            if (
                [
                    "GREEN",
                    "HEALTHY",
                    "NORMAL",
                    "ACTIVE",
                ].includes(status)
            ) {
                healthy++;
            } else if (
                [
                    "AMBER",
                    "WARNING",
                    "MEDIUM",
                    "AT_RISK",
                ].includes(status)
            ) {
                warning++;
            } else if (
                [
                    "RED",
                    "CRITICAL",
                    "HIGH",
                    "BREACHED",
                ].includes(status)
            ) {
                critical++;
            }
        });

        return {
            total: kris.length,
            healthy,
            warning,
            critical,
        };
    }, [kris]);

    // ========================================================
    // STATUS CHART
    // ========================================================

    const statusChartData = [
        {
            name: "Healthy",
            value: statistics.healthy,
        },
        {
            name: "Warning",
            value: statistics.warning,
        },
        {
            name: "Critical",
            value: statistics.critical,
        },
    ];

    // ========================================================
    // CATEGORY CHART
    // ========================================================

    const categoryChartData =
        useMemo(() => {
            const map = {};

            kris.forEach((kri) => {
                const category =
                    kri.riskCategory ||
                    "Unknown";

                map[category] =
                    (map[category] || 0) +
                    1;
            });

            return Object.entries(
                map
            ).map(
                ([name, value]) => ({
                    name,
                    value,
                })
            );
        }, [kris]);

    // ========================================================
    // DEPARTMENT CHART
    // ========================================================

    const departmentChartData =
        useMemo(() => {
            const map = {};

            kris.forEach((kri) => {
                const department =
                    getDepartmentName(
                        kri
                    ) || "Unknown";

                map[department] =
                    (map[department] || 0) +
                    1;
            });

            return Object.entries(
                map
            ).map(
                ([name, value]) => ({
                    name,
                    value,
                })
            );
        }, [kris]);

    // ========================================================
    // THRESHOLD CHART
    // ========================================================

    const thresholdData =
        useMemo(() => {
            return kris
                .filter(
                    (kri) =>
                        kri.currentValue !==
                            null &&
                        kri.currentValue !==
                            undefined
                )
                .slice(0, 10)
                .map((kri) => ({
                    name:
                        kri.kriId ||
                        kri.kriName ||
                        "KRI",

                    current:
                        Number(
                            kri.currentValue
                        ) || 0,

                    green:
                        Number(
                            kri.greenThreshold
                        ) || 0,

                    amber:
                        Number(
                            kri.amberThreshold
                        ) || 0,

                    red:
                        Number(
                            kri.redThreshold
                        ) || 0,
                }));
        }, [kris]);

    // ========================================================
    // CLEAR FILTERS
    // ========================================================

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("ALL");
        setCategoryFilter("ALL");
    };

    // ========================================================
    // PROFILE LOADING
    // ========================================================

    if (
        profileLoading ||
        loading
    ) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 md:p-8">
                <div className="max-w-[1600px] mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 w-64 bg-slate-200 rounded-lg" />

                        <div className="h-4 w-96 bg-slate-200 rounded mt-3" />

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
                            {[1, 2, 3, 4].map(
                                (item) => (
                                    <div
                                        key={
                                            item
                                        }
                                        className="h-36 bg-white border border-slate-200 rounded-2xl"
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================
    // DEPARTMENT ERROR
    // ========================================================

    if (
        departmentError ||
        (!managerDepartment.id &&
            !managerDepartment.name)
    ) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 md:p-8">
                <div className="max-w-[1600px] mx-auto">
                    <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm">
                        <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                            <AlertTriangle className="w-7 h-7 text-red-500" />
                        </div>

                        <h2 className="mt-4 text-xl font-bold text-slate-900">
                            Department Information Unavailable
                        </h2>

                        <p className="mt-2 text-sm text-slate-500">
                            {departmentError ||
                                "Your department could not be determined."}
                        </p>

                        <button
                            onClick={
                                handleRefresh
                            }
                            disabled={
                                refreshing
                            }
                            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-60"
                        >
                            <RefreshCw
                                className={`w-4 h-4 ${
                                    refreshing
                                        ? "animate-spin"
                                        : ""
                                }`}
                            />

                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-5 md:p-8">
            <div className="max-w-[1600px] mx-auto">

                {/* HEADER */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: -20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5"
                >
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                                <Gauge className="w-5 h-5 text-white" />
                            </div>

                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                                    Key Risk Indicators
                                </h1>

                                <p className="text-sm text-slate-500 mt-1">
                                    Monitor KRIs for your assigned department
                                </p>
                            </div>
                        </div>

                        {/* MANAGER DEPARTMENT */}

                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 shadow-sm">
                            <Building2 className="w-4 h-4 text-slate-600" />

                            <span className="text-xs text-slate-400">
                                Department:
                            </span>

                            <span className="text-sm font-bold text-slate-800">
                                {managerDepartment.name ||
                                    `Department ${managerDepartment.id}`}
                            </span>

                            {managerDepartment.id !==
                                null && (
                                <span className="text-xs text-slate-400">
                                    (ID:{" "}
                                    {
                                        managerDepartment.id
                                    })
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={
                            handleRefresh
                        }
                        disabled={
                            refreshing
                        }
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition disabled:opacity-60"
                    >
                        <RefreshCw
                            className={`w-4 h-4 ${
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }`}
                        />

                        Refresh
                    </button>
                </motion.div>

                {/* STAT CARDS */}

                <motion.div
                    variants={
                        containerVariants
                    }
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-8"
                >
                    <StatCard
                        title="Total KRIs"
                        value={
                            statistics.total
                        }
                        subtitle={`Indicators in ${
                            managerDepartment.name ||
                            "your department"
                        }`}
                        icon={Activity}
                    />

                    <StatCard
                        title="Healthy"
                        value={
                            statistics.healthy
                        }
                        subtitle="Within safe threshold"
                        icon={
                            CheckCircle2
                        }
                    />

                    <StatCard
                        title="Warning"
                        value={
                            statistics.warning
                        }
                        subtitle="Requires monitoring"
                        icon={
                            AlertTriangle
                        }
                    />

                    <StatCard
                        title="Critical"
                        value={
                            statistics.critical
                        }
                        subtitle="Threshold breached"
                        icon={
                            ShieldAlert
                        }
                    />
                </motion.div>

                {/* CHARTS */}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-6">

                    {/* STATUS PIE */}

                    <motion.div
                        variants={
                            itemVariants
                        }
                        initial="hidden"
                        animate="show"
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-bold text-slate-900">
                                    KRI Status
                                </h2>

                                <p className="text-xs text-slate-400 mt-1">
                                    Overall indicator health
                                </p>
                            </div>

                            <Activity className="w-5 h-5 text-slate-400" />
                        </div>

                        <div className="h-[280px]">
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
                                        cy="50%"
                                        innerRadius={
                                            65
                                        }
                                        outerRadius={
                                            100
                                        }
                                        paddingAngle={
                                            4
                                        }
                                        animationDuration={
                                            900
                                        }
                                    >
                                        <Cell />
                                        <Cell />
                                        <Cell />
                                    </Pie>

                                    <Tooltip />

                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* CATEGORY BAR */}

                    <motion.div
                        variants={
                            itemVariants
                        }
                        initial="hidden"
                        animate="show"
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Risk Categories
                                </h2>

                                <p className="text-xs text-slate-400 mt-1">
                                    KRI distribution by category
                                </p>
                            </div>

                            <Layers3 className="w-5 h-5 text-slate-400" />
                        </div>

                        <div className="h-[280px]">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <BarChart
                                    data={
                                        categoryChartData
                                    }
                                    layout="vertical"
                                    margin={{
                                        left: 20,
                                        right: 10,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        horizontal={
                                            false
                                        }
                                    />

                                    <XAxis
                                        type="number"
                                        allowDecimals={
                                            false
                                        }
                                    />

                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                        tick={{
                                            fontSize: 11,
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
                                        animationDuration={
                                            900
                                        }
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* DEPARTMENT */}

                    <motion.div
                        variants={
                            itemVariants
                        }
                        initial="hidden"
                        animate="show"
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="font-bold text-slate-900">
                                    Department Coverage
                                </h2>

                                <p className="text-xs text-slate-400 mt-1">
                                    Your department only
                                </p>
                            </div>

                            <Building2 className="w-5 h-5 text-slate-400" />
                        </div>

                        <div className="h-[280px]">
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <BarChart
                                    data={
                                        departmentChartData
                                    }
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="name"
                                        tick={{
                                            fontSize: 10,
                                        }}
                                    />

                                    <YAxis
                                        allowDecimals={
                                            false
                                        }
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
                                        animationDuration={
                                            900
                                        }
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </div>

                {/* CURRENT VALUE VS THRESHOLD */}

                <motion.div
                    variants={
                        itemVariants
                    }
                    initial="hidden"
                    animate="show"
                    className="mt-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                        <div>
                            <h2 className="font-bold text-slate-900">
                                Current Value vs Thresholds
                            </h2>

                            <p className="text-xs text-slate-400 mt-1">
                                Latest KRI values for{" "}
                                {managerDepartment.name ||
                                    "your department"}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                                Current
                            </span>

                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                Green
                            </span>

                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                                Amber
                            </span>

                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                                Red
                            </span>
                        </div>
                    </div>

                    <div className="h-[350px]">
                        {thresholdData.length ===
                        0 ? (
                            <div className="h-full flex items-center justify-center text-sm text-slate-400">
                                No threshold data available
                            </div>
                        ) : (
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <BarChart
                                    data={
                                        thresholdData
                                    }
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

                                    <YAxis />

                                    <Tooltip />

                                    <Legend />

                                    <Bar
                                        dataKey="current"
                                        name="Current"
                                        radius={[
                                            5,
                                            5,
                                            0,
                                            0,
                                        ]}
                                        animationDuration={
                                            1000
                                        }
                                    />

                                    <Bar
                                        dataKey="green"
                                        name="Green Threshold"
                                        radius={[
                                            5,
                                            5,
                                            0,
                                            0,
                                        ]}
                                        animationDuration={
                                            1000
                                        }
                                    />

                                    <Bar
                                        dataKey="amber"
                                        name="Amber Threshold"
                                        radius={[
                                            5,
                                            5,
                                            0,
                                            0,
                                        ]}
                                        animationDuration={
                                            1000
                                        }
                                    />

                                    <Bar
                                        dataKey="red"
                                        name="Red Threshold"
                                        radius={[
                                            5,
                                            5,
                                            0,
                                            0,
                                        ]}
                                        animationDuration={
                                            1000
                                        }
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </motion.div>

                {/* FILTERS */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.25,
                    }}
                    className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-4"
                >
                    <div className="flex flex-col xl:flex-row gap-3">

                        {/* SEARCH */}

                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search KRI, risk, owner..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-slate-200"
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
                            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
                        >
                            <option value="ALL">
                                All Status
                            </option>

                            <option value="HEALTHY">
                                Healthy
                            </option>

                            <option value="WARNING">
                                Warning
                            </option>

                            <option value="CRITICAL">
                                Critical
                            </option>
                        </select>

                        {/* CATEGORY */}

                        <select
                            value={
                                categoryFilter
                            }
                            onChange={(e) =>
                                setCategoryFilter(
                                    e.target.value
                                )
                            }
                            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none"
                        >
                            <option value="ALL">
                                All Categories
                            </option>

                            {categories.map(
                                (category) => (
                                    <option
                                        key={
                                            category
                                        }
                                        value={
                                            category
                                        }
                                    >
                                        {category}
                                    </option>
                                )
                            )}
                        </select>

                        {/* CLEAR */}

                        <button
                            onClick={
                                clearFilters
                            }
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition"
                        >
                            <Filter className="w-4 h-4" />

                            Clear
                        </button>
                    </div>
                </motion.div>

                {/* TABLE */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 25,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.3,
                    }}
                    className="mt-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                >
                    <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-slate-900">
                                KRI Register
                            </h2>

                            <p className="text-xs text-slate-400 mt-1">
                                Showing{" "}
                                {
                                    filteredKris.length
                                }{" "}
                                of{" "}
                                {
                                    kris.length
                                }{" "}
                                indicators
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Building2 className="w-4 h-4" />

                            {
                                managerDepartment.name
                            }
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1100px]">

                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">

                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        KRI
                                    </th>

                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        Risk
                                    </th>

                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        Current
                                    </th>

                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        Thresholds
                                    </th>

                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        Owner
                                    </th>

                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        Department
                                    </th>

                                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        Status
                                    </th>

                                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase">
                                        Action
                                    </th>

                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {filteredKris.length ===
                                0 ? (
                                    <tr>
                                        <td
                                            colSpan="8"
                                            className="px-5 py-16 text-center"
                                        >
                                            <div className="flex flex-col items-center">
                                                <Search className="w-10 h-10 text-slate-300" />

                                                <p className="mt-3 font-semibold text-slate-700">
                                                    No KRIs found
                                                </p>

                                                <p className="text-sm text-slate-400 mt-1">
                                                    No KRIs are available for{" "}
                                                    {
                                                        managerDepartment.name
                                                    }
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredKris.map(
                                        (
                                            kri,
                                            index
                                        ) => (
                                            <motion.tr
                                                key={
                                                    kri.kriId ||
                                                    kri.id ||
                                                    index
                                                }
                                                initial={{
                                                    opacity: 0,
                                                    y: 8,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                }}
                                                transition={{
                                                    delay:
                                                        index *
                                                        0.03,
                                                }}
                                                className="hover:bg-slate-50 transition"
                                            >

                                                {/* KRI */}

                                                <td className="px-5 py-4">
                                                    <div>
                                                        <p className="font-semibold text-slate-900 text-sm">
                                                            {kri.kriName ||
                                                                "Unnamed KRI"}
                                                        </p>

                                                        <p className="text-xs text-slate-400 mt-1">
                                                            {kri.kriId ||
                                                                "-"}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* RISK */}

                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-slate-800 text-sm">
                                                        {kri.riskCode ||
                                                            "-"}
                                                    </p>

                                                    <p className="text-xs text-slate-400 mt-1 max-w-[180px] truncate">
                                                        {kri.riskTitle ||
                                                            "-"}
                                                    </p>
                                                </td>

                                                {/* CURRENT */}

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg font-bold text-slate-900">
                                                            {kri.currentValue ??
                                                                "-"}
                                                        </span>

                                                        {kri.unit && (
                                                            <span className="text-xs text-slate-400">
                                                                {
                                                                    kri.unit
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* THRESHOLDS */}

                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700">
                                                            G:{" "}
                                                            {kri.greenThreshold ??
                                                                "-"}
                                                        </span>

                                                        <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-700">
                                                            A:{" "}
                                                            {kri.amberThreshold ??
                                                                "-"}
                                                        </span>

                                                        <span className="px-2 py-1 rounded-md bg-red-50 text-red-700">
                                                            R:{" "}
                                                            {kri.redThreshold ??
                                                                "-"}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* OWNER */}

                                                <td className="px-5 py-4">
                                                    <p className="text-sm font-medium text-slate-800">
                                                        {kri.ownerName ||
                                                            "-"}
                                                    </p>

                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {kri.ownerEmployeeId ||
                                                            ""}
                                                    </p>
                                                </td>

                                                {/* DEPARTMENT */}

                                                <td className="px-5 py-4">
                                                    <div>
                                                        <span className="text-sm font-medium text-slate-700">
                                                            {getDepartmentName(
                                                                kri
                                                            ) ||
                                                                "-"}
                                                        </span>

                                                        {getDepartmentId(
                                                            kri
                                                        ) !==
                                                            null && (
                                                            <p className="text-xs text-slate-400 mt-1">
                                                                ID:{" "}
                                                                {getDepartmentId(
                                                                    kri
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* STATUS */}

                                                <td className="px-5 py-4">
                                                    <StatusBadge
                                                        status={
                                                            kri.status
                                                        }
                                                    />
                                                </td>

                                                {/* ACTION */}

                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        onClick={() =>
                                                            setSelectedKri(
                                                                kri
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />

                                                        View
                                                    </button>
                                                </td>
                                            </motion.tr>
                                        )
                                    )
                                )}

                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* DETAILS MODAL */}

            {selectedKri && (
                <KriDetailsModal
                    kri={
                        selectedKri
                    }
                    onClose={() =>
                        setSelectedKri(
                            null
                        )
                    }
                />
            )}
        </div>
    );
};

export default AuditManagerKRI;