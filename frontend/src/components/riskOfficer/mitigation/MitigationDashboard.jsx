// src/components/riskOfficer/mitigation/MitigationDashboard.jsx
import { motion } from "framer-motion";
import {
  ClipboardList,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
} from "lucide-react";

const CARD_DEFS = [
  { key: "total", label: "Total Mitigations", icon: Layers, cls: "text-slate-700 bg-slate-100" },
  { key: "planned", label: "Planned", icon: ClipboardList, cls: "text-amber-700 bg-amber-100" },
  { key: "inProgress", label: "In Progress", icon: Loader2, cls: "text-blue-700 bg-blue-100" },
  { key: "completed", label: "Completed", icon: CheckCircle2, cls: "text-emerald-700 bg-emerald-100" },
  { key: "cancelled", label: "Cancelled", icon: XCircle, cls: "text-rose-700 bg-rose-100" },
  { key: "overdue", label: "Overdue", icon: AlertTriangle, cls: "text-orange-700 bg-orange-100" },
];

export default function MitigationDashboard({ counts, loading }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
      {CARD_DEFS.map((def, i) => {
        const Icon = def.icon;
        return (
          <motion.div
            key={def.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
            className={`relative overflow-hidden rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow ${
              def.key === "overdue" ? "border-orange-200" : "border-slate-200"
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${def.cls}`}>
              <Icon size={17} />
            </div>
            <p className="text-xs font-medium text-slate-500">{def.label}</p>
            {loading ? (
              <div className="h-7 w-12 mt-1 rounded bg-slate-100 animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-slate-900 tabular-nums mt-0.5">
                {counts[def.key] ?? 0}
              </p>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}