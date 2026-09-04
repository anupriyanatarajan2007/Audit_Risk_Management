// src/components/riskOfficer/mitigation/MitigationKanban.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import MitigationCard from "./MitigationCard";
import { STATUS_CONFIG, STATUS_FLOW } from "../../../utils/mitigationConstants";

const COLUMNS = [...STATUS_FLOW, "CANCELLED"];

export default function MitigationKanban({ mitigations, onCardClick, onStatusChange }) {
  const [dragId, setDragId] = useState(null);
  const [overCol, setOverCol] = useState(null);

  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col] = mitigations.filter((m) => m.status === col);
    return acc;
  }, {});

  const handleDrop = (col) => {
    if (dragId != null) onStatusChange(dragId, col);
    setDragId(null);
    setOverCol(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const cfg = STATUS_CONFIG[col];
        const Icon = cfg.icon;
        const items = grouped[col];
        const isOver = overCol === col;
        return (
          <div
            key={col}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(col);
            }}
            onDragLeave={() => setOverCol(null)}
            onDrop={() => handleDrop(col)}
            className={`rounded-xl border bg-slate-50/60 flex flex-col min-h-[300px] transition-colors ${
              isOver ? "border-indigo-400 bg-indigo-50/50" : "border-slate-200"
            }`}
          >
            <div className={`flex items-center justify-between px-3.5 py-3 border-b ${cfg.border} ${cfg.bg} rounded-t-xl`}>
              <div className={`flex items-center gap-1.5 text-sm font-semibold ${cfg.text}`}>
                <Icon size={15} />
                {cfg.label}
              </div>
              <span className="text-xs font-mono font-semibold text-slate-500 bg-white/70 rounded-full px-2 py-0.5">
                {items.length}
              </span>
            </div>

            <div className="p-3 flex flex-col gap-3 flex-1">
              {items.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-8">Nothing here yet</p>
              ) : (
                items.map((m) => (
                  <div
                    key={m.mitigationId ?? m.id}
                    draggable
                    onDragStart={() => setDragId(m.mitigationId ?? m.id)}
                  >
                    <motion.div layout>
                      <MitigationCard mitigation={m} onClick={onCardClick} />
                    </motion.div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}