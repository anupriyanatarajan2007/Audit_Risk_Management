import { motion, useMotionValue, animate } from "framer-motion";
import { useEffect, useState } from "react";

const CountUp = ({ value }) => {
  const [display, setDisplay] = useState(0);
  const motionVal = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return controls.stop;
  }, [value]);

  return <span>{display}</span>;
};

const AuditeeStatCard = ({ icon: Icon, label, value, description, accent = "teal", index = 0 }) => {
  const accents = {
    teal: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(15,23,42,0.12)" }}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${accents[accent]}`}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-900">
        <CountUp value={value} />
      </p>
      <p className="mt-1 text-xs text-slate-400">{description}</p>
    </motion.div>
  );
};

export default AuditeeStatCard;