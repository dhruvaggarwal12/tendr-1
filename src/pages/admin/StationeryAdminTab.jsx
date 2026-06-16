import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  STATIONERY_CATEGORIES,
  getAdminStationeryProducts,
  createStationeryItem,
  updateStationeryItem,
  deleteStationeryItem,
  uploadStationeryImages,
  removeStationeryImage,
  resetStationeryToDefaults,
} from "../stationery/stationeryProducts";

const font = "'Outfit', sans-serif";

const EMPTY = {
  name: "",
  category: "Itinerary",
  tagline: "",
  startingPrice: "",
  priceRange: "",
  priceOnRequest: false,
  unit: "per piece",
  description: "",
  features: [],
  available: true,
};

export default function StationeryAdminTab() {
  const { token } = useSelector((s) => s.auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("list"); // "list" | "add" | "edit"
  const [editing, setEditing] = useState(null); // _id string
  const [form, setForm] = useState(EMPTY);
  const [featureInput, setFeatureInput] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]); // File[] for add mode
  const [saving, setSaving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminStationeryProducts(token);
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const openAdd = () => {
    setForm({ ...EMPTY });
    setFeatureInput("");
    setPendingFiles([]);
    setEditing(null);
    setError("");
    setMode("add");
  };

  const openEdit = (item) => {
    setForm({
      name: item.name || "",
      category: item.category || "Itinerary",
      tagline: item.tagline || "",
      startingPrice: item.startingPrice || "",
      priceRange: item.priceRange || "",
      priceOnRequest: item.priceOnRequest || false,
      unit: item.unit || "per piece",
      description: item.description || "",
      features: item.features || [],
      available: item.available !== false,
      images: item.images || [],
    });
    setFeatureInput("");
    setEditing(item._id || item.id);
    setError("");
    setMode("edit");
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!form.priceOnRequest && !form.priceRange && !form.startingPrice) return "Set a price, price range, or mark as price-on-request.";
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setSaving(true);
    setError("");
    try {
      const fields = {
        name: form.name.trim(),
        category: form.category,
        tagline: form.tagline,
        startingPrice: form.priceOnRequest ? 0 : (Number(form.startingPrice) || 0),
        priceRange: form.priceRange,
        priceOnRequest: form.priceOnRequest,
        unit: form.unit,
        description: form.description,
        features: form.features,
        available: form.available,
      };

      if (mode === "add") {
        const created = await createStationeryItem(token, fields);
        if (pendingFiles.length > 0) {
          await uploadStationeryImages(token, created._id, pendingFiles);
        }
      } else {
        await updateStationeryItem(token, editing, fields);
      }
      await loadItems();
      setMode("list");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAvail = async (item) => {
    try {
      await updateStationeryItem(token, item._id || item.id, { available: !item.available });
      await loadItems();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await deleteStationeryItem(token, item._id || item.id);
      await loadItems();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset to default catalogue? All existing items and their images will be permanently deleted.")) return;
    setSaving(true);
    try {
      const data = await resetStationeryToDefaults(token);
      setItems(data);
      setMode("list");
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    const val = featureInput.trim();
    if (val && !form.features.includes(val)) {
      set("features", [...form.features, val]);
      setFeatureInput("");
    }
  };

  // Add mode: store files locally with blob preview
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (mode === "add") {
      const previews = files.map(f => ({ url: URL.createObjectURL(f), publicId: null, isLocal: true }));
      setForm(p => ({ ...p, images: [...(p.images || []), ...previews] }));
      setPendingFiles(p => [...p, ...files]);
    } else {
      // Edit mode: upload immediately
      handleEditUpload(files);
    }
    e.target.value = "";
  };

  const handleEditUpload = async (files) => {
    setUploadingImg(true);
    try {
      const updated = await uploadStationeryImages(token, editing, files);
      setForm(p => ({ ...p, images: updated.images || [] }));
      setItems(prev => prev.map(it => (it._id === editing || it.id === editing) ? updated : it));
    } catch (e) {
      alert(e.message);
    } finally {
      setUploadingImg(false);
    }
  };

  const handleRemoveImage = async (idx) => {
    const img = (form.images || [])[idx];
    if (!img) return;

    if (img.isLocal) {
      // Not yet uploaded — just remove from local state
      URL.revokeObjectURL(img.url);
      setForm(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
      setPendingFiles(p => p.filter((_, i) => i !== idx));
      return;
    }

    if (mode === "edit" && img.publicId) {
      setUploadingImg(true);
      try {
        const updated = await removeStationeryImage(token, editing, img.publicId);
        setForm(p => ({ ...p, images: updated.images || [] }));
        setItems(prev => prev.map(it => (it._id === editing || it.id === editing) ? updated : it));
      } catch (e) {
        alert(e.message);
      } finally {
        setUploadingImg(false);
      }
    }
  };

  const getPriceDisplay = (item) => {
    if (item.priceOnRequest) return "Price on request";
    if (item.priceRange) return item.priceRange;
    return item.startingPrice ? `₹${Number(item.startingPrice).toLocaleString("en-IN")}` : "—";
  };

  const grouped = STATIONERY_CATEGORIES.reduce((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length) acc[cat] = catItems;
    return acc;
  }, {});

  // ── LIST VIEW ──
  if (mode === "list") return (
    <div style={{ padding: "28px 24px", fontFamily: font }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: "#2C1A0E", margin: "0 0 4px" }}>💍 Wedding Stationery</h2>
          <p style={{ fontSize: 13, color: "#9B7450", margin: 0 }}>Manage catalogue — edits save to database and reflect live on the stationery page.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={handleReset} disabled={saving} style={{ padding: "8px 16px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: font }}>
            Reset to defaults
          </button>
          <button onClick={openAdd} style={{ padding: "8px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            + Add Item
          </button>
        </div>
      </div>

      {error && <div style={{ marginBottom: 16, padding: "10px 14px", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 8, color: "#c0392b", fontSize: 13 }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#9B7450", fontSize: 14 }}>Loading catalogue…</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#9B7450", background: "#FFFCF5", borderRadius: 16, border: "1.5px dashed rgba(196,122,46,0.2)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>💍</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E", marginBottom: 6 }}>No stationery items yet</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>Add items or click "Reset to defaults" to load the catalogue.</div>
        </div>
      ) : (
        Object.entries(grouped).map(([cat, catItems]) => (
          <div key={cat} style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, paddingBottom: 8, borderBottom: "1.5px solid rgba(196,122,46,0.12)" }}>
              {cat}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
              {catItems.map((item) => (
                <div key={item._id || item.id} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.12)", overflow: "hidden", boxShadow: "0 2px 10px rgba(44,26,14,0.05)" }}>
                  <div style={{ height: 100, overflow: "hidden", position: "relative", background: "#f0e8dc" }}>
                    {item.images?.[0]?.url
                      ? <img src={item.images[0].url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                      <button onClick={() => handleToggleAvail(item)} style={{ fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 7, border: "1.5px solid rgba(196,122,46,0.22)", background: item.available ? "#fff5f5" : "#f0fdf4", color: item.available ? "#c0392b" : "#15803d", cursor: "pointer", fontFamily: font }}>
                        {item.available ? "Hide" : "Show"}
                      </button>
                      <button onClick={() => openEdit(item)} style={{ fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 7, border: "1.5px solid rgba(196,122,46,0.22)", background: "#fff", color: "#6B3A1F", cursor: "pointer", fontFamily: font }}>Edit</button>
                      <button onClick={() => handleDelete(item)} style={{ fontSize: 10, fontWeight: 600, padding: "4px 10px", borderRadius: 7, border: "1px solid #fca5a5", background: "#fff5f5", color: "#c0392b", cursor: "pointer", fontFamily: font }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );

  // ── ADD / EDIT FORM ──
  const formImages = form.images || [];

  return (
    <div style={{ padding: "24px", fontFamily: font, maxWidth: 880, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => setMode("list")} style={{ background: "none", border: "none", color: "#C47A2E", fontSize: 14, fontWeight: 700, cursor: "pointer", padding: 0, fontFamily: font }}>← Back</button>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#2C1A0E", margin: 0 }}>{editing ? "Edit Item" : "Add Stationery Item"}</h2>
      </div>

      {error && <div style={{ marginBottom: 16, padding: "10px 14px", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 8, color: "#c0392b", fontSize: 13 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        {/* Left: form fields */}
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
              <div onClick={() => set("priceOnRequest", !form.priceOnRequest)} style={{ width: 36, height: 20, borderRadius: 100, background: form.priceOnRequest ? "#C47A2E" : "#e5e7eb", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
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
                  <input value={form.priceRange} onChange={(e) => set("priceRange", e.target.value)} placeholder="₹799 – ₹1,999" style={inputStyle} />
                </Field>
              </div>
            )}
          </div>

          <Field label="Unit">
            <input value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="per piece" style={inputStyle} />
          </Field>

          <Field label="Description">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="What's included, customisation details…" style={{ ...inputStyle, resize: "vertical" }} />
          </Field>

          <Field label="Features / What's Included">
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              <input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                placeholder="Add feature and press Enter"
                style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
              />
              <button onClick={addFeature} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "#C47A2E", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: font }}>+</button>
            </div>
            {form.features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#3D2210", flex: 1 }}>• {f}</span>
                <button onClick={() => set("features", form.features.filter((_, fi) => fi !== i))} style={{ background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: 14 }}>×</button>
              </div>
            ))}
          </Field>

          {/* Images */}
          <Field label={`Images${mode === "edit" ? " (uploads immediately)" : " (uploaded on save)"}`}>
            <div
              onClick={() => !uploadingImg && fileInputRef.current?.click()}
              style={{ border: "2px dashed rgba(196,122,46,0.3)", borderRadius: 10, padding: "16px", textAlign: "center", cursor: uploadingImg ? "not-allowed" : "pointer", background: "rgba(196,122,46,0.03)", marginBottom: 10, opacity: uploadingImg ? 0.6 : 1 }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>📷</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#C47A2E" }}>{uploadingImg ? "Uploading…" : "Click to upload images"}</div>
              <div style={{ fontSize: 10, color: "#9B7450" }}>JPG, PNG, WEBP — up to 6 images, 6MB each</div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFileSelect} />
            {formImages.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {formImages.map((img, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img src={img.url} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.2)" }} />
                    <button
                      onClick={() => handleRemoveImage(i)}
                      style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#c0392b", border: "none", color: "#fff", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          {/* Visibility toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => set("available", !form.available)} style={{ width: 40, height: 22, borderRadius: 100, background: form.available ? "#C47A2E" : "#e5e7eb", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 3, left: form.available ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
            </div>
            <span style={{ fontSize: 13, color: "#5a3a1a", fontWeight: 600 }}>{form.available ? "Visible on Stationery page" : "Hidden from customers"}</span>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={() => setMode("list")} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#9B7450", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: saving ? "#ccc" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: saving ? "not-allowed" : "pointer", fontFamily: font }}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </div>

        {/* Right: live preview */}
        <div style={{ position: "sticky", top: 24, height: "fit-content" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Preview</div>
          <div style={{ background: "#FFFCF7", borderRadius: 14, overflow: "hidden", border: "1.5px solid rgba(201,168,76,0.18)", boxShadow: "0 3px 14px rgba(139,90,20,0.07)", maxWidth: 240, fontFamily: font }}>
            <div style={{ height: 150, background: "#f0e8dc", overflow: "hidden" }}>
              {formImages[0]
                ? <img src={formImages[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#C47A2E", opacity: 0.4, fontSize: 32 }}>💍</div>}
            </div>
            <div style={{ padding: "14px 16px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{form.category}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1C1208", fontFamily: "'Cormorant Garamond', Georgia, serif", marginBottom: 4 }}>{form.name || "Item Name"}</div>
              <div style={{ fontSize: 11, color: "#9B7450", marginBottom: 12, lineHeight: 1.4 }}>{form.tagline || "Tagline goes here"}</div>
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
