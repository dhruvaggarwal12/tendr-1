// Clears volatile localStorage data (event form, saved vendors, compare list)
// when the user hasn't opened the app for more than 24 hours.
// This module runs at import time — import it before the Redux store so the
// slices load fresh from cleared localStorage.

const ACTIVITY_KEY    = "tendr_lastActivity";
const INACTIVITY_MS   = 24 * 60 * 60 * 1000; // 24 hours

const last = parseInt(localStorage.getItem(ACTIVITY_KEY) || "0", 10);

if (last > 0 && Date.now() - last > INACTIVITY_MS) {
  try {
    // Event-planning wizard form data
    localStorage.removeItem("eventPlanningFormData");

    // Saved (bookmarked) vendors
    localStorage.removeItem("tendr_saved_vendors");

    // Compare list — user-scoped keys + fallback key
    Object.keys(localStorage)
      .filter(k => k.startsWith("compareSelected_") || k === "tendr:compare")
      .forEach(k => localStorage.removeItem(k));
  } catch { /* ignore storage errors */ }
}

// Always update the activity timestamp so the clock resets on every visit
localStorage.setItem(ACTIVITY_KEY, String(Date.now()));
