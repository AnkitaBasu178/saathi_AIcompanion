const logger = require('../utils/logger');
const { normalizeText, containsKeyword } = require('../utils/textNormalizer');

// ── 6 Deterministic Scenario Protocols ─────────────────────────────
// Sorted by priority (1 = highest). Detection stops on first match.

const SCENARIOS = [
    {
        id: 'FOLLOWED_IN_PUBLIC',
        label: 'Being Followed / Stalked',
        priority: 1,
        triggerKeywords: [
            // English
            'following me', 'following', 'stalking', 'someone watching', 'being followed', 'someone outside', 'creep following', 'watched me',
            // Hindi
            'पीछा कर रहा', 'कोई पीछे', 'कोई देख रहा', 'स्टॉकिंग', 'पीछा', 'कोई बाहर खड़ा',
            // Telugu
            'నన్ను వెంబడిస్తున్నారు', 'ఎవరో చూస్తున్నారు', 'వెంబడించడం', 'వెంటపడుతున్నారు',
            // Rajasthani
            'पाछो लाग रह्यो', 'कोई पाछो', 'कोई देख रह्यो',
        ],
        category: 'harassment',
        riskLevel: 'red',
        emergency: true,
        steps: [
            'Move toward a public place with people around immediately.',
            'Avoid isolated areas, dark streets, or lonely paths.',
            'Keep your phone ready to call for help — 100 (Police) or 181 (Women Helpline).',
            'If possible, enter a shop, restaurant, or any public building.',
            'Alert people around you if you feel in immediate danger.',
        ],
        buttons: [
            { label: 'SOS Emergency', action: 'call', phone: '100', number: '100' },
            { label: 'Call Women Helpline (181)', action: 'call', phone: '181', number: '181' },
            { label: 'Find Nearest Police Station', action: 'search_support', type: 'police_station' },
        ],
        companionTemplate: {
            validation: 'I hear you, and I want you to know that what you\'re feeling is completely valid. Being followed is frightening, and you\'re right to take it seriously.',
            understanding: 'Your safety is the most important thing right now. You are doing the right thing by reaching out.',
            support: 'If you\'d like, I can help you find the nearest police station or connect you with the Women Helpline (181). You don\'t have to handle this alone.',
        },
        tone: 'calm_urgent',
    },
    {
        id: 'DOMESTIC_VIOLENCE',
        label: 'Domestic Violence',
        priority: 1,
        triggerKeywords: [
            // English
            'beats me', 'hit me', 'hits me', 'abusive husband', 'abusive partner', 'domestic violence', 'husband beats', 'husband hits', 'violent home', 'abusive',
            // Hindi
            'पति मारता', 'मारता है', 'पीटता है', 'घरेलू हिंसा', 'हिंसा', 'मार पीट', 'मारपीट', 'पति ने मारा',
            // Telugu
            'భర్త కొడతాడు', 'కొడతాడు', 'హింస', 'గృహ హింస', 'కొట్టాడు',
            // Rajasthani
            'मार रह्यो', 'पीट रह्यो', 'घर में मारपीट',
        ],
        category: 'domestic_violence',
        riskLevel: 'red',
        emergency: true,
        steps: [
            'Move to a safer place if possible — a trusted neighbour, family member, or safe room.',
            'Contact someone you trust immediately and let them know your situation.',
            'Write down what happened and when — dates, times, and any details you remember.',
            'Keep important documents (ID, bank details) in an accessible place.',
            'Do not confront the abuser — your safety comes first.',
        ],
        buttons: [
            { label: 'Call Women Helpline (181)', action: 'call', phone: '181', number: '181' },
            { label: 'Call Police (100)', action: 'call', phone: '100', number: '100' },
            { label: 'Find Support NGO', action: 'search_support', type: 'ngo' },
            { label: 'Find Safe Shelter', action: 'search_support', type: 'shelter' },
        ],
        companionTemplate: {
            validation: 'I\'m so sorry you\'re going through this. You don\'t deserve this, and none of this is your fault. It takes incredible courage to reach out, and I\'m glad you did.',
            understanding: 'Your safety matters above everything right now. What you\'re experiencing is not acceptable, and you have every right to seek help.',
            support: 'I can help you find nearby shelters, NGOs, or police stations whenever you\'re ready. You\'re not alone in this.',
        },
        tone: 'calm_urgent',
    },
    {
        id: 'MINOR_PREGNANCY',
        label: 'Minor Pregnancy Concern',
        priority: 2,
        triggerKeywords: [
            // English
            'pregnant', 'might be pregnant', 'missed period', 'pregnancy test', 'expecting',
            // Hindi
            'गर्भवती', 'प्रेग्नेंट', 'पीरियड नहीं आया', 'पीरियड मिस',
            // Telugu
            'గర్భవతి', 'ప్రెగ్నెంట్', 'పీరియడ్ రాలేదు',
            // Rajasthani
            'पेट सूँ', 'पीरियड कोनी आयो',
        ],
        category: 'health',
        riskLevel: 'yellow',
        emergency: false,
        requiresAgeHint: true,
        ageKeywords: ['16', '15', '14', '13', '12', 'under 18', 'minor', 'teenager', 'teen', 'young', 'school girl', 'साल', 'उम्र', 'छोटी', 'బడి'],
        steps: [
            'Confirm the pregnancy with a test or by visiting a doctor.',
            'Speak with a trusted adult — a parent, guardian, or school counsellor.',
            'Consult a healthcare professional who can explain your options safely.',
            'Remember that your health and wellbeing come first.',
        ],
        buttons: [
            { label: 'Find Nearby Clinic', action: 'search_support', type: 'hospital' },
            { label: 'Talk to Counsellor', action: 'search_support', type: 'counsellor' },
            { label: 'Learn About Reproductive Health', action: 'education', topic: 'early_pregnancy_signs' },
        ],
        companionTemplate: {
            validation: 'I\'m really glad you reached out. Feeling scared or uncertain in a situation like this is completely understandable, and you\'re doing the right thing by seeking information.',
            understanding: 'If you think you might be pregnant, the first step is confirming it. Because you\'re under 18, having the support of a trusted adult or healthcare professional is especially important.',
            support: 'If you\'d like, I can help you find nearby clinics or confidential support services. You are not alone in this. It\'s okay to take this one step at a time.',
        },
        tone: 'gentle_supportive',
    },
    {
        id: 'COLLEGE_HARASSMENT',
        label: 'College / Online Harassment',
        priority: 3,
        triggerKeywords: [
            // English
            'harassment', 'harassed', 'harassing', 'college harassment', 'campus harassment', 'online harassment', 'message harassment', 'classmate', 'senior harassing',
            // Hindi
            'परेशान कर रहा', 'छेड़छाड़', 'छेड़ रहा', 'ऑनलाइन परेशान', 'कॉलेज में परेशान', 'सीनियर परेशान',
            // Telugu
            'వేధిస్తున్నారు', 'వేధింపు', 'ఆన్‌లైన్ వేధింపు', 'కాలేజీలో వేధింపు',
            // Rajasthani
            'तंग कर रह्यो', 'छेड़ रह्यो', 'परेशान कर रह्यो',
        ],
        category: 'harassment',
        riskLevel: 'yellow',
        emergency: false,
        steps: [
            'Save the messages or interactions as evidence.',
            'Write down when the messages or incidents started.',
            'Block the person if you feel uncomfortable.',
            'Consider reporting the behavior to college authorities or the Internal Complaints Committee.',
            'You can also file a complaint with the police if needed.',
        ],
        buttons: [
            { label: 'Report Harassment Guide', action: 'education', topic: 'reporting_harassment' },
            { label: 'Find Support Organisation', action: 'search_support', type: 'ngo' },
            { label: 'Call NCW (7827170170)', action: 'call', phone: '7827170170', number: '7827170170' },
        ],
        companionTemplate: {
            validation: 'You deserve to feel safe and respected — at college, online, and everywhere. What you\'re experiencing is not okay, and it is not your fault.',
            understanding: 'Being harassed can feel overwhelming and isolating. Please know that you have every right to feel safe and to take action.',
            support: 'I\'m here to help you take the next steps at your own pace. We can look at nearby support services or helplines together.',
        },
        tone: 'gentle_supportive',
    },
    {
        id: 'EMOTIONAL_DISTRESS',
        label: 'Emotional Distress / Depression',
        priority: 3,
        triggerKeywords: [
            // English
            'depressed', 'depression', 'feeling low', 'anxious', 'anxiety', 'cant sleep', 'worthless', 'hopeless', 'lonely', 'nobody cares', 'feel useless', 'useless',
            // Hindi
            'डिप्रेशन', 'उदास', 'अकेलापन', 'चिंता', 'नींद नहीं', 'बेकार', 'निराशा', 'कोई परवाह नहीं', 'अकेली',
            'डर लग रहा', 'डर', 'घबराहट', 'डर लगता', 'बहुत डर',
            // Telugu
            'భయం', 'కుంగిపోతున్నాను', 'దిగులు', 'ఒంటరిగా', 'నిరాశ', 'నిద్ర రాదు', 'భయం గా ఉంది',
            // Rajasthani
            'घणो डर', 'डर लाग रह्यो', 'अकेलापण', 'उदास', 'कोनी सोवाई', 'निराशा',
        ],
        category: 'mental_distress',
        riskLevel: 'yellow',
        emergency: false,
        steps: [
            'Take a few slow, deep breaths and give yourself a moment.',
            'Try the grounding technique: name 5 things you see, 4 you touch, 3 you hear.',
            'Consider speaking with someone you trust about how you feel.',
            'A professional counsellor can help you work through these feelings safely.',
            'Remember — asking for help is a sign of courage, not weakness.',
        ],
        buttons: [
            { label: 'Talk to Counsellor', action: 'search_support', type: 'counsellor' },
            { label: 'Call iCall (9152987821)', action: 'call', phone: '9152987821', number: '9152987821' },
            { label: 'Find Mental Health Support', action: 'search_support', type: 'counsellor' },
        ],
        companionTemplate: {
            validation: 'I\'m really glad you shared this with me. What you\'re feeling is real and valid, and it takes real strength to reach out.',
            understanding: 'You don\'t have to go through this alone, and there\'s no shame in asking for help. What you\'re experiencing is more common than you think.',
            support: 'Would you like me to help you find a counsellor or mental health helpline? The iCall helpline at 9152987821 is available 8 AM-10 PM.',
        },
        tone: 'gentle_supportive',
    },
    {
        id: 'PERIOD_FIRST_TIME',
        label: 'First Period / Puberty',
        priority: 4,
        triggerKeywords: [
            // English
            'first period', 'period', 'menstruation', 'started bleeding', 'puberty', 'menstrual', 'bleeding down there',
            // Hindi
            'पीरियड', 'मासिक धर्म', 'पहला पीरियड', 'खून आ रहा', 'ब्लीडिंग',
            // Telugu
            'నెలసరి', 'పీరియడ్', 'రక్తస్రావం', 'మొదటి పీరియడ్',
            // Rajasthani
            'पीरियड', 'महीनो', 'खून आ रह्यो',
        ],
        category: 'health',
        riskLevel: 'green',
        emergency: false,
        steps: [
            'Use a sanitary pad or menstrual product.',
            'Change it every 4–6 hours.',
            'Keep good hygiene and wash regularly.',
            'Drink water and rest if you feel tired.',
            'If pain is severe, a warm water bottle on your abdomen can help.',
        ],
        buttons: [
            { label: 'Learn About Puberty', action: 'education', topic: 'menstrual_cycle' },
            { label: 'Menstrual Health Guide', action: 'education', topic: 'menstrual_hygiene' },
        ],
        companionTemplate: {
            validation: 'It\'s completely normal to feel confused the first time. Periods are a natural part of growing up and many girls experience the same feelings.',
            understanding: 'Your body is going through changes, and it\'s okay to have questions. There is nothing to be embarrassed about.',
            support: 'If you want to learn more about your body or have more questions, I\'m here for you anytime.',
        },
        tone: 'warm_informative',
    },
];

// ── Build O(1) keyword-to-scenario lookup map ──────────────────────
// Flattens all triggerKeywords into a map for constant-time demo lookup.
const KEYWORD_MAP = {};
for (const scenario of SCENARIOS) {
    for (const keyword of scenario.triggerKeywords) {
        // First match wins (higher priority scenarios are first in array)
        if (!KEYWORD_MAP[keyword]) {
            KEYWORD_MAP[keyword] = scenario.id;
        }
    }
}

// ── Scenario lookup by ID ──────────────────────────────────────────
const SCENARIO_BY_ID = {};
for (const scenario of SCENARIOS) {
    SCENARIO_BY_ID[scenario.id] = scenario;
}

// ── Detection (priority-sorted, first match wins) ──────────────────

/**
 * Detect if a scenario protocol applies.
 * @param {Object} classification - { category, risk_level, confidence }
 * @param {string} message - raw user message
 * @param {Object} options - { demoMode: boolean }
 * @returns {Object|null} - scenario result or null
 */
function detect(classification, message, options = {}) {
    const { normalizedText, tokens } = normalizeText(message || '');

    // ── Demo mode: keyword map lookup (O(1) per keyword) ───────────
    if (options.demoMode) {
        // Check multi-word phrases first (longer = more specific)
        const sortedKeywords = Object.keys(KEYWORD_MAP).sort((a, b) => b.length - a.length);
        for (const keyword of sortedKeywords) {
            if (containsKeyword(normalizedText, keyword)) {
                const scenario = SCENARIO_BY_ID[KEYWORD_MAP[keyword]];
                if (scenario) {
                    // For MINOR_PREGNANCY, also check age hint even in demo
                    if (scenario.requiresAgeHint) {
                        const hasAge = scenario.ageKeywords.some((ak) => containsKeyword(normalizedText, ak));
                        if (!hasAge) continue;
                    }

                    logger.log('scenario_detected', 'system', {
                        scenario: scenario.id,
                        priority: scenario.priority,
                        trigger: 'demo_keyword',
                        keyword,
                    });
                    return buildResult(scenario, classification);
                }
            }
        }
    }

    // ── Live mode: priority-sorted rule matching ────────────────────
    for (const scenario of SCENARIOS) {
        const keywordMatch = scenario.triggerKeywords.some((kw) =>
            containsKeyword(normalizedText, kw)
        );

        if (!keywordMatch) continue;

        // Extra condition: age hint required (MINOR_PREGNANCY)
        if (scenario.requiresAgeHint) {
            const hasAge = scenario.ageKeywords.some((ak) =>
                containsKeyword(normalizedText, ak)
            );
            if (!hasAge) continue;
        }

        logger.log('scenario_detected', 'system', {
            scenario: scenario.id,
            priority: scenario.priority,
            trigger: 'detection_rule',
        });

        return buildResult(scenario, classification);
    }

    return null;
}

/**
 * Build the scenario result object.
 */
function buildResult(scenario, classification) {
    return {
        scenario: scenario.id,
        companion_message: formatCompanionMessage(scenario),
        steps: [...scenario.steps],
        buttons: [...scenario.buttons],
        tone: scenario.tone,
        requires_emergency: scenario.emergency,
        priority: scenario.priority,
        classification: {
            ...(classification || {}),
            category: scenario.category,
            risk_level: scenario.riskLevel,
            scenario_driven: true,
            scenario_id: scenario.id,
        },
    };
}

/**
 * Format companion message from the protocol's 4-part template.
 */
function formatCompanionMessage(scenario) {
    const t = scenario.companionTemplate;
    const parts = [t.validation, t.understanding];

    // Add guidance steps
    const stepsFormatted = scenario.steps.map((s) => `• ${s}`).join('\n');
    parts.push(`Here are some steps that could help:\n\n${stepsFormatted}`);

    parts.push(t.support);

    return parts.join('\n\n');
}

function getScenario(id) {
    return SCENARIO_BY_ID[id] || null;
}

function listScenarios() {
    return SCENARIOS.map((s) => ({
        id: s.id,
        label: s.label,
        priority: s.priority,
        category: s.category,
        riskLevel: s.riskLevel,
        emergency: s.emergency,
        tone: s.tone,
    }));
}

module.exports = { detect, getScenario, listScenarios, SCENARIOS, KEYWORD_MAP, SCENARIO_BY_ID };
