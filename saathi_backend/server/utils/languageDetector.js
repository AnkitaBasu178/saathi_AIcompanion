// ── Language Detector ──────────────────────────────────────────────
// Detects language from user text using Unicode script ranges.
// No external dependencies — pure script-based detection.

// Script-based detection for Devanagari / Telugu
const SCRIPT_PATTERNS = {
    telugu: /[\u0C00-\u0C7F]/,      // Telugu script range
    devanagari: /[\u0900-\u097F]/,   // Devanagari script range (Hindi/Rajasthani)
};

// Rajasthani-specific words (distinguish from standard Hindi)
const RAJASTHANI_MARKERS = [
    'म्हारो', 'म्हाने', 'थारो', 'थां', 'घणो', 'घणी', 'काई',
    'बावड़ी', 'लुगाई', 'छोरी', 'छोरो', 'कोनी', 'ईब',
    'रह्यो', 'रह्यी', 'लाग', 'बात करां', 'कर रह्यो',
    'सूँ', 'ताईं', 'खातर', 'पाछो', 'अबे',
];

const DEFAULT = 'en-IN';

/**
 * Detect the language of a text string.
 * Uses Unicode script ranges for reliable Indian language detection.
 *
 * @param {string} text - User message text
 * @returns {string} SAATHI language code (e.g., 'hi-IN')
 */
function detectLanguage(text) {
    if (!text || typeof text !== 'string' || text.trim().length < 2) {
        return DEFAULT;
    }

    const trimmed = text.trim();

    // 1. Telugu script detection
    if (SCRIPT_PATTERNS.telugu.test(trimmed)) {
        return 'te-IN';
    }

    // 2. Devanagari script detection (Hindi or Rajasthani)
    if (SCRIPT_PATTERNS.devanagari.test(trimmed)) {
        // Check for Rajasthani marker words
        const isRajasthani = RAJASTHANI_MARKERS.some((m) => trimmed.includes(m));
        return isRajasthani ? 'raj-IN' : 'hi-IN';
    }

    // 3. Default to English
    return DEFAULT;
}

module.exports = { detectLanguage };
