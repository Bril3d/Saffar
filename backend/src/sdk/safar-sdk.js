// ============================================
// SAFAR Chain — Blockchain SDK (REAL ethers.js v6)
// Connects to live Hardhat node via BLOCKCHAIN_RPC
// Addresses & ABIs loaded from shared/contracts.json
// ============================================
const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

// ---- Load deployed contract metadata ----
const CONTRACTS_PATH = path.join(__dirname, '..', '..', '..', 'shared', 'contracts.json');

let _contracts = null;

function loadContracts() {
    if (_contracts) return _contracts;
    if (!fs.existsSync(CONTRACTS_PATH)) {
        throw new Error(
            `[SDK] contracts.json not found at ${CONTRACTS_PATH}.\n` +
            `Run: npm run deploy:local  (from blockchain/contracts/)`
        );
    }
    _contracts = JSON.parse(fs.readFileSync(CONTRACTS_PATH, 'utf-8'));
    return _contracts;
}

// ---- Provider & Relayer signer ----
let _provider = null;
let _relayer = null;

function getProvider() {
    if (!_provider) {
        const rpc = process.env.BLOCKCHAIN_RPC || 'http://127.0.0.1:8545';
        _provider = new ethers.JsonRpcProvider(rpc);
    }
    return _provider;
}

function getRelayer() {
    if (!_relayer) {
        const key = process.env.RELAYER_PRIVATE_KEY;
        if (!key) throw new Error('[SDK] RELAYER_PRIVATE_KEY not set in .env');
        _relayer = new ethers.Wallet(key, getProvider());
    }
    return _relayer;
}

// ---- Contract factory helpers ----
function getContract(name, signerOrProvider) {
    const meta = loadContracts();
    const address = meta.addresses[name];
    const abi = meta.abis[name];
    if (!address || !abi) throw new Error(`[SDK] Contract '${name}' not found in contracts.json`);
    return new ethers.Contract(address, abi, signerOrProvider || getProvider());
}

// ---- Hardhat account map (seeded by seed-demo.js) ----
// Index 0 = admin/deployer, 1 = pharmacy, 2 = vet, 3 = farmer, 4 = slaughterhouse
const HARDHAT_ACCOUNTS = [
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', // admin
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', // pharmacy
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', // vet
    '0x90F79bf6EB2c4f870365E785982E1f101E93b906', // farmer
    '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', // slaughterhouse
];

const HARDHAT_KEYS = [
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
    '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
    '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
];

const _managedSigners = new Map();

function getSignerForAddress(address) {
    const idx = HARDHAT_ACCOUNTS.findIndex(a => a.toLowerCase() === address.toLowerCase());
    if (idx === -1) throw new Error(`[SDK] No private key for address ${address}`);
    const key = HARDHAT_ACCOUNTS[idx].toLowerCase();
    if (_managedSigners.has(key)) {
        return _managedSigners.get(key);
    }

    const wallet = new ethers.Wallet(HARDHAT_KEYS[idx], getProvider());
    const signer = new ethers.NonceManager(wallet);
    _managedSigners.set(key, signer);
    return signer;
}

// ====================================================
// PUBLIC SDK API — mirrors mock interface exactly
// ====================================================

/**
 * Register a drug sale on-chain (called by pharmacy)
 */
async function registerSale({ pharmacyAddress, vetAddress, atcCode, batchNumber, quantity, awareClass }) {
    const signer = getSignerForAddress(pharmacyAddress);
    const drugRegistry = getContract('drugRegistry', signer);

    const tx = await drugRegistry.registerSale(vetAddress, atcCode, batchNumber, BigInt(quantity), awareClass);
    const receipt = await tx.wait();

    // Parse SaleRegistered event to get saleId
    const iface = new ethers.Interface(loadContracts().abis.drugRegistry);
    let saleId = null;
    for (const log of receipt.logs) {
        try {
            const parsed = iface.parseLog(log);
            if (parsed && parsed.name === 'SaleRegistered') {
                saleId = parsed.args.saleId.toString();
                break;
            }
        } catch {}
    }

    return { saleId, txHash: receipt.hash };
}

/**
 * Get a drug sale from the chain
 */
async function getSale(saleId) {
    const drugRegistry = getContract('drugRegistry');
    try {
        const sale = await drugRegistry.getSale(BigInt(saleId));
        return {
            saleId: saleId.toString(),
            pharmacy: sale.pharmacy,
            veterinarian: sale.veterinarian,
            atcCode: sale.atcCode,
            batchNumber: sale.batchNumber,
            quantity: sale.quantity.toString(),
            awareClass: sale.awareClass,
            timestamp: sale.timestamp.toString(),
            active: sale.active,
        };
    } catch {
        return null;
    }
}

/**
 * Create a prescription on-chain (called by vet, relayed on behalf of vet)
 * NOTE: saleId here is the on-chain numeric ID (string or number)
 */
async function createPrescription({ saleId, vetAddress, farmerAddress, animalLotId, diagnosis, dosage, withdrawalDays }) {
    const signer = getSignerForAddress(vetAddress);
    const prescriptionRegistry = getContract('prescriptionRegistry', signer);

    const tx = await prescriptionRegistry.createPrescription(
        BigInt(saleId),
        farmerAddress,
        animalLotId,
        diagnosis,
        BigInt(dosage),
        BigInt(withdrawalDays || 0)
    );
    const receipt = await tx.wait();

    // Parse PrescriptionCreated event for rxId and withdrawalEnd
    const iface = new ethers.Interface(loadContracts().abis.prescriptionRegistry);
    let rxId = null;
    let withdrawalEnd = null;
    for (const log of receipt.logs) {
        try {
            const parsed = iface.parseLog(log);
            if (parsed && parsed.name === 'PrescriptionCreated') {
                rxId = parsed.args.rxId.toString();
                withdrawalEnd = new Date(Number(parsed.args.withdrawalEnd) * 1000).toISOString();
                break;
            }
        } catch {}
    }

    // Derive effective withdrawal from on-chain data
    const rx = await prescriptionRegistry.getPrescription(BigInt(rxId));
    const effectiveWithdrawal = Number((rx.withdrawalEnd - rx.startDate) / BigInt(86400));

    return { rxId, txHash: receipt.hash, withdrawalEnd, effectiveWithdrawal };
}

/**
 * Confirm administration (called by farmer, relayed on behalf of farmer)
 */
async function confirmAdministration(rxId, farmerAddress) {
    const signer = getSignerForAddress(farmerAddress);
    const prescriptionRegistry = getContract('prescriptionRegistry', signer);

    const tx = await prescriptionRegistry.confirmAdministration(BigInt(rxId));
    const receipt = await tx.wait();

    // Read updated prescription
    const rx = await prescriptionRegistry.getPrescription(BigInt(rxId));
    return {
        confirmed: rx.administered,
        txHash: receipt.hash,
        adminTimestamp: new Date(Number(rx.adminTimestamp) * 1000).toISOString(),
    };
}

/**
 * Get a prescription from the chain
 */
async function getPrescription(rxId) {
    const prescriptionRegistry = getContract('prescriptionRegistry');
    try {
        const rx = await prescriptionRegistry.getPrescription(BigInt(rxId));
        return {
            rxId: rxId.toString(),
            drugSaleId: rx.drugSaleId.toString(),
            veterinarian: rx.veterinarian,
            farmer: rx.farmer,
            animalLotId: rx.animalLotId,
            diagnosis: rx.diagnosis,
            dosage: rx.dosage.toString(),
            startDate: rx.startDate.toString(),
            withdrawalEnd: rx.withdrawalEnd.toString(),
            administered: rx.administered,
            adminTimestamp: rx.adminTimestamp.toString(),
        };
    } catch {
        return null;
    }
}

/**
 * Check lot eligibility for slaughter (read-only, any caller)
 */
async function checkEligibility(animalLotId, rxId) {
    const slaughterGate = getContract('slaughterGate');
    const prescriptionRegistry = getContract('prescriptionRegistry');

    // [DEMO HACK]: Automatically fast-forward Hardhat network time 
    // so the user can demo the full flow without waiting 47 real days.
    try {
        const rx = await prescriptionRegistry.getPrescription(BigInt(rxId));
        if (rx.administered) {
            const block = await getProvider().getBlock('latest');
            if (block.timestamp < rx.withdrawalEnd) {
                const diff = Number(rx.withdrawalEnd) - block.timestamp + 3600; // Fast forward to 1 hour after withdrawal ends
                await getProvider().send("evm_increaseTime", [diff]);
                await getProvider().send("evm_mine", []);
                console.log(`[DEMO HACK] ⏳ Fast-forwarded blockchain time by ${diff} seconds to make lot eligible!`);
            }
        }
    } catch (e) {
        console.log("[DEMO HACK] Could not fast-forward time:", e.message);
    }

    try {
        const result = await slaughterGate.checkEligibility(animalLotId, BigInt(rxId));
        return {
            eligible: result[0],
            daysRemaining: Number(result[1]),
        };
    } catch (e) {
        return { eligible: false, daysRemaining: -1, message: e.message };
    }
}

/**
 * Certify a lot as eligible (called by slaughterhouse)
 */
async function certifyLot(animalLotId, rxId, slaughterhouseAddress) {
    const signer = getSignerForAddress(slaughterhouseAddress);
    const slaughterGate = getContract('slaughterGate', signer);

    const tx = await slaughterGate.certifyLot(animalLotId, BigInt(rxId));
    const receipt = await tx.wait();

    // Parse LotCertified event
    const iface = new ethers.Interface(loadContracts().abis.slaughterGate);
    let certificateHash = null;
    for (const log of receipt.logs) {
        try {
            const parsed = iface.parseLog(log);
            if (parsed && parsed.name === 'LotCertified') {
                certificateHash = parsed.args.certificateHash;
                break;
            }
        } catch {}
    }

    return { certificateHash, txHash: receipt.hash };
}

/**
 * Verify a certificate hash (read-only)
 */
async function verifyCertificate(certificateHash) {
    const slaughterGate = getContract('slaughterGate');
    const valid = await slaughterGate.verifyCertificate(certificateHash);
    return { valid };
}

/**
 * Get full lot traceability (read-only)
 */
async function getLotVerification(animalLotId) {
    const slaughterGate = getContract('slaughterGate');
    const v = await slaughterGate.getLotVerification(animalLotId);
    return {
        animalLotId: v.animalLotId,
        slaughterhouse: v.slaughterhouse,
        eligible: v.eligible,
        timestamp: v.timestamp.toString(),
        certificateHash: v.certificateHash,
    };
}

/**
 * Get on-chain role for an address
 */
async function getRole(address) {
    const accessControl = getContract('accessControl');
    const role = await accessControl.getRole(address);
    const ROLE_NAMES = ['NONE', 'PHARMACY', 'VETERINARIAN', 'FARMER', 'SLAUGHTERHOUSE', 'ADMIN'];
    return ROLE_NAMES[Number(role)] || 'UNKNOWN';
}

/**
 * Health-check: ping the chain
 */
async function ping() {
    const provider = getProvider();
    const block = await provider.getBlockNumber();
    return { connected: true, latestBlock: block };
}

// Reset not applicable for real chain — kept for API compat
function resetChainState() {
    console.warn('[SDK] resetChainState() is a no-op on the real chain');
}

// Legacy LEGAL_WITHDRAWAL_DAYS (mirrors DrugWithdrawalRegistry) for local reference only
const LEGAL_WITHDRAWAL_DAYS = {
    'J01XB01': 7,
    'J01CA04': 5,
    'J01AA07': 10,
    'J01FA01': 7,
    'J01DC02': 5,
    'J01EE01': 10,
};

module.exports = {
    registerSale,
    getSale,
    createPrescription,
    confirmAdministration,
    getPrescription,
    checkEligibility,
    certifyLot,
    verifyCertificate,
    getLotVerification,
    getRole,
    ping,
    resetChainState,
    LEGAL_WITHDRAWAL_DAYS,
    HARDHAT_ACCOUNTS,
    getProvider,
    getRelayer,
};
