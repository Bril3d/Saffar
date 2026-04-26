// ============================================
// SAFAR Chain — Server Entry Point
// Graceful shutdown + RAG vector store init
// ============================================
const app = require('./app');
const { closeDb } = require('./src/db/db');
const { initVectorStore } = require('./src/ai/vectorStore');
const { indexKnowledgeBase } = require('./src/ai/knowledgeIndexer');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║     🌿 SAFAR Chain Backend v2.0.0       ║
  ║     Port: ${PORT}                          ║
  ║     Env:  ${process.env.NODE_ENV || 'development'}               ║
  ╚══════════════════════════════════════════╝
    `);

    // Initialize RAG vector store
    try {
        initVectorStore();
        console.log('[RAG] Vector store initialized');

        // Index knowledge base in background (non-blocking)
        indexKnowledgeBase()
            .then(result => {
                console.log(`[RAG] Knowledge base indexed: ${result.indexed} documents (${result.status})`);
            })
            .catch(e => {
                console.warn(`[RAG] Knowledge base indexing deferred: ${e.message}`);
                console.warn('[RAG] RAG will use keyword fallback until embedding model is available');
            });
    } catch (e) {
        console.warn('[RAG] Vector store init failed:', e.message);
        console.warn('[RAG] RAG will use keyword fallback');
    }
});

// Graceful shutdown
function shutdown(signal) {
    console.log(`\n[SERVER] ${signal} received. Shutting down gracefully...`);
    server.close(() => {
        closeDb();
        console.log('[SERVER] Closed');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('[SERVER] Forced shutdown after timeout');
        process.exit(1);
    }, 5000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
