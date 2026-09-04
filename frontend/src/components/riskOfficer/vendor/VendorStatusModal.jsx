import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiAlertCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { STATUS_META } from "../../../constants/vendorEnums";
import VendorService from "../../../service/VendorService";
import { VENDOR_STATUS } from "../../../constants/vendorEnums";

// Top-level component — never nested inside the modal function,
// that's what caused the "one letter only" bug last time.
function StatusOption({ status, selected, onSelect }) {
  const meta = STATUS_META[status];
  return (
    <button
      type="button"
      onClick={() => onSelect(status)}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
        selected
          ? `${meta.bg} ${meta.text} border-current`
          : "border-slate-200 text-slate-500 hover:bg-slate-50"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </button>
  );
}

export default function VendorStatusModal({ vendor, onClose, onUpdated }) {
  const [newStatus, setNewStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (vendor) {
      setNewStatus(vendor.vendorStatus || "");
      setRemarks("");
    }
  }, [vendor]);

  if (!vendor) return null;
  const currentMeta =
  STATUS_META[vendor.vendorStatus] ?? {
    label: vendor.vendorStatus ?? "Unknown",
    bg: "bg-slate-100",
    text: "text-slate-700",
    ring: "ring-slate-200",
    dot: "bg-slate-500",
  };
  const isUnchanged = newStatus === vendor.vendorStatus;

  const handleSubmit = async () => {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }

    const result = await Swal.fire({
      title: "Confirm status update?",
      html: `<b>${vendor.vendorName}</b><br/>${vendor.vendorStatus} → <b>${newStatus}</b>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6366f1",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Update"
    });
    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      // Spread the full existing vendor so no field is dropped — only
      // vendorStatus and remarks change, matching the payload shape you gave.
      const payload = {
        ...vendor,
        vendorStatus: newStatus,
        remarks: remarks.trim() || vendor.remarks
      };
      delete payload.id;
      delete payload.vendorId;

      await VendorService.updateVendor(vendor.vendorId ?? vendor.id, payload);
      toast.success("Vendor status updated");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update vendor status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {vendor && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-800">Update Vendor Status</h2>
              <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Vendor Name</label>
                <input
                  value={vendor.vendorName}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Current Status</label>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${currentMeta.bg} ${currentMeta.text} ${currentMeta.ring}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${currentMeta.dot}`} />
                  {currentMeta.label}
                </span>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">New Status</label>
                <div className="flex flex-wrap gap-2">
                  {VENDOR_STATUS.map((s) => (
                    <StatusOption key={s} status={s} selected={newStatus === s} onSelect={setNewStatus} />
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  placeholder="Reason for status change (optional)"
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {!isUnchanged && newStatus && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-600"
                >
                  <FiAlertCircle size={14} />
                  Status will change from {vendor.vendorStatus} to {newStatus}
                </motion.div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100">
                Cancel
              </button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleSubmit}
                disabled={saving || isUnchanged}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? "Updating..." : "Update Status"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}