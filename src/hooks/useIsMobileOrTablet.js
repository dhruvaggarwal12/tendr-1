import { useState, useEffect } from "react";

// Touch-capable (no hover, coarse pointer) AND a width cap generous enough to
// include iPad Pro 12.9" landscape (1366px) — distinguishes phones/tablets
// from desktop/laptop windows regardless of width, unlike a plain max-width
// check (which would misclassify a narrow desktop window as mobile).
const QUERY = "(hover: none) and (pointer: coarse) and (max-width: 1366px)";

export default function useIsMobileOrTablet() {
  const [match, setMatch] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    try { return window.matchMedia(QUERY).matches; } catch { return false; }
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    let mql;
    try { mql = window.matchMedia(QUERY); } catch { return; }
    const onChange = () => setMatch(mql.matches);
    onChange();
    mql.addEventListener ? mql.addEventListener("change", onChange) : mql.addListener(onChange);
    return () => {
      mql.removeEventListener ? mql.removeEventListener("change", onChange) : mql.removeListener(onChange);
    };
  }, []);

  return match;
}
