// ============================================
// SAFAR Chain — Express App Configuration
// Security hardened with Helmet, CORS, rate limiting
// ============================================
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { globalLimiter, aiLimiter, authLimiter } = require('./src/middleware/rateLimiter');
const { auditMiddleware } = require('./src/middleware/audit');
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
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || []
        : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24h preflight cache
}));

// Body parsing with size limit (prevent DoS)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// ---- Rate Limiting ----
app.use('/api/', globalLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/ai/', aiLimiter);

// ---- Audit Logging ----
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
    res.json({
        success: true,
        data: {
            status: 'healthy',
            service: 'SAFAR Chain Backend',
            version: '1.0.0',
            uptime: process.uptime()
        },
        error: null,
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
