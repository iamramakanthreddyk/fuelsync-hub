// backend/db/seed.ts - Proper seeding with correct permissions
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

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
      INSERT INTO tenants (id, name, email, subscription_plan, active, contact_person)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, [tenantId, 'Demo Company', 'demo@company.com', 'premium', true, 'Demo Owner']);
    
    console.log('✅ Demo tenant created');
    
    // 3. Create tenant users
    const users = [
      { email: 'owner@demofuel.com', role: 'owner', firstName: 'John', lastName: 'Owner' },
      { email: 'manager@demofuel.com', role: 'manager', firstName: 'Jane', lastName: 'Manager' },
      { email: 'employee@demofuel.com', role: 'employee', firstName: 'Bob', lastName: 'Employee' }
    ];
    
    const passwordHash = await bcrypt.hash('password123', 10);
    const userIds = [];
    
    for (const user of users) {
      const userId = uuidv4();
      await client.query(`
        INSERT INTO users (id, tenant_id, email, password_hash, role, first_name, last_name, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email, tenant_id) DO NOTHING
      `, [userId, tenantId, user.email, passwordHash, user.role, user.firstName, user.lastName, true]);
      
      userIds.push({ id: userId, ...user });
    }
    
    console.log('✅ Tenant users created');
    
    // 4. Create stations in PUBLIC schema
    const stationId = uuidv4();
    await client.query(`
      INSERT INTO stations (id, tenant_id, name, address, city, state, zip, contact_phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT DO NOTHING
    `, [stationId, tenantId, 'Main Station', '123 Main St', 'Anytown', 'ST', '12345', '555-1234']);
    
    // 5. Create pumps in PUBLIC schema
    const pumpId = uuidv4();
    await client.query(`
      INSERT INTO pumps (id, station_id, name, serial_number)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
    `, [pumpId, stationId, 'Pump 1', 'SN-001']);
    
    // 6. Create nozzles in PUBLIC schema
    const fuelTypes = ['petrol', 'diesel'];
    const nozzleIds = [];
    
    for (const fuelType of fuelTypes) {
      const nozzleId = uuidv4();
      await client.query(`
        INSERT INTO nozzles (id, pump_id, fuel_type)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [nozzleId, pumpId, fuelType]);
      
      nozzleIds.push(nozzleId);
      
      // Add fuel prices in PUBLIC schema
      await client.query(`
        INSERT INTO fuel_price_history (station_id, fuel_type, price_per_unit)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [stationId, fuelType, fuelType === 'petrol' ? 4.50 : 4.20]);
    }
    
    console.log('✅ Station, pump, and nozzles created in public schema');
    
    // 7. Create user-station assignments in PUBLIC schema
    for (const user of userIds) {
      let stationRole = 'attendant';
      if (user.role === 'owner') stationRole = 'owner';
      if (user.role === 'manager') stationRole = 'manager';
      
      await client.query(`
        INSERT INTO user_stations (id, user_id, station_id, role, active)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, station_id) DO UPDATE
        SET role = $4, active = $5, updated_at = NOW()
      `, [uuidv4(), user.id, stationId, stationRole, true]);
      
      console.log(`✅ Assigned user ${user.email} to station as ${stationRole}`);
    }
    
    // 8. Create tenant schema and replicate data
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    
    // Create tables in tenant schema
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS ${schemaName}.stations (
        id UUID PRIMARY KEY,
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
        id UUID PRIMARY KEY,
        station_id UUID NOT NULL,
        name VARCHAR(100) NOT NULL,
        serial_number VARCHAR(100),
        installation_date DATE DEFAULT CURRENT_DATE,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS ${schemaName}.nozzles (
        id UUID PRIMARY KEY,
        pump_id UUID NOT NULL,
        fuel_type VARCHAR(50) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS ${schemaName}.user_stations (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        station_id UUID NOT NULL,
        role VARCHAR(50) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, station_id)
      );
      
      CREATE TABLE IF NOT EXISTS ${schemaName}.fuel_price_history (
        id UUID PRIMARY KEY,
        station_id UUID NOT NULL,
        fuel_type VARCHAR(50) NOT NULL,
        price_per_unit DECIMAL(10,2) NOT NULL,
        effective_from TIMESTAMP DEFAULT NOW(),
        effective_to TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    await client.query(createTablesSQL);
    
    // Copy data to tenant schema
    await client.query(`
      INSERT INTO ${schemaName}.stations (id, tenant_id, name, address, city, state, zip, contact_phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING
    `, [stationId, tenantId, 'Main Station', '123 Main St', 'Anytown', 'ST', '12345', '555-1234']);
    
    await client.query(`
      INSERT INTO ${schemaName}.pumps (id, station_id, name, serial_number)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
    `, [pumpId, stationId, 'Pump 1', 'SN-001']);
    
    for (let i = 0; i < nozzleIds.length; i++) {
      const fuelType = fuelTypes[i];
      await client.query(`
        INSERT INTO ${schemaName}.nozzles (id, pump_id, fuel_type)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO NOTHING
      `, [nozzleIds[i], pumpId, fuelType]);
      
      await client.query(`
        INSERT INTO ${schemaName}.fuel_price_history (station_id, fuel_type, price_per_unit)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [stationId, fuelType, fuelType === 'petrol' ? 4.50 : 4.20]);
    }
    
    // Copy user-station assignments to tenant schema
    for (const user of userIds) {
      let stationRole = 'attendant';
      if (user.role === 'owner') stationRole = 'owner';
      if (user.role === 'manager') stationRole = 'manager';
      
      await client.query(`
        INSERT INTO ${schemaName}.user_stations (id, user_id, station_id, role, active)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, station_id) DO UPDATE
        SET role = $4, active = $5, updated_at = NOW()
      `, [uuidv4(), user.id, stationId, stationRole, true]);
    }
    
    console.log('✅ Tenant schema created and data replicated');
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