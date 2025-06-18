// backend/db/test-admin-login.ts
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testAdminLogin() {
  console.log('Testing admin login...');
  
  try {
    // Test connection
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Connection successful!');
    
    try {
      // Get admin user
      const adminResult = await client.query(`
        SELECT * FROM admin_users WHERE email = 'admin@fuelsync.com';
      `);
      
      if (adminResult.rows.length === 0) {
        console.error('Admin user not found!');
        return;
      }
      
      const admin = adminResult.rows[0];
      console.log('Admin user found:', {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        firstName: admin.first_name,
        lastName: admin.last_name,
        active: admin.active
      });
      
      // Test password
      const password = 'admin123';
      const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
      
      console.log('Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        // Update password
        console.log('Updating password...');
        
        const newPasswordHash = await bcrypt.hash(password, 10);
        
        await client.query(`
          UPDATE admin_users
          SET password_hash = $1
          WHERE email = 'admin@fuelsync.com'
        `, [newPasswordHash]);
        
        console.log('Password updated successfully!');
        
        // Verify new password
        const updatedAdminResult = await client.query(`
          SELECT * FROM admin_users WHERE email = 'admin@fuelsync.com';
        `);
        
        const updatedAdmin = updatedAdminResult.rows[0];
        const isNewPasswordValid = await bcrypt.compare(password, updatedAdmin.password_hash);
        
        console.log('New password valid:', isNewPasswordValid);
      }
      
      // Generate JWT token
      const jwtSecret = process.env.ADMIN_JWT_SECRET || 'admin-local-dev-secret-do-not-use-in-production';
      const token = jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          role: admin.role
        },
        jwtSecret,
        {
          expiresIn: '12h',
          audience: 'fuelsync-admin-api',
          issuer: 'fuelsync-admin-auth'
        }
      );
      
      console.log('Generated token:', token);
      
      // Store token in admin_sessions
      const sessionId = require('crypto').randomUUID();
      const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours
      
      await client.query(`
        INSERT INTO admin_sessions (id, admin_id, token, expires_at)
        VALUES ($1, $2, $3, $4)
      `, [sessionId, admin.id, token, expiresAt]);
      
      console.log('Session created successfully!');
      console.log('Login successful!');
      console.log('Use this token for testing:', token);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error testing admin login:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the function
testAdminLogin().catch(console.error);