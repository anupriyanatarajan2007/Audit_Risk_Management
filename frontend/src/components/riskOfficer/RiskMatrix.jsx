const LIKELIHOOD_LEVELS = [5, 4, 3, 2, 1]; // rendered top→bottom
const IMPACT_LEVELS = [1, 2, 3, 4, 5]; // rendered left→right

function cellLevel(likelihood, impact) {
  const score = likelihood * impact;
  if (score >= 20) return "critical";
  if (score >= 12) return "high";
  if (score >= 6) return "medium";
  return "low";
}

const LEVEL_STYLES = {
  low: "bg-emerald-100 text-emerald-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

export default function RiskMatrix({ likelihood, impact }) {
  const selectedLikelihood = Number(likelihood) || 0;
  const selectedImpact = Number(impact) || 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-slate-700">Risk Matrix — Likelihood × Impact</p>

      <div className="flex gap-2">
        <div className="flex flex-col justify-between py-1 text-[11px] font-medium text-slate-400">
          {LIKELIHOOD_LEVELS.map((l) => (
            <div key={l} className="flex h-9 items-center">
              L{l}
            </div>
          ))}
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-5 gap-1">
            {LIKELIHOOD_LEVELS.map((l) =>
              IMPACT_LEVELS.map((i) => {
                const level = cellLevel(l, i);
                const isSelected = l === selectedLikelihood && i === selectedImpact;
                return (
                  <div
                    key={`${l}-${i}`}
                    className={`flex h-9 items-center justify-center rounded-md text-xs font-semibold transition-all duration-200
                      ${LEVEL_STYLES[level]}
                      ${isSelected ? "ring-2 ring-offset-1 ring-emerald-600 scale-105 z-10" : ""}`}
                  >
                    {l * i}
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-1 grid grid-cols-5 gap-1 text-center text-[11px] font-medium text-slate-400">
            {IMPACT_LEVELS.map((i) => (
              <div key={i}>I{i}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-200" /> Low
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-yellow-200" /> Medium
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-orange-200" /> High
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-200" /> Critical
        </span>
      </div>
    </div>
  );
}