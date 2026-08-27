const rateLimit = require('express-rate-limit');

// ── Global API Rate Limiter ──────────────────────────────────
// Allows 300 requests per 15-minute window across standard endpoints
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true, // Draft-6 RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many requests from this IP. Please slow down and try again after 15 minutes.',
  },
});

// ── Strict Auth Rate Limiter ─────────────────────────────────
// Protects login & registration against brute-force & credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. For your security, please try again in 15 minutes.',
  },
});

// ── File Upload / Notes Creation Limiter ──────────────────────
// Prevents storage spamming and heavy resource exhaustion
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 upload requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Upload limit reached for this session. Please wait before uploading additional notes.',
  },
});

module.exports = {
  globalLimiter,
  authLimiter,
  uploadLimiter,
};
