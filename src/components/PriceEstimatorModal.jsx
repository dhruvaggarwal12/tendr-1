import { usePriceEstimator } from "../context/PriceEstimatorContext";
import { PriceEstimatorWizard } from "../pages/budget/PriceEstimator";

export default function PriceEstimatorModal() {
  const { open, occasion, onFinalise, closePriceEstimator } = usePriceEstimator();

  if (!open) return null;

  const handleFinalise = onFinalise
    ? (avgPrice) => { onFinalise(avgPrice); setTimeout(() => closePriceEstimator(), 900); }
    : null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(20,10,4,0.65)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) closePriceEstimator(); }}
    >
      <div style={{ width: "100%", maxWidth: 560, maxHeight: "92dvh", overflow: "hidden auto", borderRadius: 20, boxShadow: "0 32px 80px rgba(28,9,0,0.4)", position: "relative" }}>
        <button
          onClick={closePriceEstimator}
          aria-label="Close"
          style={{ position: "absolute", top: 14, right: 14, width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.4)", background: "rgba(0,0,0,0.2)", cursor: "pointer", fontSize: 16, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
        >×</button>
        <PriceEstimatorWizard initialOccasion={occasion} embedded onFinalise={handleFinalise} />
      </div>
    </div>
  );
}
