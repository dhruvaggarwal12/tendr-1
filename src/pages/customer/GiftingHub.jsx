import React, { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";
import SEO from "../../components/SEO";
import Footer from "../../components/Footer";
import {
  OCCASIONS, RECIPIENTS, INTERESTS, CATALOG_ITEMS, CATALOG_CATS,
  COLLECTIONS, BULK_COLLECTIONS, suggestHampers, fmt,
} from "../../data/giftingData";

const font = "'Outfit', 'Inter', sans-serif";
const GOLD = "#C47A2E";
const DARK = "#2C1A0E";
const CREAM = "#FDF8F0";

// ── Shared helpers ────────────────────────────────────────────────────────────

function Chip({ label, active, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 16px", borderRadius: 50, border: `1.5px solid ${active ? GOLD : "rgba(44,26,14,0.18)"}`,
      background: active ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#fff",
      color: active ? "#fff" : DARK, fontSize: 13, fontWeight: active ? 700 : 500,
      cursor: "pointer", fontFamily: font, transition: "all 0.18s", whiteSpace: "nowrap", ...style,
    }}>{label}</button>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
      color: GOLD, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font, padding: "0 0 4px",
    }}>← Back</button>
  );
}

function FloatingGetBtn({ label = "Get This Hamper", onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "14px", borderRadius: 14, border: "none",
      background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff",
      fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font,
      boxShadow: "0 4px 18px rgba(196,122,46,0.35)", marginTop: 2,
    }}>{label} →</button>
  );
}

function CollectionCard({ col, onGet, isStretch }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div style={{
      background: "#fff", borderRadius: 18, overflow: "hidden",
      boxShadow: "0 2px 16px rgba(44,26,14,0.09)", border: "1.5px solid rgba(196,122,46,0.12)",
      display: "flex", flexDirection: "column",
      ...(isStretch ? { opacity: 0.88, border: "1.5px dashed rgba(196,122,46,0.35)" } : {}),
    }}>
      {/* Photo */}
      <div style={{ height: 160, background: "#f5ede0", position: "relative", overflow: "hidden" }}>
        {!imgErr
          ? <img src={col.photo} alt={col.name} onError={() => setImgErr(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 52 }}>{col.emoji}</div>
        }
        {col.badge && (
          <div style={{
            position: "absolute", top: 10, left: 10, background: GOLD, color: "#fff",
            fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, fontFamily: font,
          }}>{col.badge}</div>
        )}
        {isStretch && (
          <div style={{
            position: "absolute", top: 10, right: 10, background: "#7C3AED", color: "#fff",
            fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, fontFamily: font,
          }}>Stretch Pick</div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "16px 16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: DARK, fontFamily: font, lineHeight: 1.2 }}>{col.name}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, whiteSpace: "nowrap", marginLeft: 8 }}>
            {fmt(col.priceRange[0])}–{fmt(col.priceRange[1])}
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: "#9B7450", fontFamily: font }}>{col.tagline}</div>

        {/* Items */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
          {col.items.slice(0, 4).map((item, i) => (
            <span key={i} style={{
              fontSize: 10.5, background: "rgba(196,122,46,0.09)", color: "#7A5020",
              padding: "3px 8px", borderRadius: 20, fontFamily: font,
            }}>{item}</span>
          ))}
          {col.items.length > 4 && (
            <span style={{ fontSize: 10.5, color: "#9B7450", fontFamily: font, padding: "3px 0" }}>+{col.items.length - 4} more</span>
          )}
        </div>

        {isStretch && (
          <div style={{ fontSize: 11, color: "#7C3AED", fontFamily: font, fontStyle: "italic" }}>
            Slightly above your budget — but a great fit!
          </div>
        )}

        <FloatingGetBtn onClick={onGet} />
      </div>
    </div>
  );
}

// ── Baat Karo pre-fill helper ─────────────────────────────────────────────────
function openBaatKaro(navigate, message) {
  sessionStorage.setItem("baat_karo_draft", JSON.stringify({ message }));
  navigate("/baat-karo");
}

// ════════════════════════════════════════════════════════════════════════════
// HOME VIEW
// ════════════════════════════════════════════════════════════════════════════
function HomeView({ setView, setBulk }) {
  return (
    <div style={{ padding: "0 16px 48px", maxWidth: 560, margin: "0 auto" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "32px 0 24px" }}>
        <div style={{ fontSize: 38 }}>🎁</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: DARK, margin: "8px 0 6px", fontFamily: font }}>Gift Something Special</h1>
        <p style={{ fontSize: 14, color: "#9B7450", fontFamily: font, margin: 0, lineHeight: 1.6 }}>
          Real gift hampers · Curated by us · Fulfilled by local vendors<br />
          No in-house stock — vendor confirms price in 2–4 hrs
        </p>
      </div>

      {/* 3 main flows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        <FlowCard
          emoji="🤖" label="AI Creates My Gift"
          sub="Tell us who & why — we suggest the perfect hamper"
          badge="Smart Pick"
          badgeColor="#7C3AED"
          onClick={() => setView("ai")}
        />

        <FlowCard
          emoji="🛍️" label="Browse Collections"
          sub="12+ curated hampers for every occasion"
          onClick={() => setView("collections")}
        />

        <FlowCard
          emoji="🎨" label="Build From Scratch"
          sub="Pick items one by one and we'll box it beautifully"
          onClick={() => setView("builder")}
        />
      </div>

      {/* Bulk divider */}
      <div style={{ margin: "28px 0 0" }}>
        <div style={{
          background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 16,
          padding: "20px 20px", cursor: "pointer",
        }} onClick={() => { setBulk(true); setView("collections"); }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#CCAB4A", fontFamily: font, marginBottom: 4 }}>
            📦 Bulk Return Gifts (50+ pieces)
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", fontFamily: font, lineHeight: 1.5 }}>
            Wedding favors · Diwali corporate gifts · Birthday party returns<br />
            Starting ₹100/pc · Minimum 30 pieces
          </div>
          <div style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: GOLD, fontFamily: font }}>
            Browse bulk options →
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: DARK, fontFamily: font, marginBottom: 12 }}>How it works</div>
        {[
          ["✦", "Pick a hamper or build your own"],
          ["✦", "We send the brief to vendors in your area"],
          ["✦", "Vendor confirms price & availability in 2–4 hrs"],
          ["✦", "You confirm → they deliver on your date"],
        ].map(([icon, text], i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
            <div style={{ color: GOLD, fontSize: 14, fontWeight: 900, marginTop: 1 }}>{icon}</div>
            <div style={{ fontSize: 13, color: "#5A3A1A", fontFamily: font }}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowCard({ emoji, label, sub, badge, badgeColor, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "#fff", borderRadius: 18, padding: "20px 18px",
      boxShadow: "0 2px 16px rgba(44,26,14,0.08)", border: "1.5px solid rgba(196,122,46,0.14)",
      cursor: "pointer", display: "flex", alignItems: "center", gap: 16,
      transition: "box-shadow 0.15s",
    }}>
      <div style={{ fontSize: 34, flexShrink: 0 }}>{emoji}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: DARK, fontFamily: font }}>{label}</div>
          {badge && (
            <span style={{ fontSize: 9, fontWeight: 800, background: badgeColor, color: "#fff", padding: "2px 8px", borderRadius: 20, fontFamily: font }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: "#9B7450", fontFamily: font, marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ color: GOLD, fontSize: 18, fontWeight: 900 }}>›</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// AI FLOW VIEW
// ════════════════════════════════════════════════════════════════════════════
function AIView({ setView, navigate }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ occasion: "", recipient: "", interests: [], budget: 2000 });
  const [results, setResults] = useState(null);

  const toggleInterest = (id) =>
    setForm(f => ({
      ...f,
      interests: f.interests.includes(id) ? f.interests.filter(x => x !== id) : [...f.interests, id],
    }));

  const handleSuggest = () => {
    const r = suggestHampers(form.occasion, form.recipient, form.interests, form.budget);
    setResults(r);
    setStep("results");
  };

  const budgetPresets = [
    { label: "Under ₹1,000", val: 900 },
    { label: "₹1,000–₹2,500", val: 1800 },
    { label: "₹2,500–₹5,000", val: 3500 },
    { label: "₹5,000+", val: 7000 },
  ];

  const stepConfig = { 1: 4, 2: 4, 3: 4, 4: 4 };
  const progress = step === "results" ? 100 : (step / 4) * 100;

  const canNext = step === 1 ? !!form.occasion : step === 2 ? !!form.recipient : step === 3 ? true : true;

  if (step === "results") {
    return (
      <div style={{ padding: "0 16px 48px", maxWidth: 560, margin: "0 auto" }}>
        <BackBtn onClick={() => setStep(4)} />
        <div style={{ marginBottom: 20, marginTop: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: DARK, fontFamily: font }}>
            🤖 AI's Top Picks For You
          </div>
          <div style={{ fontSize: 13, color: "#9B7450", fontFamily: font, marginTop: 4 }}>
            Based on: {OCCASIONS.find(o => o.id === form.occasion)?.label} ·
            Budget {fmt(form.budget)} · {form.interests.length ? form.interests.map(i => INTERESTS.find(x => x.id === i)?.label).join(", ") : "General"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {results?.map((col, i) => (
            <CollectionCard key={col.id} col={col} isStretch={col.isStretch} onGet={() => {
              const items = col.items.join(", ");
              openBaatKaro(navigate, `Hi! I'd like to order a "${col.name}" hamper.\n\nOccasion: ${OCCASIONS.find(o => o.id === form.occasion)?.label}\nBudget: ~${fmt(form.budget)}\n\nItems I have in mind: ${items}\n\nCan you confirm price and availability?`);
            }} />
          ))}
        </div>

        <div style={{ marginTop: 24, padding: 16, background: "rgba(196,122,46,0.06)", borderRadius: 14, border: "1px solid rgba(196,122,46,0.18)" }}>
          <div style={{ fontSize: 12.5, color: "#7A5020", fontFamily: font, lineHeight: 1.6 }}>
            <strong>Not quite right?</strong> Tap any hamper to chat with us and customise items, add a personal note, or adjust the budget.
          </div>
        </div>

        <button onClick={() => setView("builder")} style={{
          width: "100%", marginTop: 16, padding: "13px", borderRadius: 14,
          border: "1.5px solid rgba(196,122,46,0.4)", background: "transparent",
          color: GOLD, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: font,
        }}>🎨 Prefer to build it yourself?</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px 48px", maxWidth: 560, margin: "0 auto" }}>
      <BackBtn onClick={() => step > 1 ? setStep(s => s - 1) : setView("home")} />

      {/* Progress */}
      <div style={{ margin: "12px 0 24px", display: "flex", gap: 6 }}>
        {[1, 2, 3, 4].map(n => (
          <div key={n} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: n <= step ? "linear-gradient(90deg,#C47A2E,#CCAB4A)" : "rgba(196,122,46,0.15)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>

      {step === 1 && (
        <>
          <div style={{ fontSize: 19, fontWeight: 800, color: DARK, fontFamily: font, marginBottom: 6 }}>What's the occasion?</div>
          <div style={{ fontSize: 13, color: "#9B7450", fontFamily: font, marginBottom: 18 }}>We'll match hampers made for this moment</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {OCCASIONS.map(o => (
              <Chip key={o.id} label={o.label} active={form.occasion === o.id}
                onClick={() => setForm(f => ({ ...f, occasion: o.id }))} />
            ))}
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <div style={{ fontSize: 19, fontWeight: 800, color: DARK, fontFamily: font, marginBottom: 6 }}>Who's it for?</div>
          <div style={{ fontSize: 13, color: "#9B7450", fontFamily: font, marginBottom: 18 }}>Helps us tailor the pick</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {RECIPIENTS.map(r => (
              <Chip key={r.id} label={r.label} active={form.recipient === r.id}
                onClick={() => setForm(f => ({ ...f, recipient: r.id }))} />
            ))}
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div style={{ fontSize: 19, fontWeight: 800, color: DARK, fontFamily: font, marginBottom: 6 }}>What are their interests?</div>
          <div style={{ fontSize: 13, color: "#9B7450", fontFamily: font, marginBottom: 18 }}>Pick all that apply (or skip)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {INTERESTS.map(i => (
              <Chip key={i.id} label={i.label} active={form.interests.includes(i.id)}
                onClick={() => toggleInterest(i.id)} />
            ))}
          </div>
          {form.interests.length > 0 && (
            <button onClick={() => setForm(f => ({ ...f, interests: [] }))}
              style={{ marginTop: 12, fontSize: 12, color: "#9B7450", background: "none", border: "none", cursor: "pointer", fontFamily: font }}>
              Clear selection
            </button>
          )}
        </>
      )}

      {step === 4 && (
        <>
          <div style={{ fontSize: 19, fontWeight: 800, color: DARK, fontFamily: font, marginBottom: 6 }}>What's your budget?</div>
          <div style={{ fontSize: 13, color: "#9B7450", fontFamily: font, marginBottom: 20 }}>Approximate is fine — vendor confirms the exact price</div>

          {/* Budget display */}
          <div style={{
            textAlign: "center", padding: "18px 0 12px",
            background: "linear-gradient(135deg,rgba(196,122,46,0.08),rgba(204,171,74,0.06))",
            borderRadius: 14, marginBottom: 18,
          }}>
            <div style={{ fontSize: 34, fontWeight: 900, color: GOLD, fontFamily: font }}>{fmt(form.budget)}</div>
            <div style={{ fontSize: 12, color: "#9B7450", fontFamily: font, marginTop: 2 }}>approximate budget</div>
          </div>

          <input type="range" min={500} max={10000} step={100} value={form.budget}
            onChange={e => setForm(f => ({ ...f, budget: Number(e.target.value) }))}
            style={{ width: "100%", accentColor: GOLD, marginBottom: 16, cursor: "pointer" }} />

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ fontSize: 11, color: "#9B7450", fontFamily: font }}>₹500</span>
            <span style={{ fontSize: 11, color: "#9B7450", fontFamily: font }}>₹10,000</span>
          </div>

          {/* Quick presets */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[{ label: "Under ₹1K", val: 900 }, { label: "₹1–₂.5K", val: 1800 }, { label: "₹2.5–5K", val: 3500 }, { label: "₹5K+", val: 7000 }].map(p => (
              <Chip key={p.val} label={p.label} active={Math.abs(form.budget - p.val) < 300}
                onClick={() => setForm(f => ({ ...f, budget: p.val }))} />
            ))}
          </div>
        </>
      )}

      {/* Next button */}
      <div style={{ marginTop: 28 }}>
        {step < 4 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext}
            style={{
              width: "100%", padding: "14px", borderRadius: 14, border: "none",
              background: canNext ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "rgba(196,122,46,0.2)",
              color: canNext ? "#fff" : "#9B7450", fontSize: 15, fontWeight: 800,
              cursor: canNext ? "pointer" : "not-allowed", fontFamily: font,
            }}>
            {step === 3 ? (form.interests.length === 0 ? "Skip →" : "Next →") : "Next →"}
          </button>
        ) : (
          <button onClick={handleSuggest} style={{
            width: "100%", padding: "14px", borderRadius: 14, border: "none",
            background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff",
            fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: font,
            boxShadow: "0 4px 18px rgba(196,122,46,0.35)",
          }}>
            🤖 Show My Suggestions →
          </button>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// COLLECTIONS VIEW (single + bulk)
// ════════════════════════════════════════════════════════════════════════════
function CollectionsView({ setView, navigate, isBulk, setBulk }) {
  const [filter, setFilter] = useState("all");

  const occasionFilters = [
    { id: "all", label: "All" },
    { id: "birthday", label: "🎂 Birthday" },
    { id: "anniversary", label: "💍 Anniversary" },
    { id: "corporate", label: "💼 Corporate" },
    { id: "festival", label: "🪔 Festival" },
    { id: "housewarming", label: "🏠 Housewarming" },
    { id: "wellness", label: "🧘 Wellness" },
    { id: "farewell", label: "✈️ Farewell" },
    { id: "thank_you", label: "🙏 Thank You" },
    { id: "just_because", label: "💛 Just Because" },
  ];

  const filtered = COLLECTIONS.filter(c =>
    filter === "all"
      ? true
      : c.filterTags.includes(filter) || c.interestTags.includes(filter)
  );

  const handleGet = (col) => {
    openBaatKaro(navigate, `Hi! I'm interested in the "${col.name}" gift hamper.\n\nItems: ${col.items.join(", ")}\nBudget range: ${fmt(col.priceRange[0])} – ${fmt(col.priceRange[1])}\n\nCan you confirm price and availability for delivery?`);
  };

  const handleBulkGet = (col) => {
    openBaatKaro(navigate, `Hi! I'm interested in bulk return gifts — "${col.name}".\n\nItems: ${col.items.join(", ")}\nPrice per piece: ${fmt(col.pricePerUnit[0])} – ${fmt(col.pricePerUnit[1])}\n\nPlease confirm minimum quantity, customization options, and delivery timeline.`);
  };

  return (
    <div style={{ padding: "0 0 48px" }}>
      {/* Toggle: Single vs Bulk */}
      <div style={{ padding: "0 16px 16px", maxWidth: 560, margin: "0 auto" }}>
        <BackBtn onClick={() => setView("home")} />
        <div style={{ display: "flex", gap: 0, marginTop: 14, background: "rgba(196,122,46,0.08)", borderRadius: 14, padding: 4 }}>
          {[
            { label: "🎁 Single Hamper", val: false },
            { label: "📦 Bulk Return Gifts", val: true },
          ].map(t => (
            <button key={String(t.val)} onClick={() => setBulk(t.val)} style={{
              flex: 1, padding: "10px", borderRadius: 11, border: "none",
              background: isBulk === t.val ? "#fff" : "transparent",
              color: isBulk === t.val ? DARK : "#9B7450",
              fontSize: 13, fontWeight: isBulk === t.val ? 800 : 500, cursor: "pointer",
              fontFamily: font, boxShadow: isBulk === t.val ? "0 2px 8px rgba(44,26,14,0.1)" : "none",
              transition: "all 0.18s",
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {!isBulk ? (
        <>
          {/* Occasion filter chips */}
          <div style={{ overflowX: "auto", padding: "4px 16px 16px", display: "flex", gap: 8, scrollbarWidth: "none" }}>
            {occasionFilters.map(f => (
              <Chip key={f.id} label={f.label} active={filter === f.id} onClick={() => setFilter(f.id)} style={{ flexShrink: 0 }} />
            ))}
          </div>

          {/* Grid */}
          <div style={{ padding: "0 16px", maxWidth: 560, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {filtered.map(col => (
              <CollectionCard key={col.id} col={col} onGet={() => handleGet(col)} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "#9B7450", fontFamily: font, fontSize: 14 }}>
              No hampers found for this filter. Try "All"!
            </div>
          )}
        </>
      ) : (
        /* Bulk collections */
        <div style={{ padding: "0 16px", maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 13, color: "#9B7450", fontFamily: font, marginBottom: 4 }}>
            Minimum 30–50 pieces per order · Customizable labels · Pan-India delivery
          </div>
          {BULK_COLLECTIONS.map(col => (
            <BulkCard key={col.id} col={col} onGet={() => handleBulkGet(col)} />
          ))}
        </div>
      )}
    </div>
  );
}

function BulkCard({ col, onGet }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div style={{
      background: "#fff", borderRadius: 18, overflow: "hidden",
      boxShadow: "0 2px 16px rgba(44,26,14,0.09)", border: "1.5px solid rgba(196,122,46,0.12)",
      display: "flex", gap: 0,
    }}>
      <div style={{ width: 100, flexShrink: 0, background: "#f5ede0", overflow: "hidden" }}>
        {!imgErr
          ? <img src={col.photo} alt={col.name} onError={() => setImgErr(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 36 }}>{col.emoji}</div>
        }
      </div>
      <div style={{ padding: "14px 16px", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: DARK, fontFamily: font }}>{col.name}</div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: GOLD, fontFamily: font }}>{fmt(col.pricePerUnit[0])}–{fmt(col.pricePerUnit[1])}/pc</div>
            <div style={{ fontSize: 10, color: "#9B7450", fontFamily: font }}>min {col.minQty} pcs</div>
          </div>
        </div>
        <div style={{ fontSize: 11.5, color: "#9B7450", fontFamily: font, margin: "4px 0 8px" }}>{col.tagline}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
          {col.items.map((item, i) => (
            <span key={i} style={{ fontSize: 10, background: "rgba(196,122,46,0.09)", color: "#7A5020", padding: "2px 7px", borderRadius: 20, fontFamily: font }}>
              {item}
            </span>
          ))}
        </div>
        <button onClick={onGet} style={{
          padding: "9px 16px", borderRadius: 10, border: "none",
          background: "linear-gradient(135deg,#C47A2E,#CCAB4A)", color: "#fff",
          fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: font,
        }}>Get a Quote →</button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BUILDER VIEW — Build From Scratch (visual drag-and-drop box builder)
// ════════════════════════════════════════════════════════════════════════════

const GH_CATS = ["Drinkware","Dry Fruits & Nuts","Chocolates & Sweets","Spiritual & Pooja","Decorative Boxes","Tokri & Hampers"];

const BUILDER_PRODUCTS = {
  "Drinkware": [
    { id:"dr1", name:"Copper Mug Set",      price:[599,999],   emoji:"🫖", photo:"1544947950-fa07a98d237f" },
    { id:"dr2", name:"Premium Thermos",     price:[799,1499],  emoji:"🧴", photo:"1571677208888-a6d4dfba5d01" },
    { id:"dr3", name:"Glass Tea Set",       price:[699,1200],  emoji:"🍵", photo:"1510017803434-a899851a20d5" },
    { id:"dr4", name:"Ceramic Coffee Mug",  price:[299,599],   emoji:"☕", photo:"1478144592103-25e218a04891" },
  ],
  "Dry Fruits & Nuts": [
    { id:"dn1", name:"Mixed Dry Fruits",    price:[499,899],   emoji:"🥜", photo:"1508061253366-f7da158b6d46" },
    { id:"dn2", name:"Premium Almonds",     price:[349,699],   emoji:"🫘", photo:"1586201375761-83865001e31d" },
    { id:"dn3", name:"Cashew Collection",   price:[449,799],   emoji:"🌰", photo:"1543158266-0066d7741fd8" },
    { id:"dn4", name:"Date & Fig Pack",     price:[299,599],   emoji:"🍇", photo:"1519996529931-28324d5a630e" },
  ],
  "Chocolates & Sweets": [
    { id:"cs1", name:"Truffle Box",         price:[599,1099],  emoji:"🍫", photo:"1548907040-4baa42d10919" },
    { id:"cs2", name:"Assorted Chocolates", price:[449,899],   emoji:"🍬", photo:"1511381939415-e44676cae293" },
    { id:"cs3", name:"Mithai Box",          price:[399,799],   emoji:"🧁", photo:"1606914469633-bd55b883c7c8" },
    { id:"cs4", name:"Ferrero Rocher",      price:[599,999],   emoji:"🍩", photo:"1549007953-aef665bff10e" },
  ],
  "Spiritual & Pooja": [
    { id:"sp1", name:"Diya Set",            price:[299,599],   emoji:"🪔", photo:"1609619385002-f40f1df9b7c5" },
    { id:"sp2", name:"Incense & Agarbatti", price:[199,399],   emoji:"🕯️", photo:"1558618666-fcd25c85cd64" },
    { id:"sp3", name:"Brass Puja Item",     price:[499,899],   emoji:"⛩️", photo:"1583847268964-b28dc8f51f92" },
    { id:"sp4", name:"Sandalwood Set",      price:[399,799],   emoji:"🌿", photo:"1515377905703-c4788e51af15" },
  ],
  "Decorative Boxes": [
    { id:"db1", name:"Wooden Keepsake Box", price:[499,999],   emoji:"📦", photo:"1513201099705-a9746e1e201f" },
    { id:"db2", name:"Silk Gift Box",       price:[349,699],   emoji:"🎁", photo:"1512909006721-3d6018887383" },
    { id:"db3", name:"Jewellery Box",       price:[599,1099],  emoji:"💍", photo:"1596462502278-27bfdc403348" },
  ],
  "Tokri & Hampers": [
    { id:"tk1", name:"Wicker Tokri",        price:[299,599],   emoji:"🧺", photo:"1607082348824-0a96f2a4b9da" },
    { id:"tk2", name:"Gift Hamper Set",     price:[1499,2999], emoji:"🎀", photo:"1513519245088-0e12902e35ca" },
    { id:"tk3", name:"Jute Gift Bag",       price:[199,399],   emoji:"👜", photo:"1553062407-98eeb64c6a62" },
  ],
};

const BUILDER_OCCASIONS = [
  { id:"birthday",     label:"🎂 Birthday" },
  { id:"anniversary",  label:"💑 Anniversary" },
  { id:"diwali",       label:"🪔 Diwali" },
  { id:"corporate",    label:"💼 Corporate" },
  { id:"wedding",      label:"💍 Wedding" },
  { id:"thankyou",     label:"🙏 Thank You" },
  { id:"babyshower",   label:"👶 Baby Shower" },
  { id:"housewarming", label:"🏠 Housewarming" },
];

const BUILDER_RECIPIENTS = [
  { id:"friend",    label:"👫 Friend" },
  { id:"family",    label:"👨‍👩‍👧 Family" },
  { id:"partner",   label:"❤️ Partner" },
  { id:"colleague", label:"💼 Colleague" },
  { id:"parent",    label:"👴 Parent" },
  { id:"child",     label:"🧒 Child" },
  { id:"boss",      label:"🤝 Boss" },
  { id:"client",    label:"🏢 Client" },
];

const BUILDER_BUDGETS = [
  { id:"u500",  label:"Under ₹500" },
  { id:"5k1k",  label:"₹500 – ₹1,000" },
  { id:"1k2k",  label:"₹1K – ₹2K" },
  { id:"2k5k",  label:"₹2K – ₹5K" },
  { id:"5kp",   label:"₹5,000+" },
];

// ── Small icon button inside box toolbar ────────────────────────────────────
function ToolBtn({ onClick, children, red }) {
  return (
    <button onClick={onClick} style={{
      width:26, height:26, borderRadius:6, border:"none",
      background: red ? "rgba(220,38,38,0.85)" : "rgba(255,255,255,0.18)",
      color:"#fff", fontSize:13, cursor:"pointer", fontFamily:font,
      display:"flex", alignItems:"center", justifyContent:"center",
      flexShrink:0,
    }}>{children}</button>
  );
}

// ── Single item placed inside the hamper box ────────────────────────────────
function BoxItem({ item, selected, onPointerDown, onResize, onRotate, onFlip, onRemove }) {
  const [imgErr, setImgErr] = useState(false);
  const transform = `rotate(${item.rot}deg) scaleX(${item.flipH ? -1 : 1})`;

  return (
    <div
      onPointerDown={onPointerDown}
      style={{
        position:"absolute", left:item.x, top:item.y, width:item.w, height:item.h,
        cursor:"grab", userSelect:"none", touchAction:"none",
        transform, transformOrigin:"center",
        zIndex: selected ? 20 : 5,
        borderRadius:8,
        outline: selected ? `2px solid ${GOLD}` : "2px solid transparent",
        boxShadow: selected ? `0 0 0 4px rgba(196,122,46,0.18)` : "0 2px 8px rgba(0,0,0,0.15)",
        transition:"outline 0.1s, box-shadow 0.1s",
      }}
    >
      {!imgErr ? (
        <img
          src={`https://images.unsplash.com/photo-${item.product.photo}?w=160&h=160&fit=crop&auto=format&q=70`}
          alt={item.product.name}
          onError={() => setImgErr(true)}
          draggable={false}
          style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:6, display:"block", pointerEvents:"none" }}
        />
      ) : (
        <div style={{
          width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center",
          background:"linear-gradient(135deg,rgba(196,122,46,0.12),rgba(196,122,46,0.05))",
          borderRadius:6, fontSize:Math.min(item.w, item.h) * 0.48, pointerEvents:"none",
        }}>{item.product.emoji}</div>
      )}

      {selected && (
        <>
          {/* Name label */}
          <div style={{
            position:"absolute", bottom:"calc(100% + 5px)", left:"50%", transform:"translateX(-50%)",
            background:"rgba(44,26,14,0.88)", color:"#fff",
            fontSize:9, fontWeight:600, padding:"2px 8px", borderRadius:8,
            whiteSpace:"nowrap", fontFamily:font, pointerEvents:"none",
          }}>{item.product.name}</div>

          {/* Corner resize handles */}
          {[["nw",-5,-5,"nw-resize"],["ne",null,-5,"ne-resize"],["sw",-5,null,"sw-resize"],["se",null,null,"se-resize"]].map(([c,t,l,cur]) => (
            <div
              key={c}
              onPointerDown={(e) => onResize(e, c)}
              style={{
                position:"absolute",
                top: t !== null ? t : undefined, bottom: t === null ? -5 : undefined,
                left: l !== null ? l : undefined, right: l === null ? -5 : undefined,
                width:12, height:12, borderRadius:3,
                background:GOLD, border:"2px solid #fff",
                cursor:cur, zIndex:30, touchAction:"none",
              }}
            />
          ))}

          {/* Toolbar */}
          <div style={{
            position:"absolute", top:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)",
            display:"flex", gap:4,
            background:"rgba(44,26,14,0.92)", borderRadius:9, padding:"5px 7px",
            zIndex:30, boxShadow:"0 2px 10px rgba(0,0,0,0.3)",
          }}>
            <ToolBtn onClick={(e) => { e.stopPropagation(); onRotate(-15); }}>↺</ToolBtn>
            <ToolBtn onClick={(e) => { e.stopPropagation(); onRotate(15); }}>↻</ToolBtn>
            <ToolBtn onClick={(e) => { e.stopPropagation(); onFlip(); }}>⇄</ToolBtn>
            <ToolBtn onClick={(e) => { e.stopPropagation(); onRemove(); }} red>✕</ToolBtn>
          </div>
        </>
      )}
    </div>
  );
}

// ── Product card in the products panel ──────────────────────────────────────
function BuilderProductCard({ product, inBox, onClick }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div onClick={onClick} style={{
      background:"#fff", borderRadius:12, overflow:"hidden", cursor:"pointer",
      border:`1.5px solid ${inBox ? GOLD : "rgba(196,122,46,0.15)"}`,
      boxShadow: inBox ? `0 0 0 2px rgba(196,122,46,0.18)` : "0 1px 6px rgba(44,26,14,0.06)",
      transition:"all 0.15s", position:"relative",
    }}>
      <div style={{ height:80, background:"#F5E8D0", position:"relative", overflow:"hidden" }}>
        {!imgErr ? (
          <img
            src={`https://images.unsplash.com/photo-${product.photo}?w=160&h=160&fit=crop&auto=format&q=70`}
            alt={product.name}
            onError={() => setImgErr(true)}
            style={{ width:"100%", height:"100%", objectFit:"cover" }}
          />
        ) : (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", fontSize:32 }}>
            {product.emoji}
          </div>
        )}
        {inBox && (
          <div style={{
            position:"absolute", top:4, right:4,
            width:18, height:18, borderRadius:"50%",
            background:GOLD, display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:10, color:"#fff", fontWeight:700,
          }}>✓</div>
        )}
      </div>
      <div style={{ padding:"6px 8px" }}>
        <div style={{ fontSize:10.5, fontWeight:700, color:DARK, fontFamily:font, lineHeight:1.3 }}>{product.name}</div>
        <div style={{ fontSize:9.5, color:GOLD, fontFamily:font, fontWeight:600, marginTop:2 }}>
          {fmt(product.price[0])} – {fmt(product.price[1])}
        </div>
      </div>
    </div>
  );
}

// ── Questions phase ──────────────────────────────────────────────────────────
function BuilderQuestions({ onDone, onBack }) {
  const [step, setStep] = useState(0);
  const [occasion, setOccasion]   = useState("");
  const [recipient, setRecipient] = useState("");
  const [budget, setBudget]       = useState("");
  const [selCats, setSelCats]     = useState([]);

  const toggleCat = (cat) =>
    setSelCats(p => p.includes(cat) ? p.filter(c => c !== cat) : [...p, cat]);

  const steps = [
    {
      title: "What's the occasion?",
      sub: "We'll tailor suggestions for you",
      content: (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
          {BUILDER_OCCASIONS.map(o => (
            <button key={o.id} onClick={() => { setOccasion(o.id); setStep(1); }} style={{
              padding:"13px 10px", borderRadius:12, cursor:"pointer", textAlign:"center",
              border:`1.5px solid ${occasion===o.id ? GOLD : "rgba(196,122,46,0.2)"}`,
              background: occasion===o.id ? "rgba(196,122,46,0.09)" : "#fff",
              fontSize:13.5, fontWeight: occasion===o.id ? 700 : 500, color:DARK, fontFamily:font,
            }}>{o.label}</button>
          ))}
        </div>
      ),
      canSkip: true,
    },
    {
      title: "Who is it for?",
      sub: "Helps us pick the right products",
      content: (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
          {BUILDER_RECIPIENTS.map(r => (
            <button key={r.id} onClick={() => { setRecipient(r.id); setStep(2); }} style={{
              padding:"13px 10px", borderRadius:12, cursor:"pointer", textAlign:"center",
              border:`1.5px solid ${recipient===r.id ? GOLD : "rgba(196,122,46,0.2)"}`,
              background: recipient===r.id ? "rgba(196,122,46,0.09)" : "#fff",
              fontSize:13.5, fontWeight: recipient===r.id ? 700 : 500, color:DARK, fontFamily:font,
            }}>{r.label}</button>
          ))}
        </div>
      ),
      canSkip: true,
    },
    {
      title: "What's your budget?",
      sub: "We'll show you realistic options",
      content: (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {BUILDER_BUDGETS.map(b => (
            <button key={b.id} onClick={() => { setBudget(b.id); setStep(3); }} style={{
              padding:"13px 16px", borderRadius:12, cursor:"pointer",
              border:`1.5px solid ${budget===b.id ? GOLD : "rgba(196,122,46,0.2)"}`,
              background: budget===b.id ? "rgba(196,122,46,0.09)" : "#fff",
              fontSize:14, fontWeight: budget===b.id ? 700 : 500, color:DARK, fontFamily:font,
              display:"flex", justifyContent:"space-between", alignItems:"center",
            }}>
              <span>{b.label}</span>
              {budget===b.id && <span style={{ color:GOLD }}>✓</span>}
            </button>
          ))}
        </div>
      ),
      canSkip: true,
    },
    {
      title: "Choose categories",
      sub: "Pick one or more — products from all will appear",
      content: (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {GH_CATS.map(cat => {
            const active = selCats.includes(cat);
            return (
              <button key={cat} onClick={() => toggleCat(cat)} style={{
                padding:"12px 16px", borderRadius:12, cursor:"pointer",
                border:`1.5px solid ${active ? GOLD : "rgba(196,122,46,0.2)"}`,
                background: active ? "rgba(196,122,46,0.09)" : "#fff",
                fontSize:14, fontWeight: active ? 700 : 500, color: active ? DARK : "#7A5535",
                fontFamily:font, display:"flex", justifyContent:"space-between", alignItems:"center",
              }}>
                <span>{cat}</span>
                <span style={{
                  width:20, height:20, borderRadius:5, flexShrink:0,
                  border:`2px solid ${active ? GOLD : "rgba(196,122,46,0.3)"}`,
                  background: active ? GOLD : "transparent",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, color:"#fff",
                }}>{active ? "✓" : ""}</span>
              </button>
            );
          })}
        </div>
      ),
      canSkip: false,
    },
  ];

  const cur = steps[step];

  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"20px 16px 48px" }}>
      <BackBtn onClick={step===0 ? onBack : () => setStep(s => s-1)} />

      {/* Progress bar */}
      <div style={{ display:"flex", gap:5, margin:"14px 0 20px" }}>
        {steps.map((_,i) => (
          <div key={i} style={{
            flex:1, height:3, borderRadius:2,
            background: i<=step ? GOLD : "rgba(196,122,46,0.18)", transition:"background 0.3s",
          }} />
        ))}
      </div>

      <div style={{ fontSize:11, fontWeight:800, color:GOLD, textTransform:"uppercase", letterSpacing:"0.1em", fontFamily:font, marginBottom:5 }}>
        Step {step+1} of {steps.length}
      </div>
      <h2 style={{ fontSize:22, fontWeight:900, color:DARK, margin:"0 0 4px", fontFamily:font }}>{cur.title}</h2>
      <p style={{ fontSize:13.5, color:"#9B7450", margin:"0 0 20px", fontFamily:font, lineHeight:1.5 }}>{cur.sub}</p>

      {cur.content}

      {/* Last step: confirm button */}
      {step === steps.length - 1 && (
        <button
          onClick={() => onDone({ occasion, recipient, budget, selCats })}
          disabled={selCats.length === 0}
          style={{
            width:"100%", padding:"14px", marginTop:18, borderRadius:14, border:"none",
            background: selCats.length ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#E8D8C4",
            color: selCats.length ? "#fff" : "#9B7450",
            fontSize:15, fontWeight:800, cursor: selCats.length ? "pointer" : "default",
            fontFamily:font, boxShadow: selCats.length ? "0 4px 18px rgba(196,122,46,0.35)" : "none",
          }}
        >Build My Hamper →</button>
      )}

      {/* Skip link for steps 0–2 */}
      {step < steps.length - 1 && cur.canSkip && (
        <button onClick={() => setStep(s => s+1)} style={{
          width:"100%", marginTop:14, padding:"10px", background:"transparent", border:"none",
          fontSize:13, color:"#9B7450", cursor:"pointer", fontFamily:font,
        }}>Skip this →</button>
      )}
    </div>
  );
}

// ── Main builder view ─────────────────────────────────────────────────────
function BuilderView({ setView, navigate }) {
  const [phase, setPhase]       = useState("questions"); // "questions" | "builder"
  const [answers, setAnswers]   = useState(null);
  const [boxItems, setBoxItems] = useState([]); // { uid, product, x, y, w, h, rot, flipH }
  const [selItem, setSelItem]   = useState(null);
  const boxRef = useRef();

  const BOX_W = Math.min(320, (typeof window !== "undefined" ? window.innerWidth : 400) - 32);
  const BOX_H = Math.round(BOX_W * 0.78);

  const products = answers
    ? (answers.selCats || []).flatMap(cat => BUILDER_PRODUCTS[cat] || [])
    : [];

  function addToBox(product) {
    const uid = `${product.id}_${Date.now()}`;
    const w = Math.round(BOX_W * 0.28);
    const h = w;
    const x = 10 + Math.random() * (BOX_W - w - 20);
    const y = 10 + Math.random() * (BOX_H - h - 20);
    setBoxItems(prev => [...prev, { uid, product, x, y, w, h, rot:0, flipH:false }]);
    setSelItem(uid);
  }

  function removeFromBox(uid) {
    setBoxItems(prev => prev.filter(i => i.uid !== uid));
    if (selItem === uid) setSelItem(null);
  }

  function handleItemPointerDown(e, uid) {
    e.stopPropagation(); e.preventDefault();
    setSelItem(uid);
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    const item = boxItems.find(i => i.uid === uid);
    if (!item) return;
    const startX = e.clientX, startY = e.clientY;
    const origX = item.x, origY = item.y;
    const onMove = (me) => setBoxItems(prev => prev.map(i =>
      i.uid !== uid ? i : {
        ...i,
        x: Math.max(0, Math.min(BOX_W - i.w, origX + me.clientX - startX)),
        y: Math.max(0, Math.min(BOX_H - i.h, origY + me.clientY - startY)),
      }
    ));
    const onUp = () => { document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerup", onUp); };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }

  function handleResizePointerDown(e, uid, corner) {
    e.stopPropagation(); e.preventDefault();
    const item = boxItems.find(i => i.uid === uid);
    if (!item) return;
    const startX = e.clientX, startY = e.clientY;
    const { w: oW, h: oH, x: oX, y: oY } = item;
    const onMove = (me) => {
      const dx = me.clientX - startX, dy = me.clientY - startY;
      let nW=oW, nH=oH, nX=oX, nY=oY;
      if (corner==="se") { nW=Math.max(40,Math.min(BOX_W-oX,oW+dx)); nH=Math.max(40,Math.min(BOX_H-oY,oH+dy)); }
      if (corner==="sw") { nW=Math.max(40,oW-dx); nX=Math.max(0,oX+dx); nH=Math.max(40,Math.min(BOX_H-oY,oH+dy)); }
      if (corner==="ne") { nW=Math.max(40,Math.min(BOX_W-oX,oW+dx)); nH=Math.max(40,oH-dy); nY=Math.max(0,oY+dy); }
      if (corner==="nw") { nW=Math.max(40,oW-dx); nX=Math.max(0,oX+dx); nH=Math.max(40,oH-dy); nY=Math.max(0,oY+dy); }
      setBoxItems(prev => prev.map(i => i.uid===uid ? {...i,w:nW,h:nH,x:nX,y:nY} : i));
    };
    const onUp = () => { document.removeEventListener("pointermove", onMove); document.removeEventListener("pointerup", onUp); };
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }

  function handleQuote() {
    if (!boxItems.length) return;
    const itemNames = [...new Set(boxItems.map(i => i.product.name))].join(", ");
    const totalMin = boxItems.reduce((s,i) => s+i.product.price[0], 0);
    const totalMax = boxItems.reduce((s,i) => s+i.product.price[1], 0);
    const occasionLabel = BUILDER_OCCASIONS.find(o => o.id===answers?.occasion)?.label || "";
    const recipientLabel = BUILDER_RECIPIENTS.find(r => r.id===answers?.recipient)?.label || "";
    const budgetLabel = BUILDER_BUDGETS.find(b => b.id===answers?.budget)?.label || "";
    openBaatKaro(navigate,
      `🎁 Custom Gift Hamper Request\n\n` +
      (occasionLabel ? `Occasion: ${occasionLabel}\n` : "") +
      (recipientLabel ? `For: ${recipientLabel}\n` : "") +
      (budgetLabel ? `Budget: ${budgetLabel}\n` : "") +
      `Categories: ${(answers?.selCats||[]).join(", ")}\n\n` +
      `Items in my box:\n${itemNames}\n\n` +
      `Estimated range: ${fmt(totalMin)} – ${fmt(totalMax)}\n\n` +
      `Please help me finalise and pack this hamper!`
    );
  }

  // Questions phase
  if (phase === "questions") {
    return (
      <BuilderQuestions
        onDone={(ans) => { setAnswers(ans); setPhase("builder"); }}
        onBack={() => setView("home")}
      />
    );
  }

  // Builder phase
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100dvh - 56px)", overflow:"hidden" }}>
      {/* Header */}
      <div style={{
        padding:"10px 14px", background:"#fff", borderBottom:"1px solid rgba(196,122,46,0.15)",
        display:"flex", alignItems:"center", gap:10, flexShrink:0,
      }}>
        <button onClick={() => setPhase("questions")} style={{
          background:"none", border:"none", color:GOLD, fontSize:13, fontWeight:700,
          cursor:"pointer", fontFamily:font, padding:0,
        }}>← Edit</button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:800, color:DARK, fontFamily:font }}>Your Hamper Box</div>
          <div style={{ fontSize:10.5, color:"#9B7450", fontFamily:font, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {(answers?.selCats||[]).join(" · ")}
          </div>
        </div>
        <button
          onClick={handleQuote}
          disabled={!boxItems.length}
          style={{
            padding:"8px 14px", borderRadius:10, border:"none", flexShrink:0,
            background: boxItems.length ? "linear-gradient(135deg,#C47A2E,#CCAB4A)" : "#E8D8C4",
            color: boxItems.length ? "#fff" : "#9B7450",
            fontSize:12, fontWeight:700, cursor: boxItems.length ? "pointer" : "default", fontFamily:font,
          }}
        >Get Quote →</button>
      </div>

      {/* Box canvas */}
      <div style={{ flexShrink:0, padding:"12px 16px 6px", display:"flex", justifyContent:"center" }}>
        <div style={{ position:"relative" }}>
          <div
            ref={boxRef}
            onClick={() => setSelItem(null)}
            style={{
              width:BOX_W, height:BOX_H,
              background:"linear-gradient(160deg,#FDF8F0,#F5E8D0)",
              border:"2px solid rgba(196,122,46,0.3)", borderRadius:16,
              position:"relative", overflow:"visible",
              boxShadow:"inset 0 2px 14px rgba(196,122,46,0.07), 0 4px 20px rgba(44,26,14,0.1)",
            }}
          >
            {/* Ribbon decoration */}
            <div style={{
              position:"absolute", top:-1, left:"50%", transform:"translateX(-50%)",
              width:"55%", height:4,
              background:"linear-gradient(90deg,#C47A2E,#CCAB4A,#C47A2E)",
              borderRadius:"0 0 6px 6px",
            }} />

            {/* Empty state */}
            {boxItems.length===0 && (
              <div style={{
                position:"absolute", inset:0, display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:8, pointerEvents:"none",
              }}>
                <div style={{ fontSize:40, opacity:0.25 }}>🎁</div>
                <div style={{ fontSize:12, color:"rgba(44,26,14,0.3)", fontFamily:font, textAlign:"center", lineHeight:1.5 }}>
                  Tap products below<br/>to place them here
                </div>
              </div>
            )}

            {/* Items */}
            {boxItems.map(item => (
              <BoxItem
                key={item.uid}
                item={item}
                selected={selItem===item.uid}
                onPointerDown={(e) => handleItemPointerDown(e, item.uid)}
                onResize={(e,corner) => handleResizePointerDown(e, item.uid, corner)}
                onRotate={(deg) => setBoxItems(prev => prev.map(i => i.uid===item.uid ? {...i,rot:(i.rot+deg)%360} : i))}
                onFlip={() => setBoxItems(prev => prev.map(i => i.uid===item.uid ? {...i,flipH:!i.flipH} : i))}
                onRemove={() => removeFromBox(item.uid)}
              />
            ))}
          </div>
          {/* Bottom shadow */}
          <div style={{
            position:"absolute", bottom:-5, left:10, right:10, height:10,
            background:"rgba(44,26,14,0.1)", filter:"blur(4px)", borderRadius:"0 0 16px 16px", zIndex:-1,
          }} />
        </div>
      </div>

      {/* Hint */}
      <div style={{ textAlign:"center", fontSize:10.5, color:"#9B7450", fontFamily:font, padding:"0 0 6px" }}>
        {selItem ? "Drag to move · Corner handles to resize · Use ↺ ↻ ⇄ ✕ controls" : "Tap a product to add it · Tap item in box to select"}
      </div>

      {/* Items count */}
      {boxItems.length > 0 && (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px 4px" }}>
          <div style={{ fontSize:11, color:GOLD, fontWeight:700, fontFamily:font }}>
            {boxItems.length} item{boxItems.length!==1?"s":""} in box
            {" · "}
            {fmt(boxItems.reduce((s,i)=>s+i.product.price[0],0))} – {fmt(boxItems.reduce((s,i)=>s+i.product.price[1],0))}
          </div>
          <button onClick={() => { setBoxItems([]); setSelItem(null); }} style={{
            fontSize:10.5, color:"#9B7450", background:"none",
            border:"1px solid rgba(155,116,80,0.3)", padding:"3px 9px", borderRadius:6,
            cursor:"pointer", fontFamily:font,
          }}>Clear</button>
        </div>
      )}

      {/* Products grid */}
      <div style={{ flex:1, overflowY:"auto", padding:"4px 12px 24px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(96px,1fr))", gap:8 }}>
          {products.map(product => (
            <BuilderProductCard
              key={product.id}
              product={product}
              inBox={boxItems.some(i => i.product.id===product.id)}
              onClick={() => addToBox(product)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function GiftingHub() {
  const navigate = useNavigate();
  const [view, setView] = useState("home");
  const [isBulk, setIsBulk] = useState(false);

  const handleSetView = useCallback((v) => setView(v), []);

  return (
    <div style={{ minHeight: "100dvh", background: CREAM, fontFamily: font }}>
      <SEO
        title="Gift Hampers — Tendr"
        description="Curated gift hampers for every occasion. AI-powered suggestions, browse collections, or build your own. Local vendors, real products."
      />
      <HamburgerNav />

      {/* View header bar */}
      <div style={{
        background: "#fff", borderBottom: "1px solid rgba(196,122,46,0.12)",
        padding: "16px 20px 14px", position: "sticky", top: 0, zIndex: 90,
      }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: DARK, fontFamily: font }}>
            {view === "home" && "🎁 Gifting"}
            {view === "ai" && "🤖 AI Gift Suggester"}
            {view === "collections" && (isBulk ? "📦 Bulk Return Gifts" : "🛍️ Browse Collections")}
            {view === "builder" && "🎨 Build From Scratch"}
          </div>
          {view !== "home" && (
            <button onClick={() => setView("home")} style={{
              marginLeft: "auto", fontSize: 11, color: "#9B7450", background: "none",
              border: "1px solid rgba(155,116,80,0.3)", padding: "4px 10px",
              borderRadius: 8, cursor: "pointer", fontFamily: font,
            }}>Home</button>
          )}
        </div>
      </div>

      {/* Views */}
      <div>
        {view === "home" && <HomeView setView={handleSetView} setBulk={setIsBulk} />}
        {view === "ai" && <AIView setView={handleSetView} navigate={navigate} />}
        {view === "collections" && (
          <CollectionsView
            setView={handleSetView} navigate={navigate}
            isBulk={isBulk} setBulk={setIsBulk}
          />
        )}
        {view === "builder" && <BuilderView setView={handleSetView} navigate={navigate} />}
      </div>

      <Footer />
    </div>
  );
}
