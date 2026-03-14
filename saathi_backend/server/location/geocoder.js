const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

async function reverseGeocode(lat, lon) {
    if (!config.googleMapsApiKey || config.googleMapsApiKey === 'your-google-maps-api-key') {
        return `${lat}, ${lon}`;
    }

    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                latlng: `${lat},${lon}`,
                key: config.googleMapsApiKey,
            },
            timeout: 5000,
        });

        if (response.data.results && response.data.results.length > 0) {
            return response.data.results[0].formatted_address;
        }
        return `${lat}, ${lon}`;
    } catch (err) {
        logger.error('server_error', 'system', err);
        return `${lat}, ${lon}`;
    }
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg) {
    return deg * (Math.PI / 180);
}

module.exports = { reverseGeocode, haversineDistance };
