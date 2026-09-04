import React from "react";
import { motion } from "framer-motion";
import {
    AlertTriangle,
    RefreshCw,
    Inbox,
} from "lucide-react";
import { glassPanel } from "./Theme";

// ============================================================
// SHIMMER — LIGHT THEME
// ============================================================

const Shimmer = ({ className = "", style }) => (
    <div
        style={style}
        className={`
            relative
            overflow-hidden
            rounded-lg
            bg-slate-100
            ${className}
        `}
    >
        <motion.div
            className="
                absolute
                inset-0
                -translate-x-full
                bg-gradient-to-r
                from-transparent
                via-white
                to-transparent
            "
            animate={{
                translateX: ["-100%", "100%"],
            }}
            transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "linear",
            }}
        />
    </div>
);

// ============================================================
// KPI CARD SKELETON
// ============================================================

export const StatCardSkeleton = () => (
    <div
        className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            shadow-sm
            p-5
        "
    >
        <div className="flex items-start justify-between">

            <div className="flex-1 space-y-3">

                <Shimmer className="h-3 w-24" />

                <Shimmer className="h-7 w-16" />

                <Shimmer className="h-3 w-20" />

            </div>

            <Shimmer
                className="
                    h-10
                    w-10
                    rounded-xl
                    shrink-0
                "
            />

        </div>
    </div>
);

// ============================================================
// CHART SKELETON
// ============================================================

export const ChartSkeleton = ({
    height = 280,
}) => (
    <div
        className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            shadow-sm
            p-5
        "
    >
        <Shimmer
            className="h-4 w-40 mb-4"
        />

        <Shimmer
            className="w-full"
            style={{ height }}
        />
    </div>
);

// ============================================================
// LIST / TABLE SKELETON
// ============================================================

export const ListSkeleton = ({
    rows = 4,
}) => (
    <div
        className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            shadow-sm
            p-5
            space-y-3
        "
    >
        <Shimmer
            className="h-4 w-40 mb-2"
        />

        {Array.from({
            length: rows,
        }).map((_, i) => (
            <Shimmer
                key={i}
                className="h-14 w-full"
            />
        ))}
    </div>
);

// ============================================================
// TIMELINE SKELETON
// ============================================================

export const TimelineSkeleton = ({
    rows = 5,
}) => (
    <div
        className="
            bg-white
            border
            border-slate-200
            rounded-2xl
            shadow-sm
            p-5
            space-y-4
        "
    >
        <Shimmer
            className="h-4 w-40 mb-2"
        />

        {Array.from({
            length: rows,
        }).map((_, i) => (
            <div
                key={i}
                className="flex gap-3"
            >
                <Shimmer
                    className="
                        h-8
                        w-8
                        rounded-full
                        shrink-0
                    "
                />

                <div className="
                    flex-1
                    space-y-2
                ">
                    <Shimmer
                        className="h-3 w-3/4"
                    />

                    <Shimmer
                        className="h-3 w-1/3"
                    />
                </div>
            </div>
        ))}
    </div>
);

// ============================================================
// EMPTY STATE
// ============================================================

export const EmptyState = ({
    title = "Nothing here yet",
    message,
    icon: Icon = Inbox,
}) => (
    <div className="
        flex
        flex-col
        items-center
        justify-center
        py-10
        text-center
    ">

        <div className="
            w-11
            h-11
            rounded-xl
            bg-slate-50
            border
            border-slate-200
            flex
            items-center
            justify-center
            mb-3
        ">
            <Icon
                className="
                    w-5
                    h-5
                    text-slate-400
                "
            />
        </div>

        <p className="
            text-sm
            font-semibold
            text-slate-700
        ">
            {title}
        </p>

        {message && (
            <p className="
                text-xs
                text-slate-500
                mt-1
                max-w-xs
            ">
                {message}
            </p>
        )}

    </div>
);

// ============================================================
// ERROR STATE
// ============================================================

export const ErrorState = ({
    message = "This section couldn't load.",
    onRetry,
}) => (
    <div className="
        flex
        flex-col
        items-center
        justify-center
        py-10
        text-center
    ">

        <div className="
            w-11
            h-11
            rounded-xl
            bg-red-50
            border
            border-red-200
            flex
            items-center
            justify-center
            mb-3
        ">
            <AlertTriangle
                className="
                    w-5
                    h-5
                    text-red-500
                "
            />
        </div>

        <p className="
            text-sm
            font-semibold
            text-slate-700
        ">
            {message}
        </p>

        {onRetry && (
            <button
                type="button"
                onClick={onRetry}
                className="
                    mt-3
                    inline-flex
                    items-center
                    gap-1.5
                    px-3
                    py-1.5
                    rounded-lg
                    bg-white
                    border
                    border-slate-200
                    text-xs
                    font-semibold
                    text-slate-600
                    hover:bg-slate-50
                    hover:text-teal-600
                    hover:border-teal-200
                    transition
                    shadow-sm
                "
            >
                <RefreshCw
                    className="w-3.5 h-3.5"
                />

                Retry
            </button>
        )}

    </div>
);

// ============================================================
// SECTION WRAPPER
// ============================================================

export const SectionState = ({
    loading,
    error,
    isEmpty,
    onRetry,
    skeleton,
    emptyTitle,
    emptyMessage,
    emptyIcon,
    children,
}) => {

    if (loading) {
        return skeleton;
    }

    if (error) {
        return (
            <ErrorState
                onRetry={onRetry}
            />
        );
    }

    if (isEmpty) {
        return (
            <EmptyState
                title={emptyTitle}
                message={emptyMessage}
                icon={emptyIcon}
            />
        );
    }

    return children;
};
