import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "./memoriesData";
import HamburgerNav from "../../components/HamburgerNav";

const font = "'Outfit', sans-serif";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function MemoryProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);

  useEffect(() => {
    const p = getProductById(id);
    if (!p) { navigate("/memories", { replace: true }); return; }
    setProduct(p);
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [id]);

  if (!product) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f4ef", fontFamily: font }}>
      <HamburgerNav />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 120px" }}>
        {/* Back button */}
        <button
          onClick={() => navigate("/memories")}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 20, padding: 0, fontFamily: font }}
        >
          ← Back to Memories
        </button>

        {/* Photo gallery */}
        <div style={{ borderRadius: 18, overflow: "hidden", marginBottom: 20, background: "#fff", boxShadow: "0 4px 20px rgba(44,26,14,0.1)", border: "1.5px solid rgba(196,122,46,0.12)" }}>
          {/* Main image */}
          <div style={{ height: isMobile ? 220 : 340, overflow: "hidden" }}>
            <img
              src={product.images?.[activeImg]}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.2s" }}
            />
          </div>
          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div style={{ display: "flex", gap: 8, padding: "10px 12px" }}>
              {product.images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveImg(i)}
                  style={{ width: 52, height: 52, borderRadius: 8, overflow: "hidden", cursor: "pointer", border: `2px solid ${i === activeImg ? "#C47A2E" : "rgba(196,122,46,0.18)"}`, flexShrink: 0, transition: "border-color 0.15s" }}
                >
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Name + tagline */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#2C1A0E", margin: "0 0 6px", lineHeight: 1.2 }}>
            {product.name}
          </h1>
          <p style={{ fontSize: 14, color: "#9B7450", margin: 0, lineHeight: 1.6 }}>
            {product.tagline}
          </p>
        </div>

        {/* Perfect for */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 14, border: "1.5px solid rgba(196,122,46,0.12)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            ✨ Perfect for
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {product.perfectFor?.map((tag) => (
              <span
                key={tag}
                style={{ fontSize: 12, color: "#5a3a1a", background: "rgba(196,122,46,0.07)", border: "1px solid rgba(196,122,46,0.18)", borderRadius: 100, padding: "4px 12px", fontWeight: 500 }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Description */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 14, border: "1.5px solid rgba(196,122,46,0.12)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            About this product
          </div>
          <p style={{ fontSize: 13, color: "#3D2210", margin: 0, lineHeight: 1.75 }}>
            {product.description}
          </p>
        </div>

        {/* What's included */}
        {product.includes?.length > 0 && (
          <div style={{ background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 20, border: "1.5px solid rgba(196,122,46,0.12)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              What's included
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {product.includes.map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "#C47A2E", fontWeight: 900, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 13, color: "#3D2210", lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pricing + CTA */}
        <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 16, padding: "20px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 4 }}>Starting from</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#CCAB4A", lineHeight: 1 }}>
              ₹{product.startingPrice}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>{product.unit}</div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{ padding: "13px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 16px rgba(196,122,46,0.45)", whiteSpace: "nowrap" }}
          >
            Book Now →
          </button>
        </div>
      </div>

      {/* Booking modal */}
      {showModal && (
        <BookingModal product={product} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

// ── Booking form modal ───────────────────────────────────────────────────────

function BookingModal({ product, onClose }) {
  const [form, setForm] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Send to backend if available, otherwise store locally
      const payload = { product: product.id, productName: product.name, ...form, submittedAt: new Date().toISOString() };
      try {
        await fetch(`${BASE_URL}/memories/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
      } catch {}
      // Always save locally as fallback
      const existing = JSON.parse(localStorage.getItem("tendr:memory_orders") || "[]");
      localStorage.setItem("tendr:memory_orders", JSON.stringify([...existing, payload]));
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }}
      />
      {/* Modal */}
      <div
        style={{
          position: "fixed", zIndex: 1201,
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "min(96vw, 480px)",
          maxHeight: "88vh",
          background: "#FFFCF5",
          borderRadius: 20,
          boxShadow: "0 24px 70px rgba(44,26,14,0.25)",
          border: "1.5px solid rgba(196,122,46,0.2)",
          display: "flex", flexDirection: "column",
          fontFamily: font,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>Book — {product.name}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>We'll reach out within 2 hours</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontSize: 14, width: 30, height: 30, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "30px 16px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E", marginBottom: 8 }}>Request received!</div>
              <div style={{ fontSize: 13, color: "#9B7450", lineHeight: 1.7 }}>
                We'll call you on <strong>{form.phone}</strong> within 2 hours to confirm your order.
              </div>
              <button onClick={onClose} style={{ marginTop: 20, padding: "10px 28px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {product.bookingFields?.map((field) => (
                <div key={field.key}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#5a3a1a", display: "block", marginBottom: 5 }}>
                    {field.label}{field.required && <span style={{ color: "#e53e3e" }}> *</span>}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      value={form[field.key] || ""}
                      onChange={(e) => set(field.key, e.target.value)}
                      placeholder={field.placeholder || ""}
                      required={field.required}
                      rows={3}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", fontSize: 13, fontFamily: font, outline: "none", resize: "vertical", background: "#fff", boxSizing: "border-box", color: "#1a1a1a" }}
                    />
                  ) : field.type === "select" ? (
                    <select
                      value={form[field.key] || ""}
                      onChange={(e) => set(field.key, e.target.value)}
                      required={field.required}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", fontSize: 13, fontFamily: font, outline: "none", background: "#fff", color: "#1a1a1a" }}
                    >
                      <option value="">Select...</option>
                      {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      value={form[field.key] || ""}
                      onChange={(e) => set(field.key, e.target.value)}
                      placeholder={field.placeholder || ""}
                      required={field.required}
                      min={field.type === "number" ? 1 : undefined}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", fontSize: 13, fontFamily: font, outline: "none", background: "#fff", boxSizing: "border-box", color: "#1a1a1a" }}
                    />
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={submitting}
                style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: submitting ? "#e5e7eb" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: submitting ? "#9ca3af" : "#fff", fontSize: 14, fontWeight: 800, cursor: submitting ? "not-allowed" : "pointer", fontFamily: font, marginTop: 4 }}
              >
                {submitting ? "Submitting…" : "Submit Request →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
