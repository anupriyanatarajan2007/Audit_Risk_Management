import { motion } from "framer-motion";
import { FiSearch, FiX } from "react-icons/fi";

export default function NotificationFilters({
  search, onSearch, receiverSearch, onReceiverSearch,
  statusFilter, onStatus, dateFilter, onDateFilter,
  showFilters, onToggleFilters, hasActive, onClear
}) {
  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by title..."
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
          <input
            value={receiverSearch}
            onChange={(e) => onReceiverSearch(e.target.value)}
            placeholder="Search by receiver..."
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <select value={statusFilter} onChange={(e) => onStatus(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
          </select>
          <input type="date" value={dateFilter} onChange={(e) => onDateFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </div>
      </motion.div>
    </div>
  );
}