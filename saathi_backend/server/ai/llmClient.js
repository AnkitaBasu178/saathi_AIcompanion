const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000;

class LLMClient {
    constructor() {
        this.apiUrl = config.llmApiUrl;
        this.apiKey = config.llmApiKey;
        this.model = config.llmModel;
    }

    async chat(messages, options = {}) {
        const { temperature = 0.7, maxTokens = 512 } = options;

        if (!this.apiKey || this.apiKey === 'your-llm-api-key') {
            logger.log('llm_error', 'system', { reason: 'no_api_key' });
            return null;
        }

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const response = await axios.post(
                    this.apiUrl,
                    {
                        model: this.model,
                        messages,
                        temperature,
                        max_tokens: maxTokens,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${this.apiKey}`,
                        },
                        timeout: TIMEOUT_MS,
                    }
                );

                const content = response.data?.choices?.[0]?.message?.content;
                if (content) return content.trim();

                return null;
            } catch (err) {
                logger.error('llm_error', 'system', {
                    message: err.message,
                    attempt,
                    status: err.response?.status,
                });

                if (attempt < MAX_RETRIES) {
                    await new Promise((r) => setTimeout(r, 1000 * attempt));
                }
            }
        }

        return null;
    }

    async classify(text, context) {
        const { SYSTEM_PROMPT, CLASSIFICATION_PROMPT, fillTemplate } = require('./prompts');

        const prompt = fillTemplate(CLASSIFICATION_PROMPT, {
            message: text,
            context: context || 'No prior context',
        });

        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt },
        ];

        return this.chat(messages, { temperature: 0.3, maxTokens: 200 });
    }

    async generateResponse(userMessage, context, classification) {
        const { SYSTEM_PROMPT } = require('./prompts');

        const systemContext = classification
            ? `${SYSTEM_PROMPT}\n\nCurrent situation: Category=${classification.category}, Risk=${classification.risk_level}`
            : SYSTEM_PROMPT;

        const messages = [
            { role: 'system', content: systemContext },
        ];

        if (context) {
            messages.push({ role: 'assistant', content: `Context so far: ${context}` });
        }

        messages.push({ role: 'user', content: userMessage });

        return this.chat(messages, { temperature: 0.7, maxTokens: 512 });
    }

    async summarize(conversationMessages) {
        const { SYSTEM_PROMPT, SUMMARIZATION_PROMPT, fillTemplate } = require('./prompts');

        const formatted = conversationMessages
            .map((m) => `${m.role}: ${m.content}`)
            .join('\n');

        const prompt = fillTemplate(SUMMARIZATION_PROMPT, { messages: formatted });

        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: prompt },
        ];

        return this.chat(messages, { temperature: 0.3, maxTokens: 256 });
    }
}

// Singleton
module.exports = new LLMClient();
