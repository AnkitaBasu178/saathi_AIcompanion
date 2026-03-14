const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
    },
    contacts: [{
        name: { type: String, required: true },
        phone: { type: String, required: true },
        relationship: String,
        isPrimary: { type: Boolean, default: false },
    }],
});

emergencyContactSchema.index({ sessionId: 1 });

module.exports = mongoose.model('EmergencyContact', emergencyContactSchema);
