import React from "react";
import { motion } from "framer-motion";
import {
  FileSearch,
  ClipboardCheck,
  FileWarning,
  ShieldCheck,
  FileText,
  ArrowUpRight,
} from "lucide-react";

const actions = [
  {
    label: "Regulatory Requirements",
    description: "Review requirements",
    icon: FileSearch,
    path: "/compliance-officer/regulatory-requirements",
  },
  {
    label: "Compliance Reviews",
    description: "Manage reviews",
    icon: ClipboardCheck,
    path: "/compliance-officer/compliance-reviews",
  },
  {
    label: "Compliance Findings",
    description: "View findings",
    icon: FileWarning,
    path: "/compliance-officer/compliance-findings",
  },
 
  {
    label: "Compliance Reports",
    description: "Generate reports",
    icon: FileText,
    path: "/compliance-officer/compliance/reports",
  },
];

const ComplianceQuickActions = ({ onNavigate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* HEADER */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-900">
          Quick Actions
        </h3>

        <p className="text-xs text-slate-500 mt-1">
          Frequently used compliance operations
        </p>
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <motion.button
              key={action.label}
              type="button"
              onClick={() => onNavigate?.(action.path)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
              whileHover={{
                y: -4,
                boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
              }}
              whileTap={{ scale: 0.98 }}
              className="group text-left rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-teal-200 p-4 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                {/* ICON */}
                <div className="h-10 w-10 rounded-xl border border-teal-100 bg-teal-50 flex items-center justify-center">
                  <Icon
                    size={17}
                    className="text-teal-600 group-hover:scale-110 transition-transform"
                  />
                </div>

                {/* ARROW */}
                <div className="h-7 w-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center group-hover:border-teal-200">
                  <ArrowUpRight
                    size={14}
                    className="text-slate-400 group-hover:text-teal-600 transition-colors"
                  />
                </div>
              </div>

              {/* TITLE */}
              <p className="text-xs font-semibold text-slate-800 mt-4">
                {action.label}
              </p>

              {/* DESCRIPTION */}
              <p className="text-[10px] text-slate-500 mt-1">
                {action.description}
              </p>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ComplianceQuickActions;