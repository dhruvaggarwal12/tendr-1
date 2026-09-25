import HamburgerNav from "../../components/HamburgerNav";
import DecorAnalyzer from "../../components/DecorAnalyzer";

const F = "'Outfit', sans-serif";
const GOLD = "#C47A2E";

export default function DecorAnalyzerPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#FFFCF5", fontFamily: F }}>
      <HamburgerNav />
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 60px" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>
            AI Tool
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1C0900", margin: 0, lineHeight: 1.2 }}>
            Venue Decor Analyser
          </h1>
          <p style={{ fontSize: 14, color: "rgba(28,9,0,0.55)", marginTop: 8, lineHeight: 1.6 }}>
            Upload a photo of your venue and get AI-powered decoration suggestions — colour palette, zones, lighting, and top picks tailored to your space.
          </p>
        </div>

        <DecorAnalyzer />
      </div>
    </div>
  );
}
