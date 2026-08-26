import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearError, login } from "../redux/authSlice";
import { fetchEventData } from "../redux/eventPlanningSlice";
import { syncProgressOnLogin } from "../utils/progressSync";
import logo from "../assets/logos/tendr-logo-secondary.png";
import { useGoogleLogin } from "@react-oauth/google";

const font = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const BROWN = "#2C1A0E";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const inputStyle = {
  width: "100%", padding: "10px 13px", fontSize: 14, fontFamily: font,
  border: "1.5px solid rgba(139,69,19,0.22)", borderRadius: 11,
  background: "#fff", color: BROWN, outline: "none", boxSizing: "border-box",
  transition: "border-color 0.18s",
};
const labelStyle = {
  display: "block", fontSize: 11.5, fontWeight: 700, color: "#7A5535",
  marginBottom: 5, fontFamily: font, textTransform: "uppercase", letterSpacing: "0.04em",
};

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {open ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    ) : (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </>
    )}
  </svg>
);

/**
 * AuthModal — centered sign-in / sign-up overlay.
 * Props:
 *   open       — boolean
 *   onClose    — called when user dismisses without signing in
 *   onSuccess  — called after successful login or signup (no args)
 *   defaultMode — "login" | "signup" (default: "login")
 */
export default function AuthModal({ open, onClose, onSuccess, defaultMode = "login", showSkip = false }) {
  const dispatch = useDispatch();
  const { loading } = useSelector(s => s.auth);

  const [isSignup, setIsSignup]           = useState(defaultMode === "signup");
  const [formData, setFormData]           = useState({ name: "", email: "", password: "", phoneNumber: "", location: "" });
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [focused, setFocused]             = useState("");
  const [localLoading, setLocalLoading]   = useState(false);
  const [localError, setLocalError]       = useState("");
  const [slowMsg, setSlowMsg]             = useState(false);
  const [googlePhoneStep, setGooglePhoneStep] = useState(null); // { pendingToken }
  const [googlePhone, setGooglePhone]         = useState("");

  const isBusy = loading || localLoading;

  useEffect(() => {
    if (!open) return;
    setIsSignup(defaultMode === "signup");
    setFormData({ name: "", email: "", password: "", phoneNumber: "", location: "" });
    setLocalError("");
    setPasswordError("");
    setShowPassword(false);
    setGooglePhoneStep(null);
    setGooglePhone("");
    dispatch(clearError());
  }, [open, defaultMode, dispatch]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLocalLoading(true);
      setLocalError("");
      try {
        const res = await fetch(`${BASE_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: tokenResponse.access_token }),
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Google sign-in failed");
        if (data.needsPhone) {
          setGooglePhoneStep({ pendingToken: data.pendingToken });
          return;
        }
        dispatch({ type: "auth/login/fulfilled", payload: data });
        if (data?.token) { dispatch(fetchEventData(data.token)); syncProgressOnLogin(data.token); }
        onSuccess?.();
        onClose?.();
      } catch (err) {
        setLocalError(err.message || "Google sign-in failed.");
      } finally {
        setLocalLoading(false);
      }
    },
    onError: () => setLocalError("Google sign-in was cancelled or failed."),
  });

  const handleGoogleComplete = async () => {
    if (!googlePhone || !/^[6-9]\d{9}$/.test(googlePhone)) {
      setLocalError("Enter a valid 10-digit Indian mobile number"); return;
    }
    setLocalLoading(true);
    setLocalError("");
    try {
      const res = await fetch(`${BASE_URL}/auth/google/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingToken: googlePhoneStep.pendingToken, phoneNumber: googlePhone }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete sign-up");
      dispatch({ type: "auth/login/fulfilled", payload: data });
      if (data?.token) { dispatch(fetchEventData(data.token)); syncProgressOnLogin(data.token); }
      window.dispatchEvent(new CustomEvent("tendr:show-pwa-prompt", { detail: { source: "signup" } }));
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setLocalError(err.message || "Failed to complete sign-up.");
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (!isBusy) { setSlowMsg(false); return; }
    const t = setTimeout(() => setSlowMsg(true), 6000);
    return () => clearTimeout(t);
  }, [isBusy]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    if (name === "password") setPasswordError(value.length > 0 && value.length < 8 ? "Minimum 8 characters" : "");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 8) { setPasswordError("Minimum 8 characters"); return; }
    setLocalLoading(true); setLocalError("");
    try {
      const result = await dispatch(login({ phoneNumber: formData.phoneNumber, password: formData.password }));
      if (login.fulfilled.match(result)) {
        const token = result.payload?.token;
        if (token) { dispatch(fetchEventData(token)); syncProgressOnLogin(token); }
        try {
          const raw = JSON.parse(localStorage.getItem("tendr:session:discovery") || "null");
          if (raw?.date) {
            const exp = new Date(raw.date + "T00:00:00"); exp.setDate(exp.getDate() + 1);
            localStorage.setItem("tendr:session:discovery", JSON.stringify({ ...raw, __expiresAt: exp.getTime() }));
          }
        } catch {}
        onSuccess?.();
        onClose?.();
      } else {
        const msg = result.payload || "";
        if (msg.toLowerCase().includes("not found") || msg.includes("404")) {
          setLocalError("No account found — try signing up.");
        } else if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("invalid")) {
          setLocalError("Incorrect password. Please try again.");
        } else {
          setLocalError(msg || "Login failed. Please check your details.");
        }
      }
    } catch { setLocalError("Login failed. Please try again."); }
    finally { setLocalLoading(false); }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phoneNumber || !/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      setLocalError("Enter a valid 10-digit phone number"); return;
    }
    if (formData.password.length < 8) { setPasswordError("Minimum 8 characters"); return; }
    setLocalLoading(true); setLocalError("");
    try {
      const res = await fetch(`${BASE_URL}/auth/signup/direct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber, name: formData.name, email: formData.email, password: formData.password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setLocalError(res.status === 409 ? "Account already exists with this phone number." : (data.message || "Signup failed."));
        return;
      }
      dispatch({ type: "auth/login/fulfilled", payload: data });
      if (data?.token) syncProgressOnLogin(data.token);
      try {
        const raw = JSON.parse(localStorage.getItem("tendr:session:discovery") || "null");
        if (raw?.date) {
          const exp = new Date(raw.date + "T00:00:00"); exp.setDate(exp.getDate() + 1);
          localStorage.setItem("tendr:session:discovery", JSON.stringify({ ...raw, __expiresAt: exp.getTime() }));
        }
      } catch {}
      window.dispatchEvent(new CustomEvent("tendr:show-pwa-prompt", { detail: { source: "signup" } }));
      onSuccess?.();
      onClose?.();
    } catch { setLocalError("Signup failed. Please try again."); }
    finally { setLocalLoading(false); }
  };

  const errorMsg = localError;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => { if (!isBusy) onClose?.(); }}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.52)", zIndex: 110000, backdropFilter: "blur(4px)" }}
      />

      {/* Modal card */}
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        zIndex: 110001,
        width: "min(92vw, 400px)",
        maxHeight: "calc(100dvh - 160px - env(safe-area-inset-bottom, 0px))",
        overflowY: "auto",
        background: "#FFFCF5",
        borderRadius: 22,
        boxShadow: "0 20px 60px rgba(139,69,19,0.22), 0 4px 16px rgba(0,0,0,0.08)",
        border: "1px solid rgba(139,69,19,0.1)",
        fontFamily: font,
        WebkitOverflowScrolling: "touch",
      }}>
        <div style={{ padding: "28px 26px 24px" }}>
          {/* Close */}
          <button
            onClick={() => { if (!isBusy) onClose?.(); }}
            style={{ position: "absolute", top: 14, right: 14, width: 30, height: 30, borderRadius: "50%", background: "rgba(44,26,14,0.07)", border: "none", cursor: "pointer", fontSize: 16, color: "#9B7450", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
          >✕</button>

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <img src={logo} alt="Tendr" style={{ height: 30, display: "inline-block" }} />
          </div>

          {/* Tabs — hidden during Google phone step */}
          <div style={{ display: googlePhoneStep ? "none" : "flex", background: "rgba(44,26,14,0.05)", borderRadius: 12, padding: 3, marginBottom: 22, gap: 3 }}>
            {["login", "signup"].map(mode => (
              <button
                key={mode}
                onClick={() => { setIsSignup(mode === "signup"); setLocalError(""); setPasswordError(""); }}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer", fontFamily: font,
                  fontSize: 13, fontWeight: 700, transition: "all 0.18s",
                  background: (mode === "signup") === isSignup ? "#FFFCF5" : "transparent",
                  color: (mode === "signup") === isSignup ? BROWN : "#9B7450",
                  boxShadow: (mode === "signup") === isSignup ? "0 1px 6px rgba(44,26,14,0.12)" : "none",
                }}
              >
                {mode === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* ── Google phone step ── */}
          {googlePhoneStep && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 13.5, color: BROWN, textAlign: "center", lineHeight: 1.55, margin: 0 }}>
                One last step — enter your mobile number to complete your account.
              </p>
              {localError && (
                <div style={{ background: "rgba(192,57,43,0.07)", border: "1px solid rgba(192,57,43,0.18)", borderRadius: 10, padding: "10px 13px", fontSize: 13, color: "#C0392B", textAlign: "center" }}>
                  {localError}
                </div>
              )}
              <div>
                <label style={labelStyle}>Mobile Number</label>
                <input type="tel" value={googlePhone}
                  onChange={e => { setGooglePhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setLocalError(""); }}
                  onFocus={() => setFocused("googlePhone")} onBlur={() => setFocused("")}
                  style={{ ...inputStyle, borderColor: focused === "googlePhone" ? GOLD : "rgba(139,69,19,0.22)" }}
                  placeholder="10-digit number" maxLength={10} disabled={isBusy} autoFocus />
              </div>
              <button type="button" onClick={handleGoogleComplete} disabled={isBusy}
                style={{ width: "100%", padding: "12px", background: isBusy ? "#e5e7eb" : `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: isBusy ? "#9ca3af" : "#fff", fontSize: 14, fontWeight: 700, fontFamily: font, border: "none", borderRadius: 11, cursor: isBusy ? "not-allowed" : "pointer", boxShadow: !isBusy ? "0 4px 14px rgba(196,122,46,0.35)" : "none" }}>
                {isBusy ? "Creating account…" : "Complete Sign Up"}
              </button>
              <button type="button" onClick={() => { setGooglePhoneStep(null); setGooglePhone(""); setLocalError(""); }}
                style={{ background: "none", border: "none", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, textAlign: "center", padding: "4px 0" }}>
                ← Back
              </button>
            </div>
          )}

          {/* Slow server */}
          {!googlePhoneStep && isBusy && slowMsg && (
            <div style={{ background: "rgba(196,122,46,0.08)", border: "1px solid rgba(196,122,46,0.25)", borderRadius: 10, padding: "9px 12px", marginBottom: 16, fontSize: 12.5, color: "#92400e", textAlign: "center" }}>
              ⏳ Server is waking up — usually under 30 seconds…
            </div>
          )}

          {/* Error + forms — hidden during google phone step */}
          {!googlePhoneStep && (<>
            {errorMsg && (
              <div style={{ background: "rgba(192,57,43,0.07)", border: "1px solid rgba(192,57,43,0.18)", borderRadius: 10, padding: "10px 13px", marginBottom: 16, fontSize: 13, color: "#C0392B", textAlign: "center" }}>
                {errorMsg}
                {errorMsg.includes("already exists") && (
                  <div style={{ marginTop: 6 }}>
                    <button onClick={() => { setIsSignup(false); setLocalError(""); }} style={{ background: "none", border: "none", color: GOLD, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: font, textDecoration: "underline" }}>Sign in instead →</button>
                  </div>
                )}
                {errorMsg.includes("No account") && (
                  <div style={{ marginTop: 6 }}>
                    <button onClick={() => { setIsSignup(true); setLocalError(""); }} style={{ background: "none", border: "none", color: GOLD, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: font, textDecoration: "underline" }}>Sign up instead →</button>
                  </div>
                )}
              </div>
            )}

            {/* Google button */}
            <button type="button" onClick={() => googleLogin()} disabled={isBusy}
              style={{ width: "100%", padding: "11px 14px", marginBottom: 14, background: "#fff", border: "1.5px solid rgba(139,69,19,0.22)", borderRadius: 11, cursor: isBusy ? "not-allowed" : "pointer", fontFamily: font, fontSize: 14, fontWeight: 600, color: BROWN, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(139,69,19,0.12)" }} />
              <span style={{ fontSize: 11.5, color: "#9B7450", fontWeight: 600 }}>or</span>
              <div style={{ flex: 1, height: 1, background: "rgba(139,69,19,0.12)" }} />
            </div>

            {/* ── Login form ── */}
            {!isSignup && (
              <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                    onFocus={() => setFocused("phoneNumber")} onBlur={() => setFocused("")}
                    style={{ ...inputStyle, borderColor: focused === "phoneNumber" ? GOLD : "rgba(139,69,19,0.22)" }}
                    placeholder="+91 98765 43210" disabled={isBusy} required />
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                      onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                      style={{ ...inputStyle, paddingRight: 40, borderColor: passwordError ? "#C0392B" : focused === "password" ? GOLD : "rgba(139,69,19,0.22)" }}
                      placeholder="Enter your password" disabled={isBusy} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                      style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9B7450", display: "flex", padding: 0 }}>
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  {passwordError && <p style={{ fontSize: 11.5, color: "#C0392B", margin: "4px 0 0", fontFamily: font }}>{passwordError}</p>}
                </div>
                <button type="submit" disabled={isBusy || !!passwordError}
                  style={{ width: "100%", padding: "12px", marginTop: 2, background: isBusy || passwordError ? "#e5e7eb" : `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: isBusy || passwordError ? "#9ca3af" : "#fff", fontSize: 14, fontWeight: 700, fontFamily: font, border: "none", borderRadius: 11, cursor: isBusy || passwordError ? "not-allowed" : "pointer", boxShadow: !isBusy && !passwordError ? "0 4px 14px rgba(196,122,46,0.35)" : "none" }}>
                  {isBusy ? "Signing in…" : "Sign In"}
                </button>
              </form>
            )}

          {/* ── Signup form ── */}
          {isSignup && (
            <form onSubmit={handleSignupSubmit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                  style={{ ...inputStyle, borderColor: focused === "name" ? GOLD : "rgba(139,69,19,0.22)" }}
                  placeholder="Your full name" disabled={isBusy} required />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                  style={{ ...inputStyle, borderColor: focused === "email" ? GOLD : "rgba(139,69,19,0.22)" }}
                  placeholder="you@example.com" disabled={isBusy} required />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                  onFocus={() => setFocused("phoneNumber")} onBlur={() => setFocused("")}
                  style={{ ...inputStyle, borderColor: focused === "phoneNumber" ? GOLD : "rgba(139,69,19,0.22)" }}
                  placeholder="+91 98765 43210" disabled={isBusy} required />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                    onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                    style={{ ...inputStyle, paddingRight: 40, borderColor: passwordError ? "#C0392B" : focused === "password" ? GOLD : "rgba(139,69,19,0.22)" }}
                    placeholder="Minimum 8 characters" disabled={isBusy} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                    style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9B7450", display: "flex", padding: 0 }}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {passwordError && <p style={{ fontSize: 11.5, color: "#C0392B", margin: "4px 0 0", fontFamily: font }}>{passwordError}</p>}
              </div>
              <div>
                <label style={labelStyle}>Your City</label>
                <select name="location" value={formData.location} onChange={handleChange}
                  onFocus={() => setFocused("location")} onBlur={() => setFocused("")}
                  style={{ ...inputStyle, borderColor: focused === "location" ? GOLD : "rgba(139,69,19,0.22)", cursor: "pointer" }}
                  disabled={isBusy}>
                  <option value="">Select your city</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Noida">Noida</option>
                  <option value="Greater Noida">Greater Noida</option>
                  <option value="Ghaziabad">Ghaziabad</option>
                </select>
              </div>
              <button type="submit" disabled={isBusy || !!passwordError}
                style={{ width: "100%", padding: "12px", marginTop: 2, background: isBusy || passwordError ? "#e5e7eb" : `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: isBusy || passwordError ? "#9ca3af" : "#fff", fontSize: 14, fontWeight: 700, fontFamily: font, border: "none", borderRadius: 11, cursor: isBusy || passwordError ? "not-allowed" : "pointer", boxShadow: !isBusy && !passwordError ? "0 4px 14px rgba(196,122,46,0.35)" : "none" }}>
                {isBusy ? "Creating account…" : "Create Account"}
              </button>
            </form>
          )}
          </>)}

          {showSkip && !googlePhoneStep && (
            <button
              type="button"
              onClick={() => { if (!isBusy) onClose?.(); }}
              style={{ display: "block", width: "100%", marginTop: 12, padding: "9px", background: "none", border: "none", color: "#9B7450", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font, textAlign: "center" }}
            >
              Skip for now
            </button>
          )}
          {!googlePhoneStep && (
            <p style={{ marginTop: 12, fontSize: 12, color: "#9B7450", textAlign: "center" }}>
              Serving Delhi · Noida · Greater Noida · Ghaziabad
            </p>
          )}
        </div>
      </div>
    </>
  );
}
