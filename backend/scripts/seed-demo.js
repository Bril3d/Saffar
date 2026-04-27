// ============================================
// SAFAR Chain — Demo Data Seeder
// Seeds database with realistic demo data
// ============================================
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcrypt');
const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');
const { getDb, closeDb } = require('../src/db/db');
const sdk = require('../src/sdk/safar-sdk');

async function seed() {
    console.log('[SEED] Starting demo data seed...');
    const db = getDb();

    // Clear existing data
    db.exec('DELETE FROM reviews; DELETE FROM orders; DELETE FROM products; DELETE FROM lot_certifications; DELETE FROM prescriptions_offchain; DELETE FROM drug_sales_offchain; DELETE FROM users; DELETE FROM audit_log;');

    const pw = await bcrypt.hash('Test1234', 10);

    const contractsPath = path.join(__dirname, '..', '..', 'shared', 'contracts.json');
    if (!fs.existsSync(contractsPath)) {
        throw new Error('[SEED] shared/contracts.json is missing. Deploy contracts first.');
    }
    const contractsMeta = JSON.parse(fs.readFileSync(contractsPath, 'utf-8'));
    const provider = sdk.getProvider();

    const adminSigner = new ethers.Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);
    const accessControl = new ethers.Contract(
        contractsMeta.addresses.accessControl,
        contractsMeta.abis.accessControl,
        adminSigner
    );

    const pharmacyWallet = sdk.HARDHAT_ACCOUNTS[1];
    const vetWallet = sdk.HARDHAT_ACCOUNTS[2];
    const farmer1Wallet = sdk.HARDHAT_ACCOUNTS[3];
    const slaughterWallet = sdk.HARDHAT_ACCOUNTS[4];

    // ---- Users ----
    const users = [
        { id: 'admin-001', role: 'ADMIN', name: 'Admin SAFAR', email: 'admin@safar.tn', wallet: null },
        { id: 'pharm-001', role: 'PHARMACY', name: 'Pharmacie El Manar', email: 'pharmacy@safar.tn', wallet: pharmacyWallet },
        { id: 'vet-001', role: 'VET', name: 'Dr. Sami Ben Ali', email: 'vet@safar.tn', wallet: vetWallet, license: 'V-221' },
        { id: 'farmer-001', role: 'FARMER', name: 'Ahmed Bouazizi', email: 'farmer1@safar.tn', wallet: farmer1Wallet },
        { id: 'farmer-002', role: 'FARMER', name: 'Fatma Trabelsi', email: 'farmer2@safar.tn', wallet: null },
        { id: 'slaughter-001', role: 'SLAUGHTERHOUSE', name: 'Abattoir Certifié Ariana', email: 'abattoir@safar.tn', wallet: slaughterWallet },
        { id: 'consumer-001', role: 'CONSUMER', name: 'Yasmine Khedher', email: 'consumer1@safar.tn', wallet: null },
        { id: 'consumer-002', role: 'CONSUMER', name: 'Mohamed Dridi', email: 'consumer2@safar.tn', wallet: null },
    ];

    const insertUser = db.prepare('INSERT INTO users (id, wallet_address, role, name, email, password_hash, governorate, license_number, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)');
    for (const u of users) {
        insertUser.run(u.id, u.wallet, u.role, u.name, u.email, pw, 'Ariana', u.license || null);
    }
    console.log(`[SEED] ${users.length} users created`);

    // ---- Register blockchain roles ----
    const rolesToRegister = [
        { wallet: pharmacyWallet, role: 1 },
        { wallet: vetWallet, role: 2 },
        { wallet: farmer1Wallet, role: 3 },
        { wallet: slaughterWallet, role: 4 },
    ];

    for (const actor of rolesToRegister) {
        try {
            const tx = await accessControl.registerActor(actor.wallet, actor.role);
            await tx.wait();
        } catch {
            // Ignore if already registered to keep seeding idempotent for demo.
        }
    }
    console.log('[SEED] Blockchain actors registered');

    // ---- Drug Sales ----
    const sale1 = await sdk.registerSale({ pharmacyAddress: pharmacyWallet, vetAddress: vetWallet, atcCode: 'J01CA04', batchNumber: 'BN-2026-001', quantity: 500, awareClass: 'Access' });
    const sale2 = await sdk.registerSale({ pharmacyAddress: pharmacyWallet, vetAddress: vetWallet, atcCode: 'J01AA07', batchNumber: 'BN-2026-002', quantity: 200, awareClass: 'Watch' });
    const sale3 = await sdk.registerSale({ pharmacyAddress: pharmacyWallet, vetAddress: vetWallet, atcCode: 'J01XB01', batchNumber: 'BN-2026-003', quantity: 50, awareClass: 'Reserve' });

    for (const s of [{ r: sale1, atc: 'J01CA04', aw: 'Access', bn: 'BN-2026-001', q: 500 }, { r: sale2, atc: 'J01AA07', aw: 'Watch', bn: 'BN-2026-002', q: 200 }, { r: sale3, atc: 'J01XB01', aw: 'Reserve', bn: 'BN-2026-003', q: 50 }]) {
        db.prepare('INSERT INTO drug_sales_offchain (sale_id, pharmacy_id, vet_id, atc_code, batch_number, quantity, aware_class, tx_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(s.r.saleId, 'pharm-001', 'vet-001', s.atc, s.bn, s.q, s.aw, s.r.txHash);
    }
    console.log('[SEED] 3 drug sales created');

    // ---- Prescriptions ----
    let rx1, rx2, rx3;
    try {
        rx1 = await sdk.createPrescription({ saleId: sale1.saleId, vetAddress: vetWallet, farmerAddress: farmer1Wallet, animalLotId: 'L-882', diagnosis: 'Infection respiratoire', dosage: 50, withdrawalDays: 5 });
        await sdk.confirmAdministration(rx1.rxId, farmer1Wallet);
        await provider.send('evm_increaseTime', [6 * 24 * 60 * 60]);
        await provider.send('evm_mine', []);
        
        rx3 = await sdk.createPrescription({ saleId: sale1.saleId, vetAddress: vetWallet, farmerAddress: farmer1Wallet, animalLotId: 'L-950', diagnosis: 'Coryza infectieux', dosage: 45, withdrawalDays: 5 });
        await sdk.confirmAdministration(rx3.rxId, farmer1Wallet);
        await provider.send('evm_increaseTime', [6 * 24 * 60 * 60]);
        await provider.send('evm_mine', []);
        
        rx2 = await sdk.createPrescription({ saleId: sale2.saleId, vetAddress: vetWallet, farmerAddress: farmer1Wallet, animalLotId: 'L-901', diagnosis: 'Colibacillose', dosage: 30, withdrawalDays: 0 });
        await sdk.confirmAdministration(rx2.rxId, farmer1Wallet);
    } catch(e) { console.log('[SEED] Rx already created on chain'); }

    // If we didn't create them, they already exist on chain (IDs 1, 2, 3)
    if (!rx1) { rx1 = { rxId: '1', effectiveWithdrawal: 5, txHash: '0x' }; }
    if (!rx2) { rx2 = { rxId: '2', effectiveWithdrawal: 0, txHash: '0x' }; }
    if (!rx3) { rx3 = { rxId: '3', effectiveWithdrawal: 5, txHash: '0x' }; }

    const rx1Chain = await sdk.getPrescription(rx1.rxId);
    const rx2Chain = await sdk.getPrescription(rx2.rxId);
    const rx3Chain = await sdk.getPrescription(rx3.rxId);

    for (const rx of [
        { r: rx1, sid: sale1.saleId, fid: 'farmer-001', lot: 'L-882', diag: 'Infection respiratoire', dose: 50, wd: rx1.effectiveWithdrawal, we: rx1Chain ? new Date(Number(rx1Chain.withdrawalEnd) * 1000).toISOString() : new Date().toISOString(), adm: 1, at: rx1Chain ? new Date(Number(rx1Chain.adminTimestamp) * 1000).toISOString() : new Date().toISOString() },
        { r: rx2, sid: sale2.saleId, fid: 'farmer-001', lot: 'L-901', diag: 'Colibacillose', dose: 30, wd: rx2.effectiveWithdrawal, we: rx2Chain ? new Date(Number(rx2Chain.withdrawalEnd) * 1000).toISOString() : new Date().toISOString(), adm: 1, at: rx2Chain ? new Date(Number(rx2Chain.adminTimestamp) * 1000).toISOString() : new Date().toISOString() },
        { r: rx3, sid: sale1.saleId, fid: 'farmer-001', lot: 'L-950', diag: 'Coryza infectieux', dose: 45, wd: rx3.effectiveWithdrawal, we: rx3Chain ? new Date(Number(rx3Chain.withdrawalEnd) * 1000).toISOString() : new Date().toISOString(), adm: 1, at: rx3Chain ? new Date(Number(rx3Chain.adminTimestamp) * 1000).toISOString() : new Date().toISOString() },
    ]) {
        db.prepare('INSERT INTO prescriptions_offchain (rx_id, sale_id, vet_id, farmer_id, animal_lot_id, diagnosis, dosage, withdrawal_days, withdrawal_end, start_date, administered, admin_timestamp, tx_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(rx.r.rxId, rx.sid, 'vet-001', rx.fid, rx.lot, rx.diag, rx.dose, rx.wd, rx.we, new Date().toISOString(), rx.adm, rx.at, rx.r.txHash);
    }
    console.log('[SEED] 3 prescriptions created');

    // ---- Certify eligible lots ----
    let cert1, cert3;
    try {
        cert1 = await sdk.certifyLot('L-882', rx1.rxId, slaughterWallet);
        db.prepare('INSERT INTO lot_certifications (lot_id, slaughterhouse_id, certificate_hash, eligible, tx_hash) VALUES (?, ?, ?, 1, ?)').run('L-882', 'slaughter-001', cert1.certificateHash, cert1.txHash);
    } catch(e) { console.log('[SEED] L-882 already certified on chain'); }

    try {
        cert3 = await sdk.certifyLot('L-950', rx3.rxId, slaughterWallet);
        db.prepare('INSERT INTO lot_certifications (lot_id, slaughterhouse_id, certificate_hash, eligible, tx_hash) VALUES (?, ?, ?, 1, ?)').run('L-950', 'slaughter-001', cert3.certificateHash, cert3.txHash);
    } catch(e) { console.log('[SEED] L-950 already certified on chain'); }
    console.log('[SEED] 2 lots certified');

    if (!cert1) cert1 = { certificateHash: '0x1' };
    if (!cert3) cert3 = { certificateHash: '0x3' };

    // ---- Products ----
    const products = [
        { id: 'prod-001', fid: 'farmer-001', lot: 'L-882', cert: cert1.certificateHash, title: 'Oeufs frais fermiers', desc: 'Oeufs de poules élevées en plein air, ferme El Fahs. Traçabilité complète.', cat: 'EGGS', price: 1.2, unit: 'DOZEN', qty: 100, del: 'BOTH', addr: 'Ferme El Fahs, Route Ariana' },
        { id: 'prod-002', fid: 'farmer-001', lot: 'L-882', cert: cert1.certificateHash, title: 'Poulet fermier vivant', desc: 'Poulets de chair, élevage traditionnel. Certifié sans résidus.', cat: 'POULTRY_LIVE', price: 8.5, unit: 'KG', qty: 50, del: 'PICKUP', addr: 'Ferme El Fahs, Route Ariana' },
        { id: 'prod-003', fid: 'farmer-001', lot: 'L-950', cert: cert3.certificateHash, title: 'Miel toutes fleurs', desc: 'Miel artisanal de la région de Zaghouan. Qualité premium.', cat: 'HONEY', price: 25.0, unit: 'KG', qty: 30, del: 'DELIVERY', addr: 'Apicultrice Trabelsi, Zaghouan' },
    ];

    for (const p of products) {
        db.prepare('INSERT INTO products (id, farmer_id, lot_id, certificate_hash, title, description, category, price_per_unit, unit, quantity_available, delivery_options, location_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(p.id, p.fid, p.lot, p.cert, p.title, p.desc, p.cat, p.price, p.unit, p.qty, p.del, p.addr);
    }
    console.log('[SEED] 3 products created');

    // ---- Orders ----
    db.prepare("INSERT INTO orders (id, product_id, consumer_id, farmer_id, quantity, total_price, commission, farmer_payout, delivery_option, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run('order-001', 'prod-001', 'consumer-001', 'farmer-001', 5, 6.0, 0.6, 5.4, 'DELIVERY', 'DELIVERED');
    db.prepare("INSERT INTO reviews (id, order_id, consumer_id, farmer_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)").run('rev-001', 'order-001', 'consumer-001', 'farmer-001', 5, 'Excellents oeufs, très frais! Traçabilité rassurante.');
    console.log('[SEED] 1 order + 1 review created');

    closeDb();
    console.log('\n[SEED] ✅ Demo data seeded successfully!');
    console.log('[SEED] Login credentials for all users: Test1234');
    console.log('[SEED] Eligible lots: L-882, L-950 | Not eligible: L-901');
}

seed().catch(e => { console.error('[SEED] Error:', e); process.exit(1); });
