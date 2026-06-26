import React, { useEffect, useRef, useState } from "react";
import SEO from "../../components/SEO";
import tendrLogo from "../../assets/logos/tendr-logo-secondary.png";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import HamburgerNav from "../../components/HamburgerNav";

const font = "'Outfit', sans-serif";

const STATS = [
  { value: "5,000+", label: "Events by Our Vendors" },
  { value: "Delhi NCR", label: "Where We Operate", noCount: true },
  { value: "Hand-Picked", label: "Every Vendor, Verified by Us", noCount: true },
  { value: "You First", label: "Always", noCount: true },
];

const VALUES = [
  {
    icon: "✦",
    title: "Trust First",
    body: "Every vendor on Tendr is manually reviewed and verified before going live. No shortcuts, no unknowns.",
  },
  {
    icon: "◈",
    title: "Quality Always",
    body: "We curate only the best — photographers, caterers, decorators, and DJs who consistently deliver exceptional experiences.",
  },
  {
    icon: "♡",
    title: "Celebrations Matter",
    body: "Behind every booking is a memory being made. We treat each event as if it were our own.",
  },
  {
    icon: "◉",
    title: "Community Driven",
    body: "We grow alongside our vendors and customers. Their success is our success — always.",
  },
];

const OFFERINGS = [
  {
    emoji: "🔍",
    title: "For Customers",
    points: [
      "Browse verified vendors by category",
      "Compare side by side before deciding",
      "Chat directly before committing",
      "Let us plan it end-to-end for you",
    ],
    accent: "#C47A2E",
    bg: "rgba(196,122,46,0.06)",
    border: "rgba(196,122,46,0.2)",
  },
  {
    emoji: "🤝",
    title: "For Vendors",
    points: [
      "Get discovered by event planners",
      "Receive verified booking requests",
      "Build your portfolio and reviews",
      "Grow without paid ads",
    ],
    accent: "#7A4A1E",
    bg: "rgba(122,74,30,0.05)",
    border: "rgba(122,74,30,0.18)",
  },
  {
    emoji: "🛠",
    title: "Planning Tools",
    points: [
      "Event checklist & timeline builder",
      "Budget allocator",
      "Digital invitation flyers",
      "Aftermovie planning",
    ],
    accent: "#4A7A1E",
    bg: "rgba(74,122,30,0.05)",
    border: "rgba(74,122,30,0.18)",
  },
];

function useCountUp(target, duration = 1800, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    const num = parseInt(target.replace(/[^0-9]/g, ""));
    if (!num) return;
    let start = 0;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);
  const suffix = target.replace(/[0-9,]/g, "");
  return count.toLocaleString("en-IN") + suffix;
}

function StatCard({ value, label, started, noCount }) {
  const counted = useCountUp(value, 1600, started && !noCount);
  const display = noCount ? value : counted;
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          fontSize: noCount ? "clamp(1.3rem, 3.5vw, 1.9rem)" : "clamp(2.2rem, 5vw, 3.2rem)",
          fontWeight: 900,
          color: "#C47A2E",
          letterSpacing: "-0.02em",
          lineHeight: 1,
          marginBottom: 8,
          fontFamily: font,
        }}
      >
        {display}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#9B7450", fontFamily: font, letterSpacing: "0.03em" }}>
        {label}
      </div>
    </div>
  );
}

export default function AboutUs() {
  const navigate = useNavigate();
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: font, background: "#FFFCF5", color: "#2C1A0E" }}>
      <SEO
        title="About Tendr — Delhi NCR's Trusted Event Planning Platform"
        description="Tendr is Delhi NCR's trusted celebration and event planning platform. We connect customers with 500+ verified caterers, DJs, photographers and decorators for birthdays, anniversaries, corporate events and more."
        path="/about-us"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "About Us", path: "/about-us" }]}
        schema={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About Tendr",
          "url": "https://tendr.co.in/about-us",
          "description": "Tendr is Delhi NCR's trusted celebration and event planning platform connecting customers with verified event vendors.",
          "mainEntity": {
            "@type": "Organization",
            "@id": "https://tendr.co.in/#organization",
            "name": "Tendr",
            "url": "https://tendr.co.in",
            "logo": { "@type": "ImageObject", "url": "https://tendr.co.in/tendr-icon.png" },
            "description": "Tendr is Delhi NCR's trusted platform for birthday decoration, balloon decoration, anniversary decoration, surprise setup, baby shower, house party planning, corporate events and more.",
            "email": "contact@tendr.co.in",
            "telephone": "+919211668427",
            "areaServed": ["Delhi", "Noida", "Gurugram", "Ghaziabad", "Faridabad", "Greater Noida"],
            "knowsAbout": ["Birthday Decoration", "Anniversary Decoration", "Balloon Decoration", "Corporate Event Planning", "Surprise Party Planning", "Baby Shower Decoration"],
            "sameAs": ["https://www.instagram.com/tendr.in"],
          },
        }}
      />

      <HamburgerNav />

      {/* ── Hero ── */}
      <section
        style={{
          background: "linear-gradient(160deg, #FFF8F2 0%, #F5E6CC 60%, #EDD5A8 100%)",
          padding: "100px 24px 80px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 320, height: 320, borderRadius: "50%", background: "rgba(204,171,74,0.08)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(196,122,46,0.07)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto" }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#C47A2E",
              marginBottom: 18,
            }}
          >
            Our Story
          </p>
          <h1
            style={{
              fontSize: "clamp(2.6rem, 6vw, 4.2rem)",
              fontWeight: 900,
              color: "#2C1A0E",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: "0 0 24px",
            }}
          >
            We Curate.<br />
            <span
              style={{
                background: "linear-gradient(135deg, #C47A2E, #CCAB4A)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              You Celebrate.
            </span>
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "#7A5535",
              lineHeight: 1.7,
              margin: "0 auto",
              maxWidth: 580,
            }}
          >
            Tendr was built for one simple reason — planning a celebration in India
            should feel exciting, not exhausting.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section
        ref={statsRef}
        style={{
          background: "#2C1A0E",
          padding: "56px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 24,
          }}
          className="about-stats-grid"
        >
          {STATS.map((s) => (
            <StatCard key={s.label} value={s.value} label={s.label} started={statsVisible} noCount={s.noCount} />
          ))}
        </div>
      </section>

      {/* ── Our Story ── */}
      <section style={{ padding: "96px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }}
          className="about-story-grid"
        >
          {/* Text */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 14 }}>
              Where We Started
            </p>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                fontWeight: 900,
                color: "#2C1A0E",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                margin: "0 0 22px",
              }}
            >
              Born from the chaos of event planning
            </h2>
            <p style={{ fontSize: 16, color: "#7A5535", lineHeight: 1.78, margin: "0 0 18px" }}>
              Anyone who has planned an event in Delhi NCR knows the drill — dozens of
              vendor calls, no-shows, inconsistent pricing, and last-minute drama. We
              lived through it ourselves, and we knew there had to be a better way.
            </p>
            <p style={{ fontSize: 16, color: "#7A5535", lineHeight: 1.78, margin: "0 0 18px" }}>
              Tendr started as a simple idea: what if finding a photographer, caterer,
              or DJ was as easy as booking a cab? One platform, verified options,
              transparent pricing, and real conversations before you commit.
            </p>
            <p style={{ fontSize: 16, color: "#7A5535", lineHeight: 1.78, margin: 0 }}>
              Today we serve customers across Delhi, Noida, Greater Noida, Ghaziabad, Gurgaon, and Faridabad
              — connecting them with the region's finest event professionals through
              technology that actually works.
            </p>
          </div>

          {/* Visual card */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                background: "linear-gradient(160deg, #FFF8F2, #F5E6CC)",
                borderRadius: 28,
                padding: "48px 40px",
                border: "1.5px solid rgba(196,122,46,0.18)",
                boxShadow: "0 20px 60px rgba(139,69,19,0.1)",
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 20 }}>🥂</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, color: "#2C1A0E", margin: "0 0 16px", letterSpacing: "-0.01em" }}>
                Our promise to you
              </h3>
              {[
                "Every vendor is manually verified",
                "Transparent pricing, no hidden fees",
                "Real support when you need it",
                "Your event, your way — always",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #C47A2E, #CCAB4A)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      color: "#fff",
                      fontWeight: 800,
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    ✓
                  </span>
                  <span style={{ fontSize: 14.5, color: "#5a3a1a", fontWeight: 500, lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
            {/* Floating badge */}
            <div
              style={{
                position: "absolute",
                bottom: -20,
                right: -20,
                background: "#2C1A0E",
                color: "#CCAB4A",
                borderRadius: 16,
                padding: "14px 20px",
                fontSize: 13,
                fontWeight: 700,
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
              }}
            >
              Delhi NCR's<br />
              <span style={{ fontSize: 11, fontWeight: 500, color: "#9B7450" }}>Curated Event Platform</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section style={{ background: "linear-gradient(160deg, #FFF8F2, #F0DFC0)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 14 }}>
            Our Mission
          </p>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              fontWeight: 900,
              color: "#2C1A0E",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              margin: "0 0 28px",
            }}
          >
            To make every celebration in India feel effortless
          </h2>
          <div
            style={{
              background: "#FFFCF5",
              borderRadius: 20,
              padding: "32px 36px",
              border: "1.5px solid rgba(196,122,46,0.18)",
              boxShadow: "0 8px 32px rgba(139,69,19,0.08)",
              textAlign: "left",
            }}
          >
            <p style={{ fontSize: 17, color: "#5a3a1a", lineHeight: 1.78, margin: "0 0 16px", fontStyle: "italic" }}>
              "We believe that every birthday, wedding, anniversary, and corporate
              gathering deserves to be planned with ease, confidence, and joy — not
              stress, uncertainty, and regret."
            </p>
            <p style={{ fontSize: 14, color: "#C47A2E", fontWeight: 700, margin: 0 }}>
              — The Tendr Team
            </p>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section style={{ padding: "96px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 14 }}>
            What We Stand For
          </p>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
              fontWeight: 900,
              color: "#2C1A0E",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Our Core Values
          </h2>
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}
          className="about-values-grid"
        >
          {VALUES.map((v, i) => (
            <div
              key={i}
              style={{
                background: "#FFFCF5",
                borderRadius: 20,
                padding: "32px 28px",
                border: "1.5px solid rgba(196,122,46,0.12)",
                boxShadow: "0 4px 20px rgba(139,69,19,0.06)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 36px rgba(139,69,19,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,69,19,0.06)";
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "linear-gradient(135deg, rgba(196,122,46,0.15), rgba(204,171,74,0.1))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  color: "#C47A2E",
                  marginBottom: 18,
                  fontWeight: 700,
                }}
              >
                {v.icon}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E", margin: "0 0 10px", letterSpacing: "-0.01em" }}>
                {v.title}
              </h3>
              <p style={{ fontSize: 14, color: "#7A5535", lineHeight: 1.65, margin: 0 }}>
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What We Offer ── */}
      <section style={{ background: "#2C1A0E", padding: "96px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CCAB4A", marginBottom: 14 }}>
              The Platform
            </p>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              Something for everyone
            </h2>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}
            className="about-offerings-grid"
          >
            {OFFERINGS.map((o, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,252,245,0.05)",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                  borderRadius: 20,
                  padding: "36px 28px",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 16 }}>{o.emoji}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: "0 0 20px", letterSpacing: "-0.01em" }}>
                  {o.title}
                </h3>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                  {o.points.map((p, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ color: "#CCAB4A", fontWeight: 700, fontSize: 13, marginTop: 1, flexShrink: 0 }}>—</span>
                      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.55 }}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cities ── */}
      <section style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 14 }}>
          Where We Operate
        </p>
        <h2
          style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)",
            fontWeight: 900,
            color: "#2C1A0E",
            letterSpacing: "-0.02em",
            margin: "0 0 16px",
          }}
        >
          Rooted in Delhi NCR
        </h2>
        <p style={{ fontSize: 16, color: "#7A5535", lineHeight: 1.7, margin: "0 auto 44px", maxWidth: 580 }}>
          We're hyper-focused on Delhi NCR because we believe doing one region exceptionally well is better than spreading thin across the country.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {["Delhi", "Noida", "Greater Noida", "Ghaziabad"].map((city) => (
            <div
              key={city}
              style={{
                background: "#FFFCF5",
                border: "1.5px solid rgba(196,122,46,0.2)",
                borderRadius: 100,
                padding: "12px 28px",
                fontSize: 15,
                fontWeight: 700,
                color: "#6B3A1F",
                boxShadow: "0 2px 12px rgba(139,69,19,0.07)",
              }}
            >
              📍 {city}
            </div>
          ))}
        </div>
        <p style={{ fontSize: 14, color: "#CCAB4A", fontWeight: 600, marginTop: 28 }}>
          Expanding across India — more cities coming soon ✦
        </p>
      </section>

      {/* ── CTA ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #2C1A0E 0%, #4A2810 100%)",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🥂</div>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.02em",
              margin: "0 0 16px",
              lineHeight: 1.2,
            }}
          >
            Ready to plan something unforgettable?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", margin: "0 0 36px", lineHeight: 1.6 }}>
            Whether it's your first event or your fiftieth, Tendr makes it simple, beautiful, and stress-free.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/booking")}
              style={{
                background: "linear-gradient(135deg, #C47A2E, #CCAB4A)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "15px 32px",
                fontSize: 16,
                fontWeight: 700,
                fontFamily: font,
                cursor: "pointer",
                boxShadow: "0 4px 18px rgba(196,122,46,0.45)",
              }}
            >
              Start Planning →
            </button>
            <button
              onClick={() => navigate("/contact-us")}
              style={{
                background: "transparent",
                color: "rgba(255,255,255,0.85)",
                border: "1.5px solid rgba(255,255,255,0.25)",
                borderRadius: 12,
                padding: "15px 32px",
                fontSize: 16,
                fontWeight: 700,
                fontFamily: font,
                cursor: "pointer",
              }}
            >
              Talk to Us
            </button>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 900px) {
          .about-story-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .about-values-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .about-offerings-grid { grid-template-columns: 1fr !important; }
          .about-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .about-values-grid { grid-template-columns: 1fr !important; }
          .about-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
