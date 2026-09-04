import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

import {
  STATUSES,
  getStatusStyle,
} from "../../utils/riskEnums";

import { useClickOutside } from "../../hooks/useClickOutside";
import { useEscapeKey } from "../../hooks/useEscapeKey";

export default function StatusBadge({
  status,
  onRequestChange,
  disabled = false,
  readOnly = false,
}) {
  const [open, setOpen] = useState(false);

  const ref = useRef(null);

  const style = getStatusStyle(status);

  // ============================================================
  // CLOSE DROPDOWN
  // ============================================================

  useClickOutside(
    ref,
    () => setOpen(false),
    open
  );

  useEscapeKey(
    () => setOpen(false),
    open
  );

  // ============================================================
  // STATUS SELECT
  // ============================================================

  const handleSelect = (next) => {
    setOpen(false);

    if (next === status) return;

    if (onRequestChange) {
      onRequestChange(next);
    }
  };

  // ============================================================
  // READ ONLY BADGE
  // ============================================================

  if (readOnly) {
    return (
      <div
        className="
          inline-flex
          items-center
          rounded-full
        "
      >
        <span
          className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            px-2.5
            py-1
            text-xs
            font-semibold
            ring-1
            ${style.bg}
            ${style.text}
            ${style.ring}
          `}
        >
          <motion.span
            className={`
              h-1.5
              w-1.5
              rounded-full
              ${style.dot}
            `}
            animate={{
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />

          {style.label}
        </span>
      </div>
    );
  }

  // ============================================================
  // DROPDOWN MODE
  // Used by Audit Manager
  // ============================================================

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onClick={(e) => e.stopPropagation()}
    >
      <motion.button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        whileHover={{
          scale: disabled ? 1 : 1.04,
        }}
        whileTap={{
          scale: disabled ? 1 : 0.96,
        }}
        className={`
          inline-flex
          items-center
          gap-1.5
          rounded-full
          px-2.5
          py-1
          text-xs
          font-semibold
          ring-1

          ${style.bg}
          ${style.text}
          ${style.ring}

          ${
            disabled
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:brightness-95"
          }
        `}
      >

        <motion.span
          className={`
            h-1.5
            w-1.5
            rounded-full
            ${style.dot}
          `}
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />

        {style.label}

        <ChevronDown
          size={12}
          className={`
            transition-transform
            ${open ? "rotate-180" : ""}
          `}
        />

      </motion.button>

      {/* ========================================================
          DROPDOWN
      ========================================================= */}

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.92,
              y: -6,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.92,
              y: -6,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 28,
            }}
            className="
              absolute
              left-0
              z-50
              mt-2
              w-48
              origin-top-left
              overflow-hidden
              rounded-xl
              border
              border-slate-200
              bg-white
              shadow-xl
            "
          >
            {STATUSES.map((s, i) => {
              const st = getStatusStyle(s.value);

              const active =
                s.value === status;

              return (
                <motion.button
                  key={s.value}
                  type="button"
                  onClick={() =>
                    handleSelect(s.value)
                  }
                  initial={{
                    opacity: 0,
                    x: -6,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: i * 0.03,
                  }}
                  whileHover={{
                    backgroundColor:
                      "rgba(15,23,42,0.04)",
                  }}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    gap-2
                    px-3
                    py-2
                    text-left
                    text-xs
                    text-slate-700
                  "
                >
                  <span className="flex items-center gap-2">

                    <span
                      className={`
                        h-1.5
                        w-1.5
                        rounded-full
                        ${st.dot}
                      `}
                    />

                    {st.label}

                  </span>

                  {active && (
                    <Check
                      size={13}
                      className="text-emerald-600"
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}