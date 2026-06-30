// src/hooks/useConversations.js
import { useEffect, useMemo, useState, useCallback } from "react";
import { fetchConversations, mapConversationsToVendors, getAllConversation } from "../apis/conversationsApi";

export default function useConversations({ enabled = true } = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentChats, setRecentChats] = useState([]);
  const [supportChats, setSupportChats] = useState([]);
  const [adminChats, setAdminChats] = useState([]);

  const refetch = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");
      const list = await getAllConversation({ signal , chatType: "vendor"});
      const vendorList = Array.isArray(list) ? list : [];

      const supportList = await getAllConversation({ signal , chatType: "support"});
      setSupportChats(Array.isArray(supportList) ? supportList : []);

      // "event" maps to chatType:"concierge" on the backend (Smart Plan chats).
      // Merged into the same Chat tab list as normal vendor chats — no separate panel.
      const adminList = await getAllConversation({ signal , chatType: "event"});
      const conciergeList = Array.isArray(adminList) ? adminList : [];
      setAdminChats(conciergeList);

      const merged = [...vendorList, ...conciergeList].sort(
        (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
      setRecentChats(merged);

    } catch (e) {
      const status = e?.status ?? e?.response?.status;
      const msg = e?.message || String(e) || "";
      // Treat 404 like "no conversations yet" (don’t leak dev-ish text into UI)
      if (status === 404 || (/\/conversations/.test(msg) && /404/.test(msg))) {
        setRecentChats([]);
        setSupportChats([]);
        setAdminChats([]);
        setError("");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const ctrl = new AbortController();
    refetch(ctrl.signal);
    return () => ctrl.abort();
  }, [enabled, refetch]);

  const vendors = useMemo(
    () => mapConversationsToVendors(recentChats || []),
    [recentChats]
  );

  // Public API
  const reload = useCallback(() => refetch(), [refetch]);

  return { loading, error, recentChats, supportChats, adminChats, vendors, reload };
}
