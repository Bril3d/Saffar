// ============================================
// SAFAR Chain — Server Entry Point
// Graceful shutdown + RAG vector store init
// ============================================
const app = require('./app');
const { closeDb } = require('./src/db/db');
const { initVectorStore } = require('./src/ai/vectorStore');
const { indexKnowledgeBase } = require('./src/ai/knowledgeIndexer');

const { execSync } = require('child_process');
const PORT = process.env.PORT || 3000;

function onListening() {
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
}

let retried = false;
const server = app.listen(PORT);
server.on('listening', onListening);
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && !retried) {
        retried = true;
        console.warn(`[SERVER] Port ${PORT} in use — killing stale process and retrying...`);
        try {
            // Windows: find and kill the PID holding this port
            const result = execSync(
                `cmd /c "for /f "tokens=5" %a in ('netstat -aon ^| findstr :${PORT} ^| findstr LISTENING') do @echo %a"`,
                { encoding: 'utf-8', timeout: 5000 }
            ).trim();
            const pids = [...new Set(result.split(/\s+/).filter(Boolean))];
            for (const pid of pids) {
                if (pid !== String(process.pid)) {
                    try { execSync(`taskkill /F /PID ${pid}`, { timeout: 3000 }); } catch {}
                }
            }
        } catch {}
        setTimeout(() => {
            server.listen(PORT);
        }, 1000);
    } else {
        console.error('[SERVER] Fatal error:', err.message);
        process.exit(1);
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
