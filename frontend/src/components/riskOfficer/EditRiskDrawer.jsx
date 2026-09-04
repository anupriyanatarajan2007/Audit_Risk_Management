// src/components/riskOfficer/EditRiskDrawer.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2 } from "lucide-react";
import RiskService from "../../service/RiskService";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import { CATEGORIES, DEPARTMENTS, LIKELIHOODS, IMPACTS } from "../../utils/riskEnums";

function validate(form) {
  const errors = {};
  if (!form.title?.trim()) errors.title = "Title is required";
  if (!form.description?.trim()) errors.description = "Description is required";
  if (!form.department) errors.department = "Department is required";
  return errors;
}

export default function EditRiskDrawer({ risk, open, onClose, onUpdated, onToast }) {
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (risk) setForm({ ...risk });
    setErrors({});
    setSuccess(false);
  }, [risk, open]);

  useEscapeKey(() => !saving && onClose(), open);

  const handleChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !saving) onClose();
  };

  const handleSave = async () => {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      onToast?.("Please fix the highlighted fields", "error");
      return;
    }

    setSaving(true);
    const previous = { ...risk };
    const merged = { ...risk, ...form };

    onUpdated(merged); // optimistic

    try {
      const result = await RiskService.updateRisk(risk.id, merged);
      const updated = result?.data ?? result ?? merged;
      onUpdated(updated?.id ? updated : merged);
      setSuccess(true);
      onToast?.("Risk updated successfully");
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      onUpdated(previous); // rollback
      console.error("Update failed:", err.response?.status, err.response?.data);
      onToast?.(err.response?.data?.message || "Failed to update risk", "error");
    } finally {
      setSaving(false);
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
            onClick={handleOverlayClick}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed right-0 top-0 z-[65] h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">Edit Risk</h2>
                <p className="text-xs text-slate-400">{risk?.riskId}</p>
              </div>
              <button
                onClick={() => !saving && onClose()}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Risk Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title ?? ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
                    errors.title ? "border-red-300" : "border-slate-300"
                  }`}
                />
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={form.description ?? ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
                    errors.description ? "border-red-300" : "border-slate-300"
                  }`}
                />
                {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.department ?? ""}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm ${errors.department ? "border-red-300" : "border-slate-300"}`}
                  >
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                  {errors.department && <p className="mt-1 text-xs text-red-500">{errors.department}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Business Unit</label>
                  <input
                    type="text"
                    value={form.businessUnit ?? ""}
                    onChange={(e) => handleChange("businessUnit", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
                  <select
                    value={form.category ?? ""}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                  >
                    <option value="">Select</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Likelihood</label>
                  <select
                    value={form.likelihood ?? ""}
                    onChange={(e) => handleChange("likelihood", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                  >
                    <option value="">Select</option>
                    {LIKELIHOODS.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Impact</label>
                  <select
                    value={form.impact ?? ""}
                    onChange={(e) => handleChange("impact", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                  >
                    <option value="">Select</option>
                    {IMPACTS.map((i) => (
                      <option key={i.value} value={i.value}>{i.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Existing Controls</label>
                <textarea
                  rows={3}
                  value={form.existingControls ?? ""}
                  onChange={(e) => handleChange("existingControls", e.target.value)}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Mitigation Plan</label>
                <textarea
                  rows={3}
                  value={form.mitigationPlan ?? ""}
                  onChange={(e) => handleChange("mitigationPlan", e.target.value)}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Target Closure Date</label>
                <input
                  type="date"
                  value={form.targetClosureDate ?? ""}
                  onChange={(e) => handleChange("targetClosureDate", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Remarks</label>
                <textarea
                  rows={2}
                  value={form.remarks ?? ""}
                  onChange={(e) => handleChange("remarks", e.target.value)}
                  className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-slate-200 bg-white px-6 py-4">
              <button
                onClick={() => !saving && onClose()}
                disabled={saving}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleSave}
                disabled={saving}
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.97 }}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-70"
              >
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                      <Check size={16} /> Saved
                    </motion.span>
                  ) : saving ? (
                    <motion.span key="loading" className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" /> Saving...
                    </motion.span>
                  ) : (
                    <motion.span key="idle">Save Changes</motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}