import LaunchSequence from "../components/LaunchSequence";

export default function LaunchLivePage() {
  return (
    <LaunchSequence
      autoFullscreen={true}
      onComplete={() => {
        // Close tab after sequence finishes
        try { window.close(); } catch {}
      }}
    />
  );
}
