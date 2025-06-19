import { execSync } from 'child_process';
import path, { join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const DB_URL = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

try {
  // Apply the complete schema
  console.log('Applying complete schema...');
  execSync(`psql ${DB_URL} -f ${join(__dirname, '../schema/complete_schema.sql')}`, { stdio: 'inherit' });
  
  // Apply all migrations in order
  console.log('Applying migrations...');
  execSync(`psql ${DB_URL} -f ${join(__dirname, '../migrations/000_schema.sql')}`, { stdio: 'inherit' });
  execSync(`psql ${DB_URL} -f ${join(__dirname, '../migrations/001_add_tenant_relations.sql')}`, { stdio: 'inherit' });
  
  console.log('Schema update completed successfully');
} catch (error) {
  console.error('Error updating schema:', error);
  process.exit(1);
}
