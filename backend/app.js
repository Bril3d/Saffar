// ============================================
// SAFAR Chain — Express App Configuration
// Security hardened: Helmet, CORS lockdown,
// rate limiting (5 tiers), audit chain, guardrails
// ============================================
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { globalLimiter, aiLimiter, authLimiter, loginBruteForce, writeLimiter } = require('./src/middleware/rateLimiter');
const { auditMiddleware, initAuditChain } = require('./src/middleware/audit');
const { securityHeaders } = require('./src/middleware/securityHeaders');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/auth');
const drugRoutes = require('./src/routes/drugs');
const prescriptionRoutes = require('./src/routes/prescriptions');
const lotRoutes = require('./src/routes/lots');
const productRoutes = require('./src/routes/products');
const orderRoutes = require('./src/routes/orders');
const reviewRoutes = require('./src/routes/reviews');
const aiRoutes = require('./src/routes/ai');

const app = express();

// ---- Trust proxy (for rate limiting behind reverse proxy) ----
app.set('trust proxy', 1);

// ---- Security Middleware ----
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "same-origin" },
    dnsPrefetchControl: { allow: false },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

// Custom security headers (beyond Helmet)
app.use(securityHeaders);

// CORS: Locked down in production, open in dev for mobile testing
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:19006', 'exp://localhost:8081'];

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? ALLOWED_ORIGINS
        : true, // Allow all in dev, but log
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    credentials: true,
    maxAge: 86400 // 24h preflight cache
}));

// Body parsing with STRICT size limits (prevent DoS)
app.use(express.json({ limit: '10kb' })); // 10KB max for JSON bodies
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ---- Rate Limiting (5 tiers) — disabled in test environment ----
if (process.env.NODE_ENV !== 'test') {
    app.use('/api/', globalLimiter);
    app.use('/api/auth/', authLimiter);
    app.use('/api/auth/login', loginBruteForce); // Brute-force: 5 failed/15min
    app.use('/api/ai/', aiLimiter);

    // Write operation limiter on all mutating routes
    app.use('/api/drugs', writeLimiter);
    app.use('/api/prescriptions', writeLimiter);
    app.use('/api/products', writeLimiter);
    app.use('/api/orders', writeLimiter);
}

// ---- Audit Logging (SHA-256 hash chain) ----
initAuditChain();
app.use(auditMiddleware);

// ---- API Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/drugs', drugRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ai', aiRoutes);

// ---- Health Check ----
app.get('/api/health', (req, res) => {
    const { verifyAuditChain } = require('./src/middleware/audit');
    const auditIntegrity = verifyAuditChain();

    res.json({
        success: true,
        data: {
            status: 'healthy',
            service: 'SAFAR Chain Backend',
            version: '1.1.0',
            uptime: process.uptime(),
            security: {
                helmet: true,
                cors: process.env.NODE_ENV === 'production' ? 'locked' : 'dev-mode',
                rateLimiting: '5-tier (global, auth, brute-force, AI, write)',
                auditChain: auditIntegrity.valid ? 'INTACT' : 'TAMPERED',
                auditEntries: auditIntegrity.entries,
                guardrails: 'enabled',
                rag: 'enabled',
                bodyLimit: '10kb'
            }
        },
        error: null,
        meta: { timestamp: new Date().toISOString() }
    });
});

// ---- Audit Chain Integrity Endpoint (ADMIN only) ----
app.get('/api/security/audit-integrity', (req, res) => {
    // This would normally be behind auth, but for hackathon demo visibility
    const { verifyAuditChain } = require('./src/middleware/audit');
    const result = verifyAuditChain();
    res.json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() }
    });
});

// ---- 404 Handler ----
app.use((req, res) => {
    res.status(404).json({
        success: false,
        data: null,
        error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.path} not found` },
        meta: { timestamp: new Date().toISOString() }
    });
});

// ---- Global Error Handler ----
app.use(errorHandler);

module.exports = app;
