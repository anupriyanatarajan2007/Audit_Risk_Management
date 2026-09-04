import React from "react";

export const SkeletonBlock = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/[0.06] ${className}`}
    />
  );
};

export const SkeletonTableRow = ({ columns = 6 }) => {
    return (
      <div className="grid grid-cols-6 gap-4 items-center px-4 py-4 border-b border-white/5">
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonBlock
            key={index}
            className={`h-4 ${
              index === 0
                ? "w-24"
                : index === columns - 1
                ? "w-16"
                : "w-20"
            }`}
          />
        ))}
      </div>
    );
  };

export const SkeletonChartCard = () => {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-6 h-full">
      <SkeletonBlock className="h-5 w-48" />
      <SkeletonBlock className="h-3 w-64 mt-2" />
      <SkeletonBlock className="h-[280px] w-full mt-5" />
    </div>
  );
};

export const SkeletonTable = ({ rows = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonBlock
          key={index}
          className="h-12 w-full"
        />
      ))}
    </div>
  );
};

export const SkeletonStatCard = () => {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.03] p-5">
      <div className="flex justify-between">
        <SkeletonBlock className="h-10 w-10" />
        <SkeletonBlock className="h-4 w-12" />
      </div>

      <SkeletonBlock className="h-7 w-20 mt-5" />
      <SkeletonBlock className="h-3 w-28 mt-2" />
      <SkeletonBlock className="h-3 w-36 mt-2" />
    </div>
  );
};