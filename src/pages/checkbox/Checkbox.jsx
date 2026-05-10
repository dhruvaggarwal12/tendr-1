import React, { useState, useEffect } from "react";
import BasicSpeedDial from "../../components/BasicSpeedDial";

const font = "'Outfit', sans-serif";

const TEMPLATES = {
  birthday: {
    label: "Birthday Party",
    icon: "🎂",
    categories: [
      { name: "Planning & Booking", items: ["Set date and guest count", "Finalize budget", "Book venue", "Book caterer", "Book photographer", "Book DJ / musician"] },
      { name: "Venue & Decor", items: ["Confirm venue booking", "Plan seating arrangement", "Finalize decoration theme", "Book balloon / floral decorator", "Arrange photo booth setup", "Confirm lighting and ambience"] },
      { name: "Food & Catering", items: ["Finalize menu", "Confirm serving style (buffet / live counter)", "Order birthday cake", "Arrange beverages and mocktails", "Confirm serving staff count"] },
      { name: "Photography & Media", items: ["Share shot list with photographer", "Confirm videographer if needed", "Plan Reels / story content", "Setup backdrop for portraits"] },
      { name: "Entertainment", items: ["Finalize DJ set and playlist", "Plan games or activities for guests", "Arrange mic and sound system", "Plan surprise moment if any"] },
      { name: "Guests & Invites", items: ["Create final guest list", "Send WhatsApp invites", "Track RSVPs", "Arrange parking passes if needed"] },
      { name: "Day-of", items: ["Confirm vendor arrival times", "Do a final venue walkthrough", "Brief all vendor teams", "Enjoy!"] },
    ],
  },
  prewedding: {
    label: "Pre-Wedding Function",
    icon: "💍",
    categories: [
      { name: "Planning", items: ["Fix date and venue", "Finalize guest list", "Set budget", "Book all vendors"] },
      { name: "Venue & Decor", items: ["Book venue", "Choose theme (floral / festive / modern)", "Finalize draping and lighting", "Arrange entrance decor", "Organize sitting arrangement"] },
      { name: "Catering", items: ["Finalize menu (North Indian / fusion)", "Arrange welcome drinks", "Confirm live counters", "Arrange mithai and desserts"] },
      { name: "Entertainment & Music", items: ["Book DJ", "Plan sangeet / mehendi performances", "Arrange dhol / live music", "Plan special dance segment"] },
      { name: "Photography & Media", items: ["Brief photographer on must-have shots", "Pre-wedding shoot (if applicable)", "Arrange candid videographer", "Drone coverage if needed"] },
      { name: "Mehendi & Beauty", items: ["Book mehendi artist", "Arrange touch-up team for bride", "Setup beauty station if needed"] },
      { name: "Invites & Guests", items: ["Send e-invites", "WhatsApp wedding group", "RSVP tracking", "Arrange guest pick-up if needed"] },
    ],
  },
  wedding: {
    label: "Wedding Day",
    icon: "👰",
    categories: [
      { name: "Venue & Logistics", items: ["Final venue walkthrough", "Confirm mandap setup timing", "Arrange parking management", "Brief event coordinator", "Floral and décor final setup"] },
      { name: "Catering", items: ["Confirm head count with caterer", "Confirm menu", "Arrange cocktail/welcome area", "Confirm number of servers", "Arrange separate kids menu if needed"] },
      { name: "Photography & Media", items: ["Confirm photographer arrival time", "Brief on ceremony moments", "Drone coverage plan", "Live streaming setup if needed", "Same-day edit arrangements"] },
      { name: "Bridal & Groom Prep", items: ["Bridal makeup and hair", "Bridal outfit final fitting", "Groom outfit ironing/steaming", "Family outfits coordination"] },
      { name: "Ceremony", items: ["Pandit / priest confirmed", "Mandap setup complete", "Varmala and pheras sequence", "Ring ceremony if planned"] },
      { name: "Payments & Admin", items: ["All vendor balance payments ready", "Contracts filed", "Thank-you gifts for family", "Emergency fund in cash"] },
    ],
  },
  corporate: {
    label: "Corporate Event",
    icon: "🏢",
    categories: [
      { name: "Planning", items: ["Fix date, time and venue", "Define agenda and schedule", "Finalize budget", "Identify key stakeholders", "Create communication plan"] },
      { name: "Venue & Setup", items: ["Book conference hall / banquet", "Arrange AV equipment (projector, mics)", "Stage and podium setup", "Registration desk setup", "Branding and signage placement"] },
      { name: "Catering", items: ["Corporate breakfast / lunch menu", "Tea and coffee breaks", "Mocktails / welcome drinks", "Special dietary needs", "Confirm catering staff count"] },
      { name: "Speakers & Program", items: ["Confirm all speakers", "Collect speaker bios and presentations", "Prepare run-of-show document", "MC / emcee briefing", "Award or recognition ceremony prep"] },
      { name: "Guests & Invites", items: ["Send official invitations", "Track confirmations", "Prepare name badges", "Guest registration process", "VIP seating plan"] },
      { name: "Photography & Media", items: ["Book event photographer", "Press / media briefing if needed", "Social media live coverage plan", "Post-event photo sharing plan"] },
    ],
  },
  custom: {
    label: "Custom Event",
    icon: "✨",
    categories: [
      { name: "Planning", items: ["Set date and budget", "Finalize guest list", "Book key vendors"] },
      { name: "Venue & Decor", items: ["Book venue", "Finalize décor theme"] },
      { name: "Catering", items: ["Book caterer", "Finalize menu"] },
      { name: "Media", items: ["Book photographer"] },
      { name: "Guests", items: ["Send invitations", "Track RSVPs"] },
    ],
  },
};

const buildFromTemplate = (templateKey) => {
  const tpl = TEMPLATES[templateKey];
  return tpl.categories.map((cat, ci) => ({
    id: `cat_${ci}_${Date.now()}`,
    name: cat.name,
    items: cat.items.map((text, ii) => ({
      id: `item_${ci}_${ii}_${Date.now()}`,
      text,
      done: false,
    })),
  }));
};

export default function CheckBox() {
  const [templateKey, setTemplateKey] = useState("birthday");
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tendr_checklist_v2");
      if (raw) {
        const saved = JSON.parse(raw);
        setTemplateKey(saved.templateKey || "birthday");
        setCategories(saved.categories || []);
      } else {
        setCategories(buildFromTemplate("birthday"));
      }
    } catch { setCategories(buildFromTemplate("birthday")); }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("tendr_checklist_v2", JSON.stringify({ templateKey, categories }));
  }, [categories, templateKey, loaded]);

  const applyTemplate = (key) => {
    setTemplateKey(key);
    setCategories(buildFromTemplate(key));
  };

  const toggleItem = (catId, itemId) =>
    setCategories(prev => prev.map(c =>
      c.id !== catId ? c : { ...c, items: c.items.map(i => i.id !== itemId ? i : { ...i, done: !i.done }) }
    ));

  const updateItemText = (catId, itemId, text) =>
    setCategories(prev => prev.map(c =>
      c.id !== catId ? c : { ...c, items: c.items.map(i => i.id !== itemId ? i : { ...i, text }) }
    ));

  const deleteItem = (catId, itemId) =>
    setCategories(prev => prev.map(c =>
      c.id !== catId ? c : { ...c, items: c.items.filter(i => i.id !== itemId) }
    ));

  const addItem = (catId) =>
    setCategories(prev => prev.map(c =>
      c.id !== catId ? c : { ...c, items: [...c.items, { id: `item_${Date.now()}`, text: "", done: false }] }
    ));

  const addCategory = () =>
    setCategories(prev => [...prev, { id: `cat_${Date.now()}`, name: "New Category", items: [] }]);

  const updateCategoryName = (catId, name) =>
    setCategories(prev => prev.map(c => c.id !== catId ? c : { ...c, name }));

  const deleteCategory = (catId) =>
    setCategories(prev => prev.filter(c => c.id !== catId));

  const clearAll = () => {
    if (window.confirm("Clear all tasks and reset to template?")) applyTemplate(templateKey);
  };

  const total = categories.reduce((s, c) => s + c.items.length, 0);
  const done  = categories.reduce((s, c) => s + c.items.filter(i => i.done).length, 0);
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font, paddingBottom: 60 }}>
      <BasicSpeedDial />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", padding: "32px 40px 28px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Planning Tool</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Event Checklist</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", margin: 0 }}>Track every task for a perfectly planned event</p>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 20px" }}>

        {/* Template selector */}
        <div style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "20px 24px", marginBottom: 20, boxShadow: "0 2px 12px rgba(139,69,19,0.06)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Choose template</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(TEMPLATES).map(([key, tpl]) => (
              <button key={key} onClick={() => applyTemplate(key)}
                style={{ padding: "8px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600, fontFamily: font, cursor: "pointer", border: "1.5px solid", transition: "all 0.15s",
                  borderColor: templateKey === key ? "#C47A2E" : "rgba(196,122,46,0.2)",
                  background: templateKey === key ? "#C47A2E" : "#fff",
                  color: templateKey === key ? "#fff" : "#6B3A1F",
                }}>
                {tpl.icon} {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "20px 24px", marginBottom: 20, boxShadow: "0 2px 12px rgba(139,69,19,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E" }}>Overall Progress</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: pct === 100 ? "#15803d" : "#C47A2E" }}>{pct}%</span>
          </div>
          <div style={{ height: 10, background: "#f3e8d4", borderRadius: 100, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "linear-gradient(90deg,#15803d,#22c55e)" : "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ fontSize: 12, color: "#9B7450", marginTop: 6 }}>{done} of {total} tasks completed</div>
        </div>

        {/* Categories */}
        {categories.map((cat) => {
          const catDone = cat.items.filter(i => i.done).length;
          const catTotal = cat.items.length;
          return (
            <div key={cat.id} style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", marginBottom: 16, boxShadow: "0 2px 12px rgba(139,69,19,0.06)", overflow: "hidden" }}>
              {/* Category header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(196,122,46,0.1)", background: "rgba(196,122,46,0.04)" }}>
                <input
                  value={cat.name}
                  onChange={e => updateCategoryName(cat.id, e.target.value)}
                  style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", background: "transparent", border: "none", outline: "none", fontFamily: font, flex: 1 }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: catDone === catTotal && catTotal > 0 ? "#15803d" : "#9B7450" }}>
                    {catDone}/{catTotal}
                  </span>
                  <button onClick={() => deleteCategory(cat.id)}
                    style={{ background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>✕</button>
                </div>
              </div>

              {/* Items */}
              <div style={{ padding: "8px 0" }}>
                {cat.items.map((item) => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 20px", borderBottom: "1px solid rgba(196,122,46,0.06)", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(196,122,46,0.03)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <button
                      onClick={() => toggleItem(cat.id, item.id)}
                      style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${item.done ? "#C47A2E" : "rgba(196,122,46,0.3)"}`, background: item.done ? "#C47A2E" : "#fff", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, transition: "all 0.15s" }}>
                      {item.done ? "✓" : ""}
                    </button>
                    <input
                      value={item.text}
                      onChange={e => updateItemText(cat.id, item.id, e.target.value)}
                      placeholder="Task description..."
                      style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: font, fontSize: 14, color: item.done ? "#bbb" : "#2C1A0E", textDecoration: item.done ? "line-through" : "none", transition: "all 0.15s" }}
                    />
                    <button onClick={() => deleteItem(cat.id, item.id)}
                      style={{ background: "none", border: "none", color: "#ddd", cursor: "pointer", fontSize: 14, padding: 0, opacity: 0.7, flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>

              {/* Add task */}
              <button onClick={() => addItem(cat.id)}
                style={{ display: "flex", alignItems: "center", gap: 6, margin: "8px 20px 14px", padding: "6px 12px", borderRadius: 8, border: "1.5px dashed rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                + Add task
              </button>
            </div>
          );
        })}

        {/* Footer actions */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          <button onClick={addCategory}
            style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            + Add Category
          </button>
          <button onClick={clearAll}
            style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.15)", background: "#fff", color: "#9B7450", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            Reset to Template
          </button>
        </div>
      </div>
    </div>
  );
}
