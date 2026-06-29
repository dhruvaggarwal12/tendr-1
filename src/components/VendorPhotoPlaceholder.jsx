import React from "react";

const U = (id) =>
  `https://images.unsplash.com/photo-${id}?w=400&h=300&fit=crop&auto=format&q=75`;

const CATEGORY_PHOTOS = {
  DJ: [
    U("1571266028243-d220c6a3a027"),
    U("1516450360452-9312f5e86fc7"),
    U("1470229722913-7c0e2dbbafd3"),
    U("1598387993441-a364f854b322"),
  ],
  Caterer: [
    U("1555244162-803834f70033"),
    U("1414235077428-338989a2e8c0"),
    U("1467003909585-2f8a72700288"),
    U("1476224203421-9ac39bcb3327"),
  ],
  Photographer: [
    U("1492691527719-9d1e07e534b4"),
    U("1519741497674-611481863552"),
    U("1511285560929-80b456fea0bc"),
    U("1537633552985-df8429e8048b"),
  ],
  Decorator: [
    U("1464366400600-7168b8af9bc3"),
    U("1519225421980-715cb0215aed"),
    U("1532712938310-34cb3982ef88"),
    U("1507003211169-0a1dd7228f2d"),
  ],
  Anchor: [
    U("1540575467063-178a50c2df87"),
    U("1475721027785-f74eccf877e2"),
    U("1505373877841-8d25f7d46678"),
    U("1503428593586-e225b39bde50"),
  ],
  Transport: [
    U("1553440569-9b680bb11e50"),
    U("1494976388531-d1058494cdd8"),
    U("1441986300917-64674bd600d8"),
    U("1469854523086-cc02fe5d8800"),
  ],
  Mehendi: [
    U("1519657337289-077653f724ed"),
    U("1609220136736-443140cfeaa3"),
    U("1583095927792-7d4e8e6b834a"),
    U("1561883442-4f1e3bac2d45"),
  ],
  Makeup: [
    U("1522337360788-8b13dee7a37e"),
    U("1487412947147-5cebf100ffc2"),
    U("1559599101-f09722fb4948"),
    U("1576091160550-2173dba999ef"),
  ],
  Default: [
    U("1519225421980-715cb0215aed"),
    U("1464366400600-7168b8af9bc3"),
    U("1492691527719-9d1e07e534b4"),
    U("1555244162-803834f70033"),
  ],
};

const FALLBACK_COLORS = ["#3a1f0d", "#2c1a0e", "#4a2810", "#3d2208"];

function resolveKey(serviceType = "") {
  const s = (serviceType || "").toLowerCase();
  if (s.includes("dj") || s.includes("music")) return "DJ";
  if (s.includes("cater"))                       return "Caterer";
  if (s.includes("decor"))                       return "Decorator";
  if (s.includes("photo"))                       return "Photographer";
  if (s.includes("anchor") || s.includes("mc")) return "Anchor";
  if (s.includes("transport"))                   return "Transport";
  if (s.includes("mehendi") || s.includes("henna")) return "Mehendi";
  if (s.includes("makeup") || s.includes("beauty")) return "Makeup";
  return "Default";
}

/**
 * 2×2 photo-collage placeholder for vendors with no uploaded photos.
 * Parent must give it a fixed height (via className / style); width is 100%.
 */
export default function VendorPhotoPlaceholder({ serviceType, className, style }) {
  const key    = resolveKey(serviceType);
  const photos = CATEGORY_PHOTOS[key];

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#1a0d05",
        ...style,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          width: "100%",
          height: "100%",
          gap: 2,
        }}
      >
        {photos.map((url, i) => (
          <div key={i} style={{ background: FALLBACK_COLORS[i], overflow: "hidden" }}>
            <img
              src={url}
              alt=""
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
