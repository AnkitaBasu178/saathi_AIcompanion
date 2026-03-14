const KnowledgeBase = require('../models/KnowledgeBase');
const llmClient = require('../ai/llmClient');
const { KNOWLEDGE_PROMPT, fillTemplate } = require('../ai/prompts');
const logger = require('../utils/logger');

async function search(query, category) {
    const filter = {};

    if (category) {
        filter.category = category;
    }

    try {
        const results = await KnowledgeBase.find(
            { $text: { $search: query }, ...filter },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .limit(3);

        return results;
    } catch (err) {
        // Fallback: regex search if text index not yet created
        const regex = new RegExp(query.split(' ').join('|'), 'i');
        return KnowledgeBase.find({
            $or: [
                { content: regex },
                { tags: regex },
                { title: regex },
                { topic: regex },
            ],
            ...filter,
        }).limit(3);
    }
}

async function getByTopic(topic) {
    return KnowledgeBase.find({ topic: new RegExp(topic, 'i') });
}

async function getByCategory(category) {
    return KnowledgeBase.find({ category });
}

async function generateAnswer(query, knowledgeResults) {
    // Build context from knowledge base results
    const context = knowledgeResults
        .map((r) => `[${r.title}]: ${r.content}`)
        .join('\n\n');

    if (!context) {
        return 'I could not find specific information on this topic. Please consult a qualified healthcare professional for accurate guidance.';
    }

    try {
        const prompt = fillTemplate(KNOWLEDGE_PROMPT, {
            knowledge_context: context,
            query: query,
        });

        const response = await llmClient.chat([
            { role: 'system', content: 'You are a helpful health education assistant. Provide accurate, compassionate information. Always recommend consulting professionals for medical concerns.' },
            { role: 'user', content: prompt },
        ]);

        if (response) return response;
    } catch (err) {
        logger.error('llm_error', 'system', err);
    }

    // Fallback: return raw knowledge content
    return knowledgeResults.map((r) => `**${r.title}**\n${r.content}`).join('\n\n');
}

module.exports = { search, getByTopic, getByCategory, generateAnswer };
