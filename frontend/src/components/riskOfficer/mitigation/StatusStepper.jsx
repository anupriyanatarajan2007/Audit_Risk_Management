// src/components/riskOfficer/mitigation/StatusStepper.jsx
import { motion } from "framer-motion";
import { STATUS_CONFIG, STATUS_FLOW } from "../../../utils/mitigationConstants";

/**
 * orientation: "horizontal" (kanban/table drill-in header) | "vertical" (detail timeline)
 */
export default function StatusStepper({ status, orientation = "horizontal" }) {
  const cancelled = status === "CANCELLED";
  const currentIndex = cancelled
    ? STATUS_FLOW.indexOf("IN_PROGRESS") // rail fills to where it forked off
    : STATUS_FLOW.indexOf(status);

  if (orientation === "vertical") {
    return (
      <div className="relative pl-2">
        {STATUS_FLOW.map((step, i) => {
          const cfg = STATUS_CONFIG[step];
          const Icon = cfg.icon;
          const reached = i <= currentIndex;
          const isLast = i === STATUS_FLOW.length - 1;
          return (
            <div key={step} className="relative flex gap-4 pb-10 last:pb-0">
              {!isLast && (
                <div className="absolute left-[15px] top-8 w-[2px] h-full bg-slate-200 overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: i < currentIndex ? "100%" : "0%" }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className={`w-full ${cfg.solid}`}
                  />
                </div>
              )}
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.15 }}
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ring-4 ${
                  reached
                    ? `${cfg.solid} text-white ${cfg.ring}`
                    : "bg-slate-100 text-slate-400 ring-transparent"
                }`}
              >
                <Icon size={15} className={step === "IN_PROGRESS" && reached && status === "IN_PROGRESS" ? "animate-spin" : ""} />
              </motion.div>
              <div className="pt-1">
                <p className={`text-sm font-semibold ${reached ? "text-slate-900" : "text-slate-400"}`}>
                  {cfg.label}
                </p>
              </div>
            </div>
          );
        })}

        {cancelled && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="relative flex gap-4 -mt-8"
            style={{ marginLeft: 40 }}
          >
            <svg width="24" height="24" className="absolute -left-6 top-1 text-rose-400">
              <path d="M0,0 Q12,0 12,12" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="3 3" />
            </svg>
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 ring-4 ring-rose-500/30">
              <STATUS_CONFIG.CANCELLED.icon size={15} />
            </div>
            <p className="text-sm font-semibold text-rose-700 pt-1">Cancelled</p>
          </motion.div>
        )}
      </div>
    );
  }

  // Horizontal rail
  return (
    <div className="w-full">
      <div className="flex items-center">
        {STATUS_FLOW.map((step, i) => {
          const cfg = STATUS_CONFIG[step];
          const Icon = cfg.icon;
          const reached = i <= currentIndex;
          const isLast = i === STATUS_FLOW.length - 1;
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  animate={{ scale: reached ? 1 : 0.85 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ring-4 ${
                    reached ? `${cfg.solid} text-white ${cfg.ring}` : "bg-slate-100 text-slate-400 ring-transparent"
                  }`}
                >
                  <Icon size={14} className={step === "IN_PROGRESS" && status === "IN_PROGRESS" ? "animate-spin" : ""} />
                </motion.div>
                <span className={`text-[11px] font-medium whitespace-nowrap ${reached ? "text-slate-700" : "text-slate-400"}`}>
                  {cfg.label}
                </span>
              </div>
              {!isLast && (
                <div className="flex-1 h-[2px] bg-slate-200 mx-2 -mt-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: i < currentIndex ? "100%" : "0%" }}
                    transition={{ duration: 0.5 }}
                    className={`h-full ${cfg.solid}`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {cancelled && (
        <div className="flex items-center gap-1.5 mt-2 text-rose-600 text-xs font-semibold">
          <STATUS_CONFIG.CANCELLED.icon size={13} />
          Track forked to Cancelled after {STATUS_CONFIG.IN_PROGRESS.label}
        </div>
      )}
    </div>
  );
}