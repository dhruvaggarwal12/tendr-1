import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// ── Design tokens ──────────────────────────────────────────────────────────────
const gold   = "#C47A2E";
const goldLt = "#CCAB4A";
const ink    = "#1C0A04";
const cream  = "#FAF7F2";
const muted  = "#9B7450";
const font   = "'Outfit', sans-serif";
const serif  = "'Cormorant Garamond', Georgia, serif";

const BASE = import.meta.env.VITE_BASE_URL;
const authH = (t) => ({ "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) });
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

// ── Category-specific options ──────────────────────────────────────────────────
const OPTIONS = {
  DJ: {
    setup:      ["Basic Setup", "Full Production"],
    eventTypes: ["House Party", "Corporate", "Venue"],
  },
  Caterer: {
    cuisine:      ["North Indian", "South Indian", "Snacks", "Chinese Starters", "Punjabi", "Desserts", "Italian", "Other"],
    serviceStyle: ["Buffet", "Food Stations", "Live Counters", "Family Style"],
    menuType:     ["Veg", "Non Veg", "Jain"],
  },
  Decorator: {
    typesOfDecoration: ["Floral", "Balloon", "Lighting", "Fabric Draping", "Backdrop", "Prop-Based", "Minimalist"],
    venueCoverage:     ["Interior", "Exterior", "Full", "Backdrop Stage Setup", "Extreme Focus"],
    themes:            ["Floral Focused", "Balloon Dominant", "Lighting Emphasis", "Fabric Draping", "Mixed Media", "Prop Centered", "Minimalist Touch"],
  },
  Photographer: {
    services:       ["Photographer", "Videographer", "Both"],
    photographyType:["Candid", "Drone", "Traditional", "Cinematic"],
    hoursIncluded:  ["2", "4", "8", "Full day"],
    editingTimeDays:["2", "5", "7", "10+"],
  },
};

const TYPE_TAB = {
  DJ:           { key: "setup",    label: "DJ Setup",  icon: "M9 18V5l12-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
  Caterer:      { key: "menu",     label: "Menu",      icon: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" },
  Decorator:    { key: "decor",    label: "Decor",     icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
  Photographer: { key: "services", label: "Services",  icon: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function Icon({ d, size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function Stars({ r = 0, size = 13 }) {
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

function Badge({ count, color = "#DC2626" }) {
  if (!count) return null;
  return <span style={{ background: color, color: "#fff", borderRadius: 100, padding: "1px 6px", fontSize: 10, fontWeight: 800, marginLeft: 6 }}>{count}</span>;
}

function StatusPill({ status }) {
  const map = { CONFIRMED: ["#DCFCE7","#16A34A"], PENDING: ["#FEF9C3","#CA8A04"], CANCELLED: ["#FEE2E2","#DC2626"], COMPLETED: ["#EFF6FF","#2563EB"] };
  const [bg, txt] = map[status] || ["#F3F4F6","#6B7280"];
  return <span style={{ background: bg, color: txt, borderRadius: 100, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{status}</span>;
}

function Chips({ options, selected = [], onChange, disabled }) {
  const toggle = (opt) => onChange(selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt]);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(opt => (
        <button key={opt} onClick={() => !disabled && toggle(opt)} style={{
          padding: "6px 14px", borderRadius: 100, fontSize: 12.5, fontWeight: 600, cursor: disabled ? "default" : "pointer",
          border: selected.includes(opt) ? `1.5px solid ${gold}` : "1px solid rgba(196,122,46,0.2)",
          background: selected.includes(opt) ? "rgba(196,122,46,0.1)" : "#fff",
          color: selected.includes(opt) ? gold : muted, fontFamily: font,
        }}>{opt}</button>
      ))}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "1px solid rgba(196,122,46,0.1)", boxShadow: "0 2px 10px rgba(28,10,4,0.04)", ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>{children}</div>;
}

// ══ MAIN COMPONENT ════════════════════════════════════════════════════════════
export default function VendorDashboardNew() {
  const navigate = useNavigate();
  const { user, token } = useSelector(s => s.auth);
  const serviceType = user?.serviceType || "";
  const vendorId    = user?._id || user?.id;
  const vendorName  = user?.name || "Vendor";

  // GigPro types have their own dashboard
  useEffect(() => {
    if (["Anchor", "Band", "Choreographer"].includes(serviceType)) {
      navigate("/vendor/demo-dashboard", { replace: true });
    }
  }, [serviceType]); // eslint-disable-line

  const [tab, setTab] = useState("home");

  // Data
  const [bookings,  setBookings]  = useState([]);
  const [outside,   setOutside]   = useState([]);
  const [reviews,   setReviews]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [toast,     setToast]     = useState(null);

  // Profile edit
  const [profEdit,  setProfEdit]  = useState(false);
  const [profDraft, setProfDraft] = useState({});
  const [profSaving,setProfSaving]= useState(false);

  // Type-specific edit
  const [specEdit,  setSpecEdit]  = useState(false);
  const [specDraft, setSpecDraft] = useState({});
  const [specSaving,setSpecSaving]= useState(false);

  // Packages (localStorage)
  const PKG_KEY = `tendr:pkgs:${vendorId || "v"}`;
  const [packages, setPackages]   = useState(() => { try { return JSON.parse(localStorage.getItem(PKG_KEY) || "[]"); } catch { return []; } });
  const [pkgModal, setPkgModal]   = useState(null);
  const [pkgDraft, setPkgDraft]   = useState({ name: "", price: "", unit: "per event", items: "" });
  const savePkgs = (upd) => { setPackages(upd); try { localStorage.setItem(PKG_KEY, JSON.stringify(upd)); } catch {} };

  // Calendar
  const [calMonth, setCalMonth]   = useState(() => new Date().getMonth());
  const [calYear,  setCalYear]    = useState(() => new Date().getFullYear());

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3200); };

  // ── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${BASE}/vendor/bookings`, { credentials: "include", headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.ok ? r.json() : { data: [] })
      .then(d => setBookings(Array.isArray(d) ? d : d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE}/vendors/outside-orders`, { headers: authH(token) })
      .then(r => r.ok ? r.json() : { orders: [] })
      .then(d => setOutside(d.orders || []))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (tab !== "reviews" || !token || !vendorId || reviews.length > 0) return;
    fetch(`${BASE}/vendors/${vendorId}/reviews`, { headers: authH(token) })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setReviews(d.reviews || d || []); })
      .catch(() => {});
  }, [tab, token, vendorId]); // eslint-disable-line

  // Seed edit drafts from user
  useEffect(() => {
    if (!user) return;
    setProfDraft({
      name: user.name || "",
      phoneNumber: user.phoneNumber || "",
      address: user.address || { street: "", city: "", state: "" },
      yearsOfExperience: user.yearsOfExperience || "",
      teamSize: user.teamSize || "",
      gstNumber: user.gstNumber || "",
    });
    setSpecDraft({
      setup:             user.setup              || [],
      lightsIncluded:    user.lightsIncluded      || false,
      eventTypes:        user.eventTypes          || [],
      cuisine:           user.cuisine             || [],
      serviceStyle:      user.serviceStyle        || [],
      menuType:          user.menuType            || [],
      typesOfDecoration: user.typesOfDecoration   || [],
      venueCoverage:     user.venueCoverage       || [],
      themes:            user.themes              || [],
      services:          user.services            || [],
      photographyType:   user.photographyType     || [],
      hoursIncluded:     user.hoursIncluded       || "8",
      editingTimeDays:   user.editingTimeDays     || "5",
      photographersCount:user.photographersCount   || 1,
      videographersCount:user.videographersCount   || 0,
      socialMedia:       user.socialMedia         || false,
      album:             user.album               || true,
    });
  }, [user]);

  // ── Save handlers ──────────────────────────────────────────────────────────
  const saveProfile = async () => {
    setProfSaving(true);
    try {
      const r = await fetch(`${BASE}/vendors/${vendorId}`, {
        method: "PATCH", headers: authH(token), credentials: "include",
        body: JSON.stringify(profDraft),
      });
      if (r.ok) { setProfEdit(false); showToast("Profile saved!"); }
      else { const d = await r.json(); showToast(d.error || "Failed", false); }
    } catch { showToast("Network error", false); }
    setProfSaving(false);
  };

  const saveSpec = async () => {
    setSpecSaving(true);
    try {
      const r = await fetch(`${BASE}/vendors/${vendorId}`, {
        method: "PATCH", headers: authH(token), credentials: "include",
        body: JSON.stringify(specDraft),
      });
      if (r.ok) { setSpecEdit(false); showToast("Saved!"); }
      else { const d = await r.json(); showToast(d.error || "Failed", false); }
    } catch { showToast("Network error", false); }
    setSpecSaving(false);
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const pending    = bookings.filter(b => b.status === "PENDING").length;
  const confirmed  = bookings.filter(b => b.status === "CONFIRMED");
  const outsideRev = outside.reduce((s, o) => s + (o.paidAmount || 0), 0);
  const rating     = user?.avgReviewScore || 0;
  const upcoming   = confirmed.filter(b => b.eventDate >= today).sort((a,b) => a.eventDate?.localeCompare(b.eventDate)).slice(0, 3);

  // Booked dates for calendar (from Tendr bookings + outside orders)
  const bookedDates = new Set([
    ...bookings.filter(b => b.status === "CONFIRMED" && b.eventDate).map(b => b.eventDate?.slice(0,10)),
    ...outside.filter(o => o.status === "Upcoming" && o.eventDate).map(o => o.eventDate?.slice(0,10)),
  ]);

  // ── Nav ────────────────────────────────────────────────────────────────────
  const typeTab = TYPE_TAB[serviceType];
  const NAV = [
    { key: "home",     label: "Home",         group: "OVERVIEW",  icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" },
    { key: "work",     label: "Work",         group: "EVENTS",    icon: "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" },
    { key: "money",    label: "Money",        group: "EVENTS",    icon: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
    ...(typeTab ? [{ key: typeTab.key, label: typeTab.label, group: "MANAGE", icon: typeTab.icon }] : []),
    { key: "packages", label: "Packages",     group: "MANAGE",    icon: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" },
    { key: "reviews",  label: "Reviews",      group: "MANAGE",    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
    { key: "profile",  label: "Profile",      group: "MANAGE",    icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" },
    { key: "calendar", label: "Availability", group: "SCHEDULE",  icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" },
    { key: "grow",     label: "Grow",         group: "GROW",      icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
  ];

  // ── Sidebar ────────────────────────────────────────────────────────────────
  function Sidebar() {
    let prevGroup = null;
    return (
      <div style={{ width: 200, background: ink, display: "flex", flexDirection: "column", minHeight: "100vh", flexShrink: 0 }}>
        <div style={{ padding: "22px 20px 16px", borderBottom: "1px solid rgba(204,171,74,0.12)" }}>
          <div style={{ fontFamily: serif, fontSize: "1.45rem", color: goldLt, fontWeight: 400, letterSpacing: "0.02em" }}>tendr</div>
          <div style={{ fontSize: 10.5, color: "rgba(255,248,236,0.35)", marginTop: 2, fontWeight: 600, letterSpacing: "0.12em" }}>VENDOR DASHBOARD</div>
        </div>
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
                <button onClick={() => setTab(item.key)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 20px",
                  background: tab === item.key ? "rgba(204,171,74,0.12)" : "none",
                  border: "none", cursor: "pointer",
                  color: tab === item.key ? goldLt : "rgba(255,248,236,0.55)",
                  fontSize: 13, fontWeight: tab === item.key ? 700 : 500, fontFamily: font, textAlign: "left",
                  borderLeft: tab === item.key ? `3px solid ${goldLt}` : "3px solid transparent",
                  transition: "all 0.15s",
                }}>
                  <Icon d={item.icon} size={16} color="currentColor" />
                  {item.label}
                  {item.key === "work" && <Badge count={pending} />}
                </button>
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(204,171,74,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${gold},${goldLt})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontFamily: serif, color: "#fff" }}>
              {vendorName[0]}
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "rgba(255,248,236,0.85)", fontFamily: font }}>{vendorName}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,248,236,0.35)" }}>{serviceType}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Tab content ────────────────────────────────────────────────────────────
  const content = (() => {

    // ── HOME ────────────────────────────────────────────────────────────────
    if (tab === "home") {
      return (
        <div>
          <h2 style={{ fontFamily: serif, fontSize: "1.8rem", fontWeight: 400, color: ink, marginBottom: 4 }}>
            Good morning, {vendorName.split(" ")[0]} 👋
          </h2>
          <p style={{ color: muted, fontSize: 13.5, marginBottom: 24 }}>Here's your event overview</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
            {[
              { label: "Confirmed",   value: confirmed.length, sub: "Tendr bookings" },
              { label: "Pending",     value: pending,          sub: "awaiting reply" },
              { label: "Earned",      value: fmt(outsideRev),  sub: "collected" },
              { label: "Rating",      value: rating ? `${rating.toFixed(1)} ★` : "—", sub: "avg score" },
            ].map((s, i) => (
              <Card key={i}>
                <div style={{ fontSize: 22, fontWeight: 800, color: ink, fontFamily: font }}>{s.value}</div>
                <div style={{ fontSize: 11, color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "rgba(155,116,80,0.6)", marginTop: 1 }}>{s.sub}</div>
              </Card>
            ))}
          </div>

          {upcoming.length > 0 && (
            <Card style={{ marginBottom: 18 }}>
              <SectionLabel>Upcoming Confirmed</SectionLabel>
              {upcoming.map((b, i) => (
                <div key={b._id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: i > 0 ? "1px solid rgba(196,122,46,0.08)" : "none" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{b.consumerName || b.consumer?.name || "Client"}</div>
                    <div style={{ fontSize: 12, color: muted }}>{b.eventType} · {b.eventDate?.slice(0,10)}</div>
                  </div>
                  <StatusPill status={b.status} />
                </div>
              ))}
            </Card>
          )}

          <Card>
            <SectionLabel>Quick Links</SectionLabel>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: "View My Profile", action: () => navigate(`/vendor/${vendorId}`) },
                { label: "Work",  action: () => setTab("work") },
                { label: "Packages", action: () => setTab("packages") },
              ].map((l, i) => (
                <button key={i} onClick={l.action} style={{ padding: "8px 18px", borderRadius: 100, background: cream, border: `1px solid rgba(196,122,46,0.2)`, color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                  {l.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      );
    }

    // ── WORK ────────────────────────────────────────────────────────────────
    if (tab === "work") {
      const [workView, setWorkView] = []; // local state won't work in closure — see below
      return <WorkTab bookings={bookings} outside={outside} loading={loading} />;
    }

    // ── MONEY ────────────────────────────────────────────────────────────────
    if (tab === "money") {
      const total   = outside.reduce((s, o) => s + (o.amount     || 0), 0);
      const coll    = outside.reduce((s, o) => s + (o.paidAmount || 0), 0);
      const expenses= outside.reduce((s, o) => s + (o.expenses||[]).reduce((ss,e)=>ss+Number(e.amount||0),0), 0);
      const profit  = coll - expenses;
      return (
        <div>
          <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink, marginBottom: 24 }}>Money</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 22 }}>
            {[
              { label: "Total Billed",   value: fmt(total) },
              { label: "Collected",      value: fmt(coll) },
              { label: "Expenses",       value: fmt(expenses) },
              { label: "Net Profit",     value: fmt(profit) },
            ].map((s,i) => (
              <Card key={i}>
                <div style={{ fontSize: 22, fontWeight: 800, color: ink }}>{s.value}</div>
                <div style={{ fontSize: 11, color: muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 3 }}>{s.label}</div>
              </Card>
            ))}
          </div>

          <Card>
            <SectionLabel>Outside Orders</SectionLabel>
            {outside.length === 0 ? (
              <p style={{ color: muted, fontSize: 13.5 }}>No outside orders yet.</p>
            ) : outside.slice(0,10).map((o, i) => (
              <div key={o._id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: i > 0 ? "1px solid rgba(196,122,46,0.08)" : "none" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{o.clientName}</div>
                  <div style={{ fontSize: 12, color: muted }}>{o.eventType} · {o.eventDate?.slice(0,10)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: ink }}>{fmt(o.paidAmount || 0)}</div>
                  <div style={{ fontSize: 11, color: muted }}>of {fmt(o.amount || 0)}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      );
    }

    // ── TYPE-SPECIFIC: DJ SETUP ──────────────────────────────────────────────
    if (tab === "setup") {
      const opts = OPTIONS.DJ;
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink }}>DJ Setup</h2>
            {!specEdit
              ? <button onClick={() => setSpecEdit(true)} style={editBtn}>Edit</button>
              : <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveSpec} disabled={specSaving} style={saveBtn}>{specSaving ? "Saving…" : "Save"}</button>
                  <button onClick={() => setSpecEdit(false)} style={cancelBtn}>Cancel</button>
                </div>
            }
          </div>

          <Card style={{ marginBottom: 16 }}>
            <SectionLabel>Setup Type</SectionLabel>
            <Chips options={opts.setup} selected={specDraft.setup} onChange={v => setSpecDraft(p => ({ ...p, setup: v }))} disabled={!specEdit} />
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <SectionLabel>Event Types</SectionLabel>
            <Chips options={opts.eventTypes} selected={specDraft.eventTypes} onChange={v => setSpecDraft(p => ({ ...p, eventTypes: v }))} disabled={!specEdit} />
          </Card>

          <Card>
            <SectionLabel>Lights Included</SectionLabel>
            <button onClick={() => specEdit && setSpecDraft(p => ({ ...p, lightsIncluded: !p.lightsIncluded }))} style={{
              padding: "8px 20px", borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: specEdit ? "pointer" : "default", fontFamily: font,
              background: specDraft.lightsIncluded ? "rgba(196,122,46,0.1)" : cream,
              border: specDraft.lightsIncluded ? `1.5px solid ${gold}` : "1px solid rgba(196,122,46,0.2)",
              color: specDraft.lightsIncluded ? gold : muted,
            }}>
              {specDraft.lightsIncluded ? "Yes — Lights included" : "No lights"}
            </button>
          </Card>
        </div>
      );
    }

    // ── TYPE-SPECIFIC: CATERER MENU ──────────────────────────────────────────
    if (tab === "menu") {
      const opts = OPTIONS.Caterer;
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink }}>Menu & Cuisine</h2>
            {!specEdit
              ? <button onClick={() => setSpecEdit(true)} style={editBtn}>Edit</button>
              : <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveSpec} disabled={specSaving} style={saveBtn}>{specSaving ? "Saving…" : "Save"}</button>
                  <button onClick={() => setSpecEdit(false)} style={cancelBtn}>Cancel</button>
                </div>
            }
          </div>
          {[
            ["Cuisine Types",    "cuisine",      opts.cuisine],
            ["Service Style",    "serviceStyle", opts.serviceStyle],
            ["Menu Type",        "menuType",     opts.menuType],
          ].map(([label, key, options]) => (
            <Card key={key} style={{ marginBottom: 16 }}>
              <SectionLabel>{label}</SectionLabel>
              <Chips options={options} selected={specDraft[key]} onChange={v => setSpecDraft(p => ({ ...p, [key]: v }))} disabled={!specEdit} />
            </Card>
          ))}
        </div>
      );
    }

    // ── TYPE-SPECIFIC: DECORATOR ─────────────────────────────────────────────
    if (tab === "decor") {
      const opts = OPTIONS.Decorator;
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink }}>Decor Specialties</h2>
            {!specEdit
              ? <button onClick={() => setSpecEdit(true)} style={editBtn}>Edit</button>
              : <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveSpec} disabled={specSaving} style={saveBtn}>{specSaving ? "Saving…" : "Save"}</button>
                  <button onClick={() => setSpecEdit(false)} style={cancelBtn}>Cancel</button>
                </div>
            }
          </div>
          {[
            ["Types of Decoration", "typesOfDecoration", opts.typesOfDecoration],
            ["Venue Coverage",      "venueCoverage",     opts.venueCoverage],
            ["Themes",             "themes",             opts.themes],
          ].map(([label, key, options]) => (
            <Card key={key} style={{ marginBottom: 16 }}>
              <SectionLabel>{label}</SectionLabel>
              <Chips options={options} selected={specDraft[key]} onChange={v => setSpecDraft(p => ({ ...p, [key]: v }))} disabled={!specEdit} />
            </Card>
          ))}
        </div>
      );
    }

    // ── TYPE-SPECIFIC: PHOTOGRAPHER SERVICES ─────────────────────────────────
    if (tab === "services") {
      const opts = OPTIONS.Photographer;
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink }}>Photography Services</h2>
            {!specEdit
              ? <button onClick={() => setSpecEdit(true)} style={editBtn}>Edit</button>
              : <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveSpec} disabled={specSaving} style={saveBtn}>{specSaving ? "Saving…" : "Save"}</button>
                  <button onClick={() => setSpecEdit(false)} style={cancelBtn}>Cancel</button>
                </div>
            }
          </div>
          {[
            ["Services Offered",   "services",        opts.services],
            ["Photography Style",  "photographyType", opts.photographyType],
          ].map(([label, key, options]) => (
            <Card key={key} style={{ marginBottom: 16 }}>
              <SectionLabel>{label}</SectionLabel>
              <Chips options={options} selected={specDraft[key]} onChange={v => setSpecDraft(p => ({ ...p, [key]: v }))} disabled={!specEdit} />
            </Card>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card>
              <SectionLabel>Hours Included</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {opts.hoursIncluded.map(h => (
                  <button key={h} onClick={() => specEdit && setSpecDraft(p => ({ ...p, hoursIncluded: h }))} style={{
                    padding: "6px 14px", borderRadius: 100, fontSize: 12.5, fontWeight: 600,
                    cursor: specEdit ? "pointer" : "default", fontFamily: font,
                    border: specDraft.hoursIncluded === h ? `1.5px solid ${gold}` : "1px solid rgba(196,122,46,0.2)",
                    background: specDraft.hoursIncluded === h ? "rgba(196,122,46,0.1)" : "#fff",
                    color: specDraft.hoursIncluded === h ? gold : muted,
                  }}>{h} hrs</button>
                ))}
              </div>
            </Card>
            <Card>
              <SectionLabel>Editing Time (days)</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {opts.editingTimeDays.map(d => (
                  <button key={d} onClick={() => specEdit && setSpecDraft(p => ({ ...p, editingTimeDays: d }))} style={{
                    padding: "6px 14px", borderRadius: 100, fontSize: 12.5, fontWeight: 600,
                    cursor: specEdit ? "pointer" : "default", fontFamily: font,
                    border: specDraft.editingTimeDays === d ? `1.5px solid ${gold}` : "1px solid rgba(196,122,46,0.2)",
                    background: specDraft.editingTimeDays === d ? "rgba(196,122,46,0.1)" : "#fff",
                    color: specDraft.editingTimeDays === d ? gold : muted,
                  }}>{d} days</button>
                ))}
              </div>
            </Card>
          </div>
          <Card style={{ marginTop: 14 }}>
            <SectionLabel>Add-ons</SectionLabel>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[["socialMedia", "Social Media Reels"], ["album", "Photo Album"]].map(([key, label]) => (
                <button key={key} onClick={() => specEdit && setSpecDraft(p => ({ ...p, [key]: !p[key] }))} style={{
                  padding: "8px 18px", borderRadius: 100, fontSize: 13, fontWeight: 600,
                  cursor: specEdit ? "pointer" : "default", fontFamily: font,
                  background: specDraft[key] ? "rgba(196,122,46,0.1)" : cream,
                  border: specDraft[key] ? `1.5px solid ${gold}` : "1px solid rgba(196,122,46,0.2)",
                  color: specDraft[key] ? gold : muted,
                }}>{label}</button>
              ))}
            </div>
          </Card>
        </div>
      );
    }

    // ── PACKAGES ─────────────────────────────────────────────────────────────
    if (tab === "packages") {
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink }}>Packages</h2>
            <button onClick={() => { setPkgDraft({ name: "", price: "", unit: "per event", items: "" }); setPkgModal("new"); }} style={saveBtn}>+ Add Package</button>
          </div>

          {packages.length === 0 && (
            <Card><p style={{ color: muted, fontSize: 13.5 }}>No packages yet. Add your first one.</p></Card>
          )}

          {packages.map((pkg, i) => (
            <Card key={pkg.id || i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: ink }}>{pkg.name}</div>
                  <div style={{ fontSize: 14, color: gold, fontWeight: 700 }}>{fmt(pkg.price)} <span style={{ fontSize: 12, color: muted, fontWeight: 400 }}>/ {pkg.unit}</span></div>
                </div>
                {pkg.badge && <span style={{ background: gold, color: "#fff", borderRadius: 100, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{pkg.badge}</span>}
              </div>
              <ul style={{ margin: "0 0 14px 18px", padding: 0 }}>
                {(pkg.items || "").split("\n").filter(Boolean).map((item, j) => <li key={j} style={{ fontSize: 13, color: "#4A3020", marginBottom: 3 }}>{item}</li>)}
              </ul>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setPkgDraft({ ...pkg }); setPkgModal(pkg); }} style={editBtn}>Edit</button>
                <button onClick={() => savePkgs(packages.filter(x => x.id !== pkg.id))} style={{ padding: "7px 16px", borderRadius: 100, background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Delete</button>
              </div>
            </Card>
          ))}

          {pkgModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(28,10,4,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <div style={{ background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(28,10,4,0.25)" }}>
                <h3 style={{ fontFamily: serif, fontSize: "1.3rem", fontWeight: 500, color: ink, marginBottom: 20 }}>{pkgModal === "new" ? "New Package" : "Edit Package"}</h3>
                {[["name","Package Name","text"],["price","Price (₹)","number"],["unit","Unit","text"],["badge","Badge (optional)","text"]].map(([k,l,t]) => (
                  <div key={k} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>{l}</label>
                    <input type={t} value={pkgDraft[k] || ""} onChange={e => setPkgDraft(p => ({ ...p, [k]: e.target.value }))} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box" }} />
                  </div>
                ))}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Inclusions (one per line)</label>
                  <textarea value={pkgDraft.items || ""} onChange={e => setPkgDraft(p => ({ ...p, items: e.target.value }))} rows={4} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 13, fontFamily: font, color: ink, background: cream, resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => {
                    const entry = { ...pkgDraft, id: pkgModal === "new" ? Date.now() : pkgModal.id, price: Number(pkgDraft.price) };
                    savePkgs(pkgModal === "new" ? [...packages, entry] : packages.map(x => x.id === pkgModal.id ? entry : x));
                    setPkgModal(null);
                  }} style={{ ...saveBtn, flex: 1, padding: 12 }}>Save Package</button>
                  <button onClick={() => setPkgModal(null)} style={{ ...cancelBtn, padding: "12px 20px" }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // ── REVIEWS ──────────────────────────────────────────────────────────────
    if (tab === "reviews") {
      return (
        <div>
          <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink, marginBottom: 22 }}>Reviews</h2>
          {reviews.length === 0 ? (
            <Card><p style={{ color: muted, fontSize: 13.5 }}>No reviews yet.</p></Card>
          ) : reviews.map((r, i) => (
            <Card key={r._id || i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: ink }}>{r.consumerName || r.name || "Customer"}</div>
                  <div style={{ fontSize: 12, color: muted }}>{r.eventType || r.event}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Stars r={r.averageRating || r.rating || 0} />
                  <span style={{ fontSize: 13, color: ink, fontWeight: 700 }}>{(r.averageRating || r.rating || 0).toFixed(1)}</span>
                </div>
              </div>
              <p style={{ fontSize: 13.5, color: "#4A3020", lineHeight: 1.65, margin: 0 }}>{r.reviewText || r.text}</p>
            </Card>
          ))}
        </div>
      );
    }

    // ── PROFILE ──────────────────────────────────────────────────────────────
    if (tab === "profile") {
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink }}>Profile</h2>
            {!profEdit
              ? <button onClick={() => setProfEdit(true)} style={editBtn}>Edit Profile</button>
              : <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={saveProfile} disabled={profSaving} style={saveBtn}>{profSaving ? "Saving…" : "Save"}</button>
                  <button onClick={() => setProfEdit(false)} style={cancelBtn}>Cancel</button>
                </div>
            }
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg,${gold},${goldLt})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontFamily: serif, color: "#fff" }}>
              {vendorName[0]}
            </div>
            <div>
              <div style={{ fontSize: 18, fontFamily: serif, fontWeight: 500, color: ink }}>{vendorName}</div>
              <div style={{ fontSize: 13, color: muted }}>{serviceType} · {user?.address?.city}</div>
              <Stars r={rating} />
            </div>
          </div>

          <Card style={{ marginBottom: 16 }}>
            <SectionLabel>Basic Info</SectionLabel>
            {[["name","Name"],["phoneNumber","Phone"]].map(([k,l]) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 }}>{l}</label>
                {profEdit
                  ? <input value={profDraft[k] || ""} onChange={e => setProfDraft(p => ({ ...p, [k]: e.target.value }))} style={{ width: "100%", padding: "9px 13px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box" }} />
                  : <div style={{ fontSize: 14, color: ink, padding: "9px 0" }}>{user?.[k] || "—"}</div>
                }
              </div>
            ))}
            {[["yearsOfExperience","Years of Experience"],["teamSize","Team Size"]].map(([k,l]) => (
              <div key={k} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 }}>{l}</label>
                {profEdit
                  ? <input type="number" value={profDraft[k] || ""} onChange={e => setProfDraft(p => ({ ...p, [k]: e.target.value }))} style={{ width: "100%", padding: "9px 13px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box" }} />
                  : <div style={{ fontSize: 14, color: ink, padding: "9px 0" }}>{user?.[k] ?? "—"}</div>
                }
              </div>
            ))}
          </Card>

          <Card>
            <SectionLabel>Business</SectionLabel>
            <div style={{ marginBottom: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 }}>GST Number</label>
              {profEdit
                ? <input value={profDraft.gstNumber || ""} onChange={e => setProfDraft(p => ({ ...p, gstNumber: e.target.value }))} style={{ width: "100%", padding: "9px 13px", borderRadius: 10, border: "1px solid rgba(196,122,46,0.2)", fontSize: 14, fontFamily: font, color: ink, background: cream, boxSizing: "border-box" }} />
                : <div style={{ fontSize: 14, color: ink, padding: "9px 0", fontFamily: "monospace" }}>{user?.gstNumber || <span style={{ color: muted, fontStyle: "italic" }}>Not set</span>}</div>
              }
            </div>
          </Card>
        </div>
      );
    }

    // ── CALENDAR ─────────────────────────────────────────────────────────────
    if (tab === "calendar") {
      const firstDay   = new Date(calYear, calMonth, 1).getDay();
      const daysInMonth= new Date(calYear, calMonth + 1, 0).getDate();
      const cells = Array.from({ length: firstDay }, () => null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
      while (cells.length % 7 !== 0) cells.push(null);
      const monthStr = new Date(calYear, calMonth, 1).toLocaleString("default", { month: "long", year: "numeric" });
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
            <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink }}>Availability</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { const d = new Date(calYear, calMonth - 1); setCalMonth(d.getMonth()); setCalYear(d.getFullYear()); }} style={editBtn}>‹</button>
              <span style={{ padding: "8px 14px", fontSize: 13.5, fontWeight: 600, color: ink, fontFamily: font }}>{monthStr}</span>
              <button onClick={() => { const d = new Date(calYear, calMonth + 1); setCalMonth(d.getMonth()); setCalYear(d.getFullYear()); }} style={editBtn}>›</button>
            </div>
          </div>
          <Card>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 8 }}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, color: muted, padding: "6px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const dateStr = `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const isBooked = bookedDates.has(dateStr);
                const isToday  = dateStr === today;
                return (
                  <div key={i} style={{ aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: isBooked ? `linear-gradient(135deg,${gold},${goldLt})` : isToday ? cream : "transparent", color: isBooked ? "#fff" : ink, fontSize: 13, fontWeight: isBooked || isToday ? 700 : 400, border: isToday && !isBooked ? `1.5px solid ${gold}` : "none" }}>
                    {day}
                  </div>
                );
              })}
            </div>
          </Card>
          <div style={{ marginTop: 16, display: "flex", gap: 16 }}>
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

    // ── GROW ─────────────────────────────────────────────────────────────────
    if (tab === "grow") {
      return (
        <div>
          <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink, marginBottom: 22 }}>Grow</h2>
          <Card style={{ marginBottom: 16 }}>
            <SectionLabel>Your Public Profile</SectionLabel>
            <p style={{ fontSize: 13.5, color: muted, marginBottom: 14 }}>Share your Tendr profile link with clients to get direct bookings.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => navigate(`/vendor/${vendorId}`)} style={saveBtn}>View Profile</button>
              <button onClick={() => { try { navigator.clipboard.writeText(`${window.location.origin}/vendor/${vendorId}`); } catch {} }} style={editBtn}>Copy Link</button>
            </div>
          </Card>
          <Card>
            <SectionLabel>Tips</SectionLabel>
            {["Add your packages to show clients what you offer.","Keep your availability calendar up to date.","Reply to enquiries within 2 hours — it boosts your rank.","Upload portfolio photos to stand out in search results."].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: cream, border: `1px solid rgba(196,122,46,0.2)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 700, color: gold, flexShrink: 0 }}>{i+1}</span>
                <span style={{ fontSize: 13.5, color: "#4A3020", lineHeight: 1.55 }}>{tip}</span>
              </div>
            ))}
          </Card>
        </div>
      );
    }

    return null;
  })();

  // ── Button styles ──────────────────────────────────────────────────────────
  const saveBtn   = { padding: "10px 20px", borderRadius: 100, background: `linear-gradient(135deg,${gold},${goldLt})`, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font };
  const editBtn   = { padding: "10px 20px", borderRadius: 100, background: cream, border: `1px solid rgba(196,122,46,0.2)`, color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font };
  const cancelBtn = { padding: "10px 16px", borderRadius: 100, background: cream, border: "none", color: muted, fontSize: 13, cursor: "pointer", fontFamily: font };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", minHeight: "100dvh", fontFamily: font, background: cream }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@400;500&display=swap');`}</style>
      <Sidebar />
      <div style={{ flex: 1, padding: "32px 36px", overflowY: "auto", maxWidth: 900 }}>
        {content}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, right: 28, background: toast.ok ? ink : "#BE123C", color: "#fff", borderRadius: 12, padding: "12px 20px", fontSize: 13.5, fontWeight: 600, fontFamily: font, boxShadow: "0 8px 30px rgba(0,0,0,0.2)", zIndex: 999 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── Work tab (extracted to avoid hooks-in-closure issue) ───────────────────────
function WorkTab({ bookings, outside, loading }) {
  const [view, setView] = useState("tendr");
  const tendrBkgs  = bookings;
  const pendingOut = outside.filter(o => o.status !== "Completed" && o.status !== "Cancelled");
  const doneOut    = outside.filter(o => o.status === "Completed");

  return (
    <div>
      <h2 style={{ fontFamily: serif, fontSize: "1.7rem", fontWeight: 400, color: ink, marginBottom: 18 }}>Work</h2>
      <div style={{ display: "flex", gap: 4, marginBottom: 22, background: "#fff", borderRadius: 100, padding: 4, width: "fit-content", border: `1px solid rgba(196,122,46,0.15)` }}>
        {[["tendr","Tendr Bookings"],["outside","Outside Orders"]].map(([k,l]) => (
          <button key={k} onClick={() => setView(k)} style={{ padding: "8px 20px", borderRadius: 100, fontSize: 13, fontWeight: view === k ? 700 : 500, background: view === k ? `linear-gradient(135deg,${gold},${goldLt})` : "transparent", color: view === k ? "#fff" : muted, border: "none", cursor: "pointer", fontFamily: font }}>
            {l}
          </button>
        ))}
      </div>

      {view === "tendr" && (
        loading
          ? <p style={{ color: muted, fontSize: 13.5 }}>Loading bookings…</p>
          : tendrBkgs.length === 0
            ? <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(196,122,46,0.1)", color: muted, fontSize: 13.5 }}>No Tendr bookings yet.</div>
            : tendrBkgs.map((b, i) => (
                <div key={b._id || i} style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 12, border: "1px solid rgba(196,122,46,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: ink }}>{b.consumerName || b.consumer?.name || "Client"}</div>
                      <div style={{ fontSize: 12.5, color: muted }}>{b.eventType} · {b.eventDate?.slice(0,10)} · {b.location || b.eventLocation || ""}</div>
                    </div>
                    <StatusPill status={b.status} />
                  </div>
                  {b.amount && <div style={{ fontSize: 13.5, fontWeight: 700, color: gold }}>₹{Number(b.amount).toLocaleString("en-IN")}</div>}
                  {b.message && <p style={{ fontSize: 13, color: "#4A3020", marginTop: 8, lineHeight: 1.55 }}>{b.message}</p>}
                </div>
              ))
      )}

      {view === "outside" && (
        outside.length === 0
          ? <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(196,122,46,0.1)", color: muted, fontSize: 13.5 }}>No outside orders yet.</div>
          : [...pendingOut, ...doneOut].map((o, i) => (
              <div key={o._id || i} style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 12, border: "1px solid rgba(196,122,46,0.1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: ink }}>{o.clientName}</div>
                    <div style={{ fontSize: 12.5, color: muted }}>{o.eventType} · {o.eventDate?.slice(0,10)}</div>
                  </div>
                  <span style={{ background: o.status === "Completed" ? "#EFF6FF" : "#FEF9C3", color: o.status === "Completed" ? "#2563EB" : "#CA8A04", borderRadius: 100, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{o.status}</span>
                </div>
                <div style={{ display: "flex", gap: 20 }}>
                  <div><span style={{ fontSize: 11, color: muted }}>Billed </span><span style={{ fontSize: 14, fontWeight: 700, color: ink }}>₹{Number(o.amount||0).toLocaleString("en-IN")}</span></div>
                  <div><span style={{ fontSize: 11, color: muted }}>Paid </span><span style={{ fontSize: 14, fontWeight: 700, color: "#16A34A" }}>₹{Number(o.paidAmount||0).toLocaleString("en-IN")}</span></div>
                </div>
              </div>
            ))
      )}
    </div>
  );
}
