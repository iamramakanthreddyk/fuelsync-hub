import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const REQUIRED_TABLES = [
  'migrations',
  'admin_users',
  'users',
  'stations',
  'user_stations',
  'pumps',
  'nozzles',
  'fuel_prices',
  'sales',
  'creditors'
];

interface ValidationRule {
  name: string;
  query: string;
  errorMessage: string;
}

const SCHEMA_RULES: ValidationRule[] = [
  {
    name: 'foreign_keys',
    query: `SELECT
      tc.table_name, kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
    JOIN information_schema.constraint_column_usage ccu
    WHERE tc.constraint_type = 'FOREIGN KEY'`,
    errorMessage: 'Missing foreign key relationships'
  },
  // ... more validation rules
];

const DATA_RULES: ValidationRule[] = [
  {
    name: 'sale_amounts',
    query: `SELECT id FROM sales WHERE amount != sale_volume * fuel_price`,
    errorMessage: 'Invalid sale amounts detected'
  },
  // ... more data validation rules
];

export async function validateSchema(pool: Pool) {
  const client = await pool.connect();
  try {
    // Check tables exist
    const { rows: tables } = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    `);
    
    const tableNames = tables.map(t => t.tablename);
    const missingTables = REQUIRED_TABLES.filter(t => !tableNames.includes(t));
    
    if (missingTables.length > 0) {
      throw new Error(`Missing tables: ${missingTables.join(', ')}`);
    }

    // Validate ENUMs
    const enumChecks = [
      "SELECT 'superadmin'::user_role",
      "SELECT 'owner'::station_user_role",
      "SELECT 'cash'::payment_method",
      "SELECT 'posted'::sale_status"
    ];

    for (const check of enumChecks) {
      try {
        await client.query(check);
      } catch (error) {
        throw new Error(`ENUM validation failed: ${check}`);
      }
    }

    // Schema validation rules
    for (const rule of SCHEMA_RULES) {
      const { rows } = await client.query(rule.query);
      if (rows.length === 0) {
        throw new Error(rule.errorMessage);
      }
    }

    // Data validation rules
    for (const rule of DATA_RULES) {
      const { rows } = await client.query(rule.query);
      if (rows.length > 0) {
        throw new Error(rule.errorMessage);
      }
    }

    return true;
  } finally {
    client.release();
  }
}
