import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LS_KEY = 'tendr-ftv-done';

const TOUR_STOPS = [
  {
    icon: '🛍️',
    label: '01 / 04',
    title: 'Book the best vendors',
    subtitle: 'Caterers, decorators, photographers, DJs — browse real reviews, compare packages, and book in minutes.',
    bubble: 'Let me show you around! 👋',
    mockup: 'vendors',
  },
  {
    icon: '📋',
    label: '02 / 04',
    title: 'Plan every detail',
    subtitle: 'Guest list, timeline, budget tracker, and checklist — all in one place, always in sync.',
    bubble: 'Your personal planner ✨',
    mockup: 'planner',
  },
  {
    icon: '🎮',
    label: '03 / 04',
    title: 'Party Hub — guests join live',
    subtitle: 'Everyone joins with a code. Play games together, react, vote, and share moments in real time.',
    bubble: 'The fun part! 🎉',
    mockup: 'hub',
  },
  {
    icon: '✨',
    label: '04 / 04',
    title: 'Tools for every moment',
    subtitle: 'Wishlists, polls, playlists, awards ceremony, photo wall — tools for every kind of celebration.',
    bubble: "You're all set! 🚀",
    mockup: 'tools',
  },
];

const INTENT_OPTIONS = [
  { label: 'Book Vendors',     emoji: '🛍️', path: '/',                desc: 'Find caterers, decorators & more' },
  { label: 'Plan an Occasion', emoji: '📋', path: '/occasion-picker',  desc: 'Start your event planner' },
  { label: 'Party Hub',        emoji: '🎮', path: '/join-room',        desc: 'Join or host a live party' },
  { label: 'Use Tools',        emoji: '✨', path: '/occasion-picker',  desc: 'Polls, wishes, playlists & more' },
  { label: 'Book for Others',  emoji: '🎁', path: '/',                 desc: 'Gift or plan for someone else' },
  { label: 'Just Exploring',   emoji: '👀', path: null,                desc: 'Browse at my own pace' },
];

/* ── Keyframes & global styles ─────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap');

@keyframes ftv-overlay  { from{opacity:0} to{opacity:1} }
@keyframes ftv-cardin   { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes ftv-charin   { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
@keyframes ftv-bubblin  { from{opacity:0;transform:translateY(8px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes ftv-idle     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
@keyframes ftv-wave     { 0%{transform:rotate(0)} 25%{transform:rotate(-38deg)} 55%{transform:rotate(12deg)} 80%{transform:rotate(-18deg)} 100%{transform:rotate(0)} }
@keyframes ftv-celebrate{ 0%,100%{transform:translateY(0) scale(1)} 28%{transform:translateY(-20px) scale(1.07)} 60%{transform:translateY(-7px) scale(1.03)} }
@keyframes ftv-bounce   { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-16px)} 70%{transform:translateY(-5px)} }
@keyframes ftv-spark1   { 0%,100%{opacity:0;transform:scale(0)} 40%{opacity:1;transform:scale(1)} }
@keyframes ftv-spark2   { 0%,100%{opacity:0;transform:scale(0)} 55%{opacity:1;transform:scale(1)} 70%{opacity:0} }
@keyframes ftv-spark3   { 0%,30%{opacity:0;transform:scale(0)} 65%{opacity:1;transform:scale(1)} 100%{opacity:0} }
@keyframes ftv-mockfade { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes ftv-progressfill { from{width:0} to{width:100%} }
@keyframes ftv-pulse    { 0%,100%{box-shadow:0 0 0 0 rgba(196,151,58,0.4)} 50%{box-shadow:0 0 0 8px rgba(196,151,58,0)} }

.ftv-skip {
  position: absolute; top: 20px; right: 24px;
  padding: 8px 18px;
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.6);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.15);
  cursor: pointer; font-size: 13px; font-weight: 600;
  font-family: 'Outfit', sans-serif;
  transition: background 0.2s, color 0.2s;
  z-index: 10;
}
.ftv-skip:hover { background: rgba(255,255,255,0.15); color: #fff; }

.ftv-btn-primary {
  background: linear-gradient(135deg, #C4973A 0%, #9B6E1C 100%);
  color: #fff; height: 46px; border-radius: 23px;
  font-weight: 800; font-size: 15px; letter-spacing: 0.01em;
  border: none; cursor: pointer; flex: 1;
  font-family: 'Outfit', sans-serif;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 16px rgba(196,151,58,0.35);
}
.ftv-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(196,151,58,0.45); }
.ftv-btn-primary:active { transform: translateY(0); }

.ftv-btn-secondary {
  background: transparent;
  border: 1.5px solid rgba(255,255,255,0.18);
  color: rgba(255,255,255,0.65);
  height: 46px; border-radius: 23px;
  font-weight: 700; font-size: 15px;
  cursor: pointer; padding: 0 22px;
  font-family: 'Outfit', sans-serif;
  transition: border-color 0.2s, color 0.2s;
}
.ftv-btn-secondary:hover { border-color: rgba(255,255,255,0.35); color: #fff; }

.ftv-intent-card {
  background: rgba(255,255,255,0.04);
  border: 1.5px solid rgba(255,255,255,0.09);
  border-radius: 16px; padding: 16px 12px;
  cursor: pointer; text-align: center;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
  font-family: 'Outfit', sans-serif;
}
.ftv-intent-card:hover {
  background: rgba(196,151,58,0.1);
  border-color: rgba(196,151,58,0.55);
  transform: translateY(-2px);
}

@media (max-width: 620px) {
  .ftv-layout { flex-direction: column !important; gap: 0 !important; }
  .ftv-char-col { position: fixed !important; bottom: 16px !important; left: 12px !important;
    width: auto !important; flex-direction: row !important; align-items: flex-end !important; gap: 10px !important; }
  .ftv-char-wrap { width: 72px !important; height: 128px !important; }
  .ftv-card { max-height: 80vh; overflow-y: auto; }
  .ftv-mock-area { height: 110px !important; }
  .ftv-intent-grid { grid-template-columns: 1fr 1fr !important; }
}
`;

/* ── Mini visual mockups per tour stop ───────────────────────────────────────── */
function MockVendors() {
  const vendors = [
    { emoji: '📸', name: 'Studio Priya', stars: '★★★★★', price: '₹28K', cat: 'Photography' },
    { emoji: '🎨', name: 'DecoWorld',    stars: '★★★★★', price: '₹42K', cat: 'Decoration' },
    { emoji: '🍽️', name: 'Swad Caterers',stars: '★★★★☆', price: '₹35K', cat: 'Catering' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0', animation: 'ftv-mockfade 0.4s ease-out both' }}>
      {vendors.map((v, i) => (
        <div key={v.name} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.07)', borderRadius: 12,
          padding: '8px 12px',
          border: '1px solid rgba(255,255,255,0.09)',
          animation: `ftv-mockfade 0.4s ease-out ${i * 0.08}s both`,
        }}>
          <div style={{ fontSize: 22, flexShrink: 0 }}>{v.emoji}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1 }}>{v.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2 }}>{v.cat}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ color: '#FFD700', fontSize: 10 }}>{v.stars}</div>
            <div style={{ color: '#C4973A', fontWeight: 700, fontSize: 12 }}>{v.price}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MockPlanner() {
  const items = [
    { done: true,  text: 'Set date & venue' },
    { done: true,  text: 'Guest list (47 / 100)' },
    { done: false, text: 'Book photographer', active: true },
    { done: false, text: 'Finalise catering' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, animation: 'ftv-mockfade 0.4s ease-out both' }}>
      {items.map((it, i) => (
        <div key={it.text} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '7px 12px',
          background: it.active ? 'rgba(196,151,58,0.15)' : 'rgba(255,255,255,0.04)',
          borderRadius: 10,
          border: it.active ? '1px solid rgba(196,151,58,0.4)' : '1px solid rgba(255,255,255,0.07)',
          animation: `ftv-mockfade 0.4s ease-out ${i * 0.07}s both`,
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: 5, flexShrink: 0,
            background: it.done ? '#4ade80' : it.active ? 'rgba(196,151,58,0.3)' : 'rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: '#fff',
          }}>{it.done ? '✓' : ''}</div>
          <span style={{ color: it.done ? 'rgba(255,255,255,0.45)' : '#fff', fontSize: 13, fontWeight: it.active ? 700 : 500,
            textDecoration: it.done ? 'line-through' : 'none' }}>{it.text}</span>
          {it.active && <span style={{ marginLeft: 'auto', fontSize: 10, color: '#C4973A', fontWeight: 700 }}>← Now</span>}
        </div>
      ))}
      <div style={{ marginTop: 4, padding: '0 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Budget used</span>
          <span style={{ color: '#C4973A', fontSize: 11, fontWeight: 700 }}>₹63K / ₹1L</span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
          <div style={{ width: '63%', height: '100%', borderRadius: 3, background: 'linear-gradient(90deg,#C4973A,#FFD700)' }} />
        </div>
      </div>
    </div>
  );
}

function MockHub() {
  const players = ['Priya', 'Rahul', 'Aman', 'Sneha', 'Dev'];
  const games = ['🎮', '🎲', '🃏', '✏️'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'ftv-mockfade 0.4s ease-out both' }}>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
        {players.map((p, i) => (
          <div key={p} style={{
            background: `hsl(${i * 60},60%,30%)`,
            border: `2px solid hsl(${i * 60},60%,50%)`,
            borderRadius: 20, padding: '4px 12px',
            color: '#fff', fontSize: 12, fontWeight: 700,
            animation: `ftv-mockfade 0.4s ease-out ${i * 0.06}s both`,
          }}>{p}</div>
        ))}
        <div style={{
          background: 'rgba(196,151,58,0.2)', border: '2px dashed rgba(196,151,58,0.5)',
          borderRadius: 20, padding: '4px 12px', color: 'rgba(196,151,58,0.8)',
          fontSize: 12, fontWeight: 700,
        }}>+ Join</div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {games.map((g, i) => (
          <div key={g} style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'rgba(255,255,255,0.07)',
            border: '1.5px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
            animation: `ftv-mockfade 0.4s ease-out ${0.2 + i * 0.07}s both`,
          }}>{g}</div>
        ))}
      </div>
      <div style={{
        textAlign: 'center', padding: '6px 0',
        background: 'rgba(196,151,58,0.12)', borderRadius: 10,
        color: '#C4973A', fontSize: 12, fontWeight: 700,
        border: '1px solid rgba(196,151,58,0.25)',
      }}>Room code: PRTY-7283 · 5 players online</div>
    </div>
  );
}

function MockTools() {
  const tools = [
    { emoji: '🎵', label: 'Playlist', color: '#7C3AED' },
    { emoji: '🗳️', label: 'Polls',    color: '#0EA5E9' },
    { emoji: '🏆', label: 'Awards',   color: '#F59E0B' },
    { emoji: '💌', label: 'Wishes',   color: '#EC4899' },
    { emoji: '📸', label: 'Photos',   color: '#10B981' },
    { emoji: '🎯', label: 'Games',    color: '#EF4444' },
  ];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8,
      animation: 'ftv-mockfade 0.4s ease-out both',
    }}>
      {tools.map((t, i) => (
        <div key={t.label} style={{
          background: `${t.color}18`,
          border: `1.5px solid ${t.color}40`,
          borderRadius: 12, padding: '10px 6px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          animation: `ftv-mockfade 0.4s ease-out ${i * 0.06}s both`,
        }}>
          <span style={{ fontSize: 22 }}>{t.emoji}</span>
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 600 }}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

function TourMockup({ type }) {
  if (type === 'vendors') return <MockVendors />;
  if (type === 'planner') return <MockPlanner />;
  if (type === 'hub')     return <MockHub />;
  if (type === 'tools')   return <MockTools />;
  return null;
}

/* ── Character ────────────────────────────────────────────────────────────── */
function TourCharacter({ pose }) {
  const bodyAnim =
    pose === 'idle'      ? 'ftv-idle 2.2s ease-in-out infinite' :
    pose === 'celebrate' ? 'ftv-celebrate 0.85s ease-in-out 1' :
    pose === 'bounce'    ? 'ftv-bounce 0.5s ease-in-out 1' : 'none';

  const rightArmTransform =
    pose === 'point' ? 'rotate(-65deg) translateY(-6px)' : 'rotate(-22deg)';
  const rightArmAnim = pose === 'wave' ? 'ftv-wave 1.1s ease-in-out 1' : 'none';

  return (
    <div className="ftv-char-wrap" style={{ width: 90, height: 160, position: 'relative',
      display: 'flex', flexDirection: 'column', alignItems: 'center', animation: bodyAnim,
      animation: `ftv-charin 0.5s ease-out both, ${bodyAnim}`,
    }}>
      {/* Sparkles */}
      {[
        { top: 0,  right: 2,  size: 7,  color: '#FFD700', anim: 'ftv-spark1 2.4s ease-in-out infinite' },
        { top: 14, right: -4, size: 5,  color: '#FF8E53', anim: 'ftv-spark2 2.8s ease-in-out 0.5s infinite' },
        { top: 5,  right: 16, size: 4,  color: '#C4973A', anim: 'ftv-spark3 3.1s ease-in-out 1s infinite' },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', top: s.top, right: s.right,
          width: s.size, height: s.size, borderRadius: '50%',
          background: s.color, animation: s.anim,
        }} />
      ))}

      {/* Bun */}
      <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)',
        width: 18, height: 18, background: '#2D1000', borderRadius: '50%', zIndex: 4 }} />
      {/* Hair */}
      <div style={{ position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)',
        width: 48, height: 22, background: '#2D1000', borderRadius: '50% 50% 0 0', zIndex: 3 }} />

      {/* Head */}
      <div style={{ position: 'relative', width: 70, height: 70, borderRadius: '50%',
        background: 'linear-gradient(160deg,#F5AF72,#E8924A)', marginTop: 12, zIndex: 5, flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      }}>
        {[{ top: 24, left: 15 }, { top: 24, right: 15 }].map((pos, i) => (
          <div key={i} style={{ position: 'absolute', ...pos, width: 9, height: 11,
            borderRadius: '50%', background: '#2a0e00' }} />
        ))}
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
          width: 20, height: 9, borderRadius: '0 0 12px 12px',
          borderBottom: '2.5px solid #c0622e', background: 'transparent' }} />
        {[{ top: 32, left: 7 }, { top: 32, right: 7 }].map((pos, i) => (
          <div key={i} style={{ position: 'absolute', ...pos, width: 14, height: 8,
            borderRadius: '50%', background: 'rgba(255,80,80,0.28)' }} />
        ))}
      </div>

      {/* Body */}
      <div style={{ position: 'relative', width: 52, height: 68,
        borderRadius: '14px 14px 8px 8px',
        background: 'linear-gradient(160deg,#FF6B6B,#FF8E53)',
        marginTop: 4, zIndex: 5, flexShrink: 0,
        boxShadow: '0 4px 14px rgba(255,100,60,0.3)',
      }}>
        <div style={{ position: 'absolute', top: 8, left: -6, width: 32, height: 7,
          background: 'linear-gradient(90deg,#FFD700,#FFA500)',
          borderRadius: 4, transform: 'rotate(-14deg)', opacity: 0.9 }} />
      </div>

      {/* Left arm */}
      <div style={{ position: 'absolute', bottom: 44, left: 4, width: 13, height: 38,
        borderRadius: 7, background: 'linear-gradient(180deg,#F5AF72,#E8924A)',
        transformOrigin: 'top center', transform: 'rotate(22deg)', zIndex: 4 }} />
      {/* Right arm */}
      <div style={{ position: 'absolute', bottom: 44, right: 4, width: 13, height: 38,
        borderRadius: 7, background: 'linear-gradient(180deg,#F5AF72,#E8924A)',
        transformOrigin: 'top center',
        transform: rightArmTransform,
        animation: rightArmAnim,
        zIndex: 4,
      }} />
    </div>
  );
}

/* ── Speech bubble ────────────────────────────────────────────────────────── */
function Bubble({ text }) {
  return (
    <div key={text} style={{
      position: 'relative', background: '#fff', borderRadius: 14,
      padding: '10px 16px', boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
      color: '#1a0d30', fontWeight: 700, fontSize: 13, lineHeight: 1.35,
      maxWidth: 180, marginBottom: 12, textAlign: 'center',
      animation: 'ftv-bubblin 0.3s ease-out both',
      fontFamily: "'Outfit',sans-serif",
    }}>
      {text}
      <div style={{
        position: 'absolute', bottom: -9, left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
        borderTop: '9px solid #fff',
      }} />
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export default function FirstTimeExperience() {
  const [done, setDone] = useState(() => {
    try { return !!localStorage.getItem(LS_KEY); } catch { return true; }
  });
  const [phase, setPhase]     = useState('tour');   // 'tour' | 'intent'
  const [stop, setStop]       = useState(0);
  const [pose, setPose]       = useState('idle');
  const navigate = useNavigate();

  /* Wave on mount */
  useEffect(() => {
    const t1 = setTimeout(() => setPose('wave'), 300);
    const t2 = setTimeout(() => setPose('point'), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const close = () => {
    try { localStorage.setItem(LS_KEY, '1'); } catch {}
    setDone(true);
  };

  const goIntent = (fromSkip) => {
    if (fromSkip) {
      setPose('bounce');
      setTimeout(() => setPose('idle'), 600);
    } else {
      setPose('celebrate');
      setTimeout(() => setPose('idle'), 900);
    }
    setPhase('intent');
  };

  const handleNext = () => {
    if (stop < TOUR_STOPS.length - 1) {
      setStop(s => s + 1);
      setTimeout(() => setPose('point'), 80);
    } else {
      goIntent(false);
    }
  };

  const handleBack = () => {
    setStop(s => Math.max(0, s - 1));
    setTimeout(() => setPose('point'), 80);
  };

  const handleIntent = (opt) => {
    close();
    if (opt.path) navigate(opt.path);
  };

  if (done) return null;

  const currentStop = TOUR_STOPS[stop];
  const bubbleText  = phase === 'tour' ? currentStop.bubble : 'What brings you here?';

  return (
    <>
      <style>{STYLES}</style>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(8,4,20,0.92)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        animation: 'ftv-overlay 0.35s ease-out',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 16px', fontFamily: "'Outfit',sans-serif",
      }}>
        {/* Skip */}
        {phase === 'tour' && (
          <button className="ftv-skip" onClick={() => goIntent(true)}>Skip tour →</button>
        )}

        {/* Layout */}
        <div className="ftv-layout" style={{
          display: 'flex', flexDirection: 'row',
          alignItems: 'flex-end', gap: 32,
          maxWidth: 740, width: '100%',
        }}>

          {/* Character column */}
          <div className="ftv-char-col" style={{
            width: 130, display: 'flex', flexDirection: 'column',
            alignItems: 'center', flexShrink: 0, paddingBottom: 8,
          }}>
            <Bubble text={bubbleText} />
            <TourCharacter pose={pose} />
          </div>

          {/* Card */}
          <div className="ftv-card" style={{
            flex: 1,
            background: 'linear-gradient(145deg,#13082B 0%,#0A0418 100%)',
            border: '1.5px solid rgba(196,151,58,0.3)',
            borderRadius: 28,
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(196,151,58,0.08)',
            animation: 'ftv-cardin 0.45s cubic-bezier(0.22,1,0.36,1) 0.1s both',
          }}>

            {/* ── Tour card ── */}
            {phase === 'tour' && (
              <>
                {/* Progress bar */}
                <div style={{ display: 'flex', gap: 4, padding: '20px 24px 0' }}>
                  {TOUR_STOPS.map((_, i) => (
                    <div key={i} style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: i <= stop
                        ? 'linear-gradient(90deg,#C4973A,#FFD700)'
                        : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.4s',
                    }} />
                  ))}
                </div>

                {/* Mockup area */}
                <div className="ftv-mock-area" style={{
                  height: 158, padding: '16px 24px 12px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <TourMockup type={currentStop.mockup} />
                </div>

                {/* Content */}
                <div style={{ padding: '20px 24px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 28 }}>{currentStop.icon}</span>
                    <span style={{ color: 'rgba(196,151,58,0.7)', fontSize: 12, fontWeight: 700,
                      letterSpacing: '0.08em', textTransform: 'uppercase' }}>{currentStop.label}</span>
                  </div>
                  <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 900, margin: '0 0 8px', lineHeight: 1.2 }}>
                    {currentStop.title}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, margin: '0 0 22px', lineHeight: 1.65 }}>
                    {currentStop.subtitle}
                  </p>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {stop > 0 && (
                      <button className="ftv-btn-secondary" onClick={handleBack}>← Back</button>
                    )}
                    <button className="ftv-btn-primary" onClick={handleNext}>
                      {stop < TOUR_STOPS.length - 1 ? 'Next →' : 'Finish 🎉'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── Intent picker ── */}
            {phase === 'intent' && (
              <div style={{ padding: '28px 24px 28px' }}>
                <div style={{ textAlign: 'center', marginBottom: 22 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
                  <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 900, margin: '0 0 4px' }}>
                    What do you want to do?
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: 0 }}>
                    We'll take you right there.
                  </p>
                </div>
                <div className="ftv-intent-grid" style={{
                  display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10,
                }}>
                  {INTENT_OPTIONS.map(opt => (
                    <button key={opt.label} className="ftv-intent-card" onClick={() => handleIntent(opt)}>
                      <div style={{ fontSize: 26, marginBottom: 6 }}>{opt.emoji}</div>
                      <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, lineHeight: 1.2, marginBottom: 3 }}>
                        {opt.label}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 10, lineHeight: 1.3 }}>
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
