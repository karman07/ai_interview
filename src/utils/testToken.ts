// Development utility to set a test JWT token for API testing
// This is just for development purposes

export const setTestToken = () => {
  // This is a mock JWT token for testing - replace with a real one from your backend
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.your-test-jwt-token';
  
  localStorage.setItem('accessToken', testToken);
  console.log('Test JWT token set for API testing');
  
  // You can run this in the browser console to test authenticated endpoints
  return testToken;
};

// Usage: setTestToken() in browser console