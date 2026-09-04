// src/components/dashboard/MitigationProgress.jsx
import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiCheckCircle } from "react-icons/fi";

function statusPct(status) {
  const s = String(status).toUpperCase();
  if (s === "COMPLETED") return 100;
  if (s === "IN_PROGRESS") return 55;
  if (s === "PENDING") return 15;
  return 30;
}

function MitigationItem({ item, index }) {
  const [open, setOpen] = useState(false);
  const pct = item.progress ?? statusPct(item.status);
  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && String(item.status).toUpperCase() !== "COMPLETED";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-4 p-4 text-left">
        <motion.div
          animate={{ scale: pct === 100 ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 0.4 }}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            pct === 100 ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
          }`}
        >
          <FiCheckCircle size={16} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-900 truncate">{item.title ?? item.mitigationId ?? "Mitigation"}</p>
            <span className={`text-xs font-semibold ${isOverdue ? "text-rose-500" : "text-slate-500"}`}>{pct}%</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${isOverdue ? "bg-rose-500" : "bg-gradient-to-r from-indigo-500 to-emerald-500"}`}
            />
          </div>
        </div>

        <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-slate-400 shrink-0">
          <FiChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 text-xs text-slate-500 space-y-1"
          >
            <p>Status: <span className="text-slate-700">{item.status ?? "N/A"}</span></p>
            <p>Owner: <span className="text-slate-700">{item.ownerName ?? item.ownerId ?? "Unassigned"}</span></p>
            <p>Due: <span className={isOverdue ? "text-rose-500" : "text-slate-700"}>{item.dueDate ?? "N/A"}</span></p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MitigationProgress({ mitigations = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-900 mb-5">Mitigation Progress</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {mitigations.length === 0 && <p className="text-sm text-slate-400">No mitigations in progress</p>}
        {mitigations.slice(0, 8).map((m, i) => (
          <MitigationItem key={m.id ?? m.mitigationId ?? i} item={m} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

export default memo(MitigationProgress);