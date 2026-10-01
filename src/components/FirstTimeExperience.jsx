import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LS_KEY = 'tendr-ftv-done';

const TOUR_STOPS = [
  {
    icon: '🛍️',
    title: 'Book vendors for your big day',
    subtitle: 'Caterers, decorators, photographers — find and book the best for your occasion.',
  },
  {
    icon: '📋',
    title: 'Plan your entire occasion',
    subtitle: 'Guest list, timeline, checklist, budget — your personal event planner.',
  },
  {
    icon: '🎮',
    title: 'Party Hub — your guests join live',
    subtitle: 'Everyone joins with a code. Play games, react, share moments — all together.',
  },
  {
    icon: '✨',
    title: 'Tools for any moment',
    subtitle: 'Wishlists, polls, playlists, awards — for every kind of celebration.',
  },
];

const INTENT_OPTIONS = [
  { label: 'Book Vendors',      emoji: '🛍️', path: '/' },
  { label: 'Plan an Occasion',  emoji: '📋', path: '/occasion-picker' },
  { label: 'Party Hub',         emoji: '🎮', path: '/join' },
  { label: 'Use Tools',         emoji: '✨', path: '/occasion-picker' },
  { label: 'Book for Others',   emoji: '🎁', path: '/' },
  { label: 'Just Exploring',    emoji: '👀', path: null },
];

// ── CSS Keyframes ─────────────────────────────────────────────────────────────
const KEYFRAMES = `
@keyframes ftv-idle { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
@keyframes ftv-wave { 0%{transform:rotate(0)} 20%{transform:rotate(-40deg)} 50%{transform:rotate(10deg)} 80%{transform:rotate(-20deg)} 100%{transform:rotate(0)} }
@keyframes ftv-celebrate { 0%,100%{transform:translateY(0) scale(1)} 30%{transform:translateY(-18px) scale(1.06)} 60%{transform:translateY(-6px) scale(1.02)} }
@keyframes ftv-bounce { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-14px)} 70%{transform:translateY(-4px)} }
@keyframes ftv-sparkle { 0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} }
@keyframes ftv-fadein { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes ftv-slidein { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
@keyframes ftv-overlay-in { from{opacity:0} to{opacity:1} }
@keyframes ftv-sparkle1 { 0%,100%{opacity:0;transform:scale(0)} 33%{opacity:1;transform:scale(1)} }
@keyframes ftv-sparkle2 { 0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} 66%{opacity:0;transform:scale(0)} }
@keyframes ftv-sparkle3 { 0%,25%{opacity:0;transform:scale(0)} 60%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(0)} }

.ftv-intent-card {
  background: rgba(255,255,255,0.04);
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 18px 12px;
  cursor: pointer;
  text-align: center;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
}
.ftv-intent-card:hover {
  background: rgba(196,151,58,0.12);
  border-color: rgba(196,151,58,0.5);
  transform: translateY(-2px);
}
.ftv-skip-btn {
  position: absolute;
  top: 20px;
  right: 24px;
  padding: 8px 16px;
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.7);
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.2);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  z-index: 10;
  transition: background 0.2s;
}
.ftv-skip-btn:hover {
  background: rgba(255,255,255,0.18);
}

@media (max-width: 600px) {
  .ftv-content-row {
    flex-direction: column !important;
    align-items: center !important;
    gap: 16px !important;
  }
  .ftv-char-side {
    width: auto !important;
    flex-direction: row !important;
    gap: 12px !important;
    align-items: flex-end !important;
  }
  .ftv-char-wrapper {
    height: 100px !important;
    width: 70px !important;
  }
  .ftv-card-side {
    width: 100% !important;
    max-width: 100% !important;
  }
}
`;

// ── TourCharacter ─────────────────────────────────────────────────────────────
function TourCharacter({ pose }) {
  const wholeAnim = pose === 'idle'
    ? 'ftv-idle 2s ease-in-out infinite'
    : pose === 'celebrate'
    ? 'ftv-celebrate 0.8s ease-in-out 1'
    : pose === 'bounce'
    ? 'ftv-bounce 0.5s ease-in-out 1'
    : 'none';

  const rightArmTransform =
    pose === 'wave'   ? undefined
    : pose === 'point' ? 'rotate(-70deg) translateY(-8px)'
    : undefined;
  const rightArmAnim =
    pose === 'wave' ? 'ftv-wave 1s ease-in-out 1' : 'none';

  return (
    <div
      className="ftv-char-wrapper"
      style={{
        width: 90,
        height: 160,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: wholeAnim,
      }}
    >
      {/* Sparkle dots */}
      <div style={{
        position: 'absolute', top: 2, right: 4, width: 7, height: 7,
        borderRadius: '50%', background: '#FFD700',
        animation: 'ftv-sparkle1 2.4s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', top: 14, right: -2, width: 5, height: 5,
        borderRadius: '50%', background: '#FF8E53',
        animation: 'ftv-sparkle2 2.8s ease-in-out 0.6s infinite',
      }} />
      <div style={{
        position: 'absolute', top: 6, right: 14, width: 4, height: 4,
        borderRadius: '50%', background: '#C4973A',
        animation: 'ftv-sparkle3 3.2s ease-in-out 1.1s infinite',
      }} />

      {/* Hair — bun at top */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 46, height: 24, background: '#3D1C02',
        borderRadius: '50% 50% 0 0',
        zIndex: 3,
      }} />
      {/* Hair bun circle */}
      <div style={{
        position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
        width: 20, height: 20, background: '#3D1C02',
        borderRadius: '50%',
        zIndex: 4,
      }} />

      {/* Head */}
      <div style={{
        position: 'relative',
        width: 72, height: 72,
        borderRadius: '50%',
        background: '#F4A460',
        marginTop: 10,
        zIndex: 5,
        flexShrink: 0,
      }}>
        {/* Left eye */}
        <div style={{
          position: 'absolute', top: 26, left: 17,
          width: 8, height: 10,
          borderRadius: '50%', background: '#2a1200',
        }} />
        {/* Right eye */}
        <div style={{
          position: 'absolute', top: 26, right: 17,
          width: 8, height: 10,
          borderRadius: '50%', background: '#2a1200',
        }} />
        {/* Smile */}
        <div style={{
          position: 'absolute', bottom: 17, left: '50%', transform: 'translateX(-50%)',
          width: 22, height: 10,
          borderRadius: '0 0 12px 12px',
          borderBottom: '2.5px solid #c0622e',
          background: 'transparent',
        }} />
        {/* Blush left */}
        <div style={{
          position: 'absolute', top: 34, left: 8,
          width: 14, height: 8,
          borderRadius: '50%', background: 'rgba(255,100,100,0.3)',
        }} />
        {/* Blush right */}
        <div style={{
          position: 'absolute', top: 34, right: 8,
          width: 14, height: 8,
          borderRadius: '50%', background: 'rgba(255,100,100,0.3)',
        }} />
      </div>

      {/* Body */}
      <div style={{
        position: 'relative',
        width: 50, height: 70,
        borderRadius: '14px 14px 8px 8px',
        background: 'linear-gradient(160deg, #FF6B6B, #FF8E53)',
        marginTop: 4,
        zIndex: 5,
        flexShrink: 0,
      }}>
        {/* Dupatta */}
        <div style={{
          position: 'absolute', top: 6, left: -4,
          width: 30, height: 8,
          background: '#FFD700',
          borderRadius: 4,
          transform: 'rotate(-15deg)',
          opacity: 0.9,
        }} />
      </div>

      {/* Left arm */}
      <div style={{
        position: 'absolute',
        bottom: 42,
        left: 6,
        width: 12, height: 38,
        borderRadius: 6,
        background: '#F4A460',
        transformOrigin: 'top center',
        transform: 'rotate(20deg)',
        zIndex: 4,
      }} />

      {/* Right arm */}
      <div style={{
        position: 'absolute',
        bottom: 42,
        right: 6,
        width: 12, height: 38,
        borderRadius: 6,
        background: '#F4A460',
        transformOrigin: 'top center',
        transform: rightArmTransform || 'rotate(-20deg)',
        animation: rightArmAnim,
        zIndex: 4,
      }} />
    </div>
  );
}

// ── SpeechBubble ──────────────────────────────────────────────────────────────
function SpeechBubble({ text }) {
  return (
    <div style={{
      position: 'relative',
      background: '#fff',
      borderRadius: 16,
      padding: '12px 18px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      color: '#1a0d30',
      fontWeight: 600,
      fontSize: 14,
      lineHeight: 1.4,
      maxWidth: 200,
      marginBottom: 10,
      animation: 'ftv-fadein 0.3s ease-out both',
    }}>
      {text}
      {/* Triangle pointer at bottom-left */}
      <div style={{
        position: 'absolute',
        bottom: -10,
        left: 20,
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: '10px solid #fff',
      }} />
    </div>
  );
}

// ── IntroCard ────────────────────────────────────────────────────────────────
function IntroCard({ onYes, onSkip }) {
  return (
    <div style={cardStyle}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
        <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: '0 0 8px', lineHeight: 1.2 }}>
          Welcome to Tendr!
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
          Your all-in-one platform for unforgettable celebrations.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 28, flexDirection: 'column' }}>
        <button onClick={onYes} style={primaryBtnStyle}>
          Yes, show me! 🚀
        </button>
        <button onClick={onSkip} style={secondaryBtnStyle}>
          Skip →
        </button>
      </div>
    </div>
  );
}

// ── TourCard ─────────────────────────────────────────────────────────────────
function TourCard({ stop, onNext, onBack }) {
  const s = TOUR_STOPS[stop];
  return (
    <div style={cardStyle}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{s.icon}</div>
        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '0 0 10px', lineHeight: 1.3 }}>
          {s.title}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          {s.subtitle}
        </p>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 28 }}>
        {TOUR_STOPS.map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i === stop ? '#C4973A' : 'rgba(255,255,255,0.2)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        {stop > 0 && (
          <button onClick={onBack} style={{ ...secondaryBtnStyle, flex: 1 }}>
            ← Back
          </button>
        )}
        <button onClick={onNext} style={{ ...primaryBtnStyle, flex: 1 }}>
          {stop < TOUR_STOPS.length - 1 ? 'Next →' : 'Finish! 🎉'}
        </button>
      </div>
    </div>
  );
}

// ── IntentPicker ──────────────────────────────────────────────────────────────
function IntentPicker({ onPick }) {
  return (
    <div style={{ ...cardStyle, maxWidth: 460 }}>
      <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, textAlign: 'center', margin: '0 0 20px' }}>
        What brings you here?
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}>
        {INTENT_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            className="ftv-intent-card"
            onClick={() => onPick(opt)}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{opt.emoji}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
              {opt.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const cardStyle = {
  background: 'linear-gradient(135deg, #1a0d30 0%, #0d0520 100%)',
  border: '1.5px solid rgba(196,151,58,0.4)',
  borderRadius: 24,
  padding: '32px 28px',
  maxWidth: 420,
  width: '90%',
  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  animation: 'ftv-slidein 0.4s ease-out 0.15s both',
};

const primaryBtnStyle = {
  background: 'linear-gradient(135deg, #C4973A, #8B6914)',
  color: '#fff',
  height: 44,
  borderRadius: 22,
  fontWeight: 700,
  minWidth: 120,
  border: 'none',
  cursor: 'pointer',
  fontSize: 15,
  transition: 'opacity 0.2s, transform 0.15s',
};

const secondaryBtnStyle = {
  background: 'transparent',
  border: '1.5px solid rgba(196,151,58,0.5)',
  color: 'rgba(196,151,58,0.8)',
  height: 44,
  borderRadius: 22,
  fontWeight: 700,
  minWidth: 120,
  cursor: 'pointer',
  fontSize: 15,
  transition: 'opacity 0.2s, transform 0.15s',
};

// ── FirstTimeExperience (main export) ────────────────────────────────────────
export default function FirstTimeExperience() {
  const [done, setDone] = useState(() => {
    try { return !!localStorage.getItem(LS_KEY); } catch { return true; }
  });
  const [phase, setPhase] = useState('intro'); // 'intro' | 'tour' | 'intent'
  const [tourStop, setTourStop] = useState(0);
  const [pose, setPose] = useState('idle');
  const navigate = useNavigate();

  // Wave on mount
  useEffect(() => {
    const t1 = setTimeout(() => setPose('wave'), 300);
    const t2 = setTimeout(() => setPose('idle'), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const close = () => {
    try { localStorage.setItem(LS_KEY, '1'); } catch {}
    setDone(true);
  };

  const handleSkip = () => {
    setPose('bounce');
    setTimeout(() => setPose('idle'), 600);
    setPhase('intent');
  };

  const handleYes = () => {
    setPose('point');
    setTourStop(0);
    setPhase('tour');
  };

  const handleNext = () => {
    if (tourStop < TOUR_STOPS.length - 1) {
      setTourStop(prev => {
        const next = prev + 1;
        setPose('idle');
        setTimeout(() => setPose('point'), 80);
        return next;
      });
    } else {
      // End of tour
      setPose('celebrate');
      setTimeout(() => setPose('idle'), 900);
      setPhase('intent');
    }
  };

  const handleBack = () => {
    setTourStop(prev => {
      const next = Math.max(0, prev - 1);
      setPose('idle');
      setTimeout(() => setPose('point'), 80);
      return next;
    });
  };

  const handleIntent = (option) => {
    close();
    if (option.path) {
      navigate(option.path);
    }
  };

  const speechText =
    phase === 'intro' ? 'Want a quick tour? 👋'
    : phase === 'tour' ? `Stop ${tourStop + 1} of ${TOUR_STOPS.length}`
    : 'What brings you here?';

  if (done) return null;

  return (
    <>
      <style>{KEYFRAMES}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(10, 5, 25, 0.88)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          animation: 'ftv-overlay-in 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        {/* Skip button */}
        {phase !== 'intent' && (
          <button className="ftv-skip-btn" onClick={handleSkip}>
            Skip →
          </button>
        )}

        {/* Main content: character on left, card on right */}
        <div
          className="ftv-content-row"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 48,
            maxWidth: 700,
            width: '100%',
          }}
        >
          {/* Character side */}
          <div
            className="ftv-char-side"
            style={{
              width: 160,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <SpeechBubble text={speechText} />
            <TourCharacter pose={pose} />
          </div>

          {/* Card side */}
          <div className="ftv-card-side" style={{ flex: 1 }}>
            {phase === 'intro' && (
              <IntroCard onYes={handleYes} onSkip={handleSkip} />
            )}
            {phase === 'tour' && (
              <TourCard
                stop={tourStop}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}
            {phase === 'intent' && (
              <IntentPicker options={INTENT_OPTIONS} onPick={handleIntent} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
