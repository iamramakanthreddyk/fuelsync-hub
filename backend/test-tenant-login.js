// Simple script to test tenant user login
const fetch = require('node-fetch');

async function testTenantLogin() {
  const baseUrl = 'http://localhost:3001/api';
  const users = [
    { email: 'owner@demofuel.com', password: 'password123', role: 'Owner' },
    { email: 'manager@demofuel.com', password: 'password123', role: 'Manager' },
    { email: 'employee@demofuel.com', password: 'password123', role: 'Employee' }
  ];
  
  for (const user of users) {
    try {
      console.log(`Testing ${user.role} login...`);
      
      // Login
      const loginResponse = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      });
      
      const loginText = await loginResponse.text();
      console.log(`${user.role} login response status:`, loginResponse.status);
      
      try {
        const loginData = JSON.parse(loginText);
        console.log(`${user.role} login response:`, loginData);
        
        if (loginResponse.ok && loginData.status === 'success') {
          console.log(`${user.role} login successful!`);
          console.log(`Token: ${loginData.data.token.substring(0, 20)}...`);
          
          // Test getting user profile
          const meResponse = await fetch(`${baseUrl}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${loginData.data.token}`
            }
          });
          
          const meData = await meResponse.json();
          console.log(`${user.role} profile:`, meData);
        } else {
          console.error(`${user.role} login failed:`, loginData);
        }
      } catch (e) {
        console.error(`Failed to parse ${user.role} login response:`, e);
        console.log('Raw response:', loginText);
      }
      
      console.log('-----------------------------------');
    } catch (error) {
      console.error(`Error testing ${user.role} login:`, error);
    }
  }
}

testTenantLogin();