import { useState, useMemo } from 'react';

const gold  = '#C47A2E';
const ink   = '#2C1A0E';
const cream = '#FFFCF5';
const font  = "'Outfit', sans-serif";

const OCCASION_ICONS = {
  'Birthday': '🎂', 'Anniversary': '💑', 'Diwali': '🪔', 'Festival': '🪔',
  'Corporate': '💼', 'Corporate Gift': '💼', 'Wedding': '💍', 'Baby Shower': '👶',
  'Thank You': '🙏', 'General': '🎁', 'Holi': '🎨', 'Raksha Bandhan': '🧿',
  'Christmas': '🎄', 'Eid': '🌙',
};

const CATEGORY_ICONS = {
  'Dry Fruits & Nuts': '🥜', 'Dry Fruits': '🥜', 'Chocolates': '🍫',
  'Chocolates & Sweets': '🍫', 'Sweets': '🍬', 'Spiritual & Pooja': '🪔',
  'Decorative Boxes': '📦', 'Tokri & Hampers': '🧺', 'Drinkware': '☕',
  'Mixed': '🎁',
};

function getIcon(map, key) {
  return map[key] || '🎁';
}

function scoreMatch(sample, answers) {
  let score = 0;
  const { occasion, category } = answers;
  if (occasion && (sample.occasion || []).includes(occasion)) score += 4;
  if (category) {
    const cats = Array.isArray(sample.category) ? sample.category : (sample.category ? [sample.category] : []);
    if (cats.includes(category)) score += 4;
  }
  // small boost so tagged samples surface above completely untagged ones
  if ((sample.occasion || []).length > 0) score += 0.5;
  return score;
}

export default function GiftQuiz({ samples, occasions, categories, onSelect, onClose }) {
  const [step, setStep]       = useState(0); // 0 = occasion, 1 = category, 2 = results
  const [answers, setAnswers] = useState({});

  const choose = (key, val) => {
    const next = { ...answers, [key]: val };
    setAnswers(next);
    if (step === 0) setTimeout(() => setStep(1), 160);
    else            setTimeout(() => setStep(2), 160);
  };

  const results = useMemo(() => {
    if (step !== 2) return [];
    const scored = samples.map(s => ({ ...s, _score: scoreMatch(s, answers) }));
    scored.sort((a, b) => b._score - a._score);
    const withScore = scored.filter(s => s._score > 0);
    return withScore.length >= 4 ? withScore.slice(0, 12) : scored.slice(0, 12);
  }, [step, samples, answers]);

  const restart = () => { setStep(0); setAnswers({}); };

  // progress bar: 0→33%, 1→66%, 2→100%
  const progress = step === 0 ? 33 : step === 1 ? 66 : 100;

  return (
    <div onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(44,26,14,0.55)', zIndex:9100, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(3px)' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background:cream, borderRadius:24, width:'100%', maxWidth: step === 2 ? 720 : 460, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', fontFamily:font, boxShadow:'0 24px 80px rgba(44,26,14,0.22)', transition:'max-width 0.3s' }}>

        {/* Header */}
        <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid rgba(196,122,46,0.1)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ fontSize:12, fontWeight:700, color:gold, letterSpacing:'0.08em', textTransform:'uppercase' }}>
              {step === 2 ? '🎁 Your Matches' : `Step ${step + 1} of 2`}
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', fontSize:18, color:'#C4B09A', cursor:'pointer', padding:4, lineHeight:1 }}>✕</button>
          </div>
          {/* Progress bar */}
          <div style={{ height:3, background:'rgba(196,122,46,0.15)', borderRadius:2, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(90deg,${gold},#CCAB4A)`, borderRadius:2, transition:'width 0.35s ease' }} />
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'22px 20px 24px' }}>

          {/* Step 0: Occasion */}
          {step === 0 && (
            <div>
              <div style={{ textAlign:'center', marginBottom:22 }}>
                <div style={{ fontSize:34, marginBottom:8 }}>🎉</div>
                <div style={{ fontSize:19, fontWeight:800, color:ink }}>What's the occasion?</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:9 }}>
                {occasions.map(occ => (
                  <button key={occ} onClick={() => choose('occasion', occ)}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, padding:'14px 8px', borderRadius:14, border:'1.5px solid rgba(196,122,46,0.18)', background:'#fff', cursor:'pointer', fontFamily:font }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=gold; e.currentTarget.style.background='rgba(196,122,46,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(196,122,46,0.18)'; e.currentTarget.style.background='#fff'; }}>
                    <span style={{ fontSize:24 }}>{getIcon(OCCASION_ICONS, occ)}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:ink, textAlign:'center', lineHeight:1.3 }}>{occ}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Category */}
          {step === 1 && (
            <div>
              <div style={{ textAlign:'center', marginBottom:22 }}>
                <div style={{ fontSize:34, marginBottom:8 }}>🎁</div>
                <div style={{ fontSize:19, fontWeight:800, color:ink }}>Any gift type preference?</div>
                <div style={{ fontSize:12, color:'#9B7450', marginTop:6 }}>Pick one — or skip to see all</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:9 }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => choose('category', cat)}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, padding:'14px 10px', borderRadius:14, border:'1.5px solid rgba(196,122,46,0.18)', background:'#fff', cursor:'pointer', fontFamily:font }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=gold; e.currentTarget.style.background='rgba(196,122,46,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(196,122,46,0.18)'; e.currentTarget.style.background='#fff'; }}>
                    <span style={{ fontSize:26 }}>{getIcon(CATEGORY_ICONS, cat)}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:ink, textAlign:'center', lineHeight:1.3 }}>{cat}</span>
                  </button>
                ))}
                <button onClick={() => choose('category', null)}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, padding:'14px 10px', borderRadius:14, border:'1.5px dashed rgba(196,122,46,0.3)', background:'transparent', cursor:'pointer', fontFamily:font }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(196,122,46,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}>
                  <span style={{ fontSize:26 }}>✨</span>
                  <span style={{ fontSize:12, fontWeight:700, color:'#9B7450', textAlign:'center' }}>Surprise me</span>
                </button>
              </div>
              <button onClick={() => setStep(0)} style={{ marginTop:14, background:'none', border:'none', color:'#9B7450', fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:font }}>← Back</button>
            </div>
          )}

          {/* Step 2: Results */}
          {step === 2 && (
            <div>
              {/* Answer pills + restart */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:18, alignItems:'center' }}>
                {answers.occasion && <span style={{ fontSize:12, fontWeight:700, color:gold, background:'rgba(196,122,46,0.1)', padding:'4px 12px', borderRadius:100 }}>{answers.occasion}</span>}
                {answers.category && <span style={{ fontSize:12, fontWeight:700, color:gold, background:'rgba(196,122,46,0.1)', padding:'4px 12px', borderRadius:100 }}>{answers.category}</span>}
                <button onClick={restart} style={{ fontSize:12, color:'#9B7450', background:'none', border:'1px solid rgba(196,122,46,0.2)', padding:'4px 12px', borderRadius:100, cursor:'pointer', fontFamily:font }}>Start over</button>
              </div>

              {results.length === 0 ? (
                <div style={{ textAlign:'center', padding:'32px 0' }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>😔</div>
                  <div style={{ fontSize:14, fontWeight:700, color:ink }}>No matches yet</div>
                  <div style={{ fontSize:12, color:'#9B7450', marginTop:4 }}>Chat with us and we'll curate something perfect.</div>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:12 }}>
                  {results.map((s, i) => (
                    <div key={s._id || i}
                      onClick={() => { onSelect(s); onClose(); }}
                      style={{ borderRadius:14, overflow:'hidden', background:'#fff', border:'1px solid rgba(196,122,46,0.12)', cursor:'pointer', boxShadow:'0 2px 10px rgba(196,122,46,0.07)' }}
                      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(196,122,46,0.16)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 10px rgba(196,122,46,0.07)'; }}>
                      <div style={{ height:155, overflow:'hidden', position:'relative' }}>
                        <img src={s.url} alt={s.name || 'Gift hamper'} style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
                        {i < 3 && (
                          <div style={{ position:'absolute', top:8, left:8, fontSize:9.5, fontWeight:800, color:'#fff', background:gold, padding:'3px 8px', borderRadius:100 }}>
                            {i === 0 ? '⭐ Best Match' : i === 1 ? '✨ Great Pick' : '💛 Top Choice'}
                          </div>
                        )}
                      </div>
                      <div style={{ padding:'10px 12px' }}>
                        {s.name && <div style={{ fontSize:12.5, fontWeight:700, color:ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</div>}
                        {s.priceRange && <div style={{ fontSize:11.5, color:gold, fontWeight:700, marginTop:2 }}>{s.priceRange}</div>}
                        {(Array.isArray(s.category) ? s.category[0] : s.category) && (
                          <div style={{ fontSize:10.5, color:'#9B7450', marginTop:2 }}>{Array.isArray(s.category) ? s.category[0] : s.category}</div>
                        )}
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
