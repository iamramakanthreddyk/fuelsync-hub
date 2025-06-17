import { Pool } from 'pg';
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

// Helper function to execute SQL with parameters
async function executeQuery(query: string, params: any[] = []): Promise<any> {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
}

// Main debug function
async function debugSchema() {
  console.log('Starting database schema debug...');
  
  try {
    // Test connection
    console.log('Testing database connection...');
    const client = await pool.connect();
    console.log('Connection successful!');
    client.release();
    
    // Check if tables exist
    console.log('\nChecking tables...');
    const tables = [
      'tenants', 'admin_users', 'admin_activity_logs', 'users', 'stations',
      'user_stations', 'pumps', 'nozzles', 'nozzle_readings', 'creditors',
      'fuel_price_history', 'sales', 'creditor_payments', 'shifts',
      'tender_entries', 'day_reconciliations', 'migrations'
    ];
    
    for (const table of tables) {
      try {
        const result = await executeQuery(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )`,
          [table]
        );
        
        const exists = result.rows[0].exists;
        console.log(`Table ${table}: ${exists ? 'EXISTS' : 'MISSING'}`);
      } catch (error) {
        console.error(`Error checking table ${table}:`, error);
      }
    }
    
    // Check if enums exist
    console.log('\nChecking enums...');
    const enums = [
      'user_role', 'station_user_role', 'payment_method', 'sale_status',
      'subscription_plan', 'tenant_status', 'fuel_type', 'creditor_payment_method',
      'shift_status', 'tender_type'
    ];
    
    for (const enumType of enums) {
      try {
        const result = await executeQuery(
          `SELECT EXISTS (
            SELECT FROM pg_type 
            WHERE typname = $1
          )`,
          [enumType]
        );
        
        const exists = result.rows[0].exists;
        console.log(`Enum ${enumType}: ${exists ? 'EXISTS' : 'MISSING'}`);
      } catch (error) {
        console.error(`Error checking enum ${enumType}:`, error);
      }
    }
    
    // Check if functions exist
    console.log('\nChecking functions...');
    const functions = [
      'round_decimal', 'calc_sale_amount', 'update_fuel_price_effective_to',
      'validate_sale_amount'
    ];
    
    for (const func of functions) {
      try {
        const result = await executeQuery(
          `SELECT EXISTS (
            SELECT FROM pg_proc 
            WHERE proname = $1
          )`,
          [func]
        );
        
        const exists = result.rows[0].exists;
        console.log(`Function ${func}: ${exists ? 'EXISTS' : 'MISSING'}`);
      } catch (error) {
        console.error(`Error checking function ${func}:`, error);
      }
    }
    
    // Check table dependencies
    console.log('\nChecking table dependencies...');
    const dependencies = [
      { table: 'users', depends_on: 'tenants' },
      { table: 'stations', depends_on: 'tenants' },
      { table: 'user_stations', depends_on: ['users', 'stations'] },
      { table: 'pumps', depends_on: 'stations' },
      { table: 'nozzles', depends_on: 'pumps' },
      { table: 'nozzle_readings', depends_on: ['nozzles', 'users'] },
      { table: 'fuel_price_history', depends_on: ['stations', 'users'] },
      { table: 'sales', depends_on: ['stations', 'nozzles', 'users', 'creditors'] },
      { table: 'creditor_payments', depends_on: ['creditors', 'users'] },
      { table: 'shifts', depends_on: ['stations', 'users'] },
      { table: 'tender_entries', depends_on: ['shifts', 'stations', 'users'] },
      { table: 'day_reconciliations', depends_on: ['stations', 'users'] }
    ];
    
    for (const dep of dependencies) {
      const table = dep.table;
      const depends_on = Array.isArray(dep.depends_on) ? dep.depends_on : [dep.depends_on];
      
      console.log(`\nChecking dependencies for ${table}:`);
      
      for (const dependency of depends_on) {
        try {
          const result = await executeQuery(
            `SELECT EXISTS (
              SELECT FROM information_schema.table_constraints tc
              JOIN information_schema.constraint_column_usage ccu
              ON tc.constraint_name = ccu.constraint_name
              WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_name = $1
              AND ccu.table_name = $2
            )`,
            [table, dependency]
          );
          
          const exists = result.rows[0].exists;
          console.log(`  Dependency on ${dependency}: ${exists ? 'OK' : 'MISSING'}`);
        } catch (error) {
          console.error(`  Error checking dependency ${table} -> ${dependency}:`, error);
        }
      }
    }
    
    console.log('\nSchema debug completed!');
  } catch (error) {
    console.error('Error debugging schema:', error);
  } finally {
    await pool.end();
  }
}

// Run debug
debugSchema().catch(console.error);