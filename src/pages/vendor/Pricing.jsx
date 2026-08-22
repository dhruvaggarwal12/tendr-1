import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const font = "'Outfit', sans-serif";
const FD = "'Cormorant Garamond', Georgia, serif";
const gold = "#C47A2E";
const goldLt = "#CCAB4A";
const ink = "#2C1A0E";

const PLANS = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    priceAnnual: 0,
    tagline: "Get discovered on Tendr",
    features: [
      { text: "Basic profile listing", yes: true },
      { text: "Up to 5 portfolio photos", yes: true },
      { text: "Customer enquiries via chat", yes: true },
      { text: "Analytics dashboard", yes: false },
      { text: "WhatsApp visible to customers", yes: false },
      { text: "Featured badge in search", yes: false },
      { text: "Priority search placement", yes: false },
      { text: "Custom offer builder", yes: false },
    ],
    highlight: false,
    cta: "Current plan",
    ctaDisabled: true,
  },
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 499,
    priceAnnual: 4499,
    tagline: "More visibility, more bookings",
    features: [
      { text: "Everything in Free", yes: true },
      { text: "Up to 10 portfolio photos", yes: true },
      { text: "Analytics dashboard", yes: true },
      { text: "WhatsApp visible to customers", yes: true },
      { text: "Featured badge in search", yes: false },
      { text: "Priority search placement", yes: false },
      { text: "Custom offer builder", yes: false },
    ],
    highlight: false,
    cta: "Start Starter",
    ctaDisabled: false,
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Most Popular",
    priceMonthly: 999,
    priceAnnual: 8999,
    tagline: "The fastest way to grow bookings",
    features: [
      { text: "Everything in Starter", yes: true },
      { text: "Up to 15 portfolio photos", yes: true },
      { text: "Featured badge in search results", yes: true },
      { text: "Priority search placement", yes: true },
      { text: "Custom offer builder", yes: true },
      { text: "Dedicated account support", yes: false },
    ],
    highlight: true,
    cta: "Go Pro",
    ctaDisabled: false,
  },
  {
    id: "elite",
    name: "Elite",
    priceMonthly: 2499,
    priceAnnual: 22499,
    tagline: "Top spot, guaranteed",
    features: [
      { text: "Everything in Pro", yes: true },
      { text: "Unlimited portfolio photos", yes: true },
      { text: "Top placement guaranteed", yes: true },
      { text: "Dedicated account manager", yes: true },
      { text: "Early access to new features", yes: true },
    ],
    highlight: false,
    cta: "Go Elite",
    ctaDisabled: false,
  },
];

const CheckIcon = () => (
  <svg width={15} height={15} viewBox="0 0 15 15" fill="none">
    <circle cx="7.5" cy="7.5" r="7.5" fill="#16A34A" fillOpacity="0.12"/>
    <path d="M4.5 7.5l2 2 4-4" stroke="#16A34A" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const XIcon = () => (
  <svg width={15} height={15} viewBox="0 0 15 15" fill="none">
    <circle cx="7.5" cy="7.5" r="7.5" fill="rgba(0,0,0,0.05)"/>
    <path d="M5 5l5 5M10 5l-5 5" stroke="rgba(0,0,0,0.25)" strokeWidth={1.4} strokeLinecap="round"/>
  </svg>
);

export default function VendorPricing() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState("monthly"); // "monthly" | "annual"
  const [currentTier, setCurrentTier] = useState("free");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Fetch current subscription
    const token = localStorage.getItem("vendorToken");
    if (!token) return;
    fetch(`${import.meta.env.VITE_BASE_URL}/subscriptions/vendor/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { if (d.subscription?.tier) setCurrentTier(d.subscription.tier); })
      .catch(() => {});
  }, []);

  const handleSubscribe = async (planId) => {
    const token = localStorage.getItem("vendorToken");
    if (!token) { navigate("/vendor/login"); return; }
    if (planId === "free") return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/subscriptions/vendor/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tier: planId, billingCycle: billing }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to start subscription"); return; }

      // Open Razorpay checkout
      const options = {
        key: data.razorpayKey,
        amount: data.amount * 100,
        currency: "INR",
        name: "Tendr",
        description: `${data.tier.charAt(0).toUpperCase() + data.tier.slice(1)} Plan — ${billing}`,
        order_id: data.orderId,
        handler: () => {
          setCurrentTier(planId);
          setSuccessMsg(`You're now on the ${planId.charAt(0).toUpperCase() + planId.slice(1)} plan!`);
          setTimeout(() => setSuccessMsg(""), 4000);
        },
        prefill: {},
        theme: { color: gold },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F2", fontFamily: font }}>
      {/* Header */}
      <div style={{ background: "#1C0E04", padding: "56px 24px 64px", textAlign: "center" }}>
        <button
          onClick={() => navigate("/vendor/dashboard")}
          style={{ position: "absolute", left: 24, top: 24, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 14px", color: "rgba(255,255,255,0.7)", fontFamily: font, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          ← Dashboard
        </button>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(204,171,74,0.1)", border: "1px solid rgba(204,171,74,0.22)", borderRadius: 100, padding: "4px 14px", marginBottom: 18 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: goldLt, letterSpacing: "0.1em", textTransform: "uppercase" }}>Vendor Plans</span>
        </div>
        <h1 style={{ fontFamily: FD, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, color: "#fff", margin: "0 0 14px", lineHeight: 1.1 }}>
          Grow your bookings on{" "}
          <em style={{ fontStyle: "italic", fontWeight: 600, background: `linear-gradient(135deg, ${gold}, ${goldLt})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Tendr
          </em>
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", maxWidth: 480, margin: "0 auto 32px" }}>
          Free to list. Upgrade when you're ready to fill your calendar.
        </p>

        {/* Billing toggle */}
        <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: 4, gap: 4 }}>
          {["monthly", "annual"].map(b => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              style={{
                padding: "7px 20px", borderRadius: 100, border: "none", cursor: "pointer", fontFamily: font,
                fontSize: 13, fontWeight: 600, transition: "all 0.18s",
                background: billing === b ? gold : "transparent",
                color: billing === b ? "#fff" : "rgba(255,255,255,0.55)",
              }}
            >
              {b === "monthly" ? "Monthly" : "Annual"}
              {b === "annual" && <span style={{ fontSize: 10, marginLeft: 6, background: "rgba(255,255,255,0.2)", borderRadius: 100, padding: "2px 6px" }}>Save 25%</span>}
            </button>
          ))}
        </div>
      </div>

      {successMsg && (
        <div style={{ background: "#16A34A", color: "#fff", textAlign: "center", padding: "12px", fontFamily: font, fontSize: 14, fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Plan cards */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, alignItems: "start" }}>
          {PLANS.map((plan, i) => {
            const price = billing === "annual" ? plan.priceAnnual : plan.priceMonthly;
            const monthlyEquiv = billing === "annual" && plan.priceAnnual > 0 ? Math.round(plan.priceAnnual / 12) : price;
            const isCurrent = currentTier === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                  background: plan.highlight ? "#1C0E04" : "#fff",
                  border: plan.highlight ? `2px solid ${gold}` : isCurrent ? `2px solid ${gold}` : "1px solid rgba(139,69,19,0.12)",
                  borderRadius: 20,
                  padding: "28px 24px",
                  position: "relative",
                  boxShadow: plan.highlight ? "0 12px 48px rgba(196,122,46,0.22)" : "0 2px 12px rgba(139,69,19,0.06)",
                }}
              >
                {plan.badge && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg, ${gold}, ${goldLt})`, color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 100, padding: "4px 14px", whiteSpace: "nowrap", letterSpacing: "0.06em" }}>
                    {plan.badge}
                  </div>
                )}
                {isCurrent && !plan.highlight && (
                  <div style={{ position: "absolute", top: -12, right: 16, background: "#16A34A", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 100, padding: "3px 10px" }}>
                    Current
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: plan.highlight ? goldLt : gold, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{plan.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                    {price === 0 ? (
                      <span style={{ fontSize: 32, fontWeight: 800, color: plan.highlight ? "#fff" : ink }}>Free</span>
                    ) : (
                      <>
                        <span style={{ fontSize: 11, fontWeight: 600, color: plan.highlight ? "rgba(255,255,255,0.5)" : "#9B7450", alignSelf: "flex-start", marginTop: 6 }}>₹</span>
                        <span style={{ fontSize: 32, fontWeight: 800, color: plan.highlight ? "#fff" : ink }}>{monthlyEquiv.toLocaleString("en-IN")}</span>
                        <span style={{ fontSize: 12, color: plan.highlight ? "rgba(255,255,255,0.45)" : "#9B7450" }}>/mo</span>
                      </>
                    )}
                  </div>
                  {billing === "annual" && price > 0 && (
                    <div style={{ fontSize: 11.5, color: plan.highlight ? "rgba(255,255,255,0.45)" : "#9B7450" }}>
                      ₹{price.toLocaleString("en-IN")} billed annually
                    </div>
                  )}
                  <p style={{ fontSize: 12.5, color: plan.highlight ? "rgba(255,255,255,0.55)" : "#9B7450", margin: "10px 0 0", lineHeight: 1.5 }}>{plan.tagline}</p>
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={plan.ctaDisabled || isCurrent || loading}
                  style={{
                    width: "100%", padding: "11px", borderRadius: 11, border: "none", cursor: (plan.ctaDisabled || isCurrent) ? "default" : "pointer",
                    fontFamily: font, fontSize: 13.5, fontWeight: 700, marginBottom: 20, transition: "all 0.18s",
                    background: isCurrent ? "rgba(22,163,74,0.1)" : plan.highlight ? `linear-gradient(135deg, ${gold}, ${goldLt})` : plan.ctaDisabled ? "rgba(0,0,0,0.05)" : `rgba(196,122,46,0.08)`,
                    color: isCurrent ? "#16A34A" : plan.highlight ? "#fff" : plan.ctaDisabled ? "#9B7450" : gold,
                    boxShadow: plan.highlight && !isCurrent ? "0 4px 16px rgba(196,122,46,0.35)" : "none",
                  }}
                >
                  {isCurrent ? "✓ Current plan" : loading ? "..." : plan.cta}
                </button>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {plan.features.map((f, fi) => (
                    <div key={fi} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {f.yes ? <CheckIcon /> : <XIcon />}
                      <span style={{ fontSize: 12.5, color: plan.highlight ? (f.yes ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)") : (f.yes ? ink : "rgba(0,0,0,0.3)"), lineHeight: 1.4 }}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ strip */}
        <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }} className="pricing-faq">
          {[
            { q: "Can I cancel anytime?", a: "Yes. Cancel from your dashboard and you'll stay on your plan until the period ends. No refunds for partial months." },
            { q: "Do you take commission on bookings?", a: "Never. Tendr earns from subscriptions only. Every rupee a customer pays you is yours to keep." },
            { q: "What happens to my profile if I downgrade?", a: "Your profile stays live. Photos above the free limit (5) stay saved but won't be shown to customers until you upgrade again." },
          ].map((item, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid rgba(139,69,19,0.1)", borderRadius: 16, padding: "20px 20px" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: ink, marginBottom: 8 }}>{item.q}</div>
              <div style={{ fontSize: 13, color: "#7A5535", lineHeight: 1.6 }}>{item.a}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .pricing-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .pricing-faq { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 520px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
