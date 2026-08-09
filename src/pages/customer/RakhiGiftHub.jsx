import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import Footer from "../../components/Footer";

const F  = "'Outfit', sans-serif";
const FD = "'Cormorant Garamond', Georgia, serif";

const RAKSHA_BANDHAN = new Date("2026-08-09T00:00:00");

const AVATARS = [
  { initials: "P", color: "#C47A2E" },
  { initials: "R", color: "#9B7450" },
  { initials: "A", color: "#CCAB4A" },
  { initials: "S", color: "#C47A2E" },
];

function useCountdown(target) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000)  / 60000),
        seconds: Math.floor((diff % 60000)    / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

const RakhiGiftHub = () => {
  const navigate = useNavigate();
  const timeLeft = useCountdown(RAKSHA_BANDHAN);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = (e) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: F }}>
      <SEO
        title="Rakhi Hampers — Tendr"
        description="Curated Rakhi hampers for your loved ones — personalised and delivered across Delhi NCR. Coming soon on Tendr."
        path="/rakhi-hampers"
      />
      <HamburgerNav title="Rakhi Hampers" showBack />

      <style>{`
        @keyframes rh-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rh-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(196,122,46,0.35); }
          50%       { box-shadow: 0 0 0 8px rgba(196,122,46,0); }
        }
        .rh-digit-block {
          background: rgba(255,252,245,0.06);
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 16px 12px 10px;
          min-width: 68px;
          text-align: center;
          backdrop-filter: blur(8px);
        }
        .rh-notify-btn {
          background: linear-gradient(135deg, #C47A2E, #CCAB4A);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-family: ${F};
          font-size: 14px;
          font-weight: 700;
          padding: 14px 24px;
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.2s;
        }
        .rh-notify-btn:hover { opacity: 0.88; }
        .rh-secondary-btn {
          background: transparent;
          border: 1.5px solid rgba(196,122,46,0.35);
          color: #C47A2E;
          border-radius: 12px;
          font-family: ${F};
          font-size: 14px;
          font-weight: 600;
          padding: 14px 24px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .rh-secondary-btn:hover { background: rgba(196,122,46,0.07); }
        @media (max-width: 640px) {
          .rh-hero    { padding: 64px 20px 56px !important; }
          .rh-hero-h1 { font-size: 2.8rem !important; }
          .rh-digit-block { min-width: 56px; padding: 12px 8px 8px; }
          .rh-email-row { flex-direction: column !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .rh-pulse-dot { animation: none !important; }
        }
      `}</style>

      {/* Hero */}
      <div className="rh-hero" style={{
        position: "relative", overflow: "hidden",
        background: "linear-gradient(160deg, #1C0A04 0%, #3A1808 55%, #2C1A0E 100%)",
        padding: "96px 24px 80px",
        textAlign: "center",
      }}>
        {/* Texture overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(204,171,74,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(196,122,46,0.12) 0%, transparent 70%)",
        }} />

        <div style={{ position: "relative", maxWidth: 580, margin: "0 auto" }}>
          {/* Live badge */}
          <div style={{ marginBottom: 28, animation: "rh-in 0.5s 0.05s both" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(204,171,74,0.1)",
              border: "1.5px solid rgba(204,171,74,0.28)",
              borderRadius: 100, padding: "7px 18px",
            }}>
              <span className="rh-pulse-dot" style={{
                width: 7, height: 7, borderRadius: "50%", background: "#CCAB4A",
                display: "inline-block",
                animation: "rh-pulse 2s ease-in-out infinite",
              }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#CCAB4A", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                Raksha Bandhan 2026 — Coming Soon
              </span>
            </span>
          </div>

          <h1 className="rh-hero-h1" style={{
            fontFamily: FD, fontSize: "clamp(3rem,7vw,4.8rem)",
            fontWeight: 300, color: "#FAF7F2",
            margin: "0 0 10px", lineHeight: 1.06,
            animation: "rh-in 0.55s 0.12s cubic-bezier(.22,1,.36,1) both",
          }}>
            Rakhi Hampers
          </h1>
          <p style={{
            fontFamily: FD, fontSize: "clamp(1.1rem,3vw,1.4rem)",
            color: "rgba(255,255,255,0.42)", fontStyle: "italic",
            margin: "0 0 44px",
            animation: "rh-in 0.55s 0.2s both",
          }}>For the ones who matter most</p>

          {/* Countdown */}
          <div style={{
            display: "flex", gap: 12, justifyContent: "center", marginBottom: 44,
            animation: "rh-in 0.55s 0.28s both",
          }}>
            {[
              { value: timeLeft.days,    label: "Days"    },
              { value: timeLeft.hours,   label: "Hours"   },
              { value: timeLeft.minutes, label: "Mins"    },
              { value: timeLeft.seconds, label: "Secs"    },
            ].map(({ value, label }) => (
              <div key={label} className="rh-digit-block">
                <div style={{
                  fontFamily: FD, fontSize: "clamp(2rem,5vw,2.8rem)",
                  fontWeight: 300, color: "#CCAB4A", lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {String(value).padStart(2, "0")}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.38)", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 6 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Social proof avatars */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            marginBottom: 36,
            animation: "rh-in 0.55s 0.34s both",
          }}>
            <div style={{ display: "flex" }}>
              {AVATARS.map((av, i) => (
                <div key={i} style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: av.color,
                  border: "2px solid #1C0A04",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#fff",
                  marginLeft: i === 0 ? 0 : -10,
                  zIndex: AVATARS.length - i,
                  position: "relative",
                }}>{av.initials}</div>
              ))}
            </div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
              <strong style={{ color: "rgba(255,255,255,0.8)" }}>200+ families</strong> already on the waitlist
            </span>
          </div>

          {/* Email capture */}
          <div style={{ animation: "rh-in 0.55s 0.4s both" }}>
            {submitted ? (
              <div style={{
                background: "rgba(196,122,46,0.12)",
                border: "1.5px solid rgba(196,122,46,0.3)",
                borderRadius: 14, padding: "18px 24px",
                color: "#CCAB4A", fontSize: 15, fontWeight: 600,
              }}>
                You're on the list! We'll notify you before launch.
              </div>
            ) : (
              <form onSubmit={handleNotify} style={{ display: "flex", gap: 8, maxWidth: 440, margin: "0 auto" }} className="rh-email-row">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    flex: 1, background: "rgba(255,255,255,0.07)",
                    border: "1.5px solid rgba(255,255,255,0.14)",
                    borderRadius: 12, padding: "14px 16px",
                    color: "#FAF7F2", fontSize: 14, fontFamily: F,
                    outline: "none", minWidth: 0,
                  }}
                />
                <button type="submit" className="rh-notify-btn">Notify me</button>
              </form>
            )}
          </div>

          {/* Browse existing */}
          <div style={{ marginTop: 20, animation: "rh-in 0.55s 0.46s both" }}>
            <button onClick={() => navigate("/gift-hampers-cakes")} className="rh-secondary-btn">
              Browse Gift Hampers in the meantime →
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RakhiGiftHub;
