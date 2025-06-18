// backend/db/seed-all.ts
import { Pool } from 'pg';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';
import path from 'path';

// Convert exec to promise-based
const execAsync = promisify(exec);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

async function seedAll() {
  try {
    console.log('Starting complete seed process...');
    
    // Step 1: Check database connection
    console.log('\n--- Step 1: Checking database connection ---');
    const client = await pool.connect();
    console.log('Database connection successful!');
    client.release();
    
    // Step 2: Seed admin users
    console.log('\n--- Step 2: Seeding admin users ---');
    try {
      const { stdout: adminOutput, stderr: adminError } = await execAsync('ts-node db/seed-admin.ts');
      console.log(adminOutput);
      if (adminError) console.error(adminError);
    } catch (error) {
      console.error('Error seeding admin users:', error);
      // Continue with other steps even if this one fails
    }
    
    // Step 3: Seed tenant users
    console.log('\n--- Step 3: Seeding tenant users ---');
    try {
      const { stdout: tenantOutput, stderr: tenantError } = await execAsync('ts-node db/seed-tenant-users.ts');
      console.log(tenantOutput);
      if (tenantError) console.error(tenantError);
    } catch (error) {
      console.error('Error seeding tenant users:', error);
      // Continue with other steps even if this one fails
    }
    
    // Step 4: Seed credit sales
    console.log('\n--- Step 4: Seeding credit sales ---');
    try {
      const { stdout: creditOutput, stderr: creditError } = await execAsync('ts-node db/seed-credit-sales.ts');
      console.log(creditOutput);
      if (creditError) console.error(creditError);
    } catch (error) {
      console.error('Error seeding credit sales:', error);
      // Continue with other steps even if this one fails
    }
    
    console.log('\nSeed process completed!');
    console.log('\nLogin credentials:');
    console.log('- Superadmin: admin@fuelsync.com / admin123');
    console.log('- Owner: owner@demofuel.com / password123');
    console.log('- Manager: manager@demofuel.com / password123');
    console.log('- Employee: employee@demofuel.com / password123');
    
  } catch (error) {
    console.error('Error in seed process:', error);
  } finally {
    await pool.end();
  }
}

// Run the seed function
seedAll().catch(console.error);