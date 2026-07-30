import React, { useState, useEffect } from "react";

const font = "'Outfit', sans-serif";

const DEFAULT_PHASES = [
  { label: "4 Weeks Out", color: "#7c3aed", tasks: ["Fix the date and venue", "Finalize budget", "Book caterer", "Book DJ or entertainment", "Book photographer", "Create and send invitations"] },
  { label: "3 Weeks Out", color: "#0369a1", tasks: ["Finalize guest list and track RSVPs", "Finalize menu", "Book decorator", "Order birthday cake or desserts", "Finalize decoration theme"] },
  { label: "1 Week Out", color: "#C47A2E", tasks: ["Confirm all vendor bookings", "Share event-day schedule with vendors", "Confirm final headcount with caterer", "Prepare vendor payments", "Send reminder to guests"] },
  { label: "Day Before", color: "#b45309", tasks: ["Venue walkthrough", "Partial decoration setup", "Confirm vendor arrival times", "Rest up!"] },
  { label: "Day Of", color: "#15803d", tasks: ["Arrive early and supervise setup", "Welcome guests", "Enjoy the celebration! 🎉"] },
];

function makePhasesFromDefault() {
  return DEFAULT_PHASES.map((phase, pi) => ({
    id: `phase_${pi}`,
    label: phase.label,
    color: phase.color,
    tasks: phase.tasks.map((text, ti) => ({
      id: `task_${pi}_${ti}`,
      text,
      done: false,
    })),
  }));
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem("tendr_timeline_v2");
    if (!raw) return { phases: makePhasesFromDefault(), meta: {} };
    const saved = JSON.parse(raw);
    if (saved.__expiresAt && Date.now() > saved.__expiresAt) return { phases: makePhasesFromDefault(), meta: {} };
    if (saved.phases?.length > 0) {
      return {
        phases: saved.phases,
        meta: { planKey: saved.planKey, personalized: saved.personalized, __expiresAt: saved.__expiresAt },
      };
    }
    return { phases: makePhasesFromDefault(), meta: {} };
  } catch {
    return { phases: makePhasesFromDefault(), meta: {} };
  }
}

export default function TimelinePopup({ onClose }) {
  const [initData] = useState(() => loadFromStorage());
  const [phases, setPhases] = useState(initData.phases);
  const [isSaved, setIsSaved] = useState(() => {
    try { return !!localStorage.getItem("tendr_timeline_saved"); } catch { return false; }
  });

  useEffect(() => {
    try {
      const TTL_7D = 7 * 24 * 60 * 60 * 1000;
      const meta = initData.meta;
      localStorage.setItem("tendr_timeline_v2", JSON.stringify({
        ...meta,
        phases,
        __expiresAt: meta.__expiresAt || Date.now() + TTL_7D,
      }));
    } catch {}
  }, [phases]); // eslint-disable-line

  const toggleTask = (phaseId, taskId) =>
    setPhases(prev => prev.map(p =>
      p.id !== phaseId ? p : { ...p, tasks: p.tasks.map(t => t.id !== taskId ? t : { ...t, done: !t.done }) }
    ));

  const handleSave = () => {
    try { localStorage.setItem("tendr_timeline_saved", "true"); } catch {}
    setIsSaved(true);
    window.dispatchEvent(new CustomEvent("tendr:timeline-saved"));
  };

  const total = phases.reduce((s, p) => s + p.tasks.length, 0);
  const done = phases.reduce((s, p) => s + p.tasks.filter(t => t.done).length, 0);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.52)", zIndex: 99997, backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 99998, width: "min(95vw,480px)", maxHeight: "85dvh", background: "#FFFCF5", borderRadius: 20, display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.28)", fontFamily: font, overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid rgba(196,122,46,0.12)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E", flex: 1 }}>⏱️ Event Timeline</span>
            <button onClick={handleSave}
              style={{ padding: "4px 10px", borderRadius: 7, border: isSaved ? "1.5px solid #22c55e" : "1.5px solid rgba(196,122,46,0.3)", background: isSaved ? "rgba(34,197,94,0.08)" : "#fff", color: isSaved ? "#15803d" : "#C47A2E", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
              {isSaved ? "✓ Saved" : "Save"}
            </button>
            <button onClick={onClose}
              style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid rgba(44,26,14,0.15)", background: "transparent", color: "#9B7450", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, flexShrink: 0 }}>
              ×
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 4, background: "#f3e8d4", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "linear-gradient(90deg,#15803d,#22c55e)" : "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, transition: "width 0.4s ease" }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: pct === 100 ? "#15803d" : "#C47A2E", flexShrink: 0, whiteSpace: "nowrap" }}>
              {pct}% · {done}/{total} done
            </span>
          </div>
        </div>

        {/* Scrollable phases */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 16px" }}>
          {phases.map((phase, pi) => {
            const pDone = phase.tasks.filter(t => t.done).length;
            const pTotal = phase.tasks.length;
            const allDone = pDone === pTotal && pTotal > 0;
            return (
              <div key={phase.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: allDone ? "#15803d" : phase.color, color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {allDone ? "✓" : pi + 1}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: phase.color, flex: 1 }}>{phase.label}</span>
                  <span style={{ fontSize: 10, color: "#9B7450" }}>{pDone}/{pTotal}</span>
                </div>
                <div style={{ background: "#fff", borderRadius: 10, border: `1px solid ${phase.color}22`, overflow: "hidden" }}>
                  {phase.tasks.map((task, ti) => (
                    <button key={task.id} onClick={() => toggleTask(phase.id, task.id)}
                      style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 12px", border: "none", borderBottom: ti < phase.tasks.length - 1 ? "1px solid rgba(196,122,46,0.06)" : "none", background: "transparent", cursor: "pointer", textAlign: "left", fontFamily: font, WebkitTapHighlightColor: "transparent" }}>
                      <div style={{ width: 17, height: 17, borderRadius: 5, border: `2px solid ${task.done ? "#15803d" : "rgba(196,122,46,0.3)"}`, background: task.done ? "#15803d" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", flexShrink: 0, transition: "all 0.15s" }}>
                        {task.done ? "✓" : ""}
                      </div>
                      <span style={{ fontSize: 12, color: task.done ? "#bbb" : "#2C1A0E", textDecoration: task.done ? "line-through" : "none", flex: 1, lineHeight: 1.4, textAlign: "left" }}>
                        {task.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
