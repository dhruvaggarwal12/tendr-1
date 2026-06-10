import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import HamburgerNav from "../../components/HamburgerNav";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import SEO from "../../components/SEO";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Detect service type from milestone title
const SERVICE_KEYWORDS = {
  Photographer: ["photographer", "photography", "videograph", "video", "photo", "reel", "candid"],
  Caterer:      ["caterer", "catering", "food", "menu", "buffet", "cuisine"],
  Decorator:    ["decorator", "decoration", "decor", "floral", "balloon", "theme"],
  DJ:           ["dj", "music", "sound", "entertainment", "lights", "console"],
};

function detectService(title = "") {
  const lower = title.toLowerCase();
  for (const [svc, keywords] of Object.entries(SERVICE_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return svc;
  }
  return null;
}

// Compact vendor suggestion card
function VendorHint({ serviceType, navigate, token }) {
  const [vendors, setVendors] = useState(null);
  useEffect(() => {
    fetch(`${BASE_URL}/vendors?serviceTypes[]=${serviceType}&limit=3`)
      .then(r => r.ok ? r.json() : { vendors: [] })
      .then(d => setVendors((d.vendors || []).slice(0, 3)))
      .catch(() => setVendors([]));
  }, [serviceType]);
  if (!vendors) return null;
  if (vendors.length === 0) return null;
  return (
    <div style={{ marginTop: 8, padding: "10px 12px", background: "rgba(196,122,46,0.04)", borderRadius: 10, border: "1px solid rgba(196,122,46,0.14)" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
        {serviceType}s we work with
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {vendors.map(v => (
          <div key={v._id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 8, background: "#FFFCF7", border: "1px solid rgba(196,122,46,0.18)", cursor: "pointer" }}
            onClick={() => {
              if (!token) { navigate("/login"); return; }
              navigate(`/vendor/${v._id}`);
            }}>
            <img src={v.image || v.portfolioPhotos?.[0] || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=60&q=60"} alt={v.name} style={{ width: 24, height: 24, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#2C1A0E" }}>{v.name}</span>
            {v.price && <span style={{ fontSize: 10, color: "#C47A2E" }}>₹{(v.price/1000).toFixed(0)}k+</span>}
          </div>
        ))}
        <button onClick={() => { if (!token) { navigate("/login"); return; } navigate("/listings"); }}
          style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
          See All →
        </button>
      </div>
    </div>
  );
}

const font = "'Outfit', sans-serif";

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1.5px solid rgba(196,122,46,0.22)", fontFamily: font,
  fontSize: 13.5, color: "#2C1A0E", background: "#FDFCF8", outline: "none",
  boxSizing: "border-box",
};

export default function TimelineBuilder() {
  const navigate = useNavigate();
  const { token } = useSelector(s => s.auth);
  const [events, setEvents] = useState([
    { id: "1", title: "Book venue", description: "Confirm availability and advance payment", checked: false },
    { id: "2", title: "Finalise vendors", description: "Photographer, caterer, decorator", checked: false },
    { id: "3", title: "Send invites", description: "WhatsApp and physical cards", checked: false },
  ]);
  const [preview, setPreview] = useState(false);
  const [activeTab, setActiveTab] = useState("planning"); // "planning" | "dayof"

  // Day Of schedule state — saved to localStorage
  const TTL_7D = 7 * 24 * 60 * 60 * 1000;

  const [eventDate, setEventDate] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tendr_dayof") || "{}").eventDate || ""; } catch { return ""; }
  });

  const [dayofSlots, setDayofSlots] = useState(() => {
    try {
      const raw = localStorage.getItem("tendr_dayof");
      if (!raw) return [];
      const d = JSON.parse(raw);
      if (Array.isArray(d)) return d;
      if (d.__expiresAt && Date.now() > d.__expiresAt) { localStorage.removeItem("tendr_dayof"); return []; }
      return d.slots || [];
    } catch { return []; }
  });

  // Live clock — ticks every minute, drives countdown + auto-tick
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Parse stored eventDate into a Date at midnight local time
  const eventDateObj = (() => {
    if (!eventDate) return null;
    const parts = eventDate.match(/(\d{1,2})[\/\-\s](\d{1,2})[\/\-\s](\d{2,4})/);
    if (parts) {
      const [, d, m, y] = parts;
      const year = y.length === 2 ? 2000 + parseInt(y) : parseInt(y);
      return new Date(year, parseInt(m) - 1, parseInt(d));
    }
    const t = new Date(eventDate);
    return isNaN(t) ? null : new Date(t.getFullYear(), t.getMonth(), t.getDate());
  })();

  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const isEventDay = eventDateObj && eventDateObj.getTime() === todayMidnight.getTime();
  const isEventPast = eventDateObj && eventDateObj.getTime() < todayMidnight.getTime();

  // Countdown to event day (days remaining)
  const daysToEvent = eventDateObj ? Math.round((eventDateObj.getTime() - todayMidnight.getTime()) / 86_400_000) : null;

  // Auto-tick: on the event day, mark slots as done when their time has passed
  useEffect(() => {
    if (!isEventDay) return;
    const currentHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setDayofSlots(prev => prev.map(s => {
      if (s.done || !s.time) return s;
      return s.time <= currentHHMM ? { ...s, done: true } : s;
    }));
  }, [now, isEventDay]);

  const addSlot = () => setDayofSlots(prev => [...prev, { id: Date.now().toString(), time: "", title: "", who: "", done: false }]);
  const updateSlot = (id, field, val) => setDayofSlots(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  const toggleSlot = (id) => setDayofSlots(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  const deleteSlot = (id) => setDayofSlots(prev => prev.filter(s => s.id !== id));

  useEffect(() => {
    localStorage.setItem("tendr_dayof", JSON.stringify({ slots: dayofSlots, eventDate, __expiresAt: Date.now() + TTL_7D }));
  }, [dayofSlots, eventDate]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(events);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setEvents(items);
  };

  const addEvent = () => setEvents(prev => [
    ...prev,
    { id: Date.now().toString(), title: "", description: "", checked: false },
  ]);

  const updateEvent = (id, field, value) =>
    setEvents(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));

  const toggleCheckbox = (id) =>
    setEvents(prev => prev.map(e => e.id === id ? { ...e, checked: !e.checked } : e));

  const deleteEvent = (id) =>
    setEvents(prev => prev.filter(e => e.id !== id));

  const done  = events.filter(e => e.checked).length;
  const total = events.length;
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

  const slipRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const downloadSlip = async () => {
    if (!slipRef.current || downloading) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(slipRef.current, { scale: 2, useCORS: true, backgroundColor: "#FFFCF5" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save("event-timeline.pdf");
    } catch (e) {
      console.error("Download failed", e);
    }
    setDownloading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font, paddingBottom: 60 }}>
      <SEO title="Custom Timeline Builder — Tendr" description="Build a custom event timeline with drag-and-drop milestones." path="/timeline" />
      <BasicSpeedDial />
      <HamburgerNav title="Timeline Builder" />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", margin: "0 0 6px" }}>Planning Tool</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 16px" }}>
            Event Timeline
          </h1>
          {/* Tab switcher */}
          <div style={{ display: "flex", gap: 8, borderBottom: "2px solid rgba(196,122,46,0.12)", paddingBottom: 0 }}>
            {[["planning", "📋 Planning Timeline"], ["dayof", "🌅 Day Of Schedule"]].map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                style={{ padding: "10px 20px", border: "none", background: "transparent", fontSize: 13.5, fontWeight: 700, fontFamily: font, cursor: "pointer", color: activeTab === key ? "#C47A2E" : "#9B7450",
                  borderBottom: activeTab === key ? "2.5px solid #C47A2E" : "2.5px solid transparent", marginBottom: -2, transition: "all 0.15s" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ══ DAY OF SCHEDULE TAB ══ */}
        {activeTab === "dayof" && (
          <div>
            {/* Event date input + countdown / event-day banner */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#9B7450" }}>Event Date</label>
                <input
                  type="date"
                  value={(() => {
                    if (!eventDate) return "";
                    const p = eventDate.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
                    if (p) return `${p[3]}-${String(p[2]).padStart(2,"0")}-${String(p[1]).padStart(2,"0")}`;
                    const t = new Date(eventDate);
                    if (!isNaN(t)) return t.toISOString().slice(0,10);
                    return "";
                  })()}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={e => {
                    const iso = e.target.value; // "YYYY-MM-DD"
                    if (!iso) { setEventDate(""); return; }
                    const [y,m,d] = iso.split("-");
                    setEventDate(`${d}/${m}/${y}`);
                  }}
                  style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.3)", fontSize: 13, fontFamily: font, color: "#2C1A0E", outline: "none" }}
                />
              </div>

              {/* Event day banner */}
              {isEventDay && (
                <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 24 }}>🎉</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#CCAB4A" }}>Today is your event day!</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Slots auto-tick as their time passes. Enjoy! 🥂</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: "'Courier New', monospace" }}>
                    {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                  </div>
                </div>
              )}

              {/* Countdown — before event */}
              {!isEventDay && !isEventPast && daysToEvent !== null && (
                <div style={{ background: "rgba(196,122,46,0.07)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, border: "1.5px solid rgba(196,122,46,0.18)" }}>
                  <span style={{ fontSize: 22 }}>⏳</span>
                  <div>
                    <span style={{ fontSize: 20, fontWeight: 900, color: "#C47A2E" }}>{daysToEvent}</span>
                    <span style={{ fontSize: 13, color: "#9B7450", marginLeft: 6 }}>day{daysToEvent !== 1 ? "s" : ""} until your event</span>
                  </div>
                </div>
              )}

              {/* Event past */}
              {isEventPast && (
                <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "10px 16px", fontSize: 13, color: "#15803d", fontWeight: 600, border: "1.5px solid #bbf7d0" }}>
                  ✓ Event completed! Great celebration 🎊
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>Map out every moment of your event day — vendor arrivals, ceremonies, meals, speeches.</p>
              </div>
              <button onClick={addSlot} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 3px 10px rgba(196,122,46,0.3)", whiteSpace: "nowrap" }}>
                + Add Time Slot
              </button>
            </div>

            {dayofSlots.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px", background: "#FFFCF7", borderRadius: 16, border: "1.5px dashed rgba(196,122,46,0.25)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🌅</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>No slots yet</h3>
                <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 16px", maxWidth: 300, marginLeft: "auto", marginRight: "auto" }}>
                  Add time slots for each part of your event day — photographer arrival, ceremony start, dinner, etc.
                </p>
                <button onClick={addSlot} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  + Add First Slot
                </button>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                {/* Vertical timeline line */}
                <div style={{ position: "absolute", left: 52, top: 0, bottom: 0, width: 2, background: "linear-gradient(180deg,#C47A2E,#CCAB4A,rgba(196,122,46,0.1))", borderRadius: 2 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {dayofSlots.map((slot, idx) => (
                    <div key={slot.id} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                      {/* Time + dot */}
                      <div style={{ width: 52, flexShrink: 0, textAlign: "right", paddingTop: 14 }}>
                        <input
                          type="time" value={slot.time}
                          onChange={e => updateSlot(slot.id, "time", e.target.value)}
                          style={{ width: "100%", border: "none", outline: "none", fontSize: 12, fontWeight: 700, color: "#C47A2E", background: "transparent", fontFamily: font, textAlign: "right", cursor: "pointer" }}
                        />
                      </div>
                      {/* Dot on line */}
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: slot.done ? "#22c55e" : "#C47A2E", border: "2.5px solid #F8F4EF", flexShrink: 0, marginTop: 14, zIndex: 1, boxShadow: `0 0 0 3px ${slot.done ? "rgba(34,197,94,0.2)" : "rgba(196,122,46,0.2)"}` }} />
                      {/* Card */}
                      <div style={{ flex: 1, background: slot.done ? "rgba(34,197,94,0.04)" : "#FFFCF7", borderRadius: 12, padding: "12px 16px", border: `1.5px solid ${slot.done ? "rgba(34,197,94,0.25)" : "rgba(196,122,46,0.14)"}`, opacity: slot.done ? 0.7 : 1 }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <button onClick={() => toggleSlot(slot.id)}
                            style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${slot.done ? "#22c55e" : "rgba(196,122,46,0.4)"}`, background: slot.done ? "#22c55e" : "#fff", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0, marginTop: 1 }}>
                            {slot.done ? "✓" : ""}
                          </button>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                            <input
                              value={slot.title} placeholder="e.g. Photographer arrives"
                              onChange={e => updateSlot(slot.id, "title", e.target.value)}
                              style={{ border: "none", outline: "none", fontSize: 14, fontWeight: 700, color: "#2C1A0E", fontFamily: font, background: "transparent", textDecoration: slot.done ? "line-through" : "none" }}
                            />
                            <input
                              value={slot.who} placeholder="Who's responsible? (optional)"
                              onChange={e => updateSlot(slot.id, "who", e.target.value)}
                              style={{ border: "none", outline: "none", fontSize: 12, color: "#9B7450", fontFamily: font, background: "transparent" }}
                            />
                          </div>
                          <button onClick={() => deleteSlot(slot.id)}
                            style={{ fontSize: 13, padding: "2px 6px", borderRadius: 6, border: "1.5px solid rgba(239,68,68,0.15)", background: "transparent", color: "#ef4444", cursor: "pointer", flexShrink: 0 }}>✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={addSlot}
                  style={{ marginTop: 16, marginLeft: 82, padding: "10px 20px", borderRadius: 10, border: "1.5px dashed rgba(196,122,46,0.35)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(196,122,46,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  + Add Another Slot
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ PLANNING TIMELINE TAB ══ */}
        {activeTab === "planning" && <>

        {/* Progress bar */}
        {total > 0 && (
          <div style={{ background: "#FFFCF7", borderRadius: 14, padding: "16px 20px", marginBottom: 24, border: "1.5px solid rgba(196,122,46,0.14)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{done} of {total} milestones done</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: pct === 100 ? "#15803d" : "#C47A2E" }}>{pct}%</span>
            </div>
            <div style={{ height: 8, background: "#EDE6D8", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "linear-gradient(90deg,#15803d,#22c55e)" : "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, transition: "width 0.4s" }} />
            </div>
          </div>
        )}

        {/* Action row: Edit/Preview toggle + Download */}
        {events.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginBottom: 18, justifyContent: "flex-end" }}>
            <button onClick={() => setPreview(p => !p)}
              style={{ padding: "8px 18px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              {preview ? "✏️ Edit" : "👁 Preview"}
            </button>
            <button onClick={downloadSlip} disabled={downloading}
              style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: downloading ? "#e5e7eb" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: downloading ? "#9ca3af" : "#fff", fontSize: 13, fontWeight: 700, cursor: downloading ? "not-allowed" : "pointer", fontFamily: font, boxShadow: downloading ? "none" : "0 3px 10px rgba(196,122,46,0.28)" }}>
              {downloading ? "Generating…" : "📄 Download Slip"}
            </button>
          </div>
        )}

        {/* ── PREVIEW MODE ── */}
        {preview ? (
          <div style={{ position: "relative", paddingLeft: 32 }}>
            {/* Vertical line */}
            <div style={{ position: "absolute", left: 11, top: 0, bottom: 0, width: 2, background: "linear-gradient(180deg,#C47A2E,#CCAB4A,rgba(196,122,46,0.1))", borderRadius: 2 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {events.map((event, i) => (
                <div key={event.id} style={{ position: "relative" }}>
                  {/* Dot */}
                  <div style={{ position: "absolute", left: -26, top: 14, width: 14, height: 14, borderRadius: "50%", background: event.checked ? "#22c55e" : "#C47A2E", border: "2.5px solid #F8F4EF", boxShadow: `0 0 0 3px ${event.checked ? "rgba(34,197,94,0.2)" : "rgba(196,122,46,0.2)"}` }} />
                  <div style={{ background: "#FFFCF7", borderRadius: 14, padding: "14px 18px", border: `1.5px solid ${event.checked ? "rgba(34,197,94,0.3)" : "rgba(196,122,46,0.14)"}`, opacity: event.checked ? 0.65 : 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="checkbox" checked={event.checked} onChange={() => toggleCheckbox(event.id)} style={{ width: 17, height: 17, accentColor: "#C47A2E", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", textDecoration: event.checked ? "line-through" : "none" }}>
                          {event.title || "Untitled milestone"}
                        </div>
                        {event.description && (
                          <div style={{ fontSize: 13, color: "#9B7450", marginTop: 3 }}>{event.description}</div>
                        )}
                        {/* Show vendor suggestions for service-related milestones */}
                        {!event.checked && (() => {
                          const svc = detectService(event.title);
                          return svc ? <VendorHint serviceType={svc} navigate={navigate} token={token} /> : null;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {events.length === 0 && (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "#9B7450", fontSize: 14 }}>No milestones yet — switch to Edit mode to add some.</div>
            )}
          </div>
        ) : (
          /* ── EDIT MODE ── */
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="timeline">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {events.map((event, index) => (
                    <Draggable key={event.id} draggableId={event.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            background: snapshot.isDragging ? "#FFF5E6" : "#FFFCF7",
                            borderRadius: 14, padding: "16px 18px",
                            border: `1.5px solid ${snapshot.isDragging ? "#C47A2E" : "rgba(196,122,46,0.15)"}`,
                            boxShadow: snapshot.isDragging ? "0 8px 24px rgba(196,122,46,0.18)" : "0 2px 8px rgba(139,69,19,0.05)",
                            ...provided.draggableProps.style,
                          }}
                        >
                          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            {/* Drag handle */}
                            <div {...provided.dragHandleProps} style={{ fontSize: 16, color: "rgba(196,122,46,0.4)", cursor: "grab", paddingTop: 2, flexShrink: 0, userSelect: "none" }}>⋮⋮</div>
                            {/* Step number */}
                            <span style={{ fontSize: 11, fontWeight: 800, color: "#C47A2E", background: "rgba(196,122,46,0.1)", borderRadius: 6, padding: "3px 8px", flexShrink: 0, marginTop: 1 }}>
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                              <input
                                type="text" placeholder="Milestone title…" value={event.title}
                                onChange={e => updateEvent(event.id, "title", e.target.value)}
                                style={{ ...inputStyle, fontWeight: 700 }}
                                onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                                onBlur={e => (e.target.style.borderColor = "rgba(196,122,46,0.22)")}
                              />
                              <input
                                type="text" placeholder="Description or notes (optional)…" value={event.description}
                                onChange={e => updateEvent(event.id, "description", e.target.value)}
                                style={{ ...inputStyle, fontSize: 13, color: "#9B7450" }}
                                onFocus={e => (e.target.style.borderColor = "#C9A84C")}
                                onBlur={e => (e.target.style.borderColor = "rgba(196,122,46,0.22)")}
                              />
                            </div>
                            <button
                              onClick={() => deleteEvent(event.id)}
                              style={{ fontSize: 14, padding: "4px 8px", borderRadius: 8, border: "1.5px solid rgba(239,68,68,0.2)", background: "transparent", color: "#ef4444", cursor: "pointer", flexShrink: 0 }}
                            >✕</button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* Empty state in edit mode */}
        {!preview && events.length === 0 && (
          <div style={{ textAlign: "center", padding: "56px 24px", background: "#FFFCF7", borderRadius: 16, border: "1.5px dashed rgba(196,122,46,0.25)", marginTop: 10 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗓️</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>No milestones yet</h3>
            <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 16px" }}>Add your first milestone to start building your timeline.</p>
            <button onClick={addEvent} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              + Add Milestone
            </button>
          </div>
        )}

        {/* Bottom add button — only in edit mode when items exist */}
        {!preview && events.length > 0 && (
          <button
            onClick={addEvent}
            style={{ marginTop: 16, width: "100%", padding: "12px", borderRadius: 12, border: "1.5px dashed rgba(196,122,46,0.35)", background: "transparent", color: "#C47A2E", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(196,122,46,0.05)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            + Add Another Milestone
          </button>
        )}
        </> /* end planning tab */}
      </div>

      {/* ── Hidden slip for PDF export ── */}
      <div ref={slipRef} style={{
        position: "fixed", top: "-9999px", left: "-9999px",
        width: 560, background: "#FFFCF5", fontFamily: "'Outfit', sans-serif", padding: "36px 40px 40px",
        borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.2)",
      }}>
        {/* Header */}
        <div style={{ borderBottom: "2px solid rgba(196,122,46,0.18)", paddingBottom: 18, marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", marginBottom: 6 }}>Tendr — Planning Tool</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#2C1A0E", marginBottom: 4 }}>Event Timeline</div>
          {total > 0 && (
            <div style={{ fontSize: 13, color: "#9B7450" }}>{done} of {total} milestones completed · {pct}% done</div>
          )}
          <div style={{ marginTop: 12, height: 6, background: "#EDE6D8", borderRadius: 100, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100 }} />
          </div>
        </div>

        {/* Milestones */}
        <div style={{ position: "relative", paddingLeft: 28 }}>
          <div style={{ position: "absolute", left: 7, top: 0, bottom: 0, width: 2, background: "linear-gradient(180deg,#C47A2E,rgba(196,122,46,0.15))", borderRadius: 2 }} />
          {events.map((ev, i) => (
            <div key={ev.id} style={{ position: "relative", marginBottom: 16 }}>
              <div style={{ position: "absolute", left: -25, top: 10, width: 12, height: 12, borderRadius: "50%", background: ev.checked ? "#22c55e" : "#C47A2E", border: "2px solid #FFFCF5" }} />
              <div style={{ background: "#fff", borderRadius: 10, padding: "12px 16px", border: `1.5px solid ${ev.checked ? "rgba(34,197,94,0.25)" : "rgba(196,122,46,0.14)"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 5, border: `2px solid ${ev.checked ? "#22c55e" : "rgba(196,122,46,0.4)"}`, background: ev.checked ? "#22c55e" : "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>
                    {ev.checked ? "✓" : ""}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", textDecoration: ev.checked ? "line-through" : "none", opacity: ev.checked ? 0.6 : 1 }}>
                      {ev.title || "Untitled milestone"}
                    </div>
                    {ev.description && <div style={{ fontSize: 12, color: "#9B7450", marginTop: 2 }}>{ev.description}</div>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 24, paddingTop: 14, borderTop: "1px solid rgba(196,122,46,0.12)", display: "flex", justifyContent: "space-between", fontSize: 11, color: "#bbb" }}>
          <span>tendr.co.in</span>
          <span>Generated {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400&family=Outfit:wght@400;600;700;800;900&display=swap');`}</style>
    </div>
  );
}
