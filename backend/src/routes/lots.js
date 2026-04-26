// ============================================
// SAFAR Chain — Lot Routes (Eligibility, Certification, Traceability)
// ============================================
const express = require('express');
const { z } = require('zod');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');
const { success, error } = require('../utils/response');
const { getDb } = require('../db/db');
const sdk = require('../sdk/safar-sdk');

const router = express.Router();

const eligibilitySchema = z.object({
    rxId: z.string().min(1, 'rxId is required to check eligibility')
});

// GET /api/lots/:lotId/eligibility?rxId=X — SLAUGHTERHOUSE
router.get('/:lotId/eligibility', authenticate, requireRole('SLAUGHTERHOUSE'), async (req, res, next) => {
    try {
        const rxId = req.query.rxId;
        if (!rxId) {
            const err = error('MISSING_RX_ID', 'rxId query param is required', 400);
            return res.status(400).json(err.responseBody);
        }

        const result = await sdk.checkEligibility(req.params.lotId, rxId);
        const db = getDb();
        const prescriptions = db.prepare(
            'SELECT rx_id, diagnosis, withdrawal_end, administered FROM prescriptions_offchain WHERE animal_lot_id = ?'
        ).all(req.params.lotId);

        res.json(success({ lotId: req.params.lotId, ...result, prescriptions }));
    } catch (e) { next(e); }
});

const certifySchema = z.object({
    rxId: z.string().min(1, 'rxId is required to certify a lot')
});

// POST /api/lots/:lotId/certify — SLAUGHTERHOUSE
router.post('/:lotId/certify', authenticate, requireRole('SLAUGHTERHOUSE'), validate(certifySchema), async (req, res, next) => {
    try {
        const { rxId } = req.body;
        const chainResult = await sdk.certifyLot(req.params.lotId, rxId, req.user.walletAddress);
        const db = getDb();

        db.prepare(`
            INSERT OR REPLACE INTO lot_certifications (lot_id, slaughterhouse_id, certificate_hash, eligible, tx_hash)
            VALUES (?, ?, ?, 1, ?)
        `).run(req.params.lotId, req.user.id, chainResult.certificateHash, chainResult.txHash);

        // Update any products linked to this lot
        db.prepare('UPDATE products SET certificate_hash = ? WHERE lot_id = ?')
            .run(chainResult.certificateHash, req.params.lotId);

        res.status(201).json(success({
            lotId: req.params.lotId,
            certificateHash: chainResult.certificateHash,
            txHash: chainResult.txHash
        }, { txHash: chainResult.txHash }));
    } catch (e) {
        if (e.message && (e.message.includes('not eligible') || e.message.includes('Not eligible'))) {
            const err = error('LOT_NOT_ELIGIBLE', e.message, 400);
            return res.status(400).json(err.responseBody);
        }
        next(e);
    }
});

// GET /api/lots/:lotId/trace — PUBLIC (privacy-filtered)
router.get('/:lotId/trace', optionalAuth, async (req, res, next) => {
    try {
        const db = getDb();

        // Get off-chain prescription data for this lot
        const prescriptionsOffchain = db.prepare(
            'SELECT p.rx_id, p.animal_lot_id, p.diagnosis, p.withdrawal_end, p.start_date, p.administered, d.atc_code, d.aware_class ' +
            'FROM prescriptions_offchain p ' +
            'LEFT JOIN drug_sales_offchain d ON p.sale_id = d.sale_id ' +
            'WHERE p.animal_lot_id = ?'
        ).all(req.params.lotId);

        const cert = db.prepare('SELECT * FROM lot_certifications WHERE lot_id = ?').get(req.params.lotId);

        // PRIVACY FILTER: strip PII for public access
        const safePrescriptions = prescriptionsOffchain.map(p => ({
            antibiotic: p.atc_code || 'Unknown',
            awareClass: p.aware_class || 'Unknown',
            treatmentStart: p.start_date || null,
            withdrawalEnd: p.withdrawal_end || null,
            administered: !!p.administered,
            // STRIPPED: vet name, farmer name, wallet addresses, exact dosage, batch numbers
        }));

        // Trust score calculation
        let trustScore = 50; // base
        if (prescriptionsOffchain.length > 0) trustScore += 10;
        if (prescriptionsOffchain.every(p => p.administered)) trustScore += 15;
        if (cert) trustScore += 25;
        trustScore = Math.min(trustScore, 100);

        // Try to get on-chain verification if cert exists
        let onChainVerification = null;
        if (cert && cert.certificate_hash) {
            try {
                onChainVerification = await sdk.verifyCertificate(cert.certificate_hash);
            } catch {}
        }

        res.json(success({
            lotId: req.params.lotId,
            prescriptions: safePrescriptions,
            certification: cert ? {
                certified: true,
                certificateHash: cert.certificate_hash,
                certifiedAt: cert.certified_at,
                onChainValid: onChainVerification?.valid ?? null
            } : { certified: false },
            trustScore,
            verifiedOnBlockchain: !!onChainVerification?.valid
        }));
    } catch (e) { next(e); }
});

// GET /api/lots/:lotId/certificate/:hash/verify — PUBLIC
router.get('/:lotId/certificate/:hash/verify', async (req, res, next) => {
    try {
        const result = await sdk.verifyCertificate(req.params.hash);
        res.json(success({
            lotId: req.params.lotId,
            certificateHash: req.params.hash,
            valid: result.valid
        }));
    } catch (e) { next(e); }
});

module.exports = router;
