// src/components/dashboard/DashboardHeader.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBell, FiRefreshCw, FiChevronDown } from "react-icons/fi";

function getGreeting(hour) {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardHeader({ officerName = "Risk Officer", unreadCount = 0, onBellClick, onRefresh, refreshing }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateStr = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-2xl"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 via-slate-900 to-emerald-600 bg-clip-text text-transparent"
          >
            {getGreeting(now.getHours())}, {officerName}
          </motion.h1>
          <p className="text-sm text-slate-500 mt-1">
            {dateStr} · <span className="tabular-nums text-slate-600">{timeStr}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ rotate: 180, scale: 0.9 }}
            onClick={onRefresh}
            className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm hover:bg-slate-50 transition-colors"
            title="Refresh dashboard"
          >
            <motion.span
              animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={refreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              className="block"
            >
              <FiRefreshCw size={18} />
            </motion.span>
          </motion.button>

          <motion.button
            onClick={onBellClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <motion.span
              animate={unreadCount > 0 ? { rotate: [0, -15, 12, -8, 0] } : {}}
              transition={{ duration: 0.6, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 4 }}
              className="block"
            >
              <FiBell size={18} />
            </motion.span>
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-rose-500/30"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm hover:bg-slate-50 transition-colors">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 text-xs font-bold text-white">
              {officerName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm text-slate-700 hidden sm:block">{officerName}</span>
            <FiChevronDown size={14} className="text-slate-400" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}