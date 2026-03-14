const llmClient = require('./llmClient');
const { validateClassification } = require('./llmValidator');
const logger = require('../utils/logger');

// ── Keyword-based fallback classification ──────────────────────────
const RED_KEYWORDS = [
    // English
    'unsafe', 'kill', 'die', 'suicide', 'beat me', 'hitting me',
    'help me', 'emergency', 'trapped', 'kidnap', 'assault', 'rape',
    'molest', 'threaten', 'attacking', 'stabbing', 'choking',
    'i feel unsafe', 'going to hurt', 'save me',
    // Hindi
    'मार', 'पीट', 'जान से मार', 'बचाओ', 'मदद करो', 'आत्महत्या',
    'छुआ', 'बलात्कार', 'अगवा', 'धमकी', 'खतरा', 'मर जाना',
    'असुरक्षित', 'हमला',
    // Telugu
    'కొట్టు', 'చంపు', 'ఆత్మహత్య', 'రక్షించు', 'సహాయం', 'అత్యాచారం',
    'బెదిరించు', 'ప్రమాదం',
    // Rajasthani
    'मार खाई', 'बचावो', 'मदद करो', 'खतरो',
];

const YELLOW_KEYWORDS = [
    // English
    'scared', 'afraid', 'anxious', 'depressed', 'crying', 'lonely',
    'stressed', 'panic', 'worried', 'harass', 'uncomfortable',
    'nervous', 'hopeless', 'helpless', 'disturbed', 'upset',
    // Hindi
    'डर', 'डरी', 'डर लग', 'चिंता', 'तनाव', 'रो रही', 'अकेली',
    'परेशान', 'घबरा', 'उदास', 'दुखी', 'बेचैन', 'निराश',
    'भय', 'असहज', 'रो', 'हताश',
    // Telugu
    'భయం', 'ఆందోళన', 'ఒంటరి', 'బాధ', 'చింత', 'ఏడుస్తున్న',
    'నిరాశ', 'కలత',
    // Rajasthani  
    'डर लाग', 'घबरा', 'परेशान',
];

const CATEGORY_KEYWORDS = {
    domestic_violence: [
        'husband', 'partner', 'beating', 'abuse', 'domestic', 'slap', 'hit me', 'abusive',
        'पति', 'मारा', 'पीटा', 'घरेलू हिंसा', 'थप्पड़',
        'భర్త', 'కొట్టాడు', 'గృహ హింస',
    ],
    harassment: [
        'stalk', 'follow', 'touch', 'harass', 'catcall', 'grope', 'inappropriate', 'eve teas',
        'पीछा', 'छेड़', 'छेड़खानी', 'फॉलो कर रहा', 'घूर',
        'వెంటాడు', 'వేధింపు',
    ],
    health: [
        'period', 'pregnant', 'pain', 'bleeding', 'cramp', 'menstrual', 'pregnancy', 'health', 'body',
        'पीरियड', 'मासिक', 'गर्भ', 'दर्द', 'खून', 'स्वास्थ्य',
        'నెలసరి', 'గర్భం', 'నొప్పి', 'ఆరోగ్యం',
    ],
    mental_distress: [
        'depressed', 'anxiety', 'suicide', 'lonely', 'panic attack', 'mental', 'therapy', 'counsell',
        'उदास', 'अकेली', 'आत्महत्या', 'मानसिक', 'तनाव', 'चिंता',
        'నిరాశ', 'ఒంటరి', 'ఆత్మహత్య', 'మానసిక',
    ],
    relationship_issues: [
        'boyfriend', 'relationship', 'breakup', 'cheating', 'trust', 'toxic relationship',
        'रिश्ता', 'ब्रेकअप', 'धोखा', 'भरोसा',
        'సంబంధం', 'మోసం',
    ],
    education: [
        'what is', 'how to', 'tell me about', 'explain', 'learn', 'information', 'meaning of',
        'क्या है', 'कैसे', 'बताओ', 'जानकारी', 'समझाओ',
        'ఏమిటి', 'ఎలా', 'చెప్పు',
    ],
};

function keywordFallback(text) {
    const lower = text.toLowerCase();

    // Determine risk level
    let risk_level = 'green';
    if (RED_KEYWORDS.some((kw) => lower.includes(kw))) {
        risk_level = 'red';
    } else if (YELLOW_KEYWORDS.some((kw) => lower.includes(kw))) {
        risk_level = 'yellow';
    }

    // Determine category
    let category = 'general';
    let maxHits = 0;
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        const hits = keywords.filter((kw) => lower.includes(kw)).length;
        if (hits > maxHits) {
            maxHits = hits;
            category = cat;
        }
    }

    return {
        category,
        risk_level,
        confidence: risk_level === 'green' ? 0.5 : 0.7,
    };
}

// ── Main classifier ────────────────────────────────────────────────
async function classifySituation(text, context) {
    try {
        // Try LLM classification first
        const llmResult = await llmClient.classify(text, context);
        if (llmResult) {
            const validated = validateClassification(llmResult);
            if (validated) {
                logger.log('classification_result', 'system', { source: 'llm', ...validated });
                return validated;
            }
        }
    } catch (err) {
        logger.error('llm_error', 'system', err);
    }

    // Fallback to keyword-based classification
    const fallback = keywordFallback(text);
    logger.log('classification_result', 'system', { source: 'keyword_fallback', ...fallback });
    logger.log('llm_fallback', 'system', { reason: 'llm_unavailable_or_invalid' });
    return fallback;
}

module.exports = { classifySituation, keywordFallback };
