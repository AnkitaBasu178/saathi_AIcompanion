// ── Language Resolver ──────────────────────────────────────────────
// Validates, resolves, and maps language codes for STT, LLM, and TTS.

const SUPPORTED_LANGUAGES = Object.freeze({
    'en-IN': {
        code: 'en-IN',
        label: 'English',
        nativeLabel: 'English',
        sttCode: 'en-IN',
        ttsVoice: 'coral',
        ttsInstructions: 'Speak in a calm, warm, empathetic tone. You are a caring companion helping a woman in India. Pause briefly between sentences for clarity.',
        llmDirective: 'Respond entirely in English.',
    },
    'hi-IN': {
        code: 'hi-IN',
        label: 'Hindi',
        nativeLabel: 'हिंदी',
        sttCode: 'hi-IN',
        ttsVoice: 'coral',
        ttsInstructions: 'Speak in a calm, warm, empathetic tone in Hindi. You are a caring companion called SAATHI helping a woman in India. Use natural Hindi pronunciation. Pause briefly between sentences.',
        llmDirective: 'Respond entirely in Hindi (Devanagari script). Use simple, conversational Hindi that is easy to understand. Do not mix English words unless absolutely necessary.',
    },
    'te-IN': {
        code: 'te-IN',
        label: 'Telugu',
        nativeLabel: 'తెలుగు',
        sttCode: 'te-IN',
        ttsVoice: 'coral',
        ttsInstructions: 'Speak in a calm, warm, empathetic tone in Telugu. You are a caring companion called SAATHI helping a woman in India. Use natural Telugu pronunciation. Pause briefly between sentences.',
        llmDirective: 'Respond entirely in Telugu (Telugu script). Use simple, conversational Telugu that is easy to understand. Do not mix English words unless absolutely necessary.',
    },
    'raj-IN': {
        code: 'raj-IN',
        label: 'Rajasthani',
        nativeLabel: 'राजस्थानी',
        sttCode: 'hi-IN', // Fallback: Rajasthani uses Hindi STT
        ttsVoice: 'coral',
        ttsInstructions: 'Speak in a calm, warm, empathetic tone in Hindi with a Rajasthani dialect flavor. You are a caring companion called SAATHI helping a woman in Rajasthan, India. Pause briefly between sentences.',
        llmDirective: 'Respond entirely in Rajasthani dialect (Devanagari script). Use Rajasthani words and phrasing (e.g., "थां" instead of "आप", "म्हारो" instead of "मेरा", "घणो" instead of "बहुत"). Keep it conversational and warm. If unsure about a Rajasthani word, use Hindi as fallback.',
    },
});

const DEFAULT_LANGUAGE = 'en-IN';

// Short code → full code mapping for React frontend compatibility
const SHORT_CODE_MAP = { en: 'en-IN', hi: 'hi-IN', te: 'te-IN', raj: 'raj-IN' };

/**
 * Resolve and validate a language code.
 * Accepts both short codes ('en', 'hi') and full codes ('en-IN', 'hi-IN').
 * @param {string} langCode - Language code from client
 * @returns {Object} Language config object
 */
function resolve(langCode) {
    if (!langCode || typeof langCode !== 'string') {
        return SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
    }

    const normalized = langCode.trim();
    const fullCode = SHORT_CODE_MAP[normalized] || normalized;
    return SUPPORTED_LANGUAGES[fullCode] || SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
}

/**
 * Get STT language code for Web Speech API / browser.
 * @param {string} langCode
 * @returns {string} STT-compatible language code
 */
function getSttCode(langCode) {
    return resolve(langCode).sttCode;
}

/**
 * Get TTS voice and instructions for a language.
 * @param {string} langCode
 * @returns {{ voice: string, instructions: string }}
 */
function getTtsConfig(langCode) {
    const lang = resolve(langCode);
    return {
        voice: lang.ttsVoice,
        instructions: lang.ttsInstructions,
    };
}

/**
 * Get LLM language directive for prompt injection.
 * @param {string} langCode
 * @returns {string}
 */
function getLlmDirective(langCode) {
    return resolve(langCode).llmDirective;
}

/**
 * List all supported languages for frontend.
 * @returns {Array<{ code, label, nativeLabel }>}
 */
function listLanguages() {
    return Object.values(SUPPORTED_LANGUAGES).map((lang) => ({
        code: lang.code,
        label: lang.label,
        nativeLabel: lang.nativeLabel,
        sttCode: lang.sttCode,
    }));
}

module.exports = {
    resolve,
    getSttCode,
    getTtsConfig,
    getLlmDirective,
    listLanguages,
    SUPPORTED_LANGUAGES,
    DEFAULT_LANGUAGE,
};
