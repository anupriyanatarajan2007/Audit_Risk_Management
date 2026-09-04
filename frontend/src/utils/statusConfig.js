// src/utils/statusConfig.js

export const RISK_STATUSES = [
  "OPEN",
  "UNDER_REVIEW",
  "MITIGATION_IN_PROGRESS",
  "MONITORING",
  "CLOSED",
];

export const STATUS_CONFIG = {
  OPEN: {
    label: "Open",
    text: "text-blue-300",
    bg: "bg-blue-500/15",
    ring: "ring-blue-400/30",
    dot: "bg-blue-400",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    text: "text-purple-300",
    bg: "bg-purple-500/15",
    ring: "ring-purple-400/30",
    dot: "bg-purple-400",
  },
  MITIGATION_IN_PROGRESS: {
    label: "Mitigation",
    text: "text-amber-300",
    bg: "bg-amber-500/15",
    ring: "ring-amber-400/30",
    dot: "bg-amber-400",
  },
  MONITORING: {
    label: "Monitoring",
    text: "text-emerald-300",
    bg: "bg-emerald-500/15",
    ring: "ring-emerald-400/30",
    dot: "bg-emerald-400",
  },
  CLOSED: {
    label: "Closed",
    text: "text-slate-300",
    bg: "bg-slate-500/15",
    ring: "ring-slate-400/30",
    dot: "bg-slate-400",
  },
};

export const getStatusConfig = (status) =>
  STATUS_CONFIG[status] ?? STATUS_CONFIG.OPEN;