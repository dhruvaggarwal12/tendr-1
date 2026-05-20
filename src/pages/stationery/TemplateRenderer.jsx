import React from "react";

// ── Shared editable input ─────────────────────────────────────────────────────
export function EF({ value, onChange, placeholder, style = {} }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        background: "transparent", border: "none",
        borderBottom: value ? "none" : "1px dashed rgba(150,120,60,0.35)",
        outline: "none", width: "100%", textAlign: "center",
        cursor: "text", fontFamily: "inherit", fontSize: "inherit",
        fontWeight: "inherit", color: "inherit", letterSpacing: "inherit",
        ...style,
      }} />
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Div({ color = "#B8922A", sym = "✦" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: "6px 0" }}>
      <div style={{ height: "0.8px", width: 44, background: color, opacity: 0.7 }} />
      <span style={{ fontSize: 10, color, opacity: 0.8 }}>{sym}</span>
      <div style={{ height: "0.8px", width: 44, background: color, opacity: 0.7 }} />
    </div>
  );
}

// ── 1. Botanical Sage ─────────────────────────────────────────────────────────
export function BotanicalSage({ d, onChange: c, mini, ov = {} }) {
  const p = { bg: ov.bg||"#F7F2E9", g: ov.accent||"#B8922A", dk: ov.text||"#3B5048" };
  const s = mini ? 0.42 : 1;
  return (
    <div style={{ width: 420 * s, minHeight: 600 * s, background: p.bg, border: `${1.5 * s}px solid ${p.g}`, borderRadius: 3, padding: `${40 * s}px ${48 * s}px`, position: "relative", overflow: "hidden", fontFamily: "Georgia,serif", fontSize: `${13 * s}px`, transformOrigin: "top left" }}>
      <div style={{ position: "absolute", inset: `${10 * s}px`, border: `${0.6 * s}px solid rgba(184,146,42,0.28)`, borderRadius: 1, pointerEvents: "none" }} />
      {/* Watercolour blobs */}
      <div style={{ position: "absolute", top: -20 * s, left: -30 * s, width: 250 * s, height: 200 * s, borderRadius: "60% 40%", background: "radial-gradient(ellipse,rgba(110,140,100,0.18) 0%,transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -20 * s, right: -20 * s, width: 230 * s, height: 190 * s, borderRadius: "50% 60%", background: "radial-gradient(ellipse,rgba(110,140,100,0.16) 0%,transparent 68%)", pointerEvents: "none" }} />
      {/* Leaf corners */}
      <div style={{ position: "absolute", top: 0, left: 0, fontSize: 70 * s, opacity: 0.45, transform: "rotate(-25deg)", pointerEvents: "none", lineHeight: 1 }}>🌿</div>
      <div style={{ position: "absolute", bottom: 0, right: 0, fontSize: 76 * s, opacity: 0.45, transform: "rotate(155deg)", pointerEvents: "none", lineHeight: 1 }}>🌿</div>
      <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
        <p style={{ fontSize: `${9 * s}px`, letterSpacing: "0.22em", textTransform: "uppercase", color: p.dk, margin: `0 0 ${6 * s}px`, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>You are cordially invited to</p>
        <Div color={p.g} />
        <div style={{ fontSize: `${40 * s}px`, fontWeight: 700, color: p.dk, letterSpacing: "0.1em", textTransform: "uppercase", lineHeight: 0.9, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>You're</div>
        <div style={{ fontSize: `${54 * s}px`, color: p.g, fontFamily: "'Great Vibes','Dancing Script',cursive", lineHeight: 1.1 }}>Invited!</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: `${8 * s}px`, margin: `${4 * s}px 0 ${8 * s}px` }}>
          <div style={{ height: "0.8px", width: 54 * s, background: p.g, opacity: 0.7 }} />
          <span style={{ fontSize: 12 * s, color: p.dk }}>♥</span>
          <div style={{ height: "0.8px", width: 54 * s, background: p.g, opacity: 0.7 }} />
        </div>
        <EF value={d.coupleName} onChange={v => c("coupleName", v)} placeholder="Names / Event Title" style={{ fontSize: `${11 * s}px`, letterSpacing: "0.18em", textTransform: "uppercase", color: p.dk }} />
        <div style={{ height: `${14 * s}px` }} />
        {[["📅", "DATE", "date"],["🕐","TIME","time"],["📍","VENUE","venue"],["✉️","RSVP","rsvp"]].map(([ic, lb, key]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: `${8 * s}px`, marginBottom: `${9 * s}px`, textAlign: "left" }}>
            <div style={{ width: 26 * s, height: 26 * s, borderRadius: "50%", background: "rgba(184,146,42,0.1)", border: `${0.8 * s}px solid rgba(184,146,42,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: `${12 * s}px`, flexShrink: 0 }}>{ic}</div>
            <div style={{ flex: 1, borderBottom: `${0.8 * s}px dashed rgba(150,120,60,0.28)` }}>
              <span style={{ fontSize: `${8.5 * s}px`, letterSpacing: "0.14em", color: p.dk, fontFamily: "'Outfit',sans-serif", textTransform: "uppercase", fontWeight: 700 }}>{lb}: </span>
              <EF value={d[key]} onChange={v => c(key, v)} placeholder={key === "date" ? "15th June 2025" : key === "time" ? "7 PM Onwards" : key === "venue" ? "Venue & Address" : "RSVP contact"} style={{ fontSize: `${11 * s}px`, color: "#444", fontFamily: "'Outfit',sans-serif", textAlign: "left" }} />
            </div>
          </div>
        ))}
        <div style={{ marginTop: `${16 * s}px` }}>
          <div style={{ fontSize: `${18 * s}px`, fontFamily: "'Great Vibes','Dancing Script',cursive", color: "#5a4a2a" }}>We look forward to</div>
          <p style={{ fontSize: `${9 * s}px`, letterSpacing: "0.2em", textTransform: "uppercase", color: p.dk, margin: 0 }}>Celebrating with you!</p>
        </div>
        <Div color={p.g} sym="✿" />
      </div>
    </div>
  );
}

// ── 2. Royal Noir ─────────────────────────────────────────────────────────────
export function RoyalNoir({ d, onChange: c, mini, ov = {} }) {
  const p = { bg: ov.bg||"#12100A", g: ov.accent||"#D4A843", t: ov.text||"#F5E9C8" };
  const s = mini ? 0.42 : 1;
  return (
    <div style={{ width: 420 * s, minHeight: 600 * s, background: p.bg, border: `${1.5 * s}px solid ${p.g}`, borderRadius: 3, padding: `${44 * s}px ${50 * s}px`, position: "relative", overflow: "hidden", textAlign: "center" }}>
      <div style={{ position: "absolute", inset: `${8 * s}px`, border: `${0.8 * s}px solid rgba(212,168,67,0.35)`, borderRadius: 2, pointerEvents: "none" }} />
      {/* Stars */}
      {[[30,40],[390,60],[50,560],[380,540],[200,20],[220,590]].map(([x,y],i) => (
        <div key={i} style={{ position: "absolute", left: x * s, top: y * s, color: p.g, fontSize: `${8 * s}px`, opacity: 0.5, pointerEvents: "none" }}>✦</div>
      ))}
      <p style={{ fontSize: `${9 * s}px`, letterSpacing: "0.28em", textTransform: "uppercase", color: p.g, margin: `0 0 ${8 * s}px`, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>The Wedding of</p>
      <div style={{ fontSize: `${48 * s}px`, color: p.g, fontFamily: "'Great Vibes','Dancing Script',cursive", lineHeight: 1.1, marginBottom: `${4 * s}px` }}>
        <EF value={d.coupleName} onChange={v => c("coupleName", v)} placeholder="Rahul & Priya" style={{ color: p.g, fontFamily: "'Great Vibes','Dancing Script',cursive", fontSize: `${48 * s}px` }} />
      </div>
      <Div color={p.g} sym="❦" />
      <p style={{ fontSize: `${9.5 * s}px`, letterSpacing: "0.22em", textTransform: "uppercase", color: p.t, opacity: 0.75, margin: `${6 * s}px 0 ${18 * s}px`, fontFamily: "'Cormorant Garamond',serif" }}>Together with their families request the pleasure of your company</p>
      {[["📅","date","15th December 2025"],["🕐","time","7:00 PM Onwards"],["📍","venue","The Grand Palace, Delhi"],["✉️","rsvp","RSVP contact"]].map(([ic, key, ph]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: `${10 * s}px`, marginBottom: `${10 * s}px`, background: "rgba(212,168,67,0.07)", borderRadius: `${8 * s}px`, padding: `${7 * s}px ${12 * s}px` }}>
          <span style={{ fontSize: `${14 * s}px` }}>{ic}</span>
          <EF value={d[key]} onChange={v => c(key, v)} placeholder={ph} style={{ fontSize: `${12 * s}px`, color: p.t, fontFamily: "'Cormorant Garamond',Georgia,serif", textAlign: "left" }} />
        </div>
      ))}
      <Div color={p.g} />
      <p style={{ fontSize: `${8.5 * s}px`, letterSpacing: "0.2em", textTransform: "uppercase", color: p.g, margin: `${10 * s}px 0 0`, fontFamily: "'Outfit',sans-serif" }}>Black tie optional</p>
    </div>
  );
}

// ── 3. Blush Romance ──────────────────────────────────────────────────────────
export function BlushRomance({ d, onChange: c, mini, ov = {} }) {
  const p = { bg: ov.bg||"#FDF0F2", g: ov.accent||"#C4748A", t: ov.text||"#7B3F55" };
  const s = mini ? 0.42 : 1;
  return (
    <div style={{ width: 420 * s, minHeight: 600 * s, background: p.bg, border: `${1.2 * s}px solid rgba(196,116,138,0.4)`, borderRadius: 3, padding: `${40 * s}px ${48 * s}px`, position: "relative", overflow: "hidden", textAlign: "center" }}>
      <div style={{ position: "absolute", top: -20 * s, left: -20 * s, fontSize: 80 * s, opacity: 0.18, pointerEvents: "none" }}>🌸</div>
      <div style={{ position: "absolute", bottom: -10 * s, right: -10 * s, fontSize: 90 * s, opacity: 0.16, pointerEvents: "none" }}>🌹</div>
      <div style={{ position: "absolute", top: 50 * s, right: -15 * s, fontSize: 60 * s, opacity: 0.13, pointerEvents: "none" }}>🌺</div>
      <p style={{ fontSize: `${9 * s}px`, letterSpacing: "0.24em", textTransform: "uppercase", color: p.g, margin: `0 0 ${5 * s}px`, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>With joy we invite you to celebrate</p>
      <Div color={p.g} sym="✿" />
      <div style={{ fontSize: `${52 * s}px`, color: p.g, fontFamily: "'Great Vibes','Dancing Script',cursive", lineHeight: 1.1, marginBottom: `${4 * s}px` }}>
        <EF value={d.coupleName} onChange={v => c("coupleName", v)} placeholder="Rahul & Priya" style={{ color: p.g, fontFamily: "'Great Vibes','Dancing Script',cursive", fontSize: `${52 * s}px` }} />
      </div>
      <p style={{ fontSize: `${10 * s}px`, letterSpacing: "0.12em", color: p.t, margin: `0 0 ${16 * s}px`, fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic" }}>as they unite in marriage</p>
      {[["date","📅"],["day","🌸"],["time","🕐"],["venue","📍"],["rsvp","✉️"]].map(([key,ic]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: `${8 * s}px`, marginBottom: `${9 * s}px`, justifyContent: "center" }}>
          <span style={{ fontSize: `${13 * s}px`, opacity: 0.7 }}>{ic}</span>
          <EF value={d[key]} onChange={v => c(key, v)} placeholder={key === "date" ? "15th June 2025" : key === "day" ? "Saturday" : key === "time" ? "7:00 PM" : key === "venue" ? "Venue & Address" : "RSVP"} style={{ fontSize: `${12 * s}px`, color: p.t, fontFamily: "'Cormorant Garamond',serif" }} />
        </div>
      ))}
      <Div color={p.g} sym="♡" />
      <p style={{ fontSize: `${9 * s}px`, letterSpacing: "0.18em", textTransform: "uppercase", color: p.g, margin: `${8 * s}px 0 0`, fontFamily: "'Outfit',sans-serif" }}>Dress code: formal</p>
    </div>
  );
}

// ── 4. Minimalist Linen ───────────────────────────────────────────────────────
export function MinimalistLinen({ d, onChange: c, mini, ov = {} }) {
  const s = mini ? 0.42 : 1;
  const bg = ov.bg || "#FAFAF8"; const acc = ov.accent || "#1A1A1A";
  return (
    <div style={{ width: 420 * s, minHeight: 600 * s, background: bg, border: `${1 * s}px solid #CCCCCC`, borderRadius: 2, padding: `${50 * s}px ${55 * s}px`, textAlign: "center", fontFamily: "'Outfit',sans-serif" }}>
      <div style={{ border: `${0.6 * s}px solid #E0E0E0`, position: "absolute", inset: `${12 * s}px`, borderRadius: 1, pointerEvents: "none" }} />
      <div style={{ height: `${1 * s}px`, background: "#1A1A1A", width: `${60 * s}px`, margin: `0 auto ${20 * s}px` }} />
      <p style={{ fontSize: `${9 * s}px`, letterSpacing: "0.3em", textTransform: "uppercase", color: "#888", margin: `0 0 ${16 * s}px` }}>Wedding Invitation</p>
      <EF value={d.coupleName} onChange={v => c("coupleName", v)} placeholder="Rahul & Priya" style={{ fontSize: `${28 * s}px`, color: "#1A1A1A", fontFamily: "'Cormorant Garamond',Georgia,serif", fontWeight: 300, letterSpacing: "0.08em" }} />
      <div style={{ height: `${1 * s}px`, background: "#1A1A1A", width: `${40 * s}px`, margin: `${12 * s}px auto` }} />
      <p style={{ fontSize: `${9 * s}px`, letterSpacing: "0.22em", textTransform: "uppercase", color: "#888", margin: `0 0 ${20 * s}px` }}>together with their families</p>
      {[["date","DATE","15th December 2025"],["day","DAY","Saturday"],["time","TIME","7:00 PM"],["venue","VENUE","The Grand Palace"],["rsvp","RSVP","contact@email.com"]].map(([key,lb,ph]) => (
        <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `${0.6 * s}px solid #EEEEEE`, padding: `${7 * s}px 0`, gap: `${8 * s}px` }}>
          <span style={{ fontSize: `${8.5 * s}px`, letterSpacing: "0.2em", color: "#888", textTransform: "uppercase", flexShrink: 0 }}>{lb}</span>
          <EF value={d[key]} onChange={v => c(key, v)} placeholder={ph} style={{ fontSize: `${12 * s}px`, color: "#1A1A1A", textAlign: "right" }} />
        </div>
      ))}
      <div style={{ height: `${1 * s}px`, background: "#1A1A1A", width: `${60 * s}px`, margin: `${24 * s}px auto 0` }} />
    </div>
  );
}

// ── 5. Marble Gold ────────────────────────────────────────────────────────────
export function MarbleGold({ d, onChange: c, mini, ov = {} }) {
  const p = { g: ov.accent||"#C9A84C", t: ov.text||"#2A2016" };
  const s = mini ? 0.42 : 1;
  return (
    <div style={{ width: 420 * s, minHeight: 600 * s, background: "linear-gradient(145deg,#F2EDE6 0%,#EDE5DC 30%,#F4EFE8 60%,#E8DFD5 100%)", border: `${1.5 * s}px solid ${p.g}`, borderRadius: 3, padding: `${44 * s}px ${50 * s}px`, position: "relative", overflow: "hidden", textAlign: "center" }}>
      {/* Marble veins */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.12 }}>
        <svg width="100%" height="100%" viewBox="0 0 420 600" preserveAspectRatio="none">
          <path d="M0 150 Q80 120 180 160 Q280 200 420 140" stroke="#9B8870" strokeWidth="1.5" fill="none"/>
          <path d="M0 300 Q120 270 220 310 Q340 350 420 290" stroke="#9B8870" strokeWidth="1" fill="none"/>
          <path d="M60 0 Q80 100 50 250 Q30 380 70 600" stroke="#9B8870" strokeWidth="0.8" fill="none"/>
        </svg>
      </div>
      <div style={{ position: "absolute", inset: `${10 * s}px`, border: `${0.8 * s}px solid rgba(201,168,76,0.4)`, borderRadius: 2, pointerEvents: "none" }} />
      <p style={{ fontSize: `${9 * s}px`, letterSpacing: "0.28em", textTransform: "uppercase", color: p.g, margin: `0 0 ${6 * s}px`, fontFamily: "'Cormorant Garamond',serif" }}>With love, we invite you</p>
      <Div color={p.g} sym="◆" />
      <div style={{ fontSize: `${50 * s}px`, color: p.g, fontFamily: "'Great Vibes','Dancing Script',cursive", lineHeight: 1.1 }}>
        <EF value={d.coupleName} onChange={v => c("coupleName", v)} placeholder="Rahul & Priya" style={{ color: p.g, fontFamily: "'Great Vibes',cursive", fontSize: `${50 * s}px` }} />
      </div>
      <p style={{ fontSize: `${9 * s}px`, letterSpacing: "0.16em", color: p.t, margin: `${8 * s}px 0 ${20 * s}px`, fontFamily: "'Cormorant Garamond',serif", opacity: 0.8 }}>request the honour of your presence</p>
      {[["📅","date","15th December 2025"],["🕐","time","7:00 PM"],["📍","venue","Grand Ballroom, Delhi"],["✉️","rsvp","RSVP"]].map(([ic,key,ph]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: `${10 * s}px`, marginBottom: `${10 * s}px`, borderBottom: `${0.6 * s}px solid rgba(201,168,76,0.3)`, paddingBottom: `${7 * s}px` }}>
          <span style={{ fontSize: `${13 * s}px` }}>{ic}</span>
          <EF value={d[key]} onChange={v => c(key, v)} placeholder={ph} style={{ fontSize: `${12 * s}px`, color: p.t, fontFamily: "'Cormorant Garamond',serif" }} />
        </div>
      ))}
      <Div color={p.g} />
    </div>
  );
}

// ── 6. Dusty Mauve ────────────────────────────────────────────────────────────
export function DustyMauve({ d, onChange: c, mini, ov = {} }) {
  const p = { bg: ov.bg||"#F5EEF4", g: ov.accent||"#9B7BAD", t: ov.text||"#4A3050" };
  const s = mini ? 0.42 : 1;
  return (
    <div style={{ width: 420 * s, minHeight: 600 * s, background: p.bg, border: `${1.2 * s}px solid rgba(155,123,173,0.4)`, borderRadius: 3, padding: `${44 * s}px ${50 * s}px`, textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -30 * s, left: -30 * s, fontSize: 100 * s, opacity: 0.09, pointerEvents: "none" }}>💜</div>
      <div style={{ position: "absolute", bottom: -20 * s, right: -20 * s, fontSize: 90 * s, opacity: 0.08, pointerEvents: "none" }}>🌸</div>
      <div style={{ position: "absolute", inset: `${12 * s}px`, border: `${0.6 * s}px solid rgba(155,123,173,0.25)`, borderRadius: 1, pointerEvents: "none" }} />
      <p style={{ fontSize: `${9 * s}px`, letterSpacing: "0.25em", textTransform: "uppercase", color: p.g, margin: `0 0 ${6 * s}px`, fontFamily: "'Cormorant Garamond',Georgia,serif" }}>You are warmly invited</p>
      <Div color={p.g} sym="❀" />
      <div style={{ fontSize: `${48 * s}px`, color: p.g, fontFamily: "'Great Vibes','Dancing Script',cursive", lineHeight: 1.1, margin: `${4 * s}px 0` }}>
        <EF value={d.coupleName} onChange={v => c("coupleName", v)} placeholder="Rahul & Priya" style={{ color: p.g, fontFamily: "'Great Vibes',cursive", fontSize: `${48 * s}px` }} />
      </div>
      <p style={{ fontSize: `${10 * s}px`, fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic", color: p.t, margin: `0 0 ${18 * s}px`, opacity: 0.8 }}>are getting married!</p>
      {[["📅","date","15th June 2025"],["🌸","day","Saturday"],["🕐","time","7 PM"],["📍","venue","Venue, City"],["✉️","rsvp","RSVP"]].map(([ic,key,ph]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: `${8 * s}px`, marginBottom: `${9 * s}px`, background: "rgba(155,123,173,0.07)", borderRadius: `${6 * s}px`, padding: `${6 * s}px ${10 * s}px` }}>
          <span style={{ fontSize: `${13 * s}px` }}>{ic}</span>
          <EF value={d[key]} onChange={v => c(key, v)} placeholder={ph} style={{ fontSize: `${12 * s}px`, color: p.t, fontFamily: "'Cormorant Garamond',serif" }} />
        </div>
      ))}
      <Div color={p.g} sym="✿" />
    </div>
  );
}

// ── 7. Navy Celestial ─────────────────────────────────────────────────────────
export function NavyCelestial({ d, onChange: c, mini, ov = {} }) {
  const p = { bg: ov.bg||"#0D1B35", g: ov.accent||"#D4A843", t: ov.text||"#F0E6CC" };
  const s = mini ? 0.42 : 1;
  const stars = [[50,40],[370,55],[80,550],[360,530],[200,25],[215,585],[30,300],[395,280],[120,75],[300,500]];
  return (
    <div style={{ width: 420 * s, minHeight: 600 * s, background: p.bg, border: `${1.5 * s}px solid rgba(212,168,67,0.5)`, borderRadius: 3, padding: `${44 * s}px ${50 * s}px`, textAlign: "center", position: "relative", overflow: "hidden" }}>
      {stars.map(([x,y],i) => <div key={i} style={{ position: "absolute", left: x * s, top: y * s, color: p.g, fontSize: `${i % 3 === 0 ? 10 : 7}px`, opacity: 0.4 + (i % 3) * 0.1, pointerEvents: "none" }}>✦</div>)}
      <div style={{ position: "absolute", inset: `${10 * s}px`, border: `${0.8 * s}px solid rgba(212,168,67,0.25)`, borderRadius: 2, pointerEvents: "none" }} />
      {/* Moon */}
      <div style={{ position: "absolute", top: `${20 * s}px`, right: `${30 * s}px`, fontSize: `${30 * s}px`, opacity: 0.4, pointerEvents: "none" }}>🌙</div>
      <p style={{ fontSize: `${9 * s}px`, letterSpacing: "0.28em", textTransform: "uppercase", color: p.g, margin: `0 0 ${6 * s}px`, fontFamily: "'Cormorant Garamond',serif" }}>Under the stars, we celebrate</p>
      <Div color={p.g} sym="★" />
      <div style={{ fontSize: `${50 * s}px`, color: p.g, fontFamily: "'Great Vibes','Dancing Script',cursive", lineHeight: 1.1 }}>
        <EF value={d.coupleName} onChange={v => c("coupleName", v)} placeholder="Rahul & Priya" style={{ color: p.g, fontFamily: "'Great Vibes',cursive", fontSize: `${50 * s}px` }} />
      </div>
      <p style={{ fontSize: `${9 * s}px`, letterSpacing: "0.18em", color: p.t, margin: `${6 * s}px 0 ${18 * s}px`, opacity: 0.75 }}>together with their families</p>
      {[["📅","date","15th Dec 2025"],["🕐","time","7 PM"],["📍","venue","Venue & City"],["✉️","rsvp","RSVP"]].map(([ic,key,ph]) => (
        <div key={key} style={{ display: "flex", gap: `${10 * s}px`, alignItems: "center", marginBottom: `${10 * s}px`, borderBottom: `${0.5 * s}px solid rgba(212,168,67,0.2)`, paddingBottom: `${8 * s}px` }}>
          <span style={{ fontSize: `${13 * s}px` }}>{ic}</span>
          <EF value={d[key]} onChange={v => c(key, v)} placeholder={ph} style={{ fontSize: `${12 * s}px`, color: p.t, fontFamily: "'Cormorant Garamond',serif" }} />
        </div>
      ))}
      <Div color={p.g} sym="✦" />
    </div>
  );
}

// ── 8. Terracotta Boho ────────────────────────────────────────────────────────
export function TerracottaBoho({ d, onChange: c, mini, ov = {} }) {
  const p = { bg: ov.bg||"#F8EDE4", g: ov.accent||"#C27040", t: ov.text||"#5C2E10" };
  const s = mini ? 0.42 : 1;
  return (
    <div style={{ width: 420 * s, minHeight: 600 * s, background: p.bg, border: `${1.5 * s}px solid rgba(194,112,64,0.4)`, borderRadius: 3, padding: `${44 * s}px ${50 * s}px`, textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -10 * s, left: -10 * s, fontSize: 80 * s, opacity: 0.14, pointerEvents: "none" }}>🌾</div>
      <div style={{ position: "absolute", bottom: -10 * s, right: -10 * s, fontSize: 80 * s, opacity: 0.14, transform: "rotate(180deg)", pointerEvents: "none" }}>🌾</div>
      <div style={{ position: "absolute", inset: `${12 * s}px`, border: `${0.8 * s}px dashed rgba(194,112,64,0.3)`, borderRadius: 2, pointerEvents: "none" }} />
      <div style={{ fontSize: `${22 * s}px`, marginBottom: `${4 * s}px` }}>☽ ✦ ☾</div>
      <p style={{ fontSize: `${9 * s}px`, letterSpacing: "0.22em", textTransform: "uppercase", color: p.g, margin: `0 0 ${6 * s}px`, fontFamily: "'Cormorant Garamond',serif" }}>Two souls, one love</p>
      <Div color={p.g} sym="⊹" />
      <div style={{ fontSize: `${50 * s}px`, color: p.g, fontFamily: "'Great Vibes','Dancing Script',cursive", lineHeight: 1.1 }}>
        <EF value={d.coupleName} onChange={v => c("coupleName", v)} placeholder="Rahul & Priya" style={{ color: p.g, fontFamily: "'Great Vibes',cursive", fontSize: `${50 * s}px` }} />
      </div>
      <p style={{ fontSize: `${10 * s}px`, fontFamily: "'Cormorant Garamond',serif", color: p.t, margin: `${4 * s}px 0 ${18 * s}px`, fontStyle: "italic" }}>are tying the knot!</p>
      {[["🌾","date","15th June 2025"],["☽","day","Saturday"],["🕐","time","7 PM Onwards"],["📍","venue","Venue & Address"],["✉️","rsvp","RSVP contact"]].map(([ic,key,ph]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: `${8 * s}px`, marginBottom: `${9 * s}px`, background: "rgba(194,112,64,0.06)", borderRadius: `${7 * s}px`, padding: `${6 * s}px ${10 * s}px` }}>
          <span style={{ fontSize: `${14 * s}px` }}>{ic}</span>
          <EF value={d[key]} onChange={v => c(key, v)} placeholder={ph} style={{ fontSize: `${12 * s}px`, color: p.t, fontFamily: "'Cormorant Garamond',serif" }} />
        </div>
      ))}
      <Div color={p.g} sym="⊹" />
    </div>
  );
}

// ── 9. Vintage Garden (Menu Card) ─────────────────────────────────────────────
export function VintageGarden({ d, onChange: c, mini, ov = {} }) {
  const p = { bg: ov.bg||"#F7EDD8", g: ov.accent||"#7A6A3A", t: ov.text||"#3D2E10" };
  const s = mini ? 0.42 : 1;
  return (
    <div style={{ width: 420 * s, minHeight: 600 * s, background: p.bg, border: `${1.5 * s}px double rgba(122,106,58,0.6)`, borderRadius: 3, padding: `${44 * s}px ${50 * s}px`, textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: `${8 * s}px`, border: `${0.8 * s}px solid rgba(122,106,58,0.25)`, borderRadius: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -10 * s, left: -10 * s, fontSize: 80 * s, opacity: 0.12, pointerEvents: "none" }}>🌻</div>
      <div style={{ position: "absolute", bottom: -10 * s, right: -10 * s, fontSize: 80 * s, opacity: 0.12, transform: "rotate(180deg)", pointerEvents: "none" }}>🌼</div>
      <p style={{ fontSize: `${9 * s}px`, letterSpacing: "0.25em", textTransform: "uppercase", color: p.g, margin: `0 0 ${5 * s}px`, fontFamily: "'Cormorant Garamond',serif" }}>Wedding Reception Menu</p>
      <Div color={p.g} sym="✾" />
      <div style={{ fontSize: `${44 * s}px`, color: p.g, fontFamily: "'Great Vibes','Dancing Script',cursive", lineHeight: 1.1, margin: `${4 * s}px 0 ${6 * s}px` }}>
        <EF value={d.coupleName} onChange={v => c("coupleName", v)} placeholder="Rahul & Priya" style={{ color: p.g, fontFamily: "'Great Vibes',cursive", fontSize: `${44 * s}px` }} />
      </div>
      {[["📅","date","15th June 2025"],["🕐","time","7 PM"],["📍","venue","Venue Name"],["✉️","rsvp","RSVP"]].map(([ic,key,ph]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: `${8 * s}px`, marginBottom: `${9 * s}px`, borderBottom: `${0.6 * s}px solid rgba(122,106,58,0.2)`, paddingBottom: `${7 * s}px` }}>
          <span style={{ fontSize: `${12 * s}px` }}>{ic}</span>
          <EF value={d[key]} onChange={v => c(key, v)} placeholder={ph} style={{ fontSize: `${12 * s}px`, color: p.t, fontFamily: "'Cormorant Garamond',serif", fontStyle: "italic" }} />
        </div>
      ))}
      <p style={{ fontSize: `${9 * s}px`, letterSpacing: "0.18em", color: p.g, margin: `${10 * s}px 0 0`, fontFamily: "'Outfit',sans-serif", textTransform: "uppercase" }}>— est. 2025 —</p>
    </div>
  );
}

// ── 10. Modern Arch (Thank You Card) ─────────────────────────────────────────
export function ModernArch({ d, onChange: c, mini, ov = {} }) {
  const s = mini ? 0.42 : 1;
  return (
    <div style={{ width: 420 * s, minHeight: 600 * s, background: "#FFF", border: `${1 * s}px solid #1A1A1A`, borderRadius: `${60 * s}px ${60 * s}px ${3 * s}px ${3 * s}px`, padding: `${50 * s}px ${50 * s}px ${44 * s}px`, textAlign: "center", position: "relative", overflow: "hidden" }}>
      {/* Arch background */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: `${220 * s}px`, background: "#1A1A1A", borderRadius: `${58 * s}px ${58 * s}px 0 0`, zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: `${9 * s}px`, letterSpacing: "0.28em", textTransform: "uppercase", color: "#FFF", margin: `0 0 ${10 * s}px`, fontFamily: "'Outfit',sans-serif" }}>Thank You</p>
        <div style={{ fontSize: `${52 * s}px`, color: "#FFF", fontFamily: "'Great Vibes','Dancing Script',cursive", lineHeight: 1.1 }}>
          <EF value={d.coupleName} onChange={v => c("coupleName", v)} placeholder="Rahul & Priya" style={{ color: "#FFF", fontFamily: "'Great Vibes',cursive", fontSize: `${52 * s}px` }} />
        </div>
        <p style={{ fontSize: `${9 * s}px`, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", margin: `${8 * s}px 0`, fontFamily: "'Outfit',sans-serif" }}>for celebrating with us</p>
      </div>
      <div style={{ position: "relative", zIndex: 1, marginTop: `${20 * s}px` }}>
        {[["📅","date","15th June 2025"],["📍","venue","The Grand Palace"],["✉️","rsvp","Contact"]].map(([ic,key,ph]) => (
          <div key={key} style={{ display: "flex", gap: `${8 * s}px`, alignItems: "center", marginBottom: `${10 * s}px`, borderBottom: `${0.6 * s}px solid #EEE`, paddingBottom: `${8 * s}px` }}>
            <span style={{ fontSize: `${13 * s}px` }}>{ic}</span>
            <EF value={d[key]} onChange={v => c(key, v)} placeholder={ph} style={{ fontSize: `${12 * s}px`, color: "#1A1A1A", fontFamily: "'Cormorant Garamond',serif" }} />
          </div>
        ))}
        <div style={{ height: `${1 * s}px`, background: "#1A1A1A", width: `${60 * s}px`, margin: `${20 * s}px auto 0` }} />
      </div>
    </div>
  );
}

// ── Map template ID → component ───────────────────────────────────────────────
export const RENDERERS = {
  "botanical-sage":   BotanicalSage,
  "royal-noir":       RoyalNoir,
  "blush-romance":    BlushRomance,
  "minimalist-linen": MinimalistLinen,
  "marble-gold":      MarbleGold,
  "dusty-mauve":      DustyMauve,
  "navy-celestial":   NavyCelestial,
  "terracotta-boho":  TerracottaBoho,
  "vintage-garden":   VintageGarden,
  "modern-arch":      ModernArch,
};
