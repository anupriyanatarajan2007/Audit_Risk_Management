export function calculateRiskScore(likelihood, impact) {
    const l = Number(likelihood);
    const i = Number(impact);
    if (!l || !i) return 0;
    return l * i;
  }
  
  export function calculateRiskLevel(score) {
    if (score >= 20) return "CRITICAL";
    if (score >= 12) return "HIGH";
    if (score >= 6) return "MEDIUM";
    if (score >= 1) return "LOW";
    return "";
  }
  
  export const LEVEL_STYLES = {
    LOW: { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    MEDIUM: { badge: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
    HIGH: { badge: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
    CRITICAL: { badge: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  };
  
  export const STATUS_STYLES = {
    OPEN: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-purple-100 text-purple-700",
    MITIGATED: "bg-teal-100 text-teal-700",
    CLOSED: "bg-slate-100 text-slate-600",
  };