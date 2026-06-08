import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";

const font = "'Outfit', sans-serif";
const BROWN = "#2C1A0E";
const GOLD  = "#C47A2E";
const CREAM = "#FFF8EE";

const REDDIT_URL = "https://www.reddit.com/r/tendr";

const CARDS = [
  {
    emoji: "💬",
    title: "Discussions",
    desc: "Talk to real couples about vendors, venues and decisions.",
    color: "rgba(255,69,0,0.08)",
    border: "rgba(255,69,0,0.18)",
    accent: "#e05d2e",
  },
  {
    emoji: "📊",
    title: "Polls & Votes",
    desc: "Vote on décor, colour palettes and event choices.",
    color: "rgba(196,122,46,0.08)",
    border: "rgba(196,122,46,0.22)",
    accent: GOLD,
  },
  {
    emoji: "💡",
    title: "Ideas & Inspo",
    desc: "Browse mood boards, vendor finds and wow-factor setups.",
    color: "rgba(124,58,237,0.07)",
    border: "rgba(124,58,237,0.18)",
    accent: "#7c3aed",
  },
  {
    emoji: "🔥",
    title: "Trending",
    desc: "See what real couples are discussing and voting on this week.",
    color: "rgba(239,68,68,0.07)",
    border: "rgba(239,68,68,0.18)",
    accent: "#ef4444",
  },
  {
    emoji: "🙋",
    title: "Ask the Community",
    desc: "Post a question and get answers from people who've done it.",
    color: "rgba(34,197,94,0.07)",
    border: "rgba(34,197,94,0.18)",
    accent: "#16a34a",
  },
  {
    emoji: "🎉",
    title: "Share Your Story",
    desc: "Post your event highlights, memories and vendor reviews.",
    color: "rgba(249,115,22,0.07)",
    border: "rgba(249,115,22,0.18)",
    accent: "#ea580c",
  },
];

export default function CelebrationHub() {
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);

  React.useEffect(() => {
    if (!user?.isAdmin) navigate("/");
  }, [user, navigate]);
  if (!user?.isAdmin) return null;

  const open = () => window.open(REDDIT_URL, "_blank", "noopener,noreferrer");

  return (
    <div style={{ minHeight: "100vh", background: CREAM, fontFamily: font }}>
      <HamburgerNav active="Home" />

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "72px 20px 60px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,69,0,0.08)", border: "1px solid rgba(255,69,0,0.2)", borderRadius: 100, padding: "5px 16px", marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>🎉</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#e05d2e", textTransform: "uppercase", letterSpacing: "0.1em" }}>Celebration Hub</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: BROWN, margin: "0 0 12px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Join the Tendr Community
          </h1>
          <p style={{ fontSize: 15, color: "#7A5535", maxWidth: 480, margin: "0 auto 28px", lineHeight: 1.6 }}>
            Real couples, real vendors, real talk. Join our Reddit community to discuss, vote, get inspired and share your celebrations.
          </p>

          {/* Big Reddit CTA */}
          <button
            onClick={open}
            style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              padding: "14px 32px", borderRadius: 16,
              background: "#FF4500", border: "none",
              color: "#fff", fontSize: 16, fontWeight: 800,
              cursor: "pointer", fontFamily: font,
              boxShadow: "0 6px 24px rgba(255,69,0,0.35)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 32px rgba(255,69,0,0.45)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(255,69,0,0.35)"; }}
          >
            <svg width="24" height="24" viewBox="0 0 20 20" fill="#fff">
              <path d="M16.67 10a1.46 1.46 0 00-2.47-1 7.12 7.12 0 00-3.85-1.23l.65-3.08 2.13.45a1 1 0 101.07-1 1 1 0 00-.96.68l-2.38-.5a.27.27 0 00-.32.2l-.73 3.44a7.14 7.14 0 00-3.89 1.23 1.46 1.46 0 10-1.61 2.39 2.87 2.87 0 000 .44c0 2.24 2.61 4.06 5.83 4.06s5.83-1.82 5.83-4.06a2.87 2.87 0 000-.44 1.46 1.46 0 00.61-1.58zM7.27 11a1 1 0 111 1 1 1 0 01-1-1zm5.58 2.65a3.56 3.56 0 01-2.85.57 3.56 3.56 0 01-2.85-.57.19.19 0 01.27-.27 3.2 3.2 0 002.58.43 3.2 3.2 0 002.58-.43.19.19 0 01.27.27zm-.14-1.65a1 1 0 111-1 1 1 0 01-1 1z" fill="#fff"/>
            </svg>
            Open r/tendr on Reddit
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7M7 7h10v10"/>
            </svg>
          </button>
        </div>

        {/* Feature cards — tapping any opens Reddit */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 40 }}>
          {CARDS.map(({ emoji, title, desc, color, border, accent }) => (
            <button
              key={title}
              onClick={open}
              style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start",
                gap: 8, padding: "20px 18px",
                background: color, border: `1.5px solid ${border}`,
                borderRadius: 16, cursor: "pointer", fontFamily: font,
                textAlign: "left", transition: "transform 0.15s, box-shadow 0.15s",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${border}`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"; }}
              onTouchStart={e => e.currentTarget.style.opacity = "0.8"}
              onTouchEnd={e => e.currentTarget.style.opacity = "1"}
            >
              <span style={{ fontSize: 28, lineHeight: 1 }}>{emoji}</span>
              <div style={{ fontSize: 15, fontWeight: 800, color: BROWN, lineHeight: 1.2 }}>{title}</div>
              <div style={{ fontSize: 13, color: "#7A5535", lineHeight: 1.5 }}>{desc}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: accent }}>Go to Reddit</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M7 7h10v10"/>
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Footer note */}
        <div style={{ textAlign: "center", padding: "20px", background: "rgba(196,122,46,0.06)", borderRadius: 16, border: "1px solid rgba(196,122,46,0.15)" }}>
          <p style={{ fontSize: 13, color: "#9B7450", margin: 0, lineHeight: 1.6 }}>
            Our community lives on Reddit — subscribe to <strong style={{ color: GOLD }}>r/tendr</strong> to get notified of new posts, polls and discussions.
          </p>
        </div>
      </div>
    </div>
  );
}
