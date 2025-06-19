// backend/src/db/pool.ts
  // for azure postgres, use the following code snippet:
// import dotenv from 'dotenv';
// import path from 'path';
// import { Pool } from 'pg';

// dotenv.config({ path: path.resolve(__dirname, '../.env') });
// const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: parseInt(process.env.DB_PORT || '5432'),
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

// export default pool;

import { Pool } from 'pg';

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432', 10),
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME     || 'test_fuelsync',
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

export default pool;
