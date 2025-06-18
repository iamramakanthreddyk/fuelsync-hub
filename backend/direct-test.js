// Direct test script for admin-auth login
const fetch = require('node-fetch');

async function testAdminAuth() {
  try {
    console.log('Testing direct-admin-auth login...');
    
    const response = await fetch('http://localhost:3001/api/direct-admin-auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@fuelsync.com',
        password: 'admin123'
      })
    });
    
    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    console.log('Response body:', responseText);
    
    try {
      const data = JSON.parse(responseText);
      console.log('Parsed data:', data);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
    }
  } catch (error) {
    console.error('Error testing admin-auth:', error);
  }
}

testAdminAuth();