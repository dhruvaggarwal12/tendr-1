import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import AuthModal from "../../components/AuthModal";
import SEO from "../../components/SEO";
import Footer from "../../components/Footer";
import { Button, Input } from "../../components/ui";
import {
  addToCart, removeFromCart, updateQuantity, clearCart,
  selectCartItems, selectCartTotal, selectCartCount, setGhDelivery,
} from "../../redux/giftHamperCartSlice";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

// ── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onViewDetails }) {
  const dispatch  = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const inCart    = cartItems.find(i => i.productId === product._id);
  const price     = product.pricePerUnit || 0;
  const isMobile  = window.innerWidth < 768;
  const minQty    = product.minOrderQuantity || 1;
  const desc      = product.description || "";

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    dispatch(addToCart({ product, quantity: minQty }));
  };

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 3px 16px rgba(44,26,14,0.07)", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: font, position: "relative" }}>
      {/* Cart badge */}
      {inCart && (
        <div style={{ position: "absolute", top: 8, right: 8, background: "#22c55e", color: "#fff", fontSize: 9, fontWeight: 800, borderRadius: 100, padding: "2px 6px", zIndex: 2 }}>
          In Cart ({inCart.quantity})
        </div>
      )}

      {/* Image */}
      <div style={{ height: isMobile ? 120 : 180, overflow: "hidden", background: "#f5f0e8" }}>
        <img
          src={product.images?.[0] || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80"}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <div style={{ padding: isMobile ? "12px 12px" : "14px 16px", display: "flex", flexDirection: "column", gap: isMobile ? 5 : 8, flex: 1 }}>
        {/* Category chip */}
        <span style={{ fontSize: 9, fontWeight: 700, color: "#C47A2E", background: "rgba(196,122,46,0.1)", borderRadius: 100, padding: "2px 7px", alignSelf: "flex-start", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {product.category}
        </span>

        <div style={{ fontSize: isMobile ? 12 : 15, fontWeight: 800, color: "#2C1A0E", lineHeight: 1.3 }}>{product.name}</div>

        {desc && (
          <p style={{ fontSize: 11, color: "#7A5535", lineHeight: 1.5, margin: 0 }}>
            {desc.slice(0, isMobile ? 55 : 80)}{desc.length > (isMobile ? 55 : 80) ? "…" : ""}
          </p>
        )}

        {/* Min order highlight */}
        {minQty > 1 && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "3px 7px", fontSize: 10, fontWeight: 700, color: "#b45309" }}>
            Min: {minQty} pcs
          </div>
        )}

        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span style={{ fontSize: isMobile ? 15 : 20, fontWeight: 900, color: "#2C1A0E" }}>₹{price.toLocaleString("en-IN")}</span>
          <span style={{ fontSize: 10, color: "#9B7450" }}>/ unit</span>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 7, marginTop: "auto" }}>
          <button onClick={() => onViewDetails(product)}
            style={{ flex: 1, padding: isMobile ? "8px 6px" : "10px 10px", borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: isMobile ? 10 : 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            View Details
          </button>
          <button onClick={handleQuickAdd}
            style={{ flex: 1, padding: isMobile ? "8px 6px" : "10px 10px", borderRadius: 9, border: "none", background: inCart ? "linear-gradient(135deg,#15803d,#22c55e)" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: isMobile ? 10 : 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
            {inCart ? "✓ Added" : `+ Cart`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Cart Window ───────────────────────────────────────────────────────────────
function CartWindow({ onClose, onCheckout }) {
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const dispatch = useDispatch();

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100000, background: "rgba(0,0,0,0.3)" }} />
      <div style={{
        position: "fixed", right: 16, top: "50%", transform: "translateY(-50%)",
        zIndex: 100001, width: "min(360px, calc(100vw - 32px))", maxHeight: "calc(100dvh - 160px - env(safe-area-inset-bottom, 0px))",
        background: "#FFFCF5", borderRadius: 20,
        boxShadow: "0 20px 60px rgba(44,26,14,0.2)",
        border: "1.5px solid rgba(196,122,46,0.2)",
        display: "flex", flexDirection: "column", fontFamily: font,
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", padding: "14px 18px", borderRadius: "18px 18px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>🛒 Your Cart ({items.length})</div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 28, height: 28, color: "#fff", cursor: "pointer", fontSize: 14 }}>✕</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#9B7450" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🧺</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Your cart is empty</div>
            </div>
          ) : items.map(item => (
            <div key={item.productId} style={{ display: "flex", gap: 10, background: "#fff", borderRadius: 12, padding: "10px 12px", border: "1px solid rgba(196,122,46,0.12)" }}>
              <img src={item.imageUrl || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=100&q=60"} alt={item.name} style={{ width: 52, height: 52, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                {item.productNumber && <div style={{ fontSize: 10, color: "#bbb" }}>#{item.productNumber}</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <button onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))} style={{ width: 22, height: 22, borderRadius: "50%", border: "1px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 700, width: 24, textAlign: "center" }}>{item.quantity}</span>
                  <button onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))} style={{ width: 22, height: 22, borderRadius: "50%", border: "1px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#2C1A0E", marginLeft: 4 }}>₹{item.subtotal.toLocaleString("en-IN")}</span>
                  <button onClick={() => dispatch(removeFromCart(item.productId))} style={{ marginLeft: "auto", background: "none", border: "none", color: "#c0392b", cursor: "pointer", fontSize: 13 }}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(196,122,46,0.1)", padding: "14px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#5a3a1a" }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: "#2C1A0E" }}>₹{total.toLocaleString("en-IN")}</span>
            </div>
            <button onClick={onCheckout}
              style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#15803d,#22c55e)", color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 3px 12px rgba(21,128,61,0.35)" }}>
              Finalise Order →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Checkout Modal ────────────────────────────────────────────────────────────
function CheckoutModal({ onClose, onPlaceOrder }) {
  const { user, token } = useSelector(s => s.auth);
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phoneNumber || "",
    deliveryDate: "",
    address: "",
    city: "",
    pincode: "",
    instructions: "",
  });
  const [err, setErr] = useState("");

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.deliveryDate) {
      setErr("Please fill name, phone, delivery date, address and city."); return;
    }
    onPlaceOrder(form);
  };

  if (!token) {
    return <AuthModal open onClose={onClose} onSuccess={() => {}} />;
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 100000, background: "rgba(0,0,0,0.45)" }} />
      <div className="gh-checkout-modal" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 100001, background: "#FFFCF5", borderRadius: 20, padding: "28px 24px", width: "min(92vw,440px)", maxHeight: "calc(100dvh - 160px - env(safe-area-inset-bottom, 0px))", overflowY: "auto", boxShadow: "0 20px 60px rgba(44,26,14,0.2)", fontFamily: font }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: "#2C1A0E", margin: 0 }}>Delivery Details</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#9B7450", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { key: "name",    label: "Recipient Name",   placeholder: "Who should we deliver to?", required: true },
            { key: "phone",   label: "Phone Number",     placeholder: "10-digit number",           required: true },
            { key: "address", label: "Delivery Address", placeholder: "House no, street, area",    required: true },
            { key: "city",    label: "City",             placeholder: "e.g. Delhi, Noida",         required: true },
            { key: "pincode", label: "Pincode",          placeholder: "110001",                    required: false },
          ].map(({ key, label, placeholder, required }) => (
            <Input
              key={key}
              label={label}
              value={form[key]}
              onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              placeholder={placeholder}
              required={required}
            />
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E", display: "block", marginBottom: 5, fontFamily: font }}>
              Delivery Date <span style={{ color: "#DC2626" }}>*</span>
            </label>
            <input
              type="date"
              value={form.deliveryDate}
              min={today}
              onChange={e => setForm(p => ({ ...p, deliveryDate: e.target.value }))}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(44,26,14,0.12)", fontFamily: font, fontSize: 13, color: "#2C1A0E", outline: "none", boxSizing: "border-box", background: "#fff" }}
              onFocus={e => (e.target.style.borderColor = "#C47A2E")}
              onBlur={e => (e.target.style.borderColor = "rgba(44,26,14,0.12)")}
            />
          </div>
          <Input
            label="Special Instructions"
            value={form.instructions}
            onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))}
            placeholder="Any special requests..."
            rows={2}
          />
          {err && <p style={{ fontSize: 12, color: "#c0392b", margin: 0 }}>{err}</p>}
          <Button variant="primary" size="lg" fullWidth onClick={handleSubmit} style={{ marginTop: 4, boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}>
            Review &amp; Pay →
          </Button>
        </div>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const GiftHampersCakes = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();

  // ── COMING SOON ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#FFFCF5", fontFamily: "'Outfit', sans-serif" }}>
      <HamburgerNav />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🎁</div>
        <div style={{ fontSize: "clamp(28px, 6vw, 42px)", fontWeight: 900, color: "#2C1A0E", marginBottom: 12, letterSpacing: "-0.02em" }}>
          Gift Hampers & Cakes
        </div>
        <div style={{ display: "inline-block", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", borderRadius: 100, padding: "8px 24px", fontWeight: 800, fontSize: 14, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 24 }}>
          Coming Soon
        </div>
        <div style={{ fontSize: 16, color: "#9B7450", maxWidth: 400, lineHeight: 1.7 }}>
          We're curating the most beautiful hampers and cakes for your celebrations. Check back soon!
        </div>
        <button
          onClick={() => navigate("/")}
          style={{ marginTop: 36, padding: "14px 36px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
        >
          Back to Home
        </button>
      </div>
      <Footer />
    </div>
  );
  // ── END COMING SOON ──────────────────────────────────────────────────────────
  const cartCount = useSelector(selectCartCount);
  const cartTotal = useSelector(selectCartTotal);
  const cartItems = useSelector(selectCartItems);
  const { token, user } = useSelector(s => s.auth);

  const [products,        setProducts]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showCart,        setShowCart]        = useState(false);
  const [showCheckout,    setShowCheckout]    = useState(false);
  const [filter,          setFilter]          = useState("All");
  const [orderSuccess,    setOrderSuccess]    = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalQty,        setModalQty]        = useState(1);

  useEffect(() => {
    fetch(`${BASE_URL}/gift-hampers/products`)
      .then(r => r.ok ? r.json() : { products: [] })
      .then(d => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
  const filtered   = filter === "All" ? products : products.filter(p => p.category === filter);

  const handlePlaceOrder = (deliveryInfo) => {
    setShowCheckout(false);
    dispatch(setGhDelivery(deliveryInfo));
    setOrderSuccess(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO
        title="Gift Hampers — Tendr"
        description="Curated gift hampers for every celebration. Browse and order premium gift hampers delivered across Delhi NCR."
        path="/gift-hampers-cakes"
      />
      <HamburgerNav title="Gift Hampers" showBack />

      {/* Hero */}
      <style>{`
        @media(max-width:640px){.gh-hero{padding:24px 18px 22px!important}.gh-hero h1{font-size:1.6rem!important}.gh-hero p.sub{font-size:14px!important}}
        @media(max-width:480px){.gh-hero{padding:18px 14px 16px!important}.gh-hero h1{font-size:1.35rem!important}}
      `}</style>
      <div className="gh-hero" style={{ background: "linear-gradient(135deg,#FDEBD0 0%,#FAE0BC 60%,#FDF0DC 100%)", padding: "40px 24px 36px", textAlign: "center", position: "relative", overflow: "hidden", borderBottom: "2px solid rgba(196,122,46,0.15)" }}>
        {/* Ghost decorations */}
        <div style={{ position:"absolute", top:-8, left:"6%", fontSize:90, opacity:0.14, transform:"rotate(-12deg)", userSelect:"none", pointerEvents:"none" }}>🎁</div>
        <div style={{ position:"absolute", top:12, right:"5%", fontSize:70, opacity:0.13, transform:"rotate(8deg)", userSelect:"none", pointerEvents:"none" }}>🎂</div>
        <div style={{ position:"absolute", bottom:-12, right:"18%", fontSize:60, opacity:0.12, transform:"rotate(-6deg)", userSelect:"none", pointerEvents:"none" }}>🎀</div>

        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8B4A0E" }}>Curated for every celebration</span>
          <h1 className="page-main-h1" style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, color: "#2C1A0E", margin: "10px 0 8px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>Gift Hampers & Cakes</h1>
          <p className="sub" style={{ fontSize: 15, color: "#6B3A10", margin: "0 0 18px", lineHeight: 1.65 }}>
            Premium, thoughtfully curated hampers & custom cakes — delivered across Delhi NCR
          </p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
            {["Custom orders", "Bulk orders welcome", "Delhi NCR delivery"].map(pt => (
              <span key={pt} style={{ fontSize:11, fontWeight:700, color:"#7A3A0E", background:"rgba(139,74,14,0.12)", border:"1px solid rgba(139,74,14,0.22)", padding:"5px 12px", borderRadius:100, fontFamily:font }}>✓ {pt}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", margin: "0", padding: "28px 24px", textAlign: "center", fontFamily: font }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(196,122,46,0.25)", border: "1px solid rgba(196,122,46,0.4)", color: "#CCAB4A", borderRadius: 100, padding: "4px 16px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            Building Something Special
          </div>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.7, margin: "0 0 8px" }}>
            We're putting together a full gifting experience — curated hampers, custom cakes, theme collections and doorstep delivery.
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: "0 0 20px" }}>
            Until then, our team can help you pick the perfect gift. Tell us your occasion, budget and preferences — we'll handle the rest.
          </p>
          <button
            onClick={() => navigate("/baat-karo")}
            style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, padding: "11px 28px", borderRadius: 11, border: "none", cursor: "pointer", fontFamily: font, boxShadow: "0 4px 16px rgba(196,122,46,0.4)" }}
          >
            Chat with Our Team →
          </button>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 8 }}>In-app chat · Replies within 2 hours</p>
        </div>
      </div>

      {/* Product grid — single-source 🎁 cart is in FloatingChatButton global stack */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 14px calc(80px + env(safe-area-inset-bottom, 0px))" }}>
        {/* Category filters */}
        {categories.length > 1 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                style={{ padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700, border: `1.5px solid ${filter === cat ? "#C47A2E" : "rgba(196,122,46,0.25)"}`, background: filter === cat ? "#C47A2E" : "#fff", color: filter === cat ? "#fff" : "#6B3A1F", cursor: "pointer", fontFamily: font }}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products grid — 2 columns on mobile, auto on desktop */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ height: 260, borderRadius: 14, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
            ))}
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>Products coming soon</h3>
            <p style={{ fontSize: 13, color: "#9B7450", marginBottom: 20 }}>Our team can still help you find the perfect gift — just tell us your occasion and budget.</p>
            <button
              onClick={() => navigate("/baat-karo")}
              style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, padding: "11px 28px", borderRadius: 11, border: "none", cursor: "pointer", fontFamily: font, boxShadow: "0 4px 16px rgba(196,122,46,0.3)" }}
            >
              Chat with Our Team →
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {filtered.map(p => (
              <ProductCard
                key={p._id}
                product={p}
                onViewDetails={(product) => {
                  setSelectedProduct(product);
                  setModalQty(Math.max(1, product.minOrderQuantity || 1));
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product detail modal */}
      {selectedProduct && (() => {
        const isMob = window.innerWidth < 768;
        return (
        <>
          <div onClick={() => setSelectedProduct(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100000, backdropFilter: "blur(4px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(94vw,480px)", maxHeight: isMob ? "calc(100dvh - 160px - env(safe-area-inset-bottom, 0px))" : "85vh", background: "#FFFCF5", borderRadius: 18, zIndex: 100001, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", fontFamily: "'Outfit',sans-serif" }}>
            {/* Close */}
            <button onClick={() => setSelectedProduct(null)} style={{ position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.18)", color: "#fff", fontSize: 15, cursor: "pointer", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            {/* Image */}
            {selectedProduct.images?.[0] && (
              <img src={selectedProduct.images[0]} alt={selectedProduct.name} style={{ width: "100%", height: isMob ? 150 : 200, objectFit: "cover", flexShrink: 0 }} />
            )}
            {/* Body */}
            <div style={{ padding: isMob ? "14px 16px calc(16px + env(safe-area-inset-bottom, 16px))" : "20px 22px calc(24px + env(safe-area-inset-bottom, 20px))", overflowY: "auto", flex: 1 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{selectedProduct.category}</div>
              <h3 style={{ fontSize: isMob ? 16 : 20, fontWeight: 900, color: "#2C1A0E", margin: "0 0 4px" }}>{selectedProduct.name}</h3>
              <div style={{ fontSize: isMob ? 18 : 22, fontWeight: 900, color: "#C47A2E", marginBottom: 8 }}>₹{selectedProduct.pricePerUnit?.toLocaleString("en-IN")}<span style={{ fontSize: 11, fontWeight: 500, color: "#9B7450" }}> / unit</span></div>
              {selectedProduct.description && (
                <p style={{ fontSize: isMob ? 12 : 14, color: "#5a3a1a", lineHeight: 1.55, marginBottom: 10 }}>{selectedProduct.description}</p>
              )}
              {selectedProduct.minOrderQuantity > 1 && (
                <p style={{ fontSize: 11, color: "#9B7450", marginBottom: 10 }}>Minimum order: {selectedProduct.minOrderQuantity} units</p>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <button onClick={() => setModalQty(q => Math.max(q - 1, selectedProduct.minOrderQuantity || 1))}
                  style={{ width: 32, height: 32, borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.35)", background: "#fff", fontSize: 17, cursor: "pointer" }}>−</button>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", minWidth: 28, textAlign: "center" }}>{modalQty}</span>
                <button onClick={() => setModalQty(q => q + 1)}
                  style={{ width: 32, height: 32, borderRadius: 9, border: "1.5px solid rgba(196,122,46,0.35)", background: "#fff", fontSize: 17, cursor: "pointer" }}>+</button>
                <span style={{ fontSize: 13, color: "#9B7450", marginLeft: "auto" }}>= ₹{((selectedProduct.pricePerUnit || 0) * modalQty).toLocaleString("en-IN")}</span>
              </div>
              <button
                onClick={() => {
                  dispatch(addToCart({ product: selectedProduct, quantity: modalQty }));
                  setSelectedProduct(null);
                  setModalQty(1);
                }}
                style={{ width: "100%", padding: isMob ? "12px" : "14px", borderRadius: 11, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: isMob ? 14 : 15, fontWeight: 800, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}>
                🎁 Add to Cart
              </button>
            </div>
          </div>
        </>
        );
      })()}

      {/* Cart window */}
      {showCart && (
        <CartWindow
          onClose={() => setShowCart(false)}
          onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
        />
      )}

      {/* Checkout modal */}
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onPlaceOrder={handlePlaceOrder}
        />
      )}

      {/* Order saved popup — points user to the gift icon */}
      {orderSuccess && (
        <>
          <div onClick={() => setOrderSuccess(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100000, backdropFilter: "blur(4px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(90vw,360px)", background: "#FFFCF5", borderRadius: 20, zIndex: 100001, padding: "32px 24px", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", fontFamily: font, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 28 }}>🎁</div>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: "#2C1A0E", margin: "0 0 8px" }}>Order Saved!</h3>
            <p style={{ fontSize: 14, color: "#9B7450", margin: "0 0 20px", lineHeight: 1.6 }}>
              Tap the <strong>🎁 gift icon</strong> to the left of the chat button at the bottom of the screen to review and send your order on WhatsApp.
            </p>
            <button onClick={() => setOrderSuccess(false)} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2C1A0E,#4A2810)", color: "#CCAB4A", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
              Got it
            </button>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default GiftHampersCakes;
