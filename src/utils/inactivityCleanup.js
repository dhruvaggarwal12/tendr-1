// Each localStorage key now carries its own __expiresAt timestamp (7 days or event date + 1).
// Per-key expiry is checked on read in progressSync.js and the individual slice/component.
// No blanket inactivity wipe needed — removed to follow the 7-day rule.
