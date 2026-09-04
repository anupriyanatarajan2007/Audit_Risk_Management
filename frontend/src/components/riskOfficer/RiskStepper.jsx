import { Check } from "lucide-react";

const STEPS = [
  { number: 1, label: "Basic Info" },
  { number: 2, label: "Assessment" },
  { number: 3, label: "Mitigation" },
];

export default function RiskStepper({ currentStep }) {
  return (
    <div className="flex items-center justify-center px-8 py-6">
      {STEPS.map((s, idx) => {
        const isComplete = currentStep > s.number;
        const isActive = currentStep === s.number;

        return (
          <div key={s.number} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300
                  ${
                    isComplete
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : isActive
                      ? "border-emerald-600 bg-white text-emerald-600 shadow-[0_0_0_4px_rgba(16,185,129,0.15)]"
                      : "border-slate-300 bg-white text-slate-400"
                  }`}
              >
                {isComplete ? <Check size={16} strokeWidth={3} /> : s.number}
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive ? "text-emerald-700" : isComplete ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {s.label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className={`mx-3 mb-5 h-[2px] w-16 rounded-full transition-colors duration-300 sm:w-24 ${
                  currentStep > s.number ? "bg-emerald-600" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}