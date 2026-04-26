// ============================================
// SAFAR Chain — AI Routes (RAG + Guardrails)
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
const rag = require('../ai/rag');
const guardrails = require('../ai/guardrails');
const vectorStore = require('../ai/vectorStore');
const sdk = require('../sdk/safar-sdk');

const router = express.Router();
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

// ---- Layer 2: Ollama LLM Endpoints (RAG-Enhanced + Guardrailed) ----

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

// POST /api/ai/assistant/vet — VET only (RAG + Guardrails)
router.post('/assistant/vet', authenticate, requireRole('VET'), validate(vetAssistantSchema), async (req, res, next) => {
    try {
        const { symptoms, lotSize } = req.body;

        // 1. Load base prompt
        const basePrompt = ollama.loadPrompt('vet_assistant');

        // 2. RAG: Enrich with DB context + knowledge base
        const enrichedPrompt = await rag.enrichVetPrompt(basePrompt, req.user.id, symptoms);

        // 3. Build sanitized user message
        const userMessage = ollama.sanitizeInput(
            `Symptômes observés: ${symptoms}${lotSize ? `\nTaille du lot: ${lotSize} animaux` : ''}\n\nQuelle est ta recommandation?`
        );

        // 4. Generate with Ollama
        const result = await ollama.generate(enrichedPrompt, userMessage, { temperature: 0.3 });

        // 5. GUARDRAILS: Full output pipeline
        const pipeline = guardrails.processOutput(result.text, 'vet');

        // 6. Get disease matches from RAG for structured response
        const diseaseMatches = rag.matchSymptoms(symptoms);

        res.json(success({
            recommendation: pipeline.finalText,
            model: result.model,
            ragContext: {
                diseaseMatches: diseaseMatches.slice(0, 3).map(m => ({
                    disease: m.disease,
                    confidence: m.confidence,
                    firstLine: m.firstLine
                }))
            },
            guardrails: {
                warnings: pipeline.warnings,
                steps: pipeline.steps,
                usedFallback: pipeline.usedFallback
            },
            disclaimer: 'Ceci est une recommandation IA basée sur les données disponibles. Le vétérinaire prend la décision finale.'
        }));
    } catch (e) {
        if (e.statusCode === 503) {
            return res.status(503).json(error('AI_UNAVAILABLE', 'IA temporairement indisponible', 503).responseBody);
        }
        if (e.statusCode === 504) {
            // Timeout: return fallback
            const fallback = guardrails.getFallback('vet');
            return res.json(success({
                recommendation: fallback,
                model: 'fallback',
                guardrails: { usedFallback: true, reason: 'TIMEOUT' },
                disclaimer: 'Réponse de secours — le modèle IA est temporairement surchargé.'
            }));
        }
        next(e);
    }
});

// POST /api/ai/assistant/farmer — FARMER only (RAG + Guardrails)
router.post('/assistant/farmer', authenticate, requireRole('FARMER'), validate(farmerAssistantSchema), async (req, res, next) => {
    try {
        const { question, lotId } = req.body;

        // 1. Load base prompt
        const basePrompt = ollama.loadPrompt('farmer_assistant');

        // 2. RAG: Enrich with farmer context
        const enrichedPrompt = await rag.enrichFarmerPrompt(basePrompt, req.user.id, lotId, question);

        // 3. Sanitize user input
        const userMessage = ollama.sanitizeInput(question);

        // 4. Generate with Ollama
        const result = await ollama.generate(enrichedPrompt, userMessage, { temperature: 0.5 });

        // 5. GUARDRAILS: Full output pipeline
        const pipeline = guardrails.processOutput(result.text, 'farmer');

        res.json(success({
            answer: pipeline.finalText,
            model: result.model,
            guardrails: {
                warnings: pipeline.warnings,
                usedFallback: pipeline.usedFallback
            }
        }));
    } catch (e) {
        if (e.statusCode === 503) {
            return res.status(503).json(error('AI_UNAVAILABLE', 'IA temporairement indisponible', 503).responseBody);
        }
        if (e.statusCode === 504) {
            return res.json(success({
                answer: guardrails.getFallback('farmer'),
                model: 'fallback',
                guardrails: { usedFallback: true, reason: 'TIMEOUT' }
            }));
        }
        next(e);
    }
});

// POST /api/ai/explain/trace — PUBLIC (RAG + Guardrails)
router.post('/explain/trace', optionalAuth, validate(traceExplainSchema), async (req, res, next) => {
    try {
        const { lotId } = req.body;

        // 1. Load base prompt
        const basePrompt = ollama.loadPrompt('trace_explain');

        // 2. RAG: Enrich with trace context from DB
        const enrichedPrompt = await rag.enrichTracePrompt(basePrompt, lotId);

        // 3. Generate with Ollama
        const result = await ollama.generate(enrichedPrompt, 'Explique cette traçabilité au consommateur.', { temperature: 0.5 });

        // 4. GUARDRAILS: Full output pipeline (trace type)
        const pipeline = guardrails.processOutput(result.text, 'trace');

        res.json(success({
            explanation: pipeline.finalText,
            lotId,
            guardrails: {
                usedFallback: pipeline.usedFallback
            }
        }));
    } catch (e) {
        if (e.statusCode === 503) {
            return res.status(503).json(error('AI_UNAVAILABLE', 'IA temporairement indisponible', 503).responseBody);
        }
        if (e.statusCode === 504) {
            return res.json(success({
                explanation: guardrails.getFallback('trace'),
                lotId: req.body.lotId,
                guardrails: { usedFallback: true, reason: 'TIMEOUT' }
            }));
        }
        next(e);
    }
});

// GET /api/ai/status — PUBLIC health check
router.get('/status', async (req, res) => {
    const ollamaUp = await ollama.isAvailable();
    const { isAvailable: embedAvail } = require('../ai/embeddings');
    const embedUp = await embedAvail();
    let pythonUp = false;
    let modelsLoaded = 0;
    try {
        const resp = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 3000 });
        pythonUp = true;
        modelsLoaded = resp.data?.count || 0;
    } catch {}

    const vectorStats = vectorStore.getStats();

    res.json(success({
        ollama: { available: ollamaUp, model: process.env.OLLAMA_MODEL || 'phi3:mini' },
        embeddings: { available: embedUp, model: process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text' },
        vectorStore: vectorStats,
        anomalyService: { available: pythonUp, modelsLoaded },
        guardrails: { enabled: true, version: '2.0' },
        rag: { enabled: true, type: 'embedding-based', knowledgeBase: 'regulatory.json' }
    }));
});

// ---- Layer 1: Proxy to Python FastAPI ----

// GET /api/ai/anomaly/vet/:vetId — ADMIN only
router.get('/anomaly/vet/:vetId', authenticate, requireRole('ADMIN'), async (req, res, next) => {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/ai/anomaly/vet/${encodeURIComponent(req.params.vetId)}`, { timeout: 10000 });
        res.json(success(response.data));
    } catch (e) {
        if (e.code === 'ECONNREFUSED') {
            return res.status(503).json(error('AI_UNAVAILABLE', 'Anomaly detection service unavailable', 503).responseBody);
        }
        if (e.response?.status === 404) {
            return res.status(404).json(error('NOT_FOUND', e.response.data?.detail || 'Vet not found in dataset', 404).responseBody);
        }
        next(e);
    }
});

// GET /api/ai/anomaly/farm/:farmerId — ADMIN or own FARMER
router.get('/anomaly/farm/:farmerId', authenticate, requireRole('ADMIN', 'FARMER'), async (req, res, next) => {
    try {
        if (req.user.role === 'FARMER' && req.user.id !== req.params.farmerId) {
            return res.status(403).json(error('FORBIDDEN', 'Can only view your own anomaly data', 403).responseBody);
        }
        const response = await axios.get(`${AI_SERVICE_URL}/ai/anomaly/farm/${encodeURIComponent(req.params.farmerId)}`, { timeout: 10000 });
        res.json(success(response.data));
    } catch (e) {
        if (e.code === 'ECONNREFUSED') {
            return res.status(503).json(error('AI_UNAVAILABLE', 'Anomaly detection service unavailable', 503).responseBody);
        }
        if (e.response?.status === 404) {
            return res.status(404).json(error('NOT_FOUND', e.response.data?.detail || 'Farm not found in dataset', 404).responseBody);
        }
        next(e);
    }
});

// GET /api/ai/forecast/:governorate — ADMIN only
router.get('/forecast/:governorate', authenticate, requireRole('ADMIN'), async (req, res, next) => {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/ai/forecast/${encodeURIComponent(req.params.governorate)}`, { timeout: 10000 });
        res.json(success(response.data));
    } catch (e) {
        if (e.code === 'ECONNREFUSED') {
            return res.status(503).json(error('AI_UNAVAILABLE', 'Forecast service unavailable', 503).responseBody);
        }
        if (e.response?.status === 404) {
            return res.status(404).json(error('NOT_FOUND', e.response.data?.detail || 'Unknown governorate', 404).responseBody);
        }
        next(e);
    }
});

module.exports = router;
