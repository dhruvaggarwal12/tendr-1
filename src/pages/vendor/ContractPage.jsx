import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const BASE = import.meta.env.VITE_BASE_URL;
const gold = '#C47A2E';
const ink  = '#2C1A0E';
const font = "'Outfit', sans-serif";

export default function ContractPage() {
  const { token } = useParams();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch(`${BASE}/public/contract/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else { setData(d); if (d.signedByClient) setDone(true); }
      })
      .catch(() => setError('Failed to load contract'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSign = async () => {
    setSigning(true);
    try {
      const r = await fetch(`${BASE}/public/contract/${token}/sign`, { method: 'POST' });
      const d = await r.json();
      if (r.ok) setDone(true);
      else setError(d.error || 'Failed to sign');
    } catch { setError('Network error'); }
    finally { setSigning(false); }
  };

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font }}>
      <div style={{ color: '#9B7450', fontSize: 14 }}>Loading contract…</div>
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

  return (
    <div style={{ minHeight: '100vh', background: '#FAF7F2', fontFamily: font, padding: '32px 16px 48px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: gold, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Tendr · Service Agreement</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: ink, margin: 0 }}>{data.vendorName}</h1>
          <div style={{ fontSize: 13, color: '#9B7450', marginTop: 4 }}>{data.serviceType}</div>
        </div>

        {/* Event summary */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(196,122,46,0.15)', padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Booking Summary</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Row label="Client"      value={data.clientName} />
            {data.eventType && <Row label="Event"  value={data.eventType} />}
            {data.eventDate && <Row label="Date"   value={fmtDate(data.eventDate)} />}
            {data.amount > 0 && <Row label="Amount" value={`₹${Number(data.amount).toLocaleString('en-IN')}`} />}
          </div>
        </div>

        {/* Terms */}
        {data.terms ? (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(196,122,46,0.15)', padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Terms & Conditions</div>
            <div style={{ fontSize: 13.5, color: ink, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.terms}</div>
          </div>
        ) : (
          <div style={{ background: 'rgba(196,122,46,0.05)', borderRadius: 14, border: '1px dashed rgba(196,122,46,0.3)', padding: '14px 18px', marginBottom: 20, fontSize: 13, color: '#9B7450' }}>
            No specific terms added. This confirms the booking details above.
          </div>
        )}

        {/* Action */}
        {done ? (
          <div style={{ background: 'rgba(22,163,74,0.07)', border: '1.5px solid rgba(22,163,74,0.3)', borderRadius: 16, padding: '20px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#16A34A' }}>Agreement Confirmed</div>
            <div style={{ fontSize: 13, color: '#15803D', marginTop: 4 }}>
              {data.signedAt ? `Signed on ${fmtDate(data.signedAt)}` : 'You have confirmed this agreement.'}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 12, color: '#9B7450', textAlign: 'center', marginBottom: 14, lineHeight: 1.6 }}>
              By tapping "I Agree", you confirm the booking details above and agree to proceed.
            </div>
            <button onClick={handleSign} disabled={signing}
              style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: signing ? 'rgba(196,122,46,0.4)' : `linear-gradient(135deg,${gold},#CCAB4A)`, color: '#fff', fontSize: 15, fontWeight: 800, cursor: signing ? 'wait' : 'pointer', fontFamily: font, boxShadow: '0 4px 16px rgba(196,122,46,0.35)' }}>
              {signing ? 'Confirming…' : 'I Agree — Confirm Booking'}
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

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 13, color: '#9B7450' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#2C1A0E', textAlign: 'right' }}>{value}</span>
    </div>
  );
}
