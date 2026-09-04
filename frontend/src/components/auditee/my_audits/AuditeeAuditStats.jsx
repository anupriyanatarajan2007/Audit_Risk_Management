import { motion } from "framer-motion";
import {
  ClipboardList,
  Clock,
  MessageSquareWarning,
  CheckCircle2,
} from "lucide-react";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const StatCard = ({ title, count, icon: Icon, accent }) => (
  <motion.div
    variants={cardVariants}
    whileHover={{ y: -3, transition: { duration: 0.2 } }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between"
  >
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1">{count}</p>
    </div>
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}
    >
      <Icon className="w-5 h-5" />
    </div>
  </motion.div>
);

const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between animate-pulse">
    <div className="space-y-2">
      <div className="h-3 w-20 bg-gray-200 rounded" />
      <div className="h-6 w-10 bg-gray-200 rounded" />
    </div>
    <div className="w-11 h-11 rounded-xl bg-gray-200" />
  </div>
);

const AuditeeAuditStats = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Audits",
      count: stats.total,
      icon: ClipboardList,
      accent: "bg-teal-50 text-teal-600",
    },
    {
      title: "In Progress",
      count: stats.inProgress,
      icon: Clock,
      accent: "bg-blue-50 text-blue-600",
    },
    {
      title: "Response Pending",
      count: stats.responsePending,
      icon: MessageSquareWarning,
      accent: "bg-amber-50 text-amber-600",
    },
    {
      title: "Completed",
      count: stats.completed,
      icon: CheckCircle2,
      accent: "bg-green-50 text-green-600",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </motion.div>
  );
};

export default AuditeeAuditStats;