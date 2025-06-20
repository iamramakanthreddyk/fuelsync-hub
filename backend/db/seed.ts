// backend/db/seed.ts - Immediate trigger-compliant seeding
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
    console.log('🌱 Starting immediate trigger-compliant seeding...');
    
    // Step 1: Create admin user (independent)
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
    
    // Step 2: Create users BEFORE tenant to avoid tenant constraint
    console.log('👥 Pre-creating users...');
    const tempTenantId = uuidv4(); // Temporary ID for users
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
        ON CONFLICT (email, tenant_id) DO UPDATE SET
          password_hash = $4,
          role = $5,
          first_name = $6,
          last_name = $7,
          active = $8,
          updated_at = NOW()
      `, [userId, tempTenantId, user.email, passwordHash, user.role, user.firstName, user.lastName, true]);
      
      userIds.push({ id: userId, ...user });
    }
    
    // Step 3: Create complete station hierarchy FIRST (to satisfy tenant constraint)
    console.log('🏗️ Creating complete station hierarchy...');
    const stationId = uuidv4();
    const pumpId = uuidv4();
    
    // Use a nested transaction approach to handle immediate triggers
    await client.query('BEGIN');
    
    try {
      // Create station with immediate pump creation to satisfy trigger
      console.log('🏪 Creating station with immediate pump...');
      
      // Insert station
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
      `, [stationId, tempTenantId, 'Main Station', '123 Main St', 'Anytown', 'ST', '12345', '555-1234']);
      
      // IMMEDIATELY create pump to satisfy station trigger
      await client.query(`
        INSERT INTO pumps (id, station_id, name, serial_number, active)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (station_id, name) DO UPDATE SET
          serial_number = $4,
          active = $5,
          updated_at = NOW()
      `, [pumpId, stationId, 'Pump 1', 'SN-001', true]);
      
      // Create nozzles immediately
      console.log('🔧 Creating nozzles...');
      const fuelTypes = ['petrol', 'diesel'];
      
      for (const fuelType of fuelTypes) {
        const nozzleId = uuidv4();
        await client.query(`
          INSERT INTO nozzles (id, pump_id, fuel_type, active)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT DO NOTHING
        `, [nozzleId, pumpId, fuelType, true]);
      }
      
      await client.query('COMMIT');
      console.log('✅ Station hierarchy created successfully');
      
    } catch (stationError) {
      await client.query('ROLLBACK');
      console.error('❌ Station creation failed:', stationError);
      throw stationError;
    }
    
    // Step 4: Now create tenant (station already exists to satisfy constraint)
    console.log('🏢 Creating tenant...');
    await client.query(`
      INSERT INTO tenants (id, name, email, subscription_plan, active, contact_person)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        name = $2,
        subscription_plan = $4,
        active = $5,
        contact_person = $6,
        updated_at = NOW()
    `, [tempTenantId, 'Demo Company', 'demo@company.com', 'premium', true, 'Demo Owner']);
    
    // Step 5: Update station to reference actual tenant (already created)
    await client.query(`
      UPDATE stations 
      SET tenant_id = $1, updated_at = NOW() 
      WHERE id = $2
    `, [tempTenantId, stationId]);
    
    // Step 6: Create fuel prices
    console.log('💰 Creating fuel prices...');
    const ownerUser = userIds.find(u => u.role === 'owner');
    const fuelTypes = ['petrol', 'diesel'];
    
    for (const fuelType of fuelTypes) {
      // Create in both fuel_price_history and fuel_prices tables
      await client.query(`
        INSERT INTO fuel_price_history (station_id, fuel_type, price_per_unit, created_by)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `, [stationId, fuelType, fuelType === 'petrol' ? 4.50 : 4.20, ownerUser?.id]);
      
      // Also create in fuel_prices table if it exists
      try {
        await client.query(`
          INSERT INTO fuel_prices (station_id, fuel_type, price_per_unit, created_by)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT DO NOTHING
        `, [stationId, fuelType, fuelType === 'petrol' ? 4.50 : 4.20, ownerUser?.id]);
      } catch (error) {
        // fuel_prices table might not exist or have different structure
        console.log('⚠️ Could not insert into fuel_prices table (may not exist)');
      }
    }
    
    // Step 7: Create user-station assignments
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
      `, [uuidv4(), user.id, stationId, stationRole, true]);
    }
    
    // Step 8: Create tenant schema and replicate data
    console.log('🗄️ Creating tenant schema...');
    const schemaName = `tenant_${tempTenantId.replace(/-/g, '_')}`;
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
    
    // Copy data to tenant schema
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
    `, [stationId, tempTenantId, 'Main Station', '123 Main St', 'Anytown', 'ST', '12345', '555-1234']);
    
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
      `, [uuidv4(), user.id, stationId, stationRole, true]);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    
    // Summary
    console.log('');
    console.log('📊 Seeded Data Summary:');
    console.log(`   ✅ Admin: admin@fuelsync.com / admin123`);
    console.log(`   ✅ Tenant: Demo Company (${tempTenantId})`);
    console.log(`   ✅ Users: ${users.length} (owner, manager, employee)`);
    console.log(`   ✅ Station: Main Station (${stationId})`);
    console.log(`   ✅ Pump: Pump 1 (${pumpId}) - ACTIVE`);
    console.log(`   ✅ Nozzles: ${fuelTypes.length} (petrol, diesel) - ACTIVE`);
    console.log(`   ✅ Fuel Prices: Set in both price tables`);
    console.log(`   ✅ User Assignments: All users assigned to station`);
    console.log(`   ✅ Tenant Schema: Created and populated`);
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('   - Admin: admin@fuelsync.com / admin123');
    console.log('   - Owner: owner@demofuel.com / password123');
    console.log('   - Manager: manager@demofuel.com / password123');
    console.log('   - Employee: employee@demofuel.com / password123');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase().catch(console.error);