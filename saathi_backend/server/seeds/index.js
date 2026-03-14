require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const SupportService = require('../models/SupportService');
const KnowledgeBase = require('../models/KnowledgeBase');
const supportServices = require('./supportServices');
const knowledgeData = require('./knowledgeBase');

async function seed() {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(config.mongoUri);
        console.log('✅ Connected');

        // Clear existing data
        await SupportService.deleteMany({});
        await KnowledgeBase.deleteMany({});
        console.log('🗑️  Cleared existing seed data');

        // Insert support services
        const services = await SupportService.insertMany(supportServices);
        console.log(`✅ Inserted ${services.length} support services`);

        // Insert knowledge base
        const knowledge = await KnowledgeBase.insertMany(knowledgeData);
        console.log(`✅ Inserted ${knowledge.length} knowledge base entries`);

        // Summary
        console.log('\n📊 Seed Summary:');
        const types = {};
        services.forEach((s) => { types[s.type] = (types[s.type] || 0) + 1; });
        for (const [type, count] of Object.entries(types)) {
            console.log(`   ${type}: ${count}`);
        }
        const categories = {};
        knowledge.forEach((k) => { categories[k.category] = (categories[k.category] || 0) + 1; });
        for (const [cat, count] of Object.entries(categories)) {
            console.log(`   ${cat}: ${count}`);
        }

        console.log('\n✅ Seeding complete!');
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

seed();
