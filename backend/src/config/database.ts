// src/config/database.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'fuelsync-server.postgres.database.azure.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'fueladmin',
  password: process.env.DB_PASSWORD || 'Th1nkpad!2304',
  database: process.env.DB_NAME || 'fuelsync_db',
  ssl: {
    rejectUnauthorized: false
  }
});

// Test the connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

export default pool;