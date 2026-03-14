const { classifySituation } = require('../ai/classifier');
const logger = require('../utils/logger');

async function analyze(text, context, sessionId) {
    const classification = await classifySituation(text, context);

    logger.log('classification_result', sessionId, classification);

    if (classification.risk_level === 'red') {
        logger.log('risk_detected', sessionId, {
            category: classification.category,
            risk_level: 'red',
        });
    }

    return classification;
}

module.exports = { analyze };
