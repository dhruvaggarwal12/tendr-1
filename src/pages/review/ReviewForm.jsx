import React, { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import logo from "../../assets/logos/tendr-logo-secondary.png";

const font = "'Outfit', sans-serif";
const BASE_URL = import.meta.env.VITE_BASE_URL;

function StarRating({ value, onChange, size = 36 }) {
  const [hover, setHover] = useState(0);
  const labels = ["", "Disappointed", "It was okay", "Good experience", "Really enjoyed it!", "Absolutely loved it! 🎉"];
  return (
    <div>
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4, 5].map(s => (
          <span
            key={s}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(s)}
            style={{
              fontSize: size, cursor: "pointer", lineHeight: 1, display: "inline-block",
              color: (hover || value) >= s ? "#CCAB4A" : "#E5D9C5",
              transform: (hover || value) >= s ? "scale(1.18)" : "scale(1)",
              transition: "color 0.1s, transform 0.1s",
            }}
          >★</span>
        ))}
      </div>
      {(hover || value) > 0 && (
        <div style={{ marginTop: 6, fontSize: 12.5, color: "#9B7450", fontStyle: "italic" }}>
          {labels[hover || value]}
        </div>
      )}
    </div>
  );
}

export default function ReviewForm() {
  const [params] = useSearchParams();
  const planId       = params.get("planId") || "";
  const name         = params.get("name") || "";
  const eventType    = params.get("event") || "";
  const vendorNames  = (params.get("vendors") || "").split(",").map(v => v.trim()).filter(Boolean);

  const [overall, setOverall] = useState(0);
  const [vendorRatings, setVendorRatings] = useState({});
  const [reviewText, setReviewText] = useState("");
  const [customerName, setCustomerName] = useState(name);
  const [photos, setPhotos] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(prev => {
      const remaining = 10 - prev.length;
      const toAdd = files.slice(0, remaining);
      return [
        ...prev,
        ...toAdd.map(f => ({ file: f, preview: URL.createObjectURL(f) })),
      ];
    });
    e.target.value = "";
  };

  const removePhoto = (i) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const handleSubmit = async () => {
    if (!overall) { setError("Please select an overall rating to continue."); return; }
    if (!customerName.trim()) { setError("Please enter your name."); return; }
    setError("");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("planId", planId);
      fd.append("customerName", customerName.trim());
      fd.append("eventType", eventType);
      fd.append("overallRating", overall);
      fd.append("reviewText", reviewText.trim());
      fd.append("vendorRatings", JSON.stringify(vendorRatings));
      photos.forEach(p => fd.append("photos", p.file));

      const res = await fetch(`${BASE_URL}/reviews`, {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Submission failed");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Thank you screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F4EF", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: font }}>
        <div style={{ maxWidth: 480, width: "100%", textAlign: "center", padding: "0 20px" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px", boxShadow: "0 8px 28px rgba(196,122,46,0.35)" }}>🌟</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem,5vw,2.8rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 12px" }}>
            Thank You!
          </h1>
          <p style={{ fontSize: 15, color: "#9B7450", lineHeight: 1.7, maxWidth: 380, margin: "0 auto 28px" }}>
            Your review means a lot to us. We're always working to make every Tendr event unforgettable — and you help us do that.
          </p>
          <img src={logo} alt="Tendr" style={{ height: 36, opacity: 0.65 }} />
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "14px 24px", display: "flex", alignItems: "center" }}>
        <img src={logo} alt="Tendr" style={{ height: 30 }} />
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 20px 80px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>✨</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.9rem,5vw,2.5rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 8px" }}>
            How was your event?
          </h1>
          <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>
            {eventType ? `Rate your ${eventType} experience` : "Share your Tendr experience"}
          </p>
        </div>

        {/* Name */}
        <div style={{ background: "#FFFCF7", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "20px 22px", marginBottom: 14 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em", display: "block", marginBottom: 8 }}>
            Your Name
          </label>
          <input
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
            placeholder="Enter your name"
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", fontSize: 14, fontFamily: font, color: "#2C1A0E", background: "#FDFCF8", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        {/* Overall rating */}
        <div style={{ background: "#FFFCF7", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "20px 22px", marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>
            Overall Experience *
          </div>
          <StarRating value={overall} onChange={setOverall} size={40} />
        </div>

        {/* Per-vendor ratings */}
        {vendorNames.length > 0 && (
          <div style={{ background: "#FFFCF7", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "20px 22px", marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16 }}>
              Rate Your Vendors
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {vendorNames.map(v => (
                <div key={v}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#2C1A0E", marginBottom: 8 }}>
                    {v}
                  </div>
                  <StarRating value={vendorRatings[v] || 0} onChange={val => setVendorRatings(prev => ({ ...prev, [v]: val }))} size={30} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review text */}
        <div style={{ background: "#FFFCF7", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "20px 22px", marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
            Share Your Experience
          </div>
          <textarea
            value={reviewText}
            onChange={e => setReviewText(e.target.value)}
            placeholder="What made your event special? How can we improve? Every word helps us do better."
            rows={4}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", fontSize: 13.5, fontFamily: font, color: "#2C1A0E", background: "#FDFCF8", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.65 }}
          />
        </div>

        {/* Photo upload */}
        <div style={{ background: "#FFFCF7", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "20px 22px", marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
            📸 Event Photos <span style={{ fontWeight: 400, color: "#9B7450", textTransform: "none", letterSpacing: 0 }}>(optional — up to 10)</span>
          </div>

          {photos.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(82px, 1fr))", gap: 8, marginBottom: 12 }}>
              {photos.map((p, i) => (
                <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <img src={p.preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    onClick={() => removePhoto(i)}
                    style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.65)", color: "#fff", border: "none", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          {photos.length < 10 && (
            <>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple style={{ display: "none" }} onChange={handlePhotoChange} />
              <button
                onClick={() => fileRef.current?.click()}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, border: "1.5px dashed rgba(196,122,46,0.4)", background: "transparent", color: "#C47A2E", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, transition: "background 0.15s" }}
              >
                📷 Add Photos ({photos.length}/10)
              </button>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#fff5f5", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#c0392b", marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ width: "100%", padding: "16px", borderRadius: 12, border: "none", background: submitting ? "#ccc" : "linear-gradient(135deg,#2C1A0E,#4A2810)", color: submitting ? "#999" : "#CCAB4A", fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: font, letterSpacing: "0.03em", transition: "opacity 0.18s" }}
        >
          {submitting ? "Submitting…" : "Submit Review ✨"}
        </button>

        <p style={{ textAlign: "center", fontSize: 11, color: "#9B7450", marginTop: 16, lineHeight: 1.6 }}>
          Your feedback is private and helps us improve every event we plan.
        </p>
      </div>
    </div>
  );
}
