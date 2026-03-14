const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const languageResolver = require('../utils/languageResolver');

const TTS_URL = 'https://api.openai.com/v1/audio/speech';
const TTS_MODEL = 'gpt-4o-mini-tts';
const TTS_VOICE = 'coral';
const MAX_INPUT_LENGTH = 4096;

/**
 * Generate speech audio from text using OpenAI TTS API.
 * Returns an MP3 buffer.
 *
 * @param {string} text - Text to convert to speech
 * @param {Object} options - { voice, speed }
 * @returns {Promise<Buffer>} MP3 audio buffer
 */
async function generateSpeech(text, options = {}) {
    const apiKey = config.llmApiKey;
    if (!apiKey) {
        throw new Error('OpenAI API key not configured');
    }

    // Truncate to safe length for TTS
    let input = text || '';
    if (input.length > MAX_INPUT_LENGTH) {
        input = input.slice(0, MAX_INPUT_LENGTH);
    }

    // Clean text for speech — remove markdown bullets and excessive newlines
    input = input
        .replace(/•\s*/g, '')
        .replace(/\*\*/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/⚠️/g, '')
        .trim();

    if (!input) {
        throw new Error('No text to convert to speech');
    }

    const ttsConfig = languageResolver.getTtsConfig(options.language);
    const voice = options.voice || ttsConfig.voice;
    const speed = options.speed || 0.95; // Slightly slower for calm tone
    const instructions = options.instructions || ttsConfig.instructions;

    try {
        const response = await axios.post(
            TTS_URL,
            {
                model: TTS_MODEL,
                voice,
                input,
                speed,
                instructions,
                response_format: 'mp3',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                responseType: 'arraybuffer',
                timeout: 30000,
            }
        );

        logger.log('tts_generated', 'system', {
            text_length: input.length,
            voice,
            audio_bytes: response.data.byteLength,
        });

        return Buffer.from(response.data);
    } catch (err) {
        const status = err.response?.status;
        const errMsg = err.response?.data
            ? Buffer.from(err.response.data).toString('utf-8').slice(0, 200)
            : err.message;

        logger.error('tts_error', 'system', {
            message: errMsg,
            status,
        });

        throw new Error(`TTS generation failed: ${errMsg}`);
    }
}

module.exports = { generateSpeech };
