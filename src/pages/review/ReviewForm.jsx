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
  const planId = params.get("planId") || "";

  // Auto-fetched plan data
  const [planData, setPlanData]     = useState(null);
  const [planLoading, setPlanLoading] = useState(!!planId);

  const [overall, setOverall]           = useState(0);
  const [vendorRatings, setVendorRatings] = useState({});   // { vendorId: score }
  const [reviewText, setReviewText]     = useState("");
  const [photos, setPhotos]             = useState([]);
  const [submitted, setSubmitted]       = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState("");
  const fileRef = useRef();

  // Upcoming events (optional lead section)
  const [upcomingEventType, setUpcomingEventType] = useState("");
  const [upcomingDate, setUpcomingDate]           = useState("");
  const [upcomingWhatsApp, setUpcomingWhatsApp]   = useState("");

  // Fetch plan data from planId
  React.useEffect(() => {
    if (!planId) { setPlanLoading(false); return; }
    fetch(`${BASE_URL}/event-plans/${planId}/review-data`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setPlanData(d); })
      .catch(() => {})
      .finally(() => setPlanLoading(false));
  }, [planId]);

  // Derived from fetched data
  const eventType   = planData?.eventType || "";
  const date        = planData?.date       || "";
  const vendors     = planData?.vendors    || [];  // [{ serviceType, vendorName, vendorId }]

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
    if (!overall) { setError("Please give an overall rating to continue."); return; }
    setError("");
    setSubmitting(true);
    try {
      // Upload event photos to /event-photos (stored 1 year in customer dashboard)
      if (photos.length > 0 && planId) {
        const photoFd = new FormData();
        photoFd.append("planId", planId);
        photoFd.append("eventType", eventType);
        photoFd.append("eventDate", date);
        photos.forEach(p => photoFd.append("photos", p.file));
        await fetch(`${BASE_URL}/event-photos`, { method: "POST", body: photoFd }).catch(() => {});
      }

      // Submit review text + ratings (best-effort — no auth required fields sent)
      const fd = new FormData();
      fd.append("planId", planId);
      fd.append("eventType", eventType);
      fd.append("overallRating", overall);
      fd.append("reviewText", reviewText.trim());
      fd.append("vendorRatings", JSON.stringify(vendorRatings));
      if (upcomingEventType || upcomingDate || upcomingWhatsApp) {
        fd.append("upcomingEventType", upcomingEventType);
        fd.append("upcomingDate", upcomingDate);
        fd.append("upcomingWhatsApp", upcomingWhatsApp);
      }
      await fetch(`${BASE_URL}/event-plans/${planId}/review`, {
        method: "POST", body: fd, credentials: "include",
      }).catch(() => {});

      setSubmitted(true);
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

  // Loading while fetching plan
  if (planLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8F4EF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>
        <div style={{ textAlign: "center", color: "#C47A2E" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
          <div style={{ fontSize: 14 }}>Loading your review...</div>
        </div>
      </div>
    );
  }

  const SVC_EMOJI = { Caterer: "🍽️", Decorator: "🎀", Photographer: "📸", DJ: "🎵" };

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "14px 24px", display: "flex", alignItems: "center" }}>
        <img src={logo} alt="Tendr" style={{ height: 30 }} />
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 20px 80px" }}>

        {/* Personalised Hero */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🌟</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,5vw,2.4rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 10px" }}>
            {eventType && date
              ? `How was your ${eventType} on ${date}?`
              : eventType
              ? `How was your ${eventType}?`
              : "How was your event?"}
          </h1>
          <p style={{ fontSize: 14, color: "#9B7450", margin: 0 }}>
            Takes 2 minutes — your feedback helps vendors improve and helps others choose
          </p>
        </div>

        {/* Per-vendor ratings — one card per service */}
        {vendors.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 14 }}>
            {vendors.map(v => (
              <div key={v.vendorId || v.serviceType} style={{ background: "#FFFCF7", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 24 }}>{SVC_EMOJI[v.serviceType] || "⭐"}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E" }}>{v.vendorName}</div>
                    <div style={{ fontSize: 11, color: "#9B7450" }}>{v.serviceType}</div>
                  </div>
                </div>
                <StarRating
                  value={vendorRatings[v.vendorId || v.serviceType] || 0}
                  onChange={val => setVendorRatings(prev => ({ ...prev, [v.vendorId || v.serviceType]: val }))}
                  size={34}
                />
              </div>
            ))}
          </div>
        )}

        {/* Overall platform rating */}
        <div style={{ background: "#FFFCF7", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "18px 22px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 24 }}>🏆</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E" }}>Tendr Overall</div>
              <div style={{ fontSize: 11, color: "#9B7450" }}>Platform experience *</div>
            </div>
          </div>
          <StarRating value={overall} onChange={setOverall} size={34} />
        </div>

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

        {/* Upcoming events — optional lead capture */}
        <div style={{ background: "linear-gradient(135deg,rgba(196,122,46,0.06),rgba(204,171,74,0.04))", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.2)", padding: "20px 22px", marginBottom: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
            🎉 Planning Another Event?
          </div>
          <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 14px", lineHeight: 1.6 }}>
            Tell us a little about your next event — we'll reach out and make sure you get the best vendors for it!
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Occasion", placeholder: "Birthday, Anniversary, Baby Shower…", value: upcomingEventType, set: setUpcomingEventType, type: "text" },
              { label: "Approximate date or month", placeholder: "August 2026, next Diwali…", value: upcomingDate, set: setUpcomingDate, type: "text" },
              { label: "Your WhatsApp number", placeholder: "+91 98765 43210", value: upcomingWhatsApp, set: setUpcomingWhatsApp, type: "tel" },
            ].map(({ label, placeholder, value, set, type }) => (
              <div key={label}>
                <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#6B3A1F", marginBottom: 4 }}>{label}</label>
                <input type={type} placeholder={placeholder} value={value} onChange={e => set(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", fontSize: 13, fontFamily: font, color: "#2C1A0E", background: "#FDFCF8", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
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
