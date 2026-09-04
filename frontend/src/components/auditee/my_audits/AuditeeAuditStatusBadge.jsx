import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    Eye,
    FileWarning,
    ClipboardList,
    CircleDot,
    Lock,
  } from "lucide-react";
  
  const STATUS_CONFIG = {
    ASSIGNED: {
      label: "Assigned",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: ClipboardList,
    },
    PLANNED: {
      label: "Planned",
      className: "bg-purple-50 text-purple-700 border-purple-200",
      icon: CircleDot,
    },
    IN_PROGRESS: {
      label: "In Progress",
      className: "bg-teal-50 text-teal-700 border-teal-200",
      icon: Clock,
    },
    FINDINGS_RAISED: {
      label: "Findings Raised",
      className: "bg-orange-50 text-orange-700 border-orange-200",
      icon: AlertTriangle,
    },
    RESPONSE_PENDING: {
      label: "Response Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: FileWarning,
    },
    EVIDENCE_PENDING: {
      label: "Evidence Pending",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: FileWarning,
    },
    UNDER_REVIEW: {
      label: "Under Review",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Eye,
    },
    COMPLETED: {
      label: "Completed",
      className: "bg-green-50 text-green-700 border-green-200",
      icon: CheckCircle2,
    },
    CLOSED: {
      label: "Closed",
      className: "bg-emerald-50 text-emerald-800 border-emerald-200",
      icon: Lock,
    },
  };
  
  const normalizeStatus = (status = "") =>
    status.toString().trim().toUpperCase().replace(/\s+/g, "_");
  
  const AuditeeAuditStatusBadge = ({ status }) => {
    const key = normalizeStatus(status);
    const config = STATUS_CONFIG[key] || {
      label: status || "Unknown",
      className: "bg-gray-50 text-gray-700 border-gray-200",
      icon: CircleDot,
    };
    const Icon = config.icon;
  
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${config.className}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };
  
  export default AuditeeAuditStatusBadge;