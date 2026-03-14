const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const logger = require('../utils/logger');

async function sessionMiddleware(req, res, next) {
    try {
        let sessionId = req.headers['x-session-id'];

        if (!sessionId) {
            sessionId = uuidv4();
            res.setHeader('x-session-id', sessionId);
        }

        req.sessionId = sessionId;

        // Auto-create user document if not exists
        const existing = await User.findOne({ sessionId });
        if (!existing) {
            await User.create({ sessionId });
        }

        next();
    } catch (err) {
        logger.error('server_error', req.sessionId, err);
        next(err);
    }
}

module.exports = sessionMiddleware;
