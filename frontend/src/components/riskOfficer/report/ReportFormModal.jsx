import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { REPORT_TYPE, REPORT_STATUS } from "../../../constants/ReportEnums";
import ReportService from "../../../service/ReportService"; // ← was missing, causes ReferenceError on submit

const emptyForm = {
  reportTitle: "", description: "", reportType: "", status: "DRAFT",
  riskId: "", kriId: "", mitigationId: "", remarks: ""
};

const REQUIRED = ["reportTitle", "reportType"];

function Field({ label, name, required, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
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

export default function ReportFormModal({ isOpen, onClose, editingReport, onSaved, risks = [], kris = [], mitigations = [] }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const submittedOnce = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    submittedOnce.current = false;
    setErrors({});
    if (editingReport) {
      setForm({
        reportTitle: editingReport.reportTitle ?? "",
        description: editingReport.description ?? "",
        reportType: editingReport.reportType ?? "",
        status: editingReport.status ?? "DRAFT",
        riskId: editingReport.riskId ?? "",
        kriId: editingReport.kriId ?? "",
        mitigationId: editingReport.mitigationId ?? "",
        remarks: editingReport.remarks ?? ""
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingReport, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (submittedOnce.current) {
      setErrors((prev) => {
        const next = { ...prev };
        if (REQUIRED.includes(name) && !value.trim()) next[name] = "Required";
        else delete next[name];
        return next;
      });
    }
  };

  const validateAll = () => {
    const next = {};
    REQUIRED.forEach((f) => {
      if (!String(form[f] ?? "").trim()) next[f] = "Required";
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const toIdOrNull = (v) => (v === "" ? null : Number(v));

  const handleSubmit = async () => {
    submittedOnce.current = true;
    if (!validateAll()) {
      toast.error("Please fill all required fields");
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        reportTitle: form.reportTitle.trim(),
        description: form.description || null,
        reportType: form.reportType,
        status: form.status,
        riskId: toIdOrNull(form.riskId),
        kriId: toIdOrNull(form.kriId),
        mitigationId: toIdOrNull(form.mitigationId)
      };
      if (editingReport?.id) {
        await ReportService.updateReport(editingReport.id, payload);
        toast.success("Report updated successfully");
      } else {
        await ReportService.createReport(payload);
        toast.success("Report created successfully");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save report");
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
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingReport ? "Edit Report" : "Create New Report"}
              </h2>
              <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <FiX size={18} />
              </button>
            </div>

            {/* ← Restored the missing grid wrapper — fields were stacking in one column without it */}
            <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Report Title" name="reportTitle" required error={errors.reportTitle}>
                  <input name="reportTitle" value={form.reportTitle} onChange={handleChange} className={inputCls("reportTitle")} />
                </Field>
              </div>

              <Field label="Report Type" name="reportType" required error={errors.reportType}>
                <select name="reportType" value={form.reportType} onChange={handleChange} className={inputCls("reportType")}>
                  <option value="">Select</option>
                  {REPORT_TYPE.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>

              <Field label="Status" name="status" error={errors.status}>
                <select name="status" value={form.status} onChange={handleChange} className={inputCls("status")}>
                  {REPORT_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>

              <div className="sm:col-span-2">
                <Field label="Description" name="description" error={errors.description}>
                  <textarea
                    name="description"
                    rows={3}
                    value={form.description}
                    onChange={handleChange}
                    className={`${inputCls("description")} resize-none`}
                  />
                </Field>
              </div>

              {/* Fallback key chain: id → riskId → array index. Prevents the
                  "unique key" warning if the backend's primary-key field name
                  differs from what this list assumed. */}
              <Field label="Related Risk" name="riskId" error={errors.riskId}>
                <select name="riskId" value={form.riskId} onChange={handleChange} className={inputCls("riskId")}>
                  <option value="">Select Risk</option>
                  {risks.map((risk, idx) => (
                    <option key={risk.id ?? risk.riskId ?? idx} value={risk.id}>
                      {risk.riskId} - {risk.title}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Related KRI" name="kriId" error={errors.kriId}>
                <select name="kriId" value={form.kriId} onChange={handleChange} className={inputCls("kriId")}>
                  <option value="">Select KRI</option>
                  {kris.map((kri, idx) => (
                    <option key={kri.id ?? kri.kriId ?? idx} value={kri.id}>
                      {kri.kriId} - {kri.kriName}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Related Mitigation" name="mitigationId" error={errors.mitigationId}>
                <select name="mitigationId" value={form.mitigationId} onChange={handleChange} className={inputCls("mitigationId")}>
                  <option value="">Select Mitigation</option>
                  {mitigations.map((mitigation, idx) => (
                    <option key={mitigation.id ?? mitigation.mitigationId ?? idx} value={mitigation.id}>
                      {mitigation.mitigationId} - {mitigation.mitigationTitle}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="sm:col-span-2">
                <Field label="Remarks" name="remarks" error={errors.remarks}>
                  <input name="remarks" value={form.remarks} onChange={handleChange} className={inputCls("remarks")} />
                </Field>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
              <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100">
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleSubmit}
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : editingReport ? "Update Report" : "Create Report"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}