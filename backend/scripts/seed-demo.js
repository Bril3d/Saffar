// ============================================
// SAFAR Chain — Demo Data Seeder
// Seeds database with realistic demo data
// ============================================
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcrypt');
const { getDb, closeDb } = require('../src/db/db');
const sdk = require('../src/sdk/safar-sdk');

async function seed() {
    console.log('[SEED] Starting demo data seed...');
    const db = getDb();

    // Clear existing data
    db.exec('DELETE FROM reviews; DELETE FROM orders; DELETE FROM products; DELETE FROM lot_certifications; DELETE FROM prescriptions_offchain; DELETE FROM drug_sales_offchain; DELETE FROM users; DELETE FROM audit_log;');

    const pw = await bcrypt.hash('Test1234', 10);

    // ---- Users ----
    const users = [
        { id: 'admin-001', role: 'ADMIN', name: 'Admin SAFAR', email: 'admin@safar.tn', wallet: null },
        { id: 'pharm-001', role: 'PHARMACY', name: 'Pharmacie El Manar', email: 'pharmacy@safar.tn', wallet: '0x1111111111111111111111111111111111111111' },
        { id: 'vet-001', role: 'VET', name: 'Dr. Sami Ben Ali', email: 'vet@safar.tn', wallet: '0x2222222222222222222222222222222222222222', license: 'V-221' },
        { id: 'farmer-001', role: 'FARMER', name: 'Ahmed Bouazizi', email: 'farmer1@safar.tn', wallet: '0x3333333333333333333333333333333333333333' },
        { id: 'farmer-002', role: 'FARMER', name: 'Fatma Trabelsi', email: 'farmer2@safar.tn', wallet: '0x4444444444444444444444444444444444444444' },
        { id: 'slaughter-001', role: 'SLAUGHTERHOUSE', name: 'Abattoir Certifié Ariana', email: 'abattoir@safar.tn', wallet: '0x5555555555555555555555555555555555555555' },
        { id: 'consumer-001', role: 'CONSUMER', name: 'Yasmine Khedher', email: 'consumer1@safar.tn', wallet: null },
        { id: 'consumer-002', role: 'CONSUMER', name: 'Mohamed Dridi', email: 'consumer2@safar.tn', wallet: null },
    ];

    const insertUser = db.prepare('INSERT INTO users (id, wallet_address, role, name, email, password_hash, governorate, license_number, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)');
    for (const u of users) {
        insertUser.run(u.id, u.wallet, u.role, u.name, u.email, pw, 'Ariana', u.license || null);
    }
    console.log(`[SEED] ${users.length} users created`);

    // ---- Drug Sales ----
    const sale1 = sdk.registerSale({ pharmacyAddress: '0x1111', vetAddress: '0x2222', atcCode: 'J01CA04', batchNumber: 'BN-2026-001', quantity: 500, awareClass: 'Access' });
    const sale2 = sdk.registerSale({ pharmacyAddress: '0x1111', vetAddress: '0x2222', atcCode: 'J01AA07', batchNumber: 'BN-2026-002', quantity: 200, awareClass: 'Watch' });
    const sale3 = sdk.registerSale({ pharmacyAddress: '0x1111', vetAddress: '0x2222', atcCode: 'J01XB01', batchNumber: 'BN-2026-003', quantity: 50, awareClass: 'Reserve' });

    for (const s of [{ r: sale1, atc: 'J01CA04', aw: 'Access', bn: 'BN-2026-001', q: 500 }, { r: sale2, atc: 'J01AA07', aw: 'Watch', bn: 'BN-2026-002', q: 200 }, { r: sale3, atc: 'J01XB01', aw: 'Reserve', bn: 'BN-2026-003', q: 50 }]) {
        db.prepare('INSERT INTO drug_sales_offchain (sale_id, pharmacy_id, vet_id, atc_code, batch_number, quantity, aware_class, tx_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(s.r.saleId, 'pharm-001', 'vet-001', s.atc, s.bn, s.q, s.aw, s.r.txHash);
    }
    console.log('[SEED] 3 drug sales created');

    // ---- Prescriptions ----
    // Rx1: Eligible lot (past withdrawal) - for demo
    const rx1 = sdk.createPrescription({ saleId: sale1.saleId, vetAddress: '0x2222', farmerAddress: '0x3333', animalLotId: 'L-882', diagnosis: 'Infection respiratoire', dosage: 50, withdrawalDays: 5 });
    // Force withdrawal to be in the past for demo
    const rx1Chain = sdk.getPrescription(rx1.rxId);
    rx1Chain.withdrawalEnd = Date.now() - 86400000; // 1 day ago
    rx1Chain.administered = true;
    rx1Chain.adminTimestamp = Date.now() - 86400000 * 6;
    const rx1EndStr = new Date(rx1Chain.withdrawalEnd).toISOString();

    // Rx2: Not yet eligible
    const rx2 = sdk.createPrescription({ saleId: sale2.saleId, vetAddress: '0x2222', farmerAddress: '0x3333', animalLotId: 'L-901', diagnosis: 'Colibacillose', dosage: 30, withdrawalDays: 10 });
    const rx2Chain = sdk.getPrescription(rx2.rxId);
    rx2Chain.administered = true;
    rx2Chain.adminTimestamp = Date.now();
    // Keep withdrawalEnd in the future

    // Rx3: For farmer 2
    const rx3 = sdk.createPrescription({ saleId: sale1.saleId, vetAddress: '0x2222', farmerAddress: '0x4444', animalLotId: 'L-950', diagnosis: 'Coryza infectieux', dosage: 45, withdrawalDays: 5 });
    const rx3Chain = sdk.getPrescription(rx3.rxId);
    rx3Chain.withdrawalEnd = Date.now() - 86400000 * 2;
    rx3Chain.administered = true;
    rx3Chain.adminTimestamp = Date.now() - 86400000 * 7;

    for (const rx of [
        { r: rx1, sid: sale1.saleId, fid: 'farmer-001', lot: 'L-882', diag: 'Infection respiratoire', dose: 50, wd: 5, we: rx1EndStr, adm: 1 },
        { r: rx2, sid: sale2.saleId, fid: 'farmer-001', lot: 'L-901', diag: 'Colibacillose', dose: 30, wd: 10, we: rx2.withdrawalEnd, adm: 1 },
        { r: rx3, sid: sale1.saleId, fid: 'farmer-002', lot: 'L-950', diag: 'Coryza infectieux', dose: 45, wd: 5, we: new Date(rx3Chain.withdrawalEnd).toISOString(), adm: 1 },
    ]) {
        db.prepare('INSERT INTO prescriptions_offchain (rx_id, sale_id, vet_id, farmer_id, animal_lot_id, diagnosis, dosage, withdrawal_days, withdrawal_end, start_date, administered, tx_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(rx.r.rxId, rx.sid, 'vet-001', rx.fid, rx.lot, rx.diag, rx.dose, rx.wd, rx.we, new Date().toISOString(), rx.adm, rx.r.txHash);
    }
    console.log('[SEED] 3 prescriptions created');

    // ---- Certify eligible lots ----
    const cert1 = sdk.certifyLot('L-882', '0x5555');
    db.prepare('INSERT INTO lot_certifications (lot_id, slaughterhouse_id, certificate_hash, eligible, tx_hash) VALUES (?, ?, ?, 1, ?)').run('L-882', 'slaughter-001', cert1.certificateHash, cert1.txHash);

    const cert3 = sdk.certifyLot('L-950', '0x5555');
    db.prepare('INSERT INTO lot_certifications (lot_id, slaughterhouse_id, certificate_hash, eligible, tx_hash) VALUES (?, ?, ?, 1, ?)').run('L-950', 'slaughter-001', cert3.certificateHash, cert3.txHash);
    console.log('[SEED] 2 lots certified');

    // ---- Products ----
    const products = [
        { id: 'prod-001', fid: 'farmer-001', lot: 'L-882', cert: cert1.certificateHash, title: 'Oeufs frais fermiers', desc: 'Oeufs de poules élevées en plein air, ferme El Fahs. Traçabilité complète.', cat: 'EGGS', price: 1.2, unit: 'DOZEN', qty: 100, del: 'BOTH', addr: 'Ferme El Fahs, Route Ariana' },
        { id: 'prod-002', fid: 'farmer-001', lot: 'L-882', cert: cert1.certificateHash, title: 'Poulet fermier vivant', desc: 'Poulets de chair, élevage traditionnel. Certifié sans résidus.', cat: 'POULTRY_LIVE', price: 8.5, unit: 'KG', qty: 50, del: 'PICKUP', addr: 'Ferme El Fahs, Route Ariana' },
        { id: 'prod-003', fid: 'farmer-002', lot: 'L-950', cert: cert3.certificateHash, title: 'Miel toutes fleurs', desc: 'Miel artisanal de la région de Zaghouan. Qualité premium.', cat: 'HONEY', price: 25.0, unit: 'KG', qty: 30, del: 'DELIVERY', addr: 'Apicultrice Trabelsi, Zaghouan' },
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
    console.log('[SEED] Eligible lot: L-882 | Not eligible: L-901');
}

seed().catch(e => { console.error('[SEED] Error:', e); process.exit(1); });
