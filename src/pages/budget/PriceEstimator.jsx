import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";
import { useBookVendors } from "../../context/BookVendorsContext";
import {
  getOccasionNames,
  getCategoriesForOccasion,
  getServicesForOccasion,
  lineTotal,
  isPerGuest,
  formatINR,
} from "../../utils/priceEstimator";

const font = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const GOLD_LIGHT = "#CCAB4A";
const BG = "#F8F4EF";
const BASE_URL = import.meta.env.VITE_BASE_URL;

function resizePhoto(file, maxPx = 1200) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.src = url;
  });
}

const PRIORITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const isEssential = (priority) => priority === "Critical" || priority === "High";

const OCCASIONS = getOccasionNames();

const LOCATIONS = [
  { label: "At Home", tip: "You likely don't need the Venue category — a rented hall/garden doesn't apply. Do check with your society/RWA about decor, DJ volume or late-night noise rules." },
  { label: "Banquet Hall / Party Hall", tip: "Ask the hall about their outside-catering and outside-decorator policy before booking other vendors — some halls charge extra or don't allow it." },
  { label: "Outdoor (Garden / Lawn)", tip: "Budget for a weather backup (tent/canopy) and confirm the venue allows a generator — outdoor power supply is often unreliable." },
  { label: "Farmhouse", tip: "Factor in travel time and cab/parking arrangements for guests — farmhouses are usually outside the main city." },
  { label: "Restaurant / Private Dining", tip: "Most restaurants have a minimum food & beverage spend — confirm it covers your guest count before locking the date." },
  { label: "Rooftop / Terrace", tip: "Check the venue's rain/wind backup plan and sound curfew timing — rooftops often have earlier cutoffs." },
  { label: "Community Hall / Club", tip: "Ask about the booking deposit's refund policy and cleaning charges — community halls are often strict here." },
  { label: "Still deciding", tip: "Once you pick a venue, come back and re-check your Venue category — costs vary a lot between home, hall, and outdoor setups." },
];

function keyOf(category, idx) {
  return `${category}::${idx}`;
}

// The actual wizard. Reused by both the standalone /price-estimator page and
// PriceEstimatorModal (the centered popup opened from everywhere else in the app).
// `onFinalise(avgPrice)`, when provided, shows an "apply this to your budget?"
// prompt on the results screen instead of just the generic Start Over / Book Vendors actions.
export function PriceEstimatorWizard({ initialOccasion, embedded = false, onFinalise }) {
  const { openBookVendors } = useBookVendors();
  const [step, setStep] = useState(0); // 0 occasion, 1 guests, 2 categories, 3 location, 4..4+n-1 per-category items, final = 4+n
  const [occasion, setOccasion] = useState(
    OCCASIONS.includes(initialOccasion) ? initialOccasion : OCCASIONS[0]
  );
  const [guestCount, setGuestCount] = useState(50);
  const [chosenCategories, setChosenCategories] = useState([]);
  const [location, setLocation] = useState(null);
  const [selected, setSelected] = useState({}); // "category::idx" -> { qty }
  const [expandedCats, setExpandedCats] = useState({});
  const [visitedCats, setVisitedCats] = useState(() => new Set());
  const [photoMatch, setPhotoMatch] = useState({ phase: "idle", preview: null, result: null, error: "" }); // idle | analyzing | done | error
  const photoInputRef = useRef(null);
  const [finaliseChoice, setFinaliseChoice] = useState(null); // null | "applied" | "declined"

  const allCategories = useMemo(() => getCategoriesForOccasion(occasion), [occasion]);
  const allServices = useMemo(() => getServicesForOccasion(occasion), [occasion]);

  // Reset the whole wizard whenever the occasion changes (fresh start = less confusing
  // than carrying over category/item picks that may not even exist for the new occasion).
  useEffect(() => {
    const essentialCats = allCategories.filter((cat) =>
      (allServices[cat] || []).some((item) => item.priority === "Critical")
    );
    setChosenCategories(essentialCats);
    setLocation(null);
    setSelected({});
    setExpandedCats({});
    setVisitedCats(new Set());
    setPhotoMatch({ phase: "idle", preview: null, result: null, error: "" });
    setFinaliseChoice(null);
    setStep(0);
  }, [occasion]); // eslint-disable-line react-hooks/exhaustive-deps

  const itemStepCategories = chosenCategories;
  const totalSteps = 4 + itemStepCategories.length; // + final results screen beyond this
  const currentCategory = step >= 4 && step < totalSteps ? itemStepCategories[step - 4] : null;

  const toggleCategory = (cat) => {
    setChosenCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleItem = (cat, idx) => {
    const k = keyOf(cat, idx);
    setSelected((prev) => {
      const next = { ...prev };
      if (next[k]) delete next[k];
      else next[k] = { qty: 1 };
      return next;
    });
  };

  const setQty = (cat, idx, qty) => {
    const k = keyOf(cat, idx);
    setSelected((prev) => ({ ...prev, [k]: { qty: Math.max(1, qty) } }));
  };

  // Photo -> real catalog match. Sends the actual Decor line items for this
  // occasion as a closed set the model must pick from, so every matched price
  // is a real pricingData.json entry rather than an AI-guessed number.
  const analyzeDecorPhoto = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await resizePhoto(file);
    setPhotoMatch({ phase: "analyzing", preview: dataUrl, result: null, error: "" });
    try {
      const decorItems = allServices["Decor"] || [];
      const catalog = decorItems.map((it) => ({ service: it.service, spec: it.spec }));
      const base64 = dataUrl.split(",")[1];
      const res = await fetch(`${BASE_URL}/decor-photo-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType: "image/jpeg", occasion, catalog }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      // Tick the matched items using the exact same selection mechanism as
      // manual picks, so qty/price math and the final summary stay identical.
      setSelected((prev) => {
        const next = { ...prev };
        (data.matches || []).forEach((m) => {
          const idx = decorItems.findIndex((it) => it.service === m.service);
          if (idx === -1) return;
          next[keyOf("Decor", idx)] = { qty: Math.max(1, Number(m.qty) || 1) };
        });
        return next;
      });

      setPhotoMatch({ phase: "done", preview: dataUrl, result: data, error: "" });
    } catch (e) {
      setPhotoMatch({ phase: "error", preview: dataUrl, result: null, error: e.message || "Couldn't analyze that photo. Please try again." });
    }
  };

  // Pre-tick a category's essentials the first time we land on its item step —
  // tracked by visitedCats (not by what's currently selected) so deliberately
  // unticking everything in a category doesn't make it look "unvisited" and
  // get re-ticked if the user navigates back to it later.
  useEffect(() => {
    if (!currentCategory || visitedCats.has(currentCategory)) return;
    const items = allServices[currentCategory] || [];
    setSelected((prev) => {
      const next = { ...prev };
      items.forEach((item, idx) => {
        if (isEssential(item.priority)) next[keyOf(currentCategory, idx)] = { qty: 1 };
      });
      return next;
    });
    setVisitedCats((prev) => new Set(prev).add(currentCategory));
  }, [currentCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const { total, byCategory, lineCount } = useMemo(() => {
    let min = 0, max = 0, count = 0;
    const cats = {};
    for (const cat of chosenCategories) {
      const items = allServices[cat] || [];
      let catMin = 0, catMax = 0;
      items.forEach((item, idx) => {
        const sel = selected[keyOf(cat, idx)];
        if (!sel) return;
        const t = lineTotal(item, { guestCount, qty: sel.qty });
        catMin += t.min; catMax += t.max;
        min += t.min; max += t.max;
        count++;
      });
      if (catMin || catMax) cats[cat] = { min: catMin, max: catMax };
    }
    return { total: { min, max }, byCategory: cats, lineCount: count };
  }, [chosenCategories, allServices, selected, guestCount]);

  // Recommendations for the final screen — built only from real selected data
  // (lead times, priority, category costs) plus the chosen venue type's canned tip.
  const recommendations = useMemo(() => {
    const recs = [];

    const locTip = LOCATIONS.find((l) => l.label === location)?.tip;
    if (locTip) recs.push(locTip);

    // Missing essentials: Critical items in a chosen category that weren't ticked.
    const missing = [];
    for (const cat of chosenCategories) {
      (allServices[cat] || []).forEach((item, idx) => {
        if (item.priority === "Critical" && !selected[keyOf(cat, idx)]) {
          missing.push(item.service);
        }
      });
    }
    if (missing.length) {
      recs.push(`You haven't picked ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "..." : ""} — most ${occasion} events include ${missing.length > 1 ? "these" : "this"}. Worth double-checking.`);
    }

    // Longest lead time among what's actually selected.
    let longest = null, longestNum = -1;
    for (const cat of chosenCategories) {
      (allServices[cat] || []).forEach((item, idx) => {
        if (!selected[keyOf(cat, idx)]) return;
        const m = (item.lead || "").match(/(\d+)/g);
        const n = m ? Math.max(...m.map(Number)) : -1;
        if (n > longestNum) { longestNum = n; longest = item; }
      });
    }
    if (longest && longestNum > 7) {
      recs.push(`Book ${longest.service} first — it needs the most lead time (${longest.lead}).`);
    }

    // Biggest-cost category — worth comparing vendors on.
    const biggest = Object.entries(byCategory).sort((a, b) => b[1].max - a[1].max)[0];
    if (biggest && biggest[1].max > 0) {
      recs.push(`${biggest[0]} is your biggest cost — get at least 2–3 vendor quotes before booking it.`);
    }

    recs.push("Keep a buffer of about 15–20% on top of this total for GST, service charges, and last-minute additions.");

    return recs;
  }, [location, chosenCategories, allServices, selected, byCategory, occasion]);

  const isFinal = step === totalSteps;
  const stepLabel = isFinal ? "Your estimate" :
    step === 0 ? "Occasion" : step === 1 ? "Guests" : step === 2 ? "Categories" : step === 3 ? "Location" : currentCategory;

  const goNext = () => setStep((s) => Math.min(s + 1, totalSteps));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const canProceed =
    step === 2 ? chosenCategories.length > 0 :
    step === 3 ? !!location :
    true;

  return (
    <div style={{ minHeight: embedded ? "auto" : "100vh", background: BG, fontFamily: font, paddingBottom: embedded ? 0 : "calc(140px + env(safe-area-inset-bottom, 0px))" }}>
      {!embedded && <HamburgerNav title="Price Estimator" showBack />}

      <div style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, padding: "clamp(16px,3vw,26px) clamp(16px,4vw,40px)", borderRadius: embedded ? "20px 20px 0 0" : 0 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", paddingRight: embedded ? 36 : 0 }}>
          <div style={{ color: "#fff", fontSize: "clamp(18px,3vw,24px)", fontWeight: 800, marginBottom: 10 }}>
            What will your event cost?
          </div>
          {/* Progress */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {Array.from({ length: totalSteps + 1 }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 100,
                background: i <= step ? "#fff" : "rgba(255,255,255,0.3)",
              }} />
            ))}
          </div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12.5, marginTop: 6 }}>
            {isFinal ? "Done" : `Step ${step + 1} of ${totalSteps}`} · {stepLabel}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>

        {step === 0 && (
          <StepCard title="What's the occasion?" subtitle="We'll pull typical Delhi NCR prices for this.">
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              style={selectStyle}
            >
              {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </StepCard>
        )}

        {step === 1 && (
          <StepCard title="How many guests?" subtitle="This is used to scale catering and other per-guest costs.">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="number"
                min={1}
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 1))}
                style={{ ...selectStyle, width: 120, textAlign: "center", fontWeight: 800 }}
              />
              <span style={{ fontSize: 14, color: "#5A3520", fontWeight: 600 }}>guests</span>
            </div>
          </StepCard>
        )}

        {step === 2 && (
          <StepCard title="What do you need for this event?" subtitle="We've pre-ticked the categories most people need — adjust as you like.">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {allCategories.map((cat) => {
                const checked = chosenCategories.includes(cat);
                return (
                  <Checkbox key={cat} checked={checked} onClick={() => toggleCategory(cat)} label={cat} />
                );
              })}
            </div>
            {chosenCategories.length === 0 && (
              <div style={{ color: "#c0392b", fontSize: 12.5, marginTop: 10, fontWeight: 600 }}>
                Pick at least one category to continue.
              </div>
            )}
          </StepCard>
        )}

        {step === 3 && (
          <StepCard title="Where will this be hosted?" subtitle="This doesn't change the numbers, but we'll use it for a few tips at the end.">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {LOCATIONS.map((loc) => (
                <Checkbox
                  key={loc.label}
                  checked={location === loc.label}
                  onClick={() => setLocation(loc.label)}
                  label={loc.label}
                  radio
                />
              ))}
            </div>
          </StepCard>
        )}

        {currentCategory && (
          <StepCard title={currentCategory} subtitle="Tick what you want. We've pre-ticked the essentials — untick anything you don't need.">
            {currentCategory === "Decor" && (
              <DecorPhotoMatch
                photoMatch={photoMatch}
                onPickFile={(file) => analyzeDecorPhoto(file)}
                inputRef={photoInputRef}
              />
            )}
            <ItemList
              category={currentCategory}
              items={allServices[currentCategory] || []}
              selected={selected}
              guestCount={guestCount}
              expanded={!!expandedCats[currentCategory]}
              onToggleExpand={() => setExpandedCats((p) => ({ ...p, [currentCategory]: !p[currentCategory] }))}
              onToggleItem={toggleItem}
              onSetQty={setQty}
            />
          </StepCard>
        )}

        {isFinal && (
          <>
            <div style={{
              background: "#fff", border: `2px solid ${GOLD}`, borderRadius: 16, padding: "20px",
              textAlign: "center", marginBottom: 16,
            }}>
              <div style={{ fontSize: 12.5, color: "#8a6a4a", fontWeight: 700, marginBottom: 4 }}>
                {lineCount} thing{lineCount === 1 ? "" : "s"} selected · estimated total
              </div>
              <div style={{ fontSize: "clamp(26px,6vw,34px)", fontWeight: 900, color: "#2C1A0E" }}>
                {formatINR(total.min)} – {formatINR(total.max)}
              </div>
            </div>

            {onFinalise && (
              <div style={{
                background: finaliseChoice === "applied" ? "rgba(34,197,94,0.08)" : "#fff",
                border: `1.5px solid ${finaliseChoice === "applied" ? "rgba(34,197,94,0.35)" : "rgba(196,122,46,0.25)"}`,
                borderRadius: 14, padding: "16px 18px", marginBottom: 14,
              }}>
                {finaliseChoice === "applied" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: "#15803d" }}>
                    <span>✓</span> Applied {formatINR(Math.round((total.min + total.max) / 2))} to your budget
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#2C1A0E", marginBottom: 2 }}>Finalise this estimate?</div>
                    <div style={{ fontSize: 12, color: "#8a6a4a", marginBottom: 12, lineHeight: 1.5 }}>
                      We'll set your budget to {formatINR(Math.round((total.min + total.max) / 2))} — the middle of this range.
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => { setFinaliseChoice("applied"); onFinalise(Math.round((total.min + total.max) / 2)); }}
                        style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer" }}
                      >
                        Yes, use this
                      </button>
                      <button
                        onClick={() => setFinaliseChoice("declined")}
                        style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: GOLD, fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer" }}
                      >
                        Not yet
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {Object.keys(byCategory).length > 0 && (
              <StepCard title="Breakdown by category">
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {Object.entries(byCategory).map(([cat, v]) => (
                    <div key={cat} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                      <span style={{ color: "#2C1A0E", fontWeight: 600 }}>{cat}</span>
                      <span style={{ color: GOLD, fontWeight: 700 }}>{formatINR(v.min)}–{formatINR(v.max)}</span>
                    </div>
                  ))}
                </div>
              </StepCard>
            )}

            <StepCard title="Recommended things to do next">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recommendations.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
                    <span style={{ fontSize: 13, color: "#5A3520", lineHeight: 1.5 }}>{r}</span>
                  </div>
                ))}
              </div>
            </StepCard>

            <div style={{
              background: "rgba(196,122,46,0.08)", border: "1.5px solid rgba(196,122,46,0.18)",
              borderRadius: 12, padding: "12px 16px", fontSize: 12, color: "#5A3520", lineHeight: 1.5, marginTop: 4,
            }}>
              This is an estimate built from typical Delhi NCR prices, not a final vendor quote — actual cost can vary by vendor, season and exact requirements.
            </div>
          </>
        )}
      </div>

      <div style={{
        position: embedded ? "sticky" : "fixed", left: 0, right: 0, bottom: 0, zIndex: 500,
        background: "#fff", borderTop: "1.5px solid rgba(196,122,46,0.18)",
        boxShadow: "0 -6px 24px rgba(28,9,0,0.08)",
        padding: "14px 16px calc(14px + env(safe-area-inset-bottom, 0px))",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          {!isFinal ? (
            <>
              <button
                onClick={goBack}
                disabled={step === 0}
                style={{ ...navBtnStyle, visibility: step === 0 ? "hidden" : "visible" }}
              >
                ← Back
              </button>
              <button
                onClick={goNext}
                disabled={!canProceed}
                style={{
                  ...primaryBtnStyle,
                  opacity: canProceed ? 1 : 0.45,
                  cursor: canProceed ? "pointer" : "not-allowed",
                }}
              >
                {step === totalSteps - 1 ? "See my estimate →" : "Next →"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(0)} style={navBtnStyle}>↺ Start over</button>
              <a href="/booking" onClick={embedded ? (e) => { e.preventDefault(); openBookVendors(); } : undefined} style={{ ...primaryBtnStyle, textDecoration: "none", display: "inline-block" }}>
                Book vendors for this →
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Standalone page at /price-estimator — kept as a fallback for direct links/bookmarks.
// Everywhere else in the app opens PriceEstimatorModal instead.
export default function PriceEstimator() {
  const [searchParams] = useSearchParams();
  return <PriceEstimatorWizard initialOccasion={searchParams.get("occasion")} />;
}

function StepCard({ title, subtitle, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "20px", marginBottom: 14, border: "1.5px solid rgba(196,122,46,0.12)" }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: "#2C1A0E", marginBottom: subtitle ? 4 : 14 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12.5, color: "#8a6a4a", marginBottom: 14, lineHeight: 1.4 }}>{subtitle}</div>}
      {children}
    </div>
  );
}

function Checkbox({ checked, onClick, label, radio }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
        background: checked ? "rgba(196,122,46,0.07)" : "#fff",
        border: `1.5px solid ${checked ? GOLD : "rgba(196,122,46,0.14)"}`,
        borderRadius: 12, cursor: "pointer",
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: radio ? "50%" : 6, flexShrink: 0,
        border: `2px solid ${checked ? GOLD : "rgba(196,122,46,0.35)"}`,
        background: checked ? GOLD : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {checked && <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>{radio ? "" : "✓"}</span>}
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color: "#2C1A0E" }}>{label}</span>
    </div>
  );
}

function DecorPhotoMatch({ photoMatch, onPickFile, inputRef }) {
  const { phase, preview, result, error } = photoMatch;
  const matchCount = result?.matches?.length || 0;

  return (
    <div style={{
      background: "rgba(196,122,46,0.06)", border: "1.5px dashed rgba(196,122,46,0.3)",
      borderRadius: 12, padding: "14px", marginBottom: 14,
    }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => { onPickFile(e.target.files?.[0]); e.target.value = ""; }}
      />

      {phase === "idle" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>📷</span>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#2C1A0E" }}>Have a decor photo you like?</div>
            <div style={{ fontSize: 11.5, color: "#8a6a4a", marginTop: 2 }}>Upload it — we'll match what's in it to real prices below.</div>
          </div>
          <button onClick={() => inputRef.current?.click()} style={{ ...navBtnStyle, padding: "9px 14px", fontSize: 12.5 }}>
            Upload photo
          </button>
        </div>
      )}

      {phase === "analyzing" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {preview && <img src={preview} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#2C1A0E" }}>Analysing your photo…</div>
            <div style={{ fontSize: 11.5, color: "#8a6a4a", marginTop: 2 }}>Matching it against real Decor prices for this occasion.</div>
          </div>
        </div>
      )}

      {phase === "error" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            {preview && <img src={preview} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
            <div style={{ fontSize: 13, color: "#c0392b", fontWeight: 600 }}>{error}</div>
          </div>
          <button onClick={() => inputRef.current?.click()} style={{ ...navBtnStyle, padding: "8px 14px", fontSize: 12.5 }}>Try another photo</button>
        </div>
      )}

      {phase === "done" && (
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            {preview && <img src={preview} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />}
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#15803d" }}>
                {matchCount > 0 ? `✓ Matched ${matchCount} item${matchCount === 1 ? "" : "s"} from your photo` : "No exact catalog matches found in this photo"}
              </div>
              {result?.styleNote && (
                <div style={{ fontSize: 11.5, color: "#8a6a4a", marginTop: 3, lineHeight: 1.4 }}>{result.styleNote}</div>
              )}
              {result?.unmatchedNote && (
                <div style={{ fontSize: 11, color: "#8a6a4a", marginTop: 3, lineHeight: 1.4, fontStyle: "italic" }}>{result.unmatchedNote}</div>
              )}
              {matchCount > 0 && (
                <div style={{ fontSize: 11, color: "#8a6a4a", marginTop: 4 }}>Ticked below — adjust anything before continuing.</div>
              )}
            </div>
          </div>
          <button onClick={() => inputRef.current?.click()} style={{ ...navBtnStyle, padding: "8px 14px", fontSize: 12.5, marginTop: 10 }}>Try another photo</button>
        </div>
      )}
    </div>
  );
}

function ItemList({ category, items, selected, guestCount, expanded, onToggleExpand, onToggleItem, onSetQty }) {
  const sortedIdx = items
    .map((item, idx) => idx)
    .sort((a, b) => (PRIORITY_RANK[items[a].priority] ?? 9) - (PRIORITY_RANK[items[b].priority] ?? 9));
  const essentialIdx = sortedIdx.filter((idx) => isEssential(items[idx].priority));
  const extraIdx = sortedIdx.filter((idx) => !isEssential(items[idx].priority));
  const visibleEssential = essentialIdx.length > 0 ? essentialIdx : sortedIdx.slice(0, 2);
  const visibleExtra = essentialIdx.length > 0 ? extraIdx : sortedIdx.slice(2);

  const renderRow = (idx) => {
    const item = items[idx];
    const k = keyOf(category, idx);
    const sel = selected[k];
    const checked = !!sel;
    const perGuest = isPerGuest(item.basis);
    const t = lineTotal(item, { guestCount, qty: sel?.qty ?? 1 });
    return (
      <div
        key={k}
        onClick={() => onToggleItem(category, idx)}
        style={{
          display: "flex", alignItems: "flex-start", gap: 12,
          background: "#fff", borderRadius: 12, padding: "12px 14px",
          border: `1.5px solid ${checked ? GOLD : "rgba(196,122,46,0.14)"}`,
          cursor: "pointer",
        }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
          border: `2px solid ${checked ? GOLD : "rgba(196,122,46,0.35)"}`,
          background: checked ? GOLD : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {checked && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E" }}>{item.service}</span>
            {item.spec && (
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#8a6a4a", background: "rgba(196,122,46,0.1)", padding: "2px 8px", borderRadius: 100 }}>
                {item.spec}
              </span>
            )}
            {isEssential(item.priority) && (
              <span style={{ fontSize: 10, fontWeight: 800, color: "#15803d", background: "rgba(34,197,94,0.1)", padding: "2px 8px", borderRadius: 100 }}>
                Recommended
              </span>
            )}
          </div>
          {item.includes && (
            <div style={{ fontSize: 12, color: "#8a6a4a", marginTop: 3, lineHeight: 1.4 }}>Includes: {item.includes}</div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: GOLD }}>
              {formatINR(item.min)}–{formatINR(item.max)}
            </span>
            {perGuest && <span style={{ fontSize: 11, color: "#aaa" }}>per guest</span>}

            {checked && perGuest && (
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2C1A0E" }}>
                × {guestCount} guests = {formatINR(t.min)}–{formatINR(t.max)}
              </span>
            )}

            {checked && !perGuest && (
              <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: "#aaa" }}>qty</span>
                <button onClick={() => onSetQty(category, idx, (sel.qty ?? 1) - 1)} style={qtyBtnStyle}>−</button>
                <span style={{ fontSize: 12.5, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{sel.qty ?? 1}</span>
                <button onClick={() => onSetQty(category, idx, (sel.qty ?? 1) + 1)} style={qtyBtnStyle}>+</button>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2C1A0E" }}>= {formatINR(t.min)}–{formatINR(t.max)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {visibleEssential.map(renderRow)}
        {expanded && visibleExtra.map(renderRow)}
      </div>
      {visibleExtra.length > 0 && (
        <button onClick={onToggleExpand} style={{ marginTop: 8, background: "none", border: "none", color: GOLD, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: font, padding: "4px 2px" }}>
          {expanded ? "– Show fewer options" : `+ Show ${visibleExtra.length} more option${visibleExtra.length === 1 ? "" : "s"}`}
        </button>
      )}
    </div>
  );
}

const selectStyle = {
  padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)",
  fontFamily: font, fontSize: 15, fontWeight: 700, color: "#2C1A0E",
  background: "#fff", cursor: "pointer", width: "100%",
};

const navBtnStyle = {
  padding: "12px 20px", borderRadius: 12, border: "1.5px solid rgba(196,122,46,0.3)",
  background: "rgba(196,122,46,0.06)", color: GOLD, fontSize: 14, fontWeight: 700,
  cursor: "pointer", fontFamily: font,
};

const primaryBtnStyle = {
  padding: "12px 24px", borderRadius: 12, border: "none",
  background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#fff",
  fontSize: 14, fontWeight: 800, fontFamily: font, boxShadow: "0 4px 16px rgba(196,122,46,0.35)",
};

const qtyBtnStyle = {
  width: 22, height: 22, borderRadius: 6, border: "1.5px solid rgba(196,122,46,0.3)",
  background: "rgba(196,122,46,0.06)", color: GOLD, fontWeight: 800, fontSize: 13,
  cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center",
  padding: 0, lineHeight: 1,
};
