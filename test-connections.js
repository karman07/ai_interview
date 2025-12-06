// Quick diagnostic script to test connections
require('dotenv').config();
const mongoose = require('mongoose');
const Redis = require('ioredis');

async function testConnections() {
  console.log('🔍 Testing connections...\n');

  // Test MongoDB
  console.log('1️⃣ Testing MongoDB connection...');
  console.log('MongoDB URI:', process.env.MONGO_URI ? 'Set ✅' : 'Not Set ❌');
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected successfully\n');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message, '\n');
  }

  // Test Redis
  console.log('2️⃣ Testing Redis connection...');
  console.log('Redis URL:', process.env.REDIS_URL ? 'Set ✅' : 'Not Set ❌');
  
  try {
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      connectTimeout: 5000,
      lazyConnect: true,
    });
    
    await redis.connect();
    await redis.ping();
    console.log('✅ Redis connected successfully\n');
    await redis.quit();
  } catch (err) {
    console.error('❌ Redis connection failed:', err.message, '\n');
  }

  // Test AI Interview API
  console.log('3️⃣ Testing AI Interview API...');
  const aiApiUrl = process.env.AI_INTERVIEW_API_BASE_URL || 'http://34.27.237.113:8000';
  console.log('AI API URL:', aiApiUrl);
  
  try {
    const https = require('https');
    const http = require('http');
    const client = aiApiUrl.startsWith('https') ? https : http;
    
    await new Promise((resolve, reject) => {
      const req = client.get(aiApiUrl + '/docs', { timeout: 5000 }, (res) => {
        console.log('✅ AI Interview API reachable (Status:', res.statusCode, ')\n');
        resolve();
      });
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Timeout')));
    });
  } catch (err) {
    console.error('❌ AI Interview API not reachable:', err.message, '\n');
  }

  console.log('✅ Diagnostics complete!');
  process.exit(0);
}

testConnections();
