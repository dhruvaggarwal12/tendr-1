import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const F = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const INK = "#2C1A0E";
const MAX_IMAGE_BYTES = 1_800_000; // leaves room for base64 overhead under the server's cap

const TIER_LABEL = { none: "Not yet qualified", starter: "Starter", achiever: "Achiever", pro: "Pro", champion: "Champion" };
const TIER_COLOR = { none: "#9CA3AF", starter: "#C47A2E", achiever: "#0EA5E9", pro: "#7C3AED", champion: "#D4AF37" };

export default function EventChallenge() {
  const navigate = useNavigate();
  const { token } = useSelector(s => s.auth || {});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cooldownMs, setCooldownMs] = useState(0);
  const [attempt, setAttempt] = useState(null); // { _id, mcqs, opinionQuestions, photoTask, ... }
  const [mcqAnswers, setMcqAnswers] = useState({}); // { [questionId]: optionIndex }
  const [opinionText, setOpinionText] = useState({}); // { [questionId]: text }
  const [photoImage, setPhotoImage] = useState(""); // data URI
  const [photoExplanation, setPhotoExplanation] = useState("");
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!token) { navigate("/login", { state: { returnTo: "/referral/challenge" } }); return; }
    fetch(`${BASE_URL}/event-challenge/start`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(async r => {
        if (r.status === 429) {
          const d = await r.json();
          setCooldownMs(d.retryAfterMs || 0);
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then(d => {
        if (!d) { setLoading(false); return; }
        setAttempt(d.attempt);
        setMcqAnswers(d.attempt.mcqAnswers || {});
        const ot = {};
        (d.attempt.opinionAnswers || []).forEach(a => { if (a.text) ot[a.questionId] = a.text; });
        setOpinionText(ot);
        setPhotoExplanation(d.attempt.photoTaskAnswer?.explanation || "");
        setLoading(false);
      })
      .catch(() => { setError("Couldn't load the challenge — check your connection and try again."); setLoading(false); });
  }, [token]); // eslint-disable-line

  const steps = attempt ? [
    ...attempt.mcqs.map(q => ({ type: "mcq", q })),
    ...attempt.opinionQuestions.map(q => ({ type: "opinion", q })),
    { type: "photo", q: attempt.photoTask },
    { type: "review" },
  ] : [];
  const totalQuestions = attempt ? attempt.mcqs.length + attempt.opinionQuestions.length + 1 : 0;
  const mcqDone = attempt ? attempt.mcqs.filter(q => mcqAnswers[q.id] !== undefined).length : 0;
  const opinionDone = attempt ? attempt.opinionQuestions.filter(q => (opinionText[q.id] || "").trim().length >= 10).length : 0;
  const photoDone = !!photoImage && photoExplanation.trim().length > 0;
  const answeredCount = mcqDone + opinionDone + (photoDone ? 1 : 0);

  const autosave = (patch) => {
    if (!attempt) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`${BASE_URL}/event-challenge/${attempt._id}/save`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify(patch),
      }).catch(() => {});
    }, 600);
  };

  const setMcq = (qid, idx) => {
    const next = { ...mcqAnswers, [qid]: idx };
    setMcqAnswers(next);
    autosave({ mcqAnswers: { [qid]: idx } });
  };
  const setOpinion = (qid, text) => {
    const next = { ...opinionText, [qid]: text };
    setOpinionText(next);
    autosave({ opinionAnswers: attempt.opinionQuestions.map(q => ({ questionId: q.id, text: next[q.id] || "" })) });
  };

  const [imgError, setImgError] = useState("");
  const onPhotoFile = (file) => {
    setImgError("");
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) { setImgError("That image is too large — please use one under ~1.8MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result;
      setPhotoImage(dataUri);
      autosave({ photoTask: { imageDataUri: dataUri, explanation: photoExplanation } });
    };
    reader.readAsDataURL(file);
  };
  const onPhotoExplanation = (text) => {
    setPhotoExplanation(text);
    autosave({ photoTask: { explanation: text } });
  };

  const submit = async () => {
    if (!attempt || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      // Flush any pending autosave first so the final submit scores the latest answers.
      clearTimeout(saveTimer.current);
      await fetch(`${BASE_URL}/event-challenge/${attempt._id}/save`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({
          mcqAnswers,
          opinionAnswers: attempt.opinionQuestions.map(q => ({ questionId: q.id, text: opinionText[q.id] || "" })),
          photoTask: { imageDataUri: photoImage, explanation: photoExplanation },
        }),
      });
      const res = await fetch(`${BASE_URL}/event-challenge/${attempt._id}/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) throw new Error("submit failed");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Couldn't submit — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const page = { minHeight: "100dvh", background: "#FFFCF5", fontFamily: F };
  const card = { maxWidth: 560, margin: "0 auto", padding: "24px 20px 60px" };

  if (loading) {
    return (
      <div style={{ ...page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(196,122,46,0.2)", borderTopColor: GOLD, borderRadius: "50%", animation: "ec-spin 0.7s linear infinite" }} />
        <style>{`@keyframes ec-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (cooldownMs > 0) {
    const hrs = Math.ceil(cooldownMs / 3600000);
    return (
      <div style={page}>
        <HamburgerNav active="" />
        <div style={{ ...card, textAlign: "center", paddingTop: 60 }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>⏳</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: INK, marginBottom: 8 }}>Give it a little time</div>
          <div style={{ fontSize: 13.5, color: "#9B7450", lineHeight: 1.6 }}>
            Your last attempt scored below 50. You can retake the challenge in about {hrs} hour{hrs === 1 ? "" : "s"}.
          </div>
          <button onClick={() => navigate("/dashboard")} style={{ marginTop: 20, padding: "11px 22px", borderRadius: 10, border: "none", background: GOLD, color: "#fff", fontFamily: F, fontWeight: 700, cursor: "pointer" }}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (result) {
    const tier = result.tier;
    return (
      <div style={page}>
        <HamburgerNav active="" />
        <div style={{ ...card, textAlign: "center", paddingTop: 50 }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>{tier === "none" ? "📋" : "🎉"}</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: INK, marginBottom: 6 }}>
            {tier === "none" ? "Not quite there yet" : "Challenge complete!"}
          </div>
          <div style={{ fontSize: 13.5, color: "#9B7450", marginBottom: 22 }}>
            You scored <strong style={{ color: INK }}>{result.scores.total}/100</strong>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 100, background: `${TIER_COLOR[tier]}18`, border: `1.5px solid ${TIER_COLOR[tier]}55`, marginBottom: 24 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: TIER_COLOR[tier] }}>{TIER_LABEL[tier]}</span>
          </div>
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(196,122,46,0.15)", padding: "16px 18px", textAlign: "left", marginBottom: 24 }}>
            {[
              ["Multiple choice", `${result.scores.mcq}/30`],
              ["Opinion questions", `${result.scores.opinion}/40`],
              ["Photo task", `${result.scores.photo}/20`],
              ["Completion", `${result.scores.completion}/10`],
            ].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: "#5a3a1a" }}>
                <span>{label}</span><span style={{ fontWeight: 700 }}>{val}</span>
              </div>
            ))}
          </div>
          {tier === "none" && (
            <div style={{ fontSize: 12.5, color: "#9B7450", marginBottom: 20, lineHeight: 1.6 }}>
              You need a score of 50+ to qualify. You can try again in 24 hours.
            </div>
          )}
          <p style={{ fontSize: 11.5, color: "#B08968", marginBottom: 20, lineHeight: 1.5 }}>
            This result isn't connected to your current referral reward tier yet — that's a separate system for now.
          </p>
          <button onClick={() => navigate("/dashboard")} style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: GOLD, color: "#fff", fontFamily: F, fontWeight: 800, cursor: "pointer" }}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div style={{ ...page, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
        <div>{error || "Couldn't load the challenge."}</div>
      </div>
    );
  }

  const step = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;
  const inp = { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", fontFamily: F, fontSize: 14, color: INK, outline: "none", background: "#fff", boxSizing: "border-box", resize: "vertical" };

  return (
    <div style={page}>
      <HamburgerNav active="" />
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.12)", padding: "14px 20px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: INK }}>Event Intelligence Challenge</div>
            <div style={{ fontSize: 11.5, color: "#9B7450" }}>{answeredCount}/{totalQuestions} answered</div>
          </div>
          <div style={{ height: 5, borderRadius: 100, background: "rgba(196,122,46,0.15)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(answeredCount / totalQuestions) * 100}%`, background: GOLD, transition: "width 0.25s" }} />
          </div>
        </div>
      </div>

      <div style={card}>
        {step.type === "mcq" && (() => {
          const q = step.q;
          return (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Question {stepIdx + 1} of {attempt.mcqs.length} — Multiple choice
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: INK, lineHeight: 1.4, marginBottom: 18 }}>{q.question}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {q.options.map((opt, oi) => (
                  <button key={oi} onClick={() => setMcq(q.id, oi)}
                    style={{ textAlign: "left", padding: "13px 16px", borderRadius: 12, border: `1.5px solid ${mcqAnswers[q.id] === oi ? GOLD : "rgba(196,122,46,0.2)"}`, background: mcqAnswers[q.id] === oi ? "rgba(196,122,46,0.08)" : "#fff", color: mcqAnswers[q.id] === oi ? GOLD : "#4A3420", fontSize: 13.5, fontWeight: mcqAnswers[q.id] === oi ? 700 : 500, cursor: "pointer", fontFamily: F }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {step.type === "opinion" && (() => {
          const q = step.q;
          const words = (opinionText[q.id] || "").trim().split(/\s+/).filter(Boolean).length;
          return (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Opinion question {stepIdx - attempt.mcqs.length + 1} of {attempt.opinionQuestions.length}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: INK, lineHeight: 1.4, marginBottom: 14 }}>{q.question}</div>
              <textarea rows={7} style={inp} value={opinionText[q.id] || ""} onChange={e => setOpinion(q.id, e.target.value)}
                placeholder="Share your honest reasoning — Hindi or English, both are fine." />
              <div style={{ fontSize: 11, color: "#9B7450", marginTop: 6, textAlign: "right" }}>{words} words</div>
            </div>
          );
        })()}

        {step.type === "photo" && (() => {
          const t = step.q;
          return (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0EA5E9", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Photo task</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: INK, lineHeight: 1.4, marginBottom: 6 }}>{t.prompt}</div>
              <div style={{ fontSize: 12, color: "#9B7450", marginBottom: 16, lineHeight: 1.5 }}>
                A real photo, a sketch, or a clearly labelled mock-up all work. No need for professional equipment or venues — and please don't upload identifiable photos of other people without their permission.
              </div>
              <label style={{ display: "block", border: `1.5px dashed ${photoImage ? GOLD : "rgba(196,122,46,0.3)"}`, borderRadius: 14, padding: "20px", textAlign: "center", cursor: "pointer", marginBottom: 14, background: photoImage ? "rgba(196,122,46,0.04)" : "#fff" }}>
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => onPhotoFile(e.target.files?.[0])} />
                {photoImage ? (
                  <img src={photoImage} alt="Your submission" style={{ maxWidth: "100%", maxHeight: 220, borderRadius: 10, display: "block", margin: "0 auto" }} />
                ) : (
                  <div style={{ color: "#9B7450", fontSize: 13 }}>📷 Tap to upload an image</div>
                )}
              </label>
              {imgError && <div style={{ fontSize: 12, color: "#DC2626", marginBottom: 10 }}>{imgError}</div>}
              <textarea rows={4} style={inp} value={photoExplanation} onChange={e => onPhotoExplanation(e.target.value)}
                placeholder="What does this show, what problem does it solve, and any constraints worth noting?" />
            </div>
          );
        })()}

        {step.type === "review" && (
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: INK, marginBottom: 10 }}>Ready to submit?</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {[
                [`Multiple choice`, `${mcqDone}/${attempt.mcqs.length} answered`],
                [`Opinion questions`, `${opinionDone}/${attempt.opinionQuestions.length} answered`],
                [`Photo task`, photoDone ? "Complete" : "Incomplete"],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "#fff", border: "1px solid rgba(196,122,46,0.15)", fontSize: 13 }}>
                  <span style={{ color: "#5a3a1a" }}>{label}</span>
                  <span style={{ fontWeight: 700, color: INK }}>{val}</span>
                </div>
              ))}
            </div>
            {error && <div style={{ fontSize: 12.5, color: "#DC2626", marginBottom: 14 }}>{error}</div>}
            <button disabled={submitting} onClick={submit}
              style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: submitting ? "rgba(196,122,46,0.4)" : GOLD, color: "#fff", fontFamily: F, fontWeight: 800, fontSize: 15, cursor: submitting ? "default" : "pointer" }}>
              {submitting ? "Scoring…" : "Submit Challenge →"}
            </button>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          {stepIdx > 0 && (
            <button onClick={() => setStepIdx(s => s - 1)} style={{ padding: "13px 18px", borderRadius: 11, border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", color: "#6B3A1F", fontFamily: F, fontWeight: 700, cursor: "pointer" }}>← Back</button>
          )}
          {!isLast && (
            <button onClick={() => setStepIdx(s => s + 1)} style={{ flex: 1, padding: "14px", borderRadius: 11, border: "none", background: GOLD, color: "#fff", fontFamily: F, fontWeight: 800, fontSize: 14.5, cursor: "pointer" }}>
              {step.type === "photo" ? "Review & Submit →" : "Next →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
