// frontend/src/pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';

// Mock user database
const users = [
  {
    id: '1',
    email: 'owner@demofuel.com',
    password: 'password123',
    role: 'owner',
    first_name: 'John',
    last_name: 'Owner'
  },
  {
    id: '2',
    email: 'manager@demofuel.com',
    password: 'password123',
    role: 'manager',
    first_name: 'Jane',
    last_name: 'Manager'
  },
  {
    id: '3',
    email: 'employee@demofuel.com',
    password: 'password123',
    role: 'employee',
    first_name: 'Bob',
    last_name: 'Employee'
  },
  {
    id: '4',
    email: 'admin@fuelsync.com',
    password: 'admin123',
    role: 'superadmin',
    first_name: 'Admin',
    last_name: 'User'
  }
];

// Simple token generation function
function generateToken(payload: any): string {
  // In a real app, use a proper JWT library
  // This is a simplified version for demo purposes
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = 'mock_signature'; // In a real app, this would be cryptographically generated
  
  return `${header}.${encodedPayload}.${signature}`;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if this is a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  // Get email and password from request body
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ status: 'error', message: 'Email and password are required' });
  }

  // Find user by email
  const user = users.find(u => u.email === email);

  // Check if user exists and password is correct
  if (!user || user.password !== password) {
    return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
  }

  // Create token payload
  const payload = { 
    id: user.id, 
    email: user.email, 
    role: user.role,
    name: `${user.first_name} ${user.last_name}`,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 1 day expiration
  };

  // Generate token
  const token = generateToken(payload);

  // Return success response with token
  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: `${user.first_name} ${user.last_name}`
      }
    }
  });
}