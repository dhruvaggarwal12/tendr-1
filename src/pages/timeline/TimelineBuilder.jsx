import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import HamburgerNav from "../../components/HamburgerNav";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import SEO from "../../components/SEO";

const font = "'Outfit', sans-serif";

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: "1.5px solid rgba(196,122,46,0.22)", fontFamily: font,
  fontSize: 13.5, color: "#2C1A0E", background: "#FDFCF8", outline: "none",
  boxSizing: "border-box",
};

export default function TimelineBuilder() {
  const [events, setEvents] = useState([
    { id: "1", title: "Book venue", description: "Confirm availability and advance payment", checked: false },
    { id: "2", title: "Finalise vendors", description: "Photographer, caterer, decorator", checked: false },
    { id: "3", title: "Send invites", description: "WhatsApp and physical cards", checked: false },
  ]);
  const [preview, setPreview] = useState(false);

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

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font, paddingBottom: 60 }}>
      <SEO title="Custom Timeline Builder — Tendr" description="Build a custom event timeline with drag-and-drop milestones." path="/timeline" />
      <BasicSpeedDial />
      <HamburgerNav title="Timeline Builder" />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 20px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C47A2E", margin: "0 0 6px" }}>Planning Tool</p>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 6px" }}>
              Event Timeline
            </h1>
            <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Drag to reorder · tick off as you go</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => setPreview(v => !v)}
              style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: preview ? "#C47A2E" : "transparent", color: preview ? "#fff" : "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}
            >
              {preview ? "✏️ Edit" : "👁 Preview"}
            </button>
            {!preview && (
              <button
                onClick={addEvent}
                style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 3px 10px rgba(196,122,46,0.3)" }}
              >
                + Add Milestone
              </button>
            )}
          </div>
        </div>

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
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400&family=Outfit:wght@400;600;700;800;900&display=swap');`}</style>
    </div>
  );
}
