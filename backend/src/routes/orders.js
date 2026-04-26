// ============================================
// SAFAR Chain — Orders Routes
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
const COMMISSION_RATE = 0.10;

const orderSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
    deliveryOption: z.enum(['PICKUP', 'DELIVERY']),
    deliveryAddress: z.string().max(500).optional()
});

const VALID_TRANSITIONS = {
    'PENDING': ['CONFIRMED', 'CANCELLED'],
    'CONFIRMED': ['PREPARING', 'CANCELLED'],
    'PREPARING': ['READY'],
    'READY': ['DELIVERED'],
    'DELIVERED': [],
    'CANCELLED': []
};

// POST /api/orders — CONSUMER
router.post('/', authenticate, requireRole('CONSUMER'), validate(orderSchema), (req, res, next) => {
    try {
        const db = getDb();
        const { productId, quantity, deliveryOption, deliveryAddress } = req.body;

        const product = db.prepare("SELECT * FROM products WHERE id = ? AND status = 'ACTIVE'").get(productId);
        if (!product) { const err = error('NOT_FOUND', 'Product not found or not active', 404); return res.status(404).json(err.responseBody); }
        if (quantity > product.quantity_available) { const err = error('INSUFFICIENT_STOCK', `Only ${product.quantity_available} available`, 400); return res.status(400).json(err.responseBody); }
        if (deliveryOption === 'DELIVERY' && !deliveryAddress) { const err = error('VALIDATION_ERROR', 'Delivery address required for delivery', 400); return res.status(400).json(err.responseBody); }

        const totalPrice = +(product.price_per_unit * quantity).toFixed(2);
        const commission = +(totalPrice * COMMISSION_RATE).toFixed(2);
        const farmerPayout = +(totalPrice - commission).toFixed(2);
        const id = uuidv4();

        const trx = db.transaction(() => {
            db.prepare(`INSERT INTO orders (id, product_id, consumer_id, farmer_id, quantity, total_price, commission, farmer_payout, delivery_option, delivery_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, productId, req.user.id, product.farmer_id, quantity, totalPrice, commission, farmerPayout, deliveryOption, deliveryAddress || null);
            const newQty = product.quantity_available - quantity;
            db.prepare('UPDATE products SET quantity_available = ?, status = ? WHERE id = ?').run(newQty, newQty <= 0 ? 'SOLD_OUT' : 'ACTIVE', productId);
        });
        trx();

        res.status(201).json(success({ orderId: id, totalPrice, commission, farmerPayout, status: 'PENDING' }));
    } catch (e) { next(e); }
});

// GET /api/orders/:id — owner consumer OR farmer
router.get('/:id', authenticate, (req, res, next) => {
    try {
        const db = getDb();
        const order = db.prepare('SELECT o.*, p.title as product_title FROM orders o LEFT JOIN products p ON o.product_id = p.id WHERE o.id = ?').get(req.params.id);
        if (!order) { const err = error('NOT_FOUND', 'Order not found', 404); return res.status(404).json(err.responseBody); }
        if (order.consumer_id !== req.user.id && order.farmer_id !== req.user.id && req.user.role !== 'ADMIN') { const err = error('FORBIDDEN', 'Access denied', 403); return res.status(403).json(err.responseBody); }
        res.json(success({ order }));
    } catch (e) { next(e); }
});

// PUT /api/orders/:id/status — FARMER
router.put('/:id/status', authenticate, requireRole('FARMER'), (req, res, next) => {
    try {
        const { status } = req.body;
        if (!status) { const err = error('VALIDATION_ERROR', 'Status required', 400); return res.status(400).json(err.responseBody); }
        const db = getDb();
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
        if (!order) { const err = error('NOT_FOUND', 'Order not found', 404); return res.status(404).json(err.responseBody); }
        if (order.farmer_id !== req.user.id) { const err = error('FORBIDDEN', 'Not your order', 403); return res.status(403).json(err.responseBody); }

        const allowed = VALID_TRANSITIONS[order.status] || [];
        if (!allowed.includes(status)) { const err = error('INVALID_TRANSITION', `Cannot transition from ${order.status} to ${status}`, 400); return res.status(400).json(err.responseBody); }

        db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
        res.json(success({ orderId: req.params.id, previousStatus: order.status, newStatus: status }));
    } catch (e) { next(e); }
});

// GET /api/orders — list own orders
router.get('/', authenticate, (req, res, next) => {
    try {
        const db = getDb();
        let orders;
        if (req.user.role === 'CONSUMER') {
            orders = db.prepare('SELECT o.*, p.title as product_title FROM orders o LEFT JOIN products p ON o.product_id = p.id WHERE o.consumer_id = ? ORDER BY o.created_at DESC').all(req.user.id);
        } else if (req.user.role === 'FARMER') {
            orders = db.prepare('SELECT o.*, p.title as product_title FROM orders o LEFT JOIN products p ON o.product_id = p.id WHERE o.farmer_id = ? ORDER BY o.created_at DESC').all(req.user.id);
        } else {
            orders = db.prepare('SELECT o.*, p.title as product_title FROM orders o LEFT JOIN products p ON o.product_id = p.id ORDER BY o.created_at DESC LIMIT 100').all();
        }
        res.json(success({ orders }));
    } catch (e) { next(e); }
});

module.exports = router;
