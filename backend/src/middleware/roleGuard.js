// ============================================
// SAFAR Chain — Role-Based Access Control (RBAC)
// ============================================
const { error } = require('../utils/response');

/**
 * Middleware factory: Restrict access to specific roles
 * Usage: requireRole('VET', 'PHARMACY')
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            const err = error('AUTH_REQUIRED', 'Authentication required', 401);
            return res.status(401).json(err.responseBody);
        }

        // ADMIN always has access
        if (req.user.role === 'ADMIN' || allowedRoles.includes(req.user.role)) {
            return next();
        }

        const err = error(
            'FORBIDDEN',
            `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
            403
        );
        return res.status(403).json(err.responseBody);
    };
}

/**
 * Middleware factory: Ensure the user owns the resource
 * Checks that req.user.id matches the specified field in req.params or fetched data
 */
function requireOwnership(getOwnerId) {
    return (req, res, next) => {
        if (!req.user) {
            const err = error('AUTH_REQUIRED', 'Authentication required', 401);
            return res.status(401).json(err.responseBody);
        }
        // ADMIN bypasses ownership check
        if (req.user.role === 'ADMIN') {
            return next();
        }

        const ownerId = typeof getOwnerId === 'function' ? getOwnerId(req) : req.params[getOwnerId];
        if (ownerId !== req.user.id) {
            const err = error('FORBIDDEN', 'You do not own this resource', 403);
            return res.status(403).json(err.responseBody);
        }
        next();
    };
}

module.exports = { requireRole, requireOwnership };
