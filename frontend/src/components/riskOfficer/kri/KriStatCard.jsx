import { motion } from "framer-motion";
import CountUp from "react-countup";
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  })
};

export default function KriStatCard({ index, icon: Icon, label, value, gradient, glow, loading }) {
  if (loading) {
    return <div className="h-[110px] animate-pulse rounded-2xl bg-white/60 backdrop-blur-sm" />;
  }

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg backdrop-blur-xl ${gradient} ${
        glow ? "shadow-rose-300/50 animate-[pulseGlow_2.2s_ease-in-out_infinite]" : ""
      }`}
    >
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute -right-2 -bottom-10 h-24 w-24 rounded-full bg-white/10" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/80">{label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">
          {value ?? 0}
          </p>
        </div>
        <motion.div
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          className="rounded-xl bg-white/20 p-2.5"
        >
          <Icon className="h-5 w-5" />
        </motion.div>
      </div>
    </motion.div>
  );
}