// ============================================
// SAFAR Chain — AI Output Guardrails
// Validates, filters, and sanitizes all LLM output
// ============================================
const regulatory = require('./knowledge/regulatory.json');

// ---- PII Patterns ----
const PII_PATTERNS = [
    { regex: /0x[a-fA-F0-9]{40}/g, replacement: '[adresse vérifiée]' },           // Wallet addresses
    { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: '[email protégé]' },  // Emails
    { regex: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, replacement: '[ID protégé]' }, // UUIDs — BEFORE phone
    { regex: /(\+?216|00216)?[\s.-]?\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/g, replacement: '[téléphone protégé]' }, // TN phones
    { regex: /wallet[_\s]?address[:\s]+\S+/gi, replacement: '[adresse protégée]' },
    { regex: /private[_\s]?key[:\s]+\S+/gi, replacement: '[CENSURÉ]' },
    { regex: /secret[:\s]+\S+/gi, replacement: '[CENSURÉ]' },
    { regex: /password[:\s]+\S+/gi, replacement: '[CENSURÉ]' },
];

// ---- Dangerous content patterns ----
const DANGEROUS_PATTERNS = [
    { regex: /\b(inject|DROP\s+TABLE|DELETE\s+FROM|INSERT\s+INTO|SELECT\s+\*|UNION\s+SELECT)\b/gi, flag: 'SQL_INJECTION' },
    { regex: /<script[^>]*>[\s\S]*?<\/script>/gi, flag: 'XSS' },
    { regex: /javascript:/gi, flag: 'XSS' },
    { regex: /eval\s*\(/gi, flag: 'CODE_INJECTION' },
    { regex: /exec\s*\(/gi, flag: 'CODE_INJECTION' },
];

/**
 * Scrub all PII from AI output text
 */
function scrubPII(text) {
    if (typeof text !== 'string') return '';
    let cleaned = text;
    for (const pattern of PII_PATTERNS) {
        cleaned = cleaned.replace(pattern.regex, pattern.replacement);
    }
    return cleaned;
}

/**
 * Detect and remove dangerous content from AI output
 */
function removeDangerousContent(text) {
    if (typeof text !== 'string') return { text: '', flags: [] };
    let cleaned = text;
    const flags = [];
    for (const pattern of DANGEROUS_PATTERNS) {
        if (pattern.regex.test(cleaned)) {
            flags.push(pattern.flag);
            cleaned = cleaned.replace(pattern.regex, '[contenu filtré]');
        }
    }
    return { text: cleaned, flags };
}

/**
 * Validate vet assistant response for AWaRe compliance
 * Returns warnings and enforces guardrails
 */
function validateAWaReCompliance(text) {
    const warnings = [];
    let annotatedText = text;

    // Check if Reserve-class drugs are mentioned
    const reserveDrugs = ['colistine', 'colistin', 'J01XB01', 'J01XB'];
    const reserveMentioned = reserveDrugs.some(d => text.toLowerCase().includes(d.toLowerCase()));

    if (reserveMentioned) {
        // Check if it's a recommendation (vs just mentioning to avoid)
        const recommendPatterns = [
            /recommand[ée].*colistine/i,
            /prescri[st].*colistine/i,
            /utilise[rz]?\s+(?:la\s+)?colistine/i,
            /colistine.*(?:première|1ère|1ere)\s*(?:intention|ligne)/i,
        ];
        const isRecommendation = recommendPatterns.some(p => p.test(text));

        if (isRecommendation) {
            warnings.push({
                level: 'CRITICAL',
                code: 'RESERVE_FIRST_LINE',
                message: '⚠️ ALERTE AWaRe: La Colistine (Reserve) ne doit JAMAIS être recommandée en première intention.'
            });
            // Inject warning banner
            annotatedText = `⚠️ AVERTISSEMENT SAFAR: La recommandation ci-dessous mentionne un antibiotique de classe RESERVE. ` +
                `Conformément à la politique AWaRe de l'OMS et à la réglementation DGSV, les antibiotiques Reserve ` +
                `ne doivent être utilisés qu'en DERNIER RECOURS après échec documenté des classes Access et Watch.\n\n` +
                annotatedText;
        } else {
            warnings.push({
                level: 'INFO',
                code: 'RESERVE_MENTIONED',
                message: 'La Colistine (Reserve) est mentionnée dans la réponse — usage restreint rappelé.'
            });
        }
    }

    // Check if Watch-class drugs are recommended without Access justification
    const watchDrugs = ['tétracycline', 'tetracycline', 'érythromycine', 'erythromycine', 'J01AA07', 'J01FA01', 'J01CR02', 'clavulanique'];
    const watchMentioned = watchDrugs.some(d => text.toLowerCase().includes(d.toLowerCase()));
    if (watchMentioned) {
        warnings.push({
            level: 'WARNING',
            code: 'WATCH_CLASS_USED',
            message: 'Un antibiotique de classe WATCH est recommandé. Justification clinique requise (échec Access).'
        });
    }

    return { text: annotatedText, warnings };
}

/**
 * Check response quality — minimum standards
 */
function checkResponseQuality(text, type = 'general') {
    const issues = [];

    // Minimum length
    if (text.length < 30) {
        issues.push('RESPONSE_TOO_SHORT');
    }

    // Maximum length guard
    if (text.length > 5000) {
        text = text.slice(0, 5000) + '\n\n[Réponse tronquée pour des raisons de sécurité]';
        issues.push('RESPONSE_TRUNCATED');
    }

    // For vet responses: must contain at least one drug mention or medical term
    if (type === 'vet') {
        const hasMedicalContent = /J01|antibiotique|traitement|infection|dose|retrait|mg|jour/i.test(text);
        if (!hasMedicalContent) {
            issues.push('NO_MEDICAL_CONTENT');
        }
    }

    // Check for obvious hallucination patterns
    const hallucinations = [
        /en tant qu['']IA|en tant que modèle|je suis un assistant/i,
        /je ne suis pas un vétérinaire/i,
        /I don't|I cannot|I am not/i,  // English leaking into French context
    ];
    for (const pattern of hallucinations) {
        if (pattern.test(text)) {
            issues.push('POTENTIAL_HALLUCINATION');
            break;
        }
    }

    return { text, issues, passed: issues.length === 0 };
}

/**
 * Emergency fallback responses when LLM output fails validation
 */
const FALLBACK_RESPONSES = {
    vet: `Pour les symptômes décrits, je recommande de consulter les lignes directrices suivantes:

1. En première intention: Amoxicilline (J01CA04, classe Access) — 10-20 mg/kg/jour pendant 3-5 jours, délai de retrait 5 jours.
2. Si insuffisant: Tétracycline (J01AA07, classe Watch) — 20-50 mg/kg/jour pendant 5-7 jours, délai de retrait 10 jours.
3. JAMAIS en première intention: Colistine (J01XB01, classe Reserve) — réservée aux infections multi-résistantes.

⚠️ Cette recommandation est générique. Un diagnostic clinique précis et un antibiogramme sont recommandés.`,

    farmer: `Je vous recommande de contacter votre vétérinaire pour obtenir des informations précises sur votre lot. En attendant:

• Vérifiez les dates de retrait sur votre application SAFAR
• N'abattez pas les animaux avant la fin du délai de retrait
• Gardez un suivi quotidien de l'état de santé de votre lot

Pour toute question médicale, contactez votre vétérinaire référent.`,

    trace: `Ce produit fait partie du programme de traçabilité SAFAR. Les informations de traitement antibiotique et de conformité sont enregistrées sur la blockchain, garantissant leur authenticité et leur immuabilité. Les délais de retrait réglementaires ont été respectés avant la certification du lot.`
};

/**
 * Get fallback response for a given type
 */
function getFallback(type) {
    return FALLBACK_RESPONSES[type] || FALLBACK_RESPONSES.trace;
}

/**
 * FULL OUTPUT PIPELINE — run all guardrails in sequence
 * Returns the sanitized text + metadata about what was filtered
 */
function processOutput(rawText, type = 'general') {
    const pipeline = { raw: rawText, steps: [], warnings: [], usedFallback: false };

    let text = rawText;

    // Step 1: Remove dangerous content
    const { text: safetyCleaned, flags } = removeDangerousContent(text);
    text = safetyCleaned;
    if (flags.length > 0) {
        pipeline.steps.push({ step: 'DANGEROUS_CONTENT_REMOVED', flags });
    }

    // Step 2: Scrub PII
    const piiCleaned = scrubPII(text);
    if (piiCleaned !== text) {
        pipeline.steps.push({ step: 'PII_SCRUBBED' });
    }
    text = piiCleaned;

    // Step 3: AWaRe compliance (vet responses only)
    if (type === 'vet') {
        const { text: awareText, warnings } = validateAWaReCompliance(text);
        text = awareText;
        pipeline.warnings.push(...warnings);
        if (warnings.length > 0) {
            pipeline.steps.push({ step: 'AWARE_COMPLIANCE_CHECKED', warnings: warnings.length });
        }
    }

    // Step 4: Quality check
    const quality = checkResponseQuality(text, type);
    text = quality.text;
    if (!quality.passed) {
        pipeline.steps.push({ step: 'QUALITY_CHECK', issues: quality.issues });

        // Use fallback if quality is too low
        if (quality.issues.includes('RESPONSE_TOO_SHORT') || quality.issues.includes('NO_MEDICAL_CONTENT')) {
            text = getFallback(type);
            pipeline.usedFallback = true;
            pipeline.steps.push({ step: 'FALLBACK_USED', type });
        }
    }

    pipeline.finalText = text;
    return pipeline;
}

module.exports = {
    scrubPII,
    removeDangerousContent,
    validateAWaReCompliance,
    checkResponseQuality,
    getFallback,
    processOutput
};
