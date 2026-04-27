# Dev 3 — Backend API + AI Layers
> **Branch**: `feat/backend-ai` | **Stack**: Node.js · Express · Python · scikit-learn · Ollama  
> **First priority**: Write `api-contract.md` at T+0 — Dev 2 and Dev 3 both block on this

---

## Approach
Build a monolithic Express API (fast for 18h) with role-based JWT auth. AI runs as a Python FastAPI sidecar proxied by Express. Ollama runs as a local process on the team server machine. SQLite for off-chain data. No cloud dependencies.

## Scope
- **In**: Auth, Traceability API, Marketplace API, AI Layer 1 (anomaly), AI Layer 2 (LLM), privacy-safe trace endpoint
- **Out**: Real payment processing, push notifications (stub only), cloud DB, microservices

---

## GitHub Workflow
```
main (protected)
└── dev  ← merge every 2h via PR
    └── feat/backend-ai  ← your branch
```
Commit format: `feat(api): add prescriptions endpoint`  
PR rule: Jest + Supertest tests pass

---

## Phase 1 — Setup + API Contract `T+0 → T+1:00`

- [ ] **Write** `/shared/api-contract.md` first — share with Dev 2 for review:
  ```
  For every endpoint define:
  - Method + path
  - Auth role required
  - Request body schema
  - Response schema (success + error)
  - Example payloads
  ```
  All 3 devs must agree before T+1h.

- [ ] **Init** Express project in `/backend/`:
  ```bash
  npm init -y
  npm install express cors helmet jsonwebtoken bcrypt better-sqlite3 axios dotenv
  npm install --save-dev jest supertest nodemon
  ```
- [ ] **Create** folder structure:
  ```
  backend/
    src/
      routes/      auth.js drugs.js prescriptions.js lots.js
                   products.js orders.js reviews.js ai.js
      middleware/  auth.js  roleGuard.js  errorHandler.js
      db/          schema.sql  db.js
      relayer/     relay.js  (from Dev 1's work)
      ai/          prompts/  proxy.js
    tests/
      auth.test.js  traceability.test.js  marketplace.test.js  ai.test.js
    .env.example
    app.js
    server.js
  ```
- [ ] **Write** `src/db/schema.sql`:
  ```sql
  CREATE TABLE users (id TEXT PRIMARY KEY, wallet_address TEXT, role TEXT,
    name TEXT, email TEXT, phone TEXT, governorate TEXT, license_number TEXT,
    verified INTEGER DEFAULT 0, created_at TEXT);

  CREATE TABLE products (id TEXT PRIMARY KEY, farmer_id TEXT, lot_id TEXT,
    certificate_hash TEXT, title TEXT, description TEXT, category TEXT,
    price_per_unit REAL, unit TEXT, quantity_available INTEGER,
    delivery_options TEXT, location TEXT, status TEXT, created_at TEXT);

  CREATE TABLE orders (id TEXT PRIMARY KEY, product_id TEXT, consumer_id TEXT,
    farmer_id TEXT, quantity INTEGER, total_price REAL, commission REAL,
    farmer_payout REAL, delivery_option TEXT, delivery_address TEXT,
    status TEXT, created_at TEXT);

  CREATE TABLE reviews (id TEXT PRIMARY KEY, order_id TEXT, consumer_id TEXT,
    farmer_id TEXT, rating INTEGER, comment TEXT, created_at TEXT);

  CREATE TABLE relayer_nonces (address TEXT, nonce INTEGER,
    PRIMARY KEY (address, nonce));
  ```
- [ ] **Write** `src/db/db.js`: open SQLite, run schema, export `db`
- [ ] **Write** `src/middleware/errorHandler.js`:
  ```js
  // Standardized response format for all errors:
  { success: false, data: null, error: { code, message }, meta: { timestamp } }
  // And success:
  { success: true, data: {...}, error: null, meta: { timestamp, txHash? } }
  ```
- [ ] **Test** error handler: throw error in route → response has correct shape

---

## Phase 2 — Auth Middleware `T+1:00 → T+2:00`

- [ ] **Implement** `POST /api/auth/login`:
  - Consumer: email + password → bcrypt verify → issue JWT `{ userId, role: 'CONSUMER' }`
  - Blockchain actors: wallet address + EIP-712 signature → verify via ethers → issue JWT `{ userId, role, walletAddress }`
  - Return: `{ token, user: { id, role, name } }`
- [ ] **Implement** `POST /api/auth/register`:
  - Consumer only (blockchain actors registered via AccessControl by admin)
  - Hash password, insert into SQLite users table
- [ ] **Write** `src/middleware/auth.js`:
  ```js
  // Validates Bearer JWT, attaches req.user = { id, role, walletAddress }
  // Returns 401 if missing/invalid
  ```
- [ ] **Write** `src/middleware/roleGuard.js`:
  ```js
  // requireRole('VET', 'PHARMACY') → 403 if req.user.role not in list
  ```
- [ ] **Test** `tests/auth.test.js`:
  - [ ] `POST /api/auth/login` valid consumer → 200 + JWT
  - [ ] `POST /api/auth/login` wrong password → 401
  - [ ] Request with no token to protected route → 401
  - [ ] `requireRole('VET')` middleware with FARMER token → 403
  - [ ] `requireRole('VET')` middleware with VET token → passes to next()

---

## Phase 3 — Traceability API `T+2:00 → T+6:00`

### Drug Sales

- [ ] **Implement** `POST /api/drugs/sale` (auth: PHARMACY):
  - Validate body: `{ vetId, atcCode, batchNumber, quantity, awareClass }`
  - Call `safar-sdk.registerSale()` via relayer → get `saleId, txHash`
  - Return `{ saleId, txHash }`
- [ ] **Implement** `GET /api/drugs/sale/:id` (auth: any registered):
  - Call `safar-sdk.getSale(saleId)` → return struct
- [ ] **Test**:
  - [ ] `POST /api/drugs/sale` with PHARMACY token + valid body → 201 + txHash present
  - [ ] `POST /api/drugs/sale` with CONSUMER token → 403
  - [ ] `POST /api/drugs/sale` missing atcCode → 400 validation error

### Prescriptions

- [ ] **Implement** `POST /api/prescriptions` (auth: VET):
  - Validate body: `{ saleId, farmerId, animalLotId, diagnosis, dosage, withdrawalDays }`
  - Call `safar-sdk.createPrescription()` → get `rxId, txHash`
  - Store off-chain metadata in SQLite (for fast queries)
  - Return `{ rxId, txHash, withdrawalEnd }`
- [ ] **Implement** `GET /api/prescriptions/:id` (auth: any registered):
  - Merge on-chain data from `safar-sdk.getPrescription()` + off-chain metadata
- [ ] **Implement** `PUT /api/prescriptions/:id/confirm` (auth: FARMER, must own prescription):
  - Check `prescription.farmerId === req.user.id` → 403 if not
  - Call `safar-sdk.confirmAdministration(rxId)`
  - Return `{ confirmed: true, txHash, withdrawalEnd }`
- [ ] **Test**:
  - [ ] `POST /api/prescriptions` VET token + valid body → 201 + rxId + withdrawalEnd
  - [ ] `POST /api/prescriptions` FARMER token → 403
  - [ ] `PUT /api/prescriptions/:id/confirm` Farmer A cannot confirm Farmer B's → 403
  - [ ] `PUT /api/prescriptions/:id/confirm` own prescription → 200

### Lot Eligibility

- [ ] **Implement** `GET /api/lots/:lotId/eligibility` (auth: SLAUGHTERHOUSE):
  - Find rxId for lotId from SQLite
  - Call `safar-sdk.checkEligibility(lotId, rxId)`
  - Return `{ eligible, daysRemaining, lotDetails, prescription }`
- [ ] **Implement** `POST /api/lots/:lotId/certify` (auth: SLAUGHTERHOUSE):
  - Call `safar-sdk.certifyLot(lotId, rxId)` → get `certificateHash`
  - Update product linked to this lot in SQLite with certificateHash
  - Return `{ certificateHash, txHash }`
- [ ] **Implement** `GET /api/lots/:lotId/trace` (public, no auth):
  - Aggregate: drug sale → prescription → administration → slaughter events
  - **PRIVACY FILTER**: strip `vetName`, `farmerName`, `walletAddress`, `exactDosage`
  - Keep: AWaRe class, antibiotic category, dates, eligible/certified status
  - Return consumer-safe traceability object + trust score (0-100)
- [ ] **Test**:
  - [ ] `GET /api/lots/:id/eligibility` eligible lot → `{ eligible: true, daysRemaining: 0 }`
  - [ ] `GET /api/lots/:id/eligibility` CONSUMER token → 403
  - [ ] `POST /api/lots/:id/certify` eligible lot → 200 + certificateHash
  - [ ] `POST /api/lots/:id/certify` non-eligible lot → 400 "Lot not eligible yet"
  - [ ] `GET /api/lots/:id/trace` (public) → response has no `vetName`, no `walletAddress`, no `exactDosage`
  - [ ] `GET /api/lots/:id/trace` → response has `awareClass`, `eligible`, `trustScore`

---

## Phase 4 — Marketplace API `T+4:00 → T+8:00`

- [ ] **Implement** `GET /api/products` (public):
  - Query params: `?category=`, `?governorate=`, `?sort=trust_score|price|rating`
  - Return paginated list from SQLite with trust score computed
- [ ] **Implement** `GET /api/products/:id` (public):
  - Product details + linked lot trace data (from `GET /api/lots/:lotId/trace`)
- [ ] **Implement** `POST /api/products` (auth: FARMER):
  - Validate: `certificateHash` must exist in SQLite (linked to certified lot) → 400 if not
  - Insert product into SQLite
  - Return `{ productId, status: 'ACTIVE' }`
- [ ] **Implement** `PUT /api/products/:id` (auth: FARMER, must own product):
  - Update fields; cannot change linked lot or certificateHash
- [ ] **Implement** `DELETE /api/products/:id` (auth: FARMER, must own):
  - Set status = 'PAUSED' (soft delete)
- [ ] **Implement** `POST /api/orders` (auth: CONSUMER):
  - Validate product exists + quantity available
  - Compute: `commission = totalPrice * 0.10`, `farmerPayout = totalPrice - commission`
  - Insert order, update product quantity
  - Return `{ orderId, totalPrice, commission, farmerPayout }`
- [ ] **Implement** `GET /api/orders/:id` (auth: owner consumer OR farmer):
  - Return order + product details + status
- [ ] **Implement** `PUT /api/orders/:id/status` (auth: FARMER, must own order):
  - Valid transitions: PENDING→CONFIRMED, CONFIRMED→PREPARING, PREPARING→READY, READY→DELIVERED
  - Invalid transition → 400
- [ ] **Implement** `POST /api/reviews` (auth: CONSUMER):
  - Order must be DELIVERED + consumer must own order
  - Rating 1-5, comment optional
- [ ] **Test** `tests/marketplace.test.js`:
  - [ ] `POST /api/products` no certificateHash → 400 "Lot not certified"
  - [ ] `POST /api/products` VET token → 403
  - [ ] `POST /api/products` valid FARMER + certified lot → 201 + productId
  - [ ] `DELETE /api/products/:id` another farmer's product → 403
  - [ ] `POST /api/orders` valid consumer → 201 + commission = price × 0.10
  - [ ] `POST /api/orders` quantity > available → 400 "Insufficient stock"
  - [ ] `PUT /api/orders/:id/status` DELIVERED → CONFIRMED → 400 invalid transition
  - [ ] `POST /api/reviews` order not DELIVERED → 400

---

## Phase 5 — AI Layer 1: Python + scikit-learn `T+5:00 → T+10:00`

- [ ] **Setup** Python project in `/backend/ai_service/`:
  ```bash
  pip install fastapi uvicorn scikit-learn pandas numpy joblib xgboost
  ```
  ```
  ai_service/
    main.py           ← FastAPI app
    models/           ← serialized .joblib models
    scripts/
      generate_data.py
      train_anomaly.py
      train_forecast.py
  ```
- [ ] **Write** `scripts/generate_data.py`:
  - 200 synthetic vets: normal distribution mean=28 prescriptions/month, std=8
  - 5 outlier vets: 120-180 prescriptions/month (anomalies)
  - 100 farms: lot sizes 200-5000 animals, sales volumes proportional ± 20%
  - 5 fraud farms: sales volumes 3-5× declared lot size
  - Weekly antibiotic demand per governorate (12 governorates, 52 weeks)
  - Save as CSV: `data/vet_data.csv`, `data/farm_data.csv`, `data/demand_data.csv`
- [ ] **Write** `scripts/train_anomaly.py`:
  - Train Isolation Forest on vet prescription frequency data
  - Features: `prescriptions_per_month`, `unique_farms`, `avg_dosage`, `reserve_class_ratio`
  - Save: `models/vet_anomaly.joblib`, `models/vet_scaler.joblib`
  - Train Isolation Forest on farm data
  - Features: `declared_lot_size`, `sales_volume`, `volume_to_lot_ratio`
  - Save: `models/farm_anomaly.joblib`, `models/farm_scaler.joblib`
- [ ] **Write** `scripts/train_forecast.py`:
  - Train XGBoost regressor on weekly demand per ATC per governorate
  - Features: `week`, `governorate_code`, `atc_code`, `season`
  - Save: `models/demand_forecast.joblib`
- [ ] **Run** both train scripts, verify model files exist
- [ ] **Implement** FastAPI routes in `main.py`:
  ```python
  GET /ai/anomaly/vet/{vet_id}
  → load vet data, score with Isolation Forest
  → return { vetId, anomalyScore, isAnomaly, details: { prescriptions, median, ratio } }

  GET /ai/anomaly/farm/{farmer_id}
  → load farm data, score
  → return { farmerId, anomalyScore, isAnomaly, details: { declared, sales, ratio } }

  GET /ai/forecast/{governorate}
  → run XGBoost prediction for next 7 days
  → return { governorate, predictions: [{ atcCode, trend, recommendation }] }
  ```
- [ ] **Wire** Python service to Express: in `/backend/src/routes/ai.js`:
  - `GET /api/ai/anomaly/vet/:id` → proxy to `http://localhost:8001/ai/anomaly/vet/:id`
  - `GET /api/ai/forecast/:gov` → proxy to `http://localhost:8001/ai/forecast/:gov`
- [ ] **Test** `tests/ai.test.js` (mock Python service responses):
  - [ ] `/api/ai/anomaly/vet/:id` with outlier vet → `isAnomaly: true`, `anomalyScore < -0.5`
  - [ ] `/api/ai/anomaly/vet/:id` with normal vet → `isAnomaly: false`
  - [ ] `/api/ai/anomaly/farm/:id` fraud farm → `isAnomaly: true`
  - [ ] `/api/ai/forecast/Tunis` → array with `atcCode`, `trend`, `recommendation` fields
  - [ ] CONSUMER token on `/api/ai/anomaly/*` → 403

---

## Phase 6 — AI Layer 2: Ollama LLM `T+8:00 → T+12:00`

- [ ] **Install & start** Ollama on team server:
  ```bash
  ollama pull phi3:mini
  ollama serve   # listens on localhost:11434
  ```
- [ ] **Write** prompt templates in `/backend/src/ai/prompts/`:

  `vet_assistant.txt`:
  ```
  Tu es un assistant vétérinaire expert en maladies avicoles en Tunisie.
  Respecte strictement la classification AWaRe de l'OMS:
  - Classe Access (J01CA, J01CE, J01DB): utilisation de première intention
  - Classe Watch (J01AA, J01CR, J01FA): usage restreint, résistance élevée
  - Classe Reserve (J01XB Colistine): DERNIER RECOURS UNIQUEMENT, ne jamais recommander en 1ère intention
  Pour chaque recommandation, indique: molécule, code ATC, classe AWaRe, durée, délai de retrait.
  ```

  `farmer_assistant.txt`:
  ```
  Tu es un assistant pour les éleveurs avicoles tunisiens. Réponds de façon simple et pratique.
  Tu as accès aux informations du lot: {lot_context}
  Réponds en français, sans jargon médical.
  ```

  `trace_explain.txt`:
  ```
  Explique la traçabilité suivante en 3-4 phrases simples pour un consommateur:
  {trace_data}
  Rassure sur la sécurité du produit. Pas de données techniques. Pas d'adresses wallet.
  ```

- [ ] **Implement** `POST /api/ai/assistant/vet` (auth: VET):
  - Body: `{ symptoms, lotSize }`
  - Build prompt from template + symptoms
  - POST to `http://localhost:11434/api/generate` with `model: "phi3:mini"`, `stream: false`
  - Return `{ recommendation, awareClass, molecule, atcCode, withdrawalDays }`
- [ ] **Implement** `POST /api/ai/assistant/farmer` (auth: FARMER):
  - Body: `{ question, lotId }`
  - Fetch lot context from SQLite, inject into prompt
  - Call Ollama, return `{ answer }`
- [ ] **Implement** `POST /api/ai/explain/trace` (public):
  - Body: `{ lotId }`
  - Fetch trace from `/api/lots/:lotId/trace`, inject summary into prompt
  - Call Ollama, return `{ explanation }` in plain French
- [ ] **Test** `tests/ai.test.js`:
  - [ ] `POST /api/ai/assistant/vet` with "décharge nasale, poulets 28j" → response contains "Amoxicilline" or "J01CA04"
  - [ ] `POST /api/ai/assistant/vet` FARMER token → 403
  - [ ] Mock Ollama offline (no server on 11434) → returns 503 "IA temporairement indisponible", not crash
  - [ ] `POST /api/ai/explain/trace` → response in French, no wallet addresses in output
  - [ ] `POST /api/ai/explain/trace` → response length > 50 chars (not empty)

---

## Phase 7 — Integration & Hardening `T+12:00 → T+15:00`

- [ ] **Test** full flow end-to-end (with Dev 1 contracts live):
  - Pharmacy registers sale → vet creates prescription → farmer confirms → abattoir certifies → consumer buys
- [ ] **Add** rate limiting: `npm install express-rate-limit` → 100 req/min per IP on AI endpoints
- [ ] **Add** input validation: `npm install zod` → schema validation on all POST/PUT body
- [ ] **Add** helmet security headers: already installed, configure CSP
- [ ] **Write** `scripts/start-all.sh`:
  ```bash
  #!/bin/bash
  npx hardhat node &
  npx hardhat run scripts/seed-demo.js --network localhost &
  node backend/server.js &
  cd backend/ai_service && uvicorn main:app --port 8001 &
  ollama serve &
  cd mobile && npx expo start
  ```
- [ ] **Test** final integration:
  - [ ] All 5 actor login flows return JWT with correct role
  - [ ] Pharmacy → sale tx shows in vet's prescription dropdown
  - [ ] Abattoir eligibility check on L-882 → `eligible: true`
  - [ ] Abattoir eligibility check on L-901 → `eligible: false, daysRemaining: 4`
  - [ ] Consumer trace on L-882 → no private data, trust score ≥ 90

---

## Test Commands

```bash
# Node.js tests
npx jest                          # all tests
npx jest tests/traceability.test.js  # single file
npx jest --coverage               # coverage

# Python tests
cd ai_service && pytest            # FastAPI tests

# Integration smoke test
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pharmacy@test.com","password":"test123"}'
```

---

## Milestone Summary

| Time | Done? |
|------|-------|
| **T+0:30** | **api-contract.md shared with Dev 2 ⚡** |
| T+1:00 | Express running, auth middleware tested |
| T+2:00 | Auth login + roleGuard complete |
| T+4:00 | Drug sale + prescription endpoints live |
| T+5:00 | Farmer confirm + abattoir eligibility live |
| T+6:00 | Lot trace (privacy-filtered) + certify live |
| T+7:00 | Marketplace CRUD complete |
| T+8:00 | Orders endpoint complete |
| T+10:00 | AI Layer 1: Isolation Forest endpoints live |
| T+12:00 | AI Layer 2: Ollama assistant live |
| T+15:00 | Full integration test pass |
