import React from "react";

const U = (id) =>
  `https://images.unsplash.com/photo-${id}?w=400&h=300&fit=crop&auto=format&q=75`;

const CATEGORY_PHOTOS = {
  DJ: [
    U("1571266028243-d220c6a3a027"),
    U("1493225457124-a3eb161ffa5f"),
    U("1516450360452-9312f5e86fc7"),
    U("1470229722913-7c0e2dbbafd3"),
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
    U("1605462863863-10d9e47e15ee"),
  ],
  Decorator: [
    U("1464366400600-7168b8af9bc3"),
    U("1478145787956-9a99f8c1a6a0"),
    U("1519225421980-715cb0215aed"),
    U("1520854221256-17296d498cc1"),
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
    U("1576179635662-9d1983e97e1e"),
    U("1599639957043-f3aa5c986398"),
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
  const label  = serviceType ? `${serviceType} at Tendr` : "Vendor at Tendr";

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
      {/* 2×2 collage grid */}
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
          <img
            key={i}
            src={url}
            alt=""
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              filter: "brightness(0.82) saturate(1.1)",
            }}
          />
        ))}
      </div>

      {/* Dark vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg,rgba(0,0,0,0.45) 0%,rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Highlighted label */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 12,
        }}
      >
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(13px, 3.5vw, 18px)",
            letterSpacing: "0.03em",
            textAlign: "center",
            lineHeight: 1.2,
            color: "#fff",
            background: "linear-gradient(135deg,#C47A2E,#CCAB4A)",
            padding: "10px 22px",
            borderRadius: 100,
            boxShadow:
              "0 0 0 2.5px rgba(255,255,255,0.22), 0 6px 28px rgba(0,0,0,0.55), 0 2px 8px rgba(196,122,46,0.6)",
            textShadow: "0 1px 6px rgba(0,0,0,0.45)",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
