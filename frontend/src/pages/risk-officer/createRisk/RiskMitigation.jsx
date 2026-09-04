import { useState } from "react";
import { useRiskCreation } from "../../../context/RiskCreationContext";
import RiskStepper from "../../../components/riskOfficer/RiskStepper";
import RiskService from "../../../service/RiskService";
import { Loader2 } from "lucide-react";

export default function RiskMitigation({
  onPrevious,
  onCancel,
  onSuccess,
}) {
  const { data, updateData, step } = useRiskCreation();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    updateData({
      [name]: value,
    });
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const canSubmit =
    Boolean(data.mitigationPlan?.trim()) &&
    Boolean(data.targetClosureDate) &&
    Boolean(data.departmentId);

  // =========================================================
  // SUBMIT RISK
  // =========================================================

  const handleSubmit = async () => {

    // -----------------------------------------
    // Validate Department
    // -----------------------------------------

    if (!data.departmentId) {
      setError("Please select a department.");
      return;
    }

    // -----------------------------------------
    // Final Payload
    // -----------------------------------------

    const payload = {
      title: data.title,
      description: data.description,

      // IMPORTANT:
      // Backend expects departmentId
      departmentId: Number(data.departmentId),

      businessUnit: data.businessUnit,
      processName: data.processName,

      remarks: data.remarks || "",

      category: data.category,

      likelihood: data.likelihood,
      impact: data.impact,

      existingControls: data.existingControls || "",
      mitigationPlan: data.mitigationPlan,
      targetClosureDate: data.targetClosureDate,

      // Optional
      assignedToId: data.assignedToId
        ? Number(data.assignedToId)
        : null,
    };

    // -----------------------------------------
    // Debug Payload
    // -----------------------------------------

    console.log("========================================");
    console.log("FINAL RISK PAYLOAD");
    console.log("========================================");

    console.log(
      JSON.stringify(payload, null, 2)
    );

    console.log(
      "Department ID:",
      payload.departmentId
    );

    console.log(
      "Department ID Type:",
      typeof payload.departmentId
    );

    console.log("========================================");

    // -----------------------------------------
    // Submit
    // -----------------------------------------

    setSubmitting(true);
    setError("");

    try {

      const createdRisk =
        await RiskService.createRisk(payload);

      console.log(
        "========== RISK CREATED =========="
      );

      console.log(
        JSON.stringify(
          createdRisk,
          null,
          2
        )
      );

      onSuccess(createdRisk);

    } catch (err) {

      console.error(
        "========== CREATE RISK ERROR =========="
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Response:",
        err.response?.data
      );

      console.error(
        "Payload:",
        payload
      );

      if (err.response?.data?.errors) {
        console.table(
          err.response.data.errors
        );
      }

      // -----------------------------------------
      // Error Message
      // -----------------------------------------

      let errorMessage =
        "Unable to create risk.";

      if (err.response?.status === 403) {
        errorMessage =
          "You are not authorized to create a risk.";
      } else if (
        err.response?.data?.message
      ) {
        errorMessage =
          err.response.data.message;
      } else if (
        err.response?.data?.errors
      ) {
        errorMessage =
          Object.values(
            err.response.data.errors
          ).join(", ");
      }

      setError(errorMessage);

    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="flex h-full flex-col">

      {/* =====================================================
          STEPPER
      ===================================================== */}

      <RiskStepper currentStep={step} />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="flex-1 overflow-y-auto px-8 pb-6">

        <h3 className="mb-1 text-lg font-bold text-slate-800">
          Risk Treatment & Mitigation
        </h3>

        <p className="mb-6 text-sm text-slate-500">
          Define the mitigation plan and assign an owner.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

          {/* =================================================
              TARGET CLOSURE DATE
          ================================================= */}

          <div>

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Target Closure Date
              <span className="text-red-500">
                {" "}*
              </span>
            </label>

            <input
              type="date"
              name="targetClosureDate"
              value={
                data.targetClosureDate || ""
              }
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            />

          </div>

          {/* =================================================
              MITIGATION PLAN
          ================================================= */}

          <div className="sm:col-span-2">

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Mitigation Plan
              <span className="text-red-500">
                {" "}*
              </span>
            </label>

            <textarea
              rows={4}
              name="mitigationPlan"
              value={
                data.mitigationPlan || ""
              }
              onChange={handleChange}
              placeholder="Describe mitigation plan"
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            />

          </div>

          {/* =================================================
              REMARKS
          ================================================= */}

          <div className="sm:col-span-2">

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Remarks
            </label>

            <textarea
              rows={3}
              name="remarks"
              value={
                data.remarks || ""
              }
              onChange={handleChange}
              placeholder="Additional remarks..."
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
            />

          </div>

          {/* =================================================
              SELECTED DEPARTMENT INFO
          ================================================= */}

          {data.departmentId && (
            <div className="sm:col-span-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">

              <p className="text-sm font-medium text-emerald-800">
                Department selected
              </p>

              <p className="mt-1 text-xs text-emerald-600">
                Department ID:{" "}
                {data.departmentId}
              </p>

            </div>
          )}

        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="flex items-center justify-between border-t border-slate-200 px-8 py-4">

        {/* Cancel */}

        <button
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-50"
        >
          Cancel
        </button>

        <div className="flex gap-3">

          {/* Previous */}

          <button
            onClick={onPrevious}
            disabled={submitting}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Previous
          </button>

          {/* Submit */}

          <button
            onClick={handleSubmit}
            disabled={
              !canSubmit ||
              submitting
            }
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >

            {submitting && (
              <Loader2
                size={16}
                className="animate-spin"
              />
            )}

            {submitting
              ? "Submitting..."
              : "Submit Risk"}

          </button>

        </div>

      </div>

    </div>
  );
}