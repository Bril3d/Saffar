// ============================================
// SAFAR Chain — Server Entry Point
// Graceful shutdown support
// ============================================
const app = require('./app');
const { closeDb } = require('./src/db/db');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║     🌿 SAFAR Chain Backend v1.0.0       ║
  ║     Port: ${PORT}                          ║
  ║     Env:  ${process.env.NODE_ENV || 'development'}               ║
  ╚══════════════════════════════════════════╝
    `);
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
