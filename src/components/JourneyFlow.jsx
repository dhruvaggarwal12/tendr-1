import React, { useState } from "react";
import { motion } from "framer-motion";

const steps = [
  {
    title: "Photography",
    description: "Capture timeless memories with our curated photographers.",
    image:
      "https://images.unsplash.com/photo-1747319820357-3f37244a3b27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    title: "Entertainment",
    description:
      "Keep the celebration alive with top-tier artists and entertainers.",
    image:
      "https://images.unsplash.com/photo-1729553199933-c897fea4f41f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    title: "Decor",
    description:
      "Transform your venue with stunning decor themes and elegance.",
    image:
      "https://images.unsplash.com/photo-1532276865658-80462d4b71cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
  {
    title: "Catering",
    description: "Delight your guests with premium cuisines and curated menus.",
    image:
      "https://images.unsplash.com/photo-1751651054934-3fbdf1d54d8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  },
];

const CARD_W = 340;
const CARD_H = 420;
const SIDE_OFFSET = 390;

const JourneyFlow = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () =>
    setActiveIndex((i) => (i - 1 + steps.length) % steps.length);
  const next = () => setActiveIndex((i) => (i + 1) % steps.length);

  return (
    <div
      style={{
        background: "#FFF8F0",
        padding: "72px 0 44px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Section heading */}
      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#C47A2E",
          marginBottom: 10,
        }}
      >
        Our Services
      </p>
      <h2
        style={{
          fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
          fontWeight: 800,
          color: "#2C1A0E",
          letterSpacing: "-0.02em",
          marginBottom: 56,
          textAlign: "center",
        }}
      >
        Top Rated Vendors
      </h2>

      {/* Carousel */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          width: "100%",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Left Arrow */}
        <button
          onClick={prev}
          style={{
            flexShrink: 0,
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "2px solid rgba(139,69,19,0.25)",
            background: "#fff",
            color: "#6B3A1F",
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            boxShadow: "0 2px 10px rgba(139,69,19,0.1)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#C47A2E";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = "#C47A2E";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.color = "#6B3A1F";
            e.currentTarget.style.borderColor = "rgba(139,69,19,0.25)";
          }}
        >
          ‹
        </button>

        {/* Cards track */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 900,
            height: CARD_H + 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {steps.map((step, idx) => {
            const offset = (idx - activeIndex + steps.length) % steps.length;
            const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

            let scale = 0.75;
            let opacity = 0;
            let zIndex = 0;
            let xPos = 0;

            if (isMobile) {
              if (offset === 0) { scale = 1; opacity = 1; zIndex = 10; xPos = 0; }
              else { opacity = 0; scale = 0.6; }
            } else {
              if (offset === 0) {
                scale = 1; opacity = 1; zIndex = 10; xPos = 0;
              } else if (offset === 1 || offset === steps.length - 1) {
                scale = 0.82;
                opacity = 0.65;
                zIndex = 5;
                xPos = offset === 1 ? SIDE_OFFSET : -SIDE_OFFSET;
              }
            }

            return (
              <motion.div
                key={idx}
                animate={{ opacity, scale, x: xPos }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                style={{
                  position: "absolute",
                  width: CARD_W,
                  height: CARD_H,
                  borderRadius: 24,
                  overflow: "hidden",
                  zIndex,
                  boxShadow:
                    offset === 0
                      ? "0 20px 56px rgba(0,0,0,0.22)"
                      : "0 8px 24px rgba(0,0,0,0.12)",
                  cursor: offset !== 0 ? "pointer" : "default",
                }}
                onClick={() => offset !== 0 && setActiveIndex(idx)}
              >
                {/* Background image */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${step.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: offset === 0 ? "none" : "brightness(0.7)",
                    transition: "filter 0.4s",
                  }}
                />

                {/* Bottom gradient for text legibility */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(10,5,0,0.82) 0%, rgba(10,5,0,0.3) 45%, transparent 75%)",
                  }}
                />

                {/* Text */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "28px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {/* Category pill */}
                  <span
                    style={{
                      display: "inline-block",
                      width: "fit-content",
                      background: "rgba(196,122,46,0.85)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      borderRadius: 100,
                      marginBottom: 4,
                    }}
                  >
                    {step.title}
                  </span>

                  <h3
                    style={{
                      color: "#ffffff",
                      fontSize: 22,
                      fontWeight: 800,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.2,
                      margin: 0,
                      textShadow: "0 1px 6px rgba(0,0,0,0.5)",
                    }}
                  >
                    {step.title}
                  </h3>

                  <p
                    style={{
                      color: "rgba(255,255,255,0.88)",
                      fontSize: 14,
                      fontWeight: 400,
                      lineHeight: 1.55,
                      margin: 0,
                      textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                    }}
                  >
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          onClick={next}
          style={{
            flexShrink: 0,
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "2px solid rgba(139,69,19,0.25)",
            background: "#fff",
            color: "#6B3A1F",
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            boxShadow: "0 2px 10px rgba(139,69,19,0.1)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#C47A2E";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = "#C47A2E";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.color = "#6B3A1F";
            e.currentTarget.style.borderColor = "rgba(139,69,19,0.25)";
          }}
        >
          ›
        </button>
      </div>

      {/* Dot indicators */}
      <div style={{ display: "flex", gap: 8, marginTop: 36 }}>
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            style={{
              width: i === activeIndex ? 24 : 8,
              height: 8,
              borderRadius: 4,
              border: "none",
              background: i === activeIndex ? "#C47A2E" : "rgba(139,69,19,0.2)",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default JourneyFlow;
