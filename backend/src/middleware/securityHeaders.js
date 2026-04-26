// ============================================
// SAFAR Chain — Security Headers Middleware
// Defense-in-depth HTTP security headers
// ============================================

/**
 * Additional security headers beyond Helmet defaults
 */
function securityHeaders(req, res, next) {
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // XSS protection (legacy browsers)
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy — don't leak internal URLs
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy — disable unnecessary browser features
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

    // HSTS — force HTTPS (preload ready)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // Prevent caching of sensitive responses
    if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/ai')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
    }

    // CORS headers are handled by the cors middleware, don't duplicate
    next();
}

module.exports = { securityHeaders };
