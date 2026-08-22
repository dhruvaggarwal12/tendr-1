import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import logo from '../../assets/logos/tendr-logo-secondary.png';

const BASE = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";
const gold = '#C47A2E';
const ink = '#2C1A0E';
const cream = '#FFFCF5';

export default function VendorLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[0-9]{10}$/.test(phone)) { setError('Enter a valid 10-digit phone number'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }

    setLoading(true);
    try {
      // Step 1: login to get token + basic info
      const r = await fetch(`${BASE}/auth/vlogin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, password }),
      });
      const data = await r.json();
      if (!r.ok) { setError(data.error || 'Login failed'); setLoading(false); return; }

      const { vendor, token } = data;

      // Step 2: fetch full vendor profile to get serviceType + all fields
      const p = await fetch(`${BASE}/vendors/${vendor._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fullVendor = p.ok ? await p.json() : vendor;

      // Merge to ensure all fields present
      const userObj = { ...vendor, ...fullVendor };

      // Store in localStorage (same keys Dashboard reads)
      localStorage.setItem('tendr_token', token);
      localStorage.setItem('tendr_user', JSON.stringify(userObj));

      // Update Redux state inline (bypassing the consumer-only login action)
      dispatch({ type: 'auth/login/fulfilled', payload: { consumer: userObj, token } });

      navigate('/vendor/dashboard');
    } catch (err) {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100dvh', background: cream, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: font, padding: 24 }}>
      <img src={logo} alt="Tendr" style={{ height: 38, marginBottom: 32 }} />
      <div style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', maxWidth: 400, width: '100%', boxShadow: '0 4px 32px rgba(44,26,14,0.09)', border: '1px solid rgba(196,122,46,0.15)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: ink, margin: '0 0 4px' }}>Vendor Login</h1>
        <p style={{ fontSize: 13, color: '#9B7450', marginBottom: 28 }}>Access your business dashboard</p>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Phone Number</label>
          <input
            type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="10-digit mobile number"
            style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 6, marginBottom: 20, padding: '12px 14px', borderRadius: 10, border: '1.5px solid rgba(196,122,46,0.25)', fontSize: 15, fontFamily: font, outline: 'none', color: ink }}
          />

          <label style={{ fontSize: 12, fontWeight: 700, color: '#9B7450', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
          <div style={{ position: 'relative', marginTop: 6, marginBottom: 28 }}>
            <input
              type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px 44px 12px 14px', borderRadius: 10, border: '1.5px solid rgba(196,122,46,0.25)', fontSize: 15, fontFamily: font, outline: 'none', color: ink }}
            />
            <button type="button" onClick={() => setShowPw(v => !v)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9B7450', fontSize: 13 }}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '13px', borderRadius: 12, background: loading ? '#E8D5B0' : gold, color: '#fff', fontFamily: font, fontWeight: 800, fontSize: 15, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#9B7450' }}>
          Not a vendor?{' '}
          <span onClick={() => navigate('/login')} style={{ color: gold, fontWeight: 700, cursor: 'pointer' }}>Consumer login</span>
        </p>
      </div>
    </div>
  );
}
