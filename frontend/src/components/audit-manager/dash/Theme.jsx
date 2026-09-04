// ============================================================
// AUDIT MANAGER DASHBOARD — LIGHT DESIGN TOKENS
// ============================================================
// Theme: clean white dashboard with subtle slate borders,
// soft shadows and restrained teal/cyan accents.
// Severity/status colors are preserved for meaning.
// ============================================================

export const palette = {
    // ========================================================
    // PAGE
    // ========================================================

    bg: "#F8FAFC",
    bgGradientTo: "#F1F5F9",

    // ========================================================
    // PANELS / CARDS
    // ========================================================

    panel: "#FFFFFF",
    panelBorder: "#E2E8F0",

    // ========================================================
    // PRIMARY ACCENTS
    // ========================================================

    accent: "#0F766E",          // teal-700
    accentSoft: "#CCFBF1",      // teal-100
    accentLine: "#0891B2",      // cyan-600

    // ========================================================
    // TEXT
    // ========================================================

    textPrimary: "#0F172A",     // slate-900
    textMuted: "#64748B",       // slate-500
    textFaint: "#94A3B8",       // slate-400

    // ========================================================
    // STATUS / SEVERITY
    // ========================================================

    critical: "#DC2626",        // red-600
    high: "#EA580C",            // orange-600
    medium: "#D97706",          // amber-600
    low: "#059669",             // emerald-600

    // ========================================================
    // AUDIT STATUS
    // ========================================================

    statusPlanned: "#64748B",
    statusInProgress: "#0891B2",
    statusUnderReview: "#D97706",
    statusCompleted: "#059669",
    statusOverdue: "#DC2626",
};

// ============================================================
// FINDING / RISK SEVERITY COLOR
// ============================================================

export const severityColor = (level) => {
    switch (String(level).toUpperCase()) {
        case "CRITICAL":
            return palette.critical;

        case "HIGH":
            return palette.high;

        case "MEDIUM":
            return palette.medium;

        case "LOW":
            return palette.low;

        default:
            return palette.textFaint;
    }
};

// ============================================================
// AUDIT STATUS COLOR
// ============================================================

export const statusColor = (status) => {
    switch (String(status).toUpperCase()) {
        case "PLANNED":
            return palette.statusPlanned;

        case "IN_PROGRESS":
            return palette.statusInProgress;

        case "UNDER_REVIEW":
            return palette.statusUnderReview;

        case "COMPLETED":
            return palette.statusCompleted;

        case "OVERDUE":
            return palette.statusOverdue;

        default:
            return palette.textFaint;
    }
};

// ============================================================
// SHARED FRAMER MOTION PRESETS
// ============================================================

export const motionPresets = {

    fadeUp: {
        hidden: {
            opacity: 0,
            y: 14,
        },

        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut",
            },
        },
    },

    stagger: (
        staggerChildren = 0.06
    ) => ({
        hidden: {},

        show: {
            transition: {
                staggerChildren,
            },
        },
    }),

    cardHover: {
        whileHover: {
            y: -3,
            scale: 1.01,
        },

        transition: {
            duration: 0.2,
            ease: "easeOut",
        },
    },
};

// ============================================================
// SHARED CARD / PANEL
// ============================================================
//
// IMPORTANT:
// All components using `${glassPanel}` will now automatically
// become white cards.
//
// ============================================================

export const glassPanel = `
    bg-white
    border
    border-slate-200
    rounded-2xl
    shadow-sm
    transition-shadow
    duration-200
    hover:shadow-md
`;
