// ============================================
// SAFAR Chain — Global Error Handler
// Never leaks stack traces in production
// ============================================

function errorHandler(err, req, res, _next) {
    // Log the full error server-side
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }

    // If we have a pre-formatted response body (from our error() helper)
    if (err.responseBody) {
        return res.status(err.statusCode || 400).json(err.responseBody);
    }

    // Default 500 error — never expose internals
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        data: null,
        error: {
            code: 'INTERNAL_ERROR',
            message: process.env.NODE_ENV === 'production'
                ? 'An unexpected error occurred'
                : err.message
        },
        meta: {
            timestamp: new Date().toISOString()
        }
    });
}

module.exports = errorHandler;
