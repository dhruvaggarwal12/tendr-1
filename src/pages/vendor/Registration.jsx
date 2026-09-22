import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font  = "'Outfit', sans-serif";
const gold  = "#C47A2E";
const ink   = "#1C0E04";
const muted = "#7A5535";

// ─── Data ─────────────────────────────────────────────────────────────────────

const _s = (d) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const ARTIST_TYPES = [
  { value: "DJ",               label: "DJ",               sub: "Open format, commercial, wedding",                        icon: _s(<><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></>) },
  { value: "Anchor",           label: "Anchor / Emcee",   sub: "Weddings, corporate, award nights",                       icon: _s(<><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10a7 7 0 0 0 14 0"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></>) },
  { value: "Emcee/Host",       label: "Emcee / Host",     sub: "Stage hosting & live shows",                              icon: _s(<><line x1="5" y1="3" x2="5" y2="21"/><line x1="19" y1="3" x2="19" y2="21"/><line x1="2" y1="5" x2="22" y2="5"/><line x1="2" y1="19" x2="22" y2="19"/></>) },
  { value: "Band",             label: "Band",             sub: "Live music — Bollywood, jazz, rock",                      icon: _s(<><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z"/><path d="M2 18C2 13 7 8 12 8s10 5 10 10"/><line x1="9" y1="5" x2="12" y2="8"/><line x1="15" y1="5" x2="12" y2="8"/></>) },
  { value: "Singer",           label: "Singer",           sub: "Solo vocalist, all genres",                               icon: _s(<><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></>) },
  { value: "Musician",         label: "Musician",         sub: "Instrumentalist — piano, tabla, violin",                  icon: _s(<><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></>) },
  { value: "Performer",        label: "Solo Performer",   sub: "Dancer, acrobat, circus & specialty act", hasArtForm: true, icon: _s(<><circle cx="12" cy="4" r="2"/><path d="M7 22l5-8 5 8"/><path d="M9 14l-2 4"/><path d="M15 14l2 4"/><path d="M9 10l3-4 3 4"/></>) },
  { value: "Stand-up Comedian",label: "Stand-up Comedian",sub: "Corporate & private shows",                               icon: _s(<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>) },
  { value: "Magician",         label: "Magician",         sub: "Close-up & stage magic",                                  icon: _s(<><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8L19 13"/><path d="M15 9h.01"/><path d="M17.8 6.2L19 5"/><path d="M3 21l9-9"/><path d="M12.2 6.2L11 5"/></>) },
  { value: "AV Setup",         label: "AV Setup",         sub: "Projector, LED wall, live streaming",                     icon: _s(<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>) },
  { value: "Choreographer",   label: "Choreographer",    sub: "Sangeet, wedding & group choreography",                   icon: _s(<><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/><path d="M7 22l3-8-2-3 4-4 4 4-2 3 3 8"/></>) },
  { value: "Makeup Artist",   label: "Makeup Artist",    sub: "Bridal, party, editorial looks",                          icon: _s(<><path d="M2 22l10-10"/><path d="M17 17l4-4a3 3 0 0 0-4-4L7 15a5 5 0 0 0 7 7z"/></>) },
  { value: "Mehendi Artist",  label: "Mehendi Artist",   sub: "Bridal, bridesmaid & guest mehendi",                      icon: _s(<><path d="M12 22s-6-3-6-9V6l6-3 6 3v7c0 6-6 9-6 9z"/></>) },
  { value: "Hair Stylist",    label: "Hair Stylist",     sub: "Bridal updo, extensions, styling",                        icon: _s(<><circle cx="6" cy="6" r="3"/><path d="M8.12 8.12L12 12"/><path d="M20 4l-8.12 8.12"/><circle cx="20" cy="4" r="2"/><path d="M14.8 14.8L20 20"/></>) },
  { value: "Cake Artist",     label: "Cake Artist",      sub: "Custom cakes, wedding & fondant",                         icon: _s(<><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 1.5-2 3-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></>) },
  { value: "Bartender",       label: "Bartender",        sub: "Cocktails, mocktails, bar setup",                         icon: _s(<><path d="M8 22h8"/><path d="M12 11v11"/><path d="m19 3-7 8-7-8z"/></>) },
];

const VENDOR_TYPES = [
  { value: "Decorator",        label: "Decorator",        sub: "Floral, balloon, draping, lighting",  icon: _s(<><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></>) },
  { value: "Caterer",          label: "Caterer",          sub: "Food service, live counters, buffet", icon: _s(<><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>) },
  { value: "Photographer",     label: "Photographer",     sub: "Candid, traditional, pre-wedding",   icon: _s(<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>) },
  { value: "Videographer",     label: "Videographer",     sub: "Cinematic, reels, drone coverage",   icon: _s(<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>) },
  { value: "Food Truck",       label: "Food Truck",       sub: "Live counters, chaat, dosa, pizza",  icon: _s(<><path d="M14 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3"/><path d="M18 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M10 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M14 5h4l3 4.5V17h-7V5z"/></>) },
  { value: "Wedding Planner",  label: "Wedding Planner",  sub: "Full planning, day coordination",    icon: _s(<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></>) },
  { value: "Live Streaming",   label: "Live Streaming",   sub: "YouTube, Zoom, multi-camera events", icon: _s(<><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>) },
  { value: "Photo Booth",      label: "Photo Booth",      sub: "360, open-air, prints & GIF booths", icon: _s(<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><line x1="12" y1="9" x2="12.01" y2="9"/><circle cx="12" cy="15" r="3"/></>) },
  { value: "Gift & Favours",   label: "Gift & Favours",   sub: "Return gifts, hampers, packaging",   icon: _s(<><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></>) },
  { value: "Transportation",   label: "Transportation",   sub: "Wedding cars, buses, logistics",     icon: _s(<><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>) },
  { value: "Security",         label: "Security",         sub: "Event security & crowd management",  icon: _s(<><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>) },
  { value: "Other",            label: "Other",            sub: "Describe your service below",        icon: _s(<><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>) },
];

const PERFORMER_ART_FORMS = [
  { value: "Classical Dance",      label: "Classical Dance",      sub: "Bharatnatyam · Kathak · Odissi · Kuchipudi", emoji: "🪷" },
  { value: "Contemporary Dance",   label: "Contemporary Dance",   sub: "Hip-hop · Breaking · Freestyle · Jazz", emoji: "💃" },
  { value: "Folk & Cultural Dance",label: "Folk & Cultural Dance",sub: "Bhangra · Garba · Lavani · Bihu · Ghoomar", emoji: "🎊" },
  { value: "Aerial & Acrobatics",  label: "Aerial & Acrobatics",  sub: "Silk aerials · Hoop · Contortion · Tumbling", emoji: "🎪" },
  { value: "Fire & Circus Arts",   label: "Fire & Circus Arts",   sub: "Fire poi · Juggling · Clowning · Stilt walk", emoji: "🔥" },
  { value: "Belly Dance / Sufi",   label: "Belly Dance / Sufi",   sub: "Sufi whirling · Belly dance · Tribal fusion", emoji: "✨" },
  { value: "Mime & Physical Theater",label: "Mime & Physical Theater",sub: "Street mime · Physical comedy · Living statue", emoji: "🎭" },
  { value: "Other Art Form",       label: "Other / Mixed",        sub: "Combination or a style not listed here", emoji: "🎨" },
];

const COORDINATOR_SPECIALIZATIONS = [
  "Wedding Planning", "Corporate Events", "Birthday & Private Parties",
  "Social Events (Baby Shower, Anniversary)", "Award Nights & Galas",
  "Musical Nights / Concerts", "Exhibitions & Product Launches", "Sports Events",
];

const CITY_OPTIONS = [
  "Delhi", "Noida", "Gurugram", "Ghaziabad", "Faridabad",
  "Mumbai", "Pune", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Jaipur", "Chandigarh",
];

const ARTIST_PERFORMER_TYPES = [
  { value: "Singer",        label: "Singer",        emoji: "🎤", sub: "Solo vocalist — Bollywood, classical, western & more" },
  { value: "Band",          label: "Live Band",      emoji: "🎸", sub: "Bollywood, jazz, rock or fusion band" },
  { value: "Anchor",        label: "Anchor",         emoji: "🎙️", sub: "Professional host for weddings & events" },
  { value: "Choreographer", label: "Choreographer",  emoji: "💃", sub: "Dance performances & group choreography" },
  { value: "Musician",      label: "Musician",       emoji: "🎹", sub: "Instrumentalist — piano, guitar, tabla & more" },
  { value: "Emcee",         label: "Emcee",          emoji: "🎭", sub: "Master of ceremonies for any occasion" },
];

const ARTIST_GENRES = {
  Singer:        ["Bollywood", "Classical", "Western/Pop", "Ghazal/Sufi", "Folk", "Jazz", "Devotional"],
  Band:          ["Bollywood", "Rock/Jazz", "Fusion", "Devotional", "Retro", "EDM"],
  Anchor:        ["Hindi", "English", "Bilingual", "Corporate", "Wedding", "Comedy"],
  Choreographer: ["Bollywood", "Classical", "Contemporary", "Hip-Hop", "Sangeet/Wedding", "Folk"],
  Musician:      ["Piano", "Guitar", "Tabla", "Violin", "Flute", "Saxophone", "Sitar", "Multiple"],
  Emcee:         ["Hindi", "English", "Bilingual", "Corporate", "Wedding", "Stand-up/Comedy"],
};

const DURATION_OPTIONS = ["30–45 min", "1 hour", "2 hours", "3 hours", "Full event (4+ hrs)", "Flexible"];
const PRICE_RANGE_OPTIONS = ["Under ₹5,000", "₹5,000–10,000", "₹10,000–25,000", "₹25,000–50,000", "₹50,000+", "Negotiable"];

const VENDOR_SERVICE_TYPES = [
  { value: "Decorator",      label: "Decorator / Event Stylist",   sub: "Floral, balloon, LED, draping" },
  { value: "Caterer",        label: "Caterer / Food Service",      sub: "Buffet, live counters, delivery" },
  { value: "Photographer",   label: "Photographer / Videographer", sub: "Candid, cinematic, drone" },
  { value: "DJ",             label: "DJ",                          sub: "Open format, Bollywood, EDM" },
  { value: "Florist",        label: "Florist",                     sub: "Wedding & event florals" },
  { value: "AV Setup",       label: "AV / Tech Setup",             sub: "Projector, LED wall, sound" },
  { value: "Venue",          label: "Venue / Banquet Hall",        sub: "Indoor, outdoor, rooftop" },
  { value: "Baker",          label: "Baker / Cake Studio",         sub: "Wedding, birthday, custom cakes" },
  { value: "Transportation", label: "Transportation",              sub: "Cars, buses, vintage vehicles" },
  { value: "Makeup Artist",  label: "Makeup Artist / Hair Stylist",sub: "Bridal, party, editorial" },
  { value: "Other",          label: "Other",                       sub: "Something not listed above" },
];

const CATEGORY_QUESTIONS = {
  Decorator: [
    { id: "specializations", label: "Specializations", type: "chips", options: ["Floral", "Balloon", "LED/Lighting", "Draping", "Minimal", "Grand/Royal", "Mehendi"] },
    { id: "inventory",       label: "Own inventory?",  type: "radio", options: ["Own", "Rented", "Mix of both"] },
    { id: "teamSize",        label: "Team size",        type: "radio", options: ["Solo", "2–5", "5–10", "10+"] },
    { id: "minBooking",      label: "Min booking value",type: "radio", options: ["< ₹10K", "₹10–25K", "₹25–50K", "₹50K+"] },
  ],
  Caterer: [
    { id: "cuisines",     label: "Cuisines served",    type: "chips", options: ["North Indian", "South Indian", "Continental", "Chinese", "Mughlai", "Multi-cuisine"] },
    { id: "serviceStyle", label: "Service style",      type: "chips", options: ["Buffet", "Live Counters", "Plated Service", "Home Delivery"] },
    { id: "capacity",     label: "Max guest capacity", type: "radio", options: ["Up to 50", "50–200", "200–500", "500–1000", "1000+"] },
    { id: "foodType",     label: "Food type",          type: "radio", options: ["Pure Veg", "Non-Veg", "Both"] },
  ],
  Photographer: [
    { id: "style",        label: "Photography style",  type: "chips", options: ["Candid", "Traditional", "Cinematic", "Documentary", "Drone/Aerial"] },
    { id: "teamSize",     label: "Team",                type: "radio", options: ["Solo", "Duo", "Full team (3+)"] },
    { id: "portfolioLink",label: "Portfolio link",      type: "text",  placeholder: "https://your-portfolio.com" },
    { id: "delivery",     label: "Delivery timeline",  type: "radio", options: ["Within 1 week", "2–4 weeks", "1–2 months"] },
  ],
  DJ: [
    { id: "genres",      label: "Music genres",  type: "chips", options: ["Bollywood", "EDM", "Hip-Hop", "Commercial", "Retro", "All genres"] },
    { id: "equipment",   label: "Equipment",     type: "radio", options: ["Own setup", "Venue provides", "Both"] },
    { id: "setDuration", label: "Set duration",  type: "radio", options: ["2–4 hrs", "4–6 hrs", "6–8 hrs", "Full day"] },
  ],
  Florist: [
    { id: "specialization", label: "Specialization", type: "chips", options: ["Wedding", "Birthday/Events", "Corporate", "Gifting"] },
    { id: "delivery",       label: "Services",       type: "radio", options: ["Delivery + Setup", "Venue setup only", "Pickup only"] },
  ],
  "AV Setup": [
    { id: "equipment", label: "Equipment offered", type: "chips", options: ["Projector/Screen", "LED Wall", "Sound System", "Stage Lighting", "Complete AV"] },
    { id: "techTeam",  label: "Tech team",         type: "radio", options: ["Own team", "Freelance", "Both"] },
  ],
  Venue: [
    { id: "capacity",  label: "Guest capacity", type: "radio", options: ["Up to 50", "50–200", "200–500", "500–1000", "1000+"] },
    { id: "type",      label: "Venue type",     type: "radio", options: ["Indoor", "Outdoor", "Both"] },
    { id: "ac",        label: "Air conditioned",type: "radio", options: ["Yes", "No", "Partly"] },
    { id: "catering",  label: "Catering policy",type: "radio", options: ["In-house only", "External allowed", "Both"] },
  ],
  Baker: [
    { id: "specialization", label: "Specialization",   type: "chips", options: ["Wedding Cakes", "Birthday Cakes", "Cupcakes", "Custom/Fondant", "Dessert Tables"] },
    { id: "leadTime",       label: "Lead time needed", type: "radio", options: ["Same day", "2–3 days", "1 week", "2+ weeks"] },
    { id: "delivery",       label: "Delivery",         type: "radio", options: ["Delivery available", "Pickup only"] },
  ],
  Transportation: [
    { id: "vehicles", label: "Vehicle types", type: "chips", options: ["Car/SUV", "Bus/Mini-bus", "Vintage Car", "Tempo Traveller", "Luxury Coach"] },
    { id: "fleet",    label: "Fleet",         type: "radio", options: ["Own fleet", "Third-party tie-up", "Both"] },
  ],
  "Makeup Artist": [
    { id: "specialization", label: "Specialization", type: "chips", options: ["Bridal Makeup", "Party Makeup", "Hair Styling", "Mehendi", "Editorial"] },
    { id: "travel",         label: "Travel to client?",type: "radio", options: ["Yes", "Studio only", "Both"] },
  ],
};

const TRUST = [
  { n: "15%", label: "Commission",  sub: "15% platform fee on confirmed bookings only" },
  { n: "Free",  label: "To list",    sub: "No monthly fees, no hidden charges" },
  { n: "24 hrs",label: "Review time",sub: "Our team reviews every application fast" },
];

// ─── Step bar ─────────────────────────────────────────────────────────────────

function StepBar({ step, steps = ["Category", "Specialty", "Details"] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 36 }}>
      {steps.map((label, i) => {
        const s = i + 1;
        const done   = step > s;
        const active = step === s;
        return (
          <React.Fragment key={s}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, fontFamily: font,
                background: done ? gold : active ? "#fff" : "#f3ede6",
                color: done ? "#fff" : active ? gold : "#B8956A",
                border: active ? `2px solid ${gold}` : done ? `2px solid ${gold}` : "2px solid #E5D5C0",
                transition: "all 0.25s",
              }}>
                {done
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : s}
              </div>
              <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 500, color: active ? gold : done ? gold : "#B8956A", fontFamily: font, letterSpacing: "0.02em" }}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: step > s ? gold : "#E5D5C0", margin: "0 6px", marginBottom: 20, borderRadius: 2, transition: "background 0.3s" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Shell layout ─────────────────────────────────────────────────────────────

const FREE_FEATS = ["Profile & portfolio", "Discovered by clients", "Receive leads", "15% only on Tendr bookings", "Always free to list"];
const PAID_FEATS = ["Bookings & availability calendar", "Client CRM & reviews", "Quotes, invoices & contracts", "Payments & profit tracking", "Smart reminders & alerts", "Business insights & analytics", "Flyer builder & link hub", "Hindi & English support", "0% commission on outside bookings"];

function Shell({ children, step, steps, narrow = true, sideTitle, sideSub, sideTiers }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F9F6F1", fontFamily: font }}>
      <style>{`
        @media (min-width: 900px) {
          .reg-wrap { display: grid !important; grid-template-columns: 320px 1fr !important; min-height: 100vh !important; }
          .reg-side  { display: flex !important; }
          .reg-main  { padding: 64px 64px !important; }
        }
      `}</style>
      <div className="reg-wrap" style={{ display: "block" }}>

        {/* Left brand panel (desktop only) */}
        <div className="reg-side" style={{ display: "none", flexDirection: "column", justifyContent: "space-between", background: "#1C0E04", padding: "52px 36px" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#F5ECD8", letterSpacing: "-0.01em", marginBottom: 8 }}>tendr</div>
            <div style={{ width: 32, height: 2, background: gold, borderRadius: 2, marginBottom: 32 }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.6rem,2.5vw,2.2rem)", fontWeight: 500, color: "#F5ECD8", lineHeight: 1.2, margin: "0 0 16px", fontStyle: "italic" }}>
              {sideTitle || "Get discovered by thousands of event planners in Delhi NCR."}
            </h2>
            <p style={{ fontSize: 14, color: "rgba(245,236,216,0.55)", lineHeight: 1.7, margin: "0 0 28px" }}>
              {sideSub || "Join Tendr's verified network — real clients, real bookings, 15% platform fee."}
            </p>
          </div>

          {sideTiers ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Free tier summary */}
              <div style={{ borderRadius: 12, border: "1px solid rgba(196,122,46,0.22)", padding: "14px 16px" }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(196,122,46,0.65)", marginBottom: 5 }}>Free listing</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#F5ECD8", marginBottom: 10 }}>₹0 forever</div>
                {FREE_FEATS.map(f => (
                  <div key={f} style={{ fontSize: 11.5, color: "rgba(245,236,216,0.48)", display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 5 }}>
                    <span style={{ color: gold, flexShrink: 0, lineHeight: 1.5 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              {/* Paid tier summary */}
              <div style={{ borderRadius: 12, border: `1.5px solid ${gold}`, padding: "14px 16px", background: "rgba(196,122,46,0.07)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold }}>Dashboard</div>
                  <div style={{ fontSize: 9.5, fontWeight: 800, color: "#1C0E04", background: gold, padding: "2px 8px", borderRadius: 100 }}>7 days free</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#F5ECD8" }}>₹399 <span style={{ fontSize: 11, fontWeight: 400, color: "rgba(245,236,216,0.45)" }}>+ GST / month</span></div>
                <div style={{ fontSize: 10.5, color: "rgba(245,236,216,0.38)", marginBottom: 10 }}>after free trial · no card needed</div>
                {PAID_FEATS.slice(0, 5).map(f => (
                  <div key={f} style={{ fontSize: 11.5, color: "rgba(245,236,216,0.48)", display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 5 }}>
                    <span style={{ color: gold, flexShrink: 0, lineHeight: 1.5 }}>✓</span>{f}
                  </div>
                ))}
                <div style={{ fontSize: 11, color: "rgba(196,122,46,0.6)", marginTop: 6 }}>+{PAID_FEATS.length - 5} more features</div>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {TRUST.map(t => (
                <div key={t.n} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 400, color: gold, flexShrink: 0, lineHeight: 1 }}>{t.n}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#F5ECD8", marginBottom: 2 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: "rgba(245,236,216,0.45)", lineHeight: 1.5 }}>{t.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right content */}
        <div className="reg-main" style={{ padding: "36px 20px 60px", maxWidth: narrow ? 540 : "100%", margin: narrow ? "0 auto" : 0 }}>
          {step && <StepBar step={step} steps={steps} />}
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Shared input helpers ─────────────────────────────────────────────────────

function inputStyle(focused, errors, field, gold, ink) {
  return {
    width: "100%", padding: "13px 16px", borderRadius: 10, fontSize: 15, fontFamily: font,
    color: ink, background: "#fff", outline: "none", boxSizing: "border-box",
    border: `1.5px solid ${errors[field] ? "#c0392b" : focused === field ? gold : "rgba(28,14,4,0.14)"}`,
    transition: "border-color 0.18s",
  };
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p style={{ fontSize: 12, color: "#c0392b", marginTop: 4, fontFamily: font }}>{msg}</p>;
}

function Label({ children, required, optional }) {
  return (
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6B3A1F", marginBottom: 6, fontFamily: font }}>
      {children}
      {required && <span style={{ color: gold }}> *</span>}
      {optional && <span style={{ color: "#aaa", fontWeight: 400 }}> (optional)</span>}
    </label>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ name, isCoordinator, navigate }) {
  return (
    <div style={{ minHeight: "100vh", background: "#F9F6F1", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: font }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "48px 36px", maxWidth: 440, width: "100%", textAlign: "center", border: "1px solid rgba(28,14,4,0.07)", boxShadow: "0 4px 24px rgba(28,14,4,0.07)" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(196,122,46,0.1)", border: `2px solid rgba(196,122,46,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: ink, margin: "0 0 10px" }}>Application Submitted</h2>
        <p style={{ fontSize: 14, color: muted, margin: "0 0 28px", lineHeight: 1.65 }}>
          Thank you, <strong>{name?.split(" ")[0]}</strong>. Our team will review your details and reach you{" "}
          {isCoordinator ? "via phone" : "on WhatsApp"} within 24–48 hours.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {!isCoordinator && (
            <button onClick={() => navigate("/vendor/status")} style={{ background: "#fff", color: gold, border: `1.5px solid rgba(196,122,46,0.4)`, borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>
              Check Status
            </button>
          )}
          <button onClick={() => navigate("/")} style={{ background: gold, color: "#fff", border: "none", borderRadius: 10, padding: "11px 24px", fontSize: 14, fontWeight: 600, fontFamily: font, cursor: "pointer" }}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Coordinator Registration Flow ────────────────────────────────────────────

function CoordinatorForm({ onBack, onSuccess }) {
  const [form, setForm] = useState({
    name: "", phoneNumber: "", email: "", city: "",
    experience: "", eventsPerMonth: "", specializations: [],
    bio: "", instagram: "", portfolioLink: "",
    password: "", confirmPassword: "",
  });
  const [errors, setErrors]   = useState({});
  const [focused, setFocused] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPw, setShowPw]   = useState(false);

  const iStyle = (f) => inputStyle(focused, errors, f, gold, ink);

  const toggle = (spec) => setForm(p => ({
    ...p,
    specializations: p.specializations.includes(spec)
      ? p.specializations.filter(s => s !== spec)
      : [...p.specializations, spec],
  }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())            e.name = "Name is required";
    if (!form.phoneNumber.trim())     e.phoneNumber = "Phone is required";
    else if (!/^[6-9]\d{9}$/.test(form.phoneNumber)) e.phoneNumber = "Enter a valid 10-digit number";
    if (!form.email.trim())           e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.city.trim())            e.city = "City is required";
    if (!form.password)               e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    if (form.confirmPassword !== form.password) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch(`${BASE_URL}/coordinators/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:             form.name.trim(),
          phoneNumber:      form.phoneNumber.trim(),
          email:            form.email.trim(),
          city:             form.city.trim(),
          experience:       form.experience,
          eventsPerMonth:   form.eventsPerMonth,
          specializations:  form.specializations,
          bio:              form.bio.trim(),
          instagram:        form.instagram.trim(),
          portfolioLink:    form.portfolioLink.trim(),
          password:         form.password,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setApiError(data.error || "Account already exists with this phone number.");
        else setApiError(data.error || "Submission failed. Please try again.");
        return;
      }
      onSuccess(form.name);
    } catch {
      setApiError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell
      step={2}
      steps={["Category", "Your Details"]}
      narrow
      sideTitle="Manage real events, earn real income."
      sideSub="Tendr's Event Coordinator program — handle client chats, plan events, earn commissions."
    >
      <button onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 24, padding: 0 }}>
        ← Back
      </button>

      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>Event Coordinator</p>
        <h1 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: ink, margin: "0 0 4px" }}>Tell us about yourself</h1>
        <p style={{ fontSize: 14, color: muted, margin: 0 }}>Our team will review and reach you within 24–48 hours.</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: "24px 22px", border: "1px solid rgba(28,14,4,0.07)", boxShadow: "0 2px 12px rgba(28,14,4,0.05)" }}>
        {apiError && (
          <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 16px", fontSize: 13, color: "#c0392b", marginBottom: 20 }}>{apiError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Name */}
          <div>
            <Label required>Full Name</Label>
            <input value={form.name} onChange={e => { setForm(p => ({...p, name: e.target.value})); setErrors(p => ({...p, name: ""})); }}
              onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
              placeholder="e.g. Priya Sharma" style={iStyle("name")} />
            <FieldError msg={errors.name} />
          </div>

          {/* Phone + Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <Label required>Phone</Label>
              <input value={form.phoneNumber} onChange={e => { setForm(p => ({...p, phoneNumber: e.target.value})); setErrors(p => ({...p, phoneNumber: ""})); }}
                onFocus={() => setFocused("phoneNumber")} onBlur={() => setFocused("")}
                placeholder="10-digit" maxLength={10} type="tel" style={iStyle("phoneNumber")} />
              <FieldError msg={errors.phoneNumber} />
            </div>
            <div>
              <Label required>Email</Label>
              <input value={form.email} onChange={e => { setForm(p => ({...p, email: e.target.value})); setErrors(p => ({...p, email: ""})); }}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                placeholder="you@email.com" type="email" style={iStyle("email")} />
              <FieldError msg={errors.email} />
            </div>
          </div>

          {/* City */}
          <div>
            <Label required>Primary City</Label>
            <input value={form.city} onChange={e => { setForm(p => ({...p, city: e.target.value})); setErrors(p => ({...p, city: ""})); }}
              onFocus={() => setFocused("city")} onBlur={() => setFocused("")}
              placeholder="e.g. Delhi, Noida, Gurgaon" style={iStyle("city")} />
            <FieldError msg={errors.city} />
          </div>

          {/* Experience + Events/Month */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <Label optional>Years of Experience</Label>
              <select value={form.experience} onChange={e => setForm(p => ({...p, experience: e.target.value}))}
                onFocus={() => setFocused("experience")} onBlur={() => setFocused("")}
                style={{ ...iStyle("experience"), appearance: "none" }}>
                <option value="">Select</option>
                {["< 1 year", "1–2 years", "3–5 years", "5–10 years", "10+ years"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <Label optional>Events per Month</Label>
              <select value={form.eventsPerMonth} onChange={e => setForm(p => ({...p, eventsPerMonth: e.target.value}))}
                onFocus={() => setFocused("eventsPerMonth")} onBlur={() => setFocused("")}
                style={{ ...iStyle("eventsPerMonth"), appearance: "none" }}>
                <option value="">Select</option>
                {["1–2", "3–5", "6–10", "10+"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </div>

          {/* Specializations */}
          <div>
            <Label optional>Event Specializations</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {COORDINATOR_SPECIALIZATIONS.map(spec => {
                const sel = form.specializations.includes(spec);
                return (
                  <button
                    key={spec} type="button" onClick={() => toggle(spec)}
                    style={{
                      padding: "7px 12px", borderRadius: 8, fontSize: 12, fontFamily: font, cursor: "pointer",
                      border: `1.5px solid ${sel ? gold : "rgba(28,14,4,0.12)"}`,
                      background: sel ? "rgba(196,122,46,0.08)" : "#fff",
                      color: sel ? gold : muted, fontWeight: sel ? 700 : 500,
                      transition: "all 0.15s",
                    }}
                  >
                    {spec}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label optional>Short Bio</Label>
            <textarea value={form.bio} onChange={e => setForm(p => ({...p, bio: e.target.value}))}
              onFocus={() => setFocused("bio")} onBlur={() => setFocused("")}
              rows={3} placeholder="Tell us about your event planning style and experience…"
              style={{ ...iStyle("bio"), resize: "vertical" }} />
          </div>

          {/* Instagram + Portfolio */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <Label optional>Instagram Handle</Label>
              <input value={form.instagram} onChange={e => setForm(p => ({...p, instagram: e.target.value}))}
                onFocus={() => setFocused("instagram")} onBlur={() => setFocused("")}
                placeholder="@yourhandle" style={iStyle("instagram")} />
            </div>
            <div>
              <Label optional>Portfolio / Website</Label>
              <input value={form.portfolioLink} onChange={e => setForm(p => ({...p, portfolioLink: e.target.value}))}
                onFocus={() => setFocused("portfolioLink")} onBlur={() => setFocused("")}
                placeholder="https://…" style={iStyle("portfolioLink")} />
            </div>
          </div>

          {/* Password */}
          <div>
            <Label required>Create Password</Label>
            <div style={{ position: "relative" }}>
              <input value={form.password}
                onChange={e => { setForm(p => ({...p, password: e.target.value})); setErrors(p => ({...p, password: ""})); }}
                onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                type={showPw ? "text" : "password"} placeholder="Min 8 characters"
                style={{ ...iStyle("password"), paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: muted, fontSize: 12, fontFamily: font, fontWeight: 600 }}>
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
            <FieldError msg={errors.password} />
          </div>
          <div>
            <Label required>Confirm Password</Label>
            <input value={form.confirmPassword}
              onChange={e => { setForm(p => ({...p, confirmPassword: e.target.value})); setErrors(p => ({...p, confirmPassword: ""})); }}
              onFocus={() => setFocused("confirmPassword")} onBlur={() => setFocused("")}
              type="password" placeholder="Re-enter password"
              style={iStyle("confirmPassword")} />
            <FieldError msg={errors.confirmPassword} />
          </div>

          <button type="submit" disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading ? "#e5e7eb" : gold, color: loading ? "#9ca3af" : "#fff", fontSize: 15, fontWeight: 700, fontFamily: font, cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 4px 14px rgba(196,122,46,0.3)", transition: "all 0.2s" }}>
            {loading ? "Submitting…" : "Submit Application →"}
          </button>
        </form>
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: muted, marginTop: 16 }}>Free to register · No joining fee</p>
    </Shell>
  );
}

// ─── Category-question renderer ───────────────────────────────────────────────

function CategoryQuestions({ serviceType, answers, onChange }) {
  const questions = CATEGORY_QUESTIONS[serviceType] || [];
  if (!questions.length) return null;
  const toggleChip = (id, val) => {
    const cur = answers[id] || [];
    onChange(id, cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val]);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 4 }}>
      {questions.map(q => (
        <div key={q.id}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{q.label}</label>
          {q.type === "chips" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {q.options.map(opt => {
                const on = (answers[q.id] || []).includes(opt);
                return (
                  <button key={opt} type="button" onClick={() => toggleChip(q.id, opt)}
                    style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, border: on ? "none" : "1.5px solid #E5D5C0", background: on ? gold : "#F9F6F1", color: on ? "#fff" : muted, transition: "all 0.15s" }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
          {q.type === "radio" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {q.options.map(opt => {
                const on = answers[q.id] === opt;
                return (
                  <button key={opt} type="button" onClick={() => onChange(q.id, opt)}
                    style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, border: on ? "none" : "1.5px solid #E5D5C0", background: on ? gold : "#F9F6F1", color: on ? "#fff" : muted, transition: "all 0.15s" }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
          {q.type === "text" && (
            <input placeholder={q.placeholder || ""} value={answers[q.id] || ""} onChange={e => onChange(q.id, e.target.value)}
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(28,14,4,0.14)", background: "#fff", fontFamily: font, fontSize: 13.5, color: ink, outline: "none", boxSizing: "border-box" }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Registration component ──────────────────────────────────────────────

export default function VendorRegistration() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flow = searchParams.get("flow"); // "artist" | "vendor" | null

  // ── Shared state ──────────────────────────────────────────────────────────

  // Artist flow
  const [performerType, setPerformerType] = useState("");
  const [genres, setGenres] = useState([]);
  const [artistForm, setArtistForm] = useState({
    name: "", phoneNumber: "", whatsappNumber: "", email: "", city: "",
    bio: "", priceRange: "", duration: "", sampleLink: "", instagram: "",
  });

  // Vendor flow
  const [plan, setPlan]               = useState("free");
  const [serviceType, setServiceType] = useState("");
  const [vendorForm, setVendorForm]   = useState({
    businessName: "", name: "", phoneNumber: "", whatsappNumber: "", email: "", address: "",
  });
  const [categoryAnswers, setCatAns]  = useState({});

  // Legacy (keeps old coordinator + artist-via-step-1 paths working)
  const [step, setStep]         = useState(flow === "artist" ? "a_type" : flow === "vendor" ? "plan" : 1);
  const [category, setCategory] = useState(flow === "artist" ? "artist" : flow === "vendor" ? "vendor" : "");
  const [artForm, setArtForm]   = useState("");
  const [form, setForm]         = useState({ name: "", phoneNumber: "", whatsappNumber: "", email: "", address: "", serviceType: "" });

  // Shared
  const [loading, setLoading]       = useState(false);
  const [apiError, setApiError]     = useState("");
  const [errors, setErrors]         = useState({});
  const [submitted, setSubmitted]   = useState(false);
  const [successName, setSuccessName] = useState("");
  const [isCoordinator, setIsCoordinator] = useState(false);
  const [focused, setFocused]       = useState("");

  const iStyle = (f) => inputStyle(focused, errors, f, gold, ink);

  // ── Generic submit helper ──────────────────────────────────────────────────
  const submitApplication = async (payload) => {
    setLoading(true); setApiError("");
    try {
      const res = await fetch(`${BASE_URL}/vendor-applications`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) setApiError(data.message || "Application already exists.");
        else if (data.errors) {
          const mapped = {};
          data.errors.forEach(er => { mapped[er.param || er.path] = er.msg; });
          setErrors(mapped);
        } else setApiError(data.message || "Submission failed. Please try again.");
        return false;
      }
      return true;
    } catch {
      setApiError("Network error. Please check your connection and try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── SUCCESS ────────────────────────────────────────────────────────────────
  if (submitted) return <SuccessScreen name={successName} isCoordinator={isCoordinator} navigate={navigate} />;

  // ── COORDINATOR FLOW (legacy) ──────────────────────────────────────────────
  if (category === "coordinator") {
    return (
      <CoordinatorForm
        onBack={() => { setCategory(""); setStep(1); }}
        onSuccess={(name) => { setSuccessName(name); setIsCoordinator(true); setSubmitted(true); }}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════════
  //  ARTIST / PERFORMER FLOW
  // ══════════════════════════════════════════════════════════════════

  // Step a_type — Pick performer type
  if (step === "a_type") {
    return (
      <Shell step={1} steps={["Type", "Profile", "Submit"]}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>Artist / Performer</p>
          <h1 style={{ fontSize: "clamp(1.5rem,3.5vw,2rem)", fontWeight: 800, color: ink, margin: "0 0 8px", lineHeight: 1.2 }}>What type of performer are you?</h1>
          <p style={{ fontSize: 14, color: muted, margin: 0 }}>Your profile will be tailored to match your style.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {ARTIST_PERFORMER_TYPES.map(t => (
            <button key={t.value} type="button"
              onClick={() => { setPerformerType(t.value); setGenres([]); setStep("a_profile"); }}
              style={{ padding: "20px 16px", borderRadius: 14, border: "1.5px solid rgba(28,14,4,0.1)", background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 4px rgba(28,14,4,0.04)", display: "flex", flexDirection: "column", gap: 8 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(196,122,46,0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,14,4,0.1)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(28,14,4,0.04)"; }}
            >
              <span style={{ fontSize: 28 }}>{t.emoji}</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{t.label}</div>
              <div style={{ fontSize: 11, color: muted, lineHeight: 1.5 }}>{t.sub}</div>
            </button>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 13, color: muted, marginTop: 24 }}>
          Already listed? <span onClick={() => navigate("/vendor/login")} style={{ color: gold, fontWeight: 600, cursor: "pointer" }}>Sign in</span>
        </p>
      </Shell>
    );
  }

  // Step a_profile — Artist profile form
  if (step === "a_profile") {
    const typeInfo = ARTIST_PERFORMER_TYPES.find(t => t.value === performerType) || {};
    const genreOptions = ARTIST_GENRES[performerType] || [];
    const toggleGenre = (g) => setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

    const handleArtistSubmit = async (e) => {
      e.preventDefault();
      const er = {};
      if (!artistForm.name.trim())         er.name = "Name is required";
      if (!/^[6-9]\d{9}$/.test(artistForm.phoneNumber))   er.phoneNumber = "Enter a valid 10-digit number";
      if (!/^[6-9]\d{9}$/.test(artistForm.whatsappNumber)) er.whatsappNumber = "Enter a valid 10-digit number";
      if (!artistForm.city)                er.city = "City is required";
      if (artistForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(artistForm.email)) er.email = "Enter a valid email";
      if (Object.keys(er).length) { setErrors(er); return; }

      const ok = await submitApplication({
        name: artistForm.name.trim(),
        phoneNumber: artistForm.phoneNumber,
        whatsappNumber: artistForm.whatsappNumber,
        email: artistForm.email || "",
        address: artistForm.city,
        serviceType: performerType,
        isArtist: true,
        genres,
        bio: artistForm.bio,
        priceRange: artistForm.priceRange,
        duration: artistForm.duration,
        sampleLink: artistForm.sampleLink,
        instagram: artistForm.instagram,
      });
      if (ok) { setSuccessName(artistForm.name); setSubmitted(true); }
    };

    const aInput = (f, label, req, opts = {}) => (
      <div>
        <Label required={req} optional={!req}>{label}</Label>
        <input
          value={artistForm[f]} onChange={e => { setArtistForm(p => ({...p, [f]: e.target.value})); if (errors[f]) setErrors(p => ({...p, [f]: ""})); }}
          onFocus={() => setFocused(f)} onBlur={() => setFocused("")}
          style={inputStyle(focused, errors, f, gold, ink)} {...opts}
        />
        <FieldError msg={errors[f]} />
      </div>
    );

    return (
      <Shell step={2} steps={["Type", "Profile", "Submit"]}>
        <button type="button" onClick={() => setStep("a_type")} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 20, padding: 0 }}>
          ← Back
        </button>

        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 6 }}>{typeInfo.emoji} {typeInfo.label}</p>
          <h1 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: ink, margin: "0 0 6px" }}>Build your artist profile</h1>
          <p style={{ fontSize: 13.5, color: muted, margin: 0 }}>This is what customers see when they browse performers. Be specific — it helps you get booked.</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "24px 22px", border: "1px solid rgba(28,14,4,0.07)", boxShadow: "0 2px 12px rgba(28,14,4,0.05)" }}>
          {apiError && <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 16px", fontSize: 13, color: "#c0392b", marginBottom: 20 }}>{apiError}</div>}

          <form onSubmit={handleArtistSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Contact */}
            <p style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Contact Details</p>

            {aInput("name", "Artist / Band Name", true, { placeholder: "e.g. Aarav Vocals or The Harmony Band" })}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <Label required>Phone</Label>
                <input value={artistForm.phoneNumber} onChange={e => setArtistForm(p => ({...p, phoneNumber: e.target.value.replace(/\D/,"").slice(0,10)}))}
                  onFocus={() => setFocused("phoneNumber")} onBlur={() => setFocused("")} inputMode="numeric" placeholder="10-digit number"
                  style={inputStyle(focused, errors, "phoneNumber", gold, ink)} />
                <FieldError msg={errors.phoneNumber} />
              </div>
              <div>
                <Label required>WhatsApp</Label>
                <input value={artistForm.whatsappNumber} onChange={e => setArtistForm(p => ({...p, whatsappNumber: e.target.value.replace(/\D/,"").slice(0,10)}))}
                  onFocus={() => setFocused("whatsappNumber")} onBlur={() => setFocused("")} inputMode="numeric" placeholder="10-digit number"
                  style={inputStyle(focused, errors, "whatsappNumber", gold, ink)} />
                <FieldError msg={errors.whatsappNumber} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {aInput("email", "Email", false, { type: "email", placeholder: "you@email.com" })}
              <div>
                <Label required>City</Label>
                <select value={artistForm.city} onChange={e => { setArtistForm(p => ({...p, city: e.target.value})); if (errors.city) setErrors(p => ({...p, city: ""})); }}
                  onFocus={() => setFocused("city")} onBlur={() => setFocused("")}
                  style={{ ...inputStyle(focused, errors, "city", gold, ink), cursor: "pointer" }}>
                  <option value="">Select city</option>
                  {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <FieldError msg={errors.city} />
              </div>
            </div>

            {/* Profile */}
            <p style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", margin: "4px 0 0" }}>Your Profile (Shown to customers)</p>

            {genreOptions.length > 0 && (
              <div>
                <Label optional>Genres / Specializations</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                  {genreOptions.map(g => {
                    const on = genres.includes(g);
                    return (
                      <button key={g} type="button" onClick={() => toggleGenre(g)}
                        style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, border: on ? "none" : "1.5px solid #E5D5C0", background: on ? gold : "#F9F6F1", color: on ? "#fff" : muted, transition: "all 0.15s" }}>
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <Label optional>Performance Duration</Label>
                <select value={artistForm.duration} onChange={e => setArtistForm(p => ({...p, duration: e.target.value}))}
                  style={{ ...inputStyle(focused, errors, "duration", gold, ink), cursor: "pointer" }}>
                  <option value="">Select</option>
                  {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <Label optional>Price Per Event</Label>
                <select value={artistForm.priceRange} onChange={e => setArtistForm(p => ({...p, priceRange: e.target.value}))}
                  style={{ ...inputStyle(focused, errors, "priceRange", gold, ink), cursor: "pointer" }}>
                  <option value="">Select range</option>
                  {PRICE_RANGE_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <Label optional>About You <span style={{ fontSize: 11, fontWeight: 400, color: muted }}>(shown on your profile)</span></Label>
              <textarea value={artistForm.bio} onChange={e => setArtistForm(p => ({...p, bio: e.target.value}))} rows={3} maxLength={300}
                placeholder={`Tell clients about your ${typeInfo.label?.toLowerCase()} style, experience, and what makes your performances special...`}
                style={{ ...inputStyle(focused, errors, "bio", gold, ink), resize: "vertical" }} />
              <p style={{ fontSize: 11, color: muted, marginTop: 4, textAlign: "right" }}>{artistForm.bio.length}/300</p>
            </div>

            {aInput("sampleLink", "Sample Video / YouTube Link", false, { placeholder: "https://youtube.com/..." })}
            {aInput("instagram", "Instagram Handle", false, { placeholder: "@yourhandle" })}

            <button type="submit" disabled={loading}
              style={{ marginTop: 8, padding: "14px", borderRadius: 12, background: loading ? "#D4A060" : `linear-gradient(135deg,${gold},#CCAB4A)`, color: "#fff", border: "none", fontSize: 15, fontWeight: 800, cursor: loading ? "default" : "pointer", fontFamily: font }}>
              {loading ? "Submitting…" : "Submit Application"}
            </button>
          </form>
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: muted, marginTop: 16 }}>
          You'll get an SMS confirmation on your phone number. Our team will review and contact you within 24 hours.
        </p>
      </Shell>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  //  VENDOR FLOW
  // ══════════════════════════════════════════════════════════════════

  // Step 1 (legacy / direct access) — Pick category
  if (step === 1) {
    const OPTIONS = [
      { key: "artist",  title: "Individual Artist / Performer", sub: "Singer · Band · Anchor · Choreographer · Musician · Emcee", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> },
      { key: "vendor",  title: "Business / Vendor", sub: "Decorator · Caterer · Photographer · DJ · Venue · and more", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
      { key: "coordinator", title: "Event Coordinator", sub: "Manage client chats, leads & events", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg> },
    ];
    return (
      <Shell step={1} steps={["Category", "Plan", "Details"]}>
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>Partner with Tendr</p>
          <h1 style={{ fontSize: "clamp(1.6rem,3.5vw,2.2rem)", fontWeight: 800, color: ink, margin: "0 0 8px", lineHeight: 1.2 }}>How do you earn?</h1>
          <p style={{ fontSize: 14, color: muted, margin: 0 }}>Pick the type that best describes what you do.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {OPTIONS.map(c => (
            <button key={c.key} type="button"
              onClick={() => { setCategory(c.key); if (c.key === "artist") setStep("a_type"); else if (c.key === "coordinator") {} else setStep("plan"); }}
              style={{ padding: "18px", borderRadius: 14, border: "1.5px solid rgba(28,14,4,0.1)", background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 4px rgba(28,14,4,0.04)", display: "flex", alignItems: "center", gap: 16 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.boxShadow = "0 6px 24px rgba(196,122,46,0.14)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,14,4,0.1)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(28,14,4,0.04)"; e.currentTarget.style.transform = ""; }}
            >
              <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: "50%", background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>{c.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: ink, marginBottom: 4 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: muted, lineHeight: 1.55 }}>{c.sub}</div>
              </div>
              <div style={{ fontSize: 18, color: gold, flexShrink: 0 }}>→</div>
            </button>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 13, color: muted, marginTop: 24 }}>
          Already listed? <span onClick={() => navigate("/vendor/login")} style={{ color: gold, fontWeight: 600, cursor: "pointer" }}>Sign in</span>
        </p>
      </Shell>
    );
  }

  // Step plan — Choose Free or Paid
  if (step === "plan") {
    return (
      <Shell step={flow === "vendor" ? 1 : 2} steps={["Plan", "Details", "Submit"]} sideTiers>
        {flow !== "vendor" && (
          <button type="button" onClick={() => setStep(1)} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 24, padding: 0 }}>
            ← Back
          </button>
        )}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 8 }}>Choose your plan</p>
          <h1 style={{ fontSize: "clamp(1.5rem,3.5vw,2rem)", fontWeight: 800, color: ink, margin: "0 0 8px", lineHeight: 1.2 }}>Start free, upgrade anytime</h1>
          <p style={{ fontSize: 14, color: muted, margin: 0 }}>No card needed. Switch plans whenever you are ready.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <button type="button" onClick={() => { setPlan("free"); setStep("v_form"); }}
            style={{ padding: "22px 20px", borderRadius: 16, border: "1.5px solid rgba(28,14,4,0.1)", background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 4px rgba(28,14,4,0.04)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.boxShadow = "0 4px 16px rgba(196,122,46,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,14,4,0.1)"; e.currentTarget.style.boxShadow = "0 1px 4px rgba(28,14,4,0.04)"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(196,122,46,0.65)", marginBottom: 4 }}>Free listing</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: ink }}>₹0 <span style={{ fontSize: 13, fontWeight: 500, color: muted }}>forever</span></div>
              </div>
            </div>
            {FREE_FEATS.map(f => <div key={f} style={{ fontSize: 12.5, color: muted, display: "flex", gap: 8, marginBottom: 4 }}><span style={{ color: gold, flexShrink: 0 }}>✓</span>{f}</div>)}
            <div style={{ marginTop: 12, padding: "8px 14px", borderRadius: 8, background: "rgba(196,122,46,0.07)", fontSize: 12, color: "#7a4d1b", fontWeight: 600 }}>15% commission only on Tendr bookings</div>
          </button>

          <button type="button" onClick={() => { setPlan("paid"); setStep("v_features"); }}
            style={{ padding: "22px 20px", borderRadius: 16, border: `1.5px solid ${gold}`, background: "rgba(196,122,46,0.03)", cursor: "pointer", textAlign: "left", fontFamily: font, transition: "all 0.18s", boxShadow: "0 1px 4px rgba(28,14,4,0.04)", position: "relative" }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(196,122,46,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(28,14,4,0.04)"; }}>
            <div style={{ position: "absolute", top: -1, right: 16, background: gold, color: "#fff", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: "0 0 8px 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>7-day free trial</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 4 }}>Listing + Dashboard</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: ink }}>₹399 <span style={{ fontSize: 13, fontWeight: 500, color: muted }}>+ GST / month</span></div>
                <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>after trial · no card needed to start</div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Everything in Free, plus:</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
              {PAID_FEATS.map(f => <div key={f} style={{ fontSize: 12, color: muted, display: "flex", gap: 6, marginBottom: 2 }}><span style={{ color: gold, flexShrink: 0 }}>✓</span>{f}</div>)}
            </div>
            <div style={{ marginTop: 12, padding: "8px 14px", borderRadius: 8, background: "rgba(196,122,46,0.07)", fontSize: 12, color: "#7a4d1b", fontWeight: 600 }}>0% commission on bookings made outside Tendr</div>
            <div style={{ marginTop: 10, color: gold, fontSize: 12, fontWeight: 700 }}>See everything you get →</div>
          </button>
        </div>
      </Shell>
    );
  }

  // Step v_features — Paid plan full feature breakdown
  if (step === "v_features") {
    const featureSections = [
      { title: "Profile & Discovery", items: ["Full vendor profile with photos & videos", "Appear in Tendr search & category pages", "SEO-optimised public listing page", "Verified badge after approval"] },
      { title: "Business Tools", items: ["Bookings & availability calendar", "Client enquiries & lead management", "Custom quotes & invoicing", "Contract templates", "Payment tracking (Tendr + outside)"] },
      { title: "Growth", items: ["Analytics: views, clicks, enquiries", "Review & rating collection", "Flyer builder & shareable link", "Smart reminders for follow-ups", "Referral program access"] },
      { title: "Support", items: ["Priority WhatsApp support", "Onboarding call with Tendr team", "Hindi & English support", "Business insights & monthly report"] },
    ];
    return (
      <Shell step={2} steps={["Plan", "Details", "Submit"]} sideTiers>
        <button type="button" onClick={() => setStep("plan")} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 20, padding: 0 }}>
          ← Back
        </button>
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: gold, marginBottom: 6 }}>Dashboard Plan — ₹399/month</p>
          <h1 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: ink, margin: "0 0 6px" }}>Everything you need to grow</h1>
          <p style={{ fontSize: 13.5, color: muted, margin: 0 }}>7 days free. No card needed. Cancel anytime.</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
          {featureSections.map(s => (
            <div key={s.title} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", border: "1.5px solid rgba(196,122,46,0.14)" }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>{s.title}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 14px" }}>
                {s.items.map(i => <div key={i} style={{ fontSize: 12.5, color: muted, display: "flex", gap: 7 }}><span style={{ color: gold, flexShrink: 0 }}>✓</span>{i}</div>)}
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setStep("v_form")}
          style={{ width: "100%", padding: "14px", borderRadius: 12, background: `linear-gradient(135deg,${gold},#CCAB4A)`, color: "#fff", border: "none", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
          Continue with Dashboard Plan →
        </button>
        <button type="button" onClick={() => { setPlan("free"); setStep("v_form"); }}
          style={{ width: "100%", marginTop: 10, padding: "12px", borderRadius: 12, background: "none", color: muted, border: "1.5px solid rgba(28,14,4,0.14)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
          No thanks, continue with Free listing
        </button>
      </Shell>
    );
  }

  // Step v_form — Vendor details + category-specific questions
  if (step === "v_form") {
    const handleVendorChange = (e) => {
      const { name, value } = e.target;
      setVendorForm(p => ({ ...p, [name]: value }));
      if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
      if (apiError) setApiError("");
    };

    const handleVendorSubmit = async (e) => {
      e.preventDefault();
      const er = {};
      if (!vendorForm.name.trim())          er.name = "Name is required";
      if (!vendorForm.businessName.trim())  er.businessName = "Business name is required";
      if (!/^[6-9]\d{9}$/.test(vendorForm.phoneNumber))   er.phoneNumber = "Enter a valid 10-digit number";
      if (!/^[6-9]\d{9}$/.test(vendorForm.whatsappNumber)) er.whatsappNumber = "Enter a valid 10-digit number";
      if (!vendorForm.address.trim())       er.address = "City / area is required";
      if (!serviceType)                     er.serviceType = "Please select your service category";
      if (vendorForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vendorForm.email)) er.email = "Enter a valid email";
      if (Object.keys(er).length) { setErrors(er); return; }

      const ok = await submitApplication({
        name: vendorForm.name.trim(),
        businessName: vendorForm.businessName.trim(),
        phoneNumber: vendorForm.phoneNumber,
        whatsappNumber: vendorForm.whatsappNumber,
        email: vendorForm.email || "",
        address: vendorForm.address,
        serviceType,
        isArtist: false,
        plan,
        categoryAnswers,
      });
      if (ok) { setSuccessName(vendorForm.name); setSubmitted(true); }
    };

    const vInput = (f, label, req, opts = {}) => (
      <div>
        <Label required={req} optional={!req}>{label}</Label>
        <input name={f} value={vendorForm[f]} onChange={handleVendorChange}
          onFocus={() => setFocused(f)} onBlur={() => setFocused("")}
          style={inputStyle(focused, errors, f, gold, ink)} {...opts} />
        <FieldError msg={errors[f]} />
      </div>
    );

    return (
      <Shell step={3} steps={["Plan", "Details", "Submit"]}>
        <button type="button" onClick={() => setStep(plan === "paid" ? "v_features" : "plan")} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, marginBottom: 20, padding: 0 }}>
          ← Back
        </button>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "clamp(1.4rem,3vw,1.8rem)", fontWeight: 800, color: ink, margin: "0 0 4px" }}>Tell us about your business</h1>
          <p style={{ fontSize: 13.5, color: muted, margin: 0 }}>We'll reach you on WhatsApp to complete your onboarding.</p>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "24px 22px", border: "1px solid rgba(28,14,4,0.07)", boxShadow: "0 2px 12px rgba(28,14,4,0.05)" }}>
          {apiError && <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 10, padding: "11px 16px", fontSize: 13, color: "#c0392b", marginBottom: 20 }}>{apiError}</div>}

          <form onSubmit={handleVendorSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Business Info</p>

            {vInput("businessName", "Business / Brand Name", true, { placeholder: "e.g. Royal Decorators or Rahul Photography" })}

            <div>
              <Label required>Service Category</Label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8, marginTop: 4 }}>
                {VENDOR_SERVICE_TYPES.map(t => {
                  const on = serviceType === t.value;
                  return (
                    <button key={t.value} type="button" onClick={() => { setServiceType(t.value); setCatAns({}); if (errors.serviceType) setErrors(p => ({...p, serviceType: ""})); }}
                      style={{ padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${on ? gold : "rgba(28,14,4,0.12)"}`, background: on ? "rgba(196,122,46,0.07)" : "#F9F6F1", color: on ? ink : muted, fontSize: 12, fontWeight: on ? 700 : 600, cursor: "pointer", fontFamily: font, textAlign: "left", transition: "all 0.15s" }}>
                      <div style={{ fontWeight: 700, marginBottom: 2 }}>{t.label}</div>
                      <div style={{ fontSize: 10.5, color: muted, lineHeight: 1.4 }}>{t.sub}</div>
                    </button>
                  );
                })}
              </div>
              <FieldError msg={errors.serviceType} />
            </div>

            {serviceType && (
              <>
                <p style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", margin: "4px 0 0" }}>Service Details</p>
                <CategoryQuestions serviceType={serviceType} answers={categoryAnswers} onChange={(id, val) => setCatAns(p => ({...p, [id]: val}))} />
              </>
            )}

            <p style={{ fontSize: 11, fontWeight: 700, color: gold, textTransform: "uppercase", letterSpacing: "0.1em", margin: "4px 0 0" }}>Contact Details</p>

            {vInput("name", "Your Full Name", true, { placeholder: "Contact person name" })}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <Label required>Phone</Label>
                <input name="phoneNumber" value={vendorForm.phoneNumber} onChange={e => { setVendorForm(p => ({...p, phoneNumber: e.target.value.replace(/\D/,"").slice(0,10)})); if (errors.phoneNumber) setErrors(p => ({...p, phoneNumber: ""})); }}
                  onFocus={() => setFocused("phoneNumber")} onBlur={() => setFocused("")} inputMode="numeric" placeholder="10-digit number"
                  style={inputStyle(focused, errors, "phoneNumber", gold, ink)} />
                <FieldError msg={errors.phoneNumber} />
              </div>
              <div>
                <Label required>WhatsApp</Label>
                <input name="whatsappNumber" value={vendorForm.whatsappNumber} onChange={e => { setVendorForm(p => ({...p, whatsappNumber: e.target.value.replace(/\D/,"").slice(0,10)})); if (errors.whatsappNumber) setErrors(p => ({...p, whatsappNumber: ""})); }}
                  onFocus={() => setFocused("whatsappNumber")} onBlur={() => setFocused("")} inputMode="numeric" placeholder="10-digit number"
                  style={inputStyle(focused, errors, "whatsappNumber", gold, ink)} />
                <FieldError msg={errors.whatsappNumber} />
              </div>
            </div>
            {vInput("email", "Email Address", false, { type: "email", placeholder: "business@email.com" })}
            {vInput("address", "City / Area you serve", true, { placeholder: "e.g. South Delhi, Noida, Gurgaon" })}

            {/* Plan summary */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 10, background: plan === "paid" ? "rgba(196,122,46,0.06)" : "#F9F6F1", border: plan === "paid" ? `1px solid rgba(196,122,46,0.28)` : "1px solid rgba(28,14,4,0.09)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>{plan === "paid" ? "Dashboard Plan — ₹399/month" : "Free listing"}</div>
                <div style={{ fontSize: 11, color: muted }}>{plan === "paid" ? "7-day free trial · upgrade after" : "₹0 forever · 15% on Tendr bookings only"}</div>
              </div>
              <button type="button" onClick={() => setStep("plan")} style={{ fontSize: 12, fontWeight: 600, color: gold, background: "none", border: "none", cursor: "pointer", fontFamily: font }}>Change</button>
            </div>

            <button type="submit" disabled={loading}
              style={{ marginTop: 4, padding: "14px", borderRadius: 12, background: loading ? "#D4A060" : `linear-gradient(135deg,${gold},#CCAB4A)`, color: "#fff", border: "none", fontSize: 15, fontWeight: 800, cursor: loading ? "default" : "pointer", fontFamily: font }}>
              {loading ? "Submitting…" : "Submit Application"}
            </button>
          </form>
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: muted, marginTop: 16 }}>
          You'll get an SMS confirmation. Our team will review and reach you on WhatsApp within 24–48 hours.
        </p>
      </Shell>
    );
  }

  // Fallback
  return null;
}
