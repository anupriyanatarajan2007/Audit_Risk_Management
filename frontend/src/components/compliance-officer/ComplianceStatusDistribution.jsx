import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { SkeletonBlock } from "./Skeletons";

const rows = [
  {
    key: "compliant",
    label: "Compliant",
    color: "bg-teal-500",
    textColor: "text-teal-600",
  },
  {
    key: "partial",
    label: "Partially Compliant",
    color: "bg-amber-500",
    textColor: "text-amber-600",
  },
  {
    key: "nonCompliant",
    label: "Non-Compliant",
    color: "bg-rose-500",
    textColor: "text-rose-600",
  },
];

const ComplianceStatusDistribution = ({
  data = {},
  loading,
  error,
  onRetry,
}) => {
  const total =
    Number(data.compliant ?? 0) +
    Number(data.partial ?? 0) +
    Number(data.nonCompliant ?? 0);

  if (loading) {
    return (
      <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
        <SkeletonBlock className="h-5 w-48 mb-5 bg-slate-100" />

        <div className="space-y-5">
          <SkeletonBlock className="h-12 w-full bg-slate-100" />
          <SkeletonBlock className="h-12 w-full bg-slate-100" />
          <SkeletonBlock className="h-12 w-full bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Compliance Status Distribution
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Current status across regulatory requirements
          </p>
        </div>

        <div className="h-9 w-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
          <ShieldCheck size={17} className="text-teal-600" />
        </div>
      </div>

      {error ? (
        <ErrorState
          message="Unable to load compliance status."
          onRetry={onRetry}
        />
      ) : total === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No compliance data"
          subtitle="Compliance status will appear here once requirements are available."
        />
      ) : (
        <div className="space-y-6">
          {rows.map((row, index) => {
            const value = Number(data[row.key] ?? 0);
            const percentage = Math.round((value / total) * 100);

            return (
              <motion.div
                key={row.key}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.08,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${row.color}`}
                    />

                    <span className="text-xs font-medium text-slate-700">
                      {row.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${row.textColor}`}>
                      {percentage}%
                    </span>

                    <span className="text-[11px] text-slate-400">
                      ({value})
                    </span>
                  </div>
                </div>

                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentage}%` }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.9,
                      delay: index * 0.1,
                      ease: "easeOut",
                    }}
                    className={`h-full rounded-full ${row.color}`}
                  />
                </div>

                <p className="text-[10px] text-slate-400 mt-1.5">
                  {value} requirement{value !== 1 ? "s" : ""}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ComplianceStatusDistribution;