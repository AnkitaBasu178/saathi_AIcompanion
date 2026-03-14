const Conversation = require('../models/Conversation');
const User = require('../models/User');
const logger = require('../utils/logger');

async function cleanup() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
        const convResult = await Conversation.deleteMany({ createdAt: { $lt: cutoff } });
        const userResult = await User.deleteMany({ createdAt: { $lt: cutoff } });

        logger.log('data_cleanup', 'system', {
            conversations_deleted: convResult.deletedCount,
            users_deleted: userResult.deletedCount,
            cutoff: cutoff.toISOString(),
        });
    } catch (err) {
        logger.error('data_cleanup', 'system', err);
    }
}

module.exports = { cleanup };
