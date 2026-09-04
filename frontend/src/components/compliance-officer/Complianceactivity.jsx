import React from "react";
import { motion } from "framer-motion";
import {
  FileCheck2,
  FileWarning,
  ClipboardCheck,
  Activity as ActivityIcon,
} from "lucide-react";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { SkeletonBlock } from "./Skeletons";

const iconFor = (type) => {
  if (type === "finding") return FileWarning;
  if (type === "review") return ClipboardCheck;
  return FileCheck2;
};

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const item = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  show: {
    opacity: 1,
    y: 0,
  },
};

const timeAgo = (timestamp) => {
  if (!timestamp) return "—";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  return `${days}d ago`;
};

const getStatusStyle = (status) => {
  const value = String(status ?? "").toUpperCase();

  if (
    ["APPROVED", "COMPLETED", "COMPLIANT", "PASSED", "PASS"].includes(
      value
    )
  ) {
    return "text-emerald-600 bg-emerald-50 border-emerald-200";
  }

  if (
    ["REJECTED", "FAILED", "NON_COMPLIANT", "FAIL"].includes(value)
  ) {
    return "text-rose-600 bg-rose-50 border-rose-200";
  }

  if (
    ["PENDING", "UNDER_REVIEW", "IN_PROGRESS", "PARTIAL"].includes(
      value
    )
  ) {
    return "text-amber-600 bg-amber-50 border-amber-200";
  }

  return "text-slate-600 bg-slate-100 border-slate-200";
};

const ComplianceActivity = ({
  activity,
  loading,
  error,
  onRetry,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-[20px] border border-slate-200 bg-white p-6 h-full shadow-sm hover:shadow-md transition-shadow"
    >
      {/* HEADER */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Recent Compliance Activity
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Latest updates across reviews and findings
          </p>
        </div>

        <div className="h-9 w-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
          <ActivityIcon size={16} className="text-teal-600" />
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100"
            >
              <SkeletonBlock className="h-9 w-9 bg-slate-100" />

              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-3 w-3/4 bg-slate-100" />
                <SkeletonBlock className="h-2.5 w-1/2 bg-slate-100" />
              </div>

              <SkeletonBlock className="h-5 w-16 bg-slate-100" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState
          message="Unable to load recent activity."
          onRetry={onRetry}
        />
      ) : !activity?.length ? (
        <EmptyState
          icon={ActivityIcon}
          title="No recent activity"
        />
      ) : (
        <motion.ul
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {activity.map((a) => {
            const Icon = iconFor(a.type);

            return (
              <motion.li
                key={a.id}
                variants={item}
                className="group flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all"
              >
                {/* ICON */}
                <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                  <Icon
                    size={15}
                    className="text-teal-600"
                  />
                </div>

                {/* CONTENT */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {a.description}
                  </p>

                  <p className="text-[11px] text-slate-500 mt-1">
                    {a.user || "Compliance Officer"}
                    <span className="mx-1.5 text-slate-300">
                      •
                    </span>
                    {timeAgo(a.timestamp)}
                  </p>
                </div>

                {/* STATUS */}
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full border shrink-0 ${getStatusStyle(
                    a.status
                  )}`}
                >
                  {String(a.status ?? "UPDATED").replaceAll(
                    "_",
                    " "
                  )}
                </span>
              </motion.li>
            );
          })}
        </motion.ul>
      )}
    </motion.div>
  );
};

export default ComplianceActivity;