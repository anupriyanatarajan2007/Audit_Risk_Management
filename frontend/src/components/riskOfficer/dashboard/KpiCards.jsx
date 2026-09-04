// src/components/dashboard/KpiCards.jsx
import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FiAlertTriangle, FiAlertOctagon, FiCheckCircle, FiClock,
  FiTrendingUp, FiTrendingDown, FiActivity,
} from "react-icons/fi";
import { useCountUp } from "../../../hooks/useCountUp";
import { useMagneticHover } from "../../../hooks/useMousePosition";

const THEME = {
  indigo: { grad: "from-indigo-200/60 to-indigo-100/0", ring: "ring-indigo-300", text: "text-indigo-600", glow: "shadow-indigo-200/60", card: "from-indigo-50 via-white to-white", border: "border-indigo-100" },
  emerald: { grad: "from-emerald-200/60 to-emerald-100/0", ring: "ring-emerald-300", text: "text-emerald-600", glow: "shadow-emerald-200/60", card: "from-emerald-50 via-white to-white", border: "border-emerald-100" },
  amber: { grad: "from-amber-200/60 to-amber-100/0", ring: "ring-amber-300", text: "text-amber-600", glow: "shadow-amber-200/60", card: "from-amber-50 via-white to-white", border: "border-amber-100" },
  rose: { grad: "from-rose-200/60 to-rose-100/0", ring: "ring-rose-300", text: "text-rose-600", glow: "shadow-rose-200/60", card: "from-rose-50 via-white to-white", border: "border-rose-100" },
  purple: { grad: "from-purple-200/60 to-purple-100/0", ring: "ring-purple-300", text: "text-purple-600", glow: "shadow-purple-200/60", card: "from-purple-50 via-white to-white", border: "border-purple-100" },
};

function Sparkline({ trendUp }) {
  const points = useMemo(() => {
    const base = Array.from({ length: 8 }, () => Math.random() * 20 + 5);
    if (!trendUp) base.reverse();
    return base.map((v, i) => `${i * 14},${28 - v}`).join(" ");
  }, [trendUp]);

  return (
    <svg viewBox="0 0 98 28" className="w-full h-7 mt-3 opacity-80">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const KpiCard = memo(function KpiCard({ label, value, icon: Icon, tone = "indigo", trend, critical = false, index = 0, loading }) {
  const animatedValue = useCountUp(loading ? 0 : value ?? 0);
  const t = THEME[tone];
  const { ref, onMouseMove, onMouseLeave } = useMagneticHover(0.08);
  const trendUp = (trend ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      onMouseMove={(e) => onMouseMove(e)}
      onMouseLeave={onMouseLeave}
      className={`group relative overflow-hidden rounded-2xl border ${t.border} bg-gradient-to-br ${t.card} p-5
        shadow-sm ${t.glow} transition-shadow hover:shadow-xl`}
    >
      {/* animated gradient border */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
        bg-[conic-gradient(from_0deg,transparent,rgba(15,23,42,0.08),transparent_30%)] animate-[spin_4s_linear_infinite]" />

      {/* floating background blob */}
      <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br ${t.grad} blur-2xl
        transition-transform duration-700 group-hover:scale-125`} />

      {critical && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.06, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-rose-400/60"
        />
      )}

      <div ref={ref} className="relative z-10">
        <div className="flex items-start justify-between">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.08 }}
            className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white ring-1 ${t.ring} ${t.text} shadow-sm`}
          >
            <Icon size={20} />
          </motion.div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${trendUp ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}`}>
              {trendUp ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        <div className="mt-4 text-3xl font-bold text-slate-900 tabular-nums">
          {loading ? "—" : animatedValue.toLocaleString()}
        </div>
        <div className="mt-1 text-sm text-slate-500">{label}</div>

        <div className={t.text}>
          <Sparkline trendUp={trendUp} />
        </div>
      </div>
    </motion.div>
  );
});

function KpiCards({ risks, kri, mitigation, loading }) {
  const cards = useMemo(
    () => [
      { label: "Total Risks", value: risks.total, icon: FiActivity, tone: "indigo", trend: 4 },
      { label: "Open Risks", value: risks.open, icon: FiAlertTriangle, tone: "amber", trend: -2 },
      { label: "Critical Risks", value: risks.critical, icon: FiAlertOctagon, tone: "rose", trend: 6, critical: risks.critical > 0 },
      { label: "Overdue Risks", value: risks.overdue, icon: FiClock, tone: "rose", trend: 3, critical: risks.overdue > 0 },
      { label: "Closed Risks", value: risks.closed, icon: FiCheckCircle, tone: "emerald", trend: 8 },
      { label: "Critical KRIs", value: kri.critical, icon: FiAlertOctagon, tone: "purple", trend: -1, critical: kri.critical > 0 },
    ],
    [risks, kri]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-5">
      {cards.map((c, i) => (
        <KpiCard key={c.label} {...c} index={i} loading={loading} />
      ))}
    </div>
  );
}

export default memo(KpiCards);