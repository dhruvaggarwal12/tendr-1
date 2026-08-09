import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProducts } from "./memoriesData";
import HamburgerNav from "../../components/HamburgerNav";

const font = "'Outfit', sans-serif";

export default function MemoriesPage() {
  const [products, setProducts] = useState([]);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const navigate = useNavigate();

  useEffect(() => {
    setProducts(getProducts().filter((p) => p.available));
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleCardClick = (product) => {
    if (isMobile) {
      navigate(`/memories/${product.id}`);
    } else {
      window.open(`/memories/${product.id}`, "_blank");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f4ef", fontFamily: font }}>
      <HamburgerNav />

      <style>{`
        @keyframes mem-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .mem-in-0 { animation: mem-in 0.52s 0.05s cubic-bezier(.22,1,.36,1) both; }
        .mem-in-1 { animation: mem-in 0.52s 0.14s cubic-bezier(.22,1,.36,1) both; }
        .mem-in-2 { animation: mem-in 0.52s 0.23s cubic-bezier(.22,1,.36,1) both; }
        @media (prefers-reduced-motion: reduce) { .mem-in-0,.mem-in-1,.mem-in-2 { animation: none !important; opacity: 1 !important; } }
      `}</style>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#2C1A0E 0%,#4A2810 100%)", padding: "52px 24px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(196,122,46,0.18) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative" }}>
          <div className="mem-in-0" style={{ display: "inline-block", background: "rgba(204,171,74,0.15)", border: "1px solid rgba(204,171,74,0.3)", borderRadius: 100, padding: "5px 16px", fontSize: 11, fontWeight: 700, color: "#CCAB4A", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
            Memories by Tendr
          </div>
          <h1 className="mem-in-1" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 300, color: "#fff", margin: "0 0 12px", lineHeight: 1.2 }}>
            Make every event <em style={{ color: "#CCAB4A", fontStyle: "italic" }}>unforgettable</em>
          </h1>
          <p className="mem-in-2" style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: "0 auto", lineHeight: 1.7, maxWidth: 500 }}>
            From custom invitations to elegant décor — handpicked keepsakes for your celebrations.
          </p>
        </div>
      </div>

      {/* Product grid */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 120px" }}>
        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", color: "#9B7450", fontSize: 14 }}>
            No products available yet.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: 16 }}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isMobile={isMobile}
                onClick={() => handleCardClick(product)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function ProductCard({ product, isMobile, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: hovered ? "0 8px 28px rgba(44,26,14,0.14)" : "0 2px 10px rgba(44,26,14,0.07)",
        border: "1.5px solid rgba(196,122,46,0.12)",
        cursor: "pointer",
        transition: "all 0.2s",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: isMobile ? 130 : 180, overflow: "hidden" }}>
        <img
          src={product.images?.[0]}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s", transform: hovered ? "scale(1.04)" : "scale(1)" }}
        />
        {/* Price badge */}
        <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(44,26,14,0.82)", borderRadius: 100, padding: "3px 10px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#CCAB4A" }}>
            From ₹{product.startingPrice}
          </span>
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: isMobile ? "10px 10px 12px" : "14px 16px 16px" }}>
        <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 800, color: "#2C1A0E", marginBottom: 3, lineHeight: 1.2 }}>
          {product.name}
        </div>
        <div style={{ fontSize: isMobile ? 10 : 12, color: "#9B7450", lineHeight: 1.4, marginBottom: 12 }}>
          {product.tagline}
        </div>

        {/* Perfect for chips (desktop only) */}
        {!isMobile && product.perfectFor?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
            {product.perfectFor.slice(0, 3).map((tag) => (
              <span key={tag} style={{ fontSize: 10, color: "#C47A2E", background: "rgba(196,122,46,0.08)", borderRadius: 100, padding: "2px 8px", fontWeight: 600, border: "1px solid rgba(196,122,46,0.15)" }}>
                {tag}
              </span>
            ))}
            {product.perfectFor.length > 3 && (
              <span style={{ fontSize: 10, color: "#9B7450", padding: "2px 4px" }}>+{product.perfectFor.length - 3}</span>
            )}
          </div>
        )}

        <button
          style={{
            width: "100%",
            padding: isMobile ? "7px 0" : "9px 0",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg,#C47A2E,#CCAB4A)",
            color: "#fff",
            fontSize: isMobile ? 11 : 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: font,
          }}
        >
          View Details →
        </button>
      </div>
    </div>
  );
}
