import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
    Plus,
    Search,
    X,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
} from "lucide-react";

import auditeeAssignmentService from "../../service/auditeeAssignmentService";

import {
    getCommitmentsByAuditee,
    getActiveCommitmentsByAuditee,
    getAuditeeWorkload,
} from "../../service/auditCommitmentService";

import {
    getUsersByRole,
    getProfile,
} from "../../service/AuthService";

import { getAllAudits } from "../../service/AuditService";
import { getAllDepartments } from "../../service/departmentService";
import { getAllRoles } from "../../service/roleService";

import AuditeeAssignmentTable from "../../components/audit-manager/auditee-assignment/AuditeeAssignmentTable";
import AuditeeAssignmentModal from "../../components/audit-manager/auditee-assignment/AuditeeAssignmentModal";
import AuditeeAssignmentStatusBadge from "../../components/audit-manager/auditee-assignment/AuditeeAssignmentStatusBadge";

const STATUS_FILTER_OPTIONS = [
    "All",
    "ASSIGNED",
    "IN_PROGRESS",
    "COMPLETED",
    "OVERDUE",
    "CANCELLED",
];

/* ============================================================
   TOAST
============================================================ */

const Toast = ({ toast, onClose }) => {
    if (!toast) return null;

    const isError = toast.type === "error";

    return (
        <motion.div
            initial={{
                opacity: 0,
                y: -12,
                x: "-50%",
            }}
            animate={{
                opacity: 1,
                y: 0,
                x: "-50%",
            }}
            exit={{
                opacity: 0,
                y: -12,
                x: "-50%",
            }}
            className={`fixed top-5 left-1/2 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
                isError
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-green-50 border-green-200 text-green-700"
            }`}
        >
            {isError ? (
                <AlertCircle className="w-4 h-4" />
            ) : (
                <CheckCircle2 className="w-4 h-4" />
            )}

            <span>{toast.message}</span>

            <button
                onClick={onClose}
                className="ml-2 opacity-60 hover:opacity-100"
            >
                <X className="w-3.5 h-3.5" />
            </button>
        </motion.div>
    );
};

/* ============================================================
   RESPONSE NORMALIZER
============================================================ */

const extractArray = (response) => {
    if (Array.isArray(response)) {
        return response;
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
        return response.data.data;
    }

    if (Array.isArray(response?.content)) {
        return response.content;
    }

    if (Array.isArray(response?.data?.content)) {
        return response.data.content;
    }

    return [];
};

/* ============================================================
   SAFE STRING
============================================================ */

const safeString = (value) => {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value);
};

/* ============================================================
   NORMALIZE ASSIGNMENT
============================================================ */

const normalizeAssignment = (raw) => ({
    id: raw?.id,

    status: raw?.status,

    assignedDate: raw?.assignedDate,
    startDate: raw?.startDate,
    dueDate: raw?.dueDate,

    audit: {
        id:
            raw?.auditId ??
            raw?.audit?.id,

        auditId:
            raw?.auditIdCode ??
            raw?.audit?.auditId ??
            raw?.auditId,

        auditName:
            raw?.auditName ??
            raw?.audit?.auditName ??
            raw?.audit?.name,
    },

    auditee: {
        id:
            raw?.auditeeId ??
            raw?.auditee?.id,

        name:
            raw?.auditeeName ??
            raw?.auditee?.name,

        employeeId:
            raw?.auditeeEmployeeId ??
            raw?.auditee?.employeeId,

        email:
            raw?.auditeeEmail ??
            raw?.auditee?.email,

        department:
            raw?.auditeeDepartment ??
            raw?.auditee?.department,

        departmentId:
            raw?.auditeeDepartmentId ??
            raw?.auditee?.departmentId,

        departmentName:
            raw?.auditeeDepartmentName ??
            raw?.auditee?.departmentName,
    },

    assignedBy: {
        id:
            raw?.assignedById ??
            raw?.assignedBy?.id,

        name:
            raw?.assignedByName ??
            raw?.assignedBy?.name,
    },

    raw,
});

/* ============================================================
   ENTITY ID
============================================================ */

const getEntityId = (value) => {
    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    if (typeof value === "object") {
        if (
            value.id !== undefined &&
            value.id !== null
        ) {
            return String(value.id);
        }

        if (
            value.departmentId !== undefined &&
            value.departmentId !== null
        ) {
            return String(value.departmentId);
        }

        return null;
    }

    return String(value);
};

/* ============================================================
   ENTITY NAME
============================================================ */

const getEntityName = (value) => {
    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    if (typeof value === "object") {
        return (
            value.name ||
            value.departmentName ||
            value.roleName ||
            value.auditName ||
            value.code ||
            ""
        );
    }

    return typeof value === "string"
        ? value
        : "";
};

/* ============================================================
   DEPARTMENT NAME NORMALIZATION
============================================================ */

const normalizeDepartmentName = (value) => {
    if (!value) {
        return "";
    }

    return String(value)
        .trim()
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\s+/g, " ");
};

/* ============================================================
   DEPARTMENT ID
============================================================ */

const getDepartmentId = (entity) => {
    if (!entity) {
        return null;
    }

    if (
        entity.departmentId !== undefined &&
        entity.departmentId !== null
    ) {
        return String(entity.departmentId);
    }

    if (
        entity.departmentID !== undefined &&
        entity.departmentID !== null
    ) {
        return String(entity.departmentID);
    }

    if (
        entity.deptId !== undefined &&
        entity.deptId !== null
    ) {
        return String(entity.deptId);
    }

    if (
        entity.department &&
        typeof entity.department === "object"
    ) {
        if (
            entity.department.id !== undefined &&
            entity.department.id !== null
        ) {
            return String(entity.department.id);
        }

        if (
            entity.department.departmentId !== undefined &&
            entity.department.departmentId !== null
        ) {
            return String(
                entity.department.departmentId
            );
        }
    }

    if (
        typeof entity.department === "number" ||
        typeof entity.department === "string"
    ) {
        return String(entity.department);
    }

    return null;
};

/* ============================================================
   DEPARTMENT NAME
============================================================ */

const getDepartmentName = (
    entity,
    departmentMap = {}
) => {
    if (!entity) {
        return "";
    }

    if (entity.departmentName) {
        return String(entity.departmentName);
    }

    if (entity.deptName) {
        return String(entity.deptName);
    }

    if (
        entity.department &&
        typeof entity.department === "object"
    ) {
        const nested = getEntityName(
            entity.department
        );

        if (nested) {
            return nested;
        }
    }

    if (
        typeof entity.department === "string"
    ) {
        return entity.department;
    }

    const departmentId =
        getDepartmentId(entity);

    if (
        departmentId &&
        departmentMap[String(departmentId)]
    ) {
        return departmentMap[
            String(departmentId)
        ];
    }

    return "";
};

/* ============================================================
   SAME DEPARTMENT
============================================================ */

const sameDepartment = (
    first,
    second,
    departmentMap = {}
) => {
    if (!first || !second) {
        return false;
    }

    const firstId =
        getDepartmentId(first);

    const secondId =
        getDepartmentId(second);

    /* ID MATCH */

    if (firstId && secondId) {
        return (
            String(firstId) ===
            String(secondId)
        );
    }

    /* NAME MATCH */

    const firstName =
        normalizeDepartmentName(
            getDepartmentName(
                first,
                departmentMap
            )
        );

    const secondName =
        normalizeDepartmentName(
            getDepartmentName(
                second,
                departmentMap
            )
        );

    return Boolean(
        firstName &&
        secondName &&
        firstName === secondName
    );
};

/* ============================================================
   AUDIT DEPARTMENT
============================================================ */

const getAuditDepartment = (
    audit,
    departmentMap = {}
) => {
    if (!audit) {
        return {
            id: null,
            name: "",
        };
    }

    /* Direct audit department */

    const directId =
        getDepartmentId(audit);

    const directName =
        getDepartmentName(
            audit,
            departmentMap
        );

    if (
        directId ||
        directName
    ) {
        return {
            id: directId,
            name: directName,
        };
    }

    /* Nested risk */

    if (audit.risk) {
        return {
            id:
                getDepartmentId(
                    audit.risk
                ),

            name:
                getDepartmentName(
                    audit.risk,
                    departmentMap
                ),
        };
    }

    /* Nested business unit */

    if (
        audit.businessUnit &&
        typeof audit.businessUnit ===
            "object"
    ) {
        return {
            id:
                getDepartmentId(
                    audit.businessUnit
                ),

            name:
                getDepartmentName(
                    audit.businessUnit,
                    departmentMap
                ),
        };
    }

    return {
        id: null,
        name: "",
    };
};

/* ============================================================
   AUDIT BELONGS TO MANAGER DEPARTMENT
============================================================ */

const auditBelongsToManagerDepartment = (
    audit,
    managerProfile,
    departmentMap
) => {
    if (
        !audit ||
        !managerProfile
    ) {
        return false;
    }

    const auditDepartment =
        getAuditDepartment(
            audit,
            departmentMap
        );

    /* No department information = FAIL CLOSED */

    if (
        !auditDepartment.id &&
        !auditDepartment.name
    ) {
        return false;
    }

    const managerId =
        getDepartmentId(
            managerProfile
        );

    const managerName =
        getDepartmentName(
            managerProfile,
            departmentMap
        );

    /* ID */

    if (
        auditDepartment.id &&
        managerId
    ) {
        return (
            String(
                auditDepartment.id
            ) ===
            String(managerId)
        );
    }

    /* Name */

    const auditName =
        normalizeDepartmentName(
            auditDepartment.name
        );

    const managerDepartment =
        normalizeDepartmentName(
            managerName
        );

    return Boolean(
        auditName &&
        managerDepartment &&
        auditName ===
            managerDepartment
    );
};

/* ============================================================
   AUDIT REFERENCE
============================================================ */

const getAuditReference = (
    assignment
) => {
    if (!assignment) {
        return null;
    }

    const raw =
        assignment.raw ||
        assignment;

    return (
        raw.auditId ??
        raw.audit?.id ??
        raw.audit?.auditId ??
        raw.auditIdCode ??
        raw.auditDbId ??
        null
    );
};

/* ============================================================
   RESOLVE AUDIT FROM ASSIGNMENT
============================================================ */

const resolveAssignmentAudit = (
    assignment,
    audits
) => {
    if (!assignment) {
        return null;
    }

    const raw =
        assignment.raw ||
        assignment;

    if (raw.audit) {
        return raw.audit;
    }

    const reference =
        getAuditReference(
            assignment
        );

    if (
        reference === null ||
        reference === undefined
    ) {
        return null;
    }

    return (
        audits.find(
            (audit) =>
                String(
                    audit?.id
                ) ===
                    String(reference) ||

                String(
                    audit?.auditId
                ) ===
                    String(reference) ||

                String(
                    audit?.auditIdCode
                ) ===
                    String(reference) ||

                String(
                    audit?.auditDbId
                ) ===
                    String(reference)
        ) || null
    );
};

/* ============================================================
   ASSIGNMENT BELONGS TO MANAGER DEPARTMENT
============================================================ */

const assignmentBelongsToManagerDepartment = (
    assignment,
    managerProfile,
    audits,
    departmentMap
) => {
    if (
        !assignment ||
        !managerProfile
    ) {
        return false;
    }

    const raw =
        assignment.raw ||
        assignment;

    /* ========================================================
       1. DIRECT ASSIGNMENT DEPARTMENT
    ======================================================== */

    if (
        getDepartmentId(raw) ||
        getDepartmentName(
            raw,
            departmentMap
        )
    ) {
        return sameDepartment(
            raw,
            managerProfile,
            departmentMap
        );
    }

    /* ========================================================
       2. AUDIT DEPARTMENT
    ======================================================== */

    const relatedAudit =
        resolveAssignmentAudit(
            assignment,
            audits
        );

    if (relatedAudit) {
        return auditBelongsToManagerDepartment(
            relatedAudit,
            managerProfile,
            departmentMap
        );
    }

    /* ========================================================
       3. AUDITEE DEPARTMENT
    ======================================================== */

    if (raw.auditee) {
        if (
            getDepartmentId(
                raw.auditee
            ) ||
            getDepartmentName(
                raw.auditee,
                departmentMap
            )
        ) {
            return sameDepartment(
                raw.auditee,
                managerProfile,
                departmentMap
            );
        }
    }

    /* ========================================================
       UNKNOWN DEPARTMENT
       FAIL CLOSED
    ======================================================== */

    return false;
};

/* ============================================================
   RESOLVE DEPARTMENT NAME
============================================================ */

const resolveDepartmentName = (
    auditee,
    departmentMap
) => {
    const direct =
        getEntityName(
            auditee?.department
        ) ||
        auditee?.departmentName ||
        "";

    if (direct) {
        return direct;
    }

    const id =
        getEntityId(
            auditee?.department
        ) ||
        auditee?.departmentId;

    return id
        ? departmentMap[
              String(id)
          ] || ""
        : "";
};

/* ============================================================
   RESOLVE ROLE NAME
============================================================ */

const resolveRoleName = (
    auditee,
    roleMap
) => {
    const direct =
        getEntityName(
            auditee?.role
        ) ||
        auditee?.roleName ||
        "";

    if (direct) {
        return direct;
    }

    const id =
        getEntityId(
            auditee?.role
        ) ||
        auditee?.roleId;

    return id
        ? roleMap[
              String(id)
          ] || ""
        : "";
};

/* ============================================================
   FRIENDLY ERROR
============================================================ */

const friendlyError = (err) => {
    const status =
        err?.response?.status;

    const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.data?.message;

    if (backendMessage) {
        return backendMessage;
    }

    if (status === 400) {
        return (
            "Cannot assign auditee. " +
            "Please make sure the audit has been created."
        );
    }

    if (status === 401) {
        return "Your session has expired. Please log in again.";
    }

    if (status === 403) {
        return "You don't have permission to perform this action.";
    }

    if (status === 404) {
        return "The requested resource was not found.";
    }

    if (status === 500) {
        return "Something went wrong on the server. Please try again.";
    }

    if (!err?.response) {
        return "Network error. Please check your connection.";
    }

    return "Something went wrong. Please try again.";
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

const AuditeeAssignment = () => {

    /* ========================================================
       ASSIGNMENTS
    ======================================================== */

    const [
        assignments,
        setAssignments,
    ] = useState([]);

    /* ========================================================
       DROPDOWN DATA
    ======================================================== */

    const [
        audits,
        setAudits,
    ] = useState([]);

    const [
        auditees,
        setAuditees,
    ] = useState([]);

    /* ========================================================
       CURRENT AUDIT MANAGER
    ======================================================== */

    const [
        currentUser,
        setCurrentUser,
    ] = useState(null);

    const [
        departmentMap,
        setDepartmentMap,
    ] = useState({});

    const [
        managerDepartmentName,
        setManagerDepartmentName,
    ] = useState("");

    const [
        managerDepartmentId,
        setManagerDepartmentId,
    ] = useState(null);

    /* ========================================================
       WORKLOAD
    ======================================================== */

    const [
        selectedAuditeeId,
        setSelectedAuditeeId,
    ] = useState(null);

    const [
        auditeeCommitments,
        setAuditeeCommitments,
    ] = useState([]);

    const [
        auditeeWorkload,
        setAuditeeWorkload,
    ] = useState(0);

    const [
        loadingAuditeeCommitments,
        setLoadingAuditeeCommitments,
    ] = useState(false);

    const [
        auditeeCommitmentError,
        setAuditeeCommitmentError,
    ] = useState("");

    /* ========================================================
       PAGE STATE
    ======================================================== */

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState(false);

    const [
        departmentError,
        setDepartmentError,
    ] = useState("");

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("All");

    /* ========================================================
       MODAL
    ======================================================== */

    const [
        modalOpen,
        setModalOpen,
    ] = useState(false);

    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    const [
        modalError,
        setModalError,
    ] = useState("");

    /* ========================================================
       VIEW / DELETE
    ======================================================== */

    const [
        viewAssignment,
        setViewAssignment,
    ] = useState(null);

    const [
        deleteTarget,
        setDeleteTarget,
    ] = useState(null);

    /* ========================================================
       TOAST
    ======================================================== */

    const [
        toast,
        setToast,
    ] = useState(null);

    const showToast = useCallback(
        (
            message,
            type = "success"
        ) => {
            setToast({
                message,
                type,
            });

            setTimeout(() => {
                setToast(null);
            }, 3500);
        },
        []
    );

    /* ========================================================
       FETCH CURRENT PROFILE

       IMPORTANT:
       No departmentMap dependency here.
       This prevents callback recreation loop.
    ======================================================== */

    const fetchCurrentProfile =
        useCallback(
            async () => {

                const response =
                    await getProfile();

                const profile =
                    response?.data?.data ||
                    response?.data ||
                    response?.profile ||
                    response?.user ||
                    response;

                console.log(
                    "AUDIT MANAGER PROFILE:",
                    profile
                );

                setCurrentUser(
                    profile
                );

                return profile;
            },
            []
        );

    /* ========================================================
       FETCH ASSIGNMENTS

       This function does NOT trigger automatically.
       It is called explicitly.
    ======================================================== */

    const fetchAssignments =
        useCallback(
            async (
                profileOverride = null,
                auditsOverride = null,
                departmentMapOverride = null
            ) => {

                setLoading(true);
                setError(false);

                try {

                    const profile =
                        profileOverride ||
                        currentUser;

                    const auditList =
                        auditsOverride ||
                        audits;

                    const map =
                        departmentMapOverride ||
                        departmentMap;

                    if (!profile) {
                        setAssignments([]);
                        return;
                    }

                    const profileDepartmentId =
                        getDepartmentId(
                            profile
                        );

                    const profileDepartmentName =
                        getDepartmentName(
                            profile,
                            map
                        );

                    /* ========================================
                       FAIL CLOSED
                    ======================================== */

                    if (
                        !profileDepartmentId &&
                        !profileDepartmentName
                    ) {

                        setAssignments([]);

                        setError(true);

                        setDepartmentError(
                            "Audit Manager department could not be determined."
                        );

                        return;
                    }

                    const res =
                        await auditeeAssignmentService
                            .getAllAssignments();

                    const rawData =
                        extractArray(res);

                    console.log(
                        "RAW AUDITEE ASSIGNMENTS:",
                        rawData
                    );

                    /* ========================================
                       DEPARTMENT FILTER
                    ======================================== */

                    const scopedRawAssignments =
                        rawData.filter(
                            (assignment) =>
                                assignmentBelongsToManagerDepartment(
                                    assignment,
                                    profile,
                                    auditList,
                                    map
                                )
                        );

                    console.log(
                        "SCOPED AUDITEE ASSIGNMENTS:",
                        scopedRawAssignments
                    );

                    const normalized =
                        scopedRawAssignments.map(
                            normalizeAssignment
                        );

                    setAssignments(
                        normalized
                    );

                } catch (err) {

                    console.error(
                        "Failed to fetch assignments:",
                        err
                    );

                    setAssignments([]);

                    setError(true);

                } finally {

                    setLoading(false);
                }
            },
            [
                currentUser,
                audits,
                departmentMap,
            ]
        );

    /* ========================================================
       FETCH DROPDOWN DATA

       IMPORTANT:
       Called ONLY ON INITIAL MOUNT.
    ======================================================== */

    const fetchDropdownData =
        useCallback(
            async () => {

                setLoading(true);
                setError(false);

                try {

                    /* ========================================
                       1. PROFILE
                    ======================================== */

                    const profile =
                        await fetchCurrentProfile();

                    if (!profile) {

                        throw new Error(
                            "Unable to load Audit Manager profile"
                        );
                    }

                    /* ========================================
                       2. FETCH DATA
                    ======================================== */

                    const [
                        auditsRes,
                        auditeesRes,
                        departmentsRes,
                        rolesRes,
                    ] =
                        await Promise.all([
                            getAllAudits(),

                            getUsersByRole(
                                "AUDITEE"
                            ),

                            getAllDepartments()
                                .catch((err) => {
                                    console.error(
                                        "Failed to fetch departments:",
                                        err
                                    );

                                    return [];
                                }),

                            getAllRoles()
                                .catch((err) => {
                                    console.error(
                                        "Failed to fetch roles:",
                                        err
                                    );

                                    return [];
                                }),
                        ]);

                    /* ========================================
                       3. DEPARTMENT MAP
                    ======================================== */

                    const departmentList =
                        extractArray(
                            departmentsRes
                        );

                    const newDepartmentMap =
                        {};

                    departmentList.forEach(
                        (department) => {

                            if (
                                department?.id !==
                                    undefined &&
                                department?.id !==
                                    null
                            ) {
                                newDepartmentMap[
                                    String(
                                        department.id
                                    )
                                ] =
                                    department.name ||
                                    department.departmentName ||
                                    "";
                            }
                        }
                    );

                    setDepartmentMap(
                        newDepartmentMap
                    );

                    /* ========================================
                       4. MANAGER DEPARTMENT
                    ======================================== */

                    const managerDeptId =
                        getDepartmentId(
                            profile
                        );

                    const managerDeptName =
                        getDepartmentName(
                            profile,
                            newDepartmentMap
                        );

                    console.log(
                        "MANAGER DEPARTMENT ID:",
                        managerDeptId
                    );

                    console.log(
                        "MANAGER DEPARTMENT NAME:",
                        managerDeptName
                    );

                    /* ========================================
                       NO DEPARTMENT
                    ======================================== */

                    if (
                        !managerDeptId &&
                        !managerDeptName
                    ) {

                        setDepartmentError(
                            "Your Audit Manager department is not available in your profile."
                        );

                        setAudits([]);
                        setAuditees([]);
                        setAssignments([]);

                        setLoading(false);

                        return;
                    }

                    setManagerDepartmentId(
                        managerDeptId
                    );

                    setManagerDepartmentName(
                        managerDeptName
                    );

                    setDepartmentError("");

                    /* ========================================
                       5. ROLE MAP
                    ======================================== */

                    const roleList =
                        extractArray(
                            rolesRes
                        );

                    const roleMap = {};

                    roleList.forEach(
                        (role) => {

                            if (
                                role?.id !==
                                    undefined &&
                                role?.id !==
                                    null
                            ) {
                                roleMap[
                                    String(
                                        role.id
                                    )
                                ] =
                                    role.name ||
                                    role.roleName ||
                                    role.code ||
                                    "";
                            }
                        }
                    );

                    /* ========================================
                       6. ALL AUDITS
                    ======================================== */

                    const allAudits =
                        extractArray(
                            auditsRes
                        );

                    console.log(
                        "ALL AUDITS:",
                        allAudits
                    );

                    /* ========================================
                       7. ONLY SAME-DEPARTMENT AUDITS
                    ======================================== */

                    const scopedAudits =
                        allAudits.filter(
                            (audit) =>
                                auditBelongsToManagerDepartment(
                                    audit,
                                    profile,
                                    newDepartmentMap
                                )
                        );

                    console.log(
                        "SCOPED AUDITS:",
                        scopedAudits
                    );

                    setAudits(
                        scopedAudits
                    );

                    /* ========================================
                       8. ALL AUDITEES
                    ======================================== */

                    const allAuditees =
                        extractArray(
                            auditeesRes
                        );

                    console.log(
                        "ALL AUDITEES:",
                        allAuditees
                    );

                    /* ========================================
                       9. ENRICH AUDITEES
                    ======================================== */

                    const enrichedAuditees =
                        allAuditees.map(
                            (auditee) => ({
                                ...auditee,

                                departmentName:
                                    resolveDepartmentName(
                                        auditee,
                                        newDepartmentMap
                                    ),

                                roleName:
                                    resolveRoleName(
                                        auditee,
                                        roleMap
                                    ),
                            })
                        );

                    /* ========================================
                       10. SAME-DEPARTMENT AUDITEES
                    ======================================== */

                    const scopedAuditees =
                        enrichedAuditees.filter(
                            (auditee) =>
                                sameDepartment(
                                    auditee,
                                    profile,
                                    newDepartmentMap
                                )
                        );

                    console.log(
                        "SCOPED AUDITEES:",
                        scopedAuditees
                    );

                    setAuditees(
                        scopedAuditees
                    );

                    /* ========================================
                       11. LOAD EXISTING ASSIGNMENTS
                    ======================================== */

                    await fetchAssignments(
                        profile,
                        scopedAudits,
                        newDepartmentMap
                    );

                } catch (err) {

                    console.error(
                        "Failed to fetch audits/auditees:",
                        err
                    );

                    setAudits([]);
                    setAuditees([]);
                    setAssignments([]);

                    setError(true);

                } finally {

                    setLoading(false);
                }
            },
            [
                fetchCurrentProfile,
                fetchAssignments,
            ]
        );

    /* ========================================================
       FETCH AUDITEE WORKLOAD
    ======================================================== */

    const fetchAuditeeWorkloadData =
        useCallback(
            async (auditeeId) => {

                if (!auditeeId) {

                    setSelectedAuditeeId(null);
                    setAuditeeCommitments([]);
                    setAuditeeWorkload(0);
                    setAuditeeCommitmentError("");

                    return;
                }

                setSelectedAuditeeId(
                    auditeeId
                );

                setLoadingAuditeeCommitments(
                    true
                );

                setAuditeeCommitmentError("");

                try {

                    const [
                        commitmentsRes,
                        activeCommitmentsRes,
                        workloadRes,
                    ] =
                        await Promise.all([
                            getCommitmentsByAuditee(
                                auditeeId
                            ),

                            getActiveCommitmentsByAuditee(
                                auditeeId
                            ),

                            getAuditeeWorkload(
                                auditeeId
                            ),
                        ]);

                    const allCommitments =
                        extractArray(
                            commitmentsRes
                        );

                    const activeCommitments =
                        extractArray(
                            activeCommitmentsRes
                        );

                    let workload = 0;

                    if (
                        typeof workloadRes ===
                        "number"
                    ) {

                        workload =
                            workloadRes;

                    } else if (
                        typeof workloadRes ===
                        "string"
                    ) {

                        workload =
                            Number(
                                workloadRes
                            ) || 0;

                    } else if (
                        typeof workloadRes?.data ===
                        "number"
                    ) {

                        workload =
                            workloadRes.data;

                    } else if (
                        typeof workloadRes?.data?.data ===
                        "number"
                    ) {

                        workload =
                            workloadRes.data.data;
                    }

                    setAuditeeWorkload(
                        workload
                    );

                    setAuditeeCommitments(
                        activeCommitments.length >
                            0
                            ? activeCommitments
                            : allCommitments
                    );

                } catch (err) {

                    console.error(
                        "Failed to fetch auditee commitments:",
                        err
                    );

                    setAuditeeCommitments([]);
                    setAuditeeWorkload(0);

                    setAuditeeCommitmentError(
                        friendlyError(err)
                    );

                } finally {

                    setLoadingAuditeeCommitments(
                        false
                    );
                }
            },
            []
        );

    /* ========================================================
       INITIAL LOAD

       VERY IMPORTANT:
       [] means ONLY ONCE.
       This prevents API loop.
    ======================================================== */

    useEffect(() => {

        fetchDropdownData();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ========================================================
       FILTERED ASSIGNMENTS
    ======================================================== */

    const filteredAssignments =
        useMemo(() => {

            const q =
                safeString(search)
                    .trim()
                    .toLowerCase();

            return assignments.filter(
                (a) => {

                    const auditId =
                        safeString(
                            a.audit?.auditId
                        ).toLowerCase();

                    const auditName =
                        safeString(
                            a.audit?.auditName
                        ).toLowerCase();

                    const auditeeName =
                        safeString(
                            a.auditee?.name
                        ).toLowerCase();

                    const employeeId =
                        safeString(
                            a.auditee?.employeeId
                        ).toLowerCase();

                    const email =
                        safeString(
                            a.auditee?.email
                        ).toLowerCase();

                    const matchesSearch =
                        !q ||
                        auditId.includes(q) ||
                        auditName.includes(q) ||
                        auditeeName.includes(q) ||
                        employeeId.includes(q) ||
                        email.includes(q);

                    const matchesStatus =
                        statusFilter === "All" ||
                        !statusFilter ||
                        a.status ===
                            statusFilter;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );
        }, [
            assignments,
            search,
            statusFilter,
        ]);

    /* ========================================================
       OPEN ASSIGNMENT MODAL
       
       NO AUDIT = HARD STOP
    ======================================================== */

    const openAssignmentModal =
        useCallback(() => {

            if (
                !audits ||
                audits.length === 0
            ) {

                showToast(
                    "Cannot assign auditee. Audit has not been created for this risk.",
                    "error"
                );

                return;
            }

            setModalError("");

            setSelectedAuditeeId(null);

            setAuditeeCommitments([]);

            setAuditeeWorkload(0);

            setAuditeeCommitmentError("");

            setModalOpen(true);

        }, [
            audits,
            showToast,
        ]);

    /* ========================================================
       CLOSE MODAL
    ======================================================== */

    const closeAssignmentModal =
        useCallback(() => {

            if (submitting) {
                return;
            }

            setModalOpen(false);

            setModalError("");

            setSelectedAuditeeId(null);

            setAuditeeCommitments([]);

            setAuditeeWorkload(0);

            setAuditeeCommitmentError("");

        }, [submitting]);

    /* ========================================================
       AUDITEE CHANGE
    ======================================================== */

    const handleAuditeeChange =
        async (auditeeId) => {

            if (
                auditeeId === null ||
                auditeeId === undefined ||
                auditeeId === ""
            ) {

                await fetchAuditeeWorkloadData(
                    null
                );

                return;
            }

            await fetchAuditeeWorkloadData(
                Number(auditeeId)
            );
        };

    /* ========================================================
       ASSIGN AUDITEE
       
       NO AUDIT = DO NOT CALL BACKEND
    ======================================================== */

    const handleAssign =
        async (payload) => {

            /* ================================================
               HARD STOP 1
            ================================================ */

            if (
                !audits ||
                audits.length === 0
            ) {

                setModalError(
                    "Cannot assign auditee. Audit has not been created for this risk."
                );

                return;
            }

            /* ================================================
               PAYLOAD AUDIT ID
            ================================================ */

            const payloadAuditId =
                payload?.auditId ??
                payload?.audit ??
                payload?.auditDbId;

            if (
                payloadAuditId === null ||
                payloadAuditId === undefined ||
                payloadAuditId === ""
            ) {

                setModalError(
                    "Cannot assign auditee. Please select an audit."
                );

                return;
            }

            /* ================================================
               PAYLOAD AUDITEE ID
            ================================================ */

            const payloadAuditeeId =
                payload?.auditeeId ??
                payload?.auditee;

            if (
                payloadAuditeeId === null ||
                payloadAuditeeId === undefined ||
                payloadAuditeeId === ""
            ) {

                setModalError(
                    "Please select an auditee."
                );

                return;
            }

            /* ================================================
               FIND SELECTED AUDIT
            ================================================ */

            const selectedAudit =
                audits.find(
                    (audit) =>
                        String(
                            audit?.id
                        ) ===
                            String(
                                payloadAuditId
                            ) ||
                        String(
                            audit?.auditId
                        ) ===
                            String(
                                payloadAuditId
                            ) ||
                        String(
                            audit?.auditIdCode
                        ) ===
                            String(
                                payloadAuditId
                            )
                );

            /* ================================================
               HARD STOP 2
               AUDIT DOES NOT EXIST
            ================================================ */

            if (!selectedAudit) {

                setModalError(
                    "Cannot assign auditee. Audit has not been created for this risk."
                );

                return;
            }

            /* ================================================
               DEPARTMENT CHECK - AUDIT
            ================================================ */

            if (
                !auditBelongsToManagerDepartment(
                    selectedAudit,
                    currentUser,
                    departmentMap
                )
            ) {

                setModalError(
                    "You can only assign audits belonging to your department."
                );

                return;
            }

            /* ================================================
               FIND SELECTED AUDITEE
            ================================================ */

            const selectedAuditee =
                auditees.find(
                    (auditee) =>
                        String(
                            auditee?.id
                        ) ===
                        String(
                            payloadAuditeeId
                        )
                );

            /* ================================================
               HARD STOP 3
            ================================================ */

            if (!selectedAuditee) {

                setModalError(
                    "Selected auditee is not available."
                );

                return;
            }

            /* ================================================
               DEPARTMENT CHECK - AUDITEE
            ================================================ */

            if (
                !sameDepartment(
                    selectedAuditee,
                    currentUser,
                    departmentMap
                )
            ) {

                setModalError(
                    "You can only assign auditees belonging to your department."
                );

                return;
            }

            /* ================================================
               SUBMIT
            ================================================ */

            setSubmitting(true);

            setModalError("");

            try {

                await auditeeAssignmentService.assignAuditee(
                    payload
                );

                /* ============================================
                   SUCCESS
                ============================================ */

                setModalOpen(false);

                setSelectedAuditeeId(null);

                setAuditeeCommitments([]);

                setAuditeeWorkload(0);

                showToast(
                    "Auditee assigned successfully."
                );

                /* ============================================
                   REFRESH ASSIGNMENTS ONLY
                   No useEffect involved.
                ============================================ */

                await fetchAssignments(
                    currentUser,
                    audits,
                    departmentMap
                );

            } catch (err) {

                console.error(
                    "Assign auditee failed:",
                    err
                );

                setModalError(
                    friendlyError(err)
                );

            } finally {

                setSubmitting(false);
            }
        };

    /* ========================================================
       STATUS CHANGE
    ======================================================== */

    const handleStatusChange =
        async (
            id,
            status
        ) => {

            try {

                setLoading(true);

                await auditeeAssignmentService.updateStatus(
                    id,
                    status
                );

                showToast(
                    `Status changed to ${safeString(
                        status
                    ).replaceAll(
                        "_",
                        " "
                    )}`
                );

                await fetchAssignments(
                    currentUser,
                    audits,
                    departmentMap
                );

            } catch (err) {

                console.error(
                    "STATUS UPDATE FAILED:",
                    err
                );

                showToast(
                    friendlyError(err),
                    "error"
                );

            } finally {

                setLoading(false);
            }
        };

    /* ========================================================
       DELETE
    ======================================================== */

    const handleDeleteConfirmed =
        async () => {

            if (!deleteTarget) {
                return;
            }

            try {

                await auditeeAssignmentService
                    .deleteAssignment(
                        deleteTarget.id
                    );

                showToast(
                    "Assignment deleted."
                );

                setDeleteTarget(null);

                await fetchAssignments(
                    currentUser,
                    audits,
                    departmentMap
                );

            } catch (err) {

                console.error(
                    "Delete assignment failed:",
                    err
                );

                showToast(
                    friendlyError(err),
                    "error"
                );

                setDeleteTarget(null);
            }
        };

    /* ========================================================
       SELECTED AUDITEE
    ======================================================== */

    const selectedAuditee =
        useMemo(() => {

            if (!selectedAuditeeId) {
                return null;
            }

            return (
                auditees.find(
                    (auditee) =>
                        Number(
                            auditee?.id
                        ) ===
                        Number(
                            selectedAuditeeId
                        )
                ) || null
            );

        }, [
            auditees,
            selectedAuditeeId,
        ]);

    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <motion.div
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
            }}
            transition={{
                duration: 0.35,
            }}
            className="min-h-full bg-gray-50 px-4 sm:px-6 lg:px-8 py-6 space-y-6"
        >

            {/* ==================================================
                TOAST
            ================================================== */}

            <AnimatePresence>
                {toast && (
                    <Toast
                        toast={toast}
                        onClose={() =>
                            setToast(null)
                        }
                    />
                )}
            </AnimatePresence>

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div>

                    <h1 className="text-xl font-semibold text-gray-900">
                        Auditee Assignment
                    </h1>

                    <p className="text-sm text-gray-500 mt-0.5">
                        Assign auditees to audits and manage
                        their audit responsibilities.
                    </p>

                    {managerDepartmentName && (
                        <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-teal-50 border border-teal-100 px-3 py-1.5 text-xs font-medium text-teal-700">

                            <span>
                                Department:
                            </span>

                            <span className="font-semibold">
                                {
                                    managerDepartmentName
                                }
                            </span>

                        </div>
                    )}

                </div>

                <button
                    onClick={
                        openAssignmentModal
                    }
                    disabled={
                        !currentUser ||
                        (
                            !managerDepartmentId &&
                            !managerDepartmentName
                        ) ||
                        audits.length === 0
                    }
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >

                    <Plus className="w-4 h-4" />

                    {audits.length === 0
                        ? "No Audit Available"
                        : "Assign Auditee"}

                </button>

            </div>

            {/* ==================================================
                DEPARTMENT ERROR
            ================================================== */}

            {departmentError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">

                    <AlertCircle className="w-4 h-4 shrink-0" />

                    <span>
                        {departmentError}
                    </span>

                </div>
            )}

            {/* ==================================================
                NO AUDIT MESSAGE
            ================================================== */}

            {currentUser &&
                !departmentError &&
                !loading &&
                audits.length === 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">

                        <AlertCircle className="w-4 h-4 shrink-0" />

                        <span>
                            Cannot assign auditee. Audit has not
                            been created for this risk.
                        </span>

                    </div>
                )}

            {/* ==================================================
                SEARCH + FILTER
            ================================================== */}

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">

                <div className="flex flex-col lg:flex-row lg:items-center gap-3">

                    <div className="relative flex-1">

                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Search by audit ID, name, auditee, employee ID, or email..."
                            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition"
                        />

                    </div>

                    <div className="relative lg:w-52">

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                            className="w-full appearance-none px-4 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 font-medium outline-none cursor-pointer focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
                        >

                            {STATUS_FILTER_OPTIONS.map(
                                (status) => (
                                    <option
                                        key={
                                            status
                                        }
                                        value={
                                            status
                                        }
                                    >
                                        {status ===
                                        "All"
                                            ? "All Status"
                                            : status.replaceAll(
                                                  "_",
                                                  " "
                                              )}
                                    </option>
                                )
                            )}

                        </select>

                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />

                    </div>

                </div>

            </div>

            {/* ==================================================
                TABLE
            ================================================== */}

            <AuditeeAssignmentTable
                assignments={
                    filteredAssignments
                }
                loading={loading}
                error={error}
                onRetry={
                    fetchDropdownData
                }
                onView={
                    setViewAssignment
                }
                onDelete={
                    setDeleteTarget
                }
                onStatusChange={
                    handleStatusChange
                }
                onAssignClick={
                    openAssignmentModal
                }
            />

            {/* ==================================================
                ASSIGN MODAL
            ================================================== */}

            <AuditeeAssignmentModal
                open={modalOpen}
                onClose={
                    closeAssignmentModal
                }
                onSubmit={
                    handleAssign
                }
                audits={audits}
                auditees={auditees}
                submitting={submitting}
                apiError={modalError}
                selectedAuditeeId={
                    selectedAuditeeId
                }
                selectedAuditee={
                    selectedAuditee
                }
                auditeeCommitments={
                    auditeeCommitments
                }
                auditeeWorkload={
                    auditeeWorkload
                }
                loadingAuditeeCommitments={
                    loadingAuditeeCommitments
                }
                auditeeCommitmentError={
                    auditeeCommitmentError
                }
                onAuditeeChange={
                    handleAuditeeChange
                }
            />

            {/* ==================================================
                VIEW DETAILS
            ================================================== */}

            <AnimatePresence>
                {viewAssignment && (
                    <>
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
                            onClick={() =>
                                setViewAssignment(
                                    null
                                )
                            }
                            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
                        />

                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                            <motion.div
                                initial={{
                                    opacity: 0,
                                    scale: 0.96,
                                    y: 12,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.96,
                                    y: 8,
                                }}
                                className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
                            >

                                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">

                                    <h2 className="text-sm font-semibold text-gray-900">
                                        Assignment Details
                                    </h2>

                                    <button
                                        onClick={() =>
                                            setViewAssignment(
                                                null
                                            )
                                        }
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>

                                </div>

                                <div className="px-5 py-4 space-y-3 text-sm">

                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-500">
                                            Audit ID
                                        </span>

                                        <span className="text-gray-900 font-medium text-right">
                                            {
                                                viewAssignment
                                                    .audit
                                                    ?.auditId ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-500">
                                            Audit Name
                                        </span>

                                        <span className="text-gray-900 font-medium text-right">
                                            {
                                                viewAssignment
                                                    .audit
                                                    ?.auditName ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-500">
                                            Department
                                        </span>

                                        <span className="text-gray-900 font-medium text-right">
                                            {
                                                managerDepartmentName ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-500">
                                            Auditee
                                        </span>

                                        <span className="text-gray-900 font-medium text-right">
                                            {
                                                viewAssignment
                                                    .auditee
                                                    ?.name ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-500">
                                            Employee ID
                                        </span>

                                        <span className="text-gray-900 font-medium text-right">
                                            {
                                                viewAssignment
                                                    .auditee
                                                    ?.employeeId ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-500">
                                            Email
                                        </span>

                                        <span className="text-gray-900 font-medium text-right break-all">
                                            {
                                                viewAssignment
                                                    .auditee
                                                    ?.email ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-500">
                                            Assigned By
                                        </span>

                                        <span className="text-gray-900 font-medium text-right">
                                            {
                                                viewAssignment
                                                    .assignedBy
                                                    ?.name ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Assigned Date
                                        </span>

                                        <span className="text-gray-900 font-medium">
                                            {
                                                viewAssignment.assignedDate ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Start Date
                                        </span>

                                        <span className="text-gray-900 font-medium">
                                            {
                                                viewAssignment.startDate ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Due Date
                                        </span>

                                        <span className="text-gray-900 font-medium">
                                            {
                                                viewAssignment.dueDate ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">

                                        <span className="text-gray-500">
                                            Status
                                        </span>

                                        <AuditeeAssignmentStatusBadge
                                            status={
                                                viewAssignment.status
                                            }
                                        />

                                    </div>

                                </div>

                            </motion.div>

                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* ==================================================
                DELETE CONFIRMATION
            ================================================== */}

            <AnimatePresence>
                {deleteTarget && (
                    <>
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
                            onClick={() =>
                                setDeleteTarget(
                                    null
                                )
                            }
                            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
                        />

                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                            <motion.div
                                initial={{
                                    opacity: 0,
                                    scale: 0.96,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.96,
                                }}
                                className="w-full max-w-sm bg-white border border-gray-100 rounded-2xl shadow-2xl p-5"
                            >

                                <h3 className="text-sm font-semibold text-gray-900">
                                    Delete Assignment
                                </h3>

                                <p className="text-sm text-gray-500 mt-2">

                                    Are you sure you want
                                    to delete the assignment
                                    for{" "}

                                    <span className="text-gray-900 font-medium">
                                        {
                                            deleteTarget
                                                .auditee
                                                ?.name
                                        }
                                    </span>{" "}

                                    on{" "}

                                    <span className="text-gray-900 font-medium">
                                        {
                                            deleteTarget
                                                .audit
                                                ?.auditId
                                        }
                                    </span>

                                    ? This action cannot
                                    be undone.

                                </p>

                                <div className="flex justify-end gap-2 mt-5">

                                    <button
                                        onClick={() =>
                                            setDeleteTarget(
                                                null
                                            )
                                        }
                                        className="px-4 py-2 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-100 transition"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={
                                            handleDeleteConfirmed
                                        }
                                        className="px-4 py-2 text-sm font-medium rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </motion.div>

                        </div>
                    </>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default AuditeeAssignment;