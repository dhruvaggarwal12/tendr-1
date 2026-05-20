import React, { useState, useEffect } from "react";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import HamburgerNav from "../../components/HamburgerNav";

const font = "'Outfit', sans-serif";

const PLANS = {
  "90day": {
    label: "90-Day Plan",
    subtitle: "Ideal for weddings & big events",
    icon: "📅",
    phases: [
      {
        label: "3 Months Before",
        color: "#7c3aed",
        tasks: [
          "Fix the date, time and venue",
          "Set your total event budget",
          "Create a draft guest list",
          "Shortlist and book photographer / videographer",
          "Shortlist and book caterer",
          "Shortlist and book DJ / entertainment",
          "Shortlist and book decorator",
          "Start decoration theme moodboard",
        ],
      },
      {
        label: "2 Months Before",
        color: "#0369a1",
        tasks: [
          "Confirm and sign all vendor contracts",
          "Finalize guest list and headcount",
          "Design and send out invitations",
          "Finalize menu with caterer",
          "Book accommodation for outstation guests",
          "Finalize décor theme and color palette",
          "Discuss shot list with photographer",
        ],
      },
      {
        label: "1 Month Before",
        color: "#C47A2E",
        tasks: [
          "Track RSVPs and finalize headcount",
          "Make balance / advance payments to vendors",
          "Create a detailed event-day schedule",
          "Brief all vendors on the event plan",
          "Confirm catering serving count",
          "Order any custom items (cake, invites, favors)",
          "Plan seating arrangement",
        ],
      },
      {
        label: "1 Week Before",
        color: "#b45309",
        tasks: [
          "Do a full venue walkthrough",
          "Final decoration briefing with team",
          "Confirm vendor arrival times",
          "Prepare vendor payment envelopes",
          "Charge all devices and batteries",
          "Confirm transport / parking logistics",
          "Send a final reminder to guests",
        ],
      },
      {
        label: "Day Before",
        color: "#c0392b",
        tasks: [
          "Venue decoration setup (partial)",
          "Deliver any rental items to venue",
          "Rehearsal if applicable",
          "Final confirmation call with all vendors",
          "Prepare outfit and accessories",
          "Early night — rest!",
        ],
      },
      {
        label: "Day Of",
        color: "#15803d",
        tasks: [
          "Arrive at venue early",
          "Complete décor setup",
          "Caterer setup and welcome area ready",
          "Photo / video team briefed and ready",
          "Welcome guests",
          "Enjoy your event! 🎉",
        ],
      },
    ],
  },
  "30day": {
    label: "30-Day Plan",
    subtitle: "Ideal for birthdays & parties",
    icon: "🗓️",
    phases: [
      {
        label: "4 Weeks Out",
        color: "#7c3aed",
        tasks: [
          "Fix the date and venue",
          "Finalize budget",
          "Book caterer",
          "Book DJ or entertainment",
          "Book photographer",
          "Create and send invitations",
        ],
      },
      {
        label: "3 Weeks Out",
        color: "#0369a1",
        tasks: [
          "Finalize guest list and track RSVPs",
          "Finalize menu",
          "Book decorator",
          "Order birthday cake or desserts",
          "Finalize decoration theme",
        ],
      },
      {
        label: "1 Week Out",
        color: "#C47A2E",
        tasks: [
          "Confirm all vendor bookings",
          "Share event-day schedule with vendors",
          "Confirm final headcount with caterer",
          "Prepare vendor payments",
          "Send reminder to guests",
        ],
      },
      {
        label: "Day Before",
        color: "#b45309",
        tasks: [
          "Venue walkthrough",
          "Partial decoration setup",
          "Confirm vendor arrival times",
          "Rest up!",
        ],
      },
      {
        label: "Day Of",
        color: "#15803d",
        tasks: [
          "Arrive early and supervise setup",
          "Welcome guests",
          "Enjoy the celebration! 🎉",
        ],
      },
    ],
  },
  "7day": {
    label: "7-Day Plan",
    subtitle: "Last-minute or intimate events",
    icon: "⚡",
    phases: [
      {
        label: "Day 1–2",
        color: "#7c3aed",
        tasks: ["Confirm venue", "Book caterer", "Send invitations immediately"],
      },
      {
        label: "Day 3–4",
        color: "#C47A2E",
        tasks: [
          "Book decoration if needed",
          "Finalize menu",
          "Confirm headcount",
          "Arrange photography if needed",
        ],
      },
      {
        label: "Day 5–6",
        color: "#b45309",
        tasks: [
          "Track RSVPs",
          "Make all vendor payments",
          "Prepare event-day schedule",
          "Confirm all arrivals",
        ],
      },
      {
        label: "Day 7 (Event Day)",
        color: "#15803d",
        tasks: ["Arrive early", "Oversee setup", "Welcome guests", "Celebrate! 🎉"],
      },
    ],
  },
};

const buildFromPlan = (planKey) =>
  PLANS[planKey].phases.map((phase, pi) => ({
    id: `phase_${pi}_${Date.now()}`,
    label: phase.label,
    color: phase.color,
    tasks: phase.tasks.map((text, ti) => ({
      id: `task_${pi}_${ti}_${Date.now()}`,
      text,
      done: false,
      note: "",
    })),
  }));

export default function Timeline() {
  const [planKey, setPlanKey] = useState("90day");
  const [phases, setPhases] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [expandedNote, setExpandedNote] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("tendr_timeline_v2");
      if (raw) {
        const saved = JSON.parse(raw);
        setPlanKey(saved.planKey || "90day");
        setPhases(saved.phases || []);
      } else {
        setPhases(buildFromPlan("90day"));
      }
    } catch { setPhases(buildFromPlan("90day")); }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("tendr_timeline_v2", JSON.stringify({ planKey, phases }));
  }, [phases, planKey, loaded]);

  const applyPlan = (key) => {
    setPlanKey(key);
    setPhases(buildFromPlan(key));
  };

  const toggleTask = (phaseId, taskId) =>
    setPhases(prev => prev.map(p =>
      p.id !== phaseId ? p : { ...p, tasks: p.tasks.map(t => t.id !== taskId ? t : { ...t, done: !t.done }) }
    ));

  const updateTaskText = (phaseId, taskId, text) =>
    setPhases(prev => prev.map(p =>
      p.id !== phaseId ? p : { ...p, tasks: p.tasks.map(t => t.id !== taskId ? t : { ...t, text }) }
    ));

  const updateNote = (phaseId, taskId, note) =>
    setPhases(prev => prev.map(p =>
      p.id !== phaseId ? p : { ...p, tasks: p.tasks.map(t => t.id !== taskId ? t : { ...t, note }) }
    ));

  const deleteTask = (phaseId, taskId) =>
    setPhases(prev => prev.map(p =>
      p.id !== phaseId ? p : { ...p, tasks: p.tasks.filter(t => t.id !== taskId) }
    ));

  const addTask = (phaseId) =>
    setPhases(prev => prev.map(p =>
      p.id !== phaseId ? p : { ...p, tasks: [...p.tasks, { id: `task_${Date.now()}`, text: "", done: false, note: "" }] }
    ));

  const total = phases.reduce((s, p) => s + p.tasks.length, 0);
  const done  = phases.reduce((s, p) => s + p.tasks.filter(t => t.done).length, 0);
  const pct   = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EF", fontFamily: font, paddingBottom: 60 }}>
      <SEO
        title="Prebuilt Event Timeline — Ready-Made Schedules for Every Celebration"
        description="Use Tendr's prebuilt event timelines for birthdays, anniversaries, corporate events and more. Download or follow a day-by-day milestone schedule to keep your celebration on track in Delhi NCR."
        path="/prebuilt-timeline"
        breadcrumbs={[{ name: "Home", path: "/" }, { name: "Timeline Planner", path: "/timeline-picker" }, { name: "Prebuilt Timeline", path: "/prebuilt-timeline" }]}
      />
      <BasicSpeedDial />
      <HamburgerNav title="Event Timeline" />

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", padding: "32px 40px 28px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Planning Tool</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Event Timeline</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", margin: 0 }}>Step-by-step countdown plan for your event</p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px" }}>

        {/* Plan selector */}
        <div style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "20px 24px", marginBottom: 20, boxShadow: "0 2px 12px rgba(139,69,19,0.06)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Choose your plan</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(PLANS).map(([key, plan]) => (
              <button key={key} onClick={() => applyPlan(key)}
                style={{ padding: "10px 18px", borderRadius: 12, fontSize: 13, fontWeight: 600, fontFamily: font, cursor: "pointer", border: "1.5px solid", transition: "all 0.15s", textAlign: "left",
                  borderColor: planKey === key ? "#C47A2E" : "rgba(196,122,46,0.2)",
                  background: planKey === key ? "#C47A2E" : "#fff",
                  color: planKey === key ? "#fff" : "#6B3A1F",
                }}>
                <div>{plan.icon} {plan.label}</div>
                <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{plan.subtitle}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div style={{ background: "#FFFCF5", borderRadius: 16, border: "1.5px solid rgba(196,122,46,0.15)", padding: "18px 24px", marginBottom: 28, boxShadow: "0 2px 12px rgba(139,69,19,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#2C1A0E" }}>Overall Progress</span>
            <span style={{ fontSize: 22, fontWeight: 900, color: pct === 100 ? "#15803d" : "#C47A2E" }}>{pct}%</span>
          </div>
          <div style={{ height: 10, background: "#f3e8d4", borderRadius: 100, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "linear-gradient(90deg,#15803d,#22c55e)" : "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ fontSize: 12, color: "#9B7450", marginTop: 6 }}>{done} of {total} tasks done</div>
        </div>

        {/* Vertical timeline */}
        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div style={{ position: "absolute", left: 23, top: 0, bottom: 0, width: 2, background: "rgba(196,122,46,0.15)", zIndex: 0 }} />

          {phases.map((phase, pi) => {
            const phaseDone = phase.tasks.filter(t => t.done).length;
            const phaseTotal = phase.tasks.length;
            const allDone = phaseDone === phaseTotal && phaseTotal > 0;

            return (
              <div key={phase.id} style={{ position: "relative", marginBottom: 32, paddingLeft: 60 }}>
                {/* Phase dot */}
                <div style={{
                  position: "absolute", left: 0, top: 14,
                  width: 48, height: 48, borderRadius: "50%",
                  background: allDone ? "#15803d" : phase.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 800, fontSize: 16, zIndex: 1,
                  boxShadow: `0 4px 14px ${phase.color}40`,
                  transition: "background 0.3s",
                }}>
                  {allDone ? "✓" : pi + 1}
                </div>

                {/* Phase card */}
                <div style={{ background: "#FFFCF5", borderRadius: 16, border: `1.5px solid ${phase.color}30`, boxShadow: "0 2px 12px rgba(139,69,19,0.06)", overflow: "hidden" }}>
                  {/* Phase header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: `${phase.color}10`, borderBottom: `1px solid ${phase.color}20` }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: 15, color: phase.color }}>{phase.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: allDone ? "#15803d" : "#9B7450" }}>
                      {phaseDone}/{phaseTotal} done
                    </span>
                  </div>

                  {/* Tasks */}
                  <div>
                    {phase.tasks.map((task) => (
                      <div key={task.id}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 18px", borderBottom: "1px solid rgba(196,122,46,0.06)" }}>
                          <button
                            onClick={() => toggleTask(phase.id, task.id)}
                            style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${task.done ? "#15803d" : "rgba(196,122,46,0.3)"}`, background: task.done ? "#15803d" : "#fff", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, marginTop: 1, transition: "all 0.15s" }}>
                            {task.done ? "✓" : ""}
                          </button>
                          <input
                            value={task.text}
                            onChange={e => updateTaskText(phase.id, task.id, e.target.value)}
                            placeholder="Task..."
                            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: font, fontSize: 14, color: task.done ? "#bbb" : "#2C1A0E", textDecoration: task.done ? "line-through" : "none" }}
                          />
                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            <button
                              onClick={() => setExpandedNote(expandedNote === task.id ? null : task.id)}
                              style={{ background: task.note ? `${phase.color}20` : "none", border: "none", color: task.note ? phase.color : "#bbb", cursor: "pointer", fontSize: 13, padding: "2px 6px", borderRadius: 6 }}>
                              💬
                            </button>
                            <button onClick={() => deleteTask(phase.id, task.id)}
                              style={{ background: "none", border: "none", color: "#ddd", cursor: "pointer", fontSize: 14 }}>✕</button>
                          </div>
                        </div>
                        {expandedNote === task.id && (
                          <div style={{ padding: "8px 18px 10px 52px", background: "rgba(196,122,46,0.04)" }}>
                            <input
                              value={task.note}
                              onChange={e => updateNote(phase.id, task.id, e.target.value)}
                              placeholder="Add a note..."
                              style={{ width: "100%", background: "#fff", border: `1.5px solid ${phase.color}40`, borderRadius: 8, padding: "7px 12px", fontSize: 13, fontFamily: font, color: "#2C1A0E", outline: "none", boxSizing: "border-box" }}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add task */}
                  <button onClick={() => addTask(phase.id)}
                    style={{ display: "flex", alignItems: "center", gap: 6, margin: "8px 18px 12px", padding: "6px 12px", borderRadius: 8, border: `1.5px dashed ${phase.color}40`, background: "transparent", color: phase.color, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
                    + Add task
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => applyPlan(planKey)}
          style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.2)", background: "#fff", color: "#9B7450", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font, marginTop: 8 }}>
          Reset to Plan
        </button>
      </div>
    </div>
  );
}
