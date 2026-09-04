import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, X, Loader2 } from "lucide-react";
import { getStatusStyle } from "../../utils/riskEnums";

export default function StatusUpdateModal({ open, currentStatus, nextStatus, onConfirm, onCancel }) {
  const [submitting, setSubmitting] = useState(false);
  const current = getStatusStyle(currentStatus);
  const next = getStatusStyle(nextStatus);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-[70] bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="fixed left-1/2 top-1/2 z-[80] w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-start justify-between">
              <h3 className="text-base font-bold text-slate-800">Update Status?</h3>
              <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-2 py-2">
              <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${current.bg} ${current.text} ${current.ring}`}>
                {current.label}
              </span>
              <motion.div animate={{ y: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity }} className="text-slate-400">
                <ArrowDown size={18} />
              </motion.div>
              <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ring-1 ${next.bg} ${next.text} ${next.ring}`}>
                {next.label}
              </span>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onCancel}
                disabled={submitting}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? "Updating..." : "Update"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}