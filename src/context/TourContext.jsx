import { createContext, useContext, useState, useCallback } from "react";
import { resetAllPageTours } from "../components/PageTour";

const TourContext = createContext({ tourActive: false, startTour: () => {}, endTour: () => {}, resetAllTours: () => {} });

export function TourProvider({ children }) {
  const [tourActive, setTourActive] = useState(false);
  const startTour = useCallback(() => setTourActive(true), []);
  const endTour = useCallback(() => setTourActive(false), []);
  const resetAllTours = useCallback(() => resetAllPageTours(), []);
  return (
    <TourContext.Provider value={{ tourActive, startTour, endTour, resetAllTours }}>
      {children}
    </TourContext.Provider>
  );
}

export const useTour = () => useContext(TourContext);
