// src/components/riskOfficer/mitigation/MitigationCard.jsx
import { motion } from "framer-motion";
import { CalendarClock, IndianRupee, AlertTriangle, User } from "lucide-react";
import {
  STATUS_CONFIG,
  TYPE_CONFIG,
  formatDate,
  formatCurrency,
  isOverdue,
  daysUntil,
} from "../../../utils/mitigationConstants";

export default function MitigationCard({ mitigation, onClick, dragHandleProps }) {
  const statusCfg = STATUS_CONFIG[mitigation.status] ?? STATUS_CONFIG.PLANNED;
  const typeCfg = TYPE_CONFIG[mitigation.mitigationType] ?? TYPE_CONFIG.PREVENTIVE;
  const overdue = isOverdue(mitigation);
  const dLeft = daysUntil(mitigation.targetDate);

  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.99 }}
      draggable
      {...dragHandleProps}
      onClick={() => onClick?.(mitigation)}
      className={`group relative cursor-pointer rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow ${
        overdue ? "border-rose-300" : "border-slate-200"
      }`}
    >
      {overdue && (
        <div className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
          <AlertTriangle size={10} /> Overdue
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <span className={`text-[10px] font-mono tracking-wide px-1.5 py-0.5 rounded ${typeCfg.bg} ${typeCfg.text} border ${typeCfg.border}`}>
          {typeCfg.label}
        </span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.badge}`}>
          {statusCfg.label}
        </span>
      </div>

      <h4 className="mt-2.5 text-sm font-semibold text-slate-900 leading-snug line-clamp-2">
        {mitigation.mitigationTitle}
      </h4>

      <p className="mt-1 text-xs text-slate-500 line-clamp-1">
        Risk: <span className="text-slate-600 font-medium">{mitigation.riskTitle || mitigation.riskId}</span>
      </p>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <CalendarClock size={13} />
          <span className="font-mono tabular-nums">{formatDate(mitigation.targetDate)}</span>
        </div>
        {mitigation.cost != null && (
          <div className="flex items-center gap-0.5 font-mono tabular-nums">
            <IndianRupee size={12} />
            {formatCurrency(mitigation.cost).replace("₹", "")}
          </div>
        )}
      </div>

      {mitigation.ownerName && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
          <User size={12} />
          {mitigation.ownerName}
        </div>
      )}

      {!overdue && dLeft !== null && mitigation.status !== "COMPLETED" && mitigation.status !== "CANCELLED" && dLeft <= 7 && (
        <p className="mt-2 text-[11px] font-medium text-amber-600">
          {dLeft <= 0 ? "Due today" : `Due in ${dLeft} day${dLeft === 1 ? "" : "s"}`}
        </p>
      )}
    </motion.div>
  );
}