import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import tendrLogo from "../../assets/logos/tendr-logo-secondary.png";

const font = "'Outfit', sans-serif";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#FFF8F2 0%,#F5E6CC 100%)", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>

      {/* Logo */}
      <motion.img
        src={tendrLogo} alt="Tendr"
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ height: 40, objectFit: "contain", marginBottom: 40, cursor: "pointer" }}
        onClick={() => navigate("/")}
      />

      {/* 404 number */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
        style={{ fontSize: "clamp(6rem,20vw,10rem)", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}
      >
        404
      </motion.div>

      {/* Emoji */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ fontSize: 48, marginBottom: 20 }}>
        🎉
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
        style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, color: "#2C1A0E", letterSpacing: "-0.02em", margin: "0 0 12px" }}
      >
        Oops — this page wandered off
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        style={{ fontSize: 16, color: "#9B7450", maxWidth: 420, lineHeight: 1.7, margin: "0 auto 36px" }}
      >
        The page you're looking for doesn't exist. It may have been moved, deleted, or the link might be wrong.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
        style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}
      >
        <button
          onClick={() => navigate("/")}
          style={{ padding: "13px 32px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: font, cursor: "pointer", boxShadow: "0 4px 16px rgba(196,122,46,0.35)" }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          ← Back to Home
        </button>

        <a
          href="https://wa.me/919211668427?text=Hi%20Tendr%20team%2C%20I%20ran%20into%20a%20404%20error%20and%20need%20some%20help."
          target="_blank" rel="noopener noreferrer"
          style={{ padding: "13px 32px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 15, fontWeight: 700, fontFamily: font, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(196,122,46,0.06)")}
          onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
        >
          💬 Contact Support
        </a>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
        style={{ fontSize: 13, color: "#CCAB4A", marginTop: 36 }}
      >
        tendr.co.in · We Curate, You Celebrate
      </motion.p>
    </div>
  );
}
