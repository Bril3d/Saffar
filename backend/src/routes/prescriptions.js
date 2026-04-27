// ============================================
// SAFAR Chain — Prescription Routes
// ============================================
const express = require('express');
const { z } = require('zod');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');
const { success, error } = require('../utils/response');
const { getDb } = require('../db/db');
const sdk = require('../sdk/safar-sdk');

const router = express.Router();

const prescriptionSchema = z.object({
    saleId: z.string().min(1),
    farmerId: z.string().min(1),
    animalLotId: z.string().min(1).max(50),
    diagnosis: z.string().min(3).max(500),
    dosage: z.number().positive(),
    withdrawalDays: z.number().int().min(0).max(90)
});

// POST /api/prescriptions — VET only
router.post('/', authenticate, requireRole('VET'), validate(prescriptionSchema), async (req, res, next) => {
    try {
        const { saleId, farmerId, animalLotId, diagnosis, dosage, withdrawalDays } = req.body;
        const db = getDb();

        const farmer = db.prepare('SELECT id, wallet_address FROM users WHERE id = ? AND role = ?').get(farmerId, 'FARMER');
        if (!farmer) {
            const err = error('FARMER_NOT_FOUND', 'Farmer not found or not registered', 404);
            return res.status(404).json(err.responseBody);
        }

        const sale = db.prepare('SELECT * FROM drug_sales_offchain WHERE sale_id = ?').get(saleId);
        if (!sale) {
            const err = error('SALE_NOT_FOUND', 'Drug sale not found', 404);
            return res.status(404).json(err.responseBody);
        }
        if (sale.vet_id !== req.user.id) {
            const err = error('SALE_NOT_YOURS', 'This drug sale does not belong to you', 403);
            return res.status(403).json(err.responseBody);
        }

        // Create prescription on-chain (async)
        const chainResult = await sdk.createPrescription({
            saleId,
            vetAddress: req.user.walletAddress,
            farmerAddress: farmer.wallet_address,
            animalLotId,
            diagnosis,
            dosage,
            withdrawalDays
        });

        db.prepare(`INSERT INTO prescriptions_offchain 
            (rx_id, sale_id, vet_id, farmer_id, animal_lot_id, diagnosis, dosage, withdrawal_days, withdrawal_end, start_date, tx_hash) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
            chainResult.rxId, saleId, req.user.id, farmerId, animalLotId,
            diagnosis, dosage, chainResult.effectiveWithdrawal,
            chainResult.withdrawalEnd, new Date().toISOString(), chainResult.txHash
        );

        res.status(201).json(success({
            rxId: chainResult.rxId,
            txHash: chainResult.txHash,
            withdrawalEnd: chainResult.withdrawalEnd,
            effectiveWithdrawalDays: chainResult.effectiveWithdrawal,
            note: chainResult.effectiveWithdrawal > withdrawalDays
                ? `Withdrawal increased to ${chainResult.effectiveWithdrawal} days (legal minimum for ${sale.atc_code})`
                : undefined
        }, { txHash: chainResult.txHash }));
    } catch (e) { next(e); }
});

// GET /api/prescriptions/vet/mine — VET: list own prescriptions
// MUST be before /:id to avoid param collision
router.get('/vet/mine', authenticate, requireRole('VET'), (req, res, next) => {
    try {
        const db = getDb();
        const prescriptions = db.prepare(
            'SELECT * FROM prescriptions_offchain WHERE vet_id = ? ORDER BY created_at DESC'
        ).all(req.user.id);
        res.json(success({ prescriptions }));
    } catch (e) { next(e); }
});

// GET /api/prescriptions/farm/:farmerId — MUST be before /:id
// (already defined below, but we keep the ordering note here)

// GET /api/prescriptions/:id — any authenticated
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const db = getDb();
        const rx = db.prepare('SELECT * FROM prescriptions_offchain WHERE rx_id = ?').get(req.params.id);
        if (!rx) {
            const err = error('NOT_FOUND', 'Prescription not found', 404);
            return res.status(404).json(err.responseBody);
        }

        const chainData = await sdk.getPrescription(req.params.id);
        res.json(success({
            ...rx,
            chainData: chainData ? {
                administered: chainData.administered,
                adminTimestamp: chainData.adminTimestamp !== '0' ? new Date(Number(chainData.adminTimestamp) * 1000).toISOString() : null,
                withdrawalEnd: new Date(Number(chainData.withdrawalEnd) * 1000).toISOString()
            } : null
        }));
    } catch (e) { next(e); }
});

// PUT /api/prescriptions/:id/confirm — FARMER, must own
router.put('/:id/confirm', authenticate, requireRole('FARMER'), async (req, res, next) => {
    try {
        const db = getDb();
        const rx = db.prepare('SELECT * FROM prescriptions_offchain WHERE rx_id = ?').get(req.params.id);
        if (!rx) {
            const err = error('NOT_FOUND', 'Prescription not found', 404);
            return res.status(404).json(err.responseBody);
        }
        if (rx.farmer_id !== req.user.id) {
            const err = error('FORBIDDEN', 'You can only confirm your own prescriptions', 403);
            return res.status(403).json(err.responseBody);
        }
        if (rx.administered) {
            const err = error('ALREADY_CONFIRMED', 'Already confirmed', 400);
            return res.status(400).json(err.responseBody);
        }

        // Confirm on-chain — pass farmer wallet address for signing
        const chainResult = await sdk.confirmAdministration(req.params.id, req.user.walletAddress);
        db.prepare('UPDATE prescriptions_offchain SET administered = 1, admin_timestamp = ? WHERE rx_id = ?')
            .run(chainResult.adminTimestamp, req.params.id);

        res.json(success({
            confirmed: true,
            txHash: chainResult.txHash,
            adminTimestamp: chainResult.adminTimestamp,
            withdrawalEnd: rx.withdrawal_end
        }, { txHash: chainResult.txHash }));
    } catch (e) { next(e); }
});

// GET /api/prescriptions/farm/:farmerId
router.get('/farm/:farmerId', authenticate, requireRole('FARMER', 'VET', 'ADMIN'), (req, res, next) => {
    try {
        if (req.user.role === 'FARMER' && req.user.id !== req.params.farmerId) {
            const err = error('FORBIDDEN', 'You can only view your own prescriptions', 403);
            return res.status(403).json(err.responseBody);
        }
        const db = getDb();
        const prescriptions = db.prepare(
            'SELECT * FROM prescriptions_offchain WHERE farmer_id = ? ORDER BY created_at DESC'
        ).all(req.params.farmerId);
        res.json(success({ prescriptions }));
    } catch (e) { next(e); }
});

module.exports = router;
