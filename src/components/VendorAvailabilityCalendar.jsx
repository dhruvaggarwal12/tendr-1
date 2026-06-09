import React, { useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const font = "'Outfit', sans-serif";
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const SLOT_LABELS = { slot1: "Morning (10AM–2PM)", slot2: "Evening (4PM–9PM)" };

export async function fetchVendorAvailability(vendorId, month, token) {
  try {
    const res = await fetch(`${BASE_URL}/vendors/${vendorId}/availability?month=${month}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    });
    if (!res.ok) return {};
    const d = await res.json();
    return d?.availability || {};
  } catch { return {}; }
}

export async function saveVendorSlot(vendorId, date, slot, available, token) {
  try {
    await fetch(`${BASE_URL}/vendors/${vendorId}/availability`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      credentials: "include",
      body: JSON.stringify({ date, slot, available }),
    });
  } catch {}
}

export default function VendorAvailabilityCalendar({ vendorId, isVendorView = false, token }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [tooltip, setTooltip] = useState(null); // { dateStr, slot, x, y }

  const monthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
  const todayStr = today.toISOString().split("T")[0];

  useEffect(() => {
    if (!vendorId) return;
    setLoading(true);
    fetchVendorAvailability(vendorId, monthKey, token)
      .then(av => setAvailability(prev => ({ ...prev, ...av })))
      .finally(() => setLoading(false));
  }, [vendorId, monthKey]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isPast = (ds) => ds < todayStr;

  const getSlot = (ds, slot) => {
    if (isPast(ds)) return "past";
    const day = availability[ds];
    if (!day) return "available";
    return day[slot] !== false ? "available" : "booked";
  };

  const toggleSlot = async (ds, slot, e) => {
    if (!isVendorView || isPast(ds)) return;
    const current = availability[ds]?.[slot] ?? true;
    const newVal  = !current;
    setAvailability(prev => ({
      ...prev,
      [ds]: { slot1: true, slot2: true, ...(prev[ds] || {}), [slot]: newVal },
    }));
    setSaving(true);
    await saveVendorSlot(vendorId, ds, slot, newVal, token);
    setSaving(false);
  };

  // Build grid
  const daysInMonth   = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekDay  = new Date(viewYear, viewMonth, 1).getDay();
  const cells = [
    ...Array(firstWeekDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      const ds = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      return { d, ds };
    }),
  ];

  const slotColor = (status) =>
    status === "available" ? "#22c55e" : status === "booked" ? "#ef4444" : "#d1d5db";

  return (
    <div style={{ fontFamily: font, position: "relative" }} onClick={() => setTooltip(null)}>
      {/* Month navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button
          onClick={prevMonth}
          style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid rgba(0,0,0,0.1)", background: "#fff", cursor: "pointer", fontSize: 15, lineHeight: 1 }}
        >‹</button>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#2C1A0E" }}>
          {MONTH_NAMES[viewMonth]} {viewYear}
          {loading && <span style={{ fontSize: 10, color: "#C47A2E", marginLeft: 8 }}>loading…</span>}
        </span>
        <button
          onClick={nextMonth}
          style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid rgba(0,0,0,0.1)", background: "#fff", cursor: "pointer", fontSize: 15, lineHeight: 1 }}
        >›</button>
      </div>

      {/* Slot label header */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: 8, fontSize: 10, color: "#9B7450", fontWeight: 600 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#C47A2E", display: "inline-block" }} /> AM
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2C1A0E", display: "inline-block" }} /> PM
        </span>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 4 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#9B7450" }}>{d}</div>
        ))}
      </div>

      {/* Calendar cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {cells.map((cell, idx) => {
          if (!cell) return <div key={`e${idx}`} />;
          const { d, ds } = cell;
          const s1 = getSlot(ds, "slot1");
          const s2 = getSlot(ds, "slot2");
          const isToday = ds === todayStr;
          const past    = isPast(ds);
          const bothFree = s1 === "available" && s2 === "available";
          const noneFree = s1 === "booked"    && s2 === "booked";

          return (
            <div
              key={ds}
              style={{
                borderRadius: 7,
                padding: "5px 2px 4px",
                background: isToday ? "rgba(196,122,46,0.06)" : "#fff",
                border: isToday ? "1.5px solid rgba(196,122,46,0.35)" : "1.5px solid rgba(0,0,0,0.07)",
                opacity: past ? 0.35 : 1,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: isToday ? 800 : 500, color: "#2C1A0E", marginBottom: 3 }}>{d}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 2 }}>
                {[["slot1", s1, "#C47A2E"], ["slot2", s2, "#2C1A0E"]].map(([slotKey, status, _ring]) => (
                  <div
                    key={slotKey}
                    title={SLOT_LABELS[slotKey] + " — " + (status === "available" ? "Available" : status === "booked" ? "Booked" : "Past")}
                    onClick={(e) => { e.stopPropagation(); toggleSlot(ds, slotKey, e); }}
                    style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: slotColor(status),
                      cursor: isVendorView && !past ? "pointer" : "default",
                      transition: "transform 0.12s",
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => { if (isVendorView && !past) e.currentTarget.style.transform = "scale(1.4)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12, fontSize: 11, color: "#9B7450", flexWrap: "wrap" }}>
        {[
          { color: "#22c55e", label: "Available" },
          { color: "#ef4444", label: "Booked" },
          { color: "#d1d5db", label: "Past" },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
            {label}
          </span>
        ))}
        <span style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", fontSize: 10 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#C47A2E", display: "inline-block" }} /> AM = 10AM–2PM
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2C1A0E", display: "inline-block" }} /> PM = 4PM–9PM
          </span>
        </span>
        {isVendorView && saving && (
          <span style={{ color: "#C47A2E", fontStyle: "italic" }}>Saving…</span>
        )}
      </div>

      {isVendorView && (
        <p style={{ fontSize: 11, color: "#9B7450", marginTop: 8, fontStyle: "italic" }}>
          Tap any dot to toggle your availability for that slot.
        </p>
      )}
    </div>
  );
}
