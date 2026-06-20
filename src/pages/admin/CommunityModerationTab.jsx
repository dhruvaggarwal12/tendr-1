import React, { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";
const GOLD = "#C47A2E";

const STATUS_TABS = [
  { id: "pending",  label: "Pending",  color: "#d97706" },
  { id: "approved", label: "Approved", color: "#16a34a" },
  { id: "rejected", label: "Rejected", color: "#dc2626" },
];

const CAT_COLORS = {
  ask:   { bg: "rgba(234,179,8,0.12)",   color: "#92400e",  label: "🙋 Ask" },
  polls: { bg: "rgba(59,130,246,0.12)",  color: "#1d4ed8",  label: "📊 Poll" },
  ideas: { bg: "rgba(168,85,247,0.12)",  color: "#7e22ce",  label: "💡 Ideas" },
  story: { bg: "rgba(34,197,94,0.12)",   color: "#15803d",  label: "🎉 Story" },
};

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

// ── Moderation Tab ─────────────────────────────────────────────────────────────
function ModerationTab() {
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
    <>
      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "#2C1A0E", color: "#fff", fontSize: 13, fontWeight: 600, borderRadius: 12, padding: "10px 20px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
          {toast}
        </div>
      )}

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
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: GOLD, borderRadius: 100, padding: "2px 10px", textTransform: "uppercase" }}>{post.category}</span>
              {post.isPinned   && <span style={{ fontSize: 10, fontWeight: 700, color: GOLD, background: "rgba(196,122,46,0.1)", borderRadius: 100, padding: "2px 10px" }}>📌 Pinned</span>}
              {post.isFeatured && <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "rgba(124,58,237,0.08)", borderRadius: 100, padding: "2px 10px" }}>✨ Featured</span>}
              <span style={{ fontSize: 11, color: "#9B7450", marginLeft: "auto" }}>by {post.isAnonymous ? "Anonymous" : post.authorName} · {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", margin: "0 0 6px" }}>{post.title}</h3>
            <p style={{ fontSize: 13, color: "#5A3E2B", margin: "0 0 14px", lineHeight: 1.55, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{post.body}</p>
            <div style={{ fontSize: 12, color: "#9B7450", marginBottom: 14 }}>
              ❤️ {post.likes || 0} likes · 💬 {post.comments?.length || 0} comments
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {status === "pending" && (
                <>
                  <button onClick={() => moderate(post._id, { status: "approved" })} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>✓ Approve</button>
                  <button onClick={() => moderate(post._id, { status: "rejected" })} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#dc2626", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>✕ Reject</button>
                </>
              )}
              {status === "approved" && (
                <>
                  <button onClick={() => moderate(post._id, { isPinned: !post.isPinned })} style={{ padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${GOLD}`, background: post.isPinned ? GOLD : "#fff", color: post.isPinned ? "#fff" : GOLD, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>📌 {post.isPinned ? "Unpin" : "Pin"}</button>
                  <button onClick={() => moderate(post._id, { isFeatured: !post.isFeatured })} style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #7c3aed", background: post.isFeatured ? "#7c3aed" : "#fff", color: post.isFeatured ? "#fff" : "#7c3aed", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>✨ {post.isFeatured ? "Unfeature" : "Feature"}</button>
                  <button onClick={() => moderate(post._id, { status: "rejected" })} style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid #dc2626", background: "#fff", color: "#dc2626", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Reject</button>
                </>
              )}
              {status === "rejected" && (
                <button onClick={() => moderate(post._id, { status: "approved" })} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>✓ Re-approve</button>
              )}
              <button onClick={() => remove(post._id)} style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)", color: "#ef4444", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, marginLeft: "auto" }}>🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Content Calendar Tab ───────────────────────────────────────────────────────
function CalendarTab() {
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState(null);
  const [editId, setEditId]     = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving]     = useState(false);
  const [posting, setPosting]   = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    adminFetch("/community/admin/calendar")
      .then(data => setPosts(data.posts || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const openEdit = (post) => {
    setEditId(post._id);
    setEditForm({
      scheduledDate: post.scheduledDate,
      scheduledTime: post.scheduledTime || "12:00",
      category:      post.category,
      title:         post.title,
      body:          post.body || "",
      pollOptions:   (post.pollOptions || []).join("\n"),
    });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const payload = {
        scheduledDate: editForm.scheduledDate,
        scheduledTime: editForm.scheduledTime,
        category:      editForm.category,
        title:         editForm.title,
        body:          editForm.body,
        pollOptions:   editForm.category === "polls"
          ? editForm.pollOptions.split("\n").map(s => s.trim()).filter(Boolean)
          : [],
      };
      const updated = await adminFetch(`/community/admin/calendar/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setPosts(prev => prev.map(p => p._id === editId ? updated : p));
      setEditId(null);
      showToast("Saved ✓");
    } catch { showToast("Save failed — try again"); }
    setSaving(false);
  };

  const publishNow = async (id) => {
    setPosting(id);
    try {
      await adminFetch(`/community/admin/calendar/${id}/publish-now`, { method: "POST" });
      setPosts(prev => prev.map(p => p._id === id ? { ...p, status: "published", publishedAt: new Date().toISOString() } : p));
      showToast("Published ✓");
    } catch (e) {
      showToast(e.message === "400" ? "Already published" : "Publish failed");
    }
    setPosting(null);
  };

  const pending   = posts.filter(p => p.status === "pending").length;
  const published = posts.filter(p => p.status === "published").length;

  return (
    <>
      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "#2C1A0E", color: "#fff", fontSize: 13, fontWeight: 600, borderRadius: 12, padding: "10px 20px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}>
          {toast}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Total", value: posts.length, color: GOLD },
          { label: "Published", value: published, color: "#16a34a" },
          { label: "Pending", value: pending, color: "#d97706" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.12)", padding: "14px 22px", display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: 11, color: "#9B7450", fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
        <div style={{ background: "rgba(196,122,46,0.06)", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.15)", padding: "12px 18px", fontSize: 12, color: "#6B3A1F", lineHeight: 1.6, display: "flex", alignItems: "center" }}>
          ⚡ Auto-posts daily at <strong style={{ margin: "0 4px" }}>12:00 PM IST</strong> as Tendr Team
        </div>
      </div>

      {loading && <div style={{ textAlign: "center", padding: "48px 0", color: "#9B7450", fontSize: 14 }}>Loading calendar…</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {posts.map(post => {
          const cat = CAT_COLORS[post.category] || CAT_COLORS.ask;
          const isPublished = post.status === "published";
          const isEditing   = editId === post._id;

          return (
            <div key={post._id} style={{ background: "#fff", borderRadius: 14, border: `1.5px solid ${isPublished ? "rgba(22,163,74,0.2)" : "rgba(196,122,46,0.12)"}`, padding: "16px 20px", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>

              {/* Row: day + category + date + status */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: isEditing ? 14 : 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#9B7450", minWidth: 44 }}>Day {post.dayNumber}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 100, background: cat.bg, color: cat.color }}>{cat.label}</span>
                <span style={{ fontSize: 11, color: "#9B7450" }}>{post.scheduledDate} · {post.scheduledTime || "12:00"} IST</span>
                <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 100, background: isPublished ? "rgba(22,163,74,0.1)" : "rgba(217,119,6,0.1)", color: isPublished ? "#16a34a" : "#d97706" }}>
                  {isPublished ? "✓ Published" : "⏳ Scheduled"}
                </span>
              </div>

              {/* Edit form */}
              {isEditing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", display: "block", marginBottom: 4 }}>Date</label>
                      <input type="date" value={editForm.scheduledDate} onChange={e => setEditForm(p => ({ ...p, scheduledDate: e.target.value }))}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 12, boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", display: "block", marginBottom: 4 }}>Time (IST)</label>
                      <input type="time" value={editForm.scheduledTime} onChange={e => setEditForm(p => ({ ...p, scheduledTime: e.target.value }))}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 12, boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", display: "block", marginBottom: 4 }}>Category</label>
                      <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 12, boxSizing: "border-box" }}>
                        {["ask", "polls", "ideas", "story"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", display: "block", marginBottom: 4 }}>Title</label>
                    <input type="text" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                      style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, boxSizing: "border-box" }} />
                  </div>
                  {editForm.category !== "polls" && (
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", display: "block", marginBottom: 4 }}>Body</label>
                      <textarea rows={4} value={editForm.body} onChange={e => setEditForm(p => ({ ...p, body: e.target.value }))}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, boxSizing: "border-box", resize: "vertical", lineHeight: 1.6 }} />
                    </div>
                  )}
                  {editForm.category === "polls" && (
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", display: "block", marginBottom: 4 }}>Poll Options (one per line)</label>
                      <textarea rows={4} value={editForm.pollOptions} onChange={e => setEditForm(p => ({ ...p, pollOptions: e.target.value }))}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, boxSizing: "border-box", resize: "vertical" }} />
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={saveEdit} disabled={saving}
                      style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: GOLD, color: "#fff", fontSize: 12, fontWeight: 700, cursor: saving ? "wait" : "pointer", fontFamily: font, opacity: saving ? 0.7 : 1 }}>
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                    <button onClick={() => setEditId(null)}
                      style={{ padding: "8px 16px", borderRadius: 8, border: "1.5px solid rgba(0,0,0,0.12)", background: "#fff", color: "#555", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", marginBottom: 4, lineHeight: 1.35 }}>{post.title}</div>
                  {post.body && (
                    <div style={{ fontSize: 12, color: "#9B7450", lineHeight: 1.5, marginBottom: 8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{post.body}</div>
                  )}
                  {post.pollOptions?.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      {post.pollOptions.map((opt, i) => (
                        <span key={i} style={{ fontSize: 11, padding: "2px 10px", borderRadius: 100, background: "rgba(59,130,246,0.08)", color: "#1d4ed8", border: "1px solid rgba(59,130,246,0.2)" }}>{opt}</span>
                      ))}
                    </div>
                  )}
                  {isPublished && post.publishedAt && (
                    <div style={{ fontSize: 11, color: "#16a34a", marginBottom: 8 }}>
                      Published {new Date(post.publishedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    {!isPublished && (
                      <button onClick={() => publishNow(post._id)} disabled={posting === post._id}
                        style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#16a34a", color: "#fff", fontSize: 11, fontWeight: 700, cursor: posting === post._id ? "wait" : "pointer", fontFamily: font, opacity: posting === post._id ? 0.7 : 1 }}>
                        {posting === post._id ? "Posting…" : "⚡ Post Now"}
                      </button>
                    )}
                    <button onClick={() => openEdit(post)}
                      style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${GOLD}`, background: "#fff", color: GOLD, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                      ✏️ Edit
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Main Export ────────────────────────────────────────────────────────────────
export default function CommunityModerationTab() {
  const [activeTab, setActiveTab] = useState("moderation");

  const TABS = [
    { id: "moderation", label: "🌟 Moderation" },
    { id: "calendar",   label: "📅 Content Calendar" },
  ];

  return (
    <div style={{ padding: "28px 32px", fontFamily: font, maxWidth: 920, minHeight: "100vh", background: "#F8F4EF" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#2C1A0E", margin: "0 0 4px" }}>Community</h2>
        <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Moderate posts and manage the automated content calendar.</p>
      </div>

      {/* Top-level tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28, borderBottom: "1.5px solid rgba(196,122,46,0.15)", paddingBottom: 0 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding: "10px 22px", borderRadius: "10px 10px 0 0", border: "none", background: activeTab === tab.id ? "#fff" : "transparent", color: activeTab === tab.id ? "#2C1A0E" : "#9B7450", fontSize: 13, fontWeight: activeTab === tab.id ? 800 : 600, cursor: "pointer", fontFamily: font, borderBottom: activeTab === tab.id ? "2px solid #C47A2E" : "2px solid transparent", marginBottom: -1.5 }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "moderation" && <ModerationTab />}
      {activeTab === "calendar"   && <CalendarTab />}
    </div>
  );
}
