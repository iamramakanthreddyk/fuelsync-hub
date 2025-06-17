#!/usr/bin/env ts-node
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'fuelsync_db1';
console.log('🧹 Cleaning database...');

async function cleanDatabase() {  // Connect to postgres database to be able to drop/create our app database
  const pgPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // Connect to default postgres database
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  });

  try {
    // Terminate all connections to our database
    await pgPool.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = '${DB_NAME}'
      AND pid <> pg_backend_pid();
    `);

    // Drop database if exists and create fresh
    await pgPool.query(`DROP DATABASE IF EXISTS ${DB_NAME};`);
    await pgPool.query(`CREATE DATABASE ${DB_NAME};`);

    console.log('✅ Database cleaned successfully');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pgPool.end();
  }
}

cleanDatabase();
