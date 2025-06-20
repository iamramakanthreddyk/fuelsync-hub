// backend/db/seed.ts - Complete seed matching exact table structures
import pool from './dbPool';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

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
    console.log('🌱 Starting complete database seeding...');
    
    // === ADMIN_USERS TABLE ===
    // Required: id, email, password_hash, role, first_name, last_name
    // Optional: active (default true), created_at, updated_at
    console.log('👤 Creating admin user...');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO admin_users (id, email, password_hash, role, first_name, last_name)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = NOW()
    `, [uuidv4(), 'admin@fuelsync.com', adminPasswordHash, 'superadmin', 'Admin', 'User']);
    
    // === TENANTS TABLE ===
    // Required: id, name, email, subscription_plan, status, contact_person
    // Optional: contact_phone, address, city, state, zip, max_stations, max_users, active, created_at, updated_at
    console.log('🏢 Creating tenant...');
    const tenantId = uuidv4();
    await client.query(`
      INSERT INTO tenants (id, name, email, subscription_plan, status, contact_person)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        updated_at = NOW()
    `, [tenantId, 'Demo Company', 'demo@company.com', 'premium', 'active', 'Demo Owner']);
    
    // === USERS TABLE ===
    // Required: id, email, password_hash, role, first_name, last_name
    // Optional: tenant_id, phone, active, created_at, updated_at
    console.log('👥 Creating users...');
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
        INSERT INTO users (id, email, password_hash, role, first_name, last_name, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email, tenant_id) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          updated_at = NOW()
      `, [userId, user.email, passwordHash, user.role, user.firstName, user.lastName, tenantId]);
      
      userIds.push({ id: userId, ...user });
    }
    
    // === STATIONS TABLE ===
    // Required: id, tenant_id, name, address, city, state, zip, contact_phone
    // Optional: location, operating_hours, active, created_at, updated_at
    console.log('🏪 Creating station...');
    const stationId = uuidv4();
    await client.query(`
      INSERT INTO stations (id, tenant_id, name, address, city, state, zip, contact_phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (tenant_id, name) DO UPDATE SET
        address = EXCLUDED.address,
        updated_at = NOW()
    `, [stationId, tenantId, 'Main Station', '123 Main St', 'Anytown', 'ST', '12345', '555-1234']);
    
    // === PUMPS TABLE ===
    // Required: id, station_id, name, serial_number, installation_date
    // Optional: last_maintenance_date, next_maintenance_date, status, active, created_at, updated_at
    console.log('⛽ Creating pump...');
    const pumpId = uuidv4();
    await client.query(`
      INSERT INTO pumps (id, station_id, name, serial_number, installation_date)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (station_id, name) DO UPDATE SET
        serial_number = EXCLUDED.serial_number,
        updated_at = NOW()
    `, [pumpId, stationId, 'Pump 1', 'SN-001', '2024-01-01']);
    
    // === NOZZLES TABLE ===
    // Required: id, pump_id, fuel_type, initial_reading, current_reading
    // Optional: last_reading_date, status, active, created_at, updated_at
    console.log('🔧 Creating nozzles...');
    const fuelTypes = ['petrol', 'diesel'];
    const nozzleIds = [];
    
    for (const fuelType of fuelTypes) {
      const nozzleId = uuidv4();
      await client.query(`
        INSERT INTO nozzles (id, pump_id, fuel_type, initial_reading, current_reading)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [nozzleId, pumpId, fuelType, 0.0, 0.0]);
      nozzleIds.push(nozzleId);
    }
    
    // === USER_STATIONS TABLE ===
    // Required: id, user_id, station_id, role
    // Optional: active, created_at, updated_at
    console.log('🔄 Creating user-station assignments...');
    for (const user of userIds) {
      let stationRole = 'attendant';
      if (user.role === 'owner') stationRole = 'owner';
      if (user.role === 'manager') stationRole = 'manager';
      
      await client.query(`
        INSERT INTO user_stations (id, user_id, station_id, role)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, station_id) DO UPDATE SET
          role = EXCLUDED.role,
          updated_at = NOW()
      `, [uuidv4(), user.id, stationId, stationRole]);
    }
    
    // === FUEL_PRICE_HISTORY TABLE ===
    // Required: id, station_id, fuel_type, price_per_unit, effective_from, created_by
    // Optional: effective_to, notes, created_at, updated_at
    console.log('💰 Creating fuel prices...');
    const ownerUser = userIds.find(u => u.role === 'owner');
    
    for (const fuelType of fuelTypes) {
      await client.query(`
        INSERT INTO fuel_price_history (id, station_id, fuel_type, price_per_unit, effective_from, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [uuidv4(), stationId, fuelType, fuelType === 'petrol' ? 4.50 : 4.20, new Date(), ownerUser?.id]);
    }
    
    // === CREDITORS TABLE ===
    // Required: id, party_name, running_balance
    // Optional: contact_person, contact_phone, email, address, credit_limit, notes, created_at, updated_at, last_updated_at
    console.log('💳 Creating creditors...');
    await client.query(`
      INSERT INTO creditors (id, party_name, running_balance, contact_phone, email, credit_limit)
      VALUES 
        ($1, $2, $3, $4, $5, $6),
        ($7, $8, $9, $10, $11, $12)
      ON CONFLICT DO NOTHING
    `, [
      uuidv4(), 'ABC Transport', 0, '555-0001', 'abc@transport.com', 5000,
      uuidv4(), 'XYZ Logistics', 0, '555-0002', 'xyz@logistics.com', 3000
    ]);
    
    // === SALES TABLE ===
    // Required: id, station_id, nozzle_id, user_id, recorded_at, sale_volume, cumulative_reading, previous_reading, fuel_price, payment_method
    // Optional: amount, status, notes, created_at, updated_at
    console.log('💰 Creating sample sales...');
    const employeeUser = userIds.find(u => u.role === 'employee');
    if (employeeUser && nozzleIds.length > 0) {
      await client.query(`
        INSERT INTO sales (id, station_id, nozzle_id, user_id, recorded_at, sale_volume, cumulative_reading, previous_reading, fuel_price, payment_method)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10),
          ($11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        ON CONFLICT DO NOTHING
      `, [
        uuidv4(), stationId, nozzleIds[0], employeeUser.id, new Date(), 25.5, 25.5, 0.0, 4.50, 'cash',
        uuidv4(), stationId, nozzleIds[0], employeeUser.id, new Date(), 40.0, 65.5, 25.5, 4.50, 'card'
      ]);
    }
    
    // Verify data
    const tenantCount = await client.query('SELECT COUNT(*) FROM tenants WHERE active = true');
    const userCount = await client.query('SELECT COUNT(*) FROM users WHERE active = true');
    const stationCount = await client.query('SELECT COUNT(*) FROM stations WHERE active = true');
    const pumpCount = await client.query('SELECT COUNT(*) FROM pumps WHERE active = true');
    const nozzleCount = await client.query('SELECT COUNT(*) FROM nozzles WHERE active = true');
    const salesCount = await client.query('SELECT COUNT(*) FROM sales');
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Created Data:');
    console.log(`   Tenants: ${tenantCount.rows[0].count}`);
    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log(`   Stations: ${stationCount.rows[0].count}`);
    console.log(`   Pumps: ${pumpCount.rows[0].count}`);
    console.log(`   Nozzles: ${nozzleCount.rows[0].count}`);
    console.log(`   Sales: ${salesCount.rows[0].count}`);
    
    console.log('\n🔐 Login Credentials:');
    console.log('   Admin: admin@fuelsync.com / admin123 → http://localhost:3000/admin/login');
    console.log('   Owner: owner@demofuel.com / password123 → http://localhost:3000/login');
    console.log('   Manager: manager@demofuel.com / password123 → http://localhost:3000/login');
    console.log('   Employee: employee@demofuel.com / password123 → http://localhost:3000/login');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase().catch(console.error);