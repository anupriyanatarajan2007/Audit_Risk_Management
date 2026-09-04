import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { FiSearch, FiRefreshCw, FiBriefcase, FiPlus } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

import VendorService from "../../service/VendorService";
import VendorTable from "../../components/riskOfficer/vendor/VendorTable";
import VendorStatusModal from "../../components/riskOfficer/vendor/VendorStatusModal";
import VendorFormModal from "../../components/riskOfficer/vendor/VendorFormModal";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusModalVendor, setStatusModalVendor] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false); // ← new

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const res = await VendorService.getAllVendors();

        console.log(res);
        
        setVendors(
            Array.isArray(res.data.data) 
            ? res.data.data 
            : []
        );
    } catch {
      setError("Failed to load vendors. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const filtered = useMemo(() => {
    if (!search) return vendors;
    const term = search.toLowerCase();
    return vendors.filter(
      (v) =>
        v.vendorName?.toLowerCase().includes(term) ||
        v.contactPerson?.toLowerCase().includes(term) ||
        v.serviceProvided?.toLowerCase().includes(term)
    );
  }, [vendors, search]);

  const stats = useMemo(() => ({
    total: vendors.length,
    active: vendors.filter((v) => v.vendorStatus === "ACTIVE").length,
    suspended: vendors.filter((v) => v.vendorStatus === "SUSPENDED").length,
    review: vendors.filter((v) => v.vendorStatus === "UNDER_REVIEW").length
  }), [vendors]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 p-6">
      <Toaster position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center"
      >
        <div>
          <p className="text-xs font-medium text-indigo-400">Audit &amp; Risk Management / Vendor Oversight</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">Vendor Management</h1>
          <p className="text-sm text-slate-400">Track vendor contracts, risk exposure, and compliance status</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchVendors}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
          >
            <FiPlus size={14} /> Add Vendor
          </motion.button>
        </div>
      </motion.div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Vendors", value: stats.total, gradient: "from-indigo-500 to-indigo-600" },
          { label: "Active", value: stats.active, gradient: "from-emerald-500 to-emerald-600" },
          { label: "Suspended", value: stats.suspended, gradient: "from-rose-500 to-rose-600" },
           ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            whileHover={{ y: -4 }}
            className={`rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg ${card.gradient}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-white/80">{card.label}</p>
                <p className="mt-1 text-3xl font-bold">{loading ? "—" : card.value}</p>
              </div>
              <FiBriefcase className="text-white/70" size={22} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by vendor, contact, or service..."
          className="w-full max-w-md rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-9 pr-3 text-sm outline-none backdrop-blur focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-600">
          {error}
          <button onClick={fetchVendors} className="ml-3 font-medium underline">Retry</button>
        </div>
      ) : (
        <VendorTable vendors={filtered} loading={loading} onUpdateStatus={setStatusModalVendor} />
      )}

      <VendorStatusModal
        vendor={statusModalVendor}
        onClose={() => setStatusModalVendor(null)}
        onUpdated={fetchVendors}
      />
      <VendorFormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={fetchVendors}
      />
    </div>
  );
}