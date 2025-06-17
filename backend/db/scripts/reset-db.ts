#!/usr/bin/env ts-node
import { execSync } from 'child_process';
import path from 'path';

console.log('🔄 Resetting database...');

try {
  // Drop and recreate database
  execSync('npx ts-node db/scripts/clean_db.ts', { stdio: 'inherit' });
  
  // Run migrations to reset schema
  execSync('npx ts-node db/scripts/migrate.ts', { stdio: 'inherit' });
  
  // Run seed script
  execSync('npx ts-node db/scripts/seed.ts', { stdio: 'inherit' });

  console.log('✅ Database reset and seeded successfully');
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
