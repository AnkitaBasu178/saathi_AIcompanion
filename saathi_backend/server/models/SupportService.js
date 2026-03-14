const mongoose = require('mongoose');

const supportServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['hospital', 'police_station', 'women_helpline', 'ngo', 'counsellor', 'shelter'],
        required: true,
    },
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    phone_number: String,
    operating_hours: String,
    verified_status: {
        type: Boolean,
        default: false,
    },
    address: String,
    city: String,
});

supportServiceSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SupportService', supportServiceSchema);
