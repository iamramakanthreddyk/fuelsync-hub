#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import pool from '../dbPool';

console.log('🧹 Cleaning database...');

async function cleanDatabase() {
  const sql = fs.readFileSync(path.join(__dirname, 'reset_schema.sql'), 'utf-8');
  try {
    await pool.query(sql);
    console.log('✅ Database cleaned successfully');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

cleanDatabase();
