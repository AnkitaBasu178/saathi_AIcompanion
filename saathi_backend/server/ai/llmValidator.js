const VALID_CATEGORIES = [
    'health', 'harassment', 'domestic_violence',
    'mental_distress', 'relationship_issues', 'education', 'general'
];

const VALID_RISK_LEVELS = ['green', 'yellow', 'red'];

function extractJSON(text) {
    if (!text) return null;

    // If already an object, return it
    if (typeof text === 'object') return text;

    // Try direct parse first
    try {
        return JSON.parse(text);
    } catch (_) { }

    // Try to extract JSON from markdown code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
        try {
            return JSON.parse(codeBlockMatch[1].trim());
        } catch (_) { }
    }

    // Try to extract first {...} block
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (_) { }
    }

    return null;
}

function validateClassification(result) {
    const parsed = extractJSON(result);
    if (!parsed) return null;

    const category = VALID_CATEGORIES.includes(parsed.category)
        ? parsed.category
        : 'general';

    const risk_level = VALID_RISK_LEVELS.includes(parsed.risk_level)
        ? parsed.risk_level
        : 'green';

    let confidence = parseFloat(parsed.confidence);
    if (isNaN(confidence) || confidence < 0 || confidence > 1) {
        confidence = 0.5;
    }

    return { category, risk_level, confidence };
}

function validateActionPlan(result) {
    const parsed = extractJSON(result);
    if (!parsed) return null;

    if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
        return null;
    }

    const steps = parsed.steps
        .filter((s) => typeof s === 'string' && s.trim().length > 0)
        .slice(0, 10);

    if (steps.length === 0) return null;

    return {
        steps,
        immediate_action: parsed.immediate_action || steps[0],
    };
}

module.exports = { extractJSON, validateClassification, validateActionPlan };
