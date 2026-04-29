// ============================================
// SAFAR Chain — Rate Limiting (Multi-Tier)
// Cybersecurity: DDoS + Brute-Force Protection
// ============================================
const rateLimit = require('express-rate-limit');

// Global: 200 req/min per IP
const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false, data: null,
        error: { code: 'RATE_LIMIT', message: 'Trop de requêtes. Réessayez dans quelques instants.' },
        meta: { timestamp: new Date().toISOString() }
    },
    keyGenerator: (req) => req.ip || req.connection?.remoteAddress || 'unknown'
});

// AI endpoints: 30 req/min per IP (expensive operations)
const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false, data: null,
        error: { code: 'AI_RATE_LIMIT', message: 'Limite de requêtes IA atteinte. Réessayez dans quelques instants.' },
        meta: { timestamp: new Date().toISOString() }
    },
    keyGenerator: (req) => req.ip || req.connection?.remoteAddress || 'unknown'
});

// Auth: 20 req/min per IP (prevent enumeration)
const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false, data: null,
        error: { code: 'AUTH_RATE_LIMIT', message: 'Trop de tentatives d\'authentification. Réessayez plus tard.' },
        meta: { timestamp: new Date().toISOString() }
    },
    keyGenerator: (req) => req.ip || req.connection?.remoteAddress || 'unknown'
});

// Login brute-force: 5 attempts per 15 min per IP (very strict)
const loginBruteForce = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Only count failed attempts
    message: {
        success: false, data: null,
        error: {
            code: 'BRUTE_FORCE_PROTECTION',
            message: 'Trop de tentatives de connexion échouées. Compte temporairement verrouillé. Réessayez dans 15 minutes.'
        },
        meta: { timestamp: new Date().toISOString() }
    },
    keyGenerator: (req) => {
        // Combine IP + email for targeted protection
        const email = req.body?.email || '';
        return `${req.ip}-${email.toLowerCase()}`;
    }
});

// Write operations: 60 req/min per IP
const writeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false, data: null,
        error: { code: 'WRITE_RATE_LIMIT', message: 'Trop d\'opérations d\'écriture. Réessayez dans quelques instants.' },
        meta: { timestamp: new Date().toISOString() }
    },
    keyGenerator: (req) => req.ip || req.connection?.remoteAddress || 'unknown'
});

module.exports = { globalLimiter, aiLimiter, authLimiter, loginBruteForce, writeLimiter };
