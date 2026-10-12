import { createContext, useContext, useState, useCallback } from "react";

const PriceEstimatorContext = createContext(null);

export function PriceEstimatorProvider({ children }) {
  const [state, setState] = useState({ open: false, occasion: null, onFinalise: null });

  // onFinalise(avgPrice), when passed, makes the results screen ask "apply this to
  // your budget?" and calls it back with a single ₹ number if the user says yes.
  const openPriceEstimator = useCallback(({ occasion = null, onFinalise = null } = {}) => {
    setState({ open: true, occasion, onFinalise });
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
