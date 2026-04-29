// ============================================
// SAFAR Chain — Knowledge Indexer
// Seeds the vector store with regulatory data,
// drug knowledge, disease info, and regulations
// ============================================
const vectorStore = require('./vectorStore');
const regulatory = require('./knowledge/regulatory.json');
const { isAvailable } = require('./embeddings');

/**
 * Index all regulatory knowledge into the vector store
 * Called once at application startup
 */
async function indexKnowledgeBase() {
    console.log('[RAG] Starting knowledge base indexing...');

    const available = await isAvailable();
    if (!available) {
        console.warn('[RAG] Embedding model not available. Skipping indexing. RAG will use keyword fallback.');
        return { indexed: 0, status: 'EMBEDDING_MODEL_UNAVAILABLE' };
    }

    const documents = [];

    // 1. AWaRe Classification Rules
    for (const [className, classInfo] of Object.entries(regulatory.awarClasses)) {
        documents.push({
            id: `aware-class-${className}`,
            content: `Classification AWaRe de l'OMS — Classe ${className}: ${classInfo.description}. ` +
                `Risque: ${classInfo.risk}. Politique d'utilisation: ${classInfo.policy}. ` +
                `Codes ATC couverts: ${classInfo.codes.join(', ')}.`,
            metadata: { type: 'aware_class', className },
            source: 'regulatory',
            category: 'aware_classification'
        });
    }

    // 2. Drug Information
    for (const [atcCode, drug] of Object.entries(regulatory.drugs)) {
        const content = `Antibiotique: ${drug.molecule} (code ATC: ${atcCode}). ` +
            `Classe AWaRe: ${drug.awareClass}. ` +
            `Délai de retrait volailles: ${drug.withdrawalDaysPoultry} jours, œufs: ${drug.withdrawalDaysEggs} jours. ` +
            `Indications: ${drug.commonIndications.join(', ')}. ` +
            `Posologie volailles: ${drug.dosage.poultry} pendant ${drug.dosage.duration}. ` +
            `Contre-indications: ${drug.contraindications.join(', ')}. ` +
            `Notes: ${drug.notes}`;

        documents.push({
            id: `drug-${atcCode}`,
            content,
            metadata: { type: 'drug', atcCode, molecule: drug.molecule, awareClass: drug.awareClass },
            source: 'regulatory',
            category: 'drug_info'
        });
    }

    // 3. Disease Information
    for (const [key, disease] of Object.entries(regulatory.commonDiseases)) {
        const firstLine = regulatory.drugs[disease.firstLine];
        const secondLine = disease.secondLine ? regulatory.drugs[disease.secondLine] : null;
        const lastResort = disease.lastResort ? regulatory.drugs[disease.lastResort] : null;

        const content = `Maladie avicole: ${disease.name}. ` +
            `Symptômes: ${disease.symptoms.join(', ')}. ` +
            `Traitement de première ligne: ${firstLine?.molecule || disease.firstLine} (${disease.firstLine}, classe ${firstLine?.awareClass || 'inconnue'}). ` +
            `Traitement de deuxième ligne: ${secondLine ? `${secondLine.molecule} (${disease.secondLine}, classe ${secondLine.awareClass})` : 'Non spécifié'}. ` +
            `Dernier recours: ${lastResort ? `${lastResort.molecule} (${disease.lastResort}, classe ${lastResort.awareClass}) — UNIQUEMENT si échec des deux premières lignes` : 'Non applicable'}. ` +
            `Facteurs d'âge — Poussins (0-14j): ${disease.ageFactors.poussins_0_14j}. ` +
            `Poulets (15-35j): ${disease.ageFactors.poulets_15_35j}. ` +
            `Pondeuses: ${disease.ageFactors.pondeuses}.`;

        documents.push({
            id: `disease-${key}`,
            content,
            metadata: { type: 'disease', name: disease.name, key },
            source: 'regulatory',
            category: 'disease_info'
        });
    }

    // 4. Tunisian Regulations
    for (let i = 0; i < regulatory.tunisianRegulations.rules.length; i++) {
        documents.push({
            id: `regulation-${i}`,
            content: `Réglementation DGSV (Direction Générale des Services Vétérinaires de Tunisie): ${regulatory.tunisianRegulations.rules[i]}`,
            metadata: { type: 'regulation', index: i, authority: 'DGSV' },
            source: 'regulatory',
            category: 'tunisian_law'
        });
    }

    // 5. Withdrawal Period Reference
    const withdrawalContent = Object.entries(regulatory.tunisianRegulations.withdrawalMinimums)
        .map(([code, days]) => {
            const drug = regulatory.drugs[code];
            return `${drug?.molecule || code} (${code}): délai de retrait minimum ${days} jours`;
        }).join('. ');

    documents.push({
        id: 'withdrawal-reference',
        content: `Référence délais de retrait antibiotiques en aviculture (réglementation tunisienne DGSV): ${withdrawalContent}. ` +
            `Le délai de retrait est la période minimale entre la dernière administration d'un antibiotique et l'abattage de l'animal. ` +
            `Ce délai ne peut être réduit en aucun cas. Le non-respect est une infraction pénale.`,
        metadata: { type: 'withdrawal_reference' },
        source: 'regulatory',
        category: 'withdrawal_periods'
    });

    // 6. Common Q&A patterns for farmers
    const farmerQA = [
        {
            id: 'faq-quand-vendre',
            content: `Question fréquente d'éleveur: Quand puis-je vendre ou abattre mes animaux après un traitement antibiotique? ` +
                `Réponse: Vous devez attendre la fin du délai de retrait indiqué sur la prescription de votre vétérinaire. ` +
                `Ce délai varie selon l'antibiotique utilisé: Amoxicilline 5 jours, Tétracycline 10 jours, Érythromycine 7 jours, Colistine 7 jours. ` +
                `Le système SAFAR calcule automatiquement la date de fin de retrait. Ne vendez ou n'abattez JAMAIS avant cette date.`,
            metadata: { type: 'faq', audience: 'farmer' },
            source: 'faq',
            category: 'farmer_guidance'
        },
        {
            id: 'faq-symptomes-urgence',
            content: `Question fréquente d'éleveur: Mes poulets sont malades, que faire en urgence? ` +
                `Réponse: 1) Isolez les animaux malades du reste du lot. 2) Notez les symptômes (toux, diarrhée, décharge nasale, mortalité). ` +
                `3) Contactez votre vétérinaire IMMÉDIATEMENT. 4) Ne donnez JAMAIS d'antibiotiques sans prescription vétérinaire. ` +
                `5) Assurez une bonne ventilation et un accès à l'eau propre. Le vétérinaire décidera du traitement approprié.`,
            metadata: { type: 'faq', audience: 'farmer' },
            source: 'faq',
            category: 'farmer_guidance'
        },
        {
            id: 'faq-tracabilite',
            content: `Question fréquente de consommateur: Comment fonctionne la traçabilité SAFAR? ` +
                `Réponse: SAFAR enregistre sur la blockchain chaque étape du parcours des antibiotiques vétérinaires: ` +
                `1) La vente par la pharmacie. 2) La prescription par le vétérinaire. 3) L'administration par l'éleveur. ` +
                `4) La vérification par l'abattoir. Chaque étape est signée numériquement et immuable. ` +
                `Le consommateur peut scanner le QR code du produit pour voir tout l'historique.`,
            metadata: { type: 'faq', audience: 'consumer' },
            source: 'faq',
            category: 'consumer_info'
        },
        {
            id: 'faq-resistance',
            content: `Information sur la résistance antimicrobienne (RAM/AMR): L'utilisation excessive ou inappropriée d'antibiotiques ` +
                `en élevage contribue à l'émergence de bactéries résistantes qui peuvent se transmettre à l'humain. ` +
                `La classification AWaRe de l'OMS guide l'utilisation prudente: privilégier les antibiotiques Access (faible risque), ` +
                `limiter les Watch (risque élevé), et réserver les Reserve (dernier recours). ` +
                `En Tunisie, la Colistine (classe Reserve) est particulièrement surveillée en raison du gène mcr-1 de résistance.`,
            metadata: { type: 'educational', topic: 'AMR' },
            source: 'educational',
            category: 'amr_awareness'
        }
    ];

    documents.push(...farmerQA);

    // Index all documents
    const added = await vectorStore.addDocuments(documents);
    console.log(`[RAG] Indexed ${added}/${documents.length} documents into vector store`);

    return { indexed: added, total: documents.length, status: 'OK' };
}

/**
 * Index a prescription into the vector store (called when a prescription is created)
 */
async function indexPrescription(prescription) {
    try {
        const drug = regulatory.drugs[prescription.atcCode];
        const content = `Prescription vétérinaire: Diagnostic: ${prescription.diagnosis}. ` +
            `Antibiotique: ${drug?.molecule || prescription.atcCode} (classe ${prescription.awareClass || 'inconnue'}). ` +
            `Lot animal: ${prescription.animalLotId}. Dosage: ${prescription.dosage} mg/kg. ` +
            `Délai de retrait: ${prescription.withdrawalDays} jours. ` +
            `Date de début: ${prescription.startDate}. Fin de retrait: ${prescription.withdrawalEnd}.`;

        await vectorStore.addDocument(
            `rx-${prescription.rxId}`,
            content,
            {
                type: 'prescription',
                rxId: prescription.rxId,
                vetId: prescription.vetId,
                farmerId: prescription.farmerId,
                lotId: prescription.animalLotId
            },
            'prescription',
            'prescription_history'
        );
    } catch (e) {
        console.error('[RAG] Failed to index prescription:', e.message);
    }
}

module.exports = { indexKnowledgeBase, indexPrescription };
