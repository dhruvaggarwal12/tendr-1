import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { confirmSmartPlan } from "../apis/vendorApi";
import AuthModal from "./AuthModal";

const F = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const INK = "#2C1A0E";
const CREAM = "#FFFCF5";
const SHORTLIST_KEY = "tendr_shortlist";

// ── Shortlist helpers (exported so VendorList_ListingPage can import) ─────────
export const getShortlist = () => {
  try { return JSON.parse(localStorage.getItem(SHORTLIST_KEY) || "{}"); } catch { return {}; }
};

export const addToShortlist = (serviceType, vendor) => {
  const sl = getShortlist();
  if (!sl[serviceType]) sl[serviceType] = [];
  if (!sl[serviceType].find(v => v._id === vendor._id)) {
    sl[serviceType].push({
      _id: vendor._id,
      name: vendor.name || vendor.businessName || "Vendor",
      serviceType,
      price: vendor.startingPrice || vendor.price || null,
      image: vendor.portfolioPhotos?.[0] || vendor.image || vendor.coverImage || null,
      city: vendor.city || "",
    });
  }
  localStorage.setItem(SHORTLIST_KEY, JSON.stringify(sl));
  window.dispatchEvent(new CustomEvent("tendr:shortlist-update"));
};

export const removeFromShortlist = (serviceType, vendorId) => {
  const sl = getShortlist();
  if (sl[serviceType]) {
    sl[serviceType] = sl[serviceType].filter(v => v._id !== vendorId);
    if (sl[serviceType].length === 0) delete sl[serviceType];
  }
  localStorage.setItem(SHORTLIST_KEY, JSON.stringify(sl));
  window.dispatchEvent(new CustomEvent("tendr:shortlist-update"));
};

export const isInShortlist = (serviceType, vendorId) => {
  const sl = getShortlist();
  return !!(sl[serviceType]?.find(v => v._id === vendorId));
};

const CAT_EMOJI = {
  Caterer: "🍽️", DJ: "🎵", Decorator: "🎨", Photographer: "📸",
  Anchor: "🎤", Transport: "🚗", Mehendi: "🌿", Makeup: "💄",
};

// ── Main component ────────────────────────────────────────────────────────────
export default function ShortlistFloat() {
  const bookingType = useSelector(s => s.eventPlanning?.bookingType || "");
  const formData    = useSelector(s => s.eventPlanning?.formData || {});
  const authUser    = useSelector(s => s.auth?.user);


  const [shortlist,    setShortlist]    = useState(() => getShortlist());
  const [panelOpen,    setPanelOpen]    = useState(false);
  // Detect InPlanning button presence so we can stack above it on desktop
  const [hasPlan,      setHasPlan]      = useState(() => {
    try { return !!(localStorage.getItem("tendr_smart_plan") || localStorage.getItem("tendr_ep_session")); } catch { return false; }
  });
  const [chipVisible,  setChipVisible]  = useState(true);
  const [wizardOpen,   setWizardOpen]   = useState(false);
  const [wizardAnswers, setWizardAnswers] = useState({});
  const [submitting,   setSubmitting]   = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [convId,       setConvId]       = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const refresh = useCallback(() => {
    const sl = getShortlist();
    setShortlist(sl);
    // Re-show chip whenever shortlist changes
    setChipVisible(true);
  }, []);

  useEffect(() => {
    window.addEventListener("tendr:shortlist-update", refresh);
    return () => window.removeEventListener("tendr:shortlist-update", refresh);
  }, [refresh]);

  const categories   = Object.keys(shortlist);
  const totalCount   = categories.reduce((s, c) => s + shortlist[c].length, 0);

  // Only render for DIY flow with at least one shortlisted vendor
  if (bookingType !== "you-do-it" || totalCount === 0) return null;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleRemove = (cat, id) => removeFromShortlist(cat, id);

  const handleSendRequest = async () => {
    setSubmitting(true);
    try {
      const vendorSlots = categories.flatMap(cat =>
        shortlist[cat].map(v => ({
          category: cat,
          vendorId: v._id,
          vendorName: v.name,
          estimatedCost: v.price || 0,
          percentage: Math.round(100 / Math.max(1, totalCount)),
          status: "Pending",
          requirements: wizardAnswers[cat] || "",
        }))
      );
      const result = await confirmSmartPlan({
        customerId:    authUser?._id || null,
        customerName:  authUser?.name || "",
        customerPhone: authUser?.phoneNumber || "",
        eventDetails: {
          eventType:         formData?.eventType,
          guests:            Number(formData?.guests) || 0,
          location:          formData?.location,
          date:              formData?.date,
          budget:            formData?.budget,
          extraRequirements: formData?.extraRequirements || [],
        },
        vendorSlots,
        bookingType: "you-do-it",
      });
      const planData = { ...result.plan, conversationId: result.conversationId || null, _savedAt: Date.now() };
      localStorage.setItem("tendr_smart_plan", JSON.stringify(planData));
      window.dispatchEvent(new CustomEvent("tendr:plan-confirmed"));
      // Clear shortlist
      localStorage.removeItem(SHORTLIST_KEY);
      window.dispatchEvent(new CustomEvent("tendr:shortlist-update"));
      setConvId(result.conversationId);
      setSubmitted(true);
      setWizardOpen(false);
      // Notify FloatingChatButton to refresh its conversation list
      window.dispatchEvent(new CustomEvent("tendr:chat-started"));
    } catch (e) {
      console.error("Shortlist request failed:", e);
    }
    setSubmitting(false);
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const btnBase = {
    border: "none", cursor: "pointer", fontFamily: F,
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Success state ─────────────────────────────────────────────── */}
      {submitted && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9997, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: F }}>
          <div style={{ background: CREAM, borderRadius: 20, padding: "32px 28px", maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(44,26,14,0.25)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: INK, marginBottom: 8 }}>Request Sent!</div>
            <div style={{ fontSize: 13, color: "#9B7450", lineHeight: 1.6, marginBottom: 24 }}>
              Your vendor shortlist has been sent. Our Tendr Concierge will coordinate with all selected vendors and get back to you.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {convId && (
                <button onClick={() => { setSubmitted(false); window.location.href = "/chats"; }} style={{ ...btnBase, width: "100%", padding: "13px", borderRadius: 12, background: `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: "#fff", fontSize: 14, fontWeight: 800, boxShadow: "0 4px 14px rgba(196,122,46,0.35)" }}>
                  View Chat →
                </button>
              )}
              <button onClick={() => setSubmitted(false)} style={{ ...btnBase, width: "100%", padding: "11px", borderRadius: 12, border: `1.5px solid rgba(196,122,46,0.25)`, background: "#fff", color: GOLD, fontSize: 13, fontWeight: 700 }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Wizard modal ──────────────────────────────────────────────── */}
      {wizardOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9996, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: F }}
          onClick={() => !submitting && setWizardOpen(false)}>
          <div style={{ background: CREAM, borderRadius: 20, maxWidth: 480, width: "100%", maxHeight: "calc(100dvh - 80px)", overflowY: "auto", boxShadow: "0 20px 60px rgba(44,26,14,0.25)" }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: "22px 24px 16px", borderBottom: "1px solid rgba(196,122,46,0.12)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: INK }}>Tell us more</div>
                  <div style={{ fontSize: 12.5, color: "#9B7450", marginTop: 3 }}>Helps vendors prepare the right proposal</div>
                </div>
                <button onClick={() => !submitting && setWizardOpen(false)} style={{ ...btnBase, width: 30, height: 30, borderRadius: "50%", background: "rgba(196,122,46,0.1)", color: "#9B7450", fontSize: 16 }}>✕</button>
              </div>
            </div>

            {/* Per-category questions */}
            <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
              {categories.map(cat => (
                <div key={cat}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>{CAT_EMOJI[cat] || "🏷️"}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: INK }}>{cat}</div>
                      <div style={{ fontSize: 11, color: "#9B7450" }}>{shortlist[cat]?.length} vendor{shortlist[cat]?.length !== 1 ? "s" : ""} shortlisted</div>
                    </div>
                  </div>
                  <textarea
                    placeholder={`Any specific requirements for ${cat}? (optional)`}
                    value={wizardAnswers[cat] || ""}
                    onChange={e => setWizardAnswers(prev => ({ ...prev, [cat]: e.target.value }))}
                    rows={2}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.22)", background: "#FFF8EC", fontSize: 13, fontFamily: F, color: INK, resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.5 }}
                  />
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: "14px 24px 24px", borderTop: "1px solid rgba(196,122,46,0.1)" }}>
              <button
                onClick={handleSendRequest}
                disabled={submitting}
                style={{ ...btnBase, width: "100%", padding: "14px", borderRadius: 12, background: submitting ? "rgba(196,122,46,0.4)" : `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: "#fff", fontSize: 14, fontWeight: 800, cursor: submitting ? "not-allowed" : "pointer", boxShadow: submitting ? "none" : "0 4px 16px rgba(196,122,46,0.35)" }}>
                {submitting ? "Sending…" : `Send Request (${totalCount} vendor${totalCount !== 1 ? "s" : ""}) →`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Shortlist panel ───────────────────────────────────────────── */}
      {panelOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9010, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: "0 0 0 0", fontFamily: F }}
          onClick={() => setPanelOpen(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: CREAM, width: "100%", maxWidth: 420, maxHeight: "75dvh", borderRadius: "20px 20px 0 0", overflowY: "auto", boxShadow: "0 -8px 40px rgba(44,26,14,0.2)", display: "flex", flexDirection: "column" }}>
            {/* Panel header */}
            <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(196,122,46,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: INK }}>Your Shortlist</div>
                <div style={{ fontSize: 11.5, color: "#9B7450" }}>{totalCount} vendor{totalCount !== 1 ? "s" : ""} across {categories.length} categor{categories.length !== 1 ? "ies" : "y"}</div>
              </div>
              <button onClick={() => setPanelOpen(false)} style={{ ...btnBase, width: 30, height: 30, borderRadius: "50%", background: "rgba(196,122,46,0.1)", color: "#9B7450", fontSize: 16 }}>✕</button>
            </div>

            {/* Vendor list */}
            <div style={{ overflowY: "auto", flex: 1, padding: "12px 0" }}>
              {categories.map(cat => (
                <div key={cat}>
                  <div style={{ padding: "6px 20px 4px", fontSize: 10, fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "0.14em" }}>
                    {CAT_EMOJI[cat] || "🏷️"} {cat}
                  </div>
                  {shortlist[cat].map(v => (
                    <div key={v._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderBottom: "1px solid rgba(196,122,46,0.07)" }}>
                      {v.image ? (
                        <img src={v.image} alt={v.name} style={{ width: 40, height: 36, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 40, height: 36, borderRadius: 8, background: "rgba(196,122,46,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{CAT_EMOJI[cat] || "🏷️"}</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</div>
                        {(v.city || v.price) && (
                          <div style={{ fontSize: 11, color: "#9B7450" }}>
                            {[v.city, v.price && `₹${Number(v.price).toLocaleString("en-IN")}+`].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </div>
                      <button onClick={() => handleRemove(cat, v._id)} style={{ ...btnBase, width: 28, height: 28, borderRadius: "50%", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontSize: 15, flexShrink: 0 }}>✕</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Panel footer */}
            <div style={{ padding: "14px 20px 20px", borderTop: "1px solid rgba(196,122,46,0.1)", flexShrink: 0, background: CREAM }}>
              <button
                onClick={() => {
                  if (!authUser) { setAuthModalOpen(true); return; }
                  setPanelOpen(false);
                  setWizardAnswers({});
                  setWizardOpen(true);
                }}
                style={{ ...btnBase, width: "100%", padding: "14px", borderRadius: 12, background: `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: "#fff", fontSize: 14, fontWeight: 800, boxShadow: "0 4px 16px rgba(196,122,46,0.35)" }}>
                {authUser ? "Send Request →" : "Sign In to Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop: slide panel on right ─────────────────────────────── */}
      <style>{`
        @media (min-width: 768px) {
          .sl-panel-wrap { align-items: stretch !important; justify-content: flex-end !important; padding: 0 !important; }
          .sl-panel-inner { border-radius: 20px 0 0 20px !important; max-height: 100dvh !important; max-width: 380px !important; }
          .sl-float-btn   { display: flex !important; }
          .sl-float-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .sl-float-btn    { display: none !important; }
          .sl-float-mobile { display: flex !important; }
        }
        @keyframes sl-pop { from{opacity:0;transform:scale(0.85) translateY(6px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes sl-chip { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
      `}</style>

      {/* ── Floating glass button — DESKTOP (bottom-right, above In Planning) ── */}
      {/* Conditionally rendered: hidden when panel is open so it doesn't show through overlay */}
      {!panelOpen && <div className="sl-float-btn" style={{ position: "fixed", bottom: hasPlan ? 148 : 24, right: 24, zIndex: 8950, flexDirection: "column", alignItems: "flex-end", gap: 8, display: "none" }}>
        {/* Pop-out chip */}
        {chipVisible && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: INK, borderRadius: 100, padding: "6px 12px 6px 10px", boxShadow: "0 4px 16px rgba(44,26,14,0.35)", animation: "sl-chip 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", fontFamily: F, fontWeight: 600, whiteSpace: "nowrap" }}>
              {totalCount} vendor{totalCount !== 1 ? "s" : ""} shortlisted
            </span>
            <button onClick={() => setChipVisible(false)} style={{ ...btnBase, width: 16, height: 16, borderRadius: "50%", background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", fontSize: 11, padding: 0 }}>✕</button>
          </div>
        )}
        {/* Main glass button */}
        <button
          onClick={() => setPanelOpen(true)}
          style={{ width: 54, height: 54, borderRadius: "50%", border: "2px solid rgba(196,122,46,0.35)", background: "rgba(255,252,245,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: "0 8px 28px rgba(44,26,14,0.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", transition: "transform 0.18s, box-shadow 0.18s", fontFamily: F }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.07)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(44,26,14,0.28)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(44,26,14,0.2)"; }}>
          {/* Vendor/bag icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {/* Badge */}
          <span style={{ position: "absolute", top: -4, right: -4, width: 20, height: 20, borderRadius: "50%", background: GOLD, color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, border: "2px solid #FFFCF5", animation: "sl-pop 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}>
            {totalCount}
          </span>
        </button>
      </div>

      {/* Auth gate — shown when unauthenticated user taps Send Request */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          setPanelOpen(false);
          setWizardAnswers({});
          setWizardOpen(true);
        }}
        defaultMode="login"
      />

      {/* ── Floating button — MOBILE (bottom, above mobile nav) ────────── */}
      {/* Conditionally rendered: hidden when panel is open */}
      {!panelOpen && <div className="sl-float-mobile" style={{ position: "fixed", bottom: "calc(72px + env(safe-area-inset-bottom,0px) + 12px)", right: 16, zIndex: 8950, display: "none", alignItems: "center", gap: 8 }}>
        <button
          onClick={() => setPanelOpen(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px 10px 12px", borderRadius: 100, border: "none", background: `linear-gradient(135deg,${INK},#3A2210)`, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: F, cursor: "pointer", boxShadow: "0 6px 20px rgba(44,26,14,0.4)", whiteSpace: "nowrap" }}>
          {/* Bag icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(204,171,74,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          Shortlist
          <span style={{ background: GOLD, borderRadius: 100, padding: "1px 7px", fontSize: 12, fontWeight: 800 }}>{totalCount}</span>
        </button>
      </div>
    </>
  );
}
