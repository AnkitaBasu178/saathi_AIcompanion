const SupportService = require('../models/SupportService');
const { haversineDistance } = require('../location/geocoder');
const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

async function findNearbySupport(lat, lon, type, radiusKm = 10) {
    const query = {
        location: {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [lon, lat], // GeoJSON: [longitude, latitude]
                },
                $maxDistance: radiusKm * 1000, // Convert km to meters
            },
        },
    };

    if (type) {
        query.type = type;
    }

    try {
        const services = await SupportService.find(query).limit(10);
        logger.log('support_lookup', 'system', { lat, lon, type, count: services.length });
        return services;
    } catch (err) {
        logger.error('server_error', 'system', err);
        return [];
    }
}

async function findNearbyAll(lat, lon) {
    const types = ['hospital', 'police_station', 'ngo', 'counsellor', 'shelter'];
    const results = {};

    try {
        const promises = types.map(async (type) => {
            const services = await findNearbySupport(lat, lon, type, 15);
            return { type, services };
        });

        const all = await Promise.all(promises);
        for (const { type, services } of all) {
            results[type] = services;
        }
    } catch (err) {
        logger.error('server_error', 'system', err);
    }

    return results;
}

async function getGoogleMapsDistance(originLat, originLon, destLat, destLon) {
    if (!config.googleMapsApiKey || config.googleMapsApiKey === 'your-google-maps-api-key') {
        // Fallback to Haversine
        return {
            distance_km: haversineDistance(originLat, originLon, destLat, destLon).toFixed(2),
            source: 'haversine',
        };
    }

    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
            params: {
                origins: `${originLat},${originLon}`,
                destinations: `${destLat},${destLon}`,
                key: config.googleMapsApiKey,
            },
            timeout: 5000,
        });

        const element = response.data?.rows?.[0]?.elements?.[0];
        if (element?.status === 'OK') {
            return {
                distance_km: (element.distance.value / 1000).toFixed(2),
                duration: element.duration.text,
                source: 'google_maps',
            };
        }
    } catch (err) {
        logger.error('server_error', 'system', err);
    }

    // Fallback
    return {
        distance_km: haversineDistance(originLat, originLon, destLat, destLon).toFixed(2),
        source: 'haversine',
    };
}

module.exports = { findNearbySupport, findNearbyAll, getGoogleMapsDistance };
