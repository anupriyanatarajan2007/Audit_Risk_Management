// src/pages/internal-auditor/InternalAuditorResponses.jsx

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    RefreshCw,
    Search,
    MessageSquareText,
    Eye,
    X,
    AlertCircle,
    CheckCircle2,
    Clock3,
    User,
    FileText,
    Calendar,
    ChevronDown,
    Inbox,
} from "lucide-react";

import { getMyAssignedAudits } from "../../service/AuditService";

import {
    getFindingsByAuditorId,
    getAllFindings,
} from "../../service/findingService";

import {
    getResponsesByFinding,
} from "../../service/AuditeeResponseService";


// ============================================================
// HELPERS
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

    return [];
};


const getCurrentUser = () => {
    try {
        return (
            JSON.parse(localStorage.getItem("user")) ||
            JSON.parse(localStorage.getItem("currentUser"))
        );
    } catch {
        return null;
    }
};


const getCurrentAuditorId = () => {
    const user = getCurrentUser();

    if (!user) {
        return null;
    }

    return (
        user.auditorId ||
        user.userId ||
        user.id ||
        user.employeeId ||
        null
    );
};


const formatDate = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


const formatDateTime = (value) => {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};


const formatLabel = (value) => {
    if (!value) {
        return "—";
    }

    return String(value)
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};


const getFindingId = (finding) => {
    return (
        finding?.findingId ||
        finding?.id ||
        finding?.findingID ||
        null
    );
};


const getAuditId = (audit) => {
    return audit?.auditId || audit?.id || null;
};


const getFindingAuditId = (finding) => {
    return (
        finding?.auditId ||
        finding?.audit?.auditId ||
        finding?.audit?.id ||
        null
    );
};


const getResponseId = (response) => {
    return (
        response?.responseId ||
        response?.id ||
        response?.auditeeResponseId ||
        null
    );
};


const getResponseText = (response) => {
    return (
        response?.response ||
        response?.responseText ||
        response?.auditeeResponse ||
        response?.comments ||
        response?.description ||
        response?.remarks ||
        ""
    );
};


const getAuditeeName = (response) => {
    if (!response) {
        return "Auditee";
    }

    if (response.auditeeName) {
        return response.auditeeName;
    }

    if (response.userName) {
        return response.userName;
    }

    if (response.auditee?.name) {
        return response.auditee.name;
    }

    if (response.auditee?.fullName) {
        return response.auditee.fullName;
    }

    if (response.auditee?.firstName) {
        return `${response.auditee.firstName} ${
            response.auditee.lastName || ""
        }`.trim();
    }

    if (response.user?.name) {
        return response.user.name;
    }

    if (response.user?.fullName) {
        return response.user.fullName;
    }

    return "Auditee";
};


// ============================================================
// STATUS BADGE
// ============================================================

const ResponseStatusBadge = ({ status }) => {
    const normalized = String(status || "")
        .toUpperCase()
        .trim();

    let className =
        "bg-gray-100 text-gray-600 border-gray-200";

    let icon = <Clock3 size={12} />;

    if (
        normalized === "SUBMITTED" ||
        normalized === "PENDING_REVIEW" ||
        normalized === "PENDING"
    ) {
        className =
            "bg-amber-50 text-amber-700 border-amber-200";

        icon = <Clock3 size={12} />;
    }

    if (
        normalized === "REVIEWED" ||
        normalized === "APPROVED" ||
        normalized === "ACCEPTED"
    ) {
        className =
            "bg-emerald-50 text-emerald-700 border-emerald-200";

        icon = <CheckCircle2 size={12} />;
    }

    if (
        normalized === "REJECTED" ||
        normalized === "RETURNED"
    ) {
        className =
            "bg-red-50 text-red-700 border-red-200";

        icon = <AlertCircle size={12} />;
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${className}`}
        >
            {icon}
            {formatLabel(status || "SUBMITTED")}
        </span>
    );
};


// ============================================================
// RISK BADGE
// ============================================================

const RiskBadge = ({ level }) => {
    const normalized = String(level || "").toUpperCase();

    let className = "bg-gray-100 text-gray-600";

    if (normalized === "CRITICAL") {
        className = "bg-red-100 text-red-700";
    } else if (normalized === "HIGH") {
        className = "bg-orange-100 text-orange-700";
    } else if (normalized === "MEDIUM") {
        className = "bg-amber-100 text-amber-700";
    } else if (normalized === "LOW") {
        className = "bg-emerald-100 text-emerald-700";
    }

    return (
        <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${className}`}
        >
            {formatLabel(level || "UNKNOWN")}
        </span>
    );
};


// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({
    title,
    value,
    icon: Icon,
    tone = "teal",
}) => {
    const tones = {
        teal: "bg-[#E5FAF3] text-[#00A874]",
        amber: "bg-amber-50 text-amber-600",
        green: "bg-emerald-50 text-emerald-600",
        red: "bg-red-50 text-red-600",
        blue: "bg-blue-50 text-blue-600",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-gray-500">
                        {title}
                    </p>

                    <p className="text-2xl font-bold text-[#101A33] mt-2">
                        {value}
                    </p>
                </div>

                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tones[tone]
                    }`}
                >
                    <Icon size={19} />
                </div>
            </div>
        </motion.div>
    );
};


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function InternalAuditorResponses() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [audits, setAudits] = useState([]);
    const [findings, setFindings] = useState([]);
    const [responses, setResponses] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [riskFilter, setRiskFilter] = useState("ALL");

    const [selectedResponse, setSelectedResponse] = useState(null);

    const [error, setError] = useState("");


    // ========================================================
    // LOAD DATA
    // ========================================================

    const loadResponses = useCallback(
        async (isRefresh = false) => {
            try {
                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                // ------------------------------------------------
                // 1. GET ONLY AUDITS ASSIGNED TO CURRENT AUDITOR
                // ------------------------------------------------

                const auditsResponse = await getMyAssignedAudits();

                const assignedAudits = normalizeArray(auditsResponse);

                setAudits(assignedAudits);

                console.log(
                    "INTERNAL AUDITOR - ASSIGNED AUDITS:",
                    assignedAudits
                );


                // ------------------------------------------------
                // 2. GET FINDINGS FOR CURRENT INTERNAL AUDITOR
                // ------------------------------------------------

                const auditorId = getCurrentAuditorId();

                let auditorFindings = [];

                try {
                    if (auditorId) {
                        const findingResponse =
                            await getFindingsByAuditorId(auditorId);

                        auditorFindings =
                            normalizeArray(findingResponse);
                    }
                } catch (findingError) {
                    console.warn(
                        "Could not fetch findings by auditor ID:",
                        findingError
                    );
                }


                // ------------------------------------------------
                // FALLBACK
                // ------------------------------------------------

                if (auditorFindings.length === 0) {
                    try {
                        const allFindingResponse =
                            await getAllFindings();

                        const allFindings =
                            normalizeArray(allFindingResponse);

                        const assignedAuditIds = new Set(
                            assignedAudits
                                .map(getAuditId)
                                .filter(Boolean)
                                .map(String)
                        );

                        auditorFindings = allFindings.filter(
                            (finding) => {
                                const auditId =
                                    getFindingAuditId(finding);

                                if (!auditId) {
                                    return false;
                                }

                                return assignedAuditIds.has(
                                    String(auditId)
                                );
                            }
                        );
                    } catch (fallbackError) {
                        console.error(
                            "Fallback findings fetch failed:",
                            fallbackError
                        );
                    }
                }


                // ------------------------------------------------
                // IMPORTANT:
                // FILTER FINDINGS TO ONLY ASSIGNED AUDITS
                // ------------------------------------------------

                const assignedAuditIds = new Set(
                    assignedAudits
                        .map(getAuditId)
                        .filter(Boolean)
                        .map(String)
                );

                auditorFindings = auditorFindings.filter(
                    (finding) => {
                        const auditId =
                            getFindingAuditId(finding);

                        if (!auditId) {
                            return false;
                        }

                        return assignedAuditIds.has(
                            String(auditId)
                        );
                    }
                );

                setFindings(auditorFindings);

                console.log(
                    "INTERNAL AUDITOR - ASSIGNED FINDINGS:",
                    auditorFindings
                );


                // ------------------------------------------------
                // 3. GET RESPONSE FOR EACH ASSIGNED FINDING
                // ------------------------------------------------

                const responseResults =
                    await Promise.all(
                        auditorFindings.map(async (finding) => {
                            const findingId =
                                getFindingId(finding);

                            if (!findingId) {
                                return [];
                            }

                            try {
                                const response =
                                    await getResponsesByFinding(
                                        findingId
                                    );

                                const responseArray =
                                    normalizeArray(response);

                                return responseArray.map(
                                    (auditeeResponse) => ({
                                        ...auditeeResponse,

                                        _finding: finding,

                                        _audit:
                                            assignedAudits.find(
                                                (audit) =>
                                                    String(
                                                        getAuditId(
                                                            audit
                                                        )
                                                    ) ===
                                                    String(
                                                        getFindingAuditId(
                                                            finding
                                                        )
                                                    )
                                            ),
                                    })
                                );
                            } catch (responseError) {
                                console.warn(
                                    `No response found for finding ${findingId}`,
                                    responseError
                                );

                                return [];
                            }
                        })
                    );


                // ------------------------------------------------
                // FLATTEN RESPONSES
                // ------------------------------------------------

                const finalResponses =
                    responseResults.flat();

                setResponses(finalResponses);

                console.log(
                    "INTERNAL AUDITOR - AUDITEE RESPONSES:",
                    finalResponses
                );
            } catch (err) {
                console.error(
                    "Internal Auditor Responses load error:",
                    err
                );

                if (!err?.response) {
                    setError(
                        "Unable to connect to the server."
                    );
                } else if (
                    err?.response?.status === 401
                ) {
                    setError(
                        "Your session has expired. Please login again."
                    );
                } else if (
                    err?.response?.status === 403
                ) {
                    setError(
                        "You do not have permission to view these responses."
                    );
                } else {
                    setError(
                        "Unable to load auditee responses."
                    );
                }
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );


    useEffect(() => {
        loadResponses();
    }, [loadResponses]);


    // ========================================================
    // DERIVED DATA
    // ========================================================

    const stats = useMemo(() => {
        const submitted = responses.filter((response) => {
            const status =
                String(response.status || "")
                    .toUpperCase();

            return [
                "SUBMITTED",
                "PENDING",
                "PENDING_REVIEW",
            ].includes(status);
        }).length;

        const reviewed = responses.filter((response) => {
            const status =
                String(response.status || "")
                    .toUpperCase();

            return [
                "REVIEWED",
                "APPROVED",
                "ACCEPTED",
            ].includes(status);
        }).length;

        const rejected = responses.filter((response) => {
            const status =
                String(response.status || "")
                    .toUpperCase();

            return [
                "REJECTED",
                "RETURNED",
            ].includes(status);
        }).length;

        return {
            total: responses.length,
            submitted,
            reviewed,
            rejected,
        };
    }, [responses]);


    // ========================================================
    // FILTER
    // ========================================================

    const filteredResponses = useMemo(() => {
        const search = searchTerm
            .trim()
            .toLowerCase();

        return responses.filter((item) => {
            const finding = item._finding || {};
            const audit = item._audit || {};

            const responseText =
                getResponseText(item);

            const auditee =
                getAuditeeName(item);

            const matchesSearch =
                !search ||
                String(
                    finding.findingId ||
                        finding.id ||
                        ""
                )
                    .toLowerCase()
                    .includes(search) ||
                String(
                    finding.title ||
                        finding.description ||
                        ""
                )
                    .toLowerCase()
                    .includes(search) ||
                String(
                    audit.auditId ||
                        audit.id ||
                        ""
                )
                    .toLowerCase()
                    .includes(search) ||
                String(
                    audit.auditTitle ||
                        audit.auditName ||
                        ""
                )
                    .toLowerCase()
                    .includes(search) ||
                responseText
                    .toLowerCase()
                    .includes(search) ||
                auditee
                    .toLowerCase()
                    .includes(search);

            const matchesStatus =
                statusFilter === "ALL" ||
                String(item.status || "")
                    .toUpperCase() === statusFilter;

            const matchesRisk =
                riskFilter === "ALL" ||
                String(
                    finding.riskLevel || ""
                ).toUpperCase() === riskFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesRisk
            );
        });
    }, [
        responses,
        searchTerm,
        statusFilter,
        riskFilter,
    ]);


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {
        return (
            <div className="w-full space-y-6">
                <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map(
                        (_, index) => (
                            <div
                                key={index}
                                className="h-28 bg-gray-100 rounded-2xl animate-pulse"
                            />
                        )
                    )}
                </div>

                <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
        );
    }


    // ========================================================
    // ERROR
    // ========================================================

    if (error) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
                    <AlertCircle size={26} />
                </div>

                <h2 className="text-lg font-bold text-[#101A33]">
                    Unable to load responses
                </h2>

                <p className="text-sm text-gray-500 mt-1 mb-5">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() => loadResponses()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00C98B] hover:bg-[#00A874] text-white text-sm font-semibold"
                >
                    <RefreshCw size={15} />
                    Retry
                </button>
            </div>
        );
    }


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="w-full space-y-6 pb-10">

            {/* =================================================
                HEADER
            ================================================= */}

            <motion.div
                initial={{
                    opacity: 0,
                    y: -10,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                className="flex flex-wrap items-start justify-between gap-4"
            >
                <div>
                    <h1 className="text-xl font-bold text-[#101A33]">
                        Auditee Responses
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Review responses submitted by auditees
                        for your assigned findings.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        loadResponses(true)
                    }
                    disabled={refreshing}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                    <RefreshCw
                        size={15}
                        className={
                            refreshing
                                ? "animate-spin"
                                : ""
                        }
                    />

                    Refresh
                </button>
            </motion.div>


            {/* =================================================
                STATS
            ================================================= */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                <StatCard
                    title="Total Responses"
                    value={stats.total}
                    icon={MessageSquareText}
                    tone="teal"
                />

                <StatCard
                    title="Pending Review"
                    value={stats.submitted}
                    icon={Clock3}
                    tone="amber"
                />

                <StatCard
                    title="Reviewed"
                    value={stats.reviewed}
                    icon={CheckCircle2}
                    tone="green"
                />

                <StatCard
                    title="Returned / Rejected"
                    value={stats.rejected}
                    icon={AlertCircle}
                    tone="red"
                />

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <motion.div
                initial={{
                    opacity: 0,
                    y: 10,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm"
            >

                <div className="flex flex-col lg:flex-row gap-3">

                    {/* SEARCH */}

                    <div className="relative flex-1">
                        <Search
                            size={17}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                            placeholder="Search finding, audit, auditee or response..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#00C98B] focus:ring-2 focus:ring-[#00C98B]/10"
                        />
                    </div>


                    {/* STATUS */}

                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                            className="appearance-none w-full lg:w-48 px-4 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-[#00C98B]"
                        >
                            <option value="ALL">
                                All Status
                            </option>

                            <option value="SUBMITTED">
                                Submitted
                            </option>

                            <option value="PENDING_REVIEW">
                                Pending Review
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

                        <ChevronDown
                            size={15}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                        />
                    </div>


                    {/* RISK */}

                    <div className="relative">
                        <select
                            value={riskFilter}
                            onChange={(event) =>
                                setRiskFilter(
                                    event.target.value
                                )
                            }
                            className="appearance-none w-full lg:w-40 px-4 pr-9 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-[#00C98B]"
                        >
                            <option value="ALL">
                                All Risk
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

                        <ChevronDown
                            size={15}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                        />
                    </div>

                </div>

            </motion.div>


            {/* =================================================
                RESPONSE TABLE
            ================================================= */}

            <motion.div
                initial={{
                    opacity: 0,
                    y: 15,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
            >

                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">

                    <div>
                        <h2 className="text-sm font-bold text-[#101A33]">
                            Submitted Responses
                        </h2>

                        <p className="text-xs text-gray-400 mt-0.5">
                            Showing only responses related
                            to your assigned audits.
                        </p>
                    </div>

                    <span className="text-xs font-semibold text-gray-500">
                        {filteredResponses.length} response
                        {filteredResponses.length === 1
                            ? ""
                            : "s"}
                    </span>

                </div>


                {filteredResponses.length === 0 ? (
                    <div className="py-16 flex flex-col items-center text-center">

                        <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mb-3">
                            <Inbox size={25} />
                        </div>

                        <h3 className="text-sm font-bold text-[#101A33]">
                            No auditee responses found
                        </h3>

                        <p className="text-xs text-gray-400 mt-1 max-w-sm">
                            Responses submitted for your assigned
                            findings will appear here.
                        </p>

                    </div>
                ) : (
                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1100px]">

                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/60">

                                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                        Finding
                                    </th>

                                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                        Audit
                                    </th>

                                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                        Auditee
                                    </th>

                                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                        Risk
                                    </th>

                                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                        Response
                                    </th>

                                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                        Submitted
                                    </th>

                                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                        Action
                                    </th>

                                </tr>
                            </thead>


                            <tbody>

                                {filteredResponses.map(
                                    (item, index) => {
                                        const finding =
                                            item._finding || {};

                                        const audit =
                                            item._audit || {};

                                        const responseText =
                                            getResponseText(
                                                item
                                            );

                                        return (
                                            <motion.tr
                                                key={
                                                    getResponseId(
                                                        item
                                                    ) ||
                                                    `${getFindingId(
                                                        finding
                                                    )}-${index}`
                                                }
                                                initial={{
                                                    opacity: 0,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                }}
                                                transition={{
                                                    delay:
                                                        index *
                                                        0.03,
                                                }}
                                                className="border-b border-gray-50 hover:bg-[#FAFFFD] transition"
                                            >

                                                {/* FINDING */}

                                                <td className="px-5 py-4">

                                                    <p className="text-sm font-bold text-[#101A33]">
                                                        {finding.findingId ||
                                                            finding.id ||
                                                            "—"}
                                                    </p>

                                                    <p className="text-xs text-gray-500 mt-1 max-w-[220px] truncate">
                                                        {finding.title ||
                                                            finding.description ||
                                                            "Finding"}
                                                    </p>

                                                </td>


                                                {/* AUDIT */}

                                                <td className="px-5 py-4">

                                                    <p className="text-sm font-semibold text-[#101A33]">
                                                        {audit.auditId ||
                                                            audit.id ||
                                                            getFindingAuditId(
                                                                finding
                                                            ) ||
                                                            "—"}
                                                    </p>

                                                    <p className="text-xs text-gray-400 mt-1 max-w-[190px] truncate">
                                                        {audit.auditTitle ||
                                                            audit.auditName ||
                                                            "Assigned Audit"}
                                                    </p>

                                                </td>


                                                {/* AUDITEE */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-2">

                                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                            <User
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </div>

                                                        <span className="text-sm font-medium text-gray-700">
                                                            {getAuditeeName(
                                                                item
                                                            )}
                                                        </span>

                                                    </div>

                                                </td>


                                                {/* RISK */}

                                                <td className="px-5 py-4">

                                                    <RiskBadge
                                                        level={
                                                            finding.riskLevel
                                                        }
                                                    />

                                                </td>


                                                {/* RESPONSE */}

                                                <td className="px-5 py-4">

                                                    <p className="text-sm text-gray-600 max-w-[280px] line-clamp-2">
                                                        {responseText ||
                                                            "No response text provided."}
                                                    </p>

                                                </td>


                                                {/* STATUS */}

                                                <td className="px-5 py-4">

                                                    <ResponseStatusBadge
                                                        status={
                                                            item.status ||
                                                            "SUBMITTED"
                                                        }
                                                    />

                                                </td>


                                                {/* DATE */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">

                                                        <Calendar
                                                            size={
                                                                13
                                                            }
                                                        />

                                                        {formatDate(
                                                            item.submittedAt ||
                                                                item.createdAt ||
                                                                item.updatedAt
                                                        )}

                                                    </div>

                                                </td>


                                                {/* ACTION */}

                                                <td className="px-5 py-4 text-right">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setSelectedResponse(
                                                                item
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#E5FAF3] text-[#00A874] text-xs font-bold hover:bg-[#D5F7EB] transition"
                                                    >
                                                        <Eye
                                                            size={
                                                                14
                                                            }
                                                        />

                                                        View
                                                    </button>

                                                </td>

                                            </motion.tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </motion.div>


            {/* =================================================
                RESPONSE DETAILS MODAL
            ================================================= */}

            <AnimatePresence>

                {selectedResponse && (
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
                        onMouseDown={(event) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                setSelectedResponse(
                                    null
                                );
                            }
                        }}
                    >

                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.96,
                                y: 15,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.96,
                                y: 15,
                            }}
                            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
                        >

                            {/* MODAL HEADER */}

                            <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between">

                                <div>

                                    <div className="flex items-center gap-2 mb-1">

                                        <MessageSquareText
                                            size={18}
                                            className="text-[#00A874]"
                                        />

                                        <h2 className="text-base font-bold text-[#101A33]">
                                            Auditee Response
                                        </h2>

                                    </div>

                                    <p className="text-xs text-gray-400">
                                        Response ID:{" "}
                                        {getResponseId(
                                            selectedResponse
                                        ) || "—"}
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedResponse(
                                            null
                                        )
                                    }
                                    className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500"
                                >
                                    <X size={18} />
                                </button>

                            </div>


                            {/* MODAL BODY */}

                            <div className="p-6 space-y-5">

                                {/* AUDIT / FINDING */}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <div className="rounded-xl border border-gray-100 p-4">

                                        <div className="flex items-center gap-2 mb-2">

                                            <FileText
                                                size={15}
                                                className="text-[#00A874]"
                                            />

                                            <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                                Audit
                                            </span>

                                        </div>

                                        <p className="text-sm font-bold text-[#101A33]">
                                            {selectedResponse._audit
                                                ?.auditId ||
                                                selectedResponse._audit
                                                    ?.id ||
                                                getFindingAuditId(
                                                    selectedResponse._finding
                                                ) ||
                                                "—"}
                                        </p>

                                        <p className="text-xs text-gray-500 mt-1">
                                            {selectedResponse._audit
                                                ?.auditTitle ||
                                                selectedResponse._audit
                                                    ?.auditName ||
                                                "Assigned Audit"}
                                        </p>

                                    </div>


                                    <div className="rounded-xl border border-gray-100 p-4">

                                        <div className="flex items-center gap-2 mb-2">

                                            <FileText
                                                size={15}
                                                className="text-[#00A874]"
                                            />

                                            <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
                                                Finding
                                            </span>

                                        </div>

                                        <p className="text-sm font-bold text-[#101A33]">
                                            {selectedResponse._finding
                                                ?.findingId ||
                                                selectedResponse._finding
                                                    ?.id ||
                                                "—"}
                                        </p>

                                        <p className="text-xs text-gray-500 mt-1">
                                            {selectedResponse._finding
                                                ?.title ||
                                                selectedResponse._finding
                                                    ?.description ||
                                                "Finding"}
                                        </p>

                                    </div>

                                </div>


                                {/* AUDITEE */}

                                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">

                                    <div className="flex items-center gap-3">

                                        <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center">
                                            <User size={18} />
                                        </div>

                                        <div>

                                            <p className="text-[11px] uppercase font-bold tracking-wide text-blue-500">
                                                Submitted By
                                            </p>

                                            <p className="text-sm font-bold text-[#101A33] mt-0.5">
                                                {getAuditeeName(
                                                    selectedResponse
                                                )}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* STATUS */}

                                <div className="flex flex-wrap items-center gap-3">

                                    <ResponseStatusBadge
                                        status={
                                            selectedResponse.status ||
                                            "SUBMITTED"
                                        }
                                    />

                                    <RiskBadge
                                        level={
                                            selectedResponse._finding
                                                ?.riskLevel
                                        }
                                    />

                                    <span className="text-xs text-gray-400">
                                        Submitted{" "}
                                        {formatDateTime(
                                            selectedResponse.submittedAt ||
                                                selectedResponse.createdAt ||
                                                selectedResponse.updatedAt
                                        )}
                                    </span>

                                </div>


                                {/* RESPONSE */}

                                <div>

                                    <div className="flex items-center gap-2 mb-2">

                                        <MessageSquareText
                                            size={16}
                                            className="text-[#00A874]"
                                        />

                                        <h3 className="text-sm font-bold text-[#101A33]">
                                            Auditee Response
                                        </h3>

                                    </div>

                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

                                        <p className="text-sm text-gray-700 leading-7 whitespace-pre-wrap">
                                            {getResponseText(
                                                selectedResponse
                                            ) ||
                                                "No response text provided."}
                                        </p>

                                    </div>

                                </div>


                                {/* ADDITIONAL DETAILS */}

                                {(selectedResponse.comments ||
                                    selectedResponse.remarks ||
                                    selectedResponse.actionPlan) && (
                                    <div>

                                        <h3 className="text-sm font-bold text-[#101A33] mb-2">
                                            Additional Details
                                        </h3>

                                        <div className="rounded-xl border border-gray-100 p-4 space-y-3">

                                            {selectedResponse.comments && (
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                                                        Comments
                                                    </p>

                                                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                                                        {
                                                            selectedResponse.comments
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {selectedResponse.remarks && (
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                                                        Remarks
                                                    </p>

                                                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                                                        {
                                                            selectedResponse.remarks
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                            {selectedResponse.actionPlan && (
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                                                        Action Plan
                                                    </p>

                                                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                                                        {
                                                            selectedResponse.actionPlan
                                                        }
                                                    </p>
                                                </div>
                                            )}

                                        </div>

                                    </div>
                                )}

                            </div>


                            {/* MODAL FOOTER */}

                            <div className="px-6 py-4 border-t border-gray-100 flex justify-end">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedResponse(
                                            null
                                        )
                                    }
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
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