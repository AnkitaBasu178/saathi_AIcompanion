const EVENTS = [
    'chat_received', 'classification_result', 'risk_detected',
    'risk_escalated', 'emergency_triggered', 'llm_error',
    'llm_fallback', 'support_lookup', 'abuse_blocked',
    'data_cleanup', 'server_error', 'db_connected', 'db_error',
    'server_started', 'ws_connected', 'ws_disconnected'
];

const logger = {
    log(event, sessionId, data = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            event,
            sessionId: sessionId || 'system',
            ...data,
        };
        console.log(JSON.stringify(entry));
    },

    error(event, sessionId, err) {
        const entry = {
            timestamp: new Date().toISOString(),
            event,
            sessionId: sessionId || 'system',
            error: err.message || String(err),
            stack: err.stack || null,
        };
        console.error(JSON.stringify(entry));
    },
};

module.exports = logger;
