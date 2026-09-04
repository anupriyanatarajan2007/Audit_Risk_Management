import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import NotificationService from "../../../service/NotificationService";
import UserAutocomplete from "./UserAutocomplete";

const emptyForm = { receiverId: "", title: "", message: "" };

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 text-[11px] text-rose-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// currentUserEmail passed in from the page — sourced from your AuthContext.
export default function NotificationFormModal({ isOpen, onClose, onSent, users, currentUserEmail }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const submittedOnce = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm);
      setErrors({});
      submittedOnce.current = false;
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (submittedOnce.current) validateField(name, value);
  };

  const validateField = (name, value) => {
    setErrors((prev) => {
      const next = { ...prev };
      if (!String(value ?? "").trim()) next[name] = "Required";
      else delete next[name];
      return next;
    });
  };

  const validateAll = () => {
    const next = {};
    if (!form.receiverId) next.receiverId = "Select a recipient";
    if (!form.title.trim()) next.title = "Required";
    if (!form.message.trim()) next.message = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    submittedOnce.current = true;
    if (!validateAll()) {
      toast.error("Please fill all required fields");
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      await NotificationService.sendNotification({
        receiverId: form.receiverId,
        title: form.title.trim(),
        message: form.message.trim()
      });
      toast.success("Notification sent");
      onSent();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send notification");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (name) =>
    `w-full rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none transition focus:ring-2 ${
      errors[name]
        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
        : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
    }`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-lg overflow-visible rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-800">Send Notification</h2>
              <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <Field label="From">
                <input value={currentUserEmail || ""} disabled className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500" />
              </Field>

              <Field label="To" error={errors.receiverId}>
                <UserAutocomplete
                  users={users}
                  value={form.receiverId}
                  onSelect={(id) => {
                    setForm((f) => ({ ...f, receiverId: id }));
                    if (submittedOnce.current) validateField("receiverId", id);
                  }}
                  error={errors.receiverId}
                />
              </Field>

              <Field label="Title" error={errors.title}>
                <input name="title" value={form.title} onChange={handleChange} className={inputCls("title")} placeholder="Notification title" />
              </Field>

              <Field label="Message" error={errors.message}>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  className={`${inputCls("message")} resize-y`}
                  placeholder="Write your message..."
                />
              </Field>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100">
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleSubmit}
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? "Sending..." : "Send"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}