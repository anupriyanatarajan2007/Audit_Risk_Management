import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ClipboardCheck, AlertCircle, Loader2 } from "lucide-react";

const backdropVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.15 } },
};

const emptyForm = {
  auditId: "",
  auditeeId: "",
  startDate: "",
  dueDate: "",
};

const AuditeeAssignmentModal = ({
  open,
  onClose,
  onSubmit,
  audits,
  auditees,
  submitting,
  apiError,
}) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setErrors({});
    }
  }, [open]);

  const auditOptions = useMemo(() => {
    const safeAudits = Array.isArray(audits)
      ? audits
      : Array.isArray(audits?.data)
      ? audits.data
      : [];

    return safeAudits.map((audit) => ({
      value: audit.id,
      label: `${audit.auditId} — ${audit.auditName}`,
    }));
  }, [audits]);

  const auditeeOptions = useMemo(
    () =>
      auditees.map((u) => ({
        value: u.id,
        label: `${u.employeeId} — ${u.profile?.firstName || u.name || ""} ${
          u.profile?.lastName || ""
        }`.trim(),
      })),
    [auditees]
  );

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.auditId) next.auditId = "Please select an audit.";
    if (!form.auditeeId) next.auditeeId = "Please select an auditee.";
    if (!form.startDate) next.startDate = "Start date is required.";
    if (!form.dueDate) next.dueDate = "Due date is required.";
    if (
      form.startDate &&
      form.dueDate &&
      new Date(form.dueDate) < new Date(form.startDate)
    ) {
      next.dueDate = "Due date cannot be before start date.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      auditId: Number(form.auditId),
      auditeeId: Number(form.auditeeId),
      startDate: form.startDate,
      dueDate: form.dueDate,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="modal"
              variants={modalVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="w-full max-w-md bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
                    <ClipboardCheck className="w-4.5 h-4.5 text-teal-600" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Assign Auditee
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4">
                {apiError && (
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{apiError}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                    Select Audit
                  </label>
                  <select
                    value={form.auditId}
                    onChange={handleChange("auditId")}
                    className={`w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 border ${
                      errors.auditId ? "border-red-400" : "border-gray-200"
                    } text-gray-900 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition`}
                  >
                    <option value="">Select an audit</option>
                    {auditOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.auditId && (
                    <p className="text-xs text-red-600 mt-1">{errors.auditId}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                    Select Auditee
                  </label>
                  <select
                    value={form.auditeeId}
                    onChange={handleChange("auditeeId")}
                    className={`w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 border ${
                      errors.auditeeId ? "border-red-400" : "border-gray-200"
                    } text-gray-900 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition`}
                  >
                    <option value="">Select an auditee</option>
                    {auditeeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.auditeeId && (
                    <p className="text-xs text-red-600 mt-1">{errors.auditeeId}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={handleChange("startDate")}
                      className={`w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 border ${
                        errors.startDate ? "border-red-400" : "border-gray-200"
                      } text-gray-900 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition`}
                    />
                    {errors.startDate && (
                      <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={handleChange("dueDate")}
                      className={`w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 border ${
                        errors.dueDate ? "border-red-400" : "border-gray-200"
                      } text-gray-900 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition`}
                    />
                    {errors.dueDate && (
                      <p className="text-xs text-red-600 mt-1">{errors.dueDate}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-100 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Assign Auditee
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuditeeAssignmentModal;