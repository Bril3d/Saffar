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
        db = _openDb();
    }
    return db;
}

/**
 * Open & initialize the database.
 * Uses DELETE journal mode (safer on Windows with unclean shutdowns).
 * If the file is corrupted, auto-deletes and retries with a fresh DB.
 */
function _openDb() {
    // If DB file exists, try to open it; if corrupt, nuke and recreate
    if (fs.existsSync(DB_PATH)) {
        try {
            const instance = _tryOpen();
            console.log('[DB] SQLite initialized at', DB_PATH);
            return instance;
        } catch (err) {
            console.warn(`[DB] Database error: ${err.message}`);
            console.warn('[DB] Removing corrupted database and recreating...');
            _nukeDbFiles();
        }
    }

    // Fresh database
    const instance = _tryOpen();
    console.log('[DB] Fresh database created at', DB_PATH);
    return instance;
}

/**
 * Attempt to open the DB, configure it, verify integrity, and run schema.
 * Throws on any error.
 */
function _tryOpen() {
    const instance = new Database(DB_PATH);
    // Use DELETE journal mode — WAL is faster but more prone to corruption
    // on Windows when processes are killed (Ctrl+C, taskkill, etc.)
    instance.pragma('journal_mode = DELETE');
    instance.pragma('foreign_keys = ON');
    instance.pragma('busy_timeout = 5000');
    instance.pragma('synchronous = FULL');

    // Integrity check — catches corruption early
    const check = instance.pragma('integrity_check');
    if (check[0]?.integrity_check !== 'ok') {
        instance.close();
        throw new Error('database disk image is malformed');
    }

    // Run schema
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    instance.exec(schema);

    // Migration: add chain_hash column if it doesn't exist
    try {
        const cols = instance.prepare("PRAGMA table_info(audit_log)").all();
        if (!cols.find(c => c.name === 'chain_hash')) {
            instance.exec('ALTER TABLE audit_log ADD COLUMN chain_hash TEXT');
            console.log('[DB] Migration: added chain_hash column to audit_log');
        }
    } catch {}

    return instance;
}

/**
 * Delete the DB file and any associated journal files.
 */
function _nukeDbFiles() {
    for (const ext of ['', '-wal', '-shm', '-journal']) {
        try { fs.unlinkSync(DB_PATH + ext); } catch {}
    }
}

function closeDb() {
    if (db) {
        db.close();
        db = null;
        console.log('[DB] Connection closed');
    }
}

module.exports = { getDb, closeDb };
