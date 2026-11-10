const font = "'Outfit', sans-serif";
const GOLD = "#C47A2E";
const INK = "#2C1A0E";
const MUTED = "#9B7450";

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

/**
 * ToolHistoryPanel — purely presentational, signed-in-only history + resume
 * card for a tool's landing screen. Renders nothing if both `recentRuns` and
 * `inProgressRun` are empty, so it's safe to drop into any landing branch
 * unconditionally. Data comes from useToolRunHistory(toolKey, token).
 *
 * Props:
 *   recentRuns    — array of { _id, label, createdAt, ... } (up to 5, completed)
 *   inProgressRun — { _id, label, createdAt, ... } | null
 *   onResume      — called with inProgressRun when "Continue" is clicked
 *   onSelectRun   — called with one entry from recentRuns when clicked
 */
export default function ToolHistoryPanel({ recentRuns = [], inProgressRun = null, onResume, onSelectRun }) {
  if (!inProgressRun && recentRuns.length === 0) return null;

  return (
    <div style={{ marginBottom: 20, fontFamily: font }}>
      {inProgressRun && (
        <button
          onClick={() => onResume?.(inProgressRun)}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
            padding: "13px 16px", borderRadius: 13, marginBottom: recentRuns.length ? 14 : 0,
            background: "linear-gradient(135deg,rgba(196,122,46,0.1),rgba(204,171,74,0.14))",
            border: `1.5px solid rgba(196,122,46,0.3)`, cursor: "pointer", textAlign: "left", fontFamily: font,
          }}
        >
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: GOLD, marginBottom: 3 }}>
              In progress
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>
              {inProgressRun.label || "Continue where you left off"}
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: GOLD, flexShrink: 0 }}>Continue →</span>
        </button>
      )}

      {recentRuns.length > 0 && (
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: MUTED, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
            Recent
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {recentRuns.map((run) => (
              <button
                key={run._id}
                onClick={() => onSelectRun?.(run)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                  padding: "10px 13px", borderRadius: 11, background: "#fff",
                  border: "1.5px solid rgba(196,122,46,0.14)", cursor: "pointer", textAlign: "left", fontFamily: font,
                }}
              >
                <span style={{ fontSize: 12.5, color: INK, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {run.label || "Untitled"}
                </span>
                <span style={{ fontSize: 11, color: MUTED, flexShrink: 0 }}>{formatDate(run.createdAt)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
