// src/components/dashboard/RiskHeatMap.jsx
import { memo, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LIKELIHOOD = ["Rare", "Unlikely", "Possible", "Likely", "Certain"];
const IMPACT = ["Negligible", "Minor", "Moderate", "Major", "Severe"];

function cellTone(score) {
  if (score >= 20) return "bg-rose-400/80 hover:bg-rose-400";
  if (score >= 12) return "bg-amber-400/70 hover:bg-amber-400/90";
  if (score >= 6) return "bg-yellow-300/60 hover:bg-yellow-300/80";
  return "bg-emerald-400/60 hover:bg-emerald-400/80";
}

function RiskHeatMap({ risks = [] }) {
  const [hovered, setHovered] = useState(null);

  const matrix = useMemo(() => {
    const grid = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => []));
    risks.forEach((r) => {
        const levelMap = {
            VERY_LOW: 0,
            LOW: 1,
            MEDIUM: 2,
            HIGH: 3,
            VERY_HIGH: 4,
          
            RARE: 0,
            UNLIKELY: 1,
            POSSIBLE: 2,
            LIKELY: 3,
            CERTAIN: 4,
          
            NEGLIGIBLE: 0,
            MINOR: 1,
            MODERATE: 2,
            MAJOR: 3,
            SEVERE: 4,
          };
          
          risks.forEach((r) => {
            const l =
              typeof r.likelihood === "number"
                ? r.likelihood
                : levelMap[String(r.likelihood).toUpperCase()] ?? 0;
          
            const i =
              typeof r.impact === "number"
                ? r.impact
                : levelMap[String(r.impact).toUpperCase()] ?? 0;
          
            grid[l][i].push(r);
          });
    });
    return grid;
  }, [risks]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-900 mb-1">Risk Heat Map</h3>
      <p className="text-sm text-slate-500 mb-6">Likelihood × Impact</p>

      <div className="flex">
        <div className="flex flex-col justify-between mr-2 py-1">
          {[...LIKELIHOOD].reverse().map((l) => (
            <div key={l} className="text-[11px] text-slate-400 h-16 flex items-center">{l}</div>
          ))}
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-5 gap-1.5">
            {[...matrix].reverse().map((row, rIdx) =>
              row.map((cellRisks, cIdx) => {
                const likelihoodIdx = 4 - rIdx;
                const score = (likelihoodIdx + 1) * (cIdx + 1);
                const key = `${rIdx}-${cIdx}`;
                const isCritical = score >= 20 && cellRisks.length > 0;
                return (
                  <motion.div
                    key={key}
                    onMouseEnter={() => setHovered(key)}
                    onMouseLeave={() => setHovered(null)}
                    whileHover={{ scale: 1.08, zIndex: 20 }}
                    className={`relative h-16 rounded-lg border border-slate-200 ${cellTone(score)} transition-colors cursor-pointer flex items-center justify-center`}
                  >
                    {isCritical && (
                      <motion.span
                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                        className="absolute inset-0 rounded-lg bg-rose-500/50"
                      />
                    )}
                    {cellRisks.length > 0 && (
                      <span className="relative z-10 text-sm font-bold text-slate-900 drop-shadow-sm">
                        {cellRisks.length}
                      </span>
                    )}

                    <AnimatePresence>
                      {hovered === key && cellRisks.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.95 }}
                          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-30 w-48 rounded-lg border border-slate-200 bg-white p-3 text-left shadow-xl"
                        >
                          <p className="text-xs font-semibold text-slate-900 mb-1">
                            {cellRisks.length} risk{cellRisks.length > 1 ? "s" : ""}
                          </p>
                          {cellRisks.slice(0, 3).map((r, i) => (
                            <p key={i} className="truncate text-[11px] text-slate-500">
                              • {r.title ?? r.riskId ?? "Untitled risk"}
                            </p>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
          <div className="grid grid-cols-5 gap-1.5 mt-2">
            {IMPACT.map((i) => (
              <div key={i} className="text-center text-[11px] text-slate-400">{i}</div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default memo(RiskHeatMap);