const logger = require('../utils/logger');
const { normalizeText, containsKeyword } = require('../utils/textNormalizer');

const RISK_RANK = { green: 0, yellow: 1, red: 2 };

// ── Suicide / Self-Harm Keywords ───────────────────────────────────
const SUICIDE_PHRASES = [
    'kill myself',
    'suicide',
    'end my life',
    'dont want to live',
    'want to die',
    'cant go on',
    'better off dead',
    'no reason to live',
    'wish i was dead',
    'want to end it',
    'self harm',
    'hurt myself',
];

const SUICIDE_HELPLINE_BUTTON = {
    label: 'Call iCall Crisis Line (9152987821)',
    action: 'call',
    number: '9152987821',
};

// ── Health-education categories that should NOT escalate from yellow ──
const EDUCATIONAL_KEYWORDS = [
    'period', 'menstrual', 'menstruation', 'puberty', 'contraception',
    'pregnancy test', 'health information', 'what is', 'how to',
    'explain', 'teach me', 'learn about',
];

/**
 * Evaluate risk with three override rules:
 * 1. Suicide keyword override → force red + mental_distress
 * 2. Never downgrade risk within a session
 * 3. 3 consecutive yellow user messages → escalate to red (except educational)
 *
 * @param {Object} newClassification - { category, risk_level, confidence }
 * @param {Object} conversation - Mongoose conversation doc (or null)
 * @param {string} sessionId
 * @param {string} rawMessage - original user message
 * @returns {Object} - mutated classification with escalated risk
 */
function evaluate(newClassification, conversation, sessionId, rawMessage) {
    const originalCategory = newClassification.category;
    const originalRisk = newClassification.risk_level;
    const currentRisk = conversation ? conversation.riskLevel : 'green';

    // ── Rule 0: Suicide Keyword Override ───────────────────────────
    if (rawMessage) {
        const { normalizedText } = normalizeText(rawMessage);
        const suicideDetected = SUICIDE_PHRASES.some((phrase) =>
            containsKeyword(normalizedText, phrase)
        );

        if (suicideDetected) {
            newClassification.category = 'mental_distress';
            newClassification.risk_level = 'red';
            newClassification.suicide_override = true;
            newClassification.suicide_helpline = SUICIDE_HELPLINE_BUTTON;

            logger.log('suicide_override_triggered', sessionId, {
                original_category: originalCategory,
                original_risk: originalRisk,
                overridden_to: 'red',
            });

            return newClassification;
        }
    }

    // ── Rule 1: Never downgrade risk within a session ──────────────
    if (RISK_RANK[newClassification.risk_level] < RISK_RANK[currentRisk]) {
        newClassification.risk_level = currentRisk;
    }

    // ── Rule 2: 3 consecutive yellow user messages → red ───────────
    if (
        conversation &&
        conversation.messages &&
        newClassification.risk_level === 'yellow'
    ) {
        // Check if this is an educational/informational question
        const { normalizedText } = normalizeText(rawMessage || '');
        const isEducational = EDUCATIONAL_KEYWORDS.some((kw) =>
            containsKeyword(normalizedText, kw)
        );

        if (!isEducational) {
            // Count recent consecutive user messages during yellow-risk conversation
            const userMessages = conversation.messages.filter((m) => m.role === 'user');
            const recentUserMessages = userMessages.slice(-2); // last 2 stored + current = 3

            // If conversation was already at yellow and we have 2+ stored yellow-era user messages
            if (currentRisk === 'yellow' && recentUserMessages.length >= 2) {
                newClassification.risk_level = 'red';
            }
        }
    }

    // ── Log escalation ─────────────────────────────────────────────
    if (newClassification.risk_level !== originalRisk) {
        let reason = 'no_downgrade_policy';
        if (newClassification.risk_level === 'red' && originalRisk === 'yellow') {
            reason = 'consecutive_yellow_escalation';
        }

        logger.log('risk_escalated', sessionId, {
            from: originalRisk,
            to: newClassification.risk_level,
            reason,
        });
    }

    return newClassification;
}

module.exports = { evaluate, SUICIDE_PHRASES, SUICIDE_HELPLINE_BUTTON };
