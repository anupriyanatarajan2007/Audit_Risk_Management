// src/components/dashboard/shared/ChartCard.jsx
import { motion } from "framer-motion";
import { ChartSkeleton } from "./Skeleton";
import EmptyState from "./EmptyState";

export default function ChartCard({
    title,
    subtitle,
    icon: Icon,
    headerRight,
    loading = false,
    isEmpty = false,
    error = null,
    onRetry,
    className = "",
    children,
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6 ${className}`}
        >
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    {Icon && (
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Icon size={18} strokeWidth={1.9} />
                        </div>
                    )}
                    <div>
                        <h3 className="text-[15px] font-semibold text-slate-800">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="mt-0.5 text-xs text-slate-400">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
                {headerRight && <div>{headerRight}</div>}
            </div>

            {loading ? (
                <ChartSkeleton />
            ) : error ? (
                <EmptyState
                    type="error"
                    title="Couldn't load this data"
                    description={error}
                    onRetry={onRetry}
                />
            ) : isEmpty ? (
                <EmptyState onRetry={onRetry} />
            ) : (
                children
            )}
        </motion.div>
    );
}