// ── Text Normalization Utility ──────────────────────────────────────
// Normalizes user messages for reliable keyword detection.

const STOPWORDS = new Set([
    'i', 'me', 'my', 'am', 'is', 'are', 'was', 'were', 'be', 'been',
    'a', 'an', 'the', 'and', 'or', 'but', 'if', 'in', 'on', 'at',
    'to', 'for', 'of', 'with', 'by', 'it', 'its', 'this', 'that',
    'so', 'do', 'did', 'has', 'had', 'have', 'not', 'no', 'just',
    'very', 'too', 'also', 'can', 'will', 'should', 'would', 'could',
]);

/**
 * Normalize text for keyword matching.
 * @param {string} input - Raw user message
 * @returns {{ normalizedText: string, tokens: string[] }}
 */
function normalizeText(input) {
    if (!input || typeof input !== 'string') {
        return { normalizedText: '', tokens: [] };
    }

    // Lowercase
    let text = input.toLowerCase();

    // Preserve key contractions before stripping punctuation
    text = text.replace(/don['']t/g, 'dont');
    text = text.replace(/can['']t/g, 'cant');
    text = text.replace(/won['']t/g, 'wont');
    text = text.replace(/i['']m/g, 'im');
    text = text.replace(/i['']ve/g, 'ive');

    // Remove punctuation (keep spaces and alphanumeric)
    text = text.replace(/[^a-z0-9\s]/g, '');

    // Collapse whitespace and trim
    text = text.replace(/\s+/g, ' ').trim();

    // Tokenize
    const allTokens = text.split(' ').filter(Boolean);

    // Remove stopwords for token list (keep normalizedText with them)
    const tokens = allTokens.filter((t) => !STOPWORDS.has(t) && t.length > 1);

    return { normalizedText: text, tokens };
}

/**
 * Check if normalized text contains a keyword phrase.
 * Works for multi-word phrases like "following me" or single words.
 * @param {string} normalizedText
 * @param {string} keyword - already-normalized keyword phrase
 * @returns {boolean}
 */
function containsKeyword(normalizedText, keyword) {
    return normalizedText.includes(keyword);
}

/**
 * Check if any token matches a keyword.
 * @param {string[]} tokens
 * @param {string} keyword - single word
 * @returns {boolean}
 */
function tokenMatches(tokens, keyword) {
    return tokens.includes(keyword);
}

module.exports = { normalizeText, containsKeyword, tokenMatches, STOPWORDS };
