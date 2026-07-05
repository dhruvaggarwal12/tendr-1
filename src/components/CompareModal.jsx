import React, { useEffect, useState } from "react";
import ComparisonMatrix from "./ComparisonMatrix";
import { getVendorById } from "../apis/vendorApi";

const font = "'Outfit', sans-serif";

const CompareModal = ({ open, onClose, vendors = [] }) => {
  const [loading, setLoading] = useState(false);
  const [fullVendors, setFullVendors] = useState(vendors);

  useEffect(() => {
    if (!open || vendors.length < 2) {
      setLoading(false);
      if (vendors.length >= 1) setFullVendors(vendors);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all(
      vendors.map(async (v) => {
        if (!v?._id) return v;
        try { return { ...v, ...(await getVendorById(v._id)), __full: true }; }
        catch { return v; }
      })
    ).then((results) => { if (!cancelled) setFullVendors(results); })
     .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, vendors]);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,10,0,0.5)", backdropFilter: "blur(3px)" }} />

      {/* Modal */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "min(96vw, 920px)", maxHeight: "90vh",
        background: "#FAF7F2", borderRadius: 20,
        boxShadow: "0 32px 80px rgba(28,10,0,0.22)",
        border: "1.5px solid rgba(201,168,76,0.2)",
        display: "flex", flexDirection: "column",
        fontFamily: font, overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0 }}>Compare Vendors</h2>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", margin: "2px 0 0" }}>
              {fullVendors.length} vendor{fullVendors.length !== 1 ? "s" : ""} · Tendr picks the best for you
            </p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", padding: "12px 6px" }}>
          <div>
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${vendors.length}, 1fr)`, gap: 16 }}>
                {vendors.map((_, i) => (
                  <div key={i} style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid rgba(201,168,76,0.12)" }}>
                    <div style={{ height: 140, background: "#E8DFD0", animation: "skeleton-pulse 1.4s ease-in-out infinite" }} />
                    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                      {[80, 60, 90, 50].map((w, j) => (
                        <div key={j} style={{ height: 12, width: `${w}%`, background: "#E8DFD0", borderRadius: 6, animation: "skeleton-pulse 1.4s ease-in-out infinite" }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ComparisonMatrix vendors={fullVendors} />
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default CompareModal;
