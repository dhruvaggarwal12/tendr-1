import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/authSlice";

const font = "'Outfit', sans-serif";
const BASE_URL = import.meta.env.VITE_BASE_URL;

// Self-service account deletion — required so the account can eventually ship as a real
// App Store / Play Store app (Apple Guideline 5.1.1(v): if you can sign up in the app, you
// must be able to delete your account in the app, not just by emailing support).
export default function DeleteAccountModal({ onClose }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const canDelete = confirmText.trim().toUpperCase() === "DELETE";

  const handleDelete = async () => {
    if (!canDelete || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/consumers/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Failed to delete account. Please try again.");
        return;
      }
      setDone(true);
      setTimeout(() => {
        dispatch(logout());
        navigate("/");
      }, 1800);
    } catch {
      setError("Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={() => !loading && !done && onClose()} style={{ position: "fixed", inset: 0, zIndex: 100020, background: "rgba(10,4,2,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 380, background: "#FFFCF5", borderRadius: 20, padding: "26px 24px", fontFamily: font, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "10px 0" }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>✓</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#2C1A0E", margin: "0 0 6px" }}>Your account has been deleted</h3>
            <p style={{ fontSize: 13, color: "#7A5535", margin: 0 }}>Signing you out…</p>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E", margin: "0 0 8px" }}>Delete your account?</h3>
            <p style={{ fontSize: 13, color: "#7A5535", lineHeight: 1.55, margin: "0 0 14px" }}>
              This permanently removes your name, email, phone number and photo from Tendr and signs you out everywhere. This can't be undone.
            </p>

            {error && (
              <div style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: 10, padding: "10px 12px", marginBottom: 12, fontSize: 12.5, color: "#C0392B", lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#7A5535", marginBottom: 6 }}>
              Type DELETE to confirm
            </label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(139,69,19,0.22)", fontSize: 14, fontFamily: font, boxSizing: "border-box", marginBottom: 16, outline: "none" }}
            />

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} disabled={loading}
                style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid rgba(139,69,19,0.18)", background: "transparent", color: "#6B3A1F", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={!canDelete || loading}
                style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: canDelete && !loading ? "#C0392B" : "rgba(192,57,43,0.35)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: canDelete && !loading ? "pointer" : "not-allowed", fontFamily: font }}>
                {loading ? "Deleting…" : "Delete Account"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
