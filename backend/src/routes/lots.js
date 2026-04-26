// ============================================
// SAFAR Chain — Lot Routes (Eligibility, Certification, Traceability)
// ============================================
const express = require('express');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { success, error } = require('../utils/response');
const { getDb } = require('../db/db');
const sdk = require('../sdk/safar-sdk');

const router = express.Router();

// GET /api/lots/:lotId/eligibility — SLAUGHTERHOUSE
router.get('/:lotId/eligibility', authenticate, requireRole('SLAUGHTERHOUSE'), (req, res, next) => {
    try {
        const result = sdk.checkEligibility(req.params.lotId);
        const db = getDb();
        const prescriptions = db.prepare(
            'SELECT rx_id, diagnosis, withdrawal_end, administered FROM prescriptions_offchain WHERE animal_lot_id = ?'
        ).all(req.params.lotId);

        res.json(success({ lotId: req.params.lotId, ...result, prescriptions }));
    } catch (e) { next(e); }
});

// POST /api/lots/:lotId/certify — SLAUGHTERHOUSE
router.post('/:lotId/certify', authenticate, requireRole('SLAUGHTERHOUSE'), (req, res, next) => {
    try {
        const chainResult = sdk.certifyLot(req.params.lotId, req.user.walletAddress || req.user.id);
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
        if (e.message && e.message.includes('not eligible')) {
            const err = error('LOT_NOT_ELIGIBLE', e.message, 400);
            return res.status(400).json(err.responseBody);
        }
        next(e);
    }
});

// GET /api/lots/:lotId/trace — PUBLIC (privacy-filtered)
router.get('/:lotId/trace', optionalAuth, (req, res, next) => {
    try {
        const db = getDb();
        const traceData = sdk.getLotTraceability(req.params.lotId);
        const cert = db.prepare('SELECT * FROM lot_certifications WHERE lot_id = ?').get(req.params.lotId);

        // PRIVACY FILTER: strip PII for public access
        const safePrescriptions = traceData.prescriptions.map(({ prescription, drugSale }) => ({
            antibiotic: drugSale?.atcCode || 'Unknown',
            awareClass: drugSale?.awareClass || 'Unknown',
            treatmentStart: prescription.startDate ? new Date(prescription.startDate).toISOString() : null,
            withdrawalEnd: prescription.withdrawalEnd ? new Date(prescription.withdrawalEnd).toISOString() : null,
            administered: prescription.administered,
            // STRIPPED: vet name, farmer name, wallet addresses, exact dosage, batch numbers
        }));

        // Trust score calculation
        let trustScore = 50; // base
        if (traceData.prescriptions.length > 0) trustScore += 10;
        if (traceData.prescriptions.every(p => p.prescription.administered)) trustScore += 15;
        if (cert) trustScore += 25;
        trustScore = Math.min(trustScore, 100);

        res.json(success({
            lotId: req.params.lotId,
            prescriptions: safePrescriptions,
            certification: cert ? {
                certified: true,
                certificateHash: cert.certificate_hash,
                certifiedAt: cert.certified_at
            } : { certified: false },
            trustScore,
            verifiedOnBlockchain: true
        }));
    } catch (e) { next(e); }
});

module.exports = router;
