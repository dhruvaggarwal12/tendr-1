import React, { useEffect, useRef, useState } from "react";

const NATIVE_WIDTH = 460; // InvitationFlyerEngine's fixed design-canvas width

// Wraps the flyer engine (a fixed-460px-wide design canvas — see
// InvitationFlyerEngine.jsx) so it scales down to fit narrower viewports
// instead of overflowing them. The engine itself stays untouched (same
// pixel-perfect layout every template was designed at); this measures the
// engine's natural rendered size and applies a CSS scale-to-fit, keeping
// the wrapper's own layout box sized to match so it doesn't leave dead
// space or get clipped by a parent's overflow:hidden.
export default function ResponsiveFlyerStage({ children }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [naturalHeight, setNaturalHeight] = useState(660);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const measure = () => {
      const availableWidth = outer.offsetWidth;
      const contentHeight = inner.offsetHeight;
      setScale(Math.min(1, availableWidth / NATIVE_WIDTH));
      setNaturalHeight(contentHeight);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [children]);

  return (
    <div ref={outerRef} style={{ width: "100%", maxWidth: NATIVE_WIDTH, margin: "0 auto" }}>
      <div style={{ width: "100%", height: naturalHeight * scale, overflow: "hidden" }}>
        <div ref={innerRef} style={{ width: NATIVE_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
