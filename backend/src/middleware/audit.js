// ============================================
// SAFAR Chain — Audit Logging Middleware
// Cybersecurity: Immutable audit trail with
// SHA-256 hash chain for tamper detection
// ============================================
const crypto = require('crypto');
const { getDb } = require('../db/db');

// In-memory hash of last audit entry (for chain integrity)
let lastAuditHash = 'GENESIS';

/**
 * Initialize the audit hash chain from the last entry in DB
 */
function initAuditChain() {
    try {
        const db = getDb();
        const last = db.prepare('SELECT chain_hash FROM audit_log ORDER BY id DESC LIMIT 1').get();
        if (last?.chain_hash) {
            lastAuditHash = last.chain_hash;
        }
    } catch {
        // Table might not have chain_hash column yet, that's OK
    }
}

/**
 * Compute SHA-256 chain hash: H(previousHash + timestamp + action + userId)
 */
function computeChainHash(previousHash, timestamp, action, userId) {
    return crypto
        .createHash('sha256')
        .update(`${previousHash}|${timestamp}|${action}|${userId}`)
        .digest('hex');
}

/**
 * Log an action to the audit_log table with chain hash
 */
function logAudit(userId, userRole, action, resource, resourceId, req, details = null) {
    try {
        const db = getDb();
        const timestamp = new Date().toISOString();

        // Compute chain hash
        const chainHash = computeChainHash(lastAuditHash, timestamp, action, userId || 'anonymous');
        lastAuditHash = chainHash;

        db.prepare(`
            INSERT INTO audit_log (user_id, user_role, action, resource, resource_id, ip_address, user_agent, details, chain_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            userId || 'anonymous',
            userRole || 'none',
            action,
            resource,
            resourceId || null,
            req.ip || req.connection?.remoteAddress || 'unknown',
            (req.headers['user-agent'] || 'unknown').slice(0, 200),
            details ? JSON.stringify(details) : null,
            chainHash
        );
    } catch (e) {
        // Audit logging should never crash the app
        console.error('[AUDIT] Failed to log:', e.message);
    }
}

/**
 * Log a failed authentication attempt (security event)
 */
function logFailedAuth(req, email, reason) {
    logAudit(
        'anonymous', 'none', 'AUTH_FAILED',
        '/api/auth/login', null, req,
        { email: email ? email.slice(0, 3) + '***' : 'unknown', reason, severity: 'WARNING' }
    );
}

/**
 * Verify audit chain integrity — detect tampering
 */
function verifyAuditChain() {
    try {
        const db = getDb();
        const entries = db.prepare('SELECT * FROM audit_log ORDER BY id ASC').all();

        if (entries.length === 0) return { valid: true, entries: 0 };

        let previousHash = 'GENESIS';
        let tampered = [];

        for (const entry of entries) {
            if (!entry.chain_hash) continue; // Legacy entries before hash chain

            const expected = computeChainHash(
                previousHash,
                entry.created_at,
                entry.action,
                entry.user_id
            );

            if (entry.chain_hash !== expected) {
                tampered.push({ id: entry.id, expected, actual: entry.chain_hash });
            }
            previousHash = entry.chain_hash;
        }

        return {
            valid: tampered.length === 0,
            entries: entries.length,
            tampered: tampered.length > 0 ? tampered : undefined
        };
    } catch (e) {
        return { valid: false, error: e.message };
    }
}

/**
 * Middleware: Auto-log all POST/PUT/DELETE requests
 */
function auditMiddleware(req, res, next) {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        // Log after response is sent
        const originalJson = res.json.bind(res);
        res.json = function (body) {
            const userId = req.user?.id || 'anonymous';
            const userRole = req.user?.role || 'none';
            const action = `${req.method} ${req.route?.path || req.originalUrl}`;
            const resourceId = req.params?.id || req.params?.lotId || null;
            logAudit(userId, userRole, action, req.baseUrl + (req.route?.path || ''), resourceId, req, {
                statusCode: res.statusCode,
                success: body?.success
            });
            return originalJson(body);
        };
    }
    next();
}

// Initialize chain on module load
try { initAuditChain(); } catch {}

module.exports = { logAudit, logFailedAuth, auditMiddleware, verifyAuditChain, initAuditChain };
