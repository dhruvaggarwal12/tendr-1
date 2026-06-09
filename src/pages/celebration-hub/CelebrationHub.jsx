import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import { POSTS, POLLS, IDEAS, TRENDING, ASK_POSTS, CATEGORY_COLORS } from "../../data/celebrationHubData";

const font = "'Outfit', sans-serif";
const BROWN = "#2C1A0E";
const GOLD  = "#C47A2E";
const CREAM = "#FFF8EE";
const REDDIT_URL = "https://www.reddit.com/r/tendr";

const TABS = [
  { id: "discussions", label: "Discussions",      emoji: "💬", accent: "#e05d2e" },
  { id: "polls",       label: "Polls & Votes",     emoji: "📊", accent: GOLD },
  { id: "ideas",       label: "Ideas & Inspo",     emoji: "💡", accent: "#7c3aed" },
  { id: "trending",    label: "Trending",           emoji: "🔥", accent: "#ef4444" },
  { id: "ask",         label: "Ask the Community",  emoji: "🙋", accent: "#16a34a" },
  { id: "stories",     label: "Share Your Story",   emoji: "🎉", accent: "#ea580c" },
];

function ReactionBar({ reactions }) {
  const items = [
    { label: "Agree", count: reactions.agree, emoji: "👍" },
    { label: "Faced this", count: reactions.facedThis, emoji: "🙋" },
    { label: "Great idea", count: reactions.greatIdea, emoji: "💡" },
    { label: "Love this", count: reactions.loveThis, emoji: "❤️" },
  ];
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
      {items.filter(i => i.count).map(({ label, count, emoji }) => (
        <span key={label} style={{ fontSize: 11, color: "#9B7450", background: "rgba(196,122,46,0.07)", border: "1px solid rgba(196,122,46,0.15)", borderRadius: 100, padding: "3px 10px", display: "flex", alignItems: "center", gap: 4 }}>
          {emoji} {count.toLocaleString()} {label}
        </span>
      ))}
    </div>
  );
}

function PostCard({ post }) {
  const [expanded, setExpanded] = useState(false);
  const catColor = CATEGORY_COLORS[post.category] || GOLD;
  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.1)", padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", fontFamily: font }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", background: catColor, borderRadius: 100, padding: "2px 10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {post.category.replace("-", " ")}
        </span>
        {post.isPinned && <span style={{ fontSize: 10, fontWeight: 700, color: GOLD, background: "rgba(196,122,46,0.1)", borderRadius: 100, padding: "2px 10px" }}>📌 Pinned</span>}
        {post.isFeatured && <span style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "rgba(124,58,237,0.08)", borderRadius: 100, padding: "2px 10px" }}>✨ Featured</span>}
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: BROWN, margin: "0 0 8px", lineHeight: 1.3, cursor: "pointer" }} onClick={() => setExpanded(v => !v)}>
        {post.title}
      </h3>
      {expanded && (
        <p style={{ fontSize: 13, color: "#5A3E2B", lineHeight: 1.6, margin: "0 0 10px" }}>{post.description}</p>
      )}
      {!expanded && (
        <p style={{ fontSize: 13, color: "#7A5535", lineHeight: 1.5, margin: "0 0 10px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {post.description}
        </p>
      )}
      <button onClick={() => setExpanded(v => !v)} style={{ fontSize: 12, color: GOLD, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: font, padding: 0, marginBottom: 10 }}>
        {expanded ? "Show less ↑" : "Read more ↓"}
      </button>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, color: "#9B7450" }}>
        <span>{post.isAnonymous ? "Anonymous" : post.author} · {post.date}</span>
        <span style={{ fontWeight: 600 }}>{post.answers} replies</span>
      </div>
      <ReactionBar reactions={post.reactions} />
    </div>
  );
}

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
          const isVoted = voted === i;
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

function TrendingTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {TRENDING.map((item, i) => (
        <div key={item.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.1)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", fontFamily: font }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: "rgba(196,122,46,0.25)", minWidth: 28 }}>#{i + 1}</span>
          <span style={{ fontSize: 22 }}>{item.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: BROWN }}>{item.topic}</div>
            <div style={{ fontSize: 12, color: "#9B7450", marginTop: 2 }}>{item.count.toLocaleString()} posts</div>
          </div>
          <div style={{ width: 80, height: 4, background: "rgba(196,122,46,0.12)", borderRadius: 100, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.round((item.count / TRENDING[0].count) * 100)}%`, background: `linear-gradient(90deg,${GOLD},#CCAB4A)`, borderRadius: 100 }} />
          </div>
        </div>
      ))}

      {/* Trending posts */}
      <div style={{ marginTop: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12 }}>Hot this week</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {POSTS.filter(p => p.isFeatured).slice(0, 5).map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AskTab() {
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {ASK_POSTS.map(post => (
        <div key={post.id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.1)", padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", fontFamily: font }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🙋</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: BROWN, margin: "0 0 4px", lineHeight: 1.3 }}>{post.q}</h3>
              <span style={{ fontSize: 11, color: "#9B7450" }}>Asked by {post.asker} · {post.date}</span>
            </div>
          </div>

          {/* Top 2 answers always visible */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
            {post.answers.slice(0, expanded === post.id ? undefined : 2).map((ans, i) => (
              <div key={i} style={{ background: "rgba(196,122,46,0.04)", borderRadius: 10, padding: "10px 14px", borderLeft: `3px solid ${GOLD}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 4 }}>{ans.author}</div>
                <div style={{ fontSize: 13, color: "#3B2F2F", lineHeight: 1.5 }}>{ans.text}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button onClick={() => setExpanded(expanded === post.id ? null : post.id)}
              style={{ fontSize: 12, color: GOLD, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: font, padding: 0 }}>
              {expanded === post.id ? "Show less ↑" : `See all ${post.totalAnswers} answers ↓`}
            </button>
            <span style={{ fontSize: 12, color: "#9B7450", fontWeight: 600 }}>💬 {post.totalAnswers} answers</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CelebrationHub() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState("discussions");

  React.useEffect(() => {
    if (!user?.isAdmin) navigate("/");
  }, [user, navigate]);
  if (!user?.isAdmin) return null;

  const storyPosts = POSTS.filter(p => p.category === "my-story");
  const allDiscussions = POSTS.filter(p => p.category !== "my-story");

  return (
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: font }}>
      <HamburgerNav active="Home" />

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "64px 16px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,69,0,0.08)", border: "1px solid rgba(255,69,0,0.2)", borderRadius: 100, padding: "5px 16px", marginBottom: 10 }}>
              <span style={{ fontSize: 14 }}>🎉</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#e05d2e", textTransform: "uppercase", letterSpacing: "0.1em" }}>Celebration Hub</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: BROWN, margin: "0 0 6px", lineHeight: 1.15, letterSpacing: "-0.01em" }}>
              Community Discussions
            </h1>
            <p style={{ fontSize: 14, color: "#7A5535", margin: 0, lineHeight: 1.5 }}>
              Real couples, real vendors, real talk.
            </p>
          </div>

          {/* Join Community — Reddit link as secondary button */}
          <a
            href={REDDIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 18px", borderRadius: 12,
              background: "#FF4500", border: "none",
              color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: font, textDecoration: "none",
              boxShadow: "0 4px 14px rgba(255,69,0,0.3)",
              flexShrink: 0, alignSelf: "flex-start",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="#fff">
              <path d="M16.67 10a1.46 1.46 0 00-2.47-1 7.12 7.12 0 00-3.85-1.23l.65-3.08 2.13.45a1 1 0 101.07-1 1 1 0 00-.96.68l-2.38-.5a.27.27 0 00-.32.2l-.73 3.44a7.14 7.14 0 00-3.89 1.23 1.46 1.46 0 10-1.61 2.39 2.87 2.87 0 000 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 000-.44 1.46 1.46 0 00.61-1.58zM7.27 11a1 1 0 111 1 1 1 0 01-1-1zm5.58 2.65a3.56 3.56 0 01-2.85.57 3.56 3.56 0 01-2.85-.57.19.19 0 01.27-.27 3.2 3.2 0 002.58.43 3.2 3.2 0 002.58-.43.19.19 0 01.27.27zm-.14-1.65a1 1 0 111-1 1 1 0 01-1 1z"/>
            </svg>
            Join Community
          </a>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", marginBottom: 24, paddingBottom: 4 }}>
          {TABS.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "9px 18px", borderRadius: 100, flexShrink: 0,
                  border: `1.5px solid ${active ? tab.accent : "rgba(196,122,46,0.18)"}`,
                  background: active ? tab.accent : "#fff",
                  color: active ? "#fff" : "#7A5535",
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  cursor: "pointer", fontFamily: font,
                  boxShadow: active ? `0 4px 14px ${tab.accent}40` : "none",
                  transition: "all 0.18s",
                }}
              >
                <span style={{ fontSize: 15 }}>{tab.emoji}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === "discussions" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {allDiscussions.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}

        {activeTab === "polls" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
            {POLLS.map(poll => <PollCard key={poll.id} poll={poll} />)}
          </div>
        )}

        {activeTab === "ideas" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
            {IDEAS.map(idea => <IdeaCard key={idea.id} idea={idea} />)}
          </div>
        )}

        {activeTab === "trending" && <TrendingTab />}

        {activeTab === "ask" && <AskTab />}

        {activeTab === "stories" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {storyPosts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}

        {/* Footer nudge */}
        <div style={{ textAlign: "center", marginTop: 40, padding: "20px", background: "rgba(255,69,0,0.05)", borderRadius: 16, border: "1px solid rgba(255,69,0,0.12)" }}>
          <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 12px", lineHeight: 1.6 }}>
            Want to post, vote, and see even more discussions from the community?
          </p>
          <a
            href={REDDIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 12, background: "#FF4500", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: font, boxShadow: "0 4px 14px rgba(255,69,0,0.25)" }}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="#fff">
              <path d="M16.67 10a1.46 1.46 0 00-2.47-1 7.12 7.12 0 00-3.85-1.23l.65-3.08 2.13.45a1 1 0 101.07-1 1 1 0 00-.96.68l-2.38-.5a.27.27 0 00-.32.2l-.73 3.44a7.14 7.14 0 00-3.89 1.23 1.46 1.46 0 10-1.61 2.39 2.87 2.87 0 000 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 000-.44 1.46 1.46 0 00.61-1.58zM7.27 11a1 1 0 111 1 1 1 0 01-1-1zm5.58 2.65a3.56 3.56 0 01-2.85.57 3.56 3.56 0 01-2.85-.57.19.19 0 01.27-.27 3.2 3.2 0 002.58.43 3.2 3.2 0 002.58-.43.19.19 0 01.27.27zm-.14-1.65a1 1 0 111-1 1 1 0 01-1 1z"/>
            </svg>
            Join the Community on Reddit
          </a>
        </div>

      </div>
    </div>
  );
}
