
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

import AdminSidebar from "../components/admin/AdminSidebar";
import AdminTopBar from "../components/admin/AdminTopBar";

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="flex h-screen w-full bg-gray-100 overflow-hidden">

            {/* =====================================================
                LEFT SIDEBAR
            ===================================================== */}

            <AdminSidebar
                collapsed={collapsed}
                onToggleCollapse={() =>
                    setCollapsed((prev) => !prev)
                }
                mobileOpen={false}
                onCloseMobile={() => {}}
            />

            {/* =====================================================
                RIGHT CONTENT AREA
            ===================================================== */}

            <motion.div
                className="
                    flex
                    flex-col
                    flex-1
                    min-w-0
                    h-screen
                    overflow-hidden
                "
                initial={false}
                animate={{
                    opacity: 1,
                }}
                transition={{
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                }}
            >

                {/* TOP BAR */}

                <AdminTopBar />

                {/* PAGE CONTENT */}

                <main
                    className="
                        flex-1
                        overflow-y-auto
                        overflow-x-hidden
                        bg-gray-100
                    "
                >
                    <Outlet />
                </main>

            </motion.div>

        </div>
    );
}
