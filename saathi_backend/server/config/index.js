require('dotenv').config();

const config = Object.freeze({
  port: parseInt(process.env.PORT, 10) || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/saathi',
  llmApiKey: process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || '',
  llmApiUrl: process.env.OPENAI_API_URL || process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions',
  llmModel: process.env.OPENAI_MODEL || process.env.LLM_MODEL || 'gpt-4o-mini',
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  sessionSecret: process.env.SESSION_SECRET || 'saathi-default-secret',
  encryptionKey: process.env.ENCRYPTION_KEY || 'saathi-32char-encryption-key!!',
  demoMode: process.env.DEMO_MODE === 'true',
  nodeEnv: process.env.NODE_ENV || 'development',
});

module.exports = config;
