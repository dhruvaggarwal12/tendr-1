import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', 'Inter', sans-serif";

export default function InviteRSVP() {
  const { inviteId } = useParams();
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(localStorage.getItem("hp_name") || "");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/house-party/invite/${inviteId}`);
        if (!res.ok) throw new Error("Invite not found");
        setInvite(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [inviteId]);

  const submit = async () => {
    if (!name.trim() || !status) return;
    setSubmitting(true);
    try {
      localStorage.setItem("hp_name", name.trim());
      const res = await fetch(`${BASE_URL}/house-party/invite/${inviteId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), status }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
      const updated = await res.json();
      setInvite(updated);
      setDone(true);
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Screen><p style={{ color: "#fff", textAlign: "center", padding: 40 }}>Loading…</p></Screen>;
  if (error) return <Screen><p style={{ color: "#F87171", textAlign: "center", padding: 40 }}>{error}</p></Screen>;

  const yes = invite.rsvps.filter(r => r.status === "yes").length;
  const maybe = invite.rsvps.filter(r => r.status === "maybe").length;
  const no = invite.rsvps.filter(r => r.status === "no").length;

  return (
    <Screen>
      <div style={{ padding: "30px 18px", maxWidth: 440, margin: "0 auto", width: "100%" }}>
        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 20, padding: "28px 22px", marginBottom: 24, textAlign: "center", border: "1.5px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: 46 }}>🎉</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#fff", margin: "10px 0 6px" }}>{invite.partyName}</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: 0 }}>Hosted by {invite.hostName}</p>
          {(invite.date || invite.time || invite.location) && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              {invite.date && <Chip emoji="📅" text={invite.date} />}
              {invite.time && <Chip emoji="🕗" text={invite.time} />}
              {invite.location && <Chip emoji="📍" text={invite.location} />}
            </div>
          )}
          {invite.note && <div style={{ marginTop: 14, background: "rgba(124,58,237,0.15)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "#C4B5FD", fontStyle: "italic" }}>{invite.note}</div>}
        </div>

        {!done ? (
          <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 14 }}>Are you coming?</p>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, fontFamily: font, boxSizing: "border-box", marginBottom: 14 }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[["yes", "✅ Yes!", "#059669"], ["maybe", "🤔 Maybe", "#D97706"], ["no", "❌ No", "#DC2626"]].map(([s, label, color]) => (
                <button key={s} onClick={() => setStatus(s)} style={{ flex: 1, padding: "12px 4px", borderRadius: 12, border: `2px solid ${status === s ? color : "rgba(255,255,255,0.12)"}`, background: status === s ? `${color}33` : "transparent", color: status === s ? "#fff" : "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={submit} disabled={!name.trim() || !status || submitting} style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: "#7C3AED", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: font, opacity: (!name.trim() || !status) ? 0.5 : 1 }}>
              {submitting ? "Sending…" : "Send RSVP"}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center", background: "rgba(5,150,105,0.15)", border: "1.5px solid rgba(5,150,105,0.3)", borderRadius: 16, padding: "24px 20px", marginBottom: 24 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🎊</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#34D399", marginBottom: 4 }}>RSVP sent!</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>You said {status === "yes" ? "Yes!" : status === "maybe" ? "Maybe" : "No"}</div>
          </div>
        )}

        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>Guest Count</p>
          <div style={{ display: "flex", gap: 10, marginBottom: invite.rsvps.length > 0 ? 14 : 0 }}>
            <StatChip emoji="✅" label="Yes" count={yes} color="#059669" />
            <StatChip emoji="🤔" label="Maybe" count={maybe} color="#D97706" />
            <StatChip emoji="❌" label="No" count={no} color="#DC2626" />
          </div>
          {invite.rsvps.filter(r => r.status === "yes").length > 0 && (
            <>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Coming:</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {invite.rsvps.filter(r => r.status === "yes").map(r => (
                  <span key={r._id} style={{ background: "rgba(5,150,105,0.2)", color: "#34D399", padding: "4px 12px", borderRadius: 20, fontSize: 12 }}>{r.name}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Screen>
  );
}

function Chip({ emoji, text }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", fontSize: 13, color: "rgba(255,255,255,0.7)" }}><span>{emoji}</span>{text}</div>;
}

function StatChip({ emoji, label, count, color }) {
  return (
    <div style={{ flex: 1, background: `${color}22`, borderRadius: 12, padding: "12px 8px", textAlign: "center", border: `1px solid ${color}44` }}>
      <div style={{ fontSize: 20, marginBottom: 2 }}>{emoji}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{count}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{label}</div>
    </div>
  );
}

function Screen({ children }) {
  return (
    <div style={{ minHeight: "100dvh", background: "linear-gradient(135deg, #0f0c29, #1a1a2e, #16213e)", fontFamily: "'Outfit','Inter',sans-serif" }}>
      {children}
    </div>
  );
}
