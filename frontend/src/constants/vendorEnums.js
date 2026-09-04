export const VENDOR_STATUS = ["ACTIVE", "INACTIVE", "SUSPENDED"];

export const STATUS_META = {
  ACTIVE:        { label: "Active",       bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  INACTIVE:      { label: "Inactive",     bg: "bg-slate-100",  text: "text-slate-600",   ring: "ring-slate-200",   dot: "bg-slate-400" },
  SUSPENDED:     { label: "Suspended",    bg: "bg-rose-50",    text: "text-rose-700",    ring: "ring-rose-200",    dot: "bg-rose-500" },
  UNDER_REVIEW:  { label: "Under Review", bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-200",   dot: "bg-amber-500" }
};

// Adjust if your backend enum differs
export const RISK_LEVEL = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const RISK_META = {
  LOW:      { text: "text-emerald-700", bg: "bg-emerald-50" },
  MEDIUM:   { text: "text-amber-700",   bg: "bg-amber-50" },
  HIGH:     { text: "text-rose-700",    bg: "bg-rose-50" },
  CRITICAL: { text: "text-rose-800",    bg: "bg-rose-100" }
};