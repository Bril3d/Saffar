// ============================================
// SAFAR Chain — API Tests (Jest + Supertest)
// ============================================
const request = require('supertest');
const app = require('../app');
const { getDb, closeDb } = require('../src/db/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const sdk = require('../src/sdk/safar-sdk');

let consumerToken, vetToken, pharmacyToken, farmerToken, slaughterhouseToken;
const testIds = {};

beforeAll(async () => {
    // Reset SDK chain state to avoid counter collisions with seed data
    sdk.resetChainState();

    const db = getDb();
    // Clear seeded data to avoid unique constraint conflicts
    db.exec('DELETE FROM reviews; DELETE FROM orders; DELETE FROM products; DELETE FROM lot_certifications; DELETE FROM prescriptions_offchain; DELETE FROM drug_sales_offchain; DELETE FROM users; DELETE FROM audit_log;');
    const pw = await bcrypt.hash('Test1234', 10);

    // Create test users
    const testUsers = [
        { id: uuidv4(), role: 'CONSUMER', name: 'Test Consumer', email: `consumer-${Date.now()}@test.com` },
        { id: uuidv4(), role: 'VET', name: 'Test Vet', email: `vet-${Date.now()}@test.com`, wallet: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' },
        { id: uuidv4(), role: 'PHARMACY', name: 'Test Pharmacy', email: `pharmacy-${Date.now()}@test.com`, wallet: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' },
        { id: uuidv4(), role: 'FARMER', name: 'Test Farmer', email: `farmer-${Date.now()}@test.com`, wallet: '0xcccccccccccccccccccccccccccccccccccccccc' },
        { id: uuidv4(), role: 'SLAUGHTERHOUSE', name: 'Test Abattoir', email: `abattoir-${Date.now()}@test.com`, wallet: '0xdddddddddddddddddddddddddddddddddddddddd' },
    ];

    for (const u of testUsers) {
        db.prepare('INSERT OR IGNORE INTO users (id, wallet_address, role, name, email, password_hash, verified) VALUES (?, ?, ?, ?, ?, ?, 1)')
            .run(u.id, u.wallet || null, u.role, u.name, u.email, pw);
        testIds[u.role.toLowerCase()] = u;
    }

    // Login all users
    const login = async (email) => {
        const res = await request(app).post('/api/auth/login').send({ email, password: 'Test1234' });
        return res.body.data?.token;
    };
    consumerToken = await login(testIds.consumer.email);
    vetToken = await login(testIds.vet.email);
    pharmacyToken = await login(testIds.pharmacy.email);
    farmerToken = await login(testIds.farmer.email);
    slaughterhouseToken = await login(testIds.slaughterhouse.email);
});

afterAll(() => { closeDb(); });

// ---- Auth Tests ----
describe('Auth', () => {
    test('POST /api/auth/login valid consumer → 200 + JWT', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: testIds.consumer.email, password: 'Test1234' });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
        expect(res.body.data.user.role).toBe('CONSUMER');
    });

    test('POST /api/auth/login wrong password → 401', async () => {
        const res = await request(app).post('/api/auth/login').send({ email: testIds.consumer.email, password: 'wrongpassword' });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    test('Protected route without token → 401', async () => {
        const res = await request(app).post('/api/drugs/sale').send({});
        expect(res.status).toBe(401);
    });

    test('Role guard: FARMER cannot access PHARMACY route → 403', async () => {
        const res = await request(app).post('/api/drugs/sale')
            .set('Authorization', `Bearer ${farmerToken}`)
            .send({ vetId: 'x', atcCode: 'J01CA04', batchNumber: 'B1', quantity: 10, awareClass: 'Access' });
        expect(res.status).toBe(403);
    });
});

// ---- Traceability Tests ----
describe('Traceability', () => {
    let saleId, rxId;

    test('POST /api/drugs/sale with PHARMACY → 201', async () => {
        const res = await request(app).post('/api/drugs/sale')
            .set('Authorization', `Bearer ${pharmacyToken}`)
            .send({ vetId: testIds.vet.id, atcCode: 'J01CA04', batchNumber: 'TEST-001', quantity: 100, awareClass: 'Access' });
        expect(res.status).toBe(201);
        expect(res.body.data.saleId).toBeDefined();
        expect(res.body.data.txHash).toBeDefined();
        saleId = res.body.data.saleId;
    });

    test('POST /api/drugs/sale missing atcCode → 400', async () => {
        const res = await request(app).post('/api/drugs/sale')
            .set('Authorization', `Bearer ${pharmacyToken}`)
            .send({ vetId: testIds.vet.id, batchNumber: 'B1', quantity: 10, awareClass: 'Access' });
        expect(res.status).toBe(400);
    });

    test('POST /api/prescriptions with VET → 201', async () => {
        const res = await request(app).post('/api/prescriptions')
            .set('Authorization', `Bearer ${vetToken}`)
            .send({ saleId, farmerId: testIds.farmer.id, animalLotId: 'TEST-LOT-1', diagnosis: 'Test infection', dosage: 50, withdrawalDays: 5 });
        expect(res.status).toBe(201);
        expect(res.body.data.rxId).toBeDefined();
        expect(res.body.data.withdrawalEnd).toBeDefined();
        rxId = res.body.data.rxId;
    });

    test('POST /api/prescriptions with FARMER → 403', async () => {
        const res = await request(app).post('/api/prescriptions')
            .set('Authorization', `Bearer ${farmerToken}`)
            .send({ saleId: 'x', farmerId: 'x', animalLotId: 'x', diagnosis: 'test', dosage: 10, withdrawalDays: 5 });
        expect(res.status).toBe(403);
    });

    test('PUT /api/prescriptions/:id/confirm with FARMER (own) → 200', async () => {
        const res = await request(app).put(`/api/prescriptions/${rxId}/confirm`)
            .set('Authorization', `Bearer ${farmerToken}`);
        expect(res.status).toBe(200);
        expect(res.body.data.confirmed).toBe(true);
    });

    test('GET /api/lots/:lotId/trace (public) → no walletAddress in response', async () => {
        const res = await request(app).get('/api/lots/TEST-LOT-1/trace');
        expect(res.status).toBe(200);
        const text = JSON.stringify(res.body);
        expect(text).not.toContain('0xaaaa');
        expect(text).not.toContain('0xcccc');
        expect(res.body.data.trustScore).toBeDefined();
    });

    test('GET /api/lots/:lotId/eligibility with CONSUMER → 403', async () => {
        const res = await request(app).get('/api/lots/TEST-LOT-1/eligibility')
            .set('Authorization', `Bearer ${consumerToken}`);
        expect(res.status).toBe(403);
    });
});

// ---- Marketplace Tests ----
describe('Marketplace', () => {
    test('POST /api/products without certified lot → 400', async () => {
        const res = await request(app).post('/api/products')
            .set('Authorization', `Bearer ${farmerToken}`)
            .send({ lotId: 'UNCERTIFIED-LOT', title: 'Test', category: 'EGGS', pricePerUnit: 1.0, unit: 'DOZEN', quantityAvailable: 10, deliveryOptions: 'PICKUP' });
        expect(res.status).toBe(400);
        expect(res.body.error.code).toBe('LOT_NOT_CERTIFIED');
    });

    test('POST /api/products with VET → 403', async () => {
        const res = await request(app).post('/api/products')
            .set('Authorization', `Bearer ${vetToken}`)
            .send({ lotId: 'x', title: 'Test', category: 'EGGS', pricePerUnit: 1.0, unit: 'DOZEN', quantityAvailable: 10, deliveryOptions: 'PICKUP' });
        expect(res.status).toBe(403);
    });

    test('GET /api/products (public) → 200', async () => {
        const res = await request(app).get('/api/products');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.pagination).toBeDefined();
    });
});

// ---- Health Check ----
describe('Health', () => {
    test('GET /api/health → 200', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('healthy');
    });

    test('GET /unknown → 404', async () => {
        const res = await request(app).get('/api/unknown');
        expect(res.status).toBe(404);
    });
});
