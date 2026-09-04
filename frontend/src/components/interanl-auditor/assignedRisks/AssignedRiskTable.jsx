import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Inbox, Eye } from "lucide-react";

const SORTABLE_COLUMNS = [
  { key: "riskLevel", label: "Risk Level" },
  { key: "riskScore", label: "Risk Score" },
  { key: "identifiedDate", label: "Identified Date" },
  { key: "targetClosureDate", label: "Target Closure Date" },
];

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const levelBadgeClass = {
  HIGH: "bg-red-50 text-red-500",
  MEDIUM: "bg-orange-50 text-orange-700",
  LOW: "bg-[#E5FAF3] text-[#00A874]",
};

const statusBadgeClass = {
  ASSIGNED: "bg-indigo-50 text-indigo-700",
  IN_PROGRESS: "bg-orange-50 text-orange-700",
  AUDIT_PLANNED: "bg-purple-50 text-purple-700",
  AUDIT_IN_PROGRESS: "bg-yellow-50 text-yellow-700",
  COMPLETED: "bg-[#E5FAF3] text-[#00A874]",
};

const LevelBadge = ({ level }) => {
  const normalized = (level || "").toUpperCase();
  if (!normalized) return <span>—</span>;
  return (
    <span className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-full tracking-wide ${levelBadgeClass[normalized] || "bg-gray-100 text-gray-600"}`}>
      {normalized}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  if (!status) return <span>—</span>;
  return (
    <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass[status] || "bg-gray-100 text-gray-600"}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
};

const SortIcon = ({ active, direction }) => {
  if (!active) return <ArrowUpDown size={13} className="inline ml-1 opacity-50" />;
  return direction === "asc"
    ? <ArrowUp size={13} className="inline ml-1 text-[#00A874]" />
    : <ArrowDown size={13} className="inline ml-1 text-[#00A874]" />;
};

const SkeletonRows = () => (
  <>
    {Array.from({ length: 6 }).map((_, i) => (
      <tr key={i}>
        {Array.from({ length: 10 }).map((__, j) => (
          <td key={j} className="px-4 py-4">
            <div
              className="h-3 rounded-md bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:400%_100%] animate-[shimmer_1.4s_ease_infinite]"
              style={{ width: j === 1 ? "80%" : "60%" }}
            />
          </td>
        ))}
      </tr>
    ))}
  </>
);

const th = "text-left text-xs font-bold uppercase tracking-wide text-gray-500 px-4 py-3.5 border-b border-gray-200 bg-gray-50 whitespace-nowrap";

const AssignedRiskTable = ({ risks, loading, sortConfig, onSort, onView }) => {
  const isEmpty = !loading && risks.length === 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6">
          <div className="w-14 h-14 rounded-2xl bg-[#E5FAF3] text-[#00A874] flex items-center justify-center mb-4">
            <Inbox size={26} />
          </div>
          <h3 className="text-base font-bold text-[#101A33] mb-1.5">No risks assigned yet</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Risks assigned to you by the Audit Manager will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1080px]">
            <thead>
              <tr>
                <th className={th}>Risk ID</th>
                <th className={th}>Risk Title</th>
                <th className={th}>Risk Category</th>
                <th className={th}>Department</th>
                {SORTABLE_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`${th} cursor-pointer select-none hover:text-[#00A874] ${sortConfig.key === col.key ? "text-[#00A874]" : ""}`}
                    onClick={() => onSort(col.key)}
                  >
                    {col.label}
                    <SortIcon active={sortConfig.key === col.key} direction={sortConfig.direction} />
                  </th>
                ))}
                <th className={th}>Status</th>
                <th className={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : (
                risks.map((risk) => (
                  <tr key={risk.riskId} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                    <td className="px-4 py-3.5 text-sm font-semibold text-[#101A33] whitespace-nowrap">{risk.riskId}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-800 max-w-[220px]">{risk.title}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">{risk.category || "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">{risk.department || "—"}</td>
                    <td className="px-4 py-3.5"><LevelBadge level={risk.riskLevel} /></td>
                    <td className="px-4 py-3.5 text-sm font-bold text-gray-800 tabular-nums">{risk.riskScore ?? "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">{formatDate(risk.identifiedDate)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">{formatDate(risk.targetClosureDate)}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={risk.status} /></td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => onView(risk.riskId)}
                        className="inline-flex items-center gap-1.5 border border-[#00C98B] text-[#00A874] text-xs font-semibold rounded-lg px-3.5 py-1.5 hover:bg-[#00C98B] hover:text-white active:scale-95 transition"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssignedRiskTable;