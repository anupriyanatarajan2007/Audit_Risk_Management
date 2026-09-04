// ⚠️ ReportStatus/ReportType enums weren't in the files you shared.
// Values below are inferred from your stats-card spec — replace with your
// actual com.example.audit_risk_management.enums values if different.

export const REPORT_STATUS = ["GENERATED", "PENDING", "FAILED"];

export const REPORT_TYPE = [
  "AUDIT_REPORT",
  "RISK_REPORT",
  "KRI_REPORT",
  "MITIGATION_REPORT",
  "COMPLIANCE_REPORT",

];

export const STATUS_META = {
  DRAFT:     { label: "Draft",     bg: "bg-slate-100",  text: "text-slate-600",   ring: "ring-slate-200",   dot: "bg-slate-400" },
  SUBMITTED: { label: "Submitted", bg: "bg-indigo-50",  text: "text-indigo-700",  ring: "ring-indigo-200",  dot: "bg-indigo-500" },
  APPROVED:  { label: "Approved",  bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  REJECTED:  { label: "Rejected",  bg: "bg-rose-50",    text: "text-rose-700",    ring: "ring-rose-200",    dot: "bg-rose-500" }
};

export const readableEnum = (val) =>
  val ? val.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "—";

export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};