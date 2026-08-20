import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useChatOverlay } from '../../context/ChatContext';
import { getSmartPlanById } from '../../apis/vendorApi';

// Reads the form session written by eventPlanningSlice every time a field changes
function loadDraftFromSession() {
  try {
    const raw = localStorage.getItem('tendr_ep_session');
    if (!raw) return null;
    const s = JSON.parse(raw);
    const fd = s.formData || {};
    if (!fd.eventType && !fd.date && !fd.location) return null; // nothing meaningful yet
    return {
      _draft: true,
      eventDetails: {
        eventType: fd.eventType,
        date: fd.date,
        location: fd.location,
        guests: fd.guests,
        budget: fd.budget,
        extraRequirements: fd.extraRequirements || [],
      },
      vendorSlots: (s.selectedVendors || []).map(cat => ({
        category: cat, vendorName: '', estimatedCost: 0, status: 'Pending',
      })),
      conversationId: null,
    };
  } catch { return null; }
}

const font = "'Outfit', sans-serif";
const gold = '#C47A2E';
const goldLt = '#CCAB4A';
const ink = '#2C1A0E';
const cream = '#FFFCF5';

const HUB_ROUTES = {
  'Birthday':          '/birthday-hub',
  '1st Birthday':      '/birthday-hub',
  'Anniversary':       '/anniversary-hub',
  'Baby Shower':       '/baby-shower-hub',
  'Housewarming':      '/housewarming-hub',
  'Get-together':      '/get-together-hub',
  'Kitty Party':       '/kitty-party-hub',
  'Naming Ceremony':   '/naming-ceremony-hub',
  'House Party':       '/house-party',
  'Party':             '/house-party',
};

const CAT_ICON = {
  Caterer: '🍽', Photographer: '📸', Decorator: '🎀', DJ: '🎵',
  Venue: '🏛', AV: '🎤', Entertainment: '🎭', Transport: '🚌', Gifts: '🎁',
};

const VENDOR_STATUSES = [
  { key: 'Pending',       bg: '#FEF9C3', color: '#92400E', dot: '#F59E0B' },
  { key: 'In Discussion', bg: '#EDE9FE', color: '#4C1D95', dot: '#7C3AED' },
  { key: 'Confirmed',     bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
  { key: 'Cancelled',     bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
];
const STATUS_STYLE = Object.fromEntries(VENDOR_STATUSES.map(s => [s.key, s]));

function buildTasks(eventDetails, vendorSlots) {
  const cats = (vendorSlots || []).map(s => s.category);
  const isCorp = /corporate|conference|offsite|launch/i.test(eventDetails?.eventType || '');
  const tasks = [
    ...(isCorp ? [{ id: 'approval', label: 'Get management / finance approval on budget', cat: 'Planning' }] : []),
    { id: 'budget_lock',    label: 'Set & lock total event budget',               cat: 'Planning' },
    { id: 'venue_confirm',  label: 'Confirm venue & logistics',                   cat: 'Planning' },
    ...cats.map(c => ({ id: `vendor_${c}`, label: `Book ${c.toLowerCase()} vendor`, cat: 'Vendors' })),
    { id: 'invites',        label: 'Send invitations to guests',                  cat: 'Guests' },
    { id: 'rsvp',           label: 'Collect RSVPs & confirm final headcount',     cat: 'Guests' },
    ...(cats.includes('Caterer') ? [{ id: 'caterer_count', label: 'Share final headcount with caterer', cat: 'Vendors' }] : []),
    ...(isCorp        ? [{ id: 'runsheet',   label: 'Prepare formal event run-of-show document', cat: 'Planning' }] : []),
    { id: 'schedule',       label: 'Share event run-sheet with all vendors',      cat: 'Vendors' },
    { id: 'payments',       label: 'Clear all outstanding vendor payments',       cat: 'Finance' },
    { id: 'setup_times',    label: 'Confirm setup & arrival times with each vendor', cat: 'Vendors' },
    ...(isCorp        ? [{ id: 'transport',  label: 'Arrange employee transportation & parking', cat: 'Logistics' }] : []),
    { id: 'arrival',        label: 'Verify all vendor arrivals on event day',     cat: 'Day Of' },
    { id: 'brief_team',     label: 'Brief internal team / volunteers',            cat: 'Day Of' },
    ...(cats.includes('AV') || isCorp ? [{ id: 'av_check', label: 'Test AV equipment & presentation setup', cat: 'Day Of' }] : []),
    { id: 'feedback',       label: 'Collect feedback from guests after event',    cat: 'Post Event' },
  ];
  return tasks;
}

function ic(d) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
  );
}

export default function MyEvent() {
  const navigate = useNavigate();
  const { openConciergeChat } = useChatOverlay();
  const { token } = useSelector(s => s.auth);

  const [plan, setPlan] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tendr_smart_plan') || 'null')
        || loadDraftFromSession();
    } catch { return loadDraftFromSession(); }
  });
  const isDraft = plan?._draft === true;

  // Fetch live plan status from backend (if we have a real plan ID)
  useEffect(() => {
    if (!plan?._id) return;
    getSmartPlanById(plan._id)
      .then(({ plan: live }) => {
        if (!live) return;
        // Merge live vendorSlots statuses into the stored plan
        const merged = {
          ...plan,
          vendorSlots: (plan.vendorSlots || []).map(slot => {
            const liveSlot = (live.vendorSlots || []).find(s => s.category === slot.category);
            return liveSlot ? { ...slot, status: liveSlot.status || slot.status } : slot;
          }),
          _liveStatus: live.status || plan._liveStatus,
        };
        setPlan(merged);
        try { localStorage.setItem('tendr_smart_plan', JSON.stringify({ ...merged, _draft: undefined })); } catch {}
      })
      .catch(() => {});
  }, [plan?._id]);

  const planKey = plan?.conversationId || plan?._id || 'default';

  const [vendorStatuses, setVendorStatuses] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`tendr_vs_${planKey}`) || '{}'); } catch { return {}; }
  });
  const [paidAmounts, setPaidAmounts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`tendr_pa_${planKey}`) || '{}'); } catch { return {}; }
  });
  const [tasksDone, setTasksDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`tendr_tasks_${planKey}`) || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    try { localStorage.setItem(`tendr_vs_${planKey}`, JSON.stringify(vendorStatuses)); } catch {}
  }, [vendorStatuses, planKey]);
  useEffect(() => {
    try { localStorage.setItem(`tendr_pa_${planKey}`, JSON.stringify(paidAmounts)); } catch {}
  }, [paidAmounts, planKey]);
  useEffect(() => {
    try { localStorage.setItem(`tendr_tasks_${planKey}`, JSON.stringify(tasksDone)); } catch {}
  }, [tasksDone, planKey]);

  const eventDetails  = plan?.eventDetails  || {};
  const vendorSlots   = plan?.vendorSlots   || [];
  const convId        = plan?.conversationId || null;

  const daysUntil = useMemo(() => {
    if (!eventDetails.date) return null;
    return Math.ceil((new Date(eventDetails.date + 'T00:00:00') - new Date()) / 86400000);
  }, [eventDetails.date]);

  const totalBudget    = Number(eventDetails.budget) || 0;
  const committed      = vendorSlots.reduce((s, v) => s + (Number(v.estimatedCost) || 0), 0);
  const totalPaid      = Object.values(paidAmounts).reduce((s, v) => s + (Number(v) || 0), 0);
  const remaining      = totalBudget - committed;
  const committedPct   = totalBudget > 0 ? Math.min(100, Math.round((committed / totalBudget) * 100)) : 0;
  const paidPct        = totalBudget > 0 ? Math.min(100, Math.round((totalPaid / totalBudget) * 100)) : 0;
  const confirmedCount = vendorSlots.filter(s => (vendorStatuses[s.category] || s.status || 'Pending') === 'Confirmed').length;

  const tasks    = useMemo(() => buildTasks(eventDetails, vendorSlots), [eventDetails.eventType, vendorSlots.length]);
  const taskCats = useMemo(() => [...new Set(tasks.map(t => t.cat))], [tasks]);
  const doneCount = tasks.filter(t => tasksDone[t.id]).length;

  const eventDateFmt = eventDetails.date
    ? new Date(eventDetails.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Date TBD';

  if (!plan) {
    return (
      <div style={{ minHeight: '100dvh', background: '#FAF7F2', fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 32, maxWidth: 340 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📋</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: ink, marginBottom: 8 }}>No event in progress</h2>
          <p style={{ fontSize: 14, color: '#9B7450', marginBottom: 28, lineHeight: 1.6 }}>
            Start filling the event form and your planning dashboard will appear here automatically.
          </p>
          <button onClick={() => navigate('/booking')}
            style={{ padding: '13px 32px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${gold},${goldLt})`, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: font, boxShadow: '0 4px 16px rgba(196,122,46,0.3)' }}>
            Start Planning →
          </button>
        </div>
      </div>
    );
  }

  const countdownStyle = daysUntil === null ? {} :
    daysUntil <= 3  ? { bg: '#FEE2E2', color: '#991B1B' } :
    daysUntil <= 14 ? { bg: '#FEF9C3', color: '#92400E' } :
                      { bg: '#DCFCE7', color: '#166534' };

  return (
    <div style={{ minHeight: '100dvh', background: '#FAF7F2', fontFamily: font }}>

      {/* ── Sticky Header ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '1px solid rgba(196,122,46,0.12)', boxShadow: '0 2px 8px rgba(196,122,46,0.07)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', height: 56, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate(-1)}
            style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid rgba(196,122,46,0.2)', background: 'transparent', cursor: 'pointer', color: '#9B7450', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
            ←
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {eventDetails.eventType || 'My Event'}
            </div>
            <div style={{ fontSize: 11, color: '#9B7450' }}>{eventDateFmt}</div>
          </div>
          {daysUntil !== null && (
            <div style={{ padding: '4px 11px', borderRadius: 100, fontSize: 11, fontWeight: 800, flexShrink: 0, background: countdownStyle.bg, color: countdownStyle.color }}>
              {daysUntil > 0 ? `${daysUntil}d to go` : daysUntil === 0 ? '🎉 Today!' : 'Event passed'}
            </div>
          )}
          {convId && (
            <button onClick={() => openConciergeChat(convId, false)}
              style={{ padding: '7px 14px', borderRadius: 9, border: 'none', background: `linear-gradient(135deg,${gold},${goldLt})`, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: font, whiteSpace: 'nowrap', flexShrink: 0, boxShadow: '0 2px 8px rgba(196,122,46,0.3)' }}>
              💬 Chat
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px 72px' }}>

        {/* ── Draft banner ── */}
        {isDraft && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(196,122,46,0.07)', border: '1.5px solid rgba(196,122,46,0.22)', borderRadius: 14, marginBottom: 16 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>✏️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>Plan in progress</div>
              <div style={{ fontSize: 11, color: '#9B7450' }}>Finish filling the form and submit to confirm vendors & unlock chat</div>
            </div>
            <button onClick={() => navigate('/plan-event/form')}
              style={{ padding: '7px 14px', borderRadius: 9, border: 'none', background: `linear-gradient(135deg,${gold},${goldLt})`, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: font, whiteSpace: 'nowrap', flexShrink: 0 }}>
              Continue →
            </button>
          </div>
        )}

        {/* ── 4 Stat Tiles ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            {
              label: 'Days Left',
              value: daysUntil !== null ? (daysUntil > 0 ? daysUntil : daysUntil === 0 ? '🎉' : '—') : '—',
              sub: daysUntil !== null && daysUntil > 0 ? `Until ${eventDateFmt}` : daysUntil === 0 ? 'Event is today!' : eventDetails.date ? 'Event has passed' : 'Set date in plan',
              accent: 'rgba(59,130,246,0.08)', valColor: '#1E40AF',
            },
            {
              label: 'Budget Used',
              value: totalBudget ? `${committedPct}%` : '—',
              sub: totalBudget ? `₹${committed.toLocaleString('en-IN')} committed` : 'Set a budget in your plan',
              accent: 'rgba(196,122,46,0.08)', valColor: gold,
            },
            {
              label: 'Vendors Ready',
              value: `${confirmedCount}/${vendorSlots.length}`,
              sub: confirmedCount === vendorSlots.length && vendorSlots.length > 0 ? 'All confirmed ✓' : 'Update status below',
              accent: confirmedCount === vendorSlots.length && vendorSlots.length > 0 ? 'rgba(22,163,74,0.08)' : 'rgba(245,158,11,0.08)',
              valColor: confirmedCount === vendorSlots.length && vendorSlots.length > 0 ? '#166534' : '#92400E',
            },
            {
              label: 'Tasks Done',
              value: `${doneCount}/${tasks.length}`,
              sub: doneCount === tasks.length ? 'All complete 🎯' : `${tasks.length - doneCount} remaining`,
              accent: 'rgba(124,58,237,0.08)', valColor: '#4C1D95',
            },
          ].map(tile => (
            <div key={tile.label} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(196,122,46,0.1)', boxShadow: '0 2px 8px rgba(196,122,46,0.05)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>{tile.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: tile.valColor, lineHeight: 1 }}>{tile.value}</div>
              <div style={{ fontSize: 10.5, color: '#9B7450', marginTop: 4, lineHeight: 1.4 }}>{tile.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Budget Breakdown ── */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', border: '1px solid rgba(196,122,46,0.12)', marginBottom: 16, boxShadow: '0 2px 12px rgba(196,122,46,0.06)' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: ink, marginBottom: 16 }}>Budget Breakdown</div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'Total Budget',  value: totalBudget,                        color: '#9B7450' },
              { label: 'Committed',     value: committed,                           color: gold },
              { label: 'Paid',          value: totalPaid,                           color: '#16A34A' },
              { label: 'Remaining',     value: Math.max(0, remaining),              color: remaining < 0 ? '#DC2626' : '#1E40AF' },
            ].map(b => (
              <div key={b.label} style={{ padding: '10px 14px', borderRadius: 12, background: '#FFFCF5', border: '1px solid rgba(196,122,46,0.1)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{b.label}</div>
                <div style={{ fontSize: 19, fontWeight: 800, color: b.color }}>
                  {b.label === 'Total Budget' && !totalBudget ? '—' : `₹${b.value.toLocaleString('en-IN')}`}
                </div>
              </div>
            ))}
          </div>

          {totalBudget > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ height: 10, background: 'rgba(196,122,46,0.1)', borderRadius: 100, overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: '0 auto 0 0', width: `${committedPct}%`, background: `linear-gradient(90deg,${gold},${goldLt})`, borderRadius: 100, transition: 'width 0.5s ease' }} />
                <div style={{ position: 'absolute', inset: '0 auto 0 0', width: `${paidPct}%`, background: '#16A34A', borderRadius: 100, opacity: 0.75, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 10.5, fontWeight: 600 }}>
                <span style={{ color: gold }}>{committedPct}% committed</span>
                <span style={{ color: '#16A34A' }}>{paidPct}% paid</span>
              </div>
            </div>
          )}

          {vendorSlots.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Per Category — enter paid amount</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {vendorSlots.map(s => {
                  const paid = Number(paidAmounts[s.category]) || 0;
                  const cost = Number(s.estimatedCost) || 0;
                  const pct  = cost > 0 ? Math.min(100, Math.round((paid / cost) * 100)) : 0;
                  return (
                    <div key={s.category} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{CAT_ICON[s.category] || '🏷'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: ink }}>{s.category}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: gold }}>₹{cost.toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ height: 5, background: 'rgba(196,122,46,0.1)', borderRadius: 100 }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: '#16A34A', borderRadius: 100, transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                      <input
                        type="number" min="0" value={paidAmounts[s.category] || ''}
                        onChange={e => setPaidAmounts(p => ({ ...p, [s.category]: e.target.value }))}
                        placeholder="0"
                        style={{ width: 76, padding: '5px 8px', borderRadius: 8, border: '1.5px solid rgba(196,122,46,0.2)', fontFamily: font, fontSize: 12, color: ink, outline: 'none', background: cream, textAlign: 'right', flexShrink: 0 }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Vendor Status Board ── */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', border: '1px solid rgba(196,122,46,0.12)', marginBottom: 16, boxShadow: '0 2px 12px rgba(196,122,46,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: ink }}>Vendor Status</div>
            {convId && (
              <button onClick={() => openConciergeChat(convId, false)}
                style={{ fontSize: 12, fontWeight: 700, color: gold, background: 'none', border: 'none', cursor: 'pointer', fontFamily: font }}>
                Open Team Chat →
              </button>
            )}
          </div>

          {vendorSlots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9B7450', fontSize: 13 }}>
              No vendor slots in this plan
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {vendorSlots.map(s => {
                const status = vendorStatuses[s.category] || s.status || 'Pending';
                const sc     = STATUS_STYLE[status] || STATUS_STYLE.Pending;
                return (
                  <div key={s.category}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: cream, borderRadius: 14, border: `1.5px solid ${sc.dot}33` }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: `${sc.dot}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      {CAT_ICON[s.category] || '🏷'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: ink }}>{s.category}</div>
                      <div style={{ fontSize: 11, color: '#9B7450', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.vendorName || 'No vendor assigned'} · ₹{Number(s.estimatedCost || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <select
                      value={status}
                      onChange={e => setVendorStatuses(p => ({ ...p, [s.category]: e.target.value }))}
                      style={{ padding: '6px 10px', borderRadius: 9, border: `1.5px solid ${sc.dot}`, background: sc.bg, color: sc.color, fontFamily: font, fontSize: 11, fontWeight: 700, cursor: 'pointer', outline: 'none', flexShrink: 0 }}>
                      {VENDOR_STATUSES.map(v => <option key={v.key} value={v.key}>{v.key}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Task Checklist ── */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', border: '1px solid rgba(196,122,46,0.12)', marginBottom: 16, boxShadow: '0 2px 12px rgba(196,122,46,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: ink }}>Event Checklist</div>
            <div style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: doneCount === tasks.length ? 'rgba(22,163,74,0.1)' : 'rgba(196,122,46,0.08)', color: doneCount === tasks.length ? '#166534' : '#9B7450' }}>
              {doneCount}/{tasks.length}
            </div>
          </div>

          {taskCats.map((cat, ci) => (
            <div key={cat} style={{ marginBottom: ci < taskCats.length - 1 ? 18 : 0 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{cat}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {tasks.filter(t => t.cat === cat).map(task => {
                  const done = !!tasksDone[task.id];
                  return (
                    <label key={task.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, background: done ? 'rgba(22,163,74,0.04)' : cream, border: `1px solid ${done ? 'rgba(22,163,74,0.15)' : 'rgba(196,122,46,0.08)'}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                      <input type="checkbox" checked={done} onChange={() => setTasksDone(p => ({ ...p, [task.id]: !p[task.id] }))}
                        style={{ width: 16, height: 16, accentColor: '#16A34A', flexShrink: 0, cursor: 'pointer' }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: done ? '#9B7450' : ink, textDecoration: done ? 'line-through' : 'none', flex: 1, lineHeight: 1.4 }}>
                        {task.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Event Details Card ── */}
        <div style={{ background: 'linear-gradient(135deg,#2C1A0E,#4A2810)', borderRadius: 18, padding: '20px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(204,171,74,0.65)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Event Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
            {[
              { label: 'Event Type', value: eventDetails.eventType },
              { label: 'Date',       value: eventDateFmt },
              { label: 'Location',   value: eventDetails.location },
              { label: 'Guests',     value: eventDetails.guests ? `${eventDetails.guests} people` : null },
              { label: 'Budget',     value: totalBudget ? `₹${totalBudget.toLocaleString('en-IN')}` : null },
            ].filter(d => d.value).map(d => (
              <div key={d.label}>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{d.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.4 }}>{d.value}</div>
              </div>
            ))}
          </div>
          {(eventDetails.extraRequirements?.length > 0) && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Extra Requirements</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {eventDetails.extraRequirements.map(r => (
                  <span key={r} style={{ fontSize: 11, fontWeight: 600, color: '#CCAB4A', background: 'rgba(204,171,74,0.1)', border: '1px solid rgba(204,171,74,0.2)', borderRadius: 100, padding: '3px 10px' }}>{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Party Hub link ── */}
        {(() => {
          const hubPath = HUB_ROUTES[eventDetails.eventType] || '/house-party';
          const hubLabel = HUB_ROUTES[eventDetails.eventType]
            ? `${eventDetails.eventType} Hub`
            : 'Party Hub';
          return (
            <div onClick={() => navigate(hubPath)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: '#fff', borderRadius: 16, border: '1.5px solid rgba(196,122,46,0.15)', marginBottom: 12, cursor: 'pointer', boxShadow: '0 2px 8px rgba(196,122,46,0.06)', transition: 'box-shadow 0.15s' }}
              role="button">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg,${gold},${goldLt})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                🎉
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: ink }}>{hubLabel}</div>
                <div style={{ fontSize: 12, color: '#9B7450', marginTop: 1 }}>Checklists, guest tools, ideas & more for your event</div>
              </div>
              <div style={{ color: '#9B7450', fontSize: 18, flexShrink: 0 }}>→</div>
            </div>
          );
        })()}

        {/* ── CTAs ── */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/booking')}
            style={{ flex: 1, padding: '13px 0', borderRadius: 12, border: `1.5px solid rgba(196,122,46,0.25)`, background: '#fff', color: gold, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
            + New Event
          </button>
          {convId && (
            <button onClick={() => openConciergeChat(convId, false)}
              style={{ flex: 2, padding: '13px 0', borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${gold},${goldLt})`, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: font, boxShadow: '0 4px 16px rgba(196,122,46,0.35)' }}>
              💬 Talk to Tendr Team →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
