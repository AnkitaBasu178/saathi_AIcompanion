const logger = require('../utils/logger');

// In-memory trackers per session
const sessionRates = new Map();   // sessionId -> { count, resetTime }
const sessionHistory = new Map(); // sessionId -> [last 5 messages]

const MAX_MESSAGES_PER_MINUTE = 20;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_REPEAT_COUNT = 3;
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

// Auto-cleanup stale sessions
setInterval(() => {
    const now = Date.now();
    for (const [sid, data] of sessionRates) {
        if (now > data.resetTime + 120000) {
            sessionRates.delete(sid);
            sessionHistory.delete(sid);
        }
    }
}, CLEANUP_INTERVAL);

function abuseProtection(req, res, next) {
    // Only apply to chat message endpoint
    if (req.path !== '/message' && req.path !== '/') {
        return next();
    }

    const sessionId = req.sessionId || 'unknown';
    const message = req.body && req.body.message;

    if (!message) return next();

    // Content length check
    if (message.length > MAX_MESSAGE_LENGTH) {
        logger.log('abuse_blocked', sessionId, { reason: 'message_too_long', length: message.length });
        return res.status(400).json({
            error: true,
            message: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`,
        });
    }

    // Rate limiting per session
    const now = Date.now();
    let rate = sessionRates.get(sessionId);
    if (!rate || now > rate.resetTime) {
        rate = { count: 0, resetTime: now + 60000 };
        sessionRates.set(sessionId, rate);
    }
    rate.count++;

    if (rate.count > MAX_MESSAGES_PER_MINUTE) {
        logger.log('abuse_blocked', sessionId, { reason: 'rate_limit', count: rate.count });
        return res.status(429).json({
            error: true,
            message: 'Too many messages. Please wait a moment before sending again.',
        });
    }

    // Repeat message detection
    let history = sessionHistory.get(sessionId);
    if (!history) {
        history = [];
        sessionHistory.set(sessionId, history);
    }

    const normalizedMsg = message.trim().toLowerCase();
    const repeatCount = history.filter((m) => m === normalizedMsg).length;

    if (repeatCount >= MAX_REPEAT_COUNT) {
        logger.log('abuse_blocked', sessionId, { reason: 'repeated_message', count: repeatCount });
        return res.status(400).json({
            error: true,
            message: 'It seems you have sent the same message multiple times. Please try a different message or describe your situation in more detail.',
        });
    }

    history.push(normalizedMsg);
    if (history.length > 5) history.shift();

    next();
}

module.exports = abuseProtection;
