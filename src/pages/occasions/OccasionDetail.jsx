import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOccasionById } from "../../data/occasions";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const font  = "'Outfit', sans-serif";
const serif = "'Cormorant Garamond', Georgia, serif";
const gold  = "#C47A2E";
const goldLt = "#CCAB4A";
const bg    = "#FDFAF5";
const ink   = "#1E0F00";

const HUB_ROUTES = {
  "birthday-party":  "/birthday-hub",
  "first-birthday":  "/birthday-hub",
  "anniversary":     "/anniversary-hub",
  "baby-shower":     "/baby-shower-hub",
  "gender-reveal":   "/baby-shower-hub",
  "newborn-welcome": "/baby-shower-hub",
  "housewarming":    "/housewarming-hub",
  "get-together":    "/get-together-hub",
  "naming-ceremony": "/naming-ceremony-hub",
};

function getEquipment(id, guests) {
  const g = guests;
  const tables = Math.ceil(g / 6);
  const common = [
    { cat: "Seating & Tables", items: [{ name: "Folding chairs", qty: `${g + 5} chairs` }, { name: "Tables (6-seater)", qty: `${tables} tables` }] },
    { cat: "Serving", items: [{ name: "Disposable plates", qty: `${Math.ceil(g * 1.5)} pieces` }, { name: "Cups / glasses", qty: `${g * 2} pieces` }, { name: "Napkins", qty: `${g * 3} pieces` }, { name: "Serving spoons", qty: "5–6 pieces" }, { name: "Garbage bags", qty: "4–5 bags" }] },
  ];
  const specific = {
    "birthday-party":  [{ cat: "Décor", items: [{ name: "Balloon bouquets", qty: `${Math.ceil(g/3)} bouquets` }, { name: "Streamers / ribbons", qty: "4–5 rolls" }, { name: "Fairy lights", qty: "3 sets" }, { name: "Photo backdrop", qty: "1 backdrop" }, { name: "Birthday banner", qty: "1 banner" }] }, { cat: "Entertainment", items: [{ name: g > 40 ? "Sound system" : "Bluetooth speaker", qty: g > 40 ? "1 system" : "1–2 speakers" }, { name: "Cake knife + server", qty: "1 set" }] }],
    "first-birthday":  [{ cat: "Décor", items: [{ name: "Balloon arch", qty: "1 arch" }, { name: "Theme backdrop", qty: "1 backdrop" }, { name: "Highchair decoration", qty: "1 set" }, { name: "Smash cake table", qty: "1 setup" }] }, { cat: "Baby Safety", items: [{ name: "Soft play mat", qty: "1–2 mats" }, { name: "Baby gate", qty: "1–2 gates" }] }],
    "baby-shower":     [{ cat: "Décor", items: [{ name: "Pastel balloon clusters", qty: `${Math.ceil(g/5)} clusters` }, { name: "Fairy lights", qty: "2–3 sets" }, { name: "Floral centrepieces", qty: `${tables} pieces` }, { name: "Photo backdrop", qty: "1 backdrop" }] }, { cat: "Activity Supplies", items: [{ name: "Plain onesies", qty: `${Math.ceil(g*0.5)} onesies` }, { name: "Fabric markers", qty: "6–8 markers" }, { name: "Bingo card printouts", qty: `${g} cards` }] }],
    "anniversary":     [{ cat: "Décor", items: [{ name: "Candles (pillar + tea lights)", qty: `${Math.ceil(g/2)} pieces` }, { name: "Flower centrepieces", qty: `${tables} pieces` }, { name: "Warm fairy lights", qty: "3 sets" }, { name: "Memory photo display", qty: "1 display" }] }, { cat: "Table Setting", items: [{ name: "Champagne glasses", qty: `${g+5} glasses` }, { name: "Cloth napkins", qty: `${g} napkins` }, { name: "Table runners", qty: `${tables} runners` }] }],
    "housewarming":    [{ cat: "Décor", items: [{ name: "Welcome floral arch", qty: "1" }, { name: "Indoor fairy lights", qty: "2 sets" }, { name: "Table centrepieces", qty: `${tables} pieces` }, { name: "Potted plants", qty: "3–4 plants" }] }, { cat: "Serving", items: [{ name: "Serving trays", qty: `${Math.ceil(g/10)} trays` }, { name: "Chafing dishes", qty: "4–5 pieces" }] }],
    "get-together":    [{ cat: "Entertainment", items: [{ name: "Bluetooth speaker", qty: "1–2 speakers" }, { name: "Card / board games", qty: "2–3 games" }] }, { cat: "Décor", items: [{ name: "String lights", qty: "2 sets" }, { name: "Photo corner props", qty: "1 box" }] }],
    "naming-ceremony": [{ cat: "Ceremony", items: [{ name: "Marigold garlands", qty: "4–6 garlands" }, { name: "Diyas (oil lamps)", qty: "10–15 diyas" }, { name: "Puja thali setup", qty: "1–2 sets" }, { name: "Flower petals / rangoli", qty: "2–3 packs" }] }, { cat: "Décor", items: [{ name: "Fabric backdrop (saffron)", qty: "1 backdrop" }, { name: "Fairy lights", qty: "2 sets" }, { name: "Floral centrepieces", qty: `${tables} pieces` }] }],
    "gender-reveal":   [{ cat: "Reveal Items", items: [{ name: "Gender reveal box", qty: "1 box" }, { name: "Pink & blue balloons", qty: `${Math.ceil(g*1.5)} balloons` }, { name: "Confetti cannons", qty: "4–6 cannons" }] }, { cat: "Décor", items: [{ name: "Pink & blue streamers", qty: "4 rolls" }, { name: '"He or She?" banner', qty: "1 banner" }, { name: "Photo backdrop", qty: "1 backdrop" }] }],
    "graduation":      [{ cat: "Décor", items: [{ name: "Graduation balloon arch", qty: "1 arch" }, { name: "Memory photo wall", qty: "1 display" }, { name: "Graduation banner", qty: "1 banner" }] }, { cat: "Entertainment", items: [{ name: "Bluetooth speaker", qty: "1–2 speakers" }, { name: "Photo booth props", qty: "1 box" }] }],
    "farewell":        [{ cat: "Décor", items: [{ name: "Memory photo wall", qty: "1 display" }, { name: "Farewell banner", qty: "1 banner" }, { name: "Flower arrangements", qty: `${tables} pieces` }] }, { cat: "Keepsakes", items: [{ name: "Memory scrapbook", qty: "1 book" }, { name: "Card signing station", qty: "1 setup" }] }],
    "retirement":      [{ cat: "Décor", items: [{ name: "Retirement banner", qty: "1 banner" }, { name: "Career memory wall", qty: "1 display" }, { name: "Flower arrangements", qty: `${tables} pieces` }] }, { cat: "Keepsakes", items: [{ name: "Memory book", qty: "1 book" }, { name: "Gift & card table", qty: "1 table" }] }],
    "newborn-welcome": [{ cat: "Décor", items: [{ name: "Flower arch at entrance", qty: "1 arch" }, { name: "Welcome balloons", qty: `${Math.ceil(g/4)} balloons` }, { name: "Photo corner backdrop", qty: "1 backdrop" }] }, { cat: "Comfort", items: [{ name: "Baby-safe floor mat", qty: "1 mat" }, { name: "Extra chairs for elders", qty: `${Math.ceil(g*0.3)} chairs` }] }],
  };
  return [...common, ...(specific[id] || [])];
}

const STEPS = ["Details", "Theme", "Vendors", "Gifts", "Your Plan"];

function ProgressBar({ step }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const cur  = n === step;
        return (
          <React.Fragment key={n}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{ width: cur ? 28 : 22, height: cur ? 28 : 22, borderRadius: "50%", background: done ? gold : cur ? `linear-gradient(135deg,${gold},${goldLt})` : "rgba(196,122,46,0.1)", border: done || cur ? "none" : "1.5px solid rgba(196,122,46,0.2)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s", boxShadow: cur ? "0 0 0 4px rgba(196,122,46,0.15)" : "none" }}>
                {done
                  ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : <span style={{ fontSize: cur ? 11 : 10, fontWeight: 700, color: cur ? "#fff" : "rgba(196,122,46,0.45)", fontFamily: font }}>{n}</span>
                }
              </div>
              <span style={{ fontSize: 9, fontWeight: cur ? 700 : 500, color: cur ? gold : "rgba(196,122,46,0.35)", fontFamily: font, whiteSpace: "nowrap" }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 1.5, background: done ? gold : "rgba(196,122,46,0.15)", marginBottom: 14, transition: "background 0.3s", minWidth: 8 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function StepShell({ title, subtitle, children }) {
  return (
    <div style={{ animation: "fadeUp 0.28s cubic-bezier(0.25,0.46,0.45,0.94)" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontFamily: serif, fontSize: "clamp(1.45rem,4vw,2rem)", fontWeight: 400, color: ink, margin: "0 0 6px", lineHeight: 1.15, letterSpacing: "-0.01em" }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13.5, color: "rgba(30,15,0,0.45)", margin: 0, lineHeight: 1.6, fontFamily: font }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function OccasionDetail() {
  const { slug }   = useParams();
  const navigate   = useNavigate();

  const [step,    setStep]    = useState(1);
  const [guests,  setGuests]  = useState(20);
  const [date,    setDate]    = useState("");
  const [budget,  setBudget]  = useState("");
  const [theme,   setTheme]   = useState(null);
  const [vendors, setVendors] = useState([]);
  const [gifts,   setGifts]   = useState([]);
  const [checked, setChecked] = useState({});

  const occasion = getOccasionById(slug);
  if (!occasion) { navigate("/"); return null; }

  const hub       = HUB_ROUTES[slug];
  const equipment = getEquipment(slug, guests);
  const tasksDone = Object.values(checked).filter(Boolean).length;
  const tasksTotal = (occasion.checklist || []).length;
  const fmtBudget = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  const budgetMid = Math.round((occasion.budgetMin + occasion.budgetMax) / 2);

  const toggleVendor = (c) => setVendors(v => v.includes(c) ? v.filter(x => x !== c) : [...v, c]);
  const toggleGift   = (n) => setGifts(g  => g.includes(n)  ? g.filter(x => x !== n) : [...g, n]);
  const next = () => setStep(s => Math.min(s + 1, 5));
  const back = () => { if (step === 1) navigate(-1); else setStep(s => s - 1); };

  const primaryBtn = { width: "100%", padding: "15px 20px", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 20px rgba(196,122,46,0.3)", transition: "all 0.2s" };
  const ghostBtn   = { padding: "13px 20px", borderRadius: 14, border: `1.5px solid rgba(196,122,46,0.25)`, background: "transparent", color: gold, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font, transition: "all 0.2s", whiteSpace: "nowrap" };

  return (
    <div style={{ minHeight: "100dvh", background: bg, fontFamily: font, display: "flex", flexDirection: "column" }}>
      <SEO title={`Plan your ${occasion.name} — Tendr`} description={`Step-by-step ${occasion.name} planner — theme, vendors, checklist and more.`} path={`/occasions/${slug}`} />

      {/* ── Sticky header ── */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: bg, borderBottom: "1px solid rgba(196,122,46,0.1)" }}>
        <HamburgerNav active="Occasions" />
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px 4px" }}>
          <button onClick={back} style={{ width: 34, height: 34, borderRadius: 10, border: "none", background: "rgba(196,122,46,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <span style={{ fontSize: 22 }}>{occasion.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: ink, lineHeight: 1.2 }}>{occasion.name}</div>
            {occasion.localName && <div style={{ fontSize: 10, color: gold, fontWeight: 600 }}>{occasion.localName}</div>}
          </div>
          {hub && (
            <button onClick={() => navigate(hub)} style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", flexShrink: 0 }}>
              🛠️ Party Tools
            </button>
          )}
        </div>
        <div style={{ padding: "10px 20px 14px", overflowX: "auto", scrollbarWidth: "none" }}>
          <ProgressBar step={step} />
        </div>
      </div>

      {/* ── Step content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px 130px", maxWidth: 680, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>

        {/* ── STEP 1: DETAILS ── */}
        {step === 1 && (
          <StepShell title="Let's set the scene" subtitle="Tell us about your celebration — we'll tailor everything to fit.">
            <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", marginBottom: 14, border: "1.5px solid rgba(196,122,46,0.1)" }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 14 }}>How many guests?</label>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <button onClick={() => setGuests(g => Math.max(5, g - 5))} style={{ width: 40, height: 40, borderRadius: 11, border: `1.5px solid rgba(196,122,46,0.2)`, background: "#F8F4EF", color: gold, fontSize: 22, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>−</button>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 44, fontWeight: 900, color: ink, lineHeight: 1 }}>{guests}</div>
                  <div style={{ fontSize: 11, color: "rgba(30,15,0,0.35)", marginTop: 3 }}>guests</div>
                </div>
                <button onClick={() => setGuests(g => g + 5)} style={{ width: 40, height: 40, borderRadius: 11, border: "none", background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 22, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>+</button>
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
                {[10, 20, 30, 50, 75, 100].map(n => (
                  <button key={n} onClick={() => setGuests(n)} style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 100, border: `1.5px solid ${guests === n ? gold : "rgba(196,122,46,0.15)"}`, background: guests === n ? "rgba(196,122,46,0.1)" : "transparent", color: guests === n ? gold : "rgba(30,15,0,0.4)", cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}>{n}</button>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", marginBottom: 14, border: "1.5px solid rgba(196,122,46,0.1)" }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 10 }}>
                Party date <span style={{ fontWeight: 400, color: "rgba(196,122,46,0.45)", textTransform: "none", letterSpacing: 0, fontSize: 11 }}>(optional)</span>
              </label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: "1.5px solid rgba(196,122,46,0.15)", background: "#FDFAF5", fontSize: 14, fontFamily: font, color: ink, outline: "none", boxSizing: "border-box", cursor: "pointer" }} />
            </div>

            <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1.5px solid rgba(196,122,46,0.1)" }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 10 }}>
                Your budget <span style={{ fontWeight: 400, color: "rgba(196,122,46,0.45)", textTransform: "none", letterSpacing: 0, fontSize: 11 }}>(optional)</span>
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, fontWeight: 700, color: "rgba(30,15,0,0.3)", fontFamily: font }}>₹</span>
                <input type="number" value={budget} onChange={e => setBudget(e.target.value)} placeholder={budgetMid.toString()} style={{ width: "100%", padding: "11px 14px 11px 28px", borderRadius: 11, border: "1.5px solid rgba(196,122,46,0.15)", background: "#FDFAF5", fontSize: 14, fontFamily: font, color: ink, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                <span style={{ fontSize: 11, color: "rgba(30,15,0,0.3)" }}>Typical range for {guests} guests</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: gold }}>{fmtBudget(occasion.budgetMin)} – {fmtBudget(occasion.budgetMax)}</span>
              </div>
            </div>
          </StepShell>
        )}

        {/* ── STEP 2: THEME ── */}
        {step === 2 && (
          <StepShell title="Pick your décor theme" subtitle="Choose the vibe for your celebration — we'll use it in your blueprint.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
              {(occasion.decorThemes || []).map((t, i) => {
                const sel = theme?.name === t.name;
                return (
                  <button key={i} onClick={() => setTheme(sel ? null : t)}
                    style={{ padding: "18px 18px 15px", borderRadius: 16, textAlign: "left", cursor: "pointer", border: `2px solid ${sel ? gold : "rgba(196,122,46,0.12)"}`, background: sel ? "rgba(196,122,46,0.06)" : "#fff", transition: "all 0.18s", fontFamily: font, position: "relative", overflow: "hidden" }}>
                    {sel && <div aria-hidden style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: gold }} />}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, paddingLeft: sel ? 8 : 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: sel ? gold : ink, lineHeight: 1.2 }}>{t.name}</div>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${sel ? gold : "rgba(196,122,46,0.2)"}`, background: sel ? gold : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 8, transition: "all 0.18s" }}>
                        {sel && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                    </div>
                    <div style={{ fontSize: 12.5, color: "rgba(30,15,0,0.5)", lineHeight: 1.55, marginBottom: 10, paddingLeft: sel ? 8 : 0 }}>{t.desc}</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", paddingLeft: sel ? 8 : 0 }}>
                      {(t.tags || []).slice(0, 3).map(tag => (
                        <span key={tag} style={{ fontSize: 10, fontWeight: 600, color: gold, background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "2px 8px" }}>#{tag}</span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
            {!theme && <p style={{ fontSize: 12, color: "rgba(30,15,0,0.3)", textAlign: "center", marginTop: 16, fontFamily: font }}>Tap a theme to select it — or proceed without one</p>}
          </StepShell>
        )}

        {/* ── STEP 3: VENDORS ── */}
        {step === 3 && (
          <StepShell title="What do you need?" subtitle="Select everything you'd like to arrange — we'll match you with verified vendors.">
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Vendor Categories</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(occasion.vendorCategories || []).map(cat => {
                  const sel = vendors.includes(cat);
                  return (
                    <button key={cat} onClick={() => toggleVendor(cat)}
                      style={{ padding: "10px 16px", borderRadius: 100, border: `1.5px solid ${sel ? gold : "rgba(196,122,46,0.2)"}`, background: sel ? "rgba(196,122,46,0.1)" : "#fff", color: sel ? gold : "rgba(30,15,0,0.55)", fontSize: 13, fontWeight: sel ? 700 : 500, cursor: "pointer", fontFamily: font, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6 }}>
                      {sel && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Activities & Entertainment</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 10 }}>
                {(occasion.activities || []).map((a, i) => {
                  const sel = vendors.includes(a.name);
                  return (
                    <button key={i} onClick={() => toggleVendor(a.name)}
                      style={{ padding: "14px 16px", borderRadius: 14, border: `1.5px solid ${sel ? gold : "rgba(196,122,46,0.12)"}`, background: sel ? "rgba(196,122,46,0.07)" : "#fff", textAlign: "left", cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: sel ? gold : ink, marginBottom: 3 }}>{a.name}</div>
                          <div style={{ fontSize: 11.5, color: "rgba(30,15,0,0.4)", lineHeight: 1.4 }}>{(a.desc || "").slice(0, 70)}{(a.desc?.length || 0) > 70 ? "…" : ""}</div>
                        </div>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${sel ? gold : "rgba(196,122,46,0.2)"}`, background: sel ? gold : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                          {sel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            {vendors.length === 0 && <p style={{ fontSize: 12, color: "rgba(30,15,0,0.3)", textAlign: "center", marginTop: 16, fontFamily: font }}>Select at least one, or skip to continue</p>}
          </StepShell>
        )}

        {/* ── STEP 4: GIFTS ── */}
        {step === 4 && (
          <StepShell title="Any gifts or hampers?" subtitle="Pick ideas to include in your plan — or skip this step.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 12 }}>
              {(occasion.giftIdeas || []).map((g, i) => {
                const sel = gifts.includes(g.name);
                return (
                  <button key={i} onClick={() => toggleGift(g.name)}
                    style={{ padding: "16px", borderRadius: 16, textAlign: "left", cursor: "pointer", border: `1.5px solid ${sel ? gold : "rgba(196,122,46,0.12)"}`, background: sel ? "rgba(196,122,46,0.07)" : "#fff", fontFamily: font, transition: "all 0.15s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: sel ? gold : ink, lineHeight: 1.3 }}>{g.name}</div>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${sel ? gold : "rgba(196,122,46,0.2)"}`, background: sel ? gold : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                        {sel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                    </div>
                    <div style={{ fontSize: 11.5, color: "rgba(30,15,0,0.45)", lineHeight: 1.45, marginBottom: 8 }}>{(g.desc || "").slice(0, 80)}{(g.desc?.length || 0) > 80 ? "…" : ""}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: gold }}>{g.price}</div>
                  </button>
                );
              })}
            </div>
          </StepShell>
        )}

        {/* ── STEP 5: BLUEPRINT ── */}
        {step === 5 && (
          <StepShell title="Your celebration plan" subtitle="Everything in one place — review, tick off tasks and start booking.">

            {/* Summary header */}
            <div style={{ background: "linear-gradient(135deg,#FFF8F0,#FFFDF9)", border: `1.5px solid rgba(196,122,46,0.18)`, borderRadius: 20, padding: "20px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid rgba(196,122,46,0.1)" }}>
                <span style={{ fontSize: 36 }}>{occasion.icon}</span>
                <div>
                  <div style={{ fontFamily: serif, fontSize: 20, fontWeight: 400, color: ink }}>{occasion.name}</div>
                  {date && <div style={{ fontSize: 12, color: gold, fontWeight: 600, marginTop: 2 }}>📅 {new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "GUESTS",  val: `${guests} people` },
                  { label: "BUDGET",  val: budget ? `₹${Number(budget).toLocaleString("en-IN")}` : `${fmtBudget(occasion.budgetMin)}–${fmtBudget(occasion.budgetMax)}` },
                  { label: "THEME",   val: theme?.name || "—" },
                  { label: "VENDORS", val: vendors.filter(v => (occasion.vendorCategories || []).includes(v)).length > 0 ? `${vendors.filter(v => (occasion.vendorCategories||[]).includes(v)).length} categories` : "—" },
                ].map(({ label, val }) => (
                  <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "11px 14px", border: "1px solid rgba(196,122,46,0.1)" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(196,122,46,0.45)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: val === "—" ? "rgba(30,15,0,0.25)" : ink }}>{val}</div>
                  </div>
                ))}
              </div>
              {theme && (
                <div style={{ marginTop: 10, background: "rgba(196,122,46,0.06)", borderRadius: 12, padding: "11px 14px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>Theme Details</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: ink, marginBottom: 3 }}>{theme.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(30,15,0,0.45)", lineHeight: 1.5 }}>{theme.desc}</div>
                </div>
              )}
            </div>

            {/* Book vendors */}
            {vendors.filter(v => (occasion.vendorCategories || []).includes(v)).length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Book Your Vendors</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {vendors.filter(v => (occasion.vendorCategories || []).includes(v)).map(cat => (
                    <button key={cat} onClick={() => navigate(`/listings?serviceType=${cat}`)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.15)", background: "#fff", cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}>
                      <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{cat}</div>
                        <div style={{ fontSize: 11.5, color: "rgba(30,15,0,0.4)", marginTop: 1 }}>Browse verified vendors</div>
                      </div>
                      <div style={{ background: `linear-gradient(135deg,${gold},${goldLt})`, borderRadius: 9, padding: "7px 14px", flexShrink: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Find →</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Gift ideas */}
            {gifts.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Gift Ideas</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {gifts.map(name => {
                    const g = (occasion.giftIdeas || []).find(g => g.name === name);
                    return g ? (
                      <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, background: "#fff", border: "1px solid rgba(196,122,46,0.1)" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>{g.name}</div>
                          <div style={{ fontSize: 11, color: gold, fontWeight: 600, marginTop: 1 }}>{g.price}</div>
                        </div>
                        <button onClick={() => navigate("/gift-hampers-cakes")} style={{ fontSize: 11, fontWeight: 700, color: gold, background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.2)", borderRadius: 8, padding: "5px 10px", cursor: "pointer", fontFamily: font }}>View →</button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Checklist */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em" }}>Planning Checklist</div>
                {tasksDone > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: gold }}>{tasksDone}/{tasksTotal}</span>}
              </div>
              {tasksDone > 0 && (
                <div style={{ height: 4, background: "rgba(196,122,46,0.12)", borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ height: "100%", width: `${(tasksDone / tasksTotal) * 100}%`, background: `linear-gradient(90deg,${gold},${goldLt})`, borderRadius: 3, transition: "width 0.3s" }} />
                </div>
              )}
              {(occasion.checklist || []).map((item, i) => (
                <div key={i} onClick={() => setChecked(c => ({ ...c, [i]: !c[i] }))}
                  style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 14px", background: checked[i] ? "rgba(196,122,46,0.04)" : "#fff", borderRadius: 12, border: `1.5px solid ${checked[i] ? "rgba(196,122,46,0.18)" : "rgba(196,122,46,0.1)"}`, marginBottom: 6, cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${checked[i] ? gold : "rgba(196,122,46,0.25)"}`, background: checked[i] ? gold : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1, transition: "all 0.15s" }}>
                    {checked[i] && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span style={{ fontSize: 13, color: checked[i] ? "rgba(30,15,0,0.35)" : ink, textDecoration: checked[i] ? "line-through" : "none", lineHeight: 1.5, transition: "all 0.15s" }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Equipment */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>What to Arrange · {guests} guests</div>
              {equipment.map(({ cat, items }) => (
                <div key={cat} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(196,122,46,0.55)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{cat}</div>
                  {items.map(({ name, qty }) => (
                    <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "9px 13px", background: "#fff", borderRadius: 9, marginBottom: 5, border: "1px solid rgba(196,122,46,0.08)" }}>
                      <span style={{ fontSize: 13, color: ink }}>{name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: gold, flexShrink: 0, marginLeft: 8 }}>{qty}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Hub banner */}
            {hub && (
              <div onClick={() => navigate(hub)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "linear-gradient(135deg,#1a0a2e,#2d1060)", borderRadius: 16, cursor: "pointer" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Party day is here?</div>
                  <div style={{ fontSize: 11, color: "rgba(167,139,250,0.8)", marginTop: 2 }}>Games, playlists, bill split & more</div>
                </div>
                <div style={{ background: "rgba(124,58,237,0.35)", border: "1px solid rgba(124,58,237,0.5)", borderRadius: 10, padding: "8px 14px", flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#C4B5FD" }}>Open Hub →</span>
                </div>
              </div>
            )}
          </StepShell>
        )}
      </div>

      {/* ── Fixed bottom CTA ── */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: bg, borderTop: "1px solid rgba(196,122,46,0.1)", padding: "14px 20px calc(14px + env(safe-area-inset-bottom,0px))", zIndex: 50 }}>
        <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", gap: 10 }}>
          {step > 1 && <button onClick={back} style={ghostBtn}>← Back</button>}
          {step < 5 && (
            <button onClick={next} style={{ ...primaryBtn, flex: 1 }}>
              {step === 1 && "Pick a theme →"}
              {step === 2 && (theme ? `Use "${theme.name}" →` : "Skip →")}
              {step === 3 && (vendors.length > 0 ? `Next — Gifts (${vendors.length} selected) →` : "Skip →")}
              {step === 4 && (gifts.length > 0 ? `See my plan →` : "Skip, see my plan →")}
            </button>
          )}
          {step === 5 && (
            <button
              onClick={() => {
                const cats = vendors.filter(v => (occasion.vendorCategories || []).includes(v));
                navigate(cats.length > 0 ? `/listings?serviceType=${cats[0]}` : "/listings");
              }}
              style={{ ...primaryBtn, flex: 1 }}>
              Start Booking Vendors →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
