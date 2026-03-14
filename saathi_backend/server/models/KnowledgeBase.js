const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['menstrual_health', 'pregnancy', 'sexual_consent', 'contraception', 'mental_wellbeing'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    tags: [String],
    source: String,
});

knowledgeBaseSchema.index({ content: 'text', tags: 'text' });
knowledgeBaseSchema.index({ category: 1, topic: 1 });

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
