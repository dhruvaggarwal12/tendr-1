import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import HamburgerNav from "../../components/HamburgerNav";
import { useBookVendors } from "../../context/BookVendorsContext";
import {
  getOccasionNames,
  getSimpleCategories,
  GUEST_BUCKETS,
  VENUE_TYPES,
  CATERING_MEAL_TYPES,
  tierBuckets,
  getCateringItem,
  narrowRange,
  formatINR,
} from "../../utils/priceEstimator";

const font = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const GOLD_LIGHT = "#CCAB4A";
const BG = "#F8F4EF";

const OCCASIONS = getOccasionNames();
const CITIES = ["Delhi", "Gurugram", "Noida", "Ghaziabad", "Faridabad", "Other NCR"];

// Non-per-guest package categories (decor, cake, photography, DJ, activities, "other")
// get a simple multiplier so a bigger guest count nudges a fixed-package price up —
// an honest, disclosed assumption rather than an invented per-item number.
const SIZE_MULTIPLIER = { "10-20": 0.85, "21-50": 1, "51-100": 1.15, "101-200": 1.35, "200+": 1.6 };

// The actual wizard. Reused by both the standalone /price-estimator page and
// PriceEstimatorModal (the centered popup opened from everywhere else in the app).
// Flow: tell us about the event -> venue -> what you need -> a quick level per thing
// you picked -> the price. No pre-ticked picks, no tips, no recommendations.
// `onFinalise(avgPrice)`, when provided, shows an "apply this to your budget?"
// prompt on the results screen instead of just the generic Start Over / Book Vendors actions.
export function PriceEstimatorWizard({ initialOccasion, embedded = false, onFinalise }) {
  const { openBookVendors } = useBookVendors();
  const [step, setStep] = useState(0); // 0 about, 1 venue, 2 categories, 3..3+n-1 per-category level, final
  const [occasion, setOccasion] = useState(
    OCCASIONS.includes(initialOccasion) ? initialOccasion : OCCASIONS[0]
  );
  const [guestBucketKey, setGuestBucketKey] = useState(null);
  const [city, setCity] = useState(null);
  const [venueTypeKey, setVenueTypeKey] = useState(null);
  const [venueAlreadyBooked, setVenueAlreadyBooked] = useState(null); // null | true | false
  const [chosenCategories, setChosenCategories] = useState([]); // simple category keys
  const [categoryChoice, setCategoryChoice] = useState({}); // key -> { tier } | { mealType, isVeg }
  const [finaliseChoice, setFinaliseChoice] = useState(null); // null | "applied" | "declined"

  const simpleCategories = useMemo(() => getSimpleCategories(occasion), [occasion]);
  const guestBucket = GUEST_BUCKETS.find((g) => g.key === guestBucketKey) || null;
  const venueType = VENUE_TYPES.find((v) => v.key === venueTypeKey) || null;

  // Reset the whole wizard whenever the occasion changes — fresh start, since the
  // categories/items available can differ completely between occasions.
  useEffect(() => {
    setGuestBucketKey(null);
    setCity(null);
    setVenueTypeKey(null);
    setVenueAlreadyBooked(null);
    setChosenCategories([]);
    setCategoryChoice({});
    setFinaliseChoice(null);
    setStep(0);
  }, [occasion]);

  const totalSteps = 3 + chosenCategories.length;
  const currentCategory = step >= 3 && step < totalSteps ? chosenCategories[step - 3] : null;
  const currentCategoryDef = currentCategory ? simpleCategories.find((c) => c.key === currentCategory) : null;

  const toggleCategory = (key) => {
    setChosenCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const setTier = (key, tier) => setCategoryChoice((prev) => ({ ...prev, [key]: { tier } }));
  const setCateringChoice = (patch) => setCategoryChoice((prev) => ({ ...prev, catering: { ...prev.catering, mealType: "buffet", isVeg: true, ...patch } }));

  // ── Pricing ──────────────────────────────────────────────────────────────
  const priced = useMemo(() => {
    const rows = [];
    for (const key of chosenCategories) {
      const def = simpleCategories.find((c) => c.key === key);
      if (!def) continue;
      const choice = categoryChoice[key];
      if (!choice) continue;

      if (key === "catering") {
        const item = getCateringItem(occasion, choice.mealType || "buffet", choice.isVeg !== false);
        if (!item || !guestBucket) continue;
        const mealLabel = CATERING_MEAL_TYPES.find((m) => m.key === (choice.mealType || "buffet"))?.label || "Buffet";
        // No quality tier was asked for catering, so take the middle slice of the
        // item's own range rather than its full basic-to-premium span.
        const perGuestRange = narrowRange(item.min, item.max, 0.5);
        rows.push({
          key, label: def.label,
          sub: `${choice.isVeg !== false ? "Veg" : "Non-veg"} ${mealLabel.toLowerCase()} · ${guestBucket.guests} guests`,
          min: perGuestRange.min * guestBucket.guests, max: perGuestRange.max * guestBucket.guests,
        });
        continue;
      }

      const tiers = tierBuckets(occasion, def.raw);
      const sel = tiers.find((t) => t.tier === choice.tier) || tiers[0];
      if (!sel || !guestBucket) continue;

      if (key === "gifting") {
        // "Per gift" items scale by guests under the assumption of one gift per guest.
        rows.push({
          key, label: def.label, sub: `${sel.tier} · ${guestBucket.guests} gifts`,
          min: sel.min * guestBucket.guests, max: sel.max * guestBucket.guests,
        });
        continue;
      }

      const mult = SIZE_MULTIPLIER[guestBucketKey] ?? 1;
      rows.push({
        key, label: def.label, sub: `${sel.tier} package`,
        min: Math.round(sel.min * mult), max: Math.round(sel.max * mult),
      });
    }

    const total = rows.reduce((acc, r) => ({ min: acc.min + r.min, max: acc.max + r.max }), { min: 0, max: 0 });

    let venue = null;
    if (venueType?.needsVenue && venueAlreadyBooked === false && guestBucket) {
      const tiers = tierBuckets(occasion, ["Venue"]);
      const sel = tiers.find((t) => t.tier === "Standard") || tiers[Math.floor(tiers.length / 2)];
      if (sel) {
        const mult = SIZE_MULTIPLIER[guestBucketKey] ?? 1;
        venue = { min: Math.round(sel.min * mult), max: Math.round(sel.max * mult) };
      }
    }

    return { rows, total, venue };
  }, [chosenCategories, categoryChoice, occasion, guestBucket, guestBucketKey, simpleCategories, venueType, venueAlreadyBooked]);

  const isFinal = step === totalSteps;
  const stepLabel = isFinal ? "Your estimate" :
    step === 0 ? "Your event" : step === 1 ? "Venue" : step === 2 ? "What you need" : currentCategoryDef?.label;

  const goNext = () => setStep((s) => Math.min(s + 1, totalSteps));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const canProceed =
    step === 0 ? !!guestBucketKey :
    step === 1 ? !!venueTypeKey && (!venueType?.needsVenue || venueAlreadyBooked !== null) :
    step === 2 ? chosenCategories.length > 0 :
    currentCategory === "catering" ? !!(categoryChoice.catering?.mealType) :
    currentCategory ? !!categoryChoice[currentCategory]?.tier :
    true;

  return (
    <div style={{ minHeight: embedded ? "auto" : "100vh", background: BG, fontFamily: font, paddingBottom: embedded ? 0 : "calc(140px + env(safe-area-inset-bottom, 0px))" }}>
      {!embedded && <HamburgerNav title="Price Estimator" showBack />}

      <div style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, padding: "clamp(16px,3vw,26px) clamp(16px,4vw,40px)", borderRadius: embedded ? "20px 20px 0 0" : 0 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", paddingRight: embedded ? 36 : 0 }}>
          <div style={{ color: "#fff", fontSize: "clamp(18px,3vw,24px)", fontWeight: 800, marginBottom: 10 }}>
            What will your event cost?
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {Array.from({ length: totalSteps + 1 }).map((_, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 100, background: i <= step ? "#fff" : "rgba(255,255,255,0.3)" }} />
            ))}
          </div>
          <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 12.5, marginTop: 6 }}>
            {isFinal ? "Done" : `Step ${step + 1} of ${totalSteps}`} · {stepLabel}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>

        {step === 0 && (
          <StepCard title="Tell us about your event" subtitle="We'll pull typical Delhi NCR prices for this.">
            <Field label="Occasion">
              <select value={occasion} onChange={(e) => setOccasion(e.target.value)} style={selectStyle}>
                {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Number of guests">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {GUEST_BUCKETS.map((g) => (
                  <Chip key={g.key} checked={guestBucketKey === g.key} onClick={() => setGuestBucketKey(g.key)} label={g.label} />
                ))}
              </div>
            </Field>
            <Field label="Location (optional)">
              <select value={city || ""} onChange={(e) => setCity(e.target.value || null)} style={selectStyle}>
                <option value="">Select a city</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </StepCard>
        )}

        {step === 1 && (
          <StepCard title="Where will it take place?" subtitle="This determines whether venue cost is part of your estimate.">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {VENUE_TYPES.map((v) => (
                <Checkbox key={v.key} checked={venueTypeKey === v.key}
                  onClick={() => { setVenueTypeKey(v.key); setVenueAlreadyBooked(null); }}
                  label={v.label} radio />
              ))}
            </div>
            {venueType?.needsVenue && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(196,122,46,0.12)" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E", marginBottom: 8 }}>Have you already booked this venue?</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Chip checked={venueAlreadyBooked === true} onClick={() => setVenueAlreadyBooked(true)} label="Yes — exclude venue rent" />
                  <Chip checked={venueAlreadyBooked === false} onClick={() => setVenueAlreadyBooked(false)} label="No — estimate it too" />
                </div>
              </div>
            )}
          </StepCard>
        )}

        {step === 2 && (
          <StepCard title="What do you want for your event?" subtitle="Tick everything you want priced — we'll ask one quick question per thing you pick.">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {simpleCategories.map((cat) => (
                <Checkbox key={cat.key} checked={chosenCategories.includes(cat.key)} onClick={() => toggleCategory(cat.key)} label={cat.label} />
              ))}
            </div>
            {chosenCategories.length === 0 && (
              <div style={{ color: "#c0392b", fontSize: 12.5, marginTop: 10, fontWeight: 600 }}>Pick at least one category to continue.</div>
            )}
          </StepCard>
        )}

        {currentCategory === "catering" && (
          <StepCard title="Catering & beverages" subtitle="Only asked because you picked this category.">
            <Field label="Veg or non-veg?">
              <div style={{ display: "flex", gap: 8 }}>
                <Chip checked={categoryChoice.catering?.isVeg !== false} onClick={() => setCateringChoice({ isVeg: true })} label="Veg" />
                <Chip checked={categoryChoice.catering?.isVeg === false} onClick={() => setCateringChoice({ isVeg: false })} label="Non-veg" />
              </div>
            </Field>
            <Field label="Meal type">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CATERING_MEAL_TYPES.map((m) => (
                  <Chip key={m.key} checked={(categoryChoice.catering?.mealType || "buffet") === m.key} onClick={() => setCateringChoice({ mealType: m.key })} label={m.label} />
                ))}
              </div>
            </Field>
          </StepCard>
        )}

        {currentCategory && currentCategory !== "catering" && (
          <StepCard title={currentCategoryDef?.label} subtitle="Only asked because you picked this category.">
            <TierPicker
              tiers={tierBuckets(occasion, currentCategoryDef.raw)}
              selected={categoryChoice[currentCategory]?.tier}
              onSelect={(tier) => setTier(currentCategory, tier)}
            />
          </StepCard>
        )}

        {isFinal && (
          <>
            <div style={{ background: "#fff", border: `2px solid ${GOLD}`, borderRadius: 16, padding: "20px", textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#8a6a4a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your event cost estimate</div>
              <div style={{ fontSize: "clamp(26px,6vw,34px)", fontWeight: 900, color: "#2C1A0E" }}>
                {formatINR(priced.total.min)} – {formatINR(priced.total.max)}
              </div>
              <div style={{ fontSize: 12, color: "#8a6a4a", marginTop: 6 }}>
                {guestBucket?.label}{occasion ? ` · ${occasion}` : ""}{city ? ` · ${city}` : ""}
              </div>
            </div>

            {onFinalise && (
              <div style={{ background: finaliseChoice === "applied" ? "rgba(34,197,94,0.08)" : "#fff", border: `1.5px solid ${finaliseChoice === "applied" ? "rgba(34,197,94,0.35)" : "rgba(196,122,46,0.25)"}`, borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
                {finaliseChoice === "applied" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: "#15803d" }}>
                    <span>✓</span> Applied {formatINR(Math.round((priced.total.min + priced.total.max) / 2))} to your budget
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#2C1A0E", marginBottom: 2 }}>Finalise this estimate?</div>
                    <div style={{ fontSize: 12, color: "#8a6a4a", marginBottom: 12, lineHeight: 1.5 }}>
                      We'll set your budget to {formatINR(Math.round((priced.total.min + priced.total.max) / 2))} — the middle of this range.
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { setFinaliseChoice("applied"); onFinalise(Math.round((priced.total.min + priced.total.max) / 2)); }}
                        style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer" }}>
                        Yes, use this
                      </button>
                      <button onClick={() => setFinaliseChoice("declined")}
                        style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(196,122,46,0.25)", background: "transparent", color: GOLD, fontSize: 13, fontWeight: 700, fontFamily: font, cursor: "pointer" }}>
                        Not yet
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {priced.rows.length > 0 && (
              <StepCard title="Itemised breakdown">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {priced.rows.map((r) => (
                    <div key={r.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#2C1A0E" }}>{r.label}</div>
                        <div style={{ fontSize: 11.5, color: "#8a6a4a", marginTop: 1 }}>{r.sub}</div>
                      </div>
                      <span style={{ color: GOLD, fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap" }}>{formatINR(r.min)}–{formatINR(r.max)}</span>
                    </div>
                  ))}
                </div>
              </StepCard>
            )}

            {priced.venue && (
              <StepCard title="Venue (optional)">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12.5, color: "#8a6a4a", lineHeight: 1.5 }}>Shown separately — not included in the total above. Add it in if you still need to book a venue.</div>
                  <span style={{ color: GOLD, fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap", marginLeft: 10 }}>{formatINR(priced.venue.min)}–{formatINR(priced.venue.max)}</span>
                </div>
              </StepCard>
            )}

            <StepCard title="Assumptions & exclusions">
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                <li style={{ fontSize: 12, color: "#5A3520", lineHeight: 1.5 }}>Prices reflect typical Delhi NCR rates for {guestBucket?.label || "your guest count"} — actual cost varies by vendor and season.</li>
                <li style={{ fontSize: 12, color: "#5A3520", lineHeight: 1.5 }}>Decor, cake, photography, DJ, activities and "other" prices are scaled for your guest count as a fixed package, not priced per person.</li>
                {chosenCategories.includes("gifting") && (
                  <li style={{ fontSize: 12, color: "#5A3520", lineHeight: 1.5 }}>Return gifts assume one gift per guest.</li>
                )}
                <li style={{ fontSize: 12, color: "#5A3520", lineHeight: 1.5 }}>GST, transport, setup/teardown and vendor minimum order values aren't included — budget an extra 10–15%.</li>
                {priced.venue && (
                  <li style={{ fontSize: 12, color: "#5A3520", lineHeight: 1.5 }}>Venue security deposit and cleaning fees, if any, aren't included in the venue estimate.</li>
                )}
                <li style={{ fontSize: 12, color: "#5A3520", lineHeight: 1.5 }}>This is an estimate, not a final vendor quote.</li>
              </ul>
            </StepCard>
          </>
        )}
      </div>

      <div style={{ position: embedded ? "sticky" : "fixed", left: 0, right: 0, bottom: 0, zIndex: 500, background: "#fff", borderTop: "1.5px solid rgba(196,122,46,0.18)", boxShadow: "0 -6px 24px rgba(28,9,0,0.08)", padding: "14px 16px calc(14px + env(safe-area-inset-bottom, 0px))" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          {!isFinal ? (
            <>
              <button onClick={goBack} disabled={step === 0} style={{ ...navBtnStyle, visibility: step === 0 ? "hidden" : "visible" }}>← Back</button>
              <button onClick={goNext} disabled={!canProceed} style={{ ...primaryBtnStyle, opacity: canProceed ? 1 : 0.45, cursor: canProceed ? "pointer" : "not-allowed" }}>
                {step === totalSteps - 1 ? "See my estimate →" : "Next →"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(2)} style={navBtnStyle}>← Edit requirements</button>
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

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function Checkbox({ checked, onClick, label, radio }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: checked ? "rgba(196,122,46,0.07)" : "#fff", border: `1.5px solid ${checked ? GOLD : "rgba(196,122,46,0.14)"}`, borderRadius: 12, cursor: "pointer" }}>
      <div style={{ width: 20, height: 20, borderRadius: radio ? "50%" : 6, flexShrink: 0, border: `2px solid ${checked ? GOLD : "rgba(196,122,46,0.35)"}`, background: checked ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {checked && <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>{radio ? "" : "✓"}</span>}
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color: "#2C1A0E" }}>{label}</span>
    </div>
  );
}

function Chip({ checked, onClick, label }) {
  return (
    <button onClick={onClick} style={{ padding: "9px 14px", borderRadius: 100, border: `1.5px solid ${checked ? GOLD : "rgba(196,122,46,0.25)"}`, background: checked ? "rgba(196,122,46,0.1)" : "#fff", color: checked ? GOLD : "#5A3520", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
      {label}
    </button>
  );
}

function TierPicker({ tiers, selected, onSelect }) {
  if (!tiers.length) return <div style={{ fontSize: 13, color: "#8a6a4a" }}>No pricing data for this category yet.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {tiers.map((t) => {
        const checked = selected === t.tier;
        return (
          <div key={t.tier} onClick={() => onSelect(t.tier)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${checked ? GOLD : "rgba(196,122,46,0.14)"}`, background: checked ? "rgba(196,122,46,0.07)" : "#fff", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, border: `2px solid ${checked ? GOLD : "rgba(196,122,46,0.35)"}`, background: checked ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {checked && <span style={{ color: "#fff", fontSize: 11, fontWeight: 900 }}>✓</span>}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E" }}>{t.tier}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: GOLD, whiteSpace: "nowrap" }}>{formatINR(t.min)}–{formatINR(t.max)}{t.perGuest ? " /guest" : ""}</span>
          </div>
        );
      })}
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
