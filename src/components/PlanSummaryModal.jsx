import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const F = "'Outfit', sans-serif";
const GOLD = '#C47A2E';
const INK = '#2C1A0E';
const CREAM = '#FFFCF5';

const STATUS_STYLE = {
  'Pending':       { bg: '#FEF9C3', color: '#92400E', dot: '#F59E0B' },
  'In Discussion': { bg: '#EDE9FE', color: '#4C1D95', dot: '#7C3AED' },
  'Confirmed':     { bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
  'Cancelled':     { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
};

const CAT_ICON = {
  Caterer: '🍽', Photographer: '📸', Decorator: '🎀', DJ: '🎵',
  Venue: '🏛', AV: '🎤', Entertainment: '🎭', Transport: '🚌', Gifts: '🎁',
};

export function loadPlan() {
  try {
    const raw = localStorage.getItem('tendr_smart_plan');
    if (raw) return JSON.parse(raw);
    const sess = localStorage.getItem('tendr_ep_session');
    if (sess) {
      const s = JSON.parse(sess);
      const fd = s.formData || {};
      if (!fd.eventType && !fd.date && !fd.location) return null;
      return {
        _draft: true,
        eventDetails: { eventType: fd.eventType, date: fd.date, location: fd.location, guests: fd.guests, budget: fd.budget },
        vendorSlots: (s.selectedVendors || []).map(cat => ({ category: cat, vendorName: '', estimatedCost: 0, status: 'Pending' })),
        conversationId: null,
      };
    }
  } catch {}
  return null;
}

function buildTasks(eventDetails, vendorSlots) {
  const cats = (vendorSlots || []).map(s => s.category);
  const isCorp = /corporate|conference|offsite|launch/i.test(eventDetails?.eventType || '');
  return [
    ...(isCorp ? [{ id: 'approval', label: 'Get management / finance approval on budget', cat: 'Planning' }] : []),
    { id: 'budget_lock', label: 'Set & lock total event budget', cat: 'Planning' },
    { id: 'venue_confirm', label: 'Confirm venue & logistics', cat: 'Planning' },
    ...cats.map(c => ({ id: `vendor_${c}`, label: `Book ${c.toLowerCase()} vendor`, cat: 'Vendors' })),
    { id: 'invites', label: 'Send invitations to guests', cat: 'Guests' },
    { id: 'rsvp', label: 'Collect RSVPs & confirm final headcount', cat: 'Guests' },
    ...(cats.includes('Caterer') ? [{ id: 'caterer_count', label: 'Share final headcount with caterer', cat: 'Vendors' }] : []),
    { id: 'schedule', label: 'Share event run-sheet with all vendors', cat: 'Vendors' },
    { id: 'payments', label: 'Clear all outstanding vendor payments', cat: 'Finance' },
    { id: 'setup_times', label: 'Confirm setup & arrival times with each vendor', cat: 'Vendors' },
    ...(isCorp ? [{ id: 'transport', label: 'Arrange employee transportation & parking', cat: 'Logistics' }] : []),
    { id: 'day_brief', label: 'Brief everyone on event day schedule', cat: 'Planning' },
  ];
}

function downloadPlanAsHTML(plan) {
  const eventType = plan.eventDetails?.eventType || plan.eventType || 'My Event';
  const date = plan.eventDetails?.date || plan.date || '';
  const location = plan.eventDetails?.location || plan.location || '';
  const guests = plan.eventDetails?.guests || plan.guests || '';
  const budget = plan.eventDetails?.budget || plan.budget || '';
  const slots = plan.vendorSlots || [];
  const tasks = buildTasks(plan.eventDetails, slots);

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Event Plan — ${eventType}</title>
<style>
  body { font-family: 'Outfit', Arial, sans-serif; max-width: 700px; margin: 40px auto; padding: 0 24px; color: #2C1A0E; background: #fff; }
  h1 { font-size: 26px; font-weight: 700; color: #C47A2E; margin: 0 0 4px; }
  .sub { color: #9B7450; font-size: 14px; margin-bottom: 28px; }
  h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #9B7450; margin: 24px 0 10px; border-bottom: 1px solid #f0e8dc; padding-bottom: 6px; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 8px; }
  .tile { border: 1.5px solid rgba(196,122,46,0.18); border-radius: 10px; padding: 14px; }
  .tile-label { font-size: 11px; color: #9B7450; text-transform: uppercase; letter-spacing: 0.1em; }
  .tile-value { font-size: 18px; font-weight: 700; color: #2C1A0E; margin-top: 2px; }
  .vendor-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid #f0e8dc; border-radius: 10px; margin-bottom: 6px; }
  .status { font-size: 11px; font-weight: 700; border-radius: 20px; padding: 3px 10px; margin-left: auto; }
  .task-row { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f7f0e8; font-size: 13px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #C47A2E; flex-shrink: 0; }
  footer { margin-top: 40px; font-size: 11px; color: #c0a880; text-align: center; padding-top: 16px; border-top: 1px solid #f0e8dc; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
<h1>${eventType}</h1>
<div class="sub">Generated by Tendr · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
<h2>Event Details</h2>
<div class="grid">
  ${date ? `<div class="tile"><div class="tile-label">Date</div><div class="tile-value">${new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div></div>` : ''}
  ${location ? `<div class="tile"><div class="tile-label">Location</div><div class="tile-value">${location}</div></div>` : ''}
  ${guests ? `<div class="tile"><div class="tile-label">Guests</div><div class="tile-value">${guests}</div></div>` : ''}
  ${budget ? `<div class="tile"><div class="tile-label">Budget</div><div class="tile-value">₹${Number(budget).toLocaleString('en-IN')}</div></div>` : ''}
</div>
${slots.length ? `
<h2>Vendor Slots</h2>
${slots.map(s => `
<div class="vendor-row">
  <span style="font-size:18px">${CAT_ICON[s.category] || '📌'}</span>
  <div>
    <div style="font-size:13px;font-weight:700">${s.category}</div>
    ${s.vendorName ? `<div style="font-size:12px;color:#9B7450">${s.vendorName}</div>` : ''}
  </div>
  <span class="status" style="background:${STATUS_STYLE[s.status]?.bg || '#f0e8dc'};color:${STATUS_STYLE[s.status]?.color || '#2C1A0E'}">${s.status || 'Pending'}</span>
</div>`).join('')}
` : ''}
<h2>Checklist</h2>
${tasks.map(t => `<div class="task-row"><div class="dot"></div>${t.label}</div>`).join('')}
<footer>tendr.in · Event Planning Platform · Delhi NCR</footer>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => { win.focus(); win.print(); }, 400);
}

// ── Small icon button shown in Navbar ──────────────────────────────────────
export function PlanIconButton() {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState(null);
  const navigate = useNavigate();

  // Watch Redux formData so the icon activates instantly when user fills any field
  // (same-tab updates — localStorage 'storage' event only fires cross-tab)
  const reduxFormData = useSelector(s => s.eventPlanning?.formData);

  const refresh = useCallback(() => { setPlan(loadPlan()); }, []);

  // Re-evaluate plan whenever Redux formData changes (covers Flow 1 & Flow 3 same-tab)
  useEffect(() => {
    refresh();
  }, [reduxFormData?.eventType, reduxFormData?.date, reduxFormData?.location, refresh]);

  useEffect(() => {
    refresh();
    // Cross-tab: tendr_smart_plan written in another tab, or after page reload
    window.addEventListener('storage', refresh);
    // Same-tab: custom event dispatched when tendr_smart_plan is written
    window.addEventListener('tendr:plan-confirmed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('tendr:plan-confirmed', refresh);
    };
  }, [refresh]);

  if (!plan) return null;

  const isDraft = plan._draft === true;
  const eventType = plan.eventDetails?.eventType || plan.eventType || '';
  const eventDate = plan.eventDetails?.date || plan.date || '';
  const daysLeft = eventDate ? Math.ceil((new Date(eventDate) - Date.now()) / 86400000) : null;

  return (
    <>
      {/* Icon trigger */}
      <button
        onClick={() => setOpen(true)}
        title={isDraft ? 'Continue Planning' : `My Event — ${eventType}`}
        style={{
          position: 'relative',
          width: 36, height: 36,
          borderRadius: 10,
          border: '1.5px solid rgba(196,122,46,0.3)',
          background: isDraft ? 'rgba(196,122,46,0.06)' : 'rgba(196,122,46,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
          transition: 'all 0.18s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(196,122,46,0.18)'; e.currentTarget.style.borderColor = 'rgba(196,122,46,0.55)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = isDraft ? 'rgba(196,122,46,0.06)' : 'rgba(196,122,46,0.1)'; e.currentTarget.style.borderColor = 'rgba(196,122,46,0.3)'; }}
      >
        {/* Clipboard icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          <line x1="9" y1="12" x2="15" y2="12"/>
          <line x1="9" y1="16" x2="12" y2="16"/>
        </svg>
        {/* Gold dot */}
        <div style={{
          position: 'absolute', top: -2, right: -2,
          width: 8, height: 8, borderRadius: '50%',
          background: isDraft ? '#F59E0B' : GOLD,
          border: '1.5px solid #FFFCF5',
        }} />
      </button>

      {/* Modal */}
      {open && (
        <PlanSummaryModal
          plan={plan}
          daysLeft={daysLeft}
          isDraft={isDraft}
          onClose={() => setOpen(false)}
          onDismiss={() => {
            try {
              localStorage.removeItem('tendr_smart_plan');
              localStorage.removeItem('tendr_ep_session');
            } catch {}
            setPlan(null);
            setOpen(false);
          }}
          navigate={navigate}
        />
      )}
    </>
  );
}

function buildPlanMessage(plan) {
  const eventType = plan.eventDetails?.eventType || plan.eventType || 'My Event';
  const date = plan.eventDetails?.date || plan.date || '';
  const location = plan.eventDetails?.location || plan.location || '';
  const guests = plan.eventDetails?.guests || plan.guests || '';
  const budget = plan.eventDetails?.budget || plan.budget || '';
  const slots = plan.vendorSlots || [];
  const packages = plan.selectedPackages || {};
  const activities = plan.funActivities || [];
  const hampers = plan.giftHampers || [];

  const lines = [`📋 *Event Plan — ${eventType}*`, ''];
  if (date) lines.push(`📅 Date: ${new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`);
  if (location) lines.push(`📍 Location: ${location}`);
  if (guests) lines.push(`👥 Guests: ${guests}`);
  if (budget) lines.push(`💰 Budget: ₹${Number(budget).toLocaleString('en-IN')}`);
  if (slots.length) {
    lines.push('', '*Vendors needed:*');
    slots.forEach(s => lines.push(`• ${CAT_ICON[s.category] || '📌'} ${s.category}${s.vendorName ? ` — ${s.vendorName}` : ''} (${s.status || 'Pending'})`));
  }
  if (Object.keys(packages).length) {
    lines.push('', '*Packages selected:*');
    Object.entries(packages).forEach(([cat, pkg]) => lines.push(`• ${cat}: ${pkg} Package`));
  }
  if (activities.length) {
    lines.push('', '*Fun activities:*');
    activities.forEach(a => lines.push(`• ${a.emoji || '🎉'} ${a.name}${a.totalPrice ? ` — ₹${Number(a.totalPrice).toLocaleString('en-IN')}` : ''}`));
  }
  if (hampers.length) {
    lines.push('', '*Gift hampers:*');
    hampers.forEach(h => lines.push(`• ${h.name} × ${h.quantity} — ₹${Number(h.subtotal || 0).toLocaleString('en-IN')}`));
  }
  lines.push('', 'Can you help me plan this event? Looking for vendor recommendations and a quote.');
  return lines.join('\n');
}

// ── Centered scrollable modal ──────────────────────────────────────────────
export function PlanSummaryModal({ plan, daysLeft, isDraft, onClose, onDismiss, navigate }) {
  const eventType = plan.eventDetails?.eventType || plan.eventType || '';
  const date = plan.eventDetails?.date || plan.date || '';
  const location = plan.eventDetails?.location || plan.location || '';
  const guests = plan.eventDetails?.guests || plan.guests || '';
  const budget = plan.eventDetails?.budget || plan.budget || '';
  const slots = plan.vendorSlots || [];
  const tasks = buildTasks(plan.eventDetails, slots);
  const hasChat = !!(plan.conversationId);
  const planKey = plan._id || 'draft';

  const { token } = useSelector(s => s.auth);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Decor mockup popup state
  const [decorPopup, setDecorPopup] = useState(false);   // "want decor mockup?" question
  const [decorPhoto, setDecorPhoto] = useState(null);    // { file, preview }
  const [decorDesc, setDecorDesc] = useState('');
  const [decorSending, setDecorSending] = useState(false);
  const decorFileRef = useRef(null);

  // Auth-gate: if user clicked download while signed out, auto-trigger on return
  useEffect(() => {
    const pending = sessionStorage.getItem('tendr_pending_plan_download');
    if (pending && token) {
      sessionStorage.removeItem('tendr_pending_plan_download');
      try { downloadPlanAsHTML(JSON.parse(pending)); } catch {}
    }
  }, [token]);

  const handleDownload = () => {
    if (!token) {
      sessionStorage.setItem('tendr_pending_plan_download', JSON.stringify(plan));
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      onClose();
      return;
    }
    downloadPlanAsHTML(plan);
  };

  const handleSendToChat = () => {
    setDecorPopup(true);
  };

  const sendPlanToChat = (extraMsg = '', photoDataUrl = null) => {
    const base = buildPlanMessage(plan);
    const full = extraMsg ? base + '\n\n' + extraMsg : base;
    document.dispatchEvent(new CustomEvent('tendr:open-chat-with-plan', { detail: { message: full, photo: photoDataUrl } }));
    onClose();
  };

  const handleDecorNo = () => {
    setDecorPopup(false);
    sendPlanToChat();
  };

  const handleDecorPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setDecorPhoto({ file, preview: ev.target.result });
    reader.readAsDataURL(file);
  };

  const handleDecorSend = () => {
    setDecorSending(true);
    const descText = decorDesc.trim()
      ? `🎨 *Decor Mockup Request*\n${decorDesc.trim()}`
      : '🎨 *Decor Mockup Request* — Please share some decor mockup ideas for my event.';
    sendPlanToChat(descText, decorPhoto?.preview || null);
    setDecorSending(false);
    setDecorPopup(false);
    setDecorPhoto(null);
    setDecorDesc('');
  };

  const [taskState, setTaskState] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`tendr_tasks_${planKey}`) || '{}'); } catch { return {}; }
  });
  const toggleTask = (id) => {
    const next = { ...taskState, [id]: !taskState[id] };
    setTaskState(next);
    try { localStorage.setItem(`tendr_tasks_${planKey}`, JSON.stringify(next)); } catch {}
  };

  const confirmedCount = slots.filter(s => s.status === 'Confirmed').length;
  const doneTaskCount = tasks.filter(t => taskState[t.id]).length;
  const dateStr = date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

  // Group tasks by category
  const taskGroups = tasks.reduce((acc, t) => {
    if (!acc[t.cat]) acc[t.cat] = [];
    acc[t.cat].push(t);
    return acc;
  }, {});

  // Trap scroll on body while modal open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(28,14,4,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480,
          maxHeight: 'calc(100dvh - 32px)',
          background: CREAM,
          borderRadius: 20,
          boxShadow: '0 24px 64px rgba(28,14,4,0.22)',
          display: 'flex', flexDirection: 'column',
          fontFamily: F,
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(196,122,46,0.14)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                {isDraft && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(245,158,11,0.12)', color: '#B45309', border: '1px solid rgba(245,158,11,0.28)', borderRadius: 20, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Draft
                  </span>
                )}
                {!isDraft && plan._liveStatus && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(34,197,94,0.1)', color: '#166534', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 20, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {plan._liveStatus}
                  </span>
                )}
              </div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: INK, lineHeight: 1.2 }}>
                {eventType || 'My Event'}
              </h2>
              {dateStr && (
                <p style={{ margin: '3px 0 0', fontSize: 12.5, color: '#9B7450' }}>
                  {dateStr}{daysLeft !== null && daysLeft > 0 ? ` · ${daysLeft} day${daysLeft !== 1 ? 's' : ''} away` : daysLeft === 0 ? ' · Today!' : ' · Event passed'}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button
                onClick={handleDownload}
                title={token ? "Download plan" : "Sign in to download"}

                style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid rgba(196,122,46,0.28)', background: 'rgba(196,122,46,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(196,122,46,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(196,122,46,0.06)'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Download">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
              <button
                onClick={onClose}
                style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(44,26,14,0.07)', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B7450' }}
              >×</button>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px 20px' }}>

          {/* Draft banner */}
          {isDraft && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(245,158,11,0.07)', border: '1.5px solid rgba(245,158,11,0.22)', borderRadius: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 18 }}>✏️</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#92400E' }}>Plan in progress</div>
                <div style={{ fontSize: 11, color: '#B45309', marginTop: 1 }}>Finish the form to confirm vendors & unlock chat</div>
              </div>
              <button
                onClick={() => { onClose(); navigate('/plan-event/form'); }}
                style={{ padding: '6px 12px', borderRadius: 8, background: '#C47A2E', color: '#fff', fontSize: 11.5, fontWeight: 700, border: 'none', cursor: 'pointer' }}
              >Continue →</button>
            </div>
          )}

          {/* Stat tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 18 }}>
            {[
              { label: 'Days Left', value: daysLeft !== null ? (daysLeft > 0 ? daysLeft : daysLeft === 0 ? 'Today' : 'Passed') : '—' },
              { label: 'Vendors', value: `${confirmedCount}/${slots.length} confirmed` },
              { label: 'Budget', value: budget ? `₹${Number(budget).toLocaleString('en-IN')}` : '—' },
              { label: 'Tasks done', value: `${doneTaskCount}/${tasks.length}` },
            ].map(({ label, value }) => (
              <div key={label} style={{ border: '1.5px solid rgba(196,122,46,0.15)', borderRadius: 12, padding: '11px 14px', background: '#fff' }}>
                <div style={{ fontSize: 10.5, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: INK }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Event details */}
          {(location || guests) && (
            <div style={{ marginBottom: 18 }}>
              <SectionLabel>Event Details</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {location && <InfoRow icon="📍" label="Location" value={location} />}
                {guests && <InfoRow icon="👥" label="Guests" value={`${guests} guests`} />}
              </div>
            </div>
          )}

          {/* Chat note */}
          {hasChat && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(37,211,102,0.06)', border: '1.5px solid rgba(37,211,102,0.2)', borderRadius: 12, marginBottom: 18 }}>
              <span style={{ fontSize: 18 }}>💬</span>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#166534' }}>Chat is active</div>
                <div style={{ fontSize: 11, color: '#4ade80' }}>Find it in Active Chats on your dashboard</div>
              </div>
            </div>
          )}

          {/* Vendor slots */}
          {slots.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionLabel>Vendor Board</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {slots.map((slot, i) => {
                  const ss = STATUS_STYLE[slot.status] || STATUS_STYLE['Pending'];
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fff', border: '1.5px solid rgba(196,122,46,0.12)', borderRadius: 12 }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{CAT_ICON[slot.category] || '📌'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{slot.category}</div>
                        {slot.vendorName && <div style={{ fontSize: 11, color: '#9B7450', marginTop: 1 }}>{slot.vendorName}</div>}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, background: ss.bg, color: ss.color, borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: ss.dot, display: 'inline-block' }} />
                        {slot.status || 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Task checklist */}
          {tasks.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <SectionLabel>Checklist <span style={{ fontWeight: 400, color: '#C47A2E', fontSize: 11 }}>{doneTaskCount}/{tasks.length}</span></SectionLabel>
              {Object.entries(taskGroups).map(([cat, catTasks]) => (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: '#B08050', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{cat}</div>
                  {catTasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%', padding: '7px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${taskState[task.id] ? GOLD : 'rgba(196,122,46,0.3)'}`,
                        background: taskState[task.id] ? GOLD : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.15s',
                      }}>
                        {taskState[task.id] && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </div>
                      <span style={{ fontSize: 13, color: taskState[task.id] ? '#B08050' : INK, textDecoration: taskState[task.id] ? 'line-through' : 'none', lineHeight: 1.4, transition: 'all 0.15s' }}>
                        {task.label}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Invitation Flyer + Send to Chat row */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={() => setInviteOpen(true)}
              style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: 'linear-gradient(135deg,#2C1A0E,#4A2810)', color: '#CCAB4A', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              💌 Create Invitation Flyer
            </button>
            <button
              onClick={handleSendToChat}
              style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: 'rgba(37,211,102,0.1)', color: '#166534', fontSize: 13, fontWeight: 700, border: '1.5px solid rgba(37,211,102,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              📤 Send to Chat
            </button>
          </div>

          {/* Footer actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => { onClose(); navigate('/plan-event/form'); }}
              style={{ flex: 1, minWidth: 120, padding: '11px 0', borderRadius: 12, background: 'transparent', color: GOLD, fontSize: 13, fontWeight: 700, border: `1.5px solid ${GOLD}`, cursor: 'pointer' }}
            >
              ✏️ Edit Everything
            </button>
            {hasChat && (
              <button
                onClick={() => { onClose(); navigate('/chats'); }}
                style={{ flex: 1, minWidth: 120, padding: '11px 0', borderRadius: 12, background: GOLD, color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(196,122,46,0.3)' }}
              >
                💬 Continue Chat
              </button>
            )}
            {!hasChat && (
              <button
                onClick={() => { onClose(); navigate('/my-event'); }}
                style={{ flex: 1, minWidth: 120, padding: '11px 0', borderRadius: 12, background: GOLD, color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(196,122,46,0.3)' }}
              >
                Full Event View →
              </button>
            )}
            <button
              onClick={onDismiss}
              style={{ padding: '11px 14px', borderRadius: 12, border: '1.5px solid rgba(196,122,46,0.22)', background: 'transparent', color: '#9B7450', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* ── Decor Mockup Popup ── */}
      {decorPopup && (
        <>
          <div onClick={() => { setDecorPopup(false); setDecorPhoto(null); setDecorDesc(''); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10002, backdropFilter: 'blur(3px)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 10003, background: CREAM, borderRadius: 20, padding: '28px 26px', width: 'min(420px, 92vw)', boxShadow: '0 24px 64px rgba(44,26,14,0.22)', border: '1.5px solid rgba(196,122,46,0.18)', fontFamily: F }}>
            {!decorPhoto ? (
              /* Step 1: ask if they want decor mockup */
              <>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🎨</div>
                  <p style={{ fontSize: 16, fontWeight: 800, color: INK, margin: '0 0 8px' }}>Want decor mockups?</p>
                  <p style={{ fontSize: 13, color: '#9B7450', margin: 0, lineHeight: 1.6 }}>Share a reference photo from your space or inspiration — our team will suggest decor ideas for your event.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={() => decorFileRef.current?.click()}
                    style={{ padding: '13px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    📷 Yes, upload a photo
                  </button>
                  <input ref={decorFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleDecorPhotoChange} />
                  <button
                    onClick={handleDecorNo}
                    style={{ padding: '12px', borderRadius: 12, border: '1.5px solid rgba(196,122,46,0.25)', background: 'transparent', color: '#9B7450', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                  >
                    No thanks, just send plan
                  </button>
                </div>
              </>
            ) : (
              /* Step 2: photo uploaded — show preview + description */
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: INK, margin: 0 }}>🎨 Decor Reference</p>
                  <button onClick={() => setDecorPhoto(null)} style={{ background: 'none', border: 'none', color: '#9B7450', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F }}>Change photo</button>
                </div>
                <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 14, maxHeight: 180 }}>
                  <img src={decorPhoto.preview} alt="Reference" style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>Description <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
                  <textarea
                    value={decorDesc}
                    onChange={e => setDecorDesc(e.target.value)}
                    placeholder="e.g. Looking for floral arch ideas, pastel colour palette, rustic theme…"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E5D5C0', background: '#FFFEF9', fontFamily: F, fontSize: 13, color: INK, outline: 'none', resize: 'vertical', minHeight: 72, boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { setDecorPopup(false); setDecorPhoto(null); setDecorDesc(''); }}
                    style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid #E5D5C0', background: 'transparent', color: '#9B7450', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDecorSend}
                    disabled={decorSending}
                    style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: decorSending ? '#D4B483' : `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: '#fff', fontSize: 13, fontWeight: 700, cursor: decorSending ? 'not-allowed' : 'pointer', fontFamily: F }}
                  >
                    {decorSending ? 'Sending…' : '📤 Send to Chat'}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ── Invitation Flyer full-screen overlay ── */}
      {inviteOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10001, background: '#000', display: 'flex', flexDirection: 'column' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#2C1A0E', flexShrink: 0 }}>
            <span style={{ color: '#CCAB4A', fontSize: 14, fontWeight: 700, fontFamily: F }}>💌 Create Invitation Flyer</span>
            <button
              onClick={() => setInviteOpen(false)}
              style={{ padding: '7px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F }}
            >
              ✕ Cancel
            </button>
          </div>
          {/* Iframe */}
          <iframe
            src="/invitation/customize"
            style={{ flex: 1, border: 'none', width: '100%' }}
            title="Invitation Flyer Builder"
            allow="clipboard-write"
          />
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: INK }}>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ color: '#9B7450', fontWeight: 500 }}>{label}:</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

// ── Desktop floating "My Event" button (site-wide, bottom-right) ───────────
export function MyEventFloatDesktop() {
  const [plan, setPlan] = useState(null);
  const [modal, setModal] = useState(false);  // null | 'mini' | 'full'
  const reduxFormData = useSelector(s => s.eventPlanning?.formData);

  const HIDE = ['/login', '/signup', '/otp', '/vendor/register', '/booking/payment'];
  const hidden = HIDE.some(p => window.location.pathname.startsWith(p));
  const navigate = (path) => { window.location.href = path; };

  const refresh = useCallback(() => { setPlan(loadPlan()); }, []);

  useEffect(() => { refresh(); }, [reduxFormData?.eventType, reduxFormData?.date, reduxFormData?.location, refresh]);
  useEffect(() => {
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('tendr:plan-confirmed', refresh);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('tendr:plan-confirmed', refresh); };
  }, [refresh]);

  if (!plan || hidden) return null;

  const isDraft = plan._draft === true;
  const hasChat = !!(plan.conversationId);
  const eventType = plan.eventDetails?.eventType || plan.eventType || 'My Event';
  const eventDate = plan.eventDetails?.date || plan.date || '';
  const daysLeft = eventDate ? Math.ceil((new Date(eventDate) - Date.now()) / 86400000) : null;

  const handleClick = () => setModal(isDraft ? 'mini' : 'full');

  return (
    <>
      {/* Desktop-only floating button */}
      <style>{`
        .my-event-float { display: none; }
        @media (min-width: 768px) { .my-event-float { display: flex !important; } }
      `}</style>

      <button
        className="my-event-float"
        onClick={handleClick}
        style={{
          position: 'fixed', bottom: 88, right: 24, zIndex: 8900,
          alignItems: 'center', gap: 10,
          padding: '10px 18px 10px 14px',
          borderRadius: 100,
          border: 'none',
          background: isDraft
            ? 'linear-gradient(135deg,#B45309,#C47A2E)'
            : 'linear-gradient(135deg,#2C1A0E,#4A2810)',
          color: '#fff',
          fontSize: 13, fontWeight: 700,
          fontFamily: F,
          cursor: 'pointer',
          boxShadow: isDraft
            ? '0 6px 22px rgba(196,122,46,0.45)'
            : '0 6px 22px rgba(44,26,14,0.45)',
          transition: 'transform 0.18s, box-shadow 0.18s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        {/* Icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          <line x1="9" y1="12" x2="15" y2="12"/>
          <line x1="9" y1="16" x2="12" y2="16"/>
        </svg>
        <span>{isDraft ? 'In Planning…' : eventType}</span>
        {/* Pulse dot */}
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: isDraft ? '#FCD34D' : '#4ade80',
          boxShadow: isDraft ? '0 0 0 3px rgba(252,211,77,0.3)' : '0 0 0 3px rgba(74,222,128,0.3)',
          animation: 'myevent-pulse 2s infinite',
          flexShrink: 0,
        }} />
        <style>{`@keyframes myevent-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.25)} }`}</style>
      </button>

      {/* Mini popup — draft only: just a "Continue Planning" call-to-action */}
      {modal === 'mini' && (
        <div
          onClick={() => setModal(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '0 24px 140px' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: CREAM, borderRadius: 18, padding: '20px 22px',
              boxShadow: '0 16px 48px rgba(44,26,14,0.22)',
              fontFamily: F, width: 260,
              border: '1.5px solid rgba(196,122,46,0.2)',
              animation: 'myevent-pop 0.22s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            <style>{`@keyframes myevent-pop { from{opacity:0;transform:scale(0.9) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }`}</style>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 18 }}>📋</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>Planning in progress</div>
                <div style={{ fontSize: 11, color: '#9B7450' }}>{eventType || 'Your event'}</div>
              </div>
            </div>
            <button
              onClick={() => { setModal(false); navigate('/plan-event/form'); }}
              style={{ width: '100%', padding: '11px 0', borderRadius: 12, background: GOLD, color: '#fff', fontSize: 13.5, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(196,122,46,0.3)' }}
            >
              Continue Planning →
            </button>
          </div>
        </div>
      )}

      {/* Full modal — post-chat state */}
      {modal === 'full' && (
        <PlanSummaryModal
          plan={plan}
          daysLeft={daysLeft}
          isDraft={isDraft}
          onClose={() => setModal(false)}
          onDismiss={() => {
            try { localStorage.removeItem('tendr_smart_plan'); localStorage.removeItem('tendr_ep_session'); } catch {}
            setPlan(null); setModal(false);
          }}
          navigate={navigate}
        />
      )}
    </>
  );
}
