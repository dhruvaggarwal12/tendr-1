import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getStationeryProducts, STATIONERY_CATEGORIES, DEFAULT_STATIONERY } from "./stationeryProducts";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";

const font = "'Outfit', sans-serif";
const WA_NUMBER = "919211668427";

const CAT_META = {
  "Branding & Identity": { icon: "✦",  grad: "linear-gradient(135deg,#D4A843,#C47A2E)", color: "#C47A2E", light: "rgba(196,122,46,0.08)" },
  "Event Signage":       { icon: "🪧", grad: "linear-gradient(135deg,#8D6039,#B8792B)", color: "#8D6039", light: "rgba(141,96,57,0.08)" },
  "Itinerary":           { icon: "📋", grad: "linear-gradient(135deg,#3949AB,#5C6BC0)", color: "#3949AB", light: "rgba(57,73,171,0.08)" },
  "Guest Accessories":   { icon: "🎀", grad: "linear-gradient(135deg,#9C3B55,#C2607C)", color: "#9C3B55", light: "rgba(156,59,85,0.08)" },
  "Hashtag Services":    { icon: "#",  grad: "linear-gradient(135deg,#2E7D55,#43A07A)", color: "#2E7D55", light: "rgba(46,125,85,0.08)" },
  "Invitations":         { icon: "💌", grad: "linear-gradient(135deg,#7A3A1E,#C47A2E)", color: "#7A3A1E", light: "rgba(122,58,30,0.08)" },
  "Envelopes":           { icon: "✉",  grad: "linear-gradient(135deg,#5D4037,#8D6E63)", color: "#5D4037", light: "rgba(93,64,55,0.08)" },
  "Coffee Table Booklet":{ icon: "📖", grad: "linear-gradient(135deg,#3E2723,#6D4C41)", color: "#3E2723", light: "rgba(62,39,35,0.08)" },
  "Cards":               { icon: "🃏", grad: "linear-gradient(135deg,#6A1B4D,#9C3B7A)", color: "#6A1B4D", light: "rgba(106,27,77,0.08)" },
  "Other":               { icon: "✨", grad: "linear-gradient(135deg,#7A5535,#9B7450)", color: "#7A5535", light: "rgba(122,85,53,0.08)" },
};

function getPriceDisplay(item) {
  if (item.priceOnRequest) return { main: "Price on request", note: null };
  if (item.priceRange)     return { main: item.priceRange,   note: "+ printing & delivery" };
  if (item.startingPrice)  return { main: `₹${Number(item.startingPrice).toLocaleString("en-IN")}`, note: "+ printing & delivery" };
  return { main: "—", note: null };
}

function buildWhatsAppMessage(cart, form) {
  const lines = [];
  lines.push("🌸 *Wedding Stationery Order — Tendr*");
  lines.push("");
  lines.push(`👤 *Name:* ${form.name}`);
  lines.push(`📞 *Phone:* ${form.phone}`);
  lines.push(`📍 *Address:* ${form.address}`);
  lines.push(`📅 *Event Date:* ${form.date}`);
  lines.push("");
  lines.push("*🛒 Items Selected:*");
  cart.forEach(({ item, quantity }, i) => {
    const price = item.priceOnRequest
      ? "Price on request"
      : item.priceRange
      ? item.priceRange
      : item.startingPrice
      ? `₹${Number(item.startingPrice).toLocaleString("en-IN")} per ${item.unit || "piece"}`
      : "—";
    lines.push(`${i + 1}. ${item.name} × ${quantity} ${item.unit || "pcs"} — ${price}`);
  });
  lines.push("");
  lines.push("📌 *Note:* Design prices shown. Printing & delivery will be quoted separately.");
  lines.push("");
  lines.push("_Sent via tendr.co.in_");
  return lines.join("\n");
}

export default function WeddingStationery() {
  const navigate = useNavigate();
  // Pre-fill with defaults so mobile always sees content immediately while API loads
  const [items, setItems]               = useState(DEFAULT_STATIONERY.filter(p => p.available));
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);
  const [hoveredId, setHoveredId]       = useState(null);
  const sectionRefs = useRef({});

  // Cart
  const [cart, setCart]                 = useState([]);
  const [showCart, setShowCart]         = useState(false);

  // Quantity picker modal
  const [qtyPicker, setQtyPicker]       = useState(null); // item or null
  const [qty, setQty]                   = useState(1);

  // WhatsApp form modal
  const [showWaForm, setShowWaForm]     = useState(false);
  const [waForm, setWaForm]             = useState({ name: "", phone: "", address: "", date: "" });
  const [waErr, setWaErr]               = useState("");

  useEffect(() => {
    getStationeryProducts().then((data) => setItems(data.filter((p) => p.available)));
  }, []);

  // Lock body scroll when any overlay is open
  useEffect(() => {
    const open = selectedItem || showCart || qtyPicker || showWaForm;
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedItem, showCart, qtyPicker, showWaForm]);

  const categories = ["All", ...STATIONERY_CATEGORIES.filter((c) => items.some((i) => i.category === c))];

  const scrollToCategory = (cat) => {
    setActiveCategory(cat);
    if (cat === "All") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const el = sectionRefs.current[cat];
    if (el) { const y = el.getBoundingClientRect().top + window.scrollY - 60; window.scrollTo({ top: y, behavior: "smooth" }); }
  };

  const groupedItems = STATIONERY_CATEGORIES.reduce((acc, cat) => {
    const catItems = items.filter((i) => i.category === cat);
    if (catItems.length) acc[cat] = catItems;
    return acc;
  }, {});

  // Cart helpers
  const cartCount = cart.reduce((s, c) => s + Number(c.quantity), 0);
  const itemInCart = (item) => cart.find((c) => (c.item._id || c.item.id) === (item._id || item.id));

  const openQtyPicker = (e, item) => {
    e.stopPropagation();
    setQty(itemInCart(item)?.quantity || 1);
    setQtyPicker(item);
  };

  const confirmAddToCart = () => {
    if (!qty || qty < 1) return;
    setCart((prev) => {
      const id = qtyPicker._id || qtyPicker.id;
      const exists = prev.find((c) => (c.item._id || c.item.id) === id);
      if (exists) return prev.map((c) => (c.item._id || c.item.id) === id ? { ...c, quantity: Number(qty) } : c);
      return [...prev, { item: qtyPicker, quantity: Number(qty) }];
    });
    setQtyPicker(null);
  };

  const removeFromCart = (item) => {
    const id = item._id || item.id;
    setCart((prev) => prev.filter((c) => (c.item._id || c.item.id) !== id));
  };

  // WhatsApp send
  const handleWaSend = () => {
    setWaErr("");
    if (!waForm.name.trim())    { setWaErr("Name is required"); return; }
    if (!waForm.phone.trim())   { setWaErr("Phone number is required"); return; }
    if (!waForm.address.trim()) { setWaErr("Address is required"); return; }
    if (!waForm.date.trim())    { setWaErr("Event date is required"); return; }
    const msg = buildWhatsAppMessage(cart, waForm);
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    setShowWaForm(false);
    setShowCart(false);
  };

  const pricedTotal = cart.reduce((sum, { item, quantity }) => {
    if (item.priceOnRequest || !item.startingPrice) return sum;
    return sum + item.startingPrice * Number(quantity);
  }, 0);
  const hasUnpriced = cart.some((c) => c.item.priceOnRequest);

  return (
    <div style={{ minHeight: "100vh", background: "#FAF5EE", fontFamily: font }}>
      <SEO title="Wedding Stationeries — Tendr" description="Custom wedding stationeries — itineraries, invitations, envelopes, hashtag packages, coffee table booklets and more." path="/stationery" />
      <BasicSpeedDial />
      <HamburgerNav title="Wedding Stationeries" />

      {/* ── HERO ── */}
      <div style={{ background: "linear-gradient(150deg,#FFFAF3 0%,#FFF6E8 40%,#FDF0D8 100%)", padding: "28px 24px 24px", textAlign: "center", position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(196,122,46,0.1)" }}>
        <div style={{ position: "absolute", top: -50, left: -50, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle,rgba(204,171,74,0.14),transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle,rgba(196,122,46,0.11),transparent 65%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ color: "#C9A84C", fontSize: 14 }}>✦</span>
          <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#C47A2E", margin: 0 }}>Crafted with love</p>
          <span style={{ color: "#C9A84C", fontSize: 14 }}>✦</span>
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.1rem,5.5vw,3.2rem)", fontWeight: 300, color: "#1C1208", margin: "0 0 8px", letterSpacing: "0.02em", fontStyle: "italic", lineHeight: 1.1 }}>
          Wedding Stationeries
        </h1>
        <p style={{ fontSize: 13, color: "#7A5535", maxWidth: 440, margin: "0 auto 6px", lineHeight: 1.5 }}>
          Beautifully designed, fully personalised — no templates, no shortcuts.
        </p>
        <p style={{ fontSize: 11, color: "#B89060", margin: 0, fontStyle: "italic" }}>
          Design prices shown. Printing &amp; delivery charged separately.
        </p>
      </div>

      {/* ── Category pills ── */}
      {categories.length > 2 && (
        <div style={{ background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.1)", position: "sticky", top: 0, zIndex: 20 }}>
          <div className="cat-pill-row" style={{ display: "flex", padding: "0 16px", maxWidth: 1100, margin: "0 auto", overflowX: "auto" }}>
            {categories.map((cat) => (
              <button key={cat} onClick={() => scrollToCategory(cat)} style={{ padding: "14px 16px", background: "none", border: "none", borderBottom: activeCategory === cat ? "2.5px solid #C47A2E" : "2.5px solid transparent", color: activeCategory === cat ? "#C47A2E" : "#9B7450", fontSize: 12, fontWeight: activeCategory === cat ? 800 : 600, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", transition: "color 0.15s", flexShrink: 0 }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Items ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 20px 100px" }}>
        {items.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💍</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#2C1A0E", marginBottom: 6 }}>Catalogue coming soon</div>
            <div style={{ fontSize: 14, color: "#9B7450" }}>Our stationery collection will be available here shortly.</div>
          </div>
        )}

        {Object.entries(groupedItems).map(([cat, catItems]) => {
          const meta = CAT_META[cat] || CAT_META["Other"];
          return (
            <section key={cat} ref={(el) => { sectionRefs.current[cat] = el; }} style={{ marginBottom: 60 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: meta.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", flexShrink: 0 }}>{meta.icon}</div>
                <h2 style={{ fontSize: 21, fontWeight: 900, color: "#1C1208", margin: 0, letterSpacing: "-0.01em", fontFamily: font }}>{cat}</h2>
                <div style={{ flex: 1, height: 1, background: "rgba(196,122,46,0.15)" }} />
              </div>

              <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
                {catItems.map((item) => {
                  const price = getPriceDisplay(item);
                  const isHov = hoveredId === (item._id || item.id);
                  const inCart = itemInCart(item);
                  const itemId = item._id || item.id;
                  return (
                    <div
                      key={itemId}
                      onClick={() => setSelectedItem(item)}
                      onMouseEnter={() => setHoveredId(itemId)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: isHov ? `1.5px solid ${meta.color}55` : "1.5px solid rgba(201,168,76,0.13)", boxShadow: isHov ? `0 16px 48px rgba(44,26,14,0.14),0 0 0 3px ${meta.color}10` : "0 3px 16px rgba(139,90,20,0.07)", cursor: "pointer", transition: "all 0.24s cubic-bezier(0.4,0,0.2,1)", transform: isHov ? "translateY(-5px)" : "none", display: "flex", flexDirection: "column" }}
                    >
                      {/* Image */}
                      {item.images?.[0]?.url ? (
                        <div style={{ height: 180, overflow: "hidden", flexShrink: 0 }}>
                          <img src={item.images[0].url} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.32s", transform: isHov ? "scale(1.05)" : "scale(1)" }} />
                        </div>
                      ) : (
                        <div style={{ height: 110, background: meta.light, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                          <div style={{ position: "absolute", width: 130, height: 130, borderRadius: "50%", border: `1px solid ${meta.color}25`, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
                          <div style={{ position: "absolute", width: 90, height: 90, borderRadius: "50%", border: `1px solid ${meta.color}35`, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }} />
                          <span style={{ fontSize: 30, position: "relative", zIndex: 1 }}>{meta.icon}</span>
                        </div>
                      )}

                      {/* Body */}
                      <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", marginBottom: 10, alignSelf: "flex-start" }}>
                          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: meta.color, background: meta.light, borderRadius: 100, padding: "3px 9px", border: `1px solid ${meta.color}22` }}>{cat}</span>
                        </div>
                        <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 19, fontWeight: 700, color: "#1C1208", margin: "0 0 6px", lineHeight: 1.25 }}>{item.name}</h3>
                        {item.tagline && <p style={{ fontSize: 12, color: "#9B7450", margin: "0 0 12px", lineHeight: 1.45 }}>{item.tagline}</p>}

                        {item.features?.length > 0 && (
                          <div style={{ marginBottom: 12 }}>
                            {item.features.slice(0, 2).map((f, fi) => (
                              <div key={fi} style={{ fontSize: 11, color: "#6B4226", display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 4 }}>
                                <span style={{ color: meta.color, flexShrink: 0, fontSize: 8, marginTop: 3 }}>✦</span> {f}
                              </div>
                            ))}
                            {item.features.length > 2 && <div style={{ fontSize: 10, color: meta.color, fontWeight: 700 }}>+{item.features.length - 2} more</div>}
                          </div>
                        )}

                        {/* Price row */}
                        <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid rgba(196,122,46,0.1)" }}>
                          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 10 }}>
                            <div>
                              <div style={{ fontSize: 17, fontWeight: 900, color: "#C9A84C", letterSpacing: "-0.01em" }}>{price.main}</div>
                              {price.note && <div style={{ fontSize: 9, color: "#9B7450", fontStyle: "italic", marginTop: 1 }}>{price.note}</div>}
                            </div>
                            <div style={{ background: isHov ? meta.grad : "transparent", color: isHov ? "#fff" : meta.color, border: `1.5px solid ${meta.color}50`, borderRadius: 100, padding: "5px 13px", fontSize: 11, fontWeight: 700, transition: "all 0.22s", whiteSpace: "nowrap" }}>
                              View →
                            </div>
                          </div>

                          {/* Add to Cart button */}
                          <button
                            onClick={(e) => openQtyPicker(e, item)}
                            style={{ width: "100%", padding: "9px", borderRadius: 12, border: "none", background: inCart ? "linear-gradient(135deg,#15803d,#22c55e)" : `${meta.grad}`, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, letterSpacing: "0.02em", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "opacity 0.2s" }}
                          >
                            <span style={{ fontSize: 14 }}>🛒</span>
                            {inCart ? `In Cart (${inCart.quantity} ${item.unit || "pcs"}) — Update` : "Add to Cart"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        {items.length > 0 && (
          <div style={{ textAlign: "center", padding: "48px 24px", background: "linear-gradient(135deg,#1C1208,#3D2410)", borderRadius: 24, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 20% 50%,rgba(204,171,74,0.1),transparent 50%),radial-gradient(circle at 80% 30%,rgba(196,122,46,0.08),transparent 45%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#CCAB4A", marginBottom: 10 }}>Ready to order?</p>
              <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 300, color: "#fff", margin: "0 0 10px", fontStyle: "italic" }}>Let's design your perfect stationery</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", maxWidth: 380, margin: "0 auto 22px" }}>Add items to your cart, then chat with us on WhatsApp to place your order.</p>
              {cart.length > 0 ? (
                <button onClick={() => setShowCart(true)} style={{ padding: "13px 34px", borderRadius: 100, border: "none", background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 20px rgba(37,211,102,0.4)", letterSpacing: "0.03em" }}>
                  View Cart ({cartCount} items) →
                </button>
              ) : (
                <button onClick={() => navigate("/dashboard")} style={{ padding: "13px 34px", borderRadius: 100, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 20px rgba(196,122,46,0.4)", letterSpacing: "0.03em" }}>
                  Enquire via Chat →
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Floating Cart Button ── */}
      {cart.length > 0 && (
        <button
          onClick={() => setShowCart(true)}
          style={{ position: "fixed", bottom: 24, right: 24, zIndex: 500, background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", border: "none", borderRadius: 100, padding: "14px 22px", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 8px 32px rgba(37,211,102,0.45)", display: "flex", alignItems: "center", gap: 10 }}
        >
          <span style={{ fontSize: 18 }}>🛒</span>
          <span>Cart</span>
          <span style={{ background: "rgba(255,255,255,0.25)", borderRadius: 100, padding: "2px 9px", fontSize: 12, fontWeight: 900 }}>{cartCount}</span>
        </button>
      )}

      {/* ── Quantity Picker Modal ── */}
      {qtyPicker && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={() => setQtyPicker(null)} style={{ position: "absolute", inset: 0, background: "rgba(28,10,0,0.6)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "relative", background: "#FFFCF7", borderRadius: 24, padding: "28px 28px 24px", width: "100%", maxWidth: 380, boxShadow: "0 24px 80px rgba(44,26,14,0.35)", animation: "ws-fadeIn 0.2s ease" }}>
            <button onClick={() => setQtyPicker(null)} style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: "50%", background: "rgba(44,26,14,0.07)", border: "none", cursor: "pointer", fontSize: 16, color: "#5a3a1a" }}>×</button>

            {(() => {
              const m = CAT_META[qtyPicker.category] || CAT_META["Other"];
              const pr = getPriceDisplay(qtyPicker);
              return (
                <>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: m.color, marginBottom: 8 }}>{qtyPicker.category}</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 22, fontWeight: 700, color: "#1C1208", margin: "0 0 4px" }}>{qtyPicker.name}</h3>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#C9A84C", marginBottom: 20 }}>{pr.main}</div>

                  <label style={{ fontSize: 11, fontWeight: 700, color: "#5a3a1a", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 8 }}>
                    How many {qtyPicker.unit || "pieces"}?
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <button onClick={() => setQty(q => Math.max(1, Number(q) - 1))} style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", fontSize: 18, cursor: "pointer", color: "#C47A2E", fontWeight: 700 }}>−</button>
                    <input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                      style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontSize: 18, fontWeight: 800, textAlign: "center", color: "#1C1208", background: "#fff", outline: "none", fontFamily: font }}
                    />
                    <button onClick={() => setQty(q => Number(q) + 1)} style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", fontSize: 18, cursor: "pointer", color: "#C47A2E", fontWeight: 700 }}>+</button>
                  </div>

                  {!qtyPicker.priceOnRequest && qtyPicker.startingPrice > 0 && (
                    <div style={{ background: "rgba(196,122,46,0.06)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#6B3A1F" }}>
                      Estimated: <strong>₹{(qtyPicker.startingPrice * qty).toLocaleString("en-IN")}</strong> <span style={{ fontSize: 10, color: "#9B7450" }}>+ printing & delivery</span>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setQtyPicker(null)} style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#9B7450", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Cancel</button>
                    <button onClick={confirmAddToCart} style={{ flex: 2, padding: "11px", borderRadius: 12, border: "none", background: m.grad, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
                      Add to Cart 🛒
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── Cart Drawer ── */}
      {showCart && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, fontFamily: font }}>
          <div onClick={() => setShowCart(false)} style={{ position: "absolute", inset: 0, background: "rgba(28,10,0,0.55)", backdropFilter: "blur(3px)", animation: "ws-fadeIn 0.25s ease" }} />
          <div className="ws-panel" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "min(50vw,500px)", background: "#FFFCF7", overflowY: "auto", boxShadow: "-20px 0 80px rgba(44,26,14,0.3)", animation: "ws-slideRight 0.3s cubic-bezier(0.4,0,0.2,1)", display: "flex", flexDirection: "column" }}>

            {/* Cart header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(196,122,46,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1C1208", margin: "0 0 2px" }}>🛒 Your Cart</h2>
                <p style={{ fontSize: 12, color: "#9B7450", margin: 0 }}>{cart.length} item{cart.length !== 1 ? "s" : ""} selected</p>
              </div>
              <button onClick={() => setShowCart(false)} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(44,26,14,0.08)", border: "none", cursor: "pointer", fontSize: 18, color: "#5a3a1a" }}>×</button>
            </div>

            {/* Cart items */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#9B7450" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🛒</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#5a3a1a" }}>Cart is empty</div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>Add items from the catalogue above</div>
                </div>
              ) : cart.map(({ item, quantity }) => {
                const m = CAT_META[item.category] || CAT_META["Other"];
                const pr = getPriceDisplay(item);
                const lineTotal = !item.priceOnRequest && item.startingPrice
                  ? `₹${(item.startingPrice * Number(quantity)).toLocaleString("en-IN")}`
                  : null;
                return (
                  <div key={item._id || item.id} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: "1px solid rgba(196,122,46,0.08)" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: m.light, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, overflow: "hidden" }}>
                      {item.images?.[0]?.url
                        ? <img src={item.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : m.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#1C1208", marginBottom: 2, lineHeight: 1.3 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: "#9B7450", marginBottom: 6 }}>{quantity} {item.unit || "pcs"}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 900, color: "#C9A84C" }}>{lineTotal || pr.main}</span>
                        {lineTotal && <span style={{ fontSize: 9, color: "#9B7450", fontStyle: "italic" }}>+ printing & delivery</span>}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                      <button
                        onClick={() => { setQty(quantity); setQtyPicker(item); setShowCart(false); }}
                        style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 7, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#C47A2E", cursor: "pointer", fontFamily: font }}
                      >Edit</button>
                      <button onClick={() => removeFromCart(item)} style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 7, border: "1px solid #fca5a5", background: "#fff5f5", color: "#c0392b", cursor: "pointer", fontFamily: font }}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart footer */}
            {cart.length > 0 && (
              <div style={{ padding: "16px 24px 24px", borderTop: "1px solid rgba(196,122,46,0.12)", flexShrink: 0 }}>
                <div style={{ marginBottom: 14 }}>
                  {pricedTotal > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, color: "#1C1208", marginBottom: 4 }}>
                      <span>Design Total</span>
                      <span style={{ color: "#C9A84C" }}>₹{pricedTotal.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {hasUnpriced && <div style={{ fontSize: 11, color: "#9B7450", fontStyle: "italic" }}>+ some items are price on request</div>}
                  <div style={{ fontSize: 10, color: "#B89060", marginTop: 4 }}>Printing & delivery charged separately</div>
                </div>

                <button
                  onClick={() => { setShowWaForm(true); setWaErr(""); }}
                  style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 6px 24px rgba(37,211,102,0.35)" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.557 4.12 1.527 5.849L0 24l6.335-1.611A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.017-1.376l-.36-.214-3.727.948.989-3.614-.235-.372A9.818 9.818 0 1112 21.818z"/></svg>
                  Chat on WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── WhatsApp Form Modal ── */}
      {showWaForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={() => setShowWaForm(false)} style={{ position: "absolute", inset: 0, background: "rgba(28,10,0,0.65)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "relative", background: "#FFFCF7", borderRadius: 24, padding: "32px 28px 28px", width: "100%", maxWidth: 440, boxShadow: "0 24px 80px rgba(44,26,14,0.4)", animation: "ws-fadeIn 0.2s ease", maxHeight: "90vh", overflowY: "auto" }}>
            <button onClick={() => setShowWaForm(false)} style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: "50%", background: "rgba(44,26,14,0.07)", border: "none", cursor: "pointer", fontSize: 16, color: "#5a3a1a" }}>×</button>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.557 4.12 1.527 5.849L0 24l6.335-1.611A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.017-1.376l-.36-.214-3.727.948.989-3.614-.235-.372A9.818 9.818 0 1112 21.818z"/></svg>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: "#1C1208", margin: 0 }}>Almost there!</h3>
                <p style={{ fontSize: 12, color: "#9B7450", margin: 0 }}>Fill in your details to send the order</p>
              </div>
            </div>

            {/* Order summary mini */}
            <div style={{ background: "rgba(37,211,102,0.06)", border: "1px solid rgba(37,211,102,0.18)", borderRadius: 12, padding: "10px 14px", marginBottom: 20, marginTop: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#128C7E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{cart.length} item{cart.length !== 1 ? "s" : ""} in cart</div>
              {cart.map(({ item, quantity }) => (
                <div key={item._id || item.id} style={{ fontSize: 12, color: "#1C1208", marginBottom: 2 }}>✦ {item.name} × {quantity} {item.unit || "pcs"}</div>
              ))}
            </div>

            {/* Form fields */}
            {[
              { key: "name",    label: "Your Name *",       placeholder: "Rahul Sharma",            type: "text"  },
              { key: "phone",   label: "Phone Number *",    placeholder: "+91 98765 43210",         type: "tel"   },
              { key: "address", label: "Delivery Address *",placeholder: "New Delhi, India",        type: "text"  },
              { key: "date",    label: "Event / Required Date *", placeholder: "e.g. 15 December 2025", type: "text"  },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#5a3a1a", display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</label>
                <input
                  type={type}
                  value={waForm[key]}
                  onChange={(e) => setWaForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontSize: 14, fontFamily: font, color: "#1C1208", background: "#fff", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}

            {waErr && <div style={{ padding: "10px 14px", background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 8, color: "#c0392b", fontSize: 12, marginBottom: 14 }}>{waErr}</div>}

            <button
              onClick={handleWaSend}
              style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 6px 24px rgba(37,211,102,0.35)" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.557 4.12 1.527 5.849L0 24l6.335-1.611A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.017-1.376l-.36-.214-3.727.948.989-3.614-.235-.372A9.818 9.818 0 1112 21.818z"/></svg>
              Send on WhatsApp
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: "#9B7450", margin: "10px 0 0" }}>
              Opens WhatsApp with your order details pre-filled. Message goes to +91 92116 68427.
            </p>
          </div>
        </div>
      )}

      {/* ── Detail Panel ── */}
      {selectedItem && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, fontFamily: font }}>
          <div onClick={() => setSelectedItem(null)} style={{ position: "absolute", inset: 0, background: "rgba(28,10,0,0.55)", backdropFilter: "blur(3px)", animation: "ws-fadeIn 0.25s ease" }} />
          <div className="ws-panel" style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "min(52vw,540px)", background: "#FFFCF7", overflowY: "auto", boxShadow: "-20px 0 80px rgba(44,26,14,0.28)", animation: "ws-slideRight 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
            <button onClick={() => setSelectedItem(null)} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%", background: "rgba(44,26,14,0.08)", border: "none", cursor: "pointer", fontSize: 18, color: "#5a3a1a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>×</button>

            {selectedItem.images?.[0]?.url ? (
              <div style={{ height: 260, overflow: "hidden" }}>
                <img src={selectedItem.images[0].url} alt={selectedItem.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (() => {
              const m = CAT_META[selectedItem.category] || CAT_META["Other"];
              return (
                <div style={{ height: 180, background: m.light, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", border: `1px solid ${m.color}20` }} />
                  <div style={{ position: "absolute", width: 140, height: 140, borderRadius: "50%", border: `1px solid ${m.color}30` }} />
                  <span style={{ fontSize: 48, position: "relative", zIndex: 1 }}>{m.icon}</span>
                </div>
              );
            })()}

            <div style={{ padding: "28px 32px 48px" }}>
              {(() => {
                const m  = CAT_META[selectedItem.category] || CAT_META["Other"];
                const pr = getPriceDisplay(selectedItem);
                const inCart = itemInCart(selectedItem);
                return (
                  <>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: m.color, background: m.light, borderRadius: 100, padding: "4px 12px", border: `1px solid ${m.color}22` }}>{selectedItem.category}</span>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.6rem,4vw,2rem)", fontWeight: 700, color: "#1C1208", margin: "14px 0 8px", lineHeight: 1.2 }}>{selectedItem.name}</h2>
                    {selectedItem.tagline && <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 20px", lineHeight: 1.5, fontStyle: "italic" }}>{selectedItem.tagline}</p>}

                    <div style={{ background: "linear-gradient(135deg,#FFF8EC,#FFF3DC)", borderRadius: 14, padding: "16px 20px", marginBottom: 24, border: "1px solid rgba(204,171,74,0.2)" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Price</div>
                      <div style={{ fontSize: 26, fontWeight: 900, color: "#C9A84C", letterSpacing: "-0.02em" }}>{pr.main}</div>
                      {pr.note && <div style={{ fontSize: 11, color: "#9B7450", marginTop: 4, fontStyle: "italic" }}>{pr.note}</div>}
                    </div>

                    {selectedItem.description && (
                      <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#5a3a1a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>About</div>
                        <p style={{ fontSize: 14, color: "#6B4226", lineHeight: 1.65, margin: 0 }}>{selectedItem.description}</p>
                      </div>
                    )}

                    {selectedItem.features?.length > 0 && (
                      <div style={{ marginBottom: 24 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#5a3a1a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>What's included</div>
                        {selectedItem.features.map((f, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 0", borderBottom: i < selectedItem.features.length - 1 ? "1px solid rgba(196,122,46,0.08)" : "none" }}>
                            <div style={{ width: 18, height: 18, borderRadius: "50%", background: m.light, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}><span style={{ fontSize: 7, color: m.color }}>✦</span></div>
                            <span style={{ fontSize: 13, color: "#4A2810", lineHeight: 1.4 }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add to Cart from detail panel */}
                    <button
                      onClick={(e) => { setSelectedItem(null); openQtyPicker(e, selectedItem); }}
                      style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: inCart ? "linear-gradient(135deg,#15803d,#22c55e)" : m.grad, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: `0 6px 24px ${m.color}40`, marginBottom: 10 }}
                    >
                      {inCart ? `🛒 Update Quantity (${inCart.quantity} ${selectedItem.unit || "pcs"})` : "🛒 Add to Cart"}
                    </button>
                    {cart.length > 0 && (
                      <button
                        onClick={() => { setSelectedItem(null); setShowCart(true); }}
                        style={{ width: "100%", padding: "12px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#25D366,#128C7E)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}
                      >
                        View Cart ({cartCount} items) →
                      </button>
                    )}
                    <p style={{ textAlign: "center", fontSize: 11, color: "#9B7450", margin: "10px 0 0", fontStyle: "italic" }}>Add to cart, then chat on WhatsApp to place your order</p>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=Outfit:wght@400;600;700;800;900&display=swap');
        .cat-pill-row { scrollbar-width: none; }
        .cat-pill-row::-webkit-scrollbar { display: none; }
        @keyframes ws-fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes ws-slideRight { from { transform:translateX(100%) } to { transform:translateX(0) } }
        @keyframes ws-slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
        @media(max-width:640px){
          .stat-grid { grid-template-columns: repeat(2,1fr) !important; gap: 12px !important; }
          .ws-panel {
            top: auto !important; left: 0 !important; right: 0 !important;
            width: 100% !important; height: 88vh !important;
            border-radius: 22px 22px 0 0 !important;
            animation: ws-slideUp 0.35s cubic-bezier(0.4,0,0.2,1) !important;
          }
        }
        @media(max-width:360px){ .stat-grid { grid-template-columns: 1fr !important; } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 1; }
      `}</style>
    </div>
  );
}
