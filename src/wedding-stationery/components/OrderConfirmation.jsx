import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const data = sessionStorage.getItem("ws_last_order");
    if (!data) { navigate("/wedding"); return; }
    setOrder(JSON.parse(data));
    sessionStorage.removeItem("ws_last_order");
    sessionStorage.removeItem("ws_design");
  }, []);

  if (!order) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: "'Lato', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>

        {/* Celebration icon */}
        <div style={{ fontSize: 56, marginBottom: 16 }}>💌</div>

        {/* Ornamental line */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, justifyContent: "center" }}>
          <div style={{ width: 60, height: 0.5, background: "#C9A84C" }} />
          <span style={{ color: "#C9A84C", fontSize: 12 }}>✦</span>
          <div style={{ width: 60, height: 0.5, background: "#C9A84C" }} />
        </div>

        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 300, color: "#1C1C1C", margin: "0 0 12px", lineHeight: 1.15 }}>
          Order Confirmed
        </h1>
        <p style={{ fontSize: 16, color: "#6B5E52", lineHeight: 1.75, margin: "0 0 32px" }}>
          Thank you, <strong>{order.customer.name}</strong>. Your stationery order has been received and our design team will begin working on it shortly.
        </p>

        {/* Order ID card */}
        <div style={{ background: "#fff", border: "1px solid #EDE6D8", borderRadius: 8, padding: "28px", marginBottom: 28, boxShadow: "0 2px 16px rgba(28,28,28,0.06)" }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#C9A84C", margin: "0 0 6px" }}>Order Reference</p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, color: "#1C1C1C", margin: "0 0 20px", letterSpacing: "0.05em" }}>{order.orderId}</p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", textAlign: "left" }}>
            {[
              ["Stationery", order.stationery.name],
              ["Quantity", `${order.quantity} pieces`],
              ["Palette", order.design.palette],
              ["Total Paid", `₹${order.total.toLocaleString("en-IN")}`],
              ["Delivery to", order.customer.address.split(",")[0]],
              ["Confirmation to", order.customer.email],
            ].map(([label, val]) => (
              <div key={label}>
                <p style={{ fontSize: 11, color: "#B8A898", margin: "0 0 2px", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</p>
                <p style={{ fontSize: 13, color: "#1C1C1C", margin: 0, fontWeight: 500 }}>{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What happens next */}
        <div style={{ background: "#fff", border: "1px solid #EDE6D8", borderRadius: 8, padding: "22px 24px", marginBottom: 28, textAlign: "left" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: "#1C1C1C", margin: "0 0 14px" }}>What happens next?</p>
          {[
            ["1", "Design Review", "Our team reviews your order and begins the final design within 1 business day."],
            ["2", "Approval Proof", "We send you a digital proof for approval before printing."],
            ["3", "Print & Dispatch", `Your beautiful stationery is printed and dispatched within ${order.stationery?.deliveryDays || 10}–14 days.`],
          ].map(([num, title, desc]) => (
            <div key={num} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#C9A84C", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {num}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1C1C1C", margin: "0 0 2px" }}>{title}</p>
                <p style={{ fontSize: 12, color: "#9B8C78", margin: 0, lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button onClick={() => navigate("/wedding")}
            style={{ padding: "12px 28px", background: "none", border: "1.5px solid #1C1C1C", borderRadius: 4, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", color: "#1C1C1C", fontFamily: "'Lato', sans-serif" }}>
            Order More
          </button>
          <button onClick={() => navigate("/wedding/admin")}
            style={{ padding: "12px 28px", background: "#1C1C1C", border: "none", borderRadius: 4, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", color: "#FAF7F2", fontFamily: "'Lato', sans-serif" }}>
            View All Orders →
          </button>
        </div>
      </div>
    </div>
  );
}
