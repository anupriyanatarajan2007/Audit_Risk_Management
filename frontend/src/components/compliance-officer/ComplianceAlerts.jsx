import React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Clock3,
  ShieldAlert,
  FileWarning,
  ChevronRight,
} from "lucide-react";

import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import { SkeletonBlock } from "./Skeletons";

const iconMap = {
  CRITICAL: ShieldAlert,
  HIGH: FileWarning,
  MEDIUM: Clock3,
  LOW: AlertTriangle,
};

const styleMap = {
  CRITICAL: "text-rose-600 bg-rose-50 border-rose-200",
  HIGH: "text-orange-600 bg-orange-50 border-orange-200",
  MEDIUM: "text-amber-600 bg-amber-50 border-amber-200",
  LOW: "text-teal-600 bg-teal-50 border-teal-200",
};

const ComplianceAlerts = ({
  alerts = [],
  loading,
  error,
  onRetry,
  onView,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-[20px] border border-slate-200 bg-white p-6 h-full shadow-sm hover:shadow-md transition-shadow"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Compliance Alerts
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Items requiring attention
          </p>
        </div>

        {alerts.length > 0 && (
          <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-[10px] font-semibold text-rose-600">
            {alerts.length} active
          </span>
        )}
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3"
            >
              <SkeletonBlock className="h-9 w-9 bg-slate-200" />

              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-3 w-3/4 bg-slate-200" />
                <SkeletonBlock className="h-2.5 w-1/2 bg-slate-200" />
              </div>

              <SkeletonBlock className="h-4 w-4 bg-slate-200" />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState
          message="Unable to load compliance alerts."
          onRetry={onRetry}
        />
      ) : !alerts.length ? (
        <EmptyState
          icon={ShieldAlert}
          title="No active alerts"
          subtitle="There are no compliance issues requiring immediate attention."
        />
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const severity = String(
              alert.severity ?? "MEDIUM"
            ).toUpperCase();

            const Icon = iconMap[severity] ?? AlertTriangle;

            return (
              <motion.button
                key={alert.id ?? index}
                type="button"
                onClick={() => onView?.(alert)}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.06,
                }}
                whileHover={{
                  x: 3,
                  scale: 1.01,
                }}
                className="w-full text-left flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 hover:shadow-sm p-3 transition-all"
              >
                {/* ICON */}
                <div
                  className={`h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center ${
                    styleMap[severity] ?? styleMap.MEDIUM
                  }`}
                >
                  <Icon size={16} />
                </div>

                {/* CONTENT */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {alert.title ?? "Compliance Alert"}
                    </p>

                    <span
                      className={`hidden sm:inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold ${
                        styleMap[severity] ?? styleMap.MEDIUM
                      }`}
                    >
                      {severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 truncate mt-1">
                    {alert.description ?? "Attention required"}
                  </p>
                </div>

                {/* ARROW */}
                <div className="h-7 w-7 shrink-0 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <ChevronRight
                    size={14}
                    className="text-slate-400"
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ComplianceAlerts;