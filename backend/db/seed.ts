// backend/db/seed.ts - Improved seeding with conflict handling
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import pool from './dbPool';

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}
async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting trigger-compliant database seeding...');
    
    // Use a single transaction to satisfy all constraints at commit time
    await client.query('BEGIN');
    
    // Step 1: Create admin user
    console.log('👤 Creating admin user...');
    const adminId = uuidv4();
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO admin_users (id, email, password_hash, role, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = $3,
        first_name = $5,
        last_name = $6,
        updated_at = NOW()
    `, [adminId, 'admin@fuelsync.com', adminPasswordHash, 'superadmin', 'Admin', 'User']);
    
    // Step 2: Create tenant
    console.log('🏢 Creating tenant...');
    const tenantId = uuidv4();
    await client.query(`
      INSERT INTO tenants (id, name, email, subscription_plan, active, contact_person)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        name = $2,
        subscription_plan = $4,
        active = $5,
        contact_person = $6,
        updated_at = NOW()
    `, [tenantId, 'Demo Company', 'demo@company.com', 'premium', true, 'Demo Owner']);
    
    // Get actual tenant ID
    const tenantResult = await client.query(`SELECT id FROM tenants WHERE email = $1`, ['demo@company.com']);
    const actualTenantId = tenantResult.rows[0].id;
    
    // Step 3: Create users (before station to satisfy potential user requirements)
    console.log('👥 Creating users...');
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
        ON CONFLICT (email, tenant_id) DO UPDATE SET
          password_hash = $4,
          role = $5,
          first_name = $6,
          last_name = $7,
          active = $8,
          updated_at = NOW()
      `, [userId, actualTenantId, user.email, passwordHash, user.role, user.firstName, user.lastName, true]);
      
      // Get actual user ID
      const userResult = await client.query(`SELECT id FROM users WHERE email = $1 AND tenant_id = $2`, [user.email, actualTenantId]);
      userIds.push({ id: userResult.rows[0].id, ...user });
    }
    
    // Step 4: Create complete station hierarchy (station + pump + nozzles) to satisfy triggers
    console.log('🏪 Creating complete station hierarchy...');
    const stationId = uuidv4();
    const pumpId = uuidv4();
    
    // Create station
    await client.query(`
      INSERT INTO stations (id, tenant_id, name, address, city, state, zip, contact_phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (tenant_id, name) DO UPDATE SET
        address = $4,
        city = $5,
        state = $6,
        zip = $7,
        contact_phone = $8,
        updated_at = NOW()
    `, [stationId, actualTenantId, 'Main Station', '123 Main St', 'Anytown', 'ST', '12345', '555-1234']);
    
    // Get actual station ID
    const stationResult = await client.query(`SELECT id FROM stations WHERE tenant_id = $1 AND name = $2`, [actualTenantId, 'Main Station']);
    const actualStationId = stationResult.rows[0].id;
    
    // Create pump immediately after station
    console.log('⛽ Creating pump...');
    await client.query(`
      INSERT INTO pumps (id, station_id, name, serial_number)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (station_id, name) DO UPDATE SET
        serial_number = $4,
        updated_at = NOW()
    `, [pumpId, actualStationId, 'Pump 1', 'SN-001']);
    
    // Get actual pump ID
    const pumpResult = await client.query(`SELECT id FROM pumps WHERE station_id = $1 AND name = $2`, [actualStationId, 'Pump 1']);
    const actualPumpId = pumpResult.rows[0].id;
    
    // Create nozzles immediately after pump
    console.log('🔧 Creating nozzles...');
    const fuelTypes = ['petrol', 'diesel'];
    
    for (const fuelType of fuelTypes) {
      const nozzleId = uuidv4();
      await client.query(`
        INSERT INTO nozzles (id, pump_id, fuel_type)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [nozzleId, actualPumpId, fuelType]);
    }
    
    // Step 5: Create fuel prices (may reference users as created_by)
    console.log('💰 Creating fuel prices...');
    const ownerUser = userIds.find(u => u.role === 'owner');
    
    for (const fuelType of fuelTypes) {
      await client.query(`
        INSERT INTO fuel_price_history (station_id, fuel_type, price_per_unit, created_by)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `, [actualStationId, fuelType, fuelType === 'petrol' ? 4.50 : 4.20, ownerUser?.id]);
    }
    
    // Step 6: Create user-station assignments
    console.log('🔄 Creating user-station assignments...');
    for (const user of userIds) {
      let stationRole = 'attendant';
      if (user.role === 'owner') stationRole = 'owner';
      if (user.role === 'manager') stationRole = 'manager';
      
      await client.query(`
        INSERT INTO user_stations (id, user_id, station_id, role, active)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, station_id) DO UPDATE SET
          role = $4,
          active = $5,
          updated_at = NOW()
      `, [uuidv4(), user.id, actualStationId, stationRole, true]);
    }
    
    // Step 7: Create tenant schema and tables
    console.log('🗄️ Creating tenant schema...');
    const schemaName = `tenant_${actualTenantId.replace(/-/g, '_')}`;
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
    
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
    
    // Step 8: Copy data to tenant schema
    console.log('📋 Copying data to tenant schema...');
    await client.query(`
      INSERT INTO ${schemaName}.stations (id, tenant_id, name, address, city, state, zip, contact_phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        name = $3,
        address = $4,
        city = $5,
        state = $6,
        zip = $7,
        contact_phone = $8,
        updated_at = NOW()
    `, [actualStationId, actualTenantId, 'Main Station', '123 Main St', 'Anytown', 'ST', '12345', '555-1234']);
    
    for (const user of userIds) {
      let stationRole = 'attendant';
      if (user.role === 'owner') stationRole = 'owner';
      if (user.role === 'manager') stationRole = 'manager';
      
      await client.query(`
        INSERT INTO ${schemaName}.user_stations (id, user_id, station_id, role, active)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, station_id) DO UPDATE SET
          role = $4,
          active = $5,
          updated_at = NOW()
      `, [uuidv4(), user.id, actualStationId, stationRole, true]);
    }
    
    // Commit the entire transaction - all constraints checked here
    await client.query('COMMIT');
    console.log('🎉 Database seeding completed successfully!');
    
    // Summary
    console.log('');
    console.log('📊 Seeded Data Summary:');
    console.log(`   ✅ Admin: admin@fuelsync.com / admin123`);
    console.log(`   ✅ Tenant: Demo Company`);
    console.log(`   ✅ Users: ${users.length} (owner, manager, employee)`);
    console.log(`   ✅ Station: Main Station with Pump 1`);
    console.log(`   ✅ Nozzles: ${fuelTypes.length} (petrol, diesel)`);
    console.log(`   ✅ Fuel Prices: Set for both fuel types`);
    console.log(`   ✅ User Assignments: All users assigned to station`);
    console.log(`   ✅ Tenant Schema: Created and populated`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase().catch(console.error);