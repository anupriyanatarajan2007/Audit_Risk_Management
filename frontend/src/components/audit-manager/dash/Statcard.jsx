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
    Minus,
} from "lucide-react";
import { palette } from "./Theme";

// ============================================================
// COUNT-UP NUMBER
// ============================================================

const CountUp = ({
    value = 0,
    duration = 0.9,
}) => {
    const motionValue = useMotionValue(0);

    const rounded = useTransform(
        motionValue,
        (v) => Math.round(v).toLocaleString()
    );

    const [display, setDisplay] = useState("0");

    useEffect(() => {
        const controls = animate(
            motionValue,
            value,
            {
                duration,
                ease: "easeOut",
            }
        );

        const unsubscribe = rounded.on(
            "change",
            (v) => setDisplay(v)
        );

        return () => {
            controls.stop();
            unsubscribe();
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return <span>{display}</span>;
};

// ============================================================
// MINI SPARKLINE
// ============================================================

const Sparkline = ({
    points = [],
    color = palette.accent,
}) => {

    if (!points || points.length < 2) {
        return null;
    }

    const width = 72;
    const height = 24;

    const max = Math.max(
        ...points,
        1
    );

    const min = Math.min(
        ...points,
        0
    );

    const range =
        max - min || 1;

    const path = points
        .map((p, i) => {

            const x =
                (i /
                    (points.length - 1)) *
                width;

            const y =
                height -
                ((p - min) / range) *
                    height;

            return `${
                i === 0 ? "M" : "L"
            }${x.toFixed(1)},${y.toFixed(1)}`;

        })
        .join(" ");

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
        >
            <motion.path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{
                    pathLength: 0,
                    opacity: 0,
                }}
                animate={{
                    pathLength: 1,
                    opacity: 1,
                }}
                transition={{
                    duration: 0.8,
                    ease: "easeOut",
                }}
            />
        </svg>
    );
};

// ============================================================
// STAT CARD
// ============================================================

export const AuditManagerStatCard = ({
    icon: Icon,
    label,
    value,
    changePercent,
    comparisonText = "vs last month",
    accent = "teal",
    sparklineData,
}) => {

    const hasTrend =
        typeof changePercent === "number";

    const isPositive =
        hasTrend &&
        changePercent > 0;

    const isNegative =
        hasTrend &&
        changePercent < 0;

    const TrendIcon =
        isPositive
            ? TrendingUp
            : isNegative
            ? TrendingDown
            : Minus;

    // ========================================================
    // ACCENT COLOR
    // ========================================================

    const accentColor =
        accent === "danger"
            ? palette.critical
            : accent === "warning"
            ? palette.medium
            : accent === "success"
            ? palette.low
            : palette.accent;

    return (
        <motion.div
            whileHover={{
                y: -3,
                scale: 1.01,
            }}
            transition={{
                duration: 0.2,
                ease: "easeOut",
            }}
            className="
                relative
                overflow-hidden
                group
                bg-white
                border
                border-slate-200
                rounded-2xl
                shadow-sm
                hover:shadow-md
                p-5
                transition-shadow
            "
        >

            {/* ================================================= */}
            {/* DECORATIVE ACCENT */}
            {/* ================================================= */}

            <div
                className="
                    absolute
                    -right-6
                    -top-6
                    w-24
                    h-24
                    rounded-full
                    opacity-[0.07]
                    blur-xl
                    transition-opacity
                    group-hover:opacity-[0.12]
                "
                style={{
                    backgroundColor:
                        accentColor,
                }}
            />

            {/* ================================================= */}
            {/* CARD CONTENT */}
            {/* ================================================= */}

            <div className="
                relative
                flex
                items-start
                justify-between
            ">

                {/* LEFT CONTENT */}

                <div className="min-w-0">

                    {/* LABEL */}

                    <p className="
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-wider
                        text-slate-500
                    ">
                        {label}
                    </p>

                    {/* VALUE */}

                    <h3 className="
                        mt-2
                        text-3xl
                        font-bold
                        text-slate-800
                        tabular-nums
                    ">
                        <CountUp value={value} />
                    </h3>

                    {/* TREND */}

                    {hasTrend && (
                        <div className="
                            mt-2
                            flex
                            items-center
                            gap-1.5
                            text-xs
                        ">

                            <span
                                className="
                                    inline-flex
                                    items-center
                                    gap-0.5
                                    font-semibold
                                "
                                style={{
                                    color:
                                        isPositive
                                            ? palette.low
                                            : isNegative
                                            ? palette.critical
                                            : "#94A3B8",
                                }}
                            >

                                <TrendIcon
                                    className="
                                        w-3
                                        h-3
                                    "
                                />

                                {Math.abs(
                                    changePercent
                                )}
                                %

                            </span>

                            <span className="
                                text-slate-400
                            ">
                                {comparisonText}
                            </span>

                        </div>
                    )}

                </div>

                {/* RIGHT CONTENT */}

                <div className="
                    flex
                    flex-col
                    items-end
                    gap-2
                    shrink-0
                ">

                    {/* ICON */}

                    <div
                        className="
                            w-10
                            h-10
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            border
                        "
                        style={{
                            backgroundColor:
                                `${accentColor}12`,
                            borderColor:
                                `${accentColor}25`,
                            color:
                                accentColor,
                        }}
                    >
                        {Icon && (
                            <Icon
                                className="
                                    w-[18px]
                                    h-[18px]
                                "
                                strokeWidth={2}
                            />
                        )}
                    </div>

                    {/* SPARKLINE */}

                    {sparklineData && (
                        <Sparkline
                            points={
                                sparklineData
                            }
                            color={
                                accentColor
                            }
                        />
                    )}

                </div>

            </div>

        </motion.div>
    );
};

export default AuditManagerStatCard;
