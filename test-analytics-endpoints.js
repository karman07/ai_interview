const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let visitorId, sessionId;

async function testEndpoint(name, method, url, data = null, expectedStatus = null) {
  console.log(`\n${colors.cyan}🧪 Testing: ${name}${colors.reset}`);
  console.log(`${colors.yellow}${method} ${url}${colors.reset}`);
  
  if (data) {
    console.log('📤 Request:', JSON.stringify(data, null, 2));
  }
  
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    
    if (expectedStatus && response.status !== expectedStatus) {
      console.log(`${colors.red}❌ Expected status ${expectedStatus}, got ${response.status}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Status: ${response.status}${colors.reset}`);
    }
    
    console.log('📥 Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    if (error.response) {
      console.log(`${colors.red}❌ Error: ${error.response.status}${colors.reset}`);
      console.log('📥 Error Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    }
    throw error;
  }
}

async function runTests() {
  console.log(`${colors.blue}${'='.repeat(70)}`);
  console.log(`🧪 ANALYTICS ENDPOINTS TEST SUITE`);
  console.log(`${'='.repeat(70)}${colors.reset}\n`);

  try {
    // 1. Track Visitor
    const visitorData = await testEndpoint(
      'Track Visitor',
      'POST',
      '/analytics/visitors',
      {
        fingerprint: `test-fp-${Date.now()}`,
        userAgent: 'Mozilla/5.0 Test',
        ip: '127.0.0.1',
        language: 'en-US',
        timezone: 'America/New_York',
        screenResolution: '1920x1080',
        deviceType: 'desktop'
      },
      201
    );
    visitorId = visitorData.visitorId;
    console.log(`${colors.green}💾 Stored visitorId: ${visitorId}${colors.reset}`);

    // 2. Start Session
    const sessionData = await testEndpoint(
      'Start Session',
      'POST',
      '/analytics/sessions/start',
      {
        visitorId: visitorId,
        landingPage: '/home',
        referrer: 'https://google.com',
        utmSource: 'test',
        utmMedium: 'organic'
      },
      201
    );
    sessionId = sessionData.sessionId;
    console.log(`${colors.green}💾 Stored sessionId: ${sessionId}${colors.reset}`);

    // 3. Track Page View
    await testEndpoint(
      'Track Page View',
      'POST',
      '/analytics/pageviews',
      {
        sessionId: sessionId,
        page: '/dashboard',
        title: 'Dashboard',
        duration: 45
      },
      201
    );

    // 4. Connect Analytics (Link visitor to user)
    await testEndpoint(
      'Connect Analytics',
      'POST',
      '/analytics/connect',
      {
        visitorId: visitorId,
        sessionId: sessionId,
        userId: 'test-user-123'
      },
      201
    );

    // 5. Heartbeat
    await testEndpoint(
      'Heartbeat',
      'POST',
      '/analytics/heartbeat',
      {
        sessionId: sessionId,
        visitorId: visitorId,
        path: '/dashboard'
      },
      201
    );

    // Wait a bit before ending session
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 6. End Session
    await testEndpoint(
      'End Session',
      'POST',
      `/analytics/sessions/${sessionId}/end`,
      {
        exitPage: '/logout'
      },
      200
    );

    // 7. Get All Visitors
    await testEndpoint(
      'Get All Visitors',
      'GET',
      '/analytics/visitors',
      null,
      200
    );

    // 8. Get Visitor Stats
    await testEndpoint(
      'Get Visitor Stats',
      'GET',
      `/analytics/visitors/${visitorId}`,
      null,
      200
    );

    // 9. Get All Sessions
    await testEndpoint(
      'Get All Sessions',
      'GET',
      '/analytics/sessions?limit=10',
      null,
      200
    );

    // 10. Get Session Details
    await testEndpoint(
      'Get Session Details',
      'GET',
      `/analytics/sessions/${sessionId}`,
      null,
      200
    );

    // 11. Get All Page Views
    await testEndpoint(
      'Get All Page Views',
      'GET',
      '/analytics/pageviews?limit=10',
      null,
      200
    );

    // 12. Get Analytics Summary
    await testEndpoint(
      'Get Analytics Summary',
      'GET',
      '/analytics/summary',
      null,
      200
    );

    console.log(`\n${colors.blue}${'='.repeat(70)}`);
    console.log(`${colors.green}✅ ALL ANALYTICS TESTS COMPLETED SUCCESSFULLY!${colors.reset}`);
    console.log(`${colors.blue}${'='.repeat(70)}${colors.reset}\n`);

  } catch (error) {
    console.log(`\n${colors.red}${'='.repeat(70)}`);
    console.log(`❌ TEST SUITE FAILED`);
    console.log(`${'='.repeat(70)}${colors.reset}\n`);
    process.exit(1);
  }
}

// Run the tests
runTests();
