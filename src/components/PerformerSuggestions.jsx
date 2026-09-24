import { useState, useEffect } from 'react';
import { getVendors } from '../apis/vendorApi';

export const PERFORMER_TYPES = [
  { type: 'Singer',        label: 'Singer',        emoji: '🎤' },
  { type: 'Band',          label: 'Live Band',      emoji: '🎸' },
  { type: 'Anchor',        label: 'Anchor / MC',    emoji: '🎙️' },
  { type: 'Choreographer', label: 'Choreographer',  emoji: '💃' },
  { type: 'Musician',      label: 'Musician',       emoji: '🎹' },
  { type: 'Emcee',         label: 'Emcee',          emoji: '🎭' },
];

const CACHE_KEY = 'tendr_perf_avail_v1';

function readCache() {
  try { return JSON.parse(sessionStorage.getItem(CACHE_KEY)); } catch { return null; }
}
function writeCache(val) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(val)); } catch {}
}

// Simplified performer CTA — shows a single "Want live performance?" card
// that navigates to /artists. Still supply-gated (only renders if ≥1 type available).
export default function PerformerSuggestions({ wrapStyle = {} }) {
  const [hasAny, setHasAny] = useState(null); // null=loading, false=none, true=some

  useEffect(() => {
    const cached = readCache();
    if (cached !== null) { setHasAny(cached.length > 0); return; }
    Promise.all(
      PERFORMER_TYPES.map(p =>
        getVendors({ serviceTypes: [p.type], limit: 1, includeDemo: true })
          .then(r => ({ type: p.type, has: (r?.vendors || []).length > 0 }))
          .catch(() => ({ type: p.type, has: false }))
      )
    ).then(results => {
      const avail = results.filter(r => r.has).map(r => r.type);
      writeCache(avail);
      setHasAny(avail.length > 0);
    });
  }, []);

  if (!hasAny) return null;

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", ...wrapStyle }}>
      <button
        onClick={() => window.open('/artists', '_blank', 'noopener,noreferrer')}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px', borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(196,122,46,0.07), rgba(204,171,74,0.04))',
          border: '1.5px solid rgba(196,122,46,0.22)',
          cursor: 'pointer', textAlign: 'left', transition: 'all 0.18s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(196,122,46,0.13), rgba(204,171,74,0.08))'; e.currentTarget.style.borderColor = 'rgba(196,122,46,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(196,122,46,0.07), rgba(204,171,74,0.04))'; e.currentTarget.style.borderColor = 'rgba(196,122,46,0.22)'; }}
      >
        <span style={{ fontSize: 28, flexShrink: 0 }}>🎤</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: '#2C1A0E', marginBottom: 2 }}>
            Want live performance at your event?
          </div>
          <div style={{ fontSize: 12, color: '#9B7450' }}>
            Singers, bands, anchors, choreographers &amp; more
          </div>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#C47A2E', whiteSpace: 'nowrap', flexShrink: 0 }}>
          Browse Artists →
        </span>
      </button>
    </div>
  );
}
