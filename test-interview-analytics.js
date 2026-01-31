const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Test credentials - replace with actual values
const TEST_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // You need to login first to get this

async function testEndpoint(name, method, url, expectedStatus = 200) {
  console.log(`\n${colors.cyan}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.cyan}🧪 Testing: ${name}${colors.reset}`);
  console.log(`${colors.yellow}${method} ${url}${colors.reset}`);
  
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: { 
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    const response = await axios(config);
    
    if (response.status !== expectedStatus) {
      console.log(`${colors.red}❌ Expected status ${expectedStatus}, got ${response.status}${colors.reset}`);
    } else {
      console.log(`${colors.green}✅ Status: ${response.status}${colors.reset}`);
    }
    
    console.log(`${colors.magenta}📥 Response:${colors.reset}`);
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    if (error.response) {
      console.log(`${colors.red}❌ Error: ${error.response.status}${colors.reset}`);
      console.log(`${colors.red}📥 Error Response:${colors.reset}`);
      console.log(JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.log(`\n${colors.yellow}⚠️  You need to provide a valid JWT token!${colors.reset}`);
        console.log(`${colors.yellow}   1. Login to get a token${colors.reset}`);
        console.log(`${colors.yellow}   2. Replace TEST_TOKEN in this file${colors.reset}\n`);
      }
    } else {
      console.log(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    }
    return null;
  }
}

async function runInterviewAnalyticsTests() {
  console.log(`${colors.blue}${'='.repeat(70)}`);
  console.log(`${colors.blue}🎯 INTERVIEW ANALYTICS ENDPOINTS TEST SUITE${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(70)}${colors.reset}\n`);

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Dashboard
  console.log(`\n${colors.green}📊 1. Dashboard Analytics${colors.reset}`);
  const dashboard = await testEndpoint(
    'Get Interview Dashboard',
    'GET',
    '/interview-results/dashboard'
  );
  dashboard ? testsPassed++ : testsFailed++;

  // Test 2: Interview History
  console.log(`\n${colors.green}📜 2. Interview History${colors.reset}`);
  const history = await testEndpoint(
    'Get Interview History',
    'GET',
    '/interview-results/history?page=1&limit=10'
  );
  history ? testsPassed++ : testsFailed++;

  // Test 3: All Interview Results
  console.log(`\n${colors.green}📋 3. All Interview Results${colors.reset}`);
  const allResults = await testEndpoint(
    'Get All Interview Results',
    'GET',
    '/interview-results'
  );
  allResults ? testsPassed++ : testsFailed++;

  // Test 4: Summary Stats
  console.log(`\n${colors.green}📈 4. Summary Statistics${colors.reset}`);
  const summary = await testEndpoint(
    'Get Summary Stats',
    'GET',
    '/interview-results/stats/summary'
  );
  summary ? testsPassed++ : testsFailed++;

  // Test 5: Performance Stats
  console.log(`\n${colors.green}🎯 5. Performance Statistics${colors.reset}`);
  const performance = await testEndpoint(
    'Get Performance Stats',
    'GET',
    '/interview-results/stats/performance'
  );
  performance ? testsPassed++ : testsFailed++;

  // Test 6: By Company Stats
  console.log(`\n${colors.green}🏢 6. Company Analytics${colors.reset}`);
  const byCompany = await testEndpoint(
    'Get Stats by Company',
    'GET',
    '/interview-results/stats/by-company'
  );
  byCompany ? testsPassed++ : testsFailed++;

  // Test 7: By Role Stats
  console.log(`\n${colors.green}💼 7. Role Analytics${colors.reset}`);
  const byRole = await testEndpoint(
    'Get Stats by Role',
    'GET',
    '/interview-results/stats/by-role'
  );
  byRole ? testsPassed++ : testsFailed++;

  // Test 8: By Round Type
  console.log(`\n${colors.green}🔄 8. Round Type Analytics${colors.reset}`);
  const byRound = await testEndpoint(
    'Get Results by Round Type (Technical)',
    'GET',
    '/interview-results/by-round/technical'
  );
  byRound ? testsPassed++ : testsFailed++;

  // If we have results, test detail endpoints
  if (allResults && allResults.length > 0) {
    const sampleId = allResults[0]._id;
    const sampleSessionId = allResults[0].sessionId;

    // Test 9: Specific Interview Result
    console.log(`\n${colors.green}🔍 9. Specific Interview Details${colors.reset}`);
    const specific = await testEndpoint(
      'Get Specific Interview Result',
      'GET',
      `/interview-results/${sampleId}`
    );
    specific ? testsPassed++ : testsFailed++;

    // Test 10: Questions for Interview
    console.log(`\n${colors.green}❓ 10. Interview Questions${colors.reset}`);
    const questions = await testEndpoint(
      'Get Interview Questions',
      'GET',
      `/interview-results/${sampleId}/questions`
    );
    questions ? testsPassed++ : testsFailed++;

    // Test 11: Video Analysis
    console.log(`\n${colors.green}📹 11. Video Analysis${colors.reset}`);
    const videoAnalysis = await testEndpoint(
      'Get Video Analysis',
      'GET',
      `/interview-results/${sampleId}/video-analysis`
    );
    videoAnalysis ? testsPassed++ : testsFailed++;

    // Test 12: Communication Analysis
    console.log(`\n${colors.green}🗣️  12. Communication Analysis${colors.reset}`);
    const communication = await testEndpoint(
      'Get Communication Analysis',
      'GET',
      `/interview-results/${sampleId}/communication`
    );
    communication ? testsPassed++ : testsFailed++;

    if (sampleSessionId) {
      // Test 13: Session Details
      console.log(`\n${colors.green}🎫 13. Session Details${colors.reset}`);
      const session = await testEndpoint(
        'Get Session Details',
        'GET',
        `/interview-results/session/${sampleSessionId}`
      );
      session ? testsPassed++ : testsFailed++;

      // Test 14: Session Questions
      console.log(`\n${colors.green}❓ 14. Session Questions${colors.reset}`);
      const sessionQuestions = await testEndpoint(
        'Get Session Questions',
        'GET',
        `/interview-results/session/${sampleSessionId}/questions`
      );
      sessionQuestions ? testsPassed++ : testsFailed++;

      // Test 15: Voice Analytics
      console.log(`\n${colors.green}🎤 15. Voice Analytics${colors.reset}`);
      const voiceAnalytics = await testEndpoint(
        'Get Voice Analytics',
        'GET',
        `/interview-results/session/${sampleSessionId}/voice-analytics`
      );
      voiceAnalytics ? testsPassed++ : testsFailed++;
    }
  }

  // Print Summary
  console.log(`\n${colors.blue}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.blue}📊 TEST SUMMARY${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${testsFailed}${colors.reset}`);
  console.log(`${colors.cyan}📝 Total:  ${testsPassed + testsFailed}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(70)}${colors.reset}\n`);

  if (testsFailed === 0 && testsPassed > 0) {
    console.log(`${colors.green}🎉 ALL INTERVIEW ANALYTICS TESTS PASSED!${colors.reset}\n`);
  } else if (testsPassed === 0) {
    console.log(`${colors.yellow}⚠️  No tests passed - check your JWT token!${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  Some tests failed - review the errors above${colors.reset}\n`);
  }
}

// Instructions
if (TEST_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
  console.log(`\n${colors.yellow}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.yellow}⚠️  SETUP REQUIRED${colors.reset}`);
  console.log(`${colors.yellow}${'='.repeat(70)}${colors.reset}`);
  console.log(`\n${colors.cyan}To run this test:${colors.reset}`);
  console.log(`\n1. Login and get JWT token:`);
  console.log(`   ${colors.green}curl -X POST http://localhost:3000/auth/login \\`);
  console.log(`     -H "Content-Type: application/json" \\`);
  console.log(`     -d '{"email":"your@email.com","password":"yourpassword"}'${colors.reset}`);
  console.log(`\n2. Copy the token from response`);
  console.log(`\n3. Replace TEST_TOKEN in this file (line 11)`);
  console.log(`\n4. Run: ${colors.green}node test-interview-analytics.js${colors.reset}\n`);
  process.exit(0);
}

// Run the tests
runInterviewAnalyticsTests();
