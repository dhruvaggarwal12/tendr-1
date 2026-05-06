import React from "react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: "🎉",
    title: "Office Parties & Socials",
    description:
      "Instantly book verified catering, DJ, and decor vendors to turn your office floor or external venue into a high-energy celebration.",
  },
  {
    icon: "🎁",
    title: "Premium Corporate Gifting",
    description:
      "Curated, custom-branded hampers and gifts for employee appreciation and client milestones.",
  },
  {
    icon: "🎤",
    title: "Conferences & Launches",
    description:
      "End-to-end production, premium AV setups, and stage management for high-stakes brand events.",
  },
  {
    icon: "🏆",
    title: "Milestones & Gala Dinners",
    description:
      "Flawless execution for annual days, award ceremonies, and team success celebrations.",
  },
];

const Corporate = () => {
  const navigate = useNavigate();
  const font = "'Outfit', sans-serif";

  return (
    <section
      id="corporate-section"
      style={{
        background: "linear-gradient(160deg, #FFFAF3 0%, #FFF4E0 100%)",
        fontFamily: font,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          alignItems: "stretch",
          minHeight: 520,
        }}
        className="corp-split"
      >
        {/* ── Left: text + grid + CTA ── */}
        <div
          style={{
            flex: "0 0 52%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "72px 56px 72px 48px",
          }}
        >
          {/* Badge */}
          <span
            style={{
              display: "inline-block",
              width: "fit-content",
              background: "rgba(196,122,46,0.12)",
              color: "#C47A2E",
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              padding: "5px 14px",
              borderRadius: 100,
              marginBottom: 20,
            }}
          >
            Professional Services
          </span>

          {/* Headline */}
          <h2
            style={{
              fontSize: "clamp(2rem, 2.7vw, 3rem)",
              fontWeight: 800,
              color: "#1E110A",
              lineHeight: 1.18,
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            Your All-in-One{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #C47A2E, #DEB887)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Corporate Event
            </span>{" "}
            Network
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: 17,
              fontWeight: 400,
              color: "#6B4A2A",
              lineHeight: 1.7,
              marginBottom: 36,
              maxWidth: 500,
            }}
          >
            We handle the heavy lifting — connecting you with Delhi NCR's
            top-tier vendors so your team focuses on what matters. From intimate
            office socials to large-scale galas, we've got it covered.
          </p>

          {/* 2×2 Feature grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 40,
            }}
          >
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  background: "#fff",
                  border: "1px solid rgba(196,122,46,0.14)",
                  borderRadius: 18,
                  padding: "22px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  boxShadow: "0 2px 12px rgba(139,69,19,0.06)",
                  transition: "box-shadow 0.2s, transform 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(139,69,19,0.12)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(139,69,19,0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background:
                      "linear-gradient(135deg, rgba(196,122,46,0.15), rgba(222,184,135,0.2))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  {f.icon}
                </div>
                <h4
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#1E110A",
                    margin: 0,
                    lineHeight: 1.3,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {f.title}
                </h4>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 400,
                    color: "#7A5535",
                    margin: 0,
                    lineHeight: 1.55,
                  }}
                >
                  {f.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div>
            <button
              onClick={() => navigate("/corporate")}
              style={{
                background: "linear-gradient(135deg, #C47A2E 0%, #DEB887 100%)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "0.03em",
                padding: "13px 32px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 18px rgba(196,122,46,0.35)",
                transition: "transform 0.2s, box-shadow 0.2s",
                fontFamily: font,
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 26px rgba(196,122,46,0.48)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 18px rgba(196,122,46,0.35)";
              }}
            >
              Book Corporate Services
            </button>
          </div>
        </div>

        {/* ── Right: contained image ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px 32px 32px 16px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 720,
              height: 600,
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 20px 56px rgba(139,69,19,0.16), 0 4px 16px rgba(0,0,0,0.08)",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1529543544282-ea669407fca3?auto=format&fit=crop&w=900&q=85"
              alt="Office party"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .corp-split {
            flex-direction: column !important;
            min-height: unset !important;
          }
          .corp-split > div:first-child {
            flex: unset !important;
            padding: 48px 28px !important;
          }
          .corp-split > div:last-child {
            flex: unset !important;
            width: 100% !important;
            min-height: 380px !important;
          }
        }
        @media (max-width: 560px) {
          .corp-split > div:first-child > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Corporate;
