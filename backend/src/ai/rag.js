// ============================================
// SAFAR Chain — RAG (Retrieval-Augmented Generation)
// Lightweight context retrieval for LLM prompts
// ============================================
const { getDb } = require('../db/db');
const regulatory = require('./knowledge/regulatory.json');

/**
 * Build rich context for the Vet Assistant
 * Retrieves: recent prescriptions, AWaRe distribution, drug knowledge, disease matching
 */
function buildVetContext(vetId) {
    const db = getDb();
    const parts = [];

    // 1. Vet's recent prescriptions (last 30)
    const recentRx = db.prepare(`
        SELECT p.*, d.atc_code, d.aware_class, d.batch_number
        FROM prescriptions_offchain p
        LEFT JOIN drug_sales_offchain d ON p.sale_id = d.sale_id
        WHERE p.vet_id = ?
        ORDER BY p.created_at DESC LIMIT 30
    `).all(vetId);

    if (recentRx.length > 0) {
        const rxSummary = recentRx.slice(0, 5).map(rx =>
            `  - ${rx.diagnosis} → ${rx.atc_code} (${rx.aware_class}), Lot: ${rx.animal_lot_id}, Retrait: ${rx.withdrawal_days}j`
        ).join('\n');
        parts.push(`PRESCRIPTIONS RÉCENTES (${recentRx.length} total):\n${rxSummary}`);

        // AWaRe distribution
        const awareCounts = { Access: 0, Watch: 0, Reserve: 0 };
        recentRx.forEach(rx => { if (rx.aware_class) awareCounts[rx.aware_class]++; });
        parts.push(`DISTRIBUTION AWaRe: Access: ${awareCounts.Access}, Watch: ${awareCounts.Watch}, Reserve: ${awareCounts.Reserve}`);
    }

    // 2. Available drugs in system
    const drugs = db.prepare('SELECT DISTINCT atc_code, aware_class FROM drug_sales_offchain').all();
    if (drugs.length > 0) {
        const drugList = drugs.map(d => {
            const info = regulatory.drugs[d.atc_code];
            return info ? `  - ${info.molecule} (${d.atc_code}) — ${d.aware_class}` : `  - ${d.atc_code} — ${d.aware_class}`;
        }).join('\n');
        parts.push(`ANTIBIOTIQUES DISPONIBLES:\n${drugList}`);
    }

    return parts.join('\n\n');
}

/**
 * Build rich context for the Farmer Assistant
 * Retrieves: lot prescriptions, withdrawal status, certification status, practical info
 */
function buildFarmerContext(farmerId, lotId) {
    const db = getDb();
    const parts = [];

    // 1. All prescriptions for this farmer
    const prescriptions = db.prepare(`
        SELECT p.*, d.atc_code, d.aware_class
        FROM prescriptions_offchain p
        LEFT JOIN drug_sales_offchain d ON p.sale_id = d.sale_id
        WHERE p.farmer_id = ?
        ORDER BY p.created_at DESC
    `).all(farmerId);

    if (lotId) {
        const lotRx = prescriptions.filter(p => p.animal_lot_id === lotId);
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

        // Certification status
        const cert = db.prepare('SELECT * FROM lot_certifications WHERE lot_id = ?').get(lotId);
        if (cert) {
            parts.push(`CERTIFICATION: ✅ Lot certifié conforme le ${cert.created_at || 'date inconnue'}`);
        } else {
            parts.push(`CERTIFICATION: ❌ Lot non encore certifié`);
        }
    }

    // 2. Summary of all farmer's lots
    const allLots = [...new Set(prescriptions.map(p => p.animal_lot_id))];
    if (allLots.length > 0) {
        parts.push(`VOS LOTS ACTIFS: ${allLots.join(', ')}`);
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
function buildTraceContext(lotId) {
    const db = getDb();
    const parts = [];

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
            const awareClass = rx.aware_class || 'Inconnu';
            return `${molecule} (classe ${awareClass}), administré: ${rx.administered ? 'oui' : 'non'}, retrait: ${rx.withdrawal_days} jours`;
        }).join('. ');
        parts.push(`Lot ${lotId}: ${rxSummary}.`);
    }

    const cert = db.prepare('SELECT * FROM lot_certifications WHERE lot_id = ?').get(lotId);
    parts.push(cert ? 'Le lot a été certifié conforme par un abattoir agréé.' : 'Le lot n\'a pas encore été certifié.');

    return parts.join(' ');
}

/**
 * Get regulatory context for a specific ATC code
 */
function getDrugKnowledge(atcCode) {
    const drug = regulatory.drugs[atcCode];
    if (!drug) return null;
    return {
        ...drug,
        awarePolicy: regulatory.awarClasses[drug.awareClass],
        legalWithdrawal: regulatory.tunisianRegulations.withdrawalMinimums[atcCode]
    };
}

/**
 * Match symptoms to potential diseases from knowledge base
 */
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
function enrichVetPrompt(basePrompt, vetId, symptoms) {
    const parts = [basePrompt];

    // Inject vet context from DB
    const vetContext = buildVetContext(vetId);
    if (vetContext) {
        parts.push(`\n--- CONTEXTE DU VÉTÉRINAIRE ---\n${vetContext}`);
    }

    // Inject symptom matching from knowledge base
    const diseaseMatches = matchSymptoms(symptoms);
    if (diseaseMatches.length > 0) {
        const matchInfo = diseaseMatches.slice(0, 3).map(m =>
            `  - ${m.disease} (confiance: ${m.confidence}%): 1ère ligne: ${m.firstLine}, 2ème ligne: ${m.secondLine || 'N/A'}`
        ).join('\n');
        parts.push(`\n--- BASE DE CONNAISSANCES (correspondances symptômes) ---\n${matchInfo}`);
    }

    // Inject AWaRe guidelines
    parts.push(`\n--- RÉGLEMENTATION TUNISIENNE (DGSV) ---`);
    regulatory.tunisianRegulations.rules.forEach(r => parts.push(`• ${r}`));

    return parts.join('\n');
}

/**
 * Build RAG-enhanced system prompt for farmer assistant
 */
function enrichFarmerPrompt(basePrompt, farmerId, lotId) {
    const farmerContext = buildFarmerContext(farmerId, lotId);
    return basePrompt.replace('{lot_context}', farmerContext);
}

/**
 * Build RAG-enhanced system prompt for trace explainer
 */
function enrichTracePrompt(basePrompt, lotId) {
    const traceContext = buildTraceContext(lotId);
    return basePrompt.replace('{trace_data}', traceContext);
}

module.exports = {
    buildVetContext,
    buildFarmerContext,
    buildTraceContext,
    getDrugKnowledge,
    matchSymptoms,
    enrichVetPrompt,
    enrichFarmerPrompt,
    enrichTracePrompt
};
