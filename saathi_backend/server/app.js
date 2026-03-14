const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config');
const sessionMiddleware = require('./middleware/session');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const chatRoutes = require('./routes/chat');
const supportRoutes = require('./routes/support');
const emergencyRoutes = require('./routes/emergency');
const incidentRoutes = require('./routes/incidents');
const healthRoutes = require('./routes/health');
const voiceRoutes = require('./routes/voice');

const app = express();

// ── Security & Parsing ─────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false, // Allow Swagger UI to load
}));
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://172.20.21.230:5173"   // replace with your backend laptop IP
    ],
    methods: ["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization","x-session-id"],
    credentials: true
}));

app.options("*", cors());
app.use(express.json({ limit: '1mb' }));

// ── Serve Frontend ─────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Global Rate Limit ──────────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: true, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ── Swagger UI ─────────────────────────────────────────────────────
try {
    const swaggerUi = require('swagger-ui-express');
    const YAML = require('yamljs');
    const swaggerDoc = YAML.load(path.join(__dirname, '..', 'docs', 'openapi.yaml'));
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'SAATHI API Documentation',
    }));
} catch (err) {
    console.warn('⚠️  Swagger UI not available:', err.message);
}

// ── Session Middleware ──────────────────────────────────────────────
app.use('/api/', sessionMiddleware);

// ── Health Check ───────────────────────────────────────────────────
app.get('/api/ping', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        demo_mode: config.demoMode,
    });
});

// ── API Routes ─────────────────────────────────────────────────────
app.use('/api/chat', chatRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/voice', voiceRoutes);

// ── 404 Handler ────────────────────────────────────────────────────
app.use('/api/*', (_req, res) => {
    res.status(404).json({ error: true, message: 'Endpoint not found' });
});

// ── Global Error Handler ───────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
