import React, { useState, useEffect } from "react";

const font = "'Outfit', sans-serif";

/**
 * Category-specific secondary filters — field names match vendor model exactly
 * so they work with both client-side filtering and the API serviceFilters param.
 */
const CATEGORY_FILTERS = {
  DJ: [
    {
      key: "setup",
      title: "Setup Type",
      type: "checkbox",
      options: ["Basic Setup", "Full Production"],
    },
    {
      key: "lightsIncluded",
      title: "Lights Included",
      type: "boolean",
      options: [{ label: "Yes", value: true }, { label: "No", value: false }],
    },
    {
      key: "eventTypes",
      title: "Event Type",
      type: "checkbox",
      options: ["House Party", "Corporate", "Venue"],
    },
  ],

  Photographer: [
    {
      key: "services",
      title: "Services",
      type: "checkbox",
      options: ["Photography Only", "Videography Only", "Both Photography & Videography"],
    },
    {
      key: "photographyType",
      title: "Photography Style",
      type: "checkbox",
      options: ["Candid", "Traditional", "Pre-Wedding", "Cinematic", "Documentary"],
    },
    {
      key: "hoursIncluded",
      title: "Hours Included",
      type: "min-radio",
      options: [
        { label: "2+ hrs", value: 2 },
        { label: "4+ hrs", value: 4 },
        { label: "8+ hrs", value: 8 },
        { label: "Full day", value: 10 },
      ],
    },
    {
      key: "editingTimeDays",
      title: "Editing Time (days)",
      type: "max-radio",
      options: [
        { label: "2 days", value: 2 },
        { label: "5 days", value: 5 },
        { label: "7 days", value: 7 },
        { label: "10+ days", value: 30 },
      ],
    },
  ],

  Caterer: [
    {
      key: "cuisine",
      title: "Cuisine Types",
      type: "checkbox",
      options: ["North Indian", "South Indian", "Snacks", "Chinese Starters", "Punjabi", "Desserts", "Italian", "Other"],
    },
    {
      key: "serviceStyle",
      title: "Service Style",
      type: "checkbox",
      options: ["Buffet", "Food Stations", "Live Counters", "Family Style"],
    },
    {
      key: "menuType",
      title: "Menu Type",
      type: "checkbox",
      options: ["Veg", "Non Veg", "Jain"],
    },
    {
      key: "beveragesIncluded",
      title: "Beverages Included",
      type: "boolean",
      options: [{ label: "Yes", value: true }, { label: "No", value: false }],
    },
  ],

  Decorator: [
    {
      key: "typesOfDecoration",
      title: "Types of Decoration",
      type: "checkbox",
      options: ["Floral", "Balloon", "Lighting", "Backdrop", "Minimalist"],
    },
    {
      key: "venueCoverage",
      title: "Venue Coverage",
      type: "checkbox",
      options: ["Interior", "Exterior", "Full", "Backdrop Stage Setup", "Extreme Focus"],
    },
  ],
};

/** Apply secondary filters to a list of vendors (client-side) */
export function applySecondaryFilters(vendors, filters, serviceType) {
  if (!filters || !serviceType) return vendors;
  const config = CATEGORY_FILTERS[serviceType] || [];
  if (!config.length) return vendors;

  return vendors.filter(vendor => {
    for (const section of config) {
      const { key, type } = section;
      const selected = filters[key];

      // Skip if nothing selected for this filter
      if (
        selected === undefined ||
        selected === null ||
        (Array.isArray(selected) && selected.length === 0)
      ) continue;

      if (type === "boolean") {
        // Exact boolean match
        if (vendor[key] !== selected) return false;
      } else if (type === "min-radio") {
        // vendor.hoursIncluded must be >= selected minimum
        const vendorVal = Number(vendor[key] ?? 0);
        if (vendorVal < Number(selected)) return false;
      } else if (type === "max-radio") {
        // vendor.editingTimeDays must be <= selected maximum
        const vendorVal = Number(vendor[key] ?? 999);
        if (vendorVal > Number(selected)) return false;
      } else if (type === "checkbox") {
        // vendor array must contain at least one selected value (OR logic)
        const vendorArr = vendor[key] || [];
        const hasMatch = selected.some(sv => vendorArr.includes(sv));
        if (!hasMatch) return false;
      }
    }
    return true;
  });
}

const SecondaryFilters_ListingPage = ({
  serviceType = "",
  onFiltersChange,
}) => {
  const config = CATEGORY_FILTERS[serviceType] || [];
  const [filters, setFilters] = useState({});

  // Reset filters when category changes
  useEffect(() => {
    setFilters({});
    onFiltersChange?.({});
  }, [serviceType]);

  const update = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFiltersChange?.(next);
  };

  const toggleCheckbox = (key, value) => {
    const arr = Array.isArray(filters[key]) ? filters[key] : [];
    update(key, arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  };

  const clearAll = () => {
    setFilters({});
    onFiltersChange?.({});
  };

  const hasActive = Object.values(filters).some(v =>
    v !== undefined && v !== null && (!Array.isArray(v) || v.length > 0)
  );

  if (!config.length) return null;

  return (
    <div style={{ fontFamily: font }}>
      {/* Clear all */}
      {hasActive && (
        <button
          onClick={clearAll}
          style={{ fontSize: 11, fontWeight: 700, color: "#c0392b", background: "rgba(192,57,43,0.07)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: 100, padding: "3px 10px", cursor: "pointer", marginBottom: 16, display: "block" }}
        >
          ✕ Clear Filters
        </button>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {config.map(({ key, title, type, options }) => (
          <div key={key}>
            <h4 style={{ fontSize: 10, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px" }}>
              {title}
            </h4>

            {/* Boolean — two pill buttons (Yes / No) */}
            {type === "boolean" && (
              <div style={{ display: "flex", gap: 8 }}>
                {options.map(({ label, value }) => {
                  const active = filters[key] === value;
                  return (
                    <button
                      key={label}
                      onClick={() => update(key, active ? undefined : value)}
                      style={{
                        padding: "6px 16px", borderRadius: 100, fontSize: 13, fontWeight: 600,
                        border: `1.5px solid ${active ? "#C47A2E" : "rgba(196,122,46,0.25)"}`,
                        background: active ? "#C47A2E" : "#fff",
                        color: active ? "#fff" : "#6B3A1F",
                        cursor: "pointer", fontFamily: font, transition: "all 0.15s",
                      }}
                    >{label}</button>
                  );
                })}
              </div>
            )}

            {/* Checkbox — multi-select pills */}
            {type === "checkbox" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {options.map(opt => {
                  const arr = filters[key] || [];
                  const active = arr.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleCheckbox(key, opt)}
                      style={{
                        padding: "5px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                        border: `1.5px solid ${active ? "#C47A2E" : "rgba(196,122,46,0.22)"}`,
                        background: active ? "rgba(196,122,46,0.1)" : "#fff",
                        color: active ? "#C47A2E" : "#6B3A1F",
                        cursor: "pointer", fontFamily: font, transition: "all 0.15s",
                      }}
                    >
                      {active && "✓ "}{opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Radio (min/max) — single select pills */}
            {(type === "min-radio" || type === "max-radio") && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {options.map(({ label, value }) => {
                  const active = filters[key] === value;
                  return (
                    <button
                      key={label}
                      onClick={() => update(key, active ? undefined : value)}
                      style={{
                        padding: "5px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                        border: `1.5px solid ${active ? "#C47A2E" : "rgba(196,122,46,0.22)"}`,
                        background: active ? "#C47A2E" : "#fff",
                        color: active ? "#fff" : "#6B3A1F",
                        cursor: "pointer", fontFamily: font, transition: "all 0.15s",
                      }}
                    >{label}</button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Minimum Rating */}
        <div>
          <h4 style={{ fontSize: 12, fontWeight: 700, color: "#9B7450", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>
            Minimum Rating
          </h4>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[4, 3, 2].map(r => {
              const active = filters.minRating === r;
              return (
                <button
                  key={r}
                  onClick={() => update("minRating", active ? undefined : r)}
                  style={{
                    padding: "5px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                    border: `1.5px solid ${active ? "#C47A2E" : "rgba(196,122,46,0.22)"}`,
                    background: active ? "#C47A2E" : "#fff",
                    color: active ? "#fff" : "#6B3A1F",
                    cursor: "pointer", fontFamily: font, transition: "all 0.15s",
                  }}
                >
                  ⭐ {r}+
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecondaryFilters_ListingPage;
