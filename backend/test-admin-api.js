// Simple script to test the admin API
const fetch = require('node-fetch');

async function testAdminApi() {
  const baseUrl = 'http://localhost:3001/api';
  
  try {
    console.log('Testing admin login...');
    
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
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
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
    
    const meData = await meResponse.json();
    console.log('Me response:', meData);
    
    // Get dashboard
    console.log('\nTesting get dashboard...');
    const dashboardResponse = await fetch(`${baseUrl}/admin/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const dashboardData = await dashboardResponse.json();
    console.log('Dashboard response:', dashboardData);
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Error testing admin API:', error);
  }
}

testAdminApi();