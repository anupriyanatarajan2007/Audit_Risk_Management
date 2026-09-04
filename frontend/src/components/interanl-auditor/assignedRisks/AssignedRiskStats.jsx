import React, { useMemo } from "react";
import { ShieldAlert, AlertTriangle, AlertCircle, ListChecks } from "lucide-react";

const AssignedRiskStats = ({ risks }) => {
  const counts = useMemo(() => {
    const result = { total: risks.length, high: 0, medium: 0, low: 0 };
    risks.forEach((r) => {
      const level = (r.riskLevel || "").toUpperCase();
      if (level === "HIGH") result.high += 1;
      else if (level === "MEDIUM") result.medium += 1;
      else if (level === "LOW") result.low += 1;
    });
    return result;
  }, [risks]);

  const cards = [
    { label: "Total Assigned Risks", value: counts.total, icon: <ListChecks size={20} />, tint: "bg-[#E5FAF3] text-[#00A874]" },
    { label: "High Risk", value: counts.high, icon: <ShieldAlert size={20} />, tint: "bg-red-50 text-red-500" },
    { label: "Medium Risk", value: counts.medium, icon: <AlertTriangle size={20} />, tint: "bg-orange-50 text-orange-600" },
    { label: "Low Risk", value: counts.low, icon: <AlertCircle size={20} />, tint: "bg-[#E5FAF3] text-[#00A874]" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => (
        <div
          key={card.label}
          style={{ animationDelay: `${i * 0.06}s` }}
          className="bg-white border border-gray-200 rounded-xl shadow-sm px-5 py-4 flex items-center justify-between
                     opacity-0 animate-[rise_.4s_ease_forwards] hover:-translate-y-0.5 hover:shadow-md transition"
        >
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
              {card.label}
            </div>
            <div className="text-2xl font-bold text-[#101A33] tabular-nums">{card.value}</div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${card.tint}`}>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssignedRiskStats;