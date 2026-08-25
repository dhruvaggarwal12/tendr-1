import { useState, useMemo } from 'react';

const gold  = '#C47A2E';
const ink   = '#2C1A0E';
const cream = '#FFFCF5';
const muted = '#9B7450';
const font  = "'Outfit', sans-serif";

// ── Data ────────────────────────────────────────────────────────────────────

const RECIPIENTS = [
  { id:'him',       emoji:'👨',    label:'Him',               sub:'Husband, boyfriend, brother',
    cats:['Dry Fruits & Nuts','Drinkware'], occs:[] },
  { id:'her',       emoji:'👩',    label:'Her',               sub:'Wife, girlfriend, sister',
    cats:['Chocolates & Sweets','Decorative Boxes','Spiritual & Pooja'], occs:[] },
  { id:'couple',    emoji:'💑',    label:'Couple',            sub:'Newlyweds or anniversary pair',
    cats:['Decorative Boxes','Tokri & Hampers','Drinkware'], occs:['Wedding','Anniversary'] },
  { id:'parents',   emoji:'👴',    label:'Parents / In-laws', sub:'Mom, dad, in-laws',
    cats:['Spiritual & Pooja','Dry Fruits & Nuts','Tokri & Hampers'], occs:[] },
  { id:'grandparents', emoji:'🧓', label:'Grandparents',      sub:'Nana, nani, dada, dadi',
    cats:['Spiritual & Pooja','Dry Fruits & Nuts'], occs:[] },
  { id:'baby',      emoji:'👶',    label:'New Baby',          sub:'Baby shower or welcome gift',
    cats:['Chocolates & Sweets','Decorative Boxes'], occs:['Baby Shower'] },
  { id:'kids',      emoji:'🧒',    label:'Kids',              sub:'Children 4–12 years',
    cats:['Chocolates & Sweets','Tokri & Hampers'], occs:['Birthday'] },
  { id:'boss',      emoji:'👔',    label:'Boss / Senior',     sub:'A thoughtful professional gift',
    cats:['Drinkware','Dry Fruits & Nuts','Decorative Boxes'], occs:['Corporate'] },
  { id:'colleague', emoji:'🤝',    label:'Colleague / Client',sub:'Thank-you or festive gifts',
    cats:['Dry Fruits & Nuts','Chocolates & Sweets','Drinkware'], occs:['Corporate','Thank You'] },
  { id:'teacher',   emoji:'📚',    label:'Teacher / Mentor',  sub:'Show appreciation',
    cats:['Dry Fruits & Nuts','Decorative Boxes'], occs:['Thank You'] },
  { id:'friend',    emoji:'🥳',    label:'Friends',           sub:'BFF or group of friends',
    cats:['Chocolates & Sweets','Tokri & Hampers'], occs:['Birthday','Thank You'] },
  { id:'family',    emoji:'🏠',    label:'Whole Family',      sub:'For the entire household',
    cats:['Tokri & Hampers','Dry Fruits & Nuts','Chocolates & Sweets'], occs:['Diwali','General'] },
];

const VIBES = [
  { id:'traditional', emoji:'🪔', label:'Traditional & Festive',
    sub:'Spiritual, classic, rooted in culture',
    cats:['Spiritual & Pooja','Tokri & Hampers','Dry Fruits & Nuts'], occs:['Diwali'] },
  { id:'premium',     emoji:'💎', label:'Premium & Luxurious',
    sub:'Elegant, upscale, makes an impression',
    cats:['Decorative Boxes','Drinkware','Dry Fruits & Nuts'], occs:[] },
  { id:'sweet',       emoji:'🍫', label:'Sweet & Indulgent',
    sub:'Chocolates, sweets, joyful treats',
    cats:['Chocolates & Sweets','Tokri & Hampers'], occs:[] },
  { id:'healthy',     emoji:'🌿', label:'Healthy & Nutritious',
    sub:'Dry fruits, nuts, wholesome hampers',
    cats:['Dry Fruits & Nuts','Tokri & Hampers'], occs:[] },
  { id:'artistic',    emoji:'✨', label:'Elegant & Artistic',
    sub:'Decorative pieces, artisan collectibles',
    cats:['Decorative Boxes','Drinkware'], occs:[] },
  { id:'fun',         emoji:'🎉', label:'Fun & Celebratory',
    sub:'Colourful, festive, full of cheer',
    cats:['Chocolates & Sweets','Tokri & Hampers'], occs:['Birthday'] },
];

const OCC_ICON = {
  'Birthday':'🎂','Anniversary':'💑','Diwali':'🪔','Festival':'🪔',
  'Corporate':'💼','Wedding':'💍','Baby Shower':'👶',
  'Thank You':'🙏','General':'🎁','Holi':'🎨','Raksha Bandhan':'🧿',
  'Christmas':'🎄','Eid':'🌙',
};

const CAT_ICON = {
  'Dry Fruits & Nuts':'🥜','Chocolates & Sweets':'🍫',
  'Spiritual & Pooja':'🪔','Decorative Boxes':'📦',
  'Tokri & Hampers':'🧺','Drinkware':'☕',
};

const gi = (map, k) => map[k] || '🎁';

// ── Scoring ──────────────────────────────────────────────────────────────────

function score(sample, ans) {
  let s = 0;
  const sOcc  = sample.occasion || [];
  const sCats = Array.isArray(sample.category)
    ? sample.category
    : sample.category ? [sample.category] : [];

  // Direct picks
  if (ans.occasion && sOcc.includes(ans.occasion))  s += 5;
  if (ans.category && sCats.includes(ans.category)) s += 5;

  // Recipient inference
  if (ans.recipient) {
    const r = RECIPIENTS.find(r => r.id === ans.recipient);
    if (r) {
      r.occs.forEach(o => { if (sOcc.includes(o))   s += 2; });
      r.cats.forEach(c => { if (sCats.includes(c))  s += 2; });
    }
  }

  // Vibe inference
  if (ans.vibe) {
    const v = VIBES.find(v => v.id === ans.vibe);
    if (v) {
      v.occs.forEach(o => { if (sOcc.includes(o))   s += 2; });
      v.cats.forEach(c => { if (sCats.includes(c))  s += 3; });
    }
  }

  if (sOcc.length > 0 || sCats.length > 0) s += 0.5;
  return s;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function RecipientCard({ r, selected, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        background: selected ? `${gold}10` : '#fff',
        border: `1.5px solid ${selected ? gold : 'rgba(196,122,46,0.15)'}`,
        borderRadius: 14, padding: '12px 8px', cursor: 'pointer', fontFamily: font,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        transition: 'all 0.12s', boxShadow: selected ? `0 0 0 2.5px ${gold}44` : 'none',
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor=gold; e.currentTarget.style.background=`${gold}06`; }}}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor='rgba(196,122,46,0.15)'; e.currentTarget.style.background='#fff'; }}}>
      <span style={{ fontSize: 28 }}>{r.emoji}</span>
      <span style={{ fontSize: 12, fontWeight: 800, color: ink, textAlign: 'center', lineHeight: 1.2 }}>{r.label}</span>
      <span style={{ fontSize: 9.5, color: muted, textAlign: 'center', lineHeight: 1.3 }}>{r.sub}</span>
    </button>
  );
}

function VibeCard({ v, selected, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        background: selected ? `${gold}10` : '#fff',
        border: `1.5px solid ${selected ? gold : 'rgba(196,122,46,0.15)'}`,
        borderRadius: 16, padding: '16px 14px', cursor: 'pointer', fontFamily: font,
        display: 'flex', alignItems: 'flex-start', gap: 12,
        transition: 'all 0.12s', boxShadow: selected ? `0 0 0 2.5px ${gold}44` : 'none',
        textAlign: 'left',
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor=gold; e.currentTarget.style.background=`${gold}06`; }}}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor='rgba(196,122,46,0.15)'; e.currentTarget.style.background='#fff'; }}}>
      <span style={{ fontSize: 28, flexShrink: 0, marginTop: 1 }}>{v.emoji}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, color: ink, marginBottom: 2 }}>{v.label}</div>
        <div style={{ fontSize: 11, color: muted, lineHeight: 1.4 }}>{v.sub}</div>
      </div>
    </button>
  );
}

function OccBtn({ emoji, label, selected, onClick }) {
  return (
    <button onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 5, padding: '12px 8px', borderRadius: 12,
        border: `1.5px solid ${selected ? gold : 'rgba(196,122,46,0.15)'}`,
        background: selected ? `${gold}10` : '#fff',
        cursor: 'pointer', fontFamily: font,
        boxShadow: selected ? `0 0 0 2.5px ${gold}44` : 'none', transition: 'all 0.12s',
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor=gold; e.currentTarget.style.background=`${gold}06`; }}}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor='rgba(196,122,46,0.15)'; e.currentTarget.style.background='#fff'; }}}>
      <span style={{ fontSize: 22 }}>{emoji}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: ink, textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
    </button>
  );
}

function NavRow({ onBack, onSkip, skipLabel = 'Skip this →' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
      {onBack
        ? <button onClick={onBack} style={{ background: 'none', border: 'none', color: muted, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: font }}>← Back</button>
        : <span />}
      {onSkip
        ? <button onClick={onSkip} style={{ background: 'none', border: 'none', color: muted, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: font }}>{skipLabel}</button>
        : <span />}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

const STEPS = ['recipient', 'occasion', 'vibe', 'category'];

export default function GiftQuiz({ samples, occasions, categories, onSelect, onClose }) {
  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState({});

  const total = STEPS.length;

  const pick = (key, val) => {
    const next = { ...answers, [key]: val };
    setAnswers(next);
    setTimeout(() => setStep(s => Math.min(s + 1, total)), 140);
  };

  const skip = (key) => {
    setAnswers(a => ({ ...a, [key]: null }));
    setStep(s => Math.min(s + 1, total));
  };

  const back = () => setStep(s => Math.max(s - 1, 0));

  const restart = () => { setStep(0); setAnswers({}); };

  const results = useMemo(() => {
    if (step !== total) return [];
    const scored = samples.map(s => ({ ...s, _score: score(s, answers) }));
    scored.sort((a, b) => b._score - a._score);
    const hit = scored.filter(s => s._score > 0);
    return (hit.length >= 4 ? hit : scored).slice(0, 12);
  }, [step, samples, answers]);

  const progress = Math.round((step / total) * 100);

  const stepMeta = [
    { key: 'recipient', label: 'Who' },
    { key: 'occasion',  label: 'Occasion' },
    { key: 'vibe',      label: 'Vibe' },
    { key: 'category',  label: 'Gift type' },
  ];

  return (
    <div onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(44,26,14,0.6)', zIndex:9100, display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background:cream, borderRadius:24, width:'100%', maxWidth: step === total ? 740 : 520, maxHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column', fontFamily:font, boxShadow:'0 28px 90px rgba(44,26,14,0.25)', transition:'max-width 0.3s ease' }}>

        {/* ── Header ── */}
        <div style={{ padding:'16px 20px 12px', borderBottom:'1px solid rgba(196,122,46,0.1)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              {step < total && step > 0 && (
                <button onClick={back} style={{ background:`${gold}12`, border:'none', borderRadius:8, width:28, height:28, cursor:'pointer', color:gold, fontWeight:800, fontSize:15, display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
              )}
              <div style={{ fontSize:11.5, fontWeight:800, color:gold, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                {step === total ? '🎁 Your Gift Matches' : `Step ${step + 1} of ${total}`}
              </div>
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', fontSize:18, color:'#C4B09A', cursor:'pointer', padding:4, lineHeight:1 }}>✕</button>
          </div>

          {/* Progress bar */}
          <div style={{ height:4, background:'rgba(196,122,46,0.12)', borderRadius:4, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(90deg,${gold},#E8C074)`, borderRadius:4, transition:'width 0.4s cubic-bezier(.4,0,.2,1)' }} />
          </div>

          {/* Step dots */}
          {step < total && (
            <div style={{ display:'flex', gap:6, marginTop:10, alignItems:'center' }}>
              {stepMeta.map((s, i) => (
                <div key={s.key} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{
                    width: i < step ? 8 : i === step ? 10 : 8,
                    height: i < step ? 8 : i === step ? 10 : 8,
                    borderRadius: '50%',
                    background: i < step ? gold : i === step ? gold : 'rgba(196,122,46,0.2)',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }} />
                  {i === step && <span style={{ fontSize:11, fontWeight:700, color:gold }}>{s.label}</span>}
                  {i < total - 1 && i !== step && <div style={{ width:12, height:1, background:'rgba(196,122,46,0.15)' }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 20px 24px' }}>

          {/* ─── STEP 0: Who is it for ─── */}
          {step === 0 && (
            <div>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:22, fontWeight:800, color:ink }}>Who is the gift for?</div>
                <div style={{ fontSize:13, color:muted, marginTop:4 }}>We'll use this to find the most fitting gifts</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:9 }}>
                {RECIPIENTS.map(r => (
                  <RecipientCard key={r.id} r={r} selected={answers.recipient === r.id} onClick={() => pick('recipient', r.id)} />
                ))}
              </div>
              <NavRow onSkip={() => skip('recipient')} skipLabel="Skip, show all →" />
            </div>
          )}

          {/* ─── STEP 1: Occasion ─── */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:22, fontWeight:800, color:ink }}>What's the occasion?</div>
                <div style={{ fontSize:13, color:muted, marginTop:4 }}>Narrows it down to the right type of gift</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(105px,1fr))', gap:9 }}>
                {occasions.map(occ => (
                  <OccBtn key={occ} emoji={gi(OCC_ICON, occ)} label={occ} selected={answers.occasion === occ} onClick={() => pick('occasion', occ)} />
                ))}
              </div>
              <NavRow onBack={back} onSkip={() => skip('occasion')} />
            </div>
          )}

          {/* ─── STEP 2: Vibe / Feel ─── */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:22, fontWeight:800, color:ink }}>What's the feel?</div>
                <div style={{ fontSize:13, color:muted, marginTop:4 }}>Pick the mood that fits your gift best</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10 }}>
                {VIBES.map(v => (
                  <VibeCard key={v.id} v={v} selected={answers.vibe === v.id} onClick={() => pick('vibe', v.id)} />
                ))}
              </div>
              <NavRow onBack={back} onSkip={() => skip('vibe')} skipLabel="Skip, any vibe →" />
            </div>
          )}

          {/* ─── STEP 3: Category (optional) ─── */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:22, fontWeight:800, color:ink }}>Any gift type in mind?</div>
                <div style={{ fontSize:13, color:muted, marginTop:4 }}>Optional — or let us surprise you</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:9 }}>
                {categories.map(cat => (
                  <OccBtn key={cat} emoji={gi(CAT_ICON, cat)} label={cat} selected={answers.category === cat} onClick={() => pick('category', cat)} />
                ))}
                <button onClick={() => pick('category', null)}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6, padding:'14px 10px', borderRadius:12, border:'1.5px dashed rgba(196,122,46,0.3)', background:'transparent', cursor:'pointer', fontFamily:font }}
                  onMouseEnter={e => { e.currentTarget.style.background=`${gold}07`; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}>
                  <span style={{ fontSize:24 }}>✨</span>
                  <span style={{ fontSize:11.5, fontWeight:700, color:muted, textAlign:'center' }}>Surprise me</span>
                </button>
              </div>
              <NavRow onBack={back} onSkip={() => pick('category', null)} skipLabel="Skip this →" />
            </div>
          )}

          {/* ─── RESULTS ─── */}
          {step === total && (
            <div>
              {/* Summary pills */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:18, alignItems:'center' }}>
                {answers.recipient && (() => { const r = RECIPIENTS.find(r => r.id === answers.recipient); return r ? <button onClick={() => { setAnswers(a=>({...a,recipient:null})); setStep(0); }} style={{ fontSize:11.5, fontWeight:700, color:gold, background:`${gold}12`, padding:'4px 10px', borderRadius:100, border:'none', cursor:'pointer', fontFamily:font }}>{r.emoji} {r.label} ×</button> : null; })()}
                {answers.occasion  && <button onClick={() => { setAnswers(a=>({...a,occasion:null})); setStep(1); }} style={{ fontSize:11.5, fontWeight:700, color:gold, background:`${gold}12`, padding:'4px 10px', borderRadius:100, border:'none', cursor:'pointer', fontFamily:font }}>{gi(OCC_ICON,answers.occasion)} {answers.occasion} ×</button>}
                {answers.vibe      && (() => { const v = VIBES.find(v=>v.id===answers.vibe); return v ? <button onClick={() => { setAnswers(a=>({...a,vibe:null})); setStep(2); }} style={{ fontSize:11.5, fontWeight:700, color:gold, background:`${gold}12`, padding:'4px 10px', borderRadius:100, border:'none', cursor:'pointer', fontFamily:font }}>{v.emoji} {v.label} ×</button> : null; })()}
                {answers.category  && <button onClick={() => { setAnswers(a=>({...a,category:null})); setStep(3); }} style={{ fontSize:11.5, fontWeight:700, color:gold, background:`${gold}12`, padding:'4px 10px', borderRadius:100, border:'none', cursor:'pointer', fontFamily:font }}>{gi(CAT_ICON,answers.category)} {answers.category} ×</button>}
                <button onClick={restart} style={{ fontSize:11.5, color:muted, background:'none', border:`1px solid ${gold}30`, padding:'4px 10px', borderRadius:100, cursor:'pointer', fontFamily:font }}>↺ Start over</button>
              </div>

              {results.length === 0 ? (
                <div style={{ textAlign:'center', padding:'36px 0' }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>😔</div>
                  <div style={{ fontSize:16, fontWeight:700, color:ink }}>No matches found</div>
                  <div style={{ fontSize:13, color:muted, marginTop:6 }}>Try a different combination or chat with us.</div>
                  <button onClick={restart} style={{ marginTop:16, padding:'10px 22px', borderRadius:12, border:`1.5px solid ${gold}`, background:'transparent', color:gold, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:font }}>Try again</button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize:13, fontWeight:700, color:muted, marginBottom:14 }}>
                    {results.length} gift{results.length !== 1 ? 's' : ''} found for you
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(165px,1fr))', gap:12 }}>
                    {results.map((s, i) => (
                      <div key={s._id || i}
                        onClick={() => { onSelect(s); onClose(); }}
                        style={{ borderRadius:14, overflow:'hidden', background:'#fff', border:'1px solid rgba(196,122,46,0.12)', cursor:'pointer', boxShadow:'0 2px 10px rgba(196,122,46,0.07)', transition:'transform 0.14s, box-shadow 0.14s' }}
                        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(196,122,46,0.18)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 10px rgba(196,122,46,0.07)'; }}>
                        <div style={{ height:155, overflow:'hidden', position:'relative' }}>
                          <img src={s.url} alt={s.name || 'Gift'} style={{ width:'100%', height:'100%', objectFit:'cover' }} loading="lazy" />
                          {i < 3 && (
                            <div style={{ position:'absolute', top:8, left:8, fontSize:9.5, fontWeight:800, color:'#fff', background: i===0 ? '#B8860B' : gold, padding:'3px 9px', borderRadius:100, backdropFilter:'blur(4px)' }}>
                              {i===0 ? '⭐ Best Match' : i===1 ? '✨ Great Pick' : '💛 Top Choice'}
                            </div>
                          )}
                        </div>
                        <div style={{ padding:'10px 12px' }}>
                          {s.name && <div style={{ fontSize:12.5, fontWeight:700, color:ink, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</div>}
                          {(Array.isArray(s.category) ? s.category[0] : s.category) && (
                            <div style={{ fontSize:10.5, color:muted, marginTop:2 }}>
                              {gi(CAT_ICON, Array.isArray(s.category) ? s.category[0] : s.category)} {Array.isArray(s.category) ? s.category[0] : s.category}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button onClick={onClose}
                style={{ marginTop:22, width:'100%', padding:'13px', borderRadius:12, border:'none', background:`linear-gradient(135deg,${gold},#E8C074)`, color:'#fff', fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:font, boxShadow:`0 4px 16px ${gold}44` }}>
                Browse All Hampers →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
