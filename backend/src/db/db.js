// ============================================
// SAFAR Chain — SQLite Database Connection
// WAL mode for concurrent reads, foreign keys enabled
// ============================================
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'safar.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

let db;

function getDb() {
    if (!db) {
        db = new Database(DB_PATH);
        // Performance & safety settings
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        db.pragma('busy_timeout = 5000');
        // Run schema
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
        db.exec(schema);

        // Migration: add chain_hash column if it doesn't exist
        try {
            const cols = db.prepare("PRAGMA table_info(audit_log)").all();
            if (!cols.find(c => c.name === 'chain_hash')) {
                db.exec('ALTER TABLE audit_log ADD COLUMN chain_hash TEXT');
                console.log('[DB] Migration: added chain_hash column to audit_log');
            }
        } catch {}

        console.log('[DB] SQLite initialized at', DB_PATH);
    }
    return db;
}

function closeDb() {
    if (db) {
        db.close();
        db = null;
        console.log('[DB] Connection closed');
    }
}

module.exports = { getDb, closeDb };
