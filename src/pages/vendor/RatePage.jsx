import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const BASE = import.meta.env.VITE_BASE_URL;
const gold = '#C47A2E';
const ink  = '#2C1A0E';
const font = "'Outfit', sans-serif";

export default function RatePage() {
  const { token } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating]   = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch(`${BASE}/public/rate/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else {
          setData(d);
          if (d.alreadyRated) { setDone(true); setRating(d.clientRating || 0); }
        }
      })
      .catch(() => setError('Failed to load review page'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${BASE}/public/rate/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review }),
      });
      const d = await r.json();
      if (r.ok) setDone(true);
      else setError(d.error || 'Failed to submit');
    } catch { setError('Network error'); }
    finally { setSubmitting(false); }
  };

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const activeRating = hovered || rating;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font }}>
      <div style={{ color: '#9B7450', fontSize: 14 }}>Loading…</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font, padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: ink }}>{error}</div>
      </div>
    </div>
  );

  const LABELS = ['', 'Poor', 'Below average', 'Good', 'Very good', 'Excellent'];

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: font, padding: '40px 16px 56px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: gold, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Tendr · Rate Your Experience</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: ink, margin: 0 }}>{data.vendorName}</h1>
          <div style={{ fontSize: 13, color: '#9B7450', marginTop: 4 }}>{data.serviceType}</div>
        </div>

        {/* Event context */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(196,122,46,0.12)', padding: '12px 16px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontSize: 22 }}>🎉</div>
          <div>
            {data.eventType && <div style={{ fontSize: 13.5, fontWeight: 700, color: ink }}>{data.eventType}</div>}
            {data.eventDate && <div style={{ fontSize: 12, color: '#9B7450' }}>{fmtDate(data.eventDate)}</div>}
          </div>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '32px 24px', background: '#fff', borderRadius: 20, border: '1px solid rgba(196,122,46,0.12)' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{'⭐'.repeat(rating)}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: ink, marginBottom: 6 }}>Thank you for your review!</div>
            <div style={{ fontSize: 13, color: '#9B7450' }}>Your feedback helps {data.vendorName} grow.</div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(196,122,46,0.12)', padding: '24px 20px' }}>
            {/* Star picker */}
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#9B7450', marginBottom: 16 }}>How was your experience?</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s}
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, fontSize: 36, transition: 'transform 0.1s', transform: activeRating >= s ? 'scale(1.15)' : 'scale(1)', filter: activeRating >= s ? 'none' : 'grayscale(1) opacity(0.35)' }}>
                    ⭐
                  </button>
                ))}
              </div>
              {activeRating > 0 && (
                <div style={{ fontSize: 13, fontWeight: 700, color: gold }}>{LABELS[activeRating]}</div>
              )}
            </div>

            {/* Text review */}
            <div style={{ marginTop: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#6B3A1F', marginBottom: 6 }}>
                Add a comment (optional)
              </label>
              <textarea
                value={review}
                onChange={e => setReview(e.target.value)}
                placeholder={`How was the ${data.serviceType?.toLowerCase() || 'service'}? What would you tell others?`}
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(196,122,46,0.2)', fontFamily: font, fontSize: 13.5, color: ink, outline: 'none', background: '#FFFCF5', resize: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button onClick={handleSubmit} disabled={!rating || submitting}
              style={{ width: '100%', marginTop: 16, padding: '14px', borderRadius: 12, border: 'none', background: (rating && !submitting) ? `linear-gradient(135deg,${gold},#CCAB4A)` : 'rgba(196,122,46,0.2)', color: '#fff', fontSize: 15, fontWeight: 800, cursor: (rating && !submitting) ? 'pointer' : 'default', fontFamily: font, boxShadow: rating ? '0 4px 16px rgba(196,122,46,0.3)' : 'none' }}>
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#BDA282' }}>
          Powered by <span style={{ fontWeight: 700, color: gold }}>Tendr</span> · tendr.in
        </div>
      </div>
    </div>
  );
}
