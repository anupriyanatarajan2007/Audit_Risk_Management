import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiLoader } from "react-icons/fi";
import toast from "react-hot-toast";

import {
  KRI_STATUS,
  STATUS_META,
} from "../../../constants/KriEnums";

import KriService from "../../../service/KriService";

export default function StatusBadge({
  id,
  status,
  onChanged,
  interactive = true,
}) {
  const [updating, setUpdating] = useState(false);
  const [open, setOpen] = useState(false);

  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
  });

  const meta =
    STATUS_META[status] || STATUS_META.GREEN;

  // ============================================================
  // CALCULATE DROPDOWN POSITION
  // ============================================================

  const calculatePosition = () => {
    if (!buttonRef.current) return;

    const rect =
      buttonRef.current.getBoundingClientRect();

    const dropdownWidth = 160;
    const dropdownHeight =
      KRI_STATUS.length * 40 + 45;

    let left = rect.left;

    /*
     * Default:
     * Show dropdown ABOVE the status badge
     */

    let top =
      rect.top -
      dropdownHeight -
      8;

    // ==========================================================
    // IF NOT ENOUGH SPACE ABOVE
    // SHOW BELOW
    // ==========================================================

    if (top < 10) {
      top = rect.bottom + 8;
    }

    // ==========================================================
    // PREVENT RIGHT OVERFLOW
    // ==========================================================

    if (
      left + dropdownWidth >
      window.innerWidth - 10
    ) {
      left =
        window.innerWidth -
        dropdownWidth -
        10;
    }

    // ==========================================================
    // PREVENT LEFT OVERFLOW
    // ==========================================================

    if (left < 10) {
      left = 10;
    }

    setPosition({
      top,
      left,
    });
  };

  // ============================================================
  // TOGGLE
  // ============================================================

  const toggleDropdown = () => {
    if (!interactive || updating) {
      return;
    }

    if (!open) {
      calculatePosition();
    }

    setOpen((previous) => !previous);
  };

  // ============================================================
  // UPDATE POSITION ON SCROLL / RESIZE
  // ============================================================

  useEffect(() => {
    if (!open) return;

    const handlePositionUpdate = () => {
      calculatePosition();
    };

    window.addEventListener(
      "scroll",
      handlePositionUpdate,
      true
    );

    window.addEventListener(
      "resize",
      handlePositionUpdate
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handlePositionUpdate,
        true
      );

      window.removeEventListener(
        "resize",
        handlePositionUpdate
      );
    };
  }, [open]);

  // ============================================================
  // OUTSIDE CLICK
  // ============================================================

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event) => {
      const clickedButton =
        buttonRef.current?.contains(
          event.target
        );

      const clickedDropdown =
        dropdownRef.current?.contains(
          event.target
        );

      if (
        !clickedButton &&
        !clickedDropdown
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, [open]);

  // ============================================================
  // STATUS UPDATE
  // ============================================================

  const handleChange = async (newStatus) => {
    setOpen(false);

    if (newStatus === status) {
      return;
    }

    setUpdating(true);

    try {
      await KriService.updateKriStatus(
        id,
        newStatus
      );

      toast.success(
        `Status updated to ${
          STATUS_META[newStatus]?.label ||
          newStatus
        }`
      );

      onChanged?.();
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to update status"
      );
    } finally {
      setUpdating(false);
    }
  };

  // ============================================================
  // DROPDOWN
  // ============================================================

  const dropdown = (
    <AnimatePresence>
      {open && interactive && (
        <>
          {/* ==================================================
              INVISIBLE BACKDROP
          ================================================== */}

          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setOpen(false)}
          />

          {/* ==================================================
              STATUS DROPDOWN
          ================================================== */}

          <motion.div
            ref={dropdownRef}
            initial={{
              opacity: 0,
              scale: 0.94,
              y: 5,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.94,
              y: 5,
            }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
            }}
            className="
              z-[9999]
              w-[160px]
              overflow-hidden
              rounded-xl
              border
              border-slate-200
              bg-white
              p-1.5
              shadow-2xl
            "
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="px-2.5 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Change Status
              </p>
            </div>

            {/* =================================================
                STATUS OPTIONS
            ================================================= */}

            {KRI_STATUS.map((s) => {
              const statusMeta =
                STATUS_META[s] ||
                STATUS_META.GREEN;

              const isCurrent =
                s === status;

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    handleChange(s)
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    gap-2.5
                    rounded-lg
                    px-2.5
                    py-2.5
                    text-left
                    text-xs
                    transition-all
                    ${
                      isCurrent
                        ? "bg-slate-100 font-semibold text-slate-800"
                        : "text-slate-600 hover:bg-slate-50"
                    }
                  `}
                >
                  {/* STATUS DOT */}

                  <span
                    className={`
                      h-2
                      w-2
                      shrink-0
                      rounded-full
                      ${statusMeta.dot}
                    `}
                  />

                  {/* STATUS NAME */}

                  <span className="flex-1">
                    {statusMeta.label}
                  </span>

                  {/* CURRENT */}

                  {isCurrent && (
                    <span className="text-[9px] font-medium text-slate-400">
                      Current
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <>
      {/* ========================================================
          STATUS BADGE
      ======================================================== */}

      <div className="inline-block">
        <button
          ref={buttonRef}
          type="button"
          disabled={
            !interactive || updating
          }
          onClick={toggleDropdown}
          className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            px-2.5
            py-1
            text-xs
            font-medium
            ring-1
            transition

            ${meta.bg}
            ${meta.text}
            ${meta.ring}

            ${
              interactive
                ? "cursor-pointer hover:brightness-95"
                : "cursor-default"
            }
          `}
        >
          <AnimatePresence mode="wait">
            {updating ? (
              <motion.span
                key="loading"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
              >
                <FiLoader
                  className="animate-spin"
                  size={11}
                />
              </motion.span>
            ) : (
              <motion.span
                key={status}
                initial={{
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                exit={{
                  scale: 0,
                  opacity: 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 18,
                }}
                className={`
                  h-1.5
                  w-1.5
                  rounded-full
                  ${meta.dot}
                  ${
                    status === "RED"
                      ? "animate-pulse"
                      : ""
                  }
                `}
              />
            )}
          </AnimatePresence>

          <motion.span
            key={`label-${status}`}
            initial={{
              opacity: 0,
              x: -4,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
          >
            {meta.label}
          </motion.span>
        </button>
      </div>

      {/* ========================================================
          PORTAL
          
          This makes dropdown escape:
          - table overflow
          - horizontal scroll
          - motion transforms
          - parent z-index
      ======================================================== */}

      {typeof document !== "undefined" &&
        createPortal(
          dropdown,
          document.body
        )}
    </>
  );
}