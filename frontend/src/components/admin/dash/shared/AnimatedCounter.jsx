// src/components/dashboard/shared/AnimatedCounter.jsx
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

/**
 * Counts from 0 -> value once it scrolls into view.
 * Usage: <AnimatedCounter value={1248} /> or value={78} suffix="%"
 */
export default function AnimatedCounter({
    value = 0,
    duration = 1.1,
    prefix = "",
    suffix = "",
    decimals = 0,
    className = "",
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-40px" });
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!isInView) return;

        const target = Number(value) || 0;
        const startTime = performance.now();

        const tick = (now) => {
            const progress = Math.min(
                (now - startTime) / (duration * 1000),
                1
            );
            // easeOutCubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(target * eased);

            if (progress < 1) {
                requestAnimationFrame(tick);
            } else {
                setDisplay(target);
            }
        };

        requestAnimationFrame(tick);
    }, [isInView, value, duration]);

    return (
        <motion.span
            ref={ref}
            className={className}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
        >
            {prefix}
            {display.toLocaleString("en-IN", {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
            })}
            {suffix}
        </motion.span>
    );
}