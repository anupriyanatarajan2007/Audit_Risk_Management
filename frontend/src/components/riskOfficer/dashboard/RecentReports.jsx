// src/components/dashboard/RecentReports.jsx
import { memo } from "react";
import { motion } from "framer-motion";
import { FiDownload, FiFileText } from "react-icons/fi";
import ReportGeneratorService from "../../../service/ReportGeneratorService";

const STATUS_STYLES = {
  DRAFT: "bg-slate-100 text-slate-600",
  SUBMITTED: "bg-indigo-100 text-indigo-600",
  APPROVED: "bg-emerald-100 text-emerald-600",
  REJECTED: "bg-rose-100 text-rose-600",
};

function StatusPill({ status }) {
  const key = String(status ?? "").toUpperCase();
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_STYLES[key] ?? "bg-slate-100 text-slate-600"}`}>
      {status ?? "Unknown"}
    </span>
  );
}

async function handleDownload(reportId) {
  try {
    const res = await ReportGeneratorService.downloadPdf(reportId);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `report-${reportId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error("Download failed", err);
  }
}

function RecentReports({ reports = [] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-slate-900">Recent Reports</h3>
        <FiFileText className="text-slate-400" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-200">
              <th className="pb-3 font-medium">Title</th>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.slice(0, 6).map((r, i) => (
              <motion.tr
                key={r.id ?? r.reportId ?? i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ backgroundColor: "rgba(15,23,42,0.02)" }}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="py-3 text-slate-700 truncate max-w-[160px]">{r.title ?? r.reportId ?? "Untitled"}</td>
                <td className="py-3 text-slate-500">{r.type ?? "—"}</td>
                <td className="py-3"><StatusPill status={r.status} /></td>
                <td className="py-3 text-right">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDownload(r.id ?? r.reportId)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                  >
                    <FiDownload size={14} />
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && <p className="py-6 text-center text-sm text-slate-400">No reports yet</p>}
      </div>
    </motion.div>
  );
}

export default memo(RecentReports);