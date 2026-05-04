/**
 * Z_INDEX — Central z-index constants for the Template Studio.
 * Applied via inline style: style={{ zIndex: Z_INDEX.STUDIO_TOP_TOOLBAR }}
 * The Studio is a full-screen app (bypasses DashboardLayout), so these
 * values are self-contained with no conflict from the main app sidebar.
 */
export const Z_INDEX = {
    STUDIO_CANVAS:          10,
    STUDIO_LEFT_PANEL:      20,
    STUDIO_RIGHT_PANEL:     20,
    STUDIO_TOP_TOOLBAR:     30,
    STUDIO_FLOATING_TOOLS:  40,
    STUDIO_CONTEXT_MENU:    50,
    STUDIO_MODAL_OVERLAY:   60,
    STUDIO_DIALOG:          70,
} as const;
