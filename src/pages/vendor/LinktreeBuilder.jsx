import { useState, useEffect, useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";
const gold = '#C47A2E';
const ink  = '#2C1A0E';

const THEMES = [
  { id: 'gold',    bg: '#FFFCF5', accent: '#C47A2E', text: '#2C1A0E', card: '#fff',     name: 'Tendr Gold'  },
  { id: 'night',   bg: '#0f172a', accent: '#a78bfa', text: '#f1f5f9', card: '#1e293b',  name: 'Midnight'    },
  { id: 'rose',    bg: '#fff1f5', accent: '#e11d48', text: '#1a0a12', card: '#fff',     name: 'Rose'        },
  { id: 'emerald', bg: '#f0fdf4', accent: '#16a34a', text: '#14532d', card: '#fff',     name: 'Emerald'     },
  { id: 'slate',   bg: '#f1f5f9', accent: '#334155', text: '#0f172a', card: '#fff',     name: 'Slate Pro'   },
];

const PRESETS = [
  { emoji: '📸', label: 'Instagram',       url: 'https://instagram.com/' },
  { emoji: '▶️', label: 'YouTube',          url: 'https://youtube.com/@' },
  { emoji: '🎵', label: 'Spotify',          url: 'https://open.spotify.com/artist/' },
  { emoji: '📱', label: 'WhatsApp',         url: 'https://wa.me/91' },
  { emoji: '💼', label: 'Facebook',         url: 'https://facebook.com/' },
  { emoji: '🌐', label: 'Website',          url: 'https://' },
  { emoji: '🎬', label: 'Demo Video',       url: 'https://youtube.com/watch?v=' },
  { emoji: '⭐', label: 'Book on Tendr',    url: '' },
];

const uid = () => Math.random().toString(36).slice(2, 9);

function LinkCard({ link, onChange, onDelete, theme }) {
  const t = theme;
  return (
    <div style={{ background: t.card, border: `1.5px solid ${t.accent}22`, borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', fontFamily: font }}>
      <input value={link.emoji} onChange={e => onChange({ ...link, emoji: e.target.value })}
        style={{ width: 40, fontSize: 22, textAlign: 'center', border: `1.5px solid ${t.accent}33`, borderRadius: 8, padding: '4px 0', background: t.bg, color: t.text, fontFamily: font, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <input value={link.label} placeholder="Link label" onChange={e => onChange({ ...link, label: e.target.value })}
          style={{ width: '100%', border: `1.5px solid ${t.accent}33`, borderRadius: 8, padding: '6px 10px', fontSize: 13, fontWeight: 600, background: t.bg, color: t.text, fontFamily: font }} />
        <input value={link.url} placeholder="https://..." onChange={e => onChange({ ...link, url: e.target.value })}
          style={{ width: '100%', border: `1.5px solid ${t.accent}22`, borderRadius: 8, padding: '6px 10px', fontSize: 12, background: t.bg, color: t.text, fontFamily: font }} />
      </div>
      <button onClick={onDelete} style={{ flexShrink: 0, background: '#fee2e2', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
    </div>
  );
}

function Preview({ data, vendorName, photo, theme }) {
  const t = theme;
  const links = data.links || [];
  return (
    <div style={{ background: t.bg, minHeight: 520, borderRadius: 20, padding: '32px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: font }}>
      {photo && <img src={photo} alt="" style={{ width: 76, height: 76, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${t.accent}`, marginBottom: 14, boxShadow: `0 0 0 4px ${t.accent}22` }} />}
      {!photo && <div style={{ width: 76, height: 76, borderRadius: '50%', background: `${t.accent}22`, border: `3px solid ${t.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, marginBottom: 14 }}>🎭</div>}
      <div style={{ fontSize: 20, fontWeight: 800, color: t.text, marginBottom: 4, textAlign: 'center' }}>{data.title || vendorName || 'Your Name'}</div>
      {data.bio && <div style={{ fontSize: 13, color: t.text, opacity: 0.65, textAlign: 'center', maxWidth: 260, marginBottom: 4, lineHeight: 1.5 }}>{data.bio}</div>}
      <div style={{ width: 40, height: 2, background: `${t.accent}55`, borderRadius: 2, margin: '10px 0 18px' }} />
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {links.filter(l => l.label && l.url).map(l => (
          <div key={l.id} style={{ background: t.card, border: `1.5px solid ${t.accent}33`, borderRadius: 12, padding: '13px 18px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 2px 8px ${t.accent}14`, cursor: 'pointer' }}>
            <span style={{ fontSize: 20 }}>{l.emoji}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>{l.label}</span>
          </div>
        ))}
        {links.length === 0 && <div style={{ textAlign: 'center', fontSize: 13, color: t.text, opacity: 0.4, padding: '20px 0' }}>Your links will appear here</div>}
      </div>
      <div style={{ marginTop: 28, fontSize: 11, color: t.text, opacity: 0.35, letterSpacing: '0.06em' }}>POWERED BY TENDR.CO.IN</div>
    </div>
  );
}

export default function LinktreeBuilder({ token, vendorId, vendorName }) {
  const [data,       setData]       = useState({ title: '', bio: '', theme: 'gold', links: [] });
  const [apiPhoto,   setApiPhoto]   = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState('links'); // 'links' | 'preview' (mobile)

  const theme = THEMES.find(t => t.id === data.theme) || THEMES[0];
  const publicUrl = `${window.location.origin}/links/${vendorId}`;

  useEffect(() => {
    if (!vendorId) return;
    fetch(`${BASE_URL}/vendors/${vendorId}/linktree`)
      .then(r => r.json())
      .then(d => {
        if (d.linktree) setData(d.linktree);
        if (d.photo) setApiPhoto(d.photo);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [vendorId]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const r = await fetch(`${BASE_URL}/vendors/me/linktree`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    } finally {
      setSaving(false);
    }
  }, [data, token]);

  const addLink = (preset) => {
    setData(d => ({ ...d, links: [...(d.links || []), { id: uid(), emoji: preset.emoji, label: preset.label, url: preset.url }] }));
  };

  const updateLink = (id, next) => setData(d => ({ ...d, links: d.links.map(l => l.id === id ? next : l) }));
  const deleteLink = (id) => setData(d => ({ ...d, links: d.links.filter(l => l.id !== id) }));

  const copy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: '#9B7450', fontFamily: font }}>Loading…</div>;

  const isMobile = window.innerWidth < 768;

  return (
    <div style={{ fontFamily: font }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 22 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: ink }}>My Link Hub</div>
          <div style={{ fontSize: 12, color: '#9B7450', marginTop: 2 }}>One link to share everything — social, booking, portfolio</div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={copy} style={{ padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${gold}`, background: copied ? '#dcfce7' : '#fff', color: copied ? '#16a34a' : gold, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
            {copied ? '✓ Copied!' : '🔗 Copy Link'}
          </button>
          <button onClick={save} disabled={saving} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: saved ? '#16a34a' : `linear-gradient(135deg,${gold},#CCAB4A)`, color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: font }}>
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Mobile tab toggle */}
      {isMobile && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {['links', 'preview'].map(k => (
            <button key={k} onClick={() => setTab(k)}
              style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1.5px solid ${tab===k ? gold : 'rgba(196,122,46,0.2)'}`, background: tab===k ? `${gold}15` : 'transparent', color: tab===k ? gold : '#9B7450', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: font, textTransform: 'capitalize' }}>
              {k === 'links' ? '✏️ Edit' : '👁 Preview'}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* ── Editor panel ── */}
        {(!isMobile || tab === 'links') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Profile info */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '18px 16px', border: '1px solid rgba(196,122,46,0.12)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9B7450', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Profile</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: ink, display: 'block', marginBottom: 4 }}>Page Title</label>
                  <input value={data.title} placeholder={vendorName || 'Your name or page title'} onChange={e => setData(d => ({ ...d, title: e.target.value }))}
                    style={{ width: '100%', border: '1.5px solid rgba(196,122,46,0.22)', borderRadius: 10, padding: '9px 12px', fontSize: 14, fontFamily: font, color: ink, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: ink, display: 'block', marginBottom: 4 }}>Bio / Tagline</label>
                  <textarea value={data.bio} placeholder="Short bio, tagline, or what you do…" onChange={e => setData(d => ({ ...d, bio: e.target.value }))} rows={2}
                    style={{ width: '100%', border: '1.5px solid rgba(196,122,46,0.22)', borderRadius: 10, padding: '9px 12px', fontSize: 13, fontFamily: font, color: ink, resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>

            {/* Theme */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '18px 16px', border: '1px solid rgba(196,122,46,0.12)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9B7450', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Theme</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => setData(d => ({ ...d, theme: t.id }))}
                    style={{ padding: '8px 14px', borderRadius: 10, border: `2px solid ${data.theme === t.id ? t.accent : t.accent+'33'}`, background: t.bg, color: t.text, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: font, boxShadow: data.theme === t.id ? `0 0 0 2px ${t.accent}55` : 'none', transition: 'all 0.15s' }}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '18px 16px', border: '1px solid rgba(196,122,46,0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Links ({(data.links || []).length}/20)</div>
              </div>

              {/* Quick-add presets */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: '#9B7450', marginBottom: 8 }}>Quick add</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {PRESETS.map(p => (
                    <button key={p.label} onClick={() => addLink(p)}
                      style={{ padding: '5px 11px', borderRadius: 8, border: '1.5px solid rgba(196,122,46,0.2)', background: 'rgba(196,122,46,0.04)', color: ink, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: font, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>{p.emoji}</span> {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Existing links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(data.links || []).map(l => (
                  <LinkCard key={l.id} link={l} theme={theme} onChange={next => updateLink(l.id, next)} onDelete={() => deleteLink(l.id)} />
                ))}
                {(data.links || []).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '18px 0', fontSize: 13, color: '#9B7450' }}>Add links from the quick-add buttons above, or any custom link</div>
                )}
              </div>

              {/* Custom link */}
              <button onClick={() => addLink({ emoji: '🔗', label: '', url: '' })}
                style={{ marginTop: 12, width: '100%', padding: '9px', borderRadius: 10, border: '1.5px dashed rgba(196,122,46,0.35)', background: 'transparent', color: '#9B7450', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: font }}>
                + Custom link
              </button>
            </div>

            {/* Share section */}
            <div style={{ background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid rgba(196,122,46,0.12)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#9B7450', marginBottom: 3 }}>Your public link</div>
                <div style={{ fontSize: 12, color: ink, wordBreak: 'break-all', fontWeight: 600 }}>{publicUrl}</div>
              </div>
              <button onClick={copy} style={{ padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${gold}`, background: copied ? '#dcfce7' : '#fff', color: copied ? '#16a34a' : gold, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', fontFamily: font, whiteSpace: 'nowrap' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* ── Preview panel ── */}
        {(!isMobile || tab === 'preview') && (
          <div style={{ position: isMobile ? 'static' : 'sticky', top: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9B7450', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>Live Preview</div>
            <div style={{ border: '1.5px solid rgba(196,122,46,0.15)', borderRadius: 20, overflow: 'hidden' }}>
              <Preview data={data} vendorName={vendorName} photo={apiPhoto} theme={theme} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
