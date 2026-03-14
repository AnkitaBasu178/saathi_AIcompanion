const supportConnector = require('../services/supportConnector');
const { validateLocation } = require('../utils/validators');

// Frontend → backend type mapping
const TYPE_MAP = { police: 'police_station', asha: 'ngo', ngo: 'ngo', hospital: 'hospital' };

async function getNearby(req, res, next) {
    try {
        const { lat, lon, type, radius } = req.query;

        const locValidation = validateLocation(lat, lon);
        if (!locValidation.valid) {
            return res.status(400).json({ error: true, message: locValidation.error });
        }

        const radiusKm = parseFloat(radius) || 10;
        const mappedType = type ? (TYPE_MAP[type] || type) : null;

        let services;
        if (mappedType) {
            services = await supportConnector.findNearbySupport(
                locValidation.value.lat,
                locValidation.value.lon,
                mappedType,
                radiusKm
            );
        } else {
            services = await supportConnector.findNearbyAll(
                locValidation.value.lat,
                locValidation.value.lon
            );
        }

        res.json({ services });
    } catch (err) {
        next(err);
    }
}

module.exports = { getNearby };
