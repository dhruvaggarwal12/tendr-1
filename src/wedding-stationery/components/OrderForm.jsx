import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { calculatePrice } from "./PricingEngine";
import CardPreview from "./CardPreview";
import { getTypeById } from "../data/stationeryTypes";

const Input = ({ label, value, onChange, placeholder, required, type = "text", ...rest }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B5E52", marginBottom: 6 }}>
      {label} {required && <span style={{ color: "#C9A84C" }}>*</span>}
    </label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
      {...rest}
      style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #EDE6D8", borderRadius: 6, fontSize: 14, fontFamily: "'Lato', sans-serif", color: "#1C1C1C", background: "#FDFAF6", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }}
      onFocus={e => (e.currentTarget.style.borderColor = "#C9A84C")}
      onBlur={e => (e.currentTarget.style.borderColor = "#EDE6D8")}
    />
  </div>
);

export default function OrderForm() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", eventDate: "", address: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("ws_design");
    if (!data) { navigate("/wedding"); return; }
    setSession(JSON.parse(data));
  }, []);

  if (!session) return null;

  const { design, quantity, stationery: s } = session;
  const stationery = getTypeById(s.id);
  const { total } = calculatePrice(s.basePrice, quantity);

  const setField = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const orderId = `WS-${Date.now()}`;
    const order = {
      orderId, placedAt: new Date().toISOString(),
      customer: form,
      stationery: { id: s.id, name: s.name },
      design: {
        palette: design.palette.name,
        font: design.fontPairing.name,
        fields: design.fields,
        showFloral: design.showFloral,
        showMonogram: design.showMonogram,
        dividerStyle: design.dividerStyle,
      },
      quantity, total, status: "Pending",
    };
    const existing = JSON.parse(localStorage.getItem("ws_orders") || "[]");
    localStorage.setItem("ws_orders", JSON.stringify([order, ...existing]));
    sessionStorage.setItem("ws_last_order", JSON.stringify(order));
    setTimeout(() => navigate("/wedding/confirmation"), 400);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "'Lato', sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #EDE6D8", padding: "16px 32px", display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={() => navigate(`/wedding/design/${s.id}`)} style={{ fontSize: 13, color: "#9B8C78", background: "none", border: "none", cursor: "pointer" }}>← Back to Design</button>
        <div style={{ width: 1, height: 20, background: "#EDE6D8" }} />
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400, color: "#1C1C1C", margin: 0 }}>
          Complete Your Order
        </h2>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "1fr 380px", gap: 32 }}>

        {/* LEFT — Form */}
        <div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, color: "#1C1C1C", margin: "0 0 24px" }}>
            Your Details
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <Input label="Full Name" value={form.name} onChange={setField("name")} placeholder="Alexandra Smith" required />
              <Input label="Email Address" value={form.email} onChange={setField("email")} placeholder="hello@example.com" type="email" required />
              <Input label="Phone Number" value={form.phone} onChange={setField("phone")} placeholder="+91 98765 43210" required />
              <Input label="Event Date" value={form.eventDate} onChange={setField("eventDate")} placeholder="14 June 2025" type="date" required min={new Date().toISOString().split("T")[0]} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B5E52", marginBottom: 6 }}>
                Delivery Address <span style={{ color: "#C9A84C" }}>*</span>
              </label>
              <textarea value={form.address} onChange={e => setField("address")(e.target.value)} placeholder="Full delivery address including pincode" required rows={3}
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #EDE6D8", borderRadius: 6, fontSize: 14, fontFamily: "'Lato', sans-serif", color: "#1C1C1C", background: "#FDFAF6", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#C9A84C")}
                onBlur={e => (e.currentTarget.style.borderColor = "#EDE6D8")} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B5E52", marginBottom: 6 }}>
                Special Notes
              </label>
              <textarea value={form.notes} onChange={e => setField("notes")(e.target.value)} placeholder="Any special instructions, colour preferences, or requests..." rows={3}
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #EDE6D8", borderRadius: 6, fontSize: 14, fontFamily: "'Lato', sans-serif", color: "#1C1C1C", background: "#FDFAF6", outline: "none", resize: "vertical", boxSizing: "border-box" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#C9A84C")}
                onBlur={e => (e.currentTarget.style.borderColor = "#EDE6D8")} />
            </div>
            <button type="submit" disabled={submitting}
              style={{ width: "100%", padding: "15px", background: submitting ? "#9B8C78" : "#1C1C1C", color: "#FAF7F2", border: "none", borderRadius: 4, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", cursor: submitting ? "not-allowed" : "pointer", fontFamily: "'Lato', sans-serif", fontWeight: 600, transition: "background 0.2s" }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = "#C9A84C"; }}
              onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = "#1C1C1C"; }}
            >
              {submitting ? "Placing Order..." : "Place Order →"}
            </button>
          </form>
        </div>

        {/* RIGHT — Summary */}
        <div>
          <div style={{ background: "#fff", border: "1px solid #EDE6D8", borderRadius: 8, overflow: "hidden", position: "sticky", top: 80 }}>
            <div style={{ padding: "20px 22px", borderBottom: "1px solid #EDE6D8" }}>
              <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400, color: "#1C1C1C", margin: 0 }}>
                Order Summary
              </h4>
            </div>

            {/* Mini card preview */}
            {stationery && (
              <div style={{ background: "linear-gradient(135deg,#F5F0E8,#EDE5D5)", padding: "24px", display: "flex", justifyContent: "center" }}>
                <div style={{ transform: "scale(0.55)", transformOrigin: "top center", marginBottom: "-60px" }}>
                  <CardPreview design={design} stationery={stationery} />
                </div>
              </div>
            )}

            <div style={{ padding: "20px 22px" }}>
              {[
                ["Stationery", s.name],
                ["Colour Palette", design.palette.name],
                ["Typography", design.fontPairing.name],
                ["Couple Names", design.fields.coupleNames || "—"],
                ["Event Date", design.fields.date || "—"],
                ["Quantity", `${quantity} pieces`],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: "#9B8C78" }}>{label}</span>
                  <span style={{ color: "#1C1C1C", fontWeight: 500, textAlign: "right", maxWidth: "55%" }}>{value}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #EDE6D8", paddingTop: 12, marginTop: 8, display: "flex", justifyContent: "space-between", fontFamily: "'Cormorant Garamond', serif", fontSize: 20 }}>
                <span style={{ color: "#1C1C1C" }}>Total</span>
                <span style={{ color: "#1C1C1C", fontWeight: 600 }}>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
