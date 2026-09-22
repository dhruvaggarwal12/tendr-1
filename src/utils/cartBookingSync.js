// Silently ensures a "Stationery & Activities" conversation exists in the backend
// whenever the user has fun-activity or stationery cart items, and creates a booking
// record if bookingCategory is supplied ('fun-activities' or 'stationery').
// Called on login/signup and on add-to-cart (if already logged in).
// Fire-and-forget — never throws.
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
  const body = { serviceType: 'Stationery & Activities' };
  if (bookingCategory) body.bookingCategory = bookingCategory;
  fetch(`${BASE_URL}/conversations/baat-karo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    credentials: 'include',
    body: JSON.stringify(body),
  }).catch(() => {});
}
