import React, {
    useEffect,
    useMemo,
    useState,
  } from "react";
  
  import {
    Plus,
    Search,
    Filter,
    Eye,
    Pencil,
    Trash2,
    X,
    ClipboardList,
    CalendarDays,
    CheckCircle2,
    Clock3,
    AlertCircle,
    Loader2,
    RotateCcw,
  } from "lucide-react";
  
  import {
    createAudit,
    deleteAudit,
    getMyAssignedAudits,
    getAuditById,
    updateAudit,
  } from "../../service/AuditService";
  
  import { getAssignedRisks } from "../../service/AssignedRiskService";
  import { getAllDepartments } from "../../service/departmentService";
  import { getAuditConfiguration } from "../../service/auditConfigurationService";
  
  
  // ============================================================
  // HELPERS
  // ============================================================
  
  const normalizeStatus = (status) => {
    if (!status) return "PLANNED";
  
    return String(status)
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");
  };
  
  const formatStatus = (status) => {
    if (!status) return "Planned";
  
    return String(status)
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
  };
  
  const formatDate = (date) => {
    if (!date) return "-";
  
    try {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return date;
    }
  };
  
  const getRiskId = (risk) => {
    if (!risk) return "";
  
    return (
        risk.riskId ??
        risk.id ??
        risk.risk?.riskId ??
        risk.risk?.id ??
        ""
    );
  };
  
  const getRiskTitle = (risk) => {
    if (!risk) return "";
  
    return (
        risk.title ??
        risk.riskTitle ??
        risk.risk?.title ??
        risk.risk?.riskTitle ??
        ""
    );
  };
  
  const getDepartmentId = (department) => {
    if (!department) return "";
  
    if (typeof department === "object") {
        return department.id ?? "";
    }
  
    return department;
  };
  
  const getDepartmentName = (department) => {
    if (!department) return "-";
  
    if (typeof department === "string") {
        return department;
    }
  
    return department.name ?? "-";
  };
  // ============================================================
  // AUDIT CONFIGURATION + DATE HELPERS
  // ============================================================
  
  const extractMinimumAuditDays = (config) => {
    if (!config || typeof config !== "object") return null;
  
    const keys = ["minimumAuditDays", "minimumAuditDurationDays", "minAuditDays", "minAuditDurationDays", "minimumDays", "minDays", "minimumAuditDuration", "minAuditDuration"];
    const visited = new Set();
  
    const search = (value) => {
      if (!value || typeof value !== "object" || visited.has(value)) return null;
      visited.add(value);
  
      for (const key of keys) {
        const number = Number(value[key]);
        if (value[key] !== undefined && value[key] !== null && value[key] !== "" && Number.isFinite(number) && number > 0) return Math.ceil(number);
      }
  
      for (const [key, child] of Object.entries(value)) {
        const normalized = key.toLowerCase();
        if (normalized.includes("minimum") && normalized.includes("audit") && normalized.includes("day")) {
          const number = Number(child);
          if (Number.isFinite(number) && number > 0) return Math.ceil(number);
        }
        const result = search(child);
        if (result !== null) return result;
      }
      return null;
    };
  
    return search(config);
  };
  
  const parseDateAtMidnight = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = String(dateString).substring(0, 10).split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  };
  
  const getAuditDurationDays = (startDate, endDate) => {
    const start = parseDateAtMidnight(startDate);
    const end = parseDateAtMidnight(endDate);
    if (!start || !end) return null;
    return Math.floor((end.getTime() - start.getTime()) / 86400000);
  };
  
  const getMinimumEndDate = (startDate, minimumDays) => {
    const date = parseDateAtMidnight(startDate);
    if (!date || minimumDays === null || minimumDays === undefined) return "";
    date.setDate(date.getDate() + Number(minimumDays));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };
  
  const getErrorMessage = (err) => {
    const data = err?.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    return data?.message || data?.error || err?.message || "Failed to save audit.";
  };
  
  
  
  // ============================================================
  // COMPONENT
  // ============================================================
  
  const AuditPlanning = () => {
  
    // ========================================================
    // STATE
    // ========================================================
  
    const [audits, setAudits] = useState([]);
    const [assignedRisks, setAssignedRisks] = useState([]);
    const [departments, setDepartments] = useState([]);
  
    const [minimumAuditDays, setMinimumAuditDays] = useState(null);
    const [configurationLoading, setConfigurationLoading] = useState(true);
    const [configurationError, setConfigurationError] = useState("");
  
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
  
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
  
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [departmentFilter, setDepartmentFilter] = useState("ALL");
  
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("create");
  
    const [selectedAudit, setSelectedAudit] = useState(null);
  
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewAudit, setViewAudit] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);
  
    const [deleteLoading, setDeleteLoading] = useState(null);
  
    const [form, setForm] = useState({
        riskId: "",
        auditTitle: "",
        description: "",
        departmentId: "",
        businessUnit: "",
        processName: "",
        startDate: "",
        endDate: "",
    });
  
  
    // ========================================================
    // FETCH MY ASSIGNED AUDITS
    // ========================================================
  
    const fetchAudits = async () => {
        try {
            setLoading(true);
            setError("");
  
            // IMPORTANT:
            // Internal Auditor should see only audits assigned
            // to the currently logged-in Internal Auditor.
            const data = await getMyAssignedAudits();
  
            console.log("MY ASSIGNED AUDITS:", data);
  
            setAudits(Array.isArray(data) ? data : []);
  
        } catch (err) {
            console.error(
                "Failed to fetch assigned audits:",
                err
            );
  
            setAudits([]);
  
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load assigned audits."
            );
        } finally {
            setLoading(false);
        }
    };
  
  
    // ========================================================
    // FETCH ASSIGNED RISKS
    // ========================================================
  
    const fetchAssignedRisks = async () => {
        try {
            const data = await getAssignedRisks();
  
            console.log(
                "ASSIGNED RISKS:",
                data
            );
  
            setAssignedRisks(
                Array.isArray(data)
                    ? data
                    : []
            );
  
        } catch (err) {
            console.error(
                "Failed to fetch assigned risks:",
                err
            );
  
            setAssignedRisks([]);
        }
    };
  
  
    // ========================================================
    // FETCH DEPARTMENTS
    // ========================================================
  
    const fetchDepartments = async () => {
        try {
            const data = await getAllDepartments();
  
            console.log(
                "DEPARTMENTS:",
                data
            );
  
            const departmentData =
                Array.isArray(data)
                    ? data
                    : data?.data && Array.isArray(data.data)
                        ? data.data
                        : [];
  
            setDepartments(
                departmentData
            );
  
        } catch (err) {
            console.error(
                "Failed to fetch departments:",
                err
            );
  
            setDepartments([]);
        }
    };
  
  
    // ========================================================
    // FETCH AUDIT CONFIGURATION
    // ========================================================
  
    const fetchAuditConfiguration = async () => {
        try {
            setConfigurationLoading(true);
            setConfigurationError("");
  
            const data = await getAuditConfiguration();
            console.log("AUDIT CONFIGURATION:", data);
  
            const minimumDays = extractMinimumAuditDays(data);
            setMinimumAuditDays(minimumDays);
  
            if (minimumDays === null) {
                console.warn("Minimum audit duration was not found in audit configuration.", data);
            }
        } catch (err) {
            console.error("Failed to fetch audit configuration:", err);
            setMinimumAuditDays(null);
            setConfigurationError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Unable to load the audit configuration. Please refresh and try again."
            );
        } finally {
            setConfigurationLoading(false);
        }
    };
  
  
    // ========================================================
    // INITIAL LOAD
    // ========================================================
  
    useEffect(() => {
        fetchAudits();
        fetchAssignedRisks();
        fetchDepartments();
        fetchAuditConfiguration();
    }, []);
  
  
    // ========================================================
    // RESET FORM
    // ========================================================
  
    const resetForm = () => {
        setForm({
            riskId: "",
            auditTitle: "",
            description: "",
            departmentId: "",
            businessUnit: "",
            processName: "",
            startDate: "",
            endDate: "",
        });
  
        setSelectedAudit(null);
    };
  
  
    // ========================================================
    // OPEN CREATE MODAL
    // ========================================================
  
    const openCreateModal = () => {
        resetForm();
  
        setModalMode("create");
        setShowModal(true);
  
        setError("");
        setSuccess("");
    };
  
  
    // ========================================================
    // OPEN EDIT MODAL
    // ========================================================
  
    const openEditModal = (audit) => {
  
        setSelectedAudit(audit);
  
        setForm({
            riskId:
                audit?.riskId ??
                audit?.risk?.riskId ??
                audit?.risk?.id ??
                "",
  
            auditTitle:
                audit?.auditTitle ??
                audit?.title ??
                "",
  
            description:
                audit?.description ??
                "",
  
            departmentId:
                getDepartmentId(
                    audit?.department
                ),
  
            businessUnit:
                audit?.businessUnit ??
                "",
  
            processName:
                audit?.processName ??
                "",
  
            startDate:
                audit?.startDate
                    ? String(audit.startDate).substring(0, 10)
                    : "",
  
            endDate:
                audit?.endDate
                    ? String(audit.endDate).substring(0, 10)
                    : "",
        });
  
        setModalMode("edit");
        setShowModal(true);
  
        setError("");
        setSuccess("");
    };
  
  
    // ========================================================
    // CLOSE MODAL
    // ========================================================
  
    const closeModal = () => {
        if (saving) return;
  
        setShowModal(false);
        resetForm();
    };
  
  
    // ========================================================
    // FORM CHANGE
    // ========================================================
  
    const handleChange = (e) => {
  
        const {
            name,
            value,
        } = e.target;
  
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
  
        setError("");
    };
  
  
    // ========================================================
    // RISK CHANGE
    // ========================================================
  
    const handleRiskChange = (e) => {
  
        const riskId = e.target.value;
  
        const selectedRisk =
            assignedRisks.find(
                (risk) =>
                    String(getRiskId(risk)) ===
                    String(riskId)
            );
  
        if (!selectedRisk) {
  
            setForm((prev) => ({
                ...prev,
                riskId,
            }));
  
            return;
        }
  
        const department =
            selectedRisk.department ??
            selectedRisk.risk?.department;
  
        const businessUnit =
            selectedRisk.businessUnit ??
            selectedRisk.risk?.businessUnit ??
            "";
  
        const processName =
            selectedRisk.processName ??
            selectedRisk.risk?.processName ??
            "";
  
        setForm((prev) => ({
            ...prev,
  
            riskId,
  
            departmentId:
                getDepartmentId(
                    department
                ) ||
                prev.departmentId,
  
            businessUnit:
                businessUnit ||
                prev.businessUnit,
  
            processName:
                processName ||
                prev.processName,
        }));
    };
  
  
    // ========================================================
    // VALIDATE FORM
    // ========================================================
  
    const validateForm = () => {
  
        if (!form.riskId) return "Please select an assigned risk.";
        if (!form.auditTitle.trim()) return "Audit title is required.";
        if (!form.startDate) return "Start date is required.";
        if (!form.endDate) return "End date is required.";
  
        const durationDays = getAuditDurationDays(form.startDate, form.endDate);
  
        if (durationDays === null) return "Please select valid start and end dates.";
        if (durationDays < 0) return "End date cannot be before start date.";
        if (configurationLoading) return "Audit configuration is still loading. Please wait a moment and try again.";
        if (configurationError) return `Unable to validate the audit duration. ${configurationError}`;
        if (minimumAuditDays === null) return "Minimum audit duration is not configured. Please contact the administrator.";
  
        if (durationDays < minimumAuditDays) {
            const minimumEndDate = getMinimumEndDate(form.startDate, minimumAuditDays);
            return `Audit duration must be at least ${minimumAuditDays} day${minimumAuditDays === 1 ? "" : "s"}. You selected ${durationDays} day${durationDays === 1 ? "" : "s"}. Please select an end date on or after ${formatDate(minimumEndDate)}.`;
        }
  
        return "";
    };
  
  
    // ========================================================
    // CREATE / UPDATE AUDIT
    // ========================================================
  
    const handleSubmit = async (e) => {
  
        e.preventDefault();
  
        const validationError =
            validateForm();
  
        if (validationError) {
            setError(validationError);
            return;
        }
  
        try {
  
            setSaving(true);
            setError("");
            setSuccess("");
  
            const payload = {
                riskId: form.riskId,
  
                auditTitle:
                    form.auditTitle.trim(),
  
                description:
                    form.description?.trim() ||
                    "",
  
                department:
                    form.departmentId
                        ? {
                            id: form.departmentId,
                        }
                        : null,
  
                businessUnit:
                    form.businessUnit?.trim() ||
                    null,
  
                processName:
                    form.processName?.trim() ||
                    null,
  
                startDate:
                    form.startDate,
  
                endDate:
                    form.endDate,
            };
  
  
            console.log(
                "AUDIT PAYLOAD:",
                payload
            );
  
  
            if (modalMode === "create") {
  
                await createAudit(
                    payload
                );
  
                setSuccess(
                    "Audit created successfully."
                );
  
            } else {
  
                await updateAudit(
                    selectedAudit.id ??
                    selectedAudit.auditDbId,
                    payload
                );
  
                setSuccess(
                    "Audit updated successfully."
                );
            }
  
  
            setShowModal(false);
            resetForm();
  
            await fetchAudits();
  
        } catch (err) {
  
            console.error(
                "Failed to save audit:",
                err
            );
  
            setError(getErrorMessage(err));
  
        } finally {
            setSaving(false);
        }
    };
  
  
    // ========================================================
    // VIEW AUDIT
    // ========================================================
  
    const handleView = async (audit) => {
  
        const auditId =
            audit?.id ??
            audit?.auditDbId;
  
        if (!auditId) {
            setError(
                "Valid Audit ID is required."
            );
            return;
        }
  
        try {
  
            setViewLoading(true);
            setShowViewModal(true);
            setViewAudit(null);
  
            const data =
                await getAuditById(
                    auditId
                );
  
            setViewAudit(data);
  
        } catch (err) {
  
            console.error(
                "Failed to load audit:",
                err
            );
  
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load audit details."
            );
  
            setShowViewModal(false);
  
        } finally {
            setViewLoading(false);
        }
    };
  
  
    // ========================================================
    // DELETE AUDIT
    // ========================================================
  
    const handleDelete = async (audit) => {
  
        const auditId =
            audit?.id ??
            audit?.auditDbId;
  
        if (!auditId) {
            setError(
                "Valid Audit ID is required."
            );
            return;
        }
  
        const confirmed =
            window.confirm(
                `Are you sure you want to delete audit ${
                    audit?.auditId ??
                    audit?.auditCode ??
                    auditId
                }?`
            );
  
        if (!confirmed) return;
  
        try {
  
            setDeleteLoading(
                auditId
            );
  
            setError("");
  
            await deleteAudit(
                auditId
            );
  
            setSuccess(
                "Audit deleted successfully."
            );
  
            await fetchAudits();
  
        } catch (err) {
  
            console.error(
                "Failed to delete audit:",
                err
            );
  
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to delete audit."
            );
  
        } finally {
  
            setDeleteLoading(
                null
            );
        }
    };
  
  
    // ========================================================
    // FILTERED AUDITS
    // ========================================================
  
    const filteredAudits = useMemo(() => {
  
        return audits.filter(
            (audit) => {
  
                const search =
                    searchTerm
                        .trim()
                        .toLowerCase();
  
                const auditId =
                    String(
                        audit?.auditId ??
                        audit?.auditCode ??
                        audit?.id ??
                        ""
                    ).toLowerCase();
  
                const title =
                    String(
                        audit?.auditTitle ??
                        audit?.title ??
                        ""
                    ).toLowerCase();
  
                const riskId =
                    String(
                        audit?.riskId ??
                        audit?.risk?.riskId ??
                        audit?.risk?.id ??
                        ""
                    ).toLowerCase();
  
                const department =
                    getDepartmentName(
                        audit?.department
                    ).toLowerCase();
  
                const matchesSearch =
                    !search ||
                    auditId.includes(search) ||
                    title.includes(search) ||
                    riskId.includes(search) ||
                    department.includes(search);
  
  
                const status =
                    normalizeStatus(
                        audit?.status
                    );
  
                const matchesStatus =
                    statusFilter === "ALL" ||
                    status === statusFilter;
  
  
                const matchesDepartment =
                    departmentFilter === "ALL" ||
                    String(
                        getDepartmentId(
                            audit?.department
                        )
                    ) ===
                    String(
                        departmentFilter
                    );
  
  
                return (
                    matchesSearch &&
                    matchesStatus &&
                    matchesDepartment
                );
            }
        );
  
    }, [
        audits,
        searchTerm,
        statusFilter,
        departmentFilter,
    ]);
  
  
    // ========================================================
    // STATISTICS
    // ========================================================
  
    const statistics = useMemo(() => {
  
        const total =
            audits.length;
  
        const planned =
            audits.filter(
                (audit) =>
                    normalizeStatus(
                        audit.status
                    ) === "PLANNED"
            ).length;
  
        const inProgress =
            audits.filter(
                (audit) =>
                    normalizeStatus(
                        audit.status
                    ) === "IN_PROGRESS"
            ).length;
  
        const completed =
            audits.filter(
                (audit) =>
                    normalizeStatus(
                        audit.status
                    ) === "COMPLETED"
            ).length;
  
        return {
            total,
            planned,
            inProgress,
            completed,
        };
  
    }, [audits]);
  
  
    // ========================================================
    // STATUS BADGE
    // ========================================================
  
    const StatusBadge = ({
        status,
    }) => {
  
        const normalized =
            normalizeStatus(
                status
            );
  
        let classes =
            "bg-gray-100 text-gray-700";
  
        let Icon =
            Clock3;
  
        if (
            normalized ===
            "COMPLETED"
        ) {
  
            classes =
                "bg-green-100 text-green-700";
  
            Icon =
                CheckCircle2;
  
        } else if (
            normalized ===
            "IN_PROGRESS"
        ) {
  
            classes =
                "bg-blue-100 text-blue-700";
  
            Icon =
                Loader2;
  
        } else if (
            normalized ===
            "CANCELLED"
        ) {
  
            classes =
                "bg-red-100 text-red-700";
  
            Icon =
                AlertCircle;
  
        } else if (
            normalized ===
            "PLANNED"
        ) {
  
            classes =
                "bg-yellow-100 text-yellow-700";
  
            Icon =
                Clock3;
        }
  
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${classes}`}
            >
                <Icon size={14} />
  
                {formatStatus(
                    normalized
                )}
            </span>
        );
    };
  
  
    // ========================================================
    // RENDER
    // ========================================================
  
    return (
        <div className="min-h-screen bg-slate-50 p-6">
  
            {/* ==================================================
                HEADER
            ================================================== */}
  
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
  
                <div>
  
                    <div className="flex items-center gap-3">
  
                        <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
  
                            <ClipboardList
                                size={23}
                            />
  
                        </div>
  
                        <div>
  
                            <h1 className="text-2xl font-bold text-slate-800">
                                Audit Planning
                            </h1>
  
                            <p className="text-sm text-slate-500">
                                Audits assigned to you
                            </p>
  
                        </div>
  
                    </div>
  
                </div>
  
  
                <div className="flex items-center gap-2">
  
                    <button
                        type="button"
                        onClick={() => {
                            fetchAudits();
                            fetchAssignedRisks();
                        }}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                        <RotateCcw
                            size={17}
                            className={
                                loading
                                    ? "animate-spin"
                                    : ""
                            }
                        />
  
                        Refresh
                    </button>
  
                    <button
                        type="button"
                        onClick={
                            openCreateModal
                        }
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                    >
                        <Plus
                            size={18}
                        />
  
                        Create Audit
                    </button>
  
                </div>
  
            </div>
  
  
            {/* ==================================================
                ALERTS
            ================================================== */}
  
            {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
  
                    <AlertCircle
                        size={20}
                        className="mt-0.5 shrink-0"
                    />
  
                    <div className="flex-1 text-sm">
                        {error}
                    </div>
  
                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                    >
                        <X
                            size={18}
                        />
                    </button>
  
                </div>
            )}
  
  
            {success && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
  
                    <CheckCircle2
                        size={20}
                    />
  
                    <div className="flex-1 text-sm">
                        {success}
                    </div>
  
                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                    >
                        <X
                            size={18}
                        />
                    </button>
  
                </div>
            )}
  
  
            {/* ==================================================
                STATISTICS
            ================================================== */}
  
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
  
                    <div className="flex items-center justify-between">
  
                        <div>
  
                            <p className="text-sm text-slate-500">
                                My Assigned Audits
                            </p>
  
                            <p className="text-3xl font-bold text-slate-800 mt-1">
                                {statistics.total}
                            </p>
  
                        </div>
  
                        <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
  
                            <ClipboardList
                                size={21}
                            />
  
                        </div>
  
                    </div>
  
                </div>
  
  
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
  
                    <div className="flex items-center justify-between">
  
                        <div>
  
                            <p className="text-sm text-slate-500">
                                Planned
                            </p>
  
                            <p className="text-3xl font-bold text-slate-800 mt-1">
                                {statistics.planned}
                            </p>
  
                        </div>
  
                        <div className="w-11 h-11 rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center">
  
                            <Clock3
                                size={21}
                            />
  
                        </div>
  
                    </div>
  
                </div>
  
  
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
  
                    <div className="flex items-center justify-between">
  
                        <div>
  
                            <p className="text-sm text-slate-500">
                                In Progress
                            </p>
  
                            <p className="text-3xl font-bold text-slate-800 mt-1">
                                {statistics.inProgress}
                            </p>
  
                        </div>
  
                        <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
  
                            <Loader2
                                size={21}
                            />
  
                        </div>
  
                    </div>
  
                </div>
  
  
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
  
                    <div className="flex items-center justify-between">
  
                        <div>
  
                            <p className="text-sm text-slate-500">
                                Completed
                            </p>
  
                            <p className="text-3xl font-bold text-slate-800 mt-1">
                                {statistics.completed}
                            </p>
  
                        </div>
  
                        <div className="w-11 h-11 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
  
                            <CheckCircle2
                                size={21}
                            />
  
                        </div>
  
                    </div>
  
                </div>
  
            </div>
  
  
            {/* ==================================================
                FILTERS
            ================================================== */}
  
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
  
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
  
                    {/* SEARCH */}
  
                    <div className="relative">
  
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
  
                        <input
                            type="text"
                            value={
                                searchTerm
                            }
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                            placeholder="Search audit, risk, department..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                        />
  
                    </div>
  
  
                    {/* STATUS */}
  
                    <div className="relative">
  
                        <Filter
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
  
                        <select
                            value={
                                statusFilter
                            }
                            onChange={(e) =>
                                setStatusFilter(
                                    e.target.value
                                )
                            }
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                        >
  
                            <option value="ALL">
                                All Status
                            </option>
  
                            <option value="PLANNED">
                                Planned
                            </option>
  
                            <option value="IN_PROGRESS">
                                In Progress
                            </option>
  
                            <option value="COMPLETED">
                                Completed
                            </option>
  
                            <option value="CANCELLED">
                                Cancelled
                            </option>
  
                        </select>
  
                    </div>
  
  
                    {/* DEPARTMENT */}
  
                    <select
                        value={
                            departmentFilter
                        }
                        onChange={(e) =>
                            setDepartmentFilter(
                                e.target.value
                            )
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
  
                        <option value="ALL">
                            All Departments
                        </option>
  
                        {departments.map(
                            (department) => (
  
                                <option
                                    key={
                                        department.id
                                    }
                                    value={
                                        department.id
                                    }
                                >
                                    {
                                        department.name
                                    }
                                </option>
  
                            )
                        )}
  
                    </select>
  
                </div>
  
            </div>
  
  
            {/* ==================================================
                AUDIT TABLE
            ================================================== */}
  
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
  
                <div className="px-6 py-4 border-b border-slate-200">
  
                    <div className="flex items-center justify-between">
  
                        <div>
  
                            <h2 className="text-lg font-bold text-slate-800">
                                My Assigned Audits
                            </h2>
  
                            <p className="text-sm text-slate-500 mt-1">
                                Showing audits assigned to the logged-in Internal Auditor
                            </p>
  
                        </div>
  
                        <span className="text-sm font-semibold text-slate-600">
                            {filteredAudits.length} audit(s)
                        </span>
  
                    </div>
  
                </div>
  
  
                {loading ? (
  
                    <div className="flex items-center justify-center py-16">
  
                        <Loader2
                            size={30}
                            className="animate-spin text-blue-600"
                        />
  
                    </div>
  
                ) : filteredAudits.length === 0 ? (
  
                    <div className="py-16 text-center">
  
                        <ClipboardList
                            size={45}
                            className="mx-auto text-slate-300 mb-3"
                        />
  
                        <h3 className="text-lg font-semibold text-slate-700">
                            No assigned audits found
                        </h3>
  
                        <p className="text-sm text-slate-500 mt-1">
                            No audits are currently assigned to you.
                        </p>
  
                    </div>
  
                ) : (
  
                    <div className="overflow-x-auto">
  
                        <table className="w-full min-w-[1200px]">
  
                            <thead className="bg-slate-50">
  
                                <tr>
  
                                    <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase">
                                        Audit ID
                                    </th>
  
                                    <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase">
                                        Audit Title
                                    </th>
  
                                    <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase">
                                        Assigned Risk
                                    </th>
  
                                    <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase">
                                        Department
                                    </th>
  
                                    <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase">
                                        Business Unit
                                    </th>
  
                                    <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase">
                                        Process
                                    </th>
  
                                    <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase">
                                        Start Date
                                    </th>
  
                                    <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase">
                                        End Date
                                    </th>
  
                                    <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase">
                                        Status
                                    </th>
  
                                    <th className="text-right px-5 py-4 text-xs font-bold text-slate-500 uppercase">
                                        Actions
                                    </th>
  
                                </tr>
  
                            </thead>
  
  
                            <tbody className="divide-y divide-slate-100">
  
                                {filteredAudits.map(
                                    (audit) => {
  
                                        const auditId =
                                            audit?.id ??
                                            audit?.auditDbId;
  
                                        const displayAuditId =
                                            audit?.auditId ??
                                            audit?.auditCode ??
                                            auditId;
  
                                        const riskId =
                                            audit?.riskId ??
                                            audit?.risk?.riskId ??
                                            audit?.risk?.id ??
                                            "-";
  
                                        const riskTitle =
                                            audit?.risk?.title ??
                                            audit?.riskTitle ??
                                            "";
  
                                        const department =
                                            getDepartmentName(
                                                audit?.department
                                            );
  
                                        return (
  
                                            <tr
                                                key={
                                                    auditId
                                                }
                                                className="hover:bg-slate-50"
                                            >
  
                                                <td className="px-5 py-4">
  
                                                    <span className="font-semibold text-blue-600">
                                                        {
                                                            displayAuditId
                                                        }
                                                    </span>
  
                                                </td>
  
  
                                                <td className="px-5 py-4">
  
                                                    <div className="font-semibold text-slate-800">
                                                        {
                                                            audit?.auditTitle ??
                                                            audit?.title ??
                                                            "-"
                                                        }
                                                    </div>
  
                                                    {audit?.description && (
  
                                                        <div className="text-xs text-slate-500 mt-1 max-w-xs truncate">
                                                            {
                                                                audit.description
                                                            }
                                                        </div>
  
                                                    )}
  
                                                </td>
  
  
                                                <td className="px-5 py-4">
  
                                                    <div className="font-medium text-slate-700">
                                                        {
                                                            riskId
                                                        }
                                                    </div>
  
                                                    {riskTitle && (
  
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {
                                                                riskTitle
                                                            }
                                                        </div>
  
                                                    )}
  
                                                </td>
  
  
                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {
                                                        department
                                                    }
                                                </td>
  
  
                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {
                                                        audit?.businessUnit ??
                                                        "-"
                                                    }
                                                </td>
  
  
                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                    {
                                                        audit?.processName ??
                                                        "-"
                                                    }
                                                </td>
  
  
                                                <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
  
                                                    <div className="flex items-center gap-2">
  
                                                        <CalendarDays
                                                            size={15}
                                                            className="text-slate-400"
                                                        />
  
                                                        {
                                                            formatDate(
                                                                audit?.startDate
                                                            )
                                                        }
  
                                                    </div>
  
                                                </td>
  
  
                                                <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
  
                                                    <div className="flex items-center gap-2">
  
                                                        <CalendarDays
                                                            size={15}
                                                            className="text-slate-400"
                                                        />
  
                                                        {
                                                            formatDate(
                                                                audit?.endDate
                                                            )
                                                        }
  
                                                    </div>
  
                                                </td>
  
  
                                                <td className="px-5 py-4">
  
                                                    <StatusBadge
                                                        status={
                                                            audit?.status
                                                        }
                                                    />
  
                                                </td>
  
  
                                                <td className="px-5 py-4">
  
                                                    <div className="flex justify-end items-center gap-2">
  
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleView(
                                                                    audit
                                                                )
                                                            }
                                                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                                                            title="View"
                                                        >
                                                            <Eye
                                                                size={17}
                                                            />
                                                        </button>
  
  
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    audit
                                                                )
                                                            }
                                                            className="p-2 rounded-lg text-amber-600 hover:bg-amber-50"
                                                            title="Edit"
                                                        >
                                                            <Pencil
                                                                size={17}
                                                            />
                                                        </button>
  
  
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    audit
                                                                )
                                                            }
                                                            disabled={
                                                                deleteLoading ===
                                                                auditId
                                                            }
                                                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                            title="Delete"
                                                        >
  
                                                            {deleteLoading ===
                                                            auditId ? (
  
                                                                <Loader2
                                                                    size={17}
                                                                    className="animate-spin"
                                                                />
  
                                                            ) : (
  
                                                                <Trash2
                                                                    size={17}
                                                                />
  
                                                            )}
  
                                                        </button>
  
                                                    </div>
  
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
  
  
            {/* ==================================================
                CREATE / EDIT MODAL
            ================================================== */}
  
            {showModal && (
  
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
  
                    <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
  
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
  
                            <div>
  
                                <h2 className="text-xl font-bold text-slate-800">
                                    {
                                        modalMode === "create"
                                            ? "Create Audit"
                                            : "Edit Audit"
                                    }
                                </h2>
  
                                <p className="text-sm text-slate-500 mt-1">
                                    {
                                        modalMode === "create"
                                            ? "Create an audit for your assigned risk"
                                            : "Update audit details"
                                    }
                                </p>
  
                                {configurationLoading ? (
                                    <p className="text-xs text-blue-600 mt-2">Loading audit duration rules...</p>
                                ) : configurationError ? (
                                    <p className="text-xs text-red-600 mt-2">Audit duration rules could not be loaded.</p>
                                ) : minimumAuditDays !== null ? (
                                    <p className="text-xs text-emerald-600 mt-2 font-medium">Admin rule: minimum {minimumAuditDays} day{minimumAuditDays === 1 ? "" : "s"}.</p>
                                ) : (
                                    <p className="text-xs text-amber-600 mt-2">Minimum audit duration is not configured.</p>
                                )}
  
                            </div>
  
                            <button
                                type="button"
                                onClick={
                                    closeModal
                                }
                                className="p-2 rounded-lg hover:bg-slate-100"
                            >
                                <X
                                    size={20}
                                />
                            </button>
  
                        </div>
  
  
                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="p-6 space-y-5"
                        >
  
                            {/* RISK */}
  
                            <div>
  
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Assigned Risk
                                    <span className="text-red-500">
                                        {" "}*
                                    </span>
                                </label>
  
                                <select
                                    name="riskId"
                                    value={
                                        form.riskId
                                    }
                                    onChange={
                                        handleRiskChange
                                    }
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
  
                                    <option value="">
                                        Select Assigned Risk
                                    </option>
  
                                    {assignedRisks.map(
                                        (risk) => {
  
                                            const riskId =
                                                getRiskId(
                                                    risk
                                                );
  
                                            return (
  
                                                <option
                                                    key={
                                                        riskId
                                                    }
                                                    value={
                                                        riskId
                                                    }
                                                >
                                                    {riskId}
                                                    {" - "}
                                                    {
                                                        getRiskTitle(
                                                            risk
                                                        ) ||
                                                        "Risk"
                                                    }
                                                </option>
  
                                            );
  
                                        }
                                    )}
  
                                </select>
  
                                {assignedRisks.length === 0 && (
  
                                    <p className="text-xs text-amber-600 mt-2">
                                        No risks are currently assigned to you.
                                    </p>
  
                                )}
  
                            </div>
  
  
                            {/* TITLE */}
  
                            <div>
  
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Audit Title
                                    <span className="text-red-500">
                                        {" "}*
                                    </span>
                                </label>
  
                                <input
                                    type="text"
                                    name="auditTitle"
                                    value={
                                        form.auditTitle
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter audit title"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
  
                            </div>
  
  
                            {/* DESCRIPTION */}
  
                            <div>
  
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                                    rows={4}
                                    placeholder="Enter audit description"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
  
                            </div>
  
  
                            {/* DEPARTMENT + BUSINESS UNIT */}
  
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  
                                <div>
  
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Department
                                    </label>
  
                                    <select
                                        name="departmentId"
                                        value={
                                            form.departmentId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                                    >
  
                                        <option value="">
                                            Select Department
                                        </option>
  
                                        {departments.map(
                                            (
                                                department
                                            ) => (
  
                                                <option
                                                    key={
                                                        department.id
                                                    }
                                                    value={
                                                        department.id
                                                    }
                                                >
                                                    {
                                                        department.name
                                                    }
                                                </option>
  
                                            )
                                        )}
  
                                    </select>
  
                                </div>
  
  
                                <div>
  
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Business Unit
                                    </label>
  
                                    <input
                                        type="text"
                                        name="businessUnit"
                                        value={
                                            form.businessUnit
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter business unit"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
  
                                </div>
  
                            </div>
  
  
                            {/* PROCESS */}
  
                            <div>
  
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Process Name
                                </label>
  
                                <input
                                    type="text"
                                    name="processName"
                                    value={
                                        form.processName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter process name"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                                />
  
                            </div>
  
  
                            {/* DATES */}
  
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  
                                <div>
  
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Start Date
                                        <span className="text-red-500">
                                            {" "}*
                                        </span>
                                    </label>
  
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={form.startDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
  
                                    {minimumAuditDays !== null && (
                                        <p className="text-xs text-blue-600 mt-2">
                                            Minimum audit duration: {minimumAuditDays} day{minimumAuditDays === 1 ? "" : "s"}.
                                        </p>
                                    )}
  
                                </div>
  
                                <div>
  
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        End Date
                                        <span className="text-red-500">
                                            {" "}*
                                        </span>
                                    </label>
  
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={form.endDate}
                                        onChange={handleChange}
                                        min={
                                            form.startDate && minimumAuditDays !== null
                                                ? getMinimumEndDate(form.startDate, minimumAuditDays)
                                                : form.startDate || undefined
                                        }
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
  
                                    {form.startDate && minimumAuditDays !== null && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            Earliest allowed end date: {formatDate(getMinimumEndDate(form.startDate, minimumAuditDays))}
                                        </p>
                                    )}
  
                                </div>
  
                            </div>
  
                            {/* ACTIONS */}
  
                            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
  
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
  
                                <button
                                    type="submit"
                                    disabled={
                                        saving ||
                                        configurationLoading ||
                                        Boolean(configurationError) ||
                                        minimumAuditDays === null
                                    }
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                                >
  
                                    {saving && (
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                    )}
  
                                    {
                                        configurationLoading
                                            ? "Loading Rules..."
                                            : modalMode === "create"
                                                ? "Create Audit"
                                                : "Update Audit"
                                    }
  
                                </button>
  
                            </div>
  
                        </form>
  
                    </div>
  
                </div>
  
            )}
  
  
            {/* ==================================================
                VIEW MODAL
            ================================================== */}
  
            {showViewModal && (
  
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
  
                    <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
  
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
  
                            <div>
  
                                <h2 className="text-xl font-bold text-slate-800">
                                    Audit Details
                                </h2>
  
                                <p className="text-sm text-slate-500 mt-1">
                                    Detailed audit information
                                </p>
  
                            </div>
  
                            <button
                                type="button"
                                onClick={() =>
                                    setShowViewModal(
                                        false
                                    )
                                }
                                className="p-2 rounded-lg hover:bg-slate-100"
                            >
                                <X
                                    size={20}
                                />
                            </button>
  
                        </div>
  
  
                        <div className="p-6">
  
                            {viewLoading ? (
  
                                <div className="py-12 flex justify-center">
  
                                    <Loader2
                                        size={30}
                                        className="animate-spin text-blue-600"
                                    />
  
                                </div>
  
                            ) : viewAudit ? (
  
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
  
                                    <div className="p-4 rounded-xl bg-slate-50">
  
                                        <p className="text-xs text-slate-500">
                                            Audit ID
                                        </p>
  
                                        <p className="font-semibold text-slate-800 mt-1">
                                            {
                                                viewAudit.auditId ??
                                                viewAudit.auditCode ??
                                                viewAudit.id ??
                                                viewAudit.auditDbId ??
                                                "-"
                                            }
                                        </p>
  
                                    </div>
  
  
                                    <div className="p-4 rounded-xl bg-slate-50">
  
                                        <p className="text-xs text-slate-500">
                                            Status
                                        </p>
  
                                        <div className="mt-2">
  
                                            <StatusBadge
                                                status={
                                                    viewAudit.status
                                                }
                                            />
  
                                        </div>
  
                                    </div>
  
  
                                    <div className="p-4 rounded-xl bg-slate-50 md:col-span-2">
  
                                        <p className="text-xs text-slate-500">
                                            Audit Title
                                        </p>
  
                                        <p className="font-semibold text-slate-800 mt-1">
                                            {
                                                viewAudit.auditTitle ??
                                                viewAudit.title ??
                                                "-"
                                            }
                                        </p>
  
                                    </div>
  
  
                                    <div className="p-4 rounded-xl bg-slate-50">
  
                                        <p className="text-xs text-slate-500">
                                            Risk ID
                                        </p>
  
                                        <p className="font-semibold text-slate-800 mt-1">
                                            {
                                                viewAudit.riskId ??
                                                viewAudit.risk?.riskId ??
                                                viewAudit.risk?.id ??
                                                "-"
                                            }
                                        </p>
  
                                    </div>
  
  
                                    <div className="p-4 rounded-xl bg-slate-50">
  
                                        <p className="text-xs text-slate-500">
                                            Department
                                        </p>
  
                                        <p className="font-semibold text-slate-800 mt-1">
                                            {
                                                getDepartmentName(
                                                    viewAudit.department
                                                )
                                            }
                                        </p>
  
                                    </div>
  
  
                                    <div className="p-4 rounded-xl bg-slate-50">
  
                                        <p className="text-xs text-slate-500">
                                            Business Unit
                                        </p>
  
                                        <p className="font-semibold text-slate-800 mt-1">
                                            {
                                                viewAudit.businessUnit ??
                                                "-"
                                            }
                                        </p>
  
                                    </div>
  
  
                                    <div className="p-4 rounded-xl bg-slate-50">
  
                                        <p className="text-xs text-slate-500">
                                            Process
                                        </p>
  
                                        <p className="font-semibold text-slate-800 mt-1">
                                            {
                                                viewAudit.processName ??
                                                "-"
                                            }
                                        </p>
  
                                    </div>
  
  
                                    <div className="p-4 rounded-xl bg-slate-50">
  
                                        <p className="text-xs text-slate-500">
                                            Start Date
                                        </p>
  
                                        <p className="font-semibold text-slate-800 mt-1">
                                            {
                                                formatDate(
                                                    viewAudit.startDate
                                                )
                                            }
                                        </p>
  
                                    </div>
  
  
                                    <div className="p-4 rounded-xl bg-slate-50">
  
                                        <p className="text-xs text-slate-500">
                                        {minimumAuditDays !== null && (
                                         <p className="text-xs text-blue-600 mt-2">
                                             Minimum audit duration: {minimumAuditDays} day{minimumAuditDays === 1 ? "" : "s"}.
                                         </p>
                                     )}
  
                                         End Date
                                        </p>
  
                                        <p className="font-semibold text-slate-800 mt-1">
                                            {
                                                formatDate(
                                                    viewAudit.endDate
                                                )
                                            }
                                        </p>
  
                                    </div>
  
  
                                    <div className="p-4 rounded-xl bg-slate-50 md:col-span-2">
  
                                        <p className="text-xs text-slate-500">
                                            Description
                                        </p>
  
                                        <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
                                            {
                                                viewAudit.description ||
                                                "No description available."
                                            }
                                        </p>
  
                                    </div>
  
                                </div>
  
                            ) : (
  
                                <div className="text-center py-10 text-slate-500">
                                    Audit details not available.
                                </div>
  
                            )}
  
                        </div>
  
  
                        <div className="border-t border-slate-200 px-6 py-4 flex justify-end">
  
                            <button
                                type="button"
                                onClick={() =>
                                    setShowViewModal(
                                        false
                                    )
                                }
                                className="px-5 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-900"
                            >
                                Close
                            </button>
  
                        </div>
  
                    </div>
  
                </div>
  
            )}
  
        </div>
    );
  };
  
  export default AuditPlanning;