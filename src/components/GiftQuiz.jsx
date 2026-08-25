import { useState, useMemo } from 'react';

const gold  = '#C47A2E';
const ink   = '#2C1A0E';
const cream = '#FFFCF5';
const font  = "'Outfit', sans-serif";

// ── Quiz step config ──────────────────────────────────────────────────────────
const STEPS = [
  {
    key:      'occasion',
    question: "What's the occasion?",
    emoji:    '🎉',
    multi:    false,
    options: [
      { label: 'Birthday',         icon: '🎂' },
      { label: 'Anniversary',       icon: '💑' },
      { label: 'Festival',          icon: '🪔' },
      { label: 'Corporate Gift',    icon: '💼' },
      { label: 'Wedding',           icon: '💍' },
      { label: 'Baby Shower',       icon: '👶' },
      { label: 'Just Because',      icon: '💛' },
      { label: 'Thank You',         icon: '🙏' },
    ],
  },
  {
    key:      'recipient',
    question: 'Who is it for?',
    emoji:    '💝',
    multi:    false,
    options: [
      { label: 'Mom',        icon: '👩' },
      { label: 'Dad',        icon: '👨' },
      { label: 'Partner',    icon: '💑' },
      { label: 'Friend',     icon: '🤝' },
      { label: 'Colleague',  icon: '👔' },
      { label: 'Kids',       icon: '🧒' },
      { label: 'Boss',       icon: '🏆' },
      { label: 'Myself',     icon: '😊' },
    ],
  },
  {
    key:      'pricePerception',
    question: 'What feels right for your budget?',
    emoji:    '💸',
    multi:    false,
    options: [
      { label: 'Budget',     icon: '👍', sub: 'Under ₹800'        },
      { label: 'Mid-range',  icon: '✨', sub: '₹800 – ₹2,000'     },
      { label: 'Premium',    icon: '👑', sub: 'Above ₹2,000'      },
      { label: 'Any',        icon: '🎁', sub: 'Surprise me!'       },
    ],
  },
  {
    key:      'vibe',
    question: 'Pick a vibe',
    emoji:    '🌟',
    multi:    false,
    options: [
      { label: 'Luxurious',   icon: '💎' },
      { label: 'Heartfelt',   icon: '❤️' },
      { label: 'Fun',         icon: '🎈' },
      { label: 'Traditional', icon: '🏺' },
      { label: 'Minimal',     icon: '⬜' },
      { label: 'Indulgent',   icon: '🍫' },
    ],
  },
];

function scoreMatch(sample, answers) {
  let score = 0;
  const occ = answers.occasion;
  const rec = answers.recipient;
  const pp  = answers.pricePerception;
  const vib = answers.vibe;

  if (occ && sample.occasion?.includes(occ))         score += 3;
  if (rec && sample.recipient?.includes(rec))         score += 3;
  if (pp && pp !== 'Any' && sample.pricePerception === pp) score += 2;
  if (vib && sample.vibe === vib)                     score += 2;
  // partial: any occasion match
  if (occ && sample.occasion?.length === 0)           score += 0.5;
  return score;
}

export default function GiftQuiz({ samples, onSelect, onClose }) {
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone]       = useState(false);

  const current = STEPS[step];

  const choose = (val) => {
    const next = { ...answers, [current.key]: val };
    setAnswers(next);
    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(s => s + 1), 180);
    } else {
      setTimeout(() => setDone(true), 200);
    }
  };

  const results = useMemo(() => {
    if (!done) return [];
    const scored = samples.map(s => ({ ...s, _score: scoreMatch(s, answers) }));
    scored.sort((a, b) => b._score - a._score);
    // Return top 12, but at minimum show some even if score is 0
    const withScore = scored.filter(s => s._score > 0);
    return withScore.length >= 4 ? withScore.slice(0, 12) : scored.slice(0, 12);
  }, [done, samples, answers]);

  const restart = () => { setStep(0); setAnswers({}); setDone(false); };

  return (
    <div onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(44,26,14,0.55)', zIndex:9100, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(3px)' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background:cream, borderRadius:24, width:'100%', maxWidth: done ? 760 : 480, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', fontFamily:font, boxShadow:'0 24px 80px rgba(44,26,14,0.22)' }}>

        {/* Header */}
        <div style={{ padding:'20px 22px 16px', borderBottom:'1px solid rgba(196,122,46,0.12)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:gold, letterSpacing:'0.08em', textTransform:'uppercase' }}>
              {done ? '🎁 Your Perfect Matches' : `Step ${step + 1} of ${STEPS.length}`}
            </div>
            {!done && (
              <div style={{ display:'flex', gap:5, marginTop:6 }}>
                {STEPS.map((_, i) => (
                  <div key={i} style={{ height:3, flex:1, borderRadius:2, background: i <= step ? gold : 'rgba(196,122,46,0.18)', transition:'background 0.3s' }} />
                ))}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:20, color:'#C4B09A', cursor:'pointer', padding:4, lineHeight:1 }}>✕</button>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'22px 22px 24px' }}>
          {!done ? (
            /* Quiz step */
            <div>
              <div style={{ textAlign:'center', marginBottom:22 }}>
                <div style={{ fontSize:36, marginBottom:8 }}>{current.emoji}</div>
                <div style={{ fontSize:20, fontWeight:800, color:ink, lineHeight:1.2 }}>{current.question}</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:10 }}>
                {current.options.map(opt => (
                  <button key={opt.label} onClick={() => choose(opt.label)}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, padding:'14px 10px', borderRadius:14, border:`1.5px solid rgba(196,122,46,0.2)`, background:'#fff', cursor:'pointer', fontFamily:font, transition:'all 0.15s', boxShadow:'0 1px 6px rgba(196,122,46,0.06)' }}
                    onMouseEnter={e => { e.currentTarget.style.border=`1.5px solid ${gold}`; e.currentTarget.style.background='rgba(196,122,46,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.border='1.5px solid rgba(196,122,46,0.2)'; e.currentTarget.style.background='#fff'; }}>
                    <span style={{ fontSize:26 }}>{opt.icon}</span>
                    <span style={{ fontSize:12.5, fontWeight:700, color:ink }}>{opt.label}</span>
                    {opt.sub && <span style={{ fontSize:10.5, color:'#9B7450', fontWeight:500 }}>{opt.sub}</span>}
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)}
                  style={{ marginTop:16, background:'none', border:'none', color:'#9B7450', fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:font }}>
                  ← Back
                </button>
              )}
            </div>
          ) : (
            /* Results */
            <div>
              {/* Answer summary */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:18 }}>
                {Object.entries(answers).map(([k, v]) => (
                  <span key={k} style={{ fontSize:11.5, fontWeight:700, color:gold, background:'rgba(196,122,46,0.1)', padding:'4px 12px', borderRadius:100 }}>{v}</span>
                ))}
                <button onClick={restart} style={{ fontSize:11.5, fontWeight:600, color:'#9B7450', background:'none', border:'1px solid rgba(196,122,46,0.2)', padding:'4px 12px', borderRadius:100, cursor:'pointer', fontFamily:font }}>Start over</button>
              </div>

              {results.length === 0 ? (
                <div style={{ textAlign:'center', padding:'32px 0', color:'#9B7450' }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>😔</div>
                  <div style={{ fontSize:14, fontWeight:700, color:ink }}>No exact matches yet</div>
                  <div style={{ fontSize:12, marginTop:4 }}>Our catalogue is growing — chat with us and we'll curate something perfect.</div>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
                  {results.map((s, i) => (
                    <div key={s._id || i}
                      style={{ borderRadius:14, overflow:'hidden', background:'#fff', border:'1px solid rgba(196,122,46,0.12)', boxShadow:'0 2px 10px rgba(196,122,46,0.07)', cursor:'pointer', transition:'transform 0.15s, box-shadow 0.15s' }}
                      onClick={() => { onSelect(s); onClose(); }}
                      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(196,122,46,0.16)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 10px rgba(196,122,46,0.07)'; }}>
                      <div style={{ height:160, overflow:'hidden', position:'relative' }}>
                        <img src={s.url} alt={s.name || 'Gift hamper'}
                          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
                          loading="lazy" />
                        {i < 3 && (
                          <div style={{ position:'absolute', top:8, left:8, fontSize:9.5, fontWeight:800, color:'#fff', background:gold, padding:'3px 8px', borderRadius:100 }}>
                            {i === 0 ? '⭐ Best Match' : i === 1 ? '✨ Great Pick' : '💛 Top Choice'}
                          </div>
                        )}
                      </div>
                      <div style={{ padding:'10px 12px' }}>
                        {s.name && <div style={{ fontSize:12.5, fontWeight:700, color:ink, marginBottom:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</div>}
                        {s.priceRange && <div style={{ fontSize:11.5, color:gold, fontWeight:700 }}>{s.priceRange}</div>}
                        {s.vibe && <div style={{ fontSize:10.5, color:'#9B7450', marginTop:2 }}>{s.vibe}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={onClose}
                style={{ marginTop:20, width:'100%', padding:'13px', borderRadius:12, border:'none', background:`linear-gradient(135deg,${gold},#CCAB4A)`, color:'#fff', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:font, boxShadow:'0 4px 14px rgba(196,122,46,0.3)' }}>
                Browse All Hampers →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
