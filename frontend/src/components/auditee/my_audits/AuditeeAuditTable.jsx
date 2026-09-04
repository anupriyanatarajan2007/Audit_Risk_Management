import { motion } from "framer-motion";
import {
  Eye,
  FileText,
  ClipboardList,
  ClipboardX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import AuditeeAuditStatusBadge from "./AuditeeAuditStatusBadge";

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },

  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
    },
  },
};

// ============================================================
// SKELETON ROW
// ============================================================

const SkeletonRow = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    {Array.from({ length: 12 }).map((_, i) => (
      <td
        key={i}
        className="px-4 py-4"
      >
        <div className="h-3 bg-gray-200 rounded w-full max-w-[90px]" />
      </td>
    ))}

    <td className="px-4 py-4">
      <div className="h-7 w-20 bg-gray-200 rounded-lg" />
    </td>
  </tr>
);

// ============================================================
// FINDINGS CELL
// ============================================================

const FindingsCell = ({
  count,
  pending,
}) => {
  const findingCount = Number(count) || 0;
  const pendingCount = Number(pending) || 0;

  if (findingCount === 0) {
    return (
      <div className="flex flex-col">
        <span className="text-sm text-gray-400">
          0 Findings
        </span>

        <span className="text-[11px] text-gray-400 mt-0.5">
          No findings
        </span>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-700 font-medium">
        {findingCount}{" "}
        {findingCount === 1
          ? "Finding"
          : "Findings"}
      </p>

      {pendingCount > 0 && (
        <p className="text-xs text-orange-600 font-medium mt-0.5">
          {pendingCount} Pending
        </p>
      )}
    </div>
  );
};

// ============================================================
// EVIDENCE CELL
// ============================================================

const EvidenceCell = ({
  count,
  pending,
}) => {
  const evidenceCount = Number(count) || 0;
  const pendingCount = Number(pending) || 0;

  if (evidenceCount === 0) {
    return (
      <div className="flex flex-col">
        <span className="text-sm text-gray-400">
          0 Evidence
        </span>

        <span className="text-[11px] text-gray-400 mt-0.5">
          No evidence
        </span>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-700 font-medium">
        {evidenceCount}{" "}
        {evidenceCount === 1
          ? "Evidence"
          : "Evidence Files"}
      </p>

      {pendingCount > 0 && (
        <p className="text-xs text-orange-600 font-medium mt-0.5">
          {pendingCount} Pending
        </p>
      )}
    </div>
  );
};

// ============================================================
// COMPONENT
// ============================================================

const AuditeeAuditTable = ({
  audits,
  loading,
  error,
  onRetry,
  onView,
  onViewEvidence,
  onViewFindings,
  pagination,
  onPageChange,
}) => {
  const columns = [
    "Audit ID",
    "Audit Title",
    "Department",
    "Process",
    "Audit Type",
    "Auditor",
    "Start Date",
    "Due Date",
    "Status",
    "Findings",
    "Evidence",
  ];

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-center">

        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <ClipboardX className="w-7 h-7 text-red-500" />
        </div>

        <h3 className="text-base font-semibold text-gray-900">
          Unable to load audits
        </h3>

        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          Something went wrong while fetching your audits.
        </p>

        <button
          onClick={onRetry}
          className="mt-5 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // ============================================================
  // EMPTY
  // ============================================================

  if (!loading && audits.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-center">

        <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mb-4">
          <ClipboardX className="w-7 h-7 text-teal-600" />
        </div>

        <h3 className="text-base font-semibold text-gray-900">
          No Audits Found
        </h3>

        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          Currently, there are no audits associated with your account.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ======================================================
          DESKTOP TABLE
      ====================================================== */}

      <div className="hidden md:block overflow-x-auto">

        <table className="w-full text-left border-collapse min-w-[1450px]">

          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">

              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}

              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap">
                Action
              </th>

            </tr>
          </thead>

          <tbody>

            {loading ? (

              Array.from({
                length: 6,
              }).map((_, i) => (
                <SkeletonRow key={i} />
              ))

            ) : (

              audits.map((audit, idx) => (

                <motion.tr
                  key={
                    audit.id ??
                    audit.auditId
                  }
                  variants={rowVariants}
                  initial="hidden"
                  animate="show"
                  transition={{
                    delay: idx * 0.03,
                  }}
                  className="border-b border-gray-50 hover:bg-teal-50/30 transition-colors"
                >

                  {/* Audit ID */}

                  <td className="px-4 py-4 text-sm font-medium text-teal-700 whitespace-nowrap">
                    {audit.auditId}
                  </td>

                  {/* Audit Title */}

                  <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap max-w-[200px] truncate">
                    {audit.auditTitle}
                  </td>

                  {/* Department */}

                  <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {audit.department}
                  </td>

                  {/* Process */}

                  <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {audit.processName}
                  </td>

                  {/* Audit Type */}

                  <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {audit.auditType}
                  </td>

                  {/* Auditor */}

                  <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {audit.auditorName}
                  </td>

                  {/* Start Date */}

                  <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {audit.startDate}
                  </td>

                  {/* Due Date */}

                  <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {audit.dueDate}
                  </td>

                  {/* Status */}

                  <td className="px-4 py-4 whitespace-nowrap">
                    <AuditeeAuditStatusBadge
                      status={audit.status}
                    />
                  </td>

                  {/* Findings */}

                  <td className="px-4 py-4 whitespace-nowrap">

                    <FindingsCell
                      count={
                        audit.findingsCount
                      }
                      pending={
                        audit.pendingFindingsCount
                      }
                    />

                  </td>

                  {/* Evidence */}

                  <td className="px-4 py-4 whitespace-nowrap">

                    <EvidenceCell
                      count={
                        audit.evidenceCount
                      }
                      pending={
                        audit.pendingEvidenceCount
                      }
                    />

                  </td>

                  {/* Actions */}

                  <td className="px-4 py-4 whitespace-nowrap">

                    <div className="flex items-center gap-2">

                      {/* View Audit */}

                      <button
                        onClick={() =>
                          onView?.(audit)
                        }
                        title="View Audit"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-medium hover:bg-teal-600 hover:text-white transition"
                      >
                        <Eye className="w-3.5 h-3.5" />

                        View
                      </button>

                      {/* View Findings */}

                      <button
                        onClick={() =>
                          onViewFindings?.(
                            audit
                          )
                        }
                        title="View Findings"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium hover:bg-orange-500 hover:text-white transition"
                      >
                        <ClipboardList className="w-3.5 h-3.5" />

                        Findings
                      </button>

                      {/* View Evidence */}

                      <button
                        onClick={() =>
                          onViewEvidence?.(
                            audit
                          )
                        }
                        title="View Evidence"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-500 hover:text-white transition"
                      >
                        <FileText className="w-3.5 h-3.5" />

                        Evidence
                      </button>

                    </div>

                  </td>

                </motion.tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* ======================================================
          MOBILE CARDS
      ====================================================== */}

      <div className="md:hidden divide-y divide-gray-100">

        {loading ? (

          Array.from({
            length: 4,
          }).map((_, i) => (

            <div
              key={i}
              className="p-4 animate-pulse space-y-2"
            >
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>

          ))

        ) : (

          audits.map((audit) => (

            <motion.div
              key={
                audit.id ??
                audit.auditId
              }
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="p-4 space-y-3"
            >

              {/* Header */}

              <div className="flex items-center justify-between">

                <span className="text-sm font-semibold text-teal-700">
                  {audit.auditId}
                </span>

                <AuditeeAuditStatusBadge
                  status={
                    audit.status
                  }
                />

              </div>

              {/* Title */}

              <p className="text-sm font-medium text-gray-900">
                {audit.auditTitle}
              </p>

              {/* Details */}

              <div className="grid grid-cols-2 gap-y-1 text-xs text-gray-500">

                <span>
                  {audit.department}
                </span>

                <span className="text-right">
                  {audit.processName}
                </span>

                <span>
                  {audit.startDate}
                </span>

                <span className="text-right">
                  {audit.dueDate}
                </span>

              </div>

              {/* Findings + Evidence */}

              <div className="grid grid-cols-2 gap-3 pt-2">

                <div className="rounded-xl bg-orange-50 p-3">

                  <p className="text-[11px] font-medium text-orange-600 uppercase">
                    Findings
                  </p>

                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {Number(
                      audit.findingsCount
                    ) || 0}
                  </p>

                  {Number(
                    audit.pendingFindingsCount
                  ) > 0 && (

                    <p className="text-[11px] text-orange-600 mt-0.5">
                      {
                        audit.pendingFindingsCount
                      }{" "}
                      pending
                    </p>

                  )}

                </div>

                <div className="rounded-xl bg-blue-50 p-3">

                  <p className="text-[11px] font-medium text-blue-600 uppercase">
                    Evidence
                  </p>

                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {Number(
                      audit.evidenceCount
                    ) || 0}
                  </p>

                  {Number(
                    audit.pendingEvidenceCount
                  ) > 0 && (

                    <p className="text-[11px] text-blue-600 mt-0.5">
                      {
                        audit.pendingEvidenceCount
                      }{" "}
                      pending
                    </p>

                  )}

                </div>

              </div>

              {/* Mobile Actions */}

              <div className="flex flex-wrap items-center gap-2 pt-1">

                {/* View */}

                <button
                  onClick={() =>
                    onView?.(audit)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 text-xs font-medium hover:bg-teal-600 hover:text-white transition"
                >
                  <Eye className="w-3.5 h-3.5" />

                  View
                </button>

                {/* Findings */}

                <button
                  onClick={() =>
                    onViewFindings?.(
                      audit
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 text-xs font-medium hover:bg-orange-500 hover:text-white transition"
                >
                  <ClipboardList className="w-3.5 h-3.5" />

                  Findings
                </button>

                {/* Evidence */}

                <button
                  onClick={() =>
                    onViewEvidence?.(
                      audit
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-500 hover:text-white transition"
                >
                  <FileText className="w-3.5 h-3.5" />

                  Evidence
                </button>

              </div>

            </motion.div>

          ))

        )}

      </div>

      {/* ======================================================
          PAGINATION
      ====================================================== */}

      {!loading &&
        audits.length > 0 &&
        pagination && (

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-gray-100">

            <p className="text-xs text-gray-500">
              Showing{" "}
              {pagination.startItem}
              –
              {pagination.endItem}{" "}
              of{" "}
              {pagination.totalItems}{" "}
              audits
            </p>

            <div className="flex items-center gap-1.5">

              {/* Previous */}

              <button
                onClick={() =>
                  onPageChange(
                    pagination.currentPage -
                      1
                  )
                }
                disabled={
                  pagination.currentPage ===
                  1
                }
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />

                Previous
              </button>

              {/* Pages */}

              {Array.from({
                length:
                  pagination.totalPages,
              }).map((_, i) => {

                const page =
                  i + 1;

                return (

                  <button
                    key={page}
                    onClick={() =>
                      onPageChange(
                        page
                      )
                    }
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                      pagination.currentPage ===
                      page
                        ? "bg-teal-600 text-white"
                        : "text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {page}
                  </button>

                );

              })}

              {/* Next */}

              <button
                onClick={() =>
                  onPageChange(
                    pagination.currentPage +
                      1
                  )
                }
                disabled={
                  pagination.currentPage ===
                  pagination.totalPages
                }
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next

                <ChevronRight className="w-3.5 h-3.5" />
              </button>

            </div>

          </div>

        )}

    </div>
  );
};

export default AuditeeAuditTable;
