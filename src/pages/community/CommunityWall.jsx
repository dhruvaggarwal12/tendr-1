import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const CATEGORIES = [
  { key: "all",   label: "All",              emoji: "✨" },
  { key: "polls", label: "Polls & Votes",    emoji: "📊" },
  { key: "ideas", label: "Ideas & Inspo",    emoji: "💡" },
  { key: "ask",   label: "Ask the Community",emoji: "🙋" },
];

const REACTIONS = [
  { key: "agree",     emoji: "👍", label: "Agree"      },
  { key: "facedThis", emoji: "🙋", label: "Faced this" },
  { key: "greatIdea", emoji: "💡", label: "Great idea" },
  { key: "loveThis",  emoji: "❤️", label: "Love this"  },
];

const ADMIN_TAGS = [
  { key: "realTalk",      label: "Real Talk",     emoji: "💬" },
  { key: "emotional",     label: "Emotional",     emoji: "🥹" },
  { key: "hiddenGem",     label: "Hidden Gem",    emoji: "💎" },
  { key: "mustRead",      label: "Must Read",     emoji: "📌" },
  { key: "proTip",        label: "Pro Tip",       emoji: "🔑" },
  { key: "trending",      label: "Trending",      emoji: "🔥" },
  { key: "wholesome",     label: "Wholesome",     emoji: "🌸" },
  { key: "controversial", label: "Controversial", emoji: "⚡" },
];


const catColor = {
  polls: { bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)",  text: "#1d4ed8" },
  ideas: { bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.25)",  text: "#7e22ce" },
  ask:   { bg: "rgba(234,179,8,0.1)",   border: "rgba(234,179,8,0.25)",   text: "#92400e" },
  story: { bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",   text: "#15803d" },
};

const labelSt = { display: "block", fontSize: 11, fontWeight: 700, color: "#6B3A1F", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" };
const inputSt = { padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", background: "#fff", width: "100%", boxSizing: "border-box" };

function authFetch(path, opts = {}) {
  const token = localStorage.getItem("tendr_token");
  return fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
    credentials: "include",
  });
}

const BLANK_FORM = { title: "", body: "", category: "story", event: "", city: "", authorName: "", pollOptionTexts: ["", ""] };

const IS_PROD = ["tendr.co.in", "www.tendr.co.in"].includes(window.location.hostname);

const SEED_POSTS = [
  { id: "seed-ask-1", author: "Tendr Team", avatar: "T", avatarColor: "#C47A2E", date: "18 Jun", category: "ask", title: "How far in advance should I book a decorator for a birthday party?", body: "", reactions: { agree: 3, facedThis: 5, greatIdea: 0, loveThis: 1 }, comments: 0, bookmarks: 0, isFromApi: false },
  { id: "seed-ask-2", author: "Tendr Team", avatar: "T", avatarColor: "#C47A2E", date: "15 Jun", category: "ask", title: "What's a realistic budget for a 100-person get-together in Delhi NCR?", body: "", reactions: { agree: 7, facedThis: 4, greatIdea: 2, loveThis: 0 }, comments: 0, bookmarks: 0, isFromApi: false },
  { id: "seed-ask-3", author: "Tendr Team", avatar: "T", avatarColor: "#C47A2E", date: "12 Jun", category: "ask", title: "Is it worth hiring a professional photographer for a baby shower?", body: "", reactions: { agree: 2, facedThis: 1, greatIdea: 0, loveThis: 6 }, comments: 0, bookmarks: 0, isFromApi: false },
  { id: "seed-ask-4", author: "Tendr Team", avatar: "T", avatarColor: "#C47A2E", date: "9 Jun", category: "ask", title: "How do I handle last-minute vendor cancellations right before my event?", body: "", reactions: { agree: 11, facedThis: 9, greatIdea: 1, loveThis: 0 }, comments: 0, bookmarks: 0, isFromApi: false },
  { id: "seed-ask-5", author: "Tendr Team", avatar: "T", avatarColor: "#C47A2E", date: "5 Jun", category: "ask", title: "Any tips for managing seating arrangements for a large family gathering?", body: "", reactions: { agree: 4, facedThis: 6, greatIdea: 3, loveThis: 2 }, comments: 0, bookmarks: 0, isFromApi: false },
];

export default function CommunityWall() {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const isAdmin = user?.isAdmin === true;
  const isLoggedIn = !!localStorage.getItem("tendr_token");
  const standalone = ["tendr.co.in", "www.tendr.co.in"].includes(window.location.hostname)
    || new URLSearchParams(window.location.search).get("standalone") === "1";

  const { canInstall, triggerInstall } = useInstallPrompt();
  const [posts, setPosts]               = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [myReactions, setMyReactions]   = useState({});
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [adminTagOpen, setAdminTagOpen] = useState({});
  const [formOpen, setFormOpen]         = useState(false);
  const [form, setForm]                 = useState(BLANK_FORM);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Poll state
  const [pollSelected, setPollSelected]     = useState({});
  const [pollResults, setPollResults]       = useState({});
  const [pollSubmitting, setPollSubmitting] = useState({});

  // Comment state
  const [openComments, setOpenComments]   = useState({});
  const [commentData, setCommentData]     = useState({});  // { postId: { comments: [], loading: bool } }
  const [commentTexts, setCommentTexts]   = useState({});  // { postId: { name: "", text: "" } }
  const [commentPosting, setCommentPosting] = useState({});

  useEffect(() => {
    setPostsLoading(true);
    authFetch("/community/posts?limit=50")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const normalized = (data?.posts || []).map(p => ({
          ...p,
          id: p._id,
          author: p.authorName || "Community Member",
          avatar: (p.authorName || "C")[0].toUpperCase(),
          avatarColor: "#C47A2E",
          date: new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          reactions: {
            agree:     p.reactions?.agree     || 0,
            facedThis: p.reactions?.facedThis  || 0,
            greatIdea: p.reactions?.greatIdea  || 0,
            loveThis:  p.reactions?.loveThis   || 0,
          },
          comments: p.commentsCount || 0,
          bookmarks: 0,
          isFromApi: true,
        }));
        setPosts([...normalized.filter(p => p.category !== "story"), ...SEED_POSTS]);
      })
      .catch(() => { setPosts(SEED_POSTS); })
      .finally(() => setPostsLoading(false));
  }, []);

  const filtered = activeCategory === "all"
    ? posts
    : posts.filter(p => p.category === activeCategory);

  // ── Reactions ──────────────────────────────────────────────────────────────
  const handleReaction = async (postId, reactionKey) => {
    const current = myReactions[postId] || null;
    const next = current === reactionKey ? null : reactionKey;

    setMyReactions(prev => ({ ...prev, [postId]: next }));
    setPosts(prev => prev.map(p => {
      if ((p._id || p.id) !== postId) return p;
      const r = { ...p.reactions };
      if (current) r[current] = Math.max(0, (r[current] || 0) - 1);
      if (next)    r[next]    = (r[next] || 0) + 1;
      return { ...p, reactions: r };
    }));

    const post = posts.find(p => (p._id || p.id) === postId);
    if (post?.isFromApi && post?._id) {
      try {
        await authFetch(`/community/posts/${post._id}/react`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reaction: next || reactionKey }),
        });
      } catch {}
    }
  };

  // ── Poll voting ────────────────────────────────────────────────────────────
  const handlePollSubmit = async (postId) => {
    const idx = pollSelected[postId];
    if (idx == null) return;

    setPollSubmitting(prev => ({ ...prev, [postId]: true }));
    const post = posts.find(p => (p._id || p.id) === postId);

    if (post?.isFromApi && post?._id) {
      try {
        const res = await authFetch(`/community/posts/${post._id}/poll-vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ optionIndex: idx }),
        });
        if (res.ok) {
          const data = await res.json();
          setPollResults(prev => ({ ...prev, [postId]: { pollOptions: data.pollOptions, userVote: data.userVote } }));
          setPollSubmitting(prev => ({ ...prev, [postId]: false }));
          return;
        }
      } catch {}
    }

    // Local simulation (seed polls or no login)
    const opts = post?.pollOptions || [];
    const updated = opts.map((o, i) => ({ ...o, votes: i === idx ? (o.votes || 0) + 1 : (o.votes || 0) }));
    setPollResults(prev => ({ ...prev, [postId]: { pollOptions: updated, userVote: idx } }));
    setPollSubmitting(prev => ({ ...prev, [postId]: false }));
  };

  // ── Form submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const pollOptionTexts = form.pollOptionTexts.filter(t => t.trim());
    try {
      const res = await authFetch("/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          title: form.title,
          body: form.body || (form.category === "polls" ? "Vote below" : ""),
          tags: [],
          isAnonymous: false,
          authorName: !isLoggedIn ? (form.authorName.trim() || undefined) : undefined,
          pollOptions: form.category === "polls" ? pollOptionTexts : undefined,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        // Add to top of feed immediately
        const newPost = {
          ...created,
          id: created._id,
          avatar: (created.authorName || user?.name || "?")[0].toUpperCase(),
          avatarColor: "#C47A2E",
          date: "just now",
          reactions: { agree: 0, facedThis: 0, greatIdea: 0, loveThis: 0 },
          comments: 0,
          bookmarks: 0,
          isFromApi: true,
        };
        setPosts(prev => [newPost, ...prev]);
        setFormSubmitted("posted");
        setFormOpen(false);
        setForm(BLANK_FORM);
        setTimeout(() => setFormSubmitted(false), 3000);
      } else {
        setFormSubmitted("error");
        setTimeout(() => setFormSubmitted(false), 3000);
      }
    } catch {
      setFormSubmitted("error");
      setTimeout(() => setFormSubmitted(false), 3000);
    }
  };

  // ── Bookmarks ──────────────────────────────────────────────────────────────
  const toggleBookmark = (id) => {
    setBookmarkedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // ── Admin tags ─────────────────────────────────────────────────────────────
  const handleAdminTag = async (postId, tagKey) => {
    const post = posts.find(p => (p._id || p.id) === postId);
    const cur = post?.adminTags || [];
    const newTags = cur.includes(tagKey) ? cur.filter(t => t !== tagKey) : [...cur, tagKey];
    setPosts(prev => prev.map(p => (p._id || p.id) === postId ? { ...p, adminTags: newTags } : p));
    if (post?.isFromApi && post?._id) {
      try {
        await authFetch(`/community/admin/posts/${post._id}/moderate`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminTags: newTags }),
        });
      } catch {}
    }
  };

  // ── Comments ───────────────────────────────────────────────────────────────
  const toggleComments = async (postId, isApiPost) => {
    const isOpen = openComments[postId];
    setOpenComments(prev => ({ ...prev, [postId]: !isOpen }));
    if (!isOpen && isApiPost && !commentData[postId]) {
      setCommentData(prev => ({ ...prev, [postId]: { comments: [], loading: true } }));
      try {
        const res = await authFetch(`/community/posts/${postId}/comments`);
        const data = await res.json();
        setCommentData(prev => ({ ...prev, [postId]: { comments: data.comments || [], loading: false } }));
      } catch {
        setCommentData(prev => ({ ...prev, [postId]: { comments: [], loading: false } }));
      }
    }
  };

  const handleComment = async (postId, isApiPost) => {
    const text = commentTexts[postId]?.text?.trim();
    if (!text || commentPosting[postId]) return;
    setCommentPosting(prev => ({ ...prev, [postId]: true }));
    const guestName = !isLoggedIn ? (commentTexts[postId]?.name?.trim() || undefined) : undefined;
    try {
      const res = await authFetch(`/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, authorName: guestName }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setCommentData(prev => ({
          ...prev,
          [postId]: { loading: false, comments: [newComment, ...(prev[postId]?.comments || [])] },
        }));
        setCommentTexts(prev => ({ ...prev, [postId]: { ...prev[postId], text: "" } }));
        setPosts(prev => prev.map(p => (p._id || p.id) === postId ? { ...p, comments: (p.comments || 0) + 1 } : p));
      }
    } catch {}
    setCommentPosting(prev => ({ ...prev, [postId]: false }));
  };

  const catInfo = (key) => CATEGORIES.find(c => c.key === key) || CATEGORIES[0];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#FFFCF5", fontFamily: font, paddingTop: standalone ? "env(safe-area-inset-top, 0px)" : 0 }}>
      {standalone && <style>{`body { padding-top: env(safe-area-inset-top, 0px); }`}</style>}
      {!standalone && <HamburgerNav />}

      {isAdmin && (
        <div style={{ background: "linear-gradient(90deg,#92400e,#C47A2E)", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>🔒 Admin Mode</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>— Apply curated tags to posts below</span>
        </div>
      )}

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#2C1A0E 0%,#4A2810 50%,#6B3A1F 100%)", padding: "52px 24px 44px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%,rgba(196,122,46,0.18) 0%,transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-block", background: "rgba(204,171,74,0.15)", border: "1px solid rgba(204,171,74,0.3)", borderRadius: 100, padding: "5px 16px", fontSize: 11, fontWeight: 700, color: "#CCAB4A", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
            Community Wall
          </div>
          <h1 style={{ fontSize: "clamp(26px,5vw,42px)", fontWeight: 900, color: "#fff", margin: "0 0 14px", lineHeight: 1.18, letterSpacing: "-0.02em" }}>
            Stories from Every Celebration
          </h1>
          <p style={{ fontSize: "clamp(13px,2vw,16px)", color: "rgba(255,255,255,0.65)", maxWidth: 540, margin: "0 auto 28px", lineHeight: 1.65 }}>
            Real experiences, polls, creative ideas, and honest lessons — shared by people who celebrate with Tendr.
          </p>
          <button
            onClick={() => {
              if (standalone || isLoggedIn) { setFormOpen(v => !v); return; }
              navigate("/login");
            }}
            style={{ padding: "13px 32px", borderRadius: 100, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 6px 24px rgba(196,122,46,0.4)" }}>
            {formOpen ? "Close Form" : "+ Share Your Story"}
          </button>
          {!isLoggedIn && !standalone && (
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "10px 0 0", fontStyle: "italic" }}>
              Log in to share your story or create a poll
            </p>
          )}
        </div>
      </div>

      {/* Install banner — only on tendr.co.in */}
      {IS_PROD && (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "linear-gradient(135deg,rgba(196,122,46,0.08),rgba(204,171,74,0.06))", border: "1.5px solid rgba(196,122,46,0.22)", borderRadius: 14, padding: "12px 16px" }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>📲</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", marginBottom: 2 }}>Add Tendr to your home screen</div>
              <div style={{ fontSize: 11, color: "#9B7450", lineHeight: 1.4 }}>Get the full community experience as an app — no app store needed.</div>
            </div>
            <button
              onClick={() => canInstall ? triggerInstall() : null}
              style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
              Install →
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {formSubmitted && (
        <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", zIndex: 999, background: formSubmitted === "error" ? "#c0392b" : "#15803d", color: "#fff", padding: "12px 24px", borderRadius: 100, fontSize: 13, fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", fontFamily: font, whiteSpace: "nowrap" }}>
          {formSubmitted === "error" ? "✗ Something went wrong — try again." : "✓ Posted to the community wall!"}
        </div>
      )}

      {/* Submission Form */}
      {formOpen && (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px 0" }}>
          <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.2)", padding: "28px", boxShadow: "0 6px 30px rgba(196,122,46,0.08)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 20px" }}>Share Your Experience</h3>

            {(!isLoggedIn) && (
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Your Name (optional)</label>
                <input type="text" placeholder="e.g. Priya" value={form.authorName} onChange={e => setForm(p => ({ ...p, authorName: e.target.value }))} style={inputSt} />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelSt}>Category *</label>
                <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={inputSt}>
                  {CATEGORIES.filter(c => c.key !== "all").map(c => (
                    <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelSt}>Event Type</label>
                <input type="text" placeholder="e.g. Birthday Party" value={form.event} onChange={e => setForm(p => ({ ...p, event: e.target.value }))} style={inputSt} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={labelSt}>{form.category === "polls" ? "Poll Question *" : "Title *"}</label>
              <input required type="text" placeholder={form.category === "polls" ? "e.g. Which venue style do you prefer?" : "Give your story a headline..."} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={inputSt} />
            </div>

            {form.category !== "polls" && (
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Your Story *</label>
                <textarea required rows={4} placeholder="Tell us what happened, what surprised you, or what you'd suggest..." value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} style={{ ...inputSt, resize: "vertical", lineHeight: 1.6 }} />
              </div>
            )}

            {/* Poll options editor */}
            {form.category === "polls" && (
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Poll Options (2–4) *</label>
                {form.pollOptionTexts.map((opt, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <input
                      type="text"
                      required={idx < 2}
                      placeholder={`Option ${idx + 1}`}
                      value={opt}
                      onChange={e => {
                        const updated = [...form.pollOptionTexts];
                        updated[idx] = e.target.value;
                        setForm(p => ({ ...p, pollOptionTexts: updated }));
                      }}
                      style={{ ...inputSt, marginBottom: 0 }}
                    />
                    {form.pollOptionTexts.length > 2 && (
                      <button type="button" onClick={() => setForm(p => ({ ...p, pollOptionTexts: p.pollOptionTexts.filter((_, i) => i !== idx) }))}
                        style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #fca5a5", background: "#fff5f5", color: "#c0392b", cursor: "pointer", fontSize: 14, fontFamily: font, flexShrink: 0 }}>×</button>
                    )}
                  </div>
                ))}
                {form.pollOptionTexts.length < 4 && (
                  <button type="button" onClick={() => setForm(p => ({ ...p, pollOptionTexts: [...p.pollOptionTexts, ""] }))}
                    style={{ fontSize: 12, color: "#C47A2E", background: "none", border: "1px dashed rgba(196,122,46,0.4)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: font, fontWeight: 600 }}>
                    + Add Option
                  </button>
                )}
              </div>
            )}

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button type="submit" style={{ padding: "11px 28px", borderRadius: 100, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
                Post to Wall
              </button>
              <button type="button" onClick={() => setFormOpen(false)} style={{ padding: "11px 20px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Filter */}
      <div style={{ maxWidth: 900, margin: "32px auto 0", padding: "0 20px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
              style={{ padding: "8px 18px", borderRadius: 100, border: activeCategory === cat.key ? "2px solid #C47A2E" : "1.5px solid rgba(196,122,46,0.2)", background: activeCategory === cat.key ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#fff", color: activeCategory === cat.key ? "#fff" : "#6B3A1F", fontSize: 13, fontWeight: activeCategory === cat.key ? 700 : 500, cursor: "pointer", fontFamily: font, transition: "all 0.15s", whiteSpace: "nowrap" }}>
              {cat.emoji} {cat.label}
              {cat.key !== "all" && (
                <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.75 }}>
                  ({posts.filter(p => p.category === cat.key).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div style={{ maxWidth: 900, margin: "24px auto 80px", padding: "0 20px" }}>
        {postsLoading && (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B7450" }}>
            <div style={{ width: 32, height: 32, border: "3px solid rgba(196,122,46,0.2)", borderTopColor: "#C47A2E", borderRadius: "50%", animation: "cw-spin 0.65s linear infinite", margin: "0 auto 14px" }} />
            <style>{`@keyframes cw-spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: 14, fontWeight: 600 }}>Loading community posts…</p>
          </div>
        )}
        {!postsLoading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B7450" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌟</div>
            <p style={{ fontSize: 15, fontWeight: 600 }}>No posts here yet. Be the first to share!</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {filtered.map(post => {
            const postId = post._id || post.id;
            const cc = catColor[post.category] || catColor.story;
            const ci = catInfo(post.category);
            const isBookmarked = bookmarkedIds.has(postId);
            const myReaction = myReactions[postId] || null;
            const hasPoll = post.pollOptions?.length > 0;
            const pollResult = pollResults[postId];
            const pollSel = pollSelected[postId];

            return (
              <div key={postId}
                style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.12)", padding: "24px 28px", boxShadow: "0 2px 16px rgba(196,122,46,0.05)", transition: "box-shadow 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 28px rgba(196,122,46,0.12)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 16px rgba(196,122,46,0.05)"}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg,${post.avatarColor},#CCAB4A)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 800, flexShrink: 0 }}>
                      {post.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E" }}>{post.author}</div>
                      <div style={{ fontSize: 11, color: "#9B7450" }}>
                        {post.event && <span>{post.event}</span>}
                        {post.event && post.city && <span> · </span>}
                        {post.city && <span>{post.city}</span>}
                        <span style={{ color: "rgba(155,116,80,0.6)", marginLeft: 4 }}>· {post.date}</span>
                      </div>
                    </div>
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: cc.bg, border: `1px solid ${cc.border}`, color: cc.text, flexShrink: 0 }}>
                    {ci.emoji} {ci.label}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E", margin: "0 0 12px", lineHeight: 1.3 }}>{post.title}</h3>

                {/* Body — not shown for polls */}
                {post.body && !hasPoll && (
                  <p style={{ fontSize: 14, color: "#4A2810", lineHeight: 1.7, margin: "0 0 14px" }}>{post.body}</p>
                )}

                {/* ── Poll UI ── */}
                {hasPoll && (
                  <div style={{ marginBottom: 14 }}>
                    {pollResult ? (
                      /* Results after voting */
                      (() => {
                        const total = pollResult.pollOptions.reduce((s, o) => s + (o.votes || 0), 0);
                        return (
                          <>
                            {pollResult.pollOptions.map((opt, idx) => {
                              const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                              const isChosen = pollResult.userVote === idx;
                              return (
                                <div key={idx} style={{ marginBottom: 10 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                    <span style={{ fontSize: 13, color: isChosen ? "#C47A2E" : "#4A2810", fontWeight: isChosen ? 700 : 400 }}>
                                      {isChosen ? "✓ " : ""}{opt.text}
                                    </span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#9B7450" }}>{pct}%</span>
                                  </div>
                                  <div style={{ height: 7, borderRadius: 100, background: "rgba(196,122,46,0.1)", overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: `${pct}%`, borderRadius: 100, background: isChosen ? "#C47A2E" : "rgba(196,122,46,0.3)", transition: "width 0.5s ease" }} />
                                  </div>
                                </div>
                              );
                            })}
                            <div style={{ fontSize: 11, color: "#15803d", fontWeight: 600, marginTop: 8 }}>
                              ✓ Vote recorded · {total} vote{total !== 1 ? "s" : ""} total
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      /* Voting UI */
                      <>
                        {post.pollOptions.map((opt, idx) => (
                          <div key={idx}
                            onClick={() => setPollSelected(prev => ({ ...prev, [postId]: idx }))}
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, marginBottom: 6, cursor: "pointer", border: `1.5px solid ${pollSel === idx ? "#C47A2E" : "rgba(196,122,46,0.2)"}`, background: pollSel === idx ? "rgba(196,122,46,0.06)" : "#fdfaf5", transition: "all 0.15s" }}>
                            <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${pollSel === idx ? "#C47A2E" : "#d4b896"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#fff" }}>
                              {pollSel === idx && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C47A2E" }} />}
                            </div>
                            <span style={{ fontSize: 13, color: pollSel === idx ? "#C47A2E" : "#4A2810", fontWeight: pollSel === idx ? 600 : 400 }}>{opt.text}</span>
                          </div>
                        ))}

                        {/* Submit button — only appears once an option is selected */}
                        {pollSel != null && (
                          <button
                            onClick={() => handlePollSubmit(postId)}
                            disabled={pollSubmitting[postId]}
                            style={{ marginTop: 8, padding: "9px 22px", borderRadius: 100, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: pollSubmitting[postId] ? "wait" : "pointer", fontFamily: font, boxShadow: "0 3px 12px rgba(196,122,46,0.3)", opacity: pollSubmitting[postId] ? 0.7 : 1 }}>
                            {pollSubmitting[postId] ? "Submitting…" : "Submit Vote ✓"}
                          </button>
                        )}

                        <div style={{ fontSize: 11, color: "#9B7450", marginTop: 8 }}>
                          {post.pollOptions.reduce((s, o) => s + (o.votes || 0), 0)} vote{post.pollOptions.reduce((s, o) => s + (o.votes || 0), 0) !== 1 ? "s" : ""} so far
                          {pollSel == null ? " · Select an option to vote" : ""}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Admin-curated tags */}
                {post.adminTags?.length > 0 && !adminTagOpen[postId] && (
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
                    {post.adminTags.map(tagKey => {
                      const ti = ADMIN_TAGS.find(t => t.key === tagKey);
                      return ti ? (
                        <span key={tagKey} style={{ padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: "rgba(196,122,46,0.08)", color: "#C47A2E", border: "1px solid rgba(196,122,46,0.2)" }}>
                          {ti.emoji} {ti.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Reactions */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", borderTop: "1px solid rgba(196,122,46,0.08)", paddingTop: 14 }}>
                  {!hasPoll && REACTIONS.map(r => {
                    const isActive = myReaction === r.key;
                    const count = post.reactions[r.key] || 0;
                    return (
                      <button key={r.key} onClick={() => handleReaction(postId, r.key)}
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 100, border: `1.5px solid ${isActive ? "#C47A2E" : "rgba(196,122,46,0.15)"}`, background: isActive ? "rgba(196,122,46,0.1)" : "transparent", color: isActive ? "#C47A2E" : "#9B7450", fontSize: 12, fontWeight: isActive ? 700 : 500, cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}>
                        <span style={{ fontSize: 13 }}>{r.emoji}</span>
                        <span style={{ fontWeight: 700 }}>{count}</span>
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <button onClick={() => toggleComments(postId, post.isFromApi)}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 100, border: `1.5px solid ${openComments[postId] ? "#C47A2E" : "rgba(196,122,46,0.15)"}`, background: openComments[postId] ? "rgba(196,122,46,0.08)" : "transparent", color: openComments[postId] ? "#C47A2E" : "#9B7450", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}>
                      💬 {post.comments}
                    </button>
                    <button onClick={() => toggleBookmark(postId)}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 100, border: `1.5px solid ${isBookmarked ? "#CCAB4A" : "rgba(196,122,46,0.15)"}`, background: isBookmarked ? "rgba(204,171,74,0.12)" : "transparent", color: isBookmarked ? "#CCAB4A" : "#9B7450", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}>
                      {isBookmarked ? "🔖" : "🏷️"} {post.bookmarks}
                    </button>
                  </div>
                </div>

                {/* Comments panel */}
                {openComments[postId] && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(196,122,46,0.1)" }}>
                    {/* Existing comments */}
                    {commentData[postId]?.loading ? (
                      <div style={{ textAlign: "center", padding: "10px 0", color: "#9B7450", fontSize: 13 }}>Loading…</div>
                    ) : (commentData[postId]?.comments || []).length === 0 ? (
                      <p style={{ fontSize: 13, color: "#9B7450", fontStyle: "italic", margin: "0 0 14px" }}>No comments yet — be the first!</p>
                    ) : (
                      <div style={{ marginBottom: 16 }}>
                        {(commentData[postId]?.comments || []).map((c, idx) => (
                          <div key={c._id || idx} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                              {(c.authorName || "C")[0].toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{c.authorName || "Community Member"}</span>
                                <span style={{ fontSize: 11, color: "#9B7450" }}>{new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                              </div>
                              <p style={{ fontSize: 13, color: "#4A2810", lineHeight: 1.55, margin: 0 }}>{c.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Comment input */}
                    {!isLoggedIn && (
                      <input type="text" placeholder="Your name (optional)" value={commentTexts[postId]?.name || ""} onChange={e => setCommentTexts(prev => ({ ...prev, [postId]: { ...prev[postId], name: e.target.value } }))} style={{ ...inputSt, marginBottom: 8, fontSize: 12 }} />
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Add a comment…"
                        value={commentTexts[postId]?.text || ""}
                        onChange={e => setCommentTexts(prev => ({ ...prev, [postId]: { ...prev[postId], text: e.target.value } }))}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleComment(postId, post.isFromApi); } }}
                        style={{ ...inputSt, flex: 1, fontSize: 13 }}
                      />
                      <button
                        onClick={() => handleComment(postId, post.isFromApi)}
                        disabled={commentPosting[postId] || !commentTexts[postId]?.text?.trim()}
                        style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, flexShrink: 0, opacity: (!commentTexts[postId]?.text?.trim() || commentPosting[postId]) ? 0.5 : 1, transition: "opacity 0.15s" }}>
                        {commentPosting[postId] ? "…" : "Post"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Admin: tag management */}
                {isAdmin && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed rgba(196,122,46,0.15)" }}>
                    <button onClick={() => setAdminTagOpen(prev => ({ ...prev, [postId]: !prev[postId] }))}
                      style={{ fontSize: 11, color: "#9B7450", background: "none", border: "1px dashed rgba(196,122,46,0.3)", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontFamily: font, fontWeight: 600 }}>
                      🏷️ {adminTagOpen[postId] ? "Close" : (post.adminTags?.length > 0 ? `Edit Tags (${post.adminTags.length})` : "Add Tag")}
                    </button>
                    {adminTagOpen[postId] && (
                      <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {ADMIN_TAGS.map(tag => {
                          const isTagged = post.adminTags?.includes(tag.key);
                          return (
                            <button key={tag.key} onClick={() => handleAdminTag(postId, tag.key)}
                              style={{ padding: "5px 12px", borderRadius: 100, border: `1.5px solid ${isTagged ? "#C47A2E" : "rgba(196,122,46,0.2)"}`, background: isTagged ? "rgba(196,122,46,0.1)" : "transparent", color: isTagged ? "#C47A2E" : "#9B7450", fontSize: 11, fontWeight: isTagged ? 700 : 500, cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}>
                              {tag.emoji} {tag.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
