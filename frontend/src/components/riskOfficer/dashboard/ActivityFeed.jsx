// src/components/dashboard/ActivityFeed.jsx
import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { FiAlertTriangle, FiFileText, FiBell } from "react-icons/fi";

function buildFeed(risks, reports, notifications) {
  const items = [
    ...risks.slice(0, 4).map((r) => ({ icon: FiAlertTriangle, tone: "text-amber-500", label: r.title ?? "Risk updated", time: r.updatedAt ?? r.createdAt })),
    ...reports.slice(0, 4).map((r) => ({ icon: FiFileText, tone: "text-indigo-500", label: r.title ?? "Report submitted", time: r.updatedAt ?? r.createdAt })),
    ...notifications.slice(0, 4).map((n) => ({ icon: FiBell, tone: "text-rose-500", label: n.title ?? n.message ?? "Notification", time: n.createdAt })),
  ];
  return items.sort((a, b) => new Date(b.time ?? 0) - new Date(a.time ?? 0)).slice(0, 10);
} 

function ActivityFeed({ risks = [], reports = [], notifications = [] }) {
  const feed = useMemo(() => buildFeed(risks, reports, notifications), [risks, reports, notifications]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit sticky top-24"
    >
      <h3 className="text-lg font-semibold text-slate-900 mb-5">Activity Feed</h3>
      <div className="relative max-h-[420px] overflow-y-auto space-y-4 pr-1">
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" />
        {feed.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative flex gap-3 pl-0"
          >
            <div className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm ${item.tone}`}>
              <item.icon size={13} />
            </div>
            <div className="min-w-0 pb-1">
              <p className="text-sm text-slate-700 truncate">{item.label}</p>
              <p className="text-xs text-slate-400">{item.time ?? "just now"}</p>
            </div>
          </motion.div>
        ))}
        {feed.length === 0 && <p className="text-sm text-slate-400">No recent activity</p>}
      </div>
    </motion.div>
  );
}

export default memo(ActivityFeed);