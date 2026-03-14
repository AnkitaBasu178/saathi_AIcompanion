const Conversation = require('../models/Conversation');
const llmClient = require('../ai/llmClient');
const logger = require('../utils/logger');

const MAX_MESSAGES = 6;

async function getContext(sessionId) {
    const conversation = await Conversation.findOne({ sessionId }).sort({ updatedAt: -1 });

    if (!conversation) {
        return { summary: '', recentMessages: [], conversation: null };
    }

    return {
        summary: conversation.summary || '',
        recentMessages: conversation.messages.slice(-MAX_MESSAGES),
        conversation,
    };
}

async function manageContext(conversation) {
    if (!conversation || conversation.messages.length <= MAX_MESSAGES) {
        return;
    }

    const overflow = conversation.messages.length - MAX_MESSAGES;
    const oldMessages = conversation.messages.slice(0, overflow);

    // Summarize old messages
    let newSummary = conversation.summary || '';

    try {
        const summarized = await llmClient.summarize(oldMessages);
        if (summarized) {
            newSummary = newSummary
                ? `${newSummary}\n\n${summarized}`
                : summarized;
        } else {
            // Fallback: simple concatenation
            const oldText = oldMessages.map((m) => `${m.role}: ${m.content}`).join(' | ');
            newSummary = newSummary
                ? `${newSummary} | ${oldText}`
                : oldText;
        }
    } catch (err) {
        logger.error('llm_error', 'system', err);
        const oldText = oldMessages.map((m) => `${m.role}: ${m.content}`).join(' | ');
        newSummary = newSummary ? `${newSummary} | ${oldText}` : oldText;
    }

    // Trim summary if too long
    if (newSummary.length > 1000) {
        newSummary = newSummary.slice(-1000);
    }

    conversation.summary = newSummary;
    conversation.messages = conversation.messages.slice(-MAX_MESSAGES);
    await conversation.save();
}

function buildPromptContext(conversation) {
    if (!conversation) return 'No prior context.';

    const parts = [];
    if (conversation.summary) {
        parts.push(`[Previous context]: ${conversation.summary}`);
    }

    const recent = conversation.messages.slice(-MAX_MESSAGES);
    if (recent.length > 0) {
        const formatted = recent.map((m) => `${m.role}: ${m.content}`).join('\n');
        parts.push(`[Recent messages]:\n${formatted}`);
    }

    return parts.join('\n\n') || 'No prior context.';
}

module.exports = { getContext, manageContext, buildPromptContext, MAX_MESSAGES };
