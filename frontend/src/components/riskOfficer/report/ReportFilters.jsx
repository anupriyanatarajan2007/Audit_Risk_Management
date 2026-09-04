import { motion } from "framer-motion";
import { FiSearch, FiX } from "react-icons/fi";
import { REPORT_STATUS, REPORT_TYPE } from "../../../constants/reportEnums";

export default function ReportFilters({
  search, onSearch, typeFilter, onType, statusFilter, onStatus,
  createdBy, onCreatedBy, dateStart, onDateStart, dateEnd, onDateEnd,
  showFilters, onToggleFilters, hasActive, onClear
}) {

    const readableEnum = (value) => {
        if (!value) return "-";
      
        return value
          .replaceAll("_", " ")
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase());
      };
      
  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by report title or ID..."
            className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-9 pr-3 text-sm outline-none backdrop-blur focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <button
          onClick={onToggleFilters}
          className="rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-600 backdrop-blur hover:bg-slate-50"
        >
          {showFilters ? "Hide Filters" : "Advanced Filters"}
        </button>
        {hasActive && (
          <button onClick={onClear} className="flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50">
            <FiX size={14} /> Clear
          </button>
        )}
      </div>

      <motion.div
        initial={false}
        animate={{ height: showFilters ? "auto" : 0, opacity: showFilters ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white/90 p-4 backdrop-blur">
          <select value={typeFilter} onChange={(e) => onType(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">All Types</option>
            {REPORT_TYPE.map((t) => <option key={t} value={t}>{readableEnum(t)}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => onStatus(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            {REPORT_STATUS.map((s) => <option key={s} value={s}>{readableEnum(s)}</option>)}
          </select>
          <input
            value={createdBy}
            onChange={(e) => onCreatedBy(e.target.value)}
            placeholder="Created by..."
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-2">
            <input type="date" value={dateStart} onChange={(e) => onDateStart(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <span className="text-xs text-slate-400">to</span>
            <input type="date" value={dateEnd} onChange={(e) => onDateEnd(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}