import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../../components/HamburgerNav";

const font = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const GOLD_LIGHT = "#CCAB4A";
const BG = "#F8F4EF";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function QuestionnaireIntro() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const start = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/questionnaires/next`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.status === 409) {
        setError("You've answered everything we currently have for you — check back later for more questions.");
        return;
      }
      if (!data?._id) {
        setError(data?.error || "Could not start the questionnaire. Please try again.");
        return;
      }
      navigate(`/refer-and-earn/questionnaire/${data._id}`);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: font, paddingBottom: "calc(40px + env(safe-area-inset-bottom, 0px))" }}>
      <HamburgerNav title="Help Us Understand Customers" showBack />

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "28px 18px" }}>
        <div style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, borderRadius: 20, padding: "28px 24px", color: "#fff", marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Answer 7 quick questions</div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.92)" }}>
            We're building a better Tendr — your honest answers about budgets, packages, vendors and decor help us
            get pricing and recommendations right. It takes about 3 minutes.
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "20px", marginBottom: 20, border: "1.5px solid rgba(196,122,46,0.12)" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E", marginBottom: 12 }}>What to expect</div>
          {[
            "5 quick multiple-choice questions",
            "1 short written opinion (a sentence or two is fine)",
            "1 photo or visual-selection task",
            "Your progress is saved automatically — you can finish later",
          ].map((line) => (
            <div key={line} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, fontSize: 13.5, color: "#5A3A1A" }}>
              <span style={{ color: GOLD, fontWeight: 800, flexShrink: 0 }}>•</span>
              <span>{line}</span>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: "#FFF1F2", color: "#BE123C", borderRadius: 10, padding: "12px 14px", fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={start}
          disabled={loading}
          style={{
            width: "100%", padding: "14px 20px", borderRadius: 14, border: "none",
            background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#fff",
            fontSize: 15, fontWeight: 800, fontFamily: font, cursor: loading ? "default" : "pointer",
            opacity: loading ? 0.7 : 1, boxShadow: "0 4px 16px rgba(196,122,46,0.35)",
          }}
        >
          {loading ? "Starting…" : "Start the questionnaire →"}
        </button>
      </div>
    </div>
  );
}
