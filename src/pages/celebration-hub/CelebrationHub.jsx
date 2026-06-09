import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import { POSTS, POLLS, IDEAS, CATEGORY_COLORS, CATEGORIES } from "../../data/celebrationHubData";

const font = "'Outfit', sans-serif";
const BROWN = "#2C1A0E";
const GOLD  = "#C47A2E";
const CREAM = "#FFF8EE";
const REDDIT_URL = "https://www.reddit.com/r/tendrcommunity/s/4eThHd2V80";
const BASE_URL = import.meta.env.VITE_BASE_URL;

// Tabs — no Trending; Discussions renamed to All Posts
const TABS = [
  { id: "all",     label: "All Posts",         emoji: "💬", accent: "#e05d2e" },
  { id: "polls",   label: "Polls & Votes",      emoji: "📊", accent: GOLD },
  { id: "ideas",   label: "Ideas & Inspo",      emoji: "💡", accent: "#7c3aed" },
  { id: "ask",     label: "Ask the Community",  emoji: "🙋", accent: "#16a34a" },
  { id: "stories", label: "Share Your Story",   emoji: "🎉", accent: "#ea580c" },
];

// Category options for the new-post modal (exclude "all")
const POST_CATS = CATEGORIES.filter(c => c.id !== "all");

const LIKE_KEY  = "tendr_hub_liked";
const POSTS_KEY = "tendr_hub_user_posts";

function loadLiked()      { try { return new Set(JSON.parse(localStorage.getItem(LIKE_KEY)  || "[]")); } catch { return new Set(); } }
function loadUserPosts()  { try { return JSON.parse(localStorage.getItem(POSTS_KEY) || "[]");           } catch { return []; } }
function saveLiked(set)   { try { localStorage.setItem(LIKE_KEY,  JSON.stringify([...set])); } catch {} }
function saveUserPosts(p) { try { localStorage.setItem(POSTS_KEY, JSON.stringify(p));        } catch {} }

// Merge static + user-created posts, deduplicate by id
function buildAllPosts(userPosts) {
  const seen = new Set();
  return [...userPosts, ...POSTS].filter(p => {
    const k = String(p.id || p._id);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ── Reaction bar (read-only display) ───────────────────────────────────────
function ReactionBar({ reactions }) {
  const items = [
    { label: "Agree",      count: reactions.agree,     emoji: "👍" },
    { label: "Faced this", count: reactions.facedThis, emoji: "🙋" },
    { label: "Great idea", count: reactions.greatIdea, emoji: "💡" },
    { label: "Love this",  count: reactions.loveThis,  emoji: "❤️" },
  ];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
      {items.filter(i => i.count).map(({ label, count, emoji }) => (
        <span key={label} style={{ fontSize: 11, color: "#9B7450", background: "rgba(196,122,46,0.07)", border: "1px solid rgba(196,122,46,0.15)", borderRadius: 100, padding: "3px 10px", display: "flex", alignItems: "center", gap: 4 }}>
          {emoji} {count.toLocaleString()} {label}
        </span>
      ))}
    </div>
  );
}

// ── Single post card ────────────────────────────────────────────────────────
function PostCard({ post, liked, onLike, onRemove, isAdmin, onAddComment }) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const catColor = CATEGORY_COLORS[post.category] || GOLD;

  const handleComment = () => {
    if (!commentText.trim()) return;
    onAddComment(post.id || post._id, commentText.trim());
    setCommentText("");
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.1)", padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", fontFamily: font }}>
      {/* Category + badges row */}
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: catColor, borderRadius: 100, padding: "2px 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {post.category?.replace("-", " ")}
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
        ? <p style={{ fontSize: 13, color: "#5A3E2B", lineHeight: 1.6, margin: "0 0 10px" }}>{post.description}</p>
        : <p style={{ fontSize: 13, color: "#7A5535", lineHeight: 1.5, margin: "0 0 10px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{post.description}</p>
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
            style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: liked ? "#e05d2e" : "#9B7450", background: liked ? "rgba(224,93,46,0.08)" : "transparent", border: liked ? "1px solid rgba(224,93,46,0.2)" : "1px solid transparent", borderRadius: 100, padding: "4px 10px", cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}>
            {liked ? "❤️" : "🤍"} {(post.likes || 0) + (liked ? 1 : 0)}
          </button>
          {/* Comments toggle */}
          <button onClick={() => setShowComments(v => !v)}
            style={{ fontSize: 12, color: "#9B7450", background: "none", border: "none", cursor: "pointer", fontFamily: font, fontWeight: 600 }}>
            💬 {(post.comments?.length || 0) + (post.answers || 0)} replies
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

      {post.reactions && <ReactionBar reactions={post.reactions} />}

      {/* Comments section */}
      {showComments && (
        <div style={{ marginTop: 14, borderTop: "1px solid rgba(196,122,46,0.1)", paddingTop: 12 }}>
          {(post.comments || []).map((c, i) => (
            <div key={i} style={{ background: "rgba(196,122,46,0.04)", borderRadius: 10, padding: "8px 12px", marginBottom: 8, borderLeft: `3px solid ${GOLD}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 3 }}>{c.author || "Community Member"}</div>
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
              style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
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
  const [form, setForm] = useState({ title: "", description: "", category: "surprise", isAnonymous: false });
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

  const [activeTab,   setActiveTab]   = useState("all");
  const [likedIds,    setLikedIds]    = useState(loadLiked);
  const [userPosts,   setUserPosts]   = useState(loadUserPosts);
  const [removedIds,  setRemovedIds]  = useState(new Set());
  const [showNewPost, setShowNewPost] = useState(false);

  // Merge static + user posts, exclude removed
  const allPosts = buildAllPosts(userPosts).filter(p => !removedIds.has(String(p.id || p._id)));

  // Sort: when we have enough posts show most liked; otherwise newest first
  const LIKE_THRESHOLD = 20;
  const sortedPosts = allPosts.length >= LIKE_THRESHOLD
    ? [...allPosts].sort((a, b) => ((b.likes || 0) + (b.reactions?.loveThis || 0)) - ((a.likes || 0) + (a.reactions?.loveThis || 0)))
    : allPosts;

  // Per-tab filtered lists
  const postsForTab = (tab) => {
    if (tab === "all")     return sortedPosts;
    if (tab === "stories") return sortedPosts.filter(p => p.category === "my-story");
    if (tab === "ask")     return sortedPosts.filter(p => p.category === "real-talk");
    return sortedPosts;
  };

  // Fetch live posts from backend (optional — fails gracefully)
  useEffect(() => {
    if (!BASE_URL) return;
    fetch(`${BASE_URL}/community/posts`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.posts?.length) {
          setUserPosts(prev => {
            const merged = [...data.posts, ...prev];
            const seen = new Set();
            return merged.filter(p => { const k = String(p.id || p._id); return seen.has(k) ? false : (seen.add(k), true); });
          });
        }
      })
      .catch(() => {});
  }, []);

  // Handle like toggle
  const handleLike = (postId) => {
    const id = String(postId);
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveLiked(next);
      return next;
    });
  };

  // Handle admin remove
  const handleRemove = (postId) => {
    const id = String(postId);
    setRemovedIds(prev => new Set([...prev, id]));
    // Optimistic: also remove from userPosts if it was user-created
    setUserPosts(prev => {
      const updated = prev.filter(p => String(p.id || p._id) !== id);
      saveUserPosts(updated);
      return updated;
    });
    if (BASE_URL && token) {
      fetch(`${BASE_URL}/community/posts/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }
  };

  // Handle add comment
  const handleAddComment = (postId, text) => {
    const id = String(postId);
    const comment = { author: user?.name || "Community Member", text, date: "Just now" };
    setUserPosts(prev => {
      const updated = prev.map(p => {
        if (String(p.id || p._id) === id) return { ...p, comments: [...(p.comments || []), comment] };
        return p;
      });
      // Also patch static posts by cloning them into userPosts if not already there
      const alreadyInUser = prev.some(p => String(p.id || p._id) === id);
      if (!alreadyInUser) {
        const staticP = POSTS.find(p => String(p.id) === id);
        if (staticP) {
          const patched = { ...staticP, comments: [...(staticP.comments || []), comment] };
          const result = [patched, ...updated];
          saveUserPosts(result);
          return result;
        }
      }
      saveUserPosts(updated);
      return updated;
    });
  };

  // Handle new post submit
  const handleNewPost = async (form) => {
    const newPost = {
      id: `user-${Date.now()}`,
      _id: `user-${Date.now()}`,
      title: form.title,
      description: form.description,
      category: form.category,
      author: form.isAnonymous ? "Anonymous" : (user?.name || "Community Member"),
      isAnonymous: form.isAnonymous,
      date: "Just now",
      reactions: { agree: 0, facedThis: 0, greatIdea: 0, loveThis: 0 },
      likes: 0,
      comments: [],
      answers: 0,
      isPinned: false,
      isFeatured: false,
      isApproved: true,
      _isUserCreated: true,
    };
    setUserPosts(prev => {
      const updated = [newPost, ...prev];
      saveUserPosts(updated);
      return updated;
    });
    // Try to save to backend
    if (BASE_URL && token) {
      try {
        await fetch(`${BASE_URL}/community/posts`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: form.title, description: form.description, category: form.category, isAnonymous: form.isAnonymous }),
        });
      } catch {}
    }
  };

  const RedditIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M16.67 10a1.46 1.46 0 00-2.47-1 7.12 7.12 0 00-3.85-1.23l.65-3.08 2.13.45a1 1 0 101.07-1 1 1 0 00-.96.68l-2.38-.5a.27.27 0 00-.32.2l-.73 3.44a7.14 7.14 0 00-3.89 1.23 1.46 1.46 0 10-1.61 2.39 2.87 2.87 0 000 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 000-.44 1.46 1.46 0 00.61-1.58zM7.27 11a1 1 0 111 1 1 1 0 01-1-1zm5.58 2.65a3.56 3.56 0 01-2.85.57 3.56 3.56 0 01-2.85-.57.19.19 0 01.27-.27 3.2 3.2 0 002.58.43 3.2 3.2 0 002.58-.43.19.19 0 01.27.27zm-.14-1.65a1 1 0 111-1 1 1 0 01-1 1z"/>
    </svg>
  );

  return (
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: font }}>
      <HamburgerNav active="Home" />

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
              <a href={REDDIT_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 22px", borderRadius: 12, background: "#FF4500", color: "#fff", fontSize: 14, fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 14px rgba(255,69,0,0.3)", whiteSpace: "nowrap", justifyContent: "center" }}>
                <RedditIcon /> Join on Reddit
              </a>
            </div>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", marginBottom: 24, paddingBottom: 4 }}>
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
            {postsForTab(activeTab).length === 0
              ? <div style={{ textAlign: "center", padding: "48px 24px", color: "#9B7450", fontSize: 14 }}>No posts yet — be the first to share! ✨</div>
              : postsForTab(activeTab).map(post => (
                  <PostCard
                    key={post.id || post._id}
                    post={post}
                    liked={likedIds.has(String(post.id || post._id))}
                    onLike={handleLike}
                    onRemove={handleRemove}
                    isAdmin={isAdmin}
                    onAddComment={handleAddComment}
                  />
                ))
            }
          </div>
        )}

        {activeTab === "polls" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 14 }}>
            {POLLS.map(poll => <PollCard key={poll.id} poll={poll} />)}
          </div>
        )}

        {activeTab === "ideas" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
            {IDEAS.map(idea => <IdeaCard key={idea.id} idea={idea} />)}
          </div>
        )}

      </div>
    </div>
  );
}
