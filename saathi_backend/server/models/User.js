const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        unique: true,
        required: true,
        index: true,
    },
    emergencyContacts: [{
        name: String,
        phone: String,
        relationship: String,
    }],
    lastLocation: {
        lat: Number,
        lon: Number,
        timestamp: Date,
    },
    preferences: {
        language: { type: String, default: 'en' },
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400, // TTL: 24 hours
    },
});

module.exports = mongoose.model('User', userSchema);
