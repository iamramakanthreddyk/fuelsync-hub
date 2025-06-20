// backend/db/seed.ts - Fixed TypeScript seed
import { Pool } from 'pg';
import { generateDemoSales } from './scripts/seed';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

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

    // Disable trigger to allow tenant creation without owner
    await client.query('ALTER TABLE tenants DISABLE TRIGGER check_tenant_owner_trigger');
    console.log('🚧 Disabled check_tenant_owner_trigger');
    
    // 1. Create admin user
    const adminId = uuidv4();
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO admin_users (id, email, password_hash, role, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, [adminId, 'admin@fuelsync.com', adminPasswordHash, 'superadmin', 'Admin', 'User']);
    
    console.log(`✅ Admin user created with ID: ${adminId}`);
    
    // 2. Create demo tenant
    const tenantId = uuidv4();
    await client.query(`
      INSERT INTO tenants (id, name, email, subscription_plan, active, contact_person)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, [tenantId, 'Demo Company', 'demo@company.com', 'premium', true, 'Demo Owner']);
    
    console.log(`✅ Demo tenant created with ID: ${tenantId}`);
    
    // 3. Create tenant users
    const users = [
      { email: 'owner@demofuel.com', role: 'owner', firstName: 'John', lastName: 'Owner' },
      { email: 'manager@demofuel.com', role: 'manager', firstName: 'Jane', lastName: 'Manager' },
      { email: 'employee@demofuel.com', role: 'employee', firstName: 'Bob', lastName: 'Employee' }
    ];
    
    const passwordHash = await bcrypt.hash('password123', 10);
    const userIds: User[] = [];
    
    for (const user of users) {
      const userId = uuidv4();
      await client.query(`
        INSERT INTO users (id, tenant_id, email, password_hash, role, first_name, last_name, active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (email, tenant_id) DO NOTHING
      `, [userId, tenantId, user.email, passwordHash, user.role, user.firstName, user.lastName, true]);

      console.log(`  ↳ Created user ${user.email} (${user.role}) with ID: ${userId}`);

      userIds.push({ id: userId, ...user });
    }

    console.log(`✅ ${userIds.length} tenant users created for tenant ${tenantId}`);

    // Re-enable trigger after users are inserted
    await client.query('ALTER TABLE tenants ENABLE TRIGGER check_tenant_owner_trigger');
    console.log('✅ Re-enabled check_tenant_owner_trigger');
    
    // 4. Create stations
    const stationId = uuidv4();
    await client.query(`
      INSERT INTO stations (id, tenant_id, name, address, city, state, zip, contact_phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [stationId, tenantId, 'Main Station', '123 Main St', 'Anytown', 'ST', '12345', '555-1234']);

    console.log(`✅ Station created with ID: ${stationId} for tenant ${tenantId}`);
    
    // 5. Create pump
    const pumpId = uuidv4();
    await client.query(`
      INSERT INTO pumps (id, station_id, name, serial_number)
      VALUES ($1, $2, $3, $4)
    `, [pumpId, stationId, 'Pump 1', 'SN-001']);

    console.log(`✅ Pump created with ID: ${pumpId} for station ${stationId}`);
    
    // 6. Create nozzles
    const fuelTypes = ['petrol', 'diesel'];
    for (const fuelType of fuelTypes) {
      const nozzleId = uuidv4();
      await client.query(`
        INSERT INTO nozzles (id, pump_id, fuel_type)
        VALUES ($1, $2, $3)
      `, [nozzleId, pumpId, fuelType]);

      console.log(`  ↳ Nozzle ${nozzleId} (${fuelType}) added to pump ${pumpId}`);

      // Add fuel prices
      await client.query(`
        INSERT INTO fuel_price_history (station_id, fuel_type, price_per_unit)
        VALUES ($1, $2, $3)
      `, [stationId, fuelType, fuelType === 'petrol' ? 4.50 : 4.20]);
    }

    console.log('✅ Station, pump, and nozzles created');
    
    // 7. Create user-station assignments
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
      
      console.log(`✅ Assigned user ${user.email} (${user.id}) to station ${stationId} as ${stationRole}`);
    }
    
    // 8. Create tenant schema
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    console.log(`✅ Created schema ${schemaName}`);
    
    await client.query(`
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
    `);
    
    // Copy data to tenant schema
    await client.query(`
      INSERT INTO ${schemaName}.stations (id, tenant_id, name, address, city, state, zip, contact_phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING
    `, [stationId, tenantId, 'Main Station', '123 Main St', 'Anytown', 'ST', '12345', '555-1234']);
    
    for (const user of userIds) {
      let stationRole = 'attendant';
      if (user.role === 'owner') stationRole = 'owner';
      if (user.role === 'manager') stationRole = 'manager';
      
      await client.query(`
        INSERT INTO ${schemaName}.user_stations (id, user_id, station_id, role, active)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, station_id) DO NOTHING
      `, [uuidv4(), user.id, stationId, stationRole, true]);
    }

    // Generate 30 days of demo sales using shared logic
    await generateDemoSales(client, [{ id: stationId }], userIds.map(u => u.id));

    console.log(`✅ Tenant schema ${schemaName} populated with initial data`);
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