import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const STORAGE_KEY = "tendr_indepday_form";
const TTL = 24 * 60 * 60 * 1000; // 24 hours

function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 400;
        const scale = Math.min(1, MAX / img.width);
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

const saffron = "#FF9933";
const green   = "#138808";
const white   = "#FFFFFF";
const dark    = "#2C1A0E";
const muted   = "#9B7450";
const border  = "#E8D8C4";
const font    = "'Outfit', sans-serif";

const SERVICES = [
  { id: "decorator",    label: "Decorator",     icon: "🎀" },
  { id: "caterer",      label: "Caterer",        icon: "🍽️" },
  { id: "photographer", label: "Photographer",   icon: "📸" },
  { id: "dj",           label: "DJ",             icon: "🎧" },
  { id: "fun",          label: "Fun Activities", icon: "🎪" },
];

const VENUE_TYPES = [
  { id: "room",     label: "Room",          icon: "🛋️" },
  { id: "hall",     label: "Hall",          icon: "🏛️" },
  { id: "terrace",  label: "Terrace",       icon: "🌇" },
  { id: "garden",   label: "Garden / Park", icon: "🌳" },
  { id: "office",   label: "Office",        icon: "🏢" },
  { id: "roadside", label: "Roadside",      icon: "🚦" },
];

const PLAN_CONTENT = {
  hr: {
    timeline: [
      { when: "4 weeks before", text: "Get management approval, finalise event budget" },
      { when: "3 weeks before", text: "Book caterer, decorator & photographer. Send employee invite with tricolor dress code" },
      { when: "1 week before",  text: "Confirm headcount, coordinate with admin/facilities for space & PA system" },
      { when: "3 days before",  text: "Vendor briefing, space allocation, test PA & national anthem audio" },
      { when: "Day of",         text: "9 AM flag hoisting (MD/CEO as chief guest), breakfast, cultural program, team photo" },
    ],
    checklist: [
      "Management approval & event budget signed off",
      "BIS-certified national flag (correct size for venue)",
      "PA system, projector & national anthem audio ready",
      "Caterer confirmed for morning breakfast/snacks (veg only)",
      "Photographer for flag hoisting & group shots",
      "Tricolor dress code communicated to all employees",
      "Seating arrangement for entire team",
      "Souvenirs or recognition certificates for cultural participants",
    ],
    ideas: [
      { icon: "🏆", title: "Patriotic Quiz", desc: "Team-based quiz on India's history & freedom fighters" },
      { icon: "🍱", title: "Tricolor Breakfast", desc: "Kesari halwa, white sandwiches, green chutney themed spread" },
      { icon: "📸", title: "Photo Wall", desc: "Tricolor frame cutout for Instagram-worthy team photos" },
      { icon: "🎖️", title: "Felicitation", desc: "Recognise long-serving employees tied to the national occasion" },
    ],
  },
  community: {
    timeline: [
      { when: "1 month before", text: "Plan with RWA/committee, decide venue & collect resident contributions" },
      { when: "2 weeks before",  text: "Book decorator & caterer early — August fills up fast" },
      { when: "1 week before",  text: "Circulate invite to all residents, finalise cultural program lineup" },
      { when: "3 days before",  text: "Kids activity planning, rangoli & decoration prep, pandal/chairs arrangement" },
      { when: "Day of",         text: "Flag hoisting 8–9 AM, kids games & competitions, cultural show, community lunch" },
    ],
    checklist: [
      "Society / RWA permission confirmed",
      "Contributions collected from residents",
      "BIS-certified national flag arranged",
      "Chairs & proper seating for elders",
      "Kids competitions planned (drawing, fancy dress, quiz)",
      "Caterer confirmed for breakfast or community lunch",
      "Sound system for anthem & cultural program",
      "Decoration: tricolor balloons, bunting, marigold garlands",
    ],
    ideas: [
      { icon: "🎨", title: "Tiranga Rangoli", desc: "Rangoli competition for kids & adults in the compound" },
      { icon: "🪁", title: "Kite Flying", desc: "Kite flying on terrace or open ground after flag hoisting" },
      { icon: "👗", title: "Fancy Dress", desc: "Kids dress as freedom fighters, soldiers or national heroes" },
      { icon: "🍱", title: "Tricolor Feast", desc: "Tiranga pulao, tricolor sandwiches & tricolor cake for the community" },
    ],
  },
};

const VENUE_TIPS = {
  room: {
    checklist: [
      "Rearrange furniture to open up floor space",
      "Check ventilation / AC capacity for guest count",
      "Drape tricolor fabric or bunting on walls",
    ],
    ideas: [
      { icon: "✨", title: "Fairy Light Backdrop", desc: "String saffron-white-green fairy lights behind a feature wall for photos" },
      { icon: "🌸", title: "Floral Table Centrepiece", desc: "Marigold (saffron), tuberose (white) & leaves (green) in a small vase" },
    ],
  },
  hall: {
    checklist: [
      "Book the hall at least 2 weeks in advance",
      "Plan stage / podium placement and flag hoisting spot",
      "Arrange entry gate arch decoration",
      "Confirm parking & crowd flow with venue management",
    ],
    ideas: [
      { icon: "🎪", title: "Grand Entry Arch", desc: "Tricolor balloon or marigold arch at the main entrance" },
      { icon: "🎭", title: "Cultural Stage Show", desc: "Patriotic skits, dance performances, or a live band on the main stage" },
    ],
  },
  terrace: {
    checklist: [
      "Check weather forecast 3 days before — have a rain backup",
      "Arrange shade canopy or umbrellas for afternoon sun",
      "Plan power extension cord for lights & PA",
      "Secure loose decorations against wind",
    ],
    ideas: [
      { icon: "🌅", title: "Sunrise Flag Hoisting", desc: "Hoist the flag at sunrise for a dramatic rooftop sky backdrop" },
      { icon: "🪁", title: "Kite Flying Session", desc: "Classic terrace activity — tricolor kites after the ceremony" },
    ],
  },
  garden: {
    checklist: [
      "Get park / society / RWA permission in writing",
      "Arrange outdoor seating — durries, plastic chairs or bean bags",
      "Keep a weather backup plan (marquee or nearby indoor space)",
      "Plan waste disposal — keep the garden clean post-event",
    ],
    ideas: [
      { icon: "🌿", title: "Nature Tricolor Decor", desc: "Marigold (saffron), tuberose (white) and leaves (green) — no plastic" },
      { icon: "🏃", title: "Outdoor Games", desc: "Sack race, tug-of-war or relay run for kids & families in the open space" },
    ],
  },
  office: {
    checklist: [
      "Clear a common area, lobby or cafeteria for the event",
      "Coordinate with FM/admin team for space & PA clearance",
      "Plan within office hours or ensure OT approvals for late events",
      "Get approval from HR head or management for budget spend",
    ],
    ideas: [
      { icon: "🖥️", title: "Digital Patriotic Wall", desc: "Slideshow of freedom fighters on office screens during the event" },
      { icon: "🎙️", title: "Employee Storytelling", desc: "3-minute slots for employees to share stories of inspiration from India" },
    ],
  },
  roadside: {
    checklist: [
      "Get written permission from local authority / municipality",
      "Arrange traffic management if road is partially blocked",
      "Organise power supply — generator if grid isn't accessible",
      "Coordinate with police or security if crowd is large",
    ],
    ideas: [
      { icon: "📢", title: "Community March / Parade", desc: "Short march past with tricolor flags through the neighbourhood" },
      { icon: "🎺", title: "Band or Dhol Performance", desc: "Live dhol or brass band adds energy and draws the community together" },
    ],
  },
};

// ── Shared styles ───────────────────────────────────────────────────────────
const overlay = {
  position: "fixed", inset: 0, zIndex: 9999,
  background: "rgba(0,0,0,0.72)",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "16px",
  fontFamily: font,
};

const modal = {
  background: "#FFFCF5",
  borderRadius: "20px",
  width: "100%", maxWidth: 520,
  maxHeight: "90dvh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
  position: "relative",
};

const hdr = {
  background: "linear-gradient(135deg, #FF9933 0%, #e67e00 40%, #138808 100%)",
  borderRadius: "20px 20px 0 0",
  padding: "18px 20px 14px",
  color: white,
  position: "relative",
};

const closeBtn = {
  position: "absolute", top: 14, right: 16,
  background: "rgba(255,255,255,0.22)", border: "none",
  color: white, fontSize: 18, cursor: "pointer",
  width: 30, height: 30, borderRadius: "50%",
  display: "flex", alignItems: "center", justifyContent: "center",
};

const body = { padding: "20px 18px 16px", fontFamily: font, flex: 1, overflowY: "auto", minHeight: 0 };

const chip = (active) => ({
  display: "flex", alignItems: "center", gap: 8,
  padding: "10px 16px", borderRadius: 12, cursor: "pointer",
  border: active ? `2px solid ${saffron}` : `1.5px solid ${border}`,
  background: active ? "rgba(255,153,51,0.10)" : white,
  fontSize: 14, fontWeight: active ? 700 : 500,
  color: active ? saffron : dark,
  transition: "all 0.15s",
  fontFamily: font,
});

const inp = {
  width: "100%", minWidth: 0, padding: "11px 13px", borderRadius: 10,
  border: `1.5px solid ${border}`, fontSize: 14, color: dark,
  background: white, boxSizing: "border-box", outline: "none",
  fontFamily: font, letterSpacing: "0.01em",
};

const label = (optional) => ({
  fontSize: 11, fontWeight: 700, letterSpacing: "0.09em",
  textTransform: "uppercase", color: optional ? muted : "#7A4B1E",
  display: "block", marginBottom: 6, fontFamily: font,
});

const primaryBtn = {
  background: `linear-gradient(90deg, ${saffron}, #e67e00)`,
  color: white, border: "none", borderRadius: 12,
  padding: "13px 28px", fontSize: 15, fontWeight: 700,
  cursor: "pointer", width: "100%", marginTop: 16,
  fontFamily: font, letterSpacing: "0.01em",
};

const outlineBtn = {
  background: "transparent", border: `1.5px solid ${saffron}`,
  color: saffron, borderRadius: 12,
  padding: "12px 20px", fontSize: 14, fontWeight: 600,
  cursor: "pointer", flex: 1, fontFamily: font,
};

// ── Steps progress bar ─────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 5, marginTop: 14 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 3, borderRadius: 2,
          background: i <= current ? white : "rgba(255,255,255,0.3)",
          transition: "background 0.3s",
        }} />
      ))}
    </div>
  );
}

// ── Lightbox ───────────────────────────────────────────────────────────────
function PhotoLightbox({ photo, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.88)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", maxWidth: 640, width: "100%" }}>
        <img src={photo.url} alt={photo.title}
          style={{ width: "100%", borderRadius: 14, display: "block", maxHeight: "80vh", objectFit: "contain" }} />
        {photo.title && (
          <div style={{ marginTop: 10, textAlign: "center", color: "#fff", fontSize: 13, fontWeight: 600, opacity: 0.9 }}>
            {photo.title}
          </div>
        )}
        <button onClick={onClose} style={{
          position: "absolute", top: -12, right: -12,
          width: 32, height: 32, borderRadius: "50%",
          background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.3)",
          color: "#fff", fontSize: 16, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>
      </div>
    </div>
  );
}

// ── Photo card ─────────────────────────────────────────────────────────────
function PhotoCard({ photo, selected, onToggle }) {
  const [preview, setPreview] = useState(null);
  return (
    <>
    {preview && <PhotoLightbox photo={preview} onClose={() => setPreview(null)} />}
    <div style={{
      borderRadius: 12, overflow: "hidden",
      border: selected ? `2.5px solid ${saffron}` : "2px solid transparent",
      boxShadow: selected ? `0 0 0 2px rgba(255,153,51,0.25)` : "0 2px 8px rgba(0,0,0,0.09)",
      position: "relative", transition: "all 0.15s",
    }}>
      <div style={{ position: "relative", cursor: "pointer" }} onClick={() => onToggle(photo)}>
        <img src={photo.url} alt={photo.title}
          style={{ width: "100%", aspectRatio: "3/2", objectFit: "cover", display: "block" }}
          loading="lazy" />
        {selected && (
          <div style={{
            position: "absolute", top: 7, right: 7,
            background: saffron, color: white, borderRadius: "50%",
            width: 22, height: 22, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 12, fontWeight: 700,
          }}>✓</div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setPreview(photo); }}
          style={{
            position: "absolute", bottom: 6, right: 6,
            background: "rgba(0,0,0,0.55)", border: "none", borderRadius: 6,
            color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 8px",
            cursor: "pointer", fontFamily: font,
          }}
        >⤢ View</button>
      </div>
      <div style={{ padding: "7px 9px", background: white }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: dark, fontFamily: font }}>{photo.title}</div>
        <div style={{ fontSize: 10, color: muted, marginTop: 1, lineHeight: 1.4, fontFamily: font }}>{photo.description}</div>
      </div>
    </div>
    </>
  );
}

// ── Plan & Ideas content panel ─────────────────────────────────────────────
function PlanIdeas({ orgType, venueType, onBookServices, onBack }) {
  const [tab, setTab] = useState("timeline");
  const base = PLAN_CONTENT[orgType] || PLAN_CONTENT.community;
  const venueTips = VENUE_TIPS[venueType] || {};
  const content = {
    timeline: base.timeline,
    checklist: [...base.checklist, ...(venueTips.checklist || [])],
    ideas:     [...base.ideas,     ...(venueTips.ideas     || [])],
  };
  const label = orgType === "hr" ? "Corporate" : "Community";
  const venueName = { room: "Room", hall: "Hall", terrace: "Terrace", garden: "Garden/Park", office: "Office", roadside: "Roadside" }[venueType];

  const TABS = [
    { id: "timeline",  icon: "⏱", label: "Timeline" },
    { id: "checklist", icon: "✅", label: "Checklist" },
    { id: "ideas",     icon: "💡", label: "Ideas" },
  ];

  return (
    <div style={{ fontFamily: font }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🇮🇳</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: dark, letterSpacing: "-0.015em", marginBottom: 6 }}>
          Independence Day Guide
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,153,51,0.1)", border: "1px solid rgba(255,153,51,0.25)",
          borderRadius: 20, padding: "4px 14px",
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: saffron, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {label}{venueName ? ` · ${venueName}` : ""}
          </span>
        </div>
      </div>

      {/* Pill tabs */}
      <div style={{
        display: "flex", gap: 0, marginBottom: 20,
        background: "#F0E8DC", borderRadius: 14, padding: 4,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: "9px 6px", border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? dark : muted,
              background: tab === t.id ? white : "transparent",
              borderRadius: 10, transition: "all 0.15s",
              boxShadow: tab === t.id ? "0 1px 5px rgba(0,0,0,0.1)" : "none",
              fontFamily: font, whiteSpace: "nowrap",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {tab === "timeline" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {content.timeline.map((item, i) => {
            const isLast = i === content.timeline.length - 1;
            return (
              <div key={i} style={{
                display: "flex", gap: 13, alignItems: "flex-start",
                background: isLast ? "rgba(19,136,8,0.05)" : "rgba(255,153,51,0.05)",
                border: `1px solid ${isLast ? "rgba(19,136,8,0.18)" : "rgba(255,153,51,0.2)"}`,
                borderRadius: 13, padding: "12px 14px",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: isLast ? green : saffron,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 800, color: white, fontFamily: font,
                }}>{i + 1}</div>
                <div>
                  <div style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: isLast ? green : saffron, marginBottom: 4,
                  }}>{item.when}</div>
                  <div style={{ fontSize: 13.5, color: dark, lineHeight: 1.55, fontWeight: 500 }}>{item.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Checklist */}
      {tab === "checklist" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {content.checklist.map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, alignItems: "center",
              padding: "11px 14px", borderRadius: 11,
              background: "#FFFCF5", border: `1px solid ${border}`,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 7,
                border: `1.5px solid rgba(255,153,51,0.45)`,
                background: "rgba(255,153,51,0.07)", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, color: saffron, fontWeight: 700,
              }}>○</div>
              <div style={{ fontSize: 13.5, color: dark, lineHeight: 1.45, fontWeight: 500 }}>{item}</div>
            </div>
          ))}
        </div>
      )}

      {/* Ideas */}
      {tab === "ideas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {content.ideas.map((idea, i) => (
            <div key={i} style={{
              display: "flex", gap: 14, alignItems: "center",
              background: "#FFFCF5", borderRadius: 13, padding: "14px",
              border: `1px solid ${border}`,
            }}>
              <div style={{
                width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                background: "linear-gradient(135deg, rgba(255,153,51,0.14), rgba(19,136,8,0.08))",
                border: `1px solid rgba(255,153,51,0.22)`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>{idea.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: dark, marginBottom: 3, letterSpacing: "-0.01em" }}>{idea.title}</div>
                <div style={{ fontSize: 12.5, color: muted, lineHeight: 1.5 }}>{idea.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button style={{ ...primaryBtn, marginTop: 22 }} onClick={onBookServices}>
        Book Services Now 🇮🇳
      </button>
      <button
        onClick={onBack}
        style={{ ...outlineBtn, width: "100%", marginTop: 10, flex: "unset" }}
      >
        ← Edit My Details
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function IndependenceDayFlow({ onClose }) {
  const navigate = useNavigate();

  const [orgType, setOrgType]     = useState("");
  const [step, setStep]           = useState(0);
  const [services, setServices]   = useState([]);
  const [venueType, setVenueType] = useState("");
  const [hostName, setHostName]   = useState("");
  const [address, setAddress]     = useState("");
  const [guests, setGuests]       = useState("");
  const [datetime, setDatetime]   = useState("");
  const [budget, setBudget]       = useState("");

  const [decorMode, setDecorMode]           = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [venuePhotos, setVenuePhotos]       = useState([]);
  const [photosLoading, setPhotosLoading]   = useState(false);

  // Optional venue photo upload (Step 3 form)
  const [venuePhotoPreview, setVenuePhotoPreview] = useState(null);
  const venuePhotoRef = useRef();

  const [finalScreen, setFinalScreen] = useState(null);

  // Resume flow
  const [showResume, setShowResume]   = useState(false);
  const [savedDraft, setSavedDraft]   = useState(null);

  // Load draft on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && Date.now() - saved.savedAt < TTL && saved.orgType) {
        setSavedDraft(saved);
        setShowResume(true);
      }
    } catch {}
  }, []);

  // Save draft whenever form state changes
  useEffect(() => {
    if (!orgType) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        orgType, step, services, venueType, hostName, address, guests, datetime, budget,
        savedAt: Date.now(),
      }));
    } catch {}
  }, [orgType, step, services, venueType, hostName, address, guests, datetime, budget]);

  const hasDecorator = services.includes("decorator");
  const totalSteps = hasDecorator ? 5 : 4;

  useEffect(() => {
    if (!venueType || !hasDecorator) return;
    setPhotosLoading(true);
    fetch(`${BASE_URL}/independence-day-photos?venueType=${venueType}`)
      .then((r) => r.json())
      .then((data) => setVenuePhotos(Array.isArray(data) ? data : []))
      .catch(() => setVenuePhotos([]))
      .finally(() => setPhotosLoading(false));
  }, [venueType, hasDecorator]);

  const toggleService = (id) =>
    setServices((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]);

  const togglePhoto = (photo) =>
    setSelectedPhotos((p) =>
      p.find((x) => (x._id || x.id) === (photo._id || photo.id))
        ? p.filter((x) => (x._id || x.id) !== (photo._id || photo.id))
        : [...p, photo]
    );

  function sendToBaatKaro() {
    const serviceLabels = services
      .map((s) => SERVICES.find((x) => x.id === s)?.label)
      .filter(Boolean).join(", ");
    const venueLabel = VENUE_TYPES.find((v) => v.id === venueType)?.label || venueType;
    const orgLabel = orgType === "hr" ? "Corporate / Office" : "Community / Family";

    let msg =
      `🇮🇳 Independence Day Event Planning Request\n\n` +
      `Organiser Type: ${orgLabel}\n` +
      `Services Needed: ${serviceLabels || "Not specified"}\n` +
      `Venue Type: ${venueLabel || "Not specified"}\n` +
      (hostName  ? `Host Name: ${hostName}\n`     : "") +
      (address   ? `Address: ${address}\n`        : "") +
      (guests    ? `Expected Guests: ${guests}\n` : "") +
      (datetime  ? `Date & Time: ${datetime}\n`   : "") +
      (budget    ? `Budget: ₹${budget}\n`         : "") +
      `\nPlease help us plan this Independence Day celebration!`;

    if (venuePhotoPreview) {
      msg += `\n\n📸 Venue photo attached — customer has uploaded a photo of their space for reference.`;
    }
    if (selectedPhotos.length > 0) {
      msg += `\n\n🎀 Decoration Style References:\n`;
      selectedPhotos.forEach((p, i) => {
        msg += `${i + 1}. ${p.title} — ${p.description}\n`;
      });
    }

    try { sessionStorage.setItem("baat_karo_draft", msg); } catch {}
    try { localStorage.removeItem(STORAGE_KEY); } catch {}

    const chatPhotos = [];
    if (venuePhotoPreview) chatPhotos.push({ url: venuePhotoPreview, name: "Your venue", priceRange: "" });
    selectedPhotos.forEach((p) => chatPhotos.push({ url: p.url, name: p.title, priceRange: p.description }));

    if (chatPhotos.length > 0) {
      try { sessionStorage.setItem("gh_chat_photos", JSON.stringify(chatPhotos)); } catch {}
    } else {
      try { sessionStorage.removeItem("gh_chat_photos"); } catch {}
    }

    onClose();
    navigate("/baat-karo");
  }

  async function handleVenuePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setVenuePhotoPreview(compressed);
  }

  function restoreDraft(draft) {
    setOrgType(draft.orgType);
    setStep(draft.step);
    setServices(draft.services || []);
    setVenueType(draft.venueType || "");
    setHostName(draft.hostName || "");
    setAddress(draft.address || "");
    setGuests(draft.guests || "");
    setDatetime(draft.datetime || "");
    setBudget(draft.budget || "");
    setShowResume(false);
  }

  function startFresh() {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setShowResume(false);
  }

  const minDatetime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString().slice(0, 16);

  const stepTitles = [
    "Who's organising?",
    "What do you need?",
    "Where is the event?",
    "Event details",
    ...(hasDecorator ? ["Decoration style"] : []),
  ];

  // ── Resume screen ────────────────────────────────────────────────────────
  if (showResume && savedDraft) {
    const draftStep = (savedDraft.services?.includes("decorator") ? 5 : 4);
    const draftLabel = savedDraft.orgType === "hr" ? "Corporate / HR" : "Community / Family";
    return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={modal}>
          <div style={hdr}>
            <button style={closeBtn} onClick={onClose}>✕</button>
            <div style={{ fontSize: 28, marginBottom: 5 }}>🇮🇳</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: 2 }}>Welcome back!</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>You have a saved draft from earlier</div>
          </div>
          <div style={body}>
            <div style={{
              background: "rgba(255,153,51,0.08)", border: "1px solid rgba(255,153,51,0.25)",
              borderRadius: 12, padding: "13px 16px", marginBottom: 16,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: saffron, marginBottom: 5 }}>
                Saved progress
              </div>
              <div style={{ fontSize: 13, color: dark, fontWeight: 600 }}>{draftLabel}</div>
              {savedDraft.venueType && (
                <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>
                  {VENUE_TYPES.find(v => v.id === savedDraft.venueType)?.label || savedDraft.venueType}
                  {savedDraft.hostName ? ` · ${savedDraft.hostName}` : ""}
                </div>
              )}
              <div style={{ fontSize: 11, color: muted, marginTop: 4 }}>
                Step {savedDraft.step + 1} of {draftStep}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => restoreDraft(savedDraft)}
                style={{ ...primaryBtn, marginTop: 0 }}
              >
                Continue where I left off →
              </button>
              <button
                onClick={startFresh}
                style={{ ...outlineBtn, width: "100%", flex: "unset" }}
              >
                Start fresh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Plan & Ideas screen ──────────────────────────────────────────────────
  if (finalScreen === "planideas") {
    return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={modal}>
          <div style={hdr}>
            <button style={closeBtn} onClick={onClose}>✕</button>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", opacity: 0.85, marginBottom: 4 }}>
              PLAN & IDEAS
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Independence Day Guide</div>
          </div>
          <div style={body}>
            <PlanIdeas
              orgType={orgType}
              venueType={venueType}
              onBookServices={sendToBaatKaro}
              onBack={() => setFinalScreen("choice")}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Choice screen ────────────────────────────────────────────────────────
  if (finalScreen === "choice") {
    return (
      <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={modal}>
          <div style={hdr}>
            <button style={closeBtn} onClick={onClose}>✕</button>
            <div style={{ fontSize: 26, marginBottom: 6 }}>🇮🇳</div>
            <div style={{ fontSize: "1.15rem", fontWeight: 700 }}>You're all set!</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 3 }}>What would you like to do next?</div>
          </div>
          <div style={body}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={() => setFinalScreen("planideas")}
                style={{
                  padding: "18px 20px", borderRadius: 14,
                  border: `2px solid ${saffron}`, background: "rgba(255,153,51,0.05)",
                  cursor: "pointer", textAlign: "left", fontFamily: font,
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>📋</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: dark }}>See Plan & Ideas</div>
                <div style={{ fontSize: 12, color: muted, marginTop: 3, lineHeight: 1.5 }}>
                  View {orgType === "hr" ? "corporate" : "community"} event timeline, checklist & decoration ideas
                </div>
              </button>

              <button
                onClick={sendToBaatKaro}
                style={{
                  padding: "18px 20px", borderRadius: 14,
                  border: `2px solid ${border}`, background: white,
                  cursor: "pointer", textAlign: "left", fontFamily: font,
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>💬</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: dark }}>Book Services Directly</div>
                <div style={{ fontSize: 12, color: muted, marginTop: 3, lineHeight: 1.5 }}>
                  Send your event details to the Tendr team and get vendor recommendations
                </div>
              </button>
            </div>

            <button
              style={{ ...outlineBtn, width: "100%", marginTop: 12, flex: "unset" }}
              onClick={() => setFinalScreen(null)}
            >
              ← Edit my details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form steps ───────────────────────────────────────────────────────────
  function renderStep() {
    // Step 0: org type
    if (step === 0) return (
      <div>
        <p style={{ fontSize: 13.5, color: muted, margin: "0 0 18px", lineHeight: 1.6 }}>
          This helps us show you the right checklist, timeline and ideas.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => { setOrgType("hr"); setStep(1); }}
            style={{
              padding: "18px 20px", borderRadius: 14, cursor: "pointer", textAlign: "left",
              border: orgType === "hr" ? `2px solid ${saffron}` : `1.5px solid ${border}`,
              background: orgType === "hr" ? "rgba(255,153,51,0.07)" : white,
              fontFamily: font,
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 6 }}>🏢</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: dark }}>Corporate / HR</div>
            <div style={{ fontSize: 12.5, color: muted, marginTop: 3, lineHeight: 1.5 }}>
              Planning an Independence Day event for your office or organisation
            </div>
          </button>

          <button
            onClick={() => { setOrgType("community"); setStep(1); }}
            style={{
              padding: "18px 20px", borderRadius: 14, cursor: "pointer", textAlign: "left",
              border: orgType === "community" ? `2px solid ${saffron}` : `1.5px solid ${border}`,
              background: orgType === "community" ? "rgba(255,153,51,0.07)" : white,
              fontFamily: font,
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 6 }}>🏘️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: dark }}>Community / Family</div>
            <div style={{ fontSize: 12.5, color: muted, marginTop: 3, lineHeight: 1.5 }}>
              Planning for a housing society, colony, RWA or family gathering
            </div>
          </button>
        </div>
      </div>
    );

    // Step 1: services
    if (step === 1) return (
      <div>
        <p style={{ fontSize: 13.5, color: muted, margin: "0 0 16px", lineHeight: 1.6 }}>
          Select everything you need for the celebration:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {SERVICES.map((s) => (
            <div key={s.id} onClick={() => toggleService(s.id)} style={chip(services.includes(s.id))}>
              <span style={{ fontSize: 18 }}>{s.icon}</span>
              <span>{s.label}</span>
              {services.includes(s.id) && <span style={{ marginLeft: "auto", color: saffron }}>✓</span>}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button style={outlineBtn} onClick={() => setStep(0)}>← Back</button>
          <button
            style={{ ...primaryBtn, marginTop: 0, flex: 2, opacity: services.length ? 1 : 0.5 }}
            disabled={!services.length}
            onClick={() => setStep(2)}
          >Next →</button>
        </div>
      </div>
    );

    // Step 2: venue type
    if (step === 2) return (
      <div>
        <p style={{ fontSize: 13.5, color: muted, margin: "0 0 16px", lineHeight: 1.6 }}>
          Where are you hosting the event?
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
          {VENUE_TYPES.map((v) => (
            <div
              key={v.id}
              onClick={() => setVenueType(v.id)}
              style={{ ...chip(venueType === v.id), flexDirection: "column", textAlign: "center", padding: "14px 10px", gap: 6 }}
            >
              <span style={{ fontSize: 24 }}>{v.icon}</span>
              <span style={{ fontSize: 13 }}>{v.label}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button style={outlineBtn} onClick={() => setStep(1)}>← Back</button>
          <button
            style={{ ...primaryBtn, marginTop: 0, flex: 2, opacity: venueType ? 1 : 0.5 }}
            disabled={!venueType}
            onClick={() => setStep(3)}
          >Next →</button>
        </div>
      </div>
    );

    // Step 3: details
    if (step === 3) return (
      <div>
        <p style={{ fontSize: 13.5, color: muted, margin: "0 0 18px", lineHeight: 1.6 }}>Tell us about your event:</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <span style={label(false)}>
              {orgType === "hr" ? "Company & Organiser Name" : "Host Name"} *
            </span>
            <input
              style={inp}
              placeholder={orgType === "hr" ? "e.g. Acme Corp — Priya Sharma (HR)" : "e.g. Ramesh Gupta"}
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
            />
          </div>
          <div>
            <span style={label(false)}>
              {orgType === "hr" ? "Office / Venue Address" : "Address"} *
            </span>
            <input
              style={inp}
              placeholder="Full address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <span style={label(true)}>
                {orgType === "hr" ? "Employees" : "Guests"} (optional)
              </span>
              <input
                style={inp}
                type="number"
                placeholder={orgType === "hr" ? "120" : "80"}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>
            <div>
              <span style={label(false)}>Date &amp; Time *</span>
              <input
                style={{ ...inp, fontSize: 12.5 }}
                type="datetime-local"
                min={minDatetime}
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
              />
            </div>
          </div>
          <div>
            <span style={label(true)}>Budget (optional)</span>
            <input
              style={inp}
              placeholder="e.g. 50000"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
          {/* Optional venue photo */}
          <div>
            <span style={label(true)}>Your venue photo (optional)</span>
            <p style={{ fontSize: 11.5, color: muted, margin: "2px 0 8px", lineHeight: 1.5 }}>
              Helps us suggest decoration styles that suit your space
            </p>
            <input ref={venuePhotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleVenuePhotoChange} />
            {venuePhotoPreview ? (
              <div style={{ position: "relative" }}>
                <img src={venuePhotoPreview} alt="Venue preview" style={{ width: "100%", borderRadius: 10, maxHeight: 130, objectFit: "cover", display: "block" }} />
                <button
                  onClick={() => { setVenuePhotoPreview(null); venuePhotoRef.current.value = ""; }}
                  style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", width: 22, height: 22, color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}
                >✕</button>
              </div>
            ) : (
              <button
                onClick={() => venuePhotoRef.current?.click()}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px dashed ${saffron}`, background: "rgba(255,153,51,0.04)", cursor: "pointer", fontSize: 13, color: saffron, fontWeight: 600, fontFamily: font, textAlign: "center" }}
              >
                📷 Upload from device
              </button>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button style={outlineBtn} onClick={() => setStep(2)}>← Back</button>
          <button
            style={{ ...primaryBtn, marginTop: 0, flex: 2, opacity: (hostName && address && datetime) ? 1 : 0.5 }}
            disabled={!(hostName && address && datetime)}
            onClick={() => hasDecorator ? setStep(4) : setFinalScreen("choice")}
          >
            {hasDecorator ? "Next →" : "Continue →"}
          </button>
        </div>
      </div>
    );

    // Step 4: decor picker
    if (step === 4 && hasDecorator) {
      if (!decorMode) return (
        <div>
          <p style={{ fontSize: 13.5, color: muted, margin: "0 0 6px", lineHeight: 1.6 }}>
            Pick decoration ideas for your <strong>{VENUE_TYPES.find((v) => v.id === venueType)?.label}</strong>.
          </p>
          <p style={{ fontSize: 12, color: muted, margin: "0 0 20px" }}>
            Browse curated Independence Day styles and tap any that inspire you.
          </p>
          <button
            onClick={() => setDecorMode("browse")}
            style={{ width: "100%", padding: "18px 20px", borderRadius: 14, border: `1.5px solid ${border}`, background: white, cursor: "pointer", textAlign: "left", fontFamily: font }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>🖼️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: dark }}>See all reference images</div>
            <div style={{ fontSize: 12, color: muted, marginTop: 3 }}>Browse curated Independence Day decoration styles</div>
          </button>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button style={outlineBtn} onClick={() => setStep(3)}>← Back</button>
            <button style={{ ...primaryBtn, marginTop: 0, flex: 2, background: "#E8D8C4", color: muted, fontFamily: font }} onClick={() => setFinalScreen("choice")}>
              Skip & continue
            </button>
          </div>
        </div>
      );

      if (decorMode === "browse") return (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: dark, marginBottom: 10 }}>
            Styles for your {VENUE_TYPES.find((v) => v.id === venueType)?.label}:
          </div>
          {photosLoading ? (
            <div style={{ color: muted, fontSize: 13, padding: "12px 0" }}>Loading styles…</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {venuePhotos.map((photo) => (
                <PhotoCard key={photo._id} photo={photo} selected={!!selectedPhotos.find((p) => p._id === photo._id)} onToggle={togglePhoto} />
              ))}
            </div>
          )}
        </div>
      );
    }
  }

  const showPhotoFooter = decorMode === "browse";

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <div style={hdr}>
          <button style={closeBtn} onClick={onClose}>✕</button>
          <div style={{ fontSize: 26, marginBottom: 4 }}>🇮🇳</div>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", opacity: 0.8, marginBottom: 3, textTransform: "uppercase" }}>
            Step {step + 1} of {totalSteps}
          </div>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>{stepTitles[step]}</div>
          <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 3 }}>Independence Day Celebration</div>
          <ProgressBar current={step} total={totalSteps} />
        </div>
        <div style={body}>{renderStep()}</div>
        {showPhotoFooter && (
          <div style={{
            flexShrink: 0,
            borderTop: "1.5px solid rgba(232,216,196,0.6)",
            background: "#FFFCF5",
            padding: "10px 18px",
            paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
          }}>
            {selectedPhotos.length > 0 && (
              <div style={{ background: "rgba(255,153,51,0.08)", borderRadius: 10, padding: "8px 13px", marginBottom: 10, fontSize: 13, color: saffron, fontWeight: 600, fontFamily: font }}>
                ✓ {selectedPhotos.length} style{selectedPhotos.length > 1 ? "s" : ""} selected — will go with your request
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button style={outlineBtn} onClick={() => { setDecorMode(null); setSelectedPhotos([]); }}>← Back</button>
              <button style={{ ...primaryBtn, marginTop: 0, flex: 2 }} onClick={() => setFinalScreen("choice")}>Continue →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
