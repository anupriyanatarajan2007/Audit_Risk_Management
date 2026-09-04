// src/components/dashboard/LoadingSkeleton.jsx
import { motion } from "framer-motion";

const shimmer = {
  animate: { backgroundPosition: ["200% 0", "-200% 0"] },
  transition: { duration: 1.8, repeat: Infinity, ease: "linear" },
};

export function SkeletonBlock({ className = "" }) {
  return (
    <motion.div
      {...shimmer}
      className={`rounded-xl bg-[linear-gradient(110deg,#e2e8f0_8%,#f1f5f9_18%,#e2e8f0_33%)] bg-[length:200%_100%] ${className}`}
    />
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-10 w-10 rounded-xl" />
        <SkeletonBlock className="h-4 w-12" />
      </div>
      <SkeletonBlock className="h-8 w-24" />
      <SkeletonBlock className="h-3 w-32" />
      <SkeletonBlock className="h-8 w-full" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonBlock key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

export function PanelSkeleton({ rows = 4 }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
      <SkeletonBlock className="h-5 w-40 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonBlock key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export default function LoadingSkeleton() {
  return (
    <div className="space-y-8 p-6">
      <SkeletonBlock className="h-20 w-full rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PanelSkeleton rows={5} />
        <PanelSkeleton rows={5} />
        <PanelSkeleton rows={5} />
      </div>
    </div>
  );
}