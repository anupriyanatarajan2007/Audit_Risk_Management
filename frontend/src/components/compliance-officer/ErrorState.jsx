import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

const ErrorState = ({
  message = "Something went wrong.",
  onRetry,
}) => {
  return (
    <div className="min-h-[180px] flex flex-col items-center justify-center text-center">
      <div className="h-10 w-10 rounded-xl border border-rose-200 bg-rose-50 flex items-center justify-center">
        <AlertCircle size={18} className="text-rose-500" />
      </div>

      <p className="text-sm font-medium text-slate-700 mt-3">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
        >
          <RefreshCw size={13} />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;