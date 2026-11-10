import { useState, useEffect, useCallback } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Decor Analyser has no ToolRun rows of its own (see backend models/ToolRun.js
// for why) — it reads its history straight from DecorAnalysisLog via its own
// route, and has no "in progress" concept since each run is one atomic AI
// call. Every other tool key here goes through the generic /tool-runs API.
const DECOR_ANALYSER_KEY = "decor-analyser";

/**
 * useToolRunHistory(toolKey, token)
 * Signed-out (`token` falsy) → everything stays empty, nothing is fetched,
 * no error state. Signed-in → loads the tool's last 5 completed runs and
 * (for tools other than Decor Analyser) whatever run is currently in
 * progress, so a landing screen can offer "continue where you left off."
 *
 * Returns { recentRuns, inProgressRun, loading, refresh }.
 */
export function useToolRunHistory(toolKey, token) {
  const [recentRuns, setRecentRuns] = useState([]);
  const [inProgressRun, setInProgressRun] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token || !toolKey) {
      setRecentRuns([]);
      setInProgressRun(null);
      return;
    }
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      if (toolKey === DECOR_ANALYSER_KEY) {
        const res = await fetch(`${BASE_URL}/decor-analyse/mine?limit=5`, { headers });
        const data = await res.json();
        setRecentRuns(Array.isArray(data.runs) ? data.runs : []);
        setInProgressRun(null);
      } else {
        const [mineRes, currentRes] = await Promise.all([
          fetch(`${BASE_URL}/tool-runs/${toolKey}/mine?limit=5`, { headers }),
          fetch(`${BASE_URL}/tool-runs/${toolKey}/current`, { headers }),
        ]);
        const [mineData, currentData] = await Promise.all([mineRes.json(), currentRes.json()]);
        setRecentRuns(Array.isArray(mineData.runs) ? mineData.runs : []);
        setInProgressRun(currentData.run || null);
      }
    } catch {
      setRecentRuns([]);
      setInProgressRun(null);
    } finally {
      setLoading(false);
    }
  }, [toolKey, token]);

  useEffect(() => { refresh(); }, [refresh]);

  return { recentRuns, inProgressRun, loading, refresh };
}
