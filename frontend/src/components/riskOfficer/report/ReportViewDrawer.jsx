import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiDownload, FiSave, FiFileText, FiFile } from "react-icons/fi";
import ReportStatusBadge from "./ReportStatusBadge";
import { formatDate, readableEnum } from "../../../constants/reportEnums";

function Section({ title, rows }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      <div className="space-y-2 rounded-xl bg-slate-50/70 p-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-slate-400">{label}</span>
            <span className="max-w-[60%] text-right font-medium text-slate-700">{value ?? "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusTimeline({ status, createdAt, updatedAt }) {
  const steps = [
    { label: "Created", date: formatDate(createdAt), color: "bg-indigo-500" },
    { label: readableEnum(status), date: formatDate(updatedAt) || "Current", color: "bg-emerald-500" }
  ];
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Status Timeline</h3>
      <div className="relative pl-5">
        <div className="absolute left-[7px] top-1 bottom-1 w-px bg-slate-200" />
        {steps.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="relative mb-4 last:mb-0">
            <span className={`absolute -left-5 top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${s.color} shadow`} />
            <p className="text-sm font-medium text-slate-700">{s.label}</p>
            <p className="text-xs text-slate-400">{s.date}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function ReportViewDrawer({ report, onClose, onDownloadPdf, onDownloadWord, onSavePdf, onSaveWord, actionLoading }) {
  return (
    <AnimatePresence>
      {report && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">{report.reportTitle}</h2>
                <p className="text-xs text-slate-400">{report.reportId}</p>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-6 px-6 py-5">
              <ReportStatusBadge status={report.status} />

              <Section
                title="General Information"
                rows={[
                  ["Report Type", readableEnum(report.reportType)],
                  ["Description", report.description],
                  ["Created By", report.generatedByName],
                  ["Employee ID", report.generatedByEmployeeId]
                ]}
              />
              <Section title="Related Risk" rows={[["Risk Code", report.riskCode], ["Risk Title", report.riskTitle]]} />
              <Section title="Related KRI" rows={[["KRI Code", report.kriCode], ["KRI Name", report.kriName]]} />
              <Section title="Related Mitigation" rows={[["Mitigation Code", report.mitigationCode], ["Mitigation Title", report.mitigationTitle]]} />
              <Section title="Audit Information" rows={[["Created", formatDate(report.createdAt)], ["Last Updated", formatDate(report.updatedAt)]]} />

              <StatusTimeline status={report.status} createdAt={report.createdAt} updatedAt={report.updatedAt} />

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Document Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button disabled={actionLoading} onClick={() => onDownloadPdf(report)} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                    <FiFileText size={14} /> Download PDF
                  </button>
                  <button disabled={actionLoading} onClick={() => onDownloadWord(report)} className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">
                    <FiFile size={14} /> Download Word
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}