import { motion } from "framer-motion";
import {
  Eye,
  Trash2,
  RefreshCw,
  ClipboardX,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AuditeeAssignmentStatusBadge from "./AuditeeAssignmentStatusBadge";

const STATUS_OPTIONS = [
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "OVERDUE",
  "CANCELLED",
];

const rowVariants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
    },
  },
};

// ============================================================
// INITIALS
// ============================================================

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("") || "?";

// ============================================================
// SKELETON ROW
// ============================================================

const SkeletonRow = () => (
  <tr className="border-b border-gray-100">
    {Array.from({ length: 10 }).map((_, index) => (
      <td key={index} className="px-4 py-4">
        <div className="h-4 bg-gray-100 rounded animate-pulse w-20" />
      </td>
    ))}
  </tr>
);

// ============================================================
// STATUS DROPDOWN
// ============================================================

const StatusDropdown = ({ current, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 180,
  });

  const buttonRef = useRef(null);

  // ----------------------------------------------------------
  // CLOSE WHEN SCROLLING
  // ----------------------------------------------------------

  useEffect(() => {
    if (!open) return;

    const handleScroll = () => {
      setOpen(false);
    };

    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  // ----------------------------------------------------------
  // OPEN DROPDOWN
  // ----------------------------------------------------------

  const handleOpen = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (disabled) {
      return;
    }

    const rect = buttonRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setPosition({
      top: rect.bottom + 6,
      left: rect.right - 180,
      width: 180,
    });

    setOpen((prev) => !prev);
  };

  // ----------------------------------------------------------
  // SELECT STATUS
  // ----------------------------------------------------------

  const handleStatusSelect = (status) => {
    console.log("=================================");
    console.log("STATUS SELECTED");
    console.log("Current:", current);
    console.log("New:", status);
    console.log("=================================");

    setOpen(false);

    if (status === current) {
      return;
    }

    // IMPORTANT
    onChange(status);
  };

  return (
    <>
      {/* ======================================================
          STATUS BUTTON
      ====================================================== */}

      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className="
          inline-flex
          items-center
          justify-center
          gap-2
          min-w-[120px]
          px-3
          py-2
          rounded-lg
          border
          border-gray-200
          bg-white
          text-gray-700
          text-xs
          font-medium
          hover:bg-gray-50
          hover:border-teal-300
          transition
          disabled:opacity-50
          disabled:cursor-not-allowed
        "
      >
        <span>
          {current
            ? current.replaceAll("_", " ")
            : "Update"}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ======================================================
          DROPDOWN PORTAL
      ====================================================== */}

      {open &&
        createPortal(
          <>
            {/* Outside click layer */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setOpen(false)}
            />

            {/* Dropdown */}
            <div
              className="
                fixed
                z-[9999]
                bg-white
                border
                border-gray-200
                rounded-xl
                shadow-2xl
                overflow-hidden
              "
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                width: `${position.width}px`,
              }}
            >
              {/* Header */}
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                  Change Status
                </p>
              </div>

              {/* Options */}
              {STATUS_OPTIONS.map((status) => {
                const isCurrent = status === current;

                return (
                  <button
                    key={status}
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      handleStatusSelect(status);
                    }}
                    className={`
                      w-full
                      flex
                      items-center
                      justify-between
                      px-4
                      py-3
                      text-left
                      text-xs
                      font-medium
                      transition
                      ${
                        isCurrent
                          ? "bg-teal-50 text-teal-700"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <span>
                      {status.replaceAll("_", " ")}
                    </span>

                    {isCurrent && (
                      <span className="text-teal-600 font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>,
          document.body
        )}
    </>
  );
};

// ============================================================
// TABLE
// ============================================================

const AuditeeAssignmentTable = ({
  assignments,
  loading,
  error,
  onRetry,
  onView,
  onDelete,
  onStatusChange,
  onAssignClick,
}) => {
  const columns = [
    "Audit ID",
    "Audit Name",
    "Auditee",
    "Employee ID",
    "Email",
    "Assigned Date",
    "Start Date",
    "Due Date",
    "Status",
  ];

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <ClipboardX className="w-6 h-6 text-red-500" />
        </div>

        <h3 className="mt-4 text-base font-semibold text-gray-900">
          Unable to load assignments
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Something went wrong while fetching auditee assignments.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="
            mt-5
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            rounded-xl
            bg-teal-600
            text-white
            text-sm
            font-medium
            hover:bg-teal-700
            transition
          "
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  // ==========================================================
  // EMPTY
  // ==========================================================

  if (!loading && assignments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <ClipboardX className="w-6 h-6 text-gray-400" />
        </div>

        <h3 className="mt-5 text-base font-semibold text-gray-900">
          No Auditee Assignments Found
        </h3>

        <p className="mt-1 text-sm text-gray-500">
          Assign an auditee to an audit to get started.
        </p>

        <button
          type="button"
          onClick={onAssignClick}
          className="
            mt-5
            inline-flex
            items-center
            gap-2
            px-4
            py-2.5
            rounded-xl
            bg-teal-600
            text-white
            text-sm
            font-medium
            hover:bg-teal-700
            transition
            shadow-sm
          "
        >
          + Assign Auditee
        </button>
      </div>
    );
  }

  // ==========================================================
  // TABLE
  // ==========================================================

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

      {/* Horizontal Scroll */}
      <div className="overflow-x-auto">

        <table className="w-full min-w-[1350px] text-sm">

          {/* ==================================================
              HEADER
          ================================================== */}

          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="
                    px-4
                    py-3.5
                    text-left
                    text-xs
                    font-semibold
                    text-gray-500
                    whitespace-nowrap
                  "
                >
                  {column}
                </th>
              ))}

              <th
                className="
                  px-4
                  py-3.5
                  text-center
                  text-xs
                  font-semibold
                  text-gray-500
                  whitespace-nowrap
                "
              >
                Actions
              </th>
            </tr>
          </thead>

          {/* ==================================================
              BODY
          ================================================== */}

          <tbody>

            {/* LOADING */}

            {loading &&
              Array.from({ length: 5 }).map((_, index) => (
                <SkeletonRow key={index} />
              ))}

            {/* DATA */}

            {!loading &&
              assignments.map((a, idx) => (
                <motion.tr
                  key={a.id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="show"
                  transition={{
                    delay: idx * 0.03,
                  }}
                  className="
                    border-b
                    border-gray-100
                    hover:bg-teal-50/40
                    transition-colors
                  "
                >

                  {/* ==================================================
                      AUDIT ID
                  ================================================== */}

                  <td className="px-4 py-4 text-gray-800 font-medium whitespace-nowrap">
                    {a.audit?.auditId || "—"}
                  </td>

                  {/* ==================================================
                      AUDIT NAME
                  ================================================== */}

                  <td className="px-4 py-4 text-gray-800 whitespace-nowrap">
                    {a.audit?.auditName || "—"}
                  </td>

                  {/* ==================================================
                      AUDITEE
                  ================================================== */}

                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">

                      <div
                        className="
                          w-9
                          h-9
                          rounded-full
                          bg-teal-100
                          text-teal-700
                          flex
                          items-center
                          justify-center
                          text-xs
                          font-semibold
                        "
                      >
                        {initials(a.auditee?.name)}
                      </div>

                      <span className="text-gray-800 font-medium">
                        {a.auditee?.name || "Unknown"}
                      </span>

                    </div>
                  </td>

                  {/* ==================================================
                      EMPLOYEE ID
                  ================================================== */}

                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                    {a.auditee?.employeeId || "—"}
                  </td>

                  {/* ==================================================
                      EMAIL
                  ================================================== */}

                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                    {a.auditee?.email || "—"}
                  </td>

                  {/* ==================================================
                      ASSIGNED DATE
                  ================================================== */}

                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                    {a.assignedDate || "—"}
                  </td>

                  {/* ==================================================
                      START DATE
                  ================================================== */}

                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                    {a.startDate || "—"}
                  </td>

                  {/* ==================================================
                      DUE DATE
                  ================================================== */}

                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                    {a.dueDate || "—"}
                  </td>

                  {/* ==================================================
                      CURRENT STATUS
                  ================================================== */}

                  <td className="px-4 py-4 whitespace-nowrap">
                    <AuditeeAssignmentStatusBadge
                      status={a.status}
                    />
                  </td>

                  {/* ==================================================
                      ACTIONS
                  ================================================== */}

                  <td className="px-4 py-4 whitespace-nowrap">

                    <div className="flex items-center justify-center gap-2">

                      {/* VIEW */}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(a);
                        }}
                        className="
                          w-9
                          h-9
                          flex
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-gray-200
                          text-gray-500
                          hover:bg-teal-50
                          hover:text-teal-700
                          hover:border-teal-300
                          transition
                        "
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* ==================================================
                          UPDATE STATUS
                      ================================================== */}

                      <StatusDropdown
                        current={a.status}
                        disabled={loading}
                        onChange={(newStatus) => {
                          console.log(
                            "================================="
                          );

                          console.log(
                            "TABLE → STATUS CHANGE"
                          );

                          console.log(
                            "Assignment ID:",
                            a.id
                          );

                          console.log(
                            "Old Status:",
                            a.status
                          );

                          console.log(
                            "New Status:",
                            newStatus
                          );

                          console.log(
                            "================================="
                          );

                          // THIS IS THE IMPORTANT LINE
                          onStatusChange(
                            a.id,
                            newStatus
                          );
                        }}
                      />

                      {/* DELETE */}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(a);
                        }}
                        className="
                          w-9
                          h-9
                          flex
                          items-center
                          justify-center
                          rounded-lg
                          border
                          border-gray-200
                          text-gray-500
                          hover:bg-red-50
                          hover:text-red-600
                          hover:border-red-300
                          transition
                        "
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>

                  </td>

                </motion.tr>
              ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default AuditeeAssignmentTable;