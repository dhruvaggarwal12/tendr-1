import { useState, useMemo } from 'react';

const gold  = '#C47A2E';
const ink   = '#2C1A0E';
const cream = '#FFFCF5';
const font  = "'Outfit', sans-serif";

const OCCASION_ICONS = {
  'Birthday':'🎂','Anniversary':'💑','Diwali':'🪔','Festival':'🪔',
  'Corporate':'💼','Corporate Gift':'💼','Wedding':'💍','Baby Shower':'👶',
  'Thank You':'🙏','General':'🎁','Holi':'🎨','Raksha Bandhan':'🧿',
  'Christmas':'🎄','Eid':'🌙',
};

const CATEGORY_ICONS = {
  'Dry Fruits & Nuts':'🥜','Dry Fruits':'🥜','Chocolates':'🍫',
  'Chocolates & Sweets':'🍫','Sweets':'🍬','Spiritual & Pooja':'🪔',
  'Decorative Boxes':'📦','Tokri & Hampers':'🧺','Drinkware':'☕',
  'Mixed':'🎁',
};

const RECIPIENTS = [
  { id: 'him',    label: 'For Him',           emoji: '👨',
    cats: ['Dry Fruits & Nuts', 'Drinkware'], occs: [] },
  { id: 'her',    label: 'For Her',           emoji: '👩',
    cats: ['Chocolates & Sweets', 'Decorative Boxes', 'Spiritual & Pooja'], occs: [] },
  { id: 'couple', label: 'For a Couple',      emoji: '👫',
    cats: ['Decorative Boxes', 'Tokri & Hampers'], occs: ['Wedding', 'Anniversary'] },
  { id: 'parents',label: 'For Parents',       emoji: '👴',
    cats: ['Spiritual & Pooja', 'Dry Fruits & Nuts', 'Tokri & Hampers'], occs: [] },
  { id: 'boss',   label: 'For Boss / Colleague', emoji: '💼',
    cats: ['Drinkware', 'Dry Fruits & Nuts', 'Decorative Boxes'], occs: ['Corporate'] },
  { id: 'kids',   label: 'For Kids',          emoji: '🧒',
    cats: ['Chocolates & Sweets', 'Tokri & Hampers'], occs: ['Birthday'] },
  { id: 'friend', label: 'For a Friend',      emoji: '🤝',
    cats: ['Chocolates & Sweets', 'Tokri & Hampers'], occs: ['Birthday', 'Thank You'] },
  { id: 'anyone', label: 'Anyone / General',  emoji: '🎁',
    cats: [], occs: [] },
];

function getIcon(map, key) { return map[key] || '🎁'; }

function scoreMatch(sample, answers) {
  let score = 0;
  const { occasion, recipient, category } = answers;
  const sOcc  = sample.occasion || [];
  const sCats = Array.isArray(sample.category) ? sample.category : (sample.category ? [sample.category] : []);

  // Direct occasion match
  if (occasion && sOcc.includes(occasion)) score += 4;

  // Direct category match
  if (category && sCats.includes(category)) score += 4;

  // Recipient inference — occasion
  if (recipient) {
    const r = RECIPIENTS.find(r => r.id === recipient);
    if (r) {
      r.occs.forEach(o => { if (sOcc.includes(o)) score += 2; });
      r.cats.forEach(c => { if (sCats.includes(c)) score += 2; });
    }
  }

  // Small boost for samples that have any tags (surfaces them above untagged)
  if (sOcc.length > 0 || sCats.length > 0) score += 0.5;

  return score;
}

// ── Pill component ────────────────────────────────────────────────────────────
function Pill({ label, onRemove }) {
  return (
    <span style={{ fontSize:12, fontWeight:700, color:gold, background:'rgba(196,122,46,0.1)', padding:'4px 10px', borderRadius:100, display:'inline-flex', alignItems:'center', gap:5 }}>
      {label}
      {onRemove && <button onClick={onRemove} style={{ background:'none', border:'none', cursor:'pointer', color:gold, fontSize:13, lineHeight:1, padding:0 }}>×</button>}
    </span>
  );
}

// ── Option grid button ────────────────────────────────────────────────────────
function OptionBtn({ emoji, label, selected, onClick }) {
  return (
    <button onClick={onClick}
      style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, padding:'14px 8px', borderRadius:14, border:`1.5px solid ${selected ? gold : 'rgba(196,122,46,0.18)'}`, background: selected ? 'rgba(196,122,46,0.08)' : '#fff', cursor:'pointer', fontFamily:font, transition:'all 0.12s', boxShadow: selected ? `0 0 0 2px ${gold}44` : 'none' }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor=gold; e.currentTarget.style.background='rgba(196,122,46,0.04)'; }}}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor='rgba(196,122,46,0.18)'; e.currentTarget.style.background='#fff'; }}}>
      <span style={{ fontSize:24 }}>{emoji}</span>
      <span style={{ fontSize:11.5, fontWeight:700, color:ink, textAlign:'center', lineHeight:1.3 }}>{label}</span>
    </button>
  );
}

export default function GiftQuiz({ samples, occasions, categories, onSelect, onClose }) {
  const [step,    setStep]    = useState(0); // 0=occasion 1=recipient 2=category 3=results
  const [answers, setAnswers] = useState({});

  const TOTAL_STEPS = 3;

  const choose = (key, val) => {
    const next = { ...answers, [key]: val };
    setAnswers(next);
    const nextStep = step + 1;
    if (nextStep < TOTAL_STEPS) setTimeout(() => setStep(nextStep), 150);
    else                         setTimeout(() => setStep(TOTAL_STEPS), 150);
  };

  const skip = (key) => {
    const next = { ...answers, [key]: null };
    setAnswers(next);
    const nextStep = step + 1;
    if (nextStep < TOTAL_STEPS) setStep(nextStep);
    else                         setStep(TOTAL_STEPS);
  };

  const results = useMemo(() => {
    if (step !== TOTAL_STEPS) return [];
    const scored = samples.map(s => ({ ...s, _score: scoreMatch(s, answers) }));
    scored.sort((a, b) => b._score - a._score);
    const withScore = scored.filter(s => s._score > 0);
    return withScore.length >= 4 ? withScore.slice(0, 12) : scored.slice(0, 12);
  }, [step, samples, answers]);

  const restart = () => { setStep(0); setAnswers({}); };

  const progress = Math.round(((step) / (TOTAL_STEPS)) * 100);

  const STEPS_META = [
    { key: 'occasion',  label: 'Occasion',   emoji: '🎉' },
    { key: 'recipient', label: 'Recipient',   emoji: '🎁' },
    { key: 'category',  label: 'Gift type',   emoji: '📦' },
  ];

  return (
    <div onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(44,26,14,0.55)', zIndex:9100, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(3px)' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background:cream, borderRadius:24, width:'100%', maxWidth: step === TOTAL_STEPS ? 720 : 480, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', fontFamily:font, boxShadow:'0 24px 80px rgba(44,26,14,0.22)', transition:'max-width 0.3s' }}>

        {/* Header */}
        <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid rgba(196,122,46,0.1)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ fontSize:12, fontWeight:700, color:gold, letterSpacing:'0.08em', textTransform:'uppercase' }}>
              {step === TOTAL_STEPS ? '🎁 Your Matches' : `Step ${step + 1} of ${TOTAL_STEPS}`}
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', fontSize:18, color:'#C4B09A', cursor:'pointer', padding:4, lineHeight:1 }}>✕</button>
          </div>
          {/* Progress bar */}
          <div style={{ height:3, background:'rgba(196,122,46,0.15)', borderRadius:2, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(90deg,${gold},#CCAB4A)`, borderRadius:2, transition:'width 0.35s ease' }} />
          </div>
          {/* Step breadcrumbs */}
          {step < TOTAL_STEPS && (
            <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
              {STEPS_META.map((s, i) => (
                <span key={s.key} style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:100, background: i < step ? 'rgba(196,122,46,0.12)' : i === step ? `${gold}22` : 'transparent', color: i <= step ? gold : '#C4B09A', border: `1px solid ${i <= step ? gold+'33' : 'transparent'}` }}>
                  {s.emoji} {s.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'22px 20px 24px' }}>

          {/* ── Step 0: Occasion ── */}
          {step === 0 && (
            <div>
              <div style={{ textAlign:'center', marginBottom:22 }}>
                <div style={{ fontSize:34, marginBottom:8 }}>🎉</div>
                <div style={{ fontSize:19, fontWeight:800, color:ink }}>What's the occasion?</div>
                <div style={{ fontSize:12, color:'#9B7450', marginTop:5 }}>We'll find gifts that fit perfectly</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))', gap:9 }}>
                {occasions.map(occ => (
                  <OptionBtn key={occ} emoji={getIcon(OCCASION_ICONS, occ)} label={occ} selected={answers.occasion === occ} onClick={() => choose('occasion', occ)} />
                ))}
              </div>
              <button onClick={() => skip('occasion')} style={{ marginTop:14, background:'none', border:'none', color:'#9B7450', fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:font, display:'block', marginLeft:'auto', marginRight:'auto' }}>
                Skip this step →
              </button>
            </div>
          )}

          {/* ── Step 1: Recipient ── */}
          {step === 1 && (
            <div>
              <div style={{ textAlign:'center', marginBottom:22 }}>
                <div style={{ fontSize:34, marginBottom:8 }}>🎁</div>
                <div style={{ fontSize:19, fontWeight:800, color:ink }}>Who is the gift for?</div>
                <div style={{ fontSize:12, color:'#9B7450', marginTop:5 }}>Helps us match the right style and items</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:9 }}>
                {RECIPIENTS.map(r => (
                  <OptionBtn key={r.id} emoji={r.emoji} label={r.label} selected={answers.recipient === r.id} onClick={() => choose('recipient', r.id)} />
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:14 }}>
                <button onClick={() => setStep(0)} style={{ background:'none', border:'none', color:'#9B7450', fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:font }}>← Back</button>
                <button onClick={() => skip('recipient')} style={{ background:'none', border:'none', color:'#9B7450', fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:font }}>Skip →</button>
              </div>
            </div>
          )}

          {/* ── Step 2: Category ── */}
          {step === 2 && (
            <div>
              <div style={{ textAlign:'center', marginBottom:22 }}>
                <div style={{ fontSize:34, marginBottom:8 }}>📦</div>
                <div style={{ fontSize:19, fontWeight:800, color:ink }}>Any gift type preference?</div>
                <div style={{ fontSize:12, color:'#9B7450', marginTop:5 }}>Pick one — or skip to see all</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:9 }}>
                {categories.map(cat => (
                  <OptionBtn key={cat} emoji={getIcon(CATEGORY_ICONS, cat)} label={cat} selected={answers.category === cat} onClick={() => choose('category', cat)} />
                ))}
                <button onClick={() => choose('category', null)}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, padding:'14px 10px', borderRadius:14, border:'1.5px dashed rgba(196,122,46,0.3)', background:'transparent', cursor:'pointer', fontFamily:font }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(196,122,46,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}>
                  <span style={{ fontSize:26 }}>✨</span>
                  <span style={{ fontSize:11.5, fontWeight:700, color:'#9B7450', textAlign:'center' }}>Surprise me</span>
                </button>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:14 }}>
                <button onClick={() => setStep(1)} style={{ background:'none', border:'none', color:'#9B7450', fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:font }}>← Back</button>
              </div>
            </div>
          )}

          {/* ── Step 3: Results ── */}
          {step === TOTAL_STEPS && (
            <div>
              {/* Answer pills */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:18, alignItems:'center' }}>
                {answers.occasion  && <Pill label={getIcon(OCCASION_ICONS, answers.occasion) + ' ' + answers.occasion} onRemove={() => { setAnswers(a => ({...a, occasion: null})); setStep(0); }} />}
                {answers.recipient && (() => { const r = RECIPIENTS.find(r => r.id === answers.recipient); return r ? <Pill label={r.emoji + ' ' + r.label} onRemove={() => { setAnswers(a => ({...a, recipient: null})); setStep(1); }} /> : null; })()}
                {answers.category  && <Pill label={getIcon(CATEGORY_ICONS, answers.category) + ' ' + answers.category} onRemove={() => { setAnswers(a => ({...a, category: null})); setStep(2); }} />}
                <button onClick={restart} style={{ fontSize:12, color:'#9B7450', background:'none', border:'1px solid rgba(196,122,46,0.2)', padding:'4px 12px', borderRadius:100, cursor:'pointer', fontFamily:font }}>Start over</button>
              </div>

              {results.length === 0 ? (
                <div style={{ textAlign:'center', padding:'32px 0' }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>😔</div>
                  <div style={{ fontSize:14, fontWeight:700, color:ink }}>No matches yet</div>
                  <div style={{ fontSize:12, color:'#9B7450', marginTop:4 }}>Chat with us and we'll curate something perfect.</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize:12, color:'#9B7450', marginBottom:14, fontWeight:600 }}>
                    {results.length} gift{results.length !== 1 ? 's' : ''} matched for you
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(165px,1fr))', gap:12 }}>
                    {results.map((s, i) => (
                      <div key={s._id || i}
                        onClick={() => { onSelect(s); onClose(); }}
                        style={{ borderRadius:14, overflow:'hidden', background:'#fff', border:'1px solid rgba(196,122,46,0.12)', cursor:'pointer', boxShadow:'0 2px 10px rgba(196,122,46,0.07)', transition:'transform 0.15s, box-shadow 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(196,122,46,0.16)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 10px rgba(196,122,46,0.07)'; }}>
                        <div style={{ height:150, overflow:'hidden', position:'relative' }}>
                          <img src={s.url} alt={s.name || 'Gift hamper'} style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
                          {i < 3 && (
                            <div style={{ position:'absolute', top:8, left:8, fontSize:9.5, fontWeight:800, color:'#fff', background:gold, padding:'3px 8px', borderRadius:100 }}>
                              {i === 0 ? '⭐ Best Match' : i === 1 ? '✨ Great Pick' : '💛 Top Choice'}
                            </div>
                          )}
                        </div>
                        <div style={{ padding:'10px 12px' }}>
                          {s.name && <div style={{ fontSize:12.5, fontWeight:700, color:ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</div>}
                          {(Array.isArray(s.category) ? s.category[0] : s.category) && (
                            <div style={{ fontSize:10.5, color:'#9B7450', marginTop:2 }}>{getIcon(CATEGORY_ICONS, Array.isArray(s.category) ? s.category[0] : s.category)} {Array.isArray(s.category) ? s.category[0] : s.category}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
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
