// src/components/dashboard/shared/Skeleton.jsx
export function SkeletonBlock({ className = "" }) {
    return (
        <div
            className={`animate-pulse rounded-lg bg-slate-100 ${className}`}
        />
    );
}

export function ChartSkeleton({ height = 260 }) {
    return (
        <div className="flex items-end gap-3 px-2" style={{ height }}>
            {[45, 70, 55, 90, 60, 80, 50].map((h, i) => (
                <div
                    key={i}
                    className="flex-1 animate-pulse rounded-t-md bg-slate-100"
                    style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                />
            ))}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <SkeletonBlock className="mb-3 h-4 w-24" />
            <SkeletonBlock className="mb-2 h-8 w-32" />
            <SkeletonBlock className="h-3 w-20" />
        </div>
    );
}