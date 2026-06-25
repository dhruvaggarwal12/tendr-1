import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import { POSTS, POLLS, IDEAS, CATEGORY_COLORS } from "../../data/celebrationHubData";

const font = "'Outfit', sans-serif";
const BROWN = "#2C1A0E";
const GOLD  = "#C47A2E";
const CREAM = "#FFF8EE";
const BASE_URL = import.meta.env.VITE_BASE_URL;

// Tabs — no Trending; Discussions renamed to All Posts
const TABS = [
  { id: "all",     label: "All Posts",         emoji: "💬", accent: "#e05d2e" },
  { id: "polls",   label: "Polls & Votes",      emoji: "📊", accent: GOLD },
  { id: "ideas",   label: "Ideas & Inspo",      emoji: "💡", accent: "#7c3aed" },
  { id: "ask",     label: "Ask the Community",  emoji: "🙋", accent: "#16a34a" },
  { id: "stories", label: "Share Your Story",   emoji: "🎉", accent: "#ea580c" },
];

// Category options for the new-post modal — aligned with the 4 non-"all" tabs
const POST_CATS = [
  { id: "ask",     label: "Ask the Community", emoji: "🙋" },
  { id: "stories", label: "Share Your Story",  emoji: "🎉" },
  { id: "polls",   label: "Polls & Votes",     emoji: "📊" },
  { id: "ideas",   label: "Ideas & Inspo",     emoji: "💡" },
];

// Human-readable labels for all category IDs (new + legacy static posts)
const CAT_LABELS = {
  ask:          "Ask the Community",
  stories:      "Share Your Story",
  polls:        "Polls & Votes",
  ideas:        "Ideas & Inspo",
  surprise:     "Surprise Moments",
  "love-story": "Love Story",
  "epic-fail":  "Epic Fails",
  emotional:    "Emotional Highlights",
  "hidden-gem": "Hidden Gem",
  "wow-factor": "Wow Factor",
  "money-saved":"Budget Wins",
  "real-talk":  "Real Talk",
  shoutout:     "Shoutouts",
  "my-story":   "My Event Story",
};

const LIKE_KEY  = "tendr_hub_liked";
const REACT_KEY = "tendr_hub_reactions";

function loadLiked()     { try { return new Set(JSON.parse(localStorage.getItem(LIKE_KEY)  || "[]")); } catch { return new Set(); } }
function loadReactions() { try { return JSON.parse(localStorage.getItem(REACT_KEY) || "{}");           } catch { return {}; } }
function saveLiked(set)  { try { localStorage.setItem(LIKE_KEY,  JSON.stringify([...set])); } catch {} }
function saveReactions(r){ try { localStorage.setItem(REACT_KEY, JSON.stringify(r));        } catch {} }

function postId(p) { return String(p._id || p.id); }

// ── Reaction bar (interactive) ─────────────────────────────────────────────
const REACTION_ITEMS = [
  { key: "agree",     label: "Agree",      emoji: "👍" },
  { key: "facedThis", label: "Faced this", emoji: "🙋" },
  { key: "greatIdea", label: "Great idea", emoji: "💡" },
  { key: "loveThis",  label: "Love this",  emoji: "❤️" },
];

function ReactionBar({ reactions, userReaction, onReact }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
      {REACTION_ITEMS.map(({ key, label, emoji }) => {
        const base  = reactions?.[key] || 0;
        const count = base + (userReaction === key ? 1 : 0);
        const active = userReaction === key;
        return (
          <button key={key} onClick={() => onReact(key)}
            style={{ fontSize: 11, color: active ? "#fff" : "#9B7450", background: active ? GOLD : "rgba(196,122,46,0.07)", border: `1px solid ${active ? GOLD : "rgba(196,122,46,0.15)"}`, borderRadius: 100, padding: "5px 10px", display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontFamily: font, touchAction: "manipulation", transition: "all 0.15s", fontWeight: active ? 700 : 500 }}>
            {emoji} {count > 0 ? count.toLocaleString() : ""} {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Single post card ────────────────────────────────────────────────────────
function PostCard({ post, liked, onLike, onRemove, isAdmin, onAddComment, userReaction, onReact, token }) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const catColor = CATEGORY_COLORS[post.category] || GOLD;
  const bodyText = post.description || post.body || "";

  const toggleComments = () => {
    if (!showComments && post._id && !post.comments?.length && BASE_URL) {
      setCommentsLoading(true);
      fetch(`${BASE_URL}/community/posts/${post._id}/comments`)
        .then(r => r.json()).then(data => { if (Array.isArray(data)) setComments(data); })
        .catch(() => {}).finally(() => setCommentsLoading(false));
    }
    setShowComments(v => !v);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    const text = commentText.trim();
    setCommentText("");
    const newComment = await onAddComment(post._id || post.id, text);
    if (newComment) setComments(prev => [newComment, ...prev]);
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.1)", padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", fontFamily: font }}>
      {/* Category + badges row */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: catColor, borderRadius: 100, padding: "2px 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {CAT_LABELS[post.category] || post.category?.replace(/-/g, " ")}
        </span>
        {post.isPinned   && <span style={{ fontSize: 10, fontWeight: 700, color: GOLD,     background: "rgba(196,122,46,0.1)",   borderRadius: 100, padding: "2px 10px" }}>📌 Pinned</span>}
        {post.isFeatured && <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "rgba(124,58,237,0.08)", borderRadius: 100, padding: "2px 10px" }}>✨ Featured</span>}
        {post._isUserCreated && <span style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", background: "rgba(22,163,74,0.08)", borderRadius: 100, padding: "2px 10px" }}>🆕 New</span>}
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 15, fontWeight: 800, color: BROWN, margin: "0 0 8px", lineHeight: 1.3, cursor: "pointer" }} onClick={() => setExpanded(v => !v)}>
        {post.title}
      </h3>

      {/* Body */}
      {expanded
        ? <p style={{ fontSize: 13, color: "#5A3E2B", lineHeight: 1.6, margin: "0 0 10px" }}>{bodyText}</p>
        : <p style={{ fontSize: 13, color: "#7A5535", lineHeight: 1.5, margin: "0 0 10px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{bodyText}</p>
      }
      <button onClick={() => setExpanded(v => !v)} style={{ fontSize: 12, color: GOLD, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: font, padding: 0, marginBottom: 10 }}>
        {expanded ? "Show less ↑" : "Read more ↓"}
      </button>

      {/* Meta + actions row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "#9B7450", flexWrap: "wrap", gap: 8 }}>
        <span>{post.isAnonymous ? "Anonymous" : post.author} · {post.date}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Like button */}
          <button onClick={() => onLike(post.id || post._id)}
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: liked ? "#e05d2e" : "#9B7450", background: liked ? "rgba(224,93,46,0.08)" : "transparent", border: liked ? "1px solid rgba(224,93,46,0.2)" : "1px solid transparent", borderRadius: 100, padding: "6px 12px", cursor: "pointer", fontFamily: font, transition: "all 0.15s", touchAction: "manipulation" }}>
            {liked ? "❤️" : "🤍"} {(post.likes || 0) + (liked ? 1 : 0)}
          </button>
          {/* Comments toggle */}
          <button onClick={toggleComments}
            style={{ fontSize: 12, color: "#9B7450", background: "none", border: "none", cursor: "pointer", fontFamily: font, fontWeight: 600, padding: "6px 8px", touchAction: "manipulation" }}>
            💬 {post.commentsCount ?? comments.length ?? post.answers ?? 0} replies
          </button>
          {/* Admin remove */}
          {isAdmin && (
            <button onClick={() => onRemove(post.id || post._id)}
              style={{ fontSize: 11, color: "#ef4444", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 100, padding: "3px 10px", cursor: "pointer", fontFamily: font, fontWeight: 700 }}>
              🗑 Remove
            </button>
          )}
        </div>
      </div>

      {post.reactions && (
        <ReactionBar
          reactions={post.reactions}
          userReaction={userReaction}
          onReact={(type) => onReact(post.id || post._id, type)}
        />
      )}

      {/* Comments section */}
      {showComments && (
        <div style={{ marginTop: 14, borderTop: "1px solid rgba(196,122,46,0.1)", paddingTop: 12 }}>
          {commentsLoading && <div style={{ fontSize: 12, color: "#9B7450", marginBottom: 8 }}>Loading comments…</div>}
          {comments.map((c, i) => (
            <div key={c._id || i} style={{ background: "rgba(196,122,46,0.04)", borderRadius: 10, padding: "8px 12px", marginBottom: 8, borderLeft: `3px solid ${GOLD}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 3 }}>{c.authorName || c.author || "Community Member"}</div>
              <div style={{ fontSize: 13, color: "#3B2F2F", lineHeight: 1.5 }}>{c.text}</div>
            </div>
          ))}
          {/* Add comment */}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleComment()}
              placeholder="Add a comment…"
              style={{ flex: 1, fontSize: 13, padding: "8px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.2)", background: "#FFFCF5", fontFamily: font, color: BROWN, outline: "none" }}
            />
            <button onClick={handleComment}
              style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, touchAction: "manipulation", flexShrink: 0 }}>
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Poll card ───────────────────────────────────────────────────────────────
function PollCard({ poll }) {
  const [voted, setVoted] = useState(null);
  const maxVotes = Math.max(...poll.options.map(o => o.votes));
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.1)", padding: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", fontFamily: font }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: BROWN, margin: "0 0 16px", lineHeight: 1.35 }}>{poll.question}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {poll.options.map((opt, i) => {
          const pct = Math.round((opt.votes / poll.totalVotes) * 100);
          const isWinner = opt.votes === maxVotes;
          const isVoted  = voted === i;
          return (
            <button key={i} onClick={() => setVoted(i)}
              style={{ position: "relative", width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${isVoted ? GOLD : "rgba(196,122,46,0.18)"}`, background: "transparent", cursor: "pointer", fontFamily: font, textAlign: "left", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: isWinner ? "rgba(196,122,46,0.12)" : "rgba(196,122,46,0.06)", borderRadius: 10, transition: "width 0.4s" }} />
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: isWinner ? 700 : 500, color: isWinner ? BROWN : "#5A3E2B" }}>{opt.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: isWinner ? GOLD : "#9B7450" }}>{pct}%</span>
              </div>
            </button>
          );
        })}
      </div>
      <p style={{ fontSize: 11, color: "#9B7450", margin: "12px 0 0", textAlign: "right" }}>
        {poll.totalVotes.toLocaleString()} votes · {poll.date}
      </p>
    </div>
  );
}

// ── Idea card ───────────────────────────────────────────────────────────────
function IdeaCard({ idea }) {
  const [saved, setSaved] = useState(false);
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.1)", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", fontFamily: font }}>
      <div style={{ position: "relative", height: 180 }}>
        <img src={idea.image} alt={idea.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
        <button onClick={() => setSaved(v => !v)}
          style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {saved ? "❤️" : "🤍"}
        </button>
      </div>
      <div style={{ padding: "14px 16px" }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: BROWN, margin: "0 0 5px" }}>{idea.title}</h3>
        <p style={{ fontSize: 12, color: "#7A5535", margin: "0 0 10px", lineHeight: 1.5 }}>{idea.desc}</p>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
          {idea.tags.slice(0, 3).map(t => (
            <span key={t} style={{ fontSize: 10, color: "#9B7450", background: "rgba(196,122,46,0.07)", borderRadius: 100, padding: "2px 8px" }}>#{t}</span>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#9B7450" }}>
          <span>by {idea.author}</span>
          <span>❤️ {(idea.saved + (saved ? 1 : 0)).toLocaleString()} saved</span>
        </div>
      </div>
    </div>
  );
}

// ── New Post Modal ──────────────────────────────────────────────────────────
function NewPostModal({ onClose, onSubmit, authorName }) {
  const [form, setForm] = useState({ title: "", description: "", category: "ask", isAnonymous: false });
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
    onClose();
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 2001, width: "min(94vw,560px)", borderRadius: 20, background: CREAM, boxShadow: "0 24px 72px rgba(44,26,14,0.28)", fontFamily: font, display: "flex", flexDirection: "column", maxHeight: "90vh", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid rgba(196,122,46,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 900, color: BROWN }}>✍️ Create a Post</div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(44,26,14,0.08)", border: "none", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: BROWN }}>✕</button>
        </div>
        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px 8px" }}>
          {/* Category */}
          <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Category</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", background: "#fff", fontFamily: font, fontSize: 13, color: BROWN, marginBottom: 14, outline: "none" }}>
            {POST_CATS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
          </select>
          {/* Title */}
          <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Title *</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Give your post a clear title…"
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", background: "#fff", fontFamily: font, fontSize: 13, color: BROWN, marginBottom: 14, outline: "none", boxSizing: "border-box" }} />
          {/* Body */}
          <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Your Story / Question *</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Share what happened, what you learned, or what you're asking…"
            rows={5}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", background: "#fff", fontFamily: font, fontSize: 13, color: BROWN, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
          {/* Anonymous toggle */}
          <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, cursor: "pointer" }}>
            <input type="checkbox" checked={form.isAnonymous} onChange={e => setForm(f => ({ ...f, isAnonymous: e.target.checked }))} style={{ width: 16, height: 16, accentColor: GOLD }} />
            <span style={{ fontSize: 13, color: "#7A5535" }}>Post anonymously</span>
          </label>
        </div>
        {/* Sticky footer */}
        <div style={{ flexShrink: 0, padding: "12px 22px 18px", borderTop: "1px solid rgba(196,122,46,0.1)", background: CREAM }}>
          <button onClick={handle} disabled={loading || !form.title.trim() || !form.description.trim()}
            style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: form.title.trim() && form.description.trim() ? `linear-gradient(135deg,${GOLD},#CCAB4A)` : "rgba(196,122,46,0.2)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: form.title.trim() ? "pointer" : "not-allowed", fontFamily: font }}>
            {loading ? "Posting…" : "Share Post →"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function CelebrationHub() {
  const { user, token } = useSelector((s) => s.auth);
  const isAdmin = !!user?.isAdmin;

  const [activeTab,     setActiveTab]     = useState("all");
  const [posts,         setPosts]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [likedIds,      setLikedIds]      = useState(loadLiked);
  const [userReactions, setUserReactions] = useState(loadReactions);
  const [showNewPost,   setShowNewPost]   = useState(false);
  const [toast,         setToast]         = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  // Fetch approved posts from backend; fall back to static POSTS if empty/failed
  useEffect(() => {
    if (!BASE_URL) { setPosts(POSTS); setLoading(false); return; }
    fetch(`${BASE_URL}/community/posts?limit=50`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setPosts(data?.posts?.length ? data.posts : POSTS); })
      .catch(() => setPosts(POSTS))
      .finally(() => setLoading(false));
  }, []);

  // Per-tab filtered lists
  const postsForTab = (tab) => {
    if (tab === "all")     return posts;
    if (tab === "stories") return posts.filter(p => p.category === "stories" || p.category === "my-story" || p.category === "story");
    if (tab === "ask")     return posts.filter(p => p.category === "ask"     || p.category === "real-talk");
    if (tab === "polls")   return posts.filter(p => p.category === "polls");
    if (tab === "ideas")   return posts.filter(p => p.category === "ideas");
    return posts;
  };

  // Like toggle — requires auth; calls API, updates local state from response
  const handleLike = async (pid) => {
    const id = String(pid);
    if (!token) { showToast("Log in to like posts"); return; }
    try {
      const r = await fetch(`${BASE_URL}/community/posts/${id}/like`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      setPosts(prev => prev.map(p => postId(p) === id ? { ...p, likes: data.likes } : p));
      setLikedIds(prev => {
        const next = new Set(prev);
        data.liked ? next.add(id) : next.delete(id);
        saveLiked(next);
        return next;
      });
    } catch {}
  };

  // Reaction toggle — requires auth; calls API, updates local state from response
  const handleReact = async (pid, reactionType) => {
    const id = String(pid);
    if (!token) { showToast("Log in to react to posts"); return; }
    try {
      const r = await fetch(`${BASE_URL}/community/posts/${id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reaction: reactionType }),
      });
      const data = await r.json();
      setPosts(prev => prev.map(p => postId(p) === id ? { ...p, reactions: data.reactions } : p));
      setUserReactions(prev => {
        const next = { ...prev, [id]: data.userReaction || null };
        saveReactions(next);
        return next;
      });
    } catch {}
  };

  // Admin remove — calls admin DELETE endpoint
  const handleRemove = (pid) => {
    const id = String(pid);
    setPosts(prev => prev.filter(p => postId(p) !== id));
    if (BASE_URL && token) {
      fetch(`${BASE_URL}/community/admin/posts/${id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
  };

  // Add comment — requires auth; calls API and returns new comment object for PostCard
  const handleAddComment = async (pid, text) => {
    const id = String(pid);
    if (!token) { showToast("Log in to comment"); return null; }
    try {
      const r = await fetch(`${BASE_URL}/community/posts/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      const comment = await r.json();
      setPosts(prev => prev.map(p => postId(p) === id ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
      return comment;
    } catch { return null; }
  };

  // New post — requires auth; submitted post goes to pending (admin must approve)
  const handleNewPost = async (form) => {
    if (!token) { showToast("Log in to create a post"); return; }
    try {
      await fetch(`${BASE_URL}/community/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: form.title, body: form.description, category: form.category, isAnonymous: form.isAnonymous }),
      });
      showToast("Post submitted! It'll appear once approved by our team ✨");
    } catch {
      showToast("Couldn't post right now — please try again.");
    }
  };


  return (
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: font }}>
      <HamburgerNav active="Home" />

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "#2C1A0E", color: "#fff", fontSize: 13, fontWeight: 600, borderRadius: 12, padding: "12px 22px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)", fontFamily: font, whiteSpace: "nowrap", maxWidth: "90vw", textAlign: "center" }}>
          {toast}
        </div>
      )}

      {showNewPost && (
        <NewPostModal
          onClose={() => setShowNewPost(false)}
          onSubmit={handleNewPost}
          authorName={user?.name}
        />
      )}

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "64px 16px 80px" }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,69,0,0.08)", border: "1px solid rgba(255,69,0,0.2)", borderRadius: 100, padding: "5px 16px", marginBottom: 14 }}>
            <span style={{ fontSize: 14 }}>🎉</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#e05d2e", textTransform: "uppercase", letterSpacing: "0.1em" }}>Celebration Hub</span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, color: BROWN, margin: "0 0 8px", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                Community Discussions
              </h1>
              <p style={{ fontSize: 15, color: "#7A5535", margin: 0, lineHeight: 1.55 }}>
                Real couples, real vendors, real talk. Share your stories, ask questions, inspire each other.
              </p>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0, alignSelf: "flex-start" }}>
              <button onClick={() => setShowNewPost(true)}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.35)", whiteSpace: "nowrap" }}>
                ✍️ Create Post
              </button>
            </div>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="ch-tabs" style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", WebkitOverflowScrolling: "touch", marginBottom: 24, paddingBottom: 4 }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 100, flexShrink: 0, border: `1.5px solid ${active ? tab.accent : "rgba(196,122,46,0.18)"}`, background: active ? tab.accent : "#fff", color: active ? "#fff" : "#7A5535", fontSize: 13, fontWeight: active ? 700 : 500, cursor: "pointer", fontFamily: font, boxShadow: active ? `0 4px 14px ${tab.accent}40` : "none", transition: "all 0.18s" }}>
                <span style={{ fontSize: 15 }}>{tab.emoji}</span>
                {tab.label}
              </button>
            );
          })}
          <style>{`.ch-tabs::-webkit-scrollbar{display:none}`}</style>
        </div>

        {/* ── Tab content ── */}
        {(activeTab === "all" || activeTab === "stories" || activeTab === "ask") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {loading
              ? <div style={{ textAlign: "center", padding: "48px 24px", color: "#9B7450", fontSize: 14 }}>Loading community posts…</div>
              : postsForTab(activeTab).length === 0
              ? <div style={{ textAlign: "center", padding: "48px 24px", color: "#9B7450", fontSize: 14 }}>No posts yet — be the first to share! ✨</div>
              : postsForTab(activeTab).map(post => (
                  <PostCard
                    key={postId(post)}
                    post={post}
                    liked={likedIds.has(postId(post))}
                    onLike={handleLike}
                    onRemove={handleRemove}
                    isAdmin={isAdmin}
                    onAddComment={handleAddComment}
                    userReaction={userReactions[postId(post)] || null}
                    onReact={handleReact}
                    token={token}
                  />
                ))
            }
          </div>
        )}

        {activeTab === "polls" && (
          <div>
            {/* User posts tagged "polls" appear above the curated poll cards */}
            {postsForTab("polls").length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {postsForTab("polls").map(post => (
                  <PostCard
                    key={postId(post)}
                    post={post}
                    liked={likedIds.has(postId(post))}
                    onLike={handleLike}
                    onRemove={handleRemove}
                    isAdmin={isAdmin}
                    onAddComment={handleAddComment}
                    userReaction={userReactions[postId(post)] || null}
                    onReact={handleReact}
                    token={token}
                  />
                ))}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 14 }}>
              {POLLS.map(poll => <PollCard key={poll.id} poll={poll} />)}
            </div>
          </div>
        )}

        {activeTab === "ideas" && (
          <div>
            {/* User posts tagged "ideas" appear above the curated idea cards */}
            {postsForTab("ideas").length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {postsForTab("ideas").map(post => (
                  <PostCard
                    key={postId(post)}
                    post={post}
                    liked={likedIds.has(postId(post))}
                    onLike={handleLike}
                    onRemove={handleRemove}
                    isAdmin={isAdmin}
                    onAddComment={handleAddComment}
                    userReaction={userReactions[postId(post)] || null}
                    onReact={handleReact}
                    token={token}
                  />
                ))}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
              {IDEAS.map(idea => <IdeaCard key={idea.id} idea={idea} />)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
