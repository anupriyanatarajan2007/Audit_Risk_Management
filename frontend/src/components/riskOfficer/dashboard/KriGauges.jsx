// src/components/dashboard/KriGauges.jsx
import { memo } from "react";
import { motion } from "framer-motion";

function Gauge({ label, value = 0, threshold = 80, breached }) {
  const pct = Math.min(100, Math.max(0, value));
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (pct / 100) * circumference;
  const color = breached ? "#f43f5e" : pct >= threshold ? "#d97706" : "#10b981";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative flex flex-col items-center rounded-2xl border p-5 ${
        breached ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white shadow-sm"
      }`}
    >
      {breached && (
        <motion.div
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-rose-400"
        />
      )}
      <svg viewBox="0 0 120 120" className="w-28 h-28 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <motion.circle
          cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute top-[52px] text-xl font-bold text-slate-900 tabular-nums">{pct}%</div>
      <p className="mt-3 text-sm text-slate-600 text-center">{label}</p>
      <span className="mt-1 text-[11px] text-slate-400">Threshold {threshold}%</span>
    </motion.div>
  );
}

function KriGauges({ kris = [] }) {
  const display = kris.slice(0, 4).length
    ? kris.slice(0, 4).map((k) => ({
        label: k.name ?? k.kriName ?? "KRI",
        value: Number(k.currentValue ?? k.value ?? Math.random() * 100),
        threshold: Number(k.threshold ?? 80),
        breached: String(k.status).toUpperCase() === "CRITICAL",
      }))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-900 mb-5">KRI Monitoring</h3>
      {display.length === 0 ? (
        <p className="text-sm text-slate-400">No KRIs to display</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {display.map((g, i) => (
            <Gauge key={i} {...g} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default memo(KriGauges);