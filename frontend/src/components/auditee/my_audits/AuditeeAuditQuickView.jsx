import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  X,
  Building2,
  FileText,
  User,
  Calendar,
  ClipboardCheck,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import AuditeeAuditStatusBadge from "./AuditeeAuditStatusBadge";

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 py-2.5">
    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-gray-400" />
    </div>
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-sm text-gray-800 font-medium mt-0.5">
        {value || "—"}
      </p>
    </div>
  </div>
);

const AuditeeAuditQuickView = ({ audit, onClose }) => {
  const navigate = useNavigate();

  if (!audit) return null;

  const handleViewFull = () => {
    onClose();
    navigate(`/auditee/audit-details/${audit.auditId}`);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
      />
      <motion.div
        key="drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-medium">
              {audit.auditId}
            </p>
            <h2 className="text-base font-semibold text-gray-900">
              {audit.auditTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2">
          <div className="py-3">
            <AuditeeAuditStatusBadge status={audit.status} />
          </div>

          {audit.description && (
            <p className="text-sm text-gray-600 leading-relaxed pb-3 border-b border-gray-50">
              {audit.description}
            </p>
          )}

          <div className="divide-y divide-gray-50">
            <DetailRow icon={Building2} label="Department" value={audit.department} />
            <DetailRow icon={Building2} label="Business Unit" value={audit.businessUnit} />
            <DetailRow icon={FileText} label="Process" value={audit.processName} />
            <DetailRow icon={ClipboardCheck} label="Audit Type" value={audit.auditType} />
            <DetailRow icon={FileText} label="Audit Objective" value={audit.objective} />
            <DetailRow icon={FileText} label="Audit Scope" value={audit.scope} />
            <DetailRow icon={User} label="Auditor" value={audit.auditorName} />
            <DetailRow icon={Calendar} label="Start Date" value={audit.startDate} />
            <DetailRow icon={Calendar} label="Due Date" value={audit.dueDate} />
            <DetailRow
              icon={AlertCircle}
              label="Findings"
              value={
                audit.findingsCount
                  ? `${audit.findingsCount} (${audit.pendingFindingsCount || 0} pending response)`
                  : "0"
              }
            />
            <DetailRow
              icon={CheckCircle2}
              label="Pending Evidence"
              value={audit.pendingEvidenceCount ?? 0}
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-gray-100">
          <button
            onClick={handleViewFull}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition"
          >
            View Full Audit
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuditeeAuditQuickView;