// src/pages/payment/PaymentSuccessPage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearFinalisedVendor, clearVendorCompare } from "../../redux/listingFiltersSlice";
import { resetEventPlanning } from "../../redux/eventPlanningSlice";
import { clearCart, selectCartItems } from "../../redux/giftHamperCartSlice";
import SEO from "../../components/SEO";
import logo from "../../assets/logos/tendr-logo-secondary.png";
import Footer from "../../components/Footer";
import HamburgerNav from "../../components/HamburgerNav";
import { generateReferralCode, formatCode, DISCOUNT_PERCENT } from "../../utils/referral";
import { generateInvoicePDF, generateEventDetailsPDF, generateTimelinePDF, generateInvitationPDF } from "../../utils/pdfGenerator";
import { writeDayOfToStorage } from "../../utils/eventGenerators";

const font = "'Outfit', sans-serif";

const PaymentSuccessPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { bookingDetails, orderId, paymentId, amount } = state || {};
  const [booking, setBooking] = useState(null);
  const user = useSelector((s) => s.auth.user);
  const referralCode = user?._id ? formatCode(generateReferralCode(user._id)) : null;
  const [referralCopied, setReferralCopied] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState({}); // { vendorId: [msg, ...] }
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [dayofSlots, setDayofSlots] = useState([]);

  // Snapshot event + vendor + cart data BEFORE it gets cleared in useEffect
  const rawFinalised   = useSelector((s) => s.listingFilters.finalisedVendors || {});
  const rawFormData    = useSelector((s) => s.eventPlanning.formData || {});
  const rawGhItems     = useSelector(selectCartItems);
  const [confirmedVendors] = useState(() => {
    const vendors = [];
    Object.entries(rawFinalised).forEach(([serviceType, vendorOrArr]) => {
      const arr = Array.isArray(vendorOrArr) ? vendorOrArr : [vendorOrArr];
      arr.forEach(v => { if (v?.name) vendors.push({ name: v.name, serviceType }); });
    });
    return vendors;
  });
  const [eventSummary] = useState(() => ({
    eventType: rawFormData.eventType || bookingDetails?.eventName || "",
    date:      rawFormData.date      || bookingDetails?.schedule?.date || "",
    location:  rawFormData.location  || "",
    guests:    rawFormData.guests    || "",
  }));

  // Days until event from today
  const daysUntilEvent = (() => {
    const raw = rawFormData.date || bookingDetails?.schedule?.date || "";
    if (!raw) return null;
    try {
      let d;
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        d = new Date(raw);
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
        const [day, month, year] = raw.split("/");
        d = new Date(`${year}-${month}-${day}`);
      } else {
        d = new Date(raw);
      }
      if (isNaN(d.getTime())) return null;
      const today = new Date(); today.setHours(0, 0, 0, 0); d.setHours(0, 0, 0, 0);
      const diff = Math.ceil((d - today) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : null;
    } catch { return null; }
  })();
  // Fetch pinned messages + eventTiming from vendor conversations before they get cleared
  // Also writes pre-populated checklist + day-of schedule to localStorage
  useEffect(() => {
    const token = localStorage.getItem("tendr_token");

    if (!token) {
      const vendors = Object.entries(rawFinalised).flatMap(([svc, v]) =>
        Array.isArray(v) ? v.map(x => ({ name: x?.name || "", serviceType: svc })) : (v?.name ? [{ name: v.name, serviceType: svc }] : [])
      );
      const slots = writeDayOfToStorage(vendors, "", eventSummary.date);
      setDayofSlots(slots);
      return;
    }

    fetch(`${import.meta.env.VITE_BASE_URL}/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.json())
      .then(async data => {
        const convList = (data.conversations || []).filter(c => c.chatType === "vendor");
        const pinned = {};
        let eventTiming = "";

        await Promise.allSettled(convList.map(async c => {
          const vid = (c.vendorId?._id || c.vendorId)?.toString();
          if (!vid) return;
          try {
            const r2 = await fetch(`${import.meta.env.VITE_BASE_URL}/conversations/${c._id}`, {
              headers: { Authorization: `Bearer ${token}` },
              credentials: "include",
            });
            const full = await r2.json();
            const msgs = full.pinnedMessages || full.conversation?.pinnedMessages || c.pinnedMessages || [];
            pinned[vid] = msgs.map(m => typeof m === "string" ? m : m.content || m.text || "").filter(Boolean);
            // Grab eventTiming from botAnswers / eventDetails if available
            const timing = full.botAnswers?.eventTiming || full.eventDetails?.eventTiming || full.conversation?.botAnswers?.eventTiming || "";
            if (timing && !eventTiming) eventTiming = timing;
          } catch {}
        }));

        setPinnedMessages(pinned);

        // Build vendor list for timeline
        const vendors = Object.entries(rawFinalised).flatMap(([svc, v]) =>
          Array.isArray(v) ? v.map(x => ({ name: x?.name || "", serviceType: svc })) : (v?.name ? [{ name: v.name, serviceType: svc }] : [])
        );
        const slots = writeDayOfToStorage(vendors, eventTiming, eventSummary.date);
        setDayofSlots(slots);
      })
      .catch(() => {
        const slots = writeDayOfToStorage([], "", eventSummary.date);
        setDayofSlots(slots);
      });
  }, []);

  useEffect(() => {
    // Place gift hamper order now that payment is confirmed
    const ghDelivery = (() => { try { return JSON.parse(sessionStorage.getItem("gh_delivery") || "null"); } catch { return null; } })();
    if (rawGhItems.length > 0 && ghDelivery && paymentId) {
      const token = localStorage.getItem("tendr_token");
      fetch(`${import.meta.env.VITE_BASE_URL}/gift-hampers/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify({
          items:               rawGhItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
          customerName:        ghDelivery.name,
          customerPhone:       ghDelivery.phone,
          deliveryAddress:     ghDelivery.address,
          city:                ghDelivery.city,
          pincode:             ghDelivery.pincode || "",
          specialInstructions: ghDelivery.instructions || "",
          paymentId,
        }),
      }).catch(() => {});
      sessionStorage.removeItem("gh_delivery");
    }
    dispatch(clearCart());

    // Clear ALL booking state — payment is complete, fresh start
    dispatch(clearFinalisedVendor());
    dispatch(clearVendorCompare());
    dispatch(resetEventPlanning());
    // Also wipe localStorage keys directly so 7-day TTL doesn't resurrect them
    try {
      localStorage.removeItem('tendr_finalised');
      const uid = JSON.parse(localStorage.getItem('tendr_user') || '{}')._id || 'guest';
      localStorage.removeItem(`finalisedVendors_${uid}`);
      localStorage.removeItem('tendr_ep_session');
    } catch {}
    // Close active vendor conversations now that payment is done
    const token = localStorage.getItem("tendr_token");
    if (token) {
      fetch(`${import.meta.env.VITE_BASE_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
        .then(r => r.json())
        .then(data => {
          (data.conversations || [])
            .filter(c => c.chatType === "vendor" && c.chatApproved)
            .forEach(c => {
              fetch(`${import.meta.env.VITE_BASE_URL}/conversations/${c._id}/close`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
              }).catch(() => {});
            });
        })
        .catch(() => {});
    }
    // EventPlan flow — payment already verified and EventPlan updated in verify-plan-payment
    setBooking({
      _id: state?.eventPlanId || state?.orderId || state?.paymentId || "CONFIRMED",
      confirmed: true,
    });
  }, [bookingDetails, paymentId, navigate, state]);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF6EF]">
        <h2 className="text-xl font-bold text-[#2e1b0f]">
          Finalizing your booking...
        </h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <SEO title="Booking Confirmed — Tendr" description="Your Tendr booking is confirmed." path="/booking/payment-success" noIndex={true} />
      <HamburgerNav />

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "40px 20px 80px" }}>

        {/* ── Hero confirmation ── */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#15803d,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 16px", boxShadow: "0 8px 28px rgba(21,128,61,0.3)" }}>✓</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem,5vw,2.8rem)", fontWeight: 400, color: "#2C1A0E", margin: "0 0 8px", letterSpacing: "0.01em" }}>
            Booking Confirmed!
          </h1>
          <p style={{ fontSize: 15, color: "#9B7450", margin: 0 }}>Payment received · Your celebration is on its way</p>
        </div>

        {/* ── Countdown pill ── */}
        {daysUntilEvent && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg,rgba(196,122,46,0.08),rgba(204,171,74,0.12))", border: "1.5px solid rgba(196,122,46,0.3)", borderRadius: 100, padding: "10px 24px", fontSize: 14, fontWeight: 700, color: "#7A4A1A", fontFamily: font }}>
              🗓 Your event is in&nbsp;<span style={{ fontSize: 26, fontWeight: 900, color: "#C47A2E", lineHeight: 1 }}>{daysUntilEvent}</span>&nbsp;day{daysUntilEvent === 1 ? "" : "s"}!
            </span>
          </div>
        )}

        {/* ── Event summary card ── */}
        <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 20, padding: "24px 28px", marginBottom: 20, boxShadow: "0 8px 32px rgba(44,26,14,0.2)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#CCAB4A", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 14 }}>Your Event</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
            {[
              eventSummary.eventType && { icon: "🎉", label: "Event",    val: eventSummary.eventType },
              eventSummary.date      && { icon: "📅", label: "Date",     val: eventSummary.date },
              eventSummary.location  && { icon: "📍", label: "Location", val: eventSummary.location },
              eventSummary.guests    && { icon: "👥", label: "Guests",   val: eventSummary.guests },
              amount                 && { icon: "💳", label: "Paid",     val: `₹${Number(amount).toLocaleString("en-IN")}` },
            ].filter(Boolean).map(({ icon, label, val }) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", wordBreak: "break-word" }}>{icon} {val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Confirmed vendors ── */}
        {confirmedVendors.length > 0 && (
          <div style={{ background: "#FFFCF7", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "18px 22px", marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Confirmed Vendors</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {confirmedVendors.map(({ name, serviceType }) => (
                <div key={`${name}-${serviceType}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                    {name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E" }}>{name}</div>
                    <div style={{ fontSize: 11, color: "#9B7450" }}>{serviceType}</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 9px", borderRadius: 20 }}>✓ Confirmed</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── What happens next ── */}
        <div style={{ background: "#FFFCF7", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "18px 22px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>What happens next</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { icon: "📞", text: "Our team will contact you within 24 hours to confirm logistics and vendor timings." },
              { icon: "💬", text: "Your confirmed vendors will be notified. Keep your dashboard open for updates." },
              { icon: "🎉", text: "Just show up and celebrate — we handle the rest." },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 13, color: "#5a3a1a", lineHeight: 1.6 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Referral code ── */}
        {referralCode && (
          <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 16, padding: "18px 22px", marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#CCAB4A", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>🎁 Your Referral Code</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", letterSpacing: "0.1em", fontFamily: "'Courier New', monospace" }}>{referralCode}</span>
              <button onClick={() => { navigator.clipboard.writeText(referralCode); setReferralCopied(true); setTimeout(() => setReferralCopied(false), 2000); }}
                style={{ padding: "5px 14px", borderRadius: 8, border: "1.5px solid rgba(204,171,74,0.4)", background: referralCopied ? "rgba(204,171,74,0.2)" : "transparent", color: "#CCAB4A", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                {referralCopied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.55 }}>
              Friends get {DISCOUNT_PERCENT}% off their first booking when they use your code.
            </p>
          </div>
        )}

        {/* ── Download documents ── */}
        <div style={{ background: "#FFFCF7", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "18px 22px", marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#C47A2E", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Download Documents</div>
          <p style={{ fontSize: 12, color: "#9B7450", margin: "0 0 14px", lineHeight: 1.5 }}>All your event documents, ready to save or share.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {/* Invoice */}
            <button
              disabled={pdfGenerating}
              onClick={() => {
                setPdfGenerating(true);
                try {
                  generateInvoicePDF({ eventSummary, confirmedVendors, amount, orderId: state?.orderId, paymentId: state?.paymentId, userName: user?.name });
                } finally { setPdfGenerating(false); }
              }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 10px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: pdfGenerating ? "#f5f0e8" : "#FFFCF7", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: pdfGenerating ? "not-allowed" : "pointer", fontFamily: font, transition: "all 0.18s", minHeight: 80 }}
            >
              <span style={{ fontSize: 22 }}>🧾</span>
              Invoice
            </button>
            {/* Event Details */}
            <button
              disabled={pdfGenerating}
              onClick={async () => {
                setPdfGenerating(true);
                const pinnedByKey = {};
                confirmedVendors.forEach(v => {
                  const key = v._id || v.name;
                  pinnedByKey[key] = pinnedMessages[v._id] || pinnedMessages[v.name] || [];
                });
                try {
                  await generateEventDetailsPDF({ eventSummary, confirmedVendors, pinnedMessages: pinnedByKey, userName: user?.name, orderId: state?.orderId });
                } finally { setPdfGenerating(false); }
              }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 10px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#2C1A0E,#4A2810)", color: "#CCAB4A", fontSize: 13, fontWeight: 700, cursor: pdfGenerating ? "not-allowed" : "pointer", fontFamily: font, transition: "all 0.18s", minHeight: 80 }}
            >
              <span style={{ fontSize: 22 }}>📋</span>
              Event Details
            </button>
            {/* Timeline */}
            <button
              disabled={pdfGenerating}
              onClick={async () => {
                setPdfGenerating(true);
                try {
                  const slots = dayofSlots.length > 0 ? dayofSlots : JSON.parse(localStorage.getItem("tendr_dayof") || '{}').slots || [];
                  await generateTimelinePDF({ slots, eventSummary, userName: user?.name });
                } finally { setPdfGenerating(false); }
              }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "16px 10px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)", background: pdfGenerating ? "#f5f0e8" : "#FFFCF7", color: "#C47A2E", fontSize: 13, fontWeight: 700, cursor: pdfGenerating ? "not-allowed" : "pointer", fontFamily: font, transition: "all 0.18s", minHeight: 80 }}
            >
              <span style={{ fontSize: 22 }}>🗓</span>
              Day Timeline
            </button>
            {/* Invitation */}
            <button
              disabled={pdfGenerating}
              onClick={async () => {
                setPdfGenerating(true);
                try {
                  await generateInvitationPDF({
                    eventSummary,
                    confirmedVendors,
                    userName: user?.name,
                    giftHamperUrl: `${window.location.origin}/gift-hampers-cakes`,
                  });
                } finally { setPdfGenerating(false); }
              }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "14px 10px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: pdfGenerating ? "not-allowed" : "pointer", fontFamily: font, transition: "all 0.18s" }}
            >
              <span style={{ fontSize: 22 }}>📬</span>
              Invitation
            </button>
          </div>
          {pdfGenerating && (
            <p style={{ fontSize: 11, color: "#9B7450", textAlign: "center", margin: "10px 0 0" }}>Generating PDF…</p>
          )}
        </div>

        {/* ── Install App CTA ── */}
        <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 18, padding: "20px 22px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 36, flexShrink: 0 }}>📲</div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#CCAB4A", marginBottom: 4 }}>Install the Tendr App</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
              Get instant notifications when vendors confirm timings, send messages or your booking status changes.
            </div>
          </div>
          <button onClick={() => navigate("/install")}
            style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#CCAB4A", color: "#2C1A0E", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: font, whiteSpace: "nowrap", flexShrink: 0 }}>
            Install Now →
          </button>
        </div>

        {/* ── Action buttons ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a
            href="https://wa.me/919211668427?text=Hi%20Tendr%20team%2C%20I%20just%20completed%20my%20booking%20and%20need%20help."
            target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px", borderRadius: 12, background: "#25D366", color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 14px rgba(37,211,102,0.35)" }}
          >
            💬 Chat with Tendr Team on WhatsApp
          </a>
          <button onClick={() => navigate("/dashboard")}
            style={{ padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 14px rgba(196,122,46,0.3)" }}>
            Go to My Dashboard →
          </button>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;