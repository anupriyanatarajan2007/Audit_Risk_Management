// src/components/dashboard/NotificationPanel.jsx
import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiBell, FiCheck } from "react-icons/fi";
import NotificationService from "../../../service/NotificationService";

function NotificationPanel({ notifications = [], onMarkRead }) {
  const [busyId, setBusyId] = useState(null);

  const markRead = async (id) => {
    setBusyId(id);
    try {
      await NotificationService.markAsRead(id);
      onMarkRead?.(id);
    } catch (err) {
      console.error(err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-5">
        <FiBell className="text-slate-400" />
        <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {notifications.slice(0, 8).map((n, i) => (
            <motion.div
              key={n.id ?? i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-start gap-3 rounded-xl border p-3 ${
                n.read ? "border-slate-100 bg-slate-50/50" : "border-indigo-200 bg-indigo-50"
              }`}
            >
              {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 truncate">{n.title ?? n.message ?? "Notification"}</p>
                <p className="text-xs text-slate-400 mt-0.5">{n.createdAt ?? n.timestamp ?? ""}</p>
              </div>
              {!n.read && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  disabled={busyId === n.id}
                  onClick={() => markRead(n.id)}
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                >
                  <FiCheck size={14} />
                </motion.button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {notifications.length === 0 && <p className="text-sm text-slate-400">You're all caught up</p>}
      </div>
    </motion.div>
  );
}

export default memo(NotificationPanel);