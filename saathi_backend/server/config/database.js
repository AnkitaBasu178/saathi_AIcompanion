const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

async function connectDB(attempt = 1) {
    try {
        await mongoose.connect(config.mongoUri);
        logger.log('db_connected', 'system', { uri: config.mongoUri.replace(/\/\/.*@/, '//***@') });
        console.log('✅ MongoDB connected');
    } catch (err) {
        logger.error('db_error', 'system', err);
        if (attempt < MAX_RETRIES) {
            console.log(`⏳ MongoDB retry ${attempt}/${MAX_RETRIES} in ${RETRY_DELAY / 1000}s...`);
            await new Promise((r) => setTimeout(r, RETRY_DELAY));
            return connectDB(attempt + 1);
        }
        console.error('❌ MongoDB connection failed after retries');
        process.exit(1);
    }
}

module.exports = { connectDB };
