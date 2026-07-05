import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SEO from "../../components/SEO";
import BasicSpeedDial from "../../components/BasicSpeedDial";
import HamburgerNav from "../../components/HamburgerNav";

const BASE_URL  = import.meta.env.VITE_BASE_URL;

// Phase label → days before event (mirrors backend PHASE_DAYS_CRON)
const PHASE_DAYS_FE = {
  '3 months before':   90,
  '2 months before':   60,
  '1 month before':    30,
  '3 weeks before':    21,
  '2 weeks before':    14,
  '1 week before':      7,
  'day 1–2':            6,
  'day 3–4':            4,
  'day 5–6':            2,
  'day before':         1,
  'day of':             0,
  'day 7 (event day)':  0,
};
function phaseDays(label = '') {
  const k = label.toLowerCase().trim();
  if (k in PHASE_DAYS_FE) return PHASE_DAYS_FE[k];
  for (const [key, val] of Object.entries(PHASE_DAYS_FE)) {
    if (k.includes(key)) return val;
  }
  return null;
}
function reminderDate(eventDate, phaseLabel) {
  const d = phaseDays(phaseLabel);
  if (d === null || !eventDate) return null;
  const lead = d === 0 ? 0 : 2;
  const r = new Date(eventDate);
  r.setDate(r.getDate() - d - lead);
  return r;
}
function fmtReminderDate(d) {
  if (!d) return null;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Notification modal ───────────────────────────────────────────────────────
function NotifyModal({ phases, eventDate, eventType, planKey, onClose }) {
  const [phone,    setPhone]    = useState('');
  const [status,   setStatus]   = useState('idle'); // idle | loading | success | error
  const [errMsg,   setErrMsg]   = useState('');

  const schedule = phases
    .map(p => {
      const rd = reminderDate(eventDate, p.label);
      if (!rd || rd < new Date()) return null;
      const lead = (phaseDays(p.label) || 0) === 0 ? 0 : 2;
      return { label: p.label, remindOn: rd, lead };
    })
    .filter(Boolean)
    .sort((a, b) => a.remindOn - b.remindOn);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length < 10) { setErrMsg('Enter a valid 10-digit number'); return; }
    setStatus('loading');
    setErrMsg('');
    try {
      const payload = {
        phone:     cleaned,
        eventDate: new Date(eventDate).toISOString(),
        eventType: eventType || 'event',
        planKey:   planKey   || '30day',
        phases:    phases.map(p => ({ label: p.label, tasks: (p.tasks || []).map(t => t.text || t).filter(Boolean) })),
      };
      const res = await fetch(`${BASE_URL}/api/timeline-notifications`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        try { localStorage.setItem('tendr_notify_phone', cleaned); } catch {}
      } else {
        setErrMsg(data.error || 'Something went wrong');
        setStatus('error');
      }
    } catch {
      setErrMsg('Network error — please try again');
      setStatus('error');
    }
  };

  const F = "'Outfit', sans-serif";

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.52)', zIndex: 2000, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(95vw,440px)', background: '#FFFCF5', borderRadius: 22, zIndex: 2001, fontFamily: F, overflow: 'hidden', boxShadow: '0 28px 70px rgba(0,0,0,0.22)', maxHeight: '88vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#2C1A0E,#4A2810)', padding: '20px 22px 18px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 14, width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F }}>×</button>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🔔</div>
          <h3 style={{ fontSize: 17, fontWeight: 900, color: '#fff', margin: '0 0 5px' }}>Get WhatsApp Reminders</h3>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.5 }}>
            We'll WhatsApp you 2 days before each planning phase — so you never miss a task.
          </p>
        </div>

        <div style={{ padding: '18px 22px 22px' }}>

          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
              <h4 style={{ fontSize: 16, fontWeight: 900, color: '#15803d', margin: '0 0 6px' }}>You're all set!</h4>
              <p style={{ fontSize: 12.5, color: '#6B3A1F', margin: '0 0 16px', lineHeight: 1.6 }}>
                We'll send WhatsApp reminders to <strong>+91 {phone.replace(/[^0-9]/g,'').slice(-10)}</strong> before each phase. Check your schedule below.
              </p>
              <button onClick={onClose} style={{ padding: '10px 28px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#C47A2E,#CCAB4A)', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: F }}>Done</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Phone input */}
              <label style={{ fontSize: 12, fontWeight: 700, color: '#2C1A0E', display: 'block', marginBottom: 6 }}>Your WhatsApp number</label>
              <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${errMsg ? '#ef4444' : 'rgba(44,26,14,0.18)'}`, borderRadius: 11, overflow: 'hidden', background: '#fff', marginBottom: 6 }}>
                <span style={{ padding: '11px 12px', fontSize: 13, fontWeight: 700, color: '#9B7450', background: 'rgba(196,122,46,0.05)', borderRight: '1px solid rgba(44,26,14,0.1)', flexShrink: 0 }}>🇮🇳 +91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={e => { setPhone(e.target.value); setErrMsg(''); }}
                  placeholder="98765 43210"
                  maxLength={10}
                  style={{ flex: 1, padding: '11px 12px', border: 'none', outline: 'none', fontFamily: F, fontSize: 14, color: '#2C1A0E', background: 'transparent' }}
                />
              </div>
              {errMsg && <p style={{ fontSize: 11.5, color: '#ef4444', margin: '0 0 10px' }}>{errMsg}</p>}
              <p style={{ fontSize: 11, color: '#9B7450', margin: '0 0 14px' }}>Messages sent via Tendr's WhatsApp. Reply STOP anytime to unsubscribe.</p>

              <button type="submit" disabled={status === 'loading'}
                style={{ width: '100%', padding: '12px', borderRadius: 11, border: 'none', background: status === 'loading' ? '#E5E7EB' : 'linear-gradient(135deg,#C47A2E,#CCAB4A)', color: status === 'loading' ? '#9CA3AF' : '#fff', fontSize: 14, fontWeight: 800, cursor: status === 'loading' ? 'not-allowed' : 'pointer', fontFamily: F, boxShadow: status === 'loading' ? 'none' : '0 4px 14px rgba(196,122,46,0.3)', marginBottom: 18 }}>
                {status === 'loading' ? 'Setting up…' : 'Notify Me →'}
              </button>
            </form>
          )}

          {/* Schedule preview */}
          {schedule.length > 0 && (
            <div style={{ borderTop: '1.5px solid rgba(44,26,14,0.08)', paddingTop: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>Your reminder schedule</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {schedule.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, background: 'rgba(196,122,46,0.05)', border: '1px solid rgba(196,122,46,0.1)' }}>
                    <span style={{ fontSize: 14 }}>{s.lead === 0 ? '🎉' : '📅'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: '#2C1A0E' }}>{s.lead === 0 ? 'Event Day' : `${s.lead} days before: ${s.label}`}</div>
                      <div style={{ fontSize: 10.5, color: '#9B7450' }}>{fmtReminderDate(s.remindOn)}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#C47A2E', background: 'rgba(196,122,46,0.1)', padding: '2px 8px', borderRadius: 100 }}>WhatsApp</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Detect vendor type from task text
function detectServiceFromTask(text = "") {
  const t = text.toLowerCase();
  if (t.includes('photograph') || t.includes('videograph')) return 'Photographer';
  if (t.includes('cater') || t.includes('caterer')) return 'Caterer';
  if (t.includes('decor') || t.includes('decorator') || t.includes('balloon') || t.includes('floral')) return 'Decorator';
  if (t.includes(' dj') || t.startsWith('dj') || t.includes('music') || t.includes('entertain')) return 'DJ';
  return null;
}

// Map event type → best plan
const EVENT_TO_PLAN = {
  wedding:     "90day",
  corporate:   "90day",
  birthday:    "30day",
  anniversary: "30day",
  party:       "30day",
  custom:      "30day",
};

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
        color: "#b45309",
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

// ── Compressed plan for events ≤7 days away ─────────────────────────────────
function buildCompressedPlan(daysLeft) {
  if (daysLeft <= 0) return [
    { label: "Event Day", color: "#15803d", tasks: ["Arrive early and supervise setup", "Welcome guests", "Enjoy the celebration!"] },
  ];
  if (daysLeft === 1) return [
    { label: "Today", color: "#7c3aed", tasks: ["Confirm all vendor arrivals", "Finalize headcount", "Make remaining vendor payments", "Prepare event-day schedule"] },
    { label: "Event Day", color: "#15803d", tasks: ["Arrive early and supervise setup", "Welcome guests", "Enjoy the celebration!"] },
  ];
  if (daysLeft === 2) return [
    { label: "Day 1", color: "#7c3aed", tasks: ["Confirm venue and all vendors", "Send final invitations", "Finalize menu and headcount", "Make all vendor payments"] },
    { label: "Day 2 (Event Day)", color: "#15803d", tasks: ["Arrive early", "Oversee setup", "Welcome guests", "Celebrate!"] },
  ];
  if (daysLeft === 3) return [
    { label: "Day 1", color: "#7c3aed", tasks: ["Confirm venue", "Book caterer", "Send invitations immediately", "Confirm headcount"] },
    { label: "Day 2", color: "#C47A2E", tasks: ["Book decoration if needed", "Finalize menu", "Make all vendor payments", "Prepare event-day schedule", "Confirm all arrivals"] },
    { label: "Day 3 (Event Day)", color: "#15803d", tasks: ["Arrive early", "Oversee setup", "Welcome guests", "Celebrate!"] },
  ];
  if (daysLeft <= 5) return [
    { label: "Day 1–2", color: "#7c3aed", tasks: ["Confirm venue", "Book caterer", "Send invitations immediately", "Confirm headcount"] },
    { label: `Day 3–${daysLeft - 1}`, color: "#C47A2E", tasks: ["Book decoration if needed", "Finalize menu", "Make all vendor payments", "Prepare event-day schedule", "Confirm all arrivals"] },
    { label: `Day ${daysLeft} (Event Day)`, color: "#15803d", tasks: ["Arrive early", "Oversee setup", "Welcome guests", "Celebrate!"] },
  ];
  if (daysLeft === 6) return [
    { label: "Day 1–2", color: "#7c3aed", tasks: ["Confirm venue", "Book caterer", "Send invitations immediately"] },
    { label: "Day 3–4", color: "#C47A2E", tasks: ["Book decoration if needed", "Finalize menu", "Confirm headcount", "Arrange photography if needed"] },
    { label: "Day 5", color: "#b45309", tasks: ["Track RSVPs", "Make all vendor payments", "Prepare event-day schedule", "Confirm all arrivals"] },
    { label: "Day 6 (Event Day)", color: "#15803d", tasks: ["Arrive early", "Oversee setup", "Welcome guests", "Celebrate!"] },
  ];
  // 7 days — mirrors existing 7day plan phases
  return [
    { label: "Day 1–2", color: "#7c3aed", tasks: ["Confirm venue", "Book caterer", "Send invitations immediately"] },
    { label: "Day 3–4", color: "#C47A2E", tasks: ["Book decoration if needed", "Finalize menu", "Confirm headcount", "Arrange photography if needed"] },
    { label: "Day 5–6", color: "#b45309", tasks: ["Track RSVPs", "Make all vendor payments", "Prepare event-day schedule", "Confirm all arrivals"] },
    { label: "Day 7 (Event Day)", color: "#15803d", tasks: ["Arrive early", "Oversee setup", "Welcome guests", "Celebrate!"] },
  ];
}

// ── Personalized timeline builder ───────────────────────────────────────────
function buildPersonalizedTimeline({ eventType = "birthday", eventDate, services = [], booked = [] }) {
  const daysLeft = eventDate
    ? Math.max(0, Math.ceil((new Date(eventDate) - new Date()) / 86400000))
    : 90;

  const planKey = daysLeft > 60 ? "90day" : daysLeft > 21 ? "30day" : "7day";
  const plan = PLANS[planKey];

  // Service keywords filter
  const svcCheck = {
    Catering:    t => t.includes("cater") || t.includes("menu") || t.includes("food"),
    Photography: t => t.includes("photograph") || t.includes("videograph") || t.includes("shot list"),
    Decoration:  t => t.includes("decor") || t.includes("floral") || t.includes("balloon"),
    DJ:          t => t.includes(" dj") || t.startsWith("dj") || (t.includes("music") && !t.includes("live music")),
    Mehendi:     t => t.includes("mehendi"),
    Makeup:      t => t.includes("makeup") || t.includes("hair"),
    Transport:   t => t.includes("transport") || t.includes("accommodation"),
    Anchor:      t => t.includes("anchor") || t.includes("mc"),
  };

  const isTaskRelevant = (text) => {
    const t = text.toLowerCase();
    for (const [svc, check] of Object.entries(svcCheck)) {
      if (check(t) && !services.includes(svc)) return false;
    }
    return true;
  };

  const isTaskDone = (text) => {
    const t = text.toLowerCase();
    return (
      (booked.includes("Catering")    && svcCheck.Catering(t))    ||
      (booked.includes("Photography") && svcCheck.Photography(t)) ||
      (booked.includes("Decoration")  && svcCheck.Decoration(t))  ||
      (booked.includes("DJ")          && svcCheck.DJ(t))          ||
      (booked.includes("Mehendi")     && svcCheck.Mehendi(t))     ||
      (booked.includes("Makeup")      && svcCheck.Makeup(t))      ||
      (booked.includes("Transport")   && svcCheck.Transport(t))
    );
  };

  const phasesToUse = daysLeft <= 7 ? buildCompressedPlan(daysLeft) : plan.phases;

  return phasesToUse
    .map((phase, pi) => ({
      id: `phase_${pi}_${Date.now()}`,
      label: phase.label,
      color: phase.color,
      tasks: phase.tasks
        .filter(isTaskRelevant)
        .map((text, ti) => ({
          id: `task_${pi}_${ti}_${Date.now()}`,
          text,
          done: isTaskDone(text),
          note: "",
        })),
    }))
    .filter(p => p.tasks.length > 0);
}

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

export default function Timeline() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToVendors = (svc) => {
    if (isStandalone()) {
      navigate("/listings", { state: { selectedCategories: [svc] } });
    } else {
      window.open(`/listings?serviceType=${svc}`, "_blank");
    }
  };

  const personalizationData = location.state?.personalizationData;
  const routeEventType      = location.state?.eventType; // legacy
  const routePlanKey        = routeEventType ? (EVENT_TO_PLAN[routeEventType] || "30day") : null;

  const [planKey, setPlanKey]   = useState(routePlanKey || "90day");
  const [phases, setPhases]     = useState([]);
  const [loaded, setLoaded]     = useState(false);
  const [personalized, setPersonalized] = useState(null);
  const [expandedNote, setExpandedNote] = useState(null);
  const [timelineSaved, setTimelineSaved]   = useState(() => { try { return !!localStorage.getItem("tendr_timeline_saved"); } catch { return false; } });
  const [notifyOpen,    setNotifyOpen]       = useState(false);
  const [notifyDone,    setNotifyDone]       = useState(() => { try { return !!localStorage.getItem('tendr_notify_phone'); } catch { return false; } });

  const saveTimeline = () => {
    try { localStorage.setItem("tendr_timeline_saved", "true"); } catch {}
    setTimelineSaved(true);
    window.dispatchEvent(new CustomEvent("tendr:timeline-saved"));
  };

  const TTL_7D = 7 * 24 * 60 * 60 * 1000;
  const computeExpiry = (pd) => {
    const ed = pd?.eventDate;
    if (ed) {
      const expiry = new Date(ed).getTime() + 24 * 60 * 60 * 1000;
      if (expiry > Date.now()) return expiry;
    }
    return Date.now() + TTL_7D;
  };

  useEffect(() => {
    if (personalizationData) {
      const daysLeft = personalizationData.eventDate
        ? Math.max(0, Math.ceil((new Date(personalizationData.eventDate) - new Date()) / 86400000))
        : 90;
      const pk = daysLeft > 60 ? "90day" : daysLeft > 21 ? "30day" : "7day";
      setPersonalized(personalizationData);
      setPlanKey(pk);
      setPhases(buildPersonalizedTimeline(personalizationData));
      setLoaded(true);
      return;
    }
    if (routePlanKey) {
      setPlanKey(routePlanKey);
      setPhases(buildFromPlan(routePlanKey));
      setLoaded(true);
      return;
    }
    try {
      const raw = localStorage.getItem("tendr_timeline_v2");
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.__expiresAt && Date.now() > saved.__expiresAt) {
          localStorage.removeItem("tendr_timeline_v2");
          // Try stored form data
          const formRaw = localStorage.getItem("tendr_timeline_form");
          if (formRaw) {
            const fd = JSON.parse(formRaw);
            setPersonalized(fd);
            const dl = fd.eventDate ? Math.max(0, Math.ceil((new Date(fd.eventDate) - new Date()) / 86400000)) : 90;
            const pk = dl > 60 ? "90day" : dl > 21 ? "30day" : "7day";
            setPlanKey(pk);
            setPhases(buildPersonalizedTimeline(fd));
          } else {
            setPhases(buildFromPlan("90day"));
          }
        } else {
          if (saved.personalized) setPersonalized(saved.personalized);
          setPlanKey(saved.planKey || "90day");
          setPhases(saved.phases || []);
        }
      } else {
        const formRaw = localStorage.getItem("tendr_timeline_form");
        if (formRaw) {
          const fd = JSON.parse(formRaw);
          setPersonalized(fd);
          const dl = fd.eventDate ? Math.max(0, Math.ceil((new Date(fd.eventDate) - new Date()) / 86400000)) : 90;
          const pk = dl > 60 ? "90day" : dl > 21 ? "30day" : "7day";
          setPlanKey(pk);
          setPhases(buildPersonalizedTimeline(fd));
        } else {
          setPhases(buildFromPlan("90day"));
        }
      }
    } catch { setPhases(buildFromPlan("90day")); }
    setLoaded(true);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!loaded) return;
    const pd = personalized || personalizationData;
    localStorage.setItem("tendr_timeline_v2", JSON.stringify({
      planKey,
      phases,
      personalized: pd || null,
      __expiresAt: computeExpiry(pd),
    }));
    try { const t = localStorage.getItem("tendr_token") || localStorage.getItem("jwt"); if (t) import("../../utils/progressSync").then(m => m.scheduleSyncToServer(t)); } catch {}
  }, [phases, planKey, loaded]); // eslint-disable-line

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

  const plan = PLANS[planKey];

  // Compute a display label that reflects actual days left for short-window events
  const displayDaysLeft = (() => {
    const pd = personalized || personalizationData;
    if (!pd?.eventDate) return null;
    return Math.max(0, Math.ceil((new Date(pd.eventDate) - new Date()) / 86400000));
  })();
  const planDisplayLabel = displayDaysLeft === null
    ? plan.label
    : displayDaysLeft > 60 ? "90-Day Plan"
    : displayDaysLeft > 21 ? "30-Day Plan"
    : displayDaysLeft > 7  ? "7-Day Plan"
    : displayDaysLeft > 0  ? `${displayDaysLeft}-Day Plan`
    : "Event Day";

  return (
    <div style={{ height: "100dvh", overflow: "hidden", display: "flex", flexDirection: "column", background: "#F8F4EF", fontFamily: font }}>
      <style>{`
        @media (max-width: 768px) {
          .tl-header { padding: 6px 12px !important; }
          .tl-progress { padding: 6px 12px !important; }
          .tl-phase { margin-bottom: 16px !important; padding-left: 44px !important; }
          .tl-phase-dot { width: 36px !important; height: 36px !important; top: 10px !important; font-size: 13px !important; }
          .tl-phase-card-header { padding: 10px 14px !important; }
          .tl-phase-card-header span { font-size: 13px !important; }
          .tl-task-row { padding: 8px 14px !important; }
          .tl-task-input { font-size: 12px !important; }
          .tl-save-btn { font-size: 11px !important; padding: 4px 8px !important; }
          .tl-notify-btn { font-size: 11px !important; padding: 4px 8px !important; }
          .tl-progress-pct { font-size: 12px !important; }
        }
      `}</style>
      <SEO title="Event Timeline — Tendr" description="Step-by-step countdown plan for your event." path="/prebuilt-timeline" />
      <BasicSpeedDial />
      <div style={{ flexShrink: 0 }}><HamburgerNav active="Browse" /></div>

      {/* Fixed top: header + progress */}
      <div style={{ flexShrink: 0 }}>

        {/* Header */}
        <div className="tl-header" style={{ background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", padding: "10px 16px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => { localStorage.removeItem("tendr_timeline_v2"); localStorage.removeItem("tendr_timeline_form"); navigate("/timeline-picker"); }}
              style={{ padding: "5px 10px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.12)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: font, flexShrink: 0 }}>
              ← Redo
            </button>
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {personalized ? "Personalized Timeline" : "Event Timeline"}
              </div>
              <h1 style={{ fontSize: 15, fontWeight: 900, color: "#fff", margin: 0 }}>
                {planDisplayLabel} <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.75 }}>— {plan.subtitle}</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Progress — fixed */}
        <div className="tl-progress" style={{ background: "#FFFCF5", borderBottom: "1px solid rgba(196,122,46,0.12)", padding: "10px 16px", boxShadow: "0 2px 8px rgba(139,69,19,0.06)" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#2C1A0E" }}>
                  {pct === 100 ? "All done — great work!" : "Overall Progress"}
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: pct === 100 ? "#15803d" : "#C47A2E" }}>{pct}%</span>
              </div>
              <div style={{ height: 5, background: "#f3e8d4", borderRadius: 100, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "linear-gradient(90deg,#15803d,#22c55e)" : "linear-gradient(90deg,#C47A2E,#CCAB4A)", borderRadius: 100, transition: "width 0.4s ease" }} />
              </div>
              <div style={{ fontSize: 10, color: "#9B7450", marginTop: 2 }}>{done} of {total} tasks done</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button className="tl-save-btn" onClick={saveTimeline}
                style={{ padding: "6px 10px", borderRadius: 8, border: timelineSaved ? "1.5px solid #22c55e" : "1.5px solid rgba(196,122,46,0.3)", background: timelineSaved ? "rgba(34,197,94,0.08)" : "#fff", color: timelineSaved ? "#15803d" : "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, flexShrink: 0 }}>
                {timelineSaved ? "✓ Saved" : "Save"}
              </button>
              <button className="tl-notify-btn" onClick={() => setNotifyOpen(true)}
                style={{ padding: "6px 10px", borderRadius: 8, border: notifyDone ? "1.5px solid #22c55e" : "1.5px solid rgba(196,122,46,0.35)", background: notifyDone ? "rgba(34,197,94,0.08)" : "linear-gradient(135deg,rgba(196,122,46,0.12),rgba(204,171,74,0.08))", color: notifyDone ? "#15803d" : "#C47A2E", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font, flexShrink: 0, whiteSpace: "nowrap" }}>
                {notifyDone ? "Notified" : "Get Notified"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {notifyOpen && (
        <NotifyModal
          phases={phases}
          eventDate={personalized?.eventDate || personalizationData?.eventDate}
          eventType={personalized?.eventType || personalizationData?.eventType}
          planKey={planKey}
          onClose={() => {
            setNotifyOpen(false);
            try { if (localStorage.getItem('tendr_notify_phone')) setNotifyDone(true); } catch {}
          }}
        />
      )}

      {/* Scrollable timeline */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px calc(80px + env(safe-area-inset-bottom, 0px))" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* Vertical timeline */}
        <div style={{ position: "relative" }}>
          {/* Vertical line */}
          <div style={{ position: "absolute", left: 23, top: 0, bottom: 0, width: 2, background: "rgba(196,122,46,0.15)", zIndex: 0 }} />

          {phases.map((phase, pi) => {
            const phaseDone = phase.tasks.filter(t => t.done).length;
            const phaseTotal = phase.tasks.length;
            const allDone = phaseDone === phaseTotal && phaseTotal > 0;

            return (
              <div key={phase.id} className="tl-phase" style={{ position: "relative", marginBottom: 32, paddingLeft: 60 }}>
                {/* Phase dot */}
                <div className="tl-phase-dot" style={{
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
                  <div className="tl-phase-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: `${phase.color}10`, borderBottom: `1px solid ${phase.color}20` }}>
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
                        <div className="tl-task-row" style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 18px", borderBottom: "1px solid rgba(196,122,46,0.06)" }}>
                          <button
                            onClick={() => toggleTask(phase.id, task.id)}
                            style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${task.done ? "#15803d" : "rgba(196,122,46,0.3)"}`, background: task.done ? "#15803d" : "#fff", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, marginTop: 1, transition: "all 0.15s" }}>
                            {task.done ? "✓" : ""}
                          </button>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <input
                              value={task.text}
                              onChange={e => updateTaskText(phase.id, task.id, e.target.value)}
                              placeholder="Task..."
                              className="tl-task-input" style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontFamily: font, fontSize: 14, color: task.done ? "#bbb" : "#2C1A0E", textDecoration: task.done ? "line-through" : "none" }}
                            />
                            {!task.done && (() => { const svc = detectServiceFromTask(task.text); return svc ? (
                              <button onClick={(e) => { e.stopPropagation(); goToVendors(svc); }}
                                style={{ marginTop: 3, padding: "2px 9px", borderRadius: 100, border: `1px solid ${phase.color}40`, background: `${phase.color}10`, color: phase.color, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: font, display: "inline-flex", alignItems: "center", gap: 3 }}>
                                🔍 Find {svc === "Photographer" ? "Photographers" : svc + "s"}
                              </button>
                            ) : null; })()}
                          </div>
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

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          <button onClick={() => applyPlan(planKey)}
            style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.2)", background: "#fff", color: "#9B7450", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            Reset to Plan
          </button>
          <button onClick={() => navigate("/timeline-picker")}
            style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.2)", background: "#fff", color: "#C47A2E", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: font }}>
            ← Change Event Type
          </button>
        </div>

      </div>
      </div>

    </div>
  );
}
