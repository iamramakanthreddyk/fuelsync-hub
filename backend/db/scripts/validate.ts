import { Pool } from 'pg';
import dotenv from 'dotenv';

interface ValidationRule {
  query: string;
  message: string;
}

const VALIDATION_RULES: ValidationRule[] = [
  {
    query: `
      SELECT s.id, COUNT(u.id) as owner_count
      FROM stations s
      LEFT JOIN user_stations u ON s.id = u.station_id AND u.role = 'owner'
      GROUP BY s.id
      HAVING COUNT(u.id) = 0
    `,
    message: 'Stations must have at least one owner'
  },
  // Add more validation rules...
];

async function validateData(pool: Pool) {
  const client = await pool.connect();
  try {
    for (const rule of VALIDATION_RULES) {
      const { rows } = await client.query(rule.query);
      if (rows.length > 0) {
        throw new Error(`Validation failed: ${rule.message}`);
      }
    }
    console.log('✅ All validations passed');
  } finally {
    client.release();
  }
}
