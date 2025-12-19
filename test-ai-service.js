const axios = require('axios');

async function testAiService() {
  const baseUrl = 'http://34.27.237.113:8000';
  
  console.log('🧪 Testing AI Service connectivity...');
  console.log(`🎯 Base URL: ${baseUrl}`);
  
  try {
    // Test basic connectivity
    console.log('\n1️⃣ Testing basic connectivity...');
    const response = await axios.get(`${baseUrl}/`, { timeout: 10000 });
    console.log('✅ Basic connectivity successful');
    console.log(`📊 Status: ${response.status}`);
    
    // Test health endpoint if available
    try {
      console.log('\n2️⃣ Testing health endpoint...');
      const healthResponse = await axios.get(`${baseUrl}/health`, { timeout: 5000 });
      console.log('✅ Health endpoint successful');
      console.log(`📊 Status: ${healthResponse.status}`);
    } catch (healthError) {
      console.log('⚠️ Health endpoint not available or failed');
    }
    
    // Test CV evaluation endpoint
    try {
      console.log('\n3️⃣ Testing CV evaluation endpoint...');
      const cvResponse = await axios.post(`${baseUrl}/upload/cv_evaluate`, {}, { 
        timeout: 5000,
        validateStatus: () => true // Accept any status code
      });
      console.log(`📊 CV Evaluation Status: ${cvResponse.status}`);
      if (cvResponse.status === 422) {
        console.log('✅ CV evaluation endpoint is responding (422 expected without file)');
      }
    } catch (cvError) {
      console.log('❌ CV evaluation endpoint failed:', cvError.message);
    }
    
  } catch (error) {
    console.log('❌ AI Service connectivity failed');
    console.log(`🔍 Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🚫 Connection refused - AI service might be down');
    } else if (error.code === 'ECONNABORTED') {
      console.log('⏰ Connection timeout - AI service is not responding');
    } else if (error.code === 'ENOTFOUND') {
      console.log('🌐 DNS resolution failed - check the URL');
    }
  }
}

testAiService();