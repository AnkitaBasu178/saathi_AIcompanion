const express = require('express');
const router = express.Router();
const voiceService = require('../services/voiceService');
const logger = require('../utils/logger');

/**
 * POST /api/voice/tts
 * Convert text to speech using OpenAI TTS.
 * Returns audio/mpeg stream.
 */
router.post('/tts', async (req, res) => {
    const { text, voice, speed } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: true, message: 'Text is required' });
    }

    if (text.length > 5000) {
        return res.status(400).json({ error: true, message: 'Text too long. Maximum 5000 characters.' });
    }

    try {
        const audioBuffer = await voiceService.generateSpeech(text.trim(), { voice, speed, language: req.body.language || 'en-IN' });

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
            'Cache-Control': 'no-cache',
        });

        res.send(audioBuffer);
    } catch (err) {
        logger.error('tts_error', req.sessionId, err);
        res.status(500).json({
            error: true,
            message: 'Failed to generate speech. Text response is available.',
        });
    }
});

module.exports = router;
