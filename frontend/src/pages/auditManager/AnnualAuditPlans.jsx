import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    motion,
    AnimatePresence,
} from "framer-motion";

import {
    Plus,
    Search,
    RefreshCw,
    Edit3,
    Trash2,
    Eye,
    X,
    CalendarDays,
    FileText,
    ShieldAlert,
    UserRound,
    Building2,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Loader2,
    Send,
    CheckCircle2,
    XCircle,
    Clock3,
} from "lucide-react";

import {
    createPlan,
    updatePlan,
    getAllPlans,
    deletePlan,
    updatePlanStatus,
} from "../../service/annualAuditPlanService";

import RiskService from "../../service/RiskService";
import { getProfile } from "../../service/AuthService";

// ============================================================
// STATUS
// ============================================================

const STATUS_OPTIONS = [
    "DRAFT",
    "SUBMITTED",
    "APPROVED",
    "REJECTED",
    "IN_PROGRESS",
    "COMPLETED",
];

// ============================================================
// EMPTY FORM
// ============================================================

const emptyForm = {
    planName: "",
    description: "",
    auditYear: new Date().getFullYear(),
    plannedStartDate: "",
    plannedEndDate: "",
    department: "",
    businessUnit: "",
    processName: "",
    riskId: "",
    status: "DRAFT",
    remarks: "",
};

// ============================================================
// SAFE ARRAY NORMALIZER
// ============================================================

const normalizeArray = (response) => {
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

    if (Array.isArray(response?.result)) {
        return response.result;
    }

    if (Array.isArray(response?.data?.result)) {
        return response.data.result;
    }

    return [];
};

// ============================================================
// STATUS HELPERS
// ============================================================

const normalizeStatus = (status) => {
    return String(status || "DRAFT")
        .trim()
        .toUpperCase();
};

const getStatusLabel = (status) => {
    switch (normalizeStatus(status)) {
        case "DRAFT":
            return "Draft";

        case "SUBMITTED":
            return "Submitted for Approval";

        case "APPROVED":
            return "Approved";

        case "REJECTED":
            return "Rejected";

        case "IN_PROGRESS":
            return "In Progress";

        case "COMPLETED":
            return "Completed";

        default:
            return String(status || "Unknown")
                .replaceAll("_", " ");
    }
};

// ============================================================
// STATUS STYLE
// ============================================================

const getStatusStyle = (status) => {
    switch (normalizeStatus(status)) {
        case "DRAFT":
            return "bg-slate-100 text-slate-700 border-slate-200";

        case "SUBMITTED":
            return "bg-blue-50 text-blue-700 border-blue-200";

        case "APPROVED":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";

        case "REJECTED":
            return "bg-red-50 text-red-700 border-red-200";

        case "IN_PROGRESS":
            return "bg-cyan-50 text-cyan-700 border-cyan-200";

        case "COMPLETED":
            return "bg-green-50 text-green-700 border-green-200";

        default:
            return "bg-gray-100 text-gray-700 border-gray-200";
    }
};

// ============================================================
// WORKFLOW PERMISSIONS
// ============================================================

const canEditPlan = (plan) => {
    return normalizeStatus(plan?.status) === "DRAFT";
};

const canDeletePlan = (plan) => {
    return normalizeStatus(plan?.status) === "DRAFT";
};

const canSubmitPlan = (plan) => {
    return normalizeStatus(plan?.status) === "DRAFT";
};

// ============================================================
// GET STORED USER
// ============================================================

const getStoredUser = () => {
    try {
        const currentUser =
            localStorage.getItem("currentUser");

        if (
            currentUser &&
            currentUser !== "null" &&
            currentUser !== "undefined"
        ) {
            return JSON.parse(currentUser);
        }

        const user =
            localStorage.getItem("user");

        if (
            user &&
            user !== "null" &&
            user !== "undefined"
        ) {
            return JSON.parse(user);
        }

        return null;
    } catch (error) {
        console.error(
            "Failed to read stored user:",
            error
        );

        return null;
    }
};

// ============================================================
// ENTITY HELPERS
// ============================================================

const getEntityId = (entity) => {
    if (
        entity === null ||
        entity === undefined
    ) {
        return null;
    }

    if (typeof entity === "object") {
        return (
            entity.id ??
            entity.departmentId ??
            entity.roleId ??
            null
        );
    }

    return entity;
};

const getEntityName = (entity) => {
    if (
        entity === null ||
        entity === undefined
    ) {
        return "";
    }

    if (typeof entity === "object") {
        return (
            entity.name ??
            entity.departmentName ??
            entity.roleName ??
            ""
        );
    }

    return String(entity);
};

const normalizeDepartment = (
    department
) => {
    if (!department) {
        return null;
    }

    if (typeof department === "object") {
        const id =
            getEntityId(department);

        if (
            id === null ||
            id === undefined ||
            id === ""
        ) {
            return null;
        }

        return {
            id,
            name:
                getEntityName(department),
            active:
                department.active ??
                true,
        };
    }

    return {
        id: department,
        name: String(department),
        active: true,
    };
};

const getDepartmentLabel = (
    department
) => {
    if (!department) {
        return "-";
    }

    const name =
        getEntityName(department);

    if (name) {
        return String(name)
            .replaceAll("_", " ");
    }

    return String(department)
        .replaceAll("_", " ");
};

// ============================================================
// RISK HELPERS
// ============================================================

const getRiskDatabaseId = (
    risk
) => {
    if (!risk) {
        return null;
    }

    return (
        risk.id ??
        risk.riskDatabaseId ??
        risk.riskDbId ??
        null
    );
};

const getRiskCode = (risk) => {
    if (!risk) {
        return "UNKNOWN";
    }

    return (
        risk.riskId ||
        risk.riskCode ||
        (risk.id != null
            ? `RISK-${risk.id}`
            : "UNKNOWN")
    );
};

const getRiskTitle = (risk) => {
    if (!risk) {
        return "Untitled Risk";
    }

    return (
        risk.title ||
        risk.name ||
        risk.riskTitle ||
        risk.description ||
        "Untitled Risk"
    );
};

const getPlanRiskIds = (
    plan
) => {
    if (!plan) {
        return [];
    }

    if (
        Array.isArray(plan.riskIds)
    ) {
        return plan.riskIds;
    }

    if (
        plan.riskId !== undefined &&
        plan.riskId !== null
    ) {
        return [plan.riskId];
    }

    if (
        Array.isArray(plan.risks)
    ) {
        return plan.risks
            .map((risk) =>
                typeof risk === "object"
                    ? getRiskDatabaseId(
                          risk
                      )
                    : risk
            )
            .filter(
                (id) =>
                    id !== null &&
                    id !== undefined
            );
    }

    return [];
};

const getRiskDisplayName = (
    risk
) => {
    if (!risk) {
        return "Unknown Risk";
    }

    return `${getRiskCode(
        risk
    )} — ${getRiskTitle(risk)}`;
};

// ============================================================
// PLAN HELPERS
// ============================================================

const getPlanYear = (plan) => {
    return (
        plan?.planYear ??
        plan?.auditYear ??
        "-"
    );
};

const getPlanDatabaseId = (
    plan
) => {
    return (
        plan?.id ??
        plan?.planDatabaseId ??
        plan?.planId ??
        null
    );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AnnualAuditPlans() {
    // ========================================================
    // USER
    // ========================================================

    const [
        currentUser,
        setCurrentUser,
    ] = useState(
        getStoredUser()
    );

    const [
        managerDepartment,
        setManagerDepartment,
    ] = useState(null);

    // ========================================================
    // PLANS
    // ========================================================

    const [
        plans,
        setPlans,
    ] = useState([]);

    // ========================================================
    // RISKS
    // ========================================================

    const [
        risks,
        setRisks,
    ] = useState([]);

    const [
        loadingRisks,
        setLoadingRisks,
    ] = useState(false);

    // ========================================================
    // LOADING
    // ========================================================

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);

    // ========================================================
    // MESSAGES
    // ========================================================

    const [
        error,
        setError,
    ] = useState("");

    const [
        success,
        setSuccess,
    ] = useState("");

    // ========================================================
    // FILTERS
    // ========================================================

    const [
        search,
        setSearch,
    ] = useState("");

    const [
        statusFilter,
        setStatusFilter,
    ] = useState("ALL");

    const [
        yearFilter,
        setYearFilter,
    ] = useState("ALL");

    // ========================================================
    // MODALS
    // ========================================================

    const [
        showModal,
        setShowModal,
    ] = useState(false);

    const [
        showDetails,
        setShowDetails,
    ] = useState(false);

    const [
        selectedPlan,
        setSelectedPlan,
    ] = useState(null);

    const [
        editingId,
        setEditingId,
    ] = useState(null);

    // ========================================================
    // FORM
    // ========================================================

    const [
        form,
        setForm,
    ] = useState(emptyForm);

    // ========================================================
    // PAGINATION
    // ========================================================

    const [
        currentPage,
        setCurrentPage,
    ] = useState(1);

    const ITEMS_PER_PAGE = 8;

    // ============================================================
    // LOAD CURRENT USER
    // ============================================================

    useEffect(() => {
        const loadCurrentUser =
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const response =
                        await getProfile();

                    console.log(
                        "RAW PROFILE:",
                        response
                    );

                    const profile =
                        response?.data?.data ??
                        response?.data ??
                        response;

                    console.log(
                        "NORMALIZED PROFILE:",
                        profile
                    );

                    const roleEntity =
                        profile?.role ??
                        profile?.user?.role ??
                        null;

                    const roleName =
                        typeof roleEntity ===
                        "object"
                            ? roleEntity?.name
                            : roleEntity;

                    console.log(
                        "CURRENT USER ROLE:",
                        roleName
                    );

                    if (
                        String(
                            roleName || ""
                        )
                            .trim()
                            .toUpperCase() !==
                        "AUDIT_MANAGER"
                    ) {
                        setError(
                            "Only Audit Manager can access Annual Audit Plans."
                        );

                        return;
                    }

                    const departmentEntity =
                        profile?.department ??
                        profile?.user
                            ?.department ??
                        null;

                    console.log(
                        "CURRENT USER DEPARTMENT:",
                        departmentEntity
                    );

                    if (
                        !departmentEntity?.id
                    ) {
                        setError(
                            "Audit Manager department is not available."
                        );

                        return;
                    }

                    const normalizedUser =
                        {
                            ...profile,

                            role:
                                roleEntity,

                            department: {
                                id: Number(
                                    departmentEntity.id
                                ),

                                name:
                                    departmentEntity.name ||
                                    "",

                                active:
                                    departmentEntity.active ??
                                    true,
                            },
                        };

                    setCurrentUser(
                        normalizedUser
                    );

                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            normalizedUser
                        )
                    );

                    localStorage.setItem(
                        "currentUser",
                        JSON.stringify(
                            normalizedUser
                        )
                    );

                    const normalizedDepartment =
                        {
                            id: Number(
                                departmentEntity.id
                            ),

                            name:
                                departmentEntity.name ||
                                "",

                            active:
                                departmentEntity.active ??
                                true,
                        };

                    setManagerDepartment(
                        normalizedDepartment
                    );

                    setForm(
                        (prev) => ({
                            ...prev,
                            department:
                                Number(
                                    departmentEntity.id
                                ),
                        })
                    );
                } catch (err) {
                    console.error(
                        "Failed to load current user profile:",
                        err
                    );

                    if (
                        err?.response
                            ?.status === 401
                    ) {
                        setError(
                            "Your session has expired. Please login again."
                        );
                    } else if (
                        err?.response
                            ?.status === 403
                    ) {
                        setError(
                            "You do not have permission to access Annual Audit Plans."
                        );
                    } else {
                        setError(
                            err?.response
                                ?.data
                                ?.message ||
                                "Failed to load current user profile."
                        );
                    }
                } finally {
                    setLoading(false);
                }
            };

        loadCurrentUser();
    }, []);

    // ============================================================
    // LOAD PLANS
    // ============================================================

    const loadPlans =
        async () => {
            try {
                setLoading(true);
                setError("");

                const response =
                    await getAllPlans();

                console.log(
                    "ANNUAL AUDIT PLANS RAW RESPONSE:",
                    response
                );

                const data =
                    normalizeArray(
                        response
                    );

                console.log(
                    "NORMALIZED ANNUAL PLANS:",
                    data
                );

                setPlans(data);
            } catch (err) {
                console.error(
                    "Failed to load annual audit plans:",
                    err
                );

                setError(
                    err?.response
                        ?.data?.message ||
                        err?.response
                            ?.data?.error ||
                        "Failed to load annual audit plans."
                );

                setPlans([]);
            } finally {
                setLoading(false);
            }
        };

    // ============================================================
    // LOAD RISKS
    // ============================================================

    const loadRisks =
        async () => {
            if (!managerDepartment) {
                return;
            }

            try {
                setLoadingRisks(true);

                const response =
                    await RiskService.getAllRisks();

                console.log(
                    "RISKS RAW RESPONSE:",
                    response
                );

                const data =
                    normalizeArray(
                        response
                    );

                const departmentRisks =
                    data.filter(
                        (risk) => {
                            const riskDepartment =
                                normalizeDepartment(
                                    risk?.department ||
                                        risk?.departmentName ||
                                        risk?.riskDepartment ||
                                        ""
                                );

                            return (
                                String(
                                    getEntityId(
                                        riskDepartment
                                    )
                                ) ===
                                String(
                                    getEntityId(
                                        managerDepartment
                                    )
                                )
                            );
                        }
                    );

                console.log(
                    "DEPARTMENT RISKS:",
                    departmentRisks
                );

                setRisks(
                    departmentRisks
                );
            } catch (err) {
                console.error(
                    "Failed to load risks:",
                    err
                );

                setRisks([]);

                setError(
                    err?.response
                        ?.data?.message ||
                        err?.response
                            ?.data?.error ||
                        "Failed to load risks."
                );
            } finally {
                setLoadingRisks(false);
            }
        };

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {
        if (!managerDepartment) {
            return;
        }

        loadPlans();
        loadRisks();
    }, [managerDepartment]);

    // ============================================================
    // FORM HANDLER
    // ============================================================

    const handleChange =
        (e) => {
            const {
                name,
                value,
            } = e.target;

            setForm(
                (prev) => ({
                    ...prev,
                    [name]: value,
                })
            );

            setError("");
        };

    // ============================================================
    // OPEN CREATE
    // ============================================================

    const openCreateModal =
        async () => {
            setEditingId(null);
            setSelectedPlan(null);

            setForm({
                ...emptyForm,

                auditYear:
                    new Date().getFullYear(),

                department:
                    getEntityId(
                        managerDepartment
                    ),

                // ALWAYS DRAFT
                status: "DRAFT",
            });

            setError("");
            setSuccess("");

            setShowModal(true);

            await loadRisks();
        };

    // ============================================================
    // OPEN EDIT
    // ONLY DRAFT CAN BE EDITED
    // ============================================================

    const openEditModal =
        async (plan) => {
            try {
                const currentStatus =
                    normalizeStatus(
                        plan?.status
                    );

                if (
                    currentStatus !==
                    "DRAFT"
                ) {
                    setError(
                        "Only Draft plans can be edited. Status is controlled by the audit workflow."
                    );

                    return;
                }

                const planId =
                    getPlanDatabaseId(
                        plan
                    );

                if (
                    planId === null ||
                    planId === undefined
                ) {
                    setError(
                        "Unable to edit plan: Plan ID is missing."
                    );

                    return;
                }

                const planName =
                    plan?.planName ??
                    plan?.name ??
                    "";

                const description =
                    plan?.description ??
                    "";

                const auditYear =
                    plan?.auditYear ??
                    plan?.planYear ??
                    new Date().getFullYear();

                const rawStartDate =
                    plan?.plannedStartDate ??
                    plan?.startDate ??
                    plan?.planned_start_date ??
                    plan?.auditStartDate ??
                    "";

                const rawEndDate =
                    plan?.plannedEndDate ??
                    plan?.endDate ??
                    plan?.planned_end_date ??
                    plan?.auditEndDate ??
                    "";

                const plannedStartDate =
                    rawStartDate
                        ? String(
                              rawStartDate
                          ).substring(
                              0,
                              10
                          )
                        : "";

                const plannedEndDate =
                    rawEndDate
                        ? String(
                              rawEndDate
                          ).substring(
                              0,
                              10
                          )
                        : "";

                const department =
                    getEntityId(
                        managerDepartment
                    ) ??
                    getEntityId(
                        normalizeDepartment(
                            plan?.department ??
                                plan?.departmentName ??
                                ""
                        )
                    ) ??
                    "";

                const businessUnit =
                    plan?.businessUnit ??
                    plan?.businessUnitName ??
                    plan?.business_unit ??
                    plan?.unit ??
                    "";

                const processName =
                    plan?.processName ??
                    plan?.process ??
                    plan?.process_name ??
                    "";

                const riskIds =
                    getPlanRiskIds(
                        plan
                    );

                const riskId =
                    riskIds.length > 0
                        ? String(
                              riskIds[0]
                          )
                        : "";

                const remarks =
                    plan?.remarks ??
                    "";

                setEditingId(
                    planId
                );

                setSelectedPlan(
                    plan
                );

                setForm({
                    planName,
                    description,
                    auditYear,
                    plannedStartDate,
                    plannedEndDate,
                    department,
                    businessUnit,
                    processName,
                    riskId,

                    // KEEP DRAFT
                    status: "DRAFT",

                    remarks,
                });

                setError("");
                setSuccess("");

                setShowModal(true);

                await loadRisks();
            } catch (err) {
                console.error(
                    "Failed to open edit annual audit plan:",
                    err
                );

                setError(
                    "Failed to load annual audit plan details."
                );
            }
        };

    // ============================================================
    // VALIDATION
    // ============================================================

    const validateForm =
        () => {
            if (
                !form.planName.trim()
            ) {
                return "Plan name is required.";
            }

            if (!form.auditYear) {
                return "Audit year is required.";
            }

            if (
                !form.plannedStartDate
            ) {
                return "Planned start date is required.";
            }

            if (
                !form.plannedEndDate
            ) {
                return "Planned end date is required.";
            }

            if (
                new Date(
                    form.plannedEndDate
                ) <
                new Date(
                    form.plannedStartDate
                )
            ) {
                return "End date cannot be before start date.";
            }

            if (
                !getEntityId(
                    managerDepartment
                )
            ) {
                return "Manager department is not available.";
            }

            if (
                String(form.department) !==
                String(
                    getEntityId(
                        managerDepartment
                    )
                )
            ) {
                return "You can only create an audit plan for your own department.";
            }

            if (
                !form.businessUnit.trim()
            ) {
                return "Business unit is required.";
            }

            if (
                !form.processName.trim()
            ) {
                return "Process name is required.";
            }

            if (!form.riskId) {
                return "Please select a risk.";
            }

            const selectedRisk =
                risks.find(
                    (risk) =>
                        String(
                            getRiskDatabaseId(
                                risk
                            )
                        ) ===
                        String(
                            form.riskId
                        )
                );

            if (!selectedRisk) {
                return "Selected risk does not belong to your department.";
            }

            const selectedRiskDepartment =
                normalizeDepartment(
                    selectedRisk?.department ||
                        selectedRisk?.departmentName ||
                        selectedRisk?.riskDepartment ||
                        ""
                );

            if (
                String(
                    getEntityId(
                        selectedRiskDepartment
                    )
                ) !==
                String(
                    getEntityId(
                        managerDepartment
                    )
                )
            ) {
                return "You can only select risks from your department.";
            }

            return null;
        };

    // ============================================================
    // CREATE / UPDATE
    //
    // IMPORTANT:
    // Audit Manager NEVER sends arbitrary status.
    //
    // CREATE  -> DRAFT
    // UPDATE  -> DRAFT only
    // ============================================================

    const handleSubmit =
        async (e) => {
            e.preventDefault();

            const validationError =
                validateForm();

            if (validationError) {
                setError(
                    validationError
                );

                return;
            }

            // Existing plan must still be DRAFT
            if (
                editingId !== null &&
                normalizeStatus(
                    selectedPlan?.status
                ) !== "DRAFT"
            ) {
                setError(
                    "Only Draft plans can be updated."
                );

                return;
            }

            try {
                setSaving(true);
                setError("");
                setSuccess("");

                const selectedRisk =
                    risks.find(
                        (risk) =>
                            String(
                                getRiskDatabaseId(
                                    risk
                                )
                            ) ===
                            String(
                                form.riskId
                            )
                    );

                if (!selectedRisk) {
                    setError(
                        "Invalid risk selected."
                    );

                    return;
                }

                const riskDepartment =
                    normalizeDepartment(
                        selectedRisk?.department ||
                            selectedRisk?.departmentName ||
                            selectedRisk?.riskDepartment ||
                            ""
                    );

                if (
                    String(
                        getEntityId(
                            riskDepartment
                        )
                    ) !==
                    String(
                        getEntityId(
                            managerDepartment
                        )
                    )
                ) {
                    setError(
                        "You cannot select a risk outside your department."
                    );

                    return;
                }

                // ==================================================
                // FINAL PAYLOAD
                // ==================================================

                const payload = {
                    planName:
                        form.planName.trim(),

                    description:
                        form.description.trim(),

                    auditYear:
                        Number(
                            form.auditYear
                        ),

                    plannedStartDate:
                        form.plannedStartDate,

                    plannedEndDate:
                        form.plannedEndDate,

                    department: {
                        id: Number(
                            getEntityId(
                                managerDepartment
                            )
                        ),
                    },

                    businessUnit:
                        form.businessUnit.trim(),

                    processName:
                        form.processName.trim(),

                    riskId:
                        Number(
                            form.riskId
                        ),

                    // ==========================================
                    // CRITICAL
                    // Audit Manager cannot change workflow status
                    // ==========================================
                    status: "DRAFT",

                    remarks:
                        form.remarks.trim(),
                };

                console.log(
                    "ANNUAL AUDIT PLAN PAYLOAD:",
                    payload
                );

                if (
                    editingId !== null
                ) {
                    await updatePlan(
                        editingId,
                        payload
                    );

                    setSuccess(
                        "Annual audit plan updated successfully."
                    );
                } else {
                    await createPlan(
                        payload
                    );

                    setSuccess(
                        "Annual audit plan created successfully as Draft."
                    );
                }

                setShowModal(false);

                await loadPlans();
            } catch (err) {
                console.error(
                    "Annual audit plan save error:",
                    err
                );

                setError(
                    err?.response
                        ?.data?.message ||
                        err?.response
                            ?.data?.error ||
                        "Failed to save annual audit plan."
                );
            } finally {
                setSaving(false);
            }
        };

    // ============================================================
    // SUBMIT FOR CAE APPROVAL
    //
    // ONLY:
    // DRAFT -> SUBMITTED
    //
    // ============================================================

    const handleSubmitForApproval =
        async (plan) => {
            const planId =
                getPlanDatabaseId(
                    plan
                );

            if (
                planId === null ||
                planId === undefined
            ) {
                setError(
                    "Unable to submit plan: Plan ID is missing."
                );

                return;
            }

            const currentStatus =
                normalizeStatus(
                    plan?.status
                );

            if (
                currentStatus !==
                "DRAFT"
            ) {
                setError(
                    `This plan cannot be submitted because it is already ${getStatusLabel(
                        currentStatus
                    )}.`
                );

                return;
            }

            const confirmed =
                window.confirm(
                    "Are you sure you want to submit this annual audit plan for CAE approval?"
                );

            if (!confirmed) {
                return;
            }

            try {
                setSaving(true);
                setError("");
                setSuccess("");

                const planRiskIds =
                    getPlanRiskIds(
                        plan
                    );

                const firstRiskId =
                    planRiskIds.length >
                    0
                        ? planRiskIds[0]
                        : null;

                if (!firstRiskId) {
                    setError(
                        "This plan does not have a valid risk assigned."
                    );

                    return;
                }

                const departmentId =
                    getEntityId(
                        normalizeDepartment(
                            plan?.department
                        )
                    ) ??
                    getEntityId(
                        managerDepartment
                    );

                const payload = {
                    planName:
                        plan?.planName ||
                        plan?.name ||
                        "",

                    description:
                        plan?.description ||
                        "",

                    auditYear:
                        Number(
                            getPlanYear(
                                plan
                            )
                        ),

                    plannedStartDate:
                        plan?.plannedStartDate ||
                        plan?.startDate ||
                        "",

                    plannedEndDate:
                        plan?.plannedEndDate ||
                        plan?.endDate ||
                        "",

                    department: {
                        id: Number(
                            departmentId
                        ),
                    },

                    businessUnit:
                        plan?.businessUnit ||
                        "",

                    processName:
                        plan?.processName ||
                        "",

                    riskId:
                        Number(
                            firstRiskId
                        ),

                    // ==========================================
                    // ONLY ALLOWED MANAGER TRANSITION
                    // ==========================================
                    status: "SUBMITTED",

                    remarks:
                        plan?.remarks ||
                        "",
                };

                console.log(
                    "SUBMIT FOR CAE PAYLOAD:",
                    payload
                );

                await updatePlan(
                    planId,
                    payload
                );

                setSuccess(
                    "Annual audit plan submitted successfully for CAE approval."
                );

                await loadPlans();
            } catch (err) {
                console.error(
                    "Submit annual audit plan error:",
                    err
                );

                setError(
                    err?.response
                        ?.data?.message ||
                        err?.response
                            ?.data?.error ||
                        "Failed to submit annual audit plan for approval."
                );
            } finally {
                setSaving(false);
            }
        };

    // ============================================================
    // START AUDIT
    // ONLY APPROVED -> IN_PROGRESS
    // Audit Manager action after CAE approval
    // ============================================================

    const handleStartAudit = async (plan) => {
        const planId = getPlanDatabaseId(plan);

        if (planId === null || planId === undefined) {
            setError("Unable to start audit: Plan ID is missing.");
            return;
        }

        const currentStatus = normalizeStatus(plan?.status);

        if (currentStatus !== "APPROVED") {
            setError("Only CAE-approved plans can be started.");
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to start this annual audit plan?\n\nThe status will change from Approved to In Progress."
        );

        if (!confirmed) {
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            console.log(
                "START AUDIT:",
                { planId, status: "IN_PROGRESS" }
            );

            await updatePlanStatus(
                planId,
                "IN_PROGRESS"
            );

            setSuccess(
                "Annual audit plan started successfully. Status changed to In Progress."
            );

            await loadPlans();
        } catch (err) {
            console.error(
                "Start annual audit plan error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Failed to start annual audit plan."
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // DELETE
    // ONLY DRAFT
    // ============================================================

    const handleDelete =
        async (id) => {
            const plan =
                plans.find(
                    (p) =>
                        String(
                            getPlanDatabaseId(
                                p
                            )
                        ) ===
                        String(id)
                );

            if (!plan) {
                setError(
                    "Annual audit plan not found."
                );

                return;
            }

            if (
                !canDeletePlan(
                    plan
                )
            ) {
                setError(
                    "Only Draft plans can be deleted."
                );

                return;
            }

            if (
                id === null ||
                id === undefined
            ) {
                setError(
                    "Unable to delete plan: plan ID is missing."
                );

                return;
            }

            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this Draft annual audit plan?"
                );

            if (!confirmed) {
                return;
            }

            try {
                setError("");
                setSuccess("");

                await deletePlan(id);

                setSuccess(
                    "Annual audit plan deleted successfully."
                );

                await loadPlans();
            } catch (err) {
                console.error(
                    "Delete plan error:",
                    err
                );

                setError(
                    err?.response
                        ?.data?.message ||
                        err?.response
                            ?.data?.error ||
                        "Failed to delete annual audit plan."
                );
            }
        };

    // ============================================================
    // DETAILS
    // ============================================================

    const openDetails =
        (plan) => {
            setSelectedPlan(
                plan
            );

            setShowDetails(
                true
            );
        };

    // ============================================================
    // FIND RISK
    // ============================================================

    const getRiskById =
        (riskId) => {
            if (
                riskId === null ||
                riskId === undefined
            ) {
                return null;
            }

            return risks.find(
                (risk) =>
                    String(
                        getRiskDatabaseId(
                            risk
                        )
                    ) ===
                    String(
                        riskId
                    )
            );
        };

    // ============================================================
    // FILTER PLANS
    // ============================================================

    const filteredPlans =
        useMemo(() => {
            const query =
                search
                    .toLowerCase()
                    .trim();

            return plans.filter(
                (plan) => {
                    const planDepartment =
                        normalizeDepartment(
                            plan?.department ||
                                plan?.departmentName ||
                                ""
                        );

                    const matchesDepartment =
                        !getEntityId(
                            managerDepartment
                        ) ||
                        String(
                            getEntityId(
                                planDepartment
                            )
                        ) ===
                        String(
                            getEntityId(
                                managerDepartment
                            )
                        );

                    if (
                        !matchesDepartment
                    ) {
                        return false;
                    }

                    const planId =
                        String(
                            plan?.planId ||
                                `PLAN-${
                                    plan?.id ||
                                    ""
                                }`
                        )
                            .toLowerCase();

                    const planName =
                        String(
                            plan?.planName ||
                                ""
                        ).toLowerCase();

                    const department =
                        getDepartmentLabel(
                            plan?.department
                        ).toLowerCase();

                    const managerName =
                        String(
                            plan?.auditManagerName ||
                                ""
                        ).toLowerCase();

                    const matchesSearch =
                        !query ||
                        planId.includes(
                            query
                        ) ||
                        planName.includes(
                            query
                        ) ||
                        department.includes(
                            query
                        ) ||
                        managerName.includes(
                            query
                        );

                    const matchesStatus =
                        statusFilter ===
                            "ALL" ||
                        normalizeStatus(
                            plan?.status
                        ) ===
                            statusFilter;

                    const matchesYear =
                        yearFilter ===
                            "ALL" ||
                        String(
                            getPlanYear(
                                plan
                            )
                        ) ===
                            String(
                                yearFilter
                            );

                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesYear
                    );
                }
            );
        }, [
            plans,
            search,
            statusFilter,
            yearFilter,
            managerDepartment,
        ]);

    // ============================================================
    // PAGINATION
    // ============================================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filteredPlans.length /
                    ITEMS_PER_PAGE
            )
        );

    const safeCurrentPage =
        Math.min(
            currentPage,
            totalPages
        );

    const paginatedPlans =
        filteredPlans.slice(
            (safeCurrentPage -
                1) *
                ITEMS_PER_PAGE,

            safeCurrentPage *
                ITEMS_PER_PAGE
        );

    useEffect(() => {
        setCurrentPage(1);
    }, [
        search,
        statusFilter,
        yearFilter,
    ]);

    // ============================================================
    // YEARS
    // ============================================================

    const years = [
        ...new Set(
            plans
                .map(
                    (plan) =>
                        getPlanYear(
                            plan
                        )
                )
                .filter(
                    (year) =>
                        year !== "-" &&
                        year !== null &&
                        year !==
                            undefined
                )
        ),
    ].sort(
        (a, b) =>
            Number(b) -
            Number(a)
    );

    // ============================================================
    // STATUS COUNTS
    // ============================================================

    const statusCounts =
        useMemo(() => {
            return {
                draft:
                    filteredPlans.filter(
                        (p) =>
                            normalizeStatus(
                                p.status
                            ) ===
                            "DRAFT"
                    ).length,

                submitted:
                    filteredPlans.filter(
                        (p) =>
                            normalizeStatus(
                                p.status
                            ) ===
                            "SUBMITTED"
                    ).length,

                approved:
                    filteredPlans.filter(
                        (p) =>
                            normalizeStatus(
                                p.status
                            ) ===
                            "APPROVED"
                    ).length,

                rejected:
                    filteredPlans.filter(
                        (p) =>
                            normalizeStatus(
                                p.status
                            ) ===
                                "REJECTED"
                    ).length,

                inProgress:
                    filteredPlans.filter(
                        (p) =>
                            normalizeStatus(
                                p.status
                            ) ===
                            "IN_PROGRESS"
                    ).length,

                completed:
                    filteredPlans.filter(
                        (p) =>
                            normalizeStatus(
                                p.status
                            ) ===
                            "COMPLETED"
                    ).length,
            };
        }, [
            filteredPlans,
        ]);

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="min-h-screen bg-white text-slate-800 p-6 md:p-8">
            <div className="max-w-[1600px] mx-auto">

                {/* =================================================
                    HEADER
                ================================================= */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: -15,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.4,
                    }}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8"
                >
                    <div>
                        <div className="flex items-center gap-3">

                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                <CalendarDays
                                    size={24}
                                    className="text-emerald-600"
                                />
                            </div>

                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                                    Annual Audit Plans
                                </h1>

                                <p className="text-sm text-slate-500 mt-1">
                                    Plan and manage annual audit activities
                                </p>

                                {managerDepartment && (
                                    <p className="text-xs text-emerald-600 font-semibold mt-1">
                                        Department:{" "}
                                        {getDepartmentLabel(
                                            managerDepartment
                                        )}
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>

                    <div className="flex items-center gap-3">

                        <button
                            onClick={() => {
                                loadPlans();
                                loadRisks();
                            }}
                            disabled={
                                loading ||
                                loadingRisks
                            }
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                        >
                            <RefreshCw
                                size={17}
                                className={
                                    loading ||
                                    loadingRisks
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            Refresh
                        </button>

                        <button
                            onClick={
                                openCreateModal
                            }
                            disabled={
                                !managerDepartment
                            }
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={18} />

                            Create Annual Plan
                        </button>

                    </div>
                </motion.div>

                {/* =================================================
                    SUCCESS
                ================================================= */}

                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: -10,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: -10,
                            }}
                            className="mb-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700"
                        >
                            <span>
                                {success}
                            </span>

                            <button
                                onClick={() =>
                                    setSuccess(
                                        ""
                                    )
                                }
                            >
                                <X size={17} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* =================================================
                    ERROR
                ================================================= */}

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: -10,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                y: -10,
                            }}
                            className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700"
                        >
                            <AlertCircle
                                size={18}
                            />

                            <span className="flex-1">
                                {error}
                            </span>

                            <button
                                onClick={() =>
                                    setError(
                                        ""
                                    )
                                }
                            >
                                <X size={17} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* =================================================
                    WORKFLOW STATUS CARDS
                ================================================= */}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">

                    <StatusCard
                        title="Draft"
                        value={
                            statusCounts.draft
                        }
                        description="Not yet submitted"
                        icon={Edit3}
                        iconClass="text-slate-600"
                        iconBg="bg-slate-100"
                        borderClass="border-slate-200"
                    />

                    <StatusCard
                        title="Submitted for Approval"
                        value={
                            statusCounts.submitted
                        }
                        description="Awaiting CAE review"
                        icon={Send}
                        iconClass="text-blue-600"
                        iconBg="bg-blue-50"
                        borderClass="border-blue-200"
                    />

                    <StatusCard
                        title="Approved"
                        value={
                            statusCounts.approved
                        }
                        description="Approved by CAE"
                        icon={CheckCircle2}
                        iconClass="text-emerald-600"
                        iconBg="bg-emerald-50"
                        borderClass="border-emerald-200"
                    />

                    <StatusCard
                        title="Rejected"
                        value={
                            statusCounts.rejected
                        }
                        description="Sent back to manager"
                        icon={XCircle}
                        iconClass="text-red-600"
                        iconBg="bg-red-50"
                        borderClass="border-red-200"
                    />

                    <StatusCard
                        title="In Progress"
                        value={
                            statusCounts.inProgress
                        }
                        description="Audit execution underway"
                        icon={Clock3}
                        iconClass="text-cyan-600"
                        iconBg="bg-cyan-50"
                        borderClass="border-cyan-200"
                    />

                    <StatusCard
                        title="Completed"
                        value={
                            statusCounts.completed
                        }
                        description="Fully executed plans"
                        icon={ShieldAlert}
                        iconClass="text-teal-600"
                        iconBg="bg-teal-50"
                        borderClass="border-teal-200"
                    />

                </div>

                {/* =================================================
                    FILTER BAR
                ================================================= */}

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 mb-5">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

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
                                placeholder="Search plan, department, manager..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />

                        </div>

                        <select
                            value={
                                statusFilter
                            }
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-emerald-500"
                        >
                            <option value="ALL">
                                All Statuses
                            </option>

                            {STATUS_OPTIONS.map(
                                (status) => (
                                    <option
                                        key={
                                            status
                                        }
                                        value={
                                            status
                                        }
                                    >
                                        {getStatusLabel(
                                            status
                                        )}
                                    </option>
                                )
                            )}
                        </select>

                        <select
                            value={
                                yearFilter
                            }
                            onChange={(e) =>
                                setYearFilter(
                                    e.target.value
                                )
                            }
                            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:border-emerald-500"
                        >
                            <option value="ALL">
                                All Years
                            </option>

                            {years.map(
                                (year) => (
                                    <option
                                        key={
                                            year
                                        }
                                        value={
                                            year
                                        }
                                    >
                                        {year}
                                    </option>
                                )
                            )}
                        </select>

                    </div>
                </div>

                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1200px]">

                            <thead className="bg-slate-50 border-b border-slate-200">

                                <tr>

                                    <TableHeader>
                                        Plan
                                    </TableHeader>

                                    <TableHeader>
                                        Year
                                    </TableHeader>

                                    <TableHeader>
                                        Department
                                    </TableHeader>

                                    <TableHeader>
                                        Risk
                                    </TableHeader>

                                    <TableHeader>
                                        Audit Manager
                                    </TableHeader>

                                    <TableHeader>
                                        Status
                                    </TableHeader>

                                    <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase">
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="py-16 text-center"
                                        >
                                            <RefreshCw
                                                size={26}
                                                className="mx-auto animate-spin text-emerald-600 mb-3"
                                            />

                                            <p className="text-slate-500">
                                                Loading annual audit plans...
                                            </p>
                                        </td>
                                    </tr>
                                ) : paginatedPlans.length ===
                                  0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="py-16 text-center"
                                        >
                                            <CalendarDays
                                                size={
                                                    40
                                                }
                                                className="mx-auto text-slate-300 mb-3"
                                            />

                                            <p className="font-semibold text-slate-700">
                                                No annual audit plans found
                                            </p>

                                            <p className="text-sm text-slate-400 mt-1">
                                                Create your first annual audit plan.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedPlans.map(
                                        (
                                            plan,
                                            index
                                        ) => {
                                            const planId =
                                                getPlanDatabaseId(
                                                    plan
                                                );

                                            const planRiskIds =
                                                getPlanRiskIds(
                                                    plan
                                                );

                                            const status =
                                                normalizeStatus(
                                                    plan.status
                                                );

                                            return (
                                                <motion.tr
                                                    key={
                                                        planId ||
                                                        `plan-${index}`
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
                                                            0.04,
                                                    }}
                                                    className="hover:bg-slate-50 transition"
                                                >

                                                    {/* PLAN */}

                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-3">

                                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                                                <FileText
                                                                    size={
                                                                        18
                                                                    }
                                                                    className="text-emerald-600"
                                                                />
                                                            </div>

                                                            <div>
                                                                <p className="font-semibold text-slate-800">
                                                                    {plan.planName ||
                                                                        "Untitled Plan"}
                                                                </p>

                                                                <p className="text-xs text-slate-400 mt-1">
                                                                    {plan.planId ||
                                                                        `PLAN-${planId || "-"}`}
                                                                </p>
                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* YEAR */}

                                                    <td className="px-5 py-4">
                                                        <span className="font-semibold text-slate-700">
                                                            {getPlanYear(
                                                                plan
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* DEPARTMENT */}

                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-2 text-slate-600">

                                                            <Building2
                                                                size={
                                                                    16
                                                                }
                                                                className="text-slate-400"
                                                            />

                                                            {getDepartmentLabel(
                                                                plan.department
                                                            )}

                                                        </div>

                                                    </td>

                                                    {/* RISK */}

                                                    <td className="px-5 py-4">

                                                        {planRiskIds.length >
                                                        0 ? (
                                                            <div className="flex flex-wrap gap-1">

                                                                {planRiskIds
                                                                    .slice(
                                                                        0,
                                                                        2
                                                                    )
                                                                    .map(
                                                                        (
                                                                            riskId
                                                                        ) => {
                                                                            const risk =
                                                                                getRiskById(
                                                                                    riskId
                                                                                );

                                                                            return (
                                                                                <span
                                                                                    key={String(
                                                                                        riskId
                                                                                    )}
                                                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium max-w-[300px]"
                                                                                >
                                                                                    <ShieldAlert
                                                                                        size={
                                                                                            13
                                                                                        }
                                                                                    />

                                                                                    <span className="truncate">
                                                                                        {risk
                                                                                            ? getRiskDisplayName(
                                                                                                  risk
                                                                                              )
                                                                                            : `RISK-${riskId}`}
                                                                                    </span>
                                                                                </span>
                                                                            );
                                                                        }
                                                                    )}

                                                                {planRiskIds.length >
                                                                    2 && (
                                                                    <span className="text-xs text-slate-400">
                                                                        +
                                                                        {planRiskIds.length -
                                                                            2}{" "}
                                                                        more
                                                                    </span>
                                                                )}

                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400">
                                                                No risk
                                                            </span>
                                                        )}

                                                    </td>

                                                    {/* MANAGER */}

                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-2">

                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                                <UserRound
                                                                    size={
                                                                        15
                                                                    }
                                                                    className="text-slate-500"
                                                                />
                                                            </div>

                                                            <div>

                                                                <p className="text-sm font-medium text-slate-700">
                                                                    {plan.auditManagerName ||
                                                                        "Not assigned"}
                                                                </p>

                                                                {plan.auditManagerId && (
                                                                    <p className="text-xs text-slate-400">
                                                                        ID:{" "}
                                                                        {
                                                                            plan.auditManagerId
                                                                        }
                                                                    </p>
                                                                )}

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* STATUS */}

                                                    <td className="px-5 py-4">

                                                        <span
                                                            className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusStyle(
                                                                status
                                                            )}`}
                                                        >
                                                            {getStatusLabel(
                                                                status
                                                            )}
                                                        </span>

                                                    </td>

                                                    {/* ACTIONS */}

                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center justify-end gap-2">

                                                            {/* VIEW */}

                                                            <button
                                                                onClick={() =>
                                                                    openDetails(
                                                                        plan
                                                                    )
                                                                }
                                                                className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
                                                                title="View"
                                                            >
                                                                <Eye
                                                                    size={
                                                                        17
                                                                    }
                                                                />
                                                            </button>

                                                            {/* EDIT - DRAFT ONLY */}

                                                            {canEditPlan(
                                                                plan
                                                            ) && (
                                                                <button
                                                                    onClick={() =>
                                                                        openEditModal(
                                                                            plan
                                                                        )
                                                                    }
                                                                    className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                                                                    title="Edit Draft"
                                                                >
                                                                    <Edit3
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>
                                                            )}

                                                            {/* DELETE - DRAFT ONLY */}

                                                            {canDeletePlan(
                                                                plan
                                                            ) && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            planId
                                                                        )
                                                                    }
                                                                    className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                                                                    title="Delete Draft"
                                                                >
                                                                    <Trash2
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>
                                                            )}

                                                            {/* START AUDIT - APPROVED ONLY */}

                                                            {status === "APPROVED" && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleStartAudit(
                                                                            plan
                                                                        )
                                                                    }
                                                                    disabled={saving}
                                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    title="Start Audit"
                                                                >
                                                                    {saving ? (
                                                                        <Loader2
                                                                            size={14}
                                                                            className="animate-spin"
                                                                        />
                                                                    ) : (
                                                                        <Clock3
                                                                            size={14}
                                                                        />
                                                                    )}
                                                                    Start Audit
                                                                </button>
                                                            )}

                                                            {/* SUBMIT - DRAFT ONLY */}

                                                            {canSubmitPlan(
                                                                plan
                                                            ) && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleSubmitForApproval(
                                                                            plan
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        saving
                                                                    }
                                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                                                                    title="Submit for CAE Approval"
                                                                >
                                                                    <Send
                                                                        size={
                                                                            14
                                                                        }
                                                                    />

                                                                    Submit
                                                                </button>
                                                            )}

                                                        </div>

                                                    </td>

                                                </motion.tr>
                                            );
                                        }
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    {!loading &&
                        filteredPlans.length >
                            0 && (
                            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200">

                                <p className="text-sm text-slate-500">

                                    Showing{" "}

                                    <span className="font-semibold text-slate-700">
                                        {(safeCurrentPage -
                                            1) *
                                            ITEMS_PER_PAGE +
                                            1}
                                    </span>

                                    {" "}to{" "}

                                    <span className="font-semibold text-slate-700">
                                        {Math.min(
                                            safeCurrentPage *
                                                ITEMS_PER_PAGE,
                                            filteredPlans.length
                                        )}
                                    </span>

                                    {" "}of{" "}

                                    <span className="font-semibold text-slate-700">
                                        {
                                            filteredPlans.length
                                        }
                                    </span>

                                </p>

                                <div className="flex items-center gap-2">

                                    <button
                                        disabled={
                                            safeCurrentPage ===
                                            1
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (p) =>
                                                    Math.max(
                                                        1,
                                                        p -
                                                            1
                                                    )
                                            )
                                        }
                                        className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                                    >
                                        <ChevronLeft
                                            size={
                                                17
                                            }
                                        />
                                    </button>

                                    <span className="text-sm font-medium text-slate-600 px-2">
                                        {
                                            safeCurrentPage
                                        }{" "}
                                        /{" "}
                                        {
                                            totalPages
                                        }
                                    </span>

                                    <button
                                        disabled={
                                            safeCurrentPage ===
                                            totalPages
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                (p) =>
                                                    Math.min(
                                                        totalPages,
                                                        p +
                                                            1
                                                    )
                                            )
                                        }
                                        className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                                    >
                                        <ChevronRight
                                            size={
                                                17
                                            }
                                        />
                                    </button>

                                </div>

                            </div>
                        )}

                </div>
            </div>

            {/* =====================================================
                CREATE / EDIT MODAL
            ===================================================== */}

            <AnimatePresence>
                {showModal && (
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
                        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
                        onMouseDown={(
                            e
                        ) => {
                            if (
                                e.target ===
                                e.currentTarget
                            ) {
                                setShowModal(
                                    false
                                );
                            }
                        }}
                    >

                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.96,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.96,
                                y: 20,
                            }}
                            className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200"
                        >

                            {/* HEADER */}

                            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">

                                <div>

                                    <h2 className="text-xl font-bold text-slate-900">
                                        {editingId !==
                                        null
                                            ? "Edit Annual Audit Plan"
                                            : "Create Annual Audit Plan"}
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Define the annual audit scope and risk coverage.
                                    </p>

                                </div>

                                <button
                                    onClick={() =>
                                        setShowModal(
                                            false
                                        )
                                    }
                                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
                                >
                                    <X
                                        size={
                                            20
                                        }
                                    />
                                </button>

                            </div>

                            {/* FORM */}

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                                className="p-6 space-y-6"
                            >

                                {/* BASIC */}

                                <FormSection
                                    title="Basic Information"
                                    icon={
                                        FileText
                                    }
                                >

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        <Input
                                            label="Plan Name"
                                            name="planName"
                                            value={
                                                form.planName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                            placeholder="e.g. FY 2026-27 Annual Audit Plan"
                                        />

                                        <Input
                                            label="Audit Year"
                                            name="auditYear"
                                            type="number"
                                            value={
                                                form.auditYear
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                        <div className="md:col-span-2">

                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Description
                                            </label>

                                            <textarea
                                                name="description"
                                                value={
                                                    form.description
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                                rows="3"
                                                placeholder="Describe the purpose and scope..."
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none"
                                            />

                                        </div>

                                    </div>

                                </FormSection>

                                {/* DATES */}

                                <FormSection
                                    title="Planning Period"
                                    icon={
                                        CalendarDays
                                    }
                                >

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        <Input
                                            label="Planned Start Date"
                                            name="plannedStartDate"
                                            type="date"
                                            value={
                                                form.plannedStartDate
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                        <Input
                                            label="Planned End Date"
                                            name="plannedEndDate"
                                            type="date"
                                            value={
                                                form.plannedEndDate
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        />

                                    </div>

                                </FormSection>

                                {/* SCOPE */}

                                <FormSection
                                    title="Audit Scope"
                                    icon={
                                        Building2
                                    }
                                >

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        {/* DEPARTMENT */}

                                        <div>

                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Department
                                                <span className="text-red-500 ml-1">
                                                    *
                                                </span>
                                            </label>

                                            <select
                                                value={
                                                    getEntityId(
                                                        managerDepartment
                                                    ) ??
                                                    ""
                                                }
                                                disabled
                                                className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold outline-none cursor-not-allowed"
                                            >

                                                <option
                                                    value={
                                                        getEntityId(
                                                            managerDepartment
                                                        ) ??
                                                        ""
                                                    }
                                                >
                                                    {getDepartmentLabel(
                                                        managerDepartment
                                                    )}
                                                </option>

                                            </select>

                                            <p className="text-xs text-emerald-600 mt-1.5">
                                                You can only create plans for your assigned department.
                                            </p>

                                        </div>

                                        {/* BUSINESS UNIT */}

                                        <Input
                                            label="Business Unit"
                                            name="businessUnit"
                                            value={
                                                form.businessUnit
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                            placeholder="e.g. Retail Banking"
                                        />

                                        {/* PROCESS */}

                                        <Input
                                            label="Process Name"
                                            name="processName"
                                            value={
                                                form.processName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                            placeholder="e.g. Loan Processing"
                                        />

                                        {/* RISK */}

                                        <RiskSelect
                                            value={
                                                form.riskId
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            risks={
                                                risks
                                            }
                                            loading={
                                                loadingRisks
                                            }
                                            required
                                            department={
                                                managerDepartment
                                            }
                                        />

                                    </div>

                                </FormSection>

                                {/* =================================================
                                    STATUS - READ ONLY
                                ================================================= */}

                                <FormSection
                                    title="Plan Status"
                                    icon={
                                        ShieldAlert
                                    }
                                >

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        {/* CURRENT STATUS */}

                                        <div>

                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                                Current Status
                                            </label>

                                            <div
                                                className={`w-full px-4 py-2.5 rounded-xl border font-semibold ${getStatusStyle(
                                                    form.status
                                                )}`}
                                            >
                                                {getStatusLabel(
                                                    form.status
                                                )}
                                            </div>

                                            <p className="text-xs text-slate-400 mt-1.5">
                                                Status is controlled by the audit workflow.
                                            </p>

                                        </div>

                                        {/* REMARKS */}

                                        <Input
                                            label="Remarks"
                                            name="remarks"
                                            value={
                                                form.remarks
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Optional remarks"
                                        />

                                    </div>

                                    {/* WORKFLOW */}

                                    <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">

                                        <p className="text-xs font-semibold text-blue-800 mb-3">
                                            Audit Approval Workflow
                                        </p>

                                        <div className="flex flex-wrap items-center gap-2">

                                            <WorkflowBadge
                                                label="Draft"
                                                active={
                                                    normalizeStatus(
                                                        form.status
                                                    ) ===
                                                    "DRAFT"
                                                }
                                                className="bg-slate-100 text-slate-700"
                                            />

                                            <span className="text-slate-400">
                                                →
                                            </span>

                                            <WorkflowBadge
                                                label="Submitted"
                                                active={
                                                    normalizeStatus(
                                                        form.status
                                                    ) ===
                                                    "SUBMITTED"
                                                }
                                                className="bg-blue-100 text-blue-700"
                                            />

                                            <span className="text-slate-400">
                                                →
                                            </span>

                                            <WorkflowBadge
                                                label="CAE Approval"
                                                active={
                                                    normalizeStatus(
                                                        form.status
                                                    ) ===
                                                    "APPROVED"
                                                }
                                                className="bg-emerald-100 text-emerald-700"
                                            />

                                            <span className="text-slate-400">
                                                →
                                            </span>

                                            <WorkflowBadge
                                                label="In Progress"
                                                active={
                                                    normalizeStatus(
                                                        form.status
                                                    ) ===
                                                    "IN_PROGRESS"
                                                }
                                                className="bg-cyan-100 text-cyan-700"
                                            />

                                            <span className="text-slate-400">
                                                →
                                            </span>

                                            <WorkflowBadge
                                                label="Completed"
                                                active={
                                                    normalizeStatus(
                                                        form.status
                                                    ) ===
                                                    "COMPLETED"
                                                }
                                                className="bg-green-100 text-green-700"
                                            />

                                        </div>

                                        {normalizeStatus(
                                            form.status
                                        ) ===
                                            "DRAFT" && (
                                            <p className="mt-3 text-xs text-blue-700">
                                                This plan is still a draft. Use the Submit button after saving to send it to CAE.
                                            </p>
                                        )}

                                        {normalizeStatus(
                                            form.status
                                        ) ===
                                            "SUBMITTED" && (
                                            <p className="mt-3 text-xs text-blue-700">
                                                This plan is waiting for CAE approval.
                                            </p>
                                        )}

                                        {normalizeStatus(
                                            form.status
                                        ) ===
                                            "APPROVED" && (
                                            <p className="mt-3 text-xs text-emerald-700">
                                                This plan has been approved by CAE.
                                            </p>
                                        )}

                                        {normalizeStatus(
                                            form.status
                                        ) ===
                                            "IN_PROGRESS" && (
                                            <p className="mt-3 text-xs text-cyan-700">
                                                Audit execution is currently in progress.
                                            </p>
                                        )}

                                        {normalizeStatus(
                                            form.status
                                        ) ===
                                            "COMPLETED" && (
                                            <p className="mt-3 text-xs text-green-700">
                                                This annual audit plan has been completed.
                                            </p>
                                        )}

                                        {normalizeStatus(
                                            form.status
                                        ) ===
                                            "REJECTED" && (
                                            <p className="mt-3 text-xs text-red-700">
                                                This plan was rejected and requires review.
                                            </p>
                                        )}

                                    </div>

                                </FormSection>

                                {/* BUTTONS */}

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowModal(
                                                false
                                            )
                                        }
                                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            saving ||
                                            !managerDepartment ||
                                            loadingRisks
                                        }
                                        className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
                                    >

                                        {saving ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2
                                                    size={
                                                        16
                                                    }
                                                    className="animate-spin"
                                                />

                                                Saving...
                                            </span>
                                        ) : editingId !==
                                          null ? (
                                            "Update Draft"
                                        ) : (
                                            "Create Draft"
                                        )}

                                    </button>

                                </div>

                            </form>

                        </motion.div>

                    </motion.div>
                )}
            </AnimatePresence>

            {/* =====================================================
                DETAILS MODAL
            ===================================================== */}

            <AnimatePresence>
                {showDetails &&
                    selectedPlan && (
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
                            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
                            onMouseDown={(
                                e
                            ) => {
                                if (
                                    e.target ===
                                    e.currentTarget
                                ) {
                                    setShowDetails(
                                        false
                                    );
                                }
                            }}
                        >

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
                                className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200"
                            >

                                {/* HEADER */}

                                <div className="sticky top-0 z-10 px-6 py-5 border-b border-slate-200 bg-white flex items-center justify-between">

                                    <div>

                                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                                            {selectedPlan.planId ||
                                                `PLAN-${getPlanDatabaseId(
                                                    selectedPlan
                                                )}`}
                                        </p>

                                        <h2 className="text-xl font-bold text-slate-900 mt-1">
                                            {selectedPlan.planName ||
                                                "Annual Audit Plan"}
                                        </h2>

                                    </div>

                                    <button
                                        onClick={() =>
                                            setShowDetails(
                                                false
                                            )
                                        }
                                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
                                    >
                                        <X
                                            size={
                                                20
                                            }
                                        />
                                    </button>

                                </div>

                                {/* BODY */}

                                <div className="p-6 space-y-6">

                                    {/* STATUS BANNER */}

                                    <div
                                        className={`rounded-2xl border p-4 ${getStatusStyle(
                                            selectedPlan.status
                                        )}`}
                                    >

                                        <div className="flex items-center justify-between">

                                            <div>

                                                <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                                                    Current Status
                                                </p>

                                                <p className="text-lg font-bold mt-1">
                                                    {getStatusLabel(
                                                        selectedPlan.status
                                                    )}
                                                </p>

                                            </div>

                                            <ShieldAlert
                                                size={
                                                    25
                                                }
                                            />

                                        </div>

                                    </div>

                                    {/* PLAN INFO */}

                                    <div>

                                        <h3 className="font-semibold text-slate-800 mb-4">
                                            Plan Information
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                            <DetailItem
                                                label="Plan Year"
                                                value={getPlanYear(
                                                    selectedPlan
                                                )}
                                            />

                                            <DetailItem
                                                label="Department"
                                                value={getDepartmentLabel(
                                                    selectedPlan.department
                                                )}
                                            />

                                            <DetailItem
                                                label="Audit Manager"
                                                value={
                                                    selectedPlan.auditManagerName
                                                }
                                            />

                                            <DetailItem
                                                label="Manager ID"
                                                value={
                                                    selectedPlan.auditManagerId
                                                }
                                            />

                                            <DetailItem
                                                label="Start Date"
                                                value={
                                                    selectedPlan.plannedStartDate
                                                }
                                            />

                                            <DetailItem
                                                label="End Date"
                                                value={
                                                    selectedPlan.plannedEndDate
                                                }
                                            />

                                        </div>

                                    </div>

                                    {/* BUSINESS UNIT */}

                                    <DetailBox
                                        label="Business Unit"
                                        value={
                                            selectedPlan.businessUnit
                                        }
                                    />

                                    {/* PROCESS */}

                                    <DetailBox
                                        label="Process"
                                        value={
                                            selectedPlan.processName
                                        }
                                    />

                                    {/* DESCRIPTION */}

                                    <DetailBox
                                        label="Description"
                                        value={
                                            selectedPlan.description
                                        }
                                    />

                                    {/* RISKS */}

                                    <div>

                                        <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
                                            Risks
                                        </p>

                                        <div className="flex flex-col gap-2">

                                            {getPlanRiskIds(
                                                selectedPlan
                                            ).length >
                                            0 ? (
                                                getPlanRiskIds(
                                                    selectedPlan
                                                ).map(
                                                    (
                                                        riskId
                                                    ) => {
                                                        const risk =
                                                            getRiskById(
                                                                riskId
                                                            );

                                                        return (
                                                            <div
                                                                key={String(
                                                                    riskId
                                                                )}
                                                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium"
                                                            >
                                                                <ShieldAlert
                                                                    size={
                                                                        16
                                                                    }
                                                                />

                                                                {risk
                                                                    ? getRiskDisplayName(
                                                                          risk
                                                                      )
                                                                    : `RISK-${riskId}`}
                                                            </div>
                                                        );
                                                    }
                                                )
                                            ) : (
                                                <span className="text-sm text-slate-400">
                                                    No risks assigned
                                                </span>
                                            )}

                                        </div>

                                    </div>

                                    {/* REMARKS */}

                                    <DetailBox
                                        label="Remarks"
                                        value={
                                            selectedPlan.remarks
                                        }
                                    />

                                    {/* WORKFLOW */}

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                                        <p className="text-xs font-semibold text-slate-500 uppercase mb-4">
                                            Workflow
                                        </p>

                                        <div className="space-y-3">

                                            <WorkflowRow
                                                number="1"
                                                title="Draft"
                                                description="Audit Manager creates the annual audit plan."
                                                active={
                                                    normalizeStatus(
                                                        selectedPlan.status
                                                    ) ===
                                                    "DRAFT"
                                                }
                                            />

                                            <WorkflowRow
                                                number="2"
                                                title="Submitted for Approval"
                                                description="Audit Manager submits the plan to CAE."
                                                active={
                                                    normalizeStatus(
                                                        selectedPlan.status
                                                    ) ===
                                                    "SUBMITTED"
                                                }
                                            />

                                            <WorkflowRow
                                                number="3"
                                                title="CAE Approval"
                                                description="CAE reviews and approves the plan."
                                                active={
                                                    normalizeStatus(
                                                        selectedPlan.status
                                                    ) ===
                                                    "APPROVED"
                                                }
                                            />

                                            <WorkflowRow
                                                number="4"
                                                title="In Progress"
                                                description="Approved audit activities are executed."
                                                active={
                                                    normalizeStatus(
                                                        selectedPlan.status
                                                    ) ===
                                                    "IN_PROGRESS"
                                                }
                                            />

                                            <WorkflowRow
                                                number="5"
                                                title="Completed"
                                                description="CAE marks the annual audit plan as completed."
                                                active={
                                                    normalizeStatus(
                                                        selectedPlan.status
                                                    ) ===
                                                    "COMPLETED"
                                                }
                                            />

                                        </div>

                                    </div>

                                </div>

                                {/* FOOTER */}

                                <div className="px-6 py-4 border-t border-slate-200 flex justify-end">

                                    <button
                                        onClick={() =>
                                            setShowDetails(
                                                false
                                            )
                                        }
                                        className="px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                                    >
                                        Close
                                    </button>

                                </div>

                            </motion.div>

                        </motion.div>
                    )}
            </AnimatePresence>
        </div>
    );
}

// ================================================================
// TABLE HEADER
// ================================================================

function TableHeader({
    children,
}) {
    return (
        <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
            {children}
        </th>
    );
}

// ================================================================
// STATUS CARD
// ================================================================

function StatusCard({
    title,
    value,
    description,
    icon: Icon,
    iconClass,
    iconBg,
    borderClass,
}) {
    return (
        <motion.div
            whileHover={{
                y: -4,
                scale: 1.01,
            }}
            transition={{
                duration: 0.2,
            }}
            className={`bg-white border ${borderClass} rounded-2xl p-5 shadow-sm`}
        >

            <div className="flex items-start justify-between gap-3">

                <div className="min-w-0">

                    <p className="text-2xl font-bold text-slate-900">
                        {value}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-800 leading-5">
                        {title}
                    </p>

                    <p className="mt-1 text-xs text-slate-400 leading-4">
                        {description}
                    </p>

                </div>

                <div
                    className={`flex-shrink-0 w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}
                >
                    <Icon
                        size={20}
                        className={
                            iconClass
                        }
                    />
                </div>

            </div>

        </motion.div>
    );
}

// ================================================================
// WORKFLOW BADGE
// ================================================================

function WorkflowBadge({
    label,
    active,
    className,
}) {
    return (
        <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                active
                    ? `${className} ring-2 ring-offset-1 ring-slate-300`
                    : "bg-white text-slate-400 border border-slate-200"
            }`}
        >
            {label}
        </span>
    );
}

// ================================================================
// WORKFLOW ROW
// ================================================================

function WorkflowRow({
    number,
    title,
    description,
    active,
}) {
    return (
        <div
            className={`flex items-start gap-3 p-3 rounded-xl border transition ${
                active
                    ? "bg-white border-emerald-200 shadow-sm"
                    : "bg-transparent border-transparent"
            }`}
        >

            <div
                className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                    active
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-500"
                }`}
            >
                {number}
            </div>

            <div>

                <p
                    className={`text-sm font-semibold ${
                        active
                            ? "text-slate-900"
                            : "text-slate-600"
                    }`}
                >
                    {title}
                </p>

                <p className="text-xs text-slate-400 mt-0.5">
                    {description}
                </p>

            </div>

        </div>
    );
}

// ================================================================
// RISK SELECT
// ================================================================

function RiskSelect({
    value,
    onChange,
    risks,
    loading,
    required,
    department,
}) {
    return (
        <div>

            <label className="block text-sm font-medium text-slate-700 mb-1.5">

                Risk

                {required && (
                    <span className="text-red-500 ml-1">
                        *
                    </span>
                )}

            </label>

            <div className="relative">

                <select
                    name="riskId"
                    value={
                        value ?? ""
                    }
                    onChange={
                        onChange
                    }
                    required={
                        required
                    }
                    disabled={
                        loading
                    }
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition disabled:bg-slate-50 disabled:text-slate-400"
                >

                    <option value="">
                        {loading
                            ? "Loading risks..."
                            : risks.length ===
                              0
                            ? "No risks available for your department"
                            : "Select Risk"}
                    </option>

                    {risks.map(
                        (risk) => {
                            const databaseId =
                                getRiskDatabaseId(
                                    risk
                                );

                            if (
                                databaseId ===
                                null
                            ) {
                                return null;
                            }

                            return (
                                <option
                                    key={String(
                                        databaseId
                                    )}
                                    value={
                                        databaseId
                                    }
                                >
                                    {getRiskCode(
                                        risk
                                    )}{" "}
                                    —{" "}
                                    {getRiskTitle(
                                        risk
                                    )}
                                </option>
                            );
                        }
                    )}

                </select>

                {loading && (
                    <Loader2
                        size={17}
                        className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-emerald-600"
                    />
                )}

            </div>

            <p className="text-xs text-slate-400 mt-1.5">
                Only risks belonging to{" "}
                <span className="font-semibold">
                    {getDepartmentLabel(
                        department
                    )}
                </span>{" "}
                are available.
            </p>

        </div>
    );
}

// ================================================================
// FORM SECTION
// ================================================================

function FormSection({
    title,
    icon: Icon,
    children,
}) {
    return (
        <div>

            <div className="flex items-center gap-2 mb-4">

                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Icon
                        size={16}
                        className="text-emerald-600"
                    />
                </div>

                <h3 className="font-semibold text-slate-800">
                    {title}
                </h3>

            </div>

            {children}

        </div>
    );
}

// ================================================================
// INPUT
// ================================================================

function Input({
    label,
    name,
    type = "text",
    value,
    onChange,
    required,
    placeholder,
}) {
    return (
        <div>

            <label className="block text-sm font-medium text-slate-700 mb-1.5">

                {label}

                {required && (
                    <span className="text-red-500 ml-1">
                        *
                    </span>
                )}

            </label>

            <input
                type={type}
                name={name}
                value={
                    value ?? ""
                }
                onChange={
                    onChange
                }
                required={
                    required
                }
                placeholder={
                    placeholder
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            />

        </div>
    );
}

// ================================================================
// DETAIL ITEM
// ================================================================

function DetailItem({
    label,
    value,
}) {
    return (
        <div>

            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">
                {label}
            </p>

            <p className="text-sm font-medium text-slate-700">
                {value ||
                    "-"}
            </p>

        </div>
    );
}

// ================================================================
// DETAIL BOX
// ================================================================

function DetailBox({
    label,
    value,
}) {
    return (
        <div>

            <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
                {label}
            </p>

            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 whitespace-pre-wrap">
                {value ||
                    `No ${label.toLowerCase()} provided.`}
            </div>

        </div>
    );
}