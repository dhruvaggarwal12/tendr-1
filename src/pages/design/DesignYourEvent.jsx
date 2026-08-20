import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileBottomNav from "../../components/MobileBottomNav";

const font = "'Outfit', sans-serif";
const gold = "#C47A2E";
const cream = "#FFF8EC";
const ink = "#1C0E04";

/* ── Data ─────────────────────────────────────────────────── */

const OCCASIONS = [
  { id: "birthday",      label: "Birthday",       icon: "🎂", desc: "Celebrate someone special" },
  { id: "anniversary",   label: "Anniversary",    icon: "💑", desc: "Mark a milestone together" },
  { id: "wedding",       label: "Wedding",        icon: "💍", desc: "The big day" },
  { id: "house-party",   label: "House Party",    icon: "🏠", desc: "Fun with your people" },
  { id: "corporate",     label: "Corporate",      icon: "🏢", desc: "Office & business events" },
  { id: "ring-ceremony", label: "Ring Ceremony",  icon: "💎", desc: "Roka & engagement" },
];

const LOOKS = [
  { id: "soft",   label: "Soft & Pretty",       icon: "🌸", desc: "Flowers, pastels, romantic feel",     colors: ["#F9D0D0","#FFE8F0","#C8A4B8","#FFF0F5","#E8B4CB"] },
  { id: "grand",  label: "Grand & Shiny",        icon: "✨", desc: "Gold, sparkle, luxurious setup",      colors: ["#C47A2E","#CCAB4A","#F5E6C8","#8B6914","#E8D5A0"] },
  { id: "fun",    label: "Fun & Colorful",       icon: "🎈", desc: "Bright colors, balloons, lots of energy", colors: ["#FF6B6B","#FFE66D","#4ECDC4","#A8E6CF","#FF8B94"] },
  { id: "simple", label: "Simple & Natural",     icon: "🌿", desc: "Clean, fresh greenery, no fuss",      colors: ["#8B9D77","#C8D5B9","#FAF3DD","#D4E6B5","#F0F4E8"] },
  { id: "royal",  label: "Royal & Rich",         icon: "👑", desc: "Deep colors, dramatic, grand look",   colors: ["#2D1B69","#6B2D8B","#8B1A1A","#1A1A2E","#E8D5B7"] },
  { id: "unique", label: "Unique & Different",   icon: "🎭", desc: "Bold themes, out of the box ideas",   colors: ["#FF6B9D","#C44BC9","#5E48E8","#00D4FF","#1A1A2E"] },
];

const GUESTS = [
  { id: "tiny",   label: "Under 20",   icon: "👥", desc: "Intimate & personal" },
  { id: "small",  label: "20 – 50",    icon: "🎉", desc: "Close circle" },
  { id: "medium", label: "50 – 100",   icon: "🎊", desc: "Mid-size gathering" },
  { id: "large",  label: "100+",       icon: "🎆", desc: "Big celebration" },
];

const MOOD = {
  soft:   { title: "Soft & Romantic",   desc: "Delicate florals, pastel tones, and gentle lighting that make every moment feel elegant and warm." },
  grand:  { title: "Grand & Glamorous", desc: "Gold accents, shimmering drapes, and bold centerpieces that turn any venue into a showstopper." },
  fun:    { title: "Vibrant & Playful", desc: "Bright balloons, colorful setups, and high energy that keeps every guest smiling all evening." },
  simple: { title: "Clean & Natural",   desc: "Fresh greens, open spaces, and understated beauty — elegance without trying too hard." },
  royal:  { title: "Royal & Dramatic",  desc: "Jewel tones, dramatic draping, and grand arrangements that feel larger than life." },
  unique: { title: "Bold & Creative",   desc: "Unexpected themes, creative details, and a look that no one at the party has seen before." },
};

const VENDORS_BY_LOOK = {
  soft:   [
    { label: "Decorator",    emoji: "🌸", q: "Decorator" },
    { label: "Photographer", emoji: "📸", q: "Photographer" },
    { label: "Cake & Baker", emoji: "🎂", q: "Baker" },
  ],
  grand:  [
    { label: "Decorator",    emoji: "✨", q: "Decorator" },
    { label: "Photographer", emoji: "📸", q: "Photographer" },
    { label: "Caterer",      emoji: "🍽", q: "Caterer" },
    { label: "DJ & Music",   emoji: "🎵", q: "DJ" },
  ],
  fun:    [
    { label: "Decorator",      emoji: "🎈", q: "Decorator" },
    { label: "Photographer",   emoji: "📸", q: "Photographer" },
    { label: "DJ & Music",     emoji: "🎵", q: "DJ" },
    { label: "Fun Activities", emoji: "🎭", q: "Entertainment" },
  ],
  simple: [
    { label: "Decorator",    emoji: "🌿", q: "Decorator" },
    { label: "Photographer", emoji: "📸", q: "Photographer" },
    { label: "Caterer",      emoji: "🍽", q: "Caterer" },
  ],
  royal:  [
    { label: "Decorator",    emoji: "👑", q: "Decorator" },
    { label: "Photographer", emoji: "📸", q: "Photographer" },
    { label: "Caterer",      emoji: "🍽", q: "Caterer" },
    { label: "DJ & Music",   emoji: "🎵", q: "DJ" },
    { label: "Entertainment",emoji: "🎤", q: "Entertainment" },
  ],
  unique: [
    { label: "Decorator",      emoji: "🎨", q: "Decorator" },
    { label: "Photographer",   emoji: "📸", q: "Photographer" },
    { label: "DJ & Music",     emoji: "🎵", q: "DJ" },
    { label: "Fun Activities", emoji: "🎭", q: "Entertainment" },
  ],
};

const BUDGETS = {
  birthday:      { tiny: "₹5K – ₹15K",       small: "₹15K – ₹40K",       medium: "₹40K – ₹80K",        large: "₹80K – ₹2L"   },
  anniversary:   { tiny: "₹8K – ₹20K",       small: "₹20K – ₹50K",       medium: "₹50K – ₹1L",         large: "₹1L – ₹3L"    },
  wedding:       { tiny: "₹50K – ₹1L",       small: "₹1L – ₹3L",         medium: "₹3L – ₹8L",          large: "₹8L – ₹25L"   },
  "house-party": { tiny: "₹3K – ₹10K",       small: "₹10K – ₹25K",       medium: "₹25K – ₹60K",        large: "₹60K – ₹1.5L" },
  corporate:     { tiny: "₹20K – ₹50K",      small: "₹50K – ₹1L",        medium: "₹1L – ₹3L",          large: "₹3L – ₹10L"   },
  "ring-ceremony":{ tiny: "₹15K – ₹40K",     small: "₹40K – ₹80K",       medium: "₹80K – ₹2L",         large: "₹2L – ₹6L"    },
};

/* ── Component ────────────────────────────────────────────── */

export default function DesignYourEvent() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(0); // 0,1,2 = questions; 3 = results
  const [occasion, setOccasion] = useState(null);
  const [look, setLook]         = useState(null);
  const [guests, setGuests]     = useState(null);

  const lookData    = LOOKS.find(l => l.id === look);
  const occasionData = OCCASIONS.find(o => o.id === occasion);
  const mood        = look ? MOOD[look] : null;
  const vendors     = look ? VENDORS_BY_LOOK[look] : [];
  const budget      = occasion && guests ? BUDGETS[occasion]?.[guests] : null;

  const allVendorCategories = vendors.map(v => v.q).join(",");

  const steps = ["Occasion", "Look", "Guests"];

  const goNext = () => setStep(s => s + 1);
  const goBack = () => setStep(s => Math.max(0, s - 1));
  const restart = () => { setStep(0); setOccasion(null); setLook(null); setGuests(null); };

  /* ── Progress bar ── */
  const Progress = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
      {steps.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: i < step ? gold : i === step ? gold : "rgba(196,122,46,0.12)",
            border: `2px solid ${i <= step ? gold : "rgba(196,122,46,0.2)"}`,
            fontSize: 11, fontWeight: 800, color: i <= step ? "#fff" : "rgba(196,122,46,0.5)", flexShrink: 0,
            transition: "all 0.3s",
          }}>
            {i < step ? "✓" : i + 1}
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: i <= step ? gold : "rgba(196,122,46,0.4)", whiteSpace: "nowrap" }}>{label}</span>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < step ? gold : "rgba(196,122,46,0.15)", borderRadius: 1, transition: "background 0.3s" }} />
          )}
        </div>
      ))}
    </div>
  );

  /* ── Step 0: Occasion ── */
  const StepOccasion = () => (
    <div>
      <h2 style={{ fontFamily: font, fontSize: "clamp(1.3rem,4vw,1.8rem)", fontWeight: 700, color: ink, marginBottom: 6 }}>What's the occasion?</h2>
      <p style={{ fontFamily: font, fontSize: 14, color: "#7A5535", marginBottom: 24 }}>Pick what you're planning for</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
        {OCCASIONS.map(o => (
          <button key={o.id}
            onClick={() => { setOccasion(o.id); goNext(); }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              padding: "20px 12px", borderRadius: 16, cursor: "pointer", fontFamily: font,
              border: `2px solid ${occasion === o.id ? gold : "rgba(196,122,46,0.15)"}`,
              background: occasion === o.id ? "rgba(196,122,46,0.08)" : "#fff",
              boxShadow: "0 2px 8px rgba(196,122,46,0.07)", transition: "all 0.18s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.background = "rgba(196,122,46,0.05)"; }}
            onMouseLeave={e => { if (occasion !== o.id) { e.currentTarget.style.borderColor = "rgba(196,122,46,0.15)"; e.currentTarget.style.background = "#fff"; } }}
          >
            <span style={{ fontSize: 32 }}>{o.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: ink }}>{o.label}</span>
            <span style={{ fontSize: 11, color: "#9B7450", textAlign: "center", lineHeight: 1.3 }}>{o.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );

  /* ── Step 1: Look ── */
  const StepLook = () => (
    <div>
      <h2 style={{ fontFamily: font, fontSize: "clamp(1.3rem,4vw,1.8rem)", fontWeight: 700, color: ink, marginBottom: 6 }}>How do you want it to look?</h2>
      <p style={{ fontFamily: font, fontSize: 14, color: "#7A5535", marginBottom: 24 }}>Choose the feel of your event</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 12 }}>
        {LOOKS.map(l => (
          <button key={l.id}
            onClick={() => { setLook(l.id); goNext(); }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10,
              padding: "16px 14px", borderRadius: 16, cursor: "pointer", fontFamily: font, textAlign: "left",
              border: `2px solid ${look === l.id ? gold : "rgba(196,122,46,0.15)"}`,
              background: look === l.id ? "rgba(196,122,46,0.06)" : "#fff",
              boxShadow: "0 2px 8px rgba(196,122,46,0.07)", transition: "all 0.18s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.background = "rgba(196,122,46,0.04)"; }}
            onMouseLeave={e => { if (look !== l.id) { e.currentTarget.style.borderColor = "rgba(196,122,46,0.15)"; e.currentTarget.style.background = "#fff"; } }}
          >
            {/* Color palette swatches */}
            <div style={{ display: "flex", gap: 4, marginBottom: 2 }}>
              {l.colors.map((c, i) => (
                <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: "1.5px solid rgba(0,0,0,0.06)", flexShrink: 0 }} />
              ))}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: ink, marginBottom: 3 }}>{l.icon} {l.label}</div>
              <div style={{ fontSize: 11, color: "#9B7450", lineHeight: 1.4 }}>{l.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  /* ── Step 2: Guests ── */
  const StepGuests = () => (
    <div>
      <h2 style={{ fontFamily: font, fontSize: "clamp(1.3rem,4vw,1.8rem)", fontWeight: 700, color: ink, marginBottom: 6 }}>How many guests?</h2>
      <p style={{ fontFamily: font, fontSize: 14, color: "#7A5535", marginBottom: 24 }}>This helps us estimate the budget</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
        {GUESTS.map(g => (
          <button key={g.id}
            onClick={() => { setGuests(g.id); goNext(); }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              padding: "24px 12px", borderRadius: 16, cursor: "pointer", fontFamily: font,
              border: `2px solid ${guests === g.id ? gold : "rgba(196,122,46,0.15)"}`,
              background: guests === g.id ? "rgba(196,122,46,0.08)" : "#fff",
              boxShadow: "0 2px 8px rgba(196,122,46,0.07)", transition: "all 0.18s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.background = "rgba(196,122,46,0.05)"; }}
            onMouseLeave={e => { if (guests !== g.id) { e.currentTarget.style.borderColor = "rgba(196,122,46,0.15)"; e.currentTarget.style.background = "#fff"; } }}
          >
            <span style={{ fontSize: 32 }}>{g.icon}</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: ink }}>{g.label}</span>
            <span style={{ fontSize: 11, color: "#9B7450" }}>{g.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );

  /* ── Step 3: Results ── */
  const Results = () => (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(196,122,46,0.1)", border: "1px solid rgba(196,122,46,0.25)", borderRadius: 100, padding: "4px 12px", marginBottom: 12 }}>
          <span style={{ fontSize: 12 }}>{occasionData?.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: gold, letterSpacing: "0.06em", textTransform: "uppercase" }}>{occasionData?.label} · {GUESTS.find(g => g.id === guests)?.label} guests</span>
        </div>
        <h2 style={{ fontFamily: font, fontSize: "clamp(1.4rem,4vw,2rem)", fontWeight: 800, color: ink, margin: 0 }}>Your Event Design</h2>
      </div>

      {/* Mood board */}
      <div style={{ background: "#fff", border: "1.5px solid rgba(196,122,46,0.15)", borderRadius: 20, overflow: "hidden", marginBottom: 16, boxShadow: "0 4px 20px rgba(196,122,46,0.08)" }}>
        {/* Color palette bar */}
        <div style={{ display: "flex", height: 56 }}>
          {lookData?.colors.map((c, i) => (
            <div key={i} style={{ flex: 1, background: c }} />
          ))}
        </div>
        <div style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{lookData?.icon}</span>
            <span style={{ fontFamily: font, fontSize: 16, fontWeight: 800, color: ink }}>{mood?.title}</span>
          </div>
          <p style={{ fontFamily: font, fontSize: 13, color: "#7A5535", lineHeight: 1.6, margin: 0 }}>{mood?.desc}</p>
          {/* Color hex chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
            {lookData?.colors.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: "#F9F4EE", border: "1px solid rgba(196,122,46,0.12)", borderRadius: 100, padding: "3px 10px 3px 6px" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: c, border: "1px solid rgba(0,0,0,0.08)", flexShrink: 0 }} />
                <span style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: "#7A5535" }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vendors needed */}
      <div style={{ background: "#fff", border: "1.5px solid rgba(196,122,46,0.15)", borderRadius: 20, padding: "16px 20px", marginBottom: 16, boxShadow: "0 4px 20px rgba(196,122,46,0.08)" }}>
        <p style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>Vendors you'll need</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {vendors.map((v, i) => (
            <button key={i}
              onClick={() => navigate(`/search?categories=${v.q}`)}
              style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 100, border: `1.5px solid rgba(196,122,46,0.25)`, background: "rgba(196,122,46,0.05)", cursor: "pointer", fontFamily: font, transition: "all 0.18s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.12)"; e.currentTarget.style.borderColor = gold; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(196,122,46,0.05)"; e.currentTarget.style.borderColor = "rgba(196,122,46,0.25)"; }}
            >
              <span style={{ fontSize: 15 }}>{v.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: ink }}>{v.label}</span>
              <span style={{ fontSize: 11, color: gold }}>→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Budget estimate */}
      <div style={{ background: "linear-gradient(135deg, rgba(196,122,46,0.08), rgba(204,171,74,0.06))", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 20, padding: "16px 20px", marginBottom: 24, boxShadow: "0 4px 20px rgba(196,122,46,0.06)" }}>
        <p style={{ fontFamily: font, fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>Estimated budget range</p>
        <div style={{ fontFamily: font, fontSize: "clamp(1.4rem,4vw,2rem)", fontWeight: 800, color: gold, letterSpacing: "-0.01em" }}>{budget}</div>
        <p style={{ fontFamily: font, fontSize: 11, color: "#9B7450", margin: "4px 0 0", lineHeight: 1.5 }}>Rough estimate based on your choices. Actual cost depends on vendors selected.</p>
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={() => navigate(`/search?categories=${allVendorCategories}`)}
          style={{ width: "100%", padding: "14px 20px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${gold}, #D4A848)`, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 20px rgba(196,122,46,0.4)", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(196,122,46,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(196,122,46,0.4)"; }}
        >
          Find these Vendors →
        </button>
        <button
          onClick={() => navigate("/booking")}
          style={{ width: "100%", padding: "13px 20px", borderRadius: 14, border: `1.5px solid ${gold}`, background: "transparent", color: gold, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font, transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.07)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
        >
          Book a Package
        </button>
        <button
          onClick={restart}
          style={{ width: "100%", padding: "10px", border: "none", background: "transparent", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}
        >
          ← Start over
        </button>
      </div>
    </div>
  );

  /* ── Layout ── */
  return (
    <div style={{ minHeight: "100dvh", background: cream, fontFamily: font }}>
      {/* Top bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(255,248,236,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(196,122,46,0.12)", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => step > 0 && step < 3 ? goBack() : navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", color: gold, fontSize: 18, padding: "4px 8px 4px 0", lineHeight: 1 }}>←</button>
        <span style={{ fontFamily: font, fontSize: 15, fontWeight: 700, color: ink }}>Design Your Event</span>
        {step < 3 && <span style={{ marginLeft: "auto", fontFamily: font, fontSize: 12, color: "#9B7450" }}>Step {step + 1} of 3</span>}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 20px 120px" }}>
        {step < 3 && <Progress />}
        {step === 0 && <StepOccasion />}
        {step === 1 && <StepLook />}
        {step === 2 && <StepGuests />}
        {step === 3 && <Results />}
      </div>

      <MobileBottomNav />
    </div>
  );
}
