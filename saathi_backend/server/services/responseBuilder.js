const contentFilter = require('../safety/contentFilter');
const helplines = require('../emergency/helplines');

/**
 * Build final structured response.
 * Content filter (sanitize) is applied here as the last pipeline stage.
 *
 * @param {Object} params
 * @returns {Object} Structured response matching the API schema
 */
function build({ aiMessage, classification, actionPlan, resources, emergency, tone, scenario, language }) {
    const response = {
        message: contentFilter.sanitize(aiMessage || ''),
        scenario: scenario || null,
        tone: tone || 'neutral_guidance',
        category: classification?.category || 'general',
        risk_level: classification?.risk_level || 'green',
        confidence: classification?.confidence || 0.5,
        language: language || 'en-IN',
        steps: (actionPlan?.steps || []).map(s => ({ title: '', description: s })),
        buttons: [...(actionPlan?.buttons || [])],
        resources: resources || [],
        emergency: false,
    };

    // Always inject helplines for yellow/red risk
    if (response.risk_level !== 'green') {
        const helplineButtons = helplines.getAsButtons();
        const existingNumbers = new Set(response.buttons.map((b) => b.number));
        for (const btn of helplineButtons) {
            if (!existingNumbers.has(btn.number)) {
                response.buttons.push(btn);
            }
        }
    }

    // Attach emergency data if present
    if (emergency) {
        response.emergency = true;
        const sosButton = { label: 'SOS — Call Police (100)', action: 'call', phone: '100', number: '100' };
        if (!response.buttons.some((b) => b.number === '100' && b.label.includes('SOS'))) {
            response.buttons.unshift(sosButton);
        }
    }

    return response;
}

module.exports = { build };
