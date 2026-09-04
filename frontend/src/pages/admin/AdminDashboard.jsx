// src/pages/AdminDashboard.jsx
import { useCallback, useEffect, useState } from "react";
import DashboardHeader from "../../components/admin/dash/DashboardHeader";
import KpiCards from "../../components/admin/dash/KpiCards";
import UserDistribution from "../../components/admin/dash/UserDistribution";
import RiskAnalytics from "../../components/admin/dash/RiskAnalytics";
import AuditAnalytics from "../../components/admin/dash/AuditAnalytics";
//import OrganizationOverview from "../../components/admin/dash/OrganizationOverview";
import RecentActivity from "../../components/admin/dash/RecentActivity";
import SystemHealth from "../../components/admin/dash/SystemHealth";
import UserAnalytics from "../../components/admin/dash/UserAnalytics";
import DashboardService from "../../service/dashboardService";

export default function AdminDashboard() {
    const [summary, setSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const loadSummary = useCallback(async () => {
        setLoadingSummary(true);
        try {
            const data = await DashboardService.getDashboardSummary();
            setSummary(data);
            setLastUpdated(new Date());
        } catch (err) {
            console.error("Failed to load dashboard summary:", err);
            setSummary(null);
        } finally {
            setLoadingSummary(false);
        }
    }, []);

    useEffect(() => {
        loadSummary();
    }, [loadSummary]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadSummary();
        // bumping refreshKey forces child sections to remount and re-fetch
        setRefreshKey((k) => k + 1);
        setRefreshing(false);
    };

    return (
        <div className="min-h-screen bg-slate-50/60 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1400px]">
                <DashboardHeader
                    onRefresh={handleRefresh}
                    lastUpdated={lastUpdated}
                    refreshing={refreshing}
                />

                <KpiCards summary={summary} loading={loadingSummary} />

                <div key={refreshKey}>
                    <div className="mb-8">
                        <UserAnalytics />
                    </div>

                    <UserDistribution />

                    <RiskAnalytics />

                    <AuditAnalytics />

                    
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <RecentActivity />
                        <SystemHealth />
                    </div>
                </div>
            </div>
        </div>
    );
}