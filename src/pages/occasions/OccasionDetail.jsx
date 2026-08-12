import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getOccasionById } from "../../data/occasions";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";

const font = "'Outfit', sans-serif";

// ── Hub route mapping ─────────────────────────────────────────────────────────
const HUB_ROUTES = {
  "birthday-party":   { route: "/birthday-hub",        label: "Birthday Hub",         emoji: "🎂" },
  "first-birthday":   { route: "/birthday-hub",        label: "Birthday Hub",         emoji: "🎂" },
  "anniversary":      { route: "/anniversary-hub",     label: "Anniversary Hub",      emoji: "💍" },
  "baby-shower":      { route: "/baby-shower-hub",     label: "Baby Shower Hub",      emoji: "👶" },
  "gender-reveal":    { route: "/baby-shower-hub",     label: "Baby Shower Hub",      emoji: "🍼" },
  "newborn-welcome":  { route: "/baby-shower-hub",     label: "Baby Shower Hub",      emoji: "👶" },
  "housewarming":     { route: "/housewarming-hub",    label: "Housewarming Hub",     emoji: "🏡" },
  "get-together":     { route: "/get-together-hub",    label: "Get Together Hub",     emoji: "🎉" },
  "naming-ceremony":  { route: "/naming-ceremony-hub", label: "Naming Ceremony Hub",  emoji: "🌸" },
};

// ── Equipment generator ───────────────────────────────────────────────────────
function getEquipment(id, guests) {
  const g = guests;
  const tables = Math.ceil(g / 6);

  const common = [
    { cat: "Seating & Tables", items: [
      { name: "Folding chairs", qty: `${g + 5} chairs` },
      { name: "Tables (6-seater)", qty: `${tables} tables` },
    ]},
    { cat: "Serving", items: [
      { name: "Disposable plates", qty: `${Math.ceil(g * 1.5)} pieces` },
      { name: "Cups / glasses", qty: `${g * 2} pieces` },
      { name: "Napkins", qty: `${g * 3} pieces` },
      { name: "Serving spoons", qty: "5–6 pieces" },
      { name: "Garbage bags", qty: "4–5 bags" },
    ]},
  ];

  const specific = {
    "birthday-party": [
      { cat: "Décor", items: [
        { name: "Balloon bouquets", qty: `${Math.ceil(g / 3)} bouquets` },
        { name: "Streamers / ribbons", qty: "4–5 rolls" },
        { name: "Fairy lights / LED strips", qty: "3 sets" },
        { name: "Photo backdrop", qty: "1 backdrop" },
        { name: "Birthday banner", qty: "1 banner" },
      ]},
      { cat: "Entertainment", items: [
        { name: g > 40 ? "Sound system (PA)" : "Bluetooth speaker", qty: g > 40 ? "1 system" : "1–2 speakers" },
        { name: "Extension cords", qty: "2–3 cords" },
        { name: "Cake knife + server set", qty: "1 set" },
      ]},
    ],
    "first-birthday": [
      { cat: "Décor", items: [
        { name: "Balloon arch", qty: "1 arch" },
        { name: "Theme backdrop", qty: "1 backdrop" },
        { name: "Fairy lights", qty: "2 sets" },
        { name: "Highchair decoration kit", qty: "1 set" },
        { name: "Smash cake table setup", qty: "1 setup" },
      ]},
      { cat: "Baby Safety", items: [
        { name: "Soft play mat / floor mat", qty: "1–2 mats" },
        { name: "Baby gate (if stairs)", qty: "1–2 gates" },
      ]},
    ],
    "baby-shower": [
      { cat: "Décor", items: [
        { name: "Pastel balloon clusters", qty: `${Math.ceil(g / 5)} clusters` },
        { name: "Fairy lights / string lights", qty: "2–3 sets" },
        { name: "Floral centrepieces", qty: `${tables} pieces` },
        { name: "Photo backdrop / arch", qty: "1 backdrop" },
        { name: "Gift display table", qty: "1 table" },
      ]},
      { cat: "Activity Supplies", items: [
        { name: "Plain onesies (for decorating)", qty: `${Math.ceil(g * 0.5)} onesies` },
        { name: "Fabric markers", qty: "6–8 markers" },
        { name: "Prediction card printouts", qty: `${g} cards` },
        { name: "Bingo card printouts", qty: `${g} cards` },
      ]},
    ],
    "anniversary": [
      { cat: "Décor", items: [
        { name: "Candles (pillar + tea lights)", qty: `${Math.ceil(g / 2)} pieces` },
        { name: "Flower arrangements / centrepieces", qty: `${tables} pieces` },
        { name: "Warm fairy lights / Edison bulbs", qty: "3 sets" },
        { name: "Memory photo display", qty: "1 display" },
        { name: "Couple's photo backdrop", qty: "1 backdrop" },
      ]},
      { cat: "Table Setting", items: [
        { name: "Champagne / sparkling glasses", qty: `${g + 5} glasses` },
        { name: "Cloth napkins", qty: `${g} napkins` },
        { name: "Table runners", qty: `${tables} runners` },
      ]},
    ],
    "housewarming": [
      { cat: "Décor", items: [
        { name: "Welcome floral arch / wreath", qty: "1" },
        { name: "Fairy lights (indoor, warm)", qty: "2 sets" },
        { name: "Table centrepieces", qty: `${tables} pieces` },
        { name: "Potted plants / indoor greens", qty: "3–4 plants" },
      ]},
      { cat: "Serving", items: [
        { name: "Serving trays", qty: `${Math.ceil(g / 10)} trays` },
        { name: "Chafing dishes / hot-pots", qty: "4–5 pieces" },
        { name: "Ladles / tongs", qty: "5–6 pieces" },
      ]},
    ],
    "get-together": [
      { cat: "Entertainment", items: [
        { name: "Bluetooth speaker", qty: "1–2 speakers" },
        { name: "Extension cords", qty: "2 cords" },
        { name: "Card / board games", qty: "2–3 games" },
      ]},
      { cat: "Décor (optional)", items: [
        { name: "String lights / fairy lights", qty: "2 sets" },
        { name: "Photo corner props box", qty: "1 box" },
      ]},
    ],
    "naming-ceremony": [
      { cat: "Ceremony Items", items: [
        { name: "Marigold garlands", qty: "4–6 garlands" },
        { name: "Diyas (oil lamps)", qty: "10–15 diyas" },
        { name: "Puja thali setup", qty: "1–2 sets" },
        { name: "Banana leaves (prasad)", qty: `${Math.ceil(g / 2)} pieces` },
        { name: "Flower petals / rangoli colour", qty: "2–3 packs" },
      ]},
      { cat: "Décor", items: [
        { name: "Fabric backdrop (saffron / yellow)", qty: "1 backdrop" },
        { name: "Fairy lights", qty: "2 sets" },
        { name: "Floral centrepieces", qty: `${tables} pieces` },
      ]},
    ],
    "gender-reveal": [
      { cat: "Reveal Items", items: [
        { name: "Gender reveal box (confetti)", qty: "1 box" },
        { name: "Pink & blue balloons", qty: `${Math.ceil(g * 1.5)} balloons` },
        { name: "Gender reveal cake setup", qty: "1 cake" },
        { name: "Confetti cannons", qty: "4–6 cannons" },
      ]},
      { cat: "Décor", items: [
        { name: "Pink & blue streamers", qty: "4 rolls" },
        { name: '"He or She?" banner', qty: "1 banner" },
        { name: "Fairy lights", qty: "2 sets" },
        { name: "Photo backdrop", qty: "1 backdrop" },
      ]},
    ],
    "graduation": [
      { cat: "Décor", items: [
        { name: "Graduation balloon arch", qty: "1 arch" },
        { name: "Memory / achievement photo wall", qty: "1 display" },
        { name: "Graduation banner", qty: "1 banner" },
        { name: "Fairy lights", qty: "2 sets" },
      ]},
      { cat: "Entertainment", items: [
        { name: "Bluetooth speaker", qty: "1–2 speakers" },
        { name: "Photo booth props box", qty: "1 box" },
        { name: "Extension cord", qty: "2 cords" },
      ]},
    ],
    "farewell": [
      { cat: "Décor", items: [
        { name: "Memory photo wall", qty: "1 display" },
        { name: "Farewell banner", qty: "1 banner" },
        { name: "Flower arrangements", qty: `${tables} pieces` },
        { name: "Fairy lights", qty: "2 sets" },
      ]},
      { cat: "Keepsakes", items: [
        { name: "Memory scrapbook / card", qty: "1 book" },
        { name: "Card signing station", qty: "1 setup" },
      ]},
    ],
    "retirement": [
      { cat: "Décor", items: [
        { name: "Retirement banner", qty: "1 banner" },
        { name: "Career memory wall display", qty: "1 display" },
        { name: "Flower arrangements", qty: `${tables} pieces` },
      ]},
      { cat: "Keepsakes", items: [
        { name: "Memory book with colleague messages", qty: "1 book" },
        { name: "Framed career achievement display", qty: "1 frame" },
        { name: "Gift & card table", qty: "1 table" },
      ]},
    ],
    "newborn-welcome": [
      { cat: "Décor", items: [
        { name: "Flower arch at entrance", qty: "1 arch" },
        { name: "Soft-tone welcome balloons", qty: `${Math.ceil(g / 4)} balloons` },
        { name: "Photo corner backdrop", qty: "1 backdrop" },
        { name: "Warm fairy lights (indoor)", qty: "1–2 sets" },
      ]},
      { cat: "Comfort", items: [
        { name: "Baby-safe floor mat / blanket area", qty: "1 mat" },
        { name: "Extra chairs for elders", qty: `${Math.ceil(g * 0.3)} chairs` },
        { name: "Quiet corner setup for feeds", qty: "1 corner" },
      ]},
    ],
  };

  return [...common, ...(specific[id] || [])];
}

// ─────────────────────────────────────────────────────────────────────────────

export default function OccasionDetail() {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const [popup, setPopup]               = useState(null);
  const [activeTab, setActiveTab]       = useState("decor");
  const [checked, setChecked]           = useState({});
  const [guests, setGuests]             = useState(20);
  const [selectedTheme, setSelectedTheme] = useState(null);

  const occasion = getOccasionById(slug);
  if (!occasion) { navigate("/occasions"); return null; }

  const fmtBudget = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
  const hub = HUB_ROUTES[slug];
  const equipment = getEquipment(slug, guests);
  const tasksDone = Object.values(checked).filter(Boolean).length;
  const tasksTotal = (occasion.checklist || []).length;

  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 13, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "inline-block", width: 3, height: 14, background: "#C47A2E", borderRadius: 2 }} />
        {title}
      </h2>
      {children}
    </div>
  );

  const Card = ({ onClick, children }) => (
    <div onClick={onClick}
      style={{ background: "#fff", borderRadius: 12, padding: "13px 15px", border: "1.5px solid rgba(196,122,46,0.1)", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s, border-color 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(196,122,46,0.14)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.35)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.1)"; }}>
      {children}
    </div>
  );

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: font, background: "#F8F4EF" }}>
      <SEO title={`${occasion.name} Planning Guide — Tendr`} description={occasion.tagline} path={`/occasions/${slug}`} />

      {/* Nav */}
      <div style={{ flexShrink: 0 }}>
        <HamburgerNav active="Occasions" />
      </div>

      {/* Hero + info strip */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
          <img src={occasion.coverImage} alt={occasion.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%)" }} />
          <button onClick={() => navigate("/occasions")}
            style={{ position: "absolute", top: 14, left: 18, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 600, padding: "5px 11px", cursor: "pointer", fontFamily: font, backdropFilter: "blur(4px)" }}>
            ← All Occasions
          </button>
          <div style={{ position: "absolute", bottom: 14, left: 20 }}>
            <span style={{ fontSize: 26, marginRight: 6 }}>{occasion.icon}</span>
            <h1 style={{ fontSize: "clamp(1.1rem,3vw,1.6rem)", fontWeight: 900, color: "#fff", margin: 0, display: "inline", letterSpacing: "-0.01em" }}>{occasion.name}</h1>
            {occasion.localName && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginLeft: 8 }}>({occasion.localName})</span>}
          </div>
        </div>

        <div style={{ background: "#F8F4EF", padding: "12px 20px 10px", borderBottom: "1px solid rgba(196,122,46,0.12)" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            {[
              { icon: "👥", val: occasion.typicalGuests + " guests" },
              { icon: "💰", val: `${fmtBudget(occasion.budgetMin)} – ${fmtBudget(occasion.budgetMax)}` },
            ].map(({ icon, val }) => (
              <span key={val} style={{ fontSize: 11, fontWeight: 600, color: "#5a3a1a", background: "#fff", border: "1.5px solid rgba(196,122,46,0.15)", borderRadius: 100, padding: "3px 10px" }}>
                {icon} {val}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {occasion.vendorCategories.map((cat, i) => (
              <button key={cat} onClick={() => navigate(`/listings?serviceType=${cat}`)}
                style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: i === 0 ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "rgba(196,122,46,0.12)", color: i === 0 ? "#fff" : "#C47A2E", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                {cat} →
              </button>
            ))}
            <button onClick={() => navigate("/gift-hampers-cakes")}
              style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              Gift Hampers →
            </button>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1.5px solid rgba(196,122,46,0.12)", background: "#F8F4EF", flexShrink: 0, overflowX: "auto", scrollbarWidth: "none" }}>
        {[
          { id: "decor",      icon: "🎨", label: "Décor",      count: occasion.decorThemes.length },
          { id: "gifts",      icon: "🎁", label: "Gifts",      count: occasion.giftIdeas.length },
          { id: "activities", icon: "🎯", label: "Activities",  count: occasion.activities.length },
          { id: "checklist",  icon: "✅", label: "Plan",        count: tasksTotal },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            padding: "10px 4px 8px", border: "none", background: "transparent", cursor: "pointer",
            fontFamily: font, borderBottom: `2.5px solid ${activeTab === t.id ? "#C47A2E" : "transparent"}`,
            transition: "border-color 0.18s", minWidth: 68, whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: activeTab === t.id ? 800 : 500, color: activeTab === t.id ? "#C47A2E" : "#9B7450" }}>{t.label}</span>
            <span style={{ fontSize: 9, color: "rgba(196,122,46,0.5)", fontWeight: 600 }}>({t.count})</span>
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px 16px" }}>

        {/* ── Décor tab ── */}
        {activeTab === "decor" && (
          <Section title="Décor Themes">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
              {occasion.decorThemes.map((t, i) => (
                <Card key={i} onClick={() => setPopup({ type: "decor", item: t })}>
                  {selectedTheme === t.name && (
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", marginBottom: 4 }}>✓ YOUR THEME</div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 3 }}>{t.name}</div>
                  <div style={{ fontSize: 11.5, color: "#9B7450", lineHeight: 1.45, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.desc}</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {(t.tags || []).slice(0, 3).map(tag => (
                      <span key={tag} style={{ fontSize: 10, fontWeight: 600, color: "#C47A2E", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "2px 6px" }}>#{tag}</span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* ── Gifts tab ── */}
        {activeTab === "gifts" && (
          <Section title="Gift Ideas">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
              {occasion.giftIdeas.map((g, i) => (
                <Card key={i} onClick={() => setPopup({ type: "gift", item: g })}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>🎁</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 2 }}>{g.name}</div>
                      <div style={{ fontSize: 11.5, color: "#9B7450", lineHeight: 1.4, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{g.desc}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E" }}>{g.price}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* ── Activities tab ── */}
        {activeTab === "activities" && (
          <Section title="Activities">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
              {occasion.activities.map((a, i) => (
                <Card key={i} onClick={() => setPopup({ type: "activity", item: a })}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 3 }}>{a.name}</div>
                  <div style={{ fontSize: 11.5, color: "#9B7450", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{a.desc}</div>
                </Card>
              ))}
            </div>
          </Section>
        )}

        {/* ── Plan tab ── */}
        {activeTab === "checklist" && (
          <>
            {/* Celebration Blueprint card */}
            <div style={{ background: "linear-gradient(135deg,#FFF8F0,#FFFDF9)", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 16, padding: "16px 18px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>📋 Your Celebration Blueprint</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(196,122,46,0.1)" }}>
                  <div style={{ fontSize: 10, color: "#9B7450", fontWeight: 600, marginBottom: 3 }}>OCCASION</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E" }}>{occasion.icon} {occasion.name}</div>
                </div>
                <div style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(196,122,46,0.1)" }}>
                  <div style={{ fontSize: 10, color: "#9B7450", fontWeight: 600, marginBottom: 3 }}>THEME</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: selectedTheme ? "#C47A2E" : "#9B7450" }}>
                    {selectedTheme || <span style={{ fontStyle: "italic", fontWeight: 400, fontSize: 12 }}>Pick from Décor tab</span>}
                  </div>
                </div>
                <div style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(196,122,46,0.1)" }}>
                  <div style={{ fontSize: 10, color: "#9B7450", fontWeight: 600, marginBottom: 3 }}>GUESTS</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E" }}>{guests} people</div>
                </div>
                <div style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(196,122,46,0.1)" }}>
                  <div style={{ fontSize: 10, color: "#9B7450", fontWeight: 600, marginBottom: 3 }}>BUDGET RANGE</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#2C1A0E" }}>{fmtBudget(occasion.budgetMin)} – {fmtBudget(occasion.budgetMax)}</div>
                </div>
              </div>
              {tasksDone > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#9B7450" }}>Planning progress</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E" }}>{tasksDone}/{tasksTotal} done</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(196,122,46,0.12)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(tasksDone / tasksTotal) * 100}%`, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 4, transition: "width 0.3s" }} />
                  </div>
                </div>
              )}
              <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10, color: "#9B7450" }}>Vendors needed:</span>
                {occasion.vendorCategories.map(cat => (
                  <span key={cat} onClick={() => navigate(`/listings?serviceType=${cat}`)} style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "2px 8px", cursor: "pointer" }}>{cat} →</span>
                ))}
              </div>
            </div>

            {/* Guest count stepper */}
            <Section title="How many guests?">
              <div style={{ display: "flex", alignItems: "center", gap: 16, background: "#fff", borderRadius: 12, padding: "14px 18px", border: "1.5px solid rgba(196,122,46,0.1)" }}>
                <button onClick={() => setGuests(g => Math.max(5, g - 5))}
                  style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.2)", background: "#F8F4EF", color: "#C47A2E", fontSize: 18, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#2C1A0E" }}>{guests}</div>
                  <div style={{ fontSize: 11, color: "#9B7450" }}>guests · equipment updates below</div>
                </div>
                <button onClick={() => setGuests(g => g + 5)}
                  style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
            </Section>

            {/* Planning checklist */}
            <Section title="Planning checklist">
              {(occasion.checklist || []).map((item, i) => (
                <div key={i} onClick={() => setChecked(c => ({ ...c, [i]: !c[i] }))}
                  style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: checked[i] ? "rgba(196,122,46,0.05)" : "#fff", borderRadius: 12, border: `1.5px solid ${checked[i] ? "rgba(196,122,46,0.2)" : "rgba(196,122,46,0.1)"}`, marginBottom: 7, cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${checked[i] ? "#C47A2E" : "rgba(196,122,46,0.3)"}`, background: checked[i] ? "#C47A2E" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1, transition: "all 0.15s" }}>
                    {checked[i] && <span style={{ color: "#fff", fontSize: 11, lineHeight: 1 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 13, color: checked[i] ? "#9B7450" : "#2C1A0E", textDecoration: checked[i] ? "line-through" : "none", lineHeight: 1.5, transition: "all 0.15s" }}>{item}</span>
                </div>
              ))}
            </Section>

            {/* Equipment generator */}
            <Section title={`What to arrange · ${guests} guests`}>
              <p style={{ fontSize: 12, color: "#9B7450", marginBottom: 14, lineHeight: 1.5 }}>
                Quantities update as you change the guest count above. These are estimates — adjust to your venue.
              </p>
              {equipment.map(({ cat, items }) => (
                <div key={cat} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 7 }}>{cat}</div>
                  {items.map(({ name, qty }) => (
                    <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 13px", background: "#fff", borderRadius: 9, marginBottom: 5, border: "1px solid rgba(196,122,46,0.08)" }}>
                      <span style={{ fontSize: 13, color: "#2C1A0E" }}>{name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#C47A2E", flexShrink: 0, marginLeft: 8 }}>{qty}</span>
                    </div>
                  ))}
                </div>
              ))}
            </Section>
          </>
        )}

      </div>

      {/* ── Party Day Hub banner ── */}
      {hub && (
        <div
          onClick={() => navigate(hub.route)}
          style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 20px", background: "linear-gradient(135deg,#1a0a2e,#2d1060)", borderTop: "1px solid rgba(124,58,237,0.2)", cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{hub.emoji}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>It's party day?</div>
              <div style={{ fontSize: 11, color: "rgba(167,139,250,0.8)", marginTop: 1 }}>Games, playlists, bill split & more</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(124,58,237,0.35)", border: "1px solid rgba(124,58,237,0.5)", borderRadius: 8, padding: "7px 12px" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#C4B5FD" }}>Open {hub.label}</span>
            <span style={{ color: "#C4B5FD", fontSize: 12 }}>→</span>
          </div>
        </div>
      )}

      {/* Popup Modal */}
      {popup && (
        <>
          <div onClick={() => setPopup(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9998, backdropFilter: "blur(3px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 9999, background: "#FFFCF5", borderRadius: 20, padding: "26px 24px", maxWidth: 440, width: "90%", maxHeight: "80dvh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", fontFamily: font }}>
            <button onClick={() => setPopup(null)}
              style={{ position: "absolute", top: 14, right: 14, background: "#f3f4f6", border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
              ✕
            </button>

            {popup.type === "decor" && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>🎨 Décor Theme</div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#2C1A0E", margin: "0 0 10px" }}>{popup.item.name}</h3>
                <p style={{ fontSize: 14, color: "#5a3a1a", lineHeight: 1.7, margin: "0 0 14px" }}>{popup.item.desc}</p>
                {(popup.item.tags || []).length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
                    {popup.item.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", background: "rgba(196,122,46,0.1)", borderRadius: 100, padding: "3px 10px" }}>#{tag}</span>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => { setSelectedTheme(popup.item.name); setPopup(null); setActiveTab("checklist"); }}
                    style={{ padding: "10px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, flex: 1 }}>
                    {selectedTheme === popup.item.name ? "✓ Theme selected" : "Use this theme →"}
                  </button>
                  <button onClick={() => { setPopup(null); navigate("/listings?serviceType=Decorator"); }}
                    style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    Find Decorators
                  </button>
                </div>
              </>
            )}

            {popup.type === "gift" && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>🎁 Gift Idea</div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#2C1A0E", margin: "0 0 6px" }}>{popup.item.name}</h3>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#C47A2E", marginBottom: 10 }}>{popup.item.price}</div>
                <p style={{ fontSize: 14, color: "#5a3a1a", lineHeight: 1.7, margin: "0 0 18px" }}>{popup.item.desc}</p>
                <button onClick={() => { setPopup(null); navigate("/gift-hampers-cakes"); }}
                  style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, width: "100%" }}>
                  Browse Gift Hampers →
                </button>
              </>
            )}

            {popup.type === "activity" && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>🎯 Activity</div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#2C1A0E", margin: "0 0 10px" }}>{popup.item.name}</h3>
                <p style={{ fontSize: 14, color: "#5a3a1a", lineHeight: 1.7, margin: "0 0 18px" }}>{popup.item.desc}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {occasion.vendorCategories.map(cat => (
                    <button key={cat} onClick={() => { setPopup(null); navigate(`/listings?serviceType=${cat}`); }}
                      style={{ padding: "9px 14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                      Find {cat} →
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

    </div>
  );
}
