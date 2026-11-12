import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { generateReferralCode, formatCode, DISCOUNT_PERCENT } from "../utils/referral";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";
const GOLD = "#D9A05F";
const WARM_WHITE = "#FFF7F0";
const MUTED = "rgba(255,247,240,0.55)";

const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
);
const ShareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
);

// Standalone Refer & Earn popup — triggered from the tour's last step and a
// persistent entry point. Reuses the same GET /referrals/wallet data and the
// same share-code content as the inline card on Dashboard.jsx (id="refer-earn"),
// instead of duplicating that whole card. Withdrawal stays Dashboard-only — this
// popup links there rather than re-implementing that flow a second time.
export default function ReferEarnPopup({ onClose }) {
  const navigate = useNavigate();
  const { token, user } = useSelector((s) => s.auth);
  const [wallet, setWallet] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token || !user?._id) return;
    fetch(`${BASE_URL}/referrals/wallet`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setWallet(d); })
      .catch(() => {});
  }, [token, user?._id]);

  if (!token || !user?._id) {
    return (
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 9500, background: "rgba(10,4,2,0.72)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
        <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 360, background: "linear-gradient(165deg,#3B1F26 0%,#2A1A18 55%,#20130F 100%)", border: "1.5px solid rgba(217,160,95,0.32)", borderRadius: 24, padding: "28px 24px", textAlign: "center", fontFamily: font }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎁</div>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: WARM_WHITE, margin: "0 0 8px" }}>Refer &amp; Earn</h3>
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: "0 0 18px" }}>Sign in to get your referral code and start earning.</p>
          <button onClick={() => navigate("/login", { state: { returnTo: "/dashboard#refer-earn" } })}
            style={{ width: "100%", padding: "12px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${GOLD},#C47A2E)`, color: "#20130F", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
            Sign In →
          </button>
          <button onClick={onClose} style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 12, border: "none", background: "transparent", color: MUTED, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const code = generateReferralCode(user._id);
  const formatted = formatCode(code);
  const tier = wallet?.tier || "none";
  const handleCopy = () => {
    navigator.clipboard.writeText(formatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div onClick={onClose} data-tour="earn-popup" style={{ position: "fixed", inset: 0, zIndex: 9500, background: "rgba(10,4,2,0.72)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div onClick={e => e.stopPropagation()} style={{
        position: "relative", width: "100%", maxWidth: 380, maxHeight: "92dvh", overflowY: "auto",
        background: "linear-gradient(165deg,#3B1F26 0%,#2A1A18 55%,#20130F 100%)",
        border: "1.5px solid rgba(217,160,95,0.32)",
        borderRadius: 28, padding: "30px 26px 26px", boxShadow: "0 30px 80px rgba(0,0,0,0.55)", textAlign: "center", fontFamily: font,
      }}>
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30, borderRadius: "50%", border: "1px solid rgba(217,160,95,0.3)", background: "rgba(217,160,95,0.08)", color: GOLD, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          ×
        </button>

        <div style={{ fontSize: 38, marginBottom: 10 }}>🎁</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: WARM_WHITE, margin: "0 0 6px" }}>Refer &amp; Earn</h2>
        <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: "0 0 20px" }}>
          Friends get {DISCOUNT_PERCENT}% off with your code. You earn up to ₹{wallet?.nextReferralReward ?? 200} on their first booking.
        </p>

        <div style={{ background: "rgba(217,160,95,0.08)", border: "1.5px dashed rgba(217,160,95,0.4)", borderRadius: 16, padding: "16px", marginBottom: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 6px" }}>Your code</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: GOLD, letterSpacing: "0.04em", margin: 0 }}>{formatted}</p>
        </div>

        {wallet?.balance > 0 && (
          <p style={{ fontSize: 13, color: WARM_WHITE, margin: "0 0 16px" }}>
            You've earned <strong style={{ color: GOLD }}>₹{wallet.balance.toLocaleString("en-IN")}</strong> so far ·{" "}
            <span style={{ color: MUTED, textTransform: "capitalize" }}>{tier} tier</span>
          </p>
        )}

        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <button onClick={handleCopy}
            style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1.5px solid ${copied ? GOLD : "rgba(217,160,95,0.4)"}`, background: copied ? "rgba(217,160,95,0.16)" : "transparent", color: GOLD, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "background 0.15s, border-color 0.15s" }}>
            {copied ? "✓ Copied!" : <><CopyIcon /> Copy Code</>}
          </button>
          <a href={`https://wa.me/?text=${encodeURIComponent(`Plan your event on Tendr and get ${DISCOUNT_PERCENT}% off with my code: ${formatted}\n\n${window.location.origin}`)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#25D366,#1EBE5A)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, textDecoration: "none" }}>
            <ShareIcon /> Share
          </a>
        </div>

        <button onClick={() => { onClose?.(); navigate("/dashboard"); setTimeout(() => document.getElementById("refer-earn")?.scrollIntoView({ behavior: "smooth", block: "center" }), 400); }}
          style={{ width: "100%", padding: "10px", borderRadius: 12, border: "none", background: "transparent", color: MUTED, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: font, textDecoration: "underline", textUnderlineOffset: 3 }}>
          Open full Refer &amp; Earn page →
        </button>
      </div>
    </div>
  );
}
