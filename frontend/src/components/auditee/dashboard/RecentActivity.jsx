import { motion } from "framer-motion";
import {
  CheckCircle2, UploadCloud, AlertTriangle, ClipboardCheck,
  Lightbulb, RefreshCcw, Activity,
} from "lucide-react";

const ACTIVITY_ICONS = {
  RESPONSE_SUBMITTED: CheckCircle2,
  EVIDENCE_UPLOADED: UploadCloud,
  FINDING_CREATED: AlertTriangle,
  AUDIT_ASSIGNED: ClipboardCheck,
  RECOMMENDATION_RECEIVED: Lightbulb,
  AUDIT_STATUS_UPDATED: RefreshCcw,
};

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// Builds a normalized activity feed from whatever data is available.
// Replace/extend this once a dedicated activity-log API exists.
export const buildActivityFeed = ({ responses = [], evidence = [] }) => {
  const items = [];

  responses.forEach((r) =>
    items.push({
      id: `resp-${r.id}`,
      type: "RESPONSE_SUBMITTED",
      title: "Response submitted",
      description: r.findingTitle ? `For finding: ${r.findingTitle}` : "Auditee response submitted",
      date: r.submittedAt || r.createdAt,
    })
  );

  evidence.forEach((e) =>
    items.push({
      id: `evd-${e.id}`,
      type: "EVIDENCE_UPLOADED",
      title: "Evidence uploaded",
      description: e.fileName || e.description || "Supporting document uploaded",
      date: e.uploadedAt || e.createdAt,
    })
  );

  return items
    .filter((i) => i.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);
};

const RecentActivity = ({ activities = [] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-teal-600" />
        <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-400">
          No recent activity to show
        </div>
      ) : (
        <ol className="relative border-l border-slate-100 ml-2">
          {activities.map((item, i) => {
            const Icon = ACTIVITY_ICONS[item.type] || Activity;
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="mb-5 ml-5 last:mb-0"
              >
                <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-teal-50 ring-4 ring-white">
                  <Icon className="h-2.5 w-2.5 text-teal-600" />
                </span>
                <p className="text-sm font-medium text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500">{item.description}</p>
                <p className="text-[11px] text-slate-350 text-slate-400 mt-0.5">{timeAgo(item.date)}</p>
              </motion.li>
            );
          })}
        </ol>
      )}
    </motion.div>
  );
};

export default RecentActivity;