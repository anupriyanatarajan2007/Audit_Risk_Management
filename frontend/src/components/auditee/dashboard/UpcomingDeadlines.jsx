import { motion } from "framer-motion";
import { CalendarClock, PartyPopper, ArrowRight } from "lucide-react";

const URGENCY_STYLES = {
  normal: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  attention: "bg-amber-50 text-amber-700 border border-amber-200",
  urgent: "bg-orange-50 text-orange-700 border border-orange-200",
  overdue: "bg-red-50 text-red-700 border border-red-200",
};

const formatDate = (d) => {
  if (!d) return "No date";

  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const UpcomingDeadlines = ({ audits = [], onView }) => {
  return (
    <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.1 }}
    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    style={{
      opacity: 1,
      color: "#0f172a",
      filter: "none",
    }}
  >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
  <div className="flex items-center gap-3">

    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50">
      <CalendarClock
        className="h-5 w-5"
        style={{
          color: "#0d9488",
        }}
      />
    </div>

    <div>
      <div
        className="text-base font-bold"
        style={{
          color: "#0f172a",
          opacity: 1,
          filter: "none",
          WebkitTextFillColor: "#0f172a",
        }}
      >
        Upcoming Deadlines
      </div>

      <div
        className="mt-1 text-xs font-medium"
        style={{
          color: "#64748b",
          opacity: 1,
          filter: "none",
          WebkitTextFillColor: "#64748b",
        }}
      >
        Audits requiring your attention
      </div>
    </div>
  </div>

  {audits.length > 0 && (
    <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
      {audits.length} {audits.length === 1 ? "Audit" : "Audits"}
    </span>
  )}
</div>

      {/* Empty State */}
      {audits.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-10 text-center"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
            <PartyPopper className="h-6 w-6 text-teal-600" />
          </div>

          <p className="text-sm font-medium text-slate-700">
            No upcoming deadlines
          </p>

          <p className="mt-1 text-xs text-slate-400">
            You're all caught up! 🎉
          </p>
        </motion.div>
      ) : (
        <ul className="space-y-2">
          {audits.map((a, i) => {
            const urgency = a.urgency || {
              level: "normal",
              label: "Normal",
            };

            return (
              <motion.li
                key={a.auditId || a.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onView?.(a)}
                className="group flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-slate-100 bg-white px-4 py-3.5 transition-all duration-200 hover:border-teal-300 hover:bg-slate-50 hover:shadow-sm"
              >
                {/* Audit Information */}
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-teal-700">
                    {(a.auditId || a.id || "AU")
                      .toString()
                      .slice(-2)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {a.auditTitle || a.title || "Untitled Audit"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      <span className="font-medium text-slate-500">
                        {a.auditId || a.id}
                      </span>
                      <span className="mx-1.5 text-slate-300">•</span>
                      Due{" "}
                      <span className="font-medium text-slate-500">
                        {formatDate(a.dueDate)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right Side */}
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      URGENCY_STYLES[urgency.level] ||
                      URGENCY_STYLES.normal
                    }`}
                  >
                    {urgency.label}
                  </span>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-teal-600" />
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
};

export default UpcomingDeadlines;