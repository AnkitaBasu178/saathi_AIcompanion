const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const conversationSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
    },
    messages: [messageSchema],
    summary: {
        type: String,
        default: '',
    },
    category: {
        type: String,
        default: 'general',
    },
    riskLevel: {
        type: String,
        enum: ['green', 'yellow', 'red'],
        default: 'green',
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400, // TTL: 24 hours
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

conversationSchema.index({ sessionId: 1, updatedAt: -1 });

conversationSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
