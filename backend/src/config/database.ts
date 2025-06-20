import pool from '../../db/dbPool';

// Test connection and export pool
pool.connect()
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

export default pool;