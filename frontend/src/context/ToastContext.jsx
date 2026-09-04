// src/context/ToastContext.jsx
import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const VARIANTS = {
  success: { icon: CheckCircle2, cls: "bg-emerald-600" },
  error: { icon: XCircle, cls: "bg-rose-600" },
  info: { icon: Info, cls: "bg-slate-800" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, variant = "info") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const toast = {
    success: (msg) => push(msg, "success"),
    error: (msg) => push(msg, "error"),
    info: (msg) => push(msg, "info"),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const V = VARIANTS[t.variant];
            const Icon = V.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`${V.cls} text-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-sm`}
              >
                <Icon size={18} className="shrink-0" />
                <p className="text-sm font-medium leading-snug flex-1">{t.message}</p>
                <button
                  onClick={() => dismiss(t.id)}
                  className="opacity-70 hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
};