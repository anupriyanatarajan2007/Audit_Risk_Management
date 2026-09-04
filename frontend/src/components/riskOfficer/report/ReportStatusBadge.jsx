import { motion } from "framer-motion";
import { STATUS_META } from "../../../constants/reportEnums";

export default function ReportStatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.DRAFT;
  return (
    <motion.span
      key={status}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${meta.bg} ${meta.text} ${meta.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${status === "REJECTED" ? "animate-pulse" : ""}`} />
      {meta.label}
    </motion.span>
  );
}