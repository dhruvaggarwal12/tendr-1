import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTour } from '../context/TourContext';
import { useBookVendors } from '../context/BookVendorsContext';
import SiteTour from './SiteTour';
import tendrLogo from '../assets/logos/tendr-logo-secondary.png';

const LS_KEY = 'tendr-ftv-done';

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Outfit', sans-serif";

// Note: '/plan' and '/tools' aren't real routes — there's no single page for either.
// "Plan an Occasion" scrolls to the occasion picker on the homepage (same anchor
// HamburgerNav's own "Plan by Occasion" link uses); "Use Tools" goes to the Budget
// Allocator as the single most representative tool page.
// "Just Exploring" is handled separately as a de-emphasized skip link, not a grid card —
// it's a dismiss action, not a peer of the other four, so it shouldn't compete visually.
const INTENTS = [
  { label: 'Book Vendors', path: '/booking', desc: 'Find caterers, decorators, photographers & more.' },
  { label: 'Plan an Occasion', path: '/', anchor: 'plan-by-occasion', desc: 'Build your celebration plan, from ideas to details.' },
  { label: 'Party Hub', path: '/join-room', desc: 'Discover games and activities for your guests.' },
  { label: 'Explore Tools', path: '/budget-picker', desc: 'Use practical tools for seating, budgets and more.' },
];

// Each card gets its own soft pastel family — bg (card), chip (icon container,
// one shade deeper), ink (icon stroke colour, dark so it reads on the pastel).
const INTENT_PALETTE = [
  { bg: '#FDEEE0', chip: '#FBD7B8', ink: '#8A4A1E' }, // Book Vendors — light peach
  { bg: '#FDF4C9', chip: '#FAE98C', ink: '#7A6412' }, // Plan an Occasion — butter yellow
  { bg: '#EDE3F7', chip: '#D9C5F0', ink: '#5B3C8A' }, // Party Hub — lavender
  { bg: '#E2EFDC', chip: '#C3DFB7', ink: '#3E6B2C' }, // Explore Tools — sage green
];
const ORANGE = '#F47735';

// Small organically-cropped celebration photos for the edges — reusing already-verified
// Unsplash assets from elsewhere in the app rather than sourcing new ones.
const CORNER_PHOTOS = [
  { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=300&q=80', pos: { top: '8%', left: '3%' }, size: 92, rotate: -6 },
  { url: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=300&q=80', pos: { top: '12%', right: '4%' }, size: 78, rotate: 5 },
  { url: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=300&q=80', pos: { bottom: '6%', left: '6%' }, size: 86, rotate: 4 },
];

const IconBag = ({ accent }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0" stroke={accent}/></svg>
);
const IconCalendar = ({ accent }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2.5"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="8" cy="15" r="1.3" fill={accent} stroke="none"/></svg>
);
const IconGame = ({ accent }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="6"/><line x1="7" y1="12" x2="9" y2="12"/><line x1="8" y1="11" x2="8" y2="13"/><circle cx="15" cy="10.5" r="1" fill={accent} stroke="none"/><circle cx="17.5" cy="13" r="1" fill={accent} stroke="none"/></svg>
);
const IconSliders = ({ accent }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="4" x2="5" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="19" y1="4" x2="19" y2="20"/><circle cx="5" cy="9" r="2.4" fill={accent} stroke={accent}/><circle cx="12" cy="15" r="2.4" fill={accent} stroke={accent}/><circle cx="19" cy="7" r="2.4" fill={accent} stroke={accent}/></svg>
);
const INTENT_ICONS = [IconBag, IconCalendar, IconGame, IconSliders];


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
  .fte-intent-card { transition: border-color 0.2s, transform 0.15s, box-shadow 0.25s; position: relative; isolation: isolate; }
  .fte-intent-card:hover { transform: translateY(-3px) !important; box-shadow: 0 10px 26px rgba(28,14,4,0.1) !important; border-color: rgba(42,22,6,0.16) !important; }
  .fte-intent-card:hover .fte-card-arrow { transform: translateX(3px); }
  .fte-intent-card:focus-visible { outline: 2.5px solid #F47735; outline-offset: 2px; }
  .fte-skip-link:focus-visible { outline: 2.5px solid #F47735; outline-offset: 3px; border-radius: 4px; }
  @media (max-height: 740px), (max-width: 380px) {
    .fte-mascot-wrap { transform: scale(0.68); margin-bottom: -18px; }
    .fte-intent-heading { margin-top: 0 !important; margin-bottom: 12px !important; }
    .fte-intent-heading .fte-title { font-size: 1.25rem !important; margin-bottom: 4px !important; }
    .fte-intent-heading .fte-sub { font-size: 12px !important; }
    .fte-intent-grid { gap: 8px !important; }
    .fte-intent-card { padding: 12px 10px !important; border-radius: 12px !important; gap: 7px !important; }
    .fte-intent-card .fte-icon-chip { width: 28px !important; height: 28px !important; border-radius: 9px !important; }
    .fte-intent-card .fte-icon-chip svg { width: 15px !important; height: 15px !important; }
    .fte-intent-card .fte-label { font-size: 12px !important; margin-bottom: 2px !important; }
    .fte-intent-card .fte-desc { font-size: 9.5px !important; line-height: 1.3 !important; }
    .fte-corner-photo { display: none !important; }
  }
  .fte-intent-card:active { transform: scale(0.97) !important; }
  .fte-ask-yes:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(196,122,46,0.55) !important; }
  @media (prefers-reduced-motion: reduce) {
    .fte-float, .fte-celebrate, .fte-wave-arm, .fte-sp1, .fte-sp2, .fte-sp3, .fte-fadein { animation: none !important; }
    .fte-intent-card, .fte-intent-card:hover, .fte-card-arrow { transition: none !important; transform: none !important; }
  }
`;

// ── Mascot SVG ─────────────────────────────────────────────────────────────
function Mascot({ mood = 'idle', size = 110 }) {
  const w = Math.round(size * 0.72);
  const h = size;
  const bodyClass = mood === 'celebrate' ? 'fte-celebrate' : 'fte-float';

  return (
    <div style={{ width: w, height: h, flexShrink: 0, filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.45)) drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}>
      <svg viewBox="0 0 80 124" width={w} height={h} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="fte-head" cx="32%" cy="26%" r="65%">
            <stop offset="0%" stopColor="#FFDCB0" />
            <stop offset="35%" stopColor="#F2B482" />
            <stop offset="70%" stopColor="#DD8442" />
            <stop offset="100%" stopColor="#A8581C" />
          </radialGradient>
          <radialGradient id="fte-body" cx="34%" cy="20%" r="75%">
            <stop offset="0%" stopColor="#FAB868" />
            <stop offset="45%" stopColor="#E08A2E" />
            <stop offset="100%" stopColor="#8E4A0E" />
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

        {/* Ground shadow — soft core + wider soft falloff, grounds the figure instead of
            a single flat ellipse */}
        <ellipse cx="40" cy="122" rx="22" ry="4.5" fill="rgba(0,0,0,0.1)" />
        <ellipse cx="40" cy="121" rx="15" ry="3.2" fill="rgba(0,0,0,0.22)" />

        <g className={bodyClass}>
          {/* Saree lower */}
          <ellipse cx="40" cy="98" rx="19" ry="23" fill="url(#fte-body)" />
          {/* Ambient-occlusion shading where the torso overlaps the saree, and a rim-light
              on the opposite edge — both read as depth rather than a flat gradient fill */}
          <path d="M27 82 Q24 98 29 118 Q24 110 22 98 Q22 86 27 82Z" fill="rgba(60,20,0,0.22)" />
          <path d="M55 78 Q60 95 54 119" stroke="rgba(255,224,170,0.5)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
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
          {/* Rim-light along the lower-right edge — the lit side opposite the main highlight,
              the classic cue that sells a rendered sphere rather than a flat gradient disc */}
          <path d="M55 44 A22 22 0 0 1 44 57" stroke="rgba(255,228,180,0.55)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          {/* Specular highlight — small bright glint, upper-left where the key light hits */}
          <ellipse cx="29" cy="25" rx="5.5" ry="3.8" fill="rgba(255,255,255,0.4)" transform="rotate(-25 29 25)" />
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
      background: `
        radial-gradient(ellipse 90% 55% at 50% 0%, rgba(196,122,46,0.26) 0%, transparent 58%),
        radial-gradient(ellipse 60% 45% at 8% 95%, rgba(232,148,63,0.16) 0%, transparent 62%),
        radial-gradient(ellipse 55% 40% at 95% 90%, rgba(123,58,21,0.22) 0%, transparent 60%),
        linear-gradient(160deg, #1C0F03 0%, #130900 55%, #0B0500 100%)
      `,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px', overflowY: 'auto',
      fontFamily: SANS,
    }}>
      <style>{CSS}</style>

      {/* Fine dot-grid texture, so the background reads as a surface, not a flat gradient */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
        backgroundImage: 'radial-gradient(rgba(245,230,204,0.07) 1px, transparent 1px)',
        backgroundSize: '26px 26px',
      }} />
      {/* Vignette — pulls focus to the centre instead of a flat edge-to-edge wash */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 160px 40px rgba(0,0,0,0.55)' }} />

      {/* Decorative sparkles around the mascot halo */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[
          { top: '14%', left: '14%', size: 16, delay: 0 },
          { top: '10%', right: '16%', size: 12, delay: 0.5 },
          { top: '30%', right: '8%', size: 10, delay: 1 },
          { top: '34%', left: '8%', size: 11, delay: 1.4 },
        ].map((s, i) => (
          <svg key={i} className={`fte-sp${(i % 3) + 1}`} viewBox="0 0 24 24" width={s.size} height={s.size}
            style={{ position: 'absolute', top: s.top, left: s.left, right: s.right, animationDelay: `${s.delay}s` }}>
            <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="#F0B050" opacity="0.6" />
          </svg>
        ))}
      </div>

      <div className="fte-fadein" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 400, width: '100%' }}>
        {/* Spotlight + glow halo behind the mascot — a soft light cone, not just a flat dot */}
        <div aria-hidden style={{ position: 'absolute', top: -60, width: 320, height: 300, background: 'radial-gradient(ellipse 50% 100% at 50% 0%, rgba(248,220,114,0.16) 0%, transparent 72%)', pointerEvents: 'none' }} />
        <div aria-hidden style={{ position: 'absolute', top: -14, width: 190, height: 190, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,122,46,0.4) 0%, transparent 70%)', filter: 'blur(4px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <Mascot mood="wave" size={160} />
        </div>

        <div style={{ marginTop: 12, textAlign: 'center', marginBottom: 20 }}>
          <div style={{
            fontFamily: SERIF,
            fontSize: 'clamp(1.5rem,4.2vw,1.9rem)',
            fontWeight: 700, lineHeight: 1.15, marginBottom: 9,
          }}>
            <span style={{ color: '#F5E6CC' }}>Hey! Welcome to </span>
            <span style={{ background: 'linear-gradient(135deg,#F0B050,#E8943F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Tendr</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(245,230,204,0.6)', lineHeight: 1.6 }}>
            Plan your event, book verified vendors, and have fun doing it — all in one place.
          </div>
          <div style={{ fontSize: 11.5, color: 'rgba(245,230,204,0.48)', marginTop: 5 }}>
            Want a quick tour before you dive in?
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <button
            className="fte-ask-yes"
            onClick={onYes}
            style={{
              background: 'linear-gradient(135deg, #E8943F, #F0B050)',
              border: 'none', borderRadius: 100, padding: '14px 26px',
              color: '#1C0900', fontSize: 14.5, fontWeight: 800,
              cursor: 'pointer', width: '100%', fontFamily: SANS,
              boxShadow: '0 6px 28px rgba(232,148,63,0.5)',
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
              borderRadius: 100, padding: '12px 26px',
              color: 'rgba(245,230,204,0.7)', fontSize: 12.5, fontWeight: 500,
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

// ── Phase: Intent picker ──────────────────────────────────────────────────
function IntentPicker({ onSelect }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: '#FFF9F0',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px',
      fontFamily: SANS,
      overflowY: 'auto',
    }}>
      <style>{CSS}</style>

      {/* Decorative peach blobs + orange sparkle doodles — background only, never over content */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-8%', left: '-10%', width: 320, height: 320, borderRadius: '42% 58% 61% 39% / 48% 42% 58% 52%', background: 'radial-gradient(circle, rgba(244,119,53,0.14) 0%, transparent 72%)' }} />
        <div style={{ position: 'absolute', bottom: '-12%', right: '-8%', width: 380, height: 380, borderRadius: '55% 45% 38% 62% / 55% 58% 42% 45%', background: 'radial-gradient(circle, rgba(250,201,71,0.16) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '38%', right: '10%', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,197,240,0.18) 0%, transparent 75%)' }} />
        {[
          { top: '6%', left: '46%', size: 16, delay: 0 },
          { top: '22%', left: '9%', size: 11, delay: 0.4 },
          { top: '70%', right: '13%', size: 14, delay: 0.8 },
          { top: '16%', right: '20%', size: 10, delay: 1.1 },
          { bottom: '10%', left: '38%', size: 12, delay: 1.5 },
        ].map((s, i) => (
          <svg key={i} className={`fte-sp${(i % 3) + 1}`} viewBox="0 0 24 24" width={s.size} height={s.size}
            style={{ position: 'absolute', top: s.top, left: s.left, right: s.right, bottom: s.bottom, animationDelay: `${s.delay}s` }}>
            <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill={ORANGE} opacity="0.55" />
          </svg>
        ))}
      </div>

      {/* Small organically-masked celebration photos near the edges */}
      {CORNER_PHOTOS.map((p, i) => (
        <div key={i} className="fte-corner-photo" aria-hidden style={{
          position: 'absolute', ...p.pos, width: p.size, height: p.size,
          borderRadius: '42% 58% 63% 37% / 55% 45% 55% 45%',
          overflow: 'hidden', transform: `rotate(${p.rotate}deg)`,
          boxShadow: '0 10px 24px rgba(138,74,30,0.18)',
          border: '3px solid #FFFCF6',
          opacity: 0.9,
        }}>
          <img src={p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ))}

      <div className="fte-fadein" style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 480, width: '100%' }}>
        <img src={tendrLogo} alt="Tendr" style={{ height: 30, objectFit: 'contain', marginBottom: 6 }} />
        <div className="fte-mascot-wrap">
          <Mascot mood="celebrate" size={96} />
        </div>
        <div className="fte-intent-heading" style={{ marginTop: 10, marginBottom: 26, textAlign: 'center' }}>
          <div className="fte-title" style={{
            fontFamily: SERIF,
            fontSize: 'clamp(1.7rem,4.2vw,2.3rem)',
            fontWeight: 500, lineHeight: 1.2, marginBottom: 10, textWrap: 'balance',
            color: '#2A1606',
            position: 'relative', display: 'inline-block',
          }}>
            What brings you here{' '}
            <span style={{ position: 'relative', color: ORANGE, display: 'inline-block' }}>
              today?
              <svg aria-hidden viewBox="0 0 110 14" width="100%" height="12" style={{ position: 'absolute', left: 0, bottom: -8, width: '100%' }} preserveAspectRatio="none">
                <path d="M2 9 Q 28 1, 55 7 T 108 5" stroke={ORANGE} strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </div>
          <div className="fte-sub" style={{ fontSize: 14, color: 'rgba(42,22,6,0.56)', lineHeight: 1.6, marginTop: 10 }}>
            Choose a starting point — we'll help with the rest.
          </div>
        </div>
        <div className="fte-intent-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, width: '100%' }}>
          {INTENTS.map((intent, i) => {
            const Icon = INTENT_ICONS[i];
            const pal = INTENT_PALETTE[i];
            return (
              <button
                key={intent.label}
                className="fte-intent-card"
                onClick={() => onSelect(intent.path, intent.anchor)}
                style={{
                  background: pal.bg,
                  border: '1px solid rgba(42,22,6,0.06)',
                  borderRadius: 24, padding: '20px 18px',
                  cursor: 'pointer', textAlign: 'left',
                  color: '#2A1606', fontFamily: SANS,
                  display: 'flex', flexDirection: 'column', gap: 10,
                  boxShadow: '0 2px 10px rgba(138,74,30,0.07)',
                  overflow: 'hidden',
                }}
              >
                {/* organic corner detail */}
                <div aria-hidden style={{ position: 'absolute', top: -22, right: -22, width: 72, height: 72, borderRadius: '50%', background: pal.chip, opacity: 0.45, pointerEvents: 'none' }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
                  <div className="fte-icon-chip" style={{
                    width: 40, height: 40, borderRadius: 13, flexShrink: 0,
                    background: pal.chip,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: pal.ink,
                  }}>
                    <Icon accent={pal.ink} />
                  </div>
                  <div className="fte-card-arrow" aria-hidden style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    border: `1.5px solid ${pal.ink}`, color: pal.ink,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.2s',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <div className="fte-label" style={{ fontSize: 14.5, fontWeight: 700, color: '#2A1606', marginBottom: 4, lineHeight: 1.2 }}>
                    {intent.label}
                  </div>
                  <div className="fte-desc" style={{ fontSize: 12, color: 'rgba(42,22,6,0.6)', lineHeight: 1.45 }}>
                    {intent.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Skip — a dismiss action, not a peer choice, so it's a quiet link rather than a 5th card */}
        <button
          className="fte-skip-link"
          onClick={() => onSelect(null)}
          style={{
            marginTop: 22, background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(42,22,6,0.62)', fontSize: 13, fontWeight: 600, fontFamily: SANS,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            borderBottom: `1.5px solid ${ORANGE}`, paddingBottom: 2,
          }}
        >
          Just exploring? Let me look around
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────
export default function FirstTimeExperience() {
  const navigate = useNavigate();
  const { startTour } = useTour();
  const { openBookVendors } = useBookVendors();

  const [phase, setPhase] = useState(() => {
    try {
      if (localStorage.getItem(LS_KEY)) return 'done';
      return 'ask';
    } catch { return 'done'; }
  });

  const finish = (path, anchor) => {
    try { localStorage.setItem(LS_KEY, '1'); } catch {}
    setPhase('done');
    if (path === '/booking') { openBookVendors(); return; }
    if (path) {
      navigate(path);
      if (anchor) {
        setTimeout(() => document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' }), 150);
      }
    }
  };

  const handleYes = () => {
    startTour();
    setPhase('tour');
  };

  // Hide the mobile bottom nav (and anything else that listens for drawers)
  // while the intro overlay is up — it shows again once the user picks an
  // intent / the tour finishes and phase becomes 'done'.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.__tendrDrawers) window.__tendrDrawers = new Set();
    if (phase === 'done') {
      window.__tendrDrawers.delete('ftv');
    } else {
      window.__tendrDrawers.add('ftv');
    }
    window.dispatchEvent(new Event('tendr:drawer'));
    return () => {
      window.__tendrDrawers?.delete('ftv');
      window.dispatchEvent(new Event('tendr:drawer'));
    };
  }, [phase]);

  if (phase === 'done') return null;
  if (phase === 'ask') return <AskTour onYes={handleYes} onNo={() => setPhase('intent')} />;
  if (phase === 'tour') return <SiteTour onDone={() => setPhase('intent')} />;
  if (phase === 'intent') return <IntentPicker onSelect={finish} />;
  return null;
}
