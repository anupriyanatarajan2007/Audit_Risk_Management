import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FiX, FiAlertTriangle } from "react-icons/fi";

import {
  RISK_CATEGORY,
  UNIT,
  FREQUENCY,
  KRI_STATUS,
} from "../../../constants/KriEnums";

import {
  toNumberOrNull,
  toInputValue,
} from "../../../utils/kriHelpers";

import KriService from "../../../service/KriService";
import RiskService from "../../../service/RiskService";
import {
  getAllDepartments,
} from "../../../service/departmentService";

/* =========================================================
   EMPTY FORM
========================================================= */

const emptyForm = {
  id: null,

  kriId: "",

  kriName: "",
  description: "",

  // Risk database ID
  riskId: "",

  riskCategory: "",

  // Department database ID
  departmentId: "",

  businessUnit: "",

  currentValue: "",

  greenThreshold: "",
  amberThreshold: "",
  redThreshold: "",

  unit: "",
  status: "GREEN",
  frequency: "",

  dataSource: "",
  remarks: "",
};

/* =========================================================
   REQUIRED FIELDS
========================================================= */

const REQUIRED = [
  "kriName",
  "riskId",
  "riskCategory",
  "departmentId",
  "unit",
  "frequency",
];

/* =========================================================
   FIELD
========================================================= */

function Field({
  label,
  name,
  required,
  error,
  children,
}) {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={name}
        className="mb-1 text-sm font-medium text-slate-700"
      >
        {label}{" "}
        {required && (
          <span className="text-rose-500">*</span>
        )}
      </label>

      {children}

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="mt-1 text-[11px] text-rose-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function KriFormModal({
  isOpen,
  onClose,
  editingKri,
  onSaved,
}) {
  const [form, setForm] = useState(emptyForm);

  const [errors, setErrors] = useState({});

  const [saving, setSaving] = useState(false);

  /* =======================================================
     RISKS
  ======================================================= */

  const [risks, setRisks] = useState([]);

  const [usedRiskIds, setUsedRiskIds] =
    useState(new Set());

  const [loadingRisks, setLoadingRisks] =
    useState(false);

  /* =======================================================
     DEPARTMENTS
  ======================================================= */

  const [departments, setDepartments] =
    useState([]);

  const [loadingDepartments, setLoadingDepartments] =
    useState(false);

  const submittedOnce = useRef(false);

  /* =========================================================
     LOAD DEPARTMENTS
  ========================================================= */

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);

      const response =
        await getAllDepartments();

      console.log(
        "RAW DEPARTMENT RESPONSE:",
        response
      );

      /*
       * Supports:
       *
       * {
       *   success: true,
       *   data: [...]
       * }
       *
       * OR
       *
       * {
       *   data: [...]
       * }
       *
       * OR
       *
       * [...]
       */

      const departmentData =
        response?.data?.data ??
        response?.data ??
        response ??
        [];

      const normalizedDepartments =
        Array.isArray(departmentData)
          ? departmentData
          : [];

      console.log(
        "NORMALIZED DEPARTMENTS:",
        normalizedDepartments
      );

      setDepartments(
        normalizedDepartments
      );
    } catch (error) {
      console.error(
        "Failed to load departments:",
        error
      );

      setDepartments([]);

      toast.error(
        "Failed to load departments"
      );
    } finally {
      setLoadingDepartments(false);
    }
  };

  /* =========================================================
     LOAD RISKS + EXISTING KRIs + DEPARTMENTS
  ========================================================= */

  const loadRisksAndKris = async () => {
    try {
      setLoadingRisks(true);

      /* =====================================================
         LOAD RISKS
      ===================================================== */

      const riskResponse =
        await RiskService.getAllRisks();

      console.log(
        "RAW RISK RESPONSE:",
        riskResponse
      );

      const riskData =
        riskResponse?.data?.data ??
        riskResponse?.data ??
        riskResponse ??
        [];

      const normalizedRisks =
        Array.isArray(riskData)
          ? riskData
          : [];

      setRisks(normalizedRisks);

      /* =====================================================
         LOAD EXISTING KRIs
      ===================================================== */

      const kriResponse =
        await KriService.getAllKris();

      console.log(
        "RAW KRI RESPONSE:",
        kriResponse
      );

      const kriData =
        kriResponse?.data?.data ??
        kriResponse?.data ??
        kriResponse ??
        [];

      const normalizedKris =
        Array.isArray(kriData)
          ? kriData
          : [];

      /* =====================================================
         FIND RISKS ALREADY HAVING KRI
      ===================================================== */

      const alreadyUsedRiskIds =
        new Set();

      normalizedKris.forEach((kri) => {
        if (
          kri?.riskId !== undefined &&
          kri?.riskId !== null
        ) {
          alreadyUsedRiskIds.add(
            String(kri.riskId)
          );
        }

        if (
          kri?.risk?.id !== undefined &&
          kri?.risk?.id !== null
        ) {
          alreadyUsedRiskIds.add(
            String(kri.risk.id)
          );
        }
      });

      setUsedRiskIds(
        alreadyUsedRiskIds
      );
    } catch (error) {
      console.error(
        "Failed to load risks/KRIs:",
        error
      );

      setRisks([]);
      setUsedRiskIds(new Set());

      toast.error(
        "Failed to load risks"
      );
    } finally {
      setLoadingRisks(false);
    }
  };

  /* =========================================================
     OPEN MODAL
  ========================================================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    submittedOnce.current = false;

    setErrors({});

    /*
     * Load all required dropdown data
     */

    loadRisksAndKris();
    loadDepartments();

    /* =======================================================
       EDIT
    ======================================================= */

    if (editingKri) {
      const merged = {
        ...emptyForm,
      };

      Object.keys(emptyForm).forEach(
        (key) => {
          merged[key] = toInputValue(
            editingKri[key]
          );
        }
      );

      /* =====================================================
         RISK ID
      ===================================================== */

      if (
        editingKri.riskId !== undefined &&
        editingKri.riskId !== null
      ) {
        merged.riskId =
          String(editingKri.riskId);
      }

      /* =====================================================
         DEPARTMENT ID
      ===================================================== */

      if (
        editingKri.departmentId !==
          undefined &&
        editingKri.departmentId !== null
      ) {
        merged.departmentId =
          String(
            editingKri.departmentId
          );
      }

      /*
       * Some response DTOs may return:
       *
       * department: {
       *   id: 3
       * }
       */

      else if (
        editingKri.department?.id !==
          undefined &&
        editingKri.department?.id !== null
      ) {
        merged.departmentId =
          String(
            editingKri.department.id
          );
      }

      if (editingKri.kriId) {
        merged.kriId =
          editingKri.kriId;
      }

      setForm(merged);
    }

    /* =======================================================
       CREATE
    ======================================================= */

    else {
      setForm({
        ...emptyForm,
      });
    }
  }, [isOpen, editingKri]);

  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (submittedOnce.current) {
      validateField(
        name,
        value
      );
    }
  };

  /* =========================================================
     VALIDATE FIELD
  ========================================================= */

  const validateField = (
    name,
    value
  ) => {
    setErrors((previous) => {
      const next = {
        ...previous,
      };

      if (
        REQUIRED.includes(name) &&
        !String(
          value ?? ""
        ).trim()
      ) {
        next[name] = "Required";
      } else {
        delete next[name];
      }

      return next;
    });
  };

  /* =========================================================
     VALIDATE ALL
  ========================================================= */

  const validateAll = () => {
    const next = {};

    REQUIRED.forEach(
      (field) => {
        if (
          !String(
            form[field] ?? ""
          ).trim()
        ) {
          next[field] =
            "Required";
        }
      }
    );

    setErrors(next);

    return (
      Object.keys(next).length ===
      0
    );
  };

  /* =========================================================
     INPUT CLASS
  ========================================================= */

  const inputCls = (name) =>
    `w-full rounded-lg border px-3 py-2 text-sm text-slate-700 outline-none transition focus:ring-2 ${
      errors[name]
        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
        : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100"
    }`;

  /* =========================================================
     AVAILABLE RISKS
  ========================================================= */

  const availableRisks =
    risks.filter((risk) => {
      if (!risk?.id) {
        return false;
      }

      const riskId =
        String(risk.id);

      if (editingKri) {
        const currentRiskId =
          String(
            editingKri.riskId ??
              editingKri.risk?.id ??
              ""
          );

        if (
          riskId === currentRiskId
        ) {
          return true;
        }
      }

      return !usedRiskIds.has(
        riskId
      );
    });

  /* =========================================================
     SELECTED RISK ALREADY HAS KRI
  ========================================================= */

  const selectedRiskAlreadyHasKri =
    form.riskId &&
    usedRiskIds.has(
      String(form.riskId)
    );

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async () => {
    submittedOnce.current = true;

    if (!validateAll()) {
      toast.error(
        "Please fill all required fields"
      );

      return;
    }

    if (saving) {
      return;
    }

    /* =======================================================
       DUPLICATE RISK CHECK
    ======================================================= */

    if (!editingKri) {
      const selectedRiskId =
        String(form.riskId);

      if (
        usedRiskIds.has(
          selectedRiskId
        )
      ) {
        toast.error(
          "This Risk already has a KRI."
        );

        return;
      }
    }

    /* =======================================================
       PAYLOAD
    ======================================================= */

    const payload = {
      kriName:
        form.kriName.trim(),

      description:
        form.description?.trim() ||
        null,

      /*
       * Risk DATABASE ID
       */
      riskId:
        toNumberOrNull(
          form.riskId
        ),

      riskCategory:
        form.riskCategory,

      /*
       * Department DATABASE ID
       */
      departmentId:
        toNumberOrNull(
          form.departmentId
        ),

      businessUnit:
        form.businessUnit?.trim() ||
        null,

      currentValue:
        toNumberOrNull(
          form.currentValue
        ),

      greenThreshold:
        toNumberOrNull(
          form.greenThreshold
        ),

      amberThreshold:
        toNumberOrNull(
          form.amberThreshold
        ),

      redThreshold:
        toNumberOrNull(
          form.redThreshold
        ),

      unit:
        form.unit,

      status:
        form.status,

      frequency:
        form.frequency,

      dataSource:
        form.dataSource?.trim() ||
        null,

      remarks:
        form.remarks?.trim() ||
        null,
    };

    console.log(
      "KRI CREATE/UPDATE PAYLOAD:",
      JSON.stringify(
        payload,
        null,
        2
      )
    );

    try {
      setSaving(true);

      /* =====================================================
         UPDATE
      ===================================================== */

      if (editingKri?.id) {
        await KriService.updateKri(
          editingKri.id,
          payload
        );

        toast.success(
          "KRI updated successfully"
        );
      }

      /* =====================================================
         CREATE
      ===================================================== */

      else {
        await KriService.createKri(
          payload
        );

        toast.success(
          "KRI created successfully"
        );
      }

      if (onSaved) {
        await onSaved();
      }

      onClose();
    } catch (error) {
      console.error(
        "KRI save error:",
        error
      );

      console.error(
        "KRI API ERROR:",
        error?.response?.data
      );

      toast.error(
        error?.response?.data
          ?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

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
            onClick={(e) =>
              e.stopPropagation()
            }
            initial={{
              opacity: 0,
              scale: 0.92,
              y: 16,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.92,
              y: 16,
            }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 28,
            }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >

            {/* HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingKri
                    ? "Edit KRI"
                    : "Create New KRI"}
                </h2>

                {editingKri && (
                  <p className="mt-1 text-xs text-slate-400">
                    KRI ID:{" "}
                    <span className="font-semibold text-indigo-600">
                      {form.kriId}
                    </span>
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* FORM */}

            <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-2">

              {/* KRI NAME */}

              <Field
                label="KRI Name"
                name="kriName"
                required
                error={errors.kriName}
              >
                <input
                  id="kriName"
                  name="kriName"
                  value={form.kriName}
                  onChange={handleChange}
                  className={inputCls(
                    "kriName"
                  )}
                  placeholder="Enter KRI name"
                />
              </Field>

              {/* RISK */}

              <Field
                label="Risk"
                name="riskId"
                required
                error={errors.riskId}
              >
                <select
                  id="riskId"
                  name="riskId"
                  value={form.riskId}
                  onChange={handleChange}
                  className={inputCls(
                    "riskId"
                  )}
                  disabled={loadingRisks}
                >
                  <option value="">
                    {loadingRisks
                      ? "Loading risks..."
                      : availableRisks.length ===
                        0
                      ? "No available risks"
                      : "Select Risk"}
                  </option>

                  {availableRisks.map(
                    (risk) => (
                      <option
                        key={risk.id}
                        value={risk.id}
                      >
                        {risk.riskId ||
                          `RISK-${String(
                            risk.id
                          ).padStart(
                            3,
                            "0"
                          )}`}{" "}
                        -{" "}
                        {risk.title ||
                          "Untitled Risk"}
                      </option>
                    )
                  )}
                </select>
              </Field>

              {/* DEPARTMENT */}

              <Field
                label="Department"
                name="departmentId"
                required
                error={
                  errors.departmentId
                }
              >
                <select
                  id="departmentId"
                  name="departmentId"
                  value={
                    form.departmentId
                  }
                  onChange={handleChange}
                  className={inputCls(
                    "departmentId"
                  )}
                  disabled={
                    loadingDepartments
                  }
                >
                  <option value="">
                    {loadingDepartments
                      ? "Loading departments..."
                      : departments.length ===
                        0
                      ? "No departments found"
                      : "Select Department"}
                  </option>

                  {departments.map(
                    (department) => (
                      <option
                        key={
                          department.id
                        }
                        value={
                          department.id
                        }
                      >
                        {department.departmentName ||
                          department.name ||
                          department.department ||
                          `Department ${department.id}`}
                      </option>
                    )
                  )}
                </select>
              </Field>

              {/* RISK CATEGORY */}

              <Field
                label="Risk Category"
                name="riskCategory"
                required
                error={
                  errors.riskCategory
                }
              >
                <select
                  id="riskCategory"
                  name="riskCategory"
                  value={
                    form.riskCategory
                  }
                  onChange={handleChange}
                  className={inputCls(
                    "riskCategory"
                  )}
                >
                  <option value="">
                    Select
                  </option>

                  {RISK_CATEGORY.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </Field>

              {/* BUSINESS UNIT */}

              <Field
                label="Business Unit"
                name="businessUnit"
                error={
                  errors.businessUnit
                }
              >
                <input
                  id="businessUnit"
                  name="businessUnit"
                  value={
                    form.businessUnit
                  }
                  onChange={handleChange}
                  className={inputCls(
                    "businessUnit"
                  )}
                  placeholder="Enter business unit"
                />
              </Field>

              {/* UNIT */}

              <Field
                label="Unit"
                name="unit"
                required
                error={errors.unit}
              >
                <select
                  id="unit"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className={inputCls(
                    "unit"
                  )}
                >
                  <option value="">
                    Select
                  </option>

                  {UNIT.map(
                    (unit) => (
                      <option
                        key={unit}
                        value={unit}
                      >
                        {unit}
                      </option>
                    )
                  )}
                </select>
              </Field>

              {/* CURRENT VALUE */}

              <Field
                label="Current Value"
                name="currentValue"
                error={
                  errors.currentValue
                }
              >
                <input
                  id="currentValue"
                  name="currentValue"
                  type="number"
                  value={
                    form.currentValue
                  }
                  onChange={handleChange}
                  className={inputCls(
                    "currentValue"
                  )}
                  placeholder="0"
                />
              </Field>

              {/* STATUS */}

              <Field
                label="Status"
                name="status"
                error={errors.status}
              >
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={inputCls(
                    "status"
                  )}
                >
                  {KRI_STATUS.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    )
                  )}
                </select>
              </Field>

              {/* GREEN */}

              <Field
                label="Green Threshold"
                name="greenThreshold"
                error={
                  errors.greenThreshold
                }
              >
                <input
                  id="greenThreshold"
                  name="greenThreshold"
                  type="number"
                  value={
                    form.greenThreshold
                  }
                  onChange={handleChange}
                  className={inputCls(
                    "greenThreshold"
                  )}
                />
              </Field>

              {/* AMBER */}

              <Field
                label="Amber Threshold"
                name="amberThreshold"
                error={
                  errors.amberThreshold
                }
              >
                <input
                  id="amberThreshold"
                  name="amberThreshold"
                  type="number"
                  value={
                    form.amberThreshold
                  }
                  onChange={handleChange}
                  className={inputCls(
                    "amberThreshold"
                  )}
                />
              </Field>

              {/* RED */}

              <Field
                label="Red Threshold"
                name="redThreshold"
                error={
                  errors.redThreshold
                }
              >
                <input
                  id="redThreshold"
                  name="redThreshold"
                  type="number"
                  value={
                    form.redThreshold
                  }
                  onChange={handleChange}
                  className={inputCls(
                    "redThreshold"
                  )}
                />
              </Field>

              {/* FREQUENCY */}

              <Field
                label="Frequency"
                name="frequency"
                required
                error={
                  errors.frequency
                }
              >
                <select
                  id="frequency"
                  name="frequency"
                  value={
                    form.frequency
                  }
                  onChange={handleChange}
                  className={inputCls(
                    "frequency"
                  )}
                >
                  <option value="">
                    Select
                  </option>

                  {FREQUENCY.map(
                    (frequency) => (
                      <option
                        key={frequency}
                        value={frequency}
                      >
                        {frequency}
                      </option>
                    )
                  )}
                </select>
              </Field>

              {/* DATA SOURCE */}

              <Field
                label="Data Source"
                name="dataSource"
                error={
                  errors.dataSource
                }
              >
                <input
                  id="dataSource"
                  name="dataSource"
                  value={
                    form.dataSource
                  }
                  onChange={handleChange}
                  className={inputCls(
                    "dataSource"
                  )}
                  placeholder="Enter data source"
                />
              </Field>

              {/* REMARKS */}

              <div className="sm:col-span-2">
                <Field
                  label="Remarks"
                  name="remarks"
                  error={errors.remarks}
                >
                  <textarea
                    id="remarks"
                    name="remarks"
                    value={form.remarks}
                    onChange={handleChange}
                    rows={2}
                    className={inputCls(
                      "remarks"
                    )}
                    placeholder="Enter remarks"
                  />
                </Field>
              </div>
            </div>

            {/* FOOTER */}

            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <motion.button
                type="button"
                whileTap={{
                  scale: 0.96,
                }}
                onClick={handleSubmit}
                disabled={
                  saving ||
                  (!editingKri &&
                    availableRisks.length ===
                      0)
                }
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingKri
                  ? "Update KRI"
                  : "Create KRI"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}