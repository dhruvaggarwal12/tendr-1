import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const LS_KEY = 'tendr-ftv-done';
const MOBILE_INTRO_KEY = 'tendr_intro_seen';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', sans-serif";

const INTENTS = [
  { label: 'Book Vendors', emoji: '🛍️', path: '/search', desc: 'Caterers, decorators, photographers & more' },
  { label: 'Plan an Occasion', emoji: '📋', path: '/plan', desc: 'Budget, guest list, timelines & checklist' },
  { label: 'Party Hub', emoji: '🎮', path: '/join-room', desc: 'Games & activities for your guests' },
  { label: 'Use Tools', emoji: '✨', path: '/tools', desc: 'Seating chart, budget planner & more' },
  { label: 'Just Exploring', emoji: '👀', path: null, desc: 'Have a look around at my own pace' },
];

const TOUR_STOPS = [
  {
    targetId: 'home-hero',
    title: 'Book verified vendors',
    desc: 'Caterers, decorators, photographers — all verified across Delhi NCR.',
    mood: 'point',
    side: 'bottom',
  },
  {
    targetId: 'home-journal',
    title: 'Read before you spend',
    desc: 'Expert guides that save you money and stress before the big day.',
    mood: 'idle',
    side: 'top',
  },
  {
    targetId: 'home-community',
    title: 'Learn from others',
    desc: 'Real photos and ideas from events just like yours.',
    mood: 'wave',
    side: 'top',
  },
];

const CSS = `
  @keyframes fte-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes fte-celebrate { 0%,100%{transform:translateY(0) scale(1)} 40%{transform:translateY(-9px) scale(1.05)} }
  @keyframes fte-wave { 0%,100%{transform:rotate(-5deg)} 50%{transform:rotate(32deg)} }
  @keyframes fte-sparkle { 0%,100%{opacity:0;transform:scale(0.4)} 50%{opacity:1;transform:scale(1.3)} }
  @keyframes fte-fadein { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fte-spot-in { from{opacity:0} to{opacity:1} }
  .fte-float { animation: fte-float 3s ease-in-out infinite; }
  .fte-celebrate { animation: fte-celebrate 0.85s ease-in-out infinite; }
  .fte-wave-arm { animation: fte-wave 0.75s ease-in-out infinite; transform-origin: 54px 69px; }
  .fte-sp1 { animation: fte-sparkle 1.3s ease-in-out infinite; }
  .fte-sp2 { animation: fte-sparkle 1.3s ease-in-out infinite 0.43s; }
  .fte-sp3 { animation: fte-sparkle 1.3s ease-in-out infinite 0.86s; }
  .fte-fadein { animation: fte-fadein 0.4s ease forwards; }
  .fte-spot-in { animation: fte-spot-in 0.3s ease forwards; }
  .fte-intent-card { transition: background 0.15s, border-color 0.15s, transform 0.12s; }
  .fte-intent-card:hover { transform: translateY(-2px) !important; }
  .fte-intent-card:active { transform: scale(0.97) !important; }
  .fte-ask-yes:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(196,122,46,0.55) !important; }
`;

// ── Mascot SVG ─────────────────────────────────────────────────────────────
function Mascot({ mood = 'idle', size = 110 }) {
  const w = Math.round(size * 0.72);
  const h = size;
  const bodyClass = mood === 'celebrate' ? 'fte-celebrate' : 'fte-float';

  return (
    <div style={{ width: w, height: h, flexShrink: 0, filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.35))' }}>
      <svg viewBox="0 0 80 124" width={w} height={h} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="fte-head" cx="36%" cy="30%" r="62%">
            <stop offset="0%" stopColor="#F9C898" />
            <stop offset="55%" stopColor="#E89050" />
            <stop offset="100%" stopColor="#C06825" />
          </radialGradient>
          <radialGradient id="fte-body" cx="38%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#F0A040" />
            <stop offset="100%" stopColor="#A85818" />
          </radialGradient>
          <radialGradient id="fte-hair" cx="50%" cy="25%" r="60%">
            <stop offset="0%" stopColor="#4A2A10" />
            <stop offset="100%" stopColor="#180A02" />
          </radialGradient>
          <linearGradient id="fte-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F8DC72" />
            <stop offset="100%" stopColor="#C48808" />
          </linearGradient>
          <linearGradient id="fte-arm" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F0A060" />
            <stop offset="100%" stopColor="#C07030" />
          </linearGradient>
          <linearGradient id="fte-red" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E83050" />
            <stop offset="100%" stopColor="#8A0A1E" />
          </linearGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="40" cy="121" rx="19" ry="4" fill="rgba(0,0,0,0.14)" />

        <g className={bodyClass}>
          {/* Saree lower */}
          <ellipse cx="40" cy="98" rx="19" ry="23" fill="url(#fte-body)" />
          <ellipse cx="40" cy="98" rx="19" ry="23" fill="none" stroke="url(#fte-gold)" strokeWidth="1.2" opacity="0.75" />
          {[31, 35, 40, 45, 49].map((x, i) => (
            <line key={i} x1={x} y1={80} x2={x + (x < 40 ? -2 : x > 40 ? 2 : 0)} y2={117}
              stroke="rgba(248,220,114,0.28)" strokeWidth="0.7" />
          ))}

          {/* Torso */}
          <rect x="27" y="63" width="26" height="38" rx="7" fill="url(#fte-red)" />
          <rect x="28" y="64" width="10" height="14" rx="3" fill="rgba(255,255,255,0.1)" />

          {/* Dupatta */}
          <path d="M21 67 Q12 78 10 93 Q9 104 13 110" stroke="#9B1030" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.85" />
          <path d="M21 67 Q12 78 10 93 Q9 104 13 110" stroke="#F05070" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.4" />

          {/* Left arm */}
          <path d="M27 70 Q17 80 15 91" stroke="url(#fte-arm)" strokeWidth="6.5" strokeLinecap="round" fill="none" />
          <circle cx="14" cy="93" r="5" fill="#E89A60" />
          <circle cx="18" cy="87" r="3.2" fill="none" stroke="url(#fte-gold)" strokeWidth="1.6" />
          <circle cx="17" cy="90" r="3" fill="none" stroke="#E83050" strokeWidth="1" />

          {/* Right arm — mood dependent */}
          {mood === 'wave' ? (
            <g className="fte-wave-arm">
              <path d="M53 70 Q63 60 67 50" stroke="url(#fte-arm)" strokeWidth="6.5" strokeLinecap="round" fill="none" />
              <circle cx="68" cy="48" r="5" fill="#E89A60" />
              <circle cx="62" cy="57" r="3.2" fill="none" stroke="url(#fte-gold)" strokeWidth="1.6" />
            </g>
          ) : mood === 'point' ? (
            <g>
              <path d="M53 70 Q63 58 70 46" stroke="url(#fte-arm)" strokeWidth="6.5" strokeLinecap="round" fill="none" />
              <circle cx="70" cy="45" r="4.5" fill="#E89A60" />
              <line x1="72" y1="43" x2="76" y2="35" stroke="#E89A60" strokeWidth="3" strokeLinecap="round" />
              <circle cx="76" cy="34" r="2.2" fill="#E89A60" />
              <circle cx="64" cy="55" r="3.2" fill="none" stroke="url(#fte-gold)" strokeWidth="1.6" />
            </g>
          ) : mood === 'celebrate' ? (
            <g>
              <path d="M53 70 Q63 56 66 44" stroke="url(#fte-arm)" strokeWidth="6.5" strokeLinecap="round" fill="none" />
              <circle cx="66" cy="42" r="5" fill="#E89A60" />
              <circle cx="61" cy="54" r="3.2" fill="none" stroke="url(#fte-gold)" strokeWidth="1.6" />
            </g>
          ) : (
            <g>
              <path d="M53 70 Q63 80 65 91" stroke="url(#fte-arm)" strokeWidth="6.5" strokeLinecap="round" fill="none" />
              <circle cx="65" cy="93" r="5" fill="#E89A60" />
              <circle cx="61" cy="84" r="3.2" fill="none" stroke="url(#fte-gold)" strokeWidth="1.6" />
            </g>
          )}

          {/* Head */}
          <circle cx="40" cy="36" r="22" fill="url(#fte-head)" />
          <ellipse cx="30" cy="40" rx="5.5" ry="3.5" fill="rgba(210,80,40,0.18)" />
          <ellipse cx="50" cy="40" rx="5.5" ry="3.5" fill="rgba(210,80,40,0.18)" />

          {/* Hair + bun */}
          <ellipse cx="40" cy="17" rx="17" ry="12" fill="url(#fte-hair)" />
          <ellipse cx="40" cy="15" rx="15" ry="10" fill="#201008" />
          <circle cx="40" cy="6" r="9" fill="url(#fte-hair)" />
          <circle cx="40" cy="6" r="8" fill="#201008" />
          {/* Maang tikka */}
          <circle cx="40" cy="6" r="3.5" fill="url(#fte-gold)" />
          <circle cx="40" cy="6" r="1.8" fill="#C41E3A" />
          <line x1="40" y1="9.5" x2="40" y2="19" stroke="url(#fte-gold)" strokeWidth="1.2" />
          <circle cx="40" cy="19" r="2.2" fill="url(#fte-gold)" />

          {/* Bindi */}
          <circle cx="40" cy="28" r="2.8" fill="#C41E3A" />
          <circle cx="40" cy="28" r="1.4" fill="#FF6080" />

          {/* Eyes */}
          <ellipse cx="32" cy="36" rx="4.5" ry="5" fill="white" />
          <ellipse cx="48" cy="36" rx="4.5" ry="5" fill="white" />
          <ellipse cx="32.5" cy="36.5" rx="3.1" ry="3.6" fill="#1A0A02" />
          <ellipse cx="48.5" cy="36.5" rx="3.1" ry="3.6" fill="#1A0A02" />
          <circle cx="34" cy="34.8" r="1.3" fill="white" />
          <circle cx="50" cy="34.8" r="1.3" fill="white" />

          {/* Eyebrows */}
          <path d="M27.5 29.5 Q31.5 27.5 36 29.5" stroke="#1A0A02" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M44 29.5 Q48.5 27.5 52.5 29.5" stroke="#1A0A02" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Nose + nose ring */}
          <ellipse cx="40" cy="41" rx="2.2" ry="1.6" fill="rgba(140,60,15,0.28)" />
          <circle cx="42.5" cy="40.5" r="1.8" fill="none" stroke="url(#fte-gold)" strokeWidth="1.1" />

          {/* Mouth */}
          {mood === 'celebrate'
            ? <path d="M33 46 Q40 53 47 46" stroke="#B05820" strokeWidth="2" fill="none" strokeLinecap="round" />
            : <path d="M34 45 Q40 50 46 45" stroke="#B05820" strokeWidth="2" fill="none" strokeLinecap="round" />
          }

          {/* Earrings */}
          {[17, 63].map((cx, i) => (
            <g key={i}>
              <circle cx={cx} cy="37" r="4" fill="url(#fte-gold)" />
              <circle cx={cx} cy="37" r="2.2" fill="#C41E3A" />
              <line x1={cx} y1="41" x2={cx} y2="47" stroke="url(#fte-gold)" strokeWidth="1.3" />
              <circle cx={cx} cy="48" r="3" fill="url(#fte-gold)" />
              <circle cx={cx} cy="48" r="1.5" fill="#C41E3A" />
            </g>
          ))}

          {/* Necklace */}
          <path d="M28 56 Q40 65 52 56" stroke="url(#fte-gold)" strokeWidth="1.6" fill="none" />
          {[33, 40, 47].map((cx, i) => (
            <circle key={i} cx={cx} cy={i === 1 ? 63 : 58} r={i === 1 ? 3 : 2} fill="url(#fte-gold)" />
          ))}

          {/* Celebrate sparkles */}
          {mood === 'celebrate' && (
            <>
              <text className="fte-sp1" x="4" y="22" fontSize="11" textAnchor="middle">✨</text>
              <text className="fte-sp2" x="73" y="16" fontSize="11" textAnchor="middle">🌟</text>
              <text className="fte-sp3" x="71" y="48" fontSize="9" textAnchor="middle">✨</text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}

// ── Phase: Ask tour ────────────────────────────────────────────────────────
function AskTour({ onYes, onNo }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(10,4,0,0.9)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px',
      fontFamily: SANS,
    }}>
      <style>{CSS}</style>
      <div className="fte-fadein" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 380, width: '100%' }}>
        <Mascot mood="wave" size={130} />
        <div style={{ marginTop: 20, textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            fontFamily: SERIF,
            fontSize: 'clamp(1.6rem,4vw,2rem)',
            fontWeight: 400, color: '#F5E6CC', lineHeight: 1.2, marginBottom: 10,
          }}>
            Hey! Welcome to Tendr 👋
          </div>
          <div style={{ fontSize: 14.5, color: 'rgba(245,230,204,0.58)', lineHeight: 1.68 }}>
            Plan your event, book verified vendors, and have fun doing it — all in one place.
            Want a quick tour before you dive in?
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          <button
            className="fte-ask-yes"
            onClick={onYes}
            style={{
              background: 'linear-gradient(135deg, #C47A2E, #E8943F)',
              border: 'none', borderRadius: 100, padding: '15px 28px',
              color: 'white', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', width: '100%', fontFamily: SANS,
              boxShadow: '0 4px 20px rgba(196,122,46,0.45)',
              transition: 'transform 0.12s, box-shadow 0.12s',
            }}
          >
            Yes, show me around! 🗺️
          </button>
          <button
            onClick={onNo}
            style={{
              background: 'rgba(245,230,204,0.07)',
              border: '1px solid rgba(245,230,204,0.18)',
              borderRadius: 100, padding: '14px 28px',
              color: 'rgba(245,230,204,0.7)', fontSize: 14, fontWeight: 500,
              cursor: 'pointer', width: '100%', fontFamily: SANS,
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,230,204,0.12)'; e.currentTarget.style.borderColor = 'rgba(245,230,204,0.32)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,230,204,0.07)'; e.currentTarget.style.borderColor = 'rgba(245,230,204,0.18)'; }}
          >
            Skip — just tell me where to go
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Phase: Spotlight tour ─────────────────────────────────────────────────
function SpotlightTour({ stops, onDone }) {
  const [step, setStep] = useState(0);
  const [spotRect, setSpotRect] = useState(null);
  const [visible, setVisible] = useState(false);
  const stop = stops[step];
  const PAD = 14;

  const captureRect = useCallback(() => {
    const el = document.getElementById(stop.targetId);
    if (!el) {
      if (step < stops.length - 1) setStep(s => s + 1);
      else onDone();
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
      const r = el.getBoundingClientRect();
      setSpotRect(r);
      setVisible(true);
    }, 680);
  }, [step, stop.targetId, stops.length, onDone]);

  useEffect(() => {
    setVisible(false);
    setSpotRect(null);
    captureRect();
  }, [captureRect]);

  const next = () => {
    setVisible(false);
    setTimeout(() => {
      if (step < stops.length - 1) setStep(s => s + 1);
      else onDone();
    }, 200);
  };

  const vw = typeof window !== 'undefined' ? window.innerWidth : 400;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 700;
  const TT_W = Math.min(310, vw - 32);
  const TT_H = 175;
  let tooltipTop = 0;
  let tooltipLeft = 0;

  if (spotRect) {
    tooltipLeft = Math.max(16, Math.min(spotRect.left, vw - TT_W - 16));
    if (stop.side === 'bottom') {
      tooltipTop = Math.min(spotRect.bottom + PAD + 10, vh - TT_H - 16);
    } else {
      tooltipTop = Math.max(16, spotRect.top - PAD - TT_H - 10);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9900, fontFamily: SANS }}>
      <style>{CSS}</style>
      {/* Blocks page interaction */}
      <div style={{ position: 'fixed', inset: 0 }} />

      {spotRect && visible && (
        <div className="fte-spot-in">
          {/* Spotlight hole via box-shadow */}
          <div style={{
            position: 'fixed',
            top: spotRect.top - PAD,
            left: spotRect.left - PAD,
            width: spotRect.width + PAD * 2,
            height: spotRect.height + PAD * 2,
            borderRadius: 14,
            boxShadow: '0 0 0 9999px rgba(8,3,0,0.83)',
            border: '2px solid rgba(196,122,46,0.55)',
            pointerEvents: 'none',
            zIndex: 9901,
            transition: 'all 0.38s ease',
          }} />

          {/* Tooltip */}
          <div style={{
            position: 'fixed',
            top: tooltipTop,
            left: tooltipLeft,
            width: TT_W,
            background: 'rgba(18,6,1,0.97)',
            border: '1px solid rgba(196,122,46,0.35)',
            borderRadius: 18,
            padding: '16px 18px 14px',
            zIndex: 9902,
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
              <Mascot mood={stop.mood} size={64} />
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#F5E6CC', marginBottom: 5, lineHeight: 1.25 }}>
                  {stop.title}
                </div>
                <div style={{ fontSize: 12.5, color: 'rgba(245,230,204,0.55)', lineHeight: 1.65 }}>
                  {stop.desc}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={onDone}
                style={{
                  background: 'none', border: 'none',
                  color: 'rgba(245,230,204,0.32)', fontSize: 12,
                  cursor: 'pointer', padding: '6px 0', fontFamily: SANS,
                }}
              >
                Skip tour
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                {stops.map((_, i) => (
                  <div key={i} style={{
                    width: i === step ? 16 : 6, height: 6, borderRadius: 3,
                    background: i === step ? '#C47A2E' : 'rgba(245,230,204,0.2)',
                    transition: 'all 0.25s',
                  }} />
                ))}
                <button
                  onClick={next}
                  style={{
                    background: 'linear-gradient(135deg,#C47A2E,#E8943F)',
                    border: 'none', borderRadius: 100,
                    color: 'white', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', padding: '8px 18px', marginLeft: 6,
                    fontFamily: SANS,
                  }}
                >
                  {step === stops.length - 1 ? 'Done →' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Phase: Intent picker ──────────────────────────────────────────────────
function IntentPicker({ onSelect }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(10,4,0,0.92)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px',
      fontFamily: SANS,
      overflowY: 'auto',
    }}>
      <style>{CSS}</style>
      <div className="fte-fadein" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 440, width: '100%' }}>
        <Mascot mood="celebrate" size={110} />
        <div style={{ marginTop: 14, marginBottom: 22, textAlign: 'center' }}>
          <div style={{
            fontFamily: SERIF,
            fontSize: 'clamp(1.5rem,4vw,1.9rem)',
            fontWeight: 400, color: '#F5E6CC', lineHeight: 1.2, marginBottom: 8,
          }}>
            What brings you here today?
          </div>
          <div style={{ fontSize: 13.5, color: 'rgba(245,230,204,0.48)', lineHeight: 1.6 }}>
            I'll take you right there.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, width: '100%' }}>
          {INTENTS.map(intent => (
            <button
              key={intent.label}
              className="fte-intent-card"
              onClick={() => onSelect(intent.path)}
              style={{
                background: 'rgba(196,122,46,0.09)',
                border: '1px solid rgba(196,122,46,0.22)',
                borderRadius: 16, padding: '18px 14px',
                cursor: 'pointer', textAlign: 'left',
                color: 'white', fontFamily: SANS,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(196,122,46,0.18)';
                e.currentTarget.style.borderColor = 'rgba(196,122,46,0.5)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(196,122,46,0.09)';
                e.currentTarget.style.borderColor = 'rgba(196,122,46,0.22)';
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 7 }}>{intent.emoji}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#F5E6CC', marginBottom: 4, lineHeight: 1.2 }}>
                {intent.label}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(245,230,204,0.42)', lineHeight: 1.45 }}>
                {intent.desc}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
export default function FirstTimeExperience() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState(() => {
    try {
      if (localStorage.getItem(LS_KEY)) return 'done';
      if (window.innerWidth <= 768 && !localStorage.getItem(MOBILE_INTRO_KEY)) return 'done';
      return 'ask';
    } catch { return 'done'; }
  });

  const finish = (path) => {
    try { localStorage.setItem(LS_KEY, '1'); } catch {}
    setPhase('done');
    if (path) navigate(path);
  };

  if (phase === 'done') return null;
  if (phase === 'ask') return <AskTour onYes={() => setPhase('tour')} onNo={() => setPhase('intent')} />;
  if (phase === 'tour') return <SpotlightTour stops={TOUR_STOPS} onDone={() => setPhase('intent')} />;
  if (phase === 'intent') return <IntentPicker onSelect={finish} />;
  return null;
}
