// Shared planning resume + early EventPlan utility
// Used by all booking flows so the "In Planning…" button always
// knows which page to return to, and the admin sees an early Bookings
// entry the moment any flow is started.

export const RESUME_KEY      = 'tendr_resume_url';
export const PLAN_CREATED_KEY = 'tendr_early_plan_created'; // sessionStorage — prevents duplicates

const BASE_URL = import.meta.env.VITE_BASE_URL;

export function saveResumeUrl(url = window.location.pathname + window.location.search) {
  try { localStorage.setItem(RESUME_KEY, url); } catch {}
}

export function getResumeUrl() {
  try { return localStorage.getItem(RESUME_KEY) || null; } catch { return null; }
}

export function clearResumeUrl() {
  try { localStorage.removeItem(RESUME_KEY); } catch {}
}

// Fire-and-forget — creates an EventPlan in admin Bookings the first time it's
// called this session. Guards: token required; eventType/date/location/guests required.
// Sets a sessionStorage flag so subsequent calls from other pages don't duplicate.
export function tryCreateEarlyEventPlan(token, eventPlanning) {
  try {
    if (sessionStorage.getItem(PLAN_CREATED_KEY)) return; // already created this session
    if (!token) return;

    const fd = eventPlanning?.formData || {};
    if (!fd.eventType || !fd.date || !fd.location || !fd.guests) return;

    sessionStorage.setItem(PLAN_CREATED_KEY, '1');

    fetch(`${BASE_URL}/event-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      credentials: 'include',
      body: JSON.stringify({
        bookingType: eventPlanning?.bookingType || 'you-do-it',
        eventName: fd.eventType,
        eventType: fd.eventType,
        guests: String(fd.guests),
        location: fd.location,
        date: fd.date,
        budget: fd.budget || '',
        additionalInfo: (fd.extraRequirements || []).join(', '),
        selectedServices: eventPlanning?.selectedVendors || [],
        finalisedVendors: {},
        ...(eventPlanning?.selectedPerformer ? { selectedPerformer: eventPlanning.selectedPerformer } : {}),
      }),
    }).catch(() => {
      // Remove flag on failure so the next page can retry
      try { sessionStorage.removeItem(PLAN_CREATED_KEY); } catch {}
    });
  } catch {}
}
