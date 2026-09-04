import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Search,
    RefreshCw,
    Eye,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    Clock3,
    X,
    Building2,
    User,
    CalendarDays,
    Activity,
} from "lucide-react";

import axios from "axios";
import RiskService from "../../service/RiskService";

const API_BASE_URL = "http://localhost:8080/api";

const AuditManagerRiskRegister = () => {
    // =========================================================
    // STATE
    // =========================================================

    const [risks, setRisks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [levelFilter, setLevelFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [departmentFilter, setDepartmentFilter] = useState("ALL");

    const [selectedRisk, setSelectedRisk] = useState(null);

    // =========================================================
    // GET TOKEN
    // =========================================================

    const getToken = useCallback(() => {
        const tokenKeys = [
            "token",
            "jwt",
            "accessToken",
            "jwtToken",
            "authToken",
        ];

        for (const key of tokenKeys) {
            const token = localStorage.getItem(key);

            if (token) {
                return token.replace(/^Bearer\s+/i, "").trim();
            }
        }

        return null;
    }, []);

    // =========================================================
    // NORMALIZE TEXT
    // =========================================================

    const normalizeText = useCallback((value) => {
        if (value === null || value === undefined) {
            return "";
        }

        if (typeof value === "object") {
            return String(
                value.name ??
                    value.departmentName ??
                    value.code ??
                    value.departmentCode ??
                    value.value ??
                    ""
            )
                .trim()
                .toUpperCase()
                .replace(/\s+/g, "_");
        }

        return String(value)
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "_");
    }, []);

    // =========================================================
    // GET CURRENT USER FROM LOCAL STORAGE
    // =========================================================

    const getCurrentUser = useCallback(() => {
        const storageKeys = [
            "user",
            "currentUser",
            "profile",
            "authUser",
            "loggedInUser",
        ];

        for (const key of storageKeys) {
            try {
                const value = localStorage.getItem(key);

                if (!value) {
                    continue;
                }

                const parsed = JSON.parse(value);

                if (parsed) {
                    console.log(
                        `Current user found from localStorage.${key}:`,
                        parsed
                    );

                    return parsed;
                }
            } catch (err) {
                console.warn(
                    `Unable to parse localStorage.${key}`,
                    err
                );
            }
        }

        return null;
    }, []);

    // =========================================================
    // EXTRACT DEPARTMENT FROM ANY OBJECT
    // =========================================================

    const extractDepartment = useCallback(
        (source) => {
            if (!source) {
                return null;
            }

            const possibleDepartments = [
                source?.department,
                source?.dept,
                source?.departmentName,
                source?.departmentCode,

                source?.profile?.department,
                source?.profile?.dept,
                source?.profile?.departmentName,
                source?.profile?.departmentCode,

                source?.user?.department,
                source?.user?.dept,
                source?.user?.profile?.department,
                source?.user?.profile?.dept,

                source?.data?.department,
                source?.data?.dept,
                source?.data?.departmentName,
                source?.data?.departmentCode,

                source?.data?.profile?.department,
                source?.data?.profile?.dept,

                source?.data?.user?.department,
                source?.data?.user?.dept,
            ];

            for (const department of possibleDepartments) {
                if (
                    department !== null &&
                    department !== undefined &&
                    department !== ""
                ) {
                    return department;
                }
            }

            return null;
        },
        []
    );

    // =========================================================
    // GET DEPARTMENT FROM LOCAL STORAGE
    // =========================================================

    const getDepartmentFromLocalStorage = useCallback(() => {
        const user = getCurrentUser();

        if (!user) {
            return null;
        }

        const department = extractDepartment(user);

        console.log(
            "Department from localStorage:",
            department
        );

        return department;
    }, [getCurrentUser, extractDepartment]);

    // =========================================================
    // GET DEPARTMENT FROM BACKEND PROFILE
    // =========================================================

    const getDepartmentFromProfileAPI = useCallback(async () => {
        try {
            const token = getToken();

            if (!token) {
                console.warn(
                    "JWT token not found while loading profile."
                );

                return null;
            }

            const response = await axios.get(
                `${API_BASE_URL}/profile`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log(
                "PROFILE API RESPONSE:",
                response.data
            );

            const department = extractDepartment(
                response.data
            );

            console.log(
                "Department from Profile API:",
                department
            );

            return department;
        } catch (err) {
            console.error(
                "Failed to load manager profile:",
                err
            );

            if (err?.response) {
                console.error(
                    "Profile API status:",
                    err.response.status
                );

                console.error(
                    "Profile API data:",
                    err.response.data
                );
            }

            return null;
        }
    }, [getToken, extractDepartment]);

    // =========================================================
    // GET MANAGER DEPARTMENT
    // =========================================================

    const getManagerDepartment = useCallback(async () => {
        // -----------------------------------------------------
        // FIRST: LOCAL STORAGE
        // -----------------------------------------------------

        const localDepartment =
            getDepartmentFromLocalStorage();

        if (localDepartment) {
            console.log(
                "Using department from localStorage:",
                localDepartment
            );

            return localDepartment;
        }

        // -----------------------------------------------------
        // SECOND: PROFILE API
        // -----------------------------------------------------

        console.log(
            "Department not found in localStorage."
        );

        console.log(
            "Trying Profile API..."
        );

        const apiDepartment =
            await getDepartmentFromProfileAPI();

        if (apiDepartment) {
            console.log(
                "Using department from Profile API:",
                apiDepartment
            );

            return apiDepartment;
        }

        return null;
    }, [
        getDepartmentFromLocalStorage,
        getDepartmentFromProfileAPI,
    ]);

    // =========================================================
    // NORMALIZE RISK RESPONSE
    // =========================================================

    const normalizeRiskResponse = useCallback((response) => {
        console.log(
            "AUDIT MANAGER - RAW RISKS RESPONSE:",
            response
        );

        let data = response;

        // Case 1:
        // RiskService returns AxiosResponse
        //
        // response.data = [...]
        //
        if (Array.isArray(response?.data)) {
            data = response.data;
        }

        // Case 2:
        // response.data = { content: [...] }
        //
        else if (
            Array.isArray(response?.data?.content)
        ) {
            data = response.data.content;
        }

        // Case 3:
        // response = { content: [...] }
        //
        else if (
            Array.isArray(response?.content)
        ) {
            data = response.content;
        }

        // Case 4:
        // response = { data: { data: [...] } }
        //
        else if (
            Array.isArray(response?.data?.data)
        ) {
            data = response.data.data;
        }

        // Case 5:
        // response = { data: { content: [...] } }
        //
        else if (
            Array.isArray(
                response?.data?.content
            )
        ) {
            data = response.data.content;
        }

        // Case 6:
        // Already array
        //
        else if (Array.isArray(response)) {
            data = response;
        }

        if (!Array.isArray(data)) {
            console.error(
                "Unexpected risk response format:",
                response
            );

            return [];
        }

        return data.filter(Boolean);
    }, []);

    // =========================================================
    // LOAD RISKS
    // AUDIT MANAGER -> ONLY OWN DEPARTMENT
    // =========================================================

    const loadRisks = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            // -------------------------------------------------
            // 1. GET ALL RISKS
            // -------------------------------------------------

            const response =
                await RiskService.getAllRisks();

            // -------------------------------------------------
            // 2. NORMALIZE RESPONSE
            // -------------------------------------------------

            const allRisks =
                normalizeRiskResponse(response);

            console.log(
                "TOTAL RISKS FROM BACKEND:",
                allRisks.length
            );

            console.log(
                "NORMALIZED RISKS:",
                allRisks
            );

            // -------------------------------------------------
            // 3. GET MANAGER DEPARTMENT
            // -------------------------------------------------

            const managerDepartment =
                await getManagerDepartment();

            console.log(
                "AUDIT MANAGER DEPARTMENT:",
                managerDepartment
            );

            // -------------------------------------------------
            // 4. DEPARTMENT NOT FOUND
            // -------------------------------------------------

            if (!managerDepartment) {
                setRisks([]);

                setError(
                    "Unable to determine your department. Please login again."
                );

                return;
            }

            // -------------------------------------------------
            // 5. NORMALIZE MANAGER DEPARTMENT
            // -------------------------------------------------

            const normalizedManagerDepartment =
                normalizeText(managerDepartment);

            console.log(
                "NORMALIZED MANAGER DEPARTMENT:",
                normalizedManagerDepartment
            );

            // -------------------------------------------------
            // 6. FILTER RISKS
            // -------------------------------------------------

            const departmentRisks =
                allRisks.filter((risk) => {
                    if (!risk) {
                        return false;
                    }

                    const riskDepartment =
                        risk?.department ??
                        risk?.dept ??
                        risk?.departmentName ??
                        risk?.departmentCode;

                    if (!riskDepartment) {
                        return false;
                    }

                    const normalizedRiskDepartment =
                        normalizeText(
                            riskDepartment
                        );

                    const matches =
                        normalizedRiskDepartment ===
                        normalizedManagerDepartment;

                    console.log(
                        "RISK DEPARTMENT CHECK:",
                        {
                            riskId:
                                risk?.riskId ??
                                risk?.id,
                            riskDepartment,
                            normalizedRiskDepartment,
                            managerDepartment,
                            normalizedManagerDepartment,
                            matches,
                        }
                    );

                    return matches;
                });

            // -------------------------------------------------
            // 7. SAVE FILTERED RISKS
            // -------------------------------------------------

            console.log(
                "TOTAL RISKS:",
                allRisks.length
            );

            console.log(
                "DEPARTMENT RISKS:",
                departmentRisks.length
            );

            setRisks(departmentRisks);
        } catch (err) {
            console.error(
                "Failed to load risks:",
                err
            );

            const backendMessage =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message;

            setError(
                backendMessage ||
                    "Unable to load risk register."
            );

            setRisks([]);
        } finally {
            setLoading(false);
        }
    }, [
        getManagerDepartment,
        normalizeRiskResponse,
        normalizeText,
    ]);

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        loadRisks();
    }, [loadRisks]);

    // =========================================================
    // FILTER OPTIONS
    // =========================================================

    const departments = useMemo(() => {
        const departmentValues = risks
            .map((risk) => {
                const department =
                    risk?.department ??
                    risk?.dept ??
                    risk?.departmentName ??
                    risk?.departmentCode;

                if (
                    department &&
                    typeof department === "object"
                ) {
                    return (
                        department?.name ??
                        department?.departmentName ??
                        department?.code ??
                        department?.departmentCode
                    );
                }

                return department;
            })
            .filter(Boolean)
            .map((value) => String(value).trim());

        return [...new Set(departmentValues)];
    }, [risks]);

    // =========================================================
    // FILTER RISKS
    // =========================================================

    const filteredRisks = useMemo(() => {
        const searchValue =
            search.toLowerCase().trim();

        return risks.filter((risk) => {
            if (!risk) {
                return false;
            }

            const riskId = String(
                risk?.riskId ??
                    risk?.id ??
                    ""
            ).toLowerCase();

            const title = String(
                risk?.title ?? ""
            ).toLowerCase();

            const businessUnit = String(
                risk?.businessUnit ?? ""
            ).toLowerCase();

            const processName = String(
                risk?.processName ?? ""
            ).toLowerCase();

            const identifiedByName = String(
                risk?.identifiedByName ?? ""
            ).toLowerCase();

            const riskDepartmentValue =
                risk?.department ??
                risk?.dept ??
                risk?.departmentName ??
                risk?.departmentCode ??
                "";

            const riskDepartment =
                typeof riskDepartmentValue ===
                "object"
                    ? String(
                          riskDepartmentValue?.name ??
                              riskDepartmentValue?.departmentName ??
                              riskDepartmentValue?.code ??
                              riskDepartmentValue?.departmentCode ??
                              ""
                      ).trim()
                    : String(
                          riskDepartmentValue
                      ).trim();

            // -------------------------------------------------
            // SEARCH
            // -------------------------------------------------

            const matchesSearch =
                !searchValue ||
                riskId.includes(searchValue) ||
                title.includes(searchValue) ||
                businessUnit.includes(searchValue) ||
                processName.includes(searchValue) ||
                identifiedByName.includes(searchValue);

            // -------------------------------------------------
            // LEVEL
            // -------------------------------------------------

            const riskLevel = String(
                risk?.level ??
                    risk?.riskLevel ??
                    ""
            )
                .trim()
                .toUpperCase();

            const matchesLevel =
                levelFilter === "ALL" ||
                riskLevel === levelFilter;

            // -------------------------------------------------
            // STATUS
            // -------------------------------------------------

            const riskStatus = String(
                risk?.status ?? ""
            )
                .trim()
                .toUpperCase();

            const matchesStatus =
                statusFilter === "ALL" ||
                riskStatus === statusFilter;

            // -------------------------------------------------
            // DEPARTMENT
            // -------------------------------------------------

            const matchesDepartment =
                departmentFilter === "ALL" ||
                riskDepartment ===
                    departmentFilter;

            return (
                matchesSearch &&
                matchesLevel &&
                matchesStatus &&
                matchesDepartment
            );
        });
    }, [
        risks,
        search,
        levelFilter,
        statusFilter,
        departmentFilter,
    ]);

    // =========================================================
    // STATS
    // =========================================================

    const totalRisks = risks.length;

    const criticalRisks = risks.filter(
        (risk) =>
            String(
                risk?.level ??
                    risk?.riskLevel ??
                    ""
            ).toUpperCase() === "CRITICAL"
    ).length;

    const highRisks = risks.filter(
        (risk) =>
            String(
                risk?.level ??
                    risk?.riskLevel ??
                    ""
            ).toUpperCase() === "HIGH"
    ).length;

    const openRisks = risks.filter((risk) => {
        const status = String(
            risk?.status ?? ""
        ).toUpperCase();

        return (
            status !== "CLOSED" &&
            status !== "RESOLVED"
        );
    }).length;

    const closedRisks = risks.filter((risk) => {
        const status = String(
            risk?.status ?? ""
        ).toUpperCase();

        return (
            status === "CLOSED" ||
            status === "RESOLVED"
        );
    }).length;

    // =========================================================
    // DATE FORMAT
    // =========================================================

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const parsed = new Date(date);

        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {
            return String(date);
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

    // =========================================================
    // GET RISK LEVEL
    // =========================================================

    const getRiskLevel = (risk) => {
        return String(
            risk?.level ??
                risk?.riskLevel ??
                ""
        )
            .trim()
            .toUpperCase();
    };

    // =========================================================
    // GET DEPARTMENT DISPLAY
    // =========================================================

    const getDepartmentDisplay = (risk) => {
        const department =
            risk?.department ??
            risk?.dept ??
            risk?.departmentName ??
            risk?.departmentCode;

        if (!department) {
            return "—";
        }

        if (typeof department === "object") {
            return (
                department?.name ??
                department?.departmentName ??
                department?.code ??
                department?.departmentCode ??
                "—"
            );
        }

        return String(department);
    };

    // =========================================================
    // LEVEL STYLE
    // =========================================================

    const getLevelStyle = (level) => {
        switch (
            String(level ?? "").toUpperCase()
        ) {
            case "CRITICAL":
                return "bg-red-100 text-red-700 border-red-200";

            case "HIGH":
                return "bg-orange-100 text-orange-700 border-orange-200";

            case "MEDIUM":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";

            case "LOW":
                return "bg-green-100 text-green-700 border-green-200";

            default:
                return "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    // =========================================================
    // STATUS STYLE
    // =========================================================

    const getStatusStyle = (status) => {
        switch (
            String(status ?? "").toUpperCase()
        ) {
            case "OPEN":
                return "bg-blue-100 text-blue-700 border-blue-200";

            case "IN_PROGRESS":
                return "bg-purple-100 text-purple-700 border-purple-200";

            case "MITIGATED":
                return "bg-teal-100 text-teal-700 border-teal-200";

            case "CLOSED":
            case "RESOLVED":
                return "bg-green-100 text-green-700 border-green-200";

            case "OVERDUE":
                return "bg-red-100 text-red-700 border-red-200";

            default:
                return "bg-slate-100 text-slate-600 border-slate-200";
        }
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8">
            <div className="max-w-[1600px] mx-auto">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center">
                                <ShieldAlert
                                    size={23}
                                    className="text-teal-700"
                                />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    Risk Register
                                </h1>

                                <p className="text-sm text-slate-500 mt-1">
                                    View and monitor risks registered in your department
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={loadRisks}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-60"
                    >
                        <RefreshCw
                            size={17}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        Refresh
                    </button>
                </div>

                {/* =================================================
                    STATS
                ================================================= */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <StatCard
                        icon={
                            <Activity size={20} />
                        }
                        title="Total Risks"
                        value={totalRisks}
                        iconClass="bg-teal-100 text-teal-700"
                    />

                    <StatCard
                        icon={
                            <AlertTriangle size={20} />
                        }
                        title="Critical"
                        value={criticalRisks}
                        iconClass="bg-red-100 text-red-700"
                    />

                    <StatCard
                        icon={
                            <ShieldAlert size={20} />
                        }
                        title="High"
                        value={highRisks}
                        iconClass="bg-orange-100 text-orange-700"
                    />

                    <StatCard
                        icon={
                            <Clock3 size={20} />
                        }
                        title="Open"
                        value={openRisks}
                        iconClass="bg-blue-100 text-blue-700"
                    />

                    <StatCard
                        icon={
                            <CheckCircle2 size={20} />
                        }
                        title="Closed"
                        value={closedRisks}
                        iconClass="bg-green-100 text-green-700"
                    />
                </div>

                {/* =================================================
                    FILTERS
                ================================================= */}

                <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">

                        {/* SEARCH */}

                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search risks..."
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-200 focus:border-teal-400"
                            />
                        </div>

                        {/* LEVEL */}

                        <select
                            value={levelFilter}
                            onChange={(e) =>
                                setLevelFilter(
                                    e.target.value
                                )
                            }
                            className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-teal-200"
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

                        {/* STATUS */}

                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                            className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-teal-200"
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

                            <option value="MITIGATED">
                                Mitigated
                            </option>

                            <option value="CLOSED">
                                Closed
                            </option>

                            <option value="RESOLVED">
                                Resolved
                            </option>

                            <option value="OVERDUE">
                                Overdue
                            </option>
                        </select>

                        {/* DEPARTMENT */}

                        <select
                            value={departmentFilter}
                            onChange={(e) =>
                                setDepartmentFilter(
                                    e.target.value
                                )
                            }
                            className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-teal-200"
                        >
                            <option value="ALL">
                                All Departments
                            </option>

                            {departments.map(
                                (department) => (
                                    <option
                                        key={
                                            department
                                        }
                                        value={
                                            department
                                        }
                                    >
                                        {
                                            department
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-5 flex items-start justify-between gap-4">
                        <div>
                            <p className="font-semibold">
                                Unable to load risk register
                            </p>

                            <p className="text-sm mt-1">
                                {error}
                            </p>
                        </div>

                        <button
                            onClick={() =>
                                setError("")
                            }
                            className="text-red-400 hover:text-red-700"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                    <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-slate-900">
                                Registered Risks
                            </h2>

                            <p className="text-xs text-slate-500 mt-1">
                                {filteredRisks.length} risk
                                {filteredRisks.length !==
                                1
                                    ? "s"
                                    : ""}{" "}
                                found
                            </p>
                        </div>
                    </div>

                    {/* LOADING */}

                    {loading ? (
                        <div className="py-20 text-center">
                            <RefreshCw
                                size={28}
                                className="animate-spin mx-auto text-teal-600 mb-3"
                            />

                            <p className="text-slate-500">
                                Loading risk register...
                            </p>
                        </div>
                    ) : filteredRisks.length ===
                      0 ? (
                        <div className="py-20 text-center">
                            <ShieldAlert
                                size={40}
                                className="mx-auto text-slate-300 mb-3"
                            />

                            <h3 className="font-semibold text-slate-700">
                                No risks found
                            </h3>

                            <p className="text-sm text-slate-400 mt-1">
                                No risks are registered for your department.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">

                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-5 py-4 text-left font-semibold text-slate-600">
                                            Risk
                                        </th>

                                        <th className="px-5 py-4 text-left font-semibold text-slate-600">
                                            Department
                                        </th>

                                        <th className="px-5 py-4 text-left font-semibold text-slate-600">
                                            Business Unit
                                        </th>

                                        <th className="px-5 py-4 text-left font-semibold text-slate-600">
                                            Process
                                        </th>

                                        <th className="px-5 py-4 text-left font-semibold text-slate-600">
                                            Risk Level
                                        </th>

                                        <th className="px-5 py-4 text-left font-semibold text-slate-600">
                                            Score
                                        </th>

                                        <th className="px-5 py-4 text-left font-semibold text-slate-600">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-center font-semibold text-slate-600">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">

                                    {filteredRisks.map(
                                        (risk, index) => {
                                            const level =
                                                getRiskLevel(
                                                    risk
                                                );

                                            const status =
                                                String(
                                                    risk?.status ??
                                                        ""
                                                )
                                                    .trim()
                                                    .toUpperCase();

                                            return (
                                                <tr
                                                    key={
                                                        risk?.id ??
                                                        risk?.riskId ??
                                                        index
                                                    }
                                                    className="hover:bg-slate-50 transition"
                                                >
                                                    {/* RISK */}

                                                    <td className="px-5 py-4">
                                                        <div>
                                                            <p className="font-semibold text-teal-700">
                                                                {risk?.riskId ??
                                                                    `RISK-${risk?.id ?? index + 1}`}
                                                            </p>

                                                            <p className="font-medium text-slate-800 mt-1">
                                                                {risk?.title ??
                                                                    "Untitled Risk"}
                                                            </p>

                                                            <p className="text-xs text-slate-400 mt-1 max-w-[250px] truncate">
                                                                {risk?.description ||
                                                                    "No description"}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    {/* DEPARTMENT */}

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Building2
                                                                size={
                                                                    15
                                                                }
                                                                className="text-slate-400"
                                                            />

                                                            <span className="text-slate-700">
                                                                {getDepartmentDisplay(
                                                                    risk
                                                                )}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* BUSINESS UNIT */}

                                                    <td className="px-5 py-4 text-slate-700">
                                                        {risk?.businessUnit ||
                                                            "—"}
                                                    </td>

                                                    {/* PROCESS */}

                                                    <td className="px-5 py-4 text-slate-700">
                                                        {risk?.processName ||
                                                            risk?.process ||
                                                            "—"}
                                                    </td>

                                                    {/* LEVEL */}

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${getLevelStyle(
                                                                level
                                                            )}`}
                                                        >
                                                            {level ||
                                                                "—"}
                                                        </span>
                                                    </td>

                                                    {/* SCORE */}

                                                    <td className="px-5 py-4">
                                                        <span className="font-bold text-slate-800">
                                                            {risk?.riskScore ??
                                                                risk?.score ??
                                                                "—"}
                                                        </span>
                                                    </td>

                                                    {/* STATUS */}

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusStyle(
                                                                status
                                                            )}`}
                                                        >
                                                            {status
                                                                ? status.replace(
                                                                      /_/g,
                                                                      " "
                                                                  )
                                                                : "—"}
                                                        </span>
                                                    </td>

                                                    {/* ACTION */}

                                                    <td className="px-5 py-4 text-center">
                                                        <button
                                                            onClick={() =>
                                                                setSelectedRisk(
                                                                    risk
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold text-xs transition"
                                                        >
                                                            <Eye
                                                                size={
                                                                    15
                                                                }
                                                            />

                                                            View
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

            {/* =====================================================
                RISK DETAILS MODAL
            ===================================================== */}

            {selectedRisk && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
                    onMouseDown={(e) => {
                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            setSelectedRisk(null);
                        }
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">

                        {/* HEADER */}

                        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-teal-600">
                                    {selectedRisk?.riskId ??
                                        `RISK-${selectedRisk?.id ?? ""}`}
                                </p>

                                <h2 className="text-xl font-bold text-slate-900 mt-1">
                                    {selectedRisk?.title ??
                                        "Untitled Risk"}
                                </h2>
                            </div>

                            <button
                                onClick={() =>
                                    setSelectedRisk(
                                        null
                                    )
                                }
                                className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">

                            {/* =================================================
                                RISK ASSESSMENT
                            ================================================= */}

                            <div>
                                <h3 className="font-bold text-slate-900 mb-3">
                                    Risk Assessment
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <InfoBox
                                        label="Category"
                                        value={
                                            selectedRisk?.category
                                        }
                                    />

                                    <InfoBox
                                        label="Likelihood"
                                        value={
                                            selectedRisk?.likelihood
                                        }
                                    />

                                    <InfoBox
                                        label="Impact"
                                        value={
                                            selectedRisk?.impact
                                        }
                                    />

                                    <InfoBox
                                        label="Risk Score"
                                        value={
                                            selectedRisk?.riskScore ??
                                            selectedRisk?.score
                                        }
                                    />
                                </div>
                            </div>

                            {/* =================================================
                                SCOPE
                            ================================================= */}

                            <div>
                                <h3 className="font-bold text-slate-900 mb-3">
                                    Risk Scope
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <InfoBox
                                        label="Department"
                                        value={getDepartmentDisplay(
                                            selectedRisk
                                        )}
                                    />

                                    <InfoBox
                                        label="Business Unit"
                                        value={
                                            selectedRisk?.businessUnit
                                        }
                                    />

                                    <InfoBox
                                        label="Process"
                                        value={
                                            selectedRisk?.processName ??
                                            selectedRisk?.process
                                        }
                                    />
                                </div>
                            </div>

                            {/* =================================================
                                DESCRIPTION
                            ================================================= */}

                            <div>
                                <h3 className="font-bold text-slate-900 mb-2">
                                    Description
                                </h3>

                                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-600 whitespace-pre-wrap">
                                    {selectedRisk?.description ||
                                        "No description provided."}
                                </div>
                            </div>

                            {/* =================================================
                                CONTROLS
                            ================================================= */}

                            <div>
                                <h3 className="font-bold text-slate-900 mb-3">
                                    Controls & Mitigation
                                </h3>

                                <div className="space-y-3">
                                    <InfoBox
                                        label="Control Owner"
                                        value={
                                            selectedRisk?.controlOwner
                                        }
                                    />

                                    <InfoBox
                                        label="Existing Controls"
                                        value={
                                            selectedRisk?.existingControls
                                        }
                                    />

                                    <InfoBox
                                        label="Mitigation Plan"
                                        value={
                                            selectedRisk?.mitigationPlan
                                        }
                                    />
                                </div>
                            </div>

                            {/* =================================================
                                OWNERSHIP
                            ================================================= */}

                            <div>
                                <h3 className="font-bold text-slate-900 mb-3">
                                    Ownership
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <InfoBox
                                        label="Identified By"
                                        value={
                                            selectedRisk?.identifiedByName ??
                                            selectedRisk?.identifiedBy?.name
                                        }
                                        icon={
                                            <User
                                                size={
                                                    15
                                                }
                                            />
                                        }
                                    />

                                    <InfoBox
                                        label="Assigned To"
                                        value={
                                            selectedRisk?.assignedToName ??
                                            selectedRisk?.assignedTo?.name
                                        }
                                        icon={
                                            <User
                                                size={
                                                    15
                                                }
                                            />
                                        }
                                    />
                                </div>
                            </div>

                            {/* =================================================
                                DATES
                            ================================================= */}

                            <div>
                                <h3 className="font-bold text-slate-900 mb-3">
                                    Closure Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <InfoBox
                                        label="Target Closure"
                                        value={formatDate(
                                            selectedRisk?.targetClosureDate
                                        )}
                                        icon={
                                            <CalendarDays
                                                size={
                                                    15
                                                }
                                            />
                                        }
                                    />

                                    <InfoBox
                                        label="Actual Closure"
                                        value={formatDate(
                                            selectedRisk?.actualClosureDate
                                        )}
                                        icon={
                                            <CalendarDays
                                                size={
                                                    15
                                                }
                                            />
                                        }
                                    />

                                    <InfoBox
                                        label="Status"
                                        value={
                                            selectedRisk?.status
                                        }
                                    />
                                </div>
                            </div>

                            {/* =================================================
                                REMARKS
                            ================================================= */}

                            {selectedRisk?.remarks && (
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-2">
                                        Remarks
                                    </h3>

                                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm text-slate-600 whitespace-pre-wrap">
                                        {
                                            selectedRisk.remarks
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// =============================================================
// STAT CARD
// =============================================================

const StatCard = ({
    icon,
    title,
    value,
    iconClass,
}) => {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClass}`}
                >
                    {icon}
                </div>

                <div>
                    <p className="text-xs text-slate-500 font-medium">
                        {title}
                    </p>

                    <p className="text-xl font-bold text-slate-900">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
};

// =============================================================
// INFO BOX
// =============================================================

const InfoBox = ({
    label,
    value,
    icon,
}) => {
    return (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                {icon}

                <span>{label}</span>
            </div>

            <p className="text-sm font-semibold text-slate-700 whitespace-pre-wrap break-words">
                {value !== null &&
                value !== undefined &&
                value !== ""
                    ? String(value)
                    : "—"}
            </p>
        </div>
    );
};

export default AuditManagerRiskRegister;