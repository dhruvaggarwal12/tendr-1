import React, { useState, useEffect } from "react";
import {
  getStationeryProducts,
  saveStationeryProducts,
  STATIONERY_CATEGORIES,
} from "../stationery/stationeryProducts";

const font = "'Outfit', sans-serif";

const EMPTY = {
  id: "",
  name: "",
  category: "Invitation",
  tagline: "",
  startingPrice: "",
  unit: "per piece",
  description: "",
  features: [],
  images: [""],
  available: true,
};

export default function StationeryAdminTab() {
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState("list"); // "list" | "add" | "edit"
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [featureInput, setFeatureInput] = useState("");
  const [imageInput, setImageInput] = useState("");

  useEffect(() => { setItems(getStationeryProducts()); }, []);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const openAdd = () => {
    setForm({ ...EMPTY, id: `st-${Date.now()}` });
    setFeatureInput(""); setImageInput(""); setEditing(null); setMode("add");
  };
  const openEdit = (item) => {
    setForm({ ...item });
    setFeatureInput(""); setImageInput(""); setEditing(item.id); setMode("edit");
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.startingPrice) {
      alert("Name and starting price are required.");
      return;
    }
    const slug = form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const item = { ...form, id: editing || slug, startingPrice: Number(form.startingPrice) };
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

  const addFeature = () => {
    const val = featureInput.trim();
    if (val && !form.features.includes(val)) {
      set("features", [...form.features, val]);
      setFeatureInput("");
    }
  };

  const addImage = () => {
    const val = imageInput.trim();
    if (val) { set("images", [...(form.images || []).filter(Boolean), val]); setImageInput(""); }
  };

  if (mode === "list") return (
    <div style={{ padding: "28px 24px", fontFamily: font }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#2C1A0E", margin: "0 0 4px" }}>💍 Wedding Stationery</h2>
          <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Upload stationery items here — they appear live on the Wedding Stationery page.</p>
        </div>
        <button onClick={openAdd} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
          + Add Item
        </button>
      </div>

      {items.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#9B7450", background: "#FFFCF5", borderRadius: 16, border: "1.5px dashed rgba(196,122,46,0.2)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>💍</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", marginBottom: 6 }}>No stationery items yet</div>
          <div style={{ fontSize: 13 }}>Add items above — they'll appear on the Wedding Stationery page.</div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {items.map((item) => (
          <div key={item.id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.12)", overflow: "hidden", boxShadow: "0 2px 10px rgba(44,26,14,0.06)" }}>
            <div style={{ height: 120, overflow: "hidden", position: "relative" }}>
              <img
                src={item.images?.[0] || "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&q=60"}
                alt={item.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 5 }}>
                <span style={{ background: item.available ? "#15803d" : "#9ca3af", color: "#fff", borderRadius: 100, fontSize: 9, fontWeight: 700, padding: "2px 8px" }}>
                  {item.available ? "Live" : "Hidden"}
                </span>
                <span style={{ background: "rgba(201,168,76,0.9)", color: "#fff", borderRadius: 100, fontSize: 9, fontWeight: 700, padding: "2px 8px" }}>
                  {item.category}
                </span>
              </div>
            </div>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", marginBottom: 2 }}>{item.name}</div>
              <div style={{ fontSize: 11, color: "#9B7450", marginBottom: 10 }}>From ₹{item.startingPrice} · {item.unit}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => toggleAvail(item.id)} style={{ fontSize: 11, fontWeight: 600, padding: "5px 11px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.22)", background: item.available ? "#fff5f5" : "#f0fdf4", color: item.available ? "#c0392b" : "#15803d", cursor: "pointer", fontFamily: font }}>{item.available ? "Hide" : "Show"}</button>
                <button onClick={() => openEdit(item)} style={{ fontSize: 11, fontWeight: 600, padding: "5px 11px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.22)", background: "#fff", color: "#6B3A1F", cursor: "pointer", fontFamily: font }}>Edit</button>
                <button onClick={() => deleteItem(item.id)} style={{ fontSize: 11, fontWeight: 600, padding: "5px 11px", borderRadius: 8, border: "1px solid #fca5a5", background: "#fff5f5", color: "#c0392b", cursor: "pointer", fontFamily: font }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Floral Wedding Invitation" style={inputStyle} />
          </Field>

          <Field label="Category">
            <select value={form.category} onChange={(e) => set("category", e.target.value)} style={inputStyle}>
              {STATIONERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Tagline">
            <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Short description shown on card" style={inputStyle} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Starting Price (₹) *">
              <input type="number" value={form.startingPrice} onChange={(e) => set("startingPrice", e.target.value)} placeholder="299" style={inputStyle} />
            </Field>
            <Field label="Unit">
              <input value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="per piece" style={inputStyle} />
            </Field>
          </div>

          <Field label="Description">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Details about this stationery item..." style={{ ...inputStyle, resize: "vertical" }} />
          </Field>

          <Field label="Features / What's Included">
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())} placeholder="Add feature and press Enter" style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
              <button onClick={addFeature} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#C47A2E", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: font }}>+</button>
            </div>
            {form.features.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#3D2210", flex: 1 }}>• {f}</span>
                <button onClick={() => set("features", form.features.filter((x) => x !== f))} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: 14 }}>×</button>
              </div>
            ))}
          </Field>

          <Field label="Image URLs">
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())} placeholder="Paste image URL and press Enter" style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
              <button onClick={addImage} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#C47A2E", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: font }}>+</button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(form.images || []).filter(Boolean).map((url, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={url} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.2)" }} />
                  <button onClick={() => set("images", (form.images || []).filter((u) => u !== url))} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#c0392b", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>
              ))}
            </div>
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
          <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Preview</div>
          <div style={{ background: "#FFFCF7", borderRadius: 14, overflow: "hidden", border: "1.5px solid rgba(201,168,76,0.18)", boxShadow: "0 3px 14px rgba(139,90,20,0.07)", maxWidth: 240, fontFamily: font }}>
            <div style={{ height: 150, background: "#f0e8dc", overflow: "hidden" }}>
              {(form.images || []).filter(Boolean)[0]
                ? <img src={(form.images || []).filter(Boolean)[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#C47A2E", fontSize: 32 }}>💍</div>}
            </div>
            <div style={{ padding: "14px 16px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1C1208", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>{form.name || "Item Name"}</div>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: "#FEF9EC", color: "#C9A84C", padding: "3px 7px", borderRadius: 20, whiteSpace: "nowrap", marginLeft: 6, flexShrink: 0 }}>{form.category}</span>
              </div>
              <div style={{ fontSize: 12, color: "#9B7450", marginBottom: 12, lineHeight: 1.4 }}>{form.tagline || "Tagline here"}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#C9A84C" }}>₹{form.startingPrice || "—"}</span>
                <div style={{ background: "#C9A84C", color: "#fff", borderRadius: 7, padding: "6px 14px", fontSize: 11, fontWeight: 700 }}>Book →</div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
