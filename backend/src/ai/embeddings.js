// ============================================
// SAFAR Chain — Ollama Embeddings Client
// Uses nomic-embed-text (768-dim vectors)
// ============================================
const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
const EMBED_TIMEOUT = parseInt(process.env.OLLAMA_EMBED_TIMEOUT) || 30000;

/**
 * Generate embedding vector for a single text
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector (768-dim for nomic-embed-text)
 */
async function embed(text) {
    if (!text || typeof text !== 'string') throw new Error('Text is required for embedding');

    const response = await axios.post(`${OLLAMA_URL}/api/embeddings`, {
        model: EMBED_MODEL,
        prompt: text.slice(0, 8192) // nomic-embed-text max context: 8192 tokens
    }, { timeout: EMBED_TIMEOUT });

    return response.data.embedding;
}

/**
 * Generate embeddings for multiple texts (batched)
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
async function embedBatch(texts) {
    const results = [];
    // Process in batches of 5 to avoid overwhelming Ollama
    for (let i = 0; i < texts.length; i += 5) {
        const batch = texts.slice(i, i + 5);
        const promises = batch.map(text => embed(text));
        const batchResults = await Promise.all(promises);
        results.push(...batchResults);
    }
    return results;
}

/**
 * Cosine similarity between two vectors
 * @param {number[]} a - Vector A
 * @param {number[]} b - Vector B
 * @returns {number} - Similarity score (0 to 1)
 */
function cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (normA * normB);
}

/**
 * Check if embedding model is available
 */
async function isAvailable() {
    try {
        const response = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 3000 });
        const models = response.data?.models || [];
        return models.some(m => m.name.startsWith(EMBED_MODEL));
    } catch {
        return false;
    }
}

module.exports = { embed, embedBatch, cosineSimilarity, isAvailable, EMBED_MODEL };
