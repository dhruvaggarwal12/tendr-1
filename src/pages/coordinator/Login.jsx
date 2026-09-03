import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logos/tendr-logo-secondary.png";

const BASE = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";
const gold = "#C47A2E";
const ink = "#2C1A0E";
const cream = "#FFFCF5";
const muted = "#9B7450";

export default function CoordinatorLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^[0-9]{10}$/.test(phone)) { setError("Enter a valid 10-digit phone number"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }

    setLoading(true);
    try {
      const r = await fetch(`${BASE}/coordinators/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phone, password }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || "Login failed"); setLoading(false); return; }

      localStorage.setItem("tendr_coordinator_token", data.token);
      localStorage.setItem("tendr_coordinator", JSON.stringify(data.coordinator));
      navigate("/coordinator/dashboard");
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "13px 14px", borderRadius: 10,
    border: "1.5px solid #E5D5C0", background: "#FFFEF9",
    fontFamily: font, fontSize: 14, color: ink, outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font }}>
      <div style={{ background: ink, padding: "0 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <img src={logo} alt="Tendr" style={{ height: 28, cursor: "pointer" }} onClick={() => navigate("/")} />
          <button onClick={() => navigate("/coordinator/register")} style={{ background: "none", border: "1.5px solid rgba(196,122,46,0.5)", borderRadius: 8, padding: "6px 16px", color: "#CCAB4A", fontFamily: font, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Register</button>
        </div>
      </div>

      <div style={{ minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ background: cream, borderRadius: 20, padding: "44px 40px", maxWidth: 420, width: "100%", boxShadow: "0 8px 40px rgba(44,26,14,0.10)" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: ink, margin: "0 0 8px" }}>Coordinator Login</h1>
            <p style={{ fontSize: 13, color: muted, margin: 0 }}>Access your leads, bookings, and earnings</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: ink, display: "block", marginBottom: 6 }}>Phone Number</label>
              <input style={inputStyle} placeholder="10-digit mobile" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/,"").slice(0,10))} inputMode="numeric" />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: ink, display: "block", marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input style={{ ...inputStyle, paddingRight: 44 }} type={showPw ? "text" : "password"} placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: muted, cursor: "pointer", fontSize: 14, fontFamily: font }}>
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: "#FFF1F1", border: "1.5px solid #FCA5A5", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#DC2626" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ padding: "13px", borderRadius: 12, border: "none", background: loading ? "#D4B483" : "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff", fontFamily: font, fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
              {loading ? "Logging in…" : "Log In →"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: muted }}>
            Not registered yet?{" "}
            <button onClick={() => navigate("/coordinator/register")} style={{ background: "none", border: "none", color: gold, fontFamily: font, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Apply now →</button>
          </p>
        </div>
      </div>
    </div>
  );
}
