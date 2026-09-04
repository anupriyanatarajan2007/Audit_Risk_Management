import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
    FileEdit,
    Send,
    CheckCircle2,
    XCircle,
    Loader2,
    Trophy,
    ChevronDown,
    Check,
} from "lucide-react";

// ============================================================
// STATUS CONFIG
// ============================================================

const STATUS_CONFIG = {
    DRAFT: {
        label: "Draft",
        icon: FileEdit,
        text: "text-slate-600",
        bg: "bg-slate-50",
        border: "border-slate-200",
        dot: "bg-slate-400",
    },

    SUBMITTED: {
        label: "Submitted",
        icon: Send,
        text: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        dot: "bg-amber-500",
    },

    APPROVED: {
        label: "Approved",
        icon: CheckCircle2,
        text: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
    },

    REJECTED: {
        label: "Rejected",
        icon: XCircle,
        text: "text-rose-700",
        bg: "bg-rose-50",
        border: "border-rose-200",
        dot: "bg-rose-500",
    },

    IN_PROGRESS: {
        label: "In Progress",
        icon: Loader2,
        text: "text-cyan-700",
        bg: "bg-cyan-50",
        border: "border-cyan-200",
        dot: "bg-cyan-500",
    },

    COMPLETED: {
        label: "Completed",
        icon: Trophy,
        text: "text-teal-700",
        bg: "bg-teal-50",
        border: "border-teal-200",
        dot: "bg-teal-500",
    },
};

// ============================================================
// ALL STATUSES
// ============================================================

const ALL_STATUSES = [
    "DRAFT",
    "SUBMITTED",
    "APPROVED",
    "REJECTED",
    "IN_PROGRESS",
    "COMPLETED",
];

// ============================================================
// READ ONLY STATUS BADGE
// ============================================================

export default function AnnualAuditPlanStatusBadge({
    status,
    className = "",
}) {
    const config =
        STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;

    const Icon = config.icon;

    return (
        <motion.span
            initial={{
                opacity: 0,
                scale: 0.95,
            }}
            animate={{
                opacity: 1,
                scale: 1,
            }}
            transition={{
                duration: 0.2,
            }}
            className={`
                inline-flex
                items-center
                gap-2
                px-3
                py-1.5
                rounded-full
                border
                ${config.bg}
                ${config.border}
                ${config.text}
                text-xs
                font-semibold
                whitespace-nowrap
                ${className}
            `}
        >
            <span
                className={`
                    w-1.5
                    h-1.5
                    rounded-full
                    ${config.dot}
                `}
            />

            <Icon
                size={13}
                className={
                    status === "IN_PROGRESS"
                        ? "animate-spin"
                        : ""
                }
            />

            {config.label}
        </motion.span>
    );
}

// ============================================================
// EDITABLE STATUS BADGE
// ============================================================

export function EditableAnnualAuditPlanStatusBadge({
    status,
    onChange,
    disabled = false,
    className = "",
}) {
    const [open, setOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    const [menuPosition, setMenuPosition] = useState({
        top: 0,
        left: 0,
        width: 210,
    });

    const config =
        STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;

    const Icon = config.icon;

    // ========================================================
    // UPDATE MENU POSITION
    // ========================================================

    const updateMenuPosition = () => {
        if (!buttonRef.current) return;

        const rect =
            buttonRef.current.getBoundingClientRect();

        const menuWidth = 210;
        const menuHeight = 370;
        const gap = 8;
        const padding = 12;

        let left = rect.left;

        // Prevent right overflow
        if (
            left + menuWidth >
            window.innerWidth - padding
        ) {
            left =
                window.innerWidth -
                menuWidth -
                padding;
        }

        // Prevent left overflow
        if (left < padding) {
            left = padding;
        }

        const spaceBelow =
            window.innerHeight - rect.bottom;

        const spaceAbove = rect.top;

        let top;

        // Open above when required
        if (
            spaceBelow < menuHeight + gap &&
            spaceAbove >= menuHeight + gap
        ) {
            top =
                rect.top -
                menuHeight -
                gap;
        } else {
            top =
                rect.bottom +
                gap;
        }

        // Keep inside viewport
        const maxTop =
            window.innerHeight -
            menuHeight -
            padding;

        top = Math.max(
            padding,
            Math.min(top, maxTop)
        );

        setMenuPosition({
            top,
            left,
            width: menuWidth,
        });
    };

    // ========================================================
    // OPEN / CLOSE
    // ========================================================

    const handleOpen = () => {
        if (disabled || updating) return;

        if (!open) {
            updateMenuPosition();
        }

        setOpen((prev) => !prev);
    };

    // ========================================================
    // UPDATE POSITION WHILE OPEN
    // ========================================================

    useEffect(() => {
        if (!open) return;

        const handlePositionUpdate = () => {
            updateMenuPosition();
        };

        window.addEventListener(
            "resize",
            handlePositionUpdate
        );

        window.addEventListener(
            "scroll",
            handlePositionUpdate,
            true
        );

        return () => {
            window.removeEventListener(
                "resize",
                handlePositionUpdate
            );

            window.removeEventListener(
                "scroll",
                handlePositionUpdate,
                true
            );
        };
    }, [open]);

    // ========================================================
    // CLOSE ON OUTSIDE CLICK
    // ========================================================

    useEffect(() => {
        if (!open) return;

        const handleOutsideClick = (event) => {
            const clickedButton =
                buttonRef.current?.contains(
                    event.target
                );

            const clickedMenu =
                menuRef.current?.contains(
                    event.target
                );

            if (
                !clickedButton &&
                !clickedMenu
            ) {
                setOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, [open]);

    // ========================================================
    // STATUS CHANGE
    // ========================================================

    const handleStatusChange = async (
        newStatus
    ) => {
        if (
            disabled ||
            updating ||
            newStatus === status
        ) {
            setOpen(false);
            return;
        }

        setOpen(false);
        setUpdating(true);

        try {
            await onChange(newStatus);
        } catch (error) {
            console.error(
                "Failed to update annual audit plan status:",
                error
            );
        } finally {
            setUpdating(false);
        }
    };

    // ========================================================
    // DROPDOWN
    // ========================================================

    const dropdown = (
        <AnimatePresence>
            {open &&
                !disabled &&
                !updating && (
                    <motion.div
                        ref={menuRef}
                        initial={{
                            opacity: 0,
                            scale: 0.96,
                            y: -5,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.96,
                            y: -5,
                        }}
                        transition={{
                            duration: 0.15,
                            ease: "easeOut",
                        }}
                        style={{
                            position: "fixed",
                            top: menuPosition.top,
                            left: menuPosition.left,
                            width: menuPosition.width,
                        }}
                        className="
                            z-[999999]
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            shadow-2xl
                            shadow-slate-400/20
                            overflow-hidden
                        "
                    >
                        {/* HEADER */}

                        <div
                            className="
                                px-4
                                py-3
                                border-b
                                border-slate-100
                                bg-slate-50
                            "
                        >
                            <p
                                className="
                                    text-[10px]
                                    uppercase
                                    tracking-[0.12em]
                                    font-bold
                                    text-slate-400
                                "
                            >
                                Change Status
                            </p>

                            <p
                                className="
                                    text-xs
                                    text-slate-500
                                    mt-0.5
                                "
                            >
                                Select a new plan status
                            </p>
                        </div>

                        {/* STATUS LIST */}

                        <div className="p-2">
                            {ALL_STATUSES.map(
                                (item) => {
                                    const itemConfig =
                                        STATUS_CONFIG[
                                            item
                                        ];

                                    const ItemIcon =
                                        itemConfig.icon;

                                    const isSelected =
                                        item === status;

                                    return (
                                        <motion.button
                                            key={item}
                                            type="button"
                                            whileHover={{
                                                x: 2,
                                            }}
                                            onClick={() =>
                                                handleStatusChange(
                                                    item
                                                )
                                            }
                                            className={`
                                                w-full
                                                flex
                                                items-center
                                                gap-3
                                                px-3
                                                py-2.5
                                                rounded-xl
                                                text-left
                                                transition-all
                                                duration-150
                                                ${
                                                    isSelected
                                                        ? "bg-slate-100"
                                                        : "hover:bg-slate-50"
                                                }
                                            `}
                                        >
                                            {/* DOT */}

                                            <span
                                                className={`
                                                    w-2
                                                    h-2
                                                    rounded-full
                                                    flex-shrink-0
                                                    ${itemConfig.dot}
                                                `}
                                            />

                                            {/* ICON */}

                                            <div
                                                className={`
                                                    w-7
                                                    h-7
                                                    rounded-lg
                                                    flex
                                                    items-center
                                                    justify-center
                                                    ${
                                                        item ===
                                                        "DRAFT"
                                                            ? "bg-slate-100"
                                                            : item ===
                                                              "SUBMITTED"
                                                            ? "bg-amber-50"
                                                            : item ===
                                                              "APPROVED"
                                                            ? "bg-emerald-50"
                                                            : item ===
                                                              "REJECTED"
                                                            ? "bg-rose-50"
                                                            : item ===
                                                              "IN_PROGRESS"
                                                            ? "bg-cyan-50"
                                                            : "bg-teal-50"
                                                    }
                                                `}
                                            >
                                                <ItemIcon
                                                    size={14}
                                                    className={
                                                        itemConfig.text
                                                    }
                                                />
                                            </div>

                                            {/* LABEL */}

                                            <span
                                                className={`
                                                    flex-1
                                                    text-xs
                                                    font-semibold
                                                    ${itemConfig.text}
                                                `}
                                            >
                                                {
                                                    itemConfig.label
                                                }
                                            </span>

                                            {/* SELECTED */}

                                            {isSelected && (
                                                <div
                                                    className="
                                                        w-5
                                                        h-5
                                                        rounded-full
                                                        bg-slate-800
                                                        flex
                                                        items-center
                                                        justify-center
                                                    "
                                                >
                                                    <Check
                                                        size={
                                                            12
                                                        }
                                                        className="text-white"
                                                    />
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                }
                            )}
                        </div>
                    </motion.div>
                )}
        </AnimatePresence>
    );

    // ========================================================
    // MAIN
    // ========================================================

    return (
        <>
            <div className="relative inline-flex">
                <button
                    ref={buttonRef}
                    type="button"
                    disabled={
                        disabled || updating
                    }
                    onClick={handleOpen}
                    className={`
                        group
                        inline-flex
                        items-center
                        gap-2
                        px-3
                        py-1.5
                        rounded-full
                        border
                        ${config.bg}
                        ${config.border}
                        ${config.text}
                        text-xs
                        font-semibold
                        whitespace-nowrap
                        transition-all
                        duration-200

                        ${
                            !disabled
                                ? "hover:shadow-md hover:-translate-y-[1px] cursor-pointer"
                                : "cursor-default"
                        }

                        ${
                            updating
                                ? "opacity-70 cursor-wait"
                                : ""
                        }

                        ${className}
                    `}
                >
                    {/* DOT */}

                    {!updating && (
                        <span
                            className={`
                                w-1.5
                                h-1.5
                                rounded-full
                                ${config.dot}
                            `}
                        />
                    )}

                    {/* ICON */}

                    {updating ? (
                        <Loader2
                            size={13}
                            className="animate-spin"
                        />
                    ) : (
                        <Icon
                            size={13}
                            className={
                                status ===
                                "IN_PROGRESS"
                                    ? "animate-spin"
                                    : ""
                            }
                        />
                    )}

                    {/* LABEL */}

                    {updating
                        ? "Updating..."
                        : config.label}

                    {/* ARROW */}

                    {!disabled &&
                        !updating && (
                            <ChevronDown
                                size={13}
                                className={`
                                    opacity-50
                                    transition-transform
                                    duration-200
                                    ${
                                        open
                                            ? "rotate-180"
                                            : ""
                                    }
                                `}
                            />
                        )}
                </button>
            </div>

            {/* ==================================================
                PORTAL

                Dropdown is rendered outside the table so:
                - table does not expand
                - no table scroll
                - no clipping
                - no overflow issue
                - dropdown stays above everything
            ================================================== */}

            {typeof document !== "undefined" &&
                createPortal(
                    dropdown,
                    document.body
                )}
        </>
    );
}