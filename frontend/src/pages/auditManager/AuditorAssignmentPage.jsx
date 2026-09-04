import React, {
    useEffect,
    useMemo,
    useState,
    useCallback,
} from "react";

import {
    getAllAssignments,
    createAssignment,
    updateAssignmentStatus,
    updateAssignmentPriority,
    deleteAssignment,
    getAllRisksForAssignment,
} from "../../service/RiskAuditorAssignments";

import {
    getUsersByRole,
    getProfile,
} from "../../service/AuthService";

import { getAllDepartments } from "../../service/departmentService";
import { getAllRoles } from "../../service/roleService";

/* =========================================================
   CONSTANTS
========================================================= */

const STATUSES = [
    "ASSIGNED",
    "IN_PROGRESS",
    "COMPLETED",
    "OVERDUE",
    "CANCELLED",
];

const PRIORITIES = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
];

const statusStyles = {
    ASSIGNED:
        "text-emerald-700 border-emerald-300 bg-emerald-50",
    IN_PROGRESS:
        "text-amber-700 border-amber-300 bg-amber-50",
    COMPLETED:
        "text-teal-700 border-teal-300 bg-teal-50",
    OVERDUE:
        "text-rose-700 border-rose-300 bg-rose-50",
    CANCELLED:
        "text-slate-500 border-slate-300 bg-slate-50",
};

const priorityStyles = {
    LOW:
        "text-emerald-700 border-emerald-300 bg-emerald-50",
    MEDIUM:
        "text-amber-700 border-amber-300 bg-amber-50",
    HIGH:
        "text-orange-700 border-orange-300 bg-orange-50",
    CRITICAL:
        "text-rose-700 border-rose-300 bg-rose-50",
};

const priorityEdge = {
    LOW: "before:bg-emerald-500",
    MEDIUM: "before:bg-amber-500",
    HIGH: "before:bg-orange-500",
    CRITICAL: "before:bg-rose-500",
};

const emptyForm = {
    riskId: "",
    employeeId: "",
    startDate: "",
    dueDate: "",
    priority: "MEDIUM",
    comments: "",
};

/* =========================================================
   DEPARTMENT / ROLE LOOKUP MAPS
========================================================= */

let departmentNameById = {};
let roleNameById = {};

function setDepartmentLookup(departments) {
    departmentNameById = {};

    (departments || []).forEach((d) => {
        if (
            d &&
            d.id !== undefined &&
            d.id !== null
        ) {
            departmentNameById[String(d.id)] =
                d.name ||
                d.departmentName ||
                "";
        }
    });
}

function setRoleLookup(roles) {
    roleNameById = {};

    (roles || []).forEach((r) => {
        if (
            r &&
            r.id !== undefined &&
            r.id !== null
        ) {
            roleNameById[String(r.id)] =
                r.name ||
                r.roleName ||
                r.code ||
                "";
        }
    });
}

/* =========================================================
   DEPARTMENT ID
========================================================= */

function getDepartmentId(item) {
    if (!item) {
        return null;
    }

    if (
        item.departmentId !== undefined &&
        item.departmentId !== null
    ) {
        return String(item.departmentId);
    }

    if (
        item.departmentID !== undefined &&
        item.departmentID !== null
    ) {
        return String(item.departmentID);
    }

    if (
        item.department &&
        typeof item.department === "object" &&
        item.department.id !== undefined &&
        item.department.id !== null
    ) {
        return String(
            item.department.id
        );
    }

    if (
        typeof item.department === "number" ||
        typeof item.department === "string"
    ) {
        return String(item.department);
    }

    return null;
}

/* =========================================================
   DEPARTMENT NAME
========================================================= */

function getDepartmentName(item) {
    if (!item) {
        return "";
    }

    if (
        item.departmentName !== undefined &&
        item.departmentName !== null
    ) {
        return formatDepartmentName(
            item.departmentName
        );
    }

    if (
        item.department &&
        typeof item.department === "object"
    ) {
        return formatDepartmentName(
            item.department.name ||
                item.department.departmentName ||
                item.department.title ||
                ""
        );
    }

    if (
        typeof item.department === "string"
    ) {
        return formatDepartmentName(
            item.department
        );
    }

    const deptId =
        getDepartmentId(item);

    if (
        deptId &&
        departmentNameById[deptId]
    ) {
        return formatDepartmentName(
            departmentNameById[deptId]
        );
    }

    return "";
}

/* =========================================================
   ROLE ID
========================================================= */

function getRoleId(item) {
    if (!item) {
        return null;
    }

    if (
        item.roleId !== undefined &&
        item.roleId !== null
    ) {
        return String(item.roleId);
    }

    if (
        item.roleID !== undefined &&
        item.roleID !== null
    ) {
        return String(item.roleID);
    }

    if (
        item.role &&
        typeof item.role === "object" &&
        item.role.id !== undefined &&
        item.role.id !== null
    ) {
        return String(
            item.role.id
        );
    }

    if (
        typeof item.role === "number"
    ) {
        return String(item.role);
    }

    if (
        typeof item.role === "string" &&
        /^\d+$/.test(item.role)
    ) {
        return String(item.role);
    }

    return null;
}

/* =========================================================
   ROLE NAME
========================================================= */

function getRoleName(item) {
    if (!item) {
        return "";
    }

    if (
        item.roleName !== undefined &&
        item.roleName !== null
    ) {
        return normalizeRoleName(
            item.roleName
        );
    }

    if (
        item.role &&
        typeof item.role === "object"
    ) {
        return normalizeRoleName(
            item.role.name ||
                item.role.roleName ||
                item.role.code ||
                ""
        );
    }

    if (
        typeof item.role === "string"
    ) {
        return normalizeRoleName(
            item.role
        );
    }

    const roleId =
        getRoleId(item);

    if (
        roleId &&
        roleNameById[roleId]
    ) {
        return normalizeRoleName(
            roleNameById[roleId]
        );
    }

    return "";
}

/* =========================================================
   NORMALIZE ROLE
========================================================= */

function normalizeRoleName(value) {
    if (!value) {
        return "";
    }

    return String(value)
        .trim()
        .toUpperCase()
        .replaceAll("-", "_")
        .replaceAll(" ", "_");
}

/* =========================================================
   FORMAT DEPARTMENT
========================================================= */

function formatDepartmentName(value) {
    if (!value) {
        return "";
    }

    return String(value)
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );
}

/* =========================================================
   NORMALIZE DEPARTMENT FOR COMPARISON
========================================================= */

function normalizeDepartmentName(value) {
    if (!value) {
        return "";
    }

    return String(value)
        .trim()
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\s+/g, " ");
}

/* =========================================================
   SAME DEPARTMENT
========================================================= */

function sameDepartment(a, b) {
    if (!a || !b) {
        return false;
    }

    const aId =
        getDepartmentId(a);

    const bId =
        getDepartmentId(b);

    /* -----------------------------------------------------
       ID MATCH
    ----------------------------------------------------- */

    if (aId && bId) {
        return (
            String(aId) ===
            String(bId)
        );
    }

    /* -----------------------------------------------------
       NAME MATCH
    ----------------------------------------------------- */

    const aName =
        normalizeDepartmentName(
            getDepartmentName(a)
        );

    const bName =
        normalizeDepartmentName(
            getDepartmentName(b)
        );

    return Boolean(
        aName &&
        bName &&
        aName === bName
    );
}

/* =========================================================
   EXTRACT ARRAY
========================================================= */

function extractArray(raw) {
    if (Array.isArray(raw)) {
        return raw;
    }

    if (
        Array.isArray(
            raw?.content
        )
    ) {
        return raw.content;
    }

    if (
        Array.isArray(
            raw?.data
        )
    ) {
        return raw.data;
    }

    if (
        Array.isArray(
            raw?.data?.content
        )
    ) {
        return raw.data.content;
    }

    if (
        Array.isArray(
            raw?.data?.data
        )
    ) {
        return raw.data.data;
    }

    return [];
}

/* =========================================================
   EXTRACT RISKS
========================================================= */

function extractRiskArray(raw) {
    return extractArray(raw);
}

/* =========================================================
   EXTRACT USERS
========================================================= */

function extractUserArray(raw) {
    return extractArray(raw);
}

/* =========================================================
   COUNT UP
========================================================= */

function CountUp({ value }) {
    const [display, setDisplay] =
        useState(0);

    useEffect(() => {
        const reduce =
            window.matchMedia?.(
                "(prefers-reduced-motion: reduce)"
            ).matches;

        if (reduce) {
            setDisplay(value);
            return;
        }

        let raf;

        const duration = 700;

        const start =
            performance.now();

        const tick = (now) => {
            const progress =
                Math.min(
                    (now - start) /
                        duration,
                    1
                );

            const eased =
                1 -
                Math.pow(
                    1 - progress,
                    3
                );

            setDisplay(
                Math.round(
                    value * eased
                )
            );

            if (
                progress < 1
            ) {
                raf =
                    requestAnimationFrame(
                        tick
                    );
            }
        };

        raf =
            requestAnimationFrame(
                tick
            );

        return () =>
            cancelAnimationFrame(
                raf
            );
    }, [value]);

    return <>{display}</>;
}

/* =========================================================
   TOAST
========================================================= */

function Toast({
    toast,
    onClose,
}) {
    useEffect(() => {
        if (!toast) {
            return;
        }

        const t =
            setTimeout(
                onClose,
                3500
            );

        return () =>
            clearTimeout(t);
    }, [
        toast,
        onClose,
    ]);

    if (!toast) {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-6 right-6 z-[100] rounded-xl px-5 py-3.5 text-sm text-white shadow-2xl shadow-black/20 animate-[aaToastIn_0.2s_ease_both] ${
                toast.type ===
                "error"
                    ? "bg-rose-600"
                    : "bg-emerald-700"
            }`}
        >
            {toast.message}
        </div>
    );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function AuditorAssignmentPage() {
    const [
        assignments,
        setAssignments,
    ] = useState([]);

    const [risks, setRisks] =
        useState([]);

    const [auditors, setAuditors] =
        useState([]);

    const [
        currentUser,
        setCurrentUser,
    ] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [
        riskLoadWarning,
        setRiskLoadWarning,
    ] = useState("");

    const [toast, setToast] =
        useState(null);

    const [search, setSearch] =
        useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("");

    const [
        priorityFilter,
        setPriorityFilter,
    ] = useState("");

    const [sortBy, setSortBy] =
        useState("startDate");

    const [sortDir, setSortDir] =
        useState("asc");

    const [page, setPage] =
        useState(1);

    const [
        pageSize,
        setPageSize,
    ] = useState(9);

    const [
        modalOpen,
        setModalOpen,
    ] = useState(false);

    const [
        modalVisible,
        setModalVisible,
    ] = useState(false);

    const [form, setForm] =
        useState(emptyForm);

    const [
        formErrors,
        setFormErrors,
    ] = useState({});

    const [saving, setSaving] =
        useState(false);

    const [
        viewItem,
        setViewItem,
    ] = useState(null);

    const [
        deleteItem,
        setDeleteItem,
    ] = useState(null);

    const [
        deleting,
        setDeleting,
    ] = useState(false);

    /* =====================================================
       TOAST
    ===================================================== */

    const showToast = (
        message,
        type = "success"
    ) => {
        setToast({
            message,
            type,
        });
    };

    /* =====================================================
       LOAD ALL DATA

       IMPORTANT:
       Everything is scoped using the logged-in
       Audit Manager's department.
    ===================================================== */

    const loadAll =
        useCallback(
            async () => {
                try {
                    setLoading(
                        true
                    );

                    setError(
                        ""
                    );

                    setRiskLoadWarning(
                        ""
                    );

                    /* =====================================
                       DEPARTMENT + ROLE LOOKUPS
                    ===================================== */

                    try {
                        const [
                            departmentsRes,
                            rolesRes,
                        ] =
                            await Promise.all(
                                [
                                    getAllDepartments(),
                                    getAllRoles(),
                                ]
                            );

                        setDepartmentLookup(
                            extractArray(
                                departmentsRes
                            )
                        );

                        setRoleLookup(
                            extractArray(
                                rolesRes
                            )
                        );
                    } catch (
                        lookupErr
                    ) {
                        console.error(
                            "[AuditorAssignmentPage] Department/Role lookup error:",
                            lookupErr
                        );
                    }

                    /* =====================================
                       CURRENT PROFILE
                    ===================================== */

                    const profileResponse =
                        await getProfile();

                    const profile =
                        profileResponse?.data ||
                        profileResponse?.profile ||
                        profileResponse?.user ||
                        profileResponse;

                    console.log(
                        "[AuditorAssignmentPage] PROFILE:",
                        profile
                    );

                    setCurrentUser(
                        profile
                    );

                    const managerDepartmentId =
                        getDepartmentId(
                            profile
                        );

                    const managerDepartmentName =
                        getDepartmentName(
                            profile
                        );

                    const currentRole =
                        getRoleName(
                            profile
                        );

                    console.log(
                        "[AuditorAssignmentPage] MANAGER ROLE:",
                        currentRole
                    );

                    console.log(
                        "[AuditorAssignmentPage] MANAGER DEPARTMENT:",
                        managerDepartmentName
                    );

                    console.log(
                        "[AuditorAssignmentPage] MANAGER DEPARTMENT ID:",
                        managerDepartmentId
                    );

                    /* =====================================
                       DEPARTMENT MUST EXIST
                    ===================================== */

                    if (
                        !managerDepartmentId &&
                        !managerDepartmentName
                    ) {
                        setAssignments(
                            []
                        );

                        setRisks(
                            []
                        );

                        setAuditors(
                            []
                        );

                        setError(
                            "Audit Manager department could not be determined. Please check the profile department."
                        );

                        return;
                    }

                    /* =====================================
                       ROLE CHECK
                    ===================================== */

                    if (
                        currentRole &&
                        currentRole !==
                            "AUDIT_MANAGER"
                    ) {
                        setError(
                            "This page is intended for Audit Managers."
                        );
                    }

                    /* =====================================
                       LOAD RISKS
                    ===================================== */

                    let allRisks =
                        [];

                    try {
                        const riskData =
                            await getAllRisksForAssignment();

                        console.log(
                            "[AuditorAssignmentPage] RAW RISKS:",
                            riskData
                        );

                        allRisks =
                            extractRiskArray(
                                riskData
                            );

                        console.log(
                            "[AuditorAssignmentPage] ALL RISKS:",
                            allRisks
                        );

                        /* =================================
                           ONLY MANAGER DEPARTMENT RISKS
                        ================================= */

                        const scopedRisks =
                            allRisks.filter(
                                (
                                    risk
                                ) =>
                                    sameDepartment(
                                        risk,
                                        profile
                                    )
                            );

                        console.log(
                            "[AuditorAssignmentPage] SCOPED RISKS:",
                            scopedRisks
                        );

                        setRisks(
                            scopedRisks
                        );

                        if (
                            scopedRisks.length ===
                            0
                        ) {
                            console.warn(
                                "[AuditorAssignmentPage] No risks found for department:",
                                managerDepartmentName,
                                managerDepartmentId
                            );
                        }
                    } catch (
                        riskErr
                    ) {
                        console.error(
                            "[AuditorAssignmentPage] Failed to load risks:",
                            riskErr
                        );

                        setRisks(
                            []
                        );

                        setRiskLoadWarning(
                            `Could not load risks (${
                                riskErr?.response
                                    ?.status ||
                                "network error"
                            }).`
                        );
                    }

                    /* =====================================
                       LOAD INTERNAL AUDITORS
                    ===================================== */

                    let allAuditors =
                        [];

                    try {
                        const auditorRes =
                            await getUsersByRole(
                                "INTERNAL_AUDITOR"
                            );

                        console.log(
                            "[AuditorAssignmentPage] ALL INTERNAL AUDITORS RAW:",
                            auditorRes
                        );

                        allAuditors =
                            extractUserArray(
                                auditorRes
                            );

                        console.log(
                            "[AuditorAssignmentPage] ALL INTERNAL AUDITORS:",
                            allAuditors
                        );
                    } catch (
                        auditorErr
                    ) {
                        console.error(
                            "[AuditorAssignmentPage] Failed to load auditors:",
                            auditorErr
                        );

                        allAuditors =
                            [];
                    }

                    /* =====================================
                       ONLY SAME-DEPARTMENT AUDITORS
                    ===================================== */

                    const scopedAuditors =
                        allAuditors.filter(
                            (
                                auditor
                            ) =>
                                sameDepartment(
                                    auditor,
                                    profile
                                )
                        );

                    console.log(
                        "[AuditorAssignmentPage] SCOPED INTERNAL AUDITORS:",
                        scopedAuditors
                    );

                    setAuditors(
                        scopedAuditors
                    );

                    /* =====================================
                       LOAD ASSIGNMENTS
                    ===================================== */

                    try {
                        const assignmentData =
                            await getAllAssignments();

                        console.log(
                            "[AuditorAssignmentPage] RAW ASSIGNMENTS:",
                            assignmentData
                        );

                        const allAssignments =
                            extractUserArray(
                                assignmentData
                            );

                        console.log(
                            "[AuditorAssignmentPage] ALL ASSIGNMENTS:",
                            allAssignments
                        );

                        /* =================================
                           RISK LOOKUP MAP

                           riskId -> risk
                        ================================= */

                        const riskMap =
                            new Map();

                        allRisks.forEach(
                            (
                                risk
                            ) => {
                                if (
                                    risk?.riskId !==
                                        undefined &&
                                    risk?.riskId !==
                                        null
                                ) {
                                    riskMap.set(
                                        String(
                                            risk.riskId
                                        ),
                                        risk
                                    );
                                }

                                if (
                                    risk?.id !==
                                        undefined &&
                                    risk?.id !==
                                        null
                                ) {
                                    riskMap.set(
                                        String(
                                            risk.id
                                        ),
                                        risk
                                    );
                                }
                            }
                        );

                        /* =================================
                           FILTER ASSIGNMENTS
                        ================================= */

                        const scopedAssignments =
                            allAssignments.filter(
                                (
                                    assignment
                                ) => {

                                    /* -------------------------
                                       DIRECT DEPARTMENT
                                    ------------------------- */

                                    if (
                                        getDepartmentId(
                                            assignment
                                        ) ||
                                        getDepartmentName(
                                            assignment
                                        )
                                    ) {
                                        return sameDepartment(
                                            assignment,
                                            profile
                                        );
                                    }

                                    /* -------------------------
                                       NESTED RISK
                                    ------------------------- */

                                    if (
                                        assignment.risk
                                    ) {
                                        return sameDepartment(
                                            assignment.risk,
                                            profile
                                        );
                                    }

                                    /* -------------------------
                                       RISK LOOKUP
                                    ------------------------- */

                                    const relatedRisk =
                                        riskMap.get(
                                            String(
                                                assignment.riskId
                                            )
                                        );

                                    if (
                                        relatedRisk
                                    ) {
                                        return sameDepartment(
                                            relatedRisk,
                                            profile
                                        );
                                    }

                                    /* -------------------------
                                       AUDITOR FALLBACK
                                    ------------------------- */

                                    const auditor =
                                        scopedAuditors.find(
                                            (
                                                u
                                            ) =>
                                                String(
                                                    u.employeeId
                                                ) ===
                                                String(
                                                    assignment.employeeId
                                                )
                                        );

                                    if (
                                        auditor
                                    ) {
                                        return sameDepartment(
                                            auditor,
                                            profile
                                        );
                                    }

                                    /*
                                     * IMPORTANT:
                                     * Department cannot be verified,
                                     * therefore don't display it.
                                     */

                                    return false;
                                }
                            );

                        console.log(
                            "[AuditorAssignmentPage] SCOPED ASSIGNMENTS:",
                            scopedAssignments
                        );

                        setAssignments(
                            scopedAssignments
                        );
                    } catch (
                        assignmentErr
                    ) {
                        console.error(
                            "[AuditorAssignmentPage] Assignment load error:",
                            assignmentErr
                        );

                        setAssignments(
                            []
                        );

                        setError(
                            assignmentErr?.response
                                ?.data
                                ?.message ||
                                "Failed to load auditor assignments."
                        );
                    }
                } catch (
                    err
                ) {
                    console.error(
                        "[AuditorAssignmentPage] LOAD ERROR:",
                        err
                    );

                    setError(
                        err?.response
                            ?.data
                            ?.message ||
                            "Failed to load Audit Manager data."
                    );
                } finally {
                    setLoading(
                        false
                    );
                }
            },
            []
        );

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    /* =====================================================
       SELECTED RISK
    ===================================================== */

    const selectedRisk =
        useMemo(() => {
            return (
                risks.find(
                    (r) =>
                        String(
                            r.riskId
                        ) ===
                        String(
                            form.riskId
                        )
                ) ||
                null
            );
        }, [
            risks,
            form.riskId,
        ]);

    /* =====================================================
       ELIGIBLE AUDITORS

       Since auditors are already manager-department scoped,
       selected risk must also be same department.
    ===================================================== */

    const eligibleAuditors =
        useMemo(() => {
            if (
                !selectedRisk
            ) {
                return [];
            }

            return auditors.filter(
                (
                    auditor
                ) =>
                    sameDepartment(
                        auditor,
                        selectedRisk
                    )
            );
        }, [
            auditors,
            selectedRisk,
        ]);

    /* =====================================================
       AUDITOR MAP
    ===================================================== */

    const auditorMap =
        useMemo(() => {
            const map =
                new Map();

            auditors.forEach(
                (
                    auditor
                ) => {
                    if (
                        auditor?.employeeId !==
                            undefined &&
                        auditor?.employeeId !==
                            null
                    ) {
                        map.set(
                            String(
                                auditor.employeeId
                            ),
                            auditor
                        );
                    }
                }
            );

            return map;
        }, [auditors]);

    /* =====================================================
       FILTER ASSIGNMENTS
    ===================================================== */

    const filtered =
        useMemo(() => {
            let list = [
                ...assignments,
            ];

            if (
                statusFilter
            ) {
                list =
                    list.filter(
                        (a) =>
                            a.status ===
                            statusFilter
                    );
            }

            if (
                priorityFilter
            ) {
                list =
                    list.filter(
                        (a) =>
                            a.priority ===
                            priorityFilter
                    );
            }

            if (search) {
                const q =
                    search
                        .toLowerCase()
                        .trim();

                list =
                    list.filter(
                        (a) =>
                            String(
                                a.riskTitle ||
                                    ""
                            )
                                .toLowerCase()
                                .includes(
                                    q
                                ) ||
                            String(
                                a.riskId ||
                                    ""
                            )
                                .toLowerCase()
                                .includes(
                                    q
                                ) ||
                            String(
                                a.employeeId ||
                                    ""
                            )
                                .toLowerCase()
                                .includes(
                                    q
                                ) ||
                            String(
                                a.auditorEmail ||
                                    ""
                            )
                                .toLowerCase()
                                .includes(
                                    q
                                )
                    );
            }

            list.sort(
                (a, b) => {
                    let av =
                        a[
                            sortBy
                        ];

                    let bv =
                        b[
                            sortBy
                        ];

                    if (
                        sortBy ===
                        "priority"
                    ) {
                        const order =
                            {
                                LOW: 0,
                                MEDIUM: 1,
                                HIGH: 2,
                                CRITICAL: 3,
                            };

                        av =
                            order[
                                a.priority
                            ] ??
                            0;

                        bv =
                            order[
                                b.priority
                            ] ??
                            0;
                    }

                    if (
                        sortBy ===
                            "startDate" ||
                        sortBy ===
                            "dueDate"
                    ) {
                        av =
                            av ||
                            "";

                        bv =
                            bv ||
                            "";
                    }

                    if (
                        av ===
                        bv
                    ) {
                        return 0;
                    }

                    const cmp =
                        av >
                        bv
                            ? 1
                            : -1;

                    return sortDir ===
                        "asc"
                        ? cmp
                        : -cmp;
                }
            );

            return list;
        }, [
            assignments,
            statusFilter,
            priorityFilter,
            search,
            sortBy,
            sortDir,
        ]);

    const total =
        filtered.length;

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total /
                    pageSize
            )
        );

    const paged =
        filtered.slice(
            (page - 1) *
                pageSize,
            page *
                pageSize
        );

    useEffect(() => {
        setPage(1);
    }, [
        search,
        statusFilter,
        priorityFilter,
        pageSize,
    ]);

    /* =====================================================
       SUMMARY
    ===================================================== */

    const summary =
        useMemo(() => {
            const active =
                assignments.filter(
                    (a) =>
                        a.status ===
                            "IN_PROGRESS" ||
                        a.status ===
                            "ASSIGNED"
                ).length;

            const pending =
                assignments.filter(
                    (a) =>
                        a.status ===
                        "ASSIGNED"
                ).length;

            const completed =
                assignments.filter(
                    (a) =>
                        a.status ===
                        "COMPLETED"
                ).length;

            return {
                total:
                    assignments.length,
                active,
                pending,
                completed,
            };
        }, [
            assignments,
        ]);

    /* =====================================================
       MODAL
    ===================================================== */

    const openCreateModal =
        () => {
            setForm({
                ...emptyForm,
            });

            setFormErrors(
                {}
            );

            setModalOpen(
                true
            );

            requestAnimationFrame(
                () =>
                    setModalVisible(
                        true
                    )
            );
        };

    const closeModal =
        () => {
            setModalVisible(
                false
            );

            setTimeout(
                () => {
                    setModalOpen(
                        false
                    );

                    setForm({
                        ...emptyForm,
                    });

                    setFormErrors(
                        {}
                    );
                },
                180
            );
        };

    /* =====================================================
       FORM CHANGE
    ===================================================== */

    const handleFormChange =
        (e) => {
            const {
                name,
                value,
            } = e.target;

            setForm(
                (prev) => {
                    const next = {
                        ...prev,
                        [name]:
                            value,
                    };

                    if (
                        name ===
                        "riskId"
                    ) {
                        next.employeeId =
                            "";
                    }

                    return next;
                }
            );

            setFormErrors(
                (prev) => ({
                    ...prev,
                    [name]:
                        undefined,
                })
            );
        };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm =
        () => {
            const errs = {};

            if (
                !form.riskId
            ) {
                errs.riskId =
                    "Select a risk.";
            }

            if (
                !form.employeeId
            ) {
                errs.employeeId =
                    "Select an internal auditor.";
            }

            if (
                !form.startDate
            ) {
                errs.startDate =
                    "Start date is required.";
            }

            if (
                !form.dueDate
            ) {
                errs.dueDate =
                    "Due date is required.";
            }

            if (
                form.startDate &&
                form.dueDate &&
                form.dueDate <
                    form.startDate
            ) {
                errs.dueDate =
                    "Due date cannot be before start date.";
            }

            /* =========================================
               EXTRA SECURITY CHECK
            ========================================= */

            if (
                selectedRisk &&
                currentUser &&
                !sameDepartment(
                    selectedRisk,
                    currentUser
                )
            ) {
                errs.riskId =
                    "You can only assign risks from your department.";
            }

            const selectedAuditor =
                auditors.find(
                    (
                        auditor
                    ) =>
                        String(
                            auditor.employeeId
                        ) ===
                        String(
                            form.employeeId
                        )
                );

            if (
                selectedAuditor &&
                currentUser &&
                !sameDepartment(
                    selectedAuditor,
                    currentUser
                )
            ) {
                errs.employeeId =
                    "You can only assign auditors from your department.";
            }

            setFormErrors(
                errs
            );

            return (
                Object.keys(
                    errs
                ).length === 0
            );
        };

    /* =====================================================
       CREATE
    ===================================================== */

    const handleCreate =
        async (e) => {
            e.preventDefault();

            if (
                !validateForm()
            ) {
                return;
            }

            try {
                setSaving(
                    true
                );

                await createAssignment(
                    {
                        riskId:
                            form.riskId,

                        employeeId:
                            form.employeeId,

                        startDate:
                            form.startDate,

                        dueDate:
                            form.dueDate,

                        priority:
                            form.priority,

                        comments:
                            form.comments,
                    }
                );

                showToast(
                    "Auditor assigned successfully."
                );

                closeModal();

                await loadAll();
            } catch (
                err
            ) {
                console.error(
                    "[AuditorAssignmentPage] CREATE ERROR:",
                    err
                );

                showToast(
                    err?.response
                        ?.data
                        ?.message ||
                        "Failed to create assignment.",
                    "error"
                );
            } finally {
                setSaving(
                    false
                );
            }
        };

    /* =====================================================
       STATUS
    ===================================================== */

    const handleStatusChange =
        async (
            id,
            status
        ) => {
            try {
                await updateAssignmentStatus(
                    id,
                    status
                );

                setAssignments(
                    (prev) =>
                        prev.map(
                            (a) =>
                                a.id ===
                                id
                                    ? {
                                          ...a,
                                          status,
                                      }
                                    : a
                        )
                );

                showToast(
                    "Status updated."
                );
            } catch (
                err
            ) {
                console.error(
                    "[AuditorAssignmentPage] STATUS ERROR:",
                    err
                );

                showToast(
                    err?.response
                        ?.data
                        ?.message ||
                        "Failed to update status.",
                    "error"
                );
            }
        };

    /* =====================================================
       PRIORITY
    ===================================================== */

    const handlePriorityChange =
        async (
            id,
            priority
        ) => {
            try {
                await updateAssignmentPriority(
                    id,
                    priority
                );

                setAssignments(
                    (prev) =>
                        prev.map(
                            (a) =>
                                a.id ===
                                id
                                    ? {
                                          ...a,
                                          priority,
                                      }
                                    : a
                        )
                );

                showToast(
                    "Priority updated."
                );
            } catch (
                err
            ) {
                console.error(
                    "[AuditorAssignmentPage] PRIORITY ERROR:",
                    err
                );

                showToast(
                    err?.response
                        ?.data
                        ?.message ||
                        "Failed to update priority.",
                    "error"
                );
            }
        };

    /* =====================================================
       DELETE
    ===================================================== */

    const confirmDelete =
        async () => {
            if (
                !deleteItem
            ) {
                return;
            }

            try {
                setDeleting(
                    true
                );

                await deleteAssignment(
                    deleteItem.id
                );

                setAssignments(
                    (prev) =>
                        prev.filter(
                            (a) =>
                                a.id !==
                                deleteItem.id
                        )
                );

                showToast(
                    "Assignment deleted."
                );

                setDeleteItem(
                    null
                );
            } catch (
                err
            ) {
                console.error(
                    "[AuditorAssignmentPage] DELETE ERROR:",
                    err
                );

                showToast(
                    err?.response
                        ?.data
                        ?.message ||
                        "Failed to delete assignment.",
                    "error"
                );
            } finally {
                setDeleting(
                    false
                );
            }
        };

    /* =====================================================
       CLASSES
    ===================================================== */

    const inputCls =
        "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

    const labelCls =
        "block text-[12.5px] font-semibold uppercase tracking-wide text-slate-500 mt-3.5 mb-1.5";

    /* =====================================================
       UI
    ===================================================== */

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 to-white p-7 md:p-9 font-sans text-slate-900">

            <style>{`
                @keyframes aaFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(6px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes aaCardIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px) scale(0.98);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes aaToastIn {
                    from {
                        opacity: 0;
                        transform: translateY(8px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes aaPulseRing {
                    0% {
                        box-shadow: 0 0 0 0 rgba(16,185,129,0.35);
                    }

                    70% {
                        box-shadow: 0 0 0 10px rgba(16,185,129,0);
                    }

                    100% {
                        box-shadow: 0 0 0 0 rgba(16,185,129,0);
                    }
                }

                .aa-summary-card {
                    animation: aaCardIn 0.4s ease both;
                }

                .aa-summary-card:hover .aa-summary-icon {
                    animation: aaPulseRing 1.2s ease;
                }

                .aa-grid-card {
                    animation: aaCardIn 0.35s ease both;
                    position: relative;
                }

                .aa-grid-card::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    border-radius: 9999px 0 0 9999px;
                }

                @media (prefers-reduced-motion: reduce) {
                    .aa-summary-card,
                    .aa-grid-card {
                        animation: none !important;
                    }
                }
            `}</style>

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-wrap items-end justify-between gap-4 mb-7 animate-[aaFadeIn_0.25s_ease_both]">

                <div>

                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-600 mb-1">
                        Audit Management
                    </p>

                    <h1 className="text-[27px] font-bold tracking-tight text-slate-900 m-0">
                        Auditor Assignments
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage internal auditor assignments for your department

                        {getDepartmentName(
                            currentUser
                        ) && (
                            <span className="ml-1 font-semibold text-emerald-600">
                                ·{" "}
                                {getDepartmentName(
                                    currentUser
                                )}
                            </span>
                        )}
                    </p>

                </div>

                <button
                    onClick={
                        openCreateModal
                    }
                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-600/30 transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.97]"
                >
                    + Assign Auditor
                </button>

            </div>

            {/* =================================================
                DEPARTMENT INFO
            ================================================= */}

            {getDepartmentName(
                currentUser
            ) && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-5 py-3.5">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                        🏢
                    </div>

                    <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                            Department Scope
                        </div>

                        <div className="text-sm font-semibold text-slate-800">
                            {getDepartmentName(
                                currentUser
                            )}
                        </div>
                    </div>

                    <div className="ml-auto text-xs font-medium text-emerald-700">
                        Risks & Auditors are department restricted
                    </div>

                </div>
            )}

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">

                {[
                    {
                        label:
                            "Total Assignments",
                        value:
                            summary.total,
                        icon: "📋",
                        ring:
                            "bg-emerald-100 text-emerald-700",
                    },
                    {
                        label:
                            "Active",
                        value:
                            summary.active,
                        icon: "⚡",
                        ring:
                            "bg-teal-100 text-teal-700",
                    },
                    {
                        label:
                            "Pending",
                        value:
                            summary.pending,
                        icon: "⏳",
                        ring:
                            "bg-amber-100 text-amber-700",
                    },
                    {
                        label:
                            "Completed",
                        value:
                            summary.completed,
                        icon: "✅",
                        ring:
                            "bg-emerald-100 text-emerald-700",
                    },
                ].map(
                    (
                        s,
                        i
                    ) => (
                        <div
                            key={
                                s.label
                            }
                            style={{
                                animationDelay: `${i * 70}ms`,
                            }}
                            className="aa-summary-card group rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-100"
                        >

                            <div
                                className={`aa-summary-icon mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg ${s.ring}`}
                            >
                                {
                                    s.icon
                                }
                            </div>

                            <div className="font-mono text-[28px] font-bold leading-none text-slate-900">
                                <CountUp
                                    value={
                                        s.value
                                    }
                                />
                            </div>

                            <div className="mt-1.5 text-[12px] font-medium uppercase tracking-wide text-slate-500">
                                {
                                    s.label
                                }
                            </div>

                        </div>
                    )
                )}

            </div>

            {/* =================================================
                RISK WARNING
            ================================================= */}

            {riskLoadWarning && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-700">
                    {
                        riskLoadWarning
                    }
                </div>
            )}

            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="mb-5 flex flex-wrap gap-2.5">

                <input
                    className="min-w-[220px] flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Search by risk, auditor, employee ID..."
                    value={
                        search
                    }
                    onChange={(
                        e
                    ) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

                <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                    value={
                        statusFilter
                    }
                    onChange={(
                        e
                    ) =>
                        setStatusFilter(
                            e.target.value
                        )
                    }
                >

                    <option value="">
                        All Statuses
                    </option>

                    {STATUSES.map(
                        (
                            s
                        ) => (
                            <option
                                key={
                                    s
                                }
                                value={
                                    s
                                }
                            >
                                {s.replace(
                                    "_",
                                    " "
                                )}
                            </option>
                        )
                    )}

                </select>

                <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                    value={
                        priorityFilter
                    }
                    onChange={(
                        e
                    ) =>
                        setPriorityFilter(
                            e.target.value
                        )
                    }
                >

                    <option value="">
                        All Priorities
                    </option>

                    {PRIORITIES.map(
                        (
                            p
                        ) => (
                            <option
                                key={
                                    p
                                }
                                value={
                                    p
                                }
                            >
                                {
                                    p
                                }
                            </option>
                        )
                    )}

                </select>

                <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                    value={`${sortBy}:${sortDir}`}
                    onChange={(
                        e
                    ) => {
                        const [
                            field,
                            direction,
                        ] =
                            e.target.value.split(
                                ":"
                            );

                        setSortBy(
                            field
                        );

                        setSortDir(
                            direction
                        );
                    }}
                >

                    <option value="startDate:asc">
                        Start Date ↑
                    </option>

                    <option value="startDate:desc">
                        Start Date ↓
                    </option>

                    <option value="dueDate:asc">
                        Due Date ↑
                    </option>

                    <option value="dueDate:desc">
                        Due Date ↓
                    </option>

                    <option value="priority:desc">
                        Priority: High → Low
                    </option>

                    <option value="priority:asc">
                        Priority: Low → High
                    </option>

                </select>

                {(statusFilter ||
                    priorityFilter ||
                    search) && (
                    <button
                        onClick={() => {
                            setStatusFilter(
                                ""
                            );

                            setPriorityFilter(
                                ""
                            );

                            setSearch(
                                ""
                            );
                        }}
                        className="rounded-xl border border-dashed border-slate-300 px-3.5 py-2.5 text-sm text-slate-500 hover:bg-slate-50"
                    >
                        Clear
                    </button>
                )}

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="mb-4 rounded-lg bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                    {
                        error
                    }
                </div>
            )}

            {/* =================================================
                CARD GRID
            ================================================= */}

            {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    {[...Array(6)].map(
                        (
                            _,
                            i
                        ) => (
                            <div
                                key={
                                    i
                                }
                                className="h-40 animate-pulse rounded-2xl bg-emerald-50"
                            />
                        )
                    )}

                </div>
            ) : paged.length ===
              0 ? (
                <div className="rounded-2xl border border-emerald-100 bg-white px-6 py-16 text-center">

                    {search ||
                    statusFilter ||
                    priorityFilter ? (
                        <>
                            <div className="mb-1 font-semibold text-slate-900">
                                No matching assignments
                            </div>

                            <div className="text-sm text-slate-500">
                                Try adjusting your search or filters.
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="mb-1 font-semibold text-slate-900">
                                No Auditor Assignments
                            </div>

                            <div className="mb-4 text-sm text-slate-500">
                                No auditor assignments are available for{" "}
                                <strong>
                                    {getDepartmentName(
                                        currentUser
                                    ) ||
                                        "your department"}
                                </strong>
                                .
                            </div>

                            <button
                                onClick={
                                    openCreateModal
                                }
                                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                                + Assign Auditor
                            </button>
                        </>
                    )}

                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                        {paged.map(
                            (
                                a,
                                i
                            ) => {
                                const auditor =
                                    auditorMap.get(
                                        String(
                                            a.employeeId
                                        )
                                    );

                                return (
                                    <div
                                        key={
                                            a.id
                                        }
                                        style={{
                                            animationDelay: `${i * 45}ms`,
                                        }}
                                        className={`aa-grid-card ${
                                            priorityEdge[
                                                a.priority
                                            ] ||
                                            "before:bg-slate-300"
                                        } rounded-2xl border border-slate-200 bg-white p-5 pl-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/70`}
                                    >

                                        <div className="flex items-start justify-between gap-2">

                                            <div>

                                                <div className="font-semibold text-slate-900">
                                                    {
                                                        a.riskTitle ||
                                                        a.riskId
                                                    }
                                                </div>

                                                <div className="mt-0.5 font-mono text-[11px] text-slate-400">
                                                    {
                                                        a.riskId
                                                    }
                                                </div>

                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold ${
                                                    priorityStyles[
                                                        a.priority
                                                    ] ||
                                                    "text-slate-500 border-slate-300"
                                                }`}
                                            >
                                                {
                                                    a.priority
                                                }
                                            </span>

                                        </div>

                                        {/* AUDITOR */}

                                        <div className="mt-3.5 flex items-center gap-2.5 rounded-xl bg-emerald-50/60 px-3 py-2.5">

                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                                                {(
                                                    a.auditorEmail ||
                                                    a.employeeId ||
                                                    "?"
                                                )
                                                    .slice(
                                                        0,
                                                        1
                                                    )
                                                    .toUpperCase()}
                                            </div>

                                            <div className="min-w-0">

                                                <div className="truncate text-[13px] font-medium text-slate-800">
                                                    {
                                                        a.auditorEmail ||
                                                        a.employeeId
                                                    }
                                                </div>

                                                <div className="text-[11.5px] text-slate-500">
                                                    {
                                                        getDepartmentName(
                                                            auditor
                                                        ) ||
                                                        getDepartmentName(
                                                            a
                                                        ) ||
                                                        getDepartmentName(
                                                            selectedRisk
                                                        ) ||
                                                        "—"
                                                    }
                                                </div>

                                            </div>

                                        </div>

                                        {/* DATES */}

                                        <div className="mt-3.5 grid grid-cols-2 gap-2 text-[12.5px]">

                                            <div>
                                                <div className="text-slate-400">
                                                    Start
                                                </div>

                                                <div className="font-medium text-slate-700">
                                                    {
                                                        a.startDate
                                                    }
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-slate-400">
                                                    Due
                                                </div>

                                                <div className="font-medium text-slate-700">
                                                    {
                                                        a.dueDate
                                                    }
                                                </div>
                                            </div>

                                        </div>

                                        {/* ACTIONS */}

                                        <div className="mt-4 flex items-center justify-between gap-2">

                                            <select
                                                value={
                                                    a.status
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    handleStatusChange(
                                                        a.id,
                                                        e.target.value
                                                    )
                                                }
                                                className={`rounded-full border bg-white px-2.5 py-1 text-[11px] font-semibold cursor-pointer ${
                                                    statusStyles[
                                                        a.status
                                                    ] ||
                                                    "text-slate-500 border-slate-300"
                                                }`}
                                            >
                                                {STATUSES.map(
                                                    (
                                                        s
                                                    ) => (
                                                        <option
                                                            key={
                                                                s
                                                            }
                                                            value={
                                                                s
                                                            }
                                                        >
                                                            {s.replace(
                                                                "_",
                                                                " "
                                                            )}
                                                        </option>
                                                    )
                                                )}
                                            </select>

                                            <div className="flex items-center gap-1">

                                                <button
                                                    title="View details"
                                                    onClick={() =>
                                                        setViewItem(
                                                            a
                                                        )
                                                    }
                                                    className="rounded-lg px-2 py-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
                                                >
                                                    👁
                                                </button>

                                                <button
                                                    title="Delete assignment"
                                                    onClick={() =>
                                                        setDeleteItem(
                                                            a
                                                        )
                                                    }
                                                    className="rounded-lg px-2 py-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                                >
                                                    🗑
                                                </button>

                                            </div>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-emerald-100 bg-white px-5 py-3.5 text-[13px] text-slate-500">

                        <span>
                            Showing{" "}
                            {total ===
                            0
                                ? 0
                                : (page -
                                      1) *
                                      pageSize +
                                  1}
                            –
                            {Math.min(
                                page *
                                    pageSize,
                                total
                            )}{" "}
                            of{" "}
                            {
                                total
                            }
                        </span>

                        <div className="flex items-center gap-2.5">

                            <select
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12.5px]"
                                value={
                                    pageSize
                                }
                                onChange={(
                                    e
                                ) =>
                                    setPageSize(
                                        Number(
                                            e
                                                .target
                                                .value
                                        )
                                    )
                                }
                            >
                                {[9, 18, 36, 60].map(
                                    (
                                        n
                                    ) => (
                                        <option
                                            key={
                                                n
                                            }
                                            value={
                                                n
                                            }
                                        >
                                            {
                                                n
                                            }{" "}
                                            / page
                                        </option>
                                    )
                                )}
                            </select>

                            <button
                                disabled={
                                    page <=
                                    1
                                }
                                onClick={() =>
                                    setPage(
                                        (
                                            p
                                        ) =>
                                            p -
                                            1
                                    )
                                }
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12.5px] disabled:opacity-40"
                            >
                                Prev
                            </button>

                            <span>
                                {
                                    page
                                }{" "}
                                /{" "}
                                {
                                    totalPages
                                }
                            </span>

                            <button
                                disabled={
                                    page >=
                                    totalPages
                                }
                                onClick={() =>
                                    setPage(
                                        (
                                            p
                                        ) =>
                                            p +
                                            1
                                    )
                                }
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12.5px] disabled:opacity-40"
                            >
                                Next
                            </button>

                        </div>

                    </div>
                </>
            )}

            {/* =================================================
                CREATE MODAL
            ================================================= */}

            {modalOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/55 p-4"
                    onClick={
                        closeModal
                    }
                >

                    <div
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        role="dialog"
                        aria-modal="true"
                        className={`max-h-[90vh] w-[480px] overflow-y-auto rounded-2xl bg-white p-6 transition-all duration-200 ${
                            modalVisible
                                ? "opacity-100 translate-y-0"
                                : "opacity-0 translate-y-3"
                        }`}
                    >

                        <h2 className="mb-1 text-lg font-bold text-slate-900">
                            Assign Auditor
                        </h2>

                        {/* DEPARTMENT */}

                        {getDepartmentName(
                            currentUser
                        ) && (
                            <div className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                                Department:{" "}
                                <strong>
                                    {
                                        getDepartmentName(
                                            currentUser
                                        )
                                    }
                                </strong>
                            </div>
                        )}

                        {/* ROLE */}

                        {getRoleName(
                            currentUser
                        ) && (
                            <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                Role:{" "}
                                <strong>
                                    {formatDepartmentName(
                                        getRoleName(
                                            currentUser
                                        )
                                    )}
                                </strong>
                            </div>
                        )}

                        {risks.length ===
                            0 && (
                            <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                No risks are available for your department.
                            </div>
                        )}

                        <form
                            onSubmit={
                                handleCreate
                            }
                        >

                            {/* RISK */}

                            <label
                                className={
                                    labelCls
                                }
                                htmlFor="riskId"
                            >
                                Risk *
                            </label>

                            <select
                                id="riskId"
                                className={
                                    inputCls
                                }
                                name="riskId"
                                value={
                                    form.riskId
                                }
                                onChange={
                                    handleFormChange
                                }
                            >

                                <option value="">
                                    Select a risk...
                                </option>

                                {risks.map(
                                    (
                                        r
                                    ) => (
                                        <option
                                            key={
                                                r.riskId
                                            }
                                            value={
                                                r.riskId
                                            }
                                        >
                                            {
                                                r.riskId
                                            }{" "}
                                            —{" "}
                                            {r.title ||
                                                r.riskTitle ||
                                                "Untitled Risk"}{" "}
                                            (
                                            {
                                                r.level
                                            }
                                            )
                                        </option>
                                    )
                                )}

                            </select>

                            {formErrors.riskId && (
                                <div className="mt-1 text-xs text-rose-600">
                                    {
                                        formErrors.riskId
                                    }
                                </div>
                            )}

                            {/* AUDITOR */}

                            <label
                                className={
                                    labelCls
                                }
                                htmlFor="employeeId"
                            >
                                Internal Auditor *
                            </label>

                            <select
                                id="employeeId"
                                className={`${inputCls} disabled:bg-slate-50 disabled:text-slate-400`}
                                name="employeeId"
                                value={
                                    form.employeeId
                                }
                                onChange={
                                    handleFormChange
                                }
                                disabled={
                                    !form.riskId
                                }
                            >

                                <option value="">
                                    {form.riskId
                                        ? "Select an auditor..."
                                        : "Select a risk first..."}
                                </option>

                                {eligibleAuditors.map(
                                    (
                                        u
                                    ) => (
                                        <option
                                            key={
                                                u.employeeId
                                            }
                                            value={
                                                u.employeeId
                                            }
                                        >
                                            {
                                                u.email
                                            }{" "}
                                            —{" "}
                                            {getDepartmentName(
                                                u
                                            )}
                                        </option>
                                    )
                                )}

                            </select>

                            {formErrors.employeeId && (
                                <div className="mt-1 text-xs text-rose-600">
                                    {
                                        formErrors.employeeId
                                    }
                                </div>
                            )}

                            {form.riskId &&
                                eligibleAuditors.length ===
                                    0 && (
                                    <div className="mt-1.5 rounded-lg bg-rose-50 px-2.5 py-2 text-xs text-rose-600">
                                        No Internal Auditors found in{" "}
                                        {getDepartmentName(
                                            selectedRisk
                                        ) ||
                                            getDepartmentName(
                                                currentUser
                                            ) ||
                                            "your department"}
                                        .
                                    </div>
                                )}

                            {/* DATES */}

                            <div className="flex gap-3">

                                <div className="flex-1">

                                    <label
                                        className={
                                            labelCls
                                        }
                                        htmlFor="startDate"
                                    >
                                        Start Date *
                                    </label>

                                    <input
                                        id="startDate"
                                        type="date"
                                        className={
                                            inputCls
                                        }
                                        name="startDate"
                                        value={
                                            form.startDate
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                    />

                                    {formErrors.startDate && (
                                        <div className="mt-1 text-xs text-rose-600">
                                            {
                                                formErrors.startDate
                                            }
                                        </div>
                                    )}

                                </div>

                                <div className="flex-1">

                                    <label
                                        className={
                                            labelCls
                                        }
                                        htmlFor="dueDate"
                                    >
                                        Due Date *
                                    </label>

                                    <input
                                        id="dueDate"
                                        type="date"
                                        className={
                                            inputCls
                                        }
                                        name="dueDate"
                                        value={
                                            form.dueDate
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                    />

                                    {formErrors.dueDate && (
                                        <div className="mt-1 text-xs text-rose-600">
                                            {
                                                formErrors.dueDate
                                            }
                                        </div>
                                    )}

                                </div>

                            </div>

                            {/* PRIORITY */}

                            <label
                                className={
                                    labelCls
                                }
                                htmlFor="priority"
                            >
                                Priority
                            </label>

                            <select
                                id="priority"
                                className={
                                    inputCls
                                }
                                name="priority"
                                value={
                                    form.priority
                                }
                                onChange={
                                    handleFormChange
                                }
                            >
                                {PRIORITIES.map(
                                    (
                                        p
                                    ) => (
                                        <option
                                            key={
                                                p
                                            }
                                            value={
                                                p
                                            }
                                        >
                                            {
                                                p
                                            }
                                        </option>
                                    )
                                )}
                            </select>

                            {/* COMMENTS */}

                            <label
                                className={
                                    labelCls
                                }
                                htmlFor="comments"
                            >
                                Comments
                            </label>

                            <textarea
                                id="comments"
                                className={`${inputCls} min-h-[70px]`}
                                name="comments"
                                value={
                                    form.comments
                                }
                                onChange={
                                    handleFormChange
                                }
                            />

                            {/* BUTTONS */}

                            <div className="mt-5 flex justify-end gap-2.5">

                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving ||
                                        !currentUser ||
                                        !getDepartmentName(
                                            currentUser
                                        )
                                    }
                                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                                >
                                    {saving
                                        ? "Assigning..."
                                        : "Assign Auditor"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* =================================================
                VIEW DETAILS
            ================================================= */}

            {viewItem && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/55 p-4"
                    onClick={() =>
                        setViewItem(
                            null
                        )
                    }
                >

                    <div
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        role="dialog"
                        aria-modal="true"
                        className="max-h-[90vh] w-[460px] overflow-y-auto rounded-2xl bg-white p-6 animate-[aaFadeIn_0.2s_ease_both]"
                    >

                        <h2 className="mb-3 text-lg font-bold text-slate-900">
                            Assignment Details
                        </h2>

                        {[
                            [
                                "Assignment ID",
                                viewItem.id,
                            ],
                            [
                                "Risk",
                                `${viewItem.riskTitle || ""} (${viewItem.riskId})`,
                            ],
                            [
                                "Auditor",
                                viewItem.auditorEmail ||
                                    viewItem.employeeId,
                            ],
                            [
                                "Department",
                                getDepartmentName(
                                    viewItem
                                ) ||
                                    getDepartmentName(
                                        auditorMap.get(
                                            String(
                                                viewItem.employeeId
                                            )
                                        )
                                    ) ||
                                    getDepartmentName(
                                        currentUser
                                    ) ||
                                    "—",
                            ],
                            [
                                "Assigned By",
                                viewItem.assignedByEmployeeId ||
                                    "—",
                            ],
                            [
                                "Assigned At",
                                viewItem.assignedAt ||
                                    "—",
                            ],
                            [
                                "Start Date",
                                viewItem.startDate,
                            ],
                            [
                                "Due Date",
                                viewItem.dueDate,
                            ],
                            [
                                "Status",
                                viewItem.status,
                            ],
                            [
                                "Priority",
                                viewItem.priority,
                            ],
                            [
                                "Comments",
                                viewItem.comments ||
                                    "No comments",
                            ],
                        ].map(
                            ([
                                label,
                                value,
                            ]) => (
                                <div
                                    key={
                                        label
                                    }
                                    className="flex justify-between gap-3 border-b border-slate-100 py-2.5 text-[13.5px]"
                                >

                                    <span className="text-slate-500">
                                        {
                                            label
                                        }
                                    </span>

                                    <span className="text-right font-semibold text-slate-900 break-words max-w-[260px]">
                                        {
                                            value
                                        }
                                    </span>

                                </div>
                            )
                        )}

                        <div className="mt-5 flex justify-end">

                            <button
                                onClick={() =>
                                    setViewItem(
                                        null
                                    )
                                }
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-50"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* =================================================
                DELETE
            ================================================= */}

            {deleteItem && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/55 p-4"
                    onClick={() =>
                        !deleting &&
                        setDeleteItem(
                            null
                        )
                    }
                >

                    <div
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        role="alertdialog"
                        aria-modal="true"
                        className="w-[420px] rounded-2xl bg-white p-6 animate-[aaFadeIn_0.2s_ease_both]"
                    >

                        <h2 className="mb-2 text-lg font-bold text-slate-900">
                            Delete Assignment?
                        </h2>

                        <p className="mb-3 text-sm text-slate-500">
                            Are you sure you want to delete this auditor assignment? This action cannot be undone.
                        </p>

                        <div className="flex justify-between border-b border-slate-100 py-2 text-[13.5px]">

                            <span className="text-slate-500">
                                Risk
                            </span>

                            <span className="font-semibold">
                                {
                                    deleteItem.riskTitle ||
                                    deleteItem.riskId
                                }
                            </span>

                        </div>

                        <div className="flex justify-between border-b border-slate-100 py-2 text-[13.5px]">

                            <span className="text-slate-500">
                                Auditor
                            </span>

                            <span className="font-semibold">
                                {
                                    deleteItem.auditorEmail ||
                                    deleteItem.employeeId
                                }
                            </span>

                        </div>

                        <div className="mt-5 flex justify-end gap-2.5">

                            <button
                                onClick={() =>
                                    setDeleteItem(
                                        null
                                    )
                                }
                                disabled={
                                    deleting
                                }
                                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={
                                    confirmDelete
                                }
                                disabled={
                                    deleting
                                }
                                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                            >
                                {deleting
                                    ? "Deleting..."
                                    : "Delete Assignment"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            <Toast
                toast={
                    toast
                }
                onClose={() =>
                    setToast(
                        null
                    )
                }
            />

        </div>
    );
}