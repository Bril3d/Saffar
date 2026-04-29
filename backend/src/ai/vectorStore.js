// ============================================
// SAFAR Chain — Vector Store (SQLite-backed)
// Stores document embeddings with metadata
// Supports semantic similarity search
// ============================================
const { getDb } = require('../db/db');
const { embed, cosineSimilarity } = require('./embeddings');

// In-memory index for fast similarity search
// Loaded from SQLite at startup, kept in sync
let memoryIndex = [];
let initialized = false;

/**
 * Initialize the vector store table and load existing embeddings into memory
 */
function initVectorStore() {
    const db = getDb();

    // Create vector store table if not exists
    db.exec(`
        CREATE TABLE IF NOT EXISTS vector_store (
            id TEXT PRIMARY KEY,
            content TEXT NOT NULL,
            metadata TEXT,
            embedding TEXT NOT NULL,
            source TEXT NOT NULL,
            category TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_vector_source ON vector_store(source);
        CREATE INDEX IF NOT EXISTS idx_vector_category ON vector_store(category);
    `);

    // Load existing vectors into memory
    loadIntoMemory();
    initialized = true;
    console.log(`[VECTOR] Store initialized with ${memoryIndex.length} documents`);
}

/**
 * Load all vectors from SQLite into memory index
 */
function loadIntoMemory() {
    const db = getDb();
    const rows = db.prepare('SELECT id, content, metadata, embedding, source, category FROM vector_store').all();
    memoryIndex = rows.map(row => ({
        id: row.id,
        content: row.content,
        metadata: row.metadata ? JSON.parse(row.metadata) : {},
        embedding: JSON.parse(row.embedding),
        source: row.source,
        category: row.category
    }));
}

/**
 * Add a document to the vector store
 * @param {string} id - Unique document ID
 * @param {string} content - Document text content
 * @param {object} metadata - Associated metadata
 * @param {string} source - Source identifier (e.g., 'regulatory', 'prescription')
 * @param {string} category - Category for filtering
 */
async function addDocument(id, content, metadata = {}, source = 'manual', category = 'general') {
    const db = getDb();

    // Check if already exists
    const existing = db.prepare('SELECT id FROM vector_store WHERE id = ?').get(id);
    if (existing) return;

    // Generate embedding
    const embedding = await embed(content);

    // Store in SQLite
    db.prepare(`
        INSERT OR REPLACE INTO vector_store (id, content, metadata, embedding, source, category)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, content, JSON.stringify(metadata), JSON.stringify(embedding), source, category);

    // Add to memory index
    memoryIndex.push({ id, content, metadata, embedding, source, category });
}

/**
 * Add multiple documents in batch
 * @param {Array<{id, content, metadata, source, category}>} documents
 */
async function addDocuments(documents) {
    const db = getDb();
    const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO vector_store (id, content, metadata, embedding, source, category)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    let added = 0;
    for (const doc of documents) {
        try {
            const existing = db.prepare('SELECT id FROM vector_store WHERE id = ?').get(doc.id);
            if (existing) continue;

            const embedding = await embed(doc.content);
            insertStmt.run(
                doc.id,
                doc.content,
                JSON.stringify(doc.metadata || {}),
                JSON.stringify(embedding),
                doc.source || 'batch',
                doc.category || 'general'
            );
            memoryIndex.push({
                id: doc.id,
                content: doc.content,
                metadata: doc.metadata || {},
                embedding,
                source: doc.source || 'batch',
                category: doc.category || 'general'
            });
            added++;
        } catch (e) {
            console.error(`[VECTOR] Failed to embed document ${doc.id}:`, e.message);
        }
    }
    return added;
}

/**
 * Semantic search: find top-K most similar documents to a query
 * @param {string} query - Search query text
 * @param {number} topK - Number of results to return
 * @param {object} filter - Optional filters {source, category}
 * @returns {Promise<Array<{id, content, metadata, similarity}>>}
 */
async function search(query, topK = 5, filter = {}) {
    if (memoryIndex.length === 0) return [];

    // Embed the query
    const queryEmbedding = await embed(query);

    // Filter candidates
    let candidates = memoryIndex;
    if (filter.source) {
        candidates = candidates.filter(d => d.source === filter.source);
    }
    if (filter.category) {
        candidates = candidates.filter(d => d.category === filter.category);
    }

    // Compute similarities
    const scored = candidates.map(doc => ({
        id: doc.id,
        content: doc.content,
        metadata: doc.metadata,
        source: doc.source,
        category: doc.category,
        similarity: cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    // Sort by similarity descending, return top K
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, topK);
}

/**
 * Get vector store statistics
 */
function getStats() {
    return {
        totalDocuments: memoryIndex.length,
        initialized,
        sources: [...new Set(memoryIndex.map(d => d.source))],
        categories: [...new Set(memoryIndex.map(d => d.category))],
        embeddingDimension: memoryIndex[0]?.embedding?.length || 0
    };
}

/**
 * Clear all documents from a specific source
 */
function clearSource(source) {
    const db = getDb();
    db.prepare('DELETE FROM vector_store WHERE source = ?').run(source);
    memoryIndex = memoryIndex.filter(d => d.source !== source);
}

/**
 * Clear all documents
 */
function clearAll() {
    const db = getDb();
    db.exec('DELETE FROM vector_store');
    memoryIndex = [];
}

module.exports = {
    initVectorStore,
    addDocument,
    addDocuments,
    search,
    getStats,
    clearSource,
    clearAll,
    loadIntoMemory
};
