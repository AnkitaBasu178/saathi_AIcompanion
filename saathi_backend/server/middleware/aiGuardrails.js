const FORBIDDEN_PATTERNS = [
    /you (have|are diagnosed with)\s+.+/i,
    /take\s+\d+\s*mg\s+of/i,
    /you should (sue|file\s.*fir)/i,
    /fight\s+(back|him|them)/i,
    /confront\s+(him|her|them|your)/i,
    /you must\s+(leave|attack|hit)/i,
];

const DISCLAIMER = '\n\n⚠️ Please consult a qualified professional for medical or legal advice.';

function sanitizeResponse(text) {
    if (!text) return text;
    let modified = false;
    let result = text;

    for (const pattern of FORBIDDEN_PATTERNS) {
        if (pattern.test(result)) {
            result = result.replace(pattern, 'Please consult a qualified professional for specific guidance');
            modified = true;
        }
    }

    if (modified) {
        result += DISCLAIMER;
    }
    return result;
}

function hasForbiddenContent(text) {
    if (!text) return false;
    return FORBIDDEN_PATTERNS.some((p) => p.test(text));
}

module.exports = { sanitizeResponse, hasForbiddenContent };
