// src/components/dashboard/UpcomingDeadlines.jsx
import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { FiClock } from "react-icons/fi";

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

function urgencyColor(days) {
  if (days === null) return "text-slate-500 bg-slate-100";
  if (days < 0) return "text-rose-600 bg-rose-50";
  if (days <= 3) return "text-amber-600 bg-amber-50";
  return "text-emerald-600 bg-emerald-50";
}

function UpcomingDeadlines({ risks = [], mitigations = [] }) {
  const items = useMemo(() => {
    const riskItems = risks
      .filter((r) => r.targetDate)
      .map((r) => ({ label: r.title ?? "Risk target", date: r.targetDate, type: "Risk" }));
    const mitigationItems = mitigations
      .filter((m) => m.dueDate)
      .map((m) => ({ label: m.title ?? "Mitigation due", date: m.dueDate, type: "Mitigation" }));
    return [...riskItems, ...mitigationItems]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 6);
  }, [risks, mitigations]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <FiClock className="text-slate-400" />
        <h3 className="text-lg font-semibold text-slate-900">Upcoming Deadlines</h3>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => {
          const days = daysUntil(item.date);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm text-slate-700 truncate">{item.label}</p>
                <p className="text-xs text-slate-400">{item.type} · {item.date}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${urgencyColor(days)}`}>
                {days === null ? "N/A" : days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
              </span>
            </motion.div>
          );
        })}
        {items.length === 0 && <p className="text-sm text-slate-400">No upcoming deadlines</p>}
      </div>
    </motion.div>
  );
}

export default memo(UpcomingDeadlines);