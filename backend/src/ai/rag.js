// ============================================
// SAFAR Chain — RAG (Retrieval-Augmented Generation)
// Real embedding-based RAG with vector store
// Falls back to keyword matching if embeddings unavailable
// ============================================
const { getDb } = require('../db/db');
const regulatory = require('./knowledge/regulatory.json');
const vectorStore = require('./vectorStore');
const { isAvailable: isEmbeddingAvailable } = require('./embeddings');

// ---- Semantic Search (Real RAG) ----

/**
 * Semantic search for relevant context
 * @param {string} query - User's question/symptoms
 * @param {number} topK - Number of results
 * @param {object} filter - Optional {source, category}
 * @returns {Promise<Array<{content, similarity, metadata}>>}
 */
async function semanticSearch(query, topK = 5, filter = {}) {
    try {
        const embeddingReady = await isEmbeddingAvailable();
        if (!embeddingReady || vectorStore.getStats().totalDocuments === 0) {
            // Fallback to keyword matching
            return keywordSearch(query, topK);
        }
        return await vectorStore.search(query, topK, filter);
    } catch (e) {
        console.error('[RAG] Semantic search failed, falling back to keywords:', e.message);
        return keywordSearch(query, topK);
    }
}

/**
 * Keyword-based fallback search (no embeddings needed)
 */
function keywordSearch(query, topK = 5) {
    const text = query.toLowerCase();
    const results = [];

    // Search drugs
    for (const [atcCode, drug] of Object.entries(regulatory.drugs)) {
        const content = `${drug.molecule} ${drug.commonIndications.join(' ')} ${drug.notes}`;
        const words = content.toLowerCase().split(/\s+/);
        const queryWords = text.split(/\s+/);
        const matches = queryWords.filter(w => words.some(cw => cw.includes(w) || w.includes(cw)));
        if (matches.length > 0) {
            results.push({
                id: `drug-${atcCode}`,
                content: `Antibiotique: ${drug.molecule} (${atcCode}, ${drug.awareClass}). Indications: ${drug.commonIndications.join(', ')}. Posologie: ${drug.dosage.poultry}. Retrait: ${drug.withdrawalDaysPoultry}j.`,
                metadata: { type: 'drug', atcCode },
                similarity: matches.length / queryWords.length
            });
        }
    }

    // Search diseases
    for (const [key, disease] of Object.entries(regulatory.commonDiseases)) {
        const symptomMatches = disease.symptoms.filter(s => text.includes(s.toLowerCase()));
        if (symptomMatches.length > 0) {
            const firstLine = regulatory.drugs[disease.firstLine];
            results.push({
                id: `disease-${key}`,
                content: `Maladie: ${disease.name}. Symptômes: ${disease.symptoms.join(', ')}. 1ère ligne: ${firstLine?.molecule || disease.firstLine}.`,
                metadata: { type: 'disease', name: disease.name },
                similarity: symptomMatches.length / disease.symptoms.length
            });
        }
    }

    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, topK);
}

// ---- DB Context Retrieval ----

/**
 * Build rich context for the Vet Assistant
 * Combines: vector search + DB prescriptions + AWaRe stats
 */
async function buildVetContext(vetId, symptoms) {
    const db = getDb();
    const parts = [];

    // 1. Semantic search for relevant medical knowledge
    const searchResults = await semanticSearch(symptoms, 5, { source: 'regulatory' });
    if (searchResults.length > 0) {
        const ragContext = searchResults.map(r =>
            `  [${(r.similarity * 100).toFixed(0)}% pertinent] ${r.content.slice(0, 300)}`
        ).join('\n');
        parts.push(`--- BASE DE CONNAISSANCES (recherche sémantique) ---\n${ragContext}`);
    }

    // 2. Vet's recent prescriptions from DB
    const recentRx = db.prepare(`
        SELECT p.*, d.atc_code, d.aware_class
        FROM prescriptions_offchain p
        LEFT JOIN drug_sales_offchain d ON p.sale_id = d.sale_id
        WHERE p.vet_id = ?
        ORDER BY p.created_at DESC LIMIT 10
    `).all(vetId);

    if (recentRx.length > 0) {
        const rxSummary = recentRx.slice(0, 5).map(rx =>
            `  - ${rx.diagnosis} → ${rx.atc_code} (${rx.aware_class}), Retrait: ${rx.withdrawal_days}j`
        ).join('\n');
        parts.push(`--- VOS PRESCRIPTIONS RÉCENTES ---\n${rxSummary}`);

        // AWaRe distribution
        const awareCounts = { Access: 0, Watch: 0, Reserve: 0 };
        recentRx.forEach(rx => { if (rx.aware_class) awareCounts[rx.aware_class]++; });
        parts.push(`DISTRIBUTION AWaRe: Access: ${awareCounts.Access}, Watch: ${awareCounts.Watch}, Reserve: ${awareCounts.Reserve}`);
    }

    // 3. Search prescription history for similar cases
    const prescriptionResults = await semanticSearch(symptoms, 3, { source: 'prescription' });
    if (prescriptionResults.length > 0) {
        const similar = prescriptionResults.map(r =>
            `  [${(r.similarity * 100).toFixed(0)}% similaire] ${r.content.slice(0, 200)}`
        ).join('\n');
        parts.push(`--- CAS SIMILAIRES DANS L'HISTORIQUE ---\n${similar}`);
    }

    // 4. AWaRe guidelines
    parts.push(`--- RÉGLEMENTATION TUNISIENNE (DGSV) ---`);
    regulatory.tunisianRegulations.rules.forEach(r => parts.push(`• ${r}`));

    return parts.join('\n\n');
}

/**
 * Build rich context for the Farmer Assistant
 * Combines: vector search + lot data + products
 */
async function buildFarmerContext(farmerId, lotId, question) {
    const db = getDb();
    const parts = [];

    // 1. Semantic search for relevant guidance
    if (question) {
        const searchResults = await semanticSearch(question, 3, { category: 'farmer_guidance' });
        if (searchResults.length > 0) {
            const guidance = searchResults.map(r =>
                `  [${(r.similarity * 100).toFixed(0)}% pertinent] ${r.content.slice(0, 300)}`
            ).join('\n');
            parts.push(`--- INFORMATIONS PERTINENTES ---\n${guidance}`);
        }
    }

    // 2. Lot-specific data
    if (lotId) {
        const lotRx = db.prepare(`
            SELECT p.*, d.atc_code, d.aware_class
            FROM prescriptions_offchain p
            LEFT JOIN drug_sales_offchain d ON p.sale_id = d.sale_id
            WHERE p.animal_lot_id = ? AND p.farmer_id = ?
        `).all(lotId, farmerId);

        if (lotRx.length > 0) {
            const lotInfo = lotRx.map(rx => {
                const drugInfo = regulatory.drugs[rx.atc_code];
                const molecule = drugInfo ? drugInfo.molecule : rx.atc_code;
                const now = Date.now();
                const withdrawalEnd = new Date(rx.withdrawal_end).getTime();
                const daysRemaining = Math.max(0, Math.ceil((withdrawalEnd - now) / 86400000));
                const status = rx.administered
                    ? (daysRemaining > 0 ? `⏳ En retrait (${daysRemaining} jours restants)` : '✅ Retrait terminé')
                    : '⚠️ Non administré';
                return `  - ${molecule}: ${rx.diagnosis}, ${status}`;
            }).join('\n');
            parts.push(`LOT ${lotId} — TRAITEMENTS:\n${lotInfo}`);
        } else {
            parts.push(`LOT ${lotId}: Aucun traitement antibiotique enregistré.`);
        }

        const cert = db.prepare('SELECT * FROM lot_certifications WHERE lot_id = ?').get(lotId);
        parts.push(cert
            ? `CERTIFICATION: ✅ Lot certifié conforme`
            : `CERTIFICATION: ❌ Lot non encore certifié`);
    }

    // 3. Products on marketplace
    const products = db.prepare('SELECT title, status, quantity_available FROM products WHERE farmer_id = ?').all(farmerId);
    if (products.length > 0) {
        const productList = products.map(p => `  - ${p.title} (${p.status}, stock: ${p.quantity_available})`).join('\n');
        parts.push(`VOS PRODUITS EN VENTE:\n${productList}`);
    }

    return parts.join('\n\n') || 'Aucune donnée disponible pour le moment.';
}

/**
 * Build trace context for the public trace explainer
 */
async function buildTraceContext(lotId) {
    const db = getDb();
    const parts = [];

    // 1. Semantic search for consumer info
    const searchResults = await semanticSearch('traçabilité sécurité alimentaire consommateur', 2, { category: 'consumer_info' });
    if (searchResults.length > 0) {
        parts.push(searchResults[0].content.slice(0, 300));
    }

    // 2. Lot data from DB
    const prescriptions = db.prepare(`
        SELECT p.diagnosis, p.withdrawal_days, p.withdrawal_end, p.administered, p.start_date,
               d.atc_code, d.aware_class
        FROM prescriptions_offchain p
        LEFT JOIN drug_sales_offchain d ON p.sale_id = d.sale_id
        WHERE p.animal_lot_id = ?
    `).all(lotId);

    if (prescriptions.length === 0) {
        parts.push(`Lot ${lotId}: Aucun traitement antibiotique enregistré. Produit sans antibiotiques.`);
    } else {
        const rxSummary = prescriptions.map(rx => {
            const drugInfo = regulatory.drugs[rx.atc_code];
            const molecule = drugInfo ? drugInfo.molecule : 'Antibiotique';
            return `${molecule} (classe ${rx.aware_class || 'Inconnu'}), administré: ${rx.administered ? 'oui' : 'non'}, retrait: ${rx.withdrawal_days} jours`;
        }).join('. ');
        parts.push(`Lot ${lotId}: ${rxSummary}.`);
    }

    const cert = db.prepare('SELECT * FROM lot_certifications WHERE lot_id = ?').get(lotId);
    parts.push(cert ? 'Le lot a été certifié conforme par un abattoir agréé.' : 'Le lot n\'a pas encore été certifié.');

    return parts.join(' ');
}

// ---- Legacy functions kept for compatibility ----

function getDrugKnowledge(atcCode) {
    const drug = regulatory.drugs[atcCode];
    if (!drug) return null;
    return {
        ...drug,
        awarePolicy: regulatory.awarClasses[drug.awareClass],
        legalWithdrawal: regulatory.tunisianRegulations.withdrawalMinimums[atcCode]
    };
}

function matchSymptoms(symptomsText) {
    const text = symptomsText.toLowerCase();
    const matches = [];
    for (const [key, disease] of Object.entries(regulatory.commonDiseases)) {
        const symptomMatches = disease.symptoms.filter(s => text.includes(s.toLowerCase()));
        if (symptomMatches.length > 0) {
            const firstLineDrug = regulatory.drugs[disease.firstLine];
            const secondLineDrug = disease.secondLine ? regulatory.drugs[disease.secondLine] : null;
            matches.push({
                disease: disease.name,
                matchedSymptoms: symptomMatches,
                confidence: Math.min(100, Math.round(symptomMatches.length / disease.symptoms.length * 100)),
                firstLine: firstLineDrug ? `${firstLineDrug.molecule} (${disease.firstLine}, ${firstLineDrug.awareClass})` : disease.firstLine,
                secondLine: secondLineDrug ? `${secondLineDrug.molecule} (${disease.secondLine}, ${secondLineDrug.awareClass})` : disease.secondLine,
                ageFactors: disease.ageFactors
            });
        }
    }
    return matches.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Build RAG-enhanced system prompt for vet assistant
 */
async function enrichVetPrompt(basePrompt, vetId, symptoms) {
    const vetContext = await buildVetContext(vetId, symptoms);
    return `${basePrompt}\n\n${vetContext}`;
}

/**
 * Build RAG-enhanced system prompt for farmer assistant
 */
async function enrichFarmerPrompt(basePrompt, farmerId, lotId, question) {
    const farmerContext = await buildFarmerContext(farmerId, lotId, question);
    return basePrompt.replace('{lot_context}', farmerContext);
}

/**
 * Build RAG-enhanced system prompt for trace explainer
 */
async function enrichTracePrompt(basePrompt, lotId) {
    const traceContext = await buildTraceContext(lotId);
    return basePrompt.replace('{trace_data}', traceContext);
}

module.exports = {
    semanticSearch,
    keywordSearch,
    buildVetContext,
    buildFarmerContext,
    buildTraceContext,
    getDrugKnowledge,
    matchSymptoms,
    enrichVetPrompt,
    enrichFarmerPrompt,
    enrichTracePrompt
};
