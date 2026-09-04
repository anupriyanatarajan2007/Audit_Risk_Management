// src/utils/riskEnums.js

export const STATUSES = [
  { label: "New", value: "NEW" },
  { label: "Analyzed", value: "ANALYZED" },
  { label: "Approved", value: "APPROVED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Mitigated", value: "MITIGATED" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Reopened", value: "REOPENED" },
  { label: "Closed", value: "CLOSED" },
  { label: "Rejected", value: "REJECTED" },
];

export const STATUS_STYLES = {
  NEW: { label: "New", text: "text-blue-700", bg: "bg-blue-100", ring: "ring-blue-200", dot: "bg-blue-500" },
  ANALYZED: { label: "Analyzed", text: "text-indigo-700", bg: "bg-indigo-100", ring: "ring-indigo-200", dot: "bg-indigo-500" },
  APPROVED: { label: "Approved", text: "text-cyan-700", bg: "bg-cyan-100", ring: "ring-cyan-200", dot: "bg-cyan-500" },
  IN_PROGRESS: { label: "In Progress", text: "text-purple-700", bg: "bg-purple-100", ring: "ring-purple-200", dot: "bg-purple-500" },
  MITIGATED: { label: "Mitigated", text: "text-teal-700", bg: "bg-teal-100", ring: "ring-teal-200", dot: "bg-teal-500" },
  VERIFIED: { label: "Verified", text: "text-emerald-700", bg: "bg-emerald-100", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  REOPENED: { label: "Reopened", text: "text-orange-700", bg: "bg-orange-100", ring: "ring-orange-200", dot: "bg-orange-500" },
  CLOSED: { label: "Closed", text: "text-slate-600", bg: "bg-slate-100", ring: "ring-slate-200", dot: "bg-slate-400" },
  REJECTED: { label: "Rejected", text: "text-red-700", bg: "bg-red-100", ring: "ring-red-200", dot: "bg-red-500" },
};

export const getStatusStyle = (status) => STATUS_STYLES[status] ?? STATUS_STYLES.NEW;

export const CATEGORIES = [
  { value: "FINANCIAL", label: "Financial" },
  { value: "OPERATIONAL", label: "Operational" },
  { value: "COMPLIANCE", label: "Compliance" },
  { value: "STRATEGIC", label: "Strategic" },
  { value: "INFORMATION_TECHNOLOGY", label: "Information Technology" },
  { value: "CYBER_SECURITY", label: "Cyber Security" },
  { value: "LEGAL", label: "Legal" },
  { value: "REPUTATIONAL", label: "Reputational" },
];

export const DEPARTMENTS = [
  { value: "INTERNAL_AUDIT", label: "Internal Audit" },
  { value: "RISK_MANAGEMENT", label: "Risk Management" },
  { value: "COMPLIANCE", label: "Compliance" },
  { value: "FINANCE", label: "Finance" },
  { value: "HUMAN_RESOURCES", label: "Human Resources" },
  { value: "INFORMATION_TECHNOLOGY", label: "Information Technology" },
  { value: "OPERATIONS", label: "Operations" },
  { value: "ADMINISTRATION", label: "Administration" },
];

export const LIKELIHOODS = [
  { value: "RARE", label: "Rare" },
  { value: "UNLIKELY", label: "Unlikely" },
  { value: "POSSIBLE", label: "Possible" },
  { value: "LIKELY", label: "Likely" },
  { value: "ALMOST_CERTAIN", label: "Almost Certain" },
];

export const IMPACTS = [
  { value: "VERY_LOW", label: "Very Low" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "VERY_HIGH", label: "Very High" },
];