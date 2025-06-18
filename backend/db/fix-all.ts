// backend/db/fix-all.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fixUserStations from './fix-user-stations';
import { exec } from 'child_process';
import { promisify } from 'util';

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

async function fixAll() {
  try {
    console.log('Starting comprehensive fix process...');
    
    // Step 1: Check database connection
    console.log('\n=== Step 1: Checking database connection ===');
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
    
    // Step 2: Check and fix station relationships
    console.log('\n=== Step 2: Checking and fixing station relationships ===');
    await execAsync('npm run db:check-stations');
    
    // Step 3: Fix user-station assignments
    console.log('\n=== Step 3: Fixing user-station assignments ===');
    await fixUserStations();
    
    // Step 4: Verify seed data
    console.log('\n=== Step 4: Verifying seed data ===');
    await execAsync('npm run db:verify-seed');
    
    console.log('\n=== All fixes completed successfully! ===');
    console.log('\nNext steps:');
    console.log('1. Restart the backend server: npm run dev');
    console.log('2. Restart the frontend server: npm run dev (in the frontend directory)');
    console.log('3. Access the debug page: http://localhost:3000/debug');
    console.log('4. Test login with: owner@demofuel.com / password123');
    
  } catch (error) {
    console.error('Error during fix process:', error);
  } finally {
    await pool.end();
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  fixAll().catch(console.error);
}

export default fixAll;