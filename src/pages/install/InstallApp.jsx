import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import tendrLogo from "../../assets/logos/tendr-logo-secondary.png";

const font = "'Outfit', sans-serif";
const APP_URL = "https://tendr-1.vercel.app";

const DEVICES = [
  {
    id: "ios",
    icon: "🍎",
    label: "iPhone / iPad",
    desc: "Safari browser required",
    color: "#1D1D1F",
    steps: [
      { num: 1, icon: "🌐", text: "Open Safari and go to", highlight: APP_URL },
      { num: 2, icon: "⬆️", text: 'Tap the Share button at the bottom (the square with an arrow)' },
      { num: 3, icon: "📱", text: 'Scroll down and tap "Add to Home Screen"' },
      { num: 4, icon: "✅", text: 'Tap "Add" in the top-right corner — done!' },
    ],
    note: "⚠️ Only works in Safari — not Chrome or Firefox on iPhone",
  },
  {
    id: "android",
    icon: "🤖",
    label: "Android",
    desc: "Chrome browser",
    color: "#34A853",
    steps: [
      { num: 1, icon: "🌐", text: "Open Chrome and go to", highlight: APP_URL },
      { num: 2, icon: "⋮",  text: 'Tap the 3-dot menu (⋮) in the top-right corner' },
      { num: 3, icon: "📲", text: 'Tap "Add to Home Screen"' },
      { num: 4, icon: "✅", text: 'Tap "Add" — Tendr appears on your home screen!' },
    ],
    note: "✨ You may also see a pop-up banner at the bottom — just tap Install",
  },
  {
    id: "desktop",
    icon: "💻",
    label: "Desktop",
    desc: "Chrome or Edge",
    color: "#4285F4",
    steps: [
      { num: 1, icon: "🌐", text: "Open Chrome or Edge and go to", highlight: APP_URL },
      { num: 2, icon: "⊕",  text: "Look for the install icon (⊕) in the address bar on the right" },
      { num: 3, icon: "🖱️", text: 'Click it and select "Install"' },
      { num: 4, icon: "✅", text: "Tendr opens as a standalone desktop app!" },
    ],
    note: "💡 If you don't see the icon, try refreshing the page once",
  },
];

export default function InstallApp() {
  const navigate = useNavigate();
  const [active, setActive] = useState("ios");
  const device = DEVICES.find(d => d.id === active);

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font, display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 14 }}>
        <img src={tendrLogo} alt="Tendr" style={{ height: 28, objectFit: "contain", cursor: "pointer" }} onClick={() => navigate("/")} />
        <div style={{ flex: 1 }} />
        <button onClick={() => navigate(-1)}
          style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
          ← Back
        </button>
      </div>

      <div style={{ flex: 1, maxWidth: 560, margin: "0 auto", padding: "40px 20px 80px", width: "100%" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>📲</div>
          <h1 style={{ fontSize: "clamp(1.6rem,5vw,2.2rem)", fontWeight: 900, color: "#2C1A0E", margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            Tendr on your phone
          </h1>
          <p style={{ fontSize: 15, color: "#9B7450", margin: "0 0 8px", lineHeight: 1.6 }}>
            Get instant notifications, chat with vendors and track your bookings — right from your home screen.
          </p>
          <p style={{ fontSize: 13, color: "#bbb", margin: 0 }}>
            No app store needed. Free. Works like a native app.
          </p>
        </div>

        {/* Benefits strip */}
        <div style={{ display: "flex", gap: 10, marginBottom: 32, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { icon: "⚡", text: "Instant notifications" },
            { icon: "💬", text: "Chat with vendors" },
            { icon: "📋", text: "Track bookings" },
            { icon: "🔒", text: "Offline access" },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid rgba(196,122,46,0.15)", borderRadius: 100, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: "#5a3a1a" }}>
              <span>{icon}</span> {text}
            </div>
          ))}
        </div>

        {/* Device tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "#fff", borderRadius: 14, padding: 6, border: "1.5px solid rgba(196,122,46,0.12)" }}>
          {DEVICES.map(d => (
            <button key={d.id} onClick={() => setActive(d.id)}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", cursor: "pointer",
                background: active === d.id ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "transparent",
                color: active === d.id ? "#fff" : "#9B7450",
                fontFamily: font, transition: "all 0.18s",
              }}>
              <div style={{ fontSize: 20, marginBottom: 2 }}>{d.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700 }}>{d.label}</div>
            </button>
          ))}
        </div>

        {/* Steps */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.15)", overflow: "hidden", boxShadow: "0 4px 24px rgba(196,122,46,0.08)", marginBottom: 16 }}>
          {/* Card header */}
          <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "16px 22px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>{device.icon}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#CCAB4A" }}>{device.label}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{device.desc}</div>
            </div>
          </div>

          {/* Steps list */}
          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
            {device.steps.map(({ num, icon, text, highlight }) => (
              <div key={num} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                {/* Step number */}
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontWeight: 900, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(196,122,46,0.3)" }}>
                  {num}
                </div>
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <span style={{ fontSize: 14, color: "#2C1A0E", lineHeight: 1.5 }}>{text}</span>
                  {highlight && (
                    <a href={highlight} target="_blank" rel="noopener noreferrer"
                      style={{ display: "block", marginTop: 4, fontSize: 13, fontWeight: 700, color: "#C47A2E", textDecoration: "none", background: "rgba(196,122,46,0.06)", border: "1px solid rgba(196,122,46,0.2)", borderRadius: 8, padding: "5px 12px", wordBreak: "break-all" }}>
                      {highlight}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          <div style={{ margin: "0 22px 22px", background: "rgba(196,122,46,0.06)", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#7A5535", lineHeight: 1.55 }}>
            {device.note}
          </div>
        </div>

        {/* Open URL button */}
        <a href={APP_URL} target="_blank" rel="noopener noreferrer"
          style={{ display: "block", width: "100%", padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 800, textAlign: "center", textDecoration: "none", boxSizing: "border-box", boxShadow: "0 4px 18px rgba(196,122,46,0.35)", marginBottom: 14 }}>
          Open Tendr in Browser →
        </a>
        <button onClick={() => navigate(-1)}
          style={{ width: "100%", padding: "12px", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#9B7450", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
          ← Go Back
        </button>

      </div>
    </div>
  );
}
