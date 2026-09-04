import { motion } from "framer-motion";
import CountUpImport from "react-countup";
import { FiBell, FiMail, FiCheckCircle, FiSend } from "react-icons/fi";

// Interop guard — some bundler configs resolve react-countup's default export
// one level too deep (module.default.default), which makes React see an
// object instead of a component and throw "Element type is invalid".
const CountUp = CountUpImport.default || CountUpImport;

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  })
};

export default function NotificationStatsCards({ stats, loading }) {
  const cards = [
    { label: "Total Notifications", value: stats.total, icon: FiBell, gradient: "from-indigo-500 to-indigo-600" },
    { label: "Unread", value: stats.unread, icon: FiMail, gradient: "from-blue-500 to-blue-600" },
    { label: "Read", value: stats.read, icon: FiCheckCircle, gradient: "from-emerald-500 to-emerald-600" },
    { label: "Sent Today", value: stats.sentToday, icon: FiSend, gradient: "from-violet-500 to-violet-600" }
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  {typeof CountUp === "function" ? (
                    <CountUp end={c.value ?? 0} duration={1.2} separator="," />
                  ) : (
                    (c.value ?? 0).toLocaleString()
                  )}
                </p>
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