import { motion } from "framer-motion";
import { ClipboardList, Eye } from "lucide-react";

const getAuditId = (audit) =>
  audit?.auditId ??
  audit?.id ??
  audit?.audit?.auditId ??
  audit?.audit?.id ??
  "—";

const getAuditTitle = (audit) =>
  audit?.auditName ??
  audit?.auditTitle ??
  audit?.title ??
  audit?.audit?.auditName ??
  audit?.audit?.auditTitle ??
  audit?.audit?.title ??
  "—";

const getAuditType = (audit) =>
  audit?.processName ??
  audit?.auditType ??
  audit?.type ??
  audit?.audit?.processName ??
  "—";

const getAuditor = (audit) =>
  audit?.internalAuditorName ??
  audit?.auditorName ??
  audit?.internalAuditor?.name ??
  audit?.auditor?.name ??
  "—";

const getStatus = (audit) =>
  audit?.status ??
  audit?.auditStatus ??
  audit?.audit?.status ??
  "—";

const getDueDate = (audit) =>
  audit?.endDate ??
  audit?.dueDate ??
  audit?.auditEndDate ??
  audit?.audit?.endDate ??
  audit?.audit?.dueDate ??
  null;

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusStyle = (status) => {
  switch (String(status).toUpperCase()) {
    case "COMPLETED":
    case "CLOSED":
      return "bg-green-50 text-green-700";

    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700";

    case "PLANNED":
      return "bg-slate-100 text-slate-600";

    case "CANCELLED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
};

const RecentAudits = ({ audits = [], onView }) => {
  const recentAudits = Array.isArray(audits)
    ? audits.slice(0, 5)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden"
    >
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <ClipboardList
              size={20}
              className="text-teal-600"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Recent Audits
            </h2>

            <p className="text-xs text-slate-400 mt-0.5">
              Your recently assigned audits
            </p>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="text-left border-b border-slate-100">
              <th className="px-6 py-3 text-xs font-medium text-slate-400">
                Audit ID
              </th>

              <th className="px-6 py-3 text-xs font-medium text-slate-400">
                Title
              </th>

              <th className="px-6 py-3 text-xs font-medium text-slate-400">
                Type
              </th>

              <th className="px-6 py-3 text-xs font-medium text-slate-400">
                Auditor
              </th>

              <th className="px-6 py-3 text-xs font-medium text-slate-400">
                Status
              </th>

              <th className="px-6 py-3 text-xs font-medium text-slate-400">
                Due Date
              </th>

              <th className="px-6 py-3 text-xs font-medium text-slate-400 text-right">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {recentAudits.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center"
                >
                  <p className="text-sm text-slate-500">
                    No audits assigned yet
                  </p>
                </td>
              </tr>
            ) : (
              recentAudits.map((audit, index) => {
                const auditId = getAuditId(audit);
                const title = getAuditTitle(audit);
                const type = getAuditType(audit);
                const auditor = getAuditor(audit);
                const status = getStatus(audit);
                const dueDate = getDueDate(audit);

                return (
                  <motion.tr
                    key={audit?.id ?? auditId ?? index}
                    initial={{
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
                  >
                    {/* AUDIT ID */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-800">
                        {auditId}
                      </span>
                    </td>

                    {/* TITLE */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800">
                          {title}
                        </p>

                        {audit?.riskTitle && (
                          <p className="text-xs text-slate-400 mt-1 max-w-[220px] truncate">
                            Risk: {audit.riskTitle}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* TYPE */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {type}
                      </span>
                    </td>

                    {/* AUDITOR */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {auditor}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                          status
                        )}`}
                      >
                        {String(status)
                          .replaceAll("_", " ")
                          .replace(/\b\w/g, (char) =>
                            char.toUpperCase()
                          )}
                      </span>
                    </td>

                    {/* DUE DATE */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {formatDate(dueDate)}
                      </span>
                    </td>

                    {/* VIEW */}
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onView?.(audit)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default RecentAudits;