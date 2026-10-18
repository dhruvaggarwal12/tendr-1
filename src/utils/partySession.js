// Shared "logged-in host's current Party record" helpers — used by HousePartyHub.jsx (to link
// invites/potluck/photo-wall/room) and usePartyToolSync (to persist the local-only manage tools).
// Everything here is best-effort and silent: a logged-out host, or any network failure, just
// means nothing gets saved to the backend — the tool still works exactly as it did locally.

const BASE_URL = import.meta.env.VITE_BASE_URL;
export const PARTY_SESSION_KEY = "tendr_hp_current_party";

// Returns the current party id for this browser session, creating one on the backend
// (and remembering it in sessionStorage) the first time it's needed. Logged-out hosts get null.
export async function ensureHostParty(token) {
  if (!token) return null;
  const existing = sessionStorage.getItem(PARTY_SESSION_KEY);
  if (existing) return existing;
  try {
    const res = await fetch(`${BASE_URL}/parties`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({}),
    });
    if (!res.ok) return null;
    const d = await res.json();
    const partyId = d?.party?._id;
    if (!partyId) return null;
    sessionStorage.setItem(PARTY_SESSION_KEY, partyId);
    return partyId;
  } catch {
    return null;
  }
}

export async function linkToHostParty(token, type, resourceId) {
  if (!token || !type || !resourceId) return;
  try {
    const partyId = await ensureHostParty(token);
    if (!partyId) return;
    await fetch(`${BASE_URL}/parties/${partyId}/link`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({ type, id: resourceId }),
    });
  } catch {
    // Best-effort — never surface this to the host, it's a background convenience only.
  }
}
