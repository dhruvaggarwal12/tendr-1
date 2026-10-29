import ToolPageShell, { ToolWindow } from "../../components/ToolPageShell";
import DecorAnalyzer from "../../components/DecorAnalyzer";

const GOLD = "#C47A2E";

export default function DecorAnalyzerPage() {
  return (
    <ToolPageShell
      accent={GOLD}
      eyebrow="AI Tool"
      title="Decor Analyser"
      subtitle="Upload a photo of your own venue for decoration ideas tailored to your space — or upload a look you like alongside your venue, and we'll show exactly how it translates to your actual space."
      icon={
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" opacity="0.35" fill="#fff" />
          <path d="M19 3v4M17 5h4M5 17v3M3.5 18.5h3" />
        </svg>
      }
    >
      <ToolWindow accent={GOLD}>
        <DecorAnalyzer />
      </ToolWindow>
    </ToolPageShell>
  );
}
