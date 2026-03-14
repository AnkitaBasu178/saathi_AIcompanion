const conversationService = require('../services/conversationService');
const { validateMessage, validateLocation } = require('../utils/validators');
const logger = require('../utils/logger');

async function sendMessage(req, res, next) {
    try {
        const { message, location } = req.body;
        const sessionId = req.sessionId;
        const lang = req.body.lang || req.body.language || null;

        const msgValidation = validateMessage(message);
        if (!msgValidation.valid) {
            return res.status(400).json({ error: true, message: msgValidation.error });
        }

        let validLocation = null;
        if (location) {
            const locValidation = validateLocation(location.lat, location.lon);
            if (locValidation.valid) {
                validLocation = locValidation.value;
            }
        }

        const response = await conversationService.processMessage(
            sessionId,
            msgValidation.value,
            validLocation,
            lang
        );

        res.json(response);
    } catch (err) {
        next(err);
    }
}

async function getHistory(req, res, next) {
    try {
        const sessionId = req.sessionId;
        const history = await conversationService.getHistory(sessionId);
        res.json(history);
    } catch (err) {
        next(err);
    }
}

module.exports = { sendMessage, getHistory };
