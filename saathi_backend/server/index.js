require("dotenv").config();

const http = require("http");
const cron = require("node-cron");
const app = require("./app");
const config = require("./config");
const { connectDB } = require("./config/database");
const { setupWebSocket } = require("./websocket/wsHandler");
const { cleanup } = require("./safety/dataRetention");
const logger = require("./utils/logger");

async function start() {

    try {

        // ── Connect to MongoDB ─────────────────────────────────────
        await connectDB();

        // ── Create HTTP Server ─────────────────────────────────────
        const server = http.createServer(app);

        // ── Attach WebSocket Server ────────────────────────────────
        setupWebSocket(server);

        // ── Schedule Data Retention Cleanup (Hourly) ───────────────
        cron.schedule("0 * * * *", () => {
            logger.log("data_cleanup", "system", { trigger: "cron" });
            cleanup();
        });

        // ── Start HTTP Server ──────────────────────────────────────
        server.listen(config.port, "0.0.0.0", () => {

            console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🛡️  SAATHI Backend Server                                  ║
║   AI-Powered Safety & Life Companion for Women               ║
║                                                              ║
║   🌐 REST API:    http://localhost:${config.port}/api/ping   ║
║   📚 API Docs:    http://localhost:${config.port}/api/docs   ║
║   🔌 WebSocket:   ws://localhost:${config.port}/ws           ║
║   🎮 Demo Mode:   ${config.demoMode ? "ENABLED" : "DISABLED"}║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

            logger.log("server_started", "system", {
                port: config.port,
                demoMode: config.demoMode,
                nodeEnv: config.nodeEnv
            });

        });

        // ── Graceful Shutdown Handler ──────────────────────────────
        const shutdown = (signal) => {

            console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);

            server.close(() => {
                console.log("✅ HTTP server closed");
                process.exit(0);
            });

            setTimeout(() => {
                console.error("⚠️ Forced shutdown");
                process.exit(1);
            }, 5000);
        };

        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));

    } catch (err) {

        logger.error("server_start_failed", "system", err);
        console.error("❌ Failed to start server:", err);
        process.exit(1);

    }
}

start();