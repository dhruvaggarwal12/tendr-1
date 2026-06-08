import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import {
  CATEGORIES, CATEGORY_COLORS, POSTS, POLLS, IDEAS, TRENDING, ASK_POSTS,
} from "../../data/celebrationHubData";

const F     = "'Outfit', sans-serif";
const BROWN = "#2C1A0E";
const GOLD  = "#C47A2E";
const CREAM = "#FFFCF5";

const TABS = [
  { id: "home",     emoji: "🏠", label: "Home" },
  { id: "feed",     emoji: "💬", label: "Discussions" },
  { id: "ideas",    emoji: "💡", label: "Ideas" },
  { id: "polls",    emoji: "📊", label: "Polls" },
  { id: "trending", emoji: "🔥", label: "Trending" },
  { id: "admin",    emoji: "⚙️", label: "Moderate" },
];

const REACTIONS = [
  { key: "agree",     emoji: "👍", label: "Agree" },
  { key: "facedThis", emoji: "😫", label: "Felt This" },
  { key: "greatIdea", emoji: "💡", label: "Great Idea" },
  { key: "loveThis",  emoji: "❤️", label: "Love" },
];

const SORT_OPTS = ["Hot", "New", "Top"];

function catColor(id) { return CATEGORY_COLORS[id] || "#6B7280"; }
function catInfo(id)  { return CATEGORIES.find(c => c.id === id) || {}; }

const POST_TYPES = CATEGORIES.filter(c => c.id !== "all").map(c => ({
  ...c,
  desc: {
    "surprise":    "An unexpected magical moment to share",
    "love-story":  "A proposal, romance, or heartwarming memory",
    "epic-fail":   "What went hilariously wrong (and still worked)",
    "emotional":   "Moments that moved everyone to happy tears",
    "hidden-gem":  "A vendor or trick nobody else is talking about",
    "wow-factor":  "Jaw-dropping setup or decor reveal",
    "money-saved": "Smart budget hack or negotiation win",
    "real-talk":   "Honest review or warning",
    "shoutout":    "Praising someone who made it unforgettable",
    "my-story":    "Your full journey from planning to the big day",
  }[c.id] || "",
}));

// ── Reusable: Post creation bar ────────────────────────────────────────────
function PostBar({ onClick }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(44,26,14,0.09)", padding: "12px 14px", display: "flex", gap: 10, alignItems: "center", marginBottom: 16, boxShadow: "0 2px 8px rgba(44,26,14,0.04)" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${GOLD},#CCAB4A)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>✨</div>
      <button onClick={onClick}
        style={{ flex: 1, padding: "10px 13px", borderRadius: 10, border: "1.5px solid rgba(44,26,14,0.1)", background: "#F9F5F0", color: "#9B7450", fontSize: 13, textAlign: "left", cursor: "pointer", fontFamily: F }}>
        Share your experience, idea or challenge…
      </button>
      <button onClick={onClick}
        style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: F, flexShrink: 0, boxShadow: "0 4px 12px rgba(196,122,46,0.28)" }}>
        Post →
      </button>
    </div>
  );
}

// ── Reddit-style post card ─────────────────────────────────────────────────
function PostCard({ post, myReaction, onReact, onCatClick, compact }) {
  const [expanded, setExpanded] = useState(false);
  const cat   = catInfo(post.category);
  const color = catColor(post.category);
  const totalVotes = (post.reactions.agree || 0) + (post.reactions.loveThis || 0) + (myReaction === "agree" || myReaction === "loveThis" ? 1 : 0);

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(44,26,14,0.07)", overflow: "hidden", boxShadow: "0 2px 10px rgba(44,26,14,0.04)", display: "flex", transition: "box-shadow 0.18s" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 22px rgba(44,26,14,0.09)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 10px rgba(44,26,14,0.04)"}>

      {/* Left vote strip */}
      <div style={{ background: "#FAF6F0", borderRight: "1px solid rgba(44,26,14,0.06)", padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 48 }}>
        <button onClick={() => onReact(post.id, "agree")}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 4, borderRadius: 6, color: myReaction === "agree" ? GOLD : "#C0A070", transition: "color 0.15s" }}>▲</button>
        <span style={{ fontSize: 13, fontWeight: 900, color: totalVotes > 0 ? GOLD : "#9B7450", lineHeight: 1 }}>{totalVotes}</span>
        <button onClick={() => onReact(post.id, "facedThis")}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 4, borderRadius: 6, color: myReaction === "facedThis" ? "#7C3AED" : "#C0A070", transition: "color 0.15s" }}>▼</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: compact ? "12px 14px" : "14px 16px", minWidth: 0 }}>
        {/* Meta row */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 7 }}>
          <button onClick={() => onCatClick?.(post.category)}
            style={{ padding: "2px 9px", borderRadius: 100, background: `${color}15`, color, fontSize: 10, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: F }}>
            {cat.emoji} {cat.label}
          </button>
          {post.isPinned   && <span style={{ fontSize: 10, fontWeight: 700, color: "#92400E", background: "#FEF9C3", padding: "2px 7px", borderRadius: 100 }}>📌 Pinned</span>}
          {post.isFeatured && <span style={{ fontSize: 10, fontWeight: 700, color: "#D97706", background: "#FEF3C7", padding: "2px 7px", borderRadius: 100 }}>⭐ Featured</span>}
          {post.isNew      && <span style={{ fontSize: 10, fontWeight: 700, color: "#15803D", background: "#DCFCE7", padding: "2px 7px", borderRadius: 100 }}>New</span>}
          <span style={{ fontSize: 10, color: "#9B7450", marginLeft: "auto" }}>
            {post.isAnonymous ? "🕵️ Anonymous" : `👤 ${post.author}`} · {post.date}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: compact ? 13 : 14, fontWeight: 800, color: BROWN, margin: "0 0 6px", lineHeight: 1.4, cursor: "pointer" }}
          onClick={() => setExpanded(!expanded)}>{post.title}</h3>

        {/* Description */}
        {!compact && (
          <>
            <p style={{ fontSize: 12.5, color: "#6B3A1F", lineHeight: 1.6, margin: "0 0 4px", display: "-webkit-box", WebkitLineClamp: expanded ? "unset" : 2, WebkitBoxOrient: "vertical", overflow: expanded ? "visible" : "hidden" }}>
              {post.description}
            </p>
            {!expanded && (
              <button onClick={() => setExpanded(true)} style={{ fontSize: 11, color: GOLD, fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: "2px 0", fontFamily: F }}>Read more ↓</button>
            )}
          </>
        )}

        {/* Action bar */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10, flexWrap: "wrap" }}>
          <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "#9B7450", fontSize: 11, fontWeight: 600, fontFamily: F, padding: 0 }}>
            💬 {post.answers} comments
          </button>
          {REACTIONS.filter(r => r.key !== "agree" && r.key !== "facedThis").map(r => {
            const count = (post.reactions[r.key] || 0) + (myReaction === r.key ? 1 : 0);
            const active = myReaction === r.key;
            return (
              <button key={r.key} onClick={() => onReact(post.id, r.key)}
                style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 100, border: `1.5px solid ${active ? color : "rgba(44,26,14,0.1)"}`, background: active ? `${color}12` : "transparent", color: active ? color : "#9B7450", fontSize: 11, fontWeight: active ? 700 : 500, fontFamily: F, cursor: "pointer", transition: "all 0.15s" }}>
                <span style={{ fontSize: 12 }}>{r.emoji}</span> {count}
              </button>
            );
          })}
          <button style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", color: "#9B7450", fontSize: 11, fontWeight: 600, fontFamily: F, padding: 0, marginLeft: "auto" }}>
            🔗 Share
          </button>
        </div>
      </div>
    </div>
  );
}

// ── New post modal ─────────────────────────────────────────────────────────
function PostModal({ onClose, onSubmit }) {
  const [step, setStep]       = useState("type");
  const [type, setType]       = useState(null);
  const [form, setForm]       = useState({ title: "", body: "", anon: false });

  const submit = () => {
    if (!form.title.trim()) return;
    onSubmit({ id: Date.now(), title: form.title.trim(), description: form.body.trim() || "No description provided.", category: type.id, author: form.anon ? "Anonymous" : "You", isAnonymous: form.anon, isNew: true, date: "just now", reactions: { agree:0, facedThis:0, greatIdea:0, loveThis:0 }, isPinned: false, isFeatured: false, isApproved: false, tags: [], answers: 0 });
    onClose();
  };

  const color = type ? catColor(type.id) : GOLD;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(95vw,520px)", background: CREAM, borderRadius: 22, zIndex: 2001, fontFamily: F, overflow: "hidden", boxShadow: "0 28px 70px rgba(0,0,0,0.24)", maxHeight: "88vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ padding: "16px 18px", borderBottom: "1.5px solid rgba(44,26,14,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {step === "form" && (
              <button onClick={() => setStep("type")} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(44,26,14,0.12)", background: "#fff", cursor: "pointer", fontFamily: F, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
            )}
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 900, color: BROWN, margin: 0 }}>
                {step === "type" ? "What kind of post?" : "Create Post"}
              </h3>
              {step === "form" && type && (
                <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}15`, padding: "2px 9px", borderRadius: 100, display: "inline-block", marginTop: 4 }}>{type.emoji} {type.label}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(44,26,14,0.12)", background: "#fff", cursor: "pointer", color: "#9B7450", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        {/* Step 1: type picker */}
        {step === "type" && (
          <div style={{ padding: "16px 18px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
              {POST_TYPES.map(t => {
                const col = catColor(t.id);
                return (
                  <button key={t.id} onClick={() => { setType(t); setStep("form"); }}
                    style={{ padding: "13px 13px", borderRadius: 13, border: `1.5px solid ${col}22`, background: `${col}08`, textAlign: "left", cursor: "pointer", fontFamily: F, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${col}15`; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${col}08`; e.currentTarget.style.transform = "none"; }}>
                    <div style={{ fontSize: 20, marginBottom: 5 }}>{t.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: BROWN, marginBottom: 2 }}>{t.label}</div>
                    <div style={{ fontSize: 10.5, color: "#9B7450", lineHeight: 1.4 }}>{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: form */}
        {step === "form" && (
          <div style={{ padding: "16px 18px 20px" }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5 }}>Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder={`What's your ${type?.label?.toLowerCase()} about?`}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${form.title ? color : "rgba(44,26,14,0.12)"}`, fontFamily: F, fontSize: 13, color: BROWN, background: "#fff", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: BROWN, display: "block", marginBottom: 5 }}>Details <span style={{ fontWeight: 400, color: "#9B7450" }}>(optional)</span></label>
              <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Share the full story, tips, or questions…" rows={4}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(44,26,14,0.12)", fontFamily: F, fontSize: 13, color: BROWN, background: "#fff", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, color: BROWN, cursor: "pointer", marginBottom: 16 }}>
              <div onClick={() => setForm(f => ({ ...f, anon: !f.anon }))}
                style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${form.anon ? GOLD : "rgba(44,26,14,0.2)"}`, background: form.anon ? GOLD : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {form.anon && <span style={{ color: "#fff", fontSize: 10, fontWeight: 900 }}>✓</span>}
              </div>
              Post anonymously <span style={{ fontSize: 11, color: "#9B7450" }}>— name hidden</span>
            </label>
            <button onClick={submit} disabled={!form.title.trim()}
              style={{ width: "100%", padding: "12px", borderRadius: 11, border: "none", background: form.title.trim() ? `linear-gradient(135deg,${GOLD},#CCAB4A)` : "#E5E7EB", color: form.title.trim() ? "#fff" : "#9CA3AF", fontSize: 14, fontWeight: 800, cursor: form.title.trim() ? "pointer" : "not-allowed", fontFamily: F, boxShadow: form.title.trim() ? "0 4px 14px rgba(196,122,46,0.3)" : "none" }}>
              Post to Community →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Sidebar: used on desktop in Feed + Home ────────────────────────────────
function Sidebar({ polls, votes, onVote, onTabChange }) {
  const poll = polls[0];
  const myVote = votes[poll?.id];
  const hasVoted = myVote !== undefined;
  const totalVotes = poll ? poll.options.reduce((s, o, i) => s + o.votes + (hasVoted && myVote === i ? 1 : 0), 0) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* About */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(44,26,14,0.08)", overflow: "hidden" }}>
        <div style={{ background: `linear-gradient(135deg,${BROWN},#4A2810)`, padding: "14px 16px" }}>
          <h3 style={{ fontSize: 14, fontWeight: 900, color: "#fff", margin: "0 0 4px" }}>🎉 Celebration Hub</h3>
          <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.5 }}>A community for event planners across Delhi NCR.</p>
        </div>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[{ n: "50+", l: "Posts" }, { n: "200+", l: "Members" }, { n: "12", l: "Active Today" }, { n: "4", l: "Categories" }].map(s => (
              <div key={s.l} style={{ textAlign: "center", padding: "10px 0", background: "#FAF6F0", borderRadius: 10 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: GOLD }}>{s.n}</div>
                <div style={{ fontSize: 10, color: "#9B7450", fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[{ id: "feed", label: "💬 Discussions" }, { id: "ideas", label: "💡 Ideas" }, { id: "polls", label: "📊 Polls" }].map(t => (
              <button key={t.id} onClick={() => onTabChange(t.id)}
                style={{ padding: "6px 12px", borderRadius: 100, border: `1.5px solid rgba(196,122,46,0.25)`, background: "transparent", color: GOLD, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: F }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live poll */}
      {poll && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(44,26,14,0.08)", overflow: "hidden" }}>
          <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(44,26,14,0.06)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>📊 Live Poll</p>
            <h4 style={{ fontSize: 13, fontWeight: 800, color: BROWN, margin: 0, lineHeight: 1.4 }}>{poll.question}</h4>
          </div>
          <div style={{ padding: "12px 14px 14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {poll.options.map((opt, i) => {
                const v = opt.votes + (hasVoted && myVote === i ? 1 : 0);
                const pct = totalVotes > 0 ? Math.round((v / totalVotes) * 100) : 0;
                const isChosen = myVote === i;
                return (
                  <button key={i} onClick={() => !hasVoted && onVote(poll.id, i)}
                    style={{ position: "relative", padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${isChosen ? GOLD : "rgba(44,26,14,0.1)"}`, background: "transparent", cursor: hasVoted ? "default" : "pointer", fontFamily: F, textAlign: "left", overflow: "hidden" }}>
                    {hasVoted && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: isChosen ? `${GOLD}18` : "rgba(44,26,14,0.04)", borderRadius: 9 }} />}
                    <div style={{ position: "relative", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, fontWeight: isChosen ? 800 : 500, color: isChosen ? GOLD : BROWN }}>{opt.label}</span>
                      {hasVoted && <span style={{ fontSize: 12, fontWeight: 700, color: isChosen ? GOLD : "#9B7450" }}>{pct}%</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: "#9B7450", margin: "10px 0 0" }}>{hasVoted ? `${totalVotes.toLocaleString()} votes` : "Tap to vote"}</p>
          </div>
        </div>
      )}

      {/* Trending topics */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(44,26,14,0.08)", padding: "14px 16px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>🔥 Trending Topics</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {TRENDING.slice(0, 5).map((t, i) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: "rgba(196,122,46,0.35)", minWidth: 16 }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: BROWN }}>{t.emoji} {t.topic}</div>
                <div style={{ fontSize: 10, color: "#9B7450" }}>{t.count.toLocaleString()} engagements</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community rules */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(44,26,14,0.08)", padding: "14px 16px" }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>📋 Community Guidelines</p>
        {["Be kind and respectful", "Share real experiences", "No spam or promotion", "Help others with honest advice", "Keep it celebration-related"].map((r, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 7 }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: GOLD, marginTop: 1 }}>{i + 1}.</span>
            <span style={{ fontSize: 11.5, color: "#6B3A1F", lineHeight: 1.45 }}>{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── HOME TAB ──────────────────────────────────────────────────────────────
function HomeTab({ posts, reactions, onReact, onAddPost, polls, votes, onVote, onTabChange }) {
  const [showModal, setShowModal] = useState(false);
  const featuredPosts = useMemo(() => posts.filter(p => p.isFeatured || p.isPinned).slice(0, 3), [posts]);

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }} className="ch-layout">
      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <PostBar onClick={() => setShowModal(true)} />

        {/* Section overview cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }} className="ch-section-grid">
          {[
            { id: "ideas",    emoji: "💡", title: "Ideas & Decor", desc: "Pinterest-style inspiration boards for your celebration", count: `${IDEAS.length} ideas`, bg: "linear-gradient(135deg,#FFF7E6,#FEF3C7)", accent: "#D97706" },
            { id: "trending", emoji: "🔥", title: "Trending Now",  desc: "Hot topics the community is discussing this week",         count: `${TRENDING.length} topics`,  bg: "linear-gradient(135deg,#FFF3F0,#FEE2D8)", accent: "#E55A2B" },
            { id: "polls",    emoji: "📊", title: "Polls & Votes",  desc: "Vote on colour palettes, venues and event choices",        count: `${POLLS.length} active polls`, bg: "linear-gradient(135deg,#F0F4FF,#E0E8FF)", accent: "#4F6FD8" },
          ].map(s => (
            <button key={s.id} onClick={() => onTabChange(s.id)}
              style={{ padding: "16px 14px", borderRadius: 14, background: s.bg, border: `1.5px solid ${s.accent}22`, textAlign: "left", cursor: "pointer", fontFamily: F, transition: "transform 0.18s, box-shadow 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 22px ${s.accent}25`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{s.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: BROWN, marginBottom: 4, lineHeight: 1.2 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: "#7A5535", lineHeight: 1.45, marginBottom: 8 }}>{s.desc}</div>
              <span style={{ fontSize: 10, fontWeight: 700, color: s.accent, background: `${s.accent}15`, padding: "3px 9px", borderRadius: 100 }}>{s.count}</span>
            </button>
          ))}
        </div>

        {/* Hot discussions */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 900, color: BROWN, margin: 0 }}>🔥 Hot Discussions</h3>
            <button onClick={() => onTabChange("feed")} style={{ fontSize: 11, fontWeight: 700, color: GOLD, background: "none", border: "none", cursor: "pointer", fontFamily: F }}>See all →</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {featuredPosts.map(p => (
              <PostCard key={p.id} post={p} myReaction={reactions[p.id]} onReact={onReact} onCatClick={() => onTabChange("feed")} compact />
            ))}
          </div>
        </div>

        {showModal && <PostModal onClose={() => setShowModal(false)} onSubmit={onAddPost} />}
      </div>

      {/* Sidebar */}
      <div className="ch-sidebar">
        <Sidebar polls={polls} votes={votes} onVote={onVote} onTabChange={onTabChange} />
      </div>
    </div>
  );
}

// ── FEED TAB ──────────────────────────────────────────────────────────────
function FeedTab({ posts, reactions, onReact, onAddPost, polls, votes, onVote, onTabChange }) {
  const [cat,       setCat]       = useState("all");
  const [search,    setSearch]    = useState("");
  const [sort,      setSort]      = useState("Hot");
  const [showModal, setShowModal] = useState(false);

  const filtered = useMemo(() => {
    let r = cat === "all" ? posts : posts.filter(p => p.category === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (sort === "Hot")  r = [...r].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || Object.values(b.reactions).reduce((s,v)=>s+v,0) - Object.values(a.reactions).reduce((s,v)=>s+v,0));
    if (sort === "New")  r = [...r].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    if (sort === "Top")  r = [...r].sort((a, b) => (b.reactions.agree||0) - (a.reactions.agree||0));
    return r;
  }, [cat, search, sort, posts]);

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }} className="ch-layout">
      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <PostBar onClick={() => setShowModal(true)} />

        {/* Controls */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid rgba(44,26,14,0.08)", padding: "10px 12px", marginBottom: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {/* Sort tabs */}
          <div style={{ display: "flex", gap: 2, background: "#FAF6F0", borderRadius: 8, padding: 3 }}>
            {SORT_OPTS.map(s => (
              <button key={s} onClick={() => setSort(s)}
                style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: sort === s ? GOLD : "transparent", color: sort === s ? "#fff" : "#9B7450", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: F, transition: "all 0.15s" }}>
                {s === "Hot" ? "🔥" : s === "New" ? "🆕" : "⭐"} {s}
              </button>
            ))}
          </div>

          {/* Search */}
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search discussions…"
            style={{ flex: 1, minWidth: 120, padding: "7px 12px", borderRadius: 8, border: "1.5px solid rgba(44,26,14,0.1)", fontFamily: F, fontSize: 12, color: BROWN, background: "#FAF6F0", outline: "none" }} />

          <span style={{ fontSize: 11, color: "#9B7450", whiteSpace: "nowrap" }}>{filtered.length} posts</span>
        </div>

        {/* Category chips */}
        <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, marginBottom: 14, scrollbarWidth: "none" }}>
          {CATEGORIES.map(c => {
            const active = cat === c.id;
            const col    = catColor(c.id) || GOLD;
            return (
              <button key={c.id} onClick={() => setCat(c.id)}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: 100, border: `1.5px solid ${active ? col : "rgba(44,26,14,0.1)"}`, background: active ? col : "#fff", color: active ? "#fff" : "#6B3A1F", fontSize: 11.5, fontWeight: 700, fontFamily: F, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s" }}>
                {c.emoji} {c.label}
              </button>
            );
          })}
        </div>

        {/* Posts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(p => (
            <PostCard key={p.id} post={p} myReaction={reactions[p.id]} onReact={onReact} onCatClick={setCat} />
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 24px", background: "#fff", borderRadius: 14, border: "1.5px solid rgba(44,26,14,0.07)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: BROWN, margin: "0 0 6px" }}>No discussions found</p>
              <p style={{ fontSize: 12, color: "#9B7450", margin: 0 }}>Try a different filter or search term</p>
            </div>
          )}
        </div>

        {showModal && <PostModal onClose={() => setShowModal(false)} onSubmit={onAddPost} />}
      </div>

      {/* Sidebar */}
      <div className="ch-sidebar">
        <Sidebar polls={polls} votes={votes} onVote={onVote} onTabChange={onTabChange} />
      </div>
    </div>
  );
}

// ── IDEAS TAB ─────────────────────────────────────────────────────────────
const IDEA_CATS = [
  { id: "all",        label: "All Ideas",  emoji: "✨" },
  { id: "wow-factor", label: "Wow Factor", emoji: "🤯" },
  { id: "my-story",   label: "My Story",   emoji: "🎊" },
  { id: "hidden-gem", label: "Hidden Gem", emoji: "💡" },
];

function IdeasTab({ savedIdeas, onSave }) {
  const [cat, setCat] = useState("all");
  const filtered = cat === "all" ? IDEAS : IDEAS.filter(i => i.category === cat);
  const cats = IDEA_CATS;

  return (
    <div>
      <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid rgba(44,26,14,0.08)", padding: "12px 14px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 900, color: BROWN, margin: "0 0 4px" }}>💡 Idea Board</h3>
          <p style={{ fontSize: 12, color: "#9B7450", margin: 0 }}>Save ideas to plan your perfect celebration</p>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: GOLD }}>{savedIdeas.size} saved</span>
      </div>

      <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, marginBottom: 16, scrollbarWidth: "none" }}>
        {cats.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)}
            style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 13px", borderRadius: 100, border: `1.5px solid ${cat === c.id ? GOLD : "rgba(44,26,14,0.1)"}`, background: cat === c.id ? GOLD : "#fff", color: cat === c.id ? "#fff" : "#6B3A1F", fontSize: 11.5, fontWeight: 700, fontFamily: F, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <div style={{ columns: "200px 3", gap: 12 }}>
        {filtered.map(idea => {
          const saved = savedIdeas.has(idea.id);
          return (
            <div key={idea.id} style={{ breakInside: "avoid", marginBottom: 12 }}>
              <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1.5px solid rgba(44,26,14,0.07)", boxShadow: "0 2px 10px rgba(44,26,14,0.06)", transition: "transform 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                <div style={{ position: "relative" }}>
                  <img src={idea.image} alt={idea.title} style={{ width: "100%", display: "block", aspectRatio: idea.id % 3 === 0 ? "4/5" : idea.id % 2 === 0 ? "3/2" : "1/1", objectFit: "cover" }} />
                  <button onClick={() => onSave(idea.id)}
                    style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: "50%", border: "none", background: saved ? GOLD : "rgba(255,255,255,0.9)", color: saved ? "#fff" : BROWN, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                    {saved ? "🔖" : "＋"}
                  </button>
                </div>
                <div style={{ padding: "10px 12px 12px" }}>
                  <h4 style={{ fontSize: 12, fontWeight: 800, color: BROWN, margin: "0 0 4px", lineHeight: 1.3 }}>{idea.title}</h4>
                  <p style={{ fontSize: 11, color: "#9B7450", margin: "0 0 8px", lineHeight: 1.5 }}>{idea.desc}</p>
                  <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 6 }}>
                    {idea.tags.slice(0, 2).map(t => <span key={t} style={{ padding: "2px 7px", borderRadius: 100, background: "rgba(196,122,46,0.08)", color: GOLD, fontSize: 9.5, fontWeight: 700 }}>#{t}</span>)}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10, color: "#9B7450" }}>👤 {idea.author}</span>
                    <span style={{ fontSize: 10, color: "#9B7450" }}>🔖 {idea.saved + (saved ? 1 : 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── POLLS TAB ─────────────────────────────────────────────────────────────
function PollsTab({ votes, onVote }) {
  return (
    <div>
      <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid rgba(44,26,14,0.08)", padding: "14px 16px", marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 900, color: BROWN, margin: "0 0 4px" }}>📊 Community Polls</h3>
        <p style={{ fontSize: 12, color: "#9B7450", margin: 0 }}>Vote and see what the community thinks</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {POLLS.map(poll => {
          const myVote = votes[poll.id];
          const hasVoted = myVote !== undefined;
          const totalVotes = poll.options.reduce((s, o, i) => s + o.votes + (hasVoted && myVote === i ? 1 : 0), 0);

          return (
            <div key={poll.id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(44,26,14,0.07)", overflow: "hidden", boxShadow: "0 2px 12px rgba(44,26,14,0.05)" }}>
              <div style={{ background: `linear-gradient(135deg,${BROWN},#4A2810)`, padding: "14px 16px" }}>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 5px", fontWeight: 700 }}>Community Poll</p>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.4 }}>{poll.question}</h3>
              </div>
              <div style={{ padding: "14px 16px 18px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 12 }}>
                  {poll.options.map((opt, i) => {
                    const v = opt.votes + (hasVoted && myVote === i ? 1 : 0);
                    const pct = totalVotes > 0 ? Math.round((v / totalVotes) * 100) : 0;
                    const isChosen = myVote === i;
                    const isWinner = hasVoted && v === Math.max(...poll.options.map((o, j) => o.votes + (myVote === j ? 1 : 0)));
                    return (
                      <button key={i} onClick={() => !hasVoted && onVote(poll.id, i)}
                        style={{ position: "relative", padding: "10px 13px", borderRadius: 11, border: `1.5px solid ${isChosen ? GOLD : "rgba(44,26,14,0.1)"}`, background: "transparent", cursor: hasVoted ? "default" : "pointer", fontFamily: F, textAlign: "left", overflow: "hidden" }}>
                        {hasVoted && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: isChosen ? `${GOLD}18` : "rgba(44,26,14,0.04)", borderRadius: 10 }} />}
                        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12.5, fontWeight: isChosen ? 800 : 500, color: isChosen ? GOLD : BROWN }}>
                            {isWinner && hasVoted ? "🏆 " : ""}{opt.label}
                          </span>
                          {hasVoted && <span style={{ fontSize: 12, fontWeight: 800, color: isChosen ? GOLD : "#9B7450" }}>{pct}%</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p style={{ fontSize: 11, color: "#9B7450", margin: 0 }}>{hasVoted ? `${totalVotes.toLocaleString()} total votes` : "Tap any option to vote"}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TRENDING TAB ──────────────────────────────────────────────────────────
function TrendingTab({ posts, reactions, onReact, onTabChange }) {
  const featuredPosts = useMemo(() => posts.filter(p => p.isFeatured || p.isPinned).slice(0, 6), [posts]);
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }} className="ch-layout">
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: 15, fontWeight: 900, color: BROWN, margin: "0 0 14px" }}>🔥 Trending Now</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 10, marginBottom: 24 }}>
          {TRENDING.map((t, i) => (
            <button key={t.id} onClick={() => onTabChange("feed")}
              style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(44,26,14,0.08)", padding: "14px 15px", textAlign: "left", cursor: "pointer", fontFamily: F, transition: "all 0.18s", boxShadow: "0 2px 8px rgba(44,26,14,0.04)", display: "flex", alignItems: "center", gap: 12 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = `0 4px 16px rgba(196,122,46,0.14)`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(44,26,14,0.08)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(44,26,14,0.04)"; }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: "rgba(196,122,46,0.4)", minWidth: 22 }}>#{i + 1}</span>
              <div>
                <div style={{ fontSize: 14, marginBottom: 3 }}>{t.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: BROWN, lineHeight: 1.2 }}>{t.topic}</div>
                <div style={{ fontSize: 10, color: "#9B7450", marginTop: 2 }}>{t.count.toLocaleString()} engagements</div>
              </div>
            </button>
          ))}
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 900, color: BROWN, margin: "0 0 12px" }}>⭐ Featured Discussions</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {featuredPosts.map(p => (
            <PostCard key={p.id} post={p} myReaction={reactions[p.id]} onReact={onReact} onCatClick={() => onTabChange("feed")} compact />
          ))}
        </div>
      </div>

      <div className="ch-sidebar">
        <Sidebar polls={POLLS} votes={{}} onVote={() => {}} onTabChange={onTabChange} />
      </div>
    </div>
  );
}

// ── MODERATE TAB ──────────────────────────────────────────────────────────
function ModerateTab({ posts, modStatus, setModStatus }) {
  const [filter, setFilter] = useState("all");

  const stats = useMemo(() => ({
    total: posts.length,
    pinned:   posts.filter(p => modStatus[p.id]?.pinned   || p.isPinned).length,
    featured: posts.filter(p => modStatus[p.id]?.featured || p.isFeatured).length,
    hidden:   Object.values(modStatus).filter(s => s.hidden).length,
  }), [posts, modStatus]);

  const displayed = useMemo(() => {
    if (filter === "pinned")   return posts.filter(p => modStatus[p.id]?.pinned   || p.isPinned);
    if (filter === "featured") return posts.filter(p => modStatus[p.id]?.featured || p.isFeatured);
    if (filter === "hidden")   return posts.filter(p => modStatus[p.id]?.hidden);
    if (filter === "anon")     return posts.filter(p => p.isAnonymous);
    return posts;
  }, [filter, posts, modStatus]);

  const toggle = (id, key) => setModStatus(prev => ({ ...prev, [id]: { ...prev[id], [key]: !prev[id]?.[key] } }));

  const STAT_COLORS = { "Total Posts": "#1D4ED8", "Pinned": "#D97706", "Featured": GOLD, "Hidden": "#DC2626" };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, marginBottom: 18 }}>
        {[["📝", "Total Posts", stats.total], ["📌", "Pinned", stats.pinned], ["⭐", "Featured", stats.featured], ["🚫", "Hidden", stats.hidden]].map(([emoji, label, val]) => (
          <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "12px 14px", border: "1.5px solid rgba(44,26,14,0.07)", textAlign: "center" }}>
            <div style={{ fontSize: 22, marginBottom: 3 }}>{emoji}</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: STAT_COLORS[label] }}>{val}</div>
            <div style={{ fontSize: 10.5, color: "#9B7450", fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 7, marginBottom: 14, flexWrap: "wrap" }}>
        {[["all","All"],["pinned","📌 Pinned"],["featured","⭐ Featured"],["hidden","🚫 Hidden"],["anon","🕵️ Anonymous"]].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            style={{ padding: "5px 13px", borderRadius: 100, border: `1.5px solid ${filter === k ? GOLD : "rgba(44,26,14,0.1)"}`, background: filter === k ? GOLD : "#fff", color: filter === k ? "#fff" : "#6B3A1F", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: F }}>
            {l}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 11.5, color: "#9B7450", marginBottom: 12 }}>{displayed.length} post{displayed.length !== 1 ? "s" : ""}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {displayed.map(p => {
          const st       = modStatus[p.id] || {};
          const isPinned = st.pinned   ?? p.isPinned;
          const isFeat   = st.featured ?? p.isFeatured;
          const isHidden = st.hidden   ?? false;
          const color    = catColor(p.category);

          return (
            <div key={p.id} style={{ background: isHidden ? "#F9FAFB" : "#fff", borderRadius: 13, border: `1.5px solid ${isHidden ? "#E5E7EB" : "rgba(44,26,14,0.07)"}`, padding: "12px 14px", opacity: isHidden ? 0.65 : 1, display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: "flex", gap: 5, marginBottom: 5, flexWrap: "wrap" }}>
                  <span style={{ padding: "2px 7px", borderRadius: 100, background: `${color}15`, color, fontSize: 10, fontWeight: 700 }}>{catInfo(p.category).emoji} {catInfo(p.category).label}</span>
                  {isPinned && <span style={{ padding: "2px 7px", borderRadius: 100, background: "#FEF9C3", color: "#92400E", fontSize: 10, fontWeight: 700 }}>📌</span>}
                  {isFeat   && <span style={{ padding: "2px 7px", borderRadius: 100, background: "#FEF3C7", color: "#D97706", fontSize: 10, fontWeight: 700 }}>⭐</span>}
                  {isHidden && <span style={{ padding: "2px 7px", borderRadius: 100, background: "#FEE2E2", color: "#DC2626", fontSize: 10, fontWeight: 700 }}>🚫</span>}
                  {p.isAnonymous && <span style={{ padding: "2px 7px", borderRadius: 100, background: "#F3F4F6", color: "#6B7280", fontSize: 10, fontWeight: 700 }}>🕵️</span>}
                </div>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: BROWN, margin: "0 0 2px", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.title}</p>
                <span style={{ fontSize: 10.5, color: "#9B7450" }}>{p.isAnonymous ? "Anonymous" : p.author} · {p.date} · 💬 {p.answers}</span>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", flexShrink: 0 }}>
                {[
                  { key: "pinned",   label: isPinned ? "Unpin"      : "Pin",     color: isPinned ? "#D97706" : "#6B7280" },
                  { key: "featured", label: isFeat   ? "Unfeature"  : "Feature", color: isFeat   ? GOLD      : "#6B7280" },
                  { key: "hidden",   label: isHidden ? "Unhide"     : "Hide",    color: isHidden ? "#DC2626" : "#6B7280" },
                ].map(a => (
                  <button key={a.key} onClick={() => toggle(p.id, a.key)}
                    style={{ padding: "4px 10px", borderRadius: 7, border: `1.5px solid ${a.color}30`, background: `${a.color}10`, color: a.color, fontSize: 10.5, fontWeight: 700, cursor: "pointer", fontFamily: F }}>
                    {a.label}
                  </button>
                ))}
                <button onClick={() => toggle(p.id, "deleted")}
                  style={{ padding: "4px 10px", borderRadius: 7, border: "1.5px solid #FEE2E2", background: "#FEF2F2", color: "#DC2626", fontSize: 10.5, fontWeight: 700, cursor: "pointer", fontFamily: F }}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────
export default function CelebrationHub() {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  const [activeTab,  setActiveTab]  = useState("home");
  const [reactions,  setReactions]  = useState({});
  const [modStatus,  setModStatus]  = useState({});
  const [userPosts,  setUserPosts]  = useState([]);
  const [pollVotes,  setPollVotes]  = useState({});
  const [savedIdeas, setSavedIdeas] = useState(new Set());

  const allPosts = useMemo(() =>
    [...userPosts, ...POSTS].filter(p => !modStatus[p.id]?.deleted),
    [userPosts, modStatus]
  );

  useEffect(() => { if (!user?.isAdmin) navigate("/"); }, [user, navigate]);
  if (!user?.isAdmin) return null;

  const handleReact   = (id, r) => setReactions(prev => ({ ...prev, [id]: prev[id] === r ? null : r }));
  const handleAddPost = (post)  => setUserPosts(prev => [post, ...prev]);
  const handleVote    = (id, i) => setPollVotes(prev => ({ ...prev, [id]: i }));
  const handleSave    = (id)    => setSavedIdeas(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  return (
    <div style={{ minHeight: "100vh", background: "#F5EFE7", fontFamily: F }}>
      <HamburgerNav />

      {/* Admin strip */}
      <div style={{ background: "rgba(196,122,46,0.1)", borderBottom: "1px solid rgba(196,122,46,0.2)", padding: "7px 20px", textAlign: "center" }}>
        <span style={{ fontSize: 11.5, color: GOLD, fontWeight: 700 }}>🔒 Admin Preview — Celebration Hub · Not visible to users yet</span>
      </div>

      {/* Hero header */}
      <div style={{ background: `linear-gradient(135deg,${BROWN} 0%,#4A2810 100%)`, padding: "28px 24px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(204,171,74,0.8)", textTransform: "uppercase", letterSpacing: "0.14em", margin: "0 0 8px" }}>🎉 Community</p>
            <h1 style={{ fontSize: "clamp(1.5rem,4vw,2.2rem)", fontWeight: 900, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>Celebration Hub</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0, maxWidth: 460, lineHeight: 1.6 }}>
              Share ideas · Discover inspiration · Discuss event challenges · Help shape celebrations
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 16px", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#CCAB4A" }}>50+</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Posts</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 16px", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#CCAB4A" }}>200+</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Members</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 16px", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: "#CCAB4A" }}>12</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Active Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky tab bar */}
      <div style={{ background: "#fff", borderBottom: "1.5px solid rgba(44,26,14,0.08)", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 12px rgba(44,26,14,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", overflowX: "auto", scrollbarWidth: "none" }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: "13px 16px", border: "none", background: "transparent", borderBottom: `2.5px solid ${activeTab === tab.id ? GOLD : "transparent"}`, color: activeTab === tab.id ? GOLD : "#9B7450", fontSize: 12.5, fontWeight: activeTab === tab.id ? 800 : 600, cursor: "pointer", fontFamily: F, whiteSpace: "nowrap", transition: "all 0.15s", flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}>
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px 72px" }}>
        {activeTab === "home"     && <HomeTab posts={allPosts} reactions={reactions} onReact={handleReact} onAddPost={handleAddPost} polls={POLLS} votes={pollVotes} onVote={handleVote} onTabChange={setActiveTab} />}
        {activeTab === "feed"     && <FeedTab posts={allPosts} reactions={reactions} onReact={handleReact} onAddPost={handleAddPost} polls={POLLS} votes={pollVotes} onVote={handleVote} onTabChange={setActiveTab} />}
        {activeTab === "ideas"    && <IdeasTab savedIdeas={savedIdeas} onSave={handleSave} />}
        {activeTab === "polls"    && <PollsTab votes={pollVotes} onVote={handleVote} />}
        {activeTab === "trending" && <TrendingTab posts={allPosts} reactions={reactions} onReact={handleReact} onTabChange={setActiveTab} />}
        {activeTab === "admin"    && <ModerateTab posts={[...userPosts, ...POSTS]} modStatus={modStatus} setModStatus={setModStatus} />}
      </div>

      <style>{`
        .ch-sidebar { width: 300px; flex-shrink: 0; position: sticky; top: 56px; }
        .ch-section-grid { grid-template-columns: repeat(3, 1fr) !important; }
        @media (max-width: 860px) {
          .ch-sidebar { display: none; }
          .ch-layout { flex-direction: column; }
          .ch-section-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 540px) {
          .ch-section-grid { grid-template-columns: 1fr !important; }
        }
        ::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>
    </div>
  );
}
