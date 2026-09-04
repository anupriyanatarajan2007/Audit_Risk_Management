import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import ChiefAuditExecutiveSidebar from "../components/cae/ChiefAuditExecutiveSidebar";
import ChiefAuditExecutiveTopBar from "../components/cae/ChiefAuditExecutiveTopBar";

export default function ChiefAuditExecutiveLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
      {/* LEFT SIDEBAR — normal flex item, not fixed */}
      <ChiefAuditExecutiveSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
      />

      {/* RIGHT CONTENT AREA */}
      <motion.div
        className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden"
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <ChiefAuditExecutiveTopBar />

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
}