
import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Search,
    Plus,
    RotateCcw,
    AlertOctagon,
    FileSearch,
} from "lucide-react";

import {
    getFindingsByAuditorId,
    getAuditsForCurrentAuditor,
    createFinding,
    updateFinding,
    deleteFinding,
} from "../../service/FindingService";

import FindingTable from "../../components/interanl-auditor/finding/FindingTable";
import FindingForm from "../../components/interanl-auditor/finding/FindingForm";

const EMPTY_FILTERS = {
    riskLevel: "",
    status: "",
};

const Findings = () => {
    // ============================================================
    // STATE
    // ============================================================

    const [findings, setFindings] = useState([]);
    const [audits, setAudits] = useState([]);

    const [loading, setLoading] = useState(true);
    const [auditsLoading, setAuditsLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState(null);
    const [auditError, setAuditError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");

    const [filters, setFilters] = useState(EMPTY_FILTERS);

    const [formOpen, setFormOpen] = useState(false);

    const [editingFinding, setEditingFinding] = useState(null);

    const [selectedFinding, setSelectedFinding] = useState(null);

    // ============================================================
    // GET CURRENT USER
    // ============================================================

    const getCurrentUser = () => {
        try {
            const user =
                JSON.parse(localStorage.getItem("user")) ||
                JSON.parse(localStorage.getItem("currentUser"));

            return user;
        } catch (err) {
            console.error("Unable to read current user:", err);
            return null;
        }
    };

    // ============================================================
    // GET CURRENT INTERNAL AUDITOR ID
    // ============================================================

    const getCurrentAuditorId = () => {
        const user = getCurrentUser();

        if (!user) {
            return null;
        }

        return (
            user.auditorId ??
            user.userId ??
            user.id ??
            user.employeeId ??
            null
        );
    };

    // ============================================================
    // FETCH FINDINGS
    //
    // IMPORTANT:
    // Only findings belonging to the logged-in Internal Auditor
    // are loaded.
    //
    // GET /api/findings/auditor/{auditorId}
    // ============================================================

    const fetchFindings = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const auditorId = getCurrentAuditorId();

            console.log(
                "CURRENT INTERNAL AUDITOR ID:",
                auditorId
            );

            if (!auditorId) {
                throw new Error(
                    "Internal Auditor ID not found. Please login again."
                );
            }

            const data = await getFindingsByAuditorId(auditorId);

            console.log(
                "INTERNAL AUDITOR FINDINGS:",
                data
            );

            setFindings(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (err) {
            console.error(
                "Failed to load Internal Auditor findings:",
                err
            );

            setFindings([]);

            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load your findings."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // ============================================================
    // FETCH MY ASSIGNED AUDITS
    //
    // Backend resolves current auditor from JWT.
    // ============================================================

    const fetchAssignedAudits = useCallback(async () => {
        setAuditsLoading(true);
        setAuditError(null);

        try {
            const data =
                await getAuditsForCurrentAuditor();

            console.log(
                "MY ASSIGNED AUDITS:",
                data
            );

            setAudits(
                Array.isArray(data)
                    ? data
                    : []
            );
        } catch (err) {
            console.error(
                "Failed to load assigned audits:",
                err
            );

            setAudits([]);

            setAuditError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Unable to load assigned audits."
            );
        } finally {
            setAuditsLoading(false);
        }
    }, []);

    // ============================================================
    // INITIAL LOAD
    // ============================================================

    useEffect(() => {
        fetchFindings();
        fetchAssignedAudits();
    }, [
        fetchFindings,
        fetchAssignedAudits,
    ]);

    // ============================================================
    // FILTER FINDINGS
    // ============================================================

    const visibleFindings = useMemo(() => {
        let result = [...findings];

        const term = searchTerm
            .trim()
            .toLowerCase();

        // --------------------------------------------------------
        // SEARCH
        // --------------------------------------------------------

        if (term) {
            result = result.filter(
                (finding) =>
                    finding.title
                        ?.toLowerCase()
                        .includes(term) ||

                    finding.auditId
                        ?.toString()
                        .toLowerCase()
                        .includes(term) ||

                    finding.auditName
                        ?.toLowerCase()
                        .includes(term) ||

                    finding.observation
                        ?.toLowerCase()
                        .includes(term) ||

                    finding.findingId
                        ?.toString()
                        .toLowerCase()
                        .includes(term)
            );
        }

        // --------------------------------------------------------
        // RISK LEVEL
        // --------------------------------------------------------

        if (filters.riskLevel) {
            result = result.filter(
                (finding) =>
                    finding.riskLevel ===
                    filters.riskLevel
            );
        }

        // --------------------------------------------------------
        // STATUS
        // --------------------------------------------------------

        if (filters.status) {
            result = result.filter(
                (finding) =>
                    finding.status ===
                    filters.status
            );
        }

        return result;
    }, [
        findings,
        searchTerm,
        filters,
    ]);

    // ============================================================
    // CREATE FINDING
    // ============================================================

    const handleCreate = () => {
        if (auditsLoading) {
            return;
        }

        if (audits.length === 0) {
            alert(
                "No audits are assigned to you. You cannot create a finding."
            );

            return;
        }

        setEditingFinding(null);
        setFormOpen(true);
    };

    // ============================================================
    // EDIT FINDING
    // ============================================================

    const handleEdit = (finding) => {
        setEditingFinding(finding);
        setFormOpen(true);
    };

    // ============================================================
    // SAVE FINDING
    // ============================================================

    const handleSave = async (formData) => {
        setSaving(true);

        try {
            console.log(
                "FINDING PAYLOAD:",
                formData
            );

            if (editingFinding) {
                await updateFinding(
                    editingFinding.id,
                    formData
                );
            } else {
                await createFinding(
                    formData
                );
            }

            setFormOpen(false);
            setEditingFinding(null);

            await fetchFindings();
        } catch (err) {
            console.error(
                "Failed to save finding:",
                err
            );

            alert(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to save finding."
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // DELETE FINDING
    // ============================================================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this finding?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteFinding(id);

            await fetchFindings();
        } catch (err) {
            console.error(
                "Failed to delete finding:",
                err
            );

            alert(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to delete finding."
            );
        }
    };

    // ============================================================
    // CLEAR FILTERS
    // ============================================================

    const clearFilters = () => {
        setFilters({
            ...EMPTY_FILTERS,
        });

        setSearchTerm("");
    };

    // ============================================================
    // STATISTICS
    // ============================================================

    const stats = useMemo(() => {
        return {
            total: findings.length,

            draft: findings.filter(
                (f) =>
                    f.status === "DRAFT"
            ).length,

            submitted: findings.filter(
                (f) =>
                    f.status === "SUBMITTED"
            ).length,

            reviewed: findings.filter(
                (f) =>
                    f.status === "REVIEWED"
            ).length,

            approved: findings.filter(
                (f) =>
                    f.status === "APPROVED"
            ).length,

            rejected: findings.filter(
                (f) =>
                    f.status === "REJECTED"
            ).length,

            critical: findings.filter(
                (f) =>
                    f.riskLevel === "CRITICAL"
            ).length,
        };
    }, [findings]);

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="min-h-full bg-gray-50 px-6 py-7 sm:px-8">

            {/* ======================================================
                HEADER
            ====================================================== */}

            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">

                <div>

                    <div className="flex items-center gap-2">

                        <FileSearch
                            size={22}
                            className="text-[#00A874]"
                        />

                        <h1 className="text-xl font-bold text-[#101A33]">
                            Findings
                        </h1>

                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                        Create and manage findings identified during your assigned audits.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={handleCreate}
                    disabled={
                        auditsLoading ||
                        audits.length === 0
                    }
                    className="flex items-center gap-2 bg-[#00C98B] hover:bg-[#00A874] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition active:scale-95"
                >
                    <Plus size={16} />

                    {auditsLoading
                        ? "Loading Audits..."
                        : "Create Finding"}
                </button>

            </div>

            {/* ======================================================
                ASSIGNED AUDIT ERROR
            ====================================================== */}

            {auditError && (
                <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">

                    <p className="text-sm font-semibold text-red-700">
                        Unable to load assigned audits
                    </p>

                    <p className="text-xs text-red-600 mt-1">
                        {auditError}
                    </p>

                    <button
                        type="button"
                        onClick={fetchAssignedAudits}
                        className="mt-2 text-xs font-semibold text-red-700 underline"
                    >
                        Retry
                    </button>

                </div>
            )}

            {/* ======================================================
                ASSIGNED AUDIT INFO
            ====================================================== */}

            {!auditsLoading &&
                !auditError &&
                audits.length > 0 && (
                    <div className="mb-5 bg-[#E5FAF3] border border-[#B8EBDD] rounded-xl px-4 py-3">

                        <p className="text-sm font-semibold text-[#007A5A]">
                            {audits.length} audit
                            {audits.length !== 1
                                ? "s"
                                : ""}{" "}
                            assigned to you
                        </p>

                        <p className="text-xs text-[#008F6A] mt-1">
                            You can create findings for these assigned audits.
                        </p>

                    </div>
                )}

            {/* ======================================================
                NO ASSIGNED AUDITS
            ====================================================== */}

            {!auditsLoading &&
                !auditError &&
                audits.length === 0 && (
                    <div className="mb-5 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">

                        <p className="text-sm font-semibold text-yellow-700">
                            No audits assigned
                        </p>

                        <p className="text-xs text-yellow-600 mt-1">
                            You currently have no audits assigned to you.
                            Findings cannot be created until an audit is assigned.
                        </p>

                    </div>
                )}

            {/* ======================================================
                STATS
            ====================================================== */}

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">

                <StatCard
                    label="Total"
                    value={stats.total}
                />

                <StatCard
                    label="Draft"
                    value={stats.draft}
                />

                <StatCard
                    label="Submitted"
                    value={stats.submitted}
                />

                <StatCard
                    label="Reviewed"
                    value={stats.reviewed}
                />

                <StatCard
                    label="Approved"
                    value={stats.approved}
                />

                <StatCard
                    label="Critical"
                    value={stats.critical}
                />

            </div>

            {/* ======================================================
                SEARCH + FILTER
            ====================================================== */}

            <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-5">

                <div className="flex flex-wrap items-center gap-3">

                    {/* SEARCH */}

                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 w-full md:w-80 focus-within:border-[#00C98B] focus-within:ring-2 focus-within:ring-[#E5FAF3] transition">

                        <Search
                            size={16}
                            className="text-gray-400"
                        />

                        <input
                            type="text"
                            placeholder="Search your findings..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                            className="text-sm w-full outline-none bg-transparent"
                        />

                    </div>

                    {/* RISK LEVEL */}

                    <select
                        value={filters.riskLevel}
                        onChange={(e) =>
                            setFilters(
                                (prev) => ({
                                    ...prev,
                                    riskLevel:
                                        e.target.value,
                                })
                            )
                        }
                        className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white outline-none focus:border-[#00C98B]"
                    >

                        <option value="">
                            All Risk Levels
                        </option>

                        <option value="LOW">
                            Low
                        </option>

                        <option value="MEDIUM">
                            Medium
                        </option>

                        <option value="HIGH">
                            High
                        </option>

                        <option value="CRITICAL">
                            Critical
                        </option>

                    </select>

                    {/* STATUS */}

                    <select
                        value={filters.status}
                        onChange={(e) =>
                            setFilters(
                                (prev) => ({
                                    ...prev,
                                    status:
                                        e.target.value,
                                })
                            )
                        }
                        className="border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-white outline-none focus:border-[#00C98B]"
                    >

                        <option value="">
                            All Statuses
                        </option>

                        <option value="DRAFT">
                            Draft
                        </option>

                        <option value="SUBMITTED">
                            Submitted
                        </option>

                        <option value="REVIEWED">
                            Reviewed
                        </option>

                        <option value="APPROVED">
                            Approved
                        </option>

                        <option value="REJECTED">
                            Rejected
                        </option>

                    </select>

                    {/* CLEAR */}

                    <button
                        type="button"
                        onClick={clearFilters}
                        className="text-sm font-semibold text-gray-500 hover:text-[#00A874] px-3 py-2.5"
                    >
                        Clear
                    </button>

                </div>

            </div>

            {/* ======================================================
                FINDINGS ERROR
            ====================================================== */}

            {error ? (
                <div className="bg-white border border-gray-200 rounded-2xl py-16 flex flex-col items-center text-center">

                    <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">

                        <AlertOctagon
                            size={24}
                        />

                    </div>

                    <h3 className="text-base font-bold text-[#101A33]">
                        Unable to load your findings
                    </h3>

                    <p className="text-sm text-gray-500 mt-1 mb-4">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={fetchFindings}
                        className="flex items-center gap-2 bg-[#00C98B] hover:bg-[#00A874] text-white rounded-lg px-4 py-2 text-sm font-semibold"
                    >

                        <RotateCcw
                            size={14}
                        />

                        Retry

                    </button>

                </div>
            ) : (
                <FindingTable
                    findings={visibleFindings}
                    loading={loading}
                    onView={setSelectedFinding}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {/* ======================================================
                CREATE / EDIT FORM
            ====================================================== */}

            {formOpen && (
                <FindingForm
                    initialData={editingFinding}
                    audits={audits}
                    onClose={() => {
                        setFormOpen(false);
                        setEditingFinding(null);
                    }}
                    onSave={handleSave}
                    saving={saving}
                />
            )}

            {/* ======================================================
                VIEW FINDING
            ====================================================== */}

            {selectedFinding && (
                <FindingView
                    finding={selectedFinding}
                    onClose={() =>
                        setSelectedFinding(null)
                    }
                />
            )}

        </div>
    );
};

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
    label,
    value,
}) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4">

        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {label}
        </p>

        <p className="text-2xl font-bold text-[#101A33] mt-1">
            {value}
        </p>

    </div>
);

// ============================================================
// VIEW FINDING
// ============================================================

const FindingView = ({
    finding,
    onClose,
}) => (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

        <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden">

            {/* HEADER */}

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">

                <div>

                    <h2 className="text-lg font-bold text-[#101A33]">
                        Finding Details
                    </h2>

                    <p className="text-xs text-gray-500 mt-1">
                        Finding #
                        {finding.findingId ||
                            finding.id}
                    </p>

                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="w-9 h-9 rounded-lg hover:bg-gray-100 text-gray-500 text-xl"
                >
                    ×
                </button>

            </div>

            {/* BODY */}

            <div className="p-6 overflow-y-auto">

                <div className="mb-5">

                    <p className="text-xs font-bold uppercase text-gray-400">
                        Title
                    </p>

                    <p className="text-base font-semibold text-[#101A33] mt-1">
                        {finding.title || "—"}
                    </p>

                </div>

                <div className="grid grid-cols-2 gap-5 mb-5">

                    <Info
                        label="Audit ID"
                        value={finding.auditId}
                    />

                    <Info
                        label="Audit Name"
                        value={finding.auditName}
                    />

                    <Info
                        label="Risk Level"
                        value={finding.riskLevel}
                    />

                    <Info
                        label="Status"
                        value={finding.status}
                    />

                    <Info
                        label="Auditor"
                        value={
                            finding.auditorName ||
                            finding.internalAuditorName
                        }
                    />

                    <Info
                        label="Created At"
                        value={finding.createdAt}
                    />

                </div>

                <Info
                    label="Observation"
                    value={finding.observation}
                    large
                />

                <Info
                    label="Recommendation"
                    value={finding.recommendation}
                    large
                />

            </div>

        </div>

    </div>
);

// ============================================================
// INFO
// ============================================================

const Info = ({
    label,
    value,
    large = false,
}) => (
    <div
        className={
            large
                ? "mb-5"
                : ""
        }
    >

        <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            {label}
        </p>

        <p className="text-sm text-[#101A33] mt-1 whitespace-pre-wrap">
            {value || "—"}
        </p>

    </div>
);

export default Findings;
