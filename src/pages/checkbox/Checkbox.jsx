import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setFilters } from "../../redux/listingFiltersSlice";
import { setCategoryBudgets } from "../../redux/eventPlanningSlice";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import HamburgerNav from "../../components/HamburgerNav";

// Budget ranges per service category (for vendor mini form slider)
const VENDOR_BUDGET_RANGES = {
  Caterer:      { min: 5000,  max: 500000, step: 5000,  def: 25000 },
  Decorator:    { min: 3000,  max: 300000, step: 3000,  def: 15000 },
  Photographer: { min: 3000,  max: 200000, step: 3000,  def: 15000 },
  DJ:           { min: 2000,  max: 100000, step: 2000,  def: 10000 },
};
const CITIES = ["Delhi", "Noida", "Greater Noida", "Ghaziabad"];
const fmtINR = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Map category names to service types
const CATEGORY_TO_SERVICE = {
  "photography": "Photographer", "photo": "Photographer", "videograph": "Photographer",
  "decoration": "Decorator",    "decor": "Decorator",
  "catering":   "Caterer",      "food": "Caterer", "caterer": "Caterer",
  "dj":         "DJ",           "music": "DJ", "entertainment": "DJ",
};
function detectService(name = "") {
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_TO_SERVICE)) {
    if (lower.includes(k)) return v;
  }
  return null;
}

// Vendor suggestion panel (reused from BudgetAllocator pattern)
function VendorPanel({ serviceType, catName, onClose }) {
  const navigate    = useNavigate();
  const [vendors, setVendors]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/vendors?serviceTypes[]=${serviceType}&limit=20`)
      .then(r => r.ok ? r.json() : { vendors: [] })
      .then(d => setVendors(d.vendors || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [serviceType]);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(28,10,0,0.45)", backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 401, width: "min(95vw, 640px)", height: "min(88vh, 680px)", background: "#FAF7F2", borderRadius: 20, boxShadow: "0 32px 80px rgba(28,10,0,0.2)", border: "1.5px solid rgba(196,122,46,0.2)", display: "flex", flexDirection: "column", fontFamily: font, overflow: "hidden" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(196,122,46,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FFFCF7", flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E", margin: 0 }}>{serviceType}s for "{catName}"</h3>
            <p style={{ fontSize: 12, color: "#9B7450", margin: "3px 0 0" }}>Vendors available for your event</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(196,122,46,0.1)", border: "none", color: "#9B7450", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3].map(i => <div key={i} style={{ height: 72, borderRadius: 12, background: "#EDE6D8", animation: "shimmer 1.4s infinite" }} />)}
            </div>
          ) : vendors.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#9B7450" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
              <p>No vendors found yet. Add vendors from the admin dashboard.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {vendors.map(v => (
                <div key={v._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "#FFFCF7", border: "1.5px solid rgba(196,122,46,0.12)" }}>
                  <img src={v.image || v.portfolioPhotos?.[0] || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=80&q=60"} alt={v.name} style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E" }}>{v.name}</div>
                    <div style={{ fontSize: 12, color: "#9B7450" }}>{v.serviceType} · {v.address?.city || ""}</div>
                    {v.price && <div style={{ fontSize: 13, fontWeight: 700, color: "#C47A2E" }}>₹{Number(v.price).toLocaleString("en-IN")}+</div>}
                  </div>
                  <button onClick={() => { onClose(); navigate(`/vendor/${v._id}`); }}
                    style={{ padding: "8px 14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: "12px 18px", borderTop: "1px solid rgba(196,122,46,0.1)", background: "#FFFCF7", flexShrink: 0 }}>
          <button onClick={() => { onClose(); navigate("/listings"); }}
            style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            Browse All {serviceType}s →
          </button>
        </div>
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      </div>
    </>
  );
}

const font = "'Outfit', sans-serif";

const TEMPLATES = {
  birthday: {
    label: "Birthday Party",
    icon: "🎂",
    categories: [
      { name: "📋 Must Do", items: ["Set budget", "Create guest list", "Select venue", "Send invitations", "Track RSVPs", "Order cake", "Arrange food & drinks"] },
      { name: "⭐ Recommended", items: ["Book decorator", "Book photographer", "Choose party theme", "Arrange seating"] },
      { name: "🎁 Nice to Have", items: ["Return gifts", "Entertainment / Games", "Customized backdrop", "Photo booth"] },
    ],
  },
  prewedding: {
    label: "Pre-Wedding Function",
    icon: "💍",
    categories: [
      { name: "📋 Must Do", items: ["Set budget", "Fix date and venue", "Finalize guest list", "Send invitations", "Track RSVPs", "Book caterer"] },
      { name: "⭐ Recommended", items: ["Book decorator", "Book photographer / videographer", "Book DJ or live music", "Book mehendi artist", "Plan performances (sangeet / dance)"] },
      { name: "🎁 Nice to Have", items: ["Drone coverage", "Pre-wedding shoot", "Welcome kits for guests", "Custom stage backdrop"] },
    ],
  },
  wedding: {
    label: "Wedding",
    icon: "💒",
    categories: [
      { name: "📋 Must Do", items: ["Set budget", "Finalize wedding date", "Book venue", "Book caterer", "Create guest list", "Send invitations", "Track RSVPs", "Arrange transportation", "Finalize menu"] },
      { name: "⭐ Recommended", items: ["Book photographer / videographer", "Book decorator", "Book makeup artist", "Arrange accommodation for guests", "Wedding website / invitation page"] },
      { name: "🎁 Nice to Have", items: ["Pre-wedding shoot", "Live streaming", "Customized gifts / favors", "Guest welcome kits", "Digital guestbook"] },
    ],
  },
  anniversary: {
    label: "Anniversary",
    icon: "💕",
    categories: [
      { name: "📋 Must Do", items: ["Decide celebration style", "Set budget", "Select venue / restaurant", "Invite guests", "Order cake"] },
      { name: "⭐ Recommended", items: ["Decorations", "Photographer", "Gift planning", "Special dining setup"] },
      { name: "🎁 Nice to Have", items: ["Memory slideshow", "Couple photoshoot", "Personalized gifts", "Live music"] },
    ],
  },
  corporate: {
    label: "Corporate Event",
    icon: "🏢",
    categories: [
      { name: "📋 Must Do", items: ["Define objective", "Set budget", "Book venue", "Confirm attendee count", "Arrange AV equipment", "Finalize agenda", "Arrange catering"] },
      { name: "⭐ Recommended", items: ["Speaker management", "Branding materials", "Registration desk", "Event photographer"] },
      { name: "🎁 Nice to Have", items: ["Event merchandise", "Networking lounge", "Employee awards", "Feedback kiosk", "Live event streaming"] },
    ],
  },
  party: {
    label: "Party / Get-together",
    icon: "🎉",
    categories: [
      { name: "📋 Must Do", items: ["Create guest list", "Select venue", "Arrange food & drinks", "Send invitations"] },
      { name: "⭐ Recommended", items: ["Decorations", "Music / Playlist", "Seating arrangement"] },
      { name: "🎁 Nice to Have", items: ["Games & activities", "Theme-based decor", "Photo corner", "Customized party favors"] },
    ],
  },
  custom: {
    label: "Custom Event",
    icon: "✨",
    categories: [
      { name: "📋 Must Do", items: ["Define event purpose", "Set budget", "Select venue", "Create guest list", "Send invitations", "Arrange required vendors"] },
      { name: "⭐ Recommended", items: ["Decorations", "Photographer", "Event coordinator", "Transportation planning"] },
      { name: "🎁 Nice to Have", items: ["Personalized branding", "Event souvenirs", "Special entertainment", "Social media coverage"] },
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
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const routeTemplateKey = location.state?.templateKey;  // from CheckboxPicker step 2
  const customMode       = location.state?.customMode === true; // blank custom checklist

  const [vendorPanel, setVendorPanel] = useState(null);
  // Vendor mini form (shown when clicking Find Vendors category)
  const [vendorFormOpen, setVendorFormOpen] = useState(false);
  const [vendorFormService, setVendorFormService] = useState(null); // "Caterer" | "Decorator" etc.
  const [vendorForm, setVendorForm] = useState({ eventType: "", city: "", date: "", budget: 25000 });
  const openVendorForm = (svc) => {
    const range = VENDOR_BUDGET_RANGES[svc];
    setVendorFormService(svc);
    setVendorForm({ eventType: "", city: "", date: "", budget: range.def });
    setVendorFormOpen(true);
  };
  const submitVendorForm = (e) => {
    e.preventDefault();
    dispatch(setFilters({ serviceType: vendorFormService, eventType: vendorForm.eventType, locationType: vendorForm.city, date: vendorForm.date }));
    dispatch(setCategoryBudgets({ [vendorFormService]: vendorForm.budget }));
    setVendorFormOpen(false);
    navigate(`/listings?serviceType=${vendorFormService}`, {
      state: { fromChecklist: true, budgetMax: vendorForm.budget, fromBudgetAllocator: true },
    });
  };
  const [checklistSaved, setChecklistSaved] = useState(() => { try { return localStorage.getItem("tendr_checklist_saved") === "true"; } catch { return false; } });
  const [templateKey, setTemplateKey] = useState(routeTemplateKey || "birthday");
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const TTL_7D = 7 * 24 * 60 * 60 * 1000;

  useEffect(() => {
    if (customMode) {
      // Custom: start completely blank
      setTemplateKey("custom");
      setCategories([]);
      setLoaded(true);
      return;
    }
    if (routeTemplateKey) {
      // Coming from picker with chosen event type
      setTemplateKey(routeTemplateKey);
      setCategories(buildFromTemplate(routeTemplateKey));
      setLoaded(true);
      return;
    }
    // Restore from localStorage if no route state
    try {
      const raw = localStorage.getItem("tendr_checklist_v2");
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.__expiresAt && Date.now() > saved.__expiresAt) {
          localStorage.removeItem("tendr_checklist_v2");
          setCategories(buildFromTemplate("birthday"));
        } else {
          setTemplateKey(saved.templateKey || "birthday");
          setCategories(saved.categories || []);
        }
      } else {
        setCategories(buildFromTemplate("birthday"));
      }
    } catch { setCategories(buildFromTemplate("birthday")); }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("tendr_checklist_v2", JSON.stringify({ templateKey, categories, __expiresAt: Date.now() + TTL_7D }));
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

  const saveChecklist = () => {
    try { localStorage.setItem("tendr_checklist_saved", "true"); } catch {}
    setChecklistSaved(true);
    window.dispatchEvent(new CustomEvent("tendr:checklist-saved"));
  };

  const total = categories.reduce((s, c) => s + c.items.length, 0);
  const done  = categories.reduce((s, c) => s + c.items.filter(i => i.done).length, 0);
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

  const tpl = TEMPLATES[templateKey];

  return (
    <div style={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", background: "#F8F4EF", fontFamily: font }}>
      <SEO title="Event Checklist — Tendr" description="Track every task for a perfectly planned event." path="/prebuilt-checklist" />
      <BasicSpeedDial />
      <div style={{ flexShrink: 0 }}><HamburgerNav active="Browse" /></div>
      {vendorPanel && <VendorPanel serviceType={vendorPanel.serviceType} catName={vendorPanel.catName} onClose={() => setVendorPanel(null)} />}

      {/* Fixed top: header + progress */}
      <div style={{ flexShrink: 0 }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", padding: "14px 24px" }}>
          <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => navigate("/checklist-picker")}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, flexShrink: 0, backdropFilter: "blur(4px)" }}>
              ← Back
            </button>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Event Checklist</div>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.01em" }}>
                {customMode ? "✏️ Custom Checklist" : `${tpl?.icon || ""} ${tpl?.label || ""} Checklist`}
              </h1>
            </div>
          </div>
        </div>

        {/* Progress ring — fixed */}
        <div style={{ background: "#FFFCF5", borderBottom: "1px solid rgba(196,122,46,0.12)", padding: "14px 24px", boxShadow: "0 2px 8px rgba(139,69,19,0.06)" }}>
          <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", alignItems: "center", gap: 20 }}>
            {(() => {
              const r = 30, circ = 2 * Math.PI * r;
              const dash = (pct / 100) * circ;
              const ringColor = pct === 100 ? "#22c55e" : pct >= 60 ? "#C47A2E" : "#CCAB4A";
              return (
                <div style={{ flexShrink: 0, position: "relative", width: 76, height: 76 }}>
                  <svg width="76" height="76" viewBox="0 0 76 76">
                    <circle cx="38" cy="38" r={r} fill="none" stroke="#f3e8d4" strokeWidth="6" />
                    <circle cx="38" cy="38" r={r} fill="none" stroke={ringColor} strokeWidth="6"
                      strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                      style={{ transformOrigin: "50% 50%", transform: "rotate(-90deg)", transition: "stroke-dasharray 0.5s ease" }} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: ringColor, lineHeight: 1 }}>{pct}%</span>
                    {pct === 100 && <span style={{ fontSize: 12 }}>🎉</span>}
                  </div>
                </div>
              );
            })()}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", marginBottom: 2 }}>
                {pct === 100 ? "All done — great work! 🎉" : "Overall Progress"}
              </div>
              <div style={{ fontSize: 13, color: "#9B7450", marginBottom: 6 }}>{done} of {total} tasks completed · {total - done} remaining</div>
              <div style={{ height: 5, background: "#f3e8d4", borderRadius: 100, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "linear-gradient(90deg,#15803d,#22c55e)" : "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, transition: "width 0.4s" }} />
              </div>
            </div>
            {/* Save button */}
            <button onClick={saveChecklist}
              style={{ flexShrink: 0, padding: "8px 16px", borderRadius: 10, border: checklistSaved ? "1.5px solid #22c55e" : "1.5px solid rgba(196,122,46,0.3)", background: checklistSaved ? "rgba(34,197,94,0.08)" : "#fff", color: checklistSaved ? "#15803d" : "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              {checklistSaved ? "✓ Saved" : "💾 Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable tasks area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 40px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>

        {/* Custom mode empty state */}
        {customMode && categories.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px", background: "#FFFCF5", borderRadius: 16, border: "2px dashed rgba(196,122,46,0.2)", marginBottom: 20 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✏️</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>Your blank checklist is ready</h3>
            <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 20px", lineHeight: 1.6 }}>
              Click <strong>"+ Add Category"</strong> below to create your first section (e.g. "Venue", "Catering").<br />
              Then add individual tasks inside each section.
            </p>
            <button onClick={addCategory}
              style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}>
              + Add First Category
            </button>
          </div>
        )}

        {/* Categories */}
        {categories.map((cat) => {
          const catDone = cat.items.filter(i => i.done).length;
          const catTotal = cat.items.length;
          return (
            <div key={cat.id} style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", marginBottom: 16, boxShadow: "0 2px 12px rgba(139,69,19,0.06)", overflow: "hidden" }}>
              {/* Category header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid rgba(196,122,46,0.1)", background: catDone === catTotal && catTotal > 0 ? "rgba(34,197,94,0.04)" : "rgba(196,122,46,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  {/* Mini ring */}
                  {catTotal > 0 && (() => {
                    const catPct = Math.round((catDone / catTotal) * 100);
                    const r = 10, circ = 2 * Math.PI * r;
                    const ringColor = catDone === catTotal ? "#22c55e" : "#C47A2E";
                    return (
                      <svg width="28" height="28" viewBox="0 0 28 28" style={{ flexShrink: 0 }}>
                        <circle cx="14" cy="14" r={r} fill="none" stroke="#f3e8d4" strokeWidth="3.5" />
                        <circle cx="14" cy="14" r={r} fill="none" stroke={ringColor} strokeWidth="3.5"
                          strokeDasharray={`${(catPct / 100) * circ} ${circ}`} strokeLinecap="round"
                          style={{ transformOrigin: "50% 50%", transform: "rotate(-90deg)", transition: "stroke-dasharray 0.4s" }} />
                      </svg>
                    );
                  })()}
                  <input
                    value={cat.name}
                    onChange={e => updateCategoryName(cat.id, e.target.value)}
                    style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E", background: "transparent", border: "none", outline: "none", fontFamily: font, flex: 1 }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  {/* See Vendors button — only for service-related categories */}
                  {(() => {
                    const svc = detectService(cat.name);
                    return svc ? (
                      <button onClick={() => setVendorPanel({ serviceType: svc, catName: cat.name })}
                        style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", cursor: "pointer", fontFamily: font, whiteSpace: "nowrap" }}>
                        See Vendors →
                      </button>
                    ) : null;
                  })()}
                  <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
                    background: catDone === catTotal && catTotal > 0 ? "rgba(34,197,94,0.12)" : "rgba(196,122,46,0.1)",
                    color: catDone === catTotal && catTotal > 0 ? "#15803d" : "#C47A2E" }}>
                    {catDone}/{catTotal}
                  </span>
                  <button onClick={() => deleteCategory(cat.id)}
                    style={{ background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: 15, padding: 0, lineHeight: 1 }}>✕</button>
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
          {!customMode && (
            <button onClick={clearAll}
              style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.15)", background: "#fff", color: "#9B7450", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
              Reset to Template
            </button>
          )}
          <button onClick={() => navigate("/checklist-picker")}
            style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.15)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            ← Change Event Type
          </button>
        </div>

        {/* ── Find Vendors section ── */}
        <div style={{ marginTop: 32, padding: "24px", background: "#FFFCF5", borderRadius: 18, border: "1.5px solid rgba(196,122,46,0.18)", boxShadow: "0 2px 12px rgba(139,69,19,0.06)" }}>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: "#2C1A0E", margin: "0 0 4px" }}>🛍️ Find Vendors</h3>
          <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 18px" }}>Set your budget and browse verified vendors for your event.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {Object.entries(VENDOR_BUDGET_RANGES).map(([svc, range]) => (
              <button key={svc} onClick={() => openVendorForm(svc)}
                style={{ padding: "14px 10px", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.18)", background: "#fff", cursor: "pointer", fontFamily: font, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#C47A2E"; e.currentTarget.style.boxShadow = "0 4px 14px rgba(196,122,46,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(196,122,46,0.18)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <span style={{ fontSize: 24 }}>{svc === "Caterer" ? "🍽️" : svc === "Decorator" ? "🎀" : svc === "Photographer" ? "📸" : "🎵"}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E" }}>{svc === "Photographer" ? "Photography" : svc}</span>
                <span style={{ fontSize: 10, color: "#9B7450" }}>from {fmtINR(range.min)}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
      </div>

      {/* ── Vendor mini form modal ── */}
      {vendorFormOpen && vendorFormService && (() => {
        const range = VENDOR_BUDGET_RANGES[vendorFormService];
        return (
          <>
            <div onClick={() => setVendorFormOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9998, backdropFilter: "blur(3px)" }} />
            <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 9999, background: "#FFFCF5", borderRadius: 20, width: "min(95vw,440px)", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", fontFamily: font, overflow: "hidden" }}>
              <div style={{ padding: "16px 22px 12px", borderBottom: "1px solid rgba(196,122,46,0.12)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                  {vendorFormService === "Caterer" ? "🍽️" : vendorFormService === "Decorator" ? "🎀" : vendorFormService === "Photographer" ? "📸" : "🎵"} Find {vendorFormService === "Photographer" ? "Photographers" : vendorFormService + "s"}
                </div>
                <p style={{ fontSize: 11.5, color: "#9B7450", margin: 0 }}>3 quick questions + your budget</p>
              </div>
              <form onSubmit={submitVendorForm} style={{ padding: "16px 22px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Event Type */}
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B3A1F", marginBottom: 4 }}>Event Type *</label>
                  <select required value={vendorForm.eventType} onChange={e => setVendorForm(p => ({ ...p, eventType: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", background: "#fff" }}>
                    <option value="">Select event type</option>
                    {["Birthday", "Wedding", "Anniversary", "Pre Wedding", "Corporate Event", "Party / Get-together", "Others"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {/* City */}
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B3A1F", marginBottom: 4 }}>City *</label>
                  <select required value={vendorForm.city} onChange={e => setVendorForm(p => ({ ...p, city: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", background: "#fff" }}>
                    <option value="">Select city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {/* Date */}
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#6B3A1F", marginBottom: 4 }}>Event Date *</label>
                  <input required type="date" value={vendorForm.date} min={new Date().toISOString().split("T")[0]}
                    onChange={e => setVendorForm(p => ({ ...p, date: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }} />
                </div>
                {/* Budget slider */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#6B3A1F" }}>{vendorFormService} Budget</label>
                    <span style={{ fontSize: 14, fontWeight: 900, color: "#C47A2E" }}>{fmtINR(vendorForm.budget)}</span>
                  </div>
                  <input type="range" min={range.min} max={range.max} step={range.step} value={vendorForm.budget}
                    onChange={e => setVendorForm(p => ({ ...p, budget: Number(e.target.value) }))}
                    style={{ width: "100%", accentColor: "#C47A2E", cursor: "pointer", height: 4 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#bbb", marginTop: 2 }}>
                    <span>{fmtINR(range.min)}</span><span>{fmtINR(range.max)}</span>
                  </div>
                </div>
                <button type="submit"
                  style={{ width: "100%", marginTop: 2, padding: "12px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}>
                  Browse {vendorFormService === "Photographer" ? "Photographers" : vendorFormService + "s"} →
                </button>
              </form>
            </div>
          </>
        );
      })()}
    </div>
  );
}
