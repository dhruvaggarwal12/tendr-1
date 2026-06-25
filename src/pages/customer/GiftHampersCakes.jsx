import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import Footer from "../../components/Footer";
import { Button, Input } from "../../components/ui";
import {
  addToCart, removeFromCart, updateQuantity, clearCart,
  selectCartItems, selectCartTotal, selectCartCount,
} from "../../redux/giftHamperCartSlice";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

// ── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product, onViewDetails }) {
  const cartItems = useSelector(selectCartItems);
  const inCart    = cartItems.find(i => i.productId === product._id);
  const price = product.pricePerUnit || 0;

  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1.5px solid rgba(196,122,46,0.15)", boxShadow: "0 3px 16px rgba(44,26,14,0.07)", overflow: "hidden", display: "flex", flexDirection: "column", fontFamily: font, position: "relative" }}>
      {/* Product number badge */}
      {product.productNumber && (
        <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(44,26,14,0.7)", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 7px", zIndex: 2, letterSpacing: "0.05em" }}>
          #{product.productNumber}
        </div>
      )}
      {/* Cart badge */}
      {inCart && (
        <div style={{ position: "absolute", top: 10, right: 10, background: "#22c55e", color: "#fff", fontSize: 10, fontWeight: 800, borderRadius: 100, padding: "2px 8px", zIndex: 2 }}>
          In Cart ({inCart.quantity})
        </div>
      )}

      {/* Image */}
      <div style={{ height: 200, overflow: "hidden", background: "#f5f0e8" }}>
        <img
          src={product.images?.[0] || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80"}
          alt={product.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {/* Category chip */}
        <span style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", background: "rgba(196,122,46,0.1)", borderRadius: 100, padding: "2px 9px", alignSelf: "flex-start", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {product.category}
        </span>

        <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", lineHeight: 1.3 }}>{product.name}</div>

        <p style={{ fontSize: 12.5, color: "#7A5535", lineHeight: 1.55, margin: 0 }}>
          {product.description.slice(0, 100)}{product.description.length > 100 ? "…" : ""}
        </p>

        {/* Min order highlight */}
        {product.minOrderQuantity > 1 && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700, color: "#b45309" }}>
            Minimum order: {product.minOrderQuantity} piece{product.minOrderQuantity > 1 ? "s" : ""}
          </div>
        )}

        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#2C1A0E" }}>₹{price.toLocaleString("en-IN")}</span>
          <span style={{ fontSize: 12, color: "#9B7450" }}>/ unit</span>
        </div>

        {/* View Details */}
        <button onClick={() => onViewDetails(product)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
          View Details
        </button>
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
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.3)" }} />
      <div style={{
        position: "fixed", right: 24, top: "50%", transform: "translateY(-50%)",
        zIndex: 1101, width: 360, maxHeight: "80vh",
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
    return (
      <>
        <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(0,0,0,0.45)" }} />
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1201, background: "#FFFCF5", borderRadius: 20, padding: "32px 28px", width: 340, boxShadow: "0 20px 60px rgba(44,26,14,0.2)", fontFamily: font, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: "#2C1A0E", margin: "0 0 8px" }}>Sign in to continue</h3>
          <p style={{ fontSize: 13, color: "#9B7450", margin: "0 0 20px" }}>Create an account or sign in to place your gift hamper order.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => navigate("/login")} style={{ padding: "11px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Sign In</button>
            <button onClick={() => navigate("/signup")} style={{ padding: "11px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Create Account</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1200, background: "rgba(0,0,0,0.45)" }} />
      <div className="gh-checkout-modal" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 1201, background: "#FFFCF5", borderRadius: 20, padding: "28px 24px", width: "min(92vw,440px)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(44,26,14,0.2)", fontFamily: font }}>
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

  const handlePlaceOrder = async (deliveryInfo) => {
    setShowCheckout(false);
    // Store delivery info and navigate to review page
    sessionStorage.setItem("gh_delivery", JSON.stringify(deliveryInfo));
    navigate("/booking/review?gh=1");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO
        title="Gift Hampers — Tendr"
        description="Curated gift hampers for every celebration. Browse and order premium gift hampers delivered across Delhi NCR."
        path="/gift-hampers-cakes"
      />
      <HamburgerNav title="Gift Hampers" />

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#2C1A0E 0%,#4A2810 60%,#6B3A1F 100%)", padding: "40px 24px 36px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#CCAB4A" }}>Curated for every celebration</span>
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 900, color: "#fff", margin: "10px 0 8px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>Gift Hampers</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", margin: "0 0 20px", lineHeight: 1.65 }}>
            Premium, thoughtfully curated hampers — delivered across Delhi NCR
          </p>
        </div>
      </div>

      {/* Floating cart button — sits just above View Chats */}
      {cartCount > 0 && (
        <button
          onClick={() => setShowCart(true)}
          title="Gift Hampers Cart"
          style={{
            position: "fixed", bottom: 88, right: 16, zIndex: 901,
            background: "linear-gradient(135deg,#15803d,#22c55e)",
            color: "#fff", border: "none", borderRadius: "50%",
            width: 48, height: 48,
            fontFamily: "'Outfit',sans-serif", fontSize: 20,
            cursor: "pointer", boxShadow: "0 4px 18px rgba(21,128,61,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          🎁
          <span style={{
            position: "absolute", top: -4, right: -4,
            background: "#C47A2E", color: "#fff", borderRadius: "50%",
            width: 18, height: 18, fontSize: 10, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2px solid #fff",
          }}>{cartCount}</span>
        </button>
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 80px" }}>
        {/* Category filters */}
        {categories.length > 1 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                style={{ padding: "7px 18px", borderRadius: 100, fontSize: 13, fontWeight: 700, border: `1.5px solid ${filter === cat ? "#C47A2E" : "rgba(196,122,46,0.25)"}`, background: filter === cat ? "#C47A2E" : "#fff", color: filter === cat ? "#fff" : "#6B3A1F", cursor: "pointer", fontFamily: font }}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ height: 380, borderRadius: 18, background: "linear-gradient(90deg,#f0ebe3 25%,#faf5ee 50%,#f0ebe3 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
            ))}
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎁</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>No products available yet</h3>
            <p style={{ fontSize: 14, color: "#9B7450" }}>Check back soon — our vendors are adding products.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 20 }}>
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
      {selectedProduct && (
        <>
          <div onClick={() => setSelectedProduct(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1100, backdropFilter: "blur(4px)" }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "min(92vw,480px)", maxHeight: "85vh", background: "#FFFCF5", borderRadius: 20, zIndex: 1101, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", fontFamily: "'Outfit',sans-serif" }}>
            {/* Close */}
            <button onClick={() => setSelectedProduct(null)} style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.12)", color: "#fff", fontSize: 16, cursor: "pointer", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            {/* Image */}
            {selectedProduct.images?.[0] && (
              <img src={selectedProduct.images[0]} alt={selectedProduct.name} style={{ width: "100%", height: 220, objectFit: "cover", flexShrink: 0 }} />
            )}
            {/* Body */}
            <div style={{ padding: "20px 22px 24px", overflowY: "auto", flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{selectedProduct.category}</div>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: "#2C1A0E", margin: "0 0 6px" }}>{selectedProduct.name}</h3>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#C47A2E", marginBottom: 12 }}>₹{selectedProduct.pricePerUnit?.toLocaleString("en-IN")}<span style={{ fontSize: 12, fontWeight: 500, color: "#9B7450" }}> / unit</span></div>
              {selectedProduct.description && (
                <p style={{ fontSize: 14, color: "#5a3a1a", lineHeight: 1.6, marginBottom: 16 }}>{selectedProduct.description}</p>
              )}
              {selectedProduct.minOrderQuantity > 1 && (
                <p style={{ fontSize: 12, color: "#9B7450", marginBottom: 16 }}>Minimum order: {selectedProduct.minOrderQuantity} units</p>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <button onClick={() => setModalQty(q => Math.max(q - 1, selectedProduct.minOrderQuantity || 1))}
                  style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.35)", background: "#fff", fontSize: 18, cursor: "pointer" }}>−</button>
                <span style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E", minWidth: 30, textAlign: "center" }}>{modalQty}</span>
                <button onClick={() => setModalQty(q => q + 1)}
                  style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.35)", background: "#fff", fontSize: 18, cursor: "pointer" }}>+</button>
                <span style={{ fontSize: 14, color: "#9B7450", marginLeft: "auto" }}>= ₹{((selectedProduct.pricePerUnit || 0) * modalQty).toLocaleString("en-IN")}</span>
              </div>
              <button
                onClick={() => {
                  dispatch(addToCart({ product: selectedProduct, quantity: modalQty }));
                  setSelectedProduct(null);
                  setModalQty(1);
                }}
                style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'Outfit',sans-serif", boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}>
                🎁 Add to Cart
              </button>
            </div>
          </div>
        </>
      )}

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

      <Footer />
    </div>
  );
};

export default GiftHampersCakes;
