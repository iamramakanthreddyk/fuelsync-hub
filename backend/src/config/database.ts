import { Pool } from 'pg';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('Database connection parameters-->:');
console.log(`Host: ${process.env.DB_HOST}`);
console.log(`Port: ${process.env.DB_PORT}`);
console.log(`Database: ${process.env.DB_NAME}`);
console.log(`User: ${process.env.DB_USER}`);
console.log(`SSL: ${process.env.DB_SSL}`);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }
});

// Test connection and export pool
pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

export default pool;