import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HamburgerNav from '../../components/HamburgerNav';
import SEO from '../../components/SEO';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const F = "'Outfit', sans-serif";
const GOLD = '#C47A2E';
const INK = '#2C1A0E';
const CREAM = '#FFFCF5';
const MUTED = '#9B7450';

const SPECIALIZATION_OPTIONS = [
  'Weddings', 'Corporate Events', 'Birthday Parties', 'Social Gatherings',
  'Sangeet / Mehendi', 'Baby Showers', 'Anniversary Parties', 'Product Launches',
  'Award Ceremonies', 'House Parties',
];

const CITY_OPTIONS = [
  'Delhi', 'Noida', 'Gurugram', 'Ghaziabad', 'Faridabad',
  'Mumbai', 'Pune', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Jaipur', 'Chandigarh',
];

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1.5px solid rgba(196,122,46,0.25)', background: '#fff',
  fontFamily: F, fontSize: 13.5, color: INK,
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

const labelStyle = {
  display: 'block', fontSize: 11.5, fontWeight: 700,
  color: MUTED, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em',
};

export default function CoordinatorRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', phoneNumber: '', email: '', city: '',
    experience: '', eventsPerMonth: '', bio: '',
    portfolioLink: '', instagram: '', password: '', confirmPassword: '',
  });
  const [specializations, setSpecializations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleSpec = (s) =>
    setSpecializations(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!/^[0-9]{10}$/.test(form.phoneNumber)) { setError('Enter a valid 10-digit phone number.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/coordinators/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.name, phoneNumber: form.phoneNumber, email: form.email,
          city: form.city, experience: form.experience, eventsPerMonth: form.eventsPerMonth,
          specializations, bio: form.bio, portfolioLink: form.portfolioLink,
          instagram: form.instagram, password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed. Please try again.'); return; }
      setDone(true);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <>
        <SEO title="Application Submitted — Tendr" path="/coordinator/register" />
        <HamburgerNav title="Coordinator Application" />
        <div style={{ minHeight: '100vh', background: CREAM, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: F }}>
          <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#15803D,#22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: INK, margin: '0 0 10px' }}>Application Submitted</h1>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, margin: '0 0 24px' }}>
              Thank you for applying to join Tendr as an Event Coordinator. Our team will review your application and get back to you within 24 hours on your registered number.
            </p>
            <div style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', border: '1.5px solid rgba(196,122,46,0.18)', marginBottom: 24, textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: 12, color: MUTED }}>Registered phone</p>
              <p style={{ margin: '3px 0 0', fontSize: 14, fontWeight: 700, color: INK }}>{form.phoneNumber}</p>
            </div>
            <button
              onClick={() => navigate('/')}
              style={{ padding: '12px 32px', borderRadius: 100, background: `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: F }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Become a Coordinator — Tendr" description="Apply to join Tendr as an Event Coordinator." path="/coordinator/register" />
      <HamburgerNav title="Coordinator Application" />

      <div style={{ minHeight: '100vh', background: CREAM, fontFamily: F, paddingBottom: 60 }}>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg,#2C1A0E 0%,#4a2e18 100%)', padding: '36px 24px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
          <h1 style={{ fontSize: 'clamp(1.4rem,4vw,1.9rem)', fontWeight: 800, color: CREAM, margin: '0 0 8px', fontFamily: "'Cormorant Garamond',Georgia,serif", fontStyle: 'italic' }}>
            Become a Tendr Coordinator
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,252,245,0.7)', margin: 0, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
            Join our network of event professionals. Help clients plan unforgettable events and earn with every booking.
          </p>
        </div>

        <form onSubmit={submit} style={{ maxWidth: 600, margin: '32px auto 0', padding: '0 20px' }}>

          {/* Personal Details */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid rgba(196,122,46,0.14)', padding: '22px 22px 18px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>Personal Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Your full name" />
              </div>
              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input style={inputStyle} value={form.phoneNumber} onChange={e => set('phoneNumber', e.target.value.replace(/\D/g,'').slice(0,10))} required placeholder="10-digit number" inputMode="numeric" />
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="you@email.com" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>City *</label>
                <select style={inputStyle} value={form.city} onChange={e => set('city', e.target.value)} required>
                  <option value="">Select your city</option>
                  {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Experience */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid rgba(196,122,46,0.14)', padding: '22px 22px 18px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>Experience</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Years of Experience</label>
                <select style={inputStyle} value={form.experience} onChange={e => set('experience', e.target.value)}>
                  <option value="">Select</option>
                  {['Less than 1', '1-2', '2-4', '4-6', '6-10', '10+'].map(v => <option key={v} value={v}>{v} years</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Events per Month</label>
                <select style={inputStyle} value={form.eventsPerMonth} onChange={e => set('eventsPerMonth', e.target.value)}>
                  <option value="">Select</option>
                  {['1-2', '3-5', '6-10', '10-15', '15+'].map(v => <option key={v} value={v}>{v} events</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid rgba(196,122,46,0.14)', padding: '22px 22px 18px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Specializations</p>
            <p style={{ fontSize: 12, color: MUTED, margin: '0 0 14px' }}>Select all that apply</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SPECIALIZATION_OPTIONS.map(s => {
                const on = specializations.includes(s);
                return (
                  <button key={s} type="button" onClick={() => toggleSpec(s)}
                    style={{ padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: F, background: on ? GOLD : '#F8F4EF', color: on ? '#fff' : MUTED, border: on ? 'none' : '1.5px solid #E5D5C0', transition: 'all 0.15s' }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* About */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid rgba(196,122,46,0.14)', padding: '22px 22px 18px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>About You</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Short Bio</label>
                <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell us a bit about yourself and your event coordination style..." maxLength={400} />
                <p style={{ fontSize: 11, color: MUTED, margin: '4px 0 0', textAlign: 'right' }}>{form.bio.length}/400</p>
              </div>
              <div>
                <label style={labelStyle}>Portfolio / Website (optional)</label>
                <input style={inputStyle} value={form.portfolioLink} onChange={e => set('portfolioLink', e.target.value)} placeholder="https://yourportfolio.com" />
              </div>
              <div>
                <label style={labelStyle}>Instagram Handle (optional)</label>
                <input style={inputStyle} value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@yourhandle" />
              </div>
            </div>
          </div>

          {/* Password */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1.5px solid rgba(196,122,46,0.14)', padding: '22px 22px 18px', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>Set Password</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Password *</label>
                <input style={inputStyle} type="password" value={form.password} onChange={e => set('password', e.target.value)} required placeholder="Min 8 characters" autoComplete="new-password" />
              </div>
              <div>
                <label style={labelStyle}>Confirm Password *</label>
                <input style={inputStyle} type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required placeholder="Repeat password" autoComplete="new-password" />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: '#FFF1F2', border: '1.5px solid #FCA5A5', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#BE123C', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting}
            style={{ width: '100%', padding: '14px', borderRadius: 12, background: submitting ? '#D4A060' : `linear-gradient(135deg,${GOLD},#CCAB4A)`, color: '#fff', border: 'none', fontSize: 15, fontWeight: 800, cursor: submitting ? 'default' : 'pointer', fontFamily: F, letterSpacing: '0.01em' }}>
            {submitting ? 'Submitting…' : 'Submit Application'}
          </button>
          <p style={{ textAlign: 'center', fontSize: 12, color: MUTED, marginTop: 14 }}>
            Already registered?{' '}
            <button type="button" onClick={() => navigate('/coordinator/login')} style={{ background: 'none', border: 'none', color: GOLD, fontWeight: 700, cursor: 'pointer', fontFamily: F, fontSize: 12 }}>Sign in here</button>
          </p>
        </form>
      </div>
    </>
  );
}
