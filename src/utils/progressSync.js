/**
 * progressSync.js
 * Single source of truth for reading, writing, and syncing all planning
 * progress to/from the server. All expiry rules live here.
 *
 * Keys managed:
 *   tendr_saved_vendors    — 7 days per bookmark
 *   compareSelected_{uid}  — 7 days
 *   tendr_finalised        — until event date
 *   tendr:chat-done:*      — until event date
 *   tendr_smart_plan       — until event date
 *   tendr_timeline_v2      — until event date
 *   tendr_timeline_form    — until event date
 *   tendr_checklist_v2     — until event date
 *   tendr_checklist_form   — until event date
 */

import { saveUserProgress, loadUserProgress } from "../apis/userApi";

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

// ─── helpers ────────────────────────────────────────────────────────────────

const get = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const set = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };
const del = (key) => { try { localStorage.removeItem(key); } catch {} };

/** Returns event date from planning session, or null */
const getEventDate = () => {
  try {
    const s = JSON.parse(localStorage.getItem("tendr_ep_session") || "{}");
    return s?.formData?.date || null;
  } catch { return null; }
};

/** Returns ms timestamp for expiry: event date + 1 day, or fallback */
const eventExpiry = (fallbackMs = SEVEN_DAYS) => {
  const date = getEventDate();
  if (date) return new Date(date).getTime() + 24 * 60 * 60 * 1000;
  return Date.now() + fallbackMs;
};

const isExpired = (item) => {
  if (!item || typeof item !== "object") return true;
  if (!item.__expiresAt) return false;
  return Date.now() > item.__expiresAt;
};

// ─── snapshot: read all progress from localStorage ──────────────────────────

export const readProgressSnapshot = () => {
  // Saved vendors — array with per-item __savedAt, filter expired
  const rawVendors = get("tendr_saved_vendors") || [];
  const savedVendors = Array.isArray(rawVendors)
    ? rawVendors.filter(v => !v.__savedAt || Date.now() - v.__savedAt < SEVEN_DAYS)
    : [];

  // Compare — simple array with top-level __expiresAt
  const rawCompare = get("tendr_compare_progress") || {};
  const compareSelected = !isExpired(rawCompare) ? (rawCompare.items || []) : [];

  // Finalised vendors
  const rawFinalised = get("tendr_finalised") || {};
  const finalisedVendors = !isExpired(rawFinalised)
    ? (({ __expiresAt, ...rest }) => rest)(rawFinalised)
    : {};

  // Chat done flags — collect all tendr:chat-done:* keys
  const chatDone = {};
  const expiry = getEventDate() ? new Date(getEventDate()).getTime() + 86400000 : null;
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith("tendr:chat-done:")) {
        if (!expiry || Date.now() < expiry) {
          chatDone[k.replace("tendr:chat-done:", "")] = true;
        }
      }
    });
  } catch {}

  // Smart plan
  const rawPlan = get("tendr_smart_plan") || {};
  const smartPlan = !isExpired(rawPlan) ? rawPlan.data : null;

  // Timeline
  const rawTimeline = get("tendr_timeline_v2") || {};
  const timelineProgress = !isExpired(rawTimeline) ? rawTimeline : null;
  const timelineForm = (() => {
    const f = get("tendr_timeline_form");
    return f ? f : null;
  })();

  // Checklist
  const rawChecklist = get("tendr_checklist_v2") || {};
  const checklistProgress = !isExpired(rawChecklist) ? rawChecklist : null;
  const checklistForm = (() => {
    const f = get("tendr_checklist_form");
    return f ? f : null;
  })();

  return {
    savedVendors,
    compareSelected,
    finalisedVendors,
    chatDone,
    smartPlan,
    timelineProgress,
    timelineForm,
    checklistProgress,
    checklistForm,
    __savedAt: Date.now(),
  };
};

// ─── restore: write a progress snapshot back to localStorage ─────────────────

export const restoreProgressSnapshot = (snapshot) => {
  if (!snapshot || typeof snapshot !== "object") return;

  const {
    savedVendors, compareSelected, finalisedVendors, chatDone,
    smartPlan, timelineProgress, timelineForm, checklistProgress, checklistForm,
  } = snapshot;

  // Saved vendors — restore with per-item __savedAt (use Date.now() if missing)
  if (Array.isArray(savedVendors) && savedVendors.length > 0) {
    const existing = get("tendr_saved_vendors") || [];
    const existingIds = new Set(existing.map(v => v._id));
    const merged = [
      ...existing,
      ...savedVendors
        .filter(v => !existingIds.has(v._id))
        .map(v => ({ ...v, __savedAt: v.__savedAt || Date.now() })),
    ];
    set("tendr_saved_vendors", merged);
  }

  // Compare
  if (Array.isArray(compareSelected) && compareSelected.length > 0) {
    const existing = get("tendr_compare_progress");
    if (!existing || isExpired(existing)) {
      set("tendr_compare_progress", { items: compareSelected, __expiresAt: Date.now() + SEVEN_DAYS });
    }
  }

  // Finalised vendors
  if (finalisedVendors && Object.keys(finalisedVendors).length > 0) {
    const existing = get("tendr_finalised");
    if (!existing || isExpired(existing)) {
      set("tendr_finalised", { ...finalisedVendors, __expiresAt: eventExpiry() });
    }
  }

  // Chat done flags
  if (chatDone && typeof chatDone === "object") {
    Object.keys(chatDone).forEach(vendorId => {
      const key = `tendr:chat-done:${vendorId}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, "1");
      }
    });
  }

  // Smart plan
  if (smartPlan) {
    const existing = get("tendr_smart_plan");
    if (!existing || isExpired(existing)) {
      set("tendr_smart_plan", { data: smartPlan, __expiresAt: eventExpiry() });
    }
  }

  // Timeline
  if (timelineProgress && !isExpired(timelineProgress)) {
    if (!get("tendr_timeline_v2")) set("tendr_timeline_v2", timelineProgress);
  }
  if (timelineForm && !get("tendr_timeline_form")) {
    set("tendr_timeline_form", timelineForm);
  }

  // Checklist
  if (checklistProgress && !isExpired(checklistProgress)) {
    if (!get("tendr_checklist_v2")) set("tendr_checklist_v2", checklistProgress);
  }
  if (checklistForm && !get("tendr_checklist_form")) {
    set("tendr_checklist_form", checklistForm);
  }
};

// ─── debounced save to server ────────────────────────────────────────────────

let _syncTimer = null;
export const scheduleSyncToServer = (token) => {
  if (!token) return;
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(async () => {
    const snapshot = readProgressSnapshot();
    await saveUserProgress(token, snapshot);
  }, 2000);
};

// ─── load from server and restore on login ───────────────────────────────────

export const syncProgressOnLogin = async (token) => {
  if (!token) return;
  const snapshot = await loadUserProgress(token);
  if (snapshot) restoreProgressSnapshot(snapshot);
};
