// ============================================
// SAFAR Chain — AI Routes
// Layer 1: Proxy to Python FastAPI (anomaly/forecast)
// Layer 2: Ollama LLM (vet/farmer assistant, trace explainer)
// ============================================
const express = require('express');
const axios = require('axios');
const { z } = require('zod');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');
const { success, error } = require('../utils/response');
const { getDb } = require('../db/db');
const ollama = require('../ai/ollama');
const sdk = require('../sdk/safar-sdk');

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

// ---- Layer 2: Ollama LLM Endpoints ----

const vetAssistantSchema = z.object({
    symptoms: z.string().min(5).max(2000),
    lotSize: z.number().int().positive().optional()
});

const farmerAssistantSchema = z.object({
    question: z.string().min(3).max(2000),
    lotId: z.string().max(50).optional()
});

const traceExplainSchema = z.object({
    lotId: z.string().min(1).max(50)
});

// POST /api/ai/assistant/vet — VET only
router.post('/assistant/vet', authenticate, requireRole('VET'), validate(vetAssistantSchema), async (req, res, next) => {
    try {
        const { symptoms, lotSize } = req.body;
        const systemPrompt = ollama.loadPrompt('vet_assistant');
        const userMessage = ollama.sanitizeInput(
            `Symptômes observés: ${symptoms}${lotSize ? `\nTaille du lot: ${lotSize} animaux` : ''}\n\nQuelle est ta recommandation?`
        );

        const result = await ollama.generate(systemPrompt, userMessage, { temperature: 0.3 });

        res.json(success({
            recommendation: result.text,
            model: result.model,
            disclaimer: 'Ceci est une recommandation IA. Le vétérinaire prend la décision finale.'
        }));
    } catch (e) {
        if (e.statusCode === 503) {
            const err = error('AI_UNAVAILABLE', 'IA temporairement indisponible', 503);
            return res.status(503).json(err.responseBody);
        }
        next(e);
    }
});

// POST /api/ai/assistant/farmer — FARMER only
router.post('/assistant/farmer', authenticate, requireRole('FARMER'), validate(farmerAssistantSchema), async (req, res, next) => {
    try {
        const { question, lotId } = req.body;
        let lotContext = 'Aucun lot spécifié.';

        if (lotId) {
            const db = getDb();
            const prescriptions = db.prepare(
                'SELECT * FROM prescriptions_offchain WHERE animal_lot_id = ? AND farmer_id = ?'
            ).all(lotId, req.user.id);
            if (prescriptions.length > 0) {
                lotContext = prescriptions.map(rx =>
                    `- Traitement: ${rx.diagnosis}, Début: ${rx.start_date}, Fin retrait: ${rx.withdrawal_end}, Administré: ${rx.administered ? 'Oui' : 'Non'}`
                ).join('\n');
            }
        }

        const systemPrompt = ollama.loadPrompt('farmer_assistant').replace('{lot_context}', lotContext);
        const userMessage = ollama.sanitizeInput(question);
        const result = await ollama.generate(systemPrompt, userMessage, { temperature: 0.5 });

        res.json(success({ answer: result.text, model: result.model }));
    } catch (e) {
        if (e.statusCode === 503) {
            const err = error('AI_UNAVAILABLE', 'IA temporairement indisponible', 503);
            return res.status(503).json(err.responseBody);
        }
        next(e);
    }
});

// POST /api/ai/explain/trace — PUBLIC
router.post('/explain/trace', optionalAuth, validate(traceExplainSchema), async (req, res, next) => {
    try {
        const { lotId } = req.body;
        const traceData = sdk.getLotTraceability(lotId);

        // Build a simple text summary (no sensitive data)
        let traceSummary = `Lot ${lotId}: `;
        if (traceData.prescriptions.length === 0) {
            traceSummary += 'Aucun traitement antibiotique enregistré.';
        } else {
            traceSummary += traceData.prescriptions.map(({ prescription, drugSale }) =>
                `Traitement (${drugSale?.awareClass || 'inconnu'}), administré: ${prescription.administered ? 'oui' : 'non'}, retrait terminé: ${prescription.withdrawalEnd ? new Date(prescription.withdrawalEnd).toLocaleDateString('fr-FR') : 'N/A'}`
            ).join('. ');
        }
        if (traceData.certification) traceSummary += ' Lot certifié conforme.';

        const systemPrompt = ollama.loadPrompt('trace_explain').replace('{trace_data}', traceSummary);
        const result = await ollama.generate(systemPrompt, 'Explique cette traçabilité au consommateur.', { temperature: 0.5 });

        // Output filter: strip any wallet addresses that might leak
        let explanation = result.text.replace(/0x[a-fA-F0-9]{40}/g, '[adresse vérifiée]');

        res.json(success({ explanation, lotId }));
    } catch (e) {
        if (e.statusCode === 503) {
            const err = error('AI_UNAVAILABLE', 'IA temporairement indisponible', 503);
            return res.status(503).json(err.responseBody);
        }
        next(e);
    }
});

// GET /api/ai/status — PUBLIC health check
router.get('/status', async (req, res) => {
    const ollamaUp = await ollama.isAvailable();
    let pythonUp = false;
    try {
        await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 3000 });
        pythonUp = true;
    } catch {}

    res.json(success({
        ollama: { available: ollamaUp, model: process.env.OLLAMA_MODEL || 'phi3:mini' },
        anomalyService: { available: pythonUp }
    }));
});

// ---- Layer 1: Proxy to Python FastAPI ----

// GET /api/ai/anomaly/vet/:vetId — ADMIN only
router.get('/anomaly/vet/:vetId', authenticate, requireRole('ADMIN'), async (req, res, next) => {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/ai/anomaly/vet/${req.params.vetId}`, { timeout: 10000 });
        res.json(success(response.data));
    } catch (e) {
        if (e.code === 'ECONNREFUSED') {
            const err = error('AI_UNAVAILABLE', 'Anomaly detection service unavailable', 503);
            return res.status(503).json(err.responseBody);
        }
        next(e);
    }
});

// GET /api/ai/anomaly/farm/:farmerId — ADMIN or own FARMER
router.get('/anomaly/farm/:farmerId', authenticate, requireRole('ADMIN', 'FARMER'), async (req, res, next) => {
    try {
        if (req.user.role === 'FARMER' && req.user.id !== req.params.farmerId) {
            const err = error('FORBIDDEN', 'Can only view your own anomaly data', 403);
            return res.status(403).json(err.responseBody);
        }
        const response = await axios.get(`${AI_SERVICE_URL}/ai/anomaly/farm/${req.params.farmerId}`, { timeout: 10000 });
        res.json(success(response.data));
    } catch (e) {
        if (e.code === 'ECONNREFUSED') {
            const err = error('AI_UNAVAILABLE', 'Anomaly detection service unavailable', 503);
            return res.status(503).json(err.responseBody);
        }
        next(e);
    }
});

// GET /api/ai/forecast/:governorate — ADMIN only
router.get('/forecast/:governorate', authenticate, requireRole('ADMIN'), async (req, res, next) => {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/ai/forecast/${req.params.governorate}`, { timeout: 10000 });
        res.json(success(response.data));
    } catch (e) {
        if (e.code === 'ECONNREFUSED') {
            const err = error('AI_UNAVAILABLE', 'Forecast service unavailable', 503);
            return res.status(503).json(err.responseBody);
        }
        next(e);
    }
});

module.exports = router;
