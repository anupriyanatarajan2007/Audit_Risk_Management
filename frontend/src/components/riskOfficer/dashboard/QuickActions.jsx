// src/components/dashboard/QuickActions.jsx
import { memo } from "react";
import { motion } from "framer-motion";
import { FiPlus, FiActivity, FiShield, FiFileText, FiSend } from "react-icons/fi";

const ACTIONS = [
  { label: "Create Risk", icon: FiPlus, tone: "from-indigo-500 to-indigo-700", key: "risk" },
  { label: "Create KRI", icon: FiActivity, tone: "from-purple-500 to-purple-700", key: "kri" },
  { label: "Create Mitigation", icon: FiShield, tone: "from-emerald-500 to-emerald-700", key: "mitigation" },
  { label: "Generate Report", icon: FiFileText, tone: "from-amber-500 to-amber-700", key: "report" },
  { label: "Send Notification", icon: FiSend, tone: "from-rose-500 to-rose-700", key: "notification" },
];

function QuickActions({ onAction }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 mb-5">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {ACTIONS.map((a, i) => (
          <motion.button
            key={a.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onAction?.(a.key)}
            className={`flex flex-col items-center gap-3 rounded-xl bg-gradient-to-br ${a.tone} p-5 text-white shadow-md`}
          >
            <a.icon size={22} />
            <span className="text-xs font-medium text-center">{a.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default memo(QuickActions);