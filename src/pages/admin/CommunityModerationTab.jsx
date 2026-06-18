import React, { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";
const GOLD = "#C47A2E";

const STATUS_TABS = [
  { id: "pending",  label: "Pending",  color: "#d97706" },
  { id: "approved", label: "Approved", color: "#16a34a" },
  { id: "rejected", label: "Rejected", color: "#dc2626" },
];

function adminFetch(path, opts = {}) {
  const token = localStorage.getItem("tendr_token");
  return fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
    credentials: "include",
  }).then(r => {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  });
}

export default function CommunityModerationTab() {
  const [status, setStatus]   = useState("pending");
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]     = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const loadPosts = (s) => {
    setLoading(true);
    adminFetch(`/community/admin/posts?status=${s}&limit=50`)
      .then(data => setPosts(data.posts || data || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPosts(status); }, [status]);

  const moderate = async (id, update) => {
    try {
      await adminFetch(`/community/admin/posts/${id}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      setPosts(prev => prev.filter(p => String(p._id) !== String(id)));
      showToast("Updated ✓");
    } catch { showToast("Failed — try again"); }
  };

  const remove = async (id) => {
    try {
      await adminFetch(`/community/admin/posts/${id}`, { method: "DELETE" });
      setPosts(prev => prev.filter(p => String(p._id) !== String(id)));
      showToast("Deleted ✓");
    } catch { showToast("Delete failed"); }
  };

  return (
    <div style={{ padding: "28px 32px", fontFamily: font, maxWidth: 920, minHeight: "100vh", background: "#F8F4EF" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "#2C1A0E", color: "#fff", fontSize: 13, fontWeight: 600, borderRadius: 12, padding: "10px 20px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px" }}>🌟 Community Moderation</h2>
        <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Approve, reject, pin, or delete community posts.</p>
      </div>

      {/* Status tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {STATUS_TABS.map(tab => (
          <button key={tab.id} onClick={() => setStatus(tab.id)}
            style={{ padding: "8px 20px", borderRadius: 100, border: `1.5px solid ${status === tab.id ? tab.color : "rgba(0,0,0,0.1)"}`, background: status === tab.id ? tab.color : "#fff", color: status === tab.id ? "#fff" : "#555", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: "center", padding: "48px 0", color: "#9B7450", fontSize: 14 }}>Loading…</div>}

      {!loading && posts.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#9B7450", fontSize: 14 }}>No {status} posts.</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {posts.map(post => (
          <div key={post._id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.12)", padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>

            {/* Meta */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: GOLD, borderRadius: 100, padding: "2px 10px", textTransform: "uppercase" }}>{post.category}</span>
              {post.isPinned   && <span style={{ fontSize: 10, fontWeight: 700, color: GOLD, background: "rgba(196,122,46,0.1)", borderRadius: 100, padding: "2px 10px" }}>📌 Pinned</span>}
              {post.isFeatured && <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "rgba(124,58,237,0.08)", borderRadius: 100, padding: "2px 10px" }}>✨ Featured</span>}
              <span style={{ fontSize: 11, color: "#9B7450", marginLeft: "auto" }}>by {post.isAnonymous ? "Anonymous" : post.authorName} · {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>

            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", margin: "0 0 6px" }}>{post.title}</h3>
            <p style={{ fontSize: 13, color: "#5A3E2B", margin: "0 0 14px", lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{post.body}</p>

            {/* Stats */}
            <div style={{ fontSize: 12, color: "#9B7450", marginBottom: 14 }}>
              ❤️ {post.likes || 0} likes · 💬 {post.comments?.length || 0} comments
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {status === "pending" && (
                <>
                  <button onClick={() => moderate(post._id, { status: "approved" })}
                    style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => moderate(post._id, { status: "rejected" })}
                    style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    ✕ Reject
                  </button>
                </>
              )}
              {status === "approved" && (
                <>
                  <button onClick={() => moderate(post._id, { isPinned: !post.isPinned })}
                    style={{ padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${GOLD}`, background: post.isPinned ? GOLD : "#fff", color: post.isPinned ? "#fff" : GOLD, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    📌 {post.isPinned ? "Unpin" : "Pin"}
                  </button>
                  <button onClick={() => moderate(post._id, { isFeatured: !post.isFeatured })}
                    style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #7c3aed", background: post.isFeatured ? "#7c3aed" : "#fff", color: post.isFeatured ? "#fff" : "#7c3aed", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    ✨ {post.isFeatured ? "Unfeature" : "Feature"}
                  </button>
                  <button onClick={() => moderate(post._id, { status: "rejected" })}
                    style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #dc2626", background: "#fff", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    Reject
                  </button>
                </>
              )}
              {status === "rejected" && (
                <button onClick={() => moderate(post._id, { status: "approved" })}
                  style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  ✓ Re-approve
                </button>
              )}
              <button onClick={() => remove(post._id)}
                style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, marginLeft: "auto" }}>
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
