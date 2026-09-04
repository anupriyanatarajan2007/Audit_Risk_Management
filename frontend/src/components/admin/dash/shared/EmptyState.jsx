// src/components/dashboard/shared/EmptyState.jsx
import { Inbox, RefreshCw, WifiOff } from "lucide-react";

const ICONS = {
    empty: Inbox,
    error: WifiOff,
};

export default function EmptyState({
    type = "empty",
    title = "Nothing to show yet",
    description = "Data will appear here once available.",
    onRetry,
}) {
    const Icon = ICONS[type] || Inbox;

    return (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                <Icon size={20} strokeWidth={1.75} />
            </div>
            <p className="text-sm font-medium text-slate-700">{title}</p>
            <p className="max-w-xs text-xs text-slate-400">{description}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                >
                    <RefreshCw size={12} />
                    Retry
                </button>
            )}
        </div>
    );
}