import React, { useState } from "react";
import { useSelector } from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const CITIES       = ["Delhi", "Noida", "Greater Noida", "Ghaziabad"];
const DJ_SETUP     = ["Basic Setup", "Full Production"];
const DJ_EVENTS    = ["House Party", "Corporate", "Venue"];
const DEC_TYPES    = ["Floral", "Balloon", "Lighting", "Fabric Draping", "Backdrop", "Prop-Based", "Minimalist"];
const DEC_COVERAGE = ["Interior", "Exterior", "Full", "Backdrop Stage Setup", "Extreme Focus"];
const DEC_THEMES   = ["Floral Focused", "Balloon Dominant", "Lighting Emphasis", "Fabric Draping", "Mixed Media", "Prop Centered", "Minimalist Touch"];
const CAT_CUISINE  = ["North Indian", "South Indian", "Snacks", "Chinese Starters", "Punjabi", "Desserts", "Italian", "Other"];
const CAT_STYLE    = ["Buffet", "Food Stations", "Live Counters", "Family Style"];
const CAT_MENU     = ["Veg", "Non Veg", "Jain"];
const PHOTO_SVC    = ["Photographer", "Videographer", "Both"];
const PHOTO_TYPES  = ["Candid", "Drone", "Traditional", "Cinematic"];
const PHOTO_HOURS  = ["2", "4", "8", "Full day"];
const PHOTO_EDIT   = ["2", "5", "7", "10+"];

// ── Reusable components ───────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </span>
      {children}
    </label>
  );
}

const inp = {
  padding: "9px 12px", borderRadius: 8, border: "1.5px solid rgba(196,122,46,0.25)",
  fontFamily: font, fontSize: 13.5, color: "#2C1A0E", background: "#FDFCF8", outline: "none",
  width: "100%", boxSizing: "border-box",
};

function TI({ value, onChange, placeholder, type = "text" }) {
  return (
    <input type={type} value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={inp}
      onFocus={e => (e.target.style.borderColor = "#C9A84C")}
      onBlur={e => (e.target.style.borderColor = "rgba(196,122,46,0.25)")}
    />
  );
}

function SI({ value, onChange, options }) {
  return (
    <select value={value ?? ""} onChange={e => onChange(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function MultiCheck({ options, value = [], onChange, columns = 2 }) {
  const toggle = opt => onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 6 }}>
      {options.map(opt => (
        <label key={opt} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", padding: "6px 10px", borderRadius: 8, border: `1.5px solid ${value.includes(opt) ? "#C9A84C" : "rgba(196,122,46,0.18)"}`, background: value.includes(opt) ? "rgba(201,168,76,0.08)" : "#FDFCF8", fontSize: 12.5, fontFamily: font, color: "#2C1A0E", transition: "all 0.14s" }}>
          <input type="checkbox" checked={value.includes(opt)} onChange={() => toggle(opt)} style={{ accentColor: "#C9A84C", width: 14, height: 14 }} />
          {opt}
        </label>
      ))}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${value ? "#C9A84C" : "rgba(196,122,46,0.18)"}`, background: value ? "rgba(201,168,76,0.06)" : "#FDFCF8" }}>
      <input type="checkbox" checked={!!value} onChange={e => onChange(e.target.checked)} style={{ accentColor: "#C9A84C", width: 16, height: 16 }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: "#2C1A0E", fontFamily: font }}>{label}</span>
    </label>
  );
}

function PickerRow({ options, value, onChange, color = "#C47A2E" }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map(opt => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          style={{ flex: 1, minWidth: 60, padding: "9px 8px", borderRadius: 10, border: `2px solid ${value === opt ? color : "rgba(196,122,46,0.22)"}`, background: value === opt ? `${color}14` : "#FDFCF8", color: value === opt ? color : "#2C1A0E", fontSize: 13, fontWeight: value === opt ? 700 : 500, cursor: "pointer", fontFamily: font, transition: "all 0.14s" }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", padding: "6px 0 2px", borderBottom: "1.5px solid rgba(196,122,46,0.15)", marginBottom: 4, marginTop: 8 }}>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EditVendorModal({ vendor, onClose, onSaved }) {
  const { token } = useSelector(s => s.auth);
  const st = vendor.serviceType;

  const [f, setF] = useState({
    name:                vendor.name || "",
    email:               vendor.email || "",
    whatsappNumber:      vendor.whatsappNumber || "",
    bio:                 vendor.bio || "",
    street:              vendor.address?.street || "",
    city:                vendor.address?.city || "Delhi",
    state:               vendor.address?.state || "Delhi",
    locations:           vendor.locations || [],
    yearsOfExperience:   String(vendor.yearsOfExperience ?? ""),
    teamSize:            String(vendor.teamSize ?? ""),
    totalEventsCompleted:String(vendor.totalEventsCompleted ?? ""),
    maxConcurrentEvents: String(vendor.maxConcurrentEvents ?? "5"),
    price:               String(vendor.price ?? vendor.startingPrice ?? ""),
    portfolioPhotos:     (vendor.portfolioPhotos || []).join("\n"),
    newPassword:         "",
    status:              vendor.status || "approved",
  });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  // Photo upload state
  const [photos, setPhotos]       = useState(vendor.portfolioPhotos || []);
  const [uploading, setUploading] = useState(false);
  const [photoMsg, setPhotoMsg]   = useState("");
  // Pending file — holds selected file until user confirms tag
  const [pendingFile, setPendingFile]   = useState(null);
  const [pendingPreview, setPendingPreview] = useState("");
  const [pendingCat, setPendingCat]     = useState("");
  const [pendingTheme, setPendingTheme] = useState("");

  const GALLERY_CATS      = ["Decoration", "Entertainment", "Catering", "Photography", "Full Event Setup", "Corporate Events"];
  const DECOR_THEMES_LIST = ["Floral", "Balloon Art", "Lighting", "Themed Decoration", "Traditional", "Modern", "Rustic", "Minimalist"];

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
    setPendingCat("");
    setPendingTheme("");
    e.target.value = "";
  };

  const confirmUpload = async () => {
    if (!pendingFile || uploading) return;
    setUploading(true); setPhotoMsg("");
    const fd = new FormData();
    fd.append("photo", pendingFile);
    if (pendingCat) fd.append("galleryCategory", pendingCat);
    if (pendingTheme && st === "Decorator") fd.append("decorTheme", pendingTheme);
    try {
      const BASE = import.meta.env.VITE_BASE_URL;
      const res = await fetch(`${BASE}/admin/vendors/${vendor._id}/photos`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
        credentials: "include", body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setPhotos(prev => [...prev, data.url]);
        setPhotoMsg(pendingCat ? `Uploaded to ${pendingCat}!` : "Photo uploaded!");
      } else setPhotoMsg(data.error || "Upload failed.");
    } catch (err) { setPhotoMsg(err.message); }
    finally {
      setUploading(false);
      setPendingFile(null); setPendingPreview("");
      setTimeout(() => setPhotoMsg(""), 3000);
    }
  };

  const handlePhotoDelete = async (url) => {
    if (!window.confirm("Remove this photo?")) return;
    const BASE = import.meta.env.VITE_BASE_URL;
    const res = await fetch(`${BASE}/admin/vendors/${vendor._id}/photos`, {
      method: "DELETE", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include", body: JSON.stringify({ url }),
    });
    if (res.ok) setPhotos(prev => prev.filter(p => p !== url));
  };

  // DJ
  const [djSetup, setDjSetup]   = useState(vendor.setup || []);
  const [djLights, setDjLights] = useState(!!vendor.lightsIncluded);
  const [djEvents, setDjEvents] = useState(vendor.eventTypes || []);

  // Decorator
  const [decTypes, setDecTypes]       = useState(vendor.typesOfDecoration || []);
  const [decCoverage, setDecCoverage] = useState(vendor.venueCoverage || []);
  const [decThemes, setDecThemes]     = useState(vendor.themes || []);

  // Caterer
  const [catCuisine, setCatCuisine] = useState(vendor.cuisine || []);
  const [catStyle, setCatStyle]     = useState(vendor.serviceStyle || []);
  const [catMenu, setCatMenu]       = useState(vendor.menuType || []);
  const [catBev, setCatBev]         = useState(!!vendor.beveragesIncluded);

  // Photographer
  const [photoSvc, setPhotoSvc]         = useState((vendor.services || [])[0] || "");
  const [photoTypes, setPhotoTypes]     = useState(vendor.photographyType || []);
  const [photoHours, setPhotoHours]     = useState(vendor.hoursIncluded || "");
  const [photoEditing, setPhotoEditing] = useState(vendor.editingTimeDays || "");
  const [photoCount, setPhotoCount]     = useState(String(vendor.photographersCount ?? "1"));
  const [videoCount, setVideoCount]     = useState(String(vendor.videographersCount ?? "0"));
  const [photoSocial, setPhotoSocial]   = useState(!!vendor.socialMedia);
  const [photoAlbum, setPhotoAlbum]     = useState(vendor.album !== false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSubmitting(true);
    try {
      const photos = f.portfolioPhotos.split("\n").map(s => s.trim()).filter(Boolean);
      const body = {
        name: f.name, email: f.email, whatsappNumber: f.whatsappNumber, bio: f.bio,
        address: { street: f.street, city: f.city, state: f.state },
        locations: f.locations,
        yearsOfExperience: Number(f.yearsOfExperience) || 0,
        teamSize: Number(f.teamSize) || 1,
        totalEventsCompleted: Number(f.totalEventsCompleted) || 0,
        maxConcurrentEvents: Number(f.maxConcurrentEvents) || 5,
        price: Number(f.price) || 0,
        portfolioPhotos: photos,
        status: f.status,
        ...(f.newPassword.length >= 8 && { password: f.newPassword }),
        // Category-specific
        ...(st === "DJ" && { setup: djSetup, lightsIncluded: djLights, eventTypes: djEvents }),
        ...(st === "Decorator" && { typesOfDecoration: decTypes, venueCoverage: decCoverage, themes: decThemes }),
        ...(st === "Caterer" && { cuisine: catCuisine, serviceStyle: catStyle, menuType: catMenu, beveragesIncluded: catBev }),
        ...(st === "Photographer" && { services: photoSvc ? [photoSvc] : [], photographyType: photoTypes, hoursIncluded: photoHours, editingTimeDays: photoEditing, photographersCount: Number(photoCount), videographersCount: Number(videoCount), socialMedia: photoSocial, album: photoAlbum }),
      };

      const res = await fetch(`${BASE_URL}/admin/vendors/${vendor._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Update failed."); return; }
      onSaved?.(data);
      onClose();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(28,10,0,0.55)", backdropFilter: "blur(3px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 501, width: "min(96vw,820px)", height: "min(92vh,900px)", background: "#FAF7F2", borderRadius: 20, boxShadow: "0 32px 80px rgba(28,10,0,0.22)", border: "1.5px solid rgba(196,122,46,0.2)", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: font }}>

        {/* Header */}
        <div style={{ padding: "16px 24px 14px", borderBottom: "1px solid rgba(196,122,46,0.12)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0, background: "#FFFCF7" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#9B7450", cursor: "pointer", fontFamily: font, fontSize: 13, padding: "4px 0" }}>← Cancel</button>
          <div style={{ width: 1, height: 18, background: "#EDE6D8" }} />
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 400, color: "#2C1A0E", margin: 0 }}>
            Edit — {vendor.name} <span style={{ fontSize: 14, color: "#C47A2E" }}>({st})</span>
          </h2>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "20px 24px" }}>

          <SectionTitle>Basic Information</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 10, marginBottom: 16 }}>
            <Field label="Vendor Name" required><TI value={f.name} onChange={v => set("name", v)} placeholder="Vendor name" /></Field>
            <Field label="WhatsApp Number"><TI value={f.whatsappNumber} onChange={v => set("whatsappNumber", v)} placeholder="+91 9XXXXXXXXX" /></Field>
            <Field label="Email"><TI value={f.email} onChange={v => set("email", v)} placeholder="vendor@email.com" type="email" /></Field>
            <Field label="Starting Price (₹)"><TI value={f.price} onChange={v => set("price", v)} placeholder="15000" type="number" /></Field>
            <Field label="Status">
              <SI value={f.status} onChange={v => set("status", v)} options={["pending","approved","rejected","suspended"]} />
            </Field>
            <Field label="New Password (leave blank to keep)"><TI value={f.newPassword} onChange={v => set("newPassword", v)} placeholder="Min 8 chars" type="password" /></Field>
          </div>
          <Field label="Bio / About"><textarea value={f.bio} onChange={e => set("bio", e.target.value)} rows={2} style={{ ...inp, resize: "vertical" }} /></Field>

          <SectionTitle>Address & Locations</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 10, marginBottom: 16 }}>
            <Field label="Street"><TI value={f.street} onChange={v => set("street", v)} placeholder="Street address" /></Field>
            <Field label="City">
              <SI value={f.city} onChange={v => set("city", v)} options={CITIES} />
            </Field>
            <Field label="State"><TI value={f.state} onChange={v => set("state", v)} placeholder="Delhi" /></Field>
          </div>
          <Field label="Service Locations">
            <MultiCheck options={CITIES} value={f.locations} onChange={v => set("locations", v)} columns={4} />
          </Field>

          <SectionTitle>Experience & Team</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginTop: 10, marginBottom: 16 }}>
            <Field label="Years of Exp."><TI value={f.yearsOfExperience} onChange={v => set("yearsOfExperience", v)} placeholder="5" type="number" /></Field>
            <Field label="Team Size"><TI value={f.teamSize} onChange={v => set("teamSize", v)} placeholder="8" type="number" /></Field>
            <Field label="Events Done"><TI value={f.totalEventsCompleted} onChange={v => set("totalEventsCompleted", v)} placeholder="50" type="number" /></Field>
            <Field label="Max Concurrent"><TI value={f.maxConcurrentEvents} onChange={v => set("maxConcurrentEvents", v)} placeholder="5" type="number" /></Field>
          </div>

          <SectionTitle>Portfolio Photos</SectionTitle>
          <div style={{ marginTop: 10, marginBottom: 16 }}>

            {/* Pending file — tag before upload */}
            {pendingFile ? (
              <div style={{ background: "#FFFCF7", border: "1.5px solid rgba(196,122,46,0.25)", borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Tag this photo before uploading</div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <img src={pendingPreview} alt="preview" style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1.5px solid rgba(196,122,46,0.18)" }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <select value={pendingCat} onChange={e => { setPendingCat(e.target.value); if (e.target.value !== "Decoration") setPendingTheme(""); }}
                      style={{ ...inp, fontSize: 12, color: pendingCat ? "#2C1A0E" : "#9B7450" }}>
                      <option value="">Add to Glimpse gallery? (optional)</option>
                      {GALLERY_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {st === "Decorator" && (
                      <select value={pendingTheme} onChange={e => setPendingTheme(e.target.value)}
                        style={{ ...inp, fontSize: 12, color: pendingTheme ? "#2C1A0E" : "#9B7450" }}>
                        <option value="">Decor theme for this photo? (optional)</option>
                        {DECOR_THEMES_LIST.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" onClick={confirmUpload} disabled={uploading}
                        style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", background: uploading ? "#e5e7eb" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: uploading ? "#9ca3af" : "#fff", fontSize: 13, fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer", fontFamily: font }}>
                        {uploading ? "Uploading…" : "✓ Upload"}
                      </button>
                      <button type="button" onClick={() => { setPendingFile(null); setPendingPreview(""); }}
                        style={{ padding: "9px 14px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
                {photoMsg && <div style={{ marginTop: 8, fontSize: 12, color: photoMsg.includes("fail") || photoMsg.includes("Error") ? "#ef4444" : "#15803d", fontWeight: 600 }}>{photoMsg}</div>}
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <label style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", gap: 6 }}>
                  📷 Upload Photo
                  <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />
                </label>
                {photoMsg && <span style={{ fontSize: 12, color: "#15803d", fontWeight: 600 }}>{photoMsg}</span>}
                <span style={{ fontSize: 11, color: "#9B7450", marginLeft: "auto" }}>{photos.length}/10 photos</span>
              </div>
            )}

            {/* Photo grid */}
            {photos.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
                {photos.map((url, i) => (
                  <div key={url} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", border: "1.5px solid rgba(196,122,46,0.18)" }}>
                    <img src={url} alt={`Photo ${i+1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    <button onClick={() => handlePhotoDelete(url)}
                      style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(239,68,68,0.85)", border: "none", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      ✕
                    </button>
                  </div>
                ))}
                {!pendingFile && photos.length < 10 && (
                  <label style={{ aspectRatio: "1", borderRadius: 10, border: "2px dashed rgba(196,122,46,0.3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#C47A2E", fontSize: 11, fontWeight: 600, gap: 4 }}>
                    <span style={{ fontSize: 22 }}>+</span> Add
                    <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />
                  </label>
                )}
              </div>
            ) : (
              !pendingFile && (
                <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px", border: "2px dashed rgba(196,122,46,0.25)", borderRadius: 12, cursor: "pointer", color: "#9B7450", gap: 8 }}>
                  <span style={{ fontSize: 32 }}>🖼️</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Click to upload first photo</span>
                  <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "none" }} />
                </label>
              )
            )}
          </div>

          {/* ── Category-specific ── */}
          {st === "DJ" && (
            <>
              <SectionTitle>DJ Details</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10, marginBottom: 16 }}>
                <Field label="Setup Type"><MultiCheck options={DJ_SETUP} value={djSetup} onChange={setDjSetup} columns={2} /></Field>
                <Field label="Event Types"><MultiCheck options={DJ_EVENTS} value={djEvents} onChange={setDjEvents} columns={3} /></Field>
                <Toggle label="Lights Included" value={djLights} onChange={setDjLights} />
              </div>
            </>
          )}

          {st === "Decorator" && (
            <>
              <SectionTitle>Decoration Details</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10, marginBottom: 16 }}>
                <Field label="Types of Decoration"><MultiCheck options={DEC_TYPES} value={decTypes} onChange={setDecTypes} columns={3} /></Field>
                <Field label="Venue Coverage"><MultiCheck options={DEC_COVERAGE} value={decCoverage} onChange={setDecCoverage} columns={2} /></Field>
                <Field label="Themes"><MultiCheck options={DEC_THEMES} value={decThemes} onChange={setDecThemes} columns={2} /></Field>
              </div>
            </>
          )}

          {st === "Caterer" && (
            <>
              <SectionTitle>Catering Details</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10, marginBottom: 16 }}>
                <Field label="Cuisine"><MultiCheck options={CAT_CUISINE} value={catCuisine} onChange={setCatCuisine} columns={3} /></Field>
                <Field label="Service Style"><MultiCheck options={CAT_STYLE} value={catStyle} onChange={setCatStyle} columns={2} /></Field>
                <Field label="Menu Type"><MultiCheck options={CAT_MENU} value={catMenu} onChange={setCatMenu} columns={3} /></Field>
                <Toggle label="Beverages Included" value={catBev} onChange={setCatBev} />
              </div>
            </>
          )}

          {st === "Photographer" && (
            <>
              <SectionTitle>Photography Details</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 10, marginBottom: 16 }}>
                <Field label="Which Services">
                  <PickerRow options={PHOTO_SVC} value={photoSvc} onChange={setPhotoSvc} color="#15803d" />
                </Field>
                <Field label="Photography Type"><MultiCheck options={PHOTO_TYPES} value={photoTypes} onChange={setPhotoTypes} columns={2} /></Field>
                <Field label="Hours Included">
                  <PickerRow options={PHOTO_HOURS} value={photoHours} onChange={setPhotoHours} />
                </Field>
                <Field label="Editing Time (days)">
                  <PickerRow options={PHOTO_EDIT} value={photoEditing} onChange={setPhotoEditing} />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Photographers"><TI value={photoCount} onChange={setPhotoCount} placeholder="1" type="number" /></Field>
                  <Field label="Videographers"><TI value={videoCount} onChange={setVideoCount} placeholder="0" type="number" /></Field>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Toggle label="Social Media Reels" value={photoSocial} onChange={setPhotoSocial} />
                  <Toggle label="Photo Album Included" value={photoAlbum} onChange={setPhotoAlbum} />
                </div>
              </div>
            </>
          )}

          {error && <div style={{ padding: "12px 16px", borderRadius: 10, background: "#fff5f5", border: "1px solid #fca5a5", color: "#c0392b", fontSize: 13, marginBottom: 16 }}>❌ {error}</div>}

          <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
            <button type="submit" disabled={submitting}
              style={{ flex: 1, padding: "13px", borderRadius: 10, border: "none", background: submitting ? "#e5e7eb" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: submitting ? "#9ca3af" : "#fff", fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: font, boxShadow: submitting ? "none" : "0 4px 16px rgba(196,122,46,0.35)" }}>
              {submitting ? "Saving…" : "Save Changes"}
            </button>
            <button type="button" onClick={onClose}
              style={{ padding: "13px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#9B7450", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
