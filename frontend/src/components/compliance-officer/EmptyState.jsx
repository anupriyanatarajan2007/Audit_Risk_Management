import React from "react";
import { Inbox } from "lucide-react";

const EmptyState = ({
  icon: Icon = Inbox,
  title = "No data available",
  subtitle,
}) => {
  return (
    <div className="min-h-[180px] flex flex-col items-center justify-center text-center">
      <div className="h-10 w-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
        <Icon size={18} className="text-slate-400" />
      </div>

      <p className="text-sm font-medium text-slate-700 mt-3">
        {title}
      </p>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default EmptyState;