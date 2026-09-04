// src/hooks/useDashboardData.js
import { useState, useEffect, useCallback, useRef } from "react";
import RiskService from "../service/RiskService";
import KriService from "../service/KriService";
import MitigationService from "../service/MitigationService";
import ReportService from "../service/ReportService";
import NotificationService from "../service/NotificationService";
import { normalizeList, normalizeObject, normalizeCount, safeGet } from "../utils/apiNormalizer";

const REFRESH_INTERVAL = 60_000;

const emptyState = {
  risks: { total: 0, open: 0, closed: 0, high: 0, critical: 0, overdue: 0, list: [] },
  kri: { total: 0, critical: 0, healthy: 0, warning: 0, list: [] },
  mitigation: { total: 0, pending: 0, completed: 0, overdue: 0, list: [] },
  reports: { total: 0, draft: 0, submitted: 0, approved: 0, rejected: 0, list: [] },
  notifications: { total: 0, unread: 0, list: [] },
};

export function useDashboardData() {
  const [data, setData] = useState(emptyState);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const isFirstLoad = useRef(true);

  const fetchAll = useCallback(async () => {
    if (isFirstLoad.current) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const [
        allRisks,
        overdueRisks,
        criticalKriRes,
        allKris,
        allMitigations,
        overdueMitigations,
        allReports,
        notifRes,
        unreadRes,
      ] = await Promise.all([
        safeGet(RiskService.getAllRisks(), []),
        safeGet(RiskService.getOverdueRisks(), []),
        safeGet(KriService.getCriticalKris(), []),
        safeGet(KriService.getAllKris(), []),
        safeGet(MitigationService.getAllMitigations(), []),
        safeGet(MitigationService.getOverdueMitigations(), []),
        safeGet(ReportService.getAllReports(), []),
        safeGet(NotificationService.getNotifications(), []),
        safeGet(NotificationService.getUnreadCount(), 0),
      ]);

      const riskList = normalizeList(allRisks);
      const kriList = normalizeList(allKris);
      const mitigationList = normalizeList(allMitigations);
      const reportList = normalizeList(allReports);
      const notifList = normalizeList(notifRes);

      const countBy = (list, field, value) =>
        list.filter((item) => String(item?.[field]).toLowerCase() === String(value).toLowerCase()).length;

      setData({
        risks: {
          total: riskList.length,
          open: countBy(riskList, "status", "OPEN"),
          closed: countBy(riskList, "status", "CLOSED"),
          high: countBy(riskList, "riskLevel", "HIGH"),
          critical: countBy(riskList, "riskLevel", "CRITICAL"),
          overdue: normalizeList(overdueRisks).length,
          list: riskList,
        },
        kri: {
          total: kriList.length,
          critical: normalizeList(criticalKriRes).length || countBy(kriList, "status", "CRITICAL"),
          healthy: countBy(kriList, "status", "HEALTHY"),
          warning: countBy(kriList, "status", "WARNING"),
          list: kriList,
        },
        mitigation: {
          total: mitigationList.length,
          pending: countBy(mitigationList, "status", "PENDING"),
          completed: countBy(mitigationList, "status", "COMPLETED"),
          overdue: normalizeList(overdueMitigations).length,
          list: mitigationList,
        },
        reports: {
          total: reportList.length,
          draft: countBy(reportList, "status", "DRAFT"),
          submitted: countBy(reportList, "status", "SUBMITTED"),
          approved: countBy(reportList, "status", "APPROVED"),
          rejected: countBy(reportList, "status", "REJECTED"),
          list: reportList,
        },
        notifications: {
          total: notifList.length,
          unread: normalizeCount(unreadRes),
          list: notifList,
        },
      });

      setLastSync(new Date());
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard data. Retrying shortly.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFirstLoad.current = false;
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { data, loading, refreshing, error, lastSync, refetch: fetchAll };
}