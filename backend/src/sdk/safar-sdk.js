// ============================================
// SAFAR Chain — Blockchain SDK Mock Layer
// Simulates smart contract interactions
// SWAP THIS FOR REAL ethers.js CALLS WHEN
// Dev 1 DELIVERS CONTRACTS
// ============================================
const crypto = require('crypto');

// In-memory store for mock blockchain state
const chainState = {
    sales: new Map(),
    prescriptions: new Map(),
    certifications: new Map(),
    saleCounter: 0,
    rxCounter: 0
};

// Legal minimum withdrawal days per ATC code (mirrors DrugWithdrawalRegistry)
const LEGAL_WITHDRAWAL_DAYS = {
    'J01XB01': 7,   // Colistine
    'J01CA04': 5,   // Amoxicilline
    'J01AA07': 10,  // Tetracycline
    'J01CE01': 5,   // Benzylpenicilline
    'J01DB01': 7,   // Cefalexine
    'J01FA01': 7,   // Erythromycine
    'J01CR02': 7,   // Amoxicilline + Ac. clavulanique
};

function generateTxHash() {
    return '0x' + crypto.randomBytes(32).toString('hex');
}

function generateCertificateHash(lotId, timestamp) {
    return '0x' + crypto.createHash('sha256')
        .update(`${lotId}:${timestamp}:${crypto.randomBytes(16).toString('hex')}`)
        .digest('hex');
}

/**
 * Register a drug sale on the "blockchain"
 */
function registerSale({ pharmacyAddress, vetAddress, atcCode, batchNumber, quantity, awareClass }) {
    chainState.saleCounter++;
    const saleId = `SALE-${chainState.saleCounter}`;
    const txHash = generateTxHash();
    const sale = {
        saleId,
        pharmacy: pharmacyAddress,
        veterinarian: vetAddress,
        atcCode,
        batchNumber,
        quantity,
        awareClass,
        timestamp: Date.now(),
        txHash
    };
    chainState.sales.set(saleId, sale);
    return { saleId, txHash };
}

/**
 * Get a drug sale from the "blockchain"
 */
function getSale(saleId) {
    return chainState.sales.get(saleId) || null;
}

/**
 * Create a prescription on the "blockchain"
 * Enforces legal minimum withdrawal days (mirrors DrugWithdrawalRegistry)
 */
function createPrescription({ saleId, vetAddress, farmerAddress, animalLotId, diagnosis, dosage, withdrawalDays }) {
    const sale = chainState.sales.get(saleId);
    if (!sale) throw new Error('Drug sale not found on chain');

    // SECURITY: Enforce legal minimum withdrawal
    const legalMin = LEGAL_WITHDRAWAL_DAYS[sale.atcCode] || 5;
    const effectiveWithdrawal = Math.max(withdrawalDays || 0, legalMin);

    chainState.rxCounter++;
    const rxId = `RX-${chainState.rxCounter}`;
    const txHash = generateTxHash();
    const startDate = Date.now();
    const withdrawalEnd = startDate + (effectiveWithdrawal * 24 * 60 * 60 * 1000);

    const prescription = {
        rxId,
        drugSaleId: saleId,
        veterinarian: vetAddress,
        farmer: farmerAddress,
        animalLotId,
        diagnosis,
        dosage,
        startDate,
        withdrawalDays: effectiveWithdrawal,
        withdrawalEnd,
        administered: false,
        adminTimestamp: null,
        txHash
    };
    chainState.prescriptions.set(rxId, prescription);
    return { rxId, txHash, withdrawalEnd: new Date(withdrawalEnd).toISOString(), effectiveWithdrawal };
}

/**
 * Confirm administration of a prescription
 */
function confirmAdministration(rxId) {
    const rx = chainState.prescriptions.get(rxId);
    if (!rx) throw new Error('Prescription not found on chain');
    if (rx.administered) throw new Error('Already administered');

    rx.administered = true;
    rx.adminTimestamp = Date.now();
    const txHash = generateTxHash();
    return { confirmed: true, txHash, adminTimestamp: new Date(rx.adminTimestamp).toISOString() };
}

/**
 * Get a prescription from the "blockchain"
 */
function getPrescription(rxId) {
    return chainState.prescriptions.get(rxId) || null;
}

/**
 * Check lot eligibility for slaughter
 * Returns eligible = true if withdrawal period has passed
 */
function checkEligibility(animalLotId) {
    // Find all prescriptions for this lot
    const prescriptions = [];
    for (const rx of chainState.prescriptions.values()) {
        if (rx.animalLotId === animalLotId) {
            prescriptions.push(rx);
        }
    }

    if (prescriptions.length === 0) {
        return { eligible: true, daysRemaining: 0, message: 'No treatments recorded for this lot' };
    }

    // Check all prescriptions — lot is only eligible if ALL withdrawal periods have passed
    const now = Date.now();
    let maxWithdrawalEnd = 0;
    for (const rx of prescriptions) {
        if (!rx.administered) {
            return { eligible: false, daysRemaining: -1, message: 'Treatment not yet administered' };
        }
        if (rx.withdrawalEnd > maxWithdrawalEnd) {
            maxWithdrawalEnd = rx.withdrawalEnd;
        }
    }

    const eligible = now >= maxWithdrawalEnd;
    const daysRemaining = eligible ? 0 : Math.ceil((maxWithdrawalEnd - now) / (24 * 60 * 60 * 1000));

    return { eligible, daysRemaining, withdrawalEnd: new Date(maxWithdrawalEnd).toISOString() };
}

/**
 * Certify a lot as eligible for slaughter
 */
function certifyLot(animalLotId, slaughterhouseAddress) {
    const eligibility = checkEligibility(animalLotId);
    if (!eligibility.eligible) {
        throw new Error(`Lot not eligible. ${eligibility.daysRemaining} days remaining`);
    }

    const txHash = generateTxHash();
    const certificateHash = generateCertificateHash(animalLotId, Date.now());

    const certification = {
        animalLotId,
        slaughterhouse: slaughterhouseAddress,
        eligible: true,
        timestamp: Date.now(),
        certificateHash,
        txHash
    };
    chainState.certifications.set(animalLotId, certification);
    return { certificateHash, txHash };
}

/**
 * Verify a certificate hash
 */
function verifyCertificate(certificateHash) {
    for (const cert of chainState.certifications.values()) {
        if (cert.certificateHash === certificateHash) {
            return { valid: true, certification: cert };
        }
    }
    return { valid: false };
}

/**
 * Get full chain state for a lot (used for traceability)
 */
function getLotTraceability(animalLotId) {
    const prescriptions = [];
    for (const rx of chainState.prescriptions.values()) {
        if (rx.animalLotId === animalLotId) {
            const sale = chainState.sales.get(rx.drugSaleId);
            prescriptions.push({ prescription: rx, drugSale: sale });
        }
    }
    const certification = chainState.certifications.get(animalLotId) || null;
    return { prescriptions, certification };
}

/**
 * Reset chain state (for testing)
 */
function resetChainState() {
    chainState.sales.clear();
    chainState.prescriptions.clear();
    chainState.certifications.clear();
    chainState.saleCounter = 0;
    chainState.rxCounter = 0;
}

module.exports = {
    registerSale,
    getSale,
    createPrescription,
    confirmAdministration,
    getPrescription,
    checkEligibility,
    certifyLot,
    verifyCertificate,
    getLotTraceability,
    resetChainState,
    LEGAL_WITHDRAWAL_DAYS
};
