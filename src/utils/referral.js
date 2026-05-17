/**
 * Tendr Referral System — Client-side utility
 *
 * Code format: TNDR + 6 alphanumeric chars = 10 chars total
 * e.g. TNDRA3X9KQ
 *
 * Generation is DETERMINISTIC from the user's MongoDB ObjectId — the same user
 * always gets the same code, so no storage is needed.
 *
 * Backend integration guide (endpoints to add):
 *   GET  /referrals/validate/:code   → { valid, referrerId, referrerName }
 *   POST /referrals/apply            → body: { code, orderId, discountAmount }
 *   The backend can re-derive the referrerId from the code using decodeUserId()
 */

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 chars, no ambiguous O/0/I/1

/**
 * Generate a unique referral code for a userId (MongoDB ObjectId, 24 hex chars).
 * Deterministic: same userId always returns the same code.
 */
export function generateReferralCode(userId = "") {
  if (!userId || userId.length < 6) return null;
  // Use the last 12 hex chars of the ObjectId (avoids timestamp prefix collisions)
  const hex = userId.slice(-12);
  let code = "TNDR";
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16); // 0-255
    code += CHARS[byte % CHARS.length];
  }
  return code; // e.g. "TNDRA3X9KQ"
}

/**
 * Derive the userId suffix from a referral code (for backend validation).
 * The backend can compare this against stored user IDs.
 */
export function decodeReferralCode(code = "") {
  if (!code.startsWith("TNDR") || code.length !== 10) return null;
  return code.slice(4); // 6-char encoded suffix
}

/** Format code for display with a dash: TNDR-A3X9KQ */
export function formatCode(code = "") {
  if (!code || code.length !== 10) return code;
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/** Parse formatted code back to raw: TNDR-A3X9KQ → TNDRA3X9KQ */
export function parseCode(input = "") {
  return input.trim().toUpperCase().replace(/-/g, "").replace(/\s/g, "");
}

/** Validate format of a referral code (raw or formatted). */
export function isValidFormat(input = "") {
  const raw = parseCode(input);
  if (raw.length !== 10 || !raw.startsWith("TNDR")) return false;
  const suffix = raw.slice(4);
  return suffix.split("").every(c => CHARS.includes(c));
}

export const DISCOUNT_PERCENT = 15;

/** Calculate the discounted total. */
export function applyDiscount(total = 0) {
  const discount = Math.round(total * DISCOUNT_PERCENT / 100);
  return { discount, finalTotal: total - discount };
}
