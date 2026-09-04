// src/components/riskOfficer/mitigation/MitigationTimeline.jsx
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarClock,
  User,
  IndianRupee,
  Gauge,
  FileText,
  PlayCircle,
  CheckCircle2,
  Ban,
} from "lucide-react";
import StatusStepper from "./StatusStepper";
import {
  STATUS_CONFIG,
  TYPE_CONFIG,
  formatDate,
  formatCurrency,
  isOverdue,
} from "../../../utils/mitigationConstants";

export default function MitigationTimeline({ mitigation, onBack, onStatusChange, updating }) {
  if (!mitigation) return null;
  const statusCfg = STATUS_CONFIG[mitigation.status] ?? STATUS_CONFIG.PLANNED;
  const typeCfg = TYPE_CONFIG[mitigation.mitigationType] ?? TYPE_CONFIG.PREVENTIVE;
  const overdue = isOverdue(mitigation);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4 font-medium"
      >
        <ArrowLeft size={16} /> Back to mitigations
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Risk: {mitigation.riskTitle || mitigation.riskId}
              </p>
              <h2 className="text-lg font-bold text-slate-900 mt-1">{mitigation.mitigationTitle}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCfg.badge}`}>
                {statusCfg.label}
              </span>
              {overdue && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full border bg-orange-100 text-orange-800 border-orange-200">
                  Overdue
                </span>
              )}
            </div>
          </div>

          <div className="mt-5">
            <StatusStepper status={mitigation.status} orientation="horizontal" />
          </div>
        </div>

        {/* Body: two columns */}
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-6 p-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Tracking</h3>
            <StatusStepper status={mitigation.status} orientation="vertical" />

            {mitigation.mitigationDescription && (
              <div className="mt-6 rounded-lg bg-slate-50 border border-slate-200 p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1.5">
                  <FileText size={13} /> DESCRIPTION
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{mitigation.mitigationDescription}</p>
              </div>
            )}

            {mitigation.remarks && (
              <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500 mb-1.5">REMARKS</p>
                <p className="text-sm text-slate-700 leading-relaxed">{mitigation.remarks}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 p-4 space-y-3">
              <InfoRow icon={<CalendarClock size={14} />} label="Target Date" value={formatDate(mitigation.targetDate)} />
              <InfoRow icon={<CalendarClock size={14} />} label="Completed Date" value={formatDate(mitigation.completedDate)} />
              <InfoRow icon={<User size={14} />} label="Owner" value={mitigation.ownerName || "Unassigned"} />
              <InfoRow icon={<IndianRupee size={14} />} label="Cost" value={formatCurrency(mitigation.cost)} />
              <InfoRow icon={<Gauge size={14} />} label="Effectiveness" value={mitigation.effectiveness ?? "—"} />
              <InfoRow
                icon={<typeCfg.icon size={14} />}
                label="Type"
                value={typeCfg.label}
              />
            </div>

            {/* Status actions */}
            {mitigation.status !== "COMPLETED" && mitigation.status !== "CANCELLED" && (
              <div className="rounded-lg border border-slate-200 p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 mb-1">UPDATE STATUS</p>
                {mitigation.status === "PLANNED" && (
                  <ActionButton
                    icon={<PlayCircle size={15} />}
                    label="Move to In Progress"
                    cls="bg-blue-600 hover:bg-blue-700"
                    loading={updating}
                    onClick={() => onStatusChange(mitigation, "IN_PROGRESS")}
                  />
                )}
                {mitigation.status === "IN_PROGRESS" && (
                  <ActionButton
                    icon={<CheckCircle2 size={15} />}
                    label="Complete Mitigation"
                    cls="bg-emerald-600 hover:bg-emerald-700"
                    loading={updating}
                    onClick={() => onStatusChange(mitigation, "COMPLETED")}
                  />
                )}
                <ActionButton
                  icon={<Ban size={15} />}
                  label="Cancel Mitigation"
                  cls="bg-rose-600 hover:bg-rose-700"
                  loading={updating}
                  onClick={() => onStatusChange(mitigation, "CANCELLED")}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-1.5 text-slate-400 text-xs">
        {icon} {label}
      </span>
      <span className="font-medium text-slate-800 font-mono tabular-nums">{value}</span>
    </div>
  );
}

function ActionButton({ icon, label, cls, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 text-sm font-semibold text-white rounded-lg py-2.5 transition-colors disabled:opacity-50 ${cls}`}
    >
      {icon} {label}
    </button>
  );
}