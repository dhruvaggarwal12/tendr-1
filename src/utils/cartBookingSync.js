// Silently ensures the one unified "My Order" conversation exists in the backend
// whenever the user has fun-activity or stationery cart items, and creates a booking
// record if bookingCategory is supplied ('fun-activities' or 'stationery').
// Called on login/signup and on add-to-cart (if already logged in).
// Fire-and-forget — never throws.
// Used to tag these "Stationery & Activities" — a separate conversation from the
// "My Order" bucket everything else funnels into, left over from before that
// unification. Fixed to match so this doesn't keep spawning its own thread.
export function syncCartToBackend(token, bookingCategory = null) {
  if (!token) return;
  try {
    const faCart = JSON.parse(localStorage.getItem('fa_cart') || '[]');
    const stCart = JSON.parse(localStorage.getItem('tendr_stationery_cart') || '[]');
    if (!faCart.length && !stCart.length) return;
  } catch {
    return;
  }
  const BASE_URL = (import.meta.env.VITE_BASE_URL || '').replace(/\/+$/, '');
  const body = { serviceType: 'My Order' };
  if (bookingCategory) body.bookingCategory = bookingCategory;
  fetch(`${BASE_URL}/conversations/baat-karo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    credentials: 'include',
    body: JSON.stringify(body),
  }).catch(() => {});
}
