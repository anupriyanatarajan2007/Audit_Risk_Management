// src/components/riskOfficer/mitigation/MitigationForm.jsx

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import {
  MITIGATION_TYPE,
  TYPE_CONFIG,
} from "../../../utils/mitigationConstants";
import axios from "axios";

// ============================================================
// API URLS
// ============================================================

const RISK_API_URL = "http://localhost:8080/api/risks";
const MITIGATION_API_URL = "http://localhost:8080/api/mitigations";

// ============================================================
// EMPTY FORM
// ============================================================

const EMPTY_FORM = {
  mitigationTitle: "",
  mitigationDescription: "",
  riskId: "",
  mitigationType: "PREVENTIVE",
  targetDate: "",
  cost: "",
  remarks: "",
};

// ============================================================
// AUTH HEADERS
// ============================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// ============================================================
// EXTRACT ARRAY FROM API RESPONSE
// ============================================================

const extractArray = (response) => {
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  return [];
};

// ============================================================
// GET ALL RISKS
// ============================================================

const fetchAllRisks = async () => {
  const response = await axios.get(RISK_API_URL, {
    headers: getAuthHeaders(),
  });

  console.log("========================================");
  console.log("ALL RISKS API RESPONSE");
  console.log("========================================");
  console.log(response.data);

  return extractArray(response);
};

// ============================================================
// GET ALL MITIGATIONS
// ============================================================

const fetchAllMitigations = async () => {
  const response = await axios.get(MITIGATION_API_URL, {
    headers: getAuthHeaders(),
  });

  console.log("========================================");
  console.log("ALL MITIGATIONS API RESPONSE");
  console.log("========================================");
  console.log(response.data);

  const mitigations = extractArray(response);

  console.log("Parsed Mitigations:", mitigations);

  return mitigations;
};

// ============================================================
// NORMALIZE VALUE
// ============================================================

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  return String(value).trim();
};

// ============================================================
// GET ALL POSSIBLE RISK REFERENCES FROM MITIGATION
//
// Handles:
// mitigation.riskId
// mitigation.risk.id
// mitigation.risk.riskId
// mitigation.riskId.id
// etc.
// ============================================================

const getMitigationRiskReferences = (mitigation) => {
  if (!mitigation) {
    return [];
  }

  const references = [];

  // -----------------------------------------
  // Direct riskId
  // -----------------------------------------

  if (
    mitigation.riskId !== null &&
    mitigation.riskId !== undefined
  ) {
    references.push(mitigation.riskId);
  }

  // -----------------------------------------
  // Direct riskID
  // -----------------------------------------

  if (
    mitigation.riskID !== null &&
    mitigation.riskID !== undefined
  ) {
    references.push(mitigation.riskID);
  }

  // -----------------------------------------
  // Nested risk.id
  // -----------------------------------------

  if (
    mitigation.risk?.id !== null &&
    mitigation.risk?.id !== undefined
  ) {
    references.push(mitigation.risk.id);
  }

  // -----------------------------------------
  // Nested risk.riskId
  // -----------------------------------------

  if (
    mitigation.risk?.riskId !== null &&
    mitigation.risk?.riskId !== undefined
  ) {
    references.push(mitigation.risk.riskId);
  }

  // -----------------------------------------
  // Nested risk.riskID
  // -----------------------------------------

  if (
    mitigation.risk?.riskID !== null &&
    mitigation.risk?.riskID !== undefined
  ) {
    references.push(mitigation.risk.riskID);
  }

  // -----------------------------------------
  // Possible associatedRisk object
  // -----------------------------------------

  if (
    mitigation.associatedRisk?.id !== null &&
    mitigation.associatedRisk?.id !== undefined
  ) {
    references.push(mitigation.associatedRisk.id);
  }

  if (
    mitigation.associatedRisk?.riskId !== null &&
    mitigation.associatedRisk?.riskId !== undefined
  ) {
    references.push(mitigation.associatedRisk.riskId);
  }

  // -----------------------------------------
  // Possible risk object ID
  // -----------------------------------------

  if (
    mitigation.risk?.risk?.id !== null &&
    mitigation.risk?.risk?.id !== undefined
  ) {
    references.push(mitigation.risk.risk.id);
  }

  if (
    mitigation.risk?.risk?.riskId !== null &&
    mitigation.risk?.risk?.riskId !== undefined
  ) {
    references.push(mitigation.risk.risk.riskId);
  }

  return references
    .map(normalizeValue)
    .filter(Boolean);
};

// ============================================================
// GET AVAILABLE RISKS
// ============================================================

const fetchAvailableRisks = async (
  editingRiskId = null,
  editingRiskBusinessId = null
) => {
  try {
    const [allRisks, allMitigations] =
      await Promise.all([
        fetchAllRisks(),
        fetchAllMitigations(),
      ]);

    console.log("========================================");
    console.log("FILTERING RISKS");
    console.log("========================================");

    console.log("Total Risks:", allRisks.length);

    console.log(
      "Total Mitigations:",
      allMitigations.length
    );

    // ========================================================
    // CREATE SET OF ALL RISK REFERENCES HAVING MITIGATION
    // ========================================================

    const mitigatedRiskReferences = new Set();

    allMitigations.forEach((mitigation, index) => {
      const references =
        getMitigationRiskReferences(mitigation);

      console.log(
        `Mitigation ${index + 1}:`,
        mitigation
      );

      console.log(
        `Mitigation ${index + 1} Risk References:`,
        references
      );

      references.forEach((reference) => {
        mitigatedRiskReferences.add(
          normalizeValue(reference)
        );
      });
    });

    console.log(
      "========================================"
    );

    console.log(
      "RISKS ALREADY HAVING MITIGATION:"
    );

    console.log(
      [...mitigatedRiskReferences]
    );

    console.log(
      "========================================"
    );

    // ========================================================
    // FILTER RISKS
    // ========================================================

    const availableRisks = allRisks.filter(
      (risk) => {

        if (!risk) {
          return false;
        }

        const riskDbId =
          normalizeValue(risk.id);

        const riskBusinessId =
          normalizeValue(risk.riskId);

        // ====================================================
        // EDIT MODE
        //
        // Current mitigation's risk should remain visible.
        // ====================================================

        const isCurrentEditingRisk =
          (
            editingRiskId !== null &&
            editingRiskId !== undefined &&
            riskDbId ===
              normalizeValue(editingRiskId)
          ) ||
          (
            editingRiskBusinessId !== null &&
            editingRiskBusinessId !== undefined &&
            riskBusinessId ===
              normalizeValue(editingRiskBusinessId)
          );

        if (isCurrentEditingRisk) {
          console.log(
            "KEEPING CURRENT EDIT RISK:",
            risk.riskId
          );

          return true;
        }

        // ====================================================
        // CHECK BOTH DATABASE ID AND BUSINESS RISK ID
        // ====================================================

        const alreadyHasMitigation =
          mitigatedRiskReferences.has(riskDbId) ||
          mitigatedRiskReferences.has(riskBusinessId);

        if (alreadyHasMitigation) {
          console.log(
            "HIDING RISK - MITIGATION EXISTS:",
            {
              dbId: risk.id,
              riskId: risk.riskId,
              title: risk.title,
            }
          );

          return false;
        }

        // ====================================================
        // SHOW RISK
        // ====================================================

        console.log(
          "SHOWING AVAILABLE RISK:",
          {
            dbId: risk.id,
            riskId: risk.riskId,
            title: risk.title,
          }
        );

        return true;
      }
    );

    console.log(
      "========================================"
    );

    console.log(
      "FINAL AVAILABLE RISKS:"
    );

    console.log(availableRisks);

    console.log(
      "========================================"
    );

    return availableRisks;

  } catch (error) {

    console.error(
      "Failed to load risks/mitigations:",
      error
    );

    throw error;
  }
};

// ============================================================
// INPUT CLASS
// ============================================================

const inputCls = (error) =>
  `w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 ${
    error
      ? "border-rose-300 focus:ring-rose-200"
      : "border-slate-200 focus:ring-indigo-200"
  }`;

// ============================================================
// FIELD
// ============================================================

function Field({
  label,
  error,
  children,
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
      </label>

      {children}

      {error && (
        <p className="text-xs text-rose-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function MitigationForm({
  open,
  initialData,
  onClose,
  onSubmit,
  saving,
}) {

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [errors, setErrors] =
    useState({});

  const [risks, setRisks] =
    useState([]);

  const [loadingRisks, setLoadingRisks] =
    useState(false);

  const isEdit =
    Boolean(initialData);

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {

    if (!open) {
      return;
    }

    let cancelled = false;

    const loadData = async () => {

      setErrors({});
      setLoadingRisks(true);

      try {

        // ====================================================
        // GET ALL RISKS FIRST
        // ====================================================

        const allRisks =
          await fetchAllRisks();

        let editingRiskDbId = null;
        let editingRiskBusinessId = null;

        // ====================================================
        // FIND CURRENT RISK FOR EDIT MODE
        // ====================================================

        if (initialData) {

          console.log(
            "========================================"
          );

          console.log(
            "EDITING MITIGATION:"
          );

          console.log(initialData);

          console.log(
            "========================================"
          );

          // -----------------------------------------------
          // initialData.riskId could be:
          //
          // 2
          //
          // OR
          //
          // RISK-1787977004560
          // -----------------------------------------------

          const selectedRisk =
            allRisks.find(
              (risk) =>
                normalizeValue(risk.id) ===
                  normalizeValue(
                    initialData.riskId
                  ) ||
                normalizeValue(
                  risk.riskId
                ) ===
                  normalizeValue(
                    initialData.riskId
                  )
            );

          if (selectedRisk) {

            editingRiskDbId =
              selectedRisk.id;

            editingRiskBusinessId =
              selectedRisk.riskId;

            console.log(
              "Editing Risk DB ID:",
              editingRiskDbId
            );

            console.log(
              "Editing Risk Business ID:",
              editingRiskBusinessId
            );
          }
        }

        // ====================================================
        // GET FILTERED RISKS
        // ====================================================

        const availableRisks =
          await fetchAvailableRisks(
            editingRiskDbId,
            editingRiskBusinessId
          );

        if (cancelled) {
          return;
        }

        setRisks(
          availableRisks
        );

        // ====================================================
        // EDIT MODE
        // ====================================================

        if (initialData) {

          const selectedRisk =
            availableRisks.find(
              (risk) =>
                normalizeValue(
                  risk.riskId
                ) ===
                normalizeValue(
                  initialData.riskId
                ) ||
                normalizeValue(
                  risk.id
                ) ===
                normalizeValue(
                  initialData.riskId
                )
            );

          setForm({
            mitigationTitle:
              initialData.mitigationTitle ??
              "",

            mitigationDescription:
              initialData.mitigationDescription ??
              "",

            riskId:
              selectedRisk?.id ??
              editingRiskDbId ??
              "",

            mitigationType:
              initialData.mitigationType ??
              "PREVENTIVE",

            targetDate:
              initialData.targetDate
                ? initialData.targetDate.slice(
                    0,
                    10
                  )
                : "",

            cost:
              initialData.cost ??
              "",

            remarks:
              initialData.remarks ??
              "",

            status:
              initialData.status ??
              "PLANNED",

            effectiveness:
              initialData.effectiveness ??
              "MEDIUM",
          });

        }

        // ====================================================
        // CREATE MODE
        // ====================================================

        else {

          setForm({
            ...EMPTY_FORM,

            status:
              "PLANNED",

            effectiveness:
              "MEDIUM",
          });

        }

      } catch (error) {

        console.error(
          "Risk/Mitigation Loading Failed:",
          error
        );

        if (!cancelled) {
          setRisks([]);
        }

      } finally {

        if (!cancelled) {
          setLoadingRisks(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };

  }, [open, initialData]);

  // ==========================================================
  // UPDATE FIELD
  // ==========================================================

  const update = (
    key,
    value
  ) => {

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }));
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validate = () => {

    const next = {};

    if (
      !form.mitigationTitle.trim()
    ) {
      next.mitigationTitle =
        "Title is required";
    }

    if (
      !form.mitigationDescription.trim()
    ) {
      next.mitigationDescription =
        "Description is required";
    }

    if (!form.riskId) {
      next.riskId =
        "Select associated risk";
    }

    if (!form.targetDate) {
      next.targetDate =
        "Target date is required";
    }

    if (
      form.cost !== "" &&
      Number(form.cost) < 0
    ) {
      next.cost =
        "Cost cannot be negative";
    }

    setErrors(next);

    return (
      Object.keys(next).length === 0
    );
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = (e) => {

    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      ...form,

      // Backend expects database Risk ID
      riskId: Number(form.riskId),

      cost:
        form.cost === ""
          ? null
          : Number(form.cost),

      status:
        isEdit
          ? form.status
          : "PLANNED",

      effectiveness:
        form.effectiveness ||
        "MEDIUM",
    };

    console.log(
      "========================================"
    );

    console.log(
      "MITIGATION PAYLOAD:"
    );

    console.log(payload);

    console.log(
      "========================================"
    );

    onSubmit(payload);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <AnimatePresence>

      {open && (
        <>

          {/* ================================================= */}
          {/* OVERLAY */}
          {/* ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[80]"
            onClick={onClose}
          />

          {/* ================================================= */}
          {/* DRAWER */}
          {/* ================================================= */}

          <motion.div
            initial={{
              x: "100%",
            }}
            animate={{
              x: 0,
            }}
            exit={{
              x: "100%",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-[90] shadow-2xl flex flex-col"
          >

            {/* =============================================== */}
            {/* HEADER */}
            {/* =============================================== */}

            <div className="flex items-center justify-between px-6 py-4 border-b">

              <div>

                <h3 className="font-semibold text-slate-900">

                  {isEdit
                    ? "Edit Mitigation"
                    : "New Mitigation"}

                </h3>

                <p className="text-xs text-slate-400 mt-0.5">

                  {isEdit
                    ? "Update existing mitigation"
                    : "Create mitigation for an available risk"}

                </p>

              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400"
              >
                <X size={18} />
              </button>

            </div>

            {/* =============================================== */}
            {/* FORM */}
            {/* =============================================== */}

            <form
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
            >

              {/* ============================================= */}
              {/* TITLE */}
              {/* ============================================= */}

              <Field
                label="Mitigation Title"
                error={
                  errors.mitigationTitle
                }
              >

                <input
                  value={
                    form.mitigationTitle
                  }
                  onChange={(e) =>
                    update(
                      "mitigationTitle",
                      e.target.value
                    )
                  }
                  className={inputCls(
                    errors.mitigationTitle
                  )}
                  placeholder="Implement MFA Control"
                />

              </Field>

              {/* ============================================= */}
              {/* DESCRIPTION */}
              {/* ============================================= */}

              <Field
                label="Mitigation Description"
                error={
                  errors.mitigationDescription
                }
              >

                <textarea
                  rows="4"
                  value={
                    form.mitigationDescription
                  }
                  onChange={(e) =>
                    update(
                      "mitigationDescription",
                      e.target.value
                    )
                  }
                  className={inputCls(
                    errors.mitigationDescription
                  )}
                  placeholder="Describe mitigation activity"
                />

              </Field>

              {/* ============================================= */}
              {/* RISK */}
              {/* ============================================= */}

              <Field
                label="Risk"
                error={
                  errors.riskId
                }
              >

                <select
                  value={
                    form.riskId
                  }
                  onChange={(e) =>
                    update(
                      "riskId",
                      e.target.value
                    )
                  }
                  disabled={
                    loadingRisks
                  }
                  className={inputCls(
                    errors.riskId
                  )}
                >

                  <option value="">

                    {loadingRisks
                      ? "Loading available risks..."
                      : "Select associated risk"}

                  </option>

                  {risks.map(
                    (risk) => (

                      <option
                        key={risk.id}
                        value={risk.id}
                      >

                        {risk.riskId} -{" "}
                        {risk.title}

                      </option>

                    )
                  )}

                </select>

                {/* =========================================== */}
                {/* NO AVAILABLE RISKS */}
                {/* =========================================== */}

                {!loadingRisks &&
                  risks.length === 0 && (

                    <div className="mt-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">

                      <p className="text-xs text-amber-700">

                        No risks are available
                        for a new mitigation.

                      </p>

                      <p className="text-[11px] text-amber-600 mt-0.5">

                        Risks that already have
                        mitigation are automatically
                        hidden.

                      </p>

                    </div>

                  )}

              </Field>

              {/* ============================================= */}
              {/* MITIGATION TYPE */}
              {/* ============================================= */}

              <Field label="Mitigation Type">

                <div className="grid grid-cols-3 gap-2">

                  {Object.values(
                    MITIGATION_TYPE
                  ).map((type) => {

                    const cfg =
                      TYPE_CONFIG[type];

                    const active =
                      form.mitigationType ===
                      type;

                    return (

                      <button
                        type="button"
                        key={type}
                        onClick={() =>
                          update(
                            "mitigationType",
                            type
                          )
                        }
                        className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs font-medium transition ${
                          active
                            ? `${cfg.bg} ${cfg.text} ${cfg.border}`
                            : "border-slate-200 text-slate-400 hover:bg-slate-50"
                        }`}
                      >

                        <cfg.icon
                          size={16}
                        />

                        {cfg.label}

                      </button>

                    );
                  })}

                </div>

              </Field>

              {/* ============================================= */}
              {/* TARGET DATE + COST */}
              {/* ============================================= */}

              <div className="grid grid-cols-2 gap-4">

                <Field
                  label="Target Date"
                  error={
                    errors.targetDate
                  }
                >

                  <input
                    type="date"
                    value={
                      form.targetDate
                    }
                    onChange={(e) =>
                      update(
                        "targetDate",
                        e.target.value
                      )
                    }
                    className={inputCls(
                      errors.targetDate
                    )}
                  />

                </Field>

                <Field
                  label="Cost ₹"
                  error={
                    errors.cost
                  }
                >

                  <input
                    type="number"
                    min="0"
                    value={
                      form.cost
                    }
                    onChange={(e) =>
                      update(
                        "cost",
                        e.target.value
                      )
                    }
                    className={inputCls(
                      errors.cost
                    )}
                    placeholder="0"
                  />

                </Field>

              </div>

              {/* ============================================= */}
              {/* REMARKS */}
              {/* ============================================= */}

              <Field label="Remarks">

                <textarea
                  rows="2"
                  value={
                    form.remarks
                  }
                  onChange={(e) =>
                    update(
                      "remarks",
                      e.target.value
                    )
                  }
                  className={inputCls()}
                  placeholder="Additional remarks"
                />

              </Field>

              {/* ============================================= */}
              {/* FOOTER */}
              {/* ============================================= */}

              <div className="px-6 py-4 border-t flex justify-end gap-2">

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg hover:bg-slate-100 text-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    loadingRisks
                  }
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >

                  {saving
                    ? "Saving..."
                    : isEdit
                    ? "Save Changes"
                    : "Create Mitigation"}

                </button>

              </div>

            </form>

          </motion.div>

        </>
      )}

    </AnimatePresence>
  );
}