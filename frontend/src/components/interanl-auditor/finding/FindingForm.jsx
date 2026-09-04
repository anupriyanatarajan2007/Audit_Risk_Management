import React, { useEffect, useState } from "react";
import { X, Save, Send } from "lucide-react";

const INITIAL_FORM = {
  auditId: "",
  title: "",
  observation: "",
  riskLevel: "",
  recommendation: "",
  status: "DRAFT",
};

const FindingForm = ({
  initialData,
  audits = [],
  onClose,
  onSave,
  saving,
}) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        auditId: initialData.auditId || "",
        title: initialData.title || "",
        observation: initialData.observation || "",
        riskLevel: initialData.riskLevel || "",
        recommendation: initialData.recommendation || "",
        status: initialData.status || "DRAFT",
      });
    } else {
      setForm(INITIAL_FORM);
    }

    setErrors({});
  }, [initialData]);

  // ============================================================
  // HANDLE CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ============================================================
  // VALIDATION
  // ============================================================

  const validate = () => {
    const newErrors = {};

    if (!form.auditId) {
      newErrors.auditId = "Please select an audit";
    }

    if (!form.title.trim()) {
      newErrors.title = "Finding title is required";
    }

    if (!form.observation.trim()) {
      newErrors.observation = "Observation is required";
    }

    if (!form.riskLevel) {
      newErrors.riskLevel = "Risk level is required";
    }

    if (!form.recommendation.trim()) {
      newErrors.recommendation =
        "Recommendation is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = (status) => {
    if (!validate()) {
      return;
    }

    onSave({
      ...form,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">

          <div>
            <h2 className="text-lg font-bold text-[#101A33]">
              {initialData
                ? "Edit Finding"
                : "Create Finding"}
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Record an audit finding and its recommended action.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>

        </div>

        {/* ======================================================
            BODY
        ====================================================== */}

        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* ====================================================
              AUDIT
          ==================================================== */}

          <div className="mb-5">

            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
              Audit
            </label>

            <select
              name="auditId"
              value={form.auditId}
              onChange={handleChange}
              disabled={!!initialData || saving}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white transition ${
                errors.auditId
                  ? "border-red-400"
                  : "border-gray-200 focus:border-[#00C98B] focus:ring-2 focus:ring-[#E5FAF3]"
              } ${
                initialData
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
            >

              <option value="">
                Select assigned audit
              </option>

              {audits.map((audit) => (
                <option
                  key={audit.id}
                  value={audit.auditId}
                >
                  {audit.auditId}
                  {audit.auditName
                    ? ` - ${audit.auditName}`
                    : ""}
                </option>
              ))}

            </select>

            {audits.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                No audits are assigned to you.
              </p>
            )}

            {errors.auditId && (
              <p className="text-xs text-red-500 mt-1">
                {errors.auditId}
              </p>
            )}

          </div>

          {/* ====================================================
              TITLE
          ==================================================== */}

          <div className="mb-5">

            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
              Finding Title
            </label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              disabled={saving}
              placeholder="Example: Inadequate Access Review"
              className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none transition ${
                errors.title
                  ? "border-red-400"
                  : "border-gray-200 focus:border-[#00C98B] focus:ring-2 focus:ring-[#E5FAF3]"
              }`}
            />

            {errors.title && (
              <p className="text-xs text-red-500 mt-1">
                {errors.title}
              </p>
            )}

          </div>

          {/* ====================================================
              OBSERVATION
          ==================================================== */}

          <div className="mb-5">

            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
              Observation
            </label>

            <textarea
              name="observation"
              value={form.observation}
              onChange={handleChange}
              disabled={saving}
              rows={5}
              placeholder="Describe what was observed during the audit..."
              className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none transition ${
                errors.observation
                  ? "border-red-400"
                  : "border-gray-200 focus:border-[#00C98B] focus:ring-2 focus:ring-[#E5FAF3]"
              }`}
            />

            {errors.observation && (
              <p className="text-xs text-red-500 mt-1">
                {errors.observation}
              </p>
            )}

          </div>

          {/* ====================================================
              RISK LEVEL
          ==================================================== */}

          <div className="mb-5">

            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
              Risk Level
            </label>

            <select
              name="riskLevel"
              value={form.riskLevel}
              onChange={handleChange}
              disabled={saving}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none bg-white transition ${
                errors.riskLevel
                  ? "border-red-400"
                  : "border-gray-200 focus:border-[#00C98B] focus:ring-2 focus:ring-[#E5FAF3]"
              }`}
            >

              <option value="">
                Select risk level
              </option>

              <option value="LOW">
                Low
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="HIGH">
                High
              </option>

              <option value="CRITICAL">
                Critical
              </option>

            </select>

            {errors.riskLevel && (
              <p className="text-xs text-red-500 mt-1">
                {errors.riskLevel}
              </p>
            )}

          </div>

          {/* ====================================================
              RECOMMENDATION
          ==================================================== */}

          <div className="mb-5">

            <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
              Recommendation
            </label>

            <textarea
              name="recommendation"
              value={form.recommendation}
              onChange={handleChange}
              disabled={saving}
              rows={5}
              placeholder="Describe the recommended corrective action..."
              className={`w-full border rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none transition ${
                errors.recommendation
                  ? "border-red-400"
                  : "border-gray-200 focus:border-[#00C98B] focus:ring-2 focus:ring-[#E5FAF3]"
              }`}
            />

            {errors.recommendation && (
              <p className="text-xs text-red-500 mt-1">
                {errors.recommendation}
              </p>
            )}

          </div>

        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-gray-200">

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit("DRAFT")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-[#101A33] text-sm font-semibold hover:bg-gray-100 transition"
          >
            <Save size={15} />
            Save Draft
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit("SUBMITTED")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00C98B] hover:bg-[#00A874] text-white text-sm font-semibold transition active:scale-95"
          >
            <Send size={15} />
            Submit Finding
          </button>

        </div>

      </div>

    </div>
  );
};

export default FindingForm;