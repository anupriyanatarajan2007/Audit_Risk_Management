// src/components/common/ConfirmModal.jsx
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6"
          >
            <div className="flex items-start gap-3">
              <div
                className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  danger ? "bg-rose-100 text-rose-600" : "bg-blue-100 text-blue-600"
                }`}
              >
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-base">{title}</h3>
                {description && (
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{description}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-50 ${
                  danger ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Processing…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}