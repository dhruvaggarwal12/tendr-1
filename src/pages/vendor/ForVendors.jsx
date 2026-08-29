import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const font = "'Outfit', sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";

const BENEFITS = [
  { stat: "4×", title: "More bookings", desc: "Verified vendors get 4x more confirmed bookings than unverified ones.", icon: "🏆" },
  { stat: "₹0", title: "Commission — ever", desc: "What you quote is what you keep. No cuts, no hidden fees.", icon: "💰" },
  { stat: "24h", title: "Go live fast", desc: "Submit your details. Get approved in one business day. Start receiving requests.", icon: "⚡" },
  { stat: "Direct", title: "Own every conversation", desc: "Chat directly with every customer — negotiate, confirm, close. No middlemen.", icon: "💬" },
];

const DASHBOARD_SECTIONS = [
  {
    id: "overview",
    label: "Overview",
    icon: "📊",
    desc: "Your command centre — see bookings, requests, profile views, and earnings at a glance.",
    preview: (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "Profile views", value: "124", sub: "this week", color: "#C47A2E" },
          { label: "New requests", value: "7", sub: "awaiting reply", color: "#16A34A" },
          { label: "Confirmed bookings", value: "3", sub: "upcoming", color: "#0369a1" },
          { label: "Avg. response time", value: "2h", sub: "keep it fast", color: "#7C3AED" },
        ].map(s => (
          <div key={s.label} style={{ background: "#FFFCF5", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(196,122,46,0.12)" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#2C1A0E", marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: "#9B7450", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "requests",
    label: "Booking Requests",
    icon: "📩",
    desc: "Each request shows the customer's event details, date, budget range, and lets you accept or start a chat.",
    preview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { name: "Priya Sharma", event: "Birthday — 60 guests", date: "Aug 15", status: "New", statusColor: "#16A34A" },
          { name: "Rohan Mehta", event: "Office Party — 120 guests", date: "Sep 2", status: "Chatting", statusColor: "#C47A2E" },
          { name: "Anjali Singh", event: "Anniversary — 30 guests", date: "Sep 10", status: "New", statusColor: "#16A34A" },
        ].map(r => (
          <div key={r.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#FFFCF5", borderRadius: 10, border: "1px solid rgba(196,122,46,0.1)" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{r.name[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{r.name}</div>
              <div style={{ fontSize: 11, color: "#9B7450", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.event} · {r.date}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, background: r.statusColor + "18", color: r.statusColor, borderRadius: 100, padding: "3px 9px", flexShrink: 0 }}>{r.status}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "profile",
    label: "Your Profile",
    icon: "✨",
    desc: "Upload portfolio photos, set pricing, write your bio, list services — everything customers see is controlled by you.",
    preview: (
      <div style={{ background: "#FFFCF5", borderRadius: 14, border: "1px solid rgba(196,122,46,0.12)", overflow: "hidden" }}>
        <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#C47A2E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🎵</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>Your Stage Name</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>DJ · Delhi NCR · ✓ Verified</div>
          </div>
        </div>
        <div style={{ padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {["Party vibes", "Corporate", "Weddings"].map(tag => (
            <span key={tag} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, background: "rgba(196,122,46,0.08)", color: "#7A4A1A", borderRadius: 100, padding: "4px 0", border: "1px solid rgba(196,122,46,0.18)" }}>{tag}</span>
          ))}
        </div>
        <div style={{ padding: "0 16px 14px", display: "flex", gap: 6 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ flex: 1, height: 50, borderRadius: 8, background: `hsl(${30 + i * 15},40%,88%)` }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "chat",
    label: "Direct Chat",
    icon: "💬",
    desc: "Every request comes with a live chat. Discuss requirements, share quotes, negotiate — and finalise the booking directly.",
    preview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { text: "Hi! We need a DJ for 120 guests — mainly Bollywood & house music.", from: "customer" },
          { text: "Sounds perfect! My setup covers up to 150 guests. What time does it start?", from: "vendor" },
          { text: "7 PM onwards, till midnight. Budget is ₹18,000.", from: "customer" },
          { text: "Happy to do it for ₹16,500 — includes full sound system. Shall I confirm?", from: "vendor" },
        ].map((m, i) => (
          <div key={i} style={{ alignSelf: m.from === "customer" ? "flex-start" : "flex-end", maxWidth: "78%", background: m.from === "customer" ? "#fff" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", borderRadius: m.from === "customer" ? "14px 14px 14px 4px" : "14px 14px 4px 14px", padding: "8px 12px", fontSize: 11.5, color: m.from === "customer" ? "#2C1A0E" : "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", lineHeight: 1.5 }}>
            {m.text}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "earnings",
    label: "Earnings",
    icon: "💳",
    desc: "Track every booking's payout. Zero commission — the full amount goes to you after the customer pays.",
    preview: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(204,171,74,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Total earned this month</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#CCAB4A", fontVariantNumeric: "tabular-nums" }}>₹48,500</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>3 bookings · 0% commission</div>
        </div>
        {[
          { name: "Priya Sharma — Birthday", amt: "₹18,000", date: "Aug 15" },
          { name: "Rohan Mehta — Office Party", amt: "₹24,000", date: "Sep 2" },
          { name: "Anjali Singh — Anniversary", amt: "₹6,500", date: "Sep 10" },
        ].map(e => (
          <div key={e.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", background: "#FFFCF5", borderRadius: 10, border: "1px solid rgba(196,122,46,0.1)" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E" }}>{e.name}</div>
              <div style={{ fontSize: 10, color: "#9B7450" }}>{e.date}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#16A34A" }}>{e.amt}</div>
          </div>
        ))}
      </div>
    ),
  },
];

export default function ForVendors() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const active = DASHBOARD_SECTIONS.find(s => s.id === activeTab);

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <style>{`
        @media(max-width:768px){
          .fv-hero-grid { flex-direction: column !important; }
          .fv-benefits-grid { grid-template-columns: 1fr 1fr !important; }
          .fv-dash-layout { flex-direction: column !important; }
          .fv-tab-list { flex-direction: row !important; overflow-x: auto !important; border-right: none !important; border-bottom: 1px solid rgba(196,122,46,0.12) !important; }
          .fv-tab-btn { white-space: nowrap !important; border-right: none !important; border-bottom: 3px solid transparent !important; }
          .fv-tab-btn.active { border-right: none !important; border-bottom: 3px solid #C47A2E !important; }
        }
      `}</style>

      {/* Nav bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,252,245,0.96)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(196,122,46,0.1)", height: 52, display: "flex", alignItems: "center", padding: "0 24px", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} style={{ fontSize: 13, fontWeight: 600, color: "#6B3A1F", background: "rgba(139,69,19,0.06)", border: "1px solid rgba(139,69,19,0.15)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: font }}>
          ← Back
        </button>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#C47A2E", letterSpacing: "0.1em", textTransform: "uppercase" }}>For Vendors</span>
        <button onClick={() => navigate("/vendor/login")} style={{ fontSize: 12, fontWeight: 600, color: "#7A5535", background: "none", border: "none", cursor: "pointer", fontFamily: font }}>Log in</button>
      </div>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg,#1C0E04 0%,#2C1A0E 60%,#3A1A08 100%)", padding: "64px 24px 72px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div aria-hidden style={{ position: "absolute", top: -80, left: -100, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(196,122,46,0.15) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div aria-hidden style={{ position: "absolute", bottom: -60, right: -80, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle,rgba(204,171,74,0.12) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(204,171,74,0.1)", border: "1px solid rgba(204,171,74,0.28)", borderRadius: 100, padding: "5px 16px", marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: "#CCAB4A", letterSpacing: "0.15em", textTransform: "uppercase" }}>For Vendors & Artists</span>
          </div>
          <h1 style={{ fontFamily: serif, fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 300, color: "#FFF8EC", margin: "0 0 14px", lineHeight: 1.1 }}>
            Your next booking is{" "}
            <em style={{ color: "#CCAB4A", fontStyle: "italic" }}>already looking for you.</em>
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,248,236,0.6)", margin: "0 auto 28px", maxWidth: 460, lineHeight: 1.7 }}>
            DJs, photographers, caterers, decorators, emcees, bands — if you're in the event industry, join Tendr any way you like.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/vendor/register")}
              style={{ padding: "13px 32px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, fontFamily: font, cursor: "pointer", boxShadow: "0 6px 22px rgba(196,122,46,0.4)" }}
            >
              List My Service Free →
            </button>
            <button
              onClick={() => document.getElementById("fv-dashboard-tour")?.scrollIntoView({ behavior: "smooth" })}
              style={{ padding: "13px 24px", borderRadius: 12, border: "1.5px solid rgba(255,248,236,0.2)", background: "transparent", color: "rgba(255,248,236,0.8)", fontSize: 14, fontWeight: 600, fontFamily: font, cursor: "pointer" }}
            >
              View Dashboard →
            </button>
          </div>
        </div>
      </div>

      {/* Vendor type pills */}
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.1)", padding: "14px 24px", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", maxWidth: 900, margin: "0 auto" }}>
          {["DJ", "Emcee", "Photographer", "Decorator", "Caterer", "Band", "Videographer", "AV Setup", "Florist", "Anchor", "Mehendi Artist", "Makeup Artist"].map(t => (
            <span key={t} style={{ display: "inline-block", fontSize: 11.5, fontWeight: 600, color: "#7A5535", background: "#F9F6F1", border: "1px solid rgba(196,122,46,0.18)", borderRadius: 100, padding: "5px 13px", whiteSpace: "nowrap" }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#C47A2E", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Why Tendr</div>
          <h2 style={{ fontFamily: serif, fontSize: "clamp(1.7rem,3.5vw,2.4rem)", fontWeight: 400, color: "#1C0E04", margin: 0, lineHeight: 1.2 }}>
            Built for event professionals, not platforms
          </h2>
        </div>
        <div className="fv-benefits-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 56 }}>
          {BENEFITS.map(b => (
            <div key={b.stat} style={{ background: "#fff", borderRadius: 16, padding: "20px 18px", border: "1.5px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 12px rgba(196,122,46,0.06)" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{b.icon}</div>
              <div style={{ fontFamily: serif, fontSize: "1.8rem", fontWeight: 600, color: "#C47A2E", lineHeight: 1, marginBottom: 4 }}>{b.stat}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1C0E04", marginBottom: 6 }}>{b.title}</div>
              <div style={{ fontSize: 12, color: "#7A5535", lineHeight: 1.55 }}>{b.desc}</div>
            </div>
          ))}
        </div>

        {/* How to join */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", border: "1.5px solid rgba(196,122,46,0.12)", marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#C47A2E", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18 }}>How to join</div>
          <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
            {[
              { step: "1", title: "Fill the form", desc: "Name, service type, city, photos, starting price" },
              { step: "2", title: "Get approved", desc: "Our team reviews and approves within 24 hours" },
              { step: "3", title: "Go live", desc: "Your profile appears to customers searching in your area" },
              { step: "4", title: "Get booked", desc: "Customers send requests — you chat and close directly" },
            ].map((s, i, arr) => (
              <div key={s.step} style={{ flex: 1, minWidth: 160, paddingRight: i < arr.length - 1 ? 24 : 0, marginRight: i < arr.length - 1 ? 24 : 0, borderRight: i < arr.length - 1 ? "1px solid rgba(196,122,46,0.1)" : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 900, marginBottom: 10 }}>{s.step}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1C0E04", marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 11.5, color: "#7A5535", lineHeight: 1.55 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dashboard tour */}
      <div id="fv-dashboard-tour" style={{ background: "#1C0E04", padding: "56px 24px 64px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#CCAB4A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>Dashboard Tour</div>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(1.6rem,3vw,2.2rem)", fontWeight: 400, color: "#FFF8EC", margin: "0 0 10px", lineHeight: 1.2 }}>
              Everything in one place
            </h2>
            <p style={{ fontSize: 13.5, color: "rgba(255,248,236,0.5)", margin: 0 }}>Click any section to explore what your dashboard looks like</p>
          </div>

          <div className="fv-dash-layout" style={{ display: "flex", gap: 0, background: "rgba(255,252,245,0.03)", borderRadius: 20, border: "1px solid rgba(204,171,74,0.15)", overflow: "hidden" }}>
            {/* Tab list */}
            <div className="fv-tab-list" style={{ display: "flex", flexDirection: "column", width: 180, flexShrink: 0, borderRight: "1px solid rgba(204,171,74,0.1)" }}>
              {DASHBOARD_SECTIONS.map(s => (
                <button
                  key={s.id}
                  className={`fv-tab-btn${activeTab === s.id ? " active" : ""}`}
                  onClick={() => setActiveTab(s.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "13px 16px", border: "none",
                    background: activeTab === s.id ? "rgba(196,122,46,0.14)" : "transparent",
                    borderRight: `3px solid ${activeTab === s.id ? "#C47A2E" : "transparent"}`,
                    color: activeTab === s.id ? "#CCAB4A" : "rgba(255,248,236,0.5)",
                    fontWeight: activeTab === s.id ? 700 : 500, fontSize: 13,
                    cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
            {/* Preview pane */}
            <div style={{ flex: 1, padding: "24px 20px", minWidth: 0 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#FFF8EC", marginBottom: 4 }}>{active?.label}</div>
                <div style={{ fontSize: 12, color: "rgba(255,248,236,0.5)", lineHeight: 1.55 }}>{active?.desc}</div>
              </div>
              <div style={{ background: "#FFFCF5", borderRadius: 14, padding: "16px", border: "1px solid rgba(196,122,46,0.12)" }}>
                {active?.preview}
              </div>
            </div>
          </div>

          {/* CTA inside dashboard tour */}
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button
              onClick={() => navigate("/vendor/register")}
              style={{ padding: "14px 36px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 800, fontFamily: font, cursor: "pointer", boxShadow: "0 6px 22px rgba(196,122,46,0.4)" }}
            >
              Get My Dashboard →
            </button>
            <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,248,236,0.3)" }}>Free · No credit card · Live in 24h</div>
          </div>
        </div>
      </div>

      {/* Testimonial / trust strip */}
      <div style={{ background: "#F9F6F1", padding: "36px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap", marginBottom: 20 }}>
            {[{ n: "100+", l: "Verified vendors" }, { n: "500+", l: "Events planned" }, { n: "₹0", l: "Commission" }, { n: "24h", l: "Approval" }].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: serif, fontSize: "1.6rem", fontWeight: 600, color: "#C47A2E", lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9B7450", marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/vendor/register")}
            style={{ padding: "12px 30px", borderRadius: 10, border: "none", background: "#C47A2E", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: font, cursor: "pointer" }}
          >
            Join as a Vendor →
          </button>
        </div>
      </div>
    </div>
  );
}
