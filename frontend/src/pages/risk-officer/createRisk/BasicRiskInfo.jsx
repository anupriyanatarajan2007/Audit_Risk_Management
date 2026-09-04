import { useEffect, useState } from "react";
import { useRiskCreation } from "../../../context/RiskCreationContext";
import RiskStepper from "../../../components/riskOfficer/RiskStepper";
import { getAllDepartments } from "../../../service/departmentService";

export default function BasicRiskInfo({ onNext, onCancel }) {
  const { data, updateData, step } = useRiskCreation();

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departmentError, setDepartmentError] = useState("");

  // =========================================================
  // LOAD DEPARTMENTS
  // =========================================================

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);
        setDepartmentError("");

        const response = await getAllDepartments();

        console.log("========== DEPARTMENT RESPONSE ==========");
        console.log(response);
        console.log("=========================================");

        /*
         * Supports:
         *
         * 1. [ { id: 1, name: "Finance" } ]
         *
         * 2. { data: [ { id: 1, name: "Finance" } ] }
         *
         * 3. { data: { data: [...] } }
         */

        let departmentList = [];

        if (Array.isArray(response)) {
          departmentList = response;
        } else if (Array.isArray(response?.data)) {
          departmentList = response.data;
        } else if (Array.isArray(response?.data?.data)) {
          departmentList = response.data.data;
        }

        console.log("DEPARTMENT LIST:", departmentList);

        setDepartments(departmentList);
      } catch (error) {
        console.error("Failed to load departments:", error);

        console.error(
          "Department API response:",
          error.response?.data
        );

        setDepartments([]);

        setDepartmentError(
          error.response?.data?.message ||
            "Unable to load departments."
        );
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, []);

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    /*
     * Department ID must be stored separately.
     *
     * Browser select gives value as String.
     * Convert it to Number before storing.
     */

    if (name === "departmentId") {
      updateData({
        departmentId: value ? Number(value) : "",
      });

      console.log(
        "Selected Department ID:",
        value ? Number(value) : null
      );

      return;
    }

    updateData({
      [name]: value,
    });
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const canProceed =
    Boolean(data.title?.trim()) &&
    Boolean(data.departmentId) &&
    Boolean(data.description?.trim());

  // =========================================================
  // HANDLE NEXT
  // =========================================================

  const handleNext = () => {
    if (!canProceed) {
      return;
    }

    console.log("========== BASIC RISK DATA ==========");
    console.log("Title:", data.title);
    console.log("Description:", data.description);
    console.log("Department ID:", data.departmentId);
    console.log("Business Unit:", data.businessUnit);
    console.log("Process Name:", data.processName);
    console.log("=====================================");

    onNext();
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
          Basic Risk Information
        </h3>

        <p className="mb-6 text-sm text-slate-500">
          Identify the risk and where it originates from.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

          {/* =================================================
              RISK ID
          ================================================= */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Risk ID
            </label>

            <input
              type="text"
              value="Auto-generated on submit"
              disabled
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400"
            />
          </div>

          {/* =================================================
              TITLE
          ================================================= */}

          <div className="sm:col-span-2">

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Title{" "}
              <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              name="title"
              value={data.title || ""}
              onChange={handleChange}
              placeholder="Short, descriptive risk title"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

          </div>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div className="sm:col-span-2">

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description{" "}
              <span className="text-red-500">*</span>
            </label>

            <textarea
              name="description"
              value={data.description || ""}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the risk, its context, and potential trigger"
              className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

          </div>

          {/* =================================================
              DEPARTMENT
          ================================================= */}

          <div>

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Department{" "}
              <span className="text-red-500">*</span>
            </label>

            <select
              name="departmentId"
              value={data.departmentId || ""}
              onChange={handleChange}
              disabled={loadingDepartments}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            >

              {/* Default option */}

              <option value="">
                {loadingDepartments
                  ? "Loading departments..."
                  : "Select Department"}
              </option>

              {/* Department entities */}

              {departments.map((department) => (
                <option
                  key={department.id}
                  value={department.id}
                >
                  {department.name}
                </option>
              ))}

            </select>

            {/* API Error */}

            {departmentError && (
              <p className="mt-1.5 text-xs text-red-500">
                {departmentError}
              </p>
            )}

            {/* No Departments */}

            {!loadingDepartments &&
              !departmentError &&
              departments.length === 0 && (
                <p className="mt-1.5 text-xs text-slate-500">
                  No departments available.
                </p>
              )}

            {/* Selected Department ID */}

            {data.departmentId && (
              <p className="mt-1 text-xs text-emerald-600">
                Department ID: {data.departmentId}
              </p>
            )}

          </div>

          {/* =================================================
              BUSINESS UNIT
          ================================================= */}

          <div>

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Business Unit
            </label>

            <input
              type="text"
              name="businessUnit"
              value={data.businessUnit || ""}
              onChange={handleChange}
              placeholder="e.g. Retail Banking"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

          </div>

          {/* =================================================
              PROCESS NAME
          ================================================= */}

          <div className="sm:col-span-2">

            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Process Name
            </label>

            <input
              type="text"
              name="processName"
              value={data.processName || ""}
              onChange={handleChange}
              placeholder="e.g. Loan Disbursement Process"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />

          </div>

        </div>
      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="flex items-center justify-between border-t border-slate-200 px-8 py-4">

        {/* Cancel */}

        <button
          onClick={onCancel}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100"
        >
          Cancel
        </button>

        <div className="flex gap-3">

          {/* Previous */}

          <button
            disabled
            className="cursor-not-allowed rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-300"
          >
            Previous
          </button>

          {/* Next */}

          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Next
          </button>

        </div>
      </div>

    </div>
  );
}