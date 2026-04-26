// ============================================
// SAFAR Chain — Standardized Response Formatter
// ============================================

function success(data, meta = {}) {
    return {
        success: true,
        data,
        error: null,
        meta: {
            timestamp: new Date().toISOString(),
            ...meta
        }
    };
}

function error(code, message, statusCode = 400) {
    const err = new Error(message);
    err.statusCode = statusCode;
    err.responseBody = {
        success: false,
        data: null,
        error: { code, message },
        meta: {
            timestamp: new Date().toISOString()
        }
    };
    return err;
}

module.exports = { success, error };
