import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logos/tendr-logo-secondary.png';

const font = "'Outfit', sans-serif";
const gold = '#C47A2E';
const goldLt = '#CCAB4A';
const ink = '#2C1A0E';
const cream = '#FFFCF5';
const muted = '#9B7450';
const border = 'rgba(196,122,46,0.15)';
const bg = '#FAF7F2';

// ── Simple-mode step illustrations ──────────────────────────────────────────
function LoginVisual() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 72, height: 120, borderRadius: 16, background: '#1C0E04', border: '3px solid #3B3028', padding: '10px 8px', boxSizing: 'border-box', position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 24, height: 4, borderRadius: 2, background: '#3B3028', margin: '0 auto 8px' }} />
        <div style={{ background: '#FFF8EC', borderRadius: 8, padding: '6px 6px', height: 80, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: gold, textAlign: 'center' }}>Tendr</div>
          <div style={{ height: 16, borderRadius: 4, background: 'rgba(196,122,46,0.12)', border: '1px solid rgba(196,122,46,0.2)' }} />
          <div style={{ display: 'flex', gap: 3 }}>
            {[0,1,2,3,4,5].map(i => <div key={i} style={{ flex: 1, height: 14, borderRadius: 3, background: i < 4 ? gold : 'rgba(196,122,46,0.12)' }} />)}
          </div>
          <div style={{ height: 16, borderRadius: 5, background: `linear-gradient(90deg,${gold},${goldLt})`, marginTop: 4 }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-start' }}>
        <div style={{ fontSize: 11, color: muted, fontWeight: 600 }}>
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: gold, color: '#fff', fontSize: 9, fontWeight: 800, textAlign: 'center', lineHeight: '16px', marginRight: 5 }}>1</span>
          Go to tendr.in
        </div>
        <div style={{ fontSize: 11, color: muted, fontWeight: 600 }}>
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: gold, color: '#fff', fontSize: 9, fontWeight: 800, textAlign: 'center', lineHeight: '16px', marginRight: 5 }}>2</span>
          Tap Vendor Login
        </div>
        <div style={{ fontSize: 11, color: muted, fontWeight: 600 }}>
          <span style={{ display: 'inline-block', width: 16, height: 16, borderRadius: '50%', background: gold, color: '#fff', fontSize: 9, fontWeight: 800, textAlign: 'center', lineHeight: '16px', marginRight: 5 }}>3</span>
          Enter OTP from SMS
        </div>
      </div>
    </div>
  );
}

function OverviewVisual() {
  const tiles = [
    { label: 'Tendr Orders', val: '12', color: '#3B82F6' },
    { label: 'Outside Orders', val: '8', color: '#7C3AED' },
    { label: 'Revenue', val: '₹48K', color: '#16A34A' },
    { label: 'This Month', val: '5', color: gold },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: '100%' }}>
      {tiles.map(t => (
        <div key={t.label} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', border: `1.5px solid ${t.color}20` }}>
          <div style={{ width: 20, height: 4, borderRadius: 2, background: t.color, marginBottom: 6, opacity: 0.6 }} />
          <div style={{ fontSize: 20, fontWeight: 800, color: ink, lineHeight: 1 }}>{t.val}</div>
          <div style={{ fontSize: 10, color: muted, marginTop: 3 }}>{t.label}</div>
        </div>
      ))}
    </div>
  );
}

function OutsideOrderVisual() {
  return (
    <div style={{ width: '100%', background: '#fff', borderRadius: 12, padding: '12px 14px', border: `1px solid ${border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: ink }}>Outside Orders</div>
        <div style={{ padding: '4px 10px', borderRadius: 6, background: `linear-gradient(90deg,${gold},${goldLt})`, fontSize: 11, fontWeight: 700, color: '#fff' }}>+ Log Order</div>
      </div>
      {[
        { name: 'Ravi Kumar', event: 'Birthday', amt: '₹8,000', status: 'Confirmed', dot: '#22C55E' },
        { name: 'Priya S.', event: 'Wedding', amt: '₹25,000', status: 'Pending', dot: '#F59E0B' },
      ].map(o => (
        <div key={o.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid rgba(196,122,46,0.07)` }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: o.dot, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: ink }}>{o.name}</div>
            <div style={{ fontSize: 10, color: muted }}>{o.event}</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: gold }}>{o.amt}</div>
        </div>
      ))}
    </div>
  );
}

function CalendarVisual() {
  const days = ['M','T','W','T','F','S','S'];
  const blocked = [3, 6, 10, 11];
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
        {days.map((d,i) => <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: muted, paddingBottom: 4 }}>{d}</div>)}
        {Array.from({ length: 14 }, (_, i) => {
          const isBlocked = blocked.includes(i + 1);
          return (
            <div key={i} style={{ aspectRatio: '1', borderRadius: 6, background: isBlocked ? '#FEE2E2' : '#fff', border: `1px solid ${isBlocked ? '#EF4444' : border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: isBlocked ? 700 : 500, color: isBlocked ? '#991B1B' : ink }}>
              {i + 1}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8, justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: '#FEE2E2', border: '1px solid #EF4444' }} /><span style={{ fontSize: 10, color: muted }}>Blocked</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: '#fff', border: `1px solid ${border}` }} /><span style={{ fontSize: 10, color: muted }}>Free</span></div>
      </div>
    </div>
  );
}

function ChatVisual() {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        { name: 'Anjali M.', msg: 'Hi, I need a decorator for my daughters birthday', time: '10:32 AM', unread: true },
        { name: 'Rohit P.', msg: 'Can you do a 100 person event?', time: '9:15 AM', unread: false },
      ].map(c => (
        <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 12, padding: '10px 12px', border: `1px solid ${border}` }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${gold},${goldLt})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800, flexShrink: 0 }}>{c.name[0]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: ink }}>{c.name}</span>
              <span style={{ fontSize: 10, color: muted }}>{c.time}</span>
            </div>
            <div style={{ fontSize: 11, color: muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.msg}</div>
          </div>
          {c.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: gold, flexShrink: 0 }} />}
        </div>
      ))}
    </div>
  );
}

function ProfileVisual() {
  return (
    <div style={{ width: '100%', background: '#fff', borderRadius: 12, padding: '12px 14px', border: `1px solid ${border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg,${gold},${goldLt})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 800 }}>D</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: ink }}>Dream Decorators</div>
          <div style={{ fontSize: 11, color: gold, fontWeight: 600 }}>Decorator · Delhi NCR</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4, marginBottom: 8 }}>
        {['🎂','🎈','✨','🎊','🎁','📸'].map((e,i) => (
          <div key={i} style={{ aspectRatio: '1', borderRadius: 8, background: i === 0 ? `linear-gradient(135deg,${gold}22,${goldLt}22)` : 'rgba(196,122,46,0.04)', border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{e}</div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: muted, textAlign: 'center' }}>Tap any photo to replace it</div>
    </div>
  );
}

// ── Step data ────────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: 1,
    color: '#3B82F6',
    title: 'Open your dashboard',
    simple: 'Go to tendr.in on your phone or computer. Tap "Vendor Login" at the top. Enter your phone number, then the 4-digit code sent by SMS.',
    tip: 'Save "tendr.in/vendor/dashboard" as a bookmark so you can open it with one tap next time.',
    Visual: LoginVisual,
  },
  {
    num: 2,
    color: gold,
    title: 'See your business at a glance',
    simple: 'The first screen shows all your orders and money. Big numbers = your totals. Each box shows a different part of your business.',
    tip: 'Green dot = Confirmed booking. Yellow = Waiting. Blue = Finished job.',
    Visual: OverviewVisual,
  },
  {
    num: 3,
    color: '#7C3AED',
    title: 'Add orders from WhatsApp or phone',
    simple: 'Got a booking from WhatsApp, a call, or a walk-in customer? Tap "Outside Orders" tab, then the yellow "+ Log Order" button. Fill in customer name, event type, and the amount. Tap Save.',
    tip: 'This lets you track ALL your money in one place — not just Tendr orders. Very useful for income records.',
    Visual: OutsideOrderVisual,
  },
  {
    num: 4,
    color: '#16A34A',
    title: 'Block dates you are not free',
    simple: 'Tap "Availability" tab at the top. Tap on any date you\'re busy. Choose Morning, Evening, or both. Tendr will not show you as available on those days to customers.',
    tip: 'Always block the day before a big event too — you\'ll need setup time.',
    Visual: CalendarVisual,
  },
  {
    num: 5,
    color: '#25D366',
    title: 'Reply to customer messages',
    simple: 'Tap "Chats" button at the top right. You\'ll see all customers who messaged you from Tendr. Tap any name to read their message and reply.',
    tip: 'Reply within 1 hour. Customers are 3× more likely to book you if you reply fast.',
    Visual: ChatVisual,
  },
  {
    num: 6,
    color: '#EC4899',
    title: 'Update your photos and prices',
    simple: 'Tap your name or icon at the top right corner, then tap "Edit Profile". Here you can add photos of your work, update your price, and write about what you do.',
    tip: 'Vendors with 8+ photos get many more customer inquiries. Add your best photos first.',
    Visual: ProfileVisual,
  },
];

// ── Pro feature cards ────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    color: '#3B82F6',
    title: 'Overview Dashboard',
    path: 'overview tab',
    items: [
      'Four stat tiles: Tendr Orders, Outside Orders, Total Revenue, This Month',
      'Side-by-side recent cards: Tendr Bookings + Outside Orders',
      'Quick Actions row for common tasks — add order, chats, availability',
    ],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    color: gold,
    title: 'Tendr Bookings',
    path: 'bookings tab',
    items: [
      'All platform-sourced bookings with full event details',
      'Status pipeline: Pending → Confirmed → Completed → Cancelled',
      'Guest count, date, occasion type, customer notes per booking',
    ],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
    color: '#7C3AED',
    title: 'Outside Orders CRM',
    path: 'outside orders tab',
    items: [
      'Log bookings from WhatsApp, Instagram, Facebook, Referral, Walk-in, Phone, Other',
      'Full CRUD with inline status updates (Pending/Confirmed/Completed/Cancelled)',
      'Revenue dashboard: total billed, collected, pending split',
      'Search by client name or phone; filter by status chip',
    ],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    color: '#16A34A',
    title: 'Availability Calendar',
    path: 'availability tab',
    items: [
      'Block Morning (10 AM–2 PM) or Evening (4–9 PM) slots per calendar day',
      'Blocked slots are removed from customer-facing booking flows automatically',
      'Monthly view with color-coded available/blocked indicators',
    ],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    color: '#25D366',
    title: 'Customer Chats',
    path: 'chats (top bar button)',
    items: [
      'All Tendr customer conversations in a unified inbox',
      'Timestamps, read indicators, message history per thread',
      'Direct navigation from dashboard header or quick actions',
    ],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    color: '#EC4899',
    title: 'Profile & Portfolio',
    path: 'avatar → Edit Profile',
    items: [
      'Upload portfolio photos, set cover image, write service description',
      'Set starting price, service areas, and specialisations',
      'Add bank details for Tendr payment disbursements',
    ],
  },
];

const TIPS = [
  { icon: '⚡', title: 'Set availability first', body: 'Block your busy dates before accepting new leads to prevent double-bookings.' },
  { icon: '📊', title: 'Log every order', body: 'Outside Orders isn\'t just a CRM — it\'s your revenue dashboard. Log all sources for an accurate picture.' },
  { icon: '🖼️', title: 'Add 8–10 portfolio photos', body: 'Vendors with full portfolios appear higher in search and get significantly more inquiries.' },
  { icon: '⏱️', title: 'Reply within 1 hour', body: 'Tendr boosts fast-responding vendors in search. Set a phone notification for new chats.' },
  { icon: '🗺️', title: 'Fill all service areas', body: 'Customers search by city. If a city isn\'t listed, you won\'t appear in their results.' },
  { icon: '💰', title: 'Track payment status', body: 'Use Paid / Partial / Pending on each order to know exactly how much is still outstanding.' },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function HowToUse() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('simple');
  const [expandedTip, setExpandedTip] = useState(null);

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: font }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${border}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', height: 58, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => navigate('/vendor/dashboard')}
              style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${border}`, background: cream, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: muted, fontSize: 16, flexShrink: 0 }}>
              ←
            </button>
            <img src={logo} alt="Tendr" style={{ height: 30 }} />
            <div style={{ width: 1, height: 18, background: border }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: ink }}>Vendor Guide</span>
          </div>
          <a href="https://wa.me/919999999999?text=Hi%2C+I+need+help+with+the+Tendr+vendor+dashboard"
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, background: '#25D366', color: '#fff', fontSize: 12.5, fontWeight: 700, textDecoration: 'none', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.942-1.42A9.959 9.959 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.952 7.952 0 01-4.065-1.112l-.29-.173-3.013.866.847-3.093-.19-.307A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
            Need help?
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px 64px' }}>

        {/* Hero */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: gold, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 8 }}>Tendr Vendor Dashboard</div>
          <h1 style={{ fontFamily: font, fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 800, color: ink, lineHeight: 1.1, margin: '0 0 10px', letterSpacing: '-0.02em' }}>
            How to use<br/>your dashboard
          </h1>
          <p style={{ fontSize: 14.5, color: muted, margin: 0, lineHeight: 1.6, maxWidth: 480 }}>
            Manage all your bookings, track earnings, and stay available — in one place.
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: 'inline-flex', background: '#fff', borderRadius: 14, border: `1.5px solid ${border}`, padding: 5, gap: 4, marginBottom: 32 }}>
          {[
            { key: 'simple', label: '📖 Step by Step', sub: 'New to apps' },
            { key: 'pro',    label: '⚡ Quick Overview', sub: 'Tech-savvy' },
          ].map(m => (
            <button key={m.key} onClick={() => setMode(m.key)}
              style={{
                padding: '10px 20px', borderRadius: 10, border: 'none',
                background: mode === m.key ? `linear-gradient(135deg,${gold},${goldLt})` : 'transparent',
                color: mode === m.key ? '#fff' : muted,
                fontFamily: font, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.18s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              }}>
              <span>{m.label}</span>
              <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.78 }}>{m.sub}</span>
            </button>
          ))}
        </div>

        {/* ── SIMPLE MODE ── */}
        {mode === 'simple' && (
          <div>
            {/* Intro banner */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '16px 18px', border: `1px solid ${border}`, marginBottom: 24, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>👋</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: ink, marginBottom: 4 }}>Don't worry — it's very simple</div>
                <div style={{ fontSize: 13.5, color: muted, lineHeight: 1.6 }}>Follow the steps below, one at a time. Each step has a picture to help you. If you get stuck, tap "Need help?" at the top to WhatsApp us.</div>
              </div>
            </div>

            {/* Steps */}
            {STEPS.map((step, idx) => (
              <div key={step.num} style={{ marginBottom: 20 }}>
                {/* Step card */}
                <div style={{ background: '#fff', borderRadius: 20, border: `1.5px solid ${border}`, overflow: 'hidden', boxShadow: '0 2px 14px rgba(196,122,46,0.07)' }}>
                  {/* Color bar */}
                  <div style={{ height: 4, background: `linear-gradient(90deg,${step.color},${step.color}88)` }} />

                  <div style={{ padding: '18px 20px' }}>
                    {/* Step number + title */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{step.num}</span>
                      </div>
                      <div style={{ fontSize: 'clamp(15px,3.5vw,18px)', fontWeight: 800, color: ink, lineHeight: 1.2 }}>{step.title}</div>
                    </div>

                    {/* Visual */}
                    <div style={{ background: bg, borderRadius: 14, padding: '18px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
                      <step.Visual />
                    </div>

                    {/* Instruction */}
                    <p style={{ fontSize: 15, color: ink, lineHeight: 1.7, margin: '0 0 12px' }}>{step.simple}</p>

                    {/* Tip */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: `rgba(196,122,46,0.07)`, borderRadius: 12, padding: '12px 14px', border: `1px solid rgba(196,122,46,0.18)` }}>
                      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>💡</span>
                      <p style={{ fontSize: 13, color: muted, margin: 0, lineHeight: 1.6, fontWeight: 600 }}>{step.tip}</p>
                    </div>
                  </div>
                </div>

                {/* Connector arrow */}
                {idx < STEPS.length - 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', color: 'rgba(196,122,46,0.3)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" opacity="0.4" aria-hidden="true">
                      <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}

            {/* Done! banner */}
            <div style={{ background: `linear-gradient(135deg,${gold},${goldLt})`, borderRadius: 20, padding: '24px 22px', marginTop: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>You're all set!</div>
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.88)', margin: '0 0 18px', lineHeight: 1.6 }}>
                You now know everything you need to manage your business on Tendr. Go to your dashboard and get started!
              </p>
              <button onClick={() => navigate('/vendor/dashboard')}
                style={{ padding: '13px 28px', borderRadius: 12, border: 'none', background: '#fff', color: gold, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: font }}>
                Open My Dashboard →
              </button>
            </div>

            {/* Help section */}
            <div style={{ marginTop: 20, background: '#fff', borderRadius: 18, padding: '20px 20px', border: `1px solid ${border}` }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: ink, marginBottom: 4 }}>Still have questions?</div>
              <p style={{ fontSize: 13.5, color: muted, margin: '0 0 16px', lineHeight: 1.6 }}>We're always happy to help. Reach us on WhatsApp or call us directly.</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="https://wa.me/919999999999?text=Hi%2C+I+need+help+with+the+Tendr+vendor+dashboard"
                  target="_blank" rel="noopener noreferrer"
                  style={{ flex: '1 1 180px', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderRadius: 12, background: '#25D366', color: '#fff', textDecoration: 'none' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.942-1.42A9.959 9.959 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.952 7.952 0 01-4.065-1.112l-.29-.173-3.013.866.847-3.093-.19-.307A7.957 7.957 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>WhatsApp Support</div>
                    <div style={{ fontSize: 11, opacity: 0.85 }}>Tap to message us now</div>
                  </div>
                </a>
                <a href="tel:+919999999999"
                  style={{ flex: '1 1 140px', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', borderRadius: 12, border: `1.5px solid ${border}`, background: cream, color: ink, textDecoration: 'none' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>Call Us</div>
                    <div style={{ fontSize: 11, color: muted }}>+91 99999 99999</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── PRO MODE ── */}
        {mode === 'pro' && (
          <div>
            {/* Quick-start checklist */}
            <div style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', border: `1px solid ${border}`, marginBottom: 24, boxShadow: '0 2px 12px rgba(196,122,46,0.07)' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: ink, marginBottom: 14 }}>⚡ Quick-start checklist</div>
              {[
                { label: 'Complete your profile — photos, price, service areas', path: '/vendor/profile' },
                { label: 'Block any unavailable dates in Availability tab', path: null, tab: 'avail' },
                { label: 'Log your existing outside orders (WhatsApp, phone)', path: null, tab: 'outside' },
                { label: 'Reply to any pending customer chats', path: '/vendor/chats' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: i < 3 ? `1px solid rgba(196,122,46,0.07)` : 'none' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid rgba(196,122,46,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(196,122,46,0.15)' }} />
                  </div>
                  <span style={{ fontSize: 13.5, color: ink, flex: 1 }}>{item.label}</span>
                  {item.path && (
                    <button onClick={() => navigate(item.path)} style={{ fontSize: 11.5, fontWeight: 700, color: gold, background: 'none', border: 'none', cursor: 'pointer', fontFamily: font, flexShrink: 0 }}>Go →</button>
                  )}
                </div>
              ))}
            </div>

            {/* Feature grid */}
            <div style={{ fontSize: 11, fontWeight: 800, color: muted, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 14 }}>All Features</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 28 }}>
              {FEATURES.map(f => (
                <div key={f.title} style={{ background: '#fff', borderRadius: 18, padding: '18px 20px', border: `1.5px solid rgba(196,122,46,0.12)`, boxShadow: '0 2px 10px rgba(196,122,46,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: `${f.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, flexShrink: 0 }}>
                      {f.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: ink, lineHeight: 1.2 }}>{f.title}</div>
                      <div style={{ fontSize: 11, color: f.color, fontWeight: 600, marginTop: 2 }}>→ {f.path}</div>
                    </div>
                  </div>
                  <ul style={{ margin: 0, padding: '0 0 0 4px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {f.items.map((item, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12.5, color: muted, lineHeight: 1.5 }}>
                        <span style={{ color: f.color, fontWeight: 700, fontSize: 14, lineHeight: '19px', flexShrink: 0 }}>·</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Power tips */}
            <div style={{ fontSize: 11, fontWeight: 800, color: muted, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 14 }}>Power Tips</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
              {TIPS.map((t, i) => (
                <button key={i} onClick={() => setExpandedTip(expandedTip === i ? null : i)}
                  style={{ textAlign: 'left', padding: '14px 18px', borderRadius: 14, border: `1.5px solid ${expandedTip === i ? gold : border}`, background: expandedTip === i ? 'rgba(196,122,46,0.05)' : '#fff', cursor: 'pointer', fontFamily: font, transition: 'all 0.18s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{t.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: expandedTip === i ? gold : ink, flex: 1 }}>{t.title}</span>
                    <span style={{ color: muted, fontSize: 14, transform: expandedTip === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>▾</span>
                  </div>
                  {expandedTip === i && (
                    <p style={{ fontSize: 13.5, color: muted, margin: '10px 0 0 30px', lineHeight: 1.6 }}>{t.body}</p>
                  )}
                </button>
              ))}
            </div>

            {/* Go to dashboard CTA */}
            <div style={{ background: `linear-gradient(135deg,${ink},#3B2010)`, borderRadius: 18, padding: '22px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Ready to dive in?</div>
                <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)' }}>Your dashboard is waiting — all features, live data.</div>
              </div>
              <button onClick={() => navigate('/vendor/dashboard')}
                style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg,${gold},${goldLt})`, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: font, boxShadow: `0 4px 16px rgba(196,122,46,0.4)`, flexShrink: 0 }}>
                Open Dashboard →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
