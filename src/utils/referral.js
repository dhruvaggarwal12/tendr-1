const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 chars, no ambiguous O/0/I/1

// Customer referral code: TNDR + 6 chars derived from userId
export function generateReferralCode(userId = "") {
  if (!userId || userId.length < 6) return null;
  const hex = userId.slice(-12);
  let code = "TNDR";
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    code += CHARS[byte % CHARS.length];
  }
  return code;
}

// Vendor referral code: TNDV + 6 chars derived from vendorId
export function generateVendorReferralCode(vendorId = "") {
  if (!vendorId || vendorId.length < 6) return null;
  const hex = vendorId.slice(-12);
  let code = "TNDV";
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    code += CHARS[byte % CHARS.length];
  }
  return code;
}

export function decodeReferralCode(code = "") {
  if (code.length !== 10) return null;
  return code.slice(4);
}

/** Format code for display with a dash: TNDR-A3X9KQ or TNDV-A3X9KQ */
export function formatCode(code = "") {
  if (!code || code.length !== 10) return code;
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

/** Parse formatted code back to raw */
export function parseCode(input = "") {
  return input.trim().toUpperCase().replace(/-/g, "").replace(/\s/g, "");
}

/** Validate format — accepts both customer (TNDR) and vendor (TNDV) codes */
export function isValidFormat(input = "") {
  const raw = parseCode(input);
  if (raw.length !== 10) return false;
  if (!raw.startsWith("TNDR") && !raw.startsWith("TNDV")) return false;
  return raw.slice(4).split("").every(c => CHARS.includes(c));
}

/** Returns true if the code belongs to a vendor */
export function isVendorCode(input = "") {
  return parseCode(input).startsWith("TNDV");
}

export const DISCOUNT_PERCENT = 5;

/** Calculate the discounted total. */
export function applyDiscount(total = 0) {
  const discount = Math.round(total * DISCOUNT_PERCENT / 100);
  return { discount, finalTotal: total - discount };
}
