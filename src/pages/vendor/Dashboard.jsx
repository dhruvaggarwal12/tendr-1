import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/authSlice';
import VendorAvailabilityCalendar from '../../components/VendorAvailabilityCalendar';
import logo from '../../assets/logos/tendr-logo-secondary.png';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const BASE = BASE_URL; // alias
const font = "'Outfit', sans-serif";
const gold = '#C47A2E';
const goldLt = '#CCAB4A';
const ink = '#2C1A0E';
const cream = '#FFFCF5';

// Decode vendorId from JWT without library
const parseJwt = (t) => { try { return JSON.parse(atob(t.split('.')[1])); } catch { return {}; } };

const authHeaders = (token) => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

// ── Color helpers ──────────────────────────────────────────────────────────────
const STATUS_COLOR = {
  Pending:   { bg: '#FEF9C3', color: '#92400E', dot: '#F59E0B' },
  Confirmed: { bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
  Completed: { bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  Cancelled: { bg: '#FEE2E2', color: '#991B1B', dot: '#EF4444' },
};
const PAY_COLOR = {
  Pending: '#D97706',
  Partial: '#7C3AED',
  Paid:    '#16A34A',
};
const dsic = (d) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>;
const SOURCE_ICON = {
  WhatsApp:  dsic(<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>),
  Instagram: dsic(<><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>),
  Facebook:  dsic(<><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></>),
  Referral:  dsic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>),
  'Walk-in': dsic(<><circle cx="12" cy="5" r="1"/><path d="m9 20 3-3 1.5 3"/><path d="m6 8 3 1.5L12 8l1.5 4-3 3"/><path d="M18 14v-4"/></>),
  Phone:     dsic(<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>),
  Other:     dsic(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>),
};

// ── Stat tile ──────────────────────────────────────────────────────────────────
function Stat({ label, value, sub, icon, accent }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 12px rgba(196,122,46,0.08)', border: '1px solid rgba(196,122,46,0.12)', flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: ink, lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: '#9B7450', marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: accent || 'rgba(196,122,46,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      </div>
    </div>
  );
}

// ── Outside Order Form Modal ───────────────────────────────────────────────────
const EVENT_TYPES = ['Birthday', '1st Birthday', 'Baby Shower', 'Anniversary', 'Wedding', 'Engagement', 'Housewarming', 'Graduation', 'Puja/Religious', 'Corporate', 'Office Party', 'Get-together', 'Other'];
const SOURCES = ['WhatsApp', 'Instagram', 'Facebook', 'Referral', 'Walk-in', 'Phone', 'Other'];
const STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

const BLANK_FORM = { clientName: '', clientPhone: '', clientEmail: '', eventType: '', eventDate: '', amount: '', paidAmount: '', source: 'WhatsApp', status: 'Pending', notes: '' };

function OrderModal({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial || BLANK_FORM);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const payStatus = form.amount && Number(form.paidAmount) >= Number(form.amount) ? 'Paid'
    : Number(form.paidAmount) > 0 ? 'Partial' : 'Pending';

  const inp = (style) => ({ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid rgba(196,122,46,0.25)', fontFamily: font, fontSize: 13.5, color: ink, outline: 'none', background: '#FFFCF5', boxSizing: 'border-box', ...style });
  const lbl = { display: 'block', fontSize: 11.5, fontWeight: 700, color: '#6B3A1F', marginBottom: 4 };
  const row = { display: 'flex', gap: 12 };
  const half = { flex: 1, minWidth: 0 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(28,9,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 540, background: cream, borderRadius: 20, boxShadow: '0 24px 60px rgba(0,0,0,0.22)', fontFamily: font, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid rgba(196,122,46,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: ink }}>{initial ? 'Edit Order' : 'Add Outside Order'}</div>
            <div style={{ fontSize: 12, color: '#9B7450', marginTop: 2 }}>Log a booking received outside Tendr</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(196,122,46,0.1)', border: 'none', cursor: 'pointer', fontSize: 17, color: '#9B7450', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Form */}
        <div style={{ overflowY: 'auto', padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Source chips */}
          <div>
            <label style={lbl}>Where did this booking come from?</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {SOURCES.map(s => (
                <button key={s} onClick={() => set('source', s)}
                  style={{ padding: '5px 12px', borderRadius: 100, fontSize: 12.5, fontWeight: 600, fontFamily: font, cursor: 'pointer', border: '1.5px solid', transition: 'all 0.15s',
                    borderColor: form.source === s ? gold : 'rgba(196,122,46,0.22)',
                    background: form.source === s ? gold : 'transparent',
                    color: form.source === s ? '#fff' : '#9B7450' }}>
                  {SOURCE_EMOJI[s]} {s}
                </button>
              ))}
            </div>
          </div>

          <div style={row}>
            <div style={half}>
              <label style={lbl}>Client Name *</label>
              <input style={inp()} value={form.clientName} onChange={e => set('clientName', e.target.value)} placeholder="e.g. Priya Sharma" />
            </div>
            <div style={half}>
              <label style={lbl}>Phone / WhatsApp</label>
              <input style={inp()} value={form.clientPhone} onChange={e => set('clientPhone', e.target.value)} placeholder="10-digit number" type="tel" />
            </div>
          </div>

          <div style={row}>
            <div style={half}>
              <label style={lbl}>Event Type</label>
              <select style={inp()} value={form.eventType} onChange={e => set('eventType', e.target.value)}>
                <option value="">Select event</option>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={half}>
              <label style={lbl}>Event Date</label>
              <input style={inp()} type="date" value={form.eventDate} onChange={e => set('eventDate', e.target.value)} />
            </div>
          </div>

          <div style={row}>
            <div style={half}>
              <label style={lbl}>Total Amount (₹)</label>
              <input style={inp()} type="number" min="0" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="0" />
            </div>
            <div style={half}>
              <label style={lbl}>Paid So Far (₹)</label>
              <input style={inp()} type="number" min="0" value={form.paidAmount} onChange={e => set('paidAmount', e.target.value)} placeholder="0" />
            </div>
          </div>

          {/* Payment status preview */}
          {(form.amount || form.paidAmount) ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 9, background: 'rgba(196,122,46,0.06)', border: '1px solid rgba(196,122,46,0.15)' }}>
              <span style={{ fontSize: 12, color: '#9B7450' }}>Payment status:</span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: PAY_COLOR[payStatus] }}>{payStatus}</span>
              {form.amount && form.paidAmount && Number(form.amount) > 0 && (
                <span style={{ fontSize: 11, color: '#9B7450', marginLeft: 4 }}>
                  (₹{Number(form.paidAmount).toLocaleString('en-IN')} / ₹{Number(form.amount).toLocaleString('en-IN')})
                </span>
              )}
            </div>
          ) : null}

          <div>
            <label style={lbl}>Status</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {STATUSES.map(s => {
                const c = STATUS_COLOR[s];
                const active = form.status === s;
                return (
                  <button key={s} onClick={() => set('status', s)}
                    style={{ flex: 1, padding: '7px 4px', borderRadius: 9, fontSize: 12, fontWeight: 700, fontFamily: font, cursor: 'pointer', border: '1.5px solid', transition: 'all 0.15s',
                      borderColor: active ? c.dot : 'rgba(196,122,46,0.15)',
                      background: active ? c.bg : 'transparent',
                      color: active ? c.color : '#9B7450' }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={lbl}>Notes (optional)</label>
            <textarea style={{ ...inp(), height: 72, resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Theme preference, venue, special requests…" />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 22px 18px', borderTop: '1px solid rgba(196,122,46,0.1)', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid rgba(196,122,46,0.25)', background: 'transparent', color: '#9B7450', fontFamily: font, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onSave(form)} disabled={saving || !form.clientName.trim()}
            style={{ flex: 2, padding: '11px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${gold},${goldLt})`, color: '#fff', fontFamily: font, fontSize: 13.5, fontWeight: 800, cursor: saving || !form.clientName.trim() ? 'default' : 'pointer', opacity: saving || !form.clientName.trim() ? 0.6 : 1, boxShadow: '0 3px 12px rgba(196,122,46,0.35)' }}>
            {saving ? 'Saving…' : initial ? 'Save Changes' : '+ Add Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Booking card (Tendr) ───────────────────────────────────────────────────────
function BookingCard({ b }) {
  const sc = STATUS_COLOR[b.status] || STATUS_COLOR.Pending;
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(196,122,46,0.12)', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${gold},${goldLt})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
        {b.customerName?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: ink, fontSize: 14 }}>{b.customerName || 'Customer'}</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: sc.bg, color: sc.color }}>{b.status}</span>
        </div>
        <div style={{ fontSize: 12, color: '#9B7450', marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: '2px 10px' }}>
          {b.eventType && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{dsic(<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>)}{b.eventType}</span>}
          {b.eventDate && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{dsic(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>)}{new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
          {b.guestCount && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{dsic(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>)}{b.guestCount}</span>}
        </div>
      </div>
      {b.amount != null && <div style={{ fontWeight: 800, color: ink, fontSize: 15, flexShrink: 0 }}>₹{b.amount.toLocaleString('en-IN')}</div>}
    </div>
  );
}

// ── Outside order card ─────────────────────────────────────────────────────────
function OutsideOrderCard({ order, onEdit, onDelete, onStatus }) {
  const sc = STATUS_COLOR[order.status] || STATUS_COLOR.Pending;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(196,122,46,0.12)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Source badge */}
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(196,122,46,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B7450', flexShrink: 0 }}>
          {SOURCE_ICON[order.source] || dsic(<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: ink, fontSize: 14 }}>{order.clientName}</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: sc.bg, color: sc.color }}>{order.status}</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'rgba(196,122,46,0.08)', color: '#9B7450' }}>{order.source}</span>
          </div>
          <div style={{ fontSize: 12, color: '#9B7450', marginTop: 3, display: 'flex', flexWrap: 'wrap', gap: '2px 12px' }}>
            {order.clientPhone && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{dsic(<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></>)}{order.clientPhone}</span>}
            {order.eventType   && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{dsic(<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>)}{order.eventType}</span>}
            {order.eventDate   && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{dsic(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>)}{new Date(order.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
          </div>
          {order.notes && <div style={{ fontSize: 12, color: '#9B7450', marginTop: 4, fontStyle: 'italic' }}>"{order.notes}"</div>}
        </div>

        {/* Amount + menu */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          {order.amount > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: ink, fontSize: 15 }}>₹{order.amount.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: PAY_COLOR[order.paymentStatus] || '#9B7450' }}>{order.paymentStatus}</div>
              {order.paymentStatus === 'Partial' && (
                <div style={{ fontSize: 10, color: '#9B7450' }}>₹{(order.paidAmount || 0).toLocaleString('en-IN')} paid</div>
              )}
            </div>
          )}
          {/* Kebab menu */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(m => !m)}
              style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid rgba(196,122,46,0.2)', background: 'transparent', cursor: 'pointer', fontSize: 16, color: '#9B7450', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⋮</button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: 32, right: 0, background: '#fff', borderRadius: 12, boxShadow: '0 8px 28px rgba(0,0,0,0.14)', border: '1px solid rgba(196,122,46,0.15)', zIndex: 50, minWidth: 160, padding: '6px 0', fontFamily: font }}>
                <button onClick={() => { onEdit(order); setMenuOpen(false); }}
                  style={{ width: '100%', padding: '8px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 600, color: ink, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit</button>
                {STATUSES.filter(s => s !== order.status).map(s => (
                  <button key={s} onClick={() => { onStatus(order._id, s); setMenuOpen(false); }}
                    style={{ width: '100%', padding: '8px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 600, color: STATUS_COLOR[s].color, cursor: 'pointer' }}>
                    → Mark {s}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid rgba(196,122,46,0.1)', margin: '4px 0' }} />
                <button onClick={() => { onDelete(order._id); setMenuOpen(false); }}
                  style={{ width: '100%', padding: '8px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>Delete</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function VendorDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.auth);

  // Derive vendorId from user or JWT
  const jwt = parseJwt(token || '');
  const vendorId = user?._id || user?.id || jwt.vendorId;
  const vendorName = user?.name || 'Vendor';
  const initial = vendorName.charAt(0).toUpperCase();

  const [tab, setTab] = useState('overview');
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Data
  const [bookings, setBookings]       = useState([]);
  const [outsideOrders, setOutside]   = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [outsideLoading, setOL]       = useState(false);

  // Outside order modal
  const [modal, setModal]             = useState(null); // null | 'add' | order object
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState(null);

  // Outside orders tab filters
  const [oFilter, setOFilter]         = useState('all');
  const [oSearch, setOSearch]         = useState('');

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // Click-outside for profile menu
  useEffect(() => {
    const h = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Load Tendr bookings
  useEffect(() => {
    fetch(`${BASE}/vendor/bookings`, { credentials: 'include', headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.ok ? r.json() : { data: [] })
      .then(d => setBookings(Array.isArray(d) ? d : d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  // Load outside orders
  const loadOutside = () => {
    if (!token) return;
    setOL(true);
    fetch(`${BASE}/vendors/outside-orders`, { headers: authHeaders(token) })
      .then(r => r.ok ? r.json() : { orders: [] })
      .then(d => setOutside(d.orders || []))
      .catch(() => {})
      .finally(() => setOL(false));
  };

  useEffect(() => { loadOutside(); }, [token]); // eslint-disable-line

  // Derived stats
  const tendrCount     = bookings.length;
  const outsideCount   = outsideOrders.length;
  const outsideRevenue = outsideOrders.reduce((s, o) => s + (o.amount || 0), 0);
  const outsideCollected = outsideOrders.reduce((s, o) => s + (o.paidAmount || 0), 0);
  const pendingCount   = outsideOrders.filter(o => o.status === 'Pending').length;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthOutside = outsideOrders.filter(o => new Date(o.createdAt) >= monthStart).length;
  const thisMonthRevenue = outsideOrders.filter(o => new Date(o.createdAt) >= monthStart).reduce((s, o) => s + (o.amount || 0), 0);

  // Outside orders: filter + search
  const visibleOutside = outsideOrders
    .filter(o => oFilter === 'all' || o.status === oFilter)
    .filter(o => !oSearch || o.clientName?.toLowerCase().includes(oSearch.toLowerCase()) || o.eventType?.toLowerCase().includes(oSearch.toLowerCase()) || o.clientPhone?.includes(oSearch));

  // ── API actions ──────────────────────────────────────────────────────────────
  const saveOrder = async (form) => {
    if (!token) return;
    setSaving(true);
    try {
      const isEdit = modal && typeof modal === 'object' && modal._id;
      const url  = isEdit ? `${BASE}/vendors/outside-orders/${modal._id}` : `${BASE}/vendors/outside-orders`;
      const method = isEdit ? 'PATCH' : 'POST';
      const r = await fetch(url, { method, headers: authHeaders(token), body: JSON.stringify(form) });
      if (!r.ok) { const e = await r.json(); throw new Error(e.error || 'Failed'); }
      const d = await r.json();
      if (isEdit) setOutside(os => os.map(o => o._id === modal._id ? d.order : o));
      else setOutside(os => [d.order, ...os]);
      setModal(null);
      showToast(isEdit ? 'Order updated!' : 'Order added!');
    } catch (e) {
      showToast(e.message || 'Failed to save order', false);
    } finally {
      setSaving(false);
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      const r = await fetch(`${BASE}/vendors/outside-orders/${id}`, { method: 'DELETE', headers: authHeaders(token) });
      if (!r.ok) throw new Error();
      setOutside(os => os.filter(o => o._id !== id));
      showToast('Order deleted');
    } catch {
      showToast('Failed to delete', false);
    }
  };

  const setOrderStatus = async (id, status) => {
    try {
      const r = await fetch(`${BASE}/vendors/outside-orders/${id}`, { method: 'PATCH', headers: authHeaders(token), body: JSON.stringify({ status }) });
      if (!r.ok) throw new Error();
      const d = await r.json();
      setOutside(os => os.map(o => o._id === id ? d.order : o));
      showToast(`Marked ${status}`);
    } catch {
      showToast('Failed to update status', false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  const TABS = [
    { key: 'overview',  label: 'Overview' },
    { key: 'bookings',  label: `Tendr Bookings${tendrCount ? ` (${tendrCount})` : ''}` },
    { key: 'outside',   label: `Outside Orders${outsideCount ? ` (${outsideCount})` : ''}` },
    { key: 'avail',     label: 'Availability' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: font }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, padding: '12px 20px', borderRadius: 12, background: toast.ok ? '#166534' : '#991B1B', color: '#fff', fontSize: 14, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', transition: 'all 0.2s' }}>
          {toast.ok ? '✓' : '✕'} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(196,122,46,0.12)', padding: '0 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src={logo} alt="Tendr" style={{ height: 36, cursor: 'pointer' }} onClick={() => navigate('/')} />
            <div style={{ width: 1, height: 20, background: 'rgba(196,122,46,0.2)' }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: ink }}>Vendor Dashboard</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/vendor/chats')}
              style={{ padding: '7px 14px', borderRadius: 9, border: '1.5px solid rgba(196,122,46,0.25)', background: 'transparent', color: gold, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
              💬 Chats
            </button>
            <button onClick={() => navigate('/')}
              style={{ padding: '7px 14px', borderRadius: 9, border: '1.5px solid rgba(196,122,46,0.25)', background: 'transparent', color: '#9B7450', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
              View Site
            </button>
            {/* Avatar */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button onClick={() => setProfileOpen(p => !p)}
                style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${gold},${goldLt})`, border: 'none', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {initial}
              </button>
              {profileOpen && (
                <div style={{ position: 'absolute', top: 44, right: 0, background: '#fff', borderRadius: 14, boxShadow: '0 8px 28px rgba(0,0,0,0.14)', border: '1px solid rgba(196,122,46,0.14)', zIndex: 200, minWidth: 180, padding: '8px 0', fontFamily: font }}>
                  <div style={{ padding: '8px 16px 10px', borderBottom: '1px solid rgba(196,122,46,0.1)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>{vendorName}</div>
                    {user?.phoneNumber && <div style={{ fontSize: 11, color: '#9B7450' }}>{user.phoneNumber}</div>}
                  </div>
                  <button onClick={() => { navigate('/vendor/profile'); setProfileOpen(false); }}
                    style={{ width: '100%', padding: '9px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 600, color: ink, cursor: 'pointer', fontFamily: font }}>
                    ✏️ Edit Profile
                  </button>
                  <button onClick={() => dispatch(logout()).then(() => navigate('/'))}
                    style={{ width: '100%', padding: '9px 16px', border: 'none', background: 'none', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#DC2626', cursor: 'pointer', fontFamily: font }}>
                    → Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 4, paddingBottom: 0 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '10px 16px', border: 'none', background: 'transparent', fontFamily: font, fontSize: 13, fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? gold : '#9B7450', cursor: 'pointer', borderBottom: tab === t.key ? `2.5px solid ${gold}` : '2.5px solid transparent', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 48px' }}>

        {/* ── Overview ── */}
        {tab === 'overview' && (
          <>
            {/* Welcome */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: ink }}>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {vendorName.split(' ')[0]}</div>
              <div style={{ fontSize: 13.5, color: '#9B7450', marginTop: 3 }}>Here's your business at a glance.</div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
              <Stat label="Tendr Orders"   value={tendrCount}   sub="via platform"          icon={dsic(<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>)} />
              <Stat label="Outside Orders" value={outsideCount} sub={`${pendingCount} pending`} icon={dsic(<><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>)} accent="rgba(124,58,237,0.1)" />
              <Stat label="Total Revenue"  value={`₹${(outsideRevenue).toLocaleString('en-IN')}`} sub={`₹${outsideCollected.toLocaleString('en-IN')} collected`} icon={dsic(<><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>)} accent="rgba(22,163,74,0.1)" />
              <Stat label="This Month"     value={thisMonthOutside} sub={`₹${thisMonthRevenue.toLocaleString('en-IN')} revenue`} icon={dsic(<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>)} accent="rgba(59,130,246,0.1)" />
            </div>

            {/* Two-column */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              {/* Recent Tendr bookings */}
              <div style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', border: '1px solid rgba(196,122,46,0.12)', boxShadow: '0 2px 12px rgba(196,122,46,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: ink }}>Tendr Bookings</div>
                  <button onClick={() => setTab('bookings')} style={{ fontSize: 12, fontWeight: 600, color: gold, background: 'none', border: 'none', cursor: 'pointer', fontFamily: font }}>View all →</button>
                </div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#9B7450', fontSize: 13 }}>Loading…</div>
                ) : bookings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center', color: '#C47A2E', opacity: 0.45 }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div>
                    <div style={{ fontSize: 13, color: '#9B7450' }}>No Tendr bookings yet</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {bookings.slice(0, 4).map((b, i) => <BookingCard key={b.id || b._id || i} b={b} />)}
                  </div>
                )}
              </div>

              {/* Recent outside orders */}
              <div style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', border: '1px solid rgba(196,122,46,0.12)', boxShadow: '0 2px 12px rgba(196,122,46,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: ink }}>Outside Orders</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setModal('add')} style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: `linear-gradient(135deg,${gold},${goldLt})`, border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontFamily: font }}>+ Add</button>
                    <button onClick={() => setTab('outside')} style={{ fontSize: 12, fontWeight: 600, color: gold, background: 'none', border: 'none', cursor: 'pointer', fontFamily: font }}>View all →</button>
                  </div>
                </div>
                {outsideLoading ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: '#9B7450', fontSize: 13 }}>Loading…</div>
                ) : outsideOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center', color: '#7C3AED', opacity: 0.45 }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
                    <div style={{ fontSize: 13, color: '#9B7450', marginBottom: 10 }}>No outside orders yet</div>
                    <button onClick={() => setModal('add')}
                      style={{ padding: '8px 18px', borderRadius: 9, border: `1.5px solid ${gold}`, background: 'transparent', color: gold, fontFamily: font, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                      + Log your first order
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {outsideOrders.slice(0, 4).map(o => (
                      <OutsideOrderCard key={o._id} order={o} onEdit={setModal} onDelete={deleteOrder} onStatus={setOrderStatus} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', border: '1px solid rgba(196,122,46,0.12)', marginTop: 20, boxShadow: '0 2px 12px rgba(196,122,46,0.06)' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: ink, marginBottom: 14 }}>Quick Actions</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                  { label: '+ Log Outside Order', sub: 'Add a booking from WhatsApp/Instagram', onClick: () => setModal('add'), primary: true },
                  { label: 'View Chats',       sub: 'Manage Tendr customer conversations', onClick: () => navigate('/vendor/chats') },
                  { label: 'All Bookings',     sub: 'See all Tendr platform bookings',    onClick: () => setTab('bookings') },
                  { label: 'Set Availability', sub: "Block dates you're busy",            onClick: () => setTab('avail') },
                  { label: 'Edit Profile',     sub: 'Update your portfolio & info',       onClick: () => navigate('/vendor/profile') },
                ].map(a => (
                  <button key={a.label} onClick={a.onClick}
                    style={{ flex: '1 1 180px', padding: '13px 16px', borderRadius: 12, border: a.primary ? 'none' : '1.5px solid rgba(196,122,46,0.18)', background: a.primary ? `linear-gradient(135deg,${gold},${goldLt})` : '#FFFCF5', color: a.primary ? '#fff' : ink, textAlign: 'left', cursor: 'pointer', fontFamily: font, boxShadow: a.primary ? '0 3px 12px rgba(196,122,46,0.3)' : 'none', transition: 'all 0.15s' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{a.label}</div>
                    <div style={{ fontSize: 11.5, opacity: 0.75 }}>{a.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Tendr Bookings tab ── */}
        {tab === 'bookings' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: ink }}>Tendr Bookings</div>
                <div style={{ fontSize: 13, color: '#9B7450' }}>Orders placed through the Tendr platform</div>
              </div>
              <button onClick={() => navigate('/vendor/bookings')}
                style={{ padding: '8px 16px', borderRadius: 10, border: `1.5px solid ${gold}`, background: 'transparent', color: gold, fontFamily: font, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Full Bookings Page →
              </button>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9B7450' }}>Loading bookings…</div>
            ) : bookings.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 18, padding: '60px', textAlign: 'center', border: '1px solid rgba(196,122,46,0.12)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: ink, marginBottom: 6 }}>No bookings yet</div>
                <div style={{ fontSize: 13, color: '#9B7450' }}>When customers book you on Tendr, they'll appear here.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bookings.map((b, i) => <BookingCard key={b.id || b._id || i} b={b} />)}
              </div>
            )}
          </div>
        )}

        {/* ── Outside Orders tab ── */}
        {tab === 'outside' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: ink }}>Outside Orders</div>
                <div style={{ fontSize: 13, color: '#9B7450' }}>Bookings from WhatsApp, Instagram, referrals & more</div>
              </div>
              <button onClick={() => setModal('add')}
                style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${gold},${goldLt})`, color: '#fff', fontFamily: font, fontSize: 13.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 12px rgba(196,122,46,0.35)' }}>
                + Add Order
              </button>
            </div>

            {/* Stats summary */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
              {[['All', outsideOrders.length], ['Pending', outsideOrders.filter(o=>o.status==='Pending').length], ['Confirmed', outsideOrders.filter(o=>o.status==='Confirmed').length], ['Completed', outsideOrders.filter(o=>o.status==='Completed').length]].map(([s, n]) => n > 0 && (
                <button key={s} onClick={() => setOFilter(s === 'All' ? 'all' : s)}
                  style={{ padding: '6px 14px', borderRadius: 100, fontSize: 12.5, fontWeight: 700, fontFamily: font, cursor: 'pointer', border: '1.5px solid',
                    borderColor: (oFilter === s || (s==='All' && oFilter==='all')) ? gold : 'rgba(196,122,46,0.2)',
                    background:  (oFilter === s || (s==='All' && oFilter==='all')) ? gold : '#fff',
                    color:       (oFilter === s || (s==='All' && oFilter==='all')) ? '#fff' : '#9B7450' }}>
                  {s} <span style={{ opacity: 0.75 }}>({n})</span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ marginBottom: 16 }}>
              <input value={oSearch} onChange={e => setOSearch(e.target.value)} placeholder="Search by name, event type, or phone…"
                style={{ width: '100%', maxWidth: 380, padding: '9px 14px', borderRadius: 10, border: '1.5px solid rgba(196,122,46,0.22)', fontFamily: font, fontSize: 13.5, color: ink, outline: 'none', background: '#fff', boxSizing: 'border-box' }} />
            </div>

            {outsideLoading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9B7450' }}>Loading…</div>
            ) : visibleOutside.length === 0 ? (
              <div style={{ background: '#fff', borderRadius: 18, padding: '60px', textAlign: 'center', border: '1px solid rgba(196,122,46,0.12)' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: ink, marginBottom: 8 }}>
                  {outsideOrders.length === 0 ? 'No outside orders yet' : 'No orders match this filter'}
                </div>
                {outsideOrders.length === 0 && (
                  <>
                    <div style={{ fontSize: 13, color: '#9B7450', marginBottom: 16 }}>Log bookings you received via WhatsApp, Instagram, referrals, or walk-ins to track your full revenue.</div>
                    <button onClick={() => setModal('add')}
                      style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg,${gold},${goldLt})`, color: '#fff', fontFamily: font, fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
                      + Log Your First Order
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {visibleOutside.map(o => (
                  <OutsideOrderCard key={o._id} order={o} onEdit={setModal} onDelete={deleteOrder} onStatus={setOrderStatus} />
                ))}
              </div>
            )}

            {/* Revenue summary */}
            {outsideOrders.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', border: '1px solid rgba(196,122,46,0.12)', marginTop: 20, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div><div style={{ fontSize: 11, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Revenue</div><div style={{ fontSize: 20, fontWeight: 800, color: ink }}>₹{outsideRevenue.toLocaleString('en-IN')}</div></div>
                <div><div style={{ fontSize: 11, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Collected</div><div style={{ fontSize: 20, fontWeight: 800, color: '#16A34A' }}>₹{outsideCollected.toLocaleString('en-IN')}</div></div>
                <div><div style={{ fontSize: 11, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pending</div><div style={{ fontSize: 20, fontWeight: 800, color: '#D97706' }}>₹{(outsideRevenue - outsideCollected).toLocaleString('en-IN')}</div></div>
              </div>
            )}
          </div>
        )}

        {/* ── Availability tab ── */}
        {tab === 'avail' && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: ink }}>Manage Availability</div>
              <div style={{ fontSize: 13, color: '#9B7450', marginTop: 3 }}>Block dates you're booked. Customers will see your availability on your profile before reaching out. Each day has Morning (10AM–2PM) and Evening (4PM–9PM) slots.</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 18, padding: '20px', border: '1px solid rgba(196,122,46,0.12)' }}>
              <VendorAvailabilityCalendar vendorId={vendorId} isVendorView token={token} />
            </div>
          </div>
        )}
      </div>

      {/* Outside Order Modal */}
      {modal && (
        <OrderModal
          initial={modal === 'add' ? null : { ...modal, eventDate: modal.eventDate ? new Date(modal.eventDate).toISOString().split('T')[0] : '', amount: modal.amount || '', paidAmount: modal.paidAmount || '' }}
          onSave={saveOrder}
          onClose={() => setModal(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
