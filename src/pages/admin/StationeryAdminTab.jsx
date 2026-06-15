import React, { useState, useEffect, useRef } from "react";
import {
  getStationeryProducts,
  saveStationeryProducts,
  DEFAULT_STATIONERY,
  STATIONERY_CATEGORIES,
} from "../stationery/stationeryProducts";

const font = "'Outfit', sans-serif";

const EMPTY = {
  id: "",
  name: "",
  category: "Itinerary",
  tagline: "",
  startingPrice: "",
  priceRange: "",
  priceOnRequest: false,
  unit: "per piece",
  description: "",
  features: [],
  images: [],
  available: true,
};

export default function StationeryAdminTab() {
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState("list"); // "list" | "add" | "edit"
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [featureInput, setFeatureInput] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => { setItems(getStationeryProducts()); }, []);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const openAdd = () => {
    setForm({ ...EMPTY, id: `st-${Date.now()}` });
    setFeatureInput(""); setEditing(null); setMode("add");
  };
  const openEdit = (item) => {
    setForm({ ...EMPTY, ...item });
    setFeatureInput(""); setEditing(item.id); setMode("edit");
  };

  const handleSave = () => {
    if (!form.name.trim()) { alert("Name is required."); return; }
    if (!form.priceOnRequest && !form.priceRange && !form.startingPrice) {
      alert("Set a price, price range, or mark as price-on-request."); return;
    }
    const slug = form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const item = {
      ...form,
      id: editing || slug,
      startingPrice: form.priceOnRequest ? 0 : Number(form.startingPrice) || 0,
    };
    const updated = editing
      ? items.map((p) => (p.id === editing ? item : p))
      : [...items, item];
    saveStationeryProducts(updated);
    setItems(updated);
    setMode("list");
  };

  const toggleAvail = (id) => {
    const updated = items.map((p) => (p.id === id ? { ...p, available: !p.available } : p));
    saveStationeryProducts(updated);
    setItems(updated);
  };

  const deleteItem = (id) => {
    if (!window.confirm("Delete this stationery item?")) return;
    const updated = items.filter((p) => p.id !== id);
    saveStationeryProducts(updated);
    setItems(updated);
  };

  const resetToDefaults = () => {
    if (!window.confirm("Reset all items to the default catalogue? Any custom items will be lost.")) return;
    saveStationeryProducts(DEFAULT_STATIONERY);
    setItems(DEFAULT_STATIONERY);
  };

  const addFeature = () => {
    const val = featureInput.trim();
    if (val && !form.features.includes(val)) {
      set("features", [...form.features, val]);
      setFeatureInput("");
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        set("images", (prev) => {
          // Use functional update pattern via setForm directly
          return prev;
        });
        setForm((p) => ({ ...p, images: [...(p.images || []), ev.target.result] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  };

  const getPriceDisplay = (item) => {
    if (item.priceOnRequest) return "Price on request";
    if (item.priceRange) return item.priceRange;
    return `₹${Number(item.startingPrice).toLocaleString("en-IN")}`;
  };

  // Group items by category for list view
  const grouped = STATIONERY_CATEGORIES.reduce((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {});

  if (mode === "list") return (
    <div style={{ padding: "28px 24px", fontFamily: font }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#2C1A0E", margin: "0 0 4px" }}>💍 Wedding Stationery</h2>
          <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Edit items and upload images — changes reflect live on the Wedding Stationery page.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={resetToDefaults} style={{ padding: "8px 16px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            Reset to defaults
          </button>
          <button onClick={openAdd} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            + Add Item
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#9B7450", background: "#FFFCF5", borderRadius: 16, border: "1.5px dashed rgba(196,122,46,0.2)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>💍</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", marginBottom: 6 }}>No stationery items yet</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>Add items above or reset to load the default catalogue.</div>
        </div>
      )}

      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat} style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, paddingBottom: 8, borderBottom: "1.5px solid rgba(196,122,46,0.12)" }}>
            {cat}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {catItems.map((item) => (
              <div key={item.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.12)", overflow: "hidden", boxShadow: "0 2px 10px rgba(44,26,14,0.05)" }}>
                {/* Thumbnail */}
                <div style={{ height: 100, overflow: "hidden", position: "relative", background: "#f0e8dc" }}>
                  {item.images?.[0]
                    ? <img src={item.images[0]} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#C47A2E", opacity: 0.4, fontSize: 28 }}>💍</div>
                  }
                  <div style={{ position: "absolute", top: 7, right: 7 }}>
                    <span style={{ background: item.available ? "#15803d" : "#9ca3af", color: "#fff", borderRadius: 100, fontSize: 9, fontWeight: 700, padding: "2px 8px" }}>
                      {item.available ? "Live" : "Hidden"}
                    </span>
                  </div>
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", marginBottom: 1 }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: "#C47A2E", fontWeight: 700, marginBottom: 8 }}>{getPriceDisplay(item)} + printing & delivery</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    <button onClick={() => toggleAvail(item.id)} style={{ fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 7, border: "1.5px solid rgba(196,122,46,0.22)", background: item.available ? "#fff5f5" : "#f0fdf4", color: item.available ? "#c0392b" : "#15803d", cursor: "pointer", fontFamily: font }}>
                      {item.available ? "Hide" : "Show"}
                    </button>
                    <button onClick={() => openEdit(item)} style={{ fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 7, border: "1.5px solid rgba(196,122,46,0.22)", background: "#fff", color: "#6B3A1F", cursor: "pointer", fontFamily: font }}>Edit</button>
                    <button onClick={() => deleteItem(item.id)} style={{ fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 7, border: "1px solid #fca5a5", background: "#fff5f5", color: "#c0392b", cursor: "pointer", fontFamily: font }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Items with "Other" category not in main groups */}
      {items.filter(i => !STATIONERY_CATEGORIES.includes(i.category)).length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, paddingBottom: 8, borderBottom: "1.5px solid rgba(196,122,46,0.12)" }}>Other</div>
        </div>
      )}
    </div>
  );

  // ── Add / Edit form ──
  return (
    <div style={{ padding: "24px", fontFamily: font, maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => setMode("list")} style={{ background: "none", border: "none", color: "#C47A2E", fontSize: 14, fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: font }}>← Back</button>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#2C1A0E", margin: 0 }}>{editing ? "Edit Item" : "Add Stationery Item"}</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Name *">
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. A5 Leaf Itinerary" style={inputStyle} />
          </Field>

          <Field label="Category">
            <select value={form.category} onChange={(e) => set("category", e.target.value)} style={inputStyle}>
              {STATIONERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Tagline">
            <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Short description shown on card" style={inputStyle} />
          </Field>

          {/* Pricing */}
          <div style={{ background: "rgba(196,122,46,0.04)", border: "1.5px solid rgba(196,122,46,0.12)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#5a3a1a", marginBottom: 10 }}>Pricing</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div
                onClick={() => set("priceOnRequest", !form.priceOnRequest)}
                style={{ width: 36, height: 20, borderRadius: 100, background: form.priceOnRequest ? "#C47A2E" : "#e5e7eb", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}
              >
                <div style={{ position: "absolute", top: 2, left: form.priceOnRequest ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </div>
              <span style={{ fontSize: 12, color: "#5a3a1a", fontWeight: 600 }}>Price on request (no fixed price)</span>
            </div>
            {!form.priceOnRequest && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Starting Price (₹)">
                  <input type="number" value={form.startingPrice} onChange={(e) => set("startingPrice", e.target.value)} placeholder="650" style={inputStyle} />
                </Field>
                <Field label="Price Range (optional)">
                  <input value={form.priceRange || ""} onChange={(e) => set("priceRange", e.target.value)} placeholder="₹799 – ₹1,999" style={inputStyle} />
                </Field>
              </div>
            )}
          </div>

          <Field label="Unit">
            <input value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="per piece" style={inputStyle} />
          </Field>

          <Field label="Description">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="What's included, customisation details..." style={{ ...inputStyle, resize: "vertical" }} />
          </Field>

          <Field label="Features / What's Included">
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} placeholder="Add feature and press Enter" style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
              <button onClick={addFeature} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#C47A2E", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: font }}>+</button>
            </div>
            {form.features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#3D2210", flex: 1 }}>• {f}</span>
                <button onClick={() => set("features", form.features.filter((_, fi) => fi !== i))} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: 14 }}>×</button>
              </div>
            ))}
          </Field>

          {/* Image Upload */}
          <Field label="Images">
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{ border: "2px dashed rgba(196,122,46,0.3)", borderRadius: 10, padding: "16px", textAlign: "center", cursor: "pointer", background: "rgba(196,122,46,0.03)", marginBottom: 10, transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(196,122,46,0.07)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(196,122,46,0.03)"}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>📷</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#C47A2E" }}>Click to upload images</div>
              <div style={{ fontSize: 10, color: "#9B7450" }}>JPG, PNG, WEBP — multiple allowed</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            {(form.images || []).length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {form.images.map((src, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img src={src} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.2)" }} />
                    <button onClick={() => removeImage(i)} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#c0392b", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => set("available", !form.available)} style={{ width: 40, height: 22, borderRadius: 100, background: form.available ? "#C47A2E" : "#e5e7eb", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: form.available ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
            </div>
            <span style={{ fontSize: 13, color: "#5a3a1a", fontWeight: 600 }}>{form.available ? "Visible on Wedding Stationery page" : "Hidden from customers"}</span>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={() => setMode("list")} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#9B7450", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Cancel</button>
            <button onClick={handleSave} style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
              {editing ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div style={{ position: "sticky", top: 24, height: "fit-content" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Live Preview</div>
          <div style={{ background: "#FFFCF7", borderRadius: 14, overflow: "hidden", border: "1.5px solid rgba(201,168,76,0.18)", boxShadow: "0 3px 14px rgba(139,90,20,0.07)", maxWidth: 240, fontFamily: font }}>
            <div style={{ height: 150, background: "#f0e8dc", overflow: "hidden" }}>
              {form.images?.[0]
                ? <img src={form.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#C47A2E", opacity: 0.4, fontSize: 32 }}>💍</div>}
            </div>
            <div style={{ padding: "14px 16px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{form.category}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1C1208", fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: 4 }}>{form.name || "Item Name"}</div>
              <div style={{ fontSize: 11, color: "#9B7450", marginBottom: 12, lineHeight: 1.4 }}>{form.tagline || "Tagline"}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#C9A84C", marginBottom: 2 }}>
                {form.priceOnRequest ? "Price on request" : form.priceRange || (form.startingPrice ? `₹${Number(form.startingPrice).toLocaleString("en-IN")}` : "—")}
              </div>
              <div style={{ fontSize: 9, color: "#9B7450" }}>+ printing & delivery charges</div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@400;600;700&display=swap');`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#5a3a1a", display: "block", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 10,
  border: "1.5px solid rgba(196,122,46,0.22)",
  fontSize: 13,
  fontFamily: "'Outfit', sans-serif",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
  color: "#1a1a1a",
  marginBottom: 0,
};
