

export const KRI_STATUS = ["GREEN", "AMBER", "RED"];

export const RISK_CATEGORY = [
  "FINANCIAL", "OPERATIONAL", "COMPLIANCE", "STRATEGIC",
  "INFORMATION_TECHNOLOGY", "CYBER_SECURITY", "LEGAL", "REPUTATIONAL"
];

export const UNIT = ["COUNT", "PERCENTAGE", "HOURS", "DAYS", "MONTHS"];

export const FREQUENCY = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"];

export const DEPARTMENT = [
  "INFORMATION_TECHNOLOGY",
  "FINANCE",
  "HUMAN_RESOURCES",
  "INTERNAL_AUDIT",
  "COMPLIANCE",
  "OPERATIONS",
  "ADMINISTRATION",
  "RISK_MANAGEMENT"
];

export const STATUS_META = {
  GREEN: { label: "Healthy",  color: "#10b981", bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500", solid: "bg-emerald-500" },
  AMBER: { label: "Warning",  color: "#f59e0b", bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-200",   dot: "bg-amber-500",   solid: "bg-amber-500" },
  RED:   { label: "Critical", color: "#f43f5e", bg: "bg-rose-50",    text: "text-rose-700",    ring: "ring-rose-200",    dot: "bg-rose-500",    solid: "bg-rose-500" }
};