import React, { useState, useEffect } from "react";

const F = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const INK = "#2C1A0E";
const MUTED = "#9B7450";
const CARD = "#FFFCF5";

const TYPE_LABELS = { mcq: "MCQ", opinion: "Opinion", photo: "Photo" };
const CATEGORY_LABELS = {
  budget_pricing: "Budget & pricing",
  packages_preferences: "Packages & preferences",
  vendor_trust: "Vendor trust",
  decor_themes: "Decor & themes",
  planning_behaviour: "Planning behaviour",
};
const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS);

function authHeaders(token) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export default function QuestionBankTab({ token, BASE_URL }) {
  const [section, setSection] = useState("questions"); // questions | responses

  return (
    <div className="right-dashboard w-full sm:w-[85%] md:w-[75%] lg:w-[70%] bg-[#FDFAF0] border-l-2 border-[#CCAB4A] px-4 sm:px-6 md:px-8 lg:px-10 py-6 overflow-y-auto">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: INK, fontFamily: F, marginBottom: 4 }}>📝 Question Bank</h2>
      <p style={{ fontSize: 13, color: MUTED, fontFamily: F, marginBottom: 16 }}>
        Manage the referral questionnaire's question pool and review submitted responses.
      </p>

      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "1.5px solid rgba(196,122,46,0.2)" }}>
        {[["questions", "Questions"], ["responses", "Responses"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setSection(val)}
            style={{
              padding: "10px 20px", fontFamily: F, fontSize: 13, fontWeight: 700, background: "none", border: "none", cursor: "pointer",
              color: section === val ? GOLD : MUTED,
              borderBottom: section === val ? `2.5px solid ${GOLD}` : "2.5px solid transparent",
              marginBottom: -1.5,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {section === "questions" ? <QuestionsSection token={token} BASE_URL={BASE_URL} /> : <ResponsesSection token={token} BASE_URL={BASE_URL} />}
    </div>
  );
}

function QuestionsSection({ token, BASE_URL }) {
  const [questions, setQuestions] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("active");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // question object, or {} for new
  const [stats, setStats] = useState(null);

  const load = () => {
    fetch(`${BASE_URL}/admin/question-bank`, { headers: authHeaders(token), credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setQuestions(d.questions || []); setLoaded(true); })
      .catch(() => setLoaded(true));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    fetch(`${BASE_URL}/admin/question-bank/stats`, { headers: authHeaders(token), credentials: "include" })
      .then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  const toggleArchive = (q) => {
    const path = q.active ? "archive" : "restore";
    fetch(`${BASE_URL}/admin/question-bank/${q._id}/${path}`, { method: "PATCH", headers: authHeaders(token), credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.question) setQuestions((prev) => prev.map((x) => (x._id === q._id ? d.question : x))); else alert(d.error || "Failed"); })
      .catch(() => alert("Network error"));
  };

  const filtered = questions.filter((q) => {
    if (typeFilter !== "all" && q.type !== typeFilter) return false;
    if (activeFilter === "active" && !q.active) return false;
    if (activeFilter === "archived" && q.active) return false;
    if (search && !(q.code + " " + q.questionText).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      {stats && (
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <StatPill label="Total" value={stats.totalCount} />
          <StatPill label="Active" value={stats.activeCount} />
          {stats.byType.map((t) => <StatPill key={t._id} label={TYPE_LABELS[t._id] || t._id} value={t.count} />)}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code or text…"
          style={{ fontFamily: F, fontSize: 12, padding: "7px 12px", borderRadius: 100, border: "1.5px solid #E5D5C0", minWidth: 200 }}
        />
        {[["all", "All types"], ["mcq", "MCQ"], ["opinion", "Opinion"], ["photo", "Photo"]].map(([val, label]) => (
          <FilterChip key={val} active={typeFilter === val} onClick={() => setTypeFilter(val)} label={label} />
        ))}
        {[["active", "Active"], ["archived", "Archived"], ["allstatus", "Any status"]].map(([val, label]) => (
          <FilterChip key={val} active={activeFilter === val} onClick={() => setActiveFilter(val)} label={label} />
        ))}
        <button
          onClick={() => setEditing({})}
          style={{ marginLeft: "auto", fontFamily: F, fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 100, background: GOLD, color: "#fff", border: "none", cursor: "pointer" }}
        >
          + New question
        </button>
      </div>

      {!loaded && <p style={{ color: MUTED, fontFamily: F, fontSize: 13 }}>Loading…</p>}
      {loaded && filtered.length === 0 && <p style={{ color: MUTED, fontFamily: F, fontSize: 13 }}>No questions match this filter.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((q) => (
          <div key={q._id} style={{ background: CARD, borderRadius: 12, padding: "14px 16px", border: "1.5px solid rgba(196,122,46,0.15)", fontFamily: F, opacity: q.active ? 1 : 0.55 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: GOLD }}>{q.code}</span>
                  <Badge>{TYPE_LABELS[q.type]}</Badge>
                  {q.category && <Badge>{CATEGORY_LABELS[q.category] || q.category}</Badge>}
                  {!q.active && <Badge tone="muted">Archived</Badge>}
                </div>
                <p style={{ margin: 0, fontSize: 13.5, color: INK, fontWeight: 600 }}>{q.questionText}</p>
                {q.type === "mcq" && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: MUTED }}>
                    {q.options.map((o) => o.text).join("  ·  ")}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => setEditing(q)} style={ghostBtn}>Edit</button>
                <button onClick={() => toggleArchive(q)} style={ghostBtn}>{q.active ? "Archive" : "Restore"}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <QuestionEditorModal
          question={editing}
          onClose={() => setEditing(null)}
          onSaved={(q) => {
            setQuestions((prev) => (prev.some((x) => x._id === q._id) ? prev.map((x) => (x._id === q._id ? q : x)) : [q, ...prev]));
            setEditing(null);
          }}
          token={token}
          BASE_URL={BASE_URL}
        />
      )}
    </>
  );
}

function QuestionEditorModal({ question, onClose, onSaved, token, BASE_URL }) {
  const isNew = !question._id;
  const [form, setForm] = useState({
    code: question.code || "",
    type: question.type || "mcq",
    category: question.category || CATEGORY_KEYS[0],
    questionText: question.questionText || "",
    options: question.options?.length ? question.options : [{ optionId: "A", text: "" }, { optionId: "B", text: "" }],
    opinionPrompt: question.opinionPrompt || "",
    photoInstructions: question.photoInstructions || "",
    repeatable: !!question.repeatable,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setOption = (idx, text) => setForm((f) => ({ ...f, options: f.options.map((o, i) => (i === idx ? { ...o, text } : o)) }));
  const addOption = () => setForm((f) => ({ ...f, options: [...f.options, { optionId: String.fromCharCode(65 + f.options.length), text: "" }] }));
  const removeOption = (idx) => setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== idx) }));

  const save = () => {
    setError("");
    if (!form.code.trim() || !form.questionText.trim()) { setError("Code and question text are required."); return; }
    if (form.type === "mcq" && form.options.filter((o) => o.text.trim()).length < 2) { setError("MCQ needs at least 2 options."); return; }

    setSaving(true);
    const body = isNew
      ? { ...form, options: form.options.filter((o) => o.text.trim()) }
      : { questionText: form.questionText, options: form.options.filter((o) => o.text.trim()), opinionPrompt: form.opinionPrompt, photoInstructions: form.photoInstructions, repeatable: form.repeatable };
    const url = isNew ? `${BASE_URL}/admin/question-bank` : `${BASE_URL}/admin/question-bank/${question._id}`;
    fetch(url, { method: isNew ? "POST" : "PUT", headers: authHeaders(token), credentials: "include", body: JSON.stringify(body) })
      .then((r) => r.json())
      .then((d) => {
        setSaving(false);
        if (d.question) onSaved(d.question);
        else setError(d.error || "Failed to save.");
      })
      .catch(() => { setSaving(false); setError("Network error."); });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(44,26,14,0.45)", zIndex: 10100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 520, width: "100%", maxHeight: "85vh", overflowY: "auto", fontFamily: F }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: "0 0 16px", fontSize: 17, fontWeight: 800, color: INK }}>{isNew ? "New question" : `Edit ${question.code}`}</h3>

        {isNew && (
          <>
            <Field label="Code (e.g. Q51, O11, PH11)">
              <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} style={inputStyle} />
            </Field>
            <Field label="Type">
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} style={inputStyle}>
                <option value="mcq">MCQ</option>
                <option value="opinion">Opinion</option>
                <option value="photo">Photo</option>
              </select>
            </Field>
            {form.type === "mcq" && (
              <Field label="Category">
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} style={inputStyle}>
                  {CATEGORY_KEYS.map((k) => <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>)}
                </select>
              </Field>
            )}
          </>
        )}

        <Field label="Question text">
          <textarea value={form.questionText} onChange={(e) => setForm((f) => ({ ...f, questionText: e.target.value }))} style={{ ...inputStyle, minHeight: 60 }} />
        </Field>

        {form.type === "mcq" && (
          <Field label="Options">
            {form.options.map((o, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                <span style={{ width: 20, fontWeight: 700, color: MUTED, fontSize: 12, paddingTop: 8 }}>{o.optionId}</span>
                <input value={o.text} onChange={(e) => setOption(i, e.target.value)} style={inputStyle} />
                {form.options.length > 2 && <button onClick={() => removeOption(i)} style={ghostBtn}>✕</button>}
              </div>
            ))}
            <button onClick={addOption} style={ghostBtn}>+ Add option</button>
          </Field>
        )}

        {form.type === "opinion" && (
          <Field label="Opinion prompt (optional guidance shown above the textarea)">
            <input value={form.opinionPrompt} onChange={(e) => setForm((f) => ({ ...f, opinionPrompt: e.target.value }))} style={inputStyle} />
          </Field>
        )}

        {form.type === "photo" && (
          <Field label="Photo instructions">
            <textarea value={form.photoInstructions} onChange={(e) => setForm((f) => ({ ...f, photoInstructions: e.target.value }))} style={{ ...inputStyle, minHeight: 50 }} />
          </Field>
        )}

        <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, color: INK, marginBottom: 16 }}>
          <input type="checkbox" checked={form.repeatable} onChange={(e) => setForm((f) => ({ ...f, repeatable: e.target.checked }))} />
          Repeatable (can be reassigned to the same user again)
        </label>

        {error && <p style={{ color: "#BE123C", fontSize: 12.5, marginBottom: 12 }}>{error}</p>}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={ghostBtn}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ ...ghostBtn, background: GOLD, color: "#fff", border: "none" }}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResponsesSection({ token, BASE_URL }) {
  const [assignments, setAssignments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState(null); // { assignment, rows }
  const limit = 20;

  useEffect(() => {
    setLoaded(false);
    fetch(`${BASE_URL}/admin/questionnaire-responses?page=${page}&limit=${limit}`, { headers: authHeaders(token), credentials: "include" })
      .then((r) => r.json())
      .then((d) => { setAssignments(d.assignments || []); setTotal(d.total || 0); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, [page]);

  const openDetail = (assignmentId) => {
    fetch(`${BASE_URL}/admin/questionnaire-responses/${assignmentId}`, { headers: authHeaders(token), credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d.assignment) setDetail(d); else alert(d.error || "Failed"); })
      .catch(() => alert("Network error"));
  };

  return (
    <>
      {!loaded && <p style={{ color: MUTED, fontFamily: F, fontSize: 13 }}>Loading…</p>}
      {loaded && assignments.length === 0 && <p style={{ color: MUTED, fontFamily: F, fontSize: 13 }}>No submitted questionnaires yet.</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {assignments.map((a) => (
          <button
            key={a._id}
            onClick={() => openDetail(a._id)}
            style={{ textAlign: "left", background: CARD, borderRadius: 12, padding: "12px 16px", border: "1.5px solid rgba(196,122,46,0.15)", fontFamily: F, cursor: "pointer" }}
          >
            <p style={{ margin: 0, fontWeight: 700, color: INK, fontSize: 13.5 }}>{a.userId?.name || "Unknown customer"} <span style={{ color: MUTED, fontWeight: 500 }}>· {a.userId?.phoneNumber}</span></p>
            <p style={{ margin: "2px 0 0", fontSize: 11.5, color: MUTED }}>Submitted {a.submittedAt ? new Date(a.submittedAt).toLocaleString("en-IN") : "—"}</p>
          </button>
        ))}
      </div>

      {total > limit && (
        <div style={{ display: "flex", gap: 10, marginTop: 16, alignItems: "center", fontFamily: F, fontSize: 12.5, color: MUTED }}>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} style={ghostBtn}>← Prev</button>
          <span>Page {page} of {Math.ceil(total / limit)}</span>
          <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage((p) => p + 1)} style={ghostBtn}>Next →</button>
        </div>
      )}

      {detail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,26,14,0.45)", zIndex: 10100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setDetail(null)}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 560, width: "100%", maxHeight: "85vh", overflowY: "auto", fontFamily: F }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 800, color: INK }}>{detail.assignment.userId?.name || "Unknown customer"}</h3>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: MUTED }}>Submitted {detail.assignment.submittedAt ? new Date(detail.assignment.submittedAt).toLocaleString("en-IN") : "—"}</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {detail.rows.map((row, i) => (
                <div key={i} style={{ borderBottom: "1px solid rgba(196,122,46,0.12)", paddingBottom: 12 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 800, color: GOLD }}>{row.question?.code} · {TYPE_LABELS[row.question?.type]}</p>
                  <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: INK }}>{row.question?.questionText}</p>
                  {row.question?.type === "mcq" && (
                    <p style={{ margin: 0, fontSize: 13, color: INK }}>
                      {row.answer?.answerOptionIds?.map((oid) => row.question.options.find((o) => o.optionId === oid)?.text || oid).join(", ") || "—"}
                    </p>
                  )}
                  {row.question?.type === "opinion" && <p style={{ margin: 0, fontSize: 13, color: INK, fontStyle: "italic" }}>"{row.answer?.answerText || "—"}"</p>}
                  {row.question?.type === "photo" && (
                    row.answer?.imageStorageKey
                      ? <img src={row.answer.imageStorageKey} alt="Submitted" style={{ maxWidth: "100%", borderRadius: 8, marginTop: 4 }} />
                      : <p style={{ margin: 0, fontSize: 13, color: MUTED }}>No photo uploaded</p>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setDetail(null)} style={ghostBtn}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StatPill({ label, value }) {
  return (
    <div style={{ background: CARD, borderRadius: 10, padding: "8px 14px", border: "1.5px solid rgba(196,122,46,0.15)", fontFamily: F }}>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: INK }}>{value ?? 0}</p>
      <p style={{ margin: 0, fontSize: 10.5, color: MUTED, fontWeight: 600 }}>{label}</p>
    </div>
  );
}

function FilterChip({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      style={{ padding: "6px 14px", borderRadius: 100, fontSize: 11.5, fontWeight: 700, fontFamily: F, cursor: "pointer", background: active ? GOLD : "#fff", color: active ? "#fff" : MUTED, border: active ? "none" : "1.5px solid #E5D5C0" }}
    >
      {label}
    </button>
  );
}

function Badge({ children, tone }) {
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, borderRadius: 100, padding: "2px 9px", background: tone === "muted" ? "#F0EAE0" : "rgba(196,122,46,0.1)", color: tone === "muted" ? MUTED : GOLD }}>
      {children}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: MUTED, marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = { width: "100%", fontFamily: F, fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5D5C0", boxSizing: "border-box" };
const ghostBtn = { fontFamily: F, fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 100, background: "#fff", color: GOLD, border: "1.5px solid #E5D5C0", cursor: "pointer" };
