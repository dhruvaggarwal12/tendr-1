const rateLimit = require('express-rate-limit');
const { RATE_LIMITS } = require('../constants');

// OTP request limiter
const otpLimiter = rateLimit({
  windowMs: RATE_LIMITS.OTP.windowMs, // 15 minutes
  max: RATE_LIMITS.OTP.max, // 3 requests per windowMs
  error: 'Too many OTP requests',
});

// API limiter
const apiLimiter = rateLimit({
  windowMs: RATE_LIMITS.API.windowMs, // 1 minute
  max: RATE_LIMITS.API.max, // 100 requests per minute
  error: 'Too many requests',
});

// Auth limiter (more strict)
const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs, // 1 hour
  max: RATE_LIMITS.AUTH.max, // 5 failed attempts per hour
  error: 'Too many failed login attempts',
});

module.exports = {
  otpLimiter,
  apiLimiter,
  authLimiter
}; 