import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useState } from "react";
import { Pencil } from "lucide-react";

import StatusBadge from "./StatusBadge";
import EditRiskDrawer from "./EditRiskDrawer";

const LEVEL_STYLES = {
  LOW: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const formatText = (value) => {
  if (!value) return "-";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getDepartmentName = (department) => {
  if (!department) {
    return "-";
  }

  // Backend returns:
  // {
  //   id: 1,
  //   name: "INFORMATION TECHNOLOGY",
  //   active: true
  // }

  if (typeof department === "object") {
    return department.name
      ? formatText(department.name)
      : "-";
  }

  // Backward compatibility if backend returns string
  return formatText(department);
};

export default function RiskList({
  risks,
  loading,
  onSelectRisk,
  selectedId,
  onRiskUpdated,
  onToast,
}) {
  const [editingRisk, setEditingRisk] = useState(null);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  // ============================================================
  // EMPTY STATE
  // ============================================================

  if (!risks || risks.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-medium text-slate-500">
          No risks match these filters
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Try clearing a filter or search term.
        </p>
      </div>
    );
  }

  // ============================================================
  // RISK TABLE
  // ============================================================

  return (
    <LayoutGroup>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-sm">

          {/* ======================================================
              HEADER
          ======================================================= */}

          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">
                Risk ID
              </th>

              <th className="px-4 py-3 font-semibold">
                Title
              </th>

              <th className="px-4 py-3 font-semibold">
                Department
              </th>

              <th className="px-4 py-3 font-semibold">
                Category
              </th>

              <th className="px-4 py-3 font-semibold">
                Level
              </th>

              <th className="px-4 py-3 font-semibold">
                Score
              </th>

              <th className="px-4 py-3 font-semibold">
                Status
              </th>

              <th className="px-4 py-3 font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>

          {/* ======================================================
              BODY
          ======================================================= */}

          <tbody className="divide-y divide-slate-100">
            <AnimatePresence initial={false}>

              {risks.map((risk, index) => (

                <motion.tr
                  key={risk.id}
                  layout
                  initial={{
                    opacity: 0,
                    y: 6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{
                    delay: index * 0.02,
                  }}
                  onClick={() => onSelectRisk(risk.id)}
                  className={`
                    cursor-pointer
                    transition-colors
                    hover:bg-emerald-50/60
                    ${
                      selectedId === risk.id
                        ? "bg-emerald-50"
                        : ""
                    }
                  `}
                >

                  {/* ==================================================
                      RISK ID
                  =================================================== */}

                  <td className="px-4 py-3 font-medium text-slate-700">
                    {risk.riskId || "-"}
                  </td>

                  {/* ==================================================
                      TITLE
                  =================================================== */}

                  <td className="max-w-[220px] truncate px-4 py-3 text-slate-700">
                    {risk.title || "-"}
                  </td>

                  {/* ==================================================
                      DEPARTMENT
                  =================================================== */}

                  <td className="px-4 py-3 text-slate-500">
                    {getDepartmentName(risk.department)}
                  </td>

                  {/* ==================================================
                      CATEGORY
                  =================================================== */}

                  <td className="px-4 py-3 text-slate-500">
                    {formatText(risk.category)}
                  </td>

                  {/* ==================================================
                      LEVEL
                  =================================================== */}

                  <td className="px-4 py-3">
                    <span
                      className={`
                        inline-flex
                        rounded-full
                        px-2.5
                        py-1
                        text-xs
                        font-semibold
                        ${
                          LEVEL_STYLES[risk.level] ||
                          "bg-slate-100 text-slate-600"
                        }
                      `}
                    >
                      {formatText(risk.level)}
                    </span>
                  </td>

                  {/* ==================================================
                      SCORE
                  =================================================== */}

                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {risk.riskScore ?? "-"}
                  </td>

                  {/* ==================================================
                      STATUS
                      READ-ONLY FOR RISK OFFICER
                  =================================================== */}

                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <StatusBadge
                      status={risk.status || "NEW"}
                      readOnly={true}
                    />
                  </td>

                  {/* ==================================================
                      ACTIONS
                      ONLY EDIT
                  =================================================== */}

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">

                      <motion.button
                        type="button"
                        whileHover={{
                          scale: 1.1,
                        }}
                        whileTap={{
                          scale: 0.9,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRisk(risk);
                        }}
                        title="Edit Risk"
                        className="
                          rounded-lg
                          border
                          border-slate-200
                          p-2
                          text-slate-400
                          transition
                          hover:border-emerald-200
                          hover:bg-emerald-50
                          hover:text-emerald-600
                        "
                      >
                        <Pencil size={14} />
                      </motion.button>

                    </div>
                  </td>

                </motion.tr>

              ))}

            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* ==========================================================
          EDIT RISK DRAWER
      =========================================================== */}

      <EditRiskDrawer
        risk={editingRisk}
        open={Boolean(editingRisk)}
        onClose={() => setEditingRisk(null)}
        onUpdated={(updated) => {
          onRiskUpdated(updated);
          setEditingRisk(null);
        }}
        onToast={onToast}
      />

    </LayoutGroup>
  );
}
