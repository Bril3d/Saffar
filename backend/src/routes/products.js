// ============================================
// SAFAR Chain — Products Routes (Marketplace)
// ============================================
const express = require('express');
const { z } = require('zod');
const { v4: uuidv4 } = require('uuid');
const { createHash } = require('crypto');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');
const { success, error } = require('../utils/response');
const { getDb } = require('../db/db');
const sdk = require('../sdk/safar-sdk');

const router = express.Router();

function buildTraceabilityCertificateHash({ lotId, farmerId, latestWithdrawalEnd, totalTreatments }) {
    const digest = createHash('sha256')
        .update(`${lotId}|${farmerId}|${latestWithdrawalEnd || ''}|${totalTreatments}`)
        .digest('hex');
    return `trace:${digest}`;
}

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

// GET /api/products/farmer/publishable-lots — FARMER helper endpoint
router.get('/farmer/publishable-lots', authenticate, requireRole('FARMER'), (req, res, next) => {
    try {
        const db = getDb();
        const lots = db.prepare(`
            SELECT
                p.animal_lot_id as lot_id,
                COUNT(*) as total_treatments,
                SUM(CASE WHEN p.administered = 1 THEN 1 ELSE 0 END) as administered_treatments,
                MAX(p.withdrawal_end) as latest_withdrawal_end,
                SUM(CASE WHEN datetime(p.withdrawal_end) > datetime('now') THEN 1 ELSE 0 END) as active_withdrawal_count,
                lc.certificate_hash as certificate_hash,
                CASE WHEN lc.certificate_hash IS NOT NULL THEN 1 ELSE 0 END as certified
            FROM prescriptions_offchain p
            LEFT JOIN lot_certifications lc ON lc.lot_id = p.animal_lot_id AND lc.eligible = 1
            WHERE p.farmer_id = ?
            GROUP BY p.animal_lot_id, lc.certificate_hash
            ORDER BY MAX(p.created_at) DESC
        `).all(req.user.id);

        const normalized = lots.map((lot) => {
            const hasTreatments = Number(lot.total_treatments || 0) > 0;
            const allAdministered = Number(lot.total_treatments || 0) === Number(lot.administered_treatments || 0);
            const noActiveWithdrawal = Number(lot.active_withdrawal_count || 0) === 0;
            const isCertified = !!lot.certificate_hash;
            return {
                lotId: lot.lot_id,
                totalTreatments: Number(lot.total_treatments || 0),
                administeredTreatments: Number(lot.administered_treatments || 0),
                latestWithdrawalEnd: lot.latest_withdrawal_end || null,
                eligibleForMarketplace: isCertified || (hasTreatments && allAdministered && noActiveWithdrawal),
                certified: isCertified,
                certificateHash: lot.certificate_hash || null
            };
        });

        res.json(success({ lots: normalized }));
    } catch (e) { next(e); }
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
                   lc.tx_hash as lot_tx_hash, lc.certified_at as lot_certified_at,
                   CASE WHEN lc.certificate_hash IS NOT NULL THEN 1 ELSE 0 END as on_chain_certified,
                   (SELECT COUNT(*) FROM prescriptions_offchain pr WHERE pr.animal_lot_id = p.lot_id) as total_treatments,
                   (SELECT COUNT(*) FROM prescriptions_offchain pr WHERE pr.animal_lot_id = p.lot_id AND pr.administered = 1) as administered_treatments,
                   (SELECT MAX(pr.withdrawal_end) FROM prescriptions_offchain pr WHERE pr.animal_lot_id = p.lot_id) as latest_withdrawal_end,
                   (SELECT COUNT(*) FROM prescriptions_offchain pr WHERE pr.animal_lot_id = p.lot_id AND datetime(pr.withdrawal_end) > datetime('now')) as active_withdrawal_count,
                   (SELECT COALESCE(AVG(r.rating),0) FROM reviews r WHERE r.farmer_id = p.farmer_id) as avg_rating
            FROM products p
            LEFT JOIN users u ON p.farmer_id = u.id
            LEFT JOIN lot_certifications lc ON lc.lot_id = p.lot_id AND lc.eligible = 1
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
            SELECT p.*, u.name as farmer_name, u.governorate as farmer_governorate,
                   lc.tx_hash as lot_tx_hash, lc.certified_at as lot_certified_at,
                   CASE WHEN lc.certificate_hash IS NOT NULL THEN 1 ELSE 0 END as on_chain_certified,
                   (SELECT COUNT(*) FROM prescriptions_offchain pr WHERE pr.animal_lot_id = p.lot_id) as total_treatments,
                   (SELECT COUNT(*) FROM prescriptions_offchain pr WHERE pr.animal_lot_id = p.lot_id AND pr.administered = 1) as administered_treatments,
                   (SELECT MAX(pr.withdrawal_end) FROM prescriptions_offchain pr WHERE pr.animal_lot_id = p.lot_id) as latest_withdrawal_end,
                   (SELECT COUNT(*) FROM prescriptions_offchain pr WHERE pr.animal_lot_id = p.lot_id AND datetime(pr.withdrawal_end) > datetime('now')) as active_withdrawal_count
            FROM products p
            LEFT JOIN users u ON p.farmer_id = u.id
            LEFT JOIN lot_certifications lc ON lc.lot_id = p.lot_id AND lc.eligible = 1
            WHERE p.id = ?
        `).get(req.params.id);
        if (!product) { const err = error('NOT_FOUND', 'Product not found', 404); return res.status(404).json(err.responseBody); }
        res.json(success({ product }));
    } catch (e) { next(e); }
});

// POST /api/products — FARMER only, lot must be certified
router.post('/', authenticate, requireRole('FARMER'), validate(productSchema), async (req, res, next) => {
    try {
        const db = getDb();
        const { lotId, title, description, category, pricePerUnit, unit, quantityAvailable, deliveryOptions, locationAddress, locationLat, locationLng } = req.body;

        // Verify lot belongs to farmer and is fully administered/withdrawal-complete,
        // unless already certified on-chain by slaughterhouse.
        const lotStats = db.prepare(`
            SELECT
                COUNT(*) as total_treatments,
                SUM(CASE WHEN administered = 1 THEN 1 ELSE 0 END) as administered_treatments,
                MAX(withdrawal_end) as latest_withdrawal_end,
                SUM(CASE WHEN datetime(withdrawal_end) > datetime('now') THEN 1 ELSE 0 END) as active_withdrawal_count
            FROM prescriptions_offchain
            WHERE farmer_id = ? AND animal_lot_id = ?
        `).get(req.user.id, lotId);

        if (!lotStats || Number(lotStats.total_treatments || 0) === 0) {
            const err = error('LOT_NOT_FOUND', 'No lot history found for this farmer and lot', 404);
            return res.status(404).json(err.responseBody);
        }

        const cert = db.prepare('SELECT * FROM lot_certifications WHERE lot_id = ? AND eligible = 1').get(lotId);
        const allAdministered = Number(lotStats.administered_treatments || 0) === Number(lotStats.total_treatments || 0);
        const noActiveWithdrawal = Number(lotStats.active_withdrawal_count || 0) === 0;
        const eligibleWithoutCertification = allAdministered && noActiveWithdrawal;

        if (!cert && !eligibleWithoutCertification) {
            const err = error(
                'LOT_NOT_ELIGIBLE_FOR_MARKETPLACE',
                'Lot must be fully administered and outside withdrawal period before publishing',
                400
            );
            return res.status(400).json(err.responseBody);
        }

        const certificateHash = cert?.certificate_hash || buildTraceabilityCertificateHash({
            lotId,
            farmerId: req.user.id,
            latestWithdrawalEnd: lotStats.latest_withdrawal_end,
            totalTreatments: Number(lotStats.total_treatments || 0)
        });

        if (cert?.certificate_hash) {
            try {
                const verification = await sdk.verifyCertificate(cert.certificate_hash);
                if (!verification?.valid) {
                    const err = error('CERTIFICATE_INVALID', 'On-chain lot certificate is invalid', 400);
                    return res.status(400).json(err.responseBody);
                }
            } catch {
                const err = error('CHAIN_VERIFICATION_FAILED', 'Unable to verify lot certificate on-chain', 503);
                return res.status(503).json(err.responseBody);
            }
        }

        const id = uuidv4();
        db.prepare(`
            INSERT INTO products (id, farmer_id, lot_id, certificate_hash, title, description, category, price_per_unit, unit, quantity_available, delivery_options, location_address, location_lat, location_lng)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, req.user.id, lotId, certificateHash, title, description || null, category, pricePerUnit, unit, quantityAvailable, deliveryOptions, locationAddress || null, locationLat || null, locationLng || null);

        res.status(201).json(success({ productId: id, status: 'ACTIVE', certificateHash }));
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
