// src/pages/Dashboard.jsx
import { useState,  useCallback ,useEffect} from "react";
import { motion } from "framer-motion";
import { useDashboardData } from "../../hooks/useDashboardData";
import DashboardHeader from "../../components/riskOfficer/dashboard/DashboardHeader";
import KpiCards from "../../components/riskOfficer/dashboard/KpiCards";
import QuickActions from "../../components/riskOfficer/dashboard/QuickActions";
import RiskHeatMap from "../../components/riskOfficer/dashboard/RiskHeatMap";
import RiskCharts from "../../components/riskOfficer/dashboard/RiskCharts";
import KriGauges from "../../components/riskOfficer/dashboard/KriGauges";
import MitigationProgress from "../../components/riskOfficer/dashboard/MitigationProgress";
import RecentReports from "../../components/riskOfficer/dashboard/RecentReports";
import UpcomingDeadlines from "../../components/riskOfficer/dashboard/UpcomingDeadlines";
import NotificationPanel from "../../components/riskOfficer/dashboard/NotificationPanel";
import DashboardFooter from "../../components/riskOfficer/dashboard/DashboardFooter";
import LoadingSkeleton from "../../components/riskOfficer/dashboard/LoadingSkeleton";
import ActivityFeed from "../../components/riskOfficer/dashboard/ActivityFeed";
import { useNavigate } from "react-router-dom";
import NotificationService from "../../service/NotificationService";
import { getProfile } from "../../service/AuthService";
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function RODashboard() {
  const { data, loading, refreshing, error, lastSync, refetch } = useDashboardData();
  const [localUnread, setLocalUnread] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [officerName, setOfficerName] = useState("Risk Officer");

  const navigate = useNavigate();

const fetchUnreadCount = async () => {
  try {
    const res = await NotificationService.getUnreadCount();

    setUnreadCount(
      typeof res.data === "number"
        ? res.data
        : res.data.count ?? 0
    );

  } catch (error) {
    console.error("Unread count error:", error);
  }
};

useEffect(() => {
  fetchUnreadCount();
  fetchOfficerProfile();
}, []);

const fetchOfficerProfile = async () => {
  try {
    const res = await getProfile();

    const user = res.data ?? res;

    setOfficerName(
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
      user.name ||
      user.username ||
      "Risk Officer"
    );

  } catch (error) {
    console.error("Profile loading error:", error);
  }
};

  const handleMarkRead = useCallback((id) => {
    setLocalUnread((prev) => (prev ?? data.notifications.unread) - 1);
  }, [data.notifications.unread]);

  const handleQuickAction = useCallback((key) => {
    switch (key) {
      case "risk":
        navigate("/risk-officer/risk-register");
        break;
  
      case "kri":
        navigate("/risk-officer/kri");
        break;
  
      case "mitigation":
        navigate("/risk-officer/mitigation");
        break;
  
      case "report":
        navigate("/risk-officer/reports");
        break;
  
      case "notification":
        navigate("/risk-officer/notifications");
        break;
  
      default:
        break;
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 relative overflow-hidden">
        <BackgroundOrbs />
        <LoadingSkeleton />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 text-slate-900 relative overflow-x-hidden">
      <BackgroundOrbs />

      <DashboardHeader
        officerName={officerName}
        unreadCount={localUnread ?? unreadCount}
        refreshing={refreshing}
        onRefresh={refetch}
        onBellClick={() => document.getElementById("notifications-panel")?.scrollIntoView({ behavior: "smooth" })}
      />

      {error && (
        <div className="mx-6 mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 px-6 py-6 space-y-6"
      >
        <motion.div variants={item}>
          <KpiCards risks={data.risks} kri={data.kri} mitigation={data.mitigation} loading={loading} />
        </motion.div>

        <motion.div variants={item}>
          <QuickActions onAction={handleQuickAction} />
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <motion.div variants={item}>
              <RiskHeatMap risks={data.risks.list} />
            </motion.div>

            <motion.div variants={item}>
              <RiskCharts risks={data.risks.list} />
            </motion.div>

            <motion.div variants={item}>
              <KriGauges kris={data.kri.list} />
            </motion.div>

            <motion.div variants={item}>
              <MitigationProgress mitigations={data.mitigation.list} />
            </motion.div>

            <motion.div variants={item}>
              <RecentReports reports={data.reports.list} />
            </motion.div>

            <motion.div variants={item}>
              <UpcomingDeadlines risks={data.risks.list} mitigations={data.mitigation.list} />
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div variants={item} id="notifications-panel">
              <NotificationPanel notifications={data.notifications.list} onMarkRead={handleMarkRead} />
            </motion.div>

            <motion.div variants={item}>
              <ActivityFeed
                risks={data.risks.list}
                reports={data.reports.list}
                notifications={data.notifications.list}
              />
            </motion.div>
          </div>
        </div>
      </motion.main>

      <DashboardFooter apiOk={!error} dbOk={!error} lastSync={lastSync} />
    </div>
  );
}

function BackgroundOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-200/30 blur-[120px]" />
      <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-emerald-200/25 blur-[120px]" />
      <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-purple-200/25 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,0.04)_1px,transparent_0)] bg-[size:24px_24px]" />
    </div>
  );
}