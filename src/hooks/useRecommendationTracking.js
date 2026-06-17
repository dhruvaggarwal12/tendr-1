// Recommendation tracking hook — fire-and-forget, never blocks the user
import { useRef, useCallback } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SESSION_KEY = "tendr_rec_session";

function saveSession(data) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch {}
}
export function loadRecSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}
export function clearRecSession() {
  try { localStorage.removeItem(SESSION_KEY); } catch {}
}

function patch(path, body) {
  fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}

export function useRecommendationTracking() {
  const sessionRef = useRef(null); // { sessionId, recommendedServices[] }

  // Call once when the strip renders with a valid event type
  const startSession = useCallback(({ eventType, guestCount, budgetRange, city, userId, recommendedServices }) => {
    if (sessionRef.current?.eventType === eventType) return; // already started for this event type

    const items = recommendedServices.map((name, i) => ({
      name,
      type: "service",
      score: i + 1,
    }));

    fetch(`${BASE_URL}/recommendations/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId || null, eventType, guestCount, budgetRange, city, items }),
    })
      .then(r => r.json())
      .then(({ sessionId }) => {
        if (!sessionId) return;
        const data = { sessionId, eventType, recommendedServices };
        sessionRef.current = data;
        saveSession(data); // persist so PaymentSuccessPage can fire "booked"
      })
      .catch(() => {});
  }, []);

  const trackClick = useCallback((serviceName) => {
    const s = sessionRef.current;
    if (!s?.sessionId) return;
    patch(`/recommendations/session/${s.sessionId}/track`, {
      tracks: [{ name: serviceName, events: ["clicked"] }],
    });
  }, []);

  const trackSelect = useCallback((serviceName) => {
    const s = sessionRef.current;
    if (!s?.sessionId) return;
    patch(`/recommendations/session/${s.sessionId}/track`, {
      tracks: [{ name: serviceName, events: ["selected"] }],
    });
  }, []);

  const trackDeselect = useCallback((serviceName) => {
    // No explicit "deselected" field — we just don't set selected=true
    // This is a no-op but kept for future use
    void serviceName;
  }, []);

  // Call when the user proceeds past the service selection screen
  // Any recommended service not selected = ignored
  const trackIgnored = useCallback((selectedVendors) => {
    const s = sessionRef.current;
    if (!s?.sessionId) return;
    const ignored = (s.recommendedServices || []).filter(name => !selectedVendors.includes(name));
    if (!ignored.length) return;
    patch(`/recommendations/session/${s.sessionId}/track`, {
      tracks: ignored.map(name => ({ name, events: ["ignored"] })),
    });
  }, []);

  return { startSession, trackClick, trackSelect, trackDeselect, trackIgnored };
}
