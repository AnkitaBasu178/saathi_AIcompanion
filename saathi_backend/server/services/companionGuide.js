const llmClient = require('../ai/llmClient');
const { COMPANION_PROMPT, fillTemplate } = require('../ai/prompts');
const { sanitizeResponse } = require('../middleware/aiGuardrails');
const logger = require('../utils/logger');
const languageResolver = require('../utils/languageResolver');

// ── Forbidden companion language patterns ──────────────────────────
const FORBIDDEN_PATTERNS = [
    'you should have',
    'this is your fault',
    'you must report immediately',
    'you must report',
    'you did something wrong',
    'why did you',
    'you need to leave right now',
    'you have to leave immediately',
    'it\'s your responsibility',
    'it\'s your mistake',
    'you caused this',
    'you brought this',
];

const REPLACEMENTS = {
    'you should have': 'It\'s understandable to feel this way',
    'this is your fault': 'This is not your fault',
    'you must report immediately': 'When you feel ready, reporting is an option available to you',
    'you must report': 'When you feel ready, reporting is an option available to you',
    'you did something wrong': 'You are not to blame for this',
    'why did you': 'I understand this is difficult',
    'you need to leave right now': 'When you feel safe, consider moving to a safer place',
    'you have to leave immediately': 'When you feel safe, consider moving to a safer place',
    'it\'s your responsibility': 'You have options available to you',
    'it\'s your mistake': 'This is not your fault',
    'you caused this': 'This is not your fault',
    'you brought this': 'This is not your fault',
};

// ── Emotional validation templates per category ────────────────────
const VALIDATION_TEMPLATES = {
    domestic_violence: {
        validation: 'I\'m really glad you reached out. What you\'re going through takes immense courage to talk about, and I want you to know — this is not your fault.',
        understanding: 'Living in a situation where you feel unsafe at home is incredibly difficult. Your feelings are completely valid.',
        support_offer: 'You don\'t have to face this alone. I can help you find nearby shelters, NGOs, or connect you with the Women Helpline (181) whenever you\'re ready.',
    },
    harassment: {
        validation: 'Thank you for trusting me with this. What you\'re experiencing is not okay, and you are brave for speaking up.',
        understanding: 'Being harassed can feel overwhelming and isolating. Please know that you have every right to feel safe.',
        support_offer: 'I\'m here to help you take the next steps at your own pace. We can look at nearby support services or helplines together.',
    },
    mental_distress: {
        validation: 'I\'m here with you, and I\'m really glad you shared this. It takes strength to reach out when you\'re feeling this way.',
        understanding: 'What you\'re feeling is real and valid. You don\'t have to go through this alone, and there\'s no shame in asking for help.',
        support_offer: 'Would you like me to help you find a counsellor or mental health helpline? You can call iCall at 9152987821 anytime between 8 AM-10 PM.',
    },
    health: {
        validation: 'I\'m glad you\'re reaching out about this. Taking care of your health is so important, and asking questions is a great first step.',
        understanding: 'Health concerns can feel worrying, especially when you\'re not sure what\'s happening. That\'s completely normal.',
        support_offer: 'I can share some helpful information and also help you find a healthcare professional nearby if you\'d like.',
    },
    relationship_issues: {
        validation: 'Thank you for opening up about this. Relationships can be really complicated, and it\'s okay to feel confused or hurt.',
        understanding: 'What you\'re going through sounds emotionally challenging. Your feelings matter, and you deserve to be treated with respect.',
        support_offer: 'If you\'d like to talk to a professional counsellor about this, I can help you find one nearby.',
    },
    education: {
        validation: 'That\'s a wonderful question! I\'m happy to help you learn about this.',
        understanding: 'Understanding your body and your rights is empowering. There\'s no such thing as a silly question.',
        support_offer: 'If you want to explore this topic further or have more questions, I\'m here for you.',
    },
    general: {
        validation: 'I\'m here for you, and I\'m glad you reached out.',
        understanding: 'I hear you. Whatever you\'re going through, your feelings are valid.',
        support_offer: 'I\'m here to help in any way I can. If you\'d like to talk more or need specific support, just let me know.',
    },
};

// ── Multilingual fallback templates (when LLM is unavailable) ──────
// Keyed by language → category, so responses are contextual AND in the right language
const MULTILINGUAL_FALLBACK = {
    'hi-IN': {
        domestic_violence: {
            validation: 'आपने बात की, ये बहुत हिम्मत की बात है। मैं आपके साथ हूँ — ये आपकी गलती नहीं है।',
            understanding: 'घर में असुरक्षित महसूस करना बहुत कठिन है। आपकी भावनाएँ पूरी तरह सही हैं।',
            support_offer: 'आपको अकेले नहीं लड़ना है। मैं आपको नज़दीकी शेल्टर, NGO या महिला हेल्पलाइन (181) से जोड़ सकती हूँ।',
        },
        harassment: {
            validation: 'आपने मुझ पर भरोसा किया, शुक्रिया। जो हो रहा है वो ठीक नहीं है, और आप बोलने में बहादुर हैं।',
            understanding: 'छेड़खानी या परेशानी बहुत तकलीफदेह हो सकती है। आपको सुरक्षित महसूस करने का पूरा अधिकार है।',
            support_offer: 'मैं आपकी मदद के लिए यहाँ हूँ। हम साथ मिलकर हेल्पलाइन या सहायता सेवाएँ खोज सकते हैं।',
        },
        mental_distress: {
            validation: 'मैं आपके साथ हूँ। ऐसा महसूस होने पर बात करना बहुत ताक़तवर कदम है।',
            understanding: 'आप जो महसूस कर रही हैं वो असली है और ज़रूरी है। मदद माँगने में कोई शर्म नहीं है।',
            support_offer: 'क्या आप किसी काउंसलर से बात करना चाहेंगी? आप iCall हेल्पलाइन 9152987821 पर कॉल कर सकती हैं।',
        },
        health: {
            validation: 'अपनी सेहत के बारे में पूछना बहुत अच्छा कदम है। मैं आपकी मदद के लिए यहाँ हूँ।',
            understanding: 'स्वास्थ्य संबंधी चिंताएँ होना स्वाभाविक है। आप सही जगह पर हैं।',
            support_offer: 'मैं आपको जानकारी दे सकती हूँ और नज़दीकी डॉक्टर या अस्पताल खोजने में भी मदद कर सकती हूँ।',
        },
        general: {
            validation: 'मैं आपके साथ हूँ, और मुझे खुशी है कि आपने बात की।',
            understanding: 'मैं समझती हूँ। आप जो भी महसूस कर रही हैं, वो बिल्कुल सही है।',
            support_offer: 'मैं हर तरह से आपकी मदद करने के लिए यहाँ हूँ। बस बताइए कि मैं क्या कर सकती हूँ।',
        },
    },
    'te-IN': {
        domestic_violence: {
            validation: 'మీరు చెప్పారు, ఇది చాలా ధైర్యమైన పని. నేను మీతో ఉన్నాను — ఇది మీ తప్పు కాదు.',
            understanding: 'ఇంట్లో అసురక్షితంగా ఉండటం చాలా కష్టం. మీ భావాలు పూర్తిగా సరైనవి.',
            support_offer: 'మీరు ఒంటరిగా పోరాడాల్సిన అవసరం లేదు. నేను మీకు షెల్టర్, NGO లేదా మహిళా హెల్ప్‌లైన్ (181) తో అనుసంధానం చేయగలను.',
        },
        general: {
            validation: 'నేను మీతో ఉన్నాను, మీరు మాట్లాడినందుకు సంతోషంగా ఉంది.',
            understanding: 'నేను అర్థం చేసుకుంటున్నాను. మీరు ఏమి అనుభవిస్తున్నారో అది ముఖ్యమైనది.',
            support_offer: 'నేను మీకు సహాయం చేయడానికి ఇక్కడ ఉన్నాను. ఏదైనా కావాలంటే చెప్పండి.',
        },
    },
    'raj-IN': {
        general: {
            validation: 'मैं थांरे साथ हूँ, अर मन्ने घणी खुशी है कि थांने बात करी।',
            understanding: 'मैं समझूँ हूँ। थां जो भी महसूस कर रह्या हो, वो बिलकुल सही है।',
            support_offer: 'मैं हर तरह सूं थांरी मदद करण खातर अठै हूँ। बस बता दीज्यो।',
        },
    },
};

// Helper: get best fallback template for language + category
function getMultilingualTemplate(language, category) {
    const langTemplates = MULTILINGUAL_FALLBACK[language];
    if (!langTemplates) return null;
    return langTemplates[category] || langTemplates.general || null;
}

// ── Core companion message generator ───────────────────────────────
// No scenario branching. Only generates empathetic 4-part responses
// from category templates + optional LLM enhancement.
async function generateMessage({ category, risk_level, steps, context_summary, userMessage, language }) {
    const templates = VALIDATION_TEMPLATES[category] || VALIDATION_TEMPLATES.general;
    const langDirective = languageResolver.getLlmDirective(language);

    // Try LLM-enhanced companion response
    let companionMessage = null;
    try {
        companionMessage = await generateLLMCompanionMessage({
            category,
            risk_level,
            steps,
            context_summary,
            userMessage,
            templates,
            langDirective,
        });
    } catch (err) {
        logger.error('llm_error', 'system', err);
    }

    // Fallback: build companion message from templates (language-aware + category-aware)
    if (!companionMessage) {
        // Try language+category specific template first
        const langCatTemplate = getMultilingualTemplate(language, category);
        const fallbackTemplate = langCatTemplate || templates;
        companionMessage = formatCompanionResponse({
            validation: fallbackTemplate.validation,
            understanding: fallbackTemplate.understanding,
            guidance: steps,
            support_offer: fallbackTemplate.support_offer,
        });
    }

    // Enforce safety: remove judgemental language
    companionMessage = removeJudgementalLanguage(companionMessage);

    // Apply AI guardrails
    companionMessage = sanitizeResponse(companionMessage);

    const tone = risk_level === 'red'
        ? 'calm_urgent'
        : risk_level === 'yellow'
            ? 'gentle_supportive'
            : 'warm_informative';

    return {
        companionMessage,
        tone,
        supportSuggestion: templates.support_offer,
    };
}

async function generateLLMCompanionMessage({ category, risk_level, steps, context_summary, userMessage, templates, langDirective }) {
    const prompt = fillTemplate(COMPANION_PROMPT, {
        category,
        risk_level,
        steps: steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
        context: context_summary || 'No prior context',
        user_message: userMessage || '',
        validation: templates.validation,
    });

    // System message — keep simple, Llama models respond better to user-message instructions
    const systemMsg = 'You are SAATHI, a compassionate companion for women in India. Transform structured action steps into warm, empathetic conversational guidance. Never be judgemental. Always match the language the user is speaking.';

    // CRITICAL: Append language directive at the END of the user prompt
    // Llama models follow user-message instructions much better than system instructions
    let finalPrompt = prompt;
    if (langDirective && !langDirective.includes('English')) {
        finalPrompt += `\n\n---\nIMPORTANT: ${langDirective}\nYou MUST write your ENTIRE response in this language. Do NOT use English at all. Not a single English word.`;
    }

    const response = await llmClient.chat(
        [
            { role: 'system', content: systemMsg },
            { role: 'user', content: finalPrompt },
        ],
        { temperature: 0.8, maxTokens: 600 }
    );

    return response;
}

// ── Format companion response from template parts ──────────────────
function formatCompanionResponse({ validation, understanding, guidance, support_offer }) {
    const parts = [];

    if (validation) parts.push(validation);
    if (understanding) parts.push(understanding);

    if (guidance && guidance.length > 0) {
        const guidanceIntro = 'Here are some steps that could help:';
        const guidanceList = guidance.map((step) => `• ${step}`).join('\n');
        parts.push(`${guidanceIntro}\n\n${guidanceList}`);
    }

    if (support_offer) parts.push(support_offer);

    return parts.join('\n\n');
}

// ── Remove judgemental language ────────────────────────────────────
function removeJudgementalLanguage(text) {
    if (!text) return text;
    let result = text;

    for (const [trigger, replacement] of Object.entries(REPLACEMENTS)) {
        const escaped = trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result = result.replace(new RegExp(escaped, 'gi'), replacement);
    }

    return result;
}

module.exports = { generateMessage, formatCompanionResponse, removeJudgementalLanguage, VALIDATION_TEMPLATES };
