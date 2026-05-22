import React, { useState } from "react";
import { useSelector } from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

// ── Constants mirroring backend ───────────────────────────────────────────────
const CITIES       = ["Delhi", "Noida", "Greater Noida", "Ghaziabad"];
const DJ_SETUP     = ["Basic Setup", "Full Production"];
const DJ_EVENTS    = ["House Party", "Corporate", "Venue"];
const DEC_TYPES    = ["Floral", "Balloon", "Lighting", "Fabric Draping", "Backdrop", "Prop-Based", "Minimalist"];
const DEC_COVERAGE = ["Interior", "Exterior", "Full", "Backdrop Stage Setup", "Extreme Focus"];
const DEC_THEMES   = ["Floral Focused", "Balloon Dominant", "Lighting Emphasis", "Fabric Draping", "Mixed Media", "Prop Centered", "Minimalist Touch"];
const CAT_CUISINE  = ["North Indian", "South Indian", "Snacks", "Chinese Starters", "Punjabi", "Desserts", "Italian", "Other"];
const CAT_STYLE    = ["Buffet", "Food Stations", "Live Counters", "Family Style"];
const CAT_MENU     = ["Veg", "Non Veg", "Jain"];
const PHOTO_SVC     = ["Photographer", "Videographer", "Both"];
const PHOTO_TYPES   = ["Candid", "Drone", "Traditional", "Cinematic"];
const PHOTO_HOURS   = ["2", "4", "8", "Full day"];
const PHOTO_EDITING = ["2", "5", "7", "10+"];

const CATEGORIES = [
  { id: "DJ",           label: "DJ",          icon: "🎧", color: "#7c3aed", desc: "Music, sound, lights" },
  { id: "Decorator",    label: "Decorator",   icon: "🎨", color: "#C47A2E", desc: "Themes, balloons, florals" },
  { id: "Caterer",      label: "Caterer",     icon: "🍽️", color: "#0369a1", desc: "Food, catering, live counters" },
  { id: "Photographer", label: "Photographer",icon: "📸", color: "#15803d", desc: "Photography & videography" },
];

// ── Reusable input components ─────────────────────────────────────────────────
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

function TextInput({ value, onChange, placeholder, type = "text", required }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      required={required} style={inp}
      onFocus={e => (e.target.style.borderColor = "#C9A84C")}
      onBlur={e => (e.target.style.borderColor = "rgba(196,122,46,0.25)")}
    />
  );
}

function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ ...inp, cursor: "pointer" }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function MultiCheck({ options, value = [], onChange, columns = 2 }) {
  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter(v => v !== opt));
    else onChange([...value, opt]);
  };
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
      <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} style={{ accentColor: "#C9A84C", width: 16, height: 16 }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: "#2C1A0E", fontFamily: font }}>{label}</span>
    </label>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 800, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", padding: "6px 0 2px", borderBottom: "1.5px solid rgba(196,122,46,0.15)", marginBottom: 4 }}>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AddVendorModal({ onClose, onAdded }) {
  const { token } = useSelector(s => s.auth);

  const [step, setStep] = useState("category"); // "category" | "form" | "success"
  const [category, setCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Common fields
  const [f, setF] = useState({
    name: "", phoneNumber: "", whatsappNumber: "", password: "",
    email: "", bio: "", gstNumber: "", panNumber: "",
    street: "", city: "Delhi", state: "Delhi",
    locations: ["Delhi"],
    yearsOfExperience: "", teamSize: "", totalEventsCompleted: "", maxConcurrentEvents: "5",
    startingPrice: "", portfolioPhotos: "",
  });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  // Category-specific
  const [djSetup, setDjSetup] = useState([]);
  const [djLights, setDjLights] = useState(false);
  const [djEvents, setDjEvents] = useState([]);

  const [decTypes, setDecTypes]    = useState([]);
  const [decCoverage, setDecCoverage] = useState([]);
  const [decThemes, setDecThemes]  = useState([]);

  const [catCuisine, setCatCuisine]   = useState([]);
  const [catStyle, setCatStyle]       = useState([]);
  const [catMenu, setCatMenu]         = useState([]);
  const [catBev, setCatBev]           = useState(false);

  const [photoSvc, setPhotoSvc]           = useState("");
  const [photoTypes, setPhotoTypes]       = useState([]);
  const [photoHours, setPhotoHours]       = useState("");
  const [photoEditing, setPhotoEditing]   = useState("");
  const [photoCount, setPhotoCount]       = useState("1");
  const [videoCount, setVideoCount]       = useState("0");
  const [photoSocial, setPhotoSocial]     = useState(false);
  const [photoAlbum, setPhotoAlbum]       = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || !f.phoneNumber.trim() || !f.password.trim()) {
      setError("Name, phone and password are required."); return;
    }
    if (f.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError("");
    setSubmitting(true);

    try {
      const photos = f.portfolioPhotos.split("\n").map(s => s.trim()).filter(Boolean);
      const payload = {
        serviceType: category,
        ...f,
        locations: f.locations,
        portfolioPhotos: photos,
        // DJ
        setup: djSetup, lightsIncluded: djLights, eventTypes: djEvents,
        // Decorator
        typesOfDecoration: decTypes, venueCoverage: decCoverage, themes: decThemes,
        // Caterer
        cuisine: catCuisine, serviceStyle: catStyle, menuType: catMenu, beveragesIncluded: catBev,
        // Photographer
        services: photoSvc ? [photoSvc] : [], photographyType: photoTypes,
        hoursIncluded: photoHours, editingTimeDays: photoEditing,
        photographersCount: Number(photoCount), videographersCount: Number(videoCount),
        socialMedia: photoSocial, album: photoAlbum,
      };

      const res = await fetch(`${BASE_URL}/admin/add-vendor`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to add vendor."); return; }
      setResult(data);
      setStep("success");
      onAdded?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Category picker ───────────────────────────────────────────────────────
  if (step === "category") {
    return (
      <Overlay onClose={onClose}>
        <div style={{ padding: "28px 28px 32px" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 24, fontWeight: 400, color: "#2C1A0E", margin: "0 0 6px" }}>Add New Vendor</h2>
          <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 28px" }}>Choose the service category for this vendor.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => { setCategory(cat.id); setStep("form"); }}
                style={{ textAlign: "left", padding: "18px 20px", borderRadius: 14, border: `2px solid ${cat.color}20`, background: `${cat.color}08`, cursor: "pointer", fontFamily: font, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.border = `2px solid ${cat.color}60`; e.currentTarget.style.background = `${cat.color}12`; }}
                onMouseLeave={e => { e.currentTarget.style.border = `2px solid ${cat.color}20`; e.currentTarget.style.background = `${cat.color}08`; }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{cat.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", marginBottom: 3 }}>{cat.label}</div>
                <div style={{ fontSize: 12, color: "#9B7450" }}>{cat.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </Overlay>
    );
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <Overlay onClose={onClose}>
        <div style={{ padding: "40px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#15803d", margin: "0 0 8px" }}>Vendor Added!</h3>
          <p style={{ fontSize: 14, color: "#2C1A0E", margin: "0 0 4px" }}>{result?.message}</p>
          <p style={{ fontSize: 12, color: "#9B7450", margin: "0 0 28px" }}>ID: {result?.vendorId}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => { setStep("category"); setCategory(null); setF({ name:"",phoneNumber:"",whatsappNumber:"",password:"",email:"",bio:"",gstNumber:"",panNumber:"",street:"",city:"Delhi",state:"Delhi",locations:["Delhi"],yearsOfExperience:"",teamSize:"",totalEventsCompleted:"",maxConcurrentEvents:"5",startingPrice:"",portfolioPhotos:"" }); setError(""); }}
              style={{ padding: "11px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              Add Another Vendor
            </button>
            <button onClick={onClose}
              style={{ padding: "11px 24px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "transparent", color: "#C47A2E", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              Close
            </button>
          </div>
        </div>
      </Overlay>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  const cat = CATEGORIES.find(c => c.id === category);
  return (
    <Overlay onClose={onClose} wide>
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>

        {/* Header */}
        <div style={{ padding: "18px 24px 14px", borderBottom: "1px solid rgba(196,122,46,0.12)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0, background: "#FFFCF7" }}>
          <button onClick={() => setStep("category")} style={{ background: "none", border: "none", color: "#9B7450", cursor: "pointer", fontFamily: font, fontSize: 13, padding: "4px 0" }}>← Back</button>
          <div style={{ width: 1, height: 18, background: "#EDE6D8" }} />
          <span style={{ fontSize: 22, marginRight: 4 }}>{cat.icon}</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 20, fontWeight: 400, color: "#2C1A0E", margin: 0 }}>
            Add {cat.label} Vendor
          </h2>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

          {/* ── COMMON FIELDS ── */}
          <SectionTitle>Basic Information</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20, marginTop: 12 }}>
            <Field label="Vendor Name" required><TextInput value={f.name} onChange={v => set("name", v)} placeholder="e.g. Shutter Stories" required /></Field>
            <Field label="Phone Number" required><TextInput value={f.phoneNumber} onChange={v => set("phoneNumber", v)} placeholder="10-digit mobile number" required /></Field>
            <Field label="WhatsApp Number"><TextInput value={f.whatsappNumber} onChange={v => set("whatsappNumber", v)} placeholder="Same as phone if blank" /></Field>
            <Field label="Email"><TextInput value={f.email} onChange={v => set("email", v)} placeholder="vendor@email.com" type="email" /></Field>
            <Field label="Password" required>
              <TextInput value={f.password} onChange={v => set("password", v)} placeholder="Min 8 characters" type="password" required />
            </Field>
            <Field label="Starting Price (₹)"><TextInput value={f.startingPrice} onChange={v => set("startingPrice", v)} placeholder="e.g. 15000" type="number" /></Field>
          </div>

          <Field label="Bio / About"><textarea value={f.bio} onChange={e => set("bio", e.target.value)} placeholder="Short description of the vendor's services..." rows={3} style={{ ...inp, resize: "vertical" }} /></Field>

          {/* ── ADDRESS ── */}
          <SectionTitle style={{ marginTop: 16 }}>Address & Locations</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20, marginTop: 12 }}>
            <Field label="Street"><TextInput value={f.street} onChange={v => set("street", v)} placeholder="Street address" /></Field>
            <Field label="City" required>
              <SelectInput value={f.city} onChange={v => set("city", v)} options={CITIES} />
            </Field>
            <Field label="State"><TextInput value={f.state} onChange={v => set("state", v)} placeholder="Delhi" /></Field>
            <Field label="GST Number"><TextInput value={f.gstNumber} onChange={v => set("gstNumber", v)} placeholder="Auto-generated if blank" /></Field>
            <Field label="PAN Number"><TextInput value={f.panNumber} onChange={v => set("panNumber", v)} placeholder="Auto-generated if blank" /></Field>
          </div>

          <Field label="Service Locations (select all cities)">
            <MultiCheck options={CITIES} value={f.locations} onChange={v => set("locations", v)} columns={4} />
          </Field>

          {/* ── STATS ── */}
          <SectionTitle style={{ marginTop: 16 }}>Experience & Team</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20, marginTop: 12 }}>
            <Field label="Years of Exp."><TextInput value={f.yearsOfExperience} onChange={v => set("yearsOfExperience", v)} placeholder="5" type="number" /></Field>
            <Field label="Team Size"><TextInput value={f.teamSize} onChange={v => set("teamSize", v)} placeholder="8" type="number" /></Field>
            <Field label="Events Done"><TextInput value={f.totalEventsCompleted} onChange={v => set("totalEventsCompleted", v)} placeholder="50" type="number" /></Field>
            <Field label="Max Concurrent"><TextInput value={f.maxConcurrentEvents} onChange={v => set("maxConcurrentEvents", v)} placeholder="5" type="number" /></Field>
          </div>

          {/* ── PHOTOS ── */}
          <SectionTitle>Portfolio Photos</SectionTitle>
          <div style={{ marginTop: 12, marginBottom: 20 }}>
            <p style={{ fontSize: 12, color: "#9B7450", margin: "0 0 10px" }}>
              After creating the vendor, use the <strong>Edit</strong> button to upload photos directly from your device.
            </p>
            <Field label="Or paste image URLs now (one per line, max 10)">
              <textarea value={f.portfolioPhotos} onChange={e => set("portfolioPhotos", e.target.value)} placeholder={"https://res.cloudinary.com/...\nhttps://res.cloudinary.com/..."} rows={3} style={{ ...inp, resize: "vertical", fontSize: 12 }} />
            </Field>
            {/* Photo previews */}
            {f.portfolioPhotos.trim() && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {f.portfolioPhotos.split("\n").map(s => s.trim()).filter(Boolean).map((url, i) => (
                  <div key={i} style={{ position: "relative", width: 72, height: 72 }}>
                    <img src={url} alt="" onError={e => (e.target.style.display="none")} style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover", border: "1.5px solid rgba(196,122,46,0.2)" }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── CATEGORY SPECIFIC ── */}
          {category === "DJ" && (
            <>
              <SectionTitle>DJ Details</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12, marginBottom: 20 }}>
                <Field label="Setup Type"><MultiCheck options={DJ_SETUP} value={djSetup} onChange={setDjSetup} columns={2} /></Field>
                <Field label="Event Types"><MultiCheck options={DJ_EVENTS} value={djEvents} onChange={setDjEvents} columns={3} /></Field>
                <Toggle label="Lights Included" value={djLights} onChange={setDjLights} />
              </div>
            </>
          )}

          {category === "Decorator" && (
            <>
              <SectionTitle>Decoration Details</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12, marginBottom: 20 }}>
                <Field label="Types of Decoration"><MultiCheck options={DEC_TYPES} value={decTypes} onChange={setDecTypes} columns={3} /></Field>
                <Field label="Venue Coverage"><MultiCheck options={DEC_COVERAGE} value={decCoverage} onChange={setDecCoverage} columns={2} /></Field>
                <Field label="Themes"><MultiCheck options={DEC_THEMES} value={decThemes} onChange={setDecThemes} columns={2} /></Field>
              </div>
            </>
          )}

          {category === "Caterer" && (
            <>
              <SectionTitle>Catering Details</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12, marginBottom: 20 }}>
                <Field label="Cuisine"><MultiCheck options={CAT_CUISINE} value={catCuisine} onChange={setCatCuisine} columns={3} /></Field>
                <Field label="Service Style"><MultiCheck options={CAT_STYLE} value={catStyle} onChange={setCatStyle} columns={2} /></Field>
                <Field label="Menu Type"><MultiCheck options={CAT_MENU} value={catMenu} onChange={setCatMenu} columns={3} /></Field>
                <Toggle label="Beverages Included" value={catBev} onChange={setCatBev} />
              </div>
            </>
          )}

          {category === "Photographer" && (
            <>
              <SectionTitle>Photography Details</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 12, marginBottom: 20 }}>

                {/* Which services */}
                <Field label="Which Services *">
                  <div style={{ display: "flex", gap: 8 }}>
                    {PHOTO_SVC.map(opt => (
                      <button key={opt} type="button" onClick={() => setPhotoSvc(opt)}
                        style={{ flex: 1, padding: "10px 8px", borderRadius: 10, border: `2px solid ${photoSvc === opt ? "#15803d" : "rgba(196,122,46,0.22)"}`, background: photoSvc === opt ? "rgba(21,128,61,0.08)" : "#FDFCF8", color: photoSvc === opt ? "#15803d" : "#2C1A0E", fontSize: 13, fontWeight: photoSvc === opt ? 700 : 500, cursor: "pointer", fontFamily: font, transition: "all 0.14s" }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Photography type */}
                <Field label="Photography Type">
                  <MultiCheck options={PHOTO_TYPES} value={photoTypes} onChange={setPhotoTypes} columns={2} />
                </Field>

                {/* Hours included */}
                <Field label="Hours Included">
                  <div style={{ display: "flex", gap: 8 }}>
                    {PHOTO_HOURS.map(opt => (
                      <button key={opt} type="button" onClick={() => setPhotoHours(opt)}
                        style={{ flex: 1, padding: "9px 6px", borderRadius: 10, border: `2px solid ${photoHours === opt ? "#C47A2E" : "rgba(196,122,46,0.22)"}`, background: photoHours === opt ? "rgba(196,122,46,0.08)" : "#FDFCF8", color: photoHours === opt ? "#C47A2E" : "#2C1A0E", fontSize: 13, fontWeight: photoHours === opt ? 700 : 500, cursor: "pointer", fontFamily: font, transition: "all 0.14s" }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Editing time */}
                <Field label="Editing Time (days)">
                  <div style={{ display: "flex", gap: 8 }}>
                    {PHOTO_EDITING.map(opt => (
                      <button key={opt} type="button" onClick={() => setPhotoEditing(opt)}
                        style={{ flex: 1, padding: "9px 6px", borderRadius: 10, border: `2px solid ${photoEditing === opt ? "#C47A2E" : "rgba(196,122,46,0.22)"}`, background: photoEditing === opt ? "rgba(196,122,46,0.08)" : "#FDFCF8", color: photoEditing === opt ? "#C47A2E" : "#2C1A0E", fontSize: 13, fontWeight: photoEditing === opt ? 700 : 500, cursor: "pointer", fontFamily: font, transition: "all 0.14s" }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Team count */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="No. of Photographers"><TextInput value={photoCount} onChange={setPhotoCount} placeholder="1" type="number" /></Field>
                  <Field label="No. of Videographers"><TextInput value={videoCount} onChange={setVideoCount} placeholder="0" type="number" /></Field>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Toggle label="Social Media Reels" value={photoSocial} onChange={setPhotoSocial} />
                  <Toggle label="Photo Album Included" value={photoAlbum} onChange={setPhotoAlbum} />
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "#fff5f5", border: "1px solid #fca5a5", color: "#c0392b", fontSize: 13, marginBottom: 16 }}>
              ❌ {error}
            </div>
          )}

          {/* Submit */}
          <div style={{ display: "flex", gap: 10, paddingTop: 8 }}>
            <button type="submit" disabled={submitting}
              style={{ flex: 1, padding: "13px", borderRadius: 10, border: "none", background: submitting ? "#e5e7eb" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: submitting ? "#9ca3af" : "#fff", fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: font, boxShadow: submitting ? "none" : "0 4px 16px rgba(196,122,46,0.35)" }}>
              {submitting ? "Adding Vendor..." : `Add ${cat.label} Vendor`}
            </button>
            <button type="button" onClick={onClose}
              style={{ padding: "13px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: "#9B7450", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}

// ── Overlay wrapper ───────────────────────────────────────────────────────────
function Overlay({ children, onClose, wide = false }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(28,10,0,0.55)", backdropFilter: "blur(3px)" }} />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        zIndex: 501, width: wide ? "min(96vw, 820px)" : "min(92vw, 480px)",
        height: "min(92vh, 900px)",
        background: "#FAF7F2",
        borderRadius: 20, boxShadow: "0 32px 80px rgba(28,10,0,0.22)",
        border: "1.5px solid rgba(196,122,46,0.2)",
        display: "flex", flexDirection: "column", overflow: "hidden",
        fontFamily: font,
      }}>
        {/* Close button */}
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 16, zIndex: 10, width: 30, height: 30, borderRadius: "50%", background: "rgba(196,122,46,0.1)", border: "none", color: "#9B7450", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        {children}
      </div>
    </>
  );
}
