import { ClipboardList, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  ASSIGNED: {
    label: "Assigned",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: ClipboardList,
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-teal-50 text-teal-700 border-teal-200",
    icon: Loader2,
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  OVERDUE: {
    label: "Overdue",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: AlertTriangle,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-gray-100 text-gray-600 border-gray-200",
    icon: XCircle,
  },
};

const AuditeeAssignmentStatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || "Unknown",
    className: "bg-gray-100 text-gray-600 border-gray-200",
    icon: ClipboardList,
  };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${config.className}`}
    >
      <Icon className={`w-3.5 h-3.5 ${status === "IN_PROGRESS" ? "animate-spin" : ""}`} />
      {config.label}
    </span>
  );
};

export default AuditeeAssignmentStatusBadge;