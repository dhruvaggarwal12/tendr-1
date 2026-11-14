import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Customer referral codes now rotate to a brand-new string every 30 days (the old one stops
// working — see backend routes/referral.js), so they can no longer be derived locally from
// the user's id the way src/utils/referral.js's generateReferralCode used to. This fetches
// the current, server-issued code from GET /referrals/my-code instead, caching it per user id
// (module-scoped) so the several places that show it don't each fire their own request, and
// so a different account logging in within the same tab never sees a stale cached code.
const cacheByUserId = {};

export function useMyReferralCode() {
  const { token, user } = useSelector((s) => s.auth || {});
  const uid = user?._id;
  const [data, setData] = useState(() => (uid && cacheByUserId[uid]) || null);
  const [loading, setLoading] = useState(!(uid && cacheByUserId[uid]));

  useEffect(() => {
    if (!token || !uid) { setLoading(false); return; }
    if (cacheByUserId[uid]) { setData(cacheByUserId[uid]); setLoading(false); return; }
    setLoading(true);
    fetch(`${BASE_URL}/referrals/my-code`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) { cacheByUserId[uid] = d; setData(d); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, uid]);

  return {
    code: data?.code || null,
    formatted: data?.formatted || null,
    validUntil: data?.validUntil || null,
    usageCount: data?.usageCount || 0,
    loading,
  };
}
