const knowledgeService = require('../services/knowledgeService');

async function getInfo(req, res, next) {
    try {
        const { topic, category } = req.query;

        if (topic) {
            const results = await knowledgeService.getByTopic(topic);
            return res.json({ results });
        }

        if (category) {
            const results = await knowledgeService.getByCategory(category);
            return res.json({ results });
        }

        res.status(400).json({ error: true, message: 'Please provide a topic or category parameter' });
    } catch (err) {
        next(err);
    }
}

async function searchHealth(req, res, next) {
    try {
        const { q, category } = req.query;

        if (!q) {
            return res.status(400).json({ error: true, message: 'Search query (q) is required' });
        }

        const results = await knowledgeService.search(q, category);
        const answer = await knowledgeService.generateAnswer(q, results);

        res.json({
            answer,
            sources: results.map((r) => ({ title: r.title, category: r.category, topic: r.topic })),
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { getInfo, searchHealth };
