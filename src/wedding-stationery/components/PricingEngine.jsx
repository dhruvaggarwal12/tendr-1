import React from "react";

const QUANTITIES = [25, 50, 75, 100, 150, 200];

export function calculatePrice(basePrice, qty) {
  const discount = qty >= 150 ? 0.12 : qty >= 100 ? 0.08 : qty >= 75 ? 0.05 : 0;
  const unitPrice = basePrice * (1 - discount);
  const total = unitPrice * qty;
  return { unitPrice, total: Math.round(total), discount };
}

export default function PricingEngine({ stationery, quantity, onQuantityChange }) {
  const { unitPrice, total, discount } = calculatePrice(stationery.basePrice, quantity);

  return (
    <div style={{ background: "#fff", border: "1px solid #EDE6D8", borderRadius: 8, padding: "20px 22px" }}>
      <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 400, color: "#1C1C1C", margin: "0 0 16px" }}>
        Pricing
      </h4>

      {/* Quantity */}
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#9B8C78", margin: "0 0 10px" }}>
          Quantity
        </p>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {QUANTITIES.map(q => (
            <button key={q} onClick={() => onQuantityChange(q)}
              style={{
                padding: "7px 12px", borderRadius: 6, fontSize: 13, cursor: "pointer",
                border: quantity === q ? "2px solid #C9A84C" : "1.5px solid #EDE6D8",
                background: quantity === q ? "rgba(201,168,76,0.08)" : "#FDFAF6",
                color: quantity === q ? "#1C1C1C" : "#6B5E52",
                fontWeight: quantity === q ? 700 : 400,
                fontFamily: "'Lato', sans-serif", transition: "all 0.15s",
              }}>
              {q}
            </button>
          ))}
        </div>
        {discount > 0 && (
          <p style={{ fontSize: 11, color: "#7A9E7E", margin: "6px 0 0", fontWeight: 600 }}>
            🎉 {Math.round(discount * 100)}% bulk discount applied
          </p>
        )}
      </div>

      {/* Price breakdown */}
      <div style={{ borderTop: "1px solid #EDE6D8", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6B5E52" }}>
          <span>Unit price</span>
          <span>₹{unitPrice.toFixed(0)} each</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6B5E52" }}>
          <span>Quantity</span>
          <span>× {quantity}</span>
        </div>
        {discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#7A9E7E" }}>
            <span>Bulk discount</span>
            <span>-{Math.round(discount * 100)}%</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontFamily: "'Cormorant Garamond', serif", color: "#1C1C1C", fontWeight: 600, borderTop: "1px solid #EDE6D8", paddingTop: 10, marginTop: 2 }}>
          <span>Total</span>
          <span>₹{total.toLocaleString("en-IN")}</span>
        </div>
        <p style={{ fontSize: 11, color: "#B8A898", margin: "4px 0 0", textAlign: "right" }}>
          Estimated delivery: {stationery.deliveryDays}–{stationery.deliveryDays + 3} business days
        </p>
      </div>
    </div>
  );
}
