import React from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

const gold = "#C47A2E";
const goldLight = "#CCAB4A";
const ink = "#1C0A04";
const cream = "#FFFCF5";
const muted = "#9B7450";
const font = "'Outfit', sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";

const PERKS = [
  { icon: "💰", title: "Earn per booking", desc: "Get a fixed coordinator fee on every event you manage through Tendr — directly deposited." },
  { icon: "📅", title: "Flexible schedule", desc: "Accept only the events you want. Full control over your calendar and workload." },
  { icon: "🎯", title: "Ready-made clients", desc: "No cold outreach. Tendr connects you with customers who are actively planning their event." },
  { icon: "📊", title: "Your own dashboard", desc: "Manage all your bookings, track payments, and communicate with clients from one place." },
  { icon: "🏆", title: "Build your portfolio", desc: "Every event adds to your Tendr profile — ratings, reviews, and photos all in one public portfolio." },
  { icon: "🤝", title: "Vendor network access", desc: "Work directly with Tendr's vetted vendors. No chasing contacts — everything's in the platform." },
];

const STEPS = [
  { n: "01", title: "Apply & verify", desc: "Fill out the onboarding form with your experience, specialisations, and city. We review applications within 48 hours." },
  { n: "02", title: "Get matched", desc: "Once approved, Tendr's system starts surfacing your profile to customers whose event type and location match yours." },
  { n: "03", title: "Manage & earn", desc: "Accept events, coordinate with vendors, support the client on the day, and get paid — all through the Tendr platform." },
];

const WHO = [
  "You've coordinated at least 3–5 events (personal or professional).",
  "You're based in Delhi, Noida, Gurgaon, Ghaziabad, or Greater Noida.",
  "You're comfortable using apps for communication and scheduling.",
  "You take ownership — clients trust you as their single point of contact.",
];

export default function CoordinatorLanding() {
  const navigate = useNavigate();

  return (
    <div style={{ background: cream, minHeight: "100vh", fontFamily: font }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        background: `linear-gradient(140deg, #1C0A04 0%, #2C1508 55%, #3A1E08 100%)`,
        padding: "120px 24px 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* decorative blobs */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 340, height: 340, borderRadius: "50%", background: `rgba(196,122,46,.07)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 260, height: 260, borderRadius: "50%", background: `rgba(196,122,46,.05)`, pointerEvents: "none" }} />

        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <span style={{
            display: "inline-block", marginBottom: 18,
            background: `linear-gradient(135deg,${gold},${goldLight})`,
            color: "#fff", fontSize: 10.5, fontWeight: 800,
            letterSpacing: "0.18em", textTransform: "uppercase",
            padding: "5px 16px", borderRadius: 100,
          }}>For Event Coordinators</span>

          <h1 style={{
            fontFamily: serif, fontSize: "clamp(2.2rem,5.5vw,3.6rem)", fontWeight: 600,
            color: "#FFF8EC", lineHeight: 1.15, marginBottom: 20, letterSpacing: "-0.01em",
          }}>
            Turn your event expertise<br />
            <span style={{ color: gold, fontStyle: "italic" }}>into a career on Tendr.</span>
          </h1>

          <p style={{ fontSize: 16, color: "rgba(255,247,235,0.65)", lineHeight: 1.8, maxWidth: 540, margin: "0 auto 36px" }}>
            Join Tendr as an independent event coordinator — get matched with real clients,
            manage their event end-to-end, and earn per booking. No agency overhead, no cold pitching.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/coordinator/register")}
              style={{
                background: `linear-gradient(135deg,${gold},${goldLight})`,
                color: "#fff", border: "none", padding: "15px 36px",
                borderRadius: 12, fontSize: 15, fontWeight: 700,
                cursor: "pointer", fontFamily: font, letterSpacing: "0.02em",
                boxShadow: "0 6px 28px rgba(196,122,46,0.4)",
                transition: "transform 0.2s,box-shadow 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(196,122,46,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(196,122,46,0.4)"; }}
            >
              Apply Now →
            </button>
            <button
              onClick={() => navigate("/coordinator/login")}
              style={{
                background: "transparent", color: "rgba(255,247,235,0.78)",
                border: "1.5px solid rgba(196,122,46,0.4)", padding: "14px 28px",
                borderRadius: 12, fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: font,
                transition: "border-color 0.2s,color 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.color = "#FFF8EC"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.4)"; e.currentTarget.style.color = "rgba(255,247,235,0.78)"; }}
            >
              Already a coordinator? Sign in
            </button>
          </div>

          {/* trust bar */}
          <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 44, flexWrap: "wrap" }}>
            {[["500+", "Events managed"], ["Delhi NCR", "Coverage area"], ["48 hrs", "Application review"]].map(([num, lbl]) => (
              <div key={lbl} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 600, color: gold }}>{num}</div>
                <div style={{ fontSize: 11, color: "rgba(255,247,235,0.45)", letterSpacing: "0.06em", textTransform: "uppercase", marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "80px 24px", background: "#FAF7F2" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: gold, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>How it works</p>
          <h2 style={{ fontFamily: serif, fontSize: "clamp(1.7rem,3.5vw,2.4rem)", fontWeight: 600, color: ink, textAlign: "center", marginBottom: 52 }}>
            Three steps to your first event
          </h2>

          <div style={{ display: "flex", gap: 0, flexWrap: "wrap", position: "relative" }}>
            {/* connector line */}
            <div style={{ position: "absolute", top: 28, left: "calc(16.66% + 16px)", right: "calc(16.66% + 16px)", height: 2, background: `linear-gradient(90deg,${gold},${goldLight})`, opacity: 0.2, pointerEvents: "none" }} />

            {STEPS.map((s, i) => (
              <div key={i} style={{ flex: "1 1 260px", padding: "0 20px", textAlign: "center", position: "relative" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: `linear-gradient(135deg,${gold},${goldLight})`,
                  color: "#fff", fontFamily: serif, fontSize: "1.2rem", fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px", boxShadow: "0 4px 20px rgba(196,122,46,0.25)",
                }}>{s.n}</div>
                <h3 style={{ fontFamily: serif, fontSize: "1.25rem", fontWeight: 600, color: ink, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: muted, lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERKS GRID ── */}
      <section style={{ padding: "80px 24px", background: cream }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: gold, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>Why Tendr</p>
          <h2 style={{ fontFamily: serif, fontSize: "clamp(1.7rem,3.5vw,2.4rem)", fontWeight: 600, color: ink, textAlign: "center", marginBottom: 48 }}>
            Everything you need to run your business
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
            {PERKS.map((p, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 18, padding: "26px 24px",
                border: "1.5px solid rgba(196,122,46,0.1)",
                boxShadow: "0 2px 18px rgba(28,10,4,0.04)",
                transition: "box-shadow 0.2s,transform 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 32px rgba(196,122,46,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 18px rgba(28,10,4,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ fontSize: 30, marginBottom: 14 }}>{p.icon}</div>
                <h3 style={{ fontFamily: serif, fontSize: "1.1rem", fontWeight: 700, color: ink, marginBottom: 8 }}>{p.title}</h3>
                <p style={{ fontSize: 13.5, color: muted, lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO SHOULD APPLY ── */}
      <section style={{ padding: "80px 24px", background: "#FAF7F2" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <p style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: gold, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 10 }}>Requirements</p>
          <h2 style={{ fontFamily: serif, fontSize: "clamp(1.7rem,3.5vw,2.4rem)", fontWeight: 600, color: ink, textAlign: "center", marginBottom: 40 }}>
            Who should apply?
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {WHO.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                background: "#fff", borderRadius: 14, padding: "18px 20px",
                border: "1.5px solid rgba(196,122,46,0.1)",
                boxShadow: "0 1px 8px rgba(28,10,4,0.04)",
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: `rgba(196,122,46,0.1)`, border: `1.5px solid rgba(196,122,46,0.3)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: gold, fontWeight: 700,
                }}>✓</div>
                <p style={{ fontSize: 14.5, color: ink, lineHeight: 1.6, margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        background: `linear-gradient(135deg, #1C0A04 0%, #2C1508 100%)`,
        padding: "72px 24px", textAlign: "center",
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: gold, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14 }}>Ready to start?</p>
        <h2 style={{ fontFamily: serif, fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 600, color: "#FFF8EC", marginBottom: 16, lineHeight: 1.2 }}>
          Join Tendr's coordinator network today.
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,247,235,0.55)", marginBottom: 36, lineHeight: 1.75, maxWidth: 480, margin: "0 auto 36px" }}>
          Applications are reviewed within 48 hours. Once approved, you can start accepting events immediately.
        </p>
        <button
          onClick={() => navigate("/coordinator/register")}
          style={{
            background: `linear-gradient(135deg,${gold},${goldLight})`,
            color: "#fff", border: "none", padding: "16px 48px",
            borderRadius: 12, fontSize: 16, fontWeight: 700,
            cursor: "pointer", fontFamily: font, letterSpacing: "0.02em",
            boxShadow: "0 6px 28px rgba(196,122,46,0.45)",
            transition: "transform 0.2s,box-shadow 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(196,122,46,0.55)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(196,122,46,0.45)"; }}
        >
          Start Your Application →
        </button>
      </section>

      <Footer />
    </div>
  );
}
