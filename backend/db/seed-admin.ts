// backend/db/seed-admin.ts
import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

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

async function seedAdmin() {
  console.log('Starting admin user seeding...');
  
  try {
    // Test connection
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Connection successful!');
    
    // Create admin user
    console.log('Creating admin user...');
    
    // Hash password
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert admin user
    const query = `
      INSERT INTO admin_users (
        id,
        email,
        password_hash,
        role,
        first_name,
        last_name,
        active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $3,
        first_name = $5,
        last_name = $6,
        active = $7,
        updated_at = NOW()
      RETURNING id, email, role, first_name, last_name, active
    `;
    
    const values = [
      uuidv4(),
      'admin@fuelsync.com',
      passwordHash,
      'superadmin',
      'Super',
      'Admin',
      true
    ];
    
    const result = await client.query(query, values);
    const admin = result.rows[0];
    
    console.log('Admin user created successfully:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      firstName: admin.first_name,
      lastName: admin.last_name,
      active: admin.active
    });
    
    client.release();
    console.log('Admin seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding admin:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the function
seedAdmin().catch(console.error);