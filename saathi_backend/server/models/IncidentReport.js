const mongoose = require('mongoose');

const incidentReportSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    time: String,
    location: {
        lat: Number,
        lon: Number,
        address: String,
    },
    description: {
        type: String,
        required: true,
        // Encrypted at service layer before save
    },
    media_url: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

incidentReportSchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model('IncidentReport', incidentReportSchema);
