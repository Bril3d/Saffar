// ============================================
// SAFAR Chain — Audit Logging Middleware
// Cybersecurity: Every write is logged immutably
// ============================================
const { getDb } = require('../db/db');

/**
 * Log an action to the audit_log table
 */
function logAudit(userId, userRole, action, resource, resourceId, req, details = null) {
    try {
        const db = getDb();
        db.prepare(`
            INSERT INTO audit_log (user_id, user_role, action, resource, resource_id, ip_address, user_agent, details)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            userId || 'anonymous',
            userRole || 'none',
            action,
            resource,
            resourceId || null,
            req.ip || req.connection?.remoteAddress || 'unknown',
            (req.headers['user-agent'] || 'unknown').slice(0, 200),
            details ? JSON.stringify(details) : null
        );
    } catch (e) {
        // Audit logging should never crash the app
        console.error('[AUDIT] Failed to log:', e.message);
    }
}

/**
 * Middleware: Auto-log all POST/PUT/DELETE requests
 */
function auditMiddleware(req, res, next) {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        // Log after response is sent
        const originalSend = res.json.bind(res);
        res.json = function (body) {
            const userId = req.user?.id || 'anonymous';
            const userRole = req.user?.role || 'none';
            const action = `${req.method} ${req.route?.path || req.originalUrl}`;
            const resourceId = req.params?.id || req.params?.lotId || null;
            logAudit(userId, userRole, action, req.baseUrl + (req.route?.path || ''), resourceId, req, {
                statusCode: res.statusCode,
                success: body?.success
            });
            return originalSend(body);
        };
    }
    next();
}

module.exports = { logAudit, auditMiddleware };
