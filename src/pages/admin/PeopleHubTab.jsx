import React, { useState, useEffect } from "react";

const F    = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const CARD = "#FFFCF5";

// Artist/performer service types — these applications go in the Performers
// tab. DJ is deliberately NOT here: it's classified as a Vendor application
// (alongside Caterer/Decorator/Photographer), per explicit instruction.
const ARTIST_SERVICE_TYPES = [
  "Anchor", "Emcee/Host", "Band", "Singer", "Musician",
  "Performer", "Stand-up Comedian", "Magician", "AV Setup",
];

// Performer types used for filtering the registered-vendor stats (same
// DJ-as-vendor classification applies here too, for consistency).
const PERFORMER_TYPES = [
  "Anchor", "Band", "Choreographer", "Vocalist",
  "Musician", "Comedian", "Magician", "Dancer",
];

const ART_FORM_EMOJI = {
  "Classical Dance":       "🪷",
  "Contemporary Dance":    "💃",
  "Folk & Cultural Dance": "🎊",
  "Aerial & Acrobatics":   "🎪",
  "Fire & Circus Arts":    "🔥",
  "Belly Dance / Sufi":    "✨",
  "Mime & Physical Theater": "🎭",
  "Other Art Form":        "🎨",
};

export default function PeopleHubTab({
  token, BASE_URL,
  vendorStats = [],
  chatRequests = [],
  vendorApplications = [],
}) {
  const [section, setSection]         = useState("applications"); // applications | active | chats
  const [subTab, setSubTab]           = useState("vendors");       // vendors | performers | coordinators
  const [coords, setCoords]           = useState([]);
  const [coordsLoaded, setCoordsLoaded] = useState(false);
  const [coordFilter, setCoordFilter] = useState("all");
  const [coordSearch, setCoordSearch] = useState("");
  const [perfFilter, setPerfFilter]   = useState("all");
  const [perfSearch, setPerfSearch]   = useState("");
  const [vendorActiveFilter, setVendorActiveFilter] = useState("all");
  const [vendorActiveSearch, setVendorActiveSearch] = useState("");
  // Vendor-applications tab (Caterer/Decorator/DJ/Photographer/etc.)
  const [appSearch, setAppSearch]     = useState("");
  const [appFilter, setAppFilter]     = useState("all"); // all | pending | form_sent | approved | rejected
  // Performer-applications section (within the Performers tab)
  const [perfAppSearch, setPerfAppSearch] = useState("");
  const [perfAppFilter, setPerfAppFilter] = useState("all");
  const [appStatusOverrides, setAppStatusOverrides] = useState({}); // { [id]: status }
  const [waPopup, setWaPopup]         = useState(null); // { msg, phone } after approve

  useEffect(() => {
    if (coordsLoaded) return;
    fetch(`${BASE_URL}/admin/coordinators`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.json())
      .then(d => { setCoords(Array.isArray(d) ? d : d.coordinators || []); setCoordsLoaded(true); })
      .catch(() => setCoordsLoaded(true));
  }, [BASE_URL, token, coordsLoaded]);

  const updateCoordStatus = (id, status) => {
    fetch(`${BASE_URL}/admin/coordinators/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({ status }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.coordinator) setCoords(prev => prev.map(c => c._id === id ? d.coordinator : c));
        else alert(d.error || "Failed");
      })
      .catch(() => alert("Network error"));
  };

  // --- Derived data ---
  const performers         = vendorStats.filter(v => PERFORMER_TYPES.includes(v.serviceType));
  const activeVendors      = vendorStats.filter(v => !PERFORMER_TYPES.includes(v.serviceType));
  const coordAssignedChats = chatRequests.filter(c => c.coordinatorId);
  const pendingOrRejectedCoords = coords.filter(c => c.status !== "approved");
  const approvedCoords          = coords.filter(c => c.status === "approved");

  // Artist/performer applications: VendorApplication entries flagged as isArtist
  const artistApplications = vendorApplications.filter(a =>
    a.isArtist === true || ARTIST_SERVICE_TYPES.includes(a.serviceType)
  );

  // Everything else (Caterer/Decorator/DJ/Photographer/Venue/etc.) — the
  // business/vendor applications. These used to have their own duplicate
  // section in the admin Vendors tab; that's been removed in favour of
  // showing them here only.
  const businessApplications = vendorApplications.filter(a =>
    !(a.isArtist === true || ARTIST_SERVICE_TYPES.includes(a.serviceType))
  );

  const pendingArtists  = artistApplications.filter(a => ["pending", "form_sent"].includes(a.status)).length;
  const pendingBusiness = businessApplications.filter(a => ["pending", "form_sent"].includes(a.status)).length;

  // Filtered lists
  // Coordinators: Applications tab = pending/rejected only; Active tab = approved only.
  const coordBaseList = section === "active" ? approvedCoords : pendingOrRejectedCoords;
  const filteredCoords = coordBaseList.filter(c => {
    const matchFilter = section === "active" || coordFilter === "all" || c.status === coordFilter;
    const matchSearch = !coordSearch ||
      c.name?.toLowerCase().includes(coordSearch.toLowerCase()) ||
      c.city?.toLowerCase().includes(coordSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filteredPerformers = performers.filter(v => {
    const matchFilter = perfFilter === "all" || v.serviceType === perfFilter;
    const matchSearch = !perfSearch ||
      v.name?.toLowerCase().includes(perfSearch.toLowerCase()) ||
      v.city?.toLowerCase().includes(perfSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const vendorTypesPresent = [...new Set(activeVendors.map(v => v.serviceType))].filter(Boolean);
  const filteredActiveVendors = activeVendors.filter(v => {
    const matchFilter = vendorActiveFilter === "all" || v.serviceType === vendorActiveFilter;
    const matchSearch = !vendorActiveSearch ||
      v.name?.toLowerCase().includes(vendorActiveSearch.toLowerCase()) ||
      v.city?.toLowerCase().includes(vendorActiveSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  // Vendor (business) applications — Caterer/Decorator/DJ/Photographer/etc.
  const filteredBusinessApps = businessApplications.filter(a => {
    const curStatus = appStatusOverrides[a._id] ?? a.status;
    const matchFilter = appFilter === "all" || curStatus === appFilter;
    const matchSearch = !appSearch ||
      a.name?.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.serviceType?.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.businessName?.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.city?.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.address?.toLowerCase().includes(appSearch.toLowerCase());
    return matchFilter && matchSearch;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Performer/artist applications — shown inside the Performers tab
  const filteredPerformerApps = artistApplications.filter(a => {
    const curStatus = appStatusOverrides[a._id] ?? a.status;
    const matchFilter = perfAppFilter === "all" || curStatus === perfAppFilter;
    const matchSearch = !perfAppSearch ||
      a.name?.toLowerCase().includes(perfAppSearch.toLowerCase()) ||
      a.serviceType?.toLowerCase().includes(perfAppSearch.toLowerCase()) ||
      a.performerArtForm?.toLowerCase().includes(perfAppSearch.toLowerCase()) ||
      a.city?.toLowerCase().includes(perfAppSearch.toLowerCase()) ||
      a.address?.toLowerCase().includes(perfAppSearch.toLowerCase());
    return matchFilter && matchSearch;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const coordStats = {
    total:    coords.length,
    pending:  coords.filter(c => c.status === "pending").length,
    approved: coords.filter(c => c.status === "approved").length,
    rejected: coords.filter(c => c.status === "rejected").length,
  };

  const perfTypesPresent = PERFORMER_TYPES.filter(t => performers.some(v => v.serviceType === t));

  const summaryCards = [
    { label: "Pending Vendor Apps",    value: pendingBusiness,             icon: "🏪", color: "#D97706" },
    { label: "Pending Performer Apps", value: pendingArtists,              icon: "🎤", color: "#D97706" },
    { label: "Coordinators",           value: coordStats.total,            icon: "🎯", color: "#4F46E5" },
    { label: "Active Coordinators",    value: coordStats.approved,         icon: "✅", color: "#15803D" },
    { label: "Chats Assigned",         value: coordAssignedChats.length,   icon: "💬", color: "#7C3AED" },
  ];

  // ── Shared button helper ──────────────────────────────────────────────────
  const Btn = ({ onClick, bg, color, border, children }) => (
    <button onClick={onClick} style={{
      padding: "7px 18px", borderRadius: 8, border: border ? `1.5px solid ${border}` : "none",
      background: bg, color, fontFamily: F, fontWeight: 700, fontSize: 12, cursor: "pointer",
    }}>
      {children}
    </button>
  );

  // ── Shared application card — used by both the Vendors tab (business apps)
  // and the Performers tab's pending-applications section (artist apps) ──────
  const renderAppCard = (app) => {
    const isCoord = app._kind === "coordinator"; // always false for vendor/performer apps
    const waNum = app.whatsappNumber || app.phoneNumber;
    const artEmoji = app.performerArtForm ? (ART_FORM_EMOJI[app.performerArtForm] || "🎨") : null;

    const updateAppStatus = (newStatus) => {
      const url = isCoord
        ? `${BASE_URL}/admin/coordinators/${app._id}/status`
        : `${BASE_URL}/vendor-applications/${app._id}/status`;
      fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      })
        .then(r => r.json())
        .then(d => {
          setAppStatusOverrides(prev => ({ ...prev, [app._id]: newStatus }));
          if (isCoord && d.coordinator) {
            setCoords(prev => prev.map(c => c._id === app._id ? d.coordinator : c));
          }
          if (!isCoord && d.whatsappMsg && d.whatsappPhone) {
            setWaPopup({ msg: d.whatsappMsg, phone: d.whatsappPhone });
          }
        })
        .catch(() => {});
    };

    const curStatus = appStatusOverrides[app._id] ?? app.status;
    const STATUS_STYLES = {
      pending:    { bg: "#fffbeb", color: "#b45309", border: "#fde68a",  label: "Pending" },
      form_sent:  { bg: "#eff6ff", color: "#0369a1", border: "#bfdbfe",  label: "Form Sent" },
      approved:   { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0",  label: "Approved" },
      registered: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0",  label: "Registered ✓" },
      rejected:   { bg: "#fff5f5", color: "#c0392b", border: "#fca5a5",  label: "Rejected" },
    };
    const curStyle = STATUS_STYLES[curStatus] || STATUS_STYLES.pending;

    return (
      <div key={app._id} style={{ background: "#fff", borderRadius: 14, border: isCoord ? "1.5px solid rgba(99,102,241,0.25)" : "1.5px solid rgba(196,122,46,0.2)", padding: "16px 20px", boxShadow: "0 2px 10px rgba(139,69,19,0.05)", fontFamily: F }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: "#2C1A0E" }}>{app.name}</span>

              {/* Kind badge */}
              <span style={{ fontSize: 11, fontWeight: 700, background: isCoord ? "rgba(99,102,241,0.1)" : "rgba(196,122,46,0.1)", color: isCoord ? "#4F46E5" : GOLD, border: isCoord ? "1.5px solid rgba(99,102,241,0.25)" : "1.5px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "2px 10px" }}>
                {isCoord ? "🎯 Event Coordinator" : `${app.isArtist ? "🎤" : "🏪"} ${app.serviceType || (app.isArtist ? "Artist" : "Vendor")}`}
              </span>

              {/* Art form chip (artists only) */}
              {!isCoord && app.performerArtForm && (
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(99,102,241,0.07)", color: "#4F46E5", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "2px 10px" }}>
                  {artEmoji} {app.performerArtForm}
                </span>
              )}

              {/* Business name chip (vendors only) */}
              {!isCoord && !app.isArtist && app.businessName && (
                <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(196,122,46,0.07)", color: GOLD, border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "2px 10px" }}>
                  {app.businessName}
                </span>
              )}

              {/* Status badge */}
              <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 100, background: curStyle.bg, color: curStyle.color, border: `1px solid ${curStyle.border}` }}>
                {curStyle.label}
              </span>

              {/* Dashboard plan badge — what they picked at registration (approved apps: matches the live Vendor's plan) */}
              {!isCoord && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 100, background: app.plan === "paid" ? "rgba(22,163,74,0.1)" : "rgba(28,9,0,0.05)", color: app.plan === "paid" ? "#16A34A" : "#6B5B4D", border: `1px solid ${app.plan === "paid" ? "rgba(22,163,74,0.25)" : "rgba(28,9,0,0.12)"}` }}>
                  {app.plan === "paid" ? "Paid plan" : "Free plan"}
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#5a3a1a" }}>
              <span>📞 {app.phoneNumber}</span>
              {app.whatsappNumber && app.whatsappNumber !== app.phoneNumber && <span>💬 {app.whatsappNumber}</span>}
              {app.email && <span>✉️ {app.email}</span>}
            </div>

            <div style={{ fontSize: 12, color: "#9B7450", marginTop: 4 }}>
              📍 {app.city || app.address || "—"} · {app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-IN") : "—"}
              {isCoord && app.experience && ` · ${app.experience}`}
              {isCoord && app.eventsPerMonth && ` · ${app.eventsPerMonth} events/mo`}
            </div>

            {/* Coordinator specializations */}
            {isCoord && app.specializations?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                {app.specializations.map(s => (
                  <span key={s} style={{ background: "#F3F4FF", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "2px 9px", fontSize: 11, fontWeight: 600, color: "#4F46E5" }}>{s}</span>
                ))}
              </div>
            )}

            {/* Coordinator bio */}
            {isCoord && app.bio && (
              <p style={{ fontSize: 12.5, color: "#5A3A1A", lineHeight: 1.6, margin: "8px 0 0", background: "#FFF8EE", borderRadius: 8, padding: "8px 12px", borderLeft: "3px solid #4F46E5" }}>
                {app.bio}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", borderTop: "1px solid rgba(204,171,74,0.12)", paddingTop: 10 }}>
          {/* Coordinator flow: pending → approve or reject directly */}
          {isCoord && curStatus === "pending" && (
            <>
              <Btn onClick={() => updateAppStatus("approved")} bg="#15803D" color="#fff">✅ Approve</Btn>
              <Btn onClick={() => updateAppStatus("rejected")} bg="#FFF1F2" color="#BE123C" border="#FCA5A5">❌ Reject</Btn>
            </>
          )}
          {isCoord && curStatus === "approved" && (
            <span style={{ fontSize: 12, color: "#15803D", fontWeight: 700 }}>✅ Active coordinator</span>
          )}
          {isCoord && curStatus === "rejected" && (
            <Btn onClick={() => updateAppStatus("pending")} bg="#FEF3C7" color="#D97706" border="#FDE68A">↩ Move to Pending</Btn>
          )}

          {/* Pending → Approve directly lists them live (creates the real vendor/artist
              account from what they already submitted) or Reject. Same action for both
              artist and business applications — approval no longer requires them to fill
              out a second registration form. */}
          {!isCoord && curStatus === "pending" && (
            <>
              <Btn onClick={() => updateAppStatus("approved")} bg="#15803D" color="#fff">✅ Approve & List</Btn>
              <Btn onClick={() => updateAppStatus("rejected")} bg="#FFF1F2" color="#BE123C" border="#FCA5A5">❌ Reject</Btn>
            </>
          )}
          {/* Legacy applications already sitting in form_sent from before this flow changed */}
          {!isCoord && curStatus === "form_sent" && (
            <>
              <span style={{ fontSize: 12, color: "#0369a1", fontWeight: 600 }}>📲 Invite sent — waiting for them to register</span>
              <a
                href={`https://wa.me/91${waNum}?text=${encodeURIComponent(`Hi ${app.name}! 👋 Just a reminder to complete your Tendr registration:\n${window.location.origin}/vendor/register`)}`}
                target="_blank" rel="noopener noreferrer"
                style={{ padding: "6px 12px", borderRadius: 8, background: "#EFF6FF", color: "#0369a1", fontSize: 12, fontWeight: 700, textDecoration: "none", border: "1.5px solid #BFDBFE" }}
              >
                🔁 Resend Link
              </a>
              <Btn onClick={() => updateAppStatus("registered")} bg="#15803D" color="#fff">✅ Mark Registered</Btn>
              <Btn onClick={() => updateAppStatus("rejected")} bg="#FFF1F2" color="#BE123C" border="#FCA5A5">❌ Reject</Btn>
            </>
          )}
          {!isCoord && curStatus === "rejected" && (
            <Btn onClick={() => updateAppStatus("pending")} bg="#FEF3C7" color="#D97706" border="#FDE68A">↩ Move to Pending</Btn>
          )}
          {!isCoord && curStatus === "approved" && (
            <span style={{ fontSize: 12, color: "#15803D", fontWeight: 700 }}>✅ Live on Tendr — dashboard access enabled</span>
          )}
          {!isCoord && curStatus === "registered" && (
            <span style={{ fontSize: 12, color: "#15803D", fontWeight: 700 }}>✅ Registered on platform</span>
          )}
        </div>
      </div>
    );
  };

  // ── Coordinator card — used by both Applications>Coordinators (pending/
  // rejected, with approve/reject) and Active>Coordinators (approved, with
  // revoke) — same card, the action row already branches on c.status ──────
  const renderCoordCard = (c) => {
    const assignedCount = chatRequests.filter(cr => cr.coordinatorId === c._id || cr.coordinatorName === c.name).length;
    return (
      <div key={c._id} style={{ background: CARD, borderRadius: 14, padding: "18px 20px", border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 2px 8px rgba(44,26,14,0.04)", fontFamily: F }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
              {c.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 800, color: "#2C1A0E", fontSize: 15 }}>{c.name}</p>
              <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#9B7450" }}>
                {c.city}{c.experience ? ` · ${c.experience}` : ""}{c.eventsPerMonth ? ` · ${c.eventsPerMonth} events/mo` : ""}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {assignedCount > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(99,102,241,0.08)", color: "#4F46E5", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "3px 10px" }}>
                💬 {assignedCount} chat{assignedCount > 1 ? "s" : ""}
              </span>
            )}
            <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 100, padding: "4px 12px",
              background: c.status === "approved" ? "#F0FDF4" : c.status === "rejected" ? "#FFF1F2" : "#FEF3C7",
              color: c.status === "approved" ? "#15803D" : c.status === "rejected" ? "#BE123C" : "#D97706" }}>
              {c.status === "approved" ? "✅ Active" : c.status === "rejected" ? "❌ Rejected" : "⏳ Pending"}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 10 }}>
          {[
            ["📞 Phone",   c.phoneNumber],
            ["📧 Email",   c.email],
            ["📅 Joined",  c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : "—"],
            ...(c.referralCode ? [["🔑 Referral", c.referralCode]] : []),
          ].map(([k, v]) => (
            <div key={k} style={{ background: "#F8F4EF", borderRadius: 8, padding: "6px 10px" }}>
              <p style={{ margin: 0, fontSize: 10, color: "#9B7450", fontWeight: 600 }}>{k}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 700, color: "#2C1A0E", wordBreak: "break-all" }}>{v || "—"}</p>
            </div>
          ))}
        </div>

        {c.specializations?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
            {c.specializations.map(s => (
              <span key={s} style={{ background: "#FFF8EE", border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "2px 9px", fontSize: 11, fontWeight: 600, color: GOLD }}>{s}</span>
            ))}
          </div>
        )}

        {/* Application questionnaire summary */}
        {(c.age || c.preferredLanguage || c.currentOccupation) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 10 }}>
            {[
              ["🎂 Age",          c.age],
              ["🗣️ Language",     c.preferredLanguage],
              ["💼 Occupation",   c.currentOccupation],
              ["⏱️ Availability", c.availableHoursPerWeek],
              ["🎓 Qualification", c.qualification],
              ["🏢 Vendor network", c.hasVendorNetwork],
              ["📋 Can bring leads", c.canBringLeads],
              ["🏠 Organized events?", c.hasOrganizedEvents === "Yes" ? `Yes${c.eventsOrganizedCount ? ` (${c.eventsOrganizedCount})` : ""}` : c.hasOrganizedEvents],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k} style={{ background: "#F8F4EF", borderRadius: 8, padding: "6px 10px" }}>
                <p style={{ margin: 0, fontSize: 10, color: "#9B7450", fontWeight: 600 }}>{k}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 700, color: "#2C1A0E" }}>{v}</p>
              </div>
            ))}
          </div>
        )}

        {(c.availableFor?.length > 0 || c.travelAreas?.length > 0) && (
          <div style={{ marginBottom: 10 }}>
            {c.availableFor?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: c.travelAreas?.length > 0 ? 6 : 0 }}>
                {c.availableFor.map(a => (
                  <span key={a} style={{ background: "#EFF6FF", border: "1.5px solid rgba(37,99,235,0.2)", borderRadius: 100, padding: "2px 9px", fontSize: 11, fontWeight: 600, color: "#2563eb" }}>{a}</span>
                ))}
              </div>
            )}
            {c.travelAreas?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {c.travelAreas.map(a => (
                  <span key={a} style={{ background: "#F0FDF4", border: "1.5px solid rgba(21,128,61,0.2)", borderRadius: 100, padding: "2px 9px", fontSize: 11, fontWeight: 600, color: "#15803D" }}>📍 {a}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {c.customerInteractionComfort > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 10, fontSize: 11, color: "#9B7450" }}>
            <span>Customers {c.customerInteractionComfort}/5</span>
            <span>Calls {c.callComfort}/5</span>
            <span>In-person {c.inPersonMeetingComfort}/5</span>
            <span>Problem-solving {c.problemHandlingComfort}/5</span>
          </div>
        )}

        {c.planningExperience && (
          <p style={{ fontSize: 12, color: "#9B7450", lineHeight: 1.5, margin: "0 0 10px" }}>
            <strong style={{ color: "#5A3A1A" }}>Experience: </strong>{c.planningExperience}
          </p>
        )}

        {c.bio && (
          <p style={{ fontSize: 12.5, color: "#5A3A1A", lineHeight: 1.6, margin: "0 0 10px", background: "#FFF8EE", borderRadius: 8, padding: "8px 12px", borderLeft: "3px solid " + GOLD }}>
            {c.bio}
          </p>
        )}

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {c.status === "pending" && (
            <>
              <Btn onClick={() => updateCoordStatus(c._id, "approved")} bg="#15803D" color="#fff">✅ Approve</Btn>
              <Btn onClick={() => updateCoordStatus(c._id, "rejected")} bg="#FFF1F2" color="#BE123C" border="#FCA5A5">❌ Reject</Btn>
            </>
          )}
          {c.status === "approved" && (
            <Btn onClick={() => updateCoordStatus(c._id, "rejected")} bg="#FFF1F2" color="#BE123C" border="#FCA5A5">Revoke Access</Btn>
          )}
          {c.status === "rejected" && (
            <Btn onClick={() => updateCoordStatus(c._id, "approved")} bg="#15803D" color="#fff">Re-Approve</Btn>
          )}
        </div>
      </div>
    );
  };

  // ── Registered-vendor row — used by Active>Vendors and Active>Performers ──
  const renderVendorRow = (v, i) => (
    <div key={v._id || i} style={{ background: CARD, borderRadius: 12, padding: "16px 20px", border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 2px 8px rgba(44,26,14,0.04)", fontFamily: F, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flex: 1, minWidth: 0 }}>
        {v.mainPhotoUrl ? (
          <img src={v.mainPhotoUrl} alt={v.name} style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(196,122,46,0.2)" }} />
        ) : (
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
            {v.name?.[0]?.toUpperCase()}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 800, color: "#2C1A0E", fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</p>
          <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#9B7450" }}>{v.city || "—"} · {v.phoneNumber || v.phone || "—"}</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(196,122,46,0.1)", color: GOLD, border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "3px 10px" }}>{v.serviceType}</span>
        {(v.bookingsCount > 0 || v.totalBookings > 0) && (
          <span style={{ fontSize: 11, fontWeight: 700, background: "#F0FDF4", color: "#15803D", border: "1.5px solid #86EFAC", borderRadius: 100, padding: "3px 10px" }}>
            📅 {v.bookingsCount || v.totalBookings} bookings
          </span>
        )}
        {v.avgReviewScore > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, background: "#FEF3C7", color: "#D97706", borderRadius: 100, padding: "3px 10px" }}>
            ⭐ {Number(v.avgReviewScore).toFixed(1)}
          </span>
        )}
        <span style={{ fontSize: 11, fontWeight: 700, background: v.isActive === false ? "#FFF1F2" : "#F0FDF4", color: v.isActive === false ? "#BE123C" : "#15803D", borderRadius: 100, padding: "3px 10px" }}>
          {v.isActive === false ? "Inactive" : "Active"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-6 overflow-y-auto">

      {/* WhatsApp popup after approve/reject */}
      {waPopup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setWaPopup(null)}>
          <div style={{ background: "#fff", borderRadius: 18, padding: "28px 26px", maxWidth: 440, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: F }}
            onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: 13, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>SMS sent ✓</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", marginBottom: 12 }}>Also send on WhatsApp?</p>
            <div style={{ background: "#F9F6F1", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#5a3a1a", lineHeight: 1.6, marginBottom: 18, whiteSpace: "pre-wrap" }}>{waPopup.msg}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <a href={`https://wa.me/91${waPopup.phone}?text=${encodeURIComponent(waPopup.msg)}`}
                target="_blank" rel="noopener noreferrer"
                onClick={() => setWaPopup(null)}
                style={{ flex: 1, padding: "11px", borderRadius: 10, background: "#25D366", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", textAlign: "center" }}>
                Send on WhatsApp
              </a>
              <button type="button" onClick={() => setWaPopup(null)}
                style={{ padding: "11px 18px", borderRadius: 10, border: "1.5px solid #E5D5C0", background: "#F9F6F1", color: "#9B7450", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: F }}>
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#2C1A0E", fontFamily: F, marginBottom: 4 }}>
          👥 People Hub
        </h2>
        <p style={{ fontSize: 13, color: "#9B7450", fontFamily: F }}>
          Manage artist &amp; coordinator registrations, performers on platform, and chat assignments.
        </p>
      </div>

      {/* Summary stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 28 }}>
        {summaryCards.map(s => (
          <div key={s.label} style={{ background: CARD, borderRadius: 12, padding: "14px 16px", border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 2px 8px rgba(44,26,14,0.04)" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: F, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#9B7450", fontFamily: F, marginTop: 4, lineHeight: 1.3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Top-level: Applications vs Active vs Chat Transfers ──────────── */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        {[
          ["applications", "📥 Applications",  pendingBusiness + pendingArtists + pendingOrRejectedCoords.length],
          ["active",       "✅ Active",         activeVendors.length + performers.length + approvedCoords.length],
          ["chats",        "💬 Chat Transfers", coordAssignedChats.length],
        ].map(([val, label, count]) => (
          <button
            key={val} onClick={() => setSection(val)}
            style={{
              padding: "10px 20px", borderRadius: 12, fontSize: 14, fontWeight: 800, fontFamily: F,
              cursor: "pointer",
              background: section === val ? "linear-gradient(135deg,#2C1A0E,#4A2C14)" : "#fff",
              color: section === val ? "#fff" : "#2C1A0E",
              border: section === val ? "none" : "1.5px solid rgba(44,26,14,0.15)",
              boxShadow: section === val ? "0 4px 14px rgba(44,26,14,0.22)" : "0 1px 4px rgba(44,26,14,0.04)",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            {label}
            {count > 0 && (
              <span style={{
                background: section === val ? "rgba(255,255,255,0.2)" : "rgba(196,122,46,0.1)",
                color: section === val ? "#fff" : GOLD,
                borderRadius: 100, padding: "2px 9px", fontSize: 12,
              }}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Type sub-tabs (Applications and Active only) ─────────────────── */}
      {section !== "chats" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "2px solid rgba(196,122,46,0.1)", paddingBottom: 14, flexWrap: "wrap" }}>
          {[
            ["vendors",      "🏪 Vendors",      section === "active" ? activeVendors.length : pendingBusiness],
            ["performers",   "🎤 Performers",   section === "active" ? performers.length    : pendingArtists],
            ["coordinators", "🎯 Coordinators", section === "active" ? approvedCoords.length : pendingOrRejectedCoords.length],
          ].map(([val, label, count]) => (
            <button
              key={val} onClick={() => setSubTab(val)}
              style={{
                padding: "8px 18px", borderRadius: 100, fontSize: 13, fontWeight: 700, fontFamily: F,
                cursor: "pointer",
                background: subTab === val ? GOLD : "transparent",
                color: subTab === val ? "#fff" : "#9B7450",
                border: subTab === val ? "none" : "1.5px solid #E5D5C0",
                transition: "all .15s",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {label}
              {count > 0 && (
                <span style={{
                  background: subTab === val ? "rgba(255,255,255,0.25)" : "rgba(196,122,46,0.1)",
                  color: subTab === val ? "#fff" : GOLD,
                  borderRadius: 100, padding: "1px 7px", fontSize: 11,
                }}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ─── APPLICATIONS > VENDORS ─────────────────────────────────────── */}
      {section === "applications" && subTab === "vendors" && (
        <div>
          <p style={{ fontSize: 13, color: "#9B7450", fontFamily: F, marginBottom: 16 }}>
            New business/vendor applications — Caterer, Decorator, DJ, Photographer, etc. — newest first.
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={appSearch}
              onChange={e => setAppSearch(e.target.value)}
              placeholder="Search by name, category, business, city…"
              style={{ flex: "1 1 220px", padding: "8px 14px", borderRadius: 100, border: "1.5px solid #E5D5C0", fontFamily: F, fontSize: 13, color: "#2C1A0E", background: CARD, outline: "none" }}
            />
            {[
              ["all",       "All",             businessApplications.length],
              ["pending",   "⏳ Pending",       businessApplications.filter(a => (appStatusOverrides[a._id] ?? a.status) === "pending").length],
              ["form_sent", "📤 Form Sent",     businessApplications.filter(a => (appStatusOverrides[a._id] ?? a.status) === "form_sent").length],
              ["rejected",  "❌ Rejected",      businessApplications.filter(a => (appStatusOverrides[a._id] ?? a.status) === "rejected").length],
            ].map(([val, lbl, cnt]) => (
              <button
                key={val} onClick={() => setAppFilter(val)}
                style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700, fontFamily: F, cursor: "pointer", background: appFilter === val ? GOLD : "#fff", color: appFilter === val ? "#fff" : "#9B7450", border: appFilter === val ? "none" : "1.5px solid #E5D5C0", display: "flex", alignItems: "center", gap: 5 }}
              >
                {lbl}
                <span style={{ fontSize: 10, background: appFilter === val ? "rgba(255,255,255,0.25)" : "rgba(196,122,46,0.1)", color: appFilter === val ? "#fff" : GOLD, borderRadius: 100, padding: "1px 6px" }}>{cnt}</span>
              </button>
            ))}
          </div>

          {filteredBusinessApps.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 0", color: "#9B7450", fontFamily: F }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <p style={{ fontWeight: 700, color: "#2C1A0E", marginBottom: 4 }}>No vendor applications found</p>
              <p style={{ fontSize: 13 }}>New Caterer/Decorator/DJ/Photographer etc. applications appear here automatically.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredBusinessApps.map(renderAppCard)}
            </div>
          )}
        </div>
      )}

      {/* ─── APPLICATIONS > PERFORMERS ──────────────────────────────────── */}
      {section === "applications" && subTab === "performers" && (
        <div>
          <p style={{ fontSize: 13, color: "#9B7450", fontFamily: F, marginBottom: 16 }}>
            New artist/performer applications — Singer, Band, Anchor, Choreographer, Musician, Emcee etc. — newest first.
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={perfAppSearch}
              onChange={e => setPerfAppSearch(e.target.value)}
              placeholder="Search by name, art form, city…"
              style={{ flex: "1 1 220px", padding: "8px 14px", borderRadius: 100, border: "1.5px solid #E5D5C0", fontFamily: F, fontSize: 13, color: "#2C1A0E", background: CARD, outline: "none" }}
            />
            {[
              ["all",       "All",         artistApplications.length],
              ["pending",   "⏳ Pending",   artistApplications.filter(a => (appStatusOverrides[a._id] ?? a.status) === "pending").length],
              ["form_sent", "📤 Form Sent", artistApplications.filter(a => (appStatusOverrides[a._id] ?? a.status) === "form_sent").length],
              ["rejected",  "❌ Rejected",  artistApplications.filter(a => (appStatusOverrides[a._id] ?? a.status) === "rejected").length],
            ].map(([val, lbl, cnt]) => (
              <button
                key={val} onClick={() => setPerfAppFilter(val)}
                style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700, fontFamily: F, cursor: "pointer", background: perfAppFilter === val ? GOLD : "#fff", color: perfAppFilter === val ? "#fff" : "#9B7450", border: perfAppFilter === val ? "none" : "1.5px solid #E5D5C0", display: "flex", alignItems: "center", gap: 5 }}
              >
                {lbl}
                <span style={{ fontSize: 10, background: perfAppFilter === val ? "rgba(255,255,255,0.25)" : "rgba(196,122,46,0.1)", color: perfAppFilter === val ? "#fff" : GOLD, borderRadius: 100, padding: "1px 6px" }}>{cnt}</span>
              </button>
            ))}
          </div>

          {filteredPerformerApps.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 0", color: "#9B7450", fontFamily: F }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <p style={{ fontWeight: 700, color: "#2C1A0E", marginBottom: 4 }}>No performer applications found</p>
              <p style={{ fontSize: 13 }}>New Singer/Band/Anchor/Choreographer etc. applications appear here automatically.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredPerformerApps.map(renderAppCard)}
            </div>
          )}
        </div>
      )}

      {/* ─── APPLICATIONS > COORDINATORS ────────────────────────────────── */}
      {section === "applications" && subTab === "coordinators" && (
        <div>
          <p style={{ fontSize: 13, color: "#9B7450", fontFamily: F, marginBottom: 16 }}>
            New Event Coordinator applications — approve to move them into Active and activate their login.
          </p>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={coordSearch} onChange={e => setCoordSearch(e.target.value)}
              placeholder="Search by name or city…"
              style={{ flex: "1 1 200px", padding: "8px 14px", borderRadius: 100, border: "1.5px solid #E5D5C0", fontFamily: F, fontSize: 13, color: "#2C1A0E", background: CARD, outline: "none" }}
            />
            {[["all","All"],["pending","⏳ Pending"],["rejected","❌ Rejected"]].map(([val, lbl]) => {
              const cnt = val === "all" ? pendingOrRejectedCoords.length : pendingOrRejectedCoords.filter(c => c.status === val).length;
              return (
                <button key={val} onClick={() => setCoordFilter(val)}
                  style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700, fontFamily: F, cursor: "pointer", background: coordFilter === val ? GOLD : "#fff", color: coordFilter === val ? "#fff" : "#9B7450", border: coordFilter === val ? "none" : "1.5px solid #E5D5C0", display: "flex", alignItems: "center", gap: 5 }}>
                  {lbl}
                  <span style={{ fontSize: 10, background: coordFilter === val ? "rgba(255,255,255,0.25)" : "rgba(196,122,46,0.1)", color: coordFilter === val ? "#fff" : GOLD, borderRadius: 100, padding: "1px 6px" }}>{cnt}</span>
                </button>
              );
            })}
          </div>

          {!coordsLoaded && <p style={{ color: "#9B7450", fontFamily: F, fontSize: 13 }}>Loading coordinators…</p>}
          {coordsLoaded && filteredCoords.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9B7450", fontFamily: F }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
              <p style={{ fontWeight: 700, color: "#2C1A0E" }}>No {coordFilter !== "all" ? coordFilter : ""} coordinator applications found</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredCoords.map(renderCoordCard)}
          </div>
        </div>
      )}

      {/* ─── ACTIVE > VENDORS ───────────────────────────────────────────── */}
      {section === "active" && subTab === "vendors" && (
        <div>
          <p style={{ fontSize: 13, color: "#9B7450", fontFamily: F, marginBottom: 16 }}>
            Business/vendor accounts already registered and live on the platform.
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={vendorActiveSearch} onChange={e => setVendorActiveSearch(e.target.value)}
              placeholder="Search vendor…"
              style={{ flex: "1 1 180px", padding: "8px 14px", borderRadius: 100, border: "1.5px solid #E5D5C0", fontFamily: F, fontSize: 13, color: "#2C1A0E", background: CARD, outline: "none" }}
            />
            {["all", ...vendorTypesPresent].map(t => {
              const cnt = t === "all" ? activeVendors.length : activeVendors.filter(v => v.serviceType === t).length;
              return (
                <button key={t} onClick={() => setVendorActiveFilter(t)}
                  style={{ padding: "6px 13px", borderRadius: 100, fontSize: 12, fontWeight: 700, fontFamily: F, cursor: "pointer", background: vendorActiveFilter === t ? GOLD : "#fff", color: vendorActiveFilter === t ? "#fff" : "#9B7450", border: vendorActiveFilter === t ? "none" : "1.5px solid #E5D5C0", display: "flex", alignItems: "center", gap: 4 }}>
                  {t === "all" ? "All" : t}
                  <span style={{ fontSize: 10, background: vendorActiveFilter === t ? "rgba(255,255,255,0.25)" : "rgba(196,122,46,0.1)", color: vendorActiveFilter === t ? "#fff" : GOLD, borderRadius: 100, padding: "1px 6px" }}>{cnt}</span>
                </button>
              );
            })}
          </div>

          {filteredActiveVendors.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9B7450", fontFamily: F }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🏪</div>
              <p style={{ fontWeight: 700, color: "#2C1A0E" }}>No vendors found</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredActiveVendors.map(renderVendorRow)}
          </div>
        </div>
      )}

      {/* ─── ACTIVE > PERFORMERS ────────────────────────────────────────── */}
      {section === "active" && subTab === "performers" && (
        <div>
          <p style={{ fontSize: 13, color: "#9B7450", fontFamily: F, marginBottom: 16 }}>
            Performers already registered and live on the platform.
          </p>
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={perfSearch} onChange={e => setPerfSearch(e.target.value)}
              placeholder="Search performer…"
              style={{ flex: "1 1 180px", padding: "8px 14px", borderRadius: 100, border: "1.5px solid #E5D5C0", fontFamily: F, fontSize: 13, color: "#2C1A0E", background: CARD, outline: "none" }}
            />
            {["all", ...perfTypesPresent].map(t => {
              const cnt = t === "all" ? performers.length : performers.filter(v => v.serviceType === t).length;
              return (
                <button key={t} onClick={() => setPerfFilter(t)}
                  style={{ padding: "6px 13px", borderRadius: 100, fontSize: 12, fontWeight: 700, fontFamily: F, cursor: "pointer", background: perfFilter === t ? GOLD : "#fff", color: perfFilter === t ? "#fff" : "#9B7450", border: perfFilter === t ? "none" : "1.5px solid #E5D5C0", display: "flex", alignItems: "center", gap: 4 }}>
                  {t === "all" ? "All" : t}
                  <span style={{ fontSize: 10, background: perfFilter === t ? "rgba(255,255,255,0.25)" : "rgba(196,122,46,0.1)", color: perfFilter === t ? "#fff" : GOLD, borderRadius: 100, padding: "1px 6px" }}>{cnt}</span>
                </button>
              );
            })}
          </div>

          {filteredPerformers.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9B7450", fontFamily: F }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🎤</div>
              <p style={{ fontWeight: 700, color: "#2C1A0E" }}>No performers found</p>
              <p style={{ fontSize: 13 }}>Registered performers with types like Anchor, Band, Vocalist etc. appear here.</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredPerformers.map(renderVendorRow)}
          </div>
        </div>
      )}

      {/* ─── ACTIVE > COORDINATORS ──────────────────────────────────────── */}
      {section === "active" && subTab === "coordinators" && (
        <div>
          <p style={{ fontSize: 13, color: "#9B7450", fontFamily: F, marginBottom: 16 }}>
            Approved, active coordinators.
          </p>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={coordSearch} onChange={e => setCoordSearch(e.target.value)}
              placeholder="Search by name or city…"
              style={{ flex: "1 1 200px", padding: "8px 14px", borderRadius: 100, border: "1.5px solid #E5D5C0", fontFamily: F, fontSize: 13, color: "#2C1A0E", background: CARD, outline: "none" }}
            />
          </div>

          {coordsLoaded && filteredCoords.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9B7450", fontFamily: F }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
              <p style={{ fontWeight: 700, color: "#2C1A0E" }}>No active coordinators yet</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredCoords.map(renderCoordCard)}
          </div>
        </div>
      )}

      {/* ─── CHAT TRANSFERS ─────────────────────────────────────────────── */}
      {section === "chats" && (
        <div>
          <p style={{ fontSize: 13, color: "#9B7450", fontFamily: F, marginBottom: 16 }}>
            Chats transferred to a coordinator. <strong style={{ color: "#2C1A0E" }}>{coordAssignedChats.length}</strong> total.
          </p>

          {coordAssignedChats.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#9B7450", fontFamily: F }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
              <p style={{ fontWeight: 700, color: "#2C1A0E" }}>No chats transferred yet</p>
              <p style={{ fontSize: 13 }}>When you transfer a chat request to a coordinator it appears here.</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {coordAssignedChats.map((c, i) => (
              <div key={c._id || i} style={{ background: CARD, borderRadius: 12, padding: "16px 20px", border: "1.5px solid rgba(99,102,241,0.18)", boxShadow: "0 2px 8px rgba(44,26,14,0.04)", fontFamily: F }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 800, color: "#2C1A0E", fontSize: 15 }}>
                      {c.customerName || c.customerId?.name || "Customer"}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "#9B7450" }}>
                      {c.eventType || "Event"} · {c.date ? new Date(c.date).toLocaleDateString("en-IN") : "—"}
                    </p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(99,102,241,0.08)", color: "#4F46E5", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "4px 12px" }}>
                    🎯 {c.coordinatorName || "Coordinator"}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 6 }}>
                  {[
                    ["📍 City",        c.city || c.location || "—"],
                    ["💰 Budget",      c.budget ? `₹${Number(c.budget).toLocaleString("en-IN")}` : "—"],
                    ["📅 Transferred", c.updatedAt ? new Date(c.updatedAt).toLocaleDateString("en-IN") : "—"],
                    ["📞 Phone",       c.customerPhone || c.customerId?.phoneNumber || "—"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: "#F8F4EF", borderRadius: 8, padding: "6px 10px" }}>
                      <p style={{ margin: 0, fontSize: 10, color: "#9B7450", fontWeight: 600 }}>{k}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 700, color: "#2C1A0E" }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
