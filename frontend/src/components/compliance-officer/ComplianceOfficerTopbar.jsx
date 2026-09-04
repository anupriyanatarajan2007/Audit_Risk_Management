
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    CircleUser,
    Bell,
    LogOut,
} from "lucide-react";

export default function ComplianceOfficerTopbar() {
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    // Logout
    const handleLogout = () => {
        setOpen(false);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/", {
            replace: true,
        });
    };

    return (
        <header
            className="
                h-16
                shrink-0
                bg-white
                border-b
                border-slate-200
                flex
                items-center
                justify-end
                px-6
                lg:px-8
                z-40
            "
        >

            <div
                className="relative"
                ref={dropdownRef}
            >
                <button
                    onClick={() =>
                        setOpen((value) => !value)
                    }
                    className="
                        flex
                        items-center
                        gap-2
                        px-3
                        py-2
                        rounded-lg
                        text-slate-700
                        font-medium
                        text-sm
                        hover:bg-slate-50
                        hover:text-slate-900
                        transition-all
                        duration-200
                    "
                >
                    <span>
                        Compliance Officer
                    </span>

                    <motion.span
                        animate={{
                            rotate: open ? 180 : 0,
                        }}
                        transition={{
                            duration: 0.2,
                        }}
                    >
                        <ChevronDown size={16} />
                    </motion.span>
                </button>

                {/* =================================================
                    DROPDOWN
                ================================================= */}

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: -6,
                                scale: 0.97,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                y: -6,
                                scale: 0.97,
                            }}
                            transition={{
                                duration: 0.18,
                                ease: [0.4, 0, 0.2, 1],
                            }}
                            className="
                                absolute
                                right-0
                                mt-2
                                w-48
                                rounded-xl
                                bg-white
                                border
                                border-slate-200
                                shadow-xl
                                overflow-hidden
                                origin-top-right
                            "
                        >

                            {/* PROFILE */}

                            <button
                                onClick={() => {
                                    setOpen(false);
                                    navigate(
                                        "/auditee-officer/profile"
                                    );
                                }}
                                className="
                                    w-full
                                    flex
                                    items-center
                                    gap-3
                                    px-4
                                    py-3
                                    text-sm
                                    text-slate-700
                                    hover:bg-emerald-50
                                    hover:text-emerald-600
                                    transition-all
                                    duration-200
                                "
                            >
                                <CircleUser
                                    size={17}
                                    className="text-slate-400"
                                />

                                Profile
                            </button>

                            {/* NOTIFICATIONS

                            <button
                                onClick={() => {
                                    setOpen(false);
                                    navigate(
                                        "/audit-manager/notifications"
                                    );
                                }}
                                className="
                                    w-full
                                    flex
                                    items-center
                                    gap-3
                                    px-4
                                    py-3
                                    text-sm
                                    text-slate-700
                                    hover:bg-emerald-50
                                    hover:text-emerald-600
                                    transition-all
                                    duration-200
                                "
                            >
                                <Bell
                                    size={17}
                                    className="text-slate-400"
                                />

                                Notifications
                            </button>

                            {/* DIVIDER */}

                            {/* <div
                                className="
                                    border-t
                                    border-slate-100
                                "
                            // /> */} 

                            {/* LOGOUT */}

                            <button
                                onClick={handleLogout}
                                className="
                                    w-full
                                    flex
                                    items-center
                                    gap-3
                                    px-4
                                    py-3
                                    text-sm
                                    text-red-500
                                    hover:bg-red-50
                                    hover:text-red-600
                                    transition-all
                                    duration-200
                                "
                            >
                                <LogOut size={17} />

                                Logout
                            </button>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
}

