import React, { useState, useEffect } from "react";
import { getProducts, saveProducts, DEFAULT_PRODUCTS } from "../memories/memoriesData";

const font = "'Outfit', sans-serif";

const EMPTY_PRODUCT = {
  id: "",
  name: "",
  tagline: "",
  startingPrice: "",
  unit: "per design",
  perfectFor: [],
  description: "",
  includes: [],
  images: [""],
  available: true,
  bookingFields: [],
};

const PERFECT_FOR_OPTIONS = [
  "Birthday", "1st Birthday", "Baby Shower", "Newborn Welcome", "Anniversary",
  "Housewarming", "Graduation", "Get-together", "Pre Wedding", "Festival",
  "Corporate Event", "Office Party",
];

export default function MemoriesTab() {
  const [products, setProducts] = useState([]);
  const [mode, setMode] = useState("list"); // "list" | "add" | "edit"
  const [editing, setEditing] = useState(null); // product being edited
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [perfectForInput, setPerfectForInput] = useState("");
  const [includesInput, setIncludesInput] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [previewTab, setPreviewTab] = useState("card"); // "card" | "profile"

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const refresh = () => setProducts(getProducts());

  const openAdd = () => {
    setForm({ ...EMPTY_PRODUCT, id: `product-${Date.now()}` });
    setPerfectForInput("");
    setIncludesInput("");
    setImageInput("");
    setEditing(null);
    setMode("add");
  };

  const openEdit = (p) => {
    setForm({ ...p });
    setPerfectForInput("");
    setIncludesInput("");
    setImageInput("");
    setEditing(p.id);
    setMode("edit");
  };

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const toggleAvailability = (id) => {
    const updated = products.map((p) => p.id === id ? { ...p, available: !p.available } : p);
    saveProducts(updated);
    setProducts(updated);
  };

  const deleteProduct = (id) => {
    if (!window.confirm("Delete this product?")) return;
    const updated = products.filter((p) => p.id !== id);
    saveProducts(updated);
    setProducts(updated);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.startingPrice) {
      alert("Name and starting price are required.");
      return;
    }
    const slug = form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const product = { ...form, id: editing || slug, startingPrice: Number(form.startingPrice) };
    let updated;
    if (editing) {
      updated = products.map((p) => p.id === editing ? product : p);
    } else {
      updated = [...products, product];
    }
    saveProducts(updated);
    setProducts(updated);
    setMode("list");
  };

  const handleReset = () => {
    if (!window.confirm("Reset to default products? This will overwrite any changes.")) return;
    saveProducts(DEFAULT_PRODUCTS);
    setProducts(DEFAULT_PRODUCTS);
  };

  const addPerfectFor = (tag) => {
    if (!form.perfectFor.includes(tag)) set("perfectFor", [...form.perfectFor, tag]);
  };
  const removePerfectFor = (tag) => set("perfectFor", form.perfectFor.filter((t) => t !== tag));

  const addInclude = () => {
    const val = includesInput.trim();
    if (val && !form.includes.includes(val)) {
      set("includes", [...form.includes, val]);
      setIncludesInput("");
    }
  };
  const removeInclude = (item) => set("includes", form.includes.filter((i) => i !== item));

  const addImage = () => {
    const val = imageInput.trim();
    if (val) { set("images", [...(form.images || []).filter(Boolean), val]); setImageInput(""); }
  };
  const removeImage = (url) => set("images", (form.images || []).filter((u) => u !== url));

  // ── List view ──────────────────────────────────────────────────────────────
  if (mode === "list") return (
    <div style={{ padding: "28px 24px", fontFamily: font }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#2C1A0E", margin: "0 0 4px" }}>💍 Wedding Stationeries</h2>
          <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Add and manage wedding stationery products. Customers can browse and enquire from the Stationery page.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleReset} style={{ padding: "8px 16px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>Reset to defaults</button>
          <button onClick={openAdd} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>+ Add Product</button>
        </div>
      </div>

      {products.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#9B7450" }}>No products yet. Add one above.</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {products.map((p) => (
          <div key={p.id} style={{ background: "#fff", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.12)", overflow: "hidden", boxShadow: "0 2px 10px rgba(44,26,14,0.06)" }}>
            {/* Thumbnail */}
            <div style={{ height: 120, overflow: "hidden", position: "relative" }}>
              <img src={p.images?.[0] || "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=400&q=60"} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              {/* Availability badge */}
              <div style={{ position: "absolute", top: 8, right: 8, background: p.available ? "#15803d" : "#9ca3af", color: "#fff", borderRadius: 100, fontSize: 10, fontWeight: 700, padding: "2px 10px" }}>
                {p.available ? "Live" : "Hidden"}
              </div>
            </div>

            <div style={{ padding: "14px 14px" }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", marginBottom: 2 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: "#9B7450", marginBottom: 10 }}>From ₹{p.startingPrice} · {p.unit}</div>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                {(p.perfectFor || []).slice(0, 3).map((tag) => (
                  <span key={tag} style={{ fontSize: 9, color: "#C47A2E", background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.15)", borderRadius: 100, padding: "2px 7px", fontWeight: 600 }}>{tag}</span>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button onClick={() => window.open(`/memories/${p.id}`, "_blank")} style={{ fontSize: 11, fontWeight: 600, padding: "5px 11px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.22)", background: "#fffaf3", color: "#C47A2E", cursor: "pointer", fontFamily: font }}>Preview →</button>
                <button onClick={() => toggleAvailability(p.id)} style={{ fontSize: 11, fontWeight: 600, padding: "5px 11px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.22)", background: p.available ? "#fff5f5" : "#f0fdf4", color: p.available ? "#c0392b" : "#15803d", cursor: "pointer", fontFamily: font }}>{p.available ? "Hide" : "Show"}</button>
                <button onClick={() => openEdit(p)} style={{ fontSize: 11, fontWeight: 600, padding: "5px 11px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.22)", background: "#fff", color: "#6B3A1F", cursor: "pointer", fontFamily: font }}>Edit</button>
                <button onClick={() => deleteProduct(p.id)} style={{ fontSize: 11, fontWeight: 600, padding: "5px 11px", borderRadius: 8, border: "1px solid #fca5a5", background: "#fff5f5", color: "#c0392b", cursor: "pointer", fontFamily: font }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Add / Edit form ────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "24px", fontFamily: font, maxWidth: 860, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => setMode("list")} style={{ background: "none", border: "none", color: "#C47A2E", fontSize: 14, fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: font }}>← Back</button>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#2C1A0E", margin: 0 }}>{editing ? "Edit Product" : "Add New Product"}</h2>
      </div>

      {/* Preview tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["card", "profile"].map((tab) => (
          <button key={tab} onClick={() => setPreviewTab(tab)} style={{ padding: "6px 16px", borderRadius: 100, border: `2px solid ${previewTab === tab ? "#C47A2E" : "rgba(196,122,46,0.2)"}`, background: previewTab === tab ? "#C47A2E" : "#fff", color: previewTab === tab ? "#fff" : "#9B7450", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            {tab === "card" ? "Card Preview" : "Profile Preview"}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Product Name *">
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Invitation Flyer" style={inputStyle} />
          </Field>
          <Field label="Tagline">
            <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Short description shown on card" style={inputStyle} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Starting Price (₹) *">
              <input type="number" value={form.startingPrice} onChange={(e) => set("startingPrice", e.target.value)} placeholder="299" style={inputStyle} />
            </Field>
            <Field label="Unit">
              <input value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="per design" style={inputStyle} />
            </Field>
          </div>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Full product description..." style={{ ...inputStyle, resize: "vertical" }} />
          </Field>

          {/* Perfect for */}
          <Field label="Perfect For">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
              {PERFECT_FOR_OPTIONS.map((tag) => {
                const sel = form.perfectFor.includes(tag);
                return (
                  <button key={tag} onClick={() => sel ? removePerfectFor(tag) : addPerfectFor(tag)}
                    style={{ fontSize: 11, padding: "3px 10px", borderRadius: 100, border: `1.5px solid ${sel ? "#C47A2E" : "rgba(196,122,46,0.2)"}`, background: sel ? "#C47A2E" : "#fff", color: sel ? "#fff" : "#9B7450", cursor: "pointer", fontFamily: font, fontWeight: sel ? 700 : 500 }}>
                    {tag}
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Includes */}
          <Field label="What's Included">
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <input value={includesInput} onChange={(e) => setIncludesInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInclude())} placeholder="Add item and press Enter" style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
              <button onClick={addInclude} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#C47A2E", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: font }}>+</button>
            </div>
            {form.includes.map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#3D2210", flex: 1 }}>• {item}</span>
                <button onClick={() => removeInclude(item)} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: 14 }}>×</button>
              </div>
            ))}
          </Field>

          {/* Images */}
          <Field label="Image URLs">
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <input value={imageInput} onChange={(e) => setImageInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())} placeholder="Paste image URL and press Enter" style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
              <button onClick={addImage} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#C47A2E", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: font }}>+</button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {(form.images || []).filter(Boolean).map((url, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <img src={url} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.2)" }} />
                  <button onClick={() => removeImage(url)} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#c0392b", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>
              ))}
            </div>
          </Field>

          {/* Availability */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              onClick={() => set("available", !form.available)}
              style={{ width: 40, height: 22, borderRadius: 100, background: form.available ? "#C47A2E" : "#e5e7eb", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
            >
              <div style={{ position: "absolute", top: 3, left: form.available ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
            </div>
            <span style={{ fontSize: 13, color: "#5a3a1a", fontWeight: 600 }}>{form.available ? "Visible to customers" : "Hidden from customers"}</span>
          </div>

          {/* Save */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={() => setMode("list")} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#9B7450", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Cancel</button>
            <button onClick={handleSave} style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
              {editing ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </div>

        {/* Preview panel */}
        <div style={{ position: "sticky", top: 24, height: "fit-content" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Preview</div>

          {previewTab === "card" ? (
            <CardPreview form={form} />
          ) : (
            <ProfilePreview form={form} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────

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

function CardPreview({ form }) {
  const img = (form.images || []).filter(Boolean)[0];
  return (
    <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 14px rgba(44,26,14,0.1)", border: "1.5px solid rgba(196,122,46,0.12)", maxWidth: 220, fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ height: 130, background: "#f0e8dc", overflow: "hidden" }}>
        {img ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#C47A2E", fontSize: 28 }}>🖼️</div>}
      </div>
      <div style={{ padding: "12px 12px" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", marginBottom: 3 }}>{form.name || "Product Name"}</div>
        <div style={{ fontSize: 10, color: "#9B7450", marginBottom: 10 }}>{form.tagline || "Tagline here"}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", marginBottom: 10 }}>From ₹{form.startingPrice || "—"}</div>
        <div style={{ width: "100%", padding: "7px 0", borderRadius: 8, background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 11, fontWeight: 700, textAlign: "center" }}>View Details →</div>
      </div>
    </div>
  );
}

function ProfilePreview({ form }) {
  const imgs = (form.images || []).filter(Boolean);
  return (
    <div style={{ background: "#f8f4ef", borderRadius: 16, overflow: "hidden", maxWidth: 300, fontFamily: "'Outfit', sans-serif", border: "1.5px solid rgba(196,122,46,0.12)", boxShadow: "0 2px 14px rgba(44,26,14,0.08)" }}>
      <div style={{ height: 150, background: "#f0e8dc", overflow: "hidden" }}>
        {imgs[0] ? <img src={imgs[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#C47A2E", fontSize: 32 }}>🖼️</div>}
      </div>
      <div style={{ padding: "12px" }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#2C1A0E", marginBottom: 2 }}>{form.name || "Product Name"}</div>
        <div style={{ fontSize: 11, color: "#9B7450", marginBottom: 8 }}>{form.tagline || "Tagline"}</div>
        {form.perfectFor?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
            {form.perfectFor.slice(0, 4).map((tag) => (
              <span key={tag} style={{ fontSize: 9, color: "#C47A2E", background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.15)", borderRadius: 100, padding: "2px 7px" }}>{tag}</span>
            ))}
          </div>
        )}
        <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#CCAB4A" }}>₹{form.startingPrice || "—"}</div>
          <div style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", borderRadius: 8, padding: "6px 14px", color: "#fff", fontSize: 11, fontWeight: 700 }}>Book Now →</div>
        </div>
      </div>
    </div>
  );
}
