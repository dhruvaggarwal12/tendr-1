import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ── Design tokens ──────────────────────────────────────────────────────────────
const gold   = "#C47A2E";
const goldLt = "#CCAB4A";
const ink    = "#1C0A04";
const cream  = "#FAF7F2";
const muted  = "#9B7450";
const font   = "'Outfit', sans-serif";
const serif  = "'Cormorant Garamond', Georgia, serif";

// ── Mock vendor profile ────────────────────────────────────────────────────────
const INIT_PROFILE = {
  name: "Rahul Khanna",
  type: "Anchor",
  city: "Delhi",
  phone: "+91 98765 43210",
  email: "rahul@rahulkhanna.mc",
  bio: "Delhi-based bilingual anchor & corporate emcee with 10+ years of experience hosting 430+ events — from intimate weddings to 1,000-pax corporate galas. Known for my signature comedy-roast style and seamless Hindi–English hosting.",
  gstNumber: "07AABKU1234R1Z5",
  rating: 4.8,
  reviewCount: 54,
  events: 430,
  responseTime: "< 2 hrs",
  teamSize: 1,
  years: 10,
  instagram: "@rahulkhanna.mc",
  youtube: "youtube.com/@rahulkhannaMC",
  showreel: "https://youtube.com/watch?v=demo-anchor-reel",
  genres: ["Bollywood", "Corporate Hosting", "Comedy Roast", "Bilingual (Hindi + English)", "Punjabi"],
  instruments: [],
  setlist: "Opening ceremony address\nInteractive icebreaker games\nAwards & recognition ceremony\nLive audience Q&A moderation\nEvening entertainment & comedy set\nClosing vote of thanks",
};

// ── Mock Tendr bookings ────────────────────────────────────────────────────────
const INIT_TENDR = [
  { id: "TND001", client: "Mehta Wedding", event: "Wedding Reception", date: "2026-09-20", venue: "The Grand, Delhi", budget: "₹35,000", status: "Pending", message: "Looking for a bilingual MC for our reception. 200 guests, 6 pm onwards." },
  { id: "TND002", client: "HDFC Life Insurance", event: "Annual Awards Night", date: "2026-09-28", venue: "Taj Palace, Delhi", budget: "₹75,000", status: "Confirmed", message: "Corporate awards night for 400 employees. Formal + fun tone." },
  { id: "TND003", client: "Priya Kapoor", event: "30th Birthday Bash", date: "2026-10-05", venue: "Rosewood Club, Gurgaon", budget: "₹20,000", status: "Pending", message: "Fun, energetic MC for a birthday party. 80 close friends." },
  { id: "TND004", client: "Startup Delhi Summit", event: "Investor Demo Day", date: "2026-10-14", venue: "India Habitat Centre", budget: "₹50,000", status: "Pending", message: "Hosting a demo day for 20 startups + 50 VCs. Professional tone." },
  { id: "TND005", client: "Sharma Family", event: "25th Anniversary", date: "2026-10-22", venue: "ITC Maurya, Delhi", budget: "₹30,000", status: "Declined", message: "Silver jubilee anniversary party, ~120 guests." },
];

// ── Mock outside orders ────────────────────────────────────────────────────────
const INIT_OUTSIDE = [
  { id: "OUT001", client: "TechConf India", event: "Product Launch", date: "2026-09-15", amount: 55000, paidAmount: 55000, expenses: [{ label: "Travel", amount: 2000 }], status: "Completed" },
  { id: "OUT002", client: "Ananya & Karan", event: "Wedding Ceremony", date: "2026-08-10", amount: 45000, paidAmount: 45000, expenses: [{ label: "Prep materials", amount: 1500 }], status: "Completed" },
  { id: "OUT003", client: "ITC Hotels", event: "Corporate Gala Dinner", date: "2026-09-30", amount: 60000, paidAmount: 30000, expenses: [], status: "Upcoming" },
  { id: "OUT004", client: "Meghna Patel", event: "30th Birthday Bash", date: "2026-07-25", amount: 18000, paidAmount: 18000, expenses: [], status: "Completed" },
  { id: "OUT005", client: "EduSpark Summit", event: "School Annual Day", date: "2026-08-28", amount: 25000, paidAmount: 25000, expenses: [{ label: "Props", amount: 800 }], status: "Completed" },
  { id: "OUT006", client: "Samsung India", event: "Product Launch Delhi", date: "2026-07-08", amount: 70000, paidAmount: 70000, expenses: [{ label: "Outfit rental", amount: 3000 }], status: "Completed" },
  { id: "OUT007", client: "Kapoor & Sons", event: "Wedding Reception", date: "2026-06-14", amount: 40000, paidAmount: 40000, expenses: [], status: "Completed" },
];

// ── Monthly P&L ────────────────────────────────────────────────────────────────
const MONTHLY = [
  { month: "Mar", revenue: 85000, expenses: 9000 },
  { month: "Apr", revenue: 92000, expenses: 11000 },
  { month: "May", revenue: 63000, expenses: 7500 },
  { month: "Jun", revenue: 118000, expenses: 16000 },
  { month: "Jul", revenue: 98000, expenses: 12000 },
  { month: "Aug", revenue: 143000, expenses: 19000 },
  { month: "Sep", revenue: 55000, expenses: 6000 },
];

// ── Mock reviews ───────────────────────────────────────────────────────────────
const INIT_REVIEWS = [
  { id: 1, name: "Ananya & Karan Wedding", event: "Wedding, Aug 2025", rating: 5, text: "Rahul was exceptional! He kept the energy alive through the entire ceremony and reception. Guests are still talking about how smooth the evening flowed.", response: "Thank you so much Ananya & Karan — this was one of my favourite weddings of 2025. Wishing you both a lifetime of happiness! 🥂" },
  { id: 2, name: "HDFC Life Insurance", event: "Awards Night, Jun 2025", rating: 5, text: "Outstanding professionalism. Rahul adapted seamlessly to our corporate tone and had the audience engaged throughout. Will definitely book him again.", response: "Truly an honour to host HDFC Life — what a fantastic team and audience. Looking forward to the Q3 summit!" },
  { id: 3, name: "Meghna Patel", event: "Birthday, Jul 2025", rating: 5, text: "Best birthday ever! He had the crowd roaring with laughter within 5 minutes. The personalised roast was perfectly tailored to our group.", response: "Meghna — your friends were the best crowd! The prep call really helped me tailor the roast perfectly. Thank you for trusting me with your big 3-0! 🎉" },
  { id: 4, name: "EduSpark Summit", event: "School Annual Day, Aug 2025", rating: 4, text: "Very good with the kids and parents. Slightly rushed at the end but overall a great experience. Would recommend for school events.", response: null },
  { id: 5, name: "TechConf India", event: "Product Launch, Sep 2025", rating: 5, text: "Rahul elevated our product launch with energy and sharp wit. The tech crowd loved him. Very punctual and well-prepared.", response: null },
  { id: 6, name: "Samsung India", event: "Product Launch, Jul 2025", rating: 5, text: "Phenomenal hosting. Perfect balance of hype and information. The 1,500-person crowd was engaged the whole time.", response: "Samsung events are always special — the scale and energy are unmatched. Thank you for having me! 🙏" },
];

// ── Mock packages ──────────────────────────────────────────────────────────────
const INIT_PACKAGES = [
  { id: 1, name: "Half Day", price: 25000, unit: "4 hours", icon: "🥉", items: "Pre-event briefing call\nBilingual hosting (Hindi + English)\nUp to 4 hrs coverage\nScript + cue card prep" },
  { id: 2, name: "Full Day", price: 45000, unit: "full event", icon: "🥇", badge: "Most Popular", items: "Pre-event strategy call\nBilingual hosting\nFull-day coverage (10 hrs)\nCustom script writing\nLive audience games\nEmcee standby between segments" },
  { id: 3, name: "Premium Corporate", price: 85000, unit: "full event", icon: "💎", items: "2 planning calls + site visit\nCorporate-grade scripting\nAwards & recognition hosting\nPanel moderation\nLive crowd interaction design\nPost-event highlight video intro" },
];

// ── Mock setlist / inventory ───────────────────────────────────────────────────
const INIT_SETLIST = [
  "Opening ceremony address",
  "Interactive icebreaker games",
  "Awards & recognition ceremony",
  "Live audience Q&A moderation",
  "Evening entertainment & comedy set",
  "Closing vote of thanks",
];

// ── Booked dates for calendar ─────────────────────────────────────────────────
const BOOKED_DATES = new Set(["2026-09-15", "2026-09-20", "2026-09-28", "2026-09-30", "2026-10-05", "2026-10-14", "2026-10-22"]);

// ── Nav items ──────────────────────────────────────────────────────────────────
const NAV = [
  { key: "home",        group: "EVENTS",   label: "Home",        icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
  { key: "work",        group: "EVENTS",   label: "Work",        icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" },
  { key: "money",       group: "MONEY",    label: "Money",       icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
  { key: "packages",    group: "MANAGE",   label: "Packages",    icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" },
  { key: "reviews",     group: "MANAGE",   label: "Reviews",     icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { key: "inventory",   group: "MANAGE",   label: "Setlist",     icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
  { key: "profile",     group: "MANAGE",   label: "Profile",     icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
  { key: "gig",         group: "ARTIST",   label: "Performance", icon: "M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
  { key: "calendar",    group: "SCHEDULE", label: "Availability",icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" },
  { key: "market",      group: "GROW",     label: "Grow",        icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function Icon({ d: path, size = 18, color = "currentColor", fill = "none", strokeW = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

function Stars({ r, size = 13 }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.round(r) ? goldLt : "none"} stroke={goldLt} strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

function fmt(n) { return "₹" + Number(n).toLocaleString("en-IN"); }

function Badge({ count, color = "#DC2626" }) {
  if (!count) return null;
  return <span style={{ background: color, color: "#fff", borderRadius: 100, padding: "1px 6px", fontSize: 10, fontWeight: 800, marginLeft: 6 }}>{count}</span>;
}

// ── localStorage helpers ───────────────────────────────────────────────────────
const LS_KEY = "tendr_demo_dash_v1";
function lsGet(key, fallback) {
  try { const s = localStorage.getItem(`${LS_KEY}:${key}`); return s ? JSON.parse(s) : fallback; } catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(`${LS_KEY}:${key}`, JSON.stringify(val)); } catch {}
}
function lsClear() {
  try { Object.keys(localStorage).filter(k => k.startsWith(LS_KEY)).forEach(k => localStorage.removeItem(k)); } catch {}
}

// ── Persisted state hook ───────────────────────────────────────────────────────
function usePersisted(key, init) {
  const [val, setVal] = useState(() => lsGet(key, init));
  const setAndPersist = (v) => {
    const next = typeof v === "function" ? v(val) : v;
    setVal(next);
    lsSet(key, next);
  };
  return [val, setAndPersist];
}

// ══ MAIN COMPONENT ════════════════════════════════════════════════════════════
export default function DemoDashboard() {
  const nav = useNavigate();
  const [tab, setTab]         = useState("home");

  // All key state is persisted to localStorage so changes survive refresh
  const [profile, setProfile]   = usePersisted("profile", INIT_PROFILE);
  const [tendr,   setTendr]     = usePersisted("tendr",   INIT_TENDR);
  const [reviews, setReviews]   = usePersisted("reviews", INIT_REVIEWS);
  const [pkgs,    setPkgs]      = usePersisted("pkgs",    INIT_PACKAGES);
  const [setlist, setSetlist]   = usePersisted("setlist", INIT_SETLIST);
  const [outside]               = useState(INIT_OUTSIDE); // outside orders: read-only mock

  const [profEdit, setProfEdit]   = useState(false);
  const [profDraft, setProfDraft] = useState({});
  const [replyDraft, setReplyDraft] = useState({});
  const [pkgModal, setPkgModal]   = useState(null);
  const [pkgDraft, setPkgDraft]   = useState({});
  const [newItem, setNewItem]     = useState("");
  const [moneyView, setMoneyView] = useState("pl");
  const [workView, setWorkView]   = useState("tendr");
  const [gigDraft, setGigDraft]   = useState({ genres: profile.genres.join(", "), showreel: profile.showreel, instagram: profile.instagram, youtube: profile.youtube, setlist: profile.setlist });
  const [gigSaved, setGigSaved]   = useState(false);
  const [dispModal, setDispModal] = useState(null);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Keep gigDraft in sync when profile loads from localStorage
  useEffect(() => {
    setGigDraft({ genres: (profile.genres || []).join(", "), showreel: profile.showreel || "", instagram: profile.instagram || "", youtube: profile.youtube || "", setlist: profile.setlist || "" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleReset() {
    lsClear();
    setProfile(INIT_PROFILE); lsSet("profile", INIT_PROFILE);
    setTendr(INIT_TENDR);     lsSet("tendr",   INIT_TENDR);
    setReviews(INIT_REVIEWS); lsSet("reviews", INIT_REVIEWS);
    setPkgs(INIT_PACKAGES);   lsSet("pkgs",    INIT_PACKAGES);
    setSetlist(INIT_SETLIST); lsSet("setlist", INIT_SETLIST);
    setGigDraft({ genres: INIT_PROFILE.genres.join(", "), showreel: INIT_PROFILE.showreel, instagram: INIT_PROFILE.instagram, youtube: INIT_PROFILE.youtube, setlist: INIT_PROFILE.setlist });
    setResetConfirm(false);
  }

  // Derived counts for badges
  const pendingTendr = tendr.filter(b => b.status === "Pending").length;
  const unrespondedReviews = reviews.filter(r => !r.response).length;

  // ── Sidebar ────────────────────────────────────────────────────────────────
  function Sidebar() {
    let prevGroup = null;
    return (
      <div style={{ width: 200, background: ink, display: "flex", flexDirection: "column", minHeight: "100vh", flexShrink: 0 }}>
        {/* Logo */}
        <div style={{ padding: "22px 20px 16px", borderBottom: "1px solid rgba(204,171,74,0.12)" }}>
          <div style={{ fontFamily: serif, fontSize: "1.45rem", color: goldLt, fontWeight: 400, letterSpacing: "0.02em" }}>tendr</div>
          <div style={{ fontSize: 10.5, color: "rgba(255,248,236,0.35)", marginTop: 2, fontWeight: 600, letterSpacing: "0.12em" }}>VENDOR DEMO</div>
        </div>

        {/* Nav */}
        <div style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
          {NAV.map(item => {
            const showDivider = item.group !== prevGroup;
            prevGroup = item.group;
            return (
              <React.Fragment key={item.key}>
                {showDivider && (
                  <div style={{ padding: "14px 20px 4px", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em", color: "rgba(204,171,74,0.35)", textTransform: "uppercase" }}>
                    {item.group}
                  </div>
                )}
                <button
                  onClick={() => setTab(item.key)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", background: tab === item.key ? "rgba(204,171,74,0.12)" : "none", border: "none", cursor: "pointer", color: tab === item.key ? goldLt : "rgba(255,248,236,0.55)", fontSize: 13, fontWeight: tab === item.key ? 700 : 500, fontFamily: font, textAlign: "left", borderLeft: tab === item.key ? `3px solid ${goldLt}` : "3px solid transparent", transition: "all 0.15s" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                  {item.label}
                  {item.key === "work" && <Badge count={pendingTendr} />}
                  {item.key === "reviews" && <Badge count={unrespondedReviews} color={gold} />}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Profile footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(204,171,74,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${gold}, ${goldLt})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontFamily: serif, color: "#fff", fontWeight: 400 }}>
              {profile.name[0]}
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,248,236,0.85)", fontFamily: font }}>{profile.name}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,248,236,0.35)" }}>{profile.type}</div>
            </div>
          </div>
          {resetConfirm ? (
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,248,236,0.55)", marginBottom: 6, fontFamily: font }}>Reset all demo data?</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={handleReset} style={{ flex: 1, padding: "5px 0", borderRadius: 8, background: "#BE123C", color: "#fff", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: font }}>Yes, Reset</button>
                <button onClick={() => setResetConfirm(false)} style={{ flex: 1, padding: "5px 0", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "rgba(255,248,236,0.6)", fontSize: 11, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: font }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setResetConfirm(true)} style={{ width: "100%", padding: "6px 0", borderRadius: 8, background: "rgba(255,255,255,0.05)", color: "rgba(255,248,236,0.3)", fontSize: 10.5, fontWeight: 600, border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", fontFamily: font }}>↺ Reset demo data</button>
          )}
        </div>
      </div>
    );
  }

  // ── Content area ───────────────────────────────────────────────────────────
  const content = (() => {
    // ── HOME ──────────────────────────────────────────────────────────────────
    if (tab === "home") {
      const totalRevenue = outside.reduce((s, o) => s + o.paidAmount, 0);
      const today = new Date().toISOString().slice(0, 10);
      const todayGigs = [...tendr.filter(b => b.date === today && b.status === "Confirmed"), ...outside.filter(o => o.date === today)];
      const upcoming = [...tendr.filter(b => b.status === "Confirmed" && b.date >= today), ...outside.filter(o => o.status === "Upcoming")].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);

      return (
        <div>
          <h2 style={{ fontFamily: serif, fontSize: "1.8rem", fontWeight: 400, color: ink, marginBottom: 4 }}>Good morning, {profile.name.split(" ")[0]} 👋</h2>
          <p style={{ color: muted, fontSize: 13.5, marginBottom: 24 }}>Here's your event overview</p>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 22 }}>
            {[
              { label: "Total Gigs", value: profile.events + "+", sub: "all time" },
              { label: "Total Earned", value: fmt(totalRevenue), sub: "collected" },
              { label: "Rating", value: `${profile.rating} ★`, sub: `${profile.reviewCount} reviews` },
            ].map((s, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: ink, fontFamily: font }}>{s.value}</div>
                <div style={{ fontSize: 11, color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "rgba(155,116,80,0.6)", marginTop: 1 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Today's gigs */}
          {todayGigs.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", marginBottom: 18, border: `1.5px solid rgba(34,197,94,0.3)`, boxShadow: "0 2px 10px rgba(34,197,94,0.06)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Today's Gigs</div>
              {todayGigs.map((g, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: i > 0 ? "1px solid rgba(196,122,46,0.08)" : "none" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{g.client}</div>
                    <div style={{ fontSize: 12, color: muted }}>{g.event} · {g.venue || "—"}</div>
                  </div>
                  <span style={{ background: "rgba(34,197,94,0.1)", color: "#16A34A", borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>Today</span>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Upcoming Confirmed</div>
            {upcoming.length === 0 && <p style={{ fontSize: 13, color: muted }}>No upcoming confirmed gigs.</p>}
            {upcoming.map((g, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: i > 0 ? "1px solid rgba(196,122,46,0.08)" : "none" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{g.client}</div>
                  <div style={{ fontSize: 12, color: muted }}>{g.event}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: gold }}>{g.date}</div>
                  <div style={{ fontSize: 11.5, color: muted }}>{g.budget || fmt(g.amount)}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Pending requests alert */}
          {pendingTendr > 0 && (
            <div onClick={() => setTab("work")} style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 14, padding: "14px 18px", marginTop: 16, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <span style={{ fontSize: 20 }}>🔔</span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: "#DC2626" }}>{pendingTendr} new booking request{pendingTendr > 1 ? "s" : ""} waiting</div>
                <div style={{ fontSize: 12, color: "#EF4444" }}>Tap to review and accept</div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // ── WORK ──────────────────────────────────────────────────────────────────
    if (tab === "work") {
      return (
        <div>
          <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink, marginBottom: 18 }}>Work</h2>
          {/* Sub-nav */}
          <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
            {[["tendr", "Tendr Requests"], ["outside", "Direct / Outside"]].map(([k, l]) => (
              <button key={k} onClick={() => setWorkView(k)} style={{ padding: "8px 18px", borderRadius: 100, background: workView === k ? ink : "#fff", color: workView === k ? "#FFF8EC" : muted, border: `1px solid ${workView === k ? ink : "rgba(196,122,46,0.2)"}`, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                {l}{k === "tendr" && pendingTendr > 0 && <Badge count={pendingTendr} />}
              </button>
            ))}
          </div>

          {workView === "tendr" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {tendr.map(b => (
                <div key={b.id} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: `1.5px solid ${b.status === "Pending" ? "rgba(196,122,46,0.3)" : b.status === "Confirmed" ? "rgba(34,197,94,0.25)" : "rgba(0,0,0,0.08)"}`, boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: ink }}>{b.client}</div>
                      <div style={{ fontSize: 12.5, color: muted }}>{b.event} · {b.date} · {b.venue}</div>
                    </div>
                    <span style={{ background: b.status === "Pending" ? "rgba(196,122,46,0.1)" : b.status === "Confirmed" ? "rgba(34,197,94,0.1)" : "rgba(0,0,0,0.05)", color: b.status === "Pending" ? gold : b.status === "Confirmed" ? "#16A34A" : muted, borderRadius: 100, padding: "3px 12px", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {b.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "#4A3020", lineHeight: 1.6, marginBottom: 10 }}>"{b.message}"</p>
                  <div style={{ fontSize: 13, fontWeight: 700, color: gold, marginBottom: b.status === "Pending" ? 14 : 0 }}>Budget: {b.budget}</div>
                  {b.status === "Pending" && (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setTendr(p => p.map(x => x.id === b.id ? { ...x, status: "Confirmed" } : x))} style={{ flex: 1, padding: "10px", borderRadius: 100, background: `linear-gradient(135deg, ${gold}, ${goldLt})`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                        ✓ Accept
                      </button>
                      <button onClick={() => setTendr(p => p.map(x => x.id === b.id ? { ...x, status: "Declined" } : x))} style={{ flex: 1, padding: "10px", borderRadius: 100, background: "#fff", color: "#DC2626", border: "1.5px solid #FECACA", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                        ✕ Decline
                      </button>
                    </div>
                  )}
                  {b.status === "Confirmed" && (
                    <button onClick={() => setDispModal(b)} style={{ padding: "8px 16px", borderRadius: 100, background: "none", border: "1px solid #FECACA", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font, marginTop: 4 }}>
                      ⚑ Dispute / Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {workView === "outside" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {outside.map(o => (
                <div key={o.id} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: ink }}>{o.client}</div>
                      <div style={{ fontSize: 12.5, color: muted }}>{o.event} · {o.date}</div>
                    </div>
                    <span style={{ background: o.status === "Completed" ? "rgba(34,197,94,0.1)" : "rgba(196,122,46,0.1)", color: o.status === "Completed" ? "#16A34A" : gold, borderRadius: 100, padding: "3px 12px", fontSize: 11, fontWeight: 700 }}>{o.status}</span>
                  </div>
                  <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
                    <div><div style={{ fontSize: 10, color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total</div><div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{fmt(o.amount)}</div></div>
                    <div><div style={{ fontSize: 10, color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Collected</div><div style={{ fontSize: 14, fontWeight: 700, color: "#16A34A" }}>{fmt(o.paidAmount)}</div></div>
                    {o.paidAmount < o.amount && <div><div style={{ fontSize: 10, color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Pending</div><div style={{ fontSize: 14, fontWeight: 700, color: "#DC2626" }}>{fmt(o.amount - o.paidAmount)}</div></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // ── MONEY ─────────────────────────────────────────────────────────────────
    if (tab === "money") {
      const totalRevenue = MONTHLY.reduce((s, m) => s + m.revenue, 0);
      const totalExpenses = MONTHLY.reduce((s, m) => s + m.expenses, 0);
      const totalProfit = totalRevenue - totalExpenses;
      const maxBar = Math.max(...MONTHLY.map(m => m.revenue));
      const curMonth = MONTHLY[MONTHLY.length - 1];

      return (
        <div>
          <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink, marginBottom: 18 }}>Money</h2>
          {/* Toggle */}
          <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
            {[["pl", "P & L"], ["stats", "Stats"]].map(([k, l]) => (
              <button key={k} onClick={() => setMoneyView(k)} style={{ padding: "8px 18px", borderRadius: 100, background: moneyView === k ? ink : "#fff", color: moneyView === k ? "#FFF8EC" : muted, border: `1px solid ${moneyView === k ? ink : "rgba(196,122,46,0.2)"}`, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                {l}
              </button>
            ))}
          </div>

          {moneyView === "pl" && (
            <>
              {/* Summary cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 22 }}>
                {[
                  { label: "Total Revenue", value: fmt(totalRevenue), color: gold },
                  { label: "Total Expenses", value: fmt(totalExpenses), color: "#DC2626" },
                  { label: "Net Profit", value: fmt(totalProfit), color: "#16A34A" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: font }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1px solid rgba(196,122,46,0.1)", marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 18 }}>Monthly Revenue (Mar–Sep 2026)</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
                  {MONTHLY.map((m, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ width: "100%", height: Math.round((m.revenue / maxBar) * 100) + "px", background: i === MONTHLY.length - 1 ? `linear-gradient(180deg, ${goldLt}, ${gold})` : `linear-gradient(180deg, rgba(196,122,46,0.5), rgba(196,122,46,0.25))`, borderRadius: "4px 4px 0 0", minHeight: 4 }} />
                      <div style={{ fontSize: 10, color: muted, fontWeight: 600 }}>{m.month}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly breakdown */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "0 20px", border: "1px solid rgba(196,122,46,0.1)" }}>
                {MONTHLY.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < MONTHLY.length - 1 ? "1px solid rgba(196,122,46,0.08)" : "none" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: ink, width: 40 }}>{m.month}</div>
                    <div style={{ fontSize: 13, color: gold, fontWeight: 700 }}>+{fmt(m.revenue)}</div>
                    <div style={{ fontSize: 13, color: "#DC2626", fontWeight: 600 }}>−{fmt(m.expenses)}</div>
                    <div style={{ fontSize: 13, color: "#16A34A", fontWeight: 800 }}>{fmt(m.revenue - m.expenses)}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {moneyView === "stats" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  { label: "Gigs This Month", value: "4" },
                  { label: "Avg per Gig", value: fmt(Math.round(curMonth.revenue / 4)) },
                  { label: "Highest Month", value: "Aug 2026" },
                  { label: "YTD Profit", value: fmt(totalProfit) },
                  { label: "Expense Ratio", value: Math.round((totalExpenses / totalRevenue) * 100) + "%" },
                  { label: "Repeat Clients", value: "62%" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: ink, fontFamily: font }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      );
    }

    // ── PACKAGES ──────────────────────────────────────────────────────────────
    if (tab === "packages") {
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink }}>Packages</h2>
            <button onClick={() => { setPkgDraft({ name: "", price: "", unit: "per event", icon: "🥈", items: "" }); setPkgModal("new"); }} style={{ padding: "10px 20px", borderRadius: 100, background: `linear-gradient(135deg, ${gold}, ${goldLt})`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              + New Package
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {pkgs.map(pkg => (
              <div key={pkg.id} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.12)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: 20, marginRight: 8 }}>{pkg.icon}</span>
                    <span style={{ fontSize: 16, fontFamily: serif, fontWeight: 500, color: ink }}>{pkg.name}</span>
                    {pkg.badge && <span style={{ background: gold, color: "#fff", borderRadius: 100, padding: "2px 10px", fontSize: 10, fontWeight: 800, marginLeft: 8 }}>{pkg.badge}</span>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: gold, fontFamily: font }}>{fmt(pkg.price)}</div>
                    <div style={{ fontSize: 11.5, color: muted }}>{pkg.unit}</div>
                  </div>
                </div>
                <ul style={{ margin: "12px 0 14px 20px", padding: 0 }}>
                  {pkg.items.split("\n").filter(Boolean).map((item, i) => <li key={i} style={{ fontSize: 13, color: "#4A3020", marginBottom: 4 }}>{item}</li>)}
                </ul>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setPkgDraft({ ...pkg }); setPkgModal(pkg); }} style={{ padding: "7px 16px", borderRadius: 100, background: cream, border: "1px solid rgba(196,122,46,0.15)", color: muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Edit</button>
                  <button onClick={() => setPkgs(p => p.filter(x => x.id !== pkg.id))} style={{ padding: "7px 16px", borderRadius: 100, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Delete</button>
                </div>
              </div>
            ))}
          </div>

          {/* Package modal */}
          {pkgModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(28,10,4,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <div style={{ background: "#fff", borderRadius: 20, padding: "28px", width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(28,10,4,0.25)" }}>
                <h3 style={{ fontFamily: serif, fontSize: "1.3rem", fontWeight: 500, color: ink, marginBottom: 20 }}>{pkgModal === "new" ? "New Package" : "Edit Package"}</h3>
                {[
                  ["name", "Package Name", "text"],
                  ["price", "Price (₹)", "number"],
                  ["unit", "Unit (e.g. per event)", "text"],
                  ["icon", "Icon (emoji)", "text"],
                ].map(([key, label, type]) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{label}</label>
                    <input type={type} value={pkgDraft[key] || ""} onChange={e => setPkgDraft(p => ({ ...p, [key]: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box" }} />
                  </div>
                ))}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Inclusions (one per line)</label>
                  <textarea value={pkgDraft.items || ""} onChange={e => setPkgDraft(p => ({ ...p, items: e.target.value }))} rows={4} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font, color: ink, background: cream, resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => {
                    if (pkgModal === "new") setPkgs(p => [...p, { ...pkgDraft, id: Date.now(), price: Number(pkgDraft.price) }]);
                    else setPkgs(p => p.map(x => x.id === pkgModal.id ? { ...pkgDraft, id: pkgModal.id, price: Number(pkgDraft.price) } : x));
                    setPkgModal(null);
                  }} style={{ flex: 1, padding: "12px", borderRadius: 100, background: `linear-gradient(135deg, ${gold}, ${goldLt})`, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Save Package</button>
                  <button onClick={() => setPkgModal(null)} style={{ padding: "12px 20px", borderRadius: 100, background: cream, border: "none", color: muted, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // ── REVIEWS ───────────────────────────────────────────────────────────────
    if (tab === "reviews") {
      const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
      return (
        <div>
          <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink, marginBottom: 20 }}>Reviews</h2>

          {/* Summary */}
          <div style={{ background: ink, borderRadius: 20, padding: "22px 26px", marginBottom: 22, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: serif, fontSize: "3rem", fontWeight: 400, color: goldLt, lineHeight: 1 }}>{avg}</div>
              <Stars r={Number(avg)} size={15} />
              <div style={{ fontSize: 12, color: "rgba(255,248,236,0.45)", marginTop: 5 }}>{reviews.length} reviews</div>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              {[5,4,3,2,1].map(n => {
                const cnt = reviews.filter(r => r.rating === n).length;
                const pct = Math.round((cnt / reviews.length) * 100);
                return (
                  <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,248,236,0.5)", width: 8 }}>{n}</span>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill={goldLt}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 100 }}>
                      <div style={{ width: pct + "%", height: "100%", background: goldLt, borderRadius: 100 }} />
                    </div>
                    <span style={{ fontSize: 10.5, color: "rgba(255,248,236,0.3)", width: 24 }}>{cnt}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {reviews.map(r => (
              <div key={r.id} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{r.name}</div>
                    <div style={{ fontSize: 11.5, color: muted, marginTop: 2 }}>{r.event}</div>
                  </div>
                  <Stars r={r.rating} />
                </div>
                <p style={{ fontSize: 13.5, color: "#4A3020", lineHeight: 1.7, marginBottom: r.response || !r._editing ? 10 : 0 }}>"{r.text}"</p>

                {r.response && (
                  <div style={{ padding: "12px 14px", background: cream, borderRadius: 10, display: "flex", gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${gold},${goldLt})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: gold, marginBottom: 3 }}>Your Response</div>
                      <p style={{ fontSize: 13, color: "#4A3020", lineHeight: 1.6, margin: 0 }}>{r.response}</p>
                    </div>
                  </div>
                )}

                {!r.response && (
                  <div>
                    {r._editing ? (
                      <div>
                        <textarea
                          value={replyDraft[r.id] || ""}
                          onChange={e => setReplyDraft(p => ({ ...p, [r.id]: e.target.value }))}
                          placeholder="Write a response..."
                          rows={3}
                          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font, color: ink, background: cream, resize: "vertical", boxSizing: "border-box", marginBottom: 8 }}
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => {
                            if (!replyDraft[r.id]?.trim()) return;
                            setReviews(prev => prev.map(x => x.id === r.id ? { ...x, response: replyDraft[r.id], _editing: false } : x));
                          }} style={{ padding: "8px 18px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Post Response</button>
                          <button onClick={() => setReviews(prev => prev.map(x => x.id === r.id ? { ...x, _editing: false } : x))} style={{ padding: "8px 16px", borderRadius: 100, background: cream, border: "none", color: muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setReviews(prev => prev.map(x => x.id === r.id ? { ...x, _editing: true } : x))} style={{ padding: "7px 16px", borderRadius: 100, background: cream, border: "1px solid rgba(196,122,46,0.15)", color: muted, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                        Reply to this review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ── SETLIST / INVENTORY ────────────────────────────────────────────────────
    if (tab === "inventory") {
      return (
        <div>
          <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink, marginBottom: 6 }}>Setlist / Rundown</h2>
          <p style={{ fontSize: 13, color: muted, marginBottom: 22 }}>Your standard show segments — drag to reorder, add or remove as needed.</p>

          <div style={{ background: "#fff", borderRadius: 16, padding: "6px 20px", border: "1px solid rgba(196,122,46,0.1)", marginBottom: 16 }}>
            {setlist.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0", borderBottom: i < setlist.length - 1 ? "1px solid rgba(196,122,46,0.08)" : "none" }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: cream, border: `1px solid rgba(196,122,46,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 700, color: gold, flexShrink: 0 }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 14, color: ink }}>{item}</span>
                <button onClick={() => setSetlist(p => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: 16, padding: "4px", lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && newItem.trim()) { setSetlist(p => [...p, newItem.trim()]); setNewItem(""); } }} placeholder="Add new segment..." style={{ flex: 1, padding: "10px 16px", borderRadius: 100, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13.5, fontFamily: font, color: ink, background: "#fff" }} />
            <button onClick={() => { if (newItem.trim()) { setSetlist(p => [...p, newItem.trim()]); setNewItem(""); } }} style={{ padding: "10px 22px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Add</button>
          </div>
        </div>
      );
    }

    // ── PROFILE ───────────────────────────────────────────────────────────────
    if (tab === "profile") {
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink }}>Profile</h2>
            {!profEdit ? (
              <button onClick={() => { setProfDraft({ ...profile }); setProfEdit(true); }} style={{ padding: "10px 20px", borderRadius: 100, background: cream, border: "1px solid rgba(196,122,46,0.2)", color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Edit Profile</button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setProfile(profDraft); setProfEdit(false); }} style={{ padding: "10px 20px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Save</button>
                <button onClick={() => setProfEdit(false)} style={{ padding: "10px 16px", borderRadius: 100, background: cream, border: "none", color: muted, fontSize: 13, cursor: "pointer", fontFamily: font }}>Cancel</button>
              </div>
            )}
          </div>

          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: `linear-gradient(135deg,${gold},${goldLt})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontFamily: serif, color: "#fff" }}>{profile.name[0]}</div>
            <div>
              <div style={{ fontSize: 18, fontFamily: serif, fontWeight: 500, color: ink }}>{profile.name}</div>
              <div style={{ fontSize: 13, color: muted }}>{profile.type} · {profile.city}</div>
              <Stars r={profile.rating} /> <span style={{ fontSize: 12, color: muted, marginLeft: 4 }}>{profile.rating} ({profile.reviewCount} reviews)</span>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)", marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Basic Info</div>
            {[["name","Name"],["phone","Phone"],["email","Email"],["city","City"]].map(([k, l]) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 }}>{l}</label>
                {profEdit ? (
                  <input value={profDraft[k] || ""} onChange={e => setProfDraft(p => ({ ...p, [k]: e.target.value }))} style={{ width: "100%", padding: "9px 13px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box" }} />
                ) : (
                  <div style={{ fontSize: 14, color: ink, padding: "9px 0" }}>{profile[k]}</div>
                )}
              </div>
            ))}
            <div style={{ marginBottom: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 }}>Bio</label>
              {profEdit ? (
                <textarea value={profDraft.bio || ""} onChange={e => setProfDraft(p => ({ ...p, bio: e.target.value }))} rows={4} style={{ width: "100%", padding: "9px 13px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font, color: ink, background: cream, resize: "vertical", boxSizing: "border-box" }} />
              ) : (
                <div style={{ fontSize: 13.5, color: "#4A3020", lineHeight: 1.7 }}>{profile.bio}</div>
              )}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>GST & Business</div>
            <div style={{ marginBottom: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 }}>GST Number</label>
              {profEdit ? (
                <input value={profDraft.gstNumber || ""} onChange={e => setProfDraft(p => ({ ...p, gstNumber: e.target.value }))} placeholder="e.g. 07AABKU1234R1Z5" style={{ width: "100%", padding: "9px 13px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box" }} />
              ) : (
                <div style={{ fontSize: 14, color: ink, padding: "9px 0", fontFamily: "monospace" }}>{profile.gstNumber || <span style={{ color: muted, fontStyle: "italic" }}>Not set</span>}</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // ── PERFORMANCE / GIG PROFILE ─────────────────────────────────────────────
    if (tab === "gig") {
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink }}>Performance Profile</h2>
            <button onClick={() => { setProfile(p => ({ ...p, genres: gigDraft.genres.split(",").map(g => g.trim()).filter(Boolean), showreel: gigDraft.showreel, instagram: gigDraft.instagram, youtube: gigDraft.youtube, setlist: gigDraft.setlist })); setGigSaved(true); setTimeout(() => setGigSaved(false), 2000); }} style={{ padding: "10px 20px", borderRadius: 100, background: gigSaved ? "#16A34A" : `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, transition: "background 0.2s" }}>
              {gigSaved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>

          {[
            ["genres", "Genres / Styles (comma-separated)", "input", "Bollywood, Corporate Hosting, Comedy Roast..."],
            ["showreel", "Showreel URL", "input", "https://youtube.com/watch?v=..."],
            ["instagram", "Instagram Handle", "input", "@yourhandle"],
            ["youtube", "YouTube Channel", "input", "youtube.com/@yourchannel"],
          ].map(([key, label, type, ph]) => (
            <div key={key} style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)", marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>{label}</label>
              <input value={gigDraft[key] || ""} onChange={e => setGigDraft(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.15)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box" }} />
            </div>
          ))}

          <div style={{ background: "#fff", borderRadius: 16, padding: "18px 20px", border: "1px solid rgba(196,122,46,0.1)" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 8 }}>Sample Set / Rundown (one segment per line)</label>
            <textarea value={gigDraft.setlist || ""} onChange={e => setGigDraft(p => ({ ...p, setlist: e.target.value }))} rows={7} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.15)", fontSize: 13.5, fontFamily: font, color: ink, background: cream, resize: "vertical", boxSizing: "border-box" }} />
          </div>
        </div>
      );
    }

    // ── CALENDAR ──────────────────────────────────────────────────────────────
    if (tab === "calendar") {
      const year = 2026, month = 9;
      const firstDay = new Date(year, month - 1, 1).getDay();
      const daysInMonth = new Date(year, month, 0).getDate();
      const cells = Array.from({ length: firstDay }, () => null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
      while (cells.length % 7 !== 0) cells.push(null);

      return (
        <div>
          <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink, marginBottom: 6 }}>Availability</h2>
          <p style={{ fontSize: 13, color: muted, marginBottom: 22 }}>September 2026 — booked dates shown in gold.</p>

          <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, color: muted, padding: "6px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const isBooked = BOOKED_DATES.has(dateStr);
                const isToday = dateStr === new Date().toISOString().slice(0, 10);
                return (
                  <div key={i} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: isBooked ? `linear-gradient(135deg,${gold},${goldLt})` : isToday ? cream : "transparent", color: isBooked ? "#fff" : ink, fontSize: 13, fontWeight: isBooked || isToday ? 700 : 400, border: isToday && !isBooked ? `1.5px solid ${gold}` : "none", cursor: "pointer" }}>
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: muted }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: `linear-gradient(135deg,${gold},${goldLt})` }} /> Booked
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: muted }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: cream, border: `1.5px solid ${gold}` }} /> Today
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: muted }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: "#F3F4F6" }} /> Available
            </div>
          </div>
        </div>
      );
    }

    // ── MARKET / GROW ─────────────────────────────────────────────────────────
    if (tab === "market") {
      return (
        <div>
          <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink, marginBottom: 22 }}>Grow</h2>

          {/* Flyer builder */}
          <div style={{ background: ink, borderRadius: 20, padding: "24px 26px", marginBottom: 18, display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(204,171,74,0.12)", border: "1px solid rgba(204,171,74,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={goldLt} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: serif, fontSize: "1.15rem", fontWeight: 500, color: "#FFF8EC", marginBottom: 4 }}>Flyer Builder</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,248,236,0.45)", marginBottom: 12 }}>Create branded promo flyers for Instagram, WhatsApp, and print in seconds.</div>
              <button style={{ padding: "9px 20px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Open Builder →</button>
            </div>
          </div>

          {/* Link Hub */}
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px 26px", border: "1px solid rgba(196,122,46,0.1)", marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Your Link Hub</div>
            <div style={{ background: cream, borderRadius: 12, padding: "12px 16px", fontSize: 13, color: gold, fontFamily: "monospace", marginBottom: 12, wordBreak: "break-all" }}>
              tendr.in/@rahulkhanna
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Book Me", url: "tendr.in/book/rahulkhanna" },
                { label: "View Portfolio", url: "tendr.in/vendor/demo" },
                { label: "Instagram", url: "instagram.com/rahulkhanna.mc" },
                { label: "YouTube", url: "youtube.com/@rahulkhannaMC" },
              ].map((link, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: cream, borderRadius: 10, border: "1px solid rgba(196,122,46,0.1)" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: ink }}>{link.label}</span>
                  <span style={{ fontSize: 11.5, color: muted, fontFamily: "monospace" }}>{link.url}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics preview */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Profile Views (last 30 days)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[{ label: "Profile Views", value: "1,247" }, { label: "Link Clicks", value: "389" }, { label: "Booking Leads", value: "23" }].map((s, i) => (
                <div key={i} style={{ textAlign: "center", padding: "14px", background: cream, borderRadius: 12 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: ink, fontFamily: font }}>{s.value}</div>
                  <div style={{ fontSize: 10.5, color: muted, fontWeight: 600, marginTop: 3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return null;
  })();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: cream, fontFamily: font }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;700&family=Outfit:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus, textarea:focus { outline: 2px solid ${gold}; outline-offset: 1px; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(196,122,46,0.25); border-radius: 100px; }
      `}</style>

      <Sidebar />

      <div style={{ flex: 1, overflowY: "auto", padding: "32px 28px" }}>
        {/* Demo notice */}
        <div style={{ background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.2)", borderRadius: 12, padding: "10px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: gold, fontWeight: 600 }}>
          <span>🎭</span>
          <span>Demo mode — explore freely. <strong>Changes you make are saved</strong> and survive refresh. Use "↺ Reset demo data" in the sidebar to start fresh.</span>
          <button onClick={() => nav("/vendor/demo?type=Anchor")} style={{ marginLeft: "auto", background: "none", border: "none", color: gold, fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline", fontFamily: font, whiteSpace: "nowrap" }}>View Public Profile →</button>
        </div>

        {content}
      </div>

      {/* Dispute modal */}
      {dispModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(28,10,4,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px", width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(28,10,4,0.25)" }}>
            <h3 style={{ fontFamily: serif, fontSize: "1.3rem", fontWeight: 500, color: ink, marginBottom: 8 }}>Dispute / Cancel</h3>
            <p style={{ fontSize: 13, color: muted, marginBottom: 20 }}>{dispModal.client} · {dispModal.event}</p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Reason</label>
              <select style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream }}>
                {["Payment issue", "Client unresponsive", "Event cancelled", "Scope changed without agreement", "Other"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Details</label>
              <textarea rows={3} placeholder="Describe the issue..." style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font, color: ink, background: cream, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { window.open(`https://wa.me/919999999999?text=Dispute%20for%20booking%20${dispModal.id}%20-%20${dispModal.client}`); setDispModal(null); }} style={{ flex: 1, padding: "12px", borderRadius: 100, background: "#25D366", color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>📲 Send to Support</button>
              <button onClick={() => setDispModal(null)} style={{ padding: "12px 20px", borderRadius: 100, background: cream, border: "none", color: muted, fontSize: 13, cursor: "pointer", fontFamily: font }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
