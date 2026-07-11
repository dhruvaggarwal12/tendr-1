import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import AuthModal from "./AuthModal";

const PROMPT_KEY = "tendr_signin_prompt_at";
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

function shouldShow() {
  try {
    const raw = localStorage.getItem(PROMPT_KEY);
    if (!raw) return true;
    return Date.now() - Number(raw) > SEVEN_DAYS;
  } catch { return true; }
}

function markShown() {
  try { localStorage.setItem(PROMPT_KEY, String(Date.now())); } catch {}
}

export default function SignInPromptController() {
  const user = useSelector(s => s.auth.user);
  const [open, setOpen] = useState(false);

  const maybeShow = useCallback(() => {
    if (!user && shouldShow()) {
      markShown();
      setOpen(true);
    }
  }, [user]);

  // App-load trigger — only fires if the home tour has already been seen.
  // First-time visitors: tour runs and fires tendr:show-signin on completion.
  // Returning visitors (tour already seen, not logged in): 3-minute delay from page load.
  useEffect(() => {
    const homeTourSeen = () => { try { return !!localStorage.getItem("tendr_tour_home"); } catch { return false; } };
    if (!homeTourSeen()) return;
    const t = setTimeout(maybeShow, 3 * 60 * 1000);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tour-done trigger — fired by PageTour via Home.jsx on completion or skip.
  // 3-minute delay starts from the moment the tour finishes.
  useEffect(() => {
    let t;
    const handler = () => { t = setTimeout(maybeShow, 3 * 60 * 1000); };
    window.addEventListener("tendr:show-signin", handler);
    return () => { window.removeEventListener("tendr:show-signin", handler); clearTimeout(t); };
  }, [maybeShow]);

  // Auto-close if user signs in
  useEffect(() => { if (user) setOpen(false); }, [user]);

  return (
    <AuthModal
      open={open}
      onClose={() => setOpen(false)}
      onSuccess={() => setOpen(false)}
      showSkip
    />
  );
}
