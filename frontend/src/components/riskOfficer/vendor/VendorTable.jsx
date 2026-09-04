import { motion, AnimatePresence } from "framer-motion";
import { FiRefreshCw as FiSyncStatus, FiInbox } from "react-icons/fi";
import { STATUS_META, RISK_META } from "../../../constants/vendorEnums";

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: Math.min(i * 0.04, 0.3), duration: 0.25 } })
};

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
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="mb-3 rounded-full bg-slate-100 p-4"
      >
        <FiInbox className="text-slate-400" size={28} />
      </motion.div>
      <p className="text-sm font-medium text-slate-500">No vendors found</p>
      <p className="text-xs text-slate-400">Try adjusting your search.</p>
    </div>
  );
}

export default function VendorTable({ vendors, loading, onUpdateStatus }) {
  if (loading) return <TableSkeleton />;
  if (vendors.length === 0) return <EmptyState />;

  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Vendor ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Vendor Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Contact Person</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Service Provided</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Risk Level</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence mode="popLayout">
              {vendors.map((v, i) => {
                const statusMeta = STATUS_META[v.vendorStatus] || STATUS_META.ACTIVE;
                const riskMeta = RISK_META[v.riskLevel] || RISK_META.LOW;
                const id = v.vendorId ?? v.id;
                return (
                  <motion.tr
                    key={id}
                    custom={i}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0 }}
                    layout
                    className="border-t border-slate-100 hover:bg-indigo-50/40"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{id}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{v.vendorName}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{v.contactPerson}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{v.serviceProvided}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${riskMeta.bg} ${riskMeta.text}`}>
                        {v.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${statusMeta.bg} ${statusMeta.text} ${statusMeta.ring}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${statusMeta.dot} ${v.vendorStatus === "SUSPENDED" ? "animate-pulse" : ""}`} />
                        {statusMeta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onUpdateStatus(v)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100"
                      >
                        <FiSyncStatus size={13} /> Update Status
                      </motion.button>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}