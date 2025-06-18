// backend/db/verify-admin.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';

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

async function verifyAdmin() {
  console.log('Verifying admin user...');
  
  try {
    // Test connection
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Connection successful!');
    
    try {
      // Check if admin_users table exists
      const tableResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'admin_users'
        );
      `);
      
      if (!tableResult.rows[0].exists) {
        console.error('admin_users table does not exist!');
        return;
      }
      
      console.log('admin_users table exists.');
      
      // Check if admin user exists
      const adminResult = await client.query(`
        SELECT * FROM admin_users WHERE email = 'admin@fuelsync.com';
      `);
      
      if (adminResult.rows.length === 0) {
        console.error('Admin user does not exist!');
        
        // Create admin user
        console.log('Creating admin user...');
        
        const password = 'admin123';
        const passwordHash = await bcrypt.hash(password, 10);
        
        await client.query(`
          INSERT INTO admin_users (
            id,
            email,
            password_hash,
            role,
            first_name,
            last_name,
            active
          ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            'admin@fuelsync.com',
            $1,
            'superadmin',
            'Super',
            'Admin',
            true
          )
        `, [passwordHash]);
        
        console.log('Admin user created successfully!');
      } else {
        const admin = adminResult.rows[0];
        console.log('Admin user exists:', {
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
        
        if (isPasswordValid) {
          console.log('Password is valid!');
        } else {
          console.log('Password is invalid! Updating password...');
          
          const newPasswordHash = await bcrypt.hash(password, 10);
          
          await client.query(`
            UPDATE admin_users
            SET password_hash = $1
            WHERE email = 'admin@fuelsync.com'
          `, [newPasswordHash]);
          
          console.log('Password updated successfully!');
        }
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error verifying admin:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the function
verifyAdmin().catch(console.error);