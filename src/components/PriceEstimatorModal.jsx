import { usePriceEstimator } from "../context/PriceEstimatorContext";
import { PriceEstimatorWizard } from "../pages/budget/PriceEstimator";

export default function PriceEstimatorModal() {
  const { open, occasion, guestCount, categories, onFinalise, closePriceEstimator } = usePriceEstimator();

  if (!open) return null;

  const handleFinalise = onFinalise
    ? (avgPrice, priced) => { onFinalise(avgPrice, priced); setTimeout(() => closePriceEstimator(), 900); }
    : null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: "radial-gradient(ellipse 70% 60% at 50% 20%, rgba(196,122,46,0.18) 0%, rgba(20,10,4,0.72) 55%, rgba(20,10,4,0.82) 100%)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) closePriceEstimator(); }}
    >
      <div style={{ width: "100%", maxWidth: 560, maxHeight: "92dvh", overflow: "hidden auto", borderRadius: 20, boxShadow: "0 32px 80px rgba(28,9,0,0.45), 0 0 0 1.5px rgba(196,122,46,0.25)", position: "relative" }}>
        <button
          onClick={closePriceEstimator}
          aria-label="Close"
          style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(0,0,0,0.2)", cursor: "pointer", fontSize: 16, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
        >×</button>
        <PriceEstimatorWizard initialOccasion={occasion} initialGuestCount={guestCount} initialCategories={categories} embedded onFinalise={handleFinalise} />
      </div>
    </div>
  );
}
