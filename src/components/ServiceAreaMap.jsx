import { useEffect, useRef } from "react";

// NCR + major Indian city coordinates
const CITY_COORDS = {
  "Delhi":         [28.7041,  77.1025],
  "New Delhi":     [28.6139,  77.2090],
  "Noida":         [28.5355,  77.3910],
  "Greater Noida": [28.4744,  77.5040],
  "Ghaziabad":     [28.6692,  77.4538],
  "Gurugram":      [28.4595,  77.0266],
  "Gurgaon":       [28.4595,  77.0266],
  "Faridabad":     [28.4089,  77.3178],
  "Mumbai":        [19.0760,  72.8777],
  "Bangalore":     [12.9716,  77.5946],
  "Bengaluru":     [12.9716,  77.5946],
  "Chennai":       [13.0827,  80.2707],
  "Hyderabad":     [17.3850,  78.4867],
  "Pune":          [18.5204,  73.8567],
  "Kolkata":       [22.5726,  88.3639],
  "Ahmedabad":     [23.0225,  72.5714],
  "Jaipur":        [26.9124,  75.7873],
  "Lucknow":       [26.8467,  80.9462],
  "Chandigarh":    [30.7333,  76.7794],
  "Agra":          [27.1767,  78.0081],
  "Meerut":        [28.9845,  77.7064],
  "Varanasi":      [25.3176,  82.9739],
  "Patna":         [25.5941,  85.1376],
};

export default function ServiceAreaMap({ cities = [], vendorName = "Vendor" }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const leafletLoaded = useRef(false);

  useEffect(() => {
    if (!mapRef.current || !cities.length) return;

    const initMap = () => {
      const L = window.L;
      if (!L) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        dragging: true,
      });
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      const coords = cities.map(c => CITY_COORDS[c]).filter(Boolean);
      if (!coords.length) {
        map.setView([28.6139, 77.2090], 10);
        return;
      }

      // Gold teardrop marker
      const markerHtml = `
        <div style="
          position:relative;
          width:32px;height:40px;
        ">
          <div style="
            position:absolute;top:0;left:0;
            width:32px;height:32px;
            background:linear-gradient(135deg,#C47A2E,#CCAB4A);
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:3px solid #fff;
            box-shadow:0 3px 10px rgba(196,122,46,0.55);
          "></div>
          <div style="
            position:absolute;top:6px;left:6px;
            width:20px;height:20px;
            border-radius:50%;
            background:#fff;
            display:flex;align-items:center;justify-content:center;
            font-size:11px;
          ">📍</div>
        </div>`;

      const icon = L.divIcon({
        html: markerHtml,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -42],
        className: "",
      });

      cities.forEach((city) => {
        const coord = CITY_COORDS[city];
        if (!coord) return;
        L.marker(coord, { icon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;color:#2C1A0E;padding:4px 2px">${city}</div>`,
            { maxWidth: 120 }
          );
      });

      if (coords.length === 1) {
        map.setView(coords[0], 12);
      } else {
        map.fitBounds(L.latLngBounds(coords), { padding: [36, 36] });
      }
    };

    // Load Leaflet CSS once
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Load Leaflet JS once
    if (window.L) {
      initMap();
    } else if (!leafletLoaded.current) {
      leafletLoaded.current = true;
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      // Script tag added but not yet loaded — wait
      const check = setInterval(() => {
        if (window.L) { clearInterval(check); initMap(); }
      }, 100);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [cities.join(",")]);

  if (!cities.length) return null;

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: 280,
        borderRadius: 16,
        overflow: "hidden",
        border: "1.5px solid rgba(196,122,46,0.18)",
        boxShadow: "0 4px 20px rgba(44,26,14,0.08)",
      }}
    />
  );
}
