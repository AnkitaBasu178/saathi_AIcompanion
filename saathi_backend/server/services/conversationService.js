const Conversation = require('../models/Conversation');
const User = require('../models/User');
const contextManager = require('./contextManager');
const situationEngine = require('./situationEngine');
const riskEscalation = require('./riskEscalation');
const scenarioProtocols = require('./scenarioProtocols');
const actionPlanner = require('./actionPlanner');
const companionGuide = require('./companionGuide');
const responseBuilder = require('./responseBuilder');
const supportConnector = require('./supportConnector');
const emergencyService = require('./emergencyService');
const { getSafeResponse } = require('./fallbackResponses');
const config = require('../config');
const logger = require('../utils/logger');
const languageResolver = require('../utils/languageResolver');
const { detectLanguage } = require('../utils/languageDetector');

/**
 * Main message pipeline — exact order:
 *
 * Context Manager → Situation Engine → Risk Escalation →
 * Scenario Protocol Engine → Action Planner → Companion Guide →
 * Support Connector → Response Builder → Content Filter → Response
 *
 * Emergency scenarios (DOMESTIC_VIOLENCE, FOLLOWED_IN_PUBLIC)
 * bypass Action Planner.
 */
async function processMessage(sessionId, message, location, language) {
    // Language priority: explicit from client > auto-detected from text > default
    const resolvedLang = language || detectLanguage(message) || 'en-IN';
    const lang = languageResolver.resolve(resolvedLang);
    logger.log('chat_received', sessionId, { messageLength: message.length, language: lang.code, explicitLang: !!language });

    try {
        // ── Stage 1: Conversation Context ────────────────────────────
        const { summary, recentMessages, conversation } = await contextManager.getContext(sessionId);
        const promptContext = conversation
            ? contextManager.buildPromptContext(conversation)
            : 'No prior context.';

        // ── Stage 2: Situation Classification ─────────────────────────
        const classification = await situationEngine.analyze(message, promptContext, sessionId);

        // ── Stage 3: Risk Escalation ─────────────────────────────────
        // Now accepts rawMessage for suicide keyword detection
        const escalated = riskEscalation.evaluate(classification, conversation, sessionId, message);

        // ── Stage 4: Scenario Protocol Engine ─────────────────────────
        const scenario = scenarioProtocols.detect(escalated, message, {
            demoMode: config.demoMode,
        });

        // ── Determine pipeline path ──────────────────────────────────
        let actionPlan;
        let companionMessage;
        let tone;
        let emergency = null;
        let scenarioId = null;

        if (scenario) {
            scenarioId = scenario.scenario;

            if (scenario.requires_emergency) {
                companionMessage = scenario.companion_message;
                tone = scenario.tone;
                actionPlan = { steps: scenario.steps, buttons: scenario.buttons };
                emergency = await emergencyService.triggerSOS(sessionId, location);

                // Translate emergency companion message for non-English languages
                if (lang.code !== 'en-IN') {
                    try {
                        const translated = await companionGuide.generateMessage({
                            category: scenario.classification?.category || 'general',
                            risk_level: scenario.classification?.risk_level || 'red',
                            steps: scenario.steps,
                            context_summary: companionMessage,
                            userMessage: message,
                            language: lang.code,
                        });
                        companionMessage = translated.companionMessage;
                    } catch (e) {
                        logger.error('translation_fallback', sessionId, e);
                    }
                }

                logger.log('scenario_priority', sessionId, {
                    scenario: scenarioId,
                    path: 'emergency_bypass',
                    priority: scenario.priority,
                });
            } else {
                actionPlan = { steps: scenario.steps, buttons: scenario.buttons };
                companionMessage = scenario.companion_message;
                tone = scenario.tone;

                // Translate scenario companion message for non-English languages
                if (lang.code !== 'en-IN') {
                    try {
                        const translated = await companionGuide.generateMessage({
                            category: scenario.classification?.category || 'general',
                            risk_level: scenario.classification?.risk_level || 'green',
                            steps: scenario.steps,
                            context_summary: companionMessage,
                            userMessage: message,
                            language: lang.code,
                        });
                        companionMessage = translated.companionMessage;
                    } catch (e) {
                        logger.error('translation_fallback', sessionId, e);
                    }
                }

                logger.log('scenario_priority', sessionId, {
                    scenario: scenarioId,
                    path: 'deterministic',
                    priority: scenario.priority,
                });
            }
        } else {
            // ── Stage 5: Action Planner ────────────────────────────────
            actionPlan = actionPlanner.generatePlan(escalated.category, escalated.risk_level);

            // ── Stage 6: Companion Guide ───────────────────────────────
            const companion = await companionGuide.generateMessage({
                category: escalated.category,
                risk_level: escalated.risk_level,
                steps: actionPlan.steps,
                context_summary: promptContext,
                userMessage: message,
                language: lang.code,
            });

            companionMessage = companion.companionMessage;
            tone = companion.tone;

            logger.log('companion_response_generated', sessionId, {
                category: escalated.category,
                risk_level: escalated.risk_level,
                tone,
            });

            // Trigger emergency for non-scenario red risk
            if (escalated.risk_level === 'red') {
                emergency = await emergencyService.triggerSOS(sessionId, location);
            }
        }

        // ── Stage 7: Support Connector ───────────────────────────────
        let resources = [];
        if (location?.lat && location?.lon) {
            await User.findOneAndUpdate(
                { sessionId },
                { lastLocation: { lat: location.lat, lon: location.lon, timestamp: new Date() } }
            );
            resources = await supportConnector.findNearbySupport(location.lat, location.lon, null, 10);
        }

        // ── Stage 8: Response Builder (includes Content Filter) ──────
        // Inject suicide helpline button if suicide override was triggered
        if (escalated.suicide_override && escalated.suicide_helpline) {
            if (!actionPlan.buttons) actionPlan.buttons = [];
            actionPlan.buttons.unshift(escalated.suicide_helpline);
        }

        // ── Translate steps for non-English languages (when LLM is unavailable) ──
        if (lang.code !== 'en-IN' && actionPlan?.steps?.length > 0) {
            actionPlan.steps = translateSteps(actionPlan.steps, lang.code);
        }

        const response = responseBuilder.build({
            aiMessage: companionMessage,
            classification: escalated,
            actionPlan,
            resources,
            emergency,
            tone,
            scenario: scenarioId,
            language: lang.code,
        });

        // ── Store & Manage Context ───────────────────────────────────
        await storeMessages(sessionId, message, response);

        return response;
    } catch (err) {
        logger.error('server_error', sessionId, err);
        return getSafeResponse(message, null, lang?.code || resolvedLang || 'en-IN');
    }
}

async function storeMessages(sessionId, userMessage, response) {
    try {
        let conversation = await Conversation.findOne({ sessionId }).sort({ updatedAt: -1 });

        if (!conversation) {
            conversation = new Conversation({
                sessionId,
                messages: [],
                category: response.category || 'general',
                riskLevel: response.risk_level || 'green',
            });
        }

        conversation.messages.push(
            { role: 'user', content: userMessage, timestamp: new Date() },
            { role: 'assistant', content: response.message, timestamp: new Date() }
        );

        conversation.category = response.category || conversation.category;
        conversation.riskLevel = response.risk_level || conversation.riskLevel;

        await conversation.save();

        // Manage context (summarize if needed)
        await contextManager.manageContext(conversation);
    } catch (err) {
        logger.error('server_error', sessionId, err);
    }
}

async function getHistory(sessionId) {
    const conversation = await Conversation.findOne({ sessionId }).sort({ updatedAt: -1 });
    if (!conversation) return { messages: [], summary: '' };

    return {
        messages: conversation.messages,
        summary: conversation.summary,
        category: conversation.category,
        riskLevel: conversation.riskLevel,
    };
}

// ── Step translation for non-English languages ─────────────────────
const STEP_TRANSLATIONS = {
    'hi-IN': {
        'Call Women Helpline 181 immediately': 'तुरंत महिला हेल्पलाइन 181 पर कॉल करें',
        'Call Police (100)': 'पुलिस (100) को कॉल करें',
        'Contact your most trusted person right now': 'अभी अपने सबसे भरोसेमंद व्यक्ति से संपर्क करें',
        'Move to a safe location': 'सुरक्षित स्थान पर जाएँ',
        'Do NOT confront the abuser': 'हमलावर का सामना न करें — आपकी सुरक्षा सबसे पहले है',
        'Document what is happening': 'जो हो रहा है उसे लिख कर रखें — तारीख, समय और विवरण',
        'Keep important documents': 'ज़रूरी कागज़ात (ID, बैंक डिटेल्स) सुरक्षित जगह रखें',
        'Know your nearest shelter': 'अपने नज़दीकी शेल्टर या सुरक्षित स्थान को जानें',
        'I am here to help': 'मैं आपकी मदद के लिए यहाँ हूँ',
        'Feel free to ask any questions': 'कोई भी सवाल पूछने में संकोच न करें',
        'Your safety is the top priority right now': 'अभी आपकी सुरक्षा सबसे ज़रूरी है',
        'Alert someone you trust about your situation': 'अपनी स्थिति के बारे में किसी भरोसेमंद व्यक्ति को बताएँ',
        'Consider speaking with a professional': 'किसी पेशेवर से बात करने पर विचार करें',
    },
    'te-IN': {
        'Call Women Helpline 181 immediately': 'వెంటనే మహిళా హెల్ప్‌లైన్ 181కి కాల్ చేయండి',
        'Call Police (100)': 'పోలీసులకు (100) కాల్ చేయండి',
        'Move to a safe location': 'సురక్షితమైన ప్రదేశానికి వెళ్ళండి',
        'I am here to help': 'నేను మీకు సహాయం చేయడానికి ఇక్కడ ఉన్నాను',
        'Feel free to ask any questions': 'ఏదైనా ప్రశ్నలు అడగడానికి సంకోచించకండి',
    },
};

function translateSteps(steps, langCode) {
    const translations = STEP_TRANSLATIONS[langCode];
    if (!translations) return steps;

    return steps.map(step => {
        // Try exact match first
        if (translations[step]) return translations[step];
        // Try partial match — if any translation key is found within the step
        for (const [eng, translated] of Object.entries(translations)) {
            if (step.toLowerCase().includes(eng.toLowerCase())) {
                return translated;
            }
        }
        return step; // Keep original if no translation found
    });
}

module.exports = { processMessage, getHistory };
