// ============================================
// SAFAR Chain — Drug Sales Routes
// POST /api/drugs/sale    (PHARMACY)
// GET  /api/drugs/sale/:id (authenticated)
// ============================================
const express = require('express');
const { z } = require('zod');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');
const { success, error } = require('../utils/response');
const { getDb } = require('../db/db');
const sdk = require('../sdk/safar-sdk');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const drugSaleSchema = z.object({
    vetId: z.string().min(1),
    atcCode: z.string().regex(/^J01[A-Z]{2}[0-9]{2}$/, 'Invalid ATC code format'),
    batchNumber: z.string().min(1).max(50),
    quantity: z.number().int().positive(),
    awareClass: z.enum(['Access', 'Watch', 'Reserve'])
});

/**
 * POST /api/drugs/sale
 * Register a drug sale — Pharmacy only
 */
router.post('/sale', authenticate, requireRole('PHARMACY'), validate(drugSaleSchema), (req, res, next) => {
    try {
        const { vetId, atcCode, batchNumber, quantity, awareClass } = req.body;
        const db = getDb();

        // Verify vet exists and is registered
        const vet = db.prepare('SELECT id, wallet_address FROM users WHERE id = ? AND role = ?').get(vetId, 'VET');
        if (!vet) {
            const err = error('VET_NOT_FOUND', 'Veterinarian not found or not registered', 404);
            return res.status(404).json(err.responseBody);
        }

        // Register on chain
        const chainResult = sdk.registerSale({
            pharmacyAddress: req.user.walletAddress || req.user.id,
            vetAddress: vet.wallet_address || vet.id,
            atcCode,
            batchNumber,
            quantity,
            awareClass
        });

        // Store off-chain for fast queries
        db.prepare(`
            INSERT INTO drug_sales_offchain (sale_id, pharmacy_id, vet_id, atc_code, batch_number, quantity, aware_class, tx_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(chainResult.saleId, req.user.id, vetId, atcCode, batchNumber, quantity, awareClass, chainResult.txHash);

        res.status(201).json(success({
            saleId: chainResult.saleId,
            txHash: chainResult.txHash,
            atcCode,
            awareClass,
            quantity
        }, { txHash: chainResult.txHash }));
    } catch (e) {
        next(e);
    }
});

/**
 * GET /api/drugs/sale/:id
 * Get sale details — any authenticated user
 */
router.get('/sale/:id', authenticate, (req, res, next) => {
    try {
        const db = getDb();
        const sale = db.prepare('SELECT * FROM drug_sales_offchain WHERE sale_id = ?').get(req.params.id);

        if (!sale) {
            const err = error('SALE_NOT_FOUND', 'Drug sale not found', 404);
            return res.status(404).json(err.responseBody);
        }

        // Also get on-chain data
        const chainData = sdk.getSale(req.params.id);

        res.json(success({
            ...sale,
            chainData: chainData ? {
                timestamp: chainData.timestamp,
                txHash: chainData.txHash
            } : null
        }));
    } catch (e) {
        next(e);
    }
});

module.exports = router;
