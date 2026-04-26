#!/usr/bin/env node
// ============================================================
// SAFAR Chain — Integration Test (Blockchain ↔ Backend)
// Tests the FULL flow: drug sale → prescription → confirm → certify
//
// Requirements:
//   1. Hardhat node running:  npx hardhat node
//   2. Contracts deployed:    npm run deploy:local   (in contracts/)
//   3. Backend running:       node server.js          (in backend/)
//
// Run: node tests/integration-blockchain.js
// ============================================================
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const http = require('http');
const { ethers } = require('ethers');
const { getDb } = require('../src/db/db');
const { generateToken } = require('../src/middleware/auth');
const sdk = require('../src/sdk/safar-sdk');

// ---- Test utilities ----
let passed = 0;
let failed = 0;

function ok(label, condition, detail = '') {
    if (condition) {
        console.log(`  ✅ ${label}`);
        passed++;
    } else {
        console.error(`  ❌ ${label}${detail ? ': ' + detail : ''}`);
        failed++;
    }
}

function section(title) {
    console.log(`\n${'─'.repeat(55)}`);
    console.log(`  ${title}`);
    console.log('─'.repeat(55));
}

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ---- Hardhat accounts (index 0 = deployer/admin, 1=pharmacy, 2=vet, 3=farmer, 4=slaughterhouse) ----
const ACCOUNTS = sdk.HARDHAT_ACCOUNTS;

// ---- Main test runner ----
async function runIntegrationTests() {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║   SAFAR Chain — Blockchain ↔ Backend Integration     ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    // ─────────────────────────────────────────
    // [0] Connectivity checks
    // ─────────────────────────────────────────
    section('[0] Connectivity Checks');

    let chainOk = false;
    try {
        const ping = await sdk.ping();
        chainOk = ping.connected;
        ok('Hardhat node reachable', ping.connected, `block ${ping.latestBlock}`);
    } catch (e) {
        ok('Hardhat node reachable', false, e.message);
    }

    if (!chainOk) {
        console.error('\n⛔ Cannot reach Hardhat node. Is it running? (npx hardhat node)');
        process.exit(1);
    }

    let contractsOk = false;
    try {
        const role = await sdk.getRole(ACCOUNTS[1]); // pharmacy account
        // After deploy+seed pharmacy is registered as PHARMACY
        contractsOk = role !== 'UNKNOWN';
        ok('Contracts loaded from contracts.json', true);
        ok('AccessControl: pharmacy role readable', role !== 'NONE', `role=${role}`);
    } catch (e) {
        ok('Contracts loaded', false, e.message);
    }

    // ─────────────────────────────────────────
    // [1] Seed test users in SQLite (local DB actors with Hardhat wallets)
    // ─────────────────────────────────────────
    section('[1] Seeding Test Users in SQLite DB');

    const db = getDb();

    // Upsert actors (delete+insert to ensure clean state)
    const testUsers = [
        { id: 'test-pharmacy-1', wallet: ACCOUNTS[1], role: 'PHARMACY', name: 'Test Pharmacy', email: 'pharmacy@test.local' },
        { id: 'test-vet-1',      wallet: ACCOUNTS[2], role: 'VET',      name: 'Dr. Test Vet', email: 'vet@test.local'      },
        { id: 'test-farmer-1',   wallet: ACCOUNTS[3], role: 'FARMER',   name: 'Test Farmer',  email: 'farmer@test.local'   },
        { id: 'test-slaughter-1',wallet: ACCOUNTS[4], role: 'SLAUGHTERHOUSE', name: 'Test Abattoir', email: 'slaughter@test.local' },
    ];

    for (const u of testUsers) {
        // Clean up dependent rows first to avoid FK constraint violations
        db.prepare('DELETE FROM prescriptions_offchain WHERE vet_id = ? OR farmer_id = ?').run(u.id, u.id);
        db.prepare('DELETE FROM drug_sales_offchain WHERE pharmacy_id = ? OR vet_id = ?').run(u.id, u.id);
        db.prepare('DELETE FROM lot_certifications WHERE slaughterhouse_id = ?').run(u.id);
        db.prepare('DELETE FROM orders WHERE consumer_id = ? OR farmer_id = ?').run(u.id, u.id);
        db.prepare('DELETE FROM products WHERE farmer_id = ?').run(u.id);
        db.prepare('DELETE FROM users WHERE id = ? OR wallet_address = ?').run(u.id, u.wallet.toLowerCase());
        db.prepare(`
            INSERT INTO users (id, wallet_address, role, name, email, verified)
            VALUES (?, ?, ?, ?, ?, 1)
        `).run(u.id, u.wallet.toLowerCase(), u.role, u.name, u.email);
        ok(`User seeded: ${u.role}`, true);
    }

    // ─────────────────────────────────────────
    // [2] Drug Sale (Pharmacy registers on-chain)
    // ─────────────────────────────────────────
    section('[2] Drug Sale Registration');

    let saleId;
    let saleTxHash;
    try {
        const result = await sdk.registerSale({
            pharmacyAddress: ACCOUNTS[1],
            vetAddress: ACCOUNTS[2],
            atcCode: 'J01CA04',      // Amoxicillin
            batchNumber: 'BATCH-INT-001',
            quantity: 100,
            awareClass: 'Watch'
        });
        saleId = result.saleId;
        saleTxHash = result.txHash;

        ok('Drug sale registered on-chain', !!saleId, `saleId=${saleId}`);
        ok('Sale tx hash returned', saleTxHash?.startsWith('0x'));

        // Store off-chain
        db.prepare(`
            INSERT OR REPLACE INTO drug_sales_offchain (sale_id, pharmacy_id, vet_id, atc_code, batch_number, quantity, aware_class, tx_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(saleId, 'test-pharmacy-1', 'test-vet-1', 'J01CA04', 'BATCH-INT-001', 100, 'Watch', saleTxHash);

        // Verify readable from chain
        const chainSale = await sdk.getSale(saleId);
        ok('Sale readable from chain', !!chainSale);
        ok('Sale atcCode matches', chainSale?.atcCode === 'J01CA04', chainSale?.atcCode);
        ok('Sale active flag set', chainSale?.active === true);
    } catch (e) {
        ok('Drug sale registered', false, e.message);
        console.error('  💥', e);
    }

    // ─────────────────────────────────────────
    // [3] Prescription Creation (Vet)
    // ─────────────────────────────────────────
    section('[3] Prescription Creation (Vet → Farmer)');

    let rxId;
    let rxTxHash;
    let withdrawalEnd;
    const LOT_ID = 'LOT-INT-' + Date.now();

    try {
        const result = await sdk.createPrescription({
            saleId,
            vetAddress: ACCOUNTS[2],
            farmerAddress: ACCOUNTS[3],
            animalLotId: LOT_ID,
            diagnosis: 'Bacterial respiratory infection — integration test',
            dosage: 500,
            withdrawalDays: 3  // will be overridden to legal min = 5 days for J01CA04
        });
        rxId = result.rxId;
        rxTxHash = result.txHash;
        withdrawalEnd = result.withdrawalEnd;

        ok('Prescription created on-chain', !!rxId, `rxId=${rxId}`);
        ok('Rx tx hash returned', rxTxHash?.startsWith('0x'));
        ok('Effective withdrawal ≥ legal min (5 days for J01CA04)', result.effectiveWithdrawal >= 5,
            `effective=${result.effectiveWithdrawal}`);

        // Store off-chain
        db.prepare(`
            INSERT OR REPLACE INTO prescriptions_offchain 
            (rx_id, sale_id, vet_id, farmer_id, animal_lot_id, diagnosis, dosage, withdrawal_days, withdrawal_end, start_date, tx_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            rxId, saleId, 'test-vet-1', 'test-farmer-1', LOT_ID,
            'Bacterial respiratory infection', 500, result.effectiveWithdrawal,
            withdrawalEnd, new Date().toISOString(), rxTxHash
        );

        // Read back from chain
        const chainRx = await sdk.getPrescription(rxId);
        ok('Prescription readable from chain', !!chainRx);
        ok('Rx animalLotId matches', chainRx?.animalLotId === LOT_ID);
        ok('Rx not administered yet', chainRx?.administered === false);
    } catch (e) {
        ok('Prescription created', false, e.message);
        console.error('  💥', e);
    }

    // ─────────────────────────────────────────
    // [4] Confirm Administration (Farmer)
    // ─────────────────────────────────────────
    section('[4] Administration Confirmation (Farmer)');

    let adminTimestamp;
    try {
        const result = await sdk.confirmAdministration(rxId, ACCOUNTS[3]);
        adminTimestamp = result.adminTimestamp;

        ok('Administration confirmed on-chain', result.confirmed === true);
        ok('Admin tx hash returned', result.txHash?.startsWith('0x'));
        ok('Admin timestamp set', !!adminTimestamp);

        // Update off-chain
        db.prepare('UPDATE prescriptions_offchain SET administered = 1, admin_timestamp = ? WHERE rx_id = ?')
            .run(adminTimestamp, rxId);

        const chainRx = await sdk.getPrescription(rxId);
        ok('Rx.administered = true on-chain', chainRx?.administered === true);
    } catch (e) {
        ok('Administration confirmed', false, e.message);
        console.error('  💥', e);
    }

    // ─────────────────────────────────────────
    // [5] Eligibility Check (should be NOT eligible yet)
    // ─────────────────────────────────────────
    section('[5] Slaughter Gate — Eligibility Check');

    try {
        const result = await sdk.checkEligibility(LOT_ID, rxId);
        ok('Eligibility call succeeds', result !== null);
        ok('Lot correctly NOT eligible (withdrawal active)', result.eligible === false,
            `daysRemaining=${result.daysRemaining}`);
        ok('Days remaining > 0', result.daysRemaining > 0, `daysRemaining=${result.daysRemaining}`);
    } catch (e) {
        ok('Eligibility check', false, e.message);
        console.error('  💥', e);
    }

    // ─────────────────────────────────────────
    // [6] Fast-forward time, then certify (using evm_increaseTime)
    // ─────────────────────────────────────────
    section('[6] Time-Travel → Certify Lot');

    let certHash;
    let certTxHash;
    try {
        const provider = sdk.getProvider();

        // Fast-forward 6 days (legal min for J01CA04 = 5 days)
        const SIX_DAYS = 6 * 24 * 60 * 60;
        await provider.send('evm_increaseTime', [SIX_DAYS]);
        await provider.send('evm_mine', []);
        ok('Time-traveled 6 days forward', true);

        // Now lot should be eligible
        const eligibility = await sdk.checkEligibility(LOT_ID, rxId);
        ok('Lot NOW eligible after time-travel', eligibility.eligible === true,
            `daysRemaining=${eligibility.daysRemaining}`);

        // Certify
        const certResult = await sdk.certifyLot(LOT_ID, rxId, ACCOUNTS[4]);
        certHash = certResult.certificateHash;
        certTxHash = certResult.txHash;

        ok('Lot certified on-chain', !!certHash);
        ok('Cert hash is bytes32', certHash?.startsWith('0x') && certHash?.length === 66);
        ok('Cert tx hash returned', certTxHash?.startsWith('0x'));

        // Store in DB
        db.prepare(`
            INSERT OR REPLACE INTO lot_certifications (lot_id, slaughterhouse_id, certificate_hash, eligible, tx_hash)
            VALUES (?, ?, ?, 1, ?)
        `).run(LOT_ID, 'test-slaughter-1', certHash, certTxHash);
    } catch (e) {
        ok('Lot certified', false, e.message);
        console.error('  💥', e);
    }

    // ─────────────────────────────────────────
    // [7] Certificate Verification
    // ─────────────────────────────────────────
    section('[7] Certificate Verification');

    try {
        const result = await sdk.verifyCertificate(certHash);
        ok('Certificate valid on-chain', result.valid === true);

        // Verify fake hash
        const fakeHash = '0x' + '0'.repeat(64);
        const fakeResult = await sdk.verifyCertificate(fakeHash);
        ok('Fake certificate correctly invalid', fakeResult.valid === false);

        // getLotVerification
        const lotV = await sdk.getLotVerification(LOT_ID);
        ok('getLotVerification returns lot data', !!lotV);
        ok('getLotVerification eligible = true', lotV.eligible === true);
    } catch (e) {
        ok('Certificate verification', false, e.message);
        console.error('  💥', e);
    }

    // ─────────────────────────────────────────
    // [8] REST API smoke test (health endpoint)
    // ─────────────────────────────────────────
    section('[8] Backend REST API — Health Check');

    try {
        const health = await httpGet('http://localhost:3000/api/health');
        ok('API health endpoint reachable', health?.data?.status === 'healthy');
        ok('Audit chain INTACT', health?.data?.security?.auditChain === 'INTACT',
            health?.data?.security?.auditChain);
        ok('Security headers reported', health?.data?.security?.helmet === true);
        ok('RAG enabled', health?.data?.security?.rag === 'enabled');
    } catch (e) {
        ok('API health endpoint', false, e.message + ' (Is the backend running? node server.js)');
    }

    // ─────────────────────────────────────────
    // Results
    // ─────────────────────────────────────────
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log(`║   Results: ${passed} passed, ${failed} failed`);
    console.log('╚══════════════════════════════════════════════════════╝\n');

    if (failed === 0) {
        console.log('🎉 All integration tests PASSED — blockchain ↔ backend connected!\n');
    } else {
        console.error(`❌ ${failed} test(s) FAILED. Review errors above.\n`);
        process.exit(1);
    }
}

// ---- HTTP GET helper ----
function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(new Error('Invalid JSON: ' + data.slice(0, 200))); }
            });
        }).on('error', reject);
    });
}

runIntegrationTests().catch(e => {
    console.error('\n💥 Unexpected error:', e.message);
    process.exit(1);
});
