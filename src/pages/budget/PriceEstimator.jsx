import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import HamburgerNav from "../../components/HamburgerNav";
import DecorAnalyzer from "../../components/DecorAnalyzer";
import AuthModal from "../../components/AuthModal";
import { useChatOverlay } from "../../context/ChatContext";
import { usePriceEstimator } from "../../context/PriceEstimatorContext";
import {
  getOccasionNames,
  getServicesForOccasion,
  getSimpleCategories,
  GUEST_BUCKETS,
  nearestGuestBucket,
  VENUE_TYPES,
  CATERING_MEAL_TYPES,
  tierBuckets,
  getCateringItem,
  narrowRange,
  lineTotal,
  isPerGuest,
  buildPackageTiers,
  formatINR,
  fetchPriceBenchmark,
  blendWithBenchmark,
  fetchCategoryPricing,
} from "../../utils/priceEstimator";

// Screenshots the given DOM node and saves it as a PDF — same technique already
// used for the occasion planner's "Download Plan" button.
async function downloadPlanPdf(el, name) {
  try {
    const h2c = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await h2c(el, { scale: 2, useCORS: true, backgroundColor: "#FFFFFF" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pW = pdf.internal.pageSize.getWidth();
    const pH = pdf.internal.pageSize.getHeight();
    const ratio = pW / canvas.width;
    const totalH = canvas.height * ratio;
    let yOff = 0;
    while (yOff < totalH) {
      if (yOff > 0) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, -yOff, pW, totalH);
      yOff += pH;
    }
    pdf.save(`${name.replace(/\s+/g, "-").toLowerCase()}-plan.pdf`);
  } catch { window.print(); }
}

const font = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const GOLD_LIGHT = "#CCAB4A";
const BG = "#F8F4EF";

const OCCASIONS = getOccasionNames();
const CITIES = ["Delhi", "Gurugram", "Noida", "Ghaziabad", "Faridabad", "Other NCR"];

// Venue is asked about as its own step rather than an item pick, so it still gets a
// simple guest-count multiplier on top of a representative catalog price.
const SIZE_MULTIPLIER = { "10-20": 0.85, "21-50": 1, "51-100": 1.15, "101-200": 1.35, "200+": 1.6 };

// Catering's own meal-format items (Veg/Non-Veg Catering, Plated Meal, etc.) are picked
// via the veg/meal-type question, not the extras checklist, so they're filtered out of it.
const CATERING_PRIMARY_NAMES = new Set(["Veg Catering", "Non-Veg Catering", "Full Meal Buffet", "Plated Meal", "High Tea", "Breakfast", "Brunch"]);

function itemKeyOf(simpleKey, rawCat, idx) {
  return `${simpleKey}::${rawCat}::${idx}`;
}

// Shown once, after every chosen category's questions — things we don't carry
// catalog pricing for, captured as notes for the Tendr team rather than priced.
const OTHER_EQUIPMENT_PRESETS = [
  "Extra chairs & tables", "Generator / power backup", "Tent / shamiana",
  "Cooling (coolers/AC)", "Heaters", "Security staff", "Parking arrangement",
  "Extra waitstaff", "Cleaning crew", "Signage / direction boards",
];

// The actual wizard. Reused by both the standalone /price-estimator page and
// PriceEstimatorModal (the centered popup opened from everywhere else in the app).
// Flow: tell us about the event -> venue -> what you need -> a quick level per thing
// you picked -> the price. No pre-ticked picks, no tips, no recommendations.
// `onFinalise(avgPrice, priced)`, when provided, shows an "apply this to your budget?"
// prompt on the results screen instead of just the generic Start Over / Book Vendors
// actions, and calls back with the overall average plus the full { rows, total, venue }
// breakdown. initialGuestCount (a raw number) and initialCategories (simple-category
// keys) seed the wizard when the caller already knows them — e.g. a screen where the
// customer already filled in guests and which services they need.
export function PriceEstimatorWizard({ initialOccasion, initialGuestCount, initialCategories, embedded = false, onFinalise }) {
  const { token } = useSelector((s) => s.auth);
  const { openAllBookingsChat } = useChatOverlay();
  const { closePriceEstimator } = usePriceEstimator();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [step, setStep] = useState(0); // 0 about, 1 venue, 2 categories, 3..3+n-1 per-category level, n+3 other equipment, final
  const [occasion, setOccasion] = useState(
    OCCASIONS.includes(initialOccasion) ? initialOccasion : OCCASIONS[0]
  );
  const [guestBucketKey, setGuestBucketKey] = useState(() => nearestGuestBucket(initialGuestCount));
  const [city, setCity] = useState(null);
  const [venueTypeKey, setVenueTypeKey] = useState(null);
  const [venueAlreadyBooked, setVenueAlreadyBooked] = useState(null); // null | true | false
  const [chosenCategories, setChosenCategories] = useState(() => {
    if (!initialCategories?.length) return [];
    const valid = new Set(getSimpleCategories(OCCASIONS.includes(initialOccasion) ? initialOccasion : OCCASIONS[0]).map((c) => c.key));
    return initialCategories.filter((k) => valid.has(k));
  });
  const [categoryChoice, setCategoryChoice] = useState({}); // catering only -> { mealType, isVeg }
  const [selectedItems, setSelectedItems] = useState({}); // "simpleKey::rawCat::idx" -> { qty }
  const [otherEquipment, setOtherEquipment] = useState([]); // preset labels ticked on the "anything else" step
  const [otherEquipmentCustom, setOtherEquipmentCustom] = useState(""); // free-text "something else"
  const [generating, setGenerating] = useState(false); // brief "making your estimate" animation before the reveal
  const [editingCategory, setEditingCategory] = useState(null); // category key being edited inline on the results screen
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "", place: "", date: "" });
  const [finaliseChoice, setFinaliseChoice] = useState(null); // null | "applied" | "declined"
  // Post-estimate flow: results -> packages -> optional venue photo -> downloadable plan
  const [postStage, setPostStage] = useState("idle"); // idle | packages | photo | done
  const [selectedPackageKey, setSelectedPackageKey] = useState(null);
  const [decorAnalyserOpen, setDecorAnalyserOpen] = useState(false);
  const [venueAnalysis, setVenueAnalysis] = useState(null);
  const [priceBenchmark, setPriceBenchmark] = useState(null); // real avg price customers paid, once loaded
  const [categoryPricing, setCategoryPricing] = useState({}); // simpleKey -> real category pricing, once loaded
  const didMountRef = useRef(false);
  const planRef = useRef(null);

  const simpleCategories = useMemo(() => getSimpleCategories(occasion), [occasion]);
  const allServices = useMemo(() => getServicesForOccasion(occasion), [occasion]);
  const guestBucket = GUEST_BUCKETS.find((g) => g.key === guestBucketKey) || null;
  const venueType = VENUE_TYPES.find((v) => v.key === venueTypeKey) || null;

  // Reset the whole wizard whenever the occasion changes after the first render —
  // fresh start, since the categories/items available can differ completely between
  // occasions. Skipped on mount so the initial seed values above actually stick.
  useEffect(() => {
    if (!didMountRef.current) { didMountRef.current = true; return; }
    setGuestBucketKey(null);
    setCity(null);
    setVenueTypeKey(null);
    setVenueAlreadyBooked(null);
    setChosenCategories([]);
    setCategoryChoice({});
    setSelectedItems({});
    setOtherEquipment([]);
    setOtherEquipmentCustom("");
    setGenerating(false);
    setEditingCategory(null);
    setFinaliseChoice(null);
    setPostStage("idle");
    setSelectedPackageKey(null);
    setVenueAnalysis(null);
    setStep(0);
  }, [occasion]);

  // Step map: 0 about, 1 venue, 2 categories, [3 .. 3+n-1] one step per chosen
  // category, OTHER_STEP "anything else", then totalSteps = the final reveal.
  const OTHER_STEP = 3 + chosenCategories.length;
  const totalSteps = OTHER_STEP + 1;
  const currentCategory = step >= 3 && step < OTHER_STEP ? chosenCategories[step - 3] : null;
  const currentCategoryDef = currentCategory ? simpleCategories.find((c) => c.key === currentCategory) : null;

  const toggleCategory = (key) => {
    setChosenCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const setCateringChoice = (patch) => setCategoryChoice((prev) => ({ ...prev, catering: { ...prev.catering, mealType: "buffet", isVeg: true, ...patch } }));

  const toggleSelectedItem = (simpleKey, rawCat, idx, defaultQty = 1) => {
    const k = itemKeyOf(simpleKey, rawCat, idx);
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[k]) delete next[k];
      else next[k] = { qty: defaultQty };
      return next;
    });
  };
  const setItemQty = (simpleKey, rawCat, idx, qty) => {
    const k = itemKeyOf(simpleKey, rawCat, idx);
    setSelectedItems((prev) => ({ ...prev, [k]: { qty: Math.max(1, qty) } }));
  };

  // ── Pricing — sums the real catalog items the customer actually ticked ───
  const priced = useMemo(() => {
    const rows = [];
    for (const key of chosenCategories) {
      const def = simpleCategories.find((c) => c.key === key);
      if (!def || !guestBucket) continue;

      if (key === "catering") {
        const choice = categoryChoice.catering;
        if (!choice?.mealType) continue;
        let min = 0, max = 0;
        const parts = [];
        const item = getCateringItem(occasion, choice.mealType, choice.isVeg !== false);
        if (item) {
          // No quality tier was asked for the main meal, so take the middle slice of
          // the item's own range rather than its full basic-to-premium span.
          const r = narrowRange(item.min, item.max, 0.5);
          min += r.min * guestBucket.guests; max += r.max * guestBucket.guests;
          const mealLabel = CATERING_MEAL_TYPES.find((m) => m.key === choice.mealType)?.label || "Buffet";
          parts.push(`${choice.isVeg !== false ? "Veg" : "Non-veg"} ${mealLabel.toLowerCase()}`);
        }
        let extraCount = 0;
        (allServices.Catering || []).forEach((it, idx) => {
          const sel = selectedItems[itemKeyOf("catering", "Catering", idx)];
          if (!sel) return;
          const t = lineTotal(it, { guestCount: guestBucket.guests, qty: sel.qty });
          min += t.min; max += t.max; extraCount++;
        });
        if (extraCount) parts.push(`+${extraCount} extra${extraCount === 1 ? "" : "s"}`);
        rows.push({ key, label: def.label, sub: `${parts.join(" · ")} · ${guestBucket.guests} guests`, min, max });
        continue;
      }

      let min = 0, max = 0;
      const pickedNames = [];
      def.raw.forEach((rawCat) => {
        (allServices[rawCat] || []).forEach((item, idx) => {
          const sel = selectedItems[itemKeyOf(key, rawCat, idx)];
          if (!sel) return;
          const t = lineTotal(item, { guestCount: guestBucket.guests, qty: sel.qty });
          min += t.min; max += t.max;
          pickedNames.push(item.service);
        });
      });
      if (!pickedNames.length) continue;
      rows.push({
        key, label: def.label,
        sub: pickedNames.length <= 2 ? pickedNames.join(", ") : `${pickedNames.slice(0, 2).join(", ")} +${pickedNames.length - 2} more`,
        min, max,
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
  }, [chosenCategories, categoryChoice, selectedItems, occasion, allServices, guestBucket, guestBucketKey, simpleCategories, venueType, venueAlreadyBooked]);

  // The headline range, nudged toward real prices once there's a benchmark to trust
  // (see blendWithBenchmark) — only the single total shown to the customer, never the
  // per-category rows/packages below, which stay purely catalog-driven.
  const displayTotal = useMemo(() => blendWithBenchmark(priced.total, priceBenchmark), [priced.total, priceBenchmark]);

  // 3 ready-made alternatives spanning the categories already chosen — only computed
  // once the customer asks for them, from buildPackageTiers() (see utils for why it
  // reuses tierBuckets instead of summing every item at a priority level).
  const packages = useMemo(() => {
    if (postStage === "idle" || !guestBucket) return [];
    return buildPackageTiers(occasion, chosenCategories, categoryChoice.catering, guestBucket.guests);
  }, [postStage, occasion, chosenCategories, categoryChoice.catering, guestBucket]);
  const selectedPackage = packages.find((p) => p.key === selectedPackageKey) || null;

  const isFinal = step === totalSteps;

  // Real average price Tendr customers paid for a similar completed event — fetched
  // only once the estimate is reached, shown as a supplementary data point alongside
  // the static catalog range above (never used to alter that range itself).
  useEffect(() => {
    if (!isFinal || !occasion) { setPriceBenchmark(null); return; }
    let cancelled = false;
    fetchPriceBenchmark(occasion, city).then((data) => { if (!cancelled) setPriceBenchmark(data); });
    return () => { cancelled = true; };
  }, [isFinal, occasion, city]);

  // Real listed + actually-paid prices per selected category (decor, catering, photo,
  // dj, cake, gifting) — same supplementary-only treatment as priceBenchmark above,
  // shown under each itemised row rather than altering it.
  useEffect(() => {
    if (!isFinal || !chosenCategories.length) { setCategoryPricing({}); return; }
    let cancelled = false;
    Promise.all(chosenCategories.map((key) => fetchCategoryPricing(key, city).then((data) => [key, data])))
      .then((pairs) => { if (!cancelled) setCategoryPricing(Object.fromEntries(pairs.filter(([, d]) => d))); });
    return () => { cancelled = true; };
  }, [isFinal, chosenCategories, city]);

  const stepLabel = isFinal ? "Your estimate" :
    step === 0 ? "Your event" : step === 1 ? "Venue" : step === 2 ? "What you need" :
    step === OTHER_STEP ? "Anything else?" : currentCategoryDef?.label;

  const goNext = () => setStep((s) => Math.min(s + 1, totalSteps));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));
  // Last input step (OTHER_STEP) — jump to the final slot but hold the reveal behind
  // a brief "making your estimate" animation instead of snapping straight to numbers.
  const finishWizard = () => {
    setStep(totalSteps);
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1300);
  };

  const canProceed =
    step === 0 ? !!guestBucketKey :
    step === 1 ? !!venueTypeKey && (!venueType?.needsVenue || venueAlreadyBooked !== null) :
    step === 2 ? chosenCategories.length > 0 :
    currentCategory === "catering" ? !!(categoryChoice.catering?.mealType) :
    currentCategory ? (currentCategoryDef?.raw || []).some((rawCat) => (allServices[rawCat] || []).some((_, idx) => selectedItems[itemKeyOf(currentCategory, rawCat, idx)])) :
    true;

  // Builds the message sent into the existing "My Order" chat flow when the customer
  // submits the booking-details form — same bucket every other booking surface in the
  // app feeds into (openAllBookingsChat), so this lands in the one chat thread they
  // already use instead of opening a new, separate channel.
  const buildEstimateMessage = () => {
    const lines = [`📊 *Price Estimate — ${occasion}*`, ""];
    lines.push(`👥 Guests: ${guestBucket?.label || "—"}`);
    if (city) lines.push(`📍 City: ${city}`);
    if (venueType) lines.push(`🏛 Venue: ${venueType.label}${priced.venue ? " — not yet booked" : ""}`);
    lines.push("", `*Estimated total: ${formatINR(displayTotal.min)} – ${formatINR(displayTotal.max)}*`);
    if (priced.rows.length) {
      lines.push("", "*What I'm looking for:*");
      priced.rows.forEach((r) => lines.push(`• ${r.label}: ${r.sub}`));
    }
    if (priced.venue) lines.push(`• Venue: ${formatINR(priced.venue.min)}–${formatINR(priced.venue.max)}`);
    const extras = [...otherEquipment.filter((o) => o !== "__other__"), ...(otherEquipmentCustom.trim() ? [otherEquipmentCustom.trim()] : [])];
    if (extras.length) lines.push("", "*Other equipment / requirements:*", ...extras.map((e) => `• ${e}`));
    lines.push("", "Can you help me plan this and connect me with the right vendors?");
    return lines.join("\n");
  };

  const bookingFormValid = bookingForm.name.trim() && bookingForm.place.trim() && bookingForm.date;
  // Matches the rest of the site's auth boundary — browsing/building the estimate stays
  // open, but sending it to a human (the chat) is gated, same as "Sign In to Book" on a
  // vendor card. An in-page AuthModal (not a navigate-away) so the filled-in form and
  // estimate aren't lost — submitBookingForm just re-runs once sign-in succeeds.
  const sendEstimateToChat = () => {
    const message = buildEstimateMessage();
    openAllBookingsChat(message, "price-estimate", {
      name: bookingForm.name.trim(), phone: bookingForm.phone.trim(),
      place: bookingForm.place.trim(), date: bookingForm.date, serviceType: "Price Estimate",
    });
    setBookingFormOpen(false);
    if (embedded) setTimeout(() => closePriceEstimator(), 400);
  };
  const submitBookingForm = () => {
    if (!bookingFormValid) return;
    if (!token) { setAuthModalOpen(true); return; }
    sendEstimateToChat();
  };

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
            <div style={{ marginTop: 6, paddingTop: 16, borderTop: "1px solid rgba(196,122,46,0.12)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Add extras (optional)</div>
              <ItemChecklist
                rows={(allServices.Catering || [])
                  .map((item, idx) => ({ rawCat: "Catering", idx, item }))
                  .filter((r) => !CATERING_PRIMARY_NAMES.has(r.item.service))}
                simpleKey="catering"
                selected={selectedItems}
                guestCount={guestBucket?.guests || 1}
                onToggle={(rawCat, idx) => toggleSelectedItem("catering", rawCat, idx, 1)}
                onSetQty={(rawCat, idx, qty) => setItemQty("catering", rawCat, idx, qty)}
                showPrices={false}
              />
            </div>
          </StepCard>
        )}

        {currentCategory && currentCategory !== "catering" && (
          <StepCard title={currentCategoryDef?.label} subtitle="Tick what you want.">
            <ItemChecklist
              rows={(currentCategoryDef?.raw || []).flatMap((rawCat) => (allServices[rawCat] || []).map((item, idx) => ({ rawCat, idx, item })))}
              simpleKey={currentCategory}
              selected={selectedItems}
              guestCount={guestBucket?.guests || 1}
              onToggle={(rawCat, idx) => toggleSelectedItem(currentCategory, rawCat, idx, currentCategory === "gifting" ? (guestBucket?.guests || 1) : 1)}
              onSetQty={(rawCat, idx, qty) => setItemQty(currentCategory, rawCat, idx, qty)}
              showPrices={false}
            />
          </StepCard>
        )}

        {step === OTHER_STEP && (
          <StepCard title="Anything else you'll need?" subtitle="Equipment and extras we don't have catalog pricing for — tell us and we'll quote it directly.">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {OTHER_EQUIPMENT_PRESETS.map((opt) => (
                <Checkbox key={opt} checked={otherEquipment.includes(opt)}
                  onClick={() => setOtherEquipment((p) => p.includes(opt) ? p.filter((x) => x !== opt) : [...p, opt])}
                  label={opt} />
              ))}
              <Checkbox checked={otherEquipment.includes("__other__")}
                onClick={() => setOtherEquipment((p) => p.includes("__other__") ? p.filter((x) => x !== "__other__") : [...p, "__other__"])}
                label="Something else" />
            </div>
            {otherEquipment.includes("__other__") && (
              <div style={{ marginTop: 14 }}>
                <Field label="Tell us what you need">
                  <textarea value={otherEquipmentCustom} onChange={(e) => setOtherEquipmentCustom(e.target.value)}
                    rows={3} placeholder="e.g. a stage with backdrop, a specific lighting setup…"
                    style={{ ...selectStyle, resize: "vertical", fontWeight: 500, fontSize: 13.5 }} />
                </Field>
              </div>
            )}
          </StepCard>
        )}

        {isFinal && generating && (
          <div style={{ background: "#fff", borderRadius: 16, padding: "48px 24px", textAlign: "center", border: "1.5px solid rgba(196,122,46,0.12)" }}>
            <div style={{ width: 48, height: 48, margin: "0 auto 18px", borderRadius: "50%", border: "3px solid rgba(196,122,46,0.15)", borderTopColor: GOLD, animation: "pe-spin 0.8s linear infinite" }} />
            <style>{`@keyframes pe-spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#2C1A0E" }}>Making your price estimate…</div>
            <div style={{ fontSize: 12.5, color: "#8a6a4a", marginTop: 6 }}>Crunching real Delhi NCR pricing for what you picked.</div>
          </div>
        )}

        {isFinal && !generating && (
          <>
            <div style={{ background: "#fff", border: `2px solid ${GOLD}`, borderRadius: 16, padding: "20px", textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#8a6a4a", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Your event cost estimate</div>
              <div style={{ fontSize: "clamp(26px,6vw,34px)", fontWeight: 900, color: "#2C1A0E" }}>
                {formatINR(displayTotal.min)} – {formatINR(displayTotal.max)}
              </div>
              <div style={{ fontSize: 12, color: "#8a6a4a", marginTop: 6 }}>
                {guestBucket?.label}{occasion ? ` · ${occasion}` : ""}{city ? ` · ${city}` : ""}
              </div>
              {priceBenchmark && (
                <div style={{ fontSize: 12, color: "#15803d", marginTop: 10, fontWeight: 600 }}>
                  {displayTotal.adjusted
                    ? `Adjusted using real pricing from ${displayTotal.sampleSize} similar Tendr ${displayTotal.sampleSize === 1 ? "event" : "events"} — customers paid around ${formatINR(priceBenchmark.avgPrice)} on average`
                    : `Tendr customers who booked a similar ${occasion} paid around ${formatINR(priceBenchmark.avgPrice)} on average`}
                </div>
              )}
            </div>

            {onFinalise && (
              <div style={{ background: finaliseChoice === "applied" ? "rgba(34,197,94,0.08)" : "#fff", border: `1.5px solid ${finaliseChoice === "applied" ? "rgba(34,197,94,0.35)" : "rgba(196,122,46,0.25)"}`, borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
                {finaliseChoice === "applied" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, fontWeight: 700, color: "#15803d" }}>
                    <span>✓</span> Applied {formatINR(Math.round((displayTotal.min + displayTotal.max) / 2))} to your budget
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#2C1A0E", marginBottom: 2 }}>Finalise this estimate?</div>
                    <div style={{ fontSize: 12, color: "#8a6a4a", marginBottom: 12, lineHeight: 1.5 }}>
                      We'll set your budget to {formatINR(Math.round((displayTotal.min + displayTotal.max) / 2))} — the middle of this range.
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { setFinaliseChoice("applied"); onFinalise(Math.round((displayTotal.min + displayTotal.max) / 2), priced); }}
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

            {chosenCategories.length > 0 && (
              <StepCard title="Itemised breakdown" subtitle="Tap Edit on any category to add, remove or adjust what's priced — the total updates as you go.">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {chosenCategories.map((simpleKey) => {
                    const def = simpleCategories.find((c) => c.key === simpleKey);
                    const r = priced.rows.find((row) => row.key === simpleKey) ||
                      { label: def?.label || simpleKey, sub: "Nothing picked yet", min: 0, max: 0 };
                    const real = categoryPricing[simpleKey];
                    const isEditing = editingCategory === simpleKey;
                    return (
                      <div key={simpleKey} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#2C1A0E" }}>{r.label}</div>
                            <div style={{ fontSize: 11.5, color: "#8a6a4a", marginTop: 1 }}>{r.sub}</div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                            {(r.min > 0 || r.max > 0) && <span style={{ color: GOLD, fontWeight: 700, fontSize: 13.5, whiteSpace: "nowrap" }}>{formatINR(r.min)}–{formatINR(r.max)}</span>}
                            <button onClick={() => setEditingCategory(isEditing ? null : simpleKey)}
                              style={{ fontSize: 11, fontWeight: 700, color: GOLD, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                              {isEditing ? "Done" : "Edit"}
                            </button>
                          </div>
                        </div>
                        {real && (
                          <div style={{ fontSize: 11, color: "#15803d", fontWeight: 600 }}>
                            Real vendor pricing: {formatINR(real.headline.min)}–{formatINR(real.headline.max)} ({real.headline.count} {real.actual ? "closed deals" : "vendors"})
                          </div>
                        )}
                        {isEditing && simpleKey === "catering" && (
                          <div style={{ marginTop: 10, paddingTop: 12, borderTop: "1px dashed rgba(196,122,46,0.2)" }}>
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
                            <ItemChecklist
                              rows={(allServices.Catering || [])
                                .map((item, idx) => ({ rawCat: "Catering", idx, item }))
                                .filter((row) => !CATERING_PRIMARY_NAMES.has(row.item.service))}
                              simpleKey="catering"
                              selected={selectedItems}
                              guestCount={guestBucket?.guests || 1}
                              onToggle={(rawCat, idx) => toggleSelectedItem("catering", rawCat, idx, 1)}
                              onSetQty={(rawCat, idx, qty) => setItemQty("catering", rawCat, idx, qty)}
                            />
                          </div>
                        )}
                        {isEditing && simpleKey !== "catering" && (
                          <div style={{ marginTop: 10, paddingTop: 12, borderTop: "1px dashed rgba(196,122,46,0.2)" }}>
                            <ItemChecklist
                              rows={(def?.raw || []).flatMap((rawCat) => (allServices[rawCat] || []).map((item, idx) => ({ rawCat, idx, item })))}
                              simpleKey={simpleKey}
                              selected={selectedItems}
                              guestCount={guestBucket?.guests || 1}
                              onToggle={(rawCat, idx) => toggleSelectedItem(simpleKey, rawCat, idx, simpleKey === "gifting" ? (guestBucket?.guests || 1) : 1)}
                              onSetQty={(rawCat, idx, qty) => setItemQty(simpleKey, rawCat, idx, qty)}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {simpleCategories.some((c) => !chosenCategories.includes(c.key)) && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(196,122,46,0.1)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Add another category</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {simpleCategories.filter((c) => !chosenCategories.includes(c.key)).map((c) => (
                        <button key={c.key} onClick={() => { toggleCategory(c.key); setEditingCategory(c.key); }}
                          style={{ padding: "8px 14px", borderRadius: 100, border: "1.5px dashed rgba(196,122,46,0.35)", background: "#fff", color: GOLD, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                          + {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                <li style={{ fontSize: 12, color: "#5A3520", lineHeight: 1.5 }}>Only priced for the specific things you ticked in each category — anything you didn't select isn't included.</li>
                {chosenCategories.includes("gifting") && (
                  <li style={{ fontSize: 12, color: "#5A3520", lineHeight: 1.5 }}>Return gift quantities default to one per guest — adjust them if that's not right for you.</li>
                )}
                <li style={{ fontSize: 12, color: "#5A3520", lineHeight: 1.5 }}>GST, transport, setup/teardown and vendor minimum order values aren't included — budget an extra 10–15%.</li>
                {priced.venue && (
                  <li style={{ fontSize: 12, color: "#5A3520", lineHeight: 1.5 }}>Venue security deposit and cleaning fees, if any, aren't included in the venue estimate.</li>
                )}
                <li style={{ fontSize: 12, color: "#5A3520", lineHeight: 1.5 }}>This is an estimate, not a final vendor quote.</li>
              </ul>
            </StepCard>

            {postStage === "idle" && (
              <div style={{ background: "linear-gradient(135deg,#2C1A0E,#4A2810)", borderRadius: 16, padding: "18px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#F5E6CC", marginBottom: 4 }}>Want a ready-made package instead?</div>
                <div style={{ fontSize: 12, color: "rgba(245,230,204,0.6)", marginBottom: 12, lineHeight: 1.5 }}>
                  See your budget split 3 ways across what you picked, choose one, and get a downloadable plan.
                </div>
                <button onClick={() => setPostStage("packages")}
                  style={{ padding: "11px 22px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD})`, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
                  Get splits &amp; packages →
                </button>
              </div>
            )}

            {postStage === "packages" && (
              <StepCard title="Pick a package" subtitle="Each one is a real option built from your selected categories — a single representative item per category, so nothing's double-counted.">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {packages.map((p) => {
                    const mid = (p.total.min + p.total.max) / 2;
                    return (
                      <div key={p.key} style={{ border: `1.5px solid rgba(196,122,46,0.2)`, borderRadius: 14, padding: "14px 16px", background: "#FAF7F2" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: "#2C1A0E" }}>{p.label}</span>
                          <span style={{ fontSize: 14, fontWeight: 900, color: GOLD }}>{formatINR(p.total.min)}–{formatINR(p.total.max)}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                          {p.rows.map((r) => {
                            const pct = mid > 0 ? Math.round(((r.min + r.max) / 2 / mid) * 100) : 0;
                            return (
                              <div key={r.key}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: 2 }}>
                                  <span style={{ color: "#5A3520", fontWeight: 600 }}>{r.label} <span style={{ color: "#aaa" }}>({pct}%)</span></span>
                                  <span style={{ color: "#8a6a4a" }}>{formatINR(r.min)}–{formatINR(r.max)}</span>
                                </div>
                                <div style={{ height: 4, borderRadius: 2, background: "rgba(196,122,46,0.12)" }}>
                                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: GOLD }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <button onClick={() => { setSelectedPackageKey(p.key); setPostStage("photo"); }}
                          style={{ width: "100%", padding: "9px", borderRadius: 9, border: "none", background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: font }}>
                          Choose {p.label} →
                        </button>
                      </div>
                    );
                  })}
                </div>
              </StepCard>
            )}

            {postStage === "photo" && selectedPackage && (
              <StepCard title="One more thing" subtitle="Optional — upload a photo of your venue for a free decor read before you download your plan.">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, padding: "10px 12px", borderRadius: 10, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <span style={{ fontSize: 16 }}>✓</span>
                  <span style={{ fontSize: 12.5, color: "#15803d", fontWeight: 600 }}>{selectedPackage.label} package selected — {formatINR(selectedPackage.total.min)}–{formatINR(selectedPackage.total.max)}</span>
                </div>
                <button onClick={() => setDecorAnalyserOpen(true)}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 14px", borderRadius: 11, border: `1.5px solid ${venueAnalysis ? "rgba(34,197,94,0.35)" : "rgba(196,122,46,0.25)"}`, background: venueAnalysis ? "rgba(34,197,94,0.05)" : "rgba(196,122,46,0.04)", cursor: "pointer", fontFamily: font, textAlign: "left", marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{venueAnalysis ? "✅" : "📷"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "#2C1A0E" }}>{venueAnalysis ? "Venue analysed — tap to re-analyse" : "Upload a photo of your venue"}</div>
                    <div style={{ fontSize: 10.5, color: "#8a6a4a", marginTop: 1 }}>{venueAnalysis ? venueAnalysis.spaceType : "Get decor zone ideas for your actual space"}</div>
                  </div>
                </button>
                <button onClick={() => setPostStage("done")}
                  style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: font }}>
                  {venueAnalysis ? "Continue to plan →" : "Skip — continue to plan →"}
                </button>
              </StepCard>
            )}

            {postStage === "done" && selectedPackage && (
              <>
                <div ref={planRef} style={{ background: "#fff", borderRadius: 16, padding: 20, marginBottom: 14, border: "1.5px solid rgba(196,122,46,0.15)" }}>
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your Plan</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "#2C1A0E", marginTop: 4 }}>{occasion} · {guestBucket?.label}{city ? ` · ${city}` : ""}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: GOLD, marginTop: 8 }}>{formatINR(selectedPackage.total.min)}–{formatINR(selectedPackage.total.max)}</div>
                    <div style={{ fontSize: 11, color: "#8a6a4a", marginTop: 2 }}>{selectedPackage.label} package</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: venueAnalysis ? 16 : 0 }}>
                    {selectedPackage.rows.map((r) => (
                      <div key={r.key} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(196,122,46,0.1)", paddingBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#2C1A0E" }}>{r.label}</div>
                          <div style={{ fontSize: 11, color: "#8a6a4a" }}>{r.items.join(", ")}</div>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: GOLD, whiteSpace: "nowrap" }}>{formatINR(r.min)}–{formatINR(r.max)}</span>
                      </div>
                    ))}
                  </div>
                  {venueAnalysis && (
                    <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(196,122,46,0.05)" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, textTransform: "uppercase", marginBottom: 4 }}>Venue read</div>
                      <div style={{ fontSize: 12, color: "#5A3520", lineHeight: 1.5 }}>{venueAnalysis.spaceType} — {venueAnalysis.styleNote || venueAnalysis.spaceSummary}</div>
                    </div>
                  )}
                </div>
                <button onClick={() => downloadPlanPdf(planRef.current, occasion)}
                  style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`, color: "#fff", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: font, boxShadow: "0 4px 16px rgba(196,122,46,0.35)" }}>
                  ⬇ Download Plan (PDF)
                </button>
              </>
            )}
          </>
        )}
      </div>

      {decorAnalyserOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10050, background: "rgba(28,9,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={(e) => { if (e.target === e.currentTarget) setDecorAnalyserOpen(false); }}>
          <div style={{ width: "100%", maxWidth: 640, background: "#FFFCF5", borderRadius: "20px 20px 0 0", padding: "20px 18px 32px", maxHeight: "93dvh", overflowY: "auto", fontFamily: font }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "0.12em" }}>AI Tool</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1C0900", marginTop: 2 }}>Venue Decor Analyser</div>
              </div>
              <button onClick={() => setDecorAnalyserOpen(false)}
                style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", cursor: "pointer", fontSize: 16, color: "#9B7450", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font }}>×</button>
            </div>
            <DecorAnalyzer onClose={() => setDecorAnalyserOpen(false)} initialEventType={occasion || ""} compact
              onAnalysisComplete={(a) => { setVenueAnalysis(a); setDecorAnalyserOpen(false); }} />
          </div>
        </div>
      )}

      {bookingFormOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10060, background: "rgba(28,9,0,0.65)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={(e) => { if (e.target === e.currentTarget) setBookingFormOpen(false); }}>
          <div style={{ width: "100%", maxWidth: 480, background: "#FFFCF5", borderRadius: "20px 20px 0 0", padding: "20px 18px 28px", maxHeight: "90dvh", overflowY: "auto", fontFamily: font }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1C0900" }}>A few details to get started</div>
                <div style={{ fontSize: 12, color: "#8a6a4a", marginTop: 2 }}>We'll send your estimate to the Tendr team to find the right vendors.</div>
              </div>
              <button onClick={() => setBookingFormOpen(false)}
                style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(196,122,46,0.25)", background: "#fff", cursor: "pointer", fontSize: 16, color: "#9B7450", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font, flexShrink: 0, marginLeft: 10 }}>×</button>
            </div>
            <Field label="Your name">
              <input value={bookingForm.name} onChange={(e) => setBookingForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Priya Sharma" style={selectStyle} />
            </Field>
            <Field label="Phone number">
              <input value={bookingForm.phone} onChange={(e) => setBookingForm((f) => ({ ...f, phone: e.target.value }))} placeholder="10-digit mobile" type="tel" style={selectStyle} />
            </Field>
            <Field label="Event location">
              <input value={bookingForm.place} onChange={(e) => setBookingForm((f) => ({ ...f, place: e.target.value }))} placeholder="Area / city" style={selectStyle} />
            </Field>
            <Field label="Event date">
              <input value={bookingForm.date} onChange={(e) => setBookingForm((f) => ({ ...f, date: e.target.value }))} type="date" style={selectStyle} />
            </Field>
            <button onClick={submitBookingForm} disabled={!bookingFormValid}
              style={{ ...primaryBtnStyle, width: "100%", marginTop: 6, opacity: bookingFormValid ? 1 : 0.45, cursor: bookingFormValid ? "pointer" : "not-allowed" }}>
              {token ? "Send to Tendr Team →" : "Sign In to Send →"}
            </button>
          </div>
        </div>
      )}

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => { setAuthModalOpen(false); sendEstimateToChat(); }}
      />

      <div style={{ position: embedded ? "sticky" : "fixed", left: 0, right: 0, bottom: 0, zIndex: 500, background: "#fff", borderTop: "1.5px solid rgba(196,122,46,0.18)", boxShadow: "0 -6px 24px rgba(28,9,0,0.08)", padding: "14px 16px calc(14px + env(safe-area-inset-bottom, 0px))" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          {!isFinal ? (
            <>
              <button onClick={goBack} disabled={step === 0} style={{ ...navBtnStyle, visibility: step === 0 ? "hidden" : "visible" }}>← Back</button>
              <button onClick={step === totalSteps - 1 ? finishWizard : goNext} disabled={!canProceed} style={{ ...primaryBtnStyle, opacity: canProceed ? 1 : 0.45, cursor: canProceed ? "pointer" : "not-allowed" }}>
                {step === totalSteps - 1 ? "See my estimate →" : "Next →"}
              </button>
            </>
          ) : generating ? (
            <div style={{ height: 1 }} />
          ) : (
            <>
              <button onClick={() => { setPostStage("idle"); setSelectedPackageKey(null); setStep(2); }} style={navBtnStyle}>← Edit requirements</button>
              <button onClick={() => { setBookingForm((f) => ({ ...f, place: f.place || city || "" })); setBookingFormOpen(true); }} style={primaryBtnStyle}>
                Book vendors for this →
              </button>
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

// The actual "what do you want in this category" question: every real catalog row
// for the category, as a plain tick list — no tiers, no pre-ticked picks.
function ItemChecklist({ rows, simpleKey, selected, guestCount, onToggle, onSetQty, showPrices = true }) {
  if (!rows.length) return <div style={{ fontSize: 13, color: "#8a6a4a" }}>No pricing data for this category yet.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {rows.map(({ rawCat, idx, item }) => {
        const k = itemKeyOf(simpleKey, rawCat, idx);
        const sel = selected[k];
        const checked = !!sel;
        const perGuest = isPerGuest(item.basis);
        const t = lineTotal(item, { guestCount, qty: sel?.qty ?? 1 });
        return (
          <div key={k} onClick={() => onToggle(rawCat, idx)}
            style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "#fff", borderRadius: 12, padding: "12px 14px", border: `1.5px solid ${checked ? GOLD : "rgba(196,122,46,0.14)"}`, cursor: "pointer" }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1, border: `2px solid ${checked ? GOLD : "rgba(196,122,46,0.35)"}`, background: checked ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {checked && <span style={{ color: "#fff", fontSize: 12, fontWeight: 900 }}>✓</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E" }}>{item.service}</span>
                {item.spec && <span style={{ fontSize: 10.5, fontWeight: 700, color: "#8a6a4a", background: "rgba(196,122,46,0.1)", padding: "2px 8px", borderRadius: 100 }}>{item.spec}</span>}
              </div>
              {item.includes && <div style={{ fontSize: 12, color: "#8a6a4a", marginTop: 3, lineHeight: 1.4 }}>Includes: {item.includes}</div>}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                {showPrices && <span style={{ fontSize: 13.5, fontWeight: 800, color: GOLD }}>{formatINR(item.min)}–{formatINR(item.max)}</span>}
                {showPrices && perGuest && <span style={{ fontSize: 11, color: "#aaa" }}>per guest</span>}
                {checked && perGuest && showPrices && (
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2C1A0E" }}>× {guestCount} guests = {formatINR(t.min)}–{formatINR(t.max)}</span>
                )}
                {checked && !perGuest && (
                  <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "#aaa" }}>qty</span>
                    <button onClick={() => onSetQty(rawCat, idx, (sel.qty ?? 1) - 1)} style={qtyBtnStyle}>−</button>
                    <span style={{ fontSize: 12.5, fontWeight: 700, minWidth: 18, textAlign: "center" }}>{sel.qty ?? 1}</span>
                    <button onClick={() => onSetQty(rawCat, idx, (sel.qty ?? 1) + 1)} style={qtyBtnStyle}>+</button>
                    {showPrices && <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2C1A0E" }}>= {formatINR(t.min)}–{formatINR(t.max)}</span>}
                  </div>
                )}
              </div>
            </div>
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

const qtyBtnStyle = {
  width: 22, height: 22, borderRadius: 6, border: "1.5px solid rgba(196,122,46,0.3)",
  background: "rgba(196,122,46,0.06)", color: GOLD, fontWeight: 800, fontSize: 13,
  cursor: "pointer", fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center",
  padding: 0, lineHeight: 1,
};
