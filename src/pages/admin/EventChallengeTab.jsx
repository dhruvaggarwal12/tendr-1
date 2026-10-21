import React, { useState, useEffect } from "react";

const F = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const INK = "#2C1A0E";
const MUTED = "#9B7450";

const TYPE_LABELS = { mcq: "MCQ", opinion: "Opinion", photo: "Photo" };
const TIER_LABEL = { none: "Not qualified", starter: "Starter", achiever: "Achiever", pro: "Pro", champion: "Champion" };
const TIER_COLOR = { none: "#9CA3AF", starter: "#C47A2E", achiever: "#0EA5E9", pro: "#7C3AED", champion: "#D4AF37" };

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export default function EventChallengeTab({ token, BASE_URL }) {
  const [section, setSection] = useState("stats"); // stats | questions | attempts

  return (
    <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-6 overflow-y-auto">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, fontFamily: F, marginBottom: 4 }}>🧠 Event Intelligence Challenge</h2>
      <p style={{ fontSize: 13, color: MUTED, fontFamily: F, marginBottom: 16 }}>
        The scored competency assessment — manage its question bank and review results.
      </p>

      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "1.5px solid rgba(196,122,46,0.2)" }}>
        {[["stats", "Analytics"], ["questions", "Questions"], ["attempts", "Attempts"]].map(([val, label]) => (
          <button key={val} onClick={() => setSection(val)}
            style={{ padding: "10px 20px", fontFamily: F, fontSize: 13, fontWeight: 700, background: "none", border: "none", cursor: "pointer", color: section === val ? GOLD : MUTED, borderBottom: section === val ? `2.5px solid ${GOLD}` : "2.5px solid transparent", marginBottom: -1.5 }}>
            {label}
          </button>
        ))}
      </div>

      {section === "stats" && <StatsSection token={token} BASE_URL={BASE_URL} />}
      {section === "questions" && <QuestionsSection token={token} BASE_URL={BASE_URL} />}
      {section === "attempts" && <AttemptsSection token={token} BASE_URL={BASE_URL} />}
    </div>
  );
}

function StatsSection({ token, BASE_URL }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/admin/challenge-stats`, { headers: authHeaders(token) })
      .then(r => r.json()).then(setStats).catch(() => {});
  }, [token, BASE_URL]);

  if (!stats) return <p style={{ fontFamily: F, color: MUTED }}>Loading…</p>;

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
        {[["Total attempts", stats.totalAttempts], ["Average score", `${stats.averageScore}/100`]].map(([label, val]) => (
          <div key={label} style={{ background: "#fff", borderRadius: 14, border: "1px solid rgba(196,122,46,0.15)", padding: "16px 20px", minWidth: 140 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: INK, marginTop: 4 }}>{val}</div>
          </div>
        ))}
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 800, color: INK, fontFamily: F, marginBottom: 10 }}>Tier distribution</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Object.entries(stats.tierCounts).map(([tier, count]) => (
          <div key={tier} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 90, fontSize: 12.5, fontWeight: 700, color: TIER_COLOR[tier] }}>{TIER_LABEL[tier]}</span>
            <div style={{ flex: 1, height: 10, borderRadius: 5, background: "rgba(196,122,46,0.1)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${stats.totalAttempts ? (count / stats.totalAttempts) * 100 : 0}%`, background: TIER_COLOR[tier] }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: INK, width: 24, textAlign: "right" }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestionsSection({ token, BASE_URL }) {
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState("mcq");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch(`${BASE_URL}/admin/challenge-questions`, { headers: authHeaders(token) })
      .then(r => r.json()).then(d => setQuestions(d.questions || [])).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, [token, BASE_URL]); // eslint-disable-line

  const toggleActive = async (q) => {
    await fetch(`${BASE_URL}/admin/challenge-questions/${q._id}`, { method: "PATCH", headers: authHeaders(token), body: JSON.stringify({ active: !q.active }) });
    load();
  };

  const filtered = questions.filter(q => q.type === filter);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["mcq", "opinion", "photo"].map(t => (
          <button key={t} onClick={() => setFilter(t)}
            style={{ padding: "6px 14px", borderRadius: 100, border: `1.5px solid ${filter === t ? GOLD : "rgba(196,122,46,0.2)"}`, background: filter === t ? "rgba(196,122,46,0.1)" : "#fff", color: filter === t ? GOLD : MUTED, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: F }}>
            {TYPE_LABELS[t]} ({questions.filter(q => q.type === t).length})
          </button>
        ))}
      </div>
      {loading ? <p style={{ fontFamily: F, color: MUTED }}>Loading…</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(q => (
            <div key={q._id} style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(196,122,46,0.15)", padding: "12px 16px", opacity: q.active ? 1 : 0.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ fontSize: 13, color: INK, fontWeight: 600, lineHeight: 1.4 }}>{q.questionText}</div>
                <button onClick={() => toggleActive(q)}
                  style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 100, border: "none", cursor: "pointer", background: q.active ? "rgba(21,128,61,0.12)" : "rgba(220,38,38,0.1)", color: q.active ? "#15803d" : "#DC2626" }}>
                  {q.active ? "Active" : "Inactive"}
                </button>
              </div>
              {q.type === "mcq" && (
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                  {(q.options || []).map((opt, i) => (
                    <div key={i} style={{ fontSize: 11.5, color: i === q.correctIndex ? "#15803d" : MUTED, fontWeight: i === q.correctIndex ? 700 : 500 }}>
                      {i === q.correctIndex ? "✓ " : "— "}{opt}
                    </div>
                  ))}
                  {q.category && <div style={{ fontSize: 10, color: MUTED, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{q.category}</div>}
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && <p style={{ fontFamily: F, color: MUTED, fontSize: 13 }}>No {TYPE_LABELS[filter].toLowerCase()} questions in the bank yet.</p>}
        </div>
      )}
    </div>
  );
}

function AttemptsSection({ token, BASE_URL }) {
  const [attempts, setAttempts] = useState(null);
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    fetch(`${BASE_URL}/admin/challenge-attempts`, { headers: authHeaders(token) })
      .then(r => r.json()).then(d => setAttempts(d.attempts || [])).catch(() => {});
  }, [token, BASE_URL]);

  if (!attempts) return <p style={{ fontFamily: F, color: MUTED }}>Loading…</p>;
  if (!attempts.length) return <p style={{ fontFamily: F, color: MUTED, fontSize: 13 }}>No submitted attempts yet.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {attempts.map(a => {
        const open = openId === a._id;
        return (
          <div key={a._id} style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(196,122,46,0.15)", overflow: "hidden" }}>
            <button onClick={() => setOpenId(open ? null : a._id)}
              style={{ width: "100%", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", fontFamily: F, textAlign: "left" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{a.consumerId?.name || "Unknown"}</div>
                <div style={{ fontSize: 11, color: MUTED }}>{a.consumerId?.phoneNumber} · {new Date(a.submittedAt).toLocaleDateString("en-IN")}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: TIER_COLOR[a.resultTier] }}>{TIER_LABEL[a.resultTier]}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{a.scores?.total}/100</span>
                <span style={{ fontSize: 11, color: MUTED }}>{open ? "▲" : "▼"}</span>
              </div>
            </button>
            {open && (
              <div style={{ padding: "0 16px 16px", borderTop: "1px solid rgba(196,122,46,0.1)" }}>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", margin: "12px 0" }}>
                  {[["MCQ", `${a.scores?.mcq}/30`], ["Opinion", `${a.scores?.opinion}/40`], ["Photo", `${a.scores?.photo}/20`], ["Completion", `${a.scores?.completion}/10`]].map(([l, v]) => (
                    <div key={l} style={{ fontSize: 11.5, color: MUTED }}><strong style={{ color: INK }}>{l}:</strong> {v}</div>
                  ))}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Opinion answers</div>
                {(a.opinionAnswers || []).map((ans, i) => (
                  <div key={i} style={{ marginBottom: 10, padding: "8px 12px", background: "#FDFAF0", borderRadius: 8 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: INK, marginBottom: 3 }}>{a.assignedOpinionIds?.[i]?.questionText}</div>
                    <div style={{ fontSize: 12, color: "#5a3a1a", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{ans.text || <em style={{ color: MUTED }}>No answer</em>}</div>
                  </div>
                ))}
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0EA5E9", textTransform: "uppercase", letterSpacing: "0.06em", margin: "10px 0 6px" }}>Photo task</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: INK, marginBottom: 4 }}>{a.assignedPhotoTaskId?.questionText}</div>
                {a.photoTask?.imageUrl && <img src={a.photoTask.imageUrl} alt="submission" style={{ maxWidth: 220, borderRadius: 8, display: "block", marginBottom: 6 }} />}
                <div style={{ fontSize: 12, color: "#5a3a1a", lineHeight: 1.5 }}>{a.photoTask?.explanation || <em style={{ color: MUTED }}>No explanation</em>}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
