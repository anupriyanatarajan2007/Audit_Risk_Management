import React from "react";

const STATUS_OPTIONS = ["ASSIGNED", "IN_PROGRESS", "AUDIT_PLANNED", "AUDIT_IN_PROGRESS", "COMPLETED"];
const LEVEL_OPTIONS = ["HIGH", "MEDIUM", "LOW"];

const selectClass =
  "border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-gray-800 bg-gray-50 outline-none focus:border-[#00C98B] transition";
const labelClass = "text-xs font-semibold uppercase tracking-wide text-gray-500";

const AssignedRiskFilters = ({ filters, onChange, options, onClear }) => {
  const handleChange = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-5 flex flex-wrap gap-4 animate-[expand_.2s_ease]">
      <div className="flex flex-col gap-1.5 min-w-[160px]">
        <label htmlFor="ar-level" className={labelClass}>Risk Level</label>
        <select id="ar-level" className={selectClass} value={filters.riskLevel} onChange={handleChange("riskLevel")}>
          <option value="">All levels</option>
          {LEVEL_OPTIONS.map((l) => <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1.5 min-w-[160px]">
        <label htmlFor="ar-category" className={labelClass}>Risk Category</label>
        <select id="ar-category" className={selectClass} value={filters.category} onChange={handleChange("category")}>
          <option value="">All categories</option>
          {options.categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1.5 min-w-[160px]">
        <label htmlFor="ar-department" className={labelClass}>Department</label>
        <select id="ar-department" className={selectClass} value={filters.department} onChange={handleChange("department")}>
          <option value="">All departments</option>
          {options.departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1.5 min-w-[160px]">
        <label htmlFor="ar-status" className={labelClass}>Status</label>
        <select id="ar-status" className={selectClass} value={filters.status} onChange={handleChange("status")}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}
        </select>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="self-end text-[#00A874] text-sm font-semibold hover:underline px-1 py-2"
      >
        Clear filters
      </button>
    </div>
  );
};

export default AssignedRiskFilters;