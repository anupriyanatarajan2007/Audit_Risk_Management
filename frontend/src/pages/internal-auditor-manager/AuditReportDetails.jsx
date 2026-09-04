import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  RefreshCw,
  FileText,
  ShieldAlert,
  Paperclip,
  AlertCircle,
  ExternalLink,
  Save,
  FileDown,
  FileType,
  Printer,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from "docx";

import { saveAs } from "file-saver";

import { getAuditById } from "../../service/AuditService";
import {
  getEvidenceByAudit,
  openEvidence,
} from "../../service/EvidenceService";
import { getFindingsByAuditId } from "../../service/FindingService";
import auditeeAssignmentService from "../../service/auditeeAssignmentService";

// ============================================================
// HELPERS
// ============================================================

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const displayValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.departmentName ||
      value.title ||
      value.username ||
      value.employeeId ||
      "N/A"
    );
  }

  return String(value);
};

const getPersonName = (person) => {
  if (!person) return "N/A";

  if (typeof person === "string") return person;

  return (
    person.name ||
    person.employeeName ||
    [person.firstName, person.lastName].filter(Boolean).join(" ") ||
    person.username ||
    person.email ||
    "N/A"
  );
};

// ============================================================
// AUDITEE ASSIGNMENT HELPERS
// ============================================================

const normalizeAssignments = (response) => {
  if (!response) return [];

  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.assignments)) return response.assignments;
  if (Array.isArray(response.content)) return response.content;

  if (typeof response === "object") return [response];

  return [];
};

const getAuditeeNameFromAssignment = (assignment) => {
  if (!assignment) return "N/A";

  if (assignment.auditeeName) return String(assignment.auditeeName);
  if (assignment.employeeName) return String(assignment.employeeName);
  if (assignment.name) return String(assignment.name);

  const nested =
    assignment.auditee ||
    assignment.user ||
    assignment.auditeeUser ||
    assignment.employee;

  if (nested) {
    const name = getPersonName(nested);
    if (name !== "N/A") return name;
  }

  if (assignment.auditeeId !== null && assignment.auditeeId !== undefined) {
    return `Auditee #${assignment.auditeeId}`;
  }

  return "N/A";
};

// ============================================================
// BADGE STYLES
// ============================================================

const auditStatusStyles = {
  COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-200",
  IN_PROGRESS: "bg-amber-50 text-amber-600 border-amber-200",
  PLANNED: "bg-slate-100 text-slate-600 border-slate-200",
  CANCELLED: "bg-rose-50 text-rose-600 border-rose-200",
  ON_HOLD: "bg-orange-50 text-orange-600 border-orange-200",
};

const riskLevelStyles = {
  CRITICAL: "bg-rose-100 text-rose-700 border-rose-300",
  HIGH: "bg-orange-100 text-orange-700 border-orange-300",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-300",
  LOW: "bg-emerald-100 text-emerald-700 border-emerald-300",
};

const findingStatusStyles = {
  OPEN: "bg-amber-100 text-amber-700 border-amber-300",
  CLOSED: "bg-emerald-100 text-emerald-700 border-emerald-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-300",
};

const evidenceStatusStyles = {
  PENDING: "bg-slate-100 text-slate-600 border-slate-300",
  APPROVED: "bg-emerald-100 text-emerald-700 border-emerald-300",
  REJECTED: "bg-rose-100 text-rose-700 border-rose-300",
};

const Badge = ({ text, map }) => {
  const value = displayValue(text);

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
        map?.[value] || "bg-slate-100 text-slate-600 border-slate-300"
      }`}
    >
      {value}
    </span>
  );
};

// ============================================================
// REUSABLE UI
// ============================================================

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
    <span className="text-slate-500 text-sm">{label}</span>
    <span className="text-slate-800 text-sm font-medium text-right break-words max-w-[65%]">
      {displayValue(value)}
    </span>
  </div>
);

const SectionCard = ({ icon: Icon, title, count, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 print:shadow-none print:border-slate-300 print:break-inside-avoid"
  >
    <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
      <Icon className="w-4.5 h-4.5 text-teal-600" />
      {title}
      {typeof count === "number" && (
        <span className="ml-1 text-xs font-normal text-slate-400">
          ({count})
        </span>
      )}
    </h2>

    {children}
  </motion.section>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AuditReportDetails() {
  // Accept either :id or :auditId as the route param name, so this
  // page works no matter which one your router uses.
  const params = useParams();
  const id = params.id || params.auditId;
  const navigate = useNavigate();

  const printRef = useRef(null);

  const [audit, setAudit] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [findings, setFindings] = useState([]);
  const [auditeeName, setAuditeeName] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(null); // "pdf" | "word" | null
  const [toast, setToast] = useState(null);

  // ==========================================================
  // LOAD AUDIT + EVIDENCE + FINDINGS
  // ==========================================================

  const loadData = useCallback(async () => {
    if (!id) {
      setError("Audit ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [auditData, evidenceData, findingsData] = await Promise.all([
        getAuditById(id),
        getEvidenceByAudit(id).catch((err) => {
          console.warn("Failed to load evidence:", err);
          return [];
        }),
        getFindingsByAuditId(id).catch((err) => {
          console.warn("Failed to load findings:", err);
          return [];
        }),
      ]);

      if (!auditData) {
        throw new Error("AUDIT_NOT_FOUND");
      }

      setAudit(auditData);
      setEvidence(Array.isArray(evidenceData) ? evidenceData : []);
      setFindings(Array.isArray(findingsData) ? findingsData : []);

      // --------------------------------------------------------
      // RESOLVE AUDITEE
      //
      // audit.auditeeName from the DTO isn't always populated,
      // so fall back to the auditee-assignment lookup used on
      // the Audit Reports list page.
      // --------------------------------------------------------

      if (auditData.auditeeName) {
        setAuditeeName(String(auditData.auditeeName));
      } else {
        try {
          const auditDbId = auditData.id;
          const auditCode = auditData.auditId;

          let assignments = [];

          if (auditDbId !== null && auditDbId !== undefined) {
            const response = await auditeeAssignmentService
              .getAssignmentsByAudit(auditDbId)
              .catch(() => null);

            assignments = normalizeAssignments(response);
          }

          if (assignments.length === 0 && auditCode) {
            const response = await auditeeAssignmentService
              .getAssignmentsByAudit(auditCode)
              .catch(() => null);

            assignments = normalizeAssignments(response);
          }

          const assignment = assignments[0] || null;

          setAuditeeName(getAuditeeNameFromAssignment(assignment));
        } catch (assignmentErr) {
          console.warn("Failed to resolve auditee:", assignmentErr);
          setAuditeeName("N/A");
        }
      }
    } catch (err) {
      console.error("Failed to load audit report:", err);

      const status = err?.response?.status;

      if (err?.message === "AUDIT_NOT_FOUND" || status === 404) {
        setError("Audit not found.");
      } else if (status === 401) {
        setError("Your session has expired. Please login again.");
      } else if (status === 403) {
        setError("You do not have permission to view this audit.");
      } else if (!err?.response) {
        setError("Unable to connect to the server. Please try again.");
      } else {
        setError("Unable to load audit report. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================================
  // TOAST AUTO-DISMISS
  // ==========================================================

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  // ==========================================================
  // SAVE (frontend-only acknowledgement, no backend change)
  // ==========================================================

  const handleSave = async () => {
    setSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      setToast({
        type: "success",
        message: "Audit report saved successfully.",
      });
    } catch (err) {
      console.error("Save report failed:", err);

      setToast({
        type: "error",
        message: "Unable to save report. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // PRINT
  // ==========================================================

  const handlePrint = () => {
    window.print();
  };

  // ==========================================================
  // PDF DOWNLOAD
  // ==========================================================

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;

    setExporting("pdf");

    let wrapper = null;

    try {
      const clonedElement = printRef.current.cloneNode(true);

      wrapper = document.createElement("div");
      wrapper.style.position = "fixed";
      wrapper.style.left = "-100000px";
      wrapper.style.top = "0";
      wrapper.style.width = `${printRef.current.scrollWidth}px`;
      wrapper.style.background = "#ffffff";
      wrapper.style.zIndex = "-9999";

      wrapper.appendChild(clonedElement);
      document.body.appendChild(wrapper);

      // Tailwind v4 uses oklch() colors, which html2canvas cannot
      // render. Strip inline oklch styles and force plain hex
      // colors so the export doesn't come out as solid black boxes.
      const allElements = [
        clonedElement,
        ...clonedElement.querySelectorAll("*"),
      ];

      allElements.forEach((element) => {
        const style = element.getAttribute("style");

        if (style && style.includes("oklch")) {
          element.removeAttribute("style");
        }

        element.style.color = "#111827";
        element.style.backgroundColor = "#ffffff";
        element.style.borderColor = "#d1d5db";
        element.style.boxShadow = "none";
        element.style.textShadow = "none";
      });

      const pdfStyle = document.createElement("style");

      pdfStyle.innerHTML = `
        *, *::before, *::after {
          color: #111827 !important;
          border-color: #d1d5db !important;
          box-shadow: none !important;
          text-shadow: none !important;
        }
        body { background: #ffffff !important; }
        svg { color: #111827 !important; fill: none !important; stroke: #111827 !important; }
        img { max-width: 100%; }
      `;

      wrapper.appendChild(pdfStyle);

      await new Promise((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(resolve));
      });

      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        logging: false,
        removeContainer: true,
      });

      if (wrapper && wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
        wrapper = null;
      }

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;

      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const usablePageHeight = pageHeight - margin * 2;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= usablePageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= usablePageHeight;
      }

      const pageCount = pdf.internal.getNumberOfPages();

      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(120);
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - margin - 20,
          pageHeight - 5
        );
        pdf.text(
          "Audit & Risk Management System",
          margin,
          pageHeight - 5
        );
      }

      pdf.save(`Audit_Report_${displayValue(audit?.auditId)}.pdf`);

      setToast({ type: "success", message: "PDF downloaded successfully." });
    } catch (err) {
      console.error("PDF export failed:", err);
      setToast({
        type: "error",
        message: "Unable to generate PDF. Please try again.",
      });
    } finally {
      if (wrapper && wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }
      setExporting(null);
    }
  };

  // ==========================================================
  // WORD DOWNLOAD
  // ==========================================================

  const handleDownloadWord = async () => {
    if (!audit) return;

    setExporting("word");

    try {
      const heading = (text) =>
        new Paragraph({
          text,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        });

      const kv = (label, value) =>
        new Paragraph({
          children: [
            new TextRun({ text: `${label}: `, bold: true }),
            new TextRun({ text: displayValue(value) }),
          ],
          spacing: { after: 80 },
        });

      const children = [
        new Paragraph({
          text: "AUDIT & RISK MANAGEMENT SYSTEM",
          heading: HeadingLevel.TITLE,
          alignment: "center",
        }),

        new Paragraph({
          text: "AUDIT REPORT",
          heading: HeadingLevel.HEADING_1,
          alignment: "center",
        }),

        kv("Audit ID", audit?.auditId),
        kv("Audit Name", audit?.auditName),
        kv("Report Date", formatDate(new Date())),

        heading("1. Audit Details"),
        kv("Audit ID", audit?.auditId),
        kv("Audit Name", audit?.auditName),
        kv("Description", audit?.description),
        kv("Department", audit?.department),
        kv("Business Unit", audit?.businessUnit),
        kv("Process Name", audit?.processName),
        kv("Risk ID", audit?.riskId),
        kv("Risk Title", audit?.riskTitle),
        kv("Internal Auditor", audit?.internalAuditorName),
        kv("Auditee", auditeeName),
        kv("Start Date", formatDate(audit?.startDate)),
        kv("End Date", formatDate(audit?.endDate)),
        kv("Status", audit?.status),

        heading(`2. Evidence (${evidence.length})`),

        ...(evidence.length === 0
          ? [
              new Paragraph({
                text: "No evidence uploaded for this audit.",
                spacing: { after: 120 },
              }),
            ]
          : evidence.flatMap((item, index) => [
              kv(`Evidence ${index + 1}`, item?.fileName),
              kv("Description", item?.description),
              kv("Uploaded By", getPersonName(item?.uploadedBy)),
              kv("Uploaded Date", formatDate(item?.uploadedAt)),
              kv("Status", item?.status),
            ])),

        heading(`3. Findings (${findings.length})`),

        ...(findings.length === 0
          ? [
              new Paragraph({
                text: "No findings recorded for this audit.",
                spacing: { after: 120 },
              }),
            ]
          : findings.flatMap((finding, index) => [
              kv(`Finding ${index + 1}`, finding?.title),
              kv("Risk Level", finding?.riskLevel),
              kv("Observation", finding?.observation),
              kv("Recommendation", finding?.recommendation),
              kv("Status", finding?.status),
              kv("Auditor", finding?.auditorName),
              kv("Recorded On", formatDate(finding?.createdAt)),
            ])),
      ];

      const doc = new Document({
        sections: [{ properties: {}, children }],
      });

      const blob = await Packer.toBlob(doc);

      saveAs(blob, `Audit_Report_${displayValue(audit?.auditId)}.docx`);

      setToast({ type: "success", message: "Word document downloaded." });
    } catch (err) {
      console.error("Word export failed:", err);
      setToast({
        type: "error",
        message: "Unable to generate Word document. Please try again.",
      });
    } finally {
      setExporting(null);
    }
  };

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading audit report...
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-3" />

          <p className="text-sm text-slate-600 mb-4">
            {error || "Audit not found."}
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50"
            >
              Go Back
            </button>

            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm hover:bg-teal-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* TOAST */}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm print:hidden ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* HEADER */}

        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <h1 className="text-xl font-semibold text-slate-800">
                {displayValue(audit?.auditName)}
              </h1>

              <p className="text-sm text-slate-500 mt-0.5 font-mono">
                {displayValue(audit?.auditId)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge text={audit?.status} map={auditStatusStyles} />

            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-50 disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-50"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={exporting === "pdf"}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-50 disabled:opacity-60"
            >
              <FileDown className="w-3.5 h-3.5" />
              {exporting === "pdf" ? "Exporting..." : "PDF"}
            </button>

            <button
              onClick={handleDownloadWord}
              disabled={exporting === "word"}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 text-white text-sm hover:bg-teal-700 disabled:opacity-60"
            >
              <FileType className="w-3.5 h-3.5" />
              {exporting === "word" ? "Exporting..." : "Word"}
            </button>
          </div>
        </div>

        {/* PRINT / EXPORT AREA */}

        <div ref={printRef} className="space-y-6">
          {/* Print-only title */}
          <div className="hidden print:block text-center mb-4">
            <h1 className="text-lg font-bold">
              AUDIT & RISK MANAGEMENT SYSTEM
            </h1>
            <p className="text-sm">AUDIT REPORT</p>
          </div>

          {/* ====================================================
              1. AUDIT DETAILS
          ==================================================== */}

          <SectionCard icon={FileText} title="Audit Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div>
                <InfoRow label="Audit ID" value={audit?.auditId} />
                <InfoRow label="Audit Name" value={audit?.auditName} />
                <InfoRow label="Description" value={audit?.description} />
                <InfoRow label="Department" value={audit?.department} />
                <InfoRow
                  label="Business Unit"
                  value={audit?.businessUnit}
                />
                <InfoRow label="Process Name" value={audit?.processName} />
              </div>

              <div>
                <InfoRow label="Risk ID" value={audit?.riskId} />
                <InfoRow label="Risk Title" value={audit?.riskTitle} />
                <InfoRow
                  label="Internal Auditor"
                  value={audit?.internalAuditorName}
                />
                <InfoRow label="Auditee" value={auditeeName} />
                <InfoRow
                  label="Start Date"
                  value={formatDate(audit?.startDate)}
                />
                <InfoRow
                  label="End Date"
                  value={formatDate(audit?.endDate)}
                />
              </div>
            </div>
          </SectionCard>

          {/* ====================================================
              2. EVIDENCE
          ==================================================== */}

          <SectionCard
            icon={Paperclip}
            title="Evidence"
            count={evidence.length}
          >
            {evidence.length === 0 ? (
              <p className="text-sm text-slate-500">
                No evidence uploaded for this audit.
              </p>
            ) : (
              <div className="space-y-3">
                {evidence.map((item, index) => (
                  <div
                    key={item?.id || index}
                    className="flex items-center justify-between gap-4 border border-slate-200 rounded-xl p-4 print:break-inside-avoid"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">
                        {displayValue(item?.fileName)}
                      </p>

                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {displayValue(item?.description)}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Uploaded by {getPersonName(item?.uploadedBy)} on{" "}
                        {formatDate(item?.uploadedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge text={item?.status} map={evidenceStatusStyles} />

                      <button
                        onClick={() => openEvidence(item)}
                        className="inline-flex items-center gap-1 text-xs text-teal-600 hover:underline whitespace-nowrap print:hidden"
                      >
                        View
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* ====================================================
              3. FINDINGS
          ==================================================== */}

          <SectionCard
            icon={ShieldAlert}
            title="Findings"
            count={findings.length}
          >
            {findings.length === 0 ? (
              <p className="text-sm text-slate-500">
                No findings recorded for this audit.
              </p>
            ) : (
              <div className="space-y-3">
                {findings.map((finding, index) => (
                  <div
                    key={finding?.id || index}
                    className="border border-slate-200 rounded-xl p-4 print:break-inside-avoid"
                  >
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <p className="font-medium text-slate-800">
                        {displayValue(finding?.title)}
                      </p>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          text={finding?.riskLevel}
                          map={riskLevelStyles}
                        />
                        <Badge
                          text={finding?.status}
                          map={findingStatusStyles}
                        />
                      </div>
                    </div>

                    <InfoRow
                      label="Observation"
                      value={finding?.observation}
                    />
                    <InfoRow
                      label="Recommendation"
                      value={finding?.recommendation}
                    />
                    <InfoRow label="Auditor" value={finding?.auditorName} />
                    <InfoRow
                      label="Recorded On"
                      value={formatDate(finding?.createdAt)}
                    />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </motion.div>
    </div>
  );
}