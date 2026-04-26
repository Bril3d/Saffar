# SAFAR Chain — API Contract v1.0

> **Base URL**: `http://localhost:3000/api`  
> **Auth**: Bearer JWT in `Authorization` header  
> **Response Format**: `{ success, data, error: {code, message}, meta: {timestamp, txHash?} }`

---

## Auth

### POST /auth/register
**Auth**: None | **Role**: Consumer only
```json
// Request
{ "name": "string", "email": "string", "password": "string (min 8, 1 upper, 1 lower, 1 digit)" }
// Response 201
{ "token": "jwt", "user": { "id", "role", "name", "email" } }
```

### POST /auth/login
**Auth**: None
```json
// Request
{ "email": "string", "password": "string" }
// Response 200
{ "token": "jwt", "user": { "id", "role", "name", "email", "walletAddress" } }
```

### POST /auth/wallet-login
**Auth**: None | Blockchain actors
```json
// Request
{ "walletAddress": "0x...", "signature": "string", "message": "string" }
// Response 200
{ "token": "jwt", "user": { "id", "role", "name", "walletAddress" } }
```

---

## Drug Sales

### POST /drugs/sale
**Auth**: PHARMACY
```json
// Request
{ "vetId": "uuid", "atcCode": "J01CA04", "batchNumber": "BN-001", "quantity": 500, "awareClass": "Access|Watch|Reserve" }
// Response 201
{ "saleId": "SALE-1", "txHash": "0x...", "atcCode": "J01CA04", "awareClass": "Access" }
```

### GET /drugs/sale/:id
**Auth**: Any authenticated

---

## Prescriptions

### POST /prescriptions
**Auth**: VET
```json
// Request
{ "saleId": "SALE-1", "farmerId": "uuid", "animalLotId": "L-882", "diagnosis": "string", "dosage": 50, "withdrawalDays": 5 }
// Response 201
{ "rxId": "RX-1", "txHash": "0x...", "withdrawalEnd": "ISO date", "effectiveWithdrawalDays": 5 }
```

### GET /prescriptions/:id
**Auth**: Any authenticated

### PUT /prescriptions/:id/confirm
**Auth**: FARMER (must own)
```json
// Response 200
{ "confirmed": true, "txHash": "0x...", "withdrawalEnd": "ISO date" }
```

---

## Lots

### GET /lots/:lotId/eligibility
**Auth**: SLAUGHTERHOUSE
```json
// Response 200
{ "lotId": "L-882", "eligible": true, "daysRemaining": 0 }
```

### POST /lots/:lotId/certify
**Auth**: SLAUGHTERHOUSE
```json
// Response 201
{ "lotId": "L-882", "certificateHash": "0x...", "txHash": "0x..." }
```

### GET /lots/:lotId/trace
**Auth**: PUBLIC (no auth required)
```json
// Response 200 — PRIVACY FILTERED (no names, wallets, exact dosages)
{ "lotId": "L-882", "prescriptions": [{ "antibiotic": "J01CA04", "awareClass": "Access", "administered": true }], "certification": { "certified": true }, "trustScore": 100 }
```

---

## Marketplace

### GET /products
**Auth**: Public | **Query**: `?category=EGGS&governorate=Ariana&sort=price&page=1&limit=20`

### GET /products/:id
**Auth**: Public

### POST /products
**Auth**: FARMER (lot must be certified)
```json
{ "lotId": "L-882", "title": "string", "category": "EGGS|POULTRY_LIVE|POULTRY_MEAT|DAIRY|HONEY|RED_MEAT", "pricePerUnit": 1.2, "unit": "KG|PIECE|LITER|DOZEN", "quantityAvailable": 100, "deliveryOptions": "PICKUP|DELIVERY|BOTH" }
```

### PUT /products/:id
**Auth**: FARMER (must own)

### DELETE /products/:id
**Auth**: FARMER (must own) — soft delete to PAUSED

### POST /orders
**Auth**: CONSUMER
```json
{ "productId": "uuid", "quantity": 5, "deliveryOption": "DELIVERY", "deliveryAddress": "string" }
// Response 201
{ "orderId": "uuid", "totalPrice": 6.0, "commission": 0.6, "farmerPayout": 5.4 }
```

### GET /orders/:id
**Auth**: Buyer or seller

### PUT /orders/:id/status
**Auth**: FARMER | Valid transitions: PENDING→CONFIRMED→PREPARING→READY→DELIVERED

### POST /reviews
**Auth**: CONSUMER (order must be DELIVERED)
```json
{ "orderId": "uuid", "rating": 5, "comment": "optional string" }
```

---

## AI Endpoints

### POST /ai/assistant/vet — VET only
```json
{ "symptoms": "décharge nasale, perte appétit, poulets 28j", "lotSize": 3000 }
// Response: { "recommendation": "...", "model": "phi3:mini" }
```

### POST /ai/assistant/farmer — FARMER only
```json
{ "question": "Quand est-ce que je peux vendre mes poulets?", "lotId": "L-882" }
// Response: { "answer": "..." }
```

### POST /ai/explain/trace — PUBLIC
```json
{ "lotId": "L-882" }
// Response: { "explanation": "plain French text" }
```

### GET /ai/anomaly/vet/:vetId — ADMIN
### GET /ai/anomaly/farm/:farmerId — ADMIN or own FARMER
### GET /ai/forecast/:governorate — ADMIN
### GET /ai/status — PUBLIC health check
