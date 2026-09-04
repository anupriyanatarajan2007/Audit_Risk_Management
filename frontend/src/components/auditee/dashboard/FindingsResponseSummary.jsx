import { motion } from "framer-motion";
import { AlertOctagon, CheckSquare, Hourglass } from "lucide-react";

const FindingsResponseSummary = ({ openFindings, responsesSubmitted, responsesPending }) => {
  const items = [
    { label: "Open Findings", value: openFindings, icon: AlertOctagon, accent: "text-amber-600 bg-amber-50" },
    { label: "Responses Submitted", value: responsesSubmitted, icon: CheckSquare, accent: "text-emerald-600 bg-emerald-50" },
    { label: "Responses Pending", value: responsesPending, icon: Hourglass, accent: "text-orange-600 bg-orange-50" },
  ];

  return (
    <div>
      <h3 className="text-base font-semibold text-slate-900 mb-3">Findings & Responses</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -3 }}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.accent}`}>
              <item.icon className="h-4.5 w-4.5" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900">{item.value}</p>
            <p className="text-xs text-slate-400">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FindingsResponseSummary;