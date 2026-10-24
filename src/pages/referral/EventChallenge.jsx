import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const F = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const INK = "#2C1A0E";
const MAX_IMAGE_BYTES = 10_000_000; // matches the backend's Cloudinary upload limit

const TIER_LABEL = { none: "Not started", starter: "Starter", achiever: "Achiever", pro: "Pro", champion: "Champion" };
const TIER_COLOR = { none: "#9CA3AF", starter: "#C47A2E", achiever: "#0EA5E9", pro: "#7C3AED", champion: "#D4AF37" };
const LADDER = [100, 200, 300, 400, 500];
const LADDER_TIER = ["none", "starter", "achiever", "pro", "champion"];

// Horizontal ₹100→₹500 ladder, highlighting which rung the current tier has unlocked.
// No score anywhere here — just "which step are you on".
function BonusLadder({ tier }) {
  const idx = Math.max(0, LADDER_TIER.indexOf(tier));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {LADDER.map((amt, i) => (
        <React.Fragment key={amt}>
          {i > 0 && <div style={{ flex: 1, height: 3, borderRadius: 2, background: i <= idx ? GOLD : "rgba(196,122,46,0.18)" }} />}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0,
          }}>
            <div style={{
              width: i === idx ? 30 : 24, height: i === idx ? 30 : 24, borderRadius: "50%",
              background: i <= idx ? `linear-gradient(135deg,${GOLD},#CCAB4A)` : "#fff",
              border: `1.5px solid ${i <= idx ? GOLD : "rgba(196,122,46,0.25)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: i === idx ? "0 2px 10px rgba(196,122,46,0.4)" : "none",
              transition: "all 0.2s",
            }}>
              {i < idx ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
              ) : (
                <span style={{ fontSize: 9.5, fontWeight: 800, color: i <= idx ? "#fff" : "#9B7450" }}>{i + 1}</span>
              )}
            </div>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: i <= idx ? GOLD : "#B08968" }}>₹{amt}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function EventChallenge() {
  const navigate = useNavigate();
  const { token } = useSelector(s => s.auth || {});

  // view: 'checking' | 'intro' | 'loading' | 'questionnaire' | 'result'
  const [view, setView] = useState("checking");
  const [error, setError] = useState("");
  const [existingProgress, setExistingProgress] = useState(null); // GET /result, checked on mount
  const [attempt, setAttempt] = useState(null); // { _id, mcqs, opinionQuestions, photoTask, ... }
  const [mcqAnswers, setMcqAnswers] = useState({}); // { [questionId]: optionIndex }
  const [opinionText, setOpinionText] = useState({}); // { [questionId]: text }
  const [photoImage, setPhotoImage] = useState(""); // data URI
  const [photoExplanation, setPhotoExplanation] = useState("");
  const [stepIdx, setStepIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const saveTimer = useRef(null);

  // On mount: check whether this consumer already has a submitted attempt. If so, skip the
  // marketing intro and go straight to their current progress; otherwise show the intro.
  useEffect(() => {
    if (!token) { navigate("/login", { state: { returnTo: "/referral/challenge" } }); return; }
    fetch(`${BASE_URL}/event-challenge/result`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        setExistingProgress(d);
        setView(d?.hasStartedChallenge ? "result" : "intro");
      })
      .catch(() => setView("intro"));
  }, [token]); // eslint-disable-line

  const startChallenge = () => {
    setView("loading");
    fetch(`${BASE_URL}/event-challenge/start`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) { setError("Couldn't start the challenge — try again."); setView("intro"); return; }
        setAttempt(d.attempt);
        const ma = d.attempt.mcqAnswers || {};
        setMcqAnswers(ma);
        const ot = {};
        (d.attempt.opinionAnswers || []).forEach(a => { if (a.text) ot[a.questionId] = a.text; });
        setOpinionText(ot);
        const photoExpl = d.attempt.photoTaskAnswer?.explanation || "";
        const photoUrl = d.attempt.photoTaskAnswer?.imageUrl || "";
        setPhotoExplanation(photoExpl);
        setPhotoImage(photoUrl);

        // Resume at the first unanswered step instead of always reopening at step 0 —
        // otherwise "Continue the challenge" re-showed already-answered MCQs instead of
        // picking up at the opinion questions (or photo task) the progress screen promised.
        const mcqs = d.attempt.mcqs || [];
        const opinions = d.attempt.opinionQuestions || [];
        let resumeIdx = mcqs.findIndex(q => ma[q.id] === undefined);
        if (resumeIdx === -1) {
          const oi = opinions.findIndex(q => (ot[q.id] || "").trim().length < 10);
          resumeIdx = oi === -1 ? mcqs.length + opinions.length : mcqs.length + oi;
        }
        if (resumeIdx === mcqs.length + opinions.length && photoUrl && photoExpl.trim().length > 0) {
          resumeIdx = mcqs.length + opinions.length + 1; // photo already done too -> review step
        }
        setStepIdx(Math.max(0, resumeIdx));

        setView("questionnaire");
      })
      .catch(() => { setError("Couldn't load the challenge — check your connection and try again."); setView("intro"); });
  };

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

  // Live tier preview while answering — mirrors the backend's completion-based ladder exactly
  // (mcq all answered -> starter, both opinions meaningful -> achiever, photo done -> pro).
  const liveTier = (() => {
    if (!attempt) return "none";
    if (photoDone && opinionDone === attempt.opinionQuestions.length && mcqDone === attempt.mcqs.length) return "pro";
    if (opinionDone === attempt.opinionQuestions.length && mcqDone === attempt.mcqs.length) return "achiever";
    if (mcqDone === attempt.mcqs.length) return "starter";
    return "none";
  })();

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
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const onPhotoFile = async (file) => {
    setImgError("");
    if (!file || !attempt) return;
    if (file.size > MAX_IMAGE_BYTES) { setImgError("That image is too large — please use one under 10MB."); return; }
    setUploadingPhoto(true);
    try {
      const form = new FormData();
      form.append("photo", file);
      const res = await fetch(`${BASE_URL}/event-challenge/${attempt._id}/photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) { setImgError(data.error || "Upload failed — try again."); return; }
      setPhotoImage(data.imageUrl);
    } catch {
      setImgError("Upload failed — check your connection and try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };
  const onPhotoExplanation = (text) => {
    setPhotoExplanation(text);
    autosave({ photoExplanation: text });
  };

  const submit = async () => {
    if (!attempt || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      // Flush any pending autosave first so the final submit sees the latest answers.
      clearTimeout(saveTimer.current);
      await fetch(`${BASE_URL}/event-challenge/${attempt._id}/save`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify({
          mcqAnswers,
          opinionAnswers: attempt.opinionQuestions.map(q => ({ questionId: q.id, text: opinionText[q.id] || "" })),
          photoExplanation,
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
      setView("result");
    } catch {
      setError("Couldn't submit — check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const page = { minHeight: "100dvh", background: "#FFFCF5", fontFamily: F };
  const card = { maxWidth: 560, margin: "0 auto", padding: "24px 20px 60px" };

  if (view === "checking" || view === "loading") {
    return (
      <div style={{ ...page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(196,122,46,0.2)", borderTopColor: GOLD, borderRadius: "50%", animation: "ec-spin 0.7s linear infinite" }} />
        <style>{`@keyframes ec-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Intro: "see what you can earn" before anything else ──
  if (view === "intro") {
    return (
      <div style={page}>
        <HamburgerNav active="" />
        <div style={{ ...card, paddingTop: 36 }}>
          <div style={{ textAlign: "center", marginBottom: 26 }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🎁</div>
            <div style={{ fontSize: 21, fontWeight: 900, color: INK, marginBottom: 8 }}>Earn up to ₹500 per referral</div>
            <p style={{ fontSize: 13.5, color: "#9B7450", lineHeight: 1.6, margin: "0 auto", maxWidth: 420 }}>
              Every friend who books using your code gets 5% off. What <em>you</em> earn for it — ₹100 up to ₹500 — depends on how much of this you complete. No test, no right or wrong answers — we're just getting to know you.
            </p>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(196,122,46,0.15)", padding: "20px 18px", marginBottom: 22, display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 420 }}>
              <BonusLadder tier="none" />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 }}>
            {[
              ["📝", "A few multiple-choice questions", "About how you plan and celebrate — unlocks ₹200"],
              ["💬", "Two short opinion questions", "In your own words, Hindi or English — unlocks ₹300"],
              ["📷", "One photo task", "A real photo, sketch, or mock-up — unlocks ₹400"],
              ["🤝", "Get a friend to use your code", "The last step — unlocks the full ₹500"],
            ].map(([emoji, title, desc]) => (
              <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: "#fff", borderRadius: 12, border: "1px solid rgba(196,122,46,0.12)" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{emoji}</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{title}</div>
                  <div style={{ fontSize: 12, color: "#9B7450", marginTop: 2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {error && <div style={{ fontSize: 12.5, color: "#DC2626", marginBottom: 14, textAlign: "center" }}>{error}</div>}
          <button onClick={startChallenge} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: GOLD, color: "#fff", fontFamily: F, fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 16px rgba(196,122,46,0.35)" }}>
            Let's go →
          </button>
          <button onClick={() => navigate("/dashboard")} style={{ width: "100%", padding: "11px", marginTop: 8, borderRadius: 12, border: "none", background: "none", color: "#9B7450", fontFamily: F, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Maybe later
          </button>
        </div>
      </div>
    );
  }

  // ── Result / current-progress view ──
  if (view === "result") {
    const r = result || existingProgress;
    const tier = r?.tier || "none";
    return (
      <div style={page}>
        <HamburgerNav active="" />
        <div style={{ ...card, textAlign: "center", paddingTop: 46 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{tier === "champion" ? "🏆" : tier === "none" ? "👋" : "🎉"}</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: INK, marginBottom: 6 }}>
            {result ? "Saved!" : "Your progress"}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 100, background: `${TIER_COLOR[tier]}18`, border: `1.5px solid ${TIER_COLOR[tier]}55`, marginBottom: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: TIER_COLOR[tier] }}>
              {TIER_LABEL[tier]} · ₹{r?.currentBonus ?? LADDER[0]} per referral
            </span>
          </div>

          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(196,122,46,0.15)", padding: "20px 18px", marginBottom: 20, display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 420 }}>
              <BonusLadder tier={tier} />
            </div>
          </div>

          {r?.suggestions?.length > 0 ? (
            <div style={{ textAlign: "left", marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                Do this next to earn more — up to ₹{LADDER[LADDER.length - 1]}
              </div>
              {r.suggestions.map(s => (
                <div key={s.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 12, background: "#fff", border: "1px solid rgba(196,122,46,0.15)", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: INK, fontWeight: 600 }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: GOLD, flexShrink: 0, marginLeft: 10 }}>→ ₹{s.unlocksAmount}</span>
                </div>
              ))}
              {r.suggestions.some(s => s.key !== "referral") && (
                <button onClick={startChallenge} style={{ width: "100%", padding: "13px", marginTop: 6, borderRadius: 12, border: `1.5px solid ${GOLD}`, background: "transparent", color: GOLD, fontFamily: F, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>
                  Continue the challenge →
                </button>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "#15803d", marginBottom: 24, fontWeight: 700 }}>
              You've unlocked the maximum — ₹{LADDER[LADDER.length - 1]} per successful referral. 🎉
            </div>
          )}

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
      <style>{`@keyframes ec-step-in { from { opacity:0; transform: translateX(18px); } to { opacity:1; transform: translateX(0); } }`}</style>
      <HamburgerNav active="" />
      <div style={{ background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.12)", padding: "14px 20px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: INK }}>Event Intelligence Challenge</div>
            <div style={{ fontSize: 11.5, color: "#9B7450" }}>{answeredCount}/{totalQuestions} answered</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 420 }}>
              <BonusLadder tier={liveTier} />
            </div>
          </div>
        </div>
      </div>

      <div key={stepIdx} style={{ ...card, animation: "ec-step-in 0.3s cubic-bezier(0.22,1,0.36,1)" }}>
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
              <label style={{ display: "block", border: `1.5px dashed ${photoImage ? GOLD : "rgba(196,122,46,0.3)"}`, borderRadius: 14, padding: "20px", textAlign: "center", cursor: uploadingPhoto ? "default" : "pointer", marginBottom: 14, background: photoImage ? "rgba(196,122,46,0.04)" : "#fff" }}>
                <input type="file" accept="image/*" disabled={uploadingPhoto} style={{ display: "none" }} onChange={e => onPhotoFile(e.target.files?.[0])} />
                {uploadingPhoto ? (
                  <div style={{ color: "#9B7450", fontSize: 13 }}>Uploading…</div>
                ) : photoImage ? (
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
            <p style={{ fontSize: 11.5, color: "#9B7450", marginBottom: 14, lineHeight: 1.5 }}>
              Whatever you've completed counts — there's no pass or fail. Finishing more sections raises how much you earn per successful referral, up to ₹{LADDER[LADDER.length - 1]}.
            </p>
            {error && <div style={{ fontSize: 12.5, color: "#DC2626", marginBottom: 14 }}>{error}</div>}
            <button disabled={submitting} onClick={submit}
              style={{ width: "100%", padding: "14px", borderRadius: 12, border: "none", background: submitting ? "rgba(196,122,46,0.4)" : GOLD, color: "#fff", fontFamily: F, fontWeight: 800, fontSize: 15, cursor: submitting ? "default" : "pointer" }}>
              {submitting ? "Saving…" : "Submit →"}
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
