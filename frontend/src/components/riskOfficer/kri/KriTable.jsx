import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
  FiInbox,
} from "react-icons/fi";

import StatusBadge from "./StatusBadge";
import {
  formatDate,
  readableEnum,
} from "../../../utils/kriHelpers";

// ============================================================
// ROW ANIMATION
// ============================================================

const rowVariants = {
  hidden: {
    opacity: 0,
    x: -12,
  },

  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: Math.min(i * 0.03, 0.3),
      duration: 0.25,
    },
  }),
};

// ============================================================
// PAGINATION
// ============================================================

const PAGE_SIZE = 8;

// ============================================================
// TABLE SKELETON
// ============================================================

function TableSkeleton() {
  return (
    <div className="space-y-2 rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur-xl">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-11 animate-pulse rounded-lg bg-slate-100"
          style={{
            animationDelay: `${i * 60}ms`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/70 py-16 backdrop-blur-xl">
      <motion.div
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="mb-3 rounded-full bg-slate-100 p-4"
      >
        <FiInbox
          className="text-slate-400"
          size={28}
        />
      </motion.div>

      <p className="text-sm font-medium text-slate-500">
        No KRIs found
      </p>

      <p className="text-xs text-slate-400">
        Try adjusting your filters or create a new KRI.
      </p>
    </div>
  );
}

// ============================================================
// SAFE READABLE ENUM
// ============================================================

const safeReadableEnum = (value) => {
  if (value === null || value === undefined) {
    return "—";
  }

  /*
   * Department object:
   *
   * {
   *   id: 3,
   *   name: "Information Technology"
   * }
   *
   * or:
   *
   * {
   *   departmentName: "Information Technology"
   * }
   */

  if (typeof value === "object") {
    const objectValue =
      value.name ??
      value.departmentName ??
      value.label ??
      value.code ??
      value.value ??
      "";

    if (!objectValue) {
      return "—";
    }

    return readableEnum(String(objectValue));
  }

  return readableEnum(String(value));
};

// ============================================================
// KRI TABLE
// ============================================================

export default function KriTable({
  kris,
  loading,
  onView,
  onEdit,
  onDelete,
  onStatusChanged,
  searchTerm,
}) {
  const [sortField, setSortField] =
    useState("kriName");

  const [sortDir, setSortDir] =
    useState("asc");

  const [page, setPage] =
    useState(1);

  // ============================================================
  // GET RISK NAME
  // ============================================================

  const getRiskName = (kri) => {
    if (!kri) {
      return "—";
    }

    // Direct risk name
    if (
      typeof kri.riskName === "string" &&
      kri.riskName.trim()
    ) {
      return kri.riskName;
    }

    // Nested Risk object
    if (kri.risk) {
      if (kri.risk.title) {
        return String(kri.risk.title);
      }

      if (kri.risk.riskName) {
        return String(kri.risk.riskName);
      }

      if (kri.risk.name) {
        return String(kri.risk.name);
      }

      if (kri.risk.riskId) {
        return String(kri.risk.riskId);
      }
    }

    // Risk ID only
    if (
      kri.riskId !== null &&
      kri.riskId !== undefined &&
      kri.riskId !== ""
    ) {
      return `Risk #${kri.riskId}`;
    }

    return "—";
  };

  // ============================================================
  // SORTING
  // ============================================================

  const sorted = useMemo(() => {
    const copy = Array.isArray(kris)
      ? [...kris]
      : [];

    copy.sort((a, b) => {
      let va;
      let vb;

      // --------------------------------------------------------
      // RISK
      // --------------------------------------------------------

      if (sortField === "riskName") {
        va = getRiskName(a);
        vb = getRiskName(b);
      }

      // --------------------------------------------------------
      // DEPARTMENT
      // --------------------------------------------------------

      else if (
        sortField === "department"
      ) {
        va =
          a?.department?.name ??
          a?.department?.departmentName ??
          a?.department ??
          "";

        vb =
          b?.department?.name ??
          b?.department?.departmentName ??
          b?.department ??
          "";

        if (
          typeof va === "object"
        ) {
          va =
            va.name ??
            va.departmentName ??
            va.label ??
            "";
        }

        if (
          typeof vb === "object"
        ) {
          vb =
            vb.name ??
            vb.departmentName ??
            vb.label ??
            "";
        }
      }

      // --------------------------------------------------------
      // NORMAL FIELDS
      // --------------------------------------------------------

      else {
        va = a?.[sortField] ?? "";
        vb = b?.[sortField] ?? "";
      }

      // --------------------------------------------------------
      // NUMERIC
      // --------------------------------------------------------

      if (
        typeof va === "number" &&
        typeof vb === "number"
      ) {
        return sortDir === "asc"
          ? va - vb
          : vb - va;
      }

      // --------------------------------------------------------
      // STRING
      // --------------------------------------------------------

      const stringA =
        String(va ?? "").toLowerCase();

      const stringB =
        String(vb ?? "").toLowerCase();

      if (stringA < stringB) {
        return sortDir === "asc"
          ? -1
          : 1;
      }

      if (stringA > stringB) {
        return sortDir === "asc"
          ? 1
          : -1;
      }

      return 0;
    });

    return copy;
  }, [
    kris,
    sortField,
    sortDir,
  ]);

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      sorted.length / PAGE_SIZE
    )
  );

  const safePage = Math.min(
    page,
    totalPages
  );

  const pageData = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  // ============================================================
  // SORT TOGGLE
  // ============================================================

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) =>
        d === "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortField(field);
      setSortDir("asc");
    }

    setPage(1);
  };

  // ============================================================
  // SEARCH HIGHLIGHT
  // ============================================================

  const highlight = (text) => {
    if (
      !searchTerm ||
      text === null ||
      text === undefined
    ) {
      return text ?? "—";
    }

    const stringText =
      String(text);

    const idx =
      stringText
        .toLowerCase()
        .indexOf(
          String(searchTerm).toLowerCase()
        );

    if (idx === -1) {
      return stringText;
    }

    return (
      <>
        {stringText.slice(0, idx)}

        <mark className="rounded bg-amber-200/70 px-0.5">
          {stringText.slice(
            idx,
            idx +
              String(searchTerm).length
          )}
        </mark>

        {stringText.slice(
          idx +
            String(searchTerm).length
        )}
      </>
    );
  };

  // ============================================================
  // TABLE HEADER
  // ============================================================

  const Th = ({
    field,
    children,
    align = "left",
  }) => (
    <th
      onClick={() =>
        field &&
        toggleSort(field)
      }
      className={`px-4 py-3 text-${align} text-xs font-semibold uppercase tracking-wide text-slate-500 ${
        field
          ? "cursor-pointer select-none hover:text-slate-700"
          : ""
      }`}
    >
      <span
        className={`flex items-center gap-1 ${
          align === "right"
            ? "justify-end"
            : ""
        }`}
      >
        {children}

        {field &&
          sortField === field &&
          (sortDir === "asc" ? (
            <FiChevronUp size={13} />
          ) : (
            <FiChevronDown size={13} />
          ))}
      </span>
    </th>
  );

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return <TableSkeleton />;
  }

  // ============================================================
  // EMPTY
  // ============================================================

  if (
    !kris ||
    kris.length === 0
  ) {
    return <EmptyState />;
  }

  // ============================================================
  // TABLE
  // ============================================================

  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 shadow-sm backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">

          {/* ==================================================
              HEADER
          ================================================== */}

          <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
            <tr>

              <Th field="kriId">
                KRI ID
              </Th>

              <Th field="kriName">
                Name
              </Th>

              <Th field="riskName">
                Risk
              </Th>

              <Th field="department">
                Department
              </Th>

              <Th field="riskCategory">
                Category
              </Th>

              <Th field="currentValue">
                Value
              </Th>

              <Th>
                Threshold
              </Th>

              <Th field="status">
                Status
              </Th>

              <Th field="ownerId">
                Owner
              </Th>

              <Th field="updatedAt">
                Last Updated
              </Th>

              <Th align="right">
                Actions
              </Th>

            </tr>
          </thead>

          {/* ==================================================
              BODY
          ================================================== */}

          <tbody>
            <AnimatePresence mode="popLayout">

              {pageData.map(
                (k, i) => {

                  const riskName =
                    getRiskName(k);

                  const departmentName =
                    safeReadableEnum(
                      k?.department
                    );

                  const categoryName =
                    safeReadableEnum(
                      k?.riskCategory
                    );

                  return (
                    <motion.tr
                      key={
                        k?.id ??
                        k?.kriId ??
                        `kri-${i}`
                      }
                      custom={i}
                      variants={
                        rowVariants
                      }
                      initial="hidden"
                      animate="visible"
                      exit={{
                        opacity: 0,
                      }}
                      layout
                      className="border-t border-slate-100 hover:bg-indigo-50/40"
                    >

                      {/* ======================================
                          KRI ID
                      ====================================== */}

                      <td className="px-4 py-3 text-sm font-medium text-slate-700">
                        {highlight(
                          k?.kriId
                        )}
                      </td>

                      {/* ======================================
                          NAME
                      ====================================== */}

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {highlight(
                          k?.kriName
                        )}
                      </td>

                      {/* ======================================
                          RISK
                      ====================================== */}

                      <td className="px-4 py-3">
                        <div className="max-w-[240px]">

                          <p
                            className="truncate text-sm font-medium text-slate-700"
                            title={riskName}
                          >
                            {highlight(
                              riskName
                            )}
                          </p>

                          {k?.riskId !==
                            null &&
                            k?.riskId !==
                              undefined && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                Risk ID:{" "}
                                {
                                  k.riskId
                                }
                              </p>
                            )}

                        </div>
                      </td>

                      {/* ======================================
                          DEPARTMENT
                      ====================================== */}

                      <td className="px-4 py-3 text-sm text-slate-500">
                        {departmentName}
                      </td>

                      {/* ======================================
                          CATEGORY
                      ====================================== */}

                      <td className="px-4 py-3 text-sm text-slate-500">
                        {categoryName}
                      </td>

                      {/* ======================================
                          CURRENT VALUE
                      ====================================== */}

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {k?.currentValue ??
                          "—"}

                        {k?.unit ===
                          "PERCENTAGE" &&
                          k?.currentValue !==
                            null &&
                          k?.currentValue !==
                            undefined &&
                          "%"}
                      </td>

                      {/* ======================================
                          THRESHOLD
                      ====================================== */}

                      <td className="px-4 py-3 text-xs text-slate-400">
                        <div className="whitespace-nowrap">

                          <span className="text-emerald-600">
                            G
                          </span>{" "}
                          {k?.greenThreshold ??
                            "—"}

                          {" · "}

                          <span className="text-amber-600">
                            A
                          </span>{" "}
                          {k?.amberThreshold ??
                            "—"}

                          {" · "}

                          <span className="text-rose-600">
                            R
                          </span>{" "}
                          {k?.redThreshold ??
                            "—"}

                        </div>
                      </td>

                      {/* ======================================
                          STATUS
                      ====================================== */}

                      <td className="px-4 py-3">
                        <StatusBadge
                          id={k?.id}
                          status={k?.status}
                          onChanged={
                            onStatusChanged
                          }
                        />
                      </td>

                      {/* ======================================
                          OWNER
                      ====================================== */}

                      <td className="px-4 py-3 text-sm text-slate-500">
                        {k?.ownerName ??
                          k?.owner?.name ??
                          k?.owner?.email ??
                          k?.ownerId ??
                          "—"}
                      </td>

                      {/* ======================================
                          LAST UPDATED
                      ====================================== */}

                      <td className="px-4 py-3 text-sm text-slate-500">
                        {formatDate(
                          k?.updatedAt ||
                            k?.createdAt
                        )}
                      </td>

                      {/* ======================================
                          ACTIONS
                      ====================================== */}

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">

                          {/* VIEW */}

                          <button
                            type="button"
                            onClick={() =>
                              onView(k)
                            }
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                            title="View"
                          >
                            <FiEye
                              size={15}
                            />
                          </button>

                          {/* EDIT */}

                          <button
                            type="button"
                            onClick={() =>
                              onEdit(k)
                            }
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                            title="Edit"
                          >
                            <FiEdit2
                              size={15}
                            />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            onClick={() => {

                              console.log(
                                "DELETE KRI:",
                                k
                              );

                              if (
                                !k?.id
                              ) {
                                console.error(
                                  "Invalid KRI database ID:",
                                  k
                                );

                                return;
                              }

                              onDelete(
                                k.id
                              );
                            }}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
                            title="Delete"
                          >
                            <FiTrash2
                              size={15}
                            />
                          </button>

                        </div>
                      </td>

                    </motion.tr>
                  );
                }
              )}

            </AnimatePresence>
          </tbody>

        </table>
      </div>

      {/* ======================================================
          PAGINATION
      ====================================================== */}

      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">

        <span>
          Showing{" "}
          {sorted.length === 0
            ? 0
            : (safePage - 1) *
                PAGE_SIZE +
              1}
          –
          {Math.min(
            safePage *
              PAGE_SIZE,
            sorted.length
          )}{" "}
          of {sorted.length}
        </span>

        <div className="flex gap-1">

          <button
            type="button"
            disabled={
              safePage === 1
            }
            onClick={() =>
              setPage(
                safePage - 1
              )
            }
            className="rounded-lg px-3 py-1 hover:bg-slate-100 disabled:opacity-30"
          >
            Prev
          </button>

          <span className="rounded-lg bg-slate-50 px-3 py-1">
            {safePage} /{" "}
            {totalPages}
          </span>

          <button
            type="button"
            disabled={
              safePage ===
              totalPages
            }
            onClick={() =>
              setPage(
                safePage + 1
              )
            }
            className="rounded-lg px-3 py-1 hover:bg-slate-100 disabled:opacity-30"
          >
            Next
          </button>

        </div>
      </div>
    </div>
  );
}
