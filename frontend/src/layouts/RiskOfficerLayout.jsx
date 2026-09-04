// layouts/RiskOfficerLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import RiskOfficerSidebar from "../pages/risk-officer/RiskOfficerSidebar";
import { useEffect, useState } from "react";
import NotificationService from "../service/NotificationService";
import { RiskCreationProvider } from "../context/RiskCreationContext";

export default function RiskOfficerLayout() {

  const [badgeCounts, setBadgeCounts] = useState({
    mitigationCount: 0,
    criticalKriCount: 0,
    unreadCount: 0,
});

const loadUnreadCount = async () => {
  try {
      const res = await NotificationService.getUnreadCount();

      setBadgeCounts(prev => ({
          ...prev,
          unreadCount: res.data.data ?? res.data,
      }));
  } catch (err) {
      console.log(err);
  }
};

useEffect(() => {
  loadUnreadCount();
}, []);

  return (

    <RiskCreationProvider>
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar — normal flex item, no fixed/margin needed */}
      <RiskOfficerSidebar
    badgeCounts={badgeCounts}
/>
      {/* Right Side — takes remaining space, flex handles offset automatically */}
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6">
        <Outlet context={{ loadUnreadCount }} />
        </main>
      </div>
    </div></RiskCreationProvider>

  );
}