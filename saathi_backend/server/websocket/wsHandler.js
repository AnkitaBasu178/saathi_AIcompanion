const { WebSocketServer } = require('ws');
const conversationService = require('../services/conversationService');
const emergencyService = require('../services/emergencyService');
const logger = require('../utils/logger');

const clients = new Map(); // sessionId -> ws

function setupWebSocket(server) {
    const wss = new WebSocketServer({ server, path: '/ws' });

    // Heartbeat interval
    const heartbeatInterval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (ws.isAlive === false) {
                logger.log('ws_disconnected', ws.sessionId, { reason: 'heartbeat_timeout' });
                clients.delete(ws.sessionId);
                return ws.terminate();
            }
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wss.on('close', () => clearInterval(heartbeatInterval));

    wss.on('connection', (ws, req) => {
        ws.isAlive = true;
        ws.lastActivity = Date.now();

        // Extract session ID from query string
        const url = new URL(req.url, 'http://localhost');
        ws.sessionId = url.searchParams.get('sessionId') || `ws-${Date.now()}`;

        clients.set(ws.sessionId, ws);
        logger.log('ws_connected', ws.sessionId, {});

        ws.on('pong', () => {
            ws.isAlive = true;
        });

        ws.on('message', async (data) => {
            ws.lastActivity = Date.now();

            try {
                const parsed = JSON.parse(data.toString());
                const { event } = parsed;
                const payload = parsed.data || parsed.payload || {};

                switch (event) {
                    case 'chat:message': {
                        // Send typing indicator
                        send(ws, 'chat:typing', { isTyping: true });

                        const response = await conversationService.processMessage(
                            ws.sessionId,
                            payload.message,
                            payload.location,
                            payload.language || 'en-IN'
                        );

                        send(ws, 'chat:typing', { isTyping: false });
                        send(ws, 'chat:response', response);
                        break;
                    }

                    case 'chat:typing': {
                        // Broadcast typing status (for future multi-user support)
                        send(ws, 'chat:typing', { isTyping: payload.isTyping });
                        break;
                    }

                    case 'sos:trigger': {
                        const location = payload?.lat && payload?.lon
                            ? { lat: payload.lat, lon: payload.lon }
                            : null;

                        const emergency = await emergencyService.triggerSOS(ws.sessionId, location);
                        send(ws, 'sos:activated', emergency);
                        break;
                    }

                    default:
                        send(ws, 'error', { message: `Unknown event: ${event}` });
                }
            } catch (err) {
                logger.error('server_error', ws.sessionId, err);
                send(ws, 'error', { message: 'Failed to process message' });
            }
        });

        ws.on('close', () => {
            logger.log('ws_disconnected', ws.sessionId, {});
            clients.delete(ws.sessionId);
        });

        ws.on('error', (err) => {
            logger.error('server_error', ws.sessionId, err);
            clients.delete(ws.sessionId);
        });

        // Auto-disconnect after 5 minutes of inactivity
        const inactivityCheck = setInterval(() => {
            if (Date.now() - ws.lastActivity > 5 * 60 * 1000) {
                logger.log('ws_disconnected', ws.sessionId, { reason: 'inactivity' });
                ws.close(1000, 'Inactivity timeout');
                clients.delete(ws.sessionId);
                clearInterval(inactivityCheck);
            }
        }, 60000);

        // Welcome message
        send(ws, 'connected', {
            sessionId: ws.sessionId,
            message: 'Connected to SAATHI. How can I help you today?',
        });
    });

    return wss;
}

function send(ws, event, data) {
    if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ event, data, timestamp: new Date().toISOString() }));
    }
}

module.exports = { setupWebSocket };
