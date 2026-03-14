const FORBIDDEN_PATTERNS = [
    /you (have|are diagnosed with)\s+.+/gi,
    /take\s+\d+\s*mg\s+of/gi,
    /you should (sue|file\s.*fir)/gi,
    /fight\s+(back|him|them)/gi,
    /confront\s+(him|her|them|your)/gi,
    /you must\s+(leave|attack|hit)/gi,
];

const DISCLAIMER = '\n\n⚠️ Please consult a qualified professional for medical or legal advice.';

function sanitize(text) {
    if (!text) return text;
    let modified = false;
    let result = text;

    for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(result)) {
            result = result.replace(pattern, 'Please consult a qualified professional for specific guidance');
            modified = true;
        }
    }

    // Strip markdown formatting characters so SpeechSynthesis reads clean prose
    result = result.replace(/[*#_~`]/g, '');

    if (modified) {
        result += DISCLAIMER;
    }
    return result;
}

function hasForbiddenContent(text) {
    if (!text) return false;
    return FORBIDDEN_PATTERNS.some((p) => p.test(text));
}

module.exports = { sanitize, hasForbiddenContent };
