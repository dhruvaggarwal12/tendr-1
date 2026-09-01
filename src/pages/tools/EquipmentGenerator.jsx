import React, { useState, useCallback } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";

const font = "'Outfit', sans-serif";
const gold = "#C47A2E";
const goldLt = "#CCAB4A";
const ink = "#2C1A0E";
const cream = "#FFFCF5";

const STORAGE_KEY = "tendr_equipment_v1";

// ── Step data ─────────────────────────────────────────────────────────────────
const EVENT_TYPES = [
  { id: "birthday",     label: "Birthday Party",       icon: "🎂" },
  { id: "wedding",      label: "Wedding",              icon: "💒" },
  { id: "anniversary",  label: "Anniversary",          icon: "💕" },
  { id: "party",        label: "Party / Get-together", icon: "🎉" },
  { id: "houseparty",   label: "House Party",          icon: "🏠" },
  { id: "housewarming", label: "Housewarming",         icon: "🏡" },
  { id: "babyshower",   label: "Baby Shower",          icon: "🍼" },
  { id: "corporate",    label: "Corporate Event",      icon: "🏢" },
  { id: "kitty",        label: "Kitty Party",          icon: "🎰" },
  { id: "prewedding",   label: "Pre-Wedding / Sangeet",icon: "💃" },
  { id: "graduation",   label: "Graduation",           icon: "🎓" },
  { id: "custom",       label: "Other",                icon: "✨" },
];

const VENUE_TYPES = [
  { id: "home",      label: "At Home",          icon: "🏠" },
  { id: "banquet",   label: "Banquet Hall",      icon: "🏛️" },
  { id: "hotel",     label: "Hotel / Resort",   icon: "🏨" },
  { id: "outdoor",   label: "Outdoor / Garden", icon: "🌿" },
  { id: "farmhouse", label: "Farmhouse",        icon: "🌾" },
  { id: "rooftop",   label: "Rooftop",          icon: "🌆" },
];

const SERVICES = [
  { id: "DJ",          label: "DJ & Music",      icon: "🎵" },
  { id: "Catering",    label: "Catering",        icon: "🍽️" },
  { id: "Decoration",  label: "Decoration",      icon: "🎨" },
  { id: "Photography", label: "Photo & Video",   icon: "📸" },
  { id: "Anchor",      label: "Anchor / MC",     icon: "🎤" },
  { id: "Mehendi",     label: "Mehendi",         icon: "🌿" },
  { id: "Makeup",      label: "Makeup & Hair",   icon: "💄" },
  { id: "Transport",   label: "Transport",       icon: "🚗" },
];

// ── Equipment generation logic ────────────────────────────────────────────────
function generateEquipment(guests, venueId, services) {
  const n = Number(guests) || 50;
  const hasDJ     = services.includes("DJ");
  const hasCat    = services.includes("Catering");
  const hasDec    = services.includes("Decoration");
  const hasPhoto  = services.includes("Photography");
  const hasAnchor = services.includes("Anchor");
  const isOutdoor = venueId === "outdoor" || venueId === "farmhouse" || venueId === "rooftop";
  const isHome    = venueId === "home";

  const tables = Math.ceil(n / 8);
  const sections = [];

  // ── Seating ──────────────────────────────────────────────────────────────
  sections.push({
    id: "seating", label: "Seating", icon: "🪑",
    items: [
      { id: "chairs",   name: "Chairs",            qty: Math.ceil(n * 1.1),    note: "10% buffer included" },
      { id: "tables",   name: "Round Dining Tables",qty: tables,               note: `~8 guests per table` },
      { id: "hitable",  name: "High-top Tables",   qty: n > 60 ? Math.ceil(n / 25) : 0, note: "For cocktail/standing area" },
      { id: "kidstable",name: "Kids' Table & Chairs", qty: n > 50 ? 1 : 0,    note: "" },
      { id: "headtable",name: "Head / Stage Table", qty: 1,                   note: "For hosts or family" },
      { id: "regtable", name: "Registration Table", qty: 1,                   note: "" },
    ].filter(i => i.qty > 0),
  });

  // ── Audio / Visual ────────────────────────────────────────────────────────
  if (hasDJ || hasAnchor || n > 80) {
    sections.push({
      id: "av", label: "Audio / Visual", icon: "🔊",
      items: [
        ...(hasDJ ? [
          { id: "djconsole",  name: "DJ Console / CDJ",        qty: 1 },
          { id: "mixer",      name: "Mixer / Controller",       qty: 1 },
          { id: "laptop",     name: "DJ Laptop + Stand",        qty: 1 },
        ] : []),
        { id: "speakers",   name: "PA Speakers",               qty: Math.max(2, Math.ceil(n / 75)) },
        { id: "subwoofer",  name: "Subwoofer",                 qty: n > 50 ? 1 : 0 },
        { id: "amplifier",  name: "Amplifier",                 qty: 1 },
        { id: "wirelessmic",name: "Wireless Microphones",      qty: (hasDJ || hasAnchor) ? 2 : 1 },
        { id: "cablebox",   name: "Cable Box (XLR / RCA / AUX)", qty: 1 },
        { id: "speakerstand",name: "Speaker Stands",           qty: Math.max(2, Math.ceil(n / 75)) },
        ...(n > 100 ? [{ id: "projector", name: "Projector + Screen", qty: 1 }] : []),
      ].filter(i => i.qty > 0),
    });
  }

  // ── Lighting ─────────────────────────────────────────────────────────────
  if (hasDJ || hasDec || n > 60) {
    sections.push({
      id: "lighting", label: "Lighting", icon: "💡",
      items: [
        { id: "uplights",  name: "LED Uplights",              qty: Math.max(4, Math.ceil(n / 20)) },
        { id: "fairylt",  name: "Fairy / String Lights (10m)", qty: Math.ceil(tables / 2) + 2 },
        { id: "spotlt",   name: "Spotlights / Pinspots",      qty: hasDec ? 4 : 2 },
        ...(hasDJ ? [
          { id: "movhead", name: "Moving Head Lights",        qty: n > 80 ? 2 : 1 },
          { id: "laserlt", name: "Laser / Effect Light",      qty: 1 },
          { id: "fogmach", name: "Fog / Haze Machine",        qty: 1 },
        ] : []),
        ...(hasDec ? [{ id: "ledpanel", name: "LED Backdrop Panel / Curtain", qty: 1 }] : []),
        { id: "dimmer",   name: "Dimmer Switches",            qty: 2 },
      ],
    });
  }

  // ── Decoration ───────────────────────────────────────────────────────────
  if (hasDec) {
    sections.push({
      id: "decor", label: "Decoration", icon: "🎨",
      items: [
        { id: "backdrop",    name: "Photo Backdrop / Arch",   qty: 1 },
        { id: "backdrop2",   name: "Main Stage Backdrop",     qty: 1 },
        { id: "centrepiece", name: "Centrepieces",            qty: tables, note: "1 per table" },
        { id: "tablerunner", name: "Table Runners",           qty: tables },
        { id: "floral",      name: "Flower Arrangements",     qty: Math.ceil(tables / 2) },
        { id: "balloons",    name: "Balloon Bunches",         qty: Math.ceil(n / 15) },
        { id: "candles",     name: "Candles / Tealights",     qty: tables * 4 },
        { id: "draping",     name: "Ceiling / Wall Draping (metres)", qty: isHome ? 10 : 20 },
        { id: "carpetrunner",name: "Carpet Runner (metres)",  qty: 5 },
        { id: "entrance",    name: "Entrance Arch / Gate",    qty: 1 },
        { id: "signage",     name: "Signage Stands",          qty: 2 },
      ],
    });
  }

  // ── Catering Equipment ────────────────────────────────────────────────────
  if (hasCat) {
    const chafing = Math.ceil(n / 30) * 2;
    sections.push({
      id: "catering", label: "Catering Equipment", icon: "🍽️",
      items: [
        { id: "chafing",   name: "Chafing Dishes (Bain-marie)", qty: chafing },
        { id: "servspoon", name: "Serving Spoons / Ladles",     qty: chafing * 2 },
        { id: "servtray",  name: "Serving Trays",               qty: Math.ceil(n / 25) },
        { id: "icebucket", name: "Ice Buckets",                 qty: Math.ceil(n / 50) },
        { id: "waterdisp", name: "Water Dispensers / Coolers",  qty: Math.ceil(n / 80) },
        { id: "warmingot", name: "Food Warming Oven / Hot Case",qty: 1 },
        { id: "buffet",    name: "Buffet Counter Tables",       qty: Math.ceil(n / 100) + 1 },
        { id: "shroud",    name: "Table Skirts / Covers",       qty: Math.ceil(n / 100) + 2 },
        ...(n > 100 ? [{ id: "gasburn", name: "Gas Burners (backup)", qty: 2 }] : []),
      ],
    });
  }

  // ── Photography ───────────────────────────────────────────────────────────
  if (hasPhoto) {
    sections.push({
      id: "photo", label: "Photography & Video", icon: "📸",
      items: [
        { id: "camera",     name: "Camera Bodies",             qty: 2 },
        { id: "lens",       name: "Lenses (wide + portrait)",  qty: 3 },
        { id: "tripod",     name: "Tripods",                   qty: 2 },
        { id: "flash",      name: "External Flash Units",      qty: 2 },
        { id: "softbox",    name: "Softbox / Reflector",       qty: 1 },
        { id: "memcard",    name: "Memory Cards (64GB+)",      qty: 6 },
        { id: "photobkdrop",name: "Photo Backdrop Stand Kit",  qty: 1 },
        { id: "drone",      name: "Drone (if aerial shots)",   qty: isOutdoor ? 1 : 0 },
        { id: "powerstrip", name: "Power Strips for charging", qty: 2 },
      ].filter(i => i.qty > 0),
    });
  }

  // ── Mehendi / Makeup setup ────────────────────────────────────────────────
  const hasMehendi = services.includes("Mehendi");
  const hasMakeup  = services.includes("Makeup");
  if (hasMehendi || hasMakeup) {
    sections.push({
      id: "beauty", label: "Mehendi & Makeup Setup", icon: "💄",
      items: [
        ...(hasMehendi ? [
          { id: "mehenditbl", name: "Mehendi Table",            qty: hasMehendi && hasMakeup ? 2 : 1 },
          { id: "mehendichrs",name: "Chairs (artist + client)", qty: hasMehendi && hasMakeup ? 4 : 2 },
          { id: "mehendidryer",name: "Hair Dryer for drying",   qty: 1 },
        ] : []),
        ...(hasMakeup ? [
          { id: "makeuptbl", name: "Makeup Table / Dresser",    qty: 1 },
          { id: "makeupmir", name: "Large Mirror with stand",   qty: 1 },
          { id: "ringlght",  name: "Ring Light",                qty: 1 },
          { id: "makeupchair",name: "Client Chair (adjustable)",qty: 1 },
        ] : []),
      ],
    });
  }

  // ── Power & Utilities ─────────────────────────────────────────────────────
  const needsGen = isOutdoor && n > 80;
  sections.push({
    id: "power", label: "Power & Utilities", icon: "⚡",
    items: [
      ...(needsGen ? [{ id: "generator", name: "Generator (5–10 kVA)", qty: 1, note: "Essential for outdoor events" }] : []),
      { id: "extcord",   name: "Extension Cords (10m)",     qty: Math.max(4, Math.ceil(n / 40)) },
      { id: "powerstrip2",name: "Multi-socket Power Strips",qty: Math.max(3, Math.ceil(n / 40)) },
      { id: "mcastape",  name: "Gaffer / MC Tape Rolls",    qty: 2 },
      { id: "cableclip", name: "Cable Management Clips",    qty: 1, note: "Pack of 20" },
      ...(isOutdoor ? [{ id: "torch", name: "Emergency Torches",        qty: 4 }] : []),
    ],
  });

  // ── Transport / Logistics ──────────────────────────────────────────────────
  if (services.includes("Transport")) {
    sections.push({
      id: "transport", label: "Transport & Logistics", icon: "🚗",
      items: [
        { id: "carcount",   name: "Cars / Cabs",              qty: Math.ceil(n / 4) },
        { id: "minibus",    name: "Mini Bus (if group pickup)",qty: n > 80 ? Math.ceil(n / 20) : 0 },
        { id: "parking",    name: "Parking Passes / Tokens",   qty: Math.ceil(n / 3) },
        { id: "luggage",    name: "Luggage Tags",              qty: n },
      ].filter(i => i.qty > 0),
    });
  }

  // ── Miscellaneous ─────────────────────────────────────────────────────────
  sections.push({
    id: "misc", label: "Miscellaneous", icon: "📦",
    items: [
      { id: "firstaid",  name: "First Aid Kit",              qty: 1 },
      { id: "dustbins",  name: "Dustbins (large)",           qty: Math.max(2, Math.ceil(n / 50)) },
      { id: "handwash",  name: "Hand Sanitiser Stations",    qty: Math.ceil(n / 60) },
      { id: "namecard",  name: "Name Cards / Place Cards",   qty: n },
      { id: "balloon2",  name: "Helium Balloon Weights",     qty: hasDec ? Math.ceil(n / 10) : 0 },
      { id: "wastebag",  name: "Garbage Bags (large)",       qty: 10 },
      { id: "tablecloth",name: "Table Cloths",               qty: tables + 2 },
    ].filter(i => i.qty > 0),
  });

  return sections;
}

// ── Item status pill ──────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["Need to arrange", "Have it", "Need to rent", "Need to buy"];
const STATUS_STYLE = {
  "Have it":          { bg: "rgba(22,163,74,0.1)",  color: "#16a34a" },
  "Need to rent":     { bg: "rgba(124,58,237,0.1)", color: "#7c3aed" },
  "Need to buy":      { bg: "rgba(220,38,38,0.1)",  color: "#dc2626" },
  "Need to arrange":  { bg: "rgba(196,122,46,0.1)", color: gold },
};

// ── Main component ────────────────────────────────────────────────────────────
export default function EquipmentGenerator() {
  const navigate = useNavigate();
  const navType  = useNavigationType();

  const [step, setStep]           = useState(1);
  const [eventType, setEventType] = useState("");
  const [guests, setGuests]       = useState("");
  const [venueType, setVenueType] = useState("");
  const [services, setServices]   = useState([]);
  const [equipment, setEquipment] = useState(null); // null = not generated yet
  const [itemStatus, setItemStatus] = useState({}); // { itemId: status }
  const [checkedItems, setCheckedItems] = useState({}); // { itemId: bool }

  const toggleService = (id) =>
    setServices(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const generate = () => {
    const eq = generateEquipment(guests || 50, venueType, services);
    setEquipment(eq);
    setItemStatus({});
    setCheckedItems({});
    setStep(4);
  };

  const setStatus = (itemId, status) =>
    setItemStatus(prev => ({ ...prev, [itemId]: status }));

  const toggleCheck = (itemId) =>
    setCheckedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));

  const allItems = equipment?.flatMap(s => s.items) || [];
  const arrangedCount = allItems.filter(i =>
    checkedItems[i.id] || itemStatus[i.id] === "Have it"
  ).length;
  const progress = allItems.length > 0 ? Math.round((arrangedCount / allItems.length) * 100) : 0;

  const handleWhatsApp = () => {
    if (!equipment) return;
    const lines = [`🎉 Equipment List — ${EVENT_TYPES.find(e => e.id === eventType)?.label || "Event"} (${guests} guests)\n`];
    equipment.forEach(sec => {
      lines.push(`*${sec.icon} ${sec.label}*`);
      sec.items.forEach(item => {
        const s = itemStatus[item.id];
        const done = checkedItems[item.id] || s === "Have it";
        lines.push(`${done ? "✅" : "⬜"} ${item.name} × ${item.qty}${s && s !== "Need to arrange" ? ` (${s})` : ""}`);
      });
      lines.push("");
    });
    lines.push("Generated by Tendr · tendr.co.in");
    window.open(`https://wa.me/?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  };

  const handleCopy = async () => {
    if (!equipment) return;
    const lines = [`Equipment List — ${EVENT_TYPES.find(e => e.id === eventType)?.label || "Event"} (${guests} guests)\n`];
    equipment.forEach(sec => {
      lines.push(`${sec.icon} ${sec.label}`);
      sec.items.forEach(item => {
        const s = itemStatus[item.id];
        const done = checkedItems[item.id] || s === "Have it";
        lines.push(`${done ? "[✓]" : "[ ]"} ${item.name} × ${item.qty}${s && s !== "Need to arrange" ? ` (${s})` : ""}`);
      });
      lines.push("");
    });
    try { await navigator.clipboard.writeText(lines.join("\n")); } catch {}
  };

  // ── Card style helpers ──────────────────────────────────────────────────────
  const selCard = (selected) => ({
    background: selected ? `linear-gradient(135deg,${gold},${goldLt})` : "#fff",
    border: `1.5px solid ${selected ? gold : "rgba(196,122,46,0.2)"}`,
    color: selected ? "#fff" : ink,
    borderRadius: 12, padding: "10px 12px", cursor: "pointer",
    fontFamily: font, textAlign: "center", transition: "all 0.15s",
    boxShadow: selected ? `0 4px 14px rgba(196,122,46,0.35)` : "0 1px 4px rgba(196,122,46,0.08)",
  });

  const pill = (active) => ({
    padding: "7px 14px", borderRadius: 100, border: `1.5px solid`,
    borderColor: active ? gold : "rgba(196,122,46,0.22)",
    background: active ? gold : "transparent",
    color: active ? "#fff" : "#9B7450",
    fontFamily: font, fontSize: 13, fontWeight: 600, cursor: "pointer",
    display: "flex", alignItems: "center", gap: 6, transition: "all 0.15s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: font }}>
      <HamburgerNav />

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 24, fontWeight: 900, color: ink, lineHeight: 1.2 }}>
            🔧 Equipment Generator
          </div>
          <div style={{ fontSize: 14, color: "#9B7450", marginTop: 6 }}>
            Tell us about your event — we'll generate a complete equipment checklist with quantities.
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, alignItems: "center" }}>
          {[1, 2, 3, 4].map(s => (
            <React.Fragment key={s}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: step >= s ? `linear-gradient(135deg,${gold},${goldLt})` : "rgba(196,122,46,0.1)", color: step >= s ? "#fff" : "#9B7450", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s}</div>
              {s < 4 && <div style={{ flex: 1, height: 2, background: step > s ? gold : "rgba(196,122,46,0.15)", borderRadius: 2 }} />}
            </React.Fragment>
          ))}
        </div>

        {/* ── Step 1: Event Type ── */}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: ink, marginBottom: 16 }}>What type of event?</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28 }}>
              {EVENT_TYPES.map(e => (
                <button key={e.id} onClick={() => setEventType(e.id)} style={selCard(eventType === e.id)}>
                  <div style={{ fontSize: 26, marginBottom: 4 }}>{e.icon}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.3 }}>{e.label}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} disabled={!eventType}
              style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: eventType ? `linear-gradient(135deg,${gold},${goldLt})` : "rgba(196,122,46,0.25)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: eventType ? "pointer" : "not-allowed", boxShadow: eventType ? "0 4px 16px rgba(196,122,46,0.35)" : "none", fontFamily: font }}>
              Next →
            </button>
          </div>
        )}

        {/* ── Step 2: Guest count + Venue ── */}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: ink, marginBottom: 16 }}>Guest count & venue</div>

            <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1.5px solid rgba(196,122,46,0.15)", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#9B7450", marginBottom: 10 }}>HOW MANY GUESTS?</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button onClick={() => setGuests(g => String(Math.max(10, (Number(g) || 50) - 10)))}
                  style={{ width: 38, height: 38, borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: gold, fontSize: 20, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>−</button>
                <input type="number" min="5" max="2000" value={guests} onChange={e => setGuests(e.target.value)} placeholder="50"
                  style={{ flex: 1, textAlign: "center", fontSize: 28, fontWeight: 900, color: ink, border: "none", background: "transparent", fontFamily: font, outline: "none" }} />
                <button onClick={() => setGuests(g => String((Number(g) || 50) + 10))}
                  style={{ width: 38, height: 38, borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: gold, fontSize: 20, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>+</button>
              </div>
              <div style={{ fontSize: 11, color: "#9B7450", textAlign: "center", marginTop: 6 }}>Expected number of guests</div>
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, color: "#9B7450", marginBottom: 10 }}>VENUE TYPE</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 28 }}>
              {VENUE_TYPES.map(v => (
                <button key={v.id} onClick={() => setVenueType(v.id)} style={selCard(venueType === v.id)}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{v.icon}</div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, lineHeight: 1.3 }}>{v.label}</div>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: gold, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>← Back</button>
              <button onClick={() => setStep(3)} disabled={!venueType || !guests}
                style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: (venueType && guests) ? `linear-gradient(135deg,${gold},${goldLt})` : "rgba(196,122,46,0.25)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: (venueType && guests) ? "pointer" : "not-allowed", fontFamily: font }}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Services ── */}
        {step === 3 && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: ink, marginBottom: 4 }}>Which services are you arranging?</div>
            <div style={{ fontSize: 13, color: "#9B7450", marginBottom: 16 }}>Select all that apply — equipment will be tailored to each one.</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 28 }}>
              {SERVICES.map(s => (
                <button key={s.id} onClick={() => toggleService(s.id)} style={pill(services.includes(s.id))}>
                  <span style={{ fontSize: 16 }}>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ flex: 1, padding: "13px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: gold, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>← Back</button>
              <button onClick={generate}
                style={{ flex: 2, padding: "13px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 16px rgba(196,122,46,0.35)" }}>
                Generate Equipment List →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Equipment list ── */}
        {step === 4 && equipment && (
          <div>
            {/* Summary bar */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "16px 20px", border: "1.5px solid rgba(196,122,46,0.15)", marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: ink }}>
                    {EVENT_TYPES.find(e => e.id === eventType)?.label} · {guests} guests · {VENUE_TYPES.find(v => v.id === venueType)?.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#9B7450", marginTop: 2 }}>
                    {arrangedCount} of {allItems.length} items arranged ({progress}%)
                  </div>
                </div>
                <button onClick={() => setStep(3)} style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: gold, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Edit</button>
              </div>
              {/* Progress bar */}
              <div style={{ height: 6, background: "rgba(196,122,46,0.1)", borderRadius: 100, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg,${gold},${goldLt})`, borderRadius: 100, transition: "width 0.3s" }} />
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <button onClick={handleWhatsApp}
                style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#25D366", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                Share on WhatsApp
              </button>
              <button onClick={handleCopy}
                style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: gold, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy List
              </button>
            </div>

            {/* Equipment sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {equipment.map(section => (
                <div key={section.id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.12)", overflow: "hidden" }}>
                  {/* Section header */}
                  <div style={{ padding: "12px 16px", background: "rgba(196,122,46,0.04)", borderBottom: "1px solid rgba(196,122,46,0.1)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{section.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: ink }}>{section.label}</span>
                    <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#9B7450" }}>
                      {section.items.filter(i => checkedItems[i.id] || itemStatus[i.id] === "Have it").length}/{section.items.length}
                    </span>
                  </div>

                  {/* Items */}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {section.items.map((item, idx) => {
                      const checked  = !!checkedItems[item.id];
                      const status   = itemStatus[item.id] || "Need to arrange";
                      const stStyle  = STATUS_STYLE[status] || STATUS_STYLE["Need to arrange"];
                      return (
                        <div key={item.id}
                          style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: idx < section.items.length - 1 ? "1px solid rgba(196,122,46,0.07)" : "none", opacity: checked ? 0.55 : 1 }}>
                          {/* Checkbox */}
                          <button onClick={() => toggleCheck(item.id)}
                            style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${checked ? "#16a34a" : "rgba(196,122,46,0.35)"}`, background: checked ? "#16a34a" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                            {checked && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>}
                          </button>

                          {/* Item info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textDecoration: checked ? "line-through" : "none" }}>
                              {item.name}
                            </div>
                            {item.note && <div style={{ fontSize: 10, color: "#9B7450", marginTop: 1 }}>{item.note}</div>}
                          </div>

                          {/* Quantity */}
                          <span style={{ fontSize: 11, fontWeight: 800, color: gold, background: "rgba(196,122,46,0.1)", borderRadius: 6, padding: "2px 7px", flexShrink: 0 }}>
                            ×{item.qty}
                          </span>

                          {/* Status select */}
                          <select value={status} onChange={e => setStatus(item.id, e.target.value)}
                            style={{ fontSize: 10, fontWeight: 700, color: stStyle.color, background: stStyle.bg, border: "none", borderRadius: 7, padding: "3px 6px", cursor: "pointer", fontFamily: font, outline: "none", flexShrink: 0, maxWidth: 100 }}>
                            {STATUS_OPTIONS.map(o => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Regenerate */}
            <button onClick={() => { setStep(1); setEquipment(null); setEventType(""); setGuests(""); setVenueType(""); setServices([]); }}
              style={{ width: "100%", marginTop: 20, padding: "12px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: gold, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              Start Over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
