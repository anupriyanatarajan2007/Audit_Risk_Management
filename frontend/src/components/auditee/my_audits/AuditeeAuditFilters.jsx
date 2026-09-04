import { Search, RotateCcw } from "lucide-react";

const STATUS_OPTIONS = [
  "All Status",
  "Assigned",
  "Planned",
  "In Progress",
  "Findings Raised",
  "Response Pending",
  "Evidence Pending",
  "Under Review",
  "Completed",
  "Closed",
];

const TYPE_OPTIONS = [
  "All Types",
  "Internal Audit",
  "Process Audit",
  "Compliance Audit",
  "Risk-Based Audit",
  "Operational Audit",
];

const DATE_OPTIONS = ["All Dates", "This Month", "Last 3 Months", "This Year"];

// NOTE: kept as a top-level component (not defined inside the page)
// to avoid the input-focus-loss bug from remounting on every render.
const AuditeeAuditFilters = ({ filters, onChange, onReset }) => {
  const handleInput = (field) => (e) => {
    onChange({ ...filters, [field]: e.target.value });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={handleInput("search")}
            placeholder="Search audits..."
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition"
          />
        </div>

        <select
          value={filters.status}
          onChange={handleInput("status")}
          className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition lg:w-48"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={handleInput("type")}
          className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition lg:w-48"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <select
          value={filters.date}
          onChange={handleInput("date")}
          className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition lg:w-44"
        >
          {DATE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-teal-600 transition whitespace-nowrap"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default AuditeeAuditFilters;