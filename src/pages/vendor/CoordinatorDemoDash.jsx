import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// ── Design tokens ──────────────────────────────────────────────────────────────
const gold   = "#C47A2E";
const goldLt = "#CCAB4A";
const ink    = "#1C0A04";
const cream  = "#FAF7F2";
const parch  = "#F0E8DC";
const muted  = "#9B7450";
const font   = "'Outfit', sans-serif";
const serif  = "'Cormorant Garamond', Georgia, serif";

// ── Mock coordinator profile ───────────────────────────────────────────────────
const PROFILE = {
  name: "Nisha Verma",
  type: "Event Coordinator",
  city: "Mumbai",
  phone: "+91 99887 76655",
  email: "nisha@nishaevents.in",
  bio: "Tendr-certified event coordinator with 8 years of experience orchestrating 310+ events across India. From intimate home ceremonies to 1,500-guest destination banquets — I handle everything so you show up and enjoy.",
  rating: 4.9, reviewCount: 187, events: 310, years: 8, teamSize: 4, responseTime: "< 1 hr",
  instagram: "@nisha.events.in", website: "nishaevents.in", linkedin: "nishaverma-events",
  vendorNetwork: 214,
};

// ── Active events ──────────────────────────────────────────────────────────────
const INIT_EVENTS = [
  { id: "EV001", client: "Sharma–Kapoor Wedding", type: "Full Wedding Planning", date: "2026-10-28", venue: "Grand Hyatt, Mumbai",    budget: 820000,  spent: 540000,  status: "In Progress",    daysLeft: 32, progress: 68, tasks: { done: 34, total: 50 }, vendorsPending: 2 },
  { id: "EV002", client: "Microsoft India Summit", type: "Corporate Gala",        date: "2026-11-05", venue: "Taj Lands End, Mumbai",  budget: 1200000, spent: 310000,  status: "Planning",       daysLeft: 40, progress: 28, tasks: { done: 14, total: 50 }, vendorsPending: 5 },
  { id: "EV003", client: "Patel Family Sangeet",   type: "Day-Of Coordination",   date: "2026-10-18", venue: "Juhu Residence, Mumbai", budget: 45000,   spent: 45000,   status: "Confirmed",      daysLeft: 22, progress: 92, tasks: { done: 46, total: 50 }, vendorsPending: 0 },
  { id: "EV004", client: "Mehra Destination Wedding", type: "Full Wedding Planning", date: "2026-12-15", venue: "Taj Fort Aguada, Goa", budget: 2200000, spent: 180000, status: "Early Planning", daysLeft: 90, progress: 12, tasks: { done: 6,  total: 50 }, vendorsPending: 12 },
];

// ── Vendor network ─────────────────────────────────────────────────────────────
const VENDORS = [
  { id: "V01", name: "Blooms & Beyond",        cat: "Decorator",    city: "Mumbai", rating: 4.9, events: 38, status: "Preferred", phone: "+91 98001 11222" },
  { id: "V02", name: "Royal Feast Caterers",   cat: "Caterer",      city: "Mumbai", rating: 4.8, events: 52, status: "Preferred", phone: "+91 98001 22333" },
  { id: "V03", name: "DJ Anmol Singh",         cat: "DJ",           city: "Mumbai", rating: 4.9, events: 29, status: "Preferred", phone: "+91 98001 33444" },
  { id: "V04", name: "Capture Moments Studio", cat: "Photographer", city: "Mumbai", rating: 4.8, events: 44, status: "Preferred", phone: "+91 98001 44555" },
  { id: "V05", name: "The Strings Collective", cat: "Band",         city: "Mumbai", rating: 4.7, events: 17, status: "Preferred", phone: "+91 98001 55666" },
  { id: "V06", name: "Rohan Mehta (MC)",       cat: "Anchor",       city: "Delhi",  rating: 4.8, events: 22, status: "Preferred", phone: "+91 98001 66777" },
  { id: "V07", name: "Glam Squad by Riya",     cat: "Makeup",       city: "Mumbai", rating: 4.9, events: 31, status: "Preferred", phone: "+91 98001 77888" },
  { id: "V08", name: "CinéReel Productions",   cat: "Videography",  city: "Mumbai", rating: 4.8, events: 28, status: "Preferred", phone: "+91 98001 88999" },
  { id: "V09", name: "AV Masters India",       cat: "AV & Lighting",city: "Mumbai", rating: 4.7, events: 35, status: "Active",    phone: "+91 98001 99000" },
  { id: "V10", name: "Sweetie's Cakes & More", cat: "Bakery",       city: "Pune",   rating: 4.8, events: 14, status: "Active",    phone: "+91 98001 00111" },
  { id: "V11", name: "Mandap Masters",         cat: "Decorator",    city: "Mumbai", rating: 4.6, events: 19, status: "Active",    phone: "+91 98001 11333" },
  { id: "V12", name: "Goa Travels & Transfers",cat: "Transport",    city: "Goa",    rating: 4.7, events: 9,  status: "Active",    phone: "+91 98001 22444" },
];

// ── Master checklist template ──────────────────────────────────────────────────
const CHECKLIST_PHASES = [
  { phase: "6 Months Before", items: [
    { id: "c01", text: "Confirm venue & sign contract",   done: true  },
    { id: "c02", text: "Book caterer — finalize menu",    done: true  },
    { id: "c03", text: "Book photographer & videographer",done: true  },
    { id: "c04", text: "Book decorator & discuss theme",  done: true  },
    { id: "c05", text: "Book anchor / DJ / band",         done: true  },
    { id: "c06", text: "Send save-the-date invitations",  done: true  },
  ]},
  { phase: "3 Months Before", items: [
    { id: "c07", text: "Finalise wedding invitations",    done: true  },
    { id: "c08", text: "Book hotel room block for guests",done: true  },
    { id: "c09", text: "Confirm makeup & mehndi artists", done: true  },
    { id: "c10", text: "Plan transport & logistics",      done: false },
    { id: "c11", text: "Plan day-of timeline (draft)",    done: false },
    { id: "c12", text: "Order wedding cake & desserts",   done: false },
  ]},
  { phase: "1 Month Before", items: [
    { id: "c13", text: "Share final guest count with caterer", done: false },
    { id: "c14", text: "Collect vendor payment schedules",     done: false },
    { id: "c15", text: "Final menu tasting",                   done: false },
    { id: "c16", text: "Prepare seating chart",                done: false },
    { id: "c17", text: "Finalize day-of runsheet (minute-by-minute)", done: false },
    { id: "c18", text: "Brief all vendors with final runsheet", done: false },
  ]},
  { phase: "Week Of Event", items: [
    { id: "c19", text: "Confirm all vendor arrival times",  done: false },
    { id: "c20", text: "Final headcount to venue",          done: false },
    { id: "c21", text: "Pack emergency coordination kit",   done: false },
    { id: "c22", text: "Venue walk-through with decorator", done: false },
    { id: "c23", text: "Share guest list & seating to MC",  done: false },
    { id: "c24", text: "Pre-event team briefing call",      done: false },
  ]},
];

// ── Timeline milestones ────────────────────────────────────────────────────────
const TIMELINE_EVENTS = [
  { time: "09:30",  label: "Coordinator & team arrive at venue",     done: false, cat: "logistics" },
  { time: "10:00",  label: "Decorator setup begins",                  done: false, cat: "vendor"   },
  { time: "12:30",  label: "Catering team arrives, kitchen briefing", done: false, cat: "vendor"   },
  { time: "13:00",  label: "AV & lighting rig check",                 done: false, cat: "vendor"   },
  { time: "14:30",  label: "Floral & stage decoration complete",      done: false, cat: "decor"    },
  { time: "15:30",  label: "Venue walk-through with couple",          done: false, cat: "client"   },
  { time: "16:00",  label: "Photographer & videographer arrive",      done: false, cat: "vendor"   },
  { time: "16:30",  label: "Bridal party makeup & getting-ready",     done: false, cat: "client"   },
  { time: "17:30",  label: "Guests begin arriving — cocktail hour",   done: false, cat: "ceremony" },
  { time: "18:30",  label: "Ceremony procession",                     done: false, cat: "ceremony" },
  { time: "19:15",  label: "Dinner service begins",                   done: false, cat: "catering" },
  { time: "20:30",  label: "First dance & cake cutting",              done: false, cat: "ceremony" },
  { time: "21:00",  label: "DJ set begins — dance floor opens",       done: false, cat: "vendor"   },
  { time: "23:30",  label: "Farewell & couple send-off",              done: false, cat: "ceremony" },
];

// ── Monthly revenue ─────────────────────────────────────────────────────────────
const MONTHLY = [
  { month: "Mar", revenue: 120000, expenses: 18000 },
  { month: "Apr", revenue: 95000,  expenses: 12000 },
  { month: "May", revenue: 145000, expenses: 22000 },
  { month: "Jun", revenue: 180000, expenses: 28000 },
  { month: "Jul", revenue: 210000, expenses: 35000 },
  { month: "Aug", revenue: 165000, expenses: 24000 },
  { month: "Sep", revenue: 88000,  expenses: 11000 },
];

// ── Reviews ─────────────────────────────────────────────────────────────────────
const INIT_REVIEWS = [
  { id: 1, name: "Priya & Rohit Sharma", event: "Full Wedding, Mar 2025", rating: 5, text: "Nisha coordinated our 3-day Goa wedding flawlessly — 240 guests, 18 vendors, multiple venues. We didn't stress once. She's an absolute magician.", response: "Priya & Rohit, your Goa wedding was a dream. Three days, eighteen vendors, one perfect memory. Thank you for trusting me!" },
  { id: 2, name: "TechCorp India", event: "Corporate Gala, Jan 2025", rating: 5, text: "Nisha managed our 600-person event end-to-end. The AV, catering, programme flow — everything was flawless. Our CEO personally complimented the event design.", response: "Loved working with the TechCorp team — the award segment was spectacular. Looking forward to your next event!" },
  { id: 3, name: "Ananya & Dev Mehra", event: "Destination Wedding, Feb 2025", rating: 5, text: "Guests flying in from 5 countries, hotel blocks, airport pickups, 3 events across 2 days. We were sipping cocktails while Nisha handled everything.", response: null },
  { id: 4, name: "Kapoor Family", event: "Sangeet Night, Dec 2024", rating: 5, text: "The sangeet was beyond our imagination. Every game, every transition, every surprise — perfectly timed. Our guests are still talking about it 4 months later.", response: "Kapoor family, your sangeet energy was unmatched! The surprise dance by the cousins had everyone in tears. Thank you for involving me so deeply." },
  { id: 5, name: "PepsiCo India HR", event: "Awards Dinner, Nov 2024", rating: 4, text: "Very professional coordination. Minor hiccup with catering timing at the start but Nisha handled it quickly and invisibly. Overall a smooth evening.", response: null },
  { id: 6, name: "Mehta-Gupta Wedding", event: "Full Wedding, Oct 2024", rating: 5, text: "From venue shortlisting to final sendoff, Nisha was with us every step. Her vendor network saved us ₹3 lakhs versus our initial quotes. Absolutely hire her.", response: "Sneha & Arjun, the joy on your faces made every late-night planning call worth it! Wishing you both a beautiful life together. 🥂" },
];

// ── Booked dates ───────────────────────────────────────────────────────────────
const BOOKED_DATES = new Set(["2026-10-18","2026-10-28","2026-11-05","2026-12-15"]);

// ── Nav ────────────────────────────────────────────────────────────────────────
const NAV = [
  { key: "home",      group: "OVERVIEW",  label: "Home",       icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { key: "events",    group: "EVENTS",    label: "My Events",  icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" },
  { key: "vendors",   group: "EVENTS",    label: "Vendors",    icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { key: "timeline",  group: "EVENTS",    label: "Timeline",   icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { key: "tasks",     group: "MANAGE",    label: "Checklists", icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
  { key: "money",     group: "MANAGE",    label: "Budget",     icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { key: "reviews",   group: "MANAGE",    label: "Reviews",    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { key: "profile",   group: "MANAGE",    label: "Profile",    icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function Icon({ d: path, size = 18, color = "currentColor", fill = "none", sw = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

function fmt(n) { return n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`; }

const STATUS_CFG = {
  "In Progress":    { bg: "#EFF6FF", color: "#1D4ED8" },
  "Planning":       { bg: "#FEF3C7", color: "#D97706" },
  "Confirmed":      { bg: "#F0FDF4", color: "#15803D" },
  "Early Planning": { bg: "#F5F3FF", color: "#7C3AED" },
};
const CAT_COLORS = {
  "Decorator": "#E34D8C", "Caterer": "#D97706", "DJ": "#7C3AED",
  "Photographer": "#0891B2", "Band": "#C47A2E", "Anchor": "#059669",
  "Makeup": "#EC4899", "Videography": "#6366F1", "AV & Lighting": "#F97316",
  "Bakery": "#84CC16", "Transport": "#14B8A6",
};
const TL_COLORS = { logistics: "#6366F1", vendor: gold, decor: "#EC4899", client: "#059669", ceremony: "#C47A2E", catering: "#D97706" };

export default function CoordinatorDemoDash() {
  const navigate = useNavigate();
  const [nav, setNav] = useState("home");
  const [events, setEvents] = useState(INIT_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState(INIT_EVENTS[0]);
  const [vendors, setVendors] = useState(VENDORS);
  const [vendorCat, setVendorCat] = useState("All");
  const [checklist, setChecklist] = useState(CHECKLIST_PHASES);
  const [timeline, setTimeline] = useState(TIMELINE_EVENTS);
  const [reviews, setReviews] = useState(INIT_REVIEWS);
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [calMonth] = useState({ y: 2026, m: 9 });
  const [moneyView, setMoneyView] = useState("chart");

  const totalRevenue = MONTHLY.reduce((s, m) => s + m.revenue, 0);
  const totalExpenses = MONTHLY.reduce((s, m) => s + m.expenses, 0);
  const chartMax = Math.max(...MONTHLY.map(m => m.revenue));

  const cats = ["All", ...Array.from(new Set(VENDORS.map(v => v.cat)))];
  const filteredVendors = vendorCat === "All" ? vendors : vendors.filter(v => v.cat === vendorCat);

  const daysInMonth = new Date(calMonth.y, calMonth.m + 1, 0).getDate();
  const firstDay = new Date(calMonth.y, calMonth.m, 1).getDay();
  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  function toggleTask(phaseIdx, itemId) {
    setChecklist(prev => prev.map((ph, pi) => pi !== phaseIdx ? ph : {
      ...ph, items: ph.items.map(it => it.id === itemId ? { ...it, done: !it.done } : it)
    }));
  }
  function toggleTimeline(idx) {
    setTimeline(prev => prev.map((t, i) => i !== idx ? t : { ...t, done: !t.done }));
  }

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  const groups = [...new Set(NAV.map(n => n.group))];

  return (
    <div style={{ display: "flex", height: "100vh", background: cream, fontFamily: font, overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: ink, display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
        {/* Header */}
        <div style={{ padding: "22px 20px 16px" }}>
          <div style={{ fontFamily: serif, fontSize: "1.2rem", color: goldLt, fontWeight: 400, lineHeight: 1.1 }}>tendr</div>
          <div style={{ fontSize: 10, color: "rgba(255,248,236,0.4)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>Coordinator</div>
        </div>
        {/* Avatar */}
        <div style={{ padding: "0 16px 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <img src="https://randomuser.me/api/portraits/women/44.jpg" alt={PROFILE.name} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(196,122,46,0.4)" }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#FFF8EC", lineHeight: 1.2 }}>{PROFILE.name}</div>
            <div style={{ fontSize: 10, color: "rgba(255,248,236,0.45)" }}>Tendr Certified ✦</div>
          </div>
        </div>
        {/* Nav */}
        {groups.map(g => (
          <div key={g}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,248,236,0.28)", letterSpacing: "0.16em", textTransform: "uppercase", padding: "10px 20px 4px" }}>{g}</div>
            {NAV.filter(n => n.group === g).map(item => (
              <button key={item.key} onClick={() => setNav(item.key)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 20px", background: nav === item.key ? "rgba(196,122,46,0.18)" : "none", border: "none", cursor: "pointer", color: nav === item.key ? goldLt : "rgba(255,248,236,0.6)", fontSize: 13, fontWeight: nav === item.key ? 700 : 500, fontFamily: font, textAlign: "left", borderLeft: nav === item.key ? `2.5px solid ${gold}` : "2.5px solid transparent" }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                {item.label}
              </button>
            ))}
          </div>
        ))}
        {/* Footer */}
        <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: "1px solid rgba(255,248,236,0.06)" }}>
          <button onClick={() => navigate("/vendor/demo")} style={{ fontSize: 12, color: "rgba(255,248,236,0.4)", background: "none", border: "none", cursor: "pointer", fontFamily: font, padding: 0 }}>← Back to Profile</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Top bar */}
        <div style={{ background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.1)", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: ink }}>{NAV.find(n => n.key === nav)?.label || "Dashboard"}</div>
            <div style={{ fontSize: 12, color: muted, marginTop: 1 }}>Coordinator Demo · {PROFILE.name}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(196,122,46,0.1)", color: gold, borderRadius: 100, padding: "5px 12px", fontSize: 11, fontWeight: 700 }}>
              ✦ Tendr Certified
            </div>
            <button onClick={() => navigate("/vendor/demo?type=Coordinator")} style={{ padding: "8px 16px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: font }}>
              View Public Profile
            </button>
          </div>
        </div>

        <div style={{ padding: "28px 28px 48px" }}>

          {/* ── HOME ─────────────────────────────────────────────────────────── */}
          {nav === "home" && (
            <div>
              {/* Welcome */}
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontFamily: serif, fontSize: "1.7rem", color: ink, fontWeight: 400, marginBottom: 4 }}>Good morning, Nisha ☀️</h2>
                <p style={{ fontSize: 13.5, color: muted }}>You have <strong style={{ color: ink }}>4 active events</strong> and <strong style={{ color: "#D97706" }}>19 pending tasks</strong> this week.</p>
              </div>

              {/* Quick stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
                {[
                  { icon: "📅", label: "Active Events", value: "4", sub: "2 in progress" },
                  { icon: "🏷️", label: "Vendor Network", value: PROFILE.vendorNetwork.toString(), sub: "across 12 categories" },
                  { icon: "⭐", label: "Rating",          value: `${PROFILE.rating}`, sub: `${PROFILE.reviewCount} reviews` },
                  { icon: "💰", label: "Revenue (Sep)",   value: fmt(MONTHLY.at(-1).revenue), sub: `${fmt(MONTHLY.at(-1).revenue - MONTHLY.at(-1).expenses)} net` },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 8px rgba(28,10,4,0.04)" }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: ink, lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: ink, marginTop: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Upcoming events & tasks side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
                {/* Upcoming events */}
                <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 8px rgba(28,10,4,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: ink }}>Upcoming Events</div>
                    <button onClick={() => setNav("events")} style={{ fontSize: 11, color: gold, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: font }}>View All →</button>
                  </div>
                  {events.map(ev => {
                    const st = STATUS_CFG[ev.status] || { bg: "#f3f4f6", color: "#6B7280" };
                    return (
                      <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid rgba(196,122,46,0.07)" }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: parch, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>📋</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.client}</div>
                          <div style={{ fontSize: 11, color: muted }}>{ev.type} · {ev.venue}</div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <span style={{ background: st.bg, color: st.color, fontSize: 10, fontWeight: 700, borderRadius: 100, padding: "2px 8px" }}>{ev.status}</span>
                          <div style={{ fontSize: 11, color: muted, marginTop: 3 }}>{ev.daysLeft}d away</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pending tasks summary */}
                <div>
                  <div style={{ background: "#fff", borderRadius: 16, padding: "20px 22px", border: "1px solid rgba(196,122,46,0.1)", marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: ink, marginBottom: 14 }}>Pending Actions</div>
                    {[
                      { label: "Vendor confirmations",    count: 19, color: "#D97706" },
                      { label: "Timeline gaps to fill",   count: 4,  color: "#7C3AED" },
                      { label: "Payments due this week",  count: 3,  color: "#BE123C" },
                      { label: "Client approvals needed", count: 2,  color: gold       },
                    ].map((a, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < 3 ? "1px solid rgba(196,122,46,0.06)" : "none" }}>
                        <div style={{ fontSize: 13, color: ink }}>{a.label}</div>
                        <span style={{ background: `${a.color}18`, color: a.color, fontSize: 12, fontWeight: 800, borderRadius: 100, padding: "2px 9px" }}>{a.count}</span>
                      </div>
                    ))}
                  </div>
                  {/* Certified badge */}
                  <div style={{ background: `linear-gradient(135deg,${ink},#2C1208)`, borderRadius: 16, padding: "18px 20px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: goldLt, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>✦ Tendr Certified</div>
                    <div style={{ fontFamily: serif, fontSize: "1.1rem", color: "#FFF8EC", lineHeight: 1.4, marginBottom: 10 }}>Background-verified. Client-trusted. Platform-trained.</div>
                    <div style={{ fontSize: 11, color: "rgba(255,248,236,0.5)" }}>Certified since Jan 2023 · Renewal: Jan 2026</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── EVENTS ───────────────────────────────────────────────────────── */}
          {nav === "events" && (
            <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
              {/* Event list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {events.map(ev => {
                  const st = STATUS_CFG[ev.status] || { bg: "#f3f4f6", color: "#6B7280" };
                  const isSelected = selectedEvent.id === ev.id;
                  return (
                    <div key={ev.id} onClick={() => setSelectedEvent(ev)} style={{ background: isSelected ? parch : "#fff", borderRadius: 14, padding: "14px 16px", border: `1.5px solid ${isSelected ? gold : "rgba(196,122,46,0.1)"}`, cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: ink }}>{ev.client}</div>
                        <span style={{ background: st.bg, color: st.color, fontSize: 10, fontWeight: 700, borderRadius: 100, padding: "2px 7px" }}>{ev.status}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: muted, marginBottom: 8 }}>{ev.type} · {ev.daysLeft}d away</div>
                      <div style={{ background: "rgba(196,122,46,0.12)", borderRadius: 100, height: 5, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${ev.progress}%`, background: `linear-gradient(90deg,${gold},${goldLt})`, borderRadius: 100 }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                        <span style={{ fontSize: 10, color: muted }}>{ev.tasks.done}/{ev.tasks.total} tasks</span>
                        <span style={{ fontSize: 10, color: muted }}>{ev.progress}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Event detail */}
              {selectedEvent && (
                <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1px solid rgba(196,122,46,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div>
                      <h3 style={{ fontFamily: serif, fontSize: "1.4rem", color: ink, fontWeight: 400, marginBottom: 4 }}>{selectedEvent.client}</h3>
                      <div style={{ fontSize: 13, color: muted }}>{selectedEvent.type} · {selectedEvent.venue}</div>
                    </div>
                    <span style={{ fontSize: 22, fontWeight: 800, color: goldLt, fontFamily: font }}>{selectedEvent.daysLeft}d</span>
                  </div>
                  {/* Budget */}
                  <div style={{ background: parch, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Budget Overview</div>
                    <div style={{ display: "flex", gap: 24 }}>
                      <div><div style={{ fontSize: 20, fontWeight: 800, color: ink }}>{fmt(selectedEvent.budget)}</div><div style={{ fontSize: 11, color: muted }}>Total Budget</div></div>
                      <div><div style={{ fontSize: 20, fontWeight: 800, color: gold }}>{fmt(selectedEvent.spent)}</div><div style={{ fontSize: 11, color: muted }}>Spent</div></div>
                      <div><div style={{ fontSize: 20, fontWeight: 800, color: "#16A34A" }}>{fmt(selectedEvent.budget - selectedEvent.spent)}</div><div style={{ fontSize: 11, color: muted }}>Remaining</div></div>
                    </div>
                    <div style={{ background: "rgba(196,122,46,0.15)", borderRadius: 100, height: 6, marginTop: 12, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${Math.round(selectedEvent.spent/selectedEvent.budget*100)}%`, background: `linear-gradient(90deg,${gold},${goldLt})`, borderRadius: 100 }} />
                    </div>
                  </div>
                  {/* Stats row */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
                    {[
                      { label: "Tasks Done", value: `${selectedEvent.tasks.done}/${selectedEvent.tasks.total}` },
                      { label: "Vendors Pending", value: selectedEvent.vendorsPending, color: selectedEvent.vendorsPending > 0 ? "#D97706" : "#16A34A" },
                      { label: "Progress", value: `${selectedEvent.progress}%` },
                    ].map((s, i) => (
                      <div key={i} style={{ background: parch, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: s.color || ink }}>{s.value}</div>
                        <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setNav("tasks")} style={{ flex: 1, padding: "10px", borderRadius: 10, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: font }}>Open Checklists</button>
                    <button onClick={() => setNav("timeline")} style={{ flex: 1, padding: "10px", borderRadius: 10, background: parch, color: ink, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: font }}>Run Timeline</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── VENDORS ──────────────────────────────────────────────────────── */}
          {nav === "vendors" && (
            <div>
              {/* Filter row */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
                {cats.map(c => (
                  <button key={c} onClick={() => setVendorCat(c)} style={{ padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700, background: vendorCat === c ? ink : "#fff", color: vendorCat === c ? goldLt : muted, border: `1px solid ${vendorCat === c ? ink : "rgba(196,122,46,0.2)"}`, cursor: "pointer", fontFamily: font }}>{c}</button>
                ))}
              </div>
              {/* Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                {filteredVendors.map(v => (
                  <div key={v.id} style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 8px rgba(28,10,4,0.04)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: `${CAT_COLORS[v.cat] || gold}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: CAT_COLORS[v.cat] || gold }}>{v.name[0]}</span>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, background: v.status === "Preferred" ? "rgba(196,122,46,0.12)" : "rgba(107,114,128,0.1)", color: v.status === "Preferred" ? gold : muted, borderRadius: 100, padding: "2px 8px" }}>{v.status}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: ink, marginBottom: 3 }}>{v.name}</div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, background: `${CAT_COLORS[v.cat] || gold}15`, color: CAT_COLORS[v.cat] || gold, borderRadius: 100, padding: "2px 7px" }}>{v.cat}</span>
                      <span style={{ fontSize: 10, color: muted }}>· {v.city}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: muted, marginBottom: 10 }}>
                      <span>⭐ {v.rating}</span>
                      <span>{v.events} events together</span>
                    </div>
                    <a href={`tel:${v.phone}`} style={{ display: "block", textAlign: "center", padding: "7px", borderRadius: 8, background: parch, color: ink, fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: font }}>{v.phone}</a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TIMELINE ─────────────────────────────────────────────────────── */}
          {nav === "timeline" && (
            <div style={{ maxWidth: 680 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                <div style={{ fontSize: 13, color: muted, fontWeight: 500 }}>Event:</div>
                {events.map(ev => (
                  <button key={ev.id} onClick={() => setSelectedEvent(ev)} style={{ padding: "5px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700, background: selectedEvent.id === ev.id ? ink : "#fff", color: selectedEvent.id === ev.id ? goldLt : muted, border: `1px solid ${selectedEvent.id === ev.id ? ink : "rgba(196,122,46,0.2)"}`, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>{ev.client.split("–")[0].trim()}</button>
                ))}
              </div>
              <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1px solid rgba(196,122,46,0.1)" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: ink, marginBottom: 4 }}>{selectedEvent.client}</div>
                <div style={{ fontSize: 12, color: muted, marginBottom: 20 }}>{selectedEvent.venue} · {selectedEvent.date}</div>
                {/* Timeline */}
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: 52, top: 0, bottom: 0, width: 2, background: "rgba(196,122,46,0.12)" }} />
                  {timeline.map((t, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: muted, width: 42, textAlign: "right", paddingTop: 2, flexShrink: 0 }}>{t.time}</div>
                      <button onClick={() => toggleTimeline(i)} style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${TL_COLORS[t.cat] || gold}`, background: t.done ? (TL_COLORS[t.cat] || gold) : "#fff", cursor: "pointer", flexShrink: 0, marginTop: 1, position: "relative", zIndex: 1 }}>
                        {t.done && <span style={{ color: "#fff", fontSize: 11, position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>✓</span>}
                      </button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: t.done ? 500 : 700, color: t.done ? muted : ink, textDecoration: t.done ? "line-through" : "none" }}>{t.label}</div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: TL_COLORS[t.cat] || gold, background: `${TL_COLORS[t.cat] || gold}12`, borderRadius: 100, padding: "1px 7px", marginTop: 3, display: "inline-block", textTransform: "capitalize" }}>{t.cat}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── TASKS / CHECKLISTS ───────────────────────────────────────────── */}
          {nav === "tasks" && (
            <div style={{ maxWidth: 680 }}>
              <div style={{ background: parch, borderRadius: 14, padding: "14px 18px", marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>Checklist for: {selectedEvent.client}</div>
                <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>
                  {checklist.reduce((s, p) => s + p.items.filter(i => i.done).length, 0)} of {checklist.reduce((s, p) => s + p.items.length, 0)} tasks completed
                </div>
              </div>
              {checklist.map((ph, pi) => {
                const done = ph.items.filter(i => i.done).length;
                return (
                  <div key={pi} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", marginBottom: 14, border: "1px solid rgba(196,122,46,0.1)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: ink }}>{ph.phase}</div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: done === ph.items.length ? "#16A34A" : gold }}>{done}/{ph.items.length}</span>
                    </div>
                    {ph.items.map(item => (
                      <label key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(196,122,46,0.06)", cursor: "pointer" }}>
                        <input type="checkbox" checked={item.done} onChange={() => toggleTask(pi, item.id)} style={{ accentColor: gold, width: 16, height: 16, cursor: "pointer" }} />
                        <span style={{ fontSize: 13, color: item.done ? muted : ink, textDecoration: item.done ? "line-through" : "none" }}>{item.text}</span>
                      </label>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── MONEY / BUDGET ───────────────────────────────────────────────── */}
          {nav === "money" && (
            <div>
              {/* Toggle */}
              <div style={{ display: "inline-flex", background: "#fff", borderRadius: 10, padding: 4, border: "1px solid rgba(196,122,46,0.15)", marginBottom: 20 }}>
                {["chart","stats"].map(v => (
                  <button key={v} onClick={() => setMoneyView(v)} style={{ padding: "6px 18px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: moneyView === v ? ink : "none", color: moneyView === v ? goldLt : muted, border: "none", cursor: "pointer", fontFamily: font, textTransform: "capitalize" }}>{v === "chart" ? "Revenue Chart" : "Event Budgets"}</button>
                ))}
              </div>

              {moneyView === "chart" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
                    {[
                      { label: "Total Revenue (YTD)", value: fmt(totalRevenue), color: gold },
                      { label: "Total Expenses",       value: fmt(totalExpenses), color: "#BE123C" },
                      { label: "Net Profit",            value: fmt(totalRevenue - totalExpenses), color: "#16A34A" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)" }}>
                        <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", border: "1px solid rgba(196,122,46,0.1)" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: ink, marginBottom: 20 }}>Monthly Revenue vs Expenses</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200 }}>
                      {MONTHLY.map((m, i) => (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%" }}>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 3, width: "100%" }}>
                            <div style={{ width: "100%", height: `${Math.round(m.revenue / chartMax * 160)}px`, background: `linear-gradient(to top, ${gold}, ${goldLt})`, borderRadius: "4px 4px 0 0", position: "relative" }}>
                              <div style={{ width: "60%", height: `${Math.round(m.expenses / m.revenue * 100)}%`, background: "rgba(190,18,60,0.35)", position: "absolute", bottom: 0, left: "20%", borderRadius: "2px 2px 0 0" }} />
                            </div>
                          </div>
                          <div style={{ fontSize: 10, color: muted, fontWeight: 600 }}>{m.month}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 8, background: gold, borderRadius: 2 }} /><span style={{ fontSize: 11, color: muted }}>Revenue</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 8, background: "rgba(190,18,60,0.35)", borderRadius: 2 }} /><span style={{ fontSize: 11, color: muted }}>Expenses</span></div>
                    </div>
                  </div>
                </div>
              )}

              {moneyView === "stats" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {events.map(ev => (
                    <div key={ev.id} style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", border: "1px solid rgba(196,122,46,0.1)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{ev.client}</div>
                          <div style={{ fontSize: 12, color: muted }}>{ev.type}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: ink }}>{fmt(ev.budget)}</div>
                          <div style={{ fontSize: 11, color: muted }}>total budget</div>
                        </div>
                      </div>
                      <div style={{ background: "rgba(196,122,46,0.1)", borderRadius: 100, height: 6, overflow: "hidden", marginBottom: 6 }}>
                        <div style={{ height: "100%", width: `${Math.round(ev.spent/ev.budget*100)}%`, background: `linear-gradient(90deg,${gold},${goldLt})`, borderRadius: 100 }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: gold, fontWeight: 600 }}>Spent: {fmt(ev.spent)}</span>
                        <span style={{ fontSize: 11, color: "#16A34A", fontWeight: 600 }}>Left: {fmt(ev.budget - ev.spent)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── REVIEWS ──────────────────────────────────────────────────────── */}
          {nav === "reviews" && (
            <div style={{ maxWidth: 720 }}>
              <div style={{ display: "flex", gap: 20, marginBottom: 22 }}>
                <div style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", border: "1px solid rgba(196,122,46,0.1)", flex: 1 }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: ink }}>{PROFILE.rating}</div>
                  <div style={{ fontSize: 12, color: muted }}>avg rating · {PROFILE.reviewCount} reviews</div>
                </div>
                <div style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", border: "1px solid rgba(196,122,46,0.1)", flex: 1 }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: "#16A34A" }}>{reviews.filter(r => r.rating === 5).length}</div>
                  <div style={{ fontSize: 12, color: muted }}>5-star reviews</div>
                </div>
              </div>
              {reviews.map(r => (
                <div key={r.id} style={{ background: "#fff", borderRadius: 14, padding: "18px 20px", marginBottom: 14, border: "1px solid rgba(196,122,46,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: muted }}>{r.event}</div>
                    </div>
                    <div style={{ fontSize: 13, color: gold }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
                  </div>
                  <p style={{ fontSize: 13, color: ink, lineHeight: 1.55, fontStyle: "italic", margin: "0 0 10px" }}>"{r.text}"</p>
                  {r.response ? (
                    <div style={{ background: parch, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#5A3820", lineHeight: 1.5 }}>
                      <strong>Your reply:</strong> {r.response}
                    </div>
                  ) : (
                    replyId === r.id ? (
                      <div>
                        <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a thoughtful reply…" rows={3} style={{ width: "100%", border: "1px solid rgba(196,122,46,0.2)", borderRadius: 10, padding: "10px 12px", fontSize: 13, fontFamily: font, resize: "none", outline: "none", boxSizing: "border-box" }} />
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <button onClick={() => { setReviews(prev => prev.map(rv => rv.id === r.id ? { ...rv, response: replyText } : rv)); setReplyId(null); setReplyText(""); }} style={{ padding: "7px 18px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: font }}>Post Reply</button>
                          <button onClick={() => { setReplyId(null); setReplyText(""); }} style={{ padding: "7px 14px", borderRadius: 100, background: parch, color: muted, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: font }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setReplyId(r.id)} style={{ fontSize: 12, color: gold, fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: font, padding: 0 }}>+ Reply to client</button>
                    )
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── PROFILE ──────────────────────────────────────────────────────── */}
          {nav === "profile" && (
            <div style={{ maxWidth: 600 }}>
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px 26px", border: "1px solid rgba(196,122,46,0.1)", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt={PROFILE.name} style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: `3px solid ${gold}` }} />
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: ink, fontFamily: serif }}>{PROFILE.name}</div>
                    <div style={{ fontSize: 13, color: muted }}>{PROFILE.type} · {PROFILE.city}</div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(196,122,46,0.1)", color: gold, borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 700, marginTop: 6 }}>✦ Tendr Certified</div>
                  </div>
                </div>
                {[
                  { label: "Full Name", value: PROFILE.name },
                  { label: "Profession", value: PROFILE.type },
                  { label: "City", value: PROFILE.city },
                  { label: "Phone", value: PROFILE.phone },
                  { label: "Email", value: PROFILE.email },
                  { label: "Instagram", value: PROFILE.instagram },
                  { label: "Website", value: PROFILE.website },
                  { label: "LinkedIn", value: PROFILE.linkedin },
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, padding: "11px 0", borderBottom: "1px solid rgba(196,122,46,0.07)", alignItems: "center" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: muted, width: 110, flexShrink: 0 }}>{f.label}</div>
                    <div style={{ fontSize: 13, color: ink }}>{f.value}</div>
                  </div>
                ))}
                <p style={{ fontSize: 13, color: "#5A3820", lineHeight: 1.6, marginTop: 14, fontStyle: "italic" }}>{PROFILE.bio}</p>
              </div>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                {[
                  { label: "Events", value: PROFILE.events },
                  { label: "Years", value: PROFILE.years },
                  { label: "Team", value: PROFILE.teamSize },
                  { label: "Rating", value: PROFILE.rating },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "14px", textAlign: "center", border: "1px solid rgba(196,122,46,0.1)" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: ink }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: muted, marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
