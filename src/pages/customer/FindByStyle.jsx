import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import HamburgerNav from '../../components/HamburgerNav';
import AuthModal from '../../components/AuthModal';
import { useChatOverlay } from '../../context/ChatContext';

const BASE = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";

export default function FindByStyle() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const { token } = useSelector(s => s.auth);
  const { openVendorChat } = useChatOverlay();

  const [preview,  setPreview]  = useState(null);
  const [file,     setFile]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [results,  setResults]  = useState(null);
  const [error,    setError]    = useState('');
  const [dragging, setDragging] = useState(false);
  const [quickViewVendor, setQuickViewVendor] = useState(null);
  const [authModalOpen, setAuthModalOpen]     = useState(false);
  const [pendingChatVendor, setPendingChatVendor] = useState(null);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResults(null);
    setError('');
  };

  const compressImage = (f, maxPx = 900, quality = 0.82) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      img.src = URL.createObjectURL(f);
    });

  const handleSearch = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append('photo', compressed, 'photo.jpg');
      const res = await fetch(`${BASE}/vendors/find-by-photo`, { method: 'POST', body: fd });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('coming-soon');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      setResults({ items: data.results || [], fallback: !!data.fallbackReason });
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

  const handleChatClick = (vendorData) => {
    if (!token) {
      setPendingChatVendor(vendorData);
      setAuthModalOpen(true);
      return;
    }
    setQuickViewVendor(null);
    openVendorChat({ _id: vendorData._id, name: vendorData.name, serviceType: vendorData.serviceType });
  };

  const displayedItems = results?.items?.slice(0, 2) ?? [];

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

        {/* Coming soon */}
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
          <div className="fbs-grid">
            {[...Array(2)].map((_, i) => (
              <div key={i} style={{ borderRadius: 14, overflow: 'hidden', background: '#f0ebe3', aspectRatio: '4/3', animation: 'pulse 1.4s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {/* Results */}
        {results && !loading && (
          <>
            <p style={{ fontSize: 13, color: '#9B7450', marginBottom: 16, fontWeight: 600 }}>
              {displayedItems.length === 0
                ? 'No matches found yet — vendors need to upload portfolio photos first.'
                : results.fallback
                  ? 'Photo matching is being set up — showing top decorators in the meantime'
                  : `Top ${displayedItems.length} closest match${displayedItems.length > 1 ? 'es' : ''} from our vendor network`}
            </p>
            <div className="fbs-grid">
              {displayedItems.map((r, i) => (
                <div key={i} style={{
                  borderRadius: 14, overflow: 'hidden',
                  border: '1.5px solid rgba(196,122,46,0.18)',
                  background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  display: 'flex', flexDirection: 'column',
                  minWidth: 0,
                }}>
                  {/* Matched vendor photo — full 4:3 so nothing crops */}
                  <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: '#f5f0ea', flexShrink: 0, position: 'relative' }}>
                    <img src={r.photoUrl} alt="matched work" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    {/* Small "Your photo" reference thumbnail in corner */}
                    <div style={{
                      position: 'absolute', bottom: 8, left: 8,
                      width: 52, height: 52, borderRadius: 8,
                      overflow: 'hidden', border: '2px solid #fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    }}>
                      <img src={preview} alt="your photo" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                    <span style={{ position: 'absolute', bottom: 8, left: 68, fontSize: 9, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.5)', borderRadius: 4, padding: '2px 6px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Your photo</span>
                  </div>
                  <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#2C1A0E', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.vendor.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#9B7450', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.vendor.serviceType}{r.vendor.city ? ` · ${r.vendor.city}` : ''}
                    </div>
                    <button
                      onClick={() => setQuickViewVendor({ ...r.vendor, photoUrl: r.photoUrl })}
                      style={{
                        width: '100%', padding: '7px 4px', borderRadius: 8,
                        border: '1.5px solid #C47A2E',
                        background: 'transparent',
                        color: '#C47A2E', fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', fontFamily: font,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}
                    >
                      Quick View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Quick View Side Panel — matches VendorList_ListingPage style */}
      {quickViewVendor && (
        <>
          <div onClick={() => setQuickViewVendor(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 99994, animation: 'qv-fade 0.2s ease' }} />

          <div style={window.innerWidth < 768 ? {
            position: 'fixed', left: 0, right: 0, bottom: 0, top: 0, width: '100vw', height: '100%',
            background: '#FFFCF5', zIndex: 99995, overflowY: 'auto', fontFamily: font,
            animation: 'qv-up 0.32s cubic-bezier(0.4,0,0.2,1)',
          } : {
            position: 'fixed', right: 0, top: 0, height: '100dvh', width: 420, maxWidth: '92vw',
            background: '#FFFCF5', zIndex: 99995,
            boxShadow: '-8px 0 48px rgba(139,69,19,0.18)',
            overflowY: 'auto', fontFamily: font,
            animation: 'qv-slide 0.32s cubic-bezier(0.4,0,0.2,1)',
          }}>
            {/* Cover photo — matched vendor photo */}
            <div style={{ position: 'relative', height: 230, flexShrink: 0, background: '#f0ebe3' }}>
              {quickViewVendor.photoUrl && (
                <img src={quickViewVendor.photoUrl} alt={quickViewVendor.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              <button onClick={() => setQuickViewVendor(null)}
                style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* Content */}
            <div style={{ padding: '22px 24px 32px' }}>
              {/* Name + type badge */}
              <div style={{ marginBottom: 14 }}>
                <h2 style={{ fontSize: 21, fontWeight: 800, color: '#2C1A0E', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                  {quickViewVendor.name}
                </h2>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 100, background: 'rgba(196,122,46,0.12)', color: '#C47A2E' }}>
                  {quickViewVendor.serviceType}
                </span>
              </div>

              {/* Stats pills */}
              {quickViewVendor.city && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#7A5535', background: 'rgba(196,122,46,0.07)', borderRadius: 20, padding: '5px 12px', border: '1px solid rgba(196,122,46,0.12)' }}>
                    <span>📍</span> {quickViewVendor.city}
                  </div>
                </div>
              )}

              {/* Your reference photo */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Your reference photo</p>
                <div style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '16/9', background: '#f0ebe3' }}>
                  <img src={preview} alt="your photo" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>

              <div style={{ height: 1, background: 'rgba(196,122,46,0.1)', margin: '4px 0 20px' }} />

              {/* CTAs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => window.open(`/vendors/${quickViewVendor._id}`, '_blank')}
                  style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#C47A2E,#CCAB4A)', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: font, cursor: 'pointer', boxShadow: '0 4px 14px rgba(196,122,46,0.3)' }}
                >View Full Profile →</button>
                <button
                  onClick={() => handleChatClick(quickViewVendor)}
                  style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid rgba(196,122,46,0.25)', background: '#fff', color: '#C47A2E', fontSize: 14, fontWeight: 700, fontFamily: font, cursor: 'pointer' }}
                >
                  {token ? '💬 Chat with Vendor' : 'Sign In to Chat'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Auth modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => { setAuthModalOpen(false); setPendingChatVendor(null); }}
        onSuccess={() => {
          setAuthModalOpen(false);
          if (pendingChatVendor) {
            openVendorChat({ _id: pendingChatVendor._id, name: pendingChatVendor.name, serviceType: pendingChatVendor.serviceType });
            setPendingChatVendor(null);
          }
        }}
      />

      <style>{`
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @keyframes qv-fade  { from{opacity:0} to{opacity:1} }
        @keyframes qv-slide { from{transform:translateX(100%)} to{transform:translateX(0)} }
        @keyframes qv-up    { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .fbs-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
        @media (max-width:480px) { .fbs-grid { grid-template-columns:1fr; } }
      `}</style>
    </div>
  );
}
