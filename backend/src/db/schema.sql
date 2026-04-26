-- ============================================
-- SAFAR Chain — Database Schema
-- SQLite with WAL mode for concurrent reads
-- ============================================

-- Users table: all actor types
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    wallet_address TEXT UNIQUE,
    role TEXT NOT NULL CHECK(role IN ('PHARMACY', 'VET', 'FARMER', 'SLAUGHTERHOUSE', 'CONSUMER', 'ADMIN')),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT,
    phone TEXT,
    governorate TEXT,
    license_number TEXT,
    verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Products: marketplace listings linked to blockchain-certified lots
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    farmer_id TEXT NOT NULL REFERENCES users(id),
    lot_id TEXT,
    certificate_hash TEXT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK(category IN ('EGGS', 'POULTRY_LIVE', 'POULTRY_MEAT', 'DAIRY', 'HONEY', 'RED_MEAT')),
    price_per_unit REAL NOT NULL,
    unit TEXT CHECK(unit IN ('KG', 'PIECE', 'LITER', 'DOZEN')),
    quantity_available INTEGER NOT NULL DEFAULT 0,
    delivery_options TEXT CHECK(delivery_options IN ('PICKUP', 'DELIVERY', 'BOTH')),
    location_address TEXT,
    location_lat REAL,
    location_lng REAL,
    status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'SOLD_OUT', 'PAUSED')),
    created_at TEXT DEFAULT (datetime('now'))
);

-- Orders: consumer purchases
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id),
    consumer_id TEXT NOT NULL REFERENCES users(id),
    farmer_id TEXT NOT NULL REFERENCES users(id),
    quantity INTEGER NOT NULL,
    total_price REAL NOT NULL,
    commission REAL NOT NULL,
    farmer_payout REAL NOT NULL,
    delivery_option TEXT CHECK(delivery_option IN ('PICKUP', 'DELIVERY')),
    delivery_address TEXT,
    status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED')),
    created_at TEXT DEFAULT (datetime('now'))
);

-- Reviews: consumer ratings
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id),
    consumer_id TEXT NOT NULL REFERENCES users(id),
    farmer_id TEXT NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Relayer nonces: prevent replay attacks on meta-transactions
CREATE TABLE IF NOT EXISTS relayer_nonces (
    address TEXT NOT NULL,
    nonce INTEGER NOT NULL,
    PRIMARY KEY (address, nonce)
);

-- Off-chain prescription metadata: for fast queries
CREATE TABLE IF NOT EXISTS prescriptions_offchain (
    rx_id TEXT PRIMARY KEY,
    sale_id TEXT,
    vet_id TEXT REFERENCES users(id),
    farmer_id TEXT REFERENCES users(id),
    animal_lot_id TEXT,
    diagnosis TEXT,
    dosage REAL,
    withdrawal_days INTEGER,
    withdrawal_end TEXT,
    start_date TEXT,
    administered INTEGER DEFAULT 0,
    admin_timestamp TEXT,
    tx_hash TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Off-chain drug sale metadata
CREATE TABLE IF NOT EXISTS drug_sales_offchain (
    sale_id TEXT PRIMARY KEY,
    pharmacy_id TEXT REFERENCES users(id),
    vet_id TEXT REFERENCES users(id),
    atc_code TEXT NOT NULL,
    batch_number TEXT,
    quantity INTEGER,
    aware_class TEXT CHECK(aware_class IN ('Access', 'Watch', 'Reserve')),
    tx_hash TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Lot certifications
CREATE TABLE IF NOT EXISTS lot_certifications (
    lot_id TEXT PRIMARY KEY,
    slaughterhouse_id TEXT REFERENCES users(id),
    certificate_hash TEXT,
    eligible INTEGER,
    tx_hash TEXT,
    certified_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- CYBERSECURITY: Audit Log
-- Every write operation is logged immutably
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    user_role TEXT,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    details TEXT,
    chain_hash TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_products_farmer ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_consumer ON orders(consumer_id);
CREATE INDEX IF NOT EXISTS idx_orders_farmer ON orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_farmer ON prescriptions_offchain(farmer_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_lot ON prescriptions_offchain(animal_lot_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
