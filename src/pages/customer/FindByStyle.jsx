import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerNav from '../../components/HamburgerNav';

const BASE = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

export default function FindByStyle() {
  const navigate = useNavigate();
  const inputRef  = useRef(null);

  const [preview,  setPreview]  = useState(null);
  const [file,     setFile]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [results,  setResults]  = useState(null);
  const [error,    setError]    = useState('');
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResults(null);
    setError('');
  };

  const handleSearch = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await fetch(`${BASE}/vendors/find-by-photo`, { method: 'POST', body: fd });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('coming-soon');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      setResults(data.results || []);
    } catch (e) {
      setError(e.message === 'coming-soon' ? 'coming-soon' : e.message);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FFFCF5', fontFamily: font }}>
      <HamburgerNav />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: '#C47A2E', textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 8px' }}>Find by Style</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(1.9rem,5vw,2.8rem)', fontWeight: 400, color: '#2C1A0E', margin: '0 0 10px', letterSpacing: '0.01em' }}>
            Upload a photo,<br />find the vendor
          </h1>
          <p style={{ fontSize: 15, color: '#6B4226', margin: 0, lineHeight: 1.6 }}>
            See a decoration style you love? Upload the photo and we'll show you vendors in our network whose work looks closest to it.
          </p>
        </div>

        {/* Upload area */}
        {!preview ? (
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? '#C47A2E' : 'rgba(196,122,46,0.35)'}`,
              borderRadius: 18, padding: '48px 24px',
              textAlign: 'center', cursor: 'pointer',
              background: dragging ? 'rgba(196,122,46,0.04)' : '#fff',
              transition: 'all 0.18s',
              marginBottom: 28,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 14 }}>🖼️</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#2C1A0E', marginBottom: 6 }}>Drop a photo here</div>
            <div style={{ fontSize: 13, color: '#9B7450' }}>or click to browse · JPG, PNG, WebP</div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files?.[0])}
            />
          </div>
        ) : (
          <div style={{ marginBottom: 28 }}>
            {/* Preview */}
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 14, maxHeight: 340, background: '#f5f0ea' }}>
              <img src={preview} alt="uploaded" style={{ width: '100%', maxHeight: 340, objectFit: 'cover', display: 'block' }} />
              <button onClick={reset} style={{
                position: 'absolute', top: 10, right: 10,
                width: 30, height: 30, borderRadius: '50%',
                background: 'rgba(0,0,0,0.55)', border: 'none',
                color: '#fff', fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: 100,
                background: loading ? '#e8d5b7' : 'linear-gradient(135deg,#C47A2E,#CCAB4A)',
                color: '#fff', border: 'none', fontSize: 16, fontWeight: 700,
                cursor: loading ? 'default' : 'pointer', fontFamily: font,
                boxShadow: loading ? 'none' : '0 4px 18px rgba(196,122,46,0.35)',
                transition: 'all 0.18s',
              }}
            >
              {loading ? 'Searching…' : 'Find Similar Vendors'}
            </button>
          </div>
        )}

        {/* Error */}
        {error && error !== 'coming-soon' && (
          <div style={{ background: '#fff0f0', border: '1px solid #fcc', borderRadius: 10, padding: '12px 16px', color: '#c00', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {/* Coming soon state */}
        {error === 'coming-soon' && (
          <div style={{ textAlign: 'center', padding: '40px 24px', background: '#FFFCF5', border: '1px solid rgba(196,122,46,0.15)', borderRadius: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>🔧</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#2C1A0E', marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>
              This feature is being set up
            </div>
            <div style={{ fontSize: 13, color: '#9B7450', lineHeight: 1.6, maxWidth: 320, margin: '0 auto 20px' }}>
              Photo-based vendor matching is coming soon. In the meantime, browse our decorators directly.
            </div>
            <button
              onClick={() => window.location.href = '/search?categories=Decorator'}
              style={{ padding: '11px 24px', borderRadius: 100, border: 'none', background: 'linear-gradient(135deg,#C47A2E,#CCAB4A)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: font }}
            >
              Browse Decorators →
            </button>
          </div>
        )}

        {/* Loading shimmer */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ borderRadius: 14, overflow: 'hidden', background: '#f0ebe3', aspectRatio: '4/3', animation: 'pulse 1.4s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <>
            <p style={{ fontSize: 13, color: '#9B7450', marginBottom: 16, fontWeight: 600 }}>
              {results.length === 0
                ? 'No matches found yet — vendors need to upload portfolio photos first.'
                : `${results.length} closest match${results.length > 1 ? 'es' : ''} from our vendor network`}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
              {results.map((r, i) => (
                <div key={i} style={{
                  borderRadius: 14, overflow: 'hidden',
                  border: '1.5px solid rgba(196,122,46,0.18)',
                  background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                }} onClick={() => navigate(`/vendors/${r.vendor._id}`)}>
                  <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: '#f5f0ea' }}>
                    <img
                      src={r.photoUrl}
                      alt=""
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <div style={{ padding: '10px 12px 12px' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#2C1A0E', marginBottom: 2 }}>{r.vendor.name}</div>
                    <div style={{ fontSize: 11, color: '#9B7450' }}>
                      {r.vendor.serviceType}{r.vendor.city ? ` · ${r.vendor.city}` : ''}
                    </div>
                    <button style={{
                      marginTop: 8, width: '100%', padding: '7px', borderRadius: 8,
                      border: 'none', background: 'linear-gradient(135deg,#C47A2E,#CCAB4A)',
                      color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: font,
                    }}>View Vendor</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }
      `}</style>
    </div>
  );
}
