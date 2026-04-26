// ============================================
// SAFAR Chain — Auth Routes
// POST /api/auth/register (Consumer only)
// POST /api/auth/login (All actors)
// ============================================
const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { z } = require('zod');
const { getDb } = require('../db/db');
const { generateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { success, error } = require('../utils/response');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// ---- Validation Schemas ----

const registerSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email().max(200),
    password: z.string().min(8).max(128)
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    phone: z.string().max(20).optional(),
    governorate: z.string().max(50).optional()
});

const loginSchema = z.object({
    email: z.string().email().max(200),
    password: z.string().min(1).max(128)
});

const walletLoginSchema = z.object({
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    signature: z.string(),
    message: z.string()
});

// ---- Routes ----

/**
 * POST /api/auth/register
 * Consumer self-registration only.
 * Blockchain actors are registered by ADMIN via AccessControl.
 */
router.post('/register', validate(registerSchema), async (req, res, next) => {
    try {
        const { name, email, password, phone, governorate } = req.body;
        const db = getDb();

        // Check if email already exists
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            const err = error('EMAIL_EXISTS', 'An account with this email already exists', 409);
            return res.status(409).json(err.responseBody);
        }

        const id = uuidv4();
        const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 12);

        db.prepare(`
            INSERT INTO users (id, role, name, email, password_hash, phone, governorate, verified)
            VALUES (?, 'CONSUMER', ?, ?, ?, ?, ?, 1)
        `).run(id, name, email, passwordHash, phone || null, governorate || null);

        const user = { id, role: 'CONSUMER', name, email };
        const token = generateToken({ id, role: 'CONSUMER' });

        logAudit(id, 'CONSUMER', 'REGISTER', '/api/auth/register', id, req);
        res.status(201).json(success({ token, user }));
    } catch (e) {
        next(e);
    }
});

/**
 * POST /api/auth/login
 * Consumer: email + password
 * Blockchain actors: same (wallet login is a future extension)
 */
router.post('/login', validate(loginSchema), async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const db = getDb();

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            logAudit(null, null, 'LOGIN_FAILED', '/api/auth/login', null, req, { email, reason: 'user_not_found' });
            const err = error('INVALID_CREDENTIALS', 'Invalid email or password', 401);
            return res.status(401).json(err.responseBody);
        }

        if (!user.password_hash) {
            const err = error('INVALID_CREDENTIALS', 'This account uses wallet authentication', 401);
            return res.status(401).json(err.responseBody);
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            logAudit(user.id, user.role, 'LOGIN_FAILED', '/api/auth/login', user.id, req, { reason: 'wrong_password' });
            const err = error('INVALID_CREDENTIALS', 'Invalid email or password', 401);
            return res.status(401).json(err.responseBody);
        }

        const token = generateToken(user);
        logAudit(user.id, user.role, 'LOGIN_SUCCESS', '/api/auth/login', user.id, req);

        res.json(success({
            token,
            user: {
                id: user.id,
                role: user.role,
                name: user.name,
                email: user.email,
                walletAddress: user.wallet_address
            }
        }));
    } catch (e) {
        next(e);
    }
});

/**
 * POST /api/auth/wallet-login
 * Blockchain actors: wallet signature verification (EIP-712 style)
 */
router.post('/wallet-login', validate(walletLoginSchema), async (req, res, next) => {
    try {
        const { walletAddress, signature, message } = req.body;
        const db = getDb();

        // In production, verify EIP-712 signature with ethers.js
        // For hackathon, we accept any signature from a registered wallet
        const user = db.prepare('SELECT * FROM users WHERE wallet_address = ?').get(walletAddress.toLowerCase());
        if (!user) {
            logAudit(null, null, 'WALLET_LOGIN_FAILED', '/api/auth/wallet-login', null, req, { walletAddress });
            const err = error('WALLET_NOT_REGISTERED', 'Wallet not registered in system', 401);
            return res.status(401).json(err.responseBody);
        }

        const token = generateToken(user);
        logAudit(user.id, user.role, 'WALLET_LOGIN_SUCCESS', '/api/auth/wallet-login', user.id, req);

        res.json(success({
            token,
            user: {
                id: user.id,
                role: user.role,
                name: user.name,
                walletAddress: user.wallet_address
            }
        }));
    } catch (e) {
        next(e);
    }
});

module.exports = router;
