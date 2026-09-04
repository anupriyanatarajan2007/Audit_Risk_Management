// src/components/dashboard/RiskCharts.jsx
import { memo, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TABS = ["Category", "Department", "Risk Level", "Business Unit"];
const FIELD_MAP = { Category: "category", Department: "department", "Risk Level": "riskLevel", "Business Unit": "businessUnit" };
const COLORS = ["#6366f1", "#10b981", "#d97706", "#e11d48", "#8b5cf6", "#0ea5e9"];

function buildSlices(risks, field) {
  const counts = {};
  risks.forEach((r) => {
    const key = r[field] || "Unspecified";
    counts[key] = (counts[key] || 0) + 1;
  });
  const total = risks.length || 1;
  let cumulative = 0;
  return Object.entries(counts).map(([label, count], i) => {
    const pct = count / total;
    const start = cumulative;
    cumulative += pct;
    return { label, count, pct, start, end: cumulative, color: COLORS[i % COLORS.length] };
  });
}

function polarToCartesian(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, startPct, endPct) {
  const startAngle = startPct * 360;
  const endAngle = endPct * 360;
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function RiskCharts({ risks = [] }) {
  const [tab, setTab] = useState("Category");
  const slices = useMemo(() => buildSlices(risks, FIELD_MAP[tab]), [risks, tab]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-slate-900">Risk Distribution</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === t ? "text-white" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === t && (
              <motion.span
                layoutId="chart-tab-pill"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              />
            )}
            <span className="relative z-10">{t}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        <svg viewBox="0 0 200 200" className="w-48 h-48 -rotate-90">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#e2e8f0" strokeWidth="24" />
          <AnimatePresence mode="wait">
            {slices.map((s, i) => (
              <motion.path
                key={`${tab}-${s.label}`}
                d={arcPath(100, 100, 80, s.start, s.end)}
                fill="none"
                stroke={s.color}
                strokeWidth="24"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: "easeOut" }}
              />
            ))}
          </AnimatePresence>
          <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" className="rotate-90" transform="rotate(90 100 100)">
            <tspan x="100" dy="-4" fill="#0f172a" fontSize="28" fontWeight="700">{risks.length}</tspan>
            <tspan x="100" dy="20" fill="#94a3b8" fontSize="11">Total</tspan>
          </text>
        </svg>

        <div className="flex-1 w-full space-y-2">
          {slices.map((s) => (
            <div key={s.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-slate-600 truncate">{s.label}</span>
              </div>
              <span className="text-slate-400 tabular-nums shrink-0 ml-3">{s.count}</span>
            </div>
          ))}
          {slices.length === 0 && <p className="text-sm text-slate-400">No data available</p>}
        </div>
      </div>
    </motion.div>
  );
}

export default memo(RiskCharts);