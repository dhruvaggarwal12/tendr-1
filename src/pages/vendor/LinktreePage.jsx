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

        {/* Book buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: links.length > 0 ? 16 : 0 }}>
          {info.phoneNumber && (
            <a
              href={`https://wa.me/91${info.phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${info.name}, I came across your profile and wanted to enquire about booking your services.`)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#25D366', borderRadius: 14, padding: '14px 18px', textDecoration: 'none', boxShadow: '0 4px 16px rgba(37,211,102,0.35)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Book Directly on WhatsApp</span>
              <span style={{ marginLeft: 'auto', fontSize: 16, color: 'rgba(255,255,255,0.7)' }}>→</span>
            </a>
          )}
          <Link
            to={`/vendor/${vendorId}?src=direct`}
            style={{ display: 'flex', alignItems: 'center', gap: 14, background: t.card, border: `1.5px solid ${t.accent}33`, borderRadius: 14, padding: '14px 18px', textDecoration: 'none', boxShadow: `0 2px 12px ${t.accent}14` }}>
            <span style={{ fontSize: 22 }}>📋</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>View Full Profile &amp; Book</span>
            <span style={{ marginLeft: 'auto', fontSize: 16, color: t.accent, opacity: 0.6 }}>→</span>
          </Link>
          <Link
            to={`/vendor/${vendorId}`}
            style={{ display: 'flex', alignItems: 'center', gap: 14, background: `${t.accent}14`, border: `1.5px solid ${t.accent}22`, borderRadius: 14, padding: '14px 18px', textDecoration: 'none' }}>
            <span style={{ fontSize: 22 }}>🌟</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Book via Tendr Platform</span>
            <span style={{ marginLeft: 'auto', fontSize: 16, color: t.accent, opacity: 0.6 }}>→</span>
          </Link>
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
