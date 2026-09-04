// src/components/riskOfficer/mitigation/MitigationTable.jsx
import { Eye, Pencil, RefreshCw, Trash2, AlertTriangle } from "lucide-react";
import {
  STATUS_CONFIG,
  TYPE_CONFIG,
  formatDate,
  isOverdue,
} from "../../../utils/mitigationConstants";

export default function MitigationTable({
  mitigations,
  loading,
  onView,
  onEdit,
  onChangeStatus,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 border-b border-slate-100 animate-pulse bg-slate-50 last:border-0" />
        ))}
      </div>
    );
  }

  if (mitigations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center">
        <p className="text-sm font-medium text-slate-500">No mitigations match these filters</p>
        <p className="text-xs text-slate-400 mt-1">Try clearing a filter or create a new mitigation.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
      <table className="w-full text-sm min-w-[900px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Risk</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">Target Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Effectiveness</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mitigations.map((m) => {
            const id = m.mitigationId ?? m.id;
            const statusCfg = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.PLANNED;
            const typeCfg = TYPE_CONFIG[m.mitigationType] ?? TYPE_CONFIG.PREVENTIVE;
            const overdue = isOverdue(m);
            return (
              <tr key={id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">#{String(id).padStart(4, "0")}</td>
                <td className="px-4 py-3 max-w-[220px]">
                  <p className="font-medium text-slate-900 truncate">{m.mitigationTitle}</p>
                  {overdue && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-medium mt-0.5">
                      <AlertTriangle size={11} /> Overdue
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">{m.riskTitle || m.riskId}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${typeCfg.bg} ${typeCfg.text} ${typeCfg.border}`}>
                    {typeCfg.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{m.ownerName || "Unassigned"}</td>
                <td className="px-4 py-3 font-mono tabular-nums text-slate-600">{formatDate(m.targetDate)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusCfg.badge}`}>
                    {statusCfg.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{m.effectiveness ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onView(m)} title="View" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-indigo-600">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => onEdit(m)} title="Edit" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-indigo-600">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => onChangeStatus(m)} title="Change Status" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-blue-600">
                      <RefreshCw size={15} />
                    </button>
                    <button onClick={() => onDelete(m)} title="Delete" className="p-1.5 rounded-md hover:bg-rose-50 text-slate-500 hover:text-rose-600">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}