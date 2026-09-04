import React, { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const CountUp = ({ value, suffix = "" }) => {
  const [display, setDisplay] = useState(0);

  const motionVal = useMotionValue(0);

  const rounded = useTransform(
    motionVal,
    (v) => Math.round(v)
  );

  useEffect(() => {
    const controls = animate(
      motionVal,
      value,
      {
        duration: 1,
        ease: "easeOut",
      }
    );

    const unsub = rounded.on(
      "change",
      (v) => setDisplay(v)
    );

    return () => {
      controls.stop();
      unsub();
    };
  }, [value]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
};

/**
 * White background professional UI
 */

const accentMap = {
  teal: {
    ring: "group-hover:shadow-teal-100",
    icon:
      "text-teal-600 bg-teal-50 border-teal-200",
  },

  amber: {
    ring: "group-hover:shadow-amber-100",
    icon:
      "text-amber-600 bg-amber-50 border-amber-200",
  },

  rose: {
    ring: "group-hover:shadow-rose-100",
    icon:
      "text-rose-600 bg-rose-50 border-rose-200",
  },

  sky: {
    ring: "group-hover:shadow-sky-100",
    icon:
      "text-sky-600 bg-sky-50 border-sky-200",
  },
};

const ComplianceStatCard = ({
  icon: Icon,
  label,
  value,
  suffix = "",
  description,
  trend,
  accent = "teal",
  attention = false,
  subItems = [],
}) => {
  const styles =
    accentMap[accent] ?? accentMap.teal;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -4,
        scale: 1.015,
      }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
      className={`
        group
        relative
        rounded-[20px]
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        hover:shadow-lg
        transition-all
        duration-300
        ${styles.ring}
      `}
    >
      {/* Attention Indicator */}
      {attention && (
        <span className="absolute top-4 right-4 flex h-2.5 w-2.5">
          <span
            className="
              animate-ping
              absolute
              inline-flex
              h-full
              w-full
              rounded-full
              bg-rose-400
              opacity-50
            "
          />

          <span
            className="
              relative
              inline-flex
              rounded-full
              h-2.5
              w-2.5
              bg-rose-500
            "
          />
        </span>
      )}

      {/* Icon + Trend */}
      <div className="flex items-center justify-between mb-5">
        <div
          className={`
            h-11
            w-11
            rounded-xl
            border
            flex
            items-center
            justify-center
            transition-transform
            duration-300
            group-hover:scale-105
            ${styles.icon}
          `}
        >
          {Icon && <Icon size={19} />}
        </div>

        {trend && (
          <div
            className={`
              flex
              items-center
              gap-1
              text-xs
              font-semibold
              ${
                trend.direction === "up"
                  ? "text-emerald-600"
                  : "text-rose-600"
              }
            `}
          >
            {trend.direction === "up" ? (
              <TrendingUp size={13} />
            ) : (
              <TrendingDown size={13} />
            )}

            {trend.label}
          </div>
        )}
      </div>

      {/* Value */}
      <div
        className="
          text-[28px]
          font-bold
          text-slate-900
          leading-none
          mb-2
          tracking-tight
        "
      >
        <CountUp
          value={value}
          suffix={suffix}
        />
      </div>

      {/* Label */}
      <p
        className="
          text-sm
          font-semibold
          text-slate-700
        "
      >
        {label}
      </p>

      {/* Description */}
      {description && (
        <p
          className="
            text-[11px]
            text-slate-500
            mt-2
            leading-relaxed
          "
        >
          {description}
        </p>
      )}

      {/* Sub Items */}
      {subItems.length > 0 && (
        <div
          className="
            flex
            items-center
            gap-4
            mt-4
            pt-3
            border-t
            border-slate-100
          "
        >
          {subItems.map((item) => (
            <div
              key={item.label}
              className="
                text-[11px]
                text-slate-500
              "
            >
              <span
                className="
                  text-slate-900
                  font-semibold
                "
              >
                {item.value}
              </span>{" "}
              {item.label}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default ComplianceStatCard;