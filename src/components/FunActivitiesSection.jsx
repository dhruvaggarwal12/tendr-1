import React, { useState, useRef } from "react";
import { FUN_ACTIVITIES } from "../data/funActivitiesData";

const F  = "'Outfit', sans-serif";
const GOLD  = "#C47A2E";
const BROWN = "#2C1A0E";
const PURPLE = "#C47A2E";

// ── Booking Panel (slides in from right) ─────────────────────────────────────
function BookingPanel({ activity, onClose }) {
  const [form, setForm]     = useState({ name:"", phone:"", date:"", time:"", address:"", notes:"" });
  const [submitted, setSubmitted] = useState(false);
  const set = (k, v)        => setForm(f => ({ ...f, [k]: v }));
  const valid               = form.name && form.phone && form.date && form.time && form.address;

  const inp = (label, key, ph, type="text", req=true) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:12, fontWeight:700, color:BROWN, display:"block", marginBottom:5, fontFamily:F }}>
        {label}{req && <span style={{ color:"#DC2626" }}> *</span>}
      </label>
      <input type={type} value={form[key]} onChange={e => set(key, e.target.value)}
        placeholder={ph} required={req}
        style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1.5px solid rgba(44,26,14,0.12)", fontFamily:F, fontSize:13, color:BROWN, outline:"none", boxSizing:"border-box", background:"#fff" }}
        onFocus={e => e.target.style.borderColor=GOLD}
        onBlur={e => e.target.style.borderColor="rgba(44,26,14,0.12)"} />
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:1100, backdropFilter:"blur(2px)" }} />
      {/* Panel */}
      <div style={{ position:"fixed", top:0, right:0, bottom:0, width:"min(96vw,420px)", background:"#FFFCF5", zIndex:1101, display:"flex", flexDirection:"column", boxShadow:"-8px 0 40px rgba(0,0,0,0.18)", overflowY:"auto" }}>
        {/* Header */}
        <div style={{ padding:"18px 20px 16px", borderBottom:"1.5px solid rgba(44,26,14,0.07)", position:"sticky", top:0, background:"#FFFCF5", zIndex:2 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:PURPLE, textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 3px", fontFamily:F }}>🎭 Fun Activity · Fixed Price</p>
              <h3 style={{ fontSize:17, fontWeight:900, color:BROWN, margin:0, fontFamily:F }}>{activity.emoji} {activity.name}</h3>
            </div>
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:"50%", border:"1.5px solid rgba(44,26,14,0.1)", background:"#fff", color:"#9B7450", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F }}>×</button>
          </div>
          {/* Price strip */}
          <div style={{ marginTop:12, background:`linear-gradient(135deg,${PURPLE},#CCAB4A)`, borderRadius:12, padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <p style={{ fontSize:10, color:"rgba(255,255,255,0.7)", margin:0, fontWeight:700, letterSpacing:"0.08em", fontFamily:F }}>FIXED PRICE — NO SURPRISES</p>
              <p style={{ fontSize:22, fontWeight:900, color:"#fff", margin:"2px 0 0", fontFamily:F }}>₹{activity.price.toLocaleString("en-IN")}</p>
            </div>
            <div style={{ textAlign:"right" }}>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.6)", margin:0, fontFamily:F }}>⏱ {activity.duration}</p>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.6)", margin:"2px 0 0", fontFamily:F }}>👥 {activity.guests}</p>
            </div>
          </div>
        </div>

        <div style={{ padding:"20px 20px 28px", flex:1 }}>
          {submitted ? (
            <div style={{ textAlign:"center", padding:"48px 20px" }}>
              <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
              <h3 style={{ fontSize:20, fontWeight:900, color:BROWN, margin:"0 0 10px", fontFamily:F }}>Request Sent!</h3>
              <p style={{ fontSize:14, color:"#9B7450", lineHeight:1.65, margin:"0 0 24px", fontFamily:F }}>
                We'll confirm the <strong>{activity.name}</strong> booking and WhatsApp you within 2 hours.
              </p>
              <div style={{ background:"rgba(196,122,46,0.06)", borderRadius:12, padding:"12px 16px", marginBottom:20, textAlign:"left" }}>
                <p style={{ fontSize:12, color:PURPLE, fontWeight:700, margin:"0 0 6px", fontFamily:F }}>Booking Summary</p>
                <p style={{ fontSize:13, color:BROWN, margin:"0 0 3px", fontFamily:F }}>📅 {form.date} at {form.time}</p>
                <p style={{ fontSize:13, color:BROWN, margin:"0 0 3px", fontFamily:F }}>📍 {form.address}</p>
                <p style={{ fontSize:13, color:BROWN, margin:0, fontFamily:F }}>💰 ₹{activity.price.toLocaleString("en-IN")} fixed</p>
              </div>
              <button onClick={onClose} style={{ width:"100%", padding:"12px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${PURPLE},#CCAB4A)`, color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:F }}>
                Done
              </button>
            </div>
          ) : (
            <>
              <p style={{ fontSize:12, color:"#9B7450", margin:"0 0 20px", lineHeight:1.6, fontFamily:F }}>
                Fill in your event details and we'll confirm the booking within 2 hours.
              </p>
              {inp("Your Name", "name", "Full name")}
              {inp("WhatsApp Number", "phone", "10-digit number", "tel")}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:0 }}>
                <div>{inp("Event Date", "date", "", "date")}</div>
                <div>{inp("Start Time", "time", "", "time")}</div>
              </div>
              {inp("Venue / Address", "address", "Event venue or full address")}
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:12, fontWeight:700, color:BROWN, display:"block", marginBottom:5, fontFamily:F }}>Notes <span style={{ fontWeight:400, color:"#9B7450" }}>(optional)</span></label>
                <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
                  rows={3} placeholder="Any special requirements or theme details…"
                  style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1.5px solid rgba(44,26,14,0.12)", fontFamily:F, fontSize:13, color:BROWN, outline:"none", resize:"vertical", boxSizing:"border-box", background:"#fff" }}
                  onFocus={e => e.target.style.borderColor=GOLD}
                  onBlur={e => e.target.style.borderColor="rgba(44,26,14,0.12)"} />
              </div>
              <button onClick={() => { if (valid) setSubmitted(true); }} disabled={!valid}
                style={{ width:"100%", padding:"13px", borderRadius:12, border:"none", background: valid ? `linear-gradient(135deg,${PURPLE},#CCAB4A)` : "#E5E7EB", color: valid ? "#fff" : "#9CA3AF", fontSize:14, fontWeight:800, cursor: valid ? "pointer" : "not-allowed", fontFamily:F, boxShadow: valid ? "0 4px 14px rgba(196,122,46,0.35)" : "none", transition:"all 0.15s" }}>
                Confirm Booking →
              </button>
              <p style={{ fontSize:11, color:"#9B7450", textAlign:"center", margin:"10px 0 0", fontFamily:F }}>
                ₹{activity.price.toLocaleString("en-IN")} fixed · No hidden charges · WhatsApp confirmation
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Quick View / Profile Modal ────────────────────────────────────────────────
function ActivityModal({ activity, onClose, onBook }) {
  const [fullProfile, setFullProfile] = useState(false);

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.48)", zIndex:1000, backdropFilter:"blur(4px)" }} />
      <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"min(94vw,560px)", maxHeight:"90vh", overflowY:"auto", background:"#FFFCF5", borderRadius:22, zIndex:1001, fontFamily:F, boxShadow:"0 28px 70px rgba(0,0,0,0.22)" }}>

        {/* Emoji header */}
        <div style={{ background:`linear-gradient(135deg,${PURPLE}22,${PURPLE}08)`, padding:"32px 24px 20px", textAlign:"center", borderRadius:"22px 22px 0 0", position:"relative" }}>
          <button onClick={onClose} style={{ position:"absolute", top:14, right:14, width:32, height:32, borderRadius:"50%", border:"1.5px solid rgba(44,26,14,0.1)", background:"#fff", color:"#9B7450", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          <div style={{ fontSize:56, marginBottom:12 }}>{activity.emoji}</div>
          <h2 style={{ fontSize:20, fontWeight:900, color:BROWN, margin:"0 0 6px", fontFamily:F }}>{activity.name}</h2>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:`linear-gradient(135deg,${PURPLE},#CCAB4A)`, borderRadius:100, padding:"6px 18px" }}>
            <span style={{ fontSize:14, fontWeight:900, color:"#fff", fontFamily:F }}>₹{activity.price.toLocaleString("en-IN")}</span>
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.7)", fontWeight:700, letterSpacing:"0.08em", fontFamily:F }}>FIXED PRICE</span>
          </div>
        </div>

        <div style={{ padding:"20px 24px 24px" }}>
          {/* Info pills */}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
            <span style={{ fontSize:12, color:"#9B7450", background:"#F9F5F0", padding:"5px 12px", borderRadius:100, fontFamily:F }}>⏱ {activity.duration}</span>
            <span style={{ fontSize:12, color:"#9B7450", background:"#F9F5F0", padding:"5px 12px", borderRadius:100, fontFamily:F }}>👥 {activity.guests}</span>
            <span style={{ fontSize:12, color:PURPLE, background:`${PURPLE}10`, padding:"5px 12px", borderRadius:100, fontWeight:700, fontFamily:F }}>🎭 Fun Activity</span>
          </div>

          {/* Description */}
          <p style={{ fontSize:14, color:"#5a3a1a", lineHeight:1.7, margin:"0 0 16px", fontFamily:F }}>{activity.desc}</p>

          {/* Tags */}
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:18 }}>
            {activity.tags.map(t => (
              <span key={t} style={{ fontSize:11, color:PURPLE, background:`${PURPLE}10`, padding:"3px 9px", borderRadius:100, fontWeight:700, fontFamily:F }}>#{t}</span>
            ))}
          </div>

          {/* Full profile extras */}
          {fullProfile && (
            <>
              <div style={{ background:"rgba(196,122,46,0.04)", borderRadius:14, padding:"14px 16px", marginBottom:16, border:`1px solid ${PURPLE}18` }}>
                <p style={{ fontSize:12, fontWeight:800, color:PURPLE, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 10px", fontFamily:F }}>What's Included</p>
                {activity.includes.map((item, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:6 }}>
                    <span style={{ color:PURPLE, fontSize:12, marginTop:2 }}>✓</span>
                    <span style={{ fontSize:13, color:BROWN, fontFamily:F }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:12, fontWeight:800, color:BROWN, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 10px", fontFamily:F }}>Perfect For</p>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {activity.perfectFor.map(p => (
                    <span key={p} style={{ fontSize:12, color:"#7A5535", background:"rgba(196,122,46,0.08)", padding:"5px 12px", borderRadius:100, fontFamily:F }}>✨ {p}</span>
                  ))}
                </div>
              </div>
              {/* Pricing clarity box */}
              <div style={{ background:"linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius:14, padding:"16px 18px", marginBottom:16 }}>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:"0 0 6px", fontWeight:700, letterSpacing:"0.08em", fontFamily:F }}>WHY FIXED PRICING?</p>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.75)", lineHeight:1.65, margin:0, fontFamily:F }}>
                  Unlike vendor quotes that can change, our fun activities are priced upfront — what you see is what you pay. No negotiations, no surprises.
                </p>
              </div>
            </>
          )}

          {/* Toggle view */}
          {!fullProfile && (
            <button onClick={() => setFullProfile(true)}
              style={{ width:"100%", padding:"10px", borderRadius:10, border:`1.5px solid ${PURPLE}30`, background:"transparent", color:PURPLE, fontSize:13, fontWeight:700, cursor:"pointer", marginBottom:12, fontFamily:F }}>
              View Full Profile ↓
            </button>
          )}

          {/* Book Now CTA */}
          <button onClick={() => { onClose(); onBook(activity); }}
            style={{ width:"100%", padding:"13px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${PURPLE},#CCAB4A)`, color:"#fff", fontSize:14, fontWeight:800, cursor:"pointer", fontFamily:F, boxShadow:"0 4px 14px rgba(196,122,46,0.35)" }}>
            Book Now — ₹{activity.price.toLocaleString("en-IN")} Fixed →
          </button>
          <p style={{ fontSize:11, color:"#9B7450", textAlign:"center", margin:"8px 0 0", fontFamily:F }}>
            Confirmed within 2 hrs · WhatsApp updates
          </p>
        </div>
      </div>
    </>
  );
}

// ── Single Card ───────────────────────────────────────────────────────────────
export function FunActivityCard({ activity, onQuickView, onBook }) {
  return (
    <div style={{ background:"#fff", borderRadius:18, border:"1.5px solid rgba(44,26,14,0.07)", overflow:"hidden", boxShadow:"0 2px 12px rgba(44,26,14,0.06)", transition:"all 0.2s", display:"flex", flexDirection:"column", minWidth:240, flex:"0 0 auto" }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow="0 8px 28px rgba(196,122,46,0.14)"; e.currentTarget.style.transform="translateY(-3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow="0 2px 12px rgba(44,26,14,0.06)"; e.currentTarget.style.transform="translateY(0)"; }}>

      {/* Emoji header */}
      <div style={{ background:`linear-gradient(135deg,${PURPLE}18,${PURPLE}08)`, padding:"22px 20px 14px", textAlign:"center", position:"relative" }}>
        <div style={{ fontSize:40, marginBottom:8 }}>{activity.emoji}</div>
        {/* Price badge */}
        <div style={{ position:"absolute", top:10, right:10 }}>
          <div style={{ background:`linear-gradient(135deg,${PURPLE},#CCAB4A)`, color:"#fff", fontSize:13, fontWeight:900, padding:"4px 12px", borderRadius:"100px 100px 100px 4px", fontFamily:F }}>
            ₹{activity.price.toLocaleString("en-IN")}
          </div>
          <div style={{ fontSize:9, color:PURPLE, fontWeight:800, letterSpacing:"0.1em", textAlign:"center", marginTop:2, fontFamily:F }}>FIXED</div>
        </div>
      </div>

      <div style={{ padding:"14px 16px 18px", flex:1, display:"flex", flexDirection:"column" }}>
        <h3 style={{ fontSize:14, fontWeight:800, color:BROWN, margin:"0 0 5px", fontFamily:F }}>{activity.name}</h3>
        <p style={{ fontSize:12, color:"#7A5535", lineHeight:1.55, margin:"0 0 10px", flex:1, fontFamily:F, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{activity.desc}</p>

        {/* Info pills */}
        <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
          <span style={{ fontSize:10, color:"#9B7450", background:"#F9F5F0", padding:"3px 8px", borderRadius:100, fontFamily:F }}>⏱ {activity.duration}</span>
          <span style={{ fontSize:10, color:"#9B7450", background:"#F9F5F0", padding:"3px 8px", borderRadius:100, fontFamily:F }}>👥 {activity.guests}</span>
        </div>

        {/* Tags */}
        <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:12 }}>
          {activity.tags.slice(0,3).map(t => (
            <span key={t} style={{ fontSize:9, color:PURPLE, background:`${PURPLE}10`, padding:"2px 7px", borderRadius:100, fontWeight:700, fontFamily:F }}>#{t}</span>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display:"flex", gap:7 }}>
          <button onClick={() => onQuickView(activity)}
            style={{ flex:1, padding:"8px 0", borderRadius:9, border:`1.5px solid ${PURPLE}35`, background:"#fff", color:PURPLE, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:F }}>
            Quick View
          </button>
          <button onClick={() => onBook(activity)}
            style={{ flex:1, padding:"8px 0", borderRadius:9, border:"none", background:`linear-gradient(135deg,${PURPLE},#CCAB4A)`, color:"#fff", fontSize:11, fontWeight:800, cursor:"pointer", fontFamily:F, boxShadow:"0 3px 10px rgba(196,122,46,0.3)" }}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Section Component ────────────────────────────────────────────────────
export default function FunActivitiesSection({ heading, subheading, activities = FUN_ACTIVITIES, grid = false }) {
  const [quickView, setQuickView] = useState(null);
  const [booking,   setBooking]   = useState(null);
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 280, behavior:"smooth" });
  };

  return (
    <>
      <div style={{ fontFamily:F }}>
        {/* Section header */}
        {(heading || subheading) && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:18, flexWrap:"wrap", gap:10 }}>
            <div>
              {heading && <h2 style={{ fontSize:"clamp(1.3rem,3vw,1.8rem)", fontWeight:900, color:BROWN, margin:"0 0 5px", letterSpacing:"-0.01em", fontFamily:F }}>{heading}</h2>}
              {subheading && <p style={{ fontSize:14, color:"#9B7450", margin:0, fontFamily:F }}>{subheading}</p>}
            </div>
            {/* Admin preview badge */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:100, background:`${PURPLE}10`, border:`1px solid ${PURPLE}25` }}>
              <span style={{ fontSize:10, fontWeight:800, color:PURPLE, textTransform:"uppercase", letterSpacing:"0.08em", fontFamily:F }}>🔒 Admin Preview</span>
            </div>
          </div>
        )}

        {grid ? (
          // Grid layout (for search results)
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:16 }}>
            {activities.map(a => (
              <FunActivityCard key={a.id} activity={a} onQuickView={setQuickView} onBook={setBooking} />
            ))}
          </div>
        ) : (
          // Horizontal scroll (for homepage, review, planning)
          <div style={{ position:"relative" }}>
            <div ref={scrollRef} style={{ display:"flex", gap:14, overflowX:"auto", paddingBottom:8, scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
              <style>{`.fun-scroll::-webkit-scrollbar{display:none}`}</style>
              {activities.map(a => (
                <FunActivityCard key={a.id} activity={a} onQuickView={setQuickView} onBook={setBooking} />
              ))}
            </div>
            {/* Scroll arrows */}
            {activities.length > 3 && (
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:10 }}>
                {["←","→"].map((dir, i) => (
                  <button key={dir} onClick={() => scroll(i === 0 ? -1 : 1)}
                    style={{ width:34, height:34, borderRadius:"50%", border:`1.5px solid ${PURPLE}30`, background:"#fff", color:PURPLE, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F }}>
                    {dir}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {quickView  && <ActivityModal activity={quickView}  onClose={() => setQuickView(null)} onBook={a => { setQuickView(null); setBooking(a); }} />}
      {booking    && <BookingPanel  activity={booking}    onClose={() => setBooking(null)} />}
    </>
  );
}
