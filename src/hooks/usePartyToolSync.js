// Drop-in replacement for a Party Hub "manage" tool's own localStorage read/write — keeps
// localStorage as the instant, always-on store (so exploring/logged-out hosts see zero change),
// and additionally persists to the host's Party record when they're logged in, so the same
// data shows up from any device via the Dashboard's "My Parties" tab.
import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { ensureHostParty, PARTY_SESSION_KEY } from "../utils/partySession";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export function usePartyToolSync(toolKey, localStorageKey, defaultValue) {
  const { token } = useSelector(s => s.auth || {});
  const [data, setDataState] = useState(() => {
    try { const raw = localStorage.getItem(localStorageKey); return raw ? JSON.parse(raw) : defaultValue; } catch { return defaultValue; }
  });
  const hydratedRef = useRef(false);

  // On mount, if this host already has a party with saved data for this tool, prefer it —
  // it's the cross-device copy. A brand-new tool (nothing saved yet) just keeps the local value.
  useEffect(() => {
    if (hydratedRef.current || !token) return;
    hydratedRef.current = true;
    const partyId = sessionStorage.getItem(PARTY_SESSION_KEY);
    if (!partyId) return;
    fetch(`${BASE_URL}/parties/${partyId}`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const remote = d?.party?.toolData?.[toolKey];
        if (remote !== undefined) {
          setDataState(remote);
          try { localStorage.setItem(localStorageKey, JSON.stringify(remote)); } catch {}
        }
      })
      .catch(() => {});
  }, [token, toolKey, localStorageKey]);

  const setData = useCallback((value) => {
    setDataState(value);
    try { localStorage.setItem(localStorageKey, JSON.stringify(value)); } catch {}
    if (!token) return;
    (async () => {
      const partyId = await ensureHostParty(token);
      if (!partyId) return;
      fetch(`${BASE_URL}/parties/${partyId}/tool-data`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ tool: toolKey, data: value }),
      }).catch(() => {});
    })();
  }, [token, toolKey, localStorageKey]);

  return [data, setData];
}
