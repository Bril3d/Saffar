// ============================================
// SAFAR Chain — Rate Limiting
// ============================================
const rateLimit = require('express-rate-limit');

// Global: 100 requests per minute per IP
const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_GLOBAL) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        data: null,
        error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' },
        meta: { timestamp: new Date().toISOString() }
    }
});

// AI endpoints: 20 requests per minute per IP (LLM calls are expensive)
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_AI) || 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        data: null,
        error: { code: 'RATE_LIMITED', message: 'AI service rate limit exceeded' },
        meta: { timestamp: new Date().toISOString() }
    }
});

// Auth endpoints: 10 requests per minute per IP (brute force protection)
const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_AUTH) || 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        data: null,
        error: { code: 'RATE_LIMITED', message: 'Too many auth attempts, please try again later' },
        meta: { timestamp: new Date().toISOString() }
    }
});

module.exports = { globalLimiter, aiLimiter, authLimiter };
