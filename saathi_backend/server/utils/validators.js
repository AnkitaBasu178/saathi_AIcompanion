function validateMessage(message) {
    if (!message || typeof message !== 'string') {
        return { valid: false, error: 'Message is required and must be a string' };
    }
    const trimmed = message.trim();
    if (trimmed.length < 1 || trimmed.length > 2000) {
        return { valid: false, error: 'Message must be between 1 and 2000 characters' };
    }
    return { valid: true, value: trimmed };
}

function validateLocation(lat, lon) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    if (isNaN(latitude) || isNaN(longitude)) {
        return { valid: false, error: 'Latitude and longitude must be valid numbers' };
    }
    if (latitude < -90 || latitude > 90) {
        return { valid: false, error: 'Latitude must be between -90 and 90' };
    }
    if (longitude < -180 || longitude > 180) {
        return { valid: false, error: 'Longitude must be between -180 and 180' };
    }
    return { valid: true, value: { lat: latitude, lon: longitude } };
}

function validateIncidentReport(data) {
    if (!data || !data.description || typeof data.description !== 'string') {
        return { valid: false, error: 'Description is required' };
    }
    const trimmed = data.description.trim();
    if (trimmed.length < 1) {
        return { valid: false, error: 'Description cannot be empty' };
    }
    return {
        valid: true,
        value: {
            description: trimmed,
            date: data.date ? new Date(data.date) : new Date(),
            time: data.time || new Date().toLocaleTimeString('en-IN'),
            location: data.location || null,
            media_url: data.media_url || null,
        },
    };
}

module.exports = { validateMessage, validateLocation, validateIncidentReport };
