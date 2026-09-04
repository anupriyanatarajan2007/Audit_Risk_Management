import { motion } from "framer-motion";
import CountUp from "react-countup";
import { FiFileText, FiEdit3, FiSend, FiCheckCircle, FiXCircle } from "react-icons/fi";

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  })
};

export default function ReportStatsCards({ stats, loading }) {
  const cards = [
    { label: "Total Reports", value: stats.total, icon: FiFileText, gradient: "from-indigo-500 to-indigo-600" },
    { label: "Draft", value: stats.draft, icon: FiEdit3, gradient: "from-slate-500 to-slate-600" },
    { label: "Submitted", value: stats.submitted, icon: FiSend, gradient: "from-blue-500 to-blue-600" },
    { label: "Approved", value: stats.approved, icon: FiCheckCircle, gradient: "from-emerald-500 to-emerald-600" },
    { label: "Rejected", value: stats.rejected, icon: FiXCircle, gradient: "from-rose-500 to-rose-600" }
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((c, i) =>
        loading ? (
          <div key={c.label} className="h-[100px] animate-pulse rounded-2xl bg-white/60 backdrop-blur-sm" />
        ) : (
          <motion.div
            key={c.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-lg ${c.gradient}`}
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-white/80">{c.label}</p>
                <p className="mt-2 text-3xl font-bold tabular-nums">
                {c.value ?? 0}            </p>
              </div>
              <div className="rounded-xl bg-white/20 p-2.5">
                <c.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        )
      )}
    </div>
  );
}