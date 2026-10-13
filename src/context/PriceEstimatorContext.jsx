import { createContext, useContext, useState, useCallback } from "react";

const PriceEstimatorContext = createContext(null);

export function PriceEstimatorProvider({ children }) {
  const [state, setState] = useState({ open: false, occasion: null, guestCount: null, categories: null, onFinalise: null });

  // onFinalise(avgPrice, priced), when passed, makes the results screen ask "apply this
  // to your budget?" and calls it back with the overall average plus the full
  // { rows, total, venue } breakdown if the user says yes. guestCount (a raw number) and
  // categories (simple-category keys) pre-fill the wizard when the caller already knows
  // them, so the customer isn't asked to re-enter requirements it already has.
  const openPriceEstimator = useCallback(({ occasion = null, guestCount = null, categories = null, onFinalise = null } = {}) => {
    setState({ open: true, occasion, guestCount, categories, onFinalise });
  }, []);
  const closePriceEstimator = useCallback(() => {
    setState((s) => ({ ...s, open: false }));
  }, []);

  return (
    <PriceEstimatorContext.Provider value={{ ...state, openPriceEstimator, closePriceEstimator }}>
      {children}
    </PriceEstimatorContext.Provider>
  );
}

export function usePriceEstimator() {
  const ctx = useContext(PriceEstimatorContext);
  if (!ctx) throw new Error("usePriceEstimator must be used within a PriceEstimatorProvider");
  return ctx;
}
