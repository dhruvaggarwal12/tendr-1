import { createContext, useContext, useState, useCallback } from "react";

const TourContext = createContext(null);

export function TourProvider({ children }) {
  const [tourActive, setTourActive] = useState(false);
  const startTour = useCallback(() => setTourActive(true), []);
  const endTour = useCallback(() => setTourActive(false), []);
  return (
    <TourContext.Provider value={{ tourActive, startTour, endTour }}>
      {children}
    </TourContext.Provider>
  );
}

export const useTour = () => useContext(TourContext);
