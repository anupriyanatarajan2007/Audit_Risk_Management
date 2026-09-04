// src/components/dashboard/DashboardFooter.jsx
import { motion } from "framer-motion";

function StatusDot({ ok }) {
  return (
    <span className="relative flex h-2 w-2">
      {ok && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
      <span className={`relative inline-flex h-2 w-2 rounded-full ${ok ? "bg-emerald-500" : "bg-rose-500"}`} />
    </span>
  );
}

export default function DashboardFooter({ apiOk = true, dbOk = true, lastSync }) {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-8 border-t border-slate-200 bg-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500"
    >
      <span>© {new Date().getFullYear()} Enterprise Audit & Risk Management System</span>
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-2"><StatusDot ok={apiOk} /> API {apiOk ? "Operational" : "Degraded"}</span>
        <span className="flex items-center gap-2"><StatusDot ok={dbOk} /> Database {dbOk ? "Operational" : "Degraded"}</span>
        <span>Last sync: {lastSync ? lastSync.toLocaleTimeString() : "—"}</span>
      </div>
    </motion.footer>
  );
}