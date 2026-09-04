import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiEye, FiEdit2, FiTrash2, FiFileText, FiFile, FiSave, FiInbox, FiLoader } from "react-icons/fi";
import ReportStatusBadge from "./ReportStatusBadge";
import { formatDate, readableEnum } from "../../../constants/reportEnums";

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: Math.min(i * 0.03, 0.3), duration: 0.25 } })
};

const PAGE_SIZE = 8;

function TableSkeleton() {
  return (
    <div className="space-y-2 rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur-xl">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-11 animate-pulse rounded-lg bg-slate-100" style={{ animationDelay: `${i * 60}ms` }} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 py-16 backdrop-blur-xl">
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} className="mb-3 rounded-full bg-slate-100 p-4">
        <FiInbox className="text-slate-400" size={28} />
      </motion.div>
      <p className="text-sm font-medium text-slate-500">No reports found</p>
      <p className="text-xs text-slate-400">Try adjusting your filters or create a new report.</p>
    </div>
  );
}

export default function ReportTable({ reports, loading, onView, onEdit, onDelete, onDownloadPdf, onDownloadWord, onSavePdf, onSaveWord, actioningId }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(reports.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageData = useMemo(() => reports.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [reports, safePage]);

  if (loading) return <TableSkeleton />;
  if (reports.length === 0) return <EmptyState />;

  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
            <tr>
              {["Report ID", "Title", "Type", "Related Risk", "Related KRI", "Related Mitigation", "Status", "Created By", "Created", "Updated"].map((h) => (
                <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {pageData.map((r, i) => {
                const isBusy = actioningId === r.id;
                return (
                  <motion.tr key={r.id} custom={i} variants={rowVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} layout className="border-t border-slate-100 hover:bg-indigo-50/40">
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{r.reportId}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{r.reportTitle}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{readableEnum(r.reportType)}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{r.riskCode ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{r.kriCode ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{r.mitigationCode ?? "—"}</td>
                    <td className="px-4 py-3"><ReportStatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-sm text-slate-500">{r.generatedByName ?? "—"}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(r.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {isBusy ? (
                          <FiLoader className="animate-spin text-indigo-500" size={16} />
                        ) : (
                          <>
                            <button onClick={() => onView(r)} title="View" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"><FiEye size={15} /></button>
                            <button onClick={() => onEdit(r)} title="Edit" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"><FiEdit2 size={15} /></button>
                            <button onClick={() => onDownloadPdf(r)} title="Download PDF" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"><FiFileText size={15} /></button>
                            <button onClick={() => onDownloadWord(r)} title="Download Word" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"><FiFile size={15} /></button>
                            <button onClick={() => onSavePdf(r)} title="Save PDF" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600"><FiSave size={15} /></button>
                            <button onClick={() => onDelete(r)} title="Delete" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600"><FiTrash2 size={15} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
        <span>Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, reports.length)} of {reports.length}</span>
        <div className="flex gap-1">
          <button disabled={safePage === 1} onClick={() => setPage(safePage - 1)} className="rounded-lg px-3 py-1 hover:bg-slate-100 disabled:opacity-30">Prev</button>
          <button disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)} className="rounded-lg px-3 py-1 hover:bg-slate-100 disabled:opacity-30">Next</button>
        </div>
      </div>
    </div>
  );
}