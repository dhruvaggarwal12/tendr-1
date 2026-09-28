// JoinRoom — mobile-first universal party join page
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit',sans-serif";
const accent = "#9B7DFF";
const accentDark = "#7C5FE6";

const HUB_PATH = {
  "birthday":         "/birthday-hub",
  "first-birthday":   "/first-birthday-hub",
  "anniversary":      "/anniversary-hub",
  "baby-shower":      "/baby-shower-hub",
  "newborn-welcome":  "/newborn-welcome-hub",
  "gender-reveal":    "/gender-reveal-hub",
  "housewarming":     "/housewarming-hub",
  "get-together":     "/get-together-hub",
  "naming-ceremony":  "/naming-ceremony-hub",
  "kitty-party":      "/kitty-party-hub",
  "office-party":     "/office-party-hub",
  "graduation":       "/graduation-hub",
  "wedding":          "/wedding-hub",
  "bachelorette":     "/bachelorette-hub",
  "farewell":         "/farewell-hub",
  "retirement":       "/retirement-hub",
  "diwali-party":     "/diwali-party-hub",
  "holi-party":       "/holi-party-hub",
  "navratri-garba":   "/navratri-garba-hub",
};

const INTRO_STEPS = [
  { icon: "🎮", text: "Host picks a game and everyone plays live together" },
  { icon: "👥", text: "Your name appears for all players in the room" },
  { icon: "🏆", text: "Earn points across rounds — leaderboard updates live" },
  { icon: "📱", text: "Keep this screen open — the party runs right here" },
];

export default function JoinRoom() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const nameRef = useRef(null);

  const [code, setCode] = useState((params.get("code") || "").toUpperCase().slice(0, 6));
  const [name, setName] = useState("");
  const [phase, setPhase] = useState(
    (params.get("code") || "").length >= 6 ? "intro" : "enter"
  );
  const [error, setError] = useState("");

  const getSocket = () => {
    if (!socketRef.current) {
      socketRef.current = io(`${BASE_URL}/party`, {
        transports: ["websocket", "polling"],
        autoConnect: true,
      });
    }
    return socketRef.current;
  };

  useEffect(() => {
    if (code.length === 6 && phase === "enter") setPhase("intro");
    if (code.length < 6 && phase === "intro") setPhase("enter");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Focus name when intro shows
  useEffect(() => {
    if (phase === "intro") {
      const t = setTimeout(() => nameRef.current?.focus(), 320);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    return () => { socketRef.current?.disconnect(); socketRef.current = null; };
  }, []);

  const handleJoin = () => {
    if (!code.trim() || !name.trim()) return;
    setPhase("joining");
    setError("");
    const s = getSocket();
    const timer = setTimeout(() => {
      setPhase("error");
      setError("Connection timed out. Check your internet and try again.");
    }, 15000);
    s.emit("party:join", { code: code.trim(), name: name.trim() }, (res) => {
      clearTimeout(timer);
      if (!res.ok) {
        setPhase("error");
        setError(res.error || "Room not found. Check the code and try again.");
        return;
      }
      const hubPath = HUB_PATH[res.room?.occasionType] || "/birthday-hub";
      s.disconnect();
      navigate(`${hubPath}?room=${code.trim()}&name=${encodeURIComponent(name.trim())}`);
    });
  };

  const canJoin = code.length === 6 && name.trim().length > 0;

  return (
    <>
      <style>{`
        @keyframes jr-fade { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes jr-spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes jr-pulse { 0%,100% { opacity:0.5; transform:scale(0.95); } 50% { opacity:1; transform:scale(1.05); } }
        .jr-btn { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        .jr-inp { -webkit-appearance: none; appearance: none; }
        .jr-code-inp { font-variant-numeric: tabular-nums; }
        /* Prevent iOS bounce while keeping scroll */
        html, body { overscroll-behavior-y: none; }
      `}</style>

      {/* Full-screen scrollable root — never justify-center (breaks when keyboard opens) */}
      <div style={{
        minHeight: "100dvh",
        background: "linear-gradient(160deg,#0D0820 0%,#110B2E 55%,#0A0618 100%)",
        display: "flex",
        flexDirection: "column",
        fontFamily: font,
        /* Safe areas: notch + home bar */
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        position: "relative",
        overflowX: "hidden",
      }}>

        {/* Ambient glow blobs */}
        <div style={{ position:"absolute", top:-120, left:-80, width:320, height:320, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(155,125,255,0.18) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:-60, right:-60, width:240, height:240, borderRadius:"50%", background:"radial-gradient(ellipse,rgba(124,95,230,0.14) 0%,transparent 70%)", pointerEvents:"none" }} />

        {/* ── Sticky top bar ── */}
        <div style={{ position:"sticky", top:0, zIndex:10, display:"flex", alignItems:"center", padding:"14px 20px 12px", background:"rgba(13,8,32,0.70)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <button
            className="jr-btn"
            onClick={() => navigate("/")}
            style={{ width:36, height:36, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.70)", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}
          >←</button>
          <div style={{ flex:1, textAlign:"center" }}>
            <div style={{ fontSize:13, fontWeight:800, color:"rgba(255,255,255,0.90)", letterSpacing:"0.22em", textTransform:"uppercase" }}>tendr</div>
          </div>
          <div style={{ width:36 }} />
        </div>

        {/* ── Scrollable content ── */}
        <div style={{ flex:1, overflowY:"auto", overflowX:"hidden", WebkitOverflowScrolling:"touch", scrollbarWidth:"none" }}>
          <div style={{ maxWidth:440, margin:"0 auto", padding:"28px 20px 120px" }}>

            {/* ── ENTER / INTRO phase ── */}
            {(phase === "enter" || phase === "intro") && (
              <div style={{ animation:"jr-fade 0.32s cubic-bezier(0.22,1,0.36,1)" }}>

                {/* Header */}
                <div style={{ textAlign:"center", marginBottom:32 }}>
                  <div style={{ fontSize:52, marginBottom:14, lineHeight:1 }}>
                    {phase === "intro" ? "🎉" : "🔑"}
                  </div>
                  <h1 style={{ fontSize:26, fontWeight:800, color:"#FFFFFF", margin:"0 0 8px", letterSpacing:"-0.01em" }}>
                    {phase === "intro" ? "You're invited!" : "Join a Party"}
                  </h1>
                  <p style={{ fontSize:15, color:"rgba(255,255,255,0.45)", margin:0, lineHeight:1.55 }}>
                    {phase === "intro"
                      ? "Enter your name below to step into the room."
                      : "Ask the host for a 6-letter code and enter it here."}
                  </p>
                </div>

                {/* Code input */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.40)", textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:8 }}>
                    Room Code
                  </label>
                  <input
                    className="jr-inp jr-code-inp"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
                    placeholder="ABC123"
                    maxLength={6}
                    type="text"
                    inputMode="text"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    autoComplete="off"
                    spellCheck={false}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "16px 20px",
                      borderRadius: 16,
                      border: `2px solid ${code.length === 6 ? accent + "90" : "rgba(255,255,255,0.14)"}`,
                      background: "rgba(255,255,255,0.06)",
                      color: "#FFFFFF",
                      /* 24px but iOS won't zoom because it's already > 16px */
                      fontSize: 24,
                      fontWeight: 800,
                      textAlign: "center",
                      letterSpacing: "0.3em",
                      outline: "none",
                      fontFamily: font,
                      transition: "border-color 0.2s, box-shadow 0.2s",
                      WebkitTextFillColor: "#FFFFFF",
                      caretColor: accent,
                      /* Prevent zoom on focus in older iOS */
                      WebkitUserSelect: "text",
                      boxShadow: code.length === 6 ? `0 0 0 4px ${accent}20` : "none",
                    }}
                  />
                  {code.length > 0 && code.length < 6 && (
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.30)", marginTop:6, textAlign:"center" }}>
                      {6 - code.length} more character{6 - code.length !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>

                {/* Name input — slides in when code is complete */}
                <div style={{
                  overflow: "hidden",
                  maxHeight: phase === "intro" ? 120 : 0,
                  opacity: phase === "intro" ? 1 : 0,
                  transition: "max-height 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.28s ease",
                  marginBottom: phase === "intro" ? 16 : 0,
                }}>
                  <label style={{ display:"block", fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.40)", textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:8 }}>
                    Your Name
                  </label>
                  <input
                    ref={nameRef}
                    className="jr-inp"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && canJoin && handleJoin()}
                    placeholder="What should we call you?"
                    type="text"
                    inputMode="text"
                    autoComplete="given-name"
                    autoCorrect="off"
                    spellCheck={false}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "16px 18px",
                      borderRadius: 14,
                      border: `2px solid ${name.trim() ? accent + "60" : "rgba(255,255,255,0.14)"}`,
                      background: "rgba(255,255,255,0.06)",
                      color: "#FFFFFF",
                      fontSize: 17,
                      outline: "none",
                      fontFamily: font,
                      caretColor: accent,
                      WebkitTextFillColor: "#FFFFFF",
                      transition: "border-color 0.18s",
                    }}
                  />
                </div>

                {/* What to expect — shows when intro */}
                {phase === "intro" && (
                  <div style={{ background:"rgba(155,125,255,0.08)", border:"1px solid rgba(155,125,255,0.20)", borderRadius:18, padding:"18px 18px", marginBottom:16 }}>
                    <div style={{ fontSize:10, fontWeight:800, color:accent, textTransform:"uppercase", letterSpacing:"0.18em", marginBottom:12 }}>What to expect</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
                      {INTRO_STEPS.map(({ icon, text }) => (
                        <div key={text} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                          <div style={{ width:32, height:32, borderRadius:10, background:"rgba(155,125,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, flexShrink:0 }}>{icon}</div>
                          <span style={{ fontSize:13, color:"rgba(255,255,255,0.58)", lineHeight:1.5, paddingTop:7 }}>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── JOINING phase ── */}
            {phase === "joining" && (
              <div style={{ textAlign:"center", paddingTop:48, animation:"jr-fade 0.28s ease" }}>
                <div style={{ fontSize:56, marginBottom:20, display:"inline-block", animation:"jr-spin 1.4s linear infinite" }}>🎊</div>
                <div style={{ fontSize:22, fontWeight:800, color:"#FFFFFF", marginBottom:8 }}>Stepping in…</div>
                <div style={{ fontSize:14, color:"rgba(255,255,255,0.40)", lineHeight:1.6 }}>Connecting you to the party room</div>
                <div style={{ display:"flex", justifyContent:"center", gap:6, marginTop:24 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:accent, animation:`jr-pulse 1.4s ease infinite`, animationDelay:`${i*0.22}s` }} />
                  ))}
                </div>
              </div>
            )}

            {/* ── ERROR phase ── */}
            {phase === "error" && (
              <div style={{ textAlign:"center", paddingTop:48, animation:"jr-fade 0.28s ease" }}>
                <div style={{ fontSize:52, marginBottom:16 }}>😕</div>
                <div style={{ fontSize:22, fontWeight:800, color:"#FFFFFF", marginBottom:10 }}>Couldn't join</div>
                <div style={{ fontSize:14, color:"rgba(255,255,255,0.45)", marginBottom:32, lineHeight:1.6, maxWidth:300, margin:"0 auto 32px" }}>{error}</div>
                <button
                  className="jr-btn"
                  onClick={() => { setPhase("enter"); setCode(""); setName(""); setError(""); }}
                  style={{ padding:"14px 32px", borderRadius:14, border:`1.5px solid ${accent}55`, background:`${accent}15`, color:accent, fontSize:15, fontWeight:700, cursor:"pointer", minHeight:48 }}
                >Try Again</button>
              </div>
            )}
          </div>
        </div>

        {/* ── Sticky CTA footer — stays above keyboard on iOS ── */}
        {(phase === "enter" || phase === "intro") && (
          <div style={{
            position: "sticky",
            bottom: 0,
            left: 0, right: 0,
            padding: "12px 20px",
            paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
            background: "rgba(13,8,32,0.90)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            zIndex: 10,
          }}>
            <button
              className="jr-btn"
              onClick={canJoin ? handleJoin : undefined}
              disabled={!canJoin}
              style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: 16,
                border: "none",
                background: canJoin
                  ? `linear-gradient(135deg,${accent} 0%,${accentDark} 100%)`
                  : "rgba(255,255,255,0.08)",
                color: canJoin ? "#FFFFFF" : "rgba(255,255,255,0.25)",
                fontSize: 16,
                fontWeight: 800,
                cursor: canJoin ? "pointer" : "default",
                transition: "all 0.22s",
                boxShadow: canJoin ? `0 6px 28px ${accent}50` : "none",
                minHeight: 52,
                letterSpacing: "0.01em",
              }}
            >
              {phase === "enter" ? "Enter Code to Continue" : canJoin ? "Join Party →" : "Enter your name above"}
            </button>
            <div style={{ textAlign:"center", marginTop:10, fontSize:12, color:"rgba(255,255,255,0.22)" }}>
              Don't have a code?{" "}
              <span
                className="jr-btn"
                onClick={() => navigate("/")}
                style={{ color:accent, cursor:"pointer", fontWeight:600, WebkitTapHighlightColor:"transparent" }}
              >Explore occasions</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
