import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import { VENDOR_STATUS, RISK_LEVEL } from "../../../constants/vendorEnums";
import VendorService from "../../../service/VendorService";

const emptyForm = {
  vendorName: "",
  contactPerson: "",
  email: "",
  phoneNumber: "",
  address: "",
  serviceProvided: "",
  contractStartDate: "",
  contractEndDate: "",
  vendorStatus: "ACTIVE",
  riskLevel: "LOW",
  remarks: "",
};

const REQUIRED = [
  "vendorName",
  "contactPerson",
  "email",
  "phoneNumber",
  "serviceProvided",
];

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">
        {label}{" "}
        {required && <span className="text-rose-400">*</span>}
      </label>

      {children}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1 text-[11px] text-rose-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VendorFormModal({
  isOpen,
  onClose,
  onCreated,
}) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const submittedOnce = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm);
      setErrors({});
      submittedOnce.current = false;
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (submittedOnce.current) {
      setErrors((prev) => {
        const next = { ...prev };

        if (REQUIRED.includes(name) && !value.trim()) {
          next[name] = "Required";
        } else {
          delete next[name];
        }

        return next;
      });
    }
  };

  const validateAll = () => {
    const next = {};

    REQUIRED.forEach((field) => {
      if (!String(form[field] ?? "").trim()) {
        next[field] = "Required";
      }
    });

    if (
      form.email &&
      !/^\S+@\S+\.\S+$/.test(form.email)
    ) {
      next.email = "Invalid email";
    }

    if (
      form.contractStartDate &&
      form.contractEndDate &&
      form.contractEndDate < form.contractStartDate
    ) {
      next.contractEndDate =
        "End date must be after start date";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    submittedOnce.current = true;

    if (!validateAll()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      const payload = {
        vendorName: form.vendorName.trim(),
        contactPerson: form.contactPerson.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        address: form.address || null,
        serviceProvided: form.serviceProvided.trim(),
        contractStartDate: form.contractStartDate || null,
        contractEndDate: form.contractEndDate || null,
        vendorStatus: form.vendorStatus,
        riskLevel: form.riskLevel,
        remarks: form.remarks || null,
      };

      await VendorService.createVendor(payload);

      toast.success("Vendor created successfully");

      onCreated();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Failed to create vendor"
      );
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (name) =>
    `w-full rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none transition focus:ring-2 ${
      errors[name]
        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
        : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
    }`;

  return (
    <AnimatePresence>
      {isOpen && (
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
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 28,
            }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
              <h2 className="text-lg font-semibold text-slate-800">
                Add New Vendor
              </h2>

              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">
              <Field
                label="Vendor Name"
                required
                error={errors.vendorName}
              >
                <input
                  name="vendorName"
                  value={form.vendorName}
                  onChange={handleChange}
                  className={inputCls("vendorName")}
                />
              </Field>

              <Field
                label="Contact Person"
                required
                error={errors.contactPerson}
              >
                <input
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={handleChange}
                  className={inputCls("contactPerson")}
                />
              </Field>

              <Field
                label="Email"
                required
                error={errors.email}
              >
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={inputCls("email")}
                />
              </Field>

              <Field
                label="Phone Number"
                required
                error={errors.phoneNumber}
              >
                <input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  className={inputCls("phoneNumber")}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field
                  label="Address"
                  error={errors.address}
                >
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className={inputCls("address")}
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field
                  label="Service Provided"
                  required
                  error={errors.serviceProvided}
                >
                  <input
                    name="serviceProvided"
                    value={form.serviceProvided}
                    onChange={handleChange}
                    className={inputCls("serviceProvided")}
                  />
                </Field>
              </div>

              <Field
                label="Contract Start Date"
                error={errors.contractStartDate}
              >
                <input
                  name="contractStartDate"
                  type="date"
                  value={form.contractStartDate}
                  onChange={handleChange}
                  className={inputCls("contractStartDate")}
                />
              </Field>

              <Field
                label="Contract End Date"
                error={errors.contractEndDate}
              >
                <input
                  name="contractEndDate"
                  type="date"
                  value={form.contractEndDate}
                  onChange={handleChange}
                  className={inputCls("contractEndDate")}
                />
              </Field>

              <Field
                label="Vendor Status"
                error={errors.vendorStatus}
              >
                <select
                  name="vendorStatus"
                  value={form.vendorStatus}
                  onChange={handleChange}
                  className={inputCls("vendorStatus")}
                >
                  {VENDOR_STATUS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Risk Level"
                error={errors.riskLevel}
              >
                <select
                  name="riskLevel"
                  value={form.riskLevel}
                  onChange={handleChange}
                  className={inputCls("riskLevel")}
                >
                  {RISK_LEVEL.map((risk) => (
                    <option key={risk} value={risk}>
                      {risk}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="sm:col-span-2">
                <Field
                  label="Remarks"
                  error={errors.remarks}
                >
                  <input
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    className={inputCls("remarks")}
                  />
                </Field>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
              <button
                onClick={onClose}
                className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={handleSubmit}
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create Vendor"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}