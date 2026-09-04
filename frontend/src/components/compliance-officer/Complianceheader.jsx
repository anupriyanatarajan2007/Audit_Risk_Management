import React from "react";
import { motion } from "framer-motion";
import { Bell, RefreshCw, ShieldCheck } from "lucide-react";

const ComplianceHeader = ({
  userName = "Compliance Officer",
  onRefresh,
  isRefreshing,
}) => {
  const initials = userName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
    >
      {/* LEFT */}
      <div>
        <h1 className="text-2xl sm:text-[26px] font-semibold text-slate-900 tracking-tight">
          Compliance Overview
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Monitor regulatory compliance, reviews, findings and upcoming
          obligations.
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">

        {/* ROLE BADGE */}
        <motion.span
          whileHover={{ scale: 1.02 }}
          className="hidden sm:flex items-center gap-1.5 rounded-full
          border border-teal-200
          bg-teal-50
          px-3 py-1.5
          text-xs font-medium text-teal-700"
        >
          <ShieldCheck size={13} />
          Compliance Officer
        </motion.span>

        {/* NOTIFICATION */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Notifications"
          className="
            relative h-10 w-10 rounded-xl
            border border-slate-200
            bg-white
            flex items-center justify-center
            text-slate-500
            shadow-sm
            hover:bg-slate-50
            hover:text-slate-900
            hover:border-slate-300
            transition-all
          "
        >
          <Bell size={17} />

          {/* Notification dot */}
          <span
            className="
              absolute top-2 right-2
              h-1.5 w-1.5
              rounded-full
              bg-teal-500
            "
          />
        </motion.button>

        {/* REFRESH */}
        <motion.button
          type="button"
          onClick={onRefresh}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Refresh dashboard"
          className="
            h-10 w-10 rounded-xl
            border border-slate-200
            bg-white
            flex items-center justify-center
            text-slate-500
            shadow-sm
            hover:bg-slate-50
            hover:text-slate-900
            hover:border-slate-300
            transition-all
          "
        >
          <RefreshCw
            size={16}
            className={isRefreshing ? "animate-spin text-teal-600" : ""}
          />
        </motion.button>

        {/* PROFILE */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          className="
            h-10 w-10 rounded-xl
            bg-gradient-to-br
            from-teal-500
            to-cyan-500
            border border-teal-200
            flex items-center justify-center
            text-sm font-semibold
            text-white
            shadow-sm
          "
        >
          {initials}
        </motion.div>
      </div>
    </motion.header>
  );
};

export default ComplianceHeader;