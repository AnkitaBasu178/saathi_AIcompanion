const emergencyService = require('../services/emergencyService');
const { validateLocation } = require('../utils/validators');

async function triggerSOS(req, res, next) {
    try {
        const { lat, lon } = req.body;
        const sessionId = req.sessionId;

        let location = null;
        if (lat !== undefined && lon !== undefined) {
            const locValidation = validateLocation(lat, lon);
            if (locValidation.valid) {
                location = locValidation.value;
            }
        }

        const response = await emergencyService.triggerSOS(sessionId, location);
        res.json(response);
    } catch (err) {
        next(err);
    }
}

async function addContacts(req, res, next) {
    try {
        const { contacts } = req.body;
        const sessionId = req.sessionId;

        if (!Array.isArray(contacts) || contacts.length === 0) {
            return res.status(400).json({ error: true, message: 'Contacts array is required' });
        }

        const doc = await emergencyService.saveEmergencyContacts(sessionId, contacts);
        res.json({ success: true, contacts: doc.contacts });
    } catch (err) {
        next(err);
    }
}

async function getContacts(req, res, next) {
    try {
        const sessionId = req.sessionId;
        const contacts = await emergencyService.getEmergencyContacts(sessionId);
        res.json({ contacts });
    } catch (err) {
        next(err);
    }
}

module.exports = { triggerSOS, addContacts, getContacts };
