import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../../components/HamburgerNav";
import McqScreen from "./screens/McqScreen";
import OpinionScreen from "./screens/OpinionScreen";
import PhotoTaskScreen from "./screens/PhotoTaskScreen";

const font = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const GOLD_LIGHT = "#CCAB4A";
const BG = "#F8F4EF";
const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function QuestionnaireFlow() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const [loaded, setLoaded] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answersByQuestion, setAnswersByQuestion] = useState({}); // questionId -> {answerOptionIds, answerText, imageStorageKey}
  const [step, setStep] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const opinionDebounceRef = useRef(null);

  useEffect(() => {
    fetch(`${BASE_URL}/questionnaires/${assignmentId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.questions) {
          setLoadError(data?.error || "Could not load this questionnaire.");
          setLoaded(true);
          return;
        }
        if (data.status === "submitted") {
          navigate("/refer-and-earn/done", { replace: true });
          return;
        }
        setQuestions(data.questions);
        const byQ = {};
        (data.answers || []).forEach((a) => { byQ[a.questionId] = a; });
        setAnswersByQuestion(byQ);
        // Resume at the first unanswered question.
        const firstUnanswered = data.questions.findIndex((q) => !byQ[q._id]);
        setStep(firstUnanswered === -1 ? data.questions.length - 1 : firstUnanswered);
        setLoaded(true);
      })
      .catch(() => { setLoadError("Network error — please try again."); setLoaded(true); });
  }, [assignmentId]);

  const saveAnswer = useCallback((questionId, body) => {
    fetch(`${BASE_URL}/questionnaires/${assignmentId}/answers`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ questionId, ...body }),
    }).catch(() => {});
  }, [assignmentId, token]);

  const question = questions[step];

  const selectMcqOption = (optionId) => {
    setAnswersByQuestion((prev) => ({ ...prev, [question._id]: { ...prev[question._id], answerOptionIds: [optionId] } }));
    saveAnswer(question._id, { answerOptionIds: [optionId] });
  };

  const changeOpinionText = (text) => {
    setAnswersByQuestion((prev) => ({ ...prev, [question._id]: { ...prev[question._id], answerText: text } }));
    if (opinionDebounceRef.current) clearTimeout(opinionDebounceRef.current);
    opinionDebounceRef.current = setTimeout(() => saveAnswer(question._id, { answerText: text }), 800);
  };

  const uploadPhoto = (file) => {
    setPhotoError("");
    setPhotoUploading(true);
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("questionId", question._id);
    fetch(`${BASE_URL}/questionnaires/${assignmentId}/photo`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then((r) => r.json())
      .then((data) => {
        setPhotoUploading(false);
        if (data?.answer) {
          setAnswersByQuestion((prev) => ({ ...prev, [question._id]: data.answer }));
        } else {
          setPhotoError(data?.error || "Could not upload this photo.");
        }
      })
      .catch(() => { setPhotoUploading(false); setPhotoError("Network error — please try again."); });
  };

  const isAnswered = (q) => {
    const a = answersByQuestion[q._id];
    if (!a) return false;
    if (q.type === "mcq") return !!a.answerOptionIds?.length;
    if (q.type === "opinion") return !!a.answerText?.trim();
    return !!a.imageStorageKey;
  };

  const isLast = step === questions.length - 1;
  const canProceed = question ? isAnswered(question) : false;

  const goNext = () => {
    if (isLast) { submit(); return; }
    setStep((s) => Math.min(s + 1, questions.length - 1));
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const submit = () => {
    setSubmitError("");
    setSubmitting(true);
    fetch(`${BASE_URL}/questionnaires/${assignmentId}/submit`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setSubmitting(false);
        if (data?.success) navigate("/refer-and-earn/done");
        else setSubmitError(data?.error || "Please make sure every question is answered.");
      })
      .catch(() => { setSubmitting(false); setSubmitError("Network error — please try again."); });
  };

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", background: BG, fontFamily: font }}>
        <HamburgerNav title="Questionnaire" showBack />
        <div style={{ padding: 40, textAlign: "center", color: "#9B7450" }}>Loading…</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ minHeight: "100vh", background: BG, fontFamily: font }}>
        <HamburgerNav title="Questionnaire" showBack />
        <div style={{ padding: 40, textAlign: "center", color: "#BE123C" }}>{loadError}</div>
      </div>
    );
  }

  const answer = answersByQuestion[question._id] || {};

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: font, paddingBottom: "calc(110px + env(safe-area-inset-bottom, 0px))" }}>
      <HamburgerNav title="Questionnaire" showBack />

      <div style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, padding: "clamp(16px,3vw,26px) clamp(16px,4vw,40px)" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            {questions.map((q, i) => (
              <div key={q._id} style={{ flex: 1, height: 4, borderRadius: 100, background: i <= step ? "#fff" : "rgba(255,255,255,0.3)" }} />
            ))}
          </div>
          <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: 600 }}>
            Question {step + 1} of {questions.length}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "22px 20px", border: "1.5px solid rgba(196,122,46,0.12)" }}>
          {question.type === "mcq" && (
            <McqScreen question={question} selectedOptionId={answer.answerOptionIds?.[0] || null} onSelect={selectMcqOption} />
          )}
          {question.type === "opinion" && (
            <OpinionScreen question={question} value={answer.answerText || ""} onChange={changeOpinionText} />
          )}
          {question.type === "photo" && (
            <PhotoTaskScreen question={question} uploadedUrl={answer.imageStorageKey} uploading={photoUploading} error={photoError} onUpload={uploadPhoto} />
          )}
        </div>
        {submitError && <div style={{ color: "#BE123C", fontSize: 13, marginTop: 14, textAlign: "center" }}>{submitError}</div>}
      </div>

      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 500, background: "#fff", borderTop: "1.5px solid rgba(196,122,46,0.18)", boxShadow: "0 -6px 24px rgba(28,9,0,0.08)", padding: "14px 16px calc(14px + env(safe-area-inset-bottom, 0px))" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", justifyContent: "space-between", gap: 10 }}>
          <button onClick={goBack} disabled={step === 0} style={{ ...navBtnStyle, visibility: step === 0 ? "hidden" : "visible" }}>← Back</button>
          <button onClick={goNext} disabled={!canProceed || submitting} style={{ ...primaryBtnStyle, opacity: canProceed && !submitting ? 1 : 0.45, cursor: canProceed && !submitting ? "pointer" : "not-allowed" }}>
            {submitting ? "Submitting…" : isLast ? "Submit →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

const navBtnStyle = {
  padding: "12px 20px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)",
  background: "rgba(196,122,46,0.06)", color: GOLD, fontSize: 14, fontWeight: 700,
  cursor: "pointer", fontFamily: font,
};
const primaryBtnStyle = {
  padding: "12px 24px", borderRadius: 12, border: "none",
  background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#fff",
  fontSize: 14, fontWeight: 800, fontFamily: font, boxShadow: "0 4px 16px rgba(196,122,46,0.35)",
};
