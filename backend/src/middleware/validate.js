// ============================================
// SAFAR Chain — Input Validation Middleware (Zod)
// ============================================
const { error } = require('../utils/response');

/**
 * Middleware factory: Validate request body against a Zod schema
 * Usage: validate(myZodSchema)
 */
function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const messages = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
            const err = error('VALIDATION_ERROR', messages, 400);
            return res.status(400).json(err.responseBody);
        }
        // Replace body with parsed (sanitized) data
        req.body = result.data;
        next();
    };
}

/**
 * Middleware factory: Validate query parameters
 */
function validateQuery(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            const messages = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
            const err = error('VALIDATION_ERROR', messages, 400);
            return res.status(400).json(err.responseBody);
        }
        req.query = result.data;
        next();
    };
}

/**
 * Sanitize a string: strip HTML tags, trim, limit length
 */
function sanitize(str, maxLength = 1000) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/<[^>]*>/g, '')  // Strip HTML
        .replace(/[<>]/g, '')     // Extra safety
        .trim()
        .slice(0, maxLength);
}

module.exports = { validate, validateQuery, sanitize };
