import React, { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import tendrLogo from "../assets/logos/tendr-logo-secondary.png";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaRedditAlien } from "react-icons/fa";
import { FaXTwitter, FaWhatsapp } from "react-icons/fa6";

const LAUNCH_DATE = new Date("2026-07-01T00:00:00");

function useCountdown() {
  const calc = () => {
    const diff = LAUNCH_DATE - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days:    Math.floor(diff / 86400000),
      hours:   Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000)  / 60000),
      seconds: Math.floor((diff % 60000)    / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

function CountBlock({ value, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 72 }}>
      <motion.div
        key={value}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          fontSize: "clamp(2.4rem, 6vw, 4rem)", fontWeight: 900, color: "#fff",
          lineHeight: 1, fontFamily: "'Outfit', sans-serif",
          textShadow: "0 0 30px rgba(196,122,46,0.6)",
        }}
      >
        {String(value).padStart(2, "0")}
      </motion.div>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginTop: 6, fontFamily: "'Outfit', sans-serif" }}>{label}</span>
    </div>
  );
}

function Divider() {
  return <span style={{ fontSize: "clamp(2rem,5vw,3.5rem)", color: "rgba(196,122,46,0.6)", fontWeight: 300, alignSelf: "flex-start", marginTop: 4 }}>:</span>;
}

export default function ComingSoon() {
  const { days, hours, minutes, seconds } = useCountdown();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const canvasRef = useRef(null);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4, dy: (Math.random() - 0.5) * 0.4,
      o: Math.random() * 0.5 + 0.1,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196,122,46,${p.o})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > W) p.dx *= -1;
        if (p.y < 0 || p.y > H) p.dy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const WEB3FORMS_KEY = "b6e1a881-5d38-4228-bfc4-379df27385c0";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          email,
          subject: `Tendr Waitlist — ${email} wants to be notified at launch`,
          message: `New waitlist signup: ${email}`,
        }),
      });
      const data = await res.json();
      setStatus(data.success ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  const font = "'Outfit', sans-serif";

  return (
    <>
    <Helmet>
      <title>Tendr — Birthday Decoration & Event Vendors in Delhi NCR | Coming Soon</title>
      <meta name="description" content="Tendr is launching soon — Delhi NCR's platform to discover and book verified birthday decorators, party planners, caterers, photographers and DJs. Register your interest." />
      <meta name="robots" content="noindex, follow" />
      <link rel="canonical" href="https://tendr.co.in/" />
    </Helmet>
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0d0805 0%, #1a0e06 40%, #0f0b06 100%)", position: "relative", overflow: "hidden", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>

      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />

      {/* Glow blobs */}
      <div style={{ position: "fixed", top: "10%", left: "5%",  width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(196,122,46,0.18) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "5%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(204,171,74,0.12) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 680, width: "100%", textAlign: "center" }}>

        {/* Badge */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <span style={{ display: "inline-block", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", padding: "6px 18px", borderRadius: 100, marginBottom: 28 }}>
            We're Getting Ready
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
          style={{ fontSize: "clamp(2.6rem, 7vw, 5rem)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 28px" }}
        >
          Coming Soon
        </motion.h1>

        {/* Logo */}
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.25 }} style={{ marginBottom: 28, display: "flex", justifyContent: "center" }}>
          <img src={tendrLogo} alt="Tendr" style={{ height: 52, objectFit: "contain", filter: "brightness(1.15)" }} />
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }}
          style={{ fontSize: "clamp(14px,2.2vw,17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.75, margin: "0 auto 48px", maxWidth: 540 }}
        >
          Tendr is your all-in-one celebration planning platform to discover, organise, and bring every part of your event together — from decor, cakes, gifts, and experiences to vendors, kits, and event essentials.
        </motion.p>

        {/* Waitlist form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(196,122,46,0.25)", borderRadius: 20, padding: "36px 32px", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", marginBottom: 40 }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>Get Notified at Launch</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 24px" }}>Be the first to know — and get early access.</p>

          <AnimatePresence mode="wait">
            {status === "done" ? (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#CCAB4A", margin: 0 }}>You're on the list!</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>We'll email you the moment we launch.</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <input
                  type="email" required placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ flex: 1, minWidth: 200, padding: "13px 18px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 15, fontFamily: font, outline: "none", boxSizing: "border-box" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(196,122,46,0.7)")}
                  onBlur={e  => (e.currentTarget.style.borderColor = "rgba(196,122,46,0.3)")}
                />
                <button type="submit" disabled={status === "sending"}
                  style={{ padding: "13px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: font, cursor: status === "sending" ? "not-allowed" : "pointer", whiteSpace: "nowrap", opacity: status === "sending" ? 0.7 : 1, boxShadow: "0 4px 20px rgba(196,122,46,0.4)" }}
                >
                  {status === "sending" ? "Adding…" : "Notify Me 🚀"}
                </button>
                {status === "error" && <p style={{ width: "100%", fontSize: 12, color: "#f87171", margin: "4px 0 0" }}>Something went wrong — email us at contacttendr@gmail.com</p>}
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Community section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.0 }}
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(196,122,46,0.25)", borderRadius: 20, padding: "32px 28px", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", marginBottom: 40 }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(196,122,46,0.12)", border: "1px solid rgba(196,122,46,0.25)", borderRadius: 100, padding: "4px 14px", fontSize: 11, fontWeight: 700, color: "#CCAB4A", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
            ✨ Community
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>Be Part of the Conversation</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", margin: "0 0 24px", lineHeight: 1.6 }}>
            Share stories, vote on polls, and connect with fellow celebrators — even before we launch.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {/* Tendr Community */}
            <motion.a
              href="/community"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{ flex: 1, minWidth: "min(220px, 100%)", display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderRadius: 14, background: "linear-gradient(135deg,rgba(196,122,46,0.18),rgba(204,171,74,0.1))", border: "1px solid rgba(196,122,46,0.35)", textDecoration: "none", cursor: "pointer" }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>
                💬
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 2 }}>Tendr Community</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Posts · Polls · Stories</div>
              </div>
              <span style={{ marginLeft: "auto", fontSize: 15, color: "rgba(196,122,46,0.7)" }}>→</span>
            </motion.a>

            {/* Reddit */}
            <motion.a
              href="https://reddit.com/r/tendr"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{ flex: 1, minWidth: "min(220px, 100%)", display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderRadius: 14, background: "rgba(255,69,0,0.08)", border: "1px solid rgba(255,69,0,0.22)", textDecoration: "none", cursor: "pointer" }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "#FF4500", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FaRedditAlien style={{ color: "#fff", fontSize: 20 }} />
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 2 }}>Reddit</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>r/tendr</div>
              </div>
              <span style={{ marginLeft: "auto", fontSize: 15, color: "rgba(255,69,0,0.6)" }}>→</span>
            </motion.a>
          </div>
        </motion.div>

        {/* Social links */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 28 }}>
          {[
            { Icon: FaInstagram, href: "https://www.instagram.com/justtendrit?igsh=ZzlxcDhqOXo0dzVu&utm_source=qr" },
            { Icon: FaFacebookF, href: "https://www.facebook.com/share/1RENaQTgyj/?mibextid=wwXIfr" },
            { Icon: FaWhatsapp,  href: "https://wa.me/919211668427" },
            { Icon: FaXTwitter,  href: "https://x.com/tendr293418?s=21" },
            { Icon: FaLinkedinIn,href: "https://www.linkedin.com/company/justtendrit/" },
          ].map(({ Icon, href }, i) => (
            <motion.a key={i} href={href} target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.2, y: -3 }} whileTap={{ scale: 0.95 }}
              style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(196,122,46,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", fontSize: 15, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#CCAB4A")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >
              <Icon />
            </motion.a>
          ))}
        </motion.div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>© 2026 Tendr · contacttendr@gmail.com</p>
      </div>
    </div>
    </>
  );
}
