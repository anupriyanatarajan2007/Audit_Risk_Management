// src/utils/mitigationConstants.js
import {
  ClipboardList,
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Search,
  Wrench,
} from "lucide-react";

export const MITIGATION_STATUS = {
  PLANNED: "PLANNED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const MITIGATION_TYPE = {
  PREVENTIVE: "PREVENTIVE",
  DETECTIVE: "DETECTIVE",
  CORRECTIVE: "CORRECTIVE",
};

// Order of the "happy path" — used to drive the stepper rail
export const STATUS_FLOW = ["PLANNED", "IN_PROGRESS", "COMPLETED"];

export const STATUS_CONFIG = {
  PLANNED: {
    label: "Planned",
    icon: ClipboardList,
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    solid: "bg-amber-500",
    ring: "ring-amber-500/30",
    badge: "bg-amber-100 text-amber-800 border-amber-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Loader2,
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    solid: "bg-blue-600",
    ring: "ring-blue-500/30",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    solid: "bg-emerald-600",
    ring: "ring-emerald-500/30",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    text: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    solid: "bg-rose-600",
    ring: "ring-rose-500/30",
    badge: "bg-rose-100 text-rose-800 border-rose-200",
  },
};

export const TYPE_CONFIG = {
  PREVENTIVE: {
    label: "Preventive",
    icon: ShieldCheck,
    text: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  DETECTIVE: {
    label: "Detective",
    icon: Search,
    text: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
  CORRECTIVE: {
    label: "Corrective",
    icon: Wrench,
    text: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
};

export const isOverdue = (m) => {
  if (!m || !m.targetDate) return false;
  if (m.status === "COMPLETED" || m.status === "CANCELLED") return false;
  return new Date(m.targetDate) < new Date(new Date().toDateString());
};

export const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const daysUntil = (value) => {
  if (!value) return null;
  const target = new Date(new Date(value).toDateString());
  const today = new Date(new Date().toDateString());
  return Math.round((target - today) / 86400000);
};

export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};