// backend/db/seed.ts - Consolidated seeding script
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...');
    
    // 1. Create admin user
    const adminId = uuidv4();
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO admin_users (id, email, password_hash, role, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, [adminId, 'admin@fuelsync.com', adminPasswordHash, 'superadmin', 'Admin', 'User']);
    
    console.log('✅ Admin user created');
    
    // 2. Create demo tenant
    const tenantId = uuidv4();
    await client.query(`
      INSERT INTO tenants (id, name, email, subscription_plan, active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, [tenantId, 'Demo Company', 'demo@company.com', 'premium', true]);
    
    console.log('✅ Demo tenant created');
    
    // 3. Create tenant users
    const users = [
      { email: 'owner@demofuel.com', role: 'owner', firstName: 'John', lastName: 'Owner' },
      { email: 'manager@demofuel.com', role: 'manager', firstName: 'Jane', lastName: 'Manager' },
      { email: 'employee@demofuel.com', role: 'employee', firstName: 'Bob', lastName: 'Employee' }
    ];
    
    const passwordHash = await bcrypt.hash('password123', 10);
    
    for (const user of users) {
      const userId = uuidv4();
      await client.query(`
        INSERT INTO users (id, tenant_id, email, password_hash, role, first_name, last_name, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email) DO NOTHING
      `, [userId, tenantId, user.email, passwordHash, user.role, user.firstName, user.lastName, true]);
    }
    
    console.log('✅ Tenant users created');
    
    // 4. Create tenant schema
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    
    // 5. Create tables in tenant schema
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS ${schemaName}.stations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(50),
        zip VARCHAR(20),
        contact_phone VARCHAR(20),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS ${schemaName}.pumps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        station_id UUID NOT NULL REFERENCES ${schemaName}.stations(id),
        name VARCHAR(100) NOT NULL,
        serial_number VARCHAR(100),
        installation_date DATE DEFAULT CURRENT_DATE,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS ${schemaName}.nozzles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pump_id UUID NOT NULL REFERENCES ${schemaName}.pumps(id),
        fuel_type VARCHAR(50) NOT NULL,
        color VARCHAR(50),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS ${schemaName}.user_stations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        station_id UUID NOT NULL REFERENCES ${schemaName}.stations(id),
        role VARCHAR(50) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, station_id)
      );
      
      CREATE TABLE IF NOT EXISTS ${schemaName}.sales (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nozzle_id UUID NOT NULL REFERENCES ${schemaName}.nozzles(id),
        user_id UUID NOT NULL,
        sale_volume DECIMAL(10,3) NOT NULL,
        fuel_price DECIMAL(10,2) NOT NULL,
        amount DECIMAL(10,2) GENERATED ALWAYS AS (sale_volume * fuel_price) STORED,
        payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi', 'credit')),
        status VARCHAR(20) DEFAULT 'posted' CHECK (status IN ('posted', 'voided', 'pending')),
        recorded_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS ${schemaName}.fuel_price_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        station_id UUID NOT NULL REFERENCES ${schemaName}.stations(id),
        fuel_type VARCHAR(50) NOT NULL,
        price_per_unit DECIMAL(10,2) NOT NULL,
        effective_from TIMESTAMP DEFAULT NOW(),
        effective_to TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS ${schemaName}.creditors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        party_name VARCHAR(255) NOT NULL,
        contact_phone VARCHAR(20),
        email VARCHAR(255),
        credit_limit DECIMAL(12,2) DEFAULT 0,
        running_balance DECIMAL(12,2) DEFAULT 0,
        last_updated_at TIMESTAMP DEFAULT NOW(),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await client.query(createTablesSQL);
    console.log('✅ Tenant schema and tables created');
    
    // 6. Create sample station
    const stationId = uuidv4();
    await client.query(`
      INSERT INTO ${schemaName}.stations (id, tenant_id, name, address, city, state, zip, contact_phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [stationId, tenantId, 'Main Station', '123 Main St', 'Anytown', 'ST', '12345', '555-1234']);
    
    // 7. Create pump and nozzles
    const pumpId = uuidv4();
    await client.query(`
      INSERT INTO ${schemaName}.pumps (id, station_id, name, serial_number)
      VALUES ($1, $2, $3, $4)
    `, [pumpId, stationId, 'Pump 1', 'SN-001']);
    
    const fuelTypes = ['Petrol', 'Diesel'];
    for (const fuelType of fuelTypes) {
      const nozzleId = uuidv4();
      await client.query(`
        INSERT INTO ${schemaName}.nozzles (id, pump_id, fuel_type, color)
        VALUES ($1, $2, $3, $4)
      `, [nozzleId, pumpId, fuelType, fuelType === 'Petrol' ? 'Green' : 'Black']);
      
      // Add fuel prices
      await client.query(`
        INSERT INTO ${schemaName}.fuel_price_history (station_id, fuel_type, price_per_unit)
        VALUES ($1, $2, $3)
      `, [stationId, fuelType, fuelType === 'Petrol' ? 4.50 : 4.20]);
    }
    
    console.log('✅ Sample station, pump, and nozzles created');
    
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase().catch(console.error);