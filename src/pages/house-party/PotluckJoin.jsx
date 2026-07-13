import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', 'Inter', sans-serif";

export default function PotluckJoin() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);
  const [name, setName] = useState(localStorage.getItem("hp_name") || "");
  const [nameLocked, setNameLocked] = useState(!!localStorage.getItem("hp_name"));
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const fetch_ = async () => {
    try {
      const res = await fetch(`${BASE_URL}/house-party/potluck/${roomId}`);
      if (!res.ok) throw new Error("Room not found");
      setRoom(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_(); }, [roomId]);

  const lockName = () => {
    if (!name.trim()) return;
    localStorage.setItem("hp_name", name.trim());
    setNameLocked(true);
  };

  const claim = async (itemId) => {
    if (!nameLocked) return alert("Enter your name first!");
    setActing(itemId);
    try {
      const res = await fetch(`${BASE_URL}/house-party/potluck/${roomId}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, name }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
      setRoom(await res.json());
    } catch (e) {
      alert(e.message);
    } finally {
      setActing(null);
    }
  };

  const unclaim = async (itemId) => {
    setActing(itemId);
    try {
      const res = await fetch(`${BASE_URL}/house-party/potluck/${roomId}/unclaim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, name }),
      });
      if (!res.ok) { const j = await res.json(); throw new Error(j.error); }
      setRoom(await res.json());
    } catch (e) {
      alert(e.message);
    } finally {
      setActing(null);
    }
  };

  if (loading) return <Screen><div style={{ color: "#fff", textAlign: "center" }}>Loading…</div></Screen>;
  if (error) return <Screen><div style={{ color: "#F87171", textAlign: "center" }}>{error}</div></Screen>;

  const claimed = room.items.filter(i => i.claimedBy).length;

  return (
    <Screen>
      <div style={{ padding: "24px 18px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 42 }}>🥘</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "8px 0 4px" }}>{room.partyName}</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>Hosted by {room.hostName} · {claimed}/{room.items.length} items claimed</p>
        </div>

        {!nameLocked ? (
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
            <p style={{ fontSize: 14, color: "#fff", marginBottom: 12 }}>Enter your name to claim items:</p>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" onKeyDown={e => e.key === "Enter" && lockName()} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, fontFamily: font, boxSizing: "border-box", marginBottom: 10 }} />
            <button onClick={lockName} style={{ width: "100%", padding: 12, borderRadius: 10, border: "none", background: "#7C3AED", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font }}>Continue →</button>
          </div>
        ) : (
          <div style={{ background: "rgba(124,58,237,0.15)", borderRadius: 12, padding: "10px 14px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "#C4B5FD", fontSize: 14 }}>You are <b>{name}</b></span>
            <span onClick={() => setNameLocked(false)} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>Change</span>
          </div>
        )}

        {room.items.map(item => {
          const mine = item.claimedBy === name;
          const taken = item.claimedBy && !mine;
          return (
            <div key={item.id} style={{ background: taken ? "rgba(255,255,255,0.04)" : mine ? "rgba(5,150,105,0.15)" : "rgba(255,255,255,0.06)", border: `1.5px solid ${mine ? "rgba(5,150,105,0.5)" : taken ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)"}`, borderRadius: 14, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: taken ? "rgba(255,255,255,0.4)" : "#fff" }}>{item.name}</div>
                {item.claimedBy && <div style={{ fontSize: 12, color: mine ? "#34D399" : "rgba(255,255,255,0.4)", marginTop: 2 }}>{mine ? "✓ You're bringing this" : `Claimed by ${item.claimedBy}`}</div>}
              </div>
              {!taken && (
                <button onClick={() => mine ? unclaim(item.id) : claim(item.id)} disabled={acting === item.id} style={{ padding: "8px 16px", borderRadius: 20, border: "none", background: mine ? "rgba(239,68,68,0.2)" : "#7C3AED", color: mine ? "#F87171" : "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, flexShrink: 0, marginLeft: 10 }}>
                  {acting === item.id ? "…" : mine ? "Unclaim" : "I'll bring this"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Screen>
  );
}

function Screen({ children }) {
  return (
    <div style={{ minHeight: "100dvh", background: "linear-gradient(135deg, #0f0c29, #1a1a2e, #16213e)", fontFamily: "'Outfit','Inter',sans-serif", display: "flex", flexDirection: "column" }}>
      {children}
    </div>
  );
}
