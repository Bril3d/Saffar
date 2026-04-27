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
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const lotSchema = z.object({
    name: z.string().min(1),
    species: z.string().optional(),
    quantity: z.number().int().min(1).optional()
});

// POST /api/lots — FARMER only: Create a lot
router.post('/', authenticate, requireRole('FARMER'), validate(lotSchema), (req, res, next) => {
    try {
        const { name, species, quantity } = req.body;
        const db = getDb();
        const id = 'LOT-' + uuidv4().substring(0, 8).toUpperCase();
        
        db.prepare(`
            INSERT INTO animal_lots (id, farmer_id, name, species, quantity)
            VALUES (?, ?, ?, ?, ?)
        `).run(id, req.user.id, name, species || null, quantity || null);

        res.status(201).json(success({ lotId: id, name, species, quantity }));
    } catch (e) { next(e); }
});

// GET /api/lots — VET: list ALL lots from all farmers (for prescription discovery)
router.get('/', authenticate, requireRole('VET', 'FARMER'), (req, res, next) => {
    try {
        const db = getDb();
        let lots;
        if (req.user.role === 'FARMER') {
            lots = db.prepare(`
                SELECT al.*, u.name as farmer_name, u.email as farmer_email,
                    (SELECT COUNT(*) FROM prescriptions_offchain p WHERE p.animal_lot_id = al.id) as prescription_count,
                    (SELECT MAX(p.withdrawal_end) FROM prescriptions_offchain p WHERE p.animal_lot_id = al.id) as latest_withdrawal_end
                FROM animal_lots al
                JOIN users u ON al.farmer_id = u.id
                WHERE al.farmer_id = ?
                ORDER BY al.created_at DESC
            `).all(req.user.id);
        } else {
            lots = db.prepare(`
                SELECT al.*, u.name as farmer_name, u.email as farmer_email,
                    (SELECT COUNT(*) FROM prescriptions_offchain p WHERE p.animal_lot_id = al.id) as prescription_count,
                    (SELECT MAX(p.withdrawal_end) FROM prescriptions_offchain p WHERE p.animal_lot_id = al.id) as latest_withdrawal_end
                FROM animal_lots al
                JOIN users u ON al.farmer_id = u.id
                ORDER BY al.created_at DESC
            `).all();
        }
        res.json(success({ lots }));
    } catch (e) { next(e); }
});

// GET /api/lots/farm/:farmerId — VET or FARMER
router.get('/farm/:farmerId', authenticate, (req, res, next) => {
    try {
        const db = getDb();
        const lots = db.prepare('SELECT * FROM animal_lots WHERE farmer_id = ? ORDER BY created_at DESC').all(req.params.farmerId);
        res.json(success({ lots }));
    } catch (e) { next(e); }
});


// GET /api/lots/abattoir/pending — SLAUGHTERHOUSE: list lots ready for slaughter
// MUST be before /:lotId routes
router.get('/abattoir/pending', authenticate, requireRole('SLAUGHTERHOUSE'), (req, res, next) => {
    try {
        const db = getDb();
        const pendingLots = db.prepare(`
            SELECT 
                al.id as lot_id,
                al.name,
                al.species,
                al.quantity,
                al.created_at,
                u.name as farmer_name,
                COUNT(p.rx_id) as total_treatments,
                SUM(CASE WHEN p.administered = 1 THEN 1 ELSE 0 END) as administered_treatments,
                MAX(p.withdrawal_end) as latest_withdrawal_end,
                (SELECT rx_id FROM prescriptions_offchain WHERE animal_lot_id = al.id ORDER BY withdrawal_end DESC LIMIT 1) as latest_rx_id
            FROM animal_lots al
            JOIN users u ON al.farmer_id = u.id
            JOIN prescriptions_offchain p ON al.id = p.animal_lot_id
            LEFT JOIN lot_certifications lc ON al.id = lc.lot_id
            WHERE lc.lot_id IS NULL
            GROUP BY al.id
            HAVING total_treatments > 0 
               AND total_treatments = administered_treatments
            ORDER BY latest_withdrawal_end ASC
        `).all();
        res.json(success({ pendingLots }));
    } catch (e) { next(e); }
});

// GET /api/lots/certifications — SLAUGHTERHOUSE: list own certifications
// MUST be before /:lotId routes to avoid param collision
router.get('/certifications', authenticate, requireRole('SLAUGHTERHOUSE'), (req, res, next) => {
    try {
        const db = getDb();
        const certifications = db.prepare(`
            SELECT
                lc.lot_id,
                lc.certificate_hash,
                lc.eligible,
                lc.tx_hash,
                lc.certified_at,
                (SELECT COUNT(*) FROM prescriptions_offchain p WHERE p.animal_lot_id = lc.lot_id) as total_treatments,
                (SELECT COUNT(DISTINCT p.farmer_id) FROM prescriptions_offchain p WHERE p.animal_lot_id = lc.lot_id) as distinct_farmers
            FROM lot_certifications lc
            WHERE lc.slaughterhouse_id = ?
            ORDER BY lc.certified_at DESC
            LIMIT 100
        `).all(req.user.id);
        res.json(success({ certifications }));
    } catch (e) { next(e); }
});

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
        const lotCreation = db.prepare('SELECT * FROM animal_lots WHERE id = ?').get(req.params.lotId);
        const lotSummary = db.prepare(`
            SELECT
                COUNT(*) as total_treatments,
                SUM(CASE WHEN p.administered = 1 THEN 1 ELSE 0 END) as administered_treatments,
                COUNT(DISTINCT p.vet_id) as distinct_vets,
                COUNT(DISTINCT p.farmer_id) as distinct_farmers,
                MAX(p.withdrawal_end) as latest_withdrawal_end
            FROM prescriptions_offchain p
            WHERE p.animal_lot_id = ?
        `).get(req.params.lotId);

        const latestWithdrawalEnd = lotSummary?.latest_withdrawal_end || null;
        const activeWithdrawal = latestWithdrawalEnd ? new Date(latestWithdrawalEnd).getTime() > Date.now() : false;

        // PRIVACY FILTER: strip PII for public access
        const safePrescriptions = prescriptionsOffchain.map(p => ({
            rxId: p.rx_id,
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
        if (!activeWithdrawal && prescriptionsOffchain.length > 0) trustScore += 10;
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
            lotDetails: {
                totalTreatments: Number(lotSummary?.total_treatments || 0),
                administeredTreatments: Number(lotSummary?.administered_treatments || 0),
                latestWithdrawalEnd,
                inWithdrawal: activeWithdrawal
            },
            farmerVetTraceability: {
                distinctVeterinarians: Number(lotSummary?.distinct_vets || 0),
                distinctFarmers: Number(lotSummary?.distinct_farmers || 0),
                linked: Number(lotSummary?.distinct_vets || 0) > 0 && Number(lotSummary?.distinct_farmers || 0) > 0
            },
            lotCreation: lotCreation ? {
                name: lotCreation.name,
                species: lotCreation.species,
                quantity: lotCreation.quantity,
                createdAt: lotCreation.created_at
            } : null,
            prescriptions: safePrescriptions,
            certification: cert ? {
                certified: true,
                certificateHash: cert.certificate_hash,
                certifiedAt: cert.certified_at,
                txHash: cert.tx_hash,
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
