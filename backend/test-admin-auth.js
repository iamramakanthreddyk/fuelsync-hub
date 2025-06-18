// Simple script to test the admin-auth API
const fetch = require('node-fetch');

async function testAdminAuth() {
  const baseUrl = 'http://localhost:3001/api';
  
  try {
    console.log('Testing admin-auth login...');
    
    // Login
    const loginResponse = await fetch(`${baseUrl}/admin-auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@fuelsync.com',
        password: 'admin123'
      })
    });
    
    const loginText = await loginResponse.text();
    console.log('Login response text:', loginText);
    
    let loginData;
    try {
      loginData = JSON.parse(loginText);
      console.log('Login response parsed:', loginData);
    } catch (e) {
      console.error('Failed to parse login response:', e);
      return;
    }
    
    if (!loginResponse.ok) {
      console.error('Login failed!');
      return;
    }
    
    const token = loginData.data.token;
    console.log('Token:', token);
    
    // Get current admin
    console.log('\nTesting get current admin...');
    const meResponse = await fetch(`${baseUrl}/admin-auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const meText = await meResponse.text();
    console.log('Me response text:', meText);
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Error testing admin API:', error);
  }
}

testAdminAuth();