// ============================================
// SAFAR Chain — Reviews Routes
// ============================================
const express = require('express');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');
const { success, error } = require('../utils/response');
const { getDb } = require('../db/db');

const router = express.Router();

const reviewSchema = z.object({
    orderId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000).optional()
});

// POST /api/reviews — CONSUMER, order must be DELIVERED
router.post('/', authenticate, requireRole('CONSUMER'), validate(reviewSchema), (req, res, next) => {
    try {
        const db = getDb();
        const { orderId, rating, comment } = req.body;

        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
        if (!order) { const err = error('NOT_FOUND', 'Order not found', 404); return res.status(404).json(err.responseBody); }
        if (order.consumer_id !== req.user.id) { const err = error('FORBIDDEN', 'Not your order', 403); return res.status(403).json(err.responseBody); }
        if (order.status !== 'DELIVERED') { const err = error('ORDER_NOT_DELIVERED', 'Can only review delivered orders', 400); return res.status(400).json(err.responseBody); }

        const existing = db.prepare('SELECT id FROM reviews WHERE order_id = ?').get(orderId);
        if (existing) { const err = error('ALREADY_REVIEWED', 'Order already reviewed', 400); return res.status(400).json(err.responseBody); }

        const id = uuidv4();
        db.prepare('INSERT INTO reviews (id, order_id, consumer_id, farmer_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)').run(id, orderId, req.user.id, order.farmer_id, rating, comment || null);

        res.status(201).json(success({ reviewId: id, rating }));
    } catch (e) { next(e); }
});

// GET /api/reviews/farmer/:farmerId — Public
router.get('/farmer/:farmerId', (req, res, next) => {
    try {
        const db = getDb();
        const reviews = db.prepare('SELECT r.*, u.name as consumer_name FROM reviews r LEFT JOIN users u ON r.consumer_id = u.id WHERE r.farmer_id = ? ORDER BY r.created_at DESC').all(req.params.farmerId);
        const avg = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as total FROM reviews WHERE farmer_id = ?').get(req.params.farmerId);
        res.json(success({ reviews, avgRating: avg.avg_rating ? +avg.avg_rating.toFixed(1) : 0, totalReviews: avg.total }));
    } catch (e) { next(e); }
});

module.exports = router;
