// ============================================
// SAFAR Chain — JWT Authentication Middleware
// ============================================
const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

/**
 * Middleware: Verify Bearer JWT token
 * Attaches req.user = { id, role, walletAddress }
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const err = error('AUTH_REQUIRED', 'Authentication required', 401);
        return res.status(401).json(err.responseBody);
    }

    const token = authHeader.slice(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.userId,
            role: decoded.role,
            walletAddress: decoded.walletAddress || null
        };
        next();
    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            const err = error('TOKEN_EXPIRED', 'Token has expired', 401);
            return res.status(401).json(err.responseBody);
        }
        const err = error('INVALID_TOKEN', 'Invalid authentication token', 401);
        return res.status(401).json(err.responseBody);
    }
}

/**
 * Optional auth: sets req.user if token present, but doesn't require it
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }
    const token = authHeader.slice(7);
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.userId,
            role: decoded.role,
            walletAddress: decoded.walletAddress || null
        };
    } catch (e) {
        req.user = null;
    }
    next();
}

/**
 * Generate JWT token for a user
 */
function generateToken(user) {
    return jwt.sign(
        {
            userId: user.id,
            role: user.role,
            walletAddress: user.wallet_address || null
        },
        JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );
}

module.exports = { authenticate, optionalAuth, generateToken };
