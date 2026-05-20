import React, { useEffect, useState } from "react";
import loginbackground from "../../assets/backgrounds/login-bg.png";
import signupbackground from "../../assets/backgrounds/signup-bg.png";
import logo from "../../assets/logos/tendr-logo-secondary.png";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearError, signup, login } from "../../redux/authSlice";

const font = "'Outfit', sans-serif";

const EyeIcon = ({ open }) => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  fontSize: 14,
  fontFamily: font,
  border: "1.5px solid rgba(139,69,19,0.22)",
  borderRadius: 12,
  background: "#fff",
  color: "#2C1A0E",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.18s",
};

const labelStyle = {
  display: "block",
  fontSize: 12.5,
  fontWeight: 600,
  color: "#7A5535",
  marginBottom: 6,
  fontFamily: font,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const isSignupPath = location.pathname === "/signup";
  const [isSignup, setIsSignup] = useState(isSignupPath);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phoneNumber: "", location: "" });
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState("");

  useEffect(() => {
    setIsSignup(location.pathname === "/signup");
    dispatch(clearError());
    setLocalError("");
  }, [location.pathname, dispatch]);

  const toggleAuthMode = () => {
    setIsSignup(!isSignup);
    navigate(isSignup ? "/login" : "/signup");
    setPasswordError("");
    setShowPassword(false);
    setLocalError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") {
      setPasswordError(value.length > 0 && value.length < 8 ? "Minimum 8 characters" : "");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phoneNumber || !/^[6-9]\d{9}$/.test(formData.phoneNumber)) {
      setLocalError("Enter a valid 10-digit phone number"); return;
    }
    if (formData.password.length < 8) { setPasswordError("Minimum 8 characters"); return; }
    setLocalLoading(true);
    setLocalError("");
    try {
      // TEMP: direct signup without OTP — restore OTP flow when ready
      const BASE_URL = import.meta.env.VITE_BASE_URL;
      const res = await fetch(`${BASE_URL}/auth/signup/direct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setLocalError(data.message || "Signup failed. Please try again.");
        return;
      }
      // Store token + user in Redux (same as login)
      dispatch({ type: "auth/login/fulfilled", payload: data });
      navigate(data.consumer?.isAdmin ? "/AdminDashboard" : "/");

      // OTP FLOW (kept for when you re-enable):
      // const result = await dispatch(signup({ phoneNumber, name, email, password }));
      // if (signup.fulfilled.match(result)) navigate("/otp");
    } catch {
      setLocalError("Signup failed. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 8) { setPasswordError("Minimum 8 characters"); return; }
    setLocalLoading(true);
    setLocalError("");
    try {
      const result = await dispatch(login({
        phoneNumber: formData.phoneNumber,
        password: formData.password,
      }));
      if (login.fulfilled.match(result)) {
        const loggedUser = result.payload?.consumer;
        navigate(loggedUser?.isAdmin ? "/AdminDashboard" : "/");
      } else {
        const msg = result.payload || "";
        if (msg.toLowerCase().includes("not found") || msg.includes("404")) {
          setLocalError("You do not have an account, kindly sign up.");
        } else if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("invalid")) {
          setLocalError("Incorrect password. Please try again.");
        } else {
          setLocalError(msg || "Login failed. Please check your details and try again.");
        }
      }
    } catch {
      setLocalError("Login failed. Please try again.");
    } finally {
      setLocalLoading(false);
    }
  };

  const isBusy = loading || localLoading;
  const bgPhoto = isSignup ? signupbackground : loginbackground;

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: font }}>

      {/* ── Left panel: photo + branding ── */}
      <div
        style={{
          flex: "0 0 48%",
          position: "relative",
          overflow: "hidden",
          display: "none",
        }}
        className="auth-left-panel"
      >
        <img
          src={bgPhoto}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(28,10,0,0.72) 0%, rgba(80,40,10,0.55) 100%)" }} />

        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", padding: "48px 52px" }}>
          <div>
            <img src={logo} alt="Tendr" style={{ width: 160, height: "auto" }} />
          </div>

          <div>
            <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(204,171,74,0.85)", marginBottom: 16 }}>
              Event Planning, Simplified
            </p>
            <h2 style={{ fontSize: 38, fontWeight: 900, color: "#fff", lineHeight: 1.18, margin: "0 0 20px", letterSpacing: "-0.02em" }}>
              Your celebration,<br />perfectly planned.
            </h2>
            <p style={{ fontSize: 15.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.65, marginBottom: 36, maxWidth: 340 }}>
              Discover verified vendors across Delhi NCR — caterers, decorators, photographers, DJs, and more.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: "✓", text: "100+ Verified Vendors" },
                { icon: "✓", text: "Delhi · Noida · Greater Noida · Ghaziabad" },
                { icon: "✓", text: "All-in-one event management" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(204,171,74,0.25)", border: "1.5px solid rgba(204,171,74,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#CCAB4A", flexShrink: 0 }}>
                    {icon}
                  </span>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.82)", fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.35)", margin: 0 }}>© 2025 Tendr. All rights reserved.</p>
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div
        style={{
          flex: 1,
          background: "#F8F4EF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          minHeight: "100vh",
          position: "relative",
          overflowY: "auto",
        }}
      >
        {/* Mobile background image (hidden on desktop via left panel) */}
        <div
          className="auth-mobile-bg"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            backgroundImage: "url(" + bgPhoto + ")",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "none",
          }}
        />
        <div className="auth-mobile-bg" style={{ position: "fixed", inset: 0, zIndex: 1, background: "rgba(204,171,74,0.25)", display: "none" }} />

        <div
          style={{
            width: "100%",
            maxWidth: 420,
            background: "#FFFCF5",
            borderRadius: 24,
            boxShadow: "0 12px 48px rgba(139,69,19,0.13), 0 2px 8px rgba(0,0,0,0.04)",
            border: "1px solid rgba(139,69,19,0.1)",
            padding: "36px 36px 32px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <img src={logo} alt="Tendr" style={{ width: 160, height: "auto", display: "inline-block" }} />
          </div>

          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#2C1A0E", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
              {isSignup ? "Create your account" : "Welcome back"}
            </h2>
            <p style={{ fontSize: 13.5, color: "#9B7450", margin: 0 }}>
              {isSignup ? "Join Tendr and start planning your event" : "Sign in to continue planning your event"}
            </p>
          </div>

          {/* Error */}
          {(error || localError) && (
            <div style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 13.5, color: "#C0392B", textAlign: "center" }}>
              {localError || error}
            </div>
          )}

          {isSignup ? (
            <form onSubmit={handleSignupSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                  style={{ ...inputStyle, borderColor: focused === "name" ? "#C47A2E" : "rgba(139,69,19,0.22)" }}
                  placeholder="Enter your full name" disabled={isBusy} required
                />
              </div>

              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                  style={{ ...inputStyle, borderColor: focused === "email" ? "#C47A2E" : "rgba(139,69,19,0.22)" }}
                  placeholder="you@example.com" disabled={isBusy} required
                />
              </div>

              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                  onFocus={() => setFocused("phoneNumber")} onBlur={() => setFocused("")}
                  style={{ ...inputStyle, borderColor: focused === "phoneNumber" ? "#C47A2E" : "rgba(139,69,19,0.22)" }}
                  placeholder="+91 98765 43210" disabled={isBusy} required
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                    onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                    style={{ ...inputStyle, paddingRight: 44, borderColor: passwordError ? "#C0392B" : focused === "password" ? "#C47A2E" : "rgba(139,69,19,0.22)" }}
                    placeholder="Minimum 8 characters" disabled={isBusy} required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9B7450", display: "flex", alignItems: "center", padding: 0 }}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {passwordError && <p style={{ fontSize: 12, color: "#C0392B", margin: "5px 0 0", fontFamily: font }}>{passwordError}</p>}
              </div>

              <div>
                <label style={labelStyle}>Your City</label>
                <select
                  name="location" value={formData.location} onChange={handleChange}
                  onFocus={() => setFocused("location")} onBlur={() => setFocused("")}
                  style={{ ...inputStyle, borderColor: focused === "location" ? "#C47A2E" : "rgba(139,69,19,0.22)", cursor: "pointer" }}
                  disabled={isBusy}
                >
                  <option value="">Select your city</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Noida">Noida</option>
                  <option value="Greater Noida">Greater Noida</option>
                  <option value="Ghaziabad">Ghaziabad</option>
                </select>
              </div>

              <button
                type="submit" disabled={isBusy || !!passwordError}
                style={{
                  width: "100%", padding: "13px", marginTop: 4,
                  background: isBusy || passwordError ? "#e5e7eb" : "linear-gradient(135deg, #C47A2E, #CCAB4A)",
                  color: isBusy || passwordError ? "#9ca3af" : "#fff",
                  fontSize: 15, fontWeight: 700, fontFamily: font,
                  border: "none", borderRadius: 12, cursor: isBusy || passwordError ? "not-allowed" : "pointer",
                  boxShadow: !isBusy && !passwordError ? "0 4px 14px rgba(196,122,46,0.35)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {isBusy ? "Creating account..." : "Create Account"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                  onFocus={() => setFocused("phoneNumber")} onBlur={() => setFocused("")}
                  style={{ ...inputStyle, borderColor: focused === "phoneNumber" ? "#C47A2E" : "rgba(139,69,19,0.22)" }}
                  placeholder="+91 98765 43210" disabled={isBusy} required
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#C47A2E", cursor: "pointer", fontFamily: font }}>
                    Forgot password?
                  </span>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange}
                    onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                    style={{ ...inputStyle, paddingRight: 44, borderColor: passwordError ? "#C0392B" : focused === "password" ? "#C47A2E" : "rgba(139,69,19,0.22)" }}
                    placeholder="Enter your password" disabled={isBusy} required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9B7450", display: "flex", alignItems: "center", padding: 0 }}>
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
                {passwordError && <p style={{ fontSize: 12, color: "#C0392B", margin: "5px 0 0", fontFamily: font }}>{passwordError}</p>}
              </div>

              <button
                type="submit" disabled={isBusy || !!passwordError}
                style={{
                  width: "100%", padding: "13px", marginTop: 4,
                  background: isBusy || passwordError ? "#e5e7eb" : "linear-gradient(135deg, #C47A2E, #CCAB4A)",
                  color: isBusy || passwordError ? "#9ca3af" : "#fff",
                  fontSize: 15, fontWeight: 700, fontFamily: font,
                  border: "none", borderRadius: 12, cursor: isBusy || passwordError ? "not-allowed" : "pointer",
                  boxShadow: !isBusy && !passwordError ? "0 4px 14px rgba(196,122,46,0.35)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {isBusy ? "Signing in..." : "Sign In"}
              </button>
            </form>
          )}

          {/* Toggle */}
          <div style={{ marginTop: 22, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13.5, fontFamily: font }}>
            <span style={{ color: "#7A5535" }}>{isSignup ? "Already have an account?" : "New to Tendr?"}</span>
            <button
              onClick={toggleAuthMode}
              style={{ background: "none", border: "none", fontFamily: font, fontSize: 13.5, fontWeight: 700, color: "#C47A2E", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              {isSignup ? "Sign In" : "Create an account"}
            </button>
          </div>
        </div>

        {/* Serving cities note */}
        <p style={{ marginTop: 20, fontSize: 12.5, color: "#9B7450", textAlign: "center", fontFamily: font, position: "relative", zIndex: 2 }}>
          Serving Delhi · Noida · Greater Noida · Ghaziabad
        </p>
      </div>

      <style>{`
        @media (min-width: 860px) {
          .auth-left-panel { display: block !important; }
          .auth-mobile-bg { display: none !important; }
        }
        @media (max-width: 859px) {
          .auth-mobile-bg { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default Auth;
