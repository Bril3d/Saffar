// ============================================
// SAFAR Chain — Products Routes (Marketplace)
// ============================================
const express = require('express');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');
const { success, error } = require('../utils/response');
const { getDb } = require('../db/db');

const router = express.Router();

const productSchema = z.object({
    lotId: z.string().min(1).max(50),
    title: z.string().min(2).max(200),
    description: z.string().max(2000).optional(),
    category: z.enum(['EGGS', 'POULTRY_LIVE', 'POULTRY_MEAT', 'DAIRY', 'HONEY', 'RED_MEAT']),
    pricePerUnit: z.number().positive(),
    unit: z.enum(['KG', 'PIECE', 'LITER', 'DOZEN']),
    quantityAvailable: z.number().int().positive(),
    deliveryOptions: z.enum(['PICKUP', 'DELIVERY', 'BOTH']),
    locationAddress: z.string().max(300).optional(),
    locationLat: z.number().min(-90).max(90).optional(),
    locationLng: z.number().min(-180).max(180).optional()
});

const updateSchema = z.object({
    title: z.string().min(2).max(200).optional(),
    description: z.string().max(2000).optional(),
    pricePerUnit: z.number().positive().optional(),
    quantityAvailable: z.number().int().min(0).optional(),
    deliveryOptions: z.enum(['PICKUP', 'DELIVERY', 'BOTH']).optional(),
    status: z.enum(['ACTIVE', 'SOLD_OUT', 'PAUSED']).optional()
});

// GET /api/products — Public, paginated, filterable
router.get('/', optionalAuth, (req, res, next) => {
    try {
        const db = getDb();
        const { category, governorate, sort, page = '1', limit = '20' } = req.query;
        const p = Math.max(1, parseInt(page));
        const l = Math.min(50, Math.max(1, parseInt(limit) || 20));
        const offset = (p - 1) * l;

        let where = "WHERE p.status = 'ACTIVE'";
        const params = [];
        if (category) { where += ' AND p.category = ?'; params.push(category); }
        if (governorate) { where += ' AND u.governorate = ?'; params.push(governorate); }

        let orderBy = 'ORDER BY p.created_at DESC';
        if (sort === 'price') orderBy = 'ORDER BY p.price_per_unit ASC';

        const total = db.prepare(`SELECT COUNT(*) as c FROM products p LEFT JOIN users u ON p.farmer_id = u.id ${where}`).get(...params).c;
        const products = db.prepare(`
            SELECT p.*, u.name as farmer_name, u.governorate as farmer_governorate,
                   (SELECT COALESCE(AVG(r.rating),0) FROM reviews r WHERE r.farmer_id = p.farmer_id) as avg_rating
            FROM products p
            LEFT JOIN users u ON p.farmer_id = u.id
            ${where} ${orderBy} LIMIT ? OFFSET ?
        `).all(...params, l, offset);

        res.json(success({ products, pagination: { page: p, limit: l, total, pages: Math.ceil(total / l) } }));
    } catch (e) { next(e); }
});

// GET /api/products/:id — Public
router.get('/:id', optionalAuth, (req, res, next) => {
    try {
        const db = getDb();
        const product = db.prepare(`
            SELECT p.*, u.name as farmer_name, u.governorate as farmer_governorate
            FROM products p LEFT JOIN users u ON p.farmer_id = u.id WHERE p.id = ?
        `).get(req.params.id);
        if (!product) { const err = error('NOT_FOUND', 'Product not found', 404); return res.status(404).json(err.responseBody); }
        res.json(success({ product }));
    } catch (e) { next(e); }
});

// POST /api/products — FARMER only, lot must be certified
router.post('/', authenticate, requireRole('FARMER'), validate(productSchema), (req, res, next) => {
    try {
        const db = getDb();
        const { lotId, title, description, category, pricePerUnit, unit, quantityAvailable, deliveryOptions, locationAddress, locationLat, locationLng } = req.body;

        // Verify lot is certified
        const cert = db.prepare('SELECT * FROM lot_certifications WHERE lot_id = ? AND eligible = 1').get(lotId);
        if (!cert) { const err = error('LOT_NOT_CERTIFIED', 'Lot must be certified before publishing a product', 400); return res.status(400).json(err.responseBody); }

        const id = uuidv4();
        db.prepare(`
            INSERT INTO products (id, farmer_id, lot_id, certificate_hash, title, description, category, price_per_unit, unit, quantity_available, delivery_options, location_address, location_lat, location_lng)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, req.user.id, lotId, cert.certificate_hash, title, description || null, category, pricePerUnit, unit, quantityAvailable, deliveryOptions, locationAddress || null, locationLat || null, locationLng || null);

        res.status(201).json(success({ productId: id, status: 'ACTIVE' }));
    } catch (e) { next(e); }
});

// PUT /api/products/:id — FARMER, must own
router.put('/:id', authenticate, requireRole('FARMER'), validate(updateSchema), (req, res, next) => {
    try {
        const db = getDb();
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
        if (!product) { const err = error('NOT_FOUND', 'Product not found', 404); return res.status(404).json(err.responseBody); }
        if (product.farmer_id !== req.user.id) { const err = error('FORBIDDEN', 'You do not own this product', 403); return res.status(403).json(err.responseBody); }

        const fields = Object.entries(req.body).filter(([_, v]) => v !== undefined);
        if (fields.length === 0) { return res.json(success({ message: 'No changes' })); }

        const columnMap = { title: 'title', description: 'description', pricePerUnit: 'price_per_unit', quantityAvailable: 'quantity_available', deliveryOptions: 'delivery_options', status: 'status' };
        const sets = fields.map(([k]) => `${columnMap[k] || k} = ?`).join(', ');
        const values = fields.map(([_, v]) => v);
        db.prepare(`UPDATE products SET ${sets} WHERE id = ?`).run(...values, req.params.id);

        res.json(success({ updated: true }));
    } catch (e) { next(e); }
});

// DELETE /api/products/:id — FARMER, must own (soft delete)
router.delete('/:id', authenticate, requireRole('FARMER'), (req, res, next) => {
    try {
        const db = getDb();
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
        if (!product) { const err = error('NOT_FOUND', 'Product not found', 404); return res.status(404).json(err.responseBody); }
        if (product.farmer_id !== req.user.id) { const err = error('FORBIDDEN', 'You do not own this product', 403); return res.status(403).json(err.responseBody); }
        db.prepare("UPDATE products SET status = 'PAUSED' WHERE id = ?").run(req.params.id);
        res.json(success({ deleted: true, status: 'PAUSED' }));
    } catch (e) { next(e); }
});

module.exports = router;
