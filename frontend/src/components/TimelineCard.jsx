import { PlusCircle, RefreshCw, CheckCircle2 } from "lucide-react";

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TimelineCard({ createdAt, updatedAt, assessmentCompletedAt }) {
  const events = [
    { icon: PlusCircle, label: "Created", value: formatDate(createdAt), color: "text-slate-400" },
    { icon: RefreshCw, label: "Last Updated", value: formatDate(updatedAt), color: "text-blue-500" },
    {
      icon: CheckCircle2,
      label: "Assessment Completed",
      value: formatDate(assessmentCompletedAt),
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="mb-4 text-sm font-semibold text-slate-700">Timeline</p>
      <div className="space-y-4">
        {events.map((e) => (
          <div key={e.label} className="flex items-start gap-3">
            <e.icon size={16} className={`mt-0.5 shrink-0 ${e.color}`} />
            <div>
              <p className="text-sm font-medium text-slate-700">{e.label}</p>
              <p className="text-xs text-slate-400">{e.value || "Pending"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}