const EmergencyContact = require('../models/EmergencyContact');
const supportConnector = require('./supportConnector');
const helplines = require('../emergency/helplines');
const logger = require('../utils/logger');

async function triggerSOS(sessionId, location) {
    logger.log('emergency_triggered', sessionId, {
        lat: location?.lat,
        lon: location?.lon,
    });

    let nearestServices = {};
    let contacts = null;

    try {
        // Find nearest services if location available
        if (location?.lat && location?.lon) {
            nearestServices = await supportConnector.findNearbyAll(location.lat, location.lon);
        }

        // Get user's emergency contacts
        const contactDoc = await EmergencyContact.findOne({ sessionId });
        contacts = contactDoc?.contacts || [];
    } catch (err) {
        logger.error('server_error', sessionId, err);
    }

    return {
        emergency: true,
        nearest_police: nearestServices.police_station?.[0] || null,
        nearest_hospital: nearestServices.hospital?.[0] || null,
        nearest_ngo: nearestServices.ngo?.[0] || null,
        nearest_shelter: nearestServices.shelter?.[0] || null,
        helpline_numbers: helplines.getAll(),
        emergency_contacts: contacts,
        location: location || null,
        timestamp: new Date().toISOString(),
    };
}

async function getEmergencyContacts(sessionId) {
    const doc = await EmergencyContact.findOne({ sessionId });
    return doc?.contacts || [];
}

async function saveEmergencyContacts(sessionId, contacts) {
    const doc = await EmergencyContact.findOneAndUpdate(
        { sessionId },
        { sessionId, contacts },
        { upsert: true, new: true }
    );
    return doc;
}

module.exports = { triggerSOS, getEmergencyContacts, saveEmergencyContacts };
