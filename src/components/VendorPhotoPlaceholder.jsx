import React from "react";

const U = (id) =>
  `https://images.unsplash.com/photo-${id}?w=800&h=500&fit=crop&auto=format&q=80`;

const CATEGORY_PHOTO = {
  DJ:           U("1470225620780-dba8ba36b745"),
  Caterer:      U("1555244162-803834f70033"),
  Photographer: U("1516035069371-29a1b244cc32"),
  Decorator:    U("1464366400600-7168b8af9bc3"),
  Anchor:       U("1540575467063-178a50c2df87"),
  Transport:    U("1553440569-9b680bb11e50"),
  Mehendi:      U("1519657337289-077653f724ed"),
  Makeup:       U("1522337360788-8b13dee7a37e"),
  Default:      U("1519225421980-715cb0215aed"),
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

export default function VendorPhotoPlaceholder({ serviceType, className, style }) {
  const photo = CATEGORY_PHOTO[resolveKey(serviceType)];

  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#2c1a0e",
        ...style,
      }}
    >
      <img
        src={photo}
        alt=""
        loading="lazy"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}
