import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";

const font = "'Outfit', sans-serif";

const CATEGORIES = [
  { key: "all",   label: "All",               emoji: "✨" },
  { key: "polls", label: "Polls & Votes",      emoji: "📊" },
  { key: "ideas", label: "Ideas & Inspo",      emoji: "💡" },
  { key: "ask",   label: "Ask the Community",  emoji: "🙋" },
  { key: "story", label: "Share Your Story",   emoji: "🎉" },
];

const REACTIONS = [
  { key: "agree", emoji: "👍", label: "Agree"      },
  { key: "faced", emoji: "🙋", label: "Faced this" },
  { key: "idea",  emoji: "💡", label: "Great idea" },
  { key: "love",  emoji: "❤️", label: "Love this"  },
];

const ADMIN_TAGS = [
  { key: "realTalk",      label: "Real Talk",      emoji: "💬" },
  { key: "emotional",     label: "Emotional",      emoji: "🥹" },
  { key: "hiddenGem",     label: "Hidden Gem",     emoji: "💎" },
  { key: "mustRead",      label: "Must Read",      emoji: "📌" },
  { key: "proTip",        label: "Pro Tip",        emoji: "🔑" },
  { key: "trending",      label: "Trending",       emoji: "🔥" },
  { key: "wholesome",     label: "Wholesome",      emoji: "🌸" },
  { key: "controversial", label: "Controversial",  emoji: "⚡" },
];

const SEED_POSTS = [
  {
    id: 1, category: "story",
    author: "Priya S.", avatar: "P", avatarColor: "#C47A2E",
    event: "Anniversary Dinner", city: "Delhi", date: "2 days ago",
    title: "The decorator literally transformed our terrace",
    body: "We had a rooftop anniversary dinner for 30 people. The decorator added fairy lights, flower arches, and a photo wall — everything was beyond what we imagined. Guests couldn't stop complimenting. Highly recommend investing in a good decorator!",
    reactions: { agree: 15, faced: 3, idea: 8, love: 16 },
    adminTags: [], comments: 8, bookmarks: 12,
  },
  {
    id: 2, category: "story",
    author: "Rahul M.", avatar: "R", avatarColor: "#6B3A1F",
    event: "Birthday Party", city: "Noida", date: "5 days ago",
    title: "The DJ played our inside-joke songs without us asking",
    body: "We had given a playlist but the DJ noticed we had some niche 90s songs and actually researched more similar tracks on his own. The surprise throwback set had everyone on the dance floor for 40 straight minutes. Best birthday ever.",
    reactions: { agree: 25, faced: 12, idea: 9, love: 21 },
    adminTags: [], comments: 14, bookmarks: 23,
  },
  {
    id: 3, category: "ideas",
    author: "Neha K.", avatar: "N", avatarColor: "#C47A2E",
    event: "Get-together", city: "Gurgaon", date: "1 week ago",
    title: "Live food stations are SO much better than buffets",
    body: "We did live pasta and chaat stations instead of a regular buffet — it became an activity itself! People loved watching food being made fresh. It kept the energy high and reduced waste too. Every party should do this.",
    reactions: { agree: 22, faced: 5, idea: 38, love: 24 },
    adminTags: [], comments: 21, bookmarks: 45,
  },
  {
    id: 4, category: "story",
    author: "Arjun T.", avatar: "A", avatarColor: "#9B7450",
    event: "Corporate Event", city: "Delhi", date: "1 week ago",
    title: "Photographer didn't deliver photos for 3 weeks",
    body: "The event went fine but the photographer kept pushing delivery. Finally got photos after following up 8 times over 3 weeks. Some were blurry. Lesson: always put delivery timelines in writing before the event, with a penalty clause.",
    reactions: { agree: 8, faced: 18, idea: 3, love: 5 },
    adminTags: [], comments: 29, bookmarks: 18,
  },
  {
    id: 5, category: "ideas",
    author: "Sneha R.", avatar: "S", avatarColor: "#C47A2E",
    event: "Pre-wedding", city: "Greater Noida", date: "2 weeks ago",
    title: "Garden maze concept for pre-wedding photoshoot",
    body: "Saw this at a wedding expo — the couple had a garden maze set up with flowers and lanterns, and the photoshoot happened as they 'found' each other. The photos were incredible and each frame told a story. Would love to see someone try this in Delhi NCR!",
    reactions: { agree: 35, faced: 8, idea: 42, love: 27 },
    adminTags: [], comments: 33, bookmarks: 67,
  },
  {
    id: 6, category: "ideas",
    author: "Vikram D.", avatar: "V", avatarColor: "#6B3A1F",
    event: "Office Party", city: "Noida", date: "2 weeks ago",
    title: "Silent disco for 150 people — no complaints from neighbors",
    body: "We were worried about noise for our rooftop office party in an apartment complex. A silent disco setup (wireless headphones, 2 channels) solved everything. People were dancing, others were eating quietly — it worked perfectly for a mixed crowd.",
    reactions: { agree: 30, faced: 15, idea: 18, love: 15 },
    adminTags: [], comments: 17, bookmarks: 34,
  },
];

const catColor = {
  polls: { bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)",  text: "#1d4ed8" },
  ideas: { bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.25)",  text: "#7e22ce" },
  ask:   { bg: "rgba(234,179,8,0.1)",   border: "rgba(234,179,8,0.25)",   text: "#92400e" },
  story: { bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",   text: "#15803d" },
};

export default function CommunityWall() {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  if (!user?.isAdmin) { navigate("/"); return null; }

  const [activeCategory, setActiveCategory] = useState("all");
  const [posts, setPosts] = useState(SEED_POSTS);
  const [myReactions, setMyReactions] = useState({});
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [adminTagOpen, setAdminTagOpen] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", category: "story", event: "", city: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const filtered = activeCategory === "all" ? posts : posts.filter(p => p.category === activeCategory);

  const handleReaction = (postId, reactionKey) => {
    const current = myReactions[postId] || null;
    setMyReactions(prev => ({ ...prev, [postId]: current === reactionKey ? null : reactionKey }));
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const reactions = { ...p.reactions };
      if (current) reactions[current] = Math.max(0, (reactions[current] || 0) - 1);
      if (current !== reactionKey) reactions[reactionKey] = (reactions[reactionKey] || 0) + 1;
      return { ...p, reactions };
    }));
  };

  const toggleBookmark = (id) => {
    setBookmarkedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleAdminTag = (postId, tagKey) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const tags = p.adminTags || [];
      const newTags = tags.includes(tagKey) ? tags.filter(t => t !== tagKey) : [...tags, tagKey];
      return { ...p, adminTags: newTags };
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPost = {
      id: Date.now(),
      ...form,
      author: user.name || "Admin",
      avatar: (user.name || "A")[0].toUpperCase(),
      avatarColor: "#C47A2E",
      date: "just now",
      reactions: { agree: 0, faced: 0, idea: 0, love: 0 },
      adminTags: [],
      comments: 0,
      bookmarks: 0,
    };
    setPosts(prev => [newPost, ...prev]);
    setForm({ title: "", body: "", category: "story", event: "", city: "" });
    setFormSubmitted(true);
    setFormOpen(false);
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  const catInfo = (key) => CATEGORIES.find(c => c.key === key) || CATEGORIES[0];

  return (
    <div style={{ minHeight: "100vh", background: "#FFFCF5", fontFamily: font }}>
      <HamburgerNav />

      {/* Admin Preview Banner */}
      <div style={{ background: "linear-gradient(90deg,#92400e,#C47A2E)", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: "0.02em" }}>🔒 Admin Preview Mode</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>— Community Wall is not yet publicly visible</span>
      </div>

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
            Real experiences, surprise moments, creative ideas, and honest lessons — shared by people who celebrate with Tendr.
          </p>
          <button
            onClick={() => setFormOpen(v => !v)}
            style={{ padding: "13px 32px", borderRadius: 100, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 6px 24px rgba(196,122,46,0.4)", letterSpacing: "0.01em" }}>
            {formOpen ? "Close Form" : "+ Share Your Story"}
          </button>
        </div>
      </div>

      {/* Success toast */}
      {formSubmitted && (
        <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", zIndex: 999, background: "#15803d", color: "#fff", padding: "12px 24px", borderRadius: 100, fontSize: 13, fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", fontFamily: font }}>
          ✓ Story added to the wall!
        </div>
      )}

      {/* Submission Form */}
      {formOpen && (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px 0" }}>
          <form onSubmit={handleSubmit} style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.2)", padding: "28px 28px", boxShadow: "0 6px 30px rgba(196,122,46,0.08)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 20px" }}>Share Your Experience</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6B3A1F", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Category *</label>
                <select required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", background: "#fff" }}>
                  {CATEGORIES.filter(c => c.key !== "all").map(c => (
                    <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6B3A1F", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Event Type</label>
                <input type="text" placeholder="e.g. Birthday Party" value={form.event} onChange={e => setForm(p => ({ ...p, event: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6B3A1F", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Title *</label>
              <input required type="text" placeholder="Give your story a headline..." value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6B3A1F", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Your Story *</label>
              <textarea required rows={4} placeholder="Tell us what happened, what surprised you, or what you'd suggest..." value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }} />
            </div>
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
              {cat.key !== "all" && <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.75 }}>({posts.filter(p => p.category === cat.key).length})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div style={{ maxWidth: 900, margin: "24px auto 60px", padding: "0 20px" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B7450" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌟</div>
            <p style={{ fontSize: 15, fontWeight: 600 }}>No posts in this category yet.</p>
            <p style={{ fontSize: 13 }}>Be the first to share!</p>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {filtered.map(post => {
            const cc = catColor[post.category] || catColor.story;
            const ci = catInfo(post.category);
            const isBookmarked = bookmarkedIds.has(post.id);
            const myReaction = myReactions[post.id] || null;
            return (
              <div key={post.id} style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.12)", padding: "24px 28px", boxShadow: "0 2px 16px rgba(196,122,46,0.05)", transition: "box-shadow 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 28px rgba(196,122,46,0.12)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 16px rgba(196,122,46,0.05)"}>

                {/* Post header */}
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

                {/* Title + Body */}
                <h3 style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E", margin: "0 0 10px", lineHeight: 1.3 }}>{post.title}</h3>
                <p style={{ fontSize: 14, color: "#4A2810", lineHeight: 1.7, margin: "0 0 14px" }}>{post.body}</p>

                {/* Admin-curated tags — visible to all */}
                {post.adminTags?.length > 0 && !adminTagOpen[post.id] && (
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
                    {post.adminTags.map(tagKey => {
                      const tagInfo = ADMIN_TAGS.find(t => t.key === tagKey);
                      return tagInfo ? (
                        <span key={tagKey} style={{ padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: "rgba(196,122,46,0.08)", color: "#C47A2E", border: "1px solid rgba(196,122,46,0.2)" }}>
                          {tagInfo.emoji} {tagInfo.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Reactions */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", borderTop: "1px solid rgba(196,122,46,0.08)", paddingTop: 14 }}>
                  {REACTIONS.map(r => {
                    const isActive = myReaction === r.key;
                    const count = post.reactions[r.key] || 0;
                    return (
                      <button key={r.key} onClick={() => handleReaction(post.id, r.key)}
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 100, border: `1.5px solid ${isActive ? "#C47A2E" : "rgba(196,122,46,0.15)"}`, background: isActive ? "rgba(196,122,46,0.1)" : "transparent", color: isActive ? "#C47A2E" : "#9B7450", fontSize: 12, fontWeight: isActive ? 700 : 500, cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}>
                        <span style={{ fontSize: 13 }}>{r.emoji}</span>
                        <span style={{ fontWeight: 700 }}>{count}</span>
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                  <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                    <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 100, border: "1.5px solid rgba(196,122,46,0.15)", background: "transparent", color: "#9B7450", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                      💬 {post.comments}
                    </button>
                    <button onClick={() => toggleBookmark(post.id)}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 100, border: `1.5px solid ${isBookmarked ? "#CCAB4A" : "rgba(196,122,46,0.15)"}`, background: isBookmarked ? "rgba(204,171,74,0.12)" : "transparent", color: isBookmarked ? "#CCAB4A" : "#9B7450", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}>
                      {isBookmarked ? "🔖" : "🏷️"} {post.bookmarks}
                    </button>
                  </div>
                </div>

                {/* Admin: tag management */}
                {user?.isAdmin && (
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed rgba(196,122,46,0.15)" }}>
                    <button onClick={() => setAdminTagOpen(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      style={{ fontSize: 11, color: "#9B7450", background: "none", border: "1px dashed rgba(196,122,46,0.3)", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontFamily: font, fontWeight: 600 }}>
                      🏷️ {adminTagOpen[post.id] ? "Close" : (post.adminTags?.length > 0 ? `Edit Tags (${post.adminTags.length})` : "Add Tag")}
                    </button>
                    {adminTagOpen[post.id] && (
                      <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {ADMIN_TAGS.map(tag => {
                          const isTagged = post.adminTags?.includes(tag.key);
                          return (
                            <button key={tag.key} onClick={() => handleAdminTag(post.id, tag.key)}
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
