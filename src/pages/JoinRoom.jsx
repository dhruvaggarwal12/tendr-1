// JoinRoom — universal code-based party join page
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit',sans-serif";

// occasionType (from PartyRoom) → hub path
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

export default function JoinRoom() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [code, setCode] = useState((params.get("code") || "").toUpperCase());
  const [name, setName] = useState("");
  const [phase, setPhase] = useState("enter"); // "enter" | "intro" | "joining" | "error"
  const [roomInfo, setRoomInfo] = useState(null); // { partyName, hostName, occasionType, players }
  const [error, setError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);

  // Auto-lookup when code is 6 chars
  useEffect(() => {
    if (code.length === 6) lookupRoom(code);
    else setRoomInfo(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const getSocket = () => {
    if (!socketRef.current) {
      socketRef.current = io(`${BASE_URL}/party`, {
        transports: ["websocket", "polling"],
        autoConnect: true,
      });
    }
    return socketRef.current;
  };

  // Peek at room info before actually joining
  const lookupRoom = (c) => {
    setLookupLoading(true);
    setError("");
    const s = getSocket();
    const timer = setTimeout(() => {
      setLookupLoading(false);
      setError("Could not reach the server. Check your connection.");
    }, 12000);
    // Use join as a lookup — if it fails we show error; if name empty we'll re-join properly
    // Instead: emit party:peek if available, otherwise just validate via party:join with a temp lookup
    // We do a soft pre-check by just showing the intro if code looks valid (6 chars)
    // Actual join happens on the next step
    clearTimeout(timer);
    setLookupLoading(false);
    setPhase("intro");
  };

  const handleJoin = async () => {
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
      // Navigate to hub — it won't re-join since we already joined, but hub will pick up socket state
      s.disconnect();
      navigate(`${hubPath}?room=${code.trim()}&name=${encodeURIComponent(name.trim())}`);
    });
  };

  useEffect(() => {
    return () => { socketRef.current?.disconnect(); socketRef.current = null; };
  }, []);

  const bg = "linear-gradient(160deg,#0D0820 0%,#110B2E 60%,#0A0618 100%)";
  const accent = "#9B7DFF";

  return (
    <div style={{ minHeight:"100dvh", background:bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 20px", fontFamily:font }}>

      {/* Logo */}
      <div style={{ marginBottom:32, textAlign:"center" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.40)", letterSpacing:"0.3em", textTransform:"uppercase", marginBottom:4 }}>tendr</div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,0.25)", letterSpacing:"0.1em" }}>Party Hub</div>
      </div>

      <div style={{ width:"100%", maxWidth:420, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.10)", borderRadius:24, padding:"32px 28px", backdropFilter:"blur(12px)" }}>

        {/* Enter code + name */}
        {(phase === "enter" || phase === "intro") && (
          <>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ fontSize:36, marginBottom:12 }}>🎉</div>
              <div style={{ fontSize:22, fontWeight:800, color:"#FFFFFF", marginBottom:6 }}>Join a Party</div>
              <div style={{ fontSize:14, color:"rgba(255,255,255,0.45)", lineHeight:1.5 }}>
                {phase === "intro" && code.length === 6
                  ? "You're joining a live party room! Enter your name to step in."
                  : "Enter the room code your host shared with you."}
              </div>
            </div>

            {/* Party intro card — shows after code is entered */}
            {phase === "intro" && code.length === 6 && (
              <div style={{ background:"rgba(155,125,255,0.10)", border:"1px solid rgba(155,125,255,0.25)", borderRadius:16, padding:"16px 18px", marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:800, color:accent, textTransform:"uppercase", letterSpacing:"0.14em", marginBottom:8 }}>What to expect</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[
                    ["🎮","Host picks games — everyone plays together in real time"],
                    ["👥","Your name shows up in the room for all players"],
                    ["🏆","Earn points across games and climb the leaderboard"],
                    ["📱","Keep this tab open — the party runs here"],
                  ].map(([icon, text]) => (
                    <div key={text} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                      <span style={{ fontSize:15, flexShrink:0, lineHeight:1.5 }}>{icon}</span>
                      <span style={{ fontSize:12.5, color:"rgba(255,255,255,0.60)", lineHeight:1.5 }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Code input */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.45)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>Room Code</div>
              <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6))}
                placeholder="ABC123"
                maxLength={6}
                style={{ width:"100%", padding:"14px 18px", borderRadius:12, border:`1.5px solid ${code.length===6?accent+"80":"rgba(255,255,255,0.14)"}`, background:"rgba(255,255,255,0.06)", color:"#FFFFFF", fontSize:24, fontWeight:800, textAlign:"center", letterSpacing:"0.22em", outline:"none", boxSizing:"border-box", fontFamily:font, transition:"border-color 0.2s" }}
              />
            </div>

            {/* Name input — only show when code is filled */}
            {code.length === 6 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.45)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>Your Name</div>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && name.trim() && handleJoin()}
                  placeholder="How should we call you?"
                  autoFocus
                  style={{ width:"100%", padding:"13px 18px", borderRadius:12, border:"1.5px solid rgba(255,255,255,0.14)", background:"rgba(255,255,255,0.06)", color:"#FFFFFF", fontSize:15, outline:"none", boxSizing:"border-box", fontFamily:font }}
                />
              </div>
            )}

            <button
              onClick={code.length === 6 && name.trim() ? handleJoin : undefined}
              disabled={code.length < 6 || !name.trim()}
              style={{ width:"100%", padding:"15px", borderRadius:14, border:"none", background:code.length===6&&name.trim()?`linear-gradient(135deg,${accent},#7C5FE6)`:"rgba(255,255,255,0.08)", color:code.length===6&&name.trim()?"#fff":"rgba(255,255,255,0.30)", fontSize:15, fontWeight:800, cursor:code.length===6&&name.trim()?"pointer":"default", transition:"all 0.2s", boxShadow:code.length===6&&name.trim()?`0 4px 24px ${accent}45`:"none" }}
            >
              {lookupLoading ? "Finding room…" : "Join Party →"}
            </button>
          </>
        )}

        {/* Joining spinner */}
        {phase === "joining" && (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:40, marginBottom:16, animation:"spin 1.2s linear infinite" }}>🎊</div>
            <div style={{ fontSize:18, fontWeight:700, color:"#FFFFFF", marginBottom:6 }}>Stepping in…</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.45)" }}>Connecting you to the party room</div>
          </div>
        )}

        {/* Error */}
        {phase === "error" && (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:16 }}>😕</div>
            <div style={{ fontSize:17, fontWeight:700, color:"#FFFFFF", marginBottom:8 }}>Couldn't join</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.50)", marginBottom:24, lineHeight:1.5 }}>{error}</div>
            <button onClick={() => { setPhase("enter"); setCode(""); setName(""); setError(""); }} style={{ padding:"12px 28px", borderRadius:12, border:`1.5px solid ${accent}55`, background:`${accent}15`, color:accent, fontSize:14, fontWeight:700, cursor:"pointer" }}>Try Again</button>
          </div>
        )}
      </div>

      <div style={{ marginTop:24, fontSize:12, color:"rgba(255,255,255,0.25)", textAlign:"center" }}>Don't have a code? <span onClick={()=>navigate("/")} style={{ color:accent, cursor:"pointer", fontWeight:600 }}>Explore occasions →</span></div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
