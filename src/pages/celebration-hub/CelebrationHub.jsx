import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import {
  CATEGORIES, CATEGORY_COLORS, POSTS, POLLS, IDEAS, TRENDING, ASK_POSTS,
} from "../../data/celebrationHubData";

const F = "'Outfit', sans-serif";
const BROWN = "#2C1A0E";
const GOLD  = "#C47A2E";
const CREAM = "#FFFCF5";

const TABS = [
  { id:"feed",     label:"💬 Feed",        desc:"50 discussions" },
  { id:"ideas",    label:"💡 Idea Board",  desc:"Pinterest-style" },
  { id:"polls",    label:"📊 Polls",       desc:"Vote & discover" },
  { id:"ask",      label:"🙋 Ask",         desc:"Community Q&A" },
  { id:"trending", label:"🔥 Trending",    desc:"Hot topics" },
  { id:"admin",    label:"🔑 Moderate",    desc:"Admin panel" },
];

const REACTIONS = [
  { key:"agree",     emoji:"👍", label:"Agree" },
  { key:"facedThis", emoji:"😫", label:"Faced This" },
  { key:"greatIdea", emoji:"💡", label:"Great Idea" },
  { key:"loveThis",  emoji:"❤️", label:"Love This" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function catColor(catId) { return CATEGORY_COLORS[catId] || "#6B7280"; }
function catInfo(catId)  { return CATEGORIES.find(c => c.id === catId) || {}; }

// Only these two tabs are visible — rest stay in code for later
const VISIBLE_TABS = [
  { id:"feed",  label:"💬 Discussions" },
  { id:"admin", label:"🔑 Moderate"    },
];

function Pill({ label, color = GOLD, onClick, active, small }) {
  return (
    <button onClick={onClick} style={{
      display:"inline-flex", alignItems:"center", gap:4,
      padding: small ? "4px 10px" : "7px 14px",
      borderRadius:100, border:`1.5px solid ${active ? color : "rgba(44,26,14,0.1)"}`,
      background: active ? color : "transparent",
      color: active ? "#fff" : "#6B3A1F",
      fontSize: small ? 11 : 12, fontWeight:700, fontFamily:F, cursor:"pointer",
      whiteSpace:"nowrap", transition:"all 0.15s",
    }}>{label}</button>
  );
}

function ReactionBar({ post, myReaction, onReact }) {
  return (
    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:12 }}>
      {REACTIONS.map(r => {
        const count = (post.reactions[r.key] || 0) + (myReaction === r.key ? 1 : 0);
        const active = myReaction === r.key;
        return (
          <button key={r.key} onClick={() => onReact(post.id, r.key)}
            style={{
              display:"flex", alignItems:"center", gap:5,
              padding:"5px 10px", borderRadius:100,
              border:`1.5px solid ${active ? catColor(post.category) : "rgba(44,26,14,0.1)"}`,
              background: active ? `${catColor(post.category)}15` : "#fff",
              color: active ? catColor(post.category) : "#6B3A1F",
              fontSize:12, fontWeight:active?700:500, fontFamily:F, cursor:"pointer",
              transition:"all 0.15s",
            }}>
            <span style={{fontSize:13}}>{r.emoji}</span>
            <span>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

function PostCard({ post, myReaction, onReact, onCatClick }) {
  const [expanded, setExpanded] = useState(false);
  const cat = catInfo(post.category);
  const color = catColor(post.category);
  return (
    <div style={{
      background:"#fff", borderRadius:16, border:"1.5px solid rgba(44,26,14,0.07)",
      padding:"18px 20px",
      boxShadow:"0 2px 12px rgba(44,26,14,0.05)",
      position:"relative", transition:"box-shadow 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow="0 6px 24px rgba(44,26,14,0.10)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow="0 2px 12px rgba(44,26,14,0.05)"}
    >
      {/* Badges row */}
      <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap", alignItems:"center" }}>
        {/* Clickable category chip — filters the feed */}
        <button onClick={() => onCatClick?.(post.category)}
          style={{ padding:"3px 10px", borderRadius:100, background:`${color}15`, color, fontSize:11, fontWeight:700, border:"none", cursor:"pointer", fontFamily:F, transition:"background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background=`${color}28`}
          onMouseLeave={e => e.currentTarget.style.background=`${color}15`}>
          {cat.emoji} {cat.label}
        </button>
        {post.isPinned   && <span style={{ padding:"3px 9px", borderRadius:100, background:"#FEF9C3", color:"#92400E", fontSize:11, fontWeight:700 }}>📌 Pinned</span>}
        {post.isFeatured && <span style={{ padding:"3px 9px", borderRadius:100, background:"#FEF3C7", color:"#D97706", fontSize:11, fontWeight:700 }}>⭐ Featured</span>}
        {post.isAnonymous && <span style={{ padding:"3px 9px", borderRadius:100, background:"#F3F4F6", color:"#6B7280", fontSize:11, fontWeight:600 }}>🕵️ Anonymous</span>}
        {post.isNew      && <span style={{ padding:"3px 9px", borderRadius:100, background:"#DCFCE7", color:"#15803D", fontSize:11, fontWeight:700 }}>🆕 New</span>}
      </div>

      {/* Title */}
      <h3 style={{ fontSize:15, fontWeight:800, color:BROWN, margin:"0 0 8px", lineHeight:1.4, cursor:"pointer" }}
        onClick={() => setExpanded(!expanded)}>
        {post.title}
      </h3>

      {/* Description */}
      <p style={{
        fontSize:13, color:"#6B3A1F", lineHeight:1.65, margin:"0 0 4px",
        display:"-webkit-box", WebkitLineClamp: expanded ? "unset" : 2,
        WebkitBoxOrient:"vertical", overflow: expanded ? "visible" : "hidden",
      }}>{post.description}</p>
      {!expanded && (
        <button onClick={() => setExpanded(true)} style={{ fontSize:12, color:GOLD, fontWeight:700, background:"none", border:"none", cursor:"pointer", padding:"2px 0 0", fontFamily:F }}>
          Read more ↓
        </button>
      )}

      {/* Author + date + answers */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:12, flexWrap:"wrap", gap:8 }}>
        <span style={{ fontSize:12, color:"#9B7450" }}>
          {post.isAnonymous ? "🕵️ Anonymous" : `👤 ${post.author}`} · {post.date}
        </span>
        <span style={{ fontSize:12, color:GOLD, fontWeight:600 }}>💬 {post.answers} answers</span>
      </div>

      <ReactionBar post={post} myReaction={myReaction} onReact={onReact} />
    </div>
  );
}

// ── POST TYPE CARDS for modal step 1 ──────────────────────────────────────
const POST_TYPES = CATEGORIES.filter(c => c.id !== "all").map(c => ({
  ...c,
  desc: {
    "surprise":    "An unexpected magical moment you want to share",
    "love-story":  "A proposal, romance, or heartwarming wedding memory",
    "epic-fail":   "What went hilariously wrong (and somehow still worked)",
    "emotional":   "Moments that moved everyone to happy tears",
    "hidden-gem":  "A vendor, venue, or trick nobody else is talking about",
    "wow-factor":  "Jaw-dropping setup, decor, or performance reveal",
    "money-saved": "Smart budget hack or vendor negotiation win",
    "real-talk":   "Honest review or warning — what nobody tells you",
    "shoutout":    "Praising someone who made your event unforgettable",
    "my-story":    "Your full journey from planning to the big day",
  }[c.id] || "",
}));

// ── FEED TAB ───────────────────────────────────────────────────────────────
function FeedTab({ posts, reactions, onReact, onAddPost }) {
  const [cat,        setCat]        = useState("all");
  const [search,     setSearch]     = useState("");
  const [modalStep,  setModalStep]  = useState(null); // null | "type" | "form"
  const [chosenType, setChosenType] = useState(null);
  const [form,       setForm]       = useState({ title:"", body:"", anon:false });

  const filtered = useMemo(() => {
    let r = cat === "all" ? posts : posts.filter(p => p.category === cat);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags?.some(t => t.includes(q))
      );
    }
    return [...r].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }, [cat, search, posts]);

  const openModal = () => { setModalStep("type"); setChosenType(null); setForm({ title:"", body:"", anon:false }); };
  const closeModal = () => setModalStep(null);

  const selectType = (type) => { setChosenType(type); setModalStep("form"); };

  const submitPost = () => {
    if (!form.title.trim()) return;
    onAddPost({
      id: Date.now(),
      title: form.title.trim(),
      description: form.body.trim() || "No description provided.",
      category: chosenType.id,
      vendorCategory: null,
      author: form.anon ? "Anonymous" : "You",
      isAnonymous: form.anon,
      isNew: true,
      date: "just now",
      reactions: { agree:0, facedThis:0, greatIdea:0, loveThis:0 },
      isPinned: false, isFeatured: false, isApproved: false,
      tags: [], answers: 0,
    });
    closeModal();
  };

  const postType = chosenType ? catInfo(chosenType.id) : null;

  return (
    <div>
      {/* ── Share Your Experience box ──────────────────────────────────── */}
      <div style={{ background:"#fff", borderRadius:16, border:"1.5px solid rgba(44,26,14,0.07)", padding:"16px 18px", marginBottom:20, boxShadow:"0 2px 8px rgba(44,26,14,0.04)" }}>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background:`linear-gradient(135deg,${GOLD},#CCAB4A)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>✨</div>
          <button onClick={openModal}
            style={{ flex:1, padding:"11px 14px", borderRadius:12, border:"1.5px solid rgba(44,26,14,0.1)", background:"#F9F5F0", color:"#9B7450", fontSize:13, textAlign:"left", cursor:"pointer", fontFamily:F }}>
            Share your experience, idea, or challenge…
          </button>
          <button onClick={openModal}
            style={{ padding:"11px 20px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${GOLD},#CCAB4A)`, color:"#fff", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:F, whiteSpace:"nowrap", boxShadow:"0 4px 12px rgba(196,122,46,0.25)", flexShrink:0 }}>
            Share →
          </button>
        </div>
      </div>

      {/* ── Search bar ────────────────────────────────────────────────── */}
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search discussions…"
        style={{ width:"100%", padding:"10px 14px", borderRadius:12, border:"1.5px solid rgba(44,26,14,0.12)", fontFamily:F, fontSize:13, color:BROWN, background:"#fff", outline:"none", boxSizing:"border-box", marginBottom:14 }} />

      {/* ── Category filter chips ─────────────────────────────────────── */}
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:6, marginBottom:18, scrollbarWidth:"none" }}>
        {CATEGORIES.map(c => {
          const active = cat === c.id;
          const col    = catColor(c.id) || GOLD;
          return (
            <button key={c.id} onClick={() => setCat(c.id)}
              style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 13px", borderRadius:100,
                border:`1.5px solid ${active ? col : "rgba(44,26,14,0.1)"}`,
                background: active ? col : "#fff",
                color: active ? "#fff" : "#6B3A1F",
                fontSize:12, fontWeight:700, fontFamily:F, cursor:"pointer",
                whiteSpace:"nowrap", transition:"all 0.15s", flexShrink:0 }}>
              {c.emoji} {c.label}
            </button>
          );
        })}
      </div>

      {/* ── Count ─────────────────────────────────────────────────────── */}
      <p style={{ fontSize:12, color:"#9B7450", marginBottom:14 }}>
        {filtered.length} discussion{filtered.length !== 1 ? "s" : ""}
        {search ? ` for "${search}"` : cat !== "all" ? ` in ${catInfo(cat).label}` : ""}
      </p>

      {/* ── Posts ─────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {filtered.map(p => (
          <PostCard key={p.id} post={p} myReaction={reactions[p.id]} onReact={onReact} onCatClick={setCat} />
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:"48px 24px", color:"#9B7450" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <p style={{ fontSize:14, fontWeight:600 }}>No discussions found.</p>
          </div>
        )}
      </div>

      {/* ── New Post Modal ────────────────────────────────────────────── */}
      {modalStep && (
        <>
          <div onClick={closeModal} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, backdropFilter:"blur(4px)" }} />
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"min(95vw,520px)", background:CREAM, borderRadius:22, zIndex:1001, fontFamily:F, overflow:"hidden", boxShadow:"0 28px 70px rgba(0,0,0,0.22)", maxHeight:"90vh", overflowY:"auto" }}>

            {/* Modal header */}
            <div style={{ padding:"18px 20px 16px", borderBottom:"1.5px solid rgba(44,26,14,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {modalStep === "form" && (
                  <button onClick={() => setModalStep("type")}
                    style={{ width:30, height:30, borderRadius:"50%", border:"1.5px solid rgba(44,26,14,0.12)", background:"#fff", color:BROWN, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F }}>←</button>
                )}
                <div>
                  <h3 style={{ fontSize:16, fontWeight:900, color:BROWN, margin:0 }}>
                    {modalStep === "type" ? "What type of post is this?" : `New ${chosenType?.label} Post`}
                  </h3>
                  {modalStep === "type" && <p style={{ fontSize:12, color:"#9B7450", margin:"3px 0 0" }}>Choose a category to get started</p>}
                  {modalStep === "form" && chosenType && (
                    <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 9px", borderRadius:100, background:`${catColor(chosenType.id)}15`, color:catColor(chosenType.id), fontSize:11, fontWeight:700, marginTop:4 }}>
                      {chosenType.emoji} {chosenType.label}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={closeModal}
                style={{ width:30, height:30, borderRadius:"50%", border:"1.5px solid rgba(44,26,14,0.12)", background:"#fff", color:"#9B7450", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F, flexShrink:0 }}>×</button>
            </div>

            {/* Step 1 — Post type grid */}
            {modalStep === "type" && (
              <div style={{ padding:"18px 20px 22px" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {POST_TYPES.map(type => {
                    const col = catColor(type.id);
                    return (
                      <button key={type.id} onClick={() => selectType(type)}
                        style={{ padding:"14px 14px", borderRadius:14, border:`1.5px solid ${col}22`,
                          background:`${col}08`, textAlign:"left", cursor:"pointer", fontFamily:F,
                          transition:"all 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.background=`${col}15`; e.currentTarget.style.borderColor=`${col}55`; e.currentTarget.style.transform="translateY(-1px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background=`${col}08`; e.currentTarget.style.borderColor=`${col}22`; e.currentTarget.style.transform="translateY(0)"; }}>
                        <div style={{ fontSize:22, marginBottom:6 }}>{type.emoji}</div>
                        <div style={{ fontSize:13, fontWeight:800, color:BROWN, marginBottom:3, lineHeight:1.3 }}>{type.label}</div>
                        <div style={{ fontSize:11, color:"#9B7450", lineHeight:1.4 }}>{type.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2 — Form */}
            {modalStep === "form" && (
              <div style={{ padding:"18px 20px 22px" }}>
                <div style={{ marginBottom:14 }}>
                  <label style={{ fontSize:12, fontWeight:700, color:BROWN, display:"block", marginBottom:6 }}>Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))}
                    placeholder={`What's your ${chosenType?.label?.toLowerCase()} about?`}
                    style={{ width:"100%", padding:"11px 13px", borderRadius:11, border:`1.5px solid ${form.title ? catColor(chosenType?.id) : "rgba(44,26,14,0.12)"}`, fontFamily:F, fontSize:13, color:BROWN, background:"#fff", outline:"none", boxSizing:"border-box", transition:"border-color 0.15s" }} />
                </div>
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:12, fontWeight:700, color:BROWN, display:"block", marginBottom:6 }}>Details <span style={{ fontWeight:400, color:"#9B7450" }}>(optional)</span></label>
                  <textarea value={form.body} onChange={e => setForm(f => ({...f, body:e.target.value}))}
                    placeholder="Share the full story, tips, or questions…"
                    rows={4}
                    style={{ width:"100%", padding:"11px 13px", borderRadius:11, border:"1.5px solid rgba(44,26,14,0.12)", fontFamily:F, fontSize:13, color:BROWN, background:"#fff", outline:"none", resize:"vertical", boxSizing:"border-box" }} />
                </div>
                <label style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:BROWN, cursor:"pointer", marginBottom:18, userSelect:"none" }}>
                  <div onClick={() => setForm(f => ({...f, anon:!f.anon}))}
                    style={{ width:20, height:20, borderRadius:5, border:`2px solid ${form.anon ? GOLD : "rgba(44,26,14,0.2)"}`, background: form.anon ? GOLD : "#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s" }}>
                    {form.anon && <span style={{ color:"#fff", fontSize:11, fontWeight:900 }}>✓</span>}
                  </div>
                  <span>Post anonymously <span style={{ fontSize:11, color:"#9B7450" }}>— your name won't be shown</span></span>
                </label>
                <button onClick={submitPost} disabled={!form.title.trim()}
                  style={{ width:"100%", padding:"13px", borderRadius:12, border:"none",
                    background: form.title.trim() ? `linear-gradient(135deg,${GOLD},#CCAB4A)` : "#E5E7EB",
                    color: form.title.trim() ? "#fff" : "#9CA3AF",
                    fontSize:14, fontWeight:800, cursor: form.title.trim() ? "pointer" : "not-allowed",
                    fontFamily:F, transition:"all 0.15s",
                    boxShadow: form.title.trim() ? "0 4px 14px rgba(196,122,46,0.3)" : "none" }}>
                  Post to Community →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── IDEA BOARD TAB ─────────────────────────────────────────────────────────
function IdeasTab({ savedIdeas, onSave }) {
  const [cat, setCat] = useState("all");
  const filtered = cat === "all" ? IDEAS : IDEAS.filter(i => i.category === cat);

  return (
    <div>
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:6, marginBottom:20, scrollbarWidth:"none" }}>
        {["all","decoration","food","venues","general","festivals"].map(c => {
          const info = catInfo(c);
          return (
            <Pill key={c} label={c === "all" ? "✨ All" : `${info.emoji} ${info.label}`}
              color={GOLD} active={cat === c} onClick={() => setCat(c)} />
          );
        })}
      </div>

      {/* Pinterest-style columns */}
      <div style={{ columns:"220px 3", gap:14 }}>
        {filtered.map(idea => {
          const isSaved = savedIdeas.has(idea.id);
          return (
            <div key={idea.id} style={{ breakInside:"avoid", marginBottom:14 }}>
              <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", border:"1.5px solid rgba(44,26,14,0.07)", boxShadow:"0 2px 10px rgba(44,26,14,0.06)", transition:"transform 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.transform="translateY(-3px)"}
                onMouseLeave={e => e.currentTarget.style.transform="translateY(0)"}>
                <div style={{ position:"relative" }}>
                  <img src={idea.image} alt={idea.title}
                    style={{ width:"100%", display:"block", aspectRatio: idea.id % 3 === 0 ? "4/5" : idea.id % 2 === 0 ? "3/2" : "1/1", objectFit:"cover" }} />
                  <button onClick={() => onSave(idea.id)}
                    style={{ position:"absolute", top:8, right:8, width:32, height:32, borderRadius:"50%", border:"none",
                      background: isSaved ? GOLD : "rgba(255,255,255,0.9)", color: isSaved ? "#fff" : BROWN,
                      fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                      boxShadow:"0 2px 8px rgba(0,0,0,0.15)", transition:"all 0.15s" }}>
                    {isSaved ? "🔖" : "＋"}
                  </button>
                </div>
                <div style={{ padding:"12px 14px 14px" }}>
                  <h4 style={{ fontSize:13, fontWeight:800, color:BROWN, margin:"0 0 5px", lineHeight:1.3 }}>{idea.title}</h4>
                  <p style={{ fontSize:11.5, color:"#9B7450", margin:"0 0 10px", lineHeight:1.5 }}>{idea.desc}</p>
                  <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:8 }}>
                    {idea.tags.slice(0,3).map(t => (
                      <span key={t} style={{ padding:"2px 7px", borderRadius:100, background:"rgba(196,122,46,0.08)", color:GOLD, fontSize:10, fontWeight:700 }}>#{t}</span>
                    ))}
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:11, color:"#9B7450" }}>👤 {idea.author}</span>
                    <span style={{ fontSize:11, color:"#9B7450" }}>🔖 {idea.saved + (isSaved ? 1 : 0)}</span>
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

// ── POLLS TAB ──────────────────────────────────────────────────────────────
function PollsTab({ votes, onVote }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
      {POLLS.map(poll => {
        const myVote = votes[poll.id];
        const hasVoted = myVote !== undefined;
        const totalVotes = poll.options.reduce((s, o) => s + o.votes, 0) + (hasVoted ? 1 : 0);

        return (
          <div key={poll.id} style={{ background:"#fff", borderRadius:18, border:"1.5px solid rgba(44,26,14,0.07)", overflow:"hidden", boxShadow:"0 2px 12px rgba(44,26,14,0.05)" }}>
            <div style={{ background:`linear-gradient(135deg,${BROWN},#4A2810)`, padding:"16px 18px" }}>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 6px", fontWeight:700 }}>Community Poll</p>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#fff", margin:0, lineHeight:1.4 }}>{poll.question}</h3>
            </div>
            <div style={{ padding:"16px 18px 20px" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
                {poll.options.map((opt, i) => {
                  const v = opt.votes + (hasVoted && myVote === i ? 1 : 0);
                  const pct = totalVotes > 0 ? Math.round((v / totalVotes) * 100) : 0;
                  const isChosen = myVote === i;
                  const isWinner = hasVoted && v === Math.max(...poll.options.map((o, j) => o.votes + (myVote === j ? 1 : 0)));

                  return (
                    <button key={i} onClick={() => !hasVoted && onVote(poll.id, i)}
                      style={{ position:"relative", padding:"11px 14px", borderRadius:12, border:`1.5px solid ${isChosen ? GOLD : "rgba(44,26,14,0.1)"}`,
                        background: hasVoted ? "transparent" : "#FFFCF5", cursor: hasVoted ? "default" : "pointer",
                        fontFamily:F, textAlign:"left", overflow:"hidden", transition:"border-color 0.2s" }}>
                      {/* Fill bar */}
                      {hasVoted && <div style={{ position:"absolute", left:0, top:0, bottom:0, width:`${pct}%`, background: isChosen ? `${GOLD}18` : "rgba(44,26,14,0.04)", transition:"width 0.6s ease", borderRadius:10 }} />}
                      <div style={{ position:"relative", display:"flex", justifyContent:"space-between", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:13, fontWeight: isChosen ? 800 : 500, color: isChosen ? GOLD : BROWN }}>
                          {isWinner && hasVoted ? "🏆 " : ""}{opt.label}
                        </span>
                        {hasVoted && <span style={{ fontSize:13, fontWeight:800, color: isChosen ? GOLD : "#9B7450" }}>{pct}%</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize:12, color:"#9B7450", margin:0 }}>
                {hasVoted ? `${totalVotes.toLocaleString()} total votes` : "Tap to vote"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── ASK TAB ────────────────────────────────────────────────────────────────
function AskTab() {
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ background:"linear-gradient(135deg,#F9F3E8,#FEF3C7)", borderRadius:16, padding:"18px 20px", border:"1.5px solid rgba(196,122,46,0.15)", marginBottom:4 }}>
        <h3 style={{ fontSize:15, fontWeight:900, color:BROWN, margin:"0 0 6px" }}>Ask the Community 🙋</h3>
        <p style={{ fontSize:13, color:"#7C4010", margin:"0 0 14px", lineHeight:1.6 }}>Real questions from event planners. Real answers from people who've been there.</p>
        <button style={{ padding:"9px 20px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${GOLD},#CCAB4A)`, color:"#fff", fontSize:13, fontWeight:800, cursor:"pointer", fontFamily:F }}>
          + Ask a Question
        </button>
      </div>

      {ASK_POSTS.map(post => (
        <div key={post.id} style={{ background:"#fff", borderRadius:16, border:"1.5px solid rgba(44,26,14,0.07)", overflow:"hidden", boxShadow:"0 2px 10px rgba(44,26,14,0.05)" }}>
          <div style={{ padding:"16px 20px 14px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:4 }}>
              <h3 style={{ fontSize:14, fontWeight:800, color:BROWN, margin:0, lineHeight:1.4, flex:1 }}>{post.q}</h3>
              <span style={{ padding:"3px 8px", borderRadius:100, background:"rgba(196,122,46,0.1)", color:GOLD, fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>
                {post.totalAnswers} answers
              </span>
            </div>
            <span style={{ fontSize:12, color:"#9B7450" }}>Asked by {post.asker} · {post.date}</span>
          </div>

          {/* Top 2 answers preview */}
          <div style={{ borderTop:"1.5px solid rgba(44,26,14,0.06)", padding:"12px 20px 14px" }}>
            {(expanded === post.id ? post.answers : post.answers.slice(0,1)).map((ans, i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom: i < post.answers.length - 1 ? 10 : 0 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${GOLD},#CCAB4A)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#fff", flexShrink:0 }}>
                  {ans.author[0]}
                </div>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:BROWN, display:"block", marginBottom:3 }}>{ans.author}</span>
                  <p style={{ fontSize:13, color:"#4A2810", margin:0, lineHeight:1.55 }}>{ans.text}</p>
                </div>
              </div>
            ))}
            {post.answers.length > 1 && (
              <button onClick={() => setExpanded(expanded === post.id ? null : post.id)}
                style={{ fontSize:12, color:GOLD, fontWeight:700, background:"none", border:"none", cursor:"pointer", padding:"8px 0 0", fontFamily:F }}>
                {expanded === post.id ? "Show less ↑" : `View ${post.answers.length - 1} more answer${post.answers.length > 2 ? "s" : ""} ↓`}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── TRENDING TAB ───────────────────────────────────────────────────────────
function TrendingTab({ onFilterFeed }) {
  const topPosts = useMemo(() => POSTS.filter(p => p.isFeatured || p.isPinned).slice(0, 6), []);

  return (
    <div>
      {/* Trending topics grid */}
      <div style={{ marginBottom:28 }}>
        <h3 style={{ fontSize:16, fontWeight:800, color:BROWN, margin:"0 0 14px" }}>🔥 Trending Now</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10 }}>
          {TRENDING.map(t => (
            <button key={t.id} onClick={() => onFilterFeed(t.relatedCategory)}
              style={{ background:"#fff", borderRadius:14, border:"1.5px solid rgba(44,26,14,0.08)", padding:"14px 16px", textAlign:"left", cursor:"pointer", transition:"all 0.18s", fontFamily:F, boxShadow:"0 2px 8px rgba(44,26,14,0.04)" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=GOLD; e.currentTarget.style.boxShadow=`0 4px 16px rgba(196,122,46,0.14)`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(44,26,14,0.08)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(44,26,14,0.04)"; }}>
              <div style={{ fontSize:20, marginBottom:6 }}>{t.emoji}</div>
              <div style={{ fontSize:13, fontWeight:800, color:BROWN, marginBottom:4 }}>{t.topic}</div>
              <div style={{ fontSize:11, color:"#9B7450", fontWeight:600 }}>{t.count.toLocaleString()} engagements</div>
            </button>
          ))}
        </div>
      </div>

      {/* Featured posts under trending */}
      <h3 style={{ fontSize:16, fontWeight:800, color:BROWN, margin:"0 0 14px" }}>⭐ Featured Discussions</h3>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12 }}>
        {topPosts.map(p => {
          const cat = catInfo(p.category);
          const color = catColor(p.category);
          const total = Object.values(p.reactions).reduce((a,b) => a+b, 0);
          return (
            <div key={p.id} style={{ background:"#fff", borderRadius:16, border:`1.5px solid ${color}20`, padding:"16px 18px", boxShadow:"0 2px 10px rgba(44,26,14,0.06)" }}>
              <span style={{ padding:"3px 9px", borderRadius:100, background:`${color}15`, color, fontSize:11, fontWeight:700, display:"inline-block", marginBottom:10 }}>
                {cat.emoji} {cat.label}
              </span>
              <h4 style={{ fontSize:13, fontWeight:800, color:BROWN, margin:"0 0 8px", lineHeight:1.4,
                display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                {p.title}
              </h4>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:11, color:"#9B7450" }}>💬 {p.answers} answers</span>
                <span style={{ fontSize:11, color:GOLD, fontWeight:700 }}>🔥 {total.toLocaleString()} reactions</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── ADMIN / MODERATION TAB ─────────────────────────────────────────────────
function AdminTab({ posts, modStatus, setModStatus }) {
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

  return (
    <div>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:12, marginBottom:20 }}>
        {[
          { label:"Total Posts",    value:stats.total,   color:"#1D4ED8", emoji:"📝" },
          { label:"Pinned",         value:stats.pinned,  color:"#D97706", emoji:"📌" },
          { label:"Featured",       value:stats.featured,color:GOLD,      emoji:"⭐" },
          { label:"Hidden",         value:stats.hidden,  color:"#DC2626", emoji:"🚫" },
        ].map(s => (
          <div key={s.label} style={{ background:"#fff", borderRadius:14, padding:"14px 16px", border:"1.5px solid rgba(44,26,14,0.07)", textAlign:"center" }}>
            <div style={{ fontSize:24, marginBottom:4 }}>{s.emoji}</div>
            <div style={{ fontSize:22, fontWeight:900, color:s.color, fontFamily:F }}>{s.value}</div>
            <div style={{ fontSize:11, color:"#9B7450", fontWeight:600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {[["all","All"],["pinned","Pinned"],["featured","Featured"],["hidden","Hidden"],["anon","Anonymous"]].map(([k,l]) => (
          <Pill key={k} label={l} active={filter===k} onClick={() => setFilter(k)} />
        ))}
      </div>

      <p style={{ fontSize:12, color:"#9B7450", marginBottom:14 }}>{displayed.length} post{displayed.length !== 1 ? "s" : ""} shown</p>

      {/* Post list */}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {displayed.map(p => {
          const st = modStatus[p.id] || {};
          const isPinned   = st.pinned   ?? p.isPinned;
          const isFeatured = st.featured ?? p.isFeatured;
          const isHidden   = st.hidden   ?? false;
          const color = catColor(p.category);

          return (
            <div key={p.id} style={{ background: isHidden ? "#F9FAFB" : "#fff", borderRadius:14, border:`1.5px solid ${isHidden ? "#E5E7EB" : "rgba(44,26,14,0.07)"}`, padding:"14px 16px", opacity: isHidden ? 0.6 : 1 }}>
              <div style={{ display:"flex", gap:10, alignItems:"flex-start", flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:200 }}>
                  <div style={{ display:"flex", gap:6, marginBottom:6, flexWrap:"wrap" }}>
                    <span style={{ padding:"2px 8px", borderRadius:100, background:`${color}15`, color, fontSize:10, fontWeight:700 }}>
                      {catInfo(p.category).emoji} {catInfo(p.category).label}
                    </span>
                    {isPinned   && <span style={{ padding:"2px 8px", borderRadius:100, background:"#FEF9C3", color:"#92400E", fontSize:10, fontWeight:700 }}>📌 Pinned</span>}
                    {isFeatured && <span style={{ padding:"2px 8px", borderRadius:100, background:"#FEF3C7", color:"#D97706", fontSize:10, fontWeight:700 }}>⭐ Featured</span>}
                    {isHidden   && <span style={{ padding:"2px 8px", borderRadius:100, background:"#FEE2E2", color:"#DC2626", fontSize:10, fontWeight:700 }}>🚫 Hidden</span>}
                    {p.isAnonymous && <span style={{ padding:"2px 8px", borderRadius:100, background:"#F3F4F6", color:"#6B7280", fontSize:10, fontWeight:700 }}>🕵️ Anon</span>}
                  </div>
                  <p style={{ fontSize:13, fontWeight:700, color:BROWN, margin:"0 0 3px",
                    display:"-webkit-box", WebkitLineClamp:1, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                    {p.title}
                  </p>
                  <span style={{ fontSize:11, color:"#9B7450" }}>{p.isAnonymous ? "Anonymous" : p.author} · {p.date} · 💬 {p.answers}</span>
                </div>
                {/* Action buttons */}
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", flexShrink:0 }}>
                  {[
                    { key:"pinned",   label: isPinned   ? "Unpin"    : "Pin",     color: isPinned   ? "#D97706" : "#6B7280" },
                    { key:"featured", label: isFeatured ? "Unfeature": "Feature", color: isFeatured ? GOLD      : "#6B7280" },
                    { key:"hidden",   label: isHidden   ? "Unhide"   : "Hide",    color: isHidden   ? "#DC2626" : "#6B7280" },
                  ].map(a => (
                    <button key={a.key} onClick={() => toggle(p.id, a.key)}
                      style={{ padding:"5px 12px", borderRadius:8, border:`1.5px solid ${a.color}30`, background:`${a.color}10`, color:a.color, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:F, transition:"all 0.15s" }}>
                      {a.label}
                    </button>
                  ))}
                  <button onClick={() => toggle(p.id, "deleted")}
                    style={{ padding:"5px 12px", borderRadius:8, border:"1.5px solid #FEE2E2", background:"#FEF2F2", color:"#DC2626", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:F }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function CelebrationHub() {
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  // All hooks MUST come before any conditional return
  const [activeTab,  setActiveTab]  = useState("feed");
  const [reactions,  setReactions]  = useState({});
  const [modStatus,  setModStatus]  = useState({});
  const [userPosts,  setUserPosts]  = useState([]);
  const [pollVotes,  setPollVotes]  = useState({});
  const [savedIdeas, setSavedIdeas] = useState(new Set());

  const allPosts = useMemo(() =>
    [...userPosts, ...POSTS].filter(p => !modStatus[p.id]?.deleted),
    [userPosts, modStatus]
  );

  useEffect(() => {
    if (!user?.isAdmin) navigate("/");
  }, [user, navigate]);

  if (!user?.isAdmin) return null;

  const handleReact   = (postId, reaction) =>
    setReactions(prev => ({ ...prev, [postId]: prev[postId] === reaction ? null : reaction }));

  const handleAddPost = (post) =>
    setUserPosts(prev => [post, ...prev]);

  return (
    <div style={{ minHeight:"100vh", background:"#F5EFE7", fontFamily:F }}>
      <HamburgerNav />

      {/* Admin preview strip */}
      <div style={{ background:"rgba(196,122,46,0.1)", borderBottom:"1px solid rgba(196,122,46,0.2)", padding:"8px 20px", textAlign:"center" }}>
        <span style={{ fontSize:12, color:GOLD, fontWeight:700 }}>
          🔒 Admin Preview — Celebration Hub · Not visible to users yet
        </span>
      </div>

      {/* ── Light header ─────────────────────────────────────────────────── */}
      <div style={{ background:"#fff", borderBottom:"1.5px solid rgba(44,26,14,0.07)", padding:"28px 24px 22px" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <p style={{ fontSize:11, fontWeight:700, color:GOLD, textTransform:"uppercase", letterSpacing:"0.14em", margin:"0 0 8px" }}>
            🎉 Community
          </p>
          <h1 style={{ fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:900, color:BROWN, margin:"0 0 8px", letterSpacing:"-0.02em", lineHeight:1.2 }}>
            Celebration Hub
          </h1>
          <p style={{ fontSize:14, color:"#9B7450", margin:0, lineHeight:1.65, maxWidth:520 }}>
            Share ideas, discover inspiration, discuss event challenges, and help shape the future of celebrations.
          </p>
        </div>
      </div>

      {/* ── Tab bar — only Feed + Moderate ───────────────────────────────── */}
      <div style={{ background:"#fff", borderBottom:"1.5px solid rgba(44,26,14,0.08)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:860, margin:"0 auto", padding:"0 20px", display:"flex" }}>
          {VISIBLE_TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding:"13px 18px", border:"none", background:"transparent",
                borderBottom:`2.5px solid ${activeTab === tab.id ? GOLD : "transparent"}`,
                color: activeTab === tab.id ? GOLD : "#9B7450",
                fontSize:13, fontWeight: activeTab === tab.id ? 800 : 600,
                cursor:"pointer", fontFamily:F, whiteSpace:"nowrap", transition:"all 0.15s" }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth:860, margin:"0 auto", padding:"24px 16px 64px" }}>
        {activeTab === "feed"  && <FeedTab posts={allPosts} reactions={reactions} onReact={handleReact} onAddPost={handleAddPost} />}
        {activeTab === "admin" && <AdminTab posts={[...userPosts, ...POSTS]} modStatus={modStatus} setModStatus={setModStatus} />}
      </div>

      {/* Hidden tab components kept for future launch — not rendered above */}
      <style>{`::-webkit-scrollbar { width:0; height:0; }`}</style>
    </div>
  );
}
