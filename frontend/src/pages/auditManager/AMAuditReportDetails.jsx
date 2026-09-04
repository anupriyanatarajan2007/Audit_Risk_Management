import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck,
    AlertTriangle,
    Activity,
    Wrench,
    Users,
    ClipboardList,
    Search,
    Paperclip,
    Lightbulb,
    BadgeCheck,
    FileText,
    FileType2,
    Save,
    Printer,
    CheckCircle2,
    XCircle,
    UserCircle2,
} from "lucide-react";

import RiskService from "../../service/riskService";
import KriService from "../../service/kriService";
import MitigationService from "../../service/mitigationService";
import AuditService from "../../service/AuditService";
import {
    getRecommendationsForFinding
} from "../../service/recommendationService";
import {
    getAssignmentsByRiskId,
} from "../../service/RiskAuditorAssignments";

import { getAllUsers } from "../../service/AuthService";
import auditeeAssignmentService from "../../service/auditeeAssignmentService";
import { getFindingsByAuditId } from "../../service/FindingService";
import { getEvidenceByAudit, getEvidenceFileUrl, openEvidence } from "../../service/EvidenceService";
import complianceReportService from "../../service/complianceReportService";
import ReviewService from "../../service/ReviewService";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
} from "docx";
import { triggerBlobDownload } from "../../utils/downloadHelper";

// ============================================================
// STATUS COLOR HELPER
// ============================================================
// Maps common audit/risk keywords to a soft accent color so
// values like HIGH / CRITICAL / OPEN / APPROVED stand out
// without touching any of the data itself.

const getStatusAccent = (rawValue) => {

    if (rawValue === null || rawValue === undefined) {
        return null;
    }

    const text = String(rawValue).trim().toUpperCase();

    const RED = ["HIGH", "CRITICAL", "REJECTED", "OPEN", "OVERDUE", "FAILED"];
    const AMBER = ["MEDIUM", "PENDING", "IN PROGRESS", "IN-PROGRESS", "UNDER REVIEW"];
    const GREEN = ["LOW", "APPROVED", "CLOSED", "COMPLETED", "RESOLVED", "ACTIVE"];

    if (RED.includes(text)) {
        return { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", ring: "ring-red-100" };
    }

    if (AMBER.includes(text)) {
        return { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-100" };
    }

    if (GREEN.includes(text)) {
        return { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-100" };
    }

    return null;
};


// ============================================================
// SECTION HEADER — icon chip + title + description
// ============================================================

const SectionHeader = ({ icon: Icon, title, description, action = null }) => (

    <div className="flex items-start justify-between gap-4 mb-6">

        <div className="flex items-center gap-3">

            <motion.div
                whileHover={{ rotate: 6, scale: 1.08 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20"
            >
                {Icon ? <Icon size={18} strokeWidth={2.25} /> : null}
            </motion.div>

            <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                    {title}
                </h2>

                {description && (
                    <p className="text-sm text-gray-500">
                        {description}
                    </p>
                )}

                <span className="block h-0.5 w-8 mt-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 origin-left transition-all duration-300 group-hover:w-16" />
            </div>

        </div>

        {action}

    </div>
);


// ============================================================
// MOTION SECTION — the shared premium card shell used by every
// major section (Officers, Risk, KRI, Findings, Compliance...)
// ============================================================

const MotionSection = ({ children, className = "" }) => (

    <motion.section
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`group relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/80 p-6 ${className}`}
    >
        {children}
    </motion.section>
);


// ============================================================
// LEFT VERTICAL TIMELINE — decorative rail connecting sections
// ============================================================

const REPORT_RAIL_STEPS = [
    "Officer Details",
    "Risk Details",
    "KRI Details",
    "Mitigation Details",
    "Audit Assignment",
    "Audit Details",
    "Findings & Evidence",
    "Recommendations",
    "Compliance Review",
];

const ReportRail = () => (

    <aside className="hidden lg:flex flex-col items-center w-8 shrink-0 relative pt-2">

        <div className="relative flex-1 w-px bg-gradient-to-b from-teal-400 via-emerald-400 to-teal-200 overflow-visible">

            <motion.div
                className="absolute -left-[3px] top-0 w-[7px] h-24 rounded-full bg-gradient-to-b from-teal-300/0 via-teal-300/70 to-teal-300/0 blur-[2px]"
                animate={{ top: ["0%", "92%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            {REPORT_RAIL_STEPS.map((step, index) => (
                <div
                    key={step}
                    className="absolute -left-[5px] w-3 h-3 rounded-full bg-white border-2 border-teal-500 shadow-sm shadow-teal-500/30"
                    style={{ top: `${(index / (REPORT_RAIL_STEPS.length - 1)) * 100}%` }}
                    title={step}
                >
                    <span className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-30" />
                </div>
            ))}

        </div>

    </aside>
);

const DetailCard = ({ label, value, delay = 0 }) => {

    const formatValue = (value) => {

        if (value === null || value === undefined || value === "") {
            return "-";
        }

        // Object
        if (typeof value === "object") {

            // Department / other object having name
            if (value.name) {
                return value.name;
            }

            // Object having title
            if (value.title) {
                return value.title;
            }

            // Object having id
            if (value.id !== undefined) {
                return String(value.id);
            }

            return JSON.stringify(value);
        }

        return String(value);
    };

    const formatted = formatValue(value);
    const accent = getStatusAccent(formatted);

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: delay / 1000, ease: "easeOut" }}
            whileHover={{ y: -3 }}
            className="bg-gray-50/80 border border-gray-200 rounded-xl p-4 transition-colors duration-300 hover:border-teal-300 hover:bg-white hover:shadow-md"
        >
            <p className="text-[11px] font-semibold text-gray-500 tracking-wide mb-1.5">
                {label}
            </p>

            {accent ? (
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${accent.bg} ${accent.text} ring-1 ${accent.ring}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                    {formatted}
                </span>
            ) : (
                <p className="text-sm font-medium text-gray-800 break-words">
                    {formatted}
                </p>
            )}
        </motion.div>
    );
};

// ============================================================
// COMPONENT
// ============================================================

const AMAuditReportDetails = () => {

    const { riskId } = useParams();

    // IMPORTANT: keep this hook before every conditional return.
    const printRef = useRef(null);

    // ========================================================
    // STATES
    // ========================================================

    const [risk, setRisk] = useState(null);

    const [audit, setAudit] = useState(null);

    const [kris, setKris] = useState([]);

    const [mitigations, setMitigations] = useState([]);

    const [auditManagerName, setAuditManagerName] = useState("-");

    const [internalAuditorName, setInternalAuditorName] = useState("-");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");
    const [auditeeName, setAuditeeName] = useState("-");

    const [findings, setFindings] = useState([]);
const [evidences, setEvidences] = useState([]);

const [recommendations, setRecommendations] = useState({});

const [complianceReview, setComplianceReview] = useState(null);
const [complianceOfficerName, setComplianceOfficerName] = useState("-");

    // ========================================================
    // REPORT ACTIONS (PDF / WORD / SAVE)
    // ========================================================

    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [generatingWord, setGeneratingWord] = useState(false);
    const [savingReport, setSavingReport] = useState(false);
    const [actionMessage, setActionMessage] = useState(null);

    // ========================================================
    // GET FULL NAME
    // ========================================================

    const getFullName = (user) => {

        if (!user) {
            return "-";
        }

        const firstName =
            user?.profile?.firstName ||
            user?.firstName ||
            "";

        const lastName =
            user?.profile?.lastName ||
            user?.lastName ||
            "";

        const fullName =
            `${firstName} ${lastName}`.trim();

        return fullName || "-";
    };


    // ========================================================
    // NORMALIZE ARRAY RESPONSE
    // ========================================================

    const normalizeArray = (response) => {

        if (Array.isArray(response)) {
            return response;
        }

        if (Array.isArray(response?.data)) {
            return response.data;
        }

        if (response?.data) {
            return [response.data];
        }

        if (response) {
            return [response];
        }

        return [];
    };


    // ========================================================
    // LOAD REPORT
    // ========================================================

    useEffect(() => {

        if (riskId) {
            loadReportDetails();
        }

    }, [riskId]);


    // ========================================================
    // LOAD ALL REPORT DETAILS
    // ========================================================

   
const loadReportDetails = async () => {

    try {

        setLoading(true);
        setError("");

        // ============================================================
        // 1. GET RISK DETAILS
        // ============================================================

        const riskResponse =
            await RiskService.getRiskById(riskId);

        const riskData =
            riskResponse?.data ||
            riskResponse;

        setRisk(riskData);


        // ============================================================
        // 2. GET AUDIT DETAILS
        // ============================================================

        const auditsResponse =
            await AuditService.getAllAudits();

        const audits =
            normalizeArray(auditsResponse);

        const currentRiskId =
            String(
                riskData?.riskId ||
                riskId
            );

        const matchedAudit =
            audits.find(
                (item) =>
                    String(item?.riskId) ===
                    currentRiskId
            );


        // ============================================================
        // 3. AUDIT + AUDITEE + FINDINGS + RECOMMENDATIONS + EVIDENCE
        // ============================================================

        if (matchedAudit) {

            setAudit(matchedAudit);


            // ========================================================
            // 3A. GET AUDITEE
            // ========================================================

            try {

                const auditeeResponse =
                    await auditeeAssignmentService
                        .getAssignmentsByAudit(
                            matchedAudit.id
                        );

                const auditeeAssignments =
                    normalizeArray(
                        auditeeResponse
                    );

                const auditeeAssignment =
                    auditeeAssignments[0];

                if (auditeeAssignment) {

                    setAuditeeName(
                        auditeeAssignment?.auditeeName ||
                        auditeeAssignment?.employeeName ||
                        auditeeAssignment?.name ||
                        "-"
                    );

                } else {

                    setAuditeeName("-");

                }

            } catch (auditeeError) {

                console.error(
                    "Failed to load auditee:",
                    auditeeError
                );

                setAuditeeName("-");

            }


            // ========================================================
            // 3B. GET FINDINGS
            // ========================================================

            try {

                const findingsResponse =
                    await getFindingsByAuditId(
                        matchedAudit.id
                    );

                const findingsData =
                    normalizeArray(
                        findingsResponse
                    );

                setFindings(
                    findingsData
                );


                // ====================================================
                // 3C. GET RECOMMENDATIONS FOR EACH FINDING
                // ====================================================

                const recommendationMap = {};

                await Promise.all(

                    findingsData.map(
                        async (finding) => {

                            try {

                                const recommendationResponse =
                                    await getRecommendationsForFinding(
                                        finding.id
                                    );

                                recommendationMap[
                                    finding.id
                                ] =
                                    normalizeArray(
                                        recommendationResponse
                                    );

                            } catch (
                                recommendationError
                            ) {

                                console.error(
                                    `Failed to load recommendations for finding ${finding.id}:`,
                                    recommendationError
                                );

                                recommendationMap[
                                    finding.id
                                ] = [];

                            }

                        }
                    )

                );

                setRecommendations(
                    recommendationMap
                );

            } catch (findingError) {

                console.error(
                    "Failed to load findings:",
                    findingError
                );

                setFindings([]);
                setRecommendations({});

            }


            // ========================================================
            // 3D. GET EVIDENCE
            // ========================================================

            try {

                const evidenceResponse =
                    await getEvidenceByAudit(
                        matchedAudit.id
                    );

                const evidenceData =
                    normalizeArray(
                        evidenceResponse
                    );

                setEvidences(
                    evidenceData
                );

            } catch (evidenceError) {

                console.error(
                    "Failed to load evidence:",
                    evidenceError
                );

                setEvidences([]);

            }

        
// ========================================================
// 3E. GET COMPLIANCE REVIEW
// ========================================================

try {

    const reviewResponse =
        await ReviewService.getAllReviews();

    const complianceReviews =
        normalizeArray(
            reviewResponse
        );

    // ====================================================
    // FIND REVIEW USING AUDIT DB ID
    // ====================================================

    let matchedComplianceReview =
        complianceReviews.find(
            (review) =>
                String(
                    review?.audit?.id
                ) ===
                String(
                    matchedAudit.id
                )
        );

    // ====================================================
    // FALLBACK:
    // MATCH USING AUDIT CODE
    // Example: AUD-001
    // ====================================================

    if (!matchedComplianceReview) {

        matchedComplianceReview =
            complianceReviews.find(
                (review) =>
                    String(
                        review?.audit?.auditId
                    ) ===
                    String(
                        matchedAudit.auditId
                    )
            );

    }

    // ====================================================
    // FALLBACK:
    // MATCH USING RISK DB ID
    // ====================================================

    if (!matchedComplianceReview) {

        matchedComplianceReview =
            complianceReviews.find(
                (review) =>
                    String(
                        review?.risk?.id
                    ) ===
                    String(
                        riskData?.id
                    )
            );

    }

    // ====================================================
    // REVIEW FOUND
    // ====================================================

    if (matchedComplianceReview) {

        setComplianceReview(
            matchedComplianceReview
        );

        // =================================================
        // GET COMPLIANCE OFFICER NAME
        //
        // Actual response:
        //
        // reviewedBy
        //   └── profile
        //       ├── firstName
        //       └── lastName
        // =================================================

        const profile =
            matchedComplianceReview
                ?.reviewedBy
                ?.profile;

        const firstName =
            profile?.firstName || "";

        const lastName =
            profile?.lastName || "";

        const fullName =
            `${firstName} ${lastName}`.trim();

        setComplianceOfficerName(
            fullName ||
            matchedComplianceReview
                ?.reviewedBy
                ?.employeeId ||
            "-"
        );

    }

    // ====================================================
    // NO REVIEW FOUND
    // ====================================================

    else {

        setComplianceReview(null);

        setComplianceOfficerName("-");

    }

} catch (reviewError) {

    console.error(
        "Failed to load compliance review:",
        reviewError
    );

    setComplianceReview(null);

    setComplianceOfficerName("-");

}


        }


        // ============================================================
        // NO AUDIT FOUND
        // ============================================================

        else {

            setAudit(null);
            setAuditeeName("-");
            setFindings([]);
            setEvidences([]);
            setRecommendations({});
            setComplianceReview(null);
            setComplianceOfficerName("-");

        }


        // ============================================================
        // 4. GET KRI DETAILS
        // ============================================================

        const kriResponse =
            await KriService.getKrisByRisk(
                riskData?.id ||
                riskId
            );

        const kriData =
            normalizeArray(
                kriResponse
            );

        setKris(
            kriData
        );


        // ============================================================
        // 5. GET MITIGATION DETAILS
        // ============================================================

        const mitigationResponse =
            await MitigationService.getMitigationsByRisk(
                riskData?.id ||
                riskId
            );

        const mitigationData =
            normalizeArray(
                mitigationResponse
            );

        setMitigations(
            mitigationData
        );


        // ============================================================
        // 6. GET AUDIT ASSIGNMENT
        // ============================================================

        const assignmentRiskId =
            riskData?.riskId ||
            riskId;

        const assignmentResponse =
            await getAssignmentsByRiskId(
                assignmentRiskId
            );


        // ============================================================
        // 7. NORMALIZE ASSIGNMENTS
        // ============================================================

        const assignments =
            normalizeArray(
                assignmentResponse
            );


        // ============================================================
        // 8. FIND ASSIGNMENT
        // ============================================================

        const assignment =
            assignments.find(
                (item) =>
                    String(item?.riskId) ===
                    String(assignmentRiskId)
            ) ||
            assignments[0];


        // ============================================================
        // 9. NO ASSIGNMENT
        // ============================================================

        if (!assignment) {

            setInternalAuditorName("-");
            setAuditManagerName("-");

        }

        // ============================================================
        // 10. ASSIGNMENT FOUND
        // ============================================================

        else {

            // ========================================================
            // GET EMPLOYEE IDs
            // ========================================================

            const internalAuditorEmployeeId =
                assignment?.employeeId;

            const auditManagerEmployeeId =
                assignment?.assignedByEmployeeId;


            // ========================================================
            // GET ALL USERS
            // ========================================================

            const usersResponse =
                await getAllUsers();

            const users =
                normalizeArray(
                    usersResponse
                );


            // ========================================================
            // FIND INTERNAL AUDITOR
            // ========================================================

            const auditorUser =
                users.find(
                    (user) =>
                        String(
                            user?.employeeId
                        ) ===
                        String(
                            internalAuditorEmployeeId
                        )
                );


            // ========================================================
            // FIND AUDIT MANAGER
            // ========================================================

            const managerUser =
                users.find(
                    (user) =>
                        String(
                            user?.employeeId
                        ) ===
                        String(
                            auditManagerEmployeeId
                        )
                );


            // ========================================================
            // SET INTERNAL AUDITOR NAME
            // ========================================================

            if (auditorUser) {

                setInternalAuditorName(
                    getFullName(
                        auditorUser
                    )
                );

            } else {

                setInternalAuditorName("-");

            }


            // ========================================================
            // SET AUDIT MANAGER NAME
            // ========================================================

            if (managerUser) {

                setAuditManagerName(
                    getFullName(
                        managerUser
                    )
                );

            } else {

                setAuditManagerName("-");

            }

        }

    } catch (err) {

        console.error(
            "Failed to load audit report details:",
            err
        );

        setError(
            err?.response?.data?.message ||
            err?.message ||
            "Failed to load audit report details."
        );

    } finally {

        setLoading(false);

    }

};
  

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">

                <div className="text-center">

                    <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>

                    <p className="text-gray-600">
                        Loading audit report...
                    </p>

                </div>

            </div>
        );
    }


    // ============================================================
    // ERROR
    // ============================================================

    if (error) {

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">

                <div className="bg-white rounded-xl shadow-md p-8 text-center">

                    <h2 className="text-xl font-bold text-red-600 mb-2">
                        Error
                    </h2>

                    <p className="text-gray-600">
                        {error}
                    </p>

                </div>

            </div>
        );
    }


    // ============================================================
    // OFFICER ITEM
    // ============================================================

    const OfficerItem = ({ label, value, delay = 0, icon: Icon = UserCircle2 }) => (
    <motion.div
        initial={{ opacity: 0, x: -22, scale: 0.98 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -4, scale: 1.01 }}
        className="relative overflow-hidden bg-white rounded-2xl border border-emerald-100 p-5 shadow-sm transition-all duration-300 hover:border-emerald-300 hover:shadow-lg group"
    >
        <motion.div
            className="absolute left-0 top-5 bottom-5 w-1 rounded-r-full bg-gradient-to-b from-emerald-400 via-teal-500 to-emerald-600"
            initial={{ height: 0, opacity: 0 }}
            whileInView={{ height: "calc(100% - 40px)", opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: delay / 1000 + 0.1 }}
        />

        <div className="flex items-center gap-4 pl-2">
            <motion.div
                whileHover={{ rotate: -5, scale: 1.08 }}
                className="w-12 h-12 shrink-0 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600"
            >
                <Icon size={22} strokeWidth={2} />
            </motion.div>

            <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                    {label}
                </p>
                <p className="text-base font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                    {value || "-"}
                </p>
                <p className="text-xs text-slate-400 mt-1">Assigned officer</p>
            </div>
        </div>

        <motion.div
            className="absolute -right-8 -bottom-8 w-20 h-20 rounded-full bg-emerald-50/70"
            animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.7, 0.45] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
    </motion.div>
);


    // ============================================================
    // DETAIL ITEM
    // ============================================================

    const DetailItem = ({ label, value, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.35, delay: delay / 1000 }}
        whileHover={{ y: -2 }}
        className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 transition-all duration-300 hover:bg-white hover:border-emerald-200 hover:shadow-md"
    >
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">
            {label}
        </p>
        <p className="text-sm font-semibold text-slate-800 break-words">
            {value !== null && value !== undefined && value !== "" ? value : "-"}
        </p>
    </motion.div>
);


    // ============================================================
    // REPORT EXPORT / ACTIONS
    // ============================================================

    const reportName =
        risk?.riskId ||
        audit?.auditId ||
        riskId ||
        "Audit-Report";

    const showActionMessage = (type, text) => {
        setActionMessage({ type, text });
        setTimeout(() => setActionMessage(null), 3500);
    };

    // Shared blob -> file download helper
    const downloadBlob = (blob, filename) => {
        triggerBlobDownload(blob, filename);
    };

    // ============================================================
    // PRINT
    // ============================================================

    const handlePrint = () => {
        window.print();
    };

    // ============================================================
    // PDF DOWNLOAD
    // ============================================================

    const handleDownloadPdf = async () => {
        if (!printRef.current) {
            showActionMessage("error", "Report content is not ready.");
            return;
        }

        let iframe = null;

        try {
            setGeneratingPdf(true);

            // IMPORTANT:
            // Tailwind v4 can leave oklch()/oklab() rules in the main document.
            // html2canvas scans CSS rules while rendering, so simply removing
            // className is not enough. Render the export inside a completely
            // stylesheet-free iframe and copy only computed inline styles.
            const source = printRef.current;
            const clonedElement = source.cloneNode(true);

            iframe = document.createElement("iframe");
            iframe.setAttribute("aria-hidden", "true");
            iframe.style.position = "fixed";
            iframe.style.left = "-100000px";
            iframe.style.top = "0";
            iframe.style.width = `${Math.max(source.scrollWidth, 900)}px`;
            iframe.style.height = `${Math.max(source.scrollHeight, 1200)}px`;
            iframe.style.border = "0";
            iframe.style.visibility = "hidden";
            document.body.appendChild(iframe);

            const exportDocument = iframe.contentDocument;
            const exportWindow = iframe.contentWindow;

            exportDocument.open();
            exportDocument.write(`<!doctype html><html><head><meta charset="UTF-8"><title>Audit Report</title></head><body></body></html>`);
            exportDocument.close();

            const body = exportDocument.body;
            body.style.margin = "0";
            body.style.padding = "0";
            body.style.background = "#ffffff";
            body.style.color = "#111827";
            body.style.fontFamily = "Arial, Helvetica, sans-serif";

            const sourceElements = [source, ...source.querySelectorAll("*")];
            const cloneElements = [clonedElement, ...clonedElement.querySelectorAll("*")];

            const safeColor = (value, fallback = "transparent") => {
                if (!value) return fallback;
                const lower = String(value).toLowerCase();
                if (lower.includes("oklch") || lower.includes("oklab")) {
                    return fallback;
                }
                return value;
            };

            cloneElements.forEach((clone, index) => {
                const original = sourceElements[index];
                if (!original) return;

                const computed = window.getComputedStyle(original);
                clone.removeAttribute("class");
                clone.removeAttribute("style");

                const styleMap = {
                    display: computed.display,
                    position: computed.position === "fixed" ? "static" : computed.position,
                    boxSizing: computed.boxSizing,
                    width: computed.width,
                    minWidth: computed.minWidth,
                    maxWidth: computed.maxWidth,
                    height: computed.height,
                    minHeight: computed.minHeight,
                    maxHeight: computed.maxHeight,
                    margin: computed.margin,
                    padding: computed.padding,
                    border: safeColor(computed.border, "none"),
                    borderTop: safeColor(computed.borderTop, "none"),
                    borderRight: safeColor(computed.borderRight, "none"),
                    borderBottom: safeColor(computed.borderBottom, "none"),
                    borderLeft: safeColor(computed.borderLeft, "none"),
                    borderRadius: computed.borderRadius,
                    backgroundColor: safeColor(computed.backgroundColor, "transparent"),
                    backgroundImage: "none",
                    color: safeColor(computed.color, "#111827"),
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: computed.fontSize,
                    fontWeight: computed.fontWeight,
                    fontStyle: computed.fontStyle,
                    lineHeight: computed.lineHeight,
                    letterSpacing: computed.letterSpacing,
                    textAlign: computed.textAlign,
                    verticalAlign: computed.verticalAlign,
                    whiteSpace: computed.whiteSpace,
                    wordBreak: computed.wordBreak,
                    overflow: computed.overflow === "visible" ? "visible" : "hidden",
                    flexDirection: computed.flexDirection,
                    flexWrap: computed.flexWrap,
                    flexGrow: computed.flexGrow,
                    flexShrink: computed.flexShrink,
                    flexBasis: computed.flexBasis,
                    alignItems: computed.alignItems,
                    justifyContent: computed.justifyContent,
                    gap: computed.gap,
                    gridTemplateColumns: computed.gridTemplateColumns,
                    gridTemplateRows: computed.gridTemplateRows,
                    gridColumn: computed.gridColumn,
                    gridRow: computed.gridRow,
                    columnGap: computed.columnGap,
                    rowGap: computed.rowGap,
                    opacity: computed.opacity,
                };

                Object.entries(styleMap).forEach(([property, value]) => {
                    if (value !== undefined && value !== null && value !== "") {
                        clone.style[property] = value;
                    }
                });

                clone.style.boxShadow = "none";
                clone.style.textShadow = "none";
                clone.style.filter = "none";
                clone.style.transform = "none";
                clone.style.animation = "none";
                clone.style.transition = "none";
            });

            cloneElements.forEach((clone) => {
                if (clone instanceof SVGElement) {
                    const fill = clone.getAttribute("fill");
                    const stroke = clone.getAttribute("stroke");
                    if (!fill || /oklch|oklab/i.test(fill)) clone.setAttribute("fill", "currentColor");
                    if (stroke && /oklch|oklab/i.test(stroke)) clone.setAttribute("stroke", "currentColor");
                }

                if (["BUTTON", "INPUT", "SELECT", "TEXTAREA"].includes(clone.tagName)) {
                    clone.style.display = "none";
                }
            });

            body.appendChild(clonedElement);

            // Give the iframe its real content dimensions.
            iframe.style.height = `${Math.max(body.scrollHeight + 40, 1200)}px`;

            await new Promise((resolve) => {
                if (exportDocument.fonts?.ready) {
                    exportDocument.fonts.ready.then(() => requestAnimationFrame(resolve));
                } else {
                    requestAnimationFrame(resolve);
                }
            });

            const canvas = await html2canvas(body, {
                scale: Math.min(2, window.devicePixelRatio || 1.5),
                useCORS: true,
                allowTaint: false,
                backgroundColor: "#ffffff",
                logging: false,
                removeContainer: true,
                foreignObjectRendering: false,
                imageTimeout: 15000,
                windowWidth: body.scrollWidth,
                windowHeight: body.scrollHeight,
            });

            const imgData = canvas.toDataURL("image/png", 1.0);
            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 8;
            const usableWidth = pageWidth - margin * 2;
            const imageHeight = (canvas.height * usableWidth) / canvas.width;

            let heightLeft = imageHeight;
            let position = margin;
            pdf.addImage(imgData, "PNG", margin, position, usableWidth, imageHeight);
            heightLeft -= pageHeight - margin * 2;

            while (heightLeft > 0) {
                position = margin - (imageHeight - heightLeft);
                pdf.addPage();
                pdf.addImage(imgData, "PNG", margin, position, usableWidth, imageHeight);
                heightLeft -= pageHeight - margin * 2;
            }

            const filename = `Audit_Report_${risk?.riskId || riskId || "report"}.pdf`;
            pdf.save(filename);
            showActionMessage("success", "PDF generated successfully.");
        } catch (error) {
            console.error("Failed to generate PDF:", error);
            showActionMessage("error", "Failed to generate PDF. Please try again.");
        } finally {
            if (iframe) {
                iframe.remove();
            }
            setGeneratingPdf(false);
        }
    };

    // ============================================================
    // WORD DOWNLOAD
    // ============================================================

    const handleDownloadWord = async () => {
        try {
            setGeneratingWord(true);

            const kv = (label, value) =>
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${label}: `,
                            bold: true,
                        }),
                        new TextRun({
                            text: String(value ?? "-"),
                        }),
                    ],
                    spacing: { after: 80 },
                });

            const heading = (text, level = HeadingLevel.HEADING_2) =>
                new Paragraph({
                    text,
                    heading: level,
                    spacing: { before: 250, after: 120 },
                });

            const children = [
                new Paragraph({
                    text: "AUDIT & RISK MANAGEMENT SYSTEM",
                    heading: HeadingLevel.TITLE,
                    alignment: "center",
                }),
                new Paragraph({
                    text: "AUDIT REPORT DETAILS",
                    heading: HeadingLevel.HEADING_1,
                    alignment: "center",
                }),

                heading("Officer Details"),
                kv("Risk Officer", risk?.identifiedByName),
                kv("Audit Manager", auditManagerName),
                kv("Internal Auditor", internalAuditorName),
                kv("Auditee", auditeeName),
                kv("Compliance Officer", complianceOfficerName),

                heading("Risk Details"),
                kv("Risk ID", risk?.riskId),
                kv("Risk Name", risk?.title),
                kv("Department", risk?.department?.name),
                kv("Business Unit", risk?.businessUnit),
                kv("Process Name", risk?.processName),
                kv("Category", risk?.category),
                kv("Likelihood", risk?.likelihood),
                kv("Impact", risk?.impact),
                kv("Risk Score", risk?.riskScore),
                kv("Risk Level", risk?.level),
                kv("Status", risk?.status),
                kv("Target Closure Date", risk?.targetClosureDate),
                kv("Actual Closure Date", risk?.actualClosureDate),
                kv("Description", risk?.description),
                kv("Existing Controls", risk?.existingControls),
                kv("Mitigation Plan", risk?.mitigationPlan),
                kv("Remarks", risk?.remarks),

                heading("Audit Details"),
                kv("Audit ID", audit?.auditId),
                kv("Audit Name", audit?.auditName),
                kv("Risk ID", audit?.riskId),
                kv("Risk Title", audit?.riskTitle),
                kv("Department", audit?.department?.name),
                kv("Business Unit", audit?.businessUnit),
                kv("Process Name", audit?.processName),
                kv("Internal Auditor", audit?.internalAuditorName || internalAuditorName),
                kv("Internal Auditor ID", audit?.internalAuditorId),
                kv("Auditee", audit?.auditeeName || auditeeName),
                kv("Start Date", audit?.startDate),
                kv("End Date", audit?.endDate),
                kv("Status", audit?.status),
                kv("Description", audit?.description),

                heading(`KRI Details (${kris.length})`),
            ];

            if (kris.length === 0) {
                children.push(new Paragraph({ text: "No KRI details available." }));
            } else {
                kris.forEach((kri, index) => {
                    children.push(heading(`KRI ${index + 1}`, HeadingLevel.HEADING_3));
                    children.push(kv("KRI ID", kri?.kriId));
                    children.push(kv("KRI Name", kri?.kriName));
                    children.push(kv("Current Value", kri?.currentValue));
                    children.push(kv("Green Threshold", kri?.greenThreshold));
                    children.push(kv("Amber Threshold", kri?.amberThreshold));
                    children.push(kv("Red Threshold", kri?.redThreshold));
                    children.push(kv("Status", kri?.status));
                });
            }

            children.push(heading(`Mitigation Details (${mitigations.length})`));

            if (mitigations.length === 0) {
                children.push(new Paragraph({ text: "No mitigation details available." }));
            } else {
                mitigations.forEach((m, index) => {
                    children.push(heading(`Mitigation ${index + 1}`, HeadingLevel.HEADING_3));
                    children.push(kv("Mitigation ID", m?.mitigationId));
                    children.push(kv("Title", m?.mitigationTitle));
                    children.push(kv("Type", m?.mitigationType));
                    children.push(kv("Owner", m?.ownerName));
                    children.push(kv("Target Date", m?.targetDate));
                    children.push(kv("Completed Date", m?.completedDate));
                    children.push(kv("Effectiveness", m?.effectiveness));
                    children.push(kv("Status", m?.status));
                });
            }

            children.push(heading(`Findings & Recommendations (${findings.length})`));

            if (findings.length === 0) {
                children.push(new Paragraph({ text: "No findings found for this audit." }));
            } else {
                findings.forEach((finding, index) => {
                    children.push(heading(`Finding ${index + 1}`, HeadingLevel.HEADING_3));
                    children.push(kv("Finding ID", finding?.id));
                    children.push(kv("Audit ID", finding?.auditId));
                    children.push(kv("Title", finding?.title));
                    children.push(kv("Risk Level", finding?.riskLevel));
                    children.push(kv("Status", finding?.status));
                    children.push(kv("Auditor", finding?.auditorName));
                    children.push(kv("Observation", finding?.observation));
                    children.push(kv("Created At", finding?.createdAt));

                    const recs = recommendations?.[finding.id] || [];
                    children.push(heading(`Recommendations (${recs.length})`, HeadingLevel.HEADING_4));

                    if (!recs.length) {
                        children.push(new Paragraph({ text: "No recommendations found." }));
                    } else {
                        recs.forEach((rec, recIndex) => {
                            children.push(kv(`Recommendation ${recIndex + 1}`, rec?.recommendationText));
                            children.push(kv("Recommendation ID", rec?.recommendationId));
                            children.push(kv("Status", rec?.status));
                            children.push(kv("Internal Auditor", rec?.internalAuditorName));
                            children.push(kv("Auditee", rec?.auditeeName));
                        });
                    }

                    const relatedEvidence = evidences.filter(
                        (e) => String(e?.findingId) === String(finding?.id)
                    );

                    children.push(heading(`Evidence (${relatedEvidence.length})`, HeadingLevel.HEADING_4));

                    if (!relatedEvidence.length) {
                        children.push(new Paragraph({ text: "No evidence submitted for this finding." }));
                    } else {
                        relatedEvidence.forEach((e, evidenceIndex) => {
                            children.push(kv(`Evidence ${evidenceIndex + 1}`, e?.fileName));
                            children.push(kv("Description", e?.description));
                            children.push(kv("Status", e?.status));
                            children.push(kv("Uploaded At", e?.uploadedAt));
                        });
                    }
                });
            }

            children.push(heading("Compliance Review Details"));
            children.push(kv("Review ID", complianceReview?.reviewId || complianceReview?.id));
            children.push(kv("Audit ID", complianceReview?.audit?.auditId || complianceReview?.audit?.id));
            children.push(kv("Audit Name", complianceReview?.audit?.auditName));
            children.push(kv("Compliance Officer", complianceOfficerName));
            children.push(kv("Compliance Officer ID", complianceReview?.reviewedBy?.employeeId));
            children.push(kv("Review Status", complianceReview?.status));
            children.push(kv("Reviewed At", complianceReview?.reviewedAt));
            children.push(kv("Review Comments", complianceReview?.comments));

            const doc = new Document({
                sections: [{
                    properties: {},
                    children,
                }],
            });

            const blob = await Packer.toBlob(doc);

            downloadBlob(
                blob,
                `Audit_Report_${reportName}.docx`
            );

            showActionMessage(
                "success",
                "Word document downloaded successfully."
            );
        } catch (wordError) {
            console.error("Failed to generate Word document:", wordError);
            showActionMessage(
                "error",
                "Failed to generate Word document. Please try again."
            );
        } finally {
            setGeneratingWord(false);
        }
    };

    // ============================================================
    // SAVE REPORT
    // ============================================================

    const handleSaveReport = () => {
        try {
            const snapshot = {
                savedAt: new Date().toISOString(),
                risk,
                audit,
                kris,
                mitigations,
                auditManagerName,
                internalAuditorName,
                auditeeName,
                findings,
                evidences,
                recommendations,
                complianceReview,
                complianceOfficerName,
            };

            localStorage.setItem(
                `audit_report_${risk?.riskId || riskId}`,
                JSON.stringify(snapshot)
            );

            showActionMessage(
                "success",
                "Audit report saved successfully on this browser."
            );
        } catch (saveError) {
            console.error("Failed to save report:", saveError);
            showActionMessage(
                "error",
                "Unable to save the report."
            );
        }
    };

    // ============================================================
    // MAIN UI
    // ============================================================

    return (

        <div className="min-h-screen bg-slate-50 p-4 md:p-6">

            {/* ==================================================
                ANIMATION KEYFRAMES
            ================================================== */}

            <style>
                {`

                    .report-section-card {
                        position: relative;
                        overflow: hidden;
                        background: rgba(255,255,255,.96);
                        border: 1px solid #e2e8f0;
                        border-radius: 1rem;
                        padding: 1.5rem;
                        box-shadow: 0 4px 18px rgba(15,23,42,.045);
                        transition: border-color .3s ease, box-shadow .3s ease, transform .3s ease;
                    }
                    .report-section-card::before {
                        content: "";
                        position: absolute;
                        left: 0;
                        top: 22px;
                        bottom: 22px;
                        width: 4px;
                        border-radius: 0 999px 999px 0;
                        background: linear-gradient(180deg, #34d399, #14b8a6, #10b981);
                        box-shadow: 0 0 12px rgba(16,185,129,.25);
                    }
                    .report-section-card:hover {
                        border-color: #a7f3d0;
                        box-shadow: 0 10px 30px rgba(15,23,42,.07);
                    }
                    .report-section-card h2 {
                        color: #0f172a;
                        letter-spacing: -.015em;
                    }
                    .report-section-card > div:first-child h2 {
                        position: relative;
                    }
                    @media print {
                        .report-section-card { box-shadow: none; break-inside: avoid; }
                        .print\:hidden { display: none !important; }
                        button { display: none !important; }
                        body { background: white !important; }
                    }

                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(16px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes slideDownFade {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    @keyframes spinFast {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }

                    .officer-card-anim,
                    .detail-card-anim {
                        opacity: 0;
                        animation: fadeInUp 0.5s ease-out forwards;
                    }

                    .page-header-anim {
                        animation: slideDownFade 0.5s ease-out forwards;
                    }

                    .action-toast-anim {
                        animation: slideDownFade 0.3s ease-out forwards;
                    }

                    .btn-spin {
                        animation: spinFast 0.7s linear infinite;
                    }
                `}
            </style>

            <div className="max-w-7xl mx-auto">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="page-header-anim mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>

                        <h1 className="text-2xl font-bold text-gray-900">
                            Audit Report Details
                        </h1>

                        <p className="text-sm text-gray-500 mt-1">
                            Risk, Audit, KRI and Mitigation details
                        </p>

                    </div>


                    {/* ==============================================
                        REPORT ACTION BUTTONS
                    ============================================== */}

                    <div className="flex flex-wrap items-center gap-2.5 print:hidden">

                        <motion.button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={generatingPdf}
                            whileHover={{ y: -2, scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold shadow-sm hover:bg-red-100 hover:border-red-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {generatingPdf ? (
                                <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full btn-spin" />
                            ) : (
                                <FileText size={17} />
                            )}
                            {generatingPdf ? "Generating..." : "PDF"}
                        </motion.button>

                        <motion.button
                            type="button"
                            onClick={handleDownloadWord}
                            disabled={generatingWord}
                            whileHover={{ y: -2, scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold shadow-sm hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {generatingWord ? (
                                <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full btn-spin" />
                            ) : (
                                <FileType2 size={17} />
                            )}
                            {generatingWord ? "Generating..." : "Word"}
                        </motion.button>

                        <motion.button
                            type="button"
                            onClick={handleSaveReport}
                            disabled={savingReport}
                            whileHover={{ y: -2, scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm shadow-emerald-500/20 hover:bg-emerald-700 hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {savingReport ? (
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full btn-spin" />
                            ) : (
                                <Save size={17} />
                            )}
                            {savingReport ? "Saving..." : "Save"}
                        </motion.button>

                        <motion.button
                            type="button"
                            onClick={handlePrint}
                            whileHover={{ y: -2, scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                        >
                            <Printer size={17} />
                            Print
                        </motion.button>

                    </div>

                </div>

                <div className="lg:flex lg:items-stretch lg:gap-5">
                    <ReportRail />
                    <div ref={printRef} className="min-w-0 flex-1">

                {/* ==================================================
                    ACTION MESSAGE TOAST
                ================================================== */}

                {actionMessage && (

                    <div
                        className={`action-toast-anim mb-6 px-4 py-3 rounded-lg text-sm font-medium border ${
                            actionMessage.type === "success"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                        }`}
                    >
                        {actionMessage.text}
                    </div>

                )}


                {/* ==================================================
                    OFFICERS BOX
                ================================================== */}

                <div className="report-section-card mb-6">

                    <div className="flex items-center justify-between mb-5">

                        <div>

                            <h2 className="text-lg font-bold text-gray-900">
                                Officers
                            </h2>

                            <p className="text-sm text-gray-500">
                                Officers associated with this risk and audit
                            </p>

                        </div>

                    </div>


                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

                        <OfficerItem
                            label="Risk Officer"
                            icon={ShieldCheck}
                            value={
                                risk?.identifiedByName || "-"
                            }
                            delay={0}
                        />

                        <OfficerItem
                            label="Audit Manager"
                            icon={BadgeCheck}
                            value={auditManagerName}
                            delay={80}
                        />

                        <OfficerItem
                            label="Internal Auditor"
                            icon={Search}
                            value={internalAuditorName}
                            delay={160}
                        />

                        <OfficerItem
                            label="Auditee"
                            icon={UserCircle2}
                            value={
                              auditeeName
                            }
                            delay={240}
                        />


<OfficerItem
    label="Compliance Officer"
                            icon={ShieldCheck}
    value={
        complianceOfficerName ||
        "-"
    }
    delay={320}
/>


                    </div>

                </div>


                {/* ==================================================
                    RISK DETAILS
                ================================================== */}

                <div className="report-section-card mb-6">

                    <div className="mb-5">

                        <h2 className="text-lg font-bold text-gray-900">
                            Risk Details
                        </h2>

                        <p className="text-sm text-gray-500">
                            Complete details of the selected risk
                        </p>

                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        <DetailItem
                            label="Risk ID"
                            value={risk?.riskId}
                        />

                        <DetailItem
                            label="Risk Name"
                            value={risk?.title}
                        />

                        <DetailItem
                            label="Department"
                            value={risk?.department?.name}
                        />

                        <DetailItem
                            label="Business Unit"
                            value={risk?.businessUnit}
                        />

                        <DetailItem
                            label="Process Name"
                            value={risk?.processName}
                        />

                        <DetailItem
                            label="Category"
                            value={risk?.category}
                        />

                        <DetailItem
                            label="Likelihood"
                            value={risk?.likelihood}
                        />

                        <DetailItem
                            label="Impact"
                            value={risk?.impact}
                        />

                        <DetailItem
                            label="Risk Score"
                            value={risk?.riskScore}
                        />

                        <DetailItem
                            label="Risk Level"
                            value={risk?.level}
                        />

                        <DetailItem
                            label="Status"
                            value={risk?.status}
                        />

                        <DetailItem
                            label="Target Closure Date"
                            value={risk?.targetClosureDate}
                        />

                        <DetailItem
                            label="Actual Closure Date"
                            value={risk?.actualClosureDate}
                        />

                    </div>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                        <DetailItem
                            label="Description"
                            value={risk?.description}
                        />

                        <DetailItem
                            label="Existing Controls"
                            value={risk?.existingControls}
                        />

                        <DetailItem
                            label="Mitigation Plan"
                            value={risk?.mitigationPlan}
                        />

                        <DetailItem
                            label="Remarks"
                            value={risk?.remarks}
                        />

                    </div>

                </div>

                {/* ==================================================
                    KRI DETAILS
                ================================================== */}

                <div className="report-section-card mb-6">

                    <div className="mb-5">

                        <h2 className="text-lg font-bold text-gray-900">
                            KRI Details
                        </h2>

                        <p className="text-sm text-gray-500">
                            Key Risk Indicators associated with this risk
                        </p>

                    </div>


                    {kris.length === 0 ? (

                        <div className="text-center py-8 text-gray-500">
                            No KRI details available.
                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full text-sm">

                                <thead>

                                    <tr className="border-b border-gray-200 bg-gray-50">

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            KRI ID
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            KRI Name
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Description
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Owner
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Current Value
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Green Threshold
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Amber Threshold
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Red Threshold
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Unit
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Frequency
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Status
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {kris.map((kri, index) => (

                                        <tr
                                            key={
                                                kri?.id ||
                                                kri?.kriId ||
                                                index
                                            }
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                        >

                                            <td className="px-4 py-4 font-medium text-gray-800">
                                                {kri?.kriId || "-"}
                                            </td>

                                            <td className="px-4 py-4 font-medium text-gray-800">
                                                {kri?.kriName || "-"}
                                            </td>

                                            <td className="px-4 py-4 text-gray-600 min-w-[250px]">
                                                {kri?.description || "-"}
                                            </td>

                                            <td className="px-4 py-4 text-gray-700">
                                                {kri?.ownerName || "-"}
                                            </td>

                                            <td className="px-4 py-4 text-gray-700">
                                                {kri?.currentValue ?? "-"}
                                            </td>

                                            <td className="px-4 py-4 text-gray-700">
                                                {kri?.greenThreshold ?? "-"}
                                            </td>

                                            <td className="px-4 py-4 text-gray-700">
                                                {kri?.amberThreshold ?? "-"}
                                            </td>

                                            <td className="px-4 py-4 text-gray-700">
                                                {kri?.redThreshold ?? "-"}
                                            </td>

                                            <td className="px-4 py-4 text-gray-700">
                                                {kri?.unit || "-"}
                                            </td>

                                            <td className="px-4 py-4 text-gray-700">
                                                {kri?.frequency || "-"}
                                            </td>

                                            <td className="px-4 py-4">

                                                <span
                                                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                                        kri?.status === "GREEN"
                                                            ? "bg-green-100 text-green-700"
                                                            : kri?.status === "AMBER"
                                                                ? "bg-yellow-100 text-yellow-700"
                                                                : kri?.status === "RED"
                                                                    ? "bg-red-100 text-red-700"
                                                                    : "bg-gray-100 text-gray-700"
                                                    }`}
                                                >
                                                    {kri?.status || "-"}
                                                </span>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>


                {/* ==================================================
                    MITIGATION DETAILS
                ================================================== */}

                <div className="report-section-card mb-6">

                    <div className="mb-5">

                        <h2 className="text-lg font-bold text-gray-900">
                            Mitigation Details
                        </h2>

                        <p className="text-sm text-gray-500">
                            Mitigation actions associated with this risk
                        </p>

                    </div>


                    {mitigations.length === 0 ? (

                        <div className="text-center py-8 text-gray-500">
                            No mitigation details available.
                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full text-sm">

                                <thead>

                                    <tr className="border-b border-gray-200 bg-gray-50">

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Mitigation ID
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Title
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Description
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Type
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Owner
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Target Date
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Completed Date
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Effectiveness
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Cost
                                        </th>

                                        <th className="text-left px-4 py-3 font-semibold text-gray-700">
                                            Status
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {mitigations.map(
                                        (mitigation, index) => (

                                            <tr
                                                key={
                                                    mitigation?.mitigationId ||
                                                    index
                                                }
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                            >

                                                <td className="px-4 py-4 font-medium text-gray-800">
                                                    {
                                                        mitigation?.mitigationId ||
                                                        "-"
                                                    }
                                                </td>

                                                <td className="px-4 py-4 font-medium text-gray-800">
                                                    {
                                                        mitigation?.mitigationTitle ||
                                                        "-"
                                                    }
                                                </td>

                                                <td className="px-4 py-4 text-gray-600 min-w-[280px]">
                                                    {
                                                        mitigation?.mitigationDescription ||
                                                        "-"
                                                    }
                                                </td>

                                                <td className="px-4 py-4 text-gray-700">
                                                    {
                                                        mitigation?.mitigationType ||
                                                        "-"
                                                    }
                                                </td>

                                                <td className="px-4 py-4 text-gray-700">
                                                    {
                                                        mitigation?.ownerName ||
                                                        "-"
                                                    }
                                                </td>

                                                <td className="px-4 py-4 text-gray-700">
                                                    {
                                                        mitigation?.targetDate ||
                                                        "-"
                                                    }
                                                </td>

                                                <td className="px-4 py-4 text-gray-700">
                                                    {
                                                        mitigation?.completedDate ||
                                                        "-"
                                                    }
                                                </td>

                                                <td className="px-4 py-4 text-gray-700">
                                                    {
                                                        mitigation?.effectiveness ||
                                                        "-"
                                                    }
                                                </td>

                                                <td className="px-4 py-4 text-gray-700">
                                                    {
                                                        mitigation?.cost ??
                                                        "-"
                                                    }
                                                </td>

                                                <td className="px-4 py-4">

                                                    <span
                                                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                                            mitigation?.status === "COMPLETED"
                                                                ? "bg-green-100 text-green-700"
                                                                : mitigation?.status === "IN_PROGRESS"
                                                                    ? "bg-blue-100 text-blue-700"
                                                                    : mitigation?.status === "PENDING"
                                                                        ? "bg-yellow-100 text-yellow-700"
                                                                        : "bg-gray-100 text-gray-700"
                                                        }`}
                                                    >
                                                        {
                                                            mitigation?.status ||
                                                            "-"
                                                        }
                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

              
{/* ============================================================
    AUDIT DETAILS
============================================================ */}

<section className="report-section-card">

    <h2 className="text-xl font-bold text-gray-800 mb-5">
        Audit Details
    </h2>

    {!audit ? (
        <p className="text-gray-500">
            No audit details found for this risk.
        </p>
    ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            <DetailCard
                label="Audit ID"
                value={audit.auditId}
            />

            <DetailCard
                label="Audit Name"
                value={audit.auditName}
            />

            <DetailCard
                label="Risk ID"
                value={audit.riskId}
            />

            <DetailCard
                label="Risk Title"
                value={audit.riskTitle}
            />

            <DetailCard
                label="Department"
                value={audit.department?.name}
            />

            <DetailCard
                label="Business Unit"
                value={audit.businessUnit}
            />

            <DetailCard
                label="Process Name"
                value={audit.processName}
            />

            <DetailCard
                label="Internal Auditor"
                value={audit.internalAuditorName}
            />

            <DetailCard
                label="Internal Auditor ID"
                value={audit.internalAuditorId}
            />

            <DetailCard
                label="Auditee"
                value={audit.auditeeName}
            />

            <DetailCard
                label="Start Date"
                value={audit.startDate}
            />

            <DetailCard
                label="End Date"
                value={audit.endDate}
            />

            <DetailCard
                label="Status"
                value={audit.status}
            />

            <DetailCard
                label="Created At"
                value={audit.createdAt}
            />

            <DetailCard
                label="Updated At"
                value={audit.updatedAt}
            />

            <div className="md:col-span-2 lg:col-span-3">
                <DetailCard
                    label="Description"
                    value={audit.description}
                />
            </div>

        </div>
    )}

</section>


{/* ============================================================
    FINDINGS + RECOMMENDATIONS + RELATED EVIDENCE
============================================================ */}
<section className="report-section-card">

    <div className="flex items-center justify-between mb-6">

        <h2 className="text-xl font-bold text-gray-800">
            Findings, Recommendations & Evidence
        </h2>

        <div className="flex gap-2">

            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                {findings.length} Finding{findings.length !== 1 ? "s" : ""}
            </span>

            <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-sm font-semibold">
                {Object.values(recommendations || {}).flat().length} Recommendation
                {Object.values(recommendations || {}).flat().length !== 1 ? "s" : ""}
            </span>

            <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
                {evidences.length} Evidence{evidences.length !== 1 ? "s" : ""}
            </span>

        </div>

    </div>


    {findings.length === 0 ? (

        <p className="text-gray-500 text-center py-8">
            No findings found for this audit.
        </p>

    ) : (

        <div className="space-y-6">

            {findings.map((finding, index) => {

                // ====================================================
                // EVIDENCE BELONGING TO THIS FINDING
                // ====================================================

                const relatedEvidence =
                    evidences.filter(
                        (evidence) =>
                            String(evidence.findingId) ===
                            String(finding.id)
                    );


                // ====================================================
                // RECOMMENDATIONS BELONGING TO THIS FINDING
                // ====================================================

                const findingRecommendations =
                    recommendations?.[finding.id] || [];


                return (

                    <div
                        key={finding.id || index}
                        className="border border-gray-200 rounded-2xl overflow-hidden"
                    >

                        {/* =================================================
                            FINDING DETAILS
                        ================================================= */}

                        <div className="bg-gray-50 p-5">

                            <div className="flex items-center justify-between mb-5">

                                <div>

                                    <h3 className="text-lg font-bold text-gray-800">
                                        Finding {index + 1}: {finding.title}
                                    </h3>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Finding ID: {finding.id}
                                    </p>

                                </div>

                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                    {finding.status || "-"}
                                </span>

                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                <DetailCard
                                    label="Finding ID"
                                    value={finding.id}
                                />

                                <DetailCard
                                    label="Audit ID"
                                    value={finding.auditId}
                                />

                                <DetailCard
                                    label="Audit Name"
                                    value={finding.auditName}
                                />

                                <DetailCard
                                    label="Title"
                                    value={finding.title}
                                />

                                <DetailCard
                                    label="Risk Level"
                                    value={finding.riskLevel}
                                />

                                <DetailCard
                                    label="Status"
                                    value={finding.status}
                                />

                                <DetailCard
                                    label="Auditor"
                                    value={finding.auditorName}
                                />

                                <DetailCard
                                    label="Created At"
                                    value={finding.createdAt}
                                />

                                <DetailCard
                                    label="Updated At"
                                    value={finding.updatedAt}
                                />

                                <div className="md:col-span-2 lg:col-span-3">

                                    <DetailCard
                                        label="Observation"
                                        value={finding.observation}
                                    />

                                </div>

                            </div>

                        </div>


                        {/* ============================================================
RECOMMENDATIONS
============================================================ */}

<div className="p-5 border-t border-orange-200 bg-orange-50/30">


<div className="flex items-center justify-between mb-4">
    <h4 className="text-md font-bold text-gray-800">
        Recommendations for this Finding
    </h4>

    <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
        {findingRecommendations.length} Recommendation
        {findingRecommendations.length !== 1 ? "s" : ""}
    </span>
</div>

{findingRecommendations.length === 0 ? (

    <div className="text-center py-5 bg-white rounded-xl border border-orange-100">
        <p className="text-sm text-gray-500">
            No recommendations found for this finding.
        </p>
    </div>

) : (

    <div className="space-y-4">

        {findingRecommendations.map(
            (recommendation, recommendationIndex) => (

                <div
                    key={
                        recommendation.id ||
                        recommendation.recommendationId ||
                        recommendationIndex
                    }
                    className="bg-white border border-gray-200 rounded-xl p-5"
                >

                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-5">

                        <div>
                            <h5 className="font-bold text-gray-800">
                                Recommendation {recommendationIndex + 1}
                            </h5>

                            <p className="text-xs text-gray-500 mt-1">
                                {recommendation.recommendationId}
                            </p>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            {recommendation.status || "-"}
                        </span>

                    </div>


                    {/* RECOMMENDATION DETAILS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                        <DetailCard
                            label="Recommendation ID"
                            value={recommendation.recommendationId}
                        />

                        <DetailCard
                            label="Finding ID"
                            value={recommendation.findingId}
                        />

                        <DetailCard
                            label="Finding Title"
                            value={recommendation.findingTitle}
                        />

                        <DetailCard
                            label="Audit ID"
                            value={recommendation.auditId}
                        />

                        <DetailCard
                            label="Audit Code"
                            value={recommendation.auditCode}
                        />

                        <DetailCard
                            label="Audit Name"
                            value={recommendation.auditName}
                        />

                        <DetailCard
                            label="Internal Auditor ID"
                            value={recommendation.internalAuditorId}
                        />

                        <DetailCard
                            label="Internal Auditor"
                            value={recommendation.internalAuditorName}
                        />

                        <DetailCard
                            label="Auditee ID"
                            value={recommendation.auditeeId}
                        />

                        <DetailCard
                            label="Auditee"
                            value={recommendation.auditeeName}
                        />

                        <DetailCard
                            label="Auditee Email"
                            value={recommendation.auditeeEmail}
                        />

                        <DetailCard
                            label="Status"
                            value={recommendation.status}
                        />

                        <DetailCard
                            label="Created At"
                            value={recommendation.createdAt}
                        />

                        <DetailCard
                            label="Updated At"
                            value={recommendation.updatedAt}
                        />

                        {/* RECOMMENDATION TEXT */}
                        <div className="md:col-span-2 lg:col-span-3">

                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">

                                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-2">
                                    Recommendation
                                </p>

                                <p className="text-sm text-gray-800 leading-relaxed">
                                    {recommendation.recommendationText || "-"}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>
            )
        )}

    </div>
)}


</div>



                        {/* =================================================
                            RELATED EVIDENCE
                        ================================================= */}

                        <div className="p-5 border-t border-gray-200 bg-white">

                            <div className="flex items-center justify-between mb-4">

                                <h4 className="text-md font-bold text-gray-800">
                                    Evidence for this Finding
                                </h4>

                                <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
                                    {relatedEvidence.length} Evidence
                                </span>

                            </div>


                            {relatedEvidence.length === 0 ? (

                                <div className="text-center py-5 bg-gray-50 rounded-xl">

                                    <p className="text-sm text-gray-500">
                                        No evidence submitted for this finding.
                                    </p>

                                </div>

                            ) : (

                                <div className="overflow-x-auto">

                                    <table className="w-full border-collapse">

                                        <thead>

                                            <tr className="bg-gray-50 border-b border-gray-200">

                                                <th className="text-left p-3 text-xs font-semibold text-gray-600">
                                                    Evidence ID
                                                </th>

                                                <th className="text-left p-3 text-xs font-semibold text-gray-600">
                                                    Finding ID
                                                </th>

                                                <th className="text-left p-3 text-xs font-semibold text-gray-600">
                                                    File Name
                                                </th>

                                                <th className="text-left p-3 text-xs font-semibold text-gray-600">
                                                    Description
                                                </th>

                                                <th className="text-left p-3 text-xs font-semibold text-gray-600">
                                                    Status
                                                </th>

                                                <th className="text-left p-3 text-xs font-semibold text-gray-600">
                                                    Uploaded At
                                                </th>

                                                <th className="text-left p-3 text-xs font-semibold text-gray-600">
                                                    Action
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {relatedEvidence.map(
                                                (evidence, evidenceIndex) => (

                                                    <tr
                                                        key={
                                                            evidence.id ||
                                                            evidenceIndex
                                                        }
                                                        className="border-b border-gray-100 hover:bg-gray-50"
                                                    >

                                                        <td className="p-3 text-sm font-medium text-gray-800">
                                                            {evidence.id}
                                                        </td>

                                                        <td className="p-3 text-sm text-blue-600 font-semibold">
                                                            Finding #{evidence.findingId}
                                                        </td>

                                                        <td className="p-3 text-sm text-gray-800">
                                                            {evidence.fileName || "-"}
                                                        </td>

                                                        <td className="p-3 text-sm text-gray-600">
                                                            {evidence.description || "-"}
                                                        </td>

                                                        <td className="p-3">

                                                            <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                                                                {evidence.status || "-"}
                                                            </span>

                                                        </td>

                                                        <td className="p-3 text-sm text-gray-600">
                                                            {evidence.uploadedAt
                                                                ? new Date(
                                                                    evidence.uploadedAt
                                                                ).toLocaleString()
                                                                : "-"
                                                            }
                                                        </td>

                                                        <td className="p-3">

                                                            {getEvidenceFileUrl(
                                                                evidence
                                                            ) ? (

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openEvidence(
                                                                            evidence
                                                                        )
                                                                    }
                                                                    className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                                                                >
                                                                    View
                                                                </button>

                                                            ) : (

                                                                <span className="text-gray-400 text-xs">
                                                                    File unavailable
                                                                </span>

                                                            )}

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

                );

            })}

        </div>

    )}

</section>

{/* ============================================================
COMPLIANCE REVIEW DETAILS
============================================================ */}

<section className="report-section-card">

    {/* ============================================================
        HEADER
    ============================================================ */}

    <div className="flex items-center justify-between mb-6">

        <h2 className="text-xl font-bold text-gray-800">
            Compliance Review Details
        </h2>

        {complianceReview?.status && (
            <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    String(complianceReview.status).toUpperCase() ===
                    "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : String(complianceReview.status).toUpperCase() ===
                          "REJECTED"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                }`}
            >
                {complianceReview.status}
            </span>
        )}

    </div>


    {/* ============================================================
        NO REVIEW
    ============================================================ */}

    {!complianceReview ? (

        <p className="text-gray-500 text-center py-8">
            No compliance review found for this audit.
        </p>

    ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* ====================================================
                REVIEW ID
            ==================================================== */}

            <DetailCard
                label="Review ID"
                value={
                    complianceReview.reviewId ||
                    complianceReview.id
                }
            />


            {/* ====================================================
                AUDIT ID
            ==================================================== */}

            <DetailCard
                label="Audit ID"
                value={
                    complianceReview.audit?.auditId ||
                    complianceReview.audit?.id ||
                    "-"
                }
            />


            {/* ====================================================
                AUDIT NAME
            ==================================================== */}

            <DetailCard
                label="Audit Name"
                value={
                    complianceReview.audit?.auditName ||
                    "-"
                }
            />


            {/* ====================================================
                COMPLIANCE OFFICER
            ==================================================== */}

            <DetailCard
                label="Compliance Officer"
                value={
                    complianceOfficerName ||
                    "-"
                }
            />


            {/* ====================================================
                COMPLIANCE OFFICER ID
            ==================================================== */}

            <DetailCard
                label="Compliance Officer ID"
                value={
                    complianceReview.reviewedBy?.employeeId ||
                    "-"
                }
            />


            {/* ====================================================
                REVIEW STATUS
            ==================================================== */}

            <DetailCard
                label="Review Status"
                value={
                    complianceReview.status ||
                    "-"
                }
            />


            {/* ====================================================
                REVIEWED AT
            ==================================================== */}

            <DetailCard
                label="Reviewed At"
                value={
                    complianceReview.reviewedAt ||
                    "-"
                }
            />


            {/* ====================================================
                CREATED AT
            ==================================================== */}

            <DetailCard
                label="Created At"
                value={
                    complianceReview.createdAt ||
                    "-"
                }
            />


            {/* ====================================================
                UPDATED AT
            ==================================================== */}

            <DetailCard
                label="Updated At"
                value={
                    complianceReview.updatedAt ||
                    "-"
                }
            />


            {/* ====================================================
                REVIEW COMMENTS
            ==================================================== */}

            <div className="md:col-span-2 lg:col-span-3">

                <DetailCard
                    label="Review Comments"
                    value={
                        complianceReview.comments ||
                        "-"
                    }
                />

            </div>

        </div>

    )}

</section>

                    </div>
                </div>

{/* ==================================================
    REPORT FOOTER
================================================== */}

<div className="text-center text-xs text-gray-400 py-4">

    Audit Report • Risk ID:{" "}
    {risk?.riskId || riskId}

</div>

</div>

</div>
);
};

export default AMAuditReportDetails;