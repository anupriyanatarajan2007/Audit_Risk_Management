import React from "react";
import { motion } from "framer-motion";
import {
  CalendarClock,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { SkeletonBlock } from "./Skeletons";

const priorityStyles = {
  CRITICAL: {
    badge: "border-rose-400/30 text-rose-300 bg-rose-400/10",
    dot: "bg-rose-400",
  },
  HIGH: {
    badge: "border-orange-400/30 text-orange-300 bg-orange-400/10",
    dot: "bg-orange-400",
  },
  MEDIUM: {
    badge: "border-amber-400/30 text-amber-300 bg-amber-400/10",
    dot: "bg-amber-400",
  },
  LOW: {
    badge: "border-teal-400/30 text-teal-300 bg-teal-400/10",
    dot: "bg-teal-400",
  },
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    x: -12,
  },
  show: {
    opacity: 1,
    x: 0,
  },
};

const UpcomingComplianceDeadlines = ({
  deadlines,
  loading,
  error,
  onRetry,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.015] backdrop-blur-2xl p-6 h-full shadow-xl shadow-black/10"
    >
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-teal-400/10 blur-3xl opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl border border-teal-400/20 bg-teal-400/10 flex items-center justify-center">
              <CalendarClock size={15} className="text-teal-300" />
            </div>

            <h3 className="text-sm font-semibold text-white">
              Upcoming Compliance Deadlines
            </h3>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            Important obligations due within the next 30 days
          </p>
        </div>

        {deadlines?.length > 0 && (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Upcoming
            </p>
            <p className="text-xl font-semibold text-white">
              {deadlines.length}
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock
              key={i}
              className="h-[68px] w-full rounded-2xl"
            />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          message="Unable to load upcoming deadlines."
          onRetry={onRetry}
        />
      ) : !deadlines?.length ? (
        <EmptyState
          icon={CalendarClock}
          title="No upcoming compliance deadlines"
          subtitle="You're all clear for the next 30 days."
        />
      ) : (
        <motion.ul
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {deadlines.map((d, index) => {
            const daysRemaining = Number(d.daysRemaining ?? 0);
            const overdue = daysRemaining < 0;

            const priorityKey = String(
              d.priority ?? "MEDIUM"
            ).toUpperCase();

            const priority =
              priorityStyles[priorityKey] ?? priorityStyles.MEDIUM;

            return (
              <motion.li
                key={d.id ?? index}
                variants={item}
                whileHover={{
                  x: 3,
                  scale: 1.01,
                }}
                className={`relative flex items-center gap-3 rounded-2xl border p-3.5 transition-all ${
                  overdue
                    ? "border-rose-400/30 bg-rose-400/[0.06] shadow-lg shadow-rose-950/10"
                    : "border-white/10 bg-white/[0.025] hover:border-teal-400/20 hover:bg-teal-400/[0.035]"
                }`}
              >
                {/* Priority indicator */}
                <div
                  className={`h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center ${
                    overdue
                      ? "border-rose-400/25 bg-rose-400/10"
                      : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  {overdue ? (
                    <AlertTriangle
                      size={16}
                      className="text-rose-300"
                    />
                  ) : (
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${priority.dot}`}
                    />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-100 truncate">
                    {d.name ?? "Compliance Obligation"}
                  </p>

                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`text-[11px] ${
                        overdue
                          ? "text-rose-300"
                          : "text-slate-500"
                      }`}
                    >
                      {overdue
                        ? `Overdue by ${Math.abs(
                            daysRemaining
                          )} days`
                        : daysRemaining === 0
                        ? "Due today"
                        : `Due in ${daysRemaining} days`}
                    </span>

                    {d.department && (
                      <>
                        <span className="text-slate-700">·</span>
                        <span className="text-[11px] text-slate-500 truncate">
                          {d.department}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Priority */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-[10px] uppercase font-semibold tracking-wide px-2 py-1 rounded-full border ${priority.badge}`}
                  >
                    {d.priority ?? "Medium"}
                  </span>

                  <ArrowUpRight
                    size={13}
                    className="text-slate-600"
                  />
                </div>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </motion.div>
  );
};

export default UpcomingComplianceDeadlines;