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

// Supply-gated performer suggestions strip.
// Shows only types with ≥1 approved vendor in the marketplace.
// Results are cached in sessionStorage for the browser session.
export default function PerformerSuggestions({
  title = 'People also book for their events',
  excludeType,
  wrapStyle = {},
}) {
  const [available, setAvailable] = useState(readCache);

  useEffect(() => {
    if (available !== null) return;
    Promise.all(
      PERFORMER_TYPES.map(p =>
        getVendors({ serviceTypes: [p.type], limit: 1 })
          .then(r => ({ type: p.type, has: (r?.vendors || []).length > 0 }))
          .catch(() => ({ type: p.type, has: false }))
      )
    ).then(results => {
      const avail = results.filter(r => r.has).map(r => r.type);
      setAvailable(avail);
      writeCache(avail);
    });
  }, []);

  if (!available) return null;

  const filtered = PERFORMER_TYPES.filter(p => available.includes(p.type) && p.type !== excludeType);
  if (filtered.length === 0) return null;

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", ...wrapStyle }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
        {title}
      </div>
      <div className="_pf-strip" style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: 4 }}>
        {filtered.map(p => (
          <a
            key={p.type}
            href={`/listings?serviceType=${encodeURIComponent(p.type)}`}
            style={{
              flex: '0 0 auto',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
              width: 82, padding: '11px 6px',
              borderRadius: 12,
              background: '#FFFCF5', border: '1.5px solid rgba(196,122,46,0.2)',
              textDecoration: 'none', boxShadow: '0 2px 8px rgba(28,14,4,0.05)',
              transition: 'transform 0.16s, box-shadow 0.16s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(196,122,46,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(28,14,4,0.05)'; }}
          >
            <span style={{ fontSize: 20 }}>{p.emoji}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#2C1A0E', textAlign: 'center', lineHeight: 1.3 }}>{p.label}</span>
          </a>
        ))}
      </div>
      <style>{`._pf-strip::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}
