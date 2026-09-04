import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck } from "react-icons/fi";
import { STATUS_META, getStatusKey, formatDateTime } from "../../../constants/NotificationEnums";

export default function NotificationViewDrawer({ notification, onClose, onMarkRead, actionLoading }) {
  return (
    <AnimatePresence>
      {notification && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-800">Notification</h2>
              <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              {(() => {
                const statusKey = getStatusKey(notification);
                const meta = STATUS_META[statusKey];
                return (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${meta.bg} ${meta.text} ${meta.ring}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                    {meta.label}
                  </span>
                );
              })()}

              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Title</h3>
                <p className="text-base font-medium text-slate-800">{notification.title}</p>
              </div>

              <div className="space-y-2 rounded-xl bg-slate-50/70 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Sender</span>
                  <span className="font-medium text-slate-700">{notification.senderName ?? notification.senderEmail ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Receiver</span>
                  <span className="font-medium text-slate-700">{notification.receiverName ?? notification.receiverEmail ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created</span>
                  <span className="font-medium text-slate-700">{formatDateTime(notification.createdAt)}</span>
                </div>
              </div>

              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Message</h3>
                <p className="whitespace-pre-wrap rounded-xl bg-slate-50/70 p-3 text-sm text-slate-600">{notification.message}</p>
              </div>

              {!notification.read && (
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  disabled={actionLoading}
                  onClick={() => onMarkRead(notification)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  <FiCheck size={15} /> {actionLoading ? "Marking..." : "Mark as Read"}
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}