import React from "react";
import { Eye, Pencil, Trash2, Inbox } from "lucide-react";

const riskClasses = {
  LOW: "bg-[#E5FAF3] text-[#00A874]",
  MEDIUM: "bg-orange-50 text-orange-700",
  HIGH: "bg-red-50 text-red-600",
  CRITICAL: "bg-red-100 text-red-700",
};

const statusClasses = {
  DRAFT: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-50 text-blue-700",
  REVIEWED: "bg-purple-50 text-purple-700",
  APPROVED: "bg-[#E5FAF3] text-[#00A874]",
  REJECTED: "bg-red-50 text-red-600",
};

const RiskBadge = ({ value }) => (
  <span
    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
      riskClasses[value] || "bg-gray-100 text-gray-600"
    }`}
  >
    {value || "—"}
  </span>
);

const StatusBadge = ({ value }) => (
  <span
    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
      statusClasses[value] || "bg-gray-100 text-gray-600"
    }`}
  >
    {value ? value.replaceAll("_", " ") : "—"}
  </span>
);

const FindingTable = ({
  findings,
  loading,
  onView,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-14 border-b border-gray-100 animate-pulse bg-gray-50"
          />
        ))}
      </div>
    );
  }

  if (!findings?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl py-16 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
          <Inbox size={24} />
        </div>

        <h3 className="text-base font-bold text-[#101A33]">
          No findings yet
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Findings created during audits will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">

              <th className="text-left text-xs font-bold uppercase tracking-wide text-gray-500 px-4 py-3.5">
                Finding
              </th>

              <th className="text-left text-xs font-bold uppercase tracking-wide text-gray-500 px-4 py-3.5">
                Audit
              </th>

              <th className="text-left text-xs font-bold uppercase tracking-wide text-gray-500 px-4 py-3.5">
                Risk Level
              </th>

              <th className="text-left text-xs font-bold uppercase tracking-wide text-gray-500 px-4 py-3.5">
                Status
              </th>

              <th className="text-right text-xs font-bold uppercase tracking-wide text-gray-500 px-4 py-3.5">
                Action
              </th>

            </tr>
          </thead>

          <tbody>

            {findings.map((finding) => (
              <tr
                key={finding.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >

                <td className="px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-[#101A33]">
                      {finding.title}
                    </p>

                    <p className="text-xs text-gray-500 mt-1 max-w-md truncate">
                      {finding.observation || "—"}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-[#101A33]">
                    {finding.auditId || "—"}
                  </p>

                  {finding.auditName && (
                    <p className="text-xs text-gray-500 mt-1">
                      {finding.auditName}
                    </p>
                  )}
                </td>

                <td className="px-4 py-4">
                  <RiskBadge value={finding.riskLevel} />
                </td>

                <td className="px-4 py-4">
                  <StatusBadge value={finding.status} />
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2">

                    <button
                      type="button"
                      onClick={() => onView(finding)}
                      title="View"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#101A33] transition"
                    >
                      <Eye size={16} />
                    </button>

                    {finding.status === "DRAFT" && (
                      <button
                        type="button"
                        onClick={() => onEdit(finding)}
                        title="Edit"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#00A874] hover:bg-[#E5FAF3] transition"
                      >
                        <Pencil size={16} />
                      </button>
                    )}

                    {finding.status === "DRAFT" && (
                      <button
                        type="button"
                        onClick={() => onDelete(finding.id)}
                        title="Delete"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                  </div>
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>
    </div>
  );
};

export default FindingTable;