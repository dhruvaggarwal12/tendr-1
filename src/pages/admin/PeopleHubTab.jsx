import React, { useState, useEffect } from "react";

const F    = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const CARD = "#FFFCF5";

// Artist/performer service types that belong in People Hub (not in vendor queue)
const ARTIST_SERVICE_TYPES = [
  "DJ", "Anchor", "Emcee/Host", "Band", "Singer", "Musician",
  "Performer", "Stand-up Comedian", "Magician", "AV Setup",
];

// Performer types used for filtering the registered-vendor stats
const PERFORMER_TYPES = [
  "Anchor", "Band", "Choreographer", "DJ", "Vocalist",
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
  const [subTab, setSubTab]           = useState("applications");
  const [coords, setCoords]           = useState([]);
  const [coordsLoaded, setCoordsLoaded] = useState(false);
  const [coordFilter, setCoordFilter] = useState("all");
  const [coordSearch, setCoordSearch] = useState("");
  const [perfFilter, setPerfFilter]   = useState("all");
  const [perfSearch, setPerfSearch]   = useState("");
  const [appSearch, setAppSearch]     = useState("");
  const [appFilter, setAppFilter]     = useState("all"); // all | pending | form_sent | approved | rejected
  const [appStatusOverrides, setAppStatusOverrides] = useState({}); // { [id]: status }

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
  const performers        = vendorStats.filter(v => PERFORMER_TYPES.includes(v.serviceType));
  const coordAssignedChats = chatRequests.filter(c => c.coordinatorId);

  // Artist applications: VendorApplication entries with an artist serviceType (or untyped)
  const artistApplications = vendorApplications.filter(a =>
    ARTIST_SERVICE_TYPES.includes(a.serviceType) || !a.serviceType
  );

  const pendingCoords  = coords.filter(c => c.status === "pending").length;
  const pendingArtists = artistApplications.filter(a => ["pending", "form_sent"].includes(a.status)).length;
  const totalPending   = pendingCoords + pendingArtists;

  // Filtered lists
  const filteredCoords = coords.filter(c => {
    const matchFilter = coordFilter === "all" || c.status === coordFilter;
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

  const filteredApps = artistApplications.filter(a => {
    const matchFilter = appFilter === "all" || a.status === appFilter;
    const matchSearch = !appSearch ||
      a.name?.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.serviceType?.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.performerArtForm?.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.address?.toLowerCase().includes(appSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const coordStats = {
    total:    coords.length,
    pending:  coords.filter(c => c.status === "pending").length,
    approved: coords.filter(c => c.status === "approved").length,
    rejected: coords.filter(c => c.status === "rejected").length,
  };

  const perfTypesPresent = PERFORMER_TYPES.filter(t => performers.some(v => v.serviceType === t));

  const summaryCards = [
    { label: "Pending Applications", value: totalPending,               icon: "📥", color: "#D97706" },
    { label: "Coordinators",          value: coordStats.total,            icon: "🎯", color: "#4F46E5" },
    { label: "Active Coordinators",   value: coordStats.approved,         icon: "✅", color: "#15803D" },
    { label: "Registered Performers", value: performers.length,           icon: "🎤", color: GOLD     },
    { label: "Chats Assigned",        value: coordAssignedChats.length,   icon: "💬", color: "#7C3AED" },
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

  return (
    <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-6 overflow-y-auto">

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

      {/* Sub-tab switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "2px solid rgba(196,122,46,0.1)", paddingBottom: 14, flexWrap: "wrap" }}>
        {[
          ["applications", "📥 Applications",  totalPending],
          ["coordinators", "🎯 Coordinators",  coordStats.total],
          ["performers",   "🎤 Performers",    performers.length],
          ["chats",        "💬 Chat Transfers", coordAssignedChats.length],
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

      {/* ─── APPLICATIONS ─────────────────────────────────────────────────── */}
      {subTab === "applications" && (
        <div>
          <p style={{ fontSize: 13, color: "#9B7450", fontFamily: F, marginBottom: 16 }}>
            New registrations from artists and performers who applied via the join page.
            Coordinator applications appear in the <strong style={{ color: "#2C1A0E" }}>Coordinators</strong> tab.
          </p>

          {/* Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={appSearch}
              onChange={e => setAppSearch(e.target.value)}
              placeholder="Search by name, type, art form, city…"
              style={{ flex: "1 1 220px", padding: "8px 14px", borderRadius: 100, border: "1.5px solid #E5D5C0", fontFamily: F, fontSize: 13, color: "#2C1A0E", background: CARD, outline: "none" }}
            />
            {[["all","All"],["pending","⏳ Pending"],["form_sent","📤 Form Sent"],["approved","✅ Approved"],["rejected","❌ Rejected"]].map(([val, lbl]) => {
              const cnt = val === "all" ? artistApplications.length : artistApplications.filter(a => a.status === val).length;
              return (
                <button
                  key={val} onClick={() => setAppFilter(val)}
                  style={{ padding: "7px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700, fontFamily: F, cursor: "pointer", background: appFilter === val ? GOLD : "#fff", color: appFilter === val ? "#fff" : "#9B7450", border: appFilter === val ? "none" : "1.5px solid #E5D5C0", display: "flex", alignItems: "center", gap: 5 }}
                >
                  {lbl}
                  <span style={{ fontSize: 10, background: appFilter === val ? "rgba(255,255,255,0.25)" : "rgba(196,122,46,0.1)", color: appFilter === val ? "#fff" : GOLD, borderRadius: 100, padding: "1px 6px" }}>{cnt}</span>
                </button>
              );
            })}
          </div>

          {filteredApps.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 0", color: "#9B7450", fontFamily: F }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <p style={{ fontWeight: 700, color: "#2C1A0E", marginBottom: 4 }}>No artist applications {appFilter !== "all" ? `with status "${appFilter}"` : ""}</p>
              <p style={{ fontSize: 13 }}>Applications from artists and performers appear here when they sign up via the join page.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredApps.map(app => {
                const GOOGLE_FORM_URL = "https://forms.gle/9DLeMdJiMdLNsTmbA";
                const waNum = app.whatsappNumber || app.phoneNumber;

                const artEmoji = app.performerArtForm ? (ART_FORM_EMOJI[app.performerArtForm] || "🎨") : null;

                const updateAppStatus = (newStatus) => {
                  fetch(`${BASE_URL}/vendor-applications/${app._id}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    credentials: "include",
                    body: JSON.stringify({ status: newStatus }),
                  })
                    .then(r => r.json())
                    .then(() => setAppStatusOverrides(prev => ({ ...prev, [app._id]: newStatus })))
                    .catch(() => {});
                };

                const curStatus = appStatusOverrides[app._id] ?? app.status;
                const curStyle  = {
                  pending:    { bg: "#fffbeb", color: "#b45309", border: "#fde68a",  label: "Pending" },
                  form_sent:  { bg: "#eff6ff", color: "#0369a1", border: "#bfdbfe",  label: "Form Sent" },
                  approved:   { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0",  label: "Approved" },
                  registered: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0",  label: "Registered ✓" },
                  rejected:   { bg: "#fff5f5", color: "#c0392b", border: "#fca5a5",  label: "Rejected" },
                }[curStatus] || statusStyle;

                return (
                  <div key={app._id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.2)", padding: "16px 20px", boxShadow: "0 2px 10px rgba(139,69,19,0.05)", fontFamily: F }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, flexWrap: "wrap", marginBottom: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: 16, color: "#2C1A0E" }}>{app.name}</span>
                          {/* Service type chip */}
                          {app.serviceType && (
                            <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(196,122,46,0.1)", color: GOLD, border: "1.5px solid rgba(196,122,46,0.2)", borderRadius: 100, padding: "2px 10px" }}>
                              {app.serviceType}
                            </span>
                          )}
                          {/* Art form chip */}
                          {app.performerArtForm && (
                            <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(99,102,241,0.07)", color: "#4F46E5", border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "2px 10px" }}>
                              {artEmoji} {app.performerArtForm}
                            </span>
                          )}
                          {/* Status badge */}
                          <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 10px", borderRadius: 100, background: curStyle.bg, color: curStyle.color, border: `1px solid ${curStyle.border}` }}>
                            {curStyle.label}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "#5a3a1a" }}>
                          <span>📞 {app.phoneNumber}</span>
                          {app.whatsappNumber && <span>💬 {app.whatsappNumber}</span>}
                          {app.email && <span>✉️ {app.email}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "#9B7450", marginTop: 4 }}>
                          📍 {app.address} · {new Date(app.createdAt).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", borderTop: "1px solid rgba(204,171,74,0.15)", paddingTop: 10 }}>
                      {curStatus === "pending" && (
                        <a
                          href={`https://wa.me/91${waNum}?text=${encodeURIComponent(`Hi ${app.name}! 👋 Thank you for your interest in joining Tendr. Please fill in this form to complete your registration: ${GOOGLE_FORM_URL}`)}`}
                          target="_blank" rel="noopener noreferrer"
                          onClick={() => setTimeout(() => updateAppStatus("form_sent"), 500)}
                          style={{ padding: "7px 14px", borderRadius: 8, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}
                        >
                          📤 Send Registration Form
                        </a>
                      )}
                      {curStatus === "form_sent" && (
                        <Btn onClick={() => updateAppStatus("approved")} bg="#15803D" color="#fff">✅ Mark Approved</Btn>
                      )}
                      {(curStatus === "pending" || curStatus === "form_sent") && (
                        <Btn onClick={() => updateAppStatus("rejected")} bg="#FFF1F2" color="#BE123C" border="#FCA5A5">❌ Reject</Btn>
                      )}
                      {curStatus === "rejected" && (
                        <Btn onClick={() => updateAppStatus("pending")} bg="#FEF3C7" color="#D97706" border="#FDE68A">↩ Move to Pending</Btn>
                      )}
                      {curStatus === "approved" && (
                        <span style={{ fontSize: 12, color: "#15803D", fontWeight: 700 }}>✅ Approved — onboarding complete</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── COORDINATORS ─────────────────────────────────────────────────── */}
      {subTab === "coordinators" && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={coordSearch} onChange={e => setCoordSearch(e.target.value)}
              placeholder="Search by name or city…"
              style={{ flex: "1 1 200px", padding: "8px 14px", borderRadius: 100, border: "1.5px solid #E5D5C0", fontFamily: F, fontSize: 13, color: "#2C1A0E", background: CARD, outline: "none" }}
            />
            {[["all","All"],["pending","⏳ Pending"],["approved","✅ Active"],["rejected","❌ Rejected"]].map(([val, lbl]) => {
              const cnt = val === "all" ? coords.length : coords.filter(c => c.status === val).length;
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
              <p style={{ fontWeight: 700, color: "#2C1A0E" }}>No {coordFilter !== "all" ? coordFilter : ""} coordinators found</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredCoords.map(c => {
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
            })}
          </div>
        </div>
      )}

      {/* ─── PERFORMERS (registered on platform) ──────────────────────────── */}
      {subTab === "performers" && (
        <div>
          <p style={{ fontSize: 13, color: "#9B7450", fontFamily: F, marginBottom: 14 }}>
            Performers already registered and active on the platform. For new applications, see the <strong style={{ color: "#2C1A0E" }}>Applications</strong> tab.
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
              <p style={{ fontSize: 13 }}>Registered performers with types like Anchor, Band, DJ, Vocalist etc. appear here.</p>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredPerformers.map((v, i) => (
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
            ))}
          </div>
        </div>
      )}

      {/* ─── CHAT TRANSFERS ───────────────────────────────────────────────── */}
      {subTab === "chats" && (
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
