// src/components/riskOfficer/mitigation/MitigationFilters.jsx
import { Search, LayoutGrid, KanbanSquare, Table2, Plus, AlertTriangle } from "lucide-react";
import { STATUS_CONFIG, TYPE_CONFIG } from "../../../utils/mitigationConstants";

export default function MitigationFilters({
  filters,
  onFilterChange,
  view,
  onViewChange,
  onCreateClick,
}) {
  const update = (key, value) => onFilterChange({ ...filters, [key]: value });

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
      <div className="relative flex-1 min-w-[220px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Search mitigations, risk, owner…"
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
        />
      </div>

      <select
        value={filters.status}
        onChange={(e) => update("status", e.target.value)}
        className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      >
        <option value="ALL">All statuses</option>
        {Object.keys(STATUS_CONFIG).map((s) => (
          <option key={s} value={s}>
            {STATUS_CONFIG[s].label}
          </option>
        ))}
      </select>

      <select
        value={filters.type}
        onChange={(e) => update("type", e.target.value)}
        className="text-sm rounded-lg border border-slate-200 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
      >
        <option value="ALL">All types</option>
        {Object.keys(TYPE_CONFIG).map((t) => (
          <option key={t} value={t}>
            {TYPE_CONFIG[t].label}
          </option>
        ))}
      </select>

      <button
        onClick={() => update("overdueOnly", !filters.overdueOnly)}
        className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg border transition-colors ${
          filters.overdueOnly
            ? "bg-rose-50 border-rose-300 text-rose-700"
            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
        }`}
      >
        <AlertTriangle size={14} /> Overdue
      </button>

      <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
        {[
          { key: "kanban", icon: KanbanSquare, label: "Kanban" },
          { key: "table", icon: Table2, label: "Table" },
          { key: "dashboard", icon: LayoutGrid, label: "Overview" },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => onViewChange(key)}
            title={label}
            className={`p-2 rounded-md transition-colors ${
              view === key ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      <button
        onClick={onCreateClick}
        className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20"
      >
        <Plus size={16} /> New Mitigation
      </button>
    </div>
  );
}