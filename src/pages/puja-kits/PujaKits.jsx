// src/pages/puja-kits/PujaKits.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";

/* ─── design tokens ─────────────────────────────────────────── */
const gold   = "#C47A2E";
const goldLt = "#D4A848";
const ink    = "#1C0900";
const cream  = "#FFF8EC";
const f      = "'Outfit', 'Inter', sans-serif";
const ser    = "'Cormorant Garamond', Georgia, serif";

/* ─── data ───────────────────────────────────────────────────── */
const PUJA_CATEGORIES = [
  {
    group: "Popular Pujas",
    items: [
      { id: "satyanarayan",   name: "Satyanarayan Puja",   icon: "🪔", desc: "Prosperity & blessings" },
      { id: "griha-pravesh",  name: "Griha Pravesh",       icon: "🏠", desc: "New home ceremony" },
      { id: "ganesh-puja",    name: "Ganesh Puja",         icon: "🐘", desc: "New beginnings" },
      { id: "lakshmi-puja",   name: "Lakshmi Puja",        icon: "✨", desc: "Wealth & abundance" },
      { id: "havan",          name: "Havan",               icon: "🔥", desc: "Sacred fire ceremony" },
      { id: "rudrabhishek",   name: "Rudrabhishek",        icon: "🙏", desc: "Shiva worship ritual" },
      { id: "navgraha-puja",  name: "Navgraha Puja",       icon: "⭐", desc: "Planetary harmony" },
      { id: "sundarkand",     name: "Sundarkand",          icon: "📖", desc: "Ramayan recitation" },
    ],
  },
  {
    group: "Family Ceremonies",
    items: [
      { id: "mundan",         name: "Mundan",              icon: "✂️", desc: "First hair ceremony" },
      { id: "naamkaran",      name: "Naamkaran",           icon: "👶", desc: "Naming ceremony" },
      { id: "annaprashan",    name: "Annaprashan",         icon: "🍚", desc: "First food ceremony" },
      { id: "birthday-puja",  name: "Birthday Puja",       icon: "🎂", desc: "Birthday blessings" },
      { id: "anniversary",    name: "Anniversary Puja",    icon: "💑", desc: "Marriage anniversary" },
    ],
  },
  {
    group: "Festivals",
    items: [
      { id: "diwali",         name: "Diwali",              icon: "🪔", desc: "Festival of lights" },
      { id: "ganesh-chaturthi", name: "Ganesh Chaturthi", icon: "🐘", desc: "10-day festival" },
      { id: "janmashtami",    name: "Janmashtami",         icon: "🦚", desc: "Krishna's birthday" },
      { id: "navratri",       name: "Navratri",            icon: "🌸", desc: "Nine nights" },
      { id: "karwa-chauth",   name: "Karwa Chauth",        icon: "🌕", desc: "Fast for spouse" },
      { id: "chhath-puja",    name: "Chhath Puja",         icon: "☀️", desc: "Sun worship" },
      { id: "raksha-bandhan", name: "Raksha Bandhan",      icon: "🪢", desc: "Brother-sister bond" },
    ],
  },
];

const GUEST_OPTIONS = [
  { label: "1–10", value: "1-10",   multiplier: 1.0 },
  { label: "10–25", value: "10-25",  multiplier: 1.4 },
  { label: "25–50", value: "25-50",  multiplier: 1.9 },
  { label: "50–100", value: "50-100", multiplier: 2.8 },
  { label: "100+", value: "100+",   multiplier: 4.2 },
];

const KIT_TYPES = [
  {
    id: "essential",
    name: "Essential Kit",
    tag: null,
    tagline: "Everything required. Nothing extra.",
    features: [
      "All required puja samagri",
      "Basic accurate quantities",
      "Organized labeled packets",
      "Puja checklist included",
    ],
    basePrice: 799,
    bg: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.1)",
    cta: "Get Essential Kit",
  },
  {
    id: "complete",
    name: "Complete Kit",
    tag: "Most Popular",
    tagline: "Don't worry about missing anything.",
    features: [
      "All essential samagri + extras",
      "Exact quantities per guest count",
      "Premium labeled packaging",
      "Puja checklist + guide booklet",
      "Preparation instructions",
      "Clearly sectioned Tendr box",
    ],
    basePrice: 1099,
    bg: `${gold}12`,
    border: `${gold}40`,
    cta: "Get Complete Kit",
  },
  {
    id: "pandit",
    name: "Pandit's Kit",
    tag: null,
    tagline: "Your Pandit's list. Your exact kit.",
    features: [
      "Upload pandit's samagri list",
      "Item-by-item matching",
      "Substitute suggestions if unavailable",
      "Quantity verification",
      "Custom assembly",
    ],
    basePrice: null,
    bg: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.1)",
    cta: "Upload Pandit's List",
  },
];

const ADDONS = [
  { id: "pandit",      name: "Pandit",          icon: "🙏", desc: "Book a verified Pandit",          price: 1500 },
  { id: "flowers",     name: "Fresh Flowers",   icon: "🌸", desc: "Seasonal fresh flowers",           price: 299  },
  { id: "prasad",      name: "Prasad",          icon: "🍮", desc: "Traditional sweets & prasad",      price: 199  },
  { id: "decoration",  name: "Decoration",      icon: "🏵️", desc: "Puja & home decoration",          price: 999  },
  { id: "photography", name: "Photography",     icon: "📷", desc: "Book a photographer",              price: 1999 },
  { id: "seating",     name: "Seating",         icon: "🪑", desc: "Chairs, mats & setup",            price: 599  },
];

const KIT_CONTENTS = {
  "griha-pravesh": [
    { section: "Puja Essentials", items: ["Roli", "Kumkum", "Chawal", "Moli", "Chandan", "Sindoor", "Agarbatti", "Kapoor"] },
    { section: "Kalash",          items: ["Kalash", "Coconut", "Mango leaves", "Gangajal", "Panchamrit"] },
    { section: "Havan",           items: ["Havan Samagri", "Desi Ghee", "Aam ki Lakdi", "Kapoor", "Lal Kapda"] },
    { section: "Offerings",       items: ["5 Fresh Fruits", "Dry Fruits Mix", "Fresh Flowers", "Mishri", "Shakkar"] },
    { section: "Extra Items",     items: ["Doob Grass", "Janeu", "Durva", "Puja Thali", "Supari"] },
  ],
  default: [
    { section: "Puja Essentials", items: ["Roli", "Kumkum", "Chawal", "Moli", "Chandan", "Agarbatti", "Kapoor"] },
    { section: "Kalash",          items: ["Kalash", "Coconut", "Mango leaves", "Moli"] },
    { section: "Offerings",       items: ["Fresh Fruits", "Dry Fruits", "Fresh Flowers", "Mishri"] },
    { section: "Extra Items",     items: ["Puja Thali", "Supari", "Janeu", "Durva"] },
  ],
};

/* ─── small utilities ────────────────────────────────────────── */
const btn = (bg, color = cream, border = "none") => ({
  background: bg, color, border, borderRadius: 12, fontFamily: f,
  fontWeight: 600, cursor: "pointer", transition: "all 0.18s",
});

const card = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
};

function getPujaById(id) {
  for (const cat of PUJA_CATEGORIES) {
    const found = cat.items.find(p => p.id === id);
    if (found) return found;
  }
  return null;
}

function getPrice(basePrice, guests) {
  const opt = GUEST_OPTIONS.find(g => g.value === guests);
  const m = opt ? opt.multiplier : 1;
  return Math.round(basePrice * m);
}

/* ─── step indicator ─────────────────────────────────────────── */
const STEPS = ["Puja", "Details", "Kit", "Add-ons", "Summary"];

function StepBar({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 32, padding: "0 24px" }}>
      {STEPS.map((label, i) => (
        <React.Fragment key={i}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: i < current ? gold : i === current ? `${gold}22` : "rgba(255,255,255,0.07)",
              border: `2px solid ${i <= current ? gold : "rgba(255,255,255,0.12)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
              color: i < current ? "#fff" : i === current ? gold : "rgba(255,255,255,0.35)",
              transition: "all 0.3s",
            }}>
              {i < current
                ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                : i + 1}
            </div>
            <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: i <= current ? gold : "rgba(255,255,255,0.3)", fontFamily: f, whiteSpace: "nowrap" }}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < current ? gold : "rgba(255,255,255,0.08)", transition: "background 0.4s", margin: "0 4px", marginBottom: 18 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─── STEP 1: puja selection ─────────────────────────────────── */
function StepSelectPuja({ onSelect }) {
  const [search, setSearch] = useState("");
  const filtered = search.trim()
    ? PUJA_CATEGORIES.map(c => ({ ...c, items: c.items.filter(p => p.name.toLowerCase().includes(search.toLowerCase())) })).filter(c => c.items.length > 0)
    : PUJA_CATEGORIES;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h2 style={{ fontFamily: ser, fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 400, color: cream, margin: "0 0 6px", textAlign: "center" }}>Which Puja are you planning?</h2>
      <p style={{ fontSize: 14, color: "rgba(255,248,236,0.5)", textAlign: "center", margin: "0 0 24px", fontFamily: f }}>Select your occasion to get a perfectly assembled kit</p>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 400, margin: "0 auto 28px" }}>
        <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,248,236,0.35)" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search puja..." style={{ width: "100%", padding: "12px 16px 12px 42px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: cream, fontFamily: f, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
      </div>

      {filtered.map(cat => (
        <div key={cat.group} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 14, fontFamily: f }}>{cat.group}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {cat.items.map(puja => (
              <motion.button
                key={puja.id}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(puja)}
                style={{ ...card, border: "1px solid rgba(255,255,255,0.08)", padding: "16px 12px", cursor: "pointer", textAlign: "left", fontFamily: f, display: "flex", flexDirection: "column", gap: 6, transition: "all 0.18s" }}
              >
                <span style={{ fontSize: 24 }}>{puja.icon}</span>
                <div style={{ fontSize: 13, fontWeight: 700, color: cream, lineHeight: 1.25 }}>{puja.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,248,236,0.45)", lineHeight: 1.3 }}>{puja.desc}</div>
              </motion.button>
            ))}
          </div>
        </div>
      ))}

      {/* Custom puja CTA */}
      <div style={{ marginTop: 8, padding: "20px 20px", borderRadius: 14, border: `1.5px dashed ${gold}44`, background: `${gold}08`, textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: cream, marginBottom: 4, fontFamily: f }}>Can't find your Puja?</div>
        <div style={{ fontSize: 12, color: "rgba(255,248,236,0.45)", marginBottom: 14, fontFamily: f }}>Tell us what you need and we'll build a custom kit</div>
        <button
          onClick={() => onSelect({ id: "custom", name: "Custom Puja", icon: "✨", desc: "Custom samagri kit" })}
          style={{ ...btn(`${gold}22`, gold), border: `1px solid ${gold}44`, padding: "10px 24px", fontSize: 13 }}
        >
          Create Custom Kit →
        </button>
      </div>
    </motion.div>
  );
}

/* ─── STEP 2: requirements ───────────────────────────────────── */
function StepRequirements({ puja, data, onChange, onNext, onBack }) {
  const [pandit, setPandit] = useState(data.pandit || null);
  const [guests, setGuests] = useState(data.guests || "");
  const [date, setDate] = useState(data.date || "");
  const [city, setCity] = useState(data.city || "");
  const [notes, setNotes] = useState(data.notes || "");

  const ready = guests && date && city;

  const submit = () => {
    onChange({ pandit, guests, date, city, notes });
    onNext();
  };

  const inp = {
    width: "100%", padding: "12px 14px", borderRadius: 12,
    border: "1.5px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)", color: cream,
    fontFamily: f, fontSize: 14, outline: "none", boxSizing: "border-box",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 28 }}>{puja.icon}</span>
        <div>
          <h2 style={{ fontFamily: ser, fontSize: "clamp(1.3rem,2.5vw,1.7rem)", fontWeight: 400, color: cream, margin: 0 }}>Tell us about your {puja.name}</h2>
          <p style={{ fontSize: 13, color: "rgba(255,248,236,0.45)", margin: "4px 0 0", fontFamily: f }}>We'll prepare the right quantities for your ceremony</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {/* Guest count */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontFamily: f }}>Number of People</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {GUEST_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setGuests(opt.value)}
                style={{ padding: "9px 16px", borderRadius: 10, border: `1.5px solid ${guests === opt.value ? gold : "rgba(255,255,255,0.1)"}`, background: guests === opt.value ? `${gold}22` : "rgba(255,255,255,0.04)", color: guests === opt.value ? gold : "rgba(255,248,236,0.6)", fontFamily: f, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontFamily: f }}>Puja Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ ...inp }} min={new Date().toISOString().split("T")[0]} />
        </div>

        {/* City */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontFamily: f }}>Delivery Location</label>
          <input value={city} onChange={e => setCity(e.target.value)} placeholder="Delhi, Noida, Gurgaon…" style={{ ...inp }} />
        </div>

        {/* Pandit */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontFamily: f }}>Pandit Arranged?</label>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ v: true, l: "Yes, I have a Pandit" }, { v: false, l: "No, I need one" }].map(({ v, l }) => (
              <button
                key={String(v)}
                onClick={() => setPandit(v)}
                style={{ flex: 1, padding: "11px 12px", borderRadius: 10, border: `1.5px solid ${pandit === v ? gold : "rgba(255,255,255,0.1)"}`, background: pandit === v ? `${gold}22` : "rgba(255,255,255,0.04)", color: pandit === v ? gold : "rgba(255,248,236,0.6)", fontFamily: f, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontFamily: f }}>Special Requirements <span style={{ fontWeight: 400, color: "rgba(255,248,236,0.35)", textTransform: "none", letterSpacing: 0 }}>(optional)</span></label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="E.g. Jain samagri only, no onion/garlic in prasad, specific flowers needed…" rows={3} style={{ ...inp, resize: "vertical", lineHeight: 1.55 }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <button onClick={onBack} style={{ ...btn("rgba(255,255,255,0.07)", "rgba(255,248,236,0.7)"), padding: "13px 20px", fontSize: 14, flex: 1 }}>← Back</button>
        <button onClick={submit} disabled={!ready} style={{ ...btn(ready ? `linear-gradient(135deg,${gold},${goldLt})` : "rgba(255,255,255,0.08)", ready ? "#fff" : "rgba(255,248,236,0.3)"), padding: "13px 20px", fontSize: 14, flex: 2, boxShadow: ready ? `0 4px 20px ${gold}44` : "none" }}>
          Choose Kit Type →
        </button>
      </div>
    </motion.div>
  );
}

/* ─── STEP 3: kit type ───────────────────────────────────────── */
function StepKitType({ puja, details, selected, onSelect, onNext, onBack }) {
  const contents = KIT_CONTENTS[puja.id] || KIT_CONTENTS.default;
  const [panditText, setPanditText] = useState("");
  const [panditItems, setPanditItems] = useState([]);
  const [panditParsed, setPanditParsed] = useState(false);

  const parseList = () => {
    const lines = panditText.split(/[\n,،]/g).map(l => l.trim()).filter(Boolean);
    setPanditItems(lines.slice(0, 40));
    setPanditParsed(true);
  };

  const price = (base) => base ? `₹${getPrice(base, details.guests).toLocaleString("en-IN")}` : "Custom";

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h2 style={{ fontFamily: ser, fontSize: "clamp(1.3rem,2.5vw,1.7rem)", fontWeight: 400, color: cream, margin: "0 0 6px", textAlign: "center" }}>Choose your Kit</h2>
      <p style={{ fontSize: 14, color: "rgba(255,248,236,0.45)", textAlign: "center", margin: "0 0 24px", fontFamily: f }}>All kits include <strong style={{ color: cream }}>{contents.reduce((n, s) => n + s.items.length, 0)} items</strong> for {details.guests} people</p>

      <div style={{ display: "grid", gap: 14, marginBottom: 24 }}>
        {KIT_TYPES.map(kit => (
          <motion.div
            key={kit.id}
            whileHover={{ scale: 1.01 }}
            onClick={() => onSelect(kit.id)}
            style={{ ...card, background: selected === kit.id ? kit.bg.replace("12", "18") : kit.bg, border: `1.5px solid ${selected === kit.id ? gold : kit.border}`, padding: "18px 18px", cursor: "pointer", position: "relative", transition: "all 0.18s" }}
          >
            {kit.tag && (
              <div style={{ position: "absolute", top: -10, left: 18, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 100, fontFamily: f }}>
                {kit.tag}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: cream, fontFamily: f, marginBottom: 3 }}>{kit.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,248,236,0.5)", fontFamily: f }}>{kit.tagline}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: selected === kit.id ? gold : cream, fontFamily: f }}>{price(kit.basePrice)}</div>
                {kit.basePrice && <div style={{ fontSize: 10, color: "rgba(255,248,236,0.35)", fontFamily: f }}>+ delivery</div>}
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {kit.features.map(feat => (
                <div key={feat} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: selected === kit.id ? "rgba(255,248,236,0.8)" : "rgba(255,248,236,0.5)", fontFamily: f }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={selected === kit.id ? gold : "rgba(255,248,236,0.35)"} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  {feat}
                </div>
              ))}
            </div>

            {/* Pandit list upload — only when pandit kit selected */}
            {kit.id === "pandit" && selected === "pandit" && (
              <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14 }} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: 12, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: f }}>Enter Pandit's Samagri List</div>
                <textarea
                  value={panditText}
                  onChange={e => { setPanditText(e.target.value); setPanditParsed(false); }}
                  placeholder={"Roli, Kumkum, Chawal, Moli…\n(one per line or comma-separated)"}
                  rows={4}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: cream, fontFamily: f, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.55 }}
                />
                <button onClick={parseList} disabled={!panditText.trim()} style={{ ...btn(panditText.trim() ? `${gold}22` : "rgba(255,255,255,0.04)", panditText.trim() ? gold : "rgba(255,248,236,0.3)"), border: `1px solid ${panditText.trim() ? gold + "55" : "rgba(255,255,255,0.07)"}`, padding: "9px 18px", fontSize: 12, marginTop: 8 }}>
                  Parse List
                </button>
                {panditParsed && panditItems.length > 0 && (
                  <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 10, background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.18)" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#34D399", marginBottom: 8, fontFamily: f }}>✓ We found {panditItems.length} items in your list</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {panditItems.map((item, i) => (
                        <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, background: "rgba(52,211,153,0.1)", color: "#34D399", fontFamily: f }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* What's inside */}
      <div style={{ ...card, padding: "18px 18px", marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: cream, marginBottom: 14, fontFamily: f }}>What's Inside — {contents.reduce((n, s) => n + s.items.length, 0)} items</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
          {contents.map((sec, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: gold, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8, fontFamily: f }}>0{i + 1} — {sec.section}</div>
              {sec.items.map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: gold, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "rgba(255,248,236,0.65)", fontFamily: f }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ ...btn("rgba(255,255,255,0.07)", "rgba(255,248,236,0.7)"), padding: "13px 20px", fontSize: 14, flex: 1 }}>← Back</button>
        <button onClick={onNext} disabled={!selected} style={{ ...btn(selected ? `linear-gradient(135deg,${gold},${goldLt})` : "rgba(255,255,255,0.08)", selected ? "#fff" : "rgba(255,248,236,0.3)"), padding: "13px 20px", fontSize: 14, flex: 2, boxShadow: selected ? `0 4px 20px ${gold}44` : "none" }}>
          Continue →
        </button>
      </div>
    </motion.div>
  );
}

/* ─── STEP 4: add-ons ────────────────────────────────────────── */
function StepAddons({ details, selected, onToggle, onNext, onBack }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h2 style={{ fontFamily: ser, fontSize: "clamp(1.3rem,2.5vw,1.7rem)", fontWeight: 400, color: cream, margin: "0 0 6px", textAlign: "center" }}>Complete Your Puja</h2>
      <p style={{ fontSize: 14, color: "rgba(255,248,236,0.45)", textAlign: "center", margin: "0 0 24px", fontFamily: f }}>Optional additions — your kit is great on its own too</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 28 }}>
        {ADDONS.map(addon => {
          const active = selected.includes(addon.id);
          return (
            <motion.button
              key={addon.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onToggle(addon.id)}
              style={{ ...card, padding: "16px 14px", cursor: "pointer", textAlign: "left", fontFamily: f, border: `1.5px solid ${active ? gold : "rgba(255,255,255,0.08)"}`, background: active ? `${gold}12` : "rgba(255,255,255,0.04)", transition: "all 0.18s", position: "relative" }}
            >
              {active && (
                <div style={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, borderRadius: "50%", background: gold, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
              )}
              <span style={{ fontSize: 24, display: "block", marginBottom: 8 }}>{addon.icon}</span>
              <div style={{ fontSize: 13, fontWeight: 700, color: cream, marginBottom: 3 }}>{addon.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,248,236,0.45)", marginBottom: 8, lineHeight: 1.35 }}>{addon.desc}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: active ? gold : "rgba(255,248,236,0.5)" }}>₹{addon.price.toLocaleString("en-IN")}</div>
            </motion.button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div style={{ padding: "12px 16px", borderRadius: 12, background: `${gold}10`, border: `1px solid ${gold}22`, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "rgba(255,248,236,0.7)", fontFamily: f }}>{selected.length} service{selected.length > 1 ? "s" : ""} added</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: gold, fontFamily: f }}>+₹{selected.reduce((t, id) => t + (ADDONS.find(a => a.id === id)?.price || 0), 0).toLocaleString("en-IN")}</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ ...btn("rgba(255,255,255,0.07)", "rgba(255,248,236,0.7)"), padding: "13px 20px", fontSize: 14, flex: 1 }}>← Back</button>
        <button onClick={onNext} style={{ ...btn(`linear-gradient(135deg,${gold},${goldLt})`, "#fff"), padding: "13px 20px", fontSize: 14, flex: 2, boxShadow: `0 4px 20px ${gold}44` }}>
          {selected.length > 0 ? "Review Order →" : "Continue with Kit Only →"}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── STEP 5: summary ────────────────────────────────────────── */
function StepSummary({ puja, details, kitId, addons, onBack, onOrder }) {
  const kit = KIT_TYPES.find(k => k.id === kitId);
  const kitPrice = kit?.basePrice ? getPrice(kit.basePrice, details.guests) : 0;
  const addonTotal = addons.reduce((t, id) => t + (ADDONS.find(a => a.id === id)?.price || 0), 0);
  const delivery = 100;
  const assembly = kitId === "pandit" ? 150 : 0;
  const total = kitPrice + addonTotal + delivery + assembly;

  const selectedAddons = ADDONS.filter(a => addons.includes(a.id));

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <h2 style={{ fontFamily: ser, fontSize: "clamp(1.3rem,2.5vw,1.7rem)", fontWeight: 400, color: cream, margin: "0 0 24px", textAlign: "center" }}>Your Order Summary</h2>

      {/* Puja kit */}
      <div style={{ ...card, padding: "18px 18px", marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: gold, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12, fontFamily: f }}>Your Puja Kit</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 22 }}>{puja.icon}</span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: cream, fontFamily: f }}>{puja.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,248,236,0.5)", fontFamily: f }}>{kit?.name} · {details.guests} people</div>
              </div>
            </div>
            {details.date && <div style={{ fontSize: 12, color: "rgba(255,248,236,0.4)", fontFamily: f }}>📅 {details.date} · 📍 {details.city}</div>}
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: gold, fontFamily: f, flexShrink: 0, marginLeft: 12 }}>
            {kit?.basePrice ? `₹${kitPrice.toLocaleString("en-IN")}` : "Custom"}
          </div>
        </div>
      </div>

      {/* Add-ons */}
      {selectedAddons.length > 0 && (
        <div style={{ ...card, padding: "18px 18px", marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: gold, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12, fontFamily: f }}>Optional Services</div>
          {selectedAddons.map(addon => (
            <div key={addon.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span>{addon.icon}</span>
                <span style={{ fontSize: 13, color: "rgba(255,248,236,0.7)", fontFamily: f }}>{addon.name}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: cream, fontFamily: f }}>₹{addon.price.toLocaleString("en-IN")}</span>
            </div>
          ))}
          {[{ l: "Not added", id: "" }].filter(() => false).concat(ADDONS.filter(a => !addons.includes(a.id)).map(a => ({ ...a, not: true }))).slice(0, 0).map(() => null)}
        </div>
      )}

      {/* Price breakdown */}
      <div style={{ ...card, padding: "18px 18px", marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: gold, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14, fontFamily: f }}>Price Breakdown</div>
        {[
          { label: "Kit", value: kitPrice ? `₹${kitPrice.toLocaleString("en-IN")}` : "Custom" },
          ...(assembly ? [{ label: "Custom Assembly", value: `₹${assembly}` }] : []),
          ...(addonTotal ? [{ label: "Services", value: `₹${addonTotal.toLocaleString("en-IN")}` }] : []),
          { label: "Delivery", value: `₹${delivery}` },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13, color: "rgba(255,248,236,0.6)", fontFamily: f }}>
            <span>{row.label}</span><span>{row.value}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0", fontSize: 18, fontWeight: 800, color: cream, fontFamily: f }}>
          <span>Total</span><span style={{ color: gold }}>₹{total.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Trust markers */}
      <div style={{ ...card, padding: "16px 18px", marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: cream, marginBottom: 12, fontFamily: f }}>Quality Guarantee</div>
        {["Required items verified", "Exact quantities packed", "Packets organized & labeled", "Puja guide included", "Final quality check before dispatch"].map(item => (
          <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            <span style={{ fontSize: 12.5, color: "rgba(255,248,236,0.65)", fontFamily: f }}>{item}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ ...btn("rgba(255,255,255,0.07)", "rgba(255,248,236,0.7)"), padding: "13px 20px", fontSize: 14, flex: 1 }}>← Back</button>
        <button onClick={onOrder} style={{ ...btn(`linear-gradient(135deg,${gold},${goldLt})`, "#fff"), padding: "13px 20px", fontSize: 15, flex: 2, boxShadow: `0 4px 24px ${gold}55` }}>
          Place Order →
        </button>
      </div>
    </motion.div>
  );
}

/* ─── LANDING: hero + how it works ───────────────────────────── */
function LandingView({ onStart, onUploadList }) {
  const HOW = [
    { n: "01", title: "Choose Your Puja", desc: "Select the ritual or festival you're celebrating." },
    { n: "02", title: "Tell Us Your Requirements", desc: "Guest count, date and delivery location." },
    { n: "03", title: "Get Your Kit", desc: "Everything organized and packed in a labeled Tendr box." },
    { n: "04", title: "Celebrate", desc: "Follow the guide or add a Pandit and other services." },
  ];

  const PUJAS_SAMPLE = ["Satyanarayan Puja", "Griha Pravesh", "Ganesh Puja", "Lakshmi Puja", "Diwali", "Navratri", "Janmashtami", "Mundan", "Karwa Chauth"];

  return (
    <div>
      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", padding: "80px 24px 72px", textAlign: "center" }}>
        {/* ambient glow */}
        <div style={{ position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, borderRadius: "50%", background: `radial-gradient(ellipse, ${gold}18 0%, transparent 65%)`, pointerEvents: "none" }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${gold}15`, border: `1px solid ${gold}30`, borderRadius: 100, padding: "5px 16px", marginBottom: 22 }}>
            <span style={{ fontSize: 12 }}>🪔</span>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: f }}>Tendr Puja Kits</span>
          </div>

          <h1 style={{ fontFamily: ser, fontSize: "clamp(2rem,5vw,3.4rem)", fontWeight: 400, color: cream, lineHeight: 1.1, margin: "0 0 16px", letterSpacing: "-0.01em" }}>
            Puja, Planned<br />
            <em style={{ fontStyle: "italic", fontWeight: 700, background: `linear-gradient(135deg,${gold},${goldLt})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>by Tendr.</em>
          </h1>

          <p style={{ fontSize: 16, color: "rgba(255,248,236,0.55)", maxWidth: 500, margin: "0 auto 10px", lineHeight: 1.65, fontFamily: f }}>
            Don't search for 40 different puja items.<br />
            Tell Tendr what you're performing, and we'll prepare everything you need.
          </p>
          <p style={{ fontSize: 13.5, color: "rgba(255,248,236,0.35)", maxWidth: 420, margin: "0 auto 36px", fontFamily: f }}>
            Occasion-specific kits · Exact quantities · Organized packaging · Open → Follow → Celebrate
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <motion.button
              whileHover={{ y: -2, boxShadow: `0 12px 36px ${gold}65` }}
              whileTap={{ scale: 0.97 }}
              onClick={onStart}
              style={{ ...btn(`linear-gradient(135deg,${gold},${goldLt})`), padding: "14px 32px", fontSize: 15, boxShadow: `0 4px 22px ${gold}44` }}
            >
              Explore Puja Kits →
            </motion.button>
            <motion.button
              whileHover={{ borderColor: `${gold}88` }}
              whileTap={{ scale: 0.97 }}
              onClick={onUploadList}
              style={{ ...btn("transparent", "rgba(255,248,236,0.8)"), border: `1.5px solid ${gold}44`, padding: "14px 28px", fontSize: 15 }}
            >
              Upload Pandit's List
            </motion.button>
          </div>
        </motion.div>

        {/* Scrolling puja pill strip */}
        <div style={{ overflow: "hidden", marginTop: 40, maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            style={{ display: "flex", gap: 10, width: "max-content" }}
          >
            {[...PUJAS_SAMPLE, ...PUJAS_SAMPLE].map((name, i) => (
              <div key={i} style={{ padding: "7px 16px", borderRadius: 100, border: `1px solid ${gold}25`, background: `${gold}0a`, color: "rgba(255,248,236,0.55)", fontSize: 12.5, fontFamily: f, whiteSpace: "nowrap" }}>
                🪔 {name}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ padding: "64px 24px 72px", maxWidth: 900, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12, fontFamily: f }}>Simple & Fast</div>
          <h2 style={{ fontFamily: ser, fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: 400, color: cream, margin: 0 }}>How It Works</h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
          {HOW.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              style={{ ...card, padding: "24px 20px", position: "relative", overflow: "hidden" }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${gold},${goldLt})`, opacity: 0.55 }} />
              <div style={{ fontFamily: ser, fontSize: 36, fontWeight: 300, color: `${gold}30`, lineHeight: 1, marginBottom: 16, letterSpacing: "-0.02em" }}>{step.n}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: cream, marginBottom: 8, fontFamily: f }}>{step.title}</div>
              <div style={{ fontSize: 13, color: "rgba(255,248,236,0.45)", lineHeight: 1.6, fontFamily: f }}>{step.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust section — Never Miss an Item */}
      <div style={{ padding: "60px 24px 72px", background: "rgba(196,122,46,0.04)", borderTop: `1px solid ${gold}18`, borderBottom: `1px solid ${gold}18` }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center", marginBottom: 40 }}
          >
            <h2 style={{ fontFamily: ser, fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 400, color: cream, margin: "0 0 10px" }}>Don't worry about forgetting anything.</h2>
            <p style={{ fontSize: 14, color: "rgba(255,248,236,0.45)", margin: 0, fontFamily: f }}>Tendr checks the complete list before every dispatch.</p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            {[
              "Required items verified",
              "Quantities double-checked",
              "Packets organized & labeled",
              "Puja guide included",
              "Final quality check completed",
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 12, background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.14)" }}
              >
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <span style={{ fontSize: 13, color: "rgba(255,248,236,0.7)", fontFamily: f, lineHeight: 1.4 }}>{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Three layers */}
      <div style={{ padding: "64px 24px 80px", maxWidth: 900, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 40 }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 12, fontFamily: f }}>Three Ways to Use</div>
          <h2 style={{ fontFamily: ser, fontSize: "clamp(1.5rem,3vw,2.2rem)", fontWeight: 400, color: cream, margin: 0 }}>Choose how much you want Tendr to handle</h2>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { layer: "Layer 1", name: "Puja Kit", emoji: "📦", desc: "Buy exactly what you need. Organized, labeled, and ready.", tag: null },
            { layer: "Layer 2", name: "Custom Kit", emoji: "📋", desc: "Upload your Pandit's list and receive an exact kit — item for item.", tag: "Differentiator" },
            { layer: "Layer 3", name: "Complete Puja", emoji: "🪔", desc: "Kit + Pandit + Decor + Flowers + Prasad. One platform, everything done.", tag: null },
          ].map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              style={{ ...card, padding: "24px 20px", position: "relative" }}
            >
              {l.tag && <div style={{ position: "absolute", top: -10, right: 16, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 10px", borderRadius: 100, fontFamily: f }}>{l.tag}</div>}
              <div style={{ fontSize: 9, fontWeight: 800, color: `${gold}70`, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10, fontFamily: f }}>{l.layer}</div>
              <span style={{ fontSize: 28, display: "block", marginBottom: 10 }}>{l.emoji}</span>
              <div style={{ fontSize: 16, fontWeight: 700, color: cream, marginBottom: 8, fontFamily: f }}>{l.name}</div>
              <div style={{ fontSize: 13, color: "rgba(255,248,236,0.45)", lineHeight: 1.6, fontFamily: f }}>{l.desc}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 36 }}>
          <motion.button
            whileHover={{ y: -2, boxShadow: `0 12px 36px ${gold}65` }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            style={{ ...btn(`linear-gradient(135deg,${gold},${goldLt})`), padding: "14px 36px", fontSize: 15, boxShadow: `0 4px 22px ${gold}44` }}
          >
            Start with Your Puja →
          </motion.button>
        </div>
      </div>
    </div>
  );
}

/* ─── main export ────────────────────────────────────────────── */
export default function PujaKits() {
  const navigate = useNavigate();
  const [view, setView] = useState("landing"); // "landing" | "wizard"
  const [step, setStep] = useState(0);         // 0-4 (5 wizard steps)
  const [selectedPuja, setSelectedPuja] = useState(null);
  const [details, setDetails] = useState({});
  const [kitType, setKitType] = useState(null);
  const [addons, setAddons] = useState([]);
  const [ordered, setOrdered] = useState(false);
  const topRef = useRef(null);

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth" });

  const startWizard = (pujaId) => {
    if (pujaId) {
      const puja = getPujaById(pujaId) || { id: pujaId, name: "Custom Puja", icon: "✨", desc: "" };
      setSelectedPuja(puja);
      setStep(1);
    } else {
      setStep(0);
    }
    setView("wizard");
    setTimeout(scrollTop, 50);
  };

  const handleSelectPuja = (puja) => {
    setSelectedPuja(puja);
    setStep(1);
    scrollTop();
  };

  const toggleAddon = (id) => {
    setAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  if (ordered) {
    return (
      <div style={{ minHeight: "100vh", background: ink, color: cream, fontFamily: f }}>
        <Navbar />
        <div style={{ maxWidth: 500, margin: "0 auto", padding: "100px 24px", textAlign: "center" }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🪔</div>
            <h2 style={{ fontFamily: ser, fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 400, color: cream, margin: "0 0 12px" }}>Order Confirmed!</h2>
            <p style={{ fontSize: 14, color: "rgba(255,248,236,0.5)", margin: "0 0 32px", lineHeight: 1.65 }}>Your Tendr Puja Kit is being assembled. We'll send updates as it progresses through quality checks and dispatch.</p>
            {/* Order timeline */}
            <div style={{ textAlign: "left", maxWidth: 340, margin: "0 auto 36px" }}>
              {["Order Confirmed ✓", "Items Being Prepared", "Kit Being Assembled", "Quality Checked", "Dispatched", "Delivered"].map((status, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: i < 5 ? 0 : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: i === 0 ? gold : "rgba(255,255,255,0.08)", border: `2px solid ${i === 0 ? gold : "rgba(255,255,255,0.12)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {i === 0 && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                    </div>
                    {i < 5 && <div style={{ width: 2, height: 24, background: i === 0 ? gold : "rgba(255,255,255,0.06)" }} />}
                  </div>
                  <div style={{ paddingTop: 3, paddingBottom: i < 5 ? 16 : 0 }}>
                    <span style={{ fontSize: 13, color: i === 0 ? cream : "rgba(255,248,236,0.35)", fontFamily: f, fontWeight: i === 0 ? 600 : 400 }}>{status}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={`https://wa.me/919211668427?text=I just ordered a Puja Kit from Tendr! Order confirmation needed.`} target="_blank" rel="noreferrer" style={{ ...btn("#25d366"), padding: "12px 24px", fontSize: 13, textDecoration: "none", display: "inline-block", boxShadow: "0 4px 14px rgba(37,211,102,0.28)" }}>Track on WhatsApp</a>
              <button onClick={() => { setOrdered(false); setView("landing"); setStep(0); setSelectedPuja(null); setKitType(null); setAddons([]); setDetails({}); }} style={{ ...btn("rgba(255,255,255,0.07)", "rgba(255,248,236,0.7)"), padding: "12px 24px", fontSize: 13 }}>Order Another Kit</button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div ref={topRef} style={{ minHeight: "100vh", background: ink, color: cream, fontFamily: f }}>
      <Navbar />

      {view === "landing" ? (
        <LandingView
          onStart={() => startWizard(null)}
          onUploadList={() => { startWizard(null); }}
        />
      ) : (
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "80px 20px 60px" }}>
          <StepBar current={step} />

          <AnimatePresence mode="wait">
            {step === 0 && (
              <StepSelectPuja key="step0" onSelect={handleSelectPuja} />
            )}
            {step === 1 && selectedPuja && (
              <StepRequirements
                key="step1"
                puja={selectedPuja}
                data={details}
                onChange={setDetails}
                onNext={() => { setStep(2); scrollTop(); }}
                onBack={() => { setStep(0); scrollTop(); }}
              />
            )}
            {step === 2 && selectedPuja && (
              <StepKitType
                key="step2"
                puja={selectedPuja}
                details={details}
                selected={kitType}
                onSelect={setKitType}
                onNext={() => { setStep(3); scrollTop(); }}
                onBack={() => { setStep(1); scrollTop(); }}
              />
            )}
            {step === 3 && (
              <StepAddons
                key="step3"
                details={details}
                selected={addons}
                onToggle={toggleAddon}
                onNext={() => { setStep(4); scrollTop(); }}
                onBack={() => { setStep(2); scrollTop(); }}
              />
            )}
            {step === 4 && selectedPuja && (
              <StepSummary
                key="step4"
                puja={selectedPuja}
                details={details}
                kitId={kitType}
                addons={addons}
                onBack={() => { setStep(3); scrollTop(); }}
                onOrder={() => {
                  window.open(`https://wa.me/919211668427?text=Hi! I'd like to order a Tendr Puja Kit:%0A%0APuja: ${selectedPuja.name}%0AKit: ${KIT_TYPES.find(k => k.id === kitType)?.name}%0AGuests: ${details.guests}%0ADate: ${details.date}%0ACity: ${details.city}${addons.length ? `%0AAdd-ons: ${addons.join(", ")}` : ""}`, "_blank");
                  setOrdered(true);
                }}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
