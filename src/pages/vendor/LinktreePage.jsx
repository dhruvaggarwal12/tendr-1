import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

const THEMES = {
  gold:    { bg: '#FFFCF5', accent: '#C47A2E', text: '#2C1A0E', card: '#fff',    sub: '#9B7450' },
  night:   { bg: '#0f172a', accent: '#a78bfa', text: '#f1f5f9', card: '#1e293b', sub: '#94a3b8' },
  rose:    { bg: '#fff1f5', accent: '#e11d48', text: '#1a0a12', card: '#fff',    sub: '#9f1239' },
  emerald: { bg: '#f0fdf4', accent: '#16a34a', text: '#14532d', card: '#fff',    sub: '#15803d' },
  slate:   { bg: '#f1f5f9', accent: '#334155', text: '#0f172a', card: '#fff',    sub: '#475569' },
};

export default function LinktreePage() {
  const { vendorId } = useParams();
  const [info,    setInfo]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/vendors/${vendorId}/linktree`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setInfo(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [vendorId]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FFFCF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, color: '#9B7450' }}>
      Loading…
    </div>
  );

  if (error || !info) return (
    <div style={{ minHeight: '100vh', background: '#FFFCF5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: font }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>😔</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#2C1A0E' }}>Page not found</div>
      <Link to="/" style={{ marginTop: 14, color: '#C47A2E', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>← Back to Tendr</Link>
    </div>
  );

  const lt = info.linktree || {};
  const t  = THEMES[lt.theme] || THEMES.gold;
  const links = (lt.links || []).filter(l => l.label && l.url);

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: font, paddingBottom: 48 }}>
      <div style={{ maxWidth: 460, margin: '0 auto', padding: '40px 20px 0' }}>

        {/* Avatar */}
        {info.photo
          ? <img src={info.photo} alt={info.name} style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 16px', border: `3px solid ${t.accent}`, boxShadow: `0 0 0 4px ${t.accent}22` }} />
          : <div style={{ width: 88, height: 88, borderRadius: '50%', background: `${t.accent}22`, border: `3px solid ${t.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, margin: '0 auto 16px' }}>🎭</div>
        }

        {/* Name / title / bio */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: t.text }}>{lt.title || info.name}</h1>
          {lt.title && lt.title !== info.name && (
            <div style={{ fontSize: 13, color: t.sub, marginTop: 2 }}>{info.name} · {info.serviceType}</div>
          )}
          {lt.bio && <p style={{ margin: '10px 0 0', fontSize: 14, color: t.text, opacity: 0.7, lineHeight: 1.55 }}>{lt.bio}</p>}
        </div>

        {/* Divider */}
        <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${t.accent}44, transparent)`, borderRadius: 2, marginBottom: 22 }} />

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {links.map(l => (
            <a key={l.id} href={l.url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 14, background: t.card, border: `1.5px solid ${t.accent}2a`, borderRadius: 14, padding: '14px 18px', textDecoration: 'none', boxShadow: `0 2px 12px ${t.accent}12`, transition: 'transform 0.12s, box-shadow 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 6px 20px ${t.accent}28`; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=`0 2px 12px ${t.accent}12`; }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{l.emoji}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{l.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 16, color: t.accent, opacity: 0.6 }}>→</span>
            </a>
          ))}
          {links.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', fontSize: 14, color: t.text, opacity: 0.4 }}>No links added yet.</div>
          )}
        </div>

        {/* Tendr branding */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 100, background: `${t.accent}12`, border: `1px solid ${t.accent}22` }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: t.sub, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Powered by</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: t.accent }}>TENDR</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
